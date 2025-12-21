-- =====================================================
-- ALL MISSING TABLES - Consolidated Migration
-- Created: December 16, 2024
-- Total Tables: 314
-- =====================================================
-- This file consolidates CREATE TABLE statements for all missing tables
-- extracted from existing migration files.
-- =====================================================


-- =====================================================
-- Table: access_logs
-- Source: 20241214000032_batch_61_3d_access_activity.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  log_code VARCHAR(50) UNIQUE NOT NULL,

  -- User info
  user_name VARCHAR(255),
  user_email VARCHAR(255),

  -- Access details
  access_type VARCHAR(50) NOT NULL DEFAULT 'login',
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  resource VARCHAR(500),
  method VARCHAR(20) DEFAULT 'GET',
  status_code INTEGER DEFAULT 200,

  -- Location/Device
  ip_address VARCHAR(50),
  location VARCHAR(255),
  device_type VARCHAR(50) DEFAULT 'desktop',
  browser VARCHAR(255),
  user_agent TEXT,

  -- Timing
  duration INTEGER DEFAULT 0,

  -- Security
  is_suspicious BOOLEAN DEFAULT false,
  threat_level VARCHAR(20) DEFAULT 'none',
  blocked_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: activity_logs
-- Source: 20241214000032_batch_61_3d_access_activity.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_code VARCHAR(50) UNIQUE NOT NULL,

  -- User info
  user_name VARCHAR(255),
  user_email VARCHAR(255),

  -- Activity details
  activity_type VARCHAR(50) NOT NULL DEFAULT 'view',
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  action TEXT NOT NULL,

  -- Resource info
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  resource_name VARCHAR(255),

  -- Changes tracking
  changes JSONB DEFAULT '[]',
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',

  -- Technical details
  ip_address VARCHAR(50),
  user_agent TEXT,
  duration INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: add_ons
-- Source: 20241214000033_batch_62_addons_ai_assistant_ai_create.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS add_ons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  provider VARCHAR(255),

  -- Classification
  category VARCHAR(50) DEFAULT 'feature',
  pricing_type VARCHAR(50) DEFAULT 'free',
  status VARCHAR(50) DEFAULT 'available',

  -- Pricing
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  billing_period VARCHAR(20) DEFAULT 'monthly',

  -- Metrics
  subscribers INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Content
  features TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  icon_url TEXT,
  screenshot_urls TEXT[] DEFAULT '{}',

  -- Trial
  trial_days INTEGER DEFAULT 0,
  has_trial BOOLEAN DEFAULT false,

  -- Dates
  release_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  installed_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  size_bytes BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: admin_settings
-- Source: 20241214000008_batch_37_admin_management.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Setting Details
  setting_key VARCHAR(200) NOT NULL,
  setting_category VARCHAR(100) NOT NULL,
  setting_group VARCHAR(100),
  setting_name VARCHAR(300) NOT NULL,
  description TEXT,

  -- Value & Type
  value_type VARCHAR(50) NOT NULL DEFAULT 'string'
    CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'array', 'date', 'time', 'datetime', 'color', 'url', 'email')),
  value_string TEXT,
  value_number DECIMAL(20, 4),
  value_boolean BOOLEAN,
  value_json JSONB,
  default_value TEXT,

  -- Scope & Access
  scope VARCHAR(50) NOT NULL DEFAULT 'global'
    CHECK (scope IN ('global', 'organization', 'team', 'user', 'custom')),
  access_level VARCHAR(50) NOT NULL DEFAULT 'admin'
    CHECK (access_level IN ('superadmin', 'admin', 'manager', 'user', 'public')),

  -- Status & Validation
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'deprecated', 'testing')),
  is_required BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT true,

  -- Validation Rules
  validation_rules JSONB DEFAULT '{}'::jsonb,
  allowed_values TEXT[],
  min_value DECIMAL(20, 4),
  max_value DECIMAL(20, 4),
  pattern VARCHAR(500),

  -- Audit & History
  previous_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ,
  change_reason TEXT,
  version INTEGER DEFAULT 1,

  -- Dependencies
  depends_on TEXT[],
  affects_settings TEXT[],

  -- Metadata
  help_text TEXT,
  warning_text TEXT,
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

  CONSTRAINT admin_settings_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT admin_settings_unique_key UNIQUE (user_id, setting_key, scope)
);


-- =====================================================
-- Table: advisory_analytics
-- Source: ai_business_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS advisory_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_analyses INTEGER DEFAULT 0,
  total_insights INTEGER DEFAULT 0,
  avg_profitability_score DECIMAL(5, 2) DEFAULT 0,
  avg_risk_score DECIMAL(5, 2) DEFAULT 0,
  total_revenue_analyzed DECIMAL(12, 2) DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);


-- =====================================================
-- Table: advisory_sessions
-- Source: ai_business_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS advisory_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  status session_status NOT NULL DEFAULT 'active',
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);


-- =====================================================
-- Table: ai_brand_assets
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'logo', 'icon', 'graphic', 'illustration'
    name VARCHAR(255) NOT NULL,
    file_url TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    style VARCHAR(50),
    colors JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_brand_guidelines
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name VARCHAR(255) NOT NULL,
    logo_usage JSONB DEFAULT '{}',
    color_palette_id UUID ,
    typography JSONB DEFAULT '{}',
    voice_and_tone JSONB DEFAULT '{}',
    imagery_guidelines JSONB DEFAULT '{}',
    dos_and_donts JSONB DEFAULT '{}',
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_brand_voices
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_brand_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tone VARCHAR(50),
    style_descriptors JSONB DEFAULT '[]',
    vocabulary_preferences JSONB DEFAULT '{}',
    phrases_to_use JSONB DEFAULT '[]',
    phrases_to_avoid JSONB DEFAULT '[]',
    example_content JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_collection_images
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_collection_images (
    collection_id UUID,
    image_id UUID,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_id, image_id)
);


-- =====================================================
-- Table: ai_color_palettes
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_color_palettes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    colors JSONB NOT NULL, -- Array of color objects with hex, rgb, name
    harmony_type VARCHAR(50), -- 'complementary', 'analogous', 'triadic', etc.
    mood VARCHAR(50),
    industry VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    accessibility_compliant BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_content_templates
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    tone VARCHAR(50),
    template_content JSONB NOT NULL,
    variables JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_content_variations
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_content_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_content_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    variation_type VARCHAR(50) NOT NULL, -- 'style', 'tone', 'length', 'format'
    variation_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_create_api_keys
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Provider Details
    provider TEXT NOT NULL CHECK (provider IN ('openrouter', 'openai', 'anthropic', 'google', 'stability', 'elevenlabs', 'runway', 'midjourney')),

    -- Key Storage (encrypted)
    api_key_encrypted TEXT NOT NULL, -- Use Supabase vault or pgcrypto
    key_hint TEXT, -- Last 4 chars for identification

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_validated BOOLEAN DEFAULT false,
    last_validated_at TIMESTAMPTZ,
    validation_error TEXT,

    -- Usage Limits
    monthly_limit_usd DECIMAL(10, 2),
    current_month_usage_usd DECIMAL(10, 6) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    UNIQUE(user_id, provider)
);


-- =====================================================
-- Table: ai_create_collaboration_sessions
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Session Details
    title TEXT NOT NULL,
    description TEXT,

    -- Participants
    participants UUID[] DEFAULT ARRAY[]::UUID[],
    participant_count INTEGER DEFAULT 0,

    -- Shared Content
    shared_prompt TEXT,
    shared_generations UUID[], -- Array of generation_history IDs

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_create_cost_tracking
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Period
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),

    -- Cost Breakdown
    total_cost_usd DECIMAL(10, 6) DEFAULT 0.00,
    free_tier_cost DECIMAL(10, 6) DEFAULT 0.00, -- Always 0, but tracked
    affordable_tier_cost DECIMAL(10, 6) DEFAULT 0.00,
    premium_tier_cost DECIMAL(10, 6) DEFAULT 0.00,

    -- Usage Stats
    total_generations INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    free_model_generations INTEGER DEFAULT 0,
    paid_model_generations INTEGER DEFAULT 0,

    -- Savings Calculation
    estimated_chatgpt_cost DECIMAL(10, 6) DEFAULT 0.00, -- What ChatGPT Plus would cost
    savings_usd DECIMAL(10, 6) DEFAULT 0.00,
    savings_percentage DECIMAL(5, 2) DEFAULT 0.00,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, year, month)
);


-- =====================================================
-- Table: ai_create_file_uploads
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- File Details
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, video, audio, document, code, design
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL, -- Supabase Storage path

    -- Analysis Results
    analysis_complete BOOLEAN DEFAULT false,
    analysis_data JSONB, -- Extracted metadata

    -- Usage
    used_in_generations UUID[], -- Array of generation_history IDs

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Auto-delete after 30 days
);


-- =====================================================
-- Table: ai_create_generation_history
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Generation Details
    type TEXT NOT NULL CHECK (type IN ('creative-asset', 'code', 'content', 'image', 'video', 'audio', 'analysis')),
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT, -- AI-enhanced version of prompt
    output TEXT, -- Generated content
    output_format TEXT, -- json, markdown, text, image, code, etc.

    -- Model Information
    model_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_provider TEXT NOT NULL,
    model_tier TEXT NOT NULL CHECK (model_tier IN ('free', 'affordable', 'premium')),

    -- Performance Metrics
    tokens_used INTEGER DEFAULT 0,
    generation_time_ms INTEGER, -- Time taken to generate
    cost_usd DECIMAL(10, 6) DEFAULT 0.00,
    cache_hit BOOLEAN DEFAULT false,

    -- File References
    reference_file_url TEXT, -- Uploaded reference file
    reference_file_type TEXT,
    reference_file_analysis JSONB, -- Analysis results

    -- Asset Generation Specific
    creative_field TEXT, -- photography, videography, etc.
    asset_type TEXT, -- lut, preset, template, etc.
    style TEXT, -- modern, vintage, etc.
    color_scheme TEXT, -- vibrant, muted, etc.

    -- Quality & Status
    quality_level TEXT CHECK (quality_level IN ('draft', 'standard', 'premium', 'ultra')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'cancelled')),
    error_message TEXT,

    -- Metadata
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    shared_with UUID[], -- Array of user IDs

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);


-- =====================================================
-- Table: ai_create_model_usage
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Model Details
    model_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_provider TEXT NOT NULL,
    model_tier TEXT NOT NULL,

    -- Usage Stats (Daily)
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 6) DEFAULT 0.00,

    -- Performance Metrics
    avg_generation_time_ms INTEGER,
    cache_hit_rate DECIMAL(5, 2) DEFAULT 0.00,
    error_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, model_id, date)
);


-- =====================================================
-- Table: ai_create_templates
-- Source: 20251125_ai_create_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_create_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system templates

    -- Template Details
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- content-writing, code-generation, creative-assets, etc.
    subcategory TEXT, -- blog-post, react-component, lut-preset, etc.

    -- Prompt Content
    prompt_template TEXT NOT NULL, -- With {{variables}}
    variables JSONB DEFAULT '[]', -- Array of variable definitions
    example_values JSONB, -- Example values for variables

    -- Configuration
    recommended_models TEXT[], -- Array of model IDs
    default_model TEXT,
    default_quality TEXT DEFAULT 'standard',
    default_params JSONB, -- temperature, max_tokens, etc.

    -- Usage Stats
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage
    avg_generation_time_ms INTEGER,
    avg_cost_usd DECIMAL(10, 6) DEFAULT 0.00,

    -- Sharing & Visibility
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,

    -- Ratings
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,

    -- Metadata
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);


-- =====================================================
-- Table: ai_design_concepts
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_design_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    design_type VARCHAR(50) NOT NULL,
    style VARCHAR(50),
    prompt TEXT,
    concept_data JSONB NOT NULL, -- Design specifications, elements, layout
    preview_url TEXT,
    variations JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_designs
-- Source: 20241214000034_batch_63_ai_design_alerts_api_keys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Design',

  -- Design details
  prompt TEXT NOT NULL,
  style VARCHAR(50) DEFAULT 'modern',
  category VARCHAR(50) DEFAULT 'general',

  -- Output
  thumbnail_url TEXT,
  output_url TEXT,
  output_urls TEXT[] DEFAULT '{}',
  resolution VARCHAR(20) DEFAULT '1024x1024',
  format VARCHAR(20) DEFAULT 'png',

  -- AI settings
  model VARCHAR(100) DEFAULT 'dall-e-3',
  seed INTEGER,
  cfg_scale DECIMAL(4,2) DEFAULT 7.0,
  steps INTEGER DEFAULT 50,

  -- Metrics
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,

  -- Generation stats
  generation_time_ms INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 1,
  total_cost DECIMAL(10,4) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: ai_email_sequences
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_email_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sequence_type VARCHAR(50), -- 'welcome', 'nurture', 'sales', 'onboarding'
    emails JSONB NOT NULL, -- Array of email objects
    trigger_conditions JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_enhanced_tools
-- Source: ai_enhanced_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_enhanced_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  category ai_tool_category NOT NULL,
  description TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  status ai_tool_status NOT NULL DEFAULT 'active',
  pricing_tier pricing_tier NOT NULL DEFAULT 'basic',
  performance performance_level NOT NULL DEFAULT 'good',
  usage_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_response_time INTEGER NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: ai_generated_content
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    tone VARCHAR(50),
    length VARCHAR(20),
    prompt TEXT,
    generated_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    seo_score INTEGER,
    readability_score NUMERIC(5,2),
    word_count INTEGER,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_generated_copy
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generated_copy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    copy_type VARCHAR(50) NOT NULL,
    framework VARCHAR(50),
    prompt TEXT,
    generated_copy TEXT NOT NULL,
    variations JSONB DEFAULT '[]',
    conversion_score INTEGER,
    metadata JSONB DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_generated_images
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'dalle', 'stable-diffusion', 'midjourney', etc.
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    size VARCHAR(20),
    style VARCHAR(50),
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_image_collections
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_image_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_id UUID ,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_image_presets
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_image_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50),
    style VARCHAR(50),
    size VARCHAR(20),
    quality VARCHAR(20),
    additional_params JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_model_configs
-- Source: 20251211000004_ai_service_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Model info
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  display_name TEXT,

  -- Settings
  is_enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,

  -- Overrides
  default_temperature NUMERIC(3, 2),
  default_max_tokens INTEGER,
  custom_settings JSONB DEFAULT '{}',

  -- API configuration (encrypted)
  api_key_encrypted TEXT,
  endpoint_override TEXT,

  -- Rate limits
  max_requests_per_minute INTEGER,
  max_tokens_per_day INTEGER,

  -- Statistics
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(12, 6) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, model_id, provider)
);


-- =====================================================
-- Table: ai_swipe_file
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_swipe_file (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    copy_type VARCHAR(50) NOT NULL, -- 'headline', 'tagline', 'cta', 'email_subject', etc.
    content TEXT NOT NULL,
    source VARCHAR(255),
    framework VARCHAR(50), -- 'aida', 'pas', 'bab', etc.
    performance_notes TEXT,
    tags JSONB DEFAULT '[]',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ai_usage_daily
-- Source: 20251211000004_ai_service_enhanced.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Request counts
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,

  -- Token usage
  total_prompt_tokens BIGINT DEFAULT 0,
  total_completion_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,

  -- Cost
  total_cost DECIMAL(12, 6) DEFAULT 0,

  -- By operation type
  chat_requests INTEGER DEFAULT 0,
  generation_requests INTEGER DEFAULT 0,
  embedding_requests INTEGER DEFAULT 0,

  -- By provider
  openai_requests INTEGER DEFAULT 0,
  anthropic_requests INTEGER DEFAULT 0,
  google_requests INTEGER DEFAULT 0,

  -- Performance
  average_latency_ms INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);


-- =====================================================
-- Table: alerts
-- Source: 20241214000034_batch_63_ai_design_alerts_api_keys.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  severity VARCHAR(20) DEFAULT 'info',
  category VARCHAR(50) DEFAULT 'other',
  status VARCHAR(50) DEFAULT 'active',
  priority INTEGER DEFAULT 3,

  -- Source
  source VARCHAR(100) DEFAULT 'system',
  source_id VARCHAR(100),
  source_type VARCHAR(50),

  -- Affected systems
  affected_systems TEXT[] DEFAULT '{}',
  impact TEXT,

  -- Assignment
  assigned_to VARCHAR(255),
  assigned_team VARCHAR(100),
  escalation_level INTEGER DEFAULT 0,

  -- Timing
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,

  -- Metrics
  occurrences INTEGER DEFAULT 1,
  response_time_minutes INTEGER DEFAULT 0,
  resolution_time_minutes INTEGER DEFAULT 0,

  -- Notifications
  notification_channels TEXT[] DEFAULT '{}',
  notifications_sent INTEGER DEFAULT 0,

  -- Resolution
  resolution TEXT,
  root_cause TEXT,

  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: allocations
-- Source: 20241214000030_batch_59_milestones_resources_allocation.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_code VARCHAR(50) NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  resource_name VARCHAR(255) NOT NULL,
  resource_role VARCHAR(255),
  project_name VARCHAR(255) NOT NULL,
  project_id UUID,
  allocation_type VARCHAR(50) DEFAULT 'full-time', -- full-time, part-time, temporary, contract
  status VARCHAR(50) DEFAULT 'pending', -- active, pending, completed, cancelled
  priority VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
  hours_per_week INTEGER DEFAULT 40,
  allocated_hours INTEGER DEFAULT 0,
  utilization DECIMAL(5, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  weeks_remaining INTEGER DEFAULT 0,
  billable_rate DECIMAL(10, 2) DEFAULT 0,
  project_value DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  skills TEXT[] DEFAULT '{}',
  notes TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: analytics
-- Source: 20241214000007_batch_36_analytics_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Analytics Record Details
  metric_name VARCHAR(200) NOT NULL,
  metric_type VARCHAR(50) NOT NULL DEFAULT 'count'
    CHECK (metric_type IN ('count', 'sum', 'average', 'percentage', 'ratio', 'rate', 'duration', 'score', 'ranking', 'custom')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),

  -- Values
  value DECIMAL(20, 4) NOT NULL,
  previous_value DECIMAL(20, 4),
  target_value DECIMAL(20, 4),
  baseline_value DECIMAL(20, 4),

  -- Calculations
  change_amount DECIMAL(20, 4),
  change_percent DECIMAL(10, 2),
  variance DECIMAL(20, 4),
  variance_percent DECIMAL(10, 2),

  -- Dimensions
  dimension_1 VARCHAR(100),
  dimension_2 VARCHAR(100),
  dimension_3 VARCHAR(100),
  segment VARCHAR(100),
  cohort VARCHAR(100),

  -- Time Period
  period_type VARCHAR(50) NOT NULL DEFAULT 'daily'
    CHECK (period_type IN ('hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  source VARCHAR(100),
  data_source VARCHAR(100),
  collection_method VARCHAR(100),

  -- Quality & Confidence
  data_quality DECIMAL(5, 2) DEFAULT 100.00,
  confidence_level DECIMAL(5, 2) DEFAULT 95.00,
  sample_size INTEGER,
  is_estimated BOOLEAN DEFAULT false,
  is_projection BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived', 'deprecated', 'reviewing')),

  -- Breakdown Data
  breakdown JSONB DEFAULT '{}'::jsonb,
  timeseries JSONB DEFAULT '[]'::jsonb,
  dimensions JSONB DEFAULT '{}'::jsonb,

  -- Alerting
  alert_threshold_min DECIMAL(20, 4),
  alert_threshold_max DECIMAL(20, 4),
  is_alert_triggered BOOLEAN DEFAULT false,
  alert_triggered_at TIMESTAMPTZ,

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

  CONSTRAINT analytics_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT analytics_period_range CHECK (period_end >= period_start)
);


-- =====================================================
-- Table: analytics_alerts
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    condition VARCHAR(50) NOT NULL, -- 'greater_than', 'less_than', 'equals', 'change_percent'
    threshold NUMERIC NOT NULL,
    notification_channels JSONB DEFAULT '["email"]',
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: animations
-- Source: 20241215000006_batch_77_motion_reporting_growth.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'rendering', 'ready', 'failed', 'archived')),
  duration_seconds INTEGER DEFAULT 0,
  resolution VARCHAR(20) DEFAULT '1080p',
  fps INTEGER DEFAULT 30,
  file_size_bytes BIGINT DEFAULT 0,
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_template BOOLEAN DEFAULT false,
  preset_type VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  rendered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: announcements
-- Source: 20241214000010_batch_39_communication.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Announcement Details
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  excerpt VARCHAR(500),
  announcement_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (announcement_type IN ('general', 'urgent', 'maintenance', 'feature', 'update', 'event', 'news', 'alert', 'reminder', 'celebration')),

  -- Author
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name VARCHAR(300),
  author_role VARCHAR(100),
  author_avatar TEXT,

  -- Status & Visibility
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived', 'expired', 'cancelled')),
  visibility VARCHAR(50) DEFAULT 'all'
    CHECK (visibility IN ('all', 'team', 'department', 'role', 'specific', 'public', 'private')),

  -- Targeting
  target_audience VARCHAR(100),
  target_departments TEXT[],
  target_roles TEXT[],
  target_teams TEXT[],
  target_users TEXT[],

  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  pin_expires_at TIMESTAMPTZ,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
  is_urgent BOOLEAN DEFAULT false,
  requires_acknowledgment BOOLEAN DEFAULT false,

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  acknowledgment_count INTEGER DEFAULT 0,
  acknowledgment_required_count INTEGER DEFAULT 0,

  -- Viewers Tracking
  viewed_by TEXT[],
  liked_by TEXT[],
  acknowledged_by TEXT[],
  shared_by TEXT[],

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  attachment_count INTEGER DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  file_urls TEXT[],

  -- Rich Content
  banner_image TEXT,
  banner_color VARCHAR(20),
  icon VARCHAR(50),
  emoji VARCHAR(10),
  cover_image TEXT,

  -- Categories & Tags
  category VARCHAR(100),
  tags TEXT[],
  topic VARCHAR(100),

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  email_notification BOOLEAN DEFAULT false,
  push_notification BOOLEAN DEFAULT false,
  sms_notification BOOLEAN DEFAULT false,

  -- Feedback
  allow_comments BOOLEAN DEFAULT true,
  allow_reactions BOOLEAN DEFAULT true,
  allow_sharing BOOLEAN DEFAULT true,
  reactions JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,

  -- Call to Action
  has_cta BOOLEAN DEFAULT false,
  cta_text VARCHAR(100),
  cta_url TEXT,
  cta_type VARCHAR(50),

  -- Scheduling
  is_scheduled BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,

  -- Analytics
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  engagement_score DECIMAL(5, 2),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT announcements_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: api_endpoints
-- Source: 20241214000035_batch_64_api_appstore_audio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_code VARCHAR(20) UNIQUE DEFAULT ('END-' || LPAD(nextval('api_endpoints_seq')::text, 6, '0')),

  -- Endpoint Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  method VARCHAR(10) NOT NULL DEFAULT 'GET', -- GET, POST, PUT, PATCH, DELETE
  path VARCHAR(500) NOT NULL,
  version VARCHAR(20) DEFAULT 'v1',

  -- Configuration
  is_public BOOLEAN DEFAULT false,
  is_deprecated BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT true,
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  timeout_ms INTEGER DEFAULT 30000,

  -- Documentation
  request_schema JSONB DEFAULT '{}',
  response_schema JSONB DEFAULT '{}',
  example_request JSONB DEFAULT '{}',
  example_response JSONB DEFAULT '{}',

  -- Analytics
  total_requests BIGINT DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  avg_latency_ms DECIMAL(10,2) DEFAULT 0,
  p95_latency_ms DECIMAL(10,2) DEFAULT 0,
  p99_latency_ms DECIMAL(10,2) DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, deprecated, maintenance
  last_called_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: api_request_logs
-- Source: 20241215000013_api_keys_rate_limits.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
  method VARCHAR(10) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSONB,
  response_size INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: app_reviews
-- Source: 20241214000035_batch_64_api_appstore_audio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES store_apps(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT false,

  -- Response
  developer_response TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(user_id, app_id)
);


-- =====================================================
-- Table: asset_collections
-- Source: 20241214000023_batch_52_assets_orders_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection Info
  collection_name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(50),

  -- Metrics
  asset_count INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Status
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: attribution_touchpoints
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255) NOT NULL,
    channel VARCHAR(100) NOT NULL,
    campaign VARCHAR(255),
    source VARCHAR(255),
    medium VARCHAR(100),
    content VARCHAR(255),
    is_conversion BOOLEAN DEFAULT false,
    conversion_value NUMERIC(12,2),
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: audience_analytics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS audience_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    segment_name VARCHAR(255),
    demographics JSONB DEFAULT '{}',
    interests JSONB DEFAULT '[]',
    behavior_metrics JSONB DEFAULT '{}',
    device_breakdown JSONB DEFAULT '{}',
    geographic_data JSONB DEFAULT '{}',
    period_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: audit_alert_rules
-- Source: 20241214000025_batch_54_monitoring_builds_audit_logs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name VARCHAR(200) NOT NULL,
  description TEXT,
  log_type VARCHAR(50),
  severity VARCHAR(20),
  action_pattern VARCHAR(200),
  conditions JSONB DEFAULT '{}',
  notification_channels TEXT[] DEFAULT '{email}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: audit_events
-- Source: 20241214000021_batch_50_logs_audit_permissions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Details
  action VARCHAR(50) NOT NULL
    CHECK (action IN ('create', 'read', 'update', 'delete', 'access', 'login', 'logout', 'export', 'import', 'approve', 'reject')),
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  resource_type VARCHAR(50),

  -- Actor Information
  actor_email VARCHAR(255) NOT NULL,
  actor_id VARCHAR(100),
  actor_role VARCHAR(50),
  actor_ip_address VARCHAR(45),
  actor_user_agent TEXT,
  actor_location VARCHAR(200),

  -- Event Context
  severity VARCHAR(20) DEFAULT 'low'
    CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'success'
    CHECK (status IN ('success', 'failure', 'pending', 'blocked')),

  -- Change Tracking
  changes JSONB,
  previous_values JSONB,
  new_values JSONB,

  -- Metadata
  metadata JSONB,
  reason TEXT,
  notes TEXT,
  tags TEXT[],

  -- Compliance
  compliance_framework VARCHAR(50),
  compliance_requirement VARCHAR(100),
  is_compliance_relevant BOOLEAN DEFAULT false,

  -- Session Info
  session_id VARCHAR(100),
  request_id VARCHAR(100),

  -- Risk Assessment
  risk_score DECIMAL(5, 2) DEFAULT 0,
  is_anomalous BOOLEAN DEFAULT false,
  anomaly_reason TEXT,

  -- Retention
  retention_years INTEGER DEFAULT 7,
  is_immutable BOOLEAN DEFAULT true,

  -- Timestamps
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: audit_findings
-- Source: 20241214000039_batch_68_security_vuln_logistics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES security_audits(id) ON DELETE CASCADE NOT NULL,
  finding_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  category TEXT,
  affected_resource TEXT,
  evidence TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'remediated', 'accepted', 'false-positive')),
  remediated_at TIMESTAMPTZ,
  remediated_by UUID REFERENCES auth.users(id),
  cve_id TEXT,
  cvss_score DECIMAL(3,1),
  compliance_impact TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: automation
-- Source: 20241214000011_batch_40_automation_campaigns.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS automation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Automation Details
  automation_name VARCHAR(500) NOT NULL,
  description TEXT,
  automation_type VARCHAR(50) NOT NULL DEFAULT 'trigger'
    CHECK (automation_type IN ('trigger', 'scheduled', 'conditional', 'event', 'webhook', 'api', 'manual', 'batch', 'realtime')),

  -- Trigger Configuration
  trigger_type VARCHAR(50) NOT NULL
    CHECK (trigger_type IN ('event', 'schedule', 'webhook', 'condition', 'manual', 'api_call', 'database', 'time_based', 'user_action')),
  trigger_event VARCHAR(200),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,

  -- Schedule (for scheduled automations)
  schedule_type VARCHAR(50)
    CHECK (schedule_type IN ('once', 'recurring', 'cron', 'interval', 'daily', 'weekly', 'monthly')),
  schedule_expression VARCHAR(200),
  schedule_timezone VARCHAR(100) DEFAULT 'UTC',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Action Configuration
  action_type VARCHAR(50) NOT NULL
    CHECK (action_type IN ('send_email', 'send_sms', 'create_task', 'update_record', 'send_notification', 'api_call', 'webhook', 'script', 'custom')),
  action_config JSONB DEFAULT '{}'::jsonb,
  action_parameters JSONB DEFAULT '{}'::jsonb,

  -- Status & Control
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'paused', 'running', 'failed', 'completed', 'disabled')),
  is_enabled BOOLEAN DEFAULT true,
  is_running BOOLEAN DEFAULT false,

  -- Execution Stats
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error TEXT,

  -- Performance
  avg_execution_time_ms INTEGER,
  total_execution_time_ms BIGINT DEFAULT 0,

  -- Priority & Queue
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
  queue_name VARCHAR(100),

  -- Retry Configuration
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 0,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- Timeout
  timeout_seconds INTEGER DEFAULT 300,

  -- Filtering
  filters JSONB DEFAULT '{}'::jsonb,
  conditions JSONB DEFAULT '{}'::jsonb,

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT automation_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: automations
-- Source: 20241214000011_batch_40_automation_campaigns.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workflow Details
  workflow_name VARCHAR(500) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(50) NOT NULL DEFAULT 'sequential'
    CHECK (workflow_type IN ('sequential', 'parallel', 'conditional', 'branching', 'loop', 'hybrid')),

  -- Steps Configuration
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  step_count INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 0,

  -- Trigger
  trigger_config JSONB DEFAULT '{}'::jsonb,
  trigger_type VARCHAR(50),

  -- Status & Execution
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'running', 'paused', 'completed', 'failed', 'cancelled', 'archived')),
  is_enabled BOOLEAN DEFAULT false,
  is_running BOOLEAN DEFAULT false,

  -- Execution History
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  last_execution_at TIMESTAMPTZ,
  last_execution_status VARCHAR(50),
  last_execution_error TEXT,

  -- Performance Metrics
  avg_duration_seconds INTEGER,
  min_duration_seconds INTEGER,
  max_duration_seconds INTEGER,
  total_duration_seconds BIGINT DEFAULT 0,

  -- Version Control
  version INTEGER DEFAULT 1,
  version_notes TEXT,
  published_version INTEGER,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Variables & Context
  variables JSONB DEFAULT '{}'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb,

  -- Error Handling
  error_handling_strategy VARCHAR(50) DEFAULT 'stop'
    CHECK (error_handling_strategy IN ('stop', 'continue', 'retry', 'skip', 'fallback')),
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- Notifications
  notify_on_success BOOLEAN DEFAULT false,
  notify_on_failure BOOLEAN DEFAULT true,
  notification_config JSONB DEFAULT '{}'::jsonb,

  -- Scheduling
  is_scheduled BOOLEAN DEFAULT false,
  schedule_config JSONB DEFAULT '{}'::jsonb,
  next_scheduled_run TIMESTAMPTZ,

  -- Dependencies
  dependencies TEXT[],
  parent_workflow_id UUID REFERENCES automations(id),

  -- Tags & Organization
  tags TEXT[],
  category VARCHAR(100),
  folder VARCHAR(300),

  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT automations_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: backup_logs
-- Source: 20241214000037_batch_66_backups_maintenance_roles.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups(id) ON DELETE CASCADE,

  -- Log Info
  action VARCHAR(50) NOT NULL, -- started, completed, failed, restored, verified, deleted
  status VARCHAR(20) DEFAULT 'success', -- success, failed, warning
  message TEXT,

  -- Stats
  size_bytes BIGINT DEFAULT 0,
  files_processed INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,

  -- Error
  error_code VARCHAR(50),
  error_details TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: backups
-- Source: 20241214000037_batch_66_backups_maintenance_roles.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_code VARCHAR(20) UNIQUE DEFAULT ('BKP-' || LPAD(nextval('backups_seq')::text, 6, '0')),

  -- Backup Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'full', -- full, incremental, differential, snapshot, archive
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in-progress, completed, failed, cancelled

  -- Frequency & Schedule
  frequency VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly, on-demand
  schedule_cron VARCHAR(100),
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Storage
  storage_location VARCHAR(50) DEFAULT 'local', -- local, aws-s3, google-cloud, azure, dropbox, ftp
  storage_path TEXT,
  storage_bucket VARCHAR(255),

  -- Size & Stats
  size_bytes BIGINT DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100,

  -- Security
  encrypted BOOLEAN DEFAULT true,
  encryption_algorithm VARCHAR(50) DEFAULT 'AES-256',
  compressed BOOLEAN DEFAULT true,
  compression_type VARCHAR(20) DEFAULT 'gzip',
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Retention
  retention_days INTEGER DEFAULT 30,
  expires_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: billing
-- Source: 20241214000005_batch_34_business_finance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS billing (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  customer_id UUID,
  invoice_id UUID REFERENCES invoices(id),

  -- Transaction Details
  transaction_id VARCHAR(255) UNIQUE,
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'charge'
    CHECK (transaction_type IN ('charge', 'payment', 'refund', 'adjustment', 'credit', 'debit')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'disputed')),

  -- Financial Details
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  fee_amount DECIMAL(15, 2) DEFAULT 0.00,
  net_amount DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2) DEFAULT 0.00,

  -- Payment Method
  payment_method VARCHAR(50) NOT NULL DEFAULT 'card'
    CHECK (payment_method IN ('card', 'bank-transfer', 'paypal', 'stripe', 'cash', 'check', 'crypto', 'other')),
  payment_provider VARCHAR(50),

  -- Card Details (if applicable)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Bank Details (if applicable)
  bank_name VARCHAR(255),
  account_last4 VARCHAR(4),

  -- Billing Information
  billing_name VARCHAR(255),
  billing_email VARCHAR(255),
  billing_address TEXT,
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100),

  -- Transaction Details
  description TEXT,
  notes TEXT,
  internal_notes TEXT,

  -- Dates
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_date TIMESTAMPTZ,
  refunded_date TIMESTAMPTZ,

  -- Receipt & Invoice
  receipt_number VARCHAR(100),
  receipt_url VARCHAR(500),
  invoice_number VARCHAR(100),

  -- Subscription (if applicable)
  subscription_id VARCHAR(255),
  subscription_period_start DATE,
  subscription_period_end DATE,

  -- Dispute & Refund
  dispute_reason TEXT,
  dispute_date TIMESTAMPTZ,
  refund_reason TEXT,
  refund_amount DECIMAL(15, 2),

  -- Provider Response
  provider_response JSONB,
  error_code VARCHAR(100),
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: broadcasts
-- Source: 20241214000010_batch_39_communication.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Broadcast Details
  broadcast_name VARCHAR(500) NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  message_html TEXT,
  broadcast_type VARCHAR(50) NOT NULL DEFAULT 'email'
    CHECK (broadcast_type IN ('email', 'sms', 'push', 'in_app', 'webhook', 'slack', 'teams', 'discord', 'multi_channel')),

  -- Sender
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name VARCHAR(300),
  sender_email VARCHAR(300),
  reply_to_email VARCHAR(300),

  -- Audience
  audience_type VARCHAR(50) DEFAULT 'all'
    CHECK (audience_type IN ('all', 'segment', 'list', 'role', 'department', 'team', 'custom', 'filter')),
  target_audience VARCHAR(100),
  recipient_count INTEGER DEFAULT 0,
  recipient_list TEXT[],
  segment_id UUID,
  segment_name VARCHAR(300),

  -- Filters
  audience_filters JSONB DEFAULT '{}'::jsonb,
  exclude_filters JSONB DEFAULT '{}'::jsonb,
  include_users TEXT[],
  exclude_users TEXT[],

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed', 'completed')),

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  send_at TIMESTAMPTZ,
  is_scheduled BOOLEAN DEFAULT false,
  timezone VARCHAR(100) DEFAULT 'UTC',

  -- Sending Progress
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Content
  subject VARCHAR(500),
  preheader VARCHAR(300),
  template_id UUID,
  template_name VARCHAR(300),
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Personalization
  is_personalized BOOLEAN DEFAULT false,
  personalization_fields JSONB DEFAULT '{}'::jsonb,
  dynamic_content JSONB DEFAULT '{}'::jsonb,

  -- Tracking
  track_opens BOOLEAN DEFAULT true,
  track_clicks BOOLEAN DEFAULT true,
  track_conversions BOOLEAN DEFAULT false,
  tracking_domain VARCHAR(300),

  -- URLs & Links
  has_links BOOLEAN DEFAULT false,
  link_count INTEGER DEFAULT 0,
  links JSONB DEFAULT '[]'::jsonb,

  -- Testing
  is_test BOOLEAN DEFAULT false,
  test_recipients TEXT[],
  ab_test_id UUID,
  is_ab_test BOOLEAN DEFAULT false,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  send_immediately BOOLEAN DEFAULT false,

  -- Channels
  channels TEXT[],
  primary_channel VARCHAR(50),
  fallback_channel VARCHAR(50),

  -- Email Specific
  from_name VARCHAR(300),
  from_email VARCHAR(300),
  cc_emails TEXT[],
  bcc_emails TEXT[],

  -- SMS Specific
  from_number VARCHAR(50),
  message_parts INTEGER,

  -- Push Specific
  push_title VARCHAR(200),
  push_body TEXT,
  push_icon TEXT,
  push_image TEXT,
  push_url TEXT,
  push_data JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  conversion_rate DECIMAL(5, 2),
  unsubscribe_rate DECIMAL(5, 2),
  engagement_score DECIMAL(5, 2),

  -- Costs
  cost_per_message DECIMAL(10, 4),
  total_cost DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,

  -- Compliance
  gdpr_compliant BOOLEAN DEFAULT true,
  can_spam_compliant BOOLEAN DEFAULT true,
  unsubscribe_link TEXT,
  preference_center_link TEXT,

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  campaign_id UUID,
  campaign_name VARCHAR(300),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,
  provider VARCHAR(100),
  provider_id VARCHAR(200),

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT broadcasts_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: budgets
-- Source: 20241214000006_batch_35_financial_management.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Budget Details
  budget_number VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  budget_type VARCHAR(50) NOT NULL DEFAULT 'operational'
    CHECK (budget_type IN ('operational', 'project', 'department', 'campaign', 'capital', 'discretionary', 'emergency', 'annual', 'quarterly', 'monthly')),

  -- Amount & Allocation
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  allocated_amount DECIMAL(15, 2) DEFAULT 0.00,
  spent_amount DECIMAL(15, 2) DEFAULT 0.00,
  remaining_amount DECIMAL(15, 2) DEFAULT 0.00,
  committed_amount DECIMAL(15, 2) DEFAULT 0.00,
  available_amount DECIMAL(15, 2) DEFAULT 0.00,

  -- Percentages
  utilization_percent DECIMAL(5, 2) DEFAULT 0.00,
  allocation_percent DECIMAL(5, 2) DEFAULT 0.00,

  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'on_hold', 'exceeded', 'closed', 'cancelled')),

  -- Period
  period_type VARCHAR(50) NOT NULL DEFAULT 'annual'
    CHECK (period_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'multi_year', 'project_based', 'ongoing')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER CHECK (fiscal_quarter BETWEEN 1 AND 4),

  -- Organization
  category VARCHAR(100),
  subcategory VARCHAR(100),
  department VARCHAR(100),
  cost_center VARCHAR(100),
  project_id UUID,

  -- Line Items & Breakdown
  line_items JSONB DEFAULT '[]'::jsonb,
  breakdown JSONB DEFAULT '{}'::jsonb,

  -- Alerts & Thresholds
  alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
  warning_threshold DECIMAL(5, 2) DEFAULT 90.00,
  is_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,
  alerts_enabled BOOLEAN DEFAULT true,

  -- Approval Workflow
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Ownership & Access
  owner_id UUID REFERENCES auth.users(id),
  manager_id UUID REFERENCES auth.users(id),
  stakeholders UUID[],

  -- Tracking & Reporting
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  review_frequency VARCHAR(50),

  -- Rollover & Carryforward
  allows_rollover BOOLEAN DEFAULT false,
  rollover_amount DECIMAL(15, 2) DEFAULT 0.00,
  previous_budget_id UUID REFERENCES budgets(id),

  -- Notes & Documentation
  notes TEXT,
  tags TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
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

  CONSTRAINT budgets_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT budgets_date_range CHECK (end_date >= start_date)
);


-- =====================================================
-- Table: bug_comments
-- Source: 20241214000028_batch_57_bugs_recruitment_onboarding.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS bug_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  commenter_name VARCHAR(200) NOT NULL,
  commenter_email VARCHAR(200),
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: bugs
-- Source: 20241214000028_batch_57_bugs_recruitment_onboarding.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bug_code VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  severity VARCHAR(30) DEFAULT 'medium',
  status VARCHAR(30) DEFAULT 'open',
  priority VARCHAR(10) DEFAULT 'P2',
  assignee_name VARCHAR(200),
  assignee_email VARCHAR(200),
  reporter_name VARCHAR(200),
  reporter_email VARCHAR(200),
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_date TIMESTAMP WITH TIME ZONE,
  affected_version VARCHAR(50),
  target_version VARCHAR(50),
  category VARCHAR(100),
  is_reproducible BOOLEAN DEFAULT TRUE,
  votes INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  environment_details JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  related_bugs JSONB DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: build_artifacts
-- Source: 20241214000025_batch_54_monitoring_builds_audit_logs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS build_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_name VARCHAR(200) NOT NULL,
  artifact_type VARCHAR(50) DEFAULT 'binary', -- binary, docker, npm, report, logs
  file_path TEXT,
  file_size INTEGER DEFAULT 0,
  download_url TEXT,
  checksum VARCHAR(100),
  expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: build_pipelines
-- Source: 20241214000025_batch_54_monitoring_builds_audit_logs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS build_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_name VARCHAR(200) NOT NULL,
  pipeline_type VARCHAR(50) DEFAULT 'ci_cd', -- ci_cd, feature, release, hotfix, nightly
  description TEXT,
  repository_url TEXT,
  branch_pattern VARCHAR(200),
  trigger_on TEXT[] DEFAULT '{push,pull_request}',
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: builds
-- Source: 20241214000025_batch_54_monitoring_builds_audit_logs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES build_pipelines(id) ON DELETE SET NULL,
  build_number INTEGER NOT NULL,
  branch VARCHAR(200) NOT NULL,
  commit_hash VARCHAR(100),
  commit_message TEXT,
  author_name VARCHAR(200),
  author_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, success, failed, cancelled
  duration_seconds INTEGER DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  tests_failed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  coverage_percentage DECIMAL(5, 2) DEFAULT 0,
  artifacts_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  logs_url TEXT,
  artifacts_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: bulk_operations
-- Source: V11_bulk_video_operations.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS bulk_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type bulk_operation_type NOT NULL,
  status bulk_operation_status NOT NULL DEFAULT 'pending',
  video_ids UUID[] NOT NULL,
  parameters JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_items INTEGER NOT NULL,
  processed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0
);


-- =====================================================
-- Table: business_reports
-- Source: 20241215000006_batch_77_motion_reporting_growth.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS business_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) DEFAULT 'custom' CHECK (report_type IN ('financial', 'operational', 'custom', 'analytics', 'sales')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'scheduled', 'failed')),
  schedule VARCHAR(20) DEFAULT 'on-demand' CHECK (schedule IN ('on-demand', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  file_url VARCHAR(500),
  file_format VARCHAR(20) DEFAULT 'pdf',
  data_range_start TIMESTAMP WITH TIME ZONE,
  data_range_end TIMESTAMP WITH TIME ZONE,
  filters JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: campaigns
-- Source: 20241214000011_batch_40_automation_campaigns.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campaign Details
  campaign_name VARCHAR(500) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL DEFAULT 'email'
    CHECK (campaign_type IN ('email', 'sms', 'social', 'display', 'search', 'video', 'influencer', 'affiliate', 'content', 'multi_channel')),

  -- Status & Phases
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'planned', 'scheduled', 'running', 'paused', 'completed', 'cancelled', 'archived')),
  phase VARCHAR(50) DEFAULT 'planning'
    CHECK (phase IN ('planning', 'setup', 'testing', 'launching', 'running', 'optimizing', 'analyzing', 'completed')),

  -- Timing
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_days INTEGER,

  -- Budget & Costs
  budget_total DECIMAL(15, 2) DEFAULT 0.00,
  budget_spent DECIMAL(15, 2) DEFAULT 0.00,
  budget_remaining DECIMAL(15, 2) DEFAULT 0.00,
  cost_per_lead DECIMAL(10, 2),
  cost_per_acquisition DECIMAL(10, 2),
  roi_percentage DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Goals & Targets
  goal_type VARCHAR(50)
    CHECK (goal_type IN ('awareness', 'engagement', 'leads', 'sales', 'retention', 'referral', 'custom')),
  target_audience VARCHAR(500),
  target_reach INTEGER,
  target_conversions INTEGER,
  target_revenue DECIMAL(15, 2),

  -- Audience & Segmentation
  audience_size INTEGER DEFAULT 0,
  segment_ids TEXT[],
  segment_criteria JSONB DEFAULT '{}'::jsonb,
  targeting_config JSONB DEFAULT '{}'::jsonb,

  -- Content & Creative
  content JSONB DEFAULT '{}'::jsonb,
  creative_assets JSONB DEFAULT '[]'::jsonb,
  landing_page_url TEXT,
  tracking_urls JSONB DEFAULT '{}'::jsonb,

  -- Channels & Distribution
  channels TEXT[],
  primary_channel VARCHAR(50),
  channel_config JSONB DEFAULT '{}'::jsonb,

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  sales_generated INTEGER DEFAULT 0,
  revenue_generated DECIMAL(15, 2) DEFAULT 0.00,

  -- Engagement Metrics
  engagement_rate DECIMAL(5, 2),
  click_through_rate DECIMAL(5, 2),
  conversion_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  unsubscribe_rate DECIMAL(5, 2),

  -- Social Metrics
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,

  -- Email Metrics (if email campaign)
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_config JSONB DEFAULT '{}'::jsonb,
  winning_variant VARCHAR(50),

  -- Automation Integration
  is_automated BOOLEAN DEFAULT false,
  automation_id UUID REFERENCES automations(id),
  automation_config JSONB DEFAULT '{}'::jsonb,

  -- Team & Ownership
  owner_id UUID REFERENCES auth.users(id),
  team_members TEXT[],
  assigned_to UUID REFERENCES auth.users(id),

  -- Approval & Review
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  industry VARCHAR(100),
  product_ids TEXT[],

  -- External Integration
  external_campaign_id VARCHAR(200),
  external_platform VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Notes & Documentation
  notes TEXT,
  learnings TEXT,
  success_factors TEXT,

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT campaigns_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT campaigns_valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);


-- =====================================================
-- Table: canvas
-- Source: 20241214000012_batch_41_content_studio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS canvas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Canvas Details
  canvas_name VARCHAR(500) NOT NULL,
  description TEXT,
  canvas_type VARCHAR(50) NOT NULL DEFAULT 'whiteboard'
    CHECK (canvas_type IN ('whiteboard', 'design', 'diagram', 'mindmap', 'flowchart', 'wireframe', 'mockup', 'prototype', 'presentation')),

  -- Canvas Data
  canvas_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  objects JSONB DEFAULT '[]'::jsonb,
  shapes JSONB DEFAULT '[]'::jsonb,
  text_elements JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,

  -- Canvas Properties
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 1080,
  zoom_level DECIMAL(5, 2) DEFAULT 1.0,
  pan_x DECIMAL(10, 2) DEFAULT 0,
  pan_y DECIMAL(10, 2) DEFAULT 0,

  -- Styling
  background_type VARCHAR(50) DEFAULT 'solid',
  background_color VARCHAR(20) DEFAULT '#ffffff',
  background_image TEXT,
  background_pattern VARCHAR(50),
  grid_enabled BOOLEAN DEFAULT true,
  grid_size INTEGER DEFAULT 20,
  grid_color VARCHAR(20),

  -- Layers & Organization
  layers JSONB DEFAULT '[]'::jsonb,
  active_layer INTEGER DEFAULT 0,
  layer_count INTEGER DEFAULT 1,

  -- Tools & Settings
  active_tool VARCHAR(50),
  tool_settings JSONB DEFAULT '{}'::jsonb,
  drawing_settings JSONB DEFAULT '{}'::jsonb,

  -- Selection & Interaction
  selected_objects TEXT[],
  clipboard_data JSONB DEFAULT '{}'::jsonb,
  undo_stack JSONB DEFAULT '[]'::jsonb,
  redo_stack JSONB DEFAULT '[]'::jsonb,

  -- Collaboration
  is_shared BOOLEAN DEFAULT false,
  shared_with TEXT[],
  collaborators JSONB DEFAULT '[]'::jsonb,
  collaboration_mode VARCHAR(50),
  real_time_cursors JSONB DEFAULT '{}'::jsonb,

  -- Comments & Annotations
  comments JSONB DEFAULT '[]'::jsonb,
  annotations JSONB DEFAULT '[]'::jsonb,
  sticky_notes JSONB DEFAULT '[]'::jsonb,

  -- Version Control
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  snapshots JSONB DEFAULT '[]'::jsonb,
  auto_save BOOLEAN DEFAULT true,
  last_auto_saved_at TIMESTAMPTZ,

  -- Templates & Presets
  template_id UUID,
  is_template BOOLEAN DEFAULT false,
  preset_styles JSONB DEFAULT '{}'::jsonb,

  -- Export & Publishing
  export_formats TEXT[],
  published_url TEXT,
  embed_code TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- AI & Smart Features
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  smart_guides BOOLEAN DEFAULT true,
  auto_align BOOLEAN DEFAULT true,
  snap_to_grid BOOLEAN DEFAULT true,

  -- Performance
  object_count INTEGER DEFAULT 0,
  file_size_bytes BIGINT,
  render_cache JSONB DEFAULT '{}'::jsonb,

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  folder VARCHAR(300),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'locked', 'read_only')),

  -- Custom Data
  custom_properties JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT canvas_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: capacity
-- Source: 20241214000013_batch_42_capacity_certs_changelog.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS capacity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Resource Details
  resource_name VARCHAR(500) NOT NULL,
  resource_type VARCHAR(50) NOT NULL DEFAULT 'team_member'
    CHECK (resource_type IN ('team_member', 'equipment', 'room', 'vehicle', 'tool', 'service', 'workspace')),

  -- Capacity Metrics
  total_capacity DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  available_capacity DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  allocated_capacity DECIMAL(10, 2) DEFAULT 0.00,
  utilization_percentage DECIMAL(5, 2) DEFAULT 0.00,

  -- Time Settings
  capacity_unit VARCHAR(50) DEFAULT 'hours'
    CHECK (capacity_unit IN ('hours', 'days', 'percentage', 'units', 'slots')),
  time_period VARCHAR(50) DEFAULT 'week'
    CHECK (time_period IN ('day', 'week', 'month', 'quarter', 'year')),

  -- Working Hours
  working_hours_per_day DECIMAL(4, 2) DEFAULT 8.00,
  working_days_per_week INTEGER DEFAULT 5,
  start_time TIME,
  end_time TIME,

  -- Allocation
  current_allocation JSONB DEFAULT '[]'::jsonb,
  upcoming_allocation JSONB DEFAULT '[]'::jsonb,
  allocation_history JSONB DEFAULT '[]'::jsonb,

  -- Availability
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  unavailable_dates JSONB DEFAULT '[]'::jsonb,
  blackout_periods JSONB DEFAULT '[]'::jsonb,

  -- Skills & Attributes
  skills JSONB DEFAULT '[]'::jsonb,
  certifications TEXT[],
  attributes JSONB DEFAULT '{}'::jsonb,

  -- Costing
  cost_per_hour DECIMAL(10, 2),
  cost_per_day DECIMAL(10, 2),
  total_cost DECIMAL(15, 2) DEFAULT 0.00,

  -- Planning
  planned_capacity DECIMAL(10, 2),
  forecast_capacity DECIMAL(10, 2),
  capacity_buffer DECIMAL(5, 2) DEFAULT 10.00,

  -- Utilization Tracking
  peak_utilization DECIMAL(5, 2),
  avg_utilization DECIMAL(5, 2),
  min_utilization DECIMAL(5, 2),
  utilization_trend VARCHAR(50),

  -- Overallocation
  is_overallocated BOOLEAN DEFAULT false,
  overallocation_percentage DECIMAL(5, 2),
  overallocation_alerts JSONB DEFAULT '[]'::jsonb,

  -- Efficiency
  efficiency_score DECIMAL(5, 2),
  productivity_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),

  -- Scheduling
  schedule JSONB DEFAULT '{}'::jsonb,
  recurring_schedule JSONB DEFAULT '{}'::jsonb,
  exceptions JSONB DEFAULT '[]'::jsonb,

  -- Assignments
  assigned_to TEXT[],
  assigned_projects TEXT[],
  assigned_tasks TEXT[],

  -- Location
  location VARCHAR(300),
  zone VARCHAR(100),
  region VARCHAR(100),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'maintenance', 'unavailable', 'retired')),
  availability_status VARCHAR(50) DEFAULT 'available'
    CHECK (availability_status IN ('available', 'partially_available', 'fully_booked', 'unavailable')),

  -- Constraints
  max_concurrent_assignments INTEGER DEFAULT 1,
  max_daily_hours DECIMAL(4, 2),
  requires_approval BOOLEAN DEFAULT false,

  -- Notifications
  notify_on_low_capacity BOOLEAN DEFAULT true,
  notify_on_overallocation BOOLEAN DEFAULT true,
  low_capacity_threshold DECIMAL(5, 2) DEFAULT 20.00,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT capacity_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: certifications
-- Source: 20241214000013_batch_42_capacity_certs_changelog.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Certification Details
  certification_name VARCHAR(500) NOT NULL,
  certification_code VARCHAR(100),
  certification_type VARCHAR(50) NOT NULL DEFAULT 'professional'
    CHECK (certification_type IN ('professional', 'technical', 'compliance', 'safety', 'quality', 'industry', 'vendor', 'educational')),

  -- Issuing Body
  issuing_organization VARCHAR(500),
  issuing_authority VARCHAR(300),
  accreditation_body VARCHAR(300),

  -- Dates
  issue_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  last_renewed_at TIMESTAMPTZ,
  next_renewal_due TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'expired', 'suspended', 'revoked', 'in_renewal', 'archived')),
  verification_status VARCHAR(50) DEFAULT 'unverified'
    CHECK (verification_status IN ('verified', 'unverified', 'pending_verification', 'failed_verification')),

  -- Validity
  is_valid BOOLEAN DEFAULT true,
  is_expired BOOLEAN DEFAULT false,
  days_until_expiry INTEGER,
  requires_renewal BOOLEAN DEFAULT false,

  -- Levels & Scope
  level VARCHAR(100),
  grade VARCHAR(50),
  scope TEXT,
  specializations TEXT[],

  -- Holder Information
  holder_name VARCHAR(300),
  holder_id VARCHAR(200),
  holder_email VARCHAR(300),

  -- Requirements
  prerequisites TEXT[],
  requirements_met JSONB DEFAULT '[]'::jsonb,
  continuing_education_hours DECIMAL(6, 2),
  required_ce_hours DECIMAL(6, 2),

  -- Verification
  verification_method VARCHAR(100),
  verification_url TEXT,
  verification_code VARCHAR(200),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),

  -- Documents
  certificate_url TEXT,
  certificate_number VARCHAR(200),
  digital_badge_url TEXT,
  supporting_documents TEXT[],

  -- Compliance
  compliance_area VARCHAR(200),
  regulatory_body VARCHAR(300),
  compliance_standard VARCHAR(200),
  audit_trail JSONB DEFAULT '[]'::jsonb,

  -- Renewal Process
  renewal_process TEXT,
  renewal_cost DECIMAL(10, 2),
  renewal_requirements TEXT[],
  auto_renew BOOLEAN DEFAULT false,

  -- Notifications
  notify_before_expiry BOOLEAN DEFAULT true,
  notification_days INTEGER DEFAULT 30,
  last_notification_sent TIMESTAMPTZ,

  -- Training & Exams
  training_completed BOOLEAN DEFAULT false,
  exam_passed BOOLEAN DEFAULT false,
  exam_score DECIMAL(5, 2),
  passing_score DECIMAL(5, 2),
  exam_date DATE,

  -- Associated Items
  associated_skills TEXT[],
  associated_roles TEXT[],
  associated_projects TEXT[],

  -- Value & Impact
  certification_value VARCHAR(50),
  business_impact TEXT,
  career_impact TEXT,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  industry VARCHAR(100),
  region VARCHAR(100),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT certifications_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: changelog
-- Source: 20241214000013_batch_42_capacity_certs_changelog.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Change Details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  change_type VARCHAR(50) NOT NULL DEFAULT 'feature'
    CHECK (change_type IN ('feature', 'improvement', 'bug_fix', 'security', 'performance', 'breaking_change', 'deprecated', 'removed', 'documentation')),

  -- Version
  version VARCHAR(50) NOT NULL,
  version_major INTEGER,
  version_minor INTEGER,
  version_patch INTEGER,
  version_tag VARCHAR(50),

  -- Release
  release_name VARCHAR(300),
  release_date DATE,
  release_status VARCHAR(50) DEFAULT 'draft'
    CHECK (release_status IN ('draft', 'scheduled', 'released', 'archived')),

  -- Change Content
  summary VARCHAR(1000),
  details TEXT,
  technical_details TEXT,
  migration_notes TEXT,

  -- Impact
  impact_level VARCHAR(50) DEFAULT 'minor'
    CHECK (impact_level IN ('critical', 'major', 'minor', 'patch', 'none')),
  breaking_change BOOLEAN DEFAULT false,
  requires_migration BOOLEAN DEFAULT false,
  requires_downtime BOOLEAN DEFAULT false,

  -- Categories
  category VARCHAR(100),
  component VARCHAR(200),
  affected_modules TEXT[],
  affected_apis TEXT[],

  -- Users & Teams
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(300),
  contributors TEXT[],
  reviewers TEXT[],

  -- Links & References
  pr_url TEXT,
  issue_url TEXT,
  documentation_url TEXT,
  demo_url TEXT,
  related_changes TEXT[],

  -- Code References
  commit_hash VARCHAR(100),
  branch_name VARCHAR(200),
  repository VARCHAR(300),
  pull_request_number INTEGER,

  -- Tracking
  ticket_id VARCHAR(100),
  jira_key VARCHAR(100),
  epic_id VARCHAR(100),
  sprint_id VARCHAR(100),

  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  show_in_changelog BOOLEAN DEFAULT true,
  visibility VARCHAR(50) DEFAULT 'public'
    CHECK (visibility IN ('public', 'internal', 'private', 'beta_only')),

  -- Targeting
  target_audience TEXT[],
  applies_to_versions TEXT[],
  platform TEXT[],
  environment VARCHAR(50),

  -- Rollout
  rollout_percentage DECIMAL(5, 2) DEFAULT 100.00,
  rollout_start_date TIMESTAMPTZ,
  rollout_end_date TIMESTAMPTZ,
  rollout_status VARCHAR(50),

  -- Metrics
  adoption_rate DECIMAL(5, 2),
  satisfaction_score DECIMAL(3, 2),
  issue_count INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,

  -- Deprecation
  is_deprecated BOOLEAN DEFAULT false,
  deprecated_at TIMESTAMPTZ,
  deprecation_reason TEXT,
  alternative_solution TEXT,
  removal_date DATE,

  -- Media
  screenshots TEXT[],
  videos TEXT[],
  demo_images TEXT[],

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- SEO
  slug VARCHAR(500),
  meta_description VARCHAR(300),
  keywords TEXT[],

  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  last_published_at TIMESTAMPTZ,

  -- Notifications
  notify_users BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  priority VARCHAR(50),
  severity VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT changelog_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: chat
-- Source: 20241214000010_batch_39_communication.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message Details
  message_type VARCHAR(50) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'link', 'code', 'poll', 'system', 'reply', 'forward')),
  content TEXT NOT NULL,
  content_html TEXT,
  plain_text TEXT,

  -- Conversation Context
  conversation_id UUID,
  channel_id UUID,
  thread_id UUID,
  parent_message_id UUID REFERENCES chat(id),
  is_thread_starter BOOLEAN DEFAULT false,
  thread_replies_count INTEGER DEFAULT 0,

  -- Sender & Recipient
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name VARCHAR(300),
  sender_avatar TEXT,
  recipient_id UUID REFERENCES auth.users(id),
  recipient_name VARCHAR(300),

  -- Group Chat
  is_group_message BOOLEAN DEFAULT false,
  group_id UUID,
  group_name VARCHAR(300),
  participant_ids TEXT[],
  participant_count INTEGER DEFAULT 0,

  -- Message Status
  status VARCHAR(50) NOT NULL DEFAULT 'sent'
    CHECK (status IN ('draft', 'sending', 'sent', 'delivered', 'read', 'failed', 'deleted', 'edited')),
  is_read BOOLEAN DEFAULT false,
  is_delivered BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Read Tracking
  read_at TIMESTAMPTZ,
  read_by TEXT[],
  delivered_at TIMESTAMPTZ,
  delivered_to TEXT[],

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  attachment_count INTEGER DEFAULT 0,
  file_urls TEXT[],

  -- Rich Content
  mentions TEXT[],
  hashtags TEXT[],
  links TEXT[],
  emojis TEXT[],
  reactions JSONB DEFAULT '[]'::jsonb,
  reaction_count INTEGER DEFAULT 0,

  -- Editing History
  edited_at TIMESTAMPTZ,
  edit_count INTEGER DEFAULT 0,
  edit_history JSONB DEFAULT '[]'::jsonb,
  original_content TEXT,

  -- Formatting
  is_formatted BOOLEAN DEFAULT false,
  formatting_type VARCHAR(50),
  text_format JSONB DEFAULT '{}'::jsonb,

  -- Priority & Urgency
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_urgent BOOLEAN DEFAULT false,
  requires_response BOOLEAN DEFAULT false,
  response_deadline TIMESTAMPTZ,

  -- Encryption
  is_encrypted BOOLEAN DEFAULT false,
  encryption_type VARCHAR(50),
  encryption_key VARCHAR(500),

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  push_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,

  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flagged_at TIMESTAMPTZ,
  flagged_by UUID REFERENCES auth.users(id),
  flag_reason TEXT,
  is_spam BOOLEAN DEFAULT false,
  moderation_status VARCHAR(50),

  -- Reply To
  reply_to_message_id UUID REFERENCES chat(id),
  reply_to_content TEXT,
  reply_to_sender VARCHAR(300),

  -- Forward Info
  is_forwarded BOOLEAN DEFAULT false,
  forwarded_from VARCHAR(300),
  forward_count INTEGER DEFAULT 0,

  -- Expiration
  expires_at TIMESTAMPTZ,
  is_ephemeral BOOLEAN DEFAULT false,
  auto_delete_after INTEGER,

  -- Location
  location JSONB DEFAULT '{}'::jsonb,
  has_location BOOLEAN DEFAULT false,

  -- Voice/Video
  duration_seconds INTEGER,
  call_id UUID,
  call_type VARCHAR(50),

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

  CONSTRAINT chat_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT chat_sender_id_idx CHECK (sender_id IS NOT NULL)
);


-- =====================================================
-- Table: churn_analytics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS churn_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    total_customers INTEGER NOT NULL,
    churned_customers INTEGER DEFAULT 0,
    churn_rate NUMERIC(5,2),
    churn_reasons JSONB DEFAULT '{}',
    at_risk_customers JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: ci_cd
-- Source: 20241214000014_batch_43_cicd_storage_collab.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS ci_cd (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pipeline Details
  pipeline_name VARCHAR(500) NOT NULL,
  description TEXT,
  pipeline_type VARCHAR(50) NOT NULL DEFAULT 'deployment'
    CHECK (pipeline_type IN ('deployment', 'build', 'test', 'release', 'integration', 'delivery', 'quality')),

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  variables JSONB DEFAULT '{}'::jsonb,
  secrets JSONB DEFAULT '{}'::jsonb,
  environment_variables JSONB DEFAULT '{}'::jsonb,

  -- Stages & Steps
  stages JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  stage_count INTEGER DEFAULT 0,
  step_count INTEGER DEFAULT 0,

  -- Trigger Settings
  trigger_type VARCHAR(50) DEFAULT 'manual'
    CHECK (trigger_type IN ('manual', 'push', 'pull_request', 'schedule', 'tag', 'webhook', 'api')),
  trigger_branch VARCHAR(200),
  trigger_pattern VARCHAR(500),
  trigger_schedule VARCHAR(100),

  -- Execution
  last_run_at TIMESTAMPTZ,
  next_scheduled_run TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_duration_seconds INTEGER,
  total_duration_seconds BIGINT DEFAULT 0,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'disabled', 'failed', 'archived')),
  last_status VARCHAR(50)
    CHECK (last_status IN ('success', 'failure', 'running', 'cancelled', 'skipped', 'pending')),
  is_running BOOLEAN DEFAULT false,

  -- Build Information
  last_build_number INTEGER,
  last_build_commit VARCHAR(100),
  last_build_branch VARCHAR(200),
  last_build_tag VARCHAR(200),

  -- Artifacts
  artifacts JSONB DEFAULT '[]'::jsonb,
  artifact_storage_path TEXT,
  artifact_retention_days INTEGER DEFAULT 30,

  -- Deployment
  deployment_target VARCHAR(100),
  deployment_environment VARCHAR(50),
  deployment_strategy VARCHAR(50),
  rollback_enabled BOOLEAN DEFAULT true,

  -- Testing
  test_coverage DECIMAL(5, 2),
  test_pass_rate DECIMAL(5, 2),
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,

  -- Quality Gates
  quality_gates JSONB DEFAULT '[]'::jsonb,
  quality_score DECIMAL(5, 2),
  quality_passed BOOLEAN DEFAULT false,

  -- Notifications
  notify_on_success BOOLEAN DEFAULT false,
  notify_on_failure BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '[]'::jsonb,

  -- Integration
  repository_url TEXT,
  repository_provider VARCHAR(50),
  integration_type VARCHAR(50),
  integration_config JSONB DEFAULT '{}'::jsonb,

  -- Logs
  logs_url TEXT,
  logs_retention_days INTEGER DEFAULT 90,
  last_log_size_bytes BIGINT,

  -- Performance
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  resource_usage JSONB DEFAULT '{}'::jsonb,

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT ci_cd_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: client_contacts
-- Source: 20241215000001_batch_72_clients_files_gallery.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: client_reviews
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    template_id UUID,
    
    -- Review details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Workflow state
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_review', 'approved', 'rejected', 'changes_requested', 'cancelled'
    )),
    current_stage UUID, -- References review_stages.id
    
    -- Timing
    deadline TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Configuration
    settings JSONB DEFAULT '{
        "allow_comments": true,
        "require_all_approvals": true,
        "auto_advance_stages": false,
        "send_notifications": true
    }',
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT valid_status_progression CHECK (
        (status = 'draft' AND started_at IS NULL) OR
        (status != 'draft' AND started_at IS NOT NULL)
    )
);


-- =====================================================
-- Table: client_satisfaction_metrics
-- Source: 20240327000001_freelancer_analytics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_satisfaction_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: client_shares
-- Source: 20240326000001_enhanced_sharing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    client_id UUID NOT NULL,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"view": true, "comment": true, "download": false}',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: cloud_storage
-- Source: 20241214000014_batch_43_cicd_storage_collab.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS cloud_storage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Details
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  file_path TEXT NOT NULL,
  full_path TEXT,

  -- File Properties
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100),
  mime_type VARCHAR(200),
  extension VARCHAR(50),

  -- Storage
  storage_provider VARCHAR(50) DEFAULT 'supabase'
    CHECK (storage_provider IN ('supabase', 's3', 'gcs', 'azure', 'cloudinary', 'local')),
  storage_bucket VARCHAR(200),
  storage_region VARCHAR(100),
  storage_class VARCHAR(50),

  -- Access
  access_level VARCHAR(50) DEFAULT 'private'
    CHECK (access_level IN ('public', 'private', 'shared', 'restricted')),
  public_url TEXT,
  signed_url TEXT,
  signed_url_expires_at TIMESTAMPTZ,

  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  shared_with TEXT[],
  share_token VARCHAR(200),
  share_expires_at TIMESTAMPTZ,
  share_link TEXT,

  -- Permissions
  permissions JSONB DEFAULT '{}'::jsonb,
  can_view BOOLEAN DEFAULT true,
  can_download BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,

  -- Versioning
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  is_latest_version BOOLEAN DEFAULT true,
  parent_version_id UUID REFERENCES cloud_storage(id),

  -- Content
  checksum VARCHAR(100),
  etag VARCHAR(200),
  content_hash VARCHAR(100),

  -- Media Metadata
  is_image BOOLEAN DEFAULT false,
  is_video BOOLEAN DEFAULT false,
  is_audio BOOLEAN DEFAULT false,
  is_document BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Processing
  processing_status VARCHAR(50) DEFAULT 'completed'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Optimization
  is_optimized BOOLEAN DEFAULT false,
  optimized_url TEXT,
  optimized_size BIGINT,
  compression_ratio DECIMAL(5, 2),

  -- Transcoding (for media)
  transcoding_status VARCHAR(50),
  transcoded_formats TEXT[],
  transcoded_urls JSONB DEFAULT '{}'::jsonb,

  -- Organization
  folder VARCHAR(500),
  category VARCHAR(100),
  tags TEXT[],
  labels JSONB DEFAULT '[]'::jsonb,

  -- Usage Tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,

  -- Backup
  is_backed_up BOOLEAN DEFAULT false,
  backup_location TEXT,
  last_backup_at TIMESTAMPTZ,

  -- Encryption
  is_encrypted BOOLEAN DEFAULT false,
  encryption_algorithm VARCHAR(50),
  encryption_key_id VARCHAR(200),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  exif_data JSONB DEFAULT '{}'::jsonb,
  custom_metadata JSONB DEFAULT '{}'::jsonb,

  -- Lifecycle
  expires_at TIMESTAMPTZ,
  auto_delete_after_days INTEGER,
  retention_period_days INTEGER,

  -- Source
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_from VARCHAR(100),
  upload_ip VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'deleted', 'quarantined')),
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES auth.users(id),

  -- Virus Scan
  is_scanned BOOLEAN DEFAULT false,
  scan_status VARCHAR(50),
  scan_result VARCHAR(50),
  scanned_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT cloud_storage_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: collab_document_comments
-- Source: 20251211000002_collaboration_sessions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collab_document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Position in document
  position_type TEXT DEFAULT 'point', -- point, range, selection
  position_data JSONB, -- x, y, or selection range

  -- Annotations
  annotation_type TEXT, -- highlight, note, question, suggestion
  annotation_color TEXT,

  -- Threading
  parent_comment_id UUID REFERENCES collab_document_comments(id) ON DELETE CASCADE,
  thread_count INTEGER DEFAULT 0,

  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,

  -- Reactions
  reactions JSONB DEFAULT '{}',

  -- Mentions
  mentions UUID[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: collaboration
-- Source: 20241214000014_batch_43_cicd_storage_collab.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session Details
  session_name VARCHAR(500) NOT NULL,
  description TEXT,
  session_type VARCHAR(50) NOT NULL DEFAULT 'document'
    CHECK (session_type IN ('document', 'whiteboard', 'code', 'design', 'video', 'audio', 'screen_share', 'meeting')),

  -- Participants
  host_id UUID NOT NULL REFERENCES auth.users(id),
  participants JSONB DEFAULT '[]'::jsonb,
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 10,
  active_participants INTEGER DEFAULT 0,

  -- Access Control
  access_type VARCHAR(50) DEFAULT 'invite_only'
    CHECK (access_type IN ('public', 'invite_only', 'password_protected', 'restricted')),
  access_code VARCHAR(100),
  invite_link TEXT,
  password_hash VARCHAR(500),

  -- Permissions
  permissions JSONB DEFAULT '{}'::jsonb,
  default_role VARCHAR(50) DEFAULT 'viewer'
    CHECK (default_role IN ('owner', 'editor', 'commenter', 'viewer')),
  can_invite_others BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_comment BOOLEAN DEFAULT true,

  -- Real-time Features
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Presence
  active_users JSONB DEFAULT '[]'::jsonb,
  user_cursors JSONB DEFAULT '{}'::jsonb,
  user_selections JSONB DEFAULT '{}'::jsonb,

  -- Content
  content_type VARCHAR(50),
  content_id UUID,
  content_data JSONB DEFAULT '{}'::jsonb,
  content_url TEXT,

  -- Changes & History
  changes JSONB DEFAULT '[]'::jsonb,
  change_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,

  -- Comments & Annotations
  comments JSONB DEFAULT '[]'::jsonb,
  comment_count INTEGER DEFAULT 0,
  annotations JSONB DEFAULT '[]'::jsonb,
  annotation_count INTEGER DEFAULT 0,

  -- Chat
  chat_enabled BOOLEAN DEFAULT true,
  chat_messages JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,

  -- Video/Audio
  video_enabled BOOLEAN DEFAULT false,
  audio_enabled BOOLEAN DEFAULT false,
  screen_share_enabled BOOLEAN DEFAULT false,
  recording_enabled BOOLEAN DEFAULT false,

  -- Recording
  is_recording BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  recording_size_bytes BIGINT,

  -- Notifications
  notify_on_join BOOLEAN DEFAULT true,
  notify_on_change BOOLEAN DEFAULT false,
  notify_on_comment BOOLEAN DEFAULT true,
  notification_settings JSONB DEFAULT '{}'::jsonb,

  -- Activity Tracking
  last_activity_at TIMESTAMPTZ,
  activity_log JSONB DEFAULT '[]'::jsonb,
  total_edits INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,

  -- Conflict Resolution
  conflict_resolution_strategy VARCHAR(50) DEFAULT 'last_write_wins',
  has_conflicts BOOLEAN DEFAULT false,
  conflicts JSONB DEFAULT '[]'::jsonb,

  -- Integration
  integrated_tools TEXT[],
  webhook_url TEXT,
  api_enabled BOOLEAN DEFAULT false,

  -- Scheduling
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  is_scheduled BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'scheduled', 'in_progress', 'paused', 'ended', 'archived')),

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  theme VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT collaboration_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: collaboration_events
-- Source: 20251211000002_collaboration_sessions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  document_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_category TEXT, -- session, edit, comment, participant, system

  -- Event data
  event_data JSONB DEFAULT '{}',

  -- CRDT operation (if applicable)
  crdt_operation JSONB,
  vector_clock_before JSONB,
  vector_clock_after JSONB,

  -- Context
  participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: collaboration_invites
-- Source: 20251211000002_collaboration_sessions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL  ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invite target (either user_id or email)
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,

  -- Invite details
  role participant_role NOT NULL DEFAULT 'editor',
  message TEXT,

  -- Token for email invites
  invite_token TEXT UNIQUE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,

  -- Timestamps
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT invites_target_check CHECK (
    (invited_user_id IS NOT NULL AND invited_email IS NULL) OR
    (invited_user_id IS NULL AND invited_email IS NOT NULL)
  ),
  CONSTRAINT invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked'))
);


-- =====================================================
-- Table: community
-- Source: 20241214000015_batch_44_community_compliance_connectors.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Community Details
  community_name VARCHAR(500) NOT NULL,
  description TEXT,
  community_type VARCHAR(50) NOT NULL DEFAULT 'public'
    CHECK (community_type IN ('public', 'private', 'invite_only', 'premium', 'enterprise', 'beta')),

  -- Membership
  member_count INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  pending_requests INTEGER DEFAULT 0,
  max_members INTEGER,
  allow_join_requests BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,

  -- Posts & Content
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  discussion_count INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(10, 2) DEFAULT 0,
  engagement_rate DECIMAL(5, 2),

  -- Activity Tracking
  daily_active_users INTEGER DEFAULT 0,
  weekly_active_users INTEGER DEFAULT 0,
  monthly_active_users INTEGER DEFAULT 0,
  last_post_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  -- Moderation
  moderator_count INTEGER DEFAULT 0,
  moderators JSONB DEFAULT '[]'::jsonb,
  admin_count INTEGER DEFAULT 0,
  admins JSONB DEFAULT '[]'::jsonb,
  banned_users JSONB DEFAULT '[]'::jsonb,
  banned_count INTEGER DEFAULT 0,

  -- Rules & Guidelines
  rules JSONB DEFAULT '[]'::jsonb,
  guidelines TEXT,
  code_of_conduct TEXT,
  enforce_rules BOOLEAN DEFAULT true,

  -- Features
  enable_posts BOOLEAN DEFAULT true,
  enable_comments BOOLEAN DEFAULT true,
  enable_discussions BOOLEAN DEFAULT true,
  enable_polls BOOLEAN DEFAULT false,
  enable_events BOOLEAN DEFAULT false,
  enable_announcements BOOLEAN DEFAULT true,
  enable_reactions BOOLEAN DEFAULT true,
  enable_file_sharing BOOLEAN DEFAULT true,

  -- Content Moderation
  auto_moderation BOOLEAN DEFAULT false,
  moderation_queue_count INTEGER DEFAULT 0,
  flagged_content_count INTEGER DEFAULT 0,
  removed_content_count INTEGER DEFAULT 0,
  spam_filter_enabled BOOLEAN DEFAULT true,

  -- Privacy & Access
  is_public BOOLEAN DEFAULT true,
  is_searchable BOOLEAN DEFAULT true,
  is_indexed BOOLEAN DEFAULT true,
  require_verification BOOLEAN DEFAULT false,
  minimum_karma INTEGER DEFAULT 0,

  -- Gamification
  enable_points BOOLEAN DEFAULT false,
  enable_badges BOOLEAN DEFAULT false,
  enable_leaderboard BOOLEAN DEFAULT false,
  total_points_awarded BIGINT DEFAULT 0,

  -- Notifications
  notify_new_members BOOLEAN DEFAULT true,
  notify_new_posts BOOLEAN DEFAULT false,
  notify_mentions BOOLEAN DEFAULT true,
  notification_settings JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  growth_rate DECIMAL(5, 2),
  retention_rate DECIMAL(5, 2),
  churn_rate DECIMAL(5, 2),
  avg_session_duration INTEGER,

  -- Categories & Tags
  category VARCHAR(100),
  tags TEXT[],
  topics JSONB DEFAULT '[]'::jsonb,

  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  theme JSONB DEFAULT '{}'::jsonb,
  custom_css TEXT,

  -- Contact & Links
  website_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  contact_email VARCHAR(500),

  -- Subscription & Premium
  is_premium BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50),
  subscription_price DECIMAL(10, 2),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived', 'suspended', 'deleted')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT community_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: community_analytics
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_posts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    trending_tags TEXT[],
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);


-- =====================================================
-- Table: community_likes
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID,
    comment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);


-- =====================================================
-- Table: community_shares
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL  ON DELETE CASCADE,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: compliance
-- Source: 20241214000015_batch_44_community_compliance_connectors.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Compliance Details
  compliance_name VARCHAR(500) NOT NULL,
  description TEXT,
  compliance_type VARCHAR(50) NOT NULL DEFAULT 'regulatory'
    CHECK (compliance_type IN ('regulatory', 'legal', 'industry', 'internal', 'security', 'privacy', 'data_protection', 'financial')),

  -- Framework & Standards
  framework VARCHAR(100),
  standard VARCHAR(100),
  regulation_name VARCHAR(500),
  regulation_code VARCHAR(100),
  jurisdiction VARCHAR(200),

  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'compliant', 'non_compliant', 'partially_compliant', 'under_review', 'expired')),
  compliance_status VARCHAR(50),
  is_compliant BOOLEAN DEFAULT false,
  compliance_score DECIMAL(5, 2),
  compliance_percentage DECIMAL(5, 2),

  -- Requirements
  total_requirements INTEGER DEFAULT 0,
  met_requirements INTEGER DEFAULT 0,
  pending_requirements INTEGER DEFAULT 0,
  failed_requirements INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '[]'::jsonb,

  -- Audit & Review
  last_audit_date TIMESTAMPTZ,
  next_audit_date TIMESTAMPTZ,
  audit_frequency VARCHAR(50),
  audit_count INTEGER DEFAULT 0,
  audit_history JSONB DEFAULT '[]'::jsonb,

  -- Assessments
  last_assessment_date TIMESTAMPTZ,
  next_assessment_date TIMESTAMPTZ,
  assessment_score DECIMAL(5, 2),
  assessment_results JSONB DEFAULT '{}'::jsonb,

  -- Certifications
  certification_name VARCHAR(500),
  certification_number VARCHAR(200),
  certified_by VARCHAR(500),
  certification_date TIMESTAMPTZ,
  certification_expiry TIMESTAMPTZ,
  is_certified BOOLEAN DEFAULT false,
  recertification_required BOOLEAN DEFAULT false,

  -- Deadlines
  due_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  days_until_expiry INTEGER,
  is_expired BOOLEAN DEFAULT false,
  is_expiring_soon BOOLEAN DEFAULT false,

  -- Documentation
  documentation_url TEXT,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  policy_document_url TEXT,
  procedure_document_url TEXT,
  documentation_complete BOOLEAN DEFAULT false,

  -- Responsible Party
  owner_id UUID REFERENCES auth.users(id),
  owner_name VARCHAR(500),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_team VARCHAR(200),

  -- Risk Management
  risk_level VARCHAR(50) DEFAULT 'medium'
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score DECIMAL(5, 2),
  impact_level VARCHAR(50),
  mitigation_plan TEXT,

  -- Controls
  control_count INTEGER DEFAULT 0,
  controls JSONB DEFAULT '[]'::jsonb,
  control_effectiveness DECIMAL(5, 2),

  -- Incidents & Violations
  violation_count INTEGER DEFAULT 0,
  violations JSONB DEFAULT '[]'::jsonb,
  incident_count INTEGER DEFAULT 0,
  incidents JSONB DEFAULT '[]'::jsonb,
  last_violation_date TIMESTAMPTZ,

  -- Remediation
  remediation_required BOOLEAN DEFAULT false,
  remediation_plan TEXT,
  remediation_status VARCHAR(50),
  remediation_deadline TIMESTAMPTZ,
  remediation_cost DECIMAL(12, 2),

  -- Penalties & Fines
  penalty_amount DECIMAL(12, 2),
  fine_amount DECIMAL(12, 2),
  total_penalties DECIMAL(12, 2) DEFAULT 0,

  -- Training
  training_required BOOLEAN DEFAULT false,
  training_completion_rate DECIMAL(5, 2),
  trained_employees INTEGER DEFAULT 0,
  total_employees INTEGER DEFAULT 0,

  -- Monitoring
  continuous_monitoring BOOLEAN DEFAULT false,
  monitoring_frequency VARCHAR(50),
  last_monitored_at TIMESTAMPTZ,
  monitoring_alerts INTEGER DEFAULT 0,

  -- Reporting
  reporting_frequency VARCHAR(50),
  last_report_date TIMESTAMPTZ,
  next_report_date TIMESTAMPTZ,
  report_submitted BOOLEAN DEFAULT false,

  -- Third Party
  vendor_compliance_required BOOLEAN DEFAULT false,
  vendor_count INTEGER DEFAULT 0,
  vendors JSONB DEFAULT '[]'::jsonb,

  -- Cost
  implementation_cost DECIMAL(12, 2),
  annual_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),

  -- Notifications
  notify_on_expiry BOOLEAN DEFAULT true,
  notify_on_violation BOOLEAN DEFAULT true,
  notification_days_before INTEGER DEFAULT 30,

  -- Metadata
  priority VARCHAR(50),
  category VARCHAR(100),
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT compliance_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: compliance_checks
-- Source: 20241214000021_batch_50_logs_audit_permissions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Check Details
  check_name VARCHAR(200) NOT NULL,
  framework VARCHAR(50) NOT NULL,
  requirement VARCHAR(200),
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('passing', 'failing', 'warning', 'pending', 'not_applicable')),
  score DECIMAL(5, 2) DEFAULT 0,
  max_score DECIMAL(5, 2) DEFAULT 100,

  -- Results
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  passed_controls INTEGER DEFAULT 0,
  total_controls INTEGER DEFAULT 0,

  -- Evidence
  evidence JSONB,
  findings JSONB,
  recommendations JSONB,

  -- Remediation
  remediation_required BOOLEAN DEFAULT false,
  remediation_status VARCHAR(50),
  remediation_due_date DATE,
  remediation_assigned_to VARCHAR(255),

  -- Schedule
  check_frequency VARCHAR(20) DEFAULT 'daily',
  next_check_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  last_check_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: compliance_findings
-- Source: 20251127_audit_trail_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES compliance_reports(id) ON DELETE CASCADE,

  -- Finding Details
  category TEXT NOT NULL CHECK (category IN ('security', 'privacy', 'access', 'data_integrity')),
  severity severity_level NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,

  -- Affected Logs
  affected_log_ids UUID[] DEFAULT ARRAY[]::UUID[],
  affected_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: compliance_reports
-- Source: 20251127_audit_trail_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Report Details
  name TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metrics
  total_logs INTEGER NOT NULL DEFAULT 0,
  critical_events INTEGER NOT NULL DEFAULT 0,
  security_incidents INTEGER NOT NULL DEFAULT 0,
  data_changes INTEGER NOT NULL DEFAULT 0,
  user_logins INTEGER NOT NULL DEFAULT 0,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  export_activities INTEGER NOT NULL DEFAULT 0,
  permission_changes INTEGER NOT NULL DEFAULT 0,

  -- Compliance Score (0-100)
  compliance_score INTEGER NOT NULL DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),

  -- Report Data
  summary JSONB DEFAULT '{}'::jsonb,
  findings_count INTEGER NOT NULL DEFAULT 0,

  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: connectors
-- Source: 20241214000015_batch_44_community_compliance_connectors.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Connector Details
  connector_name VARCHAR(500) NOT NULL,
  description TEXT,
  connector_type VARCHAR(50) NOT NULL DEFAULT 'api'
    CHECK (connector_type IN ('api', 'webhook', 'oauth', 'database', 'cloud_service', 'saas', 'messaging', 'payment', 'analytics')),

  -- Provider Information
  provider_name VARCHAR(200) NOT NULL,
  provider_url TEXT,
  provider_category VARCHAR(100),

  -- Connection Details
  connection_type VARCHAR(50) DEFAULT 'rest_api'
    CHECK (connection_type IN ('rest_api', 'graphql', 'soap', 'grpc', 'websocket', 'webhook', 'database', 'ftp', 'sftp')),
  protocol VARCHAR(50),

  -- Endpoint Configuration
  base_url TEXT,
  api_endpoint TEXT,
  webhook_url TEXT,
  callback_url TEXT,

  -- Authentication
  auth_type VARCHAR(50) NOT NULL DEFAULT 'api_key'
    CHECK (auth_type IN ('api_key', 'oauth', 'oauth2', 'basic', 'bearer', 'jwt', 'custom', 'none')),
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  access_token VARCHAR(1000),
  refresh_token VARCHAR(1000),
  token_expires_at TIMESTAMPTZ,
  client_id VARCHAR(500),
  client_secret VARCHAR(500),

  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  headers JSONB DEFAULT '{}'::jsonb,
  query_params JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,

  -- Status & Health
  status VARCHAR(50) DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive', 'error', 'disabled', 'testing', 'deprecated')),
  is_active BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Health Monitoring
  health_status VARCHAR(50) DEFAULT 'unknown'
    CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  last_health_check TIMESTAMPTZ,
  next_health_check TIMESTAMPTZ,
  health_check_frequency INTEGER DEFAULT 300,
  uptime_percentage DECIMAL(5, 2),

  -- Usage Tracking
  request_count BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  error_count BIGINT DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,

  -- Rate Limiting
  rate_limit INTEGER,
  rate_limit_window VARCHAR(50),
  requests_today INTEGER DEFAULT 0,
  requests_this_month BIGINT DEFAULT 0,
  quota_limit BIGINT,
  quota_used BIGINT DEFAULT 0,
  quota_reset_at TIMESTAMPTZ,

  -- Performance
  avg_response_time INTEGER,
  min_response_time INTEGER,
  max_response_time INTEGER,
  total_response_time BIGINT DEFAULT 0,

  -- Reliability
  success_rate DECIMAL(5, 2),
  error_rate DECIMAL(5, 2),
  availability_percentage DECIMAL(5, 2),

  -- Error Handling
  retry_enabled BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 1000,
  last_error TEXT,
  last_error_code VARCHAR(100),
  error_log JSONB DEFAULT '[]'::jsonb,

  -- Webhooks
  webhook_events TEXT[],
  webhook_secret VARCHAR(500),
  webhook_enabled BOOLEAN DEFAULT false,

  -- Sync & Data
  sync_enabled BOOLEAN DEFAULT false,
  sync_frequency VARCHAR(50),
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_status VARCHAR(50),
  records_synced BIGINT DEFAULT 0,

  -- Mapping & Transformation
  field_mapping JSONB DEFAULT '{}'::jsonb,
  data_transformation JSONB DEFAULT '{}'::jsonb,

  -- Versioning
  api_version VARCHAR(50),
  connector_version VARCHAR(50),
  deprecated BOOLEAN DEFAULT false,
  deprecation_date TIMESTAMPTZ,

  -- Security
  encryption_enabled BOOLEAN DEFAULT false,
  ssl_enabled BOOLEAN DEFAULT true,
  certificate_url TEXT,
  certificate_expires_at TIMESTAMPTZ,
  ip_whitelist TEXT[],

  -- Logging
  logging_enabled BOOLEAN DEFAULT true,
  log_level VARCHAR(50) DEFAULT 'info',
  log_retention_days INTEGER DEFAULT 30,

  -- Notifications
  notify_on_error BOOLEAN DEFAULT true,
  notify_on_disconnect BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '[]'::jsonb,

  -- Billing
  is_paid BOOLEAN DEFAULT false,
  billing_tier VARCHAR(50),
  monthly_cost DECIMAL(10, 2),

  -- Environment
  environment VARCHAR(50) DEFAULT 'production'
    CHECK (environment IN ('development', 'staging', 'production', 'testing')),

  -- Dependencies
  dependencies JSONB DEFAULT '[]'::jsonb,
  depends_on TEXT[],

  -- Metadata
  category VARCHAR(100),
  tags TEXT[],
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT connectors_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: content
-- Source: 20241214000012_batch_41_content_studio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content Details
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  content_type VARCHAR(50) NOT NULL DEFAULT 'article'
    CHECK (content_type IN ('article', 'blog', 'page', 'post', 'video', 'audio', 'image', 'document', 'infographic', 'ebook', 'whitepaper', 'case_study')),

  -- Content Body
  body TEXT,
  body_html TEXT,
  excerpt VARCHAR(1000),
  description TEXT,

  -- Publishing
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived', 'deleted')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,

  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_title VARCHAR(95),
  og_description VARCHAR(200),
  og_image TEXT,
  twitter_card VARCHAR(50),

  -- Media
  featured_image TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  gallery_images TEXT[],
  media_attachments JSONB DEFAULT '[]'::jsonb,

  -- Author & Attribution
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(300),
  contributors TEXT[],

  -- Categories & Tags
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  topics TEXT[],

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Reading Stats
  avg_read_time_seconds INTEGER,
  completion_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),

  -- Content Settings
  allow_comments BOOLEAN DEFAULT true,
  allow_sharing BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,

  -- Version Control
  version INTEGER DEFAULT 1,
  revision_notes TEXT,
  parent_content_id UUID REFERENCES content(id),

  -- Localization
  language VARCHAR(10) DEFAULT 'en',
  translations JSONB DEFAULT '{}'::jsonb,
  is_translated BOOLEAN DEFAULT false,

  -- Formatting
  text_format VARCHAR(50) DEFAULT 'html',
  table_of_contents JSONB DEFAULT '[]'::jsonb,
  word_count INTEGER,
  character_count INTEGER,

  -- Custom Fields
  custom_fields JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Workflow
  workflow_state VARCHAR(50),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  approval_status VARCHAR(50),

  -- External Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT content_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: content_analytics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50),
    title VARCHAR(500),
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_on_page NUMERIC(10,2),
    bounce_rate NUMERIC(5,2),
    engagement_rate NUMERIC(5,2),
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: content_studio
-- Source: 20241214000012_batch_41_content_studio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS content_studio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Details
  project_name VARCHAR(500) NOT NULL,
  description TEXT,
  project_type VARCHAR(50) NOT NULL DEFAULT 'document'
    CHECK (project_type IN ('document', 'presentation', 'video', 'audio', 'design', 'animation', 'interactive', 'multi_media')),

  -- Content
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_content TEXT,
  rendered_output TEXT,

  -- Canvas/Editor State
  canvas_state JSONB DEFAULT '{}'::jsonb,
  editor_state JSONB DEFAULT '{}'::jsonb,
  layers JSONB DEFAULT '[]'::jsonb,
  elements JSONB DEFAULT '[]'::jsonb,

  -- Dimensions & Settings
  width INTEGER,
  height INTEGER,
  aspect_ratio VARCHAR(20),
  resolution VARCHAR(20),
  background_color VARCHAR(20),
  theme VARCHAR(50),

  -- Assets & Media
  assets JSONB DEFAULT '[]'::jsonb,
  media_files TEXT[],
  fonts_used TEXT[],
  color_palette JSONB DEFAULT '[]'::jsonb,

  -- Templates & Presets
  template_id UUID,
  template_name VARCHAR(300),
  preset_id UUID,
  style_preset JSONB DEFAULT '{}'::jsonb,

  -- Collaboration
  collaborators TEXT[],
  shared_with TEXT[],
  permissions JSONB DEFAULT '{}'::jsonb,
  is_collaborative BOOLEAN DEFAULT false,

  -- Status & Progress
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'published', 'archived')),
  completion_percentage INTEGER DEFAULT 0,

  -- Version History
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  auto_save_enabled BOOLEAN DEFAULT true,
  last_auto_saved_at TIMESTAMPTZ,

  -- Timeline & Scenes (for video/animation)
  timeline JSONB DEFAULT '[]'::jsonb,
  scenes JSONB DEFAULT '[]'::jsonb,
  duration_seconds INTEGER,
  frame_rate INTEGER,

  -- Audio Settings
  audio_tracks JSONB DEFAULT '[]'::jsonb,
  voice_over JSONB DEFAULT '{}'::jsonb,
  background_music TEXT,

  -- Effects & Transitions
  effects JSONB DEFAULT '[]'::jsonb,
  transitions JSONB DEFAULT '[]'::jsonb,
  filters JSONB DEFAULT '[]'::jsonb,

  -- Export Settings
  export_formats TEXT[],
  export_quality VARCHAR(50),
  export_settings JSONB DEFAULT '{}'::jsonb,
  last_exported_at TIMESTAMPTZ,

  -- AI Features
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  ai_enhancements JSONB DEFAULT '{}'::jsonb,
  auto_generated_content TEXT,

  -- Tags & Organization
  tags TEXT[],
  category VARCHAR(100),
  folder VARCHAR(300),

  -- Custom Data
  custom_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT content_studio_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: contracts
-- Source: 20241214000005_batch_34_business_finance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  client_id UUID,
  project_id UUID,

  -- Contract Details
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  contract_type VARCHAR(50) NOT NULL DEFAULT 'service'
    CHECK (contract_type IN ('service', 'product', 'employment', 'nda', 'partnership', 'license', 'lease', 'custom')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending-review', 'pending-signature', 'active', 'completed', 'cancelled', 'expired', 'terminated', 'renewed')),

  -- Financial Terms
  contract_value DECIMAL(15, 2) DEFAULT 0.00,
  payment_schedule VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  signed_date DATE,
  effective_date DATE,
  termination_date DATE,
  renewal_date DATE,

  -- Parties
  party_a_name VARCHAR(255),
  party_a_email VARCHAR(255),
  party_a_address TEXT,
  party_a_signature VARCHAR(500),
  party_a_signed_at TIMESTAMPTZ,

  party_b_name VARCHAR(255),
  party_b_email VARCHAR(255),
  party_b_address TEXT,
  party_b_signature VARCHAR(500),
  party_b_signed_at TIMESTAMPTZ,

  -- Contract Terms
  terms TEXT NOT NULL,
  clauses JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,

  -- Renewal & Termination
  is_auto_renewable BOOLEAN DEFAULT FALSE,
  renewal_notice_period_days INTEGER DEFAULT 30,
  termination_notice_period_days INTEGER DEFAULT 30,
  termination_clause TEXT,

  -- Tracking
  is_template BOOLEAN DEFAULT FALSE,
  template_id UUID REFERENCES contracts(id),
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES contracts(id),

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  has_attachments BOOLEAN DEFAULT FALSE,
  document_url VARCHAR(500),

  -- Compliance
  requires_legal_review BOOLEAN DEFAULT FALSE,
  legal_review_status VARCHAR(50),
  legal_reviewer_id UUID REFERENCES auth.users(id),
  legal_review_date DATE,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: cost_tracking
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    usage_type TEXT NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(10,4) NOT NULL,
    billing_period DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: courses
-- Source: 20241215000005_batch_76_faq_learning_widgets.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  format VARCHAR(20) DEFAULT 'video' CHECK (format IN ('video', 'text', 'interactive', 'live', 'mixed')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category VARCHAR(100),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  certificate_available BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url VARCHAR(500),
  preview_url VARCHAR(500),
  syllabus JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: creator_profiles
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[],
    portfolio_urls TEXT[],
    social_links JSONB DEFAULT '{}',
    achievements TEXT[],
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: creator_reviews
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: crm_activities
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  contact_id UUID,
  deal_id UUID,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  priority priority_level NOT NULL DEFAULT 'medium',
  status activity_status NOT NULL DEFAULT 'pending',
  duration INTEGER DEFAULT 0,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_contacts
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type contact_type NOT NULL DEFAULT 'lead',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  avatar TEXT,
  lead_status lead_status DEFAULT 'new',
  lead_source lead_source DEFAULT 'other',
  lead_score INTEGER NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  address JSONB DEFAULT '{}'::JSONB,
  social_profiles JSONB DEFAULT '{}'::JSONB,
  last_contacted_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_deals INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  lifetime_value DECIMAL(15, 2) DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_deal_products
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL  ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  tax DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_deals
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL  ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'discovery',
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  priority priority_level NOT NULL DEFAULT 'medium',
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  lost_reason TEXT,
  won_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_leads
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL  ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status lead_status NOT NULL DEFAULT 'new',
  source lead_source NOT NULL DEFAULT 'other',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  temperature TEXT NOT NULL DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot')),
  priority priority_level NOT NULL DEFAULT 'medium',
  estimated_value DECIMAL(15, 2) DEFAULT 0,
  estimated_close_date DATE,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  notes TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_notes
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  contact_id UUID,
  deal_id UUID,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: customer_ltv
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_ltv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id VARCHAR(255) NOT NULL,
    segment VARCHAR(100),
    total_revenue NUMERIC(12,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    first_purchase_date DATE,
    last_purchase_date DATE,
    predicted_ltv NUMERIC(12,2),
    ltv_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: customer_success
-- Source: 20241214000016_batch_45_courses_crm_customer_success.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_success (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID,
  customer_name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),

  -- Health scoring
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  health_status VARCHAR(50) DEFAULT 'healthy'
    CHECK (health_status IN ('healthy', 'at_risk', 'critical', 'churned', 'onboarding', 'inactive')),
  previous_health_score INTEGER,
  health_trend VARCHAR(20)
    CHECK (health_trend IN ('improving', 'stable', 'declining', 'unknown')),

  -- Account information
  account_tier VARCHAR(50) DEFAULT 'starter'
    CHECK (account_tier IN ('enterprise', 'business', 'professional', 'starter', 'trial', 'freemium')),
  account_status VARCHAR(50) DEFAULT 'active'
    CHECK (account_status IN ('active', 'inactive', 'suspended', 'churned', 'trial', 'onboarding')),

  -- Financial metrics
  mrr DECIMAL(12, 2) DEFAULT 0, -- Monthly Recurring Revenue
  arr DECIMAL(12, 2) DEFAULT 0, -- Annual Recurring Revenue
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,

  -- Contract details
  contract_start_date TIMESTAMP WITH TIME ZONE,
  contract_end_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  days_to_renewal INTEGER,
  contract_term_months INTEGER,
  auto_renewal BOOLEAN DEFAULT false,

  -- Engagement metrics
  engagement_level VARCHAR(50) DEFAULT 'medium'
    CHECK (engagement_level IN ('high', 'medium', 'low', 'inactive', 'dormant')),
  product_usage_percentage DECIMAL(5, 2) DEFAULT 0,
  feature_adoption_count INTEGER DEFAULT 0,
  total_features_available INTEGER DEFAULT 0,
  feature_adoption_rate DECIMAL(5, 2) DEFAULT 0,

  -- Activity tracking
  last_login_date TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  logins_last_30_days INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10, 2),
  total_time_spent_hours DECIMAL(12, 2) DEFAULT 0,

  -- Support metrics
  support_ticket_count INTEGER DEFAULT 0,
  open_ticket_count INTEGER DEFAULT 0,
  closed_ticket_count INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10, 2),
  escalation_count INTEGER DEFAULT 0,

  -- Customer satisfaction
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  csat_score DECIMAL(3, 2) CHECK (csat_score >= 0 AND csat_score <= 5),
  last_survey_date TIMESTAMP WITH TIME ZONE,
  survey_response_count INTEGER DEFAULT 0,

  -- CSM assignment
  csm_id UUID REFERENCES auth.users(id),
  csm_name VARCHAR(200),
  csm_email VARCHAR(255),
  last_csm_contact TIMESTAMP WITH TIME ZONE,
  next_check_in TIMESTAMP WITH TIME ZONE,

  -- Onboarding
  onboarding_status VARCHAR(50)
    CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'delayed', 'blocked')),
  onboarding_progress_percentage DECIMAL(5, 2) DEFAULT 0,
  onboarding_completed_date TIMESTAMP WITH TIME ZONE,
  time_to_value_days INTEGER,

  -- Expansion opportunities
  expansion_opportunity BOOLEAN DEFAULT false,
  upsell_potential DECIMAL(12, 2) DEFAULT 0,
  cross_sell_opportunities TEXT[],
  expansion_notes TEXT,

  -- Churn risk
  churn_risk_score DECIMAL(5, 2) DEFAULT 0,
  churn_probability DECIMAL(5, 2) DEFAULT 0,
  churn_reasons TEXT[],
  at_risk_since TIMESTAMP WITH TIME ZONE,
  retention_actions TEXT[],

  -- Goals and objectives
  customer_goals TEXT[],
  success_milestones JSONB,
  milestones_achieved INTEGER DEFAULT 0,
  total_milestones INTEGER DEFAULT 0,

  -- QBR (Quarterly Business Review)
  last_qbr_date TIMESTAMP WITH TIME ZONE,
  next_qbr_date TIMESTAMP WITH TIME ZONE,
  qbr_count INTEGER DEFAULT 0,
  qbr_notes TEXT,

  -- Advocacy
  is_reference_customer BOOLEAN DEFAULT false,
  is_case_study BOOLEAN DEFAULT false,
  testimonial_provided BOOLEAN DEFAULT false,
  referral_count INTEGER DEFAULT 0,

  -- Product feedback
  feature_request_count INTEGER DEFAULT 0,
  bug_report_count INTEGER DEFAULT 0,
  product_feedback_submissions INTEGER DEFAULT 0,

  -- Training and enablement
  training_sessions_completed INTEGER DEFAULT 0,
  certification_achieved BOOLEAN DEFAULT false,
  resource_downloads INTEGER DEFAULT 0,

  -- Communication
  email_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  webinar_attendance_count INTEGER DEFAULT 0,
  community_participation_score DECIMAL(5, 2) DEFAULT 0,

  -- Alerts and notifications
  alert_level VARCHAR(50) DEFAULT 'none'
    CHECK (alert_level IN ('none', 'low', 'medium', 'high', 'critical')),
  alert_reasons TEXT[],
  last_alert_date TIMESTAMP WITH TIME ZONE,

  -- Notes and actions
  notes TEXT,
  action_items TEXT[],
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb
);


-- =====================================================
-- Table: customers
-- Source: 20241214000017_batch_46_customers_data_export_deployments.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Segmentation
  segment VARCHAR(50) DEFAULT 'active'
    CHECK (segment IN ('vip', 'active', 'new', 'inactive', 'churned', 'at_risk', 'prospect')),
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'deleted', 'pending', 'verified')),

  -- Personal information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  gender VARCHAR(20),

  -- Contact preferences
  preferred_language VARCHAR(50) DEFAULT 'English',
  timezone VARCHAR(100),
  preferred_contact_method VARCHAR(50)
    CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'chat', 'whatsapp', 'none')),

  -- Location
  address_line1 VARCHAR(500),
  address_line2 VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  location_name VARCHAR(200),

  -- Financial metrics
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  first_order_value DECIMAL(10, 2),
  last_order_value DECIMAL(10, 2),

  -- Dates
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_purchase_date TIMESTAMP WITH TIME ZONE,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  last_login_date TIMESTAMP WITH TIME ZONE,

  -- Engagement metrics
  email_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  sms_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  login_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10, 2),

  -- Loyalty program
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR(50),
  referral_count INTEGER DEFAULT 0,
  referred_by_id UUID,

  -- Communication preferences
  email_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  marketing_opt_in BOOLEAN DEFAULT true,
  newsletter_subscribed BOOLEAN DEFAULT false,

  -- Purchase behavior
  purchase_frequency_days DECIMAL(10, 2),
  days_since_last_purchase INTEGER,
  expected_next_purchase_date TIMESTAMP WITH TIME ZONE,
  churn_risk_score DECIMAL(5, 2) DEFAULT 0,

  -- Customer satisfaction
  satisfaction_score DECIMAL(3, 2),
  nps_score INTEGER,
  last_survey_date TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  avg_review_rating DECIMAL(3, 2),

  -- Support metrics
  support_ticket_count INTEGER DEFAULT 0,
  open_ticket_count INTEGER DEFAULT 0,
  resolved_ticket_count INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10, 2),

  -- Tags and custom fields
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Social media
  facebook_url VARCHAR(500),
  twitter_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),

  -- Company information (B2B)
  company_name VARCHAR(200),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  job_title VARCHAR(200),

  -- Integration
  external_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  shopify_customer_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);


-- =====================================================
-- Table: daily_analytics
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_storage_used BIGINT DEFAULT 0,
    total_bandwidth_used BIGINT DEFAULT 0,
    total_processing_time INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);


-- =====================================================
-- Table: data_exports
-- Source: 20241214000017_batch_46_customers_data_export_deployments.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS data_exports (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_name VARCHAR(500) NOT NULL,
  description TEXT,

  -- Export configuration
  export_format VARCHAR(50) NOT NULL DEFAULT 'csv'
    CHECK (export_format IN ('csv', 'json', 'xml', 'pdf', 'xlsx', 'sql', 'parquet', 'avro')),
  export_type VARCHAR(50) NOT NULL DEFAULT 'manual'
    CHECK (export_type IN ('manual', 'scheduled', 'automated', 'api_triggered', 'webhook')),
  data_source VARCHAR(100) NOT NULL
    CHECK (data_source IN ('users', 'customers', 'transactions', 'analytics', 'inventory', 'logs', 'reports', 'orders', 'products', 'other')),

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'scheduled', 'cancelled', 'expired')),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Record metrics
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  record_filter JSONB,

  -- File details
  file_size_bytes BIGINT DEFAULT 0,
  file_size_mb DECIMAL(10, 2) DEFAULT 0,
  file_path VARCHAR(1000),
  download_url VARCHAR(1000),
  cloud_storage_url VARCHAR(1000),

  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,

  -- Requestor information
  requested_by_name VARCHAR(200),
  requested_by_email VARCHAR(255),

  -- Security and compression
  is_encrypted BOOLEAN DEFAULT false,
  is_compressed BOOLEAN DEFAULT false,
  encryption_algorithm VARCHAR(50),
  compression_algorithm VARCHAR(50),
  password_protected BOOLEAN DEFAULT false,

  -- Scheduling
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100),
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,

  -- Email delivery
  send_email_notification BOOLEAN DEFAULT false,
  email_recipients TEXT[],
  email_sent BOOLEAN DEFAULT false,

  -- Error handling
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Filters and options
  include_columns TEXT[],
  exclude_columns TEXT[],
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  custom_query TEXT,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  export_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: dependencies
-- Source: 20241214000018_batch_47_dependencies_desktop_docs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  dependency_name VARCHAR(500) NOT NULL,
  predecessor_task VARCHAR(500) NOT NULL,
  successor_task VARCHAR(500) NOT NULL,

  -- Dependency Configuration
  dependency_type VARCHAR(50) DEFAULT 'finish-to-start'
    CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'blocked', 'cancelled')),
  impact_level VARCHAR(50) DEFAULT 'medium'
    CHECK (impact_level IN ('critical', 'high', 'medium', 'low')),

  -- Assignment
  owner VARCHAR(200),
  team VARCHAR(100),
  assigned_to VARCHAR(200),

  -- Progress Tracking
  predecessor_progress DECIMAL(5, 2) DEFAULT 0,
  successor_progress DECIMAL(5, 2) DEFAULT 0,
  overall_progress DECIMAL(5, 2) DEFAULT 0,

  -- Timeline
  created_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  resolution_date TIMESTAMPTZ,
  days_remaining INTEGER DEFAULT 0,
  blocked_days INTEGER DEFAULT 0,
  total_duration_days INTEGER DEFAULT 0,

  -- Resolution
  resolution TEXT,
  blocker_reason TEXT,
  resolution_notes TEXT,

  -- Critical Path
  is_on_critical_path BOOLEAN DEFAULT false,
  critical_path_order INTEGER,
  slack_days INTEGER DEFAULT 0,

  -- Impact Analysis
  affected_tasks INTEGER DEFAULT 0,
  affected_teams INTEGER DEFAULT 0,
  estimated_delay_days INTEGER DEFAULT 0,
  risk_score DECIMAL(5, 2) DEFAULT 0,

  -- Metadata
  priority VARCHAR(50) DEFAULT 'medium',
  tags TEXT[],
  notes TEXT,
  external_reference VARCHAR(200),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: deployments
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Deployment Details
  environment VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'cancelled', 'rolled_back')),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes DECIMAL(6, 2),

  -- Infrastructure
  servers_count INTEGER DEFAULT 0,
  health_percentage DECIMAL(5, 2) DEFAULT 100,

  -- Logs
  logs TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: desktop_apps
-- Source: 20241214000018_batch_47_dependencies_desktop_docs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS desktop_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  app_name VARCHAR(500) NOT NULL,
  app_version VARCHAR(100) NOT NULL,
  build_number VARCHAR(100),

  -- Platform Configuration
  platform VARCHAR(50) DEFAULT 'all'
    CHECK (platform IN ('all', 'windows', 'macos', 'linux', 'cross-platform')),
  supported_os TEXT[] DEFAULT ARRAY['windows', 'macos', 'linux'],
  minimum_os_version VARCHAR(100),

  -- Installation Metrics
  total_installs INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  windows_installs INTEGER DEFAULT 0,
  macos_installs INTEGER DEFAULT 0,
  linux_installs INTEGER DEFAULT 0,

  -- Version Management
  current_version VARCHAR(100),
  latest_version VARCHAR(100),
  previous_version VARCHAR(100),
  update_rate DECIMAL(5, 2) DEFAULT 0,
  auto_update_enabled BOOLEAN DEFAULT true,

  -- Performance Metrics
  performance_score DECIMAL(5, 2) DEFAULT 0,
  startup_time_ms INTEGER DEFAULT 0,
  memory_usage_mb DECIMAL(10, 2) DEFAULT 0,
  cpu_usage_percent DECIMAL(5, 2) DEFAULT 0,
  crash_rate DECIMAL(5, 4) DEFAULT 0,

  -- Build Information
  build_status VARCHAR(50) DEFAULT 'pending'
    CHECK (build_status IN ('pending', 'building', 'testing', 'stable', 'beta', 'deprecated', 'failed')),
  build_date TIMESTAMPTZ,
  release_date TIMESTAMPTZ,
  deployment_date TIMESTAMPTZ,

  -- Distribution
  download_url TEXT,
  checksum VARCHAR(200),
  file_size_mb DECIMAL(10, 2) DEFAULT 0,
  installer_type VARCHAR(50),

  -- Feature Flags
  offline_sync_enabled BOOLEAN DEFAULT false,
  auto_backup_enabled BOOLEAN DEFAULT false,
  telemetry_enabled BOOLEAN DEFAULT true,
  analytics_enabled BOOLEAN DEFAULT true,

  -- User Satisfaction
  user_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  helpful_rating_percent DECIMAL(5, 2) DEFAULT 0,
  nps_score INTEGER DEFAULT 0,

  -- Issue Tracking
  known_issues INTEGER DEFAULT 0,
  critical_bugs INTEGER DEFAULT 0,
  bug_fix_rate DECIMAL(5, 2) DEFAULT 0,
  open_tickets INTEGER DEFAULT 0,

  -- Adoption Metrics
  adoption_rate DECIMAL(5, 2) DEFAULT 0,
  retention_rate DECIMAL(5, 2) DEFAULT 0,
  churn_rate DECIMAL(5, 2) DEFAULT 0,
  daily_active_users INTEGER DEFAULT 0,
  monthly_active_users INTEGER DEFAULT 0,

  -- Update Management
  update_channel VARCHAR(50) DEFAULT 'stable',
  force_update BOOLEAN DEFAULT false,
  rollback_available BOOLEAN DEFAULT false,
  rollback_version VARCHAR(100),

  -- Security
  security_score DECIMAL(5, 2) DEFAULT 0,
  last_security_audit TIMESTAMPTZ,
  vulnerability_count INTEGER DEFAULT 0,
  code_signing_enabled BOOLEAN DEFAULT false,

  -- Metadata
  description TEXT,
  release_notes TEXT,
  changelog TEXT,
  tags TEXT[],
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: digital_assets
-- Source: 20241214000023_batch_52_assets_orders_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS digital_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID,

  -- Basic Info
  asset_name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'brand'
    CHECK (category IN ('brand', 'design', 'code', 'templates', 'media', 'documents', 'other')),
  subcategory VARCHAR(100),

  -- File Details
  file_count INTEGER DEFAULT 1,
  total_size BIGINT DEFAULT 0,
  format VARCHAR(100),
  file_types TEXT[],

  -- Pricing & License
  license_type VARCHAR(50) DEFAULT 'premium'
    CHECK (license_type IN ('free', 'premium', 'commercial', 'mit', 'apache', 'gpl', 'proprietary', 'custom')),
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,

  -- Metrics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  estimated_value DECIMAL(12, 2) DEFAULT 0,

  -- Tags & Search
  tags TEXT[],
  keywords TEXT[],

  -- Storage
  storage_path TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: direct_messages
-- Source: 20241214000022_batch_51_marketplace_messaging_media.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Message Content
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text'
    CHECK (content_type IN ('text', 'image', 'video', 'audio', 'file', 'link', 'emoji', 'system')),

  -- Sender Info
  sender_id UUID NOT NULL,
  sender_name VARCHAR(200),
  sender_email VARCHAR(255),
  sender_avatar TEXT,

  -- Recipient Info
  recipient_id UUID,
  recipient_email VARCHAR(255),

  -- Status
  status VARCHAR(20) DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed', 'deleted')),
  is_edited BOOLEAN DEFAULT false,
  is_forwarded BOOLEAN DEFAULT false,
  is_reply BOOLEAN DEFAULT false,

  -- Reply Reference
  reply_to_id UUID REFERENCES direct_messages(id),
  reply_preview VARCHAR(200),

  -- Attachments
  attachments JSONB DEFAULT '[]',
  attachment_count INTEGER DEFAULT 0,

  -- Reactions
  reactions JSONB DEFAULT '{}',
  reaction_count INTEGER DEFAULT 0,

  -- Read Receipts
  read_by UUID[],
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: docs
-- Source: 20241214000018_batch_47_dependencies_desktop_docs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  doc_title VARCHAR(500) NOT NULL,
  doc_category VARCHAR(100) DEFAULT 'guides'
    CHECK (doc_category IN ('guides', 'api', 'sdk', 'tutorials', 'reference', 'examples')),
  doc_type VARCHAR(50) DEFAULT 'article'
    CHECK (doc_type IN ('article', 'guide', 'reference', 'tutorial', 'example', 'changelog')),

  -- Content
  content TEXT,
  summary TEXT,
  slug VARCHAR(500),

  -- Organization
  section VARCHAR(200),
  subsection VARCHAR(200),
  parent_doc_id UUID REFERENCES docs(id),
  order_index INTEGER DEFAULT 0,

  -- Visibility & Status
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived', 'deprecated')),
  visibility VARCHAR(50) DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal', 'authenticated')),
  is_featured BOOLEAN DEFAULT false,

  -- Engagement Metrics
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  weekly_views INTEGER DEFAULT 0,
  daily_views INTEGER DEFAULT 0,

  -- User Feedback
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  helpful_rating_percent DECIMAL(5, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Code Examples
  has_code_examples BOOLEAN DEFAULT false,
  code_language VARCHAR(50),
  code_copy_count INTEGER DEFAULT 0,
  code_run_count INTEGER DEFAULT 0,

  -- API Documentation
  api_endpoint VARCHAR(500),
  http_method VARCHAR(20),
  api_version VARCHAR(50),
  request_count INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,

  -- SDK Documentation
  sdk_version VARCHAR(100),
  sdk_language VARCHAR(50),
  download_count INTEGER DEFAULT 0,
  installation_count INTEGER DEFAULT 0,

  -- Search & Discovery
  search_keywords TEXT[],
  tags TEXT[],
  search_rank DECIMAL(5, 2) DEFAULT 0,
  search_appearances INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,

  -- Authoring
  author VARCHAR(200),
  contributors TEXT[],
  technical_reviewer VARCHAR(200),
  editor VARCHAR(200),

  -- Versioning
  version VARCHAR(50),
  previous_version_id UUID,
  is_latest_version BOOLEAN DEFAULT true,
  version_notes TEXT,

  -- Reading Metrics
  avg_read_time_seconds INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  scroll_depth_percent DECIMAL(5, 2) DEFAULT 0,

  -- Related Content
  related_docs UUID[],
  prerequisites UUID[],
  next_steps UUID[],

  -- Maintenance
  last_reviewed_at TIMESTAMPTZ,
  last_updated_by VARCHAR(200),
  needs_review BOOLEAN DEFAULT false,
  is_outdated BOOLEAN DEFAULT false,

  -- Metadata
  meta_title VARCHAR(200),
  meta_description TEXT,
  canonical_url TEXT,
  external_references TEXT[],

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: documentation
-- Source: 20241215000011_batch_82_tickets_docs_themes.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'archived')),
  doc_type VARCHAR(30) DEFAULT 'guide' CHECK (doc_type IN ('guide', 'api-reference', 'tutorial', 'concept', 'quickstart', 'troubleshooting')),
  category VARCHAR(30) DEFAULT 'getting-started' CHECK (category IN ('getting-started', 'features', 'integrations', 'api', 'sdk', 'advanced')),
  author VARCHAR(100),
  version VARCHAR(20) DEFAULT 'v1.0',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  contributors_count INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: email_agent_approvals
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_id UUID,
  message_id UUID,
  approval_type TEXT NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  priority email_priority NOT NULL DEFAULT 'medium',
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: email_agent_config
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_respond BOOLEAN NOT NULL DEFAULT false,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  response_tone TEXT NOT NULL DEFAULT 'professional',
  signature TEXT,
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::JSONB,
  email_provider TEXT,
  ai_provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: email_agent_messages
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status email_status NOT NULL DEFAULT 'pending',
  intent email_intent,
  sentiment email_sentiment,
  priority email_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  summary TEXT,
  requires_quotation BOOLEAN NOT NULL DEFAULT false,
  requires_human_review BOOLEAN NOT NULL DEFAULT false,
  analyzed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: email_agent_responses
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL  ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type response_type NOT NULL DEFAULT 'ai-generated',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: employee_payroll
-- Source: 20241214000029_batch_58_payroll_templates_sprints.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  role VARCHAR(200),
  status VARCHAR(30) DEFAULT 'active',
  base_salary DECIMAL(12,2) DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  taxes DECIMAL(12,2) DEFAULT 0,
  net_pay DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'direct-deposit',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  bank_account VARCHAR(100),
  payment_status VARCHAR(30) DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: employees
-- Source: 20241214000019_batch_48_documents_employees_expenses.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  employee_name VARCHAR(200) NOT NULL,
  employee_id VARCHAR(100) UNIQUE,
  email VARCHAR(200),
  phone VARCHAR(50),
  avatar_url TEXT,

  -- Position & Department
  position VARCHAR(200),
  job_title VARCHAR(200),
  department VARCHAR(100),
  team VARCHAR(100),
  level VARCHAR(50),
  employment_type VARCHAR(50) DEFAULT 'full-time'
    CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern', 'temporary')),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated', 'suspended')),
  is_remote BOOLEAN DEFAULT false,

  -- Reporting Structure
  manager_id UUID REFERENCES employees(id),
  manager_name VARCHAR(200),
  direct_reports INTEGER DEFAULT 0,
  reports_to VARCHAR(200),

  -- Location
  office_location VARCHAR(200),
  work_location VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  timezone VARCHAR(50),

  -- Compensation
  salary DECIMAL(12, 2) DEFAULT 0,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  bonus_eligible BOOLEAN DEFAULT false,
  commission_rate DECIMAL(5, 2) DEFAULT 0,

  -- Benefits
  health_insurance BOOLEAN DEFAULT false,
  retirement_plan BOOLEAN DEFAULT false,
  stock_options INTEGER DEFAULT 0,
  pto_days INTEGER DEFAULT 0,
  sick_days INTEGER DEFAULT 0,
  used_pto_days INTEGER DEFAULT 0,
  used_sick_days INTEGER DEFAULT 0,

  -- Employment Dates
  hire_date DATE,
  start_date DATE,
  termination_date DATE,
  probation_end_date DATE,
  last_promotion_date DATE,

  -- Performance
  performance_rating DECIMAL(3, 2) DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  last_review_date DATE,
  next_review_date DATE,
  goals_completed INTEGER DEFAULT 0,
  goals_total INTEGER DEFAULT 0,

  -- Work Metrics
  projects_count INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  hours_logged DECIMAL(10, 2) DEFAULT 0,
  productivity_score DECIMAL(5, 2) DEFAULT 0,

  -- Skills & Certifications
  skills TEXT[],
  certifications TEXT[],
  languages TEXT[],
  education_level VARCHAR(100),

  -- Emergency Contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),

  -- Documents
  contract_url TEXT,
  resume_url TEXT,
  id_document_url TEXT,
  photo_url TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_progress INTEGER DEFAULT 0,
  orientation_date DATE,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: engagement_metrics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2),
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    platform VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: event_registrations
-- Source: 20241214000001_batch_30_events_webinars.sql
-- =====================================================
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


-- =====================================================
-- Table: events
-- Source: 20241214000001_batch_30_events_webinars.sql
-- =====================================================
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


-- =====================================================
-- Table: export_presets
-- Source: V9_video_export_system_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS export_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format video_export_format NOT NULL,
  quality video_export_quality NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);


-- =====================================================
-- Table: extensions
-- Source: 20241215000008_batch_79_knowledge_extensions_plugins.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  developer VARCHAR(255),
  category VARCHAR(50) DEFAULT 'utility' CHECK (category IN ('browser', 'desktop', 'mobile', 'api', 'workflow', 'integration', 'utility', 'enhancement')),
  extension_type VARCHAR(50) DEFAULT 'third-party' CHECK (extension_type IN ('official', 'verified', 'third-party', 'experimental', 'legacy')),
  status VARCHAR(20) DEFAULT 'disabled' CHECK (status IN ('enabled', 'disabled', 'installing', 'updating', 'error')),
  users_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  size VARCHAR(20),
  platform VARCHAR(100),
  permissions TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  icon_url VARCHAR(500),
  download_url VARCHAR(500),
  documentation_url VARCHAR(500),
  release_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: faqs
-- Source: 20241215000005_batch_76_faq_learning_widgets.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'review', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  searches_count INTEGER DEFAULT 0,
  related_faqs UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author VARCHAR(255),
  average_read_time DECIMAL(4,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: features
-- Source: 20241214000020_batch_49_features_inventory_knowledge.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  feature_name VARCHAR(500) NOT NULL,
  feature_key VARCHAR(200) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'disabled'
    CHECK (status IN ('enabled', 'disabled', 'rollout', 'testing', 'archived')),
  is_enabled BOOLEAN DEFAULT false,

  -- Environment
  environments TEXT[] DEFAULT ARRAY['development'],
  production_enabled BOOLEAN DEFAULT false,
  staging_enabled BOOLEAN DEFAULT false,
  development_enabled BOOLEAN DEFAULT false,

  -- Rollout Configuration
  rollout_percentage DECIMAL(5, 2) DEFAULT 0,
  rollout_type VARCHAR(50) DEFAULT 'percentage'
    CHECK (rollout_type IN ('percentage', 'gradual', 'targeted', 'full', 'off')),
  target_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,

  -- Targeting
  target_segments TEXT[],
  target_user_ids TEXT[],
  target_groups TEXT[],
  targeting_rules JSONB,

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_variants JSONB,
  ab_test_traffic JSONB,
  ab_test_conversion JSONB,
  ab_test_winner VARCHAR(200),
  ab_test_sample_size INTEGER DEFAULT 0,

  -- Metrics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,

  -- Rollback
  can_rollback BOOLEAN DEFAULT true,
  last_rollback_at TIMESTAMPTZ,
  rollback_reason TEXT,

  -- Metadata
  created_by VARCHAR(200),
  updated_by VARCHAR(200),
  tags TEXT[],
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: feedback
-- Source: 20241214000003_batch_32_feedback_engagement.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Feedback Source
  submitted_by_user_id UUID REFERENCES auth.users(id),
  submitted_by_name VARCHAR(255),
  submitted_by_email VARCHAR(255),

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  feedback_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (feedback_type IN ('bug', 'feature-request', 'improvement', 'complaint', 'praise', 'question', 'general', 'other')),

  -- Status & Priority
  status VARCHAR(50) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'planned', 'in-progress', 'completed', 'declined', 'duplicate', 'archived')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Categorization
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,

  -- Ratings & Sentiment
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),

  -- Related Info
  related_feature VARCHAR(255),
  related_url VARCHAR(500),
  related_version VARCHAR(50),

  -- Engagement
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Response
  response_status VARCHAR(50) DEFAULT 'pending'
    CHECK (response_status IN ('pending', 'acknowledged', 'in-review', 'responded', 'resolved')),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  response_text TEXT,

  -- Internal Notes
  internal_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,

  -- Flags
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  screenshots JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  browser_info JSONB,
  device_info JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: file_activity
-- Source: 20251126_files_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS file_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action file_action NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- Table: file_cache
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS file_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    cache_key TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL,
    provider_id UUID NOT NULL  ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: file_metadata
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    hash TEXT NOT NULL,
    provider_id UUID NOT NULL  ON DELETE CASCADE,
    storage_tier_id UUID,
    storage_path TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: financial
-- Source: 20241214000006_batch_35_financial_management.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS financial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

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
  article_id UUID,
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
  article_id UUID,

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
  article_id UUID,
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
  category_id UUID,

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
  article_id UUID,
  video_id UUID,

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
  parent_id UUID,
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
  category_id UUID,

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
  clicked_article_id UUID,
  clicked_video_id UUID,

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
  video_id UUID,
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
  category_id UUID,

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
  video_id UUID,
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
  widget_id UUID,
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
    stage_id UUID NOT NULL  ON DELETE CASCADE,
    
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
  deal_id UUID NOT NULL  ON DELETE CASCADE,
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
    share_id UUID NOT NULL  ON DELETE CASCADE,
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
    share_id UUID NOT NULL  ON DELETE CASCADE,
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
    provider_id UUID NOT NULL  ON DELETE CASCADE,
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
    provider_id UUID NOT NULL  ON DELETE CASCADE,
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
  agent_id UUID,
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
  ticket_id UUID NOT NULL  ON DELETE CASCADE,

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
  parent_team_id UUID ,
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
  ticket_id UUID NOT NULL  ON DELETE CASCADE,
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
  parent_folder_id UUID,
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
  project_id UUID NOT NULL  ON DELETE CASCADE,
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
