-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Video Analytics
CREATE TABLE IF NOT EXISTS portfolio_video_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES portfolio_videos(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    average_watch_time DECIMAL(10,2) DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    client_interactions INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Satisfaction Metrics
CREATE TABLE IF NOT EXISTS client_satisfaction_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Performance Tracking
CREATE TABLE IF NOT EXISTS skills_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    projects_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    demand_score DECIMAL(3,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Preferences
CREATE TABLE IF NOT EXISTS integration_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, integration_id)
);

-- Add RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_satisfaction_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_preferences ENABLE ROW LEVEL SECURITY;

-- Analytics Events Policies
CREATE POLICY "Users can view their own analytics events"
    ON analytics_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Portfolio Video Analytics Policies
CREATE POLICY "Users can view analytics for their portfolio videos"
    ON portfolio_video_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM portfolio_videos
            WHERE portfolio_videos.id = portfolio_video_analytics.video_id
            AND portfolio_videos.user_id = auth.uid()
        )
    );

-- Client Satisfaction Metrics Policies
CREATE POLICY "Users can view satisfaction metrics for their projects"
    ON client_satisfaction_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = client_satisfaction_metrics.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Skills Performance Policies
CREATE POLICY "Users can view their own skills performance"
    ON skills_performance FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills performance"
    ON skills_performance FOR UPDATE
    USING (auth.uid() = user_id);

-- Integration Preferences Policies
CREATE POLICY "Users can manage their own integration preferences"
    ON integration_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 