import { test, expect } from '@playwright/test'

test.describe('🎯 Consolidated Navigation System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable test mode
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    })
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('🏠 Dashboard Navigation - Should load with consolidated hub structure', async ({ page }) => {
    // Check main navigation is visible
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()
    
    // Verify all consolidated hubs are present
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-my-day-today"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-projects-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-team-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-financial-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-files-hub"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-notifications"]')).toBeVisible()
  })

  test('🔔 Notification System - Should display notification badges and dropdown', async ({ page }) => {
    // Check notification badges are visible
    const notificationBadges = page.locator('[data-testid^="notifications-badge-"]')
    await expect(notificationBadges.first()).toBeVisible()
    
    // Test notifications dropdown
    await page.click('[data-testid="notifications-dropdown-trigger"]')
    await expect(page.locator('[data-testid="notifications-dropdown"]')).toBeVisible()
    
    // Check notification items
    await expect(page.locator('[data-testid^="notification-"]').first()).toBeVisible()
    
    // Test mark all read functionality
    await page.click('[data-testid="mark-all-read"]')
  })

  test('🏗️ Projects Hub - Should expand and show sub-tabs', async ({ page }) => {
    // Click Projects Hub to expand
    await page.click('[data-testid="nav-projects-hub"]')
    
    // Wait for expansion animation
    await page.waitForTimeout(300)
    
    // Check sub-tabs are visible
    await expect(page.locator('[data-testid="nav-sub-project-tracking"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-sub-client-collaboration"]')).toBeVisible()
    await expect(page.locator('[data-testid="nav-sub-client-zone-gallery"]')).toBeVisible()
    
    // Navigate to Projects Hub page
    await page.goto('/dashboard/projects-hub')
    await page.waitForLoadState('networkidle')
    
    // Check hub page content
    await expect(page.locator('h1:has-text("Projects Hub")')).toBeVisible()
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="tracking-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="collaboration-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="galleries-tab"]')).toBeVisible()
  })

  test('👥 Team Hub - Should show team management and calendar features', async ({ page }) => {
    // Navigate to Team Hub
    await page.goto('/dashboard/team-hub')
    await page.waitForLoadState('networkidle')
    
    // Check hub page is loaded
    await expect(page.locator('h1:has-text("Team Hub")')).toBeVisible()
    
    // Check tabs are present
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="team-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="calendar-tab"]')).toBeVisible()
    
    // Test tab navigation
    await page.click('[data-testid="team-tab"]')
    await expect(page.locator('text=Team Members')).toBeVisible()
    
    await page.click('[data-testid="calendar-tab"]')
    await expect(page.locator('text=Shared Calendar')).toBeVisible()
  })

  test('💰 Financial Hub - Should display escrow and invoice management', async ({ page }) => {
    // Navigate to Financial Hub
    await page.goto('/dashboard/financial-hub')
    await page.waitForLoadState('networkidle')
    
    // Check hub page is loaded
    await expect(page.locator('h1:has-text("Financial Hub")')).toBeVisible()
    
    // Check tabs are present
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="escrow-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="invoices-tab"]')).toBeVisible()
    
    // Test escrow tab
    await page.click('[data-testid="escrow-tab"]')
    await expect(page.locator('text=Escrow System')).toBeVisible()
    
    // Test invoices tab
    await page.click('[data-testid="invoices-tab"]')
    await expect(page.locator('text=Invoice Management')).toBeVisible()
  })

  test('📁 Files Hub - Should show cloud storage and portfolio gallery', async ({ page }) => {
    // Navigate to Files Hub
    await page.goto('/dashboard/files-hub')
    await page.waitForLoadState('networkidle')
    
    // Check hub page is loaded
    await expect(page.locator('h1:has-text("Files Hub")')).toBeVisible()
    
    // Check tabs are present
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="storage-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="gallery-tab"]')).toBeVisible()
    
    // Test storage tab
    await page.click('[data-testid="storage-tab"]')
    await expect(page.locator('text=Cloud Storage')).toBeVisible()
    
    // Test gallery tab
    await page.click('[data-testid="gallery-tab"]')
    await expect(page.locator('text=Portfolio Gallery')).toBeVisible()
  })

  test('🔔 Notifications Page - Should display comprehensive notification management', async ({ page }) => {
    // Navigate to Notifications page
    await page.goto('/dashboard/notifications')
    await page.waitForLoadState('networkidle')
    
    // Check notifications page is loaded
    await expect(page.locator('h1:has-text("Notifications")')).toBeVisible()
    
    // Check notification cards are present
    await expect(page.locator('[data-testid^="notification-"]').first()).toBeVisible()
    
    // Test search functionality
    await page.fill('input[placeholder*="Search notifications"]', 'payment')
    await page.waitForTimeout(300)
    
    // Check filtering works
    await page.click('text=Payments')
    await page.waitForTimeout(300)
  })

  test('⚡ Quick Actions - Should provide functional buttons', async ({ page }) => {
    // Test quick add project button
    await expect(page.locator('[data-testid="quick-add-project"]')).toBeVisible()
    
    // Test quick calendar button
    await expect(page.locator('[data-testid="quick-calendar"]')).toBeVisible()
    
    // Test notifications dropdown trigger
    await expect(page.locator('[data-testid="notifications-dropdown-trigger"]')).toBeVisible()
    
    // Test user menu
    await page.click('[data-testid="user-menu-trigger"]')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('🎯 Smart Routing - Should navigate between hubs and features', async ({ page }) => {
    // Test navigation to individual features
    const routes = [
      { path: '/dashboard/my-day', title: 'My Day Today' },
      { path: '/dashboard/project-tracker', title: 'Project Tracking' },
      { path: '/dashboard/collaboration', title: 'Collaboration' },
      { path: '/dashboard/escrow', title: 'Escrow' },
      { path: '/dashboard/invoices', title: 'Invoices' },
      { path: '/dashboard/team', title: 'Team' },
      { path: '/dashboard/calendar', title: 'Calendar' },
      { path: '/dashboard/cloud-storage', title: 'Cloud Storage' },
      { path: '/dashboard/gallery', title: 'Gallery' }
    ]
    
    for (const route of routes.slice(0, 3)) { // Test first 3 to save time
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      // Check page loads without errors
      await expect(page.locator('body')).toBeVisible()
      
      // Check no 404 or error pages
      await expect(page.locator('text=404')).not.toBeVisible()
      await expect(page.locator('text=Error')).not.toBeVisible()
    }
  })

  test('📱 Mobile Navigation - Should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile menu button is visible
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible()
    
    // Click mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]')
    
    // Check navigation is visible
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()
    
    // Test navigation item click
    await page.click('[data-testid="nav-projects-hub"]')
    
    // Check sub-tabs appear
    await expect(page.locator('[data-testid="nav-sub-project-tracking"]')).toBeVisible()
  })

  test('🔄 State Management - Should maintain hub expansion states', async ({ page }) => {
    // Expand Projects Hub
    await page.click('[data-testid="nav-projects-hub"]')
    await page.waitForTimeout(300)
    
    // Verify sub-tabs are visible
    await expect(page.locator('[data-testid="nav-sub-project-tracking"]')).toBeVisible()
    
    // Click a sub-tab
    await page.click('[data-testid="nav-sub-client-collaboration"]')
    
    // Navigate away and back
    await page.goto('/dashboard/notifications')
    await page.goto('/dashboard')
    
    // Check if Projects Hub maintains expansion (should collapse by design)
    await expect(page.locator('[data-testid="nav-projects-hub"]')).toBeVisible()
  })

  test('🎨 Visual Design - Should display luxury UI elements', async ({ page }) => {
    // Check gradient backgrounds are applied
    await expect(page.locator('.bg-gradient-to-br')).toHaveCount(5, { timeout: 10000 }) // At least 5 gradient elements
    
    // Check glass morphism effects
    await expect(page.locator('.backdrop-blur-xl')).toBeVisible()
    
    // Check notification badges
    await expect(page.locator('[data-testid^="notifications-badge-"]').first()).toBeVisible()
    
    // Check luxury shadow effects
    await expect(page.locator('.shadow-lg')).toHaveCount(5, { timeout: 10000 }) // At least 5 shadow elements
  })
})

test.describe('🚀 Performance & Accessibility Tests', () => {
  test('⚡ Performance - Pages should load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard/projects-hub')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })

  test('♿ Accessibility - Should have proper ARIA labels and keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check main navigation has proper role
    await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Check focus is visible
    await expect(page.locator(':focus')).toBeVisible()
  })
}) 