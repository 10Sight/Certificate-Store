import { Schema, model } from 'mongoose';

const assessmentDataSchema = new Schema({
    subject: { type: String, required: true },
    maxWorks: { type: Number, required: true },
    scored: { type: Number, required: true },
    rating: { type: Number, required: true },
    type: { type: String, enum: ['Knowledge', 'Skill'], default: 'Knowledge' } // To separate in UI
});

const assessmentResultSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    template: {
        type: Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department'
    },
    categoryType: {
        type: String,
        enum: ['Knowledge', 'Skill'],
        default: 'Skill'
    },
    categoryReference: {
        type: Schema.Types.ObjectId,
        refPath: 'categoryType'
    },
    totalScore: {
        type: Number,
        required: true
    },
    totalMaxScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    resultStatus: {
        type: String,
        enum: ['PASS', 'FAIL'],
        default: 'PASS'
    },
    // Detailed breakdown for the card
    evaluationData: [assessmentDataSchema],

    // Raw Question Data for history/audit
    answers: [{
        questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
        isCorrect: Boolean,
        weightage: Number
    }]
}, {
    timestamps: true
});

export default model('AssessmentResult', assessmentResultSchema);
