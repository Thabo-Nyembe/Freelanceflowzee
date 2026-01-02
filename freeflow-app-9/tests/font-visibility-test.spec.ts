import { test, expect } from '@playwright/test'

test.describe('Font Visibility Test - Light & Dark Modes', () => {
  const testPages = [
    { name: 'Dashboard Overview', path: '/dashboard' },
    { name: 'My Day', path: '/dashboard/my-day-v2' },
    { name: 'Projects Hub', path: '/dashboard/projects-hub-v2' },
    { name: 'Clients', path: '/dashboard/clients-v2' },
    { name: 'Files Hub', path: '/dashboard/files-v2' },
    { name: 'Messages', path: '/dashboard/messages-v2' },
    { name: 'Settings', path: '/dashboard/settings-v2' },
    { name: 'AI Create', path: '/dashboard/ai-create-v2' },
  ]

  for (const page of testPages) {
    test(`${page.name} - Light Mode Font Visibility`, async ({ page: playwright }) => {
      // Navigate to the page
      await playwright.goto(`http://localhost:9323${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Set light mode
      await playwright.evaluate(() => {
        localStorage.setItem('theme', 'light')
        document.documentElement.classList.remove('dark')
      })

      // Wait for page to render
      await playwright.waitForTimeout(1000)

      // Check body background color (should be white)
      const bodyBgColor = await playwright.evaluate(() => {
        const body = document.body
        return window.getComputedStyle(body).backgroundColor
      })

      console.log(`${page.name} - Light Mode Body BG: ${bodyBgColor}`)

      // White should be rgb(255, 255, 255)
      expect(bodyBgColor).toMatch(/rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*1\)/)

      // Check text color on body (should be black or very dark)
      const bodyTextColor = await playwright.evaluate(() => {
        const body = document.body
        return window.getComputedStyle(body).color
      })

      console.log(`${page.name} - Light Mode Text Color: ${bodyTextColor}`)

      // Black should be rgb(0, 0, 0) or very close
      expect(bodyTextColor).toMatch(/rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,\s*1\)/)

      // Find all text elements and check visibility
      const textElements = await playwright.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label')
        const results = []

        for (let i = 0; i < Math.min(elements.length, 50); i++) {
          const el = elements[i] as HTMLElement
          const style = window.getComputedStyle(el)
          const text = el.textContent?.trim().substring(0, 50)

          if (text && text.length > 0) {
            results.push({
              tag: el.tagName,
              text,
              color: style.color,
              backgroundColor: style.backgroundColor,
              opacity: style.opacity,
              visibility: style.visibility,
              display: style.display
            })
          }
        }

        return results
      })

      console.log(`${page.name} - Light Mode: Found ${textElements.length} text elements`)

      // Verify at least 10 text elements are visible
      expect(textElements.length).toBeGreaterThan(10)

      // Check that text elements have proper contrast
      for (const element of textElements.slice(0, 10)) {
        console.log(`  ${element.tag}: "${element.text}" - Color: ${element.color}`)

        // Text should be visible (not transparent)
        expect(element.visibility).not.toBe('hidden')
        expect(element.display).not.toBe('none')
        expect(parseFloat(element.opacity)).toBeGreaterThan(0)
      }

      // Take screenshot
      await playwright.screenshot({
        path: `test-results/font-visibility/light/${page.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      })
    })

    test(`${page.name} - Dark Mode Font Visibility`, async ({ page: playwright }) => {
      // Navigate to the page
      await playwright.goto(`http://localhost:9323${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Set dark mode
      await playwright.evaluate(() => {
        localStorage.setItem('theme', 'dark')
        document.documentElement.classList.add('dark')
      })

      // Wait for page to render
      await playwright.waitForTimeout(1000)

      // Check body background color (should be black)
      const bodyBgColor = await playwright.evaluate(() => {
        const body = document.body
        return window.getComputedStyle(body).backgroundColor
      })

      console.log(`${page.name} - Dark Mode Body BG: ${bodyBgColor}`)

      // Black should be rgb(0, 0, 0)
      expect(bodyBgColor).toMatch(/rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,\s*1\)/)

      // Check text color on body (should be white or very light)
      const bodyTextColor = await playwright.evaluate(() => {
        const body = document.body
        return window.getComputedStyle(body).color
      })

      console.log(`${page.name} - Dark Mode Text Color: ${bodyTextColor}`)

      // White should be rgb(255, 255, 255) or very close
      expect(bodyTextColor).toMatch(/rgb\(255,\s*255,\s*255\)|rgba\(255,\s*255,\s*255,\s*1\)/)

      // Find all text elements and check visibility
      const textElements = await playwright.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label')
        const results = []

        for (let i = 0; i < Math.min(elements.length, 50); i++) {
          const el = elements[i] as HTMLElement
          const style = window.getComputedStyle(el)
          const text = el.textContent?.trim().substring(0, 50)

          if (text && text.length > 0) {
            results.push({
              tag: el.tagName,
              text,
              color: style.color,
              backgroundColor: style.backgroundColor,
              opacity: style.opacity,
              visibility: style.visibility,
              display: style.display
            })
          }
        }

        return results
      })

      console.log(`${page.name} - Dark Mode: Found ${textElements.length} text elements`)

      // Verify at least 10 text elements are visible
      expect(textElements.length).toBeGreaterThan(10)

      // Check that text elements have proper contrast
      for (const element of textElements.slice(0, 10)) {
        console.log(`  ${element.tag}: "${element.text}" - Color: ${element.color}`)

        // Text should be visible (not transparent)
        expect(element.visibility).not.toBe('hidden')
        expect(element.display).not.toBe('none')
        expect(parseFloat(element.opacity)).toBeGreaterThan(0)
      }

      // Take screenshot
      await playwright.screenshot({
        path: `test-results/font-visibility/dark/${page.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      })
    })
  }

  test('Contrast Ratio Verification', async ({ page: playwright }) => {
    await playwright.goto('http://localhost:9323/dashboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Test light mode contrast
    await playwright.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    })
    await playwright.waitForTimeout(500)

    const lightModeContrast = await playwright.evaluate(() => {
      // Helper function to calculate relative luminance
      const getLuminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map(val => {
          val = val / 255
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }

      // Helper to parse rgb string
      const parseRGB = (rgbString: string): number[] => {
        const match = rgbString.match(/\d+/g)
        return match ? match.map(Number) : [0, 0, 0]
      }

      // Calculate contrast ratio
      const getContrastRatio = (color1: string, color2: string) => {
        const lum1 = getLuminance(parseRGB(color1))
        const lum2 = getLuminance(parseRGB(color2))
        const lighter = Math.max(lum1, lum2)
        const darker = Math.min(lum1, lum2)
        return (lighter + 0.05) / (darker + 0.05)
      }

      const body = document.body
      const bgColor = window.getComputedStyle(body).backgroundColor
      const textColor = window.getComputedStyle(body).color

      return {
        background: bgColor,
        text: textColor,
        contrastRatio: getContrastRatio(bgColor, textColor)
      }
    })

    console.log('Light Mode Contrast Analysis:')
    console.log(`  Background: ${lightModeContrast.background}`)
    console.log(`  Text: ${lightModeContrast.text}`)
    console.log(`  Contrast Ratio: ${lightModeContrast.contrastRatio.toFixed(2)}:1`)

    // WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
    // Pure black on white should be 21:1
    expect(lightModeContrast.contrastRatio).toBeGreaterThan(7)

    // Test dark mode contrast
    await playwright.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    })
    await playwright.waitForTimeout(500)

    const darkModeContrast = await playwright.evaluate(() => {
      // Helper function to calculate relative luminance
      const getLuminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map(val => {
          val = val / 255
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }

      // Helper to parse rgb string
      const parseRGB = (rgbString: string): number[] => {
        const match = rgbString.match(/\d+/g)
        return match ? match.map(Number) : [0, 0, 0]
      }

      // Calculate contrast ratio
      const getContrastRatio = (color1: string, color2: string) => {
        const lum1 = getLuminance(parseRGB(color1))
        const lum2 = getLuminance(parseRGB(color2))
        const lighter = Math.max(lum1, lum2)
        const darker = Math.min(lum1, lum2)
        return (lighter + 0.05) / (darker + 0.05)
      }

      const body = document.body
      const bgColor = window.getComputedStyle(body).backgroundColor
      const textColor = window.getComputedStyle(body).color

      return {
        background: bgColor,
        text: textColor,
        contrastRatio: getContrastRatio(bgColor, textColor)
      }
    })

    console.log('Dark Mode Contrast Analysis:')
    console.log(`  Background: ${darkModeContrast.background}`)
    console.log(`  Text: ${darkModeContrast.text}`)
    console.log(`  Contrast Ratio: ${darkModeContrast.contrastRatio.toFixed(2)}:1`)

    // WCAG AAA requires 7:1 for normal text
    // Pure white on black should be 21:1
    expect(darkModeContrast.contrastRatio).toBeGreaterThan(7)
  })
})
