-- Batch 78: Investor Metrics, Lead Generation, Pricing V2 Integration
-- Tables for Investor KPIs, Leads, and Pricing Plans with RLS

-- ============================================
-- Investor Metrics Table
-- ============================================
CREATE TABLE IF NOT EXISTS investor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'revenue' CHECK (category IN ('revenue', 'growth', 'efficiency', 'engagement')),
  current_value DECIMAL(15,2) DEFAULT 0,
  previous_value DECIMAL(15,2) DEFAULT 0,
  change_percent DECIMAL(8,2) DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'currency',
  description TEXT,
  period VARCHAR(20) DEFAULT 'quarterly' CHECK (period IN ('monthly', 'quarterly', 'yearly')),
  quarter VARCHAR(10),
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor Metrics RLS
ALTER TABLE investor_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investor metrics" ON investor_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create investor metrics" ON investor_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor metrics" ON investor_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investor metrics" ON investor_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Investor Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_investor_metrics_user_id ON investor_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_metrics_category ON investor_metrics(category);
CREATE INDEX IF NOT EXISTS idx_investor_metrics_period ON investor_metrics(period);
CREATE INDEX IF NOT EXISTS idx_investor_metrics_year ON investor_metrics(year);

-- ============================================
-- Leads Table
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  title VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'archived')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source VARCHAR(50) DEFAULT 'website',
  notes TEXT,
  value_estimate DECIMAL(15,2) DEFAULT 0,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);

-- Leads Indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- ============================================
-- Pricing Plans Table
-- ============================================
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  annual_price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  subscribers_count INTEGER DEFAULT 0,
  revenue_monthly DECIMAL(15,2) DEFAULT 0,
  revenue_annual DECIMAL(15,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  upgrade_rate DECIMAL(5,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Plans RLS
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pricing plans" ON pricing_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create pricing plans" ON pricing_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pricing plans" ON pricing_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pricing plans" ON pricing_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Pricing Plans Indexes
CREATE INDEX IF NOT EXISTS idx_pricing_plans_user_id ON pricing_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_sort_order ON pricing_plans(sort_order);

-- ============================================
-- Lead Activities Table (for tracking interactions)
-- ============================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note', 'status_change', 'score_change')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Activities RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lead activities" ON lead_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create lead activities" ON lead_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lead Activities Indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_id ON lead_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);
