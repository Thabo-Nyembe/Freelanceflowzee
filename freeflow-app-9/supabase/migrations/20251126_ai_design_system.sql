-- ========================================
-- AI DESIGN SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete AI-powered design studio with:
-- - AI design tools with multiple models
-- - Design templates with AI integration
-- - Project management with generation tracking
-- - Output variations and quality scoring
-- - Color palettes and style transfers
-- - Usage analytics and ratings
--
-- Tables: 7
-- Functions: 6
-- Indexes: 38
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE ai_tool_type AS ENUM (
  'logo',
  'color-palette',
  'style-transfer',
  'image-enhance',
  'auto-layout',
  'background-removal',
  'smart-crop',
  'batch-generate'
);

CREATE TYPE ai_model AS ENUM (
  'gpt-4-vision',
  'dall-e-3',
  'midjourney-v6',
  'stable-diffusion',
  'ai-upscaler',
  'remove-bg',
  'vision-ai'
);

CREATE TYPE design_category AS ENUM (
  'logo',
  'branding',
  'social-media',
  'print',
  'web',
  'marketing',
  'illustration',
  'ui-ux'
);

CREATE TYPE project_status AS ENUM (
  'draft',
  'generating',
  'active',
  'review',
  'completed',
  'archived'
);

CREATE TYPE export_format AS ENUM (
  'svg',
  'png',
  'jpg',
  'pdf',
  'webp'
);

-- ========================================
-- TABLES
-- ========================================

-- AI Design Projects
CREATE TABLE ai_design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  status project_status NOT NULL DEFAULT 'draft',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tool_id TEXT NOT NULL,
  template_id TEXT,
  generated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  model ai_model NOT NULL,
  variations INTEGER NOT NULL DEFAULT 1,
  selected_variation INTEGER,
  prompt TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  quality_score DECIMAL(3, 1),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Design Outputs
CREATE TABLE design_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES ai_design_projects(id) ON DELETE CASCADE,
  variation_number INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  format export_format NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  quality_score DECIMAL(3, 1) NOT NULL,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, variation_number)
);

-- Design Templates
CREATE TABLE design_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category design_category NOT NULL,
  thumbnail TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  ai_ready BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Tools
CREATE TABLE ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type ai_tool_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  model ai_model NOT NULL,
  icon TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  estimated_time INTEGER NOT NULL, -- seconds
  max_variations INTEGER NOT NULL DEFAULT 1,
  supported_formats export_format[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Color Palettes
CREATE TABLE color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  description TEXT NOT NULL,
  wcag_compliant BOOLEAN NOT NULL DEFAULT false,
  contrast_ratios DECIMAL(4, 2)[] DEFAULT '{}',
  mood TEXT NOT NULL,
  usage TEXT[] DEFAULT '{}',
  uses INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Analytics
CREATE TABLE project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES ai_design_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  generation_time INTEGER, -- seconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, date)
);

-- Tool Reviews
CREATE TABLE tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- ========================================
-- INDEXES
-- ========================================

-- AI Design Projects Indexes
CREATE INDEX idx_ai_design_projects_user_id ON ai_design_projects(user_id);
CREATE INDEX idx_ai_design_projects_type ON ai_design_projects(type);
CREATE INDEX idx_ai_design_projects_status ON ai_design_projects(status);
CREATE INDEX idx_ai_design_projects_model ON ai_design_projects(model);
CREATE INDEX idx_ai_design_projects_created_at ON ai_design_projects(created_at DESC);
CREATE INDEX idx_ai_design_projects_completed_at ON ai_design_projects(completed_at DESC);
CREATE INDEX idx_ai_design_projects_quality_score ON ai_design_projects(quality_score DESC);
CREATE INDEX idx_ai_design_projects_name ON ai_design_projects USING GIN(name gin_trgm_ops);

-- Design Outputs Indexes
CREATE INDEX idx_design_outputs_project_id ON design_outputs(project_id);
CREATE INDEX idx_design_outputs_variation_number ON design_outputs(project_id, variation_number);
CREATE INDEX idx_design_outputs_is_selected ON design_outputs(is_selected);
CREATE INDEX idx_design_outputs_downloads ON design_outputs(downloads DESC);
CREATE INDEX idx_design_outputs_quality_score ON design_outputs(quality_score DESC);

-- Design Templates Indexes
CREATE INDEX idx_design_templates_category ON design_templates(category);
CREATE INDEX idx_design_templates_ai_ready ON design_templates(ai_ready);
CREATE INDEX idx_design_templates_is_premium ON design_templates(is_premium);
CREATE INDEX idx_design_templates_uses ON design_templates(uses DESC);
CREATE INDEX idx_design_templates_rating ON design_templates(rating DESC);
CREATE INDEX idx_design_templates_name ON design_templates USING GIN(name gin_trgm_ops);
CREATE INDEX idx_design_templates_tags ON design_templates USING GIN(tags);

-- AI Tools Indexes
CREATE INDEX idx_ai_tools_type ON ai_tools(type);
CREATE INDEX idx_ai_tools_model ON ai_tools(model);
CREATE INDEX idx_ai_tools_is_premium ON ai_tools(is_premium);
CREATE INDEX idx_ai_tools_uses ON ai_tools(uses DESC);
CREATE INDEX idx_ai_tools_rating ON ai_tools(rating DESC);

-- Color Palettes Indexes
CREATE INDEX idx_color_palettes_user_id ON color_palettes(user_id);
CREATE INDEX idx_color_palettes_mood ON color_palettes(mood);
CREATE INDEX idx_color_palettes_wcag_compliant ON color_palettes(wcag_compliant);
CREATE INDEX idx_color_palettes_is_public ON color_palettes(is_public);
CREATE INDEX idx_color_palettes_uses ON color_palettes(uses DESC);

-- Project Analytics Indexes
CREATE INDEX idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX idx_project_analytics_date ON project_analytics(date DESC);
CREATE INDEX idx_project_analytics_project_date ON project_analytics(project_id, date DESC);

-- Tool Reviews Indexes
CREATE INDEX idx_tool_reviews_tool_id ON tool_reviews(tool_id);
CREATE INDEX idx_tool_reviews_user_id ON tool_reviews(user_id);
CREATE INDEX idx_tool_reviews_rating ON tool_reviews(rating DESC);

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

CREATE TRIGGER update_ai_design_projects_updated_at BEFORE UPDATE ON ai_design_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_templates_updated_at BEFORE UPDATE ON design_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON ai_tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_color_palettes_updated_at BEFORE UPDATE ON color_palettes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_analytics_updated_at BEFORE UPDATE ON project_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_reviews_updated_at BEFORE UPDATE ON tool_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update tool usage count
CREATE OR REPLACE FUNCTION update_tool_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'generating' THEN
    UPDATE ai_tools
    SET uses = uses + 1
    WHERE id = (SELECT id FROM ai_tools WHERE type = NEW.type LIMIT 1);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_tool_usage
  AFTER INSERT OR UPDATE ON ai_design_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_usage();

-- Update template usage count
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.template_id IS NOT NULL THEN
    UPDATE design_templates
    SET uses = uses + 1
    WHERE id = NEW.template_id::UUID;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage
  AFTER INSERT ON ai_design_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_template_usage();

-- Update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.downloads < NEW.downloads THEN
    -- Update daily analytics
    INSERT INTO project_analytics (project_id, date, downloads)
    VALUES (NEW.project_id, CURRENT_DATE, 1)
    ON CONFLICT (project_id, date)
    DO UPDATE SET downloads = project_analytics.downloads + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_download_count
  AFTER UPDATE ON design_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

-- Update tool rating
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_tools
  SET rating = (
    SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0)
    FROM tool_reviews
    WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
  ),
  review_count = (
    SELECT COUNT(*)
    FROM tool_reviews
    WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
  )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tool_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON tool_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_rating();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Get AI design stats
CREATE OR REPLACE FUNCTION get_ai_design_stats(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalProjects', COUNT(*),
      'totalGenerations', COALESCE(SUM(variations), 0),
      'averageQuality', COALESCE(AVG(quality_score), 0),
      'successRate', ROUND(COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0) * 100),
      'byTool', (
        SELECT json_object_agg(type, count)
        FROM (
          SELECT type, COUNT(*) as count
          FROM ai_design_projects
          WHERE user_id = p_user_id
          GROUP BY type
        ) t
      ),
      'byStatus', (
        SELECT json_object_agg(status, count)
        FROM (
          SELECT status, COUNT(*) as count
          FROM ai_design_projects
          WHERE user_id = p_user_id
          GROUP BY status
        ) t
      )
    )
    FROM ai_design_projects
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create AI design project
CREATE OR REPLACE FUNCTION create_ai_design_project(
  p_user_id UUID,
  p_name TEXT,
  p_type ai_tool_type,
  p_model ai_model,
  p_prompt TEXT DEFAULT NULL,
  p_parameters JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_project_id UUID;
  v_tool_id TEXT;
BEGIN
  -- Get tool ID
  SELECT id::TEXT INTO v_tool_id
  FROM ai_tools
  WHERE type = p_type
  LIMIT 1;

  -- Create project
  INSERT INTO ai_design_projects (
    user_id, name, type, model, tool_id, prompt, parameters, status
  )
  VALUES (
    p_user_id, p_name, p_type, p_model, v_tool_id, p_prompt, p_parameters, 'draft'
  )
  RETURNING id INTO v_project_id;

  RETURN json_build_object('success', true, 'projectId', v_project_id);
END;
$$ LANGUAGE plpgsql;

-- Start generation
CREATE OR REPLACE FUNCTION start_generation(p_project_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE ai_design_projects
  SET status = 'generating',
      generated_at = NOW(),
      progress = 0
  WHERE id = p_project_id;

  RETURN json_build_object('success', true, 'status', 'generating');
END;
$$ LANGUAGE plpgsql;

-- Complete generation
CREATE OR REPLACE FUNCTION complete_generation(
  p_project_id UUID,
  p_quality_score DECIMAL(3, 1) DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  UPDATE ai_design_projects
  SET status = 'completed',
      completed_at = NOW(),
      progress = 100,
      quality_score = p_quality_score
  WHERE id = p_project_id;

  RETURN json_build_object('success', true, 'status', 'completed');
END;
$$ LANGUAGE plpgsql;

-- Search projects
CREATE OR REPLACE FUNCTION search_ai_design_projects(
  p_user_id UUID,
  p_search_term TEXT,
  p_status project_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF ai_design_projects AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ai_design_projects
  WHERE user_id = p_user_id
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR prompt ILIKE '%' || p_search_term || '%'
    )
    AND (p_status IS NULL OR status = p_status)
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get top AI tools
CREATE OR REPLACE FUNCTION get_top_ai_tools(p_limit INTEGER DEFAULT 10)
RETURNS SETOF ai_tools AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ai_tools
  ORDER BY uses DESC, rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE ai_design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;

-- AI Design Projects Policies
CREATE POLICY ai_design_projects_select ON ai_design_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ai_design_projects_insert ON ai_design_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY ai_design_projects_update ON ai_design_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY ai_design_projects_delete ON ai_design_projects FOR DELETE USING (auth.uid() = user_id);

-- Design Outputs Policies
CREATE POLICY design_outputs_select ON design_outputs FOR SELECT
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));
CREATE POLICY design_outputs_insert ON design_outputs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));
CREATE POLICY design_outputs_update ON design_outputs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));
CREATE POLICY design_outputs_delete ON design_outputs FOR DELETE
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));

-- Design Templates Policies
CREATE POLICY design_templates_select ON design_templates FOR SELECT USING (true);

-- AI Tools Policies
CREATE POLICY ai_tools_select ON ai_tools FOR SELECT USING (true);

-- Color Palettes Policies
CREATE POLICY color_palettes_select ON color_palettes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY color_palettes_insert ON color_palettes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY color_palettes_update ON color_palettes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY color_palettes_delete ON color_palettes FOR DELETE USING (auth.uid() = user_id);

-- Project Analytics Policies
CREATE POLICY project_analytics_select ON project_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = project_analytics.project_id AND user_id = auth.uid()));

-- Tool Reviews Policies
CREATE POLICY tool_reviews_select ON tool_reviews FOR SELECT USING (true);
CREATE POLICY tool_reviews_insert ON tool_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY tool_reviews_update ON tool_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY tool_reviews_delete ON tool_reviews FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE ai_design_projects IS 'AI-powered design projects with generation tracking';
COMMENT ON TABLE design_outputs IS 'Generated design variations with quality scoring';
COMMENT ON TABLE design_templates IS 'Design templates with AI integration support';
COMMENT ON TABLE ai_tools IS 'Available AI design tools with models and features';
COMMENT ON TABLE color_palettes IS 'AI-generated color palettes with WCAG compliance';
COMMENT ON TABLE project_analytics IS 'Daily project analytics and metrics';
COMMENT ON TABLE tool_reviews IS 'User reviews for AI tools';
