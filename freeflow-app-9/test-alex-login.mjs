#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🔐 Testing Login with Full Demo Data\n')
console.log('   Email: alex@freeflow.io')
console.log('   Password: investor2026')
console.log('   Expected: 20 projects, 15 clients\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 600
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  // 1. Load login page
  console.log('1️⃣  Loading login page...')
  await page.goto('http://localhost:9323/login', {
    waitUntil: 'networkidle',
    timeout: 30000
  })
  console.log('   ✅ Login page loaded')

  // 2. Enter credentials
  console.log('\n2️⃣  Entering credentials...')
  await page.waitForSelector('input[type="email"]')
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.waitForTimeout(300)
  await page.fill('input[type="password"]', 'investor2026')
  await page.waitForTimeout(300)
  console.log('   ✅ Credentials entered')

  // 3. Submit
  console.log('\n3️⃣  Submitting login...')
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])

  await page.waitForTimeout(4000)

  const currentUrl = page.url()
  console.log(`   📍 Current URL: ${currentUrl}`)

  if (currentUrl.includes('/dashboard')) {
    console.log('   ✅ Successfully logged in!')

    // Wait for dashboard to load
    await page.waitForTimeout(3000)

    // 4. Check dashboard content
    console.log('\n4️⃣  Checking dashboard content...')

    const dashboardContent = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        hasProjects: text.includes('Projects') || text.includes('projects'),
        hasClients: text.includes('Clients') || text.includes('clients'),
        hasRevenue: /\$[\d,]+/.test(text),
        hasMetrics: text.includes('Active') || text.includes('Total'),
        hasActivityFeed: text.includes('activity') || text.includes('Activity'),
        hasNoProjectsMsg: text.includes('No projects yet'),
        textSample: text.substring(0, 500)
      }
    })

    console.log(`   ${dashboardContent.hasProjects ? '✅' : '❌'} Projects section`)
    console.log(`   ${dashboardContent.hasClients ? '✅' : '❌'} Clients section`)
    console.log(`   ${dashboardContent.hasRevenue ? '✅' : '❌'} Revenue data`)
    console.log(`   ${dashboardContent.hasMetrics ? '✅' : '❌'} Business metrics`)
    console.log(`   ${dashboardContent.hasActivityFeed ? '✅' : '❌'} Activity feed`)
    console.log(`   ${dashboardContent.hasNoProjectsMsg ? '❌ EMPTY STATE' : '✅ HAS DATA'}`)

    if (dashboardContent.hasNoProjectsMsg) {
      console.log('\n   ⚠️  WARNING: Dashboard showing empty state!')
      console.log('   Text sample:', dashboardContent.textSample.substring(0, 200))
    }

    await page.screenshot({ path: './tmp/alex-dashboard.png', fullPage: true })
    console.log('\n   📸 Screenshot: ./tmp/alex-dashboard.png')

    // 5. Test clients page
    console.log('\n5️⃣  Testing Clients page...')
    await page.goto('http://localhost:9323/dashboard/clients-v2', {
      waitUntil: 'networkidle',
      timeout: 15000
    })
    await page.waitForTimeout(2000)

    const clientsContent = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        hasClients: text.toLowerCase().includes('client'),
        hasCount: /15/.test(text),
        hasEmails: /@\w+\.\w+/.test(text),
      }
    })

    console.log(`   ${clientsContent.hasClients ? '✅' : '❌'} Client references`)
    console.log(`   ${clientsContent.hasCount ? '✅' : '❌'} Shows 15 clients`)
    console.log(`   ${clientsContent.hasEmails ? '✅' : '❌'} Email addresses`)

    await page.screenshot({ path: './tmp/alex-clients.png', fullPage: false })
    console.log('   📸 Screenshot: ./tmp/alex-clients.png')

    // 6. Test projects page
    console.log('\n6️⃣  Testing Projects page...')
    await page.goto('http://localhost:9323/dashboard/projects-hub-v2', {
      waitUntil: 'networkidle',
      timeout: 15000
    })
    await page.waitForTimeout(2000)

    const projectsContent = await page.evaluate(() => {
      const text = document.body.innerText
      return {
        hasProjects: text.toLowerCase().includes('project'),
        hasCount: /20/.test(text),
        hasKanban: text.includes('Planning') || text.includes('Active'),
      }
    })

    console.log(`   ${projectsContent.hasProjects ? '✅' : '❌'} Project references`)
    console.log(`   ${projectsContent.hasCount ? '✅' : '❌'} Shows 20 projects`)
    console.log(`   ${projectsContent.hasKanban ? '✅' : '❌'} Kanban view`)

    await page.screenshot({ path: './tmp/alex-projects.png', fullPage: false })
    console.log('   📸 Screenshot: ./tmp/alex-projects.png')

    console.log('\n' + '='.repeat(50))
    console.log('✅ TEST COMPLETE')
    console.log('='.repeat(50))

  } else {
    console.log('   ❌ Login failed')
    await page.screenshot({ path: './tmp/alex-login-failed.png' })
  }

  console.log('\n⏳ Browser will stay open for 15 seconds...')
  await page.waitForTimeout(15000)

} catch (error) {
  console.log(`\n❌ Error: ${error.message}`)
  await page.screenshot({ path: './tmp/alex-error.png' })
} finally {
  await browser.close()
  console.log('\n✅ Test complete!\n')
}
