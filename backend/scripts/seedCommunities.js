const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(path.resolve("./firebase-service-account.json"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "personalizedadvisorysystem"
});

const db = admin.firestore();

const seedCommunities = async () => {
  try {
    // Check if communities already exist
    const existingSnapshot = await db.collection('communities').limit(1).get();
    if (!existingSnapshot.empty) {
      console.log("Communities already exist. Skipping seed.");
      process.exit(0);
    }

    const communities = [
      {
        name: "Pune Farmers Group",
        city: "Pune",
        state: "Maharashtra",
        description: "Connect with farmers in Pune area. Share experiences, ask questions, and help each other grow better crops.",
        createdBy: "admin",
        members: [],
        createdAt: new Date(),
        isActive: true
      },
      {
        name: "Mumbai Agriculture Hub",
        city: "Mumbai",
        state: "Maharashtra", 
        description: "Urban farming and agriculture discussion for Mumbai region farmers.",
        createdBy: "admin",
        members: [],
        createdAt: new Date(),
        isActive: true
      },
      {
        name: "Nagpur Cotton Growers",
        city: "Nagpur",
        state: "Maharashtra",
        description: "Specialized community for cotton farmers in Nagpur region.",
        createdBy: "admin", 
        members: [],
        createdAt: new Date(),
        isActive: true
      }
    ];

    for (const community of communities) {
      await db.collection('communities').add(community);
      console.log(`Created community: ${community.name}`);
    }

    console.log("All communities seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding communities:", error);
    process.exit(1);
  }
};

seedCommunities();