const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for your frontend domain
// Replace 'https://your-frontend-url.github.io' with your actual frontend URL
app.use(cors({
    origin: 'https://priyotosh-27.github.io', // or '*' for testing, but be cautious in production
    methods: ['GET', 'POST'],
}));

// ✅ Serve all static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'docs')));

// ✅ API endpoint to serve Firebase config to the frontend
app.get('/config', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    });
});

// ✅ "Catch-all" route to serve index.html for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
