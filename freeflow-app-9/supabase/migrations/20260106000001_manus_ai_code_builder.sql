-- Manus AI Code Builder Tables
-- Created: 2026-01-06
-- Purpose: Support autonomous AI agent system with code generation capabilities

-- ============================================
-- AGENT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed', 'cancelled')),
  title TEXT,
  model TEXT DEFAULT 'gpt-4o',
  provider TEXT DEFAULT 'openai' CHECK (provider IN ('openai', 'anthropic', 'google', 'openrouter')),
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  system_prompt TEXT,
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENT TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  task_type TEXT DEFAULT 'general' CHECK (task_type IN ('general', 'code_generation', 'web_app', 'api', 'component', 'refactor', 'debug', 'test', 'documentation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'waiting_input')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  result JSONB,
  error TEXT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  parent_task_id UUID REFERENCES agent_tasks(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration_ms INTEGER,
  actual_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AGENT STEPS TABLE (Execution Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action TEXT NOT NULL,
  tool TEXT CHECK (tool IN ('terminal', 'browser', 'file', 'search', 'code_edit', 'code_create', 'message', 'think', 'plan')),
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  reasoning TEXT,
  duration_ms INTEGER,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- AGENT MESSAGES TABLE (Chat History)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_name TEXT,
  tool_call_id TEXT,
  metadata JSONB DEFAULT '{}',
  tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GENERATED FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS generated_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content TEXT,
  language TEXT,
  framework TEXT,
  file_type TEXT CHECK (file_type IN ('component', 'page', 'api', 'config', 'style', 'test', 'util', 'hook', 'type', 'other')),
  size_bytes INTEGER,
  checksum TEXT,
  version INTEGER DEFAULT 1,
  is_entry_point BOOLEAN DEFAULT false,
  dependencies JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CODE PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS code_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT DEFAULT 'nextjs' CHECK (framework IN ('nextjs', 'react', 'vue', 'svelte', 'angular', 'express', 'fastapi', 'django', 'rails', 'other')),
  template TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'deployed', 'archived')),
  config JSONB DEFAULT '{}',
  dependencies JSONB DEFAULT '{}',
  dev_dependencies JSONB DEFAULT '{}',
  env_variables JSONB DEFAULT '{}',
  file_count INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  preview_url TEXT,
  deploy_url TEXT,
  repository_url TEXT,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEBHOOK DELIVERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES ai_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  success BOOLEAN,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CODE TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS code_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('web_app', 'api', 'component', 'landing_page', 'dashboard', 'ecommerce', 'blog', 'saas', 'mobile', 'other')),
  framework TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  preview_image TEXT,
  is_public BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_session_id ON agent_tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_id ON agent_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON agent_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_steps_task_id ON agent_steps(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_steps_session_id ON agent_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_steps_status ON agent_steps(status);

CREATE INDEX IF NOT EXISTS idx_agent_messages_session_id ON agent_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_task_id ON agent_messages(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON agent_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_files_task_id ON generated_files(task_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_session_id ON generated_files(session_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_user_id ON generated_files(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_language ON generated_files(language);

CREATE INDEX IF NOT EXISTS idx_code_projects_user_id ON code_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_code_projects_framework ON code_projects(framework);
CREATE INDEX IF NOT EXISTS idx_code_projects_status ON code_projects(status);

CREATE INDEX IF NOT EXISTS idx_ai_webhooks_user_id ON ai_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_webhooks_is_active ON ai_webhooks(is_active);

CREATE INDEX IF NOT EXISTS idx_code_templates_category ON code_templates(category);
CREATE INDEX IF NOT EXISTS idx_code_templates_framework ON code_templates(framework);
CREATE INDEX IF NOT EXISTS idx_code_templates_is_public ON code_templates(is_public);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_templates ENABLE ROW LEVEL SECURITY;

-- Agent Sessions Policies
CREATE POLICY "Users can view own agent sessions" ON agent_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own agent sessions" ON agent_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent sessions" ON agent_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent sessions" ON agent_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Agent Tasks Policies
CREATE POLICY "Users can view own agent tasks" ON agent_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own agent tasks" ON agent_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent tasks" ON agent_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent tasks" ON agent_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Agent Steps Policies
CREATE POLICY "Users can view own agent steps" ON agent_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM agent_sessions WHERE id = agent_steps.session_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can manage own agent steps" ON agent_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agent_sessions WHERE id = agent_steps.session_id AND user_id = auth.uid())
  );

-- Agent Messages Policies
CREATE POLICY "Users can view own agent messages" ON agent_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM agent_sessions WHERE id = agent_messages.session_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can manage own agent messages" ON agent_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM agent_sessions WHERE id = agent_messages.session_id AND user_id = auth.uid())
  );

-- Generated Files Policies
CREATE POLICY "Users can view own generated files" ON generated_files
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own generated files" ON generated_files
  FOR ALL USING (auth.uid() = user_id);

-- Code Projects Policies
CREATE POLICY "Users can view own code projects" ON code_projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own code projects" ON code_projects
  FOR ALL USING (auth.uid() = user_id);

-- Webhooks Policies
CREATE POLICY "Users can view own webhooks" ON ai_webhooks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own webhooks" ON ai_webhooks
  FOR ALL USING (auth.uid() = user_id);

-- Webhook Deliveries Policies
CREATE POLICY "Users can view own webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ai_webhooks WHERE id = webhook_deliveries.webhook_id AND user_id = auth.uid())
  );

-- Code Templates Policies
CREATE POLICY "Anyone can view public templates" ON code_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());
CREATE POLICY "Users can manage own templates" ON code_templates
  FOR ALL USING (created_by = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_agent_sessions_updated_at
  BEFORE UPDATE ON agent_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_files_updated_at
  BEFORE UPDATE ON generated_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_projects_updated_at
  BEFORE UPDATE ON code_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_webhooks_updated_at
  BEFORE UPDATE ON ai_webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_templates_updated_at
  BEFORE UPDATE ON code_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate task duration
CREATE OR REPLACE FUNCTION calculate_task_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'failed', 'cancelled') AND NEW.started_at IS NOT NULL THEN
    NEW.completed_at = NOW();
    NEW.actual_duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_agent_task_duration
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION calculate_task_duration();

-- Function to update session stats
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agent_sessions
  SET
    total_tokens_used = (
      SELECT COALESCE(SUM(tokens_used), 0) FROM agent_steps WHERE session_id = NEW.session_id
    ),
    updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_stats_on_step
  AFTER INSERT OR UPDATE ON agent_steps
  FOR EACH ROW EXECUTE FUNCTION update_session_stats();

-- Insert default code templates
INSERT INTO code_templates (name, description, category, framework, files, dependencies, is_public) VALUES
('Next.js SaaS Starter', 'Full-featured SaaS template with auth, payments, and dashboard', 'saas', 'nextjs',
  '[{"path": "app/page.tsx", "type": "page"}, {"path": "app/dashboard/page.tsx", "type": "page"}, {"path": "components/ui/button.tsx", "type": "component"}]',
  '{"next": "^14.0.0", "react": "^18.0.0", "@supabase/supabase-js": "^2.0.0", "stripe": "^14.0.0"}',
  true),
('React Component Library', 'Reusable UI component library with Storybook', 'component', 'react',
  '[{"path": "src/components/Button/Button.tsx", "type": "component"}, {"path": "src/components/Card/Card.tsx", "type": "component"}]',
  '{"react": "^18.0.0", "tailwindcss": "^3.0.0", "@radix-ui/react-dialog": "^1.0.0"}',
  true),
('Express API Boilerplate', 'Production-ready REST API with auth and validation', 'api', 'express',
  '[{"path": "src/index.ts", "type": "other"}, {"path": "src/routes/auth.ts", "type": "api"}, {"path": "src/middleware/auth.ts", "type": "util"}]',
  '{"express": "^4.18.0", "jsonwebtoken": "^9.0.0", "zod": "^3.22.0"}',
  true),
('Landing Page', 'Modern landing page with hero, features, and CTA sections', 'landing_page', 'nextjs',
  '[{"path": "app/page.tsx", "type": "page"}, {"path": "components/Hero.tsx", "type": "component"}, {"path": "components/Features.tsx", "type": "component"}]',
  '{"next": "^14.0.0", "framer-motion": "^10.0.0", "tailwindcss": "^3.0.0"}',
  true),
('E-commerce Store', 'Full e-commerce with products, cart, and checkout', 'ecommerce', 'nextjs',
  '[{"path": "app/page.tsx", "type": "page"}, {"path": "app/products/page.tsx", "type": "page"}, {"path": "app/cart/page.tsx", "type": "page"}]',
  '{"next": "^14.0.0", "stripe": "^14.0.0", "@supabase/supabase-js": "^2.0.0"}',
  true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON agent_sessions TO authenticated;
GRANT ALL ON agent_tasks TO authenticated;
GRANT ALL ON agent_steps TO authenticated;
GRANT ALL ON agent_messages TO authenticated;
GRANT ALL ON generated_files TO authenticated;
GRANT ALL ON code_projects TO authenticated;
GRANT ALL ON ai_webhooks TO authenticated;
GRANT ALL ON webhook_deliveries TO authenticated;
GRANT ALL ON code_templates TO authenticated;
