-- =====================================================
-- DYNAMIC CONTENT SYSTEM
-- Tables for marketing, announcements, metrics, and activity feeds
-- =====================================================

-- Marketing content table
CREATE TABLE IF NOT EXISTS marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business metrics table (for dashboard KPIs)
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_key TEXT UNIQUE NOT NULL,
  current_value NUMERIC NOT NULL,
  previous_value NUMERIC,
  unit TEXT DEFAULT 'number',
  trend TEXT,
  change_percentage NUMERIC,
  category TEXT DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed table for users
CREATE TABLE IF NOT EXISTS user_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform stats (real-time platform statistics)
CREATE TABLE IF NOT EXISTS platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key TEXT UNIQUE NOT NULL,
  stat_value NUMERIC NOT NULL,
  stat_label TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT 'blue',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketing_content_slug ON marketing_content(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_content_category ON marketing_content(category);
CREATE INDEX IF NOT EXISTS idx_business_metrics_key ON business_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_platform_stats_key ON platform_stats(stat_key);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_user ON user_activity_feed(user_id, created_at DESC);
