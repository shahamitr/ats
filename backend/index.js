import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';
// Export candidate journey as PDF
app.get('/api/admin/candidates/:id/journey/pdf', async (req, res) => {
  const candidateId = req.params.id;
  try {
    // Fetch candidate profile
    const [candRows] = await db.execute('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    if (candRows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = candRows[0];

    // Fetch competency ratings
    const [ratingsRows] = await db.execute('SELECT * FROM competency_ratings WHERE candidate_id = ?', [candidateId]);

    // Fetch feedback
    const [feedbackRows] = await db.execute('SELECT * FROM feedback WHERE candidate_id = ?', [candidateId]);

    // Fetch recommendations
    const [recRows] = await db.execute('SELECT * FROM recommendations WHERE candidate_id = ?', [candidateId]);

    // Create PDF document
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=candidate_${candidateId}_journey.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Candidate Journey Report', { align: 'center' });
    doc.moveDown();

    // Candidate Profile
    doc.fontSize(16).text('Profile', { underline: true });
    doc.fontSize(12).text(`ID: ${candidate.id}`);
    doc.text(`Name: ${candidate.name}`);
    doc.text(`Email: ${candidate.email}`);
    doc.text(`Phone: ${candidate.phone}`);
    doc.text(`Resume URL: ${candidate.resume_url}`);
    doc.text(`CV File: ${candidate.cv_file}`);
    doc.text(`Enabled: ${candidate.enabled ? 'Yes' : 'No'}`);
    doc.text(`Created At: ${dayjs(candidate.created_at).format('YYYY-MM-DD HH:mm:ss')}`);
    doc.moveDown();

    // Competency Ratings
    doc.fontSize(16).text('Competency Ratings', { underline: true });
    ratingsRows.forEach(r => {
      doc.fontSize(12).text(`- Communication: ${r.communication}, Cultural Fit: ${r.cultural_fit}, Passion: ${r.passion}, Leadership: ${r.leadership}, Learning Agility: ${r.learning_agility}, Rated By: ${r.rated_by}, Date: ${dayjs(r.created_at).format('YYYY-MM-DD HH:mm:ss')}`);
    });
    doc.moveDown();

    // Feedback
    doc.fontSize(16).text('Feedback', { underline: true });
    feedbackRows.forEach(f => {
      doc.fontSize(12).text(`- Stage: ${f.stage}, Panel Member: ${f.panel_member}, Date: ${dayjs(f.created_at).format('YYYY-MM-DD HH:mm:ss')}`);
      doc.text(`  Feedback: ${f.feedback_text}`);
    });
    doc.moveDown();

    // Recommendations
    doc.fontSize(16).text('Recommendations', { underline: true });
    recRows.forEach(r => {
      doc.fontSize(12).text(`- Status: ${r.status}, Recommended By: ${r.recommended_by}, Date: ${dayjs(r.created_at).format('YYYY-MM-DD HH:mm:ss')}`);
      doc.text(`  Recommendation: ${r.recommendation_text}`);
    });
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Export candidate journey as Excel
app.get('/api/admin/candidates/:id/journey', async (req, res) => {
  const candidateId = req.params.id;
  try {
    // Fetch candidate profile
    const [candRows] = await db.execute('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    if (candRows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = candRows[0];

    // Fetch competency ratings
    const [ratingsRows] = await db.execute('SELECT * FROM competency_ratings WHERE candidate_id = ?', [candidateId]);

    // Fetch feedback
    const [feedbackRows] = await db.execute('SELECT * FROM feedback WHERE candidate_id = ?', [candidateId]);

    // Fetch recommendations
    const [recRows] = await db.execute('SELECT * FROM recommendations WHERE candidate_id = ?', [candidateId]);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();

    // Candidate Profile Sheet
    const profileSheet = workbook.addWorksheet('Profile');
    profileSheet.addRow(['ID', 'Name', 'Email', 'Phone', 'Resume URL', 'CV File', 'Enabled', 'Created At']);
    profileSheet.addRow([candidate.id, candidate.name, candidate.email, candidate.phone, candidate.resume_url, candidate.cv_file, candidate.enabled, candidate.created_at]);

    // Competency Ratings Sheet
    const ratingsSheet = workbook.addWorksheet('Competency Ratings');
    ratingsSheet.addRow(['ID', 'Communication', 'Cultural Fit', 'Passion', 'Leadership', 'Learning Agility', 'Rated By', 'Created At']);
    ratingsRows.forEach(r => ratingsSheet.addRow([r.id, r.communication, r.cultural_fit, r.passion, r.leadership, r.learning_agility, r.rated_by, r.created_at]));

    // Feedback Sheet
    const feedbackSheet = workbook.addWorksheet('Feedback');
    feedbackSheet.addRow(['ID', 'Stage', 'Feedback Text', 'Panel Member', 'Created At']);
    feedbackRows.forEach(f => feedbackSheet.addRow([f.id, f.stage, f.feedback_text, f.panel_member, f.created_at]));

    // Recommendations Sheet
    const recSheet = workbook.addWorksheet('Recommendations');
    recSheet.addRow(['ID', 'Recommendation Text', 'Status', 'Recommended By', 'Created At']);
    recRows.forEach(r => recSheet.addRow([r.id, r.recommendation_text, r.status, r.recommended_by, r.created_at]));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=candidate_${candidateId}_journey.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import multer from 'multer';
import ExcelJS from 'exceljs';

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file uploads (CVs)
const upload = multer({ dest: 'uploads/' });
// Admin: Add user
app.post('/api/admin/users', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    await db.execute('INSERT INTO users (email, password, name, role, enabled) VALUES (?, ?, ?, ?, TRUE)', [email, password, name, role]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Enable/Disable user
app.post('/api/admin/users/:id/enable', async (req, res) => {
  try {
    await db.execute('UPDATE users SET enabled = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/users/:id/disable', async (req, res) => {
  try {
    await db.execute('UPDATE users SET enabled = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Import users from Excel
app.post('/api/admin/users/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const [email, password, name, role] = [row.getCell(1).value, row.getCell(2).value, row.getCell(3).value, row.getCell(4).value];
      if (email && password && name && role) {
        await db.execute('INSERT IGNORE INTO users (email, password, name, role, enabled) VALUES (?, ?, ?, ?, TRUE)', [email, password, name, role]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Export users to Excel
app.get('/api/admin/users/export', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT email, password, name, role, enabled FROM users');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    worksheet.addRow(['Email', 'Password', 'Name', 'Role', 'Enabled']);
    rows.forEach(user => worksheet.addRow([user.email, user.password, user.name, user.role, user.enabled]));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add candidate (with CV upload)
app.post('/api/admin/candidates', upload.single('cv'), async (req, res) => {
  const { name, email, phone, resume_url } = req.body;
  const cv_file = req.file ? req.file.filename : null;
  try {
    await db.execute('INSERT INTO candidates (name, email, phone, resume_url, cv_file, enabled) VALUES (?, ?, ?, ?, ?, TRUE)', [name, email, phone, resume_url, cv_file]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Enable/Disable candidate
app.post('/api/admin/candidates/:id/enable', async (req, res) => {
  try {
    await db.execute('UPDATE candidates SET enabled = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/candidates/:id/disable', async (req, res) => {
  try {
    await db.execute('UPDATE candidates SET enabled = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Import candidates from Excel
app.post('/api/admin/candidates/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const [name, email, phone, resume_url] = [row.getCell(1).value, row.getCell(2).value, row.getCell(3).value, row.getCell(4).value];
      if (name && email) {
        await db.execute('INSERT IGNORE INTO candidates (name, email, phone, resume_url, enabled) VALUES (?, ?, ?, ?, TRUE)', [name, email, phone, resume_url]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Export candidates to Excel
app.get('/api/admin/candidates/export', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT name, email, phone, resume_url, cv_file, enabled FROM candidates');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Candidates');
    worksheet.addRow(['Name', 'Email', 'Phone', 'Resume URL', 'CV File', 'Enabled']);
    rows.forEach(cand => worksheet.addRow([cand.name, cand.email, cand.phone, cand.resume_url, cand.cv_file, cand.enabled]));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
