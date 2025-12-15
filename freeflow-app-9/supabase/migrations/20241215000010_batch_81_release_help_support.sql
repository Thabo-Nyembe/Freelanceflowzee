-- Batch 81: Release Notes, Help Docs, Customer Support tables
-- Migration: 20241215000010_batch_81_release_help_support.sql

-- Release Notes table
CREATE TABLE IF NOT EXISTS release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled', 'archived')),
  release_type VARCHAR(20) DEFAULT 'minor' CHECK (release_type IN ('major', 'minor', 'patch', 'hotfix')),
  platform VARCHAR(20) DEFAULT 'all' CHECK (platform IN ('web', 'mobile', 'api', 'desktop', 'all')),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  author VARCHAR(100),
  highlights TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  bug_fixes TEXT[] DEFAULT '{}',
  breaking_changes TEXT[] DEFAULT '{}',
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Help Docs table
CREATE TABLE IF NOT EXISTS help_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  question TEXT,
  answer TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'outdated')),
  category VARCHAR(30) DEFAULT 'faq' CHECK (category IN ('faq', 'how-to', 'troubleshooting', 'reference', 'best-practices', 'glossary')),
  author VARCHAR(100),
  views_count INTEGER DEFAULT 0,
  searches_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  related_docs TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Agents table
CREATE TABLE IF NOT EXISTS support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'away', 'offline')),
  active_conversations INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,
  resolved_today INTEGER DEFAULT 0,
  availability VARCHAR(100),
  specializations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Conversations table
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES support_agents(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255),
  conversation_type VARCHAR(20) DEFAULT 'chat' CHECK (conversation_type IN ('chat', 'email', 'phone', 'video')),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('active', 'waiting', 'closed')),
  subject VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  wait_time INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for release_notes
CREATE POLICY "Users can view own release notes" ON release_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own release notes" ON release_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own release notes" ON release_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own release notes" ON release_notes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for help_docs
CREATE POLICY "Users can view own help docs" ON help_docs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own help docs" ON help_docs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own help docs" ON help_docs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own help docs" ON help_docs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for support_agents
CREATE POLICY "Users can view own support agents" ON support_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own support agents" ON support_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support agents" ON support_agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own support agents" ON support_agents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for support_conversations
CREATE POLICY "Users can view own support conversations" ON support_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own support conversations" ON support_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own support conversations" ON support_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own support conversations" ON support_conversations FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_release_notes_user_id ON release_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_release_notes_status ON release_notes(status);
CREATE INDEX IF NOT EXISTS idx_help_docs_user_id ON help_docs(user_id);
CREATE INDEX IF NOT EXISTS idx_help_docs_category ON help_docs(category);
CREATE INDEX IF NOT EXISTS idx_support_agents_user_id ON support_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_support_agents_status ON support_agents(status);
CREATE INDEX IF NOT EXISTS idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
