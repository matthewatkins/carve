#!/bin/bash

# Clean script for the monorepo
# Removes node_modules, dist, bun.lockb, .turbo, .output, and .nuxt directories/files recursively

echo "🧹 Cleaning monorepo..."

# Remove node_modules directories
echo "Removing node_modules directories..."
find . -name 'node_modules' -type d -exec rm -rf {} + 2>/dev/null || true

# Remove dist directories
echo "Removing dist directories..."
find . -name 'dist' -type d -exec rm -rf {} + 2>/dev/null || true

# Remove bun.lockb files
echo "Removing bun.lockb files..."
find . -name 'bun.lockb' -type f -delete 2>/dev/null || true

# Remove .turbo directories
echo "Removing .turbo directories..."
find . -name '.turbo' -type d -exec rm -rf {} + 2>/dev/null || true

# Remove .output directories
echo "Removing .output directories..."
find . -name '.output' -type d -exec rm -rf {} + 2>/dev/null || true

# Remove .nuxt directories
echo "Removing .nuxt directories..."
find . -name '.nuxt' -type d -exec rm -rf {} + 2>/dev/null || true

echo "✅ Cleanup complete!"