// Web Vitals tracking with correct v5 imports
export async function trackWebVitals() {
  if (typeof window === 'undefined') return

  try {
    const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals')
    
    // Core Web Vitals (v5.x uses INP instead of FID)
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics) // Interaction to Next Paint (replaces FID in v5.x)
    onLCP(sendToAnalytics)
    
    // Other important metrics
    onFCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  } catch (error) {
    console.warn('Failed to load web-vitals:', error)
  }
}

function sendToAnalytics(metric: any) {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric.name, metric.value, metric.rating)
  }
  
  // Example: Send to Google Analytics
  // gtag('event', metric.name, {
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   event_label: metric.id,
  //   non_interaction: true,
  // })
}

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Monitor resource loading performance
  monitorResources() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Log slow resources in development
          if (process.env.NODE_ENV === 'development' && resourceEntry.duration > 1000) {
            console.warn('🐌 Slow resource:', resourceEntry.name, `${resourceEntry.duration.toFixed(2)}ms`)
          }
        }
      })
    })

    observer.observe({ entryTypes: ['resource'] })
    this.observers.set('resources', observer)
  }

  // Monitor navigation performance
  monitorNavigation() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Navigation timing:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            })
          }
        }
      })
    })

    observer.observe({ entryTypes: ['navigation'] })
    this.observers.set('navigation', observer)
  }

  // Monitor largest contentful paint
  monitorLCP() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 LCP element:', lastEntry)
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('lcp', observer)
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
  }
}

// Image loading optimization
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Preload critical images
export async function preloadCriticalImages(images: string[]) {
  try {
    await Promise.all(images.map(preloadImage))
    console.log('✅ Critical images preloaded')
  } catch (error) {
    console.warn('⚠️ Failed to preload some images:', error)
  }
}

// Bundle size monitoring
export function logBundleInfo() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

  // Log initial bundle size
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const totalSize = scripts.reduce((total, script) => {
    const src = script.getAttribute('src')
    if (src && src.includes('/_next/static/')) {
      // Estimate size based on script presence
      return total + 1
    }
    return total
  }, 0)

  console.log('📦 Estimated bundle chunks:', totalSize)
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('performance' in window) || !('memory' in (window.performance as any))) return

  const memory = (window.performance as any).memory
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🧠 Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    })
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  const optimizer = PerformanceOptimizer.getInstance()
  
  // Start monitoring
  optimizer.monitorResources()
  optimizer.monitorNavigation()
  optimizer.monitorLCP()
  
  // Track Web Vitals
  trackWebVitals()
  
  // Log bundle info
  logBundleInfo()
  
  // Monitor memory usage periodically
  setInterval(monitorMemoryUsage, 30000) // Every 30 seconds
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    optimizer.cleanup()
  })
}

// Lazy loading utility
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  })
}

// Performance-optimized component loader
export function loadComponentWithPerformance<T>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): Promise<{ default: T }> {
  const startTime = performance.now()
  
  return importFn().then((module) => {
    const loadTime = performance.now() - startTime
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Component "${componentName}" loaded in ${loadTime.toFixed(2)}ms`)
    }
    
    return module
  })
} 