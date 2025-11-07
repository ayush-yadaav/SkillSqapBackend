import mongoose, { mongo } from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },

    // Profile info
    about: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    teachSkills: [{ type: String }],
    learnSkills: [{ type: String }],
    location: {
        type: String,
        default: "",
    },
    rating: {
        type: Number,
        default: 0,
    },
    socialLinks: {
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        twitter: { type: String, default: "" },
        website: { type: String, default: "" },
    },
    isVerified:
    {
        type: Boolean,
        default: false
    }, // after OTP verify
    otp: {
        type: String
    }, // store OTP temporarily
    otpExpiry: {
        type: Date
    },
    googleId: {
        type: String
    }, // for Google users

    // ✨ Dashboard Stats
    totalSwaps: { type: Number, default: 0 },
    completedSwaps: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)
export default User;