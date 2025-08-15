import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/chat", async (req, res) => {
    const { message, provider = "openai" } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    let apiUrl, headers, model;

    if (provider === "openrouter") {
        apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://coding-platform-mu.vercel.app", // ✅ must match your deployed domain
            "X-Title": "CodeMaster Assistant"
        };
        model = "anthropic/claude-3-haiku"; // ✅ Correct model name
    } else {
        apiUrl = "https://api.openai.com/v1/chat/completions";
        headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        };
        model = "gpt-3.5-turbo";
    }

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: message }],
                temperature: 0.7 // ✅ optional but recommended
            })
        });

        const raw = await response.text();
        console.log("Raw AI response:", raw);

        const data = JSON.parse(raw);

        if (data.error) {
            console.error("AI API error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const reply = data.choices?.[0]?.message?.content || "No response from AI.";
        res.json({ reply });
    } catch (err) {
        console.error("AI error:", err);
        res.status(500).json({ error: "Something went wrong", details: err.message });
    }
});

export default router;