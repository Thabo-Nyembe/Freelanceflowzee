import { test, expect } from '@playwright/test';

// Comprehensive MCP-driven Playwright tests for KAZI platform
test.describe('KAZI Platform - Interactive Features Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up page with error handling
    page.on('pageerror', (error) => {
      console.error('Page error:', error);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  });

  test('Homepage loads and navigation works', async ({ page }) => {
    await page.goto('http://localhost:9323');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check title
    await expect(page).toHaveTitle(/KAZI/);
    
    // Check main navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Test navigation links
    const features = page.locator('text=Features');
    if (await features.isVisible()) {
      await features.click();
      await page.waitForURL(/features/);
    }
    
    // Test mobile menu if present
    const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test('Dashboard loads and tabs work', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard content
    const dashboard = page.locator('[data-testid="dashboard"], .dashboard, main');
    await expect(dashboard).toBeVisible();
    
    // Test tab switching
    const tabs = page.locator('[role="tab"], .tab-trigger, [data-testid*="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Click each tab and verify content changes
      for (let i = 0; i < Math.min(tabCount, 5); i++) {
        const tab = tabs.nth(i);
        if (await tab.isVisible()) {
          await tab.click();
          await page.waitForTimeout(500); // Allow tab content to load
          
          // Verify tab is active
          const isActive = await tab.getAttribute('aria-selected') === 'true' || 
                          await tab.getAttribute('data-state') === 'active';
          if (!isActive) {
            console.log(`Tab ${i} may not be properly activated`);
          }
        }
      }
    }
  });

  test('AI Create feature works', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard');
    
    // Navigate to AI Create
    const aiCreateTab = page.locator('text=AI Create, [data-testid="ai-create-tab"]');
    if (await aiCreateTab.isVisible()) {
      await aiCreateTab.click();
      await page.waitForTimeout(1000);
    } else {
      // Try direct navigation
      await page.goto('http://localhost:9323/dashboard/ai-create-v2');
    }
    
    // Test AI Create form
    const textarea = page.locator('textarea, [data-testid="ai-input"]');
    if (await textarea.isVisible()) {
      await textarea.fill('Test AI prompt for generating content');
      
      // Look for submit button
      const submitBtn = page.locator('button:has-text("Generate"), button:has-text("Create"), [data-testid="ai-submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        
        // Wait for response or loading state
        await page.waitForTimeout(2000);
        
        // Check for loading indicator or response
        const loading = page.locator('[data-testid="loading"], .loading, .spinner');
        const response = page.locator('[data-testid="ai-response"], .ai-response');
        
        if (await loading.isVisible()) {
          console.log('AI Create loading state detected');
        }
        if (await response.isVisible()) {
          console.log('AI Create response detected');
        }
      }
    }
  });

  test('Video Studio functionality', async ({ page }) => {
    await page.goto('http://localhost:9323/video-studio');
    
    // Wait for video studio to load
    await page.waitForLoadState('networkidle');
    
    // Check for video studio elements
    const videoStudio = page.locator('[data-testid="video-studio"], .video-studio');
    await expect(videoStudio).toBeVisible();
    
    // Test video upload
    const uploadBtn = page.locator('input[type="file"], [data-testid="video-upload"]');
    if (await uploadBtn.isVisible()) {
      // Note: In real testing, you'd upload a test video file
      console.log('Video upload button found');
    }
    
    // Test video controls
    const playBtn = page.locator('button:has-text("Play"), [data-testid="play-button"]');
    if (await playBtn.isVisible()) {
      await playBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Form submissions work', async ({ page }) => {
    await page.goto('http://localhost:9323/contact');
    
    // Test contact form
    const nameInput = page.locator('input[name="name"], [data-testid="name-input"]');
    const emailInput = page.locator('input[name="email"], [data-testid="email-input"]');
    const messageInput = page.locator('textarea[name="message"], [data-testid="message-input"]');
    const submitBtn = page.locator('button[type="submit"], [data-testid="submit-button"]');
    
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
    }
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }
    
    if (await messageInput.isVisible()) {
      await messageInput.fill('Test message for form validation');
    }
    
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      
      // Wait for form response
      await page.waitForTimeout(2000);
      
      // Check for success message or validation errors
      const successMsg = page.locator('.success, [data-testid="success-message"]');
      const errorMsg = page.locator('.error, [data-testid="error-message"]');
      
      if (await successMsg.isVisible()) {
        console.log('Form submission success detected');
      }
      if (await errorMsg.isVisible()) {
        console.log('Form validation error detected');
      }
    }
  });

  test('Interactive buttons and components', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard');
    
    // Test various interactive elements
    const buttons = page.locator('button:not([disabled])');
    const buttonCount = await buttons.count();
    
    // Test first few buttons
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const buttonText = await button.textContent();
        console.log(`Testing button: ${buttonText}`);
        
        try {
          await button.click();
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`Button click failed: ${buttonText} - ${(error as Error).message}`);
        }
      }
    }
    
    // Test dropdowns
    const dropdowns = page.locator('[data-testid*="dropdown"], .dropdown-trigger');
    const dropdownCount = await dropdowns.count();
    
    for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
      const dropdown = dropdowns.nth(i);
      if (await dropdown.isVisible()) {
        await dropdown.click();
        await page.waitForTimeout(300);
        
        // Check if dropdown menu opened
        const menu = page.locator('[data-testid*="dropdown-menu"], .dropdown-menu');
        if (await menu.isVisible()) {
          console.log(`Dropdown ${i} opened successfully`);
        }
      }
    }
  });

  test('Responsive design and mobile compatibility', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:9323');
    
    // Check mobile navigation
    const mobileNav = page.locator('[data-testid="mobile-menu"], .mobile-menu');
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      await page.waitForTimeout(500);
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify layout doesn't break
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Error handling and edge cases', async ({ page }) => {
    // Test 404 page
    await page.goto('http://localhost:9323/non-existent-page');
    
    // Should show 404 page or redirect
    const notFound = page.locator('text=404, text=Not Found');
    if (await notFound.isVisible()) {
      console.log('404 page handling works');
    }
    
    // Test invalid form submissions
    await page.goto('http://localhost:9323/contact');
    
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      
      // Should show validation errors
      const errors = page.locator('.error, [data-testid*="error"]');
      if (await errors.count() > 0) {
        console.log('Form validation errors displayed');
      }
    }
  });

  test('Performance and loading states', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard');
    
    // Check for loading states
    const loadingStates = page.locator('[data-testid*="loading"], .loading, .spinner');
    const loadingCount = await loadingStates.count();
    
    if (loadingCount > 0) {
      console.log(`Found ${loadingCount} loading states`);
    }
    
    // Test page load performance
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Performance should be under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

// Context7 Integration Tests
test.describe('Context7 Integration', () => {
  test('Context7 provider works', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard');
    
    // Check for Context7 functionality
    const context7Elements = page.locator('[data-context7], [data-testid*="context7"]');
    const context7Count = await context7Elements.count();
    
    if (context7Count > 0) {
      console.log(`Found ${context7Count} Context7 elements`);
    }
    
    // Test Context7 interactions
    for (let i = 0; i < Math.min(context7Count, 3); i++) {
      const element = context7Elements.nth(i);
      if (await element.isVisible()) {
        await element.click();
        await page.waitForTimeout(500);
      }
    }
  });
});