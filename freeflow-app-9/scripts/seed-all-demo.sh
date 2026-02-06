#!/bin/bash

# KAZI Demo Data Seeder - Master Script
# Run this to populate the database with realistic demo data for investor presentations

echo "========================================"
echo "KAZI Platform - Demo Data Seeder"
echo "========================================"
echo ""

# Check if tsx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed"
    exit 1
fi

echo "Step 1: Seeding clients and invoices..."
npx tsx scripts/seed-clients-invoices.ts

echo ""
echo "Step 2: Seeding projects, tasks, time entries, and more..."
npx tsx scripts/seed-demo-data.ts

echo ""
echo "========================================"
echo "Demo Data Setup Complete!"
echo "========================================"
echo ""
echo "Demo Account Details:"
echo "  Email: demo@kazi.io"
echo "  User ID: 00000000-0000-0000-0000-000000000001"
echo ""
echo "Data Created:"
echo "  - 8 sample clients (various industries)"
echo "  - 15 invoices (draft, sent, paid, overdue)"
echo "  - 6 projects with milestones"
echo "  - 22 tasks across projects"
echo "  - 50 time tracking entries"
echo "  - 4 team members"
echo "  - 10 calendar events"
echo ""
echo "Total Estimated Revenue: ~$287,000+"
echo ""
