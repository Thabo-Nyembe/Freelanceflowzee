#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🧪 Testing All Category Pages\n')

const pages = [
  // Admin
  { name: 'Admin', url: '/dashboard/admin-v2' },
  { name: 'Admin Overview', url: '/dashboard/admin-overview' },
  { name: 'Admin - CRM', url: '/dashboard/admin-overview/crm' },
  { name: 'Admin - Operations', url: '/dashboard/admin-overview/operations' },
  { name: 'Admin - Marketing', url: '/dashboard/admin-overview/marketing' },
  { name: 'Admin - Analytics', url: '/dashboard/admin-overview/analytics' },

  // CV & Portfolio
  { name: 'CV/Portfolio', url: '/dashboard/cv-portfolio' },
  { name: 'Portfolio V2', url: '/dashboard/portfolio-v2' },

  // Storage
  { name: 'Storage', url: '/dashboard/storage' },
  { name: 'Storage V2', url: '/dashboard/storage-v2' },

  // Files
  { name: 'Files Hub V2', url: '/dashboard/files-hub-v2' },
  { name: 'Files V2', url: '/dashboard/files-v2' },

  // Collaboration
  { name: 'Collaboration V2', url: '/dashboard/collaboration-v2' },
  { name: 'Collaboration Demo', url: '/dashboard/collaboration-demo' },

  // My Day
  { name: 'My Day V2', url: '/dashboard/my-day-v2' },
]

const browser = await chromium.launch({
  headless: true,
  timeout: 10000
})

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
})

const page = await context.newPage()

try {
  // Login first
  console.log('🔐 Logging in...')
  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded', timeout: 15000 })
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'demo2026')
  await Promise.all([
    page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])
  await page.waitForTimeout(2000)
  console.log('✅ Logged in\n')

  const results = []

  for (const pageInfo of pages) {
    try {
      console.log(`Testing: ${pageInfo.name}`)

      await page.goto(`http://localhost:9323${pageInfo.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 8000
      })

      await page.waitForTimeout(2000)

      const currentUrl = page.url()
      const content = await page.evaluate(() => {
        const text = document.body.innerText
        return {
          hasError: text.toLowerCase().includes('error') && !text.toLowerCase().includes('0 errors'),
          has404: text.includes('404') || text.includes('not found'),
          hasContent: text.length > 100,
          hasLoading: text.toLowerCase().includes('loading'),
          textLength: text.length
        }
      })

      let status = '✅'
      let message = 'OK'

      if (currentUrl.includes('/login')) {
        status = '❌'
        message = 'Redirected to login'
      } else if (content.has404) {
        status = '❌'
        message = '404 Not Found'
      } else if (content.hasError) {
        status = '⚠️ '
        message = 'Has errors'
      } else if (!content.hasContent) {
        status = '⚠️ '
        message = 'Empty content'
      } else if (content.hasLoading) {
        status = '⏳'
        message = 'Still loading'
      }

      console.log(`   ${status} ${message} (${content.textLength} chars)`)
      results.push({ ...pageInfo, status, message, ...content })

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      results.push({ ...pageInfo, status: '❌', message: error.message })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SUMMARY')
  console.log('='.repeat(50))

  const working = results.filter(r => r.status === '✅').length
  const warnings = results.filter(r => r.status === '⚠️ ' || r.status === '⏳').length
  const broken = results.filter(r => r.status === '❌').length

  console.log(`\n✅ Working: ${working}/${pages.length}`)
  console.log(`⚠️  Warnings: ${warnings}/${pages.length}`)
  console.log(`❌ Broken: ${broken}/${pages.length}`)

  if (broken > 0) {
    console.log('\n❌ Broken Pages:')
    results.filter(r => r.status === '❌').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
  }

  if (warnings > 0) {
    console.log('\n⚠️  Warning Pages:')
    results.filter(r => r.status === '⚠️ ' || r.status === '⏳').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`)
    })
  }

  console.log('')

} catch (error) {
  console.log(`\n❌ Test Error: ${error.message}`)
} finally {
  await browser.close()
  console.log('✅ Test complete!\n')
}
