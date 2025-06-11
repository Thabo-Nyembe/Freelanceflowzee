-- Universal Pinpoint Feedback System Tables
-- Run this SQL in Supabase SQL Editor

-- Create enum types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_type') THEN
    CREATE TYPE comment_type AS ENUM ('image', 'video', 'code', 'audio', 'doc', 'text');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_status') THEN
    CREATE TYPE comment_status AS ENUM ('open', 'resolved', 'in_progress');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_priority') THEN
    CREATE TYPE comment_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
    CREATE TYPE reaction_type AS ENUM ('like', 'love', 'laugh', 'angry', 'sad', 'thumbs_up', 'thumbs_down');
  END IF;
END $$;

-- Create main comments table
CREATE TABLE IF NOT EXISTS upf_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  comment_type comment_type NOT NULL DEFAULT 'text',
  position_data JSONB DEFAULT '{}',
  priority comment_priority NOT NULL DEFAULT 'medium',
  status comment_status NOT NULL DEFAULT 'open',
  mentions TEXT[] DEFAULT '{}',
  voice_note_url TEXT,
  voice_note_duration INTEGER,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS upf_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS upf_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create voice notes table
CREATE TABLE IF NOT EXISTS upf_voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration INTEGER,
  waveform_data JSONB,
  transcription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS upf_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_comments INTEGER DEFAULT 0,
  open_comments INTEGER DEFAULT 0,
  resolved_comments INTEGER DEFAULT 0,
  high_priority_comments INTEGER DEFAULT 0,
  avg_response_time INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_upf_comments_file_id ON upf_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_project_id ON upf_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_user_id ON upf_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_status ON upf_comments(status);
CREATE INDEX IF NOT EXISTS idx_upf_comments_priority ON upf_comments(priority);
CREATE INDEX IF NOT EXISTS idx_upf_comments_created_at ON upf_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_upf_reactions_comment_id ON upf_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_upf_attachments_comment_id ON upf_attachments(comment_id);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_upf_comments_position_data ON upf_comments USING GIN(position_data);
CREATE INDEX IF NOT EXISTS idx_upf_comments_ai_analysis ON upf_comments USING GIN(ai_analysis);

-- Enable Row Level Security (RLS)
ALTER TABLE upf_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be enhanced later)
DROP POLICY IF EXISTS "Users can view comments in their projects" ON upf_comments;
CREATE POLICY "Users can view comments in their projects" ON upf_comments
  FOR SELECT USING (true); -- For now, allow all reads

DROP POLICY IF EXISTS "Users can create comments" ON upf_comments;
CREATE POLICY "Users can create comments" ON upf_comments
  FOR INSERT WITH CHECK (true); -- For now, allow all inserts

DROP POLICY IF EXISTS "Users can update their own comments" ON upf_comments;
CREATE POLICY "Users can update their own comments" ON upf_comments
  FOR UPDATE USING (true); -- For now, allow all updates

DROP POLICY IF EXISTS "Users can delete their own comments" ON upf_comments;
CREATE POLICY "Users can delete their own comments" ON upf_comments
  FOR DELETE USING (true); -- For now, allow all deletes

-- Similar policies for other tables
DROP POLICY IF EXISTS "Users can manage reactions" ON upf_reactions;
CREATE POLICY "Users can manage reactions" ON upf_reactions
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage attachments" ON upf_attachments;
CREATE POLICY "Users can manage attachments" ON upf_attachments
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage voice notes" ON upf_voice_notes;
CREATE POLICY "Users can manage voice notes" ON upf_voice_notes
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view analytics" ON upf_analytics;
CREATE POLICY "Users can view analytics" ON upf_analytics
  FOR SELECT USING (true);

-- Create function to update analytics
CREATE OR REPLACE FUNCTION update_upf_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO upf_analytics (project_id, date, total_comments, open_comments, resolved_comments, high_priority_comments)
  VALUES (
    COALESCE(NEW.project_id, OLD.project_id),
    CURRENT_DATE,
    (SELECT COUNT(*) FROM upf_comments WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)),
    (SELECT COUNT(*) FROM upf_comments WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'open'),
    (SELECT COUNT(*) FROM upf_comments WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'resolved'),
    (SELECT COUNT(*) FROM upf_comments WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND priority = 'high')
  )
  ON CONFLICT (project_id, date) 
  DO UPDATE SET
    total_comments = EXCLUDED.total_comments,
    open_comments = EXCLUDED.open_comments,
    resolved_comments = EXCLUDED.resolved_comments,
    high_priority_comments = EXCLUDED.high_priority_comments,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS upf_comments_analytics_trigger ON upf_comments;
CREATE TRIGGER upf_comments_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_upf_analytics();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS upf_comments_updated_at_trigger ON upf_comments;
CREATE TRIGGER upf_comments_updated_at_trigger
  BEFORE UPDATE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO upf_comments (file_id, project_id, user_id, content, comment_type, priority, status)
VALUES 
  ('brand-animation.mp4', 'project-1', gen_random_uuid(), 'The animation timing feels a bit fast in the logo reveal section.', 'video', 'medium', 'open'),
  ('homepage-mockup.jpg', 'project-1', gen_random_uuid(), 'Love the color scheme! Could we try a darker shade for the CTA button?', 'image', 'low', 'open'),
  ('brand-guidelines.pdf', 'project-1', gen_random_uuid(), 'Page 3 has a typo in the brand story section.', 'doc', 'high', 'open')
ON CONFLICT DO NOTHING;

-- Test the setup
SELECT 'UPF tables created successfully!' as message;
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_name LIKE 'upf_%' 
  AND t.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name; 