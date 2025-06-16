'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  DollarSign,
  Activity,
  AlertCircle,
  Zap,
  Globe,
  MousePointer,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface AnalyticsSummary {
  total_events: number
  total_users: number
  total_sessions: number
  total_page_views: number
  total_revenue: number
  avg_session_duration: number
}

interface RealtimeMetrics {
  active_sessions: number
  events_last_hour: number
  revenue_today: number
  page_views_today: number
  errors_today: number
}

interface ChartData {
  events: Array<{ date: string; count: number }>
  revenue: Array<{ date: string; revenue: number; payments: number }>
  eventTypes: Array<{ type: string; count: number }>
}

interface AnalyticsData {
  summary: AnalyticsSummary
  realtime: RealtimeMetrics
  charts: ChartData
  topPages: Array<{ path: string; visits: number }>
  userActivity: {
    sessions: number
    page_views: number
    user_actions: number
    hours_active: number
  }
  performance: {
    avg_page_load_time: number
    avg_dom_load_time: number
    avg_fcp: number
    avg_lcp: number
    avg_cls: number
    total_measurements: number
  }
  timeRange: string
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('day')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        console.error('Failed to fetch analytics:', result.error)
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAnalytics()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, timeRange])

  const handleRefresh = () => {
    setLoading(true)
    fetchAnalytics()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor your application performance and user behavior</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: 'hour', label: '1H' },
              { value: 'day', label: '24H' },
              { value: 'week', label: '7D' },
              { value: 'month', label: '30D' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Auto Refresh Toggle */}
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Auto
          </Button>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
        <span>•</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        {autoRefresh && (
          <>
            <span>•</span>
            <span>Auto-refresh: ON</span>
          </>
        )}
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-900">
                  {data?.realtime?.active_sessions || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Events/Hour</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatNumber(data?.realtime?.events_last_hour || 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue Today</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(data?.realtime?.revenue_today || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Page Views</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(data?.realtime?.page_views_today || 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Errors Today</p>
                <p className="text-2xl font-bold text-red-900">
                  {data?.realtime?.errors_today || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.summary?.total_events || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange === 'hour' ? 'hour' : timeRange === 'day' ? '24 hours' : timeRange === 'week' ? '7 days' : '30 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.summary?.total_users || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.summary?.total_sessions || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Avg duration: {formatDuration(data?.summary?.avg_session_duration || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.summary?.total_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages in your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topPages?.slice(0, 8).map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-mono text-sm truncate max-w-[200px]">
                      {page.path || '/'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatNumber(page.visits)}</span>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No page data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Core Web Vitals and loading performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {Math.round(data?.performance?.avg_page_load_time || 0)}ms
                  </div>
                  <div className="text-xs text-blue-600">Page Load Time</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {Math.round(data?.performance?.avg_fcp || 0)}ms
                  </div>
                  <div className="text-xs text-green-600">First Contentful Paint</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round(data?.performance?.avg_lcp || 0)}ms
                  </div>
                  <div className="text-xs text-purple-600">Largest Contentful Paint</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">
                    {(data?.performance?.avg_cls || 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-orange-600">Cumulative Layout Shift</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Based on {formatNumber(data?.performance?.total_measurements || 0)} measurements
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
          <CardDescription>Breakdown of different event types tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.charts?.eventTypes?.map((eventType) => (
              <div
                key={eventType.type}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium capitalize">{eventType.type.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-500">{formatNumber(eventType.count)} events</div>
                </div>
                <div className="text-right">
                  {eventType.type === 'page_view' && <Eye className="h-5 w-5 text-blue-500" />}
                  {eventType.type === 'user_action' && <MousePointer className="h-5 w-5 text-green-500" />}
                  {eventType.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {eventType.type === 'performance' && <Zap className="h-5 w-5 text-purple-500" />}
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-sm col-span-full">No event data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-4">
        Analytics powered by FreeflowZee • Real-time data collection • Privacy compliant
      </div>
    </div>
  )
} 