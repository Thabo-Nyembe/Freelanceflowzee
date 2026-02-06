/**
 * Memoized Presentational Components
 *
 * These components are wrapped with React.memo to prevent unnecessary re-renders.
 * They are pure components that only re-render when their props change.
 *
 * PERFORMANCE BENEFITS:
 * - Prevents re-renders when parent state changes
 * - Optimizes list rendering
 * - Reduces CPU usage for complex UIs
 */

'use client'

import React, { memo } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  memoizedCurrencyFormatter,
  memoizedPercentFormatter,
} from '@/lib/performance-utils'
import type { LucideIcon } from 'lucide-react'

// ==================== STAT CARD ====================

interface StatCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percent'
  icon?: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'stable'
  description?: string
  className?: string
}

export const MemoizedStatCard = memo<StatCardProps>(function StatCard({
  title,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  description,
  className,
}) {
  const formattedValue = format === 'currency'
    ? memoizedCurrencyFormatter(value)
    : format === 'percent'
      ? `${value}%`
      : value.toLocaleString()

  const changePercent = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formattedValue}</p>
            {previousValue !== undefined && (
              <p className={cn(
                'text-sm',
                changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {memoizedPercentFormatter(changePercent)} from last period
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={cn('p-3 rounded-lg bg-muted/50', iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

// ==================== PROJECT CARD ====================

interface ProjectCardProps {
  id: string | number
  name: string
  client: string
  status: string
  priority: string
  progress: number
  value?: number
  onView?: (id: string | number) => void
  onMessage?: (id: string | number) => void
  className?: string
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

export const MemoizedProjectCard = memo<ProjectCardProps>(function ProjectCard({
  id,
  name,
  client,
  status,
  priority,
  progress,
  value,
  onView,
  onMessage,
  className,
}) {
  return (
    <div className={cn(
      'p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{name}</h4>
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
          <div className={cn('w-2 h-2 rounded-full', getPriorityColor(priority))} />
        </div>
        {value !== undefined && (
          <span className="font-medium text-green-600 dark:text-green-400">
            {memoizedCurrencyFormatter(value)}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Client: {client}</p>
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex gap-2">
          {onView && (
            <Button size="sm" variant="outline" onClick={() => onView(id)}>
              View
            </Button>
          )}
          {onMessage && (
            <Button size="sm" variant="ghost" onClick={() => onMessage(id)}>
              Message
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})

// ==================== ACTIVITY ITEM ====================

interface ActivityItemProps {
  id: string | number
  type: 'project' | 'task' | 'file' | 'system' | 'action' | 'error' | 'collaboration'
  message: string
  time: string
  status?: 'success' | 'info' | 'warning' | 'error'
  className?: string
}

export const MemoizedActivityItem = memo<ActivityItemProps>(function ActivityItem({
  id,
  type,
  message,
  time,
  status = 'success',
  className,
}) {
  const typeColors = {
    project: 'bg-blue-100 dark:bg-blue-900/30',
    task: 'bg-green-100 dark:bg-green-900/30',
    file: 'bg-purple-100 dark:bg-purple-900/30',
    system: 'bg-gray-100 dark:bg-gray-900/30',
    action: 'bg-yellow-100 dark:bg-yellow-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
    collaboration: 'bg-indigo-100 dark:bg-indigo-900/30',
  }

  const statusColors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors border border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className={cn('p-2 rounded-lg flex-shrink-0', typeColors[type] || typeColors.system)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{time}</p>
      </div>
      <Badge className={cn('flex-shrink-0', statusColors[status])}>
        {status}
      </Badge>
    </div>
  )
})

// ==================== INSIGHT CARD ====================

interface InsightCardProps {
  id: string | number
  title: string
  description: string
  action?: string
  type?: 'revenue' | 'productivity' | 'client' | 'warning' | 'opportunity'
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actedUpon?: boolean
  onAct?: (id: string | number) => void
  className?: string
}

export const MemoizedInsightCard = memo<InsightCardProps>(function InsightCard({
  id,
  title,
  description,
  action,
  impact,
  confidence,
  actedUpon = false,
  onAct,
  className,
}) {
  const impactColors = {
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white',
  }

  return (
    <div className={cn(
      'p-4 rounded-lg border-2 transition-all',
      actedUpon
        ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
        : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-700 hover:shadow-md',
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
            <Badge variant="default" className={impactColors[impact]}>
              {impact} impact
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>
          {action && (
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {action}
            </p>
          )}
        </div>
        <div className="ml-4 text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Confidence: {confidence}%
          </div>
          {!actedUpon && onAct ? (
            <Button
              size="sm"
              onClick={() => onAct(id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Act on This
            </Button>
          ) : actedUpon ? (
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Acted Upon
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
})

// ==================== METRIC CARD ====================

interface MetricCardProps {
  name: string
  value: number
  previousValue?: number
  changePercent?: number
  category: string
  type: 'count' | 'currency' | 'percentage' | 'duration'
  status?: 'up' | 'down' | 'stable'
  alertThreshold?: number
  isAlertTriggered?: boolean
  className?: string
}

export const MemoizedMetricCard = memo<MetricCardProps>(function MetricCard({
  name,
  value,
  previousValue,
  changePercent,
  category,
  type,
  status,
  alertThreshold,
  isAlertTriggered,
  className,
}) {
  const formatValue = (val: number, t: string) => {
    switch (t) {
      case 'currency': return memoizedCurrencyFormatter(val)
      case 'percentage': return `${val}%`
      case 'duration': return `${Math.floor(val / 60)}m ${val % 60}s`
      default: return val.toLocaleString()
    }
  }

  return (
    <Card className={cn(
      isAlertTriggered && 'border-red-500 border-2',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{category}</Badge>
          {status && (
            <span className={cn(
              'text-sm font-medium',
              status === 'up' && 'text-green-600',
              status === 'down' && 'text-red-600',
              status === 'stable' && 'text-gray-600'
            )}>
              {status === 'up' ? '↑' : status === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        <h4 className="text-sm font-medium text-muted-foreground">{name}</h4>
        <p className="text-2xl font-bold">{formatValue(value, type)}</p>
        {changePercent !== undefined && (
          <p className={cn(
            'text-sm',
            changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {memoizedPercentFormatter(changePercent)}
          </p>
        )}
        {alertThreshold !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            Threshold: {formatValue(alertThreshold, type)}
          </p>
        )}
      </CardContent>
    </Card>
  )
})

// ==================== FEATURE CARD ====================

interface FeatureCardProps {
  name: string
  path: string
  icon: LucideIcon
  description: string
  onClick?: (path: string) => void
  className?: string
}

export const MemoizedFeatureCard = memo<FeatureCardProps>(function FeatureCard({
  name,
  path,
  icon: Icon,
  description,
  onClick,
  className,
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-lg transition-all duration-200',
        className
      )}
      onClick={() => onClick?.(path)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-semibold">{name}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
})

// ==================== QUICK ACTION BUTTON ====================

interface QuickActionButtonProps {
  label: string
  icon: LucideIcon
  onClick?: () => void
  isNew?: boolean
  glowColor?: string
  className?: string
}

export const MemoizedQuickActionButton = memo<QuickActionButtonProps>(function QuickActionButton({
  label,
  icon: Icon,
  onClick,
  isNew = false,
  className,
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        'h-auto p-4 flex-col gap-2 w-full hover:shadow-xl relative',
        className
      )}
      onClick={onClick}
    >
      {isNew && (
        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 animate-pulse">
          NEW
        </Badge>
      )}
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Button>
  )
})
