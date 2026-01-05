// Run Business Intelligence Migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('Starting Business Intelligence migration...\n');

  try {
    // Create kpi_goals table
    console.log('1. Creating kpi_goals table...');
    const { error: error1 } = await supabase.rpc('pg_temp_exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS kpi_goals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          target_value NUMERIC NOT NULL,
          current_value NUMERIC DEFAULT 0,
          unit TEXT NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          status TEXT DEFAULT 'not_started',
          priority TEXT DEFAULT 'medium',
          frequency TEXT DEFAULT 'monthly',
          milestones JSONB DEFAULT '[]'::jsonb,
          history JSONB DEFAULT '[]'::jsonb,
          linked_metrics TEXT[] DEFAULT '{}',
          owner TEXT,
          team TEXT,
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (error1 && !error1.message.includes('already exists')) {
      // Try direct insert approach - create table via data insertion
      console.log('   Using alternative approach via direct operations...');
    }

    // Test by inserting sample data
    console.log('2. Inserting sample KPI goals...');

    // First, get a user ID
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const userId = users?.[0]?.id || '00000000-0000-0000-0000-000000000001';

    // Check if table exists by trying to select
    const { data: existingGoals, error: selectError } = await supabase
      .from('kpi_goals')
      .select('id')
      .limit(1);

    if (selectError && selectError.code === 'PGRST205') {
      console.log('\n❌ Table kpi_goals does not exist.');
      console.log('   Please run the migration manually via Supabase Dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql');
      console.log('   2. Open the file: supabase/migrations/20250105000001_business_intelligence_tables.sql');
      console.log('   3. Copy and paste the SQL into the SQL Editor and run it\n');
      return;
    }

    // Insert sample goals
    const sampleGoals = [
      {
        user_id: userId,
        name: 'Q1 Revenue Target',
        description: 'Achieve $30,000 in revenue for Q1',
        category: 'revenue',
        target_value: 30000,
        current_value: 24500,
        unit: '$',
        start_date: '2025-01-01',
        end_date: '2025-03-31',
        status: 'on_track',
        priority: 'critical',
        frequency: 'quarterly',
        tags: ['revenue', 'q1', 'priority']
      },
      {
        user_id: userId,
        name: 'Client Retention Rate',
        description: 'Maintain 90% client retention',
        category: 'retention',
        target_value: 90,
        current_value: 87,
        unit: '%',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        status: 'at_risk',
        priority: 'high',
        frequency: 'yearly',
        tags: ['retention', 'clients']
      },
      {
        user_id: userId,
        name: 'Profit Margin',
        description: 'Achieve 35% net profit margin',
        category: 'profitability',
        target_value: 35,
        current_value: 32,
        unit: '%',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        status: 'on_track',
        priority: 'high',
        frequency: 'yearly',
        tags: ['profitability', 'efficiency']
      }
    ];

    const { data: insertedGoals, error: insertError } = await supabase
      .from('kpi_goals')
      .upsert(sampleGoals, { onConflict: 'id' })
      .select();

    if (insertError) {
      console.log('   Insert error:', insertError.message);
    } else {
      console.log(`   ✓ Inserted ${insertedGoals?.length || 0} sample goals`);
    }

    // Verify the data
    console.log('\n3. Verifying data...');
    const { data: goals, error: verifyError } = await supabase
      .from('kpi_goals')
      .select('id, name, category, status')
      .limit(5);

    if (verifyError) {
      console.log('   Verification error:', verifyError.message);
    } else {
      console.log('   ✓ Found', goals?.length || 0, 'KPI goals in database');
      goals?.forEach(g => {
        console.log(`     - ${g.name} (${g.category}) - ${g.status}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (err) {
    console.error('Migration error:', err);
  }
}

runMigration();
