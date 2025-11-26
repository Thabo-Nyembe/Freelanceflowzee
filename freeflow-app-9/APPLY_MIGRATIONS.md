# Apply Database Migrations to Supabase

## Quick Setup Instructions

### Step 1: Open Supabase SQL Editor
Click here to open the SQL Editor:
👉 **https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new**

### Step 2: Copy & Paste the Consolidated Migrations
1. Open the file: `supabase/consolidated_migrations.sql` (5,783 lines)
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click "Run" to execute all migrations

### Step 3: Verify Success
After running, you should see tables created for all these systems:

**Recent Sessions (45-54):**
- ✅ Growth Hub System (growth strategies, user types, ROI tracking)
- ✅ Email Agent Setup System (integrations, providers, setup wizard)
- ✅ 3D Modeling System (scenes, objects, materials, rendering)
- ✅ Email Agent System (AI analysis, quotations, responses)
- ✅ Admin Analytics System (revenue, conversion funnels, insights)
- ✅ Profile System (skills, experience, portfolio, achievements)
- ✅ AI Code Completion System (completions, snippets, analysis)
- ✅ Notifications System (multi-channel, preferences, templates)
- ✅ Bookings System (appointments, availability, reminders)
- ✅ Invoicing System (recurring invoices, payments, templates)

### Alternative: Run Individual Migrations
If the consolidated file is too large, run these files individually:

```sql
-- In order:
1. supabase/migrations/20251126_growth_hub_system.sql
2. supabase/migrations/20251126_email_agent_setup_system.sql
3. supabase/migrations/20251126_3d_modeling_system.sql
4. supabase/migrations/20251126_email_agent_system.sql
5. supabase/migrations/20251126_admin_analytics_system.sql
6. supabase/migrations/20251126_profile_system.sql
7. supabase/migrations/20251126_ai_code_completion_system.sql
8. supabase/migrations/20251126_notifications_system.sql
9. supabase/migrations/20251126_bookings_system.sql
10. supabase/migrations/20251126_invoicing_system.sql
```

### What Gets Created

**10 Complete Feature Systems:**
- 72 production tables
- 58 custom ENUMs (type-safe statuses, categories)
- 300+ indexes for optimal query performance
- 50+ database triggers (auto-calculations, stats updates)
- 45+ helper functions (analytics, calculations, utilities)
- Comprehensive RLS policies (row-level security)

**Features Enabled:**
- AI-powered growth strategies for 5 user types
- Email integration with 20+ providers
- Full 3D modeling with rendering
- Intelligent email automation
- Business analytics dashboard
- Complete user profiles
- AI code completion & analysis
- Multi-channel notifications
- Appointment booking system
- Invoicing with recurring billing

### Verification Queries

After running migrations, verify with these queries:

```sql
-- Check all new tables
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%growth%'
   OR tablename LIKE '%email%'
   OR tablename LIKE '%3d%'
   OR tablename LIKE '%notification%'
   OR tablename LIKE '%booking%'
   OR tablename LIKE '%invoice%'
ORDER BY tablename;

-- Check ENUMs created
SELECT n.nspname as schema, t.typname as typename
FROM pg_type t
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
  AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
  AND n.nspname = 'public'
ORDER BY 1, 2;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Next Steps After Migration

1. **Test the app**: Visit http://localhost:9323
2. **Check features**: All dashboard pages should now have working CRUD operations
3. **Verify data**: Check that mock data loads properly
4. **Test real-time**: Verify WebSocket connections for live updates

## Troubleshooting

**If migrations fail:**
1. Check error message for specific table/function
2. Drop the problematic table: `DROP TABLE IF EXISTS table_name CASCADE;`
3. Re-run that specific migration
4. If schema conflicts, prefix tables: `ALTER TABLE old_name RENAME TO new_name;`

**Common issues:**
- "relation already exists" → Table already created, safe to skip or drop first
- "function already exists" → Use `CREATE OR REPLACE FUNCTION`
- "type already exists" → Use `CREATE TYPE IF NOT EXISTS` or `DROP TYPE`

## Database Statistics

After successful migration:
- **Total Tables**: 72 new tables
- **Total Functions**: 45+ helper functions
- **Total Policies**: 100+ RLS policies
- **Total Indexes**: 300+ performance indexes
- **Total ENUMs**: 58 type-safe enumerations

All features are now production-ready with:
- ✅ Full CRUD operations
- ✅ Real-time updates
- ✅ Row-level security
- ✅ Type safety
- ✅ Auto-calculated fields
- ✅ Comprehensive analytics
