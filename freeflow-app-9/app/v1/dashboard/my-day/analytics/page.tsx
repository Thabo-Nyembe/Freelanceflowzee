// MIGRATED: Batch #30 - Removed mock data, using database hooks
'use client'

import { useState, useEffect, useReducer } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Zap,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// MY DAY UTILITIES
import {
  taskReducer,
  initialTaskState,
  calculateMetrics
} from '@/lib/my-day-utils'

const logger = createSimpleLogger('MyDay-Analytics')

export default function AnalyticsPage() {
  // REAL USER AUTH
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [state] = useReducer(taskReducer, initialTaskState)
  const [workPatternAnalytics, setWorkPatternAnalytics] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch AI Work Pattern Analytics
  useEffect(() => {
    const fetchWorkPatternAnalytics = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoadingAnalytics(false)
        return
      }

      try {
        setIsLoadingAnalytics(true)
        setError(null)

        logger.info('Fetching work pattern analytics', { userId })

        const response = await fetch('/api/my-day/analytics?days=30&includeSchedule=true')
        const data = await response.json()

        if (data.success) {
          setWorkPatternAnalytics(data.data)

          logger.info('Work pattern analytics loaded', {
            userId,
            analyzedTasks: data.data.metadata?.analyzedTasks || 0,
            completionRate: data.data.insights?.completionRate || 0
          })

          announce('Productivity analytics loaded', 'polite')
        } else {
          throw new Error(data.error || 'Failed to fetch analytics')
        }

        setIsLoadingAnalytics(false)
      } catch (error) {
        logger.error('Failed to fetch work pattern analytics', { error: error.message, userId })
        setIsLoadingAnalytics(false)
        setError(error.message)
        announce('Error loading analytics', 'assertive')
      }
    }

    fetchWorkPatternAnalytics()
  }, [userId, announce])

  // Refresh handler
  const handleRefresh = async () => {
    if (!userId) return
    setIsLoadingAnalytics(true)
    setError(null)

    try {
      const response = await fetch('/api/my-day/analytics?days=30&includeSchedule=true')
      const data = await response.json()

      if (data.success) {
        setWorkPatternAnalytics(data.data)
        toast.success('Analytics refreshed')
      } else {
        throw new Error(data.error || 'Failed to refresh')
      }
    } catch (error) {
      toast.error('Failed to refresh analytics')
      setError(error.message)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  // Loading state
  if (isLoadingAnalytics || userLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  const { totalTasks, completionRate, focusHours, focusMinutes, productivityScore } = calculateMetrics(state, workPatternAnalytics)

  return (
    <div className="space-y-6">
      {/* AI-POWERED PRODUCTIVITY INSIGHTS */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Productivity Insights
          </h2>
          <p className="text-gray-600">Based on your work patterns and performance data</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingAnalytics} aria-label="Refresh">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Peak Performance Window */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Peak Performance Window
            {isLoadingAnalytics && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {workPatternAnalytics?.insights?.peakPerformanceWindow || '-'}
                </h3>
                <p className="text-sm text-gray-600">Your most productive hours</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {workPatternAnalytics?.insights?.energyOptimizationScore || 0}%
                </div>
                <div className="text-xs text-gray-500">Efficiency Score</div>
              </div>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>AI Recommendation:</strong>{' '}
                {workPatternAnalytics?.insights?.recommendations?.[0] || ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Peak Hours */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
              <p className="text-sm text-gray-600 mb-3">Most Productive</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Tasks completed: -</p>
                <p>Focus level: -</p>
                <p>Quality score: -</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Patterns */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Task Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Design Work</span>
                  <span className="text-xs font-semibold text-gray-600">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">0% completion rate</p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Coding</span>
                  <span className="text-xs font-semibold text-gray-600">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">0% completion rate</p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Meetings</span>
                  <span className="text-xs font-semibold text-gray-600">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">0% completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Allocation */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              Time Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Deep Work</span>
                <span className="text-xs font-medium">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Meetings</span>
                <span className="text-xs font-medium">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Admin</span>
                <span className="text-xs font-medium">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Breaks</span>
                <span className="text-xs font-medium">0%</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">

                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Metrics */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Efficiency Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Completion Rate</span>
                  <span className="text-xs font-semibold">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Quality Score</span>
                  <span className="text-xs font-semibold">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">On-Time Delivery</span>
                  <span className="text-xs font-semibold">-</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Optimization & Daily Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Energy Optimization Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Energy Level Throughout Day</span>
                </div>
                {/* Energy graph visualization */}
                <div className="grid grid-cols-12 gap-1 h-24 items-end">
                  {[].map((energy, hour) => (
                    <div key={hour} className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "w-full rounded-t transition-all",
                          energy >= 80 ? "bg-green-500" :
                          energy >= 60 ? "bg-blue-500" :
                          energy >= 40 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ height: `${energy}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{(hour + 8)}h</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>Optimization Tip:</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle>Daily Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Task Completion</span>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {completionRate >= 80 ? "Excellent progress!" :
                   completionRate >= 60 ? "Good progress" :
                   completionRate >= 40 ? "Keep pushing" :
                   "Let's focus"}
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Focus Time Goal</span>
                  <span className="text-sm font-medium">{productivityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${productivityScore}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {focusHours}h {focusMinutes}m of focused work today
                </p>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Trend</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[].map((rate, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </div>
                      <div className="w-full h-12 bg-gray-200 rounded flex items-end">
                        <div
                          className={cn(
                            "w-full rounded",
                            i === 6 ? "bg-purple-600" : "bg-gray-400"
                          )}
                          style={{ height: `${rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI-Generated Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-sm">Productivity Boost</h4>
              </div>
              <p className="text-xs text-gray-600">
              </p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Time Management</h4>
              </div>
              <p className="text-xs text-gray-600">
              </p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <h4 className="font-semibold text-sm">Break Optimization</h4>
              </div>
              <p className="text-xs text-gray-600">
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
