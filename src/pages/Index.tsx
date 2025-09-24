import Layout from "@/components/Layout";
import FarmerProfileCard from "@/components/FarmerProfileCard";
import StatCard from "@/components/StatCard";
import QuickActionCard from "@/components/QuickActionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sprout, 
  Droplets, 
  ThermometerSun, 
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  Users,
  Calendar,
  FileText,
  Activity
} from "lucide-react";
import heroImage from "@/assets/hero-farmer.jpg";

const Index = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-80 lg:h-96 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Modern farming with AI technology" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 font-poppins">
                  आपका AI कृषि-साथी
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  Your AI Krishi-Sathi - Empowering farmers with intelligent insights
                </p>
                <Button variant="hero" size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Farmer Profile */}
          <div className="mb-8">
            <FarmerProfileCard />
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Crop Health"
              value="92%"
              icon={Sprout}
              trend={{ value: "5%", isPositive: true }}
            />
            <StatCard
              title="Soil Moisture"
              value="68%"
              icon={Droplets}
              trend={{ value: "2%", isPositive: false }}
            />
            <StatCard
              title="Temperature"
              value="28°C"
              icon={ThermometerSun}
            />
            <StatCard
              title="Expected Yield"
              value="4.2T/acre"
              icon={TrendingUp}
              trend={{ value: "8%", isPositive: true }}
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 font-poppins">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Ask AI Assistant"
                description="Get instant answers to your farming questions"
                icon={MessageCircle}
                path="/chat"
                color="primary"
              />
              <QuickActionCard
                title="Community"
                description="Connect with fellow farmers"
                icon={Users}
                path="/community"
                color="earth"
              />
              <QuickActionCard
                title="Crop Calendar"
                description="Plan your farming activities"
                icon={Calendar}
                path="/calendar"
                color="success"
              />
              <QuickActionCard
                title="Market Prices"
                description="Check latest mandi rates"
                icon={TrendingUp}
                path="/market"
                color="warning"
              />
              <QuickActionCard
                title="Govt Schemes"
                description="Explore available subsidies"
                icon={FileText}
                path="/schemes"
                color="primary"
              />
              <QuickActionCard
                title="Crop Health"
                description="Monitor field conditions"
                icon={Activity}
                path="/health"
                color="success"
              />
            </div>
          </div>

          {/* Recent Activities & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Recent Alerts
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="font-medium text-warning">Weather Alert</p>
                  <p className="text-sm text-muted-foreground">Heavy rainfall expected in next 48 hours</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="font-medium text-success">Irrigation Reminder</p>
                  <p className="text-sm text-muted-foreground">Field A needs watering in 2 days</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="font-medium text-primary">Market Update</p>
                  <p className="text-sm text-muted-foreground">Wheat prices increased by 5% this week</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent AI Queries</h3>
              <div className="space-y-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">"My wheat leaves are turning yellow"</p>
                  <p className="text-xs text-muted-foreground mt-1">Answered 2 hours ago</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">"Best time to harvest sugarcane?"</p>
                  <p className="text-xs text-muted-foreground mt-1">Answered yesterday</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">"Fertilizer recommendations for monsoon"</p>
                  <p className="text-xs text-muted-foreground mt-1">Answered 2 days ago</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Queries
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
