#!/bin/bash

# Quick start script for MCP-UI Calculator

set -e

echo "╔═════════════════════════════════════════════════════════════╗"
echo "║    MCP-UI Calculator - Quick Start Setup                    ║"
echo "╚═════════════════════════════════════════════════════════════╝"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "╔═════════════════════════════════════════════════════════════╗"
echo "║                   Setup Complete! 🎉                        ║"
echo "╚═════════════════════════════════════════════════════════════╝"

echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start the server:"
echo "    npm start"
echo ""
echo "2️⃣  Open calculator in browser:"
echo "    http://localhost:3000/calculator"
echo ""
echo "3️⃣  To connect to ChatGPT, expose with ngrok:"
echo "    brew install ngrok"
echo "    ngrok http 3000"
echo ""
echo "4️⃣  For development with hot reload:"
echo "    npm run dev"
echo ""
echo "📖 See GUIDE.md for ChatGPT integration instructions"
echo ""
