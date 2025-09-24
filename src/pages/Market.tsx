import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, IndianRupee } from "lucide-react";

interface MarketPrice {
  commodity: string;
  variety: string;
  market: string;
  minPrice: string;
  maxPrice: string;
  modalPrice: string;
  date: string;
}

interface FertilizerPrice {
  name: string;
  price: string;
  unit: string;
  subsidy: string;
  trend?: string;
  change?: string;
}

interface PriceAlert {
  type: string;
  commodity: string;
  title: string;
  message: string;
  icon: string;
  priority: string;
  action: string;
}

const Market = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [fertilizerPrices, setFertilizerPrices] = useState<FertilizerPrice[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
      const state = farmer.state || 'Maharashtra';
      const district = farmer.city || 'Pune';

      const [marketResponse, fertilizerResponse, alertsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/gov-data/market-prices/${state}/${district}`),
        fetch(`http://localhost:5000/api/gov-data/fertilizer-prices/${state}`),
        fetch(`http://localhost:5000/api/gov-data/price-alerts/${state}`)
      ]);

      const marketData = await marketResponse.json();
      const fertilizerData = await fertilizerResponse.json();
      const alertsData = await alertsResponse.json();

      console.log('Market data received:', marketData);
      console.log('Fertilizer data received:', fertilizerData);
      
      setMarketPrices(marketData.prices || []);
      setFertilizerPrices(fertilizerData.fertilizers || []);
      setPriceAlerts(alertsData.alerts || []);
      
      // Show success message if real data is fetched
      if (marketData.success && marketData.prices.length > 0) {
        console.log(`✅ Fetched ${marketData.prices.length} real market prices from government API`);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Show user-friendly error
      alert('Unable to fetch live market data. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const getPriceTrend = (minPrice: string, maxPrice: string) => {
    const min = parseInt(minPrice);
    const max = parseInt(maxPrice);
    const avg = (min + max) / 2;
    
    if (avg > 2500) return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' };
    if (avg < 2000) return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: Minus, color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-poppins text-gray-900">
                Market Prices & Rates
              </h1>
              <p className="text-gray-600">
                Live mandi prices and fertilizer rates from government data
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Prices */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Mandi Prices Today
              </h2>
              <div className="space-y-4">
                {marketPrices.map((price, index) => {
                  const trend = getPriceTrend(price.minPrice, price.maxPrice);
                  const TrendIcon = trend.icon;
                  
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{price.commodity}</h3>
                          <p className="text-sm text-gray-600">{price.variety} • {price.market}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${trend.bg}`}>
                          <TrendIcon className={`h-5 w-5 ${trend.color}`} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="text-sm text-red-600 font-medium">Min Price</div>
                          <div className="text-lg font-bold text-red-700">₹{price.minPrice}</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-sm text-blue-600 font-medium">Modal Price</div>
                          <div className="text-lg font-bold text-blue-700">₹{price.modalPrice}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-sm text-green-600 font-medium">Max Price</div>
                          <div className="text-lg font-bold text-green-700">₹{price.maxPrice}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {price.date}
                        </Badge>
                        <span className="text-xs text-gray-500">Per Quintal</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Fertilizer Prices */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-orange-500" />
                Fertilizer Rates
              </h3>
              <div className="space-y-3">
                {fertilizerPrices.map((fertilizer, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{fertilizer.name}</h4>
                      {fertilizer.subsidy === 'Yes' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Subsidized
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">₹{fertilizer.price}</span>
                      <span className="text-xs text-gray-600">{fertilizer.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Price Alert */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">Price Alerts</h3>
              <div className="space-y-3">
                {priceAlerts.map((alert, index) => {
                  const IconComponent = alert.type === 'bullish' ? TrendingUp : alert.type === 'rising' ? TrendingUp : TrendingDown;
                  const iconColor = alert.type === 'bullish' ? 'text-green-600' : alert.type === 'rising' ? 'text-orange-600' : 'text-blue-600';
                  const textColor = alert.type === 'bullish' ? 'text-green-800' : alert.type === 'rising' ? 'text-orange-800' : 'text-blue-800';
                  
                  return (
                    <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className={`h-4 w-4 ${iconColor}`} />
                        <span className={`font-medium ${textColor}`}>{alert.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Market;