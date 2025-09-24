const express = require("express");
const Farmer = require("../models/user");
const admin = require("firebase-admin");
const kvkCalendars = require("../data/kvkCalendars.json");
const router = express.Router();

// Legacy crop calendar data (keeping as fallback)
const cropCalendars = {
  wheat: {
    rabi: [
      { week: 1, task: "Land preparation and sowing", details: "Prepare field, apply FYM 10 tons/acre", priority: "high", icon: "🌱" },
      { week: 2, task: "First irrigation", details: "Light irrigation after 20-25 days of sowing", priority: "high", icon: "💧" },
      { week: 4, task: "Apply Urea fertilizer", details: "Apply 20 kg/acre urea fertilizer", priority: "medium", icon: "🧪" },
      { week: 6, task: "Second irrigation", details: "Crown root initiation stage - 30mm water", priority: "high", icon: "💧" },
      { week: 8, task: "Weed control", details: "Manual weeding or herbicide application", priority: "medium", icon: "🌿" },
      { week: 10, task: "Third irrigation", details: "Tillering stage irrigation", priority: "high", icon: "💧" },
      { week: 12, task: "Apply DAP fertilizer", details: "Apply 15 kg/acre DAP", priority: "medium", icon: "🧪" },
      { week: 14, task: "Fourth irrigation", details: "Jointing stage - critical irrigation", priority: "high", icon: "💧" },
      { week: 16, task: "Pest monitoring", details: "Check for aphids and apply neem oil if needed", priority: "low", icon: "🐛" },
      { week: 18, task: "Fifth irrigation", details: "Flowering stage irrigation", priority: "high", icon: "💧" },
      { week: 20, task: "Final irrigation", details: "Grain filling stage - last irrigation", priority: "high", icon: "💧" },
      { week: 22, task: "Harvest preparation", details: "Check grain moisture, prepare harvesting tools", priority: "high", icon: "🌾" },
      { week: 24, task: "Harvesting", details: "Harvest when grain moisture is 20-22%", priority: "high", icon: "✂️" }
    ]
  },
  rice: {
    kharif: [
      { week: 1, task: "Nursery preparation", details: "Prepare nursery beds, soak seeds for 24 hours", priority: "high", icon: "🌱" },
      { week: 3, task: "Land preparation", details: "Puddle the field, apply FYM 15 tons/acre", priority: "high", icon: "🚜" },
      { week: 4, task: "Transplanting", details: "Transplant 25-30 day old seedlings", priority: "high", icon: "🌾" },
      { week: 5, task: "First weeding", details: "Manual weeding or herbicide application", priority: "medium", icon: "🌿" },
      { week: 7, task: "Apply Urea", details: "Apply 25 kg/acre urea fertilizer", priority: "medium", icon: "🧪" },
      { week: 9, task: "Second weeding", details: "Remove weeds and maintain water level", priority: "medium", icon: "🌿" },
      { week: 11, task: "Panicle initiation", details: "Apply 20 kg/acre urea, maintain 5cm water", priority: "high", icon: "🌾" },
      { week: 13, task: "Flowering stage", details: "Maintain continuous water supply", priority: "high", icon: "🌸" },
      { week: 15, task: "Grain filling", details: "Reduce water gradually, apply potash", priority: "high", icon: "💧" },
      { week: 17, task: "Pest control", details: "Monitor for brown plant hopper, apply if needed", priority: "medium", icon: "🐛" },
      { week: 19, task: "Drain field", details: "Drain water 10 days before harvest", priority: "high", icon: "🚰" },
      { week: 21, task: "Harvesting", details: "Harvest when 80% grains are golden yellow", priority: "high", icon: "✂️" }
    ]
  },
  tomato: {
    rabi: [
      { week: 1, task: "Seed sowing", details: "Sow seeds in nursery beds", priority: "high", icon: "🌱" },
      { week: 4, task: "Transplanting", details: "Transplant 4-5 week old seedlings", priority: "high", icon: "🍅" },
      { week: 5, task: "First irrigation", details: "Light irrigation after transplanting", priority: "high", icon: "💧" },
      { week: 6, task: "Apply fertilizer", details: "Apply NPK 19:19:19 @ 25 kg/acre", priority: "medium", icon: "🧪" },
      { week: 8, task: "Staking", details: "Provide support stakes for plants", priority: "medium", icon: "🪵" },
      { week: 10, task: "Pruning", details: "Remove suckers and lower leaves", priority: "low", icon: "✂️" },
      { week: 12, task: "Flowering stage", details: "Apply calcium spray to prevent blossom end rot", priority: "medium", icon: "🌸" },
      { week: 14, task: "Fruit setting", details: "Maintain consistent moisture, mulching", priority: "high", icon: "🍅" },
      { week: 16, task: "Pest monitoring", details: "Check for whitefly, apply sticky traps", priority: "medium", icon: "🐛" },
      { week: 18, task: "First harvest", details: "Harvest mature green/red fruits", priority: "high", icon: "🍅" },
      { week: 20, task: "Continuous harvest", details: "Harvest every 3-4 days", priority: "high", icon: "🧺" }
    ]
  }
};

// Get current season based on month
function getCurrentSeason(month) {
  if (month >= 4 && month <= 9) return 'kharif'; // Apr-Sep
  if (month >= 10 || month <= 3) return 'rabi';  // Oct-Mar
  return 'zaid'; // Summer crops
}

// Get farmer's crop calendar using KVK data
router.get("/farmer/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farmer = await Farmer.findById(farmerId);
    
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = getCurrentSeason(currentMonth);
    const cropName = farmer.crop.toLowerCase();
    const stateName = farmer.state.toLowerCase();
    
    // Get KVK crop calendar based on crop, state, and season
    let calendar = kvkCalendars[cropName]?.[stateName]?.[currentSeason] || 
                   kvkCalendars[cropName]?.['maharashtra']?.[currentSeason] || // fallback to Maharashtra
                   cropCalendars[cropName]?.[currentSeason] || []; // legacy fallback
    
    // Calculate current week of season
    const seasonStart = currentSeason === 'kharif' ? new Date(currentDate.getFullYear(), 3, 1) : 
                       currentSeason === 'rabi' ? new Date(currentDate.getFullYear(), 9, 1) :
                       new Date(currentDate.getFullYear(), 2, 1);
    
    const weeksDiff = Math.floor((currentDate - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    // Mark tasks as completed, current, or upcoming
    const enrichedCalendar = calendar.map(task => ({
      ...task,
      status: task.week < weeksDiff ? 'completed' : 
              task.week === weeksDiff ? 'current' : 'upcoming',
      dueDate: new Date(seasonStart.getTime() + (task.week - 1) * 7 * 24 * 60 * 60 * 1000)
    }));

    res.json({
      farmer: {
        name: farmer.name,
        crop: farmer.crop,
        location: `${farmer.city}, ${farmer.state}`
      },
      season: currentSeason,
      currentWeek: weeksDiff,
      calendar: enrichedCalendar,
      upcomingTasks: enrichedCalendar.filter(task => 
        task.status === 'current' || (task.status === 'upcoming' && task.week <= weeksDiff + 2)
      )
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch calendar" });
  }
});

// Mark task as completed
router.post("/task/complete", async (req, res) => {
  try {
    const { farmerId, taskWeek } = req.body;
    // In a real app, you'd store completion status in database
    res.json({ success: true, message: "Task marked as completed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Send Firebase notification
const sendNotification = async (farmerId, title, body, data = {}) => {
  try {
    // In a real app, you'd store FCM tokens in farmer profile
    const message = {
      notification: { title, body },
      data: { farmerId, ...data },
      topic: `farmer_${farmerId}` // Subscribe farmers to their topic
    };
    
    await admin.messaging().send(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Get notifications/reminders
router.get("/notifications/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farmer = await Farmer.findById(farmerId);
    
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentSeason = getCurrentSeason(currentMonth);
    const cropName = farmer.crop.toLowerCase();
    const stateName = farmer.state.toLowerCase();
    
    const calendar = kvkCalendars[cropName]?.[stateName]?.[currentSeason] || 
                     kvkCalendars[cropName]?.['maharashtra']?.[currentSeason] || 
                     cropCalendars[cropName]?.[currentSeason] || [];
    const seasonStart = currentSeason === 'kharif' ? new Date(currentDate.getFullYear(), 3, 1) : 
                       new Date(currentDate.getFullYear(), 9, 1);
    const weeksDiff = Math.floor((currentDate - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    // Get urgent notifications
    const notifications = [];
    
    // Current week tasks with multilingual support
    const currentTasks = calendar.filter(task => task.week === weeksDiff);
    currentTasks.forEach(task => {
      const localTitle = task.hindi || task.marathi || task.task;
      notifications.push({
        id: `current-${task.week}`,
        type: 'urgent',
        title: `This Week: ${localTitle}`,
        message: task.details,
        icon: task.icon,
        priority: task.priority,
        dueDate: new Date(seasonStart.getTime() + (task.week - 1) * 7 * 24 * 60 * 60 * 1000),
        hindi: task.hindi,
        marathi: task.marathi
      });
    });
    
    // Next week tasks with multilingual support
    const nextTasks = calendar.filter(task => task.week === weeksDiff + 1);
    nextTasks.forEach(task => {
      const localTitle = task.hindi || task.marathi || task.task;
      notifications.push({
        id: `next-${task.week}`,
        type: 'reminder',
        title: `Next Week: ${localTitle}`,
        message: task.details,
        icon: task.icon,
        priority: task.priority,
        dueDate: new Date(seasonStart.getTime() + (task.week - 1) * 7 * 24 * 60 * 60 * 1000),
        hindi: task.hindi,
        marathi: task.marathi
      });
    });

    // Send Firebase notifications for urgent tasks
    currentTasks.forEach(async (task) => {
      const localTitle = task.hindi || task.task;
      await sendNotification(
        farmerId,
        `🌾 ${localTitle}`,
        task.details,
        { taskWeek: task.week.toString(), priority: task.priority }
      );
    });

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;