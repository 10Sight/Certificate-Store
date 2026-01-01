import skillModel from "../models/skill.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createSkill = asyncHandler(async (req, res) => {
    const { name, description, department } = req.body;

    if (!department) {
        throw new ApiError(400, "Department is required");
    }

    // Check if skill with the same name already exists in this department
    const existingSkill = await skillModel.findOne({ name: name.trim(), department });
    if (existingSkill) {
        throw new ApiError(400, "Skill with this name already exists in this department");
    }
    const skill = new skillModel({
        name: name.trim(),
        description,
        department,
        createdBy: req.user._id,
    });
    await skill.save();
    return res.status(201).json(
        new ApiResponse(
            201,
            skill,
            "Skill created successfully"
        )
    );
});

export const getAllSkills = asyncHandler(async (req, res) => {
    const { department } = req.query;
    const filter = {};
    if (department) filter.department = department;

    const skillList = await skillModel.find(filter).populate('createdBy', 'fullName email').populate('department', 'name');
    return res.status(200).json(
        new ApiResponse(
            200,
            skillList,
            "Skill list fetched successfully"
        )
    );
});

export const getSkillById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const skill = await skillModel.findById(id).populate('createdBy', 'fullName email');
    if (!skill) {
        throw new ApiError(404, "Skill not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            skill,
            "Skill fetched successfully"
        )
    );
});

export const updateSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const skill = await skillModel.findById(id);
    if (!skill) {
        throw new ApiError(404, "Skill not found");
    }
    skill.name = name ? name.trim() : skill.name;
    skill.description = description !== undefined ? description : skill.description;
    if (req.body.department) skill.department = req.body.department;
    skill.isActive = isActive !== undefined ? isActive : skill.isActive;
    await skill.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            skill,
            "Skill updated successfully"
        )
    );
});

export const deleteSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await skillModel.findByIdAndDelete(id);
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Skill deleted successfully"
        )
    );
});

export const getSkillsByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    const skills = await skillModel.find({ department: departmentId });
    return res.status(200).json(
        new ApiResponse(
            200,
            skills,
            "Skills fetched by department successfully"
        )
    );
});

