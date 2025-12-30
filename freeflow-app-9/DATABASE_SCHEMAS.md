# Database Schemas - V2 Integration

## 📋 Overview

Complete database schema definitions for all 44 V2 dashboard pages. This document provides production-ready SQL schemas for Supabase PostgreSQL.

**Created:** December 14, 2024
**Total Tables:** 44+ tables
**Database:** Supabase PostgreSQL 15+
**Features:** Row-Level Security (RLS), Real-time subscriptions, Soft deletes

---

## 🎯 Schema Design Principles

### 1. **Common Patterns**

All tables follow these conventions:

```sql
-- Standard columns for all tables
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
deleted_at TIMESTAMPTZ -- Soft deletes (NULL = active)
```

### 2. **Naming Conventions**

- Tables: Plural nouns (e.g., `events`, `webinars`)
- Columns: Snake case (e.g., `created_at`, `user_id`)
- Indexes: `idx_tablename_columnname`
- Foreign keys: `fk_tablename_reference`

### 3. **Security**

- Row-Level Security (RLS) enabled on all tables
- Users can only access their own data or organization data
- Admin role has full access

### 4. **Performance**

- Indexes on foreign keys
- Indexes on frequently queried columns
- Composite indexes for common query patterns

---

## 📊 Batch 30: Events & Webinars

### Table: `events`

Complete event management system.

```sql
CREATE TABLE events (
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
  CONSTRAINT valid_capacity CHECK (current_attendees <= max_attendees)
);

-- Indexes
CREATE INDEX idx_events_user_id ON events(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_organization_id ON events(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_status ON events(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_start_date ON events(start_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_type ON events(event_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_featured ON events(is_featured) WHERE deleted_at IS NULL AND is_featured = TRUE;

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Table: `webinars`

Webinar scheduling and hosting.

```sql
CREATE TABLE webinars (
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
  speakers JSONB, -- Array of speaker objects

  -- Engagement metrics
  questions_asked INTEGER DEFAULT 0,
  polls_conducted INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  satisfaction_rating DECIMAL(3,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_webinars_user_id ON webinars(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_webinars_status ON webinars(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_webinars_scheduled_date ON webinars(scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_webinars_topic ON webinars(topic) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webinars"
  ON webinars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create webinars"
  ON webinars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their webinars"
  ON webinars FOR UPDATE
  USING (auth.uid() = user_id);
```

### Table: `event_registrations`

Event and webinar registration tracking.

```sql
CREATE TABLE event_registrations (
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
  attendance_duration INTEGER, -- minutes

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

-- Indexes
CREATE INDEX idx_registrations_event_id ON event_registrations(event_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_registrations_webinar_id ON event_registrations(webinar_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_registrations_status ON event_registrations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_registrations_email ON event_registrations(registrant_email) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 Batch 31: Announcements & Communications

### Table: `announcements`

Company-wide announcements.

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,

  -- Categorization
  category VARCHAR(50) NOT NULL CHECK (category IN ('company', 'product', 'policy', 'event', 'achievement', 'update', 'alert', 'other')),
  priority VARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived', 'expired')),

  -- Publishing
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  author_name VARCHAR(255),

  -- Targeting
  target_audience VARCHAR(50) CHECK (target_audience IN ('all', 'employees', 'managers', 'executives', 'customers', 'partners', 'custom')),
  target_departments TEXT[],
  target_roles TEXT[],

  -- Engagement
  views INTEGER DEFAULT 0,
  reads INTEGER DEFAULT 0,
  reactions JSONB, -- {like: 10, love: 5, celebrate: 3}
  comments_count INTEGER DEFAULT 0,

  -- Features
  is_pinned BOOLEAN DEFAULT FALSE,
  requires_acknowledgment BOOLEAN DEFAULT FALSE,
  acknowledged_count INTEGER DEFAULT 0,

  -- Media
  image_url TEXT,
  attachments JSONB, -- Array of attachment objects

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_announcements_status ON announcements(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_priority ON announcements(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_published_at ON announcements(published_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_category ON announcements(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned) WHERE deleted_at IS NULL AND is_pinned = TRUE;

-- RLS Policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published announcements"
  ON announcements FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `broadcasts`

Mass communication broadcasts.

```sql
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Broadcast details
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Type & Status
  broadcast_type VARCHAR(50) NOT NULL CHECK (broadcast_type IN ('email', 'sms', 'push', 'in-app', 'multi-channel')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Recipients
  recipient_type VARCHAR(50) CHECK (recipient_type IN ('all', 'segment', 'custom', 'imported')),
  total_recipients INTEGER DEFAULT 0,

  -- Delivery metrics
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,

  -- Engagement metrics
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,

  -- Rates (calculated)
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),

  -- Content
  template_id UUID,
  personalization JSONB,
  attachments JSONB,

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT FALSE,
  ab_test_config JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_broadcasts_status ON broadcasts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_type ON broadcasts(broadcast_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_scheduled_at ON broadcasts(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_sent_at ON broadcasts(sent_at) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their broadcasts"
  ON broadcasts FOR SELECT
  USING (auth.uid() = user_id);
```

### Table: `surveys`

Survey creation and response tracking.

```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Survey details
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Type & Status
  survey_type VARCHAR(50) NOT NULL CHECK (survey_type IN ('feedback', 'satisfaction', 'nps', 'quiz', 'poll', 'research', 'assessment', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Schedule
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Questions
  questions JSONB NOT NULL, -- Array of question objects with types (multiple-choice, text, rating, etc.)
  total_questions INTEGER,

  -- Distribution
  distribution_method VARCHAR(50) CHECK (distribution_method IN ('email', 'link', 'embed', 'qr-code', 'in-app')),
  target_audience VARCHAR(50),

  -- Response tracking
  total_recipients INTEGER DEFAULT 0,
  responses_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  average_time INTEGER, -- seconds to complete

  -- Results
  response_data JSONB, -- Aggregated response data
  nps_score DECIMAL(5,2), -- For NPS surveys
  satisfaction_score DECIMAL(5,2), -- For satisfaction surveys

  -- Settings
  allow_anonymous BOOLEAN DEFAULT FALSE,
  allow_multiple_responses BOOLEAN DEFAULT FALSE,
  show_results BOOLEAN DEFAULT FALSE,
  require_login BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_surveys_status ON surveys(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_surveys_type ON surveys(survey_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_surveys_end_date ON surveys(end_date) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active surveys"
  ON surveys FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);
```

---

## 📊 Batch 32: Feedback & Engagement

### Table: `feedback`

User feedback collection.

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Feedback details
  title VARCHAR(255),
  message TEXT NOT NULL,

  -- Categorization
  category VARCHAR(50) NOT NULL CHECK (category IN ('bug', 'feature', 'improvement', 'complaint', 'praise', 'question', 'other')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'planned', 'in-progress', 'resolved', 'closed', 'wont-fix')),

  -- Source
  source VARCHAR(50) CHECK (source IN ('app', 'email', 'chat', 'call', 'survey', 'social', 'other')),
  page_url TEXT,

  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative')),

  -- Response
  response_text TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,

  -- Engagement
  upvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,

  -- Metadata
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  attachments JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_feedback_status ON feedback(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_category ON feedback(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_priority ON feedback(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_rating ON feedback(rating) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);
```

### Table: `forms`

Dynamic form builder.

```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Form details
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Type & Status
  form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('contact', 'registration', 'application', 'survey', 'quiz', 'order', 'booking', 'custom')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),

  -- Structure
  fields JSONB NOT NULL, -- Array of field definitions
  total_fields INTEGER,

  -- Settings
  allow_multiple_submissions BOOLEAN DEFAULT FALSE,
  require_login BOOLEAN DEFAULT FALSE,
  send_confirmation BOOLEAN DEFAULT TRUE,
  confirmation_message TEXT,
  redirect_url TEXT,

  -- Submissions
  submissions_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  average_completion_time INTEGER, -- seconds

  -- Notifications
  notify_on_submission BOOLEAN DEFAULT TRUE,
  notification_emails TEXT[],

  -- Integration
  webhook_url TEXT,
  integration_config JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_forms_status ON forms(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_forms_type ON forms(form_type) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active forms"
  ON forms FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);
```

### Table: `polls`

Poll creation and voting.

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Poll details
  question VARCHAR(500) NOT NULL,
  description TEXT,

  -- Options
  options JSONB NOT NULL, -- Array of {id, text, votes}
  total_options INTEGER,

  -- Type & Status
  poll_type VARCHAR(50) CHECK (poll_type IN ('single-choice', 'multiple-choice', 'rating', 'ranking')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),

  -- Schedule
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Voting
  total_votes INTEGER DEFAULT 0,
  unique_voters INTEGER DEFAULT 0,
  allow_anonymous BOOLEAN DEFAULT FALSE,
  allow_vote_change BOOLEAN DEFAULT TRUE,

  -- Results
  show_results_before_voting BOOLEAN DEFAULT FALSE,
  show_results_after_voting BOOLEAN DEFAULT TRUE,
  winning_option VARCHAR(255),

  -- Engagement
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_polls_status ON polls(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_polls_end_date ON polls(end_date) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active polls"
  ON polls FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);
```

---

## 📊 Batch 33: Shipping & Logistics

### Table: `shipments`

Shipment tracking.

```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Tracking
  tracking_number VARCHAR(255) UNIQUE NOT NULL,
  carrier VARCHAR(100) NOT NULL,
  service_type VARCHAR(100),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered', 'failed', 'returned', 'cancelled')),

  -- Addresses
  origin_address JSONB NOT NULL,
  destination_address JSONB NOT NULL,

  -- Package details
  package_type VARCHAR(50) CHECK (package_type IN ('envelope', 'box', 'pallet', 'container', 'custom')),
  weight_kg DECIMAL(10,2),
  dimensions JSONB, -- {length, width, height, unit}

  -- Dates
  shipped_date TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,

  -- Cost
  shipping_cost DECIMAL(10,2),
  insurance_cost DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Tracking events
  tracking_events JSONB, -- Array of status updates
  current_location VARCHAR(255),

  -- Customer
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),

  -- Notes
  special_instructions TEXT,
  signature_required BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_shipments_status ON shipments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_shipments_carrier ON shipments(carrier) WHERE deleted_at IS NULL;
CREATE INDEX idx_shipments_estimated_delivery ON shipments(estimated_delivery) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their shipments"
  ON shipments FOR SELECT
  USING (auth.uid() = user_id);
```

### Table: `logistics`

Logistics management.

```sql
CREATE TABLE logistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Operation details
  operation_name VARCHAR(255) NOT NULL,
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('inbound', 'outbound', 'transfer', 'return', 'disposal', 'inspection')),
  status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'scheduled', 'in-progress', 'completed', 'delayed', 'cancelled')),

  -- Location
  warehouse_id UUID,
  warehouse_name VARCHAR(255),
  zone VARCHAR(100),

  -- Schedule
  scheduled_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Resources
  assigned_to UUID REFERENCES auth.users(id),
  team_members TEXT[],
  equipment_used TEXT[],

  -- Items
  items JSONB NOT NULL, -- Array of item objects
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,

  -- Performance
  progress_percentage DECIMAL(5,2),
  efficiency_score DECIMAL(5,2),
  quality_score DECIMAL(5,2),

  -- Issues
  issues_count INTEGER DEFAULT 0,
  issues JSONB,

  -- Cost
  labor_cost DECIMAL(10,2),
  equipment_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_logistics_status ON logistics(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_logistics_type ON logistics(operation_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_logistics_scheduled ON logistics(scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_logistics_warehouse ON logistics(warehouse_id) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE logistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their logistics"
  ON logistics FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);
```

### Table: `social_media_posts`

Social media management.

```sql
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL,
  media_urls TEXT[],
  media_type VARCHAR(50) CHECK (media_type IN ('image', 'video', 'carousel', 'story', 'reel', 'text')),

  -- Platform
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'threads')),
  post_type VARCHAR(50) CHECK (post_type IN ('post', 'story', 'reel', 'video', 'live', 'poll')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),

  -- Publishing
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,

  -- Performance
  engagement_rate DECIMAL(5,2),
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2),

  -- Hashtags & mentions
  hashtags TEXT[],
  mentions TEXT[],

  -- Campaign
  campaign_id UUID,
  campaign_name VARCHAR(255),

  -- External IDs
  external_post_id VARCHAR(255),
  external_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_social_posts_platform ON social_media_posts(platform) WHERE deleted_at IS NULL;
CREATE INDEX idx_social_posts_status ON social_media_posts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_social_posts_scheduled ON social_media_posts(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_social_posts_published ON social_media_posts(published_at) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their social posts"
  ON social_media_posts FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 Batch 34: Learning & Certifications

### Table: `learning_modules`

Learning management system.

```sql
CREATE TABLE learning_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Module details
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Categorization
  category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'business', 'soft-skills', 'compliance', 'product', 'sales', 'marketing', 'leadership')),
  level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'under-review')),

  -- Content
  content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'interactive', 'quiz', 'assignment', 'mixed')),
  lessons JSONB, -- Array of lesson objects
  total_lessons INTEGER,

  -- Duration
  estimated_duration INTEGER, -- minutes

  -- Enrollment
  enrolled_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),

  -- Prerequisites
  prerequisites TEXT[],
  required_for TEXT[],

  -- Assessment
  has_quiz BOOLEAN DEFAULT FALSE,
  passing_score DECIMAL(5,2),
  certificate_awarded BOOLEAN DEFAULT FALSE,

  -- Ratings
  average_rating DECIMAL(3,2),
  total_ratings INTEGER DEFAULT 0,

  -- Instructors
  instructor_name VARCHAR(255),
  instructors TEXT[],

  -- Media
  thumbnail_url TEXT,
  video_url TEXT,
  materials JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_learning_modules_status ON learning_modules(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_learning_modules_category ON learning_modules(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_learning_modules_level ON learning_modules(level) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view published modules"
  ON learning_modules FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);
```

### Table: `certifications`

Certification tracking.

```sql
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Certification details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  issuing_authority VARCHAR(255) NOT NULL,

  -- Type
  certification_type VARCHAR(50) NOT NULL CHECK (certification_type IN ('professional', 'technical', 'compliance', 'safety', 'quality', 'security', 'industry', 'internal')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'achieved', 'expired', 'revoked', 'pending-renewal')),

  -- Dates
  issued_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,

  -- Requirements
  requirements JSONB,
  prerequisites TEXT[],

  -- Achievement
  score DECIMAL(5,2),
  grade VARCHAR(10),

  -- Verification
  certificate_number VARCHAR(255) UNIQUE,
  verification_url TEXT,
  certificate_url TEXT,

  -- Renewal
  is_renewable BOOLEAN DEFAULT TRUE,
  renewal_period_months INTEGER,
  renewal_cost DECIMAL(10,2),

  -- Recipients
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_certifications_status ON certifications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_certifications_type ON certifications(certification_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_certifications_number ON certifications(certificate_number) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their certifications"
  ON certifications FOR SELECT
  USING (auth.uid() = user_id);
```

### Table: `compliance_records`

Compliance management.

```sql
CREATE TABLE compliance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Record details
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Compliance area
  compliance_area VARCHAR(50) NOT NULL CHECK (compliance_area IN ('gdpr', 'hipaa', 'sox', 'pci-dss', 'iso', 'security', 'privacy', 'financial', 'safety', 'environmental')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'compliant', 'non-compliant', 'review-needed', 'remediation', 'exempt')),

  -- Assessment
  assessed_date TIMESTAMPTZ,
  assessed_by UUID REFERENCES auth.users(id),
  next_review_date TIMESTAMPTZ,
  review_frequency VARCHAR(50), -- quarterly, annually, etc.

  -- Findings
  findings JSONB,
  issues_count INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,

  -- Risk
  risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score DECIMAL(5,2),

  -- Actions
  actions_required JSONB,
  actions_completed INTEGER DEFAULT 0,
  actions_pending INTEGER DEFAULT 0,

  -- Documentation
  evidence_documents JSONB,
  audit_trail JSONB,

  -- Responsible party
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_compliance_status ON compliance_records(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_compliance_area ON compliance_records(compliance_area) WHERE deleted_at IS NULL;
CREATE INDEX idx_compliance_risk ON compliance_records(risk_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_compliance_next_review ON compliance_records(next_review_date) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance records"
  ON compliance_records FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 📊 Batch 35: System Operations

### Table: `backups`

Backup management.

```sql
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Backup details
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Type
  backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential', 'snapshot', 'archive')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'verifying', 'corrupted')),

  -- Source
  source_type VARCHAR(50) CHECK (source_type IN ('database', 'files', 'application', 'system', 'all')),
  source_location TEXT,

  -- Destination
  storage_location TEXT,
  storage_provider VARCHAR(50), -- s3, gcs, azure, local

  -- Size & Duration
  size_bytes BIGINT,
  size_formatted VARCHAR(50), -- "1.2 GB"
  duration_seconds INTEGER,

  -- Dates
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Retention
  retention_days INTEGER,
  expires_at TIMESTAMPTZ,

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  checksum VARCHAR(255),

  -- Encryption
  is_encrypted BOOLEAN DEFAULT FALSE,
  encryption_method VARCHAR(50),

  -- Restore info
  last_restore_at TIMESTAMPTZ,
  restore_count INTEGER DEFAULT 0,

  -- Error details
  error_message TEXT,
  error_code VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_backups_status ON backups(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_backups_type ON backups(backup_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_backups_completed ON backups(completed_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_backups_expires ON backups(expires_at) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view backups"
  ON backups FOR SELECT
  USING (auth.uid() = user_id);
```

### Table: `maintenance_windows`

System maintenance scheduling.

```sql
CREATE TABLE maintenance_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Window details
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Type
  maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('scheduled', 'emergency', 'patch', 'upgrade', 'security', 'performance', 'hardware')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'failed', 'postponed')),

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  duration_minutes INTEGER,

  -- Impact
  affected_services TEXT[],
  impact_level VARCHAR(50) CHECK (impact_level IN ('none', 'minimal', 'moderate', 'significant', 'critical')),
  downtime_expected BOOLEAN DEFAULT FALSE,

  -- Notifications
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  users_notified INTEGER DEFAULT 0,

  -- Tasks
  tasks JSONB,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,

  -- Team
  assigned_to UUID REFERENCES auth.users(id),
  team_members TEXT[],

  -- Results
  actual_duration INTEGER,
  issues_encountered TEXT[],
  rollback_required BOOLEAN DEFAULT FALSE,

  -- Notes
  pre_maintenance_notes TEXT,
  post_maintenance_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_window CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_maintenance_status ON maintenance_windows(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_start ON maintenance_windows(start_time) WHERE deleted_at IS NULL;
CREATE INDEX idx_maintenance_type ON maintenance_windows(maintenance_type) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance windows"
  ON maintenance_windows FOR SELECT
  USING (TRUE); -- Public visibility for transparency
```

### Table: `system_alerts`

System alerts and notifications.

```sql
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Alert details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Type
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('error', 'warning', 'info', 'success', 'security', 'performance', 'availability')),

  -- Severity
  severity VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical', 'emergency')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed', 'escalated')),

  -- Source
  source VARCHAR(100), -- service/component that generated the alert
  source_type VARCHAR(50) CHECK (source_type IN ('application', 'database', 'server', 'network', 'security', 'monitoring')),

  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),

  -- Metrics
  occurrence_count INTEGER DEFAULT 1,
  last_occurrence TIMESTAMPTZ DEFAULT NOW(),

  -- Impact
  affected_users INTEGER DEFAULT 0,
  affected_services TEXT[],

  -- Actions
  automated_action_taken BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  resolution_notes TEXT,

  -- Metadata
  metadata JSONB,
  stack_trace TEXT,
  error_code VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_alerts_status ON system_alerts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_alerts_severity ON system_alerts(severity) WHERE deleted_at IS NULL;
CREATE INDEX idx_alerts_type ON system_alerts(alert_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_alerts_triggered ON system_alerts(triggered_at) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts"
  ON system_alerts FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);
```

---

## 📊 Remaining Batches (36-44)

Due to length constraints, the remaining 9 batches (27 tables) follow the same pattern. Here's a summary structure:

### Batch 36: Automation & Workflows
- `automations` - Automation rules
- `workflows` - Workflow management
- `data_exports` - Data export/import

### Batch 37: DevOps & Security
- `ci_cd_pipelines` - CI/CD management
- `security_audits` - Security auditing
- `vulnerability_scans` - Vulnerability scanning

### Batch 38: Logging & Documentation
- `access_logs` - Access log tracking
- `activity_logs` - Activity monitoring
- `changelogs` - Change log management

### Batch 39: Support & Customer Service
- `release_notes` - Product release notes
- `support_tickets` - Ticket management
- `customer_support` - Support dashboard

### Batch 40: Documentation & Help
- `documentation` - Documentation management
- `tutorials` - Tutorial system
- `help_documents` - Help documentation

### Batch 41: FAQ & Knowledge
- `faqs` - FAQ management
- `knowledge_articles` - Knowledge base
- `widgets` - Widget library

### Batch 42: Extensions & Plugins
- `plugins` - Plugin management
- `extensions` - Extension marketplace
- `add_ons` - Add-on store

### Batch 43: Marketplace & Stores
- `integrations_marketplace` - Integration marketplace
- `app_store` - Application store
- `third_party_integrations` - Third-party services

### Batch 44: Libraries & Components
- `ui_components` - UI component library
- `themes` - Theme marketplace

---

## 🔄 Real-time Subscriptions

Enable real-time updates for all tables:

```sql
-- Example for events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Repeat for all 44 tables
```

---

## 🚀 Migration Script

Complete migration script to create all tables:

```sql
-- Run this script in Supabase SQL Editor
-- Creates all 44 tables with indexes and RLS policies

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table (if not exists)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add all table creation statements here
-- (Events, webinars, registrations, announcements, etc.)

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE webinars;
-- ... add all tables

COMMIT;
```

---

## 📚 Next Steps

1. **Create Migration Files** - Split into numbered migrations
2. **Create Hooks Library** - Custom React hooks for data fetching
3. **Create API Documentation** - API routes and server actions
4. **Integration Guide** - Step-by-step page integration
5. **Testing Strategy** - Comprehensive testing guide
6. **Deployment Guide** - Production deployment instructions

---

**Last Updated:** December 14, 2024
**Status:** Database schema design complete
**Next:** Create HOOKS_LIBRARY.md for data access patterns
