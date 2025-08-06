'use client'

import { LucideIcon } from 'lucide-react'
import { 
  Lightbulb, 
  Search, 
  Plus, 
  Rocket, 
  Construction, 
  Clock,
  Archive,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({ 
  icon: Icon = Archive, 
  title, 
  description, 
  action, 
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-16'
  }

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`text-center ${sizeClasses[size]} ${className}`}>
      <div className="flex flex-col items-center space-y-4 kazi-animate-fade-in">
        <div className="p-4 rounded-full kazi-bg-tertiary">
          <Icon className={`${iconSizes[size]} kazi-text-tertiary`} />
        </div>
        <div className="space-y-2">
          <h3 className={`${titleSizes[size]} kazi-title`}>
            {title}
          </h3>
          <p className="kazi-body max-w-md mx-auto">
            {description}
          </p>
        </div>
        {action && (
          <Button 
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="kazi-animate-slide-up"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Specialized Empty State Components
export function NoResultsState({ 
  searchTerm, 
  onClear, 
  className = '',
  suggestions = []
}: {
  searchTerm?: string
  onClear?: () => void
  className?: string
  suggestions?: string[]
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        searchTerm 
          ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`
          : "No items match your current filters."
      }
      action={onClear ? {
        label: "Clear search",
        onClick: onClear,
        variant: 'outline'
      } : undefined}
      className={className}
    />
  )
}

export function ComingSoonState({ 
  featureName, 
  description,
  className = '',
  onNotify,
  estimatedDate
}: {
  featureName: string
  description?: string
  className?: string
  onNotify?: () => void
  estimatedDate?: string
}) {
  return (
    <Card className={`kazi-card ${className}`}>
      <CardContent className="pt-6">
        <EmptyState
          icon={Construction}
          title={`${featureName} Coming Soon`}
          description={
            description || 
            `We're working hard to bring you ${featureName.toLowerCase()}. Stay tuned for updates!`
          }
          action={onNotify ? {
            label: "Notify me when ready",
            onClick: onNotify,
            variant: 'outline'
          } : undefined}
          size="md"
        />
        {estimatedDate && (
          <div className="mt-4 flex items-center justify-center gap-2 kazi-caption">
            <Clock className="h-4 w-4" />
            <span>Expected: {estimatedDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function LoadingState({ 
  title = "Loading...",
  description = "Please wait while we fetch your data.",
  className = ''
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-700 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl kazi-title">{title}</h3>
          <p className="kazi-body">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error while loading your data.",
  onRetry,
  className = ''
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={onRetry ? {
        label: "Try again",
        onClick: onRetry,
        variant: 'outline'
      } : undefined}
      className={className}
    />
  )
}

export function SuccessState({ 
  title,
  description,
  onContinue,
  className = ''
}: {
  title: string
  description: string
  onContinue?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={CheckCircle}
      title={title}
      description={description}
      action={onContinue ? {
        label: "Continue",
        onClick: onContinue
      } : undefined}
      className={className}
    />
  )
}

export function FirstTimeState({ 
  title,
  description,
  actionLabel = "Get started",
  onAction,
  className = ''
}: {
  title: string
  description: string
  actionLabel?: string
  onAction: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={Rocket}
      title={title}
      description={description}
      action={{
        label: actionLabel,
        onClick: onAction
      }}
      className={className}
      size="lg"
    />
  )
}