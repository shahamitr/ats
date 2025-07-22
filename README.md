
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

## Quick Install via Script (Recommended)

This script automates the entire Dockerized setup.

### Prerequisites
- Docker & Docker Compose
- Node.js (for a one-time data generation step)

### Steps
1.  **Make the script executable (if needed on Linux/macOS)**:
    ```bash
    chmod +x install.sh
    ```
2.  **Run the installer**:
    ```bash
    ./install.sh
    ```
The script will check prerequisites, generate demo data, and launch the application.

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: `http://localhost:5000`

To stop the application, run `docker-compose down`.

**Note on Docker Configuration**: The Docker setup requires a `.env` file in the `backend` directory. Copy `backend/.env.docker.example` to `backend/.env`. This file is pre-configured to connect to the database and other services within the Docker network.

---

## Manual Development Setup

### Option 1: Using Docker Compose

This method is for developers who want to manage the containers manually.

1.  **Configure Environment**: In the `backend` directory, copy `backend/.env.docker.example` to `backend/.env`.

### Prerequisites
- Docker
- Docker Compose

### Steps
1.  **Generate Demo Data**: The Docker setup uses a large set of demo candidates. Run this command once to generate the required SQL file:
    ```bash
    node backend/generate_demo_data.js
    ```
2.  **Start the Application**: From the root directory of the project, run:
    ```bash
    docker-compose up --build
    ```
3.  **Access the App**: Open your browser and go to `http://localhost:3000`.

The backend API will be available at `http://localhost:5000`, and the MySQL database at `localhost:3306`.

### Option 2: Local Node.js (Without Docker)
- Node.js (v18+ recommended)
- npm
- MySQL server

### Steps
1.  **Install Dependencies**: From the project root, run the helper script:
    ```bash
    npm run install:all
    ```
    (Or if you have npm v7+, you can just run `npm install` from the root).

2.  **Configure Environment**:
    - In the `backend` directory, copy `.env.example` to `.env` and update database credentials if they differ from the defaults.
    - In the `candideval` directory, copy its `.env.example` to `.env`. The default `REACT_APP_API_BASE_URL=http://localhost:5000/api` should work for local development.

3.  **Database Setup**:
    - Start your MySQL server.
    - Import the schema and demo data:
      ```bash
      mysql -u root -p < backend/ats_db.sql
      mysql -u root -p ats_db < backend/demo_users.sql
      ```
      (Change username/password as needed)

4.  **Run the App**: From the project root, run the `dev` script:
    ```bash
    npm run dev
    ```
    This command uses `concurrently` to start both the backend server (on port 5000) and the frontend React app (on port 3000) in a single terminal.

## 3. Development Tips
- Make sure both backend and frontend servers are running.
- Update `.env` in `backend` for custom DB credentials.
- Use MySQL Workbench or a CLI to view/edit data.