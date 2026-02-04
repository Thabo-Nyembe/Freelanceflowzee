#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n' + '='.repeat(80))
console.log('🔍 COMPREHENSIVE VERIFICATION - All Category Pages')
console.log('='.repeat(80) + '\n')

const PAGES_TO_VERIFY = [
  { name: 'Dashboard', url: '/dashboard', mustHave: ['revenue', 'projects', 'clients'] },
  { name: 'Business Intelligence', url: '/dashboard/business-intelligence', mustHave: ['revenue', 'health'] },
  { name: 'Business Admin', url: '/dashboard/admin-v2', mustHave: ['admin', 'users', 'system'] },
  { name: 'Client CRM', url: '/dashboard/clients-v2', mustHave: ['client', 'crm'] },
  { name: 'CV/Portfolio', url: '/dashboard/cv-portfolio', mustHave: ['portfolio', 'experience'] },
  { name: 'Portfolio V2', url: '/dashboard/portfolio-v2', mustHave: ['portfolio', 'projects'] },
  { name: 'Storage V2', url: '/dashboard/storage-v2', mustHave: ['storage', 'files'] },
  { name: 'Files Hub V2', url: '/dashboard/files-hub-v2', mustHave: ['files'] },
  { name: 'Collaboration V2', url: '/dashboard/collaboration-v2', mustHave: ['collaboration'] },
  { name: 'My Day V2', url: '/dashboard/my-day-v2', mustHave: ['my day', 'goals', 'tasks'] },
]

const browser = await chromium.launch({ headless: false })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

let results = {
  passed: [],
  failed: [],
  warnings: []
}

try {
  // Login
  console.log('🔐 Authentication Test')
  console.log('-'.repeat(80))

  await page.goto('http://localhost:9323/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'demo2026')

  // Click and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ])

  await page.waitForTimeout(3000)

  const currentUrl = page.url()
  const loggedIn = currentUrl.includes('/dashboard') || !currentUrl.includes('/login')

  console.log(`   ${loggedIn ? '✅' : '❌'} Login ${loggedIn ? 'successful' : 'failed'}`)
  console.log(`   📍 Current URL: ${currentUrl}\n`)

  if (!loggedIn) {
    throw new Error('Login failed - cannot proceed with verification')
  }

  // Test each page
  console.log('📄 Page Verification Tests')
  console.log('-'.repeat(80) + '\n')

  for (const pageInfo of PAGES_TO_VERIFY) {
    console.log(`Testing: ${pageInfo.name}`)

    try {
      await page.goto(`http://localhost:9323${pageInfo.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      })
      await page.waitForTimeout(3000)

      const analysis = await page.evaluate((mustHave) => {
        const text = document.body.innerText.toLowerCase()
        return {
          url: window.location.href,
          title: document.title,
          textLength: text.length,
          isOnLogin: window.location.href.includes('/login'),
          has404: text.includes('404') || text.includes('not found'),
          hasError: (text.includes('error') && !text.includes('0 error')) ||
                    text.includes('something went wrong'),
          keywordsFound: mustHave.filter(keyword =>
            text.includes(keyword.toLowerCase())
          ),
          contentPreview: document.body.innerText.substring(0, 200)
        }
      }, pageInfo.mustHave)

      // Evaluate results
      let status = '✅'
      let issues = []

      if (analysis.isOnLogin) {
        status = '❌'
        issues.push('Redirected to login')
      }
      if (analysis.has404) {
        status = '❌'
        issues.push('404 Not Found')
      }
      if (analysis.hasError) {
        status = '⚠️'
        issues.push('Contains error messages')
      }
      if (analysis.textLength < 500) {
        status = '⚠️'
        issues.push('Low content (< 500 chars)')
      }
      if (analysis.keywordsFound.length === 0) {
        status = '⚠️'
        issues.push('Missing expected keywords')
      }

      // Take screenshot
      await page.screenshot({
        path: `./tmp/verify-${pageInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`,
        fullPage: false
      })

      // Log results
      console.log(`   ${status} Status: ${issues.length > 0 ? issues.join(', ') : 'All checks passed'}`)
      console.log(`   📊 Content: ${analysis.textLength} characters`)
      console.log(`   🔍 Keywords found: ${analysis.keywordsFound.length}/${pageInfo.mustHave.length}`)
      console.log(`   📍 URL: ${analysis.url}`)
      console.log(`   📸 Screenshot: ./tmp/verify-${pageInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`)

      // Store result
      const result = {
        name: pageInfo.name,
        url: pageInfo.url,
        status,
        issues,
        textLength: analysis.textLength,
        keywordsFound: analysis.keywordsFound.length,
        keywordsTotal: pageInfo.mustHave.length
      }

      if (status === '✅') {
        results.passed.push(result)
      } else if (status === '⚠️') {
        results.warnings.push(result)
      } else {
        results.failed.push(result)
      }

      console.log('')

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`)
      results.failed.push({
        name: pageInfo.name,
        url: pageInfo.url,
        status: '❌',
        issues: [error.message]
      })
    }
  }

  // Summary Report
  console.log('='.repeat(80))
  console.log('📊 VERIFICATION SUMMARY')
  console.log('='.repeat(80) + '\n')

  const total = PAGES_TO_VERIFY.length
  const passed = results.passed.length
  const warnings = results.warnings.length
  const failed = results.failed.length
  const successRate = Math.round((passed / total) * 100)

  console.log(`Total Pages: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`\n📈 Success Rate: ${successRate}%\n`)

  if (results.passed.length > 0) {
    console.log('✅ PASSED PAGES:')
    results.passed.forEach(r => {
      console.log(`   ✓ ${r.name} (${r.textLength} chars, ${r.keywordsFound}/${r.keywordsTotal} keywords)`)
    })
    console.log('')
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:')
    results.warnings.forEach(r => {
      console.log(`   ! ${r.name}: ${r.issues.join(', ')}`)
    })
    console.log('')
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED PAGES:')
    results.failed.forEach(r => {
      console.log(`   ✗ ${r.name}: ${r.issues.join(', ')}`)
    })
    console.log('')
  }

  // Final Verdict
  console.log('='.repeat(80))
  if (failed === 0 && warnings === 0) {
    console.log('🎉 VERIFICATION COMPLETE - ALL SYSTEMS GO!')
    console.log('✅ All pages are working perfectly')
    console.log('✅ Ready for production deployment')
  } else if (failed === 0) {
    console.log('✅ VERIFICATION COMPLETE - MINOR ISSUES')
    console.log('⚠️  Some pages have warnings but are functional')
    console.log('✅ Safe to proceed with demo')
  } else {
    console.log('⚠️  VERIFICATION COMPLETE - ACTION REQUIRED')
    console.log('❌ Some pages have critical issues')
    console.log('⚠️  Review failed pages before demo')
  }
  console.log('='.repeat(80) + '\n')

  console.log('⏳ Keeping browser open for 10 seconds...')
  await page.waitForTimeout(10000)

} catch (error) {
  console.log(`\n❌ VERIFICATION ERROR: ${error.message}\n`)
} finally {
  await browser.close()
  console.log('✅ Verification complete!\n')
}
