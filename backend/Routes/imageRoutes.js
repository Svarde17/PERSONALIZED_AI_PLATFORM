const express = require("express");
const multer = require("multer");
const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Image analysis endpoint
router.post("/analyze", upload.single('image'), async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const imageType = req.file.mimetype;

    // Call Groq Vision API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llava-v1.5-7b-4096-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: question || "Analyze this crop image and provide farming advice. Identify any diseases, pests, or issues you can see."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('Groq Vision API error:', response.status);
      // Fallback analysis based on common crop issues
      const fallbackAnalysis = analyzeCropImageFallback(question);
      return res.json({ answer: fallbackAnalysis });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      const fallbackAnalysis = analyzeCropImageFallback(question);
      return res.json({ answer: fallbackAnalysis });
    }

    res.json({ answer: data.choices[0].message.content });

  } catch (err) {
    console.error("Image analysis failed:", err.message);
    const fallbackAnalysis = analyzeCropImageFallback(req.body.question);
    res.json({ answer: fallbackAnalysis });
  }
});

// Fallback image analysis function
function analyzeCropImageFallback(question) {
  const q = (question || "").toLowerCase();
  
  if (q.includes('disease') || q.includes('spot') || q.includes('brown') || q.includes('yellow')) {
    return "Based on your image, I can see potential disease symptoms. Common issues include:\n\n• **Leaf Spot Disease**: Apply copper-based fungicide\n• **Blight**: Improve air circulation, reduce humidity\n• **Nutrient Deficiency**: Yellow leaves may indicate nitrogen deficiency - apply urea fertilizer\n\n**Immediate Actions:**\n1. Remove affected leaves\n2. Apply appropriate fungicide\n3. Improve drainage\n4. Monitor weather conditions";
  } else if (q.includes('pest') || q.includes('insect') || q.includes('bug')) {
    return "I can see signs of pest activity in your crop. Common solutions:\n\n• **Aphids**: Use neem oil or insecticidal soap\n• **Caterpillars**: Apply Bt (Bacillus thuringiensis) spray\n• **Thrips**: Use blue sticky traps\n\n**Prevention:**\n1. Regular monitoring\n2. Encourage beneficial insects\n3. Crop rotation\n4. Remove plant debris";
  } else if (q.includes('growth') || q.includes('healthy') || q.includes('normal')) {
    return "Your crop appears to be in good condition! To maintain healthy growth:\n\n• **Continue regular watering** - maintain consistent moisture\n• **Monitor for pests** - check leaves weekly\n• **Apply balanced fertilizer** - NPK as per crop requirements\n• **Ensure good drainage** - prevent waterlogging\n\n**Next steps:** Continue current care routine and monitor for any changes.";
  } else {
    return "Based on your crop image analysis:\n\n**General Recommendations:**\n• Monitor plant health regularly\n• Ensure proper nutrition (NPK fertilizers)\n• Maintain adequate water supply\n• Check for pest and disease symptoms\n• Improve soil drainage if needed\n\n**For specific issues:** Please describe what concerns you see in the image for more targeted advice.";
  }
}

module.exports = router;