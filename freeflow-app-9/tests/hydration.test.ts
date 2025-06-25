import { test, expect } from '@playwright/test'
import { HydrationTestPage } from './page-objects/hydration-test-page'
import { hydrationTestCases, setupHydrationTest } from './fixtures/hydration-fixtures'
import {
  mockProjects,
  mockUser,
  mockStateChanges,
  mockServerProps,
  mockClientState,
  mockHydrationCases,
  mockErrorScenarios,
  mockEventHandlers,
  mockComponentStates,
  simulateHydrationMismatch
} from './fixtures/hydration-fixtures'

test.describe('Hydration Tests', () => {
  let hydrationPage: HydrationTestPage

  test.beforeEach(async ({ page }) => {
    hydrationPage = new HydrationTestPage(page)
  })

  for (const testCase of hydrationTestCases) {
    test(`should properly hydrate ${testCase.componentName}`, async ({ page }) => {
      // Setup component-specific test environment
      await setupHydrationTest(page, testCase.componentName)
      
      // Navigate to component page
      await hydrationPage.goto(`/dashboard/${testCase.componentName.toLowerCase()}`)
      
      // Wait for initial hydration
      await hydrationPage.waitForHydration()
      
      // Check for expected content
      for (const content of testCase.expectedContent) {
        await expect(page.locator(`text=${content}`)).toBeVisible()
      }
      
      // Check for hydration errors
      const hydrationErrors = await hydrationPage.getHydrationErrors()
      expect(hydrationErrors).toHaveLength(0, 'Should have no hydration errors')
      
      // Check DOM consistency
      const isDOMConsistent = await hydrationPage.checkDOMConsistency()
      expect(isDOMConsistent).toBe(true, 'DOM should be consistent between server and client')
      
      // Check state consistency
      const stateInconsistencies = await hydrationPage.checkStateConsistency()
      expect(stateInconsistencies).toHaveLength(0, 'State should be consistent between server and client')
      
      // Check event handlers
      const missingHandlers = await hydrationPage.checkEventHandlers()
      expect(missingHandlers).toHaveLength(0, 'All interactive elements should have event handlers')
      
      // If component should be tested with refresh
      if (testCase.shouldRefresh) {
        await hydrationPage.refreshAndCheckHydration()
      }
    })
  }

  test('should handle client-side navigation without hydration issues', async ({ page }) => {
    await hydrationPage.goto('/dashboard')
    await hydrationPage.waitForHydration()
    
    // Navigate between different sections
    const navigationTests = [
      { link: 'Projects Hub', path: '/dashboard/projects-hub' },
      { link: 'Video Studio', path: '/dashboard/video-studio' }
    ]
    
    for (const navTest of navigationTests) {
      await page.click(`text=${navTest.link}`)
      await page.waitForURL(`**${navTest.path}`)
      
      // Check for hydration errors after navigation
      const hydrationErrors = await hydrationPage.getHydrationErrors()
      expect(hydrationErrors).toHaveLength(0, `No hydration errors after navigating to ${navTest.link}`)
    }
  })

  test('should handle dynamic content updates without hydration issues', async ({ page }) => {
    await hydrationPage.goto('/dashboard/projects-hub')
    await hydrationPage.waitForHydration()
    
    // Test interactions that trigger dynamic updates
    const interactions = [
      { action: 'click', target: 'button:text("Create Project")' },
      { action: 'click', target: 'button:text("Import Project")' },
      { action: 'click', target: 'button:text("Quick Start")' }
    ]
    
    for (const interaction of interactions) {
      await page.click(interaction.target)
      await page.waitForTimeout(500) // Wait for any dynamic updates
      
      // Check for hydration errors after interaction
      const hydrationErrors = await hydrationPage.getHydrationErrors()
      expect(hydrationErrors).toHaveLength(0, `No hydration errors after ${interaction.action} on ${interaction.target}`)
      
      // Verify DOM consistency after interaction
      const isDOMConsistent = await hydrationPage.checkDOMConsistency()
      expect(isDOMConsistent).toBe(true, `DOM should be consistent after ${interaction.action} on ${interaction.target}`)
      
      // Close any opened modals/dialogs
      const closeButton = page.locator('button:text("Close")')
      if (await closeButton.isVisible())
        await closeButton.click()
    }
  })

  test('should handle error boundaries correctly', async ({ page }) => {
    await hydrationPage.goto('/dashboard/projects-hub')
    await hydrationPage.waitForHydration()
    
    // Simulate an error by triggering the error boundary
    await page.evaluate(() => {
      throw new Error('Simulated error for testing')
    })
    
    // Verify error boundary rendered correctly
    await expect(page.locator('text=Something went wrong')).toBeVisible()
    await expect(page.locator('button:text("Try again")')).toBeVisible()
    
    // Verify error was logged to monitoring
    const consoleErrors = await page.evaluate(() => {
      return (window as any).__NEXT_HYDRATION_ERRORS__ || []
    })
    expect(consoleErrors.length).toBeGreaterThan(0)
  })
})

test.describe('ProjectsHub Hydration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/projects-hub')
    await page.waitForLoadState('networkidle')
  })

  test('should hydrate project list without mismatches', async ({ page }) => {
    const projectCards = await page.$$('[data-testid^="project-card-"]')
    expect(projectCards.length).toBe(mockProjects.length)

    const projectsGrid = page.locator('[data-testid="projects-grid"]')
    const projectCard = page.locator('[data-testid="project-card-1"]')
    
    await expect(projectsGrid).toBeVisible()
    await expect(projectCard).toHaveAttribute('data-hydrated', 'true')
  })

  test('should handle state changes without hydration errors', async ({ page }) => {
    const statusButton = page.locator('[data-testid="status-change-button"]')
    const statusSelect = page.locator('[data-testid="status-select"]')
    const projectStatus = page.locator('[data-testid="project-status"]')
    const hydrationError = page.locator('[data-hydration-error]')

    await statusButton.click()
    await statusSelect.selectOption(mockStateChanges.projectUpdates.status)
    
    await expect(projectStatus).toHaveText(mockStateChanges.projectUpdates.status)
    await expect(hydrationError).not.toBeAttached()
  })

  test('should maintain filter state during hydration', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')
    const statusFilter = page.locator('[data-testid="status-filter"]')

    await searchInput.fill(mockClientState.searchQuery)
    await statusFilter.selectOption(mockClientState.statusFilter)
    
    await expect(searchInput).toHaveValue(mockClientState.searchQuery)
    await expect(statusFilter).toHaveValue(mockClientState.statusFilter)
  })

  test('should handle boundary cases without hydration errors', async ({ page }) => {
    const serverTime = await page.getAttribute('[data-testid="server-time"]', 'data-time')
    const clientTime = await page.evaluate(() => new Date().toISOString())
    
    if (serverTime) {
      const mismatch = simulateHydrationMismatch(serverTime, clientTime)
      expect(mismatch.hasMismatch).toBeFalsy()
    }

    await page.evaluate(`window.__TEST_PROJECTS__ = ${JSON.stringify(mockHydrationCases.dataLengths.client)}`)
    await expect(page.locator('[data-hydration-error]')).not.toBeAttached()
  })

  test('should recover from error states without hydration issues', async ({ page }) => {
    await page.route('**/api/projects', route => route.abort())
    
    const refreshButton = page.locator('[data-testid="refresh-button"]')
    const errorMessage = page.locator('[data-testid="error-message"]')
    const hydrationError = page.locator('[data-hydration-error]')

    await refreshButton.click()
    
    await expect(errorMessage).toBeVisible()
    await expect(hydrationError).not.toBeAttached()
  })
})

test.describe('Dynamic Component Hydration Tests', () => {
  test('should handle real-time updates without hydration errors', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')

    await page.evaluate(`window.__TEST_PROJECT_UPDATE__ = ${JSON.stringify(mockStateChanges.projectUpdates)}`)

    const progressElement = page.locator(`[data-testid="project-progress-${mockStateChanges.projectUpdates.id}"]`)
    const hydrationError = page.locator('[data-hydration-error]')

    await expect(progressElement).toHaveText(String(mockStateChanges.projectUpdates.progress))
    await expect(hydrationError).not.toBeAttached()
  })

  test('should maintain component state during navigation', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')

    const initialState = await page.evaluate(() => ({
      searchQuery: document.querySelector('[data-testid="search-input"]')?.getAttribute('value'),
      viewMode: document.querySelector('[data-testid="view-mode"]')?.getAttribute('data-mode')
    }))

    const navDashboard = page.locator('[data-testid="nav-dashboard"]')
    const searchInput = page.locator('[data-testid="search-input"]')
    const viewMode = page.locator('[data-testid="view-mode"]')

    await navDashboard.click()
    await page.goBack()

    if (initialState.searchQuery) {
      await expect(searchInput).toHaveValue(initialState.searchQuery)
    }
    if (initialState.viewMode) {
      await expect(viewMode).toHaveAttribute('data-mode', initialState.viewMode)
    }
  })

  test('should handle concurrent state updates without hydration errors', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')

    const statusButton = page.locator('[data-testid="status-change-button"]')
    const searchInput = page.locator('[data-testid="search-input"]')
    const viewModeToggle = page.locator('[data-testid="view-mode-toggle"]')
    const hydrationError = page.locator('[data-hydration-error]')

    await Promise.all([
      statusButton.click(),
      searchInput.fill('concurrent'),
      viewModeToggle.click()
    ])

    await expect(hydrationError).not.toBeAttached()
  })
})

test.describe('Error Boundary Hydration Tests', () => {
  test('should handle component errors without breaking hydration', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')

    await page.evaluate(() => {
      throw new Error('Simulated component error')
    })

    const errorBoundary = page.locator('[data-testid="error-boundary"]')
    const hydrationError = page.locator('[data-hydration-error]')

    await expect(errorBoundary).toBeVisible()
    await expect(hydrationError).not.toBeAttached()
  })

  test('should recover from hydration errors gracefully', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')

    await page.evaluate(`window.__TEST_HYDRATION_MISMATCH__ = ${JSON.stringify(mockHydrationCases.sortOrders)}`)

    const hydrationRecovery = page.locator('[data-testid="hydration-recovery"]')
    const projectsGrid = page.locator('[data-testid="projects-grid"]')

    await expect(hydrationRecovery).toBeVisible()
    await expect(projectsGrid).toBeVisible()
  })
})

test.describe('Performance Impact Tests', () => {
  test('should not impact performance during hydration', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/dashboard/projects-hub')

    await page.waitForSelector('[data-hydrated="true"]')

    const hydrationTime = Date.now() - startTime
    expect(hydrationTime).toBeLessThan(2000) // 2 seconds threshold
  })

  test('should maintain responsiveness during state updates', async ({ page }) => {
    await page.goto('/dashboard/projects-hub')

    const viewModeToggle = page.locator('[data-testid="view-mode-toggle"]')
    
    const startTime = Date.now()
    await viewModeToggle.click()
    const responseTime = Date.now() - startTime

    expect(responseTime).toBeLessThan(100) // 100ms threshold
  })
}) 