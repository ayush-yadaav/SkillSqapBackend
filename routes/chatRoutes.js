import express from "express";
import {
  sendMessage,
  getMessagesByRoom,
  getUserChats,
  markMessagesAsRead,
  deleteMessage,
  deleteChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/user/chats", protect, getUserChats);
router.get("/:chatRoomId", protect, getMessagesByRoom);
router.put("/read/:chatRoomId", protect, markMessagesAsRead);


router.delete("/message/:messageId", protect, deleteMessage);
router.delete("/chat/:chatRoomId", protect, deleteChat);

export default router;
