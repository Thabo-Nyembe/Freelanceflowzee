import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

/**
 * Full App Walkthrough - Showcasing the entire KAZI Platform
 * This test demonstrates all major features and pages of the application
 */
test.describe('KAZI Platform - Full App Showcase', () => {

  test('Complete App Walkthrough', async ({ page }) => {
    // Slow down actions so user can see what's happening
    test.slow();

    console.log('\n🚀 Starting KAZI Platform Showcase...\n');

    // ============================================
    // 1. HOMEPAGE
    // ============================================
    console.log('📍 1. Visiting Homepage...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/walkthrough-01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded\n');

    // ============================================
    // 2. FEATURES PAGE
    // ============================================
    console.log('📍 2. Exploring Features...');
    await page.goto(`${BASE_URL}/features`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-02-features.png', fullPage: true });
    console.log('✅ Features page loaded\n');

    // ============================================
    // 3. PRICING PAGE
    // ============================================
    console.log('📍 3. Checking Pricing...');
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-03-pricing.png', fullPage: true });
    console.log('✅ Pricing page loaded\n');

    // ============================================
    // 4. ABOUT PAGE
    // ============================================
    console.log('📍 4. About KAZI...');
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-04-about.png', fullPage: true });
    console.log('✅ About page loaded\n');

    // ============================================
    // 5. CONTACT PAGE
    // ============================================
    console.log('📍 5. Contact Page...');
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-05-contact.png', fullPage: true });
    console.log('✅ Contact page loaded\n');

    // ============================================
    // 6. LOGIN PAGE
    // ============================================
    console.log('📍 6. Login Page...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-06-login.png', fullPage: true });
    console.log('✅ Login page loaded\n');

    // ============================================
    // 7. SIGNUP PAGE
    // ============================================
    console.log('📍 7. Signup Page...');
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-07-signup.png', fullPage: true });
    console.log('✅ Signup page loaded\n');

    // ============================================
    // 8-15. DASHBOARD PAGES
    // ============================================
    const dashboardPages = [
      { name: 'Overview', path: '/dashboard/overview-v2' },
      { name: 'Projects', path: '/dashboard/projects-hub-v2' },
      { name: 'Calendar', path: '/dashboard/calendar-v2' },
      { name: 'Analytics', path: '/dashboard/analytics-v2' },
      { name: 'Files', path: '/dashboard/files-hub-v2' },
      { name: 'Messages', path: '/dashboard/messages-v2' },
      { name: 'Invoices', path: '/dashboard/invoices-v2' },
      { name: 'Settings', path: '/dashboard/settings-v2' },
    ];

    let pageNum = 8;
    for (const dashPage of dashboardPages) {
      console.log(`📍 ${pageNum}. Dashboard - ${dashPage.name}...`);
      await page.goto(`${BASE_URL}${dashPage.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `test-results/walkthrough-${String(pageNum).padStart(2, '0')}-dashboard-${dashPage.name.toLowerCase()}.png`,
        fullPage: true
      });
      console.log(`✅ Dashboard ${dashPage.name} loaded\n`);
      pageNum++;
    }

    // ============================================
    // 16-20. MORE V2 DASHBOARD PAGES
    // ============================================
    const morePages = [
      { name: 'CRM', path: '/dashboard/crm-v2' },
      { name: 'Team', path: '/dashboard/team-hub-v2' },
      { name: 'Reporting', path: '/dashboard/reporting-v2' },
      { name: 'Notifications', path: '/dashboard/notifications-v2' },
      { name: 'Profile', path: '/dashboard/profile-v2' },
    ];

    for (const morePage of morePages) {
      console.log(`📍 ${pageNum}. Dashboard - ${morePage.name}...`);
      await page.goto(`${BASE_URL}${morePage.path}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `test-results/walkthrough-${String(pageNum).padStart(2, '0')}-dashboard-${morePage.name.toLowerCase()}.png`,
        fullPage: true
      });
      console.log(`✅ Dashboard ${morePage.name} loaded\n`);
      pageNum++;
    }

    // ============================================
    // DARK MODE SHOWCASE
    // ============================================
    console.log('📍 Showcasing Dark Mode...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-dark-homepage.png', fullPage: true });
    console.log('✅ Dark mode homepage\n');

    await page.goto(`${BASE_URL}/dashboard/overview-v2`);
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-dark-dashboard.png', fullPage: true });
    console.log('✅ Dark mode dashboard\n');

    // ============================================
    // MOBILE RESPONSIVE SHOWCASE
    // ============================================
    console.log('📍 Showcasing Mobile View...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-mobile-homepage.png', fullPage: true });
    console.log('✅ Mobile homepage\n');

    await page.goto(`${BASE_URL}/dashboard/overview-v2`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-mobile-dashboard.png', fullPage: true });
    console.log('✅ Mobile dashboard\n');

    // ============================================
    // TABLET RESPONSIVE SHOWCASE
    // ============================================
    console.log('📍 Showcasing Tablet View...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-tablet-homepage.png', fullPage: true });
    console.log('✅ Tablet homepage\n');

    await page.goto(`${BASE_URL}/dashboard/overview-v2`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/walkthrough-tablet-dashboard.png', fullPage: true });
    console.log('✅ Tablet dashboard\n');

    console.log('🎉 KAZI Platform Showcase Complete!\n');
    console.log('📸 Screenshots saved to test-results/ folder\n');
  });
});
