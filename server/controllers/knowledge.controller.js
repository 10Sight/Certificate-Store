import knowledgeModel from "../models/knowledge.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createKnowledge = asyncHandler(async (req, res) => {
    const { name, description, department } = req.body;

    if (!department) {
        throw new ApiError(400, "Department is required");
    }

    // Check if knowledge with the same name already exists in this department
    const existingKnowledge = await knowledgeModel.findOne({ name: name.trim(), department });
    if (existingKnowledge) {
        throw new ApiError(400, "Knowledge with this name already exists in this department");
    }
    const knowledge = new knowledgeModel({
        name: name.trim(),
        description,
        department,
        createdBy: req.user._id,
    });
    await knowledge.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            knowledge,
            "Knowledge created successfully"
        )
    );
});

export const getAllKnowledge = asyncHandler(async (req, res) => {
    const { department } = req.query;
    const filter = {};
    if (department) filter.department = department;

    const knowledgeList = await knowledgeModel.find(filter).populate('createdBy', 'fullName email').populate('department', 'name');

    return res.status(200).json(
        new ApiResponse(
            200,
            knowledgeList,
            "Knowledge list fetched successfully"
        )
    );
});

export const getKnowledgeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const knowledge = await knowledgeModel.findById(id).populate('createdBy', 'fullName email');

    if (!knowledge) {
        throw new ApiError(404, "Knowledge not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            knowledge,
            "Knowledge fetched successfully"
        )
    );
});

export const updateKnowledge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const knowledge = await knowledgeModel.findById(id);

    if (!knowledge) {
        throw new ApiError(404, "Knowledge not found");
    }
    knowledge.name = name ? name.trim() : knowledge.name;
    knowledge.description = description !== undefined ? description : knowledge.description;
    knowledge.isActive = isActive !== undefined ? isActive : knowledge.isActive;

    await knowledge.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            knowledge,
            "Knowledge updated successfully"
        )
    );
});

export const deleteKnowledge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await knowledgeModel.findByIdAndDelete(id);
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Knowledge deleted successfully"
        )
    );
});

export const deactivateKnowledge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const knowledge = await knowledgeModel.findById(id);
    if (!knowledge) {
        throw new ApiError(404, "Knowledge not found");
    }
    knowledge.isActive = false;
    await knowledge.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            knowledge,
            "Knowledge deactivated successfully"
        )
    );
});

export const activateKnowledge = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const knowledge = await knowledgeModel.findById(id);
    if (!knowledge) {
        throw new ApiError(404, "Knowledge not found");
    }
    knowledge.isActive = true;
    await knowledge.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            knowledge,
            "Knowledge activated successfully"
        )
    );
});

