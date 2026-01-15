'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, ChevronLeft, ChevronRight, CheckCircle, Sparkles, Trophy, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('OnboardingTour')

// ============================================================================
// TYPES - USER MANUAL SPEC
// ============================================================================

export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetElement?: string // CSS selector for highlighting
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center'
  action?: string // Required user action description
  demo?: boolean // Show demo interaction
  imageUrl?: string // Optional screenshot or illustration
}

export interface OnboardingTour {
  id: string
  title: string
  description: string
  steps: OnboardingStep[]
  targetRole: 'freelancer' | 'client' | 'both'
  completionReward?: {
    type: 'badge' | 'credit' | 'unlock'
    value: string
    description: string
  }
}

interface OnboardingTourProps {
  tour: OnboardingTour
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
}

// ============================================================================
// ONBOARDING TOUR COMPONENT
// ============================================================================

export function OnboardingTourComponent({
  tour,
  isActive,
  onComplete,
  onSkip
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      setIsVisible(true)
      setCurrentStep(0)

      logger.info('Onboarding tour started', {
        tourId: tour.id,
        tourTitle: tour.title,
        stepCount: tour.steps.length,
        targetRole: tour.targetRole
      })
    } else {
      setIsVisible(false)
    }
  }, [isActive, tour])

  const handleNext = () => {
    if (currentStep < tour.steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      logger.debug('Onboarding step advanced', {
        tourId: tour.id,
        currentStep: nextStep + 1,
        totalSteps: tour.steps.length,
        stepTitle: tour.steps[nextStep].title
      })
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)

      logger.debug('Onboarding step went back', {
        tourId: tour.id,
        currentStep: prevStep + 1,
        stepTitle: tour.steps[prevStep].title
      })
    }
  }

  const handleComplete = () => {
    logger.info('Onboarding tour completed', {
      tourId: tour.id,
      tourTitle: tour.title,
      completedSteps: tour.steps.length,
      hasReward: !!tour.completionReward
    })

    if (tour.completionReward) {
      toast.success('Onboarding Complete!', {
        description: `${tour.completionReward.description} - You earned: ${tour.completionReward.value}`
      })
    } else {
      toast.success('Tour Complete!', {
        description: `${tour.title} - You're all set! ${tour.steps.length} steps completed`
      })
    }

    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    logger.info('Onboarding tour skipped', {
      tourId: tour.id,
      tourTitle: tour.title,
      skippedAtStep: currentStep + 1,
      totalSteps: tour.steps.length
    })

    toast.info('Tour skipped', {
      description: `${tour.title} - You can restart this tour anytime from settings`
    })

    setIsVisible(false)
    onSkip()
  }

  const currentStepData = tour.steps[currentStep]
  const progress = ((currentStep + 1) / tour.steps.length) * 100

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <Card className="bg-white shadow-2xl border-2 border-indigo-200">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{tour.title}</h2>
                          <p className="text-sm text-white/90">{tour.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Step {currentStep + 1} of {tour.steps.length}</span>
                        <span>{Math.round(progress)}% Complete</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Step Badge */}
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                          Step {currentStep + 1}
                        </Badge>
                        {currentStepData.demo && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            Interactive Demo
                          </Badge>
                        )}
                      </div>

                      {/* Step Title */}
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentStepData.title}
                      </h3>

                      {/* Step Description */}
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {currentStepData.description}
                      </p>

                      {/* Action Required */}
                      {currentStepData.action && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-blue-900 text-sm">Action Required</p>
                              <p className="text-blue-800 text-sm mt-1">{currentStepData.action}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image/Screenshot */}
                      {currentStepData.imageUrl && (
                        <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                          <img src={currentStepData.imageUrl}
                            alt={currentStepData.title}
                            className="w-full h-auto"
                          loading="lazy" />
                        </div>
                      )}

                      {/* Completion Reward Preview (on last step) */}
                      {currentStep === tour.steps.length - 1 && tour.completionReward && (
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 p-5 rounded-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                              {tour.completionReward.type === 'badge' ? (
                                <Trophy className="w-6 h-6 text-white" />
                              ) : (
                                <Gift className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-yellow-900 text-lg">
                                Complete this tour to unlock!
                              </p>
                              <p className="text-yellow-800 mt-1">
                                {tour.completionReward.description}
                              </p>
                              <Badge className="bg-yellow-500 text-white mt-2">
                                {tour.completionReward.value}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="bg-gray-50 px-8 py-5 flex items-center justify-between border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {tour.steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentStep
                            ? 'bg-indigo-600 w-8'
                            : index < currentStep
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {currentStep < tour.steps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete Tour
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
