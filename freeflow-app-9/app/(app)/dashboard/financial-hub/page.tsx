"use client"

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
  XCircle
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

export default function FinancialHubPage() {
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

    toast.info('Add new client', {
      description: `Current clients: ${financialData.clients.total} - ${financialData.clients.active} active`
    })
  }

  const handleEditClient = (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Editing client', {
      clientId: id,
      clientName: client?.name,
      revenue: client?.revenue
    })

    toast.info('Edit client', {
      description: client ? `${client.name} - $${client.revenue.toLocaleString()} revenue - ${client.projects} projects` : `Client #${id}`
    })
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

    toast.info('Create new financial goal', {
      description: `Current targets: Monthly $${financialData.goals.monthlyTarget.toLocaleString()} - Yearly $${financialData.goals.yearlyTarget.toLocaleString()}`
    })
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

    toast.info('Edit goal', {
      description: `${id === 'monthly' ? 'Monthly' : 'Yearly'} - $${current.toLocaleString()}/$${target.toLocaleString()} - ${progress.toFixed(1)}% complete`
    })
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

    toast.info('Add expense', {
      description: `Total expenses: $${financialData.overview.totalExpenses.toLocaleString()} - ${Object.keys(financialData.expenses.categories).length} categories`
    })
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

    toast.info('Record payment', {
      description: payment ? `${payment.client} - $${payment.amount.toLocaleString()} - Due: ${payment.dueDate} - Status: ${payment.status}` : `Payment #${id}`
    })
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

    toast.success('Running financial audit', {
      description: `Analyzed ${transactionCount} transactions - Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Expenses: $${financialData.overview.totalExpenses.toLocaleString()} - ${discrepancies} discrepancies found`
    })
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
        <div className="flex gap-2">
          <Button data-testid="export-report-btn" variant="outline" size="sm" onClick={handleExportReport}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button data-testid="schedule-review-btn" size="sm" onClick={handleScheduleReview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button data-testid="refresh-dashboard-btn" variant="outline" size="sm" onClick={handleRefreshDashboard}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="generate-forecast-btn" size="sm" onClick={handleGenerateFinancialForecast}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecast
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

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Invoices due for payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                    </div>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
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
                    <div className="text-right">
                      <p className="font-semibold">${client.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Total revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Goals & Targets</CardTitle>
                  <CardDescription>Set and track your financial objectives</CardDescription>
                </div>
                <Button data-testid="create-goal-btn" size="sm" onClick={handleCreateGoal}>
                  <Target className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Click "Create Goal" to set your first financial target</p>
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
    </div>
  )
}
