#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🔍 Fresh Admin Page Test\n')

const browser = await chromium.launch({ headless: false, slowMo: 300 })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

try {
  // Login
  console.log('🔐 Logging in...')
  await page.goto('http://localhost:9323/login')
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'demo2026')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
  console.log('✅ Logged in\n')

  // Go to admin page
  console.log('📄 Loading Admin page...')
  await page.goto('http://localhost:9323/dashboard/admin-v2')
  await page.waitForTimeout(5000)

  const content = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    text: document.body.innerText.substring(0, 500),
    hasAdmin: document.body.innerText.toLowerCase().includes('admin'),
    hasUsers: document.body.innerText.toLowerCase().includes('users'),
    hasSystem: document.body.innerText.toLowerCase().includes('system')
  }))

  console.log('📊 Analysis:')
  console.log(`   URL: ${content.url}`)
  console.log(`   Title: ${content.title}`)
  console.log(`   ${content.hasAdmin ? '✅' : '❌'} Has "admin" content`)
  console.log(`   ${content.hasUsers ? '✅' : '❌'} Has "users" content`)
  console.log(`   ${content.hasSystem ? '✅' : '❌'} Has "system" content`)
  console.log(`\n📝 Content preview:\n${content.text}\n`)

  await page.screenshot({ path: './tmp/admin-fresh.png', fullPage: false })
  console.log('📸 Screenshot: ./tmp/admin-fresh.png')

  console.log('\n⏳ Browser staying open for 20 seconds...')
  await page.waitForTimeout(20000)

} catch (error) {
  console.log(`❌ Error: ${error.message}`)
} finally {
  await browser.close()
  console.log('\n✅ Done!\n')
}
