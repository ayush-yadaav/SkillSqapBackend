import mongoose from "mongoose";

const skillProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // har user ka ek hi skill profile
    },
    teachSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: "General" },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Beginner",
        },
      },
    ],
    learnSkills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: "General" },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Beginner",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SkillProfile", skillProfileSchema);
