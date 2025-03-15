import mongoose from "mongoose";
import logger from "../config/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected ${conn.connection.host}`);
  } catch (error) {
    logger.info("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

export default connectDB;
