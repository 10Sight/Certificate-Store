import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";

export const uploadSkillFile = asyncHandler(async (req, res) => {
    // 1. Check if file exists
    if (!req.file) {
        throw new ApiError("No file uploaded", 400);
    }

    const localFilePath = req.file.path;
    const originalName = req.file.originalname;

    // 2. Parse filename: "line-number_mobile-number_process-name.ext"
    // Remove extension first
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const parts = nameWithoutExt.split('_');

    if (parts.length < 3) {
        // Cleanup and error
        // We might want to upload to cloudinary anyway if it's just a file storage, 
        // but user specific requirement implies this is for skill update.
        // Let's assume strict validation.
        throw new ApiError("Invalid filename format. Expected: line-N_mobile_process-name", 400);
    }

    const linePart = parts[0].toLowerCase(); // "line-1"
    const mobile = parts[1]; // "8789875486"
    // Process name might contain underscores? Requirement says "process-name", usually hyphens. 
    // If user uses underscores in process name, split might break. 
    // Assuming process name is the REST of the string if > 3 parts, or just the 3rd part.
    // Let's assume standard 3 parts for now as per example.
    const processNameRaw = parts.slice(2).join('_'); // re-join rest if any

    // 3. Validate components
    if (!linePart.startsWith('line-')) {
        throw new ApiError("Invalid line format. Expected 'line-N'", 400);
    }
    const lineNumber = parseInt(linePart.split('-')[1]);
    if (isNaN(lineNumber) || lineNumber < 1 || lineNumber > 3) {
        throw new ApiError("Invalid line number. Must be 1, 2, or 3", 400);
    }

    // 4. Find User
    const user = await User.findOne({ mobile });
    if (!user) {
        throw new ApiError(`User with mobile ${mobile} not found`, 404);
    }

    // 5. Upload to Cloudinary
    const avatar = await uploadOnCloudinary(localFilePath);
    if (!avatar) {
        throw new ApiError("Failed to upload file to cloud", 500);
    }

    // 6. Update Skill Matrix
    const processName = processNameRaw.toUpperCase().replace(/-/g, ' '); // "screw-tightning" -> "SCREW TIGHTNING" (User said "screw-tightning", usually skills displayed with spaces, let's keep it normalized uppercase. Requirement said "uppercase... like SCREW-TIGHTNING". I will keep hyphens if they want, or replace. The example in skill card had spaces "SCREW TIGHTENING". I'll replace hyphens with spaces for better display, or just Upper.)
    // Let's do Upper and Replace Hyphens with Spaces for match? Or just Upper.
    // User said: "process-name user will enter any name like "screw-tightning" ... field in skill card like screw-tightning have to field in uppercase"
    // It implies "SCREW-TIGHTNING".
    const normalizedProcessName = processNameRaw.toUpperCase();

    // Find if process exists in user's skillMatrix
    // Access skillMatrix directly.
    let processIndex = -1;

    // Ensure skillMatrix exists (it's in schema default, but good to check)
    if (!user.skillMatrix) user.skillMatrix = [];

    processIndex = user.skillMatrix.findIndex(p => p.name === normalizedProcessName);

    // Line 1 -> Index 0, Line 2 -> Index 1, Line 3 -> Index 2
    const targetIndex = lineNumber - 1;

    if (processIndex !== -1) {
        // Process exists, increment the specific skill index
        const currentSkills = user.skillMatrix[processIndex].skills || [0, 0, 0];
        // Increment level, max 4
        // Logic: if current is 0 -> 1, 1 -> 2 ... 4 -> 4
        const currentLevel = currentSkills[targetIndex] || 0;
        const newLevel = Math.min(currentLevel + 1, 4);

        currentSkills[targetIndex] = newLevel;
        user.skillMatrix[processIndex].skills = currentSkills;
    } else {
        // New process
        const newSkills = [0, 0, 0];
        // Start at level 1
        newSkills[targetIndex] = 1;
        user.skillMatrix.push({
            name: normalizedProcessName,
            skills: newSkills
        });
    }

    // Add to Training History
    // Format: Amendment L-{line}, Date DD/MM/YYYY
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    user.trainingHistory.push({
        name: normalizedProcessName,
        id: "", // Editable by user later
        amendment: `LINE-${lineNumber}`,
        date: formattedDate,
        prodIncharge: "", // Editable
        trgIncharge: "" // Editable
    });

    // Save user
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                url: avatar.url,
                process: normalizedProcessName,
                line: lineNumber,
                user: user.fullName
            },
            "File uploaded and skill matrix updated successfully"
        )
    );
});

export const uploadCertificate = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError("No file uploaded", 400);
    }

    // Upload to Cloudinary
    const certificate = await uploadOnCloudinary(req.file.path);

    if (!certificate) {
        throw new ApiError("Failed to upload file to cloud", 500);
    }

    res.status(200).json(
        new ApiResponse(200, { url: certificate.url, publicId: certificate.public_id }, "Certificate uploaded successfully")
    );
});
