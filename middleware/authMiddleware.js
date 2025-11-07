import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// export const protect = async (req, res, next) => {
//   let token;
// console.log("🔹Auth header:", req.headers.authorization);
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//       req.user = await User.findById(decoded.id).select("-password");
//       if (!req.user) return res.status(404).json({ message: "User not found" });

//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Not authorized, invalid token" });
//     }
//   }

//   if (!token) return res.status(401).json({ message: "Not authorized, no token provided" });
// };


export const protect = async (req, res, next) => {
  console.log("🔹Auth header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // console.log("🔹Decoded:", decoded);


      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("⛔ User not found for id:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.log("⛔ JWT verify error:", err.message);
      res.status(401).json({ message: "Token invalid or expired" });
    }
  } else {
    console.log("⛔ No Authorization header present");
    res.status(401).json({ message: "No token provided" });
  }
};