import express from "express";
import {
  sendRequest,
  updateRequestStatus,
  getUserRequests,
  trackRequestBetweenUsers,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendRequest);
router.put("/:id/status", protect, updateRequestStatus);
router.get("/all", protect, getUserRequests);
router.get("/track/:userId", protect, trackRequestBetweenUsers);

export default router;
