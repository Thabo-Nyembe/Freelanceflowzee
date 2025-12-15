-- Batch 74: Team Hub, Profile, Reports V2 Integration
-- Created: December 15, 2024

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Member details
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(100),
  department VARCHAR(100),
  avatar_url VARCHAR(500),
  phone VARCHAR(50),

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'on_leave')),
  is_lead BOOLEAN DEFAULT false,

  -- Performance metrics
  projects_count INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),

  -- Work details
  hire_date DATE,
  hourly_rate DECIMAL(10,2),

  -- Metadata
  skills JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for team members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own team members" ON team_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own team members" ON team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own team members" ON team_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own team members" ON team_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER PROFILES TABLE (extended profile data)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Basic info
  name VARCHAR(255),
  title VARCHAR(255),
  company VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),

  -- Contact info
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  location VARCHAR(255),

  -- Professional info
  hourly_rate DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'away', 'offline')),

  -- Stats
  projects_completed INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Skills and experience
  skills JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  portfolio_items JSONB DEFAULT '[]',

  -- Social links
  social_links JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Public profiles can be viewed by anyone (for portfolio)
CREATE POLICY "Anyone can view public profiles" ON user_profiles
  FOR SELECT USING (true);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Report details
  report_number VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'financial' CHECK (type IN ('financial', 'sales', 'analytics', 'performance', 'custom')),

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'scheduled', 'archived')),

  -- Data info
  data_points INTEGER DEFAULT 0,
  file_size_mb DECIMAL(10,2),
  file_url VARCHAR(500),

  -- Schedule
  is_recurring BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(100),
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Date range
  date_from DATE,
  date_to DATE,

  -- Configuration
  config JSONB DEFAULT '{}',
  filters JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_at TIMESTAMPTZ
);

-- Report sequence
CREATE SEQUENCE IF NOT EXISTS report_number_seq START WITH 1;

-- RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- REVENUE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Entry details
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  type VARCHAR(50) DEFAULT 'income' CHECK (type IN ('income', 'expense', 'refund')),
  category VARCHAR(100),

  -- Source
  source VARCHAR(100),
  source_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Date
  entry_date DATE DEFAULT CURRENT_DATE,

  -- Description
  description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for revenue entries
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revenue entries" ON revenue_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own revenue entries" ON revenue_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revenue entries" ON revenue_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own revenue entries" ON revenue_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_is_lead ON team_members(is_lead);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified ON user_profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);

CREATE INDEX IF NOT EXISTS idx_revenue_entries_user_id ON revenue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_entry_date ON revenue_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_revenue_entries_type ON revenue_entries(type);
