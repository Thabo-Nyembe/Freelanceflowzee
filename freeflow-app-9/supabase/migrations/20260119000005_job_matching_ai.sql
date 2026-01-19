/**
 * Job Matching with AI - FreeFlow A+++ Implementation
 * Complete Upwork-style job board with AI-powered matching
 * Beats competitors with: ML embeddings, smart scoring, career recommendations
 */

-- Enable vector extension for AI embeddings (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- FREELANCER PROFILE EXTENSIONS
-- ============================================================================

-- Freelancer skills with proficiency levels
CREATE TABLE IF NOT EXISTS freelancer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_profile_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,

  skill_name TEXT NOT NULL,
  proficiency TEXT DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience DECIMAL(4,1) DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  skill_test_score DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, skill_name)
);

-- Portfolio items for matching
CREATE TABLE IF NOT EXISTS freelancer_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_profile_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES service_categories(id),
  tags TEXT[] DEFAULT '{}',

  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  external_url TEXT,

  -- Project details
  client_name TEXT,
  completion_date DATE,
  project_value DECIMAL(12,2),

  -- Metrics (for showing results)
  metrics JSONB DEFAULT '{}', -- {"conversion_increase": "40%", "users_reached": "10000"}

  -- AI embedding for matching
  embedding vector(1536),

  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add embedding column to seller_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_profiles' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN embedding vector(1536);
  END IF;

  -- Add experience_years column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_profiles' AND column_name = 'experience_years'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN experience_years INTEGER DEFAULT 0;
  END IF;

  -- Add hourly_rate columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_profiles' AND column_name = 'hourly_rate_min'
  ) THEN
    ALTER TABLE seller_profiles ADD COLUMN hourly_rate_min DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE seller_profiles ADD COLUMN hourly_rate_max DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- JOB BOARD TABLES (Upwork-style client job posts)
-- ============================================================================

-- Client job posts (different from service listings - clients post these)
CREATE TABLE IF NOT EXISTS freelancer_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL,
  category_id UUID REFERENCES service_categories(id),
  subcategory_id UUID REFERENCES service_categories(id),
  tags TEXT[] DEFAULT '{}',

  -- Job type
  job_type TEXT DEFAULT 'one_time' CHECK (job_type IN ('one_time', 'ongoing', 'full_time', 'part_time')),
  experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('entry', 'intermediate', 'expert')),

  -- Budget
  budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',

  -- Timeline
  estimated_hours INTEGER,
  duration TEXT, -- "less_than_week", "1_to_4_weeks", "1_to_3_months", "3_to_6_months", "more_than_6_months"
  deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,

  -- Location/remote
  location_type TEXT DEFAULT 'remote' CHECK (location_type IN ('remote', 'onsite', 'hybrid')),
  location_country TEXT,
  location_city TEXT,
  timezone_preference TEXT,

  -- Requirements
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  questions JSONB DEFAULT '[]', -- Screening questions

  -- AI embedding for matching
  embedding vector(1536),

  -- Stats
  views_count INTEGER DEFAULT 0,
  proposals_count INTEGER DEFAULT 0,
  interviews_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'in_review', 'filled', 'cancelled', 'closed')),
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,

  -- Visibility
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'invite_only', 'private')),
  invited_freelancers UUID[] DEFAULT '{}',

  -- Client preferences
  preferred_freelancer_level TEXT[], -- ['level_1', 'level_2', 'top_rated', 'pro']
  min_success_rate DECIMAL(5,2),
  requires_verification BOOLEAN DEFAULT false,

  posted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Required skills for jobs with importance weighting
CREATE TABLE IF NOT EXISTS job_required_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES freelancer_jobs(id) ON DELETE CASCADE,

  skill_name TEXT NOT NULL,
  importance INTEGER DEFAULT 3 CHECK (importance BETWEEN 1 AND 5), -- 5 = must have, 1 = nice to have
  years_required INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, skill_name)
);

-- Freelancer proposals (applications to jobs)
CREATE TABLE IF NOT EXISTS job_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES freelancer_jobs(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_profile_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,

  -- Proposal content
  cover_letter TEXT NOT NULL,
  proposed_rate DECIMAL(12,2) NOT NULL,
  rate_type TEXT DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'hourly')),
  estimated_duration TEXT,

  -- Milestones (for fixed-price)
  milestones JSONB DEFAULT '[]',
  /*
    [
      {"description": "Phase 1: Design", "amount": 500, "days": 7},
      {"description": "Phase 2: Development", "amount": 1500, "days": 14}
    ]
  */

  -- Answers to screening questions
  question_answers JSONB DEFAULT '{}',

  -- Attachments/samples
  attachments TEXT[] DEFAULT '{}',
  relevant_portfolio_items UUID[] DEFAULT '{}',

  -- AI match score
  match_score INTEGER DEFAULT 0, -- 0-100
  match_reasons TEXT[] DEFAULT '{}',
  skills_matched TEXT[] DEFAULT '{}',
  skills_missing TEXT[] DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'draft', 'submitted', 'viewed', 'shortlisted',
    'interviewing', 'offer_sent', 'accepted',
    'rejected', 'withdrawn'
  )),

  -- Interview
  interview_scheduled_at TIMESTAMPTZ,
  interview_notes TEXT,

  -- Offer
  offer_amount DECIMAL(12,2),
  offer_message TEXT,
  offer_sent_at TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,
  offer_response_at TIMESTAMPTZ,

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, freelancer_id)
);

-- Job invitations (client invites specific freelancers)
CREATE TABLE IF NOT EXISTS job_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES freelancer_jobs(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  message TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'declined', 'expired')),

  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, freelancer_id)
);

-- Saved jobs (freelancers save jobs for later)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES freelancer_jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, user_id)
);

-- Job matches (AI-generated matches stored for quick retrieval)
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES freelancer_jobs(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Match details
  match_score INTEGER NOT NULL, -- 0-100
  similarity_score DECIMAL(5,4), -- Cosine similarity from embeddings
  skill_match_score DECIMAL(5,4),
  experience_match_score DECIMAL(5,4),
  availability_match_score DECIMAL(5,4),

  match_reasons TEXT[] DEFAULT '{}',
  skills_matched TEXT[] DEFAULT '{}',
  skills_missing TEXT[] DEFAULT '{}',

  -- Rate recommendation
  recommended_rate_min DECIMAL(12,2),
  recommended_rate_max DECIMAL(12,2),
  recommended_rate_optimal DECIMAL(12,2),

  -- Competition analysis
  competition_level TEXT, -- 'low', 'medium', 'high'
  win_probability DECIMAL(5,2),

  -- Career growth
  career_growth_score INTEGER,

  -- Status
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,

  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  UNIQUE(job_id, freelancer_id)
);

-- Client profiles (for job posters)
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  company_name TEXT,
  company_size TEXT, -- 'solo', 'small', 'medium', 'large', 'enterprise'
  industry TEXT,
  website_url TEXT,

  -- Stats
  jobs_posted INTEGER DEFAULT 0,
  jobs_filled INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  average_hourly_rate DECIMAL(10,2) DEFAULT 0,

  -- Hiring behavior
  average_interview_time_hours INTEGER,
  average_hire_time_days INTEGER,
  rehire_rate DECIMAL(5,2) DEFAULT 0,

  -- Ratings
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  payment_verified BOOLEAN DEFAULT false,

  -- Location
  country TEXT,
  city TEXT,
  timezone TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Freelancer skills indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_skills_user_id ON freelancer_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_skills_skill_name ON freelancer_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_freelancer_skills_proficiency ON freelancer_skills(proficiency);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_portfolio_user_id ON freelancer_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_portfolio_category ON freelancer_portfolio(category_id);

-- Job indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_client_id ON freelancer_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_status ON freelancer_jobs(status);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_category ON freelancer_jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_posted_at ON freelancer_jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_budget ON freelancer_jobs(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_experience ON freelancer_jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_location_type ON freelancer_jobs(location_type);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_required_skills ON freelancer_jobs USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_tags ON freelancer_jobs USING GIN(tags);

-- Proposal indexes
CREATE INDEX IF NOT EXISTS idx_job_proposals_job_id ON job_proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_job_proposals_freelancer_id ON job_proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_job_proposals_status ON job_proposals(status);
CREATE INDEX IF NOT EXISTS idx_job_proposals_match_score ON job_proposals(match_score DESC);

-- Match indexes
CREATE INDEX IF NOT EXISTS idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_freelancer_id ON job_matches(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_active ON job_matches(freelancer_id) WHERE NOT is_dismissed AND expires_at > NOW();

-- Vector indexes for AI similarity search
CREATE INDEX IF NOT EXISTS idx_freelancer_jobs_embedding ON freelancer_jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_freelancer_portfolio_embedding ON freelancer_portfolio USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Saved jobs index
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);

-- Invitation indexes
CREATE INDEX IF NOT EXISTS idx_job_invitations_freelancer ON job_invitations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_job ON job_invitations(job_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to search jobs by embedding similarity
CREATE OR REPLACE FUNCTION search_jobs_by_embedding(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fj.id,
    fj.title,
    1 - (fj.embedding <=> query_embedding) AS similarity
  FROM freelancer_jobs fj
  WHERE fj.status = 'open'
    AND fj.embedding IS NOT NULL
    AND 1 - (fj.embedding <=> query_embedding) > match_threshold
  ORDER BY fj.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find matching freelancers for a job
CREATE OR REPLACE FUNCTION find_matching_freelancers(
  p_job_id UUID,
  match_count INT DEFAULT 50
)
RETURNS TABLE (
  freelancer_id UUID,
  display_name TEXT,
  similarity FLOAT,
  skill_overlap INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  job_embedding vector(1536);
  job_skills TEXT[];
BEGIN
  -- Get job embedding and skills
  SELECT fj.embedding, fj.required_skills
  INTO job_embedding, job_skills
  FROM freelancer_jobs fj
  WHERE fj.id = p_job_id;

  RETURN QUERY
  SELECT
    sp.user_id AS freelancer_id,
    sp.display_name,
    CASE
      WHEN sp.embedding IS NOT NULL AND job_embedding IS NOT NULL
      THEN 1 - (sp.embedding <=> job_embedding)
      ELSE 0.0
    END AS similarity,
    (
      SELECT COUNT(*)::INT
      FROM unnest(sp.skills) s
      WHERE s = ANY(job_skills)
    ) AS skill_overlap
  FROM seller_profiles sp
  WHERE sp.status = 'active'
    AND sp.vacation_mode = false
  ORDER BY
    CASE
      WHEN sp.embedding IS NOT NULL AND job_embedding IS NOT NULL
      THEN sp.embedding <=> job_embedding
      ELSE 1.0
    END
  LIMIT match_count;
END;
$$;

-- Function to calculate comprehensive match score
CREATE OR REPLACE FUNCTION calculate_job_match_score(
  p_freelancer_id UUID,
  p_job_id UUID
)
RETURNS TABLE (
  total_score INT,
  similarity_score DECIMAL,
  skill_score DECIMAL,
  experience_score DECIMAL,
  availability_score DECIMAL,
  matched_skills TEXT[],
  missing_skills TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile seller_profiles%ROWTYPE;
  v_job freelancer_jobs%ROWTYPE;
  v_similarity DECIMAL := 0;
  v_skill_score DECIMAL := 0;
  v_experience_score DECIMAL := 0;
  v_availability_score DECIMAL := 0;
  v_matched TEXT[] := '{}';
  v_missing TEXT[] := '{}';
  v_freelancer_skills TEXT[];
BEGIN
  -- Get freelancer profile
  SELECT * INTO v_profile FROM seller_profiles WHERE user_id = p_freelancer_id;

  -- Get job details
  SELECT * INTO v_job FROM freelancer_jobs WHERE id = p_job_id;

  IF v_profile IS NULL OR v_job IS NULL THEN
    RETURN QUERY SELECT 0, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, '{}'::TEXT[], '{}'::TEXT[];
    RETURN;
  END IF;

  -- Calculate embedding similarity (30% weight)
  IF v_profile.embedding IS NOT NULL AND v_job.embedding IS NOT NULL THEN
    v_similarity := 1 - (v_profile.embedding <=> v_job.embedding);
  END IF;

  -- Get freelancer skills
  SELECT ARRAY_AGG(fs.skill_name) INTO v_freelancer_skills
  FROM freelancer_skills fs
  WHERE fs.user_id = p_freelancer_id;

  v_freelancer_skills := COALESCE(v_freelancer_skills, v_profile.skills);

  -- Calculate skill match (35% weight)
  IF v_job.required_skills IS NOT NULL AND array_length(v_job.required_skills, 1) > 0 THEN
    SELECT
      ARRAY_AGG(rs) FILTER (WHERE rs = ANY(COALESCE(v_freelancer_skills, '{}'))),
      ARRAY_AGG(rs) FILTER (WHERE NOT (rs = ANY(COALESCE(v_freelancer_skills, '{}'))))
    INTO v_matched, v_missing
    FROM unnest(v_job.required_skills) rs;

    v_matched := COALESCE(v_matched, '{}');
    v_missing := COALESCE(v_missing, '{}');

    v_skill_score := array_length(v_matched, 1)::DECIMAL /
                     NULLIF(array_length(v_job.required_skills, 1), 0);
  ELSE
    v_skill_score := 1;
  END IF;

  -- Calculate experience match (20% weight)
  v_experience_score := CASE v_job.experience_level
    WHEN 'entry' THEN 1
    WHEN 'intermediate' THEN
      CASE WHEN COALESCE(v_profile.experience_years, 0) >= 2 THEN 1
           ELSE COALESCE(v_profile.experience_years, 0)::DECIMAL / 2 END
    WHEN 'expert' THEN
      CASE WHEN COALESCE(v_profile.experience_years, 0) >= 5 THEN 1
           ELSE COALESCE(v_profile.experience_years, 0)::DECIMAL / 5 END
    ELSE 1
  END;

  -- Calculate availability match (15% weight)
  IF v_job.estimated_hours IS NOT NULL AND v_job.estimated_hours > 0 THEN
    v_availability_score := LEAST(1, COALESCE(v_profile.available_hours_per_week, 40)::DECIMAL /
                                     (v_job.estimated_hours::DECIMAL / 4)); -- Assume 4-week project
  ELSE
    v_availability_score := 1;
  END IF;

  -- Calculate total weighted score
  RETURN QUERY SELECT
    ROUND((
      COALESCE(v_similarity, 0) * 0.30 +
      COALESCE(v_skill_score, 0) * 0.35 +
      COALESCE(v_experience_score, 0) * 0.20 +
      COALESCE(v_availability_score, 0) * 0.15
    ) * 100)::INT AS total_score,
    COALESCE(v_similarity, 0) AS similarity_score,
    COALESCE(v_skill_score, 0) AS skill_score,
    COALESCE(v_experience_score, 0) AS experience_score,
    COALESCE(v_availability_score, 0) AS availability_score,
    v_matched AS matched_skills,
    v_missing AS missing_skills;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE freelancer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Freelancer skills policies
CREATE POLICY "Users can view any skills" ON freelancer_skills
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON freelancer_skills
  FOR ALL USING (auth.uid() = user_id);

-- Portfolio policies
CREATE POLICY "Public can view portfolio" ON freelancer_portfolio
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own portfolio" ON freelancer_portfolio
  FOR ALL USING (auth.uid() = user_id);

-- Job policies
CREATE POLICY "Anyone can view open jobs" ON freelancer_jobs
  FOR SELECT USING (status = 'open' OR client_id = auth.uid());
CREATE POLICY "Clients can manage own jobs" ON freelancer_jobs
  FOR ALL USING (auth.uid() = client_id);

-- Required skills policies
CREATE POLICY "Anyone can view job skills" ON job_required_skills
  FOR SELECT USING (true);
CREATE POLICY "Job owners can manage skills" ON job_required_skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM freelancer_jobs WHERE id = job_id AND client_id = auth.uid())
  );

-- Proposal policies
CREATE POLICY "Freelancers can view own proposals" ON job_proposals
  FOR SELECT USING (freelancer_id = auth.uid());
CREATE POLICY "Job owners can view proposals" ON job_proposals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM freelancer_jobs WHERE id = job_id AND client_id = auth.uid())
  );
CREATE POLICY "Freelancers can create proposals" ON job_proposals
  FOR INSERT WITH CHECK (freelancer_id = auth.uid());
CREATE POLICY "Freelancers can update own proposals" ON job_proposals
  FOR UPDATE USING (freelancer_id = auth.uid());
CREATE POLICY "Job owners can update proposal status" ON job_proposals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM freelancer_jobs WHERE id = job_id AND client_id = auth.uid())
  );

-- Invitation policies
CREATE POLICY "Freelancers can view own invitations" ON job_invitations
  FOR SELECT USING (freelancer_id = auth.uid() OR client_id = auth.uid());
CREATE POLICY "Clients can create invitations" ON job_invitations
  FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Users can update own invitations" ON job_invitations
  FOR UPDATE USING (freelancer_id = auth.uid() OR client_id = auth.uid());

-- Saved jobs policies
CREATE POLICY "Users can manage saved jobs" ON saved_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Match policies
CREATE POLICY "Users can view own matches" ON job_matches
  FOR SELECT USING (freelancer_id = auth.uid());
CREATE POLICY "System can manage matches" ON job_matches
  FOR ALL USING (true); -- Will be restricted at API level

-- Client profile policies
CREATE POLICY "Anyone can view client profiles" ON client_profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own client profile" ON client_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-generate slug for jobs
CREATE OR REPLACE FUNCTION generate_job_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      )
    ) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_job_slug_trigger ON freelancer_jobs;
CREATE TRIGGER generate_job_slug_trigger
  BEFORE INSERT ON freelancer_jobs
  FOR EACH ROW EXECUTE FUNCTION generate_job_slug();

-- Update timestamps
CREATE TRIGGER update_freelancer_skills_updated_at
  BEFORE UPDATE ON freelancer_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_freelancer_portfolio_updated_at
  BEFORE UPDATE ON freelancer_portfolio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_freelancer_jobs_updated_at
  BEFORE UPDATE ON freelancer_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_proposals_updated_at
  BEFORE UPDATE ON job_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update proposal count on job
CREATE OR REPLACE FUNCTION update_job_proposals_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE freelancer_jobs
    SET proposals_count = proposals_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE freelancer_jobs
    SET proposals_count = GREATEST(0, proposals_count - 1)
    WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_proposals_count_trigger ON job_proposals;
CREATE TRIGGER update_proposals_count_trigger
  AFTER INSERT OR DELETE ON job_proposals
  FOR EACH ROW EXECUTE FUNCTION update_job_proposals_count();
