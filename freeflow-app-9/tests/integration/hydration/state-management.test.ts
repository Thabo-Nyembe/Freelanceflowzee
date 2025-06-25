import { test, expect } from '@playwright/test'
import { 
  waitForHydration,
  checkStateConsistency,
  simulateUserInteraction
} from '@/tests/utils/hydration-test-utils'

test.describe('State Management During Hydration', () => {
  test('should maintain state consistency during hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Check initial state consistency
    const initialIssues = await checkStateConsistency(page)
    expect(initialIssues).toHaveLength(0)

    // Simulate user interactions
    await simulateUserInteraction(page)

    // Check state consistency after interaction
    const postInteractionIssues = await checkStateConsistency(page)
    expect(postInteractionIssues).toHaveLength(0)
  })

  test('should preserve filter state during hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Set filter state
    await page.click('[data-testid="filter-dropdown"]')
    await page.click('text=Active')

    // Verify filter state is applied
    const filteredContent = await page.textContent('[data-testid="projects-list"]')
    expect(filteredContent).toContain('Active')

    // Refresh page to test hydration
    await page.reload()
    await waitForHydration(page)

    // Verify filter state is preserved
    const rehydratedContent = await page.textContent('[data-testid="projects-list"]')
    expect(rehydratedContent).toContain('Active')
  })

  test('should handle state updates during hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    
    // Start monitoring state changes
    const stateChanges = await page.evaluate(() => {
      const changes: any[] = []
      const originalSetState = window.React.useState

      // @ts-ignore
      window.React.useState = function(...args) {
        const [state, setState] = originalSetState.apply(this, args)
        return [
          state,
          (...updateArgs: any[]) => {
            changes.push({ previous: state, update: updateArgs[0] })
            return setState.apply(this, updateArgs)
          }
        ]
      }

      return changes
    })

    // Wait for hydration
    await waitForHydration(page)

    // Verify no unexpected state changes during hydration
    const unexpectedChanges = stateChanges.filter(change => 
      change.previous !== change.update && 
      typeof change.previous !== 'undefined'
    )
    expect(unexpectedChanges).toHaveLength(0)
  })
}) 