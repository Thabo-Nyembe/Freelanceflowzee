-- ============================================
-- TIME TRACKING SYSTEM MIGRATION
-- ============================================
-- Comprehensive database schema for time tracking with:
-- - Real-time timer tracking
-- - Manual time entries
-- - Project and task allocation
-- - Billable vs non-billable hours
-- - Time reports and analytics
-- - Budget tracking
-- - Team time tracking
-- - Invoice integration
-- - Productivity insights
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE entry_status AS ENUM ('running', 'stopped', 'paused');
CREATE TYPE entry_type AS ENUM ('timer', 'manual', 'imported');
CREATE TYPE rounding_mode AS ENUM ('none', '15min', '30min', '1hour');
CREATE TYPE budget_type AS ENUM ('hours', 'amount');
CREATE TYPE time_range_type AS ENUM ('today', 'yesterday', 'this-week', 'last-week', 'this-month', 'last-month', 'custom');
CREATE TYPE report_format AS ENUM ('csv', 'pdf', 'json', 'excel');

-- ============================================
-- TIME ENTRIES TABLE
-- ============================================

CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    project_name TEXT NOT NULL,
    task_id UUID NOT NULL,
    task_name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    is_running BOOLEAN DEFAULT FALSE,
    is_paused BOOLEAN DEFAULT FALSE,
    status entry_status DEFAULT 'stopped',
    type entry_type DEFAULT 'timer',
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    tags TEXT[] DEFAULT '{}',
    client TEXT,
    location TEXT,
    device TEXT,
    pause_duration INTEGER DEFAULT 0,
    pause_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for time entries
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time DESC);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_billable ON time_entries(billable);
CREATE INDEX idx_time_entries_tags ON time_entries USING GIN(tags);
CREATE INDEX idx_time_entries_date ON time_entries((start_time::date));
CREATE INDEX idx_time_entries_running ON time_entries(user_id, is_running) WHERE is_running = TRUE;

-- Full-text search for time entries
CREATE INDEX idx_time_entries_search ON time_entries USING GIN(
    to_tsvector('english', description || ' ' || project_name || ' ' || task_name)
);

-- ============================================
-- TIME TRACKING PROJECTS TABLE
-- ============================================

CREATE TABLE time_tracking_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    client TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    budget DECIMAL(10, 2),
    budget_type budget_type,
    archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX idx_time_tracking_projects_user_id ON time_tracking_projects(user_id);
CREATE INDEX idx_time_tracking_projects_archived ON time_tracking_projects(archived);
CREATE INDEX idx_time_tracking_projects_billable ON time_tracking_projects(billable);

-- ============================================
-- TIME TRACKING TASKS TABLE
-- ============================================

CREATE TABLE time_tracking_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES time_tracking_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_hours DECIMAL(10, 2),
    spent_hours DECIMAL(10, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('todo', 'in-progress', 'completed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX idx_time_tracking_tasks_project_id ON time_tracking_tasks(project_id);
CREATE INDEX idx_time_tracking_tasks_status ON time_tracking_tasks(status);

-- ============================================
-- TIMER SETTINGS TABLE
-- ============================================

CREATE TABLE timer_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    auto_start BOOLEAN DEFAULT FALSE,
    auto_stop BOOLEAN DEFAULT TRUE,
    idle_detection BOOLEAN DEFAULT TRUE,
    idle_threshold INTEGER DEFAULT 5, -- minutes
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_interval INTEGER DEFAULT 30, -- minutes
    rounding_mode rounding_mode DEFAULT 'none',
    week_start TEXT CHECK (week_start IN ('monday', 'sunday')) DEFAULT 'monday',
    time_format TEXT CHECK (time_format IN ('12h', '24h')) DEFAULT '12h',
    default_billable BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for timer settings
CREATE INDEX idx_timer_settings_user_id ON timer_settings(user_id);

-- ============================================
-- TIME REPORTS TABLE
-- ============================================

CREATE TABLE time_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    format report_format,
    total_duration INTEGER,
    billable_duration INTEGER,
    total_amount DECIMAL(10, 2),
    project_breakdown JSONB DEFAULT '[]',
    task_breakdown JSONB DEFAULT '[]',
    daily_summary JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX idx_time_reports_user_id ON time_reports(user_id);
CREATE INDEX idx_time_reports_date_range ON time_reports(start_date, end_date);
CREATE INDEX idx_time_reports_generated_at ON time_reports(generated_at DESC);

-- ============================================
-- TIME ANALYTICS TABLE
-- ============================================

CREATE TABLE time_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period time_range_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    billable_hours DECIMAL(10, 2) DEFAULT 0,
    productive_hours DECIMAL(10, 2) DEFAULT 0,
    average_hours_per_day DECIMAL(10, 2) DEFAULT 0,
    most_productive_day TEXT,
    most_productive_hour INTEGER,
    top_projects JSONB DEFAULT '[]',
    top_tasks JSONB DEFAULT '[]',
    trends JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_time_analytics_user_id ON time_analytics(user_id);
CREATE INDEX idx_time_analytics_period ON time_analytics(period);
CREATE INDEX idx_time_analytics_date_range ON time_analytics(period_start, period_end);

-- ============================================
-- WEEKLY SUMMARIES TABLE
-- ============================================

CREATE TABLE weekly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    billable_hours DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    daily_hours DECIMAL(10, 2)[] DEFAULT '{}',
    comparison_hours DECIMAL(10, 2),
    comparison_percentage DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for weekly summaries
CREATE INDEX idx_weekly_summaries_user_id ON weekly_summaries(user_id);
CREATE INDEX idx_weekly_summaries_week_start ON weekly_summaries(week_start DESC);

-- ============================================
-- MONTHLY SUMMARIES TABLE
-- ============================================

CREATE TABLE monthly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    billable_hours DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    working_days INTEGER DEFAULT 0,
    average_hours_per_day DECIMAL(10, 2) DEFAULT 0,
    top_projects JSONB DEFAULT '[]',
    comparison_hours DECIMAL(10, 2),
    comparison_percentage DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for monthly summaries
CREATE INDEX idx_monthly_summaries_user_id ON monthly_summaries(user_id);
CREATE INDEX idx_monthly_summaries_year_month ON monthly_summaries(year DESC, month DESC);

-- ============================================
-- EDIT HISTORY TABLE
-- ============================================

CREATE TABLE time_entry_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for edit history
CREATE INDEX idx_time_entry_edits_entry_id ON time_entry_edits(entry_id);
CREATE INDEX idx_time_entry_edits_edited_by ON time_entry_edits(edited_by);
CREATE INDEX idx_time_entry_edits_edited_at ON time_entry_edits(edited_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update task spent hours when time entry is added/updated
CREATE OR REPLACE FUNCTION update_task_spent_hours()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE time_tracking_tasks
    SET spent_hours = (
        SELECT COALESCE(SUM(duration) / 3600.0, 0)
        FROM time_entries
        WHERE task_id = NEW.task_id
    )
    WHERE id = NEW.task_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_spent_hours
    AFTER INSERT OR UPDATE OF duration ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_task_spent_hours();

-- Prevent multiple running timers per user
CREATE OR REPLACE FUNCTION prevent_multiple_running_timers()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_running = TRUE THEN
        -- Stop all other running timers for this user
        UPDATE time_entries
        SET is_running = FALSE, status = 'stopped'
        WHERE user_id = NEW.user_id
            AND id != NEW.id
            AND is_running = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_multiple_running_timers
    BEFORE INSERT OR UPDATE OF is_running ON time_entries
    FOR EACH ROW
    WHEN (NEW.is_running = TRUE)
    EXECUTE FUNCTION prevent_multiple_running_timers();

-- Auto-calculate duration on end_time update
CREATE OR REPLACE FUNCTION auto_calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_duration
    BEFORE INSERT OR UPDATE OF end_time ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_duration();

-- Log time entry edits
CREATE OR REPLACE FUNCTION log_time_entry_edits()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.description != NEW.description THEN
        INSERT INTO time_entry_edits (entry_id, edited_by, field, old_value, new_value)
        VALUES (NEW.id, NEW.user_id, 'description', OLD.description, NEW.description);
    END IF;

    IF OLD.duration != NEW.duration THEN
        INSERT INTO time_entry_edits (entry_id, edited_by, field, old_value, new_value)
        VALUES (NEW.id, NEW.user_id, 'duration', OLD.duration::TEXT, NEW.duration::TEXT);
    END IF;

    IF OLD.billable != NEW.billable THEN
        INSERT INTO time_entry_edits (entry_id, edited_by, field, old_value, new_value)
        VALUES (NEW.id, NEW.user_id, 'billable', OLD.billable::TEXT, NEW.billable::TEXT);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_time_entry_edits
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION log_time_entry_edits();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_projects_updated_at
    BEFORE UPDATE ON time_tracking_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_tasks_updated_at
    BEFORE UPDATE ON time_tracking_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timer_settings_updated_at
    BEFORE UPDATE ON timer_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entry_edits ENABLE ROW LEVEL SECURITY;

-- Time entries policies
CREATE POLICY "Users can view their own time entries"
    ON time_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries"
    ON time_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
    ON time_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
    ON time_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can manage their own projects"
    ON time_tracking_projects FOR ALL
    USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can manage tasks in their projects"
    ON time_tracking_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM time_tracking_projects
            WHERE id = time_tracking_tasks.project_id
            AND user_id = auth.uid()
        )
    );

-- Timer settings policies
CREATE POLICY "Users can manage their own timer settings"
    ON timer_settings FOR ALL
    USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can manage their own reports"
    ON time_reports FOR ALL
    USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
    ON time_analytics FOR SELECT
    USING (auth.uid() = user_id);

-- Summaries policies
CREATE POLICY "Users can view their own weekly summaries"
    ON weekly_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own monthly summaries"
    ON monthly_summaries FOR SELECT
    USING (auth.uid() = user_id);

-- Edit history policies
CREATE POLICY "Users can view edit history of their entries"
    ON time_entry_edits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM time_entries
            WHERE id = time_entry_edits.entry_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get total duration for user
CREATE OR REPLACE FUNCTION get_total_duration(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_seconds INTEGER;
BEGIN
    SELECT COALESCE(SUM(duration), 0)
    INTO total_seconds
    FROM time_entries
    WHERE user_id = user_uuid
        AND start_time::date BETWEEN start_date AND end_date;

    RETURN total_seconds / 3600.0;
END;
$$ LANGUAGE plpgsql;

-- Get billable duration
CREATE OR REPLACE FUNCTION get_billable_duration(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_seconds INTEGER;
BEGIN
    SELECT COALESCE(SUM(duration), 0)
    INTO total_seconds
    FROM time_entries
    WHERE user_id = user_uuid
        AND billable = TRUE
        AND start_time::date BETWEEN start_date AND end_date;

    RETURN total_seconds / 3600.0;
END;
$$ LANGUAGE plpgsql;

-- Get total amount earned
CREATE OR REPLACE FUNCTION get_total_amount(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_amount DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM((duration / 3600.0) * hourly_rate), 0)
    INTO total_amount
    FROM time_entries
    WHERE user_id = user_uuid
        AND billable = TRUE
        AND hourly_rate IS NOT NULL
        AND start_time::date BETWEEN start_date AND end_date;

    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- Get project breakdown
CREATE OR REPLACE FUNCTION get_project_breakdown(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    duration DECIMAL,
    billable_duration DECIMAL,
    amount DECIMAL,
    entry_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.project_id,
        te.project_name,
        SUM(te.duration) / 3600.0 as duration,
        SUM(CASE WHEN te.billable THEN te.duration ELSE 0 END) / 3600.0 as billable_duration,
        COALESCE(SUM(CASE WHEN te.billable AND te.hourly_rate IS NOT NULL
            THEN (te.duration / 3600.0) * te.hourly_rate
            ELSE 0 END), 0) as amount,
        COUNT(*)::BIGINT as entry_count
    FROM time_entries te
    WHERE te.user_id = user_uuid
        AND te.start_time::date BETWEEN start_date AND end_date
    GROUP BY te.project_id, te.project_name
    ORDER BY duration DESC;
END;
$$ LANGUAGE plpgsql;

-- Get running timer for user
CREATE OR REPLACE FUNCTION get_running_timer(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_name TEXT,
    task_name TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    elapsed_seconds INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.id,
        te.project_name,
        te.task_name,
        te.description,
        te.start_time,
        EXTRACT(EPOCH FROM (NOW() - te.start_time))::INTEGER as elapsed_seconds
    FROM time_entries te
    WHERE te.user_id = user_uuid
        AND te.is_running = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get project budget status
CREATE OR REPLACE FUNCTION get_project_budget_status(project_uuid UUID)
RETURNS TABLE (
    spent DECIMAL,
    budget DECIMAL,
    remaining DECIMAL,
    percentage DECIMAL,
    over_budget BOOLEAN
) AS $$
DECLARE
    project_record RECORD;
    spent_value DECIMAL;
BEGIN
    SELECT * INTO project_record
    FROM time_tracking_projects
    WHERE id = project_uuid;

    IF project_record.budget_type = 'hours' THEN
        SELECT COALESCE(SUM(duration) / 3600.0, 0)
        INTO spent_value
        FROM time_entries
        WHERE project_id = project_uuid;
    ELSE
        SELECT COALESCE(SUM((duration / 3600.0) * hourly_rate), 0)
        INTO spent_value
        FROM time_entries
        WHERE project_id = project_uuid
            AND billable = TRUE
            AND hourly_rate IS NOT NULL;
    END IF;

    RETURN QUERY
    SELECT
        spent_value as spent,
        project_record.budget as budget,
        GREATEST(project_record.budget - spent_value, 0) as remaining,
        CASE
            WHEN project_record.budget > 0 THEN (spent_value / project_record.budget) * 100
            ELSE 0
        END as percentage,
        spent_value > project_record.budget as over_budget;
END;
$$ LANGUAGE plpgsql;

-- Search time entries
CREATE OR REPLACE FUNCTION search_time_entries(
    user_uuid UUID,
    search_query TEXT
)
RETURNS TABLE (
    id UUID,
    project_name TEXT,
    task_name TEXT,
    description TEXT,
    duration INTEGER,
    start_time TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.id,
        te.project_name,
        te.task_name,
        te.description,
        te.duration,
        te.start_time,
        ts_rank(
            to_tsvector('english', te.description || ' ' || te.project_name || ' ' || te.task_name),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM time_entries te
    WHERE te.user_id = user_uuid
        AND to_tsvector('english', te.description || ' ' || te.project_name || ' ' || te.task_name)
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, te.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE time_entries IS 'Individual time tracking entries with timer support';
COMMENT ON TABLE time_tracking_projects IS 'Projects for organizing time entries';
COMMENT ON TABLE time_tracking_tasks IS 'Tasks within projects for detailed tracking';
COMMENT ON TABLE timer_settings IS 'User preferences for timer behavior';
COMMENT ON TABLE time_reports IS 'Generated time reports with summaries';
COMMENT ON TABLE time_analytics IS 'Analytics and insights on time usage';
COMMENT ON TABLE weekly_summaries IS 'Weekly time tracking summaries';
COMMENT ON TABLE monthly_summaries IS 'Monthly time tracking summaries';
COMMENT ON TABLE time_entry_edits IS 'Audit log of changes to time entries';
