-- Minimal Profile Settings Schema
-- Additional profile features: analytics, activity tracking, social connections

-- ENUMS
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS connection_status CASCADE;
DROP TYPE IF EXISTS visibility_level CASCADE;

CREATE TYPE activity_type AS ENUM ('login', 'profile_update', 'settings_change', 'data_export', 'password_change', 'email_change', 'avatar_upload', 'skill_add', 'skill_remove', 'social_add');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked', 'rejected');
CREATE TYPE visibility_level AS ENUM ('public', 'connections', 'private');

-- TABLES
DROP TABLE IF EXISTS profile_analytics CASCADE;
DROP TABLE IF EXISTS profile_activity_logs CASCADE;
DROP TABLE IF EXISTS social_connections CASCADE;
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS profile_privacy_settings CASCADE;

CREATE TABLE profile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- View Stats
  total_views INTEGER NOT NULL DEFAULT 0,
  views_this_week INTEGER NOT NULL DEFAULT 0,
  views_this_month INTEGER NOT NULL DEFAULT 0,
  unique_viewers INTEGER NOT NULL DEFAULT 0,

  -- Engagement Stats
  profile_completeness INTEGER NOT NULL DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
  response_rate INTEGER NOT NULL DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
  avg_response_time INTEGER NOT NULL DEFAULT 0, -- in minutes

  -- Social Stats
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  connections_count INTEGER NOT NULL DEFAULT 0,

  -- Last Updated
  last_viewed_at TIMESTAMPTZ,
  analytics_refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profile_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity Details
  activity_type activity_type NOT NULL,
  action TEXT NOT NULL,
  description TEXT,

  -- Context
  ip_address INET,
  user_agent TEXT,
  device TEXT,
  location TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  before_value JSONB,
  after_value JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Connection Details
  status connection_status NOT NULL DEFAULT 'pending',
  connection_type TEXT, -- 'follower', 'following', 'mutual', 'professional'

  -- Dates
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  blocked_at TIMESTAMPTZ,

  -- Notes
  message TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- View Details
  view_count INTEGER NOT NULL DEFAULT 1,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Context
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  location TEXT,

  -- Anonymous Views
  is_anonymous BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_user_id, viewer_user_id)
);

CREATE TABLE profile_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Profile Visibility
  profile_visibility visibility_level NOT NULL DEFAULT 'public',
  show_email visibility_level NOT NULL DEFAULT 'connections',
  show_phone visibility_level NOT NULL DEFAULT 'private',
  show_location visibility_level NOT NULL DEFAULT 'public',
  show_social_links visibility_level NOT NULL DEFAULT 'public',

  -- Activity Visibility
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  show_last_active BOOLEAN NOT NULL DEFAULT true,
  show_activity BOOLEAN NOT NULL DEFAULT true,

  -- Discoverability
  searchable BOOLEAN NOT NULL DEFAULT true,
  allow_indexing BOOLEAN NOT NULL DEFAULT true,
  show_in_directory BOOLEAN NOT NULL DEFAULT true,

  -- Notifications
  notify_on_profile_view BOOLEAN NOT NULL DEFAULT false,
  notify_on_connection_request BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_profile_analytics_user_id ON profile_analytics(user_id);
CREATE INDEX idx_profile_analytics_last_viewed_at ON profile_analytics(last_viewed_at DESC);
CREATE INDEX idx_profile_activity_logs_user_id ON profile_activity_logs(user_id);
CREATE INDEX idx_profile_activity_logs_activity_type ON profile_activity_logs(activity_type);
CREATE INDEX idx_profile_activity_logs_created_at ON profile_activity_logs(created_at DESC);
CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_social_connections_connected_user_id ON social_connections(connected_user_id);
CREATE INDEX idx_social_connections_status ON social_connections(status);
CREATE INDEX idx_social_connections_connection_type ON social_connections(connection_type);
CREATE INDEX idx_profile_views_profile_user_id ON profile_views(profile_user_id);
CREATE INDEX idx_profile_views_viewer_user_id ON profile_views(viewer_user_id);
CREATE INDEX idx_profile_views_last_viewed_at ON profile_views(last_viewed_at DESC);
CREATE INDEX idx_profile_privacy_settings_user_id ON profile_privacy_settings(user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_profile_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profile_analytics_updated_at BEFORE UPDATE ON profile_analytics FOR EACH ROW EXECUTE FUNCTION update_profile_settings_updated_at();
CREATE TRIGGER trigger_social_connections_updated_at BEFORE UPDATE ON social_connections FOR EACH ROW EXECUTE FUNCTION update_profile_settings_updated_at();
CREATE TRIGGER trigger_profile_privacy_settings_updated_at BEFORE UPDATE ON profile_privacy_settings FOR EACH ROW EXECUTE FUNCTION update_profile_settings_updated_at();

CREATE OR REPLACE FUNCTION log_profile_activity() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_activity_logs (
    user_id, activity_type, action, description, before_value, after_value
  ) VALUES (
    NEW.user_id,
    'profile_update',
    TG_TABLE_NAME || '_update',
    'Profile information updated',
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_profile_updates AFTER UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION log_profile_activity();

CREATE OR REPLACE FUNCTION increment_profile_views() RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics
  UPDATE profile_analytics
  SET
    total_views = total_views + 1,
    views_this_week = views_this_week + 1,
    views_this_month = views_this_month + 1,
    last_viewed_at = now()
  WHERE user_id = NEW.profile_user_id;

  -- If no analytics record exists, create one
  IF NOT FOUND THEN
    INSERT INTO profile_analytics (user_id, total_views, views_this_week, views_this_month, last_viewed_at)
    VALUES (NEW.profile_user_id, 1, 1, 1, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_profile_views AFTER INSERT OR UPDATE ON profile_views FOR EACH ROW EXECUTE FUNCTION increment_profile_views();

CREATE OR REPLACE FUNCTION update_connection_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted') THEN
    -- Increment connections for both users
    UPDATE profile_analytics
    SET connections_count = connections_count + 1
    WHERE user_id IN (NEW.user_id, NEW.connected_user_id);

  ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'accepted' AND OLD.status = 'accepted') THEN
    -- Decrement connections for both users
    UPDATE profile_analytics
    SET connections_count = GREATEST(0, connections_count - 1)
    WHERE user_id IN (COALESCE(NEW.user_id, OLD.user_id), COALESCE(NEW.connected_user_id, OLD.connected_user_id));
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_connection_counts AFTER INSERT OR UPDATE OR DELETE ON social_connections FOR EACH ROW EXECUTE FUNCTION update_connection_counts();

CREATE OR REPLACE FUNCTION set_connection_timestamp() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    NEW.accepted_at = now();
  ELSIF NEW.status = 'rejected' AND (OLD IS NULL OR OLD.status != 'rejected') THEN
    NEW.rejected_at = now();
  ELSIF NEW.status = 'blocked' AND (OLD IS NULL OR OLD.status != 'blocked') THEN
    NEW.blocked_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_connection_timestamp BEFORE INSERT OR UPDATE ON social_connections FOR EACH ROW EXECUTE FUNCTION set_connection_timestamp();

CREATE OR REPLACE FUNCTION refresh_weekly_views() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.analytics_refreshed_at + INTERVAL '7 days' < now() THEN
    NEW.views_this_week = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_weekly_views BEFORE UPDATE ON profile_analytics FOR EACH ROW EXECUTE FUNCTION refresh_weekly_views();
