const express = require("express");
const axios = require("axios");
const router = express.Router();

// Test data.gov.in API connectivity
router.get("/test-api", async (req, res) => {
  try {
    console.log('Testing data.gov.in API with key:', process.env.DATA_GOV_API_KEY);
    
    // Test with a known working resource ID
    const response = await axios.get(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`, {
      params: {
        'api-key': process.env.DATA_GOV_API_KEY,
        format: 'json',
        limit: 5
      }
    });

    console.log('API Response:', response.data);
    
    res.json({
      success: true,
      message: 'API connection successful',
      data: response.data,
      recordCount: response.data.records ? response.data.records.length : 0
    });
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
    
    res.json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details',
      status: error.response?.status || 'Unknown'
    });
  }
});

// List available resources
router.get("/list-resources", async (req, res) => {
  try {
    // Try to get catalog of available resources
    const response = await axios.get(`https://api.data.gov.in/catalog`, {
      params: {
        'api-key': process.env.DATA_GOV_API_KEY,
        format: 'json',
        limit: 20,
        filters: {
          sector: 'agriculture'
        }
      }
    });

    res.json({
      success: true,
      resources: response.data
    });
  } catch (error) {
    console.error('List resources error:', error.message);
    
    res.json({
      success: false,
      error: error.message,
      message: 'Could not fetch resource catalog'
    });
  }
});

module.exports = router;