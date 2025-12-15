-- Batch 69: Marketing, Sales, SEO Tables
-- Migration for marketing-v2, sales-v2, seo-v2

-- ============================================
-- MARKETING CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_code VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel VARCHAR(50) NOT NULL DEFAULT 'multi-channel',
  campaign_type VARCHAR(50) DEFAULT 'awareness',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',

  -- Targeting
  target_audience TEXT,
  target_segments TEXT[],
  target_locations TEXT[],
  target_demographics JSONB DEFAULT '{}',

  -- Budget & Costs
  budget DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  cost_per_click DECIMAL(10,4),
  cost_per_acquisition DECIMAL(10,4),

  -- Performance Metrics
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  roi DECIMAL(10,2),

  -- Dates
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  -- Content
  content_ids UUID[],
  landing_page_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Marketing Channels Table
CREATE TABLE IF NOT EXISTS marketing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  channel_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Performance
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_cost DECIMAL(15,2) DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Config
  api_credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign sequence
CREATE SEQUENCE IF NOT EXISTS marketing_campaign_seq START 1000;

-- Campaign code trigger
CREATE OR REPLACE FUNCTION generate_campaign_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_code IS NULL THEN
    NEW.campaign_code := 'MKT-' || LPAD(nextval('marketing_campaign_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_campaign_code
  BEFORE INSERT ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION generate_campaign_code();

-- ============================================
-- SALES DEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_code VARCHAR(20) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Company/Contact Info
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_title VARCHAR(100),

  -- Deal Details
  deal_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  deal_type VARCHAR(50),

  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  team_id UUID,

  -- Source
  lead_source VARCHAR(100),
  campaign_id UUID,
  referral_source VARCHAR(255),

  -- Win/Loss
  won_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,
  lost_reason TEXT,
  competitor VARCHAR(255),

  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Sales Activities Table
CREATE TABLE IF NOT EXISTS sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES sales_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  outcome VARCHAR(100),
  duration_minutes INTEGER,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline Stages Table
CREATE TABLE IF NOT EXISTS sales_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  stage_order INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  color VARCHAR(50),
  is_won_stage BOOLEAN DEFAULT false,
  is_lost_stage BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal sequence
CREATE SEQUENCE IF NOT EXISTS sales_deal_seq START 1000;

-- Deal code trigger
CREATE OR REPLACE FUNCTION generate_deal_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deal_code IS NULL THEN
    NEW.deal_code := 'DEAL-' || LPAD(nextval('sales_deal_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_deal_code
  BEFORE INSERT ON sales_deals
  FOR EACH ROW
  EXECUTE FUNCTION generate_deal_code();

-- ============================================
-- SEO KEYWORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,

  -- Rankings
  current_position INTEGER,
  previous_position INTEGER,
  best_position INTEGER,
  position_change INTEGER DEFAULT 0,
  trend VARCHAR(20) DEFAULT 'stable',

  -- Metrics
  search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 0,
  cpc DECIMAL(10,4),
  competition DECIMAL(5,4),

  -- Traffic
  estimated_traffic INTEGER DEFAULT 0,
  actual_traffic INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2),

  -- Targeting
  target_url TEXT,
  target_page_title VARCHAR(255),
  is_tracking BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,

  -- Dates
  first_ranked_at TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE,

  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Backlinks Table
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_domain VARCHAR(255) NOT NULL,
  target_url TEXT NOT NULL,

  -- Metrics
  domain_authority INTEGER DEFAULT 0,
  page_authority INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  trust_flow INTEGER DEFAULT 0,
  citation_flow INTEGER DEFAULT 0,

  -- Link Details
  anchor_text VARCHAR(500),
  link_type VARCHAR(50) DEFAULT 'dofollow',
  is_active BOOLEAN DEFAULT true,

  -- Traffic
  referral_traffic INTEGER DEFAULT 0,

  -- Dates
  first_seen_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Pages Table
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title VARCHAR(255),
  meta_description TEXT,

  -- Technical
  page_speed_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  core_web_vitals_score INTEGER DEFAULT 0,

  -- Content
  word_count INTEGER DEFAULT 0,
  heading_structure JSONB DEFAULT '{}',
  image_count INTEGER DEFAULT 0,
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,

  -- Performance
  organic_traffic INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  avg_position DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTEGER DEFAULT 0,

  -- Status
  is_indexed BOOLEAN DEFAULT true,
  has_sitemap BOOLEAN DEFAULT true,
  has_robots BOOLEAN DEFAULT true,
  has_canonical BOOLEAN DEFAULT true,
  has_structured_data BOOLEAN DEFAULT false,

  -- Issues
  issues JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',

  last_crawled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Marketing Campaigns RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
  ON marketing_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON marketing_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON marketing_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON marketing_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Marketing Channels RLS
ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own channels"
  ON marketing_channels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own channels"
  ON marketing_channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels"
  ON marketing_channels FOR UPDATE
  USING (auth.uid() = user_id);

-- Sales Deals RLS
ALTER TABLE sales_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deals"
  ON sales_deals FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create own deals"
  ON sales_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON sales_deals FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete own deals"
  ON sales_deals FOR DELETE
  USING (auth.uid() = user_id);

-- Sales Activities RLS
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deal activities"
  ON sales_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deal activities"
  ON sales_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Pipeline Stages RLS
ALTER TABLE sales_pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pipeline stages"
  ON sales_pipeline_stages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pipeline stages"
  ON sales_pipeline_stages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipeline stages"
  ON sales_pipeline_stages FOR UPDATE
  USING (auth.uid() = user_id);

-- SEO Keywords RLS
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keywords"
  ON seo_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own keywords"
  ON seo_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keywords"
  ON seo_keywords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keywords"
  ON seo_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- SEO Backlinks RLS
ALTER TABLE seo_backlinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own backlinks"
  ON seo_backlinks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backlinks"
  ON seo_backlinks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backlinks"
  ON seo_backlinks FOR UPDATE
  USING (auth.uid() = user_id);

-- SEO Pages RLS
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pages"
  ON seo_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pages"
  ON seo_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages"
  ON seo_pages FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_channel ON marketing_campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_sales_deals_user ON sales_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_deals_stage ON sales_deals(stage);
CREATE INDEX IF NOT EXISTS idx_sales_deals_assigned ON sales_deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sales_deals_close_date ON sales_deals(expected_close_date);

CREATE INDEX IF NOT EXISTS idx_sales_activities_deal ON sales_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_sales_activities_user ON sales_activities(user_id);

CREATE INDEX IF NOT EXISTS idx_seo_keywords_user ON seo_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_position ON seo_keywords(current_position);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_tracking ON seo_keywords(is_tracking);

CREATE INDEX IF NOT EXISTS idx_seo_backlinks_user ON seo_backlinks(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_domain ON seo_backlinks(source_domain);

CREATE INDEX IF NOT EXISTS idx_seo_pages_user ON seo_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_url ON seo_pages(url);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_channels_updated_at
  BEFORE UPDATE ON marketing_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_deals_updated_at
  BEFORE UPDATE ON sales_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_keywords_updated_at
  BEFORE UPDATE ON seo_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_backlinks_updated_at
  BEFORE UPDATE ON seo_backlinks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
