-- Batch 67: Support, Help Center, Shipping
-- Tables for support-v2, help-center-v2, shipping-v2

-- =====================================================
-- SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_code VARCHAR(20) UNIQUE DEFAULT ('TICK-' || LPAD(nextval('support_tickets_seq')::text, 6, '0')),

  -- Ticket Info
  subject VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- general, technical, billing, feature, bug, other
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, pending, resolved, closed

  -- Customer Info
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,

  -- Channel
  channel VARCHAR(30) DEFAULT 'email', -- email, chat, phone, self_service, social

  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  first_response_at TIMESTAMPTZ,

  -- SLA
  sla_due_at TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,

  -- Satisfaction
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_feedback TEXT,

  -- Tags & Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for ticket codes
CREATE SEQUENCE IF NOT EXISTS support_tickets_seq START 1;

-- =====================================================
-- SUPPORT TICKET REPLIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Reply Info
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  reply_type VARCHAR(20) DEFAULT 'reply', -- reply, note, system

  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(255),
  author_type VARCHAR(20) DEFAULT 'agent', -- agent, customer, system

  -- Attachments
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUPPORT CHANNELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel Info
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL, -- email, chat, phone, self_service
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance

  -- Stats
  total_tickets INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,

  -- Configuration
  config JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HELP ARTICLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_code VARCHAR(20) UNIQUE DEFAULT ('ART-' || LPAD(nextval('help_articles_seq')::text, 6, '0')),

  -- Article Info
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  content TEXT,
  excerpt TEXT,
  category VARCHAR(50) DEFAULT 'guide', -- guide, tutorial, faq, video, troubleshooting

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMPTZ,

  -- Metrics
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 3,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Media
  featured_image VARCHAR(500),
  attachments JSONB DEFAULT '[]',

  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(255),

  -- Organization
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES help_articles(id),

  -- Tags & Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for article codes
CREATE SEQUENCE IF NOT EXISTS help_articles_seq START 1;

-- =====================================================
-- HELP CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),

  -- Organization
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES help_categories(id),

  -- Stats
  article_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, hidden

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HELP ARTICLE FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS help_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES help_articles(id) ON DELETE CASCADE,

  -- Feedback Info
  helpful BOOLEAN NOT NULL,
  feedback TEXT,

  -- User (optional)
  user_id UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SHIPMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_code VARCHAR(20) UNIQUE DEFAULT ('SHP-' || LPAD(nextval('shipments_seq')::text, 6, '0')),

  -- Tracking
  tracking_number VARCHAR(100),
  order_id VARCHAR(100),

  -- Status
  status VARCHAR(30) DEFAULT 'pending', -- pending, processing, shipped, in_transit, delivered, failed, returned, cancelled

  -- Shipping Method & Carrier
  method VARCHAR(30) DEFAULT 'standard', -- standard, express, overnight, international, freight
  carrier VARCHAR(50), -- fedex, ups, usps, dhl, amazon, local, other

  -- Origin
  origin_address TEXT,
  origin_city VARCHAR(100),
  origin_state VARCHAR(100),
  origin_country VARCHAR(100) DEFAULT 'US',
  origin_postal VARCHAR(20),

  -- Destination
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  destination_address TEXT,
  destination_city VARCHAR(100),
  destination_state VARCHAR(100),
  destination_country VARCHAR(100) DEFAULT 'US',
  destination_postal VARCHAR(20),

  -- Package Details
  item_count INTEGER DEFAULT 1,
  weight_lbs DECIMAL(10,2) DEFAULT 0,
  dimensions_length DECIMAL(10,2),
  dimensions_width DECIMAL(10,2),
  dimensions_height DECIMAL(10,2),

  -- Costs
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  insurance_value DECIMAL(10,2) DEFAULT 0,
  declared_value DECIMAL(10,2) DEFAULT 0,

  -- Dates
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,

  -- Options
  priority BOOLEAN DEFAULT false,
  signature_required BOOLEAN DEFAULT false,
  insurance_enabled BOOLEAN DEFAULT false,

  -- Labels
  label_url VARCHAR(500),
  label_created_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  delivery_instructions TEXT,

  -- Tags & Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for shipment codes
CREATE SEQUENCE IF NOT EXISTS shipments_seq START 1;

-- =====================================================
-- SHIPMENT TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,

  -- Event Info
  status VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),

  -- Timestamp
  event_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SHIPPING CARRIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shipping_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Carrier Info
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  logo_url VARCHAR(500),

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive

  -- Stats
  total_shipments INTEGER DEFAULT 0,
  on_time_rate DECIMAL(5,2) DEFAULT 100,
  avg_delivery_days DECIMAL(5,2) DEFAULT 0,

  -- API Config
  api_key_encrypted VARCHAR(500),
  api_config JSONB DEFAULT '{}',

  -- Features
  supports_tracking BOOLEAN DEFAULT true,
  supports_labels BOOLEAN DEFAULT true,
  supports_rates BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Support Tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_channel ON support_tickets(channel);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_deleted ON support_tickets(deleted_at) WHERE deleted_at IS NULL;

-- Support Ticket Replies indexes
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket ON support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_created ON support_ticket_replies(created_at DESC);

-- Support Channels indexes
CREATE INDEX IF NOT EXISTS idx_support_channels_user ON support_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_support_channels_type ON support_channels(type);

-- Help Articles indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_user ON help_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_status ON help_articles(status);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);
CREATE INDEX IF NOT EXISTS idx_help_articles_views ON help_articles(views DESC);
CREATE INDEX IF NOT EXISTS idx_help_articles_deleted ON help_articles(deleted_at) WHERE deleted_at IS NULL;

-- Help Categories indexes
CREATE INDEX IF NOT EXISTS idx_help_categories_user ON help_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_help_categories_parent ON help_categories(parent_id);

-- Help Article Feedback indexes
CREATE INDEX IF NOT EXISTS idx_help_article_feedback_article ON help_article_feedback(article_id);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_user ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_method ON shipments(method);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_created ON shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_deleted ON shipments(deleted_at) WHERE deleted_at IS NULL;

-- Shipment Tracking indexes
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment ON shipment_tracking(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_event ON shipment_tracking(event_at DESC);

-- Shipping Carriers indexes
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_user ON shipping_carriers(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_carriers_code ON shipping_carriers(code);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_carriers ENABLE ROW LEVEL SECURITY;

-- Support Tickets policies
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tickets" ON support_tickets FOR DELETE USING (auth.uid() = user_id);

-- Support Ticket Replies policies
CREATE POLICY "Users can view ticket replies" ON support_ticket_replies FOR SELECT USING (
  EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_ticket_replies.ticket_id AND support_tickets.user_id = auth.uid())
);
CREATE POLICY "Users can create ticket replies" ON support_ticket_replies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_ticket_replies.ticket_id AND support_tickets.user_id = auth.uid())
);

-- Support Channels policies
CREATE POLICY "Users can manage own channels" ON support_channels FOR ALL USING (auth.uid() = user_id);

-- Help Articles policies
CREATE POLICY "Users can view own articles" ON help_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own articles" ON help_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON help_articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON help_articles FOR DELETE USING (auth.uid() = user_id);

-- Help Categories policies
CREATE POLICY "Users can manage own categories" ON help_categories FOR ALL USING (auth.uid() = user_id);

-- Help Article Feedback policies
CREATE POLICY "Anyone can submit feedback" ON help_article_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Article owners can view feedback" ON help_article_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM help_articles WHERE help_articles.id = help_article_feedback.article_id AND help_articles.user_id = auth.uid())
);

-- Shipments policies
CREATE POLICY "Users can view own shipments" ON shipments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own shipments" ON shipments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shipments" ON shipments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shipments" ON shipments FOR DELETE USING (auth.uid() = user_id);

-- Shipment Tracking policies
CREATE POLICY "Users can view own shipment tracking" ON shipment_tracking FOR SELECT USING (
  EXISTS (SELECT 1 FROM shipments WHERE shipments.id = shipment_tracking.shipment_id AND shipments.user_id = auth.uid())
);
CREATE POLICY "Users can add tracking events" ON shipment_tracking FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM shipments WHERE shipments.id = shipment_tracking.shipment_id AND shipments.user_id = auth.uid())
);

-- Shipping Carriers policies
CREATE POLICY "Users can manage own carriers" ON shipping_carriers FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_channels_updated_at BEFORE UPDATE ON support_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at BEFORE UPDATE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_categories_updated_at BEFORE UPDATE ON help_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_carriers_updated_at BEFORE UPDATE ON shipping_carriers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update article helpful counts
CREATE OR REPLACE FUNCTION update_article_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.helpful THEN
    UPDATE help_articles SET helpful_count = helpful_count + 1 WHERE id = NEW.article_id;
  ELSE
    UPDATE help_articles SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.article_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_helpful_on_feedback AFTER INSERT ON help_article_feedback
  FOR EACH ROW EXECUTE FUNCTION update_article_helpful_counts();

-- Update category article count
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE help_categories
    SET article_count = (SELECT COUNT(*) FROM help_articles WHERE category = NEW.category AND deleted_at IS NULL)
    WHERE name = NEW.category;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE help_categories
    SET article_count = (SELECT COUNT(*) FROM help_articles WHERE category = NEW.category AND deleted_at IS NULL)
    WHERE name = NEW.category OR name = OLD.category;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE help_categories
    SET article_count = (SELECT COUNT(*) FROM help_articles WHERE category = OLD.category AND deleted_at IS NULL)
    WHERE name = OLD.category;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_count_on_article_change AFTER INSERT OR UPDATE OR DELETE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION update_category_article_count();

-- Track first response time
CREATE OR REPLACE FUNCTION track_ticket_first_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_type = 'agent' THEN
    UPDATE support_tickets
    SET first_response_at = COALESCE(first_response_at, NOW())
    WHERE id = NEW.ticket_id AND first_response_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_first_response_on_reply AFTER INSERT ON support_ticket_replies
  FOR EACH ROW EXECUTE FUNCTION track_ticket_first_response();

-- Update carrier stats
CREATE OR REPLACE FUNCTION update_carrier_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shipping_carriers
  SET
    total_shipments = (SELECT COUNT(*) FROM shipments WHERE carrier = NEW.carrier AND deleted_at IS NULL),
    on_time_rate = (
      SELECT COALESCE(
        ROUND(
          COUNT(*) FILTER (WHERE actual_delivery <= estimated_delivery)::DECIMAL /
          NULLIF(COUNT(*) FILTER (WHERE actual_delivery IS NOT NULL), 0) * 100,
          2
        ),
        100
      )
      FROM shipments WHERE carrier = NEW.carrier AND deleted_at IS NULL
    )
  WHERE code = NEW.carrier;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carrier_stats_on_shipment AFTER INSERT OR UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_carrier_stats();
