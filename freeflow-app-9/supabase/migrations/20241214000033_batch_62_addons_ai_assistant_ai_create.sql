-- =====================================================
-- Batch 62: Add-ons, AI Assistant, AI Create
-- Created: December 14, 2024
-- =====================================================

-- =====================================================
-- 1. Add-ons Table
-- =====================================================
CREATE TABLE IF NOT EXISTS add_ons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  provider VARCHAR(255),

  -- Classification
  category VARCHAR(50) DEFAULT 'feature',
  pricing_type VARCHAR(50) DEFAULT 'free',
  status VARCHAR(50) DEFAULT 'available',

  -- Pricing
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  billing_period VARCHAR(20) DEFAULT 'monthly',

  -- Metrics
  subscribers INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Content
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  icon_url TEXT,
  screenshot_urls TEXT[] DEFAULT '{}',

  -- Trial
  trial_days INTEGER DEFAULT 0,
  has_trial BOOLEAN DEFAULT false,

  -- Dates
  release_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  installed_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  size_bytes BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for add-ons
CREATE INDEX IF NOT EXISTS idx_add_ons_user_id ON add_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_addon_code ON add_ons(addon_code);
CREATE INDEX IF NOT EXISTS idx_add_ons_category ON add_ons(category);
CREATE INDEX IF NOT EXISTS idx_add_ons_status ON add_ons(status);
CREATE INDEX IF NOT EXISTS idx_add_ons_pricing_type ON add_ons(pricing_type);
CREATE INDEX IF NOT EXISTS idx_add_ons_rating ON add_ons(rating DESC);
CREATE INDEX IF NOT EXISTS idx_add_ons_created_at ON add_ons(created_at DESC);

-- RLS for add-ons
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own add-ons" ON add_ons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public add-ons" ON add_ons
  FOR SELECT USING (status = 'available');

CREATE POLICY "Users can create own add-ons" ON add_ons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own add-ons" ON add_ons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own add-ons" ON add_ons
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-generate addon code
CREATE OR REPLACE FUNCTION generate_addon_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.addon_code IS NULL OR NEW.addon_code = '' THEN
    NEW.addon_code := 'ADDON-' || LPAD(NEXTVAL('addon_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS addon_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_addon_code
  BEFORE INSERT ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION generate_addon_code();

-- Updated at trigger
CREATE TRIGGER trigger_add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. AI Conversations Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) DEFAULT 'New Conversation',

  -- Conversation settings
  mode VARCHAR(50) DEFAULT 'chat',
  model VARCHAR(100) DEFAULT 'gpt-4',
  system_prompt TEXT,

  -- Stats
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'active',
  is_archived BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,

  -- Context
  context JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,

  -- Tokens
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,

  -- Metadata
  model VARCHAR(100),
  latency_ms INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for AI conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_code ON ai_conversations(conversation_code);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);

-- RLS for AI conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations" ON ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI conversations" ON ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI messages" ON ai_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI messages" ON ai_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-generate conversation code
CREATE OR REPLACE FUNCTION generate_conversation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_code IS NULL OR NEW.conversation_code = '' THEN
    NEW.conversation_code := 'CONV-' || LPAD(NEXTVAL('conversation_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS conversation_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_conversation_code
  BEFORE INSERT ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION generate_conversation_code();

-- Update conversation stats on message insert
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET
    message_count = message_count + 1,
    total_tokens = total_tokens + NEW.total_tokens,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_stats
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_stats();

-- =====================================================
-- 3. AI Generations Table (for AI Create)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) DEFAULT 'Untitled Generation',

  -- Generation type
  generation_type VARCHAR(50) DEFAULT 'content',
  template VARCHAR(100),

  -- Input/Output
  prompt TEXT NOT NULL,
  result TEXT,

  -- Model settings
  model VARCHAR(100) DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,

  -- Tokens & cost
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,

  -- Quality metrics
  quality_score INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,

  -- Analysis
  analysis JSONB DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  latency_ms INTEGER DEFAULT 0,
  error_message TEXT,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for AI generations
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_code ON ai_generations(generation_code);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_status ON ai_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);

-- RLS for AI generations
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI generations" ON ai_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI generations" ON ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI generations" ON ai_generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI generations" ON ai_generations
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-generate generation code
CREATE OR REPLACE FUNCTION generate_ai_generation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.generation_code IS NULL OR NEW.generation_code = '' THEN
    NEW.generation_code := 'GEN-' || LPAD(NEXTVAL('ai_generation_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ai_generation_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_ai_generation_code
  BEFORE INSERT ON ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION generate_ai_generation_code();

-- Updated at trigger
CREATE TRIGGER trigger_ai_generations_updated_at
  BEFORE UPDATE ON ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Enable Real-time for all tables
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE add_ons;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_generations;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE add_ons IS 'Platform add-ons and extensions marketplace';
COMMENT ON TABLE ai_conversations IS 'AI assistant chat conversations';
COMMENT ON TABLE ai_messages IS 'Messages within AI conversations';
COMMENT ON TABLE ai_generations IS 'AI content generation requests and results';
