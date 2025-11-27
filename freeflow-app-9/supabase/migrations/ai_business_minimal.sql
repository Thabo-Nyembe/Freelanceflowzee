-- Minimal AI Business Advisor Schema
--
-- Comprehensive business intelligence and advisory system:
-- - Project Analyses with profitability and risk scores
-- - Business Insights with actionable recommendations
-- - Pricing Recommendations with market analysis
-- - Growth Forecasts with milestone tracking
-- - Advisory Sessions with conversation history
-- - Analytics with business metrics tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS insight_category CASCADE;
DROP TYPE IF EXISTS impact_level CASCADE;
DROP TYPE IF EXISTS pricing_tier CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS forecast_period CASCADE;

-- Insight category
CREATE TYPE insight_category AS ENUM (
  'profitability',
  'risk',
  'opportunity',
  'warning',
  'optimization',
  'growth'
);

-- Impact level
CREATE TYPE impact_level AS ENUM (
  'high',
  'medium',
  'low'
);

-- Pricing tier
CREATE TYPE pricing_tier AS ENUM (
  'basic',
  'standard',
  'premium',
  'enterprise'
);

-- Session status
CREATE TYPE session_status AS ENUM (
  'active',
  'completed',
  'cancelled'
);

-- Forecast period
CREATE TYPE forecast_period AS ENUM (
  'monthly',
  'quarterly',
  'yearly'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS advisory_analytics CASCADE;
DROP TABLE IF EXISTS growth_forecasts CASCADE;
DROP TABLE IF EXISTS session_messages CASCADE;
DROP TABLE IF EXISTS advisory_sessions CASCADE;
DROP TABLE IF EXISTS pricing_recommendations CASCADE;
DROP TABLE IF EXISTS business_insights CASCADE;
DROP TABLE IF EXISTS project_analyses CASCADE;

-- Project Analyses
CREATE TABLE project_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  project_name TEXT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  timeline INTEGER NOT NULL,
  client_type TEXT NOT NULL,
  scope TEXT,
  profitability_score INTEGER NOT NULL CHECK (profitability_score >= 0 AND profitability_score <= 100),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  estimated_profit DECIMAL(12, 2) NOT NULL,
  estimated_margin DECIMAL(5, 2) NOT NULL,
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business Insights
CREATE TABLE business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES project_analyses(id) ON DELETE CASCADE,
  category insight_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact impact_level NOT NULL,
  is_actionable BOOLEAN NOT NULL DEFAULT false,
  recommendation TEXT,
  is_implemented BOOLEAN NOT NULL DEFAULT false,
  implemented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing Recommendations
CREATE TABLE pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier pricing_tier NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  target_client TEXT NOT NULL,
  market_analysis TEXT NOT NULL,
  competitive_position TEXT,
  rate_increase_strategy TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_years INTEGER,
  market TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Advisory Sessions
CREATE TABLE advisory_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  status session_status NOT NULL DEFAULT 'active',
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Session Messages
CREATE TABLE session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES advisory_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Growth Forecasts
CREATE TABLE growth_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period forecast_period NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER,
  month INTEGER,
  revenue_forecast DECIMAL(12, 2) NOT NULL,
  project_count_forecast INTEGER NOT NULL,
  growth_rate DECIMAL(5, 2) NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  assumptions TEXT[] DEFAULT ARRAY[]::TEXT[],
  milestones TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Advisory Analytics
CREATE TABLE advisory_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_analyses INTEGER DEFAULT 0,
  total_insights INTEGER DEFAULT 0,
  avg_profitability_score DECIMAL(5, 2) DEFAULT 0,
  avg_risk_score DECIMAL(5, 2) DEFAULT 0,
  total_revenue_analyzed DECIMAL(12, 2) DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- project_analyses indexes
CREATE INDEX IF NOT EXISTS idx_project_analyses_user_id ON project_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_project_analyses_project_id ON project_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analyses_profitability ON project_analyses(profitability_score DESC);
CREATE INDEX IF NOT EXISTS idx_project_analyses_risk ON project_analyses(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_project_analyses_created_at ON project_analyses(created_at DESC);

-- business_insights indexes
CREATE INDEX IF NOT EXISTS idx_business_insights_analysis_id ON business_insights(analysis_id);
CREATE INDEX IF NOT EXISTS idx_business_insights_category ON business_insights(category);
CREATE INDEX IF NOT EXISTS idx_business_insights_impact ON business_insights(impact);
CREATE INDEX IF NOT EXISTS idx_business_insights_actionable ON business_insights(is_actionable);
CREATE INDEX IF NOT EXISTS idx_business_insights_implemented ON business_insights(is_implemented);

-- pricing_recommendations indexes
CREATE INDEX IF NOT EXISTS idx_pricing_recommendations_user_id ON pricing_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_recommendations_tier ON pricing_recommendations(tier);
CREATE INDEX IF NOT EXISTS idx_pricing_recommendations_created_at ON pricing_recommendations(created_at DESC);

-- advisory_sessions indexes
CREATE INDEX IF NOT EXISTS idx_advisory_sessions_user_id ON advisory_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_advisory_sessions_status ON advisory_sessions(status);
CREATE INDEX IF NOT EXISTS idx_advisory_sessions_created_at ON advisory_sessions(created_at DESC);

-- session_messages indexes
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages(created_at);

-- growth_forecasts indexes
CREATE INDEX IF NOT EXISTS idx_growth_forecasts_user_id ON growth_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_forecasts_period ON growth_forecasts(period);
CREATE INDEX IF NOT EXISTS idx_growth_forecasts_year ON growth_forecasts(year DESC);
CREATE INDEX IF NOT EXISTS idx_growth_forecasts_created_at ON growth_forecasts(created_at DESC);

-- advisory_analytics indexes
CREATE INDEX IF NOT EXISTS idx_advisory_analytics_user_id ON advisory_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_advisory_analytics_date ON advisory_analytics(date DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_business_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_project_analyses_updated_at
  BEFORE UPDATE ON project_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_business_updated_at();

CREATE TRIGGER trigger_business_insights_updated_at
  BEFORE UPDATE ON business_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_business_updated_at();

CREATE TRIGGER trigger_pricing_recommendations_updated_at
  BEFORE UPDATE ON pricing_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_business_updated_at();

CREATE TRIGGER trigger_advisory_sessions_updated_at
  BEFORE UPDATE ON advisory_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_business_updated_at();

CREATE TRIGGER trigger_growth_forecasts_updated_at
  BEFORE UPDATE ON growth_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_business_updated_at();

CREATE TRIGGER trigger_advisory_analytics_updated_at
  BEFORE UPDATE ON advisory_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_business_updated_at();

-- Auto-set completed_at when session status changes to completed
CREATE OR REPLACE FUNCTION set_session_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_session_completed_at
  BEFORE UPDATE ON advisory_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_session_completed_at();

-- Auto-update session message count
CREATE OR REPLACE FUNCTION update_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE advisory_sessions
  SET message_count = (
    SELECT COUNT(*)
    FROM session_messages
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_count_insert
  AFTER INSERT ON session_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_message_count();

CREATE TRIGGER trigger_update_session_count_delete
  AFTER DELETE ON session_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_message_count();

-- Auto-set implemented_at when insight is marked as implemented
CREATE OR REPLACE FUNCTION set_insight_implemented_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_implemented = true AND (OLD.is_implemented IS NULL OR OLD.is_implemented = false) THEN
    NEW.implemented_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_insight_implemented_at
  BEFORE UPDATE ON business_insights
  FOR EACH ROW
  EXECUTE FUNCTION set_insight_implemented_at();
