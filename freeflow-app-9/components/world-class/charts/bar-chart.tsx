'use client'

/**
 * World-Class Bar Chart Component
 *
 * Features:
 * - Recharts BarChart wrapper with consistent styling
 * - Dark/light theme support via next-themes
 * - Loading and empty states
 * - Configurable axes, tooltips, and legends
 * - Stacked and grouped bar support
 * - Horizontal and vertical orientations
 * - Responsive design
 *
 * Based on Recharts (MIT License)
 * Docs: https://recharts.org/en-US/api/BarChart
 */

import * as React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface BarChartDataPoint {
  [key: string]: string | number
}

export interface BarConfig {
  dataKey: string
  name?: string
  color?: string
  radius?: number | [number, number, number, number]
  stackId?: string
  hide?: boolean
}

export interface WorldClassBarChartProps {
  /** Chart data array */
  data: BarChartDataPoint[]
  /** Configuration for each bar */
  bars: BarConfig[]
  /** X-axis data key */
  xAxisKey: string
  /** Chart title (optional) */
  title?: string
  /** Chart height in pixels */
  height?: number
  /** Show loading state */
  isLoading?: boolean
  /** Chart layout (vertical = standard, horizontal = rotated) */
  layout?: 'vertical' | 'horizontal'
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
  /** Bar gap in pixels */
  barGap?: number
  /** Category gap as percentage */
  categoryGap?: string
  /** Bar size (width/height) */
  barSize?: number
  /** Custom tooltip formatter */
  tooltipFormatter?: (value: number, name: string) => [string, string]
  /** Custom X axis tick formatter */
  xAxisFormatter?: (value: string | number) => string
  /** Custom Y axis tick formatter */
  yAxisFormatter?: (value: number) => string
  /** Additional class names */
  className?: string
  /** Empty state message */
  emptyMessage?: string
  /** Enable color per data point (for single bar charts) */
  colorByDataPoint?: boolean
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
                className="w-3 h-3 rounded-sm"
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

export function WorldClassBarChart({
  data,
  bars,
  xAxisKey,
  title,
  height = 300,
  isLoading = false,
  layout = 'horizontal',
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showTooltip = true,
  showLegend = true,
  barGap = 4,
  categoryGap = '20%',
  barSize,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
  className,
  emptyMessage = 'No data available',
  colorByDataPoint = false,
}: WorldClassBarChartProps) {
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

  // Swap axes for vertical layout (horizontal bars)
  const isVertical = layout === 'vertical'

  return (
    <div className={cn('w-full', className)}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          barGap={barGap}
          barCategoryGap={categoryGap}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}

          {isVertical ? (
            <>
              {showXAxis && (
                <XAxis
                  type="number"
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  tickFormatter={yAxisFormatter}
                />
              )}
              {showYAxis && (
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={xAxisFormatter}
                  width={100}
                />
              )}
            </>
          ) : (
            <>
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
                />
              )}
            </>
          )}

          {showTooltip && (
            <Tooltip
              content={<CustomTooltip formatter={tooltipFormatter} />}
              cursor={{ fill: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
          )}

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="rect"
              iconSize={12}
            />
          )}

          {bars.map((bar, index) => {
            if (bar.hide) return null

            const color = bar.color || themeColors[index % themeColors.length]

            return (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name || bar.dataKey}
                fill={color}
                radius={bar.radius ?? [4, 4, 0, 0]}
                stackId={bar.stackId}
                barSize={barSize}
              >
                {colorByDataPoint &&
                  data.map((_, dataIndex) => (
                    <Cell
                      key={`cell-${dataIndex}`}
                      fill={themeColors[dataIndex % themeColors.length]}
                    />
                  ))}
              </Bar>
            )
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WorldClassBarChart
