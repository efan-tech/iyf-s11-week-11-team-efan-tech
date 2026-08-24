const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // for nested replies
    },
  },
  { timestamps: true }
);

const rsvpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not-going'],
      required: true,
    },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Arts',
        'Praise & Worship',
        'Tech & Innovation',
        'Sports',
        'Hackathons',
        'Cultural',
        'General',
        'Catholic / Faith',
      ],
    },
    location: {
      type: String,
      default: 'Campus',
    },
    date: {
      type: String, // keep as string for simplicity (or change to Date later)
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
    rsvps: [rsvpSchema],
    comments: [commentSchema],
    joinedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-update joinedCount before save
eventSchema.pre('save', function (next) {
  this.joinedCount = this.rsvps.filter((r) => r.status === 'going').length;
  next();
});

module.exports = mongoose.model('Event', eventSchema);