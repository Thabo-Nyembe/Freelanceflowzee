/**
 * Update Engagement Tables Schema
 * Adds missing columns to existing tables
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const supabase = createClient(supabaseUrl, serviceKey);

async function testInsertUserAnalytics() {
  console.log('Testing user_analytics table...');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000001',
    total_sessions: 10,
    total_time_spent: 3600,
    engagement_score: 75,
    retention_score: 80,
    user_tier: 'active'
  };

  const { data, error } = await supabase
    .from('user_analytics')
    .upsert(testData, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.log('Error:', error.message);
    console.log('Details:', error.details);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function testInsertUserSession() {
  console.log('\nTesting user_sessions table...');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000001',
    device_type: 'desktop',
    browser: 'Chrome',
    duration: 1800
  };

  const { data, error } = await supabase
    .from('user_sessions')
    .insert(testData)
    .select();

  if (error) {
    console.log('Error:', error.message);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function testInsertActivityLog() {
  console.log('\nTesting user_activity_log table...');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000001',
    action_type: 'page_view',
    action_name: 'view_dashboard',
    page_path: '/dashboard'
  };

  const { data, error } = await supabase
    .from('user_activity_log')
    .insert(testData)
    .select();

  if (error) {
    console.log('Error:', error.message);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function testInsertPreferences() {
  console.log('\nTesting user_preferences table...');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000001',
    preferred_view_mode: 'grid',
    most_used_features: ['projects', 'tasks']
  };

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(testData, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.log('Error:', error.message);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function testInsertRecommendation() {
  console.log('\nTesting engagement_recommendations table...');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000001',
    recommendation_type: 'feature',
    title: 'Try Analytics',
    description: 'Get insights into your business',
    priority: 80,
    status: 'pending'
  };

  const { data, error } = await supabase
    .from('engagement_recommendations')
    .insert(testData)
    .select();

  if (error) {
    console.log('Error:', error.message);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function testInsertMilestone() {
  console.log('\nTesting user_milestones table...');

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000001',
    milestone_type: 'first_login',
    milestone_name: 'Welcome!',
    description: 'First login to KAZI'
  };

  const { data, error } = await supabase
    .from('user_milestones')
    .upsert(testData, { onConflict: 'user_id,milestone_type' })
    .select();

  if (error) {
    console.log('Error:', error.message);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function testInsertInvestorMetrics() {
  console.log('\nTesting investor_metrics table...');

  const today = new Date().toISOString().split('T')[0];
  const testData = {
    period_start: today,
    period_end: today,
    period_type: 'daily',
    total_users: 100,
    active_users: 50,
    new_users: 5
  };

  const { data, error } = await supabase
    .from('investor_metrics')
    .upsert(testData, { onConflict: 'period_start,period_end,period_type' })
    .select();

  if (error) {
    console.log('Error:', error.message);
    return false;
  }

  console.log('Success! Data:', data);
  return true;
}

async function main() {
  console.log('=== Testing Engagement Tables ===\n');

  const results = {
    user_analytics: await testInsertUserAnalytics(),
    user_sessions: await testInsertUserSession(),
    user_activity_log: await testInsertActivityLog(),
    user_preferences: await testInsertPreferences(),
    engagement_recommendations: await testInsertRecommendation(),
    user_milestones: await testInsertMilestone(),
    investor_metrics: await testInsertInvestorMetrics()
  };

  console.log('\n=== Summary ===');
  for (const [table, success] of Object.entries(results)) {
    console.log(`${success ? '✅' : '❌'} ${table}`);
  }

  const allSuccess = Object.values(results).every(v => v);
  if (allSuccess) {
    console.log('\n🎉 All engagement tables are working correctly!');
  } else {
    console.log('\n⚠️ Some tables need schema updates. Please run the SQL migration.');
  }
}

main().catch(console.error);
