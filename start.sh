#!/bin/bash

# Addina E-commerce React App Setup Script
# This script sets up the development environment for the Addina e-commerce homepage

echo "🚀 Setting up Addina E-commerce React App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Start the development server
echo "🔥 Starting development server..."
echo "📱 Your Addina e-commerce app will be available at: http://localhost:8080"
echo "⭐ Press Ctrl+C to stop the server"

npm run dev

# Note: The server will start and the script will keep running
# Press Ctrl+C to stop the development server