import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Eye, 
  Wind, 
  Droplets, 
  Thermometer,
  MapPin,
  RefreshCw,
  Sunrise,
  Sunset
} from 'lucide-react';

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection?: number;
  visibility: number;
  description: string;
  main: string;
  icon: string;
  sunrise?: string;
  sunset?: string;
  timestamp: string;
}

interface ForecastData {
  date: string;
  dayName: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWeatherIcon = (main: string, icon: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'Clear': <Sun className="h-8 w-8 text-yellow-500" />,
      'Clouds': <Cloud className="h-8 w-8 text-gray-500" />,
      'Rain': <CloudRain className="h-8 w-8 text-blue-500" />,
      'Drizzle': <CloudRain className="h-8 w-8 text-blue-400" />,
      'Thunderstorm': <Zap className="h-8 w-8 text-purple-500" />,
      'Snow': <CloudSnow className="h-8 w-8 text-blue-200" />,
      'Mist': <Cloud className="h-8 w-8 text-gray-400" />,
      'Fog': <Cloud className="h-8 w-8 text-gray-400" />,
      'Haze': <Cloud className="h-8 w-8 text-gray-400" />,
    };
    return iconMap[main] || <Cloud className="h-8 w-8 text-gray-500" />;
  };

  const getSmallWeatherIcon = (main: string, icon: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'Clear': <Sun className="h-5 w-5 text-yellow-500" />,
      'Clouds': <Cloud className="h-5 w-5 text-gray-500" />,
      'Rain': <CloudRain className="h-5 w-5 text-blue-500" />,
      'Drizzle': <CloudRain className="h-5 w-5 text-blue-400" />,
      'Thunderstorm': <Zap className="h-5 w-5 text-purple-500" />,
      'Snow': <CloudSnow className="h-5 w-5 text-blue-200" />,
      'Mist': <Cloud className="h-5 w-5 text-gray-400" />,
      'Fog': <Cloud className="h-5 w-5 text-gray-400" />,
      'Haze': <Cloud className="h-5 w-5 text-gray-400" />,
    };
    return iconMap[main] || <Cloud className="h-5 w-5 text-gray-500" />;
  };

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let weatherUrl, forecastUrl;
      
      if (lat && lon) {
        weatherUrl = `http://localhost:5000/api/weather/current/${lat}/${lon}`;
        forecastUrl = `http://localhost:5000/api/weather/forecast/${lat}/${lon}`;
      } else {
        // Default to Delhi if no coordinates
        weatherUrl = `http://localhost:5000/api/weather/city/Delhi`;
        forecastUrl = `http://localhost:5000/api/weather/forecast/28.6139/77.2090`;
      }

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError('Unable to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchWeatherData(); // Fallback to default location
        }
      );
    } else {
      fetchWeatherData(); // Fallback to default location
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => getCurrentLocation()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Weather Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{weather.location}, {weather.country}</span>
          </div>
          <Button 
            onClick={() => getCurrentLocation()} 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.main, weather.icon)}
            <div>
              <div className="text-4xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">
                {weather.description}
              </div>
              <div className="text-xs text-muted-foreground">
                Feels like {weather.feelsLike}°C
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{weather.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">{weather.windSpeed} m/s</div>
              <div className="text-xs text-muted-foreground">Wind</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <Thermometer className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-medium">{weather.pressure} hPa</div>
              <div className="text-xs text-muted-foreground">Pressure</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <Eye className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">{weather.visibility} km</div>
              <div className="text-xs text-muted-foreground">Visibility</div>
            </div>
          </div>
        </div>

        {/* Sunrise/Sunset */}
        {weather.sunrise && weather.sunset && (
          <div className="flex justify-between items-center pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-orange-500" />
              <span className="text-sm">{weather.sunrise}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="h-4 w-4 text-orange-600" />
              <span className="text-sm">{weather.sunset}</span>
            </div>
          </div>
        )}
      </Card>

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <h3 className="font-semibold mb-3 text-green-800 dark:text-green-200">5-Day Forecast</h3>
          <div className="grid grid-cols-5 gap-2">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="text-xs font-medium mb-1">
                  {day.dayName || 'Today'}
                </div>
                <div className="flex justify-center mb-1">
                  {getSmallWeatherIcon(
                    day.description.includes('rain') ? 'Rain' : 
                    day.description.includes('cloud') || day.description.includes('overcast') ? 'Clouds' : 
                    day.description.includes('clear') ? 'Clear' : 'Clouds', 
                    day.icon
                  )}
                </div>
                <div className="text-sm font-bold">{day.temperature}°</div>
                <div className="text-xs text-muted-foreground">{day.humidity}%</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeatherWidget;