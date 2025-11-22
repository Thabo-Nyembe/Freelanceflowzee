'use client'

import React, { useState, useEffect, useReducer, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FilePdf,
  FileJson,
  Mail,
  Repeat,
  X,
  Check,
  Sparkles,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'

// Premium Components
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ReportType = 'analytics' | 'financial' | 'performance' | 'sales' | 'custom'
type ReportStatus = 'draft' | 'generating' | 'ready' | 'scheduled' | 'failed'
type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly'
type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'

interface Report {
  id: string
  name: string
  type: ReportType
  status: ReportStatus
  description: string
  createdAt: string
  updatedAt: string
  createdBy: string
  dateRange: {
    start: string
    end: string
  }
  frequency: ReportFrequency
  nextRun?: string
  dataPoints: number
  fileSize: number
  recipients: string[]
  tags: string[]
}

interface ReportsState {
  reports: Report[]
  selectedReport: Report | null
  searchTerm: string
  filterType: ReportType | 'all'
  filterStatus: ReportStatus | 'all'
  sortBy: 'name' | 'date' | 'type' | 'status'
  viewMode: 'grid' | 'list'
  selectedReports: string[]
}

type ReportsAction =
  | { type: 'SET_REPORTS'; reports: Report[] }
  | { type: 'ADD_REPORT'; report: Report }
  | { type: 'UPDATE_REPORT'; report: Report }
  | { type: 'DELETE_REPORT'; reportId: string }
  | { type: 'SELECT_REPORT'; report: Report | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_TYPE'; filterType: ReportsState['filterType'] }
  | { type: 'SET_FILTER_STATUS'; filterStatus: ReportsState['filterStatus'] }
  | { type: 'SET_SORT'; sortBy: ReportsState['sortBy'] }
  | { type: 'SET_VIEW_MODE'; viewMode: ReportsState['viewMode'] }
  | { type: 'TOGGLE_SELECT_REPORT'; reportId: string }
  | { type: 'CLEAR_SELECTED_REPORTS' }

// ============================================================================
// REDUCER
// ============================================================================

function reportsReducer(state: ReportsState, action: ReportsAction): ReportsState {
  console.log('🔄 REPORTS REDUCER: Action:', action.type)

  switch (action.type) {
    case 'SET_REPORTS':
      console.log('✅ REPORTS: Set reports -', action.reports.length, 'reports loaded')
      return { ...state, reports: action.reports }

    case 'ADD_REPORT':
      console.log('✅ REPORTS: Report added - ID:', action.report.id, 'Name:', action.report.name)
      return { ...state, reports: [action.report, ...state.reports] }

    case 'UPDATE_REPORT':
      console.log('✅ REPORTS: Report updated - ID:', action.report.id)
      return {
        ...state,
        reports: state.reports.map(r => r.id === action.report.id ? action.report : r)
      }

    case 'DELETE_REPORT':
      console.log('✅ REPORTS: Report deleted - ID:', action.reportId)
      return {
        ...state,
        reports: state.reports.filter(r => r.id !== action.reportId),
        selectedReport: state.selectedReport?.id === action.reportId ? null : state.selectedReport
      }

    case 'SELECT_REPORT':
      console.log('👁️ REPORTS: Report selected -', action.report ? action.report.name : 'None')
      return { ...state, selectedReport: action.report }

    case 'SET_SEARCH':
      console.log('🔍 REPORTS: Search term:', action.searchTerm)
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_TYPE':
      console.log('🔍 REPORTS: Filter type:', action.filterType)
      return { ...state, filterType: action.filterType }

    case 'SET_FILTER_STATUS':
      console.log('🔍 REPORTS: Filter status:', action.filterStatus)
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_SORT':
      console.log('🔀 REPORTS: Sort by:', action.sortBy)
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      console.log('🖼️ REPORTS: View mode:', action.viewMode)
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_REPORT':
      const isSelected = state.selectedReports.includes(action.reportId)
      console.log('☑️ REPORTS: Toggle select report:', action.reportId, isSelected ? 'deselected' : 'selected')
      return {
        ...state,
        selectedReports: isSelected
          ? state.selectedReports.filter(id => id !== action.reportId)
          : [...state.selectedReports, action.reportId]
      }

    case 'CLEAR_SELECTED_REPORTS':
      console.log('✅ REPORTS: Cleared selected reports')
      return { ...state, selectedReports: [] }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockReports = (): Report[] => {
  console.log('📊 REPORTS: Generating mock reports...')

  const types: ReportType[] = ['analytics', 'financial', 'performance', 'sales', 'custom']
  const statuses: ReportStatus[] = ['draft', 'generating', 'ready', 'scheduled', 'failed']
  const frequencies: ReportFrequency[] = ['once', 'daily', 'weekly', 'monthly', 'quarterly']

  const reportNames = [
    'Q4 2024 Financial Summary', 'Monthly Sales Performance', 'User Engagement Analytics',
    'Revenue Growth Report', 'Customer Acquisition Report', 'Quarterly Performance Review',
    'Annual Financial Statement', 'Marketing Campaign Analysis', 'Product Usage Statistics',
    'Team Productivity Report', 'Client Satisfaction Survey', 'Website Traffic Analysis',
    'Conversion Rate Optimization', 'Churn Analysis Report', 'Retention Metrics Dashboard',
    'Sales Pipeline Report', 'Expense Analysis', 'ROI Performance Report',
    'Social Media Analytics', 'Email Campaign Results'
  ]

  const reports: Report[] = reportNames.map((name, index) => ({
    id: `RPT-${String(index + 1).padStart(3, '0')}`,
    name,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    description: `Comprehensive ${name.toLowerCase()} with detailed metrics and insights`,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: ['John Doe', 'Jane Smith', 'Bob Johnson'][Math.floor(Math.random() * 3)],
    dateRange: {
      start: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    },
    frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
    nextRun: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    dataPoints: Math.floor(Math.random() * 10000) + 1000,
    fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
    recipients: Math.random() > 0.5 ? ['team@example.com', 'manager@example.com'] : [],
    tags: ['quarterly', 'important', 'automated'].slice(0, Math.floor(Math.random() * 3) + 1)
  }))

  console.log('✅ REPORTS: Generated', reports.length, 'mock reports')
  return reports
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsPage() {
  console.log('🚀 REPORTS: Component mounting...')

  // A+++ UTILITIES
  const { announce } = useAnnouncer()

  // STATE
  const [state, dispatch] = useReducer(reportsReducer, {
    reports: [],
    selectedReport: null,
    searchTerm: '',
    filterType: 'all',
    filterStatus: 'all',
    sortBy: 'date',
    viewMode: 'grid',
    selectedReports: []
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // MODALS
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // FORM STATES
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'analytics' as ReportType,
    description: '',
    frequency: 'once' as ReportFrequency
  })

  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf')
  const [scheduleTime, setScheduleTime] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    console.log('📊 REPORTS: Loading reports data...')

    const loadData = async () => {
      try {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const reports = generateMockReports()
        dispatch({ type: 'SET_REPORTS', reports })

        console.log('✅ REPORTS: Data loaded successfully')
        announce('Reports dashboard loaded', 'polite')
      } catch (error) {
        console.error('❌ REPORTS: Load error:', error)
        toast.error('Failed to load reports')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [announce])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    console.log('📊 REPORTS: Calculating stats...')

    const totalReports = state.reports.length
    const readyReports = state.reports.filter(r => r.status === 'ready').length
    const scheduledReports = state.reports.filter(r => r.status === 'scheduled').length
    const totalDataPoints = state.reports.reduce((sum, r) => sum + r.dataPoints, 0)

    const result = {
      totalReports,
      readyReports,
      scheduledReports,
      totalDataPoints
    }

    console.log('📊 REPORTS: Stats calculated -', JSON.stringify(result))
    return result
  }, [state.reports])

  const filteredAndSortedReports = useMemo(() => {
    console.log('🔍 REPORTS: Filtering and sorting reports...')

    let filtered = [...state.reports]

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(state.searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (state.filterType !== 'all') {
      filtered = filtered.filter(r => r.type === state.filterType)
    }

    // Filter by status
    if (state.filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === state.filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'type':
          return a.type.localeCompare(b.type)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    console.log('✅ REPORTS: Filtered to', filtered.length, 'reports')
    return filtered
  }, [state.reports, state.searchTerm, state.filterType, state.filterStatus, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateReport = async () => {
    if (!reportForm.name) {
      console.log('⚠️ REPORTS: Report name required')
      toast.error('Please enter a report name')
      return
    }

    console.log('➕ REPORTS: Creating new report...')
    console.log('📝 REPORTS: Name:', reportForm.name)

    try {
      setIsSaving(true)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            name: reportForm.name,
            type: reportForm.type,
            description: reportForm.description,
            frequency: reportForm.frequency
          }
        })
      })

      const result = await response.json()
      console.log('📡 REPORTS: Create API response:', result)

      if (result.success) {
        dispatch({ type: 'ADD_REPORT', report: result.report })
        toast.success('Report created successfully')
        setIsCreateModalOpen(false)
        setReportForm({ name: '', type: 'analytics', description: '', frequency: 'once' })
        console.log('✅ REPORTS: Report created')
      } else {
        throw new Error(result.error || 'Failed to create report')
      }
    } catch (error: any) {
      console.error('❌ REPORTS: Create error:', error)
      toast.error('Failed to create report', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    const report = state.reports.find(r => r.id === reportId)
    console.log('🔄 REPORTS: Generating report - ID:', reportId, 'Name:', report?.name)

    try {
      const updatedReport = {
        ...report!,
        status: 'generating' as ReportStatus,
        updatedAt: new Date().toISOString()
      }

      dispatch({ type: 'UPDATE_REPORT', report: updatedReport })
      toast.info('Generating report...')

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          reportId
        })
      })

      const result = await response.json()
      console.log('📡 REPORTS: Generate API response:', result)

      if (result.success) {
        const readyReport = {
          ...updatedReport,
          status: 'ready' as ReportStatus,
          dataPoints: result.dataPoints,
          fileSize: result.fileSize,
          updatedAt: result.report.updatedAt
        }

        dispatch({ type: 'UPDATE_REPORT', report: readyReport })
        toast.success('Report generated successfully')
        console.log('✅ REPORTS: Report generated')
      } else {
        throw new Error(result.error || 'Failed to generate report')
      }
    } catch (error: any) {
      console.error('❌ REPORTS: Generation error:', error)
      toast.error('Failed to generate report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    const report = state.reports.find(r => r.id === reportId)
    console.log('🗑️ REPORTS: Deleting report - ID:', reportId, 'Name:', report?.name)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          reportId
        })
      })

      const result = await response.json()
      console.log('📡 REPORTS: Delete API response:', result)

      if (result.success) {
        dispatch({ type: 'DELETE_REPORT', reportId })
        toast.success('Report deleted successfully')
        setIsDeleteModalOpen(false)
        console.log('✅ REPORTS: Report deleted')
      } else {
        throw new Error(result.error || 'Failed to delete report')
      }
    } catch (error: any) {
      console.error('❌ REPORTS: Delete error:', error)
      toast.error('Failed to delete report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleExportReport = async () => {
    if (!state.selectedReport) return

    console.log('📤 REPORTS: Exporting report:', state.selectedReport.name)
    console.log('📄 REPORTS: Format:', exportFormat)

    try {
      setIsSaving(true)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          reportId: state.selectedReport.id,
          exportFormat
        })
      })

      const result = await response.json()
      console.log('📡 REPORTS: Export API response:', result)

      if (result.success) {
        toast.success(`Report exported as ${exportFormat.toUpperCase()}`, {
          description: result.downloadUrl ? 'Download started' : 'Export completed'
        })
        setIsExportModalOpen(false)
        console.log('✅ REPORTS: Export complete')
      } else {
        throw new Error(result.error || 'Failed to export report')
      }
    } catch (error: any) {
      console.error('❌ REPORTS: Export error:', error)
      toast.error('Failed to export report', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleScheduleReport = async () => {
    if (!state.selectedReport || !scheduleTime) {
      console.log('⚠️ REPORTS: Missing schedule details')
      toast.error('Please select a time')
      return
    }

    console.log('⏰ REPORTS: Scheduling report:', state.selectedReport.name)
    console.log('📅 REPORTS: Time:', scheduleTime)

    try {
      setIsSaving(true)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule',
          reportId: state.selectedReport.id,
          scheduleTime
        })
      })

      const result = await response.json()
      console.log('📡 REPORTS: Schedule API response:', result)

      if (result.success) {
        const updatedReport = {
          ...state.selectedReport,
          status: 'scheduled' as ReportStatus,
          nextRun: result.nextRun
        }

        dispatch({ type: 'UPDATE_REPORT', report: updatedReport })
        toast.success('Report scheduled successfully', {
          description: `Next run: ${new Date(result.nextRun).toLocaleString()}`
        })
        setIsScheduleModalOpen(false)
        setScheduleTime('')
        console.log('✅ REPORTS: Report scheduled')
      } else {
        throw new Error(result.error || 'Failed to schedule report')
      }
    } catch (error: any) {
      console.error('❌ REPORTS: Schedule error:', error)
      toast.error('Failed to schedule report', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeColor = (type: ReportType) => {
    switch (type) {
      case 'analytics': return 'bg-blue-500/10 text-blue-500'
      case 'financial': return 'bg-green-500/10 text-green-500'
      case 'performance': return 'bg-purple-500/10 text-purple-500'
      case 'sales': return 'bg-orange-500/10 text-orange-500'
      case 'custom': return 'bg-gray-500/10 text-gray-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/10 text-gray-500'
      case 'generating': return 'bg-blue-500/10 text-blue-500'
      case 'ready': return 'bg-green-500/10 text-green-500'
      case 'scheduled': return 'bg-purple-500/10 text-purple-500'
      case 'failed': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'analytics': return BarChart3
      case 'financial': return DollarSign
      case 'performance': return TrendingUp
      case 'sales': return Users
      case 'custom': return Sparkles
      default: return FileText
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
        <div className="container mx-auto px-4 space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
                  <TextShimmer>Reports & Analytics</TextShimmer>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Generate and manage comprehensive reports
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </ScrollReveal>

        {/* Stats Dashboard */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.totalReports} />
                  </p>
                </div>
                <div className="relative">
                  
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready Reports</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.readyReports} />
                  </p>
                </div>
                <div className="relative">
                  
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.scheduledReports} />
                  </p>
                </div>
                <div className="relative">
                  
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-2xl font-bold kazi-text-dark dark:kazi-text-light mt-1">
                    <NumberFlow value={stats.totalDataPoints} />
                  </p>
                </div>
                <div className="relative">
                  
                  <PieChart className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </ScrollReveal>

        {/* Filters & Search */}
        <ScrollReveal>
          <LiquidGlassCard className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={state.searchTerm}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <Select
                value={state.filterType}
                onValueChange={(value) => dispatch({ type: 'SET_FILTER_TYPE', filterType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={state.filterStatus}
                onValueChange={(value) => dispatch({ type: 'SET_FILTER_STATUS', filterStatus: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={state.sortBy}
                onValueChange={(value) => dispatch({ type: 'SET_SORT', sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {state.selectedReports.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {state.selectedReports.length} report(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch({ type: 'CLEAR_SELECTED_REPORTS' })}
                  >
                    Clear
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Reports Grid */}
        {filteredAndSortedReports.length === 0 ? (
          <ScrollReveal>
            <NoDataEmptyState
              title="No reports found"
              message="Create reports or adjust your filters"
              action={{
                label: 'Create Report',
                onClick: () => setIsCreateModalOpen(true)
              }}
            />
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedReports.map((report, index) => {
              const TypeIcon = getTypeIcon(report.type)

              return (
                <ScrollReveal key={report.id} delay={index * 0.05}>
                  <LiquidGlassCard className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeColor(report.type)}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold line-clamp-1">{report.name}</h3>
                            <p className="text-xs text-muted-foreground">{report.createdBy}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              dispatch({ type: 'SELECT_REPORT', report })
                              setIsViewModalOpen(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {report.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleGenerateReport(report.id)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Generate
                              </DropdownMenuItem>
                            )}
                            {report.status === 'ready' && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  dispatch({ type: 'SELECT_REPORT', report })
                                  setIsExportModalOpen(true)
                                }}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  dispatch({ type: 'SELECT_REPORT', report })
                                  setIsScheduleModalOpen(true)
                                }}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                dispatch({ type: 'SELECT_REPORT', report })
                                setIsDeleteModalOpen(true)
                              }}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>

                      {/* Badges */}
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.frequency}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Data Points</p>
                          <p className="font-medium">{report.dataPoints.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">File Size</p>
                          <p className="font-medium">{formatFileSize(report.fileSize)}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                        <span>Created {formatDate(report.createdAt)}</span>
                        {report.recipients.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {report.recipients.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </LiquidGlassCard>
                </ScrollReveal>
              )
            })}
          </div>
        )}

        {/* Create Report Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Generate a new analytics or performance report
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Report Name *</Label>
                <Input
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  placeholder="Q4 Sales Report"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Report Type</Label>
                <Select value={reportForm.type} onValueChange={(v) => setReportForm({ ...reportForm, type: v as ReportType })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Describe what this report will cover..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={reportForm.frequency} onValueChange={(v) => setReportForm({ ...reportForm, frequency: v as ReportFrequency })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Report Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>

            {state.selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm font-medium mt-1">{state.selectedReport.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Badge className={`${getTypeColor(state.selectedReport.type)} mt-1`}>
                      {state.selectedReport.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge className={`${getStatusColor(state.selectedReport.status)} mt-1`}>
                      {state.selectedReport.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Frequency</Label>
                    <p className="text-sm font-medium mt-1 capitalize">{state.selectedReport.frequency}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created By</Label>
                    <p className="text-sm font-medium mt-1">{state.selectedReport.createdBy}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created Date</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(state.selectedReport.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Data Points</Label>
                    <p className="text-sm font-medium mt-1">{state.selectedReport.dataPoints.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">File Size</Label>
                    <p className="text-sm font-medium mt-1">{formatFileSize(state.selectedReport.fileSize)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{state.selectedReport.description}</p>
                </div>
                {state.selectedReport.recipients.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Recipients</Label>
                    <div className="flex gap-2 mt-2">
                      {state.selectedReport.recipients.map((email, i) => (
                        <Badge key={i} variant="outline">{email}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Report</DialogTitle>
              <DialogDescription>
                Download {state.selectedReport?.name} in your preferred format
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportReport} disabled={isSaving}>
                {isSaving ? 'Exporting...' : 'Export Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Modal */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
              <DialogDescription>
                Set up automated delivery for {state.selectedReport?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Next Run Date</Label>
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleReport} disabled={isSaving}>
                {isSaving ? 'Scheduling...' : 'Schedule Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Report</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {state.selectedReport?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => state.selectedReport && handleDeleteReport(state.selectedReport.id)}
              >
                Delete Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
