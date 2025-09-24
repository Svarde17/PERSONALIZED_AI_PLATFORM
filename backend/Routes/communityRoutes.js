const express = require("express");
const multer = require("multer");
const { Community, Post } = require("../models/community");
const admin = require("firebase-admin");

const router = express.Router();

// Configure multer for image uploads only
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get communities by city
router.get("/city/:city", async (req, res) => {
  try {
    const communities = await Community.findByCity(req.params.city);
    
    // Add member counts to each community
    const communitiesWithCounts = await Promise.all(
      communities.map(async (community) => {
        const memberCount = await Community.getMemberCount(community.id);
        return { ...community, memberCount };
      })
    );
    
    res.json(communitiesWithCounts || []);
  } catch (err) {
    console.error("Error fetching communities:", err);
    res.status(500).json({ error: "Failed to fetch communities", communities: [] });
  }
});

// Auto-join farmer to communities
router.post("/auto-join", async (req, res) => {
  try {
    const { farmerId, city } = req.body;
    await Community.autoJoinCommunity(farmerId, city);
    res.json({ message: "Auto-joined communities successfully" });
  } catch (err) {
    console.error("Error auto-joining communities:", err);
    res.status(500).json({ error: "Failed to auto-join communities" });
  }
});

// Create new community
router.post("/create", async (req, res) => {
  try {
    const community = new Community(req.body);
    await community.save();
    res.status(201).json({ message: "Community created successfully", community });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Join community
router.post("/:id/join", async (req, res) => {
  try {
    const { farmerId } = req.body;
    await Community.joinCommunity(req.params.id, farmerId);
    res.json({ message: "Joined community successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get community posts
router.get("/:id/posts", async (req, res) => {
  try {
    console.log('Fetching posts for community:', req.params.id);
    
    // Simple query without orderBy to avoid index issues
    const db = admin.firestore();
    const snapshot = await db.collection('posts')
      .where('communityId', '==', req.params.id)
      .limit(20)
      .get();
    
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Found posts:', posts.length);
    
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message, posts: [] });
  }
});

// Get all India posts
router.get("/feed/all", async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('posts')
      .limit(50)
      .get();
    
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json([]);
  }
});

// Get state-wise posts
router.get("/feed/state/:state", async (req, res) => {
  try {
    const posts = await Post.findByState(req.params.state);
    res.json(posts || []);
  } catch (err) {
    console.error("Error fetching state posts:", err);
    res.status(500).json([]);
  }
});

// Get trending posts from user's area
router.get("/feed/trending/:city", async (req, res) => {
  try {
    const db = admin.firestore();
    const city = req.params.city;
    
    // Get communities from user's city
    const communitiesSnapshot = await db.collection('communities')
      .where('city', '==', city)
      .get();
    
    const communityIds = communitiesSnapshot.docs.map(doc => doc.id);
    
    if (communityIds.length === 0) {
      return res.json([]);
    }
    
    // Get posts from these communities
    const postsSnapshot = await db.collection('posts')
      .where('communityId', 'in', communityIds)
      .limit(100)
      .get();
    
    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate trending score: likes + replies count
    const trendingPosts = posts
      .map(post => ({
        ...post,
        trendingScore: (post.likes?.length || 0) + (post.replies?.length || 0)
      }))
      .filter(post => post.trendingScore > 0)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20);
    
    res.json(trendingPosts);
  } catch (err) {
    console.error("Error fetching trending posts:", err);
    res.status(500).json([]);
  }
});

// Get all communities
router.get("/all", async (req, res) => {
  try {
    const communities = await Community.findAll();
    res.json(communities || []);
  } catch (err) {
    console.error("Error fetching all communities:", err);
    res.status(500).json([]);
  }
});

// Create text post
router.post("/:id/posts", async (req, res) => {
  try {
    console.log('Creating post for community:', req.params.id);
    console.log('Request body:', req.body);
    
    const { authorId, authorName, title, content, tags } = req.body;
    
    if (!authorId || !authorName || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Direct Firestore write instead of using model
    const db = admin.firestore();
    const postData = {
      authorId,
      authorName,
      title: title || '',
      content,
      tags: Array.isArray(tags) ? tags : [],
      communityId: req.params.id,
      type: req.body.type || 'text',
      hasMedia: req.body.hasMedia || false,
      mediaType: req.body.mediaType || null,
      likes: [],
      replies: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('posts').add(postData);
    console.log('Post created with ID:', docRef.id);
    
    res.status(201).json({ message: "Post created successfully", post: { id: docRef.id, ...postData } });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload and create media post (image/voice)
router.post("/:id/posts/media", upload.single('media'), async (req, res) => {
  try {
    const { authorId, authorName, title, content, tags } = req.body;
    
    if (!authorId || !authorName || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let mediaUrl = null;
    
    if (req.file) {
      const db = admin.firestore();
      const imageId = `img_${Date.now()}`;
      const base64Data = req.file.buffer.toString('base64');
      
      await db.collection('images').doc(imageId).set({
        data: base64Data,
        contentType: req.file.mimetype,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      mediaUrl = `http://localhost:5000/api/images/${imageId}`;
      console.log('Image stored with ID:', imageId);
    }

    const db = admin.firestore();
    const postData = {
      authorId,
      authorName,
      title: title || '',
      content,
      tags: typeof tags === 'string' ? JSON.parse(tags) : (tags || []),
      communityId: req.params.id,
      type: req.file ? 'image' : 'text',
      hasMedia: !!req.file,
      mediaType: req.file ? 'image' : null,
      mediaUrl: mediaUrl,
      likes: [],
      replies: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('Final postData:', { ...postData, mediaUrl: mediaUrl ? 'URL_SET' : 'NULL' });
    
    const docRef = await db.collection('posts').add(postData);
    console.log('Post saved with ID:', docRef.id);
    
    res.status(201).json({ message: "Media post created successfully", post: { id: docRef.id, ...postData } });
  } catch (err) {
    console.error('Error creating media post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add reply to post
router.post("/posts/:postId/reply", async (req, res) => {
  try {
    await Post.addReply(req.params.postId, req.body);
    res.json({ message: "Reply added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add reply with media
router.post("/posts/:postId/reply/media", upload.single('media'), async (req, res) => {
  try {
    let mediaUrl = null;
    
    if (req.file) {
      const bucket = admin.storage().bucket();
      const fileName = `reply-media/${Date.now()}-${req.file.originalname}`;
      const file = bucket.file(fileName);
      
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });
      
      await file.makePublic();
      mediaUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const replyData = {
      ...req.body,
      type: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'voice') : 'text',
      mediaUrl: mediaUrl
    };

    await Post.addReply(req.params.postId, replyData);
    res.json({ message: "Reply with media added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle like on post
router.post("/posts/:postId/like", async (req, res) => {
  try {
    const { farmerId } = req.body;
    await Post.toggleLike(req.params.postId, farmerId);
    res.json({ message: "Like toggled successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve images from Firestore
router.get('/images/:imageId', async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('images').doc(req.params.imageId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const imageData = doc.data();
    const buffer = Buffer.from(imageData.data, 'base64');
    
    res.set('Content-Type', imageData.contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

module.exports = router;