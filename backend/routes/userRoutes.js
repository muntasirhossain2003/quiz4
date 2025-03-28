
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Register User with email verification
router.post('/register', async (req, res) => {
    const { username, email, password, role = 'user' } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password, role });

    // Generate email verification token
    const token = user.generateVerificationToken();

    // Save user to the database
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    try {
        // Send verification email with the link
        await sendEmail(email, 'Email Verification', `Please verify your email by clicking this link: ${verificationLink}`);
        res.status(201).json({ message: 'User registered. Please check your email for verification.' });
    } catch (error) {
        // In case email fails to send, we still create the user (but mark email as unverified)
        return res.status(500).json({ message: 'Failed to send verification email' });
    }
});

// Verify User Email
router.get('/verify-email/:token', async (req, res) => {
    const token = req.params.token;
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpire: { $gt: Date.now() }, // Check if token is expired
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
        return res.status(400).json({ message: 'Please verify your email first' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

// Get User Profile (Protected Route)
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
});

module.exports = router;
