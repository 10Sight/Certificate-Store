import { Router } from "express";
import {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} from "../controllers/department.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authrization.middleware.js";

const router = Router();

router.route("/")
    .get(verifyJWT, getAllDepartments)
    .post(verifyJWT, authorizeRoles("ADMIN"), createDepartment);

router.route("/:id")
    .get(verifyJWT, getDepartmentById)
    .put(verifyJWT, authorizeRoles("ADMIN"), updateDepartment)
    .delete(verifyJWT, authorizeRoles("ADMIN"), deleteDepartment);

export default router;
