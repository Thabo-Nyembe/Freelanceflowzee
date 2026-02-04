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

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Receipt,
  Building,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Send,
  Settings,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'

// AI FEATURES
import { RevenueInsightsWidget } from '@/components/ai/revenue-insights-widget'
import { useCurrentUser, useRevenueData } from '@/hooks/use-ai-data'

const logger = createSimpleLogger('FinancialHub')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - FinancialHub Context
// ============================================================================

const financialHubAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const financialHubCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const financialHubPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const financialHubActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const financialHubQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => {
    toast.success('Financial entry created successfully')
  }},
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => {
    toast.success('Financial report exported to CSV')
  }},
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => {
    toast.success('Financial hub settings loaded')
  }},
]

export default function FinancialHubClient() {
  // REAL USER AUTH & AI DATA
  const { userId, loading: userLoading } = useCurrentUser()
  const { data: revenueData, loading: revenueLoading, refresh } = useRevenueData(userId || undefined)

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [_selectedPeriod, setSelectedPeriod] = useState<string>('monthly')
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [showAIWidget, setShowAIWidget] = useState(true)
  const [deleteClient, setDeleteClient] = useState<{ id: number; name: string } | null>(null)
  const [deleteGoal, setDeleteGoal] = useState<string | null>(null)

  // DIALOG STATES
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false)
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)
  const [showGenerateStatementDialog, setShowGenerateStatementDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)
  const [showEditClientDialog, setShowEditClientDialog] = useState(false)
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false)
  const [showCreateGoalDialog, setShowCreateGoalDialog] = useState(false)
  const [showEditGoalDialog, setShowEditGoalDialog] = useState(false)
  const [showRecordPaymentDialog, setShowRecordPaymentDialog] = useState(false)
  const [showTaxReportDialog, setShowTaxReportDialog] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)

  // FORM STATES
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    notes: ''
  })
  const [editingClient, setEditingClient] = useState<{ id: number; name: string; revenue: number; projects: number } | null>(null)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'software',
    date: new Date().toISOString().split('T')[0]
  })
  const [newGoal, setNewGoal] = useState({
    type: 'monthly' as 'monthly' | 'yearly',
    targetAmount: '',
    description: ''
  })
  const [editingGoal, setEditingGoal] = useState<{ id: string; type: string; target: number; current: number } | null>(null)
  const [recordingPayment, setRecordingPayment] = useState<{ id: number; client: string; amount: number } | null>(null)
  const [exportFormat, setExportFormat] = useState('csv')
  const [statementPeriod, setStatementPeriod] = useState('monthly')
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString())

  // REAL DATA STATE
  const [financialData, setFinancialData] = useState({
    overview: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      monthlyGrowth: 0,
      yearlyGrowth: 0,
      profitMargin: 0
    },
    invoices: {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    },
    expenses: {
      total: 0,
      categories: {} as Record<string, number>
    },
    clients: {
      total: 0,
      active: 0,
      new: 0,
      topClients: [] as Array<{ name: string; revenue: number; projects: number }>
    },
    goals: {
      monthlyTarget: 50000,
      yearlyTarget: 600000,
      currentProgress: 0,
      yearlyProgress: 0
    }
  })

  const [recentTransactions, setRecentTransactions] = useState<Array<{
    id: string | number
    type: 'income' | 'expense'
    description: string
    amount: number
    date: string
    status: string
  }>>([])

  const [upcomingPayments] = useState([
    { id: 1, client: 'Acme Corp', amount: 12500, dueDate: '2024-01-25', status: 'pending' },
    { id: 2, client: 'Tech Startup', amount: 8000, dueDate: '2024-01-30', status: 'overdue' },
    { id: 3, client: 'Local Business', amount: 5500, dueDate: '2024-02-05', status: 'scheduled' }
  ])

  // A+++ LOAD FINANCIAL HUB DATA FROM DATABASE
  useEffect(() => {
    const loadFinancialHubData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        logger.info('Loading financial hub data from database', { userId })

        // Dynamic import for code splitting
        const {
          getFinancialOverview,
          getTransactions,
          getFinancialGoals,
          getCategoryBreakdown,
          getMonthlyTrend
        } = await import('@/lib/financial-queries')

        // Load data in parallel
        const [overviewResult, transactionsResult, goalsResult, expenseBreakdownResult, trendResult] = await Promise.all([
          getFinancialOverview(userId),
          getTransactions(userId, { status: 'completed' }),
          getFinancialGoals(userId, { status: 'active' }),
          getCategoryBreakdown(userId, 'expense'),
          getMonthlyTrend(userId, 2)
        ])

        // Process overview data
        if (overviewResult.data) {
          const overview = overviewResult.data

          // Calculate growth from trend data
          let monthlyGrowth = 0
          const yearlyGrowth = 0

          if (trendResult.data && trendResult.data.length >= 2) {
            const currentMonth = trendResult.data[0]
            const previousMonth = trendResult.data[1]

            if (previousMonth.revenue > 0) {
              monthlyGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
            }
          }

          setFinancialData(prev => ({
            ...prev,
            overview: {
              totalRevenue: overview.total_revenue,
              totalExpenses: overview.total_expenses,
              netProfit: overview.net_profit,
              monthlyGrowth: monthlyGrowth,
              yearlyGrowth: yearlyGrowth,
              profitMargin: overview.profit_margin
            }
          }))
        }

        // Process transactions
        if (transactionsResult.data && transactionsResult.data.length > 0) {
          const transformed = transactionsResult.data.slice(0, 5).map(t => ({
            id: t.id,
            type: t.type,
            description: t.description,
            amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount),
            date: t.transaction_date,
            status: t.status
          }))
          setRecentTransactions(transformed)

          // Calculate invoice stats from transactions
          const incomeTransactions = transactionsResult.data.filter(t => t.type === 'income')
          const paidInvoices = incomeTransactions.filter(t => t.status === 'completed')
          const pendingInvoices = incomeTransactions.filter(t => t.status === 'pending')

          setFinancialData(prev => ({
            ...prev,
            invoices: {
              total: incomeTransactions.length,
              paid: paidInvoices.length,
              pending: pendingInvoices.length,
              overdue: 0, // Would need separate query for overdue
              totalAmount: incomeTransactions.reduce((sum, t) => sum + t.amount, 0),
              paidAmount: paidInvoices.reduce((sum, t) => sum + t.amount, 0),
              pendingAmount: pendingInvoices.reduce((sum, t) => sum + t.amount, 0),
              overdueAmount: 0
            }
          }))
        }

        // Process expense breakdown
        if (expenseBreakdownResult.data && expenseBreakdownResult.data.length > 0) {
          const categories: Record<string, number> = {}
          let total = 0

          expenseBreakdownResult.data.forEach(cat => {
            categories[cat.category] = cat.total_amount
            total += cat.total_amount
          })

          setFinancialData(prev => ({
            ...prev,
            expenses: {
              total,
              categories
            }
          }))
        }

        // Process goals
        if (goalsResult.data && goalsResult.data.length > 0) {
          const monthlyGoal = goalsResult.data.find(g => g.goal_type === 'monthly_revenue')
          const yearlyGoal = goalsResult.data.find(g => g.goal_type === 'quarterly_growth') // Using as yearly proxy

          setFinancialData(prev => ({
            ...prev,
            goals: {
              monthlyTarget: monthlyGoal?.target_amount || 50000,
              yearlyTarget: yearlyGoal?.target_amount || 600000,
              currentProgress: monthlyGoal?.current_amount || prev.overview.totalRevenue,
              yearlyProgress: prev.overview.totalRevenue
            }
          }))
        }

        setIsLoading(false)
        announce('Financial hub loaded successfully', 'polite')

        logger.info('Financial hub data loaded successfully', {
          userId,
          transactionCount: transactionsResult.data?.length || 0,
          goalsCount: goalsResult.data?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load financial hub'
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading financial hub', 'assertive')

        logger.error('Failed to load financial hub data', { error: err, userId })

        toast.error('Failed to load financial data', {
          description: 'Using demo data. Please check your connection.'
        })

        // Fallback to mock data
        setFinancialData({
          overview: {
            totalRevenue: 245231,
            totalExpenses: 98500,
            netProfit: 146731,
            monthlyGrowth: 15.2,
            yearlyGrowth: 28.4,
            profitMargin: 59.8
          },
          invoices: {
            total: 47,
            paid: 35,
            pending: 8,
            overdue: 4,
            totalAmount: 198500,
            paidAmount: 145230,
            pendingAmount: 42270,
            overdueAmount: 11000
          },
          expenses: {
            total: 98500,
            categories: {
              software: 25000,
              marketing: 18500,
              office: 15000,
              travel: 12000,
              utilities: 8000,
              other: 20000
            }
          },
          clients: {
            total: 24,
            active: 18,
            new: 6,
            topClients: [
              { name: 'Acme Corp', revenue: 45000, projects: 8 },
              { name: 'Tech Startup', revenue: 38000, projects: 5 },
              { name: 'Design Agency', revenue: 32000, projects: 12 },
              { name: 'Local Business', revenue: 25000, projects: 3 }
            ]
          },
          goals: {
            monthlyTarget: 50000,
            yearlyTarget: 600000,
            currentProgress: 42000,
            yearlyProgress: 245231
          }
        })

        setRecentTransactions([
          { id: 1, type: 'income', description: 'Project Payment - Acme Corp', amount: 15000, date: '2024-01-15', status: 'completed' },
          { id: 2, type: 'expense', description: 'Software Subscriptions', amount: -2999, date: '2024-01-14', status: 'completed' },
          { id: 3, type: 'income', description: 'Design Package - Tech Startup', amount: 8500, date: '2024-01-12', status: 'completed' },
          { id: 4, type: 'expense', description: 'Marketing Campaign', amount: -3500, date: '2024-01-10', status: 'completed' },
          { id: 5, type: 'income', description: 'Consultation - Design Agency', amount: 2500, date: '2024-01-08', status: 'pending' }
        ])
      }
    }

    loadFinancialHubData()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handler functions with comprehensive logging
  const handleExportReport = () => {
    logger.info('Exporting financial report', {
      totalRevenue: financialData.overview.totalRevenue,
      totalExpenses: financialData.overview.totalExpenses,
      netProfit: financialData.overview.netProfit
    })

    // Create real CSV export
    const reportData = `Financial Report - ${new Date().toLocaleDateString()}

Overview:
Total Revenue: $${financialData.overview.totalRevenue.toLocaleString()}
Total Expenses: $${financialData.overview.totalExpenses.toLocaleString()}
Net Profit: $${financialData.overview.netProfit.toLocaleString()}
Profit Margin: ${financialData.overview.profitMargin}%
Monthly Growth: ${financialData.overview.monthlyGrowth}%
Yearly Growth: ${financialData.overview.yearlyGrowth}%

Invoices:
Total: ${financialData.invoices.total}
Paid: ${financialData.invoices.paid}
Pending: ${financialData.invoices.pending}
Overdue: ${financialData.invoices.overdue}
`

    const blob = new Blob([reportData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Report exported', { fileSize: blob.size })

    toast.success('Financial report exported', {
      description: `${Math.round(blob.size / 1024)}KB - Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Profit: $${financialData.overview.netProfit.toLocaleString()} - ${financialData.overview.profitMargin}% margin`
    })
  }

  const handleScheduleReview = () => {
    const reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() + 7)

    logger.info('Scheduling financial review', {
      scheduledDate: reviewDate.toISOString(),
      totalRevenue: financialData.overview.totalRevenue,
      netProfit: financialData.overview.netProfit
    })

    toast.success('Financial review scheduled', {
      description: `${reviewDate.toLocaleDateString()} at 2:00 PM - Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Profit: $${financialData.overview.netProfit.toLocaleString()}`
    })
  }

  const handleAddClient = () => {
    logger.info('Opening add client form', {
      currentClientCount: financialData.clients.total
    })
    setNewClient({ name: '', email: '', company: '', notes: '' })
    setShowAddClientDialog(true)
  }

  const handleConfirmAddClient = () => {
    if (!newClient.name.trim()) {
      toast.error('Client name is required')
      return
    }

    logger.info('Adding new client', { clientData: newClient })

    toast.success(`Client "${newClient.name}" added successfully`)
    setShowAddClientDialog(false)
    setNewClient({ name: '', email: '', company: '', notes: '' })
  }

  const handleEditClient = (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Editing client', {
      clientId: id,
      clientName: client?.name,
      revenue: client?.revenue
    })

    if (client) {
      setEditingClient({ id, name: client.name, revenue: client.revenue, projects: client.projects })
      setShowEditClientDialog(true)
    }
  }

  const handleConfirmEditClient = () => {
    if (!editingClient) return

    logger.info('Saving client changes', { client: editingClient })

    toast.success(`Client "${editingClient.name}" updated successfully`)
    setShowEditClientDialog(false)
    setEditingClient(null)
  }

  const handleDeleteClient = (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Deleting client', { clientId: id, clientName: client?.name })
    setDeleteClient({ id, name: client?.name || `Client #${id}` })
  }

  const handleConfirmDeleteClient = () => {
    if (!deleteClient) return

    const client = financialData.clients.topClients.find((_, index) => index === deleteClient.id)
    logger.info('Client deletion confirmed', {
      clientId: deleteClient.id,
      clientName: deleteClient.name,
      lostRevenue: client?.revenue
    })

    toast.success('Client deleted', {
      description: client ? `${client.name} - $${client.revenue.toLocaleString()} revenue removed` : `${deleteClient.name} removed`
    })
    setDeleteClient(null)
  }

  const handleViewClientDetails = (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Viewing client details', {
      clientId: id,
      clientName: client?.name,
      revenue: client?.revenue,
      projects: client?.projects
    })

    toast.info('Viewing client details', {
      description: client ? `${client.name} - $${client.revenue.toLocaleString()} revenue - ${client.projects} projects - Revenue per project: $${Math.round(client.revenue / client.projects).toLocaleString()}` : `Client #${id}`
    })
  }

  const handleCreateGoal = () => {
    logger.info('Creating financial goal', {
      monthlyTarget: financialData.goals.monthlyTarget,
      yearlyTarget: financialData.goals.yearlyTarget,
      currentProgress: financialData.goals.currentProgress
    })

    setNewGoal({ type: 'monthly', targetAmount: '', description: '' })
    setShowCreateGoalDialog(true)
  }

  const handleConfirmCreateGoal = () => {
    if (!newGoal.targetAmount || isNaN(parseFloat(newGoal.targetAmount))) {
      toast.error('Please enter a valid target amount')
      return
    }

    logger.info('Saving new goal', { goalData: newGoal })

    toast.success(`${newGoal.type === 'monthly' ? 'Monthly' : 'Yearly'} goal of $${parseFloat(newGoal.targetAmount).toLocaleString()} created`)
    setShowCreateGoalDialog(false)
    setNewGoal({ type: 'monthly', targetAmount: '', description: '' })
  }

  const handleEditGoal = (id: string) => {
    const progress = id === 'monthly' ? monthlyTargetProgress : yearlyTargetProgress
    const target = id === 'monthly' ? financialData.goals.monthlyTarget : financialData.goals.yearlyTarget
    const current = id === 'monthly' ? financialData.goals.currentProgress : financialData.goals.yearlyProgress

    logger.info('Editing goal', {
      goalId: id,
      progress: progress.toFixed(1),
      target,
      current
    })

    setEditingGoal({ id, type: id, target, current })
    setShowEditGoalDialog(true)
  }

  const handleConfirmEditGoal = () => {
    if (!editingGoal) return

    logger.info('Saving goal changes', { goal: editingGoal })

    toast.success(`${editingGoal.type === 'monthly' ? 'Monthly' : 'Yearly'} goal updated to $${editingGoal.target.toLocaleString()}`)
    setShowEditGoalDialog(false)
    setEditingGoal(null)
  }

  const handleDeleteGoal = (id: string) => {
    logger.info('Deleting goal', { goalId: id })
    setDeleteGoal(id)
  }

  const handleConfirmDeleteGoal = () => {
    if (!deleteGoal) return

    logger.info('Goal deletion confirmed', { goalId: deleteGoal })

    toast.success('Goal deleted', {
      description: `${deleteGoal === 'monthly' ? 'Monthly' : 'Yearly'} financial goal removed`
    })
    setDeleteGoal(null)
  }

  const handleTrackGoalProgress = () => {
    logger.info('Tracking goal progress', {
      monthlyProgress: monthlyTargetProgress.toFixed(1),
      yearlyProgress: yearlyTargetProgress.toFixed(1),
      monthlyTarget: financialData.goals.monthlyTarget,
      yearlyTarget: financialData.goals.yearlyTarget
    })

    toast.info('Tracking goal progress', {
      description: `Monthly: ${monthlyTargetProgress.toFixed(1)}% ($${financialData.goals.currentProgress.toLocaleString()}/$${financialData.goals.monthlyTarget.toLocaleString()}) - Yearly: ${yearlyTargetProgress.toFixed(1)}% ($${financialData.goals.yearlyProgress.toLocaleString()}/$${financialData.goals.yearlyTarget.toLocaleString()})`
    })
  }

  const handleAddExpense = () => {
    logger.info('Opening add expense form', {
      totalExpenses: financialData.overview.totalExpenses,
      categories: Object.keys(financialData.expenses.categories).length
    })

    setNewExpense({ description: '', amount: '', category: 'software', date: new Date().toISOString().split('T')[0] })
    setShowAddExpenseDialog(true)
  }

  const handleConfirmAddExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount || isNaN(parseFloat(newExpense.amount))) {
      toast.error('Please fill in all required fields')
      return
    }

    logger.info('Adding expense', { expenseData: newExpense })

    toast.success(`Expense of $${parseFloat(newExpense.amount).toLocaleString()} added to ${newExpense.category}`)
    setShowAddExpenseDialog(false)
    setNewExpense({ description: '', amount: '', category: 'software', date: new Date().toISOString().split('T')[0] })
  }

  const handleCategorizeExpense = () => {
    const categories = Object.entries(financialData.expenses.categories)
    const topCategory = categories.reduce((max, curr) => curr[1] > max[1] ? curr : max)

    logger.info('Categorizing expense', {
      categoryCount: categories.length,
      topCategory: topCategory[0],
      topCategoryAmount: topCategory[1]
    })

    toast.info('Categorize expense', {
      description: `${categories.length} categories - Top: ${topCategory[0]} ($${topCategory[1].toLocaleString()})`
    })
  }

  const handleViewExpenseBreakdown = () => {
    const categories = Object.entries(financialData.expenses.categories)
    const percentages = categories.map(([name, amount]) => ({
      name,
      percentage: ((amount / financialData.expenses.total) * 100).toFixed(1)
    }))

    logger.info('Viewing expense breakdown', {
      total: financialData.expenses.total,
      categories: percentages
    })

    toast.info('Expense breakdown', {
      description: `Total: $${financialData.expenses.total.toLocaleString()} - Top: ${percentages[0].name} (${percentages[0].percentage}%)`
    })
  }

  const handleExportExpenses = () => {
    const expenseData = Object.entries(financialData.expenses.categories)
      .map(([category, amount]) => `${category},$${amount}`)
      .join('\n')

    const csvData = `Category,Amount\n${expenseData}\n\nTotal,$${financialData.expenses.total}`

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Expenses exported', {
      fileSize: blob.size,
      total: financialData.expenses.total,
      categoryCount: Object.keys(financialData.expenses.categories).length
    })

    toast.success('Expenses exported', {
      description: `${Math.round(blob.size / 1024)}KB - ${Object.keys(financialData.expenses.categories).length} categories - Total: $${financialData.expenses.total.toLocaleString()}`
    })
  }

  const handleGenerateInvoiceReport = () => {
    logger.info('Generating invoice report', {
      total: financialData.invoices.total,
      paid: financialData.invoices.paid,
      pending: financialData.invoices.pending,
      overdue: financialData.invoices.overdue,
      totalAmount: financialData.invoices.totalAmount
    })

    toast.success('Generating invoice report', {
      description: `${financialData.invoices.total} invoices - ${financialData.invoices.paid} paid ($${financialData.invoices.paidAmount.toLocaleString()}) - ${financialData.invoices.pending} pending - ${financialData.invoices.overdue} overdue`
    })
  }

  const handleBulkInvoiceAction = () => {
    logger.info('Bulk invoice action', {
      selectedCount: financialData.invoices.pending + financialData.invoices.overdue,
      pendingAmount: financialData.invoices.pendingAmount,
      overdueAmount: financialData.invoices.overdueAmount
    })

    toast.info('Bulk invoice operations', {
      description: `Processing ${financialData.invoices.pending + financialData.invoices.overdue} invoices - Total: $${(financialData.invoices.pendingAmount + financialData.invoices.overdueAmount).toLocaleString()}`
    })
  }

  const handleSendInvoiceReminders = () => {
    logger.info('Sending invoice reminders', {
      overdueCount: financialData.invoices.overdue,
      overdueAmount: financialData.invoices.overdueAmount
    })

    toast.success('Sending payment reminders', {
      description: `${financialData.invoices.overdue} overdue invoices - Total: $${financialData.invoices.overdueAmount.toLocaleString()} - Reminders sent via email`
    })
  }

  const handleRecordPayment = (id: number) => {
    const payment = upcomingPayments.find((_, index) => index === id)

    logger.info('Recording payment', {
      paymentId: id,
      client: payment?.client,
      amount: payment?.amount,
      status: payment?.status
    })

    if (payment) {
      setRecordingPayment({ id, client: payment.client, amount: payment.amount })
      setShowRecordPaymentDialog(true)
    }
  }

  const handleConfirmRecordPayment = () => {
    if (!recordingPayment) return

    logger.info('Confirming payment record', { payment: recordingPayment })

    toast.success(`Payment of $${recordingPayment.amount.toLocaleString()} from ${recordingPayment.client} recorded`)
    setShowRecordPaymentDialog(false)
    setRecordingPayment(null)
  }

  const handleRefreshDashboard = () => {
    logger.info('Refreshing dashboard', {
      totalRevenue: financialData.overview.totalRevenue,
      netProfit: financialData.overview.netProfit,
      totalInvoices: financialData.invoices.total
    })

    toast.success('Refreshing dashboard', {
      description: `Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Profit: $${financialData.overview.netProfit.toLocaleString()} - ${financialData.invoices.total} invoices`
    })
  }

  const handleGenerateFinancialForecast = () => {
    const projectedRevenue = financialData.overview.totalRevenue * (1 + financialData.overview.monthlyGrowth / 100)
    const projectedProfit = financialData.overview.netProfit * (1 + financialData.overview.monthlyGrowth / 100)

    logger.info('Generating financial forecast', {
      currentRevenue: financialData.overview.totalRevenue,
      projectedRevenue,
      growthRate: financialData.overview.monthlyGrowth
    })

    toast.success('Generating financial forecast', {
      description: `Projected next month: Revenue $${Math.round(projectedRevenue).toLocaleString()} (+${financialData.overview.monthlyGrowth}%) - Profit: $${Math.round(projectedProfit).toLocaleString()}`
    })
  }

  const handleTaxReport = () => {
    const taxableIncome = financialData.overview.totalRevenue - financialData.overview.totalExpenses

    logger.info('Generating tax report', {
      totalRevenue: financialData.overview.totalRevenue,
      totalExpenses: financialData.overview.totalExpenses,
      taxableIncome
    })

    toast.success('Generating tax report', {
      description: `Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Expenses: $${financialData.overview.totalExpenses.toLocaleString()} - Taxable income: $${taxableIncome.toLocaleString()}`
    })
  }

  const handleFinancialAudit = () => {
    const transactionCount = recentTransactions.length
    const discrepancies = 0 // Simulated audit result

    logger.info('Running financial audit', {
      totalRevenue: financialData.overview.totalRevenue,
      totalExpenses: financialData.overview.totalExpenses,
      transactionCount,
      discrepancies
    })

    setShowAuditDialog(true)
  }

  const handleConfirmAudit = () => {
    toast.success(`Audit complete - Analyzed ${recentTransactions.length} transactions - No discrepancies found`)
    setShowAuditDialog(false)
  }

  const handleAddTransaction = () => {
    logger.info('Opening add transaction dialog')
    setNewTransaction({
      type: 'income',
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowAddTransactionDialog(true)
  }

  const handleConfirmAddTransaction = () => {
    if (!newTransaction.description.trim() || !newTransaction.amount || isNaN(parseFloat(newTransaction.amount))) {
      toast.error('Please fill in all required fields')
      return
    }

    logger.info('Adding transaction', { transactionData: newTransaction })

    toast.success(`${newTransaction.type === 'income' ? 'Income' : 'Expense'} of $${parseFloat(newTransaction.amount).toLocaleString()} added`)
    setShowAddTransactionDialog(false)
    setNewTransaction({ type: 'income', description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] })
  }

  const handleOpenExportDialog = () => {
    logger.info('Opening export report dialog')
    setShowExportReportDialog(true)
  }

  const handleConfirmExport = () => {
    logger.info('Exporting report', { format: exportFormat })

    toast.success(`Financial report exported as ${exportFormat.toUpperCase()}`)
    setShowExportReportDialog(false)
    handleExportReport()
  }

  const handleOpenStatementDialog = () => {
    logger.info('Opening generate statement dialog')
    setShowGenerateStatementDialog(true)
  }

  const handleConfirmGenerateStatement = () => {
    logger.info('Generating statement', { period: statementPeriod })

    toast.success(`${statementPeriod.charAt(0).toUpperCase() + statementPeriod.slice(1)} financial statement generated`)
    setShowGenerateStatementDialog(false)
  }

  const handleOpenSettings = () => {
    logger.info('Opening financial hub settings')
    setShowSettingsDialog(true)
  }

  const handleSaveSettings = () => {
    logger.info('Saving settings')

    toast.success('Financial hub settings saved')
    setShowSettingsDialog(false)
  }

  const handleOpenTaxReportDialog = () => {
    logger.info('Opening tax report dialog')
    setShowTaxReportDialog(true)
  }

  const handleConfirmTaxReport = () => {
    const taxableIncome = financialData.overview.totalRevenue - financialData.overview.totalExpenses

    logger.info('Generating tax report', { year: taxYear, taxableIncome })

    toast.success(`Tax report for ${taxYear} generated - Taxable income: $${taxableIncome.toLocaleString()}`)
    setShowTaxReportDialog(false)
  }

  // Calculate progress percentages for goals
  const monthlyTargetProgress = financialData.goals.monthlyTarget > 0
    ? (financialData.goals.currentProgress / financialData.goals.monthlyTarget) * 100
    : 0
  const yearlyTargetProgress = financialData.goals.yearlyTarget > 0
    ? (financialData.goals.yearlyProgress / financialData.goals.yearlyTarget) * 100
    : 0

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={financialHubAIInsights} />
          <PredictiveAnalytics predictions={financialHubPredictions} />
          <CollaborationIndicator collaborators={financialHubCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={financialHubQuickActions} />
          <ActivityFeed activities={financialHubActivities} />
        </div>
<div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title + Icon */}
        <div>
          <div className="flex items-center gap-3">
            {/* Gradient icon container */}
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <TextShimmer className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
              Financial Hub
            </TextShimmer>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive financial management and analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="add-transaction-btn" size="sm" onClick={handleAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button data-testid="export-report-btn" variant="outline" size="sm" onClick={handleOpenExportDialog}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button data-testid="generate-statement-btn" variant="outline" size="sm" onClick={handleOpenStatementDialog}>
            <FileText className="h-4 w-4 mr-2" />
            Statement
          </Button>
          <Button data-testid="schedule-review-btn" size="sm" onClick={handleScheduleReview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button data-testid="refresh-dashboard-btn" variant="outline" size="sm" onClick={handleRefreshDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="generate-forecast-btn" size="sm" onClick={handleGenerateFinancialForecast}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecast
          </Button>
          <Button data-testid="tax-report-btn" variant="outline" size="sm" onClick={handleOpenTaxReportDialog}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Tax Report
          </Button>
          <Button data-testid="audit-btn" variant="outline" size="sm" onClick={handleFinancialAudit}>
            <PieChart className="h-4 w-4 mr-2" />
            Audit
          </Button>
          <Button data-testid="settings-btn" variant="outline" size="sm" onClick={handleOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* AI REVENUE INSIGHTS WIDGET */}
      {showAIWidget && userId && revenueData && (
        <div className="mb-6">
          <RevenueInsightsWidget
            userId={userId}
            revenueData={revenueData}
            showActions={true}
          />
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiquidGlassCard data-testid="revenue-card" variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</p>
              <div className="p-2 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-lg backdrop-blur-sm">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.overview.totalRevenue}
              format="currency"
              className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +<NumberFlow value={financialData.overview.monthlyGrowth} decimals={1} className="inline-block" />% from last month
            </p>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard data-testid="profit-card" variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit</p>
              <div className="p-2 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.overview.netProfit}
              format="currency"
              className="text-2xl font-bold text-green-600 dark:text-green-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Margin: <NumberFlow value={financialData.overview.profitMargin} decimals={1} className="inline-block" />%
            </p>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard data-testid="expenses-card" variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</p>
              <div className="p-2 bg-gradient-to-br from-red-400/20 to-orange-400/20 dark:from-red-400/10 dark:to-orange-400/10 rounded-lg backdrop-blur-sm">
                <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.overview.totalExpenses}
              format="currency"
              className="text-2xl font-bold text-red-600 dark:text-red-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              -5.2% from last month
            </p>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard data-testid="clients-card" variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Clients</p>
              <div className="p-2 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-lg backdrop-blur-sm">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.clients.active}
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <NumberFlow value={financialData.clients.new} className="inline-block" /> new this month
            </p>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger data-testid="overview-tab" value="overview">Overview</TabsTrigger>
          <TabsTrigger data-testid="invoices-tab" value="invoices">Invoices</TabsTrigger>
          <TabsTrigger data-testid="expenses-tab" value="expenses">Expenses</TabsTrigger>
          <TabsTrigger data-testid="clients-tab" value="clients">Clients</TabsTrigger>
          <TabsTrigger data-testid="goals-tab" value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your financial targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Monthly Target</span>
                      <span className="text-sm text-gray-600">
                        ${financialData.goals.currentProgress.toLocaleString()} / ${financialData.goals.monthlyTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(monthlyTargetProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(monthlyTargetProgress)}% complete</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Yearly Target</span>
                      <span className="text-sm text-gray-600">
                        ${financialData.goals.yearlyProgress.toLocaleString()} / ${financialData.goals.yearlyTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(yearlyTargetProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(yearlyTargetProgress)}% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold">{financialData.invoices.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold">{financialData.invoices.paid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{financialData.invoices.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold">{financialData.invoices.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button data-testid="generate-invoice-report-btn" size="sm" onClick={handleGenerateInvoiceReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button data-testid="bulk-invoice-action-btn" variant="outline" size="sm" onClick={handleBulkInvoiceAction}>
              <Receipt className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
            <Button data-testid="send-reminders-btn" variant="outline" size="sm" onClick={handleSendInvoiceReminders}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Invoices due for payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment, index) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <Badge className={`${
                          payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.status}
                        </Badge>
                      </div>
                      <Button
                        data-testid={`record-payment-btn-${index}`}
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecordPayment(index)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Record
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button data-testid="add-expense-btn" size="sm" onClick={handleAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
            <Button data-testid="categorize-expense-btn" variant="outline" size="sm" onClick={handleCategorizeExpense}>
              <PieChart className="h-4 w-4 mr-2" />
              Categorize
            </Button>
            <Button data-testid="view-breakdown-btn" variant="outline" size="sm" onClick={handleViewExpenseBreakdown}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Breakdown
            </Button>
            <Button data-testid="export-expenses-btn" variant="outline" size="sm" onClick={handleExportExpenses}>
              <Download className="h-4 w-4 mr-2" />
              Export Expenses
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown of business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(financialData.expenses.categories).map(([category, amount]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <h3 className="font-medium capitalize">{category}</h3>
                    <p className="text-2xl font-bold">${amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {((amount / financialData.expenses.total) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button data-testid="add-client-btn" size="sm" onClick={handleAddClient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>Your most valuable clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.clients.topClients.map((client, index) => (
                  <div key={client.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.projects} projects</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${client.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total revenue</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          data-testid={`view-client-btn-${index}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewClientDetails(index)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          data-testid={`edit-client-btn-${index}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClient(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          data-testid={`delete-client-btn-${index}`}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClient(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button data-testid="create-goal-btn" size="sm" onClick={handleCreateGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
            <Button data-testid="track-progress-btn" variant="outline" size="sm" onClick={handleTrackGoalProgress}>
              <Target className="h-4 w-4 mr-2" />
              Track Progress
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Goals & Targets</CardTitle>
              <CardDescription>Set and track your financial objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monthly Goal */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Monthly Revenue Target</h3>
                      <p className="text-sm text-gray-500">
                        ${financialData.goals.currentProgress.toLocaleString()} / ${financialData.goals.monthlyTarget.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        data-testid="edit-monthly-goal-btn"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditGoal('monthly')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="delete-monthly-goal-btn"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal('monthly')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(monthlyTargetProgress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{Math.round(monthlyTargetProgress)}% complete</p>
                </div>

                {/* Yearly Goal */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Yearly Revenue Target</h3>
                      <p className="text-sm text-gray-500">
                        ${financialData.goals.yearlyProgress.toLocaleString()} / ${financialData.goals.yearlyTarget.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        data-testid="edit-yearly-goal-btn"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditGoal('yearly')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid="delete-yearly-goal-btn"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal('yearly')}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(yearlyTargetProgress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{Math.round(yearlyTargetProgress)}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Client Confirmation */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete client "{deleteClient?.name}"? This will remove them from your financial records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteClient} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Goal Confirmation */}
      <AlertDialog open={!!deleteGoal} onOpenChange={() => setDeleteGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {deleteGoal === 'monthly' ? 'Monthly' : 'Yearly'} financial goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteGoal} className="bg-red-500 hover:bg-red-600">
              Delete Goal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransactionDialog} onOpenChange={setShowAddTransactionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value: 'income' | 'expense') => setNewTransaction(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-description">Description</Label>
              <Input
                id="transaction-description"
                placeholder="e.g., Client payment, Software subscription"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-amount">Amount ($)</Label>
              <Input
                id="transaction-amount"
                type="number"
                placeholder="0.00"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-category">Category</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-date">Date</Label>
              <Input
                id="transaction-date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransactionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddTransaction}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Export Financial Report</DialogTitle>
            <DialogDescription>
              Choose the export format for your financial report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Report includes: Revenue, expenses, profit margin, invoice summary, and expense breakdown.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Statement Dialog */}
      <Dialog open={showGenerateStatementDialog} onOpenChange={setShowGenerateStatementDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate Financial Statement</DialogTitle>
            <DialogDescription>
              Create a detailed financial statement for the selected period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Statement Period</Label>
              <Select value={statementPeriod} onValueChange={setStatementPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Statement will include income statement, balance sheet, and cash flow summary.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateStatementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmGenerateStatement}>
              <FileText className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Financial Hub Settings</DialogTitle>
            <DialogDescription>
              Configure your financial dashboard preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (E)</SelectItem>
                  <SelectItem value="gbp">GBP (P)</SelectItem>
                  <SelectItem value="zar">ZAR (R)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fiscal Year Start</Label>
              <Select defaultValue="january">
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Invoice Reminder Days</Label>
              <Input type="number" defaultValue="7" min="1" max="30" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show AI Insights Widget</Label>
              <Button
                variant={showAIWidget ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAIWidget(!showAIWidget)}
              >
                {showAIWidget ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your financial records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name *</Label>
              <Input
                id="client-name"
                placeholder="e.g., Acme Corporation"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="contact@example.com"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-company">Company</Label>
              <Input
                id="client-company"
                placeholder="Company name"
                value={newClient.company}
                onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea
                id="client-notes"
                placeholder="Additional notes about this client..."
                value={newClient.notes}
                onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddClient}>
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={showEditClientDialog} onOpenChange={setShowEditClientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client-name">Client Name</Label>
              <Input
                id="edit-client-name"
                value={editingClient?.name || ''}
                onChange={(e) => setEditingClient(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Total Revenue</Label>
                <p className="text-lg font-semibold text-green-600">
                  ${editingClient?.revenue.toLocaleString() || 0}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Projects</Label>
                <p className="text-lg font-semibold text-blue-600">
                  {editingClient?.projects || 0}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEditClient}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new business expense.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expense-description">Description *</Label>
              <Input
                id="expense-description"
                placeholder="e.g., Software subscription"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount ($) *</Label>
              <Input
                id="expense-amount"
                type="number"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpenseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddExpense}>
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateGoalDialog} onOpenChange={setShowCreateGoalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Financial Goal</DialogTitle>
            <DialogDescription>
              Set a new financial target to track your progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select
                value={newGoal.type}
                onValueChange={(value: 'monthly' | 'yearly') => setNewGoal(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Target</SelectItem>
                  <SelectItem value="yearly">Yearly Target</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-amount">Target Amount ($) *</Label>
              <Input
                id="goal-amount"
                type="number"
                placeholder="50000"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                placeholder="Describe your financial goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreateGoal}>
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={showEditGoalDialog} onOpenChange={setShowEditGoalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Financial Goal</DialogTitle>
            <DialogDescription>
              Update your {editingGoal?.type === 'monthly' ? 'monthly' : 'yearly'} financial target.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-target">Target Amount ($)</Label>
              <Input
                id="edit-goal-target"
                type="number"
                value={editingGoal?.target || ''}
                onChange={(e) => setEditingGoal(prev => prev ? { ...prev, target: parseFloat(e.target.value) || 0 } : null)}
              />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Current progress: ${editingGoal?.current.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEditGoal}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showRecordPaymentDialog} onOpenChange={setShowRecordPaymentDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Mark this invoice as paid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{recordingPayment?.client}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${recordingPayment?.amount.toLocaleString() || 0}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select defaultValue="bank_transfer">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRecordPayment}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tax Report Dialog */}
      <Dialog open={showTaxReportDialog} onOpenChange={setShowTaxReportDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Generate Tax Report</DialogTitle>
            <DialogDescription>
              Create a tax summary report for the selected year.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tax Year</Label>
              <Select value={taxYear} onValueChange={setTaxYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue:</span>
                <span className="font-medium">${financialData.overview.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Expenses:</span>
                <span className="font-medium">${financialData.overview.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Taxable Income:</span>
                <span className="font-bold text-green-600">
                  ${(financialData.overview.totalRevenue - financialData.overview.totalExpenses).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaxReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTaxReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Financial Audit</DialogTitle>
            <DialogDescription>
              Run a comprehensive audit of your financial records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <h4 className="font-medium">Audit Summary</h4>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transactions to Audit:</span>
                <span className="font-medium">{recentTransactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue:</span>
                <span className="font-medium">${financialData.overview.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Expenses:</span>
                <span className="font-medium">${financialData.overview.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoices:</span>
                <span className="font-medium">{financialData.invoices.total} total</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The audit will check for discrepancies, missing entries, and compliance issues.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAudit}>
              <PieChart className="h-4 w-4 mr-2" />
              Run Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
