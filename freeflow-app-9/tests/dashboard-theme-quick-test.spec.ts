import { test, expect, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * QUICK LIGHT/DARK MODE VERIFICATION TEST
 *
 * Tests a focused set of important dashboard pages in both themes
 */

interface ThemeTestResult {
  url: string
  name: string
  theme: 'light' | 'dark'
  loaded: boolean
  hasContent: boolean
  hasVisibleElements: boolean
  elementCount: number
  backgroundColor: string
  textColor: string
  screenshot?: string
}

const results: ThemeTestResult[] = []

// Priority pages to test
const dashboardPages = [
  { path: '/dashboard', name: 'Dashboard Overview' },
  { path: '/dashboard/my-day', name: 'My Day' },
  { path: '/dashboard/projects-hub', name: 'Projects Hub' },
  { path: '/dashboard/clients', name: 'Clients' },
  { path: '/dashboard/files', name: 'Files Hub' },
  { path: '/dashboard/messages', name: 'Messages' },
  { path: '/dashboard/calendar', name: 'Calendar' },
  { path: '/dashboard/bookings', name: 'Bookings' },
  { path: '/dashboard/gallery', name: 'Gallery' },
  { path: '/dashboard/cv-portfolio', name: 'CV Portfolio' },
  { path: '/dashboard/settings', name: 'Settings' },
  { path: '/dashboard/financial', name: 'Financial' },
  { path: '/dashboard/ai-create', name: 'AI Create' },
  { path: '/dashboard/video-studio', name: 'Video Studio' },
  { path: '/dashboard/analytics', name: 'Analytics' },
]

async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.evaluate((targetTheme) => {
    localStorage.setItem('theme', targetTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(targetTheme)
    document.documentElement.setAttribute('data-theme', targetTheme)
  }, theme)
  await page.waitForTimeout(300)
}

async function getThemeStyles(page: Page): Promise<{ backgroundColor: string, textColor: string }> {
  try {
    return await page.evaluate(() => {
      const body = document.body
      const computedStyle = window.getComputedStyle(body)
      return {
        backgroundColor: computedStyle.backgroundColor,
        textColor: computedStyle.color
      }
    })
  } catch {
    return { backgroundColor: 'unknown', textColor: 'unknown' }
  }
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
    hasVisibleElements: false,
    elementCount: 0,
    backgroundColor: '',
    textColor: '',
  }

  try {
    console.log(`${theme === 'light' ? '☀️' : '🌙'} ${pageInfo.name}`)

    // Navigate
    const response = await page.goto(`http://localhost:9323${pageInfo.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    if (!response || !response.ok()) {
      console.log(`  ❌ Failed to load: ${response?.status()}`)
      return result
    }

    result.loaded = true
    await page.waitForTimeout(1000)

    // Set theme
    await setTheme(page, theme)

    // Get styles
    const styles = await getThemeStyles(page)
    result.backgroundColor = styles.backgroundColor
    result.textColor = styles.textColor

    // Check content
    const bodyText = await page.locator('body').textContent()
    result.hasContent = bodyText ? bodyText.trim().length > 100 : false

    // Count elements
    const mainContent = page.locator('main, [role="main"]')
    const mainExists = await mainContent.count() > 0

    if (mainExists) {
      result.elementCount = await mainContent.locator('*').count()
    } else {
      result.elementCount = await page.locator('body *').count()
    }

    result.hasVisibleElements = result.elementCount > 20

    // Take screenshot for comparison
    const screenshotDir = path.join(process.cwd(), 'test-results', 'quick-screenshots', theme)
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }
    const screenshotPath = path.join(screenshotDir, `${pageInfo.path.replace(/\//g, '_')}.png`)
    await page.screenshot({ path: screenshotPath, fullPage: false })
    result.screenshot = screenshotPath

    const status = result.loaded && result.hasVisibleElements ? '✅' : '⚠️'
    console.log(`  ${status} Loaded: ${result.loaded}, Elements: ${result.elementCount}, BG: ${result.backgroundColor}`)

  } catch (error: any) {
    console.log(`  ❌ Error: ${error.message}`)
  }

  return result
}

test.describe('Quick Light/Dark Mode Test', () => {
  test('test priority pages in both modes', async ({ page }) => {
    test.setTimeout(180000) // 3 minutes

    await page.setViewportSize({ width: 1920, height: 1080 })

    console.log(`\n🚀 Testing ${dashboardPages.length} priority pages in both themes...\n`)

    // Test each page in both themes
    for (const pageInfo of dashboardPages) {
      console.log(`\n📄 ${pageInfo.name}`)

      // Light mode
      const lightResult = await testPageInTheme(page, pageInfo, 'light')
      results.push(lightResult)

      await page.waitForTimeout(300)

      // Dark mode
      const darkResult = await testPageInTheme(page, pageInfo, 'dark')
      results.push(darkResult)

      await page.waitForTimeout(300)
    }

    // Generate report
    const report = generateReport(results)

    // Save reports
    const reportsDir = path.join(process.cwd(), 'test-results')
    const jsonReportPath = path.join(reportsDir, 'quick-theme-test-report.json')
    const markdownReportPath = path.join(reportsDir, 'quick-theme-test-report.md')

    fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2))
    fs.writeFileSync(markdownReportPath, report)

    console.log('\n' + report)
    console.log(`\n📄 Reports saved:`)
    console.log(`  - ${jsonReportPath}`)
    console.log(`  - ${markdownReportPath}`)

    // Statistics
    const lightTests = results.filter(r => r.theme === 'light')
    const darkTests = results.filter(r => r.theme === 'dark')

    const lightWorking = lightTests.filter(r => r.loaded && r.hasVisibleElements).length
    const darkWorking = darkTests.filter(r => r.loaded && r.hasVisibleElements).length

    console.log(`\n📈 Summary:`)
    console.log(`  Light Mode: ${lightWorking}/${lightTests.length} working (${((lightWorking / lightTests.length) * 100).toFixed(0)}%)`)
    console.log(`  Dark Mode: ${darkWorking}/${darkTests.length} working (${((darkWorking / darkTests.length) * 100).toFixed(0)}%)`)
  })
})

function generateReport(results: ThemeTestResult[]): string {
  const lightResults = results.filter(r => r.theme === 'light')
  const darkResults = results.filter(r => r.theme === 'dark')

  const lightWorking = lightResults.filter(r => r.loaded && r.hasVisibleElements).length
  const darkWorking = darkResults.filter(r => r.loaded && r.hasVisibleElements).length

  let report = '# KAZI Dashboard - Quick Theme Test Report\n\n'
  report += `**Generated:** ${new Date().toISOString()}\n\n`

  report += '## Summary\n\n'
  report += `- **Pages Tested:** ${lightResults.length}\n`
  report += `- **Light Mode Working:** ${lightWorking}/${lightResults.length} (${((lightWorking / lightResults.length) * 100).toFixed(0)}%)\n`
  report += `- **Dark Mode Working:** ${darkWorking}/${darkResults.length} (${((darkWorking / darkResults.length) * 100).toFixed(0)}%)\n\n`

  report += '## Results by Page\n\n'
  report += '| Page | Light Mode | Dark Mode | Light BG | Dark BG |\n'
  report += '|------|------------|-----------|----------|----------|\n'

  const uniquePages = [...new Set(results.map(r => r.url))]
  uniquePages.forEach(url => {
    const lightR = lightResults.find(r => r.url === url)
    const darkR = darkResults.find(r => r.url === url)

    if (lightR) {
      const lightStatus = lightR.loaded && lightR.hasVisibleElements ? '✅' : '❌'
      const darkStatus = darkR && darkR.loaded && darkR.hasVisibleElements ? '✅' : '❌'

      report += `| ${lightR.name} | ${lightStatus} (${lightR.elementCount} elements) | ${darkStatus} (${darkR?.elementCount || 0} elements) | ${lightR.backgroundColor} | ${darkR?.backgroundColor || 'N/A'} |\n`
    }
  })

  report += '\n## Screenshots\n\n'
  report += 'Screenshots saved to: `test-results/quick-screenshots/`\n'
  report += '- Light mode screenshots: `test-results/quick-screenshots/light/`\n'
  report += '- Dark mode screenshots: `test-results/quick-screenshots/dark/`\n\n'

  return report
}
