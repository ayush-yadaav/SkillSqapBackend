import express from "express";
import {
  getUserStats,
  getDetailedStatInfo,
  getGlobalAnalytics,
} from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📊 Get user dashboard stats
router.get("/user", protect, getUserStats);

// 🧩 Get detailed info for clicked stat
router.get("/user/detail/:type", protect, getDetailedStatInfo);

// 🧾 Get global analytics (admin dashboard)
router.get("/global", protect, getGlobalAnalytics);

export default router;
