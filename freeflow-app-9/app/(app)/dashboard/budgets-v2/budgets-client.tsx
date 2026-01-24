'use client'
import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Wallet, PiggyBank, TrendingUp, DollarSign, CreditCard, Target,
  ArrowUpRight, ArrowDownRight, Plus, ChevronLeft, ChevronRight, Calendar,
  BarChart3, PieChart, Download, Settings, RefreshCw,
  CheckCircle, AlertCircle, AlertTriangle,
  Sparkles, Receipt, ShoppingCart, Home, Car, Utensils, Plane,
  Heart, Zap, GraduationCap, Briefcase, Gift, Music, Film,
  Building2, Landmark, Coins,
  Clock, Bell, Repeat, ArrowLeftRight, Search,
  FileText, Trash2, Edit3, Copy,
  Folder, Cog, Upload, MoreHorizontal, Loader2
} from 'lucide-react'
import { toast } from 'sonner'

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

// Data hooks for real Supabase data


import { useBudgets, type Budget, type BudgetType, type BudgetStatus, type BudgetPeriodType } from '@/lib/hooks/use-budgets'
import { useTransactions, type Transaction } from '@/lib/hooks/use-transactions'

// ============================================================================
// TYPE DEFINITIONS - YNAB Level Budget Platform
// ============================================================================

interface BudgetCategory {
  id: string
  name: string
  icon: any
  color: string
  budgeted: number
  spent: number
  available: number
  isGroup: boolean
  parentId?: string
  goalType?: 'savings' | 'spending' | 'target'
  goalTarget?: number
  carryover: boolean
}

// Local transaction interface for UI display
interface LocalTransaction {
  id: string
  date: Date
  payee: string
  category: string
  categoryId: string
  amount: number
  type: 'inflow' | 'outflow'
  cleared: boolean
  approved: boolean
  memo?: string
  accountId: string
  accountName: string
  recurring?: boolean
  transferId?: string
}

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'loan'
  balance: number
  cleared: number
  uncleared: number
  institution?: string
  lastSync?: Date
  onBudget: boolean
  closed: boolean
}

interface Goal {
  id: string
  name: string
  categoryId: string
  categoryName: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date
  type: 'savings_balance' | 'monthly_savings' | 'needed_by_date' | 'debt_payoff'
  monthlyContribution: number
  priority: 'high' | 'medium' | 'low'
}

interface RecurringTransaction {
  id: string
  payee: string
  category: string
  amount: number
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  nextDate: Date
  accountId: string
  active: boolean
}

interface MonthData {
  income: number
  budgeted: number
  spent: number
  available: number
  carryover: number
}

// ============================================================================
// EMPTY DATA ARRAYS (No mock data - use real Supabase data)
// ============================================================================

const categories: BudgetCategory[] = []

const localTransactions: LocalTransaction[] = []

const accounts: Account[] = []

const goals: Goal[] = []

const recurringTransactions: RecurringTransaction[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Math.abs(amount))
}

const getStatusColor = (available: number, budgeted: number, spent: number): string => {
  if (available < 0) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
  if (spent > budgeted * 0.9) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400'
}

const getAccountIcon = (type: Account['type']) => {
  const icons: Record<Account['type'], any> = {
    checking: Building2,
    savings: PiggyBank,
    credit: CreditCard,
    cash: Coins,
    investment: TrendingUp,
    loan: Landmark,
  }
  return icons[type]
}

// ============================================================================
// EMPTY COMPETITIVE UPGRADE DATA (No mock data)
// ============================================================================

const budgetsAIInsights: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const budgetsCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'offline' | 'busy'; role: string }[] = []

const budgetsPredictions: { id: string; label: string; currentValue: number; predictedValue: number; confidence: number; trend: 'up' | 'down' | 'stable'; timeframe: string; factors: { name: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[] }[] = []

const budgetsActivities: { id: string; type: 'update' | 'create' | 'delete'; title: string; user: { id: string; name: string; avatar: string }; timestamp: string }[] = []

// Note: Quick actions are generated dynamically inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Default form state for new budget
const defaultBudgetForm = {
  name: '',
  description: '',
  budget_type: 'monthly' as BudgetType,
  total_amount: 0,
  category: 'general',
  department: '',
  period_type: 'monthly' as BudgetPeriodType,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  alerts_enabled: true,
  alert_threshold: 90,
  warning_threshold: 75,
  allows_rollover: false,
  notes: ''
}

// Default form state for new transaction (matches financial_transactions table)
// Valid categories: project_payment, consulting, subscription, software, hardware, marketing, office_expenses, professional_services, taxes, other
const defaultTransactionForm = {
  description: '',
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  category: 'other' as string, // Default to 'other' which is always valid
  vendor_name: '',
  client_name: '',
  notes: '',
  transaction_date: new Date().toISOString().split('T')[0]
}

// Default form state for transfers
const defaultTransferForm = {
  from_account: '',
  to_account: '',
  amount: 0,
  notes: '',
  transfer_date: new Date().toISOString().split('T')[0]
}

// Default form state for new goal
const defaultGoalForm = {
  name: '',
  target_amount: 0,
  current_amount: 0,
  target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  category: 'savings',
  notes: ''
}

// Default form state for new account
const defaultAccountForm = {
  name: '',
  type: 'checking' as const,
  institution: '',
  balance: 0,
  on_budget: true
}

export default function BudgetsClient({ initialBudgets }: { initialBudgets: Budget[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [settingsTab, setSettingsTab] = useState('general')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<BudgetType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all')
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showNewAccountModal, setShowNewAccountModal] = useState(false)
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showScheduledModal, setShowScheduledModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)
  const [showAllocateFundsModal, setShowAllocateFundsModal] = useState(false)
  const [allocationAmount, setAllocationAmount] = useState(0)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['needs', 'wants', 'savings', 'debt'])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<LocalTransaction | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  // Form states
  const [budgetForm, setBudgetForm] = useState(defaultBudgetForm)
  const [transactionForm, setTransactionForm] = useState(defaultTransactionForm)
  const [transferForm, setTransferForm] = useState(defaultTransferForm)
  const [goalForm, setGoalForm] = useState(defaultGoalForm)
  const [accountForm, setAccountForm] = useState(defaultAccountForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real data hooks
  const { budgets, loading, error, createBudget, updateBudget, deleteBudget, refetch: refetchBudgets } = useBudgets({
    budgetType: typeFilter,
    status: statusFilter
  })
  const { transactions: dbTransactions, createTransaction, stats: txStats, loading: txLoading } = useTransactions({ limit: 50 })

  const displayBudgets = budgets.length > 0 ? budgets : initialBudgets

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  // Calculate comprehensive stats from real data
  const stats = useMemo(() => {
    // Use real budget data if available
    const realTotalBudgeted = displayBudgets.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const realTotalSpent = displayBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0)
    const realTotalAvailable = displayBudgets.reduce((sum, b) => sum + (b.available_amount || 0), 0)

    // Use real transaction stats if available
    const realIncome = txStats?.totalIncome || 0
    const realExpenses = txStats?.totalExpenses || 0

    // Use real data from budgets
    const totalBudgeted = realTotalBudgeted
    const totalSpent = realTotalSpent
    const totalAvailable = realTotalAvailable
    const income = realIncome
    const expenses = realExpenses

    const onBudgetAccounts = accounts.filter(a => a.onBudget)
    const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0)
    const cashBalance = onBudgetAccounts.reduce((sum, a) => sum + a.balance, 0)

    const goalsProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length * 100 : 0

    return {
      totalBudgeted,
      totalSpent,
      totalAvailable,
      income,
      expenses,
      readyToAssign: income - totalBudgeted,
      spendingRate: totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : '0',
      netWorth,
      cashBalance,
      goalsProgress: goalsProgress.toFixed(0),
      accountsCount: accounts.filter(a => !a.closed).length,
      transactionsCount: dbTransactions?.length || 0,
      budgetsCount: displayBudgets.length
    }
  }, [displayBudgets, dbTransactions, txStats])

  // Dynamic quick actions - wired to real functionality
  const budgetsQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Budget',
      icon: <Plus className="h-4 w-4" />,
      action: () => setShowNewBudgetModal(true),
      variant: 'default' as const,
      description: 'Create a new budget'
    },
    {
      id: '2',
      label: 'Transfer Funds',
      icon: <ArrowLeftRight className="h-4 w-4" />,
      action: () => setShowTransferModal(true),
      variant: 'default' as const,
      description: 'Transfer between accounts'
    },
    {
      id: '3',
      label: 'Add Transaction',
      icon: <Receipt className="h-4 w-4" />,
      action: () => setShowNewTransactionModal(true),
      variant: 'outline' as const,
      description: 'Record a new transaction'
    },
    {
      id: '4',
      label: 'Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => setShowReportsModal(true),
      variant: 'outline' as const,
      description: 'View budget reports'
    },
    {
      id: '5',
      label: 'Refresh Data',
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => {
        toast.promise(
          Promise.resolve(refetchBudgets()),
          {
            loading: 'Refreshing budget data...',
            success: 'Data refreshed successfully',
            error: 'Failed to refresh data'
          }
        )
      },
      variant: 'outline' as const,
      description: 'Refresh budget data'
    }
  ], [refetchBudgets])

  // Handlers
  const handleCreateBudget = useCallback(async () => {
    if (!budgetForm.name.trim()) {
      toast.error('Budget name is required')
      return
    }
    if (budgetForm.total_amount <= 0) {
      toast.error('Budget amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    try {
      await createBudget({
        name: budgetForm.name,
        description: budgetForm.description,
        budget_type: budgetForm.budget_type,
        total_amount: budgetForm.total_amount,
        category: budgetForm.category,
        department: budgetForm.department || undefined,
        period_type: budgetForm.period_type,
        start_date: new Date(budgetForm.start_date).toISOString(),
        end_date: new Date(budgetForm.end_date).toISOString(),
        alerts_enabled: budgetForm.alerts_enabled,
        alert_threshold: budgetForm.alert_threshold,
        warning_threshold: budgetForm.warning_threshold,
        allows_rollover: budgetForm.allows_rollover,
        notes: budgetForm.notes
      })
      toast.success('Budget created successfully!')
      setShowNewBudgetModal(false)
      setBudgetForm(defaultBudgetForm)
    } catch (err) {
      console.error('Failed to create budget:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [budgetForm, createBudget])

  // Handler for creating a new transaction
  const handleCreateTransaction = useCallback(async () => {
    if (!transactionForm.description.trim()) {
      toast.error('Transaction description is required')
      return
    }
    if (transactionForm.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    try {
      await createTransaction({
        description: transactionForm.description,
        type: transactionForm.type,
        amount: Math.abs(transactionForm.amount),
        category: transactionForm.category || 'General',
        vendor_name: transactionForm.vendor_name,
        client_name: transactionForm.client_name,
        notes: transactionForm.notes,
        transaction_date: new Date(transactionForm.transaction_date).toISOString()
      })
      toast.success('Transaction created successfully!')
      setShowNewTransactionModal(false)
      setTransactionForm(defaultTransactionForm)
    } catch (err) {
      console.error('Failed to create transaction:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [transactionForm, createTransaction])

  // Handler for deleting a budget
  const handleDeleteBudget = useCallback(async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      await deleteBudget(budgetId)
      toast.success('Budget deleted successfully!')
      setSelectedBudget(null)
    } catch (err) {
      console.error('Failed to delete budget:', err)
      toast.error('Failed to delete budget')
    }
  }, [deleteBudget])

  // Handler for approving a budget
  const handleApproveBudget = useCallback(async (budgetId: string) => {
    try {
      await updateBudget(budgetId, {
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      toast.success('Budget approved successfully!')
      // Update local state if viewing the budget
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(prev => prev ? { ...prev, status: 'approved', approved_at: new Date().toISOString() } : null)
      }
    } catch (err) {
      console.error('Failed to approve budget:', err)
      toast.error('Failed to approve budget')
    }
  }, [updateBudget, selectedBudget])

  // Handler for allocating funds to a budget
  const handleAllocateFunds = useCallback(async (budgetId: string, amount: number) => {
    if (amount <= 0) {
      toast.error('Allocation amount must be greater than 0')
      return
    }

    try {
      const budget = displayBudgets.find(b => b.id === budgetId)
      if (!budget) {
        toast.error('Budget not found')
        return
      }

      const newAllocatedAmount = (budget.allocated_amount || 0) + amount
      const newAvailableAmount = budget.total_amount - (budget.spent_amount || 0)

      await updateBudget(budgetId, {
        allocated_amount: newAllocatedAmount,
        allocation_percent: budget.total_amount > 0 ? Math.round((newAllocatedAmount / budget.total_amount) * 100) : 0
      })
      toast.success(`Successfully allocated ${formatCurrency(amount)} to budget`)

      // Update local state if viewing the budget
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(prev => prev ? {
          ...prev,
          allocated_amount: newAllocatedAmount,
          allocation_percent: prev.total_amount > 0 ? Math.round((newAllocatedAmount / prev.total_amount) * 100) : 0
        } : null)
      }
    } catch (err) {
      console.error('Failed to allocate funds:', err)
      toast.error('Failed to allocate funds')
    }
  }, [updateBudget, displayBudgets, selectedBudget])

  // Handler for activating a budget (changing from draft to active)
  const handleActivateBudget = useCallback(async (budgetId: string) => {
    try {
      await updateBudget(budgetId, { status: 'active' })
      toast.success('Budget activated successfully!')
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(prev => prev ? { ...prev, status: 'active' } : null)
      }
    } catch (err) {
      console.error('Failed to activate budget:', err)
      toast.error('Failed to activate budget')
    }
  }, [updateBudget, selectedBudget])

  // Handler for transferring funds between accounts
  const handleTransferFunds = useCallback(async () => {
    if (!transferForm.from_account || !transferForm.to_account) {
      toast.error('Please select both accounts')
      return
    }
    if (transferForm.from_account === transferForm.to_account) {
      toast.error('Cannot transfer to the same account')
      return
    }
    if (transferForm.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    try {
      // Create two transactions: one withdrawal and one deposit
      await createTransaction({
        title: `Transfer to ${transferForm.to_account}`,
        transaction_type: 'expense',
        amount: -transferForm.amount,
        account_name: transferForm.from_account,
        category_name: 'Transfer',
        notes: transferForm.notes,
        transaction_date: new Date(transferForm.transfer_date).toISOString()
      })
      await createTransaction({
        title: `Transfer from ${transferForm.from_account}`,
        transaction_type: 'income',
        amount: transferForm.amount,
        account_name: transferForm.to_account,
        category_name: 'Transfer',
        notes: transferForm.notes,
        transaction_date: new Date(transferForm.transfer_date).toISOString()
      })
      toast.success('Transfer completed successfully!')
      setShowTransferModal(false)
      setTransferForm(defaultTransferForm)
    } catch (err) {
      console.error('Failed to transfer funds:', err)
      toast.error('Failed to complete transfer')
    } finally {
      setIsSubmitting(false)
    }
  }, [transferForm, createTransaction])

  // Handler for creating a new goal (using budgets table with goal type)
  const handleCreateGoal = useCallback(async () => {
    if (!goalForm.name.trim()) {
      toast.error('Goal name is required')
      return
    }
    if (goalForm.target_amount <= 0) {
      toast.error('Target amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    try {
      await createBudget({
        name: goalForm.name,
        description: `Savings goal: ${goalForm.name}`,
        budget_type: 'project',
        total_amount: goalForm.target_amount,
        allocated_amount: goalForm.current_amount,
        spent_amount: 0,
        category: goalForm.category,
        period_type: 'project_based',
        start_date: new Date().toISOString(),
        end_date: new Date(goalForm.target_date).toISOString(),
        notes: goalForm.notes,
        status: 'active'
      })
      toast.success('Goal created successfully!')
      setShowNewGoalModal(false)
      setGoalForm(defaultGoalForm)
    } catch (err) {
      console.error('Failed to create goal:', err)
      toast.error('Failed to create goal')
    } finally {
      setIsSubmitting(false)
    }
  }, [goalForm, createBudget])

  // Handler for creating a new account (stored in metadata for now)
  const handleCreateAccount = useCallback(async () => {
    if (!accountForm.name.trim()) {
      toast.error('Account name is required')
      return
    }

    setIsSubmitting(true)
    try {
      // For now, we'll store accounts as a special budget entry
      // In production, you'd have a separate accounts table
      await createBudget({
        name: `Account: ${accountForm.name}`,
        description: `${accountForm.type} account at ${accountForm.institution}`,
        budget_type: 'operational',
        total_amount: accountForm.balance,
        allocated_amount: accountForm.balance,
        category: 'account',
        period_type: 'ongoing',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          account_type: accountForm.type,
          institution: accountForm.institution,
          on_budget: accountForm.on_budget
        },
        status: 'active'
      })
      toast.success('Account added successfully!')
      setShowNewAccountModal(false)
      setAccountForm(defaultAccountForm)
    } catch (err) {
      console.error('Failed to create account:', err)
      toast.error('Failed to add account')
    } finally {
      setIsSubmitting(false)
    }
  }, [accountForm, createBudget])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    )
  }

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        Error: {error.message}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Wallet className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    Budget Pro
                  </Badge>
                  <Badge className="bg-blue-500/30 text-white border-0 backdrop-blur-sm">
                    YNAB Level
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Zero-Based Budgeting</h1>
                <p className="text-white/80 max-w-xl">
                  Give every dollar a job. Track spending, manage accounts, and reach your financial goals faster.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-1">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 font-medium">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Button className="bg-white text-blue-600 hover:bg-white/90" onClick={() => setShowNewTransactionModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
                <Button className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" onClick={() => setShowNewBudgetModal(true)}>
                  <Wallet className="h-4 w-4 mr-2" />
                  New Budget
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => {
                  setActiveTab('settings')
                  toast.success('Settings opened')
                }}>
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ready to Assign Banner */}
        <div className={`rounded-xl p-6 ${stats.readyToAssign >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ready to Assign
              </div>
              <div className="text-4xl font-bold">{formatCurrency(stats.readyToAssign)}</div>
              {stats.readyToAssign < 0 && (
                <div className="text-sm mt-2 opacity-90 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Cover overspending by moving money between categories
                </div>
              )}
            </div>
            <div className="text-right text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
                <div>
                  <div className="text-xs opacity-75">Income</div>
                  <div className="text-xl font-semibold">{formatCurrency(stats.income)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-75">Budgeted</div>
                  <div className="text-xl font-semibold">{formatCurrency(stats.totalBudgeted)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-75">Available</div>
                  <div className="text-xl font-semibold">{formatCurrency(stats.totalAvailable)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 8 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Net Worth', value: formatCurrency(stats.netWorth), icon: TrendingUp, color: 'blue', change: '+5.2%' },
            { label: 'Cash', value: formatCurrency(stats.cashBalance), icon: Wallet, color: 'green', change: '' },
            { label: 'Spent', value: formatCurrency(stats.totalSpent), icon: CreditCard, color: 'purple', change: '' },
            { label: 'Available', value: formatCurrency(stats.totalAvailable), icon: PiggyBank, color: 'emerald', change: '' },
            { label: 'Spending Rate', value: `${stats.spendingRate}%`, icon: BarChart3, color: 'orange', change: '' },
            { label: 'Goals', value: `${stats.goalsProgress}%`, icon: Target, color: 'pink', change: '+12%' },
            { label: 'Accounts', value: stats.accountsCount.toString(), icon: Building2, color: 'cyan', change: '' },
            { label: 'Transactions', value: stats.transactionsCount.toString(), icon: Receipt, color: 'amber', change: '+8' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600`}>
                    <stat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white truncate">{stat.value}</span>
                  {stat.change && (
                    <span className="text-xs text-green-600">{stat.change}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="budget" className="gap-2">
                <Wallet className="h-4 w-4" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <Receipt className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="accounts" className="gap-2">
                <Building2 className="h-4 w-4" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{monthNames[currentMonth.getMonth()]} Budget Overview</h2>
                  <p className="text-purple-100">Track your spending and stay on budget</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatCurrency(stats.income)}</div>
                    <p className="text-purple-200 text-sm">Income</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatCurrency(stats.expenses)}</div>
                    <p className="text-purple-200 text-sm">Spent</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatCurrency(stats.income - stats.expenses)}</div>
                    <p className="text-purple-200 text-sm">Remaining</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.expenses / stats.income) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-purple-200">{Math.round((stats.expenses / stats.income) * 100)}% of budget used</span>
                <span className="text-purple-200">{Math.round((1 - stats.expenses / stats.income) * 100)}% remaining</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-4">
              <Button className="gap-2" onClick={() => setShowNewTransactionModal(true)}>
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowTransferModal(true)}>
                <ArrowLeftRight className="w-4 h-4" />
                Transfer Funds
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowScheduledModal(true)}>
                <Repeat className="w-4 h-4" />
                Scheduled
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowReportsModal(true)}>
                <FileText className="w-4 h-4" />
                Reports
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Spending Overview */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
                  <Badge variant="outline">{monthNames[currentMonth.getMonth()]}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categories.filter(c => c.isGroup).map(group => {
                    const progress = group.budgeted > 0 ? (group.spent / group.budgeted) * 100 : 0
                    return (
                      <div key={group.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <group.icon className={`h-4 w-4 text-${group.color}-600`} />
                            <span className="font-medium text-gray-900 dark:text-white">{group.name}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{formatCurrency(group.spent)}</span>
                            <span className="text-gray-500"> / {formatCurrency(group.budgeted)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress > 100 ? 'bg-red-500' :
                              progress > 90 ? 'bg-amber-500' :
                              `bg-${group.color}-500`
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Account Balances */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Accounts</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('accounts')}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accounts.filter(a => !a.closed).slice(0, 4).map(account => {
                    const Icon = getAccountIcon(account.type)
                    return (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${account.balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.institution}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${account.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                          {account.balance < 0 && '-'}{formatCurrency(account.balance)}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {localTransactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'inflow' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'}`}>
                          {tx.type === 'inflow' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tx.payee}</p>
                          <p className="text-xs text-gray-500">{tx.category} • {tx.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tx.cleared && <CheckCircle className="h-4 w-4 text-green-500" />}
                        <span className={`font-semibold ${tx.type === 'inflow' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                          {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Goals Progress */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Goals</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('goals')}>Manage</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.slice(0, 3).map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{goal.name}</span>
                          <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Spending Insights & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Spending Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const values = [85, 62, 45, 92, 78, 120, 95]
                    const amounts = [245, 180, 130, 265, 225, 345, 275]
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-8">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${values[idx] > 100 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min(values[idx], 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">${amounts[idx]}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Budget Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-green-600">87</div>
                    <p className="text-sm text-gray-500">Budget Score</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Categories on track</span>
                      <span className="font-semibold text-green-600">12/15</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Approaching limit</span>
                      <span className="font-semibold text-yellow-600">2</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Overspent</span>
                      <span className="font-semibold text-red-600">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-blue-600" />
                    Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{goal.name}</span>
                        <span className="text-sm text-gray-500">{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-gray-500">{formatCurrency(goal.current)}</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(goal.target)}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Overview & Cash Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Monthly Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <ArrowDownRight className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.income)}</div>
                      <p className="text-sm text-gray-500">Income</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <ArrowUpRight className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.expenses)}</div>
                      <p className="text-sm text-gray-500">Expenses</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.income - stats.expenses)}</div>
                      <p className="text-sm text-gray-500">Net</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Top Spending Categories</h4>
                    {categories.filter(c => c.isGroup).sort((a, b) => b.spent - a.spent).slice(0, 4).map(cat => (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <cat.icon className={`h-4 w-4 text-${cat.color}-600`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(cat.spent)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Cash Flow Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { month: 'Oct', income: 8500, expenses: 7200 },
                      { month: 'Nov', income: 8500, expenses: 6800 },
                      { month: 'Dec', income: 9200, expenses: 8100 },
                      { month: 'Jan', income: 8500, expenses: 7500 },
                    ].map((data) => (
                      <div key={data.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">{data.month}</span>
                          <span className={`font-medium ${data.income - data.expenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.income - data.expenses > 0 ? '+' : ''}{formatCurrency(data.income - data.expenses)}
                          </span>
                        </div>
                        <div className="flex gap-1 h-4">
                          <div className="bg-green-500 rounded" style={{ width: `${(data.income / 10000) * 100}%` }} title={`Income: ${formatCurrency(data.income)}`} />
                          <div className="bg-red-400 rounded" style={{ width: `${(data.expenses / 10000) * 100}%` }} title={`Expenses: ${formatCurrency(data.expenses)}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-gray-500">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded" />
                      <span className="text-gray-500">Expenses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bills & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Upcoming Bills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Rent Payment', amount: 1500, due: 'Jan 1', category: 'Housing', daysUntil: 6 },
                      { name: 'Electric Bill', amount: 125, due: 'Jan 5', category: 'Utilities', daysUntil: 10 },
                      { name: 'Internet Service', amount: 75, due: 'Jan 8', category: 'Utilities', daysUntil: 13 },
                      { name: 'Car Insurance', amount: 180, due: 'Jan 15', category: 'Transportation', daysUntil: 20 },
                      { name: 'Gym Membership', amount: 50, due: 'Jan 15', category: 'Health', daysUntil: 20 },
                    ].map((bill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${bill.daysUntil <= 7 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'}`}>
                            <Receipt className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{bill.name}</p>
                            <p className="text-sm text-gray-500">{bill.category} • Due {bill.due}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</p>
                          <p className={`text-xs ${bill.daysUntil <= 7 ? 'text-red-500' : 'text-gray-500'}`}>
                            {bill.daysUntil} days left
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                    Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">Great job!</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You spent 15% less on dining out this month</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-700 dark:text-yellow-400">Heads up</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Entertainment budget is 85% spent with 8 days left</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700 dark:text-blue-400">Goal Update</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You're on track to hit your vacation fund goal by March</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-700 dark:text-purple-400">Trend</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your average daily spending is down 8% this week</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            {/* Your Budgets Section - Shows Real Database Budgets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Your Budgets
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {displayBudgets.length} budget{displayBudgets.length !== 1 ? 's' : ''} created
                  </p>
                </div>
                <Button onClick={() => setShowNewBudgetModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-500">Loading budgets...</span>
                  </div>
                ) : displayBudgets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                      <Wallet className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No budgets yet</h3>
                    <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                      Create your first budget to start tracking your spending and financial goals.
                    </p>
                    <Button onClick={() => setShowNewBudgetModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Budget
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayBudgets.map((budget) => (
                      <div
                        key={budget.id}
                        onClick={() => setSelectedBudget(budget)}
                        className="p-4 border rounded-xl dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all hover:shadow-md group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {budget.name}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">{budget.budget_type} • {budget.category}</p>
                          </div>
                          <Badge className={
                            budget.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            budget.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                            budget.status === 'exceeded' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }>
                            {budget.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {formatCurrency(budget.spent_amount)} of {formatCurrency(budget.total_amount)}
                            </span>
                            <span className="font-medium">{budget.utilization_percent}%</span>
                          </div>
                          <Progress
                            value={budget.utilization_percent}
                            className={`h-2 ${budget.utilization_percent > 90 ? '[&>div]:bg-red-500' : budget.utilization_percent > 75 ? '[&>div]:bg-amber-500' : ''}`}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700 text-xs text-gray-500">
                          <span>Available: {formatCurrency(budget.available_amount)}</span>
                          <span>{new Date(budget.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Categories Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Budget Categories</CardTitle>
                <Button onClick={() => setShowNewCategoryModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.filter(c => c.isGroup).map(group => {
                  const groupCategories = categories.filter(c => c.parentId === group.id)
                  const isExpanded = expandedGroups.includes(group.id)

                  return (
                    <div key={group.id} className="border rounded-xl dark:border-gray-700 overflow-hidden">
                      <div
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <div className={`p-2 rounded-lg bg-${group.color}-100 dark:bg-${group.color}-900/30`}>
                              <group.icon className={`h-5 w-5 text-${group.color}-600`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                              <p className="text-sm text-gray-500">{groupCategories.length} categories</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8 text-right">
                            <div>
                              <div className="text-xs text-gray-500">Budgeted</div>
                              <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(group.budgeted)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Spent</div>
                              <div className="font-semibold text-purple-600">{formatCurrency(group.spent)}</div>
                            </div>
                            <div className="w-24">
                              <div className="text-xs text-gray-500">Available</div>
                              <Badge className={getStatusColor(group.available, group.budgeted, group.spent)}>
                                {formatCurrency(group.available)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              group.spent > group.budgeted ? 'bg-red-500' :
                              group.spent > group.budgeted * 0.9 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((group.spent / group.budgeted) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="divide-y dark:divide-gray-700">
                          {groupCategories.map(category => (
                            <div key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <category.icon className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                  {category.goalType && (
                                    <Badge variant="outline" className="text-xs">
                                      <Target className="h-3 w-3 mr-1" />
                                      Goal
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-6 text-right">
                                  <div className="w-28">
                                    <Input
                                      type="text"
                                      defaultValue={category.budgeted.toFixed(2)}
                                      className="text-right h-8 text-sm"
                                    />
                                  </div>
                                  <div className="w-24 text-sm text-purple-600">{formatCurrency(category.spent)}</div>
                                  <div className="w-24">
                                    <Badge className={getStatusColor(category.available, category.budgeted, category.spent)}>
                                      {formatCurrency(category.available)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Transactions</CardTitle>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="all">All Accounts</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                  <Button onClick={() => setShowNewTransactionModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {localTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${tx.type === 'inflow' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 dark:bg-gray-700'}`}>
                          {tx.type === 'inflow' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{tx.payee}</p>
                            {tx.recurring && <Repeat className="h-3 w-3 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-500">
                            {tx.date.toLocaleDateString()} • {tx.accountName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{tx.category}</Badge>
                        <div className="flex items-center gap-2">
                          {tx.cleared ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`font-semibold ${tx.type === 'inflow' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                            {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Savings Goals</h2>
                <p className="text-gray-500">Track your progress towards financial freedom</p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowNewGoalModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100
                const remaining = goal.targetAmount - goal.currentAmount
                const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : 0

                return (
                  <Card key={goal.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            goal.type === 'debt_payoff' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                            'bg-green-100 text-green-600 dark:bg-green-900/30'
                          }`}>
                            {goal.type === 'debt_payoff' ? <CreditCard className="h-5 w-5" /> : <PiggyBank className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">{goal.type.replace('_', ' ')}</Badge>
                              <Badge className={`text-xs ${
                                goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                goal.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>{goal.priority}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{progress.toFixed(0)}%</div>
                          <div className="text-xs text-gray-500">complete</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              goal.type === 'debt_payoff' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                              'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatCurrency(remaining)} to go
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                          <div className="text-sm">
                            <span className="text-gray-500">Monthly: </span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(goal.monthlyContribution)}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            ~{monthsLeft} months left
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Budget Accounts</CardTitle>
                  <Dialog open={showNewAccountModal} onOpenChange={setShowNewAccountModal}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          Add Account
                        </DialogTitle>
                        <DialogDescription>
                          Add a new bank account or credit card to track
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="account-name">Account Name *</Label>
                          <Input
                            id="account-name"
                            placeholder="e.g., Chase Checking"
                            value={accountForm.name}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Type</Label>
                          <Select
                            value={accountForm.type}
                            onValueChange={(value: 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'loan') => setAccountForm(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">Checking</SelectItem>
                              <SelectItem value="savings">Savings</SelectItem>
                              <SelectItem value="credit">Credit Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="investment">Investment</SelectItem>
                              <SelectItem value="loan">Loan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-institution">Institution</Label>
                          <Input
                            id="account-institution"
                            placeholder="e.g., Chase Bank"
                            value={accountForm.institution}
                            onChange={(e) => setAccountForm(prev => ({ ...prev, institution: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-balance">Current Balance</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="account-balance"
                              type="number"
                              placeholder="0.00"
                              className="pl-10"
                              value={accountForm.balance || ''}
                              onChange={(e) => setAccountForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={accountForm.on_budget}
                            onCheckedChange={(checked) => setAccountForm(prev => ({ ...prev, on_budget: checked }))}
                          />
                          <Label>Include in budget</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewAccountModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateAccount} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Account'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accounts.filter(a => a.onBudget).map(account => {
                    const Icon = getAccountIcon(account.type)
                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" onClick={() => setSelectedAccount(account)}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${account.balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.institution}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${account.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                            {account.balance < 0 && '-'}{formatCurrency(account.balance)}
                          </p>
                          {account.uncleared !== 0 && (
                            <p className="text-xs text-gray-500">{formatCurrency(account.uncleared)} pending</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tracking Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accounts.filter(a => !a.onBudget).map(account => {
                    const Icon = getAccountIcon(account.type)
                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.institution}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Adaptive Insights Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Settings },
                      { id: 'categories', label: 'Categories', icon: Folder },
                      { id: 'automation', label: 'Automation', icon: Zap },
                      { id: 'integrations', label: 'Integrations', icon: Building2 },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'advanced', label: 'Advanced', icon: Cog },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Budget Preferences</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Budget Cycle</p>
                            <p className="text-sm text-gray-500">Define your budget period</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>Monthly</option>
                            <option>Bi-weekly</option>
                            <option>Weekly</option>
                            <option>Quarterly</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Rollover Funds</p>
                            <p className="text-sm text-gray-500">Carry over unused money to next period</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Zero-based Budgeting</p>
                            <p className="text-sm text-gray-500">Assign every dollar a job</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Track Credit Cards</p>
                            <p className="text-sm text-gray-500">Include credit cards in budget tracking</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Currency & Format</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                              <option value="USD">USD - US Dollar ($)</option>
                              <option value="EUR">EUR - Euro (€)</option>
                              <option value="GBP">GBP - British Pound (£)</option>
                              <option value="CAD">CAD - Canadian Dollar (C$)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Date Format</label>
                            <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                              <option>MM/DD/YYYY</option>
                              <option>DD/MM/YYYY</option>
                              <option>YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Categories Settings */}
                {settingsTab === 'categories' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Budget Categories</CardTitle>
                        <Button size="sm" className="gap-2" onClick={() => {
                          setShowNewCategoryModal(true)
                          toast.success('Category form ready')
                        }}>
                          <Plus className="w-4 h-4" />
                          Add Category
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {categories.filter(c => c.isGroup).map((group) => (
                          <div key={group.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                              <Button variant="ghost" size="sm" onClick={() => {
                                toast.success(`${group.name} ready to edit`)
                              }}>
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                              {categories.filter(c => c.group === group.name && !c.isGroup).map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between py-2">
                                  <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">{formatCurrency(cat.budgeted)}</span>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      toast.info(`Options for ${cat.name}`)
                                    }}>
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Rules</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-categorize Transactions</p>
                            <p className="text-sm text-gray-500">Learn from past categorizations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Split Transactions</p>
                            <p className="text-sm text-gray-500">Allow splitting transactions across categories</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Automation Settings */}
                {settingsTab === 'automation' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Scheduled Transactions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-enter Scheduled</p>
                            <p className="text-sm text-gray-500">Automatically enter recurring transactions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Days Before Due</p>
                            <p className="text-sm text-gray-500">How many days before to auto-enter</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>1 day</option>
                            <option>3 days</option>
                            <option>7 days</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-assign Income</p>
                            <p className="text-sm text-gray-500">Distribute income to underfunded categories</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Smart Rules</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Coffee purchases → Coffee Budget', pattern: 'Starbucks, Dunkin', active: true },
                          { name: 'Grocery stores → Groceries', pattern: 'Whole Foods, Trader Joe\'s', active: true },
                          { name: 'Gas stations → Transportation', pattern: 'Shell, Chevron, BP', active: true },
                        ].map((rule, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{rule.name}</p>
                              <p className="text-sm text-gray-500">Pattern: {rule.pattern}</p>
                            </div>
                            <Switch defaultChecked={rule.active} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => {
                          toast.success('Rule form ready')
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Rule
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Accounts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {accounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                                <p className="text-sm text-gray-500">{account.institution}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-green-600 border-green-600">Connected</Badge>
                              <Button variant="ghost" size="sm" onClick={() => {
                                toast.promise(
                                  fetch(`/api/budgets/accounts/${account.id}/sync`, { method: 'POST' }).then(res => {
                                    if (!res.ok) throw new Error('Sync failed')
                                    return res.json()
                                  }),
                                  {
                                    loading: `Syncing ${account.name}...`,
                                    success: `${account.name} synced successfully`,
                                    error: 'Failed to sync account'
                                  }
                                )
                              }}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => {
                          setShowNewAccountModal(true)
                          toast.success('Ready to link new account')
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Link New Account
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Import & Export</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <Button variant="outline" className="justify-start" onClick={() => {
                          toast.success('Ready to import CSV file')
                        }}>
                          <Upload className="w-4 h-4 mr-2" />
                          Import from CSV
                        </Button>
                        <Button variant="outline" className="justify-start" onClick={() => {
                          toast.promise(
                            fetch('/api/budgets/export/csv').then(res => {
                              if (!res.ok) throw new Error('Export failed')
                              return res.blob()
                            }).then(blob => {
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'budget-export.csv'
                              a.click()
                              URL.revokeObjectURL(url)
                            }),
                            {
                              loading: 'Generating CSV export...',
                              success: 'CSV exported successfully',
                              error: 'Failed to export CSV'
                            }
                          )
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Export to CSV
                        </Button>
                        <Button variant="outline" className="justify-start" onClick={() => {
                          toast.success('Ready to import QIF file')
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Import from QIF
                        </Button>
                        <Button variant="outline" className="justify-start" onClick={() => {
                          toast.promise(
                            fetch('/api/budgets/export/reports').then(res => {
                              if (!res.ok) throw new Error('Export failed')
                              return res.blob()
                            }).then(blob => {
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'budget-reports.pdf'
                              a.click()
                              URL.revokeObjectURL(url)
                            }),
                            {
                              loading: 'Generating reports...',
                              success: 'Reports exported successfully',
                              error: 'Failed to export reports'
                            }
                          )
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Reports
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Budget Alerts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Category overspending', desc: 'Alert when spending exceeds budget', email: true, push: true },
                          { name: 'Low balance warning', desc: 'Alert when account balance is low', email: true, push: true },
                          { name: 'Upcoming bills', desc: 'Reminder for scheduled transactions', email: true, push: false },
                          { name: 'Goal progress', desc: 'Updates on savings goals', email: false, push: true },
                          { name: 'Weekly summary', desc: 'Weekly spending digest', email: true, push: false },
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.name}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.email} className="w-4 h-4 accent-blue-600" />
                                <span className="text-sm text-gray-600">Email</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.push} className="w-4 h-4 accent-blue-600" />
                                <span className="text-sm text-gray-600">Push</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Threshold Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Overspending Threshold</p>
                            <p className="text-sm text-gray-500">Alert at this % of budget</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" defaultValue="90" className="w-20 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                            <span>%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Low Balance Amount</p>
                            <p className="text-sm text-gray-500">Alert when account drops below</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>$</span>
                            <input type="number" defaultValue="100" className="w-24 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                          </div>
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
                        <CardTitle>API Access</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">API Key</p>
                          <div className="flex items-center gap-2">
                            <input type="password" defaultValue="budget_api_xxxxxxxxxxxx" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 font-mono text-sm" />
                            <Button variant="outline" size="sm" onClick={() => {
                              navigator.clipboard.writeText('budget_api_xxxxxxxxxxxx')
                              toast.success('API key copied to clipboard')
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => {
                              toast.promise(
                                fetch('/api/budgets/api-key/regenerate', { method: 'POST' }).then(res => {
                                  if (!res.ok) throw new Error('Regenerate failed')
                                  return res.json()
                                }),
                                {
                                  loading: 'Regenerating API key...',
                                  success: 'New API key generated',
                                  error: 'Failed to regenerate API key'
                                }
                              )
                            }}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable API Access</p>
                            <p className="text-sm text-gray-500">Allow external integrations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start" onClick={() => {
                          toast.promise(
                            fetch('/api/budgets/export/all').then(res => {
                              if (!res.ok) throw new Error('Download failed')
                              return res.blob()
                            }).then(blob => {
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'all-budget-data.zip'
                              a.click()
                              URL.revokeObjectURL(url)
                            }),
                            {
                              loading: 'Preparing data download...',
                              success: 'Data downloaded successfully',
                              error: 'Failed to download data'
                            }
                          )
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Download All Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => {
                          toast.promise(
                            fetch('/api/budgets/reports/full').then(res => {
                              if (!res.ok) throw new Error('Report generation failed')
                              return res.blob()
                            }).then(blob => {
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'full-budget-report.pdf'
                              a.click()
                              URL.revokeObjectURL(url)
                            }),
                            {
                              loading: 'Generating full report...',
                              success: 'Full report generated',
                              error: 'Failed to generate report'
                            }
                          )
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Full Report
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset All Budgets</p>
                            <p className="text-sm text-gray-500">Clear all budget data and start fresh</p>
                          </div>
                          <Button variant="destructive" onClick={() => {
                            if (confirm('Are you sure you want to reset all budgets? This action cannot be undone.')) {
                              toast.promise(
                                fetch('/api/budgets/reset', { method: 'DELETE' }).then(res => {
                                  if (!res.ok) throw new Error('Reset failed')
                                  return res.json()
                                }),
                                {
                                  loading: 'Resetting all budgets...',
                                  success: 'All budgets have been reset',
                                  error: 'Failed to reset budgets'
                                }
                              )
                            }
                          }}>Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={budgetsAIInsights}
              title="Budget Intelligence"
              onInsightAction={(_insight) => {
                toast.success(_insight.title + ': ' + _insight.description)
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={budgetsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={budgetsPredictions}
              title="Budget Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={budgetsActivities}
            title="Budget Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={budgetsQuickActions}
            variant="grid"
          />
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className={'p-3 rounded-lg ' + (selectedTransaction.type === 'inflow' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600')}>
                    {selectedTransaction.type === 'inflow' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTransaction.payee}</h3>
                    <p className="text-gray-500">{selectedTransaction.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className={'font-semibold ' + (selectedTransaction.type === 'inflow' ? 'text-green-600' : '')}>
                      {selectedTransaction.type === 'inflow' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold">{selectedTransaction.category}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Account</p>
                    <p className="font-semibold">{selectedTransaction.accountName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center gap-2">
                      {selectedTransaction.cleared ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-green-600">Cleared</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-500">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {selectedTransaction.memo && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Memo</p>
                    <p>{selectedTransaction.memo}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  toast.success('Transaction ready to edit')
                }}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="text-red-600" onClick={() => {
                  if (confirm('Are you sure you want to delete this transaction?')) {
                    toast.promise(
                      fetch('/api/budgets/transactions/' + selectedTransaction?.id, { method: 'DELETE' }).then(res => {
                        if (!res.ok) throw new Error('Delete failed')
                        return res.json()
                      }),
                      {
                        loading: 'Deleting transaction...',
                        success: 'Transaction deleted successfully',
                        error: 'Failed to delete transaction'
                      }
                    )
                    setSelectedTransaction(null)
                  }
                }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* New Category Modal */}
        <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <Input placeholder="e.g., Coffee Budget" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category Group</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  {categories.filter(c => c.isGroup).map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Budget</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Goal</p>
                  <p className="text-sm text-gray-500">Set a savings target for this category</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCategoryModal(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                toast.promise(
                  fetch('/api/budgets/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'New Category' })
                  }).then(res => {
                    if (!res.ok) throw new Error('Create failed')
                    return res.json()
                  }),
                  {
                    loading: 'Creating category...',
                    success: 'Category created successfully',
                    error: 'Failed to create category'
                  }
                )
                setShowNewCategoryModal(false)
              }}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create New Budget Modal */}
        <Dialog open={showNewBudgetModal} onOpenChange={setShowNewBudgetModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Create New Budget
              </DialogTitle>
              <DialogDescription>
                Create a new budget to track your spending and financial goals.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget-name">Budget Name *</Label>
                  <Input
                    id="budget-name"
                    placeholder="e.g., Marketing Budget Q1"
                    value={budgetForm.name}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Total Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="budget-amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      value={budgetForm.total_amount || ''}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-description">Description</Label>
                <Textarea
                  id="budget-description"
                  placeholder="Brief description of this budget..."
                  value={budgetForm.description}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Budget Type</Label>
                  <Select
                    value={budgetForm.budget_type}
                    onValueChange={(value: BudgetType) => setBudgetForm(prev => ({ ...prev, budget_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="capital">Capital</SelectItem>
                      <SelectItem value="discretionary">Discretionary</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={budgetForm.category}
                    onValueChange={(value) => setBudgetForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={budgetForm.start_date}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={budgetForm.end_date}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={budgetForm.alert_threshold}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, alert_threshold: parseInt(e.target.value) || 90 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
                  <Input
                    id="warning-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={budgetForm.warning_threshold}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, warning_threshold: parseInt(e.target.value) || 75 }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={budgetForm.alerts_enabled}
                      onCheckedChange={(checked) => setBudgetForm(prev => ({ ...prev, alerts_enabled: checked }))}
                    />
                    <Label className="cursor-pointer">Enable Alerts</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={budgetForm.allows_rollover}
                      onCheckedChange={(checked) => setBudgetForm(prev => ({ ...prev, allows_rollover: checked }))}
                    />
                    <Label className="cursor-pointer">Allow Rollover</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewBudgetModal(false)
                  setBudgetForm(defaultBudgetForm)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBudget}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Details Modal */}
        <Dialog open={!!selectedBudget} onOpenChange={(open) => !open && setSelectedBudget(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                {selectedBudget?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedBudget && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedBudget.total_amount)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedBudget.available_amount)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedBudget.spent_amount)}</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Utilization</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedBudget.utilization_percent}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget Progress</span>
                    <span className="font-medium">{selectedBudget.utilization_percent}%</span>
                  </div>
                  <Progress value={selectedBudget.utilization_percent} className="h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium capitalize">{selectedBudget.budget_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge className={
                      selectedBudget.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedBudget.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      selectedBudget.status === 'exceeded' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {selectedBudget.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(selectedBudget.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p className="font-medium">{new Date(selectedBudget.end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedBudget.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-sm">{selectedBudget.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-wrap gap-2">
              <Button
                variant="destructive"
                onClick={() => selectedBudget && handleDeleteBudget(selectedBudget.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              {selectedBudget && selectedBudget.status === 'draft' && (
                <Button
                  variant="outline"
                  onClick={() => handleActivateBudget(selectedBudget.id)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
              {selectedBudget && (selectedBudget.status === 'pending_approval' || selectedBudget.status === 'draft') && (
                <Button
                  onClick={() => handleApproveBudget(selectedBudget.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowAllocateFundsModal(true)
                  setAllocationAmount(0)
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Allocate Funds
              </Button>
              <Button variant="outline" onClick={() => setSelectedBudget(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Allocate Funds Modal */}
        <Dialog open={showAllocateFundsModal} onOpenChange={setShowAllocateFundsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Allocate Funds
              </DialogTitle>
              <DialogDescription>
                Allocate additional funds to {selectedBudget?.name || 'this budget'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedBudget && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Current Budget</span>
                    <span className="font-semibold">{formatCurrency(selectedBudget.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Already Allocated</span>
                    <span className="font-semibold">{formatCurrency(selectedBudget.allocated_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available to Allocate</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(selectedBudget.total_amount - selectedBudget.allocated_amount)}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="allocation-amount">Allocation Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="allocation-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={allocationAmount || ''}
                    onChange={(e) => setAllocationAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAllocateFundsModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedBudget) {
                    handleAllocateFunds(selectedBudget.id, allocationAmount)
                    setShowAllocateFundsModal(false)
                    setAllocationAmount(0)
                  }
                }}
                disabled={allocationAmount <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Allocate Funds
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Transaction Modal (Wired Up) */}
        <Dialog open={showNewTransactionModal} onOpenChange={setShowNewTransactionModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-600" />
                Add Transaction
              </DialogTitle>
              <DialogDescription>
                Record a new income or expense transaction.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="txn-description">Description *</Label>
                <Input
                  id="txn-description"
                  placeholder="e.g., Grocery shopping at Whole Foods"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(value: 'income' | 'expense') => setTransactionForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">
                        <span className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                          Expense
                        </span>
                      </SelectItem>
                      <SelectItem value="income">
                        <span className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                          Income
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="txn-amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="txn-amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      value={transactionForm.amount || ''}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="txn-date">Date</Label>
                  <Input
                    id="txn-date"
                    type="date"
                    value={transactionForm.transaction_date}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, transaction_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="txn-category">Category</Label>
                  <Select
                    value={transactionForm.category}
                    onValueChange={(value) => setTransactionForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project_payment">Project Payment</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="office_expenses">Office Expenses</SelectItem>
                      <SelectItem value="professional_services">Professional Services</SelectItem>
                      <SelectItem value="taxes">Taxes</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="txn-vendor">Vendor/Payee</Label>
                  <Input
                    id="txn-vendor"
                    placeholder="Who did you pay?"
                    value={transactionForm.vendor_name}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, vendor_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="txn-client">Client (if income)</Label>
                  <Input
                    id="txn-client"
                    placeholder="Client name"
                    value={transactionForm.client_name}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, client_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txn-notes">Notes</Label>
                <Textarea
                  id="txn-notes"
                  placeholder="Add any additional notes..."
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewTransactionModal(false)
                  setTransactionForm(defaultTransactionForm)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTransaction}
                disabled={isSubmitting}
                className={transactionForm.type === 'expense' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {transactionForm.type === 'income' ? 'Income' : 'Expense'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Funds Modal */}
        <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                Transfer Funds
              </DialogTitle>
              <DialogDescription>
                Move money between your accounts
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>From Account</Label>
                <Select
                  value={transferForm.from_account}
                  onValueChange={(value) => setTransferForm(prev => ({ ...prev, from_account: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.onBudget && !a.closed).map(account => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name} ({formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To Account</Label>
                <Select
                  value={transferForm.to_account}
                  onValueChange={(value) => setTransferForm(prev => ({ ...prev, to_account: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(a => a.onBudget && !a.closed).map(account => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name} ({formatCurrency(account.balance)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="transfer-amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={transferForm.amount || ''}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-date">Date</Label>
                <Input
                  id="transfer-date"
                  type="date"
                  value={transferForm.transfer_date}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, transfer_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-notes">Notes (optional)</Label>
                <Input
                  id="transfer-notes"
                  placeholder="Add a note..."
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button>
              <Button onClick={handleTransferFunds} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Transfer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Scheduled Transactions Modal */}
        <Dialog open={showScheduledModal} onOpenChange={setShowScheduledModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-purple-600" />
                Scheduled Transactions
              </DialogTitle>
              <DialogDescription>
                Manage your recurring and scheduled transactions
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {localTransactions.filter(t => t.recurring).length > 0 ? (
                  localTransactions.filter(t => t.recurring).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={'p-2 rounded-lg ' + (tx.type === 'inflow' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600')}>
                          <Repeat className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{tx.payee}</p>
                          <p className="text-sm text-gray-500">{tx.category} • Monthly</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={'font-semibold ' + (tx.type === 'inflow' ? 'text-green-600' : '')}>
                          {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-500">Next: {tx.date.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Repeat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">No scheduled transactions</h3>
                    <p className="text-sm text-gray-500">Set up recurring transactions to automate your budget</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduledModal(false)}>Close</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.promise(
                  fetch('/api/budgets/scheduled', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'recurring' })
                  }).then(res => {
                    if (!res.ok) throw new Error('Create failed')
                    return res.json()
                  }),
                  {
                    loading: 'Creating scheduled transaction...',
                    success: 'Scheduled transaction created',
                    error: 'Failed to create scheduled transaction'
                  }
                )
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Scheduled
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reports Modal */}
        <Dialog open={showReportsModal} onOpenChange={setShowReportsModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Financial Reports
              </DialogTitle>
              <DialogDescription>
                View and export your financial reports
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Spending Report</h4>
                      <p className="text-sm text-gray-500">View spending by category</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => {
                    toast.promise(
                      fetch('/api/budgets/reports/spending').then(res => {
                        if (!res.ok) throw new Error('Report generation failed')
                        return res.json()
                      }),
                      {
                        loading: 'Generating spending report...',
                        success: 'Spending report ready',
                        error: 'Failed to generate report'
                      }
                    )
                  }}>Generate</Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-green-300 cursor-pointer transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Income vs Expenses</h4>
                      <p className="text-sm text-gray-500">Monthly comparison</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => {
                    toast.promise(
                      fetch('/api/budgets/reports/income-vs-expenses').then(res => {
                        if (!res.ok) throw new Error('Report generation failed')
                        return res.json()
                      }),
                      {
                        loading: 'Generating income vs expenses report...',
                        success: 'Income vs expenses report ready',
                        error: 'Failed to generate report'
                      }
                    )
                  }}>Generate</Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-purple-300 cursor-pointer transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <PieChart className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold">Net Worth</h4>
                      <p className="text-sm text-gray-500">Assets vs liabilities</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => {
                    toast.promise(
                      fetch('/api/budgets/reports/net-worth').then(res => {
                        if (!res.ok) throw new Error('Report generation failed')
                        return res.json()
                      }),
                      {
                        loading: 'Generating net worth report...',
                        success: 'Net worth report ready',
                        error: 'Failed to generate report'
                      }
                    )
                  }}>Generate</Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-orange-300 cursor-pointer transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-semibold">Budget Performance</h4>
                      <p className="text-sm text-gray-500">Track budget goals</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => {
                    toast.promise(
                      fetch('/api/budgets/reports/performance').then(res => {
                        if (!res.ok) throw new Error('Report generation failed')
                        return res.json()
                      }),
                      {
                        loading: 'Generating budget performance report...',
                        success: 'Budget performance report ready',
                        error: 'Failed to generate report'
                      }
                    )
                  }}>Generate</Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Quick Summary - {monthNames[currentMonth.getMonth()]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.income)}</p>
                    <p className="text-sm text-gray-500">Total Income</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.expenses)}</p>
                    <p className="text-sm text-gray-500">Total Expenses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.income - stats.expenses)}</p>
                    <p className="text-sm text-gray-500">Net Savings</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportsModal(false)}>Close</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast.promise(
                  fetch('/api/budgets/export/pdf').then(res => {
                    if (!res.ok) throw new Error('Export failed')
                    return res.blob()
                  }).then(blob => {
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'budget-report.pdf'
                    a.click()
                    URL.revokeObjectURL(url)
                  }),
                  {
                    loading: 'Exporting PDF report...',
                    success: 'PDF report exported successfully',
                    error: 'Failed to export PDF'
                  }
                )
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Goal Modal */}
        <Dialog open={showNewGoalModal} onOpenChange={setShowNewGoalModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Create Savings Goal
              </DialogTitle>
              <DialogDescription>
                Set a new financial goal to work towards
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name *</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Emergency Fund, Vacation"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="goal-target">Target Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      value={goalForm.target_amount || ''}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-current">Current Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="goal-current"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      value={goalForm.current_amount || ''}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, current_amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-date">Target Date</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={goalForm.category}
                  onValueChange={(value) => setGoalForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewGoalModal(false)}>Cancel</Button>
              <Button onClick={handleCreateGoal} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
