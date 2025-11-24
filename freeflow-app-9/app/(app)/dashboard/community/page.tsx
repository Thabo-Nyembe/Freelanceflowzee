"use client"

import { useState, useEffect } from 'react'
import CommunityHub from "@/components/hubs/community-hub"

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

export default function CommunityPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD COMMUNITY DATA
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500) // Reduced from 1000ms to 500ms for faster loading
        })

        setIsLoading(false)
        announce('Community hub loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load community hub')
        setIsLoading(false)
        announce('Error loading community hub', 'assertive')
      }
    }

    loadCommunityData()
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
      <CommunityHub currentUserId="demo-user" />
    </div>
  )
}