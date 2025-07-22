@echo off
REM Script to install dependencies and run the ATS project in development mode on Windows.
REM Assumes it is run from the root directory of the project.

echo NOTE: This script automates running the project, but not the initial database setup.
echo If this is your first time, please ensure your MySQL server is running and you have executed the following commands in your MySQL client:
echo   => mysql -u root -p ^< backend/ats_db.sql
echo   => mysql -u root -p ats_db ^< backend/demo_users.sql
echo.
pause

REM --- Backend ---
echo >>> Starting Backend Server...
cd backend
echo (Backend) Installing dependencies (if needed)...
call npm install --quiet
echo (Backend) Starting server on port 5000 in a new window...
start "ATS Backend" cmd /c "npm start"
cd ..
echo.

REM --- Frontend ---
echo >>> Starting Frontend Server...
cd candideval
echo (Frontend) Installing dependencies (if needed)...
call npm install --quiet
echo (Frontend) Starting dev server on port 3000...
call npm start

echo Frontend server stopped. Please close the backend server window manually.