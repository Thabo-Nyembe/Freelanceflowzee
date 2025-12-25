'use client'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Wallet, PiggyBank, TrendingUp, TrendingDown, DollarSign, CreditCard, Target,
  ArrowUpRight, ArrowDownRight, Plus, ChevronLeft, ChevronRight, Calendar,
  BarChart3, PieChart, List, Grid3X3, Filter, Download, Settings, RefreshCw,
  CheckCircle, AlertCircle, AlertTriangle, Minus, ArrowRight, Eye, EyeOff,
  Sparkles, Banknote, Receipt, ShoppingCart, Home, Car, Utensils, Plane,
  Heart, Zap, GraduationCap, Briefcase, Gift, Music, Film, Gamepad2,
  Building2, Landmark, CreditCardIcon, Coins, TrendingDown as TrendingDownIcon,
  Clock, Bell, MoreVertical, Repeat, ArrowLeftRight, Search, ExternalLink,
  FileText, Lock, Unlock, ChevronDown, Trash2, Edit3, Copy, CheckCircle2
} from 'lucide-react'
import { useBudgets, type Budget, type BudgetType, type BudgetStatus } from '@/lib/hooks/use-budgets'

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

interface Transaction {
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
// MOCK DATA
// ============================================================================

const mockCategories: BudgetCategory[] = [
  // Needs Group
  { id: 'needs', name: 'Immediate Obligations', icon: Home, color: 'blue', budgeted: 3500, spent: 2890, available: 610, isGroup: true, carryover: false },
  { id: 'rent', name: 'Rent/Mortgage', icon: Home, color: 'blue', budgeted: 1800, spent: 1800, available: 0, isGroup: false, parentId: 'needs', carryover: false },
  { id: 'utilities', name: 'Utilities', icon: Zap, color: 'blue', budgeted: 250, spent: 218, available: 32, isGroup: false, parentId: 'needs', carryover: true },
  { id: 'groceries', name: 'Groceries', icon: ShoppingCart, color: 'blue', budgeted: 600, spent: 524, available: 76, isGroup: false, parentId: 'needs', carryover: true },
  { id: 'transportation', name: 'Transportation', icon: Car, color: 'blue', budgeted: 400, spent: 348, available: 52, isGroup: false, parentId: 'needs', carryover: true },
  { id: 'insurance', name: 'Insurance', icon: Heart, color: 'blue', budgeted: 450, spent: 0, available: 450, isGroup: false, parentId: 'needs', carryover: false, goalType: 'spending', goalTarget: 450 },

  // Wants Group
  { id: 'wants', name: 'True Expenses', icon: Sparkles, color: 'purple', budgeted: 800, spent: 645, available: 155, isGroup: true, carryover: false },
  { id: 'dining', name: 'Dining Out', icon: Utensils, color: 'purple', budgeted: 300, spent: 285, available: 15, isGroup: false, parentId: 'wants', carryover: true },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'purple', budgeted: 200, spent: 160, available: 40, isGroup: false, parentId: 'wants', carryover: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: Music, color: 'purple', budgeted: 100, spent: 98, available: 2, isGroup: false, parentId: 'wants', carryover: false },
  { id: 'shopping', name: 'Personal Shopping', icon: Gift, color: 'purple', budgeted: 200, spent: 102, available: 98, isGroup: false, parentId: 'wants', carryover: true },

  // Savings Group
  { id: 'savings', name: 'Savings Goals', icon: PiggyBank, color: 'green', budgeted: 1200, spent: 0, available: 1200, isGroup: true, carryover: false },
  { id: 'emergency', name: 'Emergency Fund', icon: AlertCircle, color: 'green', budgeted: 500, spent: 0, available: 500, isGroup: false, parentId: 'savings', carryover: true, goalType: 'savings', goalTarget: 15000 },
  { id: 'vacation', name: 'Vacation Fund', icon: Plane, color: 'green', budgeted: 300, spent: 0, available: 300, isGroup: false, parentId: 'savings', carryover: true, goalType: 'target', goalTarget: 3000 },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'green', budgeted: 200, spent: 0, available: 200, isGroup: false, parentId: 'savings', carryover: true },
  { id: 'retirement', name: 'Retirement', icon: Briefcase, color: 'green', budgeted: 200, spent: 0, available: 200, isGroup: false, parentId: 'savings', carryover: true },

  // Debt Group
  { id: 'debt', name: 'Debt Payments', icon: CreditCard, color: 'red', budgeted: 800, spent: 800, available: 0, isGroup: true, carryover: false },
  { id: 'student-loan', name: 'Student Loans', icon: GraduationCap, color: 'red', budgeted: 400, spent: 400, available: 0, isGroup: false, parentId: 'debt', carryover: false, goalType: 'target', goalTarget: 25000 },
  { id: 'credit-card', name: 'Credit Card', icon: CreditCard, color: 'red', budgeted: 400, spent: 400, available: 0, isGroup: false, parentId: 'debt', carryover: false },
]

const mockTransactions: Transaction[] = [
  { id: '1', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 0), payee: 'Whole Foods Market', category: 'Groceries', categoryId: 'groceries', amount: -124.56, type: 'outflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking' },
  { id: '2', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), payee: 'Shell Gas Station', category: 'Transportation', categoryId: 'transportation', amount: -45.00, type: 'outflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking' },
  { id: '3', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), payee: 'Netflix', category: 'Subscriptions', categoryId: 'subscriptions', amount: -15.99, type: 'outflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking', recurring: true },
  { id: '4', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), payee: 'Chipotle', category: 'Dining Out', categoryId: 'dining', amount: -18.50, type: 'outflow', cleared: true, approved: true, accountId: '2', accountName: 'Credit Card' },
  { id: '5', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), payee: 'Amazon', category: 'Personal Shopping', categoryId: 'shopping', amount: -67.89, type: 'outflow', cleared: false, approved: true, accountId: '2', accountName: 'Credit Card' },
  { id: '6', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), payee: 'Employer - Salary', category: 'Ready to Assign', categoryId: 'income', amount: 3500.00, type: 'inflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking', recurring: true },
  { id: '7', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), payee: 'Electric Company', category: 'Utilities', categoryId: 'utilities', amount: -95.42, type: 'outflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking' },
  { id: '8', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), payee: "Trader Joe's", category: 'Groceries', categoryId: 'groceries', amount: -89.34, type: 'outflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking' },
  { id: '9', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), payee: 'Landlord - Rent', category: 'Rent/Mortgage', categoryId: 'rent', amount: -1800.00, type: 'outflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking', recurring: true },
  { id: '10', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), payee: 'Side Project Income', category: 'Ready to Assign', categoryId: 'income', amount: 500.00, type: 'inflow', cleared: true, approved: true, accountId: '1', accountName: 'Checking' },
]

const mockAccounts: Account[] = [
  { id: '1', name: 'Primary Checking', type: 'checking', balance: 4523.45, cleared: 4523.45, uncleared: 0, institution: 'Chase Bank', lastSync: new Date(), onBudget: true, closed: false },
  { id: '2', name: 'Rewards Credit Card', type: 'credit', balance: -1245.67, cleared: -1177.78, uncleared: -67.89, institution: 'Capital One', lastSync: new Date(), onBudget: true, closed: false },
  { id: '3', name: 'High Yield Savings', type: 'savings', balance: 12500.00, cleared: 12500.00, uncleared: 0, institution: 'Ally Bank', lastSync: new Date(), onBudget: true, closed: false },
  { id: '4', name: 'Emergency Fund', type: 'savings', balance: 8500.00, cleared: 8500.00, uncleared: 0, institution: 'Marcus', onBudget: false, closed: false },
  { id: '5', name: 'Brokerage', type: 'investment', balance: 25000.00, cleared: 25000.00, uncleared: 0, institution: 'Fidelity', onBudget: false, closed: false },
]

const mockGoals: Goal[] = [
  { id: '1', name: 'Emergency Fund', categoryId: 'emergency', categoryName: 'Emergency Fund', targetAmount: 15000, currentAmount: 8500, type: 'savings_balance', monthlyContribution: 500, priority: 'high' },
  { id: '2', name: 'Summer Vacation', categoryId: 'vacation', categoryName: 'Vacation Fund', targetAmount: 3000, currentAmount: 1200, targetDate: new Date('2025-07-01'), type: 'needed_by_date', monthlyContribution: 300, priority: 'medium' },
  { id: '3', name: 'Student Loan Payoff', categoryId: 'student-loan', categoryName: 'Student Loans', targetAmount: 25000, currentAmount: 7000, targetDate: new Date('2026-01-01'), type: 'debt_payoff', monthlyContribution: 400, priority: 'high' },
  { id: '4', name: 'New Laptop', categoryId: 'shopping', categoryName: 'Personal Shopping', targetAmount: 2000, currentAmount: 800, targetDate: new Date('2025-03-01'), type: 'needed_by_date', monthlyContribution: 200, priority: 'low' },
]

const mockRecurring: RecurringTransaction[] = [
  { id: '1', payee: 'Netflix', category: 'Subscriptions', amount: -15.99, frequency: 'monthly', nextDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), accountId: '1', active: true },
  { id: '2', payee: 'Spotify', category: 'Subscriptions', amount: -9.99, frequency: 'monthly', nextDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8), accountId: '1', active: true },
  { id: '3', payee: 'Employer - Salary', category: 'Income', amount: 3500.00, frequency: 'biweekly', nextDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), accountId: '1', active: true },
  { id: '4', payee: 'Rent', category: 'Rent/Mortgage', amount: -1800.00, frequency: 'monthly', nextDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), accountId: '1', active: true },
]

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
// MAIN COMPONENT
// ============================================================================

export default function BudgetsClient({ initialBudgets }: { initialBudgets: Budget[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [typeFilter, setTypeFilter] = useState<BudgetType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all')
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showNewAccountModal, setShowNewAccountModal] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['needs', 'wants', 'savings', 'debt'])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const { budgets, loading, error } = useBudgets({ budgetType: typeFilter, status: statusFilter })
  const displayBudgets = budgets.length > 0 ? budgets : initialBudgets

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const groups = mockCategories.filter(c => c.isGroup)
    const totalBudgeted = groups.reduce((sum, c) => sum + c.budgeted, 0)
    const totalSpent = groups.reduce((sum, c) => sum + c.spent, 0)
    const totalAvailable = groups.reduce((sum, c) => sum + c.available, 0)

    const income = mockTransactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0)
    const expenses = mockTransactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const onBudgetAccounts = mockAccounts.filter(a => a.onBudget)
    const netWorth = mockAccounts.reduce((sum, a) => sum + a.balance, 0)
    const cashBalance = onBudgetAccounts.reduce((sum, a) => sum + a.balance, 0)

    const goalsProgress = mockGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / mockGoals.length * 100

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
      accountsCount: mockAccounts.filter(a => !a.closed).length,
      transactionsCount: mockTransactions.length,
    }
  }, [])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:bg-none dark:bg-gray-900 p-8">
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
                <Dialog open={showNewTransactionModal} onOpenChange={setShowNewTransactionModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-blue-600 hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Transaction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Account</label>
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            {mockAccounts.filter(a => a.onBudget).map(account => (
                              <option key={account.id} value={account.id}>{account.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Payee</label>
                        <Input placeholder="Who did you pay?" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            {mockCategories.filter(c => !c.isGroup).map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Amount</label>
                          <div className="flex">
                            <select className="px-2 border rounded-l-lg dark:bg-gray-800 dark:border-gray-700">
                              <option value="outflow">-</option>
                              <option value="inflow">+</option>
                            </select>
                            <Input type="number" placeholder="0.00" className="rounded-l-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Memo (optional)</label>
                        <Input placeholder="Add a note" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewTransactionModal(false)}>Cancel</Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">Add Transaction</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="text-white hover:bg-white/20">
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
              <div className="grid grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Spending Overview */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
                  <Badge variant="outline">{monthNames[currentMonth.getMonth()]}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCategories.filter(c => c.isGroup).map(group => {
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
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAccounts.filter(a => !a.closed).slice(0, 4).map(account => {
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
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockTransactions.slice(0, 5).map(tx => (
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
                  <Button variant="ghost" size="sm">Manage</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockGoals.slice(0, 3).map(goal => {
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
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Budget Categories</CardTitle>
                <Button onClick={() => setShowNewCategoryModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCategories.filter(c => c.isGroup).map(group => {
                  const groupCategories = mockCategories.filter(c => c.parentId === group.id)
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
                    {mockAccounts.map(account => (
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
                  {mockTransactions.map(tx => (
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
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockGoals.map(goal => {
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
                        <DialogTitle>Add Account</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Account Name</label>
                          <Input placeholder="e.g., Chase Checking" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Account Type</label>
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                            <option value="credit">Credit Card</option>
                            <option value="cash">Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Current Balance</label>
                          <Input type="number" placeholder="0.00" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewAccountModal(false)}>Cancel</Button>
                        <Button>Add Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAccounts.filter(a => a.onBudget).map(account => {
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
                  {mockAccounts.filter(a => !a.onBudget).map(account => {
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Auto-assign income', desc: 'Automatically assign new income to categories', enabled: true },
                    { label: 'Rollover available', desc: 'Carry over unused money to next month', enabled: true },
                    { label: 'Weekly spending reports', desc: 'Get email summaries of your spending', enabled: false },
                    { label: 'Goal notifications', desc: 'Notify when goals are reached', enabled: true },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                        <p className="text-sm text-gray-500">{setting.desc}</p>
                      </div>
                      <Switch defaultChecked={setting.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Currency & Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Format</label>
                    <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="mdy">MM/DD/YYYY</option>
                      <option value="dmy">DD/MM/YYYY</option>
                      <option value="ymd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">First Day of Week</label>
                    <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Transactions (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Monthly Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync All Accounts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Pro Plan</span>
                      <Badge className="bg-white/20 text-white border-0">Active</Badge>
                    </div>
                    <p className="text-sm text-white/80">Unlimited accounts • Goals • Reports</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Your plan renews on January 1, 2025
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${selectedTransaction.type === 'inflow' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {selectedTransaction.type === 'inflow' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTransaction.payee}</h3>
                    <p className="text-gray-500">{selectedTransaction.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className={`font-semibold ${selectedTransaction.type === 'inflow' ? 'text-green-600' : ''}`}>
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
                <Button variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="text-red-600">
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
                  {mockCategories.filter(c => c.isGroup).map(group => (
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
              <Button className="bg-blue-600 hover:bg-blue-700">Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
