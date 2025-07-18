import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ats_db',
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Candidates CRUD
app.get('/api/candidates', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM candidates');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/candidates', async (req, res) => {
  const { name, email, phone, resume_url } = req.body;
  try {
    const [result] = await db.execute('INSERT INTO candidates (name, email, phone, resume_url) VALUES (?, ?, ?, ?)', [name, email, phone, resume_url]);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Competency Ratings
app.post('/api/competency', async (req, res) => {
  const { candidate_id, communication, cultural_fit, passion, leadership, learning_agility, rated_by } = req.body;
  try {
    await db.execute(
      'INSERT INTO competency_ratings (candidate_id, communication, cultural_fit, passion, leadership, learning_agility, rated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [candidate_id, communication, cultural_fit, passion, leadership, learning_agility, rated_by]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback
app.post('/api/feedback', async (req, res) => {
  const { candidate_id, stage, feedback_text, panel_member } = req.body;
  try {
    await db.execute(
      'INSERT INTO feedback (candidate_id, stage, feedback_text, panel_member) VALUES (?, ?, ?, ?)',
      [candidate_id, stage, feedback_text, panel_member]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recommendations
app.post('/api/recommendations', async (req, res) => {
  const { candidate_id, recommendation_text, status, recommended_by } = req.body;
  try {
    await db.execute(
      'INSERT INTO recommendations (candidate_id, recommendation_text, status, recommended_by) VALUES (?, ?, ?, ?)',
      [candidate_id, recommendation_text, status, recommended_by]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard summary (example: candidate count)
app.get('/api/dashboard', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as candidateCount FROM candidates');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
