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
    color_palette_id UUID REFERENCES ai_color_palettes(id),
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
    collection_id UUID REFERENCES ai_image_collections(id) ON DELETE CASCADE,
    image_id UUID REFERENCES ai_generated_images(id) ON DELETE CASCADE,
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
    original_content_id UUID REFERENCES ai_generated_content(id) ON DELETE CASCADE,
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
    cover_image_id UUID REFERENCES ai_generated_images(id),
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
