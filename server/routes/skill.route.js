import { Router } from "express";
import {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
    getSkillsByDepartment
} from "../controllers/skill.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authrization.middleware.js";

const router = Router();

// Apply JWT verification to all routes if needed, or per route
router.route("/")
    .get(verifyJWT, getAllSkills)
    .post(verifyJWT, authorizeRoles("ADMIN"), createSkill);

router.route("/:id")
    .get(verifyJWT, getSkillById)
    .put(verifyJWT, authorizeRoles("ADMIN"), updateSkill)
    .delete(verifyJWT, authorizeRoles("ADMIN"), deleteSkill);

router.route("/department/:departmentId")
    .get(verifyJWT, getSkillsByDepartment);

export default router;
