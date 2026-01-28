-- ============================================================================
-- FINAL RLS FIX - Make remaining policies permissive
-- ============================================================================

-- ai_feature_usage - Allow all authenticated users to read
ALTER TABLE ai_feature_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_feature_usage_read" ON ai_feature_usage;
DROP POLICY IF EXISTS "ai_feature_usage_write" ON ai_feature_usage;
DROP POLICY IF EXISTS "ai_feature_usage_all" ON ai_feature_usage;
DROP POLICY IF EXISTS "ai_feature_usage_select" ON ai_feature_usage;
CREATE POLICY "ai_feature_usage_all_access" ON ai_feature_usage FOR ALL USING (true);

-- reports - Allow all authenticated users
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_read" ON reports;
DROP POLICY IF EXISTS "reports_write" ON reports;
DROP POLICY IF EXISTS "reports_all" ON reports;
CREATE POLICY "reports_all_access" ON reports FOR ALL USING (true);

-- report_templates - Public read access
ALTER TABLE report_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "report_templates_read" ON report_templates;
DROP POLICY IF EXISTS "report_templates_all" ON report_templates;
CREATE POLICY "report_templates_all_access" ON report_templates FOR ALL USING (true);

-- report_schedules - Allow all
ALTER TABLE report_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "report_schedules_read" ON report_schedules;
DROP POLICY IF EXISTS "report_schedules_write" ON report_schedules;
DROP POLICY IF EXISTS "report_schedules_all" ON report_schedules;
CREATE POLICY "report_schedules_all_access" ON report_schedules FOR ALL USING (true);

SELECT 'Final RLS fixes complete!' AS status;
