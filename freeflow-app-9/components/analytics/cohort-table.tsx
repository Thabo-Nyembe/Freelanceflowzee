'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Cohort Data Types
 */
export interface CohortRow {
  cohortId: string
  cohortName: string
  cohortDate: string
  totalUsers: number
  periods: CohortPeriod[]
  metadata?: Record<string, any>
}

export interface CohortPeriod {
  periodIndex: number
  periodLabel: string
  value: number // Can be retention %, revenue, or custom metric
  userCount?: number
  change?: number // Change from previous period
}

export interface CohortData {
  id: string
  name: string
  description?: string
  type: 'retention' | 'revenue' | 'engagement' | 'custom'
  granularity: 'day' | 'week' | 'month'
  periods: string[] // Period labels
  cohorts: CohortRow[]
  averages: number[] // Average values per period
  totals?: {
    totalUsers: number
    avgRetention?: number
    avgRevenue?: number
  }
}

export interface CohortTableProps {
  data: CohortData
  variant?: 'heatmap' | 'table' | 'compact'
  showAverages?: boolean
  showTotals?: boolean
  colorScale?: 'green' | 'blue' | 'purple' | 'red'
  valueFormat?: 'percent' | 'currency' | 'number'
  currencySymbol?: string
  onCohortClick?: (cohort: CohortRow) => void
  onCellClick?: (cohort: CohortRow, period: CohortPeriod) => void
  onExport?: () => void
  className?: string
}

/**
 * Color scale configurations
 */
const colorScales = {
  green: {
    high: 'bg-green-500 text-white',
    medHigh: 'bg-green-400 text-white',
    medium: 'bg-green-300 text-green-900',
    medLow: 'bg-green-200 text-green-900',
    low: 'bg-green-100 text-green-900',
    empty: 'bg-muted text-muted-foreground'
  },
  blue: {
    high: 'bg-blue-500 text-white',
    medHigh: 'bg-blue-400 text-white',
    medium: 'bg-blue-300 text-blue-900',
    medLow: 'bg-blue-200 text-blue-900',
    low: 'bg-blue-100 text-blue-900',
    empty: 'bg-muted text-muted-foreground'
  },
  purple: {
    high: 'bg-purple-500 text-white',
    medHigh: 'bg-purple-400 text-white',
    medium: 'bg-purple-300 text-purple-900',
    medLow: 'bg-purple-200 text-purple-900',
    low: 'bg-purple-100 text-purple-900',
    empty: 'bg-muted text-muted-foreground'
  },
  red: {
    high: 'bg-red-500 text-white',
    medHigh: 'bg-red-400 text-white',
    medium: 'bg-red-300 text-red-900',
    medLow: 'bg-red-200 text-red-900',
    low: 'bg-red-100 text-red-900',
    empty: 'bg-muted text-muted-foreground'
  }
}

/**
 * Get color class based on value
 */
function getColorClass(value: number, maxValue: number, colorScale: keyof typeof colorScales): string {
  const scale = colorScales[colorScale]
  if (value === 0 || maxValue === 0) return scale.empty

  const ratio = value / maxValue
  if (ratio >= 0.8) return scale.high
  if (ratio >= 0.6) return scale.medHigh
  if (ratio >= 0.4) return scale.medium
  if (ratio >= 0.2) return scale.medLow
  return scale.low
}

/**
 * Cohort Table Component
 */
export function CohortTable({
  data,
  variant = 'heatmap',
  showAverages = true,
  showTotals = true,
  colorScale = 'green',
  valueFormat = 'percent',
  currencySymbol = '$',
  onCohortClick,
  onCellClick,
  onExport,
  className
}: CohortTableProps) {
  const [selectedGranularity, setSelectedGranularity] = useState(data.granularity)

  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    let max = 0
    data.cohorts.forEach(cohort => {
      cohort.periods.forEach(period => {
        if (period.value > max) max = period.value
      })
    })
    return max
  }, [data])

  // Format value based on type
  const formatValue = (value: number): string => {
    switch (valueFormat) {
      case 'percent':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `${currencySymbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      case 'number':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  // Format number shorthand
  const formatShortNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Render header
  const renderHeader = () => (
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            {data.type === 'retention' && <Users className="h-5 w-5" />}
            {data.type === 'revenue' && <DollarSign className="h-5 w-5" />}
            {data.name}
          </CardTitle>
          {data.description && (
            <CardDescription>{data.description}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedGranularity} onValueChange={(v) => setSelectedGranularity(v as string)}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          {onExport && (
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  )

  // Render totals row
  const renderTotals = () => {
    if (!showTotals || !data.totals) return null

    return (
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Users</p>
            <p className="text-lg font-bold">{formatShortNumber(data.totals.totalUsers)}</p>
          </div>
          {data.totals.avgRetention !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground uppercase">Avg Retention</p>
              <p className="text-lg font-bold">{data.totals.avgRetention.toFixed(1)}%</p>
            </div>
          )}
          {data.totals.avgRevenue !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground uppercase">Avg Revenue</p>
              <p className="text-lg font-bold">{currencySymbol}{data.totals.avgRevenue.toFixed(0)}</p>
            </div>
          )}
        </div>
        <Badge variant="outline">
          {data.cohorts.length} cohorts
        </Badge>
      </div>
    )
  }

  // Render compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        {renderHeader()}
        <CardContent>
          {renderTotals()}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Cohort</th>
                  <th className="text-right py-2 px-3 font-medium">Users</th>
                  {data.periods.slice(0, 6).map((period, i) => (
                    <th key={i} className="text-center py-2 px-3 font-medium min-w-[60px]">
                      {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cohorts.slice(0, 10).map((cohort) => (
                  <tr
                    key={cohort.cohortId}
                    className={cn(
                      'border-b hover:bg-muted/50',
                      onCohortClick && 'cursor-pointer'
                    )}
                    onClick={() => onCohortClick?.(cohort)}
                  >
                    <td className="py-2 px-3 font-medium">{cohort.cohortName}</td>
                    <td className="text-right py-2 px-3">{formatShortNumber(cohort.totalUsers)}</td>
                    {cohort.periods.slice(0, 6).map((period, i) => (
                      <td key={i} className="text-center py-2 px-3">
                        <span className={cn(
                          'inline-block px-2 py-0.5 rounded text-xs',
                          getColorClass(period.value, maxValue, colorScale)
                        )}>
                          {formatValue(period.value)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render table variant
  if (variant === 'table') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        {renderHeader()}
        <CardContent>
          {renderTotals()}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[140px]">
                    Cohort
                  </TableHead>
                  <TableHead className="text-center min-w-[80px]">Users</TableHead>
                  {data.periods.map((period, i) => (
                    <TableHead key={i} className="text-center min-w-[70px]">
                      {period}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.cohorts.map((cohort) => (
                  <TableRow
                    key={cohort.cohortId}
                    className={cn(onCohortClick && 'cursor-pointer')}
                    onClick={() => onCohortClick?.(cohort)}
                  >
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {cohort.cohortName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{formatShortNumber(cohort.totalUsers)}</Badge>
                    </TableCell>
                    {cohort.periods.map((period, i) => (
                      <TableCell key={i} className="text-center p-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  'w-full py-2 px-1 rounded text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1',
                                  getColorClass(period.value, maxValue, colorScale)
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCellClick?.(cohort, period)
                                }}
                              >
                                {formatValue(period.value)}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-semibold">{cohort.cohortName} - {period.periodLabel}</p>
                                <p>Value: {formatValue(period.value)}</p>
                                {period.userCount !== undefined && (
                                  <p>Users: {period.userCount.toLocaleString()}</p>
                                )}
                                {period.change !== undefined && (
                                  <p className={cn(
                                    'flex items-center gap-1',
                                    period.change >= 0 ? 'text-green-400' : 'text-red-400'
                                  )}>
                                    {period.change >= 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(period.change).toFixed(1)}% from prev
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Averages row */}
                {showAverages && (
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell className="sticky left-0 bg-muted/50">Average</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    {data.averages.map((avg, i) => (
                      <TableCell key={i} className="text-center">
                        <span className="text-xs font-bold">
                          {formatValue(avg)}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Heatmap variant (default)
  return (
    <Card className={cn('overflow-hidden', className)}>
      {renderHeader()}
      <CardContent>
        {renderTotals()}

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 mb-4">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            {['low', 'medLow', 'medium', 'medHigh', 'high'].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-6 h-4 rounded',
                  colorScales[colorScale][level as keyof typeof colorScales.green]
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header */}
            <div className="flex gap-1 mb-1">
              <div className="w-32 shrink-0" />
              <div className="w-16 shrink-0 text-center text-xs font-medium text-muted-foreground">
                Users
              </div>
              {data.periods.map((period, i) => (
                <div
                  key={i}
                  className="w-14 shrink-0 text-center text-xs font-medium text-muted-foreground"
                >
                  {period}
                </div>
              ))}
            </div>

            {/* Rows */}
            {data.cohorts.map((cohort) => (
              <div
                key={cohort.cohortId}
                className={cn(
                  'flex gap-1 mb-1',
                  onCohortClick && 'cursor-pointer hover:opacity-80'
                )}
                onClick={() => onCohortClick?.(cohort)}
              >
                <div className="w-32 shrink-0 text-sm font-medium truncate py-2 px-1">
                  {cohort.cohortName}
                </div>
                <div className="w-16 shrink-0 flex items-center justify-center">
                  <Badge variant="outline" className="text-xs">
                    {formatShortNumber(cohort.totalUsers)}
                  </Badge>
                </div>
                {cohort.periods.map((period, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'w-14 h-10 shrink-0 rounded text-xs font-medium flex items-center justify-center transition-all hover:ring-2 hover:ring-offset-1',
                            getColorClass(period.value, maxValue, colorScale)
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onCellClick?.(cohort, period)
                          }}
                        >
                          {formatValue(period.value)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="space-y-1">
                          <p className="font-semibold">{cohort.cohortName}</p>
                          <p>{period.periodLabel}: {formatValue(period.value)}</p>
                          {period.userCount !== undefined && (
                            <p>{period.userCount.toLocaleString()} users</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}

            {/* Averages row */}
            {showAverages && (
              <div className="flex gap-1 pt-2 border-t mt-2">
                <div className="w-32 shrink-0 text-sm font-bold py-2 px-1">
                  Average
                </div>
                <div className="w-16 shrink-0" />
                {data.averages.map((avg, i) => (
                  <div
                    key={i}
                    className="w-14 h-10 shrink-0 flex items-center justify-center text-xs font-bold"
                  >
                    {formatValue(avg)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Simple retention display
 */
export interface SimpleRetentionProps {
  data: Array<{ period: string; retention: number }>
  className?: string
}

export function SimpleRetention({ data, className }: SimpleRetentionProps) {
  return (
    <div className={cn('flex items-end gap-2 h-24', className)}>
      {data.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                  style={{ height: `${item.retention}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{item.period}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.period}: {item.retention.toFixed(1)}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}
