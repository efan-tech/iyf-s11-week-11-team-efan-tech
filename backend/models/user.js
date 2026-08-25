const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    totalRsvps: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Always give a displayName if empty
userSchema.pre('save', function (next) {
  if (!this.displayName) {
    this.displayName = this.username;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);