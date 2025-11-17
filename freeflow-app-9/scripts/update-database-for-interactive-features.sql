-- ===================================================================
-- DATABASE UPDATE FOR INTERACTIVE UI/UX FEATURES
-- Run this script to update all tables for today's enhancements
-- Date: January 12, 2025
-- ===================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===================================================================
-- 1. ENHANCED USER INTERACTION TRACKING
-- ===================================================================

-- User interaction tracking table for Enhanced Interactive System
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  interaction_type VARCHAR(50) NOT NULL, -- button_click, navigation, upload, etc
  target_element VARCHAR(255), -- element ID or path
  page_path VARCHAR(500),
  metadata JSONB DEFAULT '{}', -- trackingData from interactions
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON user_interactions(session_id);

-- ===================================================================
-- 2. ENHANCED FILE MANAGEMENT WITH DRAG-AND-DROP SUPPORT
-- ===================================================================

-- Update files table with new interactive features
ALTER TABLE files ADD COLUMN IF NOT EXISTS upload_progress INTEGER DEFAULT 100;
ALTER TABLE files ADD COLUMN IF NOT EXISTS upload_status VARCHAR(20) DEFAULT 'completed';
ALTER TABLE files ADD COLUMN IF NOT EXISTS drag_drop_session_id VARCHAR(255);
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_hash VARCHAR(64); -- for duplicate detection
ALTER TABLE files ADD COLUMN IF NOT EXISTS preview_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';
ALTER TABLE files ADD COLUMN IF NOT EXISTS collaboration_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE;

-- File upload sessions for tracking drag-and-drop operations
CREATE TABLE IF NOT EXISTS file_upload_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  total_files INTEGER DEFAULT 0,
  completed_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  uploaded_size BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, failed, cancelled
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time file collaboration tracking
CREATE TABLE IF NOT EXISTS file_collaboration_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  cursor_position JSONB DEFAULT '{}', -- x, y coordinates
  user_color VARCHAR(7) DEFAULT '#3B82F6', -- hex color for user
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- ===================================================================
-- 3. REAL-TIME CHAT AND MESSAGING ENHANCEMENTS
-- ===================================================================

-- Enhanced chat messages with file attachments and reactions
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- text, file, image, system
  attachments JSONB DEFAULT '[]', -- array of file references
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  read_by JSONB DEFAULT '{}', -- user_id -> timestamp mapping
  reactions JSONB DEFAULT '{}', -- emoji -> user_ids mapping
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat rooms/conversations
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(20) DEFAULT 'direct', -- direct, group, project, support
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  avatar_url TEXT,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat room participants
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- admin, member, viewer
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(chat_id, user_id)
);

-- ===================================================================
-- 4. VIDEO RECORDING AND AI PROCESSING
-- ===================================================================

-- Video recordings with AI transcription and analysis
CREATE TABLE IF NOT EXISTS video_recordings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size BIGINT,
  recording_quality VARCHAR(10) DEFAULT '1080p',
  recording_settings JSONB DEFAULT '{}',
  ai_transcription TEXT,
  ai_analysis JSONB DEFAULT '{}', -- sentiment, keywords, chapters, etc
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  collaboration_data JSONB DEFAULT '{}', -- annotations, comments, etc
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video annotations and comments with timestamps
CREATE TABLE IF NOT EXISTS video_annotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES video_recordings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL, -- timestamp in milliseconds
  x_position DECIMAL(5,2), -- x coordinate (0-100%)
  y_position DECIMAL(5,2), -- y coordinate (0-100%)
  annotation_type VARCHAR(20) DEFAULT 'comment', -- comment, hotspot, highlight
  content TEXT NOT NULL,
  thread_id UUID, -- for threaded conversations
  resolved BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 5. ENHANCED DASHBOARD AND ANALYTICS
-- ===================================================================

-- Dashboard customization and layouts
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_name VARCHAR(100) DEFAULT 'default',
  layout_config JSONB NOT NULL, -- widget positions, sizes, etc
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, layout_name)
);

-- User activity analytics
CREATE TABLE IF NOT EXISTS user_activity_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  peak_activity_hour INTEGER, -- 0-23
  device_type VARCHAR(20), -- desktop, tablet, mobile
  analytics_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ===================================================================
-- 6. ENHANCED PROJECT COLLABORATION
-- ===================================================================

-- Update projects table with new collaboration features
ALTER TABLE projects ADD COLUMN IF NOT EXISTS collaboration_settings JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS activity_timeline JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS automation_rules JSONB DEFAULT '{}';

-- Project activity feed
CREATE TABLE IF NOT EXISTS project_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL, -- created, updated, commented, file_uploaded, etc
  entity_type VARCHAR(50), -- project, file, comment, milestone
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project collaborators with enhanced permissions
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'viewer', -- owner, admin, editor, viewer, commenter
  permissions JSONB DEFAULT '{}', -- granular permissions
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(project_id, user_id)
);

-- ===================================================================
-- 7. NOTIFICATION SYSTEM FOR INTERACTIVE FEATURES
-- ===================================================================

-- Enhanced notifications with rich content and actions
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- comment, mention, file_upload, collaboration_invite, etc
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label VARCHAR(100),
  entity_type VARCHAR(50), -- project, file, comment, etc
  entity_id UUID,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 8. ENHANCED USER PREFERENCES AND SETTINGS
-- ===================================================================

-- Update user_profiles with new interactive preferences
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS animation_preferences JSONB DEFAULT '{"enabled": true, "reduced_motion": false}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS collaboration_preferences JSONB DEFAULT '{}';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dashboard_layout VARCHAR(100) DEFAULT 'default';

-- ===================================================================
-- 9. PERFORMANCE INDEXES FOR INTERACTIVE FEATURES
-- ===================================================================

-- Chat and messaging indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_project_id ON chat_rooms(project_id);

-- Video and collaboration indexes
CREATE INDEX IF NOT EXISTS idx_video_recordings_user_id ON video_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_video_recordings_project_id ON video_recordings(project_id);
CREATE INDEX IF NOT EXISTS idx_video_annotations_video_id ON video_annotations(video_id);
CREATE INDEX IF NOT EXISTS idx_video_annotations_timestamp ON video_annotations(timestamp_ms);

-- File collaboration indexes
CREATE INDEX IF NOT EXISTS idx_file_collaboration_file_id ON file_collaboration_sessions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_collaboration_active ON file_collaboration_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_file_upload_sessions_user_id ON file_upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_upload_sessions_status ON file_upload_sessions(status);

-- Project activity indexes
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_analytics_user_date ON user_activity_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);

-- ===================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS on all new tables
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for user data access
CREATE POLICY "Users can access their own interactions" ON user_interactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own upload sessions" ON file_upload_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own collaboration sessions" ON file_collaboration_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own videos" ON video_recordings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own dashboard layouts" ON dashboard_layouts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own analytics" ON user_activity_analytics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Chat access policies (participants can access)
CREATE POLICY "Chat participants can access messages" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_id = chat_messages.chat_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Chat participants can access rooms" ON chat_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_id = chat_rooms.id 
      AND user_id = auth.uid()
    )
  );

-- Project collaboration policies
CREATE POLICY "Project collaborators can access activities" ON project_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_collaborators 
      WHERE project_id = project_activities.project_id 
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- ===================================================================
-- 11. TRIGGERS FOR REAL-TIME UPDATES
-- ===================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at 
  BEFORE UPDATE ON files 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_file_upload_sessions_updated_at ON file_upload_sessions;
CREATE TRIGGER update_file_upload_sessions_updated_at 
  BEFORE UPDATE ON file_upload_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at 
  BEFORE UPDATE ON chat_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at 
  BEFORE UPDATE ON chat_rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_recordings_updated_at ON video_recordings;
CREATE TRIGGER update_video_recordings_updated_at 
  BEFORE UPDATE ON video_recordings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 12. INITIAL DATA AND CONFIGURATIONS
-- ===================================================================

-- Insert default dashboard layout configurations
INSERT INTO dashboard_layouts (user_id, layout_name, layout_config, is_default)
SELECT 
  auth.users.id,
  'default',
  '{
    "widgets": [
      {"id": "overview", "x": 0, "y": 0, "w": 12, "h": 4},
      {"id": "recent_projects", "x": 0, "y": 4, "w": 6, "h": 6},
      {"id": "activity_feed", "x": 6, "y": 4, "w": 6, "h": 6},
      {"id": "quick_actions", "x": 0, "y": 10, "w": 12, "h": 3}
    ],
    "theme": "system",
    "animation_level": "normal"
  }'::jsonb,
  true
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_layouts 
  WHERE user_id = auth.users.id 
  AND layout_name = 'default'
)
ON CONFLICT (user_id, layout_name) DO NOTHING;

-- ===================================================================
-- 13. CLEANUP AND MAINTENANCE
-- ===================================================================

-- Function to clean up old interaction data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_interactions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_interactions 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    DELETE FROM file_collaboration_sessions 
    WHERE last_activity < NOW() - INTERVAL '7 days' 
    AND is_active = false;
    
    DELETE FROM user_activity_analytics 
    WHERE date < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database update for interactive UI/UX features completed successfully!';
    RAISE NOTICE '📊 Tables updated: %, New tables created: %', 
        'files, projects, user_profiles', 
        'user_interactions, file_upload_sessions, file_collaboration_sessions, chat_messages, chat_rooms, chat_participants, video_recordings, video_annotations, dashboard_layouts, user_activity_analytics, project_activities, project_collaborators, notifications';
    RAISE NOTICE '🚀 All tables are now ready for the enhanced interactive features!';
END $$;
