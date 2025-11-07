import Request from "../models/Request.js";
import Review from "../models/Review.js";
import User from "../models/user.model.js";

// 📊 Get overall user dashboard stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Requests stats
    const totalRequests = await Request.countDocuments({
      $or: [{ from: userId }, { to: userId }],
    });

    const activeSwaps = await Request.countDocuments({
      $or: [{ from: userId }, { to: userId }],
      status: "active",
    });

    const completedSwaps = await Request.countDocuments({
      $or: [{ from: userId }, { to: userId }],
      status: "completed",
    });

    // Review stats
    const totalReviews = await Review.countDocuments({
      reviewedUser: userId,
    });

    const avgRatingResult = await Review.aggregate([
      { $match: { reviewedUser: { $eq: req.user._id } } },
      {
        $group: {
          _id: "$reviewedUser",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating =
      avgRatingResult.length > 0
        ? Number(avgRatingResult[0].avgRating.toFixed(1))
        : 0;

    res.json({
      success: true,
      data: {
        totalRequests,
        activeSwaps,
        completedSwaps,
        totalReviews,
        avgRating,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats." });
  }
};

// 🧩 Get detailed info of users related to a specific stat
export const getDetailedStatInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params; // "active", "completed", "reviewed"

    let data = [];

    if (type === "active") {
      data = await Request.find({
        $or: [{ from: userId }, { to: userId }],
        status: "active",
      })
        .populate("from", "name email teachSkills learnSkills")
        .populate("to", "name email teachSkills learnSkills")
        .sort({ updatedAt: -1 });
    }

    if (type === "completed") {
      data = await Request.find({
        $or: [{ from: userId }, { to: userId }],
        status: "completed",
      })
        .populate("from", "name email teachSkills learnSkills")
        .populate("to", "name email teachSkills learnSkills")
        .sort({ updatedAt: -1 });
    }

    if (type === "reviewed") {
      data = await Review.find({ reviewer: userId })
        .populate("reviewedUser", "name email teachSkills learnSkills")
        .populate("requestId", "status skillOffered skillWanted")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching detailed stat info:", error);
    res.status(500).json({ message: "Error fetching detailed info." });
  }
};

// 🧾 Get global app analytics (for Admin Dashboard)
export const getGlobalAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await Request.countDocuments();
    const completedRequests = await Request.countDocuments({ status: "completed" });
    const activeRequests = await Request.countDocuments({ status: "active" });
    const totalReviews = await Review.countDocuments();

    const avgRatingResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating =
      avgRatingResult.length > 0
        ? Number(avgRatingResult[0].avgRating.toFixed(1))
        : 0;

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalRequests,
        activeRequests,
        completedRequests,
        totalReviews,
        avgRating,
      },
    });
  } catch (error) {
    console.error("Error fetching global analytics:", error);
    res.status(500).json({ message: "Error fetching analytics." });
  }
};
