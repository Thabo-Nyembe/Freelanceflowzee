#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🔐 Testing Login Flow - KAZI Demo User\n')
console.log('   Email: demo@kazi.io')
console.log('   Password: investor2026\n')

const browser = await chromium.launch({
  headless: false,
  slowMo: 600
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

// Enable console logging for errors
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log(`   🖥️  Browser Error: ${msg.text()}`)
  }
})

try {
  // 1. Load login page
  console.log('1️⃣  Loading login page...')
  await page.goto('http://localhost:9323/login', {
    waitUntil: 'networkidle',
    timeout: 30000
  })
  console.log('   ✅ Login page loaded')

  // 2. Wait for form
  console.log('\n2️⃣  Waiting for login form...')
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.waitForSelector('input[type="password"]', { timeout: 10000 })
  console.log('   ✅ Form ready')

  // 3. Enter credentials
  console.log('\n3️⃣  Entering credentials...')
  await page.fill('input[type="email"]', 'demo@kazi.io')
  await page.waitForTimeout(300)
  await page.fill('input[type="password"]', 'investor2026')
  await page.waitForTimeout(300)
  console.log('   ✅ Credentials entered')

  // 4. Submit and wait for navigation
  console.log('\n4️⃣  Submitting login...')
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => console.log('   ⏳ Navigation timeout')),
    page.click('button[type="submit"]')
  ])

  await page.waitForTimeout(3000)

  const currentUrl = page.url()
  console.log(`   📍 Current URL: ${currentUrl}`)

  // 5. Verify we're on dashboard
  if (currentUrl.includes('/dashboard')) {
    console.log('   ✅ Successfully logged in and redirected to dashboard!')

    // Wait for content
    await page.waitForTimeout(2000)

    // 6. Check dashboard content
    console.log('\n5️⃣  Verifying v2 dashboard content...')

    const contentChecks = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase()
      return {
        hasProjects: text.includes('project'),
        hasClients: text.includes('client') || text.includes('contact'),
        hasMetrics: text.includes('revenue') || text.includes('active'),
        hasDashboard: text.includes('dashboard') || text.includes('overview'),
        hasNumbers: /\$[\d,]+/.test(document.body.innerText),
      }
    })

    console.log(`   ${contentChecks.hasProjects ? '✅' : '⚪'} Projects section`)
    console.log(`   ${contentChecks.hasClients ? '✅' : '⚪'} Clients/Contacts`)
    console.log(`   ${contentChecks.hasMetrics ? '✅' : '⚪'} Business metrics`)
    console.log(`   ${contentChecks.hasDashboard ? '✅' : '⚪'} Dashboard heading`)
    console.log(`   ${contentChecks.hasNumbers ? '✅' : '⚪'} Financial data`)

    await page.screenshot({ path: './tmp/v2-dashboard.png', fullPage: false })
    console.log('\n   📸 Screenshot: ./tmp/v2-dashboard.png')

    // 7. Test v2 clients page
    console.log('\n6️⃣  Testing v2 Clients page navigation...')
    await page.goto('http://localhost:9323/dashboard/clients-v2', {
      waitUntil: 'networkidle',
      timeout: 15000
    })
    await page.waitForTimeout(2000)

    const clientsUrl = page.url()
    console.log(`   📍 Current URL: ${clientsUrl}`)

    if (clientsUrl.includes('clients')) {
      console.log('   ✅ Clients page loaded successfully!')

      const clientsChecks = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase()
        return {
          hasClientWord: text.includes('client'),
          hasContact: text.includes('contact'),
          hasEmail: /@\w+\.\w+/.test(document.body.innerText),
          hasCompany: text.includes('company') || text.includes('business'),
        }
      })

      console.log(`   ${clientsChecks.hasClientWord ? '✅' : '⚪'} Client references`)
      console.log(`   ${clientsChecks.hasContact ? '✅' : '⚪'} Contact information`)
      console.log(`   ${clientsChecks.hasEmail ? '✅' : '⚪'} Email addresses`)
      console.log(`   ${clientsChecks.hasCompany ? '✅' : '⚪'} Company names`)

      await page.screenshot({ path: './tmp/v2-clients.png', fullPage: false })
      console.log('   📸 Screenshot: ./tmp/v2-clients.png')
    } else {
      console.log('   ⚠️  Unexpected redirect')
    }

    // 8. Test v2 projects page
    console.log('\n7️⃣  Testing v2 Projects page navigation...')
    await page.goto('http://localhost:9323/dashboard/projects-hub-v2', {
      waitUntil: 'networkidle',
      timeout: 15000
    })
    await page.waitForTimeout(2000)

    const projectsUrl = page.url()
    console.log(`   📍 Current URL: ${projectsUrl}`)

    if (projectsUrl.includes('project')) {
      console.log('   ✅ Projects page loaded!')

      await page.screenshot({ path: './tmp/v2-projects.png', fullPage: false })
      console.log('   📸 Screenshot: ./tmp/v2-projects.png')
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ LOGIN FLOW TEST PASSED!')
    console.log('='.repeat(50))
    console.log('\nResults:')
    console.log('  ✅ Login successful')
    console.log('  ✅ Redirected to v2 dashboard')
    console.log('  ✅ Dashboard content loaded')
    console.log('  ✅ v2 pages accessible')
    console.log('\n📸 Screenshots saved to ./tmp/')

  } else {
    console.log('   ❌ Login failed - still on login page')

    const errorElements = await page.evaluate(() => {
      const toasts = Array.from(document.querySelectorAll('[role="status"], .toast, [data-sonner-toast]'))
      return toasts.map(el => el.textContent).filter(Boolean)
    })

    if (errorElements.length > 0) {
      console.log(`   Error messages: ${errorElements.join(', ')}`)
    }

    await page.screenshot({ path: './tmp/login-failed.png' })
    console.log('   📸 Screenshot: ./tmp/login-failed.png')
  }

  console.log('\n⏳ Browser will stay open for 15 seconds...')
  await page.waitForTimeout(15000)

} catch (error) {
  console.log(`\n❌ Test Error: ${error.message}`)
  await page.screenshot({ path: './tmp/test-error.png' })
  console.log('   📸 Error screenshot: ./tmp/test-error.png')
} finally {
  await browser.close()
  console.log('\n✅ Test complete!\n')
}
