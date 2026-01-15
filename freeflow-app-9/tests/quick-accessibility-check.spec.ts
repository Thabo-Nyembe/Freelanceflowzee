import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Quick accessibility check on analytics page', async ({ page }) => {
  await page.goto('/v2/dashboard/analytics')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000) // Wait for dynamic content

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  console.log('\n=== ACCESSIBILITY VIOLATIONS ===')
  console.log(`Total violations: ${accessibilityScanResults.violations.length}`)

  for (const violation of accessibilityScanResults.violations) {
    console.log(`\n${violation.id}: ${violation.description}`)
    console.log(`Impact: ${violation.impact}`)
    console.log(`Affected elements: ${violation.nodes.length}`)
    console.log(`Help: ${violation.helpUrl}`)

    // Show first 3 affected elements
    violation.nodes.slice(0, 3).forEach((node, idx) => {
      console.log(`  ${idx + 1}. ${node.html.substring(0, 100)}...`)
      console.log(`     ${node.failureSummary}`)
    })
  }

  // This test is for debugging - we expect violations to see what needs fixing
  console.log('\n=== END VIOLATIONS ===\n')
})
