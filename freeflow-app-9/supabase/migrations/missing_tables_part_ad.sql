    data JSONB DEFAULT '{}'
);


-- =====================================================
-- Table: review_sessions
-- Source: 20240327000000_freelancer_video_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'needs_changes')),
    client_feedback TEXT[] DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    chapters JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: review_stages
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS review_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Association
    review_id UUID NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
    
    -- Stage details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    
    -- Approval requirements
    required_approvals INTEGER DEFAULT 1,
    auto_advance BOOLEAN DEFAULT false,
    
    -- Timing constraints
    deadline_hours INTEGER, -- Hours from stage start
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'active', 'completed', 'skipped'
    )),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique order within review
    UNIQUE(review_id, order_index)
);


-- =====================================================
-- Table: review_templates
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS review_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'custom',
    
    -- Template configuration
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    
    -- Stage configuration (JSON array of stage definitions)
    stages_config JSONB NOT NULL DEFAULT '[]',
    
    -- Default settings
    default_settings JSONB DEFAULT '{
        "allow_comments": true,
        "require_all_approvals": true,
        "auto_advance_stages": false,
        "send_notifications": true
    }',
    
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: roadmap_initiatives
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS roadmap_initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Initiative Details
  title VARCHAR(300) NOT NULL,
  description TEXT,

  -- Planning
  quarter VARCHAR(10),
  year INTEGER,
  theme VARCHAR(100),
  team VARCHAR(100),

  -- Status & Progress
  status VARCHAR(20) DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Impact & Effort
  impact VARCHAR(20) DEFAULT 'medium'
    CHECK (impact IN ('low', 'medium', 'high', 'very_high', 'critical')),
  effort VARCHAR(20) DEFAULT 'medium'
    CHECK (effort IN ('small', 'medium', 'large', 'extra_large')),

  -- Stakeholders
  stakeholders TEXT[],
  owner_id UUID REFERENCES auth.users(id),

  -- Dates
  start_date DATE,
  target_date DATE,
  completed_date DATE,

  -- Metadata
  tags TEXT[],
  dependencies UUID[],
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: roadmap_milestones
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Milestone Details
  milestone_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Dates
  target_date DATE NOT NULL,
  completed_date DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'planned'
    CHECK (status IN ('planned', 'on_track', 'at_risk', 'delayed', 'completed')),

  -- Metrics
  initiatives_count INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: role_assignments
-- Source: 20241214000037_batch_66_backups_maintenance_roles.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Assignment Info
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(role_id, assigned_user_id)
);


-- =====================================================
-- Table: roles
-- Source: 20241214000021_batch_50_logs_audit_permissions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role Details
  role_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  description TEXT,

  -- Classification
  role_level VARCHAR(20) DEFAULT 'standard'
    CHECK (role_level IN ('system', 'admin', 'manager', 'standard', 'basic', 'guest')),
  role_type VARCHAR(50) DEFAULT 'custom'
    CHECK (role_type IN ('system', 'built-in', 'custom')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT true,
  is_deletable BOOLEAN DEFAULT true,

  -- Permissions
  permissions TEXT[],
  permission_groups TEXT[],
  inherited_from UUID,

  -- Scope
  scope VARCHAR(50) DEFAULT 'organization',
  scope_id VARCHAR(100),

  -- Limits
  max_users INTEGER DEFAULT 0,
  current_users INTEGER DEFAULT 0,

  -- Metadata
  color VARCHAR(50),
  icon VARCHAR(50),
  priority INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB,

  -- Audit
  created_by VARCHAR(255),
  updated_by VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: route_stops
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES logistics_routes(id) ON DELETE CASCADE NOT NULL,
  stop_number INTEGER NOT NULL,
  stop_type TEXT DEFAULT 'delivery' CHECK (stop_type IN ('pickup', 'delivery', 'transfer', 'checkpoint', 'fuel', 'rest')),
  address JSONB DEFAULT '{}',
  city TEXT,
  postal_code TEXT,
  country TEXT,
  recipient_name TEXT,
  recipient_phone TEXT,
  packages_count INTEGER DEFAULT 0,
  packages_delivered INTEGER DEFAULT 0,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'completed', 'skipped', 'failed')),
  signature_collected BOOLEAN DEFAULT FALSE,
  signature_url TEXT,
  photo_proof_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: sales_activities
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES sales_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  outcome VARCHAR(100),
  duration_minutes INTEGER,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: sales_deals
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_code VARCHAR(20) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Company/Contact Info
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_title VARCHAR(100),

  -- Deal Details
  deal_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  deal_type VARCHAR(50),

  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  team_id UUID,

  -- Source
  lead_source VARCHAR(100),
  campaign_id UUID,
  referral_source VARCHAR(255),

  -- Win/Loss
  won_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,
  lost_reason TEXT,
  competitor VARCHAR(255),

  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: sales_pipeline_stages
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  stage_order INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  color VARCHAR(50),
  is_won_stage BOOLEAN DEFAULT false,
  is_lost_stage BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: security_audits
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS security_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  audit_code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  audit_type TEXT DEFAULT 'compliance' CHECK (audit_type IN ('access-control', 'data-encryption', 'compliance', 'penetration-test', 'code-review', 'infrastructure')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'passed', 'failed', 'warning', 'cancelled')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  compliance_standards TEXT[] DEFAULT '{}',
  audited_by TEXT,
  auditor_email TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  findings_critical INTEGER DEFAULT 0,
  findings_high INTEGER DEFAULT 0,
  findings_medium INTEGER DEFAULT 0,
  findings_low INTEGER DEFAULT 0,
  total_recommendations INTEGER DEFAULT 0,
  remediated_count INTEGER DEFAULT 0,
  security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
  report_url TEXT,
  schedule_cron TEXT,
  next_scheduled_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: seo_backlinks
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_domain VARCHAR(255) NOT NULL,
  target_url TEXT NOT NULL,

  -- Metrics
  domain_authority INTEGER DEFAULT 0,
  page_authority INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  trust_flow INTEGER DEFAULT 0,
  citation_flow INTEGER DEFAULT 0,

  -- Link Details
  anchor_text VARCHAR(500),
  link_type VARCHAR(50) DEFAULT 'dofollow',
  is_active BOOLEAN DEFAULT true,

  -- Traffic
  referral_traffic INTEGER DEFAULT 0,

  -- Dates
  first_seen_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: seo_keywords
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,

  -- Rankings
  current_position INTEGER,
  previous_position INTEGER,
  best_position INTEGER,
  position_change INTEGER DEFAULT 0,
  trend VARCHAR(20) DEFAULT 'stable',

  -- Metrics
  search_volume INTEGER DEFAULT 0,
  keyword_difficulty INTEGER DEFAULT 0,
  cpc DECIMAL(10,4),
  competition DECIMAL(5,4),

  -- Traffic
  estimated_traffic INTEGER DEFAULT 0,
  actual_traffic INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2),

  -- Targeting
  target_url TEXT,
  target_page_title VARCHAR(255),
  is_tracking BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,

  -- Dates
  first_ranked_at TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE,

  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: seo_pages
-- Source: 20241214000021_batch_69_marketing_sales_seo.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title VARCHAR(255),
  meta_description TEXT,

  -- Technical
  page_speed_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  core_web_vitals_score INTEGER DEFAULT 0,

  -- Content
  word_count INTEGER DEFAULT 0,
  heading_structure JSONB DEFAULT '{}',
  image_count INTEGER DEFAULT 0,
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,

  -- Performance
  organic_traffic INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  avg_position DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTEGER DEFAULT 0,

  -- Status
  is_indexed BOOLEAN DEFAULT true,
  has_sitemap BOOLEAN DEFAULT true,
  has_robots BOOLEAN DEFAULT true,
  has_canonical BOOLEAN DEFAULT true,
  has_structured_data BOOLEAN DEFAULT false,

  -- Issues
  issues JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',

  last_crawled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: server_metrics
-- Source: 20241214000025_batch_54_monitoring_builds_audit_logs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS server_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- cpu, memory, disk, network, requests
  metric_value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'percent',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);


-- =====================================================
-- Table: servers
-- Source: 20241214000025_batch_54_monitoring_builds_audit_logs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  server_name VARCHAR(200) NOT NULL,
  server_type VARCHAR(50) DEFAULT 'production', -- production, database, cache, worker, network, storage
  status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, critical, offline
  location VARCHAR(100),
  ip_address VARCHAR(50),
  cpu_usage DECIMAL(5, 2) DEFAULT 0,
  memory_usage DECIMAL(5, 2) DEFAULT 0,
  disk_usage DECIMAL(5, 2) DEFAULT 0,
  network_throughput DECIMAL(10, 2) DEFAULT 0, -- MB/s
  uptime_percentage DECIMAL(6, 3) DEFAULT 100.000,
  requests_per_hour INTEGER DEFAULT 0,
  last_health_check TIMESTAMPTZ DEFAULT NOW(),
  configuration JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: session_messages
-- Source: ai_business_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES advisory_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: share_access_logs
-- Source: 20240326000001_enhanced_sharing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS share_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
    accessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'comment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: share_analytics
-- Source: 20240326000001_enhanced_sharing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS share_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    average_view_duration INTEGER,
    locations JSONB DEFAULT '{}',
    devices JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(share_id, date)
);


-- =====================================================
-- Table: share_links
-- Source: 20240326000001_enhanced_sharing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    title TEXT,
    description TEXT,
    access_code TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    permissions JSONB DEFAULT '{"download": false, "share": false, "comment": true}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: shipment_tracking
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,

  -- Event Info
  status VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),

  -- Timestamp
  event_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: shipments
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_code VARCHAR(20) UNIQUE DEFAULT ('SHP-' || LPAD(nextval('shipments_seq')::text, 6, '0')),

  -- Tracking
  tracking_number VARCHAR(100),
  order_id VARCHAR(100),

  -- Status
  status VARCHAR(30) DEFAULT 'pending', -- pending, processing, shipped, in_transit, delivered, failed, returned, cancelled

  -- Shipping Method & Carrier
  method VARCHAR(30) DEFAULT 'standard', -- standard, express, overnight, international, freight
  carrier VARCHAR(50), -- fedex, ups, usps, dhl, amazon, local, other

  -- Origin
  origin_address TEXT,
  origin_city VARCHAR(100),
  origin_state VARCHAR(100),
  origin_country VARCHAR(100) DEFAULT 'US',
  origin_postal VARCHAR(20),

  -- Destination
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  destination_address TEXT,
  destination_city VARCHAR(100),
  destination_state VARCHAR(100),
  destination_country VARCHAR(100) DEFAULT 'US',
  destination_postal VARCHAR(20),

  -- Package Details
  item_count INTEGER DEFAULT 1,
  weight_lbs DECIMAL(10,2) DEFAULT 0,
  dimensions_length DECIMAL(10,2),
  dimensions_width DECIMAL(10,2),
  dimensions_height DECIMAL(10,2),

  -- Costs
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  insurance_value DECIMAL(10,2) DEFAULT 0,
  declared_value DECIMAL(10,2) DEFAULT 0,

  -- Dates
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,

  -- Options
  priority BOOLEAN DEFAULT false,
  signature_required BOOLEAN DEFAULT false,
  insurance_enabled BOOLEAN DEFAULT false,

  -- Labels
  label_url VARCHAR(500),
  label_created_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  delivery_instructions TEXT,

  -- Tags & Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: shipping_carriers
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS shipping_carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Carrier Info
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  logo_url VARCHAR(500),

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive

  -- Stats
  total_shipments INTEGER DEFAULT 0,
  on_time_rate DECIMAL(5,2) DEFAULT 100,
  avg_delivery_days DECIMAL(5,2) DEFAULT 0,

  -- API Config
  api_key_encrypted VARCHAR(500),
  api_config JSONB DEFAULT '{}',

  -- Features
  supports_tracking BOOLEAN DEFAULT true,
  supports_labels BOOLEAN DEFAULT true,
  supports_rates BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: skills_performance
-- Source: 20240327000001_freelancer_analytics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS skills_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    projects_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    demand_score DECIMAL(3,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: social_accounts
-- Source: 20241214000041_batch_70_email_marketing_social_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'threads')),
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_username TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  permissions TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: social_analytics
-- Source: 20241214000041_batch_70_email_marketing_social_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  followers_change INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: social_posts
-- Source: 20241214000041_batch_70_email_marketing_social_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_code TEXT NOT NULL DEFAULT ('SOC-' || LPAD(nextval('social_post_seq')::text, 6, '0')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'carousel', 'story', 'reel', 'link')),
  platforms TEXT[] NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'deleted')),
  author TEXT,
  media_urls TEXT[],
  thumbnail_url TEXT,
  link_url TEXT,
  link_preview JSONB DEFAULT '{}',
  hashtags TEXT[],
  mentions TEXT[],
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement DECIMAL(5, 2) DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  platform_post_ids JSONB DEFAULT '{}',
  is_trending BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: sprint_tasks
-- Source: 20241214000029_batch_58_payroll_templates_sprints.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  task_code VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  assignee_name VARCHAR(200),
  assignee_email VARCHAR(200),
  story_points INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  estimated_hours DECIMAL(6,2) DEFAULT 0,
  actual_hours DECIMAL(6,2) DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  labels TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: sprints
-- Source: 20241214000029_batch_58_payroll_templates_sprints.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_code VARCHAR(50) NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  days_remaining INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  in_progress_tasks INTEGER DEFAULT 0,
  blocked_tasks INTEGER DEFAULT 0,
  velocity INTEGER DEFAULT 0,
  team_name VARCHAR(200),
  scrum_master VARCHAR(200),
  capacity INTEGER DEFAULT 0,
  committed INTEGER DEFAULT 0,
  burned INTEGER DEFAULT 0,
  goal TEXT,
  retrospective TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: stock_levels
-- Source: 20241214000026_batch_55_tickets_warehouse_stock.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES warehouse_zones(id) ON DELETE SET NULL,
  product_name VARCHAR(300) NOT NULL,
  sku VARCHAR(100),
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_quantity INTEGER DEFAULT 0,
  unit_cost DECIMAL(12, 2) DEFAULT 0,
  total_value DECIMAL(14, 2) DEFAULT 0,
  last_movement_date TIMESTAMPTZ,
  last_count_date TIMESTAMPTZ,
  location_code VARCHAR(100),
  batch_number VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: stock_movements
-- Source: 20241214000026_batch_55_tickets_warehouse_stock.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movement_number VARCHAR(50) NOT NULL,
  movement_type VARCHAR(30) NOT NULL, -- inbound, outbound, transfer, adjustment
  product_name VARCHAR(300) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  total_value DECIMAL(14, 2) DEFAULT 0,
  from_location VARCHAR(200),
  to_location VARCHAR(200),
  from_warehouse_id UUID REFERENCES warehouses(id),
  to_warehouse_id UUID REFERENCES warehouses(id),
  reference_number VARCHAR(100),
  reference_type VARCHAR(50), -- PO, SO, TRF, ADJ
  status VARCHAR(30) DEFAULT 'pending', -- pending, in-transit, completed, cancelled
  operator_name VARCHAR(200),
  operator_id UUID REFERENCES auth.users(id),
  notes TEXT,
  batch_number VARCHAR(100),
  expiry_date DATE,
  metadata JSONB DEFAULT '{}',
  movement_date TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: storage_analytics
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS storage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    total_files INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    files_added INTEGER DEFAULT 0,
    files_deleted INTEGER DEFAULT 0,
    bandwidth_used_bytes BIGINT DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, provider_id)
);


-- =====================================================
-- Table: storage_optimization_jobs
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS storage_optimization_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL CHECK (job_type IN ('tier_migration', 'deduplication', 'compression', 'cleanup')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    files_processed INTEGER DEFAULT 0,
    bytes_saved BIGINT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: storage_tiers
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS storage_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    cost_per_gb DECIMAL(10,4) NOT NULL,
    min_storage_days INTEGER,
    max_storage_days INTEGER,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: store_apps
-- Source: 20241214000035_batch_64_api_appstore_audio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS store_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_code VARCHAR(20) UNIQUE DEFAULT ('APP-' || LPAD(nextval('store_apps_seq')::text, 6, '0')),

  -- App Info
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  description TEXT,
  developer VARCHAR(255),
  icon_url TEXT,
  banner_url TEXT,
  screenshots TEXT[] DEFAULT '{}',

  -- Categorization
  category VARCHAR(50) DEFAULT 'utilities', -- business, productivity, creative, finance, education, utilities, developer, social
  subcategory VARCHAR(50),

  -- Pricing
  pricing_type VARCHAR(20) DEFAULT 'free', -- free, freemium, paid, subscription, enterprise
  price DECIMAL(10,2) DEFAULT 0,
  price_currency VARCHAR(3) DEFAULT 'USD',
  trial_days INTEGER DEFAULT 0,

  -- Installation Status (per user)
  status VARCHAR(20) DEFAULT 'available', -- installed, available, updating, trial, suspended
  installed_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,

  -- Version Info
  version VARCHAR(20) DEFAULT '1.0.0',
  min_version VARCHAR(20),
  size_bytes BIGINT DEFAULT 0,
  release_date DATE,
  last_updated DATE,

  -- Stats
  downloads INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,

  -- Features & Compatibility
  features TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}', -- Web, iOS, Android, Desktop
  languages INTEGER DEFAULT 1,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: support_agents
-- Source: 20241215000010_batch_81_release_help_support.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'away', 'offline')),
  active_conversations INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,
  resolved_today INTEGER DEFAULT 0,
  availability VARCHAR(100),
  specializations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: support_channels
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS support_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel Info
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL, -- email, chat, phone, self_service
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance

  -- Stats
  total_tickets INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,

  -- Configuration
  config JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: support_conversations
-- Source: 20241215000010_batch_81_release_help_support.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES support_agents(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255),
  conversation_type VARCHAR(20) DEFAULT 'chat' CHECK (conversation_type IN ('chat', 'email', 'phone', 'video')),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('active', 'waiting', 'closed')),
  subject VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  wait_time INTEGER DEFAULT 0,
  messages_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: support_ticket_replies
-- Source: 20241214000038_batch_67_support_helpcenter_shipping.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Reply Info
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  reply_type VARCHAR(20) DEFAULT 'reply', -- reply, note, system

  -- Author
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(255),
  author_type VARCHAR(20) DEFAULT 'agent', -- agent, customer, system

  -- Attachments
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: support_tickets
-- Source: 20241214000026_batch_55_tickets_warehouse_stock.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) NOT NULL,
  subject VARCHAR(300) NOT NULL,
  description TEXT,
  customer_name VARCHAR(200),
  customer_email VARCHAR(255),
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(30) DEFAULT 'open', -- open, in-progress, pending, resolved, closed
  category VARCHAR(100),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_name VARCHAR(200),
  sla_status VARCHAR(30) DEFAULT 'on_track', -- on_track, at_risk, breached, met
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  message_count INTEGER DEFAULT 0,
  attachment_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: survey_questions
-- Source: 20241214000031_batch_60_health_renewals_surveys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Question details
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple-choice' CHECK (question_type IN ('multiple-choice', 'single-choice', 'text', 'rating', 'nps', 'csat', 'matrix')),
  required BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,

  -- Options for choice questions
  options JSONB DEFAULT '[]'::JSONB,

  -- Settings
  min_value INTEGER,
  max_value INTEGER,
  placeholder TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: survey_responses
-- Source: 20241214000031_batch_60_health_renewals_surveys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Respondent info
  respondent_email VARCHAR(255),
  respondent_name VARCHAR(255),

  -- Response data
  responses JSONB DEFAULT '{}'::JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'complete' CHECK (status IN ('in-progress', 'complete', 'abandoned')),
  completion_time INTEGER DEFAULT 0,

  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: surveys
-- Source: 20241214000031_batch_60_health_renewals_surveys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_code VARCHAR(20) UNIQUE NOT NULL,

  -- Survey information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_type VARCHAR(50) DEFAULT 'customer-feedback' CHECK (survey_type IN ('nps', 'csat', 'customer-feedback', 'employee-engagement', 'market-research', 'product-feedback')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Authorship
  created_by VARCHAR(255),
  created_by_id UUID,

  -- Survey config
  total_questions INTEGER DEFAULT 0,
  target_responses INTEGER DEFAULT 100,

  -- Response stats
  total_responses INTEGER DEFAULT 0,
  sent_to INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  average_time DECIMAL(5,2) DEFAULT 0,

  -- Scores
  nps_score INTEGER,
  csat_score DECIMAL(3,1),

  -- Dates
  published_date TIMESTAMP WITH TIME ZONE,
  closed_date TIMESTAMP WITH TIME ZONE,

  -- Tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: system_insights
-- Source: 20241214000007_batch_36_analytics_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS system_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Insight Details
  insight_type VARCHAR(50) NOT NULL DEFAULT 'observation'
    CHECK (insight_type IN ('observation', 'anomaly', 'trend', 'pattern', 'recommendation', 'prediction', 'alert', 'opportunity', 'risk')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Severity & Priority
  severity VARCHAR(20) NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  impact_level VARCHAR(20)
    CHECK (impact_level IN ('minimal', 'low', 'medium', 'high', 'severe')),

  -- Confidence & Reliability
  confidence_score DECIMAL(5, 2) DEFAULT 0.00,
  reliability_score DECIMAL(5, 2) DEFAULT 0.00,
  accuracy_rate DECIMAL(5, 2),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'acknowledged', 'investigating', 'resolved', 'dismissed', 'archived')),

  -- Related Data
  affected_metric VARCHAR(200),
  metric_value DECIMAL(20, 4),
  expected_value DECIMAL(20, 4),
  deviation DECIMAL(20, 4),
  deviation_percent DECIMAL(10, 2),

  -- Time Context
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Source & Detection
  detection_method VARCHAR(100),
  data_source VARCHAR(100),
  algorithm VARCHAR(100),

  -- Recommendations
  recommended_action TEXT,
  action_taken TEXT,
  action_taken_at TIMESTAMPTZ,
  action_taken_by UUID REFERENCES auth.users(id),

  -- Impact Assessment
  estimated_impact TEXT,
  actual_impact TEXT,
  affected_users INTEGER,
  affected_resources TEXT[],

  -- Root Cause
  root_cause TEXT,
  contributing_factors TEXT[],

  -- Related Insights
  related_insight_ids UUID[],
  parent_insight_id UUID REFERENCES system_insights(id),

  -- Patterns
  is_recurring BOOLEAN DEFAULT false,
  recurrence_count INTEGER DEFAULT 0,
  last_occurrence_at TIMESTAMPTZ,
  frequency VARCHAR(50),

  -- Supporting Data
  evidence JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  visualizations JSONB DEFAULT '[]'::jsonb,

  -- User Interaction
  viewed_by UUID[],
  viewed_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,

  -- Metadata
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

  CONSTRAINT system_insights_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: system_logs
-- Source: 20241214000021_batch_50_logs_audit_permissions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Log Entry
  log_level VARCHAR(20) DEFAULT 'info'
    CHECK (log_level IN ('error', 'warn', 'info', 'debug', 'trace')),
  log_source VARCHAR(50) DEFAULT 'api'
    CHECK (log_source IN ('api', 'database', 'auth', 'worker', 'scheduler', 'webhook', 'integration', 'system')),
  message TEXT NOT NULL,
  details TEXT,

  -- Request Context
  request_id VARCHAR(100),
  session_id VARCHAR(100),
  correlation_id VARCHAR(100),

  -- HTTP Context
  http_method VARCHAR(10),
  http_path VARCHAR(500),
  http_status_code INTEGER,
  response_time_ms INTEGER,

  -- User Context
  actor_user_id UUID,
  actor_email VARCHAR(255),
  actor_ip_address VARCHAR(45),
  actor_user_agent TEXT,

  -- Error Details
  error_code VARCHAR(100),
  error_stack TEXT,
  error_type VARCHAR(100),

  -- Classification
  category VARCHAR(50),
  tags TEXT[],
  severity VARCHAR(20) DEFAULT 'low'
    CHECK (severity IN ('critical', 'high', 'medium', 'low')),

  -- Environment
  environment VARCHAR(20) DEFAULT 'production',
  server_hostname VARCHAR(100),
  server_region VARCHAR(50),

  -- Metadata
  metadata JSONB,
  context JSONB,

  -- Retention
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE,
  retention_days INTEGER DEFAULT 30,

  -- Timestamps
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: team_management
-- Source: 20241214000008_batch_37_admin_management.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS team_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Team Details
  team_name VARCHAR(300) NOT NULL,
  team_code VARCHAR(100) UNIQUE,
  description TEXT,
  team_type VARCHAR(50) NOT NULL DEFAULT 'department'
    CHECK (team_type IN ('department', 'project', 'functional', 'cross_functional', 'temporary', 'permanent', 'virtual', 'custom')),

  -- Leadership
  team_lead_id UUID REFERENCES auth.users(id),
  manager_id UUID REFERENCES auth.users(id),
  sponsor_id UUID REFERENCES auth.users(id),

  -- Status & Settings
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived', 'forming', 'suspended')),
  visibility VARCHAR(50) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private', 'restricted', 'secret')),
  join_policy VARCHAR(50) DEFAULT 'approval_required'
    CHECK (join_policy IN ('open', 'approval_required', 'invitation_only', 'closed')),

  -- Membership
  member_ids UUID[],
  member_count INTEGER DEFAULT 0,
  max_members INTEGER,
  pending_member_ids UUID[],

  -- Organization
  parent_team_id UUID REFERENCES team_management(id),
  child_team_ids UUID[],
  organization_id UUID,
  department VARCHAR(100),
  division VARCHAR(100),
  location VARCHAR(200),

  -- Goals & Metrics
  goals TEXT[],
  objectives JSONB DEFAULT '[]'::jsonb,
  key_results JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,

  -- Permissions & Access
  permissions TEXT[],
  access_level VARCHAR(50) DEFAULT 'team'
    CHECK (access_level IN ('public', 'team', 'manager', 'admin')),
  can_invite_members BOOLEAN DEFAULT false,
  can_remove_members BOOLEAN DEFAULT false,
  can_manage_projects BOOLEAN DEFAULT false,

  -- Communication
  chat_enabled BOOLEAN DEFAULT true,
  email_alias VARCHAR(300),
  slack_channel VARCHAR(200),
  teams_channel VARCHAR(200),
  meeting_schedule VARCHAR(500),

  -- Resources
  budget DECIMAL(15, 2),
  budget_used DECIMAL(15, 2) DEFAULT 0.00,
  tools_access TEXT[],
  assigned_resources JSONB DEFAULT '[]'::jsonb,

  -- Timeline
  start_date DATE,
  end_date DATE,
  formation_date DATE,
  dissolution_date DATE,

  -- Performance
  health_score DECIMAL(5, 2),
  productivity_score DECIMAL(5, 2),
  collaboration_score DECIMAL(5, 2),
  engagement_score DECIMAL(5, 2),

  -- Milestones
  milestones JSONB DEFAULT '[]'::jsonb,
  achievements TEXT[],

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT team_management_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: team_performance
-- Source: 20241215000013_api_keys_rate_limits.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS team_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES auth.users(id),
  member_name VARCHAR(255) NOT NULL,
  member_avatar VARCHAR(500),
  revenue DECIMAL(15, 2) DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  client_satisfaction DECIMAL(5, 2) DEFAULT 0,
  change_percent DECIMAL(5, 2) DEFAULT 0,
  rank INTEGER DEFAULT 0,
  period VARCHAR(20) DEFAULT 'monthly',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: team_shares
-- Source: 20240326000001_enhanced_sharing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS team_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    team_id UUID NOT NULL,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"view": true, "edit": false, "share": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: templates
-- Source: 20241214000029_batch_58_payroll_templates_sprints.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_code VARCHAR(50) NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'document',
  status VARCHAR(30) DEFAULT 'draft',
  access_level VARCHAR(30) DEFAULT 'private',
  creator_name VARCHAR(200),
  department VARCHAR(100),
  version VARCHAR(20) DEFAULT '1.0',
  usage_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  content TEXT,
  template_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: test_run_results
-- Source: 20241214000027_batch_56_training_qa_testing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS test_run_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
  test_name VARCHAR(300) NOT NULL,
  test_file VARCHAR(500),
  suite_name VARCHAR(200),
  status VARCHAR(30) DEFAULT 'pending',
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  stack_trace TEXT,
  retry_count INTEGER DEFAULT 0,
  screenshots JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: themes
-- Source: 20241215000011_batch_82_tickets_docs_themes.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  designer VARCHAR(100),
  category VARCHAR(20) DEFAULT 'modern' CHECK (category IN ('minimal', 'professional', 'creative', 'dark', 'light', 'colorful', 'modern', 'classic')),
  pricing VARCHAR(20) DEFAULT 'free' CHECK (pricing IN ('free', 'premium', 'bundle', 'enterprise')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('active', 'available', 'installed', 'preview', 'deprecated')),
  price VARCHAR(20) DEFAULT 'Free',
  downloads_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  version VARCHAR(20) DEFAULT '1.0.0',
  file_size VARCHAR(20) DEFAULT '1.0 MB',
  colors_count INTEGER DEFAULT 8,
  layouts_count INTEGER DEFAULT 4,
  components_count INTEGER DEFAULT 16,
  dark_mode BOOLEAN DEFAULT false,
  responsive BOOLEAN DEFAULT true,
  customizable BOOLEAN DEFAULT true,
  preview_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: third_party_integrations
-- Source: 20241215000009_batch_80_integrations_mobile_marketplace.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS third_party_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  logo VARCHAR(50),
  category VARCHAR(50) DEFAULT 'saas' CHECK (category IN ('saas', 'database', 'cloud', 'messaging', 'ecommerce', 'collaboration', 'monitoring', 'deployment')),
  auth_method VARCHAR(50) DEFAULT 'api-key' CHECK (auth_method IN ('api-key', 'oauth2', 'basic-auth', 'jwt', 'custom')),
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'pending', 'inactive', 'error', 'testing')),
  api_key_encrypted TEXT,
  api_calls_count INTEGER DEFAULT 0,
  uptime_percent DECIMAL(5,2) DEFAULT 99.00,
  response_time_ms INTEGER DEFAULT 100,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  version VARCHAR(20),
  endpoints_count INTEGER DEFAULT 0,
  rate_limit VARCHAR(50),
  documentation_url VARCHAR(500),
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: three_d_models
-- Source: 20241214000032_batch_61_3d_access_activity.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS three_d_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'draft',

  -- File info
  file_url TEXT,
  thumbnail_url TEXT,
  file_format VARCHAR(20) DEFAULT 'OBJ',
  file_size BIGINT DEFAULT 0,

  -- Model metrics
  polygon_count BIGINT DEFAULT 0,
  vertex_count BIGINT DEFAULT 0,
  texture_count INTEGER DEFAULT 0,
  material_count INTEGER DEFAULT 0,

  -- Render settings
  render_quality VARCHAR(20) DEFAULT 'medium',
  render_samples INTEGER DEFAULT 128,
  last_render_time DECIMAL(10,2) DEFAULT 0,

  -- Project info
  project_id UUID,
  is_public BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: ticket_messages
-- Source: 20241214000026_batch_55_tickets_warehouse_stock.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(30) DEFAULT 'reply', -- reply, note, system
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  sender_name VARCHAR(200),
  sender_email VARCHAR(255),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: time_tracking
-- Source: 20241214000009_batch_38_time_scheduling.sql
-- =====================================================
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


-- =====================================================
-- Table: training_enrollments
-- Source: 20241214000027_batch_56_training_qa_testing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  trainee_name VARCHAR(200) NOT NULL,
  trainee_email VARCHAR(200),
  enrollment_status VARCHAR(30) DEFAULT 'enrolled',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percent DECIMAL(5,2) DEFAULT 0,
  score DECIMAL(5,2),
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: training_programs
-- Source: 20241214000027_batch_56_training_qa_testing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_code VARCHAR(50) NOT NULL,
  program_name VARCHAR(300) NOT NULL,
  description TEXT,
  program_type VARCHAR(50) DEFAULT 'skills',
  status VARCHAR(30) DEFAULT 'scheduled',
  trainer_name VARCHAR(200),
  trainer_email VARCHAR(200),
  max_capacity INTEGER DEFAULT 30,
  enrolled_count INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 1,
  session_count INTEGER DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  location VARCHAR(200),
  format VARCHAR(50) DEFAULT 'in-person',
  materials_url TEXT,
  prerequisites TEXT,
  objectives TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: trash
-- Source: 20251126_files_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID,
  file_data JSONB NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- Table: tutorials
-- Source: 20241215000012_batch_83_components_tutorials.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled', 'archived')),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  format VARCHAR(20) DEFAULT 'video' CHECK (format IN ('video', 'text', 'interactive', 'mixed')),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  author VARCHAR(255),
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  enrollments_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  video_url TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ui_components
-- Source: 20241215000012_batch_83_components_tutorials.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ui_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'layout' CHECK (category IN ('layout', 'navigation', 'forms', 'data-display', 'feedback', 'media', 'buttons', 'overlays')),
  framework VARCHAR(50) DEFAULT 'react' CHECK (framework IN ('react', 'vue', 'angular', 'svelte', 'vanilla')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'deprecated', 'beta', 'archived')),
  version VARCHAR(50) DEFAULT 'v1.0',
  author VARCHAR(255),
  downloads_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  file_size VARCHAR(50),
  dependencies_count INTEGER DEFAULT 0,
  props_count INTEGER DEFAULT 0,
  examples_count INTEGER DEFAULT 0,
  accessibility_level VARCHAR(50),
  is_responsive BOOLEAN DEFAULT true,
  code_snippet TEXT,
  preview_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: upf_analytics
-- Source: 20241211000001_upf_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS upf_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    comments_count INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    voice_notes_count INTEGER DEFAULT 0,
    ai_suggestions_count INTEGER DEFAULT 0,
    average_resolution_time INTERVAL,
    top_categories TEXT[] DEFAULT '{}',
    metrics JSONB DEFAULT '{}', -- Additional metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, date) -- One record per project per day
);


-- =====================================================
-- Table: upf_attachments
-- Source: 20241211000001_upf_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS upf_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: upf_reactions
-- Source: 20241211000001_upf_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS upf_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id) -- One reaction per user per comment
);


-- =====================================================
-- Table: upf_voice_notes
-- Source: 20241211000001_upf_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS upf_voice_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    duration INTEGER NOT NULL, -- Duration in seconds
    waveform_data JSONB, -- Waveform visualization data
    transcript TEXT, -- Auto-generated transcript (future feature)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: user_activity_logs
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: user_cohorts
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS user_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cohort_date DATE NOT NULL,
    cohort_size INTEGER NOT NULL,
    retention_data JSONB DEFAULT '[]', -- Array of retention numbers by week
    ltv_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: user_management
-- Source: 20241214000008_batch_37_admin_management.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS user_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Managed User Details
  managed_user_id UUID NOT NULL REFERENCES auth.users(id),
  username VARCHAR(100),
  email VARCHAR(300) NOT NULL,
  full_name VARCHAR(300),
  display_name VARCHAR(200),

  -- Role & Permissions
  role VARCHAR(50) NOT NULL DEFAULT 'user'
    CHECK (role IN ('superadmin', 'admin', 'manager', 'team_lead', 'member', 'user', 'guest', 'custom')),
  permissions TEXT[],
  permission_groups TEXT[],
  custom_permissions JSONB DEFAULT '{}'::jsonb,

  -- Status & Access
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'locked', 'archived')),
  account_status VARCHAR(50),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,

  -- Account Information
  department VARCHAR(100),
  job_title VARCHAR(200),
  employee_id VARCHAR(100),
  hire_date DATE,
  termination_date DATE,

  -- Contact Details
  phone VARCHAR(50),
  mobile VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),

  -- Security
  two_factor_enabled BOOLEAN DEFAULT false,
  security_questions_set BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  must_change_password BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,

  -- Session & Activity
  last_login_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  last_login_ip INET,
  login_count INTEGER DEFAULT 0,
  session_timeout INTEGER DEFAULT 3600,

  -- Teams & Organization
  team_ids UUID[],
  organization_id UUID,
  reports_to UUID REFERENCES auth.users(id),
  manages_team_ids UUID[],

  -- Preferences
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(100) DEFAULT 'UTC',
  date_format VARCHAR(50),
  time_format VARCHAR(50),
  notifications_enabled BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Quotas & Limits
  storage_quota BIGINT,
  storage_used BIGINT DEFAULT 0,
  api_quota INTEGER,
  api_calls_used INTEGER DEFAULT 0,

  -- Onboarding & Training
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  training_completed TEXT[],
  certifications TEXT[],

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
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT user_management_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT user_management_unique_managed_user UNIQUE (user_id, managed_user_id)
);


-- =====================================================
-- Table: user_metrics
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: user_settings
-- Source: 20241215000002_batch_73_invoicing_escrow_settings.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Profile settings
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  bio TEXT,
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en-US',

  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,

  -- Security settings
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method VARCHAR(20),
  security_questions JSONB DEFAULT '[]',

  -- Appearance
  theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  accent_color VARCHAR(20) DEFAULT 'blue',
  compact_mode BOOLEAN DEFAULT false,

  -- API settings
  api_key VARCHAR(100),
  api_rate_limit INTEGER DEFAULT 1000,

  -- Storage
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 107374182400, -- 100 GB default

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: video_daily_analytics
-- Source: V6_video_analytics_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0,
    average_watch_time NUMERIC DEFAULT 0,
    completion_rate NUMERIC DEFAULT 0,
    engagement_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, date)
);


-- =====================================================
-- Table: video_encoding_jobs
-- Source: 20251211000001_video_studio_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_encoding_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Job info
  job_type TEXT NOT NULL DEFAULT 'transcode',
  priority INTEGER DEFAULT 5,

  -- Status
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,

  -- Input/Output
  input_url TEXT,
  output_url TEXT,
  output_format TEXT,
  output_quality TEXT,
  output_resolution TEXT,

  -- Processing
  worker_id TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Error handling
  error_code TEXT,
  error_message TEXT,
  error_details JSONB,

  -- Performance
  file_size_input BIGINT,
  file_size_output BIGINT,
  processing_time_ms INTEGER,

  -- Settings
  encoding_settings JSONB DEFAULT '{}',

  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT video_encoding_jobs_type_check CHECK (job_type IN ('transcode', 'thumbnail', 'caption', 'preview', 'watermark')),
  CONSTRAINT video_encoding_jobs_status_check CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT video_encoding_jobs_progress_check CHECK (progress >= 0 AND progress <= 100)
);


-- =====================================================
-- Table: video_engagement_events
-- Source: V6_video_analytics_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: video_events
-- Source: 20251211000001_video_studio_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event source
  source TEXT NOT NULL DEFAULT 'mux',
  event_id TEXT,
  event_type TEXT NOT NULL,

  -- Related entities
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  mux_asset_id TEXT,
  mux_upload_id TEXT,

  -- Payload
  payload JSONB NOT NULL DEFAULT '{}',

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: video_folders
-- Source: 20251211000001_video_studio_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Folder info
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,

  -- Hierarchy
  parent_folder_id UUID REFERENCES video_folders(id) ON DELETE CASCADE,
  path TEXT,
  depth INTEGER DEFAULT 0,

  -- Counts
  video_count INTEGER DEFAULT 0,
  subfolder_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: video_usage_logs
-- Source: 20251211000001_video_studio_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',

  -- Context
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: video_views
-- Source: 20251211000001_video_studio_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  -- Viewer info
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_hash TEXT,

  -- Device/location
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,

  -- View metrics
  watch_duration NUMERIC(10,3) DEFAULT 0,
  total_duration NUMERIC(10,3),
  completion_rate NUMERIC(5,2) DEFAULT 0,
  max_position NUMERIC(10,3) DEFAULT 0,

  -- Engagement
  pauses INTEGER DEFAULT 0,
  seeks INTEGER DEFAULT 0,
  replays INTEGER DEFAULT 0,
  fullscreen_time NUMERIC(10,3) DEFAULT 0,

  -- Quality
  quality_changes INTEGER DEFAULT 0,
  average_quality TEXT,
  buffering_events INTEGER DEFAULT 0,
  buffering_duration NUMERIC(10,3) DEFAULT 0,

  -- Source
  referrer TEXT,
  embed_url TEXT,
  share_id UUID,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: video_watch_time
-- Source: V6_video_analytics_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS video_watch_time (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    progress NUMERIC CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: voice_clones
-- Source: ai_voice_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_clones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  sample_count INTEGER NOT NULL DEFAULT 0,
  status clone_status NOT NULL DEFAULT 'training',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);


-- =====================================================
-- Table: voice_projects
-- Source: ai_voice_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'draft',
  total_duration INTEGER NOT NULL DEFAULT 0,
  script_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: voice_scripts
-- Source: ai_voice_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES voice_projects(id) ON DELETE CASCADE,
  voice_id UUID NOT NULL REFERENCES voices(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  style voice_style,
  speed DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  pitch DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  volume INTEGER NOT NULL DEFAULT 80,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration INTEGER DEFAULT 0,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: voice_syntheses
-- Source: ai_voice_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id UUID NOT NULL REFERENCES voices(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  audio_url TEXT,
  style voice_style,
  speed DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (speed >= 0.5 AND speed <= 2.0),
  pitch DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (pitch >= 0.5 AND pitch <= 2.0),
  volume INTEGER NOT NULL DEFAULT 80 CHECK (volume >= 0 AND volume <= 100),
  format audio_format NOT NULL DEFAULT 'mp3',
  quality audio_quality NOT NULL DEFAULT 'high',
  duration INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  character_count INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: voices
-- Source: ai_voice_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  language TEXT NOT NULL,
  language_code TEXT NOT NULL,
  gender voice_gender NOT NULL,
  age voice_age NOT NULL,
  accent TEXT,
  description TEXT NOT NULL,
  preview_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  popularity INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: vulnerabilities
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES vulnerability_scans(id) ON DELETE CASCADE NOT NULL,
  vuln_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  category TEXT,
  package_name TEXT,
  package_version TEXT,
  fixed_version TEXT,
  file_path TEXT,
  line_number INTEGER,
  cve_id TEXT,
  cwe_id TEXT,
  cvss_score DECIMAL(3,1),
  cvss_vector TEXT,
  exploit_available BOOLEAN DEFAULT FALSE,
  patch_available BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'fixed', 'ignored', 'false-positive', 'accepted')),
  fixed_at TIMESTAMPTZ,
  fixed_by UUID REFERENCES auth.users(id),
  remediation_notes TEXT,
  reference_urls TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: vulnerability_scans
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS vulnerability_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  scan_type TEXT DEFAULT 'dependency' CHECK (scan_type IN ('dependency', 'code', 'container', 'infrastructure', 'web-application', 'network', 'api')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'failed', 'cancelled')),
  scanner TEXT,
  scanner_version TEXT,
  target TEXT,
  target_type TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  scanned_items INTEGER DEFAULT 0,
  vuln_critical INTEGER DEFAULT 0,
  vuln_high INTEGER DEFAULT 0,
  vuln_medium INTEGER DEFAULT 0,
  vuln_low INTEGER DEFAULT 0,
  vuln_info INTEGER DEFAULT 0,
  fixed_count INTEGER DEFAULT 0,
  ignored_count INTEGER DEFAULT 0,
  false_positive_count INTEGER DEFAULT 0,
  report_url TEXT,
  schedule_cron TEXT,
  next_scheduled_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: warehouse_zones
-- Source: 20241214000026_batch_55_tickets_warehouse_stock.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_code VARCHAR(50) NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  zone_type VARCHAR(50) DEFAULT 'general', -- general, cold, hazmat, bulk, picking
  capacity_sqm DECIMAL(10, 2) DEFAULT 0,
  utilization_percent DECIMAL(5, 2) DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  temperature_min DECIMAL(5, 2),
  temperature_max DECIMAL(5, 2),
  humidity_max DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: warehouses
-- Source: 20241214000026_batch_55_tickets_warehouse_stock.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warehouse_code VARCHAR(50) NOT NULL,
  warehouse_name VARCHAR(200) NOT NULL,
  warehouse_type VARCHAR(50) DEFAULT 'distribution', -- distribution, fulfillment, storage, cold-storage
  status VARCHAR(30) DEFAULT 'active', -- active, maintenance, inactive
  location VARCHAR(200),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(30),
  capacity_sqm DECIMAL(12, 2) DEFAULT 0, -- square meters
  utilization_percent DECIMAL(5, 2) DEFAULT 0,
  staff_count INTEGER DEFAULT 0,
  product_count INTEGER DEFAULT 0,
  zone_count INTEGER DEFAULT 0,
  manager_name VARCHAR(200),
  manager_email VARCHAR(255),
  phone VARCHAR(50),
  operating_hours VARCHAR(100),
  last_inspection_date DATE,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: webhook_event_types
-- Source: 20241214000036_batch_65_webhooks_workflows_security.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),

  -- Stats
  total_deliveries BIGINT DEFAULT 0,
  subscribers_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);


-- =====================================================
-- Table: webinars
-- Source: 20241214000001_batch_30_events_webinars.sql
-- =====================================================
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


-- =====================================================
-- Table: workflow_steps
-- Source: 20241214000036_batch_65_webhooks_workflows_security.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Step Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed, skipped

  -- Assignment
  assigned_to TEXT[] DEFAULT '{}',
  completed_by UUID REFERENCES auth.users(id),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,

  -- Config
  action_type VARCHAR(50), -- approve, review, process, notify, wait
  action_config JSONB DEFAULT '{}',

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- EXTRACTION SUMMARY
-- =====================================================
-- Total tables searched: 314
-- Tables found: 313
-- Tables not found: 1
-- =====================================================
-- TABLES NOT FOUND:
-- - public
