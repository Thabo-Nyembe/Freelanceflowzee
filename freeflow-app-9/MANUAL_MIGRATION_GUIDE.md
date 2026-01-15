# Tax Intelligence System - Manual Migration Guide

Since the Supabase REST API doesn't support DDL operations (CREATE TABLE, etc.), you need to run the migrations manually via the Supabase Dashboard.

## ⚡ Quick Start (5 minutes)

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new

### Step 2: Run Migration 1 - Schema Creation

1. Click "New Query"
2. Copy the **entire contents** of this file: `supabase/migrations/20260116000001_tax_intelligence_system.sql`
3. Paste into the SQL Editor
4. Click "RUN" (bottom right corner)
5. Wait for completion (should take 10-20 seconds)

**Expected Result:**
```
Success. No rows returned
```

This creates 12 tables:
- ✅ tax_categories
- ✅ tax_rates
- ✅ user_tax_profiles
- ✅ taxes
- ✅ tax_calculations
- ✅ tax_deductions
- ✅ tax_filings
- ✅ tax_exemptions
- ✅ tax_education_progress
- ✅ tax_insights
- ✅ tax_rules
- ✅ tax_api_logs

### Step 3: Run Migration 2 - Seed Data

1. Click "New Query" again
2. Copy the **entire contents** of this file: `supabase/migrations/20260116000002_tax_seed_data.sql`
3. Paste into the SQL Editor
4. Click "RUN"
5. Wait for completion (should take 5-10 seconds)

**Expected Result:**
```
Success. No rows returned
```

This loads:
- ✅ 9 tax categories (VAT, GST, Sales Tax, etc.)
- ✅ 70+ tax rates across 40+ countries
- ✅ 15+ tax rules (nexus thresholds, deduction limits, etc.)

### Step 4: Verify Installation

Run this verification query in SQL Editor:

```sql
-- Check all tax tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'tax%'
ORDER BY table_name;

-- Should return 12 rows (all tax tables)
```

Then verify seed data loaded:

```sql
-- Check tax rates loaded (should be 70+)
SELECT COUNT(*) as rate_count FROM tax_rates;

-- Check tax categories loaded (should be 9)
SELECT COUNT(*) as category_count FROM tax_categories;

-- Check tax rules loaded (should be 15+)
SELECT COUNT(*) as rule_count FROM tax_rules;
```

## ✅ Migration Complete!

Once you see all tables created and seed data loaded, the database is ready.

Next steps:
1. ✅ Add Tax Intelligence page to navigation
2. ✅ Test the Tax Intelligence dashboard at `/dashboard/tax-intelligence-v2`
3. ✅ Configure API keys (optional but recommended)
4. ✅ Integrate with invoice/expense forms

---

## 🔧 Troubleshooting

### Issue: "relation already exists"
**Solution**: Tables were already created. You can skip migration 1 and just run migration 2 for seed data.

### Issue: "permission denied"
**Solution**: Make sure you're logged in to the correct Supabase project (gcinvwprtlnwuwuvmrux).

### Issue: "syntax error"
**Solution**: Make sure you copied the ENTIRE file contents. The SQL is multi-line and requires all statements.

---

## 📁 Migration File Locations

Migration 1 (Schema): `/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations/20260116000001_tax_intelligence_system.sql`

Migration 2 (Seed Data): `/Users/thabonyembe/Documents/freeflow-app-9/supabase/migrations/20260116000002_tax_seed_data.sql`

---

## 🎯 What's Next After Migration?

Once migrations are complete, I'll continue with:

1. **Add Navigation Link**: Add Tax Intelligence to sidebar
2. **Test Dashboard**: Verify Tax Intelligence page loads
3. **Invoice Integration**: Add automatic tax calculation to invoice forms
4. **Expense Integration**: Add deduction suggestions to expense forms
5. **Dashboard Widgets**: Add tax summary cards to main dashboard
6. **Comprehensive Testing**: Test all features end-to-end

Total estimated time: 20-30 minutes
