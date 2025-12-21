-- Missing Tables Migration
-- Created: December 16, 2024
-- Adds remaining tables needed for A+++ hooks coverage

-- ============================================
-- AI CHAT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  task_type TEXT DEFAULT 'chat',
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  provider TEXT,
  cost DECIMAL(10, 6) DEFAULT 0,
  duration_ms INTEGER,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for ai_chat_history
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON ai_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_task_type ON ai_chat_history(task_type);

-- RLS for ai_chat_history
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON ai_chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON ai_chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history"
  ON ai_chat_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
  ON ai_chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- AI OPERATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('transcription', 'analysis', 'chapters', 'insights', 'generation', 'enhancement', 'summary')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  input_data JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  model TEXT,
  provider TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for ai_operations
CREATE INDEX IF NOT EXISTS idx_ai_operations_user_id ON ai_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_operations_status ON ai_operations(status);
CREATE INDEX IF NOT EXISTS idx_ai_operations_type ON ai_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_ai_operations_created_at ON ai_operations(created_at DESC);

-- RLS for ai_operations
ALTER TABLE ai_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own operations"
  ON ai_operations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operations"
  ON ai_operations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operations"
  ON ai_operations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own operations"
  ON ai_operations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MARKET OPPORTUNITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS market_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('market_gap', 'competitor_weakness', 'trend', 'partnership', 'expansion', 'innovation', 'cost_reduction', 'revenue_growth')),
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'evaluating', 'pursuing', 'captured', 'passed', 'expired')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  potential_value DECIMAL(12, 2),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  source TEXT,
  market_segment TEXT,
  target_audience TEXT,
  competitive_advantage TEXT,
  required_resources JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  timeline_start DATE,
  timeline_end DATE,
  actual_value DECIMAL(12, 2),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for market_opportunities
CREATE INDEX IF NOT EXISTS idx_market_opportunities_user_id ON market_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_status ON market_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_type ON market_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_priority ON market_opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_created_at ON market_opportunities(created_at DESC);

-- RLS for market_opportunities
ALTER TABLE market_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own opportunities"
  ON market_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opportunities"
  ON market_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities"
  ON market_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities"
  ON market_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- REVENUE REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom', 'forecast', 'comparison')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed', 'archived')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Revenue Metrics
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  recurring_revenue DECIMAL(12, 2) DEFAULT 0,
  one_time_revenue DECIMAL(12, 2) DEFAULT 0,
  gross_profit DECIMAL(12, 2) DEFAULT 0,
  net_profit DECIMAL(12, 2) DEFAULT 0,
  profit_margin DECIMAL(5, 2),

  -- Growth Metrics
  revenue_growth_rate DECIMAL(5, 2),
  mrr_growth_rate DECIMAL(5, 2),
  customer_growth_rate DECIMAL(5, 2),

  -- Customer Metrics
  total_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  customer_lifetime_value DECIMAL(10, 2),
  average_revenue_per_user DECIMAL(10, 2),

  -- Breakdown Data
  revenue_by_source JSONB DEFAULT '{}',
  revenue_by_product JSONB DEFAULT '{}',
  revenue_by_region JSONB DEFAULT '{}',
  revenue_by_customer_segment JSONB DEFAULT '{}',

  -- AI Analysis
  report_data JSONB DEFAULT '{}',
  insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  forecast_data JSONB DEFAULT '{}',

  -- Comparison Data
  previous_period_revenue DECIMAL(12, 2),
  year_over_year_growth DECIMAL(5, 2),

  -- Metadata
  generated_by TEXT DEFAULT 'system',
  generation_time_ms INTEGER,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for revenue_reports
CREATE INDEX IF NOT EXISTS idx_revenue_reports_user_id ON revenue_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_type ON revenue_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_status ON revenue_reports(status);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_period ON revenue_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_created_at ON revenue_reports(created_at DESC);

-- RLS for revenue_reports
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON revenue_reports FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can insert own reports"
  ON revenue_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON revenue_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON revenue_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ENABLE REALTIME FOR NEW TABLES
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE ai_chat_history;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE market_opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE revenue_reports;

-- ============================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
DROP TRIGGER IF EXISTS update_ai_chat_history_updated_at ON ai_chat_history;
CREATE TRIGGER update_ai_chat_history_updated_at
  BEFORE UPDATE ON ai_chat_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_operations_updated_at ON ai_operations;
CREATE TRIGGER update_ai_operations_updated_at
  BEFORE UPDATE ON ai_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_market_opportunities_updated_at ON market_opportunities;
CREATE TRIGGER update_market_opportunities_updated_at
  BEFORE UPDATE ON market_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenue_reports_updated_at ON revenue_reports;
CREATE TRIGGER update_revenue_reports_updated_at
  BEFORE UPDATE ON revenue_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Migration complete: Added 4 missing tables with RLS and realtime enabled';
  RAISE NOTICE '- ai_chat_history';
  RAISE NOTICE '- ai_operations';
  RAISE NOTICE '- market_opportunities';
  RAISE NOTICE '- revenue_reports';
END $$;
