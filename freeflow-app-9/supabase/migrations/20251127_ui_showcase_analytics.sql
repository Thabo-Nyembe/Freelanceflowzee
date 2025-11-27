-- UI Showcase Analytics
-- Lightweight tracking for component interactions and page visits

-- TABLES
DROP TABLE IF EXISTS ui_component_interactions CASCADE;
DROP TABLE IF EXISTS ui_showcase_visits CASCADE;

CREATE TABLE ui_showcase_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Visit Info
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,

  -- Browser Info
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,

  -- Engagement
  duration_seconds INTEGER,
  components_viewed TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ui_component_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES ui_showcase_visits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Component Info
  component_name TEXT NOT NULL,
  component_category TEXT CHECK (component_category IN (
    'button', 'card', 'animation', 'input', 'layout', 'navigation', 'feedback', 'other'
  )),

  -- Interaction
  interaction_type TEXT CHECK (interaction_type IN (
    'view', 'hover', 'click', 'focus', 'scroll'
  )) NOT NULL DEFAULT 'view',

  -- Timing
  interacted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_ui_showcase_visits_user ON ui_showcase_visits(user_id);
CREATE INDEX idx_ui_showcase_visits_visited ON ui_showcase_visits(visited_at DESC);

CREATE INDEX idx_ui_component_interactions_visit ON ui_component_interactions(visit_id);
CREATE INDEX idx_ui_component_interactions_user ON ui_component_interactions(user_id);
CREATE INDEX idx_ui_component_interactions_component ON ui_component_interactions(component_name);
CREATE INDEX idx_ui_component_interactions_category ON ui_component_interactions(component_category);
CREATE INDEX idx_ui_component_interactions_type ON ui_component_interactions(interaction_type);
CREATE INDEX idx_ui_component_interactions_time ON ui_component_interactions(interacted_at DESC);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_popular_components(
  p_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  component_name TEXT,
  interaction_count BIGINT,
  unique_users BIGINT,
  avg_duration_ms BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.component_name,
    COUNT(*)::BIGINT as interaction_count,
    COUNT(DISTINCT ci.user_id)::BIGINT as unique_users,
    ROUND(AVG(ci.duration_ms))::BIGINT as avg_duration_ms
  FROM ui_component_interactions ci
  WHERE ci.interacted_at >= now() - (p_days || ' days')::INTERVAL
  GROUP BY ci.component_name
  ORDER BY interaction_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_showcase_stats(
  p_days INTEGER DEFAULT 7
) RETURNS TABLE (
  total_visits BIGINT,
  unique_visitors BIGINT,
  total_interactions BIGINT,
  avg_session_duration BIGINT,
  most_viewed_component TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM ui_showcase_visits
     WHERE visited_at >= now() - (p_days || ' days')::INTERVAL),

    (SELECT COUNT(DISTINCT user_id)::BIGINT FROM ui_showcase_visits
     WHERE visited_at >= now() - (p_days || ' days')::INTERVAL),

    (SELECT COUNT(*)::BIGINT FROM ui_component_interactions
     WHERE interacted_at >= now() - (p_days || ' days')::INTERVAL),

    (SELECT ROUND(AVG(duration_seconds))::BIGINT FROM ui_showcase_visits
     WHERE visited_at >= now() - (p_days || ' days')::INTERVAL
       AND duration_seconds IS NOT NULL),

    (SELECT component_name FROM ui_component_interactions
     WHERE interacted_at >= now() - (p_days || ' days')::INTERVAL
     GROUP BY component_name
     ORDER BY COUNT(*) DESC
     LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE ui_showcase_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_component_interactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view analytics (for transparency)
CREATE POLICY ui_showcase_visits_select_all ON ui_showcase_visits
  FOR SELECT USING (true);

CREATE POLICY ui_component_interactions_select_all ON ui_component_interactions
  FOR SELECT USING (true);

-- Authenticated users can create visits/interactions
CREATE POLICY ui_showcase_visits_create_authenticated ON ui_showcase_visits
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.uid() IS NULL);

CREATE POLICY ui_component_interactions_create_authenticated ON ui_component_interactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.uid() IS NULL);
