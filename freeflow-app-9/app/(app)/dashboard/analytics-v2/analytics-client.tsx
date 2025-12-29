'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity,
  Target, Users, DollarSign, Clock, Eye, MousePointer, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Download, RefreshCw, Settings, Plus,
  Calendar, Filter, Layers, Zap, Bell, ChevronRight, MoreVertical,
  AreaChart, Gauge, Globe, Smartphone, Monitor, Search, Play, Pause,
  FileText, Layout, Save, Share2, Trash2, Copy, Edit3, CheckCircle,
  AlertTriangle, XCircle, Hash, Percent, Timer, TrendingDown as TrendDown,
  BarChart2, Database, GitBranch, Workflow, ArrowRight, Mail, Link
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  Sparkline,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Centralized Mock Data - Investor-Ready
import {
  analyticsMetrics,
  analyticsFunnels,
  analyticsCohorts,
  analyticsReports,
  analyticsDashboards,
  analyticsAIInsights,
  analyticsCollaborators,
  analyticsPredictions,
  analyticsActivities,
  analyticsQuickActions,
  analyticsKeyMetrics,
  analyticsRealtimeMetrics,
  companyInfo,
} from '@/lib/mock-data/adapters'

// Type definitions
interface AnalyticsMetric {
  id: string
  name: string
  value: number
  previousValue: number
  changePercent: number
  category: string
  type: 'count' | 'currency' | 'percentage' | 'duration'
  status: 'up' | 'down' | 'stable'
  alertThreshold?: number
  isAlertTriggered?: boolean
}

interface FunnelStep {
  name: string
  count: number
  conversion: number
  avgTime?: string
}

interface Funnel {
  id: string
  name: string
  steps: FunnelStep[]
  totalConversion: number
  createdAt: string
  status: 'active' | 'draft'
}

interface CohortRow {
  cohort: string
  users: number
  week0: number
  week1: number
  week2: number
  week3: number
  week4: number
  week5: number
  week6: number
  week7: number
}

interface Report {
  id: string
  name: string
  type: 'scheduled' | 'one-time'
  frequency?: 'daily' | 'weekly' | 'monthly'
  lastRun: string
  status: 'active' | 'paused'
  recipients: string[]
  format: 'pdf' | 'csv' | 'excel'
}

interface DashboardWidget {
  id: string
  title: string
  type: 'chart' | 'metric' | 'table' | 'funnel'
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  metricId?: string
}

interface Dashboard {
  id: string
  name: string
  widgets: DashboardWidget[]
  isDefault: boolean
  createdAt: string
  lastViewed: string
  sharedWith: string[]
}

// Use centralized mock data - mapped to local variable names for compatibility
const mockMetrics = analyticsMetrics
const mockFunnels = analyticsFunnels
const mockCohorts = analyticsCohorts
const mockReports = analyticsReports
const mockDashboards = analyticsDashboards
const mockAIInsights = analyticsAIInsights
const mockCollaborators = analyticsCollaborators
const mockPredictions = analyticsPredictions
const mockActivities = analyticsActivities
const mockQuickActions = analyticsQuickActions

export default function AnalyticsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric | null>(null)
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null)
  const [showCreateFunnel, setShowCreateFunnel] = useState(false)
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [showCreateDashboard, setShowCreateDashboard] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [cohortType, setCohortType] = useState<'retention' | 'revenue' | 'engagement'>('retention')
  const [settingsTab, setSettingsTab] = useState('general')

  // Filter metrics
  const filteredMetrics = useMemo(() => {
    return mockMetrics.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Format value based on type
  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency': return `$${value.toLocaleString()}`
      case 'percentage': return `${value.toFixed(1)}%`
      case 'duration': return `${Math.floor(value / 60)}m ${value % 60}s`
      default: return value.toLocaleString()
    }
  }

  // Get status color
  const getStatusColor = (status: string, inverted = false) => {
    if (inverted) {
      return status === 'up' ? 'text-red-600' : status === 'down' ? 'text-emerald-600' : 'text-gray-600'
    }
    return status === 'up' ? 'text-emerald-600' : status === 'down' ? 'text-red-600' : 'text-gray-600'
  }

  // Key metrics for header cards - Using investor-ready data
  const keyMetrics = [
    { label: 'Customers', value: companyInfo.metrics.customers.toLocaleString(), change: '+7.3%', positive: true, icon: Users, gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'MRR', value: `$${(companyInfo.metrics.mrr / 1000).toFixed(0)}K`, change: '+18.5%', positive: true, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Conversion', value: '8.5%', change: '+18.1%', positive: true, icon: Target, gradient: 'from-purple-500 to-purple-600' },
    { label: 'NPS', value: companyInfo.metrics.nps.toString(), change: '+5.9%', positive: true, icon: TrendingUp, gradient: 'from-amber-500 to-amber-600' },
    { label: 'ARR', value: `$${(companyInfo.metrics.arr / 1000000).toFixed(1)}M`, change: '+312%', positive: true, icon: Eye, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Churn', value: `${companyInfo.metrics.churnRate}%`, change: '-25%', positive: true, icon: MousePointer, gradient: 'from-rose-500 to-rose-600' },
    { label: 'LTV:CAC', value: `${companyInfo.metrics.ltvCacRatio.toFixed(1)}x`, change: '+30%', positive: true, icon: Zap, gradient: 'from-cyan-500 to-cyan-600' },
    { label: 'Enterprise', value: companyInfo.metrics.enterprises.toString(), change: '+9.9%', positive: true, icon: Target, gradient: 'from-pink-500 to-pink-600' }
  ]

  // Realtime metrics - Investor demo data
  const realtimeMetrics = [
    { label: 'Active Users', value: analyticsRealtimeMetrics.activeUsersNow, icon: Users, trend: 12 },
    { label: 'Page Views/min', value: analyticsRealtimeMetrics.pageViewsPerMin, icon: Eye, trend: 8 },
    { label: 'AI Requests/min', value: analyticsRealtimeMetrics.aiRequestsPerMin, icon: Activity, trend: 15 },
    { label: 'Conversions', value: analyticsRealtimeMetrics.currentConversions, icon: ShoppingCart, trend: 2 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-10 w-10" />
                  <Badge className="bg-white/20 text-white border-0">Analytics Pro</Badge>
                  {isLive && (
                    <Badge className="bg-emerald-500/30 text-white border-0 animate-pulse">
                      <span className="h-2 w-2 bg-emerald-400 rounded-full mr-1.5 inline-block"></span>
                      Live
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-white/80">Mixpanel-level analytics • Funnels • Cohorts • Real-time • Custom Reports</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Collaboration Indicator */}
                <CollaborationIndicator
                  collaborators={mockCollaborators}
                  maxVisible={3}
                />
                <Button
                  variant={compareMode ? 'secondary' : 'ghost'}
                  onClick={() => setCompareMode(!compareMode)}
                  className={compareMode ? '' : 'bg-white/20 hover:bg-white/30 text-white border-0'}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Compare
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 8 Gradient Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.gradient}`}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs font-medium ${metric.positive ? 'text-emerald-300' : 'text-red-300'}`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="text-xl font-bold">{metric.value}</div>
                  <div className="text-xs text-white/70">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Range & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
            {['24h', '7d', '30d', '90d', '12m', 'custom'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? '' : 'text-gray-600 dark:text-gray-300'}
              >
                {range === 'custom' ? <Calendar className="h-4 w-4 mr-1" /> : null}
                {range}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border h-auto flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Gauge className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="funnels" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Workflow className="h-4 w-4 mr-2" />
              Funnels
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Cohorts
            </TabsTrigger>
            <TabsTrigger value="realtime" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Activity className="h-4 w-4 mr-2" />
              Realtime
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Layout className="h-4 w-4 mr-2" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Analytics Overview</h2>
                    <p className="text-indigo-100">Real-time insights across all metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">$285K</p>
                    <p className="text-indigo-100 text-sm">Total Revenue</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'New Metric', desc: 'Create custom', color: 'text-indigo-500' },
                { icon: Target, label: 'New Funnel', desc: 'Track conversions', color: 'text-purple-500' },
                { icon: FileText, label: 'New Report', desc: 'Schedule reports', color: 'text-pink-500' },
                { icon: Layout, label: 'Dashboard', desc: 'Create view', color: 'text-blue-500' },
                { icon: Bell, label: 'Alert', desc: 'Set threshold', color: 'text-amber-500' },
                { icon: Share2, label: 'Share', desc: 'Export data', color: 'text-green-500' },
                { icon: Activity, label: 'Live View', desc: 'Real-time', color: 'text-red-500' },
                { icon: Zap, label: 'Automate', desc: 'Set triggers', color: 'text-cyan-500' },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Traffic Overview</CardTitle>
                      <CardDescription>Visitors and page views over time</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="bg-indigo-100 text-indigo-600">
                        <LineChart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <AreaChart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 mx-auto text-indigo-400 mb-2" />
                      <p className="text-sm text-gray-500">Traffic chart visualization</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-sm text-gray-600">Visitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-gray-600">Page Views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Conversion Funnel</CardTitle>
                      <CardDescription>User journey to conversion</CardDescription>
                    </div>
                    <Button variant="link" className="text-indigo-600">
                      View Details <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockFunnels[0].steps.map((step, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{step.name}</span>
                          <span className="text-sm text-gray-500">{step.count.toLocaleString()} ({step.conversion}%)</span>
                        </div>
                        <Progress value={(step.count / mockFunnels[0].steps[0].count) * 100} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Sources & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { source: 'Organic Search', value: 42, color: 'bg-indigo-500' },
                    { source: 'Direct', value: 28, color: 'bg-purple-500' },
                    { source: 'Social Media', value: 18, color: 'bg-pink-500' },
                    { source: 'Referral', value: 8, color: 'bg-amber-500' },
                    { source: 'Email', value: 4, color: 'bg-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="flex-1 text-sm">{item.source}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { device: 'Desktop', value: 58, icon: Monitor },
                    { device: 'Mobile', value: 36, icon: Smartphone },
                    { device: 'Tablet', value: 6, icon: Smartphone }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <item.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="flex-1 text-sm">{item.device}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { page: '/dashboard', views: '12.4K' },
                    { page: '/projects', views: '8.2K' },
                    { page: '/invoices', views: '6.8K' },
                    { page: '/analytics', views: '5.1K' },
                    { page: '/settings', views: '3.9K' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600 font-mono">{item.page}</span>
                      <span className="text-sm font-medium">{item.views}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {/* Metrics Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Key Metrics</h2>
                    <p className="text-blue-100">{filteredMetrics.length} active metrics tracked</p>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search metrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMetrics.map((metric) => (
                <Card key={metric.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setSelectedMetric(metric)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">{metric.category}</Badge>
                      {metric.isAlertTriggered && (
                        <Badge variant="destructive" className="text-xs">Alert</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{metric.name}</h3>
                    <div className="flex items-end justify-between mt-4">
                      <div className="text-3xl font-bold">{formatValue(metric.value, metric.type)}</div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${getStatusColor(metric.status, metric.name.includes('Bounce') || metric.name.includes('Churn'))}`}>
                        {metric.changePercent >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Previous: {formatValue(metric.previousValue, metric.type)}</span>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 px-2">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Funnels Tab */}
          <TabsContent value="funnels" className="space-y-6">
            {/* Funnels Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Target className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Funnel Analysis</h2>
                    <p className="text-purple-100">Track user journeys and conversions</p>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowCreateFunnel(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Funnel
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Active Funnels</h2>
                <p className="text-gray-500">Track user conversion through your product</p>
              </div>
              <Button onClick={() => setShowCreateFunnel(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Funnel
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mockFunnels.map((funnel) => (
                <Card key={funnel.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedFunnel(funnel)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{funnel.name}</CardTitle>
                      <Badge variant={funnel.status === 'active' ? 'default' : 'secondary'}>{funnel.status}</Badge>
                    </div>
                    <CardDescription>Overall conversion: {funnel.totalConversion}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {funnel.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-6">{idx + 1}</div>
                          <div className="flex-1">
                            <Progress value={step.conversion} className="h-2" />
                          </div>
                          <div className="text-xs text-gray-500 w-12 text-right">{step.conversion}%</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                      <span>{funnel.steps.length} steps</span>
                      <span>Created {funnel.createdAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedFunnel && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedFunnel.name} - Detailed View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {selectedFunnel.steps.map((step, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="mx-auto mb-2 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ height: `${Math.max(60, step.conversion * 2)}px`, width: '100%' }}
                        >
                          {step.count.toLocaleString()}
                        </div>
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-gray-500">{step.conversion}% conv.</p>
                        {step.avgTime && <p className="text-xs text-indigo-600 mt-1">Avg: {step.avgTime}</p>}
                        {idx > 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            -{(selectedFunnel.steps[idx-1].count - step.count).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            {/* Cohorts Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Cohort Analysis</h2>
                    <p className="text-amber-100">Analyze user behavior over time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/20 text-white border-white/30">{cohortType}</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Retention Cohorts</h2>
                <p className="text-gray-500">Track retention by user cohorts</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={cohortType} onValueChange={(v: any) => setCohortType(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Cohort
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Retention Cohorts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">Cohort</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-gray-500">Users</th>
                        {['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'].map((week) => (
                          <th key={week} className="text-center py-3 px-2 text-sm font-medium text-gray-500">{week}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockCohorts.map((row, idx) => (
                        <tr key={idx} className="border-b dark:border-gray-700">
                          <td className="py-3 px-3 text-sm font-medium">{row.cohort}</td>
                          <td className="py-3 px-3 text-sm text-center text-gray-500">{row.users.toLocaleString()}</td>
                          {['week0', 'week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7'].map((week) => {
                            const value = row[week as keyof CohortRow] as number
                            if (value === 0) return (
                              <td key={week} className="py-3 px-2 text-center">
                                <span className="text-gray-300">—</span>
                              </td>
                            )
                            const intensity = Math.min(value / 100, 1)
                            return (
                              <td key={week} className="py-3 px-2 text-center">
                                <span
                                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `rgba(99, 102, 241, ${intensity})`,
                                    color: intensity > 0.5 ? 'white' : 'rgb(55, 48, 163)'
                                  }}
                                >
                                  {value}%
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Avg. Week 1 Retention</h4>
                  <div className="text-3xl font-bold text-indigo-600">71.9%</div>
                  <p className="text-sm text-gray-500 mt-1">+3% vs previous month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Avg. Week 4 Retention</h4>
                  <div className="text-3xl font-bold text-purple-600">37.5%</div>
                  <p className="text-sm text-gray-500 mt-1">Industry avg: 32%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Best Cohort</h4>
                  <div className="text-3xl font-bold text-emerald-600">Dec W3</div>
                  <p className="text-sm text-gray-500 mt-1">61% week 2 retention</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Total Active Users</h4>
                  <div className="text-3xl font-bold text-amber-600">12,030</div>
                  <p className="text-sm text-gray-500 mt-1">From all cohorts</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Realtime Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <h2 className="text-2xl font-bold">Real-time Analytics</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={isLive ? 'default' : 'outline'} size="sm" onClick={() => setIsLive(!isLive)}>
                  {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isLive ? 'Pause' : 'Resume'}
                </Button>
                <Badge variant="outline">
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLive ? 'animate-spin' : ''}`} />
                  {isLive ? 'Live updates' : 'Paused'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {realtimeMetrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm text-gray-500">{metric.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                      <div className={`flex items-center text-sm ${metric.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {metric.trend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {metric.trend}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Pages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { page: '/dashboard', users: 89 },
                    { page: '/projects', users: 45 },
                    { page: '/invoices', users: 32 },
                    { page: '/bookings', users: 28 },
                    { page: '/analytics', users: 21 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <span className="font-mono text-sm">{item.page}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(item.users / 89) * 100} className="w-24 h-2" />
                        <span className="text-sm font-medium w-8 text-right">{item.users}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {Array.from({ length: 12 }, (_, i) => ({
                        event: ['Page View', 'Button Click', 'Form Submit', 'Sign Up', 'Purchase'][Math.floor(Math.random() * 5)],
                        time: `${Math.floor(Math.random() * 60)}s ago`,
                        location: ['US', 'UK', 'DE', 'CA', 'AU'][Math.floor(Math.random() * 5)]
                      })).map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              event.event === 'Purchase' ? 'bg-emerald-500' :
                              event.event === 'Sign Up' ? 'bg-purple-500' :
                              'bg-indigo-500'
                            }`}></div>
                            <span className="text-sm font-medium">{event.event}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {event.location}
                            </span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto text-indigo-400 mb-2" />
                    <p className="text-sm text-gray-500">World map visualization</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { country: 'United States', percentage: 42 },
                    { country: 'United Kingdom', percentage: 18 },
                    { country: 'Germany', percentage: 12 },
                    { country: 'Canada', percentage: 10 },
                    { country: 'Australia', percentage: 8 }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-lg font-bold text-indigo-600">{item.percentage}%</div>
                      <div className="text-xs text-gray-500">{item.country}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Reports</h2>
                    <p className="text-emerald-100">Scheduled and automated reports</p>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowCreateReport(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Scheduled Reports</h2>
                <p className="text-gray-500">Scheduled and on-demand reports</p>
              </div>
              <Button onClick={() => setShowCreateReport(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>{report.status}</Badge>
                    </div>
                    <CardDescription>
                      {report.type === 'scheduled' ? `${report.frequency} report` : 'One-time report'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Format</span>
                        <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Run</span>
                        <span>{report.lastRun}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Recipients</span>
                        <span>{report.recipients.length} email(s)</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="space-y-6">
            {/* Dashboards Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layout className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Custom Dashboards</h2>
                    <p className="text-violet-100">Build personalized analytics views</p>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowCreateDashboard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Dashboard
                </Button>
              </div>
            </div>

            {/* Dashboard Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Templates</CardTitle>
                <CardDescription>Start with a pre-built dashboard template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Executive Overview', desc: 'High-level KPIs', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
                    { name: 'Marketing', desc: 'Campaign metrics', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
                    { name: 'Sales Pipeline', desc: 'Revenue tracking', icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
                    { name: 'User Engagement', desc: 'Behavior analytics', icon: Users, color: 'bg-purple-100 text-purple-600' },
                  ].map((template, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all">
                      <div className={`p-2 rounded-lg ${template.color} w-fit mb-3`}>
                        <template.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your Dashboards</h2>
                <p className="text-gray-500">Create and manage personalized dashboards</p>
              </div>
              <Button onClick={() => setShowCreateDashboard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDashboards.map((dashboard) => (
                <Card key={dashboard.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {dashboard.name}
                        {dashboard.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center mb-4">
                      <Layout className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Last viewed</span>
                        <span>{dashboard.lastViewed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Shared with</span>
                        <span>{dashboard.sharedWith.join(', ')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Analytics Settings</h2>
                    <p className="text-indigo-100">Configure tracking, privacy, and integration preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <nav className="p-2 space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'tracking', icon: Activity, label: 'Tracking', desc: 'Data collection' },
                      { id: 'privacy', icon: Eye, label: 'Privacy', desc: 'Compliance settings' },
                      { id: 'integrations', icon: Database, label: 'Integrations', desc: 'Third-party services' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs opacity-70">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>

              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Basic analytics settings and preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Analytics Name</Label>
                            <Input defaultValue="Main Analytics" className="mt-1" />
                          </div>
                          <div>
                            <Label>Time Zone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">EST</SelectItem>
                                <SelectItem value="pst">PST</SelectItem>
                                <SelectItem value="sast">SAST (South Africa)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable Analytics</Label>
                            <p className="text-sm text-gray-500">Collect user behavior data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Real-time Dashboard</Label>
                            <p className="text-sm text-gray-500">Show live data updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Default View</Label>
                            <p className="text-sm text-gray-500">Default dashboard view on load</p>
                          </div>
                          <Select defaultValue="overview">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="overview">Overview</SelectItem>
                              <SelectItem value="metrics">Metrics</SelectItem>
                              <SelectItem value="funnels">Funnels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Chart Type</Label>
                            <p className="text-sm text-gray-500">Preferred chart visualization</p>
                          </div>
                          <Select defaultValue="line">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="line">Line Chart</SelectItem>
                              <SelectItem value="bar">Bar Chart</SelectItem>
                              <SelectItem value="area">Area Chart</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Tracking Settings */}
                {settingsTab === 'tracking' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Collection</CardTitle>
                        <CardDescription>Configure how analytics data is collected</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Session Recording</Label>
                            <p className="text-sm text-gray-500">Record user sessions for playback</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Heatmaps</Label>
                            <p className="text-sm text-gray-500">Track click and scroll patterns</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Error Tracking</Label>
                            <p className="text-sm text-gray-500">Capture JavaScript errors</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Form Analytics</Label>
                            <p className="text-sm text-gray-500">Track form submissions and abandonment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Tracking Code</CardTitle>
                        <CardDescription>Add this code to your website to enable tracking</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <pre>{`<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://analytics.kazi.app/track.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','kaziLayer','KAZI-XXXXXXXX');
</script>`}</pre>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Email to Developer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Privacy Settings */}
                {settingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy & Compliance</CardTitle>
                        <CardDescription>Manage data privacy and regulatory compliance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>IP Anonymization</Label>
                            <p className="text-sm text-gray-500">Mask user IP addresses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Cookie Consent</Label>
                            <p className="text-sm text-gray-500">Require consent before tracking</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>GDPR Mode</Label>
                            <p className="text-sm text-gray-500">Enable GDPR compliance features</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Do Not Track</Label>
                            <p className="text-sm text-gray-500">Respect DNT browser settings</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Retention Period</Label>
                            <p className="text-sm text-gray-500">How long to keep analytics data</p>
                          </div>
                          <Select defaultValue="12">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 months</SelectItem>
                              <SelectItem value="6">6 months</SelectItem>
                              <SelectItem value="12">12 months</SelectItem>
                              <SelectItem value="24">24 months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-delete Old Data</Label>
                            <p className="text-sm text-gray-500">Automatically purge expired data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Manage third-party analytics integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Google Analytics', connected: true, icon: BarChart3 },
                          { name: 'Mixpanel', connected: true, icon: PieChart },
                          { name: 'Segment', connected: false, icon: Layers },
                          { name: 'Amplitude', connected: false, icon: LineChart },
                          { name: 'Hotjar', connected: true, icon: MousePointer },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <integration.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-xs text-gray-500">{integration.connected ? 'Connected' : 'Not connected'}</p>
                              </div>
                            </div>
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                              {integration.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input value="ak_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline">Regenerate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Enable API Access</Label>
                            <p className="text-sm text-gray-500">Allow programmatic data access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Channels</CardTitle>
                        <CardDescription>Configure where to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Email Alerts</Label>
                            <p className="text-sm text-gray-500">Receive alerts via email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Slack Notifications</Label>
                            <p className="text-sm text-gray-500">Send alerts to Slack</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>SMS Alerts</Label>
                            <p className="text-sm text-gray-500">Critical alerts via SMS</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>In-app Notifications</Label>
                            <p className="text-sm text-gray-500">Show alerts in dashboard</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Alerts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Anomaly Detection</Label>
                            <p className="text-sm text-gray-500">AI-powered anomaly alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Trend Predictions</Label>
                            <p className="text-sm text-gray-500">Alert on predicted trend changes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance</CardTitle>
                        <CardDescription>Optimize analytics performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Sampling Rate</Label>
                            <p className="text-sm text-gray-500">Percentage of traffic to track</p>
                          </div>
                          <Select defaultValue="100">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100%</SelectItem>
                              <SelectItem value="75">75%</SelectItem>
                              <SelectItem value="50">50%</SelectItem>
                              <SelectItem value="25">25%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Batch Uploads</Label>
                            <p className="text-sm text-gray-500">Queue events before sending</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Debug Mode</Label>
                            <p className="text-sm text-gray-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Export All Data</Label>
                            <p className="text-sm text-gray-500">Download complete analytics data</p>
                          </div>
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Scheduled Exports</Label>
                            <p className="text-sm text-gray-500">Automatic data exports</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Custom Events</CardTitle>
                        <CardDescription>Configure custom event tracking</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Custom Event Tracking</Label>
                            <p className="text-sm text-gray-500">Enable custom event collection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Event Validation</Label>
                            <p className="text-sm text-gray-500">Validate events before storage</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Auto-capture Events</Label>
                            <p className="text-sm text-gray-500">Automatically track common events</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Event Schema</Label>
                            <p className="text-sm text-gray-500">Define event structure</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>User Identification</CardTitle>
                        <CardDescription>Configure user tracking settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Cross-device Tracking</Label>
                            <p className="text-sm text-gray-500">Track users across devices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <Label>Session Stitching</Label>
                            <p className="text-sm text-gray-500">Combine anonymous and identified sessions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Identity Resolution</Label>
                            <p className="text-sm text-gray-500">Advanced user matching</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700">Premium</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Reset All Data</Label>
                            <p className="text-sm text-gray-500">Permanently delete all analytics</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Reset Data</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Delete Tracking Code</Label>
                            <p className="text-sm text-gray-500">Remove tracking from all sites</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Delete</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Revoke All API Keys</Label>
                            <p className="text-sm text-gray-500">Invalidate all existing keys</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Revoke</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Metric Detail Modal */}
        {selectedMetric && (
          <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedMetric.name}
                  <Badge variant="outline">{selectedMetric.category}</Badge>
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="correlations">Correlations</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Current Value</div>
                      <div className="text-2xl font-bold">{formatValue(selectedMetric.value, selectedMetric.type)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Change</div>
                      <div className={`text-2xl font-bold ${getStatusColor(selectedMetric.status)}`}>
                        {selectedMetric.changePercent >= 0 ? '+' : ''}{selectedMetric.changePercent.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Previous</div>
                      <div className="text-2xl font-bold">{formatValue(selectedMetric.previousValue, selectedMetric.type)}</div>
                    </div>
                  </div>
                  <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Trend visualization</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <div className="space-y-2">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">{new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        <span className="font-medium">{formatValue(selectedMetric.value * (1 + (Math.random() - 0.5) * 0.2), selectedMetric.type)}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="alerts" className="mt-4">
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No alerts configured for this metric</p>
                    <Button className="mt-3">Set Up Alert</Button>
                  </div>
                </TabsContent>
                <TabsContent value="correlations" className="mt-4">
                  <div className="space-y-3">
                    {mockMetrics.slice(0, 4).filter(m => m.id !== selectedMetric.id).map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="font-medium">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Correlation:</span>
                          <Badge variant="outline">{(0.3 + Math.random() * 0.6).toFixed(2)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}

        {/* AI-Powered Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AIInsightsPanel
            insights={mockAIInsights}
            onAskQuestion={(q) => console.log('Question:', q)}
          />
          <PredictiveAnalytics predictions={mockPredictions} />
        </div>

        {/* Activity Feed */}
        <div className="mt-6">
          <ActivityFeed
            activities={mockActivities}
            maxItems={5}
            showFilters={true}
          />
        </div>

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar actions={mockQuickActions} />
      </div>
    </div>
  )
}
