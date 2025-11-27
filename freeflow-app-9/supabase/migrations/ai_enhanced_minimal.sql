-- Minimal AI Enhanced Schema
--
-- AI tool management system with performance tracking and analytics

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS ai_tool_type CASCADE;
DROP TYPE IF EXISTS ai_tool_category CASCADE;
DROP TYPE IF EXISTS ai_tool_status CASCADE;
DROP TYPE IF EXISTS pricing_tier CASCADE;
DROP TYPE IF EXISTS performance_level CASCADE;

CREATE TYPE ai_tool_type AS ENUM ('text', 'image', 'audio', 'video', 'code', 'data', 'assistant', 'automation');
CREATE TYPE ai_tool_category AS ENUM ('content', 'design', 'development', 'analytics', 'productivity', 'creative');
CREATE TYPE ai_tool_status AS ENUM ('active', 'inactive', 'training', 'maintenance');
CREATE TYPE pricing_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE performance_level AS ENUM ('excellent', 'good', 'fair', 'poor');

-- ============================================================================
-- TABLES
-- ============================================================================

DROP TABLE IF EXISTS ai_enhanced_tools CASCADE;

CREATE TABLE ai_enhanced_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  category ai_tool_category NOT NULL,
  description TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  status ai_tool_status NOT NULL DEFAULT 'active',
  pricing_tier pricing_tier NOT NULL DEFAULT 'basic',
  performance performance_level NOT NULL DEFAULT 'good',
  usage_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_response_time INTEGER NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_user_id ON ai_enhanced_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_type ON ai_enhanced_tools(type);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_category ON ai_enhanced_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_status ON ai_enhanced_tools(status);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_usage_count ON ai_enhanced_tools(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_success_rate ON ai_enhanced_tools(success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_is_favorite ON ai_enhanced_tools(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_is_popular ON ai_enhanced_tools(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_created_at ON ai_enhanced_tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_enhanced_tools_tags ON ai_enhanced_tools USING gin(tags);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ai_enhanced_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_enhanced_tools_updated_at
  BEFORE UPDATE ON ai_enhanced_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_enhanced_updated_at();
