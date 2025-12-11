-- =====================================================
-- KAZI Real-time Notifications System
-- Migration: 20251211000006_realtime_notifications_system.sql
--
-- Comprehensive notification infrastructure including:
-- - Multi-channel delivery (in-app, email, push, SMS)
-- - User preferences
-- - Delivery tracking
-- - Notification grouping
-- - Real-time broadcast support
-- =====================================================

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'general', 'project', 'task', 'invoice', 'payment', 'client',
    'team', 'file', 'message', 'workflow', 'security', 'system'
  )),

  -- Priority and status
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Additional data
  data JSONB DEFAULT '{}',
  action_url TEXT,
  action_label TEXT,

  -- Grouping and organization
  group_id TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION DELIVERIES TABLE
-- Tracks delivery status across different channels
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,

  -- Channel info
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'sms')),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- User preferences for notification delivery
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel preferences per category
  channel_preferences JSONB DEFAULT '{
    "general": ["in_app"],
    "project": ["in_app", "email"],
    "task": ["in_app", "email"],
    "invoice": ["in_app", "email"],
    "payment": ["in_app", "email", "push"],
    "client": ["in_app"],
    "team": ["in_app"],
    "file": ["in_app"],
    "message": ["in_app", "push"],
    "workflow": ["in_app"],
    "security": ["in_app", "email", "push"],
    "system": ["in_app", "email"]
  }',

  -- Quiet hours
  quiet_hours JSONB DEFAULT '{
    "enabled": false,
    "start": "22:00",
    "end": "07:00",
    "timezone": "UTC"
  }',

  -- Email digest settings
  email_digest JSONB DEFAULT '{
    "enabled": false,
    "frequency": "daily"
  }',

  -- Disabled categories
  disabled_categories TEXT[] DEFAULT '{}',

  -- Push notification settings
  push_enabled BOOLEAN DEFAULT true,
  push_token TEXT,

  -- Email settings
  email_notifications_enabled BOOLEAN DEFAULT true,

  -- SMS settings
  sms_enabled BOOLEAN DEFAULT false,
  phone_number TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Store web push subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Push subscription data
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,

  -- Device info
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('web', 'mobile', 'desktop')),
  browser TEXT,
  os TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);

-- =====================================================
-- NOTIFICATION TEMPLATES TABLE
-- Reusable notification templates
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system templates

  -- Template info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Content templates (support variables like {{name}})
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,

  -- Defaults
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  default_channels TEXT[] DEFAULT ARRAY['in_app'],

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, slug)
);

-- =====================================================
-- NOTIFICATION QUEUE TABLE
-- Queue for async notification processing
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Notification data
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id),

  -- Content (if not using template)
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',

  -- Template variables
  variables JSONB DEFAULT '{}',

  -- Channels to deliver to
  channels TEXT[] DEFAULT ARRAY['in_app'],

  -- Scheduling
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION GROUPS TABLE
-- Group related notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Group info
  group_key TEXT NOT NULL,
  title TEXT NOT NULL,

  -- Aggregation
  notification_count INT DEFAULT 0,
  latest_notification_at TIMESTAMPTZ,

  -- Status
  is_expanded BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, group_key)
);

-- =====================================================
-- REALTIME BROADCASTS TABLE
-- Store broadcasts for Supabase Realtime
-- =====================================================
CREATE TABLE IF NOT EXISTS realtime_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Channel info
  channel TEXT NOT NULL,
  event_type TEXT NOT NULL,

  -- Payload
  payload JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Notifications indexes
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(user_id, category); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_group ON notifications(user_id, group_id) WHERE group_id IS NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Deliveries indexes
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries(notification_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status) WHERE status = 'pending'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_deliveries_retry ON notification_deliveries(next_retry_at) WHERE status = 'failed' AND retry_count < 3; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Push subscriptions indexes
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(user_id) WHERE is_active = true; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Templates indexes
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_templates_user ON notification_templates(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_templates_slug ON notification_templates(slug); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Queue indexes
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_queue_pending ON notification_queue(scheduled_for) WHERE status = 'pending'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notification_queue_user ON notification_queue(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Broadcasts indexes
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_realtime_broadcasts_channel ON realtime_broadcasts(channel); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_realtime_broadcasts_expires ON realtime_broadcasts(expires_at); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_broadcasts ENABLE ROW LEVEL SECURITY;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Deliveries policies
DROP POLICY IF EXISTS "Users can view own deliveries" ON notification_deliveries;
CREATE POLICY "Users can view own deliveries" ON notification_deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM notifications WHERE id = notification_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "System can manage deliveries" ON notification_deliveries;
CREATE POLICY "System can manage deliveries" ON notification_deliveries
  FOR ALL USING (true);

-- Preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON notification_preferences;
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Push subscriptions policies
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Templates policies
DROP POLICY IF EXISTS "Users can view templates" ON notification_templates;
CREATE POLICY "Users can view templates" ON notification_templates
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own templates" ON notification_templates;
CREATE POLICY "Users can manage own templates" ON notification_templates
  FOR ALL USING (user_id = auth.uid());

-- Queue policies
DROP POLICY IF EXISTS "Users can view own queue" ON notification_queue;
CREATE POLICY "Users can view own queue" ON notification_queue
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage queue" ON notification_queue;
CREATE POLICY "System can manage queue" ON notification_queue
  FOR ALL USING (true);

-- Groups policies
DROP POLICY IF EXISTS "Users can manage own groups" ON notification_groups;
CREATE POLICY "Users can manage own groups" ON notification_groups
  FOR ALL USING (auth.uid() = user_id);

-- Broadcasts policies
DROP POLICY IF EXISTS "System can manage broadcasts" ON realtime_broadcasts;
CREATE POLICY "System can manage broadcasts" ON realtime_broadcasts
  FOR ALL USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_updated_at ON notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_timestamp();

DROP TRIGGER IF EXISTS notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_timestamp();

DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_notification_timestamp();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Send notification function
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'normal',
  p_data JSONB DEFAULT '{}',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, category, priority,
    data, action_url, action_label
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_category, p_priority,
    p_data, p_action_url, p_action_label
  )
  RETURNING id INTO v_notification_id;

  -- Create default in-app delivery
  INSERT INTO notification_deliveries (notification_id, channel, status, delivered_at)
  VALUES (v_notification_id, 'in_app', 'delivered', NOW());

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id
      AND is_read = false
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  WITH updated AS (
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE user_id = p_user_id
      AND is_read = false
      AND (p_category IS NULL OR category = p_category)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  WITH deleted AS (
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL AND expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM deleted;

  -- Also clean up old broadcasts
  DELETE FROM realtime_broadcasts WHERE expires_at < NOW();

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process notification queue
CREATE OR REPLACE FUNCTION process_notification_queue()
RETURNS INT AS $$
DECLARE
  v_item RECORD;
  v_count INT := 0;
BEGIN
  FOR v_item IN
    SELECT * FROM notification_queue
    WHERE status = 'pending'
      AND scheduled_for <= NOW()
    ORDER BY scheduled_for
    LIMIT 100
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      -- Mark as processing
      UPDATE notification_queue SET status = 'processing' WHERE id = v_item.id;

      -- Create notification
      PERFORM send_notification(
        v_item.user_id,
        COALESCE(v_item.title, 'Notification'),
        COALESCE(v_item.message, ''),
        COALESCE(v_item.type, 'info'),
        COALESCE(v_item.category, 'general'),
        COALESCE(v_item.priority, 'normal')
      );

      -- Mark as completed
      UPDATE notification_queue
      SET status = 'completed', processed_at = NOW()
      WHERE id = v_item.id;

      v_count := v_count + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE notification_queue
      SET status = 'failed',
          error_message = SQLERRM,
          retry_count = retry_count + 1
      WHERE id = v_item.id;
    END;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get notification statistics
CREATE OR REPLACE FUNCTION get_notification_stats(
  p_user_id UUID,
  p_days INT DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'unread', COUNT(*) FILTER (WHERE NOT is_read),
    'by_type', jsonb_object_agg(type, type_count),
    'by_category', jsonb_object_agg(category, cat_count)
  ) INTO v_result
  FROM (
    SELECT
      type,
      category,
      is_read,
      COUNT(*) OVER (PARTITION BY type) as type_count,
      COUNT(*) OVER (PARTITION BY category) as cat_count
    FROM notifications
    WHERE user_id = p_user_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
  ) sub;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSERT SYSTEM NOTIFICATION TEMPLATES
-- =====================================================
INSERT INTO notification_templates (name, slug, title_template, message_template, type, category, is_system)
VALUES
  ('Welcome', 'welcome', 'Welcome to KAZI!', 'Your account has been created successfully. Get started by exploring your dashboard.', 'success', 'system', true),
  ('Project Created', 'project-created', 'Project Created', 'Your project "{{project_name}}" has been created.', 'success', 'project', true),
  ('Task Assigned', 'task-assigned', 'Task Assigned', '{{assigner}} assigned you to "{{task_name}}".', 'info', 'task', true),
  ('Invoice Sent', 'invoice-sent', 'Invoice Sent', 'Invoice {{invoice_number}} has been sent to {{client_name}}.', 'success', 'invoice', true),
  ('Payment Received', 'payment-received', 'Payment Received', 'You received {{amount}} from {{client_name}}.', 'success', 'payment', true),
  ('File Shared', 'file-shared', 'File Shared', '{{sharer}} shared "{{file_name}}" with you.', 'info', 'file', true),
  ('New Message', 'new-message', 'New Message', '{{sender}}: {{preview}}', 'info', 'message', true),
  ('Security Alert', 'security-alert', 'Security Alert', '{{message}}', 'warning', 'security', true)
ON CONFLICT (user_id, slug) DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
  GRANT SELECT ON notification_deliveries TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
  GRANT SELECT ON notification_templates TO authenticated;
  GRANT SELECT ON notification_queue TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON notification_groups TO authenticated;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
DO $$
BEGIN
  COMMENT ON TABLE notifications IS 'User notifications with multi-channel support';
  COMMENT ON TABLE notification_deliveries IS 'Tracks notification delivery across channels';
  COMMENT ON TABLE notification_preferences IS 'User notification preferences';
  COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions';
  COMMENT ON TABLE notification_templates IS 'Reusable notification templates';
  COMMENT ON TABLE notification_queue IS 'Async notification processing queue';
  COMMENT ON TABLE realtime_broadcasts IS 'Supabase Realtime broadcast messages';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
