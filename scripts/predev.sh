#!/bin/bash

# Predev script to build shared packages before starting dev servers
echo "🔨 Building shared packages..."

# Build shared packages first (force clean build)
echo "Building @carve/shared-types..."
cd packages/shared-types && bun run build && cd ../..

echo "Building @carve/shared-utils..."
cd packages/shared-utils && bun run build && cd ../..

echo "✅ Shared packages built successfully!"
echo "🚀 Starting dev servers..."