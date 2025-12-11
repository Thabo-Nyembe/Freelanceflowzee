-- =====================================================
-- KAZI Integrations & Webhooks System - Complete Migration
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP AND RECREATE TABLES FOR CLEAN SLATE
-- =====================================================
DROP TABLE IF EXISTS sync_jobs CASCADE;
DROP TABLE IF EXISTS oauth_states CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS webhook_processing_queue CASCADE;
DROP TABLE IF EXISTS incoming_webhook_logs CASCADE;
DROP TABLE IF EXISTS incoming_webhooks CASCADE;
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;

-- =====================================================
-- INTEGRATIONS TABLE
-- =====================================================
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    credentials JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    scopes TEXT[] DEFAULT '{}',
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    sync_frequency VARCHAR(20),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOKS TABLE (outgoing)
-- =====================================================
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    headers JSONB DEFAULT '{}',
    retry_policy JSONB DEFAULT '{"max_retries": 3, "retry_delay_ms": 5000, "exponential_backoff": true}',
    last_triggered_at TIMESTAMPTZ,
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOK DELIVERIES TABLE
-- =====================================================
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    response_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- =====================================================
-- INCOMING WEBHOOKS TABLE
-- =====================================================
CREATE TABLE incoming_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(50),
    description TEXT,
    secret VARCHAR(255),
    signature_type VARCHAR(20) DEFAULT 'hmac-sha256',
    is_active BOOLEAN DEFAULT true,
    allowed_ips TEXT[],
    total_received INTEGER DEFAULT 0,
    last_received_at TIMESTAMPTZ,
    processing_rules JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INCOMING WEBHOOK LOGS TABLE
-- =====================================================
CREATE TABLE incoming_webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID NOT NULL REFERENCES incoming_webhooks(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    rejection_reason TEXT,
    event_type VARCHAR(100),
    payload JSONB,
    payload_preview TEXT,
    request_headers JSONB,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOK PROCESSING QUEUE TABLE
-- =====================================================
CREATE TABLE webhook_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_log_id UUID REFERENCES incoming_webhook_logs(id) ON DELETE SET NULL,
    endpoint_id UUID NOT NULL REFERENCES incoming_webhooks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100),
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SYNC JOBS TABLE
-- =====================================================
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    created_items INTEGER DEFAULT 0,
    updated_items INTEGER DEFAULT 0,
    skipped_items INTEGER DEFAULT 0,
    error_items INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- API KEYS TABLE
-- =====================================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    scopes TEXT[] DEFAULT '{"read"}',
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 1000,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- OAUTH STATES TABLE (for OAuth flow verification)
-- =====================================================
CREATE TABLE oauth_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    state VARCHAR(255) NOT NULL UNIQUE,
    integration_type VARCHAR(50) NOT NULL,
    redirect_uri TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(user_id, type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(user_id, status);

-- Webhooks indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(events);

-- Webhook deliveries indexes
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) WHERE status = 'retrying';

-- Incoming webhooks indexes
CREATE INDEX IF NOT EXISTS idx_incoming_webhooks_user ON incoming_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_incoming_webhooks_active ON incoming_webhooks(is_active) WHERE is_active = true;

-- Incoming webhook logs indexes
CREATE INDEX IF NOT EXISTS idx_incoming_webhook_logs_endpoint ON incoming_webhook_logs(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_incoming_webhook_logs_created ON incoming_webhook_logs(created_at DESC);

-- Webhook processing queue indexes
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_processing_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_webhook_queue_user ON webhook_processing_queue(user_id);

-- Sync jobs indexes
CREATE INDEX IF NOT EXISTS idx_sync_jobs_integration ON sync_jobs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_user ON sync_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- OAuth states indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "integrations_all" ON integrations;
    DROP POLICY IF EXISTS "webhooks_all" ON webhooks;
    DROP POLICY IF EXISTS "webhook_deliveries_select" ON webhook_deliveries;
    DROP POLICY IF EXISTS "incoming_webhooks_all" ON incoming_webhooks;
    DROP POLICY IF EXISTS "incoming_webhook_logs_select" ON incoming_webhook_logs;
    DROP POLICY IF EXISTS "webhook_queue_all" ON webhook_processing_queue;
    DROP POLICY IF EXISTS "sync_jobs_all" ON sync_jobs;
    DROP POLICY IF EXISTS "api_keys_all" ON api_keys;
    DROP POLICY IF EXISTS "oauth_states_all" ON oauth_states;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Integrations policies
CREATE POLICY "integrations_all" ON integrations FOR ALL
    USING (user_id = auth.uid());

-- Webhooks policies
CREATE POLICY "webhooks_all" ON webhooks FOR ALL
    USING (user_id = auth.uid());

-- Webhook deliveries policies (read via webhook ownership)
CREATE POLICY "webhook_deliveries_select" ON webhook_deliveries FOR SELECT
    USING (webhook_id IN (SELECT id FROM webhooks WHERE user_id = auth.uid()));

-- Incoming webhooks policies
CREATE POLICY "incoming_webhooks_all" ON incoming_webhooks FOR ALL
    USING (user_id = auth.uid());

-- Incoming webhook logs policies
CREATE POLICY "incoming_webhook_logs_select" ON incoming_webhook_logs FOR SELECT
    USING (endpoint_id IN (SELECT id FROM incoming_webhooks WHERE user_id = auth.uid()));

-- Webhook processing queue policies
CREATE POLICY "webhook_queue_all" ON webhook_processing_queue FOR ALL
    USING (user_id = auth.uid());

-- Sync jobs policies
CREATE POLICY "sync_jobs_all" ON sync_jobs FOR ALL
    USING (user_id = auth.uid());

-- API keys policies
CREATE POLICY "api_keys_all" ON api_keys FOR ALL
    USING (user_id = auth.uid());

-- OAuth states policies
CREATE POLICY "oauth_states_all" ON oauth_states FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON integrations TO authenticated;
GRANT ALL ON webhooks TO authenticated;
GRANT ALL ON webhook_deliveries TO authenticated;
GRANT ALL ON incoming_webhooks TO authenticated;
GRANT ALL ON incoming_webhook_logs TO authenticated;
GRANT ALL ON webhook_processing_queue TO authenticated;
GRANT ALL ON sync_jobs TO authenticated;
GRANT ALL ON api_keys TO authenticated;
GRANT ALL ON oauth_states TO authenticated;

GRANT ALL ON integrations TO service_role;
GRANT ALL ON webhooks TO service_role;
GRANT ALL ON webhook_deliveries TO service_role;
GRANT ALL ON incoming_webhooks TO service_role;
GRANT ALL ON incoming_webhook_logs TO service_role;
GRANT ALL ON webhook_processing_queue TO service_role;
GRANT ALL ON sync_jobs TO service_role;
GRANT ALL ON api_keys TO service_role;
GRANT ALL ON oauth_states TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS integrations_updated_at ON integrations;
CREATE TRIGGER integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_integrations_updated_at();

DROP TRIGGER IF EXISTS webhooks_updated_at ON webhooks;
CREATE TRIGGER webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_integrations_updated_at();

DROP TRIGGER IF EXISTS incoming_webhooks_updated_at ON incoming_webhooks;
CREATE TRIGGER incoming_webhooks_updated_at
    BEFORE UPDATE ON incoming_webhooks
    FOR EACH ROW EXECUTE FUNCTION update_integrations_updated_at();

-- Auto-cleanup expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM oauth_states WHERE expires_at < NOW();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Clean up old webhook deliveries (keep last 1000 per webhook)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_deliveries()
RETURNS void AS $$
BEGIN
    DELETE FROM webhook_deliveries
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (
                PARTITION BY webhook_id
                ORDER BY created_at DESC
            ) as rn
            FROM webhook_deliveries
        ) ranked
        WHERE rn > 1000
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_integration_stats(UUID);
DROP FUNCTION IF EXISTS get_pending_webhook_retries();
DROP FUNCTION IF EXISTS get_pending_webhook_queue_items(INTEGER);
DROP FUNCTION IF EXISTS check_api_key_rate_limit(UUID);
DROP FUNCTION IF EXISTS trigger_webhooks_for_event(UUID, VARCHAR, JSONB);

-- Get integration stats for a user
CREATE OR REPLACE FUNCTION get_integration_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_integrations', (SELECT COUNT(*) FROM integrations WHERE user_id = p_user_id),
        'active_integrations', (SELECT COUNT(*) FROM integrations WHERE user_id = p_user_id AND status = 'active'),
        'total_webhooks', (SELECT COUNT(*) FROM webhooks WHERE user_id = p_user_id),
        'active_webhooks', (SELECT COUNT(*) FROM webhooks WHERE user_id = p_user_id AND is_active = true),
        'total_api_keys', (SELECT COUNT(*) FROM api_keys WHERE user_id = p_user_id AND is_active = true),
        'total_sync_jobs', (SELECT COUNT(*) FROM sync_jobs WHERE user_id = p_user_id),
        'recent_webhook_deliveries', (
            SELECT COUNT(*) FROM webhook_deliveries wd
            JOIN webhooks w ON w.id = wd.webhook_id
            WHERE w.user_id = p_user_id
            AND wd.created_at >= NOW() - INTERVAL '24 hours'
        ),
        'webhook_success_rate', COALESCE((
            SELECT ROUND(
                (SUM(successful_deliveries)::NUMERIC / NULLIF(SUM(total_deliveries), 0)) * 100,
                2
            )
            FROM webhooks WHERE user_id = p_user_id
        ), 100)
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending webhook retries
CREATE OR REPLACE FUNCTION get_pending_webhook_retries()
RETURNS TABLE(
    delivery_id UUID,
    webhook_id UUID,
    user_id UUID,
    event_type VARCHAR(100),
    payload JSONB,
    retry_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wd.id,
        wd.webhook_id,
        w.user_id,
        wd.event_type,
        wd.payload,
        wd.retry_count
    FROM webhook_deliveries wd
    JOIN webhooks w ON w.id = wd.webhook_id
    WHERE wd.status = 'retrying'
    AND wd.next_retry_at <= NOW()
    AND wd.retry_count < (w.retry_policy->>'max_retries')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending webhook processing queue items
CREATE OR REPLACE FUNCTION get_pending_webhook_queue_items(p_limit INTEGER DEFAULT 100)
RETURNS TABLE(
    queue_id UUID,
    endpoint_id UUID,
    user_id UUID,
    event_type VARCHAR(100),
    payload JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wpq.id,
        wpq.endpoint_id,
        wpq.user_id,
        wpq.event_type,
        wpq.payload
    FROM webhook_processing_queue wpq
    WHERE wpq.status = 'pending'
    ORDER BY wpq.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check API key rate limit
CREATE OR REPLACE FUNCTION check_api_key_rate_limit(p_key_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_key api_keys%ROWTYPE;
    v_recent_count INTEGER;
    v_allowed BOOLEAN;
BEGIN
    SELECT * INTO v_key FROM api_keys WHERE id = p_key_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('allowed', false, 'error', 'Key not found');
    END IF;

    -- Count requests in last hour (simplified rate limiting)
    -- In production, use Redis or a proper rate limiting solution
    v_recent_count := v_key.usage_count;

    v_allowed := v_recent_count < v_key.rate_limit;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'remaining', GREATEST(0, v_key.rate_limit - v_recent_count),
        'limit', v_key.rate_limit,
        'reset_at', date_trunc('hour', NOW()) + INTERVAL '1 hour'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger webhooks for an event
CREATE OR REPLACE FUNCTION trigger_webhooks_for_event(
    p_user_id UUID,
    p_event_type VARCHAR(100),
    p_payload JSONB
)
RETURNS INTEGER AS $$
DECLARE
    v_webhook RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_webhook IN
        SELECT * FROM webhooks
        WHERE user_id = p_user_id
        AND is_active = true
        AND (p_event_type = ANY(events) OR '*' = ANY(events))
    LOOP
        -- Create delivery record
        INSERT INTO webhook_deliveries (
            webhook_id,
            event_type,
            payload,
            status
        ) VALUES (
            v_webhook.id,
            p_event_type,
            jsonb_build_object(
                'event', p_event_type,
                'timestamp', NOW(),
                'data', p_payload
            ),
            'pending'
        );

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
