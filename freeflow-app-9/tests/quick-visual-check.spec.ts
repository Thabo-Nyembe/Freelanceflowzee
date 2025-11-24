import { test } from '@playwright/test'

test('Quick visual check - My Day page', async ({ page }) => {
  console.log('Testing Dark Mode...')

  await page.goto('http://localhost:9323/dashboard/my-day', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  // Set dark mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
  })

  await page.waitForTimeout(2000)

  // Get ALL background colors on the page
  const darkModeColors = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*')
    const bgColors = new Set<string>()

    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as HTMLElement
      const bg = window.getComputedStyle(el).backgroundColor
      if (bg && bg !== 'rgba(0, 0, 0, 0)') {
        bgColors.add(bg)
      }
    }

    return Array.from(bgColors)
  })

  console.log('\n=== DARK MODE BACKGROUNDS ===')
  darkModeColors.forEach((color, i) => {
    console.log(`${i + 1}. ${color}`)
  })

  await page.screenshot({
    path: 'test-results/visual-verification/dark-mode-full.png',
    fullPage: true
  })

  console.log('\nTesting Light Mode...')

  // Set light mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
  })

  await page.waitForTimeout(2000)

  // Get ALL background colors on the page
  const lightModeColors = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*')
    const bgColors = new Set<string>()

    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as HTMLElement
      const bg = window.getComputedStyle(el).backgroundColor
      if (bg && bg !== 'rgba(0, 0, 0, 0)') {
        bgColors.add(bg)
      }
    }

    return Array.from(bgColors)
  })

  console.log('\n=== LIGHT MODE BACKGROUNDS ===')
  lightModeColors.forEach((color, i) => {
    console.log(`${i + 1}. ${color}`)
  })

  await page.screenshot({
    path: 'test-results/visual-verification/light-mode-full.png',
    fullPage: true
  })

  console.log('\n✅ Screenshots saved!')
  console.log('   - test-results/visual-verification/dark-mode-full.png')
  console.log('   - test-results/visual-verification/light-mode-full.png')
})
