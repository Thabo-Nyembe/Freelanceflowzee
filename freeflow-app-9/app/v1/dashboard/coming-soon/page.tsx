'use client'

// MIGRATED: Batch #23 - Verified database hook integration

export const dynamic = 'force-dynamic';

import { useCallback, useState, useEffect } from 'react'
import { ComingSoonSystem } from '@/components/ui/coming-soon-system'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

export default function ComingSoonPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ LOAD COMING SOON DATA
  useEffect(() => {
    const loadComingSoonData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load coming soon features from API
        const response = await fetch('/api/features/coming-soon')
        if (!response.ok) throw new Error('Failed to load coming soon features')

        setIsLoading(false)
        announce('Coming soon features loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load coming soon features')
        setIsLoading(false)
        announce('Error loading coming soon features', 'assertive')
      }
    }

    loadComingSoonData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // ============================================
  // Available HANDLERS
  // ============================================

  const handleNotifyMe = useCallback(async (email?: string) => {
    try {
      if (!email && !userId) {
        announce('Please provide an email address', 'assertive')
        return
      }

      const response = await fetch('/api/features/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || undefined,
          user_id: userId,
          feature: 'coming_soon_features',
          source: 'coming_soon_page'
        })
      })

      if (!response.ok) throw new Error('Failed to subscribe')

      announce('You\'ll be notified when new features launch!', 'polite')
    } catch (err) {
      announce('Failed to subscribe. Please try again.', 'assertive')
      console.error('Notify me error:', err)
    }
  }, [userId, announce])

  const handleViewRoadmap = useCallback(() => {
    // Navigate to roadmap page
    window.location.href = '/dashboard/roadmap'
    announce('Navigating to roadmap', 'polite')
  }, [announce])

  const handleRequestFeature = useCallback(async (request: string) => {
    try {
      if (!request || !request.trim()) {
        announce('Please describe the feature you\'d like to request', 'assertive')
        return
      }

      const response = await fetch('/api/features/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_request: request.trim(),
          user_id: userId,
          source: 'coming_soon_page',
          priority: 'normal'
        })
      })

      if (!response.ok) throw new Error('Failed to submit feature request')

      announce('Feature request submitted! Thank you for your feedback.', 'polite')
    } catch (err) {
      announce('Failed to submit request. Please try again.', 'assertive')
      console.error('Feature request error:', err)
    }
  }, [userId, announce])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <ErrorBoundary level="page" name="Available Page">
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </ErrorBoundary>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <ErrorBoundary level="page" name="Available Page">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="page" name="Available Page">
      <div>
        <div className="container mx-auto px-4 py-8">
          <ComingSoonSystem showAll={true} />
        </div>
      </div>
    </ErrorBoundary>
  )
}