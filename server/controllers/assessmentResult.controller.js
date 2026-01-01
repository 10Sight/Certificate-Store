import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import AssessmentResult from '../models/assessmentResult.model.js';
import Template from '../models/template.model.js';
import User from '../models/user.model.js';
import logger from '../logger/winston.logger.js';
import Skill from '../models/skill.model.js';

export const createAssessmentResult = asyncHandler(async (req, res) => {
    const { userId, templateId, deductions, questions, totalMaxScore } = req.body;
    logger.info(`Creating Assessment Result for user: ${userId}, template: ${templateId}`);

    // deductions is an object { questionId: deductedAmount }
    // questions is array of question objects (to get weightage/text/section)

    if (!userId || !templateId) {
        logger.error("Missing userId or templateId");
        throw new ApiError(400, "User ID and Template ID are required");
    }

    const user = await User.findById(userId);
    if (!user) {
        logger.error(`User not found: ${userId}`);
        throw new ApiError(404, "User not found");
    }

    const template = await Template.findById(templateId).populate('categoryReference');
    if (!template) {
        logger.error(`Template not found: ${templateId}`);
        throw new ApiError(404, "Template not found");
    }

    const categoryType = template?.categoryType || 'Skill';
    const categoryReference = template?.categoryReference?._id || template?.categoryReference;
    const departmentId = user.department;

    logger.info(`Processing ${questions?.length} questions for category: ${categoryType}`);

    let subjectName = "General Assessment";
    if (template?.categoryReference) {
        subjectName = template.categoryReference.name;
    }

    // Process Answers
    let totalScore = 0;
    let actualMaxScore = 0;
    const answerDetails = [];

    // Group by Section for Evaluation Data
    // sections: { "SectionName": { max: 0, scored: 0, type: 'Knowledge' } }
    const sections = {};

    questions.forEach(q => {
        const weight = Number(q.weightage) || 1;
        const deduction = Number(deductions[q._id]) || 0;
        const score = Math.max(0, weight - deduction);
        const isCorrect = deduction === 0; // Assuming 0 deduction means correct

        actualMaxScore += weight;
        totalScore += score;

        answerDetails.push({
            questionId: q._id,
            isCorrect,
            weightage: weight
        });

        // Grouping
        const sectionName = q.section || q.department?.name || subjectName || "General";
        if (!sections[sectionName]) {
            sections[sectionName] = { max: 0, scored: 0, type: categoryType };
            // Using categoryType (Knowledge or Skill) to categorize evaluaton data correctly
        }
        sections[sectionName].max += weight;
        sections[sectionName].scored += score;
    });

    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
    const resultStatus = percentage >= 60 ? 'PASS' : 'FAIL'; // 60% Passing mark example

    // Construct Evaluation Data
    const evaluationData = Object.keys(sections).map(key => {
        const sec = sections[key];
        // Rating out of 5 (or 4 based on chart)
        // Chart uses max 4. User request: "rating that have to calculating automatically"
        // Let's normalize to 4.0 scale
        const rating = sec.max > 0 ? (sec.scored / sec.max) * 4 : 0;

        return {
            subject: key,
            maxWorks: sec.max,
            scored: sec.scored,
            rating: parseFloat(rating.toFixed(2)) || 0,
            type: sec.type
        };
    });

    // If "Skill Evaluation" is empty, maybe force one?
    // User requested "Skill Subject column that have to skill name".
    // If questions were grouped by "General", let's rename it to the Skill Name if available.
    // If evaluationData is empty or just "General", let's ensure it has a meaningful subject
    if (evaluationData.length === 1 && evaluationData[0].subject === "General" && subjectName !== "General Assessment") {
        evaluationData[0].subject = subjectName;
    }

    try {
        const result = await AssessmentResult.create({
            user: userId,
            template: templateId,
            department: departmentId,
            categoryType,
            categoryReference,
            totalScore,
            totalMaxScore: actualMaxScore, // Use calculated max to be safe
            percentage,
            resultStatus,
            evaluationData,
            answers: answerDetails
        });

        logger.info(`Assessment Result saved successfully: ${result._id}`);
        return res.status(201).json(
            new ApiResponse(201, result, "Assessment Result saved successfully")
        );
    } catch (dbError) {
        logger.error("Database error while saving assessment result:", dbError);
        throw new ApiError(500, "Failed to save assessment result to database");
    }
});

export const updateAssessmentResult = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { deductions, questions, totalMaxScore } = req.body;

    logger.info(`Updating Assessment Result: ${id}`);

    const result = await AssessmentResult.findById(id);
    if (!result) {
        logger.error(`Assessment Result not found: ${id}`);
        throw new ApiError(404, "Assessment result not found");
    }

    const template = await Template.findById(result.template).populate('categoryReference');
    const categoryType = template?.categoryType || 'Skill';
    const subjectName = template?.categoryReference?.name || "General Assessment";

    // Re-calculate scores
    let totalScore = 0;
    let actualMaxScore = 0;
    const answerDetails = [];
    const sections = {};

    questions.forEach(q => {
        const weight = Number(q.weightage) || 1;
        const deduction = Number(deductions[q._id]) || 0;
        const score = Math.max(0, weight - deduction);
        const isCorrect = deduction === 0;

        actualMaxScore += weight;
        totalScore += score;

        answerDetails.push({
            questionId: q._id,
            isCorrect,
            weightage: weight
        });

        const sectionName = q.section || q.department?.name || subjectName || "General";
        if (!sections[sectionName]) {
            sections[sectionName] = { max: 0, scored: 0, type: categoryType };
        }
        sections[sectionName].max += weight;
        sections[sectionName].scored += score;
    });

    const percentage = actualMaxScore > 0 ? (totalScore / actualMaxScore) * 100 : 0;
    const resultStatus = percentage >= 60 ? 'PASS' : 'FAIL';

    const evaluationData = Object.keys(sections).map(key => {
        const sec = sections[key];
        const rating = sec.max > 0 ? (sec.scored / sec.max) * 4 : 0;

        return {
            subject: key,
            maxWorks: sec.max,
            scored: sec.scored,
            rating: parseFloat(rating.toFixed(2)) || 0,
            type: sec.type
        };
    });

    // Update fields
    result.deductions = deductions; // Note: You might want to store raw deductions in the model too if needed for re-edit
    result.totalScore = totalScore;
    result.totalMaxScore = actualMaxScore;
    result.percentage = percentage;
    result.resultStatus = resultStatus;
    result.evaluationData = evaluationData;
    result.answers = answerDetails;

    await result.save();

    logger.info(`Assessment Result updated successfully: ${result._id}`);
    return res.status(200).json(
        new ApiResponse(200, result, "Assessment Result updated successfully")
    );
});

export const getAssessmentByTemplateAndUser = asyncHandler(async (req, res) => {
    const { templateId, userId } = req.params;

    const result = await AssessmentResult.findOne({
        user: userId,
        template: templateId
    }).populate('categoryReference');

    if (!result) {
        return res.status(200).json(new ApiResponse(200, null, "No assessment result found for this template"));
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Assessment result fetched successfully")
    );
});

export const getAllAssessmentResultsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const results = await AssessmentResult.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('template', 'name categoryType categoryReference')
        .populate('categoryReference');

    if (!results || results.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No assessment results found for this user"));
    }

    return res.status(200).json(
        new ApiResponse(200, results, "Assessment results fetched successfully")
    );
});

export const getLastAssessmentResult = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Find latest Knowledge Assessment
    const knowledgeResult = await AssessmentResult.findOne({
        user: userId,
        categoryType: 'Knowledge'
    })
        .sort({ createdAt: -1 })
        .populate('template', 'name timeLimit')
        .populate('categoryReference');

    // Find latest Skill Assessment
    const skillResult = await AssessmentResult.findOne({
        user: userId,
        categoryType: 'Skill'
    })
        .sort({ createdAt: -1 })
        .populate('template', 'name timeLimit')
        .populate('categoryReference');

    if (!knowledgeResult && !skillResult) {
        return res.status(200).json(new ApiResponse(200, null, "No assessment found"));
    }

    return res.status(200).json(
        new ApiResponse(200, {
            knowledge: knowledgeResult,
            skill: skillResult
        }, "Latest assessment results fetched")
    );
});
