#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n📊 Testing Business Intelligence Pages\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 500
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  // 1. Login
  console.log('1️⃣  Logging in...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])
  await page.waitForTimeout(2000)
  console.log('   ✅ Logged in')

  // 2. Test Business Intelligence page
  console.log('\n2️⃣  Testing Business Intelligence page...')
  await page.goto('http://localhost:9323/dashboard/business-intelligence-v2', {
    waitUntil: 'networkidle',
    timeout: 15000
  })
  await page.waitForTimeout(3000)

  const biContent = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      hasIntelligence: text.toLowerCase().includes('intelligence') || text.toLowerCase().includes('business'),
      hasMetrics: text.includes('Revenue') || text.includes('Profit'),
      hasCharts: document.querySelectorAll('canvas, svg[class*="chart"]').length > 0,
      hasHealthScore: text.includes('Health') || text.includes('Score'),
      hasInsights: text.includes('Insight') || text.includes('Recommendation'),
      hasError: text.includes('Error') || text.includes('failed'),
      textSample: text.substring(0, 500)
    }
  })

  console.log(`   ${biContent.hasIntelligence ? '✅' : '❌'} Business Intelligence content`)
  console.log(`   ${biContent.hasMetrics ? '✅' : '❌'} Business metrics`)
  console.log(`   ${biContent.hasCharts ? '✅' : '❌'} Charts/visualizations`)
  console.log(`   ${biContent.hasHealthScore ? '✅' : '❌'} Health score`)
  console.log(`   ${biContent.hasInsights ? '✅' : '❌'} Insights/Recommendations`)

  if (biContent.hasError) {
    console.log('   ⚠️  Errors detected on page')
    console.log('   Sample:', biContent.textSample.substring(0, 200))
  }

  await page.screenshot({ path: './tmp/business-intelligence.png', fullPage: true })
  console.log('   📸 Screenshot: ./tmp/business-intelligence.png')

  // 3. Test Admin Intelligence page
  console.log('\n3️⃣  Testing Admin page...')
  await page.goto('http://localhost:9323/dashboard/admin-v2', {
    waitUntil: 'networkidle',
    timeout: 15000
  })
  await page.waitForTimeout(3000)

  const adminContent = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      hasAdmin: text.toLowerCase().includes('admin') || text.toLowerCase().includes('settings'),
      hasUsers: text.includes('Users') || text.includes('Team'),
      hasSystem: text.includes('System') || text.includes('Platform'),
      hasAnalytics: text.includes('Analytics') || text.includes('Reports'),
      hasError: text.includes('Error') || text.includes('failed'),
      textSample: text.substring(0, 500)
    }
  })

  console.log(`   ${adminContent.hasAdmin ? '✅' : '❌'} Admin content`)
  console.log(`   ${adminContent.hasUsers ? '✅' : '❌'} User management`)
  console.log(`   ${adminContent.hasSystem ? '✅' : '❌'} System info`)
  console.log(`   ${adminContent.hasAnalytics ? '✅' : '❌'} Analytics/Reports`)

  if (adminContent.hasError) {
    console.log('   ⚠️  Errors detected on page')
    console.log('   Sample:', adminContent.textSample.substring(0, 200))
  }

  await page.screenshot({ path: './tmp/admin.png', fullPage: true })
  console.log('   📸 Screenshot: ./tmp/admin.png')

  // 4. Test Admin Overview page
  console.log('\n4️⃣  Testing Admin Overview page...')
  await page.goto('http://localhost:9323/dashboard/admin-overview', {
    waitUntil: 'networkidle',
    timeout: 15000
  })
  await page.waitForTimeout(3000)

  const overviewContent = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      hasOverview: text.includes('Overview') || text.includes('Dashboard'),
      hasMetrics: text.includes('Total') || text.includes('Active'),
      hasError: text.includes('Error') || text.includes('failed'),
    }
  })

  console.log(`   ${overviewContent.hasOverview ? '✅' : '❌'} Overview content`)
  console.log(`   ${overviewContent.hasMetrics ? '✅' : '❌'} Metrics`)

  await page.screenshot({ path: './tmp/admin-overview.png', fullPage: false })
  console.log('   📸 Screenshot: ./tmp/admin-overview.png')

  console.log('\n⏳ Browser will stay open for 10 seconds...')
  await page.waitForTimeout(10000)

} catch (error) {
  console.log(`\n❌ Error: ${error.message}`)
  await page.screenshot({ path: './tmp/bi-error.png' })
} finally {
  await browser.close()
  console.log('\n✅ Test complete!\n')
}
