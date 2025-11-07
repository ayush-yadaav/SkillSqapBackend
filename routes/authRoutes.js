import express from "express";
import { register, verifyOtp, login, googleLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register)
router.post("/verify-otp",verifyOtp)
router.post("/login" , login)
router.post("/google", googleLogin)

export default router;