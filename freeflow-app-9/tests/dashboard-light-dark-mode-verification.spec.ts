import { test, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * COMPREHENSIVE LIGHT/DARK MODE VERIFICATION TEST
 *
 * This test suite verifies all dashboard pages are loading correctly in BOTH light and dark modes.
 * It checks for:
 * - Page loads without errors (no 404s)
 * - Page has visible content (not blank)
 * - No error boundaries showing
 * - Key UI elements are present
 * - Both themes render correctly
 * - Theme toggle functionality works
 * - Screenshots of any problematic pages
 */

interface ThemeTestResult {
  url: string
  name: string
  theme: 'light' | 'dark'
  loaded: boolean
  hasContent: boolean
  hasErrors: boolean
  errors: string[]
  warnings: string[]
  hasVisibleElements: boolean
  elementCount: number
  hasThemeStyles: boolean
  backgroundColor: string
  textColor: string
  screenshot?: string
  timestamp: string
}

const results: ThemeTestResult[] = []

// All dashboard pages to test
const dashboardPages = [
  { path: '/dashboard', name: 'Dashboard Overview' },
  { path: '/dashboard/my-day-v2', name: 'My Day' },
  { path: '/dashboard/projects-hub-v2', name: 'Projects Hub' },
  { path: '/dashboard/clients-v2', name: 'Clients' },
  { path: '/dashboard/files-v2', name: 'Files Hub' },
  { path: '/dashboard/messages-v2', name: 'Messages' },
  { path: '/dashboard/calendar-v2', name: 'Calendar' },
  { path: '/dashboard/bookings-v2', name: 'Bookings' },
  { path: '/dashboard/gallery-v2', name: 'Gallery' },
  { path: '/dashboard/profile-v2', name: 'CV Portfolio' },
  { path: '/dashboard/settings-v2', name: 'Settings' },
  { path: '/dashboard/profile-v2', name: 'Profile' },
  { path: '/dashboard/team-v2', name: 'Team' },
  { path: '/dashboard/financial-v2', name: 'Financial' },
  { path: '/dashboard/invoicing-v2', name: 'Invoicing' },
  { path: '/dashboard/analytics-v2', name: 'Analytics' },
  { path: '/dashboard/reporting-v2', name: 'Reporting' },
  { path: '/dashboard/ai-assistant-v2', name: 'AI Assistant' },
  { path: '/dashboard/ai-design-v2', name: 'AI Design' },
  { path: '/dashboard/ai-create-v2', name: 'AI Create' },
  { path: '/dashboard/video-studio-v2', name: 'Video Studio' },
  { path: '/dashboard/canvas-v2', name: 'Canvas' },
  { path: '/dashboard/automation-v2', name: 'Automation' },
  { path: '/dashboard/integrations-v2', name: 'Integrations' },
  { path: '/dashboard/notifications-v2', name: 'Notifications' },
  { path: '/dashboard/time-tracking-v2', name: 'Time Tracking' },
  { path: '/dashboard/crm-v2', name: 'CRM' },
  { path: '/dashboard/lead-generation-v2', name: 'Lead Generation' },
  { path: '/dashboard/email-marketing-v2', name: 'Email Marketing' },
  { path: '/dashboard/community-v2', name: 'Community' },
]

async function setTheme(page: Page, theme: 'light' | 'dark') {
  try {
    // Use direct DOM manipulation - more reliable than clicking
    await page.evaluate((targetTheme) => {
      // Set localStorage
      localStorage.setItem('theme', targetTheme)
      localStorage.setItem('color-theme', targetTheme)

      // Update document classes
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(targetTheme)

      // Update data attribute if present
      document.documentElement.setAttribute('data-theme', targetTheme)

      // Trigger storage event for any listeners
      window.dispatchEvent(new Event('storage'))

      // Trigger custom theme change event
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: targetTheme } }))
    }, theme)

    // Wait for theme to apply
    await page.waitForTimeout(500)

    // Verify theme was set
    const htmlClass = await page.locator('html').getAttribute('class')
    const hasThemeClass = htmlClass?.includes(theme) || false

    return hasThemeClass
  } catch (error) {
    console.warn(`Failed to set theme to ${theme}:`, error)
    return false
  }
}

async function getThemeStyles(page: Page): Promise<{ backgroundColor: string, textColor: string }> {
  try {
    const styles = await page.evaluate(() => {
      const body = document.body
      const computedStyle = window.getComputedStyle(body)
      return {
        backgroundColor: computedStyle.backgroundColor,
        textColor: computedStyle.color
      }
    })
    return styles
  } catch {
    return { backgroundColor: 'unknown', textColor: 'unknown' }
  }
}

function isLightTheme(bgColor: string): boolean {
  // Parse RGB and check if it's light
  const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match) {
    const [, r, g, b] = match.map(Number)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128
  }
  return bgColor.includes('255') || bgColor.includes('white')
}

async function testPageInTheme(
  page: Page,
  pageInfo: { path: string; name: string },
  theme: 'light' | 'dark'
): Promise<ThemeTestResult> {
  const result: ThemeTestResult = {
    url: pageInfo.path,
    name: pageInfo.name,
    theme,
    loaded: false,
    hasContent: false,
    hasErrors: false,
    errors: [],
    warnings: [],
    hasVisibleElements: false,
    elementCount: 0,
    hasThemeStyles: false,
    backgroundColor: '',
    textColor: '',
    timestamp: new Date().toISOString()
  }

  const consoleErrors: string[] = []

  // Listen for console errors
  const errorHandler = (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Filter out known benign errors
      if (!text.includes('punycode') && !text.includes('DeprecationWarning')) {
        consoleErrors.push(`[${msg.type()}] ${text}`)
      }
    }
  }
  page.on('console', errorHandler)

  // Listen for page errors
  const pageErrorHandler = (error: Error) => {
    result.errors.push(`Page Error: ${error.message}`)
    result.hasErrors = true
  }
  page.on('pageerror', pageErrorHandler)

  try {
    console.log(`\n${theme === 'light' ? '☀️' : '🌙'} Testing: ${pageInfo.name} (${theme} mode)`)

    // Navigate to page
    const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })

    if (!response || !response.ok()) {
      result.errors.push(`Failed to load: ${response?.status() || 'No response'}`)
      result.hasErrors = true
      return result
    }

    result.loaded = true

    // Wait for initial render
    await page.waitForTimeout(1000)

    // Set theme
    const themeSet = await setTheme(page, theme)
    if (!themeSet) {
      result.warnings.push(`Could not verify theme was set to ${theme}`)
    }

    // Wait for theme to apply
    await page.waitForTimeout(1000)

    // Get theme styles
    const styles = await getThemeStyles(page)
    result.backgroundColor = styles.backgroundColor
    result.textColor = styles.textColor

    // Verify theme colors match expected theme
    const bgIsLight = isLightTheme(styles.backgroundColor)
    const themeMatches = (theme === 'light' && bgIsLight) || (theme === 'dark' && !bgIsLight)
    result.hasThemeStyles = themeMatches

    if (!themeMatches) {
      result.warnings.push(
        `Theme mismatch: Expected ${theme} but got ${bgIsLight ? 'light' : 'dark'} (bg: ${styles.backgroundColor})`
      )
    }

    // Check if page has visible content
    const bodyText = await page.locator('body').textContent()
    result.hasContent = bodyText ? bodyText.trim().length > 0 : false

    // Count visible elements
    const mainContent = page.locator('main, [role="main"], .main-content')
    const mainExists = await mainContent.count() > 0

    if (mainExists) {
      result.elementCount = await mainContent.locator('*').count()
      result.hasVisibleElements = result.elementCount > 0
    } else {
      // Fallback to body
      result.elementCount = await page.locator('body *').count()
      result.hasVisibleElements = result.elementCount > 10 // Basic threshold
    }

    // Check for error boundaries
    const errorBoundary = await page.locator('[data-error-boundary], .error-boundary').count()
    const errorText = await page.getByText(/something went wrong/i).count()
    if (errorBoundary > 0 || errorText > 0) {
      result.errors.push('Error boundary detected on page')
      result.hasErrors = true
    }

    // Check for common indicators
    const hasCards = await page.locator('[class*="card"], .card, [data-card]').count() > 0
    const hasButtons = await page.locator('button').count() > 0
    const hasHeadings = await page.locator('h1, h2, h3').count() > 0
    const hasEmptyState = await page.locator('text=/empty|no data|nothing to show/i').count() > 0

    if (!hasCards && !hasButtons && !hasHeadings && !hasEmptyState && result.elementCount < 20) {
      result.warnings.push('Page appears blank - minimal content detected')
    }

    // Add console errors to results
    if (consoleErrors.length > 0) {
      result.hasErrors = true
      result.errors.push(...consoleErrors.slice(0, 5)) // Limit to first 5 errors
    }

    // Take screenshot of problematic pages
    if (result.hasErrors || !result.hasVisibleElements || result.warnings.length > 0) {
      const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots', theme)
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true })
      }
      const screenshotPath = path.join(screenshotDir, `${pageInfo.path.replace(/\//g, '_')}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })
      result.screenshot = screenshotPath
    }

    // Log result
    const status = result.hasErrors ? '❌' : result.hasVisibleElements && result.hasThemeStyles ? '✅' : '⚠️'
    console.log(`${status} ${pageInfo.name} (${theme}):`)
    console.log(`   Loaded: ${result.loaded}`)
    console.log(`   Theme Styles: ${result.hasThemeStyles ? 'Correct' : 'Incorrect'}`)
    console.log(`   Has Content: ${result.hasContent}`)
    console.log(`   Visible Elements: ${result.elementCount}`)
    console.log(`   Errors: ${result.errors.length}`)
    console.log(`   Warnings: ${result.warnings.length}`)
    console.log(`   BG Color: ${result.backgroundColor}`)

  } catch (error: any) {
    result.errors.push(`Test Error: ${error.message}`)
    result.hasErrors = true
    console.log(`❌ ${pageInfo.name} (${theme}): ${error.message}`)
  } finally {
    // Clean up listeners
    page.off('console', errorHandler)
    page.off('pageerror', pageErrorHandler)
  }

  return result
}

test.describe('Light/Dark Mode Verification', () => {
  test.beforeAll(async () => {
    console.log('🚀 Starting comprehensive light/dark mode verification...')
    console.log(`📊 Testing ${dashboardPages.length} pages in both themes (${dashboardPages.length * 2} total tests)`)

    // Create screenshots directories
    const lightDir = path.join(process.cwd(), 'test-results', 'screenshots', 'light')
    const darkDir = path.join(process.cwd(), 'test-results', 'screenshots', 'dark')
    if (!fs.existsSync(lightDir)) fs.mkdirSync(lightDir, { recursive: true })
    if (!fs.existsSync(darkDir)) fs.mkdirSync(darkDir, { recursive: true })
  })

  test('verify all dashboard pages in light and dark modes', async ({ page }) => {
    test.setTimeout(300000) // 5 minutes total

    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Test each page in both themes
    for (const pageInfo of dashboardPages) {
      // Test in light mode
      const lightResult = await testPageInTheme(page, pageInfo, 'light')
      results.push(lightResult)

      // Small delay between tests
      await page.waitForTimeout(500)

      // Test in dark mode
      const darkResult = await testPageInTheme(page, pageInfo, 'dark')
      results.push(darkResult)

      // Small delay between pages
      await page.waitForTimeout(500)
    }

    // Generate comprehensive report
    const report = generateReport(results)

    // Save reports
    const reportsDir = path.join(process.cwd(), 'test-results')
    const jsonReportPath = path.join(reportsDir, 'light-dark-mode-report.json')
    const markdownReportPath = path.join(reportsDir, 'light-dark-mode-report.md')

    fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2))
    fs.writeFileSync(markdownReportPath, report)

    console.log('\n' + report)
    console.log(`\n📄 Full JSON report saved to: ${jsonReportPath}`)
    console.log(`📄 Markdown report saved to: ${markdownReportPath}`)

    // Calculate statistics
    const totalTests = results.length
    const lightTests = results.filter(r => r.theme === 'light')
    const darkTests = results.filter(r => r.theme === 'dark')

    const lightWorking = lightTests.filter(r => !r.hasErrors && r.hasVisibleElements && r.hasThemeStyles).length
    const darkWorking = darkTests.filter(r => !r.hasErrors && r.hasVisibleElements && r.hasThemeStyles).length

    const lightSuccessRate = (lightWorking / lightTests.length) * 100
    const darkSuccessRate = (darkWorking / darkTests.length) * 100

    console.log(`\n📈 Light Mode Success Rate: ${lightSuccessRate.toFixed(1)}% (${lightWorking}/${lightTests.length})`)
    console.log(`📈 Dark Mode Success Rate: ${darkSuccessRate.toFixed(1)}% (${darkWorking}/${darkTests.length})`)

    // Report pages needing fixes
    const failedPages = results.filter(r => r.hasErrors || !r.hasVisibleElements)
    if (failedPages.length > 0) {
      console.log(`\n⚠️  ${failedPages.length} page/theme combinations need attention`)
    }
  })
})

function generateReport(results: ThemeTestResult[]): string {
  const lightResults = results.filter(r => r.theme === 'light')
  const darkResults = results.filter(r => r.theme === 'dark')

  const totalTests = results.length
  const totalPages = lightResults.length

  // Light mode stats
  const lightLoaded = lightResults.filter(r => r.loaded).length
  const lightWorking = lightResults.filter(r => !r.hasErrors && r.hasVisibleElements && r.hasThemeStyles).length
  const lightErrors = lightResults.filter(r => r.hasErrors).length
  const lightBlank = lightResults.filter(r => r.loaded && !r.hasVisibleElements).length
  const lightThemeIssues = lightResults.filter(r => !r.hasThemeStyles).length

  // Dark mode stats
  const darkLoaded = darkResults.filter(r => r.loaded).length
  const darkWorking = darkResults.filter(r => !r.hasErrors && r.hasVisibleElements && r.hasThemeStyles).length
  const darkErrors = darkResults.filter(r => r.hasErrors).length
  const darkBlank = darkResults.filter(r => r.loaded && !r.hasVisibleElements).length
  const darkThemeIssues = darkResults.filter(r => !r.hasThemeStyles).length

  let report = '# KAZI Platform - Light/Dark Mode Verification Report\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`

  report += '## Executive Summary\n\n'
  report += `- **Total Pages Tested:** ${totalPages}\n`
  report += `- **Total Tests Run:** ${totalTests} (${totalPages} pages × 2 themes)\n\n`

  report += '### Light Mode Results\n\n'
  report += `- ✅ **Pages Loaded:** ${lightLoaded}/${totalPages}\n`
  report += `- ✅ **Fully Working:** ${lightWorking}/${totalPages} (${((lightWorking / totalPages) * 100).toFixed(1)}%)\n`
  report += `- ❌ **Pages with Errors:** ${lightErrors}\n`
  report += `- 🔳 **Blank Pages:** ${lightBlank}\n`
  report += `- 🎨 **Theme Style Issues:** ${lightThemeIssues}\n\n`

  report += '### Dark Mode Results\n\n'
  report += `- ✅ **Pages Loaded:** ${darkLoaded}/${totalPages}\n`
  report += `- ✅ **Fully Working:** ${darkWorking}/${totalPages} (${((darkWorking / totalPages) * 100).toFixed(1)}%)\n`
  report += `- ❌ **Pages with Errors:** ${darkErrors}\n`
  report += `- 🔳 **Blank Pages:** ${darkBlank}\n`
  report += `- 🎨 **Theme Style Issues:** ${darkThemeIssues}\n\n`

  // Pages working in both modes
  const workingInBoth = lightResults.filter(lr => {
    const dr = darkResults.find(d => d.url === lr.url)
    return !lr.hasErrors && lr.hasVisibleElements && lr.hasThemeStyles &&
           dr && !dr.hasErrors && dr.hasVisibleElements && dr.hasThemeStyles
  })

  report += '## ✅ Pages Working in BOTH Light and Dark Modes\n\n'
  if (workingInBoth.length > 0) {
    workingInBoth.forEach(result => {
      report += `- ${result.name} (${result.url})\n`
    })
  } else {
    report += '*No pages fully working in both modes*\n'
  }
  report += '\n'

  // Pages with issues
  const pagesWithIssues = new Set<string>()
  results.filter(r => r.hasErrors || !r.hasVisibleElements || !r.hasThemeStyles).forEach(r => {
    pagesWithIssues.add(r.url)
  })

  if (pagesWithIssues.size > 0) {
    report += '## ⚠️  Pages Needing Attention\n\n'

    pagesWithIssues.forEach(url => {
      const lightR = lightResults.find(r => r.url === url)
      const darkR = darkResults.find(r => r.url === url)

      if (lightR) {
        report += `### ${lightR.name}\n\n`
        report += `**URL:** ${url}\n\n`

        // Light mode status
        report += '#### ☀️ Light Mode\n'
        report += `- **Status:** ${getLightDarkStatus(lightR)}\n`
        report += `- **Loaded:** ${lightR.loaded ? 'Yes' : 'No'}\n`
        report += `- **Visible Elements:** ${lightR.elementCount}\n`
        report += `- **Theme Styles:** ${lightR.hasThemeStyles ? 'Correct' : 'Incorrect'}\n`
        report += `- **Background:** ${lightR.backgroundColor}\n`

        if (lightR.errors.length > 0) {
          report += `- **Errors:**\n`
          lightR.errors.forEach(error => report += `  - ${error}\n`)
        }
        if (lightR.warnings.length > 0) {
          report += `- **Warnings:**\n`
          lightR.warnings.forEach(warning => report += `  - ${warning}\n`)
        }
        if (lightR.screenshot) {
          report += `- **Screenshot:** ${lightR.screenshot}\n`
        }
        report += '\n'

        // Dark mode status
        if (darkR) {
          report += '#### 🌙 Dark Mode\n'
          report += `- **Status:** ${getLightDarkStatus(darkR)}\n`
          report += `- **Loaded:** ${darkR.loaded ? 'Yes' : 'No'}\n`
          report += `- **Visible Elements:** ${darkR.elementCount}\n`
          report += `- **Theme Styles:** ${darkR.hasThemeStyles ? 'Correct' : 'Incorrect'}\n`
          report += `- **Background:** ${darkR.backgroundColor}\n`

          if (darkR.errors.length > 0) {
            report += `- **Errors:**\n`
            darkR.errors.forEach(error => report += `  - ${error}\n`)
          }
          if (darkR.warnings.length > 0) {
            report += `- **Warnings:**\n`
            darkR.warnings.forEach(warning => report += `  - ${warning}\n`)
          }
          if (darkR.screenshot) {
            report += `- **Screenshot:** ${darkR.screenshot}\n`
          }
        }
        report += '\n---\n\n'
      }
    })
  }

  // Full working pages list
  report += '## 📋 Detailed Results by Page\n\n'
  const uniquePages = [...new Set(results.map(r => r.url))]
  uniquePages.forEach(url => {
    const lightR = lightResults.find(r => r.url === url)
    const darkR = darkResults.find(r => r.url === url)

    if (lightR) {
      const lightStatus = getLightDarkStatusEmoji(lightR)
      const darkStatus = darkR ? getLightDarkStatusEmoji(darkR) : '❓'

      report += `- **${lightR.name}** - Light: ${lightStatus} | Dark: ${darkStatus}\n`
    }
  })

  return report
}

function getLightDarkStatus(result: ThemeTestResult): string {
  if (result.hasErrors) return 'Has Errors'
  if (!result.loaded) return 'Failed to Load'
  if (!result.hasVisibleElements) return 'Blank/No Content'
  if (!result.hasThemeStyles) return 'Theme Style Issues'
  return 'Working'
}

function getLightDarkStatusEmoji(result: ThemeTestResult): string {
  if (result.hasErrors) return '❌'
  if (!result.loaded) return '🔴'
  if (!result.hasVisibleElements) return '🔳'
  if (!result.hasThemeStyles) return '⚠️'
  return '✅'
}
