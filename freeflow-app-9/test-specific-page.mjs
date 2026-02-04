#!/usr/bin/env node
import { chromium } from 'playwright'

console.log('\n🎯 Testing Specific Demo Pages\n')

const browser = await chromium.launch({ headless: false, slowMo: 500 })
const page = await browser.newPage()

try {
  // Login
  console.log('1. Going to login page...')
  await page.goto('http://localhost:9323/login')
  await page.waitForTimeout(2000)
  
  console.log('2. Entering credentials...')
  await page.fill('input[type="email"]', 'alex@freeflow.io')
  await page.fill('input[type="password"]', 'investor2026')
  
  console.log('3. Clicking login...')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(5000)
  
  console.log('   Current URL:', page.url())
  
  // Try different client page variants
  const clientUrls = [
    '/v2/dashboard/clients',
    '/dashboard/clients',
    '/dashboard/clients-v2'
  ]
  
  for (const url of clientUrls) {
    try {
      console.log(`\n4. Trying: ${url}`)
      await page.goto(`http://localhost:9323${url}`, { timeout: 8000 })
      await page.waitForTimeout(3000)
      
      const content = await page.content()
      const hasData = content.includes('Acme') || content.includes('client') || content.includes('Client')
      
      console.log(`   Page loaded: ${!content.includes('404')}`)
      console.log(`   Might have data: ${hasData}`)
      
      await page.screenshot({ path: `/tmp/demo-page-${url.replace(/\//g, '-')}.png` })
      console.log(`   Screenshot: /tmp/demo-page-${url.replace(/\//g, '-')}.png`)
      
      if (hasData && !content.includes('404')) {
        console.log('   ✅ This URL looks good!')
      }
    } catch (e) {
      console.log(`   ❌ Failed: ${e.message}`)
    }
  }
  
  console.log('\n✅ Test complete. Check screenshots in /tmp/')
  console.log('Browser staying open for 60 seconds...\n')
  
  await page.waitForTimeout(60000)
  
} catch (error) {
  console.error('Error:', error.message)
} finally {
  await browser.close()
}
