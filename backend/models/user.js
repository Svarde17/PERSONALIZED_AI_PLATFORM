const admin = require("firebase-admin");

class Farmer {
  constructor(data) {
    this.name = data.name;
    this.city = data.city;
    this.state = data.state;
    this.crop = data.crop;
    this.aadhar = data.aadhar;
    this.password = data.password; // Add password field
    this.createdAt = new Date();
  }

  async save() {
    const db = admin.firestore();
    
    // Check if farmer already exists
    const existingFarmer = await db.collection('farmers').where('aadhar', '==', this.aadhar).get();
    if (!existingFarmer.empty) {
      throw new Error('Farmer with this Aadhaar already exists');
    }
    
    const docRef = await db.collection('farmers').add({
      name: this.name,
      city: this.city,
      state: this.state,
      crop: this.crop,
      aadhar: this.aadhar,
      password: this.password, // Save password
      createdAt: this.createdAt
    });
    this.id = docRef.id;
    return this;
  }

  static async findById(id) {
    const db = admin.firestore();
    const doc = await db.collection('farmers').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async findOne(query) {
  const db = admin.firestore();
  const snapshot = await db.collection('farmers').where('aadhar', '==', query.aadhar).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

  static async find() {
    const db = admin.firestore();
    const snapshot = await db.collection('farmers').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = Farmer;
