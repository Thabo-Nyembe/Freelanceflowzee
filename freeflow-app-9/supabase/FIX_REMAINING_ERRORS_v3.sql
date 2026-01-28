-- ============================================================================
-- FIX REMAINING ERRORS v3 - Safe version with column checks
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE MISSING TABLES FIRST (before policies)
-- ============================================================================

-- team_invitations
DROP TABLE IF EXISTS team_invitations CASCADE;
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'pending',
    invited_by UUID,
    user_id UUID,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_invitations_all" ON team_invitations FOR ALL USING (auth.uid() IS NOT NULL);

-- ai_feature_usage
DROP TABLE IF EXISTS ai_feature_usage CASCADE;
CREATE TABLE ai_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_feature_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_feature_usage_all" ON ai_feature_usage FOR ALL USING (auth.uid() IS NOT NULL);

-- user_metrics_aggregate
DROP TABLE IF EXISTS user_metrics_aggregate CASCADE;
CREATE TABLE user_metrics_aggregate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(12,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_metrics_aggregate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_metrics_aggregate_all" ON user_metrics_aggregate FOR ALL USING (auth.uid() IS NOT NULL);

-- growth_playbooks
DROP TABLE IF EXISTS growth_playbooks CASCADE;
CREATE TABLE growth_playbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE growth_playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "growth_playbooks_all" ON growth_playbooks FOR ALL USING (auth.uid() IS NOT NULL);

-- growth_metrics
DROP TABLE IF EXISTS growth_metrics CASCADE;
CREATE TABLE growth_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2) DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "growth_metrics_all" ON growth_metrics FOR ALL USING (auth.uid() IS NOT NULL);

-- user_analytics
DROP TABLE IF EXISTS user_analytics CASCADE;
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    page_views INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_analytics_all" ON user_analytics FOR ALL USING (auth.uid() IS NOT NULL);

-- analytics_platform_metrics
DROP TABLE IF EXISTS analytics_platform_metrics CASCADE;
CREATE TABLE analytics_platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2) DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE analytics_platform_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_platform_metrics_all" ON analytics_platform_metrics FOR SELECT USING (true);

-- analytics_revenue
DROP TABLE IF EXISTS analytics_revenue CASCADE;
CREATE TABLE analytics_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    revenue_type TEXT NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE analytics_revenue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_revenue_all" ON analytics_revenue FOR ALL USING (auth.uid() IS NOT NULL);

-- integration_marketplace
DROP TABLE IF EXISTS integration_marketplace CASCADE;
CREATE TABLE integration_marketplace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    icon_url TEXT,
    is_published BOOLEAN DEFAULT false,
    install_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE integration_marketplace ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_marketplace_all" ON integration_marketplace FOR SELECT USING (true);

-- collaboration_channels
DROP TABLE IF EXISTS collaboration_channels CASCADE;
CREATE TABLE collaboration_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE collaboration_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collaboration_channels_all" ON collaboration_channels FOR ALL USING (auth.uid() IS NOT NULL);

-- team_meetings
DROP TABLE IF EXISTS team_meetings CASCADE;
CREATE TABLE team_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    meeting_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_meetings_all" ON team_meetings FOR ALL USING (auth.uid() IS NOT NULL);

-- notification_queue
DROP TABLE IF EXISTS notification_queue CASCADE;
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    notification_type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_queue_all" ON notification_queue FOR ALL USING (auth.uid() IS NOT NULL);

-- booking_services
DROP TABLE IF EXISTS booking_services CASCADE;
CREATE TABLE booking_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID,
    user_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking_services_all" ON booking_services FOR ALL USING (auth.uid() IS NOT NULL);

-- digital_assets
DROP TABLE IF EXISTS digital_assets CASCADE;
CREATE TABLE digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    asset_type TEXT,
    file_url TEXT,
    file_size INTEGER,
    status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "digital_assets_all" ON digital_assets FOR ALL USING (auth.uid() IS NOT NULL);

-- crm_deals
DROP TABLE IF EXISTS crm_deals CASCADE;
CREATE TABLE crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    contact_id UUID,
    name TEXT NOT NULL,
    value DECIMAL(12,2),
    stage TEXT DEFAULT 'lead',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_deals_all" ON crm_deals FOR ALL USING (auth.uid() IS NOT NULL);

-- crm_activities
DROP TABLE IF EXISTS crm_activities CASCADE;
CREATE TABLE crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    contact_id UUID,
    deal_id UUID,
    activity_type TEXT NOT NULL DEFAULT 'note',
    subject TEXT,
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_activities_all" ON crm_activities FOR ALL USING (auth.uid() IS NOT NULL);

-- crm_contacts
DROP TABLE IF EXISTS crm_contacts CASCADE;
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'active',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_contacts_all" ON crm_contacts FOR ALL USING (auth.uid() IS NOT NULL);

-- automations
DROP TABLE IF EXISTS automations CASCADE;
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    trigger_type TEXT,
    actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    run_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automations_all" ON automations FOR ALL USING (auth.uid() IS NOT NULL);

-- reminder_recipients
DROP TABLE IF EXISTS reminder_recipients CASCADE;
CREATE TABLE reminder_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reminder_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reminder_recipients_all" ON reminder_recipients FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PART 2: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'milestones') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'deleted_at') THEN
            ALTER TABLE milestones ADD COLUMN deleted_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'deleted_at') THEN
            ALTER TABLE api_keys ADD COLUMN deleted_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PART 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_crm_deals_user_id ON crm_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);

SELECT 'Migration v3 complete!' AS status;
