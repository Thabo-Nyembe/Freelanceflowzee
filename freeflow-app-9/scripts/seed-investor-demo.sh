#!/bin/bash

# ============================================================================
# KAZI Comprehensive Investor Demo - Seed Script Runner
# ============================================================================
# This script runs all necessary seed scripts to populate demo data for:
# User: alex@freeflow.io
# Password: investor2026
# ============================================================================

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 KAZI Investor Demo - Comprehensive Data Seeding"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Demo User: alex@freeflow.io"
echo "Password: investor2026"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Run the comprehensive seed script
echo "Running comprehensive investor demo seed script..."
echo ""

npx tsx scripts/seed-comprehensive-investor-demo.ts

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Additional scripts you can run:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Run existing demo scripts (if not already covered):"
echo "   npx tsx scripts/seed-investor-demo-data.ts"
echo "   npx tsx scripts/seed-my-day-demo.ts"
echo "   npx tsx scripts/seed-clients-invoices.ts"
echo ""
echo "2. Verify demo data:"
echo "   npx tsx scripts/verify-demo-data.ts"
echo ""
echo "3. Run SQL seed directly (if needed):"
echo "   psql \$DATABASE_URL -f supabase/seeds/comprehensive-investor-demo-data.sql"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🔑 Login at your app with:"
echo "   Email: alex@freeflow.io"
echo "   Password: investor2026"
echo "═══════════════════════════════════════════════════════════════"
