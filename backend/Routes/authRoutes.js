const express = require("express");
const Farmer = require("../models/user");
const router = express.Router();

// Login endpoint with password verification
router.post("/login", async (req, res) => {
  try {
    const { aadhar, password } = req.body;
    
    if (!aadhar || !password) {
      return res.status(400).json({ error: "Aadhaar and password are required" });
    }
    
    const db = require("firebase-admin").firestore();
    const snapshot = await db.collection('farmers').where('aadhar', '==', aadhar).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: "Farmer not found. Please register first." });
    }
    
    const doc = snapshot.docs[0];
    const farmer = { id: doc.id, ...doc.data() };
    
    // Debug logging
    console.log('Login attempt:', { aadhar, password });
    console.log('Stored farmer:', { name: farmer.name, hasPassword: !!farmer.password });
    
    // Verify password
    if (!farmer.password) {
      return res.status(401).json({ error: "Account created without password. Please register again." });
    }
    
    if (farmer.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    res.json({ 
      success: true, 
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
    console.error('Login error:', err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;