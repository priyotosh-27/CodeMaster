import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
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
            "HTTP-Referer": "https://codemaster.com",
            "X-Title": "CodeMaster Assistant"
        };
        model = "openrouter/anthropic/claude-3-haiku";
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
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "No response.";
        res.json({ reply });
    } catch (err) {
        console.error("AI error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));