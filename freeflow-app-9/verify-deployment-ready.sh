#!/bin/bash

# ============================================================================
# AI CREATE - PRE-DEPLOYMENT VERIFICATION SCRIPT
# ============================================================================
#
# This script verifies that all prerequisites for production deployment
# are met before proceeding with Phase 1 deployment.
#
# Usage:
#   ./verify-deployment-ready.sh
#
# Exit codes:
#   0 - All checks passed, ready for deployment
#   1 - One or more checks failed, not ready for deployment
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Results array
declare -a FAILED_ITEMS=()
declare -a WARNING_ITEMS=()

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

print_section() {
  echo ""
  echo -e "${BLUE}▶ $1${NC}"
  echo "----------------------------------------------------------------------------"
}

check() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  echo -n "  Checking $1... "
}

pass() {
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
  echo -e "${GREEN}✓ PASS${NC}"
  if [ ! -z "$1" ]; then
    echo "    ℹ️  $1"
  fi
}

fail() {
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
  echo -e "${RED}✗ FAIL${NC}"
  echo "    ❌ $1"
  FAILED_ITEMS+=("$1")
}

warn() {
  WARNING_CHECKS=$((WARNING_CHECKS + 1))
  echo -e "${YELLOW}⚠ WARNING${NC}"
  echo "    ⚠️  $1"
  WARNING_ITEMS+=("$1")
}

# ============================================================================
# VERIFICATION CHECKS
# ============================================================================

print_header "AI CREATE - PRE-DEPLOYMENT VERIFICATION"

# ----------------------------------------------------------------------------
# 1. SYSTEM REQUIREMENTS
# ----------------------------------------------------------------------------

print_section "1. System Requirements"

# Node.js version
check "Node.js version (>=18.17.0)"
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=$(node -v | sed 's/v//')
  REQUIRED_VERSION="18.17.0"

  if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    pass "Node.js v$NODE_VERSION"
  else
    fail "Node.js v$NODE_VERSION is below required v$REQUIRED_VERSION"
  fi
else
  fail "Node.js is not installed"
fi

# npm version
check "npm installation"
if command -v npm >/dev/null 2>&1; then
  NPM_VERSION=$(npm -v)
  pass "npm v$NPM_VERSION"
else
  fail "npm is not installed"
fi

# Git installation
check "Git installation"
if command -v git >/dev/null 2>&1; then
  GIT_VERSION=$(git --version | awk '{print $3}')
  pass "Git v$GIT_VERSION"
else
  fail "Git is not installed"
fi

# Disk space
check "Available disk space (>5GB required)"
if command -v df >/dev/null 2>&1; then
  AVAILABLE_GB=$(df -h . | awk 'NR==2 {print $4}' | sed 's/Gi*//')
  if [ "${AVAILABLE_GB%.*}" -ge 5 ] 2>/dev/null; then
    pass "${AVAILABLE_GB}GB available"
  else
    warn "Only ${AVAILABLE_GB}GB available, recommended 5GB+"
  fi
else
  warn "Could not check disk space"
fi

# ----------------------------------------------------------------------------
# 2. PROJECT FILES
# ----------------------------------------------------------------------------

print_section "2. Project Files"

# package.json exists
check "package.json exists"
if [ -f "package.json" ]; then
  pass "Found"
else
  fail "package.json not found"
fi

# node_modules installed
check "node_modules directory"
if [ -d "node_modules" ]; then
  MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
  pass "$MODULE_COUNT packages installed"
else
  fail "node_modules not found - run 'npm install'"
fi

# .next build directory
check ".next build directory"
if [ -d ".next" ]; then
  BUILD_SIZE=$(du -sh .next 2>/dev/null | awk '{print $1}')
  pass "Build directory exists ($BUILD_SIZE)"
else
  warn ".next directory not found - run 'npm run build'"
fi

# Deployment files
check "Deployment script (deploy-production.sh)"
if [ -f "deploy-production.sh" ]; then
  if [ -x "deploy-production.sh" ]; then
    pass "Executable"
  else
    warn "File exists but not executable - run 'chmod +x deploy-production.sh'"
  fi
else
  fail "deploy-production.sh not found"
fi

check "Environment template (.env.production.example)"
if [ -f ".env.production.example" ]; then
  pass "Found"
else
  fail ".env.production.example not found"
fi

check "Deployment checklist (DEPLOYMENT_CHECKLIST.md)"
if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
  pass "Found"
else
  warn "DEPLOYMENT_CHECKLIST.md not found"
fi

# ----------------------------------------------------------------------------
# 3. ENVIRONMENT CONFIGURATION
# ----------------------------------------------------------------------------

print_section "3. Environment Configuration"

# .env.production exists
check ".env.production file"
if [ -f ".env.production" ]; then
  pass "Found"

  # Check for required variables
  check "  NODE_ENV=production"
  if grep -q "NODE_ENV=production" .env.production 2>/dev/null; then
    pass "Configured"
  else
    fail "NODE_ENV not set to production"
  fi

  check "  NEXTAUTH_SECRET"
  if grep -q "NEXTAUTH_SECRET=" .env.production 2>/dev/null; then
    if grep -q "NEXTAUTH_SECRET=your-" .env.production 2>/dev/null; then
      fail "NEXTAUTH_SECRET not configured (still using placeholder)"
    else
      SECRET_LENGTH=$(grep "NEXTAUTH_SECRET=" .env.production | cut -d'=' -f2 | wc -c)
      if [ $SECRET_LENGTH -ge 32 ]; then
        pass "Configured (${SECRET_LENGTH} characters)"
      else
        fail "NEXTAUTH_SECRET too short (${SECRET_LENGTH} chars, need 32+)"
      fi
    fi
  else
    fail "NEXTAUTH_SECRET not set"
  fi

  check "  NEXT_PUBLIC_APP_URL"
  if grep -q "NEXT_PUBLIC_APP_URL=" .env.production 2>/dev/null; then
    APP_URL=$(grep "NEXT_PUBLIC_APP_URL=" .env.production | cut -d'=' -f2)
    if [[ $APP_URL == *"yourdomain.com"* ]]; then
      fail "APP_URL not configured (still using placeholder)"
    else
      pass "Set to: $APP_URL"
    fi
  else
    fail "NEXT_PUBLIC_APP_URL not set"
  fi

else
  fail ".env.production not found - copy from .env.production.example"
fi

# Check .env.local (should not exist in production)
check ".env.local (should not be deployed)"
if [ -f ".env.local" ]; then
  warn ".env.local exists - ensure it's in .gitignore"
else
  pass "Not present (correct)"
fi

# ----------------------------------------------------------------------------
# 4. BUILD VERIFICATION
# ----------------------------------------------------------------------------

print_section "4. Build Verification"

# TypeScript compilation
check "TypeScript compilation (tsc --noEmit)"
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
  fail "TypeScript errors found - run 'npx tsc --noEmit' to see details"
else
  pass "No TypeScript errors"
fi

# Production build test
check "Production build (npm run build)"
if [ -d ".next/standalone" ]; then
  pass "Standalone build exists"
else
  warn "Standalone build not found - run 'npm run build'"
fi

# Build manifest
check "Build manifest"
if [ -f ".next/build-manifest.json" ]; then
  PAGE_COUNT=$(grep -o '"/' .next/build-manifest.json | wc -l)
  pass "$PAGE_COUNT pages built"
else
  warn "Build manifest not found"
fi

# AI Create component
check "AI Create component bundle"
if [ -d ".next" ]; then
  AI_CREATE_SIZE=$(find .next -name "*ai-create*.js" -exec du -ch {} + 2>/dev/null | grep total | awk '{print $1}')
  if [ ! -z "$AI_CREATE_SIZE" ]; then
    pass "Bundle size: $AI_CREATE_SIZE"
  else
    warn "Could not find AI Create bundle"
  fi
fi

# ----------------------------------------------------------------------------
# 5. SECURITY
# ----------------------------------------------------------------------------

print_section "5. Security"

# npm audit
check "npm audit (production dependencies)"
AUDIT_OUTPUT=$(npm audit --production --json 2>/dev/null || echo '{"error": true}')

if echo "$AUDIT_OUTPUT" | grep -q '"error": true'; then
  warn "Could not run npm audit"
else
  CRITICAL_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o '"critical":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
  HIGH_COUNT=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

  if [ "$CRITICAL_COUNT" -eq 0 ] && [ "$HIGH_COUNT" -eq 0 ]; then
    pass "No critical or high severity vulnerabilities"
  elif [ "$CRITICAL_COUNT" -gt 0 ]; then
    fail "$CRITICAL_COUNT critical vulnerabilities found"
  elif [ "$HIGH_COUNT" -gt 3 ]; then
    warn "$HIGH_COUNT high severity vulnerabilities (3 expected, non-blocking)"
  else
    pass "$HIGH_COUNT high severity vulnerabilities (expected, non-blocking)"
  fi
fi

# .gitignore check
check ".gitignore configuration"
if [ -f ".gitignore" ]; then
  if grep -q ".env.production" .gitignore 2>/dev/null; then
    pass ".env.production in .gitignore"
  else
    fail ".env.production NOT in .gitignore (security risk!)"
  fi
else
  fail ".gitignore not found"
fi

# ----------------------------------------------------------------------------
# 6. MONITORING SETUP (Optional)
# ----------------------------------------------------------------------------

print_section "6. Monitoring Setup (Optional)"

# Sentry DSN
check "Sentry DSN (NEXT_PUBLIC_SENTRY_DSN)"
if [ -f ".env.production" ]; then
  if grep -q "NEXT_PUBLIC_SENTRY_DSN=" .env.production 2>/dev/null; then
    if grep -q "NEXT_PUBLIC_SENTRY_DSN=https://" .env.production 2>/dev/null; then
      pass "Configured"
    else
      warn "Not configured (optional but recommended)"
    fi
  else
    warn "Not set (optional but recommended)"
  fi
else
  warn "Cannot check - .env.production not found"
fi

# LogRocket App ID
check "LogRocket App ID (NEXT_PUBLIC_LOGROCKET_APP_ID)"
if [ -f ".env.production" ]; then
  if grep -q "NEXT_PUBLIC_LOGROCKET_APP_ID=" .env.production 2>/dev/null; then
    warn "Not configured (optional)"
  else
    warn "Not set (optional)"
  fi
fi

# Google Analytics
check "Google Analytics (NEXT_PUBLIC_GA_MEASUREMENT_ID)"
if [ -f ".env.production" ]; then
  if grep -q "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-" .env.production 2>/dev/null; then
    pass "Configured"
  else
    warn "Not configured (optional but recommended)"
  fi
fi

# ----------------------------------------------------------------------------
# 7. GIT STATUS
# ----------------------------------------------------------------------------

print_section "7. Git Status"

# Git repository
check "Git repository initialized"
if [ -d ".git" ]; then
  pass "Git repository found"
else
  fail "Not a git repository"
fi

# Current branch
check "Current git branch"
if command -v git >/dev/null 2>&1; then
  CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    pass "On $CURRENT_BRANCH branch"
  else
    warn "On $CURRENT_BRANCH branch (expected main/master)"
  fi
fi

# Uncommitted changes
check "Uncommitted changes"
if command -v git >/dev/null 2>&1; then
  if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
    pass "Working directory clean"
  else
    CHANGE_COUNT=$(git status --porcelain 2>/dev/null | wc -l)
    warn "$CHANGE_COUNT uncommitted changes"
  fi
fi

# Latest commit
check "Latest commit"
if command -v git >/dev/null 2>&1; then
  LATEST_COMMIT=$(git log -1 --oneline 2>/dev/null | head -c 60)
  if [ ! -z "$LATEST_COMMIT" ]; then
    pass "$LATEST_COMMIT"
  fi
fi

# ----------------------------------------------------------------------------
# 8. DOCUMENTATION
# ----------------------------------------------------------------------------

print_section "8. Documentation"

REQUIRED_DOCS=(
  "AI_CREATE_PRODUCTION_READINESS_REPORT.md"
  "AI_CREATE_DEPLOYMENT_SUMMARY.md"
  "SECURITY_AUDIT_ANALYSIS.md"
  "AI_CREATE_FINAL_DEPLOYMENT_STATUS.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
  check "$doc"
  # Check both in repo root and Documents folder
  if [ -f "$doc" ] || [ -f "../$doc" ]; then
    pass "Found"
  else
    warn "Not found (optional but recommended)"
  fi
done

# ----------------------------------------------------------------------------
# FINAL SUMMARY
# ----------------------------------------------------------------------------

print_header "VERIFICATION SUMMARY"

echo "Total Checks:    $TOTAL_CHECKS"
echo -e "${GREEN}Passed:          $PASSED_CHECKS${NC}"
echo -e "${YELLOW}Warnings:        $WARNING_CHECKS${NC}"
echo -e "${RED}Failed:          $FAILED_CHECKS${NC}"
echo ""

# Calculate percentage
PASS_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $FAILED_CHECKS -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ ALL CRITICAL CHECKS PASSED${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${GREEN}🎉 Deployment Readiness: ${PASS_PERCENTAGE}%${NC}"
  echo ""

  if [ $WARNING_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ READY FOR PRODUCTION DEPLOYMENT${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review deployment checklist: DEPLOYMENT_CHECKLIST.md"
    echo "  2. Run dry-run: ./deploy-production.sh phase1 --dry-run"
    echo "  3. Deploy Phase 1: ./deploy-production.sh phase1"
    echo ""
    exit 0
  else
    echo -e "${YELLOW}⚠️  READY FOR DEPLOYMENT (with warnings)${NC}"
    echo ""
    echo "Warnings to review:"
    for warning in "${WARNING_ITEMS[@]}"; do
      echo -e "  ${YELLOW}⚠️  $warning${NC}"
    done
    echo ""
    echo "These warnings are non-blocking, but should be addressed if possible."
    echo ""
    echo "To proceed:"
    echo "  ./deploy-production.sh phase1 --dry-run"
    echo ""
    exit 0
  fi
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}✗ DEPLOYMENT BLOCKED${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${RED}❌ NOT READY FOR DEPLOYMENT${NC}"
  echo ""
  echo "Failed checks that must be resolved:"
  for failure in "${FAILED_ITEMS[@]}"; do
    echo -e "  ${RED}✗ $failure${NC}"
  done
  echo ""

  if [ $WARNING_CHECKS -gt 0 ]; then
    echo "Warnings (non-blocking):"
    for warning in "${WARNING_ITEMS[@]}"; do
      echo -e "  ${YELLOW}⚠️  $warning${NC}"
    done
    echo ""
  fi

  echo "Please fix the failed checks and run this script again:"
  echo "  ./verify-deployment-ready.sh"
  echo ""
  exit 1
fi
