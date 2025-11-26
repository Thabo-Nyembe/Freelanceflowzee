-- ============================================================================
-- Profile System - Production Database Schema
-- ============================================================================
-- Comprehensive user profile management with skills, experience, education,
-- portfolio, social links, and account settings
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE profile_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE account_type AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE privacy_level AS ENUM ('public', 'connections', 'private');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  location TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  website TEXT,
  company TEXT,
  title TEXT,
  status profile_status NOT NULL DEFAULT 'active',
  account_type account_type NOT NULL DEFAULT 'free',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level skill_level NOT NULL DEFAULT 'intermediate',
  years_of_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
  endorsements INTEGER NOT NULL DEFAULT 0 CHECK (endorsements >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Experience
CREATE TABLE experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Education
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN NOT NULL DEFAULT FALSE,
  grade TEXT,
  activities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  images TEXT[] DEFAULT '{}',
  url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Links
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_name TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Profile Settings
CREATE TABLE profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  privacy_level privacy_level NOT NULL DEFAULT 'public',
  show_email BOOLEAN NOT NULL DEFAULT FALSE,
  show_phone BOOLEAN NOT NULL DEFAULT FALSE,
  show_location BOOLEAN NOT NULL DEFAULT TRUE,
  allow_messages BOOLEAN NOT NULL DEFAULT TRUE,
  allow_connections BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile Stats
CREATE TABLE profile_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_views INTEGER NOT NULL DEFAULT 0,
  profile_views_this_month INTEGER NOT NULL DEFAULT 0,
  connections INTEGER NOT NULL DEFAULT 0,
  endorsements INTEGER NOT NULL DEFAULT 0,
  portfolio_views INTEGER NOT NULL DEFAULT 0,
  portfolio_likes INTEGER NOT NULL DEFAULT 0,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User Profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_account_type ON user_profiles(account_type);

-- Skills indexes
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_level ON skills(level);
CREATE INDEX idx_skills_endorsements ON skills(endorsements DESC);

-- Experience indexes
CREATE INDEX idx_experience_user_id ON experience(user_id);
CREATE INDEX idx_experience_current ON experience(current);
CREATE INDEX idx_experience_start_date ON experience(start_date DESC);

-- Education indexes
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_education_current ON education(current);

-- Portfolio indexes
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX idx_portfolio_category ON portfolio(category);
CREATE INDEX idx_portfolio_featured ON portfolio(featured);
CREATE INDEX idx_portfolio_likes ON portfolio(likes DESC);
CREATE INDEX idx_portfolio_views ON portfolio(views DESC);
CREATE INDEX idx_portfolio_tags ON portfolio USING GIN(tags);

-- Social Links indexes
CREATE INDEX idx_social_links_user_id ON social_links(user_id);
CREATE INDEX idx_social_links_platform ON social_links(platform);

-- Profile Settings indexes
CREATE INDEX idx_profile_settings_user_id ON profile_settings(user_id);

-- Profile Stats indexes
CREATE INDEX idx_profile_stats_user_id ON profile_stats(user_id);

-- Achievements indexes
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON profile_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_stats_updated_at
  BEFORE UPDATE ON profile_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile settings and stats on profile creation
CREATE OR REPLACE FUNCTION create_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO profile_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_defaults_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_defaults();

-- Auto-update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_profile user_profiles%ROWTYPE;
  v_skills_count INTEGER;
  v_experience_count INTEGER;
BEGIN
  -- Get profile data
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Basic info (40 points)
  IF v_profile.first_name IS NOT NULL AND v_profile.last_name IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.email IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.bio IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.avatar IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.location IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.phone IS NOT NULL THEN v_score := v_score + 5; END IF;

  -- Professional info (30 points)
  IF v_profile.company IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.title IS NOT NULL THEN v_score := v_score + 5; END IF;

  SELECT COUNT(*) INTO v_skills_count FROM skills WHERE user_id = v_profile.user_id;
  IF v_skills_count >= 5 THEN v_score := v_score + 10; END IF;

  SELECT COUNT(*) INTO v_experience_count FROM experience WHERE user_id = v_profile.user_id;
  IF v_experience_count >= 2 THEN v_score := v_score + 10; END IF;

  -- Verification (20 points)
  IF v_profile.email_verified THEN v_score := v_score + 10; END IF;
  IF v_profile.phone_verified THEN v_score := v_score + 10; END IF;

  -- Additional (10 points)
  IF v_profile.website IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.cover_image IS NOT NULL THEN v_score := v_score + 5; END IF;

  -- Update stats
  UPDATE profile_stats
  SET completion_percentage = LEAST(v_score, 100),
      updated_at = NOW()
  WHERE user_id = v_profile.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_on_profile
  AFTER INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_skills
  AFTER INSERT OR UPDATE OR DELETE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_experience
  AFTER INSERT OR UPDATE OR DELETE ON experience
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get complete profile with stats
CREATE OR REPLACE FUNCTION get_complete_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_profile JSON;
BEGIN
  SELECT json_build_object(
    'profile', row_to_json(up.*),
    'stats', row_to_json(ps.*),
    'settings', row_to_json(pst.*),
    'skillsCount', (SELECT COUNT(*) FROM skills WHERE user_id = p_user_id),
    'experienceCount', (SELECT COUNT(*) FROM experience WHERE user_id = p_user_id),
    'portfolioCount', (SELECT COUNT(*) FROM portfolio WHERE user_id = p_user_id),
    'achievementsCount', (SELECT COUNT(*) FROM achievements WHERE user_id = p_user_id)
  )
  INTO v_profile
  FROM user_profiles up
  LEFT JOIN profile_stats ps ON ps.user_id = up.user_id
  LEFT JOIN profile_settings pst ON pst.user_id = up.user_id
  WHERE up.user_id = p_user_id;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql;

-- Get top skills by endorsements
CREATE OR REPLACE FUNCTION get_top_skills(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  name TEXT,
  category TEXT,
  level skill_level,
  endorsements INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name, s.category, s.level, s.endorsements
  FROM skills s
  WHERE s.user_id = p_user_id
  ORDER BY s.endorsements DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM profile_settings
      WHERE user_id = user_profiles.user_id
      AND privacy_level = 'public'
    )
  );

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Skills policies
CREATE POLICY "Public skills are viewable by everyone"
  ON skills FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profile_settings ps
    WHERE ps.user_id = skills.user_id AND ps.privacy_level = 'public'
  ));

CREATE POLICY "Users can manage their own skills"
  ON skills FOR ALL
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage their own experience"
  ON experience FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education"
  ON education FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public portfolio is viewable by everyone"
  ON portfolio FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profile_settings ps
    WHERE ps.user_id = portfolio.user_id AND ps.privacy_level = 'public'
  ));

CREATE POLICY "Users can manage their own portfolio"
  ON portfolio FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social links"
  ON social_links FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view and update their own settings"
  ON profile_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats"
  ON profile_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);
