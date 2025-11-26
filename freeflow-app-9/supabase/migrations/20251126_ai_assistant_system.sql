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

CREATE TYPE message_type AS ENUM ('user', 'assistant', 'system');
CREATE TYPE ai_provider AS ENUM ('anthropic', 'openai', 'google');
CREATE TYPE task_type AS ENUM ('chat', 'analysis', 'creative', 'strategic', 'operational');
CREATE TYPE message_rating AS ENUM ('up', 'down');
CREATE TYPE insight_category AS ENUM ('productivity', 'business', 'optimization', 'opportunity', 'growth');
CREATE TYPE insight_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'pinned', 'deleted');
CREATE TYPE attachment_type AS ENUM ('file', 'image', 'document', 'link');
CREATE TYPE insight_status AS ENUM ('active', 'dismissed', 'implemented');

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

CREATE TABLE ai_conversations (
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
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX idx_ai_conversations_is_pinned ON ai_conversations(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_ai_conversations_last_message_at ON ai_conversations(last_message_at DESC);
CREATE INDEX idx_ai_conversations_tags ON ai_conversations USING GIN(tags);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_metadata ON ai_conversations USING GIN(metadata);

-- Full-text search for conversations
CREATE INDEX idx_ai_conversations_search ON ai_conversations USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(preview, ''))
);

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE ai_messages (
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
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_type ON ai_messages(type);
CREATE INDEX idx_ai_messages_rating ON ai_messages(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_ai_messages_provider ON ai_messages(provider);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX idx_ai_messages_metadata ON ai_messages USING GIN(metadata);

-- Full-text search for messages
CREATE INDEX idx_ai_messages_search ON ai_messages USING GIN(
    to_tsvector('english', content)
);

-- ============================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================

CREATE TABLE ai_message_attachments (
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
CREATE INDEX idx_ai_message_attachments_message_id ON ai_message_attachments(message_id);
CREATE INDEX idx_ai_message_attachments_type ON ai_message_attachments(type);

-- ============================================
-- AI INSIGHTS TABLE
-- ============================================

CREATE TABLE ai_insights (
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
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_category ON ai_insights(category);
CREATE INDEX idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX idx_ai_insights_dismissed_at ON ai_insights(dismissed_at) WHERE dismissed_at IS NOT NULL;
CREATE INDEX idx_ai_insights_implemented_at ON ai_insights(implemented_at) WHERE implemented_at IS NOT NULL;

-- ============================================
-- PROJECT ANALYSES TABLE
-- ============================================

CREATE TABLE ai_project_analyses (
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
CREATE INDEX idx_ai_project_analyses_user_id ON ai_project_analyses(user_id);
CREATE INDEX idx_ai_project_analyses_project_id ON ai_project_analyses(project_id);
CREATE INDEX idx_ai_project_analyses_status ON ai_project_analyses(status);
CREATE INDEX idx_ai_project_analyses_risk_level ON ai_project_analyses(risk_level);
CREATE INDEX idx_ai_project_analyses_generated_at ON ai_project_analyses(generated_at DESC);

-- ============================================
-- QUICK ACTIONS TABLE
-- ============================================

CREATE TABLE ai_quick_actions (
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
CREATE INDEX idx_ai_quick_actions_category ON ai_quick_actions(category);
CREATE INDEX idx_ai_quick_actions_usage_count ON ai_quick_actions(usage_count DESC);

-- ============================================
-- AI MODELS TABLE
-- ============================================

CREATE TABLE ai_models (
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
CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_models_is_active ON ai_models(is_active) WHERE is_active = TRUE;

-- ============================================
-- VOICE SETTINGS TABLE
-- ============================================

CREATE TABLE ai_voice_settings (
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
CREATE INDEX idx_ai_voice_settings_user_id ON ai_voice_settings(user_id);

-- ============================================
-- CONVERSATION SHARES TABLE
-- ============================================

CREATE TABLE ai_conversation_shares (
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
CREATE INDEX idx_ai_conversation_shares_conversation_id ON ai_conversation_shares(conversation_id);
CREATE INDEX idx_ai_conversation_shares_share_token ON ai_conversation_shares(share_token);
CREATE INDEX idx_ai_conversation_shares_expires_at ON ai_conversation_shares(expires_at);

-- ============================================
-- ANALYTICS TABLE
-- ============================================

CREATE TABLE ai_analytics (
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
CREATE INDEX idx_ai_analytics_user_id ON ai_analytics(user_id);
CREATE INDEX idx_ai_analytics_period ON ai_analytics(period_start, period_end);
CREATE INDEX idx_ai_analytics_created_at ON ai_analytics(created_at DESC);

-- ============================================
-- MESSAGE FEEDBACK TABLE
-- ============================================

CREATE TABLE ai_message_feedback (
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
CREATE INDEX idx_ai_message_feedback_message_id ON ai_message_feedback(message_id);
CREATE INDEX idx_ai_message_feedback_user_id ON ai_message_feedback(user_id);
CREATE INDEX idx_ai_message_feedback_rating ON ai_message_feedback(rating);

-- ============================================
-- CONVERSATION BOOKMARKS TABLE
-- ============================================

CREATE TABLE ai_conversation_bookmarks (
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
CREATE INDEX idx_ai_conversation_bookmarks_conversation_id ON ai_conversation_bookmarks(conversation_id);
CREATE INDEX idx_ai_conversation_bookmarks_message_id ON ai_conversation_bookmarks(message_id);
CREATE INDEX idx_ai_conversation_bookmarks_user_id ON ai_conversation_bookmarks(user_id);
CREATE INDEX idx_ai_conversation_bookmarks_tags ON ai_conversation_bookmarks USING GIN(tags);

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
