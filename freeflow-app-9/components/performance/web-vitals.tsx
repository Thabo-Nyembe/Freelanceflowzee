'use client'

import { useEffect } from 'react'
import { reportWebVitals, reportWebVitalsWithAnalytics } from '@/lib/performance'

interface WebVitalsProps {
  /**
   * When true, sends metrics to /api/analytics/vitals endpoint
   * When false, only logs to console
   */
  sendToAnalytics?: boolean
}

/**
 * Web Vitals Component
 *
 * Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP) and optionally
 * sends them to an analytics endpoint.
 *
 * Add this component to your root layout to enable performance monitoring.
 *
 * Core Web Vitals tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity (legacy)
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 * - INP (Interaction to Next Paint): Responsiveness (modern)
 */
export function WebVitals({ sendToAnalytics = false }: WebVitalsProps) {
  useEffect(() => {
    if (sendToAnalytics) {
      reportWebVitalsWithAnalytics()
    } else {
      reportWebVitals()
    }
  }, [sendToAnalytics])

  // This component doesn't render anything
  return null
}

export default WebVitals
