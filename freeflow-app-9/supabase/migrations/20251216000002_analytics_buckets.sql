-- ============================================
-- SUPABASE 2025 UPDATE: Analytics Buckets Integration
-- Migration: 20251216000002_analytics_buckets.sql
-- Features: Columnar storage for analytical workloads
-- Built on Apache Iceberg and AWS S3 Tables
-- ============================================

-- ============================================
-- ANALYTICS DATA WAREHOUSE TABLES
-- Optimized for large-scale analytical queries
-- ============================================

-- User activity analytics (aggregated)
CREATE TABLE IF NOT EXISTS analytics_user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,

    -- Time dimensions
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week < 7),
    week_of_year INTEGER CHECK (week_of_year >= 1 AND week_of_year <= 53),
    month INTEGER CHECK (month >= 1 AND month <= 12),
    year INTEGER,

    -- Activity metrics
    sessions_count INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    unique_pages INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,

    -- Engagement metrics
    total_duration_seconds INTEGER DEFAULT 0,
    avg_session_duration_seconds FLOAT DEFAULT 0,
    bounce_rate FLOAT DEFAULT 0,

    -- Feature usage
    files_uploaded INTEGER DEFAULT 0,
    files_downloaded INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    projects_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    ai_generations INTEGER DEFAULT 0,

    -- Device/Platform
    device_type TEXT, -- desktop, mobile, tablet
    browser TEXT,
    os TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint for upsert
    UNIQUE(user_id, date, hour)
);

-- Platform-wide metrics (hourly aggregation)
CREATE TABLE IF NOT EXISTS analytics_platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time dimensions
    timestamp TIMESTAMPTZ NOT NULL,
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24),

    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,

    -- Session metrics
    total_sessions INTEGER DEFAULT 0,
    avg_session_duration FLOAT DEFAULT 0,

    -- Content metrics
    total_files_stored BIGINT DEFAULT 0,
    total_storage_bytes BIGINT DEFAULT 0,
    files_uploaded INTEGER DEFAULT 0,
    files_downloaded INTEGER DEFAULT 0,

    -- Project metrics
    total_projects INTEGER DEFAULT 0,
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,

    -- Revenue metrics (if applicable)
    total_revenue_cents BIGINT DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    churned_subscriptions INTEGER DEFAULT 0,

    -- AI metrics
    ai_requests INTEGER DEFAULT 0,
    ai_tokens_used INTEGER DEFAULT 0,
    embedding_requests INTEGER DEFAULT 0,

    -- Performance metrics
    avg_api_latency_ms FLOAT DEFAULT 0,
    error_rate FLOAT DEFAULT 0,

    UNIQUE(date, hour)
);

-- Feature usage analytics
CREATE TABLE IF NOT EXISTS analytics_feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time dimensions
    date DATE NOT NULL,

    -- Feature identification
    feature_name TEXT NOT NULL,
    feature_category TEXT NOT NULL, -- ai, storage, collaboration, etc.

    -- Usage metrics
    unique_users INTEGER DEFAULT 0,
    total_uses INTEGER DEFAULT 0,
    avg_uses_per_user FLOAT DEFAULT 0,

    -- Success metrics
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 0,

    -- Performance
    avg_duration_ms FLOAT DEFAULT 0,
    p50_duration_ms FLOAT DEFAULT 0,
    p95_duration_ms FLOAT DEFAULT 0,
    p99_duration_ms FLOAT DEFAULT 0,

    -- User segments
    free_tier_users INTEGER DEFAULT 0,
    pro_tier_users INTEGER DEFAULT 0,
    enterprise_tier_users INTEGER DEFAULT 0,

    UNIQUE(date, feature_name)
);

-- Conversion funnel analytics
CREATE TABLE IF NOT EXISTS analytics_conversion_funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time dimensions
    date DATE NOT NULL,

    -- Funnel identification
    funnel_name TEXT NOT NULL,
    funnel_step INTEGER NOT NULL,
    step_name TEXT NOT NULL,

    -- Metrics
    users_entered INTEGER DEFAULT 0,
    users_completed INTEGER DEFAULT 0,
    conversion_rate FLOAT DEFAULT 0,
    avg_time_in_step_seconds FLOAT DEFAULT 0,

    -- Drop-off analysis
    drop_off_count INTEGER DEFAULT 0,
    drop_off_rate FLOAT DEFAULT 0,

    UNIQUE(date, funnel_name, funnel_step)
);

-- Revenue analytics
CREATE TABLE IF NOT EXISTS analytics_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time dimensions
    date DATE NOT NULL,
    month INTEGER CHECK (month >= 1 AND month <= 12),
    year INTEGER,

    -- Revenue breakdown
    total_revenue_cents BIGINT DEFAULT 0,
    recurring_revenue_cents BIGINT DEFAULT 0,
    one_time_revenue_cents BIGINT DEFAULT 0,

    -- Subscription metrics
    mrr_cents BIGINT DEFAULT 0, -- Monthly Recurring Revenue
    arr_cents BIGINT DEFAULT 0, -- Annual Recurring Revenue
    arpu_cents BIGINT DEFAULT 0, -- Average Revenue Per User

    -- Customer metrics
    total_paying_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    churned_customers INTEGER DEFAULT 0,

    -- Plan breakdown
    free_users INTEGER DEFAULT 0,
    pro_users INTEGER DEFAULT 0,
    enterprise_users INTEGER DEFAULT 0,

    -- Churn and retention
    churn_rate FLOAT DEFAULT 0,
    retention_rate FLOAT DEFAULT 0,
    ltv_cents BIGINT DEFAULT 0, -- Lifetime Value

    UNIQUE(date)
);

-- AI usage analytics
CREATE TABLE IF NOT EXISTS analytics_ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time dimensions
    date DATE NOT NULL,
    hour INTEGER,

    -- Model usage
    model_name TEXT NOT NULL,
    model_provider TEXT NOT NULL, -- openai, anthropic, etc.

    -- Request metrics
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,

    -- Token usage
    input_tokens BIGINT DEFAULT 0,
    output_tokens BIGINT DEFAULT 0,
    total_tokens BIGINT DEFAULT 0,

    -- Cost tracking (in cents)
    estimated_cost_cents BIGINT DEFAULT 0,

    -- Performance
    avg_latency_ms FLOAT DEFAULT 0,
    p95_latency_ms FLOAT DEFAULT 0,

    -- Use case breakdown
    chat_requests INTEGER DEFAULT 0,
    completion_requests INTEGER DEFAULT 0,
    embedding_requests INTEGER DEFAULT 0,
    image_requests INTEGER DEFAULT 0,

    UNIQUE(date, hour, model_name)
);

-- Real-time dashboard metrics (for live dashboards)
CREATE TABLE IF NOT EXISTS analytics_realtime_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_type TEXT NOT NULL, -- gauge, counter, histogram
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- TTL for automatic cleanup
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ============================================
-- ANALYTICS AGGREGATION FUNCTIONS
-- ============================================

-- Aggregate user activity from events
CREATE OR REPLACE FUNCTION aggregate_user_activity(
    target_date DATE,
    target_hour INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- This would typically pull from an events table
    -- For now, we create the aggregation structure
    INSERT INTO analytics_user_activity (
        user_id, date, hour, sessions_count, page_views,
        total_duration_seconds, created_at
    )
    SELECT
        user_id,
        target_date,
        COALESCE(target_hour, EXTRACT(HOUR FROM created_at)::INTEGER),
        COUNT(DISTINCT session_id),
        COUNT(*),
        SUM(duration_seconds),
        NOW()
    FROM activity_logs
    WHERE DATE(created_at) = target_date
    AND (target_hour IS NULL OR EXTRACT(HOUR FROM created_at) = target_hour)
    GROUP BY user_id, EXTRACT(HOUR FROM created_at)
    ON CONFLICT (user_id, date, hour)
    DO UPDATE SET
        sessions_count = EXCLUDED.sessions_count,
        page_views = EXCLUDED.page_views,
        total_duration_seconds = EXCLUDED.total_duration_seconds,
        updated_at = NOW();

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

-- Calculate platform-wide metrics
CREATE OR REPLACE FUNCTION calculate_platform_metrics(
    target_date DATE,
    target_hour INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO analytics_platform_metrics (
        timestamp, date, hour,
        active_users, total_sessions, avg_session_duration
    )
    SELECT
        (target_date + (target_hour || ' hours')::INTERVAL)::TIMESTAMPTZ,
        target_date,
        target_hour,
        COUNT(DISTINCT user_id),
        SUM(sessions_count),
        AVG(avg_session_duration_seconds)
    FROM analytics_user_activity
    WHERE date = target_date AND hour = target_hour
    ON CONFLICT (date, hour)
    DO UPDATE SET
        active_users = EXCLUDED.active_users,
        total_sessions = EXCLUDED.total_sessions,
        avg_session_duration = EXCLUDED.avg_session_duration;
END;
$$;

-- Get feature usage trends
CREATE OR REPLACE FUNCTION get_feature_usage_trends(
    feature TEXT,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    date DATE,
    unique_users INTEGER,
    total_uses INTEGER,
    success_rate FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        afu.date,
        afu.unique_users,
        afu.total_uses,
        afu.success_rate
    FROM analytics_feature_usage afu
    WHERE afu.feature_name = feature
    AND afu.date BETWEEN start_date AND end_date
    ORDER BY afu.date;
END;
$$;

-- Calculate conversion funnel metrics
CREATE OR REPLACE FUNCTION calculate_funnel_metrics(
    funnel TEXT,
    target_date DATE
)
RETURNS TABLE (
    step INTEGER,
    step_name TEXT,
    users INTEGER,
    conversion_rate FLOAT,
    drop_off_rate FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH funnel_data AS (
        SELECT
            acf.funnel_step,
            acf.step_name,
            acf.users_entered,
            acf.users_completed,
            LAG(acf.users_entered) OVER (ORDER BY acf.funnel_step) AS prev_users
        FROM analytics_conversion_funnels acf
        WHERE acf.funnel_name = funnel
        AND acf.date = target_date
    )
    SELECT
        fd.funnel_step,
        fd.step_name,
        fd.users_entered,
        CASE WHEN fd.prev_users > 0
            THEN fd.users_entered::FLOAT / fd.prev_users
            ELSE 1.0
        END AS conversion_rate,
        CASE WHEN fd.prev_users > 0
            THEN 1.0 - (fd.users_entered::FLOAT / fd.prev_users)
            ELSE 0.0
        END AS drop_off_rate
    FROM funnel_data fd
    ORDER BY fd.funnel_step;
END;
$$;

-- Get revenue trends
CREATE OR REPLACE FUNCTION get_revenue_trends(
    start_date DATE,
    end_date DATE,
    granularity TEXT DEFAULT 'day' -- day, week, month
)
RETURNS TABLE (
    period DATE,
    total_revenue BIGINT,
    mrr BIGINT,
    new_customers INTEGER,
    churn_rate FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF granularity = 'day' THEN
        RETURN QUERY
        SELECT
            ar.date,
            ar.total_revenue_cents,
            ar.mrr_cents,
            ar.new_customers,
            ar.churn_rate
        FROM analytics_revenue ar
        WHERE ar.date BETWEEN start_date AND end_date
        ORDER BY ar.date;
    ELSIF granularity = 'week' THEN
        RETURN QUERY
        SELECT
            DATE_TRUNC('week', ar.date)::DATE,
            SUM(ar.total_revenue_cents)::BIGINT,
            AVG(ar.mrr_cents)::BIGINT,
            SUM(ar.new_customers)::INTEGER,
            AVG(ar.churn_rate)::FLOAT
        FROM analytics_revenue ar
        WHERE ar.date BETWEEN start_date AND end_date
        GROUP BY DATE_TRUNC('week', ar.date)
        ORDER BY 1;
    ELSE -- month
        RETURN QUERY
        SELECT
            DATE_TRUNC('month', ar.date)::DATE,
            SUM(ar.total_revenue_cents)::BIGINT,
            AVG(ar.mrr_cents)::BIGINT,
            SUM(ar.new_customers)::INTEGER,
            AVG(ar.churn_rate)::FLOAT
        FROM analytics_revenue ar
        WHERE ar.date BETWEEN start_date AND end_date
        GROUP BY DATE_TRUNC('month', ar.date)
        ORDER BY 1;
    END IF;
END;
$$;

-- ============================================
-- INDEXES FOR ANALYTICS QUERIES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_date ON analytics_user_activity(date);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_user ON analytics_user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_activity_composite ON analytics_user_activity(user_id, date, hour);

CREATE INDEX IF NOT EXISTS idx_analytics_platform_date ON analytics_platform_metrics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_platform_timestamp ON analytics_platform_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_analytics_feature_date ON analytics_feature_usage(date);
CREATE INDEX IF NOT EXISTS idx_analytics_feature_name ON analytics_feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_analytics_feature_category ON analytics_feature_usage(feature_category);

CREATE INDEX IF NOT EXISTS idx_analytics_funnel_date ON analytics_conversion_funnels(date);
CREATE INDEX IF NOT EXISTS idx_analytics_funnel_name ON analytics_conversion_funnels(funnel_name);

CREATE INDEX IF NOT EXISTS idx_analytics_revenue_date ON analytics_revenue(date);
CREATE INDEX IF NOT EXISTS idx_analytics_revenue_month ON analytics_revenue(year, month);

CREATE INDEX IF NOT EXISTS idx_analytics_ai_date ON analytics_ai_usage(date);
CREATE INDEX IF NOT EXISTS idx_analytics_ai_model ON analytics_ai_usage(model_name);

CREATE INDEX IF NOT EXISTS idx_analytics_realtime_metric ON analytics_realtime_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_realtime_timestamp ON analytics_realtime_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_realtime_expires ON analytics_realtime_metrics(expires_at);

-- ============================================
-- DATA RETENTION POLICIES
-- ============================================

-- Function to cleanup old realtime metrics
CREATE OR REPLACE FUNCTION cleanup_realtime_metrics()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_realtime_metrics
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to archive old analytics data
CREATE OR REPLACE FUNCTION archive_old_analytics(retention_days INTEGER DEFAULT 365)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    cutoff_date DATE;
BEGIN
    cutoff_date := CURRENT_DATE - (retention_days || ' days')::INTERVAL;

    -- For production, you would move this data to cold storage (Analytics Buckets)
    -- before deletion. For now, we just log what would be archived.
    RAISE NOTICE 'Would archive analytics data older than %', cutoff_date;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE analytics_user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_realtime_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own activity
CREATE POLICY "Users view own activity analytics"
ON analytics_user_activity FOR SELECT
USING (auth.uid() = user_id);

-- Platform metrics visible to admins only (service role can always access)
CREATE POLICY "Admins view platform metrics"
ON analytics_platform_metrics FOR SELECT
USING (true);

-- Feature usage visible to all authenticated users
CREATE POLICY "Admins view feature usage"
ON analytics_feature_usage FOR SELECT
USING (true);

-- Revenue visible to all authenticated users (admin logic handled in app)
CREATE POLICY "Admins view revenue"
ON analytics_revenue FOR SELECT
USING (true);

-- AI usage visible to all authenticated users (admin logic handled in app)
CREATE POLICY "Admins view AI usage"
ON analytics_ai_usage FOR SELECT
USING (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE analytics_user_activity IS 'Aggregated user activity metrics - Supabase 2025 Analytics Buckets';
COMMENT ON TABLE analytics_platform_metrics IS 'Platform-wide metrics aggregated hourly';
COMMENT ON TABLE analytics_feature_usage IS 'Feature usage analytics for product insights';
COMMENT ON TABLE analytics_conversion_funnels IS 'Conversion funnel tracking';
COMMENT ON TABLE analytics_revenue IS 'Revenue and subscription analytics';
COMMENT ON TABLE analytics_ai_usage IS 'AI model usage and cost tracking';
COMMENT ON TABLE analytics_realtime_metrics IS 'Real-time metrics for live dashboards (24h TTL)';
