import { test, expect } from '@playwright/test';

// Test dashboard functionality using actual component structure and mock data
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test.describe('Dashboard Rendering', () => {
    test('should render main dashboard layout correctly', async ({ page }) => {
      // Check main welcome section
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
      await expect(page.locator('text=Your complete freelance management platform')).toBeVisible();
      
      // Check navigation tabs are present
      await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
      await expect(page.locator('button:has-text("Projects")')).toBeVisible();
      await expect(page.locator('button:has-text("Financial")')).toBeVisible();
      await expect(page.locator('button:has-text("Files")')).toBeVisible();
    });

    test('should display dashboard overview when dashboard tab is active', async ({ page }) => {
      // Ensure dashboard tab is active
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check dashboard overview heading
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
      await expect(page.locator('text=Welcome back! Here\'s what\'s happening with your freelance business.')).toBeVisible();
      
      // Check action buttons
      await expect(page.locator('button:has-text("Schedule Meeting")')).toBeVisible();
      await expect(page.locator('button:has-text("Send Update")')).toBeVisible();
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that main elements are still visible on mobile
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
      await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
      
      // Check tab navigation works on mobile
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Projects Hub')).toBeVisible();
    });
  });

  test.describe('Dashboard Metrics Display', () => {
    test('should display key metrics cards correctly', async ({ page }) => {
      // Navigate to dashboard tab
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check Total Earnings card
      await expect(page.locator('text=Total Earnings')).toBeVisible();
      await expect(page.locator('text=$47,500')).toBeVisible();
      await expect(page.locator('text=+12.5% from last month')).toBeVisible();
      
      // Check Active Projects card
      await expect(page.locator('text=Active Projects')).toBeVisible();
      await expect(page.locator('text=+2 new this week')).toBeVisible();
      
      // Check Completion Rate card
      await expect(page.locator('text=Completion Rate')).toBeVisible();
      
      // Check Pending Payments card
      await expect(page.locator('text=Pending Payments')).toBeVisible();
      await expect(page.locator('text=-1 from last week')).toBeVisible();
    });

    test('should display earnings chart with correct data', async ({ page }) => {
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check earnings overview chart section
      await expect(page.locator('text=Earnings Overview')).toBeVisible();
      await expect(page.locator('text=Your earnings over the last 6 months')).toBeVisible();
      
      // Chart should be rendered (SVG element from recharts)
      await expect(page.locator('svg').first()).toBeVisible();
    });

    test('should display project status distribution', async ({ page }) => {
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check project status chart
      await expect(page.locator('text=Project Status')).toBeVisible();
      await expect(page.locator('text=Distribution of your current projects')).toBeVisible();
      
      // Check project status legend items
      await expect(page.locator('text=Completed:')).toBeVisible();
      await expect(page.locator('text=In Progress:')).toBeVisible();
      await expect(page.locator('text=On Hold:')).toBeVisible();
      await expect(page.locator('text=Planning:')).toBeVisible();
    });
  });

  test.describe('Recent Activity and Analytics', () => {
    test('should display recent activity feed', async ({ page }) => {
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check recent activity section
      await expect(page.locator('text=Recent Activity')).toBeVisible();
      await expect(page.locator('text=Latest updates from your projects')).toBeVisible();
      
      // Check for sample activity items (from mock data)
      await expect(page.locator('text=E-commerce Website Phase 2')).toBeVisible();
      await expect(page.locator('text=2 hours ago')).toBeVisible();
    });

    test('should display weekly activity chart', async ({ page }) => {
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check weekly activity section
      await expect(page.locator('text=Weekly Activity')).toBeVisible();
      await expect(page.locator('text=Hours worked and tasks completed this week')).toBeVisible();
      
      // Chart should be present
      await expect(page.locator('svg').nth(1)).toBeVisible();
    });

    test('should show monthly statistics', async ({ page }) => {
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Scroll to find monthly stats section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check for This Month card
      await expect(page.locator('text=This Month')).toBeVisible();
      await expect(page.locator('text=Revenue')).toBeVisible();
      await expect(page.locator('text=Projects')).toBeVisible();
      await expect(page.locator('text=Hours')).toBeVisible();
    });
  });

  test.describe('Tab Navigation and Content', () => {
    test('should switch between different hub tabs correctly', async ({ page }) => {
      // Test Projects Hub
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Projects Hub')).toBeVisible();
      
      // Test Financial Hub  
      await page.click('button:has-text("Financial")');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Financial Hub')).toBeVisible();
      
      // Test Files Hub
      await page.click('button:has-text("Files")');
      await page.waitForTimeout(500);
      await expect(page.locator('text=Files Hub')).toBeVisible();
      
      // Return to Dashboard
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });

    test('should maintain tab state correctly', async ({ page }) => {
      // Switch to Projects tab
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should return to default dashboard tab
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
    });
  });

  test.describe('Project Data Display', () => {
    test('should display project information correctly in projects hub', async ({ page }) => {
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      
      // Check for mock project data
      await expect(page.locator('text=E-commerce Website Redesign')).toBeVisible();
      await expect(page.locator('text=Mobile App Development')).toBeVisible();
      await expect(page.locator('text=Brand Identity Package')).toBeVisible();
      
      // Check project status badges
      await expect(page.locator('text=active')).toBeVisible();
      await expect(page.locator('text=completed')).toBeVisible();
    });

    test('should show project statistics and progress', async ({ page }) => {
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      
      // Look for project progress indicators
      await expect(page.locator('text=65%')).toBeVisible(); // E-commerce project progress
      await expect(page.locator('text=100%')).toBeVisible(); // Brand identity completion
      
      // Check for budget information
      await expect(page.locator('text=$15,000')).toBeVisible(); // E-commerce budget
      await expect(page.locator('text=$25,000')).toBeVisible(); // Mobile app budget
    });
  });

  test.describe('Financial Data Display', () => {
    test('should display financial overview correctly', async ({ page }) => {
      await page.click('button:has-text("Financial")');
      await page.waitForTimeout(500);
      
      // Check for financial metrics
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Total Invoiced')).toBeVisible();
      await expect(page.locator('text=Pending Amount')).toBeVisible();
      
      // Check for revenue chart
      await expect(page.locator('text=Revenue Overview')).toBeVisible();
      await expect(page.locator('text=Monthly revenue and expenses')).toBeVisible();
    });

    test('should show invoice and payment information', async ({ page }) => {
      await page.click('button:has-text("Financial")');
      await page.waitForTimeout(500);
      
      // Check for invoice tabs
      await expect(page.locator('text=Invoices')).toBeVisible();
      await expect(page.locator('text=Expenses')).toBeVisible();
      await expect(page.locator('text=Analytics')).toBeVisible();
    });
  });

  test.describe('User Experience and Interactions', () => {
    test('should handle loading states gracefully', async ({ page }) => {
      // Intercept and delay API calls to test loading states
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });
      
      await page.goto('/dashboard');
      
      // Page should still load successfully
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible({ timeout: 10000 });
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Focus on first tab button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      
      // Should switch to next tab
      await page.waitForTimeout(500);
      await expect(page.locator('text=Projects Hub')).toBeVisible();
    });

    test('should handle window resize correctly', async ({ page }) => {
      // Start with desktop size
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
      
      // Resize to tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
      
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle empty dashboard state gracefully', async ({ page }) => {
      // Mock empty state by intercepting API calls
      await page.route('**/api/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            earnings: 0,
            activeProjects: 0,
            completedProjects: 0,
            pendingPayments: 0,
            recentActivities: [],
            projects: []
          })
        });
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Should still render dashboard structure
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
      
      // Switch to dashboard tab to see metrics
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Should show zero values gracefully
      await expect(page.locator('text=Total Earnings')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', async route => {
        await route.abort('failed');
      });
      
      await page.goto('/dashboard');
      
      // Should still render static content
      await expect(page.locator('h1:has-text("Welcome to FreeflowZee")')).toBeVisible();
      await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
    });

    test('should handle very large numbers correctly', async ({ page }) => {
      // Test with large earnings value
      await page.goto('/dashboard');
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Should format large numbers correctly with commas
      await expect(page.locator('text=$47,500')).toBeVisible();
    });
  });

  test.describe('Integration with Mock Data', () => {
    test('should display all mock projects correctly', async ({ page }) => {
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      
      // All three mock projects should be visible
      const expectedProjects = [
        'E-commerce Website Redesign',
        'Mobile App Development', 
        'Brand Identity Package'
      ];
      
      for (const project of expectedProjects) {
        await expect(page.locator(`text=${project}`)).toBeVisible();
      }
    });

    test('should display correct client information', async ({ page }) => {
      await page.click('button:has-text("Projects")');
      await page.waitForTimeout(500);
      
      // Check client names from mock data
      await expect(page.locator('text=TechCorp Inc.')).toBeVisible();
      await expect(page.locator('text=StartupXYZ')).toBeVisible();
      await expect(page.locator('text=Design Agency Co.')).toBeVisible();
    });

    test('should show correct activity history', async ({ page }) => {
      await page.click('button:has-text("Dashboard")');
      await page.waitForTimeout(500);
      
      // Check recent activities from mock data
      await expect(page.locator('text=New project milestone completed')).toBeVisible();
      await expect(page.locator('text=Sarah left feedback')).toBeVisible();
      await expect(page.locator('text=Invoice #INV-001 payment received')).toBeVisible();
    });
  });
});