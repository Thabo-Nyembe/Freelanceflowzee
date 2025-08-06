'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  actions?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  breadcrumbs,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 pb-6 border-b kazi-border ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 kazi-caption">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 kazi-text-muted">/</span>
                )}
                {crumb.href ? (
                  <a 
                    href={crumb.href}
                    className="hover:kazi-text-secondary transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="kazi-text-secondary font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg kazi-bg-tertiary">
                <Icon className="h-6 w-6 kazi-text-secondary" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <h1 className="text-3xl kazi-headline kazi-responsive-headline">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'secondary'}>
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>
          {description && (
            <p className="kazi-body max-w-2xl kazi-responsive-text">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 kazi-animate-fade-in">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: LucideIcon
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  className = ''
}: StatsCardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'kazi-text-tertiary'
  }

  return (
    <div className={`kazi-card p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="kazi-caption font-medium">{title}</p>
          <p className="text-2xl font-bold kazi-text-primary">{value}</p>
          {change && (
            <p className={`text-sm ${trendColors[change.trend]}`}>
              {change.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-full kazi-bg-tertiary">
            <Icon className="h-6 w-6 kazi-text-secondary" />
          </div>
        )}
      </div>
    </div>
  )
}