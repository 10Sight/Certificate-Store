import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadSkillFile, uploadCertificate } from "../controllers/upload.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authrization.middleware.js";

const router = Router();

router.route("/skill-file").post(verifyJWT, authorizeRoles("ADMIN"), upload.array("files"), uploadSkillFile);
router.route("/certificate").post(verifyJWT, authorizeRoles("ADMIN"), upload.single("certificate"), uploadCertificate);

export default router;
