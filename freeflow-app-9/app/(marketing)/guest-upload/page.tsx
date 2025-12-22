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

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-none dark:bg-gray-900 pt-24 pb-12">
        {/* Hero Section with Enhanced Copy */}
        <section className="max-w-4xl mx-auto px-6 mb-8 text-center" aria-labelledby="guest-upload-heading">
          <div
            className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold mb-4 shadow-lg"
            role="status"
            aria-label="Files 1GB-6GB are 100% FREE!"
          >
            🎉 Files 1GB-6GB are 100% FREE!
          </div>
          <h1
            id="guest-upload-heading"
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Share Large Files Without the Hassle
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            No subscription. No signup. Just upload, pay once, and share.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Perfect for sending client deliverables, project files, or media to anyone, anywhere.
          </p>
        </section>

        <section aria-label="File upload wizard">
          <GuestUploadWizard />
        </section>

        {/* Trust Indicators */}
        <section
          className="max-w-4xl mx-auto px-6 mt-12"
          aria-labelledby="features-heading"
          role="region"
        >
          <h2 id="features-heading" className="sr-only">File sharing features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center" role="list">
            <div role="listitem">
              <p
                className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                role="status"
                aria-label="Maximum file size: 25 gigabytes"
              >
                25GB
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Max file size</p>
            </div>
            <div role="listitem">
              <p
                className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                role="status"
                aria-label="Link validity: 30 days"
              >
                30 Days
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Link validity</p>
            </div>
            <div role="listitem">
              <p
                className="text-3xl font-bold text-green-600 dark:text-green-400"
                role="status"
                aria-label="Free for files up to 6 gigabytes"
              >
                FREE
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Up to 6GB</p>
            </div>
            <div role="listitem">
              <p
                className="text-3xl font-bold text-red-600 dark:text-red-400"
                role="status"
                aria-label="Download limit: 10 downloads"
              >
                10
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download limit</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
