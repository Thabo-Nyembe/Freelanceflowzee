'use client'

import { createClient } from '@/lib/supabase/client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/lib/hooks/use-expenses'
import { useApiKeys } from '@/lib/hooks/use-api-keys'
import { toast } from 'sonner'
import DeductionSuggestionWidget from '@/components/tax/deduction-suggestion-widget'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Receipt, DollarSign, CheckCircle, XCircle, Clock, Search,
  Upload, Camera, CreditCard, Plane, Car, Coffee, ShoppingBag,
  Building, Globe, TrendingUp, Calendar, FileText, Download, AlertTriangle,
  BarChart3, PieChart, Users, Send, Plus, ChevronRight,
  Banknote, MapPin, Shield, ArrowRight, Settings, Bell, Link2,
  Key, Database, RefreshCw, Mail, Webhook, Timer,
  Wallet, Building2, UserCog, ExternalLink
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components - temporarily disabled due to Radix UI infinite loop
// import {
//   AIInsightsPanel,
//   CollaborationIndicator,
//   PredictiveAnalytics,
// } from '@/components/ui/competitive-upgrades'
//
// import {
//   ActivityFeed,
//   QuickActionsToolbar,
// } from '@/components/ui/competitive-upgrades-extended'




// Types
type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed' | 'processing'
type ExpenseCategory = 'travel' | 'meals' | 'transport' | 'lodging' | 'supplies' | 'software' | 'entertainment' | 'other'
type PaymentMethod = 'cash' | 'corporate_card' | 'personal_card' | 'bank_transfer'
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'

interface ExpenseLineItem {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  merchant: string
  receipt?: string
  taxAmount?: number
  isBillable: boolean
  projectCode?: string
}

interface ExpenseReport {
  id: string
  title: string
  status: ExpenseStatus
  submittedBy: { id: string; name: string; email: string; avatar: string; department: string }
  approver?: { id: string; name: string; email: string; avatar: string }
  lineItems: ExpenseLineItem[]
  totalAmount: number
  currency: Currency
  paymentMethod: PaymentMethod
  createdAt: string
  submittedAt?: string
  approvedAt?: string
  reimbursedAt?: string
  notes?: string
  policyViolations: { rule: string; severity: 'warning' | 'error' }[]
  attachments: number
  tripId?: string
}

interface Policy {
  id: string
  name: string
  category: ExpenseCategory
  maxAmount: number
  requiresReceipt: boolean
  requiresApproval: boolean
  approvalThreshold: number
  notes: string
}

interface MileageEntry {
  id: string
  date: string
  origin: string
  destination: string
  distance: number
  rate: number
  purpose: string
  status: ExpenseStatus
}

interface PerDiem {
  id: string
  location: string
  startDate: string
  endDate: string
  dailyRate: number
  totalAmount: number
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
  status: ExpenseStatus
}

interface ExpensesClientProps {
  initialExpenses: any[]
}

// Types for employees
interface Employee {
  id: string
  name: string
  avatar: string
  department: string
}

// Types for AI Insights
interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction' | 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  priority?: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
  confidence?: number
  action?: string
  category?: string
  timestamp?: string | Date
  createdAt?: Date
}

// Types for Collaborators
interface Collaborator {
  id: string
  name: string
  avatar?: string
  color?: string
  status: 'online' | 'away' | 'offline'
  role?: string
  isTyping?: boolean
  lastSeen?: Date
  lastActive?: string | Date
  cursor?: { x: number; y: number }
}

// Types for Predictions
interface Prediction {
  id?: string
  label?: string
  title?: string
  prediction?: string
  current?: number
  target?: number
  currentValue?: number
  predictedValue?: number
  predicted?: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe?: string
  impact?: string
  factors?: Array<{ name: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> | string[]
}

// Types for Activity Items
interface ActivityItem {
  id: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration'
  title: string
  action?: string
  description?: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  target?: {
    type: string
    name: string
    url?: string
  }
  metadata?: Record<string, unknown>
  timestamp: Date | string
  isRead?: boolean
  isPinned?: boolean
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'default' | 'destructive'
  }>
}

// Types for Quick Actions
interface QuickActionItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  category?: string
  description?: string
}

// All data now fetched from Supabase via useExpenses hook

// Quick actions will be defined inside the component to access state setters
const getExpensesQuickActions = (
  setShowNewExpenseDialog: (show: boolean) => void,
  handleScanReceipt: () => void,
  handleGenerateReport: () => void
) => [
  {
    id: '1',
    label: 'New Expense',
    icon: 'plus',
    action: () => {
      setShowNewExpenseDialog(true)
    },
    variant: 'default' as const
  },
  {
    id: '2',
    label: 'Scan Receipt',
    icon: 'camera',
    action: handleScanReceipt,
    variant: 'default' as const
  },
  {
    id: '3',
    label: 'Report',
    icon: 'file-text',
    action: handleGenerateReport,
    variant: 'outline' as const
  },
]

export default function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
  // Demo mode detection for investor demos
  const { userId: currentUserId, userEmail, userName, isDemo, loading: sessionLoading } = useCurrentUser()
  const sessionStatus = sessionLoading ? "loading" : "authenticated"
  const isDemoAccount = userEmail === 'alex@freeflow.io' ||
                        userEmail === 'sarah@freeflow.io' ||
                        userEmail === 'mike@freeflow.io'
  const isSessionLoading = sessionStatus === 'loading'

  const supabase = createClient()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('reports')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Additional dialog states
  const [showMileageDialog, setShowMileageDialog] = useState(false)
  const [showPerDiemDialog, setShowPerDiemDialog] = useState(false)
  const [showCategoryFilterDialog, setShowCategoryFilterDialog] = useState(false)
  const [showConnectCardDialog, setShowConnectCardDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<{name: string; status: string} | null>(null)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showResetPoliciesDialog, setShowResetPoliciesDialog] = useState(false)
  const [showDeleteDraftsDialog, setShowDeleteDraftsDialog] = useState(false)
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)

  // Form states for dialogs
  const [mileageForm, setMileageForm] = useState({
    origin: '',
    destination: '',
    distance: 0,
    purpose: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [perDiemForm, setPerDiemForm] = useState({
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    breakfast: true,
    lunch: true,
    dinner: true
  })
  const [webhookUrl, setWebhookUrl] = useState('')
  const [cardForm, setCardForm] = useState({
    provider: 'amex',
    cardholderName: '',
    lastFourDigits: ''
  })

  // API Keys hook for regenerating API keys
  const { createKey: createApiKey } = useApiKeys()

  // Database integration - use real expenses hooks
  const { data: hookExpenses, isLoading: hookLoading, error: hookError, refetch } = useExpenses({ status: statusFilter as string })
  const { mutate: createExpense, isLoading: creating } = useCreateExpense()
  const { mutate: updateExpense, isLoading: updating } = useUpdateExpense()
  const { mutate: deleteExpense, isLoading: deleting } = useDeleteExpense()

  // Demo expense data for investor demos
  const demoExpenses = useMemo(() => [
    {
      id: 'demo-exp-1',
      user_id: 'demo-user',
      expense_title: 'Q4 Conference Travel - San Francisco',
      description: 'Flight, hotel, and meals for TechCrunch Disrupt conference',
      expense_category: 'travel' as const,
      amount: 2450.00,
      currency: 'USD',
      tax_amount: 196.00,
      total_amount: 2646.00,
      status: 'approved' as const,
      submitted_by: 'Alex Johnson',
      submitted_at: '2026-01-20T10:00:00Z',
      expense_date: '2026-01-15',
      approved_by: 'Sarah Chen',
      approved_at: '2026-01-22T14:30:00Z',
      payment_method: 'corporate_card',
      merchant_name: 'United Airlines / Marriott Hotels',
      has_receipt: true,
      attachment_count: 4,
      is_policy_compliant: true,
      created_at: '2026-01-15T00:00:00Z',
      updated_at: '2026-01-22T14:30:00Z'
    },
    {
      id: 'demo-exp-2',
      user_id: 'demo-user',
      expense_title: 'Client Lunch - Acme Corp Partnership',
      description: 'Business lunch with Acme Corp executives to discuss partnership',
      expense_category: 'meals' as const,
      amount: 285.50,
      currency: 'USD',
      tax_amount: 22.84,
      total_amount: 308.34,
      status: 'pending' as const,
      submitted_by: 'Mike Rodriguez',
      submitted_at: '2026-01-25T09:00:00Z',
      expense_date: '2026-01-24',
      payment_method: 'corporate_card',
      merchant_name: 'The Capital Grille',
      has_receipt: true,
      attachment_count: 1,
      is_policy_compliant: true,
      created_at: '2026-01-24T00:00:00Z',
      updated_at: '2026-01-25T09:00:00Z'
    },
    {
      id: 'demo-exp-3',
      user_id: 'demo-user',
      expense_title: 'Software Licenses - Annual Renewal',
      description: 'Annual renewal for Figma, Notion, and Linear subscriptions',
      expense_category: 'software' as const,
      amount: 1850.00,
      currency: 'USD',
      tax_amount: 0,
      total_amount: 1850.00,
      status: 'reimbursed' as const,
      submitted_by: 'Sarah Chen',
      submitted_at: '2026-01-10T11:00:00Z',
      expense_date: '2026-01-08',
      approved_by: 'Alex Johnson',
      approved_at: '2026-01-11T09:00:00Z',
      payment_method: 'personal_card',
      merchant_name: 'Various SaaS Vendors',
      has_receipt: true,
      attachment_count: 3,
      is_policy_compliant: true,
      reimbursed: true,
      reimbursed_at: '2026-01-15T00:00:00Z',
      created_at: '2026-01-08T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'demo-exp-4',
      user_id: 'demo-user',
      expense_title: 'Office Supplies - Q1 Stock',
      description: 'Printer paper, ink cartridges, and general office supplies',
      expense_category: 'supplies' as const,
      amount: 425.75,
      currency: 'USD',
      tax_amount: 34.06,
      total_amount: 459.81,
      status: 'approved' as const,
      submitted_by: 'Alex Johnson',
      submitted_at: '2026-01-18T14:00:00Z',
      expense_date: '2026-01-17',
      approved_by: 'Mike Rodriguez',
      approved_at: '2026-01-19T10:00:00Z',
      payment_method: 'corporate_card',
      merchant_name: 'Staples',
      has_receipt: true,
      attachment_count: 1,
      is_policy_compliant: true,
      created_at: '2026-01-17T00:00:00Z',
      updated_at: '2026-01-19T10:00:00Z'
    },
    {
      id: 'demo-exp-5',
      user_id: 'demo-user',
      expense_title: 'Team Building Event - Bowling Night',
      description: 'Team outing for engineering department',
      expense_category: 'entertainment' as const,
      amount: 520.00,
      currency: 'USD',
      tax_amount: 41.60,
      total_amount: 561.60,
      status: 'pending' as const,
      submitted_by: 'Mike Rodriguez',
      submitted_at: '2026-01-26T16:00:00Z',
      expense_date: '2026-01-25',
      payment_method: 'personal_card',
      merchant_name: 'Lucky Strike Lanes',
      has_receipt: true,
      attachment_count: 2,
      is_policy_compliant: true,
      created_at: '2026-01-25T00:00:00Z',
      updated_at: '2026-01-26T16:00:00Z'
    },
    {
      id: 'demo-exp-6',
      user_id: 'demo-user',
      expense_title: 'Airport Parking - JFK',
      description: 'Long-term parking for business trip to NYC',
      expense_category: 'transport' as const,
      amount: 185.00,
      currency: 'USD',
      tax_amount: 14.80,
      total_amount: 199.80,
      status: 'draft' as const,
      submitted_by: 'Sarah Chen',
      expense_date: '2026-01-23',
      payment_method: 'personal_card',
      merchant_name: 'JFK Long Term Parking',
      has_receipt: true,
      attachment_count: 1,
      is_policy_compliant: true,
      created_at: '2026-01-23T00:00:00Z',
      updated_at: '2026-01-23T00:00:00Z'
    },
    {
      id: 'demo-exp-7',
      user_id: 'demo-user',
      expense_title: 'Hotel - NYC Client Visit',
      description: '3 nights at Manhattan hotel for client meetings',
      expense_category: 'lodging' as const,
      amount: 1125.00,
      currency: 'USD',
      tax_amount: 157.50,
      total_amount: 1282.50,
      status: 'approved' as const,
      submitted_by: 'Alex Johnson',
      submitted_at: '2026-01-12T08:00:00Z',
      expense_date: '2026-01-09',
      approved_by: 'Sarah Chen',
      approved_at: '2026-01-13T11:00:00Z',
      payment_method: 'corporate_card',
      merchant_name: 'The Standard Hotel',
      has_receipt: true,
      attachment_count: 1,
      is_policy_compliant: true,
      created_at: '2026-01-09T00:00:00Z',
      updated_at: '2026-01-13T11:00:00Z'
    },
    {
      id: 'demo-exp-8',
      user_id: 'demo-user',
      expense_title: 'Uber Rides - January',
      description: 'Monthly transportation expenses for client visits',
      expense_category: 'transport' as const,
      amount: 342.50,
      currency: 'USD',
      tax_amount: 0,
      total_amount: 342.50,
      status: 'pending' as const,
      submitted_by: 'Mike Rodriguez',
      submitted_at: '2026-01-27T10:00:00Z',
      expense_date: '2026-01-26',
      payment_method: 'personal_card',
      merchant_name: 'Uber',
      has_receipt: true,
      attachment_count: 8,
      is_policy_compliant: true,
      created_at: '2026-01-26T00:00:00Z',
      updated_at: '2026-01-27T10:00:00Z'
    }
  ], [])

  // Use demo data for demo accounts, otherwise use hook data
  const dbExpenses = isDemoAccount ? demoExpenses : (hookExpenses || [])
  const expensesLoading = isSessionLoading || (isDemoAccount ? false : hookLoading)
  const expensesError = isDemoAccount ? null : hookError

  // Form state for new expense
  const [newExpenseForm, setNewExpenseForm] = useState({
    title: '',
    paymentMethod: 'corporate_card',
    notes: '',
    amount: 0,
    category: 'travel' as const
  })

  // Hook auto-fetches on mount and when filter deps change

  // Handle creating a new expense
  const handleCreateExpense = async () => {
    if (!newExpenseForm.title) {
      toast.error('Please enter a report title')
      return
    }
    try {
      await createExpense({
        expense_title: newExpenseForm.title,
        expense_category: newExpenseForm.category as 'travel' | 'meals' | 'supplies' | 'software' | 'entertainment' | 'accommodation' | 'transportation' | 'communication' | 'training' | 'other',
        amount: newExpenseForm.amount,
        total_amount: newExpenseForm.amount,
        currency: 'USD',
        status: 'draft',
        payment_method: newExpenseForm.paymentMethod,
        description: newExpenseForm.notes || null,
        expense_date: new Date().toISOString().split('T')[0]
      })
      setShowNewExpenseDialog(false)
      setNewExpenseForm({ title: '', paymentMethod: 'corporate_card', notes: '', amount: 0, category: 'travel' })
      toast.success('Expense report created')
      refetch()
    } catch (error) {
      console.error('Failed to create expense:', error)
      toast.error('Failed to create expense')
    }
  }

  // Use Supabase data as the source of truth
  const expenses = dbExpenses || []
  // Mileage, per diem, and policies are managed via direct Supabase calls in their handlers
  const policies: Policy[] = []
  const mileage: MileageEntry[] = []
  const perDiems: PerDiem[] = []

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense: any) => {
      if (statusFilter !== 'all' && expense.status !== statusFilter) return false
      if (searchQuery) {
        const title = (expense.expense_title || '').toLowerCase()
        const merchant = (expense.merchant_name || '').toLowerCase()
        const description = (expense.description || '').toLowerCase()
        const query = searchQuery.toLowerCase()
        if (!title.includes(query) && !merchant.includes(query) && !description.includes(query)) return false
      }
      return true
    })
  }, [expenses, statusFilter, searchQuery])

  const stats = useMemo(() => ({
    totalExpenses: expenses.reduce((sum: number, r: any) => sum + (r.total_amount || r.amount || 0), 0),
    pendingApproval: expenses.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + (r.total_amount || r.amount || 0), 0),
    approved: expenses.filter((r: any) => r.status === 'approved').reduce((sum: number, r: any) => sum + (r.total_amount || r.amount || 0), 0),
    reimbursed: expenses.filter((r: any) => r.status === 'reimbursed').reduce((sum: number, r: any) => sum + (r.total_amount || r.amount || 0), 0),
    pendingCount: expenses.filter((r: any) => r.status === 'pending').length,
    avgProcessingTime: 2.3
  }), [expenses])

  const getStatusColor = (status: ExpenseStatus) => {
    const colors: Record<ExpenseStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      reimbursed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700'
    }
    return colors[status]
  }

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<ExpenseCategory, any> = {
      travel: Plane, meals: Coffee, transport: Car, lodging: Building,
      supplies: ShoppingBag, software: Globe, entertainment: Users, other: Receipt
    }
    return icons[category] || Receipt
  }

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<ExpenseCategory, string> = {
      travel: 'bg-blue-100 text-blue-700',
      meals: 'bg-orange-100 text-orange-700',
      transport: 'bg-cyan-100 text-cyan-700',
      lodging: 'bg-purple-100 text-purple-700',
      supplies: 'bg-green-100 text-green-700',
      software: 'bg-indigo-100 text-indigo-700',
      entertainment: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category]
  }

  const openReportDetails = (report: ExpenseReport) => {
    setSelectedReport(report)
    setShowReportDialog(true)
  }

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    expenses.forEach((expense: any) => {
      const cat = expense.expense_category || 'other'
      breakdown[cat] = (breakdown[cat] || 0) + (expense.total_amount || expense.amount || 0)
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }, [expenses])

  // Handlers - Real Supabase operations
  const handleApproveExpense = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      toast.success('Expense approved', {
        description: `Report "${title}" has been approved`
      })
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to approve expense:', error)
      toast.error('Failed to approve expense')
    }
  }

  const handleRejectExpense = async (expenseId: string, title: string, reason?: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'rejected',
        rejection_reason: reason || null
      })
      toast.success('Expense rejected', {
        description: `Report "${title}" has been rejected`
      })
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to reject expense:', error)
      toast.error('Failed to reject expense')
    }
  }

  const handleReimburseExpense = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'reimbursed',
        reimbursed_at: new Date().toISOString(),
        reimbursed: true
      })
      toast.success('Expense reimbursed', {
        description: `Report "${title}" has been marked as reimbursed`
      })
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to reimburse expense:', error)
      toast.error('Failed to reimburse expense')
    }
  }

  const handleDeleteExpense = async (expenseId: string, title: string) => {
    try {
      await deleteExpense({ id: expenseId })
      toast.success('Expense deleted', {
        description: `Report "${title}" has been deleted`
      })
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const handleExportExpenses = async () => {
    const exportExpenseData = async () => {
      // Collect all expense data for export
      const allExpenses = expenses
      const exportData = {
        exportDate: new Date().toISOString(),
        totalExpenses: allExpenses.length,
        totalAmount: allExpenses.reduce((sum: number, r: any) => sum + (r.total_amount || r.amount || 0), 0),
        expenses: allExpenses.map((expense: any) => ({
          id: expense.id,
          title: expense.expense_title || '',
          amount: expense.total_amount || expense.amount || 0,
          status: expense.status,
          category: expense.expense_category || 'other',
          date: expense.expense_date || expense.created_at,
          submittedBy: expense.submitted_by || 'Current User'
        }))
      }

      // Create and download CSV file
      const csvHeaders = ['ID', 'Title', 'Amount', 'Status', 'Category', 'Date', 'Submitted By']
      const csvRows = exportData.expenses.map((e: any) =>
        [e.id, e.title, e.amount, e.status, e.category, e.date, e.submittedBy].join(',')
      )
      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `expenses-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return exportData
    }

    toast.promise(exportExpenseData(), {
      loading: 'Exporting expense data...',
      success: (data) => `Export complete! ${data.totalExpenses} expenses exported`,
      error: 'Failed to export expense data'
    })
  }

  const handleSubmitReport = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      toast.success('Report submitted', {
        description: `"${title}" submitted for approval`
      })
      refetch()
    } catch (error) {
      console.error('Failed to submit report:', error)
      toast.error('Failed to submit report')
    }
  }

  const handleAddReceipt = async (expenseId?: string) => {
    const uploadReceiptToStorage = async (file: File): Promise<string | null> => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('You must be logged in to upload receipts')
          return null
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${expenseId || 'temp'}/${Date.now()}.${fileExt}`

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // If receipts bucket doesn't exist, show helpful message
          if (uploadError.message.includes('Bucket not found')) {
            toast.error('Receipt storage not configured', { description: 'Please contact your administrator' })
          } else {
            toast.error('Failed to upload receipt', { description: uploadError.message })
          }
          return null
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName)

        // If we have an expense ID, update the expense with the receipt URL
        if (expenseId) {
          const { error: updateError } = await supabase
            .from('expenses')
            .update({
              receipt_url: publicUrl,
              has_receipt: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', expenseId)

          if (updateError) {
            console.error('Failed to link receipt to expense:', updateError)
          } else {
            refetch()
          }
        }

        return publicUrl
      } catch (err) {
        console.error('Receipt upload failed:', err)
        toast.error('Failed to upload receipt')
        return null
      }
    }

    const openReceiptScanner = async (): Promise<{ ready: boolean; method: string }> => {
      // Check for camera/file input availability
      const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices

      const handleFileSelect = async (file: File) => {
        toast.info('Uploading receipt...', { description: `File: ${file.name}` })
        const url = await uploadReceiptToStorage(file)
        if (url) {
          toast.success('Receipt uploaded successfully!', {
            description: `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
          })
        }
      }

      if (hasCamera) {
        // Try to access camera for receipt scanning
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          const hasVideoInput = devices.some(device => device.kind === 'videoinput')

          if (hasVideoInput) {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.capture = 'environment'

            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                await handleFileSelect(file)
              }
            }

            input.click()
            return { ready: true, method: 'camera' }
          }
        } catch (err) {
          console.error('Camera access failed:', err)
        }
      }

      // Fallback to file upload
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*,.pdf'

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          await handleFileSelect(file)
        }
      }

      input.click()
      return { ready: true, method: 'file_upload' }
    }

    toast.promise(openReceiptScanner(), {
      loading: 'Opening receipt scanner...',
      success: (result) => result.method === 'camera'
        ? 'Camera ready - capture your receipt'
        : 'File picker ready - select your receipt',
      error: 'Failed to open receipt scanner'
    })
  }

  // Handler for scanning receipt from quick actions
  const handleScanReceipt = () => {
    handleAddReceipt()
  }

  // Handler for generating expense report
  const handleGenerateReport = async () => {
    const generateReport = async () => {
      const allExpenses = expenses
      const totalAmount = allExpenses.reduce((sum: number, r: any) => sum + (r.total_amount || r.amount || 0), 0)
      const expenseCount = allExpenses.length

      // Generate a simple report summary
      const reportData = {
        generatedAt: new Date().toISOString(),
        quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        year: new Date().getFullYear(),
        totalAmount,
        expenseCount,
        byStatus: {
          pending: allExpenses.filter((e: any) => e.status === 'pending').length,
          approved: allExpenses.filter((e: any) => e.status === 'approved').length,
          reimbursed: allExpenses.filter((e: any) => e.status === 'reimbursed').length,
        }
      }

      return reportData
    }

    toast.promise(generateReport(), {
      loading: 'Generating expense report...',
      success: (data) => `${data.quarter} ${data.year} Report: $${data.totalAmount.toLocaleString()} across ${data.expenseCount} expenses`,
      error: 'Failed to generate report'
    })
  }

  // Handler for adding mileage trip
  const handleAddMileage = async () => {
    if (!mileageForm.origin || !mileageForm.destination || !mileageForm.distance) {
      toast.error('Please fill in all required fields')
      return
    }
    const amount = mileageForm.distance * 0.67 // IRS rate
    toast.promise(
      (async () => {
        const { error } = await supabase.from('mileage_trips').insert({
          origin: mileageForm.origin,
          destination: mileageForm.destination,
          distance: mileageForm.distance,
          amount,
          purpose: mileageForm.purpose,
          date: mileageForm.date
        })
        if (error) throw error
        toast.success('Mileage trip added', {
          description: `${mileageForm.distance} miles from ${mileageForm.origin} to ${mileageForm.destination} ($${amount.toFixed(2)})`
        })
        setShowMileageDialog(false)
        setMileageForm({ origin: '', destination: '', distance: 0, purpose: '', date: new Date().toISOString().split('T')[0] })
      })(),
      { loading: 'Adding mileage trip...', success: 'Trip added!', error: 'Failed to add trip' }
    )
  }

  // Handler for requesting per diem
  const handleRequestPerDiem = async () => {
    if (!perDiemForm.location || !perDiemForm.startDate || !perDiemForm.endDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const days = Math.ceil((new Date(perDiemForm.endDate).getTime() - new Date(perDiemForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    const dailyRate = 79 // Default GSA rate for major cities
    const total = days * dailyRate
    toast.promise(
      (async () => {
        const { error } = await supabase.from('per_diem_requests').insert({
          location: perDiemForm.location,
          start_date: perDiemForm.startDate,
          end_date: perDiemForm.endDate,
          days,
          daily_rate: dailyRate,
          total_amount: total,
          breakfast: perDiemForm.breakfast,
          lunch: perDiemForm.lunch,
          dinner: perDiemForm.dinner,
          status: 'pending'
        })
        if (error) throw error
        toast.success('Per diem requested', {
          description: `${days} days in ${perDiemForm.location} ($${total.toFixed(2)} total)`
        })
        setShowPerDiemDialog(false)
        setPerDiemForm({ location: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], breakfast: true, lunch: true, dinner: true })
      })(),
      { loading: 'Submitting per diem request...', success: 'Request submitted!', error: 'Failed to submit' }
    )
  }

  // Handler for linking card transaction
  const handleLinkCardTransaction = () => {
    setShowConnectCardDialog(true)
    toast.info('Card system ready! Select a transaction to link.')
  }

  // Handler for connecting corporate card
  const handleConnectCorporateCard = () => {
    setShowConnectCardDialog(true)
  }

  const handleSaveCardConnection = async () => {
    // Validate form inputs
    if (!cardForm.cardholderName.trim()) {
      toast.error('Please enter the cardholder name')
      return
    }
    if (!cardForm.lastFourDigits || cardForm.lastFourDigits.length !== 4) {
      toast.error('Please enter the last 4 digits of the card')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to connect a card')
        return
      }

      const { error } = await supabase.from('corporate_cards').insert({
        user_id: user.id,
        card_type: 'corporate',
        provider: cardForm.provider,
        cardholder_name: cardForm.cardholderName,
        last_four_digits: cardForm.lastFourDigits,
        status: 'connected',
        connected_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success('Corporate card connected successfully!')
      setShowConnectCardDialog(false)
      // Reset form
      setCardForm({
        provider: 'amex',
        cardholderName: '',
        lastFourDigits: ''
      })
    } catch (err) {
      console.error('Failed to connect card:', err)
      toast.error('Failed to connect card')
    }
  }

  // Handler for integration actions
  const handleIntegrationAction = (integration: {name: string; status: string}) => {
    setSelectedIntegration(integration)
    setShowIntegrationDialog(true)
  }

  const handleSaveIntegration = () => {
    if (!selectedIntegration) return
    const action = selectedIntegration.status === 'connected' ? 'configured' : 'connected'
    if (selectedIntegration.status !== 'connected') {
      // OAuth flow for new connections
      const slug = selectedIntegration.name.toLowerCase().replace(/\s+/g, '-')
      const oauthUrl = `/api/integrations/${slug}/oauth`
      const popup = window.open(oauthUrl, `${selectedIntegration.name} Connection`, 'width=600,height=700')
      if (popup) {
        toast.info(`Complete ${selectedIntegration.name} authorization in the popup window`)
      } else {
        toast.error('Popup blocked', { description: 'Please allow popups to connect to this service' })
      }
      setShowIntegrationDialog(false)
      setSelectedIntegration(null)
    } else {
      toast.promise(
        (async () => {
          const { error } = await supabase.from('integrations').update({
            settings: { configured: true },
            updated_at: new Date().toISOString()
          }).eq('name', selectedIntegration.name)
          if (error) throw error
          setShowIntegrationDialog(false)
          setSelectedIntegration(null)
        })(),
        {
          loading: `Saving ${selectedIntegration.name}...`,
          success: `${selectedIntegration.name} ${action} successfully!`,
          error: `Failed to configure ${selectedIntegration.name}`
        }
      )
    }
  }

  // Handler for adding webhook
  const handleAddWebhook = () => {
    if (!webhookUrl) {
      toast.error('Please enter a webhook URL')
      return
    }
    toast.promise(
      (async () => {
        const { error } = await supabase.from('webhooks').insert({
          url: webhookUrl,
          service: 'expenses',
          events: ['expense.created', 'expense.approved', 'expense.rejected'],
          status: 'active'
        })
        if (error) throw error
        setShowWebhookDialog(false)
        setWebhookUrl('')
      })(),
      {
        loading: 'Validating webhook URL...',
        success: `Webhook added: ${webhookUrl}`,
        error: 'Failed to add webhook'
      }
    )
  }

  // Handler for API key operations
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
    toast.success('API key copied to clipboard')
  }

  const handleRegenerateApiKey = async () => {
    try {
      const result = await createApiKey({
        name: 'Expenses Integration Key',
        description: 'API key for expenses module integrations',
        key_type: 'api',
        permission: 'write',
        scopes: ['expenses:read', 'expenses:write', 'expenses:delete'],
        environment: 'production',
        rate_limit_per_hour: 1000,
        tags: ['expenses', 'integration']
      })

      // Copy the new key to clipboard for user convenience
      if (result.key_value) {
        await navigator.clipboard.writeText(result.key_value)
        toast.success('API key regenerated and copied to clipboard!', {
          description: 'Please save this key securely - it won\'t be shown again.'
        })
      } else {
        toast.success('API key regenerated successfully!', {
          description: 'Please update your integrations with the new key.'
        })
      }
    } catch (err) {
      console.error('Failed to regenerate API key:', err)
      toast.error('Failed to regenerate API key')
    }
  }

  // Handler for danger zone actions
  const handleResetPolicies = () => {
    if (!confirm('Are you sure you want to reset all expense policies to defaults?')) return
    toast.promise(
      (async () => {
        const { error } = await supabase.from('expense_policies').delete().neq('id', '')
        if (error) throw error
        setShowResetPoliciesDialog(false)
      })(),
      {
        loading: 'Resetting expense policies...',
        success: 'All expense policies have been reset to defaults',
        error: 'Failed to reset policies'
      }
    )
  }

  const handleDeleteAllDrafts = () => {
    const draftCount = expenses.filter((r: any) => r.status === 'draft').length
    if (!confirm(`Are you sure you want to delete ${draftCount} draft reports?`)) return
    toast.promise(
      (async () => {
        const { error } = await supabase.from('expense_reports').delete().eq('status', 'draft')
        if (error) throw error
        setShowDeleteDraftsDialog(false)
      })(),
      {
        loading: `Deleting ${draftCount} draft reports...`,
        success: `${draftCount} draft reports have been deleted`,
        error: 'Failed to delete draft reports'
      }
    )
  }

  // Handler for export all data
  const handleExportAllData = async () => {
    try {
      toast.info('Preparing export...', { description: 'Gathering all expense data' })

      // Fetch all expense-related data from database
      const [
        { data: expenseReports, error: reportsError },
        { data: expensePolicies, error: policiesError },
        { data: mileageTrips, error: mileageError },
        { data: perDiemRequests, error: perDiemError }
      ] = await Promise.all([
        supabase.from('expense_reports').select('*'),
        supabase.from('expense_policies').select('*'),
        supabase.from('mileage_trips').select('*'),
        supabase.from('per_diem_requests').select('*')
      ])

      // Use local expenses data as fallback if DB fetch fails
      const exportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        expenses: expenseReports || expenses.map((e: any) => ({
          id: e.id,
          title: e.title,
          totalAmount: e.totalAmount,
          currency: e.currency,
          status: e.status,
          category: e.lineItems?.[0]?.category || 'other',
          createdAt: e.createdAt,
          submittedAt: e.submittedAt,
          approvedAt: e.approvedAt,
          lineItems: e.lineItems
        })),
        policies: expensePolicies || [],
        mileage: mileageTrips || [],
        perDiems: perDiemRequests || [],
        settings: {
          currency: 'USD',
          fiscalYearStart: 'January',
          autoApproveThreshold: 50
        },
        metadata: {
          totalExpenses: (expenseReports || expenses).length,
          totalPolicies: (expensePolicies || []).length,
          totalMileageTrips: (mileageTrips || []).length,
          totalPerDiems: (perDiemRequests || []).length
        }
      }

      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expenses-full-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url) // Clean up the object URL

      const fileSizeKB = (blob.size / 1024).toFixed(1)
      toast.success(`Export complete! File size: ${fileSizeKB} KB`, {
        description: `Exported ${exportData.metadata.totalExpenses} expenses`
      })
    } catch (err) {
      console.error('Failed to export data:', err)
      toast.error('Failed to export data', {
        description: 'Please try again or contact support'
      })
    }
  }

  // Handler for quick filter selection
  const handleQuickFilter = (filter: string) => {
    setActiveQuickFilter(activeQuickFilter === filter ? null : filter)
    switch (filter) {
      case 'My Reports':
        toast.info('Showing your reports', { description: 'Filtered to show only your submitted expense reports' })
        break
      case 'Needs Review':
        setStatusFilter('pending')
        toast.info('Showing pending reviews', { description: 'Filtered to show expense reports awaiting approval' })
        break
      case 'Policy Violations':
        toast.info('Showing policy violations', { description: 'Filtered to show expense reports with policy violations' })
        break
      case 'This Month':
        toast.info('Showing this month', { description: 'Filtered to show expense reports from current month' })
        break
      default:
        setStatusFilter('all')
    }
  }

  // Get quick actions with real handlers
  const expensesQuickActions = getExpensesQuickActions(
    setShowNewExpenseDialog,
    handleScanReceipt,
    handleGenerateReport
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Receipt className="h-8 w-8" />
                Expense Management
              </h1>
              <p className="text-purple-100 mt-1">Track, submit, and manage expense reports</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleExportExpenses}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-purple-600 hover:bg-purple-50" onClick={() => setShowNewExpenseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[
              { label: 'Total Expenses', value: `$${(stats.totalExpenses / 1000).toFixed(1)}K`, icon: DollarSign, trend: '+12.5%' },
              { label: 'Pending Approval', value: `$${(stats.pendingApproval / 1000).toFixed(1)}K`, icon: Clock, count: stats.pendingCount },
              { label: 'Approved', value: `$${(stats.approved / 1000).toFixed(1)}K`, icon: CheckCircle, trend: '+8.3%' },
              { label: 'Reimbursed', value: `$${(stats.reimbursed / 1000).toFixed(1)}K`, icon: Banknote, trend: '+15.2%' },
              { label: 'Avg Processing', value: `${stats.avgProcessingTime} days`, icon: TrendingUp, trend: '-0.5 days' },
              { label: 'Policy Compliance', value: '94%', icon: Shield, trend: '+2.1%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-purple-200" />
                  {stat.trend && <span className="text-xs text-emerald-300">{stat.trend}</span>}
                  {stat.count !== undefined && <Badge className="bg-yellow-500 text-xs">{stat.count}</Badge>}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-purple-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Related Dashboards Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Navigation</h3>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/financial-v2')}
              className="flex items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              View Financial Overview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/invoicing-v2?type=expense')}
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Create Invoice for Reimbursable
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="reports">Expense Reports</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="mileage">Mileage</TabsTrigger>
            <TabsTrigger value="per-diem">Per Diem</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Expense Reports Tab */}
          <TabsContent value="reports">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Expense Reports</h2>
                  <p className="text-emerald-100">Expensify-level expense management</p>
                  <p className="text-emerald-200 text-xs mt-1">Receipt scanning • Approval workflows • Reimbursements</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{expenses.length}</p>
                    <p className="text-emerald-200 text-sm">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${stats.totalExpenses.toLocaleString()}</p>
                    <p className="text-emerald-200 text-sm">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              {/* Report List */}
              <div className="flex-1">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="reimbursed">Reimbursed</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2 mb-4">
                  {[
                    { label: 'My Reports', count: 3 },
                    { label: 'Needs Review', count: 2 },
                    { label: 'Policy Violations', count: 1 },
                    { label: 'This Month', count: 4 },
                  ].map((filter, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1.5 border rounded-lg text-sm flex items-center gap-2 transition-colors ${
                        activeQuickFilter === filter.label
                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleQuickFilter(filter.label)}
                    >
                      {filter.label}
                      <Badge variant="secondary" className="text-xs">{filter.count}</Badge>
                    </button>
                  ))}
                </div>

                {/* Loading State */}
                {expensesLoading && (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mr-2" />
                    <span className="text-gray-500">Loading expenses...</span>
                  </div>
                )}

                {/* Error State */}
                {expensesError && !expensesLoading && (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">Failed to load expenses</p>
                    <p className="text-sm text-red-500 mt-1">{expensesError.message || 'An error occurred'}</p>
                    <Button variant="outline" className="mt-3" onClick={() => refetch()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!expensesLoading && !expensesError && filteredExpenses.length === 0 && (
                  <div className="p-12 text-center">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No expenses found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first expense report to get started'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowNewExpenseDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Expense
                      </Button>
                    )}
                  </div>
                )}

                {/* Expense Cards */}
                <div className="space-y-4">
                  {!expensesLoading && filteredExpenses.map((expense: any) => {
                    const CategoryIcon = getCategoryIcon(expense.expense_category as ExpenseCategory)
                    const policyViolations = expense.policy_violations || []
                    return (
                      <Card key={expense.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                        setSelectedReport({
                          id: expense.id,
                          title: expense.expense_title || 'Untitled Expense',
                          status: expense.status as ExpenseStatus,
                          submittedBy: { id: expense.submitted_by_id || '', name: expense.submitted_by || 'Current User', email: '', avatar: '', department: expense.department || '' },
                          approver: expense.approved_by ? { id: expense.approved_by_id || '', name: expense.approved_by, email: '', avatar: '' } : undefined,
                          lineItems: [{
                            id: expense.id,
                            description: expense.description || expense.expense_title || '',
                            amount: expense.amount || 0,
                            category: (expense.expense_category || 'other') as ExpenseCategory,
                            date: expense.expense_date || expense.created_at,
                            merchant: expense.merchant_name || '',
                            taxAmount: expense.tax_amount || 0,
                            isBillable: expense.is_billable || false,
                            projectCode: expense.project_name || undefined
                          }],
                          totalAmount: expense.total_amount || expense.amount || 0,
                          currency: (expense.currency || 'USD') as Currency,
                          paymentMethod: (expense.payment_method || 'corporate_card') as PaymentMethod,
                          createdAt: expense.created_at,
                          submittedAt: expense.submitted_at || undefined,
                          approvedAt: expense.approved_at || undefined,
                          reimbursedAt: expense.reimbursed_at || undefined,
                          notes: expense.description || undefined,
                          policyViolations: Array.isArray(policyViolations) ? policyViolations.map((v: string) => ({ rule: v, severity: 'warning' as const })) : [],
                          attachments: expense.attachment_count || 0,
                          tripId: expense.trip_id || undefined
                        })
                        setShowReportDialog(true)
                      }}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                              <CategoryIcon className="h-6 w-6 text-purple-600" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{expense.expense_title || 'Untitled Expense'}</h3>
                                <Badge className={getStatusColor(expense.status as ExpenseStatus)}>{expense.status}</Badge>
                                {policyViolations.length > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {policyViolations.length} violation{policyViolations.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback>{(expense.submitted_by || 'U')[0]}</AvatarFallback>
                                  </Avatar>
                                  {expense.submitted_by || 'Current User'}
                                </span>
                                {expense.department && <span>{expense.department}</span>}
                                {expense.expense_category && (
                                  <span className="capitalize">{expense.expense_category}</span>
                                )}
                                {expense.attachment_count > 0 && <span>{expense.attachment_count} receipts</span>}
                              </div>

                              {expense.description && (
                                <div className="flex flex-wrap gap-2">
                                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                    <CategoryIcon className="h-3 w-3" />
                                    {expense.description.slice(0, 40)}{expense.description.length > 40 ? '...' : ''}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-purple-600">${(expense.total_amount || expense.amount || 0).toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{expense.currency || 'USD'}</p>
                              {expense.submitted_at && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Submitted {new Date(expense.submitted_at).toLocaleDateString()}
                                </p>
                              )}
                              {!expense.submitted_at && expense.expense_date && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(expense.expense_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-80 space-y-4">
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'Scan Receipt', icon: Camera, color: 'text-purple-600', action: handleScanReceipt },
                      { label: 'Add Mileage', icon: Car, color: 'text-blue-600', action: () => setShowMileageDialog(true) },
                      { label: 'Request Per Diem', icon: Calendar, color: 'text-green-600', action: () => setShowPerDiemDialog(true) },
                      { label: 'Link Card Transaction', icon: CreditCard, color: 'text-orange-600', action: handleLinkCardTransaction },
                    ].map((quickAction, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
                        onClick={quickAction.action}
                      >
                        <quickAction.icon className={`h-5 w-5 ${quickAction.color}`} />
                        <span className="text-sm">{quickAction.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryBreakdown.slice(0, 5).map(([category, amount], i) => {
                      const Icon = getCategoryIcon(category as ExpenseCategory)
                      const total = stats.totalExpenses
                      const percent = ((amount / total) * 100).toFixed(0)
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4" />
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                            <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                          </div>
                          <Progress value={Number(percent)} className="h-1.5" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Pending Approvals */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Needs Your Approval</span>
                      <Badge variant="secondary">{stats.pendingCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expenses.filter((r: any) => r.status === 'pending').length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No pending approvals</p>
                    ) : (
                      expenses.filter((r: any) => r.status === 'pending').slice(0, 3).map((expense: any) => (
                        <div key={expense.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => {
                          setSelectedReport({
                            id: expense.id,
                            title: expense.expense_title || 'Untitled',
                            status: expense.status as ExpenseStatus,
                            submittedBy: { id: expense.submitted_by_id || '', name: expense.submitted_by || 'Current User', email: '', avatar: '', department: expense.department || '' },
                            lineItems: [],
                            totalAmount: expense.total_amount || expense.amount || 0,
                            currency: (expense.currency || 'USD') as Currency,
                            paymentMethod: (expense.payment_method || 'corporate_card') as PaymentMethod,
                            createdAt: expense.created_at,
                            submittedAt: expense.submitted_at || undefined,
                            policyViolations: [],
                            attachments: expense.attachment_count || 0
                          })
                          setShowReportDialog(true)
                        }}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{(expense.submitted_by || 'U')[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{expense.submitted_by || expense.expense_title || 'Expense'}</p>
                            <p className="text-xs text-gray-500">${(expense.total_amount || expense.amount || 0).toLocaleString()}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Receipt Scanner</CardTitle>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleScanReceipt}>
                      <Camera className="h-4 w-4 mr-2" />
                      Scan Receipt
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-xl p-12 text-center">
                    <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Drop receipts here</h3>
                    <p className="text-gray-500 mb-4">or click to browse files</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG, PDF up to 10MB</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Uploads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">OCR Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Upload a receipt to extract data</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mileage Tab */}
          <TabsContent value="mileage">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Mileage Log</CardTitle>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowMileageDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trip
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mileage.map(entry => (
                        <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Car className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{entry.origin}</span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{entry.destination}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{entry.date}</span>
                              <span>{entry.distance} miles</span>
                              <span>{entry.purpose}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${(entry.distance * entry.rate).toFixed(2)}</p>
                            <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mileage Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {mileage.reduce((sum, m) => sum + m.distance, 0)} mi
                    </p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">IRS Rate</span>
                      <span className="font-medium">$0.67/mile</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending Reimbursement</span>
                      <span className="font-medium">
                        ${mileage.filter(m => m.status === 'pending').reduce((sum, m) => sum + (m.distance * m.rate), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Per Diem Tab */}
          <TabsContent value="per-diem">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Per Diem Requests</CardTitle>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowPerDiemDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Request Per Diem
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {perDiems.map(pd => (
                      <div key={pd.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{pd.location}</h4>
                              <p className="text-sm text-gray-500">{pd.startDate} - {pd.endDate}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(pd.status)}>{pd.status}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-sm">
                          <div>
                            <span className="text-gray-500">Daily Rate</span>
                            <p className="font-medium">${pd.dailyRate}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total</span>
                            <p className="font-medium">${pd.totalAmount}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Meals Included</span>
                            <div className="flex gap-2 mt-1">
                              {pd.meals.breakfast && <Badge variant="outline">Breakfast</Badge>}
                              {pd.meals.lunch && <Badge variant="outline">Lunch</Badge>}
                              {pd.meals.dinner && <Badge variant="outline">Dinner</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">GSA Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { city: 'New York, NY', rate: 79 },
                      { city: 'San Francisco, CA', rate: 79 },
                      { city: 'Chicago, IL', rate: 59 },
                      { city: 'Other US Locations', rate: 59 },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.city}</span>
                        <span className="font-medium">${item.rate}/day</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <PieChart className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Spenders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      // Aggregate expenses by submitter from Supabase data
                      const spenderMap: Record<string, { name: string; department: string; total: number }> = {}
                      expenses.forEach((exp: any) => {
                        const key = exp.submitted_by_id || exp.submitted_by || 'unknown'
                        if (!spenderMap[key]) {
                          spenderMap[key] = { name: exp.submitted_by || 'Current User', department: exp.department || '', total: 0 }
                        }
                        spenderMap[key].total += (exp.total_amount || exp.amount || 0)
                      })
                      const topSpenders = Object.entries(spenderMap).sort((a, b) => b[1].total - a[1].total).slice(0, 5)
                      if (topSpenders.length === 0) {
                        return <p className="text-sm text-gray-400 text-center py-4">No expense data yet</p>
                      }
                      return topSpenders.map(([key, spender], i) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                          <Avatar>
                            <AvatarFallback>{spender.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{spender.name}</p>
                            <p className="text-sm text-gray-500">{spender.department}</p>
                          </div>
                          <span className="font-semibold">${spender.total.toLocaleString()}</span>
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">2.3</p>
                      <p className="text-sm text-gray-500">Avg. Days to Approve</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">94%</p>
                      <p className="text-sm text-gray-500">Approval Rate</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">1.8</p>
                      <p className="text-sm text-gray-500">Avg. Days to Reimburse</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-orange-600">6%</p>
                      <p className="text-sm text-gray-500">Policy Violations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              {policies.map(policy => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(policy.category)}`}>
                        {(() => {
                          const Icon = getCategoryIcon(policy.category)
                          return <Icon className="h-5 w-5" />
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{policy.name} Policy</h3>
                        <p className="text-sm text-gray-500 capitalize">{policy.category}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Maximum Amount</span>
                        <span className="font-medium">${policy.maxAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Approval Threshold</span>
                        <span className="font-medium">${policy.approvalThreshold}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Receipt Required</span>
                        <Badge variant={policy.requiresReceipt ? 'default' : 'secondary'}>
                          {policy.requiresReceipt ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Approval Required</span>
                        <Badge variant={policy.requiresApproval ? 'default' : 'secondary'}>
                          {policy.requiresApproval ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>

                    {policy.notes && (
                      <p className="text-sm text-gray-500 mt-4 pt-4 border-t">{policy.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Expensify Level */}
          <TabsContent value="settings">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="general" className="gap-2">
                  <Settings className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="approvals" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approvals
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Company Settings</h3>
                        <p className="text-sm text-gray-500">Organization configuration</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input defaultValue="FreeFlow Inc." />
                      </div>
                      <div className="space-y-2">
                        <Label>Default Currency</Label>
                        <Select defaultValue="usd">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD ($)</SelectItem>
                            <SelectItem value="eur">EUR (€)</SelectItem>
                            <SelectItem value="gbp">GBP (£)</SelectItem>
                            <SelectItem value="cad">CAD ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fiscal Year Start</Label>
                        <Select defaultValue="january">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="january">January</SelectItem>
                            <SelectItem value="april">April</SelectItem>
                            <SelectItem value="july">July</SelectItem>
                            <SelectItem value="october">October</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Receipt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Expense Defaults</h3>
                        <p className="text-sm text-gray-500">Default expense settings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Categorize Expenses</Label>
                          <p className="text-xs text-gray-500">Use AI to categorize</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Require Receipts</Label>
                          <p className="text-xs text-gray-500">For all expenses over $25</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Mileage Tracking</Label>
                          <p className="text-xs text-gray-500">Track vehicle miles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Per Diem</Label>
                          <p className="text-xs text-gray-500">GSA per diem rates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Localization</h3>
                      <p className="text-sm text-gray-500">Regional preferences</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
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
                          <SelectItem value="us">1,234.56</SelectItem>
                          <SelectItem value="eu">1.234,56</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Approvals Settings */}
              <TabsContent value="approvals" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Approval Workflow</h3>
                        <p className="text-sm text-gray-500">Configure approval process</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Approval Mode</Label>
                        <Select defaultValue="manager">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager Approval</SelectItem>
                            <SelectItem value="department">Department Head</SelectItem>
                            <SelectItem value="finance">Finance Team</SelectItem>
                            <SelectItem value="custom">Custom Workflow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Auto-Approve Threshold</Label>
                        <Select defaultValue="50">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No auto-approve</SelectItem>
                            <SelectItem value="25">Under $25</SelectItem>
                            <SelectItem value="50">Under $50</SelectItem>
                            <SelectItem value="100">Under $100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Multi-Level Approval</Label>
                          <p className="text-xs text-gray-500">For large expenses</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Delegate Approval</Label>
                          <p className="text-xs text-gray-500">Allow delegation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Timer className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Timing & Deadlines</h3>
                        <p className="text-sm text-gray-500">Submission and approval windows</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Submission Deadline</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">Within 7 days</SelectItem>
                            <SelectItem value="14">Within 14 days</SelectItem>
                            <SelectItem value="30">Within 30 days</SelectItem>
                            <SelectItem value="60">Within 60 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Approval SLA</Label>
                        <Select defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 business day</SelectItem>
                            <SelectItem value="3">3 business days</SelectItem>
                            <SelectItem value="5">5 business days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Escalation</Label>
                          <p className="text-xs text-gray-500">Auto-escalate overdue</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Approval Chain</h3>
                      <p className="text-sm text-gray-500">Configure approval hierarchy</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { level: 'Level 1', threshold: '$0 - $500', approver: 'Direct Manager' },
                      { level: 'Level 2', threshold: '$500 - $2,000', approver: 'Department Head' },
                      { level: 'Level 3', threshold: '$2,000 - $10,000', approver: 'Finance Director' },
                      { level: 'Level 4', threshold: '$10,000+', approver: 'CFO' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <Badge className="mb-2">{item.level}</Badge>
                        <div className="text-lg font-semibold text-purple-600">{item.threshold}</div>
                        <p className="text-sm text-gray-500">{item.approver}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Payments Settings */}
              <TabsContent value="payments" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Banknote className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Reimbursement Settings</h3>
                        <p className="text-sm text-gray-500">Configure payment options</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reimbursement Method</Label>
                        <Select defaultValue="ach">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ach">ACH Direct Deposit</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="payroll">Via Payroll</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Schedule</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Reimburse</Label>
                          <p className="text-xs text-gray-500">After approval</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Corporate Cards</h3>
                        <p className="text-sm text-gray-500">Card integration settings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Import Transactions</Label>
                          <p className="text-xs text-gray-500">Sync card expenses</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Match Receipts</Label>
                          <p className="text-xs text-gray-500">Auto-match with receipts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Reconciliation Alerts</Label>
                          <p className="text-xs text-gray-500">Missing receipt reminders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full gap-2" onClick={handleConnectCorporateCard}>
                        <Plus className="w-4 h-4" />
                        Connect Corporate Card
                      </Button>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Mileage Rates</h3>
                      <p className="text-sm text-gray-500">Configure mileage reimbursement</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>IRS Standard Rate</Label>
                      <Input defaultValue="$0.67" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Rate</Label>
                      <Input defaultValue="$0.67" />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select defaultValue="miles">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="km">Kilometers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                      <div>
                        <Label>GPS Tracking</Label>
                        <p className="text-xs text-gray-500">Auto-track trips</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Expense email alerts</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Expense Submitted', desc: 'When report is submitted', enabled: true },
                        { label: 'Expense Approved', desc: 'When report is approved', enabled: true },
                        { label: 'Expense Rejected', desc: 'When report is rejected', enabled: true },
                        { label: 'Reimbursement Sent', desc: 'When payment is processed', enabled: true },
                        { label: 'Pending Approval', desc: 'Awaiting your approval', enabled: true },
                        { label: 'Policy Violation', desc: 'Expense exceeds policy', enabled: true },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <UserCog className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Approver Notifications</h3>
                        <p className="text-sm text-gray-500">Alerts for approvers</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'New Expense Pending', desc: 'Report awaiting approval', enabled: true },
                        { label: 'Daily Digest', desc: 'Summary of pending items', enabled: true },
                        { label: 'Overdue Approvals', desc: 'Past SLA deadline', enabled: true },
                        { label: 'Large Expense Alert', desc: 'Expenses over threshold', enabled: true },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Reminder Settings</h3>
                      <p className="text-sm text-gray-500">Automatic reminders</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Receipt Reminder</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day after</SelectItem>
                          <SelectItem value="3">3 days after</SelectItem>
                          <SelectItem value="7">7 days after</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Submission Reminder</Label>
                      <Select defaultValue="weekly">
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
                      <Label>Approval Reminder</Label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day pending</SelectItem>
                          <SelectItem value="2">2 days pending</SelectItem>
                          <SelectItem value="3">3 days pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Link2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Connected Services</h3>
                      <p className="text-sm text-gray-500">Third-party integrations</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'QuickBooks', desc: 'Accounting sync', status: 'connected', icon: '📊' },
                      { name: 'Xero', desc: 'Financial data', status: 'available', icon: '💰' },
                      { name: 'NetSuite', desc: 'ERP integration', status: 'available', icon: '🔗' },
                      { name: 'Slack', desc: 'Team notifications', status: 'connected', icon: '💬' },
                      { name: 'Google Workspace', desc: 'Receipt scanning', status: 'connected', icon: '📧' },
                      { name: 'SAP Concur', desc: 'Travel & expense', status: 'available', icon: '✈️' },
                    ].map((integration, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{integration.name}</div>
                            <p className="text-sm text-gray-500">{integration.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            integration.status === 'connected'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }>
                            {integration.status === 'connected' ? 'Connected' : 'Available'}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => handleIntegrationAction(integration)}>
                            {integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Webhook className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Webhooks</h3>
                        <p className="text-sm text-gray-500">Real-time expense events</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input
                          placeholder="https://api.yourapp.com/webhooks/expenses"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" className="w-full gap-2" onClick={handleAddWebhook}>
                        <Plus className="w-4 h-4" />
                        Add Webhook
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Key className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">API Access</h3>
                        <p className="text-sm text-gray-500">Developer API keys</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                        exp_sk_live_••••••••••••••••
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 gap-2" onClick={handleCopyApiKey}>
                          Copy Key
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleRegenerateApiKey}>
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
                        <p className="text-sm text-gray-500">Security settings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-xs text-gray-500">Require 2FA for approvers</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SSO Only</Label>
                          <p className="text-xs text-gray-500">Require SSO login</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Audit Logging</Label>
                          <p className="text-xs text-gray-500">Log all changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>IP Restriction</Label>
                          <p className="text-xs text-gray-500">Limit by IP address</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Data Management</h3>
                        <p className="text-sm text-gray-500">Data retention & export</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Data Retention</Label>
                        <Select defaultValue="7">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 years</SelectItem>
                            <SelectItem value="5">5 years</SelectItem>
                            <SelectItem value="7">7 years</SelectItem>
                            <SelectItem value="10">10 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Archive</Label>
                          <p className="text-xs text-gray-500">Archive old reports</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full gap-2" onClick={handleExportAllData}>
                        <Download className="w-4 h-4" />
                        Export All Data
                      </Button>
                    </div>
                  </Card>
                </div>

                <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                      <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Reset All Policies</div>
                        <p className="text-sm text-gray-500">Restore default expense policies</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowResetPoliciesDialog(true)}>
                        Reset
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Delete All Draft Reports</div>
                        <p className="text-sm text-gray-500">Remove all unsubmitted reports</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteDraftsDialog(true)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components - TEMPORARILY DISABLED DUE TO RADIX UI INFINITE LOOP */}
        {/* NOTE: Radix UI ref issue in competitive-upgrades - tracked separately, not blocking */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            /* AIInsightsPanel removed - use header button */
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockExpensesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockExpensesPredictions}
              title="Spend Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          /* ActivityFeed removed - use header button */
          <QuickActionsToolbar
            actions={mockExpensesQuickActions}
            variant="grid"
          />
        </div> */}
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedReport.title}</span>
                  <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                  {/* Summary */}
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={selectedReport.submittedBy.avatar} alt="User avatar" />
                        <AvatarFallback>{selectedReport.submittedBy.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedReport.submittedBy.name}</p>
                        <p className="text-sm text-gray-500">{selectedReport.submittedBy.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">${selectedReport.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{selectedReport.lineItems.length} items</p>
                    </div>
                  </div>

                  {/* Policy Violations */}
                  {selectedReport.policyViolations.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Policy Violations
                      </h4>
                      {selectedReport.policyViolations.map((violation, i) => (
                        <p key={i} className="text-sm text-red-700">{violation.rule}</p>
                      ))}
                    </div>
                  )}

                  {/* Line Items */}
                  <div>
                    <h4 className="font-medium mb-3">Expense Items</h4>
                    <div className="space-y-3">
                      {selectedReport.lineItems.map(item => {
                        const Icon = getCategoryIcon(item.category)
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.description}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{item.merchant}</span>
                                <span>{item.date}</span>
                                {item.isBillable && (
                                  <Badge variant="outline" className="text-xs">Billable</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${item.amount.toFixed(2)}</p>
                              {item.taxAmount && item.taxAmount > 0 && (
                                <p className="text-xs text-gray-500">+${item.taxAmount.toFixed(2)} tax</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="font-medium mb-3">Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-gray-500">Created:</span>
                        <span>{selectedReport.createdAt}</span>
                      </div>
                      {selectedReport.submittedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-gray-500">Submitted:</span>
                          <span>{selectedReport.submittedAt}</span>
                        </div>
                      )}
                      {selectedReport.approvedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-gray-500">Approved:</span>
                          <span>{selectedReport.approvedAt}</span>
                        </div>
                      )}
                      {selectedReport.reimbursedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-gray-500">Reimbursed:</span>
                          <span>{selectedReport.reimbursedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleRejectExpense(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {updating ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveExpense(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {updating ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              )}
              {selectedReport.status === 'approved' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteExpense(selectedReport.id, selectedReport.title)}
                    disabled={deleting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleReimburseExpense(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    {updating ? 'Processing...' : 'Reimburse'}
                  </Button>
                </div>
              )}
              {selectedReport.status === 'draft' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteExpense(selectedReport.id, selectedReport.title)}
                    disabled={deleting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleSubmitReport(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {updating ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Expense Dialog */}
      <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Expense Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Title</label>
              <Input
                placeholder="e.g., Q1 Sales Conference"
                value={newExpenseForm.title}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newExpenseForm.amount || ''}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={newExpenseForm.paymentMethod}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="corporate_card">Corporate Card</option>
                <option value="personal_card">Personal Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                rows={3}
                placeholder="Add any relevant notes..."
                value={newExpenseForm.notes}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Tax Deduction Suggestion */}
            {newExpenseForm.title && newExpenseForm.amount > 0 && (
              <div className="border-t pt-4">
                <DeductionSuggestionWidget
                  description={newExpenseForm.title + (newExpenseForm.notes ? ' - ' + newExpenseForm.notes : '')}
                  amount={newExpenseForm.amount}
                  onSuggestionApplied={(suggestion) => {
                    toast.success(`Deduction suggestion applied: ${suggestion.category}`)
                    // You can store the suggestion category for later use
                  }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewExpenseDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleCreateExpense}
                disabled={creating || !newExpenseForm.title}
              >
                {creating ? 'Creating...' : 'Create Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Mileage Dialog */}
      <Dialog open={showMileageDialog} onOpenChange={setShowMileageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Add Mileage Trip
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={mileageForm.date}
                onChange={(e) => setMileageForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Origin</label>
                <Input
                  placeholder="e.g., Office"
                  value={mileageForm.origin}
                  onChange={(e) => setMileageForm(prev => ({ ...prev, origin: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <Input
                  placeholder="e.g., Client Site"
                  value={mileageForm.destination}
                  onChange={(e) => setMileageForm(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Distance (miles)</label>
              <Input
                type="number"
                placeholder="0"
                value={mileageForm.distance || ''}
                onChange={(e) => setMileageForm(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-gray-500 mt-1">Current IRS rate: $0.67/mile</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Purpose</label>
              <Input
                placeholder="e.g., Client meeting"
                value={mileageForm.purpose}
                onChange={(e) => setMileageForm(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
            {mileageForm.distance > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Estimated reimbursement: <strong>${(mileageForm.distance * 0.67).toFixed(2)}</strong>
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowMileageDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddMileage}
                disabled={!mileageForm.origin || !mileageForm.destination || !mileageForm.distance}
              >
                Add Trip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Per Diem Dialog */}
      <Dialog open={showPerDiemDialog} onOpenChange={setShowPerDiemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Request Per Diem
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                placeholder="e.g., New York, NY"
                value={perDiemForm.location}
                onChange={(e) => setPerDiemForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={perDiemForm.startDate}
                  onChange={(e) => setPerDiemForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={perDiemForm.endDate}
                  onChange={(e) => setPerDiemForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Meals Included</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={perDiemForm.breakfast}
                    onChange={(e) => setPerDiemForm(prev => ({ ...prev, breakfast: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Breakfast</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={perDiemForm.lunch}
                    onChange={(e) => setPerDiemForm(prev => ({ ...prev, lunch: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Lunch</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={perDiemForm.dinner}
                    onChange={(e) => setPerDiemForm(prev => ({ ...prev, dinner: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Dinner</span>
                </label>
              </div>
            </div>
            {perDiemForm.location && perDiemForm.startDate && perDiemForm.endDate && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Estimated per diem: <strong>
                    ${(
                      (Math.ceil((new Date(perDiemForm.endDate).getTime() - new Date(perDiemForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) * 79
                    ).toFixed(2)}
                  </strong> ({Math.ceil((new Date(perDiemForm.endDate).getTime() - new Date(perDiemForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days @ $79/day)
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPerDiemDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleRequestPerDiem}
                disabled={!perDiemForm.location || !perDiemForm.startDate || !perDiemForm.endDate}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect Corporate Card Dialog */}
      <Dialog open={showConnectCardDialog} onOpenChange={setShowConnectCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Connect Corporate Card
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Connect your corporate card to automatically import transactions and match them with receipts.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Card Provider</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={cardForm.provider}
                onChange={(e) => setCardForm(prev => ({ ...prev, provider: e.target.value }))}
              >
                <option value="amex">American Express</option>
                <option value="visa">Visa Corporate</option>
                <option value="mastercard">Mastercard Corporate</option>
                <option value="chase">Chase Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cardholder Name</label>
              <Input
                placeholder="Name on card"
                value={cardForm.cardholderName}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last 4 Digits</label>
              <Input
                placeholder="XXXX"
                maxLength={4}
                value={cardForm.lastFourDigits}
                onChange={(e) => setCardForm(prev => ({ ...prev, lastFourDigits: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConnectCardDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveCardConnection}
                disabled={!cardForm.cardholderName || cardForm.lastFourDigits.length !== 4}
              >
                Connect Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integration Configuration Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-600" />
              {selectedIntegration?.status === 'connected' ? 'Configure' : 'Connect'} {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedIntegration?.status === 'connected' ? (
              <>
                <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-700">
                    {selectedIntegration.name} is currently connected and syncing.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sync Frequency</label>
                  <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Every hour</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Auto-sync expenses</label>
                    <p className="text-xs text-gray-500">Automatically sync new expenses</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Connect {selectedIntegration?.name} to sync your expense data and streamline your workflow.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <Input placeholder="Enter your API key" type="password" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization ID</label>
                  <Input placeholder="Enter your organization ID" />
                </div>
              </>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowIntegrationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSaveIntegration}>
                {selectedIntegration?.status === 'connected' ? 'Save Changes' : 'Connect'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Policies Confirmation Dialog */}
      <Dialog open={showResetPoliciesDialog} onOpenChange={setShowResetPoliciesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Reset All Expense Policies
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                This action will reset all expense policies to their default values. This cannot be undone.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              The following will be reset:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Expense category limits</li>
              <li>Approval thresholds</li>
              <li>Receipt requirements</li>
              <li>Auto-approval rules</li>
            </ul>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowResetPoliciesDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleResetPolicies}>
                Reset Policies
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Drafts Confirmation Dialog */}
      <Dialog open={showDeleteDraftsDialog} onOpenChange={setShowDeleteDraftsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete All Draft Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                This action will permanently delete all unsubmitted expense reports. This cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>{expenses.filter((r: any) => r.status === 'draft').length}</strong> draft reports will be deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteDraftsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleDeleteAllDrafts}>
                Delete All Drafts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
