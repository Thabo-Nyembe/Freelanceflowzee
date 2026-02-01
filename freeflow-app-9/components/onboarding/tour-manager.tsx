"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Target,
  MousePointer,
  Lightbulb,
  Zap,
  Award,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('TourManager')

// ============================================================================
// TYPES
// ============================================================================

export interface TourStep {
  id: string
  title: string
  description: string
  element: string // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'type' | 'scroll' | 'wait'
  nextTrigger?: 'manual' | 'auto' | 'action'
  highlightPadding?: number
  spotlightRadius?: number
  content?: {
    image?: string
    video?: string
    tip?: string
    warning?: string
  }
}

export interface Tour {
  id: string
  name: string
  description: string
  category: 'getting-started' | 'feature' | 'advanced' | 'tips'
  steps: TourStep[]
  estimatedTime: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon?: React.ReactNode
  badge?: string
}

interface TourManagerProps {
  tours: Tour[]
  onTourComplete?: (tourId: string, duration: number) => void
  onTourSkip?: (tourId: string, stepIndex: number) => void
  autoStart?: boolean
  showProgress?: boolean
  allowSkip?: boolean
  className?: string
}

// ============================================================================
// TOUR MANAGER COMPONENT
// ============================================================================

export function TourManager({
  tours,
  onTourComplete,
  onTourSkip,
  autoStart = false,
  showProgress = true,
  allowSkip = true,
  className = ''
}: TourManagerProps) {
  // State
  const [isActive, setIsActive] = useState(false)
  const [currentTour, setCurrentTour] = useState<Tour | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showTourList, setShowTourList] = useState(false)
  const [completedTours, setCompletedTours] = useState<string[]>([])
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [startTime, setStartTime] = useState<number>(0)

  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStep = currentTour?.steps[currentStepIndex]
  const totalSteps = currentTour?.steps.length || 0
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  // ============================================================================
  // TOUR CONTROL
  // ============================================================================

  const startTour = (tour: Tour) => {
    setCurrentTour(tour)
    setCurrentStepIndex(0)
    setIsActive(true)
    setIsPaused(false)
    setStartTime(Date.now())
    setShowTourList(false)

    logger.info('Tour started', {
      tourId: tour.id,
      tourName: tour.name,
      totalSteps: tour.steps.length
    })

    toast.success(`Starting: ${tour.name}`, {
      description: `${tour.steps.length} steps • ${tour.estimatedTime} min`
    })
  }

  const nextStep = () => {
    if (!currentTour) return

    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      logger.debug('Tour step advanced', {
        tourId: currentTour.id,
        stepIndex: currentStepIndex + 1
      })
    } else {
      completeTour()
    }
  }

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      logger.debug('Tour step reversed', {
        tourId: currentTour?.id,
        stepIndex: currentStepIndex - 1
      })
    }
  }

  const skipTour = () => {
    if (!currentTour) return

    logger.info('Tour skipped', {
      tourId: currentTour.id,
      stepIndex: currentStepIndex,
      totalSteps: currentTour.steps.length
    })

    if (onTourSkip) {
      onTourSkip(currentTour.id, currentStepIndex)
    }

    endTour()
    toast.info('Tour skipped')
  }

  const completeTour = () => {
    if (!currentTour) return

    const duration = Math.round((Date.now() - startTime) / 1000) // in seconds

    logger.info('Tour completed', {
      tourId: currentTour.id,
      tourName: currentTour.name,
      duration,
      stepsCompleted: currentTour.steps.length
    })

    // Mark as completed
    const newCompleted = [...completedTours, currentTour.id]
    setCompletedTours(newCompleted)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazi_completed_tours', JSON.stringify(newCompleted))
    }

    if (onTourComplete) {
      onTourComplete(currentTour.id, duration)
    }

    toast.success('Tour completed!', {
      description: `Great job! You've mastered ${currentTour.name}`,
      icon: <Award className="w-5 h-5 text-yellow-500" />
    })

    endTour()
  }

  const endTour = () => {
    setIsActive(false)
    setCurrentTour(null)
    setCurrentStepIndex(0)
    setHighlightElement(null)
  }

  const pauseTour = () => {
    setIsPaused(!isPaused)
    logger.debug('Tour paused', { isPaused: !isPaused })
  }

  const restartTour = () => {
    if (!currentTour) return
    setCurrentStepIndex(0)
    setIsPaused(false)
    setStartTime(Date.now())
    logger.info('Tour restarted', { tourId: currentTour.id })
  }

  // ============================================================================
  // ELEMENT HIGHLIGHTING
  // ============================================================================

  useEffect(() => {
    if (!isActive || !currentStep || isPaused) {
      setHighlightElement(null)
      return
    }

    // Find target element
    const element = document.querySelector(currentStep.element) as HTMLElement

    if (!element) {
      logger.warn('Tour target element not found', {
        selector: currentStep.element,
        stepId: currentStep.id
      })
      return
    }

    setHighlightElement(element)

    // Scroll element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })

    // Calculate tooltip position
    const rect = element.getBoundingClientRect()
    const padding = currentStep.highlightPadding || 8

    let top = 0
    let left = 0

    switch (currentStep.position) {
      case 'top':
        top = rect.top - 200
        left = rect.left + rect.width / 2
        break
      case 'bottom':
        top = rect.bottom + 20
        left = rect.left + rect.width / 2
        break
      case 'left':
        top = rect.top + rect.height / 2
        left = rect.left - 320
        break
      case 'right':
        top = rect.top + rect.height / 2
        left = rect.right + 20
        break
      case 'center':
        top = window.innerHeight / 2 - 150
        left = window.innerWidth / 2
        break
    }

    setTooltipPosition({ top, left })

  }, [currentStep, isActive, isPaused])

  // Load completed tours from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kazi_completed_tours')
      if (saved) {
        try {
          setCompletedTours(JSON.parse(saved))
        } catch (e) {
          logger.error('Failed to load completed tours', { error: e })
        }
      }
    }
  }, [])

  // Auto-start first tour
  useEffect(() => {
    if (autoStart && tours.length > 0 && !isActive && completedTours.length === 0) {
      const firstTour = tours[0]
      if (firstTour && !completedTours.includes(firstTour.id)) {
        setTimeout(() => startTour(firstTour), 1000)
      }
    }
  }, [autoStart, tours, isActive, completedTours])

  // Listen for custom events from TourTriggerButton
  useEffect(() => {
    const handleStartTour = (event: CustomEvent) => {
      const { tourId } = event.detail
      const tour = tours.find(t => t.id === tourId)
      if (tour) {
        logger.info('Tour started via custom event', { tourId })
        startTour(tour)
      }
    }

    const handleOpenTourSelection = () => {
      logger.info('Tour selection opened via custom event')
      setShowTourList(true)
    }

    window.addEventListener('start-tour', handleStartTour)
    window.addEventListener('open-tour-selection', handleOpenTourSelection)

    return () => {
      window.removeEventListener('start-tour', handleStartTour)
      window.removeEventListener('open-tour-selection', handleOpenTourSelection)
    }
  }, [tours])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Tour List Button */}
      {!isActive && (
        <Button
          onClick={() => setShowTourList(true)}
          className={`fixed bottom-6 right-6 z-50 shadow-lg ${className}`}
          size="lg"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Interactive Tours
        </Button>
      )}

      {/* Tour List Dialog */}
      <Dialog open={showTourList} onOpenChange={setShowTourList}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Interactive Tours
            </DialogTitle>
            <DialogDescription>
              Learn KAZI features with guided step-by-step tutorials
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {tours.map((tour) => {
              const isCompleted = completedTours.includes(tour.id)

              return (
                <Card
                  key={tour.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isCompleted ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => startTour(tour)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          tour.icon || <Target className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{tour.name}</h3>
                          {tour.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {tour.badge}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {tour.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="capitalize">
                            {tour.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {tour.steps.length} steps
                          </Badge>
                          <Badge variant="outline">
                            {tour.estimatedTime} min
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-green-600 text-white">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      variant={isCompleted ? 'outline' : 'default'}
                    >
                      {isCompleted ? 'Replay Tour' : 'Start Tour'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Tour Overlay */}
      {isActive && currentStep && !isPaused && (
        <>
          {/* Dark Overlay with Spotlight */}
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              background: highlightElement
                ? `radial-gradient(circle ${currentStep.spotlightRadius || 150}px at ${
                    highlightElement.getBoundingClientRect().left + highlightElement.getBoundingClientRect().width / 2
                  }px ${
                    highlightElement.getBoundingClientRect().top + highlightElement.getBoundingClientRect().height / 2
                  }px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)`
                : 'rgba(0, 0, 0, 0.75)'
            }}
          />

          {/* Highlight Border */}
          {highlightElement && (
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: highlightElement.getBoundingClientRect().top - (currentStep.highlightPadding || 8),
                left: highlightElement.getBoundingClientRect().left - (currentStep.highlightPadding || 8),
                width: highlightElement.getBoundingClientRect().width + (currentStep.highlightPadding || 8) * 2,
                height: highlightElement.getBoundingClientRect().height + (currentStep.highlightPadding || 8) * 2,
                border: '3px solid #3B82F6',
                borderRadius: '8px',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            />
          )}

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="fixed z-[10000] max-w-md"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: currentStep.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)'
            }}
          >
            <Card className="shadow-2xl border-2 border-blue-600">
              <CardContent className="pt-6">
                {/* Step Counter */}
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-600 text-white">
                    Step {currentStepIndex + 1} of {totalSteps}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={pauseTour}
                      className="h-8 w-8 p-0"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    {allowSkip && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={skipTour}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {showProgress && (
                  <Progress value={progress} className="mb-4" />
                )}

                {/* Step Title */}
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-blue-600" />
                  {currentStep.title}
                </h3>

                {/* Step Description */}
                <p className="text-gray-700 mb-4">
                  {currentStep.description}
                </p>

                {/* Optional Content */}
                {currentStep.content?.tip && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-900">
                        <strong>Tip:</strong> {currentStep.content.tip}
                      </p>
                    </div>
                  </div>
                )}

                {currentStep.content?.warning && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-2">
                      <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-900">
                        <strong>Note:</strong> {currentStep.content.warning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStepIndex === totalSteps - 1 ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Paused State */}
      {isActive && isPaused && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
          <Card className="max-w-md shadow-2xl">
            <CardContent className="pt-6 text-center">
              <Pause className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Tour Paused</h3>
              <p className="text-gray-600 mb-6">
                Take your time! Resume when you're ready.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={restartTour}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
                <Button
                  onClick={pauseTour}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </div>

              {allowSkip && (
                <Button
                  variant="ghost"
                  onClick={skipTour}
                  className="w-full mt-2"
                >
                  Exit Tour
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pulse Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  )
}
