const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://Monir:L3rOsjGf88vPYSeH@ecotrack-server.pnvhcn2.mongodb.net/chuadanga_pourashava_store?retryWrites=true&w=majority&appName=Ecotrack-server";

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
