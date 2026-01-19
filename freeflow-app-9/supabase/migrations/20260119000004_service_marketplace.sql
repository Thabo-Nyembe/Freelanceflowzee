/**
 * Service Marketplace - FreeFlow A+++ Implementation
 * Full Fiverr-style gig marketplace with categories, packages, orders
 */

-- Service categories (hierarchical)
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  image_url TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO service_categories (name, slug, icon, description, sort_order) VALUES
  ('Graphics & Design', 'graphics-design', '🎨', 'Logo design, branding, illustrations, and more', 1),
  ('Digital Marketing', 'digital-marketing', '📈', 'Social media, SEO, content marketing', 2),
  ('Writing & Translation', 'writing-translation', '✍️', 'Articles, copywriting, translation services', 3),
  ('Video & Animation', 'video-animation', '🎬', 'Video editing, animation, motion graphics', 4),
  ('Music & Audio', 'music-audio', '🎵', 'Music production, voiceover, audio editing', 5),
  ('Programming & Tech', 'programming-tech', '💻', 'Web development, mobile apps, software', 6),
  ('Business', 'business', '💼', 'Business plans, market research, consulting', 7),
  ('Data', 'data', '📊', 'Data analysis, visualization, machine learning', 8),
  ('Photography', 'photography', '📸', 'Product photography, editing, retouching', 9),
  ('AI Services', 'ai-services', '🤖', 'AI model training, prompt engineering, automation', 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Graphics & Design
INSERT INTO service_categories (parent_id, name, slug, description, sort_order)
SELECT id, 'Logo Design', 'logo-design', 'Custom logo creation', 1 FROM service_categories WHERE slug = 'graphics-design'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (parent_id, name, slug, description, sort_order)
SELECT id, 'Brand Style Guides', 'brand-style-guides', 'Complete brand identity packages', 2 FROM service_categories WHERE slug = 'graphics-design'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (parent_id, name, slug, description, sort_order)
SELECT id, 'Illustration', 'illustration', 'Digital and hand-drawn illustrations', 3 FROM service_categories WHERE slug = 'graphics-design'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO service_categories (parent_id, name, slug, description, sort_order)
SELECT id, 'Web & App Design', 'web-app-design', 'UI/UX design for web and mobile', 4 FROM service_categories WHERE slug = 'graphics-design'
ON CONFLICT (slug) DO NOTHING;

-- Seller profiles (extended user profile for marketplace)
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Display info
  display_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  profile_image TEXT,
  cover_image TEXT,

  -- Professional details
  skills TEXT[] DEFAULT '{}',
  languages JSONB DEFAULT '[]', -- [{"language": "English", "level": "native"}]
  certifications JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',

  -- Seller stats
  level TEXT DEFAULT 'new' CHECK (level IN ('new', 'level_1', 'level_2', 'top_rated', 'pro')),
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  orders_in_progress INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 100,

  -- Earnings
  total_earnings DECIMAL(12,2) DEFAULT 0,
  pending_earnings DECIMAL(12,2) DEFAULT 0,
  available_earnings DECIMAL(12,2) DEFAULT 0,
  withdrawn_earnings DECIMAL(12,2) DEFAULT 0,

  -- Settings
  vacation_mode BOOLEAN DEFAULT false,
  vacation_message TEXT,
  available_hours_per_week INTEGER DEFAULT 40,
  timezone TEXT DEFAULT 'UTC',

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_documents JSONB DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service listings (gigs)
CREATE TABLE IF NOT EXISTS service_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_profile_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL,
  category_id UUID REFERENCES service_categories(id),
  subcategory_id UUID REFERENCES service_categories(id),
  tags TEXT[] DEFAULT '{}',

  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Packages (Basic, Standard, Premium)
  packages JSONB NOT NULL DEFAULT '[]',
  /*
    [
      {
        "name": "Basic",
        "description": "Perfect for small projects",
        "price": 50,
        "delivery_days": 3,
        "revisions": 1,
        "features": ["1 concept", "Source file", "Commercial use"]
      },
      {
        "name": "Standard",
        "description": "Most popular option",
        "price": 100,
        "delivery_days": 5,
        "revisions": 3,
        "features": ["3 concepts", "Source file", "Commercial use", "Social media kit"]
      },
      {
        "name": "Premium",
        "description": "Complete package",
        "price": 200,
        "delivery_days": 7,
        "revisions": "unlimited",
        "features": ["5 concepts", "Source file", "Commercial use", "Social media kit", "Stationery design", "Brand guide"]
      }
    ]
  */

  -- Extras (add-ons)
  extras JSONB DEFAULT '[]',
  /*
    [
      { "id": "extra_1", "title": "Extra fast delivery (24h)", "price": 50, "delivery_days_modifier": -2 },
      { "id": "extra_2", "title": "Additional revision", "price": 15 },
      { "id": "extra_3", "title": "Source files", "price": 25 }
    ]
  */

  -- Requirements (questions for buyer)
  requirements JSONB DEFAULT '[]',
  /*
    [
      { "question": "What is your brand name?", "type": "text", "required": true },
      { "question": "Do you have any reference images?", "type": "file", "required": false },
      { "question": "Preferred color scheme?", "type": "multiple_choice", "options": ["Warm", "Cool", "Neutral"], "required": true }
    ]
  */

  -- FAQs
  faqs JSONB DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'rejected', 'archived')),
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,

  -- Stats
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  orders_cancelled INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- Settings
  max_concurrent_orders INTEGER DEFAULT 5,
  min_order_value DECIMAL(12,2),

  -- Search vector
  search_vector TSVECTOR,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate slug trigger
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  new_slug := base_slug;

  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM service_listings WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_listing_slug
  BEFORE INSERT OR UPDATE OF title ON service_listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_listing_slug();

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_search_vector
  BEFORE INSERT OR UPDATE OF title, description, tags ON service_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_search_vector();

-- Service orders
CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  listing_id UUID REFERENCES service_listings(id),
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),

  -- Package selected
  package_name TEXT NOT NULL,
  package_price DECIMAL(12,2) NOT NULL,
  package_details JSONB NOT NULL,

  -- Extras selected
  extras JSONB DEFAULT '[]',
  extras_total DECIMAL(12,2) DEFAULT 0,

  -- Quantity (for gigs that allow multiple)
  quantity INTEGER DEFAULT 1,

  -- Totals
  subtotal DECIMAL(12,2) NOT NULL,
  service_fee DECIMAL(12,2) DEFAULT 0,
  service_fee_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% default
  processing_fee DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Timeline
  delivery_days INTEGER NOT NULL,
  original_due_date TIMESTAMPTZ NOT NULL,
  current_due_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Requirements (buyer's answers)
  requirements_submitted BOOLEAN DEFAULT false,
  requirements_answers JSONB DEFAULT '{}',
  requirements_files JSONB DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',              -- Awaiting requirements
    'requirements_submitted', -- Requirements received
    'in_progress',          -- Work started
    'delivered',            -- Delivery submitted
    'revision_requested',   -- Buyer requested revision
    'completed',            -- Accepted and closed
    'cancelled',            -- Cancelled
    'disputed',             -- In dispute
    'refunded'              -- Refunded
  )),

  -- Revisions
  revisions_allowed INTEGER NOT NULL,
  revisions_used INTEGER DEFAULT 0,

  -- Extensions
  extension_requests JSONB DEFAULT '[]',

  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'processing', 'held', 'released', 'refunded', 'failed'
  )),
  payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,

  -- Cancellation
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES auth.users(id),

  -- Notes
  internal_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || UPPER(LEFT(MD5(NEW.id::text), 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON service_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Order messages (conversation)
CREATE TABLE IF NOT EXISTS order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),

  message TEXT,
  attachments JSONB DEFAULT '[]', -- [{"name": "file.pdf", "url": "...", "size": 1234}]

  -- Type
  message_type TEXT DEFAULT 'message' CHECK (message_type IN (
    'message', 'system', 'delivery', 'revision_request', 'offer', 'tip'
  )),

  -- For offer messages
  offer_amount DECIMAL(12,2),
  offer_status TEXT CHECK (offer_status IN ('pending', 'accepted', 'declined')),

  -- Read status
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order deliveries
CREATE TABLE IF NOT EXISTS order_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,

  message TEXT,
  files JSONB NOT NULL DEFAULT '[]', -- [{"name": "...", "url": "...", "size": 1234, "type": "image/png"}]

  delivery_number INTEGER NOT NULL, -- 1 for initial, 2+ for revisions
  is_revision BOOLEAN DEFAULT false,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revision_requested', 'expired')),

  -- Revision feedback
  revision_notes TEXT,
  revision_requested_at TIMESTAMPTZ,

  -- Auto-accept timer (3 days default)
  auto_accept_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES service_listings(id),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_user_id UUID REFERENCES auth.users(id),

  -- Type
  review_type TEXT NOT NULL CHECK (review_type IN ('buyer_to_seller', 'seller_to_buyer')),

  -- Ratings (1-5)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Review content
  review_text TEXT,

  -- Seller response
  seller_response TEXT,
  seller_responded_at TIMESTAMPTZ,

  -- Status
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved/favorite listings
CREATE TABLE IF NOT EXISTS saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES service_listings(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'Saved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Listing views (analytics)
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES service_listings(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  referrer TEXT,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_listings_category ON service_listings(category_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON service_listings(subcategory_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_user ON service_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON service_listings(seller_profile_id);
CREATE INDEX IF NOT EXISTS idx_listings_rating ON service_listings(average_rating DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_orders ON service_listings(orders_completed DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_search ON service_listings USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_listings_tags ON service_listings USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_listings_status ON service_listings(status);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON service_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON service_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing ON service_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON service_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_listing ON service_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON service_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON service_reviews(reviewed_user_id);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_level ON seller_profiles(level);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_rating ON seller_profiles(rating DESC);

-- Functions

-- Update listing stats on order completion
CREATE OR REPLACE FUNCTION update_listing_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE service_listings
    SET
      orders_completed = orders_completed + 1,
      updated_at = NOW()
    WHERE id = NEW.listing_id;

    -- Update seller profile
    UPDATE seller_profiles
    SET
      orders_completed = orders_completed + 1,
      orders_in_progress = GREATEST(0, orders_in_progress - 1),
      updated_at = NOW()
    WHERE user_id = NEW.seller_id;
  END IF;

  IF NEW.status = 'in_progress' AND OLD.status NOT IN ('in_progress', 'delivered', 'revision_requested') THEN
    UPDATE seller_profiles
    SET
      orders_in_progress = orders_in_progress + 1,
      updated_at = NOW()
    WHERE user_id = NEW.seller_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_stats
  AFTER UPDATE ON service_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_stats();

-- Update listing rating on review
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_listings
  SET
    average_rating = (
      SELECT COALESCE(AVG(overall_rating), 0)
      FROM service_reviews
      WHERE listing_id = NEW.listing_id
        AND review_type = 'buyer_to_seller'
        AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM service_reviews
      WHERE listing_id = NEW.listing_id
        AND review_type = 'buyer_to_seller'
        AND is_public = true
    ),
    updated_at = NOW()
  WHERE id = NEW.listing_id;

  -- Update seller profile rating
  UPDATE seller_profiles
  SET
    rating = (
      SELECT COALESCE(AVG(overall_rating), 0)
      FROM service_reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
        AND review_type = 'buyer_to_seller'
        AND is_public = true
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM service_reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
        AND review_type = 'buyer_to_seller'
        AND is_public = true
    ),
    updated_at = NOW()
  WHERE user_id = NEW.reviewed_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_rating
  AFTER INSERT OR UPDATE ON service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_rating();

-- Update impression count
CREATE OR REPLACE FUNCTION increment_listing_impressions(listing_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE service_listings
  SET impressions = impressions + 1
  WHERE id = ANY(listing_ids);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

-- Categories are public
CREATE POLICY "Categories are viewable by everyone"
  ON service_categories FOR SELECT
  USING (true);

-- Seller profiles
CREATE POLICY "Seller profiles are viewable by everyone"
  ON seller_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own seller profile"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their seller profile"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service listings
CREATE POLICY "Active listings are viewable by everyone"
  ON service_listings FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can manage their own listings"
  ON service_listings FOR ALL
  USING (auth.uid() = user_id);

-- Service orders
CREATE POLICY "Users can view orders they are part of"
  ON service_orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
  ON service_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Order participants can update"
  ON service_orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Order messages
CREATE POLICY "Order participants can view messages"
  ON order_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM service_orders
    WHERE id = order_messages.order_id
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  ));

CREATE POLICY "Order participants can send messages"
  ON order_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM service_orders
    WHERE id = order_messages.order_id
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  ));

-- Order deliveries
CREATE POLICY "Order participants can view deliveries"
  ON order_deliveries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM service_orders
    WHERE id = order_deliveries.order_id
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  ));

CREATE POLICY "Sellers can create deliveries"
  ON order_deliveries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM service_orders
    WHERE id = order_deliveries.order_id
    AND seller_id = auth.uid()
  ));

-- Reviews
CREATE POLICY "Public reviews are viewable by everyone"
  ON service_reviews FOR SELECT
  USING (is_public = true OR reviewer_id = auth.uid() OR reviewed_user_id = auth.uid());

CREATE POLICY "Users can create reviews for completed orders"
  ON service_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM service_orders
      WHERE id = service_reviews.order_id
      AND status = 'completed'
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Saved listings
CREATE POLICY "Users can manage their saved listings"
  ON saved_listings FOR ALL
  USING (auth.uid() = user_id);

-- Listing views
CREATE POLICY "Anyone can create views"
  ON listing_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Listing owners can view analytics"
  ON listing_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM service_listings
    WHERE id = listing_views.listing_id
    AND user_id = auth.uid()
  ));
