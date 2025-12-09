'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  Activity,
  Target,
  Clock,
  ThumbsUp,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'
import { KAZI_ANALYTICS_DATA } from '@/lib/analytics-utils'

const logger = createFeatureLogger('Analytics - Performance')

interface PerformanceMetrics {
  projectCompletionRate: number
  onTimeDelivery: number
  clientSatisfaction: number
  revenuePerProject: number
  profitMargin: number
  efficiency: number
}

export default function PerformanceAnalyticsPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { announce } = useAnnouncer()

  // Data State
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)

  // Load performance data
  useEffect(() => {
    const loadPerformanceData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading performance analytics', { userId })

        // Dynamic import for code splitting
        const { getPerformanceMetrics } = await import('@/lib/analytics-queries')

        const result = await getPerformanceMetrics(userId)

        if (result.error) {
          throw new Error('Failed to load performance data')
        }

        setPerformance(result.data)

        setIsLoading(false)
        announce('Performance analytics loaded', 'polite')
        logger.info('Performance analytics loaded', {
          userId,
          hasData: !!result.data
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load performance analytics'
        logger.error('Failed to load performance analytics', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading performance analytics', 'assertive')
      }
    }

    loadPerformanceData()
  }, [userId, announce])

  // Refresh handler
  const handleRefresh = async () => {
    if (!userId) return
    setIsRefreshing(true)

    try {
      const { getPerformanceMetrics } = await import('@/lib/analytics-queries')
      const result = await getPerformanceMetrics(userId)
      setPerformance(result.data)
      toast.success('Performance data refreshed')
    } catch (err) {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading state
  if (isLoading || userLoading) {
    return (
      <div className="space-y-6 p-6">
        <CardSkeleton />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={handleRefresh} />
      </div>
    )
  }

  // Use real data or fallback
  const completionRate = performance?.projectCompletionRate ?? KAZI_ANALYTICS_DATA.performance.projectCompletionRate
  const onTimeDelivery = performance?.onTimeDelivery ?? KAZI_ANALYTICS_DATA.performance.onTimeDelivery
  const satisfaction = performance?.clientSatisfaction ?? KAZI_ANALYTICS_DATA.performance.clientSatisfaction
  const revenuePerProject = performance?.revenuePerProject ?? KAZI_ANALYTICS_DATA.performance.revenuePerProject
  const profitMargin = performance?.profitMargin ?? KAZI_ANALYTICS_DATA.performance.profitMargin

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
          <p className="text-muted-foreground">Track your operational excellence and efficiency</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Performance Score</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-4xl font-bold text-indigo-700">
                  <NumberFlow value={Math.round((completionRate + onTimeDelivery + satisfaction) / 3)} />
                </span>
                <span className="text-2xl text-indigo-500">/100</span>
              </div>
            </div>
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
              <Activity className="h-10 w-10 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline" className="border-green-300 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              High Performer
            </Badge>
            <Badge variant="outline" className="border-indigo-300 text-indigo-700">
              <Zap className="h-3 w-3 mr-1" />
              Top 10%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Operational Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Operational Metrics
            </CardTitle>
            <CardDescription>Key performance indicators for project delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Project Completion Rate</span>
                </div>
                <span className={`font-bold ${getScoreColor(completionRate)}`}>
                  <NumberFlow value={completionRate} suffix="%" />
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            {/* On-Time Delivery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">On-Time Delivery</span>
                </div>
                <span className={`font-bold ${getScoreColor(onTimeDelivery)}`}>
                  <NumberFlow value={onTimeDelivery} suffix="%" />
                </span>
              </div>
              <Progress value={onTimeDelivery} className="h-2" />
            </div>

            {/* Client Satisfaction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Client Satisfaction</span>
                </div>
                <span className={`font-bold ${getScoreColor(satisfaction)}`}>
                  <NumberFlow value={satisfaction} suffix="%" />
                </span>
              </div>
              <Progress value={satisfaction} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Financial Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Performance
            </CardTitle>
            <CardDescription>Revenue and profitability metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Revenue per Project */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue per Project</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    <NumberFlow value={revenuePerProject} format="currency" />
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+8% vs last quarter</span>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    <NumberFlow value={profitMargin} suffix="%" />
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Badge variant="default" className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                Healthy margin
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
