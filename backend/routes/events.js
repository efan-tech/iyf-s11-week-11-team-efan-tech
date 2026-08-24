const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/user');
const { protect } = require('../middleware/auth');

// ============================================
// GET all events (newest first)
// ============================================
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .populate('rsvps.user', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// ============================================
// GET single event by ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .populate('rsvps.user', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// ============================================
// CREATE new event (protected)
// ============================================
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, location, date, image } = req.body;

    if (!title || !description || !category || !date) {
      return res.status(400).json({ message: 'Title, description, category and date are required' });
    }

    const newEvent = await Event.create({
      title,
      description,
      category,
      location: location || 'Campus',
      date,
      image: image || '',
      author: req.user._id,
    });

    // Populate author before sending
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('author', 'username displayName avatar');

    // Real-time: broadcast new post to everyone
    const io = req.app.get('io');
    io.emit('newPost', populatedEvent);

    res.status(201).json(populatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// ============================================
// RSVP to an event (protected)
// ============================================
router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['going', 'maybe', 'not-going'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use going, maybe or not-going' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove previous RSVP by this user (if any)
    event.rsvps = event.rsvps.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    // Add new RSVP
    event.rsvps.push({
      user: req.user._id,
      status,
    });

    // Update joinedCount
    event.joinedCount = event.rsvps.filter((r) => r.status === 'going').length;

    await event.save();

    // Update user's totalRsvps if they said "going"
    if (status === 'going') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalRsvps: 1 } });
    }

    const populatedEvent = await Event.findById(event._id)
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .populate('rsvps.user', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar');

    // Real-time update
    const io = req.app.get('io');
    io.emit('rsvpUpdated', populatedEvent);
    io.to(req.params.id).emit('rsvpUpdated', populatedEvent);

    res.json(populatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to RSVP' });
  }
});

// ============================================
// LIKE / UNLIKE an event (protected)
// ============================================
router.post('/:id/like', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const alreadyLiked = event.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      event.likes = event.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      event.likes.push(req.user._id);
    }

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .populate('rsvps.user', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar');

    // Real-time
    const io = req.app.get('io');
    io.emit('postLiked', populatedEvent);
    io.to(req.params.id).emit('postLiked', populatedEvent);

    res.json(populatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to like/unlike' });
  }
});

// ============================================
// ADD COMMENT (protected)
// ============================================
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text, parentComment } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.comments.push({
      user: req.user._id,
      text: text.trim(),
      parentComment: parentComment || null,
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .populate('rsvps.user', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar');

    // Real-time
    const io = req.app.get('io');
    io.emit('newComment', populatedEvent);
    io.to(req.params.id).emit('newComment', populatedEvent);

    res.status(201).json(populatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// ============================================
// SHARE (increment share count)
// ============================================
router.post('/:id/share', protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    )
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .populate('rsvps.user', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Real-time
    const io = req.app.get('io');
    io.emit('postShared', event);

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to share' });
  }
});

// ============================================
// DELETE event (only author)
// ============================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    const io = req.app.get('io');
    io.emit('postDeleted', req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;