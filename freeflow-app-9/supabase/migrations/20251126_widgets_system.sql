-- =====================================================
-- WIDGETS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive widget management with dashboard customization,
-- templates, analytics, and real-time data visualization
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE widget_type AS ENUM (
  'metric',
  'chart',
  'table',
  'activity',
  'quick-actions',
  'calendar'
);

CREATE TYPE widget_size AS ENUM (
  'small',
  'medium',
  'large',
  'full'
);

CREATE TYPE widget_category AS ENUM (
  'analytics',
  'productivity',
  'finance',
  'social',
  'custom'
);

CREATE TYPE widget_status AS ENUM (
  'active',
  'inactive',
  'error',
  'loading'
);

CREATE TYPE chart_type AS ENUM (
  'line',
  'bar',
  'pie',
  'doughnut',
  'area',
  'scatter'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Widgets
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type widget_type NOT NULL,
  category widget_category NOT NULL,
  size widget_size NOT NULL DEFAULT 'medium',
  icon TEXT NOT NULL,
  description TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status widget_status NOT NULL DEFAULT 'active',
  data JSONB,
  last_refreshed TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Widget Templates
CREATE TABLE widget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type widget_type NOT NULL,
  category widget_category NOT NULL,
  size widget_size NOT NULL DEFAULT 'medium',
  icon TEXT NOT NULL,
  thumbnail TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dashboards
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  share_token TEXT UNIQUE,
  theme TEXT DEFAULT 'light',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Dashboard Widgets (junction table)
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dashboard_id, widget_id)
);

-- Widget Data (historical data storage)
CREATE TABLE widget_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status widget_status NOT NULL DEFAULT 'active',
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Widget Analytics
CREATE TABLE widget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Widget Stats (aggregated statistics)
CREATE TABLE widget_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_widgets INTEGER NOT NULL DEFAULT 0,
  active_widgets INTEGER NOT NULL DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  type_breakdown JSONB DEFAULT '{}'::jsonb,
  size_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  total_usage INTEGER NOT NULL DEFAULT 0,
  average_refresh_rate DECIMAL(10, 2),
  most_used_widget_id UUID REFERENCES widgets(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Widgets Indexes
CREATE INDEX idx_widgets_user_id ON widgets(user_id);
CREATE INDEX idx_widgets_type ON widgets(type);
CREATE INDEX idx_widgets_category ON widgets(category);
CREATE INDEX idx_widgets_size ON widgets(size);
CREATE INDEX idx_widgets_status ON widgets(status);
CREATE INDEX idx_widgets_is_visible ON widgets(is_visible);
CREATE INDEX idx_widgets_is_locked ON widgets(is_locked);
CREATE INDEX idx_widgets_usage_count ON widgets(usage_count DESC);
CREATE INDEX idx_widgets_last_refreshed ON widgets(last_refreshed DESC);
CREATE INDEX idx_widgets_name_search ON widgets USING GIN(to_tsvector('english', name));
CREATE INDEX idx_widgets_description_search ON widgets USING GIN(to_tsvector('english', description));
CREATE INDEX idx_widgets_config ON widgets USING GIN(config);
CREATE INDEX idx_widgets_data ON widgets USING GIN(data);
CREATE INDEX idx_widgets_created_at ON widgets(created_at DESC);

-- Widget Templates Indexes
CREATE INDEX idx_widget_templates_type ON widget_templates(type);
CREATE INDEX idx_widget_templates_category ON widget_templates(category);
CREATE INDEX idx_widget_templates_is_premium ON widget_templates(is_premium);
CREATE INDEX idx_widget_templates_is_public ON widget_templates(is_public);
CREATE INDEX idx_widget_templates_downloads ON widget_templates(downloads DESC);
CREATE INDEX idx_widget_templates_rating ON widget_templates(rating DESC);
CREATE INDEX idx_widget_templates_tags ON widget_templates USING GIN(tags);
CREATE INDEX idx_widget_templates_created_by ON widget_templates(created_by);
CREATE INDEX idx_widget_templates_name_search ON widget_templates USING GIN(to_tsvector('english', name));
CREATE INDEX idx_widget_templates_created_at ON widget_templates(created_at DESC);

-- Dashboards Indexes
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboards_is_default ON dashboards(is_default);
CREATE INDEX idx_dashboards_is_shared ON dashboards(is_shared);
CREATE INDEX idx_dashboards_share_token ON dashboards(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_dashboards_theme ON dashboards(theme);
CREATE INDEX idx_dashboards_name_search ON dashboards USING GIN(to_tsvector('english', name));
CREATE INDEX idx_dashboards_created_at ON dashboards(created_at DESC);

-- Dashboard Widgets Indexes
CREATE INDEX idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_dashboard_widgets_widget_id ON dashboard_widgets(widget_id);
CREATE INDEX idx_dashboard_widgets_order_index ON dashboard_widgets(order_index);
CREATE INDEX idx_dashboard_widgets_is_visible ON dashboard_widgets(is_visible);
CREATE INDEX idx_dashboard_widgets_created_at ON dashboard_widgets(created_at DESC);

-- Widget Data Indexes
CREATE INDEX idx_widget_data_widget_id ON widget_data(widget_id);
CREATE INDEX idx_widget_data_status ON widget_data(status);
CREATE INDEX idx_widget_data_timestamp ON widget_data(timestamp DESC);
CREATE INDEX idx_widget_data_data ON widget_data USING GIN(data);

-- Widget Analytics Indexes
CREATE INDEX idx_widget_analytics_user_id ON widget_analytics(user_id);
CREATE INDEX idx_widget_analytics_widget_id ON widget_analytics(widget_id);
CREATE INDEX idx_widget_analytics_dashboard_id ON widget_analytics(dashboard_id);
CREATE INDEX idx_widget_analytics_event_type ON widget_analytics(event_type);
CREATE INDEX idx_widget_analytics_timestamp ON widget_analytics(timestamp DESC);
CREATE INDEX idx_widget_analytics_event_data ON widget_analytics USING GIN(event_data);

-- Widget Stats Indexes
CREATE INDEX idx_widget_stats_user_id ON widget_stats(user_id);
CREATE INDEX idx_widget_stats_date ON widget_stats(date DESC);
CREATE INDEX idx_widget_stats_total_widgets ON widget_stats(total_widgets DESC);
CREATE INDEX idx_widget_stats_active_widgets ON widget_stats(active_widgets DESC);
CREATE INDEX idx_widget_stats_most_used_widget_id ON widget_stats(most_used_widget_id);
CREATE INDEX idx_widget_stats_created_at ON widget_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_widgets_updated_at
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_templates_updated_at
  BEFORE UPDATE ON widget_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_stats_updated_at
  BEFORE UPDATE ON widget_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track widget usage
CREATE OR REPLACE FUNCTION track_widget_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_refreshed IS DISTINCT FROM OLD.last_refreshed THEN
    NEW.usage_count = OLD.usage_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_widget_usage
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION track_widget_usage();

-- Track template downloads
CREATE OR REPLACE FUNCTION track_template_download()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE widget_templates
  SET downloads = downloads + 1
  WHERE id = NEW.metadata->>'template_id';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_template_download
  AFTER INSERT ON widgets
  FOR EACH ROW
  WHEN (NEW.metadata->>'template_id' IS NOT NULL)
  EXECUTE FUNCTION track_template_download();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get widget statistics
CREATE OR REPLACE FUNCTION get_widget_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalWidgets', COUNT(*),
    'activeWidgets', COUNT(*) FILTER (WHERE status = 'active'),
    'byCategory', (
      SELECT json_object_agg(category, cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY category
      ) cat_counts
    ),
    'byType', (
      SELECT json_object_agg(type, cnt)
      FROM (
        SELECT type, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY type
      ) type_counts
    ),
    'bySize', (
      SELECT json_object_agg(size, cnt)
      FROM (
        SELECT size, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY size
      ) size_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    ),
    'totalUsage', COALESCE(SUM(usage_count), 0),
    'mostUsed', (
      SELECT json_build_object('name', name, 'usageCount', usage_count)
      FROM widgets
      WHERE user_id = p_user_id
      ORDER BY usage_count DESC
      LIMIT 1
    )
  ) INTO v_stats
  FROM widgets
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search widgets
CREATE OR REPLACE FUNCTION search_widgets(
  p_user_id UUID,
  p_search_term TEXT,
  p_category widget_category DEFAULT NULL,
  p_type widget_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type widget_type,
  category widget_category,
  status widget_status,
  usage_count INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    w.type,
    w.category,
    w.status,
    w.usage_count,
    ts_rank(
      to_tsvector('english', w.name || ' ' || COALESCE(w.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM widgets w
  WHERE w.user_id = p_user_id
    AND (p_category IS NULL OR w.category = p_category)
    AND (p_type IS NULL OR w.type = p_type)
    AND (
      p_search_term = '' OR
      to_tsvector('english', w.name || ' ' || COALESCE(w.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, w.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Refresh widget data
CREATE OR REPLACE FUNCTION refresh_widget(p_widget_id UUID)
RETURNS JSON AS $$
DECLARE
  v_widget widgets%ROWTYPE;
BEGIN
  UPDATE widgets
  SET
    last_refreshed = NOW(),
    status = 'active',
    error_message = NULL,
    updated_at = NOW()
  WHERE id = p_widget_id
  RETURNING * INTO v_widget;

  -- Store historical data
  INSERT INTO widget_data (widget_id, data, status)
  VALUES (p_widget_id, v_widget.data, v_widget.status);

  RETURN json_build_object(
    'success', true,
    'widgetId', v_widget.id,
    'lastRefreshed', v_widget.last_refreshed
  );
END;
$$ LANGUAGE plpgsql;

-- Duplicate widget
CREATE OR REPLACE FUNCTION duplicate_widget(p_widget_id UUID, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_widget_id UUID;
  v_original widgets%ROWTYPE;
BEGIN
  SELECT * INTO v_original FROM widgets WHERE id = p_widget_id;

  INSERT INTO widgets (
    user_id, name, type, category, size, icon, description,
    is_visible, is_locked, position, config, status
  )
  VALUES (
    p_user_id,
    v_original.name || ' (Copy)',
    v_original.type,
    v_original.category,
    v_original.size,
    v_original.icon,
    v_original.description,
    v_original.is_visible,
    false,
    jsonb_build_object(
      'x', (v_original.position->>'x')::int + 50,
      'y', (v_original.position->>'y')::int + 50
    ),
    v_original.config,
    'inactive'
  )
  RETURNING id INTO v_new_widget_id;

  RETURN v_new_widget_id;
END;
$$ LANGUAGE plpgsql;

-- Create widget from template
CREATE OR REPLACE FUNCTION create_widget_from_template(
  p_template_id UUID,
  p_user_id UUID,
  p_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_template widget_templates%ROWTYPE;
  v_new_widget_id UUID;
BEGIN
  SELECT * INTO v_template FROM widget_templates WHERE id = p_template_id;

  INSERT INTO widgets (
    user_id, name, type, category, size, icon, description,
    config, metadata
  )
  VALUES (
    p_user_id,
    COALESCE(p_name, v_template.name),
    v_template.type,
    v_template.category,
    v_template.size,
    v_template.icon,
    v_template.description,
    v_template.config,
    jsonb_build_object('template_id', p_template_id)
  )
  RETURNING id INTO v_new_widget_id;

  RETURN v_new_widget_id;
END;
$$ LANGUAGE plpgsql;

-- Get dashboard with widgets
CREATE OR REPLACE FUNCTION get_dashboard_with_widgets(p_dashboard_id UUID)
RETURNS JSON AS $$
DECLARE
  v_dashboard JSON;
BEGIN
  SELECT json_build_object(
    'dashboard', row_to_json(d.*),
    'widgets', (
      SELECT json_agg(
        json_build_object(
          'widget', row_to_json(w.*),
          'position', json_build_object(
            'x', dw.position_x,
            'y', dw.position_y,
            'width', dw.width,
            'height', dw.height
          ),
          'orderIndex', dw.order_index,
          'isVisible', dw.is_visible
        )
        ORDER BY dw.order_index
      )
      FROM dashboard_widgets dw
      JOIN widgets w ON w.id = dw.widget_id
      WHERE dw.dashboard_id = p_dashboard_id
    )
  ) INTO v_dashboard
  FROM dashboards d
  WHERE d.id = p_dashboard_id;

  RETURN v_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Update widget stats daily
CREATE OR REPLACE FUNCTION update_widget_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO widget_stats (
    user_id,
    date,
    total_widgets,
    active_widgets,
    category_breakdown,
    type_breakdown,
    size_breakdown,
    status_breakdown,
    total_usage,
    average_refresh_rate,
    most_used_widget_id
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    (SELECT get_widget_stats(p_user_id)->>'byCategory')::jsonb,
    (SELECT get_widget_stats(p_user_id)->>'byType')::jsonb,
    (SELECT get_widget_stats(p_user_id)->>'bySize')::jsonb,
    (SELECT get_widget_stats(p_user_id)->>'byStatus')::jsonb,
    COALESCE(SUM(usage_count), 0),
    ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - last_refreshed))), 2),
    (SELECT id FROM widgets WHERE user_id = p_user_id ORDER BY usage_count DESC LIMIT 1)
  FROM widgets
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_widgets = EXCLUDED.total_widgets,
    active_widgets = EXCLUDED.active_widgets,
    category_breakdown = EXCLUDED.category_breakdown,
    type_breakdown = EXCLUDED.type_breakdown,
    size_breakdown = EXCLUDED.size_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    total_usage = EXCLUDED.total_usage,
    average_refresh_rate = EXCLUDED.average_refresh_rate,
    most_used_widget_id = EXCLUDED.most_used_widget_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_stats ENABLE ROW LEVEL SECURITY;

-- Widgets Policies
CREATE POLICY widgets_select_policy ON widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widgets_insert_policy ON widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY widgets_update_policy ON widgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY widgets_delete_policy ON widgets
  FOR DELETE USING (auth.uid() = user_id);

-- Widget Templates Policies
CREATE POLICY widget_templates_select_policy ON widget_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY widget_templates_insert_policy ON widget_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY widget_templates_update_policy ON widget_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY widget_templates_delete_policy ON widget_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Dashboards Policies
CREATE POLICY dashboards_select_policy ON dashboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY dashboards_insert_policy ON dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY dashboards_update_policy ON dashboards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY dashboards_delete_policy ON dashboards
  FOR DELETE USING (auth.uid() = user_id);

-- Dashboard Widgets Policies
CREATE POLICY dashboard_widgets_select_policy ON dashboard_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY dashboard_widgets_insert_policy ON dashboard_widgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY dashboard_widgets_update_policy ON dashboard_widgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY dashboard_widgets_delete_policy ON dashboard_widgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

-- Widget Data Policies
CREATE POLICY widget_data_select_policy ON widget_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM widgets w
      WHERE w.id = widget_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY widget_data_insert_policy ON widget_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM widgets w
      WHERE w.id = widget_id AND w.user_id = auth.uid()
    )
  );

-- Widget Analytics Policies
CREATE POLICY widget_analytics_select_policy ON widget_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widget_analytics_insert_policy ON widget_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Widget Stats Policies
CREATE POLICY widget_stats_select_policy ON widget_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widget_stats_insert_policy ON widget_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY widget_stats_update_policy ON widget_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all widgets by category
-- SELECT * FROM widgets WHERE user_id = 'user-id' AND category = 'analytics' ORDER BY usage_count DESC;

-- Example: Search widgets
-- SELECT * FROM search_widgets('user-id', 'revenue', 'analytics', NULL, 20);

-- Example: Get widget statistics
-- SELECT * FROM get_widget_stats('user-id');

-- Example: Refresh widget
-- SELECT * FROM refresh_widget('widget-id');

-- Example: Duplicate widget
-- SELECT duplicate_widget('widget-id', 'user-id');

-- Example: Create widget from template
-- SELECT create_widget_from_template('template-id', 'user-id', 'My Custom Widget');

-- Example: Get dashboard with widgets
-- SELECT * FROM get_dashboard_with_widgets('dashboard-id');

-- Example: Update daily widget stats
-- SELECT update_widget_stats_daily('user-id');

-- =====================================================
-- END OF WIDGETS SYSTEM SCHEMA
-- =====================================================
