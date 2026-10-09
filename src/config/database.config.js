import mongoose from "mongoose";
import { config } from "./env.config.js";
import logger from "./logger.config.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.fatal("MongoDB connection failed", {
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
};