// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Look for the token in the request headers
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Remove 'Bearer ' if the frontend includes it, then verify the token
        const cleanToken = token.replace('Bearer ', '');
        const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Attach the verified user payload (id, email) to the request
        req.user = verified;
        next(); // Pass control to the next function
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};  