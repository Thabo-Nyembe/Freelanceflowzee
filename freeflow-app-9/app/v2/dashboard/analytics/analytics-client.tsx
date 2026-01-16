'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
import {
  useAnalyticsConversionFunnels,
  useAnalyticsDashboards,
  useAnalyticsReports,
  useAnalyticsMetrics,
} from '@/lib/hooks/use-analytics-extended'
import { useSupabaseMutation } from '@/lib/hooks/use-supabase-mutation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import {
  BarChart3, LineChart, PieChart, TrendingUp, Activity,
  Target, Users, DollarSign, Eye, MousePointer, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Download, RefreshCw, Settings, Plus,
  Calendar, Filter, Layers, Zap, Bell, ChevronRight, MoreVertical,
  AreaChart, Gauge, Globe, Smartphone, Monitor, Search, Play, Pause,
  FileText, Layout, Share2, Trash2, Copy, Edit3, Database, GitBranch, Workflow, Mail
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
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
  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)
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
  const [isLoading, setIsLoading] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')
  const [showAddMetric, setShowAddMetric] = useState(false)
  const [showMetricOptions, setShowMetricOptions] = useState<string | null>(null)
  const [showCreateCohort, setShowCreateCohort] = useState(false)
  const [showEditReport, setShowEditReport] = useState<string | null>(null)
  const [showViewDashboard, setShowViewDashboard] = useState<string | null>(null)
  const [showConnectIntegration, setShowConnectIntegration] = useState<string | null>(null)
  const [showRegenerateApiKey, setShowRegenerateApiKey] = useState(false)
  const [showConfigureEventSchema, setShowConfigureEventSchema] = useState(false)
  const [showResetData, setShowResetData] = useState(false)
  const [showDeleteTracking, setShowDeleteTracking] = useState(false)
  const [showRevokeApiKeys, setShowRevokeApiKeys] = useState(false)

  // Filter and date range state
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showCustomDateRange, setShowCustomDateRange] = useState(false)
  const [showCompareDialog, setShowCompareDialog] = useState(false)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [compareDateRange, setCompareDateRange] = useState({
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [activeFilters, setActiveFilters] = useState<{
    categories: string[]
    metricTypes: string[]
    status: string[]
    minValue: string
    maxValue: string
  }>({
    categories: [],
    metricTypes: [],
    status: [],
    minValue: '',
    maxValue: ''
  })
  const [showSaveReportDialog, setShowSaveReportDialog] = useState(false)
  const [customReportForm, setCustomReportForm] = useState({
    name: '',
    description: '',
    metrics: [] as string[],
    schedule: 'none' as 'none' | 'daily' | 'weekly' | 'monthly'
  })

  // Metric action dialogs
  const [showDuplicateMetric, setShowDuplicateMetric] = useState(false)
  const [showSetAlertDialog, setShowSetAlertDialog] = useState(false)
  const [showShareMetric, setShowShareMetric] = useState(false)
  const [showDeleteMetric, setShowDeleteMetric] = useState(false)
  const [selectedMetricForAction, setSelectedMetricForAction] = useState<string | null>(null)

  // Database hooks - Extended analytics hooks
  const { data: dbFunnels = [], isLoading: funnelsLoading, refresh: refreshFunnels } = useAnalyticsConversionFunnels(userId || undefined)
  const { data: dbReports = [], isLoading: reportsLoading, refresh: refreshReports } = useAnalyticsReports(userId || undefined)
  const { data: dbDashboards = [], isLoading: dashboardsLoading, refresh: refreshDashboards } = useAnalyticsDashboards(userId || undefined)
  const { data: dbMetrics = [], isLoading: metricsLoading, refresh: refreshMetrics } = useAnalyticsMetrics(userId || undefined)

  // Mutation hooks for CRUD operations
  const funnelsMutation = useSupabaseMutation({
    table: 'analytics_conversion_funnels',
    onSuccess: () => refreshFunnels()
  })
  const reportsMutation = useSupabaseMutation({
    table: 'analytics_reports',
    onSuccess: () => refreshReports()
  })
  const dashboardsMutation = useSupabaseMutation({
    table: 'analytics_dashboards',
    onSuccess: () => refreshDashboards()
  })
  const metricsMutation = useSupabaseMutation({
    table: 'analytics_metrics',
    onSuccess: () => refreshMetrics()
  })
  const alertsMutation = useSupabaseMutation({
    table: 'analytics_alerts'
  })

  // Form state for creating funnel
  const [funnelForm, setFunnelForm] = useState({
    name: '',
    description: '',
    steps: [] as { name: string; event_name: string }[]
  })

  // Form state for creating report
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'scheduled' as 'scheduled' | 'one-time',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    format: 'pdf' as 'pdf' | 'csv' | 'excel',
    recipients: ''
  })

  // Form state for creating dashboard
  const [dashboardForm, setDashboardForm] = useState({
    name: '',
    description: '',
    is_default: false
  })

  // Form state for adding metric
  const [metricForm, setMetricForm] = useState({
    name: '',
    category: 'users',
    type: 'count' as 'count' | 'currency' | 'percentage' | 'duration',
    alertThreshold: ''
  })

  // Form state for creating cohort
  const [cohortForm, setCohortForm] = useState({
    name: '',
    type: 'retention' as 'retention' | 'revenue' | 'engagement',
    description: ''
  })

  // Form state for editing report
  const [editReportForm, setEditReportForm] = useState({
    name: '',
    type: 'scheduled' as 'scheduled' | 'one-time',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    format: 'pdf' as 'pdf' | 'csv' | 'excel',
    recipients: ''
  })

  // Form state for event schema
  const [eventSchemaForm, setEventSchemaForm] = useState({
    eventName: '',
    properties: '',
    description: ''
  })

  // Form state for metric alert
  const [alertForm, setAlertForm] = useState({
    thresholdType: 'above' as 'above' | 'below',
    thresholdValue: '',
    notifyEmail: true,
    notifyInApp: true
  })

  // Form state for duplicate metric
  const [duplicateMetricName, setDuplicateMetricName] = useState('')

  // Form state for share metric
  const [shareEmails, setShareEmails] = useState('')

  // Fetch user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId()
      setUserId(id)
    }
    fetchUserId()
  }, [getUserId])

  // Hooks automatically fetch data when userId changes - no manual fetch needed

  // Filter metrics with advanced filtering
  const filteredMetrics = useMemo(() => {
    return mockMetrics.filter(m => {
      // Text search filter
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory =
        activeFilters.categories.length === 0 ||
        activeFilters.categories.includes(m.category)

      // Metric type filter
      const matchesType =
        activeFilters.metricTypes.length === 0 ||
        activeFilters.metricTypes.includes(m.type)

      // Status filter
      const matchesStatus =
        activeFilters.status.length === 0 ||
        activeFilters.status.includes(m.status)

      // Value range filter
      const matchesMinValue =
        !activeFilters.minValue ||
        m.value >= parseFloat(activeFilters.minValue)

      const matchesMaxValue =
        !activeFilters.maxValue ||
        m.value <= parseFloat(activeFilters.maxValue)

      return matchesSearch && matchesCategory && matchesType && matchesStatus && matchesMinValue && matchesMaxValue
    })
  }, [searchQuery, activeFilters])

  // CRUD Operations
  const handleCreateFunnel = async () => {
    if (!userId) {
      toast.error('Error')
      return
    }
    if (!funnelForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      await funnelsMutation.create({
        user_id: userId,
        name: funnelForm.name,
        description: funnelForm.description,
        steps: funnelForm.steps,
        status: 'active',
        total_conversion: 0
      })
      toast.success('Funnel created')
      setFunnelForm({ name: '', description: '', steps: [] })
      setShowCreateFunnel(false)
    } catch (err: any) {
      toast.error('Error creating funnel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!userId) return
    setIsLoading(true)
    try {
      await funnelsMutation.remove(funnelId, true)
      toast.success('Funnel deleted')
    } catch (err: any) {
      toast.error('Error deleting funnel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateReport = async () => {
    if (!userId) {
      toast.error('Error')
      return
    }
    if (!reportForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      const recipients = reportForm.recipients.split(',').map(r => r.trim()).filter(Boolean)
      await reportsMutation.create({
        user_id: userId,
        name: reportForm.name,
        type: reportForm.type,
        frequency: reportForm.type === 'scheduled' ? reportForm.frequency : null,
        format: reportForm.format,
        recipients,
        status: 'active',
        last_run: new Date().toISOString()
      })
      toast.success('Report created')
      setReportForm({ name: '', type: 'scheduled', frequency: 'weekly', format: 'pdf', recipients: '' })
      setShowCreateReport(false)
    } catch (err: any) {
      toast.error('Error creating report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunReport = async (reportId: string, reportName: string) => {
    if (!userId) return
    setIsLoading(true)
    try {
      await reportsMutation.update(reportId, { last_run: new Date().toISOString() })
      toast.success('Report running')
    } catch (err: any) {
      toast.error('Error running report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!userId) return
    setIsLoading(true)
    try {
      await reportsMutation.remove(reportId, true)
      toast.success('Report deleted')
    } catch (err: any) {
      toast.error('Error deleting report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDashboard = async () => {
    if (!userId) {
      toast.error('Error')
      return
    }
    if (!dashboardForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      await dashboardsMutation.create({
        user_id: userId,
        name: dashboardForm.name,
        description: dashboardForm.description,
        is_default: dashboardForm.is_default,
        widgets: [],
        shared_with: [],
        last_viewed: new Date().toISOString()
      })
      toast.success('Dashboard created')
      setDashboardForm({ name: '', description: '', is_default: false })
      setShowCreateDashboard(false)
    } catch (err: any) {
      toast.error('Error creating dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (!userId) return
    setIsLoading(true)
    try {
      await dashboardsMutation.remove(dashboardId, true)
      toast.success('Dashboard deleted')
    } catch (err: any) {
      toast.error('Error deleting dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareDashboard = async (dashboardId: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard/analytics-v2?dashboard=${dashboardId}`)
      toast.success('Link copied')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleDuplicateDashboard = async (dashboard: any) => {
    if (!userId) return
    setIsLoading(true)
    try {
      await dashboardsMutation.create({
        user_id: userId,
        name: `${dashboard.name} (Copy)`,
        description: dashboard.description,
        is_default: false,
        widgets: dashboard.widgets || [],
        shared_with: [],
        last_viewed: new Date().toISOString()
      })
      toast.success('Dashboard duplicated')
    } catch (err: any) {
      toast.error('Error duplicating dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // UI Handlers
  const handleNotifications = () => {
    setSettingsTab('notifications')
    setActiveTab('settings')
    toast.info('Notifications')
  }

  const handleExport = async () => {
    // Generate real CSV export of analytics data
    const csvHeaders = ['Metric', 'Value', 'Previous Value', 'Change %', 'Category', 'Status']
    const csvRows = mockMetrics.map(m => [
      m.name,
      m.value,
      m.previousValue,
      m.changePercent,
      m.category,
      m.status
    ])
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Export complete')
  }

  const handleExportCohorts = async () => {
    // Generate real CSV export of cohort data
    const csvHeaders = ['Cohort', 'Users', 'Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
    const csvRows = mockCohorts.map(c => [
      c.cohort,
      c.users,
      c.week0,
      c.week1,
      c.week2,
      c.week3,
      c.week4,
      c.week5,
      c.week6,
      c.week7
    ])
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cohorts-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Export complete')
  }

  const handleExportConfig = async () => {
    // Export analytics configuration as JSON
    const config = {
      analyticsName: 'Main Analytics',
      timeZone: 'UTC',
      enableAnalytics: true,
      realtimeDashboard: true,
      sessionRecording: true,
      heatmaps: true,
      errorTracking: true,
      formAnalytics: true,
      ipAnonymization: true,
      cookieConsent: true,
      gdprMode: true,
      retentionPeriod: '12 months',
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Config exported')
  }

  const handleCopyTrackingCode = async () => {
    const trackingCode = `<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://analytics.kazi.app/track.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','kaziLayer','KAZI-XXXXXXXX');
</script>`
    try {
      await navigator.clipboard.writeText(trackingCode)
      toast.success('Copied')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleEmailTrackingCode = () => {
    const subject = encodeURIComponent('Kazi Analytics Tracking Code')
    const body = encodeURIComponent(`Please add the following tracking code to the website:

<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://analytics.kazi.app/track.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','kaziLayer','KAZI-XXXXXXXX');
</script>

Add this code to the <head> section of your HTML.`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    toast.success('Email opened')
  }

  const handleExportAllData = async () => {
    // Comprehensive data export
    const allData = {
      metrics: mockMetrics,
      funnels: mockFunnels,
      cohorts: mockCohorts,
      reports: mockReports,
      dashboards: mockDashboards,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-full-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Export complete')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleFilters = () => {
    setShowFilterDialog(true)
  }

  // Apply filters from dialog
  const handleApplyFilters = () => {
    const filterCount =
      activeFilters.categories.length +
      activeFilters.metricTypes.length +
      activeFilters.status.length +
      (activeFilters.minValue ? 1 : 0) +
      (activeFilters.maxValue ? 1 : 0)

    setShowFilterDialog(false)
    toast.success(filterCount > 0
      ? `Filters applied - ${filterCount} filter${filterCount > 1 ? 's' : ''} active`
      : 'Showing all data'
    )
  }

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({
      categories: [],
      metricTypes: [],
      status: [],
      minValue: '',
      maxValue: ''
    })
    toast.success('Filters cleared')
  }

  // Toggle filter option
  const toggleFilterOption = (filterType: 'categories' | 'metricTypes' | 'status', value: string) => {
    setActiveFilters(prev => {
      const current = prev[filterType]
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [filterType]: updated }
    })
  }

  // Handle custom date range selection
  const handleApplyCustomDateRange = () => {
    if (new Date(customDateRange.startDate) > new Date(customDateRange.endDate)) {
      toast.error('Invalid date range')
      return
    }
    setTimeRange('custom')
    setShowCustomDateRange(false)
    toast.success(`Date range applied: ${customDateRange.startDate} to ${customDateRange.endDate}`)
  }

  // Handle compare date range
  const handleApplyCompare = () => {
    if (new Date(compareDateRange.startDate) > new Date(compareDateRange.endDate)) {
      toast.error('Invalid compare range')
      return
    }
    setCompareMode(true)
    setShowCompareDialog(false)
    toast.success(`Compare mode enabled: ${compareDateRange.startDate} to ${compareDateRange.endDate}`)
  }

  // Export report as PDF
  const handleExportPDF = async () => {
    setIsLoading(true)
    const loadingToast = toast.loading('Generating PDF report...')

    try {
      // Create PDF content
      const pdfContent = `
ANALYTICS REPORT
================
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Date Range: ${timeRange === 'custom' ? `${customDateRange.startDate} to ${customDateRange.endDate}` : timeRange}

KEY METRICS
-----------
${mockMetrics.map(m => `${m.name}: ${formatValue(m.value, m.type)} (${m.changePercent >= 0 ? '+' : ''}${m.changePercent.toFixed(1)}%)`).join('\n')}

FUNNEL SUMMARY
--------------
${mockFunnels.map(f => `${f.name}: ${f.totalConversion}% total conversion`).join('\n')}

COHORT RETENTION
----------------
${mockCohorts.map(c => `${c.cohort}: ${c.users} users, Week 4 retention: ${c.week4}%`).join('\n')}

---
Report generated by Kazi Analytics
      `.trim()

      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.dismiss(loadingToast)
      toast.success('PDF exported')
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Save custom report
  const handleSaveCustomReport = async () => {
    if (!customReportForm.name.trim()) {
      toast.error('Report name required')
      return
    }

    setIsLoading(true)
    try {
      if (userId) {
        await reportsMutation.create({
          user_id: userId,
          name: customReportForm.name,
          type: customReportForm.schedule === 'none' ? 'one-time' : 'scheduled',
          frequency: customReportForm.schedule === 'none' ? null : customReportForm.schedule,
          format: 'pdf',
          recipients: [],
          status: 'active',
          last_run: new Date().toISOString(),
          config: {
            description: customReportForm.description,
            metrics: customReportForm.metrics,
            dateRange: timeRange === 'custom' ? customDateRange : timeRange
          }
        })
      }

      toast.success('Report saved')
      setCustomReportForm({ name: '', description: '', metrics: [], schedule: 'none' })
      setShowSaveReportDialog(false)
    } catch (err: any) {
      toast.error('Error saving report')
    } finally {
      setIsLoading(false)
    }
  }

  // Copy share link for report
  const handleShareReport = async () => {
    const shareUrl = `${window.location.origin}/dashboard/analytics-v2?range=${timeRange}&filters=${encodeURIComponent(JSON.stringify(activeFilters))}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied')
    } catch (err) {
      toast.error('Copy failed')
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchFunnels(), fetchReports(), fetchDashboards(), fetchMetrics()])
      toast.success('Data refreshed')
    } catch (err) {
      toast.error('Refresh failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupAlert = async () => {
    if (!userId || !selectedMetric) return
    setIsLoading(true)
    try {
      await alertsMutation.create({
        user_id: userId,
        metric_name: selectedMetric.name,
        metric_type: selectedMetric.type,
        threshold_type: 'above',
        threshold_value: selectedMetric.value * 1.2,
        is_active: true,
        notification_channels: ['email', 'in_app']
      })
      toast.success('Alert created')
    } catch (err: any) {
      toast.error('Error creating alert')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for adding metric
  const handleAddMetric = async () => {
    if (!userId) {
      toast.error('Error')
      return
    }
    if (!metricForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      await metricsMutation.create({
        user_id: userId,
        name: metricForm.name,
        category: metricForm.category,
        type: metricForm.type,
        value: 0,
        previous_value: 0,
        change_percent: 0,
        status: 'stable',
        alert_threshold: metricForm.alertThreshold ? parseFloat(metricForm.alertThreshold) : null
      })
      toast.success('Metric added')
      setMetricForm({ name: '', category: 'users', type: 'count', alertThreshold: '' })
      setShowAddMetric(false)
    } catch (err: any) {
      toast.error('Error adding metric')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for creating cohort
  const handleCreateCohort = async () => {
    if (!userId) {
      toast.error('Error')
      return
    }
    if (!cohortForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    toast.success(`Creating cohort "${cohortForm.name}"...`)
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-cohort',
          name: cohortForm.name,
          type: cohortForm.type,
          description: cohortForm.description,
          userId
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create cohort')
      toast.success(`Cohort "${cohortForm.name}" has been created`)
      setCohortForm({ name: '', type: 'retention', description: '' })
      setShowCreateCohort(false)
    } catch (err: any) {
      toast.error('Error creating cohort')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for editing report
  const handleEditReport = async () => {
    if (!userId || !showEditReport) return
    if (!editReportForm.name.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      const recipients = editReportForm.recipients.split(',').map(r => r.trim()).filter(Boolean)
      await reportsMutation.update(showEditReport!, {
        name: editReportForm.name,
        type: editReportForm.type,
        frequency: editReportForm.type === 'scheduled' ? editReportForm.frequency : null,
        format: editReportForm.format,
        recipients
      })
      toast.success('Report updated')
      setShowEditReport(null)
    } catch (err: any) {
      toast.error('Error updating report')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for connecting integration
  const handleConnectIntegration = async (integrationName: string, connected: boolean) => {
    setIsLoading(true)
    const action = connected ? 'disconnect' : 'connect'
    toast.success(`${connected ? 'Disconnecting' : 'Connecting'} ${integrationName}...`)
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manage-integration',
          integrationName,
          operation: action,
          userId
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `Failed to ${action} integration`)
      if (connected) {
        toast.success(`${integrationName} has been disconnected`)
      } else {
        toast.success(`${integrationName} has been connected`)
      }
      setShowConnectIntegration(null)
    } catch (err: any) {
      toast.error('Error')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for regenerating API key
  const handleRegenerateApiKey = async () => {
    setIsLoading(true)
    toast.success('Regenerating API key...')
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate-api-key',
          userId
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to regenerate API key')
      toast.success('API key regenerated')
      setShowRegenerateApiKey(false)
    } catch (err: any) {
      toast.error('Error regenerating key')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for configuring event schema
  const handleConfigureEventSchema = async () => {
    if (!eventSchemaForm.eventName.trim()) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    toast.success(`Configuring schema "${eventSchemaForm.eventName}"...`)
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure-event-schema',
          eventName: eventSchemaForm.eventName,
          properties: eventSchemaForm.properties,
          description: eventSchemaForm.description,
          userId
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to configure event schema')
      toast.success(`Schema "${eventSchemaForm.eventName}" has been configured`)
      setEventSchemaForm({ eventName: '', properties: '', description: '' })
      setShowConfigureEventSchema(false)
    } catch (err: any) {
      toast.error('Error configuring schema')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for resetting all data
  const handleResetAllData = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      // Bulk delete all user's analytics data
      // Note: Using direct Supabase client for bulk operations (mutation hooks only support delete by ID)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('analytics_metrics').delete().eq('user_id', userId)
      await supabase.from('analytics_reports').delete().eq('user_id', userId)
      await supabase.from('analytics_dashboards').delete().eq('user_id', userId)
      await supabase.from('analytics_conversion_funnels').delete().eq('user_id', userId)
      toast.success('Data reset')
      setShowResetData(false)
      // Refresh all data from hooks
      refreshMetrics()
      refreshReports()
      refreshDashboards()
      refreshFunnels()
    } catch (err: any) {
      toast.error('Error resetting data')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for deleting tracking code
  const handleDeleteTrackingCode = async () => {
    setIsLoading(true)
    toast.success('Deleting tracking...')
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-tracking-code',
          userId
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete tracking code')
      toast.success('Tracking removed')
      setShowDeleteTracking(false)
    } catch (err: any) {
      toast.error('Error deleting tracking')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for revoking all API keys
  const handleRevokeAllApiKeys = async () => {
    setIsLoading(true)
    toast.success('Revoking keys...')
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke-all-api-keys',
          userId
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to revoke API keys')
      toast.success('Keys revoked')
      setShowRevokeApiKeys(false)
    } catch (err: any) {
      toast.error('Error revoking keys')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for duplicating a metric
  const handleDuplicateMetric = async () => {
    if (!userId || !selectedMetricForAction) {
      toast.error('Error')
      return
    }
    const originalMetric = mockMetrics.find(m => m.id === selectedMetricForAction)
    if (!originalMetric) {
      toast.error('Error')
      return
    }
    const newName = duplicateMetricName.trim() || `${originalMetric.name} (Copy)`
    setIsLoading(true)
    try {
      await metricsMutation.create({
        user_id: userId,
        name: newName,
        category: originalMetric.category,
        type: originalMetric.type,
        value: originalMetric.value,
        previous_value: originalMetric.previousValue,
        change_percent: originalMetric.changePercent,
        status: originalMetric.status,
        alert_threshold: originalMetric.alertThreshold || null
      })
      toast.success('Metric duplicated')
      setDuplicateMetricName('')
      setShowDuplicateMetric(false)
      setSelectedMetricForAction(null)
      setShowMetricOptions(null)
    } catch (err: any) {
      toast.error('Error duplicating metric')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for setting an alert on a metric
  const handleSetMetricAlert = async () => {
    if (!userId || !selectedMetricForAction) {
      toast.error('Error')
      return
    }
    if (!alertForm.thresholdValue) {
      toast.error('Error')
      return
    }
    const metric = mockMetrics.find(m => m.id === selectedMetricForAction)
    if (!metric) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      const notificationChannels = []
      if (alertForm.notifyEmail) notificationChannels.push('email')
      if (alertForm.notifyInApp) notificationChannels.push('in_app')

      await alertsMutation.create({
        user_id: userId,
        metric_name: metric.name,
        metric_type: metric.type,
        threshold_type: alertForm.thresholdType,
        threshold_value: parseFloat(alertForm.thresholdValue),
        is_active: true,
        notification_channels: notificationChannels
      })
      toast.success('Alert created')
      setAlertForm({ thresholdType: 'above', thresholdValue: '', notifyEmail: true, notifyInApp: true })
      setShowSetAlertDialog(false)
      setSelectedMetricForAction(null)
      setShowMetricOptions(null)
    } catch (err: any) {
      toast.error('Error creating alert')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for sharing a metric
  const handleShareMetric = async () => {
    if (!selectedMetricForAction) {
      toast.error('Error')
      return
    }
    const metric = mockMetrics.find(m => m.id === selectedMetricForAction)
    if (!metric) {
      toast.error('Error')
      return
    }
    setIsLoading(true)
    try {
      const shareLink = `${window.location.origin}/dashboard/analytics-v2?metric=${selectedMetricForAction}`

      if (shareEmails.trim()) {
        // Send email with metric details
        const emails = shareEmails.split(',').map(e => e.trim()).filter(Boolean)
        const subject = encodeURIComponent(`Check out this metric: ${metric.name}`)
        const body = encodeURIComponent(`I wanted to share this analytics metric with you:\n\nMetric: ${metric.name}\nCurrent Value: ${formatValue(metric.value, metric.type)}\nChange: ${metric.changePercent >= 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%\n\nView the full analytics here: ${shareLink}`)
        window.open(`mailto:${emails.join(',')}?subject=${subject}&body=${body}`)
        toast.success(`Email opened with ${emails.length} recipient(s)`)
      } else {
        // Copy link to clipboard
        await navigator.clipboard.writeText(shareLink)
        toast.success('Link copied to clipboard')
      }
      setShareEmails('')
      setShowShareMetric(false)
      setSelectedMetricForAction(null)
      setShowMetricOptions(null)
    } catch (err: any) {
      toast.error('Error sharing metric')
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for deleting a metric
  const handleDeleteMetric = async () => {
    if (!userId || !selectedMetricForAction) {
      toast.error('Error')
      return
    }
    const metric = mockMetrics.find(m => m.id === selectedMetricForAction)
    setIsLoading(true)
    try {
      await metricsMutation.remove(selectedMetricForAction!, true)
      toast.success('Metric deleted')
      setShowDeleteMetric(false)
      setSelectedMetricForAction(null)
      setShowMetricOptions(null)
    } catch (err: any) {
      toast.error('Error deleting metric')
    } finally {
      setIsLoading(false)
    }
  }

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
  const metrics = companyInfo?.metrics || {}
  const keyMetrics = [
    { label: 'Customers', value: (metrics.customers || 0).toLocaleString(), change: '+7.3%', positive: true, icon: Users, gradient: 'from-indigo-500 to-indigo-600' },
    { label: 'MRR', value: `$${((metrics.mrr || 0) / 1000).toFixed(0)}K`, change: '+18.5%', positive: true, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Conversion', value: '8.5%', change: '+18.1%', positive: true, icon: Target, gradient: 'from-purple-500 to-purple-600' },
    { label: 'NPS', value: (metrics.nps || 0).toString(), change: '+5.9%', positive: true, icon: TrendingUp, gradient: 'from-amber-500 to-amber-600' },
    { label: 'ARR', value: `$${((metrics.arr || 0) / 1000000).toFixed(1)}M`, change: '+312%', positive: true, icon: Eye, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Churn', value: `${metrics.churnRate || 0}%`, change: '-25%', positive: true, icon: MousePointer, gradient: 'from-rose-500 to-rose-600' },
    { label: 'LTV:CAC', value: `${(metrics.ltvCacRatio || 0).toFixed(1)}x`, change: '+30%', positive: true, icon: Zap, gradient: 'from-cyan-500 to-cyan-600' },
    { label: 'Enterprise', value: (metrics.enterprises || 0).toString(), change: '+9.9%', positive: true, icon: Target, gradient: 'from-pink-500 to-pink-600' }
  ]

  // Realtime metrics - Investor demo data
  const realtimeMetrics = [
    { label: 'Active Users', value: analyticsRealtimeMetrics.activeUsersNow, icon: Users, trend: 12 },
    { label: 'Page Views/min', value: analyticsRealtimeMetrics.pageViewsPerMin, icon: Eye, trend: 8 },
    { label: 'AI Requests/min', value: analyticsRealtimeMetrics.aiRequestsPerMin, icon: Activity, trend: 15 },
    { label: 'Conversions', value: analyticsRealtimeMetrics.currentConversions, icon: ShoppingCart, trend: 2 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
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
                  onClick={() => compareMode ? setCompareMode(false) : setShowCompareDialog(true)}
                  className={compareMode ? '' : 'bg-white/20 hover:bg-white/30 text-white border-0'}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  {compareMode ? 'Exit Compare' : 'Compare'}
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleNotifications} aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleExport} aria-label="Export data" aria-label="Export data">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={handleShare} aria-label="Share">
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
            {['24h', '7d', '30d', '90d', '12m'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? '' : 'text-gray-600 dark:text-gray-300'}
              >
                {range}
              </Button>
            ))}
            <Popover open={showCustomDateRange} onOpenChange={setShowCustomDateRange}>
              <PopoverTrigger asChild>
                <Button
                  variant={timeRange === 'custom' ? 'default' : 'ghost'}
                  size="sm"
                  className={timeRange === 'custom' ? '' : 'text-gray-600 dark:text-gray-300'}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  {timeRange === 'custom'
                    ? `${customDateRange.startDate} - ${customDateRange.endDate}`
                    : 'Custom'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Custom Date Range</h4>
                    <p className="text-sm text-muted-foreground">Select start and end dates for your analysis</p>
                  </div>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCustomDateRange(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleApplyCustomDateRange} className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            {/* Active filters indicator */}
            {(activeFilters.categories.length > 0 ||
              activeFilters.metricTypes.length > 0 ||
              activeFilters.status.length > 0 ||
              activeFilters.minValue ||
              activeFilters.maxValue) && (
              <Badge variant="secondary" className="mr-2">
                {activeFilters.categories.length +
                  activeFilters.metricTypes.length +
                  activeFilters.status.length +
                  (activeFilters.minValue ? 1 : 0) +
                  (activeFilters.maxValue ? 1 : 0)} filters active
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaveReportDialog(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Save Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
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
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExport} aria-label="Export data">
                  <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Plus, label: 'New Metric', desc: 'Create custom', color: 'text-indigo-500', action: () => setActiveTab('metrics') },
                { icon: Target, label: 'New Funnel', desc: 'Track conversions', color: 'text-purple-500', action: () => setShowCreateFunnel(true) },
                { icon: FileText, label: 'New Report', desc: 'Schedule reports', color: 'text-pink-500', action: () => setShowCreateReport(true) },
                { icon: Layout, label: 'Dashboard', desc: 'Create view', color: 'text-blue-500', action: () => setShowCreateDashboard(true) },
                { icon: Bell, label: 'Alert', desc: 'Set threshold', color: 'text-amber-500', action: handleNotifications },
                { icon: Share2, label: 'Share', desc: 'Export data', color: 'text-green-500', action: handleShare },
                { icon: Activity, label: 'Live View', desc: 'Real-time', color: 'text-red-500', action: () => setActiveTab('realtime') },
                { icon: Zap, label: 'Automate', desc: 'Set triggers', color: 'text-cyan-500', action: () => { setSettingsTab('advanced'); setActiveTab('settings') } },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
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
                      <Button size="sm" variant="ghost" className={chartType === 'line' ? "bg-indigo-100 text-indigo-600" : ""} onClick={() => setChartType('line')}>
                        <LineChart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className={chartType === 'bar' ? "bg-indigo-100 text-indigo-600" : ""} onClick={() => setChartType('bar')}>
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className={chartType === 'area' ? "bg-indigo-100 text-indigo-600" : ""} onClick={() => setChartType('area')}>
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
                    <Button variant="link" className="text-indigo-600" onClick={() => { setSelectedFunnel(mockFunnels[0]); setActiveTab('funnels'); }}>
                      View Details <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(mockFunnels[0]?.steps || []).map((step, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{step.name}</span>
                          <span className="text-sm text-gray-500">{step.count?.toLocaleString() || 0} ({step.conversion || 0}%)</span>
                        </div>
                        <Progress value={mockFunnels[0]?.steps?.[0]?.count ? (step.count / mockFunnels[0].steps[0].count) * 100 : 0} className="h-3" />
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
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowAddMetric(true)}>
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
                <Button onClick={() => setShowAddMetric(true)}>
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
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 px-2" onClick={(e) => { e.stopPropagation(); setShowMetricOptions(metric.id); }}>
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
              {/* Show database funnels first, then mock funnels as fallback */}
              {(dbFunnels.length > 0 ? dbFunnels : mockFunnels).map((funnel) => (
                <Card key={funnel.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader onClick={() => setSelectedFunnel(funnel)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{funnel.name}</CardTitle>
                      <Badge variant={funnel.status === 'active' ? 'default' : 'secondary'}>{funnel.status}</Badge>
                    </div>
                    <CardDescription>Overall conversion: {funnel.totalConversion || funnel.total_conversion || 0}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(funnel.steps || []).map((step: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="text-xs text-gray-500 w-6">{idx + 1}</div>
                          <div className="flex-1">
                            <Progress value={step.conversion || 0} className="h-2" />
                          </div>
                          <div className="text-xs text-gray-500 w-12 text-right">{step.conversion || 0}%</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                      <span>{(funnel.steps || []).length} steps</span>
                      <div className="flex items-center gap-2">
                        <span>Created {funnel.createdAt || (funnel.created_at ? new Date(funnel.created_at).toLocaleDateString() : 'Recently')}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); handleDeleteFunnel(funnel.id) }}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportCohorts}>
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
                <Button onClick={() => setShowCreateCohort(true)}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
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
              {/* Show database reports first, then mock reports as fallback */}
              {(dbReports.length > 0 ? dbReports : mockReports).map((report) => (
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
                        <Badge variant="outline">{(report.format || 'pdf').toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Run</span>
                        <span>{report.lastRun || report.last_run ? new Date(report.lastRun || report.last_run).toLocaleDateString() : 'Never'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Recipients</span>
                        <span>{(report.recipients || []).length} email(s)</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isLoading}
                        onClick={() => handleRunReport(report.id, report.name)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditReportForm({ name: report.name, type: report.type || 'scheduled', frequency: report.frequency || 'weekly', format: report.format || 'pdf', recipients: (report.recipients || []).join(', ') }); setShowEditReport(report.id); }}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleDeleteReport(report.id)}
                      >
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
              {/* Show database dashboards first, then mock dashboards as fallback */}
              {(dbDashboards.length > 0 ? dbDashboards : mockDashboards).map((dashboard) => (
                <Card key={dashboard.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {dashboard.name}
                        {(dashboard.isDefault || dashboard.is_default) && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteDashboard(dashboard.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
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
                        <span>{dashboard.lastViewed || dashboard.last_viewed ? new Date(dashboard.lastViewed || dashboard.last_viewed).toLocaleDateString() : 'Never'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Shared with</span>
                        <span>{(dashboard.sharedWith || dashboard.shared_with || []).length > 0 ? (dashboard.sharedWith || dashboard.shared_with).join(', ') : 'No one'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                      <Button variant="default" size="sm" className="flex-1" onClick={() => setShowViewDashboard(dashboard.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareDashboard(dashboard.id)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleDuplicateDashboard(dashboard)}
                      >
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
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportConfig}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                          <Button variant="outline" size="sm" onClick={handleCopyTrackingCode}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleEmailTrackingCode}>
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
                            <Button variant={integration.connected ? 'outline' : 'default'} size="sm" onClick={() => setShowConnectIntegration(integration.name)}>
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
                            <Button variant="outline" onClick={() => setShowRegenerateApiKey(true)}>Regenerate</Button>
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
                          <Button variant="outline" onClick={handleExportAllData}>
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
                          <Button variant="outline" size="sm" onClick={() => setShowConfigureEventSchema(true)}>Configure</Button>
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
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowResetData(true)}>Reset Data</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Delete Tracking Code</Label>
                            <p className="text-sm text-gray-500">Remove tracking from all sites</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowDeleteTracking(true)}>Delete</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Revoke All API Keys</Label>
                            <p className="text-sm text-gray-500">Invalidate all existing keys</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowRevokeApiKeys(true)}>Revoke</Button>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                    <Button className="mt-3" onClick={handleSetupAlert} disabled={isLoading}>
                      {isLoading ? 'Setting up...' : 'Set Up Alert'}
                    </Button>
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

        {/* Create Funnel Dialog */}
        <Dialog open={showCreateFunnel} onOpenChange={setShowCreateFunnel}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Funnel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="funnel-name">Funnel Name</Label>
                <Input
                  id="funnel-name"
                  placeholder="e.g., Sign-up Funnel"
                  value={funnelForm.name}
                  onChange={(e) => setFunnelForm({ ...funnelForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="funnel-description">Description</Label>
                <Textarea
                  id="funnel-description"
                  placeholder="Describe this funnel..."
                  value={funnelForm.description}
                  onChange={(e) => setFunnelForm({ ...funnelForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateFunnel(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFunnel} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Funnel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Report Dialog */}
        <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="e.g., Weekly Performance Report"
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select
                  value={reportForm.type}
                  onValueChange={(v: 'scheduled' | 'one-time') => setReportForm({ ...reportForm, type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reportForm.type === 'scheduled' && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={reportForm.frequency}
                    onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setReportForm({ ...reportForm, frequency: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Format</Label>
                <Select
                  value={reportForm.format}
                  onValueChange={(v: 'pdf' | 'csv' | 'excel') => setReportForm({ ...reportForm, format: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="report-recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="report-recipients"
                  placeholder="email@example.com, another@example.com"
                  value={reportForm.recipients}
                  onChange={(e) => setReportForm({ ...reportForm, recipients: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateReport(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Report'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Dashboard Dialog */}
        <Dialog open={showCreateDashboard} onOpenChange={setShowCreateDashboard}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="dashboard-name">Dashboard Name</Label>
                <Input
                  id="dashboard-name"
                  placeholder="e.g., Executive Overview"
                  value={dashboardForm.name}
                  onChange={(e) => setDashboardForm({ ...dashboardForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dashboard-description">Description</Label>
                <Textarea
                  id="dashboard-description"
                  placeholder="Describe this dashboard..."
                  value={dashboardForm.description}
                  onChange={(e) => setDashboardForm({ ...dashboardForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Set as Default</Label>
                  <p className="text-sm text-gray-500">Make this your default dashboard</p>
                </div>
                <Switch
                  checked={dashboardForm.is_default}
                  onCheckedChange={(checked) => setDashboardForm({ ...dashboardForm, is_default: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDashboard(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDashboard} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Dashboard'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Metric Dialog */}
        <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="metric-name">Metric Name</Label>
                <Input
                  id="metric-name"
                  placeholder="e.g., Monthly Active Users"
                  value={metricForm.name}
                  onChange={(e) => setMetricForm({ ...metricForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={metricForm.category}
                  onValueChange={(v) => setMetricForm({ ...metricForm, category: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Metric Type</Label>
                <Select
                  value={metricForm.type}
                  onValueChange={(v: 'count' | 'currency' | 'percentage' | 'duration') => setMetricForm({ ...metricForm, type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="metric-threshold">Alert Threshold (optional)</Label>
                <Input
                  id="metric-threshold"
                  type="number"
                  placeholder="e.g., 1000"
                  value={metricForm.alertThreshold}
                  onChange={(e) => setMetricForm({ ...metricForm, alertThreshold: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddMetric(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMetric} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Metric'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Metric Options Dialog */}
        <Dialog open={!!showMetricOptions} onOpenChange={() => setShowMetricOptions(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Metric Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setSelectedMetricForAction(showMetricOptions);
                const metric = mockMetrics.find(m => m.id === showMetricOptions);
                setDuplicateMetricName(metric ? `${metric.name} (Copy)` : '');
                setShowDuplicateMetric(true);
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Metric
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setSelectedMetricForAction(showMetricOptions);
                setShowSetAlertDialog(true);
              }}>
                <Bell className="h-4 w-4 mr-2" />
                Set Alert
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setSelectedMetricForAction(showMetricOptions);
                setShowShareMetric(true);
              }}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Metric
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={() => {
                setSelectedMetricForAction(showMetricOptions);
                setShowDeleteMetric(true);
              }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Metric
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Metric Dialog */}
        <Dialog open={showDuplicateMetric} onOpenChange={(open) => {
          if (!open) {
            setShowDuplicateMetric(false);
            setDuplicateMetricName('');
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Duplicate Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                Create a copy of this metric with a new name. The duplicated metric will have the same configuration and initial values.
              </p>
              <div>
                <Label htmlFor="duplicate-metric-name">New Metric Name</Label>
                <Input
                  id="duplicate-metric-name"
                  placeholder="e.g., Active Users (Copy)"
                  value={duplicateMetricName}
                  onChange={(e) => setDuplicateMetricName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Original Metric Details</h4>
                {selectedMetricForAction && (() => {
                  const metric = mockMetrics.find(m => m.id === selectedMetricForAction);
                  return metric ? (
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>Name: {metric.name}</p>
                      <p>Category: {metric.category}</p>
                      <p>Type: {metric.type}</p>
                      <p>Current Value: {formatValue(metric.value, metric.type)}</p>
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowDuplicateMetric(false);
                  setDuplicateMetricName('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleDuplicateMetric} disabled={isLoading}>
                  {isLoading ? 'Duplicating...' : 'Duplicate Metric'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Set Alert Dialog */}
        <Dialog open={showSetAlertDialog} onOpenChange={(open) => {
          if (!open) {
            setShowSetAlertDialog(false);
            setAlertForm({ thresholdType: 'above', thresholdValue: '', notifyEmail: true, notifyInApp: true });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Metric Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                Get notified when this metric crosses your specified threshold.
              </p>
              {selectedMetricForAction && (() => {
                const metric = mockMetrics.find(m => m.id === selectedMetricForAction);
                return metric ? (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100">{metric.name}</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Current value: {formatValue(metric.value, metric.type)}
                    </p>
                  </div>
                ) : null;
              })()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Alert Condition</Label>
                  <Select
                    value={alertForm.thresholdType}
                    onValueChange={(v: 'above' | 'below') => setAlertForm({ ...alertForm, thresholdType: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Goes above</SelectItem>
                      <SelectItem value="below">Goes below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="alert-threshold-value">Threshold Value</Label>
                  <Input
                    id="alert-threshold-value"
                    type="number"
                    placeholder="e.g., 1000"
                    value={alertForm.thresholdValue}
                    onChange={(e) => setAlertForm({ ...alertForm, thresholdValue: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Notification Channels</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Email notifications</span>
                  </div>
                  <Switch
                    checked={alertForm.notifyEmail}
                    onCheckedChange={(checked) => setAlertForm({ ...alertForm, notifyEmail: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">In-app notifications</span>
                  </div>
                  <Switch
                    checked={alertForm.notifyInApp}
                    onCheckedChange={(checked) => setAlertForm({ ...alertForm, notifyInApp: checked })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowSetAlertDialog(false);
                  setAlertForm({ thresholdType: 'above', thresholdValue: '', notifyEmail: true, notifyInApp: true });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSetMetricAlert} disabled={isLoading || !alertForm.thresholdValue}>
                  {isLoading ? 'Creating...' : 'Create Alert'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Metric Dialog */}
        <Dialog open={showShareMetric} onOpenChange={(open) => {
          if (!open) {
            setShowShareMetric(false);
            setShareEmails('');
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedMetricForAction && (() => {
                const metric = mockMetrics.find(m => m.id === selectedMetricForAction);
                return metric ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium">{metric.name}</h4>
                    <p className="text-2xl font-bold mt-1">{formatValue(metric.value, metric.type)}</p>
                    <p className={`text-sm ${getStatusColor(metric.status)}`}>
                      {metric.changePercent >= 0 ? '+' : ''}{metric.changePercent.toFixed(1)}% from previous period
                    </p>
                  </div>
                ) : null;
              })()}
              <div>
                <Label htmlFor="share-emails">Share via Email (optional)</Label>
                <Input
                  id="share-emails"
                  placeholder="email@example.com, another@example.com"
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter email addresses separated by commas, or leave empty to copy link
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowShareMetric(false);
                  setShareEmails('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleShareMetric} disabled={isLoading}>
                  {isLoading ? 'Sharing...' : shareEmails.trim() ? 'Send Email' : 'Copy Link'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Metric Dialog */}
        <Dialog open={showDeleteMetric} onOpenChange={setShowDeleteMetric}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Metric</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedMetricForAction && (() => {
                const metric = mockMetrics.find(m => m.id === selectedMetricForAction);
                return metric ? (
                  <>
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the metric "{metric.name}"? This action cannot be undone.
                    </p>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-100">{metric.name}</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Current value: {formatValue(metric.value, metric.type)}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        All historical data for this metric will be permanently deleted.
                      </p>
                    </div>
                  </>
                ) : null;
              })()}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteMetric(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteMetric} disabled={isLoading}>
                  {isLoading ? 'Deleting...' : 'Delete Metric'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Cohort Dialog */}
        <Dialog open={showCreateCohort} onOpenChange={setShowCreateCohort}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="cohort-name">Cohort Name</Label>
                <Input
                  id="cohort-name"
                  placeholder="e.g., Q1 2024 Users"
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Cohort Type</Label>
                <Select
                  value={cohortForm.type}
                  onValueChange={(v: 'retention' | 'revenue' | 'engagement') => setCohortForm({ ...cohortForm, type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cohort-description">Description</Label>
                <Textarea
                  id="cohort-description"
                  placeholder="Describe this cohort..."
                  value={cohortForm.description}
                  onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateCohort(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCohort} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Cohort'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Report Dialog */}
        <Dialog open={!!showEditReport} onOpenChange={() => setShowEditReport(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-report-name">Report Name</Label>
                <Input
                  id="edit-report-name"
                  placeholder="e.g., Weekly Performance Report"
                  value={editReportForm.name}
                  onChange={(e) => setEditReportForm({ ...editReportForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select
                  value={editReportForm.type}
                  onValueChange={(v: 'scheduled' | 'one-time') => setEditReportForm({ ...editReportForm, type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editReportForm.type === 'scheduled' && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={editReportForm.frequency}
                    onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setEditReportForm({ ...editReportForm, frequency: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Format</Label>
                <Select
                  value={editReportForm.format}
                  onValueChange={(v: 'pdf' | 'csv' | 'excel') => setEditReportForm({ ...editReportForm, format: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-report-recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="edit-report-recipients"
                  placeholder="email@example.com, another@example.com"
                  value={editReportForm.recipients}
                  onChange={(e) => setEditReportForm({ ...editReportForm, recipients: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditReport(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditReport} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dashboard Dialog */}
        <Dialog open={!!showViewDashboard} onOpenChange={() => setShowViewDashboard(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {(dbDashboards.length > 0 ? dbDashboards : mockDashboards).find(d => d.id === showViewDashboard)?.name || 'Dashboard'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm text-gray-500">Active Users</span>
                    </div>
                    <div className="text-3xl font-bold">12,847</div>
                    <div className="text-sm text-emerald-600">+12.5% from last week</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm text-gray-500">Revenue</span>
                    </div>
                    <div className="text-3xl font-bold">$284,500</div>
                    <div className="text-sm text-emerald-600">+18.2% from last month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="text-sm text-gray-500">Conversion Rate</span>
                    </div>
                    <div className="text-3xl font-bold">8.5%</div>
                    <div className="text-sm text-emerald-600">+2.1% from last week</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-gray-500">Engagement</span>
                    </div>
                    <div className="text-3xl font-bold">4.2 min</div>
                    <div className="text-sm text-emerald-600">+8% from last week</div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4 h-48 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto text-indigo-400 mb-2" />
                  <p className="text-sm text-gray-500">Dashboard widgets visualization</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect Integration Dialog */}
        <Dialog open={!!showConnectIntegration} onOpenChange={() => setShowConnectIntegration(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {showConnectIntegration && (
                  ['Google Analytics', 'Mixpanel', 'Hotjar'].includes(showConnectIntegration)
                    ? `Disconnect ${showConnectIntegration}`
                    : `Connect ${showConnectIntegration}`
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {showConnectIntegration && ['Google Analytics', 'Mixpanel', 'Hotjar'].includes(showConnectIntegration) ? (
                <>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to disconnect {showConnectIntegration}? This will stop syncing data from this integration.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowConnectIntegration(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => handleConnectIntegration(showConnectIntegration!, true)} disabled={isLoading}>
                      {isLoading ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    Connect {showConnectIntegration} to sync your analytics data automatically.
                  </p>
                  <div>
                    <Label htmlFor="integration-api-key">API Key</Label>
                    <Input
                      id="integration-api-key"
                      placeholder="Enter your API key"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowConnectIntegration(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleConnectIntegration(showConnectIntegration!, false)} disabled={isLoading}>
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKey} onOpenChange={setShowRegenerateApiKey}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to regenerate your API key? This will invalidate your current key and any applications using it will stop working.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Make sure to update your API key in all applications before regenerating.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRegenerateApiKey(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRegenerateApiKey} disabled={isLoading}>
                  {isLoading ? 'Regenerating...' : 'Regenerate Key'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Event Schema Dialog */}
        <Dialog open={showConfigureEventSchema} onOpenChange={setShowConfigureEventSchema}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure Event Schema</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  placeholder="e.g., purchase_completed"
                  value={eventSchemaForm.eventName}
                  onChange={(e) => setEventSchemaForm({ ...eventSchemaForm, eventName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="event-properties">Properties (JSON format)</Label>
                <Textarea
                  id="event-properties"
                  placeholder='{"price": "number", "product_id": "string"}'
                  value={eventSchemaForm.properties}
                  onChange={(e) => setEventSchemaForm({ ...eventSchemaForm, properties: e.target.value })}
                  className="mt-1 font-mono"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="event-description">Description</Label>
                <Input
                  id="event-description"
                  placeholder="Describe when this event is triggered"
                  value={eventSchemaForm.description}
                  onChange={(e) => setEventSchemaForm({ ...eventSchemaForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfigureEventSchema(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfigureEventSchema} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Schema'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset All Data Confirmation Dialog */}
        <Dialog open={showResetData} onOpenChange={setShowResetData}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Reset All Analytics Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                This action will permanently delete all your analytics data including metrics, reports, dashboards, and funnels. This cannot be undone.
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Warning: All historical data will be lost forever.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowResetData(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleResetAllData} disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset All Data'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Tracking Code Confirmation Dialog */}
        <Dialog open={showDeleteTracking} onOpenChange={setShowDeleteTracking}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Tracking Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                This will remove the tracking code from all sites. New data will no longer be collected until you reinstall the tracking code.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Existing data will be preserved but no new data will be tracked.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteTracking(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteTrackingCode} disabled={isLoading}>
                  {isLoading ? 'Deleting...' : 'Delete Tracking'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Revoke All API Keys Confirmation Dialog */}
        <Dialog open={showRevokeApiKeys} onOpenChange={setShowRevokeApiKeys}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Revoke All API Keys</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                This will invalidate all existing API keys. Any applications or integrations using these keys will immediately lose access.
              </p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  All connected applications will stop working until new keys are generated.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRevokeApiKeys(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRevokeAllApiKeys} disabled={isLoading}>
                  {isLoading ? 'Revoking...' : 'Revoke All Keys'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Filter Analytics</DialogTitle>
              <DialogDescription>
                Apply filters to narrow down your analytics data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {['users', 'revenue', 'engagement', 'conversion'].map((cat) => (
                    <Badge
                      key={cat}
                      variant={activeFilters.categories.includes(cat) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleFilterOption('categories', cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metric Type Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Metric Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['count', 'currency', 'percentage', 'duration'].map((type) => (
                    <Badge
                      key={type}
                      variant={activeFilters.metricTypes.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleFilterOption('metricTypes', type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'up', label: 'Trending Up', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
                    { value: 'down', label: 'Trending Down', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                    { value: 'stable', label: 'Stable', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
                  ].map((status) => (
                    <Badge
                      key={status.value}
                      variant="outline"
                      className={`cursor-pointer ${activeFilters.status.includes(status.value) ? status.color : ''}`}
                      onClick={() => toggleFilterOption('status', status.value)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Value Range Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Value Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="min-value" className="text-xs text-muted-foreground">Minimum Value</Label>
                    <Input
                      id="min-value"
                      type="number"
                      placeholder="Min"
                      value={activeFilters.minValue}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, minValue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-value" className="text-xs text-muted-foreground">Maximum Value</Label>
                    <Input
                      id="max-value"
                      type="number"
                      placeholder="Max"
                      value={activeFilters.maxValue}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4 border-t">
                <Button variant="ghost" onClick={handleClearFilters}>
                  Clear All
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compare Date Range Dialog */}
        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Compare Date Ranges</DialogTitle>
              <DialogDescription>
                Select a date range to compare against your current view
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Current Range</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  {timeRange === 'custom'
                    ? `${customDateRange.startDate} to ${customDateRange.endDate}`
                    : `Last ${timeRange}`
                  }
                </p>
              </div>
              <div className="space-y-3">
                <Label>Compare With</Label>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="compare-start" className="text-xs text-muted-foreground">Start Date</Label>
                    <Input
                      id="compare-start"
                      type="date"
                      value={compareDateRange.startDate}
                      onChange={(e) => setCompareDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="compare-end" className="text-xs text-muted-foreground">End Date</Label>
                    <Input
                      id="compare-end"
                      type="date"
                      value={compareDateRange.endDate}
                      onChange={(e) => setCompareDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApplyCompare}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Start Comparison
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Custom Report Dialog */}
        <Dialog open={showSaveReportDialog} onOpenChange={setShowSaveReportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Save Custom Report</DialogTitle>
              <DialogDescription>
                Save your current analytics view as a custom report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="report-save-name">Report Name</Label>
                <Input
                  id="report-save-name"
                  placeholder="e.g., Monthly Performance Overview"
                  value={customReportForm.name}
                  onChange={(e) => setCustomReportForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="report-save-description">Description (optional)</Label>
                <Textarea
                  id="report-save-description"
                  placeholder="Describe what this report tracks..."
                  value={customReportForm.description}
                  onChange={(e) => setCustomReportForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <h4 className="text-sm font-medium">Report Configuration</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Date Range: {timeRange === 'custom' ? `${customDateRange.startDate} to ${customDateRange.endDate}` : timeRange}</p>
                  <p>Active Filters: {
                    activeFilters.categories.length +
                    activeFilters.metricTypes.length +
                    activeFilters.status.length +
                    (activeFilters.minValue ? 1 : 0) +
                    (activeFilters.maxValue ? 1 : 0)
                  } applied</p>
                  <p>Metrics: {filteredMetrics.length} metrics included</p>
                </div>
              </div>
              <div>
                <Label>Schedule (optional)</Label>
                <Select
                  value={customReportForm.schedule}
                  onValueChange={(v: 'none' | 'daily' | 'weekly' | 'monthly') =>
                    setCustomReportForm(prev => ({ ...prev, schedule: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No schedule (one-time)</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleShareReport}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowSaveReportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCustomReport} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Report'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI-Powered Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AIInsightsPanel
            insights={mockAIInsights}
            onAskQuestion={(q) => toast.info('Question Submitted')}
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
