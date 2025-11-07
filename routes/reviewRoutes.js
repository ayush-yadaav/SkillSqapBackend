import express from "express";
import {
  createReview,
  getUserReviews,
  getAverageRating,
//   deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create review (after completed swap)
router.post("/create", protect, createReview);

// Get all reviews for a user
router.get("/user/:userId", getUserReviews);

// Get average rating
router.get("/user/:userId/average", getAverageRating);

// Delete review (admin only)
// router.delete("/:id", protect, adminOnly, deleteReview);

export default router;
