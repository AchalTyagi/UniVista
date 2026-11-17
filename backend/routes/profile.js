// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// 1. GET ROUTE: Fetch the logged-in user's profile
router.get('/', auth, async (req, res) => {
    try {
        // Find the user by the ID embedded in their token, but exclude the password field
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
});

// 2. PUT ROUTE: Update telemetry/profile data
router.put('/', auth, async (req, res) => {
    try {
        // Update the profileData object with whatever the frontend sends
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profileData: req.body } },
            { new: true } // Return the updated document
        ).select('-password');
        
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating profile.' });
    }
});

module.exports = router;