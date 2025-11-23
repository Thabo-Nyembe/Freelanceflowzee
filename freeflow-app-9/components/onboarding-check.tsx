'use client'

/**
 * Onboarding Check Component
 *
 * Checks if user has completed onboarding and redirects to /onboarding if not
 * Used in dashboard layout to ensure all users complete setup
 */

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import logger from '@/lib/logger'

export function OnboardingCheck() {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Don't check if already on onboarding page
    if (pathname?.startsWith('/onboarding')) {
      setIsChecking(false)
      return
    }

    // Check onboarding status
    const checkOnboardingStatus = async () => {
      try {
        // Check localStorage for onboarding completion
        const onboardingComplete = localStorage.getItem('kazi-onboarding-complete')
        const userId = localStorage.getItem('kazi-user-id')

        if (!onboardingComplete && !userId) {
          logger.info('New user detected - redirecting to onboarding', {
            pathname
          })

          // Redirect to onboarding
          router.push('/onboarding')
        } else {
          logger.debug('Onboarding check passed', {
            onboardingComplete: !!onboardingComplete,
            userId: !!userId
          })
        }
      } catch (error) {
        logger.error('Onboarding check failed', { error })
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [pathname, router])

  // Don't render anything - this is just a check
  return null
}

/**
 * Mark onboarding as complete
 * Call this after user completes onboarding wizard
 */
export function markOnboardingComplete(userId: string) {
  localStorage.setItem('kazi-onboarding-complete', 'true')
  localStorage.setItem('kazi-user-id', userId)
  logger.info('Onboarding marked as complete', { userId })
}

/**
 * Check if onboarding is complete
 * Use this to conditionally show onboarding-related UI
 */
export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true // SSR safety
  return localStorage.getItem('kazi-onboarding-complete') === 'true'
}

/**
 * Reset onboarding status (for testing)
 */
export function resetOnboarding() {
  localStorage.removeItem('kazi-onboarding-complete')
  localStorage.removeItem('kazi-user-id')
  logger.info('Onboarding status reset')
}
