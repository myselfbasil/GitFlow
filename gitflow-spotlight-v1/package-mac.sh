#!/bin/bash

# Script to package GitFlow Spotlight for macOS
echo "Packaging GitFlow Spotlight for macOS..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create iconset directory
echo "Creating iconset directory..."
mkdir -p GitFlowSpotlight.iconset

# Generate different icon sizes from the main icon
echo "Generating icon sizes..."
convert assets/icon.png -resize 16x16 GitFlowSpotlight.iconset/icon_16x16.png
convert assets/icon.png -resize 32x32 GitFlowSpotlight.iconset/icon_16x16@2x.png
convert assets/icon.png -resize 32x32 GitFlowSpotlight.iconset/icon_32x32.png
convert assets/icon.png -resize 64x64 GitFlowSpotlight.iconset/icon_32x32@2x.png
convert assets/icon.png -resize 128x128 GitFlowSpotlight.iconset/icon_128x128.png
convert assets/icon.png -resize 256x256 GitFlowSpotlight.iconset/icon_128x128@2x.png
convert assets/icon.png -resize 256x256 GitFlowSpotlight.iconset/icon_256x256.png
convert assets/icon.png -resize 512x512 GitFlowSpotlight.iconset/icon_256x256@2x.png
convert assets/icon.png -resize 512x512 GitFlowSpotlight.iconset/icon_512x512.png
convert assets/icon.png -resize 1024x1024 GitFlowSpotlight.iconset/icon_512x512@2x.png

# For macOS, we would use iconutil to create the .icns file
# Since we're in Linux, we'll use a placeholder comment
echo "Note: On macOS, you would run: iconutil -c icns GitFlowSpotlight.iconset"
echo "For now, we'll use the PNG icon directly in electron-builder"

# Build the app
echo "Building the app..."
npm run build-mac

echo "Packaging complete! Check the dist directory for the .app bundle."
