const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Event = require('../models/Event');
const ProfileComment = require('../models/ProfileComment');
const { protect } = require('../middleware/auth');

// ============================================
// GET user profile by ID (or username)
// ============================================
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;

    // Allow searching by ID or username
    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { username: identifier };

    const user = await User.findOne(query).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all posts created by this user
    const posts = await Event.find({ author: user._id })
      .populate('author', 'username displayName avatar')
      .populate('likes', 'username displayName avatar')
      .sort({ createdAt: -1 });

    // Calculate total likes across all posts
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);

    res.json({
      user,
      stats: {
        totalPosts: posts.length,
        totalLikes,
        totalShares,
        totalRsvps: user.totalRsvps,
      },
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ============================================
// UPDATE own profile (protected)
// ============================================
router.put('/me', protect, async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ============================================
// GET guestbook comments for a user
// ============================================
router.get('/:userId/guestbook', async (req, res) => {
  try {
    const comments = await ProfileComment.find({ profileOwner: req.params.userId })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch guestbook' });
  }
});

// ============================================
// POST a comment on someone's profile (guestbook)
// ============================================
router.post('/:userId/guestbook', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Prevent commenting on non-existent users
    const profileOwner = await User.findById(req.params.userId);
    if (!profileOwner) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = await ProfileComment.create({
      profileOwner: req.params.userId,
      author: req.user._id,
      text: text.trim(),
    });

    const populated = await ProfileComment.findById(comment._id)
      .populate('author', 'username displayName avatar');

    // Real-time notification (optional but nice)
    const io = req.app.get('io');
    io.emit('profileComment', {
      profileOwnerId: req.params.userId,
      comment: populated,
    });

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to post guestbook comment' });
  }
});

module.exports = router;