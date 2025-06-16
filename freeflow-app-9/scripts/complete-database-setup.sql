-- ============================================================================
-- FreeflowZee Complete Database Setup Script
-- ============================================================================
-- This script creates all necessary tables for FreeflowZee application
-- Run this in your Supabase SQL Editor to set up the complete database
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MAIN FREEFLOWZEE SCHEMA
-- ============================================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  client_name VARCHAR(200),
  client_email VARCHAR(200),
  budget DECIMAL(10,2) DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(200),
  avatar_url TEXT,
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(100),
  skills TEXT[], -- Array of skills
  hourly_rate DECIMAL(10,2),
  timezone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback/Comments table for media files
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  media_url TEXT,
  position_x DECIMAL(10,4), -- For image/video position markers
  position_y DECIMAL(10,4), -- For image/video position markers
  timestamp_seconds DECIMAL(10,4), -- For video/audio timestamps
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project attachments/files table
CREATE TABLE IF NOT EXISTS project_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members/collaborators table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'client')),
  permissions TEXT[], -- Array of permissions
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_email VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time tracking table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  hours DECIMAL(5,2) NOT NULL,
  hourly_rate DECIMAL(10,2),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- UNIVERSAL PINPOINT FEEDBACK (UPF) SYSTEM
-- ============================================================================

-- Create enum types for UPF system
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

-- Create main UPF comments table
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

-- Create UPF reactions table
CREATE TABLE IF NOT EXISTS upf_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create UPF attachments table
CREATE TABLE IF NOT EXISTS upf_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create UPF voice notes table
CREATE TABLE IF NOT EXISTS upf_voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration INTEGER,
  waveform_data JSONB,
  transcription TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create UPF analytics table
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

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for project attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-attachments', 'project-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for UPF voice notes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-notes', 'voice-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for general uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Main schema indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_project_id ON feedback_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_user_id ON feedback_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_project_id ON project_attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- UPF system indexes
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- UPF policies (permissive for collaboration)
DROP POLICY IF EXISTS "Users can view comments in their projects" ON upf_comments;
CREATE POLICY "Users can view comments in their projects" ON upf_comments
  FOR SELECT USING (true); -- Allow all reads for collaboration

DROP POLICY IF EXISTS "Users can create comments" ON upf_comments;
CREATE POLICY "Users can create comments" ON upf_comments
  FOR INSERT WITH CHECK (true); -- Allow all inserts for collaboration

DROP POLICY IF EXISTS "Users can update their own comments" ON upf_comments;
CREATE POLICY "Users can update their own comments" ON upf_comments
  FOR UPDATE USING (true); -- Allow all updates for collaboration

DROP POLICY IF EXISTS "Users can delete their own comments" ON upf_comments;
CREATE POLICY "Users can delete their own comments" ON upf_comments
  FOR DELETE USING (true); -- Allow all deletes for collaboration

-- UPF reactions policies
DROP POLICY IF EXISTS "Users can manage reactions" ON upf_reactions;
CREATE POLICY "Users can manage reactions" ON upf_reactions
  FOR ALL USING (true);

-- UPF attachments policies
DROP POLICY IF EXISTS "Users can manage attachments" ON upf_attachments;
CREATE POLICY "Users can manage attachments" ON upf_attachments
  FOR ALL USING (true);

-- UPF voice notes policies
DROP POLICY IF EXISTS "Users can manage voice notes" ON upf_voice_notes;
CREATE POLICY "Users can manage voice notes" ON upf_voice_notes
  FOR ALL USING (true);

-- UPF analytics policies
DROP POLICY IF EXISTS "Users can view analytics" ON upf_analytics;
CREATE POLICY "Users can view analytics" ON upf_analytics
  FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update UPF analytics
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers for main tables
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_comments_updated_at ON feedback_comments;
CREATE TRIGGER update_feedback_comments_updated_at 
  BEFORE UPDATE ON feedback_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- UPF analytics trigger
DROP TRIGGER IF EXISTS upf_comments_analytics_trigger ON upf_comments;
CREATE TRIGGER upf_comments_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_upf_analytics();

-- UPF updated_at trigger
DROP TRIGGER IF EXISTS upf_comments_updated_at_trigger ON upf_comments;
CREATE TRIGGER upf_comments_updated_at_trigger
  BEFORE UPDATE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 FreeflowZee Database Setup Complete!';
  RAISE NOTICE '✅ All tables, indexes, and policies created successfully';
  RAISE NOTICE '🔐 Row Level Security enabled on all tables';
  RAISE NOTICE '📊 Analytics and triggers configured';
  RAISE NOTICE '🚀 Your database is ready for production!';
END
$$; 