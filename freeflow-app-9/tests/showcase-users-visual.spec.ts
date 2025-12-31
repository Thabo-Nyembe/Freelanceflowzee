import { test, expect } from '@playwright/test';

test.describe('Showcase Users Visual Test', () => {
  const users = [
    { email: 'sarah@techstartup.io', password: 'Demo2025', name: 'Sarah Mitchell', tier: 'new' },
    { email: 'marcus@designstudio.co', password: 'Demo2025', name: 'Marcus Johnson', tier: 'power' }
  ];

  for (const user of users) {
    test(`Visual test for ${user.name} (${user.tier} user)`, async ({ page }) => {
      // Go to login
      await page.goto('http://localhost:9323/login');
      await page.waitForLoadState('networkidle');

      // Take screenshot of login page
      await page.screenshot({
        path: `test-results/showcase-${user.tier}-login.png`,
        fullPage: true
      });

      // Fill login form using the input IDs
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);

      // Click login button
      await page.click('button[type="submit"]');

      // Wait for the button to show "Signing in..." state (loading started)
      await page.waitForSelector('button[type="submit"]:has-text("Signing in")', { timeout: 5000 }).catch(() => {});

      // Wait for navigation to dashboard (nextAuth + router.push with 500ms delay)
      await page.waitForURL('**/dashboard**', { timeout: 30000 });
      await page.waitForLoadState('networkidle');

      // Take screenshot of dashboard
      await page.screenshot({
        path: `test-results/showcase-${user.tier}-dashboard.png`,
        fullPage: true
      });

      // Verify we're on the dashboard
      expect(page.url()).toContain('/dashboard');

      console.log(`✅ ${user.name} (${user.tier}) - Login and dashboard verified`);
    });
  }
});
