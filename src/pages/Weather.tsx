import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import WeatherWidget from '@/components/WeatherWidget';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, AlertTriangle, Lightbulb } from 'lucide-react';

interface WeatherAdvice {
  condition: string;
  advice: string;
  icon: JSX.Element;
  color: string;
}

const Weather = () => {
  const [searchCity, setSearchCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);

  const getWeatherAdvice = (weather: any): WeatherAdvice[] => {
    if (!weather) return [];

    const advice: WeatherAdvice[] = [];

    // Temperature-based advice
    if (weather.temperature > 35) {
      advice.push({
        condition: 'High Temperature',
        advice: 'Ensure adequate irrigation. Consider shade nets for sensitive crops. Harvest early morning.',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-red-600 bg-red-50'
      });
    } else if (weather.temperature < 10) {
      advice.push({
        condition: 'Low Temperature',
        advice: 'Protect crops from frost. Use mulching. Consider greenhouse protection.',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-blue-600 bg-blue-50'
      });
    }

    // Humidity-based advice
    if (weather.humidity > 80) {
      advice.push({
        condition: 'High Humidity',
        advice: 'Monitor for fungal diseases. Ensure good air circulation. Reduce irrigation frequency.',
        icon: <Lightbulb className="h-5 w-5" />,
        color: 'text-purple-600 bg-purple-50'
      });
    } else if (weather.humidity < 30) {
      advice.push({
        condition: 'Low Humidity',
        advice: 'Increase irrigation frequency. Consider misting systems. Monitor plant stress.',
        icon: <Lightbulb className="h-5 w-5" />,
        color: 'text-orange-600 bg-orange-50'
      });
    }

    // Wind-based advice
    if (weather.windSpeed > 10) {
      advice.push({
        condition: 'High Wind Speed',
        advice: 'Secure tall crops with stakes. Delay spraying operations. Check for wind damage.',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-gray-600 bg-gray-50'
      });
    }

    // Weather condition advice
    if (weather.main === 'Rain') {
      advice.push({
        condition: 'Rainy Weather',
        advice: 'Ensure proper drainage. Delay harvesting. Monitor for waterlogging in fields.',
        icon: <Lightbulb className="h-5 w-5" />,
        color: 'text-blue-600 bg-blue-50'
      });
    }

    return advice;
  };

  const handleCitySearch = async () => {
    if (!searchCity.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/weather/city/${searchCity}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentWeather(data);
      }
    } catch (error) {
      console.error('Error searching city:', error);
    }
  };

  const weatherAdvice = getWeatherAdvice(currentWeather);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 font-poppins">Weather Dashboard</h1>
          <p className="text-muted-foreground">
            Get real-time weather updates and farming advice based on current conditions
          </p>
        </div>

        {/* City Search */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Weather by City</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
              />
            </div>
            <Button onClick={handleCitySearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weather Widget */}
          <div className="lg:col-span-2">
            <WeatherWidget />
          </div>

          {/* Weather-based Farming Advice */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Farming Advice
              </h3>
              
              {weatherAdvice.length > 0 ? (
                <div className="space-y-4">
                  {weatherAdvice.map((advice, index) => (
                    <div key={index} className={`p-4 rounded-lg ${advice.color}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{advice.icon}</div>
                        <div>
                          <h4 className="font-medium mb-1">{advice.condition}</h4>
                          <p className="text-sm">{advice.advice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Weather-based farming advice will appear here based on current conditions.
                </p>
              )}
            </Card>

            {/* Quick Weather Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Weather Tips</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">Sunny Days</h4>
                  <p className="text-sm text-green-700">
                    Perfect for harvesting and field operations. Ensure adequate water supply.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">Rainy Season</h4>
                  <p className="text-sm text-blue-700">
                    Monitor drainage, prevent waterlogging, and watch for pest diseases.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-1">Extreme Weather</h4>
                  <p className="text-sm text-orange-700">
                    Take protective measures for crops and livestock during storms or heatwaves.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Weather Impact on Crops */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold mb-6">Weather Impact on Common Crops</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🌾 Wheat</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Optimal temp: 15-25°C</li>
                <li>• Sensitive to high humidity</li>
                <li>• Requires dry weather for harvest</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🌾 Rice</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Needs high humidity (80%+)</li>
                <li>• Optimal temp: 20-35°C</li>
                <li>• Requires consistent water supply</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">🌽 Maize</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Optimal temp: 21-27°C</li>
                <li>• Sensitive to frost</li>
                <li>• Needs moderate rainfall</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Weather;