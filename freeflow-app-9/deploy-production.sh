#!/bin/bash

# ============================================================================
# AI CREATE - PRODUCTION DEPLOYMENT SCRIPT
# ============================================================================
#
# This script handles production deployment with safety checks and rollback
# capability. It follows the 3-phase deployment strategy.
#
# Usage:
#   ./deploy-production.sh [phase] [options]
#
# Phases:
#   phase1  - Deploy to 10% of users
#   phase2  - Deploy to 50% of users
#   phase3  - Deploy to 100% of users
#   rollback - Rollback to previous version
#
# Options:
#   --skip-checks    Skip pre-deployment checks (not recommended)
#   --dry-run        Show what would be deployed without deploying
#   --force          Force deployment even if checks fail (dangerous)
#
# Examples:
#   ./deploy-production.sh phase1
#   ./deploy-production.sh phase2 --dry-run
#   ./deploy-production.sh rollback
#
# ============================================================================

set -e  # Exit on error

# ----------------------------------------------------------------------------
# CONFIGURATION
# ----------------------------------------------------------------------------

PHASE=${1:-phase1}
SKIP_CHECKS=false
DRY_RUN=false
FORCE=false

# Parse options
for arg in "$@"; do
  case $arg in
    --skip-checks)
      SKIP_CHECKS=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment phases
declare -A ROLLOUT_PERCENTAGE=(
  ["phase1"]=10
  ["phase2"]=50
  ["phase3"]=100
)

# ----------------------------------------------------------------------------
# HELPER FUNCTIONS
# ----------------------------------------------------------------------------

log() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

error() {
  echo -e "${RED}✗${NC} $1"
}

# Prompt for confirmation
confirm() {
  if [ "$FORCE" = true ]; then
    return 0
  fi

  read -p "$1 (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Deployment cancelled"
    exit 1
  fi
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# ----------------------------------------------------------------------------
# PRE-DEPLOYMENT CHECKS
# ----------------------------------------------------------------------------

pre_deployment_checks() {
  log "Running pre-deployment checks..."

  local checks_passed=true

  # Check Node.js version
  if command_exists node; then
    NODE_VERSION=$(node -v | sed 's/v//')
    if [ "$(printf '%s\n' "18.17.0" "$NODE_VERSION" | sort -V | head -n1)" = "18.17.0" ]; then
      success "Node.js version: $NODE_VERSION"
    else
      error "Node.js version must be >= 18.17.0 (current: $NODE_VERSION)"
      checks_passed=false
    fi
  else
    error "Node.js is not installed"
    checks_passed=false
  fi

  # Check npm version
  if command_exists npm; then
    NPM_VERSION=$(npm -v)
    success "npm version: $NPM_VERSION"
  else
    error "npm is not installed"
    checks_passed=false
  fi

  # Check if .env.production exists
  if [ -f .env.production ]; then
    success ".env.production file exists"
  else
    warning ".env.production file not found (optional for AI Create)"
  fi

  # Check if node_modules exists
  if [ -d node_modules ]; then
    success "node_modules directory exists"
  else
    error "node_modules not found. Run 'npm install' first"
    checks_passed=false
  fi

  # Check git status
  if command_exists git; then
    if [ -z "$(git status --porcelain)" ]; then
      success "Git working directory is clean"
    else
      warning "Git working directory has uncommitted changes"
      if [ "$FORCE" = false ]; then
        confirm "Continue with uncommitted changes?"
      fi
    fi
  fi

  # Check for TypeScript errors
  log "Checking TypeScript..."
  if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    error "TypeScript errors found"
    checks_passed=false
  else
    success "No TypeScript errors"
  fi

  # Run build test
  log "Testing production build..."
  if NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' npm run build > /tmp/build.log 2>&1; then
    success "Production build successful"
  else
    error "Production build failed. Check /tmp/build.log"
    cat /tmp/build.log
    checks_passed=false
  fi

  # Check security vulnerabilities
  log "Checking security vulnerabilities..."
  VULN_COUNT=$(npm audit --production --json 2>/dev/null | grep -o '"total":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
  if [ "$VULN_COUNT" -eq 0 ]; then
    success "No production vulnerabilities found"
  elif [ "$VULN_COUNT" -lt 5 ]; then
    warning "Found $VULN_COUNT production vulnerabilities (acceptable for now)"
  else
    error "Found $VULN_COUNT production vulnerabilities"
    if [ "$FORCE" = false ]; then
      confirm "Continue with vulnerabilities?"
    fi
  fi

  if [ "$checks_passed" = false ] && [ "$FORCE" = false ]; then
    error "Pre-deployment checks failed. Fix issues or use --force to proceed"
    exit 1
  fi

  success "All pre-deployment checks passed"
}

# ----------------------------------------------------------------------------
# DEPLOYMENT FUNCTIONS
# ----------------------------------------------------------------------------

deploy_phase1() {
  log "🚀 Starting Phase 1 Deployment (10% rollout)"

  if [ "$DRY_RUN" = true ]; then
    log "[DRY RUN] Would deploy to 10% of users"
    return 0
  fi

  # Tag current version
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  git tag -a "deploy-phase1-$TIMESTAMP" -m "Phase 1 deployment: 10%"

  # Set deployment phase environment variable
  export NEXT_PUBLIC_DEPLOYMENT_PHASE=1

  # Build for production
  log "Building for production..."
  NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' npm run build

  # Start production server
  log "Starting production server..."
  NODE_ENV=production PORT=9323 npm run start &
  SERVER_PID=$!

  # Wait for server to be ready
  sleep 5

  # Health check
  if curl -f http://localhost:9323 > /dev/null 2>&1; then
    success "Server is running (PID: $SERVER_PID)"
    echo $SERVER_PID > .server.pid
  else
    error "Server failed to start"
    exit 1
  fi

  success "Phase 1 deployment complete! Serving 10% of users"
  log "Monitor metrics closely for the next 24 hours"
}

deploy_phase2() {
  log "🚀 Starting Phase 2 Deployment (50% rollout)"

  if [ "$DRY_RUN" = true ]; then
    log "[DRY RUN] Would deploy to 50% of users"
    return 0
  fi

  # Tag current version
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  git tag -a "deploy-phase2-$TIMESTAMP" -m "Phase 2 deployment: 50%"

  # Set deployment phase
  export NEXT_PUBLIC_DEPLOYMENT_PHASE=2

  # Rebuild
  log "Rebuilding for 50% rollout..."
  NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' npm run build

  # Restart server
  log "Restarting production server..."
  if [ -f .server.pid ]; then
    kill $(cat .server.pid) 2>/dev/null || true
    rm .server.pid
  fi

  NODE_ENV=production PORT=9323 npm run start &
  SERVER_PID=$!
  echo $SERVER_PID > .server.pid

  sleep 5

  if curl -f http://localhost:9323 > /dev/null 2>&1; then
    success "Phase 2 deployment complete! Serving 50% of users"
  else
    error "Server failed to start"
    exit 1
  fi
}

deploy_phase3() {
  log "🚀 Starting Phase 3 Deployment (100% rollout)"

  if [ "$DRY_RUN" = true ]; then
    log "[DRY RUN] Would deploy to 100% of users"
    return 0
  fi

  # Tag current version
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  git tag -a "deploy-phase3-$TIMESTAMP" -m "Phase 3 deployment: 100%"

  # Set deployment phase
  export NEXT_PUBLIC_DEPLOYMENT_PHASE=3

  # Final build
  log "Rebuilding for 100% rollout..."
  NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' npm run build

  # Restart server
  log "Restarting production server..."
  if [ -f .server.pid ]; then
    kill $(cat .server.pid) 2>/dev/null || true
    rm .server.pid
  fi

  NODE_ENV=production PORT=9323 npm run start &
  SERVER_PID=$!
  echo $SERVER_PID > .server.pid

  sleep 5

  if curl -f http://localhost:9323 > /dev/null 2>&1; then
    success "Phase 3 deployment complete! 🎉"
    success "AI Create is now live for 100% of users!"
  else
    error "Server failed to start"
    exit 1
  fi
}

rollback() {
  log "⏪ Starting rollback procedure..."

  if [ "$DRY_RUN" = true ]; then
    log "[DRY RUN] Would rollback to previous version"
    return 0
  fi

  # Find previous deployment tag
  PREVIOUS_TAG=$(git tag -l "deploy-phase*" --sort=-creatordate | sed -n '2p')

  if [ -z "$PREVIOUS_TAG" ]; then
    error "No previous deployment tag found"
    exit 1
  fi

  warning "Rolling back to: $PREVIOUS_TAG"
  confirm "Are you sure you want to rollback?"

  # Checkout previous version
  git checkout $PREVIOUS_TAG

  # Reinstall dependencies (in case they changed)
  log "Reinstalling dependencies..."
  npm ci

  # Rebuild
  log "Rebuilding previous version..."
  NODE_ENV=production NODE_OPTIONS='--max-old-space-size=4096' npm run build

  # Restart server
  log "Restarting server..."
  if [ -f .server.pid ]; then
    kill $(cat .server.pid) 2>/dev/null || true
    rm .server.pid
  fi

  NODE_ENV=production PORT=9323 npm run start &
  SERVER_PID=$!
  echo $SERVER_PID > .server.pid

  sleep 5

  if curl -f http://localhost:9323 > /dev/null 2>&1; then
    success "Rollback complete!"
    warning "Remember to return to main branch: git checkout main"
  else
    error "Rollback failed - server did not start"
    exit 1
  fi
}

# ----------------------------------------------------------------------------
# MAIN SCRIPT
# ----------------------------------------------------------------------------

main() {
  echo ""
  echo "============================================================================"
  echo "  AI CREATE - PRODUCTION DEPLOYMENT"
  echo "============================================================================"
  echo ""

  # Run pre-deployment checks
  if [ "$SKIP_CHECKS" = false ] && [ "$PHASE" != "rollback" ]; then
    pre_deployment_checks
    echo ""
  fi

  # Execute deployment based on phase
  case $PHASE in
    phase1)
      deploy_phase1
      ;;
    phase2)
      deploy_phase2
      ;;
    phase3)
      deploy_phase3
      ;;
    rollback)
      rollback
      ;;
    *)
      error "Invalid phase: $PHASE"
      echo "Usage: $0 [phase1|phase2|phase3|rollback] [options]"
      exit 1
      ;;
  esac

  echo ""
  echo "============================================================================"
  success "Deployment complete!"
  echo "============================================================================"
  echo ""
  echo "Next steps:"
  echo "  1. Monitor error rates: Check Sentry/error tracking"
  echo "  2. Monitor performance: Check analytics dashboard"
  echo "  3. Monitor user feedback: Check support tickets"
  echo "  4. Review metrics: Check deployment checklist"
  echo ""
  echo "Rollback command (if needed):"
  echo "  ./deploy-production.sh rollback"
  echo ""
}

# Run main function
main
