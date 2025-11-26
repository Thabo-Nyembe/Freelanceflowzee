-- =====================================================
-- ADMIN MARKETING SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive marketing management with leads, campaigns,
-- email automation, analytics, and ROI tracking
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

CREATE TYPE lead_score AS ENUM (
  'cold',
  'warm',
  'hot'
);

CREATE TYPE lead_source AS ENUM (
  'website',
  'referral',
  'social',
  'email',
  'event',
  'manual',
  'advertising'
);

CREATE TYPE campaign_status AS ENUM (
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'archived'
);

CREATE TYPE campaign_type AS ENUM (
  'email',
  'social',
  'content',
  'ppc',
  'seo',
  'event',
  'partnership'
);

CREATE TYPE email_campaign_status AS ENUM (
  'draft',
  'scheduled',
  'sending',
  'sent'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Marketing Leads
CREATE TABLE marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  score lead_score NOT NULL DEFAULT 'cold',
  score_value INTEGER NOT NULL DEFAULT 0 CHECK (score_value >= 0 AND score_value <= 100),
  source lead_source NOT NULL,
  interests TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  engagement_level INTEGER NOT NULL DEFAULT 5 CHECK (engagement_level >= 1 AND engagement_level <= 10),
  last_contact TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estimated_value DECIMAL(12, 2),
  notes TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  budget DECIMAL(12, 2) NOT NULL DEFAULT 0,
  spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  target_audience TEXT[] DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Goals
CREATE TABLE campaign_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Metrics
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ctr DECIMAL(5, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  roi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_per_lead DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_per_conversion DECIMAL(10, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Email Campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT NOT NULL,
  recipients INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL DEFAULT 0,
  delivered INTEGER NOT NULL DEFAULT 0,
  opened INTEGER NOT NULL DEFAULT 0,
  clicked INTEGER NOT NULL DEFAULT 0,
  bounced INTEGER NOT NULL DEFAULT 0,
  unsubscribed INTEGER NOT NULL DEFAULT 0,
  open_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  click_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  bounce_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status email_campaign_status NOT NULL DEFAULT 'draft',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing Stats (aggregated)
CREATE TABLE marketing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_leads INTEGER NOT NULL DEFAULT 0,
  new_leads INTEGER NOT NULL DEFAULT 0,
  qualified_leads INTEGER NOT NULL DEFAULT 0,
  hot_leads INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_campaigns INTEGER NOT NULL DEFAULT 0,
  active_campaigns INTEGER NOT NULL DEFAULT 0,
  total_budget DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  roi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_lead_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Marketing Leads Indexes
CREATE INDEX idx_marketing_leads_user_id ON marketing_leads(user_id);
CREATE INDEX idx_marketing_leads_status ON marketing_leads(status);
CREATE INDEX idx_marketing_leads_score ON marketing_leads(score);
CREATE INDEX idx_marketing_leads_source ON marketing_leads(source);
CREATE INDEX idx_marketing_leads_score_value ON marketing_leads(score_value DESC);
CREATE INDEX idx_marketing_leads_assigned_to ON marketing_leads(assigned_to);
CREATE INDEX idx_marketing_leads_next_follow_up ON marketing_leads(next_follow_up);
CREATE INDEX idx_marketing_leads_tags ON marketing_leads USING GIN(tags);
CREATE INDEX idx_marketing_leads_name_search ON marketing_leads USING GIN(to_tsvector('english', name));
CREATE INDEX idx_marketing_leads_email_search ON marketing_leads USING GIN(to_tsvector('english', email));
CREATE INDEX idx_marketing_leads_created_at ON marketing_leads(created_at DESC);

-- Marketing Campaigns Indexes
CREATE INDEX idx_marketing_campaigns_user_id ON marketing_campaigns(user_id);
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(type);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_start_date ON marketing_campaigns(start_date DESC);
CREATE INDEX idx_marketing_campaigns_created_by ON marketing_campaigns(created_by);
CREATE INDEX idx_marketing_campaigns_tags ON marketing_campaigns USING GIN(tags);
CREATE INDEX idx_marketing_campaigns_name_search ON marketing_campaigns USING GIN(to_tsvector('english', name));
CREATE INDEX idx_marketing_campaigns_created_at ON marketing_campaigns(created_at DESC);

-- Campaign Goals Indexes
CREATE INDEX idx_campaign_goals_campaign_id ON campaign_goals(campaign_id);

-- Campaign Metrics Indexes
CREATE INDEX idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_date ON campaign_metrics(date DESC);
CREATE INDEX idx_campaign_metrics_roi ON campaign_metrics(roi DESC);

-- Email Campaigns Indexes
CREATE INDEX idx_email_campaigns_campaign_id ON email_campaigns(campaign_id);
CREATE INDEX idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);

-- Marketing Stats Indexes
CREATE INDEX idx_marketing_stats_user_id ON marketing_stats(user_id);
CREATE INDEX idx_marketing_stats_date ON marketing_stats(date DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_marketing_leads_updated_at
  BEFORE UPDATE ON marketing_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_goals_updated_at
  BEFORE UPDATE ON campaign_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_metrics_updated_at
  BEFORE UPDATE ON campaign_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_stats_updated_at
  BEFORE UPDATE ON marketing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get marketing statistics
CREATE OR REPLACE FUNCTION get_marketing_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalLeads', COUNT(*),
    'qualifiedLeads', COUNT(*) FILTER (WHERE status = 'qualified'),
    'hotLeads', COUNT(*) FILTER (WHERE score = 'hot'),
    'conversionRate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'won')::DECIMAL / GREATEST(COUNT(*), 1)) * 100,
      2
    ),
    'averageLeadScore', ROUND(AVG(score_value), 2),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM marketing_leads
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    ),
    'bySource', (
      SELECT json_object_agg(source, cnt)
      FROM (
        SELECT source, COUNT(*) as cnt
        FROM marketing_leads
        WHERE user_id = p_user_id
        GROUP BY source
      ) source_counts
    )
  ) INTO v_stats
  FROM marketing_leads
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search leads
CREATE OR REPLACE FUNCTION search_marketing_leads(
  p_user_id UUID,
  p_search_term TEXT,
  p_status lead_status DEFAULT NULL,
  p_score lead_score DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  company TEXT,
  status lead_status,
  score lead_score,
  score_value INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ml.id,
    ml.name,
    ml.email,
    ml.company,
    ml.status,
    ml.score,
    ml.score_value,
    ts_rank(
      to_tsvector('english', ml.name || ' ' || ml.email || ' ' || COALESCE(ml.company, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM marketing_leads ml
  WHERE ml.user_id = p_user_id
    AND (p_status IS NULL OR ml.status = p_status)
    AND (p_score IS NULL OR ml.score = p_score)
    AND (
      p_search_term = '' OR
      to_tsvector('english', ml.name || ' ' || ml.email || ' ' || COALESCE(ml.company, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, ml.score_value DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics(
  p_campaign_id UUID,
  p_impressions INTEGER,
  p_clicks INTEGER,
  p_conversions INTEGER,
  p_revenue DECIMAL
)
RETURNS VOID AS $$
DECLARE
  v_campaign marketing_campaigns%ROWTYPE;
  v_ctr DECIMAL;
  v_conversion_rate DECIMAL;
  v_roi DECIMAL;
BEGIN
  SELECT * INTO v_campaign FROM marketing_campaigns WHERE id = p_campaign_id;

  v_ctr := CASE WHEN p_impressions > 0 THEN (p_clicks::DECIMAL / p_impressions) * 100 ELSE 0 END;
  v_conversion_rate := CASE WHEN p_clicks > 0 THEN (p_conversions::DECIMAL / p_clicks) * 100 ELSE 0 END;
  v_roi := CASE WHEN v_campaign.spent > 0 THEN ((p_revenue - v_campaign.spent) / v_campaign.spent) * 100 ELSE 0 END;

  INSERT INTO campaign_metrics (
    campaign_id, impressions, clicks, conversions, revenue,
    ctr, conversion_rate, roi,
    cost_per_lead, cost_per_conversion
  )
  VALUES (
    p_campaign_id, p_impressions, p_clicks, p_conversions, p_revenue,
    v_ctr, v_conversion_rate, v_roi,
    CASE WHEN p_conversions > 0 THEN v_campaign.spent / p_conversions ELSE 0 END,
    CASE WHEN p_conversions > 0 THEN v_campaign.spent / p_conversions ELSE 0 END
  )
  ON CONFLICT (campaign_id, date)
  DO UPDATE SET
    impressions = EXCLUDED.impressions,
    clicks = EXCLUDED.clicks,
    conversions = EXCLUDED.conversions,
    revenue = EXCLUDED.revenue,
    ctr = EXCLUDED.ctr,
    conversion_rate = EXCLUDED.conversion_rate,
    roi = EXCLUDED.roi,
    cost_per_lead = EXCLUDED.cost_per_lead,
    cost_per_conversion = EXCLUDED.cost_per_conversion,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Update marketing stats daily
CREATE OR REPLACE FUNCTION update_marketing_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO marketing_stats (
    user_id, date,
    total_leads, new_leads, qualified_leads, hot_leads,
    conversion_rate, total_campaigns, active_campaigns,
    total_budget, total_spent, total_revenue, roi, average_lead_score
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)),
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id AND status = 'qualified'),
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id AND score = 'hot'),
    (SELECT get_marketing_stats(p_user_id)->>'conversionRate')::DECIMAL,
    (SELECT COUNT(*) FROM marketing_campaigns WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM marketing_campaigns WHERE user_id = p_user_id AND status = 'active'),
    COALESCE((SELECT SUM(budget) FROM marketing_campaigns WHERE user_id = p_user_id), 0),
    COALESCE((SELECT SUM(spent) FROM marketing_campaigns WHERE user_id = p_user_id), 0),
    COALESCE((SELECT SUM(revenue) FROM campaign_metrics cm JOIN marketing_campaigns mc ON mc.id = cm.campaign_id WHERE mc.user_id = p_user_id), 0),
    0,
    COALESCE((SELECT AVG(score_value) FROM marketing_leads WHERE user_id = p_user_id), 0)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    new_leads = EXCLUDED.new_leads,
    qualified_leads = EXCLUDED.qualified_leads,
    hot_leads = EXCLUDED.hot_leads,
    conversion_rate = EXCLUDED.conversion_rate,
    total_campaigns = EXCLUDED.total_campaigns,
    active_campaigns = EXCLUDED.active_campaigns,
    total_budget = EXCLUDED.total_budget,
    total_spent = EXCLUDED.total_spent,
    total_revenue = EXCLUDED.total_revenue,
    average_lead_score = EXCLUDED.average_lead_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_leads_policy ON marketing_leads
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY marketing_campaigns_policy ON marketing_campaigns
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY campaign_goals_policy ON campaign_goals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM marketing_campaigns WHERE id = campaign_id AND user_id = auth.uid())
  );

CREATE POLICY campaign_metrics_policy ON campaign_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM marketing_campaigns WHERE id = campaign_id AND user_id = auth.uid())
  );

CREATE POLICY email_campaigns_policy ON email_campaigns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY marketing_stats_policy ON marketing_stats
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- END OF ADMIN MARKETING SYSTEM SCHEMA
-- =====================================================
