// routes/userRoutes.js
import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserDashboardStats,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Profile Routes
router.get("/:id", protect, getUserProfile);
router.put("/update", protect, updateUserProfile);
router.get("/dashboard/stats", protect, getUserDashboardStats);

export default router;
