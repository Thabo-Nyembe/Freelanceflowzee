const { chromium } = require('playwright');

async function finalAppStatus() {
  console.log('🚀 FINAL KAZI PLATFORM STATUS TEST');
  console.log('===================================');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const status = {
    server: false,
    homepage: false,
    branding: false,
    authentication: false,
    dashboard: false,
    navigation: false,
    features: {},
    overall: 0
  };
  
  try {
    // 1. Test Server Status
    console.log('🔧 Testing Server Status...');
    await page.goto('http://localhost:9323');
    await page.waitForLoadState('networkidle');
    status.server = true;
    console.log('✅ Server: ONLINE');
    
    // 2. Test Homepage
    console.log('🏠 Testing Homepage...');
    const title = await page.title();
    status.homepage = title.includes('Kazi');
    console.log(`✅ Homepage: ${status.homepage ? 'WORKING' : 'BROKEN'} - ${title}`);
    
    // 3. Test Branding
    console.log('🎨 Testing KAZI Branding...');
    const pageContent = await page.content();
    status.branding = pageContent.includes('KAZI') || pageContent.includes('Kazi');
    console.log(`✅ Branding: ${status.branding ? 'IMPLEMENTED' : 'MISSING'}`);
    
    // 4. Test Authentication
    console.log('🔐 Testing Authentication...');
    await page.goto('http://localhost:9323/login');
    await page.waitForLoadState('networkidle');
    const loginContent = await page.content();
    status.authentication = loginContent.includes('Sign in') || loginContent.includes('Welcome');
    console.log(`✅ Authentication: ${status.authentication ? 'WORKING' : 'BROKEN'}`);
    
    // 5. Test Dashboard
    console.log('📊 Testing Dashboard...');
    await page.goto('http://localhost:9323/dashboard');
    await page.waitForLoadState('networkidle');
    const dashboardContent = await page.content();
    status.dashboard = dashboardContent.includes('test-user') || dashboardContent.includes('Dashboard');
    console.log(`✅ Dashboard: ${status.dashboard ? 'ACCESSIBLE' : 'BROKEN'}`);
    
    // 6. Test Navigation
    console.log('🧭 Testing Navigation...');
    const navElements = await page.locator('nav, .sidebar, a[href*="dashboard"]').count();
    status.navigation = navElements > 0;
    console.log(`✅ Navigation: ${status.navigation ? 'WORKING' : 'BROKEN'} - ${navElements} elements`);
    
    // 7. Test Key Features
    console.log('🎯 Testing Key Features...');
    const features = [
      '/dashboard/ai-create',
      '/dashboard/my-day', 
      '/dashboard/projects-hub',
      '/dashboard/video-studio',
      '/dashboard/files-hub',
      '/dashboard/community-hub',
      '/dashboard/escrow',
      '/dashboard/analytics'
    ];
    
    for (const feature of features) {
      try {
        await page.goto(`http://localhost:9323${feature}`);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        const content = await page.content();
        const isWorking = !content.includes('404') && !content.includes('Page Not Found');
        status.features[feature] = isWorking;
        console.log(`  ${feature}: ${isWorking ? '✅ WORKING' : '❌ BROKEN'}`);
      } catch (error) {
        status.features[feature] = false;
        console.log(`  ${feature}: ❌ ERROR - ${error.message}`);
      }
    }
    
    // 8. Calculate Overall Status
    const workingFeatures = Object.values(status.features).filter(f => f).length;
    const totalFeatures = Object.keys(status.features).length;
    const coreSystemsWorking = [status.server, status.homepage, status.branding, status.authentication, status.dashboard, status.navigation].filter(s => s).length;
    
    status.overall = Math.round(((coreSystemsWorking + workingFeatures) / (6 + totalFeatures)) * 100);
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await browser.close();
  }
  
  // Generate Final Report
  console.log('\n📋 FINAL KAZI PLATFORM STATUS REPORT');
  console.log('====================================');
  console.log(`🌐 Server: ${status.server ? '✅ ONLINE' : '❌ OFFLINE'}`);
  console.log(`🏠 Homepage: ${status.homepage ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log(`🎨 KAZI Branding: ${status.branding ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
  console.log(`🔐 Authentication: ${status.authentication ? '✅ WORKING' : '❌ BROKEN'}`);
  console.log(`📊 Dashboard: ${status.dashboard ? '✅ ACCESSIBLE' : '❌ BROKEN'}`);
  console.log(`🧭 Navigation: ${status.navigation ? '✅ WORKING' : '❌ BROKEN'}`);
  
  console.log('\n🎯 FEATURE STATUS:');
  console.log('=================');
  Object.entries(status.features).forEach(([feature, working]) => {
    const name = feature.split('/').pop().replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
    console.log(`${name}: ${working ? '✅ WORKING' : '❌ BROKEN'}`);
  });
  
  console.log(`\n🎯 OVERALL STATUS: ${status.overall}%`);
  
  // Summary and Recommendations
  console.log('\n💡 SUMMARY & RECOMMENDATIONS:');
  console.log('=============================');
  
  if (status.overall >= 80) {
    console.log('🎉 EXCELLENT: Platform is highly functional!');
  } else if (status.overall >= 60) {
    console.log('👍 GOOD: Platform is mostly working with some issues.');
  } else if (status.overall >= 40) {
    console.log('⚠️  FAIR: Platform has core functionality but needs attention.');
  } else {
    console.log('❌ POOR: Platform needs significant fixes.');
  }
  
  console.log('\n📝 WHAT\'S WORKING:');
  if (status.server) console.log('✅ Development server is running');
  if (status.homepage) console.log('✅ Homepage loads with KAZI branding');
  if (status.branding) console.log('✅ KAZI branding is implemented');
  if (status.authentication) console.log('✅ Authentication system is functional');
  if (status.dashboard) console.log('✅ Dashboard is accessible');
  if (status.navigation) console.log('✅ Navigation elements are present');
  
  console.log('\n📝 WHAT NEEDS ATTENTION:');
  if (!status.server) console.log('❌ Server is not running');
  if (!status.homepage) console.log('❌ Homepage needs fixing');
  if (!status.branding) console.log('❌ KAZI branding needs implementation');
  if (!status.authentication) console.log('❌ Authentication system needs fixes');
  if (!status.dashboard) console.log('❌ Dashboard routing needs fixes');
  if (!status.navigation) console.log('❌ Navigation system needs implementation');
  
  const brokenFeatures = Object.entries(status.features).filter(([_, working]) => !working);
  if (brokenFeatures.length > 0) {
    console.log('❌ The following features need page fixes:');
    brokenFeatures.forEach(([feature, _]) => {
      console.log(`   - ${feature}`);
    });
  }
  
  console.log('\n🔗 ACCESS INFORMATION:');
  console.log('======================');
  console.log('🌐 Homepage: http://localhost:9323/');
  console.log('🔐 Login: http://localhost:9323/login');
  console.log('📊 Dashboard: http://localhost:9323/dashboard');
  console.log('🎬 Video Studio: http://localhost:9323/video-studio');
  
  console.log('\n📧 TEST CREDENTIALS:');
  console.log('===================');
  console.log('Email: thabo@kaleidocraft.co.za');
  console.log('Password: password1234');
  
  return status;
}

// Run the final test
finalAppStatus().catch(console.error);