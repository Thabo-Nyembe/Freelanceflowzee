-- Enhanced Video Studio Migration
-- This migration adds tables and features for the enhanced video studio including:
-- - Video edits tracking for timeline edits, effects, and filters
-- - Enhanced project integration
-- - Video collaboration features

-- Create video_edits table for tracking all video editing operations
CREATE TABLE IF NOT EXISTS public.video_edits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Edit data
    edits JSONB NOT NULL DEFAULT '[]',
    edit_type TEXT NOT NULL DEFAULT 'timeline' CHECK (edit_type IN ('timeline', 'effect', 'filter', 'overlay', 'audio', 'metadata')),
    
    -- Edit metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    is_applied BOOLEAN NOT NULL DEFAULT true,
    
    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    parent_edit_id UUID REFERENCES public.video_edits(id),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('draft', 'saved', 'processing', 'applied', 'failed')),
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for video_edits
CREATE INDEX IF NOT EXISTS idx_video_edits_video_id ON public.video_edits(video_id);
CREATE INDEX IF NOT EXISTS idx_video_edits_user_id ON public.video_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_video_edits_created_at ON public.video_edits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_edits_status ON public.video_edits(status);
CREATE INDEX IF NOT EXISTS idx_video_edits_edit_type ON public.video_edits(edit_type);

-- Create video_projects table for enhanced project management
CREATE TABLE IF NOT EXISTS public.video_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Project ownership and collaboration
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id),
    
    -- Project settings
    settings JSONB NOT NULL DEFAULT '{}',
    template_settings JSONB NOT NULL DEFAULT '{}',
    
    -- Status and workflow
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'review', 'completed', 'archived')),
    workflow_stage TEXT,
    due_date TIMESTAMPTZ,
    
    -- Project metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for video_projects
CREATE INDEX IF NOT EXISTS idx_video_projects_owner_id ON public.video_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_client_id ON public.video_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON public.video_projects(status);
CREATE INDEX IF NOT EXISTS idx_video_projects_created_at ON public.video_projects(created_at DESC);

-- Create video_project_collaborators table for team collaboration
CREATE TABLE IF NOT EXISTS public.video_project_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.video_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Collaboration details
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'reviewer', 'viewer')),
    permissions JSONB NOT NULL DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

-- Create indexes for video_project_collaborators
CREATE INDEX IF NOT EXISTS idx_video_project_collaborators_project_id ON public.video_project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_video_project_collaborators_user_id ON public.video_project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_video_project_collaborators_role ON public.video_project_collaborators(role);

-- Create video_templates table for reusable editing templates
CREATE TABLE IF NOT EXISTS public.video_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Template ownership
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT false,
    
    -- Template data
    template_data JSONB NOT NULL DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    
    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for video_templates
CREATE INDEX IF NOT EXISTS idx_video_templates_owner_id ON public.video_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_video_templates_is_public ON public.video_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_video_templates_category ON public.video_templates(category);
CREATE INDEX IF NOT EXISTS idx_video_templates_usage_count ON public.video_templates(usage_count DESC);

-- Update videos table to link with projects
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS video_project_id UUID REFERENCES public.video_projects(id);

CREATE INDEX IF NOT EXISTS idx_videos_video_project_id ON public.videos(video_project_id);

-- Create video_export_jobs table for tracking export operations
CREATE TABLE IF NOT EXISTS public.video_export_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Export configuration
    export_format TEXT NOT NULL DEFAULT 'mp4' CHECK (export_format IN ('mp4', 'webm', 'mov', 'avi')),
    quality TEXT NOT NULL DEFAULT 'high' CHECK (quality IN ('low', 'medium', 'high', 'ultra')),
    resolution TEXT NOT NULL DEFAULT '1080p' CHECK (resolution IN ('720p', '1080p', '1440p', '4k')),
    include_audio BOOLEAN NOT NULL DEFAULT true,
    
    -- Export settings
    export_settings JSONB NOT NULL DEFAULT '{}',
    edits_applied JSONB NOT NULL DEFAULT '[]',
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- File details
    output_url TEXT,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    
    -- Processing details
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for video_export_jobs
CREATE INDEX IF NOT EXISTS idx_video_export_jobs_video_id ON public.video_export_jobs(video_id);
CREATE INDEX IF NOT EXISTS idx_video_export_jobs_user_id ON public.video_export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_export_jobs_status ON public.video_export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_export_jobs_created_at ON public.video_export_jobs(created_at DESC);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all new tables
CREATE TRIGGER update_video_edits_updated_at BEFORE UPDATE ON public.video_edits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_projects_updated_at BEFORE UPDATE ON public.video_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_project_collaborators_updated_at BEFORE UPDATE ON public.video_project_collaborators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_templates_updated_at BEFORE UPDATE ON public.video_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_export_jobs_updated_at BEFORE UPDATE ON public.video_export_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) for all new tables
ALTER TABLE public.video_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_export_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_edits
CREATE POLICY "Users can view their own video edits" ON public.video_edits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create edits for their own videos" ON public.video_edits
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.videos 
            WHERE id = video_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own video edits" ON public.video_edits
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own video edits" ON public.video_edits
    FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for video_projects
CREATE POLICY "Users can view their own projects" ON public.video_projects
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Collaborators can view projects they're part of" ON public.video_projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.video_project_collaborators 
            WHERE project_id = id AND user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can create their own projects" ON public.video_projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update their projects" ON public.video_projects
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Project owners can delete their projects" ON public.video_projects
    FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for video_project_collaborators
CREATE POLICY "Users can view collaborations they're part of" ON public.video_project_collaborators
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.video_projects 
            WHERE id = project_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can manage collaborators" ON public.video_project_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.video_projects 
            WHERE id = project_id AND owner_id = auth.uid()
        )
    );

-- Create RLS policies for video_templates
CREATE POLICY "Users can view public templates" ON public.video_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own templates" ON public.video_templates
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own templates" ON public.video_templates
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own templates" ON public.video_templates
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own templates" ON public.video_templates
    FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for video_export_jobs
CREATE POLICY "Users can view their own export jobs" ON public.video_export_jobs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create export jobs for their videos" ON public.video_export_jobs
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.videos 
            WHERE id = video_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own export jobs" ON public.video_export_jobs
    FOR UPDATE USING (user_id = auth.uid());

-- Insert some default video templates
INSERT INTO public.video_templates (title, description, owner_id, is_public, template_data, category, tags) VALUES
(
    'Professional Intro',
    'Clean professional video introduction template',
    '00000000-0000-0000-0000-000000000000', -- System user
    true,
    '{"effects": [{"type": "fade-in", "duration": 1000}], "transitions": [], "filters": {"brightness": 110, "contrast": 105}}',
    'intro',
    ARRAY['professional', 'business', 'intro']
),
(
    'Tutorial Style',
    'Educational video template with chapter markers',
    '00000000-0000-0000-0000-000000000000', -- System user
    true,
    '{"effects": [], "transitions": [{"type": "cut", "style": "clean"}], "filters": {"brightness": 105, "contrast": 100}}',
    'tutorial',
    ARRAY['education', 'tutorial', 'learning']
),
(
    'Marketing Video',
    'Engaging marketing video template with dynamic effects',
    '00000000-0000-0000-0000-000000000000', -- System user
    true,
    '{"effects": [{"type": "fade-in", "duration": 500}, {"type": "fade-out", "duration": 500}], "transitions": [], "filters": {"brightness": 115, "contrast": 110, "saturation": 105}}',
    'marketing',
    ARRAY['marketing', 'promotional', 'business']
);

-- Add helpful comments
COMMENT ON TABLE public.video_edits IS 'Stores all video editing operations and their history';
COMMENT ON TABLE public.video_projects IS 'Enhanced project management for video content';
COMMENT ON TABLE public.video_project_collaborators IS 'Team collaboration on video projects';
COMMENT ON TABLE public.video_templates IS 'Reusable video editing templates';
COMMENT ON TABLE public.video_export_jobs IS 'Tracks video export and rendering jobs';

-- Success message
SELECT 'Enhanced Video Studio migration completed successfully!' as message; 