import User from "../models/user.model.js";
import SkillProfile from "../models/Skill.js";
import findMatches from "../utils/matchLogic.js"; // 

//  Get all suggested matches for logged-in user
// export const getSuggestedMatches = async (req, res) => {
//   try {
//     // Get current user skill profile
//     const currentUser = await SkillProfile.findOne({ user: req.user._id }).populate(
//       "user",
//       "name email"
//     );

//     if (!currentUser) {
//       return res.status(404).json({ message: "User skill profile not found" });
//     }

//     // Get all other users’ skills
//     const allProfiles = await SkillProfile.find({
//       user: { $ne: req.user._id },
//     }).populate("user", "name email");

//     // Run matching logic
//     const matches = findMatches(currentUser, allProfiles);

//     res.status(200).json({
//       count: matches.length,
//       matches: matches.map((m) => ({
//         id: m.user._id,
//         name: m.user.name,
//         email: m.user.email,
//         teachSkills: m.teachSkills.map((s) => s.name),
//         learnSkills: m.learnSkills.map((s) => s.name),
//       })),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const getSuggestedMatches = async (req, res) => {
  try {
    // Get current user skill profile
    const currentUser = await SkillProfile.findOne({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    // ✅ If profile not found, return an empty array instead of 404
    if (!currentUser) {
      return res.status(200).json({
        count: 0,
        matches: [],
        message: "No skill profile yet for this user",
      });
    }

    // Get all other users’ skill profiles
    const allProfiles = await SkillProfile.find({
      user: { $ne: req.user._id },
    }).populate("user", "name email");

    // Run matching logic (make sure this function is defined safely)
    const matches = findMatches(currentUser, allProfiles) || [];

    // Always send a 200 with consistent shape
    res.status(200).json({
      count: matches.length,
      matches: matches.map((m) => ({
        id: m.user._id,
        name: m.user.name,
        email: m.user.email,
        teachSkills: m.teachSkills.map((s) => s.name),
        learnSkills: m.learnSkills.map((s) => s.name),
      })),
    });
  } catch (error) {
    console.error("❌ getSuggestedMatches error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🎯 Filter matches by skill, rating, or location
export const filterMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, minRating, location } = req.query;

    const currentUser = await User.findById(userId);
    if (!currentUser)
      return res.status(404).json({ message: "User not found." });

    const filter = {
      _id: { $ne: userId },
    };

    if (location) {
      filter.location = { $regex: new RegExp(location, "i") };
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (skill) {
      filter.$or = [
        { teachSkills: { $regex: new RegExp(skill, "i") } },
        { learnSkills: { $regex: new RegExp(skill, "i") } },
      ];
    }

    const users = await User.find(filter);
    const matches = findMatches(currentUser, users); // ✅ use same function name

    res.json({
      total: matches.length,
      matches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error filtering matches." });
  }
};
