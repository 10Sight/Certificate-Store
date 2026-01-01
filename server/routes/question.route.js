import { Router } from "express";
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    deactivateQuestion
} from "../controllers/question.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authrization.middleware.js";

const router = Router();

router.route("/")
    .get(verifyJWT, getAllQuestions)
    .post(verifyJWT, authorizeRoles("ADMIN"), createQuestion);

router.route("/:id")
    .get(verifyJWT, getQuestionById)
    .put(verifyJWT, authorizeRoles("ADMIN"), updateQuestion)
    .delete(verifyJWT, authorizeRoles("ADMIN"), deleteQuestion);

// Specific route for deactivate if needed separate from delete
router.route("/deactivate/:id")
    .patch(verifyJWT, authorizeRoles("ADMIN"), deactivateQuestion);

export default router;
