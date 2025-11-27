-- Minimal A-Plus Showcase Schema
-- Component showcase platform with code examples and analytics

-- ENUMS
DROP TYPE IF EXISTS component_category CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS code_language CASCADE;

CREATE TYPE component_category AS ENUM ('ui', 'layout', 'animation', 'data-display', 'navigation', 'feedback', 'forms', 'utilities');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE code_language AS ENUM ('typescript', 'javascript', 'tsx', 'jsx', 'css', 'html', 'json');

-- TABLES
DROP TABLE IF EXISTS component_analytics CASCADE;
DROP TABLE IF EXISTS component_collections CASCADE;
DROP TABLE IF EXISTS component_downloads CASCADE;
DROP TABLE IF EXISTS component_reviews CASCADE;
DROP TABLE IF EXISTS component_favorites CASCADE;
DROP TABLE IF EXISTS component_versions CASCADE;
DROP TABLE IF EXISTS component_examples CASCADE;
DROP TABLE IF EXISTS component_showcases CASCADE;

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
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  popularity INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  license TEXT NOT NULL DEFAULT 'MIT',
  repository TEXT,
  documentation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE component_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  preview TEXT,
  language code_language NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE component_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  changes TEXT[] DEFAULT ARRAY[]::TEXT[],
  code TEXT NOT NULL,
  breaking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(component_id, version)
);

CREATE TABLE component_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, component_id)
);

CREATE TABLE component_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(component_id, user_id)
);

CREATE TABLE component_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE component_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  component_ids UUID[] DEFAULT ARRAY[]::UUID[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE component_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  favorites INTEGER NOT NULL DEFAULT 0,
  copies INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(component_id, date)
);

-- INDEXES
CREATE INDEX idx_component_showcases_user_id ON component_showcases(user_id);
CREATE INDEX idx_component_showcases_category ON component_showcases(category);
CREATE INDEX idx_component_showcases_difficulty ON component_showcases(difficulty);
CREATE INDEX idx_component_showcases_language ON component_showcases(language);
CREATE INDEX idx_component_showcases_popularity ON component_showcases(popularity DESC);
CREATE INDEX idx_component_showcases_downloads ON component_showcases(downloads DESC);
CREATE INDEX idx_component_showcases_views ON component_showcases(views DESC);
CREATE INDEX idx_component_showcases_is_premium ON component_showcases(is_premium);
CREATE INDEX idx_component_showcases_tags ON component_showcases USING GIN(tags);
CREATE INDEX idx_component_examples_component_id ON component_examples(component_id);
CREATE INDEX idx_component_examples_order_index ON component_examples(component_id, order_index);
CREATE INDEX idx_component_versions_component_id ON component_versions(component_id);
CREATE INDEX idx_component_versions_release_date ON component_versions(release_date DESC);
CREATE INDEX idx_component_favorites_user_id ON component_favorites(user_id);
CREATE INDEX idx_component_favorites_component_id ON component_favorites(component_id);
CREATE INDEX idx_component_reviews_component_id ON component_reviews(component_id);
CREATE INDEX idx_component_reviews_user_id ON component_reviews(user_id);
CREATE INDEX idx_component_reviews_rating ON component_reviews(rating);
CREATE INDEX idx_component_downloads_component_id ON component_downloads(component_id);
CREATE INDEX idx_component_downloads_user_id ON component_downloads(user_id);
CREATE INDEX idx_component_downloads_downloaded_at ON component_downloads(downloaded_at DESC);
CREATE INDEX idx_component_collections_user_id ON component_collections(user_id);
CREATE INDEX idx_component_collections_is_public ON component_collections(is_public);
CREATE INDEX idx_component_analytics_component_id ON component_analytics(component_id);
CREATE INDEX idx_component_analytics_date ON component_analytics(date DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_component_showcases_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_component_showcases_updated_at BEFORE UPDATE ON component_showcases FOR EACH ROW EXECUTE FUNCTION update_component_showcases_updated_at();
CREATE TRIGGER trigger_component_examples_updated_at BEFORE UPDATE ON component_examples FOR EACH ROW EXECUTE FUNCTION update_component_showcases_updated_at();
CREATE TRIGGER trigger_component_reviews_updated_at BEFORE UPDATE ON component_reviews FOR EACH ROW EXECUTE FUNCTION update_component_showcases_updated_at();
CREATE TRIGGER trigger_component_collections_updated_at BEFORE UPDATE ON component_collections FOR EACH ROW EXECUTE FUNCTION update_component_showcases_updated_at();
CREATE TRIGGER trigger_component_analytics_updated_at BEFORE UPDATE ON component_analytics FOR EACH ROW EXECUTE FUNCTION update_component_showcases_updated_at();

CREATE OR REPLACE FUNCTION increment_component_views() RETURNS TRIGGER AS $$
BEGIN
  UPDATE component_showcases SET views = views + 1 WHERE id = NEW.component_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_component_downloads() RETURNS TRIGGER AS $$
BEGIN
  UPDATE component_showcases SET downloads = downloads + 1 WHERE id = NEW.component_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_component_downloads AFTER INSERT ON component_downloads FOR EACH ROW EXECUTE FUNCTION increment_component_downloads();

CREATE OR REPLACE FUNCTION update_component_popularity() RETURNS TRIGGER AS $$
BEGIN
  UPDATE component_showcases
  SET popularity = (
    SELECT COUNT(*) FROM component_favorites WHERE component_id = NEW.component_id
  )
  WHERE id = NEW.component_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_component_popularity_insert AFTER INSERT ON component_favorites FOR EACH ROW EXECUTE FUNCTION update_component_popularity();
CREATE TRIGGER trigger_update_component_popularity_delete AFTER DELETE ON component_favorites FOR EACH ROW EXECUTE FUNCTION update_component_popularity();
