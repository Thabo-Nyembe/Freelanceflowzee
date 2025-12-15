-- =============================================
-- BATCH 52: Assets, Orders & Performance
-- =============================================
-- Tables: digital_assets, asset_collections, orders, order_items, performance_reviews, performance_goals
-- =============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DIGITAL ASSETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS digital_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID,

  -- Basic Info
  asset_name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'brand'
    CHECK (category IN ('brand', 'design', 'code', 'templates', 'media', 'documents', 'other')),
  subcategory VARCHAR(100),

  -- File Details
  file_count INTEGER DEFAULT 1,
  total_size BIGINT DEFAULT 0,
  format VARCHAR(100),
  file_types TEXT[],

  -- Pricing & License
  license_type VARCHAR(50) DEFAULT 'premium'
    CHECK (license_type IN ('free', 'premium', 'commercial', 'mit', 'apache', 'gpl', 'proprietary', 'custom')),
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,

  -- Metrics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  estimated_value DECIMAL(12, 2) DEFAULT 0,

  -- Tags & Search
  tags TEXT[],
  keywords TEXT[],

  -- Storage
  storage_path TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ASSET COLLECTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS asset_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection Info
  collection_name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(50),

  -- Metrics
  asset_count INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Status
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Order Reference
  order_number VARCHAR(50) NOT NULL,
  order_reference VARCHAR(100),

  -- Customer Info
  customer_name VARCHAR(200),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_avatar TEXT,

  -- Order Details
  item_count INTEGER DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold')),
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial')),
  fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled'
    CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'returned')),

  -- Shipping
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(200),
  tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Shipping Address
  shipping_address_line1 VARCHAR(300),
  shipping_address_line2 VARCHAR(300),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100),

  -- Billing Address
  billing_address_line1 VARCHAR(300),
  billing_address_line2 VARCHAR(300),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100),

  -- Payment
  payment_method VARCHAR(50),
  payment_transaction_id VARCHAR(200),
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Product Info
  product_id VARCHAR(100),
  product_name VARCHAR(300) NOT NULL,
  product_sku VARCHAR(100),
  product_image TEXT,

  -- Pricing
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Fulfillment
  fulfilled_quantity INTEGER DEFAULT 0,
  fulfillment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),

  -- Options/Variants
  variant_id VARCHAR(100),
  variant_name VARCHAR(200),
  options JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- PERFORMANCE REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Employee Info
  employee_id VARCHAR(100),
  employee_name VARCHAR(200) NOT NULL,
  employee_email VARCHAR(255),
  employee_position VARCHAR(200),
  employee_department VARCHAR(200),
  employee_avatar TEXT,

  -- Reviewer Info
  reviewer_id VARCHAR(100),
  reviewer_name VARCHAR(200),
  reviewer_email VARCHAR(255),
  reviewer_position VARCHAR(200),

  -- Review Details
  review_period VARCHAR(50),
  review_year INTEGER,
  review_quarter VARCHAR(10)
    CHECK (review_quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  review_type VARCHAR(50) DEFAULT 'annual'
    CHECK (review_type IN ('annual', 'quarterly', 'probation', 'promotion', 'mid_year', 'project_based')),

  -- Scores
  overall_score DECIMAL(5, 2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  performance_score DECIMAL(5, 2) DEFAULT 0,
  goals_score DECIMAL(5, 2) DEFAULT 0,
  competency_score DECIMAL(5, 2) DEFAULT 0,
  behavior_score DECIMAL(5, 2) DEFAULT 0,

  -- Goals
  goals_set INTEGER DEFAULT 0,
  goals_achieved INTEGER DEFAULT 0,
  goals_in_progress INTEGER DEFAULT 0,
  goals_missed INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'completed', 'rejected')),

  -- Feedback
  manager_feedback TEXT,
  employee_feedback TEXT,
  peer_feedback TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  recommendations TEXT,

  -- Dates
  review_date TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  effective_date TIMESTAMP WITH TIME ZONE,

  -- Rating (for simplified display)
  rating VARCHAR(20)
    CHECK (rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory')),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- PERFORMANCE GOALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES performance_reviews(id) ON DELETE SET NULL,

  -- Goal Info
  goal_title VARCHAR(300) NOT NULL,
  goal_description TEXT,
  goal_category VARCHAR(50) DEFAULT 'performance'
    CHECK (goal_category IN ('performance', 'learning', 'career', 'project', 'behavioral', 'team', 'personal')),

  -- Assignment
  assigned_to_id VARCHAR(100),
  assigned_to_name VARCHAR(200),
  assigned_to_email VARCHAR(255),
  assigned_by_id VARCHAR(100),
  assigned_by_name VARCHAR(200),

  -- Metrics
  target_value DECIMAL(12, 2),
  current_value DECIMAL(12, 2) DEFAULT 0,
  target_unit VARCHAR(50),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Priority & Weight
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  weight DECIMAL(5, 2) DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'on_track', 'at_risk', 'completed', 'missed', 'cancelled')),

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Period
  review_period VARCHAR(50),
  review_year INTEGER,
  review_quarter VARCHAR(10),

  -- Notes
  notes TEXT,
  blockers TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES
-- =============================================

-- Digital Assets Indexes
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_collection_id ON digital_assets(collection_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_category ON digital_assets(category);
CREATE INDEX IF NOT EXISTS idx_digital_assets_status ON digital_assets(status);
CREATE INDEX IF NOT EXISTS idx_digital_assets_featured ON digital_assets(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_digital_assets_created_at ON digital_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_assets_deleted_at ON digital_assets(deleted_at) WHERE deleted_at IS NULL;

-- Asset Collections Indexes
CREATE INDEX IF NOT EXISTS idx_asset_collections_user_id ON asset_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_collections_deleted_at ON asset_collections(deleted_at) WHERE deleted_at IS NULL;

-- Orders Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at) WHERE deleted_at IS NULL;

-- Order Items Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_user_id ON order_items(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_deleted_at ON order_items(deleted_at) WHERE deleted_at IS NULL;

-- Performance Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_performance_reviews_user_id ON performance_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_period ON performance_reviews(review_year, review_quarter);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_score ON performance_reviews(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_created_at ON performance_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_deleted_at ON performance_reviews(deleted_at) WHERE deleted_at IS NULL;

-- Performance Goals Indexes
CREATE INDEX IF NOT EXISTS idx_performance_goals_user_id ON performance_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_review_id ON performance_goals(review_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_status ON performance_goals(status);
CREATE INDEX IF NOT EXISTS idx_performance_goals_assigned_to ON performance_goals(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_due_date ON performance_goals(due_date);
CREATE INDEX IF NOT EXISTS idx_performance_goals_deleted_at ON performance_goals(deleted_at) WHERE deleted_at IS NULL;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;

-- Digital Assets Policies
CREATE POLICY "Users can view their own and public assets" ON digital_assets
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own assets" ON digital_assets
  FOR ALL USING (user_id = auth.uid());

-- Asset Collections Policies
CREATE POLICY "Users can view their own and public collections" ON asset_collections
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own collections" ON asset_collections
  FOR ALL USING (user_id = auth.uid());

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own orders" ON orders
  FOR ALL USING (user_id = auth.uid());

-- Order Items Policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own order items" ON order_items
  FOR ALL USING (user_id = auth.uid());

-- Performance Reviews Policies
CREATE POLICY "Users can view their own reviews" ON performance_reviews
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own reviews" ON performance_reviews
  FOR ALL USING (user_id = auth.uid());

-- Performance Goals Policies
CREATE POLICY "Users can view their own goals" ON performance_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own goals" ON performance_goals
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_digital_assets_updated_at ON digital_assets;
CREATE TRIGGER update_digital_assets_updated_at
  BEFORE UPDATE ON digital_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_collections_updated_at ON asset_collections;
CREATE TRIGGER update_asset_collections_updated_at
  BEFORE UPDATE ON asset_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_performance_reviews_updated_at ON performance_reviews;
CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_performance_goals_updated_at ON performance_goals;
CREATE TRIGGER update_performance_goals_updated_at
  BEFORE UPDATE ON performance_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE digital_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE asset_collections;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_goals;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE digital_assets IS 'Digital assets for brand, design, and code resources';
COMMENT ON TABLE asset_collections IS 'Collections/folders for organizing digital assets';
COMMENT ON TABLE orders IS 'E-commerce orders with customer and shipping details';
COMMENT ON TABLE order_items IS 'Individual line items within orders';
COMMENT ON TABLE performance_reviews IS 'Employee performance reviews with scores and feedback';
COMMENT ON TABLE performance_goals IS 'Individual goals linked to performance reviews';
