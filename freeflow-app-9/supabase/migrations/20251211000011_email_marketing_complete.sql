-- =====================================================
-- KAZI Email Marketing System - Complete Migration
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP AND RECREATE TABLES FOR CLEAN SLATE
-- =====================================================
DROP TABLE IF EXISTS email_import_jobs CASCADE;
DROP TABLE IF EXISTS email_segments CASCADE;
DROP TABLE IF EXISTS email_lists CASCADE;
DROP TABLE IF EXISTS email_subscribers CASCADE;

-- =====================================================
-- EMAIL SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE email_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    source VARCHAR(50) DEFAULT 'manual',
    source_details JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    list_ids UUID[] DEFAULT '{}',
    engagement_score INTEGER DEFAULT 50,
    last_email_sent_at TIMESTAMPTZ,
    last_email_opened_at TIMESTAMPTZ,
    last_email_clicked_at TIMESTAMPTZ,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_emails_clicked INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    location JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- =====================================================
-- EMAIL LISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'manual',
    status VARCHAR(20) DEFAULT 'active',
    subscriber_count INTEGER DEFAULT 0,
    double_optin BOOLEAN DEFAULT false,
    welcome_email_id UUID,
    tags TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL SEGMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'dynamic',
    conditions JSONB NOT NULL DEFAULT '[]',
    condition_operator VARCHAR(10) DEFAULT 'and',
    subscriber_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL IMPORT JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    imported_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    field_mapping JSONB NOT NULL DEFAULT '{}',
    options JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Email subscribers indexes
CREATE INDEX IF NOT EXISTS idx_email_subscribers_user ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(user_id, email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(user_id, status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_lists ON email_subscribers USING GIN(list_ids);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_tags ON email_subscribers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_engagement ON email_subscribers(user_id, engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_created ON email_subscribers(created_at DESC);

-- Email lists indexes
CREATE INDEX IF NOT EXISTS idx_email_lists_user ON email_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_email_lists_status ON email_lists(user_id, status);

-- Email segments indexes
CREATE INDEX IF NOT EXISTS idx_email_segments_user ON email_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_email_segments_active ON email_segments(user_id, is_active) WHERE is_active = true;

-- Email import jobs indexes
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_user ON email_import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_list ON email_import_jobs(list_id);
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_status ON email_import_jobs(status);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_import_jobs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "email_subscribers_all" ON email_subscribers;
    DROP POLICY IF EXISTS "email_lists_all" ON email_lists;
    DROP POLICY IF EXISTS "email_segments_all" ON email_segments;
    DROP POLICY IF EXISTS "email_import_jobs_all" ON email_import_jobs;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "email_subscribers_all" ON email_subscribers FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "email_lists_all" ON email_lists FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "email_segments_all" ON email_segments FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "email_import_jobs_all" ON email_import_jobs FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON email_subscribers TO authenticated;
GRANT ALL ON email_lists TO authenticated;
GRANT ALL ON email_segments TO authenticated;
GRANT ALL ON email_import_jobs TO authenticated;

GRANT ALL ON email_subscribers TO service_role;
GRANT ALL ON email_lists TO service_role;
GRANT ALL ON email_segments TO service_role;
GRANT ALL ON email_import_jobs TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_subscribers_updated_at ON email_subscribers;
CREATE TRIGGER email_subscribers_updated_at
    BEFORE UPDATE ON email_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS email_lists_updated_at ON email_lists;
CREATE TRIGGER email_lists_updated_at
    BEFORE UPDATE ON email_lists
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

DROP TRIGGER IF EXISTS email_segments_updated_at ON email_segments;
CREATE TRIGGER email_segments_updated_at
    BEFORE UPDATE ON email_segments
    FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get subscriber stats
CREATE OR REPLACE FUNCTION get_subscriber_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
    v_this_month TIMESTAMPTZ;
BEGIN
    v_this_month := date_trunc('month', NOW());

    SELECT jsonb_build_object(
        'total', (SELECT COUNT(*) FROM email_subscribers WHERE user_id = p_user_id),
        'active', (SELECT COUNT(*) FROM email_subscribers WHERE user_id = p_user_id AND status = 'active'),
        'unsubscribed', (SELECT COUNT(*) FROM email_subscribers WHERE user_id = p_user_id AND status = 'unsubscribed'),
        'bounced', (SELECT COUNT(*) FROM email_subscribers WHERE user_id = p_user_id AND status = 'bounced'),
        'complained', (SELECT COUNT(*) FROM email_subscribers WHERE user_id = p_user_id AND status = 'complained'),
        'new_this_month', (SELECT COUNT(*) FROM email_subscribers WHERE user_id = p_user_id AND created_at >= v_this_month),
        'avg_engagement_score', COALESCE((SELECT AVG(engagement_score) FROM email_subscribers WHERE user_id = p_user_id AND status = 'active'), 0)
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get list stats
CREATE OR REPLACE FUNCTION get_list_stats(p_list_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total', (SELECT COUNT(*) FROM email_subscribers WHERE p_list_id = ANY(list_ids)),
        'active', (SELECT COUNT(*) FROM email_subscribers WHERE p_list_id = ANY(list_ids) AND status = 'active'),
        'unsubscribed', (SELECT COUNT(*) FROM email_subscribers WHERE p_list_id = ANY(list_ids) AND status = 'unsubscribed'),
        'avg_engagement', COALESCE((
            SELECT AVG(engagement_score) FROM email_subscribers
            WHERE p_list_id = ANY(list_ids) AND status = 'active'
        ), 0)
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update subscriber engagement after email event
CREATE OR REPLACE FUNCTION update_subscriber_engagement(
    p_subscriber_id UUID,
    p_event_type VARCHAR(20)
)
RETURNS VOID AS $$
DECLARE
    v_subscriber email_subscribers%ROWTYPE;
    v_new_score INTEGER;
BEGIN
    SELECT * INTO v_subscriber FROM email_subscribers WHERE id = p_subscriber_id;
    IF NOT FOUND THEN RETURN; END IF;

    v_new_score := v_subscriber.engagement_score;

    -- Adjust score based on event
    CASE p_event_type
        WHEN 'sent' THEN
            UPDATE email_subscribers SET
                total_emails_sent = total_emails_sent + 1,
                last_email_sent_at = NOW()
            WHERE id = p_subscriber_id;
        WHEN 'open' THEN
            v_new_score := LEAST(100, v_new_score + 2);
            UPDATE email_subscribers SET
                total_emails_opened = total_emails_opened + 1,
                last_email_opened_at = NOW(),
                engagement_score = v_new_score
            WHERE id = p_subscriber_id;
        WHEN 'click' THEN
            v_new_score := LEAST(100, v_new_score + 5);
            UPDATE email_subscribers SET
                total_emails_clicked = total_emails_clicked + 1,
                last_email_clicked_at = NOW(),
                engagement_score = v_new_score
            WHERE id = p_subscriber_id;
        WHEN 'bounce' THEN
            UPDATE email_subscribers SET
                status = 'bounced',
                engagement_score = 0
            WHERE id = p_subscriber_id;
        WHEN 'complaint' THEN
            UPDATE email_subscribers SET
                status = 'complained',
                engagement_score = 0
            WHERE id = p_subscriber_id;
        WHEN 'unsubscribe' THEN
            UPDATE email_subscribers SET
                status = 'unsubscribed',
                unsubscribed_at = NOW()
            WHERE id = p_subscriber_id;
        ELSE
            NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
