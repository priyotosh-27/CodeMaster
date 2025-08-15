import express from "express";
import dotenv from "dotenv";
import chatRouter from "./api/chat.js"; // ✅ Correct path

dotenv.config();
const app = express();
app.use(express.json());

// ✅ Optional: Log incoming requests
app.use((req, res, next) => {
    console.log(`📩 ${req.method} ${req.url}`);
    next();
});

// ✅ Use modular chat router
app.use("/api", chatRouter);

// ✅ Health check
app.get("/", (req, res) => {
    res.send("✅ Server is working!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));