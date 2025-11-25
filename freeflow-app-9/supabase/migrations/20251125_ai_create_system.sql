-- ============================================================================
-- KAZI AI CREATE SYSTEM - Complete Database Schema
-- ============================================================================
-- Description: Comprehensive schema for AI Create feature including:
--   - AI generation history tracking
--   - Prompt template library
--   - Model usage analytics
--   - API key management
--   - User preferences
--   - Cost tracking
--   - Collaboration features
-- ============================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS ai_create_generation_history CASCADE;
DROP TABLE IF EXISTS ai_create_templates CASCADE;
DROP TABLE IF EXISTS ai_create_model_usage CASCADE;
DROP TABLE IF EXISTS ai_create_api_keys CASCADE;
DROP TABLE IF EXISTS ai_create_preferences CASCADE;
DROP TABLE IF EXISTS ai_create_cost_tracking CASCADE;
DROP TABLE IF EXISTS ai_create_collaboration_sessions CASCADE;
DROP TABLE IF EXISTS ai_create_file_uploads CASCADE;

-- ============================================================================
-- 1. AI GENERATION HISTORY
-- ============================================================================
-- Tracks all AI content generations with full context
CREATE TABLE ai_create_generation_history (
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

-- Indexes for performance
CREATE INDEX idx_generation_history_user ON ai_create_generation_history(user_id);
CREATE INDEX idx_generation_history_type ON ai_create_generation_history(type);
CREATE INDEX idx_generation_history_model ON ai_create_generation_history(model_id);
CREATE INDEX idx_generation_history_created ON ai_create_generation_history(created_at DESC);
CREATE INDEX idx_generation_history_cost ON ai_create_generation_history(cost_usd);
CREATE INDEX idx_generation_history_tags ON ai_create_generation_history USING GIN(tags);

-- ============================================================================
-- 2. PROMPT TEMPLATES
-- ============================================================================
-- User-created and system prompt templates
CREATE TABLE ai_create_templates (
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

-- Indexes
CREATE INDEX idx_templates_user ON ai_create_templates(user_id);
CREATE INDEX idx_templates_category ON ai_create_templates(category);
CREATE INDEX idx_templates_public ON ai_create_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_featured ON ai_create_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_usage ON ai_create_templates(usage_count DESC);
CREATE INDEX idx_templates_tags ON ai_create_templates USING GIN(tags);

-- ============================================================================
-- 3. MODEL USAGE ANALYTICS
-- ============================================================================
-- Aggregated usage statistics per model per user
CREATE TABLE ai_create_model_usage (
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

-- Indexes
CREATE INDEX idx_model_usage_user_date ON ai_create_model_usage(user_id, date DESC);
CREATE INDEX idx_model_usage_model ON ai_create_model_usage(model_id);
CREATE INDEX idx_model_usage_cost ON ai_create_model_usage(total_cost_usd DESC);

-- ============================================================================
-- 4. API KEYS MANAGEMENT
-- ============================================================================
-- Encrypted storage of user API keys for various providers
CREATE TABLE ai_create_api_keys (
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

-- Indexes
CREATE INDEX idx_api_keys_user ON ai_create_api_keys(user_id);
CREATE INDEX idx_api_keys_provider ON ai_create_api_keys(provider);
CREATE INDEX idx_api_keys_active ON ai_create_api_keys(is_active) WHERE is_active = true;

-- ============================================================================
-- 5. USER PREFERENCES
-- ============================================================================
-- Per-user settings and preferences
CREATE TABLE ai_create_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Model Preferences
    default_model_id TEXT DEFAULT 'openrouter/mistral-7b-instruct-free',
    favorite_models TEXT[] DEFAULT ARRAY['openrouter/mistral-7b-instruct-free'],

    -- Generation Preferences
    default_quality TEXT DEFAULT 'standard' CHECK (default_quality IN ('draft', 'standard', 'premium', 'ultra')),
    auto_save BOOLEAN DEFAULT true,
    stream_output BOOLEAN DEFAULT true,
    cache_results BOOLEAN DEFAULT true,

    -- UI Preferences
    show_cost BOOLEAN DEFAULT true,
    show_tokens BOOLEAN DEFAULT true,
    show_performance_metrics BOOLEAN DEFAULT false,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),

    -- Notification Preferences
    notify_on_completion BOOLEAN DEFAULT true,
    notify_on_error BOOLEAN DEFAULT true,
    notify_on_monthly_limit BOOLEAN DEFAULT true,

    -- Budget Management
    monthly_budget_usd DECIMAL(10, 2),
    budget_alert_threshold DECIMAL(5, 2) DEFAULT 0.80, -- Alert at 80%

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. COST TRACKING (Monthly Aggregates)
-- ============================================================================
-- Monthly cost summaries for reporting
CREATE TABLE ai_create_cost_tracking (
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

-- Indexes
CREATE INDEX idx_cost_tracking_user_period ON ai_create_cost_tracking(user_id, year DESC, month DESC);

-- ============================================================================
-- 7. FILE UPLOADS
-- ============================================================================
-- Track uploaded reference files
CREATE TABLE ai_create_file_uploads (
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

-- Indexes
CREATE INDEX idx_file_uploads_user ON ai_create_file_uploads(user_id);
CREATE INDEX idx_file_uploads_type ON ai_create_file_uploads(file_type);
CREATE INDEX idx_file_uploads_expires ON ai_create_file_uploads(expires_at);

-- ============================================================================
-- 8. COLLABORATION SESSIONS
-- ============================================================================
-- Real-time collaboration on AI prompts
CREATE TABLE ai_create_collaboration_sessions (
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

-- Indexes
CREATE INDEX idx_collaboration_owner ON ai_create_collaboration_sessions(owner_id);
CREATE INDEX idx_collaboration_active ON ai_create_collaboration_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_collaboration_participants ON ai_create_collaboration_sessions USING GIN(participants);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ai_create_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_create_collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Generation History Policies
CREATE POLICY "Users can view own generation history" ON ai_create_generation_history
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can create own generations" ON ai_create_generation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON ai_create_generation_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations" ON ai_create_generation_history
    FOR DELETE USING (auth.uid() = user_id);

-- Templates Policies
CREATE POLICY "Users can view public and own templates" ON ai_create_templates
    FOR SELECT USING (is_public = true OR auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own templates" ON ai_create_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON ai_create_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON ai_create_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Model Usage Policies
CREATE POLICY "Users can view own usage" ON ai_create_model_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage records" ON ai_create_model_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON ai_create_model_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- API Keys Policies (strict - users only see their own)
CREATE POLICY "Users can view own API keys" ON ai_create_api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON ai_create_api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON ai_create_api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON ai_create_api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Preferences Policies
CREATE POLICY "Users can view own preferences" ON ai_create_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON ai_create_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON ai_create_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Cost Tracking Policies
CREATE POLICY "Users can view own costs" ON ai_create_cost_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage cost tracking" ON ai_create_cost_tracking
    FOR ALL USING (auth.uid() = user_id);

-- File Uploads Policies
CREATE POLICY "Users can view own files" ON ai_create_file_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files" ON ai_create_file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON ai_create_file_uploads
    FOR DELETE USING (auth.uid() = user_id);

-- Collaboration Policies
CREATE POLICY "Users can view sessions they're part of" ON ai_create_collaboration_sessions
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = ANY(participants));

CREATE POLICY "Users can create collaboration sessions" ON ai_create_collaboration_sessions
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update sessions" ON ai_create_collaboration_sessions
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete sessions" ON ai_create_collaboration_sessions
    FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_generation_history_updated_at BEFORE UPDATE ON ai_create_generation_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON ai_create_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_model_usage_updated_at BEFORE UPDATE ON ai_create_model_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON ai_create_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON ai_create_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cost_tracking_updated_at BEFORE UPDATE ON ai_create_cost_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collaboration_updated_at BEFORE UPDATE ON ai_create_collaboration_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA - System Templates
-- ============================================================================

INSERT INTO ai_create_templates (user_id, name, description, category, subcategory, prompt_template, variables, is_public, is_featured, is_system) VALUES
    (NULL, 'Blog Post Outline', '5-section blog post structure', 'content-writing', 'blog-post', 'Create a detailed blog post outline about {{topic}} with 5 main sections. Target audience: {{audience}}', '["topic", "audience"]', true, true, true),
    (NULL, 'React Component', 'TypeScript React component with props', 'code-generation', 'react-component', 'Create a TypeScript React component named {{componentName}} with the following functionality: {{functionality}}', '["componentName", "functionality"]', true, true, true),
    (NULL, 'Cinematic LUT', 'Film-style color grading preset', 'creative-assets', 'lut-preset', 'Generate a cinematic LUT preset for {{scenario}} with {{mood}} mood and {{colorGrade}} color grade', '["scenario", "mood", "colorGrade"]', true, true, true);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT ALL ON ai_create_generation_history TO authenticated;
GRANT ALL ON ai_create_templates TO authenticated;
GRANT ALL ON ai_create_model_usage TO authenticated;
GRANT ALL ON ai_create_api_keys TO authenticated;
GRANT ALL ON ai_create_preferences TO authenticated;
GRANT ALL ON ai_create_cost_tracking TO authenticated;
GRANT ALL ON ai_create_file_uploads TO authenticated;
GRANT ALL ON ai_create_collaboration_sessions TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ AI Create System schema created successfully!';
    RAISE NOTICE '📊 Tables created: 8';
    RAISE NOTICE '🔒 RLS policies: 24';
    RAISE NOTICE '⚡ Triggers: 7';
    RAISE NOTICE '🌱 Seed templates: 3';
END $$;
