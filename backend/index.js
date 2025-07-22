import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './src/api/index.js';
import errorHandler from './src/middleware/error.middleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Mount main API router
app.use('/api', apiRouter);

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
