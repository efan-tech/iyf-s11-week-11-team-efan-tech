const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const { optionalAuth } = require('../middleware/auth');

// GET /api/feedback – list (newest first)
router.get('/', async (req, res) => {
  try {
    const list = await Feedback.find()
      .populate('user', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(list);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// POST /api/feedback
// Body: { type, message, rating }  (+ name optional if logged in)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, type, message, rating } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const feedbackName =
      (req.user && (req.user.displayName || req.user.username)) ||
      name ||
      'Anonymous';

    const allowedTypes = ['Feedback', 'Idea', 'Suggestion', 'Bug'];
    const safeType = allowedTypes.includes(type) ? type : 'Feedback';

    const feedback = await Feedback.create({
      name: feedbackName,
      type: safeType,
      message: message.trim(),
      rating: rating && rating >= 1 && rating <= 5 ? rating : 5,
      user: req.user ? req.user._id : undefined,
    });

    const populated = await Feedback.findById(feedback._id).populate(
      'user',
      'username displayName avatar'
    );

    res.status(201).json({
      message: 'Thank you for your contribution!',
      feedback: populated,
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
});

module.exports = router;