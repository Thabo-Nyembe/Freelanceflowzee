-- Project Templates - Reusable Project Templates Library
-- Pre-configured project templates with pricing, features, deliverables, and workflows

-- ENUMS
DROP TYPE IF EXISTS template_category CASCADE;
DROP TYPE IF EXISTS template_type CASCADE;
DROP TYPE IF EXISTS complexity_level CASCADE;
DROP TYPE IF EXISTS template_status CASCADE;

CREATE TYPE template_category AS ENUM (
  'branding', 'web-development', 'mobile-development', 'mobile-design',
  'marketing', 'video-production', 'photography', 'graphic-design',
  'content-writing', 'seo', 'consulting', 'other'
);

CREATE TYPE template_type AS ENUM ('free', 'standard', 'premium', 'enterprise');

CREATE TYPE complexity_level AS ENUM ('simple', 'moderate', 'advanced', 'expert');

CREATE TYPE template_status AS ENUM ('draft', 'published', 'archived');

-- TABLES
DROP TABLE IF EXISTS project_templates CASCADE;
DROP TABLE IF EXISTS template_tasks CASCADE;
DROP TABLE IF EXISTS template_milestones CASCADE;
DROP TABLE IF EXISTS template_deliverables CASCADE;
DROP TABLE IF EXISTS template_pricing CASCADE;
DROP TABLE IF EXISTS template_usage CASCADE;
DROP TABLE IF EXISTS template_favorites CASCADE;
DROP TABLE IF EXISTS template_reviews CASCADE;

CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category template_category NOT NULL,
  type template_type NOT NULL DEFAULT 'standard',
  complexity complexity_level NOT NULL DEFAULT 'moderate',
  status template_status NOT NULL DEFAULT 'published',

  -- Visuals
  thumbnail_url TEXT,
  cover_image_url TEXT,
  preview_images TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Scope & Duration
  duration_min INTEGER, -- in days
  duration_max INTEGER, -- in days
  duration_text TEXT, -- e.g., "4-6 weeks"

  -- Pricing
  price_min DECIMAL(12, 2),
  price_max DECIMAL(12, 2),
  price_text TEXT, -- e.g., "$2,500 - $5,000"
  currency TEXT DEFAULT 'USD',

  -- Features & Deliverables
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Requirements & Prerequisites
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Template Content
  overview TEXT,
  process_steps JSONB DEFAULT '[]'::jsonb,
  workflow JSONB DEFAULT '{}'::jsonb,

  -- Stats & Engagement
  usage_count INTEGER NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,

  -- Features & Flags
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_customizable BOOLEAN NOT NULL DEFAULT true,

  -- Search
  search_vector tsvector,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TABLE template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,

  -- Task Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Timing
  estimated_hours DECIMAL(8, 2),
  start_day INTEGER, -- Day number from project start
  duration_days INTEGER,

  -- Assignment
  role TEXT, -- e.g., "Designer", "Developer"
  skill_level TEXT,

  -- Dependencies
  depends_on UUID[] DEFAULT ARRAY[]::UUID[],
  is_milestone BOOLEAN NOT NULL DEFAULT false,
  is_optional BOOLEAN NOT NULL DEFAULT false,

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,

  -- Milestone Info
  title TEXT NOT NULL,
  description TEXT,

  -- Timing
  target_day INTEGER NOT NULL, -- Day number from project start
  target_percentage INTEGER CHECK (target_percentage >= 0 AND target_percentage <= 100),

  -- Deliverables at this milestone
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Payment
  payment_percentage INTEGER CHECK (payment_percentage >= 0 AND payment_percentage <= 100),

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES template_milestones(id) ON DELETE SET NULL,

  -- Deliverable Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_format TEXT,

  -- Timing
  due_day INTEGER, -- Day number from project start

  -- Requirements
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  acceptance_criteria TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,

  -- Pricing Tier
  tier_name TEXT NOT NULL,
  tier_description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- What's Included
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Limits
  revisions_included INTEGER,
  support_duration INTEGER, -- days

  -- Display
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID, -- Reference to created project

  -- Usage Context
  customizations JSONB DEFAULT '{}'::jsonb,

  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Organization
  folder TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(template_id, user_id)
);

CREATE TABLE template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,

  -- Usage Context
  project_type TEXT,
  project_size TEXT,

  -- Helpful Votes
  helpful_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(template_id, user_id)
);

-- INDEXES
CREATE INDEX idx_templates_user ON project_templates(user_id);
CREATE INDEX idx_templates_category ON project_templates(category);
CREATE INDEX idx_templates_type ON project_templates(type);
CREATE INDEX idx_templates_complexity ON project_templates(complexity);
CREATE INDEX idx_templates_status ON project_templates(status);
CREATE INDEX idx_templates_featured ON project_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_popular ON project_templates(is_popular) WHERE is_popular = true;
CREATE INDEX idx_templates_published ON project_templates(status) WHERE status = 'published';
CREATE INDEX idx_templates_usage ON project_templates(usage_count DESC);
CREATE INDEX idx_templates_rating ON project_templates(rating_average DESC);
CREATE INDEX idx_templates_tags ON project_templates USING GIN(tags);
CREATE INDEX idx_templates_search ON project_templates USING GIN(search_vector);

CREATE INDEX idx_template_tasks_template ON template_tasks(template_id);
CREATE INDEX idx_template_tasks_order ON template_tasks(display_order);

CREATE INDEX idx_template_milestones_template ON template_milestones(template_id);
CREATE INDEX idx_template_milestones_order ON template_milestones(display_order);

CREATE INDEX idx_template_deliverables_template ON template_deliverables(template_id);
CREATE INDEX idx_template_deliverables_milestone ON template_deliverables(milestone_id);

CREATE INDEX idx_template_pricing_template ON template_pricing(template_id);
CREATE INDEX idx_template_pricing_order ON template_pricing(display_order);

CREATE INDEX idx_template_usage_template ON template_usage(template_id);
CREATE INDEX idx_template_usage_user ON template_usage(user_id);
CREATE INDEX idx_template_usage_date ON template_usage(used_at DESC);

CREATE INDEX idx_template_favorites_template ON template_favorites(template_id);
CREATE INDEX idx_template_favorites_user ON template_favorites(user_id);

CREATE INDEX idx_template_reviews_template ON template_reviews(template_id);
CREATE INDEX idx_template_reviews_user ON template_reviews(user_id);
CREATE INDEX idx_template_reviews_rating ON template_reviews(rating DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_template_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE project_templates
  SET
    rating_average = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM template_reviews
      WHERE template_id = NEW.template_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM template_reviews
      WHERE template_id = NEW.template_id
    )
  WHERE id = NEW.template_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_rating
AFTER INSERT OR UPDATE OR DELETE ON template_reviews
FOR EACH ROW
EXECUTE FUNCTION update_template_rating();

CREATE OR REPLACE FUNCTION update_template_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'template_usage' THEN
    UPDATE project_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
  ELSIF TG_TABLE_NAME = 'template_favorites' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE project_templates SET favorites_count = favorites_count + 1 WHERE id = NEW.template_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE project_templates SET favorites_count = favorites_count - 1 WHERE id = OLD.template_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usage_stats
AFTER INSERT ON template_usage
FOR EACH ROW
EXECUTE FUNCTION update_template_stats();

CREATE TRIGGER trigger_favorite_stats
AFTER INSERT OR DELETE ON template_favorites
FOR EACH ROW
EXECUTE FUNCTION update_template_stats();

CREATE OR REPLACE FUNCTION update_template_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_search
BEFORE INSERT OR UPDATE ON project_templates
FOR EACH ROW
EXECUTE FUNCTION update_template_search_vector();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION use_template(
  p_template_id UUID,
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_customizations JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  usage_id UUID;
BEGIN
  INSERT INTO template_usage (
    template_id,
    user_id,
    project_id,
    customizations
  ) VALUES (
    p_template_id,
    p_user_id,
    p_project_id,
    p_customizations
  ) RETURNING id INTO usage_id;

  RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_popular_templates(
  p_category template_category DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  template_id UUID,
  template_name TEXT,
  usage_count INTEGER,
  rating_average DECIMAL,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.id,
    pt.name,
    pt.usage_count,
    pt.rating_average,
    ROW_NUMBER() OVER (ORDER BY pt.usage_count DESC, pt.rating_average DESC)::INTEGER as rank
  FROM project_templates pt
  WHERE pt.status = 'published'
  AND (p_category IS NULL OR pt.category = p_category)
  ORDER BY pt.usage_count DESC, pt.rating_average DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION duplicate_template(
  p_template_id UUID,
  p_user_id UUID,
  p_new_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_template_id UUID;
  template_record RECORD;
BEGIN
  -- Get original template
  SELECT * INTO template_record
  FROM project_templates
  WHERE id = p_template_id;

  -- Create duplicate
  INSERT INTO project_templates (
    user_id, name, description, category, type, complexity,
    duration_min, duration_max, duration_text,
    price_min, price_max, price_text, currency,
    features, deliverables, tags, keywords,
    requirements, prerequisites, overview, process_steps, workflow,
    is_customizable, metadata
  ) VALUES (
    p_user_id,
    COALESCE(p_new_name, template_record.name || ' (Copy)'),
    template_record.description,
    template_record.category,
    template_record.type,
    template_record.complexity,
    template_record.duration_min,
    template_record.duration_max,
    template_record.duration_text,
    template_record.price_min,
    template_record.price_max,
    template_record.price_text,
    template_record.currency,
    template_record.features,
    template_record.deliverables,
    template_record.tags,
    template_record.keywords,
    template_record.requirements,
    template_record.prerequisites,
    template_record.overview,
    template_record.process_steps,
    template_record.workflow,
    template_record.is_customizable,
    template_record.metadata
  ) RETURNING id INTO new_template_id;

  RETURN new_template_id;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;

-- Templates: Public can view published, users manage their own
CREATE POLICY templates_select_public ON project_templates
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY templates_insert_user ON project_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY templates_update_owner ON project_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY templates_delete_owner ON project_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Template components follow template permissions
CREATE POLICY template_tasks_policy ON template_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_templates
      WHERE project_templates.id = template_tasks.template_id
      AND (project_templates.status = 'published' OR project_templates.user_id = auth.uid())
    )
  );

CREATE POLICY template_milestones_policy ON template_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_templates
      WHERE project_templates.id = template_milestones.template_id
      AND (project_templates.status = 'published' OR project_templates.user_id = auth.uid())
    )
  );

CREATE POLICY template_deliverables_policy ON template_deliverables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_templates
      WHERE project_templates.id = template_deliverables.template_id
      AND (project_templates.status = 'published' OR project_templates.user_id = auth.uid())
    )
  );

CREATE POLICY template_pricing_policy ON template_pricing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_templates
      WHERE project_templates.id = template_pricing.template_id
      AND (project_templates.status = 'published' OR project_templates.user_id = auth.uid())
    )
  );

-- Usage: Anyone can record, users see their own
CREATE POLICY usage_insert_policy ON template_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY usage_select_user ON template_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Favorites: Users manage their own
CREATE POLICY favorites_policy ON template_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Reviews: Public can view, users manage their own
CREATE POLICY reviews_select_all ON template_reviews
  FOR SELECT USING (true);

CREATE POLICY reviews_manage_own ON template_reviews
  FOR ALL USING (auth.uid() = user_id);
