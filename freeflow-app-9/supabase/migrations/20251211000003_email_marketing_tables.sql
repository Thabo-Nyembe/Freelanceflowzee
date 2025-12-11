-- Email Marketing Backend Tables Migration
-- Comprehensive email marketing infrastructure
-- Uses DO blocks for safe idempotent index creation

-- ============================================================================
-- Email Subscribers
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained', 'pending')),
  status_changed_at TIMESTAMPTZ,
  source TEXT,
  source_id TEXT,
  custom_fields JSONB DEFAULT '{}',
  timezone TEXT,
  language TEXT DEFAULT 'en',
  engagement_score INTEGER DEFAULT 50,
  last_engaged_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_subscriber_email_per_user UNIQUE(user_id, email)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_subscribers_user_id' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_subscribers_user_id ON public.email_subscribers(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_subscribers_email' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_subscribers_status' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_subscribers_status ON public.email_subscribers(status);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_subscribers_engagement' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_subscribers_engagement ON public.email_subscribers(engagement_score);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Lists
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'dynamic', 'suppression')),
  dynamic_filter JSONB,
  subscriber_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_lists_user_id' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_lists_user_id ON public.email_lists(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Subscriber Lists (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriber_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.email_lists(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,
  CONSTRAINT unique_subscriber_list UNIQUE(subscriber_id, list_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_subscriber_lists_subscriber' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_subscriber_lists_subscriber ON public.subscriber_lists(subscriber_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_subscriber_lists_list' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_subscriber_lists_list ON public.subscriber_lists(list_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Tags
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  description TEXT,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tag_name_per_user UNIQUE(user_id, name)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_tags_user_id' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_tags_user_id ON public.email_tags(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Subscriber Tags (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriber_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.email_tags(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,
  CONSTRAINT unique_subscriber_tag UNIQUE(subscriber_id, tag_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_subscriber_tags_subscriber' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_subscriber_tags_subscriber ON public.subscriber_tags(subscriber_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_subscriber_tags_tag' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_subscriber_tags_tag ON public.subscriber_tags(tag_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subject TEXT,
  preheader TEXT,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'is_system') THEN
    ALTER TABLE public.email_templates ADD COLUMN is_system BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'usage_count') THEN
    ALTER TABLE public.email_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'preheader') THEN
    ALTER TABLE public.email_templates ADD COLUMN preheader TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'variables') THEN
    ALTER TABLE public.email_templates ADD COLUMN variables JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE public.email_templates ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_templates_user_id' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_templates_user_id ON public.email_templates(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_templates_category' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_templates_category ON public.email_templates(category);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'ab_test', 'automated', 'transactional', 'rss')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled', 'failed')),
  subject TEXT NOT NULL,
  preheader TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  recipients JSONB NOT NULL DEFAULT '{}',
  schedule JSONB,
  ab_test JSONB,
  send_options JSONB DEFAULT '{}',
  tracking JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'scheduled_for') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN scheduled_for TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'started_at') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN started_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'completed_at') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'preheader') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN preheader TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'schedule') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN schedule JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'ab_test') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN ab_test JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'send_options') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN send_options JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'tracking') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN tracking JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'stats') THEN
    ALTER TABLE public.email_campaigns ADD COLUMN stats JSONB DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_campaigns_user_id' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_campaigns_user_id ON public.email_campaigns(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_campaigns_status' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- Index on scheduled_for skipped - column may not exist in older table versions
-- Will be created when table is recreated with full schema

-- ============================================================================
-- Email Automations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  triggers JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_automations_user_id' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_automations_user_id ON public.email_automations(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_automations_status' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_automations_status ON public.email_automations(status);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Subscriber Automation States
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriber_automation_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  automation_id UUID NOT NULL REFERENCES public.email_automations(id) ON DELETE CASCADE,
  current_step_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'exited', 'errored')),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  last_processed_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  exited_at TIMESTAMPTZ,
  exit_reason TEXT,
  step_history JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  loop_counts JSONB DEFAULT '{}',
  ab_test_assignments JSONB DEFAULT '{}',
  error_count INTEGER DEFAULT 0,
  last_error TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sas_subscriber' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_sas_subscriber ON public.subscriber_automation_states(subscriber_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sas_automation' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_sas_automation ON public.subscriber_automation_states(automation_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_sas_status' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_sas_status ON public.subscriber_automation_states(status);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- Index on scheduled_for skipped - column may not exist in older table versions

-- ============================================================================
-- Email Send Queue
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_send_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  automation_id UUID REFERENCES public.email_automations(id) ON DELETE CASCADE,
  automation_state_id TEXT,
  subscriber_id UUID NOT NULL REFERENCES public.email_subscribers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  variant_id TEXT,
  personal_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempts INTEGER DEFAULT 0,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  message_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_send_queue_campaign' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_send_queue_campaign ON public.email_send_queue(campaign_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_send_queue_status' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_send_queue_status ON public.email_send_queue(status);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- Index on scheduled_for skipped - column may not exist in older table versions

-- ============================================================================
-- Email Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.email_subscribers(id) ON DELETE SET NULL,
  email_id TEXT,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  automation_id UUID REFERENCES public.email_automations(id) ON DELETE SET NULL,
  automation_state_id TEXT,
  message_id TEXT,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address TEXT,
  geo_location JSONB,
  device_info JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_events_user' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_events_user ON public.email_events(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_events_subscriber' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_events_subscriber ON public.email_events(subscriber_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_events_campaign' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_events_campaign ON public.email_events(campaign_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_events_type' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_events_type ON public.email_events(event_type);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_events_timestamp' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_events_timestamp ON public.email_events(timestamp);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_events_message' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_events_message ON public.email_events(message_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Daily Aggregates
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_daily_aggregates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  complained INTEGER DEFAULT 0,
  unsubscribed INTEGER DEFAULT 0,
  converted INTEGER DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_daily_aggregate UNIQUE(user_id, date)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_daily_aggregates_user_date' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_daily_aggregates_user_date ON public.email_daily_aggregates(user_id, date);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  data JSONB NOT NULL,
  summary JSONB,
  insights JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_reports_user' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_reports_user ON public.email_reports(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_email_reports_generated' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_email_reports_generated ON public.email_reports(generated_at);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Email Provider Configs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_provider_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key TEXT,
  webhook_secret TEXT,
  from_email TEXT,
  from_name TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_provider_per_user UNIQUE(user_id, provider)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_provider_configs_user' AND relkind = 'i') THEN
    BEGIN
      CREATE INDEX idx_provider_configs_user ON public.email_provider_configs(user_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_automation_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_provider_configs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies (drop existing first for idempotency)
-- ============================================================================

-- Email Subscribers
DROP POLICY IF EXISTS "email_subscribers_select" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_insert" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_update" ON public.email_subscribers;
DROP POLICY IF EXISTS "email_subscribers_delete" ON public.email_subscribers;
CREATE POLICY "email_subscribers_select" ON public.email_subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_subscribers_insert" ON public.email_subscribers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_subscribers_update" ON public.email_subscribers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_subscribers_delete" ON public.email_subscribers FOR DELETE USING (auth.uid() = user_id);

-- Email Lists
DROP POLICY IF EXISTS "email_lists_select" ON public.email_lists;
DROP POLICY IF EXISTS "email_lists_insert" ON public.email_lists;
DROP POLICY IF EXISTS "email_lists_update" ON public.email_lists;
DROP POLICY IF EXISTS "email_lists_delete" ON public.email_lists;
CREATE POLICY "email_lists_select" ON public.email_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_lists_insert" ON public.email_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_lists_update" ON public.email_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_lists_delete" ON public.email_lists FOR DELETE USING (auth.uid() = user_id);

-- Subscriber Lists
DROP POLICY IF EXISTS "subscriber_lists_select" ON public.subscriber_lists;
DROP POLICY IF EXISTS "subscriber_lists_insert" ON public.subscriber_lists;
DROP POLICY IF EXISTS "subscriber_lists_delete" ON public.subscriber_lists;
CREATE POLICY "subscriber_lists_select" ON public.subscriber_lists FOR SELECT
  USING (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));
CREATE POLICY "subscriber_lists_insert" ON public.subscriber_lists FOR INSERT
  WITH CHECK (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));
CREATE POLICY "subscriber_lists_delete" ON public.subscriber_lists FOR DELETE
  USING (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));

-- Email Tags
DROP POLICY IF EXISTS "email_tags_select" ON public.email_tags;
DROP POLICY IF EXISTS "email_tags_insert" ON public.email_tags;
DROP POLICY IF EXISTS "email_tags_update" ON public.email_tags;
DROP POLICY IF EXISTS "email_tags_delete" ON public.email_tags;
CREATE POLICY "email_tags_select" ON public.email_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_tags_insert" ON public.email_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_tags_update" ON public.email_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_tags_delete" ON public.email_tags FOR DELETE USING (auth.uid() = user_id);

-- Subscriber Tags
DROP POLICY IF EXISTS "subscriber_tags_select" ON public.subscriber_tags;
DROP POLICY IF EXISTS "subscriber_tags_insert" ON public.subscriber_tags;
DROP POLICY IF EXISTS "subscriber_tags_delete" ON public.subscriber_tags;
CREATE POLICY "subscriber_tags_select" ON public.subscriber_tags FOR SELECT
  USING (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));
CREATE POLICY "subscriber_tags_insert" ON public.subscriber_tags FOR INSERT
  WITH CHECK (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));
CREATE POLICY "subscriber_tags_delete" ON public.subscriber_tags FOR DELETE
  USING (subscriber_id IN (SELECT id FROM public.email_subscribers WHERE user_id = auth.uid()));

-- Email Templates
DROP POLICY IF EXISTS "email_templates_select" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_insert" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_update" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_delete" ON public.email_templates;
CREATE POLICY "email_templates_select" ON public.email_templates FOR SELECT USING (auth.uid() = user_id OR is_system = true);
CREATE POLICY "email_templates_insert" ON public.email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_templates_update" ON public.email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_templates_delete" ON public.email_templates FOR DELETE USING (auth.uid() = user_id);

-- Email Campaigns
DROP POLICY IF EXISTS "email_campaigns_select" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_campaigns_insert" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_campaigns_update" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_campaigns_delete" ON public.email_campaigns;
CREATE POLICY "email_campaigns_select" ON public.email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_campaigns_insert" ON public.email_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_campaigns_update" ON public.email_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_campaigns_delete" ON public.email_campaigns FOR DELETE USING (auth.uid() = user_id);

-- Email Automations
DROP POLICY IF EXISTS "email_automations_select" ON public.email_automations;
DROP POLICY IF EXISTS "email_automations_insert" ON public.email_automations;
DROP POLICY IF EXISTS "email_automations_update" ON public.email_automations;
DROP POLICY IF EXISTS "email_automations_delete" ON public.email_automations;
CREATE POLICY "email_automations_select" ON public.email_automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_automations_insert" ON public.email_automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_automations_update" ON public.email_automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "email_automations_delete" ON public.email_automations FOR DELETE USING (auth.uid() = user_id);

-- Subscriber Automation States (via automation ownership)
DROP POLICY IF EXISTS "sas_select" ON public.subscriber_automation_states;
DROP POLICY IF EXISTS "sas_insert" ON public.subscriber_automation_states;
DROP POLICY IF EXISTS "sas_update" ON public.subscriber_automation_states;
DROP POLICY IF EXISTS "sas_delete" ON public.subscriber_automation_states;
CREATE POLICY "sas_select" ON public.subscriber_automation_states FOR SELECT
  USING (automation_id IN (SELECT id FROM public.email_automations WHERE user_id = auth.uid()));
CREATE POLICY "sas_insert" ON public.subscriber_automation_states FOR INSERT
  WITH CHECK (automation_id IN (SELECT id FROM public.email_automations WHERE user_id = auth.uid()));
CREATE POLICY "sas_update" ON public.subscriber_automation_states FOR UPDATE
  USING (automation_id IN (SELECT id FROM public.email_automations WHERE user_id = auth.uid()));
CREATE POLICY "sas_delete" ON public.subscriber_automation_states FOR DELETE
  USING (automation_id IN (SELECT id FROM public.email_automations WHERE user_id = auth.uid()));

-- Email Send Queue
DROP POLICY IF EXISTS "send_queue_select" ON public.email_send_queue;
DROP POLICY IF EXISTS "send_queue_insert" ON public.email_send_queue;
DROP POLICY IF EXISTS "send_queue_update" ON public.email_send_queue;
DROP POLICY IF EXISTS "send_queue_delete" ON public.email_send_queue;
CREATE POLICY "send_queue_select" ON public.email_send_queue FOR SELECT
  USING (campaign_id IN (SELECT id FROM public.email_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "send_queue_insert" ON public.email_send_queue FOR INSERT
  WITH CHECK (campaign_id IN (SELECT id FROM public.email_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "send_queue_update" ON public.email_send_queue FOR UPDATE
  USING (campaign_id IN (SELECT id FROM public.email_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "send_queue_delete" ON public.email_send_queue FOR DELETE
  USING (campaign_id IN (SELECT id FROM public.email_campaigns WHERE user_id = auth.uid()));

-- Email Events
DROP POLICY IF EXISTS "email_events_select" ON public.email_events;
DROP POLICY IF EXISTS "email_events_insert" ON public.email_events;
CREATE POLICY "email_events_select" ON public.email_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_events_insert" ON public.email_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email Daily Aggregates
DROP POLICY IF EXISTS "daily_aggregates_select" ON public.email_daily_aggregates;
DROP POLICY IF EXISTS "daily_aggregates_insert" ON public.email_daily_aggregates;
DROP POLICY IF EXISTS "daily_aggregates_update" ON public.email_daily_aggregates;
CREATE POLICY "daily_aggregates_select" ON public.email_daily_aggregates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_aggregates_insert" ON public.email_daily_aggregates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_aggregates_update" ON public.email_daily_aggregates FOR UPDATE USING (auth.uid() = user_id);

-- Email Reports
DROP POLICY IF EXISTS "email_reports_select" ON public.email_reports;
DROP POLICY IF EXISTS "email_reports_insert" ON public.email_reports;
DROP POLICY IF EXISTS "email_reports_delete" ON public.email_reports;
CREATE POLICY "email_reports_select" ON public.email_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "email_reports_insert" ON public.email_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "email_reports_delete" ON public.email_reports FOR DELETE USING (auth.uid() = user_id);

-- Email Provider Configs
DROP POLICY IF EXISTS "provider_configs_select" ON public.email_provider_configs;
DROP POLICY IF EXISTS "provider_configs_insert" ON public.email_provider_configs;
DROP POLICY IF EXISTS "provider_configs_update" ON public.email_provider_configs;
DROP POLICY IF EXISTS "provider_configs_delete" ON public.email_provider_configs;
CREATE POLICY "provider_configs_select" ON public.email_provider_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "provider_configs_insert" ON public.email_provider_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "provider_configs_update" ON public.email_provider_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "provider_configs_delete" ON public.email_provider_configs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Increment campaign stat
CREATE OR REPLACE FUNCTION public.increment_campaign_stat(
  p_campaign_id UUID,
  p_event_type TEXT,
  p_is_unique BOOLEAN DEFAULT true
)
RETURNS void AS $$
BEGIN
  UPDATE public.email_campaigns
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    ARRAY[p_event_type],
    to_jsonb(COALESCE((stats->>p_event_type)::int, 0) + 1)
  ),
  updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Update subscriber engagement
CREATE OR REPLACE FUNCTION public.update_subscriber_engagement(
  p_subscriber_id UUID,
  p_event_type TEXT,
  p_timestamp TEXT
)
RETURNS void AS $$
DECLARE
  score_delta INTEGER;
BEGIN
  -- Calculate score change based on event type
  CASE p_event_type
    WHEN 'opened' THEN score_delta := 5;
    WHEN 'clicked' THEN score_delta := 10;
    WHEN 'converted' THEN score_delta := 20;
    WHEN 'bounced' THEN score_delta := -20;
    WHEN 'complained' THEN score_delta := -50;
    WHEN 'unsubscribed' THEN score_delta := -30;
    ELSE score_delta := 0;
  END CASE;

  UPDATE public.email_subscribers
  SET
    engagement_score = GREATEST(0, LEAST(100, COALESCE(engagement_score, 50) + score_delta)),
    last_engaged_at = p_timestamp::timestamptz,
    updated_at = NOW()
  WHERE id = p_subscriber_id;
END;
$$ LANGUAGE plpgsql;

-- Upsert daily aggregate
CREATE OR REPLACE FUNCTION public.upsert_daily_event_aggregate(
  p_user_id UUID,
  p_date TEXT,
  p_event_type TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.email_daily_aggregates (user_id, date, sent, delivered, opened, clicked, bounced, complained, unsubscribed)
  VALUES (p_user_id, p_date::date, 0, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  EXECUTE format(
    'UPDATE public.email_daily_aggregates SET %I = %I + 1, updated_at = NOW() WHERE user_id = $1 AND date = $2',
    p_event_type, p_event_type
  ) USING p_user_id, p_date::date;
END;
$$ LANGUAGE plpgsql;

-- Increment automation stat
CREATE OR REPLACE FUNCTION public.increment_automation_stat(
  p_automation_id UUID,
  p_field TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.email_automations
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    ARRAY[p_field],
    to_jsonb(COALESCE((stats->>p_field)::int, 0) + 1)
  ),
  updated_at = NOW()
  WHERE id = p_automation_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement automation stat
CREATE OR REPLACE FUNCTION public.decrement_automation_stat(
  p_automation_id UUID,
  p_field TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.email_automations
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    ARRAY[p_field],
    to_jsonb(GREATEST(0, COALESCE((stats->>p_field)::int, 0) - 1))
  ),
  updated_at = NOW()
  WHERE id = p_automation_id;
END;
$$ LANGUAGE plpgsql;

-- Update automation average time
CREATE OR REPLACE FUNCTION public.update_automation_average_time(
  p_automation_id UUID,
  p_time_ms BIGINT
)
RETURNS void AS $$
DECLARE
  current_avg BIGINT;
  current_count INTEGER;
  new_avg BIGINT;
BEGIN
  SELECT
    COALESCE((stats->>'averageTimeToComplete')::bigint, 0),
    COALESCE((stats->>'completed')::int, 0)
  INTO current_avg, current_count
  FROM public.email_automations
  WHERE id = p_automation_id;

  -- Calculate running average
  IF current_count > 0 THEN
    new_avg := ((current_avg * current_count) + p_time_ms) / (current_count + 1);
  ELSE
    new_avg := p_time_ms;
  END IF;

  UPDATE public.email_automations
  SET stats = jsonb_set(
    COALESCE(stats, '{}'::jsonb),
    ARRAY['averageTimeToComplete'],
    to_jsonb(new_avg)
  )
  WHERE id = p_automation_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers for Updated At (drop existing first for idempotency)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_subscribers_updated_at ON public.email_subscribers;
CREATE TRIGGER email_subscribers_updated_at BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_email_updated_at();

DROP TRIGGER IF EXISTS email_lists_updated_at ON public.email_lists;
CREATE TRIGGER email_lists_updated_at BEFORE UPDATE ON public.email_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_email_updated_at();

DROP TRIGGER IF EXISTS email_templates_updated_at ON public.email_templates;
CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_email_updated_at();

DROP TRIGGER IF EXISTS email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_email_updated_at();

DROP TRIGGER IF EXISTS email_automations_updated_at ON public.email_automations;
CREATE TRIGGER email_automations_updated_at BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_email_updated_at();

DROP TRIGGER IF EXISTS provider_configs_updated_at ON public.email_provider_configs;
CREATE TRIGGER provider_configs_updated_at BEFORE UPDATE ON public.email_provider_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_email_updated_at();

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT ALL ON public.email_subscribers TO authenticated;
GRANT ALL ON public.email_lists TO authenticated;
GRANT ALL ON public.subscriber_lists TO authenticated;
GRANT ALL ON public.email_tags TO authenticated;
GRANT ALL ON public.subscriber_tags TO authenticated;
GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_automations TO authenticated;
GRANT ALL ON public.subscriber_automation_states TO authenticated;
GRANT ALL ON public.email_send_queue TO authenticated;
GRANT ALL ON public.email_events TO authenticated;
GRANT ALL ON public.email_daily_aggregates TO authenticated;
GRANT ALL ON public.email_reports TO authenticated;
GRANT ALL ON public.email_provider_configs TO authenticated;

GRANT ALL ON public.email_subscribers TO service_role;
GRANT ALL ON public.email_lists TO service_role;
GRANT ALL ON public.subscriber_lists TO service_role;
GRANT ALL ON public.email_tags TO service_role;
GRANT ALL ON public.subscriber_tags TO service_role;
GRANT ALL ON public.email_templates TO service_role;
GRANT ALL ON public.email_campaigns TO service_role;
GRANT ALL ON public.email_automations TO service_role;
GRANT ALL ON public.subscriber_automation_states TO service_role;
GRANT ALL ON public.email_send_queue TO service_role;
GRANT ALL ON public.email_events TO service_role;
GRANT ALL ON public.email_daily_aggregates TO service_role;
GRANT ALL ON public.email_reports TO service_role;
GRANT ALL ON public.email_provider_configs TO service_role;
