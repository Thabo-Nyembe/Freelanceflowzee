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

-- File Storage Metadata Table
CREATE TABLE IF NOT EXISTS file_storage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  provider VARCHAR(20) DEFAULT 'supabase' CHECK (provider IN ('supabase', 'wasabi')),
  bucket VARCHAR(100) NOT NULL,
  key VARCHAR(500) NOT NULL,
  url TEXT,
  signed_url TEXT,
  access_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  folder VARCHAR(255),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage Analytics Table
CREATE TABLE IF NOT EXISTS storage_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  total_files INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  supabase_files INTEGER DEFAULT 0,
  supabase_size BIGINT DEFAULT 0,
  wasabi_files INTEGER DEFAULT 0,
  wasabi_size BIGINT DEFAULT 0,
  uploads_today INTEGER DEFAULT 0,
  downloads_today INTEGER DEFAULT 0,
  cost_supabase DECIMAL(10,4) DEFAULT 0,
  cost_wasabi DECIMAL(10,4) DEFAULT 0,
  cost_savings DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
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
  storage_id UUID REFERENCES file_storage(id) ON DELETE SET NULL,
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
  date DATE DEFAULT CURRENT_DATE,
  total_comments INTEGER DEFAULT 0,
  comments_by_type JSONB DEFAULT '{}',
  comments_by_priority JSONB DEFAULT '{}',
  comments_by_status JSONB DEFAULT '{}',
  avg_resolution_time INTERVAL,
  most_active_users JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Main tables indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_project_id ON feedback_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_user_id ON feedback_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_project_id ON project_attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

-- File storage indexes
CREATE INDEX IF NOT EXISTS idx_file_storage_project_id ON file_storage(project_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_uploaded_by ON file_storage(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_storage_provider ON file_storage(provider);
CREATE INDEX IF NOT EXISTS idx_file_storage_created_at ON file_storage(created_at);
CREATE INDEX IF NOT EXISTS idx_file_storage_tags ON file_storage USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_file_storage_metadata ON file_storage USING GIN(metadata);

-- Storage analytics indexes
CREATE INDEX IF NOT EXISTS idx_storage_analytics_date ON storage_analytics(date);
CREATE INDEX IF NOT EXISTS idx_storage_analytics_created_at ON storage_analytics(created_at);

-- UPF indexes
CREATE INDEX IF NOT EXISTS idx_upf_comments_file_id ON upf_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_project_id ON upf_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_user_id ON upf_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_status ON upf_comments(status);
CREATE INDEX IF NOT EXISTS idx_upf_comments_priority ON upf_comments(priority);
CREATE INDEX IF NOT EXISTS idx_upf_comments_created_at ON upf_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_upf_reactions_comment_id ON upf_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_upf_attachments_comment_id ON upf_attachments(comment_id);

-- JSONB GIN indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_upf_comments_position_data ON upf_comments USING GIN(position_data);
CREATE INDEX IF NOT EXISTS idx_upf_comments_ai_analysis ON upf_comments USING GIN(ai_analysis);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_analytics ENABLE ROW LEVEL SECURITY;
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

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- File storage policies
CREATE POLICY "Users can view own files" ON file_storage FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can upload files" ON file_storage FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update own files" ON file_storage FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete own files" ON file_storage FOR DELETE USING (auth.uid() = uploaded_by);

-- Storage analytics policies (service role only)
CREATE POLICY "Service role can manage storage analytics" ON storage_analytics FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- UPF policies
CREATE POLICY "Users can view UPF comments" ON upf_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert UPF comments" ON upf_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own UPF comments" ON upf_comments FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update UPF analytics
CREATE OR REPLACE FUNCTION update_upf_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO upf_analytics (date, total_comments)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) 
  DO UPDATE SET 
    total_comments = upf_analytics.total_comments + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update storage analytics
CREATE OR REPLACE FUNCTION update_storage_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily storage analytics
  INSERT INTO storage_analytics (
    date, 
    total_files, 
    total_size,
    supabase_files,
    supabase_size,
    wasabi_files,
    wasabi_size
  ) 
  SELECT 
    CURRENT_DATE,
    COUNT(*),
    SUM(file_size),
    SUM(CASE WHEN provider = 'supabase' THEN 1 ELSE 0 END),
    SUM(CASE WHEN provider = 'supabase' THEN file_size ELSE 0 END),
    SUM(CASE WHEN provider = 'wasabi' THEN 1 ELSE 0 END),
    SUM(CASE WHEN provider = 'wasabi' THEN file_size ELSE 0 END)
  FROM file_storage
  ON CONFLICT (date) 
  DO UPDATE SET 
    total_files = EXCLUDED.total_files,
    total_size = EXCLUDED.total_size,
    supabase_files = EXCLUDED.supabase_files,
    supabase_size = EXCLUDED.supabase_size,
    wasabi_files = EXCLUDED.wasabi_files,
    wasabi_size = EXCLUDED.wasabi_size,
    updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_comments_updated_at 
  BEFORE UPDATE ON feedback_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_storage_updated_at 
  BEFORE UPDATE ON file_storage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER upf_comments_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_upf_analytics();

CREATE TRIGGER upf_comments_updated_at_trigger
  BEFORE UPDATE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER storage_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON file_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_analytics();

-- ============================================================================
-- STORAGE BUCKETS SETUP
-- ============================================================================

-- Create storage buckets (Run these separately in Supabase if needed)
-- insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false);
-- insert into storage.buckets (id, name, public) values ('project-attachments', 'project-attachments', false);
-- insert into storage.buckets (id, name, public) values ('voice-notes', 'voice-notes', false);

-- ============================================================================
-- SAMPLE DATA (Optional - Remove in production)
-- ============================================================================

-- This completes the database setup for FreeflowZee
-- Make sure to run this script in your Supabase SQL Editor
-- and create the storage buckets manually if they don't exist 