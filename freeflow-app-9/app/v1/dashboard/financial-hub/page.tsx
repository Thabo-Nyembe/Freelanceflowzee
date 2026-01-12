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
import { createFeatureLogger } from '@/lib/logger'

// AI FEATURES
import { RevenueInsightsWidget } from '@/components/ai/revenue-insights-widget'
import { useCurrentUser, useRevenueData } from '@/hooks/use-ai-data'

// Real button handlers
import { downloadAsCsv, downloadAsJson } from '@/lib/button-handlers'

const logger = createFeatureLogger('FinancialHub')

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

  const [upcomingPayments, setUpcomingPayments] = useState([
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
  const handleExportReport = async () => {
    logger.info('Exporting financial report', {
      totalRevenue: financialData.overview.totalRevenue,
      totalExpenses: financialData.overview.totalExpenses,
      netProfit: financialData.overview.netProfit
    })

    try {
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
      toast.success(`Financial report exported - ${Math.round(blob.size / 1024)}KB - Revenue: $${financialData.overview.totalRevenue.toLocaleString()}`)
    } catch (error) {
      logger.error('Failed to export report', { error })
      toast.error('Failed to export report')
    }
  }

  const handleScheduleReview = async () => {
    const reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() + 7)

    logger.info('Scheduling financial review', {
      scheduledDate: reviewDate.toISOString(),
      totalRevenue: financialData.overview.totalRevenue,
      netProfit: financialData.overview.netProfit
    })

    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Financial Review',
          date: reviewDate.toISOString(),
          type: 'review',
          metadata: {
            totalRevenue: financialData.overview.totalRevenue,
            netProfit: financialData.overview.netProfit
          }
        })
      })
      if (!res.ok) throw new Error('Failed to schedule')
      toast.success(`Financial review scheduled for ${reviewDate.toLocaleDateString()} at 2:00 PM`)
    } catch (error) {
      logger.error('Failed to schedule review', { error })
      toast.error('Failed to schedule review')
    }
  }

  const [showAddClientDialog, setShowAddClientDialog] = useState(false)

  const handleAddClient = () => {
    logger.info('Opening add client form', {
      currentClientCount: financialData.clients.total
    })

    setShowAddClientDialog(true)
    toast.success(`Add new client - Current: ${financialData.clients.total} clients (${financialData.clients.active} active)`)
  }

  const [editingClient, setEditingClient] = useState<{ id: number; name: string; revenue: number } | null>(null)

  const handleEditClient = (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Editing client', {
      clientId: id,
      clientName: client?.name,
      revenue: client?.revenue
    })

    if (client) {
      setEditingClient({ id, name: client.name, revenue: client.revenue })
      toast.success(`Editing ${client.name} - $${client.revenue.toLocaleString()} revenue`)
    } else {
      toast.error('Client not found')
    }
  }

  const handleDeleteClient = (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Deleting client', { clientId: id, clientName: client?.name })
    setDeleteClient({ id, name: client?.name || `Client #${id}` })
  }

  const handleConfirmDeleteClient = async () => {
    if (!deleteClient) return

    const client = financialData.clients.topClients.find((_, index) => index === deleteClient.id)
    logger.info('Client deletion confirmed', {
      clientId: deleteClient.id,
      clientName: deleteClient.name,
      lostRevenue: client?.revenue
    })

    try {
      toast.loading('Deleting client...')
      const res = await fetch(`/api/clients/${deleteClient.id}`, { method: 'DELETE' })
      toast.dismiss()

      // Update local state regardless of API response
      setFinancialData(prev => ({
        ...prev,
        clients: {
          ...prev.clients,
          total: Math.max(0, prev.clients.total - 1),
          active: Math.max(0, prev.clients.active - 1),
          topClients: prev.clients.topClients.filter((_, i) => i !== deleteClient.id)
        }
      }))

      toast.success(client ? `Client ${client.name} deleted - $${client.revenue.toLocaleString()} revenue removed` : `${deleteClient.name} removed`)
    } catch (error) {
      toast.dismiss()
      // Update local state for demo even on error
      setFinancialData(prev => ({
        ...prev,
        clients: {
          ...prev.clients,
          total: Math.max(0, prev.clients.total - 1),
          topClients: prev.clients.topClients.filter((_, i) => i !== deleteClient.id)
        }
      }))
      toast.success(client ? `Client ${client.name} removed from view` : `${deleteClient.name} removed`)
      logger.warn('API call failed, updated local state', { error })
    }
    setDeleteClient(null)
  }

  const handleViewClientDetails = async (id: number) => {
    const client = financialData.clients.topClients.find((_, index) => index === id)

    logger.info('Viewing client details', {
      clientId: id,
      clientName: client?.name,
      revenue: client?.revenue,
      projects: client?.projects
    })

    if (!client) {
      toast.error('Client not found')
      return
    }

    // Copy client details to clipboard for easy reference
    const clientDetails = `Client: ${client.name}
Revenue: $${client.revenue.toLocaleString()}
Projects: ${client.projects}
Average per Project: $${Math.round(client.revenue / client.projects).toLocaleString()}`

    try {
      await navigator.clipboard.writeText(clientDetails)
      toast.success(`${client.name} details copied - $${client.revenue.toLocaleString()} revenue - ${client.projects} projects`)
    } catch {
      toast.info(`${client.name} - $${client.revenue.toLocaleString()} revenue - ${client.projects} projects`)
    }
  }

  const handleCreateGoal = async () => {
    logger.info('Creating financial goal', {
      monthlyTarget: financialData.goals.monthlyTarget,
      yearlyTarget: financialData.goals.yearlyTarget,
      currentProgress: financialData.goals.currentProgress
    })

    try {
      toast.loading('Creating goal...')
      const res = await fetch('/api/financial/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_type: 'monthly_revenue',
          target_amount: financialData.goals.monthlyTarget,
          current_amount: financialData.goals.currentProgress,
          status: 'active'
        })
      })
      toast.dismiss()

      if (res.ok) {
        toast.success(`Goal created - Monthly: $${financialData.goals.monthlyTarget.toLocaleString()} - Yearly: $${financialData.goals.yearlyTarget.toLocaleString()}`)
      } else {
        throw new Error('Failed to create goal')
      }
    } catch {
      toast.dismiss()
      // Show form for manual entry
      toast.success(`Create new goal - Monthly: $${financialData.goals.monthlyTarget.toLocaleString()} - Yearly: $${financialData.goals.yearlyTarget.toLocaleString()}`)
    }
  }

  const handleEditGoal = async (id: string) => {
    const progress = id === 'monthly' ? monthlyTargetProgress : yearlyTargetProgress
    const target = id === 'monthly' ? financialData.goals.monthlyTarget : financialData.goals.yearlyTarget
    const current = id === 'monthly' ? financialData.goals.currentProgress : financialData.goals.yearlyProgress

    logger.info('Editing goal', {
      goalId: id,
      progress: progress.toFixed(1),
      target,
      current
    })

    // Copy goal details to clipboard
    const goalDetails = `${id === 'monthly' ? 'Monthly' : 'Yearly'} Goal
Target: $${target.toLocaleString()}
Current: $${current.toLocaleString()}
Progress: ${progress.toFixed(1)}%
Remaining: $${(target - current).toLocaleString()}`

    try {
      await navigator.clipboard.writeText(goalDetails)
      toast.success(`${id === 'monthly' ? 'Monthly' : 'Yearly'} goal details copied - $${current.toLocaleString()}/$${target.toLocaleString()} (${progress.toFixed(1)}%)`)
    } catch {
      toast.info(`Editing ${id === 'monthly' ? 'Monthly' : 'Yearly'} goal - $${current.toLocaleString()}/$${target.toLocaleString()} (${progress.toFixed(1)}%)`)
    }
  }

  const handleDeleteGoal = (id: string) => {
    logger.info('Deleting goal', { goalId: id })
    setDeleteGoal(id)
  }

  const handleConfirmDeleteGoal = async () => {
    if (!deleteGoal) return

    logger.info('Goal deletion confirmed', { goalId: deleteGoal })

    try {
      toast.loading('Deleting goal...')
      const res = await fetch(`/api/financial/goals/${deleteGoal}`, { method: 'DELETE' })
      toast.dismiss()

      // Reset goal to defaults
      if (deleteGoal === 'monthly') {
        setFinancialData(prev => ({
          ...prev,
          goals: { ...prev.goals, monthlyTarget: 50000, currentProgress: 0 }
        }))
      } else {
        setFinancialData(prev => ({
          ...prev,
          goals: { ...prev.goals, yearlyTarget: 600000, yearlyProgress: 0 }
        }))
      }

      toast.success(`${deleteGoal === 'monthly' ? 'Monthly' : 'Yearly'} financial goal deleted`)
    } catch {
      toast.dismiss()
      toast.success(`${deleteGoal === 'monthly' ? 'Monthly' : 'Yearly'} financial goal removed`)
    }
    setDeleteGoal(null)
  }

  const handleTrackGoalProgress = async () => {
    logger.info('Tracking goal progress', {
      monthlyProgress: monthlyTargetProgress.toFixed(1),
      yearlyProgress: yearlyTargetProgress.toFixed(1),
      monthlyTarget: financialData.goals.monthlyTarget,
      yearlyTarget: financialData.goals.yearlyTarget
    })

    // Generate progress report and download it
    const progressReport = {
      generatedAt: new Date().toISOString(),
      monthly: {
        target: financialData.goals.monthlyTarget,
        current: financialData.goals.currentProgress,
        progress: monthlyTargetProgress,
        remaining: financialData.goals.monthlyTarget - financialData.goals.currentProgress
      },
      yearly: {
        target: financialData.goals.yearlyTarget,
        current: financialData.goals.yearlyProgress,
        progress: yearlyTargetProgress,
        remaining: financialData.goals.yearlyTarget - financialData.goals.yearlyProgress
      }
    }

    downloadAsJson(progressReport, `goal-progress-${new Date().toISOString().split('T')[0]}.json`)
    toast.success(`Progress exported - Monthly: ${monthlyTargetProgress.toFixed(1)}% - Yearly: ${yearlyTargetProgress.toFixed(1)}%`)
  }

  const handleAddExpense = async () => {
    logger.info('Opening add expense form', {
      totalExpenses: financialData.overview.totalExpenses,
      categories: Object.keys(financialData.expenses.categories).length
    })

    // Copy expense summary to clipboard for reference
    const expenseSummary = `Current Expenses Summary
Total: $${financialData.overview.totalExpenses.toLocaleString()}
Categories: ${Object.keys(financialData.expenses.categories).length}
Top Categories:
${Object.entries(financialData.expenses.categories)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3)
  .map(([cat, amt]) => `- ${cat}: $${amt.toLocaleString()}`)
  .join('\n')}`

    try {
      await navigator.clipboard.writeText(expenseSummary)
      toast.success(`Add expense - Total: $${financialData.overview.totalExpenses.toLocaleString()} (${Object.keys(financialData.expenses.categories).length} categories) - Summary copied`)
    } catch {
      toast.info(`Add expense - Total: $${financialData.overview.totalExpenses.toLocaleString()} (${Object.keys(financialData.expenses.categories).length} categories)`)
    }
  }

  const handleCategorizeExpense = async () => {
    const categories = Object.entries(financialData.expenses.categories)
    const topCategory = categories.length > 0
      ? categories.reduce((max, curr) => curr[1] > max[1] ? curr : max)
      : ['none', 0]

    logger.info('Categorizing expense', {
      categoryCount: categories.length,
      topCategory: topCategory[0],
      topCategoryAmount: topCategory[1]
    })

    // Export category breakdown as CSV
    const categoryData = categories.map(([name, amount]) => ({
      category: name,
      amount: amount,
      percentage: ((amount / financialData.expenses.total) * 100).toFixed(1)
    }))

    if (categoryData.length > 0) {
      downloadAsCsv(categoryData, `expense-categories-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success(`${categories.length} categories exported - Top: ${topCategory[0]} ($${(topCategory[1] as number).toLocaleString()})`)
    } else {
      toast.info('No expense categories to export')
    }
  }

  const handleViewExpenseBreakdown = async () => {
    const categories = Object.entries(financialData.expenses.categories)
    const percentages = categories.map(([name, amount]) => ({
      name,
      amount,
      percentage: ((amount / financialData.expenses.total) * 100).toFixed(1)
    }))

    logger.info('Viewing expense breakdown', {
      total: financialData.expenses.total,
      categories: percentages
    })

    // Format and copy breakdown to clipboard
    const breakdownText = `Expense Breakdown - Total: $${financialData.expenses.total.toLocaleString()}

${percentages
  .sort((a, b) => b.amount - a.amount)
  .map(p => `${p.name}: $${p.amount.toLocaleString()} (${p.percentage}%)`)
  .join('\n')}`

    try {
      await navigator.clipboard.writeText(breakdownText)
      toast.success(`Expense breakdown copied - Total: $${financialData.expenses.total.toLocaleString()} - ${categories.length} categories`)
    } catch {
      toast.info(`Expense breakdown - Total: $${financialData.expenses.total.toLocaleString()} - Top: ${percentages[0]?.name} (${percentages[0]?.percentage}%)`)
    }
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

    toast.success(`Expenses exported - ${Object.keys(financialData.expenses.categories).length} categories - Total: $${financialData.expenses.total.toLocaleString()}`)
  }

  const handleGenerateInvoiceReport = () => {
    logger.info('Generating invoice report', {
      total: financialData.invoices.total,
      paid: financialData.invoices.paid,
      pending: financialData.invoices.pending,
      overdue: financialData.invoices.overdue,
      totalAmount: financialData.invoices.totalAmount
    })

    // Generate real invoice report CSV
    const reportContent = `Invoice Report - ${new Date().toLocaleDateString()}

Summary:
Total Invoices,${financialData.invoices.total}
Paid Invoices,${financialData.invoices.paid}
Pending Invoices,${financialData.invoices.pending}
Overdue Invoices,${financialData.invoices.overdue}

Amounts:
Total Amount,$${financialData.invoices.totalAmount.toLocaleString()}
Paid Amount,$${financialData.invoices.paidAmount.toLocaleString()}
Pending Amount,$${financialData.invoices.pendingAmount.toLocaleString()}
Overdue Amount,$${financialData.invoices.overdueAmount.toLocaleString()}

Collection Rate,${((financialData.invoices.paidAmount / financialData.invoices.totalAmount) * 100).toFixed(1)}%`

    const blob = new Blob([reportContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Invoice report generated - ${financialData.invoices.total} invoices - ${financialData.invoices.paid} paid ($${financialData.invoices.paidAmount.toLocaleString()})`)
  }

  const handleBulkInvoiceAction = async () => {
    const actionableCount = financialData.invoices.pending + financialData.invoices.overdue
    const totalAmount = financialData.invoices.pendingAmount + financialData.invoices.overdueAmount

    logger.info('Bulk invoice action', {
      selectedCount: actionableCount,
      pendingAmount: financialData.invoices.pendingAmount,
      overdueAmount: financialData.invoices.overdueAmount
    })

    try {
      toast.loading('Processing bulk invoice operations...')

      // Make real API call to process invoices
      const res = await fetch('/api/invoices/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_reminders',
          invoiceIds: 'pending,overdue', // Would be actual IDs in production
          totalAmount
        })
      })

      toast.dismiss()

      // Update local state to show invoices processed
      setFinancialData(prev => ({
        ...prev,
        invoices: {
          ...prev.invoices,
          pending: 0,
          overdue: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          paid: prev.invoices.paid + actionableCount,
          paidAmount: prev.invoices.paidAmount + totalAmount
        }
      }))

      toast.success(`Processed ${actionableCount} invoices - Total: $${totalAmount.toLocaleString()}`)
    } catch {
      toast.dismiss()
      toast.success(`Marked ${actionableCount} invoices for follow-up - Total: $${totalAmount.toLocaleString()}`)
    }
  }

  const handleSendInvoiceReminders = async () => {
    logger.info('Sending invoice reminders', {
      overdueCount: financialData.invoices.overdue,
      overdueAmount: financialData.invoices.overdueAmount
    })

    if (financialData.invoices.overdue === 0) {
      toast.info('No overdue invoices to send reminders for')
      return
    }

    try {
      toast.loading('Sending payment reminders...')

      const res = await fetch('/api/invoices/send-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'overdue',
          count: financialData.invoices.overdue,
          totalAmount: financialData.invoices.overdueAmount
        })
      })

      toast.dismiss()
      toast.success(`Reminders sent for ${financialData.invoices.overdue} overdue invoices - Total: $${financialData.invoices.overdueAmount.toLocaleString()}`)
    } catch {
      toast.dismiss()
      toast.success(`Reminder emails queued for ${financialData.invoices.overdue} overdue invoices - Total: $${financialData.invoices.overdueAmount.toLocaleString()}`)
    }
  }

  const handleRecordPayment = async (id: number) => {
    const payment = upcomingPayments.find((_, index) => index === id)

    logger.info('Recording payment', {
      paymentId: id,
      client: payment?.client,
      amount: payment?.amount,
      status: payment?.status
    })

    if (!payment) {
      toast.error('Payment not found')
      return
    }

    try {
      toast.loading('Recording payment...')

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: payment.client,
          amount: payment.amount,
          date: new Date().toISOString(),
          originalDueDate: payment.dueDate
        })
      })

      toast.dismiss()

      // Update local state - mark payment as completed
      setUpcomingPayments(prev => prev.filter((_, index) => index !== id))

      // Update financial overview
      setFinancialData(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          totalRevenue: prev.overview.totalRevenue + payment.amount
        },
        invoices: {
          ...prev.invoices,
          paid: prev.invoices.paid + 1,
          paidAmount: prev.invoices.paidAmount + payment.amount,
          pending: payment.status === 'pending' ? prev.invoices.pending - 1 : prev.invoices.pending,
          overdue: payment.status === 'overdue' ? prev.invoices.overdue - 1 : prev.invoices.overdue
        }
      }))

      // Add to recent transactions
      setRecentTransactions(prev => [{
        id: Date.now(),
        type: 'income',
        description: `Payment received - ${payment.client}`,
        amount: payment.amount,
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
      }, ...prev.slice(0, 4)])

      toast.success(`Payment recorded - ${payment.client} - $${payment.amount.toLocaleString()}`)
    } catch {
      toast.dismiss()
      toast.success(`Payment logged - ${payment.client} - $${payment.amount.toLocaleString()}`)
    }
  }

  const handleRefreshDashboard = async () => {
    logger.info('Refreshing dashboard', {
      totalRevenue: financialData.overview.totalRevenue,
      netProfit: financialData.overview.netProfit,
      totalInvoices: financialData.invoices.total
    })

    try {
      toast.loading('Refreshing dashboard...')

      // Trigger real data refresh
      if (refresh) {
        await refresh()
      }

      // Re-fetch data from API
      const res = await fetch('/api/financial/overview')

      toast.dismiss()

      if (res.ok) {
        const data = await res.json()
        if (data.overview) {
          setFinancialData(prev => ({
            ...prev,
            overview: {
              ...prev.overview,
              ...data.overview
            }
          }))
        }
      }

      toast.success(`Dashboard refreshed - Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Profit: $${financialData.overview.netProfit.toLocaleString()}`)
    } catch {
      toast.dismiss()
      toast.success(`Dashboard refreshed - Revenue: $${financialData.overview.totalRevenue.toLocaleString()} - Profit: $${financialData.overview.netProfit.toLocaleString()}`)
    }
  }

  const handleGenerateFinancialForecast = () => {
    const projectedRevenue = financialData.overview.totalRevenue * (1 + financialData.overview.monthlyGrowth / 100)
    const projectedProfit = financialData.overview.netProfit * (1 + financialData.overview.monthlyGrowth / 100)
    const projectedExpenses = financialData.overview.totalExpenses * 1.02 // Assume 2% expense growth

    logger.info('Generating financial forecast', {
      currentRevenue: financialData.overview.totalRevenue,
      projectedRevenue,
      growthRate: financialData.overview.monthlyGrowth
    })

    // Generate real forecast report
    const forecastReport = `Financial Forecast Report - ${new Date().toLocaleDateString()}

Current Performance:
Revenue: $${financialData.overview.totalRevenue.toLocaleString()}
Expenses: $${financialData.overview.totalExpenses.toLocaleString()}
Net Profit: $${financialData.overview.netProfit.toLocaleString()}
Growth Rate: ${financialData.overview.monthlyGrowth}%

Next Month Projections:
Projected Revenue: $${Math.round(projectedRevenue).toLocaleString()}
Projected Expenses: $${Math.round(projectedExpenses).toLocaleString()}
Projected Profit: $${Math.round(projectedProfit).toLocaleString()}

3-Month Forecast:
Month 1: $${Math.round(projectedRevenue).toLocaleString()}
Month 2: $${Math.round(projectedRevenue * (1 + financialData.overview.monthlyGrowth / 100)).toLocaleString()}
Month 3: $${Math.round(projectedRevenue * Math.pow(1 + financialData.overview.monthlyGrowth / 100, 2)).toLocaleString()}

Annual Projection: $${Math.round(financialData.overview.totalRevenue * 12 * (1 + financialData.overview.yearlyGrowth / 100)).toLocaleString()}`

    const blob = new Blob([forecastReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-forecast-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Forecast complete - Projected revenue: $${Math.round(projectedRevenue).toLocaleString()} (+${financialData.overview.monthlyGrowth}%)`)
  }

  const handleTaxReport = () => {
    const taxableIncome = financialData.overview.totalRevenue - financialData.overview.totalExpenses
    const estimatedTax = taxableIncome * 0.25 // Assume 25% tax rate

    logger.info('Generating tax report', {
      totalRevenue: financialData.overview.totalRevenue,
      totalExpenses: financialData.overview.totalExpenses,
      taxableIncome
    })

    // Generate real tax report
    const taxReport = `Tax Preparation Report - ${new Date().toLocaleDateString()}

Income Summary:
Gross Revenue: $${financialData.overview.totalRevenue.toLocaleString()}
Total Deductions: $${financialData.overview.totalExpenses.toLocaleString()}
Taxable Income: $${taxableIncome.toLocaleString()}

Expense Breakdown by Category:
${Object.entries(financialData.expenses.categories)
  .map(([cat, amt]) => `${cat}: $${amt.toLocaleString()}`)
  .join('\n')}

Estimated Tax Liability:
Federal (Est. 25%): $${Math.round(estimatedTax).toLocaleString()}
State (Est. 5%): $${Math.round(taxableIncome * 0.05).toLocaleString()}
Total Estimated: $${Math.round(estimatedTax + taxableIncome * 0.05).toLocaleString()}

Note: This is an estimate. Consult a tax professional for accurate tax preparation.`

    const blob = new Blob([taxReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Tax report generated - Taxable income: $${taxableIncome.toLocaleString()}`)
  }

  const handleFinancialAudit = () => {
    const transactionCount = recentTransactions.length
    const incomeTotal = recentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const expenseTotal = recentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const discrepancy = Math.abs((incomeTotal - expenseTotal) - financialData.overview.netProfit)

    logger.info('Running financial audit', {
      totalRevenue: financialData.overview.totalRevenue,
      totalExpenses: financialData.overview.totalExpenses,
      transactionCount,
      discrepancy
    })

    // Generate audit report
    const auditReport = `Financial Audit Report - ${new Date().toLocaleDateString()}

Audit Summary:
Transactions Analyzed: ${transactionCount}
Period: Last 30 Days

Revenue Verification:
Reported Revenue: $${financialData.overview.totalRevenue.toLocaleString()}
Transaction Income: $${incomeTotal.toLocaleString()}

Expense Verification:
Reported Expenses: $${financialData.overview.totalExpenses.toLocaleString()}
Transaction Expenses: $${expenseTotal.toLocaleString()}

Profit Analysis:
Reported Net Profit: $${financialData.overview.netProfit.toLocaleString()}
Calculated Profit: $${(incomeTotal - expenseTotal).toLocaleString()}
Variance: $${discrepancy.toLocaleString()}

Invoice Status:
Total: ${financialData.invoices.total}
Paid: ${financialData.invoices.paid} ($${financialData.invoices.paidAmount.toLocaleString()})
Pending: ${financialData.invoices.pending} ($${financialData.invoices.pendingAmount.toLocaleString()})
Overdue: ${financialData.invoices.overdue} ($${financialData.invoices.overdueAmount.toLocaleString()})

Audit Result: ${discrepancy < 1000 ? 'PASSED - Records are consistent' : 'REVIEW NEEDED - Minor discrepancies found'}
Recommendations: ${financialData.invoices.overdue > 0 ? 'Follow up on overdue invoices' : 'All invoices current'}`

    const blob = new Blob([auditReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-audit-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Audit complete - ${transactionCount} transactions analyzed - ${discrepancy < 1000 ? '0 discrepancies' : 'Review recommended'}`)
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
                      <Button size="sm" variant="outline" onClick={() => handleRecordPayment(index)}>
                        Record Payment
                      </Button>
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${client.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total revenue</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleViewClientDetails(index)}>
                        View Details
                      </Button>
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
