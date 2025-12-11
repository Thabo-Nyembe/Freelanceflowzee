-- ============================================================================
-- AI Service Enhanced Tables Migration
-- Created: 2025-12-11
-- Description: Tables for comprehensive AI service with multi-provider support
-- Includes: conversations, messages, generations, templates, usage tracking
-- ============================================================================

-- ============================================================================
-- TABLE 1: ai_conversations (chat conversations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation info
  title TEXT,
  summary TEXT,

  -- Model configuration
  model_id TEXT NOT NULL DEFAULT 'gpt-4',
  provider TEXT NOT NULL DEFAULT 'openai',
  system_prompt TEXT,

  -- Context
  context_type TEXT DEFAULT 'general',
  context_id UUID,
  context_data JSONB DEFAULT '{}',

  -- Settings
  temperature NUMERIC(3, 2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  settings JSONB DEFAULT '{}',

  -- Statistics
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active',
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Sharing
  is_shared BOOLEAN DEFAULT FALSE,
  share_id TEXT UNIQUE,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT ai_conversations_status_check CHECK (status IN ('active', 'archived', 'deleted')),
  CONSTRAINT ai_conversations_provider_check CHECK (provider IN ('openai', 'anthropic', 'google', 'local'))
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_model_id ON ai_conversations(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_provider ON ai_conversations(provider);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_context ON ai_conversations(context_type, context_id) WHERE context_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_share_id ON ai_conversations(share_id) WHERE share_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tags ON ai_conversations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message ON ai_conversations(last_message_at DESC);

-- ============================================================================
-- TABLE 2: ai_messages (conversation messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Message content
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',

  -- Attachments (images, files, etc.)
  attachments JSONB DEFAULT '[]',

  -- Model info (for assistant messages)
  model_id TEXT,
  provider TEXT,

  -- Token usage
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,

  -- Cost tracking
  cost DECIMAL(10, 6),

  -- Response metadata
  finish_reason TEXT,
  response_time_ms INTEGER,

  -- Function/tool calls
  tool_calls JSONB DEFAULT '[]',
  tool_results JSONB DEFAULT '[]',

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  -- Status
  status TEXT DEFAULT 'completed',
  error_message TEXT,

  -- Position
  position INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT ai_messages_role_check CHECK (role IN ('system', 'user', 'assistant', 'function', 'tool')),
  CONSTRAINT ai_messages_status_check CHECK (status IN ('pending', 'streaming', 'completed', 'error', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_messages(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_role ON ai_messages(role);
CREATE INDEX IF NOT EXISTS idx_ai_messages_position ON ai_messages(conversation_id, position);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- ============================================================================
-- TABLE 3: ai_generations (image/code/content generations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,

  -- Generation type
  generation_type TEXT NOT NULL,

  -- Input
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  input_data JSONB DEFAULT '{}',

  -- Output
  output_type TEXT NOT NULL,
  output_url TEXT,
  output_data JSONB DEFAULT '{}',
  output_preview TEXT,

  -- Model info
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  error_message TEXT,

  -- Performance
  processing_time_ms INTEGER,
  queue_time_ms INTEGER,

  -- Cost
  tokens_used INTEGER,
  cost DECIMAL(10, 6),

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT ai_generations_type_check CHECK (generation_type IN ('image', 'code', 'text', 'audio', 'video', 'embedding', 'classification', 'other')),
  CONSTRAINT ai_generations_status_check CHECK (status IN ('pending', 'queued', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_conversation_id ON ai_generations(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_model ON ai_generations(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_provider ON ai_generations(provider);
CREATE INDEX IF NOT EXISTS idx_ai_generations_status ON ai_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_generations_is_favorite ON ai_generations(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_generations_tags ON ai_generations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);

-- ============================================================================
-- TABLE 4: ai_prompt_templates (reusable prompts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Template content
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  default_values JSONB DEFAULT '{}',

  -- Model preferences
  preferred_model TEXT,
  preferred_provider TEXT,
  recommended_settings JSONB DEFAULT '{}',

  -- Access
  is_public BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,

  -- Statistics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  average_rating NUMERIC(3, 2),

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_templates_user_id ON ai_prompt_templates(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_templates_category ON ai_prompt_templates(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_templates_is_public ON ai_prompt_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_templates_is_system ON ai_prompt_templates(is_system) WHERE is_system = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_templates_tags ON ai_prompt_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_templates_usage ON ai_prompt_templates(usage_count DESC);

-- ============================================================================
-- TABLE 5: ai_usage_logs (detailed usage tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Operation info
  operation_type TEXT NOT NULL,
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,

  -- Related entities
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  generation_id UUID REFERENCES ai_generations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES ai_messages(id) ON DELETE SET NULL,

  -- Token usage
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Cost
  cost_per_1k_prompt DECIMAL(10, 6),
  cost_per_1k_completion DECIMAL(10, 6),
  total_cost DECIMAL(10, 6),

  -- Performance
  latency_ms INTEGER,
  queue_time_ms INTEGER,

  -- Status
  success BOOLEAN DEFAULT TRUE,
  error_code TEXT,
  error_message TEXT,

  -- Context
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_operation ON ai_usage_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON ai_usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON ai_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_conversation ON ai_usage_logs(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_usage_success ON ai_usage_logs(success);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at DESC);

-- ============================================================================
-- TABLE 6: ai_usage_daily (daily aggregated usage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Request counts
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,

  -- Token usage
  total_prompt_tokens BIGINT DEFAULT 0,
  total_completion_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,

  -- Cost
  total_cost DECIMAL(12, 6) DEFAULT 0,

  -- By operation type
  chat_requests INTEGER DEFAULT 0,
  generation_requests INTEGER DEFAULT 0,
  embedding_requests INTEGER DEFAULT 0,

  -- By provider
  openai_requests INTEGER DEFAULT 0,
  anthropic_requests INTEGER DEFAULT 0,
  google_requests INTEGER DEFAULT 0,

  -- Performance
  average_latency_ms INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_user_date ON ai_usage_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_date ON ai_usage_daily(date DESC);

-- ============================================================================
-- TABLE 7: ai_model_configs (user model preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Model info
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  display_name TEXT,

  -- Settings
  is_enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,

  -- Overrides
  default_temperature NUMERIC(3, 2),
  default_max_tokens INTEGER,
  custom_settings JSONB DEFAULT '{}',

  -- API configuration (encrypted)
  api_key_encrypted TEXT,
  endpoint_override TEXT,

  -- Rate limits
  max_requests_per_minute INTEGER,
  max_tokens_per_day INTEGER,

  -- Statistics
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(12, 6) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, model_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_ai_model_configs_user_id ON ai_model_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_model ON ai_model_configs(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_provider ON ai_model_configs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_is_default ON ai_model_configs(is_default) WHERE is_default = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;

-- Conversations policies
DROP POLICY IF EXISTS "Users can manage own conversations" ON ai_conversations;
CREATE POLICY "Users can manage own conversations"
  ON ai_conversations FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view shared conversations" ON ai_conversations;
CREATE POLICY "Anyone can view shared conversations"
  ON ai_conversations FOR SELECT
  USING (is_shared = TRUE AND share_id IS NOT NULL);

-- Messages policies
DROP POLICY IF EXISTS "Users can manage messages in own conversations" ON ai_messages;
CREATE POLICY "Users can manage messages in own conversations"
  ON ai_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Anyone can view messages in shared conversations" ON ai_messages;
CREATE POLICY "Anyone can view messages in shared conversations"
  ON ai_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.is_shared = TRUE
  ));

-- Generations policies
DROP POLICY IF EXISTS "Users can manage own generations" ON ai_generations;
CREATE POLICY "Users can manage own generations"
  ON ai_generations FOR ALL
  USING (auth.uid() = user_id);

-- Templates policies
DROP POLICY IF EXISTS "Users can manage own templates" ON ai_prompt_templates;
CREATE POLICY "Users can manage own templates"
  ON ai_prompt_templates FOR ALL
  USING (auth.uid() = user_id OR is_system = TRUE);

DROP POLICY IF EXISTS "Anyone can view public templates" ON ai_prompt_templates;
CREATE POLICY "Anyone can view public templates"
  ON ai_prompt_templates FOR SELECT
  USING (is_public = TRUE OR is_system = TRUE);

-- Usage logs policies
DROP POLICY IF EXISTS "Users can view own usage logs" ON ai_usage_logs;
CREATE POLICY "Users can view own usage logs"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert usage logs" ON ai_usage_logs;
CREATE POLICY "System can insert usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (TRUE);

-- Daily usage policies
DROP POLICY IF EXISTS "Users can view own daily usage" ON ai_usage_daily;
CREATE POLICY "Users can view own daily usage"
  ON ai_usage_daily FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage daily usage" ON ai_usage_daily;
CREATE POLICY "System can manage daily usage"
  ON ai_usage_daily FOR ALL
  USING (TRUE);

-- Model configs policies
DROP POLICY IF EXISTS "Users can manage own model configs" ON ai_model_configs;
CREATE POLICY "Users can manage own model configs"
  ON ai_model_configs FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update conversations updated_at
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update templates updated_at
DROP TRIGGER IF EXISTS update_ai_templates_updated_at ON ai_prompt_templates;
CREATE TRIGGER update_ai_templates_updated_at
  BEFORE UPDATE ON ai_prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update model configs updated_at
DROP TRIGGER IF EXISTS update_ai_model_configs_updated_at ON ai_model_configs;
CREATE TRIGGER update_ai_model_configs_updated_at
  BEFORE UPDATE ON ai_model_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update conversation stats on message insert
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET
    message_count = message_count + 1,
    total_tokens_used = total_tokens_used + COALESCE(NEW.total_tokens, 0),
    total_cost = total_cost + COALESCE(NEW.cost, 0),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message_trigger ON ai_messages;
CREATE TRIGGER update_conversation_on_message_trigger
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Auto-generate conversation title from first message
CREATE OR REPLACE FUNCTION auto_title_conversation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for user messages in conversations without a title
  IF NEW.role = 'user' THEN
    UPDATE ai_conversations
    SET title = CASE
      WHEN LENGTH(NEW.content) > 50 THEN SUBSTRING(NEW.content, 1, 50) || '...'
      ELSE NEW.content
    END
    WHERE id = NEW.conversation_id
      AND title IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_title_conversation_trigger ON ai_messages;
CREATE TRIGGER auto_title_conversation_trigger
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_title_conversation();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's AI usage for current billing period
CREATE OR REPLACE FUNCTION get_user_ai_usage(
  p_user_id UUID,
  p_start_date DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_requests INTEGER,
  total_tokens BIGINT,
  total_cost DECIMAL,
  requests_by_provider JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(u.total_requests), 0)::INTEGER,
    COALESCE(SUM(u.total_tokens), 0)::BIGINT,
    COALESCE(SUM(u.total_cost), 0)::DECIMAL,
    jsonb_build_object(
      'openai', COALESCE(SUM(u.openai_requests), 0),
      'anthropic', COALESCE(SUM(u.anthropic_requests), 0),
      'google', COALESCE(SUM(u.google_requests), 0)
    )
  FROM ai_usage_daily u
  WHERE u.user_id = p_user_id
    AND u.date >= p_start_date
    AND u.date <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Insert sample system prompt templates
INSERT INTO ai_prompt_templates (name, description, category, template, variables, is_public, is_system, tags)
VALUES
  (
    'Code Review Assistant',
    'Reviews code and provides feedback on best practices, bugs, and improvements',
    'development',
    'You are an expert code reviewer. Analyze the following {{language}} code and provide feedback on:
1. Potential bugs or errors
2. Code quality and best practices
3. Performance optimizations
4. Security concerns

Code to review:
```{{language}}
{{code}}
```',
    '[{"name": "language", "type": "string", "required": true}, {"name": "code", "type": "string", "required": true}]'::JSONB,
    TRUE,
    TRUE,
    ARRAY['code', 'review', 'development']
  ),
  (
    'Email Composer',
    'Helps compose professional emails',
    'communication',
    'Write a {{tone}} email about {{subject}} to {{recipient}}.
Key points to include:
{{key_points}}

Keep the email {{length}} and professional.',
    '[{"name": "tone", "type": "select", "options": ["formal", "friendly", "casual"], "default": "professional"}, {"name": "subject", "type": "string", "required": true}, {"name": "recipient", "type": "string", "required": true}, {"name": "key_points", "type": "string", "required": true}, {"name": "length", "type": "select", "options": ["brief", "moderate", "detailed"], "default": "moderate"}]'::JSONB,
    TRUE,
    TRUE,
    ARRAY['email', 'communication', 'writing']
  ),
  (
    'Content Summarizer',
    'Summarizes long content into key points',
    'productivity',
    'Summarize the following content in {{format}}. Focus on the key points and main ideas.

Content:
{{content}}

Provide the summary in {{length}} format.',
    '[{"name": "format", "type": "select", "options": ["bullet points", "paragraph", "numbered list"], "default": "bullet points"}, {"name": "content", "type": "string", "required": true}, {"name": "length", "type": "select", "options": ["brief (3-5 points)", "moderate (5-10 points)", "comprehensive"], "default": "moderate (5-10 points)"}]'::JSONB,
    TRUE,
    TRUE,
    ARRAY['summary', 'productivity', 'content']
  )
ON CONFLICT DO NOTHING;
