import Review from "../models/Review.js";
import mongoose from "mongoose";
import Request from "../models/Request.js";
import User from "../models/user.model.js";

// ⭐ Create a new review
export const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { reviewedUserId, requestId, rating, comment } = req.body;

    // Validation
    if (!reviewedUserId || !requestId || !rating) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check request completion before review
    const request = await Request.findById(requestId);
    if (!request || request.status.toLowerCase() !== "completed")  {
      return res
        .status(400)
        .json({ message: "You can only review completed swaps." });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      requestId,
    });

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this swap." });
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewedUser: reviewedUserId,
      requestId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully!",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Error creating review." });
  }
};

// 📊 Get all reviews for a user
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "name email")
      .populate("requestId", "skillOffered skillWanted")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Error fetching reviews." });
  }
};

// ⭐ Calculate average rating for a user
export const getAverageRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const avg = await Review.aggregate([
      { $match: { reviewedUser: { $eq: new mongoose.Types.ObjectId(userId) } } },
      {
        $group: {
          _id: "$reviewedUser",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (avg.length === 0)
      return res.json({ success: true, averageRating: 0, totalReviews: 0 });

    res.json({
      success: true,
      averageRating: avg[0].averageRating.toFixed(1),
      totalReviews: avg[0].totalReviews,
    });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.status(500).json({ message: "Error calculating rating." });
  }
};

// ❌ Delete review (Admin only)
// export const deleteReview = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const review = await Review.findById(id);
//     if (!review) {
//       return res.status(404).json({ message: "Review not found." });
//     }

//     await review.deleteOne();
//     res.json({ success: true, message: "Review deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting review:", error);
//     res.status(500).json({ message: "Error deleting review." });
//   }
// };
