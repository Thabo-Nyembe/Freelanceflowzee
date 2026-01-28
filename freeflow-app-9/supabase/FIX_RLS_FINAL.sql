-- ============================================================================
-- FINAL RLS FIX - Make policies more permissive for authenticated users
-- ============================================================================

-- ai_feature_usage - allow all authenticated users
DROP POLICY IF EXISTS "ai_feature_usage_select" ON ai_feature_usage;
DROP POLICY IF EXISTS "ai_feature_usage_all" ON ai_feature_usage;
CREATE POLICY "ai_feature_usage_read" ON ai_feature_usage FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ai_feature_usage_write" ON ai_feature_usage FOR ALL USING (auth.uid() IS NOT NULL);

-- notification_queue - allow all authenticated users  
DROP POLICY IF EXISTS "notification_queue_policy" ON notification_queue;
DROP POLICY IF EXISTS "notification_queue_all" ON notification_queue;
CREATE POLICY "notification_queue_read" ON notification_queue FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "notification_queue_write" ON notification_queue FOR ALL USING (auth.uid() IS NOT NULL);

-- reports - allow all authenticated users
DROP POLICY IF EXISTS "reports_all" ON reports;
DROP POLICY IF EXISTS "reports_policy" ON reports;
CREATE POLICY "reports_read" ON reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reports_write" ON reports FOR ALL USING (auth.uid() IS NOT NULL);

-- report_templates - make public readable
DROP POLICY IF EXISTS "report_templates_all" ON report_templates;
CREATE POLICY "report_templates_read" ON report_templates FOR SELECT USING (true);

-- report_schedules - allow authenticated users
DROP POLICY IF EXISTS "report_schedules_all" ON report_schedules;
CREATE POLICY "report_schedules_read" ON report_schedules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "report_schedules_write" ON report_schedules FOR ALL USING (auth.uid() IS NOT NULL);

-- user_metrics_aggregate - fix for 406 (needs data or better policy)
DROP POLICY IF EXISTS "user_metrics_aggregate_policy" ON user_metrics_aggregate;
DROP POLICY IF EXISTS "user_metrics_aggregate_all" ON user_metrics_aggregate;
CREATE POLICY "user_metrics_aggregate_read" ON user_metrics_aggregate FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "user_metrics_aggregate_write" ON user_metrics_aggregate FOR ALL USING (auth.uid() IS NOT NULL);

-- growth_playbooks - fix for 406
DROP POLICY IF EXISTS "growth_playbooks_policy" ON growth_playbooks;
DROP POLICY IF EXISTS "growth_playbooks_all" ON growth_playbooks;
CREATE POLICY "growth_playbooks_read" ON growth_playbooks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "growth_playbooks_write" ON growth_playbooks FOR ALL USING (auth.uid() IS NOT NULL);

-- scheduling_preferences - fix for 406
DROP POLICY IF EXISTS "scheduling_preferences_policy" ON scheduling_preferences;
CREATE POLICY "scheduling_preferences_read" ON scheduling_preferences FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "scheduling_preferences_write" ON scheduling_preferences FOR ALL USING (auth.uid() IS NOT NULL);

-- user_analytics - fix for 406
DROP POLICY IF EXISTS "user_analytics_policy" ON user_analytics;
DROP POLICY IF EXISTS "user_analytics_all" ON user_analytics;
CREATE POLICY "user_analytics_read" ON user_analytics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "user_analytics_write" ON user_analytics FOR ALL USING (auth.uid() IS NOT NULL);

SELECT 'RLS policies fixed!' AS status;
