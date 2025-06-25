const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_ENDPOINTS = [
  // Public Routes (should return 200)
  { path: '/', name: 'Landing Page', expectedStatus: 200 },
  { path: '/login', name: 'Login Page', expectedStatus: 200 },
  { path: '/signup', name: 'Signup Page', expectedStatus: 200 },
  { path: '/features', name: 'Features Page', expectedStatus: 200 },
  { path: '/how-it-works', name: 'How It Works', expectedStatus: 200 },
  { path: '/docs', name: 'Documentation', expectedStatus: 200 },
  { path: '/tutorials', name: 'Tutorials', expectedStatus: 200 },
  { path: '/community', name: 'Community', expectedStatus: 200 },
  { path: '/api-docs', name: 'API Documentation', expectedStatus: 200 },
  { path: '/demo', name: 'Demo Project', expectedStatus: 200 },
  { path: '/support', name: 'Support', expectedStatus: 200 },
  { path: '/contact', name: 'Contact', expectedStatus: 200 },
  { path: '/payment', name: 'Payment', expectedStatus: 200 },
  { path: '/blog', name: 'Blog', expectedStatus: 200 },
  { path: '/newsletter', name: 'Newsletter', expectedStatus: 200 },
  { path: '/privacy', name: 'Privacy Policy', expectedStatus: 200 },
  { path: '/terms', name: 'Terms of Service', expectedStatus: 200 },
  
  // PWA Assets (should return 200)
  { path: '/manifest.json', name: 'PWA Manifest', expectedStatus: 200 },
  { path: '/icons/icon-144x144.png', name: 'PWA Icon', expectedStatus: 200 },
  
  // Protected Routes (should redirect)
  { path: '/dashboard', name: 'Dashboard (Protected)', expectedStatus: 307 },
  { path: '/projects', name: 'Projects (Protected)', expectedStatus: 307 },
  { path: '/analytics', name: 'Analytics (Protected)', expectedStatus: 307 },
  { path: '/feedback', name: 'Feedback (Protected)', expectedStatus: 307 }
];

// Test function
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.path}`;
    
    const req = http.get(url, (res) => {
      const status = res.statusCode;
      const success = status === endpoint.expectedStatus;
      
      resolve({
        ...endpoint,
        actualStatus: status,
        success: success,
        message: success ? '✅ PASS' : `❌ FAIL (expected ${endpoint.expectedStatus}, got ${status})`
      });
    });
    
    req.on('error', (error) => {
      resolve({
        ...endpoint,
        actualStatus: 'ERROR',
        success: false,
        message: `❌ ERROR: ${error.message}`
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        ...endpoint,
        actualStatus: 'TIMEOUT',
        success: false,
        message: '❌ TIMEOUT'
      });
    });
  });
}

// Main test runner
async function runDemo() {
  console.log('\n🚀 FreeflowZee Demo Test Suite');
  console.log('=====================================\n');
  
  console.log(`🔗 Testing server at: ${BASE_URL}\n`);
  
  const results = [];
  
  // Run tests in batches to avoid overwhelming the server
  const BATCH_SIZE = 5;
  for (let i = 0; i < TEST_ENDPOINTS.length; i += BATCH_SIZE) {
    const batch = TEST_ENDPOINTS.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(testEndpoint));
    results.push(...batchResults);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Display results
  console.log('📊 TEST RESULTS:');
  console.log('=================\n');
  
  const publicRoutes = results.filter(r => r.expectedStatus === 200);
  const protectedRoutes = results.filter(r => r.expectedStatus === 307);
  
  console.log('🌐 PUBLIC ROUTES:');
  publicRoutes.forEach(result => {
    console.log(`${result.message} ${result.name} (${result.path})`);
  });
  
  console.log('\n🔒 PROTECTED ROUTES:');
  protectedRoutes.forEach(result => {
    console.log(`${result.message} ${result.name} (${result.path})`);
  });
  
  // Summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log('\n📈 SUMMARY:');
  console.log('============');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! FreeflowZee is running perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server status and configuration.');
  }
  
  console.log('\n✨ Demo complete! The app is ready for development or deployment.');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo, testEndpoint }; 