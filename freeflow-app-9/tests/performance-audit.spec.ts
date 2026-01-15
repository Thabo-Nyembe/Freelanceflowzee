import { test, expect } from '@playwright/test'

const testPages = [
  '/v2/dashboard/analytics',
  '/v2/dashboard/projects',
  '/(app)/dashboard/overview-v2',
]

test.describe('Performance Testing', () => {
  for (const page of testPages) {
    test(`${page} - Core Web Vitals`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      
      // Measure performance metrics
      const metrics = await browserPage.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const paint = performance.getEntriesByType('paint')
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            
            resolve({
              fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
              lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime || 0,
              cls: 0, // Would need layout-shift entries
              ttfb: navigation?.responseStart || 0,
            })
          }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
          
          // Fallback after 5 seconds
          setTimeout(() => {
            const paint = performance.getEntriesByType('paint')
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            
            resolve({
              fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
              lcp: 0,
              cls: 0,
              ttfb: navigation?.responseStart || 0,
            })
          }, 5000)
        })
      })
      
      console.log(`Metrics for ${page}:`, metrics)
      
      // FCP should be < 1.8s (1800ms)
      expect((metrics as any).fcp).toBeLessThan(1800)
    })

    test(`${page} - No layout shift`, async ({ page: browserPage }) => {
      const shifts: number[] = []
      
      await browserPage.exposeFunction('recordShift', (value: number) => {
        shifts.push(value)
      })
      
      await browserPage.goto(page)
      
      await browserPage.evaluate(() => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              (window as any).recordShift((entry as any).value)
            }
          }
        }).observe({ entryTypes: ['layout-shift'] })
      })
      
      await browserPage.waitForLoadState('networkidle')
      await browserPage.waitForTimeout(2000)
      
      const totalCLS = shifts.reduce((sum, shift) => sum + shift, 0)
      console.log(`CLS for ${page}:`, totalCLS)
      
      // CLS should be < 0.1
      expect(totalCLS).toBeLessThan(0.1)
    })

    test(`${page} - Images are lazy-loaded`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      const images = await browserPage.locator('img').all()
      let lazyLoadedCount = 0
      
      for (const img of images) {
        const loading = await img.getAttribute('loading')
        if (loading === 'lazy') {
          lazyLoadedCount++
        }
      }
      
      console.log(`${page}: ${lazyLoadedCount}/${images.length} images lazy-loaded`)
      
      // At least some images should be lazy-loaded (if there are images)
      if (images.length > 0) {
        expect(lazyLoadedCount).toBeGreaterThan(0)
      }
    })

    test(`${page} - Minimal re-renders`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      let renderCount = 0
      
      await browserPage.exposeFunction('incrementRenderCount', () => {
        renderCount++
      })
      
      // Monitor for excessive re-renders
      await browserPage.evaluate(() => {
        const observer = new MutationObserver(() => {
          (window as any).incrementRenderCount()
        })
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        })
      })
      
      await browserPage.waitForTimeout(3000)
      
      console.log(`${page}: ${renderCount} mutations detected`)
      
      // Should have minimal mutations after initial load
      expect(renderCount).toBeLessThan(100)
    })

    test(`${page} - Smooth animations (60fps)`, async ({ page: browserPage }) => {
      await browserPage.goto(page)
      await browserPage.waitForLoadState('networkidle')
      
      const fps = await browserPage.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frameCount = 0
          let lastTime = performance.now()
          
          function countFrame() {
            frameCount++
            const currentTime = performance.now()
            
            if (currentTime - lastTime >= 1000) {
              resolve(frameCount)
            } else {
              requestAnimationFrame(countFrame)
            }
          }
          
          requestAnimationFrame(countFrame)
        })
      })
      
      console.log(`${page}: ${fps} FPS`)
      
      // Should maintain close to 60fps
      expect(fps).toBeGreaterThanOrEqual(55)
    })
  }
})
