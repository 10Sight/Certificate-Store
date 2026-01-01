import { Schema, model } from 'mongoose';

const skillSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true
    }
);

export default model('Skill', skillSchema);