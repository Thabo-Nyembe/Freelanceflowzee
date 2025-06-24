#!/bin/bash

# Set environment variables for testing
export NODE_ENV=test
export PLAYWRIGHT_BROWSERS_PATH=0

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Install Playwright browsers if not already installed
echo "Installing Playwright browsers..."
npx playwright install --with-deps

# Run the AI feature tests
echo "Running AI feature tests..."
npx playwright test tests/ai-features.test.ts --headed

# Check test results
if [ $? -eq 0 ]; then
  echo "✅ All AI feature tests passed!"
else
  echo "❌ Some tests failed. Check the test report for details."
  exit 1
fi 