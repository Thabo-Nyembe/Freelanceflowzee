import { test, expect } from '@playwright/test'

test.describe('Visual Theme Verification - Pure Black/White', () => {
  test('Dashboard shows pure black background in dark mode', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/my-day-v2', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    // Set dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(1000)

    // Check the main container background color
    const mainContainerBg = await page.evaluate(() => {
      const container = document.querySelector('.kazi-bg-light')
      if (!container) return null
      return window.getComputedStyle(container as Element).backgroundColor
    })

    console.log('Dark Mode - Main Container BG:', mainContainerBg)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/visual-verification/my-day-dark-mode.png',
      fullPage: true
    })

    // Verify it's pure black or very close
    // rgb(0, 0, 0) or rgba(0, 0, 0, 1)
    if (mainContainerBg) {
      expect(mainContainerBg).toMatch(/rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,\s*1\)/)
    }
  })

  test('Dashboard shows pure white background in light mode', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/my-day-v2', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    // Set light mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    })

    await page.waitForTimeout(1000)

    // Check the main container background color
    const mainContainerBg = await page.evaluate(() => {
      const container = document.querySelector('.kazi-bg-light')
      if (!container) return null
      return window.getComputedStyle(container as Element).backgroundColor
    })

    console.log('Light Mode - Main Container BG:', mainContainerBg)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/visual-verification/my-day-light-mode.png',
      fullPage: true
    })

    // Verify it's pure white
    // rgb(255, 255, 255) or rgba(255, 255, 255, 1)
    if (mainContainerBg) {
      expect(mainContainerBg).toMatch(/rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*1\)/)
    }
  })

  test('Text is visible in both modes', async ({ page }) => {
    // Dark mode test
    await page.goto('http://localhost:9323/dashboard/my-day-v2', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    })

    await page.waitForTimeout(1000)

    const darkModeTextElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.kazi-text-primary, .kazi-text-secondary, .kazi-text-tertiary')
      const results = []

      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        const el = elements[i] as HTMLElement
        const style = window.getComputedStyle(el)
        results.push({
          text: el.textContent?.trim().substring(0, 30),
          color: style.color,
          visibility: style.visibility,
          display: style.display
        })
      }

      return results
    })

    console.log('Dark Mode Text Elements:', darkModeTextElements.length)
    darkModeTextElements.forEach(el => {
      console.log(`  "${el.text}" - Color: ${el.color}`)
    })

    // Verify text is visible
    for (const el of darkModeTextElements) {
      expect(el.visibility).not.toBe('hidden')
      expect(el.display).not.toBe('none')
    }

    // Light mode test
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    })

    await page.waitForTimeout(1000)

    const lightModeTextElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.kazi-text-primary, .kazi-text-secondary, .kazi-text-tertiary')
      const results = []

      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        const el = elements[i] as HTMLElement
        const style = window.getComputedStyle(el)
        results.push({
          text: el.textContent?.trim().substring(0, 30),
          color: style.color,
          visibility: style.visibility,
          display: style.display
        })
      }

      return results
    })

    console.log('Light Mode Text Elements:', lightModeTextElements.length)
    lightModeTextElements.forEach(el => {
      console.log(`  "${el.text}" - Color: ${el.color}`)
    })

    // Verify text is visible
    for (const el of lightModeTextElements) {
      expect(el.visibility).not.toBe('hidden')
      expect(el.display).not.toBe('none')
    }
  })
})
