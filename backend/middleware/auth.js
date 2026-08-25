const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes – requires valid Bearer token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'community-hub-secret-change-me'
    );

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Optional auth – attaches user if token is present, otherwise continues
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'community-hub-secret-change-me'
    );
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    // Ignore invalid token for optional routes
  }

  next();
};

module.exports = { protect, optionalAuth };