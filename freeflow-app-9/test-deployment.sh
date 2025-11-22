#!/bin/bash

# ============================================================================
# AI CREATE - DEPLOYMENT SIMULATION & TEST SCRIPT
# ============================================================================
#
# This script simulates the deployment process without actually deploying
# to production. It verifies all steps work correctly in a safe environment.
#
# Usage:
#   ./test-deployment.sh
#
# What it does:
#   1. Verifies all deployment prerequisites
#   2. Runs a production build
#   3. Starts the server locally on port 9324 (not 9323)
#   4. Runs health checks
#   5. Simulates monitoring checks
#   6. Tests rollback procedure
#   7. Generates deployment report
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test port (different from production)
TEST_PORT=9324
TEST_PID_FILE=".test-server.pid"
TEST_BUILD_DIR=".next-test"

# Results
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
  echo ""
  echo "============================================================================"
  echo -e "${CYAN}$1${NC}"
  echo "============================================================================"
  echo ""
}

print_step() {
  echo ""
  echo -e "${BLUE}▶ $1${NC}"
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
  echo -e "${RED}✗ $1${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

cleanup() {
  print_step "Cleaning up test environment"

  # Stop test server if running
  if [ -f "$TEST_PID_FILE" ]; then
    kill $(cat $TEST_PID_FILE) 2>/dev/null || true
    rm $TEST_PID_FILE
    success "Test server stopped"
  fi

  # Remove test build
  if [ -d "$TEST_BUILD_DIR" ]; then
    rm -rf $TEST_BUILD_DIR
    success "Test build directory removed"
  fi
}

# Trap cleanup on exit
trap cleanup EXIT

# ============================================================================
# DEPLOYMENT SIMULATION
# ============================================================================

print_header "AI CREATE - DEPLOYMENT SIMULATION TEST"

# ----------------------------------------------------------------------------
# 1. PRE-FLIGHT CHECKS
# ----------------------------------------------------------------------------

print_step "1. Running pre-flight checks"

# Check if verification script exists
if [ -f "verify-deployment-ready.sh" ]; then
  success "Verification script found"

  # Run verification
  if bash verify-deployment-ready.sh >/dev/null 2>&1; then
    success "Pre-deployment verification passed"
  else
    fail "Pre-deployment verification failed"
    echo "Run ./verify-deployment-ready.sh to see details"
    exit 1
  fi
else
  fail "verify-deployment-ready.sh not found"
  exit 1
fi

# ----------------------------------------------------------------------------
# 2. BUILD TEST
# ----------------------------------------------------------------------------

print_step "2. Testing production build"

# Clean any existing test build
rm -rf $TEST_BUILD_DIR 2>/dev/null || true

echo "Building for production (this may take 30-60 seconds)..."

# Run production build
if NODE_ENV=production npm run build > /tmp/test-build.log 2>&1; then
  BUILD_SIZE=$(du -sh .next 2>/dev/null | awk '{print $1}')
  success "Production build successful ($BUILD_SIZE)"

  # Check for build errors in log
  if grep -qi "error" /tmp/test-build.log; then
    fail "Build log contains errors"
    tail -20 /tmp/test-build.log
  else
    success "Build log clean (no errors)"
  fi
else
  fail "Production build failed"
  tail -50 /tmp/test-build.log
  exit 1
fi

# ----------------------------------------------------------------------------
# 3. SERVER START TEST
# ----------------------------------------------------------------------------

print_step "3. Testing server startup"

# Start server on test port
echo "Starting test server on port $TEST_PORT..."

PORT=$TEST_PORT NODE_ENV=production npm run start > /tmp/test-server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > $TEST_PID_FILE

# Wait for server to start
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null 2>&1; then
  success "Server started (PID: $SERVER_PID)"
else
  fail "Server failed to start"
  cat /tmp/test-server.log
  exit 1
fi

# ----------------------------------------------------------------------------
# 4. HEALTH CHECKS
# ----------------------------------------------------------------------------

print_step "4. Running health checks"

# Basic connectivity
if curl -f http://localhost:$TEST_PORT > /dev/null 2>&1; then
  success "Server responding on port $TEST_PORT"
else
  fail "Server not responding"
  exit 1
fi

# Health endpoint (if exists)
if curl -f http://localhost:$TEST_PORT/api/health > /dev/null 2>&1; then
  HEALTH_DATA=$(curl -s http://localhost:$TEST_PORT/api/health)
  success "Health endpoint responding: $HEALTH_DATA"
else
  echo -e "${YELLOW}⚠ Health endpoint not found (optional)${NC}"
fi

# AI Create page
if curl -f http://localhost:$TEST_PORT/dashboard/ai-create > /dev/null 2>&1; then
  success "AI Create page accessible"
else
  fail "AI Create page not accessible"
fi

# Check page load time
START_TIME=$(date +%s%N)
curl -s http://localhost:$TEST_PORT/dashboard/ai-create > /dev/null
END_TIME=$(date +%s%N)
LOAD_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))

if [ $LOAD_TIME -lt 1000 ]; then
  success "Page load time: ${LOAD_TIME}ms (excellent)"
elif [ $LOAD_TIME -lt 2000 ]; then
  success "Page load time: ${LOAD_TIME}ms (good)"
else
  echo -e "${YELLOW}⚠ Page load time: ${LOAD_TIME}ms (could be improved)${NC}"
fi

# ----------------------------------------------------------------------------
# 5. BUNDLE SIZE CHECKS
# ----------------------------------------------------------------------------

print_step "5. Verifying bundle sizes"

# Check AI Create bundle size
AI_CREATE_BUNDLE=$(find .next -name "*ai-create*.js" -exec du -ch {} + 2>/dev/null | grep total | awk '{print $1}')
if [ ! -z "$AI_CREATE_BUNDLE" ]; then
  success "AI Create bundle: $AI_CREATE_BUNDLE"

  # Check if under 150KB
  BUNDLE_KB=$(echo $AI_CREATE_BUNDLE | sed 's/K//')
  if [ "${BUNDLE_KB%.*}" -lt 150 ]; then
    success "Bundle size within target (<150KB)"
  else
    echo -e "${YELLOW}⚠ Bundle size above target (${AI_CREATE_BUNDLE})${NC}"
  fi
else
  fail "Could not find AI Create bundle"
fi

# Check total First Load JS
if [ -f ".next/build-manifest.json" ]; then
  success "Build manifest exists"
else
  fail "Build manifest not found"
fi

# ----------------------------------------------------------------------------
# 6. SIMULATED MONITORING CHECKS
# ----------------------------------------------------------------------------

print_step "6. Simulating monitoring checks"

# Simulate error check (should be 0 initially)
echo "Checking for errors in server log..."
if grep -qi "error" /tmp/test-server.log; then
  ERROR_COUNT=$(grep -i "error" /tmp/test-server.log | wc -l)
  if [ $ERROR_COUNT -lt 5 ]; then
    echo -e "${YELLOW}⚠ Found $ERROR_COUNT errors in server log${NC}"
  else
    fail "Found $ERROR_COUNT errors in server log"
  fi
else
  success "No errors in server log"
fi

# Simulate uptime check
if ps -p $SERVER_PID > /dev/null 2>&1; then
  UPTIME=$(ps -p $SERVER_PID -o etime= | tr -d ' ')
  success "Server uptime: $UPTIME"
else
  fail "Server not running"
fi

# Simulate memory check
if command -v ps >/dev/null 2>&1; then
  MEMORY_MB=$(ps -p $SERVER_PID -o rss= | awk '{print int($1/1024)}')
  if [ $MEMORY_MB -lt 500 ]; then
    success "Memory usage: ${MEMORY_MB}MB (good)"
  else
    echo -e "${YELLOW}⚠ Memory usage: ${MEMORY_MB}MB (monitor in production)${NC}"
  fi
fi

# ----------------------------------------------------------------------------
# 7. ROLLBACK TEST
# ----------------------------------------------------------------------------

print_step "7. Testing rollback procedure"

# Simulate rollback by stopping server
echo "Simulating rollback (stopping server)..."
if [ -f "$TEST_PID_FILE" ]; then
  OLD_PID=$(cat $TEST_PID_FILE)
  kill $OLD_PID 2>/dev/null || true

  # Wait for shutdown
  sleep 2

  if ps -p $OLD_PID > /dev/null 2>&1; then
    fail "Server still running after stop command"
  else
    success "Server stopped successfully"
  fi

  # Simulate restart
  echo "Simulating restart after rollback..."
  PORT=$TEST_PORT NODE_ENV=production npm run start > /tmp/test-server-2.log 2>&1 &
  NEW_PID=$!
  echo $NEW_PID > $TEST_PID_FILE

  sleep 3

  if ps -p $NEW_PID > /dev/null 2>&1; then
    success "Server restarted successfully (new PID: $NEW_PID)"

    # Verify it's responding
    if curl -f http://localhost:$TEST_PORT > /dev/null 2>&1; then
      success "Rollback verification: Server responding"
    else
      fail "Rollback verification: Server not responding"
    fi
  else
    fail "Server failed to restart"
  fi
else
  fail "PID file not found"
fi

# ----------------------------------------------------------------------------
# 8. STRESS TEST (Light)
# ----------------------------------------------------------------------------

print_step "8. Running light stress test"

echo "Sending 10 concurrent requests..."

# Send 10 requests in parallel
for i in {1..10}; do
  curl -s http://localhost:$TEST_PORT/dashboard/ai-create > /dev/null &
done

# Wait for all requests
wait

# Check if server is still responsive
if curl -f http://localhost:$TEST_PORT > /dev/null 2>&1; then
  success "Server handled concurrent requests"
else
  fail "Server became unresponsive"
fi

# ----------------------------------------------------------------------------
# FINAL REPORT
# ----------------------------------------------------------------------------

print_header "DEPLOYMENT SIMULATION REPORT"

echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${GREEN}🎉 DEPLOYMENT SIMULATION SUCCESSFUL${NC}"
  echo ""
  echo "The deployment process has been validated. You can proceed with confidence:"
  echo ""
  echo "  1. Configure production environment (.env.production)"
  echo "  2. Setup monitoring services"
  echo "  3. Run: ./deploy-production.sh phase1 --dry-run"
  echo "  4. Deploy: ./deploy-production.sh phase1"
  echo ""
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${RED}⚠️  DEPLOYMENT SIMULATION HAD FAILURES${NC}"
  echo ""
  echo "Please review the failed tests above and resolve issues before deploying."
  echo ""
  echo "Logs available at:"
  echo "  - Build log: /tmp/test-build.log"
  echo "  - Server log: /tmp/test-server.log"
  echo ""
  exit 1
fi
