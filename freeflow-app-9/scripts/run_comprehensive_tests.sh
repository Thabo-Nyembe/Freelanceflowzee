#!/bin/bash
# Comprehensive Test Execution Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set environment variables for testing
export NODE_ENV=test
export PLAYWRIGHT_HTML_REPORT="./playwright-report"
export PLAYWRIGHT_JUNIT_OUTPUT_NAME="./test-results/junit.xml"

echo -e "${GREEN}🚀 Starting FreeflowZee Comprehensive Test Suite${NC}"
echo "================================================="

# Install dependencies if needed
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Install browsers if not already installed
echo -e "\n${YELLOW}🌐 Installing browsers...${NC}"
npx playwright install

# Create test results directory
mkdir -p test-results

# Function to run a test suite
run_test_suite() {
    local suite_name=$1
    local test_pattern=$2
    
    echo -e "\n${YELLOW}🧪 Running ${suite_name}...${NC}"
    npx playwright test "${test_pattern}" \
        --reporter=list,html,junit \
        --workers=2 \
        --retries=1
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ ${suite_name} passed!${NC}"
    else
        echo -e "${RED}❌ ${suite_name} failed!${NC}"
        return $exit_code
    fi
}

# Run test suites in order
echo -e "\n${YELLOW}🔍 Running all test suites...${NC}"

# Authentication tests first
run_test_suite "Authentication Tests" "auth.test.ts"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Authentication tests failed! Stopping test execution.${NC}"
    exit 1
fi

# Run comprehensive test suite
run_test_suite "Comprehensive Tests" "comprehensive.test.ts"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Comprehensive tests failed!${NC}"
    exit 1
fi

# Generate and display test report
echo -e "\n${GREEN}📊 Generating test report...${NC}"
echo "Test report available at: $PLAYWRIGHT_HTML_REPORT/index.html"

# Display test summary
echo -e "\n${GREEN}📝 Test Summary${NC}"
echo "================================================="
echo "✅ Authentication Tests: Passed"
echo "✅ Comprehensive Tests: Passed"
echo "================================================="

echo -e "\n${GREEN}🎉 All tests completed successfully!${NC}"
