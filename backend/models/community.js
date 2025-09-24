const admin = require("firebase-admin");

class Community {
  constructor(data) {
    this.name = data.name;
    this.city = data.city;
    this.state = data.state;
    this.description = data.description;
    this.createdBy = data.createdBy;
    this.members = data.members || [];
    this.createdAt = new Date();
    this.isActive = true;
  }

  static async findAll() {
    const db = admin.firestore();
    const snapshot = await db.collection('communities')
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findByState(state) {
    const db = admin.firestore();
    const snapshot = await db.collection('communities')
      .where('state', '==', state)
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async save() {
    const db = admin.firestore();
    const docRef = await db.collection('communities').add({
      name: this.name,
      city: this.city,
      state: this.state,
      description: this.description,
      createdBy: this.createdBy,
      members: this.members,
      createdAt: this.createdAt,
      isActive: this.isActive
    });
    this.id = docRef.id;
    return this;
  }

  static async findByCity(city) {
    const db = admin.firestore();
    const snapshot = await db.collection('communities')
      .where('city', '==', city)
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findById(id) {
    const db = admin.firestore();
    const doc = await db.collection('communities').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async joinCommunity(communityId, farmerId) {
    const db = admin.firestore();
    await db.collection('communities').doc(communityId).update({
      members: admin.firestore.FieldValue.arrayUnion(farmerId)
    });
  }

  static async getMemberCount(communityId) {
    const db = admin.firestore();
    const doc = await db.collection('communities').doc(communityId).get();
    if (doc.exists) {
      const data = doc.data();
      return data.members ? data.members.length : 0;
    }
    return 0;
  }

  static async autoJoinCommunity(farmerId, city) {
    const db = admin.firestore();
    const communities = await this.findByCity(city);
    
    for (const community of communities) {
      if (!community.members || !community.members.includes(farmerId)) {
        await this.joinCommunity(community.id, farmerId);
      }
    }
  }
}

class Post {
  constructor(data) {
    this.communityId = data.communityId;
    this.authorId = data.authorId;
    this.authorName = data.authorName;
    this.title = data.title;
    this.content = data.content;
    this.type = data.type; // 'text', 'image', 'voice'
    this.mediaUrl = data.mediaUrl || null;
    this.tags = data.tags || [];
    this.likes = [];
    this.replies = [];
    this.createdAt = new Date();
  }

  async save() {
    const db = admin.firestore();
    const docRef = await db.collection('posts').add({
      communityId: this.communityId,
      authorId: this.authorId,
      authorName: this.authorName,
      title: this.title,
      content: this.content,
      type: this.type,
      mediaUrl: this.mediaUrl,
      tags: this.tags,
      likes: this.likes,
      replies: this.replies,
      createdAt: this.createdAt
    });
    this.id = docRef.id;
    return this;
  }

  static async findByCommunity(communityId, limit = 20) {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('posts')
        .where('communityId', '==', communityId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error in findByCommunity:', error);
      return [];
    }
  }

  static async findAllPosts(limit = 50) {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error in findAllPosts:', error);
      return [];
    }
  }

  static async findByState(state, limit = 30) {
    const db = admin.firestore();
    const communitiesSnapshot = await db.collection('communities')
      .where('state', '==', state)
      .get();
    
    const communityIds = communitiesSnapshot.docs.map(doc => doc.id);
    
    if (communityIds.length === 0) return [];
    
    const postsSnapshot = await db.collection('posts')
      .where('communityId', 'in', communityIds)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async findTrending(limit = 20) {
    const db = admin.firestore();
    const snapshot = await db.collection('posts')
      .orderBy('likes', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async addReply(postId, reply) {
    const db = admin.firestore();
    await db.collection('posts').doc(postId).update({
      replies: admin.firestore.FieldValue.arrayUnion({
        id: Date.now().toString(),
        authorId: reply.authorId,
        authorName: reply.authorName,
        content: reply.content,
        type: reply.type || 'text',
        mediaUrl: reply.mediaUrl || null,
        createdAt: new Date()
      })
    });
  }

  static async toggleLike(postId, farmerId) {
    const db = admin.firestore();
    const postRef = db.collection('posts').doc(postId);
    const post = await postRef.get();
    
    if (post.exists) {
      const likes = post.data().likes || [];
      if (likes.includes(farmerId)) {
        await postRef.update({
          likes: admin.firestore.FieldValue.arrayRemove(farmerId)
        });
      } else {
        await postRef.update({
          likes: admin.firestore.FieldValue.arrayUnion(farmerId)
        });
      }
    }
  }
}

module.exports = { Community, Post };