const express = require("express");
const Farmer = require("../models/user");
const schemesData = require("../data/governmentSchemes.json");
const axios = require("axios");
const router = express.Router();

// Get eligible schemes for a farmer
router.get("/eligible/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farmer = await Farmer.findById(farmerId);
    
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const eligibleSchemes = [];
    const farmerState = farmer.state.toLowerCase();
    const farmerCrop = farmer.crop.toLowerCase();
    const farmerAadhar = farmer.aadhar;
    
    // Get state-specific scheme IDs
    const stateSchemeIds = schemesData.stateMapping[farmerState] || [];
    
    // Get unique schemes (avoid duplicates)
    const uniqueSchemeIds = new Set();
    const applicableSchemes = [];
    
    // Add all India schemes first
    schemesData.schemes.forEach(scheme => {
      if (scheme.eligibility.states === "all" && !uniqueSchemeIds.has(scheme.id)) {
        applicableSchemes.push(scheme);
        uniqueSchemeIds.add(scheme.id);
      }
    });
    
    // Add state-specific schemes (avoid duplicates)
    schemesData.schemes.forEach(scheme => {
      if (stateSchemeIds.includes(scheme.id) && !uniqueSchemeIds.has(scheme.id)) {
        applicableSchemes.push(scheme);
        uniqueSchemeIds.add(scheme.id);
      }
    });
    
    // Match schemes based on farmer profile
    applicableSchemes.forEach(scheme => {
      let isEligible = true;
      let eligibilityReasons = [];
      
      // Check state eligibility
      if (scheme.eligibility.states !== "all") {
        if (!scheme.eligibility.states.includes(farmerState)) {
          isEligible = false;
          eligibilityReasons.push("State not eligible");
        }
      }
      
      // Check crop eligibility
      if (scheme.eligibility.crops !== "all") {
        if (!scheme.eligibility.crops.includes(farmerCrop)) {
          isEligible = false;
          eligibilityReasons.push("Crop not covered");
        }
      }
      
      // Aadhaar-based eligibility (mock implementation)
      const aadhaarEligibility = checkAadhaarEligibility(farmerAadhar, scheme);
      if (!aadhaarEligibility.eligible) {
        eligibilityReasons.push(aadhaarEligibility.reason);
      }
      
      // Add scheme if eligible
      if (isEligible && aadhaarEligibility.eligible) {
        eligibleSchemes.push({
          ...scheme,
          eligibilityScore: calculateEligibilityScore(scheme, farmer),
          estimatedBenefit: calculateEstimatedBenefit(scheme, farmer),
          aadhaarMatch: aadhaarEligibility.matchScore,
          eligibilityReasons: eligibilityReasons,
          howToApply: {
            website: scheme.applyUrl,
            steps: [
              "Visit official website",
              "Register with Aadhaar",
              "Fill application form",
              "Upload documents",
              "Submit & track status"
            ]
          }
        });
      }
    });
    
    // Remove duplicates and sort by priority and eligibility score
    const uniqueEligibleSchemes = eligibleSchemes.filter((scheme, index, self) => 
      index === self.findIndex(s => s.id === scheme.id)
    );
    
    uniqueEligibleSchemes.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] - priorityOrder[a.priority]) || 
             (b.eligibilityScore - a.eligibilityScore);
    });

    res.json({
      success: true,
      farmer: {
        name: farmer.name,
        state: farmer.state,
        crop: farmer.crop,
        aadhar: farmer.aadhar
      },
      totalSchemes: uniqueEligibleSchemes.length,
      schemes: uniqueEligibleSchemes
    });
  } catch (error) {
    console.error("Schemes eligibility error:", error);
    res.status(500).json({ error: "Failed to fetch eligible schemes" });
  }
});

// Check Aadhaar-based eligibility (mock implementation)
function checkAadhaarEligibility(aadhaar, scheme) {
  // Mock Aadhaar validation - in production, integrate with UIDAI
  const aadhaarDigits = aadhaar.split('');
  const lastDigit = parseInt(aadhaarDigits[aadhaarDigits.length - 1]);
  const secondLastDigit = parseInt(aadhaarDigits[aadhaarDigits.length - 2]);
  
  // Mock eligibility based on Aadhaar pattern
  let eligible = true;
  let reason = "";
  let matchScore = 85; // Base match score
  
  // Income support schemes - check if farmer is in eligible category
  if (scheme.category === "income_support") {
    if (lastDigit > 7) {
      eligible = false;
      reason = "Income threshold exceeded based on Aadhaar verification";
    } else {
      matchScore += 10;
    }
  }
  
  // Land holding verification (mock)
  if (scheme.eligibility.landHolding !== "any") {
    if (secondLastDigit > 5) {
      matchScore -= 15;
      reason = "Land holding verification pending";
    }
  }
  
  // Age-based eligibility for certain schemes
  if (scheme.id.includes("insurance") || scheme.id.includes("life")) {
    if (lastDigit < 2) {
      eligible = false;
      reason = "Age criteria not met";
    }
  }
  
  return {
    eligible: eligible,
    reason: reason,
    matchScore: Math.max(matchScore, 60)
  };
}

// Calculate eligibility score (0-100)
function calculateEligibilityScore(scheme, farmer) {
  let score = 50; // Base score
  
  // Higher score for high priority schemes
  if (scheme.priority === "high") score += 25;
  else if (scheme.priority === "medium") score += 15;
  
  // Higher score for income support schemes
  if (scheme.category === "income_support") score += 15;
  
  // State-specific schemes get bonus
  if (scheme.eligibility.states !== "all") score += 15;
  
  // Crop-specific schemes get bonus
  if (scheme.eligibility.crops !== "all") score += 10;
  
  // Farmer state matches scheme state
  const farmerState = farmer.state.toLowerCase();
  if (scheme.eligibility.states.includes(farmerState)) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

// Calculate estimated benefit amount
function calculateEstimatedBenefit(scheme, farmer) {
  const benefitText = scheme.benefit;
  
  // Extract numeric value from benefit text
  const numericMatch = benefitText.match(/₹([\d,]+)/);
  if (numericMatch) {
    const amount = parseInt(numericMatch[1].replace(/,/g, ''));
    return {
      amount: amount,
      period: benefitText.includes('per year') ? 'annual' : 
              benefitText.includes('per hectare') ? 'per_hectare' : 'one_time',
      description: benefitText
    };
  }
  
  return {
    amount: 0,
    period: 'unknown',
    description: benefitText
  };
}

// Verify Aadhaar (Mock implementation - in production use UIDAI API)
router.post("/verify-aadhaar", async (req, res) => {
  try {
    const { aadhaar, otp } = req.body;
    
    if (!aadhaar || aadhaar.length !== 12) {
      return res.status(400).json({ error: "Invalid Aadhaar number" });
    }
    
    // Mock verification - in production, integrate with UIDAI API
    // const uidaiResponse = await axios.post('https://api.uidai.gov.in/verify', {
    //   aadhaar: aadhaar,
    //   otp: otp
    // });
    
    // Simulate verification
    const isValid = Math.random() > 0.1; // 90% success rate for demo
    
    if (isValid) {
      res.json({
        success: true,
        verified: true,
        message: "Aadhaar verified successfully",
        details: {
          name: "Verified Name", // In production, get from UIDAI
          state: "Verified State",
          district: "Verified District"
        }
      });
    } else {
      res.json({
        success: false,
        verified: false,
        message: "Aadhaar verification failed"
      });
    }
  } catch (error) {
    console.error("Aadhaar verification error:", error);
    res.status(500).json({ error: "Verification service unavailable" });
  }
});

// Get application guidance for scheme
router.get("/guidance/:schemeId", (req, res) => {
  try {
    const { schemeId } = req.params;
    const scheme = schemesData.schemes.find(s => s.id === schemeId);
    
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    
    const guidance = {
      scheme: scheme.name,
      fullName: scheme.fullName,
      description: scheme.description,
      benefit: scheme.benefit,
      eligibility: scheme.eligibility,
      documents: scheme.documents,
      applicationSteps: [
        "Visit the official website: " + scheme.applyUrl,
        "Register/Login with your Aadhaar number",
        "Fill the online application form",
        "Upload required documents (" + scheme.documents.join(", ") + ")",
        "Submit application and note down application ID",
        "Track application status on the portal"
      ],
      importantNotes: [
        "All government schemes are completely FREE",
        "Never pay any fees to middlemen or agents",
        "Apply directly through official government portals only",
        "Keep your Aadhaar and bank account details ready",
        "Take screenshots of successful submission"
      ],
      officialWebsite: scheme.applyUrl,
      helplineNumbers: {
        "PM-KISAN": "155261",
        "Fasal Bima": "14447",
        "General Agriculture": "1800-180-1551"
      }
    };
    
    res.json({
      success: true,
      guidance: guidance
    });
  } catch (error) {
    console.error("Guidance error:", error);
    res.status(500).json({ error: "Failed to fetch guidance" });
  }
});

// Get scheme details
router.get("/details/:schemeId", (req, res) => {
  try {
    const { schemeId } = req.params;
    const scheme = schemesData.schemes.find(s => s.id === schemeId);
    
    if (!scheme) {
      return res.status(404).json({ error: "Scheme not found" });
    }
    
    res.json({
      success: true,
      scheme: scheme
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scheme details" });
  }
});

// Get all schemes (for admin/reference)
router.get("/all", (req, res) => {
  try {
    res.json({
      success: true,
      totalSchemes: schemesData.schemes.length,
      schemes: schemesData.schemes
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schemes" });
  }
});

module.exports = router;