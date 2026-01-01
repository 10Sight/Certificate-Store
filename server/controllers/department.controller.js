import departmentModel from "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createDepartment = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    // Check if department with the same name already exists
    const existingDepartment = await departmentModel.findOne({ name: name.trim() });
    if (existingDepartment) {
        throw new ApiError(400, "Department with this name already exists");
    }
    const department = new departmentModel({
        name: name.trim(),
        description,
        createdBy: req.user._id,
    });
    await department.save();
    return res.status(201).json(
        new ApiResponse(
            201,
            department,
            "Department created successfully"
        )
    );
});

export const getAllDepartments = asyncHandler(async (req, res) => {
    const departmentList = await departmentModel.find({}).populate('createdBy', 'fullName email');
    return res.status(200).json(
        new ApiResponse(
            200,
            departmentList,
            "Department list fetched successfully"
        )
    );
});

export const getDepartmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const department = await departmentModel.findById(id).populate('createdBy', 'fullName email');
    if (!department) {
        throw new ApiError(404, "Department not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            department,
            "Department fetched successfully"
        )
    );
});

export const updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const department = await departmentModel.findById(id);
    if (!department) {
        throw new ApiError(404, "Department not found");
    }
    department.name = name ? name.trim() : department.name;
    department.description = description !== undefined ? description : department.description;
    department.isActive = isActive !== undefined ? isActive : department.isActive;
    await department.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            department,
            "Department updated successfully"
        )
    );
});

export const deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await departmentModel.findByIdAndDelete(id);
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Department deleted successfully"
        )
    );
});