#!/bin/bash
# Simple start script for GitFlow Spotlight

# Ensure we're in the correct directory
cd "$(dirname "$0")" || exit 1

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the application
npm start
