const admin = require("firebase-admin");
const path = require("path");

const initializeFirebase = () => {
  try {
    const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "personalizedadvisorysystem",
      storageBucket: "personalizedadvisorysystem.firebasestorage.app"
    });

    console.log("Firebase Connected");
    return admin.firestore();
  } catch (err) {
    console.error("Firebase connection error:", err.message);
    process.exit(1);
  }
};

module.exports = initializeFirebase;
