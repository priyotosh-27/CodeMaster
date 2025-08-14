const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    console.log("Received:", message);
    res.json({ reply: `Echo: ${message}` });
});

app.listen(3000, () => console.log("✅ Test server running on http://localhost:3000"));