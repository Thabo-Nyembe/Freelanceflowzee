-- Minimal AI Assistant Schema
--
-- AI-powered assistant for conversations, insights, and project analysis:
-- - Conversations with messages and attachments
-- - AI-generated insights with categories and priorities
-- - Project analyses with recommendations
-- - Quick actions for common tasks
-- - Analytics tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS ai_provider CASCADE;
DROP TYPE IF EXISTS task_type CASCADE;
DROP TYPE IF EXISTS message_rating CASCADE;
DROP TYPE IF EXISTS insight_category CASCADE;
DROP TYPE IF EXISTS insight_priority CASCADE;
DROP TYPE IF EXISTS conversation_status CASCADE;
DROP TYPE IF EXISTS attachment_type CASCADE;
DROP TYPE IF EXISTS insight_status CASCADE;

-- Message types
CREATE TYPE message_type AS ENUM ('user', 'assistant', 'system');

-- AI providers
CREATE TYPE ai_provider AS ENUM ('anthropic', 'openai', 'google');

-- Task types
CREATE TYPE task_type AS ENUM ('chat', 'analysis', 'creative', 'strategic', 'operational');

-- Message ratings
CREATE TYPE message_rating AS ENUM ('up', 'down');

-- Insight categories
CREATE TYPE insight_category AS ENUM ('productivity', 'business', 'optimization', 'opportunity', 'growth');

-- Insight priorities
CREATE TYPE insight_priority AS ENUM ('high', 'medium', 'low');

-- Conversation status
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'pinned', 'deleted');

-- Attachment types
CREATE TYPE attachment_type AS ENUM ('file', 'image', 'document', 'link');

-- Insight status
CREATE TYPE insight_status AS ENUM ('active', 'dismissed', 'implemented');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_message_attachments CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS ai_project_analyses CASCADE;
DROP TABLE IF EXISTS ai_quick_actions CASCADE;

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  preview TEXT,
  status conversation_status NOT NULL DEFAULT 'active',
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  model ai_provider,
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  avg_response_time DECIMAL(10, 2),
  user_message_count INTEGER DEFAULT 0,
  assistant_message_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3, 2),
  last_message_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type message_type NOT NULL,
  rating message_rating,
  tokens INTEGER,
  provider ai_provider,
  cached BOOLEAN DEFAULT false,
  is_loading BOOLEAN DEFAULT false,
  model TEXT,
  temperature DECIMAL(3, 2),
  max_tokens INTEGER,
  response_time DECIMAL(10, 2),
  context_length INTEGER,
  suggestions TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Message Attachments
CREATE TABLE ai_message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  type attachment_type NOT NULL,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category insight_category NOT NULL,
  priority insight_priority NOT NULL,
  action TEXT NOT NULL,
  action_url TEXT,
  icon TEXT,
  status insight_status NOT NULL DEFAULT 'active',
  metric TEXT,
  value DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  comparison TEXT,
  confidence DECIMAL(3, 2),
  data_source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  dismissed_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project Analyses
CREATE TABLE ai_project_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL,
  completion INTEGER NOT NULL CHECK (completion >= 0 AND completion <= 100),
  insights TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  next_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  timeline_adherence INTEGER,
  client_approval_rate INTEGER,
  revision_count INTEGER,
  profit_margin DECIMAL(5, 2),
  efficiency INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  metadata JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quick Actions
CREATE TABLE ai_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  is_default BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ai_conversations indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_is_pinned ON ai_conversations(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message_at ON ai_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tags ON ai_conversations USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_metadata ON ai_conversations USING gin(metadata);

-- ai_messages indexes
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_messages(type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_rating ON ai_messages(rating) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_provider ON ai_messages(provider);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_metadata ON ai_messages USING gin(metadata);

-- ai_message_attachments indexes
CREATE INDEX IF NOT EXISTS idx_ai_message_attachments_message_id ON ai_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_attachments_type ON ai_message_attachments(type);

-- ai_insights indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON ai_insights(category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed_at ON ai_insights(dismissed_at) WHERE dismissed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_insights_implemented_at ON ai_insights(implemented_at) WHERE implemented_at IS NOT NULL;

-- ai_project_analyses indexes
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_user_id ON ai_project_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_project_id ON ai_project_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_status ON ai_project_analyses(status);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_risk_level ON ai_project_analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_generated_at ON ai_project_analyses(generated_at DESC);

-- ai_quick_actions indexes
CREATE INDEX IF NOT EXISTS idx_ai_quick_actions_category ON ai_quick_actions(category);
CREATE INDEX IF NOT EXISTS idx_ai_quick_actions_usage_count ON ai_quick_actions(usage_count DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update conversation timestamps and counts
CREATE OR REPLACE FUNCTION update_ai_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET
    updated_at = now(),
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    user_message_count = CASE WHEN NEW.type = 'user' THEN user_message_count + 1 ELSE user_message_count END,
    assistant_message_count = CASE WHEN NEW.type = 'assistant' THEN assistant_message_count + 1 ELSE assistant_message_count END,
    total_tokens = total_tokens + COALESCE(NEW.tokens, 0)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_conversation_timestamp
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversation_timestamp();

-- Update conversation rating when message rating changes
CREATE OR REPLACE FUNCTION update_ai_conversation_rating()
RETURNS TRIGGER AS $$
DECLARE
  total_ratings INTEGER;
  positive_ratings INTEGER;
  rating_score DECIMAL(3, 2);
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE rating = 'up')
  INTO total_ratings, positive_ratings
  FROM ai_messages
  WHERE conversation_id = NEW.conversation_id AND rating IS NOT NULL;

  IF total_ratings > 0 THEN
    rating_score := (positive_ratings::DECIMAL / total_ratings::DECIMAL);

    UPDATE ai_conversations
    SET avg_rating = rating_score
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_conversation_rating
  AFTER UPDATE OF rating ON ai_messages
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
  EXECUTE FUNCTION update_ai_conversation_rating();

-- Auto-generate conversation preview from first user message
CREATE OR REPLACE FUNCTION generate_ai_conversation_preview()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'user' THEN
    UPDATE ai_conversations
    SET preview = SUBSTRING(NEW.content FROM 1 FOR 100)
    WHERE id = NEW.conversation_id AND preview IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ai_conversation_preview
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION generate_ai_conversation_preview();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER trigger_ai_messages_updated_at
  BEFORE UPDATE ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER trigger_ai_insights_updated_at
  BEFORE UPDATE ON ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER trigger_ai_quick_actions_updated_at
  BEFORE UPDATE ON ai_quick_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_updated_at();
