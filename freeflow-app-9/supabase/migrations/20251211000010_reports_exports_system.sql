-- =====================================================
-- KAZI Reports & Exports System - Complete Migration
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (clean slate)
-- =====================================================
DROP TABLE IF EXISTS export_jobs CASCADE;
DROP TABLE IF EXISTS exports CASCADE;
DROP TABLE IF EXISTS scheduled_reports CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    schedule JSONB,
    is_template BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    last_generated_at TIMESTAMPTZ,
    generation_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCHEDULED REPORTS TABLE
-- =====================================================
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    time VARCHAR(5) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    email_recipients TEXT[] DEFAULT '{}',
    export_format VARCHAR(10) DEFAULT 'pdf',
    is_active BOOLEAN DEFAULT true,
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXPORTS TABLE
-- =====================================================
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    file_url TEXT,
    file_size BIGINT,
    error_message TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- EXPORT JOBS TABLE (for background processing)
-- =====================================================
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_id UUID NOT NULL REFERENCES exports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TIME ENTRIES TABLE (for time tracking reports)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    task_id UUID,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10, 2),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXPENSES TABLE (for expense reports)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID,
    client_id UUID,
    category VARCHAR(50),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    date DATE NOT NULL,
    receipt_url TEXT,
    is_reimbursable BOOLEAN DEFAULT false,
    is_reimbursed BOOLEAN DEFAULT false,
    reimbursed_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(user_id, type);
CREATE INDEX IF NOT EXISTS idx_reports_template ON reports(is_template) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_reports_public ON reports(is_public) WHERE is_public = true;

-- Scheduled reports indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_report ON scheduled_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user ON scheduled_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next ON scheduled_reports(next_run_at) WHERE is_active = true;

-- Exports indexes
CREATE INDEX IF NOT EXISTS idx_exports_user ON exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_report ON exports(report_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created ON exports(created_at DESC);

-- Export jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_export ON export_jobs(export_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status) WHERE status IN ('queued', 'processing');

-- Time entries indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_dates ON time_entries(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(user_id, is_billable) WHERE is_billable = true;

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_client ON expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Reports policies
CREATE POLICY "reports_select" ON reports FOR SELECT
    USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "reports_insert" ON reports FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "reports_update" ON reports FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "reports_delete" ON reports FOR DELETE
    USING (user_id = auth.uid());

-- Scheduled reports policies
CREATE POLICY "scheduled_reports_all" ON scheduled_reports FOR ALL
    USING (user_id = auth.uid());

-- Exports policies
CREATE POLICY "exports_all" ON exports FOR ALL
    USING (user_id = auth.uid());

-- Export jobs policies
CREATE POLICY "export_jobs_all" ON export_jobs FOR ALL
    USING (user_id = auth.uid());

-- Time entries policies
CREATE POLICY "time_entries_all" ON time_entries FOR ALL
    USING (user_id = auth.uid());

-- Expenses policies
CREATE POLICY "expenses_all" ON expenses FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON reports TO authenticated;
GRANT ALL ON scheduled_reports TO authenticated;
GRANT ALL ON exports TO authenticated;
GRANT ALL ON export_jobs TO authenticated;
GRANT ALL ON time_entries TO authenticated;
GRANT ALL ON expenses TO authenticated;

GRANT ALL ON reports TO service_role;
GRANT ALL ON scheduled_reports TO service_role;
GRANT ALL ON exports TO service_role;
GRANT ALL ON export_jobs TO service_role;
GRANT ALL ON time_entries TO service_role;
GRANT ALL ON expenses TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

CREATE TRIGGER scheduled_reports_updated_at
    BEFORE UPDATE ON scheduled_reports
    FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

CREATE TRIGGER time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

CREATE TRIGGER expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

-- Auto-calculate duration for time entries
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entries_duration
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get report summary stats
CREATE OR REPLACE FUNCTION get_report_stats(
    p_user_id UUID,
    p_type VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_reports', (
            SELECT COUNT(*) FROM reports
            WHERE user_id = p_user_id
            AND (p_type IS NULL OR type = p_type)
        ),
        'scheduled_reports', (
            SELECT COUNT(*) FROM scheduled_reports
            WHERE user_id = p_user_id
            AND is_active = true
        ),
        'recent_exports', (
            SELECT COUNT(*) FROM exports
            WHERE user_id = p_user_id
            AND created_at >= NOW() - INTERVAL '7 days'
        ),
        'total_exports', (
            SELECT COUNT(*) FROM exports
            WHERE user_id = p_user_id
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_metrics JSONB;
    v_this_month TIMESTAMPTZ;
    v_last_month TIMESTAMPTZ;
BEGIN
    v_this_month := date_trunc('month', NOW());
    v_last_month := date_trunc('month', NOW() - INTERVAL '1 month');

    SELECT jsonb_build_object(
        'revenue', jsonb_build_object(
            'total', COALESCE((
                SELECT SUM(total) FROM invoices
                WHERE user_id = p_user_id AND status = 'paid'
            ), 0),
            'this_month', COALESCE((
                SELECT SUM(total) FROM invoices
                WHERE user_id = p_user_id AND status = 'paid'
                AND paid_at >= v_this_month
            ), 0),
            'last_month', COALESCE((
                SELECT SUM(total) FROM invoices
                WHERE user_id = p_user_id AND status = 'paid'
                AND paid_at >= v_last_month AND paid_at < v_this_month
            ), 0)
        ),
        'clients', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM clients WHERE user_id = p_user_id),
            'active', (SELECT COUNT(*) FROM clients WHERE user_id = p_user_id AND status = 'active'),
            'new_this_month', (SELECT COUNT(*) FROM clients WHERE user_id = p_user_id AND created_at >= v_this_month)
        ),
        'projects', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id),
            'active', (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND status IN ('active', 'in_progress')),
            'completed', (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND status = 'completed')
        ),
        'invoices', jsonb_build_object(
            'outstanding', COALESCE((
                SELECT SUM(total) FROM invoices
                WHERE user_id = p_user_id AND status IN ('sent', 'pending')
            ), 0),
            'overdue_count', (
                SELECT COUNT(*) FROM invoices
                WHERE user_id = p_user_id AND status != 'paid'
                AND due_date < NOW()
            )
        ),
        'time_tracked', jsonb_build_object(
            'total_hours', COALESCE((
                SELECT SUM(duration_minutes) / 60.0 FROM time_entries
                WHERE user_id = p_user_id
            ), 0),
            'this_month_hours', COALESCE((
                SELECT SUM(duration_minutes) / 60.0 FROM time_entries
                WHERE user_id = p_user_id AND start_time >= v_this_month
            ), 0),
            'billable_hours', COALESCE((
                SELECT SUM(duration_minutes) / 60.0 FROM time_entries
                WHERE user_id = p_user_id AND is_billable = true
            ), 0)
        ),
        'expenses', jsonb_build_object(
            'total', COALESCE((SELECT SUM(amount) FROM expenses WHERE user_id = p_user_id), 0),
            'this_month', COALESCE((
                SELECT SUM(amount) FROM expenses
                WHERE user_id = p_user_id AND date >= v_this_month::DATE
            ), 0)
        )
    ) INTO v_metrics;

    RETURN v_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending scheduled reports
CREATE OR REPLACE FUNCTION get_pending_scheduled_reports()
RETURNS TABLE(
    schedule_id UUID,
    report_id UUID,
    user_id UUID,
    report_name VARCHAR(255),
    export_format VARCHAR(10),
    email_recipients TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.id,
        sr.report_id,
        sr.user_id,
        r.name,
        sr.export_format,
        sr.email_recipients
    FROM scheduled_reports sr
    JOIN reports r ON r.id = sr.report_id
    WHERE sr.is_active = true
    AND (sr.next_run_at IS NULL OR sr.next_run_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
