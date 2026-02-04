'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Target,
  BarChart3,
  Layers
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'
import type { AnalyticsOverview, ProjectCategory, PerformanceMetrics } from '@/lib/analytics-queries'

const logger = createSimpleLogger('Analytics - Projects')

interface ProjectStats {
  total: number
  active: number
  completed: number
  onHold: number
  completionRate: number
  onTimeRate: number
  avgDuration: number
}

export default function ProjectAnalyticsPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { announce } = useAnnouncer()

  // Data State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)

  // Load project analytics data
  useEffect(() => {
    const loadProjectData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading project analytics', { userId })

        // Dynamic import for code splitting
        const { getAnalyticsOverview, getProjectCategories, getPerformanceMetrics } = await import('@/lib/analytics-queries')

        // Load data in parallel
        const [overviewResult, categoriesResult, performanceResult] = await Promise.all([
          getAnalyticsOverview(userId),
          getProjectCategories(userId),
          getPerformanceMetrics(userId)
        ])

        if (overviewResult.error || categoriesResult.error || performanceResult.error) {
          throw new Error('Failed to load project data')
        }

        setOverview(overviewResult.data)
        setCategories(categoriesResult.data || [])
        setPerformance(performanceResult.data)

        setIsLoading(false)
        announce('Project analytics loaded', 'polite')
        logger.info('Project analytics loaded', {
          userId,
          hasOverview: !!overviewResult.data,
          categoriesCount: categoriesResult.data?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load project analytics'
        logger.error('Failed to load project analytics', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading project analytics', 'assertive')
      }
    }

    loadProjectData()
  }, [userId, announce])

  // Refresh handler
  const handleRefresh = async () => {
    if (!userId) return
    setIsRefreshing(true)

    try {
      const { getAnalyticsOverview, getProjectCategories, getPerformanceMetrics } = await import('@/lib/analytics-queries')
      const [overviewResult, categoriesResult, performanceResult] = await Promise.all([
        getAnalyticsOverview(userId),
        getProjectCategories(userId),
        getPerformanceMetrics(userId)
      ])

      setOverview(overviewResult.data)
      setCategories(categoriesResult.data || [])
      setPerformance(performanceResult.data)
      toast.success('Project data refreshed')
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
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
  const totalProjects = overview?.totalProjects ?? KAZI_ANALYTICS_DATA.overview.totalProjects
  const activeProjects = overview?.activeProjects ?? KAZI_ANALYTICS_DATA.overview.activeProjects
  const completedProjects = overview?.completedProjects ?? KAZI_ANALYTICS_DATA.overview.completedProjects
  const completionRate = performance?.projectCompletionRate ?? KAZI_ANALYTICS_DATA.performance.projectCompletionRate
  const onTimeRate = performance?.onTimeDelivery ?? KAZI_ANALYTICS_DATA.performance.onTimeDelivery
  const displayCategories = categories.length > 0 ? categories : KAZI_ANALYTICS_DATA.projectCategories

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'on-hold': return 'bg-amber-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Analytics</h1>
          <p className="text-muted-foreground">Track project performance, timelines, and categories</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              <NumberFlow value={totalProjects} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              <NumberFlow value={activeProjects} />
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">In progress</span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              <NumberFlow value={completionRate} suffix="%" />
            </div>
            <Progress value={completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* On-Time Delivery */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Target className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              <NumberFlow value={onTimeRate} suffix="%" />
            </div>
            <Badge variant="outline" className="mt-1 border-amber-300 text-amber-700">
              {onTimeRate >= 90 ? 'Excellent' : onTimeRate >= 75 ? 'Good' : 'Needs improvement'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Project Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Project Status Distribution
            </CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="font-bold">{activeProjects}</span>
              </div>
              <Progress value={(activeProjects / totalProjects) * 100} className="h-2" />
            </div>

            {/* Completed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <span className="font-bold">{completedProjects}</span>
              </div>
              <Progress value={(completedProjects / totalProjects) * 100} className="h-2" />
            </div>

            {/* On Hold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">On Hold</span>
                </div>
                <span className="font-bold">{Math.max(0, totalProjects - activeProjects - completedProjects)}</span>
              </div>
              <Progress value={((totalProjects - activeProjects - completedProjects) / totalProjects) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Project Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              Project Categories
            </CardTitle>
            <CardDescription>
              {displayCategories.length > 0
                ? `${displayCategories.length} categories tracked`
                : 'No categories available'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayCategories.length > 0 ? (
              <div className="space-y-4">
                {displayCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color || 'bg-gray-400'}`} />
                      <div>
                        <p className="font-medium text-sm">{category.category}</p>
                        <p className="text-xs text-muted-foreground">{category.count} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(category.revenue)}</p>
                      <div className="flex items-center gap-1">
                        {category.growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs ${category.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.growth >= 0 ? '+' : ''}{category.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Complete projects to see category breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
