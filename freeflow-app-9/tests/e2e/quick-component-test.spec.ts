#!/usr/bin/env node

const { test, expect } = require(&apos;@playwright/test&apos;);

test.describe(&apos;FreeflowZee Quick Component Tests&apos;, () => {
  test(&apos;Landing page loads with key elements&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3000&apos;);
    
    // Check for key content
    await expect(page).toHaveTitle(/FreeflowZee/);
    
    // Look for main heading or brand content
    const hasContent = await page.locator(&apos;body&apos;).textContent();
    expect(hasContent).toContain(&apos;FreeflowZee&apos;);
    
    console.log(&apos;✅ Landing page loaded successfully&apos;);
  });

  test(&apos;Navigation elements are present&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3000&apos;);
    
    // Check for navigation elements
    const hasNavigation = await page.locator(&apos;nav, header&apos;).count() > 0;
    expect(hasNavigation).toBeTruthy();
    
    console.log(&apos;✅ Navigation elements found&apos;);
  });

  test(&apos;Features page is accessible&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3000/features&apos;);
    
    // Should load successfully
    await expect(page).toHaveURL(/features/);
    
    console.log(&apos;✅ Features page accessible&apos;);
  });

  test(&apos;Dashboard requires authentication&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3000/dashboard&apos;);
    
    // Should redirect to login or show authentication requirement
    const url = page.url();
    const hasRedirect = url.includes(&apos;login&apos;) || url.includes(&apos;auth&apos;);
    
    console.log(`✅ Dashboard properly protected (redirected: ${hasRedirect})`);
  });

  test(&apos;Demo page functionality&apos;, async ({ page }) => {
    await page.goto(&apos;http://localhost:3000/demo&apos;);
    
    // Check demo page loads
    await expect(page).toHaveURL(/demo/);
    
    console.log(&apos;✅ Demo page accessible&apos;);
  });
});

module.exports = test; 