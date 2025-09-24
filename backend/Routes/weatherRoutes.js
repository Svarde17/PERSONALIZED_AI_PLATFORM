const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = 'e094dfbf281c8f2dea463b95cdfc19ab';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather by coordinates
router.get('/current/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });
    
    const weather = response.data;
    const formattedData = {
      location: weather.name,
      country: weather.sys.country,
      temperature: Math.round(weather.main.temp),
      feelsLike: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      pressure: weather.main.pressure,
      windSpeed: weather.wind.speed,
      windDirection: weather.wind.deg,
      visibility: weather.visibility / 1000,
      description: weather.weather[0].description,
      main: weather.weather[0].main,
      icon: weather.weather[0].icon,
      sunrise: new Date(weather.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(weather.sys.sunset * 1000).toLocaleTimeString(),
      timestamp: new Date()
    };
    
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get 5-day forecast
router.get('/forecast/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });
    
    const forecast = response.data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
    const formattedForecast = forecast.map(item => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      dayName: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed
    }));
    
    res.json(formattedForecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Get weather by city name
router.get('/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: cityName,
        appid: API_KEY,
        units: 'metric'
      }
    });
    
    const weather = response.data;
    const formattedData = {
      location: weather.name,
      country: weather.sys.country,
      temperature: Math.round(weather.main.temp),
      feelsLike: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      pressure: weather.main.pressure,
      windSpeed: weather.wind.speed,
      description: weather.weather[0].description,
      main: weather.weather[0].main,
      icon: weather.weather[0].icon,
      coordinates: { lat: weather.coord.lat, lon: weather.coord.lon }
    };
    
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'City not found or API error' });
  }
});

module.exports = router;