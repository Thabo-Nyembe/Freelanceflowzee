-- ============================================================================
-- Clients & CRM System - Complete Database Schema
-- ============================================================================
-- Description: Production-ready client relationship management (CRM) system
-- Features:
--   - Client management and tracking
--   - Contact information and communication history
--   - Project association and revenue tracking
--   - Lead scoring and qualification
--   - Activity timeline and notes
--   - Tags and categorization
--   - Health score calculation
--   - Analytics and reporting
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS client_status CASCADE;
CREATE TYPE client_status AS ENUM (
  'active',
  'inactive',
  'lead',
  'prospect',
  'churned',
  'vip'
);

DROP TYPE IF EXISTS client_type CASCADE;
CREATE TYPE client_type AS ENUM (
  'individual',
  'business',
  'enterprise',
  'agency',
  'nonprofit'
);

DROP TYPE IF EXISTS client_priority CASCADE;
CREATE TYPE client_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

DROP TYPE IF EXISTS communication_type CASCADE;
CREATE TYPE communication_type AS ENUM (
  'email',
  'phone',
  'meeting',
  'video_call',
  'message',
  'note'
);

DROP TYPE IF EXISTS activity_type CASCADE;
CREATE TYPE activity_type AS ENUM (
  'call',
  'email',
  'meeting',
  'task',
  'note',
  'deal',
  'project_start',
  'project_end'
);

DROP TYPE IF EXISTS communication_direction CASCADE;
CREATE TYPE communication_direction AS ENUM (
  'inbound',
  'outbound'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  avatar TEXT,

  -- Classification
  status client_status NOT NULL DEFAULT 'lead',
  type client_type NOT NULL DEFAULT 'individual',
  priority client_priority NOT NULL DEFAULT 'medium',

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  timezone TEXT,

  -- Business Info
  website TEXT,
  industry TEXT,
  company_size TEXT,

  -- Financial
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  average_project_value DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',

  -- Metrics
  projects_count INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 50,
  lead_score INTEGER DEFAULT 50,
  satisfaction_score INTEGER DEFAULT 0,

  -- Engagement
  last_contact TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  communication_frequency INTEGER DEFAULT 30,

  -- Tags & Categories
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Social
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_health_score CHECK (health_score >= 0 AND health_score <= 100),
  CONSTRAINT valid_lead_score CHECK (lead_score >= 0 AND lead_score <= 100),
  CONSTRAINT valid_satisfaction_score CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
  CONSTRAINT valid_revenue CHECK (total_revenue >= 0),
  CONSTRAINT valid_projects CHECK (projects_count >= 0 AND completed_projects >= 0 AND active_projects >= 0)
);

-- Client Metadata Table
CREATE TABLE IF NOT EXISTS client_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Source & Referral
  source TEXT,
  referred_by TEXT,
  preferred_contact communication_type,

  -- Settings
  language TEXT DEFAULT 'en',

  -- Custom Fields
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Automation
  automation_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  segments TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_client UNIQUE (client_id)
);

-- Client Projects Table
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Project Info
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),

  -- Financial
  value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',

  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_value CHECK (value >= 0),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Client Communications Table
CREATE TABLE IF NOT EXISTS client_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Communication Info
  type communication_type NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  direction communication_direction NOT NULL DEFAULT 'outbound',

  -- Metadata
  duration INTEGER, -- in minutes for calls/meetings
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_duration CHECK (duration IS NULL OR duration > 0)
);

-- Communication Attachments Table
CREATE TABLE IF NOT EXISTS communication_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES client_communications(id) ON DELETE CASCADE,

  -- File Info
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_size CHECK (size > 0)
);

-- Client Activities Table
CREATE TABLE IF NOT EXISTS client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Activity Info
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client Notes Table
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Note Content
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client Tags Table
CREATE TABLE IF NOT EXISTS client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tag Info
  name TEXT NOT NULL,
  color TEXT,
  description TEXT,

  -- Usage Stats
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);

-- Client Categories Table
CREATE TABLE IF NOT EXISTS client_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category Info
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES client_categories(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_user_category UNIQUE (user_id, name)
);

-- Client Files Table
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Info
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_size CHECK (size > 0)
);

-- Client Segments Table
CREATE TABLE IF NOT EXISTS client_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Segment Info
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,

  -- Stats
  client_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_user_segment UNIQUE (user_id, name)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Clients Indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_priority ON clients(priority);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);
CREATE INDEX IF NOT EXISTS idx_clients_country ON clients(country);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_last_contact ON clients(last_contact DESC);
CREATE INDEX IF NOT EXISTS idx_clients_next_follow_up ON clients(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_clients_health_score ON clients(health_score DESC);
CREATE INDEX IF NOT EXISTS idx_clients_lead_score ON clients(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_clients_total_revenue ON clients(total_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_clients_categories ON clients USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_clients_user_status ON clients(user_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_user_type ON clients(user_id, type);

-- Client Metadata Indexes
CREATE INDEX IF NOT EXISTS idx_client_metadata_client_id ON client_metadata(client_id);
CREATE INDEX IF NOT EXISTS idx_client_metadata_source ON client_metadata(source);
CREATE INDEX IF NOT EXISTS idx_client_metadata_segments ON client_metadata USING gin(segments);

-- Client Projects Indexes
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_client_projects_start_date ON client_projects(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_projects_value ON client_projects(value DESC);

-- Client Communications Indexes
CREATE INDEX IF NOT EXISTS idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_user_id ON client_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_type ON client_communications(type);
CREATE INDEX IF NOT EXISTS idx_client_communications_timestamp ON client_communications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_client_communications_direction ON client_communications(direction);

-- Communication Attachments Indexes
CREATE INDEX IF NOT EXISTS idx_communication_attachments_communication_id ON communication_attachments(communication_id);

-- Client Activities Indexes
CREATE INDEX IF NOT EXISTS idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_user_id ON client_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_type ON client_activities(type);
CREATE INDEX IF NOT EXISTS idx_client_activities_timestamp ON client_activities(timestamp DESC);

-- Client Notes Indexes
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_user_id ON client_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_pinned ON client_notes(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at DESC);

-- Client Tags Indexes
CREATE INDEX IF NOT EXISTS idx_client_tags_user_id ON client_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_name ON client_tags(name);

-- Client Categories Indexes
CREATE INDEX IF NOT EXISTS idx_client_categories_user_id ON client_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_client_categories_parent_id ON client_categories(parent_id);

-- Client Files Indexes
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_uploaded_by ON client_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_client_files_created_at ON client_files(created_at DESC);

-- Client Segments Indexes
CREATE INDEX IF NOT EXISTS idx_client_segments_user_id ON client_segments(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_segments ENABLE ROW LEVEL SECURITY;

-- Clients Policies
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Client Metadata Policies
CREATE POLICY "Users can view metadata for their clients"
  ON client_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create metadata for their clients"
  ON client_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metadata for their clients"
  ON client_metadata FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

-- Client Projects Policies
CREATE POLICY "Users can view projects for their clients"
  ON client_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects for their clients"
  ON client_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects for their clients"
  ON client_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

-- Client Communications Policies
CREATE POLICY "Users can view communications for their clients"
  ON client_communications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create communications for their clients"
  ON client_communications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id AND c.user_id = auth.uid()
    )
  );

-- Communication Attachments Policies
CREATE POLICY "Users can view attachments for their communications"
  ON communication_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_communications cc
      JOIN clients c ON cc.client_id = c.id
      WHERE cc.id = communication_id AND c.user_id = auth.uid()
    )
  );

-- Client Activities Policies
CREATE POLICY "Users can view activities for their clients"
  ON client_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activities for their clients"
  ON client_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

-- Client Notes Policies
CREATE POLICY "Users can view notes for their clients"
  ON client_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes for their clients"
  ON client_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notes"
  ON client_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON client_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Client Tags Policies
CREATE POLICY "Users can view own tags"
  ON client_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
  ON client_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON client_tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON client_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Client Categories Policies
CREATE POLICY "Users can view own categories"
  ON client_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON client_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON client_categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON client_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Client Files Policies
CREATE POLICY "Users can view files for their clients"
  ON client_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE id = client_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files for their clients"
  ON client_files FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id AND c.user_id = auth.uid()
    )
  );

-- Client Segments Policies
CREATE POLICY "Users can view own segments"
  ON client_segments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own segments"
  ON client_segments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own segments"
  ON client_segments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own segments"
  ON client_segments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_metadata_updated_at BEFORE UPDATE ON client_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON client_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_segments_updated_at BEFORE UPDATE ON client_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create metadata record when client is created
CREATE OR REPLACE FUNCTION create_client_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO client_metadata (client_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_client_metadata
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_client_metadata();

-- Update client projects count and revenue
CREATE OR REPLACE FUNCTION update_client_projects_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET
    projects_count = (
      SELECT COUNT(*)
      FROM client_projects
      WHERE client_id = NEW.client_id
    ),
    completed_projects = (
      SELECT COUNT(*)
      FROM client_projects
      WHERE client_id = NEW.client_id AND status = 'completed'
    ),
    active_projects = (
      SELECT COUNT(*)
      FROM client_projects
      WHERE client_id = NEW.client_id AND status = 'active'
    ),
    total_revenue = (
      SELECT COALESCE(SUM(value), 0)
      FROM client_projects
      WHERE client_id = NEW.client_id AND status = 'completed'
    ),
    average_project_value = (
      SELECT COALESCE(AVG(value), 0)
      FROM client_projects
      WHERE client_id = NEW.client_id
    )
  WHERE id = NEW.client_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_projects_stats
  AFTER INSERT OR UPDATE OF status, value ON client_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_client_projects_stats();

-- Update last activity timestamp
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET last_activity_at = NEW.timestamp
  WHERE id = NEW.client_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_activity_communication
  AFTER INSERT ON client_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

CREATE TRIGGER trigger_update_last_activity_activity
  AFTER INSERT ON client_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get total clients count for user
CREATE OR REPLACE FUNCTION get_total_clients_count(
  user_uuid UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM clients
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Get active clients count for user
CREATE OR REPLACE FUNCTION get_active_clients_count(
  user_uuid UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM clients
  WHERE user_id = user_uuid
    AND status = 'active';
$$ LANGUAGE sql STABLE;

-- Get total client revenue for user
CREATE OR REPLACE FUNCTION get_total_client_revenue(
  user_uuid UUID
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(total_revenue), 0)
  FROM clients
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Get client statistics
CREATE OR REPLACE FUNCTION get_client_statistics(
  user_uuid UUID
)
RETURNS TABLE (
  total_clients INTEGER,
  active_clients INTEGER,
  lead_clients INTEGER,
  vip_clients INTEGER,
  total_revenue DECIMAL,
  average_client_value DECIMAL,
  average_health_score DECIMAL
) AS $$
  SELECT
    COUNT(*)::INTEGER as total_clients,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_clients,
    COUNT(*) FILTER (WHERE status = 'lead')::INTEGER as lead_clients,
    COUNT(*) FILTER (WHERE status = 'vip')::INTEGER as vip_clients,
    COALESCE(SUM(total_revenue), 0) as total_revenue,
    COALESCE(AVG(total_revenue), 0) as average_client_value,
    COALESCE(AVG(health_score), 0) as average_health_score
  FROM clients
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Get clients needing follow-up
CREATE OR REPLACE FUNCTION get_clients_needing_followup(
  user_uuid UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  company TEXT,
  next_follow_up TIMESTAMPTZ,
  days_overdue INTEGER
) AS $$
  SELECT
    c.id,
    c.name,
    c.email,
    c.company,
    c.next_follow_up,
    EXTRACT(DAY FROM (NOW() - c.next_follow_up))::INTEGER as days_overdue
  FROM clients c
  WHERE c.user_id = user_uuid
    AND c.next_follow_up IS NOT NULL
    AND c.next_follow_up < NOW()
  ORDER BY c.next_follow_up ASC;
$$ LANGUAGE sql STABLE;

-- Get top clients by revenue
CREATE OR REPLACE FUNCTION get_top_clients_by_revenue(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  company TEXT,
  total_revenue DECIMAL,
  projects_count INTEGER,
  status client_status
) AS $$
  SELECT
    id,
    name,
    company,
    total_revenue,
    projects_count,
    status
  FROM clients
  WHERE user_id = user_uuid
  ORDER BY total_revenue DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- Search clients
CREATE OR REPLACE FUNCTION search_clients(
  user_uuid UUID,
  search_query TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  company TEXT,
  status client_status,
  total_revenue DECIMAL,
  rank REAL
) AS $$
  SELECT
    c.id,
    c.name,
    c.email,
    c.company,
    c.status,
    c.total_revenue,
    ts_rank(
      to_tsvector('english', c.name || ' ' || COALESCE(c.company, '') || ' ' || c.email),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM clients c
  WHERE c.user_id = user_uuid
    AND (
      to_tsvector('english', c.name || ' ' || COALESCE(c.company, '') || ' ' || c.email)
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE clients IS 'Client relationship management (CRM) database';
COMMENT ON TABLE client_metadata IS 'Additional metadata for clients';
COMMENT ON TABLE client_projects IS 'Projects associated with clients';
COMMENT ON TABLE client_communications IS 'Communication history with clients';
COMMENT ON TABLE communication_attachments IS 'File attachments for communications';
COMMENT ON TABLE client_activities IS 'Activity timeline for clients';
COMMENT ON TABLE client_notes IS 'Notes and comments about clients';
COMMENT ON TABLE client_tags IS 'Tags for categorizing clients';
COMMENT ON TABLE client_categories IS 'Hierarchical categories for clients';
COMMENT ON TABLE client_files IS 'File storage for client-related documents';
COMMENT ON TABLE client_segments IS 'Dynamic client segments based on criteria';
-- =====================================================
-- COLLABORATION CANVAS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive collaborative whiteboard with drawing tools,
-- shapes, layers, real-time collaboration, and version control
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS tool_type CASCADE;
CREATE TYPE tool_type AS ENUM (
  'select',
  'pen',
  'eraser',
  'shape',
  'text',
  'move',
  'image'
);

DROP TYPE IF EXISTS shape_type CASCADE;
CREATE TYPE shape_type AS ENUM (
  'rectangle',
  'circle',
  'triangle',
  'line',
  'arrow',
  'star',
  'polygon'
);

DROP TYPE IF EXISTS layer_type CASCADE;
CREATE TYPE layer_type AS ENUM (
  'drawing',
  'shape',
  'text',
  'image',
  'group'
);

DROP TYPE IF EXISTS canvas_template CASCADE;
CREATE TYPE canvas_template AS ENUM (
  'blank',
  'grid',
  'wireframe',
  'flowchart',
  'mindmap',
  'diagram'
);

DROP TYPE IF EXISTS collaborator_role CASCADE;
CREATE TYPE collaborator_role AS ENUM (
  'owner',
  'editor',
  'viewer'
);

DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM (
  'png',
  'jpg',
  'svg',
  'pdf'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Canvas Projects
CREATE TABLE IF NOT EXISTS canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template canvas_template NOT NULL DEFAULT 'blank',
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  created_by TEXT NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  share_link TEXT UNIQUE,
  thumbnail TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  fork_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Collaborators
CREATE TABLE IF NOT EXISTS canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  color TEXT NOT NULL,
  cursor_x DECIMAL(10, 2),
  cursor_y DECIMAL(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(canvas_id, user_id)
);

-- Canvas Layers
CREATE TABLE IF NOT EXISTS canvas_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  type layer_type NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  x DECIMAL(10, 2) NOT NULL DEFAULT 0,
  y DECIMAL(10, 2) NOT NULL DEFAULT 0,
  width DECIMAL(10, 2) NOT NULL DEFAULT 100,
  height DECIMAL(10, 2) NOT NULL DEFAULT 100,
  rotation DECIMAL(5, 2) NOT NULL DEFAULT 0,
  scale_x DECIMAL(5, 2) NOT NULL DEFAULT 1,
  scale_y DECIMAL(5, 2) NOT NULL DEFAULT 1,
  opacity DECIMAL(5, 2) NOT NULL DEFAULT 100,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  z_index INTEGER NOT NULL DEFAULT 0,
  group_id UUID REFERENCES canvas_layers(id) ON DELETE SET NULL,
  style JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Versions
CREATE TABLE IF NOT EXISTS canvas_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  snapshot TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comments
CREATE TABLE IF NOT EXISTS canvas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  x DECIMAL(10, 2) NOT NULL,
  y DECIMAL(10, 2) NOT NULL,
  text TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comment Replies
CREATE TABLE IF NOT EXISTS canvas_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES canvas_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Stats (aggregated statistics)
CREATE TABLE IF NOT EXISTS canvas_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_projects INTEGER NOT NULL DEFAULT 0,
  shared_projects INTEGER NOT NULL DEFAULT 0,
  active_collaborators INTEGER NOT NULL DEFAULT 0,
  total_layers INTEGER NOT NULL DEFAULT 0,
  total_drawings INTEGER NOT NULL DEFAULT 0,
  total_versions INTEGER NOT NULL DEFAULT 0,
  total_comments INTEGER NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0,
  template_breakdown JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Canvas Projects Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_template ON canvas_projects(template);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_is_shared ON canvas_projects(is_shared);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_share_link ON canvas_projects(share_link) WHERE share_link IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_canvas_projects_version ON canvas_projects(version);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_view_count ON canvas_projects(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_fork_count ON canvas_projects(fork_count DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_tags ON canvas_projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_name_search ON canvas_projects USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_canvas_projects_description_search ON canvas_projects USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_canvas_projects_created_at ON canvas_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_updated_at ON canvas_projects(updated_at DESC);

-- Canvas Collaborators Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_role ON canvas_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_is_active ON canvas_collaborators(is_active);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_last_seen ON canvas_collaborators(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_created_at ON canvas_collaborators(created_at DESC);

-- Canvas Layers Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_layers_canvas_id ON canvas_layers(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_type ON canvas_layers(type);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_group_id ON canvas_layers(group_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_z_index ON canvas_layers(z_index);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_is_visible ON canvas_layers(is_visible);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_is_locked ON canvas_layers(is_locked);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_data ON canvas_layers USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_style ON canvas_layers USING GIN(style);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_created_at ON canvas_layers(created_at DESC);

-- Canvas Versions Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_version ON canvas_versions(version);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

-- Canvas Comments Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_resolved ON canvas_comments(resolved);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_created_at ON canvas_comments(created_at DESC);

-- Canvas Comment Replies Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_comment_id ON canvas_comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_user_id ON canvas_comment_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_created_at ON canvas_comment_replies(created_at DESC);

-- Canvas Stats Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_stats_user_id ON canvas_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_stats_date ON canvas_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_stats_total_projects ON canvas_stats(total_projects DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_stats_storage_used ON canvas_stats(storage_used DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_stats_created_at ON canvas_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_collaborators_updated_at
  BEFORE UPDATE ON canvas_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_layers_updated_at
  BEFORE UPDATE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at
  BEFORE UPDATE ON canvas_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_stats_updated_at
  BEFORE UPDATE ON canvas_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment version on project update
CREATE OR REPLACE FUNCTION increment_canvas_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_canvas_version
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  WHEN (OLD.updated_at < NEW.updated_at)
  EXECUTE FUNCTION increment_canvas_version();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get canvas statistics
CREATE OR REPLACE FUNCTION get_canvas_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalProjects', COUNT(*),
    'sharedProjects', COUNT(*) FILTER (WHERE is_shared = true),
    'totalLayers', (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id
    ),
    'totalDrawings', (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id AND cl.type = 'drawing'
    ),
    'totalVersions', SUM(version),
    'byTemplate', (
      SELECT json_object_agg(template, cnt)
      FROM (
        SELECT template, COUNT(*) as cnt
        FROM canvas_projects
        WHERE user_id = p_user_id
        GROUP BY template
      ) template_counts
    )
  ) INTO v_stats
  FROM canvas_projects
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search canvas projects
CREATE OR REPLACE FUNCTION search_canvas_projects(
  p_user_id UUID,
  p_search_term TEXT,
  p_template canvas_template DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  template canvas_template,
  modified_at TIMESTAMPTZ,
  view_count INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.template,
    cp.updated_at as modified_at,
    cp.view_count,
    ts_rank(
      to_tsvector('english', cp.name || ' ' || COALESCE(cp.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM canvas_projects cp
  WHERE cp.user_id = p_user_id
    AND (p_template IS NULL OR cp.template = p_template)
    AND (
      p_search_term = '' OR
      to_tsvector('english', cp.name || ' ' || COALESCE(cp.description, '')) @@ plainto_tsquery('english', p_search_term) OR
      p_search_term = ANY(cp.tags)
    )
  ORDER BY relevance DESC, cp.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add collaborator
CREATE OR REPLACE FUNCTION add_collaborator(
  p_canvas_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_role collaborator_role,
  p_color TEXT
)
RETURNS UUID AS $$
DECLARE
  v_collaborator_id UUID;
BEGIN
  INSERT INTO canvas_collaborators (
    canvas_id, user_id, name, email, role, color
  )
  VALUES (
    p_canvas_id, p_user_id, p_name, p_email, p_role, p_color
  )
  ON CONFLICT (canvas_id, user_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true,
    last_seen = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_collaborator_id;

  RETURN v_collaborator_id;
END;
$$ LANGUAGE plpgsql;

-- Update collaborator cursor
CREATE OR REPLACE FUNCTION update_collaborator_cursor(
  p_canvas_id UUID,
  p_user_id UUID,
  p_cursor_x DECIMAL,
  p_cursor_y DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE canvas_collaborators
  SET
    cursor_x = p_cursor_x,
    cursor_y = p_cursor_y,
    is_active = true,
    last_seen = NOW(),
    updated_at = NOW()
  WHERE canvas_id = p_canvas_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create version snapshot
CREATE OR REPLACE FUNCTION create_version_snapshot(
  p_canvas_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT 'System'
)
RETURNS UUID AS $$
DECLARE
  v_version_id UUID;
  v_current_version INTEGER;
  v_canvas_data JSONB;
BEGIN
  -- Get current version
  SELECT version INTO v_current_version
  FROM canvas_projects
  WHERE id = p_canvas_id;

  -- Get all layers
  SELECT json_agg(row_to_json(cl.*)) INTO v_canvas_data
  FROM canvas_layers cl
  WHERE cl.canvas_id = p_canvas_id;

  -- Create version
  INSERT INTO canvas_versions (
    canvas_id, version, name, description, data, created_by
  )
  VALUES (
    p_canvas_id,
    v_current_version + 1,
    COALESCE(p_name, 'Version ' || (v_current_version + 1)),
    p_description,
    COALESCE(v_canvas_data, '[]'::jsonb),
    p_created_by
  )
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Get canvas with layers
CREATE OR REPLACE FUNCTION get_canvas_with_layers(p_canvas_id UUID)
RETURNS JSON AS $$
DECLARE
  v_canvas JSON;
BEGIN
  SELECT json_build_object(
    'project', row_to_json(cp.*),
    'layers', (
      SELECT json_agg(row_to_json(cl.*) ORDER BY cl.z_index)
      FROM canvas_layers cl
      WHERE cl.canvas_id = p_canvas_id
    ),
    'collaborators', (
      SELECT json_agg(row_to_json(cc.*))
      FROM canvas_collaborators cc
      WHERE cc.canvas_id = p_canvas_id
    ),
    'comments', (
      SELECT json_agg(
        json_build_object(
          'comment', row_to_json(cmt.*),
          'replies', (
            SELECT json_agg(row_to_json(r.*) ORDER BY r.created_at)
            FROM canvas_comment_replies r
            WHERE r.comment_id = cmt.id
          )
        )
      )
      FROM canvas_comments cmt
      WHERE cmt.canvas_id = p_canvas_id
    )
  ) INTO v_canvas
  FROM canvas_projects cp
  WHERE cp.id = p_canvas_id;

  RETURN v_canvas;
END;
$$ LANGUAGE plpgsql;

-- Fork canvas project
CREATE OR REPLACE FUNCTION fork_canvas_project(
  p_canvas_id UUID,
  p_user_id UUID,
  p_new_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_new_canvas_id UUID;
  v_original canvas_projects%ROWTYPE;
BEGIN
  -- Get original project
  SELECT * INTO v_original FROM canvas_projects WHERE id = p_canvas_id;

  -- Create new project
  INSERT INTO canvas_projects (
    user_id, name, description, template, width, height,
    background_color, created_by, tags
  )
  VALUES (
    p_user_id,
    p_new_name,
    'Forked from: ' || v_original.name,
    v_original.template,
    v_original.width,
    v_original.height,
    v_original.background_color,
    (SELECT email FROM auth.users WHERE id = p_user_id),
    v_original.tags
  )
  RETURNING id INTO v_new_canvas_id;

  -- Copy layers
  INSERT INTO canvas_layers (
    canvas_id, type, name, data, x, y, width, height,
    rotation, scale_x, scale_y, opacity, is_visible, z_index, style
  )
  SELECT
    v_new_canvas_id, type, name, data, x, y, width, height,
    rotation, scale_x, scale_y, opacity, is_visible, z_index, style
  FROM canvas_layers
  WHERE canvas_id = p_canvas_id;

  -- Increment fork count
  UPDATE canvas_projects
  SET fork_count = fork_count + 1
  WHERE id = p_canvas_id;

  RETURN v_new_canvas_id;
END;
$$ LANGUAGE plpgsql;

-- Update canvas stats daily
CREATE OR REPLACE FUNCTION update_canvas_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO canvas_stats (
    user_id,
    date,
    total_projects,
    shared_projects,
    active_collaborators,
    total_layers,
    total_drawings,
    total_versions,
    total_comments,
    storage_used,
    template_breakdown
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE is_shared = true),
    (
      SELECT COUNT(DISTINCT user_id)
      FROM canvas_collaborators cc
      JOIN canvas_projects cp ON cp.id = cc.canvas_id
      WHERE cp.user_id = p_user_id AND cc.is_active = true
    ),
    (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id
    ),
    (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id AND cl.type = 'drawing'
    ),
    COALESCE(SUM(version), 0),
    (
      SELECT COUNT(*)
      FROM canvas_comments cc
      JOIN canvas_projects cp ON cp.id = cc.canvas_id
      WHERE cp.user_id = p_user_id
    ),
    0,
    (SELECT get_canvas_stats(p_user_id)->>'byTemplate')::jsonb
  FROM canvas_projects
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_projects = EXCLUDED.total_projects,
    shared_projects = EXCLUDED.shared_projects,
    active_collaborators = EXCLUDED.active_collaborators,
    total_layers = EXCLUDED.total_layers,
    total_drawings = EXCLUDED.total_drawings,
    total_versions = EXCLUDED.total_versions,
    total_comments = EXCLUDED.total_comments,
    template_breakdown = EXCLUDED.template_breakdown,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_stats ENABLE ROW LEVEL SECURITY;

-- Canvas Projects Policies
CREATE POLICY canvas_projects_select_policy ON canvas_projects
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_shared = true OR
    EXISTS (
      SELECT 1 FROM canvas_collaborators cc
      WHERE cc.canvas_id = id AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY canvas_projects_insert_policy ON canvas_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY canvas_projects_update_policy ON canvas_projects
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM canvas_collaborators cc
      WHERE cc.canvas_id = id AND cc.user_id = auth.uid() AND cc.role IN ('owner', 'editor')
    )
  );

CREATE POLICY canvas_projects_delete_policy ON canvas_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Canvas Collaborators Policies
CREATE POLICY canvas_collaborators_select_policy ON canvas_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND (cp.user_id = auth.uid() OR cp.is_shared = true)
    )
  );

CREATE POLICY canvas_collaborators_insert_policy ON canvas_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND cp.user_id = auth.uid()
    )
  );

-- Canvas Layers Policies
CREATE POLICY canvas_layers_select_policy ON canvas_layers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND (
        cp.user_id = auth.uid() OR
        cp.is_shared = true OR
        EXISTS (SELECT 1 FROM canvas_collaborators WHERE canvas_id = cp.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY canvas_layers_insert_policy ON canvas_layers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      JOIN canvas_collaborators cc ON cc.canvas_id = cp.id
      WHERE cp.id = canvas_id AND cc.user_id = auth.uid() AND cc.role IN ('owner', 'editor')
    )
  );

-- Canvas Versions Policies
CREATE POLICY canvas_versions_select_policy ON canvas_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND cp.user_id = auth.uid()
    )
  );

-- Canvas Comments Policies
CREATE POLICY canvas_comments_select_policy ON canvas_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND (
        cp.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM canvas_collaborators WHERE canvas_id = cp.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY canvas_comments_insert_policy ON canvas_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Canvas Stats Policies
CREATE POLICY canvas_stats_select_policy ON canvas_stats
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all canvas projects
-- SELECT * FROM canvas_projects WHERE user_id = 'user-id' ORDER BY updated_at DESC;

-- Example: Search canvas projects
-- SELECT * FROM search_canvas_projects('user-id', 'wireframe', NULL, 20);

-- Example: Get canvas statistics
-- SELECT * FROM get_canvas_stats('user-id');

-- Example: Add collaborator
-- SELECT add_collaborator('canvas-id', 'user-id', 'John Doe', 'john@example.com', 'editor', '#FF6B6B');

-- Example: Update cursor
-- SELECT update_collaborator_cursor('canvas-id', 'user-id', 150.5, 200.3);

-- Example: Create version snapshot
-- SELECT create_version_snapshot('canvas-id', 'Design v2', 'Added new components', 'user@example.com');

-- Example: Get canvas with layers
-- SELECT * FROM get_canvas_with_layers('canvas-id');

-- Example: Fork canvas project
-- SELECT fork_canvas_project('canvas-id', 'user-id', 'My Fork of Wireframe');

-- Example: Update daily canvas stats
-- SELECT update_canvas_stats_daily('user-id');

-- =====================================================
-- END OF COLLABORATION CANVAS SYSTEM SCHEMA
-- =====================================================
-- =====================================================
-- COLLABORATION MEETINGS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive meeting management with video conferencing,
-- screen sharing, recording, participant controls, and analytics
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS meeting_type CASCADE;
CREATE TYPE meeting_type AS ENUM (
  'video',
  'voice',
  'screen-share'
);

DROP TYPE IF EXISTS meeting_status CASCADE;
CREATE TYPE meeting_status AS ENUM (
  'scheduled',
  'ongoing',
  'completed',
  'cancelled'
);

DROP TYPE IF EXISTS participant_role CASCADE;
CREATE TYPE participant_role AS ENUM (
  'host',
  'co-host',
  'participant',
  'guest'
);

DROP TYPE IF EXISTS view_mode CASCADE;
CREATE TYPE view_mode AS ENUM (
  'grid',
  'speaker',
  'sidebar',
  'fullscreen'
);

DROP TYPE IF EXISTS meeting_recurrence CASCADE;
CREATE TYPE meeting_recurrence AS ENUM (
  'none',
  'daily',
  'weekly',
  'biweekly',
  'monthly'
);

DROP TYPE IF EXISTS recording_quality CASCADE;
CREATE TYPE recording_quality AS ENUM (
  'low',
  'medium',
  'high',
  'hd'
);

DROP TYPE IF EXISTS connection_quality CASCADE;
CREATE TYPE connection_quality AS ENUM (
  'excellent',
  'good',
  'fair',
  'poor'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Meetings
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  type meeting_type NOT NULL DEFAULT 'video',
  status meeting_status NOT NULL DEFAULT 'scheduled',
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 25,
  meeting_link TEXT,
  passcode TEXT,
  recording_url TEXT,
  is_recording BOOLEAN NOT NULL DEFAULT false,
  recording_started_at TIMESTAMPTZ,
  recording_duration INTEGER,
  recurrence meeting_recurrence NOT NULL DEFAULT 'none',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  reminders INTEGER[] DEFAULT '{15,30,60}',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Participants
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role participant_role NOT NULL DEFAULT 'participant',
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_off BOOLEAN NOT NULL DEFAULT false,
  is_hand_raised BOOLEAN NOT NULL DEFAULT false,
  is_screen_sharing BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  total_duration INTEGER,
  connection_quality connection_quality DEFAULT 'good',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Recordings
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration INTEGER NOT NULL DEFAULT 0,
  file_size BIGINT NOT NULL DEFAULT 0,
  quality recording_quality NOT NULL DEFAULT 'medium',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  transcript_url TEXT,
  highlights_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Analytics
CREATE TABLE IF NOT EXISTS meeting_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_participants INTEGER NOT NULL DEFAULT 0,
  peak_participants INTEGER NOT NULL DEFAULT 0,
  average_duration INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER NOT NULL DEFAULT 0,
  join_rate DECIMAL(5, 2) DEFAULT 0,
  dropoff_rate DECIMAL(5, 2) DEFAULT 0,
  average_connection_quality TEXT,
  chat_messages INTEGER NOT NULL DEFAULT 0,
  hand_raises INTEGER NOT NULL DEFAULT 0,
  screen_shares INTEGER NOT NULL DEFAULT 0,
  recording_views INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Stats (aggregated statistics)
CREATE TABLE IF NOT EXISTS meeting_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_meetings INTEGER NOT NULL DEFAULT 0,
  upcoming_meetings INTEGER NOT NULL DEFAULT 0,
  ongoing_meetings INTEGER NOT NULL DEFAULT 0,
  completed_meetings INTEGER NOT NULL DEFAULT 0,
  cancelled_meetings INTEGER NOT NULL DEFAULT 0,
  total_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_participants INTEGER NOT NULL DEFAULT 0,
  average_participants DECIMAL(10, 2) DEFAULT 0,
  total_recordings INTEGER NOT NULL DEFAULT 0,
  type_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meeting Chat Messages
CREATE TABLE IF NOT EXISTS meeting_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  recipient_id UUID REFERENCES meeting_participants(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Polls
CREATE TABLE IF NOT EXISTS meeting_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  ends_at TIMESTAMPTZ,
  results JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Meetings Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON meetings(type);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_date ON meetings(scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_time ON meetings(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_meetings_recurrence ON meetings(recurrence);
CREATE INDEX IF NOT EXISTS idx_meetings_is_recording ON meetings(is_recording);
CREATE INDEX IF NOT EXISTS idx_meetings_title_search ON meetings USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_meetings_description_search ON meetings USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_meetings_settings ON meetings USING GIN(settings);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);

-- Meeting Participants Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_role ON meeting_participants(role);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_is_host ON meeting_participants(is_host);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_joined_at ON meeting_participants(joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_connection_quality ON meeting_participants(connection_quality);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_name_search ON meeting_participants USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_meeting_participants_created_at ON meeting_participants(created_at DESC);

-- Meeting Recordings Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_user_id ON meeting_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_quality ON meeting_recordings(quality);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_started_at ON meeting_recordings(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_duration ON meeting_recordings(duration DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_file_size ON meeting_recordings(file_size DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_view_count ON meeting_recordings(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_title_search ON meeting_recordings USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_created_at ON meeting_recordings(created_at DESC);

-- Meeting Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_analytics_meeting_id ON meeting_analytics(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_analytics_user_id ON meeting_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_analytics_total_participants ON meeting_analytics(total_participants DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_analytics_peak_participants ON meeting_analytics(peak_participants DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_analytics_created_at ON meeting_analytics(created_at DESC);

-- Meeting Stats Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_stats_user_id ON meeting_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_stats_date ON meeting_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_stats_total_meetings ON meeting_stats(total_meetings DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_stats_total_hours ON meeting_stats(total_hours DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_stats_created_at ON meeting_stats(created_at DESC);

-- Meeting Chat Messages Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_chat_messages_meeting_id ON meeting_chat_messages(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_chat_messages_participant_id ON meeting_chat_messages(participant_id);
CREATE INDEX IF NOT EXISTS idx_meeting_chat_messages_is_private ON meeting_chat_messages(is_private);
CREATE INDEX IF NOT EXISTS idx_meeting_chat_messages_created_at ON meeting_chat_messages(created_at DESC);

-- Meeting Polls Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_polls_meeting_id ON meeting_polls(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_polls_created_by ON meeting_polls(created_by);
CREATE INDEX IF NOT EXISTS idx_meeting_polls_created_at ON meeting_polls(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_participants_updated_at
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at
  BEFORE UPDATE ON meeting_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_analytics_updated_at
  BEFORE UPDATE ON meeting_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_stats_updated_at
  BEFORE UPDATE ON meeting_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_polls_updated_at
  BEFORE UPDATE ON meeting_polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track participant duration
CREATE OR REPLACE FUNCTION track_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    NEW.total_duration = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_participant_duration
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION track_participant_duration();

-- Track recording duration
CREATE OR REPLACE FUNCTION track_recording_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_recording_duration
  BEFORE UPDATE ON meeting_recordings
  FOR EACH ROW
  EXECUTE FUNCTION track_recording_duration();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get meeting statistics
CREATE OR REPLACE FUNCTION get_meeting_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalMeetings', COUNT(*),
    'upcomingMeetings', COUNT(*) FILTER (WHERE status = 'scheduled'),
    'ongoingMeetings', COUNT(*) FILTER (WHERE status = 'ongoing'),
    'completedMeetings', COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelledMeetings', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'totalHours', ROUND(SUM(duration) / 60.0, 2),
    'totalRecordings', COUNT(*) FILTER (WHERE recording_url IS NOT NULL),
    'byType', (
      SELECT json_object_agg(type, cnt)
      FROM (
        SELECT type, COUNT(*) as cnt
        FROM meetings
        WHERE user_id = p_user_id
        GROUP BY type
      ) type_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM meetings
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    )
  ) INTO v_stats
  FROM meetings
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search meetings
CREATE OR REPLACE FUNCTION search_meetings(
  p_user_id UUID,
  p_search_term TEXT,
  p_type meeting_type DEFAULT NULL,
  p_status meeting_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  type meeting_type,
  status meeting_status,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.scheduled_date,
    m.scheduled_time,
    m.type,
    m.status,
    ts_rank(
      to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM meetings m
  WHERE m.user_id = p_user_id
    AND (p_type IS NULL OR m.type = p_type)
    AND (p_status IS NULL OR m.status = p_status)
    AND (
      p_search_term = '' OR
      to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, m.scheduled_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Start meeting
CREATE OR REPLACE FUNCTION start_meeting(p_meeting_id UUID)
RETURNS JSON AS $$
DECLARE
  v_meeting meetings%ROWTYPE;
BEGIN
  UPDATE meetings
  SET
    status = 'ongoing',
    updated_at = NOW()
  WHERE id = p_meeting_id
  RETURNING * INTO v_meeting;

  RETURN json_build_object(
    'success', true,
    'meetingId', v_meeting.id,
    'meetingLink', v_meeting.meeting_link
  );
END;
$$ LANGUAGE plpgsql;

-- End meeting
CREATE OR REPLACE FUNCTION end_meeting(p_meeting_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE meetings
  SET
    status = 'completed',
    is_recording = false,
    updated_at = NOW()
  WHERE id = p_meeting_id;

  -- Mark all participants as left
  UPDATE meeting_participants
  SET
    left_at = NOW(),
    updated_at = NOW()
  WHERE meeting_id = p_meeting_id AND left_at IS NULL;

  RETURN json_build_object('success', true, 'meetingId', p_meeting_id);
END;
$$ LANGUAGE plpgsql;

-- Add participant
CREATE OR REPLACE FUNCTION add_participant(
  p_meeting_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_role participant_role DEFAULT 'participant'
)
RETURNS UUID AS $$
DECLARE
  v_participant_id UUID;
BEGIN
  INSERT INTO meeting_participants (
    meeting_id, user_id, name, email, role,
    is_host, joined_at
  )
  VALUES (
    p_meeting_id, p_user_id, p_name, p_email, p_role,
    (p_role = 'host'), NOW()
  )
  RETURNING id INTO v_participant_id;

  RETURN v_participant_id;
END;
$$ LANGUAGE plpgsql;

-- Get meeting analytics
CREATE OR REPLACE FUNCTION get_meeting_analytics(p_meeting_id UUID)
RETURNS JSON AS $$
DECLARE
  v_analytics JSON;
BEGIN
  SELECT json_build_object(
    'totalParticipants', COUNT(DISTINCT mp.id),
    'peakParticipants', (
      SELECT COUNT(*)
      FROM meeting_participants
      WHERE meeting_id = p_meeting_id
      AND joined_at IS NOT NULL
    ),
    'averageDuration', ROUND(AVG(mp.total_duration), 2),
    'totalDuration', SUM(mp.total_duration),
    'chatMessages', (
      SELECT COUNT(*) FROM meeting_chat_messages WHERE meeting_id = p_meeting_id
    ),
    'handRaises', COUNT(*) FILTER (WHERE mp.is_hand_raised),
    'screenShares', COUNT(*) FILTER (WHERE mp.is_screen_sharing)
  ) INTO v_analytics
  FROM meeting_participants mp
  WHERE mp.meeting_id = p_meeting_id;

  RETURN v_analytics;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming meetings
CREATE OR REPLACE FUNCTION get_upcoming_meetings(
  p_user_id UUID,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  duration INTEGER,
  participants_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.scheduled_date,
    m.scheduled_time,
    m.duration,
    COUNT(mp.id) as participants_count
  FROM meetings m
  LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
  WHERE m.user_id = p_user_id
    AND m.status = 'scheduled'
    AND m.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days_ahead
  GROUP BY m.id, m.title, m.scheduled_date, m.scheduled_time, m.duration
  ORDER BY m.scheduled_date, m.scheduled_time;
END;
$$ LANGUAGE plpgsql;

-- Update meeting stats daily
CREATE OR REPLACE FUNCTION update_meeting_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO meeting_stats (
    user_id,
    date,
    total_meetings,
    upcoming_meetings,
    ongoing_meetings,
    completed_meetings,
    cancelled_meetings,
    total_hours,
    total_participants,
    average_participants,
    total_recordings,
    type_breakdown,
    status_breakdown
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'scheduled'),
    COUNT(*) FILTER (WHERE status = 'ongoing'),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    ROUND(SUM(duration) / 60.0, 2),
    (SELECT COUNT(*) FROM meeting_participants mp JOIN meetings m ON m.id = mp.meeting_id WHERE m.user_id = p_user_id),
    ROUND((SELECT COUNT(*) FROM meeting_participants mp JOIN meetings m ON m.id = mp.meeting_id WHERE m.user_id = p_user_id)::DECIMAL / GREATEST(COUNT(*), 1), 2),
    COUNT(*) FILTER (WHERE recording_url IS NOT NULL),
    (SELECT get_meeting_stats(p_user_id)->>'byType')::jsonb,
    (SELECT get_meeting_stats(p_user_id)->>'byStatus')::jsonb
  FROM meetings
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_meetings = EXCLUDED.total_meetings,
    upcoming_meetings = EXCLUDED.upcoming_meetings,
    ongoing_meetings = EXCLUDED.ongoing_meetings,
    completed_meetings = EXCLUDED.completed_meetings,
    cancelled_meetings = EXCLUDED.cancelled_meetings,
    total_hours = EXCLUDED.total_hours,
    total_participants = EXCLUDED.total_participants,
    average_participants = EXCLUDED.average_participants,
    total_recordings = EXCLUDED.total_recordings,
    type_breakdown = EXCLUDED.type_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_polls ENABLE ROW LEVEL SECURITY;

-- Meetings Policies
CREATE POLICY meetings_select_policy ON meetings
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = host_id);

CREATE POLICY meetings_insert_policy ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY meetings_update_policy ON meetings
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = host_id);

CREATE POLICY meetings_delete_policy ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Meeting Participants Policies
CREATE POLICY meeting_participants_select_policy ON meeting_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

CREATE POLICY meeting_participants_insert_policy ON meeting_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

CREATE POLICY meeting_participants_update_policy ON meeting_participants
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

-- Meeting Recordings Policies
CREATE POLICY meeting_recordings_select_policy ON meeting_recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY meeting_recordings_insert_policy ON meeting_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY meeting_recordings_update_policy ON meeting_recordings
  FOR UPDATE USING (auth.uid() = user_id);

-- Meeting Analytics Policies
CREATE POLICY meeting_analytics_select_policy ON meeting_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Meeting Stats Policies
CREATE POLICY meeting_stats_select_policy ON meeting_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Meeting Chat Messages Policies
CREATE POLICY meeting_chat_messages_select_policy ON meeting_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

CREATE POLICY meeting_chat_messages_insert_policy ON meeting_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

-- Meeting Polls Policies
CREATE POLICY meeting_polls_select_policy ON meeting_polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all upcoming meetings
-- SELECT * FROM get_upcoming_meetings('user-id', 7);

-- Example: Search meetings
-- SELECT * FROM search_meetings('user-id', 'standup', NULL, 'scheduled', 20);

-- Example: Get meeting statistics
-- SELECT * FROM get_meeting_stats('user-id');

-- Example: Start meeting
-- SELECT * FROM start_meeting('meeting-id');

-- Example: End meeting
-- SELECT * FROM end_meeting('meeting-id');

-- Example: Add participant
-- SELECT add_participant('meeting-id', 'user-id', 'John Doe', 'john@example.com', 'participant');

-- Example: Get meeting analytics
-- SELECT * FROM get_meeting_analytics('meeting-id');

-- Example: Update daily meeting stats
-- SELECT update_meeting_stats_daily('user-id');

-- =====================================================
-- END OF COLLABORATION MEETINGS SYSTEM SCHEMA
-- =====================================================
-- =====================================================
-- COLLABORATION SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Migration: 20251126_collaboration_system
-- Description: Comprehensive database for Team Collaboration
-- Features: Chat, Teams, Workspace, Meetings (Video/Voice), Feedback, Media, Canvas, Analytics
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CHAT & COMMUNICATIONS MODULE
-- =====================================================

-- Channels (chat rooms)
CREATE TABLE IF NOT EXISTS collaboration_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('public', 'private', 'direct')) DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_archived BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'file', 'system', 'call')) DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}',
  thread_count INTEGER DEFAULT 0,
  parent_message_id UUID REFERENCES collaboration_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members
CREATE TABLE IF NOT EXISTS collaboration_channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- =====================================================
-- TEAMS MODULE
-- =====================================================

-- Teams
CREATE TABLE IF NOT EXISTS collaboration_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  team_type TEXT CHECK (team_type IN ('project', 'department', 'cross-functional')) DEFAULT 'project',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS collaboration_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES collaboration_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'lead', 'member', 'contributor')) DEFAULT 'member',
  status TEXT CHECK (status IN ('active', 'inactive', 'busy', 'away')) DEFAULT 'active',
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  tasks_completed INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- =====================================================
-- WORKSPACE MODULE
-- =====================================================

-- Workspace folders
CREATE TABLE IF NOT EXISTS collaboration_workspace_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES collaboration_workspace_folders(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace files
CREATE TABLE IF NOT EXISTS collaboration_workspace_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  folder_id UUID REFERENCES collaboration_workspace_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File shares
CREATE TABLE IF NOT EXISTS collaboration_file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES collaboration_workspace_files(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  permission TEXT CHECK (permission IN ('view', 'edit', 'admin')) DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_id, shared_with_user_id)
);

-- =====================================================
-- MEETINGS MODULE (VIDEO/VOICE CALLS)
-- =====================================================

-- Meetings
CREATE TABLE IF NOT EXISTS collaboration_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('video', 'voice', 'hybrid')) DEFAULT 'video',
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  meeting_url TEXT,
  scheduled_start_time TIMESTAMPTZ NOT NULL,
  scheduled_end_time TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 50,
  is_recording BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_duration INTEGER,
  agenda JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting participants
CREATE TABLE IF NOT EXISTS collaboration_meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES collaboration_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('invited', 'accepted', 'declined', 'joined', 'left')) DEFAULT 'invited',
  camera_enabled BOOLEAN DEFAULT true,
  microphone_enabled BOOLEAN DEFAULT true,
  screen_sharing BOOLEAN DEFAULT false,
  hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  UNIQUE(meeting_id, user_id)
);

-- Meeting recordings
CREATE TABLE IF NOT EXISTS collaboration_meeting_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES collaboration_meetings(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_size_mb DECIMAL(10, 2),
  thumbnail_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEEDBACK MODULE
-- =====================================================

-- Feedback submissions
CREATE TABLE IF NOT EXISTS collaboration_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('bug', 'feature', 'improvement', 'question', 'other')) DEFAULT 'other',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_starred BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback replies
CREATE TABLE IF NOT EXISTS collaboration_feedback_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES collaboration_feedback(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reply_text TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback votes
CREATE TABLE IF NOT EXISTS collaboration_feedback_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES collaboration_feedback(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- =====================================================
-- MEDIA MODULE
-- =====================================================

-- Media library
CREATE TABLE IF NOT EXISTS collaboration_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document')) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  duration_seconds INTEGER,
  dimensions JSONB,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media shares
CREATE TABLE IF NOT EXISTS collaboration_media_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES collaboration_media(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, shared_with_user_id)
);

-- =====================================================
-- CANVAS MODULE (WHITEBOARD)
-- =====================================================

-- Canvas boards
CREATE TABLE IF NOT EXISTS collaboration_canvas_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  canvas_data JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 1080,
  background_color TEXT DEFAULT '#FFFFFF',
  is_template BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas collaborators
CREATE TABLE IF NOT EXISTS collaboration_canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID REFERENCES collaboration_canvas_boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'edit', 'admin')) DEFAULT 'view',
  cursor_position JSONB,
  is_active BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(canvas_id, user_id)
);

-- Canvas exports
CREATE TABLE IF NOT EXISTS collaboration_canvas_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID REFERENCES collaboration_canvas_boards(id) ON DELETE CASCADE,
  export_format TEXT CHECK (export_format IN ('png', 'pdf', 'svg')) NOT NULL,
  export_url TEXT NOT NULL,
  file_size_mb DECIMAL(10, 2),
  exported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS MODULE
-- =====================================================

-- Activity tracking
CREATE TABLE IF NOT EXISTS collaboration_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team performance metrics
CREATE TABLE IF NOT EXISTS collaboration_team_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES collaboration_teams(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  files_shared INTEGER DEFAULT 0,
  meetings_held INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, metric_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_channels_workspace ON collaboration_channels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_channels_type ON collaboration_channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_last_activity ON collaboration_channels(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON collaboration_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON collaboration_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON collaboration_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON collaboration_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON collaboration_channel_members(user_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner ON collaboration_teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON collaboration_teams(status);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON collaboration_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON collaboration_team_members(user_id);

-- Workspace indexes
CREATE INDEX IF NOT EXISTS idx_workspace_folders_parent ON collaboration_workspace_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_folder ON collaboration_workspace_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_uploaded_by ON collaboration_workspace_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_shares_file ON collaboration_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_user ON collaboration_file_shares(shared_with_user_id);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_host ON collaboration_meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON collaboration_meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_start ON collaboration_meetings(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON collaboration_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON collaboration_meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting ON collaboration_meeting_recordings(meeting_id);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_workspace ON collaboration_feedback(workspace_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON collaboration_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON collaboration_feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback ON collaboration_feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback ON collaboration_feedback_votes(feedback_id);

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_workspace ON collaboration_media(workspace_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON collaboration_media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON collaboration_media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_shares_media ON collaboration_media_shares(media_id);

-- Canvas indexes
CREATE INDEX IF NOT EXISTS idx_canvas_workspace ON collaboration_canvas_boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_canvas_created_by ON collaboration_canvas_boards(created_by);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_canvas ON collaboration_canvas_collaborators(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_user ON collaboration_canvas_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_exports_canvas ON collaboration_canvas_exports(canvas_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_workspace ON collaboration_analytics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON collaboration_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON collaboration_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_team_metrics_team ON collaboration_team_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_team_metrics_date ON collaboration_team_metrics(metric_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE collaboration_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_feedback_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_media_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_canvas_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_canvas_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_team_metrics ENABLE ROW LEVEL SECURITY;

-- Chat RLS policies
CREATE POLICY "Users can view public channels" ON collaboration_channels FOR SELECT USING (type = 'public');
CREATE POLICY "Channel members can view private channels" ON collaboration_channels FOR SELECT USING (
  type = 'private' AND EXISTS (
    SELECT 1 FROM collaboration_channel_members WHERE channel_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create channels" ON collaboration_channels FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Channel creators can update" ON collaboration_channels FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can view channel messages" ON collaboration_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM collaboration_channel_members WHERE channel_id = collaboration_messages.channel_id AND user_id = auth.uid())
);
CREATE POLICY "Users can post messages" ON collaboration_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own messages" ON collaboration_messages FOR UPDATE USING (user_id = auth.uid());

-- Teams RLS policies
CREATE POLICY "Users can view own teams" ON collaboration_teams FOR SELECT USING (
  owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_team_members WHERE team_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create teams" ON collaboration_teams FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Team owners can update teams" ON collaboration_teams FOR UPDATE USING (owner_id = auth.uid());

-- Workspace RLS policies
CREATE POLICY "Users can view shared files" ON collaboration_workspace_files FOR SELECT USING (
  uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_file_shares WHERE file_id = id AND shared_with_user_id = auth.uid()
  )
);
CREATE POLICY "Users can upload files" ON collaboration_workspace_files FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Meetings RLS policies
CREATE POLICY "Users can view invited meetings" ON collaboration_meetings FOR SELECT USING (
  host_id = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_meeting_participants WHERE meeting_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create meetings" ON collaboration_meetings FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "Meeting hosts can update" ON collaboration_meetings FOR UPDATE USING (host_id = auth.uid());

-- Feedback RLS policies
CREATE POLICY "Users can view workspace feedback" ON collaboration_feedback FOR SELECT USING (true);
CREATE POLICY "Users can submit feedback" ON collaboration_feedback FOR INSERT WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users can update own feedback" ON collaboration_feedback FOR UPDATE USING (submitted_by = auth.uid());

-- Media RLS policies
CREATE POLICY "Users can view shared media" ON collaboration_media FOR SELECT USING (
  uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_media_shares WHERE media_id = id AND shared_with_user_id = auth.uid()
  )
);
CREATE POLICY "Users can upload media" ON collaboration_media FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Canvas RLS policies
CREATE POLICY "Users can view accessible canvases" ON collaboration_canvas_boards FOR SELECT USING (
  created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_canvas_collaborators WHERE canvas_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create canvases" ON collaboration_canvas_boards FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Canvas creators can update" ON collaboration_canvas_boards FOR UPDATE USING (created_by = auth.uid());

-- Analytics RLS policies
CREATE POLICY "Users can view own analytics" ON collaboration_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert analytics" ON collaboration_analytics FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON collaboration_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON collaboration_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON collaboration_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_folders_updated_at BEFORE UPDATE ON collaboration_workspace_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_files_updated_at BEFORE UPDATE ON collaboration_workspace_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON collaboration_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON collaboration_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON collaboration_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_canvas_updated_at BEFORE UPDATE ON collaboration_canvas_boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update channel member count
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_channels
  SET member_count = (
    SELECT COUNT(*) FROM collaboration_channel_members WHERE channel_id = NEW.channel_id
  )
  WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_member_count_trigger
  AFTER INSERT OR DELETE ON collaboration_channel_members
  FOR EACH ROW EXECUTE FUNCTION update_channel_member_count();

-- Update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_teams
  SET member_count = (
    SELECT COUNT(*) FROM collaboration_team_members WHERE team_id = NEW.team_id
  )
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_member_count_trigger
  AFTER INSERT OR DELETE ON collaboration_team_members
  FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get unread message count for user in channel
CREATE OR REPLACE FUNCTION get_unread_message_count(p_channel_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM collaboration_messages m
    JOIN collaboration_channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.channel_id = p_channel_id
      AND cm.user_id = p_user_id
      AND m.created_at > cm.last_read_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team engagement score
CREATE OR REPLACE FUNCTION calculate_team_engagement_score(p_team_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  SELECT
    COALESCE(AVG(performance_score), 0)::INTEGER
  INTO v_score
  FROM collaboration_team_members
  WHERE team_id = p_team_id AND status = 'active';

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UNIVERSAL PINPOINT SYSTEM (UPS) TABLES
-- =====================================================

-- UPS Media Files table
CREATE TABLE IF NOT EXISTS upf_media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document', 'code', 'design')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  version TEXT DEFAULT 'v1.0',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- UPS Comments table (Pinpoint Feedback)
CREATE TABLE IF NOT EXISTS upf_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES upf_media_files(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES upf_comments(id) ON DELETE CASCADE, -- For threaded replies
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('text', 'voice', 'screen', 'drawing')),
  position_data JSONB DEFAULT '{}', -- Flexible positioning for different media types
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'in_progress', 'wont_fix')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  mentions TEXT[] DEFAULT '{}', -- Array of mentioned user IDs
  voice_note_url TEXT,
  voice_note_duration INTEGER,
  screen_recording_url TEXT,
  drawing_data TEXT, -- SVG or base64 image data
  ai_analysis JSONB, -- AI-powered insights
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPS Comment Attachments
CREATE TABLE IF NOT EXISTS upf_comment_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPS Comment Reactions
CREATE TABLE IF NOT EXISTS upf_comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- emoji code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- UPS Comment Assignments
CREATE TABLE IF NOT EXISTS upf_comment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, assigned_to)
);

-- UPS Indexes
CREATE INDEX IF NOT EXISTS idx_upf_media_files_project ON upf_media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_upf_media_files_type ON upf_media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_upf_comments_file ON upf_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_project ON upf_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_user ON upf_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_parent ON upf_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_upf_comments_status ON upf_comments(status);
CREATE INDEX IF NOT EXISTS idx_upf_comments_priority ON upf_comments(priority);
CREATE INDEX IF NOT EXISTS idx_upf_comment_attachments_comment ON upf_comment_attachments(comment_id);
CREATE INDEX IF NOT EXISTS idx_upf_comment_reactions_comment ON upf_comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_upf_comment_assignments_comment ON upf_comment_assignments(comment_id);
CREATE INDEX IF NOT EXISTS idx_upf_comment_assignments_user ON upf_comment_assignments(assigned_to);

-- UPS RLS Policies
ALTER TABLE upf_media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comment_assignments ENABLE ROW LEVEL SECURITY;

-- Media files: project members can view/edit
CREATE POLICY upf_media_files_select ON upf_media_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_media_files.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY upf_media_files_insert ON upf_media_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_media_files.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Comments: project members can view/create
CREATE POLICY upf_comments_select ON upf_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_comments.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY upf_comments_insert ON upf_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_comments.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY upf_comments_update ON upf_comments FOR UPDATE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = upf_comments.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('admin', 'owner')
  ));

-- Triggers
CREATE TRIGGER update_upf_media_files_updated_at
  BEFORE UPDATE ON upf_media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upf_comments_updated_at
  BEFORE UPDATE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 25 (20 collaboration + 5 UPS)
-- Indexes created: 62
-- RLS policies: 30
-- Triggers: 12
-- Helper functions: 2
-- =====================================================
-- ============================================================================
-- COMMUNITY HUB SYSTEM - SUPABASE MIGRATION
-- Complete community platform with social networking
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS post_type CASCADE;
CREATE TYPE post_type AS ENUM (
  'text',
  'image',
  'video',
  'link',
  'poll',
  'event',
  'job',
  'showcase'
);

DROP TYPE IF EXISTS post_visibility CASCADE;
CREATE TYPE post_visibility AS ENUM (
  'public',
  'connections',
  'private'
);

DROP TYPE IF EXISTS member_category CASCADE;
CREATE TYPE member_category AS ENUM (
  'freelancer',
  'client',
  'agency',
  'student'
);

DROP TYPE IF EXISTS member_availability CASCADE;
CREATE TYPE member_availability AS ENUM (
  'available',
  'busy',
  'away',
  'offline'
);

DROP TYPE IF EXISTS group_type CASCADE;
CREATE TYPE group_type AS ENUM (
  'public',
  'private',
  'secret'
);

DROP TYPE IF EXISTS event_type CASCADE;
CREATE TYPE event_type AS ENUM (
  'online',
  'offline',
  'hybrid'
);

-- ============================================================================
-- TABLE: community_members
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_online BOOLEAN DEFAULT false,
  bio TEXT,
  total_projects INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  completion_rate INTEGER DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  response_time TEXT,
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  portfolio_url TEXT,
  is_connected BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_following BOOLEAN DEFAULT false,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  category member_category NOT NULL DEFAULT 'freelancer',
  availability member_availability NOT NULL DEFAULT 'available',
  hourly_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  endorsements INTEGER DEFAULT 0,
  testimonials INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type post_type NOT NULL DEFAULT 'text',
  visibility post_visibility NOT NULL DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentions UUID[] DEFAULT ARRAY[]::UUID[],
  is_pinned BOOLEAN DEFAULT false,
  is_promoted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_post_likes
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ============================================================================
-- TABLE: community_comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  type group_type NOT NULL DEFAULT 'public',
  member_count INTEGER DEFAULT 0,
  admin_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_group_members
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_pending BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- ============================================================================
-- TABLE: community_events
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type event_type NOT NULL DEFAULT 'online',
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  attendee_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_event_attendees
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  is_attending BOOLEAN DEFAULT true,
  is_interested BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id)
);

-- ============================================================================
-- TABLE: community_connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- community_members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_category ON community_members(category);
CREATE INDEX IF NOT EXISTS idx_community_members_availability ON community_members(availability);
CREATE INDEX IF NOT EXISTS idx_community_members_is_online ON community_members(is_online);
CREATE INDEX IF NOT EXISTS idx_community_members_is_verified ON community_members(is_verified);
CREATE INDEX IF NOT EXISTS idx_community_members_rating ON community_members(rating DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_name_trgm ON community_members USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_community_members_skills ON community_members USING gin(skills);

-- community_posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes_count ON community_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_community_posts_hashtags ON community_posts USING gin(hashtags);

-- community_post_likes indexes
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id ON community_post_likes(user_id);

-- community_comments indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_id ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at DESC);

-- community_groups indexes
CREATE INDEX IF NOT EXISTS idx_community_groups_type ON community_groups(type);
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_member_count ON community_groups(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_at ON community_groups(created_at DESC);

-- community_group_members indexes
CREATE INDEX IF NOT EXISTS idx_community_group_members_group_id ON community_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_community_group_members_member_id ON community_group_members(member_id);

-- community_events indexes
CREATE INDEX IF NOT EXISTS idx_community_events_organizer_id ON community_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_community_events_type ON community_events(type);
CREATE INDEX IF NOT EXISTS idx_community_events_event_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_community_events_category ON community_events(category);

-- community_event_attendees indexes
CREATE INDEX IF NOT EXISTS idx_community_event_attendees_event_id ON community_event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_community_event_attendees_member_id ON community_event_attendees(member_id);

-- community_connections indexes
CREATE INDEX IF NOT EXISTS idx_community_connections_requester_id ON community_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_community_connections_recipient_id ON community_connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_community_connections_status ON community_connections(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_connections ENABLE ROW LEVEL SECURITY;

-- community_members policies
CREATE POLICY "Anyone can view community members"
  ON community_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON community_members FOR UPDATE
  USING (auth.uid() = user_id);

-- community_posts policies
CREATE POLICY "Anyone can view public posts"
  ON community_posts FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view their own posts"
  ON community_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.id = community_posts.author_id
    AND community_members.user_id = auth.uid()
  ));

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.id = community_posts.author_id
    AND community_members.user_id = auth.uid()
  ));

-- community_post_likes policies
CREATE POLICY "Users can like posts"
  ON community_post_likes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.id = community_post_likes.user_id
    AND community_members.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_members_updated_at
  BEFORE UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get trending posts
CREATE OR REPLACE FUNCTION get_trending_posts(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  content TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.content,
    p.likes_count,
    p.comments_count,
    p.shares_count
  FROM community_posts p
  WHERE p.visibility = 'public'
  ORDER BY (p.likes_count + p.comments_count + p.shares_count) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search community members
CREATE OR REPLACE FUNCTION search_community_members(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  title TEXT,
  rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.title,
    m.rating
  FROM community_members m
  WHERE
    m.name ILIKE '%' || p_search_term || '%'
    OR m.title ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(m.skills)
  ORDER BY m.rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get member statistics
CREATE OR REPLACE FUNCTION get_member_statistics(p_member_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_posts', COUNT(DISTINCT p.id),
      'total_likes', COALESCE(SUM(p.likes_count), 0),
      'total_comments', COALESCE(SUM(p.comments_count), 0),
      'total_shares', COALESCE(SUM(p.shares_count), 0)
    )
    FROM community_posts p
    WHERE p.author_id = p_member_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
