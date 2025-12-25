'use client'
import { useState, useMemo } from 'react'
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

// Mock data
const mockMetrics: AnalyticsMetric[] = [
  { id: '1', name: 'Total Users', value: 24892, previousValue: 22134, changePercent: 12.5, category: 'Users', type: 'count', status: 'up' },
  { id: '2', name: 'Monthly Revenue', value: 148320, previousValue: 137100, changePercent: 8.2, category: 'Revenue', type: 'currency', status: 'up' },
  { id: '3', name: 'Conversion Rate', value: 3.24, previousValue: 2.98, changePercent: 8.7, category: 'Conversion', type: 'percentage', status: 'up' },
  { id: '4', name: 'Avg. Session Duration', value: 272, previousValue: 287, changePercent: -5.2, category: 'Engagement', type: 'duration', status: 'down' },
  { id: '5', name: 'Page Views', value: 892000, previousValue: 774000, changePercent: 15.3, category: 'Traffic', type: 'count', status: 'up' },
  { id: '6', name: 'Bounce Rate', value: 38.2, previousValue: 39.1, changePercent: -2.3, category: 'Engagement', type: 'percentage', status: 'up' },
  { id: '7', name: 'Active Subscriptions', value: 3847, previousValue: 3512, changePercent: 9.5, category: 'Subscriptions', type: 'count', status: 'up' },
  { id: '8', name: 'Churn Rate', value: 2.1, previousValue: 2.8, changePercent: -25.0, category: 'Retention', type: 'percentage', status: 'up' },
  { id: '9', name: 'CAC', value: 45.20, previousValue: 52.30, changePercent: -13.6, category: 'Acquisition', type: 'currency', status: 'up' },
  { id: '10', name: 'LTV', value: 847, previousValue: 792, changePercent: 6.9, category: 'Value', type: 'currency', status: 'up' },
  { id: '11', name: 'NPS Score', value: 72, previousValue: 68, changePercent: 5.9, category: 'Satisfaction', type: 'count', status: 'up' },
  { id: '12', name: 'Support Tickets', value: 234, previousValue: 289, changePercent: -19.0, category: 'Support', type: 'count', status: 'up' }
]

const mockFunnels: Funnel[] = [
  {
    id: '1',
    name: 'Signup to Conversion',
    steps: [
      { name: 'Landing Page', count: 10000, conversion: 100, avgTime: '0s' },
      { name: 'Signup Started', count: 3500, conversion: 35, avgTime: '45s' },
      { name: 'Signup Completed', count: 2100, conversion: 60, avgTime: '2m' },
      { name: 'First Action', count: 1400, conversion: 67, avgTime: '5m' },
      { name: 'Converted', count: 840, conversion: 60, avgTime: '2d' }
    ],
    totalConversion: 8.4,
    createdAt: '2024-11-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Product Purchase',
    steps: [
      { name: 'Product View', count: 8500, conversion: 100, avgTime: '0s' },
      { name: 'Add to Cart', count: 2890, conversion: 34, avgTime: '1m' },
      { name: 'Checkout Started', count: 1734, conversion: 60, avgTime: '3m' },
      { name: 'Payment Completed', count: 1127, conversion: 65, avgTime: '2m' }
    ],
    totalConversion: 13.3,
    createdAt: '2024-12-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Onboarding Flow',
    steps: [
      { name: 'Welcome Screen', count: 5000, conversion: 100, avgTime: '0s' },
      { name: 'Profile Setup', count: 4250, conversion: 85, avgTime: '2m' },
      { name: 'Feature Tour', count: 3400, conversion: 80, avgTime: '5m' },
      { name: 'First Project', count: 2720, conversion: 80, avgTime: '10m' },
      { name: 'Invite Team', count: 1632, conversion: 60, avgTime: '1d' }
    ],
    totalConversion: 32.6,
    createdAt: '2024-12-10',
    status: 'active'
  }
]

const mockCohorts: CohortRow[] = [
  { cohort: 'Dec Week 1', users: 1250, week0: 100, week1: 72, week2: 58, week3: 45, week4: 38, week5: 32, week6: 28, week7: 25 },
  { cohort: 'Dec Week 2', users: 1180, week0: 100, week1: 68, week2: 52, week3: 41, week4: 35, week5: 30, week6: 26, week7: 0 },
  { cohort: 'Dec Week 3', users: 1340, week0: 100, week1: 75, week2: 61, week3: 48, week4: 42, week5: 36, week6: 0, week7: 0 },
  { cohort: 'Dec Week 4', users: 1420, week0: 100, week1: 70, week2: 55, week3: 43, week4: 37, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Jan Week 1', users: 1580, week0: 100, week1: 73, week2: 59, week3: 46, week4: 0, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Jan Week 2', users: 1650, week0: 100, week1: 71, week2: 56, week3: 0, week4: 0, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Jan Week 3', users: 1720, week0: 100, week1: 74, week2: 0, week3: 0, week4: 0, week5: 0, week6: 0, week7: 0 },
  { cohort: 'Jan Week 4', users: 1890, week0: 100, week1: 0, week2: 0, week3: 0, week4: 0, week5: 0, week6: 0, week7: 0 }
]

const mockReports: Report[] = [
  { id: '1', name: 'Weekly Executive Summary', type: 'scheduled', frequency: 'weekly', lastRun: '2025-01-20', status: 'active', recipients: ['ceo@company.com', 'cto@company.com'], format: 'pdf' },
  { id: '2', name: 'Monthly Revenue Report', type: 'scheduled', frequency: 'monthly', lastRun: '2025-01-01', status: 'active', recipients: ['finance@company.com'], format: 'excel' },
  { id: '3', name: 'Daily Metrics Digest', type: 'scheduled', frequency: 'daily', lastRun: '2025-01-25', status: 'active', recipients: ['team@company.com'], format: 'pdf' },
  { id: '4', name: 'Q4 Performance Analysis', type: 'one-time', lastRun: '2025-01-15', status: 'paused', recipients: ['board@company.com'], format: 'pdf' },
  { id: '5', name: 'User Acquisition Report', type: 'scheduled', frequency: 'weekly', lastRun: '2025-01-22', status: 'active', recipients: ['marketing@company.com'], format: 'csv' }
]

const mockDashboards: Dashboard[] = [
  { id: '1', name: 'Executive Overview', widgets: [], isDefault: true, createdAt: '2024-10-01', lastViewed: '2025-01-25', sharedWith: ['team'] },
  { id: '2', name: 'Marketing Performance', widgets: [], isDefault: false, createdAt: '2024-11-15', lastViewed: '2025-01-24', sharedWith: ['marketing'] },
  { id: '3', name: 'Sales Pipeline', widgets: [], isDefault: false, createdAt: '2024-12-01', lastViewed: '2025-01-23', sharedWith: ['sales'] },
  { id: '4', name: 'Product Analytics', widgets: [], isDefault: false, createdAt: '2024-12-10', lastViewed: '2025-01-22', sharedWith: ['product'] },
  { id: '5', name: 'Customer Success', widgets: [], isDefault: false, createdAt: '2024-12-20', lastViewed: '2025-01-21', sharedWith: ['support'] }
]

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

  // Key metrics for header cards
  const keyMetrics = [
    { label: 'Total Users', value: '24,892', change: '+12.5%', positive: true, icon: Users, gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'Revenue', value: '$148.3K', change: '+8.2%', positive: true, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Conversion', value: '3.24%', change: '+0.26%', positive: true, icon: Target, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Avg Session', value: '4m 32s', change: '-5.2%', positive: false, icon: Clock, gradient: 'from-amber-500 to-amber-600' },
    { label: 'Page Views', value: '892K', change: '+15.3%', positive: true, icon: Eye, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Bounce Rate', value: '38.2%', change: '-2.3%', positive: true, icon: MousePointer, gradient: 'from-rose-500 to-rose-600' },
    { label: 'Active Subs', value: '3,847', change: '+9.5%', positive: true, icon: Zap, gradient: 'from-cyan-500 to-cyan-600' },
    { label: 'NPS Score', value: '72', change: '+5.9%', positive: true, icon: TrendingUp, gradient: 'from-pink-500 to-pink-600' }
  ]

  // Realtime metrics
  const realtimeMetrics = [
    { label: 'Active Users', value: 247, icon: Users, trend: 12 },
    { label: 'Page Views/min', value: 89, icon: Eye, trend: -3 },
    { label: 'Events/min', value: 156, icon: Activity, trend: 8 },
    { label: 'Conversions', value: 12, icon: ShoppingCart, trend: 2 }
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Funnel Analysis</h2>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cohort Analysis</h2>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Reports</h2>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Custom Dashboards</h2>
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
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Analytics Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Collection</CardTitle>
                  <CardDescription>Configure how analytics data is collected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Analytics</Label>
                      <p className="text-sm text-gray-500">Collect user behavior data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Recording</Label>
                      <p className="text-sm text-gray-500">Record user sessions for playback</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Heatmaps</Label>
                      <p className="text-sm text-gray-500">Track click and scroll patterns</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Error Tracking</Label>
                      <p className="text-sm text-gray-500">Capture JavaScript errors</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Compliance</CardTitle>
                  <CardDescription>Manage data privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Anonymization</Label>
                      <p className="text-sm text-gray-500">Mask user IP addresses</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cookie Consent</Label>
                      <p className="text-sm text-gray-500">Require consent before tracking</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Retention</Label>
                      <p className="text-sm text-gray-500">How long to keep data</p>
                    </div>
                    <Select defaultValue="12">
                      <SelectTrigger className="w-[120px]">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect with third-party services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Google Analytics', connected: true },
                    { name: 'Mixpanel', connected: true },
                    { name: 'Segment', connected: false },
                    { name: 'Amplitude', connected: false }
                  ].map((integration, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <Database className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{integration.name}</span>
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
                  <CardTitle>Alerts & Notifications</CardTitle>
                  <CardDescription>Configure when to receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-gray-500">Receive alerts via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Slack Notifications</Label>
                      <p className="text-sm text-gray-500">Send alerts to Slack</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Anomaly Detection</Label>
                      <p className="text-sm text-gray-500">AI-powered anomaly alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

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
      </div>
    </div>
  )
}
