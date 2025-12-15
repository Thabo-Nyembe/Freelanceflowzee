-- Batch 41: Content Creation & Studio
-- Tables: content, content_studio, canvas
-- Created: December 14, 2024

-- ================================================
-- CONTENT TABLE
-- ================================================
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

CREATE INDEX idx_content_user_id ON content(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_status ON content(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_published ON content(published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_slug ON content(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_type ON content(content_type) WHERE deleted_at IS NULL;

ALTER TABLE content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own content" ON content FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own content" ON content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON content FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own content" ON content FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE content;

-- ================================================
-- CONTENT STUDIO TABLE
-- ================================================
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

CREATE INDEX idx_content_studio_user_id ON content_studio(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_studio_status ON content_studio(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_studio_type ON content_studio(project_type) WHERE deleted_at IS NULL;

ALTER TABLE content_studio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own studio projects" ON content_studio FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own studio projects" ON content_studio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own studio projects" ON content_studio FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own studio projects" ON content_studio FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE content_studio;

-- ================================================
-- CANVAS TABLE
-- ================================================
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

CREATE INDEX idx_canvas_user_id ON canvas(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_type ON canvas(canvas_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_canvas_status ON canvas(status) WHERE deleted_at IS NULL;

ALTER TABLE canvas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own canvas" ON canvas FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own canvas" ON canvas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own canvas" ON canvas FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own canvas" ON canvas FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE canvas;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_studio_updated_at BEFORE UPDATE ON content_studio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_updated_at BEFORE UPDATE ON canvas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
