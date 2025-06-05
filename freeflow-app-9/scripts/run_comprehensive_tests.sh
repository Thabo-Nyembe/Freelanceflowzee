#!/bin/bash
# Comprehensive Test Execution Script

set -e

echo "🧪 Running Comprehensive FreeflowZee Test Suite"
echo "================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test execution tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test_suite() {
    local suite_name="$1"
    local command="$2"
    
    echo -e "\n${YELLOW}Running $suite_name...${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $suite_name PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $suite_name FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Ensure server is running
echo "Starting test server..."
npm run dev &
SERVER_PID=$!
sleep 10

# Run test suites
run_test_suite "Dashboard Tests" "npm run test:dashboard"
run_test_suite "Payment Tests" "npm run test:payment"
run_test_suite "API Integration Tests" "npm run test:api"
run_test_suite "Enhanced Dashboard Tests" "npm run test:dashboard-enhanced"
run_test_suite "Comprehensive Payment Tests" "npm run test:payment-comprehensive"
run_test_suite "Mobile Responsive Tests" "npm run test:mobile"

# Kill server
kill $SERVER_PID || true

# Generate summary
echo -e "\n🏁 Test Execution Summary"
echo "=========================="
echo -e "Total Test Suites: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

SUCCESS_RATE=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
echo -e "Success Rate: $SUCCESS_RATE%"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Check logs above.${NC}"
    exit 1
fi
