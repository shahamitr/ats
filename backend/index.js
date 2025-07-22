// Email Templates CRUD (admin only)
import fs from 'fs';
const EMAIL_TEMPLATES_PATH = './email_templates.json';

// Get all templates
app.get('/api/email-templates', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  try {
    const templates = JSON.parse(fs.readFileSync(EMAIL_TEMPLATES_PATH, 'utf8'));
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// Get single template
app.get('/api/email-templates/:key', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  try {
    const templates = JSON.parse(fs.readFileSync(EMAIL_TEMPLATES_PATH, 'utf8'));
    const tpl = templates[req.params.key];
    if (!tpl) return res.status(404).json({ error: 'Template not found' });
    res.json(tpl);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load template' });
  }
});

// Create/update template
app.post('/api/email-templates/:key', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  try {
    const templates = JSON.parse(fs.readFileSync(EMAIL_TEMPLATES_PATH, 'utf8'));
    templates[req.params.key] = req.body;
    fs.writeFileSync(EMAIL_TEMPLATES_PATH, JSON.stringify(templates, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// Delete template
app.delete('/api/email-templates/:key', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  try {
    const templates = JSON.parse(fs.readFileSync(EMAIL_TEMPLATES_PATH, 'utf8'));
    if (!templates[req.params.key]) return res.status(404).json({ error: 'Template not found' });
    delete templates[req.params.key];
    fs.writeFileSync(EMAIL_TEMPLATES_PATH, JSON.stringify(templates, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
});
// Email OTP store (in-memory for demo)
const otpStore = {};

// Send OTP to email
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    // Check user exists
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    // Send email
    await transporter.sendMail({
      to: email,
      subject: 'Your ATS Login OTP',
      text: `Your OTP is: ${otp} (valid for 5 minutes)`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login with OTP or password
app.post('/api/auth/login', async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = rows[0];

    if (otp) {
      const entry = otpStore[email];
      if (!entry || entry.otp !== otp || entry.expires < Date.now()) {
        return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
      }
      delete otpStore[email]; // Consume OTP
    } else if (password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Password or OTP required' });
    }

    // Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Candidate Interview History CRUD
app.post('/api/candidates/:id/interviews', authenticateToken, authorizeRoles('Admin', 'HR Manager', 'Recruiter'), async (req, res) => {
  const candidateId = req.params.id;
  const { interview_date, interview_type, panel_members, feedback, result } = req.body;
  try {
    await db.execute(
      'INSERT INTO candidate_interview_history (candidate_id, interview_date, interview_type, panel_members, feedback, result) VALUES (?, ?, ?, ?, ?, ?)',
      [candidateId, interview_date, interview_type, panel_members, feedback, result]
    );

    // Send email notification to candidate on final result
    if (result === 'Selected' || result === 'Rejected') {
      try {
        const [[candidate]] = await db.execute('SELECT name, email FROM candidates WHERE id = ?', [candidateId]);
        if (candidate && candidate.email) {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: candidate.email,
            subject: `Update on your application with Candideval`,
            text: `Dear ${candidate.name},\n\nThis is an update regarding your recent interview process. The outcome is: ${result}.\n\nWe appreciate you taking the time to interview with us.\n\nBest regards,\nThe Hiring Team`,
          });
        }
      } catch (emailError) {
        // Log the email error but don't fail the main request
        console.error(`Failed to send outcome email to candidate ${candidateId}:`, emailError);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/candidates/:id/interviews', authenticateToken, async (req, res) => {
  const candidateId = req.params.id;
  try {
    const [rows] = await db.execute('SELECT * FROM candidate_interview_history WHERE candidate_id = ?', [candidateId]);
    res.json({ interviews: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Executive Report: Quantitative recruitment info (Excel/PDF)
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

app.get('/api/reports/executive', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  // Query params: period=monthly|quarterly|yearly, format=excel|pdf
  const { period = 'monthly', format = 'excel' } = req.query;
  let startDate, endDate;
  const now = dayjs();
  if (period === 'monthly') {
    startDate = now.startOf('month').format('YYYY-MM-DD');
    endDate = now.endOf('month').format('YYYY-MM-DD');
  } else if (period === 'quarterly') {
    startDate = now.startOf('quarter').format('YYYY-MM-DD');
    endDate = now.endOf('quarter').format('YYYY-MM-DD');
  } else {
    startDate = now.startOf('year').format('YYYY-MM-DD');
    endDate = now.endOf('year').format('YYYY-MM-DD');
  }
  try {
    // Quantitative info: total candidates, interviews, selected, rejected, etc.
    const [[{ total_candidates }]] = await db.execute('SELECT COUNT(*) as total_candidates FROM candidates WHERE created_at BETWEEN ? AND ?', [startDate, endDate]);
    const [[{ total_interviews }]] = await db.execute('SELECT COUNT(*) as total_interviews FROM candidate_interview_history WHERE interview_date BETWEEN ? AND ?', [startDate, endDate]);
    const [[{ selected }]] = await db.execute("SELECT COUNT(*) as selected FROM candidate_interview_history WHERE result = 'Selected' AND interview_date BETWEEN ? AND ?", [startDate, endDate]);
    const [[{ rejected }]] = await db.execute("SELECT COUNT(*) as rejected FROM candidate_interview_history WHERE result = 'Rejected' AND interview_date BETWEEN ? AND ?", [startDate, endDate]);
    const [[{ on_hold }]] = await db.execute("SELECT COUNT(*) as on_hold FROM candidate_interview_history WHERE result = 'On Hold' AND interview_date BETWEEN ? AND ?", [startDate, endDate]);
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Executive Report');
      sheet.addRow(['Metric', 'Value']);
      sheet.addRow(['Total Candidates', total_candidates]);
      sheet.addRow(['Total Interviews', total_interviews]);
      sheet.addRow(['Selected', selected]);
      sheet.addRow(['Rejected', rejected]);
      sheet.addRow(['On Hold', on_hold]);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=executive_report_${period}_${now.format('YYYYMMDD')}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=executive_report_${period}_${now.format('YYYYMMDD')}.pdf`);
      doc.fontSize(20).text('Executive Recruitment Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)} (${startDate} to ${endDate})`);
      doc.moveDown();
      doc.fontSize(12).text(`Total Candidates: ${total_candidates}`);
      doc.text(`Total Interviews: ${total_interviews}`);
      doc.text(`Selected: ${selected}`);
      doc.text(`Rejected: ${rejected}`);
      doc.text(`On Hold: ${on_hold}`);
      doc.end();
      doc.pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advanced Analytics Reports
app.get('/api/reports/analytics', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  try {
    // 1. Candidates added over time (e.g., last 6 months)
    const [candidatesByMonth] = await db.execute(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM candidates
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month;
    `);

    // 2. Interview results distribution
    const [interviewOutcomes] = await db.execute(`
      SELECT result, COUNT(*) as count
      FROM candidate_interview_history
      WHERE result IS NOT NULL AND result != ''
      GROUP BY result;
    `);

    // 3. Competency ratings average
    const [[competencyAverages]] = await db.execute(`
      SELECT
        AVG(communication) as communication,
        AVG(cultural_fit) as cultural_fit,
        AVG(passion) as passion,
        AVG(leadership) as leadership,
        AVG(learning_agility) as learning_agility
      FROM competency_ratings;
    `);

    res.json({
      candidatesByMonth,
      interviewOutcomes,
      competencyAverages: competencyAverages || {},
    });

  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

app.get('/api/reports/recruitment-funnel', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

app.get('/api/reports/performance-metrics', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

app.get('/api/reports/time-to-hire', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

app.get('/api/reports/competency-analysis', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

app.get('/api/reports/custom', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});
import { Configuration, OpenAIApi } from 'openai';
import nodemailer from 'nodemailer';
// OpenAI setup
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

// Nodemailer setup (demo: use environment variables for SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// AI-generated feedback summary for a candidate
app.get('/api/candidates/:id/feedback-summary', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  const candidateId = req.params.id;
  try {
    const [feedbackRows] = await db.execute('SELECT feedback_text FROM feedback WHERE candidate_id = ?', [candidateId]);
    const feedbackTexts = feedbackRows.map(f => f.feedback_text).join('\n');
    if (!feedbackTexts) return res.json({ summary: 'No feedback available.' });
    const prompt = `Summarize the following interview feedback for candidate ${candidateId} in 3-5 sentences:\n${feedbackTexts}`;
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });
    const summary = completion.data.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to get pending feedbacks for reminders
app.get('/api/pending-feedback', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  try {
    // Example: feedbacks with empty feedback_text are pending
    const [pending] = await db.execute('SELECT f.id, f.candidate_id, f.stage, f.panel_member, u.email FROM feedback f JOIN users u ON f.panel_member = u.id WHERE f.feedback_text IS NULL OR f.feedback_text = ""');
    res.json({ pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send email reminders for pending feedback
app.post('/api/send-feedback-reminders', authenticateToken, authorizeRoles('Admin', 'HR Manager'), async (req, res) => {
  try {
    const [pending] = await db.execute('SELECT f.id, f.candidate_id, f.stage, f.panel_member, u.email FROM feedback f JOIN users u ON f.panel_member = u.id WHERE f.feedback_text IS NULL OR f.feedback_text = ""');
    let sent = 0;
    for (const item of pending) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: item.email,
        subject: 'Pending Interview Feedback Reminder',
        text: `You have pending feedback for candidate ${item.candidate_id} at stage ${item.stage}. Please submit your feedback.`,
      });
      sent++;
    }
    res.json({ success: true, sent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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
import NodeCache from 'node-cache';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Role-based middleware
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

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
  const { name, email, phone, resume_url, tags } = req.body;
  const cv_file = req.file ? req.file.filename : null;
  try {
    await db.execute('INSERT INTO candidates (name, email, phone, resume_url, cv_file, tags, enabled) VALUES (?, ?, ?, ?, ?, ?, TRUE)', [name, email, phone, resume_url, cv_file, tags]);
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

// NodeCache instance for caching
const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds default TTL


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});


// Candidates CRUD with caching and audit log
app.get('/api/candidates', authenticateToken, async (req, res) => {
  const cacheKey = 'candidates_list';
  const cached = cache.get(cacheKey);
  if (cached) {
    // Audit log: cache hit
    await db.execute('INSERT INTO competency_ratings (candidate_id, communication, cultural_fit, passion, leadership, learning_agility, rated_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [null, 0, 0, 0, 0, 0, 'cache']);
    return res.json(cached);
  }
  try {
    const [rows] = await db.execute('SELECT * FROM candidates');
    cache.set(cacheKey, rows);
    // Audit log: API fetch
    await db.execute('INSERT INTO competency_ratings (candidate_id, communication, cultural_fit, passion, leadership, learning_agility, rated_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [null, 0, 0, 0, 0, 0, 'api']);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/candidates', authenticateToken, authorizeRoles('Admin', 'HR Manager', 'Recruiter'), async (req, res) => {
  const { name, email, phone, resume_url, tags } = req.body;
  try {
    const [result] = await db.execute('INSERT INTO candidates (name, email, phone, resume_url, tags) VALUES (?, ?, ?, ?, ?)', [name, email, phone, resume_url, tags]);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update candidate (add tags support)
app.put('/api/candidates/:id', authenticateToken, authorizeRoles('Admin', 'HR Manager', 'Recruiter'), async (req, res) => {
  const { name, email, phone, resume_url, cv_file, tags, enabled } = req.body;
  try {
    await db.execute(
      'UPDATE candidates SET name = ?, email = ?, phone = ?, resume_url = ?, cv_file = ?, tags = ?, enabled = ? WHERE id = ?',
      [name, email, phone, resume_url, cv_file, tags, enabled, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Competency Ratings
app.post('/api/competency', authenticateToken, authorizeRoles('Panelist', 'HR Manager', 'Admin'), async (req, res) => {
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
app.post('/api/feedback', authenticateToken, authorizeRoles('Panelist', 'HR Manager', 'Admin'), async (req, res) => {
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
app.post('/api/recommendations', authenticateToken, authorizeRoles('HR Manager', 'Admin'), async (req, res) => {
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
app.get('/api/dashboard', authenticateToken, async (req, res) => {
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
