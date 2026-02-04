// MIGRATED: Batch #21 - Verified database hook integration
'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  formatMetricValue,
  formatChange,
  getTrendColor,
  getInsightIcon,
  getInsightColor,
  getGoalStatusColor,
  calculateFunnelConversion,
  getTimeRangeLabel
} from '@/lib/analytics-utils'
import {
  Metric,
  ChartData,
  Insight,
  Goal,
  FunnelStage,
  TimeRange
} from '@/lib/analytics-types'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createSimpleLogger('AdvancedAnalytics')

type ViewMode = 'overview' | 'revenue' | 'users' | 'conversion' | 'insights' | 'goals'

export default function AdvancedAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [metrics, setMetrics] = useState<Metric[]>([])
  const [revenueChart, setRevenueChart] = useState<ChartData[]>([])
  const [usersChart, setUsersChart] = useState<ChartData[]>([])
  const [trafficSources, setTrafficSources] = useState<any[]>([])
  const [conversionFunnel, setConversionFunnel] = useState<FunnelStage[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [analyticsStats, setAnalyticsStats] = useState<any>(null)

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([])

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const {
          getAnalyticsMetrics,
          getRevenueChart,
          getUsersChart,
          getTrafficSources,
          getConversionFunnel,
          getInsights,
          getGoals,
          getAnalyticsStats
        } = await import('@/lib/analytics-queries')

        const [
          metricsResult,
          revenueResult,
          usersResult,
          trafficResult,
          funnelResult,
          insightsResult,
          goalsResult,
          statsResult
        ] = await Promise.all([
          getAnalyticsMetrics(userId, timeRange),
          getRevenueChart(userId, timeRange),
          getUsersChart(userId, timeRange),
          getTrafficSources(userId, timeRange),
          getConversionFunnel(userId),
          getInsights(userId),
          getGoals(userId),
          getAnalyticsStats(userId, timeRange)
        ])

        if (metricsResult.error) {
          throw new Error(metricsResult.error?.message || 'Failed to load analytics data')
        }

        setMetrics(metricsResult.data || [])
        setSelectedMetrics(metricsResult.data || [])
        setRevenueChart(revenueResult.data || [])
        setUsersChart(usersResult.data || [])
        setTrafficSources(trafficResult.data || [])
        setConversionFunnel(funnelResult.data || [])
        setInsights(insightsResult.data || [])
        setGoals(goalsResult.data || [])
        setAnalyticsStats(statsResult.data || null)

        setIsLoading(false)
        announce('Advanced analytics loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load advanced analytics')
        setIsLoading(false)
        announce('Error loading advanced analytics', 'assertive')
      }
    }

    loadData()
  }, [userId, timeRange, announce])

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'conversion', label: 'Conversion', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'goals', label: 'Goals', icon: '🎯' }
  ]

  const timeRanges: TimeRange[] = ['today', 'week', 'month', 'quarter', 'year']

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedMetrics.map((metric) => (
          <LiquidGlassCard key={metric.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">{metric.name}</div>
                  <div className="text-3xl font-bold" style={{ color: metric.color }}>
                    {formatMetricValue(metric.value, metric.unit)}
                  </div>
                </div>
                <div className="text-2xl">{metric.icon}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  {formatChange(metric.change, metric.unit)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueChart.map((point, index) => {
                const maxValue = Math.max(...revenueChart.map(d => d.value))
                const height = (point.value / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-emerald-400 relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatMetricValue(point.value, 'currency')}
                      </div>
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{point.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {trafficSources.map((source: any, index) => {
                  const total = trafficSources.reduce((sum: number, s: any) => sum + s.value, 0)
                  const percentage = (source.value / total) * 100
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                  return (
                    <div key={index} className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[index] }} />
                      <span className="text-sm flex-1">{source.label}</span>
                      <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Insights</h3>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{insight.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getInsightColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-blue-600 mt-1">💡 {insight.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-green-500">
              {formatMetricValue(analyticsStats?.totalRevenue || 0, 'currency')}
            </div>
            <div className="text-xs text-green-500 mt-1">
              +{(analyticsStats?.revenueGrowth || 0).toFixed(1)}% vs last period
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">MRR</div>
            <div className="text-2xl font-bold text-blue-500">
              {formatMetricValue(analyticsStats?.monthlyRecurringRevenue || 0, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Monthly Recurring</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">ARR</div>
            <div className="text-2xl font-bold text-purple-500">
              {formatMetricValue(analyticsStats?.annualRecurringRevenue || 0, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Annual Recurring</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Avg Order Value</div>
            <div className="text-2xl font-bold text-orange-500">
              {formatMetricValue(analyticsStats?.averageOrderValue || 0, 'currency')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Per Transaction</div>
          </div>
        </LiquidGlassCard>
      </div>

      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
          <div className="h-80 flex items-end justify-between gap-3">
            {revenueChart.map((point, index) => {
              const maxValue = Math.max(...revenueChart.map(d => d.value))
              const height = (point.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-green-600 via-green-500 to-emerald-400 relative group cursor-pointer hover:from-green-500 hover:via-green-400 hover:to-emerald-300 transition-colors"
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      <div className="font-bold">{formatMetricValue(point.value, 'currency')}</div>
                      <div className="text-xs text-gray-300">{point.label}</div>
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-muted-foreground">{point.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-2xl font-bold text-blue-500">
              {formatMetricValue(analyticsStats?.totalUsers || 0, 'number')}
            </div>
            <div className="text-xs text-blue-500 mt-1">All Time</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Active Users</div>
            <div className="text-2xl font-bold text-green-500">
              {formatMetricValue(analyticsStats?.activeUsers || 0, 'number')}
            </div>
            <div className="text-xs text-green-500 mt-1">
              +{(analyticsStats?.userGrowth || 0).toFixed(1)}% growth
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Retention Rate</div>
            <div className="text-2xl font-bold text-purple-500">
              {(analyticsStats?.retentionRate || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Last 30 Days</div>
          </div>
        </LiquidGlassCard>
      </div>

      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">User Growth</h3>
          <div className="h-80 flex items-end justify-between gap-3">
            {usersChart.map((point, index) => {
              const maxValue = Math.max(...usersChart.map(d => d.value))
              const height = (point.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 relative group cursor-pointer"
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      <div className="font-bold">{formatMetricValue(point.value, 'number')}</div>
                      <div className="text-xs text-gray-300">{point.label}</div>
                    </div>
                  </motion.div>
                  <div className="text-sm font-medium text-muted-foreground">{point.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderConversion = () => {
    const totalConversion = calculateFunnelConversion(conversionFunnel)

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LiquidGlassCard>
            <div className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Overall Conversion</div>
              <div className="text-3xl font-bold text-green-500">{totalConversion.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Visitor to Customer</div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard>
            <div className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Conversion Rate</div>
              <div className="text-3xl font-bold text-purple-500">
                {(analyticsStats?.conversionRate || 0).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Current Period</div>
            </div>
          </LiquidGlassCard>
        </div>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => {
                const maxCount = conversionFunnel[0].count
                const width = (stage.count / maxCount) * 100

                return (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {formatMetricValue(stage.count, 'number')}
                        </span>
                        <span className="text-sm font-semibold text-blue-500">
                          {stage.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="relative h-12 bg-muted/30 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ delay: index * 0.15, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    )
  }

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight) => (
          <LiquidGlassCard key={insight.id}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{insight.title}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getInsightColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">💡</span>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{insight.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100
          return (
            <LiquidGlassCard key={goal.id}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatMetricValue(goal.current, goal.unit)} / {formatMetricValue(goal.target, goal.unit)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGoalStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>

                <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${
                      progress >= 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : progress >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                  />
                </div>

                <div className="text-sm font-semibold text-right">
                  {progress.toFixed(1)}% complete
                </div>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={3} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">Advanced Analytics</TextShimmer>
              <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2 rounded-lg border bg-background"
              >
                {timeRanges.map((range) => (
                  <option key={range} value={range}>{getTimeRangeLabel(range)}</option>
                ))}
              </select>
              <button
                onClick={() => toast.success('Report exported')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
              >
                Export Report
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-2">
              <div className="flex items-center gap-2">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'revenue' && renderRevenue()}
          {viewMode === 'users' && renderUsers()}
          {viewMode === 'conversion' && renderConversion()}
          {viewMode === 'insights' && renderInsights()}
          {viewMode === 'goals' && renderGoals()}
        </ScrollReveal>
      </div>
    </div>
  )
}
