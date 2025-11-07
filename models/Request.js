import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offeredSkill: {
      type: String,
      required: true,
    },
    requestedSkill: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    chatRoomId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
