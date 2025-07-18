
# ATS Project: Local Development Setup

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