-- ============================================
-- AI ASSISTANT SYSTEM MIGRATION
-- ============================================
-- Comprehensive database schema for AI-powered assistant with:
-- - Multi-provider AI conversations (Claude, GPT-4, Gemini)
-- - Message history with ratings and feedback
-- - AI-powered business insights and analytics
-- - Project analysis and recommendations
-- - Voice mode settings
-- - Conversation sharing and export
-- - Real-time analytics tracking
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DROP TYPE IF EXISTS message_type CASCADE;
CREATE TYPE message_type AS ENUM ('user', 'assistant', 'system');
DROP TYPE IF EXISTS ai_provider CASCADE;
CREATE TYPE ai_provider AS ENUM ('anthropic', 'openai', 'google');
DROP TYPE IF EXISTS task_type CASCADE;
CREATE TYPE task_type AS ENUM ('chat', 'analysis', 'creative', 'strategic', 'operational');
DROP TYPE IF EXISTS message_rating CASCADE;
CREATE TYPE message_rating AS ENUM ('up', 'down');
DROP TYPE IF EXISTS insight_category CASCADE;
CREATE TYPE insight_category AS ENUM ('productivity', 'business', 'optimization', 'opportunity', 'growth');
DROP TYPE IF EXISTS insight_priority CASCADE;
CREATE TYPE insight_priority AS ENUM ('high', 'medium', 'low');
DROP TYPE IF EXISTS conversation_status CASCADE;
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'pinned', 'deleted');
DROP TYPE IF EXISTS attachment_type CASCADE;
CREATE TYPE attachment_type AS ENUM ('file', 'image', 'document', 'link');
DROP TYPE IF EXISTS insight_status CASCADE;
CREATE TYPE insight_status AS ENUM ('active', 'dismissed', 'implemented');

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    preview TEXT,
    status conversation_status NOT NULL DEFAULT 'active',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    model ai_provider,
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_response_time DECIMAL(10, 2),
    user_message_count INTEGER DEFAULT 0,
    assistant_message_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3, 2),
    last_message_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_is_pinned ON ai_conversations(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message_at ON ai_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tags ON ai_conversations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_metadata ON ai_conversations USING GIN(metadata);

-- Full-text search for conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_search ON ai_conversations USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(preview, ''))
);

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type message_type NOT NULL,
    rating message_rating,
    tokens INTEGER,
    provider ai_provider,
    cached BOOLEAN DEFAULT FALSE,
    is_loading BOOLEAN DEFAULT FALSE,
    model TEXT,
    temperature DECIMAL(3, 2),
    max_tokens INTEGER,
    response_time DECIMAL(10, 2),
    context_length INTEGER,
    suggestions TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_messages(type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_rating ON ai_messages(rating) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_provider ON ai_messages(provider);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_metadata ON ai_messages USING GIN(metadata);

-- Full-text search for messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_search ON ai_messages USING GIN(
    to_tsvector('english', content)
);

-- ============================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    type attachment_type NOT NULL,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for attachments
CREATE INDEX IF NOT EXISTS idx_ai_message_attachments_message_id ON ai_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_attachments_type ON ai_message_attachments(type);

-- ============================================
-- AI INSIGHTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category insight_category NOT NULL,
    priority insight_priority NOT NULL,
    action TEXT NOT NULL,
    action_url TEXT,
    icon TEXT,
    status insight_status NOT NULL DEFAULT 'active',
    metric TEXT,
    value DECIMAL(10, 2),
    change_percent DECIMAL(5, 2),
    comparison TEXT,
    confidence DECIMAL(3, 2),
    data_source TEXT,
    metadata JSONB DEFAULT '{}',
    dismissed_at TIMESTAMP WITH TIME ZONE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON ai_insights(category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed_at ON ai_insights(dismissed_at) WHERE dismissed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_insights_implemented_at ON ai_insights(implemented_at) WHERE implemented_at IS NOT NULL;

-- ============================================
-- PROJECT ANALYSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_project_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    project_name TEXT NOT NULL,
    status TEXT NOT NULL,
    completion INTEGER NOT NULL CHECK (completion >= 0 AND completion <= 100),
    insights TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    next_actions TEXT[] DEFAULT '{}',
    timeline_adherence INTEGER,
    client_approval_rate INTEGER,
    revision_count INTEGER,
    profit_margin DECIMAL(5, 2),
    efficiency INTEGER,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project analyses
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_user_id ON ai_project_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_project_id ON ai_project_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_status ON ai_project_analyses(status);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_risk_level ON ai_project_analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_project_analyses_generated_at ON ai_project_analyses(generated_at DESC);

-- ============================================
-- QUICK ACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_quick_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    prompt TEXT NOT NULL,
    category TEXT NOT NULL,
    is_default BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quick actions
CREATE INDEX IF NOT EXISTS idx_ai_quick_actions_category ON ai_quick_actions(category);
CREATE INDEX IF NOT EXISTS idx_ai_quick_actions_usage_count ON ai_quick_actions(usage_count DESC);

-- ============================================
-- AI MODELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider ai_provider NOT NULL,
    description TEXT NOT NULL,
    capabilities TEXT[] DEFAULT '{}',
    max_tokens INTEGER NOT NULL,
    cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for models
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON ai_models(is_active) WHERE is_active = TRUE;

-- ============================================
-- VOICE SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_voice_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'en-US',
    voice_id TEXT,
    speed DECIMAL(3, 2) DEFAULT 1.0,
    pitch DECIMAL(3, 2) DEFAULT 1.0,
    auto_speak BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for voice settings
CREATE INDEX IF NOT EXISTS idx_ai_voice_settings_user_id ON ai_voice_settings(user_id);

-- ============================================
-- CONVERSATION SHARES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_conversation_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    password_hash TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shares
CREATE INDEX IF NOT EXISTS idx_ai_conversation_shares_conversation_id ON ai_conversation_shares(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_shares_share_token ON ai_conversation_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_shares_expires_at ON ai_conversation_shares(expires_at);

-- ============================================
-- ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 2) DEFAULT 0,
    avg_response_time DECIMAL(10, 2),
    avg_rating DECIMAL(3, 2),
    most_used_provider ai_provider,
    time_saved_hours DECIMAL(10, 2),
    revenue_impact DECIMAL(10, 2),
    efficiency_score INTEGER,
    optimization_potential INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_ai_analytics_user_id ON ai_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_period ON ai_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_created_at ON ai_analytics(created_at DESC);

-- ============================================
-- MESSAGE FEEDBACK TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_message_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating message_rating NOT NULL,
    feedback_text TEXT,
    categories TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_ai_message_feedback_message_id ON ai_message_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_feedback_user_id ON ai_message_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_feedback_rating ON ai_message_feedback(rating);

-- ============================================
-- CONVERSATION BOOKMARKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ai_conversation_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bookmarks
CREATE INDEX IF NOT EXISTS idx_ai_conversation_bookmarks_conversation_id ON ai_conversation_bookmarks(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_bookmarks_message_id ON ai_conversation_bookmarks(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_bookmarks_user_id ON ai_conversation_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_bookmarks_tags ON ai_conversation_bookmarks USING GIN(tags);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update conversation timestamps
CREATE OR REPLACE FUNCTION update_ai_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversations
    SET
        updated_at = NOW(),
        last_message_at = NEW.created_at,
        message_count = message_count + 1,
        user_message_count = CASE WHEN NEW.type = 'user' THEN user_message_count + 1 ELSE user_message_count END,
        assistant_message_count = CASE WHEN NEW.type = 'assistant' THEN assistant_message_count + 1 ELSE assistant_message_count END,
        total_tokens = total_tokens + COALESCE(NEW.tokens, 0)
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_conversation_timestamp
    AFTER INSERT ON ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_conversation_timestamp();

-- Update conversation statistics on message rating
CREATE OR REPLACE FUNCTION update_ai_conversation_rating()
RETURNS TRIGGER AS $$
DECLARE
    total_ratings INTEGER;
    positive_ratings INTEGER;
    rating_score DECIMAL(3, 2);
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE rating = 'up')
    INTO total_ratings, positive_ratings
    FROM ai_messages
    WHERE conversation_id = NEW.conversation_id AND rating IS NOT NULL;

    IF total_ratings > 0 THEN
        rating_score := (positive_ratings::DECIMAL / total_ratings::DECIMAL);

        UPDATE ai_conversations
        SET avg_rating = rating_score
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_conversation_rating
    AFTER UPDATE OF rating ON ai_messages
    FOR EACH ROW
    WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
    EXECUTE FUNCTION update_ai_conversation_rating();

-- Auto-generate conversation preview from first user message
CREATE OR REPLACE FUNCTION generate_ai_conversation_preview()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'user' THEN
        UPDATE ai_conversations
        SET preview = SUBSTRING(NEW.content FROM 1 FOR 100)
        WHERE id = NEW.conversation_id AND preview IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ai_conversation_preview
    AFTER INSERT ON ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION generate_ai_conversation_preview();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_messages_updated_at
    BEFORE UPDATE ON ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_quick_actions_updated_at
    BEFORE UPDATE ON ai_quick_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_voice_settings_updated_at
    BEFORE UPDATE ON ai_voice_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Increment share view count
CREATE OR REPLACE FUNCTION increment_share_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversation_shares
    SET view_count = view_count + 1
    WHERE share_token = NEW.share_token;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_project_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_message_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_bookmarks ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from their conversations"
    ON ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations"
    ON ai_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their conversations"
    ON ai_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in their conversations"
    ON ai_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Attachments policies
CREATE POLICY "Users can view attachments from their messages"
    ON ai_message_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_messages
            JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
            WHERE ai_messages.id = ai_message_attachments.message_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create attachments in their messages"
    ON ai_message_attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_messages
            JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
            WHERE ai_messages.id = message_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Insights policies
CREATE POLICY "Users can view their own insights"
    ON ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
    ON ai_insights FOR UPDATE
    USING (auth.uid() = user_id);

-- Project analyses policies
CREATE POLICY "Users can view their own project analyses"
    ON ai_project_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project analyses"
    ON ai_project_analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Voice settings policies
CREATE POLICY "Users can view their own voice settings"
    ON ai_voice_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own voice settings"
    ON ai_voice_settings FOR ALL
    USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
    ON ai_analytics FOR SELECT
    USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view their own feedback"
    ON ai_message_feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
    ON ai_message_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can manage their own bookmarks"
    ON ai_conversation_bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- Shares policies (public read for shared conversations)
CREATE POLICY "Anyone can view active shares"
    ON ai_conversation_shares FOR SELECT
    USING (
        is_public = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- Quick actions and models are readable by all authenticated users
ALTER TABLE ai_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quick actions"
    ON ai_quick_actions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view AI models"
    ON ai_models FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get conversation with statistics
CREATE OR REPLACE FUNCTION get_conversation_with_stats(conversation_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    message_count BIGINT,
    total_tokens BIGINT,
    avg_response_time DECIMAL,
    avg_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        COUNT(m.id)::BIGINT as message_count,
        COALESCE(SUM(m.tokens), 0)::BIGINT as total_tokens,
        AVG(m.response_time) as avg_response_time,
        AVG(CASE
            WHEN m.rating = 'up' THEN 1.0
            WHEN m.rating = 'down' THEN 0.0
            ELSE NULL
        END) as avg_rating
    FROM ai_conversations c
    LEFT JOIN ai_messages m ON m.conversation_id = c.id
    WHERE c.id = conversation_uuid
    GROUP BY c.id, c.title;
END;
$$ LANGUAGE plpgsql;

-- Get active insights for user
CREATE OR REPLACE FUNCTION get_active_insights(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category insight_category,
    priority insight_priority,
    action TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.description,
        i.category,
        i.priority,
        i.action,
        i.created_at
    FROM ai_insights i
    WHERE i.user_id = user_uuid
        AND i.status = 'active'
        AND i.dismissed_at IS NULL
        AND i.implemented_at IS NULL
    ORDER BY
        CASE i.priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
        END,
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Search conversations
CREATE OR REPLACE FUNCTION search_conversations(
    user_uuid UUID,
    search_query TEXT
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    preview TEXT,
    message_count INTEGER,
    last_message_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        c.preview,
        c.message_count,
        c.last_message_at,
        ts_rank(
            to_tsvector('english', c.title || ' ' || COALESCE(c.preview, '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM ai_conversations c
    WHERE c.user_id = user_uuid
        AND c.status != 'deleted'
        AND to_tsvector('english', c.title || ' ' || COALESCE(c.preview, '')) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get analytics summary for period
CREATE OR REPLACE FUNCTION get_analytics_summary(
    user_uuid UUID,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    total_conversations BIGINT,
    total_messages BIGINT,
    total_tokens BIGINT,
    avg_response_time DECIMAL,
    positive_rating_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT c.id)::BIGINT as total_conversations,
        COUNT(m.id)::BIGINT as total_messages,
        COALESCE(SUM(m.tokens), 0)::BIGINT as total_tokens,
        AVG(m.response_time) as avg_response_time,
        (COUNT(*) FILTER (WHERE m.rating = 'up')::DECIMAL /
         NULLIF(COUNT(*) FILTER (WHERE m.rating IS NOT NULL), 0) * 100) as positive_rating_percent
    FROM ai_conversations c
    LEFT JOIN ai_messages m ON m.conversation_id = c.id
    WHERE c.user_id = user_uuid
        AND c.created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Get most used AI provider
CREATE OR REPLACE FUNCTION get_most_used_provider(user_uuid UUID)
RETURNS ai_provider AS $$
DECLARE
    top_provider ai_provider;
BEGIN
    SELECT m.provider INTO top_provider
    FROM ai_messages m
    JOIN ai_conversations c ON c.id = m.conversation_id
    WHERE c.user_id = user_uuid
        AND m.provider IS NOT NULL
    GROUP BY m.provider
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    RETURN top_provider;
END;
$$ LANGUAGE plpgsql;

-- Archive old conversations
CREATE OR REPLACE FUNCTION archive_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE ai_conversations
    SET
        status = 'archived',
        is_archived = TRUE
    WHERE status = 'active'
        AND is_pinned = FALSE
        AND last_message_at < NOW() - (days_old || ' days')::INTERVAL;

    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert default AI models
INSERT INTO ai_models (id, name, provider, description, capabilities, max_tokens, cost_per_1k_tokens, strengths, is_active)
VALUES
    ('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'anthropic', 'Best for analysis, reasoning, and strategic thinking',
     ARRAY['analysis', 'reasoning', 'long-context', 'coding', 'research'], 200000, 0.015,
     ARRAY['Complex analysis', 'Strategic planning', 'Technical writing', 'Code review'], TRUE),
    ('gpt-4-turbo', 'GPT-4 Turbo', 'openai', 'Excellent for creative tasks and problem-solving',
     ARRAY['creative', 'general', 'coding', 'image-generation', 'function-calling'], 128000, 0.03,
     ARRAY['Creative writing', 'Brainstorming', 'Content creation', 'Image analysis'], TRUE),
    ('gemini-pro', 'Gemini Pro', 'google', 'Great for general assistance and multimodal tasks',
     ARRAY['multimodal', 'general', 'quick-response', 'search-integration'], 32000, 0.01,
     ARRAY['Quick answers', 'Multimodal tasks', 'Real-time info', 'General assistance'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insert default quick actions
INSERT INTO ai_quick_actions (label, description, icon, prompt, category)
VALUES
    ('Analyze My Projects', 'Get AI-powered insights on project performance', 'BarChart3',
     'Can you analyze my current projects and provide insights on performance, timelines, and optimization opportunities?', 'analysis'),
    ('Optimize Workflow', 'Receive personalized workflow suggestions', 'TrendingUp',
     'Help me optimize my daily workflow and suggest productivity improvements based on my work patterns.', 'productivity'),
    ('Pricing Guidance', 'Get market-based pricing recommendations', 'DollarSign',
     'I need guidance on pricing my services. Can you analyze market rates and suggest optimal pricing strategies?', 'business'),
    ('Client Communication', 'Create communication templates', 'MessageSquare',
     'Help me improve my client communication and create templates for common scenarios.', 'communication'),
    ('Time Management', 'Analyze time allocation patterns', 'Clock',
     'Analyze my time allocation and suggest better time management strategies.', 'productivity'),
    ('Business Insights', 'Receive comprehensive business insights', 'Brain',
     'Provide insights on my business performance and suggest growth opportunities.', 'business')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE ai_conversations IS 'Stores AI assistant conversation threads';
COMMENT ON TABLE ai_messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE ai_insights IS 'AI-generated business insights and recommendations';
COMMENT ON TABLE ai_project_analyses IS 'AI-powered project performance analyses';
COMMENT ON TABLE ai_analytics IS 'Aggregated analytics for AI assistant usage';
COMMENT ON TABLE ai_voice_settings IS 'User voice mode preferences';
COMMENT ON TABLE ai_conversation_shares IS 'Shareable conversation links';
-- ============================================================================
-- AI Code Completion System - Production Database Schema
-- ============================================================================
-- Comprehensive AI-powered code completion, analysis, optimization, and
-- intelligent code generation with bug detection and security scanning
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS programming_language CASCADE;
CREATE TYPE programming_language AS ENUM (
  'javascript', 'typescript', 'python', 'react', 'vue', 'angular',
  'node', 'php', 'java', 'csharp', 'cpp', 'rust', 'go', 'swift',
  'kotlin', 'ruby', 'scala', 'dart'
);

DROP TYPE IF EXISTS completion_status CASCADE;
CREATE TYPE completion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
DROP TYPE IF EXISTS bug_severity CASCADE;
CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
DROP TYPE IF EXISTS bug_type CASCADE;
CREATE TYPE bug_type AS ENUM ('syntax', 'logic', 'security', 'performance', 'style', 'type');
DROP TYPE IF EXISTS suggestion_type CASCADE;
CREATE TYPE suggestion_type AS ENUM ('optimization', 'refactoring', 'security', 'best_practice', 'documentation');
DROP TYPE IF EXISTS analysis_type CASCADE;
CREATE TYPE analysis_type AS ENUM ('bugs', 'security', 'performance', 'complexity', 'coverage');
DROP TYPE IF EXISTS template_category CASCADE;
CREATE TYPE template_category AS ENUM ('component', 'api', 'hook', 'utility', 'test', 'config');
DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM ('gist', 'markdown', 'pdf', 'html', 'zip');
DROP TYPE IF EXISTS ai_model CASCADE;
CREATE TYPE ai_model AS ENUM ('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'codex', 'copilot');
DROP TYPE IF EXISTS impact_level CASCADE;
CREATE TYPE impact_level AS ENUM ('high', 'medium', 'low');
DROP TYPE IF EXISTS version_action CASCADE;
CREATE TYPE version_action AS ENUM ('create', 'edit', 'optimize', 'refactor', 'manual_save');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Code Completions
CREATE TABLE IF NOT EXISTS code_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language programming_language NOT NULL,
  original_code TEXT NOT NULL,
  completed_code TEXT NOT NULL,
  prompt TEXT,
  model ai_model NOT NULL DEFAULT 'gpt-4',
  status completion_status NOT NULL DEFAULT 'pending',
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Code Snippets
CREATE TABLE IF NOT EXISTS code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  category template_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bug Reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  type bug_type NOT NULL,
  severity bug_severity NOT NULL,
  message TEXT NOT NULL,
  suggestion TEXT,
  code_snippet TEXT,
  auto_fixable BOOLEAN NOT NULL DEFAULT FALSE,
  fixed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Suggestions
CREATE TABLE IF NOT EXISTS code_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  type suggestion_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact impact_level NOT NULL,
  effort impact_level NOT NULL,
  code_example TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Analysis
CREATE TABLE IF NOT EXISTS code_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  type analysis_type NOT NULL,
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  lines_of_code INTEGER NOT NULL DEFAULT 0,
  complexity INTEGER NOT NULL DEFAULT 0,
  maintainability INTEGER CHECK (maintainability >= 0 AND maintainability <= 100),
  test_coverage INTEGER CHECK (test_coverage >= 0 AND test_coverage <= 100),
  duplicate_code INTEGER CHECK (duplicate_code >= 0 AND duplicate_code <= 100),
  comment_ratio DECIMAL(5, 2) NOT NULL DEFAULT 0,
  function_count INTEGER NOT NULL DEFAULT 0,
  class_count INTEGER NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Issues
CREATE TABLE IF NOT EXISTS security_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES code_analysis(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity bug_severity NOT NULL,
  description TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  recommendation TEXT NOT NULL,
  cwe TEXT, -- Common Weakness Enumeration
  owasp TEXT, -- OWASP Top 10
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Templates
CREATE TABLE IF NOT EXISTS code_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category template_category NOT NULL,
  language programming_language NOT NULL,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER NOT NULL DEFAULT 0, -- minutes
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Versions
CREATE TABLE IF NOT EXISTS code_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  action version_action NOT NULL,
  additions INTEGER NOT NULL DEFAULT 0,
  deletions INTEGER NOT NULL DEFAULT 0,
  modifications INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Exports
CREATE TABLE IF NOT EXISTS code_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  format export_format NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Code Stats
CREATE TABLE IF NOT EXISTS ai_code_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_completions INTEGER NOT NULL DEFAULT 0,
  total_tokens_used INTEGER NOT NULL DEFAULT 0,
  average_confidence DECIMAL(5, 2) NOT NULL DEFAULT 0,
  favorite_language programming_language,
  total_bugs_fixed INTEGER NOT NULL DEFAULT 0,
  total_optimizations INTEGER NOT NULL DEFAULT 0,
  code_quality_improvement DECIMAL(5, 2) NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Code Completions indexes
CREATE INDEX IF NOT EXISTS idx_code_completions_user_id ON code_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_completions_language ON code_completions(language);
CREATE INDEX IF NOT EXISTS idx_code_completions_status ON code_completions(status);
CREATE INDEX IF NOT EXISTS idx_code_completions_model ON code_completions(model);
CREATE INDEX IF NOT EXISTS idx_code_completions_created_at ON code_completions(created_at DESC);

-- Code Snippets indexes
CREATE INDEX IF NOT EXISTS idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_language ON code_snippets(language);
CREATE INDEX IF NOT EXISTS idx_code_snippets_category ON code_snippets(category);
CREATE INDEX IF NOT EXISTS idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_code_snippets_tags ON code_snippets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_code_snippets_usage_count ON code_snippets(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_code_snippets_likes ON code_snippets(likes DESC);

-- Bug Reports indexes
CREATE INDEX IF NOT EXISTS idx_bug_reports_analysis_id ON bug_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_type ON bug_reports(type);
CREATE INDEX IF NOT EXISTS idx_bug_reports_fixed ON bug_reports(fixed);

-- Code Suggestions indexes
CREATE INDEX IF NOT EXISTS idx_code_suggestions_analysis_id ON code_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_type ON code_suggestions(type);
CREATE INDEX IF NOT EXISTS idx_code_suggestions_priority ON code_suggestions(priority DESC);

-- Code Analysis indexes
CREATE INDEX IF NOT EXISTS idx_code_analysis_user_id ON code_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_code_analysis_language ON code_analysis(language);
CREATE INDEX IF NOT EXISTS idx_code_analysis_type ON code_analysis(type);
CREATE INDEX IF NOT EXISTS idx_code_analysis_quality_score ON code_analysis(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_code_analysis_analyzed_at ON code_analysis(analyzed_at DESC);

-- Security Issues indexes
CREATE INDEX IF NOT EXISTS idx_security_issues_analysis_id ON security_issues(analysis_id);
CREATE INDEX IF NOT EXISTS idx_security_issues_severity ON security_issues(severity);
CREATE INDEX IF NOT EXISTS idx_security_issues_type ON security_issues(type);

-- Code Templates indexes
CREATE INDEX IF NOT EXISTS idx_code_templates_user_id ON code_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_code_templates_category ON code_templates(category);
CREATE INDEX IF NOT EXISTS idx_code_templates_language ON code_templates(language);
CREATE INDEX IF NOT EXISTS idx_code_templates_is_public ON code_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_code_templates_tags ON code_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_code_templates_usage_count ON code_templates(usage_count DESC);

-- Code Versions indexes
CREATE INDEX IF NOT EXISTS idx_code_versions_snippet_id ON code_versions(snippet_id);
CREATE INDEX IF NOT EXISTS idx_code_versions_created_at ON code_versions(created_at DESC);

-- Code Exports indexes
CREATE INDEX IF NOT EXISTS idx_code_exports_user_id ON code_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_code_exports_format ON code_exports(format);
CREATE INDEX IF NOT EXISTS idx_code_exports_created_at ON code_exports(created_at DESC);

-- AI Code Stats indexes
CREATE INDEX IF NOT EXISTS idx_ai_code_stats_user_id ON ai_code_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_templates_updated_at
  BEFORE UPDATE ON code_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_code_stats_updated_at
  BEFORE UPDATE ON ai_code_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on completion
CREATE OR REPLACE FUNCTION update_ai_code_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO ai_code_stats (user_id, total_completions, total_tokens_used, average_confidence, favorite_language)
    VALUES (NEW.user_id, 1, NEW.tokens_used, NEW.confidence, NEW.language)
    ON CONFLICT (user_id) DO UPDATE
    SET
      total_completions = ai_code_stats.total_completions + 1,
      total_tokens_used = ai_code_stats.total_tokens_used + NEW.tokens_used,
      average_confidence = (ai_code_stats.average_confidence * ai_code_stats.total_completions + NEW.confidence) / (ai_code_stats.total_completions + 1),
      favorite_language = NEW.language,
      last_used_at = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_completion_trigger
  AFTER INSERT OR UPDATE ON code_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_stats_on_completion();

-- Auto-increment usage count
CREATE OR REPLACE FUNCTION increment_snippet_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE code_snippets
  SET usage_count = usage_count + 1
  WHERE id = NEW.snippet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get completion statistics
CREATE OR REPLACE FUNCTION get_completion_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalCompletions', COUNT(*),
    'completedCount', COUNT(*) FILTER (WHERE status = 'completed'),
    'averageConfidence', ROUND(AVG(confidence), 2),
    'totalTokens', SUM(tokens_used),
    'averageProcessingTime', ROUND(AVG(processing_time), 0),
    'topLanguage', (
      SELECT language
      FROM code_completions
      WHERE user_id = p_user_id AND created_at >= CURRENT_DATE - p_days
      GROUP BY language
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  )
  INTO v_stats
  FROM code_completions
  WHERE user_id = p_user_id AND created_at >= CURRENT_DATE - p_days;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Get code quality summary
CREATE OR REPLACE FUNCTION get_code_quality_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_summary JSON;
BEGIN
  SELECT json_build_object(
    'averageQuality', ROUND(AVG(quality_score), 2),
    'averageMaintainability', ROUND(AVG(maintainability), 2),
    'totalBugs', (
      SELECT COUNT(*)
      FROM bug_reports br
      JOIN code_analysis ca ON br.analysis_id = ca.id
      WHERE ca.user_id = p_user_id
    ),
    'criticalBugs', (
      SELECT COUNT(*)
      FROM bug_reports br
      JOIN code_analysis ca ON br.analysis_id = ca.id
      WHERE ca.user_id = p_user_id AND br.severity = 'critical'
    ),
    'securityIssues', (
      SELECT COUNT(*)
      FROM security_issues si
      JOIN code_analysis ca ON si.analysis_id = ca.id
      WHERE ca.user_id = p_user_id
    )
  )
  INTO v_summary
  FROM code_analysis
  WHERE user_id = p_user_id;

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Get popular snippets
CREATE OR REPLACE FUNCTION get_popular_snippets(p_language programming_language DEFAULT NULL, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  language programming_language,
  category template_category,
  usage_count INTEGER,
  likes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.id, cs.name, cs.language, cs.category, cs.usage_count, cs.likes
  FROM code_snippets cs
  WHERE cs.is_public = TRUE
    AND (p_language IS NULL OR cs.language = p_language)
  ORDER BY cs.usage_count DESC, cs.likes DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Analyze code complexity
CREATE OR REPLACE FUNCTION analyze_code_complexity(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_lines INTEGER;
  v_functions INTEGER;
  v_complexity INTEGER;
  v_result JSON;
BEGIN
  v_lines := array_length(string_to_array(p_code, E'\n'), 1);
  v_functions := array_length(regexp_split_to_array(p_code, 'function'), 1) - 1;
  v_complexity := 1 +
    array_length(regexp_split_to_array(p_code, 'if'), 1) - 1 +
    array_length(regexp_split_to_array(p_code, 'for'), 1) - 1 +
    array_length(regexp_split_to_array(p_code, 'while'), 1) - 1;

  SELECT json_build_object(
    'linesOfCode', v_lines,
    'functionCount', v_functions,
    'cyclomaticComplexity', v_complexity,
    'averageFunctionLength', CASE WHEN v_functions > 0 THEN v_lines::DECIMAL / v_functions ELSE 0 END
  )
  INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get user's AI coding insights
CREATE OR REPLACE FUNCTION get_user_ai_insights(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_insights JSON;
BEGIN
  SELECT json_build_object(
    'stats', row_to_json(acs.*),
    'recentCompletions', (
      SELECT json_agg(json_build_object(
        'id', cc.id,
        'language', cc.language,
        'confidence', cc.confidence,
        'createdAt', cc.created_at
      ))
      FROM (
        SELECT id, language, confidence, created_at
        FROM code_completions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) cc
    ),
    'topSnippets', (
      SELECT json_agg(json_build_object(
        'id', cs.id,
        'name', cs.name,
        'language', cs.language,
        'usageCount', cs.usage_count
      ))
      FROM (
        SELECT id, name, language, usage_count
        FROM code_snippets
        WHERE user_id = p_user_id
        ORDER BY usage_count DESC
        LIMIT 5
      ) cs
    )
  )
  INTO v_insights
  FROM ai_code_stats acs
  WHERE acs.user_id = p_user_id;

  RETURN v_insights;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE code_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_code_stats ENABLE ROW LEVEL SECURITY;

-- Code Completions policies
CREATE POLICY "Users can view their own completions"
  ON code_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own completions"
  ON code_completions FOR ALL
  USING (auth.uid() = user_id);

-- Code Snippets policies
CREATE POLICY "Users can view public snippets"
  ON code_snippets FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own snippets"
  ON code_snippets FOR ALL
  USING (auth.uid() = user_id);

-- Code Analysis policies (with related tables access through analysis_id)
CREATE POLICY "Users can view their own analysis"
  ON code_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own analysis"
  ON code_analysis FOR ALL
  USING (auth.uid() = user_id);

-- Bug Reports policies
CREATE POLICY "Users can view bugs from their analysis"
  ON bug_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = bug_reports.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage bugs from their analysis"
  ON bug_reports FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = bug_reports.analysis_id AND user_id = auth.uid()
  ));

-- Code Suggestions policies
CREATE POLICY "Users can view suggestions from their analysis"
  ON code_suggestions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = code_suggestions.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage suggestions from their analysis"
  ON code_suggestions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = code_suggestions.analysis_id AND user_id = auth.uid()
  ));

-- Security Issues policies
CREATE POLICY "Users can view security issues from their analysis"
  ON security_issues FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = security_issues.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage security issues from their analysis"
  ON security_issues FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = security_issues.analysis_id AND user_id = auth.uid()
  ));

-- Code Templates policies
CREATE POLICY "Users can view public templates"
  ON code_templates FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates"
  ON code_templates FOR ALL
  USING (auth.uid() = user_id);

-- Code Versions policies
CREATE POLICY "Users can view versions of their snippets"
  ON code_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_snippets
    WHERE id = code_versions.snippet_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage versions of their snippets"
  ON code_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_snippets
    WHERE id = code_versions.snippet_id AND user_id = auth.uid()
  ));

-- Code Exports policies
CREATE POLICY "Users can view their own exports"
  ON code_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exports"
  ON code_exports FOR ALL
  USING (auth.uid() = user_id);

-- AI Code Stats policies
CREATE POLICY "Users can view their own stats"
  ON ai_code_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stats"
  ON ai_code_stats FOR ALL
  USING (auth.uid() = user_id);
-- =====================================================
-- AI CREATE SYSTEM MIGRATION
-- =====================================================
-- Migration for AI-powered creative asset generation
-- Includes: Assets, Versions, Models, Generation History
-- Date: 2025-11-26
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- GENERATED ASSETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_generated_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Asset metadata
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  field TEXT NOT NULL CHECK (field IN (
    'photography', 'videography', 'ui-ux-design', 'graphic-design',
    'music-production', 'web-development', 'software-development', 'content-writing'
  )),
  style TEXT NOT NULL,
  color_scheme TEXT NOT NULL,

  -- File information
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_format TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  dimensions TEXT,
  duration INTEGER, -- For video/audio in seconds

  -- Generation details
  prompt TEXT NOT NULL,
  generation_settings JSONB DEFAULT '{}',
  ai_model_id TEXT REFERENCES ai_models(id),
  quality TEXT NOT NULL DEFAULT 'standard' CHECK (quality IN ('draft', 'standard', 'professional', 'premium')),

  -- Engagement metrics
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- UPS Integration
  has_ups_feedback BOOLEAN DEFAULT false,
  ups_comment_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- ASSET VERSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,

  -- Version details
  version_number INTEGER NOT NULL,
  changes TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  -- Generation details
  prompt TEXT,
  generation_settings JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Ensure unique version numbers per asset
  UNIQUE(asset_id, version_number)
);

-- =====================================================
-- AI MODELS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,

  -- Model configuration
  category TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  version TEXT,

  -- Performance metrics
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  average_generation_time INTEGER, -- in seconds

  -- Pricing
  cost_per_generation NUMERIC(10, 4) DEFAULT 0,
  cost_currency TEXT DEFAULT 'USD',
  is_free BOOLEAN DEFAULT false,

  -- Availability
  is_active BOOLEAN DEFAULT true,
  max_concurrent_generations INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- GENERATION HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES ai_generated_assets(id) ON DELETE SET NULL,

  -- Generation details
  field TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  settings JSONB DEFAULT '{}',

  -- AI model used
  ai_model_id TEXT REFERENCES ai_models(id),
  model_name TEXT NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  error_message TEXT,

  -- Performance metrics
  generation_time_seconds INTEGER,
  cost NUMERIC(10, 4),

  -- Result
  result_url TEXT,
  result_metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- ASSET COLLECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_asset_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection details
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COLLECTION ASSETS JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_collection_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES ai_asset_collections(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,

  -- Order in collection
  position INTEGER DEFAULT 0,

  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique asset per collection
  UNIQUE(collection_id, asset_id)
);

-- =====================================================
-- ASSET LIKES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_asset_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique like per user per asset
  UNIQUE(asset_id, user_id)
);

-- =====================================================
-- ASSET DOWNLOADS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_asset_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Download details
  format TEXT NOT NULL,
  quality TEXT,
  file_size BIGINT,

  -- Timestamps
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- IP tracking (optional, for analytics)
  ip_address INET,
  user_agent TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Generated Assets indexes
CREATE INDEX IF NOT EXISTS idx_ai_assets_user ON ai_generated_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assets_project ON ai_generated_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_assets_field ON ai_generated_assets(field);
CREATE INDEX IF NOT EXISTS idx_ai_assets_type ON ai_generated_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_ai_assets_quality ON ai_generated_assets(quality);
CREATE INDEX IF NOT EXISTS idx_ai_assets_created ON ai_generated_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_assets_downloads ON ai_generated_assets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_ai_assets_likes ON ai_generated_assets(likes DESC);
CREATE INDEX IF NOT EXISTS idx_ai_assets_ups_feedback ON ai_generated_assets(has_ups_feedback);

-- Asset Versions indexes
CREATE INDEX IF NOT EXISTS idx_ai_versions_asset ON ai_asset_versions(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_versions_created ON ai_asset_versions(created_at DESC);

-- AI Models indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_active ON ai_models(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_models_free ON ai_models(is_free);
CREATE INDEX IF NOT EXISTS idx_ai_models_performance ON ai_models(performance_score DESC);

-- Generation History indexes
CREATE INDEX IF NOT EXISTS idx_ai_history_user ON ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_asset ON ai_generation_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_status ON ai_generation_history(status);
CREATE INDEX IF NOT EXISTS idx_ai_history_created ON ai_generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_history_model ON ai_generation_history(ai_model_id);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_ai_collections_user ON ai_asset_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_collections_public ON ai_asset_collections(is_public);

-- Collection Assets indexes
CREATE INDEX IF NOT EXISTS idx_ai_collection_assets_collection ON ai_collection_assets(collection_id);
CREATE INDEX IF NOT EXISTS idx_ai_collection_assets_asset ON ai_collection_assets(asset_id);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_ai_likes_asset ON ai_asset_likes(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_likes_user ON ai_asset_likes(user_id);

-- Downloads indexes
CREATE INDEX IF NOT EXISTS idx_ai_downloads_asset ON ai_asset_downloads(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_downloads_user ON ai_asset_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_downloads_date ON ai_asset_downloads(downloaded_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ai_generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_collection_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_downloads ENABLE ROW LEVEL SECURITY;

-- Generated Assets policies
CREATE POLICY ai_assets_select ON ai_generated_assets FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = ai_generated_assets.project_id
    AND pm.user_id = auth.uid()
  ));

CREATE POLICY ai_assets_insert ON ai_generated_assets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_assets_update ON ai_generated_assets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY ai_assets_delete ON ai_generated_assets FOR DELETE
  USING (user_id = auth.uid());

-- Asset Versions policies
CREATE POLICY ai_versions_select ON ai_asset_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_generated_assets a
    WHERE a.id = ai_asset_versions.asset_id
    AND a.user_id = auth.uid()
  ));

CREATE POLICY ai_versions_insert ON ai_asset_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ai_generated_assets a
    WHERE a.id = ai_asset_versions.asset_id
    AND a.user_id = auth.uid()
  ));

-- AI Models policies (public read)
CREATE POLICY ai_models_select ON ai_models FOR SELECT
  USING (is_active = true);

-- Generation History policies
CREATE POLICY ai_history_select ON ai_generation_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY ai_history_insert ON ai_generation_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_history_update ON ai_generation_history FOR UPDATE
  USING (user_id = auth.uid());

-- Collections policies
CREATE POLICY ai_collections_select ON ai_asset_collections FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY ai_collections_insert ON ai_asset_collections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_collections_update ON ai_asset_collections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY ai_collections_delete ON ai_asset_collections FOR DELETE
  USING (user_id = auth.uid());

-- Collection Assets policies
CREATE POLICY ai_collection_assets_select ON ai_collection_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_asset_collections c
    WHERE c.id = ai_collection_assets.collection_id
    AND (c.user_id = auth.uid() OR c.is_public = true)
  ));

CREATE POLICY ai_collection_assets_insert ON ai_collection_assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ai_asset_collections c
    WHERE c.id = ai_collection_assets.collection_id
    AND c.user_id = auth.uid()
  ));

CREATE POLICY ai_collection_assets_delete ON ai_collection_assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM ai_asset_collections c
    WHERE c.id = ai_collection_assets.collection_id
    AND c.user_id = auth.uid()
  ));

-- Likes policies
CREATE POLICY ai_likes_select ON ai_asset_likes FOR SELECT
  USING (true); -- Anyone can see likes

CREATE POLICY ai_likes_insert ON ai_asset_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_likes_delete ON ai_asset_likes FOR DELETE
  USING (user_id = auth.uid());

-- Downloads policies
CREATE POLICY ai_downloads_select ON ai_asset_downloads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY ai_downloads_insert ON ai_asset_downloads FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_assets_updated_at
  BEFORE UPDATE ON ai_generated_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_collections_updated_at
  BEFORE UPDATE ON ai_asset_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment asset engagement metrics
CREATE OR REPLACE FUNCTION increment_asset_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_generated_assets
  SET downloads = downloads + 1
  WHERE id = NEW.asset_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_downloads
  AFTER INSERT ON ai_asset_downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_asset_downloads();

CREATE OR REPLACE FUNCTION handle_asset_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_generated_assets
    SET likes = likes + 1
    WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ai_generated_assets
    SET likes = likes - 1
    WHERE id = OLD.asset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_like
  AFTER INSERT OR DELETE ON ai_asset_likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_asset_like();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's total generations count
CREATE OR REPLACE FUNCTION get_user_generation_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM ai_generated_assets
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's total generation cost
CREATE OR REPLACE FUNCTION get_user_total_generation_cost(p_user_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(cost), 0)
    FROM ai_generation_history
    WHERE user_id = p_user_id
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get most popular assets
CREATE OR REPLACE FUNCTION get_popular_assets(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  asset_id UUID,
  asset_name TEXT,
  downloads INTEGER,
  likes INTEGER,
  popularity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id as asset_id,
    name as asset_name,
    ai_generated_assets.downloads,
    ai_generated_assets.likes,
    (ai_generated_assets.downloads * 1.0 + ai_generated_assets.likes * 2.0) as popularity_score
  FROM ai_generated_assets
  ORDER BY popularity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA: AI MODELS
-- =====================================================

INSERT INTO ai_models (name, provider, category, description, performance_score, cost_per_generation, is_free, is_active) VALUES
-- Free Models
('Llama 3.1 70B', 'OpenRouter (Meta)', ARRAY['text', 'content'], 'Open-source large language model', 85, 0, true, true),
('Mistral 7B', 'OpenRouter (Mistral)', ARRAY['text', 'code'], 'Efficient open-source model', 82, 0, true, true),
('Stable Diffusion 1.5', 'Stability AI', ARRAY['image', 'design'], 'Open-source image generation', 78, 0, true, true),
('MusicGen Small', 'Meta', ARRAY['audio', 'music'], 'AI music generation model', 75, 0, true, true),

-- Affordable Premium Models
('GPT-3.5 Turbo', 'OpenAI', ARRAY['text', 'code', 'content'], 'Fast and efficient ChatGPT model', 88, 0.06, false, true),
('Claude 3 Haiku', 'Anthropic', ARRAY['text', 'code', 'content'], 'Fast Claude model', 87, 0.12, false, true),
('Gemini 1.5 Flash', 'Google', ARRAY['text', 'code', 'multimodal'], 'Fast multimodal model', 86, 0.18, false, true),
('DALL-E 2', 'OpenAI', ARRAY['image', 'design'], 'Previous generation image model', 82, 0.36, false, true),

-- Premium Models
('GPT-4o', 'OpenAI', ARRAY['text', 'code', 'content', 'multimodal'], 'Latest GPT-4 with vision', 95, 2.50, false, true),
('Claude 3.5 Sonnet', 'Anthropic', ARRAY['text', 'code', 'content'], 'Most capable Claude model', 94, 3.00, false, true),
('DALL-E 3', 'OpenAI', ARRAY['image', 'design'], 'Latest image generation model', 93, 4.00, false, true),
('Stable Diffusion XL', 'Stability AI', ARRAY['image', 'design'], 'High-quality image generation', 91, 1.50, false, true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 8
-- Indexes created: 28
-- RLS policies: 22
-- Triggers: 4
-- Helper functions: 3
-- Seed data: 12 AI models
-- =====================================================
-- ========================================
-- AI DESIGN SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete AI-powered design studio with:
-- - AI design tools with multiple models
-- - Design templates with AI integration
-- - Project management with generation tracking
-- - Output variations and quality scoring
-- - Color palettes and style transfers
-- - Usage analytics and ratings
--
-- Tables: 7
-- Functions: 6
-- Indexes: 38
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

DROP TYPE IF EXISTS ai_tool_type CASCADE;
CREATE TYPE ai_tool_type AS ENUM (
  'logo',
  'color-palette',
  'style-transfer',
  'image-enhance',
  'auto-layout',
  'background-removal',
  'smart-crop',
  'batch-generate'
);

DROP TYPE IF EXISTS ai_model CASCADE;
CREATE TYPE ai_model AS ENUM (
  'gpt-4-vision',
  'dall-e-3',
  'midjourney-v6',
  'stable-diffusion',
  'ai-upscaler',
  'remove-bg',
  'vision-ai'
);

DROP TYPE IF EXISTS design_category CASCADE;
CREATE TYPE design_category AS ENUM (
  'logo',
  'branding',
  'social-media',
  'print',
  'web',
  'marketing',
  'illustration',
  'ui-ux'
);

DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM (
  'draft',
  'generating',
  'active',
  'review',
  'completed',
  'archived'
);

DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM (
  'svg',
  'png',
  'jpg',
  'pdf',
  'webp'
);

-- ========================================
-- TABLES
-- ========================================

-- AI Design Projects
CREATE TABLE IF NOT EXISTS ai_design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  status project_status NOT NULL DEFAULT 'draft',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tool_id TEXT NOT NULL,
  template_id TEXT,
  generated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  model ai_model NOT NULL,
  variations INTEGER NOT NULL DEFAULT 1,
  selected_variation INTEGER,
  prompt TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  quality_score DECIMAL(3, 1),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Design Outputs
CREATE TABLE IF NOT EXISTS design_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES ai_design_projects(id) ON DELETE CASCADE,
  variation_number INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  format export_format NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  quality_score DECIMAL(3, 1) NOT NULL,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, variation_number)
);

-- Design Templates
CREATE TABLE IF NOT EXISTS design_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category design_category NOT NULL,
  thumbnail TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  ai_ready BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Tools
CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type ai_tool_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  model ai_model NOT NULL,
  icon TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  estimated_time INTEGER NOT NULL, -- seconds
  max_variations INTEGER NOT NULL DEFAULT 1,
  supported_formats export_format[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Color Palettes
CREATE TABLE IF NOT EXISTS color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  description TEXT NOT NULL,
  wcag_compliant BOOLEAN NOT NULL DEFAULT false,
  contrast_ratios DECIMAL(4, 2)[] DEFAULT '{}',
  mood TEXT NOT NULL,
  usage TEXT[] DEFAULT '{}',
  uses INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Analytics
CREATE TABLE IF NOT EXISTS project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES ai_design_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  generation_time INTEGER, -- seconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, date)
);

-- Tool Reviews
CREATE TABLE IF NOT EXISTS tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- ========================================
-- INDEXES
-- ========================================

-- AI Design Projects Indexes
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_user_id ON ai_design_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_type ON ai_design_projects(type);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_status ON ai_design_projects(status);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_model ON ai_design_projects(model);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_created_at ON ai_design_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_completed_at ON ai_design_projects(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_quality_score ON ai_design_projects(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_design_projects_name ON ai_design_projects USING GIN(name gin_trgm_ops);

-- Design Outputs Indexes
CREATE INDEX IF NOT EXISTS idx_design_outputs_project_id ON design_outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_design_outputs_variation_number ON design_outputs(project_id, variation_number);
CREATE INDEX IF NOT EXISTS idx_design_outputs_is_selected ON design_outputs(is_selected);
CREATE INDEX IF NOT EXISTS idx_design_outputs_downloads ON design_outputs(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_design_outputs_quality_score ON design_outputs(quality_score DESC);

-- Design Templates Indexes
CREATE INDEX IF NOT EXISTS idx_design_templates_category ON design_templates(category);
CREATE INDEX IF NOT EXISTS idx_design_templates_ai_ready ON design_templates(ai_ready);
CREATE INDEX IF NOT EXISTS idx_design_templates_is_premium ON design_templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_design_templates_uses ON design_templates(uses DESC);
CREATE INDEX IF NOT EXISTS idx_design_templates_rating ON design_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_design_templates_tags ON design_templates USING GIN(tags);

-- AI Tools Indexes
CREATE INDEX IF NOT EXISTS idx_ai_tools_type ON ai_tools(type);
CREATE INDEX IF NOT EXISTS idx_ai_tools_model ON ai_tools(model);
CREATE INDEX IF NOT EXISTS idx_ai_tools_is_premium ON ai_tools(is_premium);
CREATE INDEX IF NOT EXISTS idx_ai_tools_uses ON ai_tools(uses DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_rating ON ai_tools(rating DESC);

-- Color Palettes Indexes
CREATE INDEX IF NOT EXISTS idx_color_palettes_user_id ON color_palettes(user_id);
CREATE INDEX IF NOT EXISTS idx_color_palettes_mood ON color_palettes(mood);
CREATE INDEX IF NOT EXISTS idx_color_palettes_wcag_compliant ON color_palettes(wcag_compliant);
CREATE INDEX IF NOT EXISTS idx_color_palettes_is_public ON color_palettes(is_public);
CREATE INDEX IF NOT EXISTS idx_color_palettes_uses ON color_palettes(uses DESC);

-- Project Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_date ON project_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_date ON project_analytics(project_id, date DESC);

-- Tool Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool_id ON tool_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_user_id ON tool_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_rating ON tool_reviews(rating DESC);

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

CREATE TRIGGER update_ai_design_projects_updated_at BEFORE UPDATE ON ai_design_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_templates_updated_at BEFORE UPDATE ON design_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tools_updated_at BEFORE UPDATE ON ai_tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_color_palettes_updated_at BEFORE UPDATE ON color_palettes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_analytics_updated_at BEFORE UPDATE ON project_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_reviews_updated_at BEFORE UPDATE ON tool_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update tool usage count
CREATE OR REPLACE FUNCTION update_tool_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'generating' THEN
    UPDATE ai_tools
    SET uses = uses + 1
    WHERE id = (SELECT id FROM ai_tools WHERE type = NEW.type LIMIT 1);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_tool_usage
  AFTER INSERT OR UPDATE ON ai_design_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_usage();

-- Update template usage count
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.template_id IS NOT NULL THEN
    UPDATE design_templates
    SET uses = uses + 1
    WHERE id = NEW.template_id::UUID;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage
  AFTER INSERT ON ai_design_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_template_usage();

-- Update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.downloads < NEW.downloads THEN
    -- Update daily analytics
    INSERT INTO project_analytics (project_id, date, downloads)
    VALUES (NEW.project_id, CURRENT_DATE, 1)
    ON CONFLICT (project_id, date)
    DO UPDATE SET downloads = project_analytics.downloads + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_download_count
  AFTER UPDATE ON design_outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

-- Update tool rating
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_tools
  SET rating = (
    SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0)
    FROM tool_reviews
    WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
  ),
  review_count = (
    SELECT COUNT(*)
    FROM tool_reviews
    WHERE tool_id = COALESCE(NEW.tool_id, OLD.tool_id)
  )
  WHERE id = COALESCE(NEW.tool_id, OLD.tool_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tool_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON tool_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_rating();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Get AI design stats
CREATE OR REPLACE FUNCTION get_ai_design_stats(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalProjects', COUNT(*),
      'totalGenerations', COALESCE(SUM(variations), 0),
      'averageQuality', COALESCE(AVG(quality_score), 0),
      'successRate', ROUND(COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0) * 100),
      'byTool', (
        SELECT json_object_agg(type, count)
        FROM (
          SELECT type, COUNT(*) as count
          FROM ai_design_projects
          WHERE user_id = p_user_id
          GROUP BY type
        ) t
      ),
      'byStatus', (
        SELECT json_object_agg(status, count)
        FROM (
          SELECT status, COUNT(*) as count
          FROM ai_design_projects
          WHERE user_id = p_user_id
          GROUP BY status
        ) t
      )
    )
    FROM ai_design_projects
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create AI design project
CREATE OR REPLACE FUNCTION create_ai_design_project(
  p_user_id UUID,
  p_name TEXT,
  p_type ai_tool_type,
  p_model ai_model,
  p_prompt TEXT DEFAULT NULL,
  p_parameters JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_project_id UUID;
  v_tool_id TEXT;
BEGIN
  -- Get tool ID
  SELECT id::TEXT INTO v_tool_id
  FROM ai_tools
  WHERE type = p_type
  LIMIT 1;

  -- Create project
  INSERT INTO ai_design_projects (
    user_id, name, type, model, tool_id, prompt, parameters, status
  )
  VALUES (
    p_user_id, p_name, p_type, p_model, v_tool_id, p_prompt, p_parameters, 'draft'
  )
  RETURNING id INTO v_project_id;

  RETURN json_build_object('success', true, 'projectId', v_project_id);
END;
$$ LANGUAGE plpgsql;

-- Start generation
CREATE OR REPLACE FUNCTION start_generation(p_project_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE ai_design_projects
  SET status = 'generating',
      generated_at = NOW(),
      progress = 0
  WHERE id = p_project_id;

  RETURN json_build_object('success', true, 'status', 'generating');
END;
$$ LANGUAGE plpgsql;

-- Complete generation
CREATE OR REPLACE FUNCTION complete_generation(
  p_project_id UUID,
  p_quality_score DECIMAL(3, 1) DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  UPDATE ai_design_projects
  SET status = 'completed',
      completed_at = NOW(),
      progress = 100,
      quality_score = p_quality_score
  WHERE id = p_project_id;

  RETURN json_build_object('success', true, 'status', 'completed');
END;
$$ LANGUAGE plpgsql;

-- Search projects
CREATE OR REPLACE FUNCTION search_ai_design_projects(
  p_user_id UUID,
  p_search_term TEXT,
  p_status project_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF ai_design_projects AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ai_design_projects
  WHERE user_id = p_user_id
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR prompt ILIKE '%' || p_search_term || '%'
    )
    AND (p_status IS NULL OR status = p_status)
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get top AI tools
CREATE OR REPLACE FUNCTION get_top_ai_tools(p_limit INTEGER DEFAULT 10)
RETURNS SETOF ai_tools AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ai_tools
  ORDER BY uses DESC, rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE ai_design_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_reviews ENABLE ROW LEVEL SECURITY;

-- AI Design Projects Policies
CREATE POLICY ai_design_projects_select ON ai_design_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ai_design_projects_insert ON ai_design_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY ai_design_projects_update ON ai_design_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY ai_design_projects_delete ON ai_design_projects FOR DELETE USING (auth.uid() = user_id);

-- Design Outputs Policies
CREATE POLICY design_outputs_select ON design_outputs FOR SELECT
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));
CREATE POLICY design_outputs_insert ON design_outputs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));
CREATE POLICY design_outputs_update ON design_outputs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));
CREATE POLICY design_outputs_delete ON design_outputs FOR DELETE
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = design_outputs.project_id AND user_id = auth.uid()));

-- Design Templates Policies
CREATE POLICY design_templates_select ON design_templates FOR SELECT USING (true);

-- AI Tools Policies
CREATE POLICY ai_tools_select ON ai_tools FOR SELECT USING (true);

-- Color Palettes Policies
CREATE POLICY color_palettes_select ON color_palettes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY color_palettes_insert ON color_palettes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY color_palettes_update ON color_palettes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY color_palettes_delete ON color_palettes FOR DELETE USING (auth.uid() = user_id);

-- Project Analytics Policies
CREATE POLICY project_analytics_select ON project_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM ai_design_projects WHERE id = project_analytics.project_id AND user_id = auth.uid()));

-- Tool Reviews Policies
CREATE POLICY tool_reviews_select ON tool_reviews FOR SELECT USING (true);
CREATE POLICY tool_reviews_insert ON tool_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY tool_reviews_update ON tool_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY tool_reviews_delete ON tool_reviews FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE ai_design_projects IS 'AI-powered design projects with generation tracking';
COMMENT ON TABLE design_outputs IS 'Generated design variations with quality scoring';
COMMENT ON TABLE design_templates IS 'Design templates with AI integration support';
COMMENT ON TABLE ai_tools IS 'Available AI design tools with models and features';
COMMENT ON TABLE color_palettes IS 'AI-generated color palettes with WCAG compliance';
COMMENT ON TABLE project_analytics IS 'Daily project analytics and metrics';
COMMENT ON TABLE tool_reviews IS 'User reviews for AI tools';
-- ============================================================================
-- AI ENHANCED SYSTEM - SUPABASE MIGRATION
-- Complete AI tools management with analytics and workflows
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS ai_tool_type CASCADE;
CREATE TYPE ai_tool_type AS ENUM (
  'text',
  'image',
  'audio',
  'video',
  'code',
  'data',
  'assistant',
  'automation'
);

DROP TYPE IF EXISTS ai_tool_category CASCADE;
CREATE TYPE ai_tool_category AS ENUM (
  'content',
  'design',
  'development',
  'analytics',
  'productivity',
  'creative'
);

DROP TYPE IF EXISTS ai_tool_status CASCADE;
CREATE TYPE ai_tool_status AS ENUM (
  'active',
  'inactive',
  'training',
  'maintenance'
);

DROP TYPE IF EXISTS pricing_tier CASCADE;
CREATE TYPE pricing_tier AS ENUM (
  'free',
  'basic',
  'pro',
  'enterprise'
);

DROP TYPE IF EXISTS performance_level CASCADE;
CREATE TYPE performance_level AS ENUM (
  'excellent',
  'good',
  'fair',
  'poor'
);

DROP TYPE IF EXISTS provider_status CASCADE;
CREATE TYPE provider_status AS ENUM (
  'active',
  'inactive',
  'deprecated'
);

-- ============================================================================
-- TABLE: ai_tools
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  category ai_tool_category NOT NULL,
  description TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  status ai_tool_status NOT NULL DEFAULT 'active',
  pricing_tier pricing_tier NOT NULL DEFAULT 'free',
  performance performance_level NOT NULL DEFAULT 'good',
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 4) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 1),
  avg_response_time DECIMAL(10, 2) DEFAULT 0,
  cost_per_use DECIMAL(10, 4) DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_popular BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  version TEXT NOT NULL,
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  limits JSONB DEFAULT '{}'::JSONB,
  config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: ai_tool_usage
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  input_size INTEGER DEFAULT 0,
  output_size INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_providers
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  website TEXT,
  api_key_required BOOLEAN DEFAULT true,
  supported_types ai_tool_type[] DEFAULT ARRAY[]::ai_tool_type[],
  status provider_status NOT NULL DEFAULT 'active',
  pricing_tier pricing_tier NOT NULL DEFAULT 'pro',
  cost_per_request DECIMAL(10, 4) DEFAULT 0,
  cost_per_token DECIMAL(10, 6),
  rate_limit INTEGER DEFAULT 1000,
  quota_limit INTEGER DEFAULT 100000,
  reliability INTEGER DEFAULT 95 CHECK (reliability >= 0 AND reliability <= 100),
  avg_response_time DECIMAL(10, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_models
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  version TEXT NOT NULL,
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  parameters BIGINT,
  context_window INTEGER,
  max_tokens INTEGER,
  input_cost DECIMAL(10, 6),
  output_cost DECIMAL(10, 6),
  quality performance_level NOT NULL DEFAULT 'good',
  speed INTEGER DEFAULT 50 CHECK (speed >= 0 AND speed <= 100),
  accuracy INTEGER DEFAULT 80 CHECK (accuracy >= 0 AND accuracy <= 100),
  is_multimodal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_tool_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tool_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_usage INTEGER DEFAULT 0,
  successful_usage INTEGER DEFAULT 0,
  failed_usage INTEGER DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  avg_response_time DECIMAL(10, 2) DEFAULT 0,
  avg_success_rate DECIMAL(5, 4) DEFAULT 0,
  peak_usage_time TIMESTAMPTZ,
  most_common_error TEXT,
  user_satisfaction INTEGER DEFAULT 0 CHECK (user_satisfaction >= 0 AND user_satisfaction <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tools UUID[] DEFAULT ARRAY[]::UUID[],
  triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
  schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed TIMESTAMPTZ,
  avg_execution_time INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_workflow_steps
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  input JSONB DEFAULT '{}'::JSONB,
  output JSONB DEFAULT '{}'::JSONB,
  condition TEXT,
  on_error TEXT DEFAULT 'stop' CHECK (on_error IN ('stop', 'continue', 'retry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_tool_favorites
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tool_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- ============================================================================
-- TABLE: ai_tool_reviews
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  pros TEXT[] DEFAULT ARRAY[]::TEXT[],
  cons TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ai_tools indexes
CREATE INDEX IF NOT EXISTS idx_ai_tools_user_id ON ai_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tools_type ON ai_tools(type);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_status ON ai_tools(status);
CREATE INDEX IF NOT EXISTS idx_ai_tools_provider ON ai_tools(provider);
CREATE INDEX IF NOT EXISTS idx_ai_tools_pricing_tier ON ai_tools(pricing_tier);
CREATE INDEX IF NOT EXISTS idx_ai_tools_performance ON ai_tools(performance);
CREATE INDEX IF NOT EXISTS idx_ai_tools_is_popular ON ai_tools(is_popular);
CREATE INDEX IF NOT EXISTS idx_ai_tools_is_favorite ON ai_tools(is_favorite);
CREATE INDEX IF NOT EXISTS idx_ai_tools_usage_count ON ai_tools(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_success_rate ON ai_tools(success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tools_tags ON ai_tools USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_ai_tools_name_trgm ON ai_tools USING gin(name gin_trgm_ops);

-- ai_tool_usage indexes
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_tool_id ON ai_tool_usage(tool_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_user_id ON ai_tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_timestamp ON ai_tool_usage(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_success ON ai_tool_usage(success);

-- ai_providers indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);
CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON ai_providers(status);
CREATE INDEX IF NOT EXISTS idx_ai_providers_reliability ON ai_providers(reliability DESC);

-- ai_models indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider);
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(type);
CREATE INDEX IF NOT EXISTS idx_ai_models_quality ON ai_models(quality);

-- ai_tool_metrics indexes
CREATE INDEX IF NOT EXISTS idx_ai_tool_metrics_tool_id ON ai_tool_metrics(tool_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_metrics_period ON ai_tool_metrics(period);
CREATE INDEX IF NOT EXISTS idx_ai_tool_metrics_period_start ON ai_tool_metrics(period_start DESC);

-- ai_workflows indexes
CREATE INDEX IF NOT EXISTS idx_ai_workflows_user_id ON ai_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_is_active ON ai_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_execution_count ON ai_workflows(execution_count DESC);

-- ai_workflow_steps indexes
CREATE INDEX IF NOT EXISTS idx_ai_workflow_steps_workflow_id ON ai_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_steps_tool_id ON ai_workflow_steps(tool_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_steps_order ON ai_workflow_steps(step_order);

-- ai_tool_favorites indexes
CREATE INDEX IF NOT EXISTS idx_ai_tool_favorites_user_id ON ai_tool_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_favorites_tool_id ON ai_tool_favorites(tool_id);

-- ai_tool_reviews indexes
CREATE INDEX IF NOT EXISTS idx_ai_tool_reviews_tool_id ON ai_tool_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_reviews_user_id ON ai_tool_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_reviews_rating ON ai_tool_reviews(rating DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_reviews ENABLE ROW LEVEL SECURITY;

-- ai_tools policies
CREATE POLICY "Users can view their own tools"
  ON ai_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tools"
  ON ai_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tools"
  ON ai_tools FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tools"
  ON ai_tools FOR DELETE
  USING (auth.uid() = user_id);

-- ai_tool_usage policies
CREATE POLICY "Users can view their own usage"
  ON ai_tool_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own usage"
  ON ai_tool_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ai_providers policies
CREATE POLICY "Anyone can view providers"
  ON ai_providers FOR SELECT
  TO authenticated
  USING (true);

-- ai_models policies
CREATE POLICY "Anyone can view models"
  ON ai_models FOR SELECT
  TO authenticated
  USING (true);

-- ai_tool_metrics policies
CREATE POLICY "Users can view metrics for their tools"
  ON ai_tool_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_tools
    WHERE ai_tools.id = ai_tool_metrics.tool_id
    AND ai_tools.user_id = auth.uid()
  ));

-- ai_workflows policies
CREATE POLICY "Users can manage their own workflows"
  ON ai_workflows FOR ALL
  USING (auth.uid() = user_id);

-- ai_workflow_steps policies
CREATE POLICY "Users can manage steps for their workflows"
  ON ai_workflow_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ai_workflows
    WHERE ai_workflows.id = ai_workflow_steps.workflow_id
    AND ai_workflows.user_id = auth.uid()
  ));

-- ai_tool_favorites policies
CREATE POLICY "Users can manage their own favorites"
  ON ai_tool_favorites FOR ALL
  USING (auth.uid() = user_id);

-- ai_tool_reviews policies
CREATE POLICY "Anyone can view reviews"
  ON ai_tool_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON ai_tool_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON ai_tool_reviews FOR UPDATE
  USING (auth.uid() = user_id);

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

CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_workflows_updated_at
  BEFORE UPDATE ON ai_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update tool usage statistics
CREATE OR REPLACE FUNCTION update_tool_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_tools
  SET
    usage_count = usage_count + 1,
    last_used = NEW.timestamp,
    total_cost = total_cost + NEW.cost
  WHERE id = NEW.tool_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tool_usage_stats
  AFTER INSERT ON ai_tool_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_usage_stats();

-- Update tool success rate
CREATE OR REPLACE FUNCTION update_tool_success_rate()
RETURNS TRIGGER AS $$
DECLARE
  v_total_usage INTEGER;
  v_successful_usage INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE success = true)
  INTO v_total_usage, v_successful_usage
  FROM ai_tool_usage
  WHERE tool_id = NEW.tool_id;

  IF v_total_usage > 0 THEN
    UPDATE ai_tools
    SET success_rate = v_successful_usage::DECIMAL / v_total_usage::DECIMAL
    WHERE id = NEW.tool_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tool_success_rate
  AFTER INSERT ON ai_tool_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_success_rate();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get tool performance score
CREATE OR REPLACE FUNCTION get_tool_performance_score(p_tool_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_tool RECORD;
  v_performance_score INTEGER;
  v_success_score INTEGER;
  v_response_score INTEGER;
  v_usage_score INTEGER;
  v_total_score INTEGER;
BEGIN
  SELECT * INTO v_tool FROM ai_tools WHERE id = p_tool_id;

  -- Performance weight: 30%
  v_performance_score := CASE v_tool.performance
    WHEN 'excellent' THEN 30
    WHEN 'good' THEN 22
    WHEN 'fair' THEN 15
    WHEN 'poor' THEN 7
  END;

  -- Success rate weight: 30%
  v_success_score := ROUND(v_tool.success_rate * 30);

  -- Response time weight: 20%
  v_response_score := GREATEST(0, ROUND(20 - (v_tool.avg_response_time * 4)));

  -- Usage weight: 20%
  v_usage_score := LEAST(20, ROUND(v_tool.usage_count::DECIMAL / 100 * 20));

  v_total_score := v_performance_score + v_success_score + v_response_score + v_usage_score;

  RETURN v_total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recommended tools
CREATE OR REPLACE FUNCTION get_recommended_tools(
  p_user_id UUID,
  p_type ai_tool_type DEFAULT NULL,
  p_category ai_tool_category DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type ai_tool_type,
  performance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.type,
    get_tool_performance_score(t.id) as performance_score
  FROM ai_tools t
  WHERE t.user_id = p_user_id
  AND t.status = 'active'
  AND (p_type IS NULL OR t.type = p_type)
  AND (p_category IS NULL OR t.category = p_category)
  ORDER BY performance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get tool statistics
CREATE OR REPLACE FUNCTION get_tool_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_tools', COUNT(*),
      'active_tools', COUNT(*) FILTER (WHERE status = 'active'),
      'total_usage', COALESCE(SUM(usage_count), 0),
      'total_cost', COALESCE(SUM(total_cost), 0),
      'avg_success_rate', COALESCE(AVG(success_rate), 0),
      'avg_response_time', COALESCE(AVG(avg_response_time), 0),
      'popular_tools', COUNT(*) FILTER (WHERE is_popular = true),
      'favorite_tools', COUNT(*) FILTER (WHERE is_favorite = true)
    )
    FROM ai_tools
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search AI tools
CREATE OR REPLACE FUNCTION search_ai_tools(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type ai_tool_type,
  category ai_tool_category,
  provider TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.type,
    t.category,
    t.provider
  FROM ai_tools t
  WHERE t.user_id = p_user_id
  AND (
    t.name ILIKE '%' || p_search_term || '%'
    OR t.description ILIKE '%' || p_search_term || '%'
    OR t.provider ILIKE '%' || p_search_term || '%'
    OR t.model ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(t.tags)
  )
  ORDER BY t.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get most cost-effective tools
CREATE OR REPLACE FUNCTION get_cost_effective_tools(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  cost_efficiency DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    CASE
      WHEN t.total_cost > 0 THEN (t.success_rate * t.usage_count) / t.total_cost
      ELSE 0
    END as cost_efficiency
  FROM ai_tools t
  WHERE t.user_id = p_user_id
  AND t.status = 'active'
  ORDER BY cost_efficiency DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate tool metrics for period
CREATE OR REPLACE FUNCTION calculate_tool_metrics(
  p_tool_id UUID,
  p_period TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  v_total INTEGER;
  v_successful INTEGER;
  v_failed INTEGER;
  v_total_cost DECIMAL;
  v_avg_response DECIMAL;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE success = true),
    COUNT(*) FILTER (WHERE success = false),
    COALESCE(SUM(cost), 0),
    COALESCE(AVG(duration), 0)
  INTO v_total, v_successful, v_failed, v_total_cost, v_avg_response
  FROM ai_tool_usage
  WHERE tool_id = p_tool_id
  AND timestamp BETWEEN p_start_date AND p_end_date;

  INSERT INTO ai_tool_metrics (
    tool_id,
    period,
    period_start,
    period_end,
    total_usage,
    successful_usage,
    failed_usage,
    total_cost,
    avg_response_time
  ) VALUES (
    p_tool_id,
    p_period,
    p_start_date,
    p_end_date,
    v_total,
    v_successful,
    v_failed,
    v_total_cost,
    v_avg_response
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
