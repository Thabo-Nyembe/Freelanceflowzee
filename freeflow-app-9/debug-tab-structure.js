const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING TAB STRUCTURE ACROSS DASHBOARD PAGES');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const testPages = [
    'analytics', 'projects-hub', 'ai-create', 'files-hub', 'my-day', 
    'video-studio', 'escrow', 'ai-assistant', 'community-hub'
  ];
  
  for (const pageName of testPages) {
    try {
      console.log(`\n📍 Examining: ${pageName}`);
      
      await page.goto(`http://localhost:3000/dashboard/${pageName}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000); // Give it more time to load
      
      // Check for various tab selectors
      const tabSelectors = [
        '[role="tablist"]',
        '.tab-list',
        '.tabs-list',
        '.tablist',
        '[data-tabs]',
        'div[role="tablist"]'
      ];
      
      let tabsFound = false;
      let tabDetails = [];
      
      for (const selector of tabSelectors) {
        const tabList = await page.$(selector);
        if (tabList) {
          tabsFound = true;
          console.log(`  ✅ Found tablist with selector: ${selector}`);
          
          // Get all tabs within this tablist
          const tabs = await page.$$(`${selector} [role="tab"]`);
          const buttons = await page.$$(`${selector} button`);
          const elements = tabs.length > 0 ? tabs : buttons;
          
          if (elements.length > 0) {
            console.log(`  📋 Found ${elements.length} tabs:`);
            for (let i = 0; i < elements.length; i++) {
              const text = await elements[i].textContent();
              const cleanText = text?.trim() || `Tab ${i+1}`;
              console.log(`    ${i+1}. "${cleanText}"`);
              tabDetails.push(cleanText);
            }
          }
          break; // Found tabs, no need to check other selectors
        }
      }
      
      if (!tabsFound) {
        // Check for any clickable elements that might be tab-like
        const potentialTabs = await page.$$('button[data-value], button[aria-selected], .tab-trigger, .tab-button');
        if (potentialTabs.length > 0) {
          console.log(`  🤔 Found ${potentialTabs.length} potential tab elements:`);
          for (let i = 0; i < potentialTabs.length; i++) {
            const text = await potentialTabs[i].textContent();
            const cleanText = text?.trim() || `Element ${i+1}`;
            console.log(`    ${i+1}. "${cleanText}"`);
          }
        } else {
          console.log(`  ❌ No tabs found on ${pageName}`);
        }
      }
      
      // Check if there are any tab content areas
      const tabPanels = await page.$$('[role="tabpanel"], .tab-content, .tabs-content');
      if (tabPanels.length > 0) {
        console.log(`  📄 Found ${tabPanels.length} tab content areas`);
      }
      
    } catch (error) {
      console.log(`  💥 Error on ${pageName}: ${error.message}`);
    }
  }
  
  console.log(`\n🎯 DEBUGGING COMPLETE!`);
  await browser.close();
})().catch(console.error); 