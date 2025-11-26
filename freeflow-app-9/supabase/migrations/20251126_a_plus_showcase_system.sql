-- ========================================
-- A-PLUS SHOWCASE SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete component showcase platform with:
-- - Component library with code examples
-- - Multiple categories and difficulty levels
-- - Code syntax highlighting support
-- - Downloads and views tracking
-- - Favorites and collections
-- - Reviews and ratings
-- - Version management
--
-- Tables: 8
-- Functions: 7
-- Indexes: 40
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE component_category AS ENUM (
  'ui',
  'layout',
  'animation',
  'data-display',
  'navigation',
  'feedback',
  'forms',
  'utilities'
);

CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

CREATE TYPE code_language AS ENUM (
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'css',
  'html',
  'json'
);

-- ========================================
-- TABLES
-- ========================================

-- Component Showcases
CREATE TABLE component_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category component_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  code TEXT NOT NULL,
  preview TEXT,
  language code_language NOT NULL,
  tags TEXT[] DEFAULT '{}',
  popularity INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',
  dependencies TEXT[] DEFAULT '{}',
  license TEXT NOT NULL DEFAULT 'MIT',
  repository TEXT,
  documentation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Examples
CREATE TABLE component_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  preview TEXT,
  language code_language NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Versions
CREATE TABLE component_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changes TEXT[] DEFAULT '{}',
  code TEXT NOT NULL,
  breaking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component_id, version)
);

-- Component Favorites
CREATE TABLE component_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, component_id)
);

-- Component Reviews
CREATE TABLE component_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component_id, user_id)
);

-- Component Downloads
CREATE TABLE component_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Collections
CREATE TABLE component_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  component_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Analytics
CREATE TABLE component_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  favorites INTEGER NOT NULL DEFAULT 0,
  copies INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component_id, date)
);

-- ========================================
-- INDEXES
-- ========================================

-- Component Showcases Indexes
CREATE INDEX idx_component_showcases_user_id ON component_showcases(user_id);
CREATE INDEX idx_component_showcases_category ON component_showcases(category);
CREATE INDEX idx_component_showcases_difficulty ON component_showcases(difficulty);
CREATE INDEX idx_component_showcases_language ON component_showcases(language);
CREATE INDEX idx_component_showcases_popularity ON component_showcases(popularity DESC);
CREATE INDEX idx_component_showcases_downloads ON component_showcases(downloads DESC);
CREATE INDEX idx_component_showcases_views ON component_showcases(views DESC);
CREATE INDEX idx_component_showcases_is_premium ON component_showcases(is_premium);
CREATE INDEX idx_component_showcases_is_verified ON component_showcases(is_verified);
CREATE INDEX idx_component_showcases_created_at ON component_showcases(created_at DESC);
CREATE INDEX idx_component_showcases_updated_at ON component_showcases(updated_at DESC);
CREATE INDEX idx_component_showcases_name ON component_showcases USING GIN(name gin_trgm_ops);
CREATE INDEX idx_component_showcases_description ON component_showcases USING GIN(description gin_trgm_ops);
CREATE INDEX idx_component_showcases_tags ON component_showcases USING GIN(tags);

-- Component Examples Indexes
CREATE INDEX idx_component_examples_component_id ON component_examples(component_id);
CREATE INDEX idx_component_examples_order_index ON component_examples(component_id, order_index);

-- Component Versions Indexes
CREATE INDEX idx_component_versions_component_id ON component_versions(component_id);
CREATE INDEX idx_component_versions_version ON component_versions(component_id, version);
CREATE INDEX idx_component_versions_release_date ON component_versions(release_date DESC);

-- Component Favorites Indexes
CREATE INDEX idx_component_favorites_user_id ON component_favorites(user_id);
CREATE INDEX idx_component_favorites_component_id ON component_favorites(component_id);
CREATE INDEX idx_component_favorites_created_at ON component_favorites(created_at DESC);

-- Component Reviews Indexes
CREATE INDEX idx_component_reviews_component_id ON component_reviews(component_id);
CREATE INDEX idx_component_reviews_user_id ON component_reviews(user_id);
CREATE INDEX idx_component_reviews_rating ON component_reviews(rating DESC);
CREATE INDEX idx_component_reviews_created_at ON component_reviews(created_at DESC);

-- Component Downloads Indexes
CREATE INDEX idx_component_downloads_component_id ON component_downloads(component_id);
CREATE INDEX idx_component_downloads_user_id ON component_downloads(user_id);
CREATE INDEX idx_component_downloads_downloaded_at ON component_downloads(downloaded_at DESC);

-- Component Collections Indexes
CREATE INDEX idx_component_collections_user_id ON component_collections(user_id);
CREATE INDEX idx_component_collections_is_public ON component_collections(is_public);

-- Component Analytics Indexes
CREATE INDEX idx_component_analytics_component_id ON component_analytics(component_id);
CREATE INDEX idx_component_analytics_date ON component_analytics(date DESC);
CREATE INDEX idx_component_analytics_component_date ON component_analytics(component_id, date DESC);

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

CREATE TRIGGER update_component_showcases_updated_at BEFORE UPDATE ON component_showcases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_examples_updated_at BEFORE UPDATE ON component_examples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_reviews_updated_at BEFORE UPDATE ON component_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_collections_updated_at BEFORE UPDATE ON component_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_analytics_updated_at BEFORE UPDATE ON component_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE component_showcases
  SET downloads = downloads + 1
  WHERE id = NEW.component_id;

  -- Update daily analytics
  INSERT INTO component_analytics (component_id, date, downloads)
  VALUES (NEW.component_id, CURRENT_DATE, 1)
  ON CONFLICT (component_id, date)
  DO UPDATE SET downloads = component_analytics.downloads + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_download_count
  AFTER INSERT ON component_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

-- Update popularity on favorites
CREATE OR REPLACE FUNCTION update_popularity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE component_showcases
    SET popularity = popularity + 10
    WHERE id = NEW.component_id;

    -- Update daily analytics
    INSERT INTO component_analytics (component_id, date, favorites)
    VALUES (NEW.component_id, CURRENT_DATE, 1)
    ON CONFLICT (component_id, date)
    DO UPDATE SET favorites = component_analytics.favorites + 1;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE component_showcases
    SET popularity = GREATEST(popularity - 10, 0)
    WHERE id = OLD.component_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_popularity_on_favorite
  AFTER INSERT OR DELETE ON component_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_popularity();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Search components
CREATE OR REPLACE FUNCTION search_components(
  p_search_term TEXT,
  p_category component_category DEFAULT NULL,
  p_difficulty difficulty_level DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF component_showcases AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM component_showcases
  WHERE (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_category IS NULL OR category = p_category)
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
  ORDER BY popularity DESC, downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get component stats
CREATE OR REPLACE FUNCTION get_component_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalComponents', COUNT(*),
      'totalDownloads', COALESCE(SUM(downloads), 0),
      'totalViews', COALESCE(SUM(views), 0),
      'premiumComponents', COUNT(*) FILTER (WHERE is_premium = true),
      'verifiedComponents', COUNT(*) FILTER (WHERE is_verified = true),
      'averagePopularity', COALESCE(AVG(popularity), 0),
      'byCategory', (
        SELECT json_object_agg(category, count)
        FROM (
          SELECT category, COUNT(*) as count
          FROM component_showcases
          GROUP BY category
        ) t
      ),
      'byDifficulty', (
        SELECT json_object_agg(difficulty, count)
        FROM (
          SELECT difficulty, COUNT(*) as count
          FROM component_showcases
          GROUP BY difficulty
        ) t
      )
    )
    FROM component_showcases
  );
END;
$$ LANGUAGE plpgsql;

-- Record component view
CREATE OR REPLACE FUNCTION record_component_view(
  p_component_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE component_showcases
  SET views = views + 1
  WHERE id = p_component_id;

  -- Update daily analytics
  INSERT INTO component_analytics (component_id, date, views)
  VALUES (p_component_id, CURRENT_DATE, 1)
  ON CONFLICT (component_id, date)
  DO UPDATE SET views = component_analytics.views + 1;
END;
$$ LANGUAGE plpgsql;

-- Toggle favorite
CREATE OR REPLACE FUNCTION toggle_component_favorite(
  p_user_id UUID,
  p_component_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM component_favorites
    WHERE user_id = p_user_id AND component_id = p_component_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM component_favorites
    WHERE user_id = p_user_id AND component_id = p_component_id;
    RETURN json_build_object('favorited', false);
  ELSE
    INSERT INTO component_favorites (user_id, component_id)
    VALUES (p_user_id, p_component_id);
    RETURN json_build_object('favorited', true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Get trending components
CREATE OR REPLACE FUNCTION get_trending_components(
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF component_showcases AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM component_showcases c
  WHERE c.created_at >= CURRENT_DATE - p_days
  ORDER BY c.popularity DESC, c.downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get user favorites
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS SETOF component_showcases AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM component_showcases c
  JOIN component_favorites f ON c.id = f.component_id
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create component version
CREATE OR REPLACE FUNCTION create_component_version(
  p_component_id UUID,
  p_version TEXT,
  p_changes TEXT[],
  p_breaking BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Get current code
  SELECT code INTO v_code
  FROM component_showcases
  WHERE id = p_component_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Component not found');
  END IF;

  -- Create version
  INSERT INTO component_versions (component_id, version, changes, code, breaking)
  VALUES (p_component_id, p_version, p_changes, v_code, p_breaking);

  -- Update component version
  UPDATE component_showcases
  SET version = p_version
  WHERE id = p_component_id;

  RETURN json_build_object('success', true, 'version', p_version);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE component_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_analytics ENABLE ROW LEVEL SECURITY;

-- Component Showcases Policies
CREATE POLICY component_showcases_select ON component_showcases FOR SELECT USING (true);
CREATE POLICY component_showcases_insert ON component_showcases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_showcases_update ON component_showcases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY component_showcases_delete ON component_showcases FOR DELETE USING (auth.uid() = user_id);

-- Component Examples Policies
CREATE POLICY component_examples_select ON component_examples FOR SELECT USING (true);
CREATE POLICY component_examples_insert ON component_examples FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_examples.component_id AND user_id = auth.uid()));
CREATE POLICY component_examples_update ON component_examples FOR UPDATE
  USING (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_examples.component_id AND user_id = auth.uid()));
CREATE POLICY component_examples_delete ON component_examples FOR DELETE
  USING (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_examples.component_id AND user_id = auth.uid()));

-- Component Versions Policies
CREATE POLICY component_versions_select ON component_versions FOR SELECT USING (true);
CREATE POLICY component_versions_insert ON component_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_versions.component_id AND user_id = auth.uid()));

-- Component Favorites Policies
CREATE POLICY component_favorites_select ON component_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY component_favorites_insert ON component_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_favorites_delete ON component_favorites FOR DELETE USING (auth.uid() = user_id);

-- Component Reviews Policies
CREATE POLICY component_reviews_select ON component_reviews FOR SELECT USING (true);
CREATE POLICY component_reviews_insert ON component_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_reviews_update ON component_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY component_reviews_delete ON component_reviews FOR DELETE USING (auth.uid() = user_id);

-- Component Downloads Policies
CREATE POLICY component_downloads_select ON component_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY component_downloads_insert ON component_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Component Collections Policies
CREATE POLICY component_collections_select ON component_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY component_collections_insert ON component_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_collections_update ON component_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY component_collections_delete ON component_collections FOR DELETE USING (auth.uid() = user_id);

-- Component Analytics Policies
CREATE POLICY component_analytics_select ON component_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_analytics.component_id AND user_id = auth.uid()));

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE component_showcases IS 'Component showcase library with code examples';
COMMENT ON TABLE component_examples IS 'Multiple examples for each component';
COMMENT ON TABLE component_versions IS 'Component version history';
COMMENT ON TABLE component_favorites IS 'User favorite components';
COMMENT ON TABLE component_reviews IS 'Component reviews and ratings';
COMMENT ON TABLE component_downloads IS 'Component download tracking';
COMMENT ON TABLE component_collections IS 'User-created component collections';
COMMENT ON TABLE component_analytics IS 'Daily component analytics';
