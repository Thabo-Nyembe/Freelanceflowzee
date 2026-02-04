'use client'

/**
 * New User Detection Hook
 *
 * Detects if the current user is new and should see onboarding
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('NewUserDetection')

interface NewUserStatus {
  isNewUser: boolean
  hasCompletedOnboarding: boolean
  isLoading: boolean
  accountAge: number // days since account creation
  projectCount: number
  shouldShowOnboarding: boolean
  dismissOnboarding: () => void
  resetOnboarding: () => void
}

export function useNewUserDetection(userId?: string): NewUserStatus {
  const [isLoading, setIsLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [accountAge, setAccountAge] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false)

  useEffect(() => {
    checkUserStatus()
  }, [userId])

  const checkUserStatus = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        logger.warn('No authenticated user found for onboarding check')
        setIsLoading(false)
        return
      }

      // Check localStorage for onboarding completion
      const onboardingKey = `kazi_onboarding_complete_${user.id}`
      const onboardingDismissedKey = `kazi_onboarding_dismissed_${user.id}`
      const hasCompleted = localStorage.getItem(onboardingKey) === 'true'
      const wasDismissed = localStorage.getItem(onboardingDismissedKey) === 'true'

      setHasCompletedOnboarding(hasCompleted)

      // Calculate account age
      const createdAt = user.created_at ? new Date(user.created_at) : new Date()
      const now = new Date()
      const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      setAccountAge(ageInDays)

      // Check for projects
      const { count: projectCountResult } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const projects = projectCountResult || 0
      setProjectCount(projects)

      // Determine if user is "new"
      // New user criteria:
      // - Account less than 7 days old, OR
      // - Has no projects AND hasn't completed onboarding
      const isAccountNew = ageInDays < 7
      const hasNoProjects = projects === 0
      const isNew = isAccountNew || (hasNoProjects && !hasCompleted)

      setIsNewUser(isNew)

      // Show onboarding if:
      // - User is new AND
      // - Hasn't completed onboarding AND
      // - Hasn't dismissed it
      const showOnboarding = isNew && !hasCompleted && !wasDismissed

      setShouldShowOnboarding(showOnboarding)

      logger.info('User status checked', {
        userId: user.id,
        isNewUser: isNew,
        accountAge: ageInDays,
        projectCount: projects,
        hasCompletedOnboarding: hasCompleted,
        shouldShowOnboarding: showOnboarding
      })

    } catch (error) {
      logger.error('Failed to check user status', { error })
    } finally {
      setIsLoading(false)
    }
  }

  const dismissOnboarding = () => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`kazi_onboarding_dismissed_${user.id}`, 'true')
        setShouldShowOnboarding(false)
        logger.info('Onboarding dismissed', { userId: user.id })
      }
    })
  }

  const resetOnboarding = () => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.removeItem(`kazi_onboarding_complete_${user.id}`)
        localStorage.removeItem(`kazi_onboarding_dismissed_${user.id}`)
        localStorage.removeItem(`kazi_onboarding_progress_${user.id}`)
        setShouldShowOnboarding(true)
        setHasCompletedOnboarding(false)
        logger.info('Onboarding reset', { userId: user.id })
      }
    })
  }

  return {
    isNewUser,
    hasCompletedOnboarding,
    isLoading,
    accountAge,
    projectCount,
    shouldShowOnboarding,
    dismissOnboarding,
    resetOnboarding
  }
}

export default useNewUserDetection
