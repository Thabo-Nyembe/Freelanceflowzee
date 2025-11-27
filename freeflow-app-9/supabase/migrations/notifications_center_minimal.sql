-- Minimal Notifications Center Schema
-- Additional features: grouping, snoozing, bulk operations, saved searches

-- ENUMS
DROP TYPE IF EXISTS snooze_duration CASCADE;
DROP TYPE IF EXISTS bulk_action_type CASCADE;
DROP TYPE IF EXISTS notification_group_type CASCADE;

CREATE TYPE snooze_duration AS ENUM ('1_hour', '3_hours', '1_day', '3_days', '1_week', 'custom');
CREATE TYPE bulk_action_type AS ENUM ('mark_read', 'mark_unread', 'archive', 'delete', 'snooze', 'categorize');
CREATE TYPE notification_group_type AS ENUM ('by_type', 'by_category', 'by_sender', 'by_project', 'by_date');

-- TABLES
DROP TABLE IF EXISTS notification_groups CASCADE;
DROP TABLE IF EXISTS snoozed_notifications CASCADE;
DROP TABLE IF EXISTS notification_bulk_actions CASCADE;
DROP TABLE IF EXISTS saved_notification_filters CASCADE;
DROP TABLE IF EXISTS notification_reactions CASCADE;

CREATE TABLE notification_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Group Details
  group_type notification_group_type NOT NULL,
  group_key TEXT NOT NULL, -- e.g., 'payment', 'project_123', '2025-01-15'
  group_name TEXT NOT NULL,
  description TEXT,

  -- Group Stats
  total_notifications INTEGER NOT NULL DEFAULT 0,
  unread_count INTEGER NOT NULL DEFAULT 0,

  -- Display Settings
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_type, group_key)
);

CREATE TABLE snoozed_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,

  -- Snooze Details
  snooze_duration snooze_duration NOT NULL,
  snoozed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  snooze_until TIMESTAMPTZ NOT NULL,

  -- Custom Duration
  custom_duration_minutes INTEGER,

  -- Reactivation
  reactivated BOOLEAN NOT NULL DEFAULT false,
  reactivated_at TIMESTAMPTZ,

  -- Reason
  snooze_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id)
);

CREATE TABLE notification_bulk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action Details
  action_type bulk_action_type NOT NULL,
  action_description TEXT NOT NULL,

  -- Target Notifications
  notification_ids UUID[] NOT NULL,
  notifications_count INTEGER NOT NULL,

  -- Filters Applied
  filters_applied JSONB DEFAULT '{}'::JSONB,

  -- Results
  successful_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  error_messages TEXT[],

  -- Undo Support
  is_undoable BOOLEAN NOT NULL DEFAULT true,
  undone BOOLEAN NOT NULL DEFAULT false,
  undone_at TIMESTAMPTZ,

  -- Execution
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE saved_notification_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Filter Details
  filter_name TEXT NOT NULL,
  description TEXT,

  -- Filter Criteria
  filter_criteria JSONB NOT NULL,

  -- Usage Stats
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Flags
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,

  -- Notifications
  notify_on_new_match BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,

  -- Reaction Details
  reaction_type TEXT NOT NULL, -- 'like', 'important', 'helpful', 'not_helpful', 'spam'
  emoji TEXT,

  -- Feedback
  feedback TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id, reaction_type)
);

-- INDEXES
CREATE INDEX idx_notification_groups_user_id ON notification_groups(user_id);
CREATE INDEX idx_notification_groups_group_type ON notification_groups(group_type);
CREATE INDEX idx_notification_groups_group_key ON notification_groups(group_key);
CREATE INDEX idx_notification_groups_sort_order ON notification_groups(sort_order);
CREATE INDEX idx_snoozed_notifications_user_id ON snoozed_notifications(user_id);
CREATE INDEX idx_snoozed_notifications_notification_id ON snoozed_notifications(notification_id);
CREATE INDEX idx_snoozed_notifications_snooze_until ON snoozed_notifications(snooze_until);
CREATE INDEX idx_snoozed_notifications_reactivated ON snoozed_notifications(reactivated);
CREATE INDEX idx_notification_bulk_actions_user_id ON notification_bulk_actions(user_id);
CREATE INDEX idx_notification_bulk_actions_action_type ON notification_bulk_actions(action_type);
CREATE INDEX idx_notification_bulk_actions_executed_at ON notification_bulk_actions(executed_at DESC);
CREATE INDEX idx_saved_notification_filters_user_id ON saved_notification_filters(user_id);
CREATE INDEX idx_saved_notification_filters_is_default ON saved_notification_filters(is_default);
CREATE INDEX idx_saved_notification_filters_is_favorite ON saved_notification_filters(is_favorite);
CREATE INDEX idx_notification_reactions_user_id ON notification_reactions(user_id);
CREATE INDEX idx_notification_reactions_notification_id ON notification_reactions(notification_id);
CREATE INDEX idx_notification_reactions_reaction_type ON notification_reactions(reaction_type);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_notifications_center_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_groups_updated_at BEFORE UPDATE ON notification_groups FOR EACH ROW EXECUTE FUNCTION update_notifications_center_updated_at();
CREATE TRIGGER trigger_saved_notification_filters_updated_at BEFORE UPDATE ON saved_notification_filters FOR EACH ROW EXECUTE FUNCTION update_notifications_center_updated_at();

CREATE OR REPLACE FUNCTION reactivate_snoozed_notifications() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.snooze_until <= now() AND NEW.reactivated = false THEN
    NEW.reactivated = true;
    NEW.reactivated_at = now();

    -- Update the original notification to unread
    UPDATE notifications
    SET status = 'unread'
    WHERE id = NEW.notification_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reactivate_snoozed_notifications BEFORE UPDATE ON snoozed_notifications FOR EACH ROW EXECUTE FUNCTION reactivate_snoozed_notifications();

CREATE OR REPLACE FUNCTION update_group_counts() RETURNS TRIGGER AS $$
DECLARE
  v_group_type notification_group_type;
  v_group_key TEXT;
  v_user_id UUID;
BEGIN
  -- Determine group type and key based on notification
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);

  IF TG_TABLE_NAME = 'notifications' THEN
    -- Group by type
    v_group_type := 'by_type';
    v_group_key := COALESCE(NEW.type::TEXT, OLD.type::TEXT);

    -- Update or create group
    INSERT INTO notification_groups (user_id, group_type, group_key, group_name, total_notifications, unread_count)
    VALUES (v_user_id, v_group_type, v_group_key, v_group_key, 1, CASE WHEN NEW.status = 'unread' THEN 1 ELSE 0 END)
    ON CONFLICT (user_id, group_type, group_key)
    DO UPDATE SET
      total_notifications = notification_groups.total_notifications + CASE WHEN TG_OP = 'INSERT' THEN 1 WHEN TG_OP = 'DELETE' THEN -1 ELSE 0 END,
      unread_count = notification_groups.unread_count +
        CASE
          WHEN TG_OP = 'INSERT' AND NEW.status = 'unread' THEN 1
          WHEN TG_OP = 'DELETE' AND OLD.status = 'unread' THEN -1
          WHEN TG_OP = 'UPDATE' AND NEW.status = 'unread' AND OLD.status != 'unread' THEN 1
          WHEN TG_OP = 'UPDATE' AND NEW.status != 'unread' AND OLD.status = 'unread' THEN -1
          ELSE 0
        END;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_counts_insert AFTER INSERT ON notifications FOR EACH ROW EXECUTE FUNCTION update_group_counts();
CREATE TRIGGER trigger_update_group_counts_update AFTER UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_group_counts();
CREATE TRIGGER trigger_update_group_counts_delete AFTER DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION update_group_counts();

CREATE OR REPLACE FUNCTION increment_filter_usage() RETURNS TRIGGER AS $$
BEGIN
  NEW.usage_count = NEW.usage_count + 1;
  NEW.last_used_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_filter_usage BEFORE UPDATE OF usage_count ON saved_notification_filters FOR EACH ROW EXECUTE FUNCTION increment_filter_usage();

CREATE OR REPLACE FUNCTION deactivate_other_default_filters() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE saved_notification_filters
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deactivate_other_default_filters AFTER INSERT OR UPDATE ON saved_notification_filters FOR EACH ROW EXECUTE FUNCTION deactivate_other_default_filters();

CREATE OR REPLACE FUNCTION track_bulk_action_results() RETURNS TRIGGER AS $$
BEGIN
  NEW.successful_count = array_length(NEW.notification_ids, 1) - NEW.failed_count;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_bulk_action_results BEFORE INSERT OR UPDATE ON notification_bulk_actions FOR EACH ROW EXECUTE FUNCTION track_bulk_action_results();
