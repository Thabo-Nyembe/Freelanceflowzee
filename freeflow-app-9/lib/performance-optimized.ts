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

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Track Web Vitals
  trackWebVitals()
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Performance monitoring initialized')
  }
} 