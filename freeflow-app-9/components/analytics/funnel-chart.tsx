'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  ArrowDown,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Users,
  Percent,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Funnel Step Data
 */
export interface FunnelStep {
  id: string
  name: string
  count: number
  conversionRate?: number // Percentage from previous step
  absoluteRate?: number // Percentage from first step
  avgTime?: number // Average time to this step (seconds)
  dropoffCount?: number // Users who dropped off at this step
  metadata?: Record<string, any>
}

/**
 * Funnel Data
 */
export interface FunnelData {
  id: string
  name: string
  description?: string
  steps: FunnelStep[]
  totalEntries: number
  totalConversions: number
  overallConversionRate: number
  avgCompletionTime?: number
  trend?: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
  }
}

/**
 * Component Props
 */
export interface FunnelChartProps {
  data: FunnelData
  variant?: 'horizontal' | 'vertical' | 'pyramid'
  showDropoff?: boolean
  showTiming?: boolean
  showTrend?: boolean
  animated?: boolean
  colorScheme?: 'blue' | 'green' | 'purple' | 'gradient'
  onStepClick?: (step: FunnelStep) => void
  className?: string
}

/**
 * Color schemes
 */
const colorSchemes = {
  blue: {
    primary: 'bg-blue-500',
    secondary: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    primary: 'bg-green-500',
    secondary: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  purple: {
    primary: 'bg-purple-500',
    secondary: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  gradient: {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
    secondary: 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  }
}

/**
 * Funnel Chart Component
 */
export function FunnelChart({
  data,
  variant = 'horizontal',
  showDropoff = true,
  showTiming = false,
  showTrend = true,
  animated = true,
  colorScheme = 'blue',
  onStepClick,
  className
}: FunnelChartProps) {
  const colors = colorSchemes[colorScheme]

  // Calculate step widths for visualization
  const maxCount = useMemo(() => Math.max(...data.steps.map(s => s.count)), [data.steps])

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    return `${(seconds / 3600).toFixed(1)}h`
  }

  if (variant === 'pyramid') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{data.name}</CardTitle>
              {data.description && (
                <CardDescription>{data.description}</CardDescription>
              )}
            </div>
            {showTrend && data.trend && (
              <Badge
                variant={data.trend.direction === 'up' ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                {data.trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {data.trend.percentage}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-1">
            {data.steps.map((step, index) => {
              const widthPercent = (step.count / maxCount) * 100
              const isLast = index === data.steps.length - 1

              return (
                <TooltipProvider key={step.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStepClick?.(step)}
                        className={cn(
                          'relative flex items-center justify-center py-3 transition-all rounded-sm',
                          colors.primary,
                          'text-white font-medium text-sm',
                          animated && 'hover:scale-105',
                          onStepClick && 'cursor-pointer'
                        )}
                        style={{ width: `${Math.max(widthPercent, 20)}%` }}
                      >
                        <span className="truncate px-2">{step.name}</span>
                        <span className="ml-2 opacity-80">{formatNumber(step.count)}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="space-y-1">
                        <p className="font-semibold">{step.name}</p>
                        <p>Users: {step.count.toLocaleString()}</p>
                        {step.conversionRate !== undefined && (
                          <p>Step Conversion: {step.conversionRate.toFixed(1)}%</p>
                        )}
                        {step.absoluteRate !== undefined && (
                          <p>Overall: {step.absoluteRate.toFixed(1)}%</p>
                        )}
                        {showTiming && step.avgTime !== undefined && (
                          <p>Avg Time: {formatTime(step.avgTime)}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {/* Overall stats */}
          <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-xl font-bold">{formatNumber(data.totalEntries)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-xl font-bold">{formatNumber(data.totalConversions)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-xl font-bold">{data.overallConversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'vertical') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{data.name}</CardTitle>
              {data.description && (
                <CardDescription>{data.description}</CardDescription>
              )}
            </div>
            {showTrend && data.trend && (
              <Badge
                variant={data.trend.direction === 'up' ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                {data.trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {data.trend.percentage}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.steps.map((step, index) => {
              const widthPercent = (step.count / maxCount) * 100
              const isLast = index === data.steps.length - 1
              const dropoff = step.dropoffCount || 0

              return (
                <div key={step.id} className="space-y-2">
                  <div
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      colors.border,
                      animated && 'hover:shadow-md'
                    )}
                    onClick={() => onStepClick?.(step)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white', colors.primary)}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{formatNumber(step.count)}</span>
                      </div>
                    </div>

                    <Progress
                      value={widthPercent}
                      className={cn('h-3', colors.secondary)}
                    />

                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {step.conversionRate !== undefined && (
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {step.conversionRate.toFixed(1)}%
                          </span>
                        )}
                        {showTiming && step.avgTime !== undefined && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(step.avgTime)}
                          </span>
                        )}
                      </div>
                      {step.absoluteRate !== undefined && (
                        <span>{step.absoluteRate.toFixed(1)}% of total</span>
                      )}
                    </div>
                  </div>

                  {/* Dropoff indicator */}
                  {showDropoff && !isLast && dropoff > 0 && (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formatNumber(dropoff)} dropped off
                        {step.conversionRate !== undefined && (
                          <span className="text-muted-foreground">
                            ({(100 - step.conversionRate).toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Entries</p>
                <p className="text-lg font-bold">{formatNumber(data.totalEntries)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Completed</p>
                <p className="text-lg font-bold">{formatNumber(data.totalConversions)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Rate</p>
                <p className="text-lg font-bold">{data.overallConversionRate.toFixed(1)}%</p>
              </div>
              {data.avgCompletionTime && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Avg Time</p>
                  <p className="text-lg font-bold">{formatTime(data.avgCompletionTime)}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Horizontal (default)
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{data.name}</CardTitle>
            {data.description && (
              <CardDescription>{data.description}</CardDescription>
            )}
          </div>
          {showTrend && data.trend && (
            <Badge
              variant={data.trend.direction === 'up' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {data.trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {data.trend.percentage}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
          {data.steps.map((step, index) => {
            const heightPercent = (step.count / maxCount) * 100
            const isLast = index === data.steps.length - 1
            const dropoff = step.dropoffCount || 0

            return (
              <React.Fragment key={step.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStepClick?.(step)}
                        className={cn(
                          'flex-1 min-w-[120px] p-3 rounded-lg border transition-all flex flex-col',
                          colors.border,
                          animated && 'hover:shadow-md hover:scale-[1.02]',
                          onStepClick && 'cursor-pointer'
                        )}
                      >
                        <div className="flex-1 flex flex-col justify-end mb-3">
                          <div
                            className={cn('w-full rounded-t transition-all', colors.primary)}
                            style={{
                              height: `${Math.max(heightPercent, 10)}%`,
                              minHeight: '20px',
                              maxHeight: '80px'
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm truncate">{step.name}</p>
                          <p className="text-lg font-bold">{formatNumber(step.count)}</p>
                          {step.conversionRate !== undefined && index > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {step.conversionRate.toFixed(1)}% from prev
                            </p>
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{step.name}</p>
                        <p>Users: {step.count.toLocaleString()}</p>
                        {step.conversionRate !== undefined && (
                          <p>Step Conversion: {step.conversionRate.toFixed(1)}%</p>
                        )}
                        {step.absoluteRate !== undefined && (
                          <p>From Start: {step.absoluteRate.toFixed(1)}%</p>
                        )}
                        {showDropoff && dropoff > 0 && (
                          <p className="text-red-400">Dropoff: {dropoff.toLocaleString()}</p>
                        )}
                        {showTiming && step.avgTime !== undefined && (
                          <p>Avg Time: {formatTime(step.avgTime)}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Arrow connector */}
                {!isLast && (
                  <div className="flex items-center justify-center w-8">
                    <div className="flex flex-col items-center">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      {showDropoff && dropoff > 0 && (
                        <span className="text-[10px] text-red-500 whitespace-nowrap">
                          -{formatNumber(dropoff)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Summary bar */}
        <div className="mt-6 flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatNumber(data.totalEntries)} entered</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', colors.text)}>
                {formatNumber(data.totalConversions)} completed
              </span>
            </div>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            {data.overallConversionRate.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Simple Funnel Display
 */
export interface SimpleFunnelProps {
  steps: Array<{ name: string; value: number }>
  className?: string
}

export function SimpleFunnel({ steps, className }: SimpleFunnelProps) {
  const maxValue = Math.max(...steps.map(s => s.value))

  return (
    <div className={cn('space-y-2', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="w-24 text-sm text-muted-foreground truncate">
            {step.name}
          </span>
          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(step.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="w-16 text-sm font-medium text-right">
            {step.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
