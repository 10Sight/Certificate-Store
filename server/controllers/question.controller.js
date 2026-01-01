import questionModel from "../models/question.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createQuestion = asyncHandler(async (req, res) => {
    const { text, options, correctOption, category, categoryType, categoryReference, section, weightage } = req.body;
    const question = new questionModel({
        questionText: text,
        options,
        correctAnswer: correctOption,
        categoryType,
        categoryReference,
        type: category, // This 'category' refers to MCQ/TRUE_FALSE in old code, confusing naming.
        section: section || 'General',
        weightage: weightage || 1,
        createdBy: req.user._id,
    });
    await question.save();
    return res.status(201).json(
        new ApiResponse(
            201,
            question,
            "Question created successfully"
        )
    );
});


export const getAllQuestions = asyncHandler(async (req, res) => {
    const { categoryType, categoryReference } = req.query;
    const query = {};
    if (categoryType) query.categoryType = categoryType;
    if (categoryReference) query.categoryReference = categoryReference;

    const questionList = await questionModel.find(query).populate('createdBy', 'fullName email').populate('categoryReference');
    return res.status(200).json(
        new ApiResponse(
            200,
            questionList,
            "Question list fetched successfully"
        )
    );
});

export const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const question = await questionModel.findById(id).populate('createdBy', 'fullName email');
    if (!question) {
        throw new ApiError(404, "Question not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            question,
            "Question fetched successfully"
        )
    );
});

export const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text, options, correctOption, category, department, isActive, section, weightage } = req.body;
    const question = await questionModel.findById(id);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }
    question.questionText = text || question.questionText;
    question.options = options || question.options;
    question.correctAnswer = correctOption || question.correctAnswer;
    question.type = category || question.type;
    if (categoryType) question.categoryType = categoryType;
    if (categoryReference) question.categoryReference = categoryReference;
    question.section = section || question.section;
    question.weightage = weightage !== undefined ? weightage : question.weightage;
    question.isActive = isActive !== undefined ? isActive : question.isActive;
    await question.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            question,
            "Question updated successfully"
        )
    );
});

export const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await questionModel.findByIdAndDelete(id);
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Question deleted successfully"
        )
    );
});

export const deactivateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const question = await questionModel.findById(id);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }
    question.isActive = false;
    await question.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Question deactivated successfully"
        )
    );
});