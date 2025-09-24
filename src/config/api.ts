// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/farmers/register`,
  
  // Government Data
  MARKET_PRICES: (state: string, district: string) => 
    `${API_BASE_URL}/api/gov-data/market-prices/${state}/${district}`,
  FERTILIZER_PRICES: (state: string) => 
    `${API_BASE_URL}/api/gov-data/fertilizer-prices/${state}`,
  PRICE_ALERTS: (state: string) => 
    `${API_BASE_URL}/api/gov-data/price-alerts/${state}`,
  
  // Schemes
  ELIGIBLE_SCHEMES: (farmerId: string) => 
    `${API_BASE_URL}/api/schemes/eligible/${farmerId}`,
  SCHEME_GUIDANCE: (schemeId: string) => 
    `${API_BASE_URL}/api/schemes/guidance/${schemeId}`,
  
  // UIDAI
  SEND_OTP: `${API_BASE_URL}/api/uidai/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/uidai/verify-otp`,
  
  // OCR
  EXTRACT_AADHAAR: `${API_BASE_URL}/api/ocr/extract-aadhaar`,
  
  // Weather
  WEATHER: (city: string) => `${API_BASE_URL}/api/weather/${city}`,
  
  // Chat
  CHAT: `${API_BASE_URL}/api/chat`,
  
  // Image Analysis
  ANALYZE_IMAGE: `${API_BASE_URL}/api/image/analyze`
};