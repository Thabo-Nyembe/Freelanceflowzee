'use client'

/**
 * World-Class Pie Chart Component
 *
 * Features:
 * - Recharts PieChart wrapper with consistent styling
 * - Dark/light theme support via next-themes
 * - Loading and empty states
 * - Configurable tooltips and legends
 * - Donut chart support (innerRadius)
 * - Label customization
 * - Active shape animation
 * - Responsive design
 *
 * Based on Recharts (MIT License)
 * Docs: https://recharts.org/en-US/api/PieChart
 */

import * as React from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface PieChartDataPoint {
  name: string
  value: number
  color?: string
  [key: string]: string | number | undefined
}

export interface WorldClassPieChartProps {
  /** Chart data array */
  data: PieChartDataPoint[]
  /** Data key for values (default: 'value') */
  dataKey?: string
  /** Name key for labels (default: 'name') */
  nameKey?: string
  /** Chart title (optional) */
  title?: string
  /** Chart height in pixels */
  height?: number
  /** Show loading state */
  isLoading?: boolean
  /** Inner radius for donut chart (0 = pie, >0 = donut) */
  innerRadius?: number | string
  /** Outer radius */
  outerRadius?: number | string
  /** Show tooltip */
  showTooltip?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** Show labels on pie slices */
  showLabels?: boolean
  /** Label type */
  labelType?: 'percent' | 'value' | 'name' | 'custom'
  /** Custom label renderer */
  renderLabel?: (entry: PieChartDataPoint) => string
  /** Enable active shape animation on hover */
  enableActiveShape?: boolean
  /** Padding angle between slices */
  paddingAngle?: number
  /** Start angle */
  startAngle?: number
  /** End angle */
  endAngle?: number
  /** Custom tooltip formatter */
  tooltipFormatter?: (value: number, name: string) => [string, string]
  /** Additional class names */
  className?: string
  /** Empty state message */
  emptyMessage?: string
  /** Custom colors array */
  colors?: string[]
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
    '#f97316', // orange-500
    '#14b8a6', // teal-500
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
    '#fb923c', // orange-400
    '#2dd4bf', // teal-400
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
    payload: PieChartDataPoint & { fill: string }
  }>
  formatter?: (value: number, name: string) => [string, string]
}

function CustomTooltip({ active, payload, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const entry = payload[0]
  const [formattedValue, formattedName] = formatter
    ? formatter(entry.value, entry.name)
    : [entry.value?.toLocaleString() ?? '0', entry.name]

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: entry.payload.fill }}
        />
        <span className="text-muted-foreground">{formattedName}:</span>
        <span className="font-medium text-foreground">{formattedValue}</span>
      </div>
    </div>
  )
}

// ============================================================================
// Active Shape Renderer
// ============================================================================

interface ActiveShapeProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: PieChartDataPoint
  percent: number
  value: number
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props

  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-sm"
      >
        {payload.name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-xs opacity-60"
      >
        {`${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  )
}

// ============================================================================
// Label Renderer
// ============================================================================

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  name: string
  value: number
}

const renderLabel = (
  props: LabelProps,
  labelType: 'percent' | 'value' | 'name' | 'custom',
  customRenderer?: (entry: PieChartDataPoint) => string
) => {
  const RADIAN = Math.PI / 180
  const { cx, cy, midAngle, outerRadius, percent, name, value } = props
  const radius = outerRadius * 1.2
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  let labelText = ''
  switch (labelType) {
    case 'percent':
      labelText = `${(percent * 100).toFixed(0)}%`
      break
    case 'value':
      labelText = value.toLocaleString()
      break
    case 'name':
      labelText = name
      break
    case 'custom':
      labelText = customRenderer ? customRenderer({ name, value }) : name
      break
  }

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {labelText}
    </text>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WorldClassPieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  title,
  height = 300,
  isLoading = false,
  innerRadius = 0,
  outerRadius = '70%',
  showTooltip = true,
  showLegend = true,
  legendPosition = 'bottom',
  showLabels = false,
  labelType = 'percent',
  renderLabel: customLabelRenderer,
  enableActiveShape = false,
  paddingAngle = 0,
  startAngle = 0,
  endAngle = 360,
  tooltipFormatter,
  className,
  emptyMessage = 'No data available',
  colors,
}: WorldClassPieChartProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

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

  const themeColors = colors || getThemeColors(resolvedTheme)

  const onPieEnter = (_: unknown, index: number) => {
    if (enableActiveShape) {
      setActiveIndex(index)
    }
  }

  const onPieLeave = () => {
    if (enableActiveShape) {
      setActiveIndex(undefined)
    }
  }

  // Map legend position to layout
  const legendLayout = legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal'
  const legendAlign = legendPosition === 'left' ? 'left' : legendPosition === 'right' ? 'right' : 'center'
  const legendVerticalAlign = legendPosition === 'top' ? 'top' : legendPosition === 'bottom' ? 'bottom' : 'middle'

  return (
    <div className={cn('w-full', className)}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          {showTooltip && (
            <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          )}

          {showLegend && (
            <Legend
              layout={legendLayout}
              align={legendAlign}
              verticalAlign={legendVerticalAlign}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingTop: legendPosition === 'bottom' ? 20 : 0,
                paddingBottom: legendPosition === 'top' ? 20 : 0,
              }}
            />
          )}

          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            startAngle={startAngle}
            endAngle={endAngle}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            activeIndex={activeIndex}
            activeShape={enableActiveShape ? renderActiveShape : undefined}
            label={
              showLabels
                ? (props: LabelProps) => renderLabel(props, labelType, customLabelRenderer)
                : undefined
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || themeColors[index % themeColors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WorldClassPieChart
