const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/user');
const { protect, optionalAuth } = require('../middleware/auth');

// GET /api/events – public list
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events – create (protected preferred; falls back to body.author)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, description, category, location, date, image, author } =
      req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: 'Title and description are required' });
    }

    let authorData = {
      name: 'Community',
      handle: '',
      avatar: '',
    };

    if (req.user) {
      authorData = {
        userId: req.user._id,
        name: req.user.displayName || req.user.username,
        handle: `@${req.user.username}`,
        avatar: req.user.avatar || '',
      };
    } else if (author) {
      authorData = {
        name: author.name || 'Anonymous',
        handle: author.handle || '',
        avatar: author.avatar || '',
      };
    }

    const newEvent = new Event({
      title,
      description,
      category: category || 'General',
      location: location || 'Campus',
      date: date || 'TBA',
      image:
        image ||
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      author: authorData,
    });

    const saved = await newEvent.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/events/:id/rsvp
// Body: { status }  (preferred with auth)
// or    { name, status } (legacy Dashboard)
router.post('/:id/rsvp', optionalAuth, async (req, res) => {
  try {
    const { status, name } = req.body;

    if (!['going', 'maybe', 'not-going'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Valid status is required (going | maybe | not-going)' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const rsvpName =
      (req.user && (req.user.displayName || req.user.username)) ||
      name ||
      'Anonymous';

    const userId = req.user ? req.user._id : null;

    // Find existing RSVP by userId or by name
    let existingIndex = -1;
    if (userId) {
      existingIndex = event.rsvps.findIndex(
        (r) => r.userId && r.userId.toString() === userId.toString()
      );
    }
    if (existingIndex === -1) {
      existingIndex = event.rsvps.findIndex((r) => r.name === rsvpName);
    }

    const previousStatus =
      existingIndex !== -1 ? event.rsvps[existingIndex].status : null;

    if (existingIndex !== -1) {
      event.rsvps[existingIndex].status = status;
      event.rsvps[existingIndex].respondedAt = new Date();
      if (userId) event.rsvps[existingIndex].userId = userId;
      event.rsvps[existingIndex].name = rsvpName;
    } else {
      event.rsvps.push({
        userId: userId || undefined,
        name: rsvpName,
        status,
      });
    }

    event.joinedCount = event.rsvps.filter((r) => r.status === 'going').length;
    await event.save();

    // Update user totalRsvps when they first say "going"
    if (userId && status === 'going' && previousStatus !== 'going') {
      await User.findByIdAndUpdate(userId, { $inc: { totalRsvps: 1 } });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/like  (protected)
router.post('/:id/like', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const userId = req.user._id;
    const alreadyLiked = event.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      event.likes = event.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      event.likes.push(userId);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/comments  (protected)
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.comments.push({
      user: req.user._id,
      userName: req.user.displayName || req.user.username,
      text: text.trim(),
      parentComment: parentComment || null,
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:id/share  (public / optional auth)
router.post('/:id/share', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;