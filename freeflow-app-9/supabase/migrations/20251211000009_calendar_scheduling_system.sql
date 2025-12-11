-- =====================================================
-- KAZI Calendar & Scheduling System - Complete Migration
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (clean slate)
-- =====================================================
DROP TABLE IF EXISTS calendar_syncs CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS booking_types CASCADE;
DROP TABLE IF EXISTS availability_schedules CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;

-- =====================================================
-- CALENDAR EVENTS TABLE
-- =====================================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    location TEXT,
    location_type VARCHAR(20) DEFAULT 'other',
    video_url TEXT,
    color VARCHAR(20),
    status VARCHAR(20) DEFAULT 'confirmed',
    visibility VARCHAR(20) DEFAULT 'private',
    recurrence_rule TEXT,
    recurrence_end TIMESTAMPTZ,
    parent_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    client_id UUID,
    project_id UUID,
    booking_id UUID,
    attendees JSONB DEFAULT '[]',
    reminders JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AVAILABILITY SCHEDULES TABLE
-- =====================================================
CREATE TABLE availability_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    schedule JSONB NOT NULL DEFAULT '{
        "monday": [],
        "tuesday": [],
        "wednesday": [],
        "thursday": [],
        "friday": [],
        "saturday": [],
        "sunday": []
    }',
    date_overrides JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BOOKING TYPES TABLE
-- =====================================================
CREATE TABLE booking_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    buffer_before INTEGER DEFAULT 0,
    buffer_after INTEGER DEFAULT 0,
    color VARCHAR(20),
    price DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    location_type VARCHAR(20) DEFAULT 'video_call',
    location_details TEXT,
    custom_questions JSONB DEFAULT '[]',
    confirmation_message TEXT,
    cancellation_policy TEXT,
    requires_approval BOOLEAN DEFAULT false,
    max_bookings_per_day INTEGER,
    min_notice_hours INTEGER DEFAULT 24,
    max_advance_days INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_type_id UUID NOT NULL REFERENCES booking_types(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    location TEXT,
    video_url TEXT,
    answers JSONB DEFAULT '{}',
    notes TEXT,
    internal_notes TEXT,
    payment_status VARCHAR(20),
    payment_amount DECIMAL(15, 2),
    cancelled_by UUID REFERENCES auth.users(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    confirmation_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CALENDAR SYNCS TABLE
-- =====================================================
CREATE TABLE calendar_syncs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL,
    calendar_id VARCHAR(255) NOT NULL,
    calendar_name VARCHAR(255),
    sync_direction VARCHAR(20) DEFAULT 'both',
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    sync_token TEXT,
    credentials JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider, calendar_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON calendar_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_dates ON calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_parent ON calendar_events(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_booking ON calendar_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_recurring ON calendar_events(user_id, recurrence_rule) WHERE recurrence_rule IS NOT NULL;

-- Availability schedules indexes
CREATE INDEX IF NOT EXISTS idx_availability_schedules_user ON availability_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_schedules_default ON availability_schedules(user_id, is_default) WHERE is_default = true;

-- Booking types indexes
CREATE INDEX IF NOT EXISTS idx_booking_types_user ON booking_types(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_types_slug ON booking_types(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_booking_types_active ON booking_types(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_booking_types_public ON booking_types(is_public, is_active) WHERE is_public = true AND is_active = true;

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_dates ON bookings(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON bookings(user_id, start_time) WHERE status = 'confirmed';

-- Calendar syncs indexes
CREATE INDEX IF NOT EXISTS idx_calendar_syncs_user ON calendar_syncs(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_syncs_provider ON calendar_syncs(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_syncs_active ON calendar_syncs(user_id, is_active) WHERE is_active = true;

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_syncs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Calendar events policies
CREATE POLICY "calendar_events_select" ON calendar_events FOR SELECT
    USING (
        user_id = auth.uid() OR
        visibility = 'public' OR
        EXISTS (
            SELECT 1 FROM jsonb_array_elements(attendees) AS a
            WHERE (a->>'email') = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "calendar_events_insert" ON calendar_events FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "calendar_events_update" ON calendar_events FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "calendar_events_delete" ON calendar_events FOR DELETE
    USING (user_id = auth.uid());

-- Availability schedules policies
CREATE POLICY "availability_schedules_all" ON availability_schedules FOR ALL
    USING (user_id = auth.uid());

-- Booking types policies
CREATE POLICY "booking_types_select" ON booking_types FOR SELECT
    USING (user_id = auth.uid() OR (is_public = true AND is_active = true));

CREATE POLICY "booking_types_insert" ON booking_types FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "booking_types_update" ON booking_types FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "booking_types_delete" ON booking_types FOR DELETE
    USING (user_id = auth.uid());

-- Bookings policies
CREATE POLICY "bookings_select" ON bookings FOR SELECT
    USING (user_id = auth.uid() OR client_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "bookings_insert" ON bookings FOR INSERT
    WITH CHECK (true); -- Allow public booking creation

CREATE POLICY "bookings_update" ON bookings FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "bookings_delete" ON bookings FOR DELETE
    USING (user_id = auth.uid());

-- Calendar syncs policies
CREATE POLICY "calendar_syncs_all" ON calendar_syncs FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON calendar_events TO authenticated;
GRANT ALL ON availability_schedules TO authenticated;
GRANT ALL ON booking_types TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON calendar_syncs TO authenticated;

-- Allow anonymous to insert bookings (public booking page)
GRANT INSERT ON bookings TO anon;
GRANT SELECT ON booking_types TO anon;

GRANT ALL ON calendar_events TO service_role;
GRANT ALL ON availability_schedules TO service_role;
GRANT ALL ON booking_types TO service_role;
GRANT ALL ON bookings TO service_role;
GRANT ALL ON calendar_syncs TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER availability_schedules_updated_at
    BEFORE UPDATE ON availability_schedules
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER booking_types_updated_at
    BEFORE UPDATE ON booking_types
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER calendar_syncs_updated_at
    BEFORE UPDATE ON calendar_syncs
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get upcoming events for a user
CREATE OR REPLACE FUNCTION get_upcoming_events(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
    id UUID,
    title VARCHAR(500),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    location TEXT,
    status VARCHAR(20),
    attendee_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ce.id,
        ce.title,
        ce.start_time,
        ce.end_time,
        ce.location,
        ce.status,
        jsonb_array_length(ce.attendees)::INTEGER
    FROM calendar_events ce
    WHERE ce.user_id = p_user_id
    AND ce.start_time >= NOW()
    AND ce.start_time <= NOW() + (p_days || ' days')::INTERVAL
    AND ce.status = 'confirmed'
    ORDER BY ce.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get upcoming bookings for a user
CREATE OR REPLACE FUNCTION get_upcoming_bookings(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
    id UUID,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    booking_type_name VARCHAR(255),
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.client_name,
        b.client_email,
        b.start_time,
        b.end_time,
        bt.name,
        b.status
    FROM bookings b
    JOIN booking_types bt ON bt.id = b.booking_type_id
    WHERE b.user_id = p_user_id
    AND b.start_time >= NOW()
    AND b.start_time <= NOW() + (p_days || ' days')::INTERVAL
    AND b.status IN ('confirmed', 'pending')
    ORDER BY b.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check for time conflicts
CREATE OR REPLACE FUNCTION check_time_conflict(
    p_user_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_event_id UUID DEFAULT NULL,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_conflict BOOLEAN;
BEGIN
    -- Check calendar events
    SELECT EXISTS (
        SELECT 1 FROM calendar_events
        WHERE user_id = p_user_id
        AND status = 'confirmed'
        AND (p_exclude_event_id IS NULL OR id != p_exclude_event_id)
        AND (start_time < p_end_time AND end_time > p_start_time)
    ) INTO v_has_conflict;

    IF v_has_conflict THEN
        RETURN true;
    END IF;

    -- Check bookings
    SELECT EXISTS (
        SELECT 1 FROM bookings
        WHERE user_id = p_user_id
        AND status IN ('confirmed', 'pending')
        AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
        AND (start_time < p_end_time AND end_time > p_start_time)
    ) INTO v_has_conflict;

    RETURN v_has_conflict;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get calendar stats
CREATE OR REPLACE FUNCTION get_calendar_stats(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_events', (
            SELECT COUNT(*) FROM calendar_events
            WHERE user_id = p_user_id
            AND start_time >= NOW() - (p_days || ' days')::INTERVAL
        ),
        'upcoming_events', (
            SELECT COUNT(*) FROM calendar_events
            WHERE user_id = p_user_id
            AND start_time >= NOW()
            AND start_time <= NOW() + (7 || ' days')::INTERVAL
            AND status = 'confirmed'
        ),
        'total_bookings', (
            SELECT COUNT(*) FROM bookings
            WHERE user_id = p_user_id
            AND start_time >= NOW() - (p_days || ' days')::INTERVAL
        ),
        'upcoming_bookings', (
            SELECT COUNT(*) FROM bookings
            WHERE user_id = p_user_id
            AND start_time >= NOW()
            AND start_time <= NOW() + (7 || ' days')::INTERVAL
            AND status IN ('confirmed', 'pending')
        ),
        'pending_bookings', (
            SELECT COUNT(*) FROM bookings
            WHERE user_id = p_user_id
            AND status = 'pending'
        ),
        'cancelled_bookings', (
            SELECT COUNT(*) FROM bookings
            WHERE user_id = p_user_id
            AND status = 'cancelled'
            AND cancelled_at >= NOW() - (p_days || ' days')::INTERVAL
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
