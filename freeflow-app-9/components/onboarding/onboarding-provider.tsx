'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { OnboardingTourComponent, OnboardingTour } from './onboarding-tour'
import { PlatformTourOverlay } from './platform-tour-overlay'
import { useTour, TourProvider, PLATFORM_TOURS, type Tour as PlatformTour } from '@/lib/hooks/use-tour'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('OnboardingProvider')

// ============================================================================
// ONBOARDING CONTEXT
// ============================================================================

interface OnboardingContextType {
  startTour: (tour: OnboardingTour) => void
  startPlatformTour: (tourId: string) => void
  completeTour: (tourId: string) => void
  skipTour: () => void
  isAnyTourActive: boolean
  completedTours: string[]
  platformTours: typeof PLATFORM_TOURS
  getTourProgress: (tourId: string) => number
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

// ============================================================================
// ONBOARDING PROVIDER INNER - Uses the useTour hook
// ============================================================================

function OnboardingProviderInner({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<OnboardingTour | null>(null)

  // Use the centralized tour hook for platform tours (with database persistence)
  const tourHook = useTour()
  const {
    isActive: isPlatformTourActive,
    currentTour,
    currentStep,
    currentStepIndex,
    totalSteps,
    completedTours,
    startTour: startPlatformTourHook,
    nextStep,
    prevStep,
    skipStep,
    endTour,
    completeTour: completePlatformTour,
    availableTours,
    allTours,
    getTourProgress,
    isFirstStep,
    isLastStep
  } = tourHook

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

  const startPlatformTour = (tourId: string) => {
    startPlatformTourHook(tourId)
  }

  const completeTour = (tourId: string) => {
    setActiveTour(null)
    logger.info('Tour completed', { tourId })
  }

  const skipTour = () => {
    if (activeTour) {
      logger.info('Tour skipped', { tourId: activeTour.id })
    }
    setActiveTour(null)
    if (isPlatformTourActive) {
      endTour()
    }
  }

  const value: OnboardingContextType = {
    startTour,
    startPlatformTour,
    completeTour,
    skipTour,
    isAnyTourActive: activeTour !== null || isPlatformTourActive,
    completedTours,
    platformTours: PLATFORM_TOURS,
    getTourProgress
  }

  return (
    <OnboardingContext.Provider value={value}>
      <TourProvider value={tourHook}>
        {children}
        {/* Custom onboarding tours */}
        {activeTour && (
          <OnboardingTourComponent
            tour={activeTour}
            isActive={true}
            onComplete={() => completeTour(activeTour.id)}
            onSkip={skipTour}
          />
        )}
        {/* Platform tours with database persistence */}
        {isPlatformTourActive && <PlatformTourOverlay />}
      </TourProvider>
    </OnboardingContext.Provider>
  )
}

// ============================================================================
// ONBOARDING PROVIDER - Wrapper
// ============================================================================

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  return <OnboardingProviderInner>{children}</OnboardingProviderInner>
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
