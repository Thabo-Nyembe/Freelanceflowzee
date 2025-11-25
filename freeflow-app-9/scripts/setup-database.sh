#!/bin/bash

# Kazi Database Setup Script
# This script sets up the complete database schema in Supabase

set -e  # Exit on error

echo "🚀 Kazi Database Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env.local

# Verify Supabase credentials
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set!${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not set!${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL${NC}"
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
echo -e "${BLUE}🔑 Project Ref: $PROJECT_REF${NC}"
echo ""

# Step 1: Apply master schema
echo -e "${YELLOW}📋 Step 1: Applying master schema...${NC}"
SQL_FILE="supabase/migrations/MASTER_COMPLETE_SETUP.sql"

if [ -f "$SQL_FILE" ]; then
    echo "Opening Supabase SQL Editor..."
    echo ""
    echo -e "${GREEN}Please copy the contents of:${NC}"
    echo "  $SQL_FILE"
    echo ""
    echo -e "${GREEN}And paste into:${NC}"
    echo "  https://app.supabase.com/project/$PROJECT_REF/sql/new"
    echo ""

    # Copy to clipboard if on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cat "$SQL_FILE" | pbcopy
        echo -e "${GREEN}✅ SQL copied to clipboard!${NC}"
        echo ""
        open "https://app.supabase.com/project/$PROJECT_REF/sql/new"
    fi
else
    echo -e "${RED}❌ Master schema file not found: $SQL_FILE${NC}"
fi

echo ""
read -p "Press Enter after you've executed the SQL in Supabase..."
echo ""

# Step 2: Apply AI features migration
echo -e "${YELLOW}📋 Step 2: Applying AI features schema...${NC}"
AI_SQL_FILE="supabase/migrations/20251125_ai_features.sql"

if [ -f "$AI_SQL_FILE" ]; then
    echo "Opening Supabase SQL Editor..."
    echo ""
    echo -e "${GREEN}Please copy the contents of:${NC}"
    echo "  $AI_SQL_FILE"
    echo ""
    echo -e "${GREEN}And paste into:${NC}"
    echo "  https://app.supabase.com/project/$PROJECT_REF/sql/new"
    echo ""

    # Copy to clipboard if on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cat "$AI_SQL_FILE" | pbcopy
        echo -e "${GREEN}✅ SQL copied to clipboard!${NC}"
        echo ""
        open "https://app.supabase.com/project/$PROJECT_REF/sql/new"
    fi
else
    echo -e "${YELLOW}⚠️  AI features file not found: $AI_SQL_FILE${NC}"
fi

echo ""
read -p "Press Enter after you've executed the SQL in Supabase..."
echo ""

# Step 3: Set up storage buckets
echo -e "${YELLOW}📦 Step 3: Setting up storage buckets...${NC}"
echo ""
echo "Opening Supabase Storage..."
echo "Please create the following buckets:"
echo "  1. avatars (public)"
echo "  2. files (private)"
echo "  3. videos (private)"
echo "  4. images (public)"
echo "  5. documents (private)"
echo ""
open "https://app.supabase.com/project/$PROJECT_REF/storage/buckets"
echo ""
read -p "Press Enter after you've created the storage buckets..."
echo ""

# Step 4: Verify setup
echo -e "${YELLOW}🔍 Step 4: Verifying setup...${NC}"
echo ""
echo "Opening Supabase Table Editor..."
echo "Verify the following tables exist:"
echo "  ✓ profiles"
echo "  ✓ clients"
echo "  ✓ projects"
echo "  ✓ invoices"
echo "  ✓ files"
echo "  ✓ tasks"
echo "  ✓ investor_metrics_events"
echo "  ✓ revenue_intelligence"
echo "  ✓ lead_scores"
echo "  ✓ growth_playbooks"
echo "  ✓ ai_feature_usage"
echo "  ✓ ai_recommendations"
echo "  ✓ user_metrics_aggregate"
echo ""
open "https://app.supabase.com/project/$PROJECT_REF/editor"
echo ""
read -p "Press Enter after verification..."
echo ""

# Done!
echo ""
echo "================================"
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Test the connection: npm run test:db"
echo "  2. Start dev server: npm run dev"
echo "  3. Visit: http://localhost:9323"
echo ""
