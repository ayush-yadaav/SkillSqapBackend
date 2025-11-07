import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Skill from "../models/Skill.js";
import generateToken from "../utils/genrateToken.js";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

// it will create a google clinet object and verify the token from frontend
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//  setup to send email 
const transporter = nodemailer.createTransport({
  
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", // true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    
    
})



//  func that help to send otp 
const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"SkillSwap" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Your SkillSwap OTP",
      html: `<p>Your OTP for SkillSwap is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });
  } catch (err) {
    console.error("Email send error:", err);
    throw new Error("Failed to send OTP email");
  }
};


// 
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email) return res.status(400).json({ message: "Name and Email is require" })

        const existing = await User.findOne({ email })
        if (existing && existing.isVerified) {
            return res.status(400).json({ message: "User already exist. Please Login." })
        }

        // if passward provied hast. else leanve blank for Google only user
        let hashed = undefined;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashed = await bcrypt.hash(password, salt)
        }

        // gernarte 6 digit otp 
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);


        // create or update temp user
        const user = await User.findOneAndUpdate(
            { email },
            {
                name,
                email,
                ...(hashed ? { password: hashed } : {}),
                otp,
                otpExpiry,
                isVerified: false,
            },
            { upsert: true, new: true }
        );
        await sendOtpEmail(email, otp);

        return res.json({ message: "OTP sent to email", email: user.email });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (!user.otp || !user.otpExpiry) return res.status(400).json({ message: "No OTP found. Please register again." });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < new Date()) return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// login with email and password

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email first" });

    const token = generateToken(user);

    // ✅ check whether user has a skill profile
    const profile = await Skill.findOne({ user: user._id });
    const hasSkills =
      profile &&
      ((profile.teachSkills && profile.teachSkills.length > 0) ||
        (profile.learnSkills && profile.learnSkills.length > 0));

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasSkills, // 👈 send this to frontend
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//  Google Login 

export const googleLogin = async (req,res) =>{
    try {
        const {idToken} = req.body;
        if (!idToken) return res.status(400).json({ message: "idToken required" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;


     // find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        isVerified: true,
        googleId,
      });
    } else {
      // if found but no googleId, attach
      user.googleId = user.googleId || googleId;
      user.isVerified = true;
      user.avatar = user.avatar || picture;
      await user.save();
    }

     const token = generateToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) {
         console.error("Google login error:", error);
    return res.status(500).json({ message: "Google verification failed" });
    }
}