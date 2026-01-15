'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  MousePointer,
  Lightbulb,
  Sparkles
} from 'lucide-react'
import { useTourContext, type TourStep } from '@/lib/hooks/use-tour'

// ============================================================================
// PLATFORM TOUR OVERLAY COMPONENT
// ============================================================================

export function PlatformTourOverlay() {
  const {
    isActive,
    currentTour,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipStep,
    endTour,
    isFirstStep,
    isLastStep
  } = useTourContext()

  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  // Find and highlight the target element
  useEffect(() => {
    if (!isActive || !currentStep) {
      setHighlightElement(null)
      return
    }

    // Find target element
    const element = document.querySelector(currentStep.target) as HTMLElement

    if (!element) {
      console.warn('Tour target element not found:', currentStep.target)
      setHighlightElement(null)
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
    let top = 0
    let left = 0

    switch (currentStep.placement) {
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
      default:
        top = window.innerHeight / 2 - 150
        left = window.innerWidth / 2
        break
    }

    // Keep tooltip on screen
    top = Math.max(20, Math.min(top, window.innerHeight - 300))
    left = Math.max(20, Math.min(left, window.innerWidth - 350))

    setTooltipPosition({ top, left })

    // Call onEnter callback if defined
    if (currentStep.onEnter) {
      currentStep.onEnter()
    }

    return () => {
      // Call onExit callback if defined
      if (currentStep.onExit) {
        currentStep.onExit()
      }
    }
  }, [currentStep, isActive])

  if (!isActive || !currentStep || !currentTour) {
    return null
  }

  return (
    <>
      {/* Dark Overlay with Spotlight */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-300"
        style={{
          background: highlightElement && currentStep.spotlight !== false
            ? `radial-gradient(circle 180px at ${
                highlightElement.getBoundingClientRect().left + highlightElement.getBoundingClientRect().width / 2
              }px ${
                highlightElement.getBoundingClientRect().top + highlightElement.getBoundingClientRect().height / 2
              }px, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)`
            : 'rgba(0, 0, 0, 0.75)'
        }}
      />

      {/* Highlight Border around target element */}
      {highlightElement && currentStep.spotlight !== false && (
        <div
          className="fixed z-[9999] pointer-events-none transition-all duration-300"
          style={{
            top: highlightElement.getBoundingClientRect().top - 8,
            left: highlightElement.getBoundingClientRect().left - 8,
            width: highlightElement.getBoundingClientRect().width + 16,
            height: highlightElement.getBoundingClientRect().height + 16,
            border: '3px solid #3B82F6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
            animation: 'tour-pulse 2s infinite'
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] max-w-md animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentStep.placement === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)'
        }}
      >
        <Card className="shadow-2xl border-2 border-blue-600 bg-white dark:bg-gray-900">
          <CardContent className="pt-6">
            {/* Header with step counter and close button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">
                  Step {currentStepIndex + 1} of {totalSteps}
                </Badge>
                {currentTour.icon && (
                  <span className="text-lg">{currentTour.icon}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={endTour}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="mb-4 h-1.5" />

            {/* Step Title */}
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-blue-600" />
              {currentStep.title}
            </h3>

            {/* Step Description */}
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {currentStep.content}
            </p>

            {/* Action hint if applicable */}
            {currentStep.action && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Action:</strong>{' '}
                    {currentStep.action === 'click' && 'Click the highlighted element to continue'}
                    {currentStep.action === 'input' && 'Type in the highlighted field'}
                    {currentStep.action === 'hover' && 'Hover over the highlighted element'}
                    {currentStep.action === 'wait' && 'Please wait...'}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {!isLastStep ? (
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Finish Tour
                </Button>
              )}
            </div>

            {/* Skip button */}
            <Button
              variant="ghost"
              onClick={skipStep}
              className="w-full mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip this step
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* CSS Animation for pulse effect */}
      <style jsx global>{`
        @keyframes tour-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  )
}

// ============================================================================
// TOUR START DIALOG
// ============================================================================

interface TourStartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TourStartDialog({ open, onOpenChange }: TourStartDialogProps) {
  const { allTours, completedTours, startTour, getTourProgress } = useTourContext()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[9997] bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-4xl max-h-[90vh] overflow-y-auto w-full shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold">Interactive Tours</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Learn Kazi features with guided step-by-step tutorials
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTours.map((tour) => {
                  const isCompleted = completedTours.includes(tour.id)
                  const progress = getTourProgress(tour.id)

                  return (
                    <Card
                      key={tour.id}
                      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                        isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
                      }`}
                      onClick={() => {
                        startTour(tour.id)
                        onOpenChange(false)
                      }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                            isCompleted
                              ? 'bg-green-100 dark:bg-green-900/50'
                              : 'bg-blue-100 dark:bg-blue-900/50'
                          }`}>
                            {isCompleted ? <Check className="w-6 h-6 text-green-600" /> : tour.icon || '🎯'}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{tour.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {tour.description}
                            </p>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline" className="capitalize">
                                {tour.category}
                              </Badge>
                              <Badge variant="outline">
                                {tour.steps.length} steps
                              </Badge>
                              <Badge variant="outline">
                                ~{tour.estimatedTime} min
                              </Badge>
                              {isCompleted && (
                                <Badge className="bg-green-600 text-white">
                                  Completed
                                </Badge>
                              )}
                            </div>

                            {progress > 0 && !isCompleted && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          className="w-full mt-4"
                          variant={isCompleted ? 'outline' : 'default'}
                        >
                          {isCompleted ? 'Replay Tour' : progress > 0 ? 'Continue Tour' : 'Start Tour'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
