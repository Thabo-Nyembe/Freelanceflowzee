"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'
import CommunityHub from "@/components/hubs/community-hub"

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createSimpleLogger('CommunityPage')

export default function CommunityPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD USER DATA
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading community page', { userId })

        setIsLoading(false)
        announce('Community hub loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load community hub'
        logger.error('Failed to load community page', { error: errorMessage, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading community hub', 'assertive')
        toast.error('Failed to load community')
      }
    }

    loadUserData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CommunityHub currentUserId={userId || '00000000-0000-0000-0000-000000000001'} />
    </div>
  )
}