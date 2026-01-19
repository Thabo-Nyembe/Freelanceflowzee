-- =====================================================
-- PHASE 5.3: NATIVE MOBILE APPS FOUNDATION
-- Complete mobile infrastructure for FreeFlow
-- Competes with: Fiverr, Upwork, FreshBooks mobile apps
-- =====================================================

-- =====================================================
-- TABLE: user_devices
-- Track registered mobile devices for each user
-- =====================================================
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Device identification
  device_id TEXT NOT NULL, -- Unique device identifier
  device_token TEXT, -- Push notification token (FCM/APNS)
  device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
  device_name TEXT, -- User-friendly device name
  device_model TEXT, -- e.g., "iPhone 15 Pro", "Pixel 8"
  os_version TEXT, -- e.g., "iOS 17.2", "Android 14"
  app_version TEXT, -- FreeFlow app version

  -- Push notification settings
  push_enabled BOOLEAN DEFAULT true,
  push_categories JSONB DEFAULT '["messages", "tasks", "invoices", "reminders", "marketing"]'::jsonb,
  badge_count INTEGER DEFAULT 0,

  -- Security
  biometric_enabled BOOLEAN DEFAULT false,
  pin_enabled BOOLEAN DEFAULT false,
  pin_hash TEXT, -- Hashed PIN for additional security
  last_biometric_auth TIMESTAMPTZ,

  -- Session management
  session_token TEXT,
  session_expires_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  last_ip_address INET,
  last_location JSONB, -- { lat, lng, city, country }

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_trusted BOOLEAN DEFAULT false, -- For sensitive operations
  trust_verified_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, device_id)
);

-- =====================================================
-- TABLE: mobile_sessions
-- Track active mobile sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,

  -- Session details
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  access_token TEXT,

  -- Session state
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT now(),

  -- Security
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  terminated_at TIMESTAMPTZ,
  termination_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: push_notifications
-- Store all push notifications sent
-- =====================================================
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,

  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,

  -- Categorization
  category TEXT NOT NULL, -- messages, tasks, invoices, reminders, marketing, system
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),

  -- Deep linking
  action_type TEXT, -- open_chat, open_task, open_invoice, open_url
  action_data JSONB DEFAULT '{}'::jsonb, -- { chatId, taskId, invoiceId, url }
  deep_link TEXT,

  -- Platform-specific payload
  ios_payload JSONB DEFAULT '{}'::jsonb,
  android_payload JSONB DEFAULT '{}'::jsonb,

  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed', 'expired')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Analytics
  provider_message_id TEXT, -- FCM/APNS message ID

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: offline_sync_queue
-- Track offline changes that need syncing
-- =====================================================
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,

  -- Operation details
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  resource_type TEXT NOT NULL, -- tasks, projects, invoices, messages, time_entries
  resource_id UUID,

  -- Data
  payload JSONB NOT NULL,

  -- Sync status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'conflict', 'failed')),
  priority INTEGER DEFAULT 5, -- 1 = highest priority

  -- Conflict resolution
  server_version INTEGER,
  client_version INTEGER,
  conflict_data JSONB, -- Server data that conflicted
  resolution TEXT, -- client_wins, server_wins, merged
  resolved_at TIMESTAMPTZ,

  -- Timing
  queued_at TIMESTAMPTZ DEFAULT now(),
  sync_started_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  next_retry_at TIMESTAMPTZ,

  -- Error tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: mobile_analytics
-- Track mobile app analytics events
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,

  -- Event details
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL, -- navigation, interaction, error, performance, business

  -- Context
  screen_name TEXT,
  previous_screen TEXT,
  session_id UUID,

  -- Event data
  properties JSONB DEFAULT '{}'::jsonb,

  -- Performance metrics
  duration_ms INTEGER, -- For timed events
  memory_usage_mb DECIMAL(10, 2),
  battery_level INTEGER,
  network_type TEXT, -- wifi, cellular, offline

  -- Device state
  app_state TEXT, -- foreground, background
  is_offline BOOLEAN DEFAULT false,

  -- Error details (for error events)
  error_message TEXT,
  error_stack TEXT,
  error_code TEXT,

  -- Timestamps
  client_timestamp TIMESTAMPTZ, -- When event occurred on device
  created_at TIMESTAMPTZ DEFAULT now() -- When received by server
);

-- =====================================================
-- TABLE: mobile_app_configs
-- Per-tenant mobile app configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_app_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID, -- NULL for default config

  -- App identity
  app_name TEXT NOT NULL DEFAULT 'FreeFlow',
  app_display_name TEXT,
  bundle_id_ios TEXT DEFAULT 'com.freeflow.app',
  package_name_android TEXT DEFAULT 'com.freeflow.app',

  -- Deep linking
  url_scheme TEXT DEFAULT 'freeflow',
  universal_link_domain TEXT DEFAULT 'app.freeflow.io',

  -- Features
  enabled_features JSONB DEFAULT '{
    "offlineMode": true,
    "biometricAuth": true,
    "pushNotifications": true,
    "darkMode": true,
    "quickActions": true,
    "widgets": true,
    "siri": true,
    "shareExtension": true
  }'::jsonb,

  -- UI customization
  theme JSONB DEFAULT '{
    "primaryColor": "#3B82F6",
    "accentColor": "#10B981",
    "darkMode": {
      "primaryColor": "#60A5FA",
      "accentColor": "#34D399"
    }
  }'::jsonb,

  -- Branding
  logo_url TEXT,
  icon_url TEXT,
  splash_screen_url TEXT,

  -- Minimum versions
  min_ios_version TEXT DEFAULT '15.0',
  min_android_version TEXT DEFAULT '26', -- Android 8.0
  min_app_version TEXT DEFAULT '1.0.0',

  -- API configuration
  api_base_url TEXT DEFAULT 'https://api.freeflow.io',
  api_timeout_ms INTEGER DEFAULT 30000,

  -- Security settings
  session_timeout_minutes INTEGER DEFAULT 30,
  require_pin BOOLEAN DEFAULT false,
  require_biometric BOOLEAN DEFAULT false,
  max_offline_days INTEGER DEFAULT 7,

  -- Notification settings
  default_notification_settings JSONB DEFAULT '{
    "messages": true,
    "tasks": true,
    "invoices": true,
    "reminders": true,
    "marketing": false
  }'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: deep_link_routes
-- Configure deep link routing
-- =====================================================
CREATE TABLE IF NOT EXISTS deep_link_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,

  -- Route pattern
  path_pattern TEXT NOT NULL, -- e.g., /task/:id, /invoice/:id/pay
  screen_name TEXT NOT NULL, -- Target screen in app

  -- Parameters
  required_params TEXT[] DEFAULT '{}',
  optional_params TEXT[] DEFAULT '{}',

  -- Auth requirements
  requires_auth BOOLEAN DEFAULT true,
  required_roles TEXT[] DEFAULT '{}',

  -- Fallback
  web_fallback_url TEXT,
  app_store_fallback BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100, -- Lower = higher priority for matching

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, path_pattern)
);

-- =====================================================
-- TABLE: mobile_feature_flags
-- Feature flags for mobile apps
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flag identification
  flag_key TEXT NOT NULL UNIQUE,
  flag_name TEXT NOT NULL,
  description TEXT,

  -- Targeting
  enabled_globally BOOLEAN DEFAULT false,
  enabled_for_users UUID[] DEFAULT '{}',
  enabled_for_tenants UUID[] DEFAULT '{}',
  enabled_percentage INTEGER DEFAULT 0, -- Gradual rollout percentage

  -- Platform targeting
  enabled_ios BOOLEAN DEFAULT true,
  enabled_android BOOLEAN DEFAULT true,
  min_app_version TEXT,
  max_app_version TEXT,

  -- Conditions
  conditions JSONB DEFAULT '[]'::jsonb, -- Complex targeting rules

  -- Variants (for A/B testing)
  variants JSONB DEFAULT '[]'::jsonb,
  default_variant TEXT DEFAULT 'control',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: app_review_prompts
-- Track app store review prompts
-- =====================================================
CREATE TABLE IF NOT EXISTS app_review_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,

  -- Prompt details
  prompt_trigger TEXT NOT NULL, -- task_completed, invoice_paid, positive_feedback
  prompt_shown_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- User response
  response TEXT, -- accepted, declined, later, not_now
  responded_at TIMESTAMPTZ,

  -- If they went to review
  app_store TEXT, -- app_store, play_store
  review_started_at TIMESTAMPTZ,

  -- Metadata
  app_version TEXT,
  session_count INTEGER,
  days_since_install INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: mobile_crash_reports
-- Store crash reports from mobile apps
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_crash_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,

  -- Crash details
  crash_type TEXT NOT NULL, -- exception, signal, anr
  exception_type TEXT,
  exception_message TEXT,
  stack_trace TEXT,

  -- Context
  screen_name TEXT,
  user_action TEXT, -- What user was doing

  -- Device info
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  build_number TEXT,

  -- State
  memory_usage_mb DECIMAL(10, 2),
  disk_free_mb DECIMAL(10, 2),
  battery_level INTEGER,
  is_charging BOOLEAN,
  network_type TEXT,

  -- Additional context
  breadcrumbs JSONB DEFAULT '[]'::jsonb, -- Recent user actions
  custom_data JSONB DEFAULT '{}'::jsonb,

  -- Processing
  is_processed BOOLEAN DEFAULT false,
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES mobile_crash_reports(id),
  issue_id TEXT, -- Link to issue tracker

  -- Timestamps
  crashed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- user_devices indexes
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_device_token ON user_devices(device_token) WHERE device_token IS NOT NULL;
CREATE INDEX idx_user_devices_active ON user_devices(user_id) WHERE is_active = true;
CREATE INDEX idx_user_devices_last_active ON user_devices(last_active_at DESC);

-- mobile_sessions indexes
CREATE INDEX idx_mobile_sessions_user_id ON mobile_sessions(user_id);
CREATE INDEX idx_mobile_sessions_device_id ON mobile_sessions(device_id);
CREATE INDEX idx_mobile_sessions_token ON mobile_sessions(session_token);
CREATE INDEX idx_mobile_sessions_active ON mobile_sessions(user_id) WHERE is_active = true;

-- push_notifications indexes
CREATE INDEX idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_device_id ON push_notifications(device_id);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);
CREATE INDEX idx_push_notifications_category ON push_notifications(category);
CREATE INDEX idx_push_notifications_scheduled ON push_notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_push_notifications_created ON push_notifications(created_at DESC);

-- offline_sync_queue indexes
CREATE INDEX idx_offline_sync_user_device ON offline_sync_queue(user_id, device_id);
CREATE INDEX idx_offline_sync_status ON offline_sync_queue(status) WHERE status IN ('pending', 'conflict');
CREATE INDEX idx_offline_sync_priority ON offline_sync_queue(priority, queued_at) WHERE status = 'pending';
CREATE INDEX idx_offline_sync_retry ON offline_sync_queue(next_retry_at) WHERE status = 'pending' AND retry_count < max_retries;

-- mobile_analytics indexes
CREATE INDEX idx_mobile_analytics_user_id ON mobile_analytics(user_id);
CREATE INDEX idx_mobile_analytics_device_id ON mobile_analytics(device_id);
CREATE INDEX idx_mobile_analytics_event ON mobile_analytics(event_name, event_category);
CREATE INDEX idx_mobile_analytics_session ON mobile_analytics(session_id);
CREATE INDEX idx_mobile_analytics_screen ON mobile_analytics(screen_name);
CREATE INDEX idx_mobile_analytics_created ON mobile_analytics(created_at DESC);
CREATE INDEX idx_mobile_analytics_errors ON mobile_analytics(event_category) WHERE event_category = 'error';

-- deep_link_routes indexes
CREATE INDEX idx_deep_link_routes_tenant ON deep_link_routes(tenant_id);
CREATE INDEX idx_deep_link_routes_pattern ON deep_link_routes(path_pattern);
CREATE INDEX idx_deep_link_routes_priority ON deep_link_routes(priority);

-- mobile_feature_flags indexes
CREATE INDEX idx_mobile_feature_flags_key ON mobile_feature_flags(flag_key);
CREATE INDEX idx_mobile_feature_flags_active ON mobile_feature_flags(is_active) WHERE is_active = true;

-- mobile_crash_reports indexes
CREATE INDEX idx_mobile_crash_reports_user ON mobile_crash_reports(user_id);
CREATE INDEX idx_mobile_crash_reports_device ON mobile_crash_reports(device_id);
CREATE INDEX idx_mobile_crash_reports_type ON mobile_crash_reports(crash_type);
CREATE INDEX idx_mobile_crash_reports_version ON mobile_crash_reports(app_version);
CREATE INDEX idx_mobile_crash_reports_unprocessed ON mobile_crash_reports(received_at) WHERE is_processed = false;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update device last activity
CREATE OR REPLACE FUNCTION update_device_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_devices
  SET last_active_at = now(),
      updated_at = now()
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_mobile_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM mobile_sessions
    WHERE expires_at < now() OR (is_active = false AND terminated_at < now() - INTERVAL '7 days')
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active devices
CREATE OR REPLACE FUNCTION get_user_active_devices(p_user_id UUID)
RETURNS TABLE (
  device_id UUID,
  device_name TEXT,
  device_type TEXT,
  device_model TEXT,
  last_active_at TIMESTAMPTZ,
  push_enabled BOOLEAN,
  biometric_enabled BOOLEAN,
  is_trusted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ud.id,
    ud.device_name,
    ud.device_type,
    ud.device_model,
    ud.last_active_at,
    ud.push_enabled,
    ud.biometric_enabled,
    ud.is_trusted
  FROM user_devices ud
  WHERE ud.user_id = p_user_id
    AND ud.is_active = true
  ORDER BY ud.last_active_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to send push notification
CREATE OR REPLACE FUNCTION queue_push_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_category TEXT,
  p_action_type TEXT DEFAULT NULL,
  p_action_data JSONB DEFAULT '{}'::jsonb,
  p_priority TEXT DEFAULT 'normal',
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_device RECORD;
BEGIN
  -- Create notification for each active device
  FOR v_device IN
    SELECT id, device_type
    FROM user_devices
    WHERE user_id = p_user_id
      AND is_active = true
      AND push_enabled = true
      AND device_token IS NOT NULL
      AND push_categories ? p_category
  LOOP
    INSERT INTO push_notifications (
      user_id, device_id, title, body, category, priority,
      action_type, action_data, scheduled_for, status
    ) VALUES (
      p_user_id, v_device.id, p_title, p_body, p_category, p_priority,
      p_action_type, p_action_data, COALESCE(p_scheduled_for, now()),
      CASE WHEN p_scheduled_for IS NULL OR p_scheduled_for <= now() THEN 'pending' ELSE 'pending' END
    ) RETURNING id INTO v_notification_id;
  END LOOP;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process sync queue
CREATE OR REPLACE FUNCTION process_sync_item(p_queue_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_item offline_sync_queue%ROWTYPE;
  v_result JSONB;
BEGIN
  SELECT * INTO v_item FROM offline_sync_queue WHERE id = p_queue_id;

  IF v_item IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Mark as syncing
  UPDATE offline_sync_queue
  SET status = 'syncing', sync_started_at = now()
  WHERE id = p_queue_id;

  -- Process based on operation type
  -- This is a placeholder - actual sync logic would be in application code

  -- Mark as synced
  UPDATE offline_sync_queue
  SET status = 'synced', synced_at = now()
  WHERE id = p_queue_id;

  RETURN jsonb_build_object('success', true, 'queue_id', p_queue_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get mobile dashboard data
CREATE OR REPLACE FUNCTION get_mobile_dashboard(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'tasks', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'due_today', COUNT(*) FILTER (WHERE due_date::date = CURRENT_DATE),
        'overdue', COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'completed'),
        'completed_today', COUNT(*) FILTER (WHERE completed_at::date = CURRENT_DATE)
      )
      FROM tasks WHERE assignee_id = p_user_id
    ),
    'projects', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active')
      )
      FROM projects WHERE user_id = p_user_id OR id IN (
        SELECT project_id FROM project_members WHERE user_id = p_user_id
      )
    ),
    'invoices', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'overdue', COUNT(*) FILTER (WHERE status = 'overdue'),
        'total_outstanding', COALESCE(SUM(amount) FILTER (WHERE status IN ('pending', 'overdue')), 0)
      )
      FROM invoices WHERE user_id = p_user_id
    ),
    'messages', (
      SELECT jsonb_build_object(
        'unread', COUNT(*)
      )
      FROM messages WHERE recipient_id = p_user_id AND read_at IS NULL
    ),
    'notifications', (
      SELECT jsonb_build_object(
        'unread', COUNT(*)
      )
      FROM notifications WHERE user_id = p_user_id AND read_at IS NULL
    ),
    'time_tracking', (
      SELECT jsonb_build_object(
        'today_minutes', COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(ended_at, now()) - started_at)) / 60), 0),
        'active_timer', EXISTS(SELECT 1 FROM time_entries WHERE user_id = p_user_id AND ended_at IS NULL)
      )
      FROM time_entries WHERE user_id = p_user_id AND started_at::date = CURRENT_DATE
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to register analytics event
CREATE OR REPLACE FUNCTION track_mobile_event(
  p_user_id UUID,
  p_device_id UUID,
  p_event_name TEXT,
  p_event_category TEXT,
  p_screen_name TEXT DEFAULT NULL,
  p_properties JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO mobile_analytics (
    user_id, device_id, event_name, event_category, screen_name, properties
  ) VALUES (
    p_user_id, p_device_id, p_event_name, p_event_category, p_screen_name, p_properties
  ) RETURNING id INTO v_event_id;

  -- Update device last activity
  IF p_device_id IS NOT NULL THEN
    UPDATE user_devices
    SET last_active_at = now()
    WHERE id = p_device_id;
  END IF;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update device activity on session activity
CREATE TRIGGER trg_update_device_on_session
  AFTER INSERT OR UPDATE ON mobile_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_device_activity();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_link_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_review_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_crash_reports ENABLE ROW LEVEL SECURITY;

-- user_devices policies
CREATE POLICY "Users can view their own devices"
  ON user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register devices"
  ON user_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON user_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices"
  ON user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- mobile_sessions policies
CREATE POLICY "Users can view their own sessions"
  ON mobile_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON mobile_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON mobile_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- push_notifications policies
CREATE POLICY "Users can view their own notifications"
  ON push_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON push_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON push_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- offline_sync_queue policies
CREATE POLICY "Users can view their own sync queue"
  ON offline_sync_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to sync queue"
  ON offline_sync_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync items"
  ON offline_sync_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync items"
  ON offline_sync_queue FOR DELETE
  USING (auth.uid() = user_id);

-- mobile_analytics policies
CREATE POLICY "Users can view their own analytics"
  ON mobile_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics events"
  ON mobile_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- mobile_app_configs policies
CREATE POLICY "Anyone can view active configs"
  ON mobile_app_configs FOR SELECT
  USING (is_active = true);

-- deep_link_routes policies
CREATE POLICY "Anyone can view active routes"
  ON deep_link_routes FOR SELECT
  USING (is_active = true);

-- mobile_feature_flags policies
CREATE POLICY "Anyone can view active flags"
  ON mobile_feature_flags FOR SELECT
  USING (is_active = true);

-- app_review_prompts policies
CREATE POLICY "Users can view their own prompts"
  ON app_review_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create prompts"
  ON app_review_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON app_review_prompts FOR UPDATE
  USING (auth.uid() = user_id);

-- mobile_crash_reports policies
CREATE POLICY "Users can view their own crash reports"
  ON mobile_crash_reports FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can submit crash reports"
  ON mobile_crash_reports FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default mobile app config
INSERT INTO mobile_app_configs (id, app_name, app_display_name)
VALUES (gen_random_uuid(), 'FreeFlow', 'FreeFlow - Freelance Platform')
ON CONFLICT DO NOTHING;

-- Insert default deep link routes
INSERT INTO deep_link_routes (path_pattern, screen_name, description, requires_auth, priority) VALUES
  ('/', 'Home', 'App home screen', false, 1),
  ('/dashboard', 'Dashboard', 'Main dashboard', true, 10),
  ('/task/:id', 'TaskDetail', 'View task details', true, 20),
  ('/project/:id', 'ProjectDetail', 'View project details', true, 20),
  ('/invoice/:id', 'InvoiceDetail', 'View invoice details', true, 20),
  ('/invoice/:id/pay', 'PayInvoice', 'Pay an invoice', false, 15),
  ('/chat/:id', 'ChatRoom', 'Open chat conversation', true, 20),
  ('/client/:id', 'ClientDetail', 'View client details', true, 20),
  ('/calendar', 'Calendar', 'Calendar view', true, 30),
  ('/time-tracker', 'TimeTracker', 'Time tracking', true, 30),
  ('/profile', 'Profile', 'User profile', true, 40),
  ('/settings', 'Settings', 'App settings', true, 40),
  ('/notifications', 'Notifications', 'Notification center', true, 40)
ON CONFLICT DO NOTHING;

-- Insert default feature flags
INSERT INTO mobile_feature_flags (flag_key, flag_name, description, enabled_globally) VALUES
  ('offline_mode', 'Offline Mode', 'Enable offline data access and sync', true),
  ('biometric_auth', 'Biometric Authentication', 'Enable Face ID / Fingerprint login', true),
  ('dark_mode', 'Dark Mode', 'Enable dark mode theme', true),
  ('quick_actions', 'Quick Actions', 'Enable 3D Touch / Long Press quick actions', true),
  ('widgets', 'Home Screen Widgets', 'Enable iOS/Android widgets', true),
  ('siri_shortcuts', 'Siri Shortcuts', 'Enable Siri integration (iOS)', true),
  ('watch_app', 'Apple Watch App', 'Enable Apple Watch companion app', false),
  ('ar_preview', 'AR Preview', 'Enable AR features for visual projects', false),
  ('voice_commands', 'Voice Commands', 'Enable voice control', false),
  ('ai_assistant', 'AI Assistant', 'Enable AI-powered features in mobile', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE user_devices IS 'Registered mobile devices for each user';
COMMENT ON TABLE mobile_sessions IS 'Active mobile app sessions';
COMMENT ON TABLE push_notifications IS 'All push notifications sent to users';
COMMENT ON TABLE offline_sync_queue IS 'Queue of offline changes pending sync';
COMMENT ON TABLE mobile_analytics IS 'Mobile app analytics events';
COMMENT ON TABLE mobile_app_configs IS 'Mobile app configuration per tenant';
COMMENT ON TABLE deep_link_routes IS 'Deep link URL routing configuration';
COMMENT ON TABLE mobile_feature_flags IS 'Feature flags for mobile apps';
COMMENT ON TABLE app_review_prompts IS 'Track app store review prompts';
COMMENT ON TABLE mobile_crash_reports IS 'Crash reports from mobile apps';
