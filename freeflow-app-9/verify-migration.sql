-- ============================================================================
-- AI FEATURES MIGRATION VERIFICATION SCRIPT
-- ============================================================================
-- Run this in Supabase SQL Editor AFTER applying the migration
-- Expected: 7 tables + confirmation of all features

-- 1. Check all tables were created
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%ai%' OR table_name LIKE '%investor%')
ORDER BY table_name;

-- Expected 7 tables:
-- 1. ai_feature_usage
-- 2. ai_recommendations
-- 3. growth_playbooks
-- 4. investor_metrics_events
-- 5. lead_scores
-- 6. revenue_intelligence
-- 7. user_metrics_aggregate

-- ============================================================================

-- 2. Check indexes were created
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'investor_metrics_events',
  'revenue_intelligence',
  'lead_scores',
  'growth_playbooks',
  'ai_feature_usage',
  'ai_recommendations',
  'user_metrics_aggregate'
)
ORDER BY tablename, indexname;

-- Expected: Multiple indexes per table for performance

-- ============================================================================

-- 3. Check Row Level Security (RLS) is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%ai%' OR tablename LIKE '%investor%');

-- Expected: rowsecurity = true for all 7 tables

-- ============================================================================

-- 4. Check RLS policies were created
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND (tablename LIKE '%ai%' OR tablename LIKE '%investor%')
ORDER BY tablename;

-- Expected: 1 policy per table (7 total)

-- ============================================================================

-- 5. Check helper functions exist
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'calculate_user_revenue_metrics',
  'calculate_platform_metrics',
  'maintain_ai_tables',
  'delete_expired_revenue_reports',
  'update_modified_column'
);

-- Expected: 5 functions

-- ============================================================================

-- 6. Check triggers were created
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (event_object_table LIKE '%ai%' OR event_object_table LIKE '%revenue%' OR event_object_table LIKE '%playbook%');

-- Expected: 3 triggers (delete_expired_reports, update_playbooks_modtime, update_recommendations_modtime)

-- ============================================================================

-- 7. Test helper functions work
SELECT * FROM calculate_platform_metrics();

-- Expected: Returns platform-wide metrics (will be zeros if no data yet)

-- ============================================================================

-- 8. Quick row count check
SELECT
  'investor_metrics_events' as table_name,
  COUNT(*) as row_count
FROM investor_metrics_events
UNION ALL
SELECT
  'revenue_intelligence' as table_name,
  COUNT(*) as row_count
FROM revenue_intelligence
UNION ALL
SELECT
  'lead_scores' as table_name,
  COUNT(*) as row_count
FROM lead_scores
UNION ALL
SELECT
  'growth_playbooks' as table_name,
  COUNT(*) as row_count
FROM growth_playbooks
UNION ALL
SELECT
  'ai_feature_usage' as table_name,
  COUNT(*) as row_count
FROM ai_feature_usage
UNION ALL
SELECT
  'ai_recommendations' as table_name,
  COUNT(*) as row_count
FROM ai_recommendations
UNION ALL
SELECT
  'user_metrics_aggregate' as table_name,
  COUNT(*) as row_count
FROM user_metrics_aggregate;

-- Expected: All tables exist and return 0 rows (or 1 if sample data inserted)

-- ============================================================================
-- ✅ IF ALL QUERIES ABOVE RUN SUCCESSFULLY, MIGRATION IS COMPLETE!
-- ============================================================================
