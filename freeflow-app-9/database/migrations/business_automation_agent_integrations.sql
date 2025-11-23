-- ============================================================================
-- Business Automation Agent - Integrations Database Schema
-- ============================================================================
-- This migration adds tables for managing external integrations and setup wizard
-- ============================================================================

-- Table: integrations
-- Stores configuration for external service integrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL UNIQUE, -- 'email', 'ai', 'calendar', 'payment', 'sms', 'crm'
  provider VARCHAR(100) NOT NULL, -- 'gmail', 'outlook', 'resend', 'sendgrid', 'openai', 'anthropic', etc.
  config JSONB NOT NULL, -- Encrypted configuration data (API keys, OAuth tokens, etc.)
  status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error'
  last_tested_at TIMESTAMP WITH TIME ZONE,
  last_test_result JSONB, -- Result of last connection test
  error_message TEXT,
  metadata JSONB, -- Additional provider-specific metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for integrations table
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_provider ON integrations(provider);

-- ============================================================================
-- Table: agent_setup
-- Tracks setup wizard completion and configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_setup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  completed_at TIMESTAMP WITH TIME ZONE,
  config JSONB, -- Setup configuration snapshot
  integrations_count INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'complete'
  setup_version VARCHAR(20), -- Version of setup wizard used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes for agent_setup table
CREATE INDEX idx_agent_setup_status ON agent_setup(status);
CREATE INDEX idx_agent_setup_user_id ON agent_setup(user_id);

-- ============================================================================
-- Table: agent_config
-- Stores global agent configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  enabled BOOLEAN DEFAULT false,
  auto_respond BOOLEAN DEFAULT false,
  require_approval_for_responses BOOLEAN DEFAULT true,
  require_approval_for_quotations BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  setup_completed_at TIMESTAMP WITH TIME ZONE,
  business_hours JSONB, -- Business hours configuration
  pricing_config JSONB, -- Pricing rules
  booking_rules JSONB, -- Booking rules and policies
  response_templates JSONB, -- Custom response templates
  notification_preferences JSONB, -- How and when to notify users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO agent_config (id, enabled, auto_respond, require_approval_for_responses, require_approval_for_quotations)
VALUES ('default', false, false, true, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Table: integration_logs
-- Logs all integration activities for debugging and monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'connect', 'disconnect', 'test', 'send', 'receive', etc.
  status VARCHAR(50) NOT NULL, -- 'success', 'failure', 'partial'
  request_data JSONB, -- Sanitized request data (no sensitive info)
  response_data JSONB, -- Response from external service
  error_message TEXT,
  duration_ms INTEGER, -- How long the action took
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for integration_logs table
CREATE INDEX idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX idx_integration_logs_type ON integration_logs(integration_type);
CREATE INDEX idx_integration_logs_action ON integration_logs(action);
CREATE INDEX idx_integration_logs_status ON integration_logs(status);
CREATE INDEX idx_integration_logs_created_at ON integration_logs(created_at DESC);

-- ============================================================================
-- Table: oauth_tokens
-- Securely stores OAuth tokens for Gmail, Outlook, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL, -- 'gmail', 'outlook', 'google_calendar', etc.
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT, -- Granted scopes
  metadata JSONB, -- Additional token metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for oauth_tokens table
CREATE INDEX idx_oauth_tokens_integration_id ON oauth_tokens(integration_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);
CREATE INDEX idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- ============================================================================
-- Table: integration_webhooks
-- Manages webhooks for real-time integration updates
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT, -- Encrypted
  events TEXT[] NOT NULL, -- Array of event types to listen for
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'error'
  last_received_at TIMESTAMP WITH TIME ZONE,
  last_event_type VARCHAR(100),
  error_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for integration_webhooks table
CREATE INDEX idx_integration_webhooks_integration_id ON integration_webhooks(integration_id);
CREATE INDEX idx_integration_webhooks_provider ON integration_webhooks(provider);
CREATE INDEX idx_integration_webhooks_status ON integration_webhooks(status);

-- ============================================================================
-- Table: api_usage
-- Tracks API usage and costs for budgeting
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  operation VARCHAR(100) NOT NULL, -- 'send_email', 'analyze_text', 'generate_response', etc.
  tokens_used INTEGER, -- For AI providers
  units_used INTEGER, -- For other services (emails sent, SMS sent, etc.)
  estimated_cost DECIMAL(10, 6), -- In USD
  metadata JSONB, -- Additional usage details
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for api_usage table
CREATE INDEX idx_api_usage_integration_id ON api_usage(integration_id);
CREATE INDEX idx_api_usage_type ON api_usage(integration_type);
CREATE INDEX idx_api_usage_provider ON api_usage(provider);
CREATE INDEX idx_api_usage_recorded_at ON api_usage(recorded_at DESC);

-- Create index for cost analysis
CREATE INDEX idx_api_usage_cost_analysis ON api_usage(provider, recorded_at DESC, estimated_cost);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update integration updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_integrations_timestamp
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER update_agent_setup_timestamp
  BEFORE UPDATE ON agent_setup
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER update_agent_config_timestamp
  BEFORE UPDATE ON agent_config
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER update_oauth_tokens_timestamp
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER update_integration_webhooks_timestamp
  BEFORE UPDATE ON integration_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Active integrations with last test results
CREATE OR REPLACE VIEW active_integrations AS
SELECT
  i.id,
  i.type,
  i.provider,
  i.status,
  i.last_tested_at,
  i.last_test_result->>'success' as last_test_success,
  i.error_message,
  i.created_at,
  i.updated_at
FROM integrations i
WHERE i.status = 'active'
ORDER BY i.type, i.provider;

-- View: API usage summary by provider
CREATE OR REPLACE VIEW api_usage_summary AS
SELECT
  provider,
  integration_type,
  COUNT(*) as total_calls,
  SUM(tokens_used) as total_tokens,
  SUM(units_used) as total_units,
  SUM(estimated_cost) as total_cost,
  DATE_TRUNC('day', recorded_at) as usage_date
FROM api_usage
GROUP BY provider, integration_type, DATE_TRUNC('day', recorded_at)
ORDER BY usage_date DESC, total_cost DESC;

-- View: Integration health status
CREATE OR REPLACE VIEW integration_health AS
SELECT
  i.id,
  i.type,
  i.provider,
  i.status,
  i.last_tested_at,
  CASE
    WHEN i.last_tested_at IS NULL THEN 'never_tested'
    WHEN i.last_tested_at < NOW() - INTERVAL '24 hours' THEN 'stale'
    WHEN i.status = 'error' THEN 'unhealthy'
    WHEN i.status = 'active' THEN 'healthy'
    ELSE 'unknown'
  END as health_status,
  COUNT(il.id) FILTER (WHERE il.status = 'failure' AND il.created_at > NOW() - INTERVAL '1 hour') as recent_failures
FROM integrations i
LEFT JOIN integration_logs il ON i.id = il.integration_id
GROUP BY i.id, i.type, i.provider, i.status, i.last_tested_at
ORDER BY health_status DESC, i.type;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_setup ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Policies for integrations table
CREATE POLICY "Users can view their integrations"
  ON integrations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their integrations"
  ON integrations FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Similar policies for other tables...
-- (Add more RLS policies as needed based on your security requirements)

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Uncomment to insert sample integrations for testing
-- INSERT INTO integrations (type, provider, config, status) VALUES
-- ('email', 'resend', '{"apiKey": "encrypted_key", "from": "test@example.com"}', 'active'),
-- ('ai', 'openai', '{"apiKey": "encrypted_key", "model": "gpt-4"}', 'active');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Business Automation Agent integrations schema created successfully!';
  RAISE NOTICE 'Tables created: integrations, agent_setup, agent_config, integration_logs, oauth_tokens, integration_webhooks, api_usage';
  RAISE NOTICE 'Views created: active_integrations, api_usage_summary, integration_health';
  RAISE NOTICE 'RLS enabled on all tables';
END $$;
