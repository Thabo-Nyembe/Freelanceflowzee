'use client'
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

import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Lock,
  CheckCircle,
  DollarSign,
  ArrowLeft,
  Download,
  Flag,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Plus,
  Settings,
  RefreshCcw,
  FileText,
  Filter,
  Search,
  MoreHorizontal,
  RotateCcw
} from 'lucide-react'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { formatCurrency, getStatusColor } from '@/lib/client-zone-utils'
import { usePayments, usePaymentMethods, usePaymentsRealtime, usePaymentAnalytics } from '@/lib/hooks/use-payments-extended'
import { useSupabaseMutation } from '@/lib/hooks/use-supabase-mutation'
import { createClient } from '@/lib/supabase/client'

const logger = createSimpleLogger('ClientZonePayments')

// Type Definitions
interface Milestone {
  id: number
  name: string
  description: string
  project: string
  amount: number
  releaseCondition: string
  status: 'completed' | 'in-escrow' | 'released' | 'disputed'
  completionDate?: string
  releaseDate?: string
  dueDate: string
  approvalNotes?: string
}

interface PaymentHistory {
  id: number
  date: string
  milestone: string
  amount: number
  type: 'release' | 'hold' | 'return'
  status: 'completed' | 'pending'
  transactionId: string
}

// Mock Payment Data
const MILESTONES: Milestone[] = [
  {
    id: 1,
    name: 'Logo Concepts',
    description: 'Initial logo concept presentation and client approval',
    project: 'Brand Identity Redesign',
    amount: 2000,
    releaseCondition: 'Client approval of initial concepts',
    status: 'released',
    completionDate: '2024-01-20',
    releaseDate: '2024-01-21',
    dueDate: '2024-01-25',
    approvalNotes: 'All concepts approved. Moving forward with refinement.'
  },
  {
    id: 2,
    name: 'Color Palette & Typography',
    description: 'Finalized brand color palette and typography selection',
    project: 'Brand Identity Redesign',
    amount: 1500,
    releaseCondition: 'Completion and approval of brand color system',
    status: 'in-escrow',
    completionDate: '2024-01-25',
    dueDate: '2024-02-01',
    approvalNotes: 'Awaiting final client approval'
  },
  {
    id: 3,
    name: 'Brand Guidelines Document',
    description: 'Comprehensive brand guidelines and asset package',
    project: 'Brand Identity Redesign',
    amount: 2000,
    releaseCondition: 'Delivery and approval of complete guidelines document',
    status: 'completed',
    completionDate: '2024-02-05',
    dueDate: '2024-02-10',
    approvalNotes: 'Ready for client approval'
  },
  {
    id: 4,
    name: 'Website Design Mockups',
    description: 'Desktop and mobile design mockups for website',
    project: 'Website Development',
    amount: 5000,
    releaseCondition: 'Completion of all page designs and client feedback integration',
    status: 'completed',
    completionDate: '2024-01-22',
    dueDate: '2024-01-30',
    approvalNotes: 'Designs completed. Awaiting your approval to proceed.'
  },
  {
    id: 5,
    name: 'CMS Integration & Testing',
    description: 'Complete CMS setup and quality assurance testing',
    project: 'Website Development',
    amount: 4000,
    releaseCondition: 'Successful completion of QA and staging deployment',
    status: 'released',
    completionDate: '2024-01-20',
    releaseDate: '2024-01-22',
    dueDate: '2024-02-05'
  },
  {
    id: 6,
    name: 'Website Launch & Training',
    description: 'Live deployment and client training session',
    project: 'Website Development',
    amount: 3000,
    releaseCondition: 'Production deployment and completion of client training',
    status: 'in-escrow',
    completionDate: '2024-01-25',
    dueDate: '2024-02-10',
    approvalNotes: 'Awaiting final launch approval and sign-off'
  }
]

const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: 1,
    date: '2024-01-21',
    milestone: 'Logo Concepts',
    amount: 2000,
    type: 'release',
    status: 'completed',
    transactionId: 'TXN-2024-001'
  },
  {
    id: 2,
    date: '2024-01-22',
    milestone: 'CMS Integration & Testing',
    amount: 4000,
    type: 'release',
    status: 'completed',
    transactionId: 'TXN-2024-002'
  },
  {
    id: 3,
    date: '2024-01-25',
    milestone: 'Color Palette & Typography',
    amount: 1500,
    type: 'hold',
    status: 'pending',
    transactionId: 'TXN-2024-003'
  },
  {
    id: 4,
    date: '2024-01-22',
    milestone: 'Website Design Mockups',
    amount: 5000,
    type: 'hold',
    status: 'pending',
    transactionId: 'TXN-2024-004'
  }
]


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Payments Context
// ============================================================================

const paymentsAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const paymentsCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const paymentsPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const paymentsActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions handlers - defined inside component to access router and state
const getPaymentsQuickActions = (
  router: ReturnType<typeof useRouter>,
  milestones: Milestone[],
  paymentHistory: PaymentHistory[],
  setShowRecordPaymentDialog: (show: boolean) => void
) => [
  {
    id: '1',
    label: 'New Item',
    icon: 'Plus',
    shortcut: 'N',
    action: async () => {
      setShowRecordPaymentDialog(true)
    }
  },
  {
    id: '2',
    label: 'Export',
    icon: 'Download',
    shortcut: 'E',
    action: async () => {
      try {
        // Generate CSV from payment history
        const headers = ['Date', 'Milestone', 'Amount', 'Type', 'Transaction ID', 'Status']
        const csvRows = [
          headers.join(','),
          ...paymentHistory.map(payment => [
            new Date(payment.date).toLocaleDateString(),
            `"${payment.milestone}"`,
            payment.amount,
            payment.type,
            payment.transactionId,
            payment.status
          ].join(','))
        ]
        const csvContent = csvRows.join('\n')

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success("Payment data exported to CSV")
      } catch (error) {
        toast.error('Failed to export payment data')
      }
    }
  },
  {
    id: '3',
    label: 'Settings',
    icon: 'Settings',
    shortcut: 'S',
    action: async () => {
      router.push('/dashboard/settings-v2?tab=payments')
    }
  },
]

export default function PaymentsClient() {
  const insightsPanel = useInsightsPanel(false)
  const router = useRouter()

  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Supabase hooks for real data
  const { data: dbPayments = [], total: totalPayments, isLoading: paymentsLoading, refresh: refreshPayments } = usePayments(userId || undefined)
  const { data: dbPaymentMethods = [], isLoading: methodsLoading, refresh: refreshMethods } = usePaymentMethods(userId || undefined)
  const { payments: realtimePayments } = usePaymentsRealtime(userId || undefined)
  const { data: paymentAnalytics = [], isLoading: analyticsLoading, refresh: refreshAnalytics } = usePaymentAnalytics({ period: 'monthly', limit: 12 })

  // Revenue statistics from real data
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    releasedRevenue: 0,
    refundedAmount: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    growthPercentage: 0
  })

  // Supabase mutation hook for CRUD
  const paymentMutation = useSupabaseMutation({
    table: 'payments',
    onSuccess: () => refreshPayments()
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])

  // Map Supabase payment data to local format (with mock fallback)
  const activePayments = useMemo(() => {
    const supabasePayments = realtimePayments.length > 0 ? realtimePayments : dbPayments
    if (supabasePayments && supabasePayments.length > 0) {
      return supabasePayments.map((p: any) => ({
        id: p.id,
        date: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        milestone: p.description || p.reference_number || 'Payment',
        amount: p.amount || 0,
        type: p.payment_type || 'hold',
        status: p.status || 'pending',
        transactionId: p.transaction_id || p.reference_number || `TXN-${p.id?.slice(0, 8) || Date.now()}`
      }))
    }
    return PAYMENT_HISTORY
  }, [dbPayments, realtimePayments])
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null)

  // Release payment dialog state
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [releaseMilestone, setReleaseMilestone] = useState<Milestone | null>(null)
  const [releaseConfirmation, setReleaseConfirmation] = useState('')

  // Dispute payment dialog state
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeMilestone, setDisputeMilestone] = useState<Milestone | null>(null)
  const [disputeReason, setDisputeReason] = useState('')

  // Record payment dialog state
  const [showRecordPaymentDialog, setShowRecordPaymentDialog] = useState(false)
  const [newPaymentData, setNewPaymentData] = useState({
    milestone: '',
    amount: '',
    type: 'hold' as 'release' | 'hold' | 'return',
    notes: ''
  })

  // Refund dialog state
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundPayment, setRefundPayment] = useState<PaymentHistory | null>(null)
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: '',
    fullRefund: true
  })

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    format: 'csv' as 'csv' | 'pdf' | 'excel',
    dateRange: 'all' as 'all' | '30days' | '90days' | 'custom',
    includeDetails: true
  })

  // Settings dialog state
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState({
    autoRelease: false,
    releaseDelay: '24',
    emailNotifications: true,
    smsNotifications: false,
    defaultCurrency: 'USD'
  })

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Get quick actions with current state
  const paymentsQuickActions = getPaymentsQuickActions(
    router,
    milestones,
    paymentHistory,
    setShowRecordPaymentDialog
  )

  // Record new payment handler - using Supabase mutation
  const handleRecordPayment = useCallback(async () => {
    if (!newPaymentData.milestone.trim() || !newPaymentData.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(newPaymentData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      // Use Supabase mutation for real database insert
      const result = await paymentMutation.create({
        user_id: userId,
        description: newPaymentData.milestone.trim(),
        amount: amount,
        payment_type: newPaymentData.type,
        notes: newPaymentData.notes.trim(),
        status: 'pending',
        reference_number: `TXN-${Date.now()}`,
        currency: 'USD'
      })

      // Also add to local state for immediate UI update (will be replaced by real-time)
      const newPayment: PaymentHistory = {
        id: paymentHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        milestone: newPaymentData.milestone.trim(),
        amount: amount,
        type: newPaymentData.type,
        status: 'pending',
        transactionId: result?.reference_number || `TXN-${Date.now()}`
      }

      setPaymentHistory([newPayment, ...paymentHistory])
      toast.success("Payment recorded for " + newPaymentData.milestone)

      // Reset form and close dialog
      setNewPaymentData({ milestone: '', amount: '', type: 'hold', notes: '' })
      setShowRecordPaymentDialog(false)
    } catch (error) {
      logger.error('Failed to record payment', { error })
      toast.error('Failed to record payment')
    }
  }, [newPaymentData, paymentHistory, paymentMutation, userId])

  // Handle Process Refund
  const handleProcessRefund = (payment: PaymentHistory) => {
    setRefundPayment(payment)
    setRefundData({
      amount: payment.amount.toString(),
      reason: '',
      fullRefund: true
    })
    setShowRefundDialog(true)
  }

  // Confirm Process Refund
  const confirmProcessRefund = async () => {
    if (!refundPayment) return

    const refundAmount = refundData.fullRefund
      ? refundPayment.amount
      : parseFloat(refundData.amount)

    if (!refundData.fullRefund && (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > refundPayment.amount)) {
      toast.error('Please enter a valid refund amount')
      return
    }

    if (!refundData.reason.trim()) {
      toast.error('Please provide a reason for the refund')
      return
    }

    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: refundPayment.id,
          transactionId: refundPayment.transactionId,
          amount: refundAmount,
          reason: refundData.reason.trim(),
          fullRefund: refundData.fullRefund,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process refund')
      }

      const data = await response.json()

      // Add refund to payment history
      const refundRecord: PaymentHistory = {
        id: paymentHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        milestone: `Refund: ${refundPayment.milestone}`,
        amount: refundAmount,
        type: 'return',
        status: 'completed',
        transactionId: data.transactionId || `REF-${Date.now()}`
      }

      setPaymentHistory([refundRecord, ...paymentHistory])
      toast.success("Refund processed successfully")

      setShowRefundDialog(false)
      setRefundPayment(null)
      setRefundData({ amount: '', reason: '', fullRefund: true })
    } catch (error) {
      logger.error('Failed to process refund', { error, paymentId: refundPayment.id })
      toast.error('Failed to process refund')
    }
  }

  // Handle Export Payments
  const handleExportPayments = async () => {
    try {
      // Filter payments based on date range
      let filteredPayments = [...paymentHistory]
      const now = new Date()

      if (exportOptions.dateRange === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredPayments = filteredPayments.filter(p => new Date(p.date) >= thirtyDaysAgo)
      } else if (exportOptions.dateRange === '90days') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        filteredPayments = filteredPayments.filter(p => new Date(p.date) >= ninetyDaysAgo)
      }

      if (exportOptions.format === 'csv') {
        const headers = exportOptions.includeDetails
          ? ['Date', 'Milestone', 'Amount', 'Type', 'Transaction ID', 'Status']
          : ['Date', 'Milestone', 'Amount', 'Status']

        const csvRows = [
          headers.join(','),
          ...filteredPayments.map(payment => {
            const row = exportOptions.includeDetails
              ? [
                  new Date(payment.date).toLocaleDateString(),
                  `"${payment.milestone}"`,
                  payment.amount,
                  payment.type,
                  payment.transactionId,
                  payment.status
                ]
              : [
                  new Date(payment.date).toLocaleDateString(),
                  `"${payment.milestone}"`,
                  payment.amount,
                  payment.status
                ]
            return row.join(',')
          })
        ]
        const csvContent = csvRows.join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payments-export-${exportOptions.dateRange}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else if (exportOptions.format === 'pdf') {
        // Trigger PDF generation via API
        const response = await fetch('/api/payments/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: 'pdf',
            payments: filteredPayments,
            includeDetails: exportOptions.includeDetails
          })
        })

        if (!response.ok) throw new Error('Failed to generate PDF')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payments-export-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Excel format
        const response = await fetch('/api/payments/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: 'excel',
            payments: filteredPayments,
            includeDetails: exportOptions.includeDetails
          })
        })

        if (!response.ok) throw new Error('Failed to generate Excel file')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payments-export-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      toast.success("Export completed as " + exportOptions.format.toUpperCase())

      setShowExportDialog(false)
    } catch (error) {
      logger.error('Failed to export payments', { error })
      toast.error('Failed to export payments')
    }
  }

  // Handle Save Payment Settings
  const handleSavePaymentSettings = async () => {
    try {
      const response = await fetch('/api/payments/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentSettings,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      toast.success('Settings saved!')

      setShowSettingsDialog(false)
    } catch (error) {
      logger.error('Failed to save payment settings', { error })
      toast.error('Failed to save settings')
    }
  }

  // Handle Refresh Payments - using Supabase hooks
  const handleRefreshPayments = useCallback(async () => {
    try {
      setIsLoading(true)
      // Refresh data from Supabase hooks
      await Promise.all([
        refreshPayments(),
        refreshMethods(),
        refreshAnalytics()
      ])

      // Use the activePayments from hook (real data or mock fallback)
      setPaymentHistory(activePayments)
      setMilestones(MILESTONES) // Milestones can stay as mock for now
      setIsLoading(false)

      toast.success('Payments refreshed')
      announce('Payments data refreshed', 'polite')
    } catch (error) {
      setIsLoading(false)
      logger.error('Failed to refresh payments', { error })
      toast.error('Failed to refresh payments')
    }
  }, [refreshPayments, refreshMethods, refreshAnalytics, activePayments, announce])

  // Handle Search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      toast.info(`Searching for "${query}"`)
    }
  }

  // Handle Filter Change
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter)
    setShowFilterDropdown(false)
    toast.info(`Filter applied: ${filter === 'all' ? 'All payments' : filter}`)
  }

  // Filtered milestones based on search and status
  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = searchQuery.trim() === '' ||
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || milestone.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Filtered payment history based on search
  const filteredPaymentHistory = paymentHistory.filter(payment => {
    const matchesSearch = searchQuery.trim() === '' ||
      payment.milestone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Handle View Transaction Details
  const handleViewTransactionDetails = (payment: PaymentHistory) => {
    toast.info("Transaction: " + payment.transactionId + " of " + formatCurrency(payment.amount) + " on " + new Date(payment.date).toLocaleDateString())
  }

  // Fetch revenue stats from Supabase
  useEffect(() => {
    const fetchRevenueStats = async () => {
      if (!userId) return
      const supabase = createClient()

      try {
        // Get all payments for the user
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, status, payment_type, created_at')
          .eq('user_id', userId)

        if (!payments || payments.length === 0) return

        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        let totalRevenue = 0
        let pendingRevenue = 0
        let releasedRevenue = 0
        let refundedAmount = 0
        let thisMonthRevenue = 0
        let lastMonthRevenue = 0

        payments.forEach((p: any) => {
          const amount = p.amount || 0
          const paymentDate = new Date(p.created_at)

          // Total by status
          if (p.status === 'completed' || p.status === 'released') {
            releasedRevenue += amount
            totalRevenue += amount
          } else if (p.status === 'pending' || p.status === 'in-escrow') {
            pendingRevenue += amount
            totalRevenue += amount
          } else if (p.status === 'refunded' || p.payment_type === 'return') {
            refundedAmount += amount
          }

          // Monthly breakdown
          if (paymentDate >= thisMonth) {
            thisMonthRevenue += amount
          } else if (paymentDate >= lastMonth && paymentDate <= lastMonthEnd) {
            lastMonthRevenue += amount
          }
        })

        const growthPercentage = lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0

        setRevenueStats({
          totalRevenue,
          pendingRevenue,
          releasedRevenue,
          refundedAmount,
          thisMonthRevenue,
          lastMonthRevenue,
          growthPercentage: Math.round(growthPercentage)
        })
      } catch (error) {
        logger.error('Failed to fetch revenue stats', { error })
      }
    }

    fetchRevenueStats()
  }, [userId])

  // Load Payments Data - Synced with Supabase hooks
  useEffect(() => {
    // When Supabase hooks finish loading, update local state
    if (!paymentsLoading && !methodsLoading) {
      // Use real data from Supabase hooks (with mock fallback via activePayments)
      setPaymentHistory(activePayments)
      setMilestones(MILESTONES) // Milestones can stay as mock for now
      setIsLoading(false)
      announce('Payments loaded successfully', 'polite')
    }
  }, [paymentsLoading, methodsLoading, activePayments, announce])

  // Calculate totals - prefer Supabase data, fallback to milestones
  const totals = useMemo(() => {
    // Use revenue stats from Supabase if available
    if (revenueStats.totalRevenue > 0) {
      return {
        inEscrow: revenueStats.pendingRevenue,
        released: revenueStats.releasedRevenue,
        total: revenueStats.totalRevenue,
        refunded: revenueStats.refundedAmount,
        thisMonth: revenueStats.thisMonthRevenue,
        growth: revenueStats.growthPercentage
      }
    }

    // Fallback to milestone-based calculation
    const inEscrow = milestones
      .filter((m) => m.status === 'in-escrow')
      .reduce((sum, m) => sum + m.amount, 0)
    const released = milestones
      .filter((m) => m.status === 'released')
      .reduce((sum, m) => sum + m.amount, 0)
    const total = milestones.reduce((sum, m) => sum + m.amount, 0)

    return {
      inEscrow,
      released,
      total,
      refunded: 0,
      thisMonth: 0,
      growth: 0
    }
  }, [milestones, revenueStats])

  // Handle Release Payment
  const handleReleasePayment = (milestone: Milestone) => {
    setReleaseMilestone(milestone)
    setReleaseConfirmation('')
    setShowReleaseDialog(true)
  }

  // Confirm Release Payment
  const confirmReleasePayment = async () => {
    if (!releaseMilestone) return

    if (releaseConfirmation !== 'CONFIRM') {
      toast.error('Please type CONFIRM to proceed')
      return
    }

    try {
      const response = await fetch('/api/payments/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: releaseMilestone.id,
          milestoneName: releaseMilestone.name,
          amount: releaseMilestone.amount,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to release payment')
      }

      const data = await response.json()

      setMilestones(
        milestones.map((m) =>
          m.id === releaseMilestone.id
            ? {
              ...m,
              status: 'released',
              releaseDate: new Date().toISOString().split('T')[0]
            }
            : m
        )
      )
      toast.success("Payment released and transferred to the freelancer")
      announce('Payment released successfully', 'polite')
      setShowReleaseDialog(false)
      setReleaseMilestone(null)
      setReleaseConfirmation('')
    } catch (error) {
      logger.error('Failed to release payment', { error, milestoneId: releaseMilestone.id })
      toast.error('Failed to release payment')
    }
  }

  // Handle Dispute Payment
  const handleDisputePayment = (milestone: Milestone) => {
    setDisputeMilestone(milestone)
    setDisputeReason('')
    setShowDisputeDialog(true)
  }

  // Confirm Dispute Payment
  const confirmDisputePayment = async () => {
    if (!disputeMilestone) return

    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute')
      return
    }

    try {
      const response = await fetch('/api/payments/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: disputeMilestone.id,
          milestoneName: disputeMilestone.name,
          amount: disputeMilestone.amount,
          reason: disputeReason.trim(),
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit dispute')
      }

      setMilestones(
        milestones.map((m) =>
          m.id === disputeMilestone.id ? { ...m, status: 'disputed' } : m
        )
      )
      toast.success('Dispute submitted')
      announce('Dispute submitted successfully', 'polite')
      setShowDisputeDialog(false)
      setDisputeMilestone(null)
      setDisputeReason('')
    } catch (error) {
      logger.error('Failed to submit dispute', { error, milestoneId: disputeMilestone.id })
      toast.error('Failed to submit dispute')
    }
  }

  // Handle Download Receipt
  const handleDownloadReceipt = async (payment: PaymentHistory) => {
    try {
      const response = await fetch(`/api/payments/${payment.id}/receipt`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to generate receipt')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Receipt-${payment.transactionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Receipt downloaded and saved")
    } catch (error) {
      logger.error('Failed to download receipt', { error, paymentId: payment.id })
      toast.error('Failed to download receipt')
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={paymentsAIInsights} />
          <PredictiveAnalytics predictions={paymentsPredictions} />
          <CollaborationIndicator collaborators={paymentsCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={paymentsQuickActions} />
          <ActivityFeed activities={paymentsActivities} />
        </div>
<CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Secure Payments & Escrow</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage milestone payments and track release security
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPayments}
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              size="sm"
              onClick={() => setShowRecordPaymentDialog(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
            <InsightsToggleButton
              isOpen={insightsPanel.isOpen}
              onToggle={insightsPanel.toggle}
            />
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search payments, milestones, transactions..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="gap-2 min-w-[140px] justify-between"
            >
              <Filter className="h-4 w-4" />
              {statusFilter === 'all' ? 'All Status' : statusFilter.replace(/-/g, ' ')}
              <ChevronDown className="h-4 w-4" />
            </Button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border z-50">
                <div className="py-1">
                  {['all', 'in-escrow', 'released', 'completed', 'disputed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        statusFilter === filter ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                      }`}
                    >
                      {filter === 'all' ? 'All Status' : filter.replace(/-/g, ' ').charAt(0).toUpperCase() + filter.replace(/-/g, ' ').slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Total Escrow</p>
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(totals.inEscrow)}
              </p>
              <p className="text-xs text-gray-600">
                {milestones.filter((m) => m.status === 'in-escrow').length} milestone(s)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Released</p>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(totals.released)}
              </p>
              <p className="text-xs text-gray-600">
                {milestones.filter((m) => m.status === 'released').length} milestone(s)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(totals.total)}
              </p>
              <p className="text-xs text-gray-600">
                {milestones.length} milestone(s)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Shield className="h-6 w-6" />
                Escrow Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">100% Money-Back Guarantee</p>
                    <p className="text-sm text-gray-600">
                      If you're not satisfied, get your money back
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Milestone-Based Releases</p>
                    <p className="text-sm text-gray-600">
                      Payments released only when you approve
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Dispute Resolution</p>
                    <p className="text-sm text-gray-600">
                      Expert mediation if disagreements arise
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestone Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Milestone Payments
            </h2>
            <span className="text-sm text-gray-500">
              {filteredMilestones.length} of {milestones.length} milestone(s)
            </span>
          </div>

          {filteredMilestones.length === 0 ? (
            <NoDataEmptyState
              title="No milestones found"
              description={searchQuery || statusFilter !== 'all'
                ? "No milestones match your search or filter criteria. Try adjusting your filters."
                : "Milestone payments will appear here as your projects progress."}
            />
          ) : (
            <div className="space-y-3">
              {filteredMilestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-shadow">
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() =>
                        setExpandedMilestone(
                          expandedMilestone === milestone.id ? null : milestone.id
                        )
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {milestone.name}
                            </h3>
                            <Badge className={getStatusColor(milestone.status)}>
                              {milestone.status.replace(/-/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {milestone.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Project</p>
                              <p className="font-medium dark:text-gray-200">{milestone.project}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Amount</p>
                              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                {formatCurrency(milestone.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs">Due Date</p>
                              <p className="font-medium dark:text-gray-200">
                                {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedMilestone(
                              expandedMilestone === milestone.id ? null : milestone.id
                            )
                          }}
                        >
                          {expandedMilestone === milestone.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded Content */}
                      {expandedMilestone === milestone.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t space-y-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              Release Condition
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                              {milestone.releaseCondition}
                            </p>
                          </div>

                          {milestone.approvalNotes && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">
                                Approval Notes
                              </p>
                              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                {milestone.approvalNotes}
                              </p>
                            </div>
                          )}

                          {milestone.completionDate && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">
                                Completed
                              </p>
                              <p className="text-sm text-gray-700">
                                {new Date(milestone.completionDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4">
                            {milestone.status === 'in-escrow' && (
                              <>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                                  onClick={() => handleReleasePayment(milestone)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve & Release
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleDisputePayment(milestone)}
                                  className="gap-2 text-red-600 hover:text-red-700"
                                >
                                  <Flag className="h-4 w-4" />
                                  Dispute
                                </Button>
                              </>
                            )}
                            {milestone.status === 'completed' && (
                              <Button
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                                onClick={() => handleReleasePayment(milestone)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Release Payment
                              </Button>
                            )}
                            {milestone.status === 'released' && (
                              <Button
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Payment Released
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Payment History
            </h2>
            <span className="text-sm text-gray-500">
              {filteredPaymentHistory.length} of {paymentHistory.length} transaction(s)
            </span>
          </div>

          {filteredPaymentHistory.length === 0 ? (
            <NoDataEmptyState
              title="No payment history"
              description={searchQuery
                ? "No transactions match your search. Try a different query."
                : "Payment transactions will appear here."}
            />
          ) : (
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-slate-800">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Milestone
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPaymentHistory.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                            <button
                              onClick={() => handleViewTransactionDetails(payment)}
                              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left"
                            >
                              {payment.milestone}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold dark:text-gray-100">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge
                              variant="outline"
                              className={
                                payment.type === 'release'
                                  ? 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                                  : payment.type === 'hold'
                                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
                                    : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                              }
                            >
                              {payment.type.charAt(0).toUpperCase() +
                                payment.type.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(payment.transactionId)
                                toast.success('Transaction ID copied')
                              }}
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                              title="Click to copy"
                            >
                              {payment.transactionId}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Badge
                              className={
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadReceipt(payment)}
                                className="gap-1"
                                title="Download receipt"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {payment.type !== 'return' && payment.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleProcessRefund(payment)}
                                  className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Process refund"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewTransactionDetails(payment)}
                                className="gap-1"
                                title="View details"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Collapsible Insights Panel */}
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel title="Payment Insights" defaultOpen={true} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AIInsightsPanel insights={paymentsAIInsights} />
              <PredictiveAnalytics predictions={paymentsPredictions} />
              <CollaborationIndicator collaborators={paymentsCollaborators} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <QuickActionsToolbar actions={paymentsQuickActions} />
              <ActivityFeed activities={paymentsActivities} />
            </div>
          </CollapsibleInsightsPanel>
        )}

        {/* Release Payment Dialog */}
        <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Release Payment
              </DialogTitle>
              <DialogDescription>
                {releaseMilestone && (
                  <>Release {formatCurrency(releaseMilestone.amount)} for "{releaseMilestone.name}"</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Warning:</strong> This action cannot be undone. Once released, the payment will be transferred to the freelancer immediately.
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseConfirmation">Type CONFIRM to proceed</Label>
                <Input
                  id="releaseConfirmation"
                  value={releaseConfirmation}
                  onChange={(e) => setReleaseConfirmation(e.target.value.toUpperCase())}
                  placeholder="Type CONFIRM"
                  className="font-mono"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmReleasePayment}
                disabled={releaseConfirmation !== 'CONFIRM'}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Release Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispute Payment Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Dispute Payment
              </DialogTitle>
              <DialogDescription>
                {disputeMilestone && (
                  <>Dispute payment for "{disputeMilestone.name}" ({formatCurrency(disputeMilestone.amount)})</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="disputeReason">Reason for Dispute</Label>
                <Textarea
                  id="disputeReason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Please explain why the deliverables do not meet requirements..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmDisputePayment}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Submit Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={showRecordPaymentDialog} onOpenChange={setShowRecordPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                Record New Payment
              </DialogTitle>
              <DialogDescription>
                Create a new payment record for a milestone or project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMilestone">Milestone / Description *</Label>
                <Input
                  id="paymentMilestone"
                  value={newPaymentData.milestone}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, milestone: e.target.value })}
                  placeholder="e.g., Website Design Phase 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPaymentData.amount}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <select
                  id="paymentType"
                  value={newPaymentData.type}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, type: e.target.value as 'release' | 'hold' | 'return' })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hold">Hold (Escrow)</option>
                  <option value="release">Release</option>
                  <option value="return">Return</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Notes (Optional)</Label>
                <Textarea
                  id="paymentNotes"
                  value={newPaymentData.notes}
                  onChange={(e) => setNewPaymentData({ ...newPaymentData, notes: e.target.value })}
                  placeholder="Additional notes about this payment..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => {
                setNewPaymentData({ milestone: '', amount: '', type: 'hold', notes: '' })
                setShowRecordPaymentDialog(false)
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleRecordPayment}
                disabled={!newPaymentData.milestone.trim() || !newPaymentData.amount}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Record Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-500" />
                Process Refund
              </DialogTitle>
              <DialogDescription>
                {refundPayment && (
                  <>Process a refund for "{refundPayment.milestone}" ({formatCurrency(refundPayment.amount)})</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-300">
                <strong>Warning:</strong> This action will initiate a refund process. The refund may take 3-5 business days to process.
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={refundData.fullRefund}
                    onChange={(e) => setRefundData({ ...refundData, fullRefund: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Full refund ({refundPayment && formatCurrency(refundPayment.amount)})
                </Label>
              </div>
              {!refundData.fullRefund && (
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Refund Amount *</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    min="0"
                    max={refundPayment?.amount || 0}
                    step="0.01"
                    value={refundData.amount}
                    onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                  {refundPayment && (
                    <p className="text-xs text-gray-500">
                      Maximum: {formatCurrency(refundPayment.amount)}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="refundReason">Reason for Refund *</Label>
                <Textarea
                  id="refundReason"
                  value={refundData.reason}
                  onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                  placeholder="Please provide a reason for this refund..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefundDialog(false)
                  setRefundPayment(null)
                  setRefundData({ amount: '', reason: '', fullRefund: true })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmProcessRefund}
                disabled={!refundData.reason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-500" />
                Export Payments
              </DialogTitle>
              <DialogDescription>
                Export your payment data in your preferred format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <select
                  id="exportFormat"
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as 'csv' | 'pdf' | 'excel' })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV (Spreadsheet)</option>
                  <option value="pdf">PDF (Document)</option>
                  <option value="excel">Excel (.xlsx)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exportDateRange">Date Range</Label>
                <select
                  id="exportDateRange"
                  value={exportOptions.dateRange}
                  onChange={(e) => setExportOptions({ ...exportOptions, dateRange: e.target.value as 'all' | '30days' | '90days' | 'custom' })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDetails}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeDetails: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Include transaction details (IDs, types)
                </Label>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                <strong>Preview:</strong> {paymentHistory.length} payment record(s) will be exported.
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportPayments}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Payment Settings
              </DialogTitle>
              <DialogDescription>
                Configure your payment preferences and notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Auto Release Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Release Settings</h4>
                <div className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span className="text-sm">Auto-release after approval</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.autoRelease}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, autoRelease: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                  </Label>
                  {paymentSettings.autoRelease && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="releaseDelay">Release delay (hours)</Label>
                      <select
                        id="releaseDelay"
                        value={paymentSettings.releaseDelay}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, releaseDelay: e.target.value })}
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">Immediately</option>
                        <option value="24">24 hours</option>
                        <option value="48">48 hours</option>
                        <option value="72">72 hours</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h4>
                <div className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span className="text-sm">Email notifications</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.emailNotifications}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, emailNotifications: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                  </Label>
                  <Label className="flex items-center justify-between">
                    <span className="text-sm">SMS notifications</span>
                    <input
                      type="checkbox"
                      checked={paymentSettings.smsNotifications}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, smsNotifications: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                  </Label>
                </div>
              </div>

              {/* Currency Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Currency</h4>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <select
                    id="defaultCurrency"
                    value={paymentSettings.defaultCurrency}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultCurrency: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePaymentSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Settings className="h-4 w-4" />
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
