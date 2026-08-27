const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const eventRoutes = require('./routes/events');
const feedbackRoutes = require('./routes/feedback');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const healthRoutes = require('./routes/health');


const app = express();

// CORS – allow Vercel frontend + local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://community-hub-murex.vercel.app',
  'https://community-hub-five-tau.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // keep permissive for now; tighten later if needed
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Community Hub API is running' });
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI is missing in environment variables');
} else {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Error:', err.message));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/health', healthRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));