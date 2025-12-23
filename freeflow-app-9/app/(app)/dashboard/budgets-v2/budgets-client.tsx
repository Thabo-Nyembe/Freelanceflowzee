'use client'
import { useState, useMemo } from 'react'
import {
  Wallet, PiggyBank, TrendingUp, TrendingDown, DollarSign, CreditCard, Target,
  ArrowUpRight, ArrowDownRight, Plus, ChevronLeft, ChevronRight, Calendar,
  BarChart3, PieChart, List, Grid3X3, Filter, Download, Settings, RefreshCw,
  CheckCircle, AlertCircle, AlertTriangle, Minus, ArrowRight, Eye, EyeOff,
  Sparkles, Banknote, Receipt, ShoppingCart, Home, Car, Utensils, Plane,
  Heart, Zap, GraduationCap, Briefcase, Gift, Music, Film, Gamepad2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBudgets, type Budget, type BudgetType, type BudgetStatus } from '@/lib/hooks/use-budgets'

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
  transactions?: Transaction[]
}

interface Transaction {
  id: string
  date: string
  payee: string
  category: string
  amount: number
  type: 'inflow' | 'outflow'
  cleared: boolean
  memo?: string
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  type: 'savings' | 'debt' | 'spending'
  monthlyContribution: number
}

export default function BudgetsClient({ initialBudgets }: { initialBudgets: Budget[] }) {
  const [activeView, setActiveView] = useState<'budget' | 'categories' | 'spending' | 'goals' | 'reports'>('budget')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<BudgetType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all')
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['needs', 'wants', 'savings'])

  const { budgets, loading, error } = useBudgets({ budgetType: typeFilter, status: statusFilter })
  const displayBudgets = budgets.length > 0 ? budgets : initialBudgets

  // Mock categories data (YNAB style)
  const [categories] = useState<BudgetCategory[]>([
    // Needs Group
    { id: 'needs', name: 'Immediate Needs', icon: Home, color: 'blue', budgeted: 3500, spent: 2890, available: 610, isGroup: true },
    { id: 'rent', name: 'Rent/Mortgage', icon: Home, color: 'blue', budgeted: 1800, spent: 1800, available: 0, isGroup: false, parentId: 'needs' },
    { id: 'utilities', name: 'Utilities', icon: Zap, color: 'blue', budgeted: 250, spent: 218, available: 32, isGroup: false, parentId: 'needs' },
    { id: 'groceries', name: 'Groceries', icon: ShoppingCart, color: 'blue', budgeted: 600, spent: 524, available: 76, isGroup: false, parentId: 'needs' },
    { id: 'transportation', name: 'Transportation', icon: Car, color: 'blue', budgeted: 400, spent: 348, available: 52, isGroup: false, parentId: 'needs' },
    { id: 'insurance', name: 'Insurance', icon: Heart, color: 'blue', budgeted: 450, spent: 0, available: 450, isGroup: false, parentId: 'needs' },

    // Wants Group
    { id: 'wants', name: 'Quality of Life', icon: Sparkles, color: 'purple', budgeted: 800, spent: 645, available: 155, isGroup: true },
    { id: 'dining', name: 'Dining Out', icon: Utensils, color: 'purple', budgeted: 300, spent: 285, available: 15, isGroup: false, parentId: 'wants' },
    { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'purple', budgeted: 200, spent: 160, available: 40, isGroup: false, parentId: 'wants' },
    { id: 'subscriptions', name: 'Subscriptions', icon: Music, color: 'purple', budgeted: 100, spent: 98, available: 2, isGroup: false, parentId: 'wants' },
    { id: 'shopping', name: 'Personal Shopping', icon: Gift, color: 'purple', budgeted: 200, spent: 102, available: 98, isGroup: false, parentId: 'wants' },

    // Savings Group
    { id: 'savings', name: 'Savings Goals', icon: PiggyBank, color: 'green', budgeted: 1200, spent: 0, available: 1200, isGroup: true },
    { id: 'emergency', name: 'Emergency Fund', icon: AlertCircle, color: 'green', budgeted: 500, spent: 0, available: 500, isGroup: false, parentId: 'savings' },
    { id: 'vacation', name: 'Vacation Fund', icon: Plane, color: 'green', budgeted: 300, spent: 0, available: 300, isGroup: false, parentId: 'savings' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: 'green', budgeted: 200, spent: 0, available: 200, isGroup: false, parentId: 'savings' },
    { id: 'retirement', name: 'Retirement', icon: Briefcase, color: 'green', budgeted: 200, spent: 0, available: 200, isGroup: false, parentId: 'savings' },
  ])

  // Mock transactions
  const [transactions] = useState<Transaction[]>([
    { id: '1', date: '2024-12-23', payee: 'Whole Foods', category: 'Groceries', amount: -124.56, type: 'outflow', cleared: true },
    { id: '2', date: '2024-12-22', payee: 'Shell Gas Station', category: 'Transportation', amount: -45.00, type: 'outflow', cleared: true },
    { id: '3', date: '2024-12-22', payee: 'Netflix', category: 'Subscriptions', amount: -15.99, type: 'outflow', cleared: true },
    { id: '4', date: '2024-12-21', payee: 'Chipotle', category: 'Dining Out', amount: -18.50, type: 'outflow', cleared: true },
    { id: '5', date: '2024-12-20', payee: 'Amazon', category: 'Personal Shopping', amount: -67.89, type: 'outflow', cleared: true },
    { id: '6', date: '2024-12-20', payee: 'Employer Paycheck', category: 'Income', amount: 3500.00, type: 'inflow', cleared: true },
    { id: '7', date: '2024-12-19', payee: 'Electric Company', category: 'Utilities', amount: -95.42, type: 'outflow', cleared: true },
    { id: '8', date: '2024-12-18', payee: 'Trader Joe\'s', category: 'Groceries', amount: -89.34, type: 'outflow', cleared: true },
  ])

  // Mock goals
  const [goals] = useState<Goal[]>([
    { id: '1', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 8500, targetDate: '2025-06-30', category: 'emergency', type: 'savings', monthlyContribution: 500 },
    { id: '2', name: 'Summer Vacation', targetAmount: 3000, currentAmount: 1200, targetDate: '2025-07-01', category: 'vacation', type: 'savings', monthlyContribution: 300 },
    { id: '3', name: 'New Laptop', targetAmount: 2000, currentAmount: 800, targetDate: '2025-03-01', category: 'shopping', type: 'savings', monthlyContribution: 200 },
    { id: '4', name: 'Student Loan Payoff', targetAmount: 25000, currentAmount: 18000, targetDate: '2026-01-01', category: 'debt', type: 'debt', monthlyContribution: 600 },
  ])

  const stats = useMemo(() => {
    const totalBudgeted = categories.filter(c => c.isGroup).reduce((sum, c) => sum + c.budgeted, 0)
    const totalSpent = categories.filter(c => c.isGroup).reduce((sum, c) => sum + c.spent, 0)
    const totalAvailable = categories.filter(c => c.isGroup).reduce((sum, c) => sum + c.available, 0)
    const income = transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      totalBudgeted,
      totalSpent,
      totalAvailable,
      income,
      expenses,
      readyToAssign: income - totalBudgeted,
      spendingRate: ((totalSpent / totalBudgeted) * 100).toFixed(1),
      daysInMonth: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(),
      dayOfMonth: new Date().getDate(),
    }
  }, [categories, transactions, currentMonth])

  const views = [
    { id: 'budget' as const, name: 'Budget', icon: Wallet },
    { id: 'categories' as const, name: 'Categories', icon: Grid3X3 },
    { id: 'spending' as const, name: 'Spending', icon: CreditCard },
    { id: 'goals' as const, name: 'Goals', icon: Target },
    { id: 'reports' as const, name: 'Reports', icon: BarChart3 },
  ]

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

  const getCategoryStatus = (category: BudgetCategory) => {
    if (category.available < 0) return 'overspent'
    if (category.spent > category.budgeted * 0.9) return 'warning'
    return 'good'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overspent': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'good': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                YNAB Level
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Give every dollar a job</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border">
              <Button size="sm" variant="ghost" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 font-medium text-gray-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button size="sm" variant="ghost" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Budget Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Name</label>
                    <Input placeholder="e.g., Coffee Budget" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Group</label>
                    <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="needs">Immediate Needs</option>
                      <option value="wants">Quality of Life</option>
                      <option value="savings">Savings Goals</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Budget</label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewCategoryModal(false)}>Cancel</Button>
                  <Button>Create Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Ready to Assign Banner */}
        <div className={`rounded-xl p-6 ${stats.readyToAssign >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="text-sm opacity-90 mb-1">Ready to Assign</div>
              <div className="text-4xl font-bold">{formatCurrency(Math.abs(stats.readyToAssign))}</div>
              {stats.readyToAssign < 0 && (
                <div className="text-sm mt-2 opacity-90 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  You've assigned more than you have. Cover overspending from another category.
                </div>
              )}
            </div>
            <div className="text-right text-white">
              <div className="text-sm opacity-90">This Month</div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <div className="text-xs opacity-75">Income</div>
                  <div className="text-lg font-semibold">{formatCurrency(stats.income)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-75">Budgeted</div>
                  <div className="text-lg font-semibold">{formatCurrency(stats.totalBudgeted)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              Income
            </div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.income)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <Wallet className="w-4 h-4 text-blue-500" />
              Budgeted
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalBudgeted)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <CreditCard className="w-4 h-4 text-purple-500" />
              Spent
            </div>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <PiggyBank className="w-4 h-4 text-emerald-500" />
              Available
            </div>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAvailable)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Spending Rate
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.spendingRate}%</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-1 p-2">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Budget View */}
          {activeView === 'budget' && (
            <div className="p-6">
              <div className="space-y-4">
                {/* Category Groups */}
                {categories.filter(c => c.isGroup).map(group => {
                  const groupCategories = categories.filter(c => c.parentId === group.id)
                  const isExpanded = expandedGroups.includes(group.id)

                  return (
                    <div key={group.id} className="border rounded-xl dark:border-gray-700 overflow-hidden">
                      {/* Group Header */}
                      <div
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <div className={`p-2 rounded-lg bg-${group.color}-100 dark:bg-${group.color}-900/30`}>
                              <group.icon className={`w-5 h-5 text-${group.color}-600`} />
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
                              <div className={`font-semibold ${group.available >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(group.available)}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              group.spent > group.budgeted ? 'bg-red-500' :
                              group.spent > group.budgeted * 0.9 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((group.spent / group.budgeted) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Category Items */}
                      {isExpanded && (
                        <div className="divide-y dark:divide-gray-700">
                          {groupCategories.map(category => {
                            const status = getCategoryStatus(category)
                            return (
                              <div key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <category.icon className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
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
                                      <Badge className={getStatusColor(status)}>
                                        {formatCurrency(category.available)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                {/* Mini progress */}
                                <div className="mt-2 ml-7 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      status === 'overspent' ? 'bg-red-500' :
                                      status === 'warning' ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Spending View */}
          {activeView === 'spending' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </Button>
              </div>

              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'inflow' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {tx.type === 'inflow' ? (
                            <ArrowDownRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{tx.payee}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{tx.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {tx.cleared && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <span className={`text-lg font-semibold ${tx.type === 'inflow' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                          {tx.type === 'inflow' ? '+' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals View */}
          {activeView === 'goals' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Goals</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress towards financial goals</p>
                </div>
                <Dialog open={showNewGoalModal} onOpenChange={setShowNewGoalModal}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Savings Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Goal Name</label>
                        <Input placeholder="e.g., Dream Vacation" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Amount</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Target Date</label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Monthly Contribution</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewGoalModal(false)}>Cancel</Button>
                      <Button>Create Goal</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {goals.map(goal => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const remaining = goal.targetAmount - goal.currentAmount
                  const monthsLeft = Math.ceil(remaining / goal.monthlyContribution)

                  return (
                    <div key={goal.id} className="p-4 border rounded-xl dark:border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            goal.type === 'savings' ? 'bg-green-100 dark:bg-green-900/30' :
                            goal.type === 'debt' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {goal.type === 'savings' ? <PiggyBank className="w-5 h-5 text-green-600" /> :
                             goal.type === 'debt' ? <CreditCard className="w-5 h-5 text-red-600" /> :
                             <Target className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">{goal.type}</Badge>
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
                              goal.type === 'debt' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
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
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === 'reports' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Reports</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyze your spending patterns</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Spending by Category */}
                <div className="p-4 border rounded-xl dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Spending by Category
                  </h3>
                  <div className="space-y-3">
                    {categories.filter(c => !c.isGroup && c.spent > 0).slice(0, 6).map(cat => {
                      const percentage = (cat.spent / stats.totalSpent) * 100
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                            <span className="font-medium">{formatCurrency(cat.spent)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Income vs Expenses */}
                <div className="p-4 border rounded-xl dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Income vs Expenses
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
                        <span className="font-semibold text-green-600">{formatCurrency(stats.income)}</span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                        <span className="font-semibold text-red-600">{formatCurrency(stats.expenses)}</span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(stats.expenses / stats.income) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">Net Savings</span>
                        <span className={`font-bold ${stats.income - stats.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stats.income - stats.expenses)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="p-4 border rounded-xl dark:border-gray-700 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Monthly Spending Trend
                  </h3>
                  <div className="grid grid-cols-6 gap-4">
                    {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                      const spent = [3200, 2800, 3100, 2950, 3400, stats.totalSpent][idx]
                      const maxSpent = 3500
                      const height = (spent / maxSpent) * 100
                      return (
                        <div key={month} className="text-center">
                          <div className="h-32 flex items-end justify-center mb-2">
                            <div
                              className={`w-full rounded-t-lg transition-all ${
                                idx === 5 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">{month}</div>
                          <div className="text-sm font-medium">${(spent / 1000).toFixed(1)}k</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories View */}
          {activeView === 'categories' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Categories</h2>
                <Button className="gap-2" onClick={() => setShowNewCategoryModal(true)}>
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-4">
                {categories.filter(c => c.isGroup).map(group => (
                  <div key={group.id} className="border rounded-xl dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <group.icon className={`w-5 h-5 text-${group.color}-600`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {categories.filter(c => c.parentId === group.id).map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{formatCurrency(cat.budgeted)}</span>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
