import mongoose from "mongoose"

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("🟢 Using existing MongoDB connection");
    return;
  }

  try {
    const db = await mongoose.connect(`${process.env.MONGOOSE_URI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw new Error("MongoDB connection failed");
  }
};