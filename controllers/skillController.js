import SkillProfile from "../models/Skill.js";

// ✅ Create or Update Skill Profile (Teach + Learn)
// export const upsertSkillProfile = async (req, res) => {
//   try {
//     const { teachSkills, learnSkills } = req.body;

//     if (!teachSkills && !learnSkills) {
//       return res.status(400).json({ message: "No skills provided" });
//     }



//     // check if profile exists
//     let profile = await SkillProfile.findOne({ user: req.user._id });

//     if (profile) {
//       // update existing
//       if (teachSkills) profile.teachSkills = teachSkills;
//       if (learnSkills) profile.learnSkills = learnSkills;
//       await profile.save();
//       return res.status(200).json({ message: "Skill profile updated", profile });
//     } else {
//       // create new
//       profile = await SkillProfile.create({
//         user: req.user._id,
//         teachSkills,
//         learnSkills,
//       });
//       return res.status(201).json({ message: "Skill profile created", profile });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Error saving skills", error: error.message });
//   }
// };
export const upsertSkillProfile = async (req, res) => {
  try {
    console.log("🟢 upsertSkillProfile hit");
    console.log("USER =>", req.user?._id);
    console.log("BODY =>", req.body);

    const { teachSkills, learnSkills } = req.body;
    if (!teachSkills && !learnSkills)
      return res.status(400).json({ message: "No skills provided" });

    let profile = await SkillProfile.findOne({ user: req.user._id });

    if (profile) {
      if (teachSkills) profile.teachSkills = teachSkills;
      if (learnSkills) profile.learnSkills = learnSkills;
      await profile.save();
      console.log("✅ Updated profile");
      return res.status(200).json({ message: "Skill profile updated", profile });
    }

    profile = await SkillProfile.create({
      user: req.user._id,
      teachSkills,
      learnSkills,
    });
    console.log("✅ Created new profile", profile._id);
    res.status(201).json({ message: "Skill profile created", profile });
  // } catch (error) {
  //   console.error("❌ Error in upsertSkillProfile:", error);
  //   res.status(500).json({ message: "Error saving skills", error: error.message });
  // }

  } catch (error) {
  console.error("🔥 ERROR inside upsertSkillProfile:", error);
  res
    .status(500)
    .json({
      message: "Error saving skills",
      error: error.message,
      stack: error.stack,
    });
}
  
};

// ✅ Get all skill profiles (for matching/discovery)
export const getAllSkillProfiles = async (req, res) => {
  try {
    const profiles = await SkillProfile.find().populate("user", "name email");
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching skill profiles", error: error.message });
  }
};

// ✅ Get a specific user's skill profile
export const getUserSkillProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const profile = await SkillProfile.findOne({ user: userId }).populate("user", "name email");
    if (!profile) return res.status(404).json({ message: "Skill profile not found" });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

// ✅ Delete user's skill profile
export const deleteSkillProfile = async (req, res) => {
  try {
    const profile = await SkillProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "No skill profile found" });
    await SkillProfile.deleteOne({ _id: profile._id });
    res.status(200).json({ message: "Skill profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting profile", error: error.message });
  }
};
