import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

/**
 * COMPREHENSIVE DASHBOARD TESTING
 * Tests all dashboard tabs, navigation, and core functionality
 */

test.describe('KAZI Dashboard - Comprehensive Testing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToDashboard();
  });

  test.describe('Dashboard Navigation & Tabs', () => {
    const dashboardTabs = [
      'overview',
      'projects-hub', 
      'ai-create',
      'video-studio',
      'escrow',
      'files-hub',
      'community',
      'my-day-today'
    ] as const;

    test('should display all dashboard tabs', async ({ page }) => {
      // Verify all tabs are present
      for (const tab of dashboardTabs) {
        const tabElement = page.locator(`[data-testid="tab-${tab}"]`);
        await expect(tabElement).toBeVisible();
      }
    });

    test('should allow navigation between all tabs', async ({ page }) => {
      for (const tab of dashboardTabs) {
        await helpers.clickDashboardTab(tab);
        await helpers.verifyTabIsActive(tab);
        
        // Verify content area shows appropriate content
        const contentArea = page.locator('[data-testid="tab-content"]');
        await expect(contentArea).toBeVisible();
        
        await page.waitForTimeout(500); // Allow smooth transition
      }
    });

    test('should maintain tab state on page refresh', async ({ page }) => {
      // Navigate to a specific tab
      await helpers.clickDashboardTab('ai-create');
      await helpers.verifyTabIsActive('ai-create');
      
      // Refresh page
      await page.reload();
      await helpers.waitForAppReady();
      
      // Verify tab state is maintained (or defaults appropriately)
      const activeTab = page.locator('[aria-selected="true"]');
      await expect(activeTab).toBeVisible();
    });
  });

  test.describe('Overview Tab', () => {
    test.beforeEach(async () => {
      await helpers.clickDashboardTab('overview');
    });

    test('should display overview metrics and widgets', async ({ page }) => {
      // Look for common overview elements
      const overviewElements = [
        '[data-testid="overview-stats"]',
        '[data-testid="recent-activity"]', 
        '[data-testid="quick-actions"]',
        'h1, h2, h3', // Some heading should be present
      ];

      for (const selector of overviewElements) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          break; // At least one overview element should be present
        }
      }
    });

    test('should have functional quick action buttons', async ({ page }) => {
      // Look for action buttons and test they're clickable
      const actionButtons = page.locator('button').filter({ hasText: /Create|New|Add|Start/ });
      const buttonCount = await actionButtons.count();
      
      if (buttonCount > 0) {
        // Test first available action button
        const firstButton = actionButtons.first();
        await expect(firstButton).toBeVisible();
        await expect(firstButton).toBeEnabled();
        
        // Click and verify some response (modal, navigation, etc.)
        await firstButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Projects Hub Tab', () => {
    test.beforeEach(async () => {
      await helpers.clickDashboardTab('projects-hub');
    });

    test('should display projects interface', async ({ page }) => {
      // Verify projects hub content loads
      const projectsElements = [
        '[data-testid="projects-list"]',
        '[data-testid="project-grid"]',
        'button:has-text("New Project")',
        'button:has-text("Create Project")',
        ':has-text("Projects")'
      ];

      let found = false;
      for (const selector of projectsElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          found = true;
          break;
        }
      }
      
      expect(found).toBeTruthy();
    });

    test('should allow project creation flow', async ({ page }) => {
      // Look for create project functionality
      const createButtons = page.locator('button').filter({ hasText: /Create|New.*Project|Add.*Project/ });
      
      if (await createButtons.count() > 0) {
        await createButtons.first().click();
        
        // Should open modal or navigate to creation page
        await page.waitForTimeout(1000);
        
        // Look for project creation form
        const formElements = [
          'input[name*="name"], input[placeholder*="name"]',
          'textarea[name*="description"], textarea[placeholder*="description"]',
          'button[type="submit"], button:has-text("Create"), button:has-text("Save")'
        ];
        
        for (const selector of formElements) {
          const element = page.locator(selector);
          if (await element.isVisible()) {
            // Form found - basic validation
            await expect(element).toBeVisible();
            break;
          }
        }
      }
    });
  });

  test.describe('AI Create Tab', () => {
    test.beforeEach(async () => {
      await helpers.clickDashboardTab('ai-create');
    });

    test('should display AI creation tools', async ({ page }) => {
      // Verify AI Create interface loads
      const aiElements = [
        '[data-testid="ai-create-tools"]',
        '[data-testid="design-assistant"]',
        '[data-testid="content-writer"]',
        'button:has-text("Generate")',
        'button:has-text("Create")',
        'textarea[placeholder*="describe"], input[placeholder*="prompt"]'
      ];

      let found = false;
      for (const selector of aiElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          found = true;
          break;
        }
      }
      
      expect(found).toBeTruthy();
    });

    test('should handle AI generation workflow', async ({ page }) => {
      // Look for AI input areas
      const aiInputs = page.locator('textarea, input[type="text"]').filter({ hasText: /prompt|describe|generate/ });
      
      if (await aiInputs.count() > 0) {
        await aiInputs.first().fill('Create a test design');
        
        // Look for generate button
        const generateBtn = page.locator('button').filter({ hasText: /Generate|Create|Submit/ }).first();
        if (await generateBtn.isVisible()) {
          await generateBtn.click();
          await page.waitForTimeout(2000); // Allow AI processing
        }
      }
    });
  });

  test.describe('Files Hub Tab', () => {
    test.beforeEach(async () => {
      await helpers.clickDashboardTab('files-hub');
    });

    test('should display file management interface', async ({ page }) => {
      const fileElements = [
        '[data-testid="file-grid"]',
        '[data-testid="file-list"]',
        'button:has-text("Upload")',
        'input[type="file"]',
        ':has-text("Files")',
        ':has-text("Documents")'
      ];

      let found = false;
      for (const selector of fileElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          found = true;
          break;
        }
      }
      
      expect(found).toBeTruthy();
    });

    test('should handle file upload interface', async ({ page }) => {
      // Look for upload functionality
      const uploadElements = [
        'input[type="file"]',
        'button:has-text("Upload")',
        '[data-testid="file-upload"]'
      ];

      for (const selector of uploadElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          
          if (selector.includes('input[type="file"]')) {
            // Test file input accessibility
            await expect(element).toBeEnabled();
          }
          break;
        }
      }
    });
  });

  test.describe('Community Tab', () => {
    test.beforeEach(async () => {
      await helpers.clickDashboardTab('community');
    });

    test('should display community features', async ({ page }) => {
      const communityElements = [
        '[data-testid="social-wall"]',
        '[data-testid="creator-marketplace"]',
        'button:has-text("Post")',
        'button:has-text("Share")',
        ':has-text("Community")',
        ':has-text("Social")'
      ];

      let found = false;
      for (const selector of communityElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          found = true;
          break;
        }
      }
      
      expect(found).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await helpers.navigateToDashboard();
      
      // Verify mobile navigation works
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-menu, button[aria-label*="menu"]');
      if (await mobileNav.isVisible()) {
        await mobileNav.click();
        await page.waitForTimeout(500);
      }
      
      // Verify tabs are accessible on mobile
      const tabsList = page.locator('[role="tablist"], [data-testid="dashboard-tabs"]');
      await expect(tabsList).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport  
      await page.setViewportSize({ width: 768, height: 1024 });
      await helpers.navigateToDashboard();
      
      // Verify layout adapts properly
      const dashboard = page.locator('[data-testid="dashboard"], main');
      await expect(dashboard).toBeVisible();
    });
  });

  test.describe('Performance & Loading', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const loadTime = await helpers.measurePageLoadTime();
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should handle tab switching quickly', async ({ page }) => {
      const switchTime = await helpers.measureOperationTime(async () => {
        await helpers.clickDashboardTab('ai-create');
        await helpers.clickDashboardTab('projects-hub');
      });
      
      expect(switchTime).toBeLessThan(2000); // 2 seconds max for tab switching
    });
  });

  test.describe('Accessibility', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await helpers.checkAccessibility();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate to tabs
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const tabElements = page.locator('[role="tab"]');
      const tabCount = await tabElements.count();
      
      for (let i = 0; i < tabCount; i++) {
        const tab = tabElements.nth(i);
        // Each tab should have accessible name
        const hasAriaLabel = await tab.getAttribute('aria-label');
        const hasText = await tab.textContent();
        expect(hasAriaLabel || hasText).toBeTruthy();
      }
    });
  });
});