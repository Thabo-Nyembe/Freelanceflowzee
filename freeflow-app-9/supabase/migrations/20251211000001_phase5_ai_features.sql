-- ============================================================================
-- PHASE 5: AI FEATURES - COMPREHENSIVE DATABASE MIGRATION
-- ============================================================================
-- This migration creates all tables needed for Phase 5 AI Features:
-- - AI Content Generation
-- - AI Design Tools
-- - AI Copywriting
-- - AI Image Generation (Enhanced)
-- - AI Analytics
-- - AI Recommendations
-- ============================================================================

-- ============================================================================
-- AI CONTENT GENERATION TABLES
-- ============================================================================

-- Content templates table
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

-- Generated content history
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

-- Content variations
CREATE TABLE IF NOT EXISTS ai_content_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_content_id UUID REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    variation_type VARCHAR(50) NOT NULL, -- 'style', 'tone', 'length', 'format'
    variation_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AI DESIGN TOOLS TABLES
-- ============================================================================

-- Brand assets library
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

-- Color palettes
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

-- Design concepts/mockups
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

-- Brand guidelines
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

-- ============================================================================
-- AI COPYWRITING TABLES
-- ============================================================================

-- Brand voice profiles
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

-- Copy swipe file
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

-- Generated copy history
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

-- Email sequences
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

-- ============================================================================
-- AI IMAGE GENERATION TABLES
-- ============================================================================

-- Generated images
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

-- Image collections
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

-- Collection items junction table
CREATE TABLE IF NOT EXISTS ai_collection_images (
    collection_id UUID REFERENCES ai_image_collections(id) ON DELETE CASCADE,
    image_id UUID REFERENCES ai_generated_images(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_id, image_id)
);

-- Image generation presets
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

-- ============================================================================
-- AI ANALYTICS TABLES
-- ============================================================================

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics metrics
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'counter', 'gauge', 'histogram'
    value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}',
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics reports
CREATE TABLE IF NOT EXISTS analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    analytics_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    schedule VARCHAR(50), -- 'daily', 'weekly', 'monthly', null for one-time
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics alerts
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

-- Audience analytics
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

-- Revenue analytics
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

-- Content analytics
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

-- Engagement metrics
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

-- Cohort analytics
CREATE TABLE IF NOT EXISTS user_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cohort_date DATE NOT NULL,
    cohort_size INTEGER NOT NULL,
    retention_data JSONB DEFAULT '[]', -- Array of retention numbers by week
    ltv_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attribution touchpoints
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

-- Churn analytics
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

-- Customer LTV
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

-- ============================================================================
-- AI RECOMMENDATIONS TABLES
-- ============================================================================

-- Recommendation feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(255) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL, -- 'helpful', 'not_helpful', 'implemented'
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation history
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

-- User preferences for recommendations
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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Content generation indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_templates_user ON ai_content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_templates_type ON ai_content_templates(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_user ON ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_created ON ai_generated_content(created_at DESC);

-- Design tools indexes
CREATE INDEX IF NOT EXISTS idx_ai_brand_assets_user ON ai_brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_brand_assets_type ON ai_brand_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_ai_color_palettes_user ON ai_color_palettes(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_design_concepts_user ON ai_design_concepts(user_id);

-- Copywriting indexes
CREATE INDEX IF NOT EXISTS idx_ai_brand_voices_user ON ai_brand_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_swipe_file_user ON ai_swipe_file(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_swipe_file_type ON ai_swipe_file(copy_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_copy_user ON ai_generated_copy(user_id);

-- Image generation indexes
CREATE INDEX IF NOT EXISTS idx_ai_generated_images_user ON ai_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_images_provider ON ai_generated_images(provider);
CREATE INDEX IF NOT EXISTS idx_ai_generated_images_created ON ai_generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_image_collections_user ON ai_image_collections(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_user ON analytics_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_user_date ON revenue_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_content_analytics_user ON content_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_user_date ON engagement_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_user ON attribution_touchpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_attribution_touchpoints_visitor ON attribution_touchpoints(visitor_id);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_user ON recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_status ON recommendation_history(status);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ai_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_design_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_swipe_file ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_image_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_image_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ltv ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'ai_content_templates', 'ai_generated_content', 'ai_content_variations',
        'ai_brand_assets', 'ai_color_palettes', 'ai_design_concepts', 'ai_brand_guidelines',
        'ai_brand_voices', 'ai_swipe_file', 'ai_generated_copy', 'ai_email_sequences',
        'ai_generated_images', 'ai_image_collections', 'ai_image_presets',
        'analytics_events', 'analytics_metrics', 'analytics_reports', 'analytics_alerts',
        'audience_analytics', 'revenue_analytics', 'content_analytics', 'engagement_metrics',
        'user_cohorts', 'attribution_touchpoints', 'churn_analytics', 'customer_ltv',
        'recommendation_feedback', 'recommendation_history', 'recommendation_preferences'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        -- Drop existing policies if they exist
        EXECUTE format('DROP POLICY IF EXISTS %I_select_own ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS %I_insert_own ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS %I_update_own ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS %I_delete_own ON %I', table_name, table_name);

        -- Create new policies
        EXECUTE format('CREATE POLICY %I_select_own ON %I FOR SELECT USING (auth.uid() = user_id)', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_insert_own ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_update_own ON %I FOR UPDATE USING (auth.uid() = user_id)', table_name, table_name);
        EXECUTE format('CREATE POLICY %I_delete_own ON %I FOR DELETE USING (auth.uid() = user_id)', table_name, table_name);
    END LOOP;
END $$;

-- Special policy for collection_images (junction table)
DROP POLICY IF EXISTS ai_collection_images_select ON ai_collection_images;
DROP POLICY IF EXISTS ai_collection_images_insert ON ai_collection_images;
DROP POLICY IF EXISTS ai_collection_images_delete ON ai_collection_images;

CREATE POLICY ai_collection_images_select ON ai_collection_images
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ai_image_collections WHERE id = collection_id AND user_id = auth.uid())
    );

CREATE POLICY ai_collection_images_insert ON ai_collection_images
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM ai_image_collections WHERE id = collection_id AND user_id = auth.uid())
    );

CREATE POLICY ai_collection_images_delete ON ai_collection_images
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM ai_image_collections WHERE id = collection_id AND user_id = auth.uid())
    );

-- Public templates policy (for shared templates)
DROP POLICY IF EXISTS ai_content_templates_select_public ON ai_content_templates;
CREATE POLICY ai_content_templates_select_public ON ai_content_templates
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS FOR AI FEATURES
-- ============================================================================

-- Function to update content template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ai_content_templates
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate content SEO score
CREATE OR REPLACE FUNCTION calculate_seo_score(content TEXT, keywords JSONB DEFAULT '[]')
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 50;
    word_count INTEGER;
    keyword_count INTEGER;
    keyword TEXT;
BEGIN
    -- Base score adjustments
    word_count := array_length(regexp_split_to_array(content, '\s+'), 1);

    -- Word count scoring
    IF word_count >= 300 AND word_count <= 500 THEN
        score := score + 10;
    ELSIF word_count >= 500 AND word_count <= 1500 THEN
        score := score + 20;
    ELSIF word_count >= 1500 AND word_count <= 2500 THEN
        score := score + 25;
    ELSIF word_count > 2500 THEN
        score := score + 15;
    END IF;

    -- Keyword density scoring
    FOR keyword IN SELECT jsonb_array_elements_text(keywords) LOOP
        keyword_count := (length(content) - length(replace(lower(content), lower(keyword), ''))) / length(keyword);
        IF keyword_count > 0 AND keyword_count <= 5 THEN
            score := score + 5;
        END IF;
    END LOOP;

    RETURN LEAST(100, GREATEST(0, score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to track analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
    p_user_id UUID,
    p_event_type VARCHAR(100),
    p_event_name VARCHAR(255),
    p_event_data JSONB DEFAULT '{}',
    p_session_id VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO analytics_events (user_id, event_type, event_name, event_data, session_id)
    VALUES (p_user_id, p_event_type, p_event_name, p_event_data, p_session_id)
    RETURNING id INTO event_id;

    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommendation summary
CREATE OR REPLACE FUNCTION get_recommendation_summary(p_user_id UUID)
RETURNS TABLE (
    total_viewed INTEGER,
    total_implemented INTEGER,
    total_dismissed INTEGER,
    implementation_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE status = 'viewed')::INTEGER as total_viewed,
        COUNT(*) FILTER (WHERE status = 'implemented')::INTEGER as total_implemented,
        COUNT(*) FILTER (WHERE status = 'dismissed')::INTEGER as total_dismissed,
        CASE
            WHEN COUNT(*) > 0 THEN
                (COUNT(*) FILTER (WHERE status = 'implemented')::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0
        END as implementation_rate
    FROM recommendation_history
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at column
DO $$
DECLARE
    tbl TEXT;
    tables_with_updated_at TEXT[] := ARRAY[
        'ai_content_templates', 'ai_brand_assets', 'ai_design_concepts',
        'ai_brand_guidelines', 'ai_brand_voices', 'ai_email_sequences',
        'ai_image_collections', 'analytics_reports', 'recommendation_history',
        'recommendation_preferences', 'customer_ltv'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_with_updated_at LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', tbl, tbl);
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        ', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Phase 5: AI Features database migration complete!
-- Created tables for:
-- - AI Content Generation (templates, generated content, variations)
-- - AI Design Tools (brand assets, palettes, concepts, guidelines)
-- - AI Copywriting (brand voices, swipe file, copy, email sequences)
-- - AI Image Generation (images, collections, presets)
-- - AI Analytics (events, metrics, reports, alerts, and various analytics types)
-- - AI Recommendations (feedback, history, preferences)
--
-- All tables include:
-- - Proper foreign key relationships
-- - Row Level Security (RLS) policies
-- - Performance indexes
-- - Timestamp management
-- ============================================================================
