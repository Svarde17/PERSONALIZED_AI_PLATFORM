import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Send, 
  Heart, 
  MessageCircle, 
  Image, 
  Mic, 
  MicOff
} from "lucide-react";

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [replyContent, setReplyContent] = useState({});

  const [selectedImage, setSelectedImage] = useState(null);
  const [feedType, setFeedType] = useState('local');
  const [loading, setLoading] = useState(false);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });
  const fileInputRef = useRef(null);
  
  const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
  const farmerId = farmer.id;
  const farmerName = farmer.name;
  const farmerCity = "Pune";
  const farmerState = "Maharashtra";

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (feedType === 'local' && selectedCommunity) {
      fetchPosts(selectedCommunity.id);
    } else if (feedType !== 'local') {
      fetchPosts();
    }
  }, [selectedCommunity, feedType]);

  const fetchCommunities = async () => {
    try {
      // Auto-join communities first
      if (farmerId) {
        await fetch('http://localhost:5000/api/communities/auto-join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farmerId, city: farmerCity })
        });
      }
      
      const response = await fetch(`http://localhost:5000/api/communities/city/${farmerCity}`);
      const data = await response.json();
      setCommunities(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedCommunity(data[0]);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
    }
  };

  const fetchPosts = async (communityId = null) => {
    setLoading(true);
    try {
      let url;
      switch (feedType) {
        case 'india':
          url = 'http://localhost:5000/api/communities/feed/all';
          break;
        case 'state':
          url = `http://localhost:5000/api/communities/feed/state/${farmerState}`;
          break;
        case 'trending':
          url = `http://localhost:5000/api/communities/feed/trending/${farmerCity}`;
          break;
        default:
          url = communityId ? `http://localhost:5000/api/communities/${communityId}/posts` : 'http://localhost:5000/api/communities/feed/all';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
    setLoading(false);
  };

  const createPost = async (type = 'text') => {
    if (!farmerId || !farmerName) {
      alert('Please register first');
      return;
    }
    
    if (feedType === 'local' && !selectedCommunity) {
      alert('Please select a community');
      return;
    }
    
    if (!newPost.content.trim()) {
      alert('Please enter content');
      return;
    }
    
    try {
      const communityId = feedType === 'local' ? selectedCommunity.id : 'HGbYzuFovcdBG2iqIBtJ';
      
      if (selectedImage) {
        // Create post with actual media upload
        const formData = new FormData();
        formData.append('authorId', farmerId);
        formData.append('authorName', farmerName);
        formData.append('title', newPost.title);
        formData.append('content', newPost.content);
        formData.append('tags', JSON.stringify(newPost.tags.split(',').map(t => t.trim()).filter(t => t)));
        
        if (selectedImage) {
          formData.append('media', selectedImage);

        }
        
        const response = await fetch(`http://localhost:5000/api/communities/${communityId}/posts/media`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          setNewPost({ title: "", content: "", tags: "" });
          setSelectedImage(null);

          if (feedType === 'local') {
            fetchPosts(selectedCommunity.id);
          } else {
            fetchPosts();
          }
        } else {
          const error = await response.json();
          console.error('Media post creation failed:', error);
          alert('Failed to create post: ' + (error.error || 'Unknown error'));
        }
      } else {
        // Regular text post
        const response = await fetch(`http://localhost:5000/api/communities/${communityId}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId: farmerId,
            authorName: farmerName,
            title: newPost.title,
            content: newPost.content,
            tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t)
          })
        });
        
        if (response.ok) {
          setNewPost({ title: "", content: "", tags: "" });
          if (feedType === 'local') {
            fetchPosts(selectedCommunity.id);
          } else {
            fetchPosts();
          }
        } else {
          const error = await response.json();
          console.error('Post creation failed:', error);
          alert('Failed to create post: ' + (error.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert('Network error. Please try again.');
    }
  };

  const addReply = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/communities/posts/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: farmerId,
          authorName: farmerName,
          content: replyContent[postId] || ""
        })
      });

      if (response.ok) {
        setReplyContent({ ...replyContent, [postId]: "" });
        fetchPosts(selectedCommunity.id);
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await fetch(`http://localhost:5000/api/communities/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId })
      });
      fetchPosts(selectedCommunity.id);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };



  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Community - {farmerCity}</h1>
        </div>

        {/* Feed Type Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <Button
            variant={feedType === 'local' ? "default" : "outline"}
            onClick={() => setFeedType('local')}
            className="whitespace-nowrap"
          >
            🏠 Local ({farmerCity})
          </Button>
          <Button
            variant={feedType === 'state' ? "default" : "outline"}
            onClick={() => setFeedType('state')}
            className="whitespace-nowrap"
          >
            🏛️ State ({farmerState})
          </Button>
          <Button
            variant={feedType === 'india' ? "default" : "outline"}
            onClick={() => setFeedType('india')}
            className="whitespace-nowrap"
          >
            🇮🇳 All India
          </Button>
          <Button
            variant={feedType === 'trending' ? "default" : "outline"}
            onClick={() => setFeedType('trending')}
            className="whitespace-nowrap"
          >
            🔥 Trending
          </Button>
        </div>

        {/* Community Selector - Only for Local */}
        {feedType === 'local' && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {communities.map((community) => (
              <Button
                key={community.id}
                variant={selectedCommunity?.id === community.id ? "default" : "outline"}
                onClick={() => setSelectedCommunity(community)}
                className="whitespace-nowrap"
              >
                {community.name}
              </Button>
            ))}
          </div>
        )}

        {selectedCommunity && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Post */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or discuss farming topics..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={3}
                  />
                  <Input
                    placeholder="Tags (comma separated): wheat, pest, irrigation"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  />
                  
                  {/* Media Preview */}
                  {selectedImage && (
                    <div className="flex items-center gap-2 p-2 bg-secondary rounded">
                      <Image className="h-4 w-4" />
                      <span className="text-sm">{selectedImage.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedImage(null)}>×</Button>
                    </div>
                  )}
                  


                  <div className="flex gap-2">
                    <div className="flex gap-2">
                      <Button onClick={() => createPost('text')} className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add Image"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      

                    </div>
                  </div>
                </div>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{post.authorName}</span>
                          <span className="text-sm text-muted-foreground">
                            {(() => {
                              if (!post.createdAt) return 'Just now';
                              try {
                                if (post.createdAt.seconds) {
                                  return new Date(post.createdAt.seconds * 1000).toLocaleDateString();
                                } else if (post.createdAt._seconds) {
                                  return new Date(post.createdAt._seconds * 1000).toLocaleDateString();
                                } else {
                                  const date = new Date(post.createdAt);
                                  return isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString();
                                }
                              } catch {
                                return 'Just now';
                              }
                            })()} 
                          </span>
                        </div>
                        <h4 className="font-medium mb-2">{post.title}</h4>
                        <p className="text-muted-foreground mb-3">{post.content}</p>
                        
                        {/* Media Content */}
                        {post.mediaUrl && post.type === 'image' && (
                          <div className="mb-3">
                            <img 
                              src={post.mediaUrl} 
                              alt="Shared by farmer" 
                              className="max-w-full h-auto rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                              onClick={() => setImageModal({ isOpen: true, src: post.mediaUrl, alt: `Image shared by ${post.authorName}` })}
                              onError={(e) => {
                                console.error('Image load error:', e);
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {post.mediaUrl && post.type === 'voice' && (
                          <div className="mb-3">
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                              <Mic className="h-5 w-5 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-700 mb-2">🎤 Voice Message</p>
                                <audio controls className="w-full">
                                  <source src={post.mediaUrl} type="audio/webm" />
                                  <source src={post.mediaUrl} type="audio/wav" />
                                  Your browser does not support audio playback.
                                </audio>
                              </div>
                            </div>
                          </div>
                        )}
                        

                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 mb-3">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center gap-4 mb-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={post.likes?.includes(farmerId) ? "text-red-500" : ""}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes?.length || 0}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.replies?.length || 0}
                          </Button>
                        </div>
                        
                        {/* Replies */}
                        {post.replies && post.replies.length > 0 && (
                          <div className="space-y-3 mb-4 pl-4 border-l-2 border-secondary">
                            {post.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">{reply.authorName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{reply.authorName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {reply.createdAt ? (
                                        reply.createdAt.seconds ? 
                                          new Date(reply.createdAt.seconds * 1000).toLocaleDateString() : 
                                          new Date(reply.createdAt).toLocaleDateString()
                                      ) : 'Just now'}
                                    </span>
                                  </div>
                                  <p className="text-sm">{reply.content}</p>
                                  {reply.type === 'image' && reply.mediaUrl && (
                                    <img src={reply.mediaUrl} alt="Reply" className="max-w-xs h-auto rounded mt-2" />
                                  )}
                                  {reply.type === 'voice' && reply.mediaUrl && (
                                    <audio controls className="mt-2">
                                      <source src={reply.mediaUrl} type="audio/webm" />
                                    </audio>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply Input */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a reply..."
                            value={replyContent[post.id] || ""}
                            onChange={(e) => setReplyContent({ ...replyContent, [post.id]: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => addReply(post.id)}
                            disabled={!replyContent[post.id]?.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community Info Sidebar */}
            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{selectedCommunity.name}</h3>
                <p className="text-muted-foreground mb-4">{selectedCommunity.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{selectedCommunity.memberCount || selectedCommunity.members?.length || 1} members</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {(() => {
                      if (!selectedCommunity.createdAt) return 'Recently';
                      try {
                        if (selectedCommunity.createdAt.seconds) {
                          return new Date(selectedCommunity.createdAt.seconds * 1000).toLocaleDateString();
                        } else {
                          const date = new Date(selectedCommunity.createdAt);
                          return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
                        }
                      } catch {
                        return 'Recently';
                      }
                    })()}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* Image Modal - Instagram Style */}
        {imageModal.isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setImageModal({ isOpen: false, src: '', alt: '' })}
          >
            <div className="relative max-w-4xl max-h-full">
              <img 
                src={imageModal.src} 
                alt={imageModal.alt}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={() => setImageModal({ isOpen: false, src: '', alt: '' })}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white bg-black bg-opacity-50 rounded-lg p-3">
                <p className="text-sm">{imageModal.alt}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;