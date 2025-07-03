-- Create video analytics tables
CREATE TABLE IF NOT EXISTS video_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER NOT NULL,
    quality TEXT,
    platform TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_watch_time (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    progress NUMERIC CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    average_watch_time NUMERIC DEFAULT 0,
    completion_rate NUMERIC DEFAULT 0,
    engagement_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_timestamp ON video_views(timestamp);

CREATE INDEX IF NOT EXISTS idx_video_watch_time_video_id ON video_watch_time(video_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_time_user_id ON video_watch_time(user_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_time_start_time ON video_watch_time(start_time);

CREATE INDEX IF NOT EXISTS idx_video_engagement_video_id ON video_engagement_events(video_id);
CREATE INDEX IF NOT EXISTS idx_video_engagement_user_id ON video_engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_video_engagement_type ON video_engagement_events(event_type);

CREATE INDEX IF NOT EXISTS idx_video_daily_analytics_video_id ON video_daily_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_daily_analytics_date ON video_daily_analytics(date);

-- Create utility functions
CREATE OR REPLACE FUNCTION track_video_view(
    _video_id UUID,
    _user_id UUID,
    _duration INTEGER,
    _quality TEXT DEFAULT NULL,
    _platform TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    _view_id UUID;
BEGIN
    INSERT INTO video_views (video_id, user_id, duration, quality, platform)
    VALUES (_video_id, _user_id, _duration, _quality, _platform)
    RETURNING id INTO _view_id;
    
    -- Update daily analytics
    INSERT INTO video_daily_analytics (video_id, date, total_views, unique_viewers)
    VALUES (_video_id, CURRENT_DATE, 1, 1)
    ON CONFLICT (video_id, date)
    DO UPDATE SET 
        total_views = video_daily_analytics.total_views + 1,
        unique_viewers = (
            SELECT COUNT(DISTINCT user_id) 
            FROM video_views 
            WHERE video_id = _video_id 
            AND DATE(timestamp) = CURRENT_DATE
        );
    
    RETURN _view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION record_watch_time(
    _video_id UUID,
    _user_id UUID,
    _start_time TIMESTAMP WITH TIME ZONE,
    _end_time TIMESTAMP WITH TIME ZONE,
    _duration INTEGER,
    _progress NUMERIC
) RETURNS UUID AS $$
DECLARE
    _watch_id UUID;
BEGIN
    INSERT INTO video_watch_time (video_id, user_id, start_time, end_time, duration, progress)
    VALUES (_video_id, _user_id, _start_time, _end_time, _duration, _progress)
    RETURNING id INTO _watch_id;
    
    -- Update daily analytics
    WITH watch_stats AS (
        SELECT 
            video_id,
            AVG(duration) as avg_watch_time,
            COUNT(CASE WHEN progress >= 90 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100 as completion
        FROM video_watch_time
        WHERE video_id = _video_id AND DATE(start_time) = CURRENT_DATE
        GROUP BY video_id
    )
    UPDATE video_daily_analytics
    SET 
        total_watch_time = total_watch_time + _duration,
        average_watch_time = watch_stats.avg_watch_time,
        completion_rate = watch_stats.completion
    FROM watch_stats
    WHERE video_daily_analytics.video_id = _video_id 
    AND video_daily_analytics.date = CURRENT_DATE;
    
    RETURN _watch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_daily_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for video_views
CREATE POLICY "Public videos are viewable by everyone" ON video_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = video_views.video_id 
            AND videos.visibility = 'public'
        )
    );

CREATE POLICY "Users can view their own video analytics" ON video_views
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM videos 
            WHERE videos.id = video_views.video_id 
            AND videos.user_id = auth.uid()
        )
    );

-- Similar policies for other tables
CREATE POLICY "Public videos watch time viewable by everyone" ON video_watch_time FOR SELECT
    USING (EXISTS (SELECT 1 FROM videos WHERE videos.id = video_watch_time.video_id AND videos.visibility = 'public'));

CREATE POLICY "Users can view their own watch time" ON video_watch_time FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM videos WHERE videos.id = video_watch_time.video_id AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Public videos engagement viewable by everyone" ON video_engagement_events FOR SELECT
    USING (EXISTS (SELECT 1 FROM videos WHERE videos.id = video_engagement_events.video_id AND videos.visibility = 'public'));

CREATE POLICY "Users can view their own engagement" ON video_engagement_events FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM videos WHERE videos.id = video_engagement_events.video_id AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Public videos analytics viewable by everyone" ON video_daily_analytics FOR SELECT
    USING (EXISTS (SELECT 1 FROM videos WHERE videos.id = video_daily_analytics.video_id AND videos.visibility = 'public'));

CREATE POLICY "Users can view their own daily analytics" ON video_daily_analytics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM videos WHERE videos.id = video_daily_analytics.video_id AND videos.user_id = auth.uid()
    )); 