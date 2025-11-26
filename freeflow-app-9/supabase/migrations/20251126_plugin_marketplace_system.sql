-- ========================================
-- PLUGIN MARKETPLACE SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete plugin marketplace with:
-- - Plugin discovery and installation
-- - Author profiles with verification
-- - Ratings and reviews system
-- - Multiple pricing models
-- - Version management
-- - Installation analytics
-- - Featured and trending plugins
--
-- Tables: 9
-- Functions: 9
-- Indexes: 48
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE plugin_category AS ENUM (
  'productivity',
  'creative',
  'analytics',
  'communication',
  'integration',
  'automation',
  'ai',
  'security',
  'finance',
  'marketing'
);

CREATE TYPE pricing_type AS ENUM (
  'free',
  'one-time',
  'subscription',
  'freemium'
);

CREATE TYPE plugin_status AS ENUM (
  'published',
  'beta',
  'coming-soon',
  'deprecated'
);

-- ========================================
-- TABLES
-- ========================================

-- Plugin Authors
CREATE TABLE plugin_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  website TEXT,
  total_plugins INTEGER NOT NULL DEFAULT 0,
  total_installs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plugins
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  category plugin_category NOT NULL,
  icon TEXT,
  author_id UUID NOT NULL REFERENCES plugin_authors(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  active_installs INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pricing_type pricing_type NOT NULL DEFAULT 'free',
  status plugin_status NOT NULL DEFAULT 'published',
  file_size BIGINT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  changelog JSONB DEFAULT '[]',
  download_url TEXT,
  documentation_url TEXT,
  support_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installed Plugins
CREATE TABLE installed_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installed_version TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  last_used TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, user_id)
);

-- Plugin Reviews
CREATE TABLE plugin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  not_helpful INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, user_id)
);

-- Plugin Downloads
CREATE TABLE plugin_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plugin Analytics
CREATE TABLE plugin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  installs INTEGER NOT NULL DEFAULT 0,
  uninstalls INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, date)
);

-- Plugin Versions
CREATE TABLE plugin_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changes TEXT[] DEFAULT '{}',
  file_size BIGINT NOT NULL DEFAULT 0,
  download_url TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, version)
);

-- Plugin Collections
CREATE TABLE plugin_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  plugin_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plugin Wishlists
CREATE TABLE plugin_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plugin_id)
);

-- ========================================
-- INDEXES
-- ========================================

-- Plugin Authors Indexes
CREATE INDEX idx_plugin_authors_user_id ON plugin_authors(user_id);
CREATE INDEX idx_plugin_authors_verified ON plugin_authors(verified);
CREATE INDEX idx_plugin_authors_name ON plugin_authors USING GIN(name gin_trgm_ops);

-- Plugins Indexes
CREATE INDEX idx_plugins_author_id ON plugins(author_id);
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_pricing_type ON plugins(pricing_type);
CREATE INDEX idx_plugins_status ON plugins(status);
CREATE INDEX idx_plugins_rating ON plugins(rating DESC);
CREATE INDEX idx_plugins_install_count ON plugins(install_count DESC);
CREATE INDEX idx_plugins_is_featured ON plugins(is_featured);
CREATE INDEX idx_plugins_is_trending ON plugins(is_trending);
CREATE INDEX idx_plugins_is_popular ON plugins(is_popular);
CREATE INDEX idx_plugins_is_verified ON plugins(is_verified);
CREATE INDEX idx_plugins_last_updated ON plugins(last_updated DESC);
CREATE INDEX idx_plugins_name ON plugins USING GIN(name gin_trgm_ops);
CREATE INDEX idx_plugins_description ON plugins USING GIN(description gin_trgm_ops);
CREATE INDEX idx_plugins_tags ON plugins USING GIN(tags);
CREATE INDEX idx_plugins_slug ON plugins(slug);

-- Installed Plugins Indexes
CREATE INDEX idx_installed_plugins_plugin_id ON installed_plugins(plugin_id);
CREATE INDEX idx_installed_plugins_user_id ON installed_plugins(user_id);
CREATE INDEX idx_installed_plugins_is_active ON installed_plugins(is_active);
CREATE INDEX idx_installed_plugins_installed_at ON installed_plugins(installed_at DESC);
CREATE INDEX idx_installed_plugins_last_used ON installed_plugins(last_used DESC);

-- Plugin Reviews Indexes
CREATE INDEX idx_plugin_reviews_plugin_id ON plugin_reviews(plugin_id);
CREATE INDEX idx_plugin_reviews_user_id ON plugin_reviews(user_id);
CREATE INDEX idx_plugin_reviews_rating ON plugin_reviews(rating DESC);
CREATE INDEX idx_plugin_reviews_verified ON plugin_reviews(verified);
CREATE INDEX idx_plugin_reviews_created_at ON plugin_reviews(created_at DESC);

-- Plugin Downloads Indexes
CREATE INDEX idx_plugin_downloads_plugin_id ON plugin_downloads(plugin_id);
CREATE INDEX idx_plugin_downloads_user_id ON plugin_downloads(user_id);
CREATE INDEX idx_plugin_downloads_downloaded_at ON plugin_downloads(downloaded_at DESC);

-- Plugin Analytics Indexes
CREATE INDEX idx_plugin_analytics_plugin_id ON plugin_analytics(plugin_id);
CREATE INDEX idx_plugin_analytics_date ON plugin_analytics(date DESC);
CREATE INDEX idx_plugin_analytics_plugin_date ON plugin_analytics(plugin_id, date DESC);

-- Plugin Versions Indexes
CREATE INDEX idx_plugin_versions_plugin_id ON plugin_versions(plugin_id);
CREATE INDEX idx_plugin_versions_version ON plugin_versions(plugin_id, version);
CREATE INDEX idx_plugin_versions_is_latest ON plugin_versions(is_latest);
CREATE INDEX idx_plugin_versions_release_date ON plugin_versions(release_date DESC);

-- Plugin Collections Indexes
CREATE INDEX idx_plugin_collections_user_id ON plugin_collections(user_id);
CREATE INDEX idx_plugin_collections_is_public ON plugin_collections(is_public);

-- Plugin Wishlists Indexes
CREATE INDEX idx_plugin_wishlists_user_id ON plugin_wishlists(user_id);
CREATE INDEX idx_plugin_wishlists_plugin_id ON plugin_wishlists(plugin_id);
CREATE INDEX idx_plugin_wishlists_added_at ON plugin_wishlists(added_at DESC);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_authors_updated_at BEFORE UPDATE ON plugin_authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installed_plugins_updated_at BEFORE UPDATE ON installed_plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_reviews_updated_at BEFORE UPDATE ON plugin_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_analytics_updated_at BEFORE UPDATE ON plugin_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_collections_updated_at BEFORE UPDATE ON plugin_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update plugin rating
CREATE OR REPLACE FUNCTION update_plugin_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plugins
  SET rating = (
    SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0)
    FROM plugin_reviews
    WHERE plugin_id = COALESCE(NEW.plugin_id, OLD.plugin_id)
  ),
  review_count = (
    SELECT COUNT(*)
    FROM plugin_reviews
    WHERE plugin_id = COALESCE(NEW.plugin_id, OLD.plugin_id)
  )
  WHERE id = COALESCE(NEW.plugin_id, OLD.plugin_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON plugin_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_plugin_rating();

-- Update install counts
CREATE OR REPLACE FUNCTION update_install_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE plugins
    SET install_count = install_count + 1,
        active_installs = active_installs + 1
    WHERE id = NEW.plugin_id;

    UPDATE plugin_authors
    SET total_installs = total_installs + 1
    WHERE id = (SELECT author_id FROM plugins WHERE id = NEW.plugin_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE plugins
    SET active_installs = GREATEST(active_installs - 1, 0)
    WHERE id = OLD.plugin_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active != NEW.is_active THEN
      UPDATE plugins
      SET active_installs = active_installs + CASE WHEN NEW.is_active THEN 1 ELSE -1 END
      WHERE id = NEW.plugin_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_install_counts
  AFTER INSERT OR UPDATE OR DELETE ON installed_plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_install_counts();

-- Update author stats
CREATE OR REPLACE FUNCTION update_author_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plugin_authors
  SET total_plugins = (
    SELECT COUNT(*)
    FROM plugins
    WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
  )
  WHERE id = COALESCE(NEW.author_id, OLD.author_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_plugin_count
  AFTER INSERT OR DELETE ON plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_author_stats();

-- Update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO plugin_analytics (plugin_id, date, installs)
    VALUES (NEW.plugin_id, CURRENT_DATE, 1)
    ON CONFLICT (plugin_id, date)
    DO UPDATE SET installs = plugin_analytics.installs + 1;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO plugin_analytics (plugin_id, date, uninstalls)
    VALUES (OLD.plugin_id, CURRENT_DATE, 1)
    ON CONFLICT (plugin_id, date)
    DO UPDATE SET uninstalls = plugin_analytics.uninstalls + 1;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_daily_installs_uninstalls
  AFTER INSERT OR DELETE ON installed_plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_analytics();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Search plugins
CREATE OR REPLACE FUNCTION search_plugins(
  p_search_term TEXT,
  p_category plugin_category DEFAULT NULL,
  p_pricing_type pricing_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF plugins AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM plugins
  WHERE status = 'published'
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_category IS NULL OR category = p_category)
    AND (p_pricing_type IS NULL OR pricing_type = p_pricing_type)
  ORDER BY
    CASE WHEN is_featured THEN 0 ELSE 1 END,
    install_count DESC,
    rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get plugin stats
CREATE OR REPLACE FUNCTION get_plugin_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalPlugins', COUNT(*),
      'totalInstalls', COALESCE(SUM(install_count), 0),
      'totalReviews', COALESCE(SUM(review_count), 0),
      'averageRating', COALESCE(AVG(rating), 0),
      'featured', COUNT(*) FILTER (WHERE is_featured = true),
      'trending', COUNT(*) FILTER (WHERE is_trending = true),
      'verified', COUNT(*) FILTER (WHERE is_verified = true),
      'byCategory', (
        SELECT json_object_agg(category, count)
        FROM (
          SELECT category, COUNT(*) as count
          FROM plugins
          WHERE status = 'published'
          GROUP BY category
        ) t
      ),
      'byPricing', (
        SELECT json_object_agg(pricing_type, count)
        FROM (
          SELECT pricing_type, COUNT(*) as count
          FROM plugins
          WHERE status = 'published'
          GROUP BY pricing_type
        ) t
      )
    )
    FROM plugins
    WHERE status = 'published'
  );
END;
$$ LANGUAGE plpgsql;

-- Install plugin
CREATE OR REPLACE FUNCTION install_plugin(
  p_plugin_id UUID,
  p_user_id UUID,
  p_version TEXT
)
RETURNS JSON AS $$
DECLARE
  v_plugin plugins;
BEGIN
  -- Get plugin
  SELECT * INTO v_plugin FROM plugins WHERE id = p_plugin_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plugin not found');
  END IF;

  IF v_plugin.status = 'deprecated' THEN
    RETURN json_build_object('success', false, 'error', 'Plugin is deprecated');
  END IF;

  IF v_plugin.status = 'coming-soon' THEN
    RETURN json_build_object('success', false, 'error', 'Plugin is not yet available');
  END IF;

  -- Install plugin
  INSERT INTO installed_plugins (plugin_id, user_id, installed_version)
  VALUES (p_plugin_id, p_user_id, p_version)
  ON CONFLICT (plugin_id, user_id)
  DO UPDATE SET
    installed_version = p_version,
    is_active = true;

  -- Record download
  INSERT INTO plugin_downloads (plugin_id, user_id, version)
  VALUES (p_plugin_id, p_user_id, p_version);

  RETURN json_build_object('success', true, 'plugin', v_plugin.name);
END;
$$ LANGUAGE plpgsql;

-- Uninstall plugin
CREATE OR REPLACE FUNCTION uninstall_plugin(
  p_plugin_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
BEGIN
  DELETE FROM installed_plugins
  WHERE plugin_id = p_plugin_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plugin not installed');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Get featured plugins
CREATE OR REPLACE FUNCTION get_featured_plugins(p_limit INTEGER DEFAULT 10)
RETURNS SETOF plugins AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM plugins
  WHERE is_featured = true AND status = 'published'
  ORDER BY install_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get trending plugins
CREATE OR REPLACE FUNCTION get_trending_plugins(p_limit INTEGER DEFAULT 10)
RETURNS SETOF plugins AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM plugins
  WHERE is_trending = true AND status = 'published'
  ORDER BY install_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get plugin analytics
CREATE OR REPLACE FUNCTION get_plugin_analytics_summary(p_plugin_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalViews', COALESCE(SUM(views), 0),
      'totalInstalls', COALESCE(SUM(installs), 0),
      'totalUninstalls', COALESCE(SUM(uninstalls), 0),
      'averageActiveUsers', COALESCE(AVG(active_users), 0),
      'totalRevenue', COALESCE(SUM(revenue), 0),
      'dailyData', (
        SELECT json_agg(
          json_build_object(
            'date', date,
            'views', views,
            'installs', installs,
            'uninstalls', uninstalls,
            'activeUsers', active_users,
            'revenue', revenue
          ) ORDER BY date DESC
        )
        FROM plugin_analytics
        WHERE plugin_id = p_plugin_id
          AND date >= CURRENT_DATE - p_days
      )
    )
    FROM plugin_analytics
    WHERE plugin_id = p_plugin_id
      AND date >= CURRENT_DATE - p_days
  );
END;
$$ LANGUAGE plpgsql;

-- Submit review
CREATE OR REPLACE FUNCTION submit_review(
  p_plugin_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_title TEXT,
  p_comment TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Check if user has installed the plugin
  IF NOT EXISTS (
    SELECT 1 FROM installed_plugins
    WHERE plugin_id = p_plugin_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You must install the plugin before reviewing');
  END IF;

  INSERT INTO plugin_reviews (plugin_id, user_id, rating, title, comment, verified)
  VALUES (p_plugin_id, p_user_id, p_rating, p_title, p_comment, true)
  ON CONFLICT (plugin_id, user_id)
  DO UPDATE SET
    rating = p_rating,
    title = p_title,
    comment = p_comment,
    updated_at = NOW();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Mark review helpful
CREATE OR REPLACE FUNCTION mark_review_helpful(
  p_review_id UUID,
  p_helpful BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF p_helpful THEN
    UPDATE plugin_reviews
    SET helpful = helpful + 1
    WHERE id = p_review_id;
  ELSE
    UPDATE plugin_reviews
    SET not_helpful = not_helpful + 1
    WHERE id = p_review_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE plugin_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_wishlists ENABLE ROW LEVEL SECURITY;

-- Plugin Authors Policies
CREATE POLICY plugin_authors_select ON plugin_authors FOR SELECT USING (true);
CREATE POLICY plugin_authors_insert ON plugin_authors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_authors_update ON plugin_authors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plugin_authors_delete ON plugin_authors FOR DELETE USING (auth.uid() = user_id);

-- Plugins Policies
CREATE POLICY plugins_select ON plugins FOR SELECT USING (true);
CREATE POLICY plugins_insert ON plugins FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM plugin_authors WHERE id = plugins.author_id AND user_id = auth.uid()));
CREATE POLICY plugins_update ON plugins FOR UPDATE
  USING (EXISTS (SELECT 1 FROM plugin_authors WHERE id = plugins.author_id AND user_id = auth.uid()));
CREATE POLICY plugins_delete ON plugins FOR DELETE
  USING (EXISTS (SELECT 1 FROM plugin_authors WHERE id = plugins.author_id AND user_id = auth.uid()));

-- Installed Plugins Policies
CREATE POLICY installed_plugins_select ON installed_plugins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY installed_plugins_insert ON installed_plugins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY installed_plugins_update ON installed_plugins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY installed_plugins_delete ON installed_plugins FOR DELETE USING (auth.uid() = user_id);

-- Plugin Reviews Policies
CREATE POLICY plugin_reviews_select ON plugin_reviews FOR SELECT USING (true);
CREATE POLICY plugin_reviews_insert ON plugin_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_reviews_update ON plugin_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plugin_reviews_delete ON plugin_reviews FOR DELETE USING (auth.uid() = user_id);

-- Plugin Downloads Policies
CREATE POLICY plugin_downloads_select ON plugin_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plugin_downloads_insert ON plugin_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plugin Analytics Policies
CREATE POLICY plugin_analytics_select ON plugin_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM plugins p JOIN plugin_authors pa ON p.author_id = pa.id WHERE p.id = plugin_analytics.plugin_id AND pa.user_id = auth.uid()));

-- Plugin Versions Policies
CREATE POLICY plugin_versions_select ON plugin_versions FOR SELECT USING (true);
CREATE POLICY plugin_versions_insert ON plugin_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM plugins p JOIN plugin_authors pa ON p.author_id = pa.id WHERE p.id = plugin_versions.plugin_id AND pa.user_id = auth.uid()));

-- Plugin Collections Policies
CREATE POLICY plugin_collections_select ON plugin_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY plugin_collections_insert ON plugin_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_collections_update ON plugin_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plugin_collections_delete ON plugin_collections FOR DELETE USING (auth.uid() = user_id);

-- Plugin Wishlists Policies
CREATE POLICY plugin_wishlists_select ON plugin_wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plugin_wishlists_insert ON plugin_wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_wishlists_delete ON plugin_wishlists FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE plugin_authors IS 'Plugin authors with verification status';
COMMENT ON TABLE plugins IS 'Available plugins in the marketplace';
COMMENT ON TABLE installed_plugins IS 'User-installed plugins with settings';
COMMENT ON TABLE plugin_reviews IS 'User reviews and ratings for plugins';
COMMENT ON TABLE plugin_downloads IS 'Plugin download tracking';
COMMENT ON TABLE plugin_analytics IS 'Daily plugin analytics and metrics';
COMMENT ON TABLE plugin_versions IS 'Plugin version history';
COMMENT ON TABLE plugin_collections IS 'User-created plugin collections';
COMMENT ON TABLE plugin_wishlists IS 'User plugin wishlists';
