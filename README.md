
# ATS Project: Local Development Setup

## Features

- **Authentication & Role-based Access**: JWT login, Admin, HR Manager, Recruiter, Panelist roles
- **Candidate Management**: Add, update, enable/disable, import/export (Excel), CV upload, tags (select/add/remove)
- **Interview History**: Track multiple interviews per candidate, view full history
- **Competency Ratings**: Panelists rate candidates on multiple competencies
- **Feedback & Recommendations**: Submit feedback, final recommendations, AI-generated feedback summary
- **Dashboards**: Role-based dashboards for Admin, HR, Recruiter, Panelist
- **Notifications**: In-app notifications for pending feedback, reminders, AI summaries
- **Reporting & Export**:
  - Candidate journey export (Excel/PDF)
  - Executive recruitment report (monthly/quarterly/yearly, Excel/PDF)
- **Audit Logging**: Track all key actions for compliance
- **API Caching**: Fast repeated queries
- **Security**: Password hashing, JWT, role-based endpoint protection
- **Admin Tools**: Enable/disable users/candidates, import/export, reporting
- **UI/UX**: Modern React UI, Tailwind CSS, Snackbar notifications, filters (date, stage, location, tag)


## Prerequisites
- Node.js (v18+ recommended)
- npm
- MySQL server

## 1. Database Setup
1. Start your MySQL server.
2. Import the schema and demo data:
   ```bash
   mysql -u root -p < backend/ats_db.sql
   mysql -u root -p ats_db < backend/demo_users.sql
   ```
   (Change username/password as needed)

## 2. Backend Setup
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   npm install
   npm start
   ```
2. The backend runs on port 5000 by default.

## 3. Frontend Setup
1. Open a separate terminal in the `candideval` directory:
   ```bash
   cd candideval
   npm install
   npm start
   ```
2. The frontend runs on port 3000 by default.

## 4. Connecting Frontend and Backend
- The frontend uses axios to call backend APIs (e.g., `/api/auth/login`).
- For local development, you may need to set up a proxy in `candideval/package.json`:
  ```json
  "proxy": "http://localhost:5000"
  ```
  (Add this line to the root of the package.json object)

## 5. Development Tips
- Make sure both backend and frontend servers are running.
- Update `.env` in `backend` for custom DB credentials.
- Use MySQL Workbench or CLI to view/edit data.

---
For any issues, check terminal output for errors and ensure all dependencies are installed.