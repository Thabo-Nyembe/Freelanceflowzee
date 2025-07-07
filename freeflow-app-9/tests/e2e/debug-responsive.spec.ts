import { test, expect } from '@playwright/test'

test.describe('Debug Responsive Behavior', () => {
  test('should check responsive behavior at different breakpoints', async ({ page }) => {
    await page.goto('http://localhost:9323')
    await page.waitForLoadState('networkidle')
    
    // Test mobile (375px - below md breakpoint of 768px)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500) // Give time for CSS to apply
    
    const mobileMenuVisible375 = await page.getByTestId('mobile-menu-toggle').first().isVisible()
    const desktopNavVisible375 = await page.getByTestId('nav-features').first().isVisible()
    
    console.log('At 375px:', { 
      mobileMenuVisible: mobileMenuVisible375, 
      desktopNavVisible: desktopNavVisible375 
    })
    
    // Test at exactly md breakpoint (768px)
    await page.setViewportSize({ width: 768, height: 600 })
    await page.waitForTimeout(500)
    
    const mobileMenuVisible768 = await page.getByTestId('mobile-menu-toggle').first().isVisible()
    const desktopNavVisible768 = await page.getByTestId('nav-features').first().isVisible()
    
    console.log('At 768px:', { 
      mobileMenuVisible: mobileMenuVisible768, 
      desktopNavVisible: desktopNavVisible768 
    })
    
    // Test desktop (1024px - well above md breakpoint)
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(500)
    
    const mobileMenuVisible1024 = await page.getByTestId('mobile-menu-toggle').first().isVisible()
    const desktopNavVisible1024 = await page.getByTestId('nav-features').first().isVisible()
    
    console.log('At 1024px:', { 
      mobileMenuVisible: mobileMenuVisible1024, 
      desktopNavVisible: desktopNavVisible1024 
    })
    
    // Test mobile menu click functionality
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    const mobileMenuButton = page.getByTestId('mobile-menu-toggle').first()
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await page.waitForTimeout(500)
      
      const menuContentVisible = await page.getByTestId('mobile-menu-content').isVisible()
      console.log('Mobile menu content visible after click:', menuContentVisible)
    }
  })
}) 