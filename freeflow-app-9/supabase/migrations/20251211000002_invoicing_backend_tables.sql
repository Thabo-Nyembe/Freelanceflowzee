-- =====================================================
-- KAZI Invoicing Backend Infrastructure Migration
-- Version: 2.0.0
-- Date: 2025-12-11
-- Description: Complete invoicing system with recurring invoices,
--              payment reminders, late fees, and analytics
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRE-MIGRATION: Add missing columns to existing tables
-- =====================================================

-- Add user_id to recurring_invoices if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recurring_invoices')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'recurring_invoices' AND column_name = 'user_id') THEN
    ALTER TABLE recurring_invoices ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to payment_reminders if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_reminders')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payment_reminders' AND column_name = 'user_id') THEN
    ALTER TABLE payment_reminders ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to late_fees if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'late_fees')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'late_fees' AND column_name = 'user_id') THEN
    ALTER TABLE late_fees ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to late_fee_configs if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'late_fee_configs')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'late_fee_configs' AND column_name = 'user_id') THEN
    ALTER TABLE late_fee_configs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to reminder_configs if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reminder_configs')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reminder_configs' AND column_name = 'user_id') THEN
    ALTER TABLE reminder_configs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to payment_analytics_snapshots if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_analytics_snapshots')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payment_analytics_snapshots' AND column_name = 'user_id') THEN
    ALTER TABLE payment_analytics_snapshots ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to invoice_aging_buckets if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_aging_buckets')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoice_aging_buckets' AND column_name = 'user_id') THEN
    ALTER TABLE invoice_aging_buckets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to invoice_activity_log if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_activity_log')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoice_activity_log' AND column_name = 'user_id') THEN
    ALTER TABLE invoice_activity_log ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to invoicing_scheduled_jobs if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoicing_scheduled_jobs')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoicing_scheduled_jobs' AND column_name = 'user_id') THEN
    ALTER TABLE invoicing_scheduled_jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- RECURRING INVOICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS recurring_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Client Information
    client_id UUID NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    client_address TEXT,

    -- Invoice Template
    items JSONB NOT NULL DEFAULT '[]',
    -- items: [{ description, quantity, rate, amount, taxable }]

    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Billing Configuration
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('one-time', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annually', 'annually')),
    billing_day INTEGER CHECK (billing_day >= 1 AND billing_day <= 31),
    anchor_date DATE,

    -- Schedule
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE,
    last_invoice_date DATE,

    -- Limits
    max_occurrences INTEGER,
    occurrences_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed', 'expired')),
    is_active BOOLEAN DEFAULT true,
    pause_reason TEXT,
    paused_at TIMESTAMPTZ,

    -- Invoice Generation Settings
    auto_send BOOLEAN DEFAULT true,
    days_before_send INTEGER DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    notes TEXT,

    -- Generated Invoices Tracking
    generated_invoice_ids UUID[] DEFAULT ARRAY[]::UUID[],

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for recurring_invoices (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON recurring_invoices(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_recurring_invoices_client_id ON recurring_invoices(client_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_recurring_invoices_status ON recurring_invoices(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date) WHERE is_active = true; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_recurring_invoices_billing_cycle ON recurring_invoices(billing_cycle); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for recurring_invoices
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can view own recurring invoices"
    ON recurring_invoices FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can create own recurring invoices"
    ON recurring_invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can update own recurring invoices"
    ON recurring_invoices FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can delete own recurring invoices"
    ON recurring_invoices FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENT REMINDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Reminder Details
    type VARCHAR(30) NOT NULL CHECK (type IN ('before_due', 'on_due', 'after_due', 'final_notice', 'custom')),
    urgency VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),

    -- Scheduling
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,

    -- Content
    subject VARCHAR(255),
    message TEXT,
    template_id VARCHAR(50),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled', 'snoozed')),

    -- Delivery Channel
    channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'in_app', 'push')),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),

    -- Tracking
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    response_received_at TIMESTAMPTZ,

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_reminders (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_payment_reminders_user_id ON payment_reminders(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON payment_reminders(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled ON payment_reminders(scheduled_for) WHERE status = 'pending'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_payment_reminders_type ON payment_reminders(type); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for payment_reminders
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment reminders" ON payment_reminders;
CREATE POLICY "Users can view own payment reminders"
    ON payment_reminders FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own payment reminders" ON payment_reminders;
CREATE POLICY "Users can create own payment reminders"
    ON payment_reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payment reminders" ON payment_reminders;
CREATE POLICY "Users can update own payment reminders"
    ON payment_reminders FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own payment reminders" ON payment_reminders;
CREATE POLICY "Users can delete own payment reminders"
    ON payment_reminders FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- LATE FEES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS late_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Fee Details
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('percentage', 'fixed', 'compound')),
    rate DECIMAL(8,4) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Calculation Details
    days_overdue INTEGER NOT NULL,
    original_amount DECIMAL(15,2) NOT NULL,
    cumulative_amount DECIMAL(15,2) NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (status IN ('calculated', 'applied', 'waived', 'paid', 'reversed')),

    -- Waiver Information
    waived_at TIMESTAMPTZ,
    waived_by UUID REFERENCES auth.users(id),
    waiver_reason TEXT,

    -- Payment Information
    paid_at TIMESTAMPTZ,
    payment_id UUID,

    -- Metadata
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for late_fees (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_late_fees_invoice_id ON late_fees(invoice_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_late_fees_user_id ON late_fees(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_late_fees_status ON late_fees(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_late_fees_applied_at ON late_fees(applied_at); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for late_fees
ALTER TABLE late_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own late fees" ON late_fees;
CREATE POLICY "Users can view own late fees"
    ON late_fees FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own late fees" ON late_fees;
CREATE POLICY "Users can create own late fees"
    ON late_fees FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own late fees" ON late_fees;
CREATE POLICY "Users can update own late fees"
    ON late_fees FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own late fees" ON late_fees;
CREATE POLICY "Users can delete own late fees"
    ON late_fees FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- LATE FEE CONFIGURATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS late_fee_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Configuration
    enabled BOOLEAN DEFAULT true,
    fee_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed', 'compound')),
    rate DECIMAL(8,4) NOT NULL DEFAULT 1.5,

    -- Limits
    grace_period_days INTEGER DEFAULT 7,
    max_fee_percentage DECIMAL(5,2) DEFAULT 25,
    minimum_fee DECIMAL(15,2) DEFAULT 5,
    maximum_fee DECIMAL(15,2) DEFAULT 500,

    -- Options
    apply_to_tax BOOLEAN DEFAULT false,
    compound_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (compound_frequency IN ('daily', 'weekly', 'monthly')),
    notify_before_apply BOOLEAN DEFAULT true,
    notification_days INTEGER DEFAULT 3,

    -- Auto-apply settings
    auto_apply BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for late_fee_configs
ALTER TABLE late_fee_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own late fee config" ON late_fee_configs;
CREATE POLICY "Users can view own late fee config"
    ON late_fee_configs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own late fee config" ON late_fee_configs;
CREATE POLICY "Users can create own late fee config"
    ON late_fee_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own late fee config" ON late_fee_configs;
CREATE POLICY "Users can update own late fee config"
    ON late_fee_configs FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- REMINDER CONFIGURATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS reminder_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Configuration
    enabled BOOLEAN DEFAULT true,

    -- Before Due Reminders (days before)
    before_due_days INTEGER[] DEFAULT ARRAY[7, 3, 1],

    -- On Due Day
    send_on_due_day BOOLEAN DEFAULT true,

    -- After Due Reminders (days after)
    after_due_days INTEGER[] DEFAULT ARRAY[1, 3, 7, 14],

    -- Final Notice
    final_notice_days INTEGER DEFAULT 30,
    send_final_notice BOOLEAN DEFAULT true,

    -- Channel Preferences
    default_channel VARCHAR(20) DEFAULT 'email' CHECK (default_channel IN ('email', 'sms', 'in_app', 'push')),
    enable_sms BOOLEAN DEFAULT false,
    enable_push BOOLEAN DEFAULT true,

    -- Message Customization
    custom_templates JSONB DEFAULT '{}',
    -- { before_due: { subject, message }, on_due: {...}, ... }

    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',

    -- Weekend Settings
    skip_weekends BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for reminder_configs
ALTER TABLE reminder_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reminder config" ON reminder_configs;
CREATE POLICY "Users can view own reminder config"
    ON reminder_configs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own reminder config" ON reminder_configs;
CREATE POLICY "Users can create own reminder config"
    ON reminder_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminder config" ON reminder_configs;
CREATE POLICY "Users can update own reminder config"
    ON reminder_configs FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENT ANALYTICS SNAPSHOTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Period
    period_type VARCHAR(10) NOT NULL CHECK (period_type IN ('day', 'week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Revenue Metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    paid_revenue DECIMAL(15,2) DEFAULT 0,
    outstanding_revenue DECIMAL(15,2) DEFAULT 0,
    overdue_revenue DECIMAL(15,2) DEFAULT 0,

    -- Invoice Counts
    total_invoices INTEGER DEFAULT 0,
    paid_invoices INTEGER DEFAULT 0,
    pending_invoices INTEGER DEFAULT 0,
    overdue_invoices INTEGER DEFAULT 0,
    cancelled_invoices INTEGER DEFAULT 0,

    -- Payment Metrics
    avg_payment_time_days DECIMAL(10,2),
    collection_rate DECIMAL(5,2),

    -- Late Fee Metrics
    late_fees_applied DECIMAL(15,2) DEFAULT 0,
    late_fees_collected DECIMAL(15,2) DEFAULT 0,
    late_fees_waived DECIMAL(15,2) DEFAULT 0,

    -- Client Metrics
    total_clients INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    repeat_clients INTEGER DEFAULT 0,

    -- Currency
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Raw Data (for detailed analysis)
    raw_data JSONB DEFAULT '{}',

    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics snapshots (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_id ON payment_analytics_snapshots(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_period ON payment_analytics_snapshots(period_type, period_start); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON payment_analytics_snapshots(period_start, period_end); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_snapshots_unique ON payment_analytics_snapshots(user_id, period_type, period_start, currency); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for analytics snapshots
ALTER TABLE payment_analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics snapshots" ON payment_analytics_snapshots;
CREATE POLICY "Users can view own analytics snapshots"
    ON payment_analytics_snapshots FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own analytics snapshots" ON payment_analytics_snapshots;
CREATE POLICY "Users can create own analytics snapshots"
    ON payment_analytics_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INVOICE AGING BUCKETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_aging_buckets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Snapshot Date
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Aging Buckets (amounts)
    current_amount DECIMAL(15,2) DEFAULT 0,      -- Not yet due
    days_1_30_amount DECIMAL(15,2) DEFAULT 0,    -- 1-30 days overdue
    days_31_60_amount DECIMAL(15,2) DEFAULT 0,   -- 31-60 days overdue
    days_61_90_amount DECIMAL(15,2) DEFAULT 0,   -- 61-90 days overdue
    days_over_90_amount DECIMAL(15,2) DEFAULT 0, -- Over 90 days overdue

    -- Aging Buckets (counts)
    current_count INTEGER DEFAULT 0,
    days_1_30_count INTEGER DEFAULT 0,
    days_31_60_count INTEGER DEFAULT 0,
    days_61_90_count INTEGER DEFAULT 0,
    days_over_90_count INTEGER DEFAULT 0,

    -- Totals
    total_outstanding DECIMAL(15,2) DEFAULT 0,
    total_overdue DECIMAL(15,2) DEFAULT 0,

    -- Currency
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Invoice IDs by bucket (for drill-down)
    current_invoice_ids UUID[] DEFAULT ARRAY[]::UUID[],
    days_1_30_invoice_ids UUID[] DEFAULT ARRAY[]::UUID[],
    days_31_60_invoice_ids UUID[] DEFAULT ARRAY[]::UUID[],
    days_61_90_invoice_ids UUID[] DEFAULT ARRAY[]::UUID[],
    days_over_90_invoice_ids UUID[] DEFAULT ARRAY[]::UUID[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for aging buckets (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_aging_buckets_user_id ON invoice_aging_buckets(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_aging_buckets_date ON invoice_aging_buckets(snapshot_date); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE UNIQUE INDEX IF NOT EXISTS idx_aging_buckets_unique ON invoice_aging_buckets(user_id, snapshot_date, currency); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for aging buckets
ALTER TABLE invoice_aging_buckets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own aging buckets" ON invoice_aging_buckets;
CREATE POLICY "Users can view own aging buckets"
    ON invoice_aging_buckets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own aging buckets" ON invoice_aging_buckets;
CREATE POLICY "Users can create own aging buckets"
    ON invoice_aging_buckets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INVOICE ACTIVITY LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Activity Details
    action VARCHAR(50) NOT NULL,
    -- Actions: created, sent, viewed, paid, partially_paid, overdue,
    --          reminder_sent, late_fee_applied, late_fee_waived,
    --          updated, cancelled, refunded, disputed

    actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'client', 'system', 'automation')),
    actor_id UUID,
    actor_name VARCHAR(255),

    -- Before/After State (for auditing)
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_amount DECIMAL(15,2),
    new_amount DECIMAL(15,2),

    -- Additional Data
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- IP/Device Info (for security)
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity log (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_invoice_activity_invoice_id ON invoice_activity_log(invoice_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_invoice_activity_user_id ON invoice_activity_log(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_invoice_activity_action ON invoice_activity_log(action); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_invoice_activity_created ON invoice_activity_log(created_at); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for activity log
ALTER TABLE invoice_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity log" ON invoice_activity_log;
CREATE POLICY "Users can view own activity log"
    ON invoice_activity_log FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own activity log" ON invoice_activity_log;
CREATE POLICY "Users can create own activity log"
    ON invoice_activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SCHEDULED JOBS TABLE (for cron-like functionality)
-- =====================================================

CREATE TABLE IF NOT EXISTS invoicing_scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Job Details
    job_type VARCHAR(50) NOT NULL,
    -- Types: generate_recurring, send_reminder, apply_late_fee,
    --        generate_analytics, cleanup_old_data

    target_id UUID,  -- invoice_id, recurring_id, etc.
    target_type VARCHAR(50),

    -- Scheduling
    scheduled_for TIMESTAMPTZ NOT NULL,
    priority INTEGER DEFAULT 5,  -- 1-10, higher = more important

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

    -- Execution Details
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,

    -- Result
    result JSONB DEFAULT '{}',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scheduled jobs (wrapped in DO blocks for idempotency)
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_user_id ON invoicing_scheduled_jobs(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON invoicing_scheduled_jobs(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_scheduled ON invoicing_scheduled_jobs(scheduled_for) WHERE status = 'pending'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_type ON invoicing_scheduled_jobs(job_type); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_priority ON invoicing_scheduled_jobs(priority DESC, scheduled_for ASC) WHERE status = 'pending'; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- RLS for scheduled jobs
ALTER TABLE invoicing_scheduled_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own scheduled jobs" ON invoicing_scheduled_jobs;
CREATE POLICY "Users can view own scheduled jobs"
    ON invoicing_scheduled_jobs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own scheduled jobs" ON invoicing_scheduled_jobs;
CREATE POLICY "Users can create own scheduled jobs"
    ON invoicing_scheduled_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scheduled jobs" ON invoicing_scheduled_jobs;
CREATE POLICY "Users can update own scheduled jobs"
    ON invoicing_scheduled_jobs FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scheduled jobs" ON invoicing_scheduled_jobs;
CREATE POLICY "Users can delete own scheduled jobs"
    ON invoicing_scheduled_jobs FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoicing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_recurring_invoices_timestamp ON recurring_invoices;
CREATE TRIGGER update_recurring_invoices_timestamp
    BEFORE UPDATE ON recurring_invoices
    FOR EACH ROW EXECUTE FUNCTION update_invoicing_updated_at();

DROP TRIGGER IF EXISTS update_payment_reminders_timestamp ON payment_reminders;
CREATE TRIGGER update_payment_reminders_timestamp
    BEFORE UPDATE ON payment_reminders
    FOR EACH ROW EXECUTE FUNCTION update_invoicing_updated_at();

DROP TRIGGER IF EXISTS update_late_fees_timestamp ON late_fees;
CREATE TRIGGER update_late_fees_timestamp
    BEFORE UPDATE ON late_fees
    FOR EACH ROW EXECUTE FUNCTION update_invoicing_updated_at();

DROP TRIGGER IF EXISTS update_late_fee_configs_timestamp ON late_fee_configs;
CREATE TRIGGER update_late_fee_configs_timestamp
    BEFORE UPDATE ON late_fee_configs
    FOR EACH ROW EXECUTE FUNCTION update_invoicing_updated_at();

DROP TRIGGER IF EXISTS update_reminder_configs_timestamp ON reminder_configs;
CREATE TRIGGER update_reminder_configs_timestamp
    BEFORE UPDATE ON reminder_configs
    FOR EACH ROW EXECUTE FUNCTION update_invoicing_updated_at();

DROP TRIGGER IF EXISTS update_scheduled_jobs_timestamp ON invoicing_scheduled_jobs;
CREATE TRIGGER update_scheduled_jobs_timestamp
    BEFORE UPDATE ON invoicing_scheduled_jobs
    FOR EACH ROW EXECUTE FUNCTION update_invoicing_updated_at();

-- =====================================================
-- SEED DEFAULT CONFIGURATIONS (for new users)
-- =====================================================

-- Function to create default configs for new users
CREATE OR REPLACE FUNCTION create_default_invoicing_configs()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default late fee config
    INSERT INTO late_fee_configs (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Create default reminder config
    INSERT INTO reminder_configs (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Trigger on auth.users should be created by Supabase admin
-- This is just for reference:
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION create_default_invoicing_configs();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View for invoice health summary
-- Only create if the invoices table exists with required columns
DO $$
BEGIN
  -- Check for invoices table with user_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'user_id'
  ) THEN
    -- Use amount column (which exists) instead of total
    EXECUTE '
      CREATE OR REPLACE VIEW invoice_health_summary AS
      SELECT
          user_id,
          COUNT(*) FILTER (WHERE status = ''paid'') as paid_count,
          COUNT(*) FILTER (WHERE status = ''pending'' OR status = ''draft'') as pending_count,
          COUNT(*) FILTER (WHERE status = ''overdue'') as overdue_count,
          COALESCE(SUM(amount) FILTER (WHERE status = ''paid''), 0) as paid_amount,
          COALESCE(SUM(amount) FILTER (WHERE status = ''pending'' OR status = ''draft''), 0) as pending_amount,
          COALESCE(SUM(amount) FILTER (WHERE status = ''overdue''), 0) as overdue_amount
      FROM invoices
      GROUP BY user_id
    ';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Silently ignore if view creation fails
  NULL;
END $$;

-- Note: The invoices table should already exist in your schema
-- If not, the view creation will be skipped

-- =====================================================
-- GRANT STATEMENTS
-- =====================================================

-- Grant access to authenticated users (wrapped in DO blocks for safety)
DO $$ BEGIN GRANT SELECT, INSERT, UPDATE, DELETE ON recurring_invoices TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT, UPDATE, DELETE ON payment_reminders TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT, UPDATE, DELETE ON late_fees TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT, UPDATE ON late_fee_configs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT, UPDATE ON reminder_configs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT ON payment_analytics_snapshots TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT ON invoice_aging_buckets TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT ON invoice_activity_log TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT SELECT, INSERT, UPDATE, DELETE ON invoicing_scheduled_jobs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Grant sequence usage
DO $$ BEGIN GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

DO $$ BEGIN COMMENT ON TABLE recurring_invoices IS 'Stores recurring invoice templates and schedules'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE payment_reminders IS 'Tracks payment reminder schedules and delivery status'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE late_fees IS 'Records late fees applied to invoices'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE late_fee_configs IS 'User-specific late fee configuration'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE reminder_configs IS 'User-specific payment reminder configuration'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE payment_analytics_snapshots IS 'Periodic snapshots of payment analytics for reporting'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE invoice_aging_buckets IS 'Daily aging report data for accounts receivable'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE invoice_activity_log IS 'Audit log for all invoice-related activities'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN COMMENT ON TABLE invoicing_scheduled_jobs IS 'Queue for scheduled invoicing tasks'; EXCEPTION WHEN OTHERS THEN NULL; END $$;
