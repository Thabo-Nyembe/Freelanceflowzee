-- =====================================================
-- SHOWCASE USERS SEED DATA
-- Two demo users for showcasing the engagement system
-- Password for both: Demo2025
-- =====================================================

-- User 1: Sarah Mitchell - NEW USER (just signed up)
INSERT INTO users (id, email, name, password_hash, role, avatar_url, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'sarah@techstartup.io',
  'Sarah Mitchell',
  '$2b$10$z2MwtOyHFkiY1aOQaNj7mOG0Yb66Ng5Ej7aWscYvWfl2m.4jCSywG',
  'user',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  '2025-12-31T08:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- User 2: Marcus Johnson - POWER USER (2+ months active)
INSERT INTO users (id, email, name, password_hash, role, avatar_url, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'marcus@designstudio.co',
  'Marcus Johnson',
  '$2b$10$z2MwtOyHFkiY1aOQaNj7mOG0Yb66Ng5Ej7aWscYvWfl2m.4jCSywG',
  'user',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  '2025-10-15T10:30:00Z'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ENGAGEMENT ANALYTICS
-- =====================================================

-- Sarah: New user, minimal engagement
INSERT INTO engagement_analytics (user_id, total_sessions, total_time_spent, avg_session_duration,
  projects_created, tasks_completed, invoices_sent, files_uploaded, messages_sent, ai_features_used,
  engagement_score, retention_score, activation_score, onboarding_completed, onboarding_step, user_tier)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  1, 180, 180, 0, 0, 0, 0, 0, 0,
  5, 0, 10, false, 1, 'new'
) ON CONFLICT (user_id) DO NOTHING;

-- Marcus: Power user, heavy engagement
INSERT INTO engagement_analytics (user_id, total_sessions, total_time_spent, avg_session_duration,
  projects_created, tasks_completed, invoices_sent, files_uploaded, messages_sent, ai_features_used,
  engagement_score, retention_score, activation_score, onboarding_completed, onboarding_step, user_tier)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  156, 432000, 2769, 12, 87, 24, 156, 342, 45,
  92, 95, 100, true, 5, 'power'
) ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- MILESTONES
-- =====================================================

-- Sarah: Just the welcome milestone
INSERT INTO user_milestones (user_id, milestone_type, milestone_name, description, achieved_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'first_login', 'Welcome to KAZI', 'Started your journey', '2025-12-31T08:00:00Z')
ON CONFLICT DO NOTHING;

-- Marcus: Multiple achievements
INSERT INTO user_milestones (user_id, milestone_type, milestone_name, description, achieved_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'first_login', 'Welcome to KAZI', 'Started your journey', '2025-10-15T10:30:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'first_project', 'Project Pioneer', 'Created your first project', '2025-10-16T09:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'first_invoice', 'Getting Paid', 'Sent your first invoice', '2025-10-20T14:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'feature_explorer', 'Feature Explorer', 'Used 5+ features', '2025-11-01T11:00:00Z'),
  ('22222222-2222-2222-2222-222222222222', 'power_user', 'Power User', 'Achieved power user status', '2025-12-01T10:00:00Z')
ON CONFLICT DO NOTHING;

-- =====================================================
-- LOGIN CREDENTIALS
-- =====================================================
-- New User:   sarah@techstartup.io / Demo2025
-- Power User: marcus@designstudio.co / Demo2025
-- =====================================================
