-- =============================================
-- CLIENT REVIEW WORKFLOWS MIGRATION
-- Version: V8
-- Description: Comprehensive client review and approval system
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- REVIEW TEMPLATES
-- =============================================

-- Table for reusable review workflow templates
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

-- =============================================
-- CLIENT REVIEWS
-- =============================================

-- Main table for client review workflows
CREATE TABLE IF NOT EXISTS client_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
    
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

-- =============================================
-- REVIEW STAGES
-- =============================================

-- Individual stages within a review workflow
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

-- =============================================
-- REVIEW APPROVALS
-- =============================================

-- Individual approval actions within stages
CREATE TABLE IF NOT EXISTS review_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    review_id UUID NOT NULL REFERENCES client_reviews(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES review_stages(id) ON DELETE CASCADE,
    
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

-- =============================================
-- REVIEW COLLABORATORS
-- =============================================

-- Team members involved in review workflows
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

-- =============================================
-- REVIEW NOTIFICATIONS
-- =============================================

-- Notification tracking for review events
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

-- =============================================
-- REVIEW COMMENTS (Extension of existing video comments)
-- =============================================

-- Add review association to existing video_comments table
ALTER TABLE video_comments 
ADD COLUMN IF NOT EXISTS review_id UUID REFERENCES client_reviews(id) ON DELETE SET NULL;

-- Add review-specific comment types
ALTER TABLE video_comments 
DROP CONSTRAINT IF EXISTS video_comments_comment_type_check;

ALTER TABLE video_comments 
ADD CONSTRAINT video_comments_comment_type_check 
CHECK (comment_type IN ('general', 'feedback', 'question', 'approval', 'revision_request'));

-- =============================================
-- INDEXES
-- =============================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_client_reviews_video_id ON client_reviews(video_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_project_id ON client_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_status ON client_reviews(status);
CREATE INDEX IF NOT EXISTS idx_client_reviews_created_by ON client_reviews(created_by);
CREATE INDEX IF NOT EXISTS idx_client_reviews_deadline ON client_reviews(deadline);

CREATE INDEX IF NOT EXISTS idx_review_stages_review_id ON review_stages(review_id);
CREATE INDEX IF NOT EXISTS idx_review_stages_order ON review_stages(review_id, order_index);
CREATE INDEX IF NOT EXISTS idx_review_stages_status ON review_stages(status);

CREATE INDEX IF NOT EXISTS idx_review_approvals_review_id ON review_approvals(review_id);
CREATE INDEX IF NOT EXISTS idx_review_approvals_stage_id ON review_approvals(stage_id);
CREATE INDEX IF NOT EXISTS idx_review_approvals_user_id ON review_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_review_approvals_status ON review_approvals(status);
CREATE INDEX IF NOT EXISTS idx_review_approvals_email ON review_approvals(reviewer_email);

CREATE INDEX IF NOT EXISTS idx_review_collaborators_review_id ON review_collaborators(review_id);
CREATE INDEX IF NOT EXISTS idx_review_collaborators_user_id ON review_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_review_notifications_user_id ON review_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_review_notifications_unread ON review_notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_review_templates_category ON review_templates(category);
CREATE INDEX IF NOT EXISTS idx_review_templates_public ON review_templates(is_public) WHERE is_public = true;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Review Templates Policies
CREATE POLICY "Public templates are viewable by everyone" ON review_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own templates" ON review_templates
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create templates" ON review_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON review_templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON review_templates
    FOR DELETE USING (auth.uid() = created_by);

-- Client Reviews Policies
CREATE POLICY "Users can view reviews they created" ON client_reviews
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view reviews they're collaborating on" ON client_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM review_collaborators 
            WHERE review_id = client_reviews.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view reviews for their videos" ON client_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM videos 
            WHERE id = client_reviews.video_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create reviews for their videos" ON client_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM videos 
            WHERE id = video_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own reviews" ON client_reviews
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own reviews" ON client_reviews
    FOR DELETE USING (auth.uid() = created_by);

-- Review Stages Policies
CREATE POLICY "Users can view stages for accessible reviews" ON review_stages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM client_reviews 
            WHERE id = review_stages.review_id 
            AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM review_collaborators 
                    WHERE review_id = client_reviews.id 
                    AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Review owners can manage stages" ON review_stages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM client_reviews 
            WHERE id = review_stages.review_id 
            AND created_by = auth.uid()
        )
    );

-- Review Approvals Policies
CREATE POLICY "Users can view approvals for accessible reviews" ON review_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM client_reviews 
            WHERE id = review_approvals.review_id 
            AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM review_collaborators 
                    WHERE review_id = client_reviews.id 
                    AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can create their own approvals" ON review_approvals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own approvals" ON review_approvals
    FOR UPDATE USING (auth.uid() = user_id);

-- Review Collaborators Policies
CREATE POLICY "Users can view collaborators for accessible reviews" ON review_collaborators
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM client_reviews 
            WHERE id = review_collaborators.review_id 
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Review owners can manage collaborators" ON review_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM client_reviews 
            WHERE id = review_collaborators.review_id 
            AND created_by = auth.uid()
        )
    );

-- Review Notifications Policies
CREATE POLICY "Users can view their own notifications" ON review_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON review_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_review_templates_updated_at BEFORE UPDATE ON review_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_reviews_updated_at BEFORE UPDATE ON client_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_stages_updated_at BEFORE UPDATE ON review_stages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_collaborators_updated_at BEFORE UPDATE ON review_collaborators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set current_stage when review starts
CREATE OR REPLACE FUNCTION set_initial_current_stage()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes from draft to in_review, set current_stage to first stage
    IF OLD.status = 'draft' AND NEW.status = 'in_review' AND NEW.current_stage IS NULL THEN
        SELECT id INTO NEW.current_stage 
        FROM review_stages 
        WHERE review_id = NEW.id 
        ORDER BY order_index ASC 
        LIMIT 1;
        
        -- Set started_at if not already set
        IF NEW.started_at IS NULL THEN
            NEW.started_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_review_current_stage BEFORE UPDATE ON client_reviews 
    FOR EACH ROW EXECUTE FUNCTION set_initial_current_stage();

-- Function to auto-advance stages when conditions are met
CREATE OR REPLACE FUNCTION check_stage_completion()
RETURNS TRIGGER AS $$
DECLARE
    stage_record review_stages%ROWTYPE;
    approved_count INTEGER;
    next_stage_id UUID;
BEGIN
    -- Get stage details
    SELECT * INTO stage_record 
    FROM review_stages 
    WHERE id = NEW.stage_id;
    
    -- Count approved approvals for this stage
    SELECT COUNT(*) INTO approved_count
    FROM review_approvals 
    WHERE stage_id = NEW.stage_id 
    AND status = 'approved';
    
    -- Check if stage requirements are met
    IF approved_count >= stage_record.required_approvals THEN
        -- Mark stage as completed
        UPDATE review_stages 
        SET status = 'completed', completed_at = NOW()
        WHERE id = NEW.stage_id;
        
        -- Find next stage
        SELECT id INTO next_stage_id
        FROM review_stages 
        WHERE review_id = stage_record.review_id 
        AND order_index > stage_record.order_index
        ORDER BY order_index ASC 
        LIMIT 1;
        
        IF next_stage_id IS NOT NULL THEN
            -- Move to next stage
            UPDATE client_reviews 
            SET current_stage = next_stage_id
            WHERE id = stage_record.review_id;
            
            -- Mark next stage as active
            UPDATE review_stages 
            SET status = 'active', started_at = NOW()
            WHERE id = next_stage_id;
        ELSE
            -- All stages complete - approve review
            UPDATE client_reviews 
            SET status = 'approved', completed_at = NOW()
            WHERE id = stage_record.review_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_approval_stage_completion 
    AFTER INSERT OR UPDATE ON review_approvals 
    FOR EACH ROW 
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION check_stage_completion();

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default review templates
INSERT INTO review_templates (id, name, description, category, is_public, is_system, stages_config, default_settings) 
VALUES 
    (
        uuid_generate_v4(),
        'Basic Client Approval',
        'Simple single-stage client approval workflow',
        'basic',
        true,
        true,
        '[{
            "name": "Client Review",
            "description": "Client reviews and approves the deliverable",
            "order": 1,
            "required_approvals": 1,
            "auto_advance": false
        }]',
        '{
            "allow_comments": true,
            "require_all_approvals": true,
            "auto_advance_stages": false,
            "send_notifications": true
        }'
    ),
    (
        uuid_generate_v4(),
        'Internal + Client Review',
        'Two-stage workflow with internal review followed by client approval',
        'detailed',
        true,
        true,
        '[{
            "name": "Internal Review",
            "description": "Team reviews deliverable before client presentation",
            "order": 1,
            "required_approvals": 1,
            "auto_advance": true
        }, {
            "name": "Client Approval",
            "description": "Client reviews and provides final approval",
            "order": 2,
            "required_approvals": 1,
            "auto_advance": false
        }]',
        '{
            "allow_comments": true,
            "require_all_approvals": true,
            "auto_advance_stages": true,
            "send_notifications": true
        }'
    ),
    (
        uuid_generate_v4(),
        'Multi-Client Approval',
        'Multiple client stakeholders must approve',
        'collaborative',
        true,
        true,
        '[{
            "name": "Stakeholder Review",
            "description": "All client stakeholders review and approve",
            "order": 1,
            "required_approvals": 2,
            "auto_advance": false
        }]',
        '{
            "allow_comments": true,
            "require_all_approvals": true,
            "auto_advance_stages": false,
            "send_notifications": true
        }'
    )
ON CONFLICT DO NOTHING;

-- =============================================
-- COMPLETION
-- =============================================

-- Add helpful comment
COMMENT ON TABLE client_reviews IS 'Client review workflows for video approval processes';
COMMENT ON TABLE review_stages IS 'Individual stages within client review workflows';
COMMENT ON TABLE review_approvals IS 'Approval actions by reviewers at each stage';
COMMENT ON TABLE review_templates IS 'Reusable templates for review workflows';
COMMENT ON TABLE review_collaborators IS 'Team members participating in review workflows';
COMMENT ON TABLE review_notifications IS 'Notification tracking for review events'; 