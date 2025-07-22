require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Ensures DB pool is created
const { redisClient } = require('./middleware/cache'); // Ensures Redis client connects

const candidateRoutes = require('./routes/candidateRoutes');
// Import other routes...
// const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// API Routes
app.use('/api/candidates', candidateRoutes);
// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => redisClient.quit(() => process.exit(0)));
process.on('SIGTERM', () => redisClient.quit(() => process.exit(0)));