import { test, expect } from '@playwright/test'
import { 
  checkHydrationErrors,
  waitForHydration,
  checkDOMConsistency
} from '@/tests/utils/hydration-test-utils'

test.describe('Basic Hydration Tests', () => {
  test('should hydrate ProjectsHub without errors', async ({ page }) => {
    const hydrationMonitor = await checkHydrationErrors(page)
    
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Check for hydration errors
    expect(hydrationMonitor.hasErrors()).toBe(false)
    
    // Check DOM consistency
    const domIssues = await checkDOMConsistency(page)
    expect(domIssues).toHaveLength(0)
  })

  test('should maintain DOM consistency after hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    await waitForHydration(page)

    // Get initial DOM snapshot
    const initialDOM = await page.evaluate(() => document.documentElement.innerHTML)

    // Wait a bit to ensure all hydration is complete
    await page.waitForTimeout(1000)

    // Get final DOM snapshot
    const finalDOM = await page.evaluate(() => document.documentElement.innerHTML)

    // Compare snapshots (excluding dynamic content)
    const cleanSnapshot = (html: string) => {
      return html
        .replace(/data-reactid="[^"]*"/g, '')
        .replace(/data-react-checksum="[^"]*"/g, '')
        .replace(/data-react-server-rendered="[^"]*"/g, '')
    }

    expect(cleanSnapshot(initialDOM)).toBe(cleanSnapshot(finalDOM))
  })

  test('should preserve server-rendered content during hydration', async ({ page }) => {
    // Navigate to projects hub
    await page.goto('/dashboard/projects-hub')
    
    // Capture server-rendered content before hydration
    const serverContent = await page.textContent('[data-testid="projects-hub"]')
    
    // Wait for hydration
    await waitForHydration(page)
    
    // Capture client-rendered content after hydration
    const clientContent = await page.textContent('[data-testid="projects-hub"]')
    
    // Compare content (excluding dynamic elements)
    expect(serverContent?.trim()).toBe(clientContent?.trim())
  })
}) 