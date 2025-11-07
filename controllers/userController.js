// controllers/userController.js
import User from "../models/user.model.js";

// ✅ Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update logged-in user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, about, profilePic, teachSkills, learnSkills, socialLinks } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.about = about || user.about;
    user.profilePic = profilePic || user.profilePic;
    user.teachSkills = teachSkills || user.teachSkills;
    user.learnSkills = learnSkills || user.learnSkills;
    user.socialLinks = socialLinks || user.socialLinks;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get dashboard stats
export const getUserDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "totalSwaps completedSwaps averageRating reviewsCount"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      totalSwaps: user.totalSwaps,
      completedSwaps: user.completedSwaps,
      averageRating: user.averageRating,
      reviewsCount: user.reviewsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
