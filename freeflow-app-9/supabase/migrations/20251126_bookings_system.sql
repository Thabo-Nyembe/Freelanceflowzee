-- ============================================================================
-- Bookings System - Production Database Schema
-- ============================================================================
-- Comprehensive appointment and booking management with scheduling,
-- availability tracking, reminders, and revenue calculations
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('awaiting', 'paid', 'partial', 'refunded', 'failed');
CREATE TYPE booking_type AS ENUM ('consultation', 'meeting', 'service', 'call', 'workshop', 'event');
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'biweekly', 'monthly');
CREATE TYPE reminder_type AS ENUM ('email', 'sms', 'push', 'all');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  service TEXT NOT NULL,
  type booking_type NOT NULL DEFAULT 'consultation',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status booking_status NOT NULL DEFAULT 'pending',
  payment payment_status NOT NULL DEFAULT 'awaiting',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  recurrence recurrence_type NOT NULL DEFAULT 'none',
  parent_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_type reminder_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Slots (Availability)
CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  slot_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  buffer_time INTEGER NOT NULL DEFAULT 0, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Settings
CREATE TABLE booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_hours_start TIME NOT NULL DEFAULT '09:00',
  business_hours_end TIME NOT NULL DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday-Friday
  slot_duration INTEGER NOT NULL DEFAULT 60,
  buffer_time INTEGER NOT NULL DEFAULT 0,
  advance_booking_days INTEGER NOT NULL DEFAULT 30,
  cancellation_policy TEXT,
  auto_confirm BOOLEAN NOT NULL DEFAULT FALSE,
  require_deposit BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_percentage INTEGER NOT NULL DEFAULT 0 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  send_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_hours INTEGER[] DEFAULT '{24,2}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Reminders
CREATE TABLE booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Stats
CREATE TABLE booking_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  confirmed INTEGER NOT NULL DEFAULT 0,
  pending INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  cancelled INTEGER NOT NULL DEFAULT 0,
  no_shows INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  average_booking_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  most_popular_service TEXT,
  peak_booking_day TEXT,
  completion_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  cancellation_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  no_show_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment ON bookings(payment);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, start_time);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_tags ON bookings USING GIN(tags);
CREATE INDEX idx_bookings_recurrence ON bookings(recurrence) WHERE recurrence != 'none';

-- Booking Slots indexes
CREATE INDEX idx_booking_slots_user_id ON booking_slots(user_id);
CREATE INDEX idx_booking_slots_day ON booking_slots(day_of_week);
CREATE INDEX idx_booking_slots_available ON booking_slots(is_available);

-- Booking Settings indexes
CREATE INDEX idx_booking_settings_user_id ON booking_settings(user_id);

-- Booking Reminders indexes
CREATE INDEX idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX idx_booking_reminders_scheduled ON booking_reminders(scheduled_for);
CREATE INDEX idx_booking_reminders_sent ON booking_reminders(sent) WHERE sent = FALSE;

-- Booking Stats indexes
CREATE INDEX idx_booking_stats_user_id ON booking_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_slots_updated_at
  BEFORE UPDATE ON booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_settings_updated_at
  BEFORE UPDATE ON booking_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_stats_updated_at
  BEFORE UPDATE ON booking_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on booking changes
CREATE OR REPLACE FUNCTION update_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO booking_stats (user_id)
  VALUES (COALESCE(NEW.user_id, OLD.user_id))
  ON CONFLICT (user_id) DO UPDATE SET
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id),
    confirmed = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'confirmed'),
    pending = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'pending'),
    completed = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'completed'),
    cancelled = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'cancelled'),
    no_shows = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'no_show'),
    total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE user_id = EXCLUDED.user_id AND payment = 'paid'),
    average_booking_value = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COALESCE(SUM(amount), 0) / COUNT(*), 2)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    completion_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    cancellation_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'cancelled')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    no_show_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'no_show')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_booking_change
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_stats();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get available time slots for a date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_user_id UUID,
  p_date DATE,
  p_duration INTEGER DEFAULT 60
)
RETURNS TABLE(
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_start_time TIME;
  v_end_time TIME;
  v_day_of_week INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get business hours for the day
  SELECT business_hours_start, business_hours_end
  INTO v_start_time, v_end_time
  FROM booking_settings
  WHERE user_id = p_user_id AND v_day_of_week = ANY(working_days);

  IF v_start_time IS NULL THEN
    RETURN;
  END IF;

  -- Generate slots
  RETURN QUERY
  WITH RECURSIVE time_slots AS (
    SELECT v_start_time AS slot_time
    UNION ALL
    SELECT slot_time + (p_duration || ' minutes')::INTERVAL
    FROM time_slots
    WHERE slot_time + (p_duration || ' minutes')::INTERVAL < v_end_time
  )
  SELECT
    ts.slot_time,
    NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.user_id = p_user_id
        AND b.booking_date = p_date
        AND b.start_time = ts.slot_time
        AND b.status != 'cancelled'
    ) AS is_available
  FROM time_slots ts
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming bookings
CREATE OR REPLACE FUNCTION get_upcoming_bookings(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  id UUID,
  client_name TEXT,
  service TEXT,
  booking_date DATE,
  start_time TIME,
  status booking_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.client_name, b.service, b.booking_date, b.start_time, b.status
  FROM bookings b
  WHERE b.user_id = p_user_id
    AND b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    AND b.status != 'cancelled'
  ORDER BY b.booking_date, b.start_time;
END;
$$ LANGUAGE plpgsql;

-- Calculate revenue for period
CREATE OR REPLACE FUNCTION calculate_booking_revenue(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_revenue DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_revenue
  FROM bookings
  WHERE user_id = p_user_id
    AND payment = 'paid'
    AND (p_start_date IS NULL OR booking_date >= p_start_date)
    AND (p_end_date IS NULL OR booking_date <= p_end_date);

  RETURN v_revenue;
END;
$$ LANGUAGE plpgsql;

-- Check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_user_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration INTEGER,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conflict BOOLEAN;
  v_end_time TIME;
BEGIN
  v_end_time := p_time + (p_duration || ' minutes')::INTERVAL;

  SELECT EXISTS (
    SELECT 1
    FROM bookings
    WHERE user_id = p_user_id
      AND booking_date = p_date
      AND status != 'cancelled'
      AND (id IS DISTINCT FROM p_exclude_id)
      AND (
        (start_time >= p_time AND start_time < v_end_time) OR
        (start_time + (duration_minutes || ' minutes')::INTERVAL > p_time
         AND start_time < p_time)
      )
  )
  INTO v_conflict;

  RETURN v_conflict;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_stats ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = client_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = user_id);

-- Booking Slots policies
CREATE POLICY "Users can view all public slots"
  ON booking_slots FOR SELECT
  USING (is_available = TRUE);

CREATE POLICY "Users can manage their own slots"
  ON booking_slots FOR ALL
  USING (auth.uid() = user_id);

-- Booking Settings policies
CREATE POLICY "Users can view their own settings"
  ON booking_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON booking_settings FOR ALL
  USING (auth.uid() = user_id);

-- Booking Reminders policies
CREATE POLICY "Users can view reminders for their bookings"
  ON booking_reminders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_reminders.booking_id AND user_id = auth.uid()
  ));

-- Booking Stats policies
CREATE POLICY "Users can view their own stats"
  ON booking_stats FOR SELECT
  USING (auth.uid() = user_id);
