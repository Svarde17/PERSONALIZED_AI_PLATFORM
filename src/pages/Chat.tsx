import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Mic, 
  Camera, 
  Upload,
  Bot,
  User,
  Leaf,
  Info
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  hasImage?: boolean;
  explanation?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I am your AI farming assistant. Ask me anything about your crops.',
      timestamp: new Date(),
      explanation: "I'm here to provide personalized farming advice based on your city, state, and crop."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [farmer, setFarmer] = useState<any>(null);

  useEffect(() => {
    const farmerData = sessionStorage.getItem("farmer");
    if (farmerData) {
      try {
        setFarmer(JSON.parse(farmerData));
      } catch (e) {
        console.error('Error parsing farmer data:', e);
      }
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !farmer) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: farmer.id,
          question: inputMessage
        })
      });
      const data = await res.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.answer,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while getting AI response");
    }

    setInputMessage('');
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && farmer) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Uploaded image: ${file.name}`,
        timestamp: new Date(),
        hasImage: true
      };

      setMessages(prev => [...prev, userMessage]);

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('question', 'Analyze this crop image and provide farming advice');

        const response = await fetch('http://localhost:5000/api/image/analyze', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.answer || 'Unable to analyze image',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Image analysis failed:', error);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'Sorry, I could not analyze the image. Please try again or describe your crop issue in text.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border p-4 bg-card">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold font-poppins flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              AI Krishi Assistant
            </h1>
            <p className="text-muted-foreground">Ask questions in English or upload crop images</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-4xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-first' : ''}`}>
                  <Card className={`p-4 ${
                    message.type === 'user' 
                      ? 'chat-farmer ml-auto' 
                      : 'chat-ai'
                  }`}>
                    {message.hasImage && (
                      <div className="flex items-center gap-2 mb-2 text-sm opacity-80">
                        <Camera className="h-4 w-4" />
                        Image uploaded
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    {message.explanation && (
                      <div className="mt-3 p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-4 w-4" />
                          <span className="text-xs font-medium">Explanation</span>
                        </div>
                        <p className="text-xs opacity-90">{message.explanation}</p>
                      </div>
                    )}
                  </Card>
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-earth/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-earth" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="container mx-auto max-w-4xl">
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImageUpload}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Upload Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-2 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
              >
                <Mic className="h-4 w-4" />
                {isRecording ? 'Stop Recording' : 'Voice Input'}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your farming question or upload an image for analysis..."
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button 
                onClick={sendMessage}
                variant="farmer"
                size="icon"
                className="h-11 w-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;