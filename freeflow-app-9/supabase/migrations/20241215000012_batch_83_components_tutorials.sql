-- Batch 83: Component Library & Tutorials Tables
-- Migration: 20241215000012_batch_83_components_tutorials.sql

-- Component Library table
CREATE TABLE IF NOT EXISTS ui_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'layout' CHECK (category IN ('layout', 'navigation', 'forms', 'data-display', 'feedback', 'media', 'buttons', 'overlays')),
  framework VARCHAR(50) DEFAULT 'react' CHECK (framework IN ('react', 'vue', 'angular', 'svelte', 'vanilla')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'deprecated', 'beta', 'archived')),
  version VARCHAR(50) DEFAULT 'v1.0',
  author VARCHAR(255),
  downloads_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  file_size VARCHAR(50),
  dependencies_count INTEGER DEFAULT 0,
  props_count INTEGER DEFAULT 0,
  examples_count INTEGER DEFAULT 0,
  accessibility_level VARCHAR(50),
  is_responsive BOOLEAN DEFAULT true,
  code_snippet TEXT,
  preview_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled', 'archived')),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  format VARCHAR(20) DEFAULT 'video' CHECK (format IN ('video', 'text', 'interactive', 'mixed')),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  author VARCHAR(255),
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  enrollments_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  video_url TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE ui_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ui_components
CREATE POLICY "Users can view own components" ON ui_components FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own components" ON ui_components FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own components" ON ui_components FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own components" ON ui_components FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tutorials
CREATE POLICY "Users can view own tutorials" ON tutorials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tutorials" ON tutorials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tutorials" ON tutorials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tutorials" ON tutorials FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ui_components_user_id ON ui_components(user_id);
CREATE INDEX IF NOT EXISTS idx_ui_components_status ON ui_components(status);
CREATE INDEX IF NOT EXISTS idx_ui_components_category ON ui_components(category);
CREATE INDEX IF NOT EXISTS idx_ui_components_framework ON ui_components(framework);

CREATE INDEX IF NOT EXISTS idx_tutorials_user_id ON tutorials(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorials_status ON tutorials(status);
CREATE INDEX IF NOT EXISTS idx_tutorials_level ON tutorials(level);
CREATE INDEX IF NOT EXISTS idx_tutorials_format ON tutorials(format);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ui_components;
ALTER PUBLICATION supabase_realtime ADD TABLE tutorials;
