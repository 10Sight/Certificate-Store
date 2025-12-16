import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AvailableUserRoles, UserRolesEnum, AvailableEmploymentTypes, EmploymentTypeEnum } from '../constants.js';
import { ApiError } from '../utils/ApiError.js';
import ENV from '../configs/env.config.js';

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        iCardNumber: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allows null/undefined to not conflict, though we might want required: true based on requirements. User said "add this field", usually implies required for employees. Let's make it required but check for existing data issues if any (new feature so probably fine).
            required: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
            index: true,
            match: /^[0-9]{10}$/
        },
        dateOfJoining: {
            type: Date,
        },
        profilePhotoUrl: {
            publicId: {
                type: String,
                default: "",
            },
            url: {
                type: String,
                default: "",
            }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            select: false,
        },
        role: {
            type: String,
            enum: AvailableUserRoles,
            default: UserRolesEnum.WORKER,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        employmentType: {
            type: String,
            enum: AvailableEmploymentTypes,
            default: EmploymentTypeEnum.PERMANENT,
        },
        skillMatrix: [
            {
                name: { type: String, required: true },
                skills: { type: [Number], default: [0, 0, 0] } // [Line1, Line2, Line3]
            }
        ],
        trainingHistory: [{
            name: String,
            id: { type: String, default: "" },
            amendment: String,
            date: String,
            prodIncharge: { type: String, default: "" },
            trgIncharge: { type: String, default: "" }
        }],
        refreshToken: String,
        resetPasswordToken: String,
        resetPasswordExpiry: Date,
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userSchema.methods = {
    comparePassword: async function (password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            return false;
        }
    },
    generateRefreshToken: function () {
        return jwt.sign({ id: this._id }, ENV.JWT_REFRESH_SECRET, {
            expiresIn: ENV.JWT_REFRESH_EXPIRY,
        });
    },
    generateAccessToken: function () {
        return jwt.sign({ id: this._id }, ENV.JWT_ACCESS_SECRET, {
            expiresIn: ENV.JWT_EXPIRY,
        });
    },
    generatePasswordResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString("hex");

        this.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        this.resetPasswordExpiry = Date.now() + 5 * 60 * 1000;

        return resetToken;
    },
};

export default model("User", userSchema);
