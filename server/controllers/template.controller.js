import templateModel from "../models/template.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTemplate = asyncHandler(async (req, res) => {
    const { name, categoryType, categoryReference, questions, timeLimit } = req.body;

    if (!name || !categoryType || !categoryReference || !timeLimit) {
        throw new ApiError(400, "Name, Category Type, Category Reference, and Time Limit are required");
    }

    const template = await templateModel.create({
        name,
        categoryType,
        categoryReference,
        questions,
        timeLimit,
        createdBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, template, "Template created successfully")
    );
});

export const updateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, questions, timeLimit, isActive } = req.body;

    const template = await templateModel.findById(id);
    if (!template) {
        throw new ApiError(404, "Template not found");
    }

    if (name) template.name = name;
    if (questions) template.questions = questions;
    if (timeLimit) template.timeLimit = timeLimit;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    return res.status(200).json(
        new ApiResponse(200, template, "Template updated successfully")
    );
});

export const getTemplatesByCategory = asyncHandler(async (req, res) => {
    const { categoryType, categoryReference } = req.query;

    if (!categoryType || !categoryReference) {
        throw new ApiError(400, "categoryType and categoryReference are required");
    }

    // Sort by createdAt desc to get latest first
    const templates = await templateModel.find({ categoryType, categoryReference })
        .populate({
            path: 'questions'
        })
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, templates, "Templates fetched successfully")
    );
});

export const getAllTemplates = asyncHandler(async (req, res) => {
    const templates = await templateModel.find({})
        .populate('categoryReference')
        .populate('createdBy', 'fullName');

    return res.status(200).json(
        new ApiResponse(200, templates, "All templates fetched successfully")
    );
});

export const getTemplateById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const template = await templateModel.findById(id).populate('questions');
    if (!template) {
        throw new ApiError(404, "Template not found");
    }
    return res.status(200).json(
        new ApiResponse(200, template, "Template fetched successfully")
    );
});
