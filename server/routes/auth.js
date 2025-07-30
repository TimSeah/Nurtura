const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
const router   = express.Router();
//const Filter = require('bad-words'); 
//const filter = new Filter(); 

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    /*
    if (filter.isProfane(username)) {
      return res.status(400).json({ message: "Inappropriate username" });
    } */
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ username, passwordHash: hash });
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
  console.log('Auth check - req.auth:', req.auth);
  
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