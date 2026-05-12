const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Da ket noi MongoDB");
  } catch (error) {
    console.error("Loi ket noi MongoDB:", error.message);
    throw error; 
  }
}

module.exports = connectDB;
