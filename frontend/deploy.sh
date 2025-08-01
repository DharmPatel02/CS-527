#!/bin/bash

# Deployment script for Vercel
echo "Starting deployment process..."

# Clean install dependencies
echo "Installing dependencies..."
npm ci

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful! Ready for deployment."
    echo "You can now deploy to Vercel using:"
    echo "1. Vercel CLI: vercel --prod"
    echo "2. Or connect your GitHub repository to Vercel"
else
    echo "Build failed! Please check the errors above."
    exit 1
fi 