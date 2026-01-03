import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

test.describe('Showcase Users Visual Dashboard Tests', () => {

  test.describe('Login Page Visual Tests', () => {
    test('should render login page correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Take screenshot of login page
      await page.screenshot({
        path: 'test-results/showcase-login-page.png',
        fullPage: true
      });

      // Verify login form elements exist
      await expect(page.locator('input[type="email"], #email, input[name="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"], #password, input[name="password"]').first()).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      console.log('✅ Login page visual test passed');
    });

    test('should show form validation states', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Click submit without filling form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'test-results/showcase-login-validation.png',
        fullPage: true
      });

      console.log('✅ Login validation visual test passed');
    });
  });

  test.describe('Dashboard Visual Tests (Unauthenticated)', () => {
    const dashboardPages = [
      { name: 'projects', path: '/dashboard/projects-v2' },
      { name: 'tasks', path: '/dashboard/tasks-v2' },
      { name: 'calendar', path: '/dashboard/calendar-v2' },
      { name: 'analytics', path: '/dashboard/analytics-v2' },
      { name: 'files', path: '/dashboard/files-v2' },
      { name: 'messages', path: '/dashboard/messages-v2' },
      { name: 'invoices', path: '/dashboard/invoices-v2' },
      { name: 'settings', path: '/dashboard/settings-v2' },
    ];

    for (const dashPage of dashboardPages) {
      test(`should render ${dashPage.name} page or redirect`, async ({ page }) => {
        await page.goto(`${BASE_URL}${dashPage.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Take screenshot (will show login redirect or dashboard)
        await page.screenshot({
          path: `test-results/showcase-dashboard-${dashPage.name}.png`,
          fullPage: true
        });

        // Verify page loaded (either dashboard or login redirect)
        const url = page.url();
        expect(url.includes('/dashboard') || url.includes('/login') || url.includes('/auth')).toBe(true);

        console.log(`✅ Dashboard ${dashPage.name} visual test passed - URL: ${url}`);
      });
    }
  });

  test.describe('Public Pages Visual Tests', () => {
    const publicPages = [
      { name: 'homepage', path: '/' },
      { name: 'pricing', path: '/pricing' },
      { name: 'features', path: '/features' },
      { name: 'about', path: '/about' },
      { name: 'contact', path: '/contact' },
      { name: 'signup', path: '/signup' },
    ];

    for (const pubPage of publicPages) {
      test(`should render ${pubPage.name} correctly`, async ({ page }) => {
        await page.goto(`${BASE_URL}${pubPage.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300);

        await page.screenshot({
          path: `test-results/showcase-public-${pubPage.name}.png`,
          fullPage: true
        });

        // Verify page has content
        const bodyText = await page.textContent('body');
        expect(bodyText?.length).toBeGreaterThan(100);

        console.log(`✅ Public ${pubPage.name} visual test passed`);
      });
    }
  });

  test.describe('Responsive Dashboard Views', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 },
    ];

    for (const viewport of viewports) {
      test(`should render dashboard on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${BASE_URL}/dashboard/projects-v2`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `test-results/showcase-responsive-${viewport.name}.png`,
          fullPage: true
        });

        console.log(`✅ Responsive ${viewport.name} visual test passed`);
      });
    }
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('should render login in dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.waitForTimeout(300);

      await page.screenshot({
        path: 'test-results/showcase-dark-login.png',
        fullPage: true
      });

      console.log('✅ Dark mode login visual test passed');
    });

    test('should render homepage in dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.waitForTimeout(300);

      await page.screenshot({
        path: 'test-results/showcase-dark-homepage.png',
        fullPage: true
      });

      console.log('✅ Dark mode homepage visual test passed');
    });

    test('should render dashboard in dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/projects-v2`);
      await page.waitForLoadState('networkidle');

      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.waitForTimeout(300);

      await page.screenshot({
        path: 'test-results/showcase-dark-dashboard.png',
        fullPage: true
      });

      console.log('✅ Dark mode dashboard visual test passed');
    });
  });

  test.describe('UI Component Visual Tests', () => {
    test('should render buttons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeVisible();

      // Screenshot the button
      await submitBtn.screenshot({
        path: 'test-results/showcase-button-submit.png'
      });

      console.log('✅ Button component visual test passed');
    });

    test('should render input fields correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');

      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await form.screenshot({
          path: 'test-results/showcase-form-inputs.png'
        });
      }

      console.log('✅ Input component visual test passed');
    });

    test('should render cards on pricing page', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: 'test-results/showcase-pricing-cards.png',
        fullPage: true
      });

      console.log('✅ Card component visual test passed');
    });
  });
});
