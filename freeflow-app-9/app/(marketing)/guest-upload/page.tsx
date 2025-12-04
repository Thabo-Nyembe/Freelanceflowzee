'use client'

import { GuestUploadWizard } from '@/components/guest-upload/guest-upload-wizard'
import { EnhancedNavigation } from '@/components/marketing/enhanced-navigation'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function GuestUploadPage() {
  const pathname = usePathname()

  // Analytics tracking helper
  const trackEvent = async (event: string, label: string, properties?: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties: {
            label,
            pathname,
            ...properties,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  // Track page view
  useEffect(() => {
    trackEvent('page_view', 'Guest Upload Page')
  }, [])

  return (
    <>
      {/* Enhanced Navigation with Analytics */}
      <EnhancedNavigation />
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={false} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 pt-24 pb-12">
        {/* Hero Section with Enhanced Copy */}
        <div className="max-w-4xl mx-auto px-6 mb-8 text-center">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold mb-4 shadow-lg">
            🎉 Files 1GB-6GB are 100% FREE!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Share Large Files Without the Hassle
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            No subscription. No signup. Just upload, pay once, and share.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Perfect for sending client deliverables, project files, or media to anyone, anywhere.
          </p>
        </div>

        <GuestUploadWizard />

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">25GB</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Max file size</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">30 Days</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Link validity</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">FREE</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Up to 6GB</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">10</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download limit</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
