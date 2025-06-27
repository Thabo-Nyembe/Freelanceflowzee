import { test, expect } from &apos;@playwright/test&apos;
import { 
  checkHydrationErrors,
  waitForHydration,
  checkDOMConsistency
} from &apos;@/tests/utils/hydration-test-utils&apos;

test.describe(&apos;Basic Hydration Tests&apos;, () => {
  test(&apos;should hydrate ProjectsHub without errors&apos;, async ({ page }) => {
    const hydrationMonitor = await checkHydrationErrors(page)
    
    // Navigate to projects hub
    await page.goto(&apos;/dashboard/projects-hub&apos;)
    await waitForHydration(page)

    // Check for hydration errors
    expect(hydrationMonitor.hasErrors()).toBe(false)
    
    // Check DOM consistency
    const domIssues = await checkDOMConsistency(page)
    expect(domIssues).toHaveLength(0)
  })

  test(&apos;should maintain DOM consistency after hydration&apos;, async ({ page }) => {
    // Navigate to projects hub
    await page.goto(&apos;/dashboard/projects-hub&apos;)
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
        .replace(/data-reactid=&quot;[^&quot;]*&quot;/g, '&apos;)
        .replace(/data-react-checksum=&quot;[^&quot;]*&quot;/g, '&apos;)
        .replace(/data-react-server-rendered=&quot;[^&quot;]*&quot;/g, '&apos;)
    }

    expect(cleanSnapshot(initialDOM)).toBe(cleanSnapshot(finalDOM))
  })

  test(&apos;should preserve server-rendered content during hydration&apos;, async ({ page }) => {
    // Navigate to projects hub
    await page.goto(&apos;/dashboard/projects-hub&apos;)
    
    // Capture server-rendered content before hydration
    const serverContent = await page.textContent(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)
    
    // Wait for hydration
    await waitForHydration(page)
    
    // Capture client-rendered content after hydration
    const clientContent = await page.textContent(&apos;[data-testid=&quot;projects-hub&quot;]&apos;)
    
    // Compare content (excluding dynamic elements)
    expect(serverContent?.trim()).toBe(clientContent?.trim())
  })
}) 