-- ============================================================================
-- Custom AI Agents System
-- Migration: 20260119000023
-- ============================================================================

-- ============================================================================
-- AI Agents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Agent Identity
  name VARCHAR(200) NOT NULL,
  description TEXT,
  avatar_url TEXT,

  -- Agent Configuration
  system_prompt TEXT NOT NULL,
  model VARCHAR(100) DEFAULT 'gpt-4o',
  temperature NUMERIC(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000,

  -- Knowledge Base
  knowledge_base JSONB DEFAULT '[]', -- Array of document references
  knowledge_embedding_ids TEXT[], -- Vector store IDs

  -- Capabilities
  capabilities JSONB DEFAULT '{
    "web_search": false,
    "code_execution": false,
    "file_upload": true,
    "image_generation": false,
    "voice_mode": false
  }',

  -- Actions (custom functions the agent can perform)
  actions JSONB DEFAULT '[]',

  -- Conversation Settings
  conversation_starters TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,

  -- Usage stats
  conversation_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_ai_agents_is_public ON ai_agents(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_ai_agents_is_template ON ai_agents(is_template) WHERE is_template = TRUE;
CREATE INDEX idx_ai_agents_name ON ai_agents(name);

-- RLS
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agents"
  ON ai_agents FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own agents"
  ON ai_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON ai_agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON ai_agents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Agent Conversations Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,

  -- Conversation metadata
  title VARCHAR(500),
  summary TEXT,

  -- Messages stored as JSONB array
  messages JSONB DEFAULT '[]',

  -- Context
  context JSONB DEFAULT '{}', -- Project/task context

  -- Stats
  message_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,

  -- Timestamps
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX idx_agent_conversations_last_message ON agent_conversations(last_message_at DESC);

-- RLS
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON agent_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON agent_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON agent_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON agent_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Agent Knowledge Documents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document info
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(100) DEFAULT 'text/plain',

  -- Source
  source_type VARCHAR(50) DEFAULT 'upload', -- 'upload', 'url', 'paste', 'project', 'notion'
  source_url TEXT,

  -- Processing
  is_processed BOOLEAN DEFAULT FALSE,
  chunk_count INTEGER DEFAULT 0,
  embedding_ids TEXT[],

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_knowledge_docs_agent_id ON agent_knowledge_docs(agent_id);
CREATE INDEX idx_agent_knowledge_docs_user_id ON agent_knowledge_docs(user_id);

-- RLS
ALTER TABLE agent_knowledge_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their agent knowledge"
  ON agent_knowledge_docs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add knowledge to their agents"
  ON agent_knowledge_docs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their agent knowledge"
  ON agent_knowledge_docs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their agent knowledge"
  ON agent_knowledge_docs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Agent Actions/Tools Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action definition
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,

  -- Function schema (OpenAI function calling format)
  parameters JSONB NOT NULL DEFAULT '{"type": "object", "properties": {}}',

  -- Implementation
  action_type VARCHAR(50) DEFAULT 'webhook', -- 'webhook', 'api', 'automation', 'builtin'
  webhook_url TEXT,
  api_endpoint TEXT,
  automation_id UUID, -- Reference to Kazi automation

  -- Settings
  requires_confirmation BOOLEAN DEFAULT TRUE,
  is_enabled BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_actions_agent_id ON agent_actions(agent_id);

-- RLS
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their agent actions"
  ON agent_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create agent actions"
  ON agent_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their agent actions"
  ON agent_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their agent actions"
  ON agent_actions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Voice Conversations Table (for Voice AI feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS voice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Messages
  messages JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_voice_conversations_user_id ON voice_conversations(user_id);

-- RLS
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice conversations"
  ON voice_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice conversations"
  ON voice_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice conversations"
  ON voice_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice conversations"
  ON voice_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- System Agent Templates
-- ============================================================================

INSERT INTO ai_agents (
  id, user_id, name, description, system_prompt, model, is_public, is_template, capabilities, conversation_starters
) VALUES
-- Project Manager Agent
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'Project Manager',
  'Expert project management assistant that helps with task planning, timeline management, and team coordination.',
  'You are an expert project manager assistant. Help users with:
- Breaking down projects into tasks and milestones
- Estimating time and effort for tasks
- Creating project timelines and Gantt charts
- Identifying dependencies and blockers
- Suggesting best practices for project management
- Writing project briefs and requirements documents

Be concise, actionable, and focus on practical advice. When suggesting tasks, include estimates and priorities.',
  'gpt-4o',
  TRUE,
  TRUE,
  '{"web_search": false, "code_execution": false, "file_upload": true, "image_generation": false, "voice_mode": true}',
  ARRAY['Help me break down a new project', 'Create a project timeline', 'What are the best practices for sprint planning?', 'Help me write a project brief']
),

-- Invoice & Finance Agent
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'Finance Advisor',
  'Financial assistant for invoicing, budgeting, and freelance finance management.',
  'You are a financial advisor specialized in freelance and small business finances. Help users with:
- Creating professional invoices
- Setting competitive rates and pricing
- Managing budgets and cash flow
- Tax planning and deductions
- Financial reporting and analysis
- Payment terms and collection strategies

Provide specific, actionable financial advice. Include calculations when helpful. Be aware of common freelancer tax situations.',
  'gpt-4o',
  TRUE,
  TRUE,
  '{"web_search": false, "code_execution": true, "file_upload": true, "image_generation": false, "voice_mode": true}',
  ARRAY['Help me create an invoice', 'What should I charge for this project?', 'Review my monthly expenses', 'What business expenses can I deduct?']
),

-- Client Communication Agent
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'Client Communicator',
  'Helps draft professional client communications, proposals, and handle difficult conversations.',
  'You are an expert in professional client communication. Help users with:
- Writing professional emails and messages
- Drafting proposals and quotes
- Handling scope creep and change requests
- Managing difficult conversations
- Setting boundaries professionally
- Following up on overdue payments

Write in a professional but friendly tone. Provide multiple versions when appropriate (formal/casual). Focus on maintaining good client relationships.',
  'gpt-4o',
  TRUE,
  TRUE,
  '{"web_search": false, "code_execution": false, "file_upload": true, "image_generation": false, "voice_mode": true}',
  ARRAY['Draft a project proposal email', 'How do I tell a client about delays?', 'Write a payment reminder', 'Help me handle scope creep']
),

-- Content Writer Agent
(
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'Content Writer',
  'AI writing assistant for marketing copy, blog posts, and content creation.',
  'You are a professional content writer and copywriter. Help users with:
- Writing blog posts and articles
- Creating marketing copy and ads
- Crafting social media content
- Writing product descriptions
- SEO optimization
- Email marketing campaigns

Adapt your writing style to the target audience. Provide engaging, conversion-focused copy. Include headlines, CTAs, and meta descriptions when relevant.',
  'gpt-4o',
  TRUE,
  TRUE,
  '{"web_search": true, "code_execution": false, "file_upload": true, "image_generation": true, "voice_mode": true}',
  ARRAY['Write a blog post about...', 'Create social media content for...', 'Help me with email marketing copy', 'Write product descriptions']
),

-- Code Assistant Agent
(
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'Code Assistant',
  'Technical programming assistant for code review, debugging, and development help.',
  'You are an expert software developer and code assistant. Help users with:
- Writing clean, efficient code
- Debugging and fixing issues
- Code review and best practices
- Architecture and design patterns
- Documentation and comments
- Testing strategies

Provide code examples with explanations. Follow best practices for the language/framework being used. Include error handling and edge cases.',
  'gpt-4o',
  TRUE,
  TRUE,
  '{"web_search": true, "code_execution": true, "file_upload": true, "image_generation": false, "voice_mode": false}',
  ARRAY['Review this code', 'Help me debug this error', 'Write a function that...', 'Explain this code pattern']
);

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Update agent stats
CREATE OR REPLACE FUNCTION update_agent_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update agent stats
  UPDATE ai_agents
  SET
    conversation_count = (
      SELECT COUNT(*) FROM agent_conversations WHERE agent_id = NEW.agent_id
    ),
    message_count = (
      SELECT COALESCE(SUM(message_count), 0) FROM agent_conversations WHERE agent_id = NEW.agent_id
    ),
    updated_at = NOW()
  WHERE id = NEW.agent_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_stats
  AFTER INSERT OR UPDATE ON agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_conversation_stats();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_agent_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_agents_timestamp
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_timestamps();

CREATE TRIGGER trigger_update_agent_conversations_timestamp
  BEFORE UPDATE ON agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_timestamps();

-- ============================================================================
-- Views
-- ============================================================================

-- Public agents marketplace view
CREATE OR REPLACE VIEW public_ai_agents AS
SELECT
  a.id,
  a.name,
  a.description,
  a.avatar_url,
  a.capabilities,
  a.conversation_starters,
  a.conversation_count,
  a.is_template,
  a.created_at
FROM ai_agents a
WHERE a.is_public = TRUE
ORDER BY a.conversation_count DESC;

-- User agents with stats
CREATE OR REPLACE VIEW user_agents_with_stats AS
SELECT
  a.*,
  COALESCE(c.recent_conversations, 0) as recent_conversations,
  COALESCE(d.knowledge_docs, 0) as knowledge_doc_count,
  COALESCE(ac.action_count, 0) as action_count
FROM ai_agents a
LEFT JOIN (
  SELECT agent_id, COUNT(*) as recent_conversations
  FROM agent_conversations
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY agent_id
) c ON c.agent_id = a.id
LEFT JOIN (
  SELECT agent_id, COUNT(*) as knowledge_docs
  FROM agent_knowledge_docs
  GROUP BY agent_id
) d ON d.agent_id = a.id
LEFT JOIN (
  SELECT agent_id, COUNT(*) as action_count
  FROM agent_actions
  WHERE is_enabled = TRUE
  GROUP BY agent_id
) ac ON ac.agent_id = a.id;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE ai_agents IS 'User-created custom AI agents with configurable personalities and capabilities';
COMMENT ON TABLE agent_conversations IS 'Conversation history with AI agents';
COMMENT ON TABLE agent_knowledge_docs IS 'Knowledge base documents for training agents';
COMMENT ON TABLE agent_actions IS 'Custom actions/tools that agents can perform';
COMMENT ON TABLE voice_conversations IS 'Voice AI conversation history';
