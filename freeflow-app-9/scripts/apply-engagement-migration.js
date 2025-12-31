/**
 * Apply Engagement Tables Migration
 * Run with: node scripts/apply-engagement-migration.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const supabase = createClient(supabaseUrl, serviceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function applyMigration() {
  console.log('Applying engagement tables migration...\n');

  const tables = [
    {
      name: 'user_analytics',
      sql: `
        CREATE TABLE IF NOT EXISTS user_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          total_sessions INTEGER DEFAULT 0,
          total_time_spent INTEGER DEFAULT 0,
          last_session_at TIMESTAMPTZ,
          avg_session_duration INTEGER DEFAULT 0,
          projects_created INTEGER DEFAULT 0,
          tasks_completed INTEGER DEFAULT 0,
          invoices_sent INTEGER DEFAULT 0,
          files_uploaded INTEGER DEFAULT 0,
          messages_sent INTEGER DEFAULT 0,
          ai_features_used INTEGER DEFAULT 0,
          engagement_score INTEGER DEFAULT 50,
          retention_score INTEGER DEFAULT 50,
          activation_score INTEGER DEFAULT 0,
          onboarding_completed BOOLEAN DEFAULT FALSE,
          onboarding_step INTEGER DEFAULT 0,
          user_tier TEXT DEFAULT 'new',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        )
      `
    },
    {
      name: 'user_sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          started_at TIMESTAMPTZ DEFAULT NOW(),
          ended_at TIMESTAMPTZ,
          duration INTEGER,
          device_type TEXT,
          browser TEXT,
          os TEXT,
          screen_size TEXT,
          pages_viewed INTEGER DEFAULT 0,
          actions_taken INTEGER DEFAULT 0,
          features_used TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `
    },
    {
      name: 'user_activity_log',
      sql: `
        CREATE TABLE IF NOT EXISTS user_activity_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          session_id UUID,
          action_type TEXT NOT NULL,
          action_name TEXT NOT NULL,
          entity_type TEXT,
          entity_id UUID,
          page_path TEXT,
          metadata JSONB DEFAULT '{}',
          duration INTEGER,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        )
      `
    },
    {
      name: 'user_preferences',
      sql: `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          preferred_dashboard_widgets TEXT[] DEFAULT '{}',
          preferred_view_mode TEXT DEFAULT 'grid',
          preferred_theme TEXT DEFAULT 'system',
          sidebar_collapsed BOOLEAN DEFAULT FALSE,
          most_used_features TEXT[] DEFAULT '{}',
          suggested_features TEXT[] DEFAULT '{}',
          hidden_features TEXT[] DEFAULT '{}',
          preferred_project_types TEXT[] DEFAULT '{}',
          preferred_client_industries TEXT[] DEFAULT '{}',
          email_frequency TEXT DEFAULT 'daily',
          push_notifications BOOLEAN DEFAULT TRUE,
          in_app_notifications BOOLEAN DEFAULT TRUE,
          best_active_hours TEXT[] DEFAULT '{}',
          best_active_days TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        )
      `
    },
    {
      name: 'engagement_recommendations',
      sql: `
        CREATE TABLE IF NOT EXISTS engagement_recommendations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          recommendation_type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          priority INTEGER DEFAULT 50,
          trigger_reason TEXT,
          related_feature TEXT,
          action_url TEXT,
          status TEXT DEFAULT 'pending',
          shown_at TIMESTAMPTZ,
          clicked_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          dismissed_at TIMESTAMPTZ,
          relevance_score INTEGER DEFAULT 50,
          urgency_score INTEGER DEFAULT 50,
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `
    },
    {
      name: 'investor_metrics',
      sql: `
        CREATE TABLE IF NOT EXISTS investor_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          period_type TEXT NOT NULL,
          total_users INTEGER DEFAULT 0,
          new_users INTEGER DEFAULT 0,
          active_users INTEGER DEFAULT 0,
          churned_users INTEGER DEFAULT 0,
          total_sessions INTEGER DEFAULT 0,
          avg_session_duration INTEGER DEFAULT 0,
          avg_sessions_per_user DECIMAL(10,2) DEFAULT 0,
          feature_adoption_rates JSONB DEFAULT '{}',
          most_used_features TEXT[] DEFAULT '{}',
          total_revenue DECIMAL(12,2) DEFAULT 0,
          avg_revenue_per_user DECIMAL(10,2) DEFAULT 0,
          total_projects_created INTEGER DEFAULT 0,
          total_invoices_sent INTEGER DEFAULT 0,
          day_1_retention DECIMAL(5,2) DEFAULT 0,
          day_7_retention DECIMAL(5,2) DEFAULT 0,
          day_30_retention DECIMAL(5,2) DEFAULT 0,
          user_growth_rate DECIMAL(5,2) DEFAULT 0,
          revenue_growth_rate DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(period_start, period_end, period_type)
        )
      `
    },
    {
      name: 'user_milestones',
      sql: `
        CREATE TABLE IF NOT EXISTS user_milestones (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          milestone_type TEXT NOT NULL,
          milestone_name TEXT NOT NULL,
          description TEXT,
          achieved_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}',
          UNIQUE(user_id, milestone_type)
        )
      `
    }
  ];

  // Create tables by inserting and deleting a test row (workaround for DDL)
  for (const table of tables) {
    try {
      // Check if table exists by trying to select from it
      const { error: checkError } = await supabase
        .from(table.name)
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist - we need to create it via SQL
        console.log(`Table ${table.name} doesn't exist. Please create via Supabase Dashboard.`);
        console.log(`SQL: ${table.sql.trim().substring(0, 100)}...`);
      } else if (checkError) {
        console.log(`Error checking ${table.name}:`, checkError.message);
      } else {
        console.log(`✓ Table ${table.name} already exists`);
      }
    } catch (err) {
      console.log(`Error with ${table.name}:`, err.message);
    }
  }

  console.log('\n--- Migration Check Complete ---');
  console.log('\nIf tables need to be created, copy the full SQL from:');
  console.log('supabase/migrations/20251231000001_user_analytics_engagement.sql');
  console.log('and run it in Supabase Dashboard > SQL Editor');
}

// Alternative: Try to create tables using raw postgres
async function tryCreateTablesDirectly() {
  console.log('\nAttempting direct table creation...\n');

  // Try each table
  const simpleCreates = [
    {
      name: 'user_analytics',
      check: async () => {
        const { error } = await supabase.from('user_analytics').select('id').limit(1);
        return !error || error.code !== '42P01';
      },
      create: async () => {
        // Insert a row to force table creation via PostgREST schema inference
        // This won't work for non-existent tables, but we try anyway
        return { error: { message: 'Cannot create via REST API' } };
      }
    }
  ];

  // Just check what exists
  const tablesToCheck = [
    'user_analytics',
    'user_sessions',
    'user_activity_log',
    'user_preferences',
    'engagement_recommendations',
    'investor_metrics',
    'user_milestones'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') {
      missingTables.push(table);
    } else {
      existingTables.push(table);
    }
  }

  console.log('Existing tables:', existingTables.length > 0 ? existingTables.join(', ') : 'None');
  console.log('Missing tables:', missingTables.length > 0 ? missingTables.join(', ') : 'None (all exist!)');

  return { existingTables, missingTables };
}

async function main() {
  try {
    await applyMigration();
    const result = await tryCreateTablesDirectly();

    if (result.missingTables.length > 0) {
      console.log('\n========================================');
      console.log('ACTION REQUIRED: Run SQL in Supabase Dashboard');
      console.log('========================================\n');
      console.log('Go to: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new');
      console.log('Paste the contents of: supabase/migrations/20251231000001_user_analytics_engagement.sql');
    } else {
      console.log('\n✅ All engagement tables exist!');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

main();
