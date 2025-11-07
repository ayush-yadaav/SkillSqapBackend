import "./config/env.js";
import http from "http";                // ✅ add this
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import {connectDB} from "./database/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

import { chatSocketHandler } from "./sockets/chatSocket.js";

connectDB();

const app = express();

/* 🟢  CORS */
app.use(
  cors({
    origin:[
    "https://skill-swap-frontend-virid.vercel.app",
    "http://localhost:5173", 
    ],          // React dev origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* 🟣  Create HTTP server FIRST */
const server = http.createServer(app);

/* 🟢  Initialize Socket.IO with that server */
const io = new Server(server, { cors: { origin: "*" } });
chatSocketHandler(io);

/* 🛠️  Routes */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/stats", statsRoutes);

/* 🧭  Base route */
app.get("/", (req, res) => {
  res.send("Skill Swap API running");
});

/* 🚀  Start */
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () =>
//   console.log(`⚡ Server running on http://localhost:${PORT}`)
// );

export default app;