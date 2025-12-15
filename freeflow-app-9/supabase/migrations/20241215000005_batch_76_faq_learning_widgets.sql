-- Batch 76: FAQ, Learning, Widget Library V2 Integration
-- Tables for FAQ, Courses, and Widgets with RLS

-- ============================================
-- FAQ Table
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'review', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  searches_count INTEGER DEFAULT 0,
  related_faqs UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author VARCHAR(255),
  average_read_time DECIMAL(4,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own FAQs" ON faqs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create FAQs" ON faqs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FAQs" ON faqs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own FAQs" ON faqs
  FOR DELETE USING (auth.uid() = user_id);

-- FAQ Indexes
CREATE INDEX IF NOT EXISTS idx_faqs_user_id ON faqs(user_id);
CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_priority ON faqs(priority);

-- ============================================
-- Courses Table (Learning)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  format VARCHAR(20) DEFAULT 'video' CHECK (format IN ('video', 'text', 'interactive', 'live', 'mixed')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category VARCHAR(100),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  certificate_available BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url VARCHAR(500),
  preview_url VARCHAR(500),
  syllabus JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

-- Courses Indexes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- ============================================
-- Widgets Table
-- ============================================
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'utilities',
  widget_type VARCHAR(30) DEFAULT 'display' CHECK (widget_type IN ('chart', 'form', 'display', 'interactive', 'data-input', 'visualization', 'embed')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'maintenance', 'coming-soon')),
  version VARCHAR(20) DEFAULT '1.0.0',
  author VARCHAR(255),
  installs_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  size VARCHAR(20),
  dependencies_count INTEGER DEFAULT 0,
  documentation_url VARCHAR(500),
  demo_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widgets RLS
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widgets" ON widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create widgets" ON widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widgets" ON widgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widgets" ON widgets
  FOR DELETE USING (auth.uid() = user_id);

-- Widgets Indexes
CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_status ON widgets(status);
CREATE INDEX IF NOT EXISTS idx_widgets_category ON widgets(category);
CREATE INDEX IF NOT EXISTS idx_widgets_widget_type ON widgets(widget_type);
