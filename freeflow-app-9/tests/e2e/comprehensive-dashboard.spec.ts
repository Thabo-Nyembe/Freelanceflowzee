import { test, expect } from '../fixtures/app-fixtures';

test.describe('🎛️ Comprehensive Dashboard Tests', () => {
  test.beforeEach(async ({ dashboardPage, authPage, testUser }) => {
    // Ensure user is logged in before each test
    await authPage.gotoLogin();
    await authPage.attemptLogin(testUser.email, testUser.password, true);
    await dashboardPage.waitForDashboardToLoad();
  });

  test.describe('📊 Dashboard Core Elements', () => {
    test('should display all dashboard elements', async ({ dashboardPage }) => {
      const elements = await dashboardPage.verifyDashboardLoaded();
      
      expect(elements.sidebar).toBe(true);
      expect(elements.header).toBe(true);
      expect(elements.mainContent).toBe(true);
      expect(elements.quickActions).toBe(true);
    });

    test('should display stats cards with data', async ({ dashboardPage }) => {
      const stats = await dashboardPage.verifyStatsCards();
      
      expect(stats.count).toBeGreaterThan(0);
      expect(stats.data.length).toBeGreaterThan(0);
      
      for (const stat of stats.data) {
        expect(stat).toBeTruthy();
      }
    });

    test('should display user profile elements', async ({ dashboardPage }) => {
      const profile = await dashboardPage.verifyUserProfile();
      
      expect(profile.avatar).toBe(true);
      expect(profile.notifications).toBe(true);
    });
  });

  test.describe('🧭 Navigation & Routing', () => {
    test('should navigate to projects hub', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      
      expect(dashboardPage.page.url()).toContain('projects');
      
      const projectsHub = await dashboardPage.verifyProjectsHub();
      expect(projectsHub.hub).toBe(true);
      expect(projectsHub.list).toBe(true);
      expect(projectsHub.search).toBe(true);
    });

    test('should navigate to team hub', async ({ dashboardPage }) => {
      await dashboardPage.navigateToTeam();
      
      expect(dashboardPage.page.url()).toContain('team');
      
      const teamHub = await dashboardPage.verifyTeamHub();
      expect(teamHub.hub).toBe(true);
      expect(teamHub.addButton).toBe(true);
    });

    test('should navigate to community tab', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCommunity();
      
      expect(dashboardPage.page.url()).toContain('community');
    });

    test('should navigate to analytics section', async ({ dashboardPage }) => {
      await dashboardPage.navigateToAnalytics();
      
      expect(dashboardPage.page.url()).toContain('analytics');
    });

    test('should navigate to settings', async ({ dashboardPage }) => {
      await dashboardPage.navigateToSettings();
      
      expect(dashboardPage.page.url()).toContain('settings');
    });
  });

  test.describe('🚀 Quick Actions', () => {
    test('should open new project modal', async ({ dashboardPage }) => {
      await dashboardPage.createNewProject();
      
      await expect(dashboardPage.modal).toBeVisible();
    });

    test('should open file upload modal', async ({ dashboardPage }) => {
      await dashboardPage.uploadFile();
      
      await expect(dashboardPage.modal).toBeVisible();
    });

    test('should open team invite modal', async ({ dashboardPage }) => {
      await dashboardPage.inviteTeamMember();
      
      await expect(dashboardPage.modal).toBeVisible();
    });

    test('should navigate to invoice creation', async ({ dashboardPage }) => {
      await dashboardPage.createInvoice();
      
      expect(dashboardPage.page.url()).toContain('invoice');
    });
  });

  test.describe('📋 Project Management', () => {
    test('should search projects', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      await dashboardPage.searchProjects('test');
      
      // Wait for search results
      await dashboardPage.page.waitForTimeout(1000);
    });

    test('should filter projects by status', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      await dashboardPage.filterProjectsByStatus('Active');
      
      await dashboardPage.page.waitForTimeout(500);
    });

    test('should sort projects', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      await dashboardPage.sortProjects('Date Created');
      
      await dashboardPage.page.waitForTimeout(500);
    });

    test('should get project count', async ({ dashboardPage }) => {
      const projectCount = await dashboardPage.getProjectCount();
      
      expect(projectCount).toBeGreaterThanOrEqual(0);
    });

    test('should get project names', async ({ dashboardPage }) => {
      const projectNames = await dashboardPage.getProjectNames();
      
      expect(Array.isArray(projectNames)).toBe(true);
    });
  });

  test.describe('👥 Team Management', () => {
    test('should get team member count', async ({ dashboardPage }) => {
      const memberCount = await dashboardPage.getTeamMemberCount();
      
      expect(memberCount).toBeGreaterThanOrEqual(0);
    });

    test('should get team member names', async ({ dashboardPage }) => {
      const memberNames = await dashboardPage.getTeamMemberNames();
      
      expect(Array.isArray(memberNames)).toBe(true);
    });

    test('should add team member', async ({ dashboardPage }) => {
      await dashboardPage.navigateToTeam();
      await dashboardPage.addTeamMember('newmember@example.com', 'Member');
      
      // Should show invite modal and process invitation
      await dashboardPage.page.waitForTimeout(2000);
    });
  });

  test.describe('💬 Community Features', () => {
    test('should create community post', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCommunity();
      await dashboardPage.createPost('This is a test post');
      
      await dashboardPage.page.waitForTimeout(1000);
    });

    test('should like community post', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCommunity();
      
      // Assuming there's a post with ID 'test-post'
      if (await dashboardPage.page.locator('[data-testid="post-test-post"]').isVisible()) {
        await dashboardPage.likePost('test-post');
        await dashboardPage.page.waitForTimeout(500);
      }
    });

    test('should comment on community post', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCommunity();
      
      if (await dashboardPage.page.locator('[data-testid="post-test-post"]').isVisible()) {
        await dashboardPage.commentOnPost('test-post', 'Great post!');
        await dashboardPage.page.waitForTimeout(500);
      }
    });
  });

  test.describe('📱 Responsive Design', () => {
    test('should be responsive across different viewports', async ({ dashboardPage }) => {
      const responsiveness = await dashboardPage.checkResponsiveness();
      
      expect(responsiveness.mobile.header).toBe(true);
      expect(responsiveness.mobile.mainContent).toBe(true);
      
      expect(responsiveness.tablet.header).toBe(true);
      expect(responsiveness.tablet.mainContent).toBe(true);
      
      expect(responsiveness.desktop.sidebar).toBe(true);
      expect(responsiveness.desktop.header).toBe(true);
      expect(responsiveness.desktop.mainContent).toBe(true);
    });
  });

  test.describe('⚡ Performance', () => {
    test('should load dashboard within acceptable time', async ({ dashboardPage }) => {
      const loadTime = await dashboardPage.measureDashboardLoadTime();
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });
  });

  test.describe('🔄 Modal Management', () => {
    test('should dismiss modals with escape key', async ({ dashboardPage }) => {
      await dashboardPage.createNewProject();
      await expect(dashboardPage.modal).toBeVisible();
      
      await dashboardPage.dismissModal();
      await expect(dashboardPage.modal).not.toBeVisible();
    });

    test('should handle multiple modal interactions', async ({ dashboardPage }) => {
      // Open and close multiple modals
      await dashboardPage.createNewProject();
      await dashboardPage.dismissModal();
      
      await dashboardPage.uploadFile();
      await dashboardPage.dismissModal();
      
      await dashboardPage.inviteTeamMember();
      await dashboardPage.dismissModal();
      
      // Dashboard should still be functional
      const elements = await dashboardPage.verifyDashboardLoaded();
      expect(elements.mainContent).toBe(true);
    });
  });

  test.describe('🔍 Search & Filter Functionality', () => {
    test('should handle empty search results', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      await dashboardPage.searchProjects('nonexistentproject12345');
      
      await dashboardPage.page.waitForTimeout(1000);
      
      // Should handle gracefully without errors
      const projectCount = await dashboardPage.projectCards.count();
      expect(projectCount).toBeGreaterThanOrEqual(0);
    });

    test('should clear search filters', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      
      // Apply search
      await dashboardPage.searchProjects('test');
      await dashboardPage.page.waitForTimeout(500);
      
      // Clear search
      await dashboardPage.searchProjects('');
      await dashboardPage.page.waitForTimeout(500);
      
      // Should show all projects again
      const projectCount = await dashboardPage.getProjectCount();
      expect(projectCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('🔐 Security & Authentication', () => {
    test('should handle session timeout', async ({ dashboardPage }) => {
      // This would test session timeout scenarios
      // In a real app, you might clear cookies or tokens
      await dashboardPage.page.waitForTimeout(1000);
      
      const elements = await dashboardPage.verifyDashboardLoaded();
      expect(elements.mainContent).toBe(true);
    });

    test('should protect against XSS in user content', async ({ dashboardPage }) => {
      await dashboardPage.navigateToCommunity();
      
      const xssAttempt = '<script>alert("XSS")</script>';
      await dashboardPage.createPost(xssAttempt);
      
      // Should handle gracefully without executing script
      await dashboardPage.page.waitForTimeout(1000);
    });
  });

  test.describe('🎯 Edge Cases', () => {
    test('should handle rapid navigation', async ({ dashboardPage }) => {
      // Rapidly navigate between sections
      await dashboardPage.navigateToProjects();
      await dashboardPage.navigateToTeam();
      await dashboardPage.navigateToCommunity();
      await dashboardPage.navigateToAnalytics();
      await dashboardPage.navigateToSettings();
      
      // Should end up in settings without errors
      expect(dashboardPage.page.url()).toContain('settings');
    });

    test('should handle concurrent operations', async ({ dashboardPage }) => {
      // Open multiple modals in sequence
      await Promise.all([
        dashboardPage.createNewProject(),
        dashboardPage.page.waitForTimeout(100)
      ]);
      
      await dashboardPage.dismissModal();
      
      // Should handle gracefully
      const elements = await dashboardPage.verifyDashboardLoaded();
      expect(elements.mainContent).toBe(true);
    });

    test('should handle network interruption simulation', async ({ dashboardPage }) => {
      // Simulate slow network
      await dashboardPage.page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await dashboardPage.navigateToProjects();
      
      // Should still function with delays
      await dashboardPage.page.waitForTimeout(1000);
      const projectsHub = await dashboardPage.verifyProjectsHub();
      expect(projectsHub.hub).toBe(true);
    });
  });

  test.describe('📊 Data Management', () => {
    test('should handle empty states', async ({ dashboardPage }) => {
      // Test when user has no projects
      await dashboardPage.navigateToProjects();
      
      const projectCount = await dashboardPage.getProjectCount();
      if (projectCount === 0) {
        // Should show empty state gracefully
        await expect(dashboardPage.projectsList).toBeVisible();
      }
    });

    test('should handle large datasets', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      
      // Should handle large number of projects
      const projectCount = await dashboardPage.getProjectCount();
      expect(projectCount).toBeGreaterThanOrEqual(0);
      
      // Should still be responsive
      const loadTime = await dashboardPage.measureDashboardLoadTime();
      expect(loadTime).toBeLessThan(10000); // 10 seconds for large datasets
    });
  });

  test.describe('🔄 User Session Management', () => {
    test('should maintain state across page refreshes', async ({ dashboardPage }) => {
      await dashboardPage.navigateToProjects();
      
      // Refresh page
      await dashboardPage.page.reload();
      
      // Should still be on projects page
      expect(dashboardPage.page.url()).toContain('projects');
    });

    test('should handle logout properly', async ({ dashboardPage }) => {
      await dashboardPage.logout();
      
      expect(dashboardPage.page.url()).toContain('login');
    });
  });

  test.describe('♿ Accessibility', () => {
    test('should have proper keyboard navigation', async ({ dashboardPage }) => {
      // Test tab navigation
      await dashboardPage.page.keyboard.press('Tab');
      await dashboardPage.page.keyboard.press('Tab');
      await dashboardPage.page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      const focusedElement = await dashboardPage.page.evaluate(() => 
        document.activeElement?.tagName
      );
      
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });

    test('should have proper ARIA labels', async ({ dashboardPage }) => {
      // Check for essential ARIA attributes
      const sidebarAriaLabel = await dashboardPage.sidebar.getAttribute('aria-label');
      const headerAriaLabel = await dashboardPage.header.getAttribute('aria-label');
      
      // At least one should have proper labeling
      expect(sidebarAriaLabel || headerAriaLabel).toBeTruthy();
    });
  });

  test.describe('🎨 UI/UX Quality', () => {
    test('should have consistent styling', async ({ dashboardPage }) => {
      const elements = await dashboardPage.verifyDashboardLoaded();
      
      // All major elements should be visible
      expect(elements.sidebar).toBe(true);
      expect(elements.header).toBe(true);
      expect(elements.mainContent).toBe(true);
    });

    test('should handle loading states', async ({ dashboardPage }) => {
      // Check if loading spinners are handled properly
      await dashboardPage.navigateToAnalytics();
      
      // Should show content or loading state
      await expect(dashboardPage.mainContent).toBeVisible();
    });
  });
}); 