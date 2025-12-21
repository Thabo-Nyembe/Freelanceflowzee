-- Enable Realtime for All Tables Used by Hooks
-- Created: December 16, 2024
-- Enables postgres realtime for all tables referenced by A+++ hooks

-- ============================================
-- CORE TABLES - High Priority
-- ============================================
DO $$
BEGIN
  -- Files & Storage
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE files' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'files');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE folders' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'folders');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE storage_connections' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'storage_connections');

  -- User & Auth
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE profiles' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_preferences');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE user_settings' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_settings');

  -- Projects & Tasks
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE projects' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE project_tasks' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'project_tasks');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE tasks' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tasks');

  -- Clients
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE clients' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clients');

  -- Messaging
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE messages' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE notifications' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications');
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE conversations' WHERE EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations');

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Some tables may already be in publication or do not exist: %', SQLERRM;
END $$;

-- ============================================
-- FINANCIAL TABLES
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS invoices;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS transactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS payments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS escrow_deposits;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS escrow_milestones;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- AI TABLES
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ai_conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ai_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ai_generations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ai_designs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ai_usage_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- CALENDAR & BOOKINGS
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS calendar_events;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS bookings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS events;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TEAM & COLLABORATION
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS team_members;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS collaboration;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS time_tracking;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- CRM & SALES
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS leads;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS sales_deals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS crm_contacts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- CONTENT & MEDIA
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS gallery_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS video_projects;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS audio_projects;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS canvas;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SUPPORT & FEEDBACK
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS support_tickets;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS feedback;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ANALYTICS & REPORTS
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS analytics;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS reports;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS dashboard_widgets;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ADMIN & SETTINGS
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS admin_settings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS system_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS audit_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- WORKFLOW & AUTOMATION
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS workflows;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS automations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- INTEGRATIONS
-- ============================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS integrations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS webhooks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Realtime enabled for all major tables used by A+++ hooks';
END $$;
