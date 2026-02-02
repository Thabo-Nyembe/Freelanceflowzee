'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  PanelRightOpen,
  PanelRightClose,
  Lightbulb,
  X
} from 'lucide-react'

interface CollapsibleInsightsPanelProps {
  children: React.ReactNode
  defaultOpen?: boolean
  title?: string
  className?: string
  position?: 'inline' | 'sidebar'
  onOpenChange?: (open: boolean) => void
}

/**
 * CollapsibleInsightsPanel - Wraps AI insights, collaborators, predictions,
 * and activity panels with a toggle button for cascade behavior.
 *
 * Usage:
 * <CollapsibleInsightsPanel title="AI Insights" position="inline">
 *   <AIInsightsPanel insights={insights} />
 *   <CollaborationIndicator collaborators={collaborators} />
 *   <PredictiveAnalytics predictions={predictions} />
 *   <ActivityFeed activities={activities} />
 * </CollapsibleInsightsPanel>
 */
export function CollapsibleInsightsPanel({
  children,
  defaultOpen = false,
  title = 'Insights & Analytics',
  className,
  position = 'inline',
  onOpenChange
}: CollapsibleInsightsPanelProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  if (position === 'sidebar') {
    return (
      <div className={cn('relative', className)}>
        {/* Toggle Button - Fixed at top right */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenChange(!isOpen)}
          className={cn(
            'fixed top-20 z-50 transition-all duration-300 shadow-lg',
            isOpen ? 'right-[340px]' : 'right-4'
          )}
        >
          {isOpen ? (
            <>
              <PanelRightClose className="h-4 w-4 mr-2" />
              Hide Insights
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Show Insights
            </>
          )}
        </Button>

        {/* Sidebar Panel */}
        <div
          className={cn(
            'fixed top-0 right-0 h-full w-[320px] bg-background border-l border-border shadow-xl z-40',
            'transition-transform duration-300 ease-in-out overflow-y-auto',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="sticky top-0 bg-background z-10 p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{title}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // Inline collapsible panel
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn('w-full', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {title}
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-4 transition-all data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * InsightsToggleButton - A standalone button to toggle insights panel visibility
 * Can be placed in a toolbar or header
 */
interface InsightsToggleButtonProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function InsightsToggleButton({
  isOpen,
  onToggle,
  className
}: InsightsToggleButtonProps) {
  return (
    <Button
      variant={isOpen ? 'secondary' : 'outline'}
      size="sm"
      onClick={onToggle}
      className={cn('gap-2', className)}
    >
      <Lightbulb className={cn('h-4 w-4', isOpen && 'text-yellow-500')} />
      {isOpen ? 'Hide Insights' : 'AI Insights'}
    </Button>
  )
}

/**
 * useInsightsPanel - Hook for managing insights panel state
 */
export function useInsightsPanel(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const open = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    toggle,
    open,
    close,
    setIsOpen
  }
}

export default CollapsibleInsightsPanel
