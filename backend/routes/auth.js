// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');
const router = express.Router();

const backendBaseUrl = () => (process.env.BACKEND_URL || '').replace(/\/$/, '');
const frontendBaseUrl = () => (process.env.FRONTEND_URL || '').replace(/\/$/, '');
const googleCallbackUrl = () => `${backendBaseUrl()}/api/auth/google/callback`;
const githubCallbackUrl = () => `${backendBaseUrl()}/api/auth/github/callback`;

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { name, status, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save the new user
        const newUser = new User({
            name,
            status: status || 'Student',
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Operative registered successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// ==========================================
// GITHUB OAUTH
// ==========================================
router.get('/github', (req, res) => {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.BACKEND_URL) {
        return res.status(500).send('GitHub OAuth is not configured on the server.');
    }
    const callback = encodeURIComponent(githubCallbackUrl());
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${callback}&scope=user:email`;
    res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { Accept: 'application/json' } });

        const accessToken = tokenResponse.data.access_token;

        // 2. Fetch user data from GitHub
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const emailResponse = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // GitHub users can have hidden emails, we need the primary one
        const primaryEmailObj = emailResponse.data.find(email => email.primary) || emailResponse.data[0];
        const email = primaryEmailObj && primaryEmailObj.email;
        if (!email) throw new Error('No verified email was returned by GitHub.');
        const name = userResponse.data.name || userResponse.data.login;

        // 3. Find or Create User in MongoDB
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, status: 'Operative', authProvider: 'github' });
            await user.save();
        }

        // 4. Generate UniVista JWT and redirect to frontend
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.redirect(`${frontendBaseUrl()}/pages/dashboard.html?token=${encodeURIComponent(token)}`);

    } catch (error) {
        console.error('GitHub Auth Error:', error.message);
        res.redirect(`${frontendBaseUrl()}/pages/index.html?error=oauth_failed`);
    }
});

// ==========================================
// GOOGLE OAUTH
// ==========================================
router.get('/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.BACKEND_URL) {
        return res.status(500).send('Google OAuth is not configured on the server.');
    }
    const callback = encodeURIComponent(googleCallbackUrl());
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${callback}&response_type=code&scope=profile%20email`;
    res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: googleCallbackUrl()
        });

        // 2. Fetch user data from Google
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        const { email, name } = userResponse.data;

        // 3. Find or Create User in MongoDB
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, status: 'Operative', authProvider: 'google' });
            await user.save();
        }

        // 4. Generate UniVista JWT and redirect
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.redirect(`${frontendBaseUrl()}/pages/dashboard.html?token=${encodeURIComponent(token)}`);

    } catch (error) {
        console.error('Google Auth Error:', error.message);
        res.redirect(`${frontendBaseUrl()}/pages/index.html?error=oauth_failed`);
    }
});

module.exports = router;