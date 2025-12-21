
  -- Financial Record Details
  record_number VARCHAR(100) UNIQUE NOT NULL,
  record_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (record_type IN ('general', 'revenue', 'expense', 'investment', 'loan', 'grant', 'tax', 'payroll', 'dividend', 'asset', 'liability', 'equity')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Amount Details
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
  base_amount DECIMAL(15, 2),

  -- Status & Classification
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'processed', 'completed', 'cancelled', 'on_hold', 'under_review')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Dates
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER CHECK (fiscal_quarter BETWEEN 1 AND 4),
  fiscal_month INTEGER CHECK (fiscal_month BETWEEN 1 AND 12),

  -- Accounting Details
  account_code VARCHAR(50),
  cost_center VARCHAR(100),
  department VARCHAR(100),
  project_id UUID,
  gl_account VARCHAR(100),

  -- Payment & Banking
  payment_method VARCHAR(50)
    CHECK (payment_method IN ('cash', 'check', 'wire_transfer', 'ach', 'credit_card', 'debit_card', 'paypal', 'stripe', 'crypto', 'other')),
  bank_account VARCHAR(100),
  transaction_reference VARCHAR(200),

  -- Tax Information
  is_taxable BOOLEAN DEFAULT false,
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(15, 2),
  tax_category VARCHAR(100),

  -- Approval & Audit
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Documentation
  attachments JSONB DEFAULT '[]'::jsonb,
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

  -- Indexes
  CONSTRAINT financial_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: fleet_vehicles
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_code TEXT UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('van', 'truck', 'semi-truck', 'cargo-plane', 'container-ship', 'motorcycle', 'drone')),
  make TEXT,
  model TEXT,
  year INTEGER,
  license_plate TEXT,
  vin TEXT,
  capacity_weight DECIMAL(10,2),
  capacity_volume DECIMAL(10,2),
  fuel_type TEXT DEFAULT 'diesel' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'jet-fuel', 'lng')),
  fuel_efficiency DECIMAL(5,2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'retired')),
  current_driver_id TEXT,
  current_location JSONB DEFAULT '{}',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  total_miles DECIMAL(12,2) DEFAULT 0,
  insurance_expiry DATE,
  registration_expiry DATE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: focus_sessions
-- Source: 20241214000042_batch_71_overview_myday_projects.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES my_day_tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  session_type TEXT DEFAULT 'focus' CHECK (session_type IN ('focus', 'break', 'meeting')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: forms
-- Source: 20241214000003_batch_32_feedback_engagement.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS forms (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(50) NOT NULL DEFAULT 'custom'
    CHECK (form_type IN ('contact', 'registration', 'application', 'survey', 'quiz', 'order', 'feedback', 'custom')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Form Structure
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  field_count INTEGER DEFAULT 0,
  sections JSONB DEFAULT '[]'::jsonb,

  -- Settings
  allow_multiple_submissions BOOLEAN DEFAULT FALSE,
  require_authentication BOOLEAN DEFAULT FALSE,
  allow_save_draft BOOLEAN DEFAULT TRUE,
  show_progress_bar BOOLEAN DEFAULT TRUE,

  -- Validation
  validation_rules JSONB DEFAULT '{}'::jsonb,
  required_fields JSONB DEFAULT '[]'::jsonb,

  -- Submission Settings
  max_submissions INTEGER,
  submission_deadline TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,

  -- Response Handling
  confirmation_message TEXT,
  redirect_url VARCHAR(500),
  send_confirmation_email BOOLEAN DEFAULT TRUE,
  email_template_id UUID,
  notification_emails JSONB DEFAULT '[]'::jsonb,

  -- Submissions Tracking
  total_submissions INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_started INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_completion_time INTEGER DEFAULT 0,

  -- Access Control
  is_public BOOLEAN DEFAULT TRUE,
  password_protected BOOLEAN DEFAULT FALSE,
  access_code VARCHAR(100),
  allowed_domains JSONB DEFAULT '[]'::jsonb,

  -- Appearance
  theme VARCHAR(50) DEFAULT 'default',
  custom_css TEXT,
  logo_url VARCHAR(500),
  background_image_url VARCHAR(500),
  primary_color VARCHAR(50),

  -- Integration
  webhook_url VARCHAR(500),
  webhook_events JSONB DEFAULT '[]'::jsonb,
  integration_settings JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  analytics_enabled BOOLEAN DEFAULT TRUE,
  track_source BOOLEAN DEFAULT TRUE,
  track_location BOOLEAN DEFAULT FALSE,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: gallery_items
-- Source: 20241215000001_batch_72_clients_files_gallery.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio', 'document', 'other')),
  mime_type TEXT,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  category TEXT,
  collection_id UUID,
  project_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_portfolio BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: growth_forecasts
-- Source: ai_business_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS growth_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period forecast_period NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER,
  month INTEGER,
  revenue_forecast DECIMAL(12, 2) NOT NULL,
  project_count_forecast INTEGER NOT NULL,
  growth_rate DECIMAL(5, 2) NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  assumptions TEXT[] DEFAULT ARRAY[]::TEXT[],
  milestones TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: guest_upload_analytics
-- Source: 20250104_guest_uploads.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS guest_upload_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_uploads INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  completed_uploads INTEGER DEFAULT 0,
  failed_uploads INTEGER DEFAULT 0,
  avg_file_size BIGINT DEFAULT 0,
  total_file_size BIGINT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_download_count DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: guest_upload_payments
-- Source: 20250104_guest_uploads.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS guest_upload_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  upload_link UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_intent_id VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 10,
  file_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: health_scores
-- Source: 20241214000031_batch_60_health_renewals_surveys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_code VARCHAR(20) UNIQUE NOT NULL,

  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_id UUID,
  account_type VARCHAR(50) DEFAULT 'standard',

  -- Overall scores
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  category VARCHAR(50) DEFAULT 'fair' CHECK (category IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  trend VARCHAR(50) DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  previous_score INTEGER DEFAULT 0,
  score_change INTEGER DEFAULT 0,

  -- Component scores
  product_usage INTEGER DEFAULT 0 CHECK (product_usage >= 0 AND product_usage <= 100),
  engagement INTEGER DEFAULT 0 CHECK (engagement >= 0 AND engagement <= 100),
  support_health INTEGER DEFAULT 0 CHECK (support_health >= 0 AND support_health <= 100),
  financial INTEGER DEFAULT 0 CHECK (financial >= 0 AND financial <= 100),
  sentiment INTEGER DEFAULT 0 CHECK (sentiment >= 0 AND sentiment <= 100),

  -- Metrics
  risk_factors INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  monthly_trend INTEGER[] DEFAULT ARRAY[]::INTEGER[],

  -- Metadata
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: help_article_feedback
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS help_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES help_articles(id) ON DELETE CASCADE,

  -- Feedback Info
  helpful BOOLEAN NOT NULL,
  feedback TEXT,

  -- User (optional)
  user_id UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: help_articles
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_code VARCHAR(20) UNIQUE DEFAULT ('ART-' || LPAD(nextval('help_articles_seq')::text, 6, '0')),

  -- Article Info
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  content TEXT,
  excerpt TEXT,
  category VARCHAR(50) DEFAULT 'guide', -- guide, tutorial, faq, video, troubleshooting

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMPTZ,

  -- Metrics
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 3,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Media
  featured_image VARCHAR(500),
  attachments JSONB DEFAULT '[]',

  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(255),

  -- Organization
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES help_articles(id),

  -- Tags & Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: help_categories
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),

  -- Organization
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES help_categories(id),

  -- Stats
  article_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, hidden

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: help_docs
-- Source: 20241215000010_batch_81_release_help_support.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS help_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  question TEXT,
  answer TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'outdated')),
  category VARCHAR(30) DEFAULT 'faq' CHECK (category IN ('faq', 'how-to', 'troubleshooting', 'reference', 'best-practices', 'glossary')),
  author VARCHAR(100),
  views_count INTEGER DEFAULT 0,
  searches_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  related_docs TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: integration_preferences
-- Source: 20240327000001_freelancer_analytics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS integration_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, integration_id)
);


-- =====================================================
-- Table: inventory
-- Source: 20241214000020_batch_49_features_inventory_knowledge.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  product_name VARCHAR(500) NOT NULL,
  sku VARCHAR(200) UNIQUE,
  barcode VARCHAR(200),

  -- Classification
  category VARCHAR(100),
  subcategory VARCHAR(100),
  brand VARCHAR(200),
  manufacturer VARCHAR(200),

  -- Stock Levels
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  minimum_stock_level INTEGER DEFAULT 0,
  maximum_stock_level INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'in-stock'
    CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock', 'discontinued', 'on-order', 'backorder')),
  is_active BOOLEAN DEFAULT true,

  -- Pricing
  unit_price DECIMAL(12, 2) DEFAULT 0,
  cost_price DECIMAL(12, 2) DEFAULT 0,
  selling_price DECIMAL(12, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Supplier Information
  supplier_name VARCHAR(200),
  supplier_id VARCHAR(100),
  supplier_sku VARCHAR(200),
  lead_time_days INTEGER DEFAULT 0,

  -- Location
  warehouse VARCHAR(200),
  warehouse_location VARCHAR(200),
  aisle VARCHAR(50),
  shelf VARCHAR(50),
  bin VARCHAR(50),

  -- Physical Properties
  weight_kg DECIMAL(10, 2) DEFAULT 0,
  dimensions_cm VARCHAR(100),
  volume_m3 DECIMAL(10, 4) DEFAULT 0,

  -- Tracking
  last_restocked_at TIMESTAMPTZ,
  last_sold_at TIMESTAMPTZ,
  last_counted_at TIMESTAMPTZ,
  days_in_stock INTEGER DEFAULT 0,

  -- Performance Metrics
  turnover_rate DECIMAL(5, 2) DEFAULT 0,
  sell_through_rate DECIMAL(5, 2) DEFAULT 0,
  stock_cover_days INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,

  -- Alerts
  low_stock_alert BOOLEAN DEFAULT false,
  out_of_stock_alert BOOLEAN DEFAULT false,
  expiry_alert BOOLEAN DEFAULT false,

  -- Expiration
  has_expiry BOOLEAN DEFAULT false,
  expiry_date DATE,
  days_until_expiry INTEGER,
  batch_number VARCHAR(100),
  lot_number VARCHAR(100),

  -- Tax & Compliance
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  is_taxable BOOLEAN DEFAULT true,
  customs_code VARCHAR(100),
  origin_country VARCHAR(100),

  -- Metadata
  description TEXT,
  notes TEXT,
  tags TEXT[],
  image_url TEXT,
  images TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: invoice_analytics_daily
-- Source: 20251211000003_invoicing_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Invoice counts
  invoices_created INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_viewed INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  invoices_overdue INTEGER DEFAULT 0,

  -- Financial metrics (in cents for precision)
  total_invoiced BIGINT DEFAULT 0,
  total_collected BIGINT DEFAULT 0,
  total_outstanding BIGINT DEFAULT 0,
  total_overdue BIGINT DEFAULT 0,

  -- Payment metrics
  payments_received INTEGER DEFAULT 0,
  average_payment_days NUMERIC(5, 2),

  -- Client metrics
  new_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,

  -- Currency
  currency TEXT DEFAULT 'USD',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date, currency)
);


-- =====================================================
-- Table: invoice_clients
-- Source: 20251211000003_invoicing_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Client identification
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  vat_number TEXT,
  tax_id TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Billing address (if different)
  billing_address JSONB,

  -- Stripe integration
  stripe_customer_id TEXT,

  -- Default settings
  default_currency TEXT DEFAULT 'USD',
  default_payment_terms INTEGER DEFAULT 30,
  default_tax_rate DECIMAL(5, 2) DEFAULT 0,
  default_discount DECIMAL(10, 2) DEFAULT 0,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  is_archived BOOLEAN DEFAULT FALSE,

  -- Statistics
  total_invoiced DECIMAL(12, 2) DEFAULT 0,
  total_paid DECIMAL(12, 2) DEFAULT 0,
  total_outstanding DECIMAL(12, 2) DEFAULT 0,
  invoice_count INTEGER DEFAULT 0,
  average_payment_days INTEGER,
  last_invoice_at TIMESTAMPTZ,
  last_payment_at TIMESTAMPTZ,

  -- Tags/categories
  tags TEXT[] DEFAULT '{}',
  category TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT invoice_clients_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);


-- =====================================================
-- Table: invoice_events
-- Source: 20251211000003_invoicing_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_category TEXT,

  -- Event details
  description TEXT,
  event_data JSONB DEFAULT '{}',

  -- Previous/new values for changes
  previous_value JSONB,
  new_value JSONB,

  -- Context
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: invoice_payment_links
-- Source: 20251211000003_invoicing_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link info
  link_id TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,

  -- Stripe integration
  stripe_payment_link_id TEXT,
  stripe_price_id TEXT,

  -- Settings
  allow_partial_payment BOOLEAN DEFAULT FALSE,
  minimum_payment DECIMAL(12, 2),
  suggested_amounts JSONB DEFAULT '[]',

  -- Expiry
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: job_applications
-- Source: 20241214000028_batch_57_bugs_recruitment_onboarding.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  application_code VARCHAR(50) NOT NULL,
  candidate_name VARCHAR(200) NOT NULL,
  candidate_email VARCHAR(200),
  candidate_phone VARCHAR(50),
  status VARCHAR(30) DEFAULT 'new',
  stage VARCHAR(100) DEFAULT 'Application Received',
  experience_years INTEGER DEFAULT 0,
  match_score DECIMAL(5,2) DEFAULT 0,
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  screening_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  offer_date TIMESTAMP WITH TIME ZONE,
  hired_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  interviewer_notes JSONB DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: job_postings
-- Source: 20241214000028_batch_57_bugs_recruitment_onboarding.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_code VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  department VARCHAR(100),
  location VARCHAR(200),
  job_type VARCHAR(50) DEFAULT 'full-time',
  status VARCHAR(30) DEFAULT 'draft',
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  salary_currency VARCHAR(10) DEFAULT 'USD',
  posted_date TIMESTAMP WITH TIME ZONE,
  closing_date TIMESTAMP WITH TIME ZONE,
  applications_count INTEGER DEFAULT 0,
  shortlisted_count INTEGER DEFAULT 0,
  interviews_count INTEGER DEFAULT 0,
  offers_count INTEGER DEFAULT 0,
  hired_count INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  hiring_manager VARCHAR(200),
  recruiter VARCHAR(200),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: kb_article_feedback
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback
  feedback_type kb_feedback_type NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Context
  user_agent TEXT,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_article_versions
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_article_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,

  -- Version Data
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,

  -- Change Tracking
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_article_views
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- View Details
  time_spent_seconds INTEGER,
  scroll_percentage INTEGER,
  completed_reading BOOLEAN DEFAULT false,

  -- Context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_articles
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,

  -- Article Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,

  -- Metadata
  status kb_article_status DEFAULT 'draft',
  content_type kb_content_type DEFAULT 'article',
  difficulty_level kb_difficulty_level DEFAULT 'beginner',

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],

  -- Author & Publishing
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Reading Stats
  read_time_minutes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Related Content
  related_article_ids UUID[] DEFAULT '{}',

  -- Featured
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,

  -- Versioning
  version INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_bookmarks
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Bookmark Target
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE CASCADE,

  -- Notes
  notes TEXT,

  -- Organization
  folder TEXT,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one of article_id or video_id is set
  CHECK (
    (article_id IS NOT NULL AND video_id IS NULL) OR
    (article_id IS NULL AND video_id IS NOT NULL)
  )
);


-- =====================================================
-- Table: kb_categories
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category Details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name (lucide-react)
  color TEXT, -- Tailwind color class

  -- Hierarchy
  parent_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,

  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  article_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_faqs
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,

  -- FAQ Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Metadata
  status kb_article_status DEFAULT 'published',

  -- Stats
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Organization
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_search_queries
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Search Details
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,

  -- Context
  user_agent TEXT,
  ip_address INET,

  -- Results Clicked
  clicked_article_id UUID REFERENCES kb_articles(id) ON DELETE SET NULL,
  clicked_video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_suggested_topics
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_suggested_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Suggestion
  title TEXT NOT NULL,
  description TEXT,
  category_suggestion TEXT,

  -- Priority
  votes INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'planned', 'in-progress', 'completed', 'rejected')) DEFAULT 'pending',

  -- Admin Response
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_video_feedback
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_video_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_video_tutorials
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_video_tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,

  -- Video Details
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Video Source
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT, -- Format: "5:24"
  duration_seconds INTEGER,

  -- Metadata
  status kb_article_status DEFAULT 'draft',
  difficulty_level kb_difficulty_level DEFAULT 'beginner',

  -- Stats
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Related
  related_video_ids UUID[] DEFAULT '{}',
  related_article_ids UUID[] DEFAULT '{}',

  -- Featured
  is_featured BOOLEAN DEFAULT false,

  -- Publishing
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: kb_video_views
-- Source: 20251128_knowledge_base_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS kb_video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- View Details
  watch_time_seconds INTEGER,
  completion_percentage INTEGER,
  completed_video BOOLEAN DEFAULT false,

  -- Context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: knowledge_articles
-- Source: 20241215000008_batch_79_knowledge_extensions_plugins.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  article_type VARCHAR(50) DEFAULT 'guide' CHECK (article_type IN ('guide', 'how-to', 'best-practice', 'case-study', 'reference', 'glossary', 'concept')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'archived', 'scheduled')),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  author VARCHAR(255),
  contributors_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 5,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  related_articles UUID[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: knowledge_base
-- Source: 20241214000020_batch_49_features_inventory_knowledge.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  article_title VARCHAR(500) NOT NULL,
  article_slug VARCHAR(500),
  description TEXT,
  content TEXT,

  -- Classification
  category VARCHAR(100) DEFAULT 'general'
    CHECK (category IN ('getting-started', 'tutorials', 'api', 'troubleshooting', 'best-practices', 'faq', 'general')),
  article_type VARCHAR(50) DEFAULT 'article'
    CHECK (article_type IN ('article', 'video', 'guide', 'faq', 'tutorial', 'reference')),

  -- Status
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived', 'outdated')),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Authoring
  author VARCHAR(200),
  author_id UUID,
  contributors TEXT[],
  reviewer VARCHAR(200),
  editor VARCHAR(200),

  -- Content Metadata
  read_time_minutes INTEGER DEFAULT 0,
  difficulty_level VARCHAR(50) DEFAULT 'beginner'
    CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  language VARCHAR(50) DEFAULT 'en',

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  total_reads INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,

  -- Feedback
  rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  helpful_percentage DECIMAL(5, 2) DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- SEO
  meta_title VARCHAR(200),
  meta_description TEXT,
  keywords TEXT[],
  canonical_url TEXT,

  -- Organization
  parent_article_id UUID REFERENCES knowledge_base(id),
  section VARCHAR(200),
  subsection VARCHAR(200),
  order_index INTEGER DEFAULT 0,

  -- Related Content
  related_articles UUID[],
  prerequisites UUID[],
  next_steps UUID[],
  tags TEXT[],

  -- Media
  featured_image_url TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER,
  attachments TEXT[],
  code_snippets JSONB,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID,
  is_latest_version BOOLEAN DEFAULT true,
  change_log TEXT,

  -- Access Control
  visibility VARCHAR(50) DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal', 'authenticated')),
  allowed_roles TEXT[],
  restricted_to TEXT[],

  -- Maintenance
  last_reviewed_at TIMESTAMPTZ,
  needs_update BOOLEAN DEFAULT false,
  is_outdated BOOLEAN DEFAULT false,
  deprecation_notice TEXT,

  -- Analytics
  search_appearances INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,
  avg_time_on_page_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: lead_activities
-- Source: 20241215000007_batch_78_investor_leads_pricing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note', 'status_change', 'score_change')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: leads
-- Source: 20241215000007_batch_78_investor_leads_pricing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  title VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'archived')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source VARCHAR(50) DEFAULT 'website',
  notes TEXT,
  value_estimate DECIMAL(15,2) DEFAULT 0,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: logistics_routes
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS logistics_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_code TEXT UNIQUE,
  route_name TEXT NOT NULL,
  description TEXT,
  route_type TEXT DEFAULT 'local' CHECK (route_type IN ('local', 'regional', 'national', 'international', 'express')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed', 'delayed', 'cancelled')),
  driver_id TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('van', 'truck', 'semi-truck', 'cargo-plane', 'container-ship', 'motorcycle', 'drone')),
  vehicle_plate TEXT,
  vehicle_id TEXT,
  origin_address JSONB DEFAULT '{}',
  origin_city TEXT,
  origin_country TEXT,
  destination_address JSONB DEFAULT '{}',
  destination_city TEXT,
  destination_country TEXT,
  waypoints JSONB DEFAULT '[]',
  total_stops INTEGER DEFAULT 0,
  completed_stops INTEGER DEFAULT 0,
  total_distance_miles DECIMAL(10,2) DEFAULT 0,
  completed_distance_miles DECIMAL(10,2) DEFAULT 0,
  total_packages INTEGER DEFAULT 0,
  delivered_packages INTEGER DEFAULT 0,
  estimated_duration_minutes INTEGER DEFAULT 0,
  actual_duration_minutes INTEGER,
  departure_time TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  fuel_cost DECIMAL(10,2) DEFAULT 0,
  toll_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  delay_reason TEXT,
  special_instructions TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: maintenance_tasks
-- Source: 20241214000037_batch_66_backups_maintenance_roles.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  window_id UUID NOT NULL REFERENCES maintenance_windows(id) ON DELETE CASCADE,

  -- Task Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  task_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in-progress, completed, failed, skipped

  -- Timing
  estimated_duration_minutes INTEGER DEFAULT 15,
  actual_duration_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Assignment
  assigned_to TEXT[] DEFAULT '{}',
  completed_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: maintenance_windows
-- Source: 20241214000037_batch_66_backups_maintenance_roles.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_code VARCHAR(20) UNIQUE DEFAULT ('MNT-' || LPAD(nextval('maintenance_seq')::text, 6, '0')),

  -- Window Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) DEFAULT 'routine', -- routine, emergency, upgrade, patch, inspection, optimization
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in-progress, completed, cancelled, delayed

  -- Impact & Priority
  impact VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Affected Systems
  affected_systems TEXT[] DEFAULT '{}',
  downtime_expected BOOLEAN DEFAULT false,

  -- Team
  assigned_to TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  notification_methods TEXT[] DEFAULT '{}', -- email, sms, push, in-app, slack
  users_notified INTEGER DEFAULT 0,

  -- Progress
  completion_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: marketing_channels
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  channel_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Performance
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_cost DECIMAL(15,2) DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Config
  api_credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: marketplace_apps
-- Source: 20241214000022_batch_51_marketplace_messaging_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  app_name VARCHAR(200) NOT NULL,
  app_slug VARCHAR(200),
  description TEXT,
  short_description VARCHAR(500),

  -- Developer Info
  developer_name VARCHAR(200),
  developer_email VARCHAR(255),
  developer_website VARCHAR(500),
  developer_verified BOOLEAN DEFAULT false,

  -- Categorization
  category VARCHAR(50) DEFAULT 'productivity'
    CHECK (category IN ('productivity', 'analytics', 'marketing', 'security', 'collaboration', 'automation', 'communication', 'finance', 'design', 'development', 'other')),
  subcategory VARCHAR(100),
  tags TEXT[],

  -- Pricing
  pricing_model VARCHAR(20) DEFAULT 'paid'
    CHECK (pricing_model IN ('free', 'freemium', 'paid', 'subscription', 'usage_based')),
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  monthly_price DECIMAL(10, 2),
  annual_price DECIMAL(10, 2),

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'published', 'rejected', 'suspended', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metrics
  total_downloads INTEGER DEFAULT 0,
  total_installs INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Media
  icon_url TEXT,
  banner_url TEXT,
  screenshots TEXT[],
  video_url TEXT,

  -- Technical
  version VARCHAR(50),
  min_platform_version VARCHAR(50),
  permissions TEXT[],
  api_scopes TEXT[],
  webhook_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: marketplace_integrations
-- Source: 20241215000009_batch_80_integrations_mobile_marketplace.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  logo VARCHAR(50),
  category VARCHAR(50) DEFAULT 'productivity' CHECK (category IN ('crm', 'marketing', 'productivity', 'communication', 'analytics', 'payment', 'storage', 'social')),
  integration_type VARCHAR(50) DEFAULT 'api' CHECK (integration_type IN ('native', 'api', 'webhook', 'oauth', 'zapier')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('connected', 'available', 'disconnected', 'configuring', 'error')),
  users_count INTEGER DEFAULT 0,
  installs_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  version VARCHAR(20),
  pricing VARCHAR(50) DEFAULT 'Free',
  sync_frequency VARCHAR(50),
  data_direction VARCHAR(50),
  setup_time VARCHAR(50),
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: marketplace_reviews
-- Source: 20241214000022_batch_51_marketplace_messaging_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,

  -- Reviewer Info
  reviewer_name VARCHAR(200),
  reviewer_avatar TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'removed')),
  is_featured BOOLEAN DEFAULT false,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  -- Developer Response
  developer_response TEXT,
  developer_responded_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: media_files
-- Source: 20241214000022_batch_51_marketplace_messaging_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID,

  -- File Info
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  file_type VARCHAR(20) DEFAULT 'document'
    CHECK (file_type IN ('image', 'video', 'audio', 'document', 'archive', 'other')),
  mime_type VARCHAR(200),
  file_extension VARCHAR(20),

  -- Storage
  storage_path TEXT,
  storage_url TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  cdn_url TEXT,

  -- Dimensions & Size
  file_size BIGINT DEFAULT 0,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  page_count INTEGER,

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('uploading', 'processing', 'active', 'archived', 'deleted', 'quarantined')),
  is_public BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Metrics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Access Control
  access_level VARCHAR(20) DEFAULT 'private'
    CHECK (access_level IN ('private', 'team', 'organization', 'public', 'link_only')),
  shared_with UUID[],
  password_protected BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Technical Info
  checksum VARCHAR(64),
  encoding VARCHAR(50),
  bit_rate INTEGER,
  sample_rate INTEGER,
  color_space VARCHAR(50),

  -- AI/Processing
  alt_text TEXT,
  description TEXT,
  tags TEXT[],
  ai_tags TEXT[],
  transcription TEXT,
  extracted_text TEXT,

  -- Metadata
  exif_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: media_folders
-- Source: 20241214000022_batch_51_marketplace_messaging_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS media_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,

  -- Folder Info
  folder_name VARCHAR(200) NOT NULL,
  folder_path TEXT,
  description TEXT,

  -- Status
  is_root BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,

  -- Metrics
  file_count INTEGER DEFAULT 0,
  folder_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Access Control
  access_level VARCHAR(20) DEFAULT 'private'
    CHECK (access_level IN ('private', 'team', 'organization', 'public')),
  shared_with UUID[],

  -- Customization
  color VARCHAR(50),
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: milestone_deliverables
-- Source: 20241214000030_batch_59_milestones_resources_allocation.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS milestone_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  deliverable_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in-progress, completed, blocked
  due_date DATE,
  completed_date DATE,
  assignee_name VARCHAR(255),
  assignee_email VARCHAR(255),
  progress INTEGER DEFAULT 0,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: mobile_app_features
-- Source: 20241215000009_batch_80_integrations_mobile_marketplace.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_app_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  feature_type VARCHAR(50) DEFAULT 'standard' CHECK (feature_type IN ('core', 'standard', 'premium', 'beta', 'experimental')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'beta', 'deprecated', 'coming-soon')),
  platform VARCHAR(20) DEFAULT 'all' CHECK (platform IN ('all', 'ios', 'android')),
  users_count INTEGER DEFAULT 0,
  engagement_percent INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  version VARCHAR(20),
  release_date TIMESTAMP WITH TIME ZONE,
  icon_color VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: mobile_app_versions
-- Source: 20241215000009_batch_80_integrations_mobile_marketplace.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS mobile_app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  platform VARCHAR(20) DEFAULT 'all' CHECK (platform IN ('all', 'ios', 'android')),
  status VARCHAR(20) DEFAULT 'stable' CHECK (status IN ('stable', 'beta', 'deprecated', 'archived')),
  downloads_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  crash_free_rate DECIMAL(5,2) DEFAULT 99.00,
  release_notes TEXT,
  features TEXT[] DEFAULT '{}',
  release_date TIMESTAMP WITH TIME ZONE,
  min_os_version VARCHAR(20),
  size_mb DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: my_day_tasks
-- Source: 20241214000042_batch_71_overview_myday_projects.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS my_day_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  due_time TIME,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  project_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: newsletter_subscriptions
-- Source: 20250112000001_newsletter_subscriptions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'website',
  subscription_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- Table: onboarding_programs
-- Source: 20241214000028_batch_57_bugs_recruitment_onboarding.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_code VARCHAR(50) NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  employee_email VARCHAR(200),
  role VARCHAR(200),
  department VARCHAR(100),
  employee_type VARCHAR(50) DEFAULT 'full-time',
  status VARCHAR(30) DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  days_remaining INTEGER DEFAULT 30,
  buddy_name VARCHAR(200),
  buddy_email VARCHAR(200),
  manager_name VARCHAR(200),
  manager_email VARCHAR(200),
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  equipment_provided BOOLEAN DEFAULT FALSE,
  access_granted BOOLEAN DEFAULT FALSE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: onboarding_tasks
-- Source: 20241214000028_batch_57_bugs_recruitment_onboarding.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES onboarding_programs(id) ON DELETE CASCADE,
  task_code VARCHAR(50) NOT NULL,
  task_name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(30) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_to VARCHAR(200),
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: order_items
-- Source: 20241214000023_batch_52_assets_orders_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Product Info
  product_id VARCHAR(100),
  product_name VARCHAR(300) NOT NULL,
  product_sku VARCHAR(100),
  product_image TEXT,

  -- Pricing
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Fulfillment
  fulfilled_quantity INTEGER DEFAULT 0,
  fulfillment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),

  -- Options/Variants
  variant_id VARCHAR(100),
  variant_name VARCHAR(200),
  options JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: orders
-- Source: 20241214000023_batch_52_assets_orders_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Order Reference
  order_number VARCHAR(50) NOT NULL,
  order_reference VARCHAR(100),

  -- Customer Info
  customer_name VARCHAR(200),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_avatar TEXT,

  -- Order Details
  item_count INTEGER DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold')),
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial')),
  fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled'
    CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled', 'returned')),

  -- Shipping
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(200),
  tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Shipping Address
  shipping_address_line1 VARCHAR(300),
  shipping_address_line2 VARCHAR(300),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100),

  -- Billing Address
  billing_address_line1 VARCHAR(300),
  billing_address_line2 VARCHAR(300),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100),

  -- Payment
  payment_method VARCHAR(50),
  payment_transaction_id VARCHAR(200),
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: organizations
-- Source: 20241214000001_batch_30_events_webinars.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: payroll_runs
-- Source: 20241214000029_batch_58_payroll_templates_sprints.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_code VARCHAR(50) NOT NULL,
  period VARCHAR(100) NOT NULL,
  pay_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  total_employees INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  department VARCHAR(100),
  approved_by VARCHAR(200),
  approved_date TIMESTAMP WITH TIME ZONE,
  currency VARCHAR(10) DEFAULT 'USD',
  notes TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: performance_alerts
-- Source: performance_analytics_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_category metric_category NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(12, 2),
  actual_value DECIMAL(12, 2),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: performance_analytics
-- Source: 20241214000007_batch_36_analytics_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Performance Metrics
  metric_name VARCHAR(200) NOT NULL,
  metric_category VARCHAR(100) NOT NULL,
  performance_type VARCHAR(50) NOT NULL DEFAULT 'speed'
    CHECK (performance_type IN ('speed', 'efficiency', 'quality', 'reliability', 'scalability', 'throughput', 'latency', 'uptime', 'error_rate', 'custom')),

  -- Current Performance
  current_value DECIMAL(20, 4) NOT NULL,
  previous_value DECIMAL(20, 4),
  baseline_value DECIMAL(20, 4),
  target_value DECIMAL(20, 4),
  optimal_value DECIMAL(20, 4),

  -- Performance Scoring
  performance_score DECIMAL(5, 2),
  health_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),
  efficiency_score DECIMAL(5, 2),

  -- Percentiles
  p50_value DECIMAL(20, 4),
  p75_value DECIMAL(20, 4),
  p90_value DECIMAL(20, 4),
  p95_value DECIMAL(20, 4),
  p99_value DECIMAL(20, 4),

  -- Statistics
  min_value DECIMAL(20, 4),
  max_value DECIMAL(20, 4),
  avg_value DECIMAL(20, 4),
  median_value DECIMAL(20, 4),
  std_deviation DECIMAL(20, 4),

  -- Time Period
  period_type VARCHAR(50) NOT NULL DEFAULT 'hourly'
    CHECK (period_type IN ('minute', 'hourly', 'daily', 'weekly', 'monthly', 'real_time')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  measured_at TIMESTAMPTZ DEFAULT NOW(),

  -- Resource Context
  resource_type VARCHAR(100),
  resource_id VARCHAR(200),
  environment VARCHAR(50)
    CHECK (environment IN ('production', 'staging', 'development', 'testing', 'local')),
  region VARCHAR(100),

  -- Performance Indicators
  is_degraded BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  is_optimal BOOLEAN DEFAULT false,
  degradation_reason TEXT,

  -- Trends
  trend_direction VARCHAR(20)
    CHECK (trend_direction IN ('improving', 'stable', 'degrading', 'volatile', 'unknown')),
  trend_percentage DECIMAL(10, 2),

  -- Thresholds & Alerts
  warning_threshold DECIMAL(20, 4),
  critical_threshold DECIMAL(20, 4),
  is_alert_active BOOLEAN DEFAULT false,
  alert_triggered_at TIMESTAMPTZ,
  alert_resolved_at TIMESTAMPTZ,

  -- Incident Tracking
  incident_count INTEGER DEFAULT 0,
  last_incident_at TIMESTAMPTZ,
  mttr DECIMAL(20, 2),
  mtbf DECIMAL(20, 2),

  -- Detailed Data
  timeseries JSONB DEFAULT '[]'::jsonb,
  breakdown JSONB DEFAULT '{}'::jsonb,
  correlations JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  description TEXT,
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

  CONSTRAINT performance_analytics_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT performance_analytics_period_range CHECK (period_end >= period_start)
);


-- =====================================================
-- Table: performance_benchmarks
-- Source: performance_analytics_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS performance_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category metric_category NOT NULL,
  metric_name TEXT NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  benchmark_level benchmark_level NOT NULL DEFAULT 'average',
  period performance_period NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: performance_goals
-- Source: 20241214000023_batch_52_assets_orders_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES performance_reviews(id) ON DELETE SET NULL,

  -- Goal Info
  goal_title VARCHAR(300) NOT NULL,
  goal_description TEXT,
  goal_category VARCHAR(50) DEFAULT 'performance'
    CHECK (goal_category IN ('performance', 'learning', 'career', 'project', 'behavioral', 'team', 'personal')),

  -- Assignment
  assigned_to_id VARCHAR(100),
  assigned_to_name VARCHAR(200),
  assigned_to_email VARCHAR(255),
  assigned_by_id VARCHAR(100),
  assigned_by_name VARCHAR(200),

  -- Metrics
  target_value DECIMAL(12, 2),
  current_value DECIMAL(12, 2) DEFAULT 0,
  target_unit VARCHAR(50),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Priority & Weight
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  weight DECIMAL(5, 2) DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'on_track', 'at_risk', 'completed', 'missed', 'cancelled')),

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Period
  review_period VARCHAR(50),
  review_year INTEGER,
  review_quarter VARCHAR(10),

  -- Notes
  notes TEXT,
  blockers TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: performance_snapshots
-- Source: performance_analytics_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  period performance_period NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_projects INTEGER NOT NULL DEFAULT 0,
  total_clients INTEGER NOT NULL DEFAULT 0,
  avg_efficiency DECIMAL(5, 2) NOT NULL DEFAULT 0,
  top_performing_projects JSONB DEFAULT '[]'::JSONB,
  top_clients JSONB DEFAULT '[]'::JSONB,
  performance_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: permissions
-- Source: 20241214000021_batch_50_logs_audit_permissions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permission Details
  permission_key VARCHAR(200) NOT NULL,
  permission_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Resource
  resource VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),

  -- Actions
  actions TEXT[] DEFAULT ARRAY['read'],
  allowed_actions TEXT[],
  denied_actions TEXT[],

  -- Classification
  category VARCHAR(50),
  permission_group VARCHAR(100),
  is_system BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Scope
  scope VARCHAR(50) DEFAULT 'all',
  scope_conditions JSONB,

  -- Roles
  assigned_roles TEXT[],
  role_count INTEGER DEFAULT 0,

  -- Dependencies
  requires_permissions TEXT[],
  conflicts_with TEXT[],

  -- Metadata
  priority INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: polls
-- Source: 20241214000003_batch_32_feedback_engagement.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS polls (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  question TEXT NOT NULL,
  description TEXT,
  poll_type VARCHAR(50) NOT NULL DEFAULT 'single-choice'
    CHECK (poll_type IN ('single-choice', 'multiple-choice', 'rating', 'ranking', 'open-ended')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Options
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  option_count INTEGER DEFAULT 0,
  allow_custom_options BOOLEAN DEFAULT FALSE,
  randomize_options BOOLEAN DEFAULT FALSE,

  -- Voting Settings
  allow_multiple_votes BOOLEAN DEFAULT FALSE,
  require_authentication BOOLEAN DEFAULT TRUE,
  allow_anonymous BOOLEAN DEFAULT FALSE,
  show_results_before_voting BOOLEAN DEFAULT FALSE,
  show_results_after_voting BOOLEAN DEFAULT TRUE,

  -- Timing
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  duration_hours INTEGER,

  -- Voting Results
  total_votes INTEGER DEFAULT 0,
  total_voters INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}'::jsonb,
  winner_option_id VARCHAR(100),

  -- Engagement
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Display Settings
  display_mode VARCHAR(50) DEFAULT 'standard'
    CHECK (display_mode IN ('standard', 'compact', 'card', 'banner')),
  show_vote_count BOOLEAN DEFAULT TRUE,
  show_percentage BOOLEAN DEFAULT TRUE,
  show_voter_names BOOLEAN DEFAULT FALSE,

  -- Access Control
  is_public BOOLEAN DEFAULT TRUE,
  target_audience VARCHAR(50) DEFAULT 'all'
    CHECK (target_audience IN ('all', 'members', 'followers', 'custom')),
  allowed_voters JSONB DEFAULT '[]'::jsonb,

  -- Location & Context
  embedded_in_page VARCHAR(255),
  location VARCHAR(255),
  context JSONB DEFAULT '{}'::jsonb,

  -- Features
  enable_comments BOOLEAN DEFAULT TRUE,
  enable_sharing BOOLEAN DEFAULT TRUE,
  enable_notifications BOOLEAN DEFAULT TRUE,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: portfolio_video_analytics
-- Source: 20240327000001_freelancer_analytics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_video_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES portfolio_videos(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    average_watch_time DECIMAL(10,2) DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    client_interactions INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: portfolio_videos
-- Source: 20240327000000_freelancer_video_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    category VARCHAR(50),
    skills TEXT[] DEFAULT '{}',
    client_testimonial TEXT,
    insights JSONB DEFAULT '{}',
    chapters JSONB DEFAULT '[]',
    transcription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: pricing_plans
-- Source: 20241215000007_batch_78_investor_leads_pricing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) DEFAULT 0,
  annual_price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  subscribers_count INTEGER DEFAULT 0,
  revenue_monthly DECIMAL(15,2) DEFAULT 0,
  revenue_annual DECIMAL(15,2) DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  upgrade_rate DECIMAL(5,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: pricing_recommendations
-- Source: ai_business_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier pricing_tier NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  target_client TEXT NOT NULL,
  market_analysis TEXT NOT NULL,
  competitive_position TEXT,
  rate_increase_strategy TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_years INTEGER,
  market TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: product_variants
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  variant_name VARCHAR(200) NOT NULL,
  sku VARCHAR(100),
  price DECIMAL(12, 2) DEFAULT 0,
  compare_at_price DECIMAL(12, 2),

  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT false,

  -- Attributes
  attributes JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: products
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Product Details
  product_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'subscription'
    CHECK (category IN ('subscription', 'one_time', 'add_on', 'bundle', 'freemium', 'enterprise', 'other')),
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived', 'discontinued', 'coming_soon')),

  -- Pricing
  price DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) DEFAULT 'monthly'
    CHECK (billing_cycle IN ('one_time', 'monthly', 'quarterly', 'yearly', 'custom')),

  -- Metrics
  active_users INTEGER DEFAULT 0,
  total_revenue DECIMAL(14, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  growth_rate DECIMAL(5, 2) DEFAULT 0,

  -- Features
  features JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  -- Media
  thumbnail_url TEXT,
  images TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: project_activity
-- Source: 20241211000001_upf_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS project_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: project_analyses
-- Source: ai_business_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS project_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  project_name TEXT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  timeline INTEGER NOT NULL,
  client_type TEXT NOT NULL,
  scope TEXT,
  profitability_score INTEGER NOT NULL CHECK (profitability_score >= 0 AND profitability_score <= 100),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  estimated_profit DECIMAL(12, 2) NOT NULL,
  estimated_margin DECIMAL(5, 2) NOT NULL,
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: project_files
-- Source: 20241211000001_upf_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS project_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: project_tasks
-- Source: 20241214000042_batch_71_overview_myday_projects.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID,
  due_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: qa_test_cases
-- Source: 20241214000027_batch_56_training_qa_testing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS qa_test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_code VARCHAR(50) NOT NULL,
  test_name VARCHAR(300) NOT NULL,
  description TEXT,
  test_type VARCHAR(50) DEFAULT 'functional',
  status VARCHAR(30) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assignee_name VARCHAR(200),
  assignee_email VARCHAR(200),
  last_run_at TIMESTAMP WITH TIME ZONE,
  duration_seconds DECIMAL(10,2) DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT 0,
  is_automated BOOLEAN DEFAULT FALSE,
  environment VARCHAR(100),
  build_version VARCHAR(50),
  preconditions TEXT,
  test_steps JSONB DEFAULT '[]',
  expected_result TEXT,
  actual_result TEXT,
  attachments JSONB DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: qa_test_executions
-- Source: 20241214000027_batch_56_training_qa_testing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS qa_test_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES qa_test_cases(id) ON DELETE CASCADE,
  execution_status VARCHAR(30) DEFAULT 'pending',
  executed_by VARCHAR(200),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds DECIMAL(10,2) DEFAULT 0,
  environment VARCHAR(100),
  build_version VARCHAR(50),
  result VARCHAR(30),
  error_message TEXT,
  logs TEXT,
  screenshots JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: rate_limit_tiers
-- Source: 20241215000013_api_keys_rate_limits.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_limit_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_name VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (tier_name IN ('free', 'starter', 'professional', 'enterprise')),
  requests_limit INTEGER DEFAULT 1000,
  requests_used INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: recommendation_feedback
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(255) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL, -- 'helpful', 'not_helpful', 'implemented'
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: recommendation_history
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'viewed', -- 'viewed', 'in_progress', 'implemented', 'dismissed'
    results JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    implemented_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: recommendation_preferences
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    industry VARCHAR(100),
    business_type VARCHAR(100),
    goals JSONB DEFAULT '[]',
    experience_level VARCHAR(50),
    budget_level VARCHAR(50),
    preferred_categories JSONB DEFAULT '[]',
    excluded_categories JSONB DEFAULT '[]',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: release_notes
-- Source: 20241215000010_batch_81_release_help_support.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled', 'archived')),
  release_type VARCHAR(20) DEFAULT 'minor' CHECK (release_type IN ('major', 'minor', 'patch', 'hotfix')),
  platform VARCHAR(20) DEFAULT 'all' CHECK (platform IN ('web', 'mobile', 'api', 'desktop', 'all')),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  author VARCHAR(100),
  highlights TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  bug_fixes TEXT[] DEFAULT '{}',
  breaking_changes TEXT[] DEFAULT '{}',
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: releases
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Release Details
  version VARCHAR(50) NOT NULL,
  release_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'rolling', 'deployed', 'failed', 'rolled_back')),
  environment VARCHAR(50) DEFAULT 'production'
    CHECK (environment IN ('development', 'staging', 'production', 'all')),

  -- Deployment Info
  deployed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  deploy_time_minutes DECIMAL(6, 2),

  -- Metrics
  commits_count INTEGER DEFAULT 0,
  contributors_count INTEGER DEFAULT 0,
  coverage_percentage DECIMAL(5, 2) DEFAULT 0,
  rollback_rate DECIMAL(5, 2) DEFAULT 0,

  -- Changelog
  changelog JSONB DEFAULT '[]',
  breaking_changes TEXT[],

  -- Metadata
  git_branch VARCHAR(200),
  git_tag VARCHAR(100),
  build_number VARCHAR(100),
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: renewals
-- Source: 20241214000031_batch_60_health_renewals_surveys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renewal_code VARCHAR(20) UNIQUE NOT NULL,

  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_id UUID,

  -- Renewal status
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-negotiation', 'renewed', 'churned', 'at-risk')),
  renewal_type VARCHAR(50) DEFAULT 'flat' CHECK (renewal_type IN ('expansion', 'flat', 'contraction', 'downgrade')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),

  -- Financial
  current_arr DECIMAL(15,2) DEFAULT 0,
  proposed_arr DECIMAL(15,2) DEFAULT 0,
  expansion_value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',

  -- Dates
  renewal_date DATE,
  days_to_renewal INTEGER DEFAULT 0,
  contract_term INTEGER DEFAULT 12,

  -- Probability and health
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),

  -- Management
  csm_name VARCHAR(255),
  csm_email VARCHAR(255),
  last_contact_date DATE,
  meetings_scheduled INTEGER DEFAULT 0,
  proposal_sent BOOLEAN DEFAULT FALSE,
  proposal_sent_date DATE,

  -- Notes
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: report_filters
-- Source: custom_reports_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS report_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES report_widgets(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  operator TEXT NOT NULL,
  value JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT filter_parent_check CHECK (
    (report_id IS NOT NULL AND widget_id IS NULL) OR
    (report_id IS NULL AND widget_id IS NOT NULL)
  )
);


-- =====================================================
-- Table: report_shares
-- Source: custom_reports_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS report_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_export BOOLEAN NOT NULL DEFAULT true,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: report_widgets
-- Source: custom_reports_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS report_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  type widget_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 6,
  height INTEGER NOT NULL DEFAULT 4,
  chart_type chart_type,
  data_source TEXT NOT NULL,
  data_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  aggregation TEXT,
  group_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  settings JSONB DEFAULT '{}'::JSONB,
  widget_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: resource_skills
-- Source: 20241214000030_batch_59_milestones_resources_allocation.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level INTEGER DEFAULT 3, -- 1-5 scale
  years_experience DECIMAL(4, 1) DEFAULT 0,
  certified BOOLEAN DEFAULT FALSE,
  certification_date DATE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: resource_usage_logs
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    action TEXT NOT NULL,
    storage_used BIGINT,
    bandwidth_used BIGINT,
    processing_time INTEGER,
    cost DECIMAL(10,4),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: revenue_analytics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_revenue NUMERIC(12,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    average_order_value NUMERIC(10,2),
    refunds NUMERIC(12,2) DEFAULT 0,
    net_revenue NUMERIC(12,2),
    revenue_by_source JSONB DEFAULT '{}',
    revenue_by_product JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);


-- =====================================================
-- Table: revenue_entries
-- Source: 20241215000003_batch_74_team_profile_reports.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Entry details
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  type VARCHAR(50) DEFAULT 'income' CHECK (type IN ('income', 'expense', 'refund')),
  category VARCHAR(100),

  -- Source
  source VARCHAR(100),
  source_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Date
  entry_date DATE DEFAULT CURRENT_DATE,

  -- Description
  description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: review_approvals
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS review_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    review_id UUID NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES review_stages(id) ON DELETE CASCADE,
    
    -- Approver information
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_email VARCHAR(255), -- For external reviewers
    
    -- Approval details
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'changes_requested'
    )),
    feedback TEXT,
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique approval per user per stage
    UNIQUE(review_id, stage_id, user_id),
    UNIQUE(review_id, stage_id, reviewer_email),
    
    -- At least one identifier required
    CHECK (user_id IS NOT NULL OR reviewer_email IS NOT NULL)
);


-- =====================================================
-- Table: review_collaborators
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS review_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    review_id UUID NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Collaboration details
    role VARCHAR(50) DEFAULT 'reviewer' CHECK (role IN (
        'owner', 'reviewer', 'observer', 'client'
    )),
    
    -- Permissions
    can_approve BOOLEAN DEFAULT true,
    can_comment BOOLEAN DEFAULT true,
    can_edit_review BOOLEAN DEFAULT false,
    
    -- Stage-specific access (JSON array of stage IDs)
    stage_access JSONB DEFAULT '[]', -- Empty = all stages
    
    -- Invitation details
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'active', 'inactive'
    )),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique collaboration
    UNIQUE(review_id, user_id)
);


-- =====================================================
-- Table: review_notifications
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS review_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    review_id UUID NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'review_created', 'approval_requested', 'stage_completed', 
        'review_approved', 'review_rejected', 'changes_requested',
        'deadline_reminder', 'review_updated'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Delivery tracking
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional data (JSON)
