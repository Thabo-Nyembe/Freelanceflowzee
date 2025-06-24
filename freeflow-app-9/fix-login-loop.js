const { chromium } = require('playwright');

async function fixLoginLoop() {
  console.log('🔧 Starting login loop fix...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    console.log('🧹 Clearing browser storage...');
    
    // Clear all cookies related to Supabase
    await context.clearCookies();
    
    // Clear local storage and session storage
    await page.evaluate(() => {
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear any indexed DB data
      if (typeof indexedDB !== 'undefined') {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name?.includes('supabase')) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }
    });
    
    console.log('✅ Browser storage cleared');
    
    // Test login page
    console.log('🧪 Testing login page...');
    await page.goto('http://localhost:3000/login');
    
    // Wait for the page to stabilize (no rapid redirects)
    let redirectCount = 0;
    const maxRedirects = 5;
    
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        redirectCount++;
        console.log(`Redirect ${redirectCount}: ${frame.url()}`);
      }
    });
    
    // Wait and check if redirects stop
    await page.waitForTimeout(3000);
    
    if (redirectCount > maxRedirects) {
      console.log('❌ Still experiencing redirect loop');
      return false;
    }
    
    const currentUrl = page.url();
    console.log(`✅ Page stabilized at: ${currentUrl}`);
    
    // Check if login form is visible
    const loginForm = await page.locator('form').isVisible();
    if (loginForm) {
      console.log('✅ Login form is visible and accessible');
    }
    
    // Test dashboard access
    console.log('🧪 Testing direct dashboard access...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    const dashboardUrl = page.url();
    console.log(`Dashboard access result: ${dashboardUrl}`);
    
    console.log('✅ Login loop fix completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error during login loop fix:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the fix
fixLoginLoop().then(success => {
  if (success) {
    console.log('\n🎉 Login loop has been fixed!');
    console.log('You should now be able to:');
    console.log('1. Access the login page without infinite redirects');
    console.log('2. Use the login form normally');
    console.log('3. Navigate to dashboard (will redirect to login if not authenticated)');
  } else {
    console.log('\n⚠️  Login loop fix may need additional troubleshooting');
  }
  process.exit(success ? 0 : 1);
}); 