const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // seconds the process has been running
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };

  // If DB is down, return 503 so monitors know something is wrong
  const statusCode = healthcheck.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthcheck);
});

module.exports = router;