import { Schema, model } from "mongoose";

const certificateSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        certificateName: {
            type: String,
            required: true,
            trim: true,
        },
        originalFileName: {
            type: String,
            required: true,
        },
        cloudinaryUrl: {
            type: String,
            required: true,
        },
        cloudinaryId: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            enum: ["PDF", "IMAGE"],
            required: true,
        },
        uploadedBy: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
            isActive: {
                type: Boolean, 
                default: true,
                index: true,
            },
        },
    },
    {
        timestamps: true
    }
);

certificateSchema.index({ user: 1, certificateName: 1 });

export default model("Certificate", certificateSchema);