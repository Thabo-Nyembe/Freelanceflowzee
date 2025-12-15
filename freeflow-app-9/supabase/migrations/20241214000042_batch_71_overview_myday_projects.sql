-- =====================================================
-- BATCH 71: Overview, My Day, Projects Hub
-- =====================================================

-- Overview Dashboard Widgets Table
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  width TEXT DEFAULT 'full',
  height TEXT DEFAULT 'auto',
  config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- My Day Tasks Table
CREATE TABLE IF NOT EXISTS my_day_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  due_time TIME,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  project_id UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- My Day Focus Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES my_day_tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  session_type TEXT DEFAULT 'focus' CHECK (session_type IN ('focus', 'break', 'meeting')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Hub Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  team_members UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_template BOOLEAN DEFAULT false,
  template_id UUID,
  metadata JSONB DEFAULT '{}',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID,
  due_date DATE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_day_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_widgets
CREATE POLICY "Users can view own widgets" ON dashboard_widgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own widgets" ON dashboard_widgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own widgets" ON dashboard_widgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own widgets" ON dashboard_widgets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for my_day_tasks
CREATE POLICY "Users can view own my_day_tasks" ON my_day_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own my_day_tasks" ON my_day_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own my_day_tasks" ON my_day_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own my_day_tasks" ON my_day_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for focus_sessions
CREATE POLICY "Users can view own focus_sessions" ON focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own focus_sessions" ON focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own focus_sessions" ON focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own focus_sessions" ON focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for project_tasks
CREATE POLICY "Users can view own project_tasks" ON project_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own project_tasks" ON project_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project_tasks" ON project_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project_tasks" ON project_tasks FOR DELETE USING (auth.uid() = user_id);

-- Sequences for project codes
CREATE SEQUENCE IF NOT EXISTS project_code_seq START 1000;

-- Function to generate project code
CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_code IS NULL THEN
    NEW.project_code := 'PRJ-' || LPAD(nextval('project_code_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project code
DROP TRIGGER IF EXISTS set_project_code ON projects;
CREATE TRIGGER set_project_code
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_code();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_my_day_tasks_user ON my_day_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_my_day_tasks_due_date ON my_day_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_my_day_tasks_status ON my_day_tasks(status);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_user ON project_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
