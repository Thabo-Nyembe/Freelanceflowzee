-- Batch 30: Events & Webinars Integration
-- Created: December 14, 2024
-- Tables: events, webinars, event_registrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('conference', 'workshop', 'meetup', 'training', 'seminar', 'networking', 'launch', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled', 'postponed')),

  -- Schedule
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  duration_minutes INTEGER,

  -- Location
  location_type VARCHAR(50) CHECK (location_type IN ('in-person', 'virtual', 'hybrid')),
  venue_name VARCHAR(255),
  venue_address TEXT,
  virtual_link TEXT,

  -- Capacity
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,

  -- Engagement
  registrations INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2),
  satisfaction_score DECIMAL(3,2),

  -- Meta
  tags TEXT[],
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_capacity CHECK (current_attendees <= max_attendees OR max_attendees IS NULL)
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON events(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE deleted_at IS NULL AND is_featured = TRUE;

-- RLS Policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own events" ON events;
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "Users can create their own events" ON events;
CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON events;
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can soft delete their own events" ON events;
CREATE POLICY "Users can soft delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- WEBINARS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS webinars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Webinar details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  topic VARCHAR(100) NOT NULL CHECK (topic IN ('sales', 'marketing', 'product', 'training', 'demo', 'onboarding', 'qa', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled', 'recording')),

  -- Schedule
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Platform
  platform VARCHAR(50) CHECK (platform IN ('zoom', 'teams', 'meet', 'webex', 'custom')),
  meeting_link TEXT,
  meeting_id VARCHAR(255),
  passcode VARCHAR(100),

  -- Capacity & Engagement
  max_participants INTEGER,
  registered_count INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  live_viewers INTEGER DEFAULT 0,

  -- Recording
  recording_url TEXT,
  recording_duration INTEGER,
  recording_views INTEGER DEFAULT 0,

  -- Speakers
  host_name VARCHAR(255),
  speakers JSONB,

  -- Engagement metrics
  questions_asked INTEGER DEFAULT 0,
  polls_conducted INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  satisfaction_rating DECIMAL(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for webinars
CREATE INDEX IF NOT EXISTS idx_webinars_user_id ON webinars(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webinars_status ON webinars(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webinars_scheduled_date ON webinars(scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webinars_topic ON webinars(topic) WHERE deleted_at IS NULL;

-- RLS Policies for webinars
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own webinars" ON webinars;
CREATE POLICY "Users can view their own webinars"
  ON webinars FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create webinars" ON webinars;
CREATE POLICY "Users can create webinars"
  ON webinars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their webinars" ON webinars;
CREATE POLICY "Users can update their webinars"
  ON webinars FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- EVENT REGISTRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Registration details
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
  registration_type VARCHAR(50) CHECK (registration_type IN ('event', 'webinar')),

  -- Registrant info
  registrant_name VARCHAR(255) NOT NULL,
  registrant_email VARCHAR(255) NOT NULL,
  registrant_phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(255),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'attended', 'no-show', 'cancelled', 'waitlist')),

  -- Tickets
  ticket_type VARCHAR(50) CHECK (ticket_type IN ('free', 'paid', 'vip', 'speaker', 'sponsor', 'press')),
  ticket_price DECIMAL(10,2),
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),

  -- Attendance
  checked_in_at TIMESTAMPTZ,
  attendance_duration INTEGER,

  -- Communication
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_registration CHECK (
    (event_id IS NOT NULL AND webinar_id IS NULL AND registration_type = 'event') OR
    (webinar_id IS NOT NULL AND event_id IS NULL AND registration_type = 'webinar')
  )
);

-- Indexes for event_registrations
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON event_registrations(event_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_registrations_webinar_id ON event_registrations(webinar_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_registrations_email ON event_registrations(registrant_email) WHERE deleted_at IS NULL;

-- RLS Policies for event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their registrations" ON event_registrations;
CREATE POLICY "Users can view their registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create registrations" ON event_registrations;
CREATE POLICY "Users can create registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their registrations" ON event_registrations;
CREATE POLICY "Users can update their registrations"
  ON event_registrations FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to events
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to webinars
DROP TRIGGER IF EXISTS update_webinars_updated_at ON webinars;
CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON webinars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to event_registrations
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================================================

-- Enable real-time for events
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Enable real-time for webinars
ALTER PUBLICATION supabase_realtime ADD TABLE webinars;

-- Enable real-time for event_registrations
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment below to insert sample data for testing

-- INSERT INTO events (name, event_type, status, start_date, end_date, user_id, max_attendees, location_type, is_public)
-- VALUES
--   ('Tech Conference 2024', 'conference', 'upcoming', NOW() + INTERVAL '30 days', NOW() + INTERVAL '32 days', auth.uid(), 500, 'hybrid', true),
--   ('Product Launch', 'launch', 'upcoming', NOW() + INTERVAL '15 days', NOW() + INTERVAL '15 days', auth.uid(), 200, 'virtual', true),
--   ('Developer Workshop', 'workshop', 'completed', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', auth.uid(), 50, 'in-person', true);

-- Migration complete
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create hooks library (lib/hooks/)
-- 3. Create server actions (app/actions/)
-- 4. Integrate V2 pages
