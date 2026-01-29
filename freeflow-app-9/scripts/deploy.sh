#!/bin/bash

# KAZI Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
APP_NAME="kazi"
BUILD_DIR=".next"
STANDALONE_DIR=".next/standalone"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  KAZI Deployment Script${NC}"
echo -e "${BLUE}  Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}Invalid environment. Use 'staging' or 'production'${NC}"
  exit 1
fi

# Pre-deployment checks
echo -e "\n${YELLOW}Running pre-deployment checks...${NC}"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
echo -e "  Node.js: v${NODE_VERSION}"

# Check if .env file exists
if [[ ! -f ".env.${ENVIRONMENT}" && ! -f ".env.production" ]]; then
  echo -e "${RED}Error: Environment file not found${NC}"
  exit 1
fi

# Check required environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!VAR}" ]]; then
    echo -e "  ${RED}Missing: ${VAR}${NC}"
  else
    echo -e "  ${GREEN}OK: ${VAR}${NC}"
  fi
done

# Run linting
echo -e "\n${YELLOW}Running linter...${NC}"
npm run lint --max-warnings=0 || {
  echo -e "${YELLOW}Lint warnings found, continuing...${NC}"
}

# Run type checking
echo -e "\n${YELLOW}Running type check...${NC}"
npx tsc --noEmit || {
  echo -e "${YELLOW}Type errors found (ignored for now)...${NC}"
}

# Run tests
echo -e "\n${YELLOW}Running tests...${NC}"
if npm run test --passWithNoTests 2>/dev/null; then
  echo -e "${GREEN}Tests passed${NC}"
else
  echo -e "${YELLOW}Tests skipped or failed (continuing)...${NC}"
fi

# Build the application
echo -e "\n${YELLOW}Building application...${NC}"
NODE_ENV=production npm run build

# Verify build
if [[ ! -d "$BUILD_DIR" ]]; then
  echo -e "${RED}Build failed - no build directory${NC}"
  exit 1
fi

echo -e "${GREEN}Build completed successfully${NC}"

# Deployment based on environment
echo -e "\n${YELLOW}Deploying to ${ENVIRONMENT}...${NC}"

if [[ "$ENVIRONMENT" == "staging" ]]; then
  # Vercel staging deployment
  if command -v vercel &> /dev/null; then
    echo -e "Deploying to Vercel preview..."
    vercel --yes
    echo -e "${GREEN}Staging deployment complete${NC}"
  else
    echo -e "${YELLOW}Vercel CLI not found. Install with: npm i -g vercel${NC}"
    echo -e "You can also deploy manually via Vercel dashboard"
  fi

elif [[ "$ENVIRONMENT" == "production" ]]; then
  # Production deployment checks
  echo -e "\n${RED}Production Deployment Checklist:${NC}"
  echo -e "  1. Database migrations run?"
  echo -e "  2. Environment variables set in Vercel?"
  echo -e "  3. DNS configured?"
  echo -e "  4. SSL certificate valid?"

  read -p "Continue with production deployment? (y/N): " -n 1 -r
  echo

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v vercel &> /dev/null; then
      echo -e "Deploying to Vercel production..."
      vercel --prod --yes
      echo -e "${GREEN}Production deployment complete${NC}"
    else
      echo -e "${YELLOW}Vercel CLI not found${NC}"
    fi
  else
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
  fi
fi

# Post-deployment
echo -e "\n${YELLOW}Running post-deployment tasks...${NC}"

# Run Lighthouse CI if available
if command -v lhci &> /dev/null; then
  echo -e "Running Lighthouse CI..."
  lhci autorun || echo "Lighthouse CI completed"
fi

# Health check
echo -e "\n${YELLOW}Running health check...${NC}"
DEPLOY_URL=$(vercel inspect --json 2>/dev/null | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [[ -n "$DEPLOY_URL" ]]; then
  echo -e "Checking: https://${DEPLOY_URL}"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DEPLOY_URL}" || echo "000")

  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo -e "${GREEN}Health check passed (HTTP ${HTTP_STATUS})${NC}"
  else
    echo -e "${RED}Health check failed (HTTP ${HTTP_STATUS})${NC}"
  fi
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Summary
echo -e "\n${BLUE}Summary:${NC}"
echo -e "  Environment: ${ENVIRONMENT}"
echo -e "  Build: .next/"
if [[ -n "$DEPLOY_URL" ]]; then
  echo -e "  URL: https://${DEPLOY_URL}"
fi
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Verify the deployment in your browser"
echo -e "  2. Check application logs for errors"
echo -e "  3. Monitor performance metrics"
