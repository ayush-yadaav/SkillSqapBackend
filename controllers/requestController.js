import Request from "../models/Request.js";
import User from "../models/user.model.js";

// 📤 Send a new request
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, offeredSkill, requestedSkill } = req.body;
    const senderId = req.user.id; // from auth middleware

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    // Check if already a pending or active request exists
    const existing = await Request.findOne({
      sender: senderId,
      receiver: receiverId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      return res.status(400).json({ message: "Request already exists between users." });
    }

    const request = await Request.create({
      sender: senderId,
      receiver: receiverId,
      offeredSkill,
      requestedSkill,
    });

    res.status(201).json({
      message: "Request sent successfully!",
      request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending request." });
  }
};

// ✅ Accept or Reject Request
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "accepted" | "rejected" | "completed"
    const userId = req.user.id;

    const request = await Request.findById(id);

    if (!request) return res.status(404).json({ message: "Request not found." });

    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this request." });
    }

    request.status = status;
    await request.save();

    res.json({
      message: `Request ${status} successfully.`,
      request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating request." });
  }
};

// 📦 Get all requests for logged-in user
export const getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Request.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching requests." });
  }
};

// 🔍 Track single request between two users
export const trackRequestBetweenUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;

    const request = await Request.findOne({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser },
      ],
    }).populate("sender receiver", "name email");

    if (!request)
      return res.status(404).json({ message: "No request found between users." });

    res.json({ request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error tracking request." });
  }
};
