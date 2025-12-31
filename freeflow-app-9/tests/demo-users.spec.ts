import { test, expect } from '@playwright/test';

test.describe('Demo User Actions', () => {
  
  test('Sarah Mitchell - New User Journey', async ({ page }) => {
    // Login as Sarah
    await page.goto('http://localhost:9323/login');
    await page.fill('#email', 'sarah@techstartup.io');
    await page.fill('#password', 'Demo2025');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    console.log('✅ Sarah logged in');
    await page.screenshot({ path: 'test-results/sarah-1-dashboard.png', fullPage: true });
    
    // Navigate to Projects
    await page.click('text=Projects').catch(() => page.click('[href*="projects"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Sarah viewed Projects');
    await page.screenshot({ path: 'test-results/sarah-2-projects.png', fullPage: true });
    
    // Navigate to Messages
    await page.click('text=Messages').catch(() => page.click('[href*="messages"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Sarah viewed Messages');
    await page.screenshot({ path: 'test-results/sarah-3-messages.png', fullPage: true });
    
    // Navigate to Invoicing
    await page.click('text=Invoicing').catch(() => page.click('[href*="invoic"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Sarah viewed Invoicing');
    await page.screenshot({ path: 'test-results/sarah-4-invoicing.png', fullPage: true });
    
    console.log('🎉 Sarah completed her journey!');
  });

  test('Marcus Johnson - Power User Journey', async ({ page }) => {
    // Login as Marcus
    await page.goto('http://localhost:9323/login');
    await page.fill('#email', 'marcus@designstudio.co');
    await page.fill('#password', 'Demo2025');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    console.log('✅ Marcus logged in');
    await page.screenshot({ path: 'test-results/marcus-1-dashboard.png', fullPage: true });
    
    // Navigate to Projects
    await page.click('text=Projects').catch(() => page.click('[href*="projects"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Marcus viewed Projects');
    await page.screenshot({ path: 'test-results/marcus-2-projects.png', fullPage: true });
    
    // Navigate to Analytics
    await page.click('text=Analytics').catch(() => page.click('[href*="analytics"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Marcus viewed Analytics');
    await page.screenshot({ path: 'test-results/marcus-3-analytics.png', fullPage: true });
    
    // Navigate to AI Tools
    await page.click('text=AI').catch(() => page.click('[href*="ai"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Marcus viewed AI Tools');
    await page.screenshot({ path: 'test-results/marcus-4-ai.png', fullPage: true });
    
    // Navigate to Settings
    await page.click('text=Settings').catch(() => page.click('[href*="settings"]'));
    await page.waitForTimeout(2000);
    console.log('✅ Marcus viewed Settings');
    await page.screenshot({ path: 'test-results/marcus-5-settings.png', fullPage: true });
    
    console.log('🎉 Marcus completed his power user journey!');
  });
});
