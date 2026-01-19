-- ============================================================
-- Goals & OKRs System - FreeFlow A+++ Implementation
-- Complete goal tracking with OKRs, milestones, and progress
-- ============================================================

-- ============ Enums ============

-- Goal type enum
CREATE TYPE goal_type AS ENUM (
  'objective',      -- High-level objective (O in OKR)
  'key_result',     -- Measurable key result (KR in OKR)
  'milestone',      -- Project milestone
  'target',         -- Business/financial target
  'habit',          -- Recurring habit/activity goal
  'learning'        -- Learning/skill development goal
);

-- Goal status enum
CREATE TYPE goal_status AS ENUM (
  'draft',
  'active',
  'on_track',
  'at_risk',
  'behind',
  'completed',
  'cancelled',
  'deferred'
);

-- Goal timeframe enum
CREATE TYPE goal_timeframe AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom'
);

-- Goal metric type
CREATE TYPE metric_type AS ENUM (
  'number',         -- Simple numeric value
  'percentage',     -- Percentage completion
  'currency',       -- Monetary amount
  'boolean',        -- Yes/no completion
  'milestone',      -- Milestone-based progress
  'count'           -- Count of items
);

-- Goal visibility
CREATE TYPE goal_visibility AS ENUM (
  'private',        -- Only owner can see
  'team',           -- Team members can see
  'public'          -- Anyone in organization can see
);

-- ============ Main Tables ============

-- Goals table (supports both Objectives and other goal types)
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES goals(id) ON DELETE SET NULL,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  goal_type goal_type NOT NULL DEFAULT 'objective',
  status goal_status NOT NULL DEFAULT 'active',
  visibility goal_visibility NOT NULL DEFAULT 'private',

  -- Timeframe
  timeframe goal_timeframe NOT NULL DEFAULT 'quarterly',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  completed_date DATE,

  -- Metrics
  metric_type metric_type NOT NULL DEFAULT 'percentage',
  target_value DECIMAL(15, 2) NOT NULL DEFAULT 100,
  current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  starting_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  unit TEXT, -- e.g., '$', '%', 'clients', 'hours'

  -- Progress
  progress_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN target_value = starting_value THEN
        CASE WHEN current_value >= target_value THEN 100 ELSE 0 END
      ELSE
        LEAST(100, GREATEST(0,
          ((current_value - starting_value) / NULLIF(target_value - starting_value, 0)) * 100
        ))
    END
  ) STORED,

  -- Weight for OKRs (how much this KR contributes to the objective)
  weight DECIMAL(5, 2) DEFAULT 1.0,

  -- Priority and categorization
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  color TEXT,
  icon TEXT,
  tags TEXT[],
  category TEXT,

  -- Reminders and notifications
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_frequency TEXT, -- 'daily', 'weekly', 'custom'
  last_reminder_sent TIMESTAMPTZ,

  -- Team collaboration
  team_id UUID,
  owner_id UUID REFERENCES auth.users(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key Results table (for OKRs)
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  status goal_status NOT NULL DEFAULT 'active',

  -- Metrics
  metric_type metric_type NOT NULL DEFAULT 'percentage',
  target_value DECIMAL(15, 2) NOT NULL DEFAULT 100,
  current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  starting_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  unit TEXT,

  -- Progress (calculated)
  progress_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN target_value = starting_value THEN
        CASE WHEN current_value >= target_value THEN 100 ELSE 0 END
      ELSE
        LEAST(100, GREATEST(0,
          ((current_value - starting_value) / NULLIF(target_value - starting_value, 0)) * 100
        ))
    END
  ) STORED,

  -- Weight (contribution to objective)
  weight DECIMAL(5, 2) DEFAULT 1.0,

  -- Dates
  start_date DATE,
  due_date DATE,
  completed_date DATE,

  -- Order
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal milestones/checkpoints
CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  is_completed BOOLEAN DEFAULT false,

  -- Progress value when this milestone is reached
  milestone_value DECIMAL(15, 2),

  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal progress history (for tracking changes over time)
CREATE TABLE IF NOT EXISTS goal_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  key_result_id UUID REFERENCES key_results(id) ON DELETE CASCADE,

  -- Progress snapshot
  previous_value DECIMAL(15, 2),
  new_value DECIMAL(15, 2) NOT NULL,
  previous_status goal_status,
  new_status goal_status,

  -- Context
  note TEXT,
  source TEXT, -- 'manual', 'automatic', 'integration'

  -- Who made the update
  updated_by UUID REFERENCES auth.users(id),

  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal check-ins (regular progress updates)
CREATE TABLE IF NOT EXISTS goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Check-in content
  status goal_status,
  progress_update DECIMAL(15, 2),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5), -- 1=very low, 5=very high
  blockers TEXT,
  wins TEXT,
  notes TEXT,

  -- Linked items
  linked_tasks JSONB, -- Array of task IDs
  linked_projects JSONB, -- Array of project IDs

  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal templates for quick setup
CREATE TABLE IF NOT EXISTS goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_system BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,

  -- Template structure
  template_data JSONB NOT NULL, -- Contains goal structure with nested KRs

  -- Suggested timeframe
  suggested_timeframe goal_timeframe DEFAULT 'quarterly',
  suggested_duration_days INTEGER,

  -- Metadata
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal links (connect goals to projects, tasks, invoices, etc.)
CREATE TABLE IF NOT EXISTS goal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,

  -- Linked entity
  linked_entity_type TEXT NOT NULL, -- 'project', 'task', 'invoice', 'client', etc.
  linked_entity_id UUID NOT NULL,

  -- How this link affects progress
  contributes_to_progress BOOLEAN DEFAULT false,
  progress_weight DECIMAL(5, 2) DEFAULT 1.0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(goal_id, linked_entity_type, linked_entity_id)
);

-- Goal contributors (for team goals)
CREATE TABLE IF NOT EXISTS goal_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT DEFAULT 'contributor', -- 'owner', 'contributor', 'viewer'
  can_update_progress BOOLEAN DEFAULT true,

  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(goal_id, user_id)
);

-- ============ Indexes ============

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_parent_id ON goals(parent_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_goal_type ON goals(goal_type);
CREATE INDEX idx_goals_timeframe ON goals(timeframe);
CREATE INDEX idx_goals_due_date ON goals(due_date);
CREATE INDEX idx_goals_dates ON goals(start_date, due_date);

CREATE INDEX idx_key_results_objective_id ON key_results(objective_id);
CREATE INDEX idx_key_results_user_id ON key_results(user_id);
CREATE INDEX idx_key_results_status ON key_results(status);

CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_goal_progress_history_goal_id ON goal_progress_history(goal_id);
CREATE INDEX idx_goal_progress_history_recorded_at ON goal_progress_history(recorded_at);

CREATE INDEX idx_goal_check_ins_goal_id ON goal_check_ins(goal_id);
CREATE INDEX idx_goal_check_ins_user_id ON goal_check_ins(user_id);
CREATE INDEX idx_goal_check_ins_date ON goal_check_ins(check_in_date);

CREATE INDEX idx_goal_links_goal_id ON goal_links(goal_id);
CREATE INDEX idx_goal_links_entity ON goal_links(linked_entity_type, linked_entity_id);

-- ============ Functions ============

-- Function to update goal progress based on key results
CREATE OR REPLACE FUNCTION update_objective_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_objective_id UUID;
  v_total_weight DECIMAL;
  v_weighted_progress DECIMAL;
BEGIN
  -- Get the objective ID
  IF TG_TABLE_NAME = 'key_results' THEN
    v_objective_id := COALESCE(NEW.objective_id, OLD.objective_id);
  END IF;

  -- Calculate weighted progress from all key results
  SELECT
    COALESCE(SUM(weight), 0),
    COALESCE(SUM(progress_percentage * weight), 0)
  INTO v_total_weight, v_weighted_progress
  FROM key_results
  WHERE objective_id = v_objective_id
    AND status NOT IN ('cancelled', 'deferred');

  -- Update the objective's current value (which updates progress_percentage via generated column)
  IF v_total_weight > 0 THEN
    UPDATE goals
    SET
      current_value = (v_weighted_progress / v_total_weight),
      status = CASE
        WHEN (v_weighted_progress / v_total_weight) >= 100 THEN 'completed'::goal_status
        WHEN (v_weighted_progress / v_total_weight) >= 70 THEN 'on_track'::goal_status
        WHEN (v_weighted_progress / v_total_weight) >= 40 THEN 'at_risk'::goal_status
        ELSE 'behind'::goal_status
      END,
      updated_at = NOW()
    WHERE id = v_objective_id
      AND goal_type = 'objective';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to record progress history
CREATE OR REPLACE FUNCTION record_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if value or status changed
  IF (OLD.current_value IS DISTINCT FROM NEW.current_value) OR
     (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO goal_progress_history (
      goal_id,
      previous_value,
      new_value,
      previous_status,
      new_status,
      source
    ) VALUES (
      NEW.id,
      OLD.current_value,
      NEW.current_value,
      OLD.status,
      NEW.status,
      'manual'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to record key result progress history
CREATE OR REPLACE FUNCTION record_key_result_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if value changed
  IF OLD.current_value IS DISTINCT FROM NEW.current_value THEN
    INSERT INTO goal_progress_history (
      goal_id,
      key_result_id,
      previous_value,
      new_value,
      source
    ) VALUES (
      NEW.objective_id,
      NEW.id,
      OLD.current_value,
      NEW.current_value,
      'manual'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-complete goal when target is reached
CREATE OR REPLACE FUNCTION auto_complete_goal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_value >= NEW.target_value AND OLD.current_value < OLD.target_value THEN
    NEW.status := 'completed';
    NEW.completed_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get goal statistics
CREATE OR REPLACE FUNCTION get_goal_statistics(p_user_id UUID, p_timeframe goal_timeframe DEFAULT NULL)
RETURNS TABLE (
  total_goals BIGINT,
  completed_goals BIGINT,
  active_goals BIGINT,
  at_risk_goals BIGINT,
  behind_goals BIGINT,
  average_progress DECIMAL,
  on_track_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_goals,
    COUNT(*) FILTER (WHERE g.status = 'completed')::BIGINT as completed_goals,
    COUNT(*) FILTER (WHERE g.status = 'active')::BIGINT as active_goals,
    COUNT(*) FILTER (WHERE g.status = 'at_risk')::BIGINT as at_risk_goals,
    COUNT(*) FILTER (WHERE g.status = 'behind')::BIGINT as behind_goals,
    COALESCE(AVG(g.progress_percentage), 0)::DECIMAL as average_progress,
    CASE
      WHEN COUNT(*) FILTER (WHERE g.status IN ('active', 'on_track', 'at_risk', 'behind')) > 0
      THEN (COUNT(*) FILTER (WHERE g.status IN ('on_track', 'completed'))::DECIMAL /
            COUNT(*) FILTER (WHERE g.status IN ('active', 'on_track', 'at_risk', 'behind'))::DECIMAL * 100)
      ELSE 0
    END as on_track_percentage
  FROM goals g
  WHERE g.user_id = p_user_id
    AND (p_timeframe IS NULL OR g.timeframe = p_timeframe)
    AND g.status != 'cancelled';
END;
$$ LANGUAGE plpgsql;

-- ============ Triggers ============

-- Update objective progress when key results change
CREATE TRIGGER trigger_update_objective_progress
  AFTER INSERT OR UPDATE OR DELETE ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION update_objective_progress();

-- Record goal progress history
CREATE TRIGGER trigger_record_goal_progress
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION record_goal_progress();

-- Record key result progress history
CREATE TRIGGER trigger_record_key_result_progress
  BEFORE UPDATE ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION record_key_result_progress();

-- Auto-complete goals
CREATE TRIGGER trigger_auto_complete_goal
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_goal();

-- Update timestamps
CREATE TRIGGER trigger_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_key_results_updated_at
  BEFORE UPDATE ON key_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_goal_milestones_updated_at
  BEFORE UPDATE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_goal_templates_updated_at
  BEFORE UPDATE ON goal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============ RLS Policies ============

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributors ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view team goals"
  ON goals FOR SELECT
  USING (
    visibility IN ('team', 'public')
    OR EXISTS (
      SELECT 1 FROM goal_contributors gc
      WHERE gc.goal_id = id AND gc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Contributors can update goals"
  ON goals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM goal_contributors gc
      WHERE gc.goal_id = id
        AND gc.user_id = auth.uid()
        AND gc.can_update_progress = true
    )
  );

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Key results policies
CREATE POLICY "Users can view own key results"
  ON key_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own key results"
  ON key_results FOR ALL
  USING (auth.uid() = user_id);

-- Goal milestones policies
CREATE POLICY "Users can view goal milestones"
  ON goal_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage goal milestones"
  ON goal_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

-- Progress history policies
CREATE POLICY "Users can view own progress history"
  ON goal_progress_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert progress history"
  ON goal_progress_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

-- Check-ins policies
CREATE POLICY "Users can view own check-ins"
  ON goal_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own check-ins"
  ON goal_check_ins FOR ALL
  USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view own and public templates"
  ON goal_templates FOR SELECT
  USING (user_id = auth.uid() OR is_public = true OR is_system = true);

CREATE POLICY "Users can manage own templates"
  ON goal_templates FOR ALL
  USING (user_id = auth.uid());

-- Goal links policies
CREATE POLICY "Users can view goal links"
  ON goal_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage goal links"
  ON goal_links FOR ALL
  USING (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

-- Contributors policies
CREATE POLICY "Users can view goal contributors"
  ON goal_contributors FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
  );

CREATE POLICY "Goal owners can manage contributors"
  ON goal_contributors FOR ALL
  USING (EXISTS (
    SELECT 1 FROM goals g WHERE g.id = goal_id AND g.user_id = auth.uid()
  ));

-- ============ Seed Data: Goal Templates ============

INSERT INTO goal_templates (name, description, category, is_system, is_public, template_data, suggested_timeframe, suggested_duration_days) VALUES
('Revenue Growth', 'Increase business revenue through multiple channels', 'Business', true, true,
'{"title": "Increase Revenue by X%", "goal_type": "objective", "metric_type": "percentage", "key_results": [{"title": "Acquire X new clients", "metric_type": "number", "weight": 0.4}, {"title": "Increase average project value by X%", "metric_type": "percentage", "weight": 0.3}, {"title": "Reduce client churn to under X%", "metric_type": "percentage", "weight": 0.3}]}',
'quarterly', 90),

('Client Satisfaction', 'Improve client satisfaction and retention', 'Business', true, true,
'{"title": "Achieve X% Client Satisfaction", "goal_type": "objective", "metric_type": "percentage", "key_results": [{"title": "Achieve NPS score of X", "metric_type": "number", "weight": 0.4}, {"title": "Respond to all inquiries within X hours", "metric_type": "boolean", "weight": 0.3}, {"title": "Complete X client feedback sessions", "metric_type": "number", "weight": 0.3}]}',
'quarterly', 90),

('Productivity Improvement', 'Increase personal or team productivity', 'Personal', true, true,
'{"title": "Improve Productivity by X%", "goal_type": "objective", "metric_type": "percentage", "key_results": [{"title": "Complete X billable hours per week", "metric_type": "number", "weight": 0.4}, {"title": "Reduce average task completion time by X%", "metric_type": "percentage", "weight": 0.3}, {"title": "Automate X recurring tasks", "metric_type": "number", "weight": 0.3}]}',
'monthly', 30),

('Skill Development', 'Learn new skills and improve expertise', 'Learning', true, true,
'{"title": "Master X Skill", "goal_type": "objective", "metric_type": "percentage", "key_results": [{"title": "Complete X hours of learning", "metric_type": "number", "weight": 0.3}, {"title": "Complete X certifications/courses", "metric_type": "number", "weight": 0.3}, {"title": "Apply skill in X projects", "metric_type": "number", "weight": 0.4}]}',
'quarterly', 90),

('Financial Health', 'Improve business financial metrics', 'Finance', true, true,
'{"title": "Achieve Financial Targets", "goal_type": "objective", "metric_type": "currency", "key_results": [{"title": "Maintain cash runway of X months", "metric_type": "number", "weight": 0.3}, {"title": "Achieve profit margin of X%", "metric_type": "percentage", "weight": 0.4}, {"title": "Reduce outstanding invoices to under $X", "metric_type": "currency", "weight": 0.3}]}',
'quarterly', 90),

('Project Delivery', 'Deliver projects on time and within budget', 'Operations', true, true,
'{"title": "Achieve X% On-Time Delivery", "goal_type": "objective", "metric_type": "percentage", "key_results": [{"title": "Complete X projects on schedule", "metric_type": "number", "weight": 0.4}, {"title": "Keep budget variance under X%", "metric_type": "percentage", "weight": 0.3}, {"title": "Achieve client sign-off on first review for X% of projects", "metric_type": "percentage", "weight": 0.3}]}',
'quarterly', 90);

-- ============ Comments ============

COMMENT ON TABLE goals IS 'Main goals table supporting objectives, OKRs, targets, and milestones';
COMMENT ON TABLE key_results IS 'Key results linked to objectives for OKR tracking';
COMMENT ON TABLE goal_milestones IS 'Checkpoints and milestones within a goal';
COMMENT ON TABLE goal_progress_history IS 'Historical record of goal progress changes';
COMMENT ON TABLE goal_check_ins IS 'Regular check-in updates on goal progress';
COMMENT ON TABLE goal_templates IS 'Reusable goal templates for quick setup';
COMMENT ON TABLE goal_links IS 'Links between goals and other entities like projects and tasks';
COMMENT ON TABLE goal_contributors IS 'Team members who can view or update goals';
