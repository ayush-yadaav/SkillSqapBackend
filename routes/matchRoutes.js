import express from "express";
import { getSuggestedMatches, filterMatches } from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET suggested matches
router.get("/suggested", protect, getSuggestedMatches);

// GET filtered matches
router.get("/filter", protect, filterMatches);

export default router;
