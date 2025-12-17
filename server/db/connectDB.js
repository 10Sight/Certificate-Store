import mongoose from "mongoose";
import logger from "../logger/winston.logger.js";
import ENV from "../configs/env.config.js";

const connectDB = async () => {
    try {
        const uri = ENV.MONGO_URI;

        if (!uri) {
            logger.error("MONGO_URI is undefined. Please check your Render Environment Variables.");
            console.error("CRITICAL ERROR: MONGO_URI is undefined!");
            process.exit(1);
        }

        // Log masked URI to confirm it's loaded without exposing credentials
        console.log(`Connecting to MongoDB with URI starting: ${uri.substring(0, 15)}...`);

        await mongoose.connect(uri);
        logger.info("MongoDB Connected");
    } catch (error) {
        logger.error("MongoDB Connection Failed", error.message);
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;