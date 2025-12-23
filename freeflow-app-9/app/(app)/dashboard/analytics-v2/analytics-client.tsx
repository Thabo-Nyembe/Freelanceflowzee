'use client'
import { useState, useMemo } from 'react'
import { useAnalytics, type AnalyticsRecord, type MetricType, type PeriodType } from '@/lib/hooks/use-analytics'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity,
  Target, Users, DollarSign, Clock, Eye, MousePointer, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Download, RefreshCw, Settings, Plus,
  Calendar, Filter, Layers, Zap, Bell, ChevronRight, MoreVertical,
  AreaChart, Gauge, Globe, Smartphone, Monitor, Search
} from 'lucide-react'

// Chart types for visualization
type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'funnel' | 'cohort'
type TimeRange = '24h' | '7d' | '30d' | '90d' | '12m' | 'custom'

// Dashboard widget type
interface DashboardWidget {
  id: string
  title: string
  type: ChartType
  metricId: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
}

// Funnel step type
interface FunnelStep {
  name: string
  count: number
  conversion: number
}

// Cohort data type
interface CohortData {
  cohort: string
  week0: number
  week1: number
  week2: number
  week3: number
  week4: number
}

export default function AnalyticsClient({ initialAnalytics }: { initialAnalytics: AnalyticsRecord[] }) {
  const [metricTypeFilter, setMetricTypeFilter] = useState<MetricType | 'all'>('all')
  const [periodTypeFilter, setPeriodTypeFilter] = useState<PeriodType | 'all'>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [view, setView] = useState<'overview' | 'metrics' | 'funnels' | 'cohorts' | 'realtime'>('overview')
  const [showCreateDashboard, setShowCreateDashboard] = useState(false)
  const [showAlertConfig, setShowAlertConfig] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsRecord | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { analytics, loading, error } = useAnalytics({ metricType: metricTypeFilter, periodType: periodTypeFilter })
  const displayAnalytics = (analytics && analytics.length > 0) ? analytics : (initialAnalytics || [])

  // Comprehensive stats
  const stats = useMemo(() => {
    const metrics = displayAnalytics
    const activeMetrics = metrics.filter(m => m.status === 'active')
    const alertsTriggered = metrics.filter(m => m.is_alert_triggered)
    const totalValue = metrics.reduce((sum, m) => sum + m.value, 0)
    const avgValue = metrics.length > 0 ? totalValue / metrics.length : 0
    const positiveChange = metrics.filter(m => (m.change_percent || 0) > 0).length
    const negativeChange = metrics.filter(m => (m.change_percent || 0) < 0).length

    return {
      totalMetrics: metrics.length,
      activeMetrics: activeMetrics.length,
      alertsTriggered: alertsTriggered.length,
      avgValue: avgValue,
      totalValue: totalValue,
      positiveChange,
      negativeChange,
      changeRate: metrics.length > 0 ? ((positiveChange / metrics.length) * 100).toFixed(1) : '0'
    }
  }, [displayAnalytics])

  // Sample funnel data
  const funnelData: FunnelStep[] = [
    { name: 'Page Views', count: 10000, conversion: 100 },
    { name: 'Sign Up Started', count: 3500, conversion: 35 },
    { name: 'Sign Up Completed', count: 2100, conversion: 60 },
    { name: 'First Action', count: 1400, conversion: 67 },
    { name: 'Converted', count: 840, conversion: 60 }
  ]

  // Sample cohort data
  const cohortData: CohortData[] = [
    { cohort: 'Dec Week 1', week0: 100, week1: 72, week2: 58, week3: 45, week4: 38 },
    { cohort: 'Dec Week 2', week0: 100, week1: 68, week2: 52, week3: 41, week4: 0 },
    { cohort: 'Dec Week 3', week0: 100, week1: 75, week2: 61, week3: 0, week4: 0 },
    { cohort: 'Dec Week 4', week0: 100, week1: 70, week2: 0, week3: 0, week4: 0 },
    { cohort: 'Jan Week 1', week0: 100, week1: 0, week2: 0, week3: 0, week4: 0 }
  ]

  // Key metrics cards data
  const keyMetrics = [
    { label: 'Total Users', value: '24,892', change: '+12.5%', positive: true, icon: Users, color: 'indigo' },
    { label: 'Revenue', value: '$148,320', change: '+8.2%', positive: true, icon: DollarSign, color: 'emerald' },
    { label: 'Conversion Rate', value: '3.24%', change: '+0.8%', positive: true, icon: Target, color: 'purple' },
    { label: 'Avg Session', value: '4m 32s', change: '-5.1%', positive: false, icon: Clock, color: 'amber' },
    { label: 'Page Views', value: '892K', change: '+15.3%', positive: true, icon: Eye, color: 'blue' },
    { label: 'Bounce Rate', value: '38.2%', change: '-2.4%', positive: true, icon: MousePointer, color: 'rose' }
  ]

  // Real-time metrics simulation
  const realtimeMetrics = [
    { label: 'Active Users', value: 247, icon: Users },
    { label: 'Page Views/min', value: 89, icon: Eye },
    { label: 'Events/min', value: 156, icon: Activity },
    { label: 'Conversions', value: 12, icon: ShoppingCart }
  ]

  // Filter analytics by search
  const filteredAnalytics = useMemo(() => {
    return displayAnalytics.filter(a => {
      const matchesSearch = !searchQuery ||
        a.metric_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = metricTypeFilter === 'all' || a.metric_type === metricTypeFilter
      const matchesPeriod = periodTypeFilter === 'all' || a.period_type === periodTypeFilter
      return matchesSearch && matchesType && matchesPeriod
    })
  }, [displayAnalytics, searchQuery, metricTypeFilter, periodTypeFilter])

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-8 w-8" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Analytics Pro
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    Live Data
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-white/80">
                  Mixpanel-level insights • Funnels • Cohorts • Real-time tracking
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    compareMode ? 'bg-white text-indigo-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  Compare Periods
                </button>
                <Dialog open={showAlertConfig} onOpenChange={setShowAlertConfig}>
                  <DialogTrigger asChild>
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                      <Bell className="h-5 w-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Alert Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Active Alerts</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium">Conversion Rate Drop</p>
                              <p className="text-sm text-gray-500">Alert when conversion drops below 2%</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium">Traffic Spike</p>
                              <p className="text-sm text-gray-500">Alert when traffic increases 50%+</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-all">
                        + Add New Alert
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range & View Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
            {(['overview', 'metrics', 'funnels', 'cohorts', 'realtime'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
              {(['24h', '7d', '30d', '90d', '12m'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Overview View */}
        {view === 'overview' && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                      <metric.icon className={`h-4 w-4 text-${metric.color}-600`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      metric.positive ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {metric.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {metric.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Traffic Overview</h3>
                    <p className="text-sm text-gray-500">Visitors and page views over time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
                      <LineChart className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <AreaChart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Chart Placeholder - In production, use Recharts/Chart.js */}
                <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
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
              </div>

              {/* Conversion Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Conversion Funnel</h3>
                    <p className="text-sm text-gray-500">User journey to conversion</p>
                  </div>
                  <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
                    View Details <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {funnelData.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm text-gray-500">{step.count.toLocaleString()} ({step.conversion}%)</span>
                      </div>
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transition-all"
                          style={{ width: `${(step.count / funnelData[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic Sources & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Sources */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
                <div className="space-y-4">
                  {[
                    { source: 'Organic Search', value: 42, color: 'indigo' },
                    { source: 'Direct', value: 28, color: 'purple' },
                    { source: 'Social Media', value: 18, color: 'pink' },
                    { source: 'Referral', value: 8, color: 'amber' },
                    { source: 'Email', value: 4, color: 'emerald' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                      <span className="flex-1 text-sm">{item.source}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { device: 'Desktop', value: 58, icon: Monitor },
                    { device: 'Mobile', value: 36, icon: Smartphone },
                    { device: 'Tablet', value: 6, icon: Smartphone }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <item.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="flex-1 text-sm">{item.device}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
                <div className="space-y-3">
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
                </div>
              </div>
            </div>
          </>
        )}

        {/* Metrics View */}
        {view === 'metrics' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search metrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <select
                  value={metricTypeFilter}
                  onChange={(e) => setMetricTypeFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Types</option>
                  <option value="count">Count</option>
                  <option value="average">Average</option>
                  <option value="percentage">Percentage</option>
                </select>
                <select
                  value={periodTypeFilter}
                  onChange={(e) => setPeriodTypeFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Periods</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button className="px-4 py-2 flex items-center gap-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Filter className="h-4 w-4" />
                  More Filters
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Metrics</div>
                <div className="text-3xl font-bold text-indigo-600">{stats.totalMetrics}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</div>
                <div className="text-3xl font-bold text-emerald-600">{stats.activeMetrics}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alerts</div>
                <div className="text-3xl font-bold text-red-600">{stats.alertsTriggered}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trending Up</div>
                <div className="text-3xl font-bold text-purple-600">{stats.changeRate}%</div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              </div>
            )}

            {/* Metrics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnalytics.map(analytic => {
                const changePercent = analytic.change_percent || 0
                const isPositive = changePercent >= 0

                return (
                  <div
                    key={analytic.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border cursor-pointer group"
                    onClick={() => setSelectedMetric(analytic)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          analytic.metric_type === 'count' ? 'bg-indigo-100 text-indigo-600' :
                          analytic.metric_type === 'average' ? 'bg-purple-100 text-purple-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {analytic.metric_type === 'count' ? <BarChart3 className="h-4 w-4" /> :
                           analytic.metric_type === 'average' ? <Gauge className="h-4 w-4" /> :
                           <TrendingUp className="h-4 w-4" />}
                        </div>
                        {analytic.is_alert_triggered && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Alert</span>
                        )}
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{analytic.metric_name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{analytic.category}</p>

                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analytic.metric_type === 'percentage' ? `${analytic.value.toFixed(1)}%` : analytic.value.toFixed(2)}
                      </div>
                      {changePercent !== 0 && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
                      <span>{analytic.period_type}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        analytic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {analytic.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Funnels View */}
        {view === 'funnels' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Funnel Analysis</h2>
                <p className="text-gray-500">Track user conversion through your product</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Funnel
              </button>
            </div>

            {/* Main Funnel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Signup to Conversion</h3>
                  <p className="text-sm text-gray-500">Overall conversion: 8.4%</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {funnelData.map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="mx-auto mb-2 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{
                        height: `${Math.max(60, (step.count / funnelData[0].count) * 200)}px`,
                        width: '100%'
                      }}
                    >
                      {step.count.toLocaleString()}
                    </div>
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.conversion}% conv.</p>
                    {idx > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        -{(funnelData[idx-1].count - step.count).toLocaleString()} dropped
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Drop-off Analysis</h3>
                <div className="space-y-3">
                  {[
                    { step: 'Sign Up Started → Completed', dropoff: 40, reason: 'Form complexity' },
                    { step: 'Completed → First Action', dropoff: 33, reason: 'Onboarding friction' },
                    { step: 'First Action → Converted', dropoff: 40, reason: 'Value not clear' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{item.step}</span>
                        <span className="text-red-600 font-medium">{item.dropoff}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Likely cause: {item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Optimization Tips</h3>
                <div className="space-y-3">
                  {[
                    { tip: 'Simplify signup form', impact: 'High', effort: 'Low' },
                    { tip: 'Add progress indicator', impact: 'Medium', effort: 'Low' },
                    { tip: 'Improve onboarding flow', impact: 'High', effort: 'Medium' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm">{item.tip}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.impact === 'High' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.impact} impact
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          item.effort === 'Low' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.effort} effort
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cohorts View */}
        {view === 'cohorts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cohort Analysis</h2>
                <p className="text-gray-500">Track retention by user cohorts</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Cohort
              </button>
            </div>

            {/* Cohort Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4">Weekly Retention</h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Cohort</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Week 0</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Week 1</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Week 2</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Week 3</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Week 4</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((row, idx) => (
                    <tr key={idx} className="border-t dark:border-gray-700">
                      <td className="py-3 px-3 text-sm font-medium">{row.cohort}</td>
                      {['week0', 'week1', 'week2', 'week3', 'week4'].map((week) => {
                        const value = row[week as keyof CohortData] as number
                        if (value === 0) return (
                          <td key={week} className="py-3 px-3 text-center">
                            <span className="text-gray-300">—</span>
                          </td>
                        )
                        const intensity = Math.min(value / 100, 1)
                        return (
                          <td key={week} className="py-3 px-3 text-center">
                            <span
                              className="inline-block px-3 py-1 rounded text-sm font-medium"
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

            {/* Cohort Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h4 className="font-semibold mb-2">Avg. Week 1 Retention</h4>
                <div className="text-3xl font-bold text-indigo-600">71%</div>
                <p className="text-sm text-gray-500 mt-1">+3% vs previous month</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h4 className="font-semibold mb-2">Avg. Week 4 Retention</h4>
                <div className="text-3xl font-bold text-purple-600">38%</div>
                <p className="text-sm text-gray-500 mt-1">Industry avg: 32%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h4 className="font-semibold mb-2">Best Performing Cohort</h4>
                <div className="text-3xl font-bold text-emerald-600">Dec W3</div>
                <p className="text-sm text-gray-500 mt-1">61% week 2 retention</p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time View */}
        {view === 'realtime' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold">Real-time Analytics</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Live updates
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {realtimeMetrics.map((metric, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm text-gray-500">{metric.label}</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            {/* Live Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Active Pages</h3>
                <div className="space-y-3">
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
                        <div className="h-2 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(item.users / 89) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{item.users}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Live Events</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {Array.from({ length: 12 }, (_, i) => ({
                      event: ['Page View', 'Button Click', 'Form Submit', 'Sign Up', 'Purchase'][Math.floor(Math.random() * 5)],
                      time: `${Math.floor(Math.random() * 60)}s ago`,
                      location: ['US', 'UK', 'DE', 'CA', 'AU'][Math.floor(Math.random() * 5)]
                    })).map((event, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
              <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-12 w-12 mx-auto text-indigo-400 mb-2" />
                  <p className="text-sm text-gray-500">World map visualization</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 mt-4">
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
            </div>
          </div>
        )}

        {/* Metric Detail Modal */}
        {selectedMetric && (
          <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedMetric.metric_name}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Current Value</div>
                      <div className="text-2xl font-bold">{selectedMetric.value.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Change</div>
                      <div className={`text-2xl font-bold ${(selectedMetric.change_percent || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {(selectedMetric.change_percent || 0) >= 0 ? '+' : ''}{(selectedMetric.change_percent || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Period</div>
                      <div className="text-2xl font-bold capitalize">{selectedMetric.period_type}</div>
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
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm">{new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        <span className="font-medium">{(selectedMetric.value * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="alerts" className="mt-4">
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No alerts configured for this metric</p>
                    <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                      Set Up Alert
                    </button>
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
