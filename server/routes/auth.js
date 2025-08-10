const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
const router   = express.Router();
const bannedWords = require('../utils/bannedWords'); // Assuming you have a list of banned words

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation - check for missing or empty values
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        message: "Username is required and cannot be empty"
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    // Username Validation 
    const trimmedUsername = username.trim();

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers, and underscores"
      });
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters"
      });
    }

    // Normalize username to check embedded offensive words
    const normalized = trimmedUsername.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isOffensive = bannedWords.some(word => normalized.includes(word));

    if (isOffensive) {
      return res.status(400).json({ message: "Username is inappropriate" });
    }

    // Password Validation 

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      return res.status(400).json({
        message: "Password must contain at least one letter and one number"
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ username: trimmedUsername, passwordHash: hash });
    res.status(201).json({ message: 'ok' });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({message: "Username already exists"});
    }

    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ message: 'Invalid creds' });
  }
  
  // Include username in JWT payload
  const token = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
    
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  res.json({ _id: user._id, username: user.username });
});

// GET /api/auth/me - This route will have req.auth populated by JWT middleware
router.get('/me', async (req, res) => {
  try {
    // req.auth is populated by the JWT middleware applied in server.js
    const user = await User.findById(req.auth._id).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Server error during auth check' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

module.exports = router;