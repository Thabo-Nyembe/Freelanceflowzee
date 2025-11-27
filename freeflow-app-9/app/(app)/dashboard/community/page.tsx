"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import CommunityHub from "@/components/hubs/community-hub"

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('CommunityPage')

export default function CommunityPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user')
  const { announce } = useAnnouncer()

  // A+++ LOAD USER DATA
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading community page')

        // Get authenticated user
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          logger.warn('No authenticated user', { error: authError.message })
        }

        if (user) {
          setCurrentUserId(user.id)
          logger.info('User authenticated', { userId: user.id })
        } else {
          logger.info('Using demo user')
        }

        setIsLoading(false)
        announce('Community hub loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load community hub'
        logger.error('Failed to load community page', { error: errorMessage })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading community hub', 'assertive')
        toast.error('Failed to load community')
      }
    }

    loadUserData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      <CommunityHub currentUserId={currentUserId} />
    </div>
  )
}