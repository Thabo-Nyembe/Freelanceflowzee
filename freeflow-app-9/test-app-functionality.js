const { chromium } = require('playwright');

async function testAppFunctionality() {
  console.log('🚀 Starting comprehensive KAZI platform test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    homepage: false,
    login: false,
    dashboard: false,
    navigation: false,
    features: {
      aiCreate: false,
      myDay: false,
      projectsHub: false,
      communityHub: false,
      filesHub: false,
      videoStudio: false,
      escrow: false,
      analytics: false
    },
    branding: false,
    responsive: false
  };
  
  try {
    // Test Homepage
    console.log('📱 Testing Homepage...');
    await page.goto('http://localhost:9323');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`Homepage title: ${title}`);
    testResults.homepage = title.includes('Kazi');
    
    // Check for KAZI branding
    const kaziElements = await page.locator('text=KAZI').count();
    const builtInAfrica = await page.locator('text=Built in Africa').count();
    testResults.branding = kaziElements > 0 || builtInAfrica > 0;
    console.log(`✅ Homepage loaded: ${testResults.homepage}`);
    console.log(`✅ KAZI branding found: ${testResults.branding}`);
    
    // Test Login
    console.log('🔐 Testing Login...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('thabo@kaleidocraft.co.za');
      await passwordInput.fill('password1234');
      
      // Submit login
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        // Check if redirected to dashboard
        const currentUrl = page.url();
        testResults.login = currentUrl.includes('/dashboard') || currentUrl.includes('/app');
        console.log(`✅ Login successful: ${testResults.login}`);
      } else {
        console.log('❌ Login button not found');
      }
    } else {
      console.log('❌ Login form not found');
    }
    
    // Test Dashboard
    console.log('📊 Testing Dashboard...');
    await page.goto('http://localhost:9323/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard elements
    const dashboardTitle = await page.locator('h1:has-text("Welcome"), h1:has-text("KAZI"), h1:has-text("Dashboard")').count();
    const sidebar = await page.locator('nav, .sidebar, [role="navigation"]').count();
    testResults.dashboard = dashboardTitle > 0 || sidebar > 0;
    console.log(`✅ Dashboard loaded: ${testResults.dashboard}`);
    
    // Test Navigation
    console.log('🧭 Testing Navigation...');
    const navItems = await page.locator('a[href*="dashboard"], nav a, .sidebar a').count();
    testResults.navigation = navItems > 0;
    console.log(`✅ Navigation items found: ${navItems}`);
    
    // Test Individual Features
    const features = [
      { name: 'AI Create', url: '/dashboard/ai-create', key: 'aiCreate' },
      { name: 'My Day', url: '/dashboard/my-day', key: 'myDay' },
      { name: 'Projects Hub', url: '/dashboard/projects-hub', key: 'projectsHub' },
      { name: 'Community Hub', url: '/dashboard/community-hub', key: 'communityHub' },
      { name: 'Files Hub', url: '/dashboard/files-hub', key: 'filesHub' },
      { name: 'Video Studio', url: '/dashboard/video-studio', key: 'videoStudio' },
      { name: 'Escrow', url: '/dashboard/escrow', key: 'escrow' },
      { name: 'Analytics', url: '/dashboard/analytics', key: 'analytics' }
    ];
    
    for (const feature of features) {
      try {
        console.log(`🔍 Testing ${feature.name}...`);
        await page.goto(`http://localhost:9323${feature.url}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Check if page loaded successfully
        const hasContent = await page.locator('main, .container, .content, h1, h2').count();
        const notFoundPage = await page.locator('text=404, text="Not Found"').count();
        
        testResults.features[feature.key] = hasContent > 0 && notFoundPage === 0;
        console.log(`✅ ${feature.name}: ${testResults.features[feature.key]}`);
      } catch (error) {
        console.log(`❌ ${feature.name}: Error - ${error.message}`);
        testResults.features[feature.key] = false;
      }
    }
    
    // Test Responsive Design
    console.log('📱 Testing Responsive Design...');
    await page.goto('http://localhost:9323/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileMenu = await page.locator('.mobile-menu, [aria-label*="menu"], button:has-text("Menu")').count();
    const responsiveElements = await page.locator('.responsive, .mobile, .tablet, .desktop').count();
    
    testResults.responsive = mobileMenu > 0 || responsiveElements > 0;
    console.log(`✅ Responsive design: ${testResults.responsive}`);
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
  
  // Generate Report
  console.log('\n📋 TEST RESULTS SUMMARY:');
  console.log('========================');
  console.log(`Homepage: ${testResults.homepage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Login: ${testResults.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dashboard: ${testResults.dashboard ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Navigation: ${testResults.navigation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`KAZI Branding: ${testResults.branding ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Responsive: ${testResults.responsive ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🎯 FEATURE TESTS:');
  console.log('================');
  Object.entries(testResults.features).forEach(([key, value]) => {
    const featureName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${featureName}: ${value ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const totalTests = Object.keys(testResults).length - 1 + Object.keys(testResults.features).length;
  const passedTests = Object.values(testResults).filter(v => typeof v === 'boolean' && v).length + 
                     Object.values(testResults.features).filter(v => v).length;
  
  console.log(`\n🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! App is fully functional.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  return testResults;
}

// Run the test
testAppFunctionality().catch(console.error);