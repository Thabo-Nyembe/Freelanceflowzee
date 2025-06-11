-- Universal Pinpoint Feedback (UPF) System Database Schema
-- This migration creates the complete database structure for the UPF system

-- Create enum types
CREATE TYPE comment_type AS ENUM ('image', 'video', 'code', 'audio', 'doc', 'text');
CREATE TYPE comment_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE comment_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'laugh', 'angry', 'sad', 'thumbs_up', 'thumbs_down');

-- Create UPF Comments table
CREATE TABLE upf_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id UUID NOT NULL,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES upf_comments(id) ON DELETE CASCADE, -- For threaded replies
    content TEXT NOT NULL,
    comment_type comment_type NOT NULL DEFAULT 'text',
    position_data JSONB DEFAULT '{}', -- Flexible storage for different position types
    status comment_status NOT NULL DEFAULT 'open',
    priority comment_priority NOT NULL DEFAULT 'medium',
    mentions TEXT[] DEFAULT '{}', -- Array of mentioned user IDs
    voice_note_url TEXT,
    voice_note_duration INTEGER, -- Duration in seconds
    ai_analysis JSONB, -- AI-generated analysis and insights
    metadata JSONB DEFAULT '{}', -- Additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_upf_comments_file_id ON upf_comments(file_id);
CREATE INDEX idx_upf_comments_project_id ON upf_comments(project_id);
CREATE INDEX idx_upf_comments_user_id ON upf_comments(user_id);
CREATE INDEX idx_upf_comments_parent_id ON upf_comments(parent_id);
CREATE INDEX idx_upf_comments_status ON upf_comments(status);
CREATE INDEX idx_upf_comments_priority ON upf_comments(priority);
CREATE INDEX idx_upf_comments_created_at ON upf_comments(created_at);
CREATE INDEX idx_upf_comments_type ON upf_comments(comment_type);

-- GIN index for JSONB fields
CREATE INDEX idx_upf_comments_position_data ON upf_comments USING GIN(position_data);
CREATE INDEX idx_upf_comments_ai_analysis ON upf_comments USING GIN(ai_analysis);
CREATE INDEX idx_upf_comments_mentions ON upf_comments USING GIN(mentions);

-- Create UPF Reactions table
CREATE TABLE upf_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id) -- One reaction per user per comment
);

-- Create indexes for reactions
CREATE INDEX idx_upf_reactions_comment_id ON upf_reactions(comment_id);
CREATE INDEX idx_upf_reactions_user_id ON upf_reactions(user_id);
CREATE INDEX idx_upf_reactions_type ON upf_reactions(reaction_type);

-- Create UPF Attachments table
CREATE TABLE upf_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for attachments
CREATE INDEX idx_upf_attachments_comment_id ON upf_attachments(comment_id);
CREATE INDEX idx_upf_attachments_uploaded_by ON upf_attachments(uploaded_by);

-- Create UPF Voice Notes table (for standalone voice notes)
CREATE TABLE upf_voice_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- Duration in seconds
    waveform_data JSONB, -- Waveform visualization data
    transcript TEXT, -- Auto-generated transcript (future feature)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for voice notes
CREATE INDEX idx_upf_voice_notes_user_id ON upf_voice_notes(user_id);
CREATE INDEX idx_upf_voice_notes_created_at ON upf_voice_notes(created_at);

-- Create UPF Analytics table for tracking metrics
CREATE TABLE upf_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    comments_count INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    voice_notes_count INTEGER DEFAULT 0,
    ai_suggestions_count INTEGER DEFAULT 0,
    average_resolution_time INTERVAL,
    top_categories TEXT[] DEFAULT '{}',
    metrics JSONB DEFAULT '{}', -- Additional metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, date) -- One record per project per day
);

-- Create indexes for analytics
CREATE INDEX idx_upf_analytics_project_id ON upf_analytics(project_id);
CREATE INDEX idx_upf_analytics_date ON upf_analytics(date);

-- Create Project Files table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS project_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for project files
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);

-- Create Project Activity table for activity logging
CREATE TABLE IF NOT EXISTS project_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON project_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON project_activity(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_upf_comments_updated_at
    BEFORE UPDATE ON upf_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE upf_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for upf_comments
CREATE POLICY "Users can view comments they have access to" ON upf_comments
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = upf_comments.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own comments" ON upf_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON upf_comments
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = upf_comments.project_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Users can delete their own comments" ON upf_comments
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = upf_comments.project_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- RLS Policies for upf_reactions
CREATE POLICY "Users can view reactions on accessible comments" ON upf_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM upf_comments 
            WHERE id = upf_reactions.comment_id 
            AND (
                auth.uid() = upf_comments.user_id OR
                EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_id = upf_comments.project_id 
                    AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can manage their own reactions" ON upf_reactions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for upf_attachments
CREATE POLICY "Users can view attachments on accessible comments" ON upf_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM upf_comments 
            WHERE id = upf_attachments.comment_id 
            AND (
                auth.uid() = upf_comments.user_id OR
                EXISTS (
                    SELECT 1 FROM project_collaborators 
                    WHERE project_id = upf_comments.project_id 
                    AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can upload attachments to their comments" ON upf_attachments
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- RLS Policies for upf_voice_notes
CREATE POLICY "Users can manage their own voice notes" ON upf_voice_notes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for upf_analytics
CREATE POLICY "Users can view analytics for their projects" ON upf_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = upf_analytics.project_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for project_files
CREATE POLICY "Users can view files in their projects" ON project_files
    FOR SELECT USING (
        auth.uid() = uploaded_by OR
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = project_files.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload files to their projects" ON project_files
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = project_files.project_id 
            AND user_id = auth.uid()
        )
    );

-- RLS Policies for project_activity
CREATE POLICY "Users can view activity in their projects" ON project_activity
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_collaborators 
            WHERE project_id = project_activity.project_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can log their own activity" ON project_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION calculate_upf_analytics(project_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
    comments_total INTEGER;
    resolved_total INTEGER;
    voice_notes_total INTEGER;
    ai_suggestions_total INTEGER;
    avg_resolution INTERVAL;
    top_cats TEXT[];
BEGIN
    -- Calculate metrics for the given project and date
    SELECT COUNT(*) INTO comments_total
    FROM upf_comments 
    WHERE project_id = project_uuid 
    AND DATE(created_at) = target_date;
    
    SELECT COUNT(*) INTO resolved_total
    FROM upf_comments 
    WHERE project_id = project_uuid 
    AND status = 'resolved'
    AND DATE(updated_at) = target_date;
    
    SELECT COUNT(*) INTO voice_notes_total
    FROM upf_comments 
    WHERE project_id = project_uuid 
    AND voice_note_url IS NOT NULL
    AND DATE(created_at) = target_date;
    
    SELECT COUNT(*) INTO ai_suggestions_total
    FROM upf_comments 
    WHERE project_id = project_uuid 
    AND ai_analysis IS NOT NULL
    AND DATE(created_at) = target_date;
    
    -- Calculate average resolution time
    SELECT AVG(updated_at - created_at) INTO avg_resolution
    FROM upf_comments 
    WHERE project_id = project_uuid 
    AND status = 'resolved'
    AND DATE(updated_at) = target_date;
    
    -- Get top categories from AI analysis
    SELECT ARRAY_AGG(DISTINCT ai_analysis->>'category') INTO top_cats
    FROM upf_comments 
    WHERE project_id = project_uuid 
    AND ai_analysis IS NOT NULL
    AND DATE(created_at) = target_date
    LIMIT 5;
    
    -- Insert or update analytics record
    INSERT INTO upf_analytics (
        project_id, 
        date, 
        comments_count, 
        resolved_count, 
        voice_notes_count, 
        ai_suggestions_count,
        average_resolution_time,
        top_categories
    ) VALUES (
        project_uuid, 
        target_date, 
        comments_total, 
        resolved_total, 
        voice_notes_total, 
        ai_suggestions_total,
        avg_resolution,
        COALESCE(top_cats, '{}')
    )
    ON CONFLICT (project_id, date) 
    DO UPDATE SET
        comments_count = EXCLUDED.comments_count,
        resolved_count = EXCLUDED.resolved_count,
        voice_notes_count = EXCLUDED.voice_notes_count,
        ai_suggestions_count = EXCLUDED.ai_suggestions_count,
        average_resolution_time = EXCLUDED.average_resolution_time,
        top_categories = EXCLUDED.top_categories;
END;
$$ LANGUAGE plpgsql;

-- Create function to get comment statistics
CREATE OR REPLACE FUNCTION get_upf_comment_stats(project_uuid UUID)
RETURNS TABLE (
    total_comments BIGINT,
    open_comments BIGINT,
    resolved_comments BIGINT,
    high_priority_comments BIGINT,
    comments_with_voice BIGINT,
    comments_with_ai BIGINT,
    average_resolution_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_comments,
        COUNT(*) FILTER (WHERE status = 'open') as open_comments,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_comments,
        COUNT(*) FILTER (WHERE priority IN ('high', 'urgent')) as high_priority_comments,
        COUNT(*) FILTER (WHERE voice_note_url IS NOT NULL) as comments_with_voice,
        COUNT(*) FILTER (WHERE ai_analysis IS NOT NULL) as comments_with_ai,
        ROUND(
            EXTRACT(EPOCH FROM AVG(
                CASE WHEN status = 'resolved' 
                THEN updated_at - created_at 
                ELSE NULL END
            )) / 3600, 2
        ) as average_resolution_hours
    FROM upf_comments 
    WHERE project_id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function to get trending comment themes
CREATE OR REPLACE FUNCTION get_upf_trending_themes(project_uuid UUID, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    category TEXT,
    count BIGINT,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH theme_counts AS (
        SELECT 
            ai_analysis->>'category' as theme,
            COUNT(*) as theme_count
        FROM upf_comments 
        WHERE project_id = project_uuid 
        AND ai_analysis IS NOT NULL
        AND created_at >= NOW() - INTERVAL '%s days' % days_back
        GROUP BY ai_analysis->>'category'
    ),
    total_count AS (
        SELECT SUM(theme_count) as total FROM theme_counts
    )
    SELECT 
        tc.theme::TEXT as category,
        tc.theme_count as count,
        ROUND((tc.theme_count * 100.0 / NULLIF(t.total, 0)), 2) as percentage
    FROM theme_counts tc
    CROSS JOIN total_count t
    ORDER BY tc.theme_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update analytics
CREATE OR REPLACE FUNCTION trigger_upf_analytics_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics for the project when comments are modified
    PERFORM calculate_upf_analytics(
        COALESCE(NEW.project_id, OLD.project_id),
        CURRENT_DATE
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER upf_analytics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON upf_comments
    FOR EACH ROW EXECUTE FUNCTION trigger_upf_analytics_update();

-- Insert initial sample data for testing (optional)
-- This can be removed in production
INSERT INTO project_files (id, project_id, name, file_type, file_url, uploaded_by) VALUES
('f1111111-1111-1111-1111-111111111111', 'proj-123', 'Brand Animation.mp4', 'video', '/videos/brand-animation.mp4', auth.uid()),
('f2222222-2222-2222-2222-222222222222', 'proj-123', 'Homepage Mockup.jpg', 'image', '/images/homepage-mockup.jpg', auth.uid()),
('f3333333-3333-3333-3333-333333333333', 'proj-123', 'Brand Guidelines.pdf', 'pdf', '/documents/brand-guidelines.pdf', auth.uid())
ON CONFLICT DO NOTHING;

-- Create indexes for performance optimization on commonly queried fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_upf_comments_composite 
ON upf_comments(project_id, status, priority, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_upf_comments_mentions_gin 
ON upf_comments USING GIN(mentions) 
WHERE array_length(mentions, 1) > 0;

-- Add comments to tables for documentation
COMMENT ON TABLE upf_comments IS 'Universal Pinpoint Feedback comments with support for all media types';
COMMENT ON TABLE upf_reactions IS 'Emoji reactions to comments';
COMMENT ON TABLE upf_attachments IS 'File attachments for comments';
COMMENT ON TABLE upf_voice_notes IS 'Voice note recordings';
COMMENT ON TABLE upf_analytics IS 'Analytics and metrics for UPF system';

COMMENT ON COLUMN upf_comments.position_data IS 'Flexible JSONB field storing position data: {x,y} for images, {timestamp} for videos, {line,startChar,endChar} for code';
COMMENT ON COLUMN upf_comments.ai_analysis IS 'AI-generated analysis including category, severity, suggestions, and tags';
COMMENT ON COLUMN upf_comments.mentions IS 'Array of user IDs mentioned in the comment using @username syntax'; 