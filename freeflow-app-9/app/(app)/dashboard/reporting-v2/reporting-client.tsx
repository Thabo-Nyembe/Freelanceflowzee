'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Share2,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Calendar,
  Clock,
  Search,
  Filter,
  LayoutDashboard,
  Database,
  Table,
  Layers,
  Play,
  Pause,
  ChevronRight,
  MoreVertical,
  Grid3X3,
  Map,
  Gauge,
  Target,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  Move,
  Lock,
  Unlock,
  Star,
  StarOff,
  FolderOpen,
  Link,
  ExternalLink,
  Code,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Bell,
  Zap,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart2,
  TrendingUp as TrendUp,
  ArrowRight,
  Bookmark,
  History,
  FileBarChart,
  PieChart as PieChartIcon,
  AreaChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'table' | 'kpi' | 'map'
type DataSourceType = 'postgresql' | 'mysql' | 'mongodb' | 'csv' | 'api' | 'snowflake' | 'bigquery'

interface Dashboard {
  id: string
  name: string
  description: string
  thumbnail: string
  widgets: Widget[]
  createdAt: string
  updatedAt: string
  author: string
  views: number
  favorites: number
  isFavorite: boolean
  isPublished: boolean
  tags: string[]
}

interface Widget {
  id: string
  type: ChartType
  title: string
  dataSource: string
  metrics: string[]
  dimensions: string[]
  filters: WidgetFilter[]
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, unknown>
}

interface WidgetFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in'
  value: string | number | string[]
}

interface Worksheet {
  id: string
  name: string
  chartType: ChartType
  dataSource: string
  metrics: string[]
  dimensions: string[]
  filters: WidgetFilter[]
  lastModified: string
  author: string
}

interface DataSource {
  id: string
  name: string
  type: DataSourceType
  host: string
  database: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  tables: number
  rowCount: number
}

interface ScheduledReport {
  id: string
  name: string
  dashboard: string
  schedule: 'daily' | 'weekly' | 'monthly'
  nextRun: string
  lastRun: string | null
  recipients: string[]
  format: 'pdf' | 'xlsx' | 'png'
  enabled: boolean
}

// Mock Data
const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Executive Summary',
    description: 'High-level business metrics and KPIs for leadership team',
    thumbnail: '/dashboards/executive.png',
    widgets: [],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-23T14:30:00Z',
    author: 'John Smith',
    views: 1842,
    favorites: 45,
    isFavorite: true,
    isPublished: true,
    tags: ['executive', 'kpi', 'monthly']
  },
  {
    id: '2',
    name: 'Sales Performance',
    description: 'Pipeline analysis, conversion rates, and revenue tracking',
    thumbnail: '/dashboards/sales.png',
    widgets: [],
    createdAt: '2024-12-05T09:00:00Z',
    updatedAt: '2024-12-22T11:45:00Z',
    author: 'Sarah Chen',
    views: 956,
    favorites: 32,
    isFavorite: true,
    isPublished: true,
    tags: ['sales', 'pipeline', 'revenue']
  },
  {
    id: '3',
    name: 'Marketing Analytics',
    description: 'Campaign performance, lead generation, and attribution',
    thumbnail: '/dashboards/marketing.png',
    widgets: [],
    createdAt: '2024-12-10T15:00:00Z',
    updatedAt: '2024-12-21T16:20:00Z',
    author: 'Mike Johnson',
    views: 723,
    favorites: 28,
    isFavorite: false,
    isPublished: true,
    tags: ['marketing', 'campaigns', 'leads']
  },
  {
    id: '4',
    name: 'Customer Success',
    description: 'Retention metrics, NPS scores, and customer health',
    thumbnail: '/dashboards/cs.png',
    widgets: [],
    createdAt: '2024-12-12T14:00:00Z',
    updatedAt: '2024-12-20T10:15:00Z',
    author: 'Emily Davis',
    views: 542,
    favorites: 19,
    isFavorite: false,
    isPublished: true,
    tags: ['customer', 'retention', 'nps']
  },
  {
    id: '5',
    name: 'Product Analytics',
    description: 'Feature usage, user engagement, and product metrics',
    thumbnail: '/dashboards/product.png',
    widgets: [],
    createdAt: '2024-12-15T11:00:00Z',
    updatedAt: '2024-12-19T09:30:00Z',
    author: 'Alex Turner',
    views: 389,
    favorites: 15,
    isFavorite: false,
    isPublished: false,
    tags: ['product', 'engagement', 'features']
  }
]

const mockWorksheets: Worksheet[] = [
  {
    id: '1',
    name: 'Revenue by Region',
    chartType: 'bar',
    dataSource: 'Sales Database',
    metrics: ['revenue', 'orders'],
    dimensions: ['region', 'quarter'],
    filters: [],
    lastModified: '2024-12-23T10:00:00Z',
    author: 'John Smith'
  },
  {
    id: '2',
    name: 'User Growth Trend',
    chartType: 'line',
    dataSource: 'Analytics DB',
    metrics: ['users', 'growth_rate'],
    dimensions: ['date'],
    filters: [],
    lastModified: '2024-12-22T15:30:00Z',
    author: 'Sarah Chen'
  },
  {
    id: '3',
    name: 'Market Share',
    chartType: 'pie',
    dataSource: 'Sales Database',
    metrics: ['revenue_share'],
    dimensions: ['product_category'],
    filters: [],
    lastModified: '2024-12-21T09:45:00Z',
    author: 'Mike Johnson'
  },
  {
    id: '4',
    name: 'Conversion Funnel',
    chartType: 'bar',
    dataSource: 'Analytics DB',
    metrics: ['conversion_rate'],
    dimensions: ['funnel_stage'],
    filters: [],
    lastModified: '2024-12-20T14:20:00Z',
    author: 'Emily Davis'
  },
  {
    id: '5',
    name: 'Customer Heatmap',
    chartType: 'heatmap',
    dataSource: 'CRM Database',
    metrics: ['engagement_score'],
    dimensions: ['segment', 'activity'],
    filters: [],
    lastModified: '2024-12-19T11:00:00Z',
    author: 'Alex Turner'
  }
]

const mockDataSources: DataSource[] = [
  {
    id: '1',
    name: 'Sales Database',
    type: 'postgresql',
    host: 'db.company.com',
    database: 'sales_prod',
    status: 'connected',
    lastSync: '2024-12-23T12:00:00Z',
    tables: 45,
    rowCount: 2450000
  },
  {
    id: '2',
    name: 'Analytics DB',
    type: 'bigquery',
    host: 'bigquery.googleapis.com',
    database: 'analytics_warehouse',
    status: 'connected',
    lastSync: '2024-12-23T11:30:00Z',
    tables: 128,
    rowCount: 15600000
  },
  {
    id: '3',
    name: 'CRM Database',
    type: 'mysql',
    host: 'crm-db.company.com',
    database: 'crm_production',
    status: 'connected',
    lastSync: '2024-12-23T12:15:00Z',
    tables: 32,
    rowCount: 890000
  },
  {
    id: '4',
    name: 'Marketing Data',
    type: 'snowflake',
    host: 'xy12345.snowflakecomputing.com',
    database: 'marketing_dw',
    status: 'connected',
    lastSync: '2024-12-23T10:45:00Z',
    tables: 67,
    rowCount: 5200000
  },
  {
    id: '5',
    name: 'External API',
    type: 'api',
    host: 'api.partner.com',
    database: 'N/A',
    status: 'error',
    lastSync: '2024-12-22T18:00:00Z',
    tables: 0,
    rowCount: 0
  }
]

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    name: 'Weekly Executive Report',
    dashboard: 'Executive Summary',
    schedule: 'weekly',
    nextRun: '2024-12-30T09:00:00Z',
    lastRun: '2024-12-23T09:00:00Z',
    recipients: ['ceo@company.com', 'cfo@company.com', 'coo@company.com'],
    format: 'pdf',
    enabled: true
  },
  {
    id: '2',
    name: 'Daily Sales Report',
    dashboard: 'Sales Performance',
    schedule: 'daily',
    nextRun: '2024-12-24T07:00:00Z',
    lastRun: '2024-12-23T07:00:00Z',
    recipients: ['sales-team@company.com'],
    format: 'xlsx',
    enabled: true
  },
  {
    id: '3',
    name: 'Monthly Marketing Review',
    dashboard: 'Marketing Analytics',
    schedule: 'monthly',
    nextRun: '2025-01-01T08:00:00Z',
    lastRun: '2024-12-01T08:00:00Z',
    recipients: ['marketing@company.com'],
    format: 'pdf',
    enabled: true
  },
  {
    id: '4',
    name: 'Customer Health Report',
    dashboard: 'Customer Success',
    schedule: 'weekly',
    nextRun: '2024-12-30T10:00:00Z',
    lastRun: '2024-12-23T10:00:00Z',
    recipients: ['cs-team@company.com'],
    format: 'pdf',
    enabled: false
  }
]

const chartTypes: { type: ChartType; label: string; icon: typeof BarChart3 }[] = [
  { type: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { type: 'line', label: 'Line Chart', icon: LineChart },
  { type: 'pie', label: 'Pie Chart', icon: PieChart },
  { type: 'area', label: 'Area Chart', icon: Activity },
  { type: 'scatter', label: 'Scatter Plot', icon: Target },
  { type: 'heatmap', label: 'Heat Map', icon: Grid3X3 },
  { type: 'gauge', label: 'Gauge', icon: Gauge },
  { type: 'table', label: 'Table', icon: Table },
  { type: 'kpi', label: 'KPI Card', icon: TrendingUp },
  { type: 'map', label: 'Map', icon: Map }
]

export default function ReportingClient() {
  const [activeTab, setActiveTab] = useState('dashboards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null)
  const [showCreateDashboard, setShowCreateDashboard] = useState(false)
  const [showCreateWorksheet, setShowCreateWorksheet] = useState(false)
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats
  const totalDashboards = mockDashboards.length
  const totalWorksheets = mockWorksheets.length
  const totalDataSources = mockDataSources.filter(d => d.status === 'connected').length
  const totalViews = mockDashboards.reduce((sum, d) => sum + d.views, 0)

  const filteredDashboards = useMemo(() => {
    return mockDashboards.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFavorites = !filterFavorites || d.isFavorite
      return matchesSearch && matchesFavorites
    })
  }, [searchQuery, filterFavorites])

  const getChartIcon = (type: ChartType) => {
    const chart = chartTypes.find(c => c.type === type)
    return chart?.icon || BarChart3
  }

  const getDataSourceIcon = (type: DataSourceType) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
        return Database
      case 'mongodb':
        return Layers
      case 'csv':
        return FileText
      case 'api':
        return Globe
      case 'snowflake':
      case 'bigquery':
        return Database
      default:
        return Database
    }
  }

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'text-green-500 bg-green-500/10'
      case 'disconnected': return 'text-yellow-500 bg-yellow-500/10'
      case 'error': return 'text-red-500 bg-red-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Business Intelligence</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    Tableau Level
                  </span>
                </div>
                <p className="text-indigo-100 max-w-2xl">
                  Create interactive dashboards, visualizations, and reports with drag-and-drop simplicity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateDashboard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Dashboard
                </button>
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-indigo-200 text-sm mb-1">Dashboards</div>
                <div className="text-3xl font-bold text-white">{totalDashboards}</div>
                <div className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +3 this month
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-indigo-200 text-sm mb-1">Worksheets</div>
                <div className="text-3xl font-bold text-white">{totalWorksheets}</div>
                <div className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +8 this month
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-indigo-200 text-sm mb-1">Data Sources</div>
                <div className="text-3xl font-bold text-white">{totalDataSources}</div>
                <div className="text-indigo-200 text-xs mt-1">4 connected</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-indigo-200 text-sm mb-1">Total Views</div>
                <div className="text-3xl font-bold text-white">{totalViews.toLocaleString()}</div>
                <div className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +23% vs last month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
              <TabsTrigger value="dashboards" className="rounded-lg">Dashboards</TabsTrigger>
              <TabsTrigger value="worksheets" className="rounded-lg">Worksheets</TabsTrigger>
              <TabsTrigger value="datasources" className="rounded-lg">Data Sources</TabsTrigger>
              <TabsTrigger value="scheduled" className="rounded-lg">Scheduled</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              {activeTab === 'dashboards' && (
                <>
                  <button
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className={`p-2 rounded-lg border transition-colors ${
                      filterFavorites
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      <Table className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="mt-6">
            {/* Dashboards Overview Banner */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <LayoutDashboard className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Dashboard Gallery</h3>
                      <p className="text-indigo-100">Explore, create, and manage your business dashboards</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredDashboards.length}</div>
                      <div className="text-sm text-indigo-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredDashboards.filter(d => d.isFavorite).length}</div>
                      <div className="text-sm text-indigo-100">Favorites</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredDashboards.filter(d => d.isPublished).length}</div>
                      <div className="text-sm text-indigo-100">Published</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Views</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">+23%</div>
                      <div className="text-sm text-gray-500">Growth Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
                      <div className="text-sm text-gray-500">Active Viewers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">4.2m</div>
                      <div className="text-sm text-gray-500">Avg. Session</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDashboards.map(dashboard => (
                  <div
                    key={dashboard.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-lg group"
                  >
                    {/* Thumbnail */}
                    <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutDashboard className="w-16 h-16 text-indigo-300 dark:text-indigo-700" />
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {dashboard.isPublished && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Published</span>
                        )}
                        <button className="p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          // Toggle favorite
                        }}
                        className="absolute top-3 left-3 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-lg"
                      >
                        {dashboard.isFavorite ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dashboard.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{dashboard.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {dashboard.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {dashboard.favorites}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(dashboard.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {dashboard.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDashboard(dashboard)}
                          className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Open
                        </button>
                        <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Share2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Create New Card */}
                <button
                  onClick={() => setShowCreateDashboard(true)}
                  className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-indigo-600" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Create Dashboard</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Start from scratch or template</span>
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Dashboard</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDashboards.map(dashboard => (
                      <tr key={dashboard.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                              <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{dashboard.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{dashboard.tags.join(', ')}</p>
                            </div>
                            {dashboard.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{dashboard.author}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{dashboard.views.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(dashboard.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            dashboard.isPublished
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {dashboard.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedDashboard(dashboard)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <Share2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Worksheets Tab */}
          <TabsContent value="worksheets" className="mt-6">
            {/* Worksheets Overview Banner */}
            <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileSpreadsheet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Data Worksheets</h3>
                      <p className="text-green-100">Build and customize individual visualizations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockWorksheets.length}</div>
                      <div className="text-sm text-green-100">Worksheets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{chartTypes.length}</div>
                      <div className="text-sm text-green-100">Chart Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockDataSources.filter(d => d.status === 'connected').length}</div>
                      <div className="text-sm text-green-100">Data Sources</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Worksheet Stats */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[
                { type: 'bar', count: mockWorksheets.filter(w => w.chartType === 'bar').length, icon: BarChart3, color: 'indigo' },
                { type: 'line', count: mockWorksheets.filter(w => w.chartType === 'line').length, icon: LineChart, color: 'blue' },
                { type: 'pie', count: mockWorksheets.filter(w => w.chartType === 'pie').length, icon: PieChart, color: 'purple' },
                { type: 'heatmap', count: mockWorksheets.filter(w => w.chartType === 'heatmap').length, icon: Grid3X3, color: 'orange' },
                { type: 'table', count: mockWorksheets.filter(w => w.chartType === 'table').length, icon: Table, color: 'green' }
              ].map((stat, idx) => (
                <Card key={idx} className="bg-white dark:bg-gray-800">
                  <CardContent className="p-3 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-1 text-${stat.color}-500`} />
                    <div className="font-bold text-lg">{stat.count}</div>
                    <div className="text-xs text-gray-500 capitalize">{stat.type}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{mockWorksheets.length} worksheets</span>
              </div>
              <button
                onClick={() => setShowCreateWorksheet(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                New Worksheet
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockWorksheets.map(worksheet => {
                const ChartIcon = getChartIcon(worksheet.chartType)
                return (
                  <div
                    key={worksheet.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-500/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedWorksheet(worksheet)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <ChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{worksheet.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{worksheet.dataSource}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded capitalize">{worksheet.chartType}</span>
                      <span>{worksheet.metrics.length} metrics</span>
                      <span>{worksheet.dimensions.length} dimensions</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{worksheet.author}</span>
                      <span>{new Date(worksheet.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chart Types Reference */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Available Visualizations</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {chartTypes.map(chart => (
                  <button
                    key={chart.type}
                    onClick={() => {
                      setShowCreateWorksheet(true)
                    }}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors text-center"
                  >
                    <chart.icon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{chart.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="datasources" className="mt-6">
            {/* Data Sources Overview Banner */}
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Database className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Data Connections</h3>
                      <p className="text-blue-100">Manage and monitor your data source connections</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockDataSources.filter(d => d.status === 'connected').length}</div>
                      <div className="text-sm text-blue-100">Connected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockDataSources.reduce((sum, d) => sum + d.tables, 0)}</div>
                      <div className="text-sm text-blue-100">Tables</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(mockDataSources.reduce((sum, d) => sum + d.rowCount, 0) / 1000000).toFixed(1)}M</div>
                      <div className="text-sm text-blue-100">Total Rows</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Health */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockDataSources.filter(d => d.status === 'connected').length}
                      </div>
                      <div className="text-sm text-gray-500">Healthy Connections</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockDataSources.filter(d => d.status === 'disconnected').length}
                      </div>
                      <div className="text-sm text-gray-500">Disconnected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockDataSources.filter(d => d.status === 'error').length}
                      </div>
                      <div className="text-sm text-gray-500">Errors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {mockDataSources.filter(d => d.status === 'connected').length} of {mockDataSources.length} connected
                </span>
              </div>
              <button
                onClick={() => setShowDataSourceDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Add Data Source
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Data Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Tables</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Rows</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Last Sync</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockDataSources.map(source => {
                    const SourceIcon = getDataSourceIcon(source.type)
                    return (
                      <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <SourceIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{source.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{source.host}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 uppercase">
                            {source.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(source.status)}`}>
                            {source.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{source.tables}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {source.rowCount > 0 ? `${(source.rowCount / 1000000).toFixed(1)}M` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(source.lastSync).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Sync">
                              <RefreshCw className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Settings">
                              <Settings className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Delete">
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled" className="mt-6">
            {/* Scheduled Reports Overview Banner */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Report Automation</h3>
                      <p className="text-orange-100">Schedule and automate your report delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockScheduledReports.filter(r => r.enabled).length}</div>
                      <div className="text-sm text-orange-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockScheduledReports.filter(r => r.schedule === 'daily').length}</div>
                      <div className="text-sm text-orange-100">Daily</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockScheduledReports.filter(r => r.schedule === 'weekly').length}</div>
                      <div className="text-sm text-orange-100">Weekly</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockScheduledReports.reduce((sum, r) => sum + r.recipients.length, 0)}</div>
                      <div className="text-sm text-orange-100">Recipients</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Types Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{mockScheduledReports.filter(r => r.schedule === 'daily').length}</div>
                      <div className="text-sm text-gray-500">Daily Reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{mockScheduledReports.filter(r => r.schedule === 'weekly').length}</div>
                      <div className="text-sm text-gray-500">Weekly Reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{mockScheduledReports.filter(r => r.schedule === 'monthly').length}</div>
                      <div className="text-sm text-gray-500">Monthly Reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{mockScheduledReports.filter(r => r.lastRun !== null).length}</div>
                      <div className="text-sm text-gray-500">Delivered</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {mockScheduledReports.filter(r => r.enabled).length} active schedules
                </span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Schedule Report
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Report</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Dashboard</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Next Run</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Format</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockScheduledReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{report.dashboard}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs capitalize">
                          {report.schedule}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(report.nextRun).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{report.recipients.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 uppercase">
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={report.enabled} className="sr-only peer" readOnly />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Run Now">
                            <Play className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit">
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Banner */}
            <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Tableau-Level Reporting Platform</h2>
                      <p className="text-indigo-100 mt-1">Configure dashboards, data sources, and scheduled reports</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalDashboards}</div>
                      <div className="text-sm text-indigo-100">Dashboards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalWorksheets}</div>
                      <div className="text-sm text-indigo-100">Worksheets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalDataSources}</div>
                      <div className="text-sm text-indigo-100">Data Sources</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
                      <div className="text-sm text-indigo-100">Total Views</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'datasources', icon: Database, label: 'Data Sources' },
                      { id: 'sharing', icon: Share2, label: 'Sharing' },
                      { id: 'exports', icon: Download, label: 'Export Settings' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'advanced', icon: Zap, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          settingsTab === item.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card>
                    <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Default Dashboard View</div>
                          <div className="text-sm text-muted-foreground">Choose default view mode</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>Grid View</option>
                          <option>List View</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Auto-refresh Dashboards</div>
                          <div className="text-sm text-muted-foreground">Automatically refresh data</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Refresh Interval</div>
                          <div className="text-sm text-muted-foreground">How often to refresh data</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>Every 5 minutes</option>
                          <option>Every 15 minutes</option>
                          <option>Every 30 minutes</option>
                          <option>Every hour</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Enable Caching</div>
                          <div className="text-sm text-muted-foreground">Cache data for faster loading</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'datasources' && (
                  <Card>
                    <CardHeader><CardTitle>Data Source Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Connection Timeout</div>
                          <div className="text-sm text-muted-foreground">Max wait time for connections</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>30 seconds</option>
                          <option>60 seconds</option>
                          <option>2 minutes</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Query Timeout</div>
                          <div className="text-sm text-muted-foreground">Max query execution time</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>5 minutes</option>
                          <option>10 minutes</option>
                          <option>30 minutes</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">SSL Encryption</div>
                          <div className="text-sm text-muted-foreground">Require SSL for all connections</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Connection Pooling</div>
                          <div className="text-sm text-muted-foreground">Reuse database connections</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'sharing' && (
                  <Card>
                    <CardHeader><CardTitle>Sharing Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Default Share Permission</div>
                          <div className="text-sm text-muted-foreground">Default access level for shared items</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>View Only</option>
                          <option>Can Edit</option>
                          <option>Full Access</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Link Expiration</div>
                          <div className="text-sm text-muted-foreground">When shared links expire</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>Never</option>
                          <option>7 days</option>
                          <option>30 days</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Allow External Sharing</div>
                          <div className="text-sm text-muted-foreground">Share dashboards outside organization</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Require Password</div>
                          <div className="text-sm text-muted-foreground">Password protect shared links</div>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'exports' && (
                  <Card>
                    <CardHeader><CardTitle>Export Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Default Export Format</div>
                          <div className="text-sm text-muted-foreground">Preferred format for exports</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700">
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>CSV</option>
                          <option>PNG</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Include Filters</div>
                          <div className="text-sm text-muted-foreground">Export with current filter state</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Include Timestamp</div>
                          <div className="text-sm text-muted-foreground">Add export date to filename</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Compress Large Exports</div>
                          <div className="text-sm text-muted-foreground">Automatically zip large files</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card>
                    <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Report Ready Notifications</div>
                          <div className="text-sm text-muted-foreground">Notify when scheduled reports complete</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Data Refresh Alerts</div>
                          <div className="text-sm text-muted-foreground">Alert on data refresh failures</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Share Notifications</div>
                          <div className="text-sm text-muted-foreground">Notify when dashboards are shared</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Threshold Alerts</div>
                          <div className="text-sm text-muted-foreground">Alert when metrics exceed thresholds</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Email Digest</div>
                          <div className="text-sm text-muted-foreground">Daily summary of activity</div>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card>
                    <CardHeader><CardTitle>Advanced Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Enable SQL Access</div>
                          <div className="text-sm text-muted-foreground">Allow custom SQL queries</div>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Debug Mode</div>
                          <div className="text-sm text-muted-foreground">Show query execution details</div>
                        </div>
                        <input type="checkbox" className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Performance Logging</div>
                          <div className="text-sm text-muted-foreground">Log query performance metrics</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">API Access</div>
                          <div className="text-sm text-muted-foreground">Enable REST API endpoints</div>
                        </div>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline">Export Configuration</Button>
                        <Button variant="outline">Import Configuration</Button>
                        <Button variant="destructive">Reset to Defaults</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
              {[
                { icon: LayoutDashboard, label: 'New Dashboard', desc: 'Create report', color: 'from-indigo-500 to-purple-600' },
                { icon: FileSpreadsheet, label: 'New Worksheet', desc: 'Add data view', color: 'from-green-500 to-emerald-600' },
                { icon: Database, label: 'Connect Data', desc: 'Add source', color: 'from-blue-500 to-cyan-600' },
                { icon: Clock, label: 'Schedule', desc: 'Set automation', color: 'from-orange-500 to-red-600' },
                { icon: Download, label: 'Export All', desc: 'Bulk export', color: 'from-purple-500 to-pink-600' },
                { icon: Share2, label: 'Share', desc: 'Collaborate', color: 'from-teal-500 to-green-600' },
                { icon: TrendingUp, label: 'Analytics', desc: 'View insights', color: 'from-yellow-500 to-orange-600' },
                { icon: RefreshCw, label: 'Refresh All', desc: 'Update data', color: 'from-cyan-500 to-blue-600' }
              ].map((action, idx) => (
                <Card key={idx} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dashboard Preview Dialog */}
        <Dialog open={!!selectedDashboard} onOpenChange={() => setSelectedDashboard(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                {selectedDashboard?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedDashboard && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedDashboard.description}</p>

                {/* Mock Dashboard Preview */}
                <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Revenue</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">$124.5K</div>
                      <div className="text-sm text-green-500 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-4 h-4" /> +12.5%
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Users</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">8,432</div>
                      <div className="text-sm text-green-500 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-4 h-4" /> +8.3%
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Conversion Rate</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">3.24%</div>
                      <div className="text-sm text-red-500 flex items-center gap-1 mt-1">
                        <ArrowDownRight className="w-4 h-4" /> -0.8%
                      </div>
                    </div>
                    <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Revenue Trend</div>
                      <div className="h-32 flex items-end gap-2">
                        {[65, 72, 58, 80, 75, 90, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">By Category</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">Product A</span>
                          <span className="font-medium text-gray-900 dark:text-white">42%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">Product B</span>
                          <span className="font-medium text-gray-900 dark:text-white">28%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">Product C</span>
                          <span className="font-medium text-gray-900 dark:text-white">30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>By {selectedDashboard.author}</span>
                    <span>{selectedDashboard.views.toLocaleString()} views</span>
                    <span>Updated {new Date(selectedDashboard.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Share2 className="w-4 h-4 inline mr-2" /> Share
                    </button>
                    <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Download className="w-4 h-4 inline mr-2" /> Export
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      <Edit className="w-4 h-4 inline mr-2" /> Edit Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Dashboard Dialog */}
        <Dialog open={showCreateDashboard} onOpenChange={setShowCreateDashboard}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dashboard Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sales Overview"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  placeholder="What insights will this dashboard provide?"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start From</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 transition-colors text-left">
                    <Sparkles className="w-6 h-6 text-indigo-600 mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">Blank</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Start from scratch</div>
                  </button>
                  <button className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 transition-colors text-left">
                    <FolderOpen className="w-6 h-6 text-indigo-600 mb-2" />
                    <div className="font-medium text-gray-900 dark:text-white">Template</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Use a template</div>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreateDashboard(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Create Dashboard
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Worksheet Dialog */}
        <Dialog open={showCreateWorksheet} onOpenChange={setShowCreateWorksheet}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Worksheet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Worksheet Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Revenue by Region"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Source</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {mockDataSources.filter(d => d.status === 'connected').map(source => (
                      <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chart Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {chartTypes.map(chart => (
                    <button
                      key={chart.type}
                      className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 transition-colors flex flex-col items-center"
                    >
                      <chart.icon className="w-6 h-6 text-indigo-600 mb-1" />
                      <span className="text-xs text-gray-700 dark:text-gray-300">{chart.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreateWorksheet(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Create Worksheet
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Data Source Dialog */}
        <Dialog open={showDataSourceDialog} onOpenChange={setShowDataSourceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Data Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'postgresql', label: 'PostgreSQL', icon: Database },
                  { type: 'mysql', label: 'MySQL', icon: Database },
                  { type: 'mongodb', label: 'MongoDB', icon: Layers },
                  { type: 'snowflake', label: 'Snowflake', icon: Database },
                  { type: 'bigquery', label: 'BigQuery', icon: Database },
                  { type: 'csv', label: 'CSV Upload', icon: FileText }
                ].map(source => (
                  <button
                    key={source.type}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 transition-colors flex flex-col items-center"
                  >
                    <source.icon className="w-8 h-8 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{source.label}</span>
                  </button>
                ))}
              </div>
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-indigo-600 hover:underline">
                  View all connectors
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
