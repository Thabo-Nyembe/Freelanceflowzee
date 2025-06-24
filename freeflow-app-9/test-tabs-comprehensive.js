const { chromium } = require('playwright');

(async () => {
  console.log('🧪 STARTING COMPREHENSIVE TAB TESTING WITH PLAYWRIGHT MCP');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const testPages = [
    { name: 'Projects Hub', url: '/dashboard/projects-hub', expectedTabs: ['Overview', 'Project Tracking', 'Collaboration', 'Client Galleries'] },
    { name: 'AI Create', url: '/dashboard/ai-create', expectedTabs: ['Create', 'Library', 'Settings'] },
    { name: 'Files Hub', url: '/dashboard/files-hub', expectedTabs: ['Overview', 'Cloud Storage', 'Portfolio Gallery'] },
    { name: 'Analytics', url: '/dashboard/analytics', expectedTabs: ['Overview', 'Revenue', 'Projects', 'Time'] },
    { name: 'My Day Today', url: '/dashboard/my-day', expectedTabs: ['Today\'s Tasks', 'Time Blocks', 'AI Insights', 'Analytics'] },
    { name: 'Video Studio', url: '/dashboard/video-studio', expectedTabs: [] },
    { name: 'Escrow System', url: '/dashboard/escrow', expectedTabs: [] },
    { name: 'AI Assistant', url: '/dashboard/ai-assistant', expectedTabs: [] },
    { name: 'Community Hub', url: '/dashboard/community-hub', expectedTabs: [] }
  ];
  
  const results = [];
  
  for (const testPage of testPages) {
    try {
      console.log(`\n📍 Testing: ${testPage.name}`);
      
      await page.goto(`http://localhost:3000${testPage.url}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Check if tabs exist
      const tabList = await page.$('[role="tablist"]');
      const tabsFound = tabList ? await page.$$('[role="tab"]') : [];
      
      const result = {
        page: testPage.name,
        url: testPage.url,
        expectedTabs: testPage.expectedTabs.length,
        actualTabs: tabsFound.length,
        status: 'PASS',
        details: [],
        tabTexts: []
      };
      
      if (tabsFound.length > 0) {
        for (let i = 0; i < tabsFound.length; i++) {
          const tabText = await tabsFound[i].textContent();
          const cleanText = tabText?.trim() || `Tab ${i+1}`;
          result.tabTexts.push(cleanText);
          result.details.push(`Tab ${i+1}: ${cleanText}`);
        }
      } else {
        result.details.push('No tabs found');
      }
      
      // Determine status
      if (testPage.expectedTabs.length > 0 && tabsFound.length === 0) {
        result.status = 'MISSING_TABS';
      } else if (testPage.expectedTabs.length === 0 && tabsFound.length > 0) {
        result.status = 'UNEXPECTED_TABS';
      } else if (testPage.expectedTabs.length > 0 && tabsFound.length !== testPage.expectedTabs.length) {
        result.status = 'TAB_COUNT_MISMATCH';
      }
      
      results.push(result);
      console.log(`✅ ${testPage.name}: ${tabsFound.length} tabs found`);
      
    } catch (error) {
      results.push({
        page: testPage.name,
        url: testPage.url,
        status: 'ERROR',
        error: error.message
      });
      console.log(`❌ ${testPage.name}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n🎉 TAB TESTING COMPLETE! Summary:`);
  console.log('==========================================');
  
  let hasIssues = false;
  
  results.forEach(result => {
    console.log(`\n📄 ${result.page}:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Expected: ${result.expectedTabs || 'Variable'} tabs`);
    console.log(`   Actual: ${result.actualTabs || 0} tabs`);
    
    if (result.status !== 'PASS') {
      hasIssues = true;
    }
    
    if (result.tabTexts && result.tabTexts.length > 0) {
      console.log(`   Found tabs: ${result.tabTexts.join(', ')}`);
    }
    
    if (result.details) {
      result.details.forEach(detail => console.log(`   - ${detail}`));
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📊 FINAL RESULTS:`);
  console.log(`   ✅ Pages with working tabs: ${results.filter(r => r.status === 'PASS' || r.status === 'UNEXPECTED_TABS').length}`);
  console.log(`   ❌ Pages with missing tabs: ${results.filter(r => r.status === 'MISSING_TABS').length}`);
  console.log(`   ⚠️  Pages with tab mismatches: ${results.filter(r => r.status === 'TAB_COUNT_MISMATCH').length}`);
  console.log(`   💥 Pages with errors: ${results.filter(r => r.status === 'ERROR').length}`);
  
  if (!hasIssues) {
    console.log(`\n🎊 ALL TABS ARE WORKING PERFECTLY! 🎊`);
  } else {
    console.log(`\n🔧 SOME TABS NEED ATTENTION`);
  }
  
  await browser.close();
})().catch(console.error); 