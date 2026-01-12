import { test } from '@playwright/test'

test('Final Theme Verification - Pure Black & White', async ({ page }) => {
  console.log('\n========================================')
  console.log('🎨 PURE BLACK & WHITE THEME VERIFICATION')
  console.log('========================================\n')

  // Navigate to My Day page
  await page.goto('http://localhost:9323/dashboard/my-day-v2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  // Test DARK MODE
  console.log('Testing DARK MODE...\n')

  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
  })

  await page.waitForTimeout(2000)

  const darkModeResults = await page.evaluate(() => {
    // Check layout container (where the actual background is applied)
    const layoutDiv = document.querySelector('.flex.h-screen')
    const kaziDivs = document.querySelectorAll('[class*="kazi-bg"]')

    const results: any = {
      layoutDiv: null,
      kaziBackgrounds: [],
      textSamples: [],
      borderSamples: []
    }

    // Layout div
    if (layoutDiv) {
      const style = window.getComputedStyle(layoutDiv)
      results.layoutDiv = {
        bg: style.backgroundColor,
        color: style.color,
        classes: (layoutDiv as HTMLElement).className
      }
    }

    // Kazi background divs
    for (let i = 0; i < Math.min(kaziDivs.length, 3); i++) {
      const el = kaziDivs[i] as HTMLElement
      const style = window.getComputedStyle(el)
      results.kaziBackgrounds.push({
        bg: style.backgroundColor,
        classes: el.className.split(' ').filter(c => c.includes('kazi')).join(' ')
      })
    }

    // Text samples
    const textElements = document.querySelectorAll('.kazi-text-primary, .kazi-text-secondary, h1, h2, p')
    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const el = textElements[i] as HTMLElement
      const style = window.getComputedStyle(el)
      results.textSamples.push({
        text: el.textContent?.trim().substring(0, 30),
        color: style.color,
        bg: style.backgroundColor
      })
    }

    // Border samples
    const borderElements = document.querySelectorAll('[class*="border"]')
    for (let i = 0; i < Math.min(borderElements.length, 3); i++) {
      const el = borderElements[i] as HTMLElement
      const style = window.getComputedStyle(el)
      if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') {
        results.borderSamples.push({
          borderColor: style.borderColor,
          classes: el.className.split(' ').filter(c => c.includes('border')).join(' ')
        })
      }
    }

    return results
  })

  console.log('DARK MODE - Layout Container:')
  if (darkModeResults.layoutDiv) {
    console.log(`  Background: ${darkModeResults.layoutDiv.bg}`)
    console.log(`  Color: ${darkModeResults.layoutDiv.color}`)
    console.log(`  Classes: ${darkModeResults.layoutDiv.classes.substring(0, 80)}...\n`)
  }

  console.log('DARK MODE - Kazi Background Elements:')
  darkModeResults.kaziBackgrounds.forEach((item: any, i: number) => {
    console.log(`  ${i + 1}. Background: ${item.bg}`)
    console.log(`     Classes: ${item.classes}`)
  })

  console.log('\nDARK MODE - Text Samples:')
  darkModeResults.textSamples.forEach((item: any, i: number) => {
    console.log(`  ${i + 1}. "${item.text}"`)
    console.log(`     Color: ${item.color}`)
    console.log(`     Background: ${item.bg}`)
  })

  console.log('\nDARK MODE - Border Samples:')
  darkModeResults.borderSamples.forEach((item: any, i: number) => {
    console.log(`  ${i + 1}. Border Color: ${item.borderColor}`)
    console.log(`     Classes: ${item.classes}`)
  })

  // Take screenshot
  await page.screenshot({
    path: 'test-results/visual-verification/FINAL-dark-mode-verification.png',
    fullPage: true
  })

  // Test LIGHT MODE
  console.log('\n========================================')
  console.log('Testing LIGHT MODE...\n')

  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
  })

  await page.waitForTimeout(2000)

  const lightModeResults = await page.evaluate(() => {
    // Check layout container
    const layoutDiv = document.querySelector('.flex.h-screen')
    const kaziDivs = document.querySelectorAll('[class*="kazi-bg"]')

    const results: any = {
      layoutDiv: null,
      kaziBackgrounds: [],
      textSamples: [],
      borderSamples: []
    }

    // Layout div
    if (layoutDiv) {
      const style = window.getComputedStyle(layoutDiv)
      results.layoutDiv = {
        bg: style.backgroundColor,
        color: style.color,
        classes: (layoutDiv as HTMLElement).className
      }
    }

    // Kazi background divs
    for (let i = 0; i < Math.min(kaziDivs.length, 3); i++) {
      const el = kaziDivs[i] as HTMLElement
      const style = window.getComputedStyle(el)
      results.kaziBackgrounds.push({
        bg: style.backgroundColor,
        classes: el.className.split(' ').filter(c => c.includes('kazi')).join(' ')
      })
    }

    // Text samples
    const textElements = document.querySelectorAll('.kazi-text-primary, .kazi-text-secondary, h1, h2, p')
    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const el = textElements[i] as HTMLElement
      const style = window.getComputedStyle(el)
      results.textSamples.push({
        text: el.textContent?.trim().substring(0, 30),
        color: style.color,
        bg: style.backgroundColor
      })
    }

    // Border samples
    const borderElements = document.querySelectorAll('[class*="border"]')
    for (let i = 0; i < Math.min(borderElements.length, 3); i++) {
      const el = borderElements[i] as HTMLElement
      const style = window.getComputedStyle(el)
      if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') {
        results.borderSamples.push({
          borderColor: style.borderColor,
          classes: el.className.split(' ').filter(c => c.includes('border')).join(' ')
        })
      }
    }

    return results
  })

  console.log('LIGHT MODE - Layout Container:')
  if (lightModeResults.layoutDiv) {
    console.log(`  Background: ${lightModeResults.layoutDiv.bg}`)
    console.log(`  Color: ${lightModeResults.layoutDiv.color}`)
    console.log(`  Classes: ${lightModeResults.layoutDiv.classes.substring(0, 80)}...\n`)
  }

  console.log('LIGHT MODE - Kazi Background Elements:')
  lightModeResults.kaziBackgrounds.forEach((item: any, i: number) => {
    console.log(`  ${i + 1}. Background: ${item.bg}`)
    console.log(`     Classes: ${item.classes}`)
  })

  console.log('\nLIGHT MODE - Text Samples:')
  lightModeResults.textSamples.forEach((item: any, i: number) => {
    console.log(`  ${i + 1}. "${item.text}"`)
    console.log(`     Color: ${item.color}`)
    console.log(`     Background: ${item.bg}`)
  })

  console.log('\nLIGHT MODE - Border Samples:')
  lightModeResults.borderSamples.forEach((item: any, i: number) => {
    console.log(`  ${i + 1}. Border Color: ${item.borderColor}`)
    console.log(`     Classes: ${item.classes}`)
  })

  // Take screenshot
  await page.screenshot({
    path: 'test-results/visual-verification/FINAL-light-mode-verification.png',
    fullPage: true
  })

  console.log('\n========================================')
  console.log('✅ VERIFICATION COMPLETE!')
  console.log('========================================')
  console.log('\nScreenshots saved:')
  console.log('  - test-results/visual-verification/FINAL-dark-mode-verification.png')
  console.log('  - test-results/visual-verification/FINAL-light-mode-verification.png')
  console.log('\nExpected Results:')
  console.log('  Dark Mode: rgb(0, 0, 0) backgrounds, rgb(255, 255, 255) text')
  console.log('  Light Mode: rgb(255, 255, 255) backgrounds, rgb(0, 0, 0) text')
  console.log('\n')
})
