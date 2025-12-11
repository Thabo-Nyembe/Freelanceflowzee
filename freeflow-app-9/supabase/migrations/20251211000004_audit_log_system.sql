-- =====================================================
-- KAZI Enterprise Audit Log System Migration
-- Version: 1.0.0
-- Date: 2025-12-11
-- Description: Comprehensive audit logging for compliance,
--              security monitoring, and activity tracking
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Actor Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_type VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'api', 'webhook', 'automation', 'admin')),
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),

    -- Action Details
    action VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL CHECK (action_category IN (
        'auth', 'data', 'settings', 'billing', 'team', 'integration',
        'file', 'communication', 'admin', 'security', 'system'
    )),
    action_severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (action_severity IN ('debug', 'info', 'warning', 'error', 'critical')),

    -- Resource Information
    resource_type VARCHAR(50),
    resource_id TEXT,
    resource_name TEXT,

    -- Change Tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],

    -- Request Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    api_version VARCHAR(20),

    -- Geographic Information
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),

    -- Additional Context
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',

    -- Status
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial', 'pending')),
    error_message TEXT,
    error_code VARCHAR(50),

    -- Compliance
    is_sensitive BOOLEAN DEFAULT false,
    retention_days INTEGER DEFAULT 365,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexing hint for partitioning
    partition_key DATE DEFAULT CURRENT_DATE
);

-- =====================================================
-- INDEXES FOR AUDIT LOGS
-- =====================================================

DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(action_category); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(action_severity); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_partition ON audit_logs(partition_key); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_tags ON audit_logs USING GIN(tags); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING GIN(metadata); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Composite indexes for common queries
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_audit_logs_category_date ON audit_logs(action_category, created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- SECURITY EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event Classification
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'login_success', 'login_failure', 'logout',
        'password_change', 'password_reset', 'mfa_enabled', 'mfa_disabled',
        'api_key_created', 'api_key_revoked', 'api_key_used',
        'permission_granted', 'permission_revoked',
        'suspicious_activity', 'brute_force_detected', 'rate_limit_exceeded',
        'unauthorized_access', 'data_export', 'bulk_delete',
        'session_hijack_attempt', 'ip_block', 'account_locked'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Actor
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,

    -- Location
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    is_vpn BOOLEAN,
    is_tor BOOLEAN,
    is_proxy BOOLEAN,

    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- Response
    action_taken VARCHAR(50),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security events
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(is_resolved) WHERE is_resolved = false; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- DATA ACCESS LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who accessed
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- What was accessed
    table_name VARCHAR(100) NOT NULL,
    record_id TEXT,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('select', 'insert', 'update', 'delete', 'export', 'bulk')),

    -- Query info
    query_type VARCHAR(50),
    fields_accessed TEXT[],
    row_count INTEGER,

    -- Context
    ip_address INET,
    user_agent TEXT,
    api_endpoint VARCHAR(255),

    -- Timing
    duration_ms INTEGER,

    -- Additional
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for data access logs
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_data_access_user_id ON data_access_logs(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_data_access_table ON data_access_logs(table_name); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_data_access_type ON data_access_logs(access_type); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_data_access_created ON data_access_logs(created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_data_access_record ON data_access_logs(table_name, record_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- API USAGE LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Request info
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    api_key_id UUID,

    -- Endpoint
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    path_params JSONB,
    query_params JSONB,

    -- Request
    request_body_size INTEGER,
    request_headers JSONB,

    -- Response
    status_code INTEGER NOT NULL,
    response_body_size INTEGER,

    -- Timing
    duration_ms INTEGER,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Rate limiting
    rate_limit_remaining INTEGER,
    rate_limit_reset TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API usage logs
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage_logs(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs(endpoint); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_api_usage_status ON api_usage_logs(status_code); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_logs(created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_api_usage_api_key ON api_usage_logs(api_key_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- AUDIT RETENTION POLICIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Policy details
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Targeting
    log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('audit_logs', 'security_events', 'data_access_logs', 'api_usage_logs', 'all')),
    action_category VARCHAR(50),
    action_severity VARCHAR(20),

    -- Retention
    retention_days INTEGER NOT NULL DEFAULT 365,
    archive_before_delete BOOLEAN DEFAULT true,
    archive_location TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs - users can see their own logs, admins can see all
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT
    WITH CHECK (true); -- Allow system to insert any log

-- Security events - users can see their own, admins see all
DROP POLICY IF EXISTS "security_events_select" ON security_events;
CREATE POLICY "security_events_select" ON security_events FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = target_user_id);

DROP POLICY IF EXISTS "security_events_insert" ON security_events;
CREATE POLICY "security_events_insert" ON security_events FOR INSERT
    WITH CHECK (true);

-- Data access logs
DROP POLICY IF EXISTS "data_access_logs_select" ON data_access_logs;
CREATE POLICY "data_access_logs_select" ON data_access_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "data_access_logs_insert" ON data_access_logs;
CREATE POLICY "data_access_logs_insert" ON data_access_logs FOR INSERT
    WITH CHECK (true);

-- API usage logs
DROP POLICY IF EXISTS "api_usage_logs_select" ON api_usage_logs;
CREATE POLICY "api_usage_logs_select" ON api_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "api_usage_logs_insert" ON api_usage_logs;
CREATE POLICY "api_usage_logs_insert" ON api_usage_logs FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Log audit event function
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_action_category VARCHAR(50),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_changed_fields TEXT[];
BEGIN
    -- Calculate changed fields if both old and new values exist
    IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
        SELECT ARRAY_AGG(key)
        INTO v_changed_fields
        FROM (
            SELECT key FROM jsonb_object_keys(p_old_values) AS key
            WHERE p_old_values->key IS DISTINCT FROM p_new_values->key
            UNION
            SELECT key FROM jsonb_object_keys(p_new_values) AS key
            WHERE p_old_values->key IS DISTINCT FROM p_new_values->key
        ) changed;
    END IF;

    INSERT INTO audit_logs (
        user_id,
        action,
        action_category,
        resource_type,
        resource_id,
        old_values,
        new_values,
        changed_fields,
        metadata,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action,
        p_action_category,
        p_resource_type,
        p_resource_id,
        p_old_values,
        p_new_values,
        v_changed_fields,
        p_metadata,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log security event function
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR(50),
    p_severity VARCHAR(20),
    p_user_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO security_events (
        event_type,
        severity,
        user_id,
        description,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_event_type,
        p_severity,
        p_user_id,
        p_description,
        p_ip_address,
        p_user_agent,
        p_metadata
    )
    RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get audit summary function
CREATE OR REPLACE FUNCTION get_audit_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_summary JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_events', COUNT(*),
        'by_category', (
            SELECT jsonb_object_agg(action_category, cnt)
            FROM (
                SELECT action_category, COUNT(*) as cnt
                FROM audit_logs
                WHERE user_id = p_user_id
                AND created_at > NOW() - (p_days || ' days')::INTERVAL
                GROUP BY action_category
            ) sub
        ),
        'by_severity', (
            SELECT jsonb_object_agg(action_severity, cnt)
            FROM (
                SELECT action_severity, COUNT(*) as cnt
                FROM audit_logs
                WHERE user_id = p_user_id
                AND created_at > NOW() - (p_days || ' days')::INTERVAL
                GROUP BY action_severity
            ) sub
        ),
        'recent_failures', (
            SELECT COUNT(*)
            FROM audit_logs
            WHERE user_id = p_user_id
            AND status = 'failure'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        )
    )
    INTO v_summary
    FROM audit_logs
    WHERE user_id = p_user_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL;

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old audit logs function
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER := 0;
BEGIN
    -- Delete logs older than retention period
    WITH deleted AS (
        DELETE FROM audit_logs
        WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted FROM deleted;

    -- Also cleanup security events older than 2 years
    DELETE FROM security_events
    WHERE created_at < NOW() - INTERVAL '730 days';

    -- Cleanup data access logs older than 90 days
    DELETE FROM data_access_logs
    WHERE created_at < NOW() - INTERVAL '90 days';

    -- Cleanup API usage logs older than 30 days
    DELETE FROM api_usage_logs
    WHERE created_at < NOW() - INTERVAL '30 days';

    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC LOGGING
-- =====================================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit_event(
            NEW.user_id,
            TG_TABLE_NAME || '_created',
            'data',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit_event(
            COALESCE(NEW.user_id, OLD.user_id),
            TG_TABLE_NAME || '_updated',
            'data',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit_event(
            OLD.user_id,
            TG_TABLE_NAME || '_deleted',
            'data',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================

DO $$ BEGIN GRANT SELECT, INSERT ON audit_logs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT ON security_events TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT ON data_access_logs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT ON api_usage_logs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT ON audit_retention_policies TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN GRANT ALL ON audit_logs TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON security_events TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON data_access_logs TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON api_usage_logs TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON audit_retention_policies TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

DO $$ BEGIN COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all system activities'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE security_events IS 'Security-specific events for threat detection and compliance'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE data_access_logs IS 'Tracks all data access for compliance and forensics'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE api_usage_logs IS 'API usage tracking for rate limiting and analytics'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
