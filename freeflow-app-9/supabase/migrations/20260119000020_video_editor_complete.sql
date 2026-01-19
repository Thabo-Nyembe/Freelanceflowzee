-- ============================================================================
-- Video Editor Complete - FFmpeg.wasm Browser-Based Video Editing
-- Migration: 20260119000020
-- ============================================================================

-- Video editor projects table
CREATE TABLE IF NOT EXISTS video_editor_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Project dimensions
    width INTEGER NOT NULL DEFAULT 1920,
    height INTEGER NOT NULL DEFAULT 1080,
    fps INTEGER NOT NULL DEFAULT 30,
    duration DECIMAL(10, 3) NOT NULL DEFAULT 0,

    -- Project data (stored as JSONB)
    tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
    media_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Thumbnail
    thumbnail_url TEXT,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    is_template BOOLEAN NOT NULL DEFAULT FALSE,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_opened_at TIMESTAMPTZ,

    -- Indexes
    CONSTRAINT valid_dimensions CHECK (width > 0 AND height > 0),
    CONSTRAINT valid_fps CHECK (fps > 0 AND fps <= 120),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'rendering', 'completed', 'archived'))
);

-- Video editor exports table
CREATE TABLE IF NOT EXISTS video_editor_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES video_editor_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Export settings
    format VARCHAR(20) NOT NULL,
    quality VARCHAR(20) NOT NULL,
    resolution VARCHAR(20) NOT NULL,
    codec VARCHAR(50),

    -- Output info
    output_url TEXT,
    file_size BIGINT,
    duration DECIMAL(10, 3),

    -- Processing
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    progress DECIMAL(5, 2) DEFAULT 0,
    error_message TEXT,

    -- Processing times
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_export_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

-- Video editor media assets (cloud-stored media for projects)
CREATE TABLE IF NOT EXISTS video_editor_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES video_editor_projects(id) ON DELETE SET NULL,

    -- Media info
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Storage
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,

    -- Metadata
    duration DECIMAL(10, 3),
    width INTEGER,
    height INTEGER,
    fps DECIMAL(5, 2),
    file_size BIGINT NOT NULL,
    codec VARCHAR(50),
    audio_codec VARCHAR(50),

    -- Waveform data for audio
    waveform JSONB,

    -- Processing status
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_media_type CHECK (type IN ('video', 'audio', 'image'))
);

-- Video editor presets (saved filter/effect combinations)
CREATE TABLE IF NOT EXISTS video_editor_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Preset info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),

    -- Preset data
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,

    -- Sharing
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    -- Stats
    usage_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_preset_type CHECK (type IN ('filter', 'transition', 'text', 'audio', 'color_grade', 'composite'))
);

-- Video editor templates
CREATE TABLE IF NOT EXISTS video_editor_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    thumbnail_url TEXT,
    preview_url TEXT,

    -- Template data
    width INTEGER NOT NULL DEFAULT 1920,
    height INTEGER NOT NULL DEFAULT 1080,
    fps INTEGER NOT NULL DEFAULT 30,
    duration DECIMAL(10, 3) NOT NULL DEFAULT 0,
    tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Template slots (replaceable content)
    slots JSONB DEFAULT '[]'::jsonb,

    -- Sharing
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,

    -- Stats
    usage_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2),

    -- Tags
    tags TEXT[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video editor collaboration (real-time editing)
CREATE TABLE IF NOT EXISTS video_editor_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES video_editor_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Permissions
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    can_edit BOOLEAN NOT NULL DEFAULT FALSE,
    can_export BOOLEAN NOT NULL DEFAULT FALSE,
    can_invite BOOLEAN NOT NULL DEFAULT FALSE,

    -- Invitation
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    CONSTRAINT valid_collab_role CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
    CONSTRAINT valid_collab_status CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
    UNIQUE(project_id, user_id)
);

-- Video editor comments (for review workflows)
CREATE TABLE IF NOT EXISTS video_editor_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES video_editor_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES video_editor_comments(id) ON DELETE CASCADE,

    -- Comment content
    content TEXT NOT NULL,
    timestamp_seconds DECIMAL(10, 3),

    -- Position on canvas (for visual feedback)
    position_x DECIMAL(5, 2),
    position_y DECIMAL(5, 2),

    -- Drawing/annotation data
    drawing_data JSONB,

    -- Status
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Video editor activity log
CREATE TABLE IF NOT EXISTS video_editor_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES video_editor_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Activity info
    action VARCHAR(100) NOT NULL,
    details JSONB,

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_video_editor_projects_user ON video_editor_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_projects_status ON video_editor_projects(status);
CREATE INDEX IF NOT EXISTS idx_video_editor_projects_updated ON video_editor_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_editor_projects_template ON video_editor_projects(is_template) WHERE is_template = TRUE;

CREATE INDEX IF NOT EXISTS idx_video_editor_exports_project ON video_editor_exports(project_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_exports_user ON video_editor_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_exports_status ON video_editor_exports(status);

CREATE INDEX IF NOT EXISTS idx_video_editor_media_user ON video_editor_media(user_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_media_project ON video_editor_media(project_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_media_type ON video_editor_media(type);

CREATE INDEX IF NOT EXISTS idx_video_editor_presets_user ON video_editor_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_presets_public ON video_editor_presets(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_video_editor_presets_system ON video_editor_presets(is_system) WHERE is_system = TRUE;
CREATE INDEX IF NOT EXISTS idx_video_editor_presets_type ON video_editor_presets(type);

CREATE INDEX IF NOT EXISTS idx_video_editor_templates_public ON video_editor_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_video_editor_templates_category ON video_editor_templates(category);

CREATE INDEX IF NOT EXISTS idx_video_editor_collaborators_project ON video_editor_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_collaborators_user ON video_editor_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_video_editor_comments_project ON video_editor_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_comments_timestamp ON video_editor_comments(timestamp_seconds);

CREATE INDEX IF NOT EXISTS idx_video_editor_activity_project ON video_editor_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_video_editor_activity_user ON video_editor_activity(user_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE video_editor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_editor_activity ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects"
    ON video_editor_projects FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view collaborated projects"
    ON video_editor_projects FOR SELECT
    USING (
        id IN (
            SELECT project_id FROM video_editor_collaborators
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Users can create own projects"
    ON video_editor_projects FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
    ON video_editor_projects FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can update collaborated projects with edit permission"
    ON video_editor_projects FOR UPDATE
    USING (
        id IN (
            SELECT project_id FROM video_editor_collaborators
            WHERE user_id = auth.uid() AND status = 'accepted' AND can_edit = TRUE
        )
    );

CREATE POLICY "Users can delete own projects"
    ON video_editor_projects FOR DELETE
    USING (user_id = auth.uid());

-- Exports policies
CREATE POLICY "Users can view own exports"
    ON video_editor_exports FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create exports for accessible projects"
    ON video_editor_exports FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        project_id IN (
            SELECT id FROM video_editor_projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM video_editor_collaborators
            WHERE user_id = auth.uid() AND status = 'accepted' AND can_export = TRUE
        )
    );

CREATE POLICY "Users can delete own exports"
    ON video_editor_exports FOR DELETE
    USING (user_id = auth.uid());

-- Media policies
CREATE POLICY "Users can view own media"
    ON video_editor_media FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own media"
    ON video_editor_media FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own media"
    ON video_editor_media FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own media"
    ON video_editor_media FOR DELETE
    USING (user_id = auth.uid());

-- Presets policies
CREATE POLICY "Users can view own presets"
    ON video_editor_presets FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view public presets"
    ON video_editor_presets FOR SELECT
    USING (is_public = TRUE OR is_system = TRUE);

CREATE POLICY "Users can create own presets"
    ON video_editor_presets FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own presets"
    ON video_editor_presets FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own presets"
    ON video_editor_presets FOR DELETE
    USING (user_id = auth.uid());

-- Templates policies
CREATE POLICY "Users can view public templates"
    ON video_editor_templates FOR SELECT
    USING (is_public = TRUE OR is_system = TRUE);

CREATE POLICY "Users can view own templates"
    ON video_editor_templates FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own templates"
    ON video_editor_templates FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
    ON video_editor_templates FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
    ON video_editor_templates FOR DELETE
    USING (user_id = auth.uid());

-- Collaborators policies
CREATE POLICY "Project owners can view collaborators"
    ON video_editor_collaborators FOR SELECT
    USING (
        project_id IN (SELECT id FROM video_editor_projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own collaboration invites"
    ON video_editor_collaborators FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Project owners can add collaborators"
    ON video_editor_collaborators FOR INSERT
    WITH CHECK (
        project_id IN (SELECT id FROM video_editor_projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Project owners can update collaborators"
    ON video_editor_collaborators FOR UPDATE
    USING (
        project_id IN (SELECT id FROM video_editor_projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own collaboration status"
    ON video_editor_collaborators FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Project owners can remove collaborators"
    ON video_editor_collaborators FOR DELETE
    USING (
        project_id IN (SELECT id FROM video_editor_projects WHERE user_id = auth.uid())
    );

-- Comments policies
CREATE POLICY "Users can view comments on accessible projects"
    ON video_editor_comments FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM video_editor_projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM video_editor_collaborators
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Users can create comments on accessible projects"
    ON video_editor_comments FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        project_id IN (
            SELECT id FROM video_editor_projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM video_editor_collaborators
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Users can update own comments"
    ON video_editor_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
    ON video_editor_comments FOR DELETE
    USING (user_id = auth.uid());

-- Activity policies
CREATE POLICY "Users can view activity on accessible projects"
    ON video_editor_activity FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM video_editor_projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM video_editor_collaborators
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "System can insert activity"
    ON video_editor_activity FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to update project timestamp
CREATE OR REPLACE FUNCTION update_video_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project timestamp
DROP TRIGGER IF EXISTS trigger_video_project_timestamp ON video_editor_projects;
CREATE TRIGGER trigger_video_project_timestamp
    BEFORE UPDATE ON video_editor_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_video_project_timestamp();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_video_editor_activity(
    p_project_id UUID,
    p_user_id UUID,
    p_action VARCHAR(100),
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO video_editor_activity (project_id, user_id, action, details)
    VALUES (p_project_id, p_user_id, p_action, p_details)
    RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project with collaborators
CREATE OR REPLACE FUNCTION get_video_project_with_collaborators(p_project_id UUID)
RETURNS TABLE (
    project JSONB,
    collaborators JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        to_jsonb(p.*) as project,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'role', c.role,
                    'can_edit', c.can_edit,
                    'can_export', c.can_export,
                    'status', c.status,
                    'user', jsonb_build_object(
                        'id', u.id,
                        'email', u.email
                    )
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) as collaborators
    FROM video_editor_projects p
    LEFT JOIN video_editor_collaborators c ON c.project_id = p.id
    LEFT JOIN auth.users u ON u.id = c.user_id
    WHERE p.id = p_project_id
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE video_editor_templates
    SET usage_count = usage_count + 1
    WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Seed Data: System Presets
-- ============================================================================

INSERT INTO video_editor_presets (name, description, category, type, data, is_public, is_system)
VALUES
    -- Color grading presets
    ('Cinematic Warm', 'Warm cinematic color grade', 'Color', 'color_grade', '{"brightness": 0.05, "contrast": 1.1, "saturation": 0.9, "hue": 15}', TRUE, TRUE),
    ('Cinematic Cool', 'Cool cinematic color grade', 'Color', 'color_grade', '{"brightness": 0, "contrast": 1.15, "saturation": 0.85, "hue": -10}', TRUE, TRUE),
    ('Vintage Film', 'Classic vintage film look', 'Color', 'color_grade', '{"brightness": 0.1, "contrast": 0.95, "saturation": 0.7, "sepia": 0.3}', TRUE, TRUE),
    ('High Contrast', 'Bold high contrast look', 'Color', 'color_grade', '{"brightness": 0, "contrast": 1.4, "saturation": 1.2}', TRUE, TRUE),
    ('Muted Tones', 'Soft muted color tones', 'Color', 'color_grade', '{"brightness": 0.05, "contrast": 0.9, "saturation": 0.6}', TRUE, TRUE),

    -- Filter presets
    ('Blur Background', 'Gaussian blur effect', 'Effects', 'filter', '{"type": "blur", "params": {"radius": 10}}', TRUE, TRUE),
    ('Sharpen', 'Enhance detail sharpness', 'Effects', 'filter', '{"type": "sharpen", "params": {"amount": 1.5}}', TRUE, TRUE),
    ('Vignette', 'Classic vignette effect', 'Effects', 'filter', '{"type": "vignette", "params": {"intensity": 4}}', TRUE, TRUE),
    ('Film Grain', 'Subtle film grain', 'Effects', 'filter', '{"type": "noise", "params": {"amount": 5}}', TRUE, TRUE),

    -- Transition presets
    ('Fade', 'Simple fade transition', 'Transitions', 'transition', '{"type": "fade", "duration": 0.5}', TRUE, TRUE),
    ('Dissolve', 'Cross dissolve transition', 'Transitions', 'transition', '{"type": "dissolve", "duration": 0.5}', TRUE, TRUE),
    ('Wipe Left', 'Wipe left transition', 'Transitions', 'transition', '{"type": "wipe", "direction": "left", "duration": 0.5}', TRUE, TRUE),
    ('Slide Up', 'Slide up transition', 'Transitions', 'transition', '{"type": "slide", "direction": "up", "duration": 0.5}', TRUE, TRUE),
    ('Zoom In', 'Zoom in transition', 'Transitions', 'transition', '{"type": "zoom", "direction": "in", "duration": 0.5}', TRUE, TRUE),

    -- Text presets
    ('Lower Third', 'Professional lower third', 'Text', 'text', '{"position": {"x": 50, "y": 80}, "fontSize": 24, "fontColor": "white", "backgroundColor": "rgba(0,0,0,0.7)"}', TRUE, TRUE),
    ('Center Title', 'Centered title text', 'Text', 'text', '{"position": {"x": 50, "y": 50}, "fontSize": 48, "fontColor": "white", "animation": "fade"}', TRUE, TRUE),
    ('Caption', 'Subtitle caption style', 'Text', 'text', '{"position": {"x": 50, "y": 90}, "fontSize": 20, "fontColor": "white", "backgroundColor": "rgba(0,0,0,0.8)"}', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Seed Data: System Templates
-- ============================================================================

INSERT INTO video_editor_templates (name, description, category, width, height, fps, duration, tracks, settings, slots, is_public, is_system)
VALUES
    (
        'Social Media Portrait',
        'Vertical video template for TikTok, Reels, Shorts',
        'Social Media',
        1080, 1920, 30, 15,
        '[{"id": "v1", "type": "video", "name": "Main Video", "clips": []}]'::jsonb,
        '{"outputFormat": "mp4", "quality": "high", "resolution": "custom", "customWidth": 1080, "customHeight": 1920}'::jsonb,
        '[{"name": "Main Content", "type": "video", "trackId": "v1", "startTime": 0, "duration": 15}]'::jsonb,
        TRUE, TRUE
    ),
    (
        'YouTube Landscape',
        'Standard 16:9 YouTube video template',
        'YouTube',
        1920, 1080, 30, 60,
        '[{"id": "v1", "type": "video", "name": "Main Video", "clips": []}, {"id": "a1", "type": "audio", "name": "Background Music", "clips": []}]'::jsonb,
        '{"outputFormat": "mp4", "quality": "high", "resolution": "1080p"}'::jsonb,
        '[{"name": "Main Content", "type": "video", "trackId": "v1"}, {"name": "Music", "type": "audio", "trackId": "a1"}]'::jsonb,
        TRUE, TRUE
    ),
    (
        'Podcast Video',
        'Podcast with waveform visualization',
        'Podcast',
        1920, 1080, 30, 300,
        '[{"id": "v1", "type": "video", "name": "Background", "clips": []}, {"id": "a1", "type": "audio", "name": "Podcast Audio", "clips": []}]'::jsonb,
        '{"outputFormat": "mp4", "quality": "medium", "resolution": "1080p"}'::jsonb,
        '[{"name": "Background", "type": "image", "trackId": "v1"}, {"name": "Audio", "type": "audio", "trackId": "a1"}]'::jsonb,
        TRUE, TRUE
    ),
    (
        'Product Demo',
        'Clean product demonstration template',
        'Business',
        1920, 1080, 60, 30,
        '[{"id": "v1", "type": "video", "name": "Product Footage", "clips": []}, {"id": "v2", "type": "video", "name": "Text Overlays", "clips": []}, {"id": "a1", "type": "audio", "name": "Voiceover", "clips": []}]'::jsonb,
        '{"outputFormat": "mp4", "quality": "ultra", "resolution": "1080p", "fps": 60}'::jsonb,
        '[{"name": "Product Video", "type": "video", "trackId": "v1"}, {"name": "Voiceover", "type": "audio", "trackId": "a1"}]'::jsonb,
        TRUE, TRUE
    ),
    (
        'Instagram Square',
        '1:1 aspect ratio for Instagram feed',
        'Social Media',
        1080, 1080, 30, 30,
        '[{"id": "v1", "type": "video", "name": "Main Video", "clips": []}]'::jsonb,
        '{"outputFormat": "mp4", "quality": "high", "resolution": "custom", "customWidth": 1080, "customHeight": 1080}'::jsonb,
        '[{"name": "Content", "type": "video", "trackId": "v1"}]'::jsonb,
        TRUE, TRUE
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE video_editor_projects IS 'Video editor projects with timeline data';
COMMENT ON TABLE video_editor_exports IS 'Export history and status for video projects';
COMMENT ON TABLE video_editor_media IS 'Cloud-stored media assets for video projects';
COMMENT ON TABLE video_editor_presets IS 'Saved filter, transition, and effect presets';
COMMENT ON TABLE video_editor_templates IS 'Pre-built project templates';
COMMENT ON TABLE video_editor_collaborators IS 'Project collaboration and sharing';
COMMENT ON TABLE video_editor_comments IS 'Comments and annotations on projects';
COMMENT ON TABLE video_editor_activity IS 'Activity log for project changes';
