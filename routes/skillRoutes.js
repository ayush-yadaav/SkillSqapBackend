import express from "express";
import {
  upsertSkillProfile,
  getAllSkillProfiles,
  getUserSkillProfile,
  deleteSkillProfile,
} from "../controllers/skillController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST/PUT: Create or Update skill profile
router.post("/add", protect, upsertSkillProfile);

// GET: All profiles
router.get("/", protect, getAllSkillProfiles);

// GET: Single user profile
router.get("/user/:id", protect, getUserSkillProfile);

// DELETE: Delete profile
router.delete("/delete", protect, deleteSkillProfile);

export default router;
