'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Eye,
  Download,
  Share2,
  Plus,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Settings,
  FileText,
  Table2,
  LayoutDashboard,
  Database,
  Link2,
  Layers,
  Palette,
  Grid3X3,
  List,
  MoreHorizontal,
  Trash2,
  Edit,
  Star,
  FolderOpen,
  Upload,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Target,
  Globe,
  Mail,
  Bell,
  Key,
  Webhook,
  Shield,
  HardDrive,
  AlertOctagon,
  CreditCard,
  Sliders
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'

// Types
type ReportStatus = 'published' | 'draft' | 'scheduled' | 'generating' | 'error' | 'archived'
type ReportType = 'dashboard' | 'table' | 'chart' | 'story' | 'embedded'
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'map' | 'funnel' | 'gauge'
type DataSourceType = 'database' | 'file' | 'api' | 'cloud' | 'spreadsheet'

interface Report {
  id: string
  name: string
  description: string
  type: ReportType
  status: ReportStatus
  thumbnail?: string
  charts: number
  views: number
  shares: number
  lastModified: string
  createdAt: string
  author: {
    name: string
    avatar: string
  }
  dataSource: string
  refreshSchedule?: string
  isFavorite: boolean
  isPublic: boolean
  folder: string
  tags: string[]
}

interface Dashboard {
  id: string
  name: string
  description: string
  sheets: number
  views: number
  lastAccessed: string
  thumbnail: string
  author: string
  status: 'live' | 'draft' | 'archived'
}

interface DataSource {
  id: string
  name: string
  type: DataSourceType
  connection: string
  lastSync: string
  status: 'connected' | 'error' | 'syncing' | 'disconnected'
  tables: number
  rows: number
  size: string
}

interface ScheduledReport {
  id: string
  reportId: string
  reportName: string
  schedule: string
  nextRun: string
  lastRun: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv' | 'image'
  status: 'active' | 'paused' | 'error'
}

interface ChartData {
  id: string
  name: string
  type: ChartType
  data: number[]
  labels: string[]
}

// Mock data
const mockReports: Report[] = [
  {
    id: '1',
    name: 'Sales Performance Dashboard',
    description: 'Comprehensive overview of sales metrics, revenue trends, and team performance',
    type: 'dashboard',
    status: 'published',
    charts: 8,
    views: 15420,
    shares: 234,
    lastModified: '2024-01-15',
    createdAt: '2023-06-10',
    author: { name: 'Sarah Chen', avatar: '/avatars/1.png' },
    dataSource: 'Salesforce CRM',
    refreshSchedule: 'Hourly',
    isFavorite: true,
    isPublic: true,
    folder: 'Sales',
    tags: ['sales', 'revenue', 'kpi']
  },
  {
    id: '2',
    name: 'Marketing Campaign Analytics',
    description: 'Track campaign performance, ROI, and customer acquisition metrics',
    type: 'dashboard',
    status: 'published',
    charts: 12,
    views: 8920,
    shares: 156,
    lastModified: '2024-01-14',
    createdAt: '2023-08-15',
    author: { name: 'Mike Johnson', avatar: '/avatars/2.png' },
    dataSource: 'Google Analytics',
    refreshSchedule: 'Daily',
    isFavorite: true,
    isPublic: false,
    folder: 'Marketing',
    tags: ['marketing', 'campaigns', 'analytics']
  },
  {
    id: '3',
    name: 'Financial Quarterly Report',
    description: 'Q4 2024 financial summary with P&L, balance sheet, and cash flow',
    type: 'table',
    status: 'draft',
    charts: 6,
    views: 3450,
    shares: 89,
    lastModified: '2024-01-13',
    createdAt: '2024-01-01',
    author: { name: 'Emily Davis', avatar: '/avatars/3.png' },
    dataSource: 'QuickBooks',
    isFavorite: false,
    isPublic: false,
    folder: 'Finance',
    tags: ['finance', 'quarterly', 'p&l']
  },
  {
    id: '4',
    name: 'Customer Satisfaction Trends',
    description: 'NPS scores, feedback analysis, and customer journey insights',
    type: 'chart',
    status: 'published',
    charts: 5,
    views: 5670,
    shares: 112,
    lastModified: '2024-01-12',
    createdAt: '2023-11-20',
    author: { name: 'Alex Wong', avatar: '/avatars/4.png' },
    dataSource: 'Zendesk',
    refreshSchedule: 'Weekly',
    isFavorite: false,
    isPublic: true,
    folder: 'Customer Success',
    tags: ['nps', 'customer', 'satisfaction']
  },
  {
    id: '5',
    name: 'Product Usage Analytics',
    description: 'Feature adoption, user engagement, and retention metrics',
    type: 'dashboard',
    status: 'generating',
    charts: 10,
    views: 7890,
    shares: 178,
    lastModified: '2024-01-11',
    createdAt: '2023-09-05',
    author: { name: 'Jessica Lee', avatar: '/avatars/5.png' },
    dataSource: 'Mixpanel',
    refreshSchedule: 'Real-time',
    isFavorite: true,
    isPublic: false,
    folder: 'Product',
    tags: ['product', 'usage', 'engagement']
  },
  {
    id: '6',
    name: 'HR Workforce Analytics',
    description: 'Headcount trends, attrition rates, and hiring pipeline',
    type: 'story',
    status: 'scheduled',
    charts: 7,
    views: 2340,
    shares: 45,
    lastModified: '2024-01-10',
    createdAt: '2023-12-01',
    author: { name: 'David Brown', avatar: '/avatars/6.png' },
    dataSource: 'BambooHR',
    refreshSchedule: 'Monthly',
    isFavorite: false,
    isPublic: false,
    folder: 'HR',
    tags: ['hr', 'workforce', 'hiring']
  }
]

const mockDataSources: DataSource[] = [
  { id: '1', name: 'Salesforce CRM', type: 'cloud', connection: 'salesforce.com', lastSync: '5 min ago', status: 'connected', tables: 45, rows: 2450000, size: '1.2 GB' },
  { id: '2', name: 'Google Analytics', type: 'api', connection: 'analytics.google.com', lastSync: '1 hour ago', status: 'connected', tables: 12, rows: 8900000, size: '3.4 GB' },
  { id: '3', name: 'PostgreSQL Production', type: 'database', connection: 'db.company.com:5432', lastSync: '10 min ago', status: 'connected', tables: 78, rows: 15600000, size: '8.7 GB' },
  { id: '4', name: 'Excel Monthly Reports', type: 'spreadsheet', connection: 'SharePoint', lastSync: '2 days ago', status: 'syncing', tables: 8, rows: 45000, size: '125 MB' },
  { id: '5', name: 'Stripe Payments', type: 'api', connection: 'api.stripe.com', lastSync: '30 min ago', status: 'error', tables: 6, rows: 890000, size: '450 MB' }
]

const mockScheduledReports: ScheduledReport[] = [
  { id: '1', reportId: '1', reportName: 'Sales Performance Dashboard', schedule: 'Daily at 8:00 AM', nextRun: '2024-01-16 08:00', lastRun: '2024-01-15 08:00', recipients: ['team@company.com'], format: 'pdf', status: 'active' },
  { id: '2', reportId: '2', reportName: 'Marketing Campaign Analytics', schedule: 'Weekly on Monday', nextRun: '2024-01-22 09:00', lastRun: '2024-01-15 09:00', recipients: ['marketing@company.com', 'cmo@company.com'], format: 'pdf', status: 'active' },
  { id: '3', reportId: '3', reportName: 'Financial Quarterly Report', schedule: 'Monthly on 1st', nextRun: '2024-02-01 06:00', lastRun: '2024-01-01 06:00', recipients: ['finance@company.com', 'cfo@company.com'], format: 'excel', status: 'active' },
  { id: '4', reportId: '4', reportName: 'Customer Satisfaction Trends', schedule: 'Daily at 6:00 PM', nextRun: '2024-01-16 18:00', lastRun: '2024-01-15 18:00', recipients: ['cs@company.com'], format: 'pdf', status: 'paused' }
]

const chartTypes: { type: ChartType; icon: any; label: string }[] = [
  { type: 'bar', icon: BarChart3, label: 'Bar Chart' },
  { type: 'line', icon: LineChart, label: 'Line Chart' },
  { type: 'pie', icon: PieChart, label: 'Pie Chart' },
  { type: 'area', icon: Activity, label: 'Area Chart' },
  { type: 'scatter', icon: Target, label: 'Scatter Plot' },
  { type: 'heatmap', icon: Grid3X3, label: 'Heatmap' },
  { type: 'map', icon: Globe, label: 'Map' },
  { type: 'funnel', icon: ChevronDown, label: 'Funnel' },
  { type: 'gauge', icon: Activity, label: 'Gauge' }
]

const folders = [
  { name: 'All Reports', count: 48, icon: FolderOpen },
  { name: 'Sales', count: 12, icon: DollarSign },
  { name: 'Marketing', count: 8, icon: TrendingUp },
  { name: 'Finance', count: 6, icon: BarChart3 },
  { name: 'Product', count: 10, icon: Layers },
  { name: 'Customer Success', count: 7, icon: Users },
  { name: 'HR', count: 5, icon: Users }
]

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Looker/Tableau Level
// ============================================================================

const mockReportsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Report Accuracy', description: 'All scheduled reports delivered on time with 99.9% data accuracy.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '2', type: 'warning' as const, title: 'Data Freshness', description: 'Sales data source is 6 hours stale. Refresh recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Data' },
  { id: '3', type: 'info' as const, title: 'Usage Trend', description: 'Executive Dashboard views up 40% this month. Consider expanding.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockReportsCollaborators = [
  { id: '1', name: 'Data Analyst', avatar: '/avatars/analyst.jpg', status: 'online' as const, role: 'Analyst' },
  { id: '2', name: 'BI Manager', avatar: '/avatars/bi.jpg', status: 'online' as const, role: 'Manager' },
  { id: '3', name: 'Finance Lead', avatar: '/avatars/finance.jpg', status: 'away' as const, role: 'Finance' },
]

const mockReportsPredictions = [
  { id: '1', title: 'Report Usage', prediction: 'Monthly report views expected to reach 10K by end of quarter', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cost Savings', prediction: 'Automated reports saving 20 hours/week in manual work', confidence: 95, trend: 'stable' as const, impact: 'medium' as const },
]

const mockReportsActivities = [
  { id: '1', user: 'Data Analyst', action: 'Created', target: 'New Q4 Revenue Dashboard', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'BI Manager', action: 'Scheduled', target: 'Weekly KPI report for leadership', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Completed', target: 'Monthly data refresh for all sources', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockReportsQuickActions = [
  { id: '1', label: 'New Report', icon: 'plus', action: () => console.log('New report'), variant: 'default' as const },
  { id: '2', label: 'Schedule Export', icon: 'calendar', action: () => console.log('Schedule export'), variant: 'default' as const },
  { id: '3', label: 'Data Sources', icon: 'database', action: () => console.log('Data sources'), variant: 'outline' as const },
]

export default function ReportsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All Reports')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Filter reports
  const filteredReports = useMemo(() => {
    return mockReports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFolder = selectedFolder === 'All Reports' || report.folder === selectedFolder
      return matchesSearch && matchesFolder
    })
  }, [searchQuery, selectedFolder])

  // Stats
  const stats = [
    { label: 'Total Reports', value: '48', change: '+12', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Published', value: '32', change: '+5', icon: Eye, color: 'from-green-500 to-green-600' },
    { label: 'Total Views', value: '125.4K', change: '+18%', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Shares', value: '1,245', change: '+24%', icon: Share2, color: 'from-orange-500 to-orange-600' },
    { label: 'Data Sources', value: '12', change: '+2', icon: Database, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Scheduled', value: '8', change: '', icon: Calendar, color: 'from-amber-500 to-amber-600' },
    { label: 'Dashboards', value: '15', change: '+3', icon: LayoutDashboard, color: 'from-rose-500 to-rose-600' },
    { label: 'Team Members', value: '24', change: '+4', icon: Users, color: 'from-indigo-500 to-indigo-600' }
  ]

  const getStatusColor = (status: ReportStatus): string => {
    const colors: Record<ReportStatus, string> = {
      'published': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'generating': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'archived': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status]
  }

  const getTypeIcon = (type: ReportType) => {
    const icons: Record<ReportType, any> = {
      'dashboard': LayoutDashboard,
      'table': Table2,
      'chart': BarChart3,
      'story': FileText,
      'embedded': ExternalLink
    }
    return icons[type] || FileText
  }

  const getDataSourceIcon = (type: DataSourceType) => {
    const icons: Record<DataSourceType, any> = {
      'database': Database,
      'file': FileText,
      'api': Link2,
      'cloud': Globe,
      'spreadsheet': Table2
    }
    return icons[type] || Database
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const renderReportCard = (report: Report) => {
    const TypeIcon = getTypeIcon(report.type)
    return (
      <Card
        key={report.id}
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-700"
        onClick={() => setSelectedReport(report)}
      >
        <CardContent className="p-4">
          {/* Thumbnail placeholder */}
          <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-3 flex items-center justify-center">
            <TypeIcon className="h-12 w-12 text-gray-400" />
          </div>

          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{report.name}</h3>
                {report.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{report.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
            <Badge variant="outline" className="text-xs">
              <TypeIcon className="h-3 w-3 mr-1" />
              {report.type}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(report.views)}
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {report.shares}
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {report.charts} charts
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={report.author.avatar} />
                <AvatarFallback>{report.author.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">{report.author.name}</span>
            </div>
            <span className="text-xs text-gray-400">{report.lastModified}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handlers
  const handleCreateReport = () => {
    toast.info('Create Report', {
      description: 'Opening report builder...'
    })
  }

  const handleExportReport = (reportName: string) => {
    toast.success('Exporting report', {
      description: `"${reportName}" will be downloaded`
    })
  }

  const handleScheduleReport = (reportName: string) => {
    toast.success('Report scheduled', {
      description: `"${reportName}" delivery scheduled`
    })
  }

  const handleShareReport = (reportName: string) => {
    toast.success('Link copied', {
      description: `Share link for "${reportName}" copied`
    })
  }

  const handleDuplicateReport = (reportName: string) => {
    toast.success('Report duplicated', {
      description: `Copy of "${reportName}" created`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reporting</h1>
              <p className="text-gray-500 dark:text-gray-400">Create, visualize, and share data insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                className="w-72 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
                {stat.change && (
                  <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} this month
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="datasources" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Database className="h-4 w-4 mr-2" />
              Data Sources
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboards Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {/* Dashboard Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Report Dashboards</h2>
                  <p className="text-blue-100">Looker-level dashboard creation and management</p>
                  <p className="text-blue-200 text-xs mt-1">Interactive charts • Drill-down • Real-time data</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReports.length}</p>
                    <p className="text-blue-200 text-sm">Dashboards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{folders.length}</p>
                    <p className="text-blue-200 text-sm">Folders</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Folders Sidebar */}
              <div className="col-span-3">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Folders</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {folders.map((folder) => (
                        <button
                          key={folder.name}
                          onClick={() => setSelectedFolder(folder.name)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            selectedFolder === folder.name
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <folder.icon className="h-4 w-4" />
                            <span>{folder.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{folder.count}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="mt-6 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Reports Created</span>
                      <span className="font-bold text-green-600">+12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Views</span>
                      <span className="font-bold text-blue-600">45.2K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Exports</span>
                      <span className="font-bold text-purple-600">234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Scheduled Runs</span>
                      <span className="font-bold text-amber-600">56</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Grid */}
              <div className="col-span-9">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedFolder}</Badge>
                    <span className="text-sm text-gray-500">{filteredReports.length} reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {filteredReports.map(report => renderReportCard(report))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Report Library</h2>
                  <p className="text-purple-100">Tableau-level report generation and sharing</p>
                  <p className="text-purple-200 text-xs mt-1">PDF export • Scheduling • Team sharing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{reports.length}</p>
                    <p className="text-purple-200 text-sm">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{reports.filter(r => r.favorite).length}</p>
                    <p className="text-purple-200 text-sm">Favorites</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Reports</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockReports.map(report => {
                    const TypeIcon = getTypeIcon(report.type)
                    return (
                      <div
                        key={report.id}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center">
                          <TypeIcon className="h-6 w-6 text-purple-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                            {report.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                            {report.isPublic && <Globe className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{report.description}</p>
                        </div>

                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{formatNumber(report.views)}</p>
                            <p className="text-xs">views</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{report.charts}</p>
                            <p className="text-xs">charts</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={report.author.avatar} />
                            <AvatarFallback>{report.author.name[0]}</AvatarFallback>
                          </Avatar>
                        </div>

                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="mt-6">
            {/* Builder Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Report Builder</h2>
                  <p className="text-emerald-100">Power BI-level drag-and-drop report creation</p>
                  <p className="text-emerald-200 text-xs mt-1">Visual editor • Custom queries • Live preview</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{datasources.length}</p>
                    <p className="text-emerald-200 text-sm">Data Sources</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Chart Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {chartTypes.map(chart => (
                      <div
                        key={chart.type}
                        className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors"
                      >
                        <chart.icon className="h-10 w-10 text-purple-600 mb-3" />
                        <h4 className="font-medium">{chart.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">Click to add</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                    AI-Powered Insights
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2 text-blue-600" />
                    Connect Data Source
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Palette className="h-4 w-4 mr-2 text-pink-600" />
                    Apply Theme
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="h-4 w-4 mr-2 text-green-600" />
                    Publish Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="datasources" className="mt-6">
            {/* Datasources Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Data Sources</h2>
                  <p className="text-amber-100">Metabase-level data connectivity and management</p>
                  <p className="text-amber-200 text-xs mt-1">Multiple databases • API connectors • Real-time sync</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{datasources.length}</p>
                    <p className="text-amber-200 text-sm">Connected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{datasources.filter(d => d.status === 'connected').length}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Connected Data Sources</CardTitle>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Connection
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockDataSources.map(source => {
                    const SourceIcon = getDataSourceIcon(source.type)
                    return (
                      <div key={source.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <SourceIcon className="h-6 w-6 text-gray-600" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{source.name}</h4>
                          <p className="text-sm text-gray-500">{source.connection}</p>
                        </div>

                        <Badge className={
                          source.status === 'connected' ? 'bg-green-100 text-green-700' :
                          source.status === 'syncing' ? 'bg-blue-100 text-blue-700' :
                          source.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {source.status}
                        </Badge>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{source.tables}</p>
                            <p className="text-xs">tables</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{formatNumber(source.rows)}</p>
                            <p className="text-xs">rows</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900 dark:text-white">{source.size}</p>
                            <p className="text-xs">size</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="mt-6">
            {/* Scheduled Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Scheduled Reports</h2>
                  <p className="text-pink-100">Automated report delivery and distribution</p>
                  <p className="text-pink-200 text-xs mt-1">Email delivery • Slack integration • PDF/CSV export</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{scheduledReports.length}</p>
                    <p className="text-pink-200 text-sm">Scheduled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{scheduledReports.filter(s => s.status === 'active').length}</p>
                    <p className="text-pink-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Scheduled Reports</CardTitle>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowScheduleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockScheduledReports.map(schedule => (
                    <div key={schedule.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{schedule.reportName}</h4>
                        <p className="text-sm text-gray-500">{schedule.schedule}</p>
                      </div>

                      <Badge className={
                        schedule.status === 'active' ? 'bg-green-100 text-green-700' :
                        schedule.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {schedule.status}
                      </Badge>

                      <div className="text-sm text-gray-500">
                        <p className="font-medium text-gray-900 dark:text-white">Next: {schedule.nextRun}</p>
                        <p className="text-xs">Last: {schedule.lastRun}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{schedule.format.toUpperCase()}</Badge>
                        <Badge variant="outline">{schedule.recipients.length} recipients</Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch checked={schedule.status === 'active'} />
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Tableau Level */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'visualization', label: 'Visualization', icon: BarChart3 },
                        { id: 'data', label: 'Data Settings', icon: Database },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Analytics Stats Sidebar */}
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Analytics Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">48</div>
                      <div className="text-xs opacity-80">Total Reports</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">125K</div>
                        <div className="text-xs opacity-80">Views</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">12</div>
                        <div className="text-xs opacity-80">Data Sources</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Storage Used</span>
                        <span>14.2 GB</span>
                      </div>
                      <Progress value={71} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-purple-600" />
                          Report Defaults
                        </CardTitle>
                        <CardDescription>Configure default settings for new reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default View Mode</Label>
                            <Select defaultValue="dashboard">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dashboard">Dashboard</SelectItem>
                                <SelectItem value="full">Full Screen</SelectItem>
                                <SelectItem value="presentation">Presentation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Range Default</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                                <SelectItem value="365">Last year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="local">Browser Local</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Number Format</Label>
                            <Select defaultValue="us">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">US (1,234.56)</SelectItem>
                                <SelectItem value="eu">EU (1.234,56)</SelectItem>
                                <SelectItem value="swiss">Swiss (1'234.56)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-refresh Dashboards</div>
                            <div className="text-sm text-gray-500">Keep data up to date automatically</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Share2 className="w-5 h-5 text-blue-600" />
                          Sharing Settings
                        </CardTitle>
                        <CardDescription>Configure how reports can be shared</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Public Sharing</div>
                            <div className="text-sm text-gray-500">Allow sharing reports externally</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Comments</div>
                            <div className="text-sm text-gray-500">Allow team members to add comments</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Require Authentication</div>
                            <div className="text-sm text-gray-500">Users must log in to view reports</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'visualization' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-600" />
                          Theme & Branding
                        </CardTitle>
                        <CardDescription>Customize the look of your reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Color Palette</Label>
                          <Select defaultValue="default">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default (Purple)</SelectItem>
                              <SelectItem value="professional">Professional (Blue)</SelectItem>
                              <SelectItem value="vibrant">Vibrant (Multi)</SelectItem>
                              <SelectItem value="dark">Dark Theme</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex gap-2">
                            {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Company Logo</div>
                            <div className="text-sm text-gray-500">Display logo in reports and exports</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Watermark Exports</div>
                            <div className="text-sm text-gray-500">Add logo watermark to exported PDFs</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          Chart Defaults
                        </CardTitle>
                        <CardDescription>Default settings for chart visualizations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Chart Type</Label>
                            <Select defaultValue="bar">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="line">Line Chart</SelectItem>
                                <SelectItem value="pie">Pie Chart</SelectItem>
                                <SelectItem value="area">Area Chart</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Animation Speed</Label>
                            <Select defaultValue="normal">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="fast">Fast</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="slow">Slow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Data Labels</div>
                            <div className="text-sm text-gray-500">Display values on charts by default</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Tooltips</div>
                            <div className="text-sm text-gray-500">Show details on hover</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'data' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-cyan-600" />
                          Data Refresh
                        </CardTitle>
                        <CardDescription>Configure data refresh and caching</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Refresh Interval</Label>
                          <Select defaultValue="hourly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realtime">Real-time</SelectItem>
                              <SelectItem value="5min">Every 5 minutes</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="manual">Manual only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Query Caching</div>
                            <div className="text-sm text-gray-500">Cache results for faster loading</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Last Updated</div>
                            <div className="text-sm text-gray-500">Display data refresh timestamp</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          Data Extract
                        </CardTitle>
                        <CardDescription>Configure data extract and storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Extract Schedule</Label>
                          <Select defaultValue="daily">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Incremental Refresh</div>
                            <div className="text-sm text-gray-500">Only update new and changed data</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Compress Extracts</div>
                            <div className="text-sm text-gray-500">Reduce storage size</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Report Notifications
                        </CardTitle>
                        <CardDescription>Configure report update notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Report Published</div>
                            <div className="text-sm text-gray-500">Notify when reports are published</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Report Updated</div>
                            <div className="text-sm text-gray-500">Notify when reports are modified</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Scheduled Report Ready</div>
                            <div className="text-sm text-gray-500">Notify when scheduled reports complete</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Data Refresh Errors</div>
                            <div className="text-sm text-gray-500">Notify when data refresh fails</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Email Delivery
                        </CardTitle>
                        <CardDescription>Configure email report delivery</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Email Format</Label>
                          <Select defaultValue="pdf">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF Attachment</SelectItem>
                              <SelectItem value="inline">Inline in Email</SelectItem>
                              <SelectItem value="link">Link to Report</SelectItem>
                              <SelectItem value="both">PDF + Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Include Summary</div>
                            <div className="text-sm text-gray-500">Add key metrics in email body</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Compress Large Attachments</div>
                            <div className="text-sm text-gray-500">Zip files over 10MB</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-indigo-600" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>Manage data source integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">S</span>
                            </div>
                            <div>
                              <div className="font-medium">Snowflake</div>
                              <div className="text-sm text-gray-500">Cloud data warehouse</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                              <span className="text-white font-bold">G</span>
                            </div>
                            <div>
                              <div className="font-medium">Google Analytics</div>
                              <div className="text-sm text-gray-500">Web analytics data</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">SF</span>
                            </div>
                            <div>
                              <div className="font-medium">Salesforce</div>
                              <div className="text-sm text-gray-500">CRM data</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                              <span className="text-white font-bold">R</span>
                            </div>
                            <div>
                              <div className="font-medium">Redshift</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API credentials and embed codes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="tb_live_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline">Copy</Button>
                            <Button variant="outline">Regenerate</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Embed Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="embed_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline">Copy</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Embedded Analytics</div>
                            <div className="text-sm text-gray-500">Allow embedding reports in other sites</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Configure security and access controls</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Row-Level Security</div>
                            <div className="text-sm text-gray-500">Filter data based on user permissions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Data Masking</div>
                            <div className="text-sm text-gray-500">Hide sensitive fields from certain users</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Audit Logging</div>
                            <div className="text-sm text-gray-500">Log all report access and actions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">SSO Enforcement</div>
                            <div className="text-sm text-gray-500">Require single sign-on for all users</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-purple-600" />
                          Performance
                        </CardTitle>
                        <CardDescription>Configure performance and limits</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Query Timeout</Label>
                          <Select defaultValue="5">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 minute</SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Max Rows Per Query</Label>
                          <Select defaultValue="1m">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100k">100,000</SelectItem>
                              <SelectItem value="500k">500,000</SelectItem>
                              <SelectItem value="1m">1,000,000</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete All Reports</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all reports and data</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Clear All Caches</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Force refresh all cached data</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockReportsAIInsights}
              title="Reports Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockReportsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockReportsPredictions}
              title="Analytics Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockReportsActivities}
            title="Reports Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockReportsQuickActions}
            variant="grid"
          />
        </div>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <ScrollArea className="max-h-[80vh]">
              {selectedReport && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center">
                        {(() => {
                          const TypeIcon = getTypeIcon(selectedReport.type)
                          return <TypeIcon className="h-8 w-8 text-purple-600" />
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <DialogTitle className="text-2xl">{selectedReport.name}</DialogTitle>
                          {selectedReport.isFavorite && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-gray-500 mt-1">{selectedReport.description}</p>
                      </div>
                      <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                    </div>
                  </DialogHeader>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedReport.views)}</p>
                      <p className="text-sm text-gray-500">Views</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.shares}</p>
                      <p className="text-sm text-gray-500">Shares</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.charts}</p>
                      <p className="text-sm text-gray-500">Charts</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.refreshSchedule || 'Manual'}</p>
                      <p className="text-sm text-gray-500">Refresh</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Data Source</h4>
                      <p className="text-gray-600">{selectedReport.dataSource}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Folder</h4>
                      <p className="text-gray-600">{selectedReport.folder}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Created</h4>
                      <p className="text-gray-600">{selectedReport.createdAt}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Last Modified</h4>
                      <p className="text-gray-600">{selectedReport.lastModified}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Report
                    </Button>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="ghost" className="ml-auto text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Create Report Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer">
                  <LayoutDashboard className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium">Dashboard</h4>
                  <p className="text-sm text-gray-500">Interactive data dashboard</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer">
                  <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">Chart</h4>
                  <p className="text-sm text-gray-500">Single visualization</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer">
                  <Table2 className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-medium">Table Report</h4>
                  <p className="text-sm text-gray-500">Tabular data report</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer">
                  <FileText className="h-8 w-8 text-amber-600 mb-2" />
                  <h4 className="font-medium">Story</h4>
                  <p className="text-sm text-gray-500">Narrative with visuals</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
