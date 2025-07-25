const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
const router   = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ username, passwordHash: hash });
    res.status(201).json({ message: 'ok' });
  } catch (err) {
    console.error(err);
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
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  // send as HTTP‑only cookie:
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
  res.json({ username: user.username });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

module.exports = router;