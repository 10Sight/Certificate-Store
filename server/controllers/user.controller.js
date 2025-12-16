
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { accessTokenOptions, refreshTokenOptions } from "../utils/constant.js";
import { AvailableUserRoles, AvailableEmploymentTypes } from '../constants.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import validator from "validator";


export const generateAuthTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
    } catch (error) {
        throw new ApiError(error.message, 500);
    }
};

export const register = asyncHandler(async (req, res) => {
    let { fullName, mobile, dateOfJoining, email, password, role = "WORKER", employmentType = "PERMANENT", iCardNumber } = req.body;

    if (!fullName || !mobile || !dateOfJoining || !email || !password || !iCardNumber) {
        throw new ApiError("All fields are required", 400);
    }

    if (!validator.isEmail(email)) {
        throw new ApiError("Invalid email address", 400);
    }

    if (password.length < 6) {
        throw new ApiError("Password must be at least 6 characters long", 400);
    }

    email = email.toLowerCase();

    const emailExists = await User.findOne({ email });
    if (emailExists) throw new ApiError("Email already in use", 400);

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) throw new ApiError("Mobile already in use", 400);

    const iCardExists = await User.findOne({ iCardNumber });
    if (iCardExists) throw new ApiError("I-Card Number already in use", 400);

    if (!AvailableUserRoles.includes(role)) {
        throw new ApiError("Invalid role provided", 400);
    }

    if (!AvailableEmploymentTypes.includes(employmentType)) {
        throw new ApiError("Invalid employment type provided", 400);
    }

    let profilePhotoUrl = { publicId: "", url: "" };
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (uploaded) {
            profilePhotoUrl = { publicId: uploaded.public_id, url: uploaded.url };
        }
    }

    const user = await User.create({ fullName, email, mobile, dateOfJoining, role, password, employmentType, iCardNumber, profilePhotoUrl });
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return res
        .status(201)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                201,
                { user, accessToken, refreshToken },
                "User registered successfully"
            )
        );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/users/login
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {JSON} - User data and tokens
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError("Invalid email or password", 401);
    }

    if (user.role !== 'ADMIN') {
        throw new ApiError("Access Denied: Only Admins can login.", 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError("Invalid email or password", 401);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

/**
 * @desc    Get all users with pagination, filtering, and searching
 * @route   GET /api/v1/users
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {JSON} - Paginated list of users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, role, employmentType, dateOfJoining, isActive } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };
    const skip = (options.page - 1) * options.limit;

    const filter = {};

    // Search by fullName or email
    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by role
    if (role) {
        filter.role = role;
    }

    // Filter by employmentType
    if (employmentType) {
        filter.employmentType = employmentType;
    }

    // Filter by dateOfJoining
    if (dateOfJoining) {
        // Assuming dateOfJoining is stored as Date object. 
        // We match exactly the date, or simplified: from start of that day to end.
        const date = new Date(dateOfJoining);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        filter.dateOfJoining = {
            $gte: date,
            $lt: nextDay
        };
    }

    // Filter by active status
    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
        .select("-password -refreshToken") // Exclude sensitive info
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    totalDocs: totalUsers,
                    limit: options.limit,
                    totalPages: Math.ceil(totalUsers / options.limit),
                    page: options.page,
                    hasNextPage: options.page < Math.ceil(totalUsers / options.limit),
                    hasPrevPage: options.page > 1
                }
            },
            "Users fetched successfully"
        )
    );
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {JSON} - User details
 */
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validator.isMongoId(id)) {
        throw new ApiError("Invalid user ID", 400);
    }

    const user = await User.findById(id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User fetched successfully"
        )
    );
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {JSON} - Success message
 */
export const deleteUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!validator.isMongoId(id)) {
        throw new ApiError("Invalid user ID", 400);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "User deleted successfully"
        )
    );
});

/**
 * @desc    Delete multiple users
 * @route   DELETE /api/v1/users
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {JSON} - Success message with count
 */
export const deleteUsers = asyncHandler(async (req, res) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError("User IDs array is required", 400);
    }

    // Validate all IDs
    const invalidIds = userIds.filter(id => !validator.isMongoId(id));
    if (invalidIds.length > 0) {
        throw new ApiError(`Invalid user IDs found: ${invalidIds.join(", ")} `, 400);
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    return res.status(200).json(
        new ApiResponse(
            200,
            { deletedCount: result.deletedCount },
            `${result.deletedCount} users deleted successfully`
        )
    );
});

/**
 * @desc    Update user details
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {JSON} - Updated user data
 */
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let { fullName, mobile, dateOfJoining, email, role, employmentType, iCardNumber, isActive } = req.body;

    if (!validator.isMongoId(id)) {
        throw new ApiError("Invalid user ID", 400);
    }

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Uniqueness checks if fields are modified
    if (email && email !== user.email) {
        if (!validator.isEmail(email)) {
            throw new ApiError("Invalid email address", 400);
        }
        const emailExists = await User.findOne({ email });
        if (emailExists) throw new ApiError("Email already in use", 400);
        user.email = email.toLowerCase();
    }

    if (mobile && mobile !== user.mobile) {
        const mobileExists = await User.findOne({ mobile });
        if (mobileExists) throw new ApiError("Mobile already in use", 400);
        user.mobile = mobile;
    }

    if (iCardNumber && iCardNumber !== user.iCardNumber) {
        const iCardExists = await User.findOne({ iCardNumber });
        if (iCardExists) throw new ApiError("I-Card Number already in use", 400);
        user.iCardNumber = iCardNumber;
    }

    // Handle File Upload
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (uploaded) {
            user.profilePhotoUrl = { publicId: uploaded.public_id, url: uploaded.url };
        }
    }

    if (fullName) user.fullName = fullName;
    if (dateOfJoining) user.dateOfJoining = dateOfJoining;
    if (role && AvailableUserRoles.includes(role)) user.role = role;
    if (employmentType && AvailableEmploymentTypes.includes(employmentType)) user.employmentType = employmentType;
    if (isActive !== undefined) user.isActive = isActive;
    if (req.body.trainingHistory) user.trainingHistory = req.body.trainingHistory;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User updated successfully"
        )
    );
});