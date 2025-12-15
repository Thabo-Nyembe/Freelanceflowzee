-- Batch 49: Features, Inventory & Knowledge Base
-- Migration for feature flags, inventory management, and knowledge base articles

-- =============================================
-- FEATURES TABLE (Feature Flags)
-- =============================================
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  feature_name VARCHAR(500) NOT NULL,
  feature_key VARCHAR(200) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'disabled'
    CHECK (status IN ('enabled', 'disabled', 'rollout', 'testing', 'archived')),
  is_enabled BOOLEAN DEFAULT false,

  -- Environment
  environments TEXT[] DEFAULT ARRAY['development'],
  production_enabled BOOLEAN DEFAULT false,
  staging_enabled BOOLEAN DEFAULT false,
  development_enabled BOOLEAN DEFAULT false,

  -- Rollout Configuration
  rollout_percentage DECIMAL(5, 2) DEFAULT 0,
  rollout_type VARCHAR(50) DEFAULT 'percentage'
    CHECK (rollout_type IN ('percentage', 'gradual', 'targeted', 'full', 'off')),
  target_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,

  -- Targeting
  target_segments TEXT[],
  target_user_ids TEXT[],
  target_groups TEXT[],
  targeting_rules JSONB,

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_variants JSONB,
  ab_test_traffic JSONB,
  ab_test_conversion JSONB,
  ab_test_winner VARCHAR(200),
  ab_test_sample_size INTEGER DEFAULT 0,

  -- Metrics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,

  -- Rollback
  can_rollback BOOLEAN DEFAULT true,
  last_rollback_at TIMESTAMPTZ,
  rollback_reason TEXT,

  -- Metadata
  created_by VARCHAR(200),
  updated_by VARCHAR(200),
  tags TEXT[],
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for features
CREATE INDEX idx_features_user_id ON features(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_features_key ON features(feature_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_features_status ON features(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_features_enabled ON features(is_enabled) WHERE deleted_at IS NULL;

-- RLS Policies for features
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own features"
  ON features FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own features"
  ON features FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own features"
  ON features FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own features"
  ON features FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for features
ALTER PUBLICATION supabase_realtime ADD TABLE features;

-- =============================================
-- INVENTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  product_name VARCHAR(500) NOT NULL,
  sku VARCHAR(200) UNIQUE,
  barcode VARCHAR(200),

  -- Classification
  category VARCHAR(100),
  subcategory VARCHAR(100),
  brand VARCHAR(200),
  manufacturer VARCHAR(200),

  -- Stock Levels
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  minimum_stock_level INTEGER DEFAULT 0,
  maximum_stock_level INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'in-stock'
    CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock', 'discontinued', 'on-order', 'backorder')),
  is_active BOOLEAN DEFAULT true,

  -- Pricing
  unit_price DECIMAL(12, 2) DEFAULT 0,
  cost_price DECIMAL(12, 2) DEFAULT 0,
  selling_price DECIMAL(12, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Supplier Information
  supplier_name VARCHAR(200),
  supplier_id VARCHAR(100),
  supplier_sku VARCHAR(200),
  lead_time_days INTEGER DEFAULT 0,

  -- Location
  warehouse VARCHAR(200),
  warehouse_location VARCHAR(200),
  aisle VARCHAR(50),
  shelf VARCHAR(50),
  bin VARCHAR(50),

  -- Physical Properties
  weight_kg DECIMAL(10, 2) DEFAULT 0,
  dimensions_cm VARCHAR(100),
  volume_m3 DECIMAL(10, 4) DEFAULT 0,

  -- Tracking
  last_restocked_at TIMESTAMPTZ,
  last_sold_at TIMESTAMPTZ,
  last_counted_at TIMESTAMPTZ,
  days_in_stock INTEGER DEFAULT 0,

  -- Performance Metrics
  turnover_rate DECIMAL(5, 2) DEFAULT 0,
  sell_through_rate DECIMAL(5, 2) DEFAULT 0,
  stock_cover_days INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,

  -- Alerts
  low_stock_alert BOOLEAN DEFAULT false,
  out_of_stock_alert BOOLEAN DEFAULT false,
  expiry_alert BOOLEAN DEFAULT false,

  -- Expiration
  has_expiry BOOLEAN DEFAULT false,
  expiry_date DATE,
  days_until_expiry INTEGER,
  batch_number VARCHAR(100),
  lot_number VARCHAR(100),

  -- Tax & Compliance
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  is_taxable BOOLEAN DEFAULT true,
  customs_code VARCHAR(100),
  origin_country VARCHAR(100),

  -- Metadata
  description TEXT,
  notes TEXT,
  tags TEXT[],
  image_url TEXT,
  images TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for inventory
CREATE INDEX idx_inventory_user_id ON inventory(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_sku ON inventory(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_status ON inventory(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_category ON inventory(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse) WHERE deleted_at IS NULL;

-- RLS Policies for inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
  ON inventory FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own inventory"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory"
  ON inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for inventory
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;

-- =============================================
-- KNOWLEDGE_BASE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  article_title VARCHAR(500) NOT NULL,
  article_slug VARCHAR(500),
  description TEXT,
  content TEXT,

  -- Classification
  category VARCHAR(100) DEFAULT 'general'
    CHECK (category IN ('getting-started', 'tutorials', 'api', 'troubleshooting', 'best-practices', 'faq', 'general')),
  article_type VARCHAR(50) DEFAULT 'article'
    CHECK (article_type IN ('article', 'video', 'guide', 'faq', 'tutorial', 'reference')),

  -- Status
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived', 'outdated')),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Authoring
  author VARCHAR(200),
  author_id UUID,
  contributors TEXT[],
  reviewer VARCHAR(200),
  editor VARCHAR(200),

  -- Content Metadata
  read_time_minutes INTEGER DEFAULT 0,
  difficulty_level VARCHAR(50) DEFAULT 'beginner'
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  language VARCHAR(50) DEFAULT 'en',

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_reads INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,

  -- Feedback
  rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  helpful_percentage DECIMAL(5, 2) DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- SEO
  meta_title VARCHAR(200),
  meta_description TEXT,
  keywords TEXT[],
  canonical_url TEXT,

  -- Organization
  parent_article_id UUID REFERENCES knowledge_base(id),
  section VARCHAR(200),
  subsection VARCHAR(200),
  order_index INTEGER DEFAULT 0,

  -- Related Content
  related_articles UUID[],
  prerequisites UUID[],
  next_steps UUID[],
  tags TEXT[],

  -- Media
  featured_image_url TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER,
  attachments TEXT[],
  code_snippets JSONB,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID,
  is_latest_version BOOLEAN DEFAULT true,
  change_log TEXT,

  -- Access Control
  visibility VARCHAR(50) DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal', 'authenticated')),
  allowed_roles TEXT[],
  restricted_to TEXT[],

  -- Maintenance
  last_reviewed_at TIMESTAMPTZ,
  needs_update BOOLEAN DEFAULT false,
  is_outdated BOOLEAN DEFAULT false,
  deprecation_notice TEXT,

  -- Analytics
  search_appearances INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,
  avg_time_on_page_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for knowledge_base
CREATE INDEX idx_knowledge_base_user_id ON knowledge_base(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_base_slug ON knowledge_base(article_slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_base_type ON knowledge_base(article_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_base_status ON knowledge_base(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_knowledge_base_published ON knowledge_base(is_published) WHERE deleted_at IS NULL;

-- RLS Policies for knowledge_base
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own knowledge base articles"
  ON knowledge_base FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own knowledge base articles"
  ON knowledge_base FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge base articles"
  ON knowledge_base FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base articles"
  ON knowledge_base FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for knowledge_base
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_base;
