/**
 * Showcase Users Test Suite
 * Tests the two demo users and their engagement data
 *
 * Run: node scripts/test-showcase-users.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gcinvwprtlnwuwuvmrux.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaW52d3BydGxud3V3dXZtcnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1ODU5MiwiZXhwIjoyMDc5NjM0NTkyfQ.pFnOu-jsRChBCQigpNOSpyIFF_grbHTwrv0eBh9JYbo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Test configuration
const USERS = {
  sarah: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'sarah@techstartup.io',
    name: 'Sarah Mitchell',
    expectedTier: 'new',
    expectedEngagementScore: 5,
    expectedOnboardingCompleted: false,
    expectedMilestones: ['Welcome to KAZI']
  },
  marcus: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'marcus@designstudio.co',
    name: 'Marcus Johnson',
    expectedTier: 'power',
    expectedEngagementScore: 92,
    expectedOnboardingCompleted: true,
    expectedMilestones: ['Welcome to KAZI', 'Project Pioneer', 'Getting Paid', 'Feature Explorer', 'Power User']
  }
};

// Test results tracking
let passed = 0;
let failed = 0;
const failures = [];

function test(name, condition, details = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${details ? ` - ${details}` : ''}`);
    failed++;
    failures.push({ name, details });
  }
}

async function testUserExists(user) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .eq('id', user.id)
    .single();

  test('User exists in database', !error && data !== null);
  test('Email matches', data?.email === user.email, `Expected: ${user.email}, Got: ${data?.email}`);
  test('Name matches', data?.name === user.name, `Expected: ${user.name}, Got: ${data?.name}`);

  return data;
}

async function testEngagementAnalytics(user) {
  const { data, error } = await supabase
    .from('engagement_analytics')
    .select('*')
    .eq('user_id', user.id)
    .single();

  test('Engagement analytics record exists', !error && data !== null);
  test('User tier is correct', data?.user_tier === user.expectedTier,
    `Expected: ${user.expectedTier}, Got: ${data?.user_tier}`);
  test('Engagement score is correct', data?.engagement_score === user.expectedEngagementScore,
    `Expected: ${user.expectedEngagementScore}, Got: ${data?.engagement_score}`);
  test('Onboarding status is correct', data?.onboarding_completed === user.expectedOnboardingCompleted,
    `Expected: ${user.expectedOnboardingCompleted}, Got: ${data?.onboarding_completed}`);

  return data;
}

async function testEngagementSessions(user) {
  const { data, error, count } = await supabase
    .from('engagement_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  test('Has engagement sessions', !error && count > 0, `Session count: ${count}`);

  if (data && data.length > 0) {
    test('Session has device type', data[0].device_type !== null);
    test('Session has browser info', data[0].browser !== null);
  }

  return { data, count };
}

async function testActivityLog(user) {
  const { data, error, count } = await supabase
    .from('engagement_activity_log')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  test('Has activity log entries', !error && count > 0, `Activity count: ${count}`);

  return { data, count };
}

async function testMilestones(user) {
  const { data, error } = await supabase
    .from('user_milestones')
    .select('milestone_name')
    .eq('user_id', user.id);

  test('Has milestones', !error && data !== null && data.length > 0, `Milestone count: ${data?.length || 0}`);

  const milestoneNames = data?.map(m => m.milestone_name) || [];
  const expectedCount = user.expectedMilestones.length;
  test(`Has ${expectedCount} expected milestones`, milestoneNames.length === expectedCount,
    `Expected: ${expectedCount}, Got: ${milestoneNames.length}`);

  for (const expected of user.expectedMilestones) {
    test(`Has milestone: "${expected}"`, milestoneNames.includes(expected));
  }

  return data;
}

async function testPasswordHash(user) {
  const { data, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', user.id)
    .single();

  test('Has password hash', !error && data?.password_hash !== null);
  test('Password hash is bcrypt format', data?.password_hash?.startsWith('$2a$') || data?.password_hash?.startsWith('$2b$'));

  return data;
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           SHOWCASE USERS TEST SUITE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Test Sarah (New User)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 TESTING: Sarah Mitchell (New User)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n📋 User Record:');
  await testUserExists(USERS.sarah);

  console.log('\n🔐 Authentication:');
  await testPasswordHash(USERS.sarah);

  console.log('\n📊 Engagement Analytics:');
  await testEngagementAnalytics(USERS.sarah);

  console.log('\n📅 Sessions:');
  await testEngagementSessions(USERS.sarah);

  console.log('\n📝 Activity Log:');
  await testActivityLog(USERS.sarah);

  console.log('\n🏆 Milestones:');
  await testMilestones(USERS.sarah);

  // Test Marcus (Power User)
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 TESTING: Marcus Johnson (Power User)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n📋 User Record:');
  await testUserExists(USERS.marcus);

  console.log('\n🔐 Authentication:');
  await testPasswordHash(USERS.marcus);

  console.log('\n📊 Engagement Analytics:');
  await testEngagementAnalytics(USERS.marcus);

  console.log('\n📅 Sessions:');
  await testEngagementSessions(USERS.marcus);

  console.log('\n📝 Activity Log:');
  await testActivityLog(USERS.marcus);

  console.log('\n🏆 Milestones:');
  await testMilestones(USERS.marcus);

  // Summary
  console.log('\n');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('                        TEST SUMMARY                            ');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total:  ${passed + failed}`);
  console.log('');

  if (failed > 0) {
    console.log('Failed tests:');
    failures.forEach(f => console.log(`  - ${f.name}: ${f.details}`));
    console.log('');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    console.log('');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
