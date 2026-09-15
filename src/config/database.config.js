import mongoose from "mongoose";
import { config } from "./env.config.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};