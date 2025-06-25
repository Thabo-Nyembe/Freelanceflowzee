#!/bin/bash

# Kill any processes running on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Kill any processes running on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start the Next.js development server on port 3001
NODE_OPTIONS='--max-old-space-size=16384' next dev -p 3001 