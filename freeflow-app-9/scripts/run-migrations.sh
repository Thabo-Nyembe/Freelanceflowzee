#!/bin/bash
# Run Supabase Migrations Script
# Executes SQL migrations against remote Supabase database

set -e

# Load environment variables
source .env.local 2>/dev/null || true

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "Error: Missing SUPABASE_URL or SERVICE_ROLE_KEY"
  exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')
echo "Project: $PROJECT_REF"

# Function to run SQL
run_sql() {
  local sql_file=$1
  echo "Running: $sql_file"

  curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(cat "$sql_file" | jq -Rs .)}" 2>/dev/null

  echo ""
}

echo "=== Running Migrations ==="
echo ""

# Run each migration file
for migration in supabase/migrations/20241216*.sql; do
  if [ -f "$migration" ]; then
    run_sql "$migration"
  fi
done

echo ""
echo "=== Migrations Complete ==="
