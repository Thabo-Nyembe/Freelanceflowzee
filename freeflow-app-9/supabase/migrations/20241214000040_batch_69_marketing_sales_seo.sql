-- Batch 69: Marketing, Sales, SEO Tables
-- Migration for marketing-v2, sales-v2, seo-v2

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS marketing_campaign_seq START 1;
CREATE SEQUENCE IF NOT EXISTS sales_deal_seq START 1;

-- ============================================
-- MARKETING CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_code TEXT NOT NULL DEFAULT ('MKT-' || LPAD(nextval('marketing_campaign_seq')::text, 6, '0')),
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT,
  campaign_type TEXT DEFAULT 'awareness',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  target_audience TEXT,
  target_segments TEXT[],
  target_locations TEXT[],
  target_demographics JSONB DEFAULT '{}',
  budget DECIMAL(12, 2) DEFAULT 0,
  spent DECIMAL(12, 2) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  landing_page_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- MARKETING CHANNELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  api_credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  avg_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  avg_conversion_rate DECIMAL(5, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALES DEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_code TEXT NOT NULL DEFAULT ('DEAL-' || LPAD(nextval('sales_deal_seq')::text, 6, '0')),
  title TEXT NOT NULL,
  description TEXT,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_title TEXT,
  deal_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deal_type TEXT,
  expected_close_date DATE,
  actual_close_date DATE,
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  team_id UUID,
  lead_source TEXT,
  campaign_id UUID,
  referral_source TEXT,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  competitor TEXT,
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- SALES ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES sales_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  outcome TEXT,
  duration_minutes INTEGER,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALES PIPELINE STAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  color TEXT,
  is_won_stage BOOLEAN DEFAULT false,
  is_lost_stage BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEO KEYWORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  current_position INTEGER,
  previous_position INTEGER,
  best_position INTEGER,
  position_change INTEGER DEFAULT 0,
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 0,
  cpc DECIMAL(8, 2),
  competition DECIMAL(3, 2),
  estimated_traffic INTEGER DEFAULT 0,
  actual_traffic INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5, 2),
  target_url TEXT,
  target_page_title TEXT,
  is_tracking BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  first_ranked_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEO BACKLINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  target_url TEXT NOT NULL,
  domain_authority INTEGER DEFAULT 0,
  page_authority INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  trust_flow INTEGER DEFAULT 0,
  citation_flow INTEGER DEFAULT 0,
  anchor_text TEXT,
  link_type TEXT DEFAULT 'dofollow' CHECK (link_type IN ('dofollow', 'nofollow', 'ugc', 'sponsored')),
  is_active BOOLEAN DEFAULT true,
  referral_traffic INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEO PAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  page_speed_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  core_web_vitals_score INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  heading_structure JSONB DEFAULT '{}',
  image_count INTEGER DEFAULT 0,
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,
  organic_traffic INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  avg_position DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  avg_session_duration INTEGER DEFAULT 0,
  is_indexed BOOLEAN DEFAULT true,
  has_sitemap BOOLEAN DEFAULT true,
  has_robots BOOLEAN DEFAULT true,
  has_canonical BOOLEAN DEFAULT true,
  has_structured_data BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  last_crawled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_channel ON marketing_campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_marketing_channels_user ON marketing_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channels_type ON marketing_channels(channel_type);

CREATE INDEX IF NOT EXISTS idx_sales_deals_user ON sales_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_deals_assigned ON sales_deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sales_deals_stage ON sales_deals(stage);
CREATE INDEX IF NOT EXISTS idx_sales_deals_value ON sales_deals(deal_value);
CREATE INDEX IF NOT EXISTS idx_sales_activities_deal ON sales_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_sales_pipeline_stages_user ON sales_pipeline_stages(user_id);

CREATE INDEX IF NOT EXISTS idx_seo_keywords_user ON seo_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_position ON seo_keywords(current_position);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_user ON seo_backlinks(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_backlinks_domain ON seo_backlinks(source_domain);
CREATE INDEX IF NOT EXISTS idx_seo_pages_user ON seo_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_url ON seo_pages(url);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

-- Marketing Campaigns Policies
CREATE POLICY "Users can view own marketing campaigns" ON marketing_campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketing campaigns" ON marketing_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketing campaigns" ON marketing_campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketing campaigns" ON marketing_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Marketing Channels Policies
CREATE POLICY "Users can view own marketing channels" ON marketing_channels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own marketing channels" ON marketing_channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own marketing channels" ON marketing_channels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own marketing channels" ON marketing_channels
  FOR DELETE USING (auth.uid() = user_id);

-- Sales Deals Policies
CREATE POLICY "Users can view own or assigned sales deals" ON sales_deals
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_to);
CREATE POLICY "Users can insert own sales deals" ON sales_deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own or assigned sales deals" ON sales_deals
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_to);
CREATE POLICY "Users can delete own sales deals" ON sales_deals
  FOR DELETE USING (auth.uid() = user_id);

-- Sales Activities Policies
CREATE POLICY "Users can view sales activities for accessible deals" ON sales_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM sales_deals WHERE sales_deals.id = sales_activities.deal_id
    AND (sales_deals.user_id = auth.uid() OR sales_deals.assigned_to = auth.uid())
  ));
CREATE POLICY "Users can insert sales activities" ON sales_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales activities" ON sales_activities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales activities" ON sales_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Sales Pipeline Stages Policies
CREATE POLICY "Users can view own pipeline stages" ON sales_pipeline_stages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pipeline stages" ON sales_pipeline_stages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipeline stages" ON sales_pipeline_stages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipeline stages" ON sales_pipeline_stages
  FOR DELETE USING (auth.uid() = user_id);

-- SEO Keywords Policies
CREATE POLICY "Users can view own seo keywords" ON seo_keywords
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seo keywords" ON seo_keywords
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seo keywords" ON seo_keywords
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seo keywords" ON seo_keywords
  FOR DELETE USING (auth.uid() = user_id);

-- SEO Backlinks Policies
CREATE POLICY "Users can view own seo backlinks" ON seo_backlinks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seo backlinks" ON seo_backlinks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seo backlinks" ON seo_backlinks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seo backlinks" ON seo_backlinks
  FOR DELETE USING (auth.uid() = user_id);

-- SEO Pages Policies
CREATE POLICY "Users can view own seo pages" ON seo_pages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seo pages" ON seo_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seo pages" ON seo_pages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seo pages" ON seo_pages
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_channels_updated_at ON marketing_channels;
CREATE TRIGGER update_marketing_channels_updated_at
  BEFORE UPDATE ON marketing_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_deals_updated_at ON sales_deals;
CREATE TRIGGER update_sales_deals_updated_at
  BEFORE UPDATE ON sales_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_keywords_updated_at ON seo_keywords;
CREATE TRIGGER update_seo_keywords_updated_at
  BEFORE UPDATE ON seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_backlinks_updated_at ON seo_backlinks;
CREATE TRIGGER update_seo_backlinks_updated_at
  BEFORE UPDATE ON seo_backlinks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_pages_updated_at ON seo_pages;
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
