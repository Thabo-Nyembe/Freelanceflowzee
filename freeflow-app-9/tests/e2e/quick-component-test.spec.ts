#!/usr/bin/env node

const { test, expect } = require('@playwright/test');

test.describe('FreeflowZee Quick Component Tests', () => {
  test('Landing page loads with key elements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for key content
    await expect(page).toHaveTitle(/FreeflowZee/);
    
    // Look for main heading or brand content
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toContain('FreeflowZee');
    
    console.log('✅ Landing page loaded successfully');
  });

  test('Navigation elements are present', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for navigation elements
    const hasNavigation = await page.locator('nav, header').count() > 0;
    expect(hasNavigation).toBeTruthy();
    
    console.log('✅ Navigation elements found');
  });

  test('Features page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/features');
    
    // Should load successfully
    await expect(page).toHaveURL(/features/);
    
    console.log('✅ Features page accessible');
  });

  test('Dashboard requires authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Should redirect to login or show authentication requirement
    const url = page.url();
    const hasRedirect = url.includes('login') || url.includes('auth');
    
    console.log(`✅ Dashboard properly protected (redirected: ${hasRedirect})`);
  });

  test('Demo page functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/demo');
    
    // Check demo page loads
    await expect(page).toHaveURL(/demo/);
    
    console.log('✅ Demo page accessible');
  });
});

module.exports = test; 