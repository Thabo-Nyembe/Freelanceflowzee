import { test } from '@playwright/test'

const BASE_URL = 'http://localhost:9323'

// Batch 2 - 50 more V2 pages to test
const v2PagesBatch2 = [
  // Additional core pages
  'calendar', 'chat', 'clients', 'analytics', 'admin',
  'billing', 'campaigns', 'canvas', 'capacity', 'certifications',

  // Communication & Collaboration
  'messaging', 'notifications', 'community', 'collaboration',

  // Business pages
  'invoices', 'invoicing', 'expenses', 'budgets', 'contracts',
  'escrow', 'crm', 'customers', 'customer-success', 'customer-support',

  // Content & Media
  'content', 'content-studio', 'media-library', 'gallery', 'audio-studio',

  // DevOps & Technical
  'builds', 'ci-cd', 'deployments', 'dependencies', 'documentation',
  'logs', 'monitoring', 'automation', 'automations', 'backups',

  // AI & Learning
  'ai-assistant', 'ai-create', 'ai-design', 'learning', 'courses',

  // Admin & Settings
  'api', 'api-keys', 'alerts', 'audit', 'audit-logs',

  // Team & HR
  'employees', 'onboarding', 'training', 'recruitment',

  // Additional
  'changelog', 'faq', 'features', 'feedback', 'upgrades-showcase'
]

test.describe('V2 Batch 2 Testing (50 more pages)', () => {
  test('Test additional 50 V2 pages', async ({ page }) => {
    const results: { page: string, status: number, hasError: boolean, errorText?: string }[] = []

    for (const pageName of v2PagesBatch2) {
      try {
        const response = await page.goto(`${BASE_URL}/v2/dashboard/${pageName}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        })

        await page.waitForTimeout(1500)

        // Take screenshot
        await page.screenshot({
          path: `test-results/v2-batch2/${pageName}.png`,
          fullPage: false
        })

        const content = await page.textContent('body')

        // More specific error detection - avoid false positives
        const hasBuildError = content?.includes('Build Error') ||
                             content?.includes('Unhandled Runtime Error') ||
                             content?.includes('Module not found') ||
                             content?.includes('is defined multiple times')

        const status = response?.status() || 0

        const result: { page: string; status: number; hasError: boolean; errorText?: string } = {
          page: pageName,
          status,
          hasError: status >= 400 || !!hasBuildError
        }
        if (hasBuildError) {
          result.errorText = 'Build/Runtime error detected'
        }
        results.push(result)

        const statusIcon = status === 200 && !hasBuildError ? '✓' : '✗'
        console.log(`${statusIcon} ${pageName}: ${status}${hasBuildError ? ' (BUILD ERROR)' : ''}`)
      } catch (err: any) {
        console.log(`✗ ${pageName}: TIMEOUT/ERROR - ${err.message?.slice(0, 50)}`)
        results.push({ page: pageName, status: 0, hasError: true, errorText: err.message })
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('V2 BATCH 2 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total pages tested: ${results.length}`)
    console.log(`Passing (200, no errors): ${results.filter(r => r.status === 200 && !r.hasError).length}`)
    console.log(`Server errors (5xx): ${results.filter(r => r.status >= 500).length}`)
    console.log(`Client errors (4xx): ${results.filter(r => r.status >= 400 && r.status < 500).length}`)
    console.log(`With build errors: ${results.filter(r => r.hasError).length}`)

    // List failures
    const failures = results.filter(r => r.status !== 200 || r.hasError)
    if (failures.length > 0) {
      console.log('\nFailed pages:')
      failures.forEach(f => console.log(`  - ${f.page}: ${f.status} ${f.errorText || ''}`))
    } else {
      console.log('\nAll pages passed!')
    }

    console.log('='.repeat(60))
  })
})
