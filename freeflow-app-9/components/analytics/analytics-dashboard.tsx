'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge"
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  Clock, '
  Activity, '
  BarChart2, "
  RefreshCw,'
  Download"
} from 'lucide-react'

interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalViews: number;
  avgSessionTime: number;
  bounceRate: number;
  revenue: number;
  payments: number;
  eventTypes: Array<{ type: string; count: number }>;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  realtime: RealtimeMetrics;
  charts: ChartData;
  topPages: Array<{ path: string; visits: number }>;
  userActivity: {
    sessions: number;
    page_views: number;
    user_actions: number;
    hours_active: number;
  };
  performance: {
    avg_page_load_time: number;
    avg_dom_load_time: number;
    avg_fcp: number;
    avg_lcp: number;
    avg_cls: number;
    total_measurements: number;
  };
  timeRange: string;
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
        console.error('Failed to fetch analytics: ', result.error)'
      }
    } catch (error) {
      console.error('Analytics fetch error: ', error)'
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K
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
                    ? 'bg-white text-indigo-600 shadow-sm
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Auto Refresh Toggle */}
          <Button
            variant="outline"
            size="sm
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`gap-2 ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}
          >
  <
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>

          {/* Export Button */}
          <Button variant="outline" size="sm" className="gap-2">
  <
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card>
  <
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
  <
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
  <
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{((data?.summary.activeUsers / data?.summary.totalUsers) * 100).toFixed(1)}% from last {timeRange}
            </p>
  <
            <Progress 
              value={((data?.summary.activeUsers / data?.summary.totalUsers) * 100)} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Session Time Card */}"
        <Card>"
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <
            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
  <
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
  <
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(data?.summary.avgSessionTime / 60)}m {data?.summary.avgSessionTime % 60}s
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.summary.bounceRate}% bounce rate
            </p>
  <
            <Progress value={100 - data?.summary.bounceRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Page Views Card */}
        <Card>
  <
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
  <
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
  <
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data?.userActivity.page_views} views today
            </p>
  <
            <Progress 
              value={(data?.userActivity.page_views / data?.summary.totalViews) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Revenue Card */}"
        <Card>"
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
  <
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
  <
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.summary.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.summary.payments} payments
            </p>
  <
            <Progress 
              value={(data?.summary.payments / data?.summary.totalUsers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )"
} "