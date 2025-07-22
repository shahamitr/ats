#!/bin/bash

# Script to install dependencies and run the ATS project in development mode.
# Assumes it is run from the root directory of the project.

# --- Prerequisites Check ---
command -v node >/dev/null 2>&1 || { echo >&2 "Error: Node.js is not installed. Please install it and try again. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Error: npm is not installed. Please install it and try again. Aborting."; exit 1; }

echo "NOTE: This script automates running the project, but not the initial database setup."
echo "If this is your first time, please ensure your MySQL server is running and you have executed the following commands in your MySQL client:"
echo "  => mysql -u root -p < backend/ats_db.sql"
echo "  => mysql -u root -p ats_db < backend/demo_users.sql"
echo ""
read -p "Press [Enter] to continue..."

# Exit on any subsequent error
set -e

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nShutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        echo "Backend server (PID: $BACKEND_PID) stopped."
    fi
    exit 0
}

# Trap Ctrl+C (INT signal) and call the cleanup function
trap cleanup INT

# --- Backend ---
echo ">>> Starting Backend Server..."
cd backend
echo "(Backend) Installing dependencies (if needed)..."
npm install --quiet
echo "(Backend) Starting server on port 5000 in the background..."
npm start &
BACKEND_PID=$!
cd ..
echo "Backend server started with PID: $BACKEND_PID"
echo ""

# --- Frontend ---
echo ">>> Starting Frontend Server..."
cd candideval
echo "(Frontend) Installing dependencies (if needed)..."
npm install --quiet
echo "(Frontend) Starting dev server on port 3000..."
npm start

# The script will wait here. The 'trap' will handle cleanup on Ctrl+C.