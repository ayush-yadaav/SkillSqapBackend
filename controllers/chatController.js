import Message from "../models/Message.js";

// send msg part
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, chatRoomId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: "Receiver and message are required." });
    }

    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      chatRoomId,
      message,
    });

    res.status(201).json({ success: true, message: "Message sent successfully!", data: msg });
  } catch (error) {
    res.status(500).json({ message: "Error sending message.", error: error.message });
  }
};

// msg room part

export const getMessagesByRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await Message.find({ chatRoomId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages.", error: error.message });
  }
};

// user chat part
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      {
        $group: {
          _id: "$chatRoomId",
          lastMessage: { $last: "$message" },
          lastUpdated: { $last: "$createdAt" },
        },
      },
      { $sort: { lastUpdated: -1 } },
    ]);

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user chats.", error: error.message });
  }
};

// mark as read part 

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { chatRoomId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: "Messages marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Error updating read status.", error: error.message });
  }
};

// delete single msg

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found." });

    // Allow only sender or receiver to delete
    if (message.sender.toString() !== userId && message.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this message." });
    }

    // Soft delete for user
    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
    }

    // If both deleted => mark permanently deleted
    if (message.deletedBy.length === 2) {
      message.isDeleted = true;
      message.message = "[deleted]";
    }

    await message.save();

    res.json({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message.", error: error.message });
  }
};

//  delete entire chat 
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatRoomId } = req.params;

    const messages = await Message.find({ chatRoomId });

    if (!messages.length) {
      return res.status(404).json({ message: "No chat found for this room." });
    }

    // Soft delete for each message
    for (const msg of messages) {
      if (!msg.deletedBy.includes(userId)) msg.deletedBy.push(userId);
      if (msg.deletedBy.length === 2) {
        msg.isDeleted = true;
        msg.message = "[deleted]";
      }
      await msg.save();
    }

    res.json({ success: true, message: "Chat deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chat.", error: error.message });
  }
};