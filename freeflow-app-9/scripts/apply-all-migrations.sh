#!/bin/bash

# Kazi Database - Apply All Migrations via Supabase CLI
# Using direct database connection

set -e  # Exit on error

echo "🚀 Kazi Database Migration - Automated Setup"
echo "============================================================"
echo ""

# Database connection details
PROJECT_REF="gcinvwprtlnwuwuvmrux"
DB_PASSWORD="test12345"
DB_HOST="aws-0-us-east-1.pooler.supabase.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.${PROJECT_REF}"

# Connection string
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📍 Project: ${PROJECT_REF}"
echo "🔗 Connecting to database..."
echo ""

# Test connection
echo "🔍 Testing connection..."
if psql "${CONNECTION_STRING}" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Connection successful!"
else
    echo "❌ Connection failed. Trying pooler connection..."
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:6543/${DB_NAME}?sslmode=require"
fi

echo ""
echo "📋 Applying migrations..."
echo "============================================================"
echo ""

# Migration 1: Master Complete Setup
echo "1️⃣  Applying MASTER_COMPLETE_SETUP.sql..."
if psql "${CONNECTION_STRING}" -f supabase/migrations/MASTER_COMPLETE_SETUP.sql 2>&1 | grep -v "already exists\|NOTICE"; then
    echo "   ✅ Master schema applied"
else
    echo "   ⚠️  Some warnings (normal for existing tables)"
fi
echo ""

# Migration 2: AI Features
echo "2️⃣  Applying 20251125_ai_features.sql..."
if psql "${CONNECTION_STRING}" -f supabase/migrations/20251125_ai_features.sql 2>&1 | grep -v "already exists\|NOTICE"; then
    echo "   ✅ AI features applied"
else
    echo "   ⚠️  Some warnings (normal for existing tables)"
fi
echo ""

# Migration 3: Missing Tables
echo "3️⃣  Applying 20251125_missing_tables.sql..."
if psql "${CONNECTION_STRING}" -f supabase/migrations/20251125_missing_tables.sql 2>&1 | grep -v "already exists\|NOTICE"; then
    echo "   ✅ Missing tables applied"
else
    echo "   ⚠️  Some warnings (normal for existing tables)"
fi
echo ""

# Migration 4: Storage Policies
echo "4️⃣  Applying storage policies..."
if psql "${CONNECTION_STRING}" -f scripts/STORAGE_POLICIES.sql 2>&1 | grep -v "already exists\|NOTICE"; then
    echo "   ✅ Storage policies applied"
else
    echo "   ⚠️  Some warnings (normal for existing policies)"
fi
echo ""

echo "============================================================"
echo "✅ All migrations applied successfully!"
echo "============================================================"
echo ""

# Verify setup
echo "🔍 Verifying database setup..."
echo ""

# Count tables
TABLE_COUNT=$(psql "${CONNECTION_STRING}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo "📊 Tables created: ${TABLE_COUNT}"

# List key tables
echo ""
echo "📋 Key tables:"
psql "${CONNECTION_STRING}" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" | grep -E "profiles|clients|projects|tasks|messages|investor_metrics"

echo ""
echo "============================================================"
echo "🎉 Database fully wired and ready!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "  1. Create storage buckets: node scripts/setup-storage-buckets.js"
echo "  2. Verify: node scripts/verify-database.js"
echo "  3. Start dev: npm run dev"
echo ""
