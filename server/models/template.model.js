import { Schema, model } from 'mongoose';

const templateSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    categoryType: {
        type: String,
        enum: ['Knowledge', 'Skill'],
        required: true,
    },
    categoryReference: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'categoryType',
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
    timeLimit: {
        type: Number, // in minutes
        required: true,
        default: 90
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default model('Template', templateSchema);
