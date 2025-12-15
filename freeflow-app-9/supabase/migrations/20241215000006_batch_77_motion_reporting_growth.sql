-- Batch 77: Motion Graphics, Reporting, Growth Hub V2 Integration
-- Tables for Animations, Reports, and Growth Metrics with RLS

-- ============================================
-- Motion Graphics / Animations Table
-- ============================================
CREATE TABLE IF NOT EXISTS animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'rendering', 'ready', 'failed', 'archived')),
  duration_seconds INTEGER DEFAULT 0,
  resolution VARCHAR(20) DEFAULT '1080p',
  fps INTEGER DEFAULT 30,
  file_size_bytes BIGINT DEFAULT 0,
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_template BOOLEAN DEFAULT false,
  preset_type VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rendered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animations RLS
ALTER TABLE animations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own animations" ON animations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create animations" ON animations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animations" ON animations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animations" ON animations
  FOR DELETE USING (auth.uid() = user_id);

-- Animations Indexes
CREATE INDEX IF NOT EXISTS idx_animations_user_id ON animations(user_id);
CREATE INDEX IF NOT EXISTS idx_animations_status ON animations(status);
CREATE INDEX IF NOT EXISTS idx_animations_category ON animations(category);
CREATE INDEX IF NOT EXISTS idx_animations_is_template ON animations(is_template);

-- ============================================
-- Business Reports Table
-- ============================================
CREATE TABLE IF NOT EXISTS business_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) DEFAULT 'custom' CHECK (report_type IN ('financial', 'operational', 'custom', 'analytics', 'sales')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'scheduled', 'failed')),
  schedule VARCHAR(20) DEFAULT 'on-demand' CHECK (schedule IN ('on-demand', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  file_url VARCHAR(500),
  file_format VARCHAR(20) DEFAULT 'pdf',
  data_range_start TIMESTAMP WITH TIME ZONE,
  data_range_end TIMESTAMP WITH TIME ZONE,
  filters JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Reports RLS
ALTER TABLE business_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON business_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports" ON business_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON business_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON business_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Business Reports Indexes
CREATE INDEX IF NOT EXISTS idx_business_reports_user_id ON business_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_business_reports_status ON business_reports(status);
CREATE INDEX IF NOT EXISTS idx_business_reports_report_type ON business_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_business_reports_schedule ON business_reports(schedule);

-- ============================================
-- Growth Metrics Table
-- ============================================
CREATE TABLE IF NOT EXISTS growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) DEFAULT 'custom' CHECK (metric_type IN ('revenue', 'users', 'conversion', 'engagement', 'retention', 'custom')),
  current_value DECIMAL(15,2) DEFAULT 0,
  previous_value DECIMAL(15,2) DEFAULT 0,
  target_value DECIMAL(15,2),
  growth_rate DECIMAL(8,2) DEFAULT 0,
  period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  unit VARCHAR(20) DEFAULT 'count',
  is_goal BOOLEAN DEFAULT false,
  goal_deadline TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth Metrics RLS
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics" ON growth_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create metrics" ON growth_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics" ON growth_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics" ON growth_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Growth Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_growth_metrics_user_id ON growth_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_metric_type ON growth_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_period ON growth_metrics(period);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_is_goal ON growth_metrics(is_goal);
