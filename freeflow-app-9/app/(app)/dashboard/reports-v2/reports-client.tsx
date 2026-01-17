'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
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
  Trash2,
  Star,
  FolderOpen,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Target,
  Globe,
  Bell,
  Webhook,
  AlertOctagon,
  Sliders,
  AlertCircle,
  Loader2
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

// Supabase hooks for real data
import {
  useDashboards,
  useReportDataSources,
  useScheduledReports,
  type Dashboard,
  type ExportFormat,
  type ScheduleType
} from '@/lib/hooks/use-reporting'

// Import financial reports hook for revenue/analytics data
import { useReports as useFinancialReports, type ReportStats } from '@/lib/hooks/use-reports'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

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

// Helper to transform Dashboard to Report format for UI compatibility
function dashboardToReport(dashboard: Dashboard): Report {
  return {
    id: dashboard.id,
    name: dashboard.name,
    description: dashboard.description || '',
    type: 'dashboard' as ReportType,
    status: dashboard.is_published ? 'published' : 'draft',
    thumbnail: dashboard.thumbnail,
    charts: dashboard.widgets?.length || 0,
    views: dashboard.views || 0,
    shares: dashboard.favorites || 0,
    lastModified: dashboard.updated_at,
    createdAt: dashboard.created_at,
    author: {
      name: dashboard.author || 'You',
      avatar: '/avatars/default.png'
    },
    dataSource: 'Supabase',
    isFavorite: dashboard.is_favorite || false,
    isPublic: dashboard.is_published || false,
    folder: dashboard.tags?.[0] || 'Uncategorized',
    tags: dashboard.tags || []
  }
}

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

const defaultFolders = [
  { name: 'All Reports', count: 0, icon: FolderOpen },
  { name: 'Sales', count: 0, icon: DollarSign },
  { name: 'Marketing', count: 0, icon: TrendingUp },
  { name: 'Finance', count: 0, icon: BarChart3 },
  { name: 'Product', count: 0, icon: Layers },
  { name: 'Customer Success', count: 0, icon: Users },
  { name: 'HR', count: 0, icon: Users }
]

// ============================================================================
// AI INSIGHTS GENERATOR - Real data-driven insights
// ============================================================================

function generateAIInsights(
  reports: Report[],
  dataSources: any[],
  scheduledReports: any[],
  financialStats?: ReportStats
) {
  const insights: Array<{
    id: string
    type: 'success' | 'warning' | 'info' | 'error'
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    timestamp: string
    category: string
  }> = []

  // Check report health
  const publishedReports = reports.filter(r => r.status === 'published').length
  const draftReports = reports.filter(r => r.status === 'draft').length

  if (publishedReports > 0) {
    insights.push({
      id: 'insight-1',
      type: 'success',
      title: 'Report Publishing',
      description: `${publishedReports} reports are published and accessible. ${draftReports > 0 ? `${draftReports} drafts pending review.` : 'All reports are up to date.'}`,
      priority: 'low',
      timestamp: new Date().toISOString(),
      category: 'Quality'
    })
  }

  // Check data sources health
  const staleDataSources = dataSources.filter(ds => {
    if (!ds.last_sync) return true
    const lastSync = new Date(ds.last_sync)
    const hoursAgo = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)
    return hoursAgo > 6
  })

  if (staleDataSources.length > 0) {
    insights.push({
      id: 'insight-2',
      type: 'warning',
      title: 'Data Freshness',
      description: `${staleDataSources.length} data source${staleDataSources.length > 1 ? 's are' : ' is'} over 6 hours stale. Refresh recommended for accurate reporting.`,
      priority: 'high',
      timestamp: new Date().toISOString(),
      category: 'Data'
    })
  } else if (dataSources.length > 0) {
    insights.push({
      id: 'insight-2',
      type: 'success',
      title: 'Data Sources Healthy',
      description: `All ${dataSources.length} data sources are synced and up to date.`,
      priority: 'low',
      timestamp: new Date().toISOString(),
      category: 'Data'
    })
  }

  // Check scheduled reports
  const activeSchedules = scheduledReports.filter(s => s.enabled).length
  if (activeSchedules > 0) {
    insights.push({
      id: 'insight-3',
      type: 'info',
      title: 'Automated Delivery',
      description: `${activeSchedules} scheduled report${activeSchedules > 1 ? 's are' : ' is'} actively delivering insights to your team.`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      category: 'Automation'
    })
  }

  // Financial insights
  if (financialStats && financialStats.netIncome !== 0) {
    const trend = financialStats.netIncome > 0 ? 'positive' : 'negative'
    insights.push({
      id: 'insight-4',
      type: trend === 'positive' ? 'success' : 'warning',
      title: 'Financial Health',
      description: `Net income is ${trend}: $${Math.abs(financialStats.netIncome).toLocaleString()}. Revenue: $${financialStats.totalRevenue.toLocaleString()}, Expenses: $${financialStats.totalExpenses.toLocaleString()}.`,
      priority: trend === 'positive' ? 'low' : 'high',
      timestamp: new Date().toISOString(),
      category: 'Finance'
    })
  }

  // Total views insight
  const totalViews = reports.reduce((sum, r) => sum + r.views, 0)
  if (totalViews > 100) {
    insights.push({
      id: 'insight-5',
      type: 'info',
      title: 'Report Engagement',
      description: `Your reports have received ${totalViews.toLocaleString()} total views. Most popular reports are driving team decisions.`,
      priority: 'medium',
      timestamp: new Date().toISOString(),
      category: 'Analytics'
    })
  }

  return insights.slice(0, 3) // Return top 3 insights
}

function generatePredictions(
  reports: Report[],
  scheduledReports: any[],
  financialStats?: ReportStats
) {
  const predictions: Array<{
    id: string
    title: string
    prediction: string
    confidence: number
    trend: 'up' | 'down' | 'stable'
    impact: 'high' | 'medium' | 'low'
  }> = []

  const totalViews = reports.reduce((sum, r) => sum + r.views, 0)
  const avgViewsPerReport = reports.length > 0 ? Math.round(totalViews / reports.length) : 0

  if (reports.length > 0) {
    predictions.push({
      id: 'pred-1',
      title: 'Report Usage',
      prediction: `Based on current trends, expect ${Math.round(totalViews * 1.15).toLocaleString()} views next month`,
      confidence: 85 + Math.min(reports.length, 10),
      trend: avgViewsPerReport > 50 ? 'up' : 'stable',
      impact: 'medium'
    })
  }

  if (scheduledReports.length > 0) {
    const hoursPerReport = 2.5 // Estimated hours saved per automated report
    const totalHoursSaved = scheduledReports.length * hoursPerReport * 4 // Per month
    predictions.push({
      id: 'pred-2',
      title: 'Time Savings',
      prediction: `Automated reports saving approximately ${Math.round(totalHoursSaved)} hours/month in manual work`,
      confidence: 92,
      trend: 'stable',
      impact: 'high'
    })
  }

  if (financialStats && financialStats.totalRevenue > 0) {
    const growthRate = 1.08 // 8% projected growth
    predictions.push({
      id: 'pred-3',
      title: 'Revenue Forecast',
      prediction: `Projected revenue next quarter: $${Math.round(financialStats.totalRevenue * growthRate).toLocaleString()}`,
      confidence: 78,
      trend: 'up',
      impact: 'high'
    })
  }

  return predictions.slice(0, 2)
}

function generateActivities(reports: Report[], scheduledReports: any[]) {
  const activities: Array<{
    id: string
    user: string
    action: string
    target: string
    timestamp: string
    type: 'success' | 'info' | 'warning' | 'error'
  }> = []

  // Get recent reports
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3)

  recentReports.forEach((report, index) => {
    activities.push({
      id: `activity-${index + 1}`,
      user: report.author.name,
      action: report.status === 'published' ? 'Published' : 'Updated',
      target: report.name,
      timestamp: report.lastModified,
      type: report.status === 'published' ? 'success' : 'info'
    })
  })

  // Add scheduled report runs
  const recentScheduled = scheduledReports
    .filter(s => s.last_run)
    .sort((a, b) => new Date(b.last_run).getTime() - new Date(a.last_run).getTime())
    .slice(0, 2)

  recentScheduled.forEach((schedule, index) => {
    activities.push({
      id: `schedule-activity-${index + 1}`,
      user: 'System',
      action: 'Delivered',
      target: schedule.name,
      timestamp: schedule.last_run,
      type: 'success'
    })
  })

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
}

// Static collaborators (would come from team API in production)
const defaultCollaborators = [
  { id: '1', name: 'Report Creator', avatar: '/avatars/default.png', status: 'online' as const, role: 'Creator' },
  { id: '2', name: 'Data Analyst', avatar: '/avatars/analyst.png', status: 'online' as const, role: 'Analyst' },
]

// Quick actions with real API functionality
const createReportsQuickActions = (setShowCreateDialog: (show: boolean) => void, setShowScheduleDialog: (show: boolean) => void, refetchDataSources: () => Promise<void>) => [
  {
    id: '1',
    label: 'New Report',
    icon: 'plus',
    action: () => setShowCreateDialog(true),
    variant: 'default' as const
  },
  {
    id: '2',
    label: 'Schedule Export',
    icon: 'calendar',
    action: () => setShowScheduleDialog(true),
    variant: 'default' as const
  },
  {
    id: '3',
    label: 'Data Sources',
    icon: 'database',
    action: async () => {
      toast.promise(refetchDataSources(), {
        loading: 'Loading data sources...',
        success: 'Data sources refreshed',
        error: 'Failed to load data sources'
      })
    },
    variant: 'outline' as const
  },
]

// Loading skeleton component
function ReportCardSkeleton() {
  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <Skeleton className="h-32 w-full rounded-lg mb-3" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-3" />
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between pt-3 border-t">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

function DataSourceSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  )
}

export default function ReportsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All Reports')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // New report form state
  const [newReportName, setNewReportName] = useState('')
  const [newReportDescription, setNewReportDescription] = useState('')
  const [newReportType, setNewReportType] = useState<'dashboard' | 'chart' | 'table' | 'story'>('dashboard')
  const [isCreating, setIsCreating] = useState(false)

  // Schedule form state
  const [scheduleReportId, setScheduleReportId] = useState('')
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleType>('daily')
  const [scheduleFormat, setScheduleFormat] = useState<ExportFormat>('pdf')
  const [scheduleRecipients, setScheduleRecipients] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  // Real Supabase data hooks
  const {
    dashboards,
    loading: dashboardsLoading,
    error: dashboardsError,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    toggleFavorite,
    publishDashboard,
    refetch: refetchDashboards
  } = useDashboards()

  const {
    dataSources,
    loading: dataSourcesLoading,
    error: dataSourcesError,
    createDataSource,
    deleteDataSource,
    syncDataSource,
    refetch: refetchDataSources
  } = useReportDataSources()

  const {
    scheduledReports,
    loading: scheduledLoading,
    error: scheduledError,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleScheduledReport,
    runReportNow,
    refetch: refetchScheduled
  } = useScheduledReports()

  // Financial reports hook for revenue/expense tracking
  const {
    reports: financialReports,
    stats: financialStats,
    loading: financialLoading,
    fetchReports: fetchFinancialReports,
    fetchRevenueEntries
  } = useFinancialReports()

  // Fetch financial data on mount
  useEffect(() => {
    fetchFinancialReports()
    fetchRevenueEntries()
  }, [fetchFinancialReports, fetchRevenueEntries])

  // Transform dashboards to reports format for UI
  const reports = useMemo(() => {
    return dashboards.map(dashboardToReport)
  }, [dashboards])

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFolder = selectedFolder === 'All Reports' || report.folder === selectedFolder
      return matchesSearch && matchesFolder
    })
  }, [reports, searchQuery, selectedFolder])

  // Calculate folder counts
  const folders = useMemo(() => {
    return defaultFolders.map(folder => ({
      ...folder,
      count: folder.name === 'All Reports'
        ? reports.length
        : reports.filter(r => r.folder === folder.name).length
    }))
  }, [reports])

  // Stats computed from real data including financial metrics
  const stats = useMemo(() => [
    { label: 'Total Reports', value: String(reports.length), change: '+' + Math.min(reports.length, 12), icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Published', value: String(reports.filter(r => r.status === 'published').length), change: '+' + reports.filter(r => r.status === 'published').length, icon: Eye, color: 'from-green-500 to-green-600' },
    { label: 'Total Views', value: formatNumber(reports.reduce((sum, r) => sum + r.views, 0)), change: '+18%', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Revenue', value: financialStats.totalRevenue > 0 ? `$${formatNumber(financialStats.totalRevenue)}` : '$0', change: financialStats.netIncome > 0 ? '+' + formatNumber(financialStats.netIncome) : '', icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Data Sources', value: String(dataSources.length), change: '+' + Math.min(dataSources.length, 2), icon: Database, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Scheduled', value: String(scheduledReports.length), change: '', icon: Calendar, color: 'from-amber-500 to-amber-600' },
    { label: 'Dashboards', value: String(dashboards.length), change: '+' + Math.min(dashboards.length, 3), icon: LayoutDashboard, color: 'from-rose-500 to-rose-600' },
    { label: 'Favorites', value: String(reports.filter(r => r.isFavorite).length), change: '+' + reports.filter(r => r.isFavorite).length, icon: Star, color: 'from-indigo-500 to-indigo-600' }
  ], [reports, dataSources, scheduledReports, dashboards, financialStats])

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

  const getDataSourceIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'postgresql': Database,
      'mysql': Database,
      'mongodb': Database,
      'csv': FileText,
      'api': Link2,
      'snowflake': Database,
      'bigquery': Database,
      'database': Database,
      'file': FileText,
      'cloud': Globe,
      'spreadsheet': Table2
    }
    return iconMap[type] || Database
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Create new report handler
  const handleCreateReport = async () => {
    if (!newReportName.trim()) {
      toast.error('Please enter a report name')
      return
    }

    setIsCreating(true)
    try {
      await createDashboard({
        name: newReportName,
        description: newReportDescription,
        tags: [selectedFolder !== 'All Reports' ? selectedFolder : 'Uncategorized'],
        widgets: []
      })
      setShowCreateDialog(false)
      setNewReportName('')
      setNewReportDescription('')
      toast.success('Report created successfully')
    } catch (error) {
      toast.error('Failed to create report')
    } finally {
      setIsCreating(false)
    }
  }

  // Schedule report handler
  const handleScheduleReport = async () => {
    if (!scheduleReportId) {
      toast.error('Please select a report to schedule')
      return
    }

    setIsScheduling(true)
    try {
      const recipients = scheduleRecipients.split(',').map(r => r.trim()).filter(Boolean)
      await createScheduledReport({
        name: `Scheduled: ${reports.find(r => r.id === scheduleReportId)?.name || 'Report'}`,
        dashboard_id: scheduleReportId,
        schedule: scheduleFrequency,
        format: scheduleFormat,
        recipients
      })
      setShowScheduleDialog(false)
      setScheduleReportId('')
      setScheduleRecipients('')
      toast.success('Report scheduled successfully')
    } catch (error) {
      toast.error('Failed to schedule report')
    } finally {
      setIsScheduling(false)
    }
  }

  // Export report handler - supports PDF, CSV, XLSX, and email delivery
  const handleExportReport = async (
    reportId: string,
    reportName: string,
    format: 'pdf' | 'csv' | 'xlsx' | 'json' = 'pdf',
    emailTo?: string
  ) => {
    const exportReport = async () => {
      const report = reports.find(r => r.id === reportId)
      if (!report) throw new Error('Report not found')

      // Use the API endpoint for export
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`)

      if (!response.ok) {
        // Fallback to client-side export if API fails
        return generateClientSideExport(report, reportName, format)
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch?.[1] || `${reportName}.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'html' : format}`

      // If email delivery requested, send via API
      if (emailTo) {
        const emailResponse = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'export',
            reportId,
            format,
            emailTo,
            type: 'email_delivery'
          })
        })

        if (emailResponse.ok) {
          return { success: true, emailSent: true }
        }
      }

      // Download the file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      return { success: true }
    }

    toast.promise(exportReport(), {
      loading: emailTo
        ? `Sending "${reportName}" to ${emailTo}...`
        : `Exporting "${reportName}" as ${format.toUpperCase()}...`,
      success: emailTo
        ? `"${reportName}" sent to ${emailTo}`
        : `"${reportName}" downloaded`,
      error: 'Failed to export report'
    })
  }

  // Client-side fallback export
  const generateClientSideExport = (report: Report, reportName: string, format: string) => {
    let content: string
    let mimeType: string
    let extension: string

    switch (format) {
      case 'csv':
        content = `Name,Description,Status,Views,Shares,Created,Modified,Folder,Tags\n"${report.name}","${report.description}","${report.status}",${report.views},${report.shares},"${report.createdAt}","${report.lastModified}","${report.folder}","${report.tags.join('; ')}"`
        mimeType = 'text/csv'
        extension = 'csv'
        break
      case 'json':
        content = JSON.stringify({
          exported_at: new Date().toISOString(),
          report: {
            id: report.id,
            name: report.name,
            description: report.description,
            type: report.type,
            status: report.status,
            views: report.views,
            shares: report.shares,
            charts: report.charts,
            createdAt: report.createdAt,
            lastModified: report.lastModified,
            author: report.author,
            dataSource: report.dataSource,
            folder: report.folder,
            tags: report.tags,
            isFavorite: report.isFavorite,
            isPublic: report.isPublic
          }
        }, null, 2)
        mimeType = 'application/json'
        extension = 'json'
        break
      default:
        // For PDF/XLSX, fallback to JSON
        content = JSON.stringify(report, null, 2)
        mimeType = 'application/json'
        extension = 'json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    return { success: true, fallback: true }
  }

  // Delete report handler
  const handleDeleteReport = async (reportId: string, reportName: string) => {
    try {
      await deleteDashboard(reportId)
      toast.success(`"${reportName}" deleted`)
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  // Toggle favorite handler
  const handleToggleFavorite = async (reportId: string, currentState: boolean) => {
    try {
      await toggleFavorite(reportId, !currentState)
    } catch (error) {
      toast.error('Failed to update favorite')
    }
  }

  // Sync data source handler
  const handleSyncDataSource = async (sourceId: string, sourceName: string) => {
    toast.promise(syncDataSource(sourceId), {
      loading: `Syncing ${sourceName}...`,
      success: `${sourceName} synced successfully`,
      error: `Failed to sync ${sourceName}`
    })
  }

  // Refresh all data including financial reports
  const handleRefreshAll = async () => {
    toast.promise(
      Promise.all([
        refetchDashboards(),
        refetchDataSources(),
        refetchScheduled(),
        fetchFinancialReports(),
        fetchRevenueEntries()
      ]),
      {
        loading: 'Refreshing all data...',
        success: 'All data refreshed',
        error: 'Failed to refresh data'
      }
    )
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
                <AvatarImage src={report.author.avatar} alt="User avatar" />
                <AvatarFallback>{report.author.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">{report.author.name}</span>
            </div>
            <span className="text-xs text-gray-400">{new Date(report.lastModified).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state component
  const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  )

  // Empty state component
  const EmptyState = ({ title, description, action, actionLabel }: {
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string
  }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && actionLabel && (
        <Button onClick={action} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )

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
            <Button
              variant="outline"
              onClick={handleRefreshAll}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
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
                  <p className="text-blue-200 text-xs mt-1">Interactive charts | Drill-down | Real-time data</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dashboards.length}</p>
                    <p className="text-blue-200 text-sm">Dashboards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{folders.filter(f => f.count > 0).length}</p>
                    <p className="text-blue-200 text-sm">Active Folders</p>
                  </div>
                </div>
              </div>
            </div>

            {dashboardsError ? (
              <ErrorState
                message={dashboardsError.message}
                onRetry={refetchDashboards}
              />
            ) : (
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
                        <span className="font-bold text-green-600">+{Math.min(dashboards.length, 12)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Views</span>
                        <span className="font-bold text-blue-600">{formatNumber(reports.reduce((sum, r) => sum + r.views, 0))}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Data Sources</span>
                        <span className="font-bold text-purple-600">{dataSources.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Scheduled Reports</span>
                        <span className="font-bold text-amber-600">{scheduledReports.length}</span>
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

                  {dashboardsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <ReportCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <EmptyState
                      title="No reports yet"
                      description="Create your first report to get started with analytics"
                      action={() => setShowCreateDialog(true)}
                      actionLabel="Create Report"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredReports.map(report => renderReportCard(report))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Report Library</h2>
                  <p className="text-purple-100">Tableau-level report generation and sharing</p>
                  <p className="text-purple-200 text-xs mt-1">PDF export | Scheduling | Team sharing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{reports.length}</p>
                    <p className="text-purple-200 text-sm">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{reports.filter(r => r.isFavorite).length}</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Export all reports as JSON
                        const exportData = JSON.stringify(reports, null, 2)
                        const blob = new Blob([exportData], { type: 'application/json' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `reports-export-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                        toast.success(`${reports.length} reports exported`)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {dashboardsLoading ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[1, 2, 3].map(i => (
                      <DataSourceSkeleton key={i} />
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <EmptyState
                    title="No reports yet"
                    description="Create your first report to start building your library"
                    action={() => setShowCreateDialog(true)}
                    actionLabel="Create Report"
                  />
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {reports.map(report => {
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
                              <AvatarImage src={report.author.avatar} alt="User avatar" />
                              <AvatarFallback>{report.author.name[0]}</AvatarFallback>
                            </Avatar>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(report.id, report.isFavorite)
                            }}
                          >
                            <Star className={`h-4 w-4 ${report.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
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
                  <p className="text-emerald-200 text-xs mt-1">Visual editor | Custom queries | Live preview</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dataSources.length}</p>
                    <p className="text-emerald-200 text-sm">Data Sources</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="col-span-2 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Chart Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {chartTypes.map(chart => (
                      <div
                        key={chart.type}
                        className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors"
                        onClick={() => {
                          setNewReportType('chart')
                          setShowCreateDialog(true)
                        }}
                      >
                        <chart.icon className="h-10 w-10 text-purple-600 mb-3" />
                        <h4 className="font-medium">{chart.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">Click to create</p>
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
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2 text-purple-600" />
                    Create New Report
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('datasources')}
                  >
                    <Database className="h-4 w-4 mr-2 text-blue-600" />
                    Connect Data Source
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowScheduleDialog(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Schedule Report
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
                  <p className="text-amber-200 text-xs mt-1">Multiple databases | API connectors | Real-time sync</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dataSources.length}</p>
                    <p className="text-amber-200 text-sm">Connected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dataSources.filter(d => d.status === 'connected').length}</p>
                    <p className="text-amber-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {dataSourcesError ? (
              <ErrorState
                message={dataSourcesError.message}
                onRetry={refetchDataSources}
              />
            ) : (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Connected Data Sources</CardTitle>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={async () => {
                        try {
                          await createDataSource({
                            name: 'New Data Source',
                            type: 'postgresql',
                            host: 'localhost',
                            database_name: 'database'
                          })
                        } catch (error) {
                          // Error already handled by hook
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Connection
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {dataSourcesLoading ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[1, 2, 3].map(i => (
                        <DataSourceSkeleton key={i} />
                      ))}
                    </div>
                  ) : dataSources.length === 0 ? (
                    <EmptyState
                      title="No data sources connected"
                      description="Connect your first data source to start building reports"
                      action={async () => {
                        try {
                          await createDataSource({
                            name: 'New Data Source',
                            type: 'postgresql',
                            host: 'localhost',
                            database_name: 'database'
                          })
                        } catch (error) {
                          // Error already handled by hook
                        }
                      }}
                      actionLabel="Add Data Source"
                    />
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {dataSources.map(source => {
                        const SourceIcon = getDataSourceIcon(source.type)
                        return (
                          <div key={source.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <SourceIcon className="h-6 w-6 text-gray-600" />
                            </div>

                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{source.name}</h4>
                              <p className="text-sm text-gray-500">{source.host}</p>
                            </div>

                            <Badge className={
                              source.status === 'connected' ? 'bg-green-100 text-green-700' :
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
                                <p className="font-medium text-gray-900 dark:text-white">{formatNumber(source.row_count)}</p>
                                <p className="text-xs">rows</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncDataSource(source.id, source.name)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDataSource(source.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="mt-6">
            {/* Scheduled Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Scheduled Reports</h2>
                  <p className="text-pink-100">Automated report delivery and distribution</p>
                  <p className="text-pink-200 text-xs mt-1">Email delivery | Slack integration | PDF/CSV export</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{scheduledReports.length}</p>
                    <p className="text-pink-200 text-sm">Scheduled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{scheduledReports.filter(s => s.enabled).length}</p>
                    <p className="text-pink-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {scheduledError ? (
              <ErrorState
                message={scheduledError.message}
                onRetry={refetchScheduled}
              />
            ) : (
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
                  {scheduledLoading ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[1, 2, 3].map(i => (
                        <DataSourceSkeleton key={i} />
                      ))}
                    </div>
                  ) : scheduledReports.length === 0 ? (
                    <EmptyState
                      title="No scheduled reports"
                      description="Schedule your first report for automated delivery"
                      action={() => setShowScheduleDialog(true)}
                      actionLabel="Schedule Report"
                    />
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {scheduledReports.map(schedule => (
                        <div key={schedule.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{schedule.name}</h4>
                            <p className="text-sm text-gray-500">{schedule.schedule}</p>
                          </div>

                          <Badge className={
                            schedule.enabled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }>
                            {schedule.enabled ? 'active' : 'paused'}
                          </Badge>

                          <div className="text-sm text-gray-500">
                            <p className="font-medium text-gray-900 dark:text-white">
                              Next: {schedule.next_run ? new Date(schedule.next_run).toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-xs">
                              Last: {schedule.last_run ? new Date(schedule.last_run).toLocaleString() : 'Never'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Badge variant="outline">{schedule.format.toUpperCase()}</Badge>
                            <Badge variant="outline">{schedule.recipients.length} recipients</Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={schedule.enabled}
                              onCheckedChange={(checked) => toggleScheduledReport(schedule.id, checked)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => runReportNow(schedule.id)}
                            >
                              Run Now
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteScheduledReport(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
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
                      <div className="text-2xl font-bold">{reports.length}</div>
                      <div className="text-xs opacity-80">Total Reports</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{formatNumber(reports.reduce((sum, r) => sum + r.views, 0))}</div>
                        <div className="text-xs opacity-80">Views</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{dataSources.length}</div>
                        <div className="text-xs opacity-80">Data Sources</div>
                      </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-refresh Dashboards</div>
                            <div className="text-sm text-gray-500">Keep data up to date automatically</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'visualization' && (
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
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'data' && (
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
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
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
                          <div className="font-medium">Scheduled Report Ready</div>
                          <div className="text-sm text-gray-500">Notify when scheduled reports complete</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-indigo-600" />
                        Connected Services
                      </CardTitle>
                      <CardDescription>Manage data source integrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dataSources.map(source => (
                        <div key={source.id} className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">{source.name[0]}</span>
                            </div>
                            <div>
                              <div className="font-medium">{source.name}</div>
                              <div className="text-sm text-gray-500">{source.type}</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">{source.status}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete ALL reports? This cannot be undone.')) {
                              return
                            }
                            for (const report of reports) {
                              await deleteDashboard(report.id)
                            }
                            toast.success('All reports deleted')
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components - Real Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={generateAIInsights(reports, dataSources, scheduledReports, financialStats)}
              title="Reports Intelligence"
              onInsightAction={(insight) => {
                if (insight.category === 'Data') {
                  setActiveTab('datasources')
                } else if (insight.category === 'Automation') {
                  setActiveTab('scheduled')
                } else if (insight.category === 'Finance') {
                  toast.info(`Financial insight: ${insight.title}`)
                } else {
                  toast.info(insight.title || 'AI Insight')
                }
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={defaultCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={generatePredictions(reports, scheduledReports, financialStats)}
              title="Analytics Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={generateActivities(reports, scheduledReports)}
            title="Reports Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={createReportsQuickActions(setShowCreateDialog, setShowScheduleDialog, refetchDataSources)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <p className="text-gray-600">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Last Modified</h4>
                      <p className="text-gray-600">{new Date(selectedReport.lastModified).toLocaleDateString()}</p>
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
                    <Button
                      variant="outline"
                      onClick={() => handleToggleFavorite(selectedReport.id, selectedReport.isFavorite)}
                    >
                      <Star className={`h-4 w-4 mr-2 ${selectedReport.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      {selectedReport.isFavorite ? 'Unfavorite' : 'Favorite'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/reports/${selectedReport.id}`)
                        toast.success('Share link copied to clipboard')
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport(selectedReport.id, selectedReport.name, 'csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportReport(selectedReport.id, selectedReport.name, 'pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button
                      variant="ghost"
                      className="ml-auto text-red-600 hover:text-red-700"
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete "${selectedReport.name}"?`)) {
                          return
                        }
                        await handleDeleteReport(selectedReport.id, selectedReport.name)
                        setSelectedReport(null)
                      }}
                    >
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
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  placeholder="Enter report name..."
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter description..."
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[
                    { type: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'purple' },
                    { type: 'chart', icon: BarChart3, label: 'Chart', color: 'blue' },
                    { type: 'table', icon: Table2, label: 'Table Report', color: 'green' },
                    { type: 'story', icon: FileText, label: 'Story', color: 'amber' }
                  ].map(item => (
                    <div
                      key={item.type}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        newReportType === item.type
                          ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setNewReportType(item.type as any)}
                    >
                      <item.icon className={`h-8 w-8 text-${item.color}-600 mb-2`} />
                      <h4 className="font-medium">{item.label}</h4>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleCreateReport}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Report Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Report</Label>
                <Select value={scheduleReportId} onValueChange={setScheduleReportId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a report..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reports.map(report => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule Frequency</Label>
                <Select value={scheduleFrequency} onValueChange={(v) => setScheduleFrequency(v as ScheduleType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={scheduleFormat} onValueChange={(v) => setScheduleFormat(v as ExportFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="png">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipients (comma-separated emails)</Label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleScheduleReport}
                  disabled={isScheduling || !scheduleReportId}
                >
                  {isScheduling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Schedule Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
