/**
 * Test Engagement Tables V2
 * Tests the new engagement_ prefixed tables
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TABLES = [
  { name: 'engagement_analytics', testData: { user_id: '00000000-0000-0000-0000-000000000001', engagement_score: 75 } },
  { name: 'engagement_sessions', testData: { user_id: '00000000-0000-0000-0000-000000000001', device_type: 'desktop' } },
  { name: 'engagement_activity_log', testData: { user_id: '00000000-0000-0000-0000-000000000001', action_type: 'test', action_name: 'test_action' } },
  { name: 'engagement_preferences', testData: { user_id: '00000000-0000-0000-0000-000000000001', preferred_view_mode: 'grid' } },
  { name: 'engagement_recommendations', testData: { user_id: '00000000-0000-0000-0000-000000000001', recommendation_type: 'feature', title: 'Test' } },
  { name: 'platform_metrics', testData: { period_start: '2025-12-31', period_end: '2025-12-31', period_type: 'daily' } },
  { name: 'user_milestones', testData: { user_id: '00000000-0000-0000-0000-000000000001', milestone_type: 'test', milestone_name: 'Test' } }
];

async function testTables() {
  console.log('='.repeat(60));
  console.log('Testing Engagement V2 Tables');
  console.log('='.repeat(60));
  console.log('');

  let allPassed = true;
  const results = [];

  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log(`❌ ${table.name} - TABLE NOT FOUND`);
        results.push({ table: table.name, status: 'missing' });
        allPassed = false;
      } else if (error.message.includes('schema cache')) {
        console.log(`❌ ${table.name} - NOT IN SCHEMA CACHE`);
        results.push({ table: table.name, status: 'missing' });
        allPassed = false;
      } else {
        console.log(`⚠️  ${table.name} - ERROR: ${error.message}`);
        results.push({ table: table.name, status: 'error', error: error.message });
        allPassed = false;
      }
    } else {
      console.log(`✅ ${table.name} - OK (${data?.length || 0} rows)`);
      results.push({ table: table.name, status: 'ok', rows: data?.length || 0 });
    }
  }

  console.log('');
  console.log('='.repeat(60));

  if (allPassed) {
    console.log('🎉 All engagement tables are ready!');
    console.log('');
    console.log('Testing data insertion...');

    // Test insert for engagement_analytics
    const { error: insertError } = await supabase
      .from('engagement_analytics')
      .upsert({
        user_id: '00000000-0000-0000-0000-000000000001',
        engagement_score: 75,
        user_tier: 'active',
        total_sessions: 15
      }, { onConflict: 'user_id' });

    if (insertError) {
      console.log(`❌ Insert test failed: ${insertError.message}`);
    } else {
      console.log('✅ Insert test passed!');
    }
  } else {
    console.log('⚠️  Some tables are missing!');
    console.log('');
    console.log('Run this SQL in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql');
    console.log('');
    console.log('File: supabase/migrations/20251231000004_engagement_system_v2.sql');
  }

  console.log('='.repeat(60));

  return allPassed;
}

testTables().catch(console.error);
