// Context7 Enhanced Revenue Analytics with Monetization Tracking
'use client'

import React, { useReducer, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Download, 
  Share2,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Globe,
  MousePointer,
  Smartphone,
  Monitor,
  Heart,
  Star
} from 'lucide-react'

// Context7 Pattern: Revenue Analytics State Management
interface RevenueState {
  metrics: {
    totalRevenue: number
    monthlyRevenue: number
    dailyRevenue: number
    conversionRate: number
    averageOrderValue: number
    totalUsers: number
    premiumUsers: number
    freeUsers: number
  }
  engagement: {
    totalViews: number
    totalDownloads: number
    totalShares: number
    uniqueVisitors: number
    bounceRate: number
    sessionDuration: number
  }
  monetization: {
    adRevenue: number
    subscriptionRevenue: number
    premiumUpgrades: number
    affiliateRevenue: number
    escrowFees: number
    storageUpgrades: number
  }
  analytics: {
    topPerformingFiles: FileAnalytics[]
    trafficSources: TrafficSource[]
    deviceBreakdown: DeviceStats[]
    geographicData: GeographicStats[]
  }
  realtimeData: {
    currentUsers: number
    recentUploads: number
    activeDownloads: number
    revenueToday: number
  }
}

interface FileAnalytics {
  id: string
  fileName: string
  views: number
  downloads: number
  revenue: number
  conversionRate: number
  shareCount: number
}

interface TrafficSource {
  source: string
  users: number
  revenue: number
  conversionRate: number
  percentage: number
}

interface DeviceStats {
  device: string
  users: number
  revenue: number
  percentage: number
}

interface GeographicStats {
  country: string
  users: number
  revenue: number
  flag: string
}

type RevenueAction = 
  | { type: 'UPDATE_METRICS'; payload: Partial<RevenueState['metrics']> }
  | { type: 'UPDATE_ENGAGEMENT'; payload: Partial<RevenueState['engagement']> }
  | { type: 'UPDATE_MONETIZATION'; payload: Partial<RevenueState['monetization']> }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<RevenueState['analytics']> }
  | { type: 'UPDATE_REALTIME'; payload: Partial<RevenueState['realtimeData']> }
  | { type: 'REFRESH_ALL_DATA' }

// Context7 Pattern: Revenue Reducer
const revenueReducer = (state: RevenueState, action: RevenueAction): RevenueState => {
  switch (action.type) {
    case 'UPDATE_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } }
    case 'UPDATE_ENGAGEMENT':
      return { ...state, engagement: { ...state.engagement, ...action.payload } }
    case 'UPDATE_MONETIZATION':
      return { ...state, monetization: { ...state.monetization, ...action.payload } }
    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: { ...state.analytics, ...action.payload } }
    case 'UPDATE_REALTIME':
      return { ...state, realtimeData: { ...state.realtimeData, ...action.payload } }
    case 'REFRESH_ALL_DATA':
      return { ...state }
    default:
      return state
  }
}

interface RevenueAnalyticsProps {
  userId?: string
  timeRange?: 'today' | 'week' | 'month' | 'year'
  showAdMetrics?: boolean
  enableRealtimeUpdates?: boolean
}

export function RevenueAnalytics({
  userId,
  timeRange = 'month',
  showAdMetrics = true,
  enableRealtimeUpdates = true
}: RevenueAnalyticsProps) {
  
  // Context7 Pattern: Central State Management
  const [state, dispatch] = useReducer(revenueReducer, {
    metrics: {
      totalRevenue: 24680,
      monthlyRevenue: 8450,
      dailyRevenue: 320,
      conversionRate: 8.4,
      averageOrderValue: 89.50,
      totalUsers: 15420,
      premiumUsers: 1280,
      freeUsers: 14140
    },
    engagement: {
      totalViews: 156780,
      totalDownloads: 89340,
      totalShares: 12450,
      uniqueVisitors: 45230,
      bounceRate: 34.5,
      sessionDuration: 4.2
    },
    monetization: {
      adRevenue: 3450,
      subscriptionRevenue: 4200,
      premiumUpgrades: 580,
      affiliateRevenue: 120,
      escrowFees: 100,
      storageUpgrades: 890
    },
    analytics: {
      topPerformingFiles: [
        { id: '1', fileName: 'portfolio-design.zip', views: 5420, downloads: 2340, revenue: 450, conversionRate: 43.2, shareCount: 890 },
        { id: '2', fileName: 'brand-assets.pdf', views: 4320, downloads: 1890, revenue: 320, conversionRate: 43.7, shareCount: 670 },
        { id: '3', fileName: 'client-presentation.pptx', views: 3890, downloads: 1650, revenue: 280, conversionRate: 42.4, shareCount: 560 }
      ],
      trafficSources: [
        { source: 'Direct', users: 12450, revenue: 5680, conversionRate: 9.2, percentage: 35.4 },
        { source: 'Google', users: 8920, revenue: 3450, conversionRate: 7.8, percentage: 25.3 },
        { source: 'Social Media', users: 6780, revenue: 2340, conversionRate: 6.9, percentage: 19.3 },
        { source: 'Referrals', users: 4320, revenue: 1890, conversionRate: 8.7, percentage: 12.3 },
        { source: 'Email', users: 2670, revenue: 1320, conversionRate: 11.2, percentage: 7.6 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', users: 18450, revenue: 8900, percentage: 52.4 },
        { device: 'Mobile', users: 12340, revenue: 4560, percentage: 35.1 },
        { device: 'Tablet', users: 4420, revenue: 1890, percentage: 12.5 }
      ],
      geographicData: [
        { country: 'United States', users: 8940, revenue: 6780, flag: '🇺🇸' },
        { country: 'United Kingdom', users: 4320, revenue: 2890, flag: '🇬🇧' },
        { country: 'Canada', users: 3450, revenue: 2340, flag: '🇨🇦' },
        { country: 'Australia', users: 2890, revenue: 1890, flag: '🇦🇺' },
        { country: 'Germany', users: 2340, revenue: 1560, flag: '🇩🇪' }
      ]
    },
    realtimeData: {
      currentUsers: 34,
      recentUploads: 12,
      activeDownloads: 8,
      revenueToday: 320
    }
  })

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }, [])

  // Format percentage
  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`
  }, [])

  // Format number with commas
  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }, [])

  // Realtime updates simulation
  useEffect(() => {
    if (!enableRealtimeUpdates) return

    const interval = setInterval(() => {
      dispatch({
        type: 'UPDATE_REALTIME',
        payload: {
          currentUsers: Math.max(20, Math.floor(Math.random() * 50) + 20),
          recentUploads: Math.floor(Math.random() * 20) + 5,
          activeDownloads: Math.floor(Math.random() * 15) + 3,
          revenueToday: state.realtimeData.revenueToday + Math.floor(Math.random() * 50)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [enableRealtimeUpdates, state.realtimeData.revenueToday])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
          <p className="text-muted-foreground">Track your monetization performance like WeTransfer Pro</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'REFRESH_ALL_DATA' })}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Realtime Metrics */}
      {enableRealtimeUpdates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{state.realtimeData.currentUsers}</div>
                <p className="text-sm text-muted-foreground">Users Online</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{state.realtimeData.recentUploads}</div>
                <p className="text-sm text-muted-foreground">Recent Uploads</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{state.realtimeData.activeDownloads}</div>
                <p className="text-sm text-muted-foreground">Active Downloads</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(state.realtimeData.revenueToday)}</div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(state.metrics.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +12.5% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(state.metrics.conversionRate)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +2.1% improvement
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
                <p className="text-2xl font-bold">{formatNumber(state.metrics.premiumUsers)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +8.3% this month
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(state.metrics.averageOrderValue)}</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3" />
                  -1.2% decline
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monetization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>Breakdown of income streams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subscription Revenue</span>
                <span className="font-medium">{formatCurrency(state.monetization.subscriptionRevenue)}</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Ad Revenue</span>
                <span className="font-medium">{formatCurrency(state.monetization.adRevenue)}</span>
              </div>
              <Progress value={37} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Upgrades</span>
                <span className="font-medium">{formatCurrency(state.monetization.storageUpgrades)}</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium Upgrades</span>
                <span className="font-medium">{formatCurrency(state.monetization.premiumUpgrades)}</span>
              </div>
              <Progress value={6} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your users come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.analytics.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" style={{ 
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                    }} />
                    <span className="text-sm font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(source.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{formatPercentage(source.percentage)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Files */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Files</CardTitle>
          <CardDescription>Files generating the most revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.analytics.topPerformingFiles.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(file.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {formatNumber(file.downloads)} downloads
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {formatNumber(file.shareCount)} shares
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(file.revenue)}</p>
                  <p className="text-sm text-muted-foreground">{formatPercentage(file.conversionRate)} conversion</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device & Geographic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Revenue by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.analytics.deviceBreakdown.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                    {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                    {device.device === 'Tablet' && <Smartphone className="h-4 w-4" />}
                    <span className="text-sm font-medium">{device.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(device.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{formatPercentage(device.percentage)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Revenue by geographic location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.analytics.geographicData.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm font-medium">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(country.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(country.users)} users</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 