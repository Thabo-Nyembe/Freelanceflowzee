import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

// Demo users for investor presentation
const demoUsers = [
  {
    email: 'sarah@techstartup.io',
    password: 'Demo2025',
    name: 'Sarah Mitchell',
    role: 'Startup Founder',
    tier: 'new-user',
    description: 'New user exploring the platform'
  },
  {
    email: 'marcus@designstudio.co',
    password: 'Demo2025',
    name: 'Marcus Johnson',
    role: 'Design Agency Owner',
    tier: 'power-user',
    description: 'Power user with full platform usage'
  },
  {
    email: 'alex@freeflow.io',
    password: 'Demo123!',
    name: 'Alex Thompson',
    role: 'Platform Admin',
    tier: 'admin',
    description: 'Admin user with full access'
  }
];

// Key pages to showcase
const showcasePages = [
  { path: '/dashboard/overview-v2', name: 'Dashboard Overview', description: 'Central hub with AI insights' },
  { path: '/dashboard/my-day-v2', name: 'My Day', description: 'AI-powered daily planning' },
  { path: '/dashboard/projects-hub-v2', name: 'Projects Hub', description: 'Project management' },
  { path: '/dashboard/ai-create-v2', name: 'AI Create Studio', description: 'Multi-model AI generation' },
  { path: '/dashboard/video-studio-v2', name: 'Video Studio', description: 'Video editing & AI transcription' },
  { path: '/dashboard/analytics-v2', name: 'Analytics', description: 'Business intelligence' },
  { path: '/dashboard/files-hub-v2', name: 'Files Hub', description: 'Multi-cloud storage' },
  { path: '/dashboard/messages-v2', name: 'Messages', description: 'Communication hub' },
  { path: '/dashboard/calendar-v2', name: 'Calendar', description: 'Scheduling & bookings' },
  { path: '/dashboard/financial-v2', name: 'Financial', description: 'Invoicing & payments' },
  { path: '/dashboard/clients-v2', name: 'Clients', description: 'CRM & client management' },
  { path: '/dashboard/community-v2', name: 'Community', description: 'Professional networking' }
];

test.describe('KAZI Platform - Investor Visual Demo', () => {

  test.beforeEach(async ({ page }) => {
    // Set a longer timeout for visual tests
    test.setTimeout(180000);
  });

  for (const user of demoUsers) {
    test(`${user.name} (${user.role}) - Complete Platform Tour`, async ({ page }) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`INVESTOR DEMO: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Description: ${user.description}`);
      console.log(`${'='.repeat(60)}\n`);

      // Step 1: Login
      console.log('Step 1: Login Experience');
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `test-results/investor-demo/${user.tier}/01-login-page.png`,
        fullPage: true
      });
      console.log('  Screenshot: Login page captured');

      // Fill credentials
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);

      await page.screenshot({
        path: `test-results/investor-demo/${user.tier}/02-login-filled.png`,
        fullPage: true
      });

      // Submit login
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      try {
        await page.waitForURL('**/dashboard**', { timeout: 30000 });
        await page.waitForLoadState('networkidle');
        console.log(`  Login successful for ${user.name}`);
      } catch (e) {
        console.log(`  Login redirect pending...`);
        await page.waitForTimeout(3000);
      }

      await page.screenshot({
        path: `test-results/investor-demo/${user.tier}/03-dashboard-landing.png`,
        fullPage: true
      });
      console.log('  Screenshot: Dashboard landing captured');

      // Step 2: Tour key pages
      console.log('\nStep 2: Platform Tour');
      let pageNum = 4;

      for (const pageInfo of showcasePages) {
        console.log(`  Visiting: ${pageInfo.name}`);

        try {
          await page.goto(`${BASE_URL}${pageInfo.path}`, { timeout: 15000 });
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(1500); // Allow animations to complete

          // Take screenshot in light mode
          await page.screenshot({
            path: `test-results/investor-demo/${user.tier}/${String(pageNum).padStart(2, '0')}-${pageInfo.path.split('/').pop()}-light.png`,
            fullPage: true
          });

          // Toggle to dark mode
          const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], [data-testid="theme-toggle"]').first();
          if (await themeToggle.isVisible().catch(() => false)) {
            await themeToggle.click();
            await page.waitForTimeout(500);

            await page.screenshot({
              path: `test-results/investor-demo/${user.tier}/${String(pageNum).padStart(2, '0')}-${pageInfo.path.split('/').pop()}-dark.png`,
              fullPage: true
            });

            // Toggle back to light
            await themeToggle.click();
          }

          console.log(`    ${pageInfo.name} - ${pageInfo.description}`);
          pageNum++;
        } catch (e) {
          console.log(`    Skipped: ${pageInfo.name} (timeout)`);
        }
      }

      // Step 3: Interactive elements demo
      console.log('\nStep 3: Interactive Elements');

      // Show sidebar navigation
      await page.goto(`${BASE_URL}/dashboard/overview-v2`);
      await page.waitForLoadState('domcontentloaded');

      // Count interactive elements
      const buttons = await page.locator('button:visible').count();
      const links = await page.locator('a:visible').count();
      const inputs = await page.locator('input:visible, textarea:visible').count();

      console.log(`  Interactive elements found:`);
      console.log(`    - Buttons: ${buttons}`);
      console.log(`    - Links: ${links}`);
      console.log(`    - Input fields: ${inputs}`);

      // Final summary screenshot
      await page.screenshot({
        path: `test-results/investor-demo/${user.tier}/99-final-summary.png`,
        fullPage: true
      });

      console.log(`\n${user.name}'s tour complete!`);
      console.log(`Screenshots saved to: test-results/investor-demo/${user.tier}/`);
    });
  }

  test('Platform Feature Summary - All Users', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('KAZI PLATFORM - INVESTOR SUMMARY');
    console.log('='.repeat(60));

    // Visit homepage
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/investor-demo/summary/01-homepage.png',
      fullPage: true
    });

    // Visit pricing
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/investor-demo/summary/02-pricing.png',
      fullPage: true
    });

    // Visit features
    await page.goto(`${BASE_URL}/features`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/investor-demo/summary/03-features.png',
      fullPage: true
    });

    console.log('\nPlatform Highlights:');
    console.log('  - All-in-one freelance business platform');
    console.log('  - AI-powered features across the platform');
    console.log('  - Real-time collaboration tools');
    console.log('  - Multi-cloud file storage');
    console.log('  - Integrated invoicing & payments');
    console.log('  - Professional video studio');
    console.log('  - Client portal & CRM');
    console.log('  - Community & networking');

    console.log('\nScreenshots saved to: test-results/investor-demo/summary/');
  });
});
