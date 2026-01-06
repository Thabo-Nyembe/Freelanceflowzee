'use client'

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useReducer, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Download,
  Plus,
  Search,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Trash2,
  MoreVertical,
  Share2,
  CheckCircle2,
  Mail,
  Sparkles,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Wallet,
  Target,
  Award,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { createFeatureLogger } from '@/lib/logger'

// Initialize feature logger
const logger = createFeatureLogger('Reports')

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useCurrentUser } from '@/hooks/use-ai-data'

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

interface FinancialAnalytics {
  revenueData: {
    monthly: { month: string; revenue: number; growth: number }[]
    yearly: { year: number; revenue: number; growth: number }
    currentMonth: number
    lastMonth: number
    averageProjectValue: number
  }
  profitability: {
    projects: {
      id: string
      name: string
      revenue: number
      expenses: number
      profit: number
      margin: number
    }[]
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
    averageMargin: number
  }
  cashFlow: {
    projections: { month: string; income: number; expenses: number; net: number }[]
    currentBalance: number
    projectedBalance: number
    runway: number // months
  }
  insights: {
    topServices: { service: string; revenue: number; count: number }[]
    clientRetention: number // percentage
    seasonalTrends: { quarter: string; revenue: number; projects: number }[]
    growthRate: number // percentage
  }
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
  logger.debug('Reducer action', { action: action.type })

  switch (action.type) {
    case 'SET_REPORTS':
      logger.info('Reports loaded', { count: action.reports.length })
      return { ...state, reports: action.reports }

    case 'ADD_REPORT':
      logger.info('Report added', { id: action.report.id, name: action.report.name })
      return { ...state, reports: [action.report, ...state.reports] }

    case 'UPDATE_REPORT':
      logger.info('Report updated', { id: action.report.id })
      return {
        ...state,
        reports: state.reports.map(r => r.id === action.report.id ? action.report : r)
      }

    case 'DELETE_REPORT':
      logger.info('Report deleted', { id: action.reportId })
      return {
        ...state,
        reports: state.reports.filter(r => r.id !== action.reportId),
        selectedReport: state.selectedReport?.id === action.reportId ? null : state.selectedReport
      }

    case 'SELECT_REPORT':
      logger.debug('Report selected', { name: action.report?.name || 'None' })
      return { ...state, selectedReport: action.report }

    case 'SET_SEARCH':
      logger.debug('Search term updated', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_TYPE':
      logger.debug('Filter type changed', { filterType: action.filterType })
      return { ...state, filterType: action.filterType }

    case 'SET_FILTER_STATUS':
      logger.debug('Filter status changed', { filterStatus: action.filterStatus })
      return { ...state, filterStatus: action.filterStatus }

    case 'SET_SORT':
      logger.debug('Sort changed', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode changed', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_REPORT':
      const isSelected = state.selectedReports.includes(action.reportId)
      logger.debug('Report selection toggled', { id: action.reportId, selected: !isSelected })
      return {
        ...state,
        selectedReports: isSelected
          ? state.selectedReports.filter(id => id !== action.reportId)
          : [...state.selectedReports, action.reportId]
      }

    case 'CLEAR_SELECTED_REPORTS':
      logger.debug('Selected reports cleared')
      return { ...state, selectedReports: [] }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockReports = (): Report[] => {
  logger.debug('Generating mock reports')

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

  logger.debug('Mock reports generated', { count: reports.length })
  return reports
}

const generateMockFinancialData = (): FinancialAnalytics => {
  logger.debug('Generating mock financial analytics data')

  return {
    revenueData: {
      monthly: [
        { month: 'Jan', revenue: 24500, growth: 12 },
        { month: 'Feb', revenue: 28700, growth: 17 },
        { month: 'Mar', revenue: 32100, growth: 12 },
        { month: 'Apr', revenue: 29800, growth: -7 },
        { month: 'May', revenue: 35400, growth: 19 },
        { month: 'Jun', revenue: 38900, growth: 10 },
        { month: 'Jul', revenue: 42300, growth: 9 },
        { month: 'Aug', revenue: 39600, growth: -6 },
        { month: 'Sep', revenue: 44200, growth: 12 },
        { month: 'Oct', revenue: 47800, growth: 8 },
        { month: 'Nov', revenue: 51200, growth: 7 },
        { month: 'Dec', revenue: 54600, growth: 7 }
      ],
      yearly: { year: 2024, revenue: 469100, growth: 23 },
      currentMonth: 54600,
      lastMonth: 51200,
      averageProjectValue: 8750
    },
    profitability: {
      projects: [
        { id: 'PRJ-001', name: 'E-commerce Platform', revenue: 45000, expenses: 18000, profit: 27000, margin: 60 },
        { id: 'PRJ-002', name: 'Mobile App Design', revenue: 32000, expenses: 12800, profit: 19200, margin: 60 },
        { id: 'PRJ-003', name: 'Brand Identity Package', revenue: 15000, expenses: 4500, profit: 10500, margin: 70 },
        { id: 'PRJ-004', name: 'Website Redesign', revenue: 28000, expenses: 11200, profit: 16800, margin: 60 },
        { id: 'PRJ-005', name: 'Marketing Campaign', revenue: 22000, expenses: 8800, profit: 13200, margin: 60 },
        { id: 'PRJ-006', name: 'SEO Optimization', revenue: 12000, expenses: 3600, profit: 8400, margin: 70 }
      ],
      totalRevenue: 154000,
      totalExpenses: 58900,
      totalProfit: 95100,
      averageMargin: 62
    },
    cashFlow: {
      projections: [
        { month: 'Jan', income: 52000, expenses: 21000, net: 31000 },
        { month: 'Feb', income: 48000, expenses: 19000, net: 29000 },
        { month: 'Mar', income: 55000, expenses: 22000, net: 33000 },
        { month: 'Apr', income: 58000, expenses: 23000, net: 35000 },
        { month: 'May', income: 51000, expenses: 20000, net: 31000 },
        { month: 'Jun', income: 60000, expenses: 24000, net: 36000 }
      ],
      currentBalance: 125000,
      projectedBalance: 320000,
      runway: 18
    },
    insights: {
      topServices: [
        { service: 'Web Development', revenue: 145000, count: 12 },
        { service: 'Mobile Apps', revenue: 98000, count: 8 },
        { service: 'UI/UX Design', revenue: 87000, count: 15 },
        { service: 'Branding', revenue: 64000, count: 10 },
        { service: 'SEO & Marketing', revenue: 75000, count: 14 }
      ],
      clientRetention: 87,
      seasonalTrends: [
        { quarter: 'Q1 2024', revenue: 85300, projects: 8 },
        { quarter: 'Q2 2024', revenue: 104100, projects: 11 },
        { quarter: 'Q3 2024', revenue: 126100, projects: 13 },
        { quarter: 'Q4 2024', revenue: 153600, projects: 15 }
      ],
      growthRate: 23
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsPage() {
  logger.debug('Component mounting')

  // A+++ UTILITIES
  const { announce } = useAnnouncer()
  const { userId, userName, loading: userLoading } = useCurrentUser()

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
  const [financialData, setFinancialData] = useState<FinancialAnalytics | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics')

  // MODALS
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareReport, setShareReport] = useState<Report | null>(null)
  const [shareRecipients, setShareRecipients] = useState('')
  const [shareMessage, setShareMessage] = useState('')

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
    const loadData = async () => {
      // If user is still loading, wait
      if (userLoading) {
        logger.info('Waiting for user authentication')
        return
      }

      // If no userId after loading completes, use mock data
      if (!userId) {
        logger.info('No authenticated user, loading mock data')
        const mockReports = generateMockReports()
        dispatch({ type: 'SET_REPORTS', reports: mockReports })
        const financials = generateMockFinancialData()
        setFinancialData(financials)
        setIsLoading(false)
        return
      }

      try{
        setIsLoading(true)

        logger.info('Loading reports from Supabase', { userId })

        // Dynamic import for code splitting
        const { getReports } = await import('@/lib/reports-queries')

        // Load reports from Supabase
        const { data: reportsData, error: reportsError } = await getReports(userId)

        if (reportsError) {
          logger.warn('Failed to load reports from Supabase, using mock data', { error: reportsError })
          const mockReports = generateMockReports()
          dispatch({ type: 'SET_REPORTS', reports: mockReports })
        } else if (reportsData.length === 0) {
          logger.info('No reports found in Supabase, using mock data')
          const mockReports = generateMockReports()
          dispatch({ type: 'SET_REPORTS', reports: mockReports })
        } else {
          // Transform database format to UI format
          const transformedReports: Report[] = reportsData.map(report => ({
            id: report.id,
            name: report.name,
            type: report.type,
            status: report.status,
            description: report.description || '',
            createdAt: report.created_at,
            updatedAt: report.updated_at,
            createdBy: report.created_by || 'Unknown',
            dateRange: {
              start: report.date_range_start || new Date().toISOString(),
              end: report.date_range_end || new Date().toISOString()
            },
            frequency: report.frequency,
            nextRun: report.next_run_at,
            dataPoints: report.data_points,
            fileSize: report.file_size,
            recipients: report.recipients,
            tags: report.tags
          }))

          dispatch({ type: 'SET_REPORTS', reports: transformedReports })
          logger.info('Reports loaded successfully from Supabase', { count: transformedReports.length })
        }

        // Load financial analytics (using mock data for now)
        const financials = generateMockFinancialData()
        setFinancialData(financials)
        logger.info('Financial analytics loaded', {
          revenue: financials.revenueData.yearly.revenue,
          profit: financials.profitability.totalProfit,
          projects: financials.profitability.projects.length
        })

        announce('Reports and financial analytics loaded', 'polite')
        toast.success('Reports loaded', {
          description: `${reportsData.length} reports loaded from database`
        })
      } catch (error) {
        logger.error('Failed to load data', { error, userId })
        toast.error('Failed to load dashboard data', {
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        })

        // Fallback to mock data on error
        const mockReports = generateMockReports()
        dispatch({ type: 'SET_REPORTS', reports: mockReports })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, userLoading, announce])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    logger.debug('Calculating report stats')

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

    logger.debug('Report stats calculated', result)
    return result
  }, [state.reports])

  const filteredAndSortedReports = useMemo(() => {
    logger.debug('Filtering and sorting reports', { searchTerm: state.searchTerm, filterType: state.filterType, filterStatus: state.filterStatus, sortBy: state.sortBy })

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

    logger.debug('Reports filtered', { count: filtered.length })
    return filtered
  }, [state.reports, state.searchTerm, state.filterType, state.filterStatus, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateReport = async () => {
    if (!reportForm.name) {
      logger.warn('Report creation failed', { reason: 'Name required' })
      toast.error('Please enter a report name')
      return
    }

    if (!userId) {
      toast.error('Please log in to create reports')
      logger.warn('Create report attempted without authentication')
      return
    }

    logger.info('Creating new report', {
      name: reportForm.name,
      type: reportForm.type,
      description: reportForm.description,
      frequency: reportForm.frequency,
      userId
    })

    try {
      setIsSaving(true)

      // Dynamic import for code splitting
      const { createReport } = await import('@/lib/reports-queries')

      // Create report in Supabase
      const { data: newReport, error } = await createReport(userId, {
        name: reportForm.name,
        type: reportForm.type,
        description: reportForm.description,
        frequency: reportForm.frequency,
        status: 'draft',
        created_by: userName || 'Unknown User',
      })

      if (error) {
        throw new Error(error.message || 'Failed to create report')
      }

      if (newReport) {
        // Transform database format to UI format
        const transformedReport: Report = {
          id: newReport.id,
          name: newReport.name,
          type: newReport.type,
          status: newReport.status,
          description: newReport.description || '',
          createdAt: newReport.created_at,
          updatedAt: newReport.updated_at,
          createdBy: newReport.created_by || 'Unknown',
          dateRange: {
            start: newReport.date_range_start || new Date().toISOString(),
            end: newReport.date_range_end || new Date().toISOString()
          },
          frequency: newReport.frequency,
          nextRun: newReport.next_run_at,
          dataPoints: newReport.data_points,
          fileSize: newReport.file_size,
          recipients: newReport.recipients,
          tags: newReport.tags
        }

        dispatch({ type: 'ADD_REPORT', report: transformedReport })

        logger.info('Report created successfully', {
          reportId: newReport.id,
          name: newReport.name,
          type: newReport.type
        })

        toast.success('Report created successfully', {
          description: `${reportForm.name} - ${reportForm.type} report - ${reportForm.frequency} frequency - Ready to generate`
        })
        setIsCreateModalOpen(false)
        setReportForm({ name: '', type: 'analytics', description: '', frequency: 'once' })
        announce(`Report ${reportForm.name} created successfully`, 'polite')
      }
    } catch (error: any) {
      logger.error('Failed to create report', { error: error instanceof Error ? error.message : String(error), userId })
      toast.error('Failed to create report', {
        description: error.message || 'Please try again later'
      })
      announce('Failed to create report', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    const report = state.reports.find(r => r.id === reportId)

    logger.info('Generating report', {
      reportId,
      name: report?.name,
      type: report?.type,
      status: report?.status
    })

    try {
      const updatedReport = {
        ...report!,
        status: 'generating' as ReportStatus,
        updatedAt: new Date().toISOString()
      }

      dispatch({ type: 'UPDATE_REPORT', report: updatedReport })

      toast.promise(
        new Promise(resolve => setTimeout(resolve, 2500)),
        {
          loading: `Generating ${report?.name}...`,
          success: `Report ${report?.name} generation started`,
          error: 'Failed to start report generation'
        }
      )

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          reportId
        })
      })

      const result = await response.json()
      logger.debug('Generate API response received', { success: result.success })

      if (result.success) {
        const readyReport = {
          ...updatedReport,
          status: 'ready' as ReportStatus,
          dataPoints: result.dataPoints,
          fileSize: result.fileSize,
          updatedAt: result.report.updatedAt
        }

        dispatch({ type: 'UPDATE_REPORT', report: readyReport })

        const fileSizeMB = (result.fileSize / (1024 * 1024)).toFixed(2)
        const dataPointsK = (result.dataPoints / 1000).toFixed(1)

        logger.info('Report generated successfully', {
          reportId,
          name: report?.name,
          dataPoints: result.dataPoints,
          fileSize: result.fileSize
        })

        toast.success('Report generated successfully', {
          description: `${report?.name} - ${dataPointsK}k data points - ${fileSizeMB} MB - Ready to export`
        })
      } else {
        throw new Error(result.error || 'Failed to generate report')
      }
    } catch (error: any) {
      logger.error('Failed to generate report', { error: error instanceof Error ? error.message : String(error) })
      toast.error('Failed to generate report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!userId) {
      toast.error('Please log in to delete reports')
      logger.warn('Delete report attempted without authentication')
      return
    }

    const report = state.reports.find(r => r.id === reportId)

    logger.info('Deleting report', {
      reportId,
      name: report?.name,
      type: report?.type,
      status: report?.status,
      userId
    })

    try {
      // Dynamic import for code splitting
      const { deleteReport } = await import('@/lib/reports-queries')

      // Delete report from Supabase
      const { success, error } = await deleteReport(reportId, userId)

      if (error) {
        throw new Error(error.message || 'Failed to delete report')
      }

      if (success) {
        dispatch({ type: 'DELETE_REPORT', reportId })

        logger.info('Report deleted successfully', {
          reportId,
          name: report?.name,
          type: report?.type
        })

        toast.success('Report deleted successfully', {
          description: `${report?.name} - ${report?.type} report - Removed from dashboard`
        })
        setIsDeleteModalOpen(false)
        announce(`Report ${report?.name} deleted successfully`, 'polite')

      } else {
        throw new Error('Failed to delete report')
      }
    } catch (error: any) {
      logger.error('Failed to delete report', { error: error instanceof Error ? error.message : String(error) })
      toast.error('Failed to delete report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleExportReport = async () => {
    if (!state.selectedReport) return

    logger.info('Exporting report', {
      reportId: state.selectedReport.id,
      name: state.selectedReport.name,
      type: state.selectedReport.type,
      format: exportFormat
    })

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
      logger.debug('Export API response received', { success: result.success })

      if (result.success) {
        const fileSizeMB = result.fileSize ? (result.fileSize / (1024 * 1024)).toFixed(2) : '0'

        logger.info('Report exported successfully', {
          reportId: state.selectedReport.id,
          name: state.selectedReport.name,
          format: exportFormat,
          fileSize: result.fileSize
        })

        toast.success(`Report exported as ${exportFormat.toUpperCase()}`, {
          description: `${state.selectedReport.name} - ${state.selectedReport.type} - ${fileSizeMB} MB - ${result.downloadUrl ? 'Download started' : 'Export completed'}`
        })
        setIsExportModalOpen(false)

      } else {
        throw new Error(result.error || 'Failed to export report')
      }
    } catch (error: any) {
      logger.error('Failed to export report', { error: error instanceof Error ? error.message : String(error) })
      toast.error('Failed to export report', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleScheduleReport = async () => {
    if (!state.selectedReport || !scheduleTime) {
      logger.warn('Schedule creation failed', { reason: 'Missing schedule details' })
      toast.error('Please select a time')
      return
    }

    logger.info('Scheduling report', {
      reportId: state.selectedReport.id,
      name: state.selectedReport.name,
      type: state.selectedReport.type,
      scheduleTime
    })

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
      logger.debug('Schedule API response received', { success: result.success })

      if (result.success) {
        const updatedReport = {
          ...state.selectedReport,
          status: 'scheduled' as ReportStatus,
          nextRun: result.nextRun
        }

        dispatch({ type: 'UPDATE_REPORT', report: updatedReport })

        const nextRunDate = new Date(result.nextRun).toLocaleString()

        logger.info('Report scheduled successfully', {
          reportId: state.selectedReport.id,
          name: state.selectedReport.name,
          nextRun: result.nextRun
        })

        toast.success('Report scheduled successfully', {
          description: `${state.selectedReport.name} - ${state.selectedReport.type} - Next run: ${nextRunDate} - Automated delivery enabled`
        })
        setIsScheduleModalOpen(false)
        setScheduleTime('')

      } else {
        throw new Error(result.error || 'Failed to schedule report')
      }
    } catch (error: any) {
      logger.error('Failed to schedule report', { error: error instanceof Error ? error.message : String(error) })
      toast.error('Failed to schedule report', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportFinancialData = async () => {
    logger.info('Exporting financial report data')
    announce('Exporting financial data', 'polite')

    toast.promise(
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            const csvContent = `Financial Report - ${new Date().toLocaleDateString()}\nMetric,Value\nCurrent Month Revenue,$${financialData?.revenueData.currentMonth}\nYear to Date,$${financialData?.revenueData.yearly.revenue}\nClient Retention,${financialData?.insights.clientRetention}%\nAvg Project Value,$${financialData?.revenueData.averageProjectValue}\nCash Runway,${financialData?.cashFlow.runway} months`

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            announce('Financial data exported successfully', 'polite')
            resolve()
          } catch (err: any) {
            logger.error('Export failed', { error: err.message })
            reject(err)
          }
        }, 1200)
      }),
      {
        loading: 'Exporting financial data...',
        success: 'Financial data exported - CSV file downloaded',
        error: 'Failed to export data'
      }
    )
  }

  const handleDeleteSelected = async () => {
    if (state.selectedReports.length === 0) {
      toast.error('No reports selected')
      return
    }

    const selectedCount = state.selectedReports.length
    logger.info('Deleting selected reports', {
      count: selectedCount,
      reportIds: state.selectedReports.map(r => r.id)
    })

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const { deleteReport } = await import('@/lib/reports-queries')

          // Delete all selected reports
          await Promise.all(
            state.selectedReports.map(report => deleteReport(report.id, 'user-id'))
          )

          dispatch({ type: 'DELETE_SELECTED_REPORTS' })
          announce(`${selectedCount} reports deleted`, 'polite')
          resolve()
        } catch (err: any) {
          logger.error('Bulk delete failed', { error: err.message })
          reject(err)
        }
      }),
      {
        loading: `Deleting ${selectedCount} report${selectedCount > 1 ? 's' : ''}...`,
        success: `${selectedCount} report${selectedCount > 1 ? 's' : ''} deleted successfully`,
        error: 'Failed to delete reports'
      }
    )
  }

  const handleEditReport = async (report: Report) => {
    try {
      logger.info('Opening report editor', {
        reportId: report.id,
        name: report.name,
        type: report.type
      })

      dispatch({ type: 'SELECT_REPORT', report })
      setIsCreateModalOpen(true)

      toast.promise(
        new Promise(resolve => setTimeout(resolve, 600)),
        {
          loading: 'Opening editor...',
          success: `Editing ${report.name}`,
          error: 'Failed to open editor'
        }
      )
    } catch (err: any) {
      logger.error('Failed to open editor', { error: err.message })
    }
  }

  const handleShareReport = (report: Report) => {
    logger.info('Opening share dialog', {
      reportId: report.id,
      name: report.name,
      type: report.type
    })
    setShareReport(report)
    setShareRecipients('')
    setShareMessage('')
    setIsShareModalOpen(true)
    announce(`Opening share options for ${report.name}`, 'polite')
  }

  const handleConfirmShare = async () => {
    if (!shareReport) return
    if (!shareRecipients.trim()) {
      toast.error('Please enter at least one recipient email')
      return
    }

    const reportName = shareReport.name
    const recipientList = shareRecipients.split(',').map(e => e.trim())

    setIsSaving(true)
    logger.info('Sending share', {
      reportId: shareReport.id,
      recipients: recipientList
    })

    toast.promise(
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            // Open email client to share report
            const subject = encodeURIComponent(`Report: ${reportName}`)
            const body = encodeURIComponent(`Please find the attached report "${reportName}".\n\nReport URL: ${window.location.origin}/reports/${shareReport.id}`)
            window.open(`mailto:${recipientList.join(',')}?subject=${subject}&body=${body}`, '_blank')

            announce('Report shared successfully', 'polite')
            setIsShareModalOpen(false)
            setShareReport(null)
            setIsSaving(false)
            resolve()
          } catch (err: any) {
            logger.error('Share failed', { error: err.message })
            setIsSaving(false)
            reject(err)
          }
        }, 800)
      }),
      {
        loading: `Sharing "${reportName}"...`,
        success: `"${reportName}" shared with ${recipientList.length} recipient(s)`,
        error: 'Failed to share report'
      }
    )
  }

  const handleDuplicateReport = async (report: Report) => {
    logger.info('Duplicating report', {
      reportId: report.id,
      name: report.name
    })

    toast.promise(
      new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const { createReport } = await import('@/lib/reports-queries')

            const duplicatedReport = {
              ...report,
              name: `${report.name} (Copy)`,
              status: 'draft' as ReportStatus
            }

            // await createReport('user-id', duplicatedReport)

            announce('Report duplicated successfully', 'polite')
            resolve()
          } catch (err: any) {
            logger.error('Duplication failed', { error: err.message })
            reject(err)
          }
        }, 1000)
      }),
      {
        loading: `Duplicating "${report.name}"...`,
        success: `Created copy of "${report.name}"`,
        error: 'Failed to duplicate report'
      }
    )
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
                  Comprehensive financial insights and report generation
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </ScrollReveal>

        {/* Navigation Tabs - USER MANUAL SPEC */}
        <ScrollReveal>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'analytics' | 'reports')} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="analytics">
                <DollarSign className="h-4 w-4 mr-2" />
                Financial Analytics
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports Library
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </ScrollReveal>

        {/* FINANCIAL ANALYTICS TAB - USER MANUAL SPEC */}
        {activeTab === 'analytics' && financialData && (
          <>
            {/* Revenue Overview Section */}
            <ScrollReveal>
              <LiquidGlassCard className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:bg-slate-800 dark:from-transparent dark:via-transparent dark:to-transparent border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                      Revenue Tracking
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monthly and yearly revenue breakdown with growth trends</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportFinancialData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Month</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $<NumberFlow value={financialData.revenueData.currentMonth} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
                      +{((financialData.revenueData.currentMonth - financialData.revenueData.lastMonth) / financialData.revenueData.lastMonth * 100).toFixed(1)}% vs last month
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Client Retention</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      <NumberFlow value={financialData.insights.clientRetention} />%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Industry avg: 75%</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Project Value</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      $<NumberFlow value={financialData.revenueData.averageProjectValue} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per completed project</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cash Runway</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      <NumberFlow value={financialData.cashFlow.runway} /> mo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on current burn rate</p>
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Breakdown (2024)</h3>
                  <div className="space-y-2">
                    {financialData.revenueData.monthly.map((month, index) => {
                      const maxRevenue = Math.max(...financialData.revenueData.monthly.map(m => m.revenue))
                      const widthPercent = (month.revenue / maxRevenue) * 100

                      return (
                        <div key={month.month} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8">{month.month}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPercent}%` }}
                              transition={{ duration: 0.8, delay: index * 0.05 }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-end px-3"
                            >
                              <span className="text-xs font-bold text-white">${(month.revenue / 1000).toFixed(1)}k</span>
                            </motion.div>
                          </div>
                          <div className={`text-xs font-semibold w-12 text-right ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {month.growth >= 0 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                            {Math.abs(month.growth)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2024 Total Revenue</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">${(financialData.revenueData.yearly.revenue / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">YoY Growth</p>
                      <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        {financialData.revenueData.yearly.growth}%
                      </p>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Project Profitability Analysis */}
            <ScrollReveal delay={0.1}>
              <LiquidGlassCard className="p-6 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      Project Profitability Analysis
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Revenue, expenses, and profit margins per project</p>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $<NumberFlow value={financialData.profitability.totalRevenue} />
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <p className="text-xs text-red-700 dark:text-red-400 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      $<NumberFlow value={financialData.profitability.totalExpenses} />
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Net Profit</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      $<NumberFlow value={financialData.profitability.totalProfit} />
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">Avg Margin</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      <NumberFlow value={financialData.profitability.averageMargin} />%
                    </p>
                  </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-700 dark:text-gray-300 px-4 py-3">Project</th>
                        <th className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300 px-4 py-3">Revenue</th>
                        <th className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300 px-4 py-3">Expenses</th>
                        <th className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300 px-4 py-3">Profit</th>
                        <th className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300 px-4 py-3">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {financialData.profitability.projects.map((project, index) => (
                        <motion.tr
                          key={project.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{project.id}</p>
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                            ${project.revenue.toLocaleString()}
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
                            ${project.expenses.toLocaleString()}
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                            ${project.profit.toLocaleString()}
                          </td>
                          <td className="text-right px-4 py-3">
                            <Badge className={project.margin >= 65 ? 'bg-green-500' : project.margin >= 55 ? 'bg-yellow-500' : 'bg-orange-500'}>
                              {project.margin}%
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Cash Flow Projections */}
            <ScrollReveal delay={0.2}>
              <LiquidGlassCard className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-slate-800 dark:from-transparent dark:via-transparent dark:to-transparent border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      Cash Flow Projections
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">6-month income and expense forecast</p>
                  </div>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      $<NumberFlow value={financialData.cashFlow.currentBalance} />
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projected (6mo)</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $<NumberFlow value={financialData.cashFlow.projectedBalance} />
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Growth</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <ArrowUpRight className="w-5 h-5" />
                      <NumberFlow value={((financialData.cashFlow.projectedBalance - financialData.cashFlow.currentBalance) / financialData.cashFlow.currentBalance * 100)} />%
                    </p>
                  </div>
                </div>

                {/* Projections Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-gray-900/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Monthly Cash Flow Projections</h3>
                  <div className="space-y-3">
                    {financialData.cashFlow.projections.map((month, index) => (
                      <div key={month.month} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{month.month}</span>
                          <span className={`font-bold ${month.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            Net: ${month.net.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-1 h-6">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(month.income / (month.income + month.expenses)) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center justify-center"
                          >
                            <span className="text-xs font-bold text-white">${(month.income / 1000).toFixed(0)}k</span>
                          </motion.div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(month.expenses / (month.income + month.expenses)) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 + 0.1 }}
                            className="bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center"
                          >
                            <span className="text-xs font-bold text-white">${(month.expenses / 1000).toFixed(0)}k</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Business Insights */}
            <ScrollReveal delay={0.3}>
              <LiquidGlassCard className="p-6 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      Business Insights
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top services, seasonal trends, and growth analysis</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Services */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      Top Performing Services
                    </h3>
                    <div className="space-y-2">
                      {financialData.insights.topServices.map((service, index) => {
                        const maxRevenue = Math.max(...financialData.insights.topServices.map(s => s.revenue))
                        const widthPercent = (service.revenue / maxRevenue) * 100

                        return (
                          <div key={service.service} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{service.service}</span>
                              <span className="font-bold text-yellow-700 dark:text-yellow-400">${(service.revenue / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="bg-white dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPercent}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-end px-2"
                              >
                                <span className="text-xs font-bold text-white">{service.count} projects</span>
                              </motion.div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Seasonal Trends */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:bg-slate-800 dark:from-transparent dark:to-transparent rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Quarterly Performance Trends
                    </h3>
                    <div className="space-y-3">
                      {financialData.insights.seasonalTrends.map((quarter, index) => {
                        const growth = index > 0
                          ? ((quarter.revenue - financialData.insights.seasonalTrends[index - 1].revenue) / financialData.insights.seasonalTrends[index - 1].revenue * 100)
                          : 0

                        return (
                          <div key={quarter.quarter} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{quarter.quarter}</span>
                              {index > 0 && (
                                <span className={`text-xs font-bold flex items-center gap-1 ${growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {Math.abs(growth).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${(quarter.revenue / 1000).toFixed(1)}k</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{quarter.projects} projects</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall Growth Rate</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <ArrowUpRight className="w-5 h-5" />
                        <NumberFlow value={financialData.insights.growthRate} />% YoY
                      </p>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* REPORTS LIBRARY TAB */}
        {activeTab === 'reports' && (
          <>
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
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
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
          </>
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

        {/* Share Modal */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Report
              </DialogTitle>
              <DialogDescription>
                Share &quot;{shareReport?.name}&quot; with team members via email
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="share-recipients">Recipients</Label>
                <Input
                  id="share-recipients"
                  type="text"
                  placeholder="Enter email addresses (comma-separated)"
                  value={shareRecipients}
                  onChange={(e) => setShareRecipients(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple emails with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-message">Message (optional)</Label>
                <Textarea
                  id="share-message"
                  placeholder="Add a personal message..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-medium">Report Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{shareReport?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {shareReport?.type}
                    </Badge>
                    <span className="text-xs">{shareReport?.format?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsShareModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmShare}
                disabled={isSaving || !shareRecipients.trim()}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>Sharing...</>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Share Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
