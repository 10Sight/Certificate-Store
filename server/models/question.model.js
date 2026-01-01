import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
    type: {
        type: String,
        enum: ['MCQ', 'TRUE_FALSE'],
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        default: 'General'
    },
    weightage: {
        type: Number,
        default: 1
    },
    options: [{
        type: String,
    }],
    correctAnswer: {
        type: Schema.Types.Mixed,
        required: true,
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
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true
});

questionSchema.pre('save', async function () {
    if (this.type === 'MCQ' && (!this.options || this.options.length < 2)) {
        throw new Error('MCQ type questions must have at least two options.');
    }
    if (this.type === 'TRUE_FALSE') {
        this.options = ['True', 'False'];
    }
});

export default model('Question', questionSchema);