-- Batch 82: Support Tickets, Documentation, Theme Store tables
-- Migration: 20241215000011_batch_82_tickets_docs_themes.sql

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'waiting', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category VARCHAR(30) DEFAULT 'general' CHECK (category IN ('technical', 'billing', 'feature-request', 'bug', 'general', 'account')),
  customer_name VARCHAR(100),
  customer_email VARCHAR(255),
  assigned_to VARCHAR(100),
  response_time INTEGER DEFAULT 0,
  resolution_time INTEGER DEFAULT 0,
  satisfaction_score INTEGER,
  replies_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentation table
CREATE TABLE IF NOT EXISTS documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'archived')),
  doc_type VARCHAR(30) DEFAULT 'guide' CHECK (doc_type IN ('guide', 'api-reference', 'tutorial', 'concept', 'quickstart', 'troubleshooting')),
  category VARCHAR(30) DEFAULT 'getting-started' CHECK (category IN ('getting-started', 'features', 'integrations', 'api', 'sdk', 'advanced')),
  author VARCHAR(100),
  version VARCHAR(20) DEFAULT 'v1.0',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  contributors_count INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  designer VARCHAR(100),
  category VARCHAR(20) DEFAULT 'modern' CHECK (category IN ('minimal', 'professional', 'creative', 'dark', 'light', 'colorful', 'modern', 'classic')),
  pricing VARCHAR(20) DEFAULT 'free' CHECK (pricing IN ('free', 'premium', 'bundle', 'enterprise')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('active', 'available', 'installed', 'preview', 'deprecated')),
  price VARCHAR(20) DEFAULT 'Free',
  downloads_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  version VARCHAR(20) DEFAULT '1.0.0',
  file_size VARCHAR(20) DEFAULT '1.0 MB',
  colors_count INTEGER DEFAULT 8,
  layouts_count INTEGER DEFAULT 4,
  components_count INTEGER DEFAULT 16,
  dark_mode BOOLEAN DEFAULT false,
  responsive BOOLEAN DEFAULT true,
  customizable BOOLEAN DEFAULT true,
  preview_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view own support tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own support tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own support tickets" ON support_tickets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for documentation
CREATE POLICY "Users can view own documentation" ON documentation FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own documentation" ON documentation FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documentation" ON documentation FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documentation" ON documentation FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for themes
CREATE POLICY "Users can view own themes" ON themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own themes" ON themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own themes" ON themes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own themes" ON themes FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_documentation_user_id ON documentation(user_id);
CREATE INDEX IF NOT EXISTS idx_documentation_status ON documentation(status);
CREATE INDEX IF NOT EXISTS idx_themes_user_id ON themes(user_id);
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
