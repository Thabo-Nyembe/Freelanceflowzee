-- Organization AI Context Tables - FreeFlow A+++ Implementation
-- Enterprise-wide AI configuration and knowledge management

-- Create organization_contexts table
CREATE TABLE IF NOT EXISTS organization_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,

  -- Basic info
  name TEXT NOT NULL DEFAULT 'AI Context',
  description TEXT DEFAULT '',

  -- AI Configuration (JSONB for flexibility)
  ai_config JSONB DEFAULT '{
    "defaultModel": "gpt-4o",
    "temperature": 0.7,
    "maxTokens": 2048,
    "enabledCapabilities": [],
    "disabledCapabilities": [],
    "responseStyle": "formal",
    "languagePreference": "en",
    "toneOfVoice": "Professional and helpful",
    "contentPolicies": [],
    "customVocabulary": []
  }'::JSONB,

  -- Knowledge sources
  knowledge_sources JSONB DEFAULT '[]'::JSONB,

  -- Custom instructions
  custom_instructions TEXT DEFAULT '',
  system_prompt_additions TEXT DEFAULT '',

  -- Team-specific contexts
  team_contexts JSONB DEFAULT '[]'::JSONB,

  -- Metadata
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one context per organization
  CONSTRAINT unique_org_context UNIQUE (organization_id)
);

-- Create knowledge_embeddings table for vector search
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  organization_id UUID NOT NULL,

  -- Content chunks
  chunks TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Embeddings (stored as JSONB arrays for now, use pgvector in production)
  embeddings JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_usage_logs table for analytics
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,

  -- Request details
  request_type TEXT NOT NULL, -- chat, query, analyze, etc.
  prompt_length INTEGER NOT NULL DEFAULT 0,
  response_length INTEGER NOT NULL DEFAULT 0,

  -- Token usage
  tokens_used INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'gpt-4o',

  -- Performance
  processing_time INTEGER NOT NULL DEFAULT 0, -- milliseconds

  -- Context used
  context_sources TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_contexts_org_id
  ON organization_contexts(organization_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_org_id
  ON knowledge_embeddings(organization_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_source_id
  ON knowledge_embeddings(source_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_org_id
  ON ai_usage_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id
  ON ai_usage_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at
  ON ai_usage_logs(created_at DESC);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_org_contexts_ai_config
  ON organization_contexts USING gin(ai_config);

CREATE INDEX IF NOT EXISTS idx_org_contexts_knowledge_sources
  ON organization_contexts USING gin(knowledge_sources);

CREATE INDEX IF NOT EXISTS idx_org_contexts_team_contexts
  ON organization_contexts USING gin(team_contexts);

-- Enable RLS
ALTER TABLE organization_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_contexts
CREATE POLICY "Organization members can view their org context"
  ON organization_contexts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_contexts.organization_id
        AND om.user_id = auth.uid()
    )
    OR
    -- Allow if user is the organization owner
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_contexts.organization_id
        AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage org context"
  ON organization_contexts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_contexts.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner')
    )
    OR
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_contexts.organization_id
        AND o.owner_id = auth.uid()
    )
  );

-- RLS Policies for knowledge_embeddings
CREATE POLICY "Organization members can view embeddings"
  ON knowledge_embeddings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = knowledge_embeddings.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage embeddings"
  ON knowledge_embeddings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = knowledge_embeddings.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner')
    )
  );

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view their own usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can view all usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = ai_usage_logs.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "System can insert usage logs"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_org_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_org_context_updated ON organization_contexts;
CREATE TRIGGER trigger_org_context_updated
  BEFORE UPDATE ON organization_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_org_context_timestamp();

-- Function to get AI usage analytics
CREATE OR REPLACE FUNCTION get_ai_usage_analytics(
  org_id_param UUID,
  days_param INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_requests BIGINT,
  total_tokens BIGINT,
  avg_response_time NUMERIC,
  requests_by_type JSONB,
  requests_by_model JSONB,
  daily_usage JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_requests,
    SUM(aul.tokens_used)::BIGINT AS total_tokens,
    AVG(aul.processing_time)::NUMERIC AS avg_response_time,
    (
      SELECT jsonb_object_agg(request_type, cnt)
      FROM (
        SELECT request_type, COUNT(*) as cnt
        FROM ai_usage_logs
        WHERE organization_id = org_id_param
          AND created_at >= now() - (days_param || ' days')::INTERVAL
        GROUP BY request_type
      ) rt
    ) AS requests_by_type,
    (
      SELECT jsonb_object_agg(model, cnt)
      FROM (
        SELECT model, COUNT(*) as cnt
        FROM ai_usage_logs
        WHERE organization_id = org_id_param
          AND created_at >= now() - (days_param || ' days')::INTERVAL
        GROUP BY model
      ) m
    ) AS requests_by_model,
    (
      SELECT jsonb_agg(jsonb_build_object('date', day, 'count', cnt, 'tokens', tkns))
      FROM (
        SELECT
          DATE(created_at) as day,
          COUNT(*) as cnt,
          SUM(tokens_used) as tkns
        FROM ai_usage_logs
        WHERE organization_id = org_id_param
          AND created_at >= now() - (days_param || ' days')::INTERVAL
        GROUP BY DATE(created_at)
        ORDER BY day DESC
      ) d
    ) AS daily_usage
  FROM ai_usage_logs aul
  WHERE aul.organization_id = org_id_param
    AND aul.created_at >= now() - (days_param || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
  org_id_param UUID,
  search_query TEXT,
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
  source_id TEXT,
  chunk TEXT,
  relevance FLOAT
) AS $$
BEGIN
  -- Simple text search (in production, use vector similarity)
  RETURN QUERY
  SELECT
    ke.source_id,
    unnest(ke.chunks) as chunk,
    ts_rank(
      to_tsvector('english', unnest(ke.chunks)),
      plainto_tsquery('english', search_query)
    )::FLOAT as relevance
  FROM knowledge_embeddings ke
  WHERE ke.organization_id = org_id_param
    AND to_tsvector('english', array_to_string(ke.chunks, ' '))
        @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON organization_contexts TO authenticated;
GRANT ALL ON knowledge_embeddings TO authenticated;
GRANT ALL ON ai_usage_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_usage_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge_base TO authenticated;

COMMENT ON TABLE organization_contexts IS 'Organization-wide AI configuration and knowledge context';
COMMENT ON TABLE knowledge_embeddings IS 'Embedded knowledge chunks for semantic search';
COMMENT ON TABLE ai_usage_logs IS 'AI usage tracking for analytics and billing';
