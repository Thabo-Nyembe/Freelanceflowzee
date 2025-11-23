'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { OnboardingTourComponent, OnboardingTour } from './onboarding-tour'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('OnboardingProvider')

// ============================================================================
// ONBOARDING CONTEXT
// ============================================================================

interface OnboardingContextType {
  startTour: (tour: OnboardingTour) => void
  completeTour: (tourId: string) => void
  skipTour: () => void
  isAnyTourActive: boolean
  completedTours: string[]
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

// ============================================================================
// ONBOARDING PROVIDER
// ============================================================================

export function OnboardingProvider({ children }: { children: React.node }) {
  const [activeTour, setActiveTour] = useState<OnboardingTour | null>(null)
  const [completedTours, setCompletedTours] = useState<string[]>([])

  // Load completed tours from localStorage on mount
  useEffect(() => {
    const savedCompletedTours = localStorage.getItem('kazi_completed_tours')
    if (savedCompletedTours) {
      try {
        const parsed = JSON.parse(savedCompletedTours)
        setCompletedTours(parsed)
        logger.info('Loaded completed tours from localStorage', { count: parsed.length })
      } catch (error) {
        logger.error('Failed to parse completed tours from localStorage', { error })
      }
    }
  }, [])

  const startTour = (tour: OnboardingTour) => {
    // Check if already completed
    if (completedTours.includes(tour.id)) {
      logger.info('Tour already completed, restarting', { tourId: tour.id })
    }

    setActiveTour(tour)
    logger.info('Starting onboarding tour', {
      tourId: tour.id,
      tourTitle: tour.title,
      stepCount: tour.steps.length,
      targetRole: tour.targetRole
    })
  }

  const completeTour = (tourId: string) => {
    const newCompletedTours = [...completedTours, tourId]
    setCompletedTours(newCompletedTours)
    setActiveTour(null)

    // Save to localStorage
    try {
      localStorage.setItem('kazi_completed_tours', JSON.stringify(newCompletedTours))
      logger.info('Tour completed and saved', {
        tourId,
        totalCompleted: newCompletedTours.length
      })
    } catch (error) {
      logger.error('Failed to save completed tour to localStorage', { error, tourId })
    }
  }

  const skipTour = () => {
    if (activeTour) {
      logger.info('Tour skipped', { tourId: activeTour.id })
    }
    setActiveTour(null)
  }

  const value: OnboardingContextType = {
    startTour,
    completeTour,
    skipTour,
    isAnyTourActive: activeTour !== null,
    completedTours
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {activeTour && (
        <OnboardingTourComponent
          tour={activeTour}
          isActive={true}
          onComplete={() => completeTour(activeTour.id)}
          onSkip={skipTour}
        />
      )}
    </OnboardingContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
