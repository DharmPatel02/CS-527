#!/bin/bash

# Netlify Deployment Script
echo "Starting Netlify deployment..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Build the project first
echo "Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "Build successful! Deploying to Netlify..."
    
    # Deploy using Netlify CLI
    netlify deploy --prod --dir=build
    
    echo "Deployment completed!"
else
    echo "Build failed! Please check the errors above."
    exit 1
fi 