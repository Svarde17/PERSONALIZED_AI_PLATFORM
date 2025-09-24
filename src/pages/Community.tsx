import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus,
  Camera,
  ThumbsUp,
  Bot,
  User
} from "lucide-react";

interface CommunityPost {
  id: string;
  author: string;
  location: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  replies: number;
  tags: string[];
  hasAIResponse?: boolean;
}

const Community = () => {
  const posts: CommunityPost[] = [
    {
      id: '1',
      author: 'राजेश कुमार',
      location: 'Punjab',
      timestamp: '2 hours ago',
      content: 'मेरे धान के खेत में पानी भर रहा है। क्या करूं? इस मौसम में क्या उपाय हैं?',
      likes: 15,
      replies: 8,
      tags: ['Rice', 'Irrigation', 'Monsoon'],
      hasAIResponse: true
    },
    {
      id: '2',
      author: 'सुनीता देवी',
      location: 'Haryana',
      timestamp: '5 hours ago',
      content: 'Organic fertilizer का अच्छा result मिल रहा है। Share कर रही हूं अपना experience।',
      likes: 23,
      replies: 12,
      tags: ['Organic', 'Fertilizer', 'Experience'],
      hasAIResponse: false
    },
    {
      id: '3',
      author: 'अमित शर्मा',
      location: 'Maharashtra',
      timestamp: '1 day ago',
      content: 'सोयाबीन की नई variety के बारे में जानकारी चाहिए। कौन सी सबसे अच्छी है?',
      likes: 31,
      replies: 18,
      tags: ['Soybean', 'Variety', 'Advice'],
      hasAIResponse: true
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-poppins">Community</h1>
              <p className="text-muted-foreground">Connect with fellow farmers and share knowledge</p>
            </div>
            <Button variant="farmer" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">2.5K</div>
              <div className="text-sm text-muted-foreground">Active Farmers</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-success">450</div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">89%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-earth">156</div>
              <div className="text-sm text-muted-foreground">Expert Farmers</div>
            </Card>
          </div>

          {/* Posts Feed */}
          <div className="max-w-2xl mx-auto space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="p-6 card-hover">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{post.author}</h3>
                      <span className="text-sm text-muted-foreground">• {post.location}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-foreground mb-3">{post.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI Response Indicator */}
                {post.hasAIResponse && (
                  <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">AI Assistant has provided a detailed answer</span>
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.replies}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Posts
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;