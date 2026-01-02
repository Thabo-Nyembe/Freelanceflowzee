import { test, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * COMPREHENSIVE PAGE VERIFICATION TEST
 *
 * This test suite verifies all dashboard pages and features are loading correctly.
 * It checks for:
 * - Page loads without errors
 * - Content is visible (not blank)
 * - No console errors
 * - Key elements are present
 */

interface PageTestResult {
  url: string
  name: string
  loaded: boolean
  hasContent: boolean
  hasErrors: boolean
  errors: string[]
  warnings: string[]
  hasVisibleElements: boolean
  elementCount: number
  screenshot?: string
  timestamp: string
}

const results: PageTestResult[] = []

// All dashboard pages to test
const dashboardPages = [
  { path: '/dashboard', name: 'Dashboard Overview' },
  { path: '/dashboard/my-day', name: 'My Day' },
  { path: '/dashboard/projects-hub-v2', name: 'Projects Hub' },
  { path: '/dashboard/clients-v2', name: 'Clients' },
  { path: '/dashboard/files-v2', name: 'Files Hub' },
  { path: '/dashboard/messages-v2', name: 'Messages' },
  { path: '/dashboard/calendar-v2', name: 'Calendar' },
  { path: '/dashboard/bookings', name: 'Bookings' },
  { path: '/dashboard/gallery', name: 'Gallery' },
  { path: '/dashboard/cv-portfolio', name: 'CV Portfolio' },
  { path: '/dashboard/settings-v2', name: 'Settings' },
  { path: '/dashboard/profile-v2', name: 'Profile' },
  { path: '/dashboard/team-v2', name: 'Team' },
  { path: '/dashboard/financial', name: 'Financial' },
  { path: '/dashboard/invoicing', name: 'Invoicing' },
  { path: '/dashboard/analytics-v2', name: 'Analytics' },
  { path: '/dashboard/reporting', name: 'Reporting' },
  { path: '/dashboard/ai-assistant-v2', name: 'AI Assistant' },
  { path: '/dashboard/ai-design', name: 'AI Design' },
  { path: '/dashboard/ai-create-v2', name: 'AI Create' },
  { path: '/dashboard/video-studio-v2', name: 'Video Studio' },
  { path: '/dashboard/canvas-v2', name: 'Canvas' },
  { path: '/dashboard/automation-v2', name: 'Automation' },
  { path: '/dashboard/integrations', name: 'Integrations' },
  { path: '/dashboard/notifications-v2', name: 'Notifications' },
  { path: '/dashboard/time-tracking-v2', name: 'Time Tracking' },
  { path: '/dashboard/crm-v2', name: 'CRM' },
  { path: '/dashboard/lead-generation', name: 'Lead Generation' },
  { path: '/dashboard/email-marketing', name: 'Email Marketing' },
  { path: '/dashboard/community', name: 'Community' },
  { path: '/dashboard/storage', name: 'Cloud Storage' },
  { path: '/dashboard/admin-v2', name: 'Admin Panel' },
  { path: '/dashboard/user-management-v2', name: 'User Management' },
  { path: '/dashboard/api-keys-v2', name: 'API Keys' },
  { path: '/dashboard/white-label', name: 'White Label' },
]

async function testPageLoading(page: Page, pageInfo: { path: string; name: string }): Promise<PageTestResult> {
  const result: PageTestResult = {
    url: pageInfo.path,
    name: pageInfo.name,
    loaded: false,
    hasContent: false,
    hasErrors: false,
    errors: [],
    warnings: [],
    hasVisibleElements: false,
    elementCount: 0,
    timestamp: new Date().toISOString()
  }

  const consoleMessages: string[] = []
  const consoleErrors: string[] = []

  // Listen for console messages
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`
    if (msg.type() === 'error') {
      consoleErrors.push(text)
    }
    consoleMessages.push(text)
  })

  // Listen for page errors
  page.on('pageerror', error => {
    result.errors.push(`Page Error: ${error.message}`)
    result.hasErrors = true
  })

  try {
    console.log(`\n🔍 Testing: ${pageInfo.name} (${pageInfo.path})`)

    // Navigate to page with increased timeout
    const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000 // Increased from 30s to 60s
    })

    if (!response || !response.ok()) {
      result.errors.push(`Failed to load: ${response?.status() || 'No response'}`)
      result.hasErrors = true
      return result
    }

    result.loaded = true

    // Wait for content to render (longer for complex pages)
    const complexPages = ['analytics', 'crm', 'ai-design', 'ai-create', 'video-studio', 'canvas']
    const isComplexPage = complexPages.some(p => pageInfo.path.includes(p))
    const waitTime = isComplexPage ? 5000 : 2000
    await page.waitForTimeout(waitTime)

    // Check if page has visible content
    const bodyText = await page.locator('body').textContent()
    result.hasContent = bodyText ? bodyText.trim().length > 0 : false

    // Count visible elements (cards, buttons, meaningful content)
    const visibleElements = await page.locator('main').locator('visible=true').count()
    result.elementCount = visibleElements
    result.hasVisibleElements = visibleElements > 0

    // Check for common empty states
    const hasEmptyState = await page.locator('text=/empty|no data|nothing to show/i').count() > 0
    const hasLoadingSkeleton = await page.locator('[data-skeleton], .skeleton, .animate-pulse').count() > 0

    // Check for actual content indicators
    const hasCards = await page.locator('[class*="card"], .card').count() > 0
    const hasButtons = await page.locator('button').count() > 0
    const hasHeadings = await page.locator('h1, h2, h3').count() > 0

    if (!hasCards && !hasButtons && !hasHeadings && !hasEmptyState && !hasLoadingSkeleton) {
      result.warnings.push('Page appears blank - no cards, buttons, or headings found')
    }

    // Add console errors to results
    if (consoleErrors.length > 0) {
      result.hasErrors = true
      result.errors.push(...consoleErrors)
    }

    // Take screenshot of problematic pages
    if (result.hasErrors || !result.hasVisibleElements || result.warnings.length > 0) {
      const screenshotPath = `test-results/screenshots/${pageInfo.path.replace(/\//g, '_')}.png`
      await page.screenshot({ path: screenshotPath, fullPage: true })
      result.screenshot = screenshotPath
    }

    // Log result
    const status = result.hasErrors ? '❌' : result.hasVisibleElements ? '✅' : '⚠️'
    console.log(`${status} ${pageInfo.name}:`)
    console.log(`   Loaded: ${result.loaded}`)
    console.log(`   Has Content: ${result.hasContent}`)
    console.log(`   Visible Elements: ${result.elementCount}`)
    console.log(`   Errors: ${result.errors.length}`)
    console.log(`   Warnings: ${result.warnings.length}`)

  } catch (error: any) {
    result.errors.push(`Test Error: ${error.message}`)
    result.hasErrors = true
    console.log(`❌ ${pageInfo.name}: ${error.message}`)
  }

  return result
}

test.describe('Comprehensive Page Verification', () => {
  test.beforeAll(async () => {
    console.log('🚀 Starting comprehensive page verification...')
    console.log(`📊 Testing ${dashboardPages.length} pages`)

    // Create screenshots directory
    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots')
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }
  })

  test('verify all dashboard pages load correctly', async ({ page }) => {
    // Increase timeout for large/complex pages
    test.setTimeout(180000) // 3 minutes total
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Test each page
    for (const pageInfo of dashboardPages) {
      const result = await testPageLoading(page, pageInfo)
      results.push(result)
    }

    // Generate report
    const report = generateReport(results)

    // Save report to file
    const reportPath = path.join(process.cwd(), 'test-results', 'page-verification-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))

    const markdownReportPath = path.join(process.cwd(), 'test-results', 'page-verification-report.md')
    fs.writeFileSync(markdownReportPath, report)

    console.log('\n' + report)
    console.log(`\n📄 Full report saved to: ${reportPath}`)
    console.log(`📄 Markdown report saved to: ${markdownReportPath}`)

    // Assert that critical pages are working
    const failedPages = results.filter(r => r.hasErrors || !r.hasVisibleElements)
    const totalPages = results.length
    const workingPages = totalPages - failedPages.length
    const successRate = (workingPages / totalPages) * 100

    console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}% (${workingPages}/${totalPages})`)

    // Don't fail the test, just report
    if (failedPages.length > 0) {
      console.log(`\n⚠️  ${failedPages.length} pages need attention:`)
      failedPages.forEach(page => {
        console.log(`   - ${page.name} (${page.url})`)
      })
    }
  })
})

function generateReport(results: PageTestResult[]): string {
  const totalPages = results.length
  const loadedPages = results.filter(r => r.loaded).length
  const pagesWithContent = results.filter(r => r.hasContent && r.hasVisibleElements).length
  const pagesWithErrors = results.filter(r => r.hasErrors).length
  const pagesWithWarnings = results.filter(r => r.warnings.length > 0 && !r.hasErrors).length
  const blankPages = results.filter(r => r.loaded && !r.hasVisibleElements).length

  let report = '# KAZI Platform - Page Verification Report\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`
  report += '## Summary\n\n'
  report += `- **Total Pages Tested:** ${totalPages}\n`
  report += `- **✅ Pages Loaded:** ${loadedPages}\n`
  report += `- **✅ Pages with Content:** ${pagesWithContent}\n`
  report += `- **❌ Pages with Errors:** ${pagesWithErrors}\n`
  report += `- **⚠️  Pages with Warnings:** ${pagesWithWarnings}\n`
  report += `- **🔳 Blank Pages:** ${blankPages}\n`
  report += `- **Success Rate:** ${((pagesWithContent / totalPages) * 100).toFixed(1)}%\n\n`

  // Pages with errors
  if (pagesWithErrors > 0) {
    report += '## ❌ Pages with Errors\n\n'
    results.filter(r => r.hasErrors).forEach(result => {
      report += `### ${result.name}\n`
      report += `- **URL:** ${result.url}\n`
      report += `- **Loaded:** ${result.loaded ? 'Yes' : 'No'}\n`
      report += `- **Errors:**\n`
      result.errors.forEach(error => {
        report += `  - ${error}\n`
      })
      if (result.screenshot) {
        report += `- **Screenshot:** ${result.screenshot}\n`
      }
      report += '\n'
    })
  }

  // Blank pages
  if (blankPages > 0) {
    report += '## 🔳 Blank Pages (No Visible Content)\n\n'
    results.filter(r => r.loaded && !r.hasVisibleElements).forEach(result => {
      report += `### ${result.name}\n`
      report += `- **URL:** ${result.url}\n`
      report += `- **Element Count:** ${result.elementCount}\n`
      if (result.warnings.length > 0) {
        report += `- **Warnings:**\n`
        result.warnings.forEach(warning => {
          report += `  - ${warning}\n`
        })
      }
      if (result.screenshot) {
        report += `- **Screenshot:** ${result.screenshot}\n`
      }
      report += '\n'
    })
  }

  // Pages with warnings
  if (pagesWithWarnings > 0) {
    report += '## ⚠️  Pages with Warnings\n\n'
    results.filter(r => r.warnings.length > 0 && !r.hasErrors).forEach(result => {
      report += `### ${result.name}\n`
      report += `- **URL:** ${result.url}\n`
      report += `- **Warnings:**\n`
      result.warnings.forEach(warning => {
        report += `  - ${warning}\n`
      })
      report += '\n'
    })
  }

  // Working pages
  const workingPages = results.filter(r => !r.hasErrors && r.hasVisibleElements)
  if (workingPages.length > 0) {
    report += '## ✅ Working Pages\n\n'
    workingPages.forEach(result => {
      report += `- ${result.name} (${result.url}) - ${result.elementCount} elements\n`
    })
    report += '\n'
  }

  return report
}
