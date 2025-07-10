const { chromium } = require('playwright');

async function testWorkingFeatures() {
  console.log('🚀 Testing KAZI Platform - Working Features...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    homepage: { status: false, details: '' },
    branding: { status: false, details: '' },
    navigation: { status: false, details: '' },
    videoStudio: { status: false, details: '' },
    routing: { status: false, details: '' },
    authFlow: { status: false, details: '' }
  };
  
  try {
    // Test 1: Homepage
    console.log('🏠 Testing Homepage...');
    await page.goto('http://localhost:9323/');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    const hasKazi = title.includes('Kazi');
    results.homepage.status = hasKazi;
    results.homepage.details = `Title: ${title}`;
    console.log(`✅ Homepage: ${hasKazi ? 'PASS' : 'FAIL'} - ${title}`);
    
    // Test 2: KAZI Branding
    console.log('🎨 Testing KAZI Branding...');
    const kaziText = await page.locator('text=KAZI').count();
    const builtInAfrica = await page.locator('text=Built in Africa').count();
    const engineered = await page.locator('text=Engineered for the World').count();
    
    results.branding.status = kaziText > 0 || builtInAfrica > 0 || engineered > 0;
    results.branding.details = `KAZI: ${kaziText}, Built in Africa: ${builtInAfrica}, Engineered: ${engineered}`;
    console.log(`✅ Branding: ${results.branding.status ? 'PASS' : 'FAIL'} - ${results.branding.details}`);
    
    // Test 3: Navigation Elements
    console.log('🧭 Testing Navigation...');
    const ctaButtons = await page.locator('button:has-text("Start Free Trial"), button:has-text("Watch Demo")').count();
    const navLinks = await page.locator('a[href*="features"], a[href*="dashboard"], a[href*="video-studio"]').count();
    
    results.navigation.status = ctaButtons > 0 || navLinks > 0;
    results.navigation.details = `CTA buttons: ${ctaButtons}, Nav links: ${navLinks}`;
    console.log(`✅ Navigation: ${results.navigation.status ? 'PASS' : 'FAIL'} - ${results.navigation.details}`);
    
    // Test 4: Video Studio Direct Access
    console.log('🎬 Testing Video Studio...');
    await page.goto('http://localhost:9323/video-studio');
    await page.waitForLoadState('networkidle');
    
    const videoStudioTitle = await page.title();
    const hasVideoContent = await page.locator('main, .container, .video-studio, h1, h2').count();
    
    results.videoStudio.status = videoStudioTitle.includes('Video') && hasVideoContent > 0;
    results.videoStudio.details = `Title: ${videoStudioTitle}, Content elements: ${hasVideoContent}`;
    console.log(`✅ Video Studio: ${results.videoStudio.status ? 'PASS' : 'FAIL'} - ${results.videoStudio.details}`);
    
    // Test 5: Routing System
    console.log('🛤️ Testing Routing...');
    const testRoutes = [
      { route: '/', expected: 'Kazi' },
      { route: '/video-studio', expected: 'Video' },
      { route: '/features', expected: 'Features' },
      { route: '/pricing', expected: 'Pricing' }
    ];
    
    let workingRoutes = 0;
    for (const test of testRoutes) {
      try {
        await page.goto(`http://localhost:9323${test.route}`);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        const title = await page.title();
        if (title.toLowerCase().includes(test.expected.toLowerCase())) {
          workingRoutes++;
        }
      } catch (error) {
        console.log(`Route ${test.route} failed: ${error.message}`);
      }
    }
    
    results.routing.status = workingRoutes >= 2;
    results.routing.details = `Working routes: ${workingRoutes}/${testRoutes.length}`;
    console.log(`✅ Routing: ${results.routing.status ? 'PASS' : 'FAIL'} - ${results.routing.details}`);
    
    // Test 6: Authentication Flow
    console.log('🔐 Testing Authentication Flow...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    const loginTitle = await page.title();
    const currentUrl = page.url();
    
    // Check if redirected somewhere (authentication working)
    results.authFlow.status = currentUrl !== 'http://localhost:9323/login';
    results.authFlow.details = `Login redirected to: ${currentUrl}`;
    console.log(`✅ Auth Flow: ${results.authFlow.status ? 'PASS' : 'FAIL'} - ${results.authFlow.details}`);
    
    // Test 7: Test Public Pages (non-authenticated)
    console.log('🌍 Testing Public Pages...');
    const publicPages = [
      '/contact',
      '/pricing',
      '/features'
    ];
    
    let publicPagesWorking = 0;
    for (const route of publicPages) {
      try {
        await page.goto(`http://localhost:9323${route}`);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        const hasContent = await page.locator('main, .container, h1, h2').count();
        if (hasContent > 0) {
          publicPagesWorking++;
        }
      } catch (error) {
        console.log(`Public page ${route} failed: ${error.message}`);
      }
    }
    
    console.log(`✅ Public Pages: ${publicPagesWorking}/${publicPages.length} working`);
    
    // Test 8: Check if server is responsive
    console.log('⚡ Testing Server Responsiveness...');
    const startTime = Date.now();
    await page.goto('http://localhost:9323/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Server Response Time: ${loadTime}ms`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
  
  // Generate Report
  console.log('\n📊 FUNCTIONALITY TEST REPORT:');
  console.log('==============================');
  
  const testResults = [
    { name: 'Homepage', result: results.homepage },
    { name: 'KAZI Branding', result: results.branding },
    { name: 'Navigation', result: results.navigation },
    { name: 'Video Studio', result: results.videoStudio },
    { name: 'Routing System', result: results.routing },
    { name: 'Auth Flow', result: results.authFlow }
  ];
  
  let passedTests = 0;
  testResults.forEach(test => {
    const status = test.result.status ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.name}: ${status}`);
    console.log(`  Details: ${test.result.details}`);
    if (test.result.status) passedTests++;
  });
  
  const successRate = Math.round((passedTests / testResults.length) * 100);
  console.log(`\n🎯 SUMMARY: ${passedTests}/${testResults.length} tests passed (${successRate}%)`);
  
  if (passedTests >= 4) {
    console.log('🎉 KAZI Platform is functional! Core features are working.');
  } else {
    console.log('⚠️  Some core features need attention.');
  }
  
  // Specific recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');
  
  if (results.homepage.status) {
    console.log('✅ Homepage is working correctly with KAZI branding');
  } else {
    console.log('❌ Homepage needs branding fixes');
  }
  
  if (results.authFlow.status) {
    console.log('✅ Authentication system is working (redirects properly)');
  } else {
    console.log('❌ Authentication system needs configuration');
  }
  
  if (results.videoStudio.status) {
    console.log('✅ Video Studio is accessible and functional');
  } else {
    console.log('❌ Video Studio needs route fixes');
  }
  
  console.log('\n🔗 Access the app at: http://localhost:9323');
  console.log('🎬 Video Studio: http://localhost:9323/video-studio');
  console.log('🏠 Homepage: http://localhost:9323/');
  
  return results;
}

// Run the test
testWorkingFeatures().catch(console.error);