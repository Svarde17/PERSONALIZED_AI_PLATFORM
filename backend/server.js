const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const initializeFirebase = require("./config/db");
const farmerRoutes = require("./Routes/farmerRoutes");
const communityRoutes = require("./Routes/communityRoutes");
const weatherRoutes = require("./Routes/weatherRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const authRoutes = require("./Routes/authRoutes");
const imageRoutes = require("./Routes/imageRoutes");
const calendarRoutes = require("./Routes/calendarRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const govDataRoutes = require("./Routes/govDataRoutes");
const testApiRoutes = require("./Routes/testApiRoutes");
const schemesRoutes = require("./Routes/schemesRoutes");
const ocrRoutes = require("./Routes/ocrRoutes");

dotenv.config();
initializeFirebase();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/farmers", farmerRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/gov-data", govDataRoutes);
app.use("/api/test", testApiRoutes);
app.use("/api/schemes", schemesRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api", communityRoutes); // For image serving

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
