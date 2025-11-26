-- ============================================================================
-- Notifications System - Production Database Schema
-- ============================================================================
-- Comprehensive notification management with real-time updates, multi-channel
-- delivery, preferences, templates, and delivery tracking
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'error', 'payment', 'project',
  'message', 'system', 'review', 'deadline', 'collaboration', 'file', 'invoice'
);

CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms', 'webhook');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived', 'deleted');
CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE notification_frequency AS ENUM ('instant', 'hourly', 'daily', 'weekly');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  priority notification_priority NOT NULL DEFAULT 'medium',
  status notification_status NOT NULL DEFAULT 'unread',
  category TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  avatar TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  related_id UUID,
  related_type TEXT,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  channels notification_channel[] DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  show_previews BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  frequency notification_frequency NOT NULL DEFAULT 'instant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Notification Deliveries
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  status delivery_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type notification_type NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  default_priority notification_priority NOT NULL DEFAULT 'medium',
  channels notification_channel[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Stats
CREATE TABLE notification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_received INTEGER NOT NULL DEFAULT 0,
  total_read INTEGER NOT NULL DEFAULT 0,
  total_unread INTEGER NOT NULL DEFAULT 0,
  total_archived INTEGER NOT NULL DEFAULT 0,
  average_read_time INTEGER NOT NULL DEFAULT 0, -- minutes
  most_common_type notification_type,
  read_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  response_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  last_notification_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Groups
CREATE TABLE notification_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type notification_type,
  icon TEXT,
  color TEXT,
  notification_ids UUID[] DEFAULT '{}',
  is_expanded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bulk Actions Log
CREATE TABLE notification_bulk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('read', 'unread', 'archive', 'delete')),
  notification_ids UUID[] NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_notifications_related ON notifications(related_id, related_type);
CREATE INDEX idx_notifications_metadata ON notifications USING GIN(metadata);

-- Notification Preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);
CREATE INDEX idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Notification Deliveries indexes
CREATE INDEX idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);
CREATE INDEX idx_notification_deliveries_created_at ON notification_deliveries(created_at DESC);

-- Notification Templates indexes
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);

-- Notification Stats indexes
CREATE INDEX idx_notification_stats_user_id ON notification_stats(user_id);

-- Notification Groups indexes
CREATE INDEX idx_notification_groups_user_id ON notification_groups(user_id);
CREATE INDEX idx_notification_groups_type ON notification_groups(type);

-- Bulk Actions indexes
CREATE INDEX idx_notification_bulk_actions_user_id ON notification_bulk_actions(user_id);
CREATE INDEX idx_notification_bulk_actions_created_at ON notification_bulk_actions(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_deliveries_updated_at
  BEFORE UPDATE ON notification_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_stats_updated_at
  BEFORE UPDATE ON notification_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_groups_updated_at
  BEFORE UPDATE ON notification_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on notification changes
CREATE OR REPLACE FUNCTION update_notification_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update stats
  INSERT INTO notification_stats (
    user_id,
    total_received,
    total_read,
    total_unread,
    total_archived,
    last_notification_at
  )
  SELECT
    user_id,
    COUNT(*) as total_received,
    COUNT(*) FILTER (WHERE status = 'read') as total_read,
    COUNT(*) FILTER (WHERE status = 'unread') as total_unread,
    COUNT(*) FILTER (WHERE status = 'archived') as total_archived,
    MAX(created_at) as last_notification_at
  FROM notifications
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  GROUP BY user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_received = EXCLUDED.total_received,
    total_read = EXCLUDED.total_read,
    total_unread = EXCLUDED.total_unread,
    total_archived = EXCLUDED.total_archived,
    last_notification_at = EXCLUDED.last_notification_at,
    read_rate = CASE
      WHEN EXCLUDED.total_received > 0
      THEN ROUND((EXCLUDED.total_read::DECIMAL / EXCLUDED.total_received) * 100)
      ELSE 0
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_notification_change
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_stats();

-- Auto-mark as read when read_at is set
CREATE OR REPLACE FUNCTION auto_mark_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND (OLD.read_at IS NULL OR OLD.read_at != NEW.read_at) THEN
    NEW.status := 'read';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_mark_read_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_read();

-- Auto-clean expired notifications
CREATE OR REPLACE FUNCTION clean_expired_notifications()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET status = 'deleted', deleted_at = NOW()
  WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status != 'deleted';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user notifications with filters
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_status notification_status DEFAULT NULL,
  p_type notification_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  message TEXT,
  type notification_type,
  priority notification_priority,
  status notification_status,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.message, n.type, n.priority, n.status, n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (p_status IS NULL OR n.status = p_status)
    AND (p_type IS NULL OR n.type = p_type)
    AND n.status != 'deleted'
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET status = 'read', read_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'unread';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Archive old notifications
CREATE OR REPLACE FUNCTION archive_old_notifications(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET status = 'archived', archived_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'read'
    AND created_at < NOW() - (p_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Get notification counts by type
CREATE OR REPLACE FUNCTION get_notification_counts(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_counts JSON;
BEGIN
  SELECT json_object_agg(type, count)
  INTO v_counts
  FROM (
    SELECT type, COUNT(*) as count
    FROM notifications
    WHERE user_id = p_user_id AND status = 'unread'
    GROUP BY type
  ) counts;

  RETURN COALESCE(v_counts, '{}'::JSON);
END;
$$ LANGUAGE plpgsql;

-- Get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND status = 'unread';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Bulk action on notifications
CREATE OR REPLACE FUNCTION bulk_notification_action(
  p_user_id UUID,
  p_action TEXT,
  p_notification_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  CASE p_action
    WHEN 'read' THEN
      UPDATE notifications
      SET status = 'read', read_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status = 'unread';

    WHEN 'unread' THEN
      UPDATE notifications
      SET status = 'unread', read_at = NULL, updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status = 'read';

    WHEN 'archive' THEN
      UPDATE notifications
      SET status = 'archived', archived_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status != 'archived';

    WHEN 'delete' THEN
      UPDATE notifications
      SET status = 'deleted', deleted_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status != 'deleted';

    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Log bulk action
  INSERT INTO notification_bulk_actions (user_id, action, notification_ids, count)
  VALUES (p_user_id, p_action, p_notification_ids, v_count);

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_bulk_actions ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id AND status != 'deleted');

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Notification Preferences policies
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Notification Deliveries policies
CREATE POLICY "Users can view their deliveries"
  ON notification_deliveries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notifications
    WHERE id = notification_deliveries.notification_id AND user_id = auth.uid()
  ));

-- Notification Templates policies (public read, admin write)
CREATE POLICY "Templates are viewable by all"
  ON notification_templates FOR SELECT
  USING (is_active = TRUE);

-- Notification Stats policies
CREATE POLICY "Users can view their own stats"
  ON notification_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Notification Groups policies
CREATE POLICY "Users can manage their own groups"
  ON notification_groups FOR ALL
  USING (auth.uid() = user_id);

-- Bulk Actions policies
CREATE POLICY "Users can view their own bulk actions"
  ON notification_bulk_actions FOR SELECT
  USING (auth.uid() = user_id);
