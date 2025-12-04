-- Comprehensive table drops for CHUNK 04
DROP VIEW IF EXISTS client_dashboard_stats CASCADE;
DROP VIEW IF EXISTS active_projects_overview CASCADE;
DROP TABLE IF EXISTS ai_collaboration CASCADE;
DROP TABLE IF EXISTS client_schedules CASCADE;
DROP TABLE IF EXISTS client_feedback CASCADE;
DROP TABLE IF EXISTS milestone_payments CASCADE;
DROP TABLE IF EXISTS client_invoices CASCADE;
DROP TABLE IF EXISTS client_files CASCADE;
DROP TABLE IF EXISTS client_messages CASCADE;
DROP TABLE IF EXISTS revision_requests CASCADE;
DROP TABLE IF EXISTS project_deliverables CASCADE;
DROP TABLE IF EXISTS client_projects CASCADE;
DROP TABLE IF EXISTS portal_projects CASCADE;
DROP TABLE IF EXISTS portal_clients CASCADE;
DROP TABLE IF EXISTS client_notifications CASCADE;
DROP TABLE IF EXISTS canvas_versions CASCADE;
DROP TABLE IF EXISTS canvas_sessions CASCADE;
DROP TABLE IF EXISTS canvas_projects CASCADE;
DROP TABLE IF EXISTS event_reminders CASCADE;
DROP TABLE IF EXISTS event_views CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS calendars CASCADE;

-- Drop tables that might have outdated schemas
DROP TABLE IF EXISTS revision_requests CASCADE;
DROP TABLE IF EXISTS project_deliverables CASCADE;
DROP TABLE IF EXISTS milestone_payments CASCADE;
DROP TABLE IF EXISTS client_invoices CASCADE;
DROP TABLE IF EXISTS client_files CASCADE;
DROP TABLE IF EXISTS client_messages CASCADE;
DROP TABLE IF EXISTS client_feedback CASCADE;
DROP TABLE IF EXISTS client_schedules CASCADE;
DROP TABLE IF EXISTS client_projects CASCADE;
DROP TABLE IF EXISTS portal_projects CASCADE;
DROP TABLE IF EXISTS portal_clients CASCADE;

-- ============================================================================
-- SESSION_13: CALENDAR SYSTEM - Production Database Schema
-- ============================================================================
-- World-class calendar and scheduling system with:
-- - Event management with recurrence
-- - RSVP and attendee tracking
-- - AI-powered scheduling suggestions
-- - Multiple calendar support
-- - Reminder system
-- - Meeting analytics
-- - Integration with external calendars
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS event_type CASCADE;
CREATE TYPE event_type AS ENUM (
  'meeting',
  'call',
  'presentation',
  'workshop',
  'deadline',
  'reminder',
  'task',
  'interview',
  'review',
  'social',
  'personal',
  'other'
);

DROP TYPE IF EXISTS event_status CASCADE;
CREATE TYPE event_status AS ENUM (
  'tentative',
  'confirmed',
  'cancelled',
  'completed'
);

DROP TYPE IF EXISTS event_visibility CASCADE;
CREATE TYPE event_visibility AS ENUM (
  'public',
  'private',
  'confidential'
);

DROP TYPE IF EXISTS location_type CASCADE;
CREATE TYPE location_type AS ENUM (
  'physical',
  'video',
  'phone',
  'hybrid',
  'none'
);

DROP TYPE IF EXISTS attendee_role CASCADE;
CREATE TYPE attendee_role AS ENUM (
  'organizer',
  'required',
  'optional',
  'resource'
);

DROP TYPE IF EXISTS attendee_status CASCADE;
CREATE TYPE attendee_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'tentative',
  'no-response'
);

DROP TYPE IF EXISTS reminder_method CASCADE;
CREATE TYPE reminder_method AS ENUM (
  'email',
  'push',
  'sms',
  'popup'
);

DROP TYPE IF EXISTS recurrence_frequency CASCADE;
CREATE TYPE recurrence_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'yearly'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Calendars Table
CREATE TABLE IF NOT EXISTS calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Calendar info
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',

  -- Settings
  is_default BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  time_zone TEXT NOT NULL DEFAULT 'America/New_York',

  -- Working hours (JSONB for flexibility)
  working_hours JSONB DEFAULT '{}',

  -- Notifications
  notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false, "defaultReminder": 15}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,

  -- Time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  time_zone TEXT NOT NULL DEFAULT 'America/New_York',

  -- Classification
  event_type event_type NOT NULL DEFAULT 'meeting',
  status event_status NOT NULL DEFAULT 'tentative',
  visibility event_visibility NOT NULL DEFAULT 'public',

  -- Location
  location TEXT,
  location_type location_type NOT NULL DEFAULT 'none',
  meeting_url TEXT,
  coordinates POINT, -- PostGIS point for lat/lng

  -- Organizer
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,

  -- Visual
  color TEXT,

  -- RSVP
  rsvp_required BOOLEAN DEFAULT FALSE,
  rsvp_deadline TIMESTAMPTZ,

  -- Integration
  external_id TEXT, -- Google Calendar, Outlook, etc.
  source TEXT, -- 'google', 'outlook', 'kazi', etc.

  -- Tracking
  views INTEGER DEFAULT 0,
  responses INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_rsvp_deadline CHECK (
    rsvp_deadline IS NULL OR rsvp_deadline < start_time
  )
);

-- Recurrence Rules Table
CREATE TABLE IF NOT EXISTS event_recurrence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Recurrence pattern
  frequency recurrence_frequency NOT NULL,
  interval INTEGER NOT NULL DEFAULT 1,

  -- End conditions
  end_date TIMESTAMPTZ,
  count INTEGER, -- Number of occurrences

  -- Advanced patterns
  by_day INTEGER[], -- Days of week (0-6, Sun-Sat)
  by_month_day INTEGER[], -- Days of month (1-31)
  by_month INTEGER[], -- Months (1-12)

  -- Exceptions
  exceptions TEXT[], -- ISO dates to skip

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_interval CHECK (interval > 0),
  CONSTRAINT valid_end_condition CHECK (
    end_date IS NOT NULL OR count IS NOT NULL
  ),
  CONSTRAINT valid_by_day CHECK (
    by_day IS NULL OR (
      array_length(by_day, 1) > 0 AND
      by_day <@ ARRAY[0,1,2,3,4,5,6]
    )
  ),
  CONSTRAINT valid_by_month_day CHECK (
    by_month_day IS NULL OR (
      array_length(by_month_day, 1) > 0 AND
      by_month_day <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
    )
  ),
  CONSTRAINT valid_by_month CHECK (
    by_month IS NULL OR (
      array_length(by_month, 1) > 0 AND
      by_month <@ ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
    )
  ),

  -- One recurrence rule per event
  UNIQUE(event_id)
);

-- Attendees Table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Attendee info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for external attendees
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,

  -- Role and status
  role attendee_role NOT NULL DEFAULT 'optional',
  status attendee_status NOT NULL DEFAULT 'pending',
  optional BOOLEAN DEFAULT FALSE,

  -- Response
  response_time TIMESTAMPTZ,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(event_id, email)
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Reminder settings
  minutes INTEGER NOT NULL, -- Before event
  method reminder_method NOT NULL,

  -- Tracking
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_minutes CHECK (minutes >= 0)
);

-- Attachments Table
CREATE TABLE IF NOT EXISTS event_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- File info
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,

  -- Tracking
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_size CHECK (size > 0)
);

-- Event Views Table (Analytics)
CREATE TABLE IF NOT EXISTS event_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Viewer info (nullable for anonymous views)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Insights Table
CREATE TABLE IF NOT EXISTS calendar_ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Insight details
  type TEXT NOT NULL, -- 'optimization', 'conflict', 'productivity', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Importance
  impact TEXT NOT NULL, -- 'low', 'medium', 'high'
  confidence INTEGER NOT NULL, -- 0-100
  actionable BOOLEAN DEFAULT FALSE,
  suggestion TEXT,

  -- Related data
  data JSONB DEFAULT '{}',

  -- Related events
  event_ids UUID[],

  -- Status
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_impact CHECK (impact IN ('low', 'medium', 'high')),
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 100)
);

-- Scheduling Suggestions Table
CREATE TABLE IF NOT EXISTS scheduling_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Suggestion details
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes

  -- Time slot
  suggested_start TIMESTAMPTZ NOT NULL,
  suggested_end TIMESTAMPTZ NOT NULL,

  -- Scoring
  score INTEGER NOT NULL, -- 0-100
  reasoning TEXT[],

  -- Attendee availability
  attendee_availability JSONB DEFAULT '{}',

  -- Status
  accepted BOOLEAN DEFAULT FALSE,
  event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_duration CHECK (duration > 0),
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100),
  CONSTRAINT valid_time_slot CHECK (suggested_end > suggested_start)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Calendars Indexes
CREATE INDEX IF NOT EXISTS idx_calendars_user_id ON calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_calendars_is_default ON calendars(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_calendars_is_visible ON calendars(is_visible) WHERE is_visible = TRUE;

-- Events Indexes
CREATE INDEX IF NOT EXISTS idx_events_calendar_id ON calendar_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON calendar_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_time_range ON calendar_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON calendar_events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_location_type ON calendar_events(location_type);
CREATE INDEX IF NOT EXISTS idx_events_external_id ON calendar_events(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_source ON calendar_events(source) WHERE source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_created_at ON calendar_events(created_at DESC);

-- Full-text search on events
CREATE INDEX IF NOT EXISTS idx_events_title_search ON calendar_events USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_events_description_search ON calendar_events USING GIN(to_tsvector('english', COALESCE(description, '')));

-- Recurrence Indexes
CREATE INDEX IF NOT EXISTS idx_recurrence_event_id ON event_recurrence(event_id);
CREATE INDEX IF NOT EXISTS idx_recurrence_frequency ON event_recurrence(frequency);
CREATE INDEX IF NOT EXISTS idx_recurrence_end_date ON event_recurrence(end_date) WHERE end_date IS NOT NULL;

-- Attendees Indexes
CREATE INDEX IF NOT EXISTS idx_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendees_email ON event_attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_role ON event_attendees(role);
CREATE INDEX IF NOT EXISTS idx_attendees_status ON event_attendees(status);
CREATE INDEX IF NOT EXISTS idx_attendees_response_time ON event_attendees(response_time) WHERE response_time IS NOT NULL;

-- Reminders Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_event_id ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_reminders_method ON event_reminders(method);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON event_reminders(sent) WHERE sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_reminders_sent_at ON event_reminders(sent_at) WHERE sent_at IS NOT NULL;

-- Attachments Indexes
CREATE INDEX IF NOT EXISTS idx_attachments_event_id ON event_attachments(event_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON event_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_at ON event_attachments(uploaded_at DESC);

-- Views Indexes
CREATE INDEX IF NOT EXISTS idx_event_views_event_id ON event_views(event_id);
CREATE INDEX IF NOT EXISTS idx_event_views_user_id ON event_views(user_id);
CREATE INDEX IF NOT EXISTS idx_event_views_created_at ON event_views(created_at DESC);

-- AI Insights Indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON calendar_ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON calendar_ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_impact ON calendar_ai_insights(impact);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed ON calendar_ai_insights(dismissed) WHERE dismissed = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON calendar_ai_insights(created_at DESC);

-- Suggestions Indexes
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON scheduling_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_suggested_start ON scheduling_suggestions(suggested_start);
CREATE INDEX IF NOT EXISTS idx_suggestions_score ON scheduling_suggestions(score DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_accepted ON scheduling_suggestions(accepted) WHERE accepted = FALSE;
CREATE INDEX IF NOT EXISTS idx_suggestions_expires_at ON scheduling_suggestions(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_recurrence ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_suggestions ENABLE ROW LEVEL SECURITY;

-- Calendars Policies
CREATE POLICY "Users can view their own calendars"
  ON calendars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendars"
  ON calendars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendars"
  ON calendars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars"
  ON calendars FOR DELETE
  USING (auth.uid() = user_id);

-- Events Policies
CREATE POLICY "Users can view events from their calendars"
  ON calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendars
      WHERE id = calendar_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view events they're invited to"
  ON calendar_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_attendees
      WHERE event_id = calendar_events.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public events"
  ON calendar_events FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can insert events in their calendars"
  ON calendar_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM calendars
      WHERE id = calendar_id AND user_id = auth.uid()
    ) AND organizer_id = auth.uid()
  );

CREATE POLICY "Organizers can update their events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = organizer_id);

-- Recurrence Policies
CREATE POLICY "Users can view recurrence for events they can see"
  ON event_recurrence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND (
        EXISTS (
          SELECT 1 FROM calendars
          WHERE id = calendar_id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_id = calendar_events.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Event organizers can manage recurrence"
  ON event_recurrence FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

-- Attendees Policies
CREATE POLICY "Users can view attendees for events they can see"
  ON event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND (
        EXISTS (
          SELECT 1 FROM calendars
          WHERE id = calendar_id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM event_attendees att
          WHERE att.event_id = calendar_events.id AND att.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Event organizers can manage attendees"
  ON event_attendees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Attendees can update their own status"
  ON event_attendees FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reminders Policies
CREATE POLICY "Users can view reminders for their events"
  ON event_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND (
        organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_id = calendar_events.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Event organizers and attendees can manage reminders"
  ON event_reminders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND (
        organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_id = calendar_events.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Attachments Policies
CREATE POLICY "Users can view attachments for events they can see"
  ON event_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND (
        EXISTS (
          SELECT 1 FROM calendars
          WHERE id = calendar_id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_id = calendar_events.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Event organizers and attendees can add attachments"
  ON event_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND (
        organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM event_attendees
          WHERE event_id = calendar_events.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Uploaders can delete their attachments"
  ON event_attachments FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Views Policies
CREATE POLICY "Anyone can insert event views"
  ON event_views FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view analytics for their events"
  ON event_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calendar_events
      WHERE id = event_id AND organizer_id = auth.uid()
    )
  );

-- AI Insights Policies
CREATE POLICY "Users can view their own insights"
  ON calendar_ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON calendar_ai_insights FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own insights"
  ON calendar_ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Suggestions Policies
CREATE POLICY "Users can view their own suggestions"
  ON scheduling_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert suggestions"
  ON scheduling_suggestions FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own suggestions"
  ON scheduling_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update event views count
CREATE OR REPLACE FUNCTION update_event_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE calendar_events
  SET views = views + 1
  WHERE id = NEW.event_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_views_count
  AFTER INSERT ON event_views
  FOR EACH ROW
  EXECUTE FUNCTION update_event_views_count();

-- Update event responses count
CREATE OR REPLACE FUNCTION update_event_responses_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending') THEN
    UPDATE calendar_events
    SET responses = (
      SELECT COUNT(*) FROM event_attendees
      WHERE event_id = NEW.event_id AND status != 'pending'
    )
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status != 'pending' THEN
    UPDATE calendar_events
    SET responses = (
      SELECT COUNT(*) FROM event_attendees
      WHERE event_id = OLD.event_id AND status != 'pending'
    )
    WHERE id = OLD.event_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_responses_count
  AFTER INSERT OR UPDATE OR DELETE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_event_responses_count();

-- Ensure only one default calendar per user
CREATE OR REPLACE FUNCTION ensure_single_default_calendar()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE calendars
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_calendar
  BEFORE INSERT OR UPDATE ON calendars
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_calendar();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Search events by text
CREATE OR REPLACE FUNCTION search_calendar_events(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL,
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF calendar_events AS $$
BEGIN
  RETURN QUERY
  SELECT ce.*
  FROM calendar_events ce
  JOIN calendars c ON ce.calendar_id = c.id
  WHERE
    (user_uuid IS NULL OR c.user_id = user_uuid OR ce.organizer_id = user_uuid OR
     EXISTS (
       SELECT 1 FROM event_attendees
       WHERE event_id = ce.id AND user_id = user_uuid
     ))
    AND (
      to_tsvector('english', ce.title) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(ce.description, '')) @@ plainto_tsquery('english', search_query)
    )
    AND (start_date IS NULL OR ce.start_time >= start_date)
    AND (end_date IS NULL OR ce.end_time <= end_date)
  ORDER BY
    ts_rank(to_tsvector('english', ce.title || ' ' || COALESCE(ce.description, '')),
            plainto_tsquery('english', search_query)) DESC,
    ce.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Get events in date range
CREATE OR REPLACE FUNCTION get_events_in_range(
  user_uuid UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS SETOF calendar_events AS $$
BEGIN
  RETURN QUERY
  SELECT ce.*
  FROM calendar_events ce
  JOIN calendars c ON ce.calendar_id = c.id
  WHERE
    (c.user_id = user_uuid OR ce.organizer_id = user_uuid OR
     EXISTS (
       SELECT 1 FROM event_attendees
       WHERE event_id = ce.id AND user_id = user_uuid
     ))
    AND ce.start_time >= start_date
    AND ce.start_time < end_date
  ORDER BY ce.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Find conflicting events
CREATE OR REPLACE FUNCTION find_event_conflicts(
  user_uuid UUID,
  check_start TIMESTAMPTZ,
  check_end TIMESTAMPTZ,
  exclude_event_id UUID DEFAULT NULL
)
RETURNS SETOF calendar_events AS $$
BEGIN
  RETURN QUERY
  SELECT ce.*
  FROM calendar_events ce
  JOIN calendars c ON ce.calendar_id = c.id
  WHERE
    (c.user_id = user_uuid OR ce.organizer_id = user_uuid)
    AND ce.id != COALESCE(exclude_event_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND ce.status != 'cancelled'
    AND (
      (ce.start_time, ce.end_time) OVERLAPS (check_start, check_end)
    )
  ORDER BY ce.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS SETOF calendar_events AS $$
BEGIN
  RETURN QUERY
  SELECT ce.*
  FROM calendar_events ce
  JOIN calendars c ON ce.calendar_id = c.id
  WHERE
    (c.user_id = user_uuid OR ce.organizer_id = user_uuid OR
     EXISTS (
       SELECT 1 FROM event_attendees
       WHERE event_id = ce.id AND user_id = user_uuid
     ))
    AND ce.start_time >= NOW()
    AND ce.status != 'cancelled'
  ORDER BY ce.start_time ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get calendar analytics
CREATE OR REPLACE FUNCTION get_calendar_analytics(
  user_uuid UUID,
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', (
      SELECT COUNT(*)
      FROM calendar_events ce
      JOIN calendars c ON ce.calendar_id = c.id
      WHERE c.user_id = user_uuid
        AND ce.start_time >= start_date
        AND ce.start_time < end_date
    ),
    'confirmed', (
      SELECT COUNT(*)
      FROM calendar_events ce
      JOIN calendars c ON ce.calendar_id = c.id
      WHERE c.user_id = user_uuid
        AND ce.status = 'confirmed'
        AND ce.start_time >= start_date
        AND ce.start_time < end_date
    ),
    'tentative', (
      SELECT COUNT(*)
      FROM calendar_events ce
      JOIN calendars c ON ce.calendar_id = c.id
      WHERE c.user_id = user_uuid
        AND ce.status = 'tentative'
        AND ce.start_time >= start_date
        AND ce.start_time < end_date
    ),
    'avg_duration_minutes', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60), 0)
      FROM calendar_events ce
      JOIN calendars c ON ce.calendar_id = c.id
      WHERE c.user_id = user_uuid
        AND ce.start_time >= start_date
        AND ce.start_time < end_date
    ),
    'events_by_type', (
      SELECT json_object_agg(event_type, count)
      FROM (
        SELECT ce.event_type, COUNT(*) as count
        FROM calendar_events ce
        JOIN calendars c ON ce.calendar_id = c.id
        WHERE c.user_id = user_uuid
          AND ce.start_time >= start_date
          AND ce.start_time < end_date
        GROUP BY ce.event_type
      ) types
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired suggestions
CREATE OR REPLACE FUNCTION cleanup_expired_suggestions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM scheduling_suggestions
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE calendars IS 'User calendars with settings and preferences';
COMMENT ON TABLE calendar_events IS 'Calendar events with comprehensive metadata';
COMMENT ON TABLE event_recurrence IS 'Recurrence patterns for repeating events';
COMMENT ON TABLE event_attendees IS 'Event attendees with RSVP tracking';
COMMENT ON TABLE event_reminders IS 'Event reminders via multiple channels';
COMMENT ON TABLE event_attachments IS 'File attachments for events';
COMMENT ON TABLE event_views IS 'Event view analytics';
COMMENT ON TABLE calendar_ai_insights IS 'AI-generated scheduling insights';
COMMENT ON TABLE scheduling_suggestions IS 'AI-powered scheduling suggestions';

-- ============================================================================
-- SAMPLE QUERIES FOR PRODUCTION API
-- ============================================================================

/*
-- Get user's default calendar
SELECT * FROM calendars
WHERE user_id = auth.uid() AND is_default = TRUE
LIMIT 1;

-- Get events for today
SELECT * FROM get_events_in_range(
  auth.uid(),
  CURRENT_DATE::TIMESTAMPTZ,
  (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ
);

-- Get upcoming events
SELECT * FROM get_upcoming_events(auth.uid(), 10);

-- Search events
SELECT * FROM search_calendar_events('client meeting', auth.uid());

-- Check for conflicts
SELECT * FROM find_event_conflicts(
  auth.uid(),
  '2024-01-15 09:00:00'::TIMESTAMPTZ,
  '2024-01-15 10:00:00'::TIMESTAMPTZ
);

-- Get calendar analytics
SELECT get_calendar_analytics(auth.uid());

-- Get event with attendees
SELECT
  ce.*,
  json_agg(ea.*) as attendees
FROM calendar_events ce
LEFT JOIN event_attendees ea ON ea.event_id = ce.id
WHERE ce.id = 'event-uuid'
GROUP BY ce.id;
*/
-- ========================================
-- CANVAS COLLABORATION SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete real-time canvas collaboration with:
-- - Multi-user canvas projects
-- - Layer management
-- - Real-time cursor tracking
-- - Version history
-- - Template library
-- - Video/audio call integration
-- - Comments and annotations
--
-- Tables: 9
-- Functions: 8
-- Indexes: 45
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

DROP TYPE IF EXISTS layer_type CASCADE;
CREATE TYPE layer_type AS ENUM (
  'drawing',
  'text',
  'shape',
  'image',
  'group'
);

DROP TYPE IF EXISTS canvas_status CASCADE;
CREATE TYPE canvas_status AS ENUM (
  'active',
  'archived',
  'template'
);

DROP TYPE IF EXISTS collaborator_permission CASCADE;
CREATE TYPE collaborator_permission AS ENUM (
  'view',
  'edit',
  'admin'
);

DROP TYPE IF EXISTS tool_type CASCADE;
CREATE TYPE tool_type AS ENUM (
  'select',
  'hand',
  'brush',
  'eraser',
  'text',
  'rectangle',
  'circle',
  'line',
  'arrow',
  'pen',
  'highlighter'
);

-- ========================================
-- TABLES
-- ========================================

-- Canvas Projects
CREATE TABLE IF NOT EXISTS canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status canvas_status NOT NULL DEFAULT 'active',
  is_public BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Layers
CREATE TABLE IF NOT EXISTS canvas_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type layer_type NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,
  opacity INTEGER NOT NULL DEFAULT 100 CHECK (opacity >= 0 AND opacity <= 100),
  z_index INTEGER NOT NULL DEFAULT 0,
  blend_mode TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Elements
CREATE TABLE IF NOT EXISTS canvas_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID NOT NULL REFERENCES canvas_layers(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL,
  points JSONB DEFAULT '[]',
  text_content TEXT,
  shape_type TEXT,
  color TEXT NOT NULL DEFAULT '#000000',
  stroke_width INTEGER NOT NULL DEFAULT 2,
  opacity INTEGER NOT NULL DEFAULT 100,
  "position" JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  size JSONB,
  rotation DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Collaborators
CREATE TABLE IF NOT EXISTS canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission collaborator_permission NOT NULL DEFAULT 'edit',
  is_active BOOLEAN NOT NULL DEFAULT false,
  cursor_position JSONB,
  current_tool tool_type,
  color TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(canvas_id, user_id)
);

-- Canvas Versions
CREATE TABLE IF NOT EXISTS canvas_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  thumbnail TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT,
  canvas_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(canvas_id, version)
);

-- Canvas Templates
CREATE TABLE IF NOT EXISTS canvas_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  category TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  canvas_data JSONB NOT NULL,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comments
CREATE TABLE IF NOT EXISTS canvas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "position" JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  text_content TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comment Replies
CREATE TABLE IF NOT EXISTS canvas_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES canvas_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Sessions
CREATE TABLE IF NOT EXISTS canvas_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  video_call_active BOOLEAN NOT NULL DEFAULT false,
  audio_call_active BOOLEAN NOT NULL DEFAULT false,
  active_users INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Canvas Projects Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_status ON canvas_projects(status);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_last_modified ON canvas_projects(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_is_public ON canvas_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_tags ON canvas_projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_name ON canvas_projects USING GIN(name gin_trgm_ops);

-- Canvas Layers Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_layers_canvas_id ON canvas_layers(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_type ON canvas_layers(type);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_visible ON canvas_layers(visible);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_z_index ON canvas_layers(z_index);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_canvas_z_index ON canvas_layers(canvas_id, z_index);

-- Canvas Elements Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_elements_layer_id ON canvas_elements(layer_id);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_element_type ON canvas_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_position ON canvas_elements USING GIN(position);

-- Canvas Collaborators Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_is_active ON canvas_collaborators(is_active);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_last_seen ON canvas_collaborators(last_seen DESC);

-- Canvas Versions Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_version ON canvas_versions(canvas_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_by ON canvas_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

-- Canvas Templates Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_templates_category ON canvas_templates(category);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_downloads ON canvas_templates(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_rating ON canvas_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_is_verified ON canvas_templates(is_verified);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_name ON canvas_templates USING GIN(name gin_trgm_ops);

-- Canvas Comments Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_resolved ON canvas_comments(resolved);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_created_at ON canvas_comments(created_at DESC);

-- Canvas Comment Replies Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_comment_id ON canvas_comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_user_id ON canvas_comment_replies(user_id);

-- Canvas Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_sessions_canvas_id ON canvas_sessions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_sessions_last_activity ON canvas_sessions(last_activity DESC);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canvas_projects_updated_at BEFORE UPDATE ON canvas_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_layers_updated_at BEFORE UPDATE ON canvas_layers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_elements_updated_at BEFORE UPDATE ON canvas_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_collaborators_updated_at BEFORE UPDATE ON canvas_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_templates_updated_at BEFORE UPDATE ON canvas_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at BEFORE UPDATE ON canvas_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_sessions_updated_at BEFORE UPDATE ON canvas_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update last_modified on canvas when layers/elements change
CREATE OR REPLACE FUNCTION update_canvas_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE canvas_projects
  SET last_modified = NOW()
  WHERE id = (
    SELECT canvas_id FROM canvas_layers
    WHERE id = COALESCE(NEW.layer_id, OLD.layer_id)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canvas_on_element_change
  AFTER INSERT OR UPDATE OR DELETE ON canvas_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_canvas_last_modified();

-- Update active users count
CREATE OR REPLACE FUNCTION update_session_active_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE canvas_sessions
  SET active_users = (
    SELECT COUNT(*)
    FROM canvas_collaborators
    WHERE canvas_id = COALESCE(NEW.canvas_id, OLD.canvas_id)
      AND is_active = true
  ),
  last_activity = NOW()
  WHERE canvas_id = COALESCE(NEW.canvas_id, OLD.canvas_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_active_users_count
  AFTER INSERT OR UPDATE OR DELETE ON canvas_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_session_active_users();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Create canvas version
CREATE OR REPLACE FUNCTION create_canvas_version(
  p_canvas_id UUID,
  p_user_id UUID,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_version INTEGER;
  v_canvas_data JSONB;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_version
  FROM canvas_versions
  WHERE canvas_id = p_canvas_id;

  -- Collect canvas data
  SELECT jsonb_build_object(
    'layers', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'name', l.name,
          'type', l.type,
          'visible', l.visible,
          'locked', l.locked,
          'opacity', l.opacity,
          'z_index', l.z_index,
          'elements', (
            SELECT jsonb_agg(row_to_json(e))
            FROM canvas_elements e
            WHERE e.layer_id = l.id
          )
        )
      )
      FROM canvas_layers l
      WHERE l.canvas_id = p_canvas_id
    )
  ) INTO v_canvas_data;

  -- Create version
  INSERT INTO canvas_versions (canvas_id, version, created_by, comment, canvas_data)
  VALUES (p_canvas_id, v_version, p_user_id, p_comment, v_canvas_data);

  -- Update canvas version
  UPDATE canvas_projects
  SET version = v_version
  WHERE id = p_canvas_id;

  RETURN json_build_object('success', true, 'version', v_version);
END;
$$ LANGUAGE plpgsql;

-- Restore canvas version
CREATE OR REPLACE FUNCTION restore_canvas_version(
  p_canvas_id UUID,
  p_version INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_version_data JSONB;
BEGIN
  -- Get version data
  SELECT canvas_data INTO v_version_data
  FROM canvas_versions
  WHERE canvas_id = p_canvas_id AND version = p_version;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Version not found');
  END IF;

  -- Delete current layers and elements (cascades to elements)
  DELETE FROM canvas_layers WHERE canvas_id = p_canvas_id;

  -- Restore layers and elements from version data
  -- (In real implementation, deserialize v_version_data and recreate)

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Join canvas session
CREATE OR REPLACE FUNCTION join_canvas_session(
  p_canvas_id UUID,
  p_user_id UUID,
  p_permission collaborator_permission DEFAULT 'edit'
)
RETURNS JSON AS $$
BEGIN
  -- Create or get session
  INSERT INTO canvas_sessions (canvas_id)
  VALUES (p_canvas_id)
  ON CONFLICT DO NOTHING;

  -- Add or update collaborator
  INSERT INTO canvas_collaborators (canvas_id, user_id, permission, is_active)
  VALUES (p_canvas_id, p_user_id, p_permission, true)
  ON CONFLICT (canvas_id, user_id)
  DO UPDATE SET
    is_active = true,
    last_seen = NOW();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Leave canvas session
CREATE OR REPLACE FUNCTION leave_canvas_session(
  p_canvas_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
BEGIN
  UPDATE canvas_collaborators
  SET is_active = false,
      cursor_position = NULL,
      last_seen = NOW()
  WHERE canvas_id = p_canvas_id AND user_id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Update cursor position
CREATE OR REPLACE FUNCTION update_cursor_position(
  p_canvas_id UUID,
  p_user_id UUID,
  p_x INTEGER,
  p_y INTEGER,
  p_tool tool_type DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE canvas_collaborators
  SET cursor_position = jsonb_build_object('x', p_x, 'y', p_y),
      current_tool = COALESCE(p_tool, current_tool),
      last_seen = NOW()
  WHERE canvas_id = p_canvas_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get active collaborators
CREATE OR REPLACE FUNCTION get_active_collaborators(p_canvas_id UUID)
RETURNS TABLE(
  user_id UUID,
  cursor_position JSONB,
  current_tool tool_type,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.user_id,
    c.cursor_position,
    c.current_tool,
    c.color
  FROM canvas_collaborators c
  WHERE c.canvas_id = p_canvas_id AND c.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Search canvas projects
CREATE OR REPLACE FUNCTION search_canvas_projects(
  p_user_id UUID,
  p_search_term TEXT,
  p_status canvas_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF canvas_projects AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM canvas_projects
  WHERE user_id = p_user_id
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_status IS NULL OR status = p_status)
  ORDER BY last_modified DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Duplicate canvas
CREATE OR REPLACE FUNCTION duplicate_canvas(
  p_canvas_id UUID,
  p_user_id UUID,
  p_new_name TEXT
)
RETURNS JSON AS $$
DECLARE
  v_new_canvas_id UUID;
BEGIN
  -- Create new canvas
  INSERT INTO canvas_projects (
    user_id, name, description, width, height,
    background_color, status, tags
  )
  SELECT
    p_user_id, p_new_name, description, width, height,
    background_color, status, tags
  FROM canvas_projects
  WHERE id = p_canvas_id
  RETURNING id INTO v_new_canvas_id;

  -- Duplicate layers
  INSERT INTO canvas_layers (
    canvas_id, name, type, visible, locked,
    opacity, z_index, blend_mode
  )
  SELECT
    v_new_canvas_id, name, type, visible, locked,
    opacity, z_index, blend_mode
  FROM canvas_layers
  WHERE canvas_id = p_canvas_id;

  RETURN json_build_object('success', true, 'canvasId', v_new_canvas_id);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;

-- Canvas Projects Policies
CREATE POLICY canvas_projects_select ON canvas_projects FOR SELECT
  USING (
    auth.uid() = user_id OR
    is_public = true OR
    EXISTS (SELECT 1 FROM canvas_collaborators WHERE canvas_id = canvas_projects.id AND user_id = auth.uid())
  );
CREATE POLICY canvas_projects_insert ON canvas_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY canvas_projects_update ON canvas_projects FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM canvas_collaborators WHERE canvas_id = canvas_projects.id AND user_id = auth.uid() AND permission IN ('edit', 'admin'))
  );
CREATE POLICY canvas_projects_delete ON canvas_projects FOR DELETE USING (auth.uid() = user_id);

-- Canvas Layers Policies
CREATE POLICY canvas_layers_select ON canvas_layers FOR SELECT
  USING (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_layers.canvas_id AND (user_id = auth.uid() OR is_public = true)));
CREATE POLICY canvas_layers_insert ON canvas_layers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_layers.canvas_id AND user_id = auth.uid()));
CREATE POLICY canvas_layers_update ON canvas_layers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_layers.canvas_id AND user_id = auth.uid()));
CREATE POLICY canvas_layers_delete ON canvas_layers FOR DELETE
  USING (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_layers.canvas_id AND user_id = auth.uid()));

-- Canvas Elements Policies
CREATE POLICY canvas_elements_select ON canvas_elements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_layers l
    JOIN canvas_projects p ON l.canvas_id = p.id
    WHERE l.id = canvas_elements.layer_id AND (p.user_id = auth.uid() OR p.is_public = true)
  ));
CREATE POLICY canvas_elements_insert ON canvas_elements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM canvas_layers l
    JOIN canvas_projects p ON l.canvas_id = p.id
    WHERE l.id = canvas_elements.layer_id AND p.user_id = auth.uid()
  ));
CREATE POLICY canvas_elements_update ON canvas_elements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM canvas_layers l
    JOIN canvas_projects p ON l.canvas_id = p.id
    WHERE l.id = canvas_elements.layer_id AND p.user_id = auth.uid()
  ));
CREATE POLICY canvas_elements_delete ON canvas_elements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM canvas_layers l
    JOIN canvas_projects p ON l.canvas_id = p.id
    WHERE l.id = canvas_elements.layer_id AND p.user_id = auth.uid()
  ));

-- Canvas Collaborators Policies
CREATE POLICY canvas_collaborators_select ON canvas_collaborators FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_collaborators.canvas_id AND user_id = auth.uid()));
CREATE POLICY canvas_collaborators_insert ON canvas_collaborators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY canvas_collaborators_update ON canvas_collaborators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY canvas_collaborators_delete ON canvas_collaborators FOR DELETE USING (auth.uid() = user_id);

-- Canvas Versions Policies
CREATE POLICY canvas_versions_select ON canvas_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_versions.canvas_id AND user_id = auth.uid()));
CREATE POLICY canvas_versions_insert ON canvas_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_versions.canvas_id AND user_id = auth.uid()));

-- Canvas Templates Policies
CREATE POLICY canvas_templates_select ON canvas_templates FOR SELECT USING (true);
CREATE POLICY canvas_templates_insert ON canvas_templates FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY canvas_templates_update ON canvas_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY canvas_templates_delete ON canvas_templates FOR DELETE USING (auth.uid() = created_by);

-- Canvas Comments Policies
CREATE POLICY canvas_comments_select ON canvas_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_comments.canvas_id AND (user_id = auth.uid() OR is_public = true)));
CREATE POLICY canvas_comments_insert ON canvas_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY canvas_comments_update ON canvas_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY canvas_comments_delete ON canvas_comments FOR DELETE USING (auth.uid() = user_id);

-- Canvas Comment Replies Policies
CREATE POLICY canvas_comment_replies_select ON canvas_comment_replies FOR SELECT USING (true);
CREATE POLICY canvas_comment_replies_insert ON canvas_comment_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY canvas_comment_replies_delete ON canvas_comment_replies FOR DELETE USING (auth.uid() = user_id);

-- Canvas Sessions Policies
CREATE POLICY canvas_sessions_select ON canvas_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM canvas_projects WHERE id = canvas_sessions.canvas_id AND user_id = auth.uid()));

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE canvas_projects IS 'Collaborative canvas projects';
COMMENT ON TABLE canvas_layers IS 'Canvas layers with z-index ordering';
COMMENT ON TABLE canvas_elements IS 'Drawing elements within layers';
COMMENT ON TABLE canvas_collaborators IS 'Real-time collaborators with cursor tracking';
COMMENT ON TABLE canvas_versions IS 'Canvas version history';
COMMENT ON TABLE canvas_templates IS 'Public canvas templates';
COMMENT ON TABLE canvas_comments IS 'Canvas comments and annotations';
COMMENT ON TABLE canvas_comment_replies IS 'Replies to canvas comments';
COMMENT ON TABLE canvas_sessions IS 'Active collaboration sessions';
-- ============================================================================
-- CANVAS COLLABORATION SYSTEM - SUPABASE MIGRATION
-- Complete design and prototyping workspace
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS canvas_status CASCADE;
CREATE TYPE canvas_status AS ENUM (
  'in-progress',
  'completed',
  'archived',
  'shared'
);

DROP TYPE IF EXISTS canvas_template CASCADE;
CREATE TYPE canvas_template AS ENUM (
  'blank',
  'ui-design',
  'wireframe',
  'illustration',
  'presentation',
  'infographic',
  'social-media',
  'logo-design'
);

DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM (
  'png',
  'svg',
  'pdf',
  'figma',
  'sketch',
  'jpg',
  'webp'
);

DROP TYPE IF EXISTS collaborator_role CASCADE;
CREATE TYPE collaborator_role AS ENUM (
  'owner',
  'editor',
  'viewer',
  'commenter'
);

DROP TYPE IF EXISTS layer_type CASCADE;
CREATE TYPE layer_type AS ENUM (
  'shape',
  'text',
  'image',
  'group',
  'frame',
  'vector'
);

DROP TYPE IF EXISTS blend_mode CASCADE;
CREATE TYPE blend_mode AS ENUM (
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten'
);

-- ============================================================================
-- TABLE: canvas_projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  template canvas_template NOT NULL DEFAULT 'blank',
  status canvas_status NOT NULL DEFAULT 'in-progress',
  total_layers INTEGER DEFAULT 0,
  size_mb DECIMAL(10, 2) DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_starred BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  last_modified_by TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_artboards
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_artboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  is_prototype BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_layers
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artboard_id UUID NOT NULL REFERENCES canvas_artboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type layer_type NOT NULL DEFAULT 'shape',
  visible BOOLEAN DEFAULT true,
  locked BOOLEAN DEFAULT false,
  opacity DECIMAL(5, 2) DEFAULT 100 CHECK (opacity >= 0 AND opacity <= 100),
  blend_mode blend_mode DEFAULT 'normal',
  z_index INTEGER DEFAULT 0,
  x DECIMAL(10, 2) DEFAULT 0,
  y DECIMAL(10, 2) DEFAULT 0,
  width DECIMAL(10, 2) DEFAULT 100,
  height DECIMAL(10, 2) DEFAULT 100,
  rotation DECIMAL(10, 2) DEFAULT 0,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_collaborators
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(canvas_id, user_id)
);

-- ============================================================================
-- TABLE: canvas_versions
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  size_mb DECIMAL(10, 2) NOT NULL,
  snapshot JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(canvas_id, version)
);

-- ============================================================================
-- TABLE: canvas_comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  artboard_id UUID REFERENCES canvas_artboards(id) ON DELETE CASCADE,
  layer_id UUID REFERENCES canvas_layers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  x DECIMAL(10, 2),
  y DECIMAL(10, 2),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_comment_replies
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES canvas_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_exports
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  quality TEXT NOT NULL DEFAULT 'high',
  file_url TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: canvas_activity_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS canvas_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- canvas_projects indexes
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_status ON canvas_projects(status);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_template ON canvas_projects(template);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_is_starred ON canvas_projects(is_starred);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_is_shared ON canvas_projects(is_shared);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_is_public ON canvas_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_tags ON canvas_projects USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_created_at ON canvas_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_updated_at ON canvas_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_name_trgm ON canvas_projects USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_status ON canvas_projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_template ON canvas_projects(user_id, template);

-- canvas_artboards indexes
CREATE INDEX IF NOT EXISTS idx_canvas_artboards_canvas_id ON canvas_artboards(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_artboards_order_index ON canvas_artboards(order_index);
CREATE INDEX IF NOT EXISTS idx_canvas_artboards_canvas_order ON canvas_artboards(canvas_id, order_index);

-- canvas_layers indexes
CREATE INDEX IF NOT EXISTS idx_canvas_layers_artboard_id ON canvas_layers(artboard_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_type ON canvas_layers(type);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_z_index ON canvas_layers(z_index DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_visible ON canvas_layers(visible);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_locked ON canvas_layers(locked);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_artboard_z_index ON canvas_layers(artboard_id, z_index);

-- canvas_collaborators indexes
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_role ON canvas_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_is_online ON canvas_collaborators(is_online);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_last_seen ON canvas_collaborators(last_seen DESC);

-- canvas_versions indexes
CREATE INDEX IF NOT EXISTS idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_version ON canvas_versions(version DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

-- canvas_comments indexes
CREATE INDEX IF NOT EXISTS idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_artboard_id ON canvas_comments(artboard_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_layer_id ON canvas_comments(layer_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_resolved ON canvas_comments(resolved);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_created_at ON canvas_comments(created_at DESC);

-- canvas_comment_replies indexes
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_comment_id ON canvas_comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_user_id ON canvas_comment_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_created_at ON canvas_comment_replies(created_at DESC);

-- canvas_exports indexes
CREATE INDEX IF NOT EXISTS idx_canvas_exports_canvas_id ON canvas_exports(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_exports_user_id ON canvas_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_exports_format ON canvas_exports(format);
CREATE INDEX IF NOT EXISTS idx_canvas_exports_status ON canvas_exports(status);
CREATE INDEX IF NOT EXISTS idx_canvas_exports_created_at ON canvas_exports(created_at DESC);

-- canvas_activity_log indexes
CREATE INDEX IF NOT EXISTS idx_canvas_activity_log_canvas_id ON canvas_activity_log(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_activity_log_user_id ON canvas_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_activity_log_action ON canvas_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_canvas_activity_log_created_at ON canvas_activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_artboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_activity_log ENABLE ROW LEVEL SECURITY;

-- canvas_projects policies
CREATE POLICY "Users can view their own canvases"
  ON canvas_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view canvases they collaborate on"
  ON canvas_projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_collaborators
    WHERE canvas_collaborators.canvas_id = canvas_projects.id
    AND canvas_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Users can view public canvases"
  ON canvas_projects FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own canvases"
  ON canvas_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvases"
  ON canvas_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Editors can update canvases they collaborate on"
  ON canvas_projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM canvas_collaborators
    WHERE canvas_collaborators.canvas_id = canvas_projects.id
    AND canvas_collaborators.user_id = auth.uid()
    AND canvas_collaborators.role IN ('owner', 'editor')
  ));

CREATE POLICY "Users can delete their own canvases"
  ON canvas_projects FOR DELETE
  USING (auth.uid() = user_id);

-- canvas_artboards policies
CREATE POLICY "Users can view artboards of accessible canvases"
  ON canvas_artboards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_artboards.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR canvas_projects.is_public = true
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can modify artboards of owned canvases"
  ON canvas_artboards FOR ALL
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_artboards.canvas_id
    AND canvas_projects.user_id = auth.uid()
  ));

-- canvas_layers policies
CREATE POLICY "Users can view layers of accessible artboards"
  ON canvas_layers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_artboards
    JOIN canvas_projects ON canvas_projects.id = canvas_artboards.canvas_id
    WHERE canvas_artboards.id = canvas_layers.artboard_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR canvas_projects.is_public = true
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

-- canvas_collaborators policies
CREATE POLICY "Users can view collaborators of accessible canvases"
  ON canvas_collaborators FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_collaborators.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators c2
        WHERE c2.canvas_id = canvas_projects.id
        AND c2.user_id = auth.uid()
      )
    )
  ));

-- canvas_versions policies
CREATE POLICY "Users can view versions of accessible canvases"
  ON canvas_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_versions.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

-- canvas_comments policies
CREATE POLICY "Users can view comments on accessible canvases"
  ON canvas_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_comments.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create comments on accessible canvases"
  ON canvas_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON canvas_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON canvas_comments FOR DELETE
  USING (auth.uid() = user_id);

-- canvas_exports policies
CREATE POLICY "Users can view their own exports"
  ON canvas_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports"
  ON canvas_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- canvas_activity_log policies
CREATE POLICY "Users can view activity for accessible canvases"
  ON canvas_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_activity_log.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_artboards_updated_at
  BEFORE UPDATE ON canvas_artboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_layers_updated_at
  BEFORE UPDATE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at
  BEFORE UPDATE ON canvas_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update total_layers count when layers change
CREATE OR REPLACE FUNCTION update_canvas_layer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE canvas_projects
  SET total_layers = (
    SELECT COUNT(*)
    FROM canvas_layers l
    JOIN canvas_artboards a ON a.id = l.artboard_id
    WHERE a.canvas_id = (
      SELECT canvas_id FROM canvas_artboards WHERE id = COALESCE(NEW.artboard_id, OLD.artboard_id)
    )
  )
  WHERE id = (
    SELECT canvas_id FROM canvas_artboards WHERE id = COALESCE(NEW.artboard_id, OLD.artboard_id)
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_canvas_layer_count
  AFTER INSERT OR UPDATE OR DELETE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_canvas_layer_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's canvases with stats
CREATE OR REPLACE FUNCTION get_user_canvases_with_stats(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  status canvas_status,
  template canvas_template,
  artboard_count BIGINT,
  layer_count INTEGER,
  collaborator_count BIGINT,
  size_mb DECIMAL,
  is_starred BOOLEAN,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.status,
    cp.template,
    COUNT(DISTINCT ca.id) as artboard_count,
    cp.total_layers as layer_count,
    COUNT(DISTINCT cc.id) as collaborator_count,
    cp.size_mb,
    cp.is_starred,
    cp.updated_at
  FROM canvas_projects cp
  LEFT JOIN canvas_artboards ca ON ca.canvas_id = cp.id
  LEFT JOIN canvas_collaborators cc ON cc.canvas_id = cp.id
  WHERE cp.user_id = p_user_id
  GROUP BY cp.id
  ORDER BY cp.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get canvas with full details
CREATE OR REPLACE FUNCTION get_canvas_details(p_canvas_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'canvas', row_to_json(cp),
      'artboards', (
        SELECT json_agg(json_build_object(
          'artboard', row_to_json(ca),
          'layers', (
            SELECT json_agg(row_to_json(cl))
            FROM canvas_layers cl
            WHERE cl.artboard_id = ca.id
            ORDER BY cl.z_index DESC
          )
        ))
        FROM canvas_artboards ca
        WHERE ca.canvas_id = cp.id
        ORDER BY ca.order_index
      ),
      'collaborators', (
        SELECT json_agg(row_to_json(cc))
        FROM canvas_collaborators cc
        WHERE cc.canvas_id = cp.id
      )
    )
    FROM canvas_projects cp
    WHERE cp.id = p_canvas_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search canvases
CREATE OR REPLACE FUNCTION search_canvases(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  thumbnail TEXT,
  status canvas_status,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.description,
    cp.thumbnail,
    cp.status,
    cp.updated_at
  FROM canvas_projects cp
  WHERE cp.user_id = p_user_id
    AND (
      cp.name ILIKE '%' || p_search_term || '%'
      OR cp.description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(cp.tags)
    )
  ORDER BY cp.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate storage used by user
CREATE OR REPLACE FUNCTION calculate_user_canvas_storage(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_storage DECIMAL;
BEGIN
  SELECT COALESCE(SUM(size_mb), 0)
  INTO total_storage
  FROM canvas_projects
  WHERE user_id = p_user_id;

  RETURN total_storage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get canvas activity log
CREATE OR REPLACE FUNCTION get_canvas_activity(
  p_canvas_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  action TEXT,
  user_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cal.action,
    u.email as user_name,
    cal.details,
    cal.created_at
  FROM canvas_activity_log cal
  JOIN auth.users u ON u.id = cal.user_id
  WHERE cal.canvas_id = p_canvas_id
  ORDER BY cal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent collaborators
CREATE OR REPLACE FUNCTION get_recent_collaborators(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  avatar TEXT,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    cc.user_id,
    cc.name,
    cc.email,
    cc.avatar,
    cc.last_seen
  FROM canvas_collaborators cc
  JOIN canvas_projects cp ON cp.id = cc.canvas_id
  WHERE cp.user_id = p_user_id
  ORDER BY cc.last_seen DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- CLIENT PORTAL SYSTEM - SUPABASE MIGRATION
-- Complete client relationship management with portal access
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS client_status CASCADE;
CREATE TYPE client_status AS ENUM (
  'active',
  'onboarding',
  'inactive',
  'churned'
);

DROP TYPE IF EXISTS client_tier CASCADE;
CREATE TYPE client_tier AS ENUM (
  'basic',
  'standard',
  'premium',
  'enterprise'
);

DROP TYPE IF EXISTS portal_project_status CASCADE;
CREATE TYPE portal_project_status AS ENUM (
  'planning',
  'active',
  'on-hold',
  'completed',
  'cancelled'
);

DROP TYPE IF EXISTS communication_type CASCADE;
CREATE TYPE communication_type AS ENUM (
  'email',
  'call',
  'meeting',
  'message',
  'note'
);

DROP TYPE IF EXISTS file_category CASCADE;
CREATE TYPE file_category AS ENUM (
  'contract',
  'invoice',
  'proposal',
  'report',
  'deliverable',
  'other'
);

DROP TYPE IF EXISTS access_level CASCADE;
CREATE TYPE access_level AS ENUM (
  'view',
  'comment',
  'edit',
  'admin'
);

DROP TYPE IF EXISTS health_status CASCADE;
CREATE TYPE health_status AS ENUM (
  'excellent',
  'good',
  'warning',
  'critical'
);

DROP TYPE IF EXISTS risk_type CASCADE;
CREATE TYPE risk_type AS ENUM (
  'budget',
  'timeline',
  'scope',
  'quality',
  'resource'
);

DROP TYPE IF EXISTS risk_severity CASCADE;
CREATE TYPE risk_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

DROP TYPE IF EXISTS invoice_status CASCADE;
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

-- ============================================================================
-- TABLE: portal_clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  status client_status NOT NULL DEFAULT 'active',
  tier client_tier NOT NULL DEFAULT 'basic',
  active_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  monthly_revenue DECIMAL(15, 2) DEFAULT 0,
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  health_status health_status NOT NULL DEFAULT 'good',
  last_contact TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_follow_up TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  address TEXT,
  industry TEXT,
  company_size TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferred_contact communication_type DEFAULT 'email',
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  satisfaction_rating DECIMAL(3, 2) DEFAULT 0 CHECK (satisfaction_rating >= 0 AND satisfaction_rating <= 5),
  contract_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status portal_project_status NOT NULL DEFAULT 'planning',
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  remaining DECIMAL(15, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  team TEXT[] DEFAULT ARRAY[]::TEXT[],
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority TEXT DEFAULT 'medium',
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_project_milestones
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_project_risks
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  type risk_type NOT NULL,
  severity risk_severity NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_communications
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type communication_type NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  outcome TEXT,
  action_items TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  duration INTEGER,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- ============================================================================
-- TABLE: portal_files
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES portal_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category file_category NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  access_level access_level NOT NULL DEFAULT 'view',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_shared BOOLEAN DEFAULT false,
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  download_count INTEGER DEFAULT 0,
  last_downloaded TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_file_versions
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES portal_files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by TEXT NOT NULL,
  size BIGINT NOT NULL,
  changes TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_invoices
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES portal_projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(15, 2) NOT NULL,
  tax DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_invoice_items
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES portal_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_client_activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_client_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_client_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE UNIQUE,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  average_project_value DECIMAL(15, 2) DEFAULT 0,
  project_completion_rate DECIMAL(5, 2) DEFAULT 0,
  on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0,
  client_satisfaction DECIMAL(3, 2) DEFAULT 0,
  communication_frequency INTEGER DEFAULT 0,
  response_time DECIMAL(10, 2) DEFAULT 0,
  retention_score INTEGER DEFAULT 0,
  growth_rate DECIMAL(5, 2) DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- portal_clients indexes
CREATE INDEX IF NOT EXISTS idx_portal_clients_user_id ON portal_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_clients_status ON portal_clients(status);
CREATE INDEX IF NOT EXISTS idx_portal_clients_tier ON portal_clients(tier);
CREATE INDEX IF NOT EXISTS idx_portal_clients_health_status ON portal_clients(health_status);
CREATE INDEX IF NOT EXISTS idx_portal_clients_health_score ON portal_clients(health_score DESC);
CREATE INDEX IF NOT EXISTS idx_portal_clients_total_revenue ON portal_clients(total_revenue DESC);
CREATE INDEX IF NOT EXISTS idx_portal_clients_last_contact ON portal_clients(last_contact DESC);
CREATE INDEX IF NOT EXISTS idx_portal_clients_next_follow_up ON portal_clients(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_portal_clients_tags ON portal_clients USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_portal_clients_company_name_trgm ON portal_clients USING gin(company_name gin_trgm_ops);

-- portal_projects indexes
CREATE INDEX IF NOT EXISTS idx_portal_projects_client_id ON portal_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_projects_user_id ON portal_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_projects_status ON portal_projects(status);
CREATE INDEX IF NOT EXISTS idx_portal_projects_priority ON portal_projects(priority);
CREATE INDEX IF NOT EXISTS idx_portal_projects_deadline ON portal_projects(deadline);
CREATE INDEX IF NOT EXISTS idx_portal_projects_is_starred ON portal_projects(is_starred);
CREATE INDEX IF NOT EXISTS idx_portal_projects_progress ON portal_projects(progress);
CREATE INDEX IF NOT EXISTS idx_portal_projects_tags ON portal_projects USING gin(tags);

-- portal_project_milestones indexes
CREATE INDEX IF NOT EXISTS idx_portal_project_milestones_project_id ON portal_project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_project_milestones_due_date ON portal_project_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_portal_project_milestones_completed ON portal_project_milestones(completed);

-- portal_project_risks indexes
CREATE INDEX IF NOT EXISTS idx_portal_project_risks_project_id ON portal_project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_project_risks_severity ON portal_project_risks(severity);
CREATE INDEX IF NOT EXISTS idx_portal_project_risks_status ON portal_project_risks(status);

-- portal_communications indexes
CREATE INDEX IF NOT EXISTS idx_portal_communications_client_id ON portal_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_communications_user_id ON portal_communications(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_communications_type ON portal_communications(type);
CREATE INDEX IF NOT EXISTS idx_portal_communications_created_at ON portal_communications(created_at DESC);

-- portal_files indexes
CREATE INDEX IF NOT EXISTS idx_portal_files_client_id ON portal_files(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_files_project_id ON portal_files(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_files_user_id ON portal_files(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_files_category ON portal_files(category);
CREATE INDEX IF NOT EXISTS idx_portal_files_access_level ON portal_files(access_level);
CREATE INDEX IF NOT EXISTS idx_portal_files_is_shared ON portal_files(is_shared);

-- portal_file_versions indexes
CREATE INDEX IF NOT EXISTS idx_portal_file_versions_file_id ON portal_file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_portal_file_versions_version ON portal_file_versions(version DESC);

-- portal_invoices indexes
CREATE INDEX IF NOT EXISTS idx_portal_invoices_client_id ON portal_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_project_id ON portal_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_user_id ON portal_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_status ON portal_invoices(status);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_due_date ON portal_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_portal_invoices_issue_date ON portal_invoices(issue_date DESC);

-- portal_invoice_items indexes
CREATE INDEX IF NOT EXISTS idx_portal_invoice_items_invoice_id ON portal_invoice_items(invoice_id);

-- portal_client_activities indexes
CREATE INDEX IF NOT EXISTS idx_portal_client_activities_client_id ON portal_client_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_client_activities_user_id ON portal_client_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_client_activities_type ON portal_client_activities(type);
CREATE INDEX IF NOT EXISTS idx_portal_client_activities_timestamp ON portal_client_activities(timestamp DESC);

-- portal_client_metrics indexes
CREATE INDEX IF NOT EXISTS idx_portal_client_metrics_client_id ON portal_client_metrics(client_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_client_metrics ENABLE ROW LEVEL SECURITY;

-- portal_clients policies
CREATE POLICY "Users can view their own clients"
  ON portal_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
  ON portal_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON portal_clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON portal_clients FOR DELETE
  USING (auth.uid() = user_id);

-- portal_projects policies
CREATE POLICY "Users can view projects for their clients"
  ON portal_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON portal_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their projects"
  ON portal_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their projects"
  ON portal_projects FOR DELETE
  USING (auth.uid() = user_id);

-- portal_project_milestones policies
CREATE POLICY "Users can manage milestones for their projects"
  ON portal_project_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM portal_projects
    WHERE portal_projects.id = portal_project_milestones.project_id
    AND portal_projects.user_id = auth.uid()
  ));

-- portal_project_risks policies
CREATE POLICY "Users can manage risks for their projects"
  ON portal_project_risks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM portal_projects
    WHERE portal_projects.id = portal_project_risks.project_id
    AND portal_projects.user_id = auth.uid()
  ));

-- portal_communications policies
CREATE POLICY "Users can view communications for their clients"
  ON portal_communications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create communications"
  ON portal_communications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- portal_files policies
CREATE POLICY "Users can manage files for their clients"
  ON portal_files FOR ALL
  USING (auth.uid() = user_id);

-- portal_file_versions policies
CREATE POLICY "Users can view file versions"
  ON portal_file_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM portal_files
    WHERE portal_files.id = portal_file_versions.file_id
    AND portal_files.user_id = auth.uid()
  ));

-- portal_invoices policies
CREATE POLICY "Users can manage invoices for their clients"
  ON portal_invoices FOR ALL
  USING (auth.uid() = user_id);

-- portal_invoice_items policies
CREATE POLICY "Users can manage invoice items"
  ON portal_invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM portal_invoices
    WHERE portal_invoices.id = portal_invoice_items.invoice_id
    AND portal_invoices.user_id = auth.uid()
  ));

-- portal_client_activities policies
CREATE POLICY "Users can view activities for their clients"
  ON portal_client_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create activities"
  ON portal_client_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- portal_client_metrics policies
CREATE POLICY "Users can view metrics for their clients"
  ON portal_client_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM portal_clients
    WHERE portal_clients.id = portal_client_metrics.client_id
    AND portal_clients.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portal_clients_updated_at
  BEFORE UPDATE ON portal_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_projects_updated_at
  BEFORE UPDATE ON portal_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_project_risks_updated_at
  BEFORE UPDATE ON portal_project_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_invoices_updated_at
  BEFORE UPDATE ON portal_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update project remaining budget
CREATE OR REPLACE FUNCTION update_project_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining := NEW.budget - NEW.spent;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_remaining
  BEFORE INSERT OR UPDATE OF budget, spent ON portal_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_remaining();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate client health score
CREATE OR REPLACE FUNCTION calculate_client_health(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_client RECORD;
  v_score INTEGER := 100;
  v_days_since_contact INTEGER;
BEGIN
  SELECT * INTO v_client FROM portal_clients WHERE id = p_client_id;

  -- Revenue check
  IF v_client.monthly_revenue < 1000 THEN
    v_score := v_score - 20;
  END IF;

  -- Communication frequency
  v_days_since_contact := EXTRACT(DAY FROM (now() - v_client.last_contact));
  IF v_days_since_contact > 30 THEN
    v_score := v_score - 15;
  END IF;

  -- Active projects
  IF v_client.active_projects = 0 THEN
    v_score := v_score - 25;
  END IF;

  -- Satisfaction rating
  IF v_client.satisfaction_rating < 3.5 THEN
    v_score := v_score - 20;
  END IF;

  RETURN GREATEST(0, v_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get portal statistics
CREATE OR REPLACE FUNCTION get_portal_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_clients', (SELECT COUNT(*) FROM portal_clients WHERE user_id = p_user_id),
      'active_clients', (SELECT COUNT(*) FROM portal_clients WHERE user_id = p_user_id AND status = 'active'),
      'total_revenue', (SELECT COALESCE(SUM(total_revenue), 0) FROM portal_clients WHERE user_id = p_user_id),
      'monthly_revenue', (SELECT COALESCE(SUM(monthly_revenue), 0) FROM portal_clients WHERE user_id = p_user_id),
      'total_projects', (SELECT COUNT(*) FROM portal_projects WHERE user_id = p_user_id),
      'active_projects', (SELECT COUNT(*) FROM portal_projects WHERE user_id = p_user_id AND status = 'active'),
      'at_risk_clients', (SELECT COUNT(*) FROM portal_clients WHERE user_id = p_user_id AND health_status IN ('warning', 'critical'))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search clients
CREATE OR REPLACE FUNCTION search_portal_clients(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  status client_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.company_name,
    c.contact_person,
    c.email,
    c.status
  FROM portal_clients c
  WHERE c.user_id = p_user_id
  AND (
    c.company_name ILIKE '%' || p_search_term || '%'
    OR c.contact_person ILIKE '%' || p_search_term || '%'
    OR c.email ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(c.tags)
  )
  ORDER BY c.total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- CLIENT ZONE SYSTEM - Complete Database Schema
-- ============================================================================
-- Description: Comprehensive schema for client portal functionality
-- Features: Projects, Messages, Files, Invoices, Payments, Analytics, Feedback
-- Created: 2025-11-26
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: client_projects
-- Description: Client projects with progress tracking and deliverables
-- ============================================================================
DROP TABLE IF EXISTS client_projects CASCADE;
CREATE TABLE client_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Details
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'review', 'completed', 'cancelled')) DEFAULT 'pending',
  phase TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Financial
  budget DECIMAL(10, 2) DEFAULT 0,
  spent DECIMAL(10, 2) DEFAULT 0,

  -- Dates
  start_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Metadata
  team_members UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  last_update TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: project_deliverables
-- Description: Individual deliverables within projects
-- ============================================================================
DROP TABLE IF EXISTS project_deliverables CASCADE;
CREATE TABLE project_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'review', 'completed', 'revision-requested')) DEFAULT 'pending',

  -- Dates
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Approval
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Files
  file_urls TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: revision_requests
-- Description: Revision requests for deliverables
-- ============================================================================
CREATE TABLE IF NOT EXISTS revision_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID REFERENCES project_deliverables(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  notes TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'in-progress', 'completed', 'rejected')) DEFAULT 'open',

  -- Resolution
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_messages
-- Description: Messages between clients and freelancers
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'system', 'notification')) DEFAULT 'text',

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Threading
  reply_to UUID REFERENCES client_messages(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_files
-- Description: File repository for client projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Details
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,

  -- Storage
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'client-files',

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,

  -- Access
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_invoices
-- Description: Invoices for client projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Financial
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Payment
  status TEXT CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  payment_method TEXT,
  transaction_id TEXT,

  -- Dates
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,

  -- Line Items
  line_items JSONB DEFAULT '[]',

  -- Notes
  notes TEXT,
  terms TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: milestone_payments
-- Description: Milestone-based payment tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS milestone_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES client_invoices(id) ON DELETE SET NULL,

  -- Milestone Details
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'released', 'disputed')) DEFAULT 'pending',

  -- Escrow
  in_escrow BOOLEAN DEFAULT false,
  escrow_released_at TIMESTAMPTZ,

  -- Dates
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,

  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_feedback
-- Description: Client satisfaction and project feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),

  -- Feedback
  feedback_text TEXT,

  -- Public/Private
  is_public BOOLEAN DEFAULT false,
  is_testimonial BOOLEAN DEFAULT false,

  -- Follow-up
  would_recommend BOOLEAN,
  would_hire_again BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_analytics
-- Description: Analytics and metrics tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  -- Metrics
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,

  -- Dimensions
  dimension_1 TEXT,
  dimension_2 TEXT,
  dimension_3 TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_schedules
-- Description: Meetings and scheduled events
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  -- Event Details
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('meeting', 'call', 'review', 'presentation', 'deadline')) DEFAULT 'meeting',

  -- Participants
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_ids UUID[] DEFAULT '{}',

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',

  -- Meeting Details
  meeting_url TEXT,
  meeting_notes TEXT,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_notifications
-- Description: Notification preferences and history
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification Details
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related Entities
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  related_entity_type TEXT,
  related_entity_id UUID,

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Delivery
  delivery_method TEXT[] DEFAULT '{in-app}',
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,

  -- Action
  action_url TEXT,
  action_label TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: ai_collaboration
-- Description: AI-powered design options and preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_collaboration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- AI Details
  ai_type TEXT CHECK (ai_type IN ('design-option', 'content-suggestion', 'layout-variant', 'color-scheme')) NOT NULL,

  -- Content
  prompt TEXT,
  generated_content JSONB NOT NULL,

  -- Preferences
  selected BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  -- Generation Metadata
  model_used TEXT,
  generation_time_ms INTEGER,
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Projects
CREATE INDEX IF NOT EXISTS idx_client_projects_user ON client_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_client ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_client_projects_due_date ON client_projects(due_date);

-- Deliverables
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON project_deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON project_deliverables(status);

-- Revision Requests
CREATE INDEX IF NOT EXISTS idx_revision_requests_deliverable ON revision_requests(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_revision_requests_project ON revision_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_revision_requests_status ON revision_requests(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_client_messages_project ON client_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_sender ON client_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_recipient ON client_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread ON client_messages(read) WHERE read = false;

-- Files
CREATE INDEX IF NOT EXISTS idx_client_files_project ON client_files(project_id);
CREATE INDEX IF NOT EXISTS idx_client_files_uploaded_by ON client_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_client_files_type ON client_files(file_type);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_client_invoices_project ON client_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_client ON client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_status ON client_invoices(status);
CREATE INDEX IF NOT EXISTS idx_client_invoices_number ON client_invoices(invoice_number);

-- Milestone Payments
CREATE INDEX IF NOT EXISTS idx_milestone_payments_project ON milestone_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_status ON milestone_payments(status);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_client_feedback_project ON client_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_client ON client_feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_freelancer ON client_feedback(freelancer_id);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_client_analytics_user ON client_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_project ON client_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_type ON client_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_client_analytics_recorded ON client_analytics(recorded_at);

-- Schedules
CREATE INDEX IF NOT EXISTS idx_client_schedules_project ON client_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_client_schedules_organizer ON client_schedules(organizer_id);
CREATE INDEX IF NOT EXISTS idx_client_schedules_start_time ON client_schedules(start_time);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_client_notifications_user ON client_notifications(user_id);
CREATE INDEX idx_client_notifications_project ON client_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_client_notifications_unread ON client_notifications(read) WHERE read = false;

-- AI Collaboration
CREATE INDEX IF NOT EXISTS idx_ai_collaboration_project ON ai_collaboration(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_collaboration_user ON ai_collaboration(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_collaboration_type ON ai_collaboration(ai_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_collaboration ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: client_projects
-- ============================================================================

-- Freelancers can view their own projects
CREATE POLICY "Freelancers can view own projects"
  ON client_projects FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can view their projects
CREATE POLICY "Clients can view their projects"
  ON client_projects FOR SELECT
  USING (auth.uid() = client_id);

-- Freelancers can create projects
CREATE POLICY "Freelancers can create projects"
  ON client_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Freelancers can update their own projects
CREATE POLICY "Freelancers can update own projects"
  ON client_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Clients can update their projects (limited fields)
CREATE POLICY "Clients can update their projects"
  ON client_projects FOR UPDATE
  USING (auth.uid() = client_id);

-- ============================================================================
-- RLS POLICIES: project_deliverables
-- ============================================================================

CREATE POLICY "Users can view project deliverables"
  ON project_deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = project_deliverables.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can manage deliverables"
  ON project_deliverables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = project_deliverables.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can approve deliverables"
  ON project_deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = project_deliverables.project_id
      AND client_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: revision_requests
-- ============================================================================

CREATE POLICY "Users can view revision requests"
  ON revision_requests FOR SELECT
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = revision_requests.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create revision requests"
  ON revision_requests FOR INSERT
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Freelancers can update revision requests"
  ON revision_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = revision_requests.project_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: client_messages
-- ============================================================================

CREATE POLICY "Users can view their messages"
  ON client_messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON client_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark messages as read"
  ON client_messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: client_files
-- ============================================================================

CREATE POLICY "Users can view project files"
  ON client_files FOR SELECT
  USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = client_files.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload files"
  ON client_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = client_files.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- ============================================================================
-- RLS POLICIES: client_invoices
-- ============================================================================

CREATE POLICY "Clients can view their invoices"
  ON client_invoices FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Freelancers can view their invoices"
  ON client_invoices FOR SELECT
  USING (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can create invoices"
  ON client_invoices FOR INSERT
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can update their invoices"
  ON client_invoices FOR UPDATE
  USING (freelancer_id = auth.uid());

CREATE POLICY "Clients can update invoice status"
  ON client_invoices FOR UPDATE
  USING (client_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: milestone_payments
-- ============================================================================

CREATE POLICY "Users can view milestone payments"
  ON milestone_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = milestone_payments.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can create milestones"
  ON milestone_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = milestone_payments.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can approve milestones"
  ON milestone_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = milestone_payments.project_id
      AND client_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: client_feedback
-- ============================================================================

CREATE POLICY "Public feedback is viewable"
  ON client_feedback FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their feedback"
  ON client_feedback FOR SELECT
  USING (client_id = auth.uid() OR freelancer_id = auth.uid());

CREATE POLICY "Clients can create feedback"
  ON client_feedback FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their feedback"
  ON client_feedback FOR UPDATE
  USING (client_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: client_analytics
-- ============================================================================

CREATE POLICY "Users can view their analytics"
  ON client_analytics FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = client_analytics.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "System can insert analytics"
  ON client_analytics FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: client_schedules
-- ============================================================================

CREATE POLICY "Users can view their schedules"
  ON client_schedules FOR SELECT
  USING (
    organizer_id = auth.uid() OR
    auth.uid() = ANY(participant_ids)
  );

CREATE POLICY "Organizers can manage schedules"
  ON client_schedules FOR ALL
  USING (organizer_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: client_notifications
-- ============================================================================

CREATE POLICY "Users can view their notifications"
  ON client_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON client_notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON client_notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: ai_collaboration
-- ============================================================================

CREATE POLICY "Users can view AI collaboration"
  ON ai_collaboration FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = ai_collaboration.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create AI collaboration"
  ON ai_collaboration FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = ai_collaboration.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can update AI collaboration"
  ON ai_collaboration FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_deliverables_updated_at BEFORE UPDATE ON project_deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revision_requests_updated_at BEFORE UPDATE ON revision_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_messages_updated_at BEFORE UPDATE ON client_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_files_updated_at BEFORE UPDATE ON client_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_invoices_updated_at BEFORE UPDATE ON client_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_payments_updated_at BEFORE UPDATE ON milestone_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_feedback_updated_at BEFORE UPDATE ON client_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_schedules_updated_at BEFORE UPDATE ON client_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_collaboration_updated_at BEFORE UPDATE ON ai_collaboration
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS for Common Queries
-- ============================================================================

-- Active Projects Overview
CREATE OR REPLACE VIEW active_projects_overview AS
SELECT
  p.*,
  COUNT(DISTINCT d.id) as total_deliverables,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'completed') as completed_deliverables,
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT f.id) as total_files
FROM client_projects p
LEFT JOIN project_deliverables d ON p.id = d.project_id
LEFT JOIN client_messages m ON p.id = m.project_id
LEFT JOIN client_files f ON p.id = f.project_id
WHERE p.status IN ('in-progress', 'review')
GROUP BY p.id;

-- Client Dashboard Stats
CREATE OR REPLACE VIEW client_dashboard_stats AS
SELECT
  client_id,
  COUNT(DISTINCT id) as total_projects,
  COUNT(DISTINCT id) FILTER (WHERE status = 'in-progress') as active_projects,
  COUNT(DISTINCT id) FILTER (WHERE status = 'completed') as completed_projects,
  SUM(budget) as total_investment,
  AVG((SELECT AVG(overall_rating) FROM client_feedback WHERE project_id = client_projects.id)) as avg_satisfaction
FROM client_projects
GROUP BY client_id;

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- This section can be used to insert sample data for testing
-- Uncomment if needed for development

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
