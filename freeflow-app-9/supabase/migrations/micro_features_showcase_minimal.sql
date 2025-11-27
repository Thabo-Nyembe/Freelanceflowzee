-- Minimal Micro Features Showcase Schema
-- UI micro-interactions and component demonstrations tracking

-- ENUMS
DROP TYPE IF EXISTS micro_feature_category CASCADE;
DROP TYPE IF EXISTS interaction_type CASCADE;
DROP TYPE IF EXISTS demo_status CASCADE;

CREATE TYPE micro_feature_category AS ENUM ('animations', 'buttons', 'tooltips', 'forms', 'loading', 'keyboard', 'cards', 'navigation', 'feedback');
CREATE TYPE interaction_type AS ENUM ('click', 'hover', 'scroll', 'keyboard', 'drag', 'focus', 'blur', 'touch');
CREATE TYPE demo_status AS ENUM ('active', 'inactive', 'archived', 'beta', 'stable');

-- TABLES
DROP TABLE IF EXISTS micro_feature_analytics CASCADE;
DROP TABLE IF EXISTS micro_feature_interactions CASCADE;
DROP TABLE IF EXISTS micro_feature_favorites CASCADE;
DROP TABLE IF EXISTS micro_feature_demonstrations CASCADE;
DROP TABLE IF EXISTS micro_features CASCADE;

CREATE TABLE micro_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category micro_feature_category NOT NULL,
  component_name TEXT NOT NULL,
  demo_code TEXT,
  preview_url TEXT,
  status demo_status NOT NULL DEFAULT 'stable',

  -- Metrics
  view_count INTEGER NOT NULL DEFAULT 0,
  demo_count INTEGER NOT NULL DEFAULT 0,
  interaction_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,

  -- Configuration
  config JSONB DEFAULT '{}'::JSONB,
  supported_interactions interaction_type[] DEFAULT ARRAY[]::interaction_type[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Flags
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_interactive BOOLEAN NOT NULL DEFAULT true,

  -- Documentation
  documentation_url TEXT,
  code_sandbox_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE micro_feature_demonstrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES micro_features(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Demo Details
  demo_title TEXT NOT NULL,
  demo_description TEXT,
  interaction_type interaction_type NOT NULL,
  duration_ms INTEGER,

  -- Performance Metrics
  load_time_ms INTEGER,
  fps INTEGER,
  smooth BOOLEAN NOT NULL DEFAULT true,

  -- Context
  device_type TEXT,
  browser TEXT,
  screen_size TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE micro_feature_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES micro_features(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_id)
);

CREATE TABLE micro_feature_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES micro_features(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Interaction Details
  interaction_type interaction_type NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Context
  position_x INTEGER,
  position_y INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,

  -- Performance
  response_time_ms INTEGER,

  -- Session
  session_id TEXT,
  page_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE micro_feature_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES micro_features(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Daily Metrics
  views INTEGER NOT NULL DEFAULT 0,
  demos INTEGER NOT NULL DEFAULT 0,
  interactions INTEGER NOT NULL DEFAULT 0,
  favorites INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,

  -- Performance Metrics
  avg_load_time_ms INTEGER,
  avg_response_time_ms INTEGER,
  avg_fps INTEGER,
  smooth_percentage DECIMAL(5, 2),

  -- Engagement
  avg_duration_ms INTEGER,
  bounce_rate DECIMAL(5, 2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(feature_id, date)
);

-- INDEXES
CREATE INDEX idx_micro_features_user_id ON micro_features(user_id);
CREATE INDEX idx_micro_features_category ON micro_features(category);
CREATE INDEX idx_micro_features_status ON micro_features(status);
CREATE INDEX idx_micro_features_view_count ON micro_features(view_count DESC);
CREATE INDEX idx_micro_features_demo_count ON micro_features(demo_count DESC);
CREATE INDEX idx_micro_features_is_featured ON micro_features(is_featured);
CREATE INDEX idx_micro_features_tags ON micro_features USING GIN(tags);
CREATE INDEX idx_micro_feature_demonstrations_feature_id ON micro_feature_demonstrations(feature_id);
CREATE INDEX idx_micro_feature_demonstrations_user_id ON micro_feature_demonstrations(user_id);
CREATE INDEX idx_micro_feature_demonstrations_interaction_type ON micro_feature_demonstrations(interaction_type);
CREATE INDEX idx_micro_feature_demonstrations_created_at ON micro_feature_demonstrations(created_at DESC);
CREATE INDEX idx_micro_feature_favorites_user_id ON micro_feature_favorites(user_id);
CREATE INDEX idx_micro_feature_favorites_feature_id ON micro_feature_favorites(feature_id);
CREATE INDEX idx_micro_feature_interactions_feature_id ON micro_feature_interactions(feature_id);
CREATE INDEX idx_micro_feature_interactions_user_id ON micro_feature_interactions(user_id);
CREATE INDEX idx_micro_feature_interactions_interaction_type ON micro_feature_interactions(interaction_type);
CREATE INDEX idx_micro_feature_interactions_triggered_at ON micro_feature_interactions(triggered_at DESC);
CREATE INDEX idx_micro_feature_analytics_feature_id ON micro_feature_analytics(feature_id);
CREATE INDEX idx_micro_feature_analytics_date ON micro_feature_analytics(date DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_micro_features_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_micro_features_updated_at BEFORE UPDATE ON micro_features FOR EACH ROW EXECUTE FUNCTION update_micro_features_updated_at();
CREATE TRIGGER trigger_micro_feature_analytics_updated_at BEFORE UPDATE ON micro_feature_analytics FOR EACH ROW EXECUTE FUNCTION update_micro_features_updated_at();

CREATE OR REPLACE FUNCTION increment_micro_feature_views() RETURNS TRIGGER AS $$
BEGIN
  UPDATE micro_features SET view_count = view_count + 1 WHERE id = NEW.feature_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_micro_feature_demos() RETURNS TRIGGER AS $$
BEGIN
  UPDATE micro_features SET demo_count = demo_count + 1 WHERE id = NEW.feature_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_micro_feature_demos AFTER INSERT ON micro_feature_demonstrations FOR EACH ROW EXECUTE FUNCTION increment_micro_feature_demos();

CREATE OR REPLACE FUNCTION increment_micro_feature_interactions() RETURNS TRIGGER AS $$
BEGIN
  UPDATE micro_features SET interaction_count = interaction_count + 1 WHERE id = NEW.feature_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_micro_feature_interactions AFTER INSERT ON micro_feature_interactions FOR EACH ROW EXECUTE FUNCTION increment_micro_feature_interactions();

CREATE OR REPLACE FUNCTION update_micro_feature_favorite_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE micro_features
  SET favorite_count = (
    SELECT COUNT(*) FROM micro_feature_favorites WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id)
  )
  WHERE id = COALESCE(NEW.feature_id, OLD.feature_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_micro_feature_favorite_count_insert AFTER INSERT ON micro_feature_favorites FOR EACH ROW EXECUTE FUNCTION update_micro_feature_favorite_count();
CREATE TRIGGER trigger_update_micro_feature_favorite_count_delete AFTER DELETE ON micro_feature_favorites FOR EACH ROW EXECUTE FUNCTION update_micro_feature_favorite_count();
