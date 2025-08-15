// api/chat.mjs
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
      "HTTP-Referer": "https://coding-platform-mu.vercel.app", // ✅ Your deployed frontend
      "X-Title": "CodeMaster Assistant"
    };
    model = "anthropic/claude-3-haiku";
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
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "No response from AI.";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}