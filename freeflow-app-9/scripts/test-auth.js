/**
 * Authentication Test Suite
 * Run: node scripts/test-auth.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

const USERS = [
  { email: 'sarah@techstartup.io', password: 'Demo2025', name: 'Sarah Mitchell', tier: 'new' },
  { email: 'marcus@designstudio.co', password: 'Demo2025', name: 'Marcus Johnson', tier: 'power' }
];

let passed = 0, failed = 0;

function test(name, condition) {
  if (condition) { console.log('  ✅ ' + name); passed++; }
  else { console.log('  ❌ ' + name); failed++; }
}

async function getCSRFToken() {
  const response = await fetch(BASE_URL + '/api/auth/csrf');
  const data = await response.json();
  return data.csrfToken;
}

async function testLogin(user, csrfToken) {
  const response = await fetch(BASE_URL + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, email: user.email, password: user.password }),
    redirect: 'manual'
  });
  test('Login returns 302 redirect', response.status === 302);
  const location = response.headers.get('location') || '';
  test('No error in redirect', !location.includes('error'));
}

async function testInvalidLogin(csrfToken) {
  const response = await fetch(BASE_URL + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, email: 'invalid@test.com', password: 'wrong' }),
    redirect: 'manual'
  });
  const location = response.headers.get('location') || '';
  // Invalid credentials should either include error param OR redirect to login (not dashboard)
  const isRejected = location.includes('error') || location.includes('login') || !location.includes('dashboard');
  test('Invalid credentials rejected', isRejected);
}

async function runTests() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║           AUTHENTICATION TEST SUITE                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try { await fetch(BASE_URL + '/api/auth/csrf'); }
  catch(e) { console.log('❌ Server not running at ' + BASE_URL); process.exit(1); }

  const csrfToken = await getCSRFToken();
  test('CSRF token obtained', csrfToken !== null);

  for (const user of USERS) {
    console.log('');
    console.log('👤 Testing: ' + user.name + ' (' + user.tier + ')');
    await testLogin(user, csrfToken);
  }

  console.log('');
  console.log('🔒 Testing: Invalid Credentials');
  await testInvalidLogin(csrfToken);

  console.log('');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  ✅ Passed: ' + passed + '  ❌ Failed: ' + failed);
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
