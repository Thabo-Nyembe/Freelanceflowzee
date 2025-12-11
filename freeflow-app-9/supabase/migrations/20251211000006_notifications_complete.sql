-- =====================================================
-- KAZI Real-time Notifications System - Complete
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- DROP EXISTING TABLES (if they have issues)
-- =====================================================
DROP TABLE IF EXISTS realtime_broadcasts CASCADE;
DROP TABLE IF EXISTS notification_groups CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_deliveries CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  action_label TEXT,
  group_id TEXT,
  tags TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION DELIVERIES TABLE
-- =====================================================
CREATE TABLE notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_preferences JSONB DEFAULT '{}',
  quiet_hours JSONB DEFAULT '{}',
  email_digest JSONB DEFAULT '{}',
  disabled_categories TEXT[] DEFAULT '{}',
  push_enabled BOOLEAN DEFAULT true,
  push_token TEXT,
  email_notifications_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- =====================================================
-- NOTIFICATION TEMPLATES TABLE
-- =====================================================
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  default_channels TEXT[] DEFAULT ARRAY['in_app'],
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- =====================================================
-- NOTIFICATION QUEUE TABLE
-- =====================================================
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id),
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  variables JSONB DEFAULT '{}',
  channels TEXT[] DEFAULT ARRAY['in_app'],
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION GROUPS TABLE
-- =====================================================
CREATE TABLE notification_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_key TEXT NOT NULL,
  title TEXT NOT NULL,
  notification_count INT DEFAULT 0,
  latest_notification_at TIMESTAMPTZ,
  is_expanded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_key)
);

-- =====================================================
-- REALTIME BROADCASTS TABLE
-- =====================================================
CREATE TABLE realtime_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_category ON notifications(user_id, category);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_group ON notifications(user_id, group_id) WHERE group_id IS NOT NULL;
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_notification_deliveries_notification ON notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status) WHERE status = 'pending';

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(user_id) WHERE is_active = true;

CREATE INDEX idx_notification_templates_user ON notification_templates(user_id);
CREATE INDEX idx_notification_templates_slug ON notification_templates(slug);

CREATE INDEX idx_notification_queue_pending ON notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_user ON notification_queue(user_id);

CREATE INDEX idx_realtime_broadcasts_channel ON realtime_broadcasts(channel);
CREATE INDEX idx_realtime_broadcasts_expires ON realtime_broadcasts(expires_at);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_broadcasts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "deliveries_select" ON notification_deliveries FOR SELECT
  USING (EXISTS (SELECT 1 FROM notifications WHERE id = notification_id AND user_id = auth.uid()));
CREATE POLICY "deliveries_all" ON notification_deliveries FOR ALL USING (true);

CREATE POLICY "preferences_all" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "push_subs_all" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "templates_select" ON notification_templates FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "templates_manage" ON notification_templates FOR ALL USING (user_id = auth.uid());

CREATE POLICY "queue_select" ON notification_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "queue_all" ON notification_queue FOR ALL USING (true);

CREATE POLICY "groups_all" ON notification_groups FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "broadcasts_all" ON realtime_broadcasts FOR ALL USING (true);

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT ON notification_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT SELECT ON notification_templates TO authenticated;
GRANT SELECT ON notification_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_groups TO authenticated;

GRANT ALL ON notifications TO service_role;
GRANT ALL ON notification_deliveries TO service_role;
GRANT ALL ON notification_preferences TO service_role;
GRANT ALL ON push_subscriptions TO service_role;
GRANT ALL ON notification_templates TO service_role;
GRANT ALL ON notification_queue TO service_role;
GRANT ALL ON notification_groups TO service_role;
GRANT ALL ON realtime_broadcasts TO service_role;
