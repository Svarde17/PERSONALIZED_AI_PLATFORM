const express = require("express");
const Farmer = require("../models/user");

const router = express.Router();

// ✅ Register a farmer
router.post("/register", async (req, res) => {
  try {
    const { name, city, state, crop, aadhar, password } = req.body;
    
    // Validate required fields
    if (!name || !city || !state || !crop || !aadhar || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    if (aadhar.length !== 12) {
      return res.status(400).json({ error: "Aadhaar must be 12 digits" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    const farmer = new Farmer(req.body);
    await farmer.save();
    
    res.status(201).json({ 
      message: "Farmer registered successfully", 
      farmer: {
        id: farmer.id,
        name: farmer.name,
        city: farmer.city,
        state: farmer.state,
        crop: farmer.crop,
        aadhar: farmer.aadhar
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all farmers
router.get("/", async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

module.exports = router;
