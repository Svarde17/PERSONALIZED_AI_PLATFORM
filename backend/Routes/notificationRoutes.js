const express = require("express");
const admin = require("firebase-admin");
const Farmer = require("../models/user");
const kvkCalendars = require("../data/kvkCalendars.json");
const router = express.Router();

// Subscribe farmer to notifications
router.post("/subscribe", async (req, res) => {
  try {
    const { farmerId, fcmToken } = req.body;
    
    if (!farmerId || !fcmToken) {
      return res.status(400).json({ error: "Missing farmerId or fcmToken" });
    }

    // Subscribe to farmer-specific topic
    await admin.messaging().subscribeToTopic([fcmToken], `farmer_${farmerId}`);
    
    // Store FCM token in farmer profile (you'd update your farmer model)
    // await Farmer.updateOne({ _id: farmerId }, { fcmToken });
    
    res.json({ success: true, message: "Subscribed to notifications" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Send immediate notification
router.post("/send", async (req, res) => {
  try {
    const { farmerId, title, body, data = {} } = req.body;
    
    const message = {
      notification: {
        title,
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      },
      data: {
        farmerId: farmerId.toString(),
        ...data
      },
      topic: `farmer_${farmerId}`
    };

    await admin.messaging().send(message);
    res.json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Send weekly reminders (cron job endpoint)
router.post("/weekly-reminders", async (req, res) => {
  try {
    const farmers = await Farmer.find();
    let sentCount = 0;

    for (const farmer of farmers) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentSeason = getCurrentSeason(currentMonth);
      const cropName = farmer.crop.toLowerCase();
      const stateName = farmer.state.toLowerCase();
      
      const calendar = kvkCalendars[cropName]?.[stateName]?.[currentSeason] || 
                       kvkCalendars[cropName]?.['maharashtra']?.[currentSeason] || [];
      
      if (calendar.length === 0) continue;

      const seasonStart = currentSeason === 'kharif' ? new Date(currentDate.getFullYear(), 3, 1) : 
                         new Date(currentDate.getFullYear(), 9, 1);
      const weeksDiff = Math.floor((currentDate - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      // Find current week tasks
      const currentTasks = calendar.filter(task => task.week === weeksDiff);
      
      for (const task of currentTasks) {
        const localTitle = task.hindi || task.marathi || task.task;
        const message = {
          notification: {
            title: `🌾 ${localTitle}`,
            body: task.details,
            icon: '/favicon.ico'
          },
          data: {
            farmerId: farmer.id,
            taskWeek: task.week.toString(),
            priority: task.priority,
            crop: farmer.crop
          },
          topic: `farmer_${farmer.id}`
        };

        await admin.messaging().send(message);
        sentCount++;
      }
    }

    res.json({ success: true, message: `Sent ${sentCount} notifications` });
  } catch (error) {
    console.error("Weekly reminders error:", error);
    res.status(500).json({ error: "Failed to send weekly reminders" });
  }
});

// Get current season helper
function getCurrentSeason(month) {
  if (month >= 4 && month <= 9) return 'kharif';
  if (month >= 10 || month <= 3) return 'rabi';
  return 'zaid';
}

module.exports = router;