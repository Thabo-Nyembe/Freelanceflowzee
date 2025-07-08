import { test, expect } from '@playwright/test';

test.describe('Bug Detection Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Increase timeout for debugging
    page.setDefaultTimeout(10000);
  });

  test('should verify homepage loads and has basic content', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check page loads
    await expect(page).toHaveTitle(/FreeflowZee/);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage-debug.png' });
    
    // Check if main heading exists
    const headings = await page.locator('h1').count();
    console.log(`Found ${headings} h1 elements`);
    
    // Get page HTML for debugging
    const html = await page.content();
    console.log('Page HTML length:', html.length);
    
    // Check for specific text content
    const content = await page.textContent('body');
    console.log('Page contains "FreeFlowZee":', content?.includes('FreeFlowZee') || false);
    console.log('Page contains "Welcome":', content?.includes('Welcome') || false);
  });

  test('should verify contact page loads and has basic content', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    
    // Check page loads
    await expect(page).toHaveTitle(/Contact Us/);
    
    // Wait for content to load  
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/contact-debug.png' });
    
    // Check if main heading exists
    const headings = await page.locator('h1').count();
    console.log(`Contact page found ${headings} h1 elements`);
    
    // Get all h1 text content
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    for (let i = 0; i < h1Count; i++) {
      const text = await h1Elements.nth(i).textContent();
      console.log(`H1 ${i}: "${text}"`);
    }
    
    // Check for form elements
    const inputs = await page.locator('input').count();
    console.log(`Found ${inputs} input elements`);
    
    // Check for specific form fields
    const firstNameField = page.locator('input[id="firstName"]');
    const isVisible = await firstNameField.isVisible();
    console.log('First name field visible:', isVisible);
    
    if (!isVisible) {
      // Debug why it's not visible
      const exists = await firstNameField.count();
      console.log('First name field exists:', exists > 0);
      
      if (exists > 0) {
        const boundingBox = await firstNameField.boundingBox();
        console.log('First name field bounding box:', boundingBox);
      }
    }
  });

  test('should check for CSS loading issues', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if stylesheets are loaded
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    console.log(`Found ${stylesheets} stylesheets`);
    
    // Check for CSS-related console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    console.log('Console errors:', errors);
    
    // Check computed styles
    const body = page.locator('body');
    const bodyDisplay = await body.evaluate(el => window.getComputedStyle(el).display);
    console.log('Body display:', bodyDisplay);
    
    // Check if elements have proper styling
    const h1 = page.locator('h1').first();
    if (await h1.count() > 0) {
      const h1Display = await h1.evaluate(el => window.getComputedStyle(el).display);
      const h1Visibility = await h1.evaluate(el => window.getComputedStyle(el).visibility);
      console.log('H1 display:', h1Display);
      console.log('H1 visibility:', h1Visibility);
    }
  });

  test('should test different page routes for 404 issues', async ({ page }) => {
    const routes = [
      '/',
      '/contact',
      '/signup', 
      '/pricing',
      '/video-studio',
      '/dashboard'
    ];
    
    for (const route of routes) {
      const response = await page.goto(`http://localhost:3000${route}`);
      const status = response?.status() || 0;
      console.log(`Route ${route}: Status ${status}`);
      
      if (status >= 400) {
        console.log(`❌ Route ${route} returned error status ${status}`);
      } else {
        console.log(`✅ Route ${route} loaded successfully`);
      }
      
      // Check if it's actually a 404 page being rendered
      const content = await page.textContent('body');
      const is404 = content?.includes('404') || content?.includes('Not Found');
      if (is404) {
        console.log(`❌ Route ${route} is showing 404 content`);
      }
    }
  });
});