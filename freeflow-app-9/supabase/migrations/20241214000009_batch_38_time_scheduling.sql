-- Batch 38: Time & Scheduling
-- Tables: time_tracking, calendar_events, bookings
-- Created: December 14, 2024

-- ================================================
-- TIME TRACKING TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS time_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Time Entry Details
  entry_type VARCHAR(50) NOT NULL DEFAULT 'manual'
    CHECK (entry_type IN ('manual', 'timer', 'automatic', 'imported', 'adjusted')),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Time Period
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  duration_hours DECIMAL(10, 2),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'paused', 'stopped', 'submitted', 'approved', 'rejected', 'invoiced')),
  is_billable BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,

  -- Association
  project_id UUID,
  task_id UUID,
  client_id UUID,
  team_id UUID,
  activity_type VARCHAR(100),
  category VARCHAR(100),

  -- Billing & Rates
  hourly_rate DECIMAL(10, 2),
  billable_amount DECIMAL(15, 2),
  cost_rate DECIMAL(10, 2),
  cost_amount DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Location & Device
  location VARCHAR(200),
  device_type VARCHAR(50),
  device_name VARCHAR(100),
  ip_address INET,
  timezone VARCHAR(100),

  -- Productivity
  productivity_score DECIMAL(5, 2),
  idle_time_seconds INTEGER DEFAULT 0,
  active_time_seconds INTEGER DEFAULT 0,
  breaks_count INTEGER DEFAULT 0,

  -- Screenshots & Tracking
  screenshots_enabled BOOLEAN DEFAULT false,
  screenshots JSONB DEFAULT '[]'::jsonb,
  activity_data JSONB DEFAULT '{}'::jsonb,
  apps_used JSONB DEFAULT '[]'::jsonb,

  -- Approval Workflow
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,

  -- Invoice Tracking
  invoiced_at TIMESTAMPTZ,
  invoice_id UUID,

  -- Notes & Tags
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT time_tracking_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT time_tracking_valid_duration CHECK (end_time IS NULL OR end_time >= start_time)
);

CREATE INDEX idx_time_tracking_user_id ON time_tracking(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_tracking_start_time ON time_tracking(start_time DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_tracking_status ON time_tracking(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_tracking_project ON time_tracking(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_tracking_billable ON time_tracking(is_billable) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own time tracking" ON time_tracking FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own time tracking" ON time_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time tracking" ON time_tracking FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own time tracking" ON time_tracking FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE time_tracking;

-- ================================================
-- CALENDAR EVENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL DEFAULT 'meeting'
    CHECK (event_type IN ('meeting', 'appointment', 'task', 'reminder', 'deadline', 'milestone', 'holiday', 'birthday', 'custom')),

  -- Time & Duration
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  timezone VARCHAR(100) DEFAULT 'UTC',
  duration_minutes INTEGER,

  -- Location
  location VARCHAR(500),
  location_type VARCHAR(50)
    CHECK (location_type IN ('in_person', 'virtual', 'hybrid', 'tbd')),
  meeting_url TEXT,
  meeting_id VARCHAR(200),
  meeting_password VARCHAR(100),

  -- Status & Availability
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('tentative', 'confirmed', 'cancelled', 'rescheduled', 'completed')),
  availability VARCHAR(50) DEFAULT 'busy'
    CHECK (availability IN ('free', 'busy', 'tentative', 'out_of_office')),
  visibility VARCHAR(50) DEFAULT 'default'
    CHECK (visibility IN ('default', 'public', 'private', 'confidential')),

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  recurrence_frequency VARCHAR(50)
    CHECK (recurrence_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom')),
  recurrence_end_date DATE,
  recurrence_count INTEGER,
  parent_event_id UUID REFERENCES calendar_events(id),

  -- Participants
  organizer_id UUID REFERENCES auth.users(id),
  attendees JSONB DEFAULT '[]'::jsonb,
  required_attendees TEXT[],
  optional_attendees TEXT[],
  total_attendees INTEGER DEFAULT 0,

  -- RSVP Tracking
  rsvp_required BOOLEAN DEFAULT false,
  rsvp_deadline TIMESTAMPTZ,
  accepted_count INTEGER DEFAULT 0,
  declined_count INTEGER DEFAULT 0,
  tentative_count INTEGER DEFAULT 0,

  -- Calendar Association
  calendar_id UUID,
  calendar_name VARCHAR(200),
  color VARCHAR(20),

  -- Reminders
  reminders JSONB DEFAULT '[]'::jsonb,
  reminder_sent BOOLEAN DEFAULT false,

  -- Categories & Tags
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  tags TEXT[],

  -- Attachments & Resources
  attachments JSONB DEFAULT '[]'::jsonb,
  resources TEXT[],
  agenda TEXT,
  notes TEXT,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  external_calendar_id VARCHAR(200),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT calendar_events_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT calendar_events_valid_time CHECK (end_time >= start_time)
);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_end_time ON calendar_events(end_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_status ON calendar_events(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own calendar events" ON calendar_events FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar events" ON calendar_events FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own calendar events" ON calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;

-- ================================================
-- BOOKINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Booking Details
  booking_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  booking_type VARCHAR(50) NOT NULL DEFAULT 'appointment'
    CHECK (booking_type IN ('appointment', 'reservation', 'session', 'class', 'event', 'rental', 'service', 'consultation', 'custom')),

  -- Customer Information
  customer_id UUID REFERENCES auth.users(id),
  customer_name VARCHAR(300),
  customer_email VARCHAR(300),
  customer_phone VARCHAR(50),
  guest_count INTEGER DEFAULT 1,

  -- Time & Duration
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,

  -- Status & Confirmation
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled', 'waitlisted')),
  confirmation_code VARCHAR(100),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id),

  -- Resource & Location
  resource_id UUID,
  resource_name VARCHAR(300),
  location VARCHAR(500),
  location_type VARCHAR(50)
    CHECK (location_type IN ('in_person', 'virtual', 'phone', 'hybrid')),
  meeting_url TEXT,
  room_number VARCHAR(100),

  -- Service Provider
  provider_id UUID REFERENCES auth.users(id),
  provider_name VARCHAR(300),
  service_id UUID,
  service_name VARCHAR(300),

  -- Pricing
  price DECIMAL(15, 2) DEFAULT 0.00,
  deposit_amount DECIMAL(15, 2) DEFAULT 0.00,
  paid_amount DECIMAL(15, 2) DEFAULT 0.00,
  balance_due DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded', 'cancelled')),

  -- Cancellation Policy
  cancellation_policy TEXT,
  cancellation_deadline TIMESTAMPTZ,
  cancellation_fee DECIMAL(15, 2),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,

  -- Reminders & Notifications
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  confirmation_sent BOOLEAN DEFAULT false,
  confirmation_sent_at TIMESTAMPTZ,
  follow_up_sent BOOLEAN DEFAULT false,

  -- Check-in
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Special Requirements
  special_requests TEXT,
  notes TEXT,
  internal_notes TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  parent_booking_id UUID REFERENCES bookings(id),

  -- Capacity & Availability
  capacity INTEGER DEFAULT 1,
  slots_booked INTEGER DEFAULT 1,
  waitlist_position INTEGER,

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT bookings_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT bookings_valid_time CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_number ON bookings(booking_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_start_time ON bookings(start_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_customer ON bookings(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_provider ON bookings(provider_id) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own bookings" ON bookings FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_time_tracking_updated_at BEFORE UPDATE ON time_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
