const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/farmers.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

class LocalFarmer {
  constructor(data) {
    this.name = data.name;
    this.city = data.city;
    this.state = data.state;
    this.crop = data.crop;
    this.aadhar = data.aadhar;
    this.createdAt = new Date();
    this.id = Date.now().toString();
  }

  async save() {
    const farmers = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    farmers.push(this);
    fs.writeFileSync(dataFile, JSON.stringify(farmers, null, 2));
    return this;
  }

  static async find() {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
}

module.exports = LocalFarmer;