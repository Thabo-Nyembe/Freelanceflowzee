-- Batch 53: Products, Releases, Roadmap V2 Tables
-- Migration for products-v2, releases-v2, roadmap-v2 pages

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Product Details
  product_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'subscription'
    CHECK (category IN ('subscription', 'one_time', 'add_on', 'bundle', 'freemium', 'enterprise', 'other')),
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived', 'discontinued', 'coming_soon')),

  -- Pricing
  price DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) DEFAULT 'monthly'
    CHECK (billing_cycle IN ('one_time', 'monthly', 'quarterly', 'yearly', 'custom')),

  -- Metrics
  active_users INTEGER DEFAULT 0,
  total_revenue DECIMAL(14, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  growth_rate DECIMAL(5, 2) DEFAULT 0,

  -- Features
  features JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  -- Media
  thumbnail_url TEXT,
  images TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active_users ON products(active_users DESC);
CREATE INDEX IF NOT EXISTS idx_products_total_revenue ON products(total_revenue DESC);

-- ============================================
-- PRODUCT VARIANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  variant_name VARCHAR(200) NOT NULL,
  sku VARCHAR(100),
  price DECIMAL(12, 2) DEFAULT 0,
  compare_at_price DECIMAL(12, 2),

  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT false,

  -- Attributes
  attributes JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- ============================================
-- RELEASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Release Details
  version VARCHAR(50) NOT NULL,
  release_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'rolling', 'deployed', 'failed', 'rolled_back')),
  environment VARCHAR(50) DEFAULT 'production'
    CHECK (environment IN ('development', 'staging', 'production', 'all')),

  -- Deployment Info
  deployed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  deploy_time_minutes DECIMAL(6, 2),

  -- Metrics
  commits_count INTEGER DEFAULT 0,
  contributors_count INTEGER DEFAULT 0,
  coverage_percentage DECIMAL(5, 2) DEFAULT 0,
  rollback_rate DECIMAL(5, 2) DEFAULT 0,

  -- Changelog
  changelog JSONB DEFAULT '[]',
  breaking_changes TEXT[],

  -- Metadata
  git_branch VARCHAR(200),
  git_tag VARCHAR(100),
  build_number VARCHAR(100),
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Releases indexes
CREATE INDEX IF NOT EXISTS idx_releases_user_id ON releases(user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_version ON releases(version);
CREATE INDEX IF NOT EXISTS idx_releases_environment ON releases(environment);
CREATE INDEX IF NOT EXISTS idx_releases_deployed_at ON releases(deployed_at DESC);

-- ============================================
-- DEPLOYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Deployment Details
  environment VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'cancelled', 'rolled_back')),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes DECIMAL(6, 2),

  -- Infrastructure
  servers_count INTEGER DEFAULT 0,
  health_percentage DECIMAL(5, 2) DEFAULT 100,

  -- Logs
  logs TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments indexes
CREATE INDEX IF NOT EXISTS idx_deployments_release_id ON deployments(release_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_started_at ON deployments(started_at DESC);

-- ============================================
-- ROADMAP INITIATIVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roadmap_initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Initiative Details
  title VARCHAR(300) NOT NULL,
  description TEXT,

  -- Planning
  quarter VARCHAR(10),
  year INTEGER,
  theme VARCHAR(100),
  team VARCHAR(100),

  -- Status & Progress
  status VARCHAR(20) DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Impact & Effort
  impact VARCHAR(20) DEFAULT 'medium'
    CHECK (impact IN ('low', 'medium', 'high', 'very_high', 'critical')),
  effort VARCHAR(20) DEFAULT 'medium'
    CHECK (effort IN ('small', 'medium', 'large', 'extra_large')),

  -- Stakeholders
  stakeholders TEXT[],
  owner_id UUID REFERENCES auth.users(id),

  -- Dates
  start_date DATE,
  target_date DATE,
  completed_date DATE,

  -- Metadata
  tags TEXT[],
  dependencies UUID[],
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Roadmap initiatives indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_initiatives_user_id ON roadmap_initiatives(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_initiatives_status ON roadmap_initiatives(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_initiatives_quarter ON roadmap_initiatives(quarter, year);
CREATE INDEX IF NOT EXISTS idx_roadmap_initiatives_priority ON roadmap_initiatives(priority);
CREATE INDEX IF NOT EXISTS idx_roadmap_initiatives_theme ON roadmap_initiatives(theme);

-- ============================================
-- ROADMAP MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Milestone Details
  milestone_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Dates
  target_date DATE NOT NULL,
  completed_date DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'planned'
    CHECK (status IN ('planned', 'on_track', 'at_risk', 'delayed', 'completed')),

  -- Metrics
  initiatives_count INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Roadmap milestones indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_user_id ON roadmap_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_status ON roadmap_milestones(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_target_date ON roadmap_milestones(target_date);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Products RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Product Variants RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product variants"
  ON product_variants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own product variants"
  ON product_variants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product variants"
  ON product_variants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product variants"
  ON product_variants FOR DELETE
  USING (auth.uid() = user_id);

-- Releases RLS
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own releases"
  ON releases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own releases"
  ON releases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own releases"
  ON releases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own releases"
  ON releases FOR DELETE
  USING (auth.uid() = user_id);

-- Deployments RLS
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deployments"
  ON deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deployments"
  ON deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments"
  ON deployments FOR UPDATE
  USING (auth.uid() = user_id);

-- Roadmap Initiatives RLS
ALTER TABLE roadmap_initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmap initiatives"
  ON roadmap_initiatives FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own roadmap initiatives"
  ON roadmap_initiatives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap initiatives"
  ON roadmap_initiatives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap initiatives"
  ON roadmap_initiatives FOR DELETE
  USING (auth.uid() = user_id);

-- Roadmap Milestones RLS
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmap milestones"
  ON roadmap_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own roadmap milestones"
  ON roadmap_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap milestones"
  ON roadmap_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap milestones"
  ON roadmap_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_initiatives_updated_at
  BEFORE UPDATE ON roadmap_initiatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmap_milestones_updated_at
  BEFORE UPDATE ON roadmap_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE releases;
ALTER PUBLICATION supabase_realtime ADD TABLE deployments;
ALTER PUBLICATION supabase_realtime ADD TABLE roadmap_initiatives;
ALTER PUBLICATION supabase_realtime ADD TABLE roadmap_milestones;
