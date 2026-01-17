'use client'

/**
 * World-Class Line Chart Component
 *
 * Features:
 * - Recharts LineChart wrapper with consistent styling
 * - Dark/light theme support via next-themes
 * - Loading and empty states
 * - Configurable axes, tooltips, and legends
 * - Multiple line types (monotone, linear, step, etc.)
 * - Dot customization
 * - Responsive design
 *
 * Based on Recharts (MIT License)
 * Docs: https://recharts.org/en-US/api/LineChart
 */

import * as React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface LineChartDataPoint {
  [key: string]: string | number
}

export interface LineConfig {
  dataKey: string
  name?: string
  color?: string
  strokeWidth?: number
  type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter' | 'basis' | 'basisOpen' | 'basisClosed' | 'bundle' | 'natural'
  strokeDasharray?: string
  dot?: boolean | object
  activeDot?: boolean | object
  hide?: boolean
}

export interface ReferenceLineConfig {
  y?: number
  x?: string | number
  label?: string
  stroke?: string
  strokeDasharray?: string
}

export interface WorldClassLineChartProps {
  /** Chart data array */
  data: LineChartDataPoint[]
  /** Configuration for each line */
  lines: LineConfig[]
  /** X-axis data key */
  xAxisKey: string
  /** Chart title (optional) */
  title?: string
  /** Chart height in pixels */
  height?: number
  /** Show loading state */
  isLoading?: boolean
  /** Show grid lines */
  showGrid?: boolean
  /** Show X axis */
  showXAxis?: boolean
  /** Show Y axis */
  showYAxis?: boolean
  /** Show tooltip */
  showTooltip?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Reference lines to display */
  referenceLines?: ReferenceLineConfig[]
  /** Custom tooltip formatter */
  tooltipFormatter?: (value: number, name: string) => [string, string]
  /** Custom X axis tick formatter */
  xAxisFormatter?: (value: string | number) => string
  /** Custom Y axis tick formatter */
  yAxisFormatter?: (value: number) => string
  /** Y axis domain - [min, max] or 'auto' */
  yAxisDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']
  /** Additional class names */
  className?: string
  /** Empty state message */
  emptyMessage?: string
  /** Connect null values in the line */
  connectNulls?: boolean
}

// ============================================================================
// Theme Colors
// ============================================================================

const defaultColors = {
  light: [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
  ],
  dark: [
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#fbbf24', // amber-400
    '#f87171', // red-400
    '#a78bfa', // violet-400
    '#f472b6', // pink-400
    '#22d3ee', // cyan-400
    '#a3e635', // lime-400
  ],
}

const getThemeColors = (theme: string | undefined) => {
  return theme === 'dark' ? defaultColors.dark : defaultColors.light
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center bg-muted/20 rounded-lg animate-pulse"
      style={{ height }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ message, height }: { message: string; height: number }) {
  return (
    <div
      className="flex items-center justify-center bg-muted/10 rounded-lg border border-dashed border-muted-foreground/30"
      style={{ height }}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    color: string
    dataKey: string
  }>
  label?: string
  formatter?: (value: number, name: string) => [string, string]
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const [formattedValue, formattedName] = formatter
            ? formatter(entry.value, entry.name)
            : [entry.value?.toLocaleString() ?? '0', entry.name]

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{formattedName}:</span>
              <span className="font-medium text-foreground">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WorldClassLineChart({
  data,
  lines,
  xAxisKey,
  title,
  height = 300,
  isLoading = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showLegend = true,
  referenceLines = [],
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
  yAxisDomain,
  className,
  emptyMessage = 'No data available',
  connectNulls = false,
}: WorldClassLineChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading skeleton during SSR or when loading
  if (!mounted || isLoading) {
    return (
      <div className={cn('w-full', className)}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <ChartSkeleton height={height} />
      </div>
    )
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <EmptyState message={emptyMessage} height={height} />
      </div>
    )
  }

  const themeColors = getThemeColors(resolvedTheme)
  const gridColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'
  const textColor = resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280'

  return (
    <div className={cn('w-full', className)}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
          )}

          {showXAxis && (
            <XAxis
              dataKey={xAxisKey}
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tickFormatter={xAxisFormatter}
            />
          )}

          {showYAxis && (
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisFormatter}
              domain={yAxisDomain}
            />
          )}

          {showTooltip && (
            <Tooltip
              content={<CustomTooltip formatter={tooltipFormatter} />}
              cursor={{ stroke: gridColor, strokeDasharray: '3 3' }}
            />
          )}

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="line"
              iconSize={12}
            />
          )}

          {/* Reference Lines */}
          {referenceLines.map((refLine, index) => (
            <ReferenceLine
              key={index}
              y={refLine.y}
              x={refLine.x}
              label={refLine.label}
              stroke={refLine.stroke || (resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af')}
              strokeDasharray={refLine.strokeDasharray || '3 3'}
            />
          ))}

          {lines.map((line, index) => {
            if (line.hide) return null

            const color = line.color || themeColors[index % themeColors.length]

            return (
              <Line
                key={line.dataKey}
                type={line.type || 'monotone'}
                dataKey={line.dataKey}
                name={line.name || line.dataKey}
                stroke={color}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
                dot={
                  line.dot === false
                    ? false
                    : line.dot === true || line.dot === undefined
                    ? { fill: color, strokeWidth: 2, r: 4 }
                    : line.dot
                }
                activeDot={
                  line.activeDot === false
                    ? false
                    : line.activeDot === true || line.activeDot === undefined
                    ? { fill: color, strokeWidth: 2, r: 6 }
                    : line.activeDot
                }
                connectNulls={connectNulls}
              />
            )
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WorldClassLineChart
