import express from "express";
import {
  createKnowledge,
  getAllKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
} from "../controllers/knowledge.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authrization.middleware.js";

const protect = verifyJWT;

const router = express.Router();

router.post("/", protect, authorizeRoles("ADMIN"), createKnowledge);
router.get("/", protect, getAllKnowledge);
router.get("/:id", protect, getKnowledgeById);
router.put("/:id", protect, authorizeRoles("ADMIN"), updateKnowledge);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteKnowledge);

export default router;
