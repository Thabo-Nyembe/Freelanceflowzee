#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n📊 Testing Business Intelligence Page\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 600
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  // 1. Login
  console.log('1️⃣  Logging in...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])
  await page.waitForTimeout(3000)
  console.log('   ✅ Logged in')

  // 2. Navigate to Business Intelligence page
  console.log('\n2️⃣  Loading Business Intelligence page...')
  await page.goto('http://localhost:9323/dashboard/business-intelligence-v2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  // Wait for content to load
  await page.waitForTimeout(5000)

  const biContent = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      // Check for key terms
      hasIntelligence: text.toLowerCase().includes('intelligence') || text.toLowerCase().includes('business'),
      hasRevenue: text.includes('Revenue') || text.includes('revenue'),
      hasProfit: text.includes('Profit') || text.includes('profit'),
      hasClients: text.includes('Clients') || text.includes('clients'),
      hasProjects: text.includes('Projects') || text.includes('projects'),
      hasHealth: text.includes('Health') || text.includes('health'),
      hasScore: text.includes('Score') || text.includes('score'),
      hasMetrics: text.includes('Metrics') || text.includes('metrics'),

      // Check for actual numbers
      hasDollarSigns: (text.match(/\$/g) || []).length,
      hasNumbers: (text.match(/\d{1,3}(,\d{3})*/g) || []).length,

      // Check for errors
      hasError: text.toLowerCase().includes('error'),
      hasLoading: text.toLowerCase().includes('loading'),

      // Get sample text
      textSample: text.substring(0, 800)
    }
  })

  console.log('\n📈 Content Analysis:')
  console.log(`   ${biContent.hasIntelligence ? '✅' : '❌'} Business Intelligence content`)
  console.log(`   ${biContent.hasRevenue ? '✅' : '❌'} Revenue metrics`)
  console.log(`   ${biContent.hasProfit ? '✅' : '❌'} Profitability data`)
  console.log(`   ${biContent.hasClients ? '✅' : '❌'} Client metrics`)
  console.log(`   ${biContent.hasProjects ? '✅' : '❌'} Project metrics`)
  console.log(`   ${biContent.hasHealth ? '✅' : '❌'} Health indicators`)
  console.log(`   ${biContent.hasScore ? '✅' : '❌'} Scores/ratings`)
  console.log(`   ${biContent.hasMetrics ? '✅' : '❌'} Metric labels`)

  console.log('\n💰 Data Indicators:')
  console.log(`   ${biContent.hasDollarSigns > 5 ? '✅' : '⚠️ '} Dollar amounts: ${biContent.hasDollarSigns}`)
  console.log(`   ${biContent.hasNumbers > 10 ? '✅' : '⚠️ '} Numeric values: ${biContent.hasNumbers}`)

  if (biContent.hasError) {
    console.log('\n   ⚠️  ERROR detected on page')
  }

  if (biContent.hasLoading) {
    console.log('   ⏳ Page still loading...')
  }

  // Check for specific revenue amount
  const hasHighRevenue = biContent.textSample.includes('645') ||
                         biContent.textSample.includes('227') ||
                         biContent.textSample.includes('$')

  console.log(`   ${hasHighRevenue ? '✅' : '⚠️ '} Revenue data visible`)

  // Take screenshots
  await page.screenshot({ path: './tmp/bi-full-page.png', fullPage: true })
  console.log('\n   📸 Full page: ./tmp/bi-full-page.png')

  await page.screenshot({ path: './tmp/bi-viewport.png', fullPage: false })
  console.log('   📸 Viewport: ./tmp/bi-viewport.png')

  // Print text sample
  console.log('\n📝 Page Content Sample:')
  console.log('   ' + biContent.textSample.substring(0, 400).replace(/\n/g, '\n   '))

  // Check for charts/visualizations
  const visualizations = await page.evaluate(() => {
    return {
      canvasElements: document.querySelectorAll('canvas').length,
      svgElements: document.querySelectorAll('svg').length,
      chartElements: document.querySelectorAll('[class*="chart"]').length
    }
  })

  console.log('\n📊 Visualizations:')
  console.log(`   Canvas elements: ${visualizations.canvasElements}`)
  console.log(`   SVG elements: ${visualizations.svgElements}`)
  console.log(`   Chart containers: ${visualizations.chartElements}`)

  console.log('\n⏳ Browser will stay open for 15 seconds...')
  await page.waitForTimeout(15000)

} catch (error) {
  console.log(`\n❌ Error: ${error.message}`)
  await page.screenshot({ path: './tmp/bi-error.png' })
  console.log('   📸 Error screenshot: ./tmp/bi-error.png')
} finally {
  await browser.close()
  console.log('\n✅ Test complete!\n')
}
