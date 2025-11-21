/**
 * Empty State Components
 * Helpful UI when no data is available
 */

import Link from 'next/link'
import { LiquidGlassCard } from './liquid-glass-card'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
      <LiquidGlassCard>
        <div className="p-12 max-w-md text-center space-y-6">
          <div className="text-7xl">{icon}</div>
          <div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                {action.label}
              </button>
            )
          )}
        </div>
      </LiquidGlassCard>
    </div>
  )
}

// Predefined Empty States
export function NoDataEmptyState({ entityName = 'items' }: { entityName?: string }) {
  return (
    <EmptyState
      icon="📭"
      title={`No ${entityName} yet`}
      description={`You haven't created any ${entityName} yet. Get started by creating your first one!`}
    />
  )
}

export function NoResultsEmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={
        searchQuery
          ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search.`
          : "No results match your filters. Try adjusting your criteria."
      }
    />
  )
}

export function NoAccessEmptyState() {
  return (
    <EmptyState
      icon="🔒"
      title="Access Denied"
      description="You don't have permission to view this content. Contact your administrator if you believe this is an error."
      action={{
        label: 'Go Back',
        onClick: () => window.history.back()
      }}
    />
  )
}

export function OfflineEmptyState() {
  return (
    <EmptyState
      icon="📡"
      title="You're Offline"
      description="It looks like you've lost your internet connection. Some features may not be available."
      action={{
        label: 'Retry',
        onClick: () => window.location.reload()
      }}
    />
  )
}

export function ErrorEmptyState({ error }: { error?: string }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Something went wrong"
      description={error || "We encountered an error loading this content. Please try again."}
      action={{
        label: 'Retry',
        onClick: () => window.location.reload()
      }}
    />
  )
}

export function MaintenanceEmptyState() {
  return (
    <EmptyState
      icon="🔧"
      title="Under Maintenance"
      description="This feature is currently undergoing maintenance. We'll be back shortly!"
    />
  )
}

export function ComingSoonEmptyState({ featureName }: { featureName: string }) {
  return (
    <EmptyState
      icon="🚀"
      title="Coming Soon"
      description={`${featureName} is coming soon! We're working hard to bring you this feature.`}
      action={{
        label: 'View Roadmap',
        href: '/dashboard/coming-soon'
      }}
    />
  )
}

export function SuccessEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <EmptyState
      icon="✅"
      title={title}
      description={description}
    />
  )
}

// Small inline empty states
export function InlineEmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
