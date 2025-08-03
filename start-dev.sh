#!/bin/bash

# HR System Backend - Development Server Starter
echo "🚀 Starting HR System Backend..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the development server
echo "🌟 Starting development server..."
echo "📚 API Documentation will be available at: http://localhost:3000/api/docs"
echo "🔗 API Base URL: http://localhost:3000/api/v1"
echo ""

npm run start:dev
