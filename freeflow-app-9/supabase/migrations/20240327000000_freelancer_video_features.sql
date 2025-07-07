-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolio Videos Table
CREATE TABLE IF NOT EXISTS portfolio_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    category VARCHAR(50),
    skills TEXT[] DEFAULT '{}',
    client_testimonial TEXT,
    insights JSONB DEFAULT '{}',
    chapters JSONB DEFAULT '[]',
    transcription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Sessions Table
CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'needs_changes')),
    client_feedback TEXT[] DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    chapters JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS Policies
ALTER TABLE portfolio_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- Portfolio Videos Policies
CREATE POLICY "Users can view their own portfolio videos"
    ON portfolio_videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio videos"
    ON portfolio_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio videos"
    ON portfolio_videos FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio videos"
    ON portfolio_videos FOR DELETE
    USING (auth.uid() = user_id);

-- Review Sessions Policies
CREATE POLICY "Project members can view review sessions"
    ON review_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = review_sessions.project_id
            AND (
                p.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM project_members pm
                    WHERE pm.project_id = p.id
                    AND pm.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Project owners can insert review sessions"
    ON review_sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can update review sessions"
    ON review_sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = review_sessions.project_id
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can delete review sessions"
    ON review_sessions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = review_sessions.project_id
            AND p.user_id = auth.uid()
        )
    ); 