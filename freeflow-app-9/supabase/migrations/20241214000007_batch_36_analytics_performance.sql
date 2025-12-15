-- Batch 36: Analytics & Performance
-- Tables: analytics, performance_analytics, system_insights
-- Created: December 14, 2024

-- ================================================
-- ANALYTICS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Analytics Record Details
  metric_name VARCHAR(200) NOT NULL,
  metric_type VARCHAR(50) NOT NULL DEFAULT 'count'
    CHECK (metric_type IN ('count', 'sum', 'average', 'percentage', 'ratio', 'rate', 'duration', 'score', 'ranking', 'custom')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),

  -- Values
  value DECIMAL(20, 4) NOT NULL,
  previous_value DECIMAL(20, 4),
  target_value DECIMAL(20, 4),
  baseline_value DECIMAL(20, 4),

  -- Calculations
  change_amount DECIMAL(20, 4),
  change_percent DECIMAL(10, 2),
  variance DECIMAL(20, 4),
  variance_percent DECIMAL(10, 2),

  -- Dimensions
  dimension_1 VARCHAR(100),
  dimension_2 VARCHAR(100),
  dimension_3 VARCHAR(100),
  segment VARCHAR(100),
  cohort VARCHAR(100),

  -- Time Period
  period_type VARCHAR(50) NOT NULL DEFAULT 'daily'
    CHECK (period_type IN ('hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  source VARCHAR(100),
  data_source VARCHAR(100),
  collection_method VARCHAR(100),

  -- Quality & Confidence
  data_quality DECIMAL(5, 2) DEFAULT 100.00,
  confidence_level DECIMAL(5, 2) DEFAULT 95.00,
  sample_size INTEGER,
  is_estimated BOOLEAN DEFAULT false,
  is_projection BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived', 'deprecated', 'reviewing')),

  -- Breakdown Data
  breakdown JSONB DEFAULT '{}'::jsonb,
  timeseries JSONB DEFAULT '[]'::jsonb,
  dimensions JSONB DEFAULT '{}'::jsonb,

  -- Alerting
  alert_threshold_min DECIMAL(20, 4),
  alert_threshold_max DECIMAL(20, 4),
  is_alert_triggered BOOLEAN DEFAULT false,
  alert_triggered_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT analytics_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT analytics_period_range CHECK (period_end >= period_start)
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_analytics_metric_name ON analytics(metric_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_analytics_category ON analytics(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_analytics_period ON analytics(period_start, period_end) WHERE deleted_at IS NULL;
CREATE INDEX idx_analytics_recorded_at ON analytics(recorded_at DESC) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analytics" ON analytics FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own analytics" ON analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON analytics FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own analytics" ON analytics FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;

-- ================================================
-- PERFORMANCE ANALYTICS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Performance Metrics
  metric_name VARCHAR(200) NOT NULL,
  metric_category VARCHAR(100) NOT NULL,
  performance_type VARCHAR(50) NOT NULL DEFAULT 'speed'
    CHECK (performance_type IN ('speed', 'efficiency', 'quality', 'reliability', 'scalability', 'throughput', 'latency', 'uptime', 'error_rate', 'custom')),

  -- Current Performance
  current_value DECIMAL(20, 4) NOT NULL,
  previous_value DECIMAL(20, 4),
  baseline_value DECIMAL(20, 4),
  target_value DECIMAL(20, 4),
  optimal_value DECIMAL(20, 4),

  -- Performance Scoring
  performance_score DECIMAL(5, 2),
  health_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  efficiency_score DECIMAL(5, 2),

  -- Percentiles
  p50_value DECIMAL(20, 4),
  p75_value DECIMAL(20, 4),
  p90_value DECIMAL(20, 4),
  p95_value DECIMAL(20, 4),
  p99_value DECIMAL(20, 4),

  -- Statistics
  min_value DECIMAL(20, 4),
  max_value DECIMAL(20, 4),
  avg_value DECIMAL(20, 4),
  median_value DECIMAL(20, 4),
  std_deviation DECIMAL(20, 4),

  -- Time Period
  period_type VARCHAR(50) NOT NULL DEFAULT 'hourly'
    CHECK (period_type IN ('minute', 'hourly', 'daily', 'weekly', 'monthly', 'real_time')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  measured_at TIMESTAMPTZ DEFAULT NOW(),

  -- Resource Context
  resource_type VARCHAR(100),
  resource_id VARCHAR(200),
  environment VARCHAR(50)
    CHECK (environment IN ('production', 'staging', 'development', 'testing', 'local')),
  region VARCHAR(100),

  -- Performance Indicators
  is_degraded BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  is_optimal BOOLEAN DEFAULT false,
  degradation_reason TEXT,

  -- Trends
  trend_direction VARCHAR(20)
    CHECK (trend_direction IN ('improving', 'stable', 'degrading', 'volatile', 'unknown')),
  trend_percentage DECIMAL(10, 2),

  -- Thresholds & Alerts
  warning_threshold DECIMAL(20, 4),
  critical_threshold DECIMAL(20, 4),
  is_alert_active BOOLEAN DEFAULT false,
  alert_triggered_at TIMESTAMPTZ,
  alert_resolved_at TIMESTAMPTZ,

  -- Incident Tracking
  incident_count INTEGER DEFAULT 0,
  last_incident_at TIMESTAMPTZ,
  mttr DECIMAL(20, 2),
  mtbf DECIMAL(20, 2),

  -- Detailed Data
  timeseries JSONB DEFAULT '[]'::jsonb,
  breakdown JSONB DEFAULT '{}'::jsonb,
  correlations JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  description TEXT,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT performance_analytics_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT performance_analytics_period_range CHECK (period_end >= period_start)
);

CREATE INDEX idx_performance_analytics_user_id ON performance_analytics(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_performance_analytics_metric ON performance_analytics(metric_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_performance_analytics_category ON performance_analytics(metric_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_performance_analytics_period ON performance_analytics(period_start, period_end) WHERE deleted_at IS NULL;
CREATE INDEX idx_performance_analytics_score ON performance_analytics(performance_score) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own performance analytics" ON performance_analytics FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own performance analytics" ON performance_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own performance analytics" ON performance_analytics FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own performance analytics" ON performance_analytics FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE performance_analytics;

-- ================================================
-- SYSTEM INSIGHTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS system_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Insight Details
  insight_type VARCHAR(50) NOT NULL DEFAULT 'observation'
    CHECK (insight_type IN ('observation', 'anomaly', 'trend', 'pattern', 'recommendation', 'prediction', 'alert', 'opportunity', 'risk')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Severity & Priority
  severity VARCHAR(20) NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  impact_level VARCHAR(20)
    CHECK (impact_level IN ('minimal', 'low', 'medium', 'high', 'severe')),

  -- Confidence & Reliability
  confidence_score DECIMAL(5, 2) DEFAULT 0.00,
  reliability_score DECIMAL(5, 2) DEFAULT 0.00,
  accuracy_rate DECIMAL(5, 2),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'acknowledged', 'investigating', 'resolved', 'dismissed', 'archived')),

  -- Related Data
  affected_metric VARCHAR(200),
  metric_value DECIMAL(20, 4),
  expected_value DECIMAL(20, 4),
  deviation DECIMAL(20, 4),
  deviation_percent DECIMAL(10, 2),

  -- Time Context
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Source & Detection
  detection_method VARCHAR(100),
  data_source VARCHAR(100),
  algorithm VARCHAR(100),

  -- Recommendations
  recommended_action TEXT,
  action_taken TEXT,
  action_taken_at TIMESTAMPTZ,
  action_taken_by UUID REFERENCES auth.users(id),

  -- Impact Assessment
  estimated_impact TEXT,
  actual_impact TEXT,
  affected_users INTEGER,
  affected_resources TEXT[],

  -- Root Cause
  root_cause TEXT,
  contributing_factors TEXT[],

  -- Related Insights
  related_insight_ids UUID[],
  parent_insight_id UUID REFERENCES system_insights(id),

  -- Patterns
  is_recurring BOOLEAN DEFAULT false,
  recurrence_count INTEGER DEFAULT 0,
  last_occurrence_at TIMESTAMPTZ,
  frequency VARCHAR(50),

  -- Supporting Data
  evidence JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  visualizations JSONB DEFAULT '[]'::jsonb,

  -- User Interaction
  viewed_by UUID[],
  viewed_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT system_insights_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_system_insights_user_id ON system_insights(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_system_insights_type ON system_insights(insight_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_system_insights_category ON system_insights(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_system_insights_severity ON system_insights(severity) WHERE deleted_at IS NULL;
CREATE INDEX idx_system_insights_status ON system_insights(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_system_insights_detected_at ON system_insights(detected_at DESC) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE system_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own system insights" ON system_insights FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own system insights" ON system_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own system insights" ON system_insights FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own system insights" ON system_insights FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE system_insights;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_analytics_updated_at BEFORE UPDATE ON performance_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_insights_updated_at BEFORE UPDATE ON system_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
