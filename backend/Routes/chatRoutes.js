const express = require("express");
const Farmer = require("../models/user");
const router = express.Router();

// Test endpoint
router.post("/test", (req, res) => {
  res.json({ message: "Chat API is working", body: req.body });
});

// ✅ Chat endpoint
router.post("/", async (req, res) => {
  try {
    const { farmerId, question } = req.body;
    console.log('Chat request:', { farmerId, question });

    if (!farmerId || !question) {
      return res.status(400).json({ error: "Missing farmerId or question" });
    }

    // Call Groq LLM
    console.log('Calling Groq API with key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful farming assistant. Give practical farming advice in English." },
          { role: "user", content: question }
        ],
        max_tokens: 300
      })
    });

    console.log('Groq response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      // Better fallback response based on question
      let fallbackAnswer = "";
      const q = question.toLowerCase();
      
      if (q.includes('fertilizer') && q.includes('tomato')) {
        fallbackAnswer = "For tomatoes, use a balanced NPK fertilizer (10-10-10) during planting, then switch to high-potassium fertilizer during fruiting. Apply compost and calcium to prevent blossom end rot.";
      } else if (q.includes('fertilizer') && q.includes('wheat')) {
        fallbackAnswer = "For wheat, apply DAP (18-46-0) at sowing time and urea (46-0-0) in 2-3 splits during tillering and grain filling stages.";
      } else if (q.includes('fertilizer') && q.includes('rice')) {
        fallbackAnswer = "For rice, use NPK (20-20-0-13) as basal dose and urea in 2-3 splits. Apply zinc sulfate if deficiency symptoms appear.";
      } else if (q.includes('yellow') && q.includes('leaves')) {
        fallbackAnswer = "Yellow leaves often indicate nitrogen deficiency. Apply urea fertilizer (46-0-0) at 50kg per acre with proper irrigation.";
      } else if (q.includes('fungal') || q.includes('disease')) {
        fallbackAnswer = "For fungal diseases, ensure proper drainage, apply copper sulfate fungicide, maintain good air circulation, and avoid overhead watering.";
      } else if (q.includes('pest') || q.includes('insect')) {
        fallbackAnswer = "For pest control, use integrated pest management. Apply neem oil for organic control or appropriate insecticides based on pest identification.";
      } else if (q.includes('irrigation') || q.includes('water')) {
        fallbackAnswer = "Water requirements vary by crop and season. Generally, provide 1-2 inches per week. Use drip irrigation for water efficiency.";
      } else if (q.includes('harvest') || q.includes('when')) {
        fallbackAnswer = "Harvest timing depends on crop maturity indicators. Check grain moisture, color changes, and field drying before harvesting.";
      } else {
        fallbackAnswer = "Please consult with local agricultural experts for specific advice on your farming question.";
      }
      
      return res.json({ answer: fallbackAnswer });
    }

    const data = await response.json();
    console.log('Groq response data:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq response structure');
      return res.json({ 
        answer: `Regarding "${question}": Please ensure proper crop management, monitor weather conditions, and consult local agricultural experts for specific advice.` 
      });
    }

    res.json({ answer: data.choices[0].message.content || 'No response generated' });
  } catch (err) {
    console.error("Chat endpoint failed:", err.message);
    res.status(500).json({ error: err.message || "Failed to get AI response" });
  }
});

module.exports = router;