-- Analytics Tracking System Migration
-- This migration adds comprehensive analytics tracking including:
-- - User activity tracking
-- - Resource usage analytics
-- - Performance metrics
-- - Cost tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resource_usage_logs table
CREATE TABLE IF NOT EXISTS resource_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    action TEXT NOT NULL,
    storage_used BIGINT,
    bandwidth_used BIGINT,
    processing_time INTEGER,
    cost DECIMAL(10,4),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost_tracking table
CREATE TABLE IF NOT EXISTS cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    usage_type TEXT NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(10,4) NOT NULL,
    billing_period DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_analytics table
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_storage_used BIGINT DEFAULT 0,
    total_bandwidth_used BIGINT DEFAULT 0,
    total_processing_time INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Create user_metrics table
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);

CREATE INDEX idx_resource_usage_logs_user_id ON resource_usage_logs(user_id);
CREATE INDEX idx_resource_usage_logs_resource ON resource_usage_logs(resource_type, resource_id);
CREATE INDEX idx_resource_usage_logs_created_at ON resource_usage_logs(created_at);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);

CREATE INDEX idx_cost_tracking_user_id ON cost_tracking(user_id);
CREATE INDEX idx_cost_tracking_service ON cost_tracking(service);
CREATE INDEX idx_cost_tracking_billing_period ON cost_tracking(billing_period);

CREATE INDEX idx_daily_analytics_date ON daily_analytics(date);

CREATE INDEX idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX idx_user_metrics_type ON user_metrics(metric_type);
CREATE INDEX idx_user_metrics_measured_at ON user_metrics(measured_at);

-- Enable RLS
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activity logs"
    ON user_activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own resource usage"
    ON resource_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own cost tracking"
    ON cost_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics"
    ON user_metrics FOR SELECT
    USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE user_activity_logs IS 'Tracks all user activities in the system';
COMMENT ON TABLE resource_usage_logs IS 'Logs resource usage and associated costs';
COMMENT ON TABLE performance_metrics IS 'System-wide performance measurements';
COMMENT ON TABLE cost_tracking IS 'Detailed cost tracking per user and service';
COMMENT ON TABLE daily_analytics IS 'Daily rollup of key system metrics';
COMMENT ON TABLE user_metrics IS 'User-specific metrics and measurements'; 