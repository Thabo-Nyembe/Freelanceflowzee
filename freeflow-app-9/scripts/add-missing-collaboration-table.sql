-- ============================================================================
-- Add Missing Real-Time Collaboration Table
-- ============================================================================

-- Create realtime_cursors table for live collaboration
CREATE TABLE IF NOT EXISTS realtime_cursors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    
    -- Cursor position and metadata
    position_x FLOAT,
    position_y FLOAT,
    viewport TEXT,
    page_path TEXT,
    
    -- User display info
    user_name TEXT,
    user_avatar TEXT,
    cursor_color TEXT DEFAULT '#3B82F6',
    
    -- Activity tracking
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_user_session UNIQUE (user_id, session_id, project_id)
);

-- Create indexes for real-time collaboration performance
CREATE INDEX IF NOT EXISTS idx_realtime_cursors_project_active 
ON realtime_cursors(project_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_realtime_cursors_session 
ON realtime_cursors(session_id, last_activity);

CREATE INDEX IF NOT EXISTS idx_realtime_cursors_user_project 
ON realtime_cursors(user_id, project_id);

-- Enable RLS
ALTER TABLE realtime_cursors ENABLE ROW LEVEL SECURITY;

-- RLS policies for real-time collaboration
CREATE POLICY "Users can see cursors in projects they have access to" ON realtime_cursors
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE user_id = auth.uid() OR id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own cursors" ON realtime_cursors
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cursors" ON realtime_cursors
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own cursors" ON realtime_cursors
    FOR DELETE USING (user_id = auth.uid());

-- Function to automatically clean up inactive cursors
CREATE OR REPLACE FUNCTION cleanup_inactive_cursors()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark cursors as inactive if not updated in 30 seconds
    UPDATE realtime_cursors 
    SET is_active = false 
    WHERE last_activity < NOW() - INTERVAL '30 seconds' 
    AND is_active = true;
    
    -- Delete old inactive cursors (older than 1 hour)
    DELETE FROM realtime_cursors 
    WHERE is_active = false 
    AND last_activity < NOW() - INTERVAL '1 hour';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity on cursor updates
CREATE OR REPLACE FUNCTION update_cursor_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_cursor_activity_trigger'
    ) THEN
        CREATE TRIGGER update_cursor_activity_trigger
            BEFORE UPDATE ON realtime_cursors
            FOR EACH ROW
            EXECUTE FUNCTION update_cursor_activity();
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON realtime_cursors TO authenticated;
GRANT ALL ON realtime_cursors TO service_role;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_cursors;

SELECT 'Real-time collaboration table created successfully!' as status; 