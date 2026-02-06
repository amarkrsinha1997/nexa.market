#!/bin/bash
# Deployment script for Nexa Market on production server
# Run this script on your GCP VM instance

set -e  # Exit on any error

echo "🚀 Starting Nexa Market deployment..."

# Navigate to project directory
cd ~/nexa.market || { echo "❌ Project directory not found"; exit 1; }

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Install dependencies (in case there are new ones)
echo "📦 Installing dependencies..."
npm install

# Run database migrations (if any)
echo "🗄️ Running database migrations..."
npm run db:migrate:deploy

# Build the application
echo "🔨 Building application..."
npm run build

# Restart PM2 process
echo "♻️ Restarting PM2 process..."
pm2 restart nexa-market

# Show status
echo "✅ Deployment complete!"
pm2 status nexa-market
pm2 logs nexa-market --lines 20
