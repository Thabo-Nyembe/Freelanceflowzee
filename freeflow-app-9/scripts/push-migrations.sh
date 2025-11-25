#!/bin/bash

# Kazi Database - Push Migrations via Supabase CLI
# Direct connection with password

set -e

echo "🚀 Kazi Database Migration via Supabase CLI"
echo "============================================================"
echo ""

PROJECT_REF="gcinvwprtlnwuwuvmrux"
DB_PASSWORD="Trapster103"

export SUPABASE_DB_PASSWORD="$DB_PASSWORD"

echo "📍 Project: ${PROJECT_REF}"
echo ""

# Try to link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD" 2>&1 | grep -v "deprecated" || true

echo ""
echo "📤 Pushing migrations to database..."
echo ""

# Push all migrations
supabase db push --password "$DB_PASSWORD" 2>&1 | grep -v "deprecated" || true

echo ""
echo "============================================================"
echo "✅ Migrations pushed!"
echo "============================================================"
echo ""
