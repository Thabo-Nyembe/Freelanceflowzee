-- ============================================================================
-- FIX REMAINING 400/401/406 ERRORS
-- Run this in Supabase Dashboard > SQL Editor
-- Date: January 28, 2026
-- ============================================================================

-- ============================================================================
-- PART 1: FIX TEAM_INVITATIONS RLS (401 errors)
-- ============================================================================

-- Create team_invitations table if not exists
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create permissive ones
DROP POLICY IF EXISTS "Users can view team invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can manage team invitations" ON team_invitations;
CREATE POLICY "team_invitations_select" ON team_invitations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "team_invitations_insert" ON team_invitations FOR INSERT WITH CHECK (auth.uid() = invited_by);
CREATE POLICY "team_invitations_update" ON team_invitations FOR UPDATE USING (auth.uid() = invited_by);
CREATE POLICY "team_invitations_delete" ON team_invitations FOR DELETE USING (auth.uid() = invited_by);

-- ============================================================================
-- PART 2: FIX AI_FEATURE_USAGE RLS (401 error)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_feature_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own ai usage" ON ai_feature_usage;
CREATE POLICY "ai_feature_usage_select" ON ai_feature_usage FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "ai_feature_usage_all" ON ai_feature_usage FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CREATE MISSING TABLES (400 errors)
-- ============================================================================

-- user_metrics_aggregate
CREATE TABLE IF NOT EXISTS user_metrics_aggregate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(12,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_metrics_aggregate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_metrics_aggregate_policy" ON user_metrics_aggregate;
CREATE POLICY "user_metrics_aggregate_policy" ON user_metrics_aggregate FOR ALL USING (auth.uid() = user_id);

-- growth_playbooks
CREATE TABLE IF NOT EXISTS growth_playbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE growth_playbooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "growth_playbooks_policy" ON growth_playbooks;
CREATE POLICY "growth_playbooks_policy" ON growth_playbooks FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- growth_metrics
CREATE TABLE IF NOT EXISTS growth_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2) DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "growth_metrics_policy" ON growth_metrics;
CREATE POLICY "growth_metrics_policy" ON growth_metrics FOR ALL USING (auth.uid() = user_id);

-- user_analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page_views INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_analytics_policy" ON user_analytics;
CREATE POLICY "user_analytics_policy" ON user_analytics FOR ALL USING (auth.uid() = user_id);

-- analytics_platform_metrics
CREATE TABLE IF NOT EXISTS analytics_platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2) DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE analytics_platform_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_platform_metrics_policy" ON analytics_platform_metrics;
CREATE POLICY "analytics_platform_metrics_policy" ON analytics_platform_metrics FOR SELECT USING (auth.uid() IS NOT NULL);

-- analytics_revenue
CREATE TABLE IF NOT EXISTS analytics_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    revenue_type TEXT NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE analytics_revenue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_revenue_policy" ON analytics_revenue;
CREATE POLICY "analytics_revenue_policy" ON analytics_revenue FOR ALL USING (auth.uid() = user_id);

-- integration_marketplace
CREATE TABLE IF NOT EXISTS integration_marketplace (
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
DROP POLICY IF EXISTS "integration_marketplace_policy" ON integration_marketplace;
CREATE POLICY "integration_marketplace_policy" ON integration_marketplace FOR SELECT USING (true);

-- collaboration_channels
CREATE TABLE IF NOT EXISTS collaboration_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE collaboration_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "collaboration_channels_policy" ON collaboration_channels;
CREATE POLICY "collaboration_channels_policy" ON collaboration_channels FOR ALL USING (auth.uid() IS NOT NULL);

-- team_meetings
CREATE TABLE IF NOT EXISTS team_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    meeting_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "team_meetings_policy" ON team_meetings;
CREATE POLICY "team_meetings_policy" ON team_meetings FOR ALL USING (auth.uid() IS NOT NULL);

-- notification_queue
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_queue_policy" ON notification_queue;
CREATE POLICY "notification_queue_policy" ON notification_queue FOR ALL USING (auth.uid() = user_id);

-- booking_services
CREATE TABLE IF NOT EXISTS booking_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "booking_services_policy" ON booking_services;
CREATE POLICY "booking_services_policy" ON booking_services FOR ALL USING (auth.uid() = provider_id OR auth.uid() IS NOT NULL);

-- digital_assets
CREATE TABLE IF NOT EXISTS digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
DROP POLICY IF EXISTS "digital_assets_policy" ON digital_assets;
CREATE POLICY "digital_assets_policy" ON digital_assets FOR ALL USING (auth.uid() = user_id);

-- crm_deals
CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
DROP POLICY IF EXISTS "crm_deals_policy" ON crm_deals;
CREATE POLICY "crm_deals_policy" ON crm_deals FOR ALL USING (auth.uid() = user_id);

-- crm_activities
CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID,
    deal_id UUID,
    activity_type TEXT NOT NULL,
    subject TEXT,
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_activities_policy" ON crm_activities;
CREATE POLICY "crm_activities_policy" ON crm_activities FOR ALL USING (auth.uid() = user_id);

-- crm_contacts
CREATE TABLE IF NOT EXISTS crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
DROP POLICY IF EXISTS "crm_contacts_policy" ON crm_contacts;
CREATE POLICY "crm_contacts_policy" ON crm_contacts FOR ALL USING (auth.uid() = user_id);

-- automations
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
DROP POLICY IF EXISTS "automations_policy" ON automations;
CREATE POLICY "automations_policy" ON automations FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 4: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add deleted_at to milestones if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'deleted_at') THEN
        ALTER TABLE milestones ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add deleted_at to api_keys if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'deleted_at') THEN
        ALTER TABLE api_keys ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add reminder_recipients relation support - create table if needed
CREATE TABLE IF NOT EXISTS reminder_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reminder_recipients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reminder_recipients_policy" ON reminder_recipients;
CREATE POLICY "reminder_recipients_policy" ON reminder_recipients FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 5: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_crm_deals_user_id ON crm_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Migration complete! Created missing tables and fixed RLS policies.' AS status;
