#!/bin/bash

# Exit on error
set -e

echo "Setting up test environment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Install Playwright browsers if needed
npx playwright install

# Run database migrations
echo "Running database migrations..."
node scripts/apply-migrations.js

# Create test user if it doesn't exist
echo "Setting up test user..."
node scripts/create-test-user.js

# Run the tests
echo "Running feature tests..."
npx playwright test scripts/test-files-and-community-features.js

echo "Tests completed successfully!" 