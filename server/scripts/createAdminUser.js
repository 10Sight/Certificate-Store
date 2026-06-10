import mongoose from "mongoose";
import connectDB from "../db/connectDB.js";
import User from "../models/user.model.js";

const adminUser = {
    fullName: "Admin User",
    iCardNumber: "admin123",
    email: "admin123@example.com",
    mobile: "1234567891",
    password: "1234567891",
    role: "ADMIN",
    employmentType: "PERMANENT",
    dateOfJoining: new Date(),
    isActive: true,
};

const createAdminUser = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({
            $or: [
                { iCardNumber: adminUser.iCardNumber },
                { email: adminUser.email },
                { mobile: adminUser.mobile },
            ],
        });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }

        await User.create(adminUser);
        console.log("Admin user created successfully.");
        console.log(`Login email: ${adminUser.email}`);
        console.log(`Password: ${adminUser.password}`);
    } catch (error) {
        console.error("Failed to create admin user:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

createAdminUser();
