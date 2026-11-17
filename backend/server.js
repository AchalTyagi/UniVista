// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));
app.use(express.json());

// Connect once per serverless instance; reuse the connection on warm invocations.
let mongoConnectionPromise;
async function connectDatabase(req, res, next) {
    try {
        if (mongoose.connection.readyState === 1) return next();

        if (!process.env.MONGO_URI) {
            return res.status(500).json({ error: 'MONGO_URI is not configured.' });
        }

        if (!mongoConnectionPromise) {
            mongoConnectionPromise = mongoose.connect(process.env.MONGO_URI)
                .catch((error) => {
                    mongoConnectionPromise = null;
                    throw error;
                });
        }

        await mongoConnectionPromise;
        next();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        res.status(500).json({ error: 'Database connection failed.' });
    }
}

// Health check does not require MongoDB.
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'UniVista API is online.' });
});

// All database-backed routes wait for the database connection.
app.use('/api/auth', connectDatabase, require('./routes/auth'));
app.use('/api/profile', connectDatabase, require('./routes/profile'));

module.exports = app;

// Local development: node backend/server.js
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`UniVista server running on port ${PORT}`));
}
