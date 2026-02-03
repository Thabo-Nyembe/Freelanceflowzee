import puppeteer from 'puppeteer';

const DEMO_URL = 'http://localhost:9323';
const DEMO_EMAIL = 'alex@freeflow.io';
const DEMO_PASSWORD = 'investor2026';

const pages = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'CRM', url: '/dashboard/crm-v2' },
  { name: 'Projects', url: '/dashboard/projects-v2' },
  { name: 'Invoices', url: '/dashboard/invoices-v2' },
  { name: 'Leads', url: '/dashboard/leads-v2' },
  { name: 'Financial Reports', url: '/dashboard/financial-reports-v2' },
  { name: 'AI Assistant', url: '/dashboard/ai-assistant-v2' },
  { name: 'Team', url: '/dashboard/team-v2' }
];

async function testDemoLogin() {
  console.log('🚀 Testing KAZI Investor Demo\n');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Step 1: Navigate to app
    console.log('\n📱 Step 1: Navigating to app...');
    await page.goto(DEMO_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    const initialUrl = page.url();
    console.log(`   Current URL: ${initialUrl}`);

    // Step 2: Check if login page
    const hasEmailInput = await page.$('input[type="email"]');
    const hasPasswordInput = await page.$('input[type="password"]');

    if (hasEmailInput && hasPasswordInput) {
      console.log('\n🔐 Step 2: Login page detected, attempting login...');

      // Type credentials slowly to avoid issues
      await page.type('input[type="email"]', DEMO_EMAIL, { delay: 50 });
      console.log(`   ✓ Entered email: ${DEMO_EMAIL}`);

      await page.type('input[type="password"]', DEMO_PASSWORD, { delay: 50 });
      console.log(`   ✓ Entered password: ${'*'.repeat(DEMO_PASSWORD.length)}`);

      // Find and click submit
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        console.log('   ✓ Found submit button, clicking...');
        await submitButton.click();

        // Wait for navigation
        try {
          await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
        } catch (e) {
          console.log('   ⚠️  Navigation timeout (may be normal), continuing...');
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

        const afterLoginUrl = page.url();
        console.log(`   ✓ After login URL: ${afterLoginUrl}`);

        // Check if still on login (failed) or redirected (success)
        if (afterLoginUrl.includes('/login') || afterLoginUrl.includes('/auth')) {
          console.log('\n❌ LOGIN FAILED - Still on login page');

          // Check for error messages
          const errorMsg = await page.evaluate(() => {
            const errors = Array.from(document.querySelectorAll('[role="alert"], .error, .text-red-500'));
            return errors.map(e => e.textContent).join('; ');
          });

          if (errorMsg) {
            console.log(`   Error message: ${errorMsg}`);
          }

          return;
        } else {
          console.log('\n✅ LOGIN SUCCESSFUL\n');
        }
      } else {
        console.log('\n❌ Submit button not found');
        return;
      }
    } else {
      console.log('\n✅ Already authenticated or no login required\n');
    }

    // Step 3: Test key pages
    console.log('📊 Step 3: Testing key demo pages...\n');
    console.log('='.repeat(60));

    let successCount = 0;
    let failCount = 0;

    for (const testPage of pages) {
      try {
        const fullUrl = `${DEMO_URL}${testPage.url}`;
        await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for errors
        const pageInfo = await page.evaluate(() => {
          const hasError = document.body.innerText.toLowerCase().includes('error') ||
                          document.body.innerText.includes('404') ||
                          document.body.innerText.toLowerCase().includes('not found') ||
                          document.body.innerText.toLowerCase().includes('something went wrong');

          const title = document.title || 'Untitled';
          const hasContent = document.body.innerText.length > 100;

          return { hasError, title, hasContent };
        });

        if (pageInfo.hasError) {
          console.log(`⚠️  ${testPage.name.padEnd(25)} - Has error content`);
          failCount++;
        } else if (!pageInfo.hasContent) {
          console.log(`⚠️  ${testPage.name.padEnd(25)} - No content loaded`);
          failCount++;
        } else {
          console.log(`✅ ${testPage.name.padEnd(25)} - OK`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ ${testPage.name.padEnd(25)} - Failed: ${error.message.slice(0, 40)}`);
        failCount++;
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEMO TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Pages Tested: ${pages.length}`);
    console.log(`✅ Successful: ${successCount} (${Math.round(successCount/pages.length*100)}%)`);
    console.log(`❌ Failed: ${failCount} (${Math.round(failCount/pages.length*100)}%)`);

    if (successCount === pages.length) {
      console.log('\n🎉 ALL PAGES WORKING - READY FOR INVESTOR DEMO!');
    } else if (successCount >= pages.length * 0.8) {
      console.log('\n⚠️  MOSTLY WORKING - Minor issues to check');
    } else {
      console.log('\n❌ ISSUES DETECTED - Review failed pages');
    }

    console.log('\n✅ Login Credentials Verified:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: investor2026`);
    console.log(`   URL: ${DEMO_URL}\n`);

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testDemoLogin().catch(console.error);
