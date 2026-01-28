'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EnhancedNavigation } from '@/components/marketing/enhanced-navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { Brain, Video, Upload, Play, ArrowRight } from 'lucide-react'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function DemoFeaturesPage() {
  // A+++ STATE MANAGEMENT
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

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

  // A+++ LOAD DEMO FEATURES DATA
  useEffect(() => {
    const loadDemoFeaturesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load demo features'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Demo features loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load demo features')
        setIsLoading(false)
        announce('Error loading demo features', 'assertive')
      }
    }

    loadDemoFeaturesData()
  }, [announce])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <EnhancedNavigation />
        <ScrollProgress position="top" height={3} showPercentage={false} />
        <main
          className="container mx-auto p-8"
          role="main"
          aria-live="polite"
          aria-busy="true"
        >
          <div role="status" aria-label="Loading demo features">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <EnhancedNavigation />
        <ScrollProgress position="top" height={3} showPercentage={false} />
        <main
          className="container mx-auto p-8"
          role="main"
          aria-live="assertive"
        >
          <div className="max-w-2xl mx-auto mt-20" role="alert">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Navigation with Analytics */}
      <EnhancedNavigation />
      {/* Premium Scroll Progress */}
      <ScrollProgress position="top" height={3} showPercentage={false} />

      {/* Enhanced Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" aria-hidden="true" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" aria-hidden="true" />

      <main className="container mx-auto px-4 py-16 relative z-10" role="main">
        {/* Header */}
        <header className="max-w-4xl mx-auto text-center mb-16" aria-labelledby="demo-heading">
          <h1 id="demo-heading">
            <TextShimmer className="text-5xl font-bold mb-6" duration={2}>
              Experience KAZI Features Live
            </TextShimmer>
          </h1>
          <p className="text-xl text-gray-300">
            Interactive demos of our most powerful features
          </p>
        </header>

        {/* Demo Cards */}
        <section aria-labelledby="demos-heading">
          <h2 id="demos-heading" className="sr-only">Interactive feature demos</h2>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8" role="list">
            {/* AI Create Demo */}
            <article data-testid="ai-create" role="listitem">
              <LiquidGlassCard className="p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Brain className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI Create Studio</h3>
                <p className="text-gray-300 mb-6">Experience our AI-powered content creation tools with 4 premium models</p>
                <Link href="/v1/dashboard/ai-create" onClick={() => trackEvent('button_click', 'Try AI Create Demo', { feature: 'ai-create' })}>
                  <Button
                    data-testid="ai-create-button"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Try AI Create Studio demo"
                  >
                    <Play className="mr-2 w-4 h-4" aria-hidden="true" />
                    Try AI Create
                  </Button>
                </Link>
              </LiquidGlassCard>
            </article>

            {/* File Upload Demo */}
            <article data-testid="file-upload" role="listitem">
              <LiquidGlassCard className="p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Upload className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">File Upload System</h3>
                <p className="text-gray-300 mb-6">Test our multi-cloud storage with intelligent routing and version control</p>
                <div className="space-y-4">
                  <input
                    type="file"
                    data-testid="file-input"
                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onChange={() => trackEvent('file_input_change', 'Demo File Selected', { feature: 'file-upload' })}
                    aria-label="Select file to upload"
                  />
                  <Button
                    data-testid="upload-button"
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    onClick={() => trackEvent('button_click', 'Upload Demo File', { feature: 'file-upload' })}
                    aria-label="Upload selected file"
                  >
                    <Upload className="mr-2 w-4 h-4" aria-hidden="true" />
                    Upload File
                  </Button>
                </div>
              </LiquidGlassCard>
            </article>

            {/* Download Demo */}
            <article data-testid="download-section" role="listitem">
              <LiquidGlassCard className="p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center mb-4" aria-hidden="true">
                  <Video className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Video Studio</h3>
                <p className="text-gray-300 mb-6">Download a sample video to see our professional editing capabilities</p>
                <Button
                  data-testid="download-button"
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => trackEvent('button_click', 'Download Sample Video', { feature: 'video-studio' })}
                  aria-label="Download sample video"
                >
                  <ArrowRight className="mr-2 w-4 h-4" aria-hidden="true" />
                  Download Sample
                </Button>
              </LiquidGlassCard>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto mt-16 text-center" aria-labelledby="cta-heading">
          <LiquidGlassCard className="p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <h2 id="cta-heading">
              <TextShimmer className="text-3xl font-bold mb-4" duration={2}>
                Ready to Get Started?
              </TextShimmer>
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Start your free trial and experience all features
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Call to action buttons">
              <Link href="/signup" onClick={() => trackEvent('button_click', 'Start Free Trial - Demo CTA', '/signup')}>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 focus:ring-2 focus:ring-white focus:ring-offset-2"
                  aria-label="Start free trial"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/v1/features" onClick={() => trackEvent('button_click', 'View All Features', '/features')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2"
                  aria-label="View all features"
                >
                  View All Features
                </Button>
              </Link>
            </div>
          </LiquidGlassCard>
        </section>
      </main>
    </div>
  )
}