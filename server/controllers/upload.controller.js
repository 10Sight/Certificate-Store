import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";

export const uploadSkillFile = asyncHandler(async (req, res) => {
    // 1. Check if files exist
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files uploaded");
    }

    const uploadResults = [];
    const errors = [];

    for (const file of req.files) {
        const localFilePath = file.path;
        const originalName = file.originalname;

        try {
            // 2. Parse filename: "line-number_mobile-number_process-name.ext"
            const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
            const parts = nameWithoutExt.split('_');

            if (parts.length < 3) {
                if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
                errors.push({ file: originalName, error: "Invalid filename format. Expected: line-N_mobile_process-name" });
                continue;
            }

            const linePart = parts[0].toLowerCase();
            const mobile = parts[1];
            const processNameRaw = parts.slice(2).join('_');

            // 3. Validate components
            if (!linePart.startsWith('line-')) {
                if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
                errors.push({ file: originalName, error: "Invalid line format. Expected 'line-N'" });
                continue;
            }
            const lineNumber = parseInt(linePart.split('-')[1]);
            if (isNaN(lineNumber) || lineNumber < 1 || lineNumber > 3) {
                if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
                errors.push({ file: originalName, error: "Invalid line number. Must be 1, 2, or 3" });
                continue;
            }

            // 4. Find User
            const user = await User.findOne({ mobile });
            if (!user) {
                if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
                errors.push({ file: originalName, error: `User with mobile ${mobile} not found` });
                continue;
            }

            // 5. Upload to Cloudinary
            const avatar = await uploadOnCloudinary(localFilePath);
            if (!avatar) {
                errors.push({ file: originalName, error: "Failed to upload file to cloud" });
                continue;
            }

            // 6. Update Skill Matrix
            const normalizedProcessName = processNameRaw.toUpperCase();
            if (!user.skillMatrix) user.skillMatrix = [];
            const processIndex = user.skillMatrix.findIndex(p => p.name === normalizedProcessName);
            const targetIndex = lineNumber - 1;

            if (processIndex !== -1) {
                const currentSkills = user.skillMatrix[processIndex].skills || [0, 0, 0];
                const currentLevel = currentSkills[targetIndex] || 0;
                const newLevel = Math.min(currentLevel + 1, 4);
                currentSkills[targetIndex] = newLevel;
                user.skillMatrix[processIndex].skills = currentSkills;
            } else {
                const newSkills = [0, 0, 0];
                newSkills[targetIndex] = 1;
                user.skillMatrix.push({ name: normalizedProcessName, skills: newSkills });
            }

            // 7. Add to Training History
            const today = new Date();
            const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
            user.trainingHistory.push({
                name: normalizedProcessName,
                id: "",
                amendment: `LINE-${lineNumber}`,
                date: formattedDate,
                prodIncharge: "",
                trgIncharge: ""
            });

            await user.save({ validateBeforeSave: false });
            uploadResults.push({
                file: originalName,
                process: normalizedProcessName,
                line: lineNumber,
                user: user.fullName
            });

        } catch (error) {
            if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
            errors.push({ file: originalName, error: error.message });
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { results: uploadResults, errors },
            `Processed ${req.files.length} files. ${uploadResults.length} succeeded, ${errors.length} failed.`
        )
    );
});

export const uploadCertificate = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    // Upload to Cloudinary
    const certificate = await uploadOnCloudinary(req.file.path);

    if (!certificate) {
        throw new ApiError(500, "Failed to upload file to cloud");
    }

    res.status(200).json(
        new ApiResponse(200, { url: certificate.url, publicId: certificate.public_id }, "Certificate uploaded successfully")
    );
});
