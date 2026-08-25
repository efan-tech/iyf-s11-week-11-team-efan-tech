const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['going', 'maybe', 'not-going'],
    required: true,
  },
  respondedAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'Anonymous' },
  text: { type: String, required: true, trim: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Arts',
        'Catholic / Faith',
        'Praise & Worship',
        'Tech & Innovation',
        'Sports',
        'Hackathons',
        'Cultural',
        'General',
      ],
      default: 'General',
    },
    location: { type: String, default: 'Campus' },
    date: { type: String, required: true, default: 'TBA' },
    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    },

    // Who created the event
    // - userId: real link to User (for profile queries)
    // - name / handle / avatar: denormalized so Dashboard can show author.name
    author: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true, default: 'Community' },
      handle: { type: String, default: '' },
      avatar: { type: String, default: '' },
    },

    rsvps: [rsvpSchema],
    joinedCount: { type: Number, default: 0 },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);