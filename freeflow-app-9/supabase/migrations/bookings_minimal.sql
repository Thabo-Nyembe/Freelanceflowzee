-- Minimal Bookings Schema for Bookings/Calendar Page

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS bookings CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS booking_type CASCADE;

-- ENUMs
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('awaiting', 'paid', 'partial', 'refunded', 'failed');
CREATE TYPE booking_type AS ENUM ('consultation', 'meeting', 'service', 'call', 'workshop', 'event');

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Client info
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,

  -- Booking details
  service TEXT NOT NULL,
  type booking_type NOT NULL DEFAULT 'consultation',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,

  -- Status and payment
  status booking_status NOT NULL DEFAULT 'pending',
  payment payment_status NOT NULL DEFAULT 'awaiting',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Additional info
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Reminders
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment ON bookings(payment);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, start_time);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_tags ON bookings USING GIN(tags);
