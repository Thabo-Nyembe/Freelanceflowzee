'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  shouldShowStorageOnboarding,
  completeStorageOnboarding,
  skipStorageOnboarding,
  getUserPreferences,
  type UserPreferences
} from '@/lib/storage/preferences-queries'
import { getStorageConnections } from '@/lib/storage/storage-queries'

interface UseStorageOnboardingReturn {
  showWizard: boolean
  setShowWizard: (show: boolean) => void
  handleComplete: () => Promise<void>
  handleSkip: () => Promise<void>
  loading: boolean
  preferences: UserPreferences | null
  hasConnections: boolean
}

export function useStorageOnboarding(): UseStorageOnboardingReturn {
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [hasConnections, setHasConnections] = useState(false)

  useEffect(() => {
    async function checkOnboardingStatus() {
      setLoading(true)

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Get user preferences
        const userPreferences = await getUserPreferences(user.id)
        setPreferences(userPreferences)

        // Check if user has any storage connections
        const connections = await getStorageConnections(user.id)
        setHasConnections(connections.length > 0)

        // Determine if we should show the wizard
        const shouldShow = await shouldShowStorageOnboarding(user.id)

        // Only show wizard if:
        // 1. User should see onboarding (not completed or skipped)
        // 2. User has no storage connections yet
        if (shouldShow && connections.length === 0) {
          // Small delay to ensure UI is ready
          setTimeout(() => {
            setShowWizard(true)
          }, 1000)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  const handleComplete = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      await completeStorageOnboarding(user.id)

      // Update local state
      const updatedPreferences = await getUserPreferences(user.id)
      setPreferences(updatedPreferences)

      setShowWizard(false)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const handleSkip = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      await skipStorageOnboarding(user.id)

      // Update local state
      const updatedPreferences = await getUserPreferences(user.id)
      setPreferences(updatedPreferences)

      setShowWizard(false)
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    }
  }

  return {
    showWizard,
    setShowWizard,
    handleComplete,
    handleSkip,
    loading,
    preferences,
    hasConnections
  }
}
