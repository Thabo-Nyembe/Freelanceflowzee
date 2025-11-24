import { test } from '@playwright/test'

test('Check body and html background colors', async ({ page }) => {
  await page.goto('http://localhost:9323/dashboard/my-day', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  })

  console.log('\n=== DARK MODE ===')

  // Set dark mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
  })

  await page.waitForTimeout(2000)

  const darkResults = await page.evaluate(() => {
    const html = document.documentElement
    const body = document.body
    const mainContainer = document.querySelector('main')
    const layoutDiv = document.querySelector('.flex.h-screen')

    return {
      html: {
        bg: window.getComputedStyle(html).backgroundColor,
        color: window.getComputedStyle(html).color,
        classes: html.className
      },
      body: {
        bg: window.getComputedStyle(body).backgroundColor,
        color: window.getComputedStyle(body).color,
        classes: body.className
      },
      mainContainer: mainContainer ? {
        bg: window.getComputedStyle(mainContainer).backgroundColor,
        color: window.getComputedStyle(mainContainer).color,
        classes: (mainContainer as HTMLElement).className
      } : null,
      layoutDiv: layoutDiv ? {
        bg: window.getComputedStyle(layoutDiv).backgroundColor,
        color: window.getComputedStyle(layoutDiv).color,
        classes: (layoutDiv as HTMLElement).className
      } : null
    }
  })

  console.log('HTML Element:')
  console.log(`  Background: ${darkResults.html.bg}`)
  console.log(`  Color: ${darkResults.html.color}`)
  console.log(`  Classes: ${darkResults.html.classes}`)

  console.log('\nBODY Element:')
  console.log(`  Background: ${darkResults.body.bg}`)
  console.log(`  Color: ${darkResults.body.color}`)
  console.log(`  Classes: ${darkResults.body.classes}`)

  if (darkResults.mainContainer) {
    console.log('\nMAIN Container:')
    console.log(`  Background: ${darkResults.mainContainer.bg}`)
    console.log(`  Color: ${darkResults.mainContainer.color}`)
    console.log(`  Classes: ${darkResults.mainContainer.classes?.substring(0, 100)}`)
  }

  if (darkResults.layoutDiv) {
    console.log('\nLayout DIV (.flex.h-screen):')
    console.log(`  Background: ${darkResults.layoutDiv.bg}`)
    console.log(`  Color: ${darkResults.layoutDiv.color}`)
    console.log(`  Classes: ${darkResults.layoutDiv.classes?.substring(0, 100)}`)
  }

  await page.screenshot({
    path: 'test-results/visual-verification/body-check-dark.png',
    fullPage: false
  })

  console.log('\n=== LIGHT MODE ===')

  // Set light mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
  })

  await page.waitForTimeout(2000)

  const lightResults = await page.evaluate(() => {
    const html = document.documentElement
    const body = document.body
    const mainContainer = document.querySelector('main')
    const layoutDiv = document.querySelector('.flex.h-screen')

    return {
      html: {
        bg: window.getComputedStyle(html).backgroundColor,
        color: window.getComputedStyle(html).color,
        classes: html.className
      },
      body: {
        bg: window.getComputedStyle(body).backgroundColor,
        color: window.getComputedStyle(body).color,
        classes: body.className
      },
      mainContainer: mainContainer ? {
        bg: window.getComputedStyle(mainContainer).backgroundColor,
        color: window.getComputedStyle(mainContainer).color,
        classes: (mainContainer as HTMLElement).className
      } : null,
      layoutDiv: layoutDiv ? {
        bg: window.getComputedStyle(layoutDiv).backgroundColor,
        color: window.getComputedStyle(layoutDiv).color,
        classes: (layoutDiv as HTMLElement).className
      } : null
    }
  })

  console.log('HTML Element:')
  console.log(`  Background: ${lightResults.html.bg}`)
  console.log(`  Color: ${lightResults.html.color}`)
  console.log(`  Classes: ${lightResults.html.classes}`)

  console.log('\nBODY Element:')
  console.log(`  Background: ${lightResults.body.bg}`)
  console.log(`  Color: ${lightResults.body.color}`)
  console.log(`  Classes: ${lightResults.body.classes}`)

  if (lightResults.mainContainer) {
    console.log('\nMAIN Container:')
    console.log(`  Background: ${lightResults.mainContainer.bg}`)
    console.log(`  Color: ${lightResults.mainContainer.color}`)
    console.log(`  Classes: ${lightResults.mainContainer.classes?.substring(0, 100)}`)
  }

  if (lightResults.layoutDiv) {
    console.log('\nLayout DIV (.flex.h-screen):')
    console.log(`  Background: ${lightResults.layoutDiv.bg}`)
    console.log(`  Color: ${lightResults.layoutDiv.color}`)
    console.log(`  Classes: ${lightResults.layoutDiv.classes?.substring(0, 100)}`)
  }

  await page.screenshot({
    path: 'test-results/visual-verification/body-check-light.png',
    fullPage: false
  })

  console.log('\n✅ Done! Check the screenshots at test-results/visual-verification/')
})
