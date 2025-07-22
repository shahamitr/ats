#!/bin/bash

# ATS Project - Dockerized Installation Script
# This script automates the setup and launch of the entire application stack using Docker.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- ATS Docker Installer ---"
echo "This script will build and run the application using Docker Compose."
echo

# --- 1. Prerequisite Check ---
echo "Step 1: Checking for prerequisites (Docker, Docker Compose, Node.js)..."

command -v docker >/dev/null 2>&1 || { echo >&2 "Error: Docker is not installed. Please install it and try again. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo >&2 "Error: Docker Compose is not installed. Please install it and try again. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "Error: Node.js is not installed. It's required to generate demo data. Aborting."; exit 1; }

echo "✅ Prerequisites found."
echo

# --- 2. Generate Demo Data ---
echo "Step 2: Generating demo candidate data..."
# The docker-compose setup relies on this file existing.
if [ -f "backend/demo_candidates.sql" ]; then
    echo "☑️ 'demo_candidates.sql' already exists. Skipping generation."
else
    echo "Running script to create 'backend/demo_candidates.sql'..."
    node backend/generate_demo_data.js
    echo "✅ Demo data generated successfully."
fi
echo

# --- 3. Build and Start Containers ---
echo "Step 3: Building and starting Docker containers in the background..."
echo "This may take a few minutes on the first run..."
docker-compose up --build -d

echo
echo "--- ✅ Success! ---"
echo "The application stack is now running."
echo
echo "➡️  Frontend (React App): http://localhost:3000"
echo "➡️  Backend API:          http://localhost:5000"
echo
echo "--- Useful Commands ---"
echo "🔹 To view live logs from all services:  docker-compose logs -f"
echo "🔹 To stop the application:              docker-compose down"
echo