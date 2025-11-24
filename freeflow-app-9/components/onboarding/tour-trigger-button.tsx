/**
 * Tour Trigger Button Component
 *
 * Provides a reusable button to start specific onboarding tours
 * Can be placed on any page to guide users through features
 */

'use client'

import { Button } from '@/components/ui/button'
import { BookOpen, Play } from 'lucide-react'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('TourTrigger')

interface TourTriggerButtonProps {
  tourId: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
}

/**
 * Button to trigger an onboarding tour
 *
 * Emits a custom event that the TourManager listens for
 *
 * @example
 * <TourTriggerButton
 *   tourId="video-studio-complete"
 *   label="Start Video Studio Tour"
 * />
 */
export function TourTriggerButton({
  tourId,
  label = 'Start Tour',
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true
}: TourTriggerButtonProps) {
  const handleStartTour = () => {
    logger.info('Tour triggered manually', { tourId })

    // Emit custom event for TourManager to pick up
    const event = new CustomEvent('start-tour', {
      detail: { tourId }
    })
    window.dispatchEvent(event)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartTour}
      className={className}
    >
      {showIcon && <Play className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  )
}

/**
 * Floating "Help" button that opens tour selection
 * Typically placed in a corner of the page
 */
export function TourHelpButton() {
  const handleOpenTours = () => {
    logger.info('Tour help button clicked')

    // Emit event to open tour selection dialog
    const event = new CustomEvent('open-tour-selection')
    window.dispatchEvent(event)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleOpenTours}
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-white dark:bg-gray-900 border-2 border-blue-500 hover:border-blue-600"
      title="View guided tours"
    >
      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </Button>
  )
}
