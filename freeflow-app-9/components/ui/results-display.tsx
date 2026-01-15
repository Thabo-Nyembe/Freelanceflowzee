"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"

/**
 * Results Display Components - 2025 Dashboard Cards
 * Beautiful data visualization and KPI display
 */

// ============================================================================
// KPI CARDS
// ============================================================================

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
  className?: string
}

/**
 * KPICard - Key Performance Indicator card
 */
export function KPICard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  trend,
  className,
}: KPICardProps) {
  const trendConfig = {
    up: {
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
    },
    down: {
      icon: <TrendingDown className="w-4 h-4" />,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
    },
    neutral: {
      icon: <Minus className="w-4 h-4" />,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-500/10",
    },
  }

  const config = trend ? trendConfig[trend] : null

  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        "shadow-lg hover:shadow-xl transition-shadow",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-3xl font-bold">{value}</div>

        {change !== undefined && config && (
          <div className={cn("flex items-center gap-2 text-sm", config.color)}>
            <div className={cn("p-1 rounded", config.bg)}>
              {config.icon}
            </div>
            <span className="font-semibold">
              {change > 0 && "+"}
              {change}%
            </span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * MiniKPI - Compact KPI for smaller spaces
 */
export function MiniKPI({
  label,
  value,
  change,
  className,
}: {
  label: string
  value: string | number
  change?: number
  className?: string
}) {
  return (
    <motion.div
      className={cn("flex items-center justify-between", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <div className="text-lg font-bold">{value}</div>
        {change !== undefined && (
          <div
            className={cn(
              "text-xs font-semibold",
              change > 0 && "text-green-600 dark:text-green-400",
              change < 0 && "text-red-600 dark:text-red-400",
              change === 0 && "text-gray-600 dark:text-gray-400"
            )}
          >
            {change > 0 && "↑"} {change < 0 && "↓"} {Math.abs(change)}%
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// STAT GRIDS
// ============================================================================

/**
 * StatGrid - Grid of statistics
 */
export function StatGrid({
  stats,
  columns = 4,
  className,
}: {
  stats: Array<{
    label: string
    value: string | number
    change?: number
    icon?: ReactNode
  }>
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-6", colClasses[columns], className)}>
      {stats.map((stat, index) => (
        <KPICard
          key={index}
          title={stat.label}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          trend={
            stat.change !== undefined
              ? stat.change > 0
                ? "up"
                : stat.change < 0
                ? "down"
                : "neutral"
              : undefined
          }
        />
      ))}
    </div>
  )
}

// ============================================================================
// PROGRESS DISPLAYS
// ============================================================================

/**
 * ProgressCard - Card showing progress towards goal
 */
export function ProgressCard({
  title,
  current = 0,
  goal = 100,
  unit = "",
  icon,
  className,
}: {
  title: string
  current?: number
  goal?: number
  unit?: string
  icon?: ReactNode
  className?: string
}) {
  const safeCurrentValue = current ?? 0
  const safeGoalValue = goal ?? 100
  const percentage = Math.min((safeCurrentValue / safeGoalValue) * 100, 100)

  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        "shadow-lg",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        {icon}
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">
            {safeCurrentValue.toLocaleString()}
            {unit}
          </div>
          <div className="text-sm text-muted-foreground">
            / {safeGoalValue.toLocaleString()}
            {unit}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * CircularProgress - Circular progress indicator
 */
export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}) {
  const percentage = (value / max) * 100
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-violet-600"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold">{percentage.toFixed(0)}%</div>
        {label && <div className="text-xs text-muted-foreground">{label}</div>}
      </div>
    </div>
  )
}

// ============================================================================
// COMPARISON CARDS
// ============================================================================

/**
 * ComparisonCard - Compare two values side by side
 */
export function ComparisonCard({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  icon,
  className,
}: {
  title: string
  leftLabel: string
  leftValue: string | number
  rightLabel: string
  rightValue: string | number
  icon?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        "shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className="font-semibold">{title}</h3>
        {icon}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{leftLabel}</div>
          <div className="text-2xl font-bold">{leftValue}</div>
        </div>

        <div className="space-y-2 border-l border-border pl-6">
          <div className="text-sm text-muted-foreground">{rightLabel}</div>
          <div className="text-2xl font-bold">{rightValue}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// RANKING/LEADERBOARD
// ============================================================================

/**
 * RankingList - Leaderboard/ranking display
 */
export function RankingList({
  title,
  items,
  className,
}: {
  title: string
  items: Array<{
    rank: number
    name: string
    value: string | number
    avatar?: string
    change?: number
  }>
  className?: string
}) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        "shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-semibold mb-6">{title}</h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Rank */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                item.rank === 1 && "bg-yellow-500 text-white",
                item.rank === 2 && "bg-gray-400 text-white",
                item.rank === 3 && "bg-orange-600 text-white",
                item.rank > 3 && "bg-muted text-muted-foreground"
              )}
            >
              {item.rank}
            </div>

            {/* Avatar */}
            {item.avatar && (
              <img src={item.avatar}
                alt={item.name}
                className="w-10 h-10 rounded-full object-cover"
              / loading="lazy">
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.name}</div>
            </div>

            {/* Value & Change */}
            <div className="flex items-center gap-3">
              <div className="font-bold">{item.value}</div>
              {item.change !== undefined && (
                <div
                  className={cn(
                    "text-xs font-semibold",
                    item.change > 0 && "text-green-600",
                    item.change < 0 && "text-red-600"
                  )}
                >
                  {item.change > 0 && "↑"}
                  {item.change < 0 && "↓"}
                  {Math.abs(item.change)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================================
// ACTIVITY FEED
// ============================================================================

/**
 * ActivityFeed - Recent activity timeline
 */
export function ActivityFeed({
  title,
  activities,
  className,
}: {
  title: string
  activities: Array<{
    icon?: ReactNode
    title: string
    description?: string
    time: string
    status?: "success" | "error" | "warning" | "info"
  }>
  className?: string
}) {
  const statusColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }

  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-card p-6",
        "shadow-lg",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-semibold mb-6">{title}</h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Icon/Status */}
            <div className="flex-shrink-0 relative">
              {activity.icon ? (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {activity.icon}
                </div>
              ) : activity.status ? (
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mt-1",
                    statusColors[activity.status]
                  )}
                />
              ) : null}

              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-1/2 top-full w-px h-4 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="font-medium">{activity.title}</div>
              {activity.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {activity.time}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * <KPICard
 *   title="Total Revenue"
 *   value="$124,567"
 *   change={12.5}
 *   trend="up"
 *   icon={<DollarSign />}
 * />
 *
 * <StatGrid
 *   columns={4}
 *   stats={[
 *     { label: "Users", value: "12,543", change: 5.2 },
 *     { label: "Revenue", value: "$45K", change: -2.1 },
 *   ]}
 * />
 *
 * <ProgressCard
 *   title="Monthly Goal"
 *   current={7500}
 *   goal={10000}
 *   unit="$"
 * />
 *
 * <RankingList
 *   title="Top Performers"
 *   items={[
 *     { rank: 1, name: "John Doe", value: "$15K", change: 5 },
 *     { rank: 2, name: "Jane Smith", value: "$12K", change: -2 },
 *   ]}
 * />
 * ```
 */
