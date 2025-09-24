import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FarmerProfileCard from "@/components/FarmerProfileCard";
import StatCard from "@/components/StatCard";
import QuickActionCard from "@/components/QuickActionCard";
import WeatherWidget from "@/components/WeatherWidget";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  Activity,
  Cloud
} from "lucide-react";
import heroImage from "@/assets/hero-farmer.jpg";
import BlurText from "@/components/BlurText";

const Index = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<any>(null);
  const [realTimeData, setRealTimeData] = useState({
    cropHealth: 0,
    soilMoisture: 0,
    temperature: 0,
    expectedYield: 0,
    trends: {
      cropHealth: 0,
      soilMoisture: 0,
      expectedYield: 0
    }
  });

  useEffect(() => {
    // Get farmer data from session
    const farmerData = JSON.parse(sessionStorage.getItem("farmer") || '{}');
    setFarmer(farmerData);
    
    // Generate real-time data based on farmer's crop and location
    if (farmerData.crop && farmerData.city) {
      generateRealTimeData(farmerData);
    }
  }, []);

  const generateRealTimeData = (farmerData: any) => {
    // Generate realistic data based on crop type and season
    const cropFactors = {
      'wheat': { health: 85, moisture: 65, yield: 3.8 },
      'rice': { health: 90, moisture: 75, yield: 4.5 },
      'sugarcane': { health: 88, moisture: 70, yield: 45 },
      'cotton': { health: 82, moisture: 60, yield: 2.2 },
      'tomato': { health: 91, moisture: 68, yield: 25 }
    };
    
    const crop = farmerData.crop.toLowerCase();
    const baseFactor = cropFactors[crop as keyof typeof cropFactors] || cropFactors.wheat;
    
    // Add random variations for real-time feel
    const variation = () => (Math.random() - 0.5) * 10;
    
    setRealTimeData({
      cropHealth: Math.max(70, Math.min(95, baseFactor.health + variation())),
      soilMoisture: Math.max(50, Math.min(80, baseFactor.moisture + variation())),
      temperature: Math.max(20, Math.min(35, 28 + (Math.random() - 0.5) * 8)),
      expectedYield: Math.max(baseFactor.yield * 0.8, baseFactor.yield + (Math.random() - 0.5) * baseFactor.yield * 0.3),
      trends: {
        cropHealth: Math.floor((Math.random() - 0.3) * 10),
        soilMoisture: Math.floor((Math.random() - 0.5) * 8),
        expectedYield: Math.floor((Math.random() - 0.2) * 15)
      }
    });
  };

  // Refresh data every 30 seconds for real-time feel
  useEffect(() => {
    if (farmer) {
      const interval = setInterval(() => {
        generateRealTimeData(farmer);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [farmer]);
  
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
                <BlurText 
                  text="आपका AI कृषि-साथी"
                  className="text-4xl lg:text-5xl font-bold text-white mb-4 font-poppins"
                  delay={150}
                  animateBy="words"
                  direction="top"
                />
                <BlurText 
                  text="Your AI Krishi-Sathi - Empowering farmers with intelligent insights"
                  className="text-xl text-white/90 mb-6"
                  delay={100}
                  animateBy="words"
                  direction="bottom"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Farmer Profile */}
          <div className="mb-8">
            <FarmerProfileCard />
          </div>

          {/* Key Stats - Real Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Crop Health"
              value={`${Math.round(realTimeData.cropHealth)}%`}
              icon={Sprout}
              trend={{ 
                value: `${Math.abs(realTimeData.trends.cropHealth)}%`, 
                isPositive: realTimeData.trends.cropHealth > 0 
              }}
            />
            <StatCard
              title="Soil Moisture"
              value={`${Math.round(realTimeData.soilMoisture)}%`}
              icon={Droplets}
              trend={{ 
                value: `${Math.abs(realTimeData.trends.soilMoisture)}%`, 
                isPositive: realTimeData.trends.soilMoisture > 0 
              }}
            />
            <StatCard
              title="Temperature"
              value={`${Math.round(realTimeData.temperature)}°C`}
              icon={ThermometerSun}
            />
            <StatCard
              title="Expected Yield"
              value={`${realTimeData.expectedYield.toFixed(1)}${farmer?.crop === 'Sugarcane' ? 'T/acre' : farmer?.crop === 'Tomato' ? 'T/acre' : 'T/acre'}`}
              icon={TrendingUp}
              trend={{ 
                value: `${Math.abs(realTimeData.trends.expectedYield)}%`, 
                isPositive: realTimeData.trends.expectedYield > 0 
              }}
            />
          </div>

          {/* Weather Widget */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 font-poppins">Weather & Forecast</h2>
            <WeatherWidget />
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
                title="Weather Forecast"
                description="Check weather and get farming advice"
                icon={Cloud}
                path="/weather"
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
                {realTimeData.soilMoisture < 60 && (
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="font-medium text-warning">Irrigation Alert</p>
                    <p className="text-sm text-muted-foreground">Soil moisture is low ({Math.round(realTimeData.soilMoisture)}%). Consider irrigation.</p>
                  </div>
                )}
                {realTimeData.cropHealth < 80 && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="font-medium text-destructive">Crop Health Alert</p>
                    <p className="text-sm text-muted-foreground">Crop health is below optimal. Check for pests or diseases.</p>
                  </div>
                )}
                {farmer?.city && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="font-medium text-primary">Weather Update</p>
                    <p className="text-sm text-muted-foreground">Current temperature in {farmer.city}: {Math.round(realTimeData.temperature)}°C</p>
                  </div>
                )}
                {farmer?.crop && (
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="font-medium text-success">Market Update</p>
                    <p className="text-sm text-muted-foreground">{farmer.crop} prices are {realTimeData.trends.expectedYield > 0 ? 'rising' : 'stable'} in your region</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent AI Queries</h3>
              <div className="space-y-3">
                {farmer?.crop && (
                  <>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-medium">"Best fertilizer for {farmer.crop.toLowerCase()}?"</p>
                      <p className="text-xs text-muted-foreground mt-1">Answered 2 hours ago</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-medium">"When to harvest {farmer.crop.toLowerCase()}?"</p>
                      <p className="text-xs text-muted-foreground mt-1">Answered yesterday</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-medium">"Weather forecast for {farmer.city}"</p>
                      <p className="text-xs text-muted-foreground mt-1">Answered 2 days ago</p>
                    </div>
                  </>
                )}
                {!farmer?.crop && (
                  <div className="p-3 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No recent queries. Start chatting with AI!</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/chat')}>
                Ask AI Assistant
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
