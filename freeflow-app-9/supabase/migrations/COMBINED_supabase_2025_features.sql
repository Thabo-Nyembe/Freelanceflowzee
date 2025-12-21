-- ============================================
-- SUPABASE 2025 UPDATE: pgvector Extension & Semantic Search
-- Migration: 20251216000001_pgvector_semantic_search.sql
-- Features: Vector embeddings for AI-powered search
-- ============================================

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- DOCUMENT EMBEDDINGS TABLE
-- Stores vector embeddings for files and documents
-- ============================================
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Source reference
    source_type TEXT NOT NULL CHECK (source_type IN ('file', 'document', 'message', 'project', 'task', 'note')),
    source_id UUID NOT NULL,

    -- Content metadata
    content_hash TEXT NOT NULL, -- SHA256 hash to detect changes
    chunk_index INTEGER DEFAULT 0, -- For long documents split into chunks
    chunk_text TEXT, -- The text that was embedded

    -- Vector embedding (1536 dimensions for OpenAI ada-002, 3072 for text-embedding-3-large)
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    token_count INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique embedding per source chunk
    UNIQUE(source_type, source_id, chunk_index)
);

-- ============================================
-- CHAT MESSAGE EMBEDDINGS
-- For semantic search across conversations
-- ============================================
CREATE TABLE IF NOT EXISTS message_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    chat_id UUID,

    -- Embedding
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Search optimization
    content_preview TEXT, -- First 500 chars for display

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(message_id)
);

-- ============================================
-- PROJECT EMBEDDINGS
-- For finding similar projects
-- ============================================
CREATE TABLE IF NOT EXISTS project_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,

    -- Combined embedding of title + description
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Metadata for filtering
    project_type TEXT,
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(project_id)
);

-- ============================================
-- AI CONTENT EMBEDDINGS
-- For AI-generated content similarity
-- ============================================
CREATE TABLE IF NOT EXISTS ai_content_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Source
    content_type TEXT NOT NULL CHECK (content_type IN ('ai_design', 'ai_text', 'ai_code', 'ai_image', 'ai_video')),
    content_id UUID NOT NULL,

    -- Embedding
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- For recommendation engine
    style_tags TEXT[],
    prompt_embedding vector(1536), -- Embedding of the original prompt

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(content_type, content_id)
);

-- ============================================
-- SEMANTIC SEARCH QUERIES LOG
-- Track search patterns for optimization
-- ============================================
CREATE TABLE IF NOT EXISTS semantic_search_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Query details
    query_text TEXT NOT NULL,
    query_embedding vector(1536),

    -- Search parameters
    search_type TEXT NOT NULL, -- 'documents', 'messages', 'projects', 'ai_content', 'global'
    filters JSONB DEFAULT '{}',
    limit_count INTEGER DEFAULT 10,

    -- Results
    result_count INTEGER,
    result_ids UUID[],

    -- Performance
    search_duration_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VECTOR SIMILARITY INDEXES
-- HNSW indexes for fast approximate nearest neighbor search
-- ============================================

-- Document embeddings index
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
ON document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Message embeddings index
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector
ON message_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Project embeddings index
CREATE INDEX IF NOT EXISTS idx_project_embeddings_vector
ON project_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- AI content embeddings index
CREATE INDEX IF NOT EXISTS idx_ai_content_embeddings_vector
ON ai_content_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================
-- HELPER INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_document_embeddings_user ON document_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_source ON document_embeddings(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user ON message_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_chat ON message_embeddings(chat_id);
CREATE INDEX IF NOT EXISTS idx_project_embeddings_user ON project_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_embeddings_user ON ai_content_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_embeddings_type ON ai_content_embeddings(content_type);

-- ============================================
-- SEMANTIC SEARCH FUNCTIONS
-- ============================================

-- Search documents by similarity
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    filter_user_id UUID DEFAULT NULL,
    filter_source_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source_type TEXT,
    source_id UUID,
    chunk_text TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.id,
        de.source_type,
        de.source_id,
        de.chunk_text,
        1 - (de.embedding <=> query_embedding) AS similarity,
        de.metadata
    FROM document_embeddings de
    WHERE
        (filter_user_id IS NULL OR de.user_id = filter_user_id)
        AND (filter_source_type IS NULL OR de.source_type = filter_source_type)
        AND 1 - (de.embedding <=> query_embedding) > match_threshold
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Search messages by similarity
CREATE OR REPLACE FUNCTION search_messages(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    filter_user_id UUID DEFAULT NULL,
    filter_chat_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    message_id UUID,
    chat_id UUID,
    content_preview TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        me.id,
        me.message_id,
        me.chat_id,
        me.content_preview,
        1 - (me.embedding <=> query_embedding) AS similarity
    FROM message_embeddings me
    WHERE
        (filter_user_id IS NULL OR me.user_id = filter_user_id)
        AND (filter_chat_id IS NULL OR me.chat_id = filter_chat_id)
        AND 1 - (me.embedding <=> query_embedding) > match_threshold
    ORDER BY me.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Find similar projects
CREATE OR REPLACE FUNCTION find_similar_projects(
    query_embedding vector(1536),
    match_count INT DEFAULT 5,
    filter_user_id UUID DEFAULT NULL,
    exclude_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    similarity FLOAT,
    project_type TEXT,
    tags TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.project_id,
        1 - (pe.embedding <=> query_embedding) AS similarity,
        pe.project_type,
        pe.tags
    FROM project_embeddings pe
    WHERE
        (filter_user_id IS NULL OR pe.user_id = filter_user_id)
        AND (exclude_project_id IS NULL OR pe.project_id != exclude_project_id)
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Global semantic search across all content types
CREATE OR REPLACE FUNCTION global_semantic_search(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 20,
    filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    content_type TEXT,
    content_id UUID,
    preview TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    (
        -- Search documents
        SELECT
            'document'::TEXT AS content_type,
            de.source_id AS content_id,
            LEFT(de.chunk_text, 200) AS preview,
            1 - (de.embedding <=> query_embedding) AS similarity,
            de.metadata
        FROM document_embeddings de
        WHERE (filter_user_id IS NULL OR de.user_id = filter_user_id)
        AND 1 - (de.embedding <=> query_embedding) > match_threshold
    )
    UNION ALL
    (
        -- Search messages
        SELECT
            'message'::TEXT AS content_type,
            me.message_id AS content_id,
            me.content_preview AS preview,
            1 - (me.embedding <=> query_embedding) AS similarity,
            jsonb_build_object('chat_id', me.chat_id) AS metadata
        FROM message_embeddings me
        WHERE (filter_user_id IS NULL OR me.user_id = filter_user_id)
        AND 1 - (me.embedding <=> query_embedding) > match_threshold
    )
    UNION ALL
    (
        -- Search projects
        SELECT
            'project'::TEXT AS content_type,
            pe.project_id AS content_id,
            NULL AS preview,
            1 - (pe.embedding <=> query_embedding) AS similarity,
            jsonb_build_object('type', pe.project_type, 'tags', pe.tags) AS metadata
        FROM project_embeddings pe
        WHERE (filter_user_id IS NULL OR pe.user_id = filter_user_id)
        AND 1 - (pe.embedding <=> query_embedding) > match_threshold
    )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_search_log ENABLE ROW LEVEL SECURITY;

-- Document embeddings policies
CREATE POLICY "Users can view own document embeddings"
ON document_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document embeddings"
ON document_embeddings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document embeddings"
ON document_embeddings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own document embeddings"
ON document_embeddings FOR DELETE
USING (auth.uid() = user_id);

-- Message embeddings policies
CREATE POLICY "Users can view own message embeddings"
ON message_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message embeddings"
ON message_embeddings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Project embeddings policies
CREATE POLICY "Users can view own project embeddings"
ON project_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own project embeddings"
ON project_embeddings FOR ALL
USING (auth.uid() = user_id);

-- AI content embeddings policies
CREATE POLICY "Users can view own AI content embeddings"
ON ai_content_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI content embeddings"
ON ai_content_embeddings FOR ALL
USING (auth.uid() = user_id);

-- Search log policies
CREATE POLICY "Users can view own search logs"
ON semantic_search_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search logs"
ON semantic_search_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE document_embeddings IS 'Vector embeddings for document semantic search - Supabase 2025 Vector Buckets integration';
COMMENT ON TABLE message_embeddings IS 'Vector embeddings for chat message search';
COMMENT ON TABLE project_embeddings IS 'Vector embeddings for project similarity matching';
COMMENT ON TABLE ai_content_embeddings IS 'Vector embeddings for AI-generated content recommendations';
COMMENT ON FUNCTION search_documents IS 'Semantic search across documents using cosine similarity';
COMMENT ON FUNCTION global_semantic_search IS 'Global semantic search across all content types';
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

-- Platform metrics visible to admins only
CREATE POLICY "Admins view platform metrics"
ON analytics_platform_metrics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Feature usage visible to admins
CREATE POLICY "Admins view feature usage"
ON analytics_feature_usage FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Revenue visible to admins only
CREATE POLICY "Admins view revenue"
ON analytics_revenue FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'owner')
    )
);

-- AI usage visible to admins
CREATE POLICY "Admins view AI usage"
ON analytics_ai_usage FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

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
-- ============================================
-- SUPABASE 2025 UPDATE: Security Email Templates
-- Migration: 20251216000003_security_email_templates.sql
-- Features: Security notifications for auth events
-- Password changes, email modifications, MFA status
-- ============================================

-- ============================================
-- SECURITY EVENTS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'password_change',
        'email_change',
        'phone_change',
        'mfa_enrolled',
        'mfa_unenrolled',
        'identity_linked',
        'identity_unlinked',
        'new_device_login',
        'suspicious_login',
        'account_locked',
        'account_unlocked',
        'session_revoked',
        'api_key_created',
        'api_key_revoked'
    )),
    event_status TEXT NOT NULL DEFAULT 'pending' CHECK (event_status IN (
        'pending', 'email_sent', 'email_failed', 'acknowledged'
    )),

    -- Context
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    location JSONB, -- { country, city, region }

    -- Change details
    old_value TEXT, -- Hashed or masked for security
    new_value TEXT, -- Hashed or masked for security
    metadata JSONB DEFAULT '{}',

    -- Email tracking
    email_sent_at TIMESTAMPTZ,
    email_template_id TEXT,
    email_error TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

-- ============================================
-- EMAIL TEMPLATE CONFIGURATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS security_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template identification
    template_key TEXT UNIQUE NOT NULL,
    template_name TEXT NOT NULL,
    event_type TEXT NOT NULL,

    -- Email content
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,

    -- Configuration
    is_active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'high' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    send_delay_seconds INTEGER DEFAULT 0, -- Delay before sending (for undo)

    -- Customization
    custom_styles JSONB DEFAULT '{}',
    include_device_info BOOLEAN DEFAULT true,
    include_location_info BOOLEAN DEFAULT true,
    include_action_buttons BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER SECURITY PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_security_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Email notification preferences
    notify_password_change BOOLEAN DEFAULT true,
    notify_email_change BOOLEAN DEFAULT true,
    notify_phone_change BOOLEAN DEFAULT true,
    notify_mfa_change BOOLEAN DEFAULT true,
    notify_new_device BOOLEAN DEFAULT true,
    notify_suspicious_activity BOOLEAN DEFAULT true,
    notify_identity_changes BOOLEAN DEFAULT true,

    -- Security settings
    require_mfa_for_sensitive BOOLEAN DEFAULT false,
    session_timeout_minutes INTEGER DEFAULT 60,
    max_sessions INTEGER DEFAULT 5,

    -- Recovery options
    recovery_email TEXT,
    recovery_phone TEXT,
    trusted_devices JSONB DEFAULT '[]',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KNOWN DEVICES TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS user_known_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Device identification
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT, -- desktop, mobile, tablet
    browser TEXT,
    os TEXT,

    -- Trust status
    is_trusted BOOLEAN DEFAULT false,
    trust_level TEXT DEFAULT 'unknown' CHECK (trust_level IN (
        'unknown', 'recognized', 'trusted', 'blocked'
    )),

    -- Usage tracking
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    login_count INTEGER DEFAULT 1,

    -- Location
    last_ip_address INET,
    last_location JSONB,

    UNIQUE(user_id, device_fingerprint)
);

-- ============================================
-- INSERT DEFAULT EMAIL TEMPLATES
-- ============================================
INSERT INTO security_email_templates (template_key, template_name, event_type, subject_template, html_template, text_template)
VALUES
    -- Password Change
    ('password_changed', 'Password Changed Alert', 'password_change',
     'Security Alert: Your password was changed',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🔐 Password Changed</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>Your KAZI account password was successfully changed.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>When:</strong> {{event_time}}</p>
            {{#if device_info}}<p><strong>Device:</strong> {{device_info}}</p>{{/if}}
            {{#if location}}<p><strong>Location:</strong> {{location}}</p>{{/if}}
        </div>
        <p style="color: #dc3545;"><strong>If you didn''t make this change</strong>, please secure your account immediately:</p>
        <a href="{{reset_url}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0;">Reset Password Now</a>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">This is an automated security notification from KAZI. If you have questions, contact support.</p>
    </div>
</body>
</html>',
     E'Password Changed\n\nHi {{user_name}},\n\nYour KAZI account password was changed on {{event_time}}.\n\nIf you didn''t make this change, reset your password immediately: {{reset_url}}'
    ),

    -- Email Change
    ('email_changed', 'Email Address Changed Alert', 'email_change',
     'Security Alert: Your email address was changed',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">📧 Email Changed</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>The email address associated with your KAZI account was changed.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Old Email:</strong> {{old_email}}</p>
            <p><strong>New Email:</strong> {{new_email}}</p>
            <p><strong>When:</strong> {{event_time}}</p>
        </div>
        <p style="color: #dc3545;"><strong>Didn''t make this change?</strong></p>
        <a href="{{support_url}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Contact Support</a>
    </div>
</body>
</html>',
     E'Email Address Changed\n\nYour email was changed from {{old_email}} to {{new_email}} on {{event_time}}.\n\nIf you didn''t make this change, contact support: {{support_url}}'
    ),

    -- MFA Enrolled
    ('mfa_enrolled', 'Two-Factor Authentication Enabled', 'mfa_enrolled',
     'Security Update: Two-factor authentication enabled',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🛡️ 2FA Enabled</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>Great news! Two-factor authentication has been enabled on your KAZI account.</p>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;"><strong>✓ Your account is now more secure</strong></p>
        </div>
        <p><strong>Method:</strong> {{mfa_method}}</p>
        <p><strong>When:</strong> {{event_time}}</p>
        <p>Make sure to save your recovery codes in a safe place.</p>
    </div>
</body>
</html>',
     E'Two-Factor Authentication Enabled\n\nHi {{user_name}},\n\n2FA has been enabled on your account using {{mfa_method}} on {{event_time}}.\n\nRemember to save your recovery codes!'
    ),

    -- MFA Unenrolled
    ('mfa_unenrolled', 'Two-Factor Authentication Disabled', 'mfa_unenrolled',
     'Security Alert: Two-factor authentication disabled',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">⚠️ 2FA Disabled</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>Two-factor authentication has been <strong>disabled</strong> on your KAZI account.</p>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Your account is now less secure</strong></p>
        </div>
        <p><strong>When:</strong> {{event_time}}</p>
        <p>We strongly recommend re-enabling 2FA to protect your account.</p>
        <a href="{{security_settings_url}}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Security Settings</a>
    </div>
</body>
</html>',
     E'Two-Factor Authentication Disabled\n\nHi {{user_name}},\n\n2FA has been disabled on your account on {{event_time}}.\n\nWe recommend re-enabling it: {{security_settings_url}}'
    ),

    -- New Device Login
    ('new_device_login', 'New Device Sign-In', 'new_device_login',
     'New sign-in to your KAZI account',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🔔 New Sign-In</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>We noticed a new sign-in to your KAZI account.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Device:</strong> {{device_info}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>IP Address:</strong> {{ip_address}}</p>
            <p><strong>Time:</strong> {{event_time}}</p>
        </div>
        <p><strong>Was this you?</strong></p>
        <a href="{{confirm_url}}" style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-right: 10px;">Yes, it was me</a>
        <a href="{{secure_url}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">No, secure my account</a>
    </div>
</body>
</html>',
     E'New Sign-In Detected\n\nHi {{user_name}},\n\nNew sign-in from {{device_info}} in {{location}} on {{event_time}}.\n\nNot you? Secure your account: {{secure_url}}'
    ),

    -- Identity Linked
    ('identity_linked', 'New Identity Provider Linked', 'identity_linked',
     'New sign-in method added to your account',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🔗 Account Linked</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>A new sign-in method has been linked to your KAZI account.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Provider:</strong> {{provider_name}}</p>
            <p><strong>Email:</strong> {{provider_email}}</p>
            <p><strong>When:</strong> {{event_time}}</p>
        </div>
        <p>You can now sign in using {{provider_name}}.</p>
    </div>
</body>
</html>',
     E'Account Linked\n\n{{provider_name}} has been linked to your KAZI account on {{event_time}}.'
    ),

    -- Phone Change
    ('phone_changed', 'Phone Number Changed Alert', 'phone_change',
     'Security Alert: Your phone number was changed',
     E'<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">📱 Phone Changed</h1>
    </div>
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Hi {{user_name}},</p>
        <p>The phone number on your KAZI account was changed.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>When:</strong> {{event_time}}</p>
            {{#if device_info}}<p><strong>Device:</strong> {{device_info}}</p>{{/if}}
        </div>
        <p style="color: #dc3545;"><strong>If you didn''t make this change</strong>, contact support immediately.</p>
    </div>
</body>
</html>',
     E'Phone Number Changed\n\nYour phone number was changed on {{event_time}}.\n\nIf you didn''t make this change, contact support.'
    )
ON CONFLICT (template_key) DO UPDATE SET
    html_template = EXCLUDED.html_template,
    text_template = EXCLUDED.text_template,
    updated_at = NOW();

-- ============================================
-- SECURITY EVENT TRIGGERS
-- ============================================

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_events (
        user_id, event_type, ip_address, user_agent,
        old_value, new_value, metadata
    )
    VALUES (
        p_user_id, p_event_type, p_ip_address, p_user_agent,
        p_old_value, p_new_value, p_metadata
    )
    RETURNING id INTO event_id;

    RETURN event_id;
END;
$$;

-- Function to send security email (called by edge function or webhook)
CREATE OR REPLACE FUNCTION mark_security_email_sent(
    p_event_id UUID,
    p_template_id TEXT,
    p_error TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE security_events
    SET
        event_status = CASE WHEN p_error IS NULL THEN 'email_sent' ELSE 'email_failed' END,
        email_sent_at = CASE WHEN p_error IS NULL THEN NOW() ELSE NULL END,
        email_template_id = p_template_id,
        email_error = p_error
    WHERE id = p_event_id;
END;
$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_events(event_status);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_known_devices_user ON user_known_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_known_devices_fingerprint ON user_known_devices(device_fingerprint);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_known_devices ENABLE ROW LEVEL SECURITY;

-- Security events - users see their own
CREATE POLICY "Users view own security events"
ON security_events FOR SELECT
USING (auth.uid() = user_id);

-- Email templates - admins only for management
CREATE POLICY "Admins manage email templates"
ON security_email_templates FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Security preferences - users manage their own
CREATE POLICY "Users manage own security preferences"
ON user_security_preferences FOR ALL
USING (auth.uid() = user_id);

-- Known devices - users manage their own
CREATE POLICY "Users manage own devices"
ON user_known_devices FOR ALL
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE security_events IS 'Security event logging - Supabase 2025 Security Email Templates';
COMMENT ON TABLE security_email_templates IS 'Email templates for security notifications';
COMMENT ON TABLE user_security_preferences IS 'User preferences for security notifications';
COMMENT ON TABLE user_known_devices IS 'Known/trusted devices for user accounts';
COMMENT ON FUNCTION log_security_event IS 'Log a security event and trigger email notification';
-- ============================================
-- SUPABASE 2025 UPDATE: OAuth 2.0 Provider Capability
-- Migration: 20251216000004_oauth_provider_capability.sql
-- Features: "Sign in with KAZI" for third-party apps
-- OAuth 2.1 and OpenID Connect server support
-- ============================================

-- ============================================
-- OAUTH APPLICATIONS (Third-party apps using KAZI auth)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Application details
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    homepage_url TEXT,

    -- OAuth credentials
    client_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    client_secret_hash TEXT NOT NULL, -- Hashed secret
    client_type TEXT NOT NULL DEFAULT 'confidential' CHECK (client_type IN ('confidential', 'public')),

    -- Redirect URIs (JSON array)
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    allowed_origins TEXT[] DEFAULT '{}',

    -- Scopes this app can request
    allowed_scopes TEXT[] NOT NULL DEFAULT '{openid,profile,email}',

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Verified by KAZI team
    is_first_party BOOLEAN DEFAULT false, -- Internal KAZI apps

    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_day INTEGER DEFAULT 10000,

    -- Token settings
    access_token_lifetime_seconds INTEGER DEFAULT 3600, -- 1 hour
    refresh_token_lifetime_seconds INTEGER DEFAULT 2592000, -- 30 days
    id_token_lifetime_seconds INTEGER DEFAULT 3600,

    -- PKCE settings
    require_pkce BOOLEAN DEFAULT true,

    -- Consent settings
    skip_consent BOOLEAN DEFAULT false, -- For first-party apps
    consent_screen_text TEXT,

    -- Stats
    total_users INTEGER DEFAULT 0,
    total_authorizations INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- ============================================
-- OAUTH AUTHORIZATION CODES
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Authorization code
    code TEXT UNIQUE NOT NULL,
    code_challenge TEXT, -- PKCE
    code_challenge_method TEXT CHECK (code_challenge_method IN ('S256', 'plain')),

    -- Request details
    redirect_uri TEXT NOT NULL,
    scope TEXT[] NOT NULL DEFAULT '{openid}',
    state TEXT,
    nonce TEXT, -- For OpenID Connect

    -- Status
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,

    -- Expiry
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OAUTH ACCESS TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Token
    token_hash TEXT UNIQUE NOT NULL, -- Hashed token
    token_type TEXT NOT NULL DEFAULT 'Bearer',

    -- Scope
    scope TEXT[] NOT NULL DEFAULT '{openid}',

    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    -- Expiry
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    ip_address INET,
    user_agent TEXT
);

-- ============================================
-- OAUTH REFRESH TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token_id UUID REFERENCES oauth_access_tokens(id) ON DELETE SET NULL,

    -- Token
    token_hash TEXT UNIQUE NOT NULL,

    -- Rotation tracking
    previous_token_hash TEXT,
    rotation_count INTEGER DEFAULT 0,

    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    -- Expiry
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- ============================================
-- USER OAUTH AUTHORIZATIONS (Consents)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_user_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,

    -- Authorized scopes
    scopes TEXT[] NOT NULL DEFAULT '{openid}',

    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    -- Timestamps
    authorized_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,

    -- Stats
    access_count INTEGER DEFAULT 0,

    UNIQUE(user_id, application_id)
);

-- ============================================
-- OAUTH SCOPES DEFINITION
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scope details
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Categorization
    category TEXT NOT NULL DEFAULT 'user' CHECK (category IN ('openid', 'user', 'account', 'data', 'admin')),
    is_sensitive BOOLEAN DEFAULT false,
    requires_consent BOOLEAN DEFAULT true,

    -- What this scope grants access to
    claims TEXT[] DEFAULT '{}', -- OpenID Connect claims
    permissions TEXT[] DEFAULT '{}', -- API permissions

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT OAUTH SCOPES
-- ============================================
INSERT INTO oauth_scopes (name, display_name, description, category, claims, permissions)
VALUES
    ('openid', 'OpenID', 'Verify your identity', 'openid', '{sub}', '{}'),
    ('profile', 'Profile Information', 'Access your name and profile picture', 'user', '{name,preferred_username,picture,profile}', '{read:profile}'),
    ('email', 'Email Address', 'Access your email address', 'user', '{email,email_verified}', '{read:email}'),
    ('phone', 'Phone Number', 'Access your phone number', 'user', '{phone_number,phone_number_verified}', '{read:phone}'),
    ('address', 'Address', 'Access your address', 'user', '{address}', '{read:address}'),
    ('offline_access', 'Offline Access', 'Access your data when you''re not using the app', 'account', '{}', '{offline_access}'),
    ('projects:read', 'Read Projects', 'View your projects', 'data', '{}', '{read:projects}'),
    ('projects:write', 'Write Projects', 'Create and edit your projects', 'data', '{}', '{write:projects}'),
    ('files:read', 'Read Files', 'View your files', 'data', '{}', '{read:files}'),
    ('files:write', 'Write Files', 'Upload and manage files', 'data', '{}', '{write:files}'),
    ('invoices:read', 'Read Invoices', 'View your invoices', 'data', '{}', '{read:invoices}'),
    ('invoices:write', 'Write Invoices', 'Create and edit invoices', 'data', '{}', '{write:invoices}'),
    ('messages:read', 'Read Messages', 'View your messages', 'data', '{}', '{read:messages}'),
    ('messages:write', 'Write Messages', 'Send messages', 'data', '{}', '{write:messages}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- OAUTH HELPER FUNCTIONS
-- ============================================

-- Create a new OAuth application
CREATE OR REPLACE FUNCTION create_oauth_application(
    p_owner_id UUID,
    p_name TEXT,
    p_redirect_uris TEXT[],
    p_description TEXT DEFAULT NULL,
    p_allowed_scopes TEXT[] DEFAULT '{openid,profile,email}'
)
RETURNS TABLE (
    client_id TEXT,
    client_secret TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_secret TEXT;
    v_client_id TEXT;
BEGIN
    -- Generate client secret
    v_client_secret := encode(gen_random_bytes(48), 'hex');
    v_client_id := encode(gen_random_bytes(32), 'hex');

    INSERT INTO oauth_applications (
        owner_id, name, description, redirect_uris, allowed_scopes, client_id, client_secret_hash
    )
    VALUES (
        p_owner_id, p_name, p_description, p_redirect_uris, p_allowed_scopes,
        v_client_id, crypt(v_client_secret, gen_salt('bf'))
    );

    -- Return credentials (secret only shown once!)
    RETURN QUERY SELECT v_client_id, v_client_secret;
END;
$$;

-- Verify client credentials
CREATE OR REPLACE FUNCTION verify_oauth_client(
    p_client_id TEXT,
    p_client_secret TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_app_id UUID;
    v_secret_hash TEXT;
BEGIN
    SELECT id, client_secret_hash INTO v_app_id, v_secret_hash
    FROM oauth_applications
    WHERE client_id = p_client_id AND is_active = true;

    IF v_app_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Verify secret
    IF v_secret_hash = crypt(p_client_secret, v_secret_hash) THEN
        RETURN v_app_id;
    END IF;

    RETURN NULL;
END;
$$;

-- Create authorization code
CREATE OR REPLACE FUNCTION create_authorization_code(
    p_app_id UUID,
    p_user_id UUID,
    p_redirect_uri TEXT,
    p_scope TEXT[],
    p_state TEXT DEFAULT NULL,
    p_nonce TEXT DEFAULT NULL,
    p_code_challenge TEXT DEFAULT NULL,
    p_code_challenge_method TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code TEXT;
BEGIN
    v_code := encode(gen_random_bytes(32), 'hex');

    INSERT INTO oauth_authorization_codes (
        application_id, user_id, code, redirect_uri, scope,
        state, nonce, code_challenge, code_challenge_method
    )
    VALUES (
        p_app_id, p_user_id, v_code, p_redirect_uri, p_scope,
        p_state, p_nonce, p_code_challenge, p_code_challenge_method
    );

    RETURN v_code;
END;
$$;

-- Exchange authorization code for tokens
CREATE OR REPLACE FUNCTION exchange_authorization_code(
    p_code TEXT,
    p_client_id TEXT,
    p_redirect_uri TEXT,
    p_code_verifier TEXT DEFAULT NULL
)
RETURNS TABLE (
    access_token TEXT,
    refresh_token TEXT,
    token_type TEXT,
    expires_in INTEGER,
    scope TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auth_code RECORD;
    v_app RECORD;
    v_access_token TEXT;
    v_refresh_token TEXT;
    v_access_token_id UUID;
BEGIN
    -- Get and validate authorization code
    SELECT ac.*, oa.access_token_lifetime_seconds, oa.refresh_token_lifetime_seconds
    INTO v_auth_code
    FROM oauth_authorization_codes ac
    JOIN oauth_applications oa ON oa.id = ac.application_id
    WHERE ac.code = p_code
    AND oa.client_id = p_client_id
    AND ac.redirect_uri = p_redirect_uri
    AND ac.is_used = false
    AND ac.expires_at > NOW();

    IF v_auth_code IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired authorization code';
    END IF;

    -- Verify PKCE if required
    IF v_auth_code.code_challenge IS NOT NULL THEN
        IF p_code_verifier IS NULL THEN
            RAISE EXCEPTION 'Code verifier required';
        END IF;

        IF v_auth_code.code_challenge_method = 'S256' THEN
            IF v_auth_code.code_challenge != encode(sha256(p_code_verifier::bytea), 'base64url') THEN
                RAISE EXCEPTION 'Invalid code verifier';
            END IF;
        ELSE
            IF v_auth_code.code_challenge != p_code_verifier THEN
                RAISE EXCEPTION 'Invalid code verifier';
            END IF;
        END IF;
    END IF;

    -- Mark code as used
    UPDATE oauth_authorization_codes
    SET is_used = true, used_at = NOW()
    WHERE code = p_code;

    -- Generate tokens
    v_access_token := encode(gen_random_bytes(48), 'hex');
    v_refresh_token := encode(gen_random_bytes(48), 'hex');

    -- Store access token
    INSERT INTO oauth_access_tokens (
        application_id, user_id, token_hash, scope, expires_at
    )
    VALUES (
        v_auth_code.application_id,
        v_auth_code.user_id,
        crypt(v_access_token, gen_salt('bf')),
        v_auth_code.scope,
        NOW() + (v_auth_code.access_token_lifetime_seconds || ' seconds')::INTERVAL
    )
    RETURNING id INTO v_access_token_id;

    -- Store refresh token
    INSERT INTO oauth_refresh_tokens (
        application_id, user_id, access_token_id, token_hash, expires_at
    )
    VALUES (
        v_auth_code.application_id,
        v_auth_code.user_id,
        v_access_token_id,
        crypt(v_refresh_token, gen_salt('bf')),
        NOW() + (v_auth_code.refresh_token_lifetime_seconds || ' seconds')::INTERVAL
    );

    -- Update app stats
    UPDATE oauth_applications
    SET
        total_authorizations = total_authorizations + 1,
        last_used_at = NOW()
    WHERE id = v_auth_code.application_id;

    -- Return tokens
    RETURN QUERY SELECT
        v_access_token,
        v_refresh_token,
        'Bearer'::TEXT,
        v_auth_code.access_token_lifetime_seconds,
        array_to_string(v_auth_code.scope, ' ');
END;
$$;

-- Revoke user authorization for an app
CREATE OR REPLACE FUNCTION revoke_oauth_authorization(
    p_user_id UUID,
    p_app_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Revoke authorization
    UPDATE oauth_user_authorizations
    SET is_revoked = true, revoked_at = NOW()
    WHERE user_id = p_user_id AND application_id = p_app_id;

    -- Revoke all tokens
    UPDATE oauth_access_tokens
    SET is_revoked = true, revoked_at = NOW()
    WHERE user_id = p_user_id AND application_id = p_app_id;

    UPDATE oauth_refresh_tokens
    SET is_revoked = true, revoked_at = NOW()
    WHERE user_id = p_user_id AND application_id = p_app_id;
END;
$$;

-- Get user's authorized applications
CREATE OR REPLACE FUNCTION get_user_authorized_apps(p_user_id UUID)
RETURNS TABLE (
    app_id UUID,
    app_name TEXT,
    app_logo TEXT,
    scopes TEXT[],
    authorized_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        oa.id,
        oa.name,
        oa.logo_url,
        oua.scopes,
        oua.authorized_at,
        oua.last_used_at
    FROM oauth_user_authorizations oua
    JOIN oauth_applications oa ON oa.id = oua.application_id
    WHERE oua.user_id = p_user_id
    AND oua.is_revoked = false
    ORDER BY oua.last_used_at DESC NULLS LAST;
END;
$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_oauth_apps_owner ON oauth_applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_client_id ON oauth_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_active ON oauth_applications(is_active);

CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_expires ON oauth_authorization_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_hash ON oauth_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_user ON oauth_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_expires ON oauth_access_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_hash ON oauth_refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_user ON oauth_refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_user ON oauth_user_authorizations(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_app ON oauth_user_authorizations(application_id);

-- ============================================
-- CLEANUP EXPIRED TOKENS (Run periodically)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Delete expired authorization codes
    DELETE FROM oauth_authorization_codes WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    -- Delete expired access tokens
    DELETE FROM oauth_access_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    -- Delete expired refresh tokens
    DELETE FROM oauth_refresh_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    RETURN deleted_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE oauth_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_user_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_scopes ENABLE ROW LEVEL SECURITY;

-- Applications - owners can manage their own
CREATE POLICY "Owners manage own OAuth apps"
ON oauth_applications FOR ALL
USING (auth.uid() = owner_id);

-- Users can view active apps for authorization
CREATE POLICY "Users view active OAuth apps"
ON oauth_applications FOR SELECT
USING (is_active = true);

-- Authorization codes - service role only
CREATE POLICY "Service role manages auth codes"
ON oauth_authorization_codes FOR ALL
USING (false); -- Only via RPC functions

-- Access tokens - users can view their own
CREATE POLICY "Users view own access tokens"
ON oauth_access_tokens FOR SELECT
USING (auth.uid() = user_id);

-- Users can revoke their own tokens
CREATE POLICY "Users revoke own access tokens"
ON oauth_access_tokens FOR UPDATE
USING (auth.uid() = user_id);

-- Refresh tokens - similar to access tokens
CREATE POLICY "Users view own refresh tokens"
ON oauth_refresh_tokens FOR SELECT
USING (auth.uid() = user_id);

-- User authorizations - users manage their own
CREATE POLICY "Users manage own authorizations"
ON oauth_user_authorizations FOR ALL
USING (auth.uid() = user_id);

-- Scopes - public read
CREATE POLICY "Public read OAuth scopes"
ON oauth_scopes FOR SELECT
USING (is_active = true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE oauth_applications IS 'Third-party apps using KAZI OAuth - Supabase 2025 OAuth Provider';
COMMENT ON TABLE oauth_authorization_codes IS 'OAuth 2.1 authorization codes with PKCE support';
COMMENT ON TABLE oauth_access_tokens IS 'OAuth access tokens for API access';
COMMENT ON TABLE oauth_refresh_tokens IS 'OAuth refresh tokens with rotation support';
COMMENT ON TABLE oauth_user_authorizations IS 'User consents for OAuth applications';
COMMENT ON TABLE oauth_scopes IS 'Available OAuth scopes and OpenID Connect claims';
COMMENT ON FUNCTION create_oauth_application IS 'Create a new OAuth application (returns credentials)';
COMMENT ON FUNCTION exchange_authorization_code IS 'Exchange auth code for access/refresh tokens';
