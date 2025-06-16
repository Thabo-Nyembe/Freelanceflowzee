-- FreeflowZee Analytics Database Setup
-- This script creates tables for comprehensive analytics tracking

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS business_metrics CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

-- Analytics Events Table
-- Tracks all user interactions, page views, and system events
CREATE TABLE analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- page_view, user_action, error, performance, etc.
    event_name VARCHAR(100) NOT NULL, -- specific event name
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100) NOT NULL, -- client-generated session ID
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    properties JSONB DEFAULT '{}', -- flexible event properties
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    performance_metrics JSONB DEFAULT '{}', -- page load times, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Metrics Table
-- Tracks key business metrics and KPIs
CREATE TABLE business_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL, -- revenue, projects_created, etc.
    value NUMERIC NOT NULL, -- metric value
    unit VARCHAR(20) DEFAULT '', -- usd, count, ms, bytes, etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}', -- additional metric context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
-- Tracks user session information for analytics
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    user_actions INTEGER DEFAULT 0,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Views for Easy Reporting
-- Daily metrics summary
CREATE OR REPLACE VIEW daily_metrics AS
SELECT 
    DATE(timestamp) as date,
    metric_name,
    SUM(value) as total_value,
    AVG(value) as avg_value,
    COUNT(*) as count,
    unit
FROM business_metrics 
GROUP BY DATE(timestamp), metric_name, unit
ORDER BY date DESC, metric_name;

-- Hourly event counts
CREATE OR REPLACE VIEW hourly_events AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    event_type,
    event_name,
    COUNT(*) as event_count
FROM analytics_events 
GROUP BY DATE_TRUNC('hour', timestamp), event_type, event_name
ORDER BY hour DESC, event_count DESC;

-- Performance metrics summary
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    DATE(timestamp) as date,
    AVG((performance_metrics->>'page_load_time')::numeric) as avg_page_load_time,
    AVG((performance_metrics->>'dom_content_loaded')::numeric) as avg_dom_load_time,
    AVG((performance_metrics->>'first_contentful_paint')::numeric) as avg_fcp,
    AVG((performance_metrics->>'largest_contentful_paint')::numeric) as avg_lcp,
    AVG((performance_metrics->>'cumulative_layout_shift')::numeric) as avg_cls,
    COUNT(*) as total_measurements
FROM analytics_events 
WHERE event_type = 'performance' 
    AND performance_metrics IS NOT NULL
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    user_id,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_type = 'user_action' THEN 1 END) as user_actions,
    MIN(timestamp) as first_seen,
    MAX(timestamp) as last_seen,
    EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))/3600 as hours_active
FROM analytics_events 
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY last_seen DESC;

-- Revenue tracking view
CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
    DATE(timestamp) as date,
    SUM(CASE WHEN metric_name = 'revenue' THEN value ELSE 0 END) as daily_revenue,
    COUNT(CASE WHEN metric_name = 'payments_completed' THEN 1 END) as payments_count,
    AVG(CASE WHEN metric_name = 'revenue' THEN value END) as avg_payment_amount,
    SUM(CASE WHEN metric_name = 'projects_created' THEN value ELSE 0 END) as projects_created
FROM business_metrics 
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Create indexes for performance
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(properties);

CREATE INDEX idx_business_metrics_timestamp ON business_metrics(timestamp);
CREATE INDEX idx_business_metrics_user_id ON business_metrics(user_id);
CREATE INDEX idx_business_metrics_metric_name ON business_metrics(metric_name);
CREATE INDEX idx_business_metrics_metadata ON business_metrics USING GIN(metadata);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);

-- Create RLS policies for security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Analytics events policy
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all analytics events" ON analytics_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Business metrics policy
CREATE POLICY "Users can view their own business metrics" ON business_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all business metrics" ON business_metrics
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User sessions policy
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions" ON user_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create triggers for automatic session management
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session statistics when new events are added
    UPDATE user_sessions 
    SET 
        page_views = (
            SELECT COUNT(*) FROM analytics_events 
            WHERE session_id = NEW.session_id AND event_type = 'page_view'
        ),
        user_actions = (
            SELECT COUNT(*) FROM analytics_events 
            WHERE session_id = NEW.session_id AND event_type = 'user_action'
        ),
        updated_at = NOW()
    WHERE session_id = NEW.session_id;
    
    -- Create session if it doesn't exist
    INSERT INTO user_sessions (session_id, user_id, start_time)
    VALUES (NEW.session_id, NEW.user_id, NEW.timestamp)
    ON CONFLICT (session_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analytics_session_trigger
    AFTER INSERT ON analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION update_session_stats();

-- Function to calculate session duration
CREATE OR REPLACE FUNCTION end_session(session_id_param VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE user_sessions 
    SET 
        end_time = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER
    WHERE session_id = session_id_param AND end_time IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Analytics aggregation functions
CREATE OR REPLACE FUNCTION get_analytics_summary(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_events BIGINT,
    total_users BIGINT,
    total_sessions BIGINT,
    total_page_views BIGINT,
    total_revenue NUMERIC,
    avg_session_duration NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM analytics_events WHERE DATE(timestamp) BETWEEN start_date AND end_date),
        (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE DATE(timestamp) BETWEEN start_date AND end_date AND user_id IS NOT NULL),
        (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE DATE(timestamp) BETWEEN start_date AND end_date),
        (SELECT COUNT(*) FROM analytics_events WHERE DATE(timestamp) BETWEEN start_date AND end_date AND event_type = 'page_view'),
        (SELECT COALESCE(SUM(value), 0) FROM business_metrics WHERE DATE(timestamp) BETWEEN start_date AND end_date AND metric_name = 'revenue'),
        (SELECT COALESCE(AVG(duration_seconds), 0) FROM user_sessions WHERE DATE(start_time) BETWEEN start_date AND end_date AND duration_seconds IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- Real-time analytics function
CREATE OR REPLACE FUNCTION get_realtime_metrics()
RETURNS TABLE (
    active_sessions BIGINT,
    events_last_hour BIGINT,
    revenue_today NUMERIC,
    page_views_today BIGINT,
    errors_today BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT session_id) FROM analytics_events WHERE timestamp > NOW() - INTERVAL '30 minutes'),
        (SELECT COUNT(*) FROM analytics_events WHERE timestamp > NOW() - INTERVAL '1 hour'),
        (SELECT COALESCE(SUM(value), 0) FROM business_metrics WHERE DATE(timestamp) = CURRENT_DATE AND metric_name = 'revenue'),
        (SELECT COUNT(*) FROM analytics_events WHERE DATE(timestamp) = CURRENT_DATE AND event_type = 'page_view'),
        (SELECT COUNT(*) FROM analytics_events WHERE DATE(timestamp) = CURRENT_DATE AND event_type = 'error');
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO analytics_events (event_type, event_name, session_id, properties, page_url) VALUES 
('page_view', 'page_visited', 'sample_session_1', '{"path": "/", "title": "Home"}', 'http://localhost:3000/'),
('user_action', 'button_clicked', 'sample_session_1', '{"button": "login", "location": "header"}', 'http://localhost:3000/'),
('performance', 'page_performance', 'sample_session_1', '{"page_load_time": 1200}', 'http://localhost:3000/');

INSERT INTO business_metrics (metric_name, value, unit) VALUES 
('page_views', 1, 'count'),
('performance_page_load_time', 1200, 'ms'),
('revenue', 0, 'usd');

-- Grant permissions
GRANT ALL ON analytics_events TO authenticated;
GRANT ALL ON business_metrics TO authenticated;
GRANT ALL ON user_sessions TO authenticated;

GRANT SELECT ON daily_metrics TO authenticated;
GRANT SELECT ON hourly_events TO authenticated;
GRANT SELECT ON performance_summary TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;
GRANT SELECT ON revenue_summary TO authenticated;

GRANT EXECUTE ON FUNCTION get_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_realtime_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION end_session TO authenticated;

-- Success message
SELECT 'Analytics database setup completed successfully!' as status; 