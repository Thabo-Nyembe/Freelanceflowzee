-- Feature Roadmap - Coming Soon Features & User Feedback
-- Manage upcoming features, user requests, votes, and notifications

-- ENUMS
DROP TYPE IF EXISTS feature_status CASCADE;
DROP TYPE IF EXISTS feature_priority CASCADE;
DROP TYPE IF EXISTS feature_category CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

CREATE TYPE feature_status AS ENUM (
  'planned', 'in-progress', 'in-review', 'completed', 'on-hold', 'cancelled'
);

CREATE TYPE feature_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE feature_category AS ENUM (
  'ai', 'collaboration', 'productivity', 'analytics', 'creative', 'business', 'security', 'performance'
);

CREATE TYPE request_status AS ENUM ('pending', 'under-review', 'approved', 'declined', 'implemented');

-- TABLES
DROP TABLE IF EXISTS roadmap_features CASCADE;
DROP TABLE IF EXISTS feature_requests CASCADE;
DROP TABLE IF EXISTS feature_votes CASCADE;
DROP TABLE IF EXISTS feature_notifications CASCADE;
DROP TABLE IF EXISTS feature_updates CASCADE;

CREATE TABLE roadmap_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Feature Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category feature_category NOT NULL,
  status feature_status NOT NULL DEFAULT 'planned',
  priority feature_priority NOT NULL DEFAULT 'medium',

  -- Timeline
  estimated_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Progress
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Details
  benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Engagement
  votes_count INTEGER NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  subscribers_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,

  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_feature_id UUID REFERENCES roadmap_features(id) ON DELETE SET NULL,

  -- Request Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category feature_category NOT NULL,
  priority feature_priority NOT NULL DEFAULT 'medium',
  status request_status NOT NULL DEFAULT 'pending',

  -- Use Case
  use_case TEXT,
  expected_benefit TEXT,
  alternative_solutions TEXT,

  -- Engagement
  votes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,

  -- Admin Response
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),

  -- Implementation
  implemented_at TIMESTAMPTZ,
  implementation_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE feature_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_feature_id UUID REFERENCES roadmap_features(id) ON DELETE CASCADE,
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,

  -- Vote Details
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) DEFAULT 'upvote',
  comment TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Can only vote once per feature/request
  UNIQUE(user_id, roadmap_feature_id),
  UNIQUE(user_id, feature_request_id),
  CHECK (
    (roadmap_feature_id IS NOT NULL AND feature_request_id IS NULL) OR
    (roadmap_feature_id IS NULL AND feature_request_id IS NOT NULL)
  )
);

CREATE TABLE feature_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_feature_id UUID REFERENCES roadmap_features(id) ON DELETE CASCADE,
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,

  -- Notification Preferences
  notify_on_update BOOLEAN NOT NULL DEFAULT true,
  notify_on_completion BOOLEAN NOT NULL DEFAULT true,
  notify_on_status_change BOOLEAN NOT NULL DEFAULT true,

  -- Email Preferences
  email TEXT,
  send_email BOOLEAN NOT NULL DEFAULT true,

  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, roadmap_feature_id),
  UNIQUE(user_id, feature_request_id),
  CHECK (
    (roadmap_feature_id IS NOT NULL AND feature_request_id IS NULL) OR
    (roadmap_feature_id IS NULL AND feature_request_id IS NOT NULL)
  )
);

CREATE TABLE feature_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_feature_id UUID NOT NULL REFERENCES roadmap_features(id) ON DELETE CASCADE,

  -- Update Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  update_type TEXT CHECK (update_type IN ('progress', 'status', 'milestone', 'note')) DEFAULT 'progress',

  -- Progress Change
  old_progress INTEGER,
  new_progress INTEGER,

  -- Status Change
  old_status feature_status,
  new_status feature_status,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_roadmap_features_status ON roadmap_features(status);
CREATE INDEX idx_roadmap_features_category ON roadmap_features(category);
CREATE INDEX idx_roadmap_features_priority ON roadmap_features(priority);
CREATE INDEX idx_roadmap_features_featured ON roadmap_features(is_featured) WHERE is_featured = true;
CREATE INDEX idx_roadmap_features_public ON roadmap_features(is_public) WHERE is_public = true;
CREATE INDEX idx_roadmap_features_votes ON roadmap_features(votes_count DESC);
CREATE INDEX idx_roadmap_features_tags ON roadmap_features USING GIN(tags);

CREATE INDEX idx_feature_requests_user ON feature_requests(user_id);
CREATE INDEX idx_feature_requests_roadmap ON feature_requests(roadmap_feature_id);
CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_category ON feature_requests(category);
CREATE INDEX idx_feature_requests_votes ON feature_requests(votes_count DESC);
CREATE INDEX idx_feature_requests_created ON feature_requests(created_at DESC);

CREATE INDEX idx_feature_votes_user ON feature_votes(user_id);
CREATE INDEX idx_feature_votes_roadmap ON feature_votes(roadmap_feature_id);
CREATE INDEX idx_feature_votes_request ON feature_votes(feature_request_id);

CREATE INDEX idx_feature_notifications_user ON feature_notifications(user_id);
CREATE INDEX idx_feature_notifications_roadmap ON feature_notifications(roadmap_feature_id);
CREATE INDEX idx_feature_notifications_request ON feature_notifications(feature_request_id);

CREATE INDEX idx_feature_updates_roadmap ON feature_updates(roadmap_feature_id);
CREATE INDEX idx_feature_updates_created ON feature_updates(created_at DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_roadmap_vote_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.roadmap_feature_id IS NOT NULL THEN
    UPDATE roadmap_features
    SET votes_count = votes_count + 1
    WHERE id = NEW.roadmap_feature_id;
  ELSIF TG_OP = 'DELETE' AND OLD.roadmap_feature_id IS NOT NULL THEN
    UPDATE roadmap_features
    SET votes_count = votes_count - 1
    WHERE id = OLD.roadmap_feature_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_roadmap_vote_count
AFTER INSERT OR DELETE ON feature_votes
FOR EACH ROW
EXECUTE FUNCTION update_roadmap_vote_count();

CREATE OR REPLACE FUNCTION update_request_vote_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.feature_request_id IS NOT NULL THEN
    UPDATE feature_requests
    SET votes_count = votes_count + 1
    WHERE id = NEW.feature_request_id;
  ELSIF TG_OP = 'DELETE' AND OLD.feature_request_id IS NOT NULL THEN
    UPDATE feature_requests
    SET votes_count = votes_count - 1
    WHERE id = OLD.feature_request_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_request_vote_count
AFTER INSERT OR DELETE ON feature_votes
FOR EACH ROW
EXECUTE FUNCTION update_request_vote_count();

CREATE OR REPLACE FUNCTION update_subscribers_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.roadmap_feature_id IS NOT NULL THEN
    UPDATE roadmap_features
    SET subscribers_count = subscribers_count + 1
    WHERE id = NEW.roadmap_feature_id;
  ELSIF TG_OP = 'DELETE' AND OLD.roadmap_feature_id IS NOT NULL THEN
    UPDATE roadmap_features
    SET subscribers_count = subscribers_count - 1
    WHERE id = OLD.roadmap_feature_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscribers_count
AFTER INSERT OR DELETE ON feature_notifications
FOR EACH ROW
EXECUTE FUNCTION update_subscribers_count();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION vote_for_feature(
  p_user_id UUID,
  p_roadmap_feature_id UUID DEFAULT NULL,
  p_feature_request_id UUID DEFAULT NULL,
  p_vote_type TEXT DEFAULT 'upvote'
) RETURNS UUID AS $$
DECLARE
  vote_id UUID;
BEGIN
  INSERT INTO feature_votes (
    user_id,
    roadmap_feature_id,
    feature_request_id,
    vote_type
  ) VALUES (
    p_user_id,
    p_roadmap_feature_id,
    p_feature_request_id,
    p_vote_type
  )
  ON CONFLICT (user_id, roadmap_feature_id)
  WHERE roadmap_feature_id IS NOT NULL
  DO UPDATE SET vote_type = p_vote_type
  RETURNING id INTO vote_id;

  RETURN vote_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION subscribe_to_feature(
  p_user_id UUID,
  p_roadmap_feature_id UUID DEFAULT NULL,
  p_feature_request_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  subscription_id UUID;
BEGIN
  INSERT INTO feature_notifications (
    user_id,
    roadmap_feature_id,
    feature_request_id,
    email
  ) VALUES (
    p_user_id,
    p_roadmap_feature_id,
    p_feature_request_id,
    p_email
  )
  ON CONFLICT (user_id, roadmap_feature_id)
  WHERE roadmap_feature_id IS NOT NULL
  DO UPDATE SET email = COALESCE(p_email, feature_notifications.email)
  RETURNING id INTO subscription_id;

  RETURN subscription_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_popular_requests(
  p_category feature_category DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  request_id UUID,
  title TEXT,
  votes_count INTEGER,
  status request_status,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fr.id,
    fr.title,
    fr.votes_count,
    fr.status,
    fr.created_at
  FROM feature_requests fr
  WHERE (p_category IS NULL OR fr.category = p_category)
  ORDER BY fr.votes_count DESC, fr.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE roadmap_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_updates ENABLE ROW LEVEL SECURITY;

-- Roadmap features are public
CREATE POLICY roadmap_features_public ON roadmap_features
  FOR SELECT USING (is_public = true);

-- Feature requests: Users can view all, manage their own
CREATE POLICY feature_requests_select_all ON feature_requests
  FOR SELECT USING (true);

CREATE POLICY feature_requests_manage_own ON feature_requests
  FOR ALL USING (auth.uid() = user_id);

-- Votes: Users manage their own
CREATE POLICY feature_votes_policy ON feature_votes
  FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users manage their own
CREATE POLICY feature_notifications_policy ON feature_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Updates: Public can view
CREATE POLICY feature_updates_select_all ON feature_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roadmap_features
      WHERE roadmap_features.id = feature_updates.roadmap_feature_id
      AND roadmap_features.is_public = true
    )
  );
