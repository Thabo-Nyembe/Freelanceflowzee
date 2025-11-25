'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  MessageSquare,
  Calendar,
  Download,
  Share2,
  Zap,
  Activity,
  Users,
  Filter
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { KAZI_CLIENT_DATA, Analytics } from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientZoneAnalytics')

// ============================================================================
// ANALYTICS DATA TYPES
// ============================================================================

interface AnalyticsData {
  onTimeDelivery: number
  firstTimeApproval: number
  avgResponseTime: number
  messagesExchanged: number
  meetingsHeld: number
  filesShared: number
  projectCompletion?: number
  clientSatisfaction?: number
  communicationStats?: {
    emails: number
    calls: number
    messages: number
    meetings: number
  }
  timeline?: {
    date: string
    completed: number
    inProgress: number
    pending: number
  }[]
}

// ============================================================================
// MOCK ANALYTICS DATA
// ============================================================================

const EXTENDED_ANALYTICS: AnalyticsData = {
  onTimeDelivery: 94,
  firstTimeApproval: 98,
  avgResponseTime: 2.1,
  messagesExchanged: 127,
  meetingsHeld: 8,
  filesShared: 23,
  projectCompletion: 87,
  clientSatisfaction: 4.9,
  communicationStats: {
    emails: 45,
    calls: 12,
    messages: 70,
    meetings: 8
  },
  timeline: [
    { date: 'Jan 15', completed: 2, inProgress: 1, pending: 1 },
    { date: 'Jan 22', completed: 4, inProgress: 2, pending: 1 },
    { date: 'Jan 29', completed: 5, inProgress: 3, pending: 0 },
    { date: 'Feb 5', completed: 7, inProgress: 2, pending: 1 },
    { date: 'Feb 12', completed: 9, inProgress: 3, pending: 0 }
  ]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { announce } = useAnnouncer()
  const router = useRouter()

  // ANALYTICS STATE
  const [analytics, setAnalytics] = useState<AnalyticsData>(EXTENDED_ANALYTICS)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'onTimeDelivery',
    'firstTimeApproval',
    'avgResponseTime'
  ])

  // A+++ LOAD ANALYTICS DATA
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500)
        })

        setIsLoading(false)
        announce('Analytics loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
        setIsLoading(false)
        announce('Error loading analytics', 'assertive')
      }
    }

    loadAnalytics()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // HANDLER 1: EXPORT DATA
  // ============================================================================

  const handleExportData = useCallback(async (format: 'csv' | 'pdf' | 'json') => {
    try {
      setIsExporting(true)

      logger.info('Analytics export initiated', {
        format,
        timeRange,
        clientId: KAZI_CLIENT_DATA.clientInfo.email
      })

      // Simulate API call
      const response = await fetch('/api/client-zone/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          timeRange,
          analytics,
          clientId: KAZI_CLIENT_DATA.clientInfo.email,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      logger.info('Analytics exported successfully', { format })

      // Simulate download
      const element = document.createElement('a')
      element.setAttribute('href', '#')
      element.setAttribute(
        'download',
        `analytics-${timeRange}.${format}`
      )
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      toast.success('Export started!', {
        description: `Analytics exported as ${format.toUpperCase()}`
      })
    } catch (error: any) {
      logger.error('Failed to export analytics', { error })
      toast.error('Failed to export data', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsExporting(false)
    }
  }, [timeRange, analytics])

  // ============================================================================
  // HANDLER 2: SHARE REPORT
  // ============================================================================

  const handleShareReport = useCallback(async () => {
    try {
      logger.info('Report share initiated', {
        timeRange,
        clientId: KAZI_CLIENT_DATA.clientInfo.email
      })

      const response = await fetch('/api/client-zone/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange,
          analytics,
          clientId: KAZI_CLIENT_DATA.clientInfo.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to share report')
      }

      logger.info('Report shared successfully', { timeRange })

      toast.success('Share link copied!', {
        description: 'Report link copied to clipboard'
      })
    } catch (error: any) {
      logger.error('Failed to share report', { error })
      toast.error('Failed to share report')
    }
  }, [timeRange, analytics])

  // ============================================================================
  // HANDLER 3: TOGGLE METRIC
  // ============================================================================

  const handleToggleMetric = useCallback((metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
    } else {
      setSelectedMetrics([...selectedMetrics, metric])
    }
  }, [selectedMetrics])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Project Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Track your project performance, team communication, and timeline metrics
            </p>
          </div>
        </div>

        {/* Time Range & Export Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareReport}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportData('csv')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportData('pdf')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* On-Time Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">On-Time Delivery</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analytics.onTimeDelivery}%
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <Progress value={analytics.onTimeDelivery} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {Math.ceil(analytics.onTimeDelivery / 10)} of 10 projects on time
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* First-Time Approval Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">First-Time Approval</p>
                      <p className="text-3xl font-bold text-green-600">
                        {analytics.firstTimeApproval}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <Progress value={analytics.firstTimeApproval} className="h-2" />
                  <p className="text-xs text-gray-500">
                    Deliverables approved without revisions
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Avg Response Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {analytics.avgResponseTime} hrs
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(analytics.avgResponseTime * 10, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Faster than industry average (4 hrs)
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Communication Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Messages */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Messages Exchanged</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.messagesExchanged}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.ceil(analytics.messagesExchanged / 10)} avg per day
                    </p>
                  </div>

                  {/* Meetings */}
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Meetings Held</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics.meetingsHeld}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.ceil(analytics.meetingsHeld / 4)} per week
                    </p>
                  </div>

                  {/* Files Shared */}
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Activity className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Files Shared</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {analytics.filesShared}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {(analytics.filesShared / 23 * 100).toFixed(0)}% delivered
                    </p>
                  </div>

                  {/* Client Satisfaction */}
                  <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Users className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Satisfaction</p>
                        <p className="text-2xl font-bold text-pink-600">
                          {analytics.clientSatisfaction || 4.9}/5.0
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Excellent client feedback
                    </p>
                  </div>
                </div>

                {/* Detailed Communication Breakdown */}
                {analytics.communicationStats && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-gray-900">Detailed Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.communicationStats).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {key}
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={
                                  (value /
                                    Math.max(
                                      ...Object.values(
                                        analytics.communicationStats!
                                      )
                                    )) *
                                  100
                                }
                                className="w-20 h-2"
                              />
                              <span className="text-sm font-semibold min-w-[30px]">
                                {value}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.timeline && analytics.timeline.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.timeline.map((period, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {period.date}
                          </span>
                          <span className="text-gray-600">
                            {period.completed + period.inProgress + period.pending} total
                          </span>
                        </div>
                        <div className="flex h-2 gap-1 overflow-hidden rounded-full bg-gray-200">
                          {period.completed > 0 && (
                            <div
                              className="bg-green-600"
                              style={{
                                width: `${
                                  (period.completed /
                                    (period.completed +
                                      period.inProgress +
                                      period.pending)) *
                                  100
                                }%`
                              }}
                            />
                          )}
                          {period.inProgress > 0 && (
                            <div
                              className="bg-blue-600"
                              style={{
                                width: `${
                                  (period.inProgress /
                                    (period.completed +
                                      period.inProgress +
                                      period.pending)) *
                                  100
                                }%`
                              }}
                            />
                          )}
                          {period.pending > 0 && (
                            <div
                              className="bg-yellow-600"
                              style={{
                                width: `${
                                  (period.pending /
                                    (period.completed +
                                      period.inProgress +
                                      period.pending)) *
                                  100
                                }%`
                              }}
                            />
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1" />
                            {period.completed} Completed
                          </span>
                          <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1" />
                            {period.inProgress} In Progress
                          </span>
                          <span>
                            <span className="inline-block w-2 h-2 rounded-full bg-yellow-600 mr-1" />
                            {period.pending} Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No timeline data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Performance</p>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(
                      (analytics.onTimeDelivery +
                        analytics.firstTimeApproval) /
                        2
                    )}
                    %
                  </div>
                  <p className="text-sm text-gray-600">
                    Above industry standards
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Key Achievements</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ {analytics.onTimeDelivery}% on-time delivery rate</li>
                    <li>✓ {analytics.firstTimeApproval}% first-time approvals</li>
                    <li>✓ {analytics.meetingsHeld} successful meetings held</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
