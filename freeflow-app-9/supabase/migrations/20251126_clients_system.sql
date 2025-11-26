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

CREATE TYPE client_status AS ENUM (
  'active',
  'inactive',
  'lead',
  'prospect',
  'churned',
  'vip'
);

CREATE TYPE client_type AS ENUM (
  'individual',
  'business',
  'enterprise',
  'agency',
  'nonprofit'
);

CREATE TYPE client_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE communication_type AS ENUM (
  'email',
  'phone',
  'meeting',
  'video_call',
  'message',
  'note'
);

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

CREATE TYPE communication_direction AS ENUM (
  'inbound',
  'outbound'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Clients Table
CREATE TABLE clients (
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
CREATE TABLE client_metadata (
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
CREATE TABLE client_projects (
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
CREATE TABLE client_communications (
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
CREATE TABLE communication_attachments (
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
CREATE TABLE client_activities (
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
CREATE TABLE client_notes (
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
CREATE TABLE client_tags (
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
CREATE TABLE client_categories (
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
CREATE TABLE client_files (
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
CREATE TABLE client_segments (
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
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_priority ON clients(priority);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_industry ON clients(industry);
CREATE INDEX idx_clients_country ON clients(country);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX idx_clients_last_contact ON clients(last_contact DESC);
CREATE INDEX idx_clients_next_follow_up ON clients(next_follow_up);
CREATE INDEX idx_clients_health_score ON clients(health_score DESC);
CREATE INDEX idx_clients_lead_score ON clients(lead_score DESC);
CREATE INDEX idx_clients_total_revenue ON clients(total_revenue DESC);
CREATE INDEX idx_clients_tags ON clients USING gin(tags);
CREATE INDEX idx_clients_categories ON clients USING gin(categories);
CREATE INDEX idx_clients_user_status ON clients(user_id, status);
CREATE INDEX idx_clients_user_type ON clients(user_id, type);

-- Client Metadata Indexes
CREATE INDEX idx_client_metadata_client_id ON client_metadata(client_id);
CREATE INDEX idx_client_metadata_source ON client_metadata(source);
CREATE INDEX idx_client_metadata_segments ON client_metadata USING gin(segments);

-- Client Projects Indexes
CREATE INDEX idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX idx_client_projects_status ON client_projects(status);
CREATE INDEX idx_client_projects_start_date ON client_projects(start_date DESC);
CREATE INDEX idx_client_projects_value ON client_projects(value DESC);

-- Client Communications Indexes
CREATE INDEX idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX idx_client_communications_user_id ON client_communications(user_id);
CREATE INDEX idx_client_communications_type ON client_communications(type);
CREATE INDEX idx_client_communications_timestamp ON client_communications(timestamp DESC);
CREATE INDEX idx_client_communications_direction ON client_communications(direction);

-- Communication Attachments Indexes
CREATE INDEX idx_communication_attachments_communication_id ON communication_attachments(communication_id);

-- Client Activities Indexes
CREATE INDEX idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX idx_client_activities_user_id ON client_activities(user_id);
CREATE INDEX idx_client_activities_type ON client_activities(type);
CREATE INDEX idx_client_activities_timestamp ON client_activities(timestamp DESC);

-- Client Notes Indexes
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX idx_client_notes_user_id ON client_notes(user_id);
CREATE INDEX idx_client_notes_pinned ON client_notes(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_client_notes_created_at ON client_notes(created_at DESC);

-- Client Tags Indexes
CREATE INDEX idx_client_tags_user_id ON client_tags(user_id);
CREATE INDEX idx_client_tags_name ON client_tags(name);

-- Client Categories Indexes
CREATE INDEX idx_client_categories_user_id ON client_categories(user_id);
CREATE INDEX idx_client_categories_parent_id ON client_categories(parent_id);

-- Client Files Indexes
CREATE INDEX idx_client_files_client_id ON client_files(client_id);
CREATE INDEX idx_client_files_uploaded_by ON client_files(uploaded_by);
CREATE INDEX idx_client_files_created_at ON client_files(created_at DESC);

-- Client Segments Indexes
CREATE INDEX idx_client_segments_user_id ON client_segments(user_id);

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
