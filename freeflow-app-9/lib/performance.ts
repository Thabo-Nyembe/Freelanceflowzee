import type { Metric } from 'web-vitals'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Performance')

// Web Vitals metric type (using the library's type)
export type WebVitalMetric = Metric

// Report Web Vitals - Main entry point for tracking
export function reportWebVitals() {
  if (typeof window === 'undefined') return

  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    // Core Web Vitals
    onCLS(logMetric)
    onFCP(logMetric)
    onLCP(logMetric)
    onTTFB(logMetric)
    onINP(logMetric) // Interaction to Next Paint (replaces FID in v5.x)
  })
}

// Log metric to console
function logMetric(metric: WebVitalMetric) {
  logger.debug('Web Vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
  })
}

// For production, send to analytics endpoint
export function sendToAnalytics(metric: WebVitalMetric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  })

  // Use sendBeacon if available for reliable delivery
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  } else if (typeof fetch !== 'undefined') {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// Report Web Vitals with analytics sending
export function reportWebVitalsWithAnalytics() {
  if (typeof window === 'undefined') return

  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics)
  })
}

// Web Vitals tracking with correct v5 imports (legacy function)
export async function trackWebVitals() {
  if (typeof window === 'undefined') return

  try {
    const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals')

    // Core Web Vitals (v5.x uses INP instead of FID)
    onCLS(sendToAnalyticsLegacy)
    onINP(sendToAnalyticsLegacy) // Interaction to Next Paint (replaces FID in v5.x)
    onLCP(sendToAnalyticsLegacy)

    // Other important metrics
    onFCP(sendToAnalyticsLegacy)
    onTTFB(sendToAnalyticsLegacy)
  } catch (error) {
    logger.warn('Failed to load web-vitals', { error })
  }
}

function sendToAnalyticsLegacy(metric: WebVitalMetric) {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Web Vital (Legacy)', { name: metric.name, value: metric.value, rating: metric.rating })
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
            logger.warn('Slow resource detected', { name: resourceEntry.name, duration: resourceEntry.duration })
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
            logger.debug('Navigation timing', {
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
        logger.debug('LCP element', { entry: lastEntry })
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
    logger.debug('Critical images preloaded', { count: images.length })
  } catch (error) {
    logger.warn('Failed to preload some images', { error })
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

  logger.debug('Estimated bundle chunks', { count: totalSize })
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('performance' in window) || !('memory' in (window.performance as unknown as { memory?: unknown }))) return

  const memory = (window.performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory

  if (process.env.NODE_ENV === 'development') {
    logger.debug('Memory usage', {
      usedMB: (memory.usedJSHeapSize / 1048576).toFixed(2),
      totalMB: (memory.totalJSHeapSize / 1048576).toFixed(2),
      limitMB: (memory.jsHeapSizeLimit / 1048576).toFixed(2),
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
export function createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void,
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
      logger.debug('Component loaded', { name: componentName, loadTimeMs: loadTime.toFixed(2) })
    }

    return module
  })
}
