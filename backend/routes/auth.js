const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'community-hub-secret-change-me',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      displayName: username.trim(),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        totalRsvps: user.totalRsvps,
      },
      message: 'User registered successfully',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
// Accepts { identifier, password } OR { email, password } OR { username, password }
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').toLowerCase().trim();

    if (!loginId || !password) {
      return res
        .status(400)
        .json({ message: 'Identifier/email and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        totalRsvps: user.totalRsvps,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      bio: req.user.bio,
      avatar: req.user.avatar,
      totalRsvps: req.user.totalRsvps,
    },
  });
});

module.exports = router;