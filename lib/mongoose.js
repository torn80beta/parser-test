const mongoose = require("mongoose");

let isConnected = false;

const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.DB_KEY) return console.log("MONGODB_URL not found");
  if (isConnected) return console.log("Already connected to MongoDB");

  try {
    await mongoose.connect(process.env.DB_KEY);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDB;
