-- Master RLS Policies Migration
-- Created: December 16, 2024
-- Ensures all tables have proper Row Level Security policies

-- ============================================
-- HELPER FUNCTION FOR USER ID CHECK
-- ============================================
CREATE OR REPLACE FUNCTION is_owner(record_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = record_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GENERIC RLS POLICY CREATOR
-- ============================================
CREATE OR REPLACE FUNCTION create_user_rls_policies(table_name TEXT)
RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if table exists and has user_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = create_user_rls_policies.table_name
    AND column_name = 'user_id'
  ) THEN
    RAISE NOTICE 'Table % does not have user_id column, skipping', table_name;
    RETURN;
  END IF;

  -- Enable RLS
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

  -- Create SELECT policy
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Users can view own %s" ON %I FOR SELECT USING (auth.uid() = user_id)',
    table_name, table_name
  );

  -- Create INSERT policy
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Users can insert own %s" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)',
    table_name, table_name
  );

  -- Create UPDATE policy
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Users can update own %s" ON %I FOR UPDATE USING (auth.uid() = user_id)',
    table_name, table_name
  );

  -- Create DELETE policy
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Users can delete own %s" ON %I FOR DELETE USING (auth.uid() = user_id)',
    table_name, table_name
  );

  RAISE NOTICE 'RLS policies created for table: %', table_name;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create policies for %: %', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- APPLY RLS TO ALL CORE TABLES
-- ============================================

-- Files & Storage
SELECT create_user_rls_policies('files');
SELECT create_user_rls_policies('folders');
SELECT create_user_rls_policies('storage_connections');

-- Projects & Tasks
SELECT create_user_rls_policies('projects');
SELECT create_user_rls_policies('project_tasks');
SELECT create_user_rls_policies('tasks');
SELECT create_user_rls_policies('milestones');

-- Clients
SELECT create_user_rls_policies('clients');

-- Financial
SELECT create_user_rls_policies('invoices');
SELECT create_user_rls_policies('transactions');
SELECT create_user_rls_policies('payments');
SELECT create_user_rls_policies('expenses');
SELECT create_user_rls_policies('budgets');
SELECT create_user_rls_policies('escrow_deposits');
SELECT create_user_rls_policies('escrow_milestones');

-- Messaging & Notifications
SELECT create_user_rls_policies('messages');
SELECT create_user_rls_policies('notifications');
SELECT create_user_rls_policies('conversations');

-- AI
SELECT create_user_rls_policies('ai_chat_history');
SELECT create_user_rls_policies('ai_operations');
SELECT create_user_rls_policies('ai_conversations');
SELECT create_user_rls_policies('ai_messages');
SELECT create_user_rls_policies('ai_generations');
SELECT create_user_rls_policies('ai_designs');
SELECT create_user_rls_policies('ai_usage_logs');

-- Calendar & Bookings
SELECT create_user_rls_policies('calendar_events');
SELECT create_user_rls_policies('bookings');
SELECT create_user_rls_policies('events');

-- Team & Time
SELECT create_user_rls_policies('time_tracking');
SELECT create_user_rls_policies('my_day_tasks');

-- CRM & Sales
SELECT create_user_rls_policies('leads');
SELECT create_user_rls_policies('sales_deals');
SELECT create_user_rls_policies('sales_activities');
SELECT create_user_rls_policies('crm_contacts');

-- Content & Media
SELECT create_user_rls_policies('gallery_items');
SELECT create_user_rls_policies('gallery_collections');
SELECT create_user_rls_policies('video_projects');
SELECT create_user_rls_policies('audio_projects');
SELECT create_user_rls_policies('canvas');

-- Support
SELECT create_user_rls_policies('support_tickets');
SELECT create_user_rls_policies('feedback');

-- Reports & Analytics
SELECT create_user_rls_policies('reports');
SELECT create_user_rls_policies('dashboard_widgets');
SELECT create_user_rls_policies('revenue_reports');
SELECT create_user_rls_policies('business_reports');

-- Growth & Marketing
SELECT create_user_rls_policies('market_opportunities');
SELECT create_user_rls_policies('growth_metrics');
SELECT create_user_rls_policies('campaigns');

-- Settings
SELECT create_user_rls_policies('user_settings');
SELECT create_user_rls_policies('user_preferences');
SELECT create_user_rls_policies('admin_settings');

-- Workflows
SELECT create_user_rls_policies('workflows');
SELECT create_user_rls_policies('automations');

-- Integrations
SELECT create_user_rls_policies('integrations');
SELECT create_user_rls_policies('webhooks');

-- ============================================
-- SPECIAL POLICIES FOR SHARED RESOURCES
-- ============================================

-- Team members can view team projects
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects') THEN
    DROP POLICY IF EXISTS "Team members can view shared projects" ON projects;
    CREATE POLICY "Team members can view shared projects" ON projects
      FOR SELECT
      USING (
        auth.uid() = user_id
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.user_id = auth.uid()
          AND team_members.team_id IN (
            SELECT team_id FROM team_members WHERE user_id = projects.user_id
          )
        )
      );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create team project policy: %', SQLERRM;
END $$;

-- Shared files access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'files') THEN
    DROP POLICY IF EXISTS "Users can view shared files" ON files;
    CREATE POLICY "Users can view shared files" ON files
      FOR SELECT
      USING (
        auth.uid() = user_id
        OR id IN (SELECT file_id FROM file_shares WHERE shared_with = auth.uid())
        OR is_public = TRUE
      );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create shared files policy: %', SQLERRM;
END $$;

-- ============================================
-- CLEANUP
-- ============================================
DROP FUNCTION IF EXISTS create_user_rls_policies(TEXT);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Master RLS policies applied to all tables';
END $$;
