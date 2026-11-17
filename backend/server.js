// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json()); // Parses incoming JSON payloads

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Basic Test Route
app.get('/api/health', (req, res) => {
    res.json({ message: 'UniVista telemetry server is online.' });
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Profile Routes
app.use('/api/profile', require('./routes/profile'));

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});