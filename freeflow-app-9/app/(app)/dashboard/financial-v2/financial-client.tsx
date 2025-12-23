'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  Wallet,
  CreditCard,
  Building2,
  FileText,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Receipt,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Printer,
  Share2,
  Settings,
  MoreHorizontal,
  Search,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFinancial, type FinancialRecord } from '@/lib/hooks/use-financial'

// Types
interface Account {
  id: string
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  subtype: string
  balance: number
  description?: string
  isActive: boolean
  parentId?: string
  children?: Account[]
}

interface BankAccount {
  id: string
  name: string
  institution: string
  accountNumber: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  lastSync: string
  status: 'connected' | 'needs_attention' | 'disconnected'
}

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  account: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  status: 'cleared' | 'pending' | 'reconciled'
  payee?: string
  reference?: string
}

interface BudgetItem {
  category: string
  budgeted: number
  actual: number
  remaining: number
}

// Mock Data
const mockAccounts: Account[] = [
  { id: '1', code: '1000', name: 'Cash and Cash Equivalents', type: 'asset', subtype: 'Current Assets', balance: 125000, isActive: true },
  { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'Current Assets', balance: 45000, isActive: true },
  { id: '3', code: '1200', name: 'Inventory', type: 'asset', subtype: 'Current Assets', balance: 32000, isActive: true },
  { id: '4', code: '1500', name: 'Fixed Assets', type: 'asset', subtype: 'Non-Current Assets', balance: 85000, isActive: true },
  { id: '5', code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'Current Liabilities', balance: 28000, isActive: true },
  { id: '6', code: '2100', name: 'Credit Card Payable', type: 'liability', subtype: 'Current Liabilities', balance: 5500, isActive: true },
  { id: '7', code: '2500', name: 'Long-term Debt', type: 'liability', subtype: 'Non-Current Liabilities', balance: 50000, isActive: true },
  { id: '8', code: '3000', name: 'Owner\'s Equity', type: 'equity', subtype: 'Equity', balance: 150000, isActive: true },
  { id: '9', code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'Equity', balance: 53500, isActive: true },
  { id: '10', code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'Operating Revenue', balance: 285000, isActive: true },
  { id: '11', code: '4100', name: 'Service Revenue', type: 'revenue', subtype: 'Operating Revenue', balance: 125000, isActive: true },
  { id: '12', code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'Cost of Sales', balance: 142500, isActive: true },
  { id: '13', code: '6000', name: 'Operating Expenses', type: 'expense', subtype: 'Operating Expenses', balance: 85000, isActive: true },
  { id: '14', code: '6100', name: 'Payroll Expenses', type: 'expense', subtype: 'Operating Expenses', balance: 95000, isActive: true },
]

const mockBankAccounts: BankAccount[] = [
  { id: '1', name: 'Business Checking', institution: 'Chase Bank', accountNumber: '****4521', type: 'checking', balance: 85420.50, lastSync: '2024-12-23T10:30:00Z', status: 'connected' },
  { id: '2', name: 'Business Savings', institution: 'Chase Bank', accountNumber: '****7832', type: 'savings', balance: 45000.00, lastSync: '2024-12-23T10:30:00Z', status: 'connected' },
  { id: '3', name: 'Business Credit Card', institution: 'American Express', accountNumber: '****3456', type: 'credit', balance: -5500.00, lastSync: '2024-12-22T18:00:00Z', status: 'needs_attention' },
]

const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-12-23', description: 'Client Payment - ABC Corp', category: 'Sales Revenue', account: 'Business Checking', amount: 15000, type: 'income', status: 'cleared', payee: 'ABC Corp', reference: 'INV-2024-089' },
  { id: '2', date: '2024-12-22', description: 'Office Supplies', category: 'Operating Expenses', account: 'Business Credit Card', amount: -450, type: 'expense', status: 'pending', payee: 'Staples' },
  { id: '3', date: '2024-12-22', description: 'Software Subscription', category: 'Operating Expenses', account: 'Business Checking', amount: -299, type: 'expense', status: 'cleared', payee: 'Adobe' },
  { id: '4', date: '2024-12-21', description: 'Client Payment - XYZ Ltd', category: 'Service Revenue', account: 'Business Checking', amount: 8500, type: 'income', status: 'reconciled', payee: 'XYZ Ltd', reference: 'INV-2024-088' },
  { id: '5', date: '2024-12-20', description: 'Payroll', category: 'Payroll Expenses', account: 'Business Checking', amount: -12500, type: 'expense', status: 'reconciled', payee: 'Employees' },
  { id: '6', date: '2024-12-19', description: 'Client Retainer - DEF Inc', category: 'Service Revenue', account: 'Business Checking', amount: 5000, type: 'income', status: 'cleared', payee: 'DEF Inc', reference: 'RET-2024-012' },
  { id: '7', date: '2024-12-18', description: 'Utility Bill', category: 'Operating Expenses', account: 'Business Checking', amount: -385, type: 'expense', status: 'cleared', payee: 'Electric Company' },
  { id: '8', date: '2024-12-17', description: 'Marketing Expenses', category: 'Operating Expenses', account: 'Business Credit Card', amount: -1200, type: 'expense', status: 'pending', payee: 'Google Ads' },
]

const mockBudgetItems: BudgetItem[] = [
  { category: 'Revenue', budgeted: 420000, actual: 410000, remaining: 10000 },
  { category: 'Cost of Goods Sold', budgeted: 150000, actual: 142500, remaining: 7500 },
  { category: 'Operating Expenses', budgeted: 100000, actual: 85000, remaining: 15000 },
  { category: 'Payroll', budgeted: 100000, actual: 95000, remaining: 5000 },
  { category: 'Marketing', budgeted: 25000, actual: 22000, remaining: 3000 },
  { category: 'Technology', budgeted: 15000, actual: 12500, remaining: 2500 },
]

// P&L Data
const profitLossData = {
  revenue: {
    'Sales Revenue': 285000,
    'Service Revenue': 125000,
    'Other Income': 5000,
  },
  costOfSales: {
    'Cost of Goods Sold': 142500,
    'Direct Labor': 35000,
  },
  operatingExpenses: {
    'Payroll Expenses': 95000,
    'Rent & Utilities': 24000,
    'Marketing': 22000,
    'Software & Technology': 12500,
    'Office Supplies': 8500,
    'Professional Services': 12000,
    'Travel & Entertainment': 6000,
    'Insurance': 5000,
  },
}

// Cash Flow Data
const cashFlowData = {
  operating: {
    'Net Income': 87500,
    'Depreciation': 8500,
    'Change in Accounts Receivable': -12000,
    'Change in Inventory': -5000,
    'Change in Accounts Payable': 8000,
  },
  investing: {
    'Purchase of Equipment': -15000,
    'Sale of Assets': 2000,
  },
  financing: {
    'Loan Repayment': -12000,
    'Owner Drawings': -10000,
  },
}

export default function FinancialClient({ initialFinancial }: { initialFinancial: FinancialRecord[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('this-year')
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false)
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false)
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>(['asset', 'liability', 'equity'])
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { records } = useFinancial({})
  const displayRecords = records.length > 0 ? records : initialFinancial

  // Calculations
  const totalRevenue = Object.values(profitLossData.revenue).reduce((a, b) => a + b, 0)
  const totalCostOfSales = Object.values(profitLossData.costOfSales).reduce((a, b) => a + b, 0)
  const grossProfit = totalRevenue - totalCostOfSales
  const totalOperatingExpenses = Object.values(profitLossData.operatingExpenses).reduce((a, b) => a + b, 0)
  const netIncome = grossProfit - totalOperatingExpenses

  const totalAssets = mockAccounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = mockAccounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0)
  const totalEquity = mockAccounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0)

  const operatingCashFlow = Object.values(cashFlowData.operating).reduce((a, b) => a + b, 0)
  const investingCashFlow = Object.values(cashFlowData.investing).reduce((a, b) => a + b, 0)
  const financingCashFlow = Object.values(cashFlowData.financing).reduce((a, b) => a + b, 0)
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(t => {
      const matchesFilter = transactionFilter === 'all' || t.type === transactionFilter
      const matchesSearch = searchQuery === '' ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.payee?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [transactionFilter, searchQuery])

  const accountsByType = useMemo(() => {
    return {
      asset: mockAccounts.filter(a => a.type === 'asset'),
      liability: mockAccounts.filter(a => a.type === 'liability'),
      equity: mockAccounts.filter(a => a.type === 'equity'),
      revenue: mockAccounts.filter(a => a.type === 'revenue'),
      expense: mockAccounts.filter(a => a.type === 'expense'),
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const toggleAccountExpansion = (type: string) => {
    setExpandedAccounts(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Financial Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              QuickBooks-level accounting and financial management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none dark:text-white"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <button
              onClick={() => setShowNewTransactionDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2">
          {['P&L Statements', 'Balance Sheet', 'Cash Flow', 'Bank Reconciliation', 'Chart of Accounts', 'Budget Tracking'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">12.5% vs last year</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalCostOfSales + totalOperatingExpenses)}</p>
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <ArrowDownRight className="w-4 h-4" />
                  <span className="text-sm font-medium">8.2% vs last year</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Income</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(netIncome)}</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">21.1% margin</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Position</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(124920.50)}</p>
                <div className="flex items-center gap-1 mt-2 text-blue-600">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">3 accounts connected</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Landmark className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profit-loss" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <LineChart className="w-4 h-4 mr-2" />
              Profit & Loss
            </TabsTrigger>
            <TabsTrigger value="balance-sheet" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <PieChart className="w-4 h-4 mr-2" />
              Balance Sheet
            </TabsTrigger>
            <TabsTrigger value="cash-flow" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <FileText className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="banking" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <Landmark className="w-4 h-4 mr-2" />
              Banking
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
                  </div>
                </div>
                <ScrollArea className="h-[320px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockTransactions.slice(0, 6).map((transaction) => (
                      <div key={transaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                              {transaction.type === 'income' ? (
                                <ArrowDown className="w-4 h-4 text-green-600" />
                              ) : (
                                <ArrowUp className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                              <p className="text-sm text-gray-500">{formatDate(transaction.date)} • {transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              transaction.status === 'reconciled' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              transaction.status === 'cleared' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Budget vs Actual */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget vs Actual</h3>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Edit Budget</button>
                  </div>
                </div>
                <ScrollArea className="h-[320px]">
                  <div className="p-4 space-y-4">
                    {mockBudgetItems.map((item) => {
                      const percentage = (item.actual / item.budgeted) * 100
                      const isOverBudget = item.actual > item.budgeted
                      return (
                        <div key={item.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(item.actual)} / {formatCurrency(item.budgeted)}
                            </span>
                          </div>
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isOverBudget ? 'text-red-600' : 'text-gray-500'}>
                              {percentage.toFixed(1)}% used
                            </span>
                            <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {isOverBudget ? 'Over by ' : ''}{formatCurrency(Math.abs(item.remaining))} {!isOverBudget && 'remaining'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Bank Accounts Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connected Bank Accounts</h3>
                  <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    <Plus className="w-4 h-4" />
                    Connect Account
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                {mockBankAccounts.map((account) => (
                  <div key={account.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          account.type === 'checking' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          account.type === 'savings' ? 'bg-green-100 dark:bg-green-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {account.type === 'credit' ? (
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{account.name}</p>
                          <p className="text-sm text-gray-500">{account.institution} • {account.accountNumber}</p>
                        </div>
                      </div>
                      {account.status === 'needs_attention' && (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Last synced: {new Date(account.lastSync).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Profit & Loss Tab */}
          <TabsContent value="profit-loss" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit & Loss Statement</h3>
                    <p className="text-sm text-gray-500 mt-1">For the year ending December 31, 2024</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Share2 className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Revenue Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Revenue</h4>
                  <div className="space-y-2">
                    {Object.entries(profitLossData.revenue).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 bg-green-50 dark:bg-green-900/20 -mx-6 px-6">
                      <span className="font-semibold text-green-700 dark:text-green-300">Total Revenue</span>
                      <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(totalRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Cost of Sales Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cost of Sales</h4>
                  <div className="space-y-2">
                    {Object.entries(profitLossData.costOfSales).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="font-medium text-red-600">({formatCurrency(amount)})</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 bg-red-50 dark:bg-red-900/20 -mx-6 px-6">
                      <span className="font-semibold text-red-700 dark:text-red-300">Total Cost of Sales</span>
                      <span className="font-bold text-red-700 dark:text-red-300">({formatCurrency(totalCostOfSales)})</span>
                    </div>
                  </div>
                </div>

                {/* Gross Profit */}
                <div className="flex items-center justify-between py-4 bg-emerald-100 dark:bg-emerald-900/30 -mx-6 px-6 rounded-lg">
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">Gross Profit</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(grossProfit)}</span>
                </div>

                {/* Operating Expenses Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Operating Expenses</h4>
                  <div className="space-y-2">
                    {Object.entries(profitLossData.operatingExpenses).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="font-medium text-red-600">({formatCurrency(amount)})</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 bg-red-50 dark:bg-red-900/20 -mx-6 px-6">
                      <span className="font-semibold text-red-700 dark:text-red-300">Total Operating Expenses</span>
                      <span className="font-bold text-red-700 dark:text-red-300">({formatCurrency(totalOperatingExpenses)})</span>
                    </div>
                  </div>
                </div>

                {/* Net Income */}
                <div className="flex items-center justify-between py-4 bg-gradient-to-r from-emerald-500 to-green-500 -mx-6 px-6 rounded-lg">
                  <span className="text-xl font-bold text-white">Net Income</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(netIncome)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance-sheet" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Balance Sheet</h3>
                    <p className="text-sm text-gray-500 mt-1">As of December 23, 2024</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
                {/* Assets */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Assets</h4>
                  <div className="space-y-3">
                    {accountsByType.asset.map((account) => (
                      <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({account.code})</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 bg-blue-50 dark:bg-blue-900/20 -mx-6 px-6 mt-4">
                      <span className="font-bold text-blue-700 dark:text-blue-300">Total Assets</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Liabilities</h4>
                  <div className="space-y-3">
                    {accountsByType.liability.map((account) => (
                      <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({account.code})</span>
                        </div>
                        <span className="font-medium text-red-600">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 bg-red-50 dark:bg-red-900/20 -mx-6 px-6 mt-4">
                      <span className="font-bold text-red-700 dark:text-red-300">Total Liabilities</span>
                      <span className="font-bold text-red-700 dark:text-red-300">{formatCurrency(totalLiabilities)}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-6">Equity</h4>
                  <div className="space-y-3">
                    {accountsByType.equity.map((account) => (
                      <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({account.code})</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-3 bg-purple-50 dark:bg-purple-900/20 -mx-6 px-6 mt-4">
                      <span className="font-bold text-purple-700 dark:text-purple-300">Total Equity</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">{formatCurrency(totalEquity)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 bg-gradient-to-r from-emerald-500 to-green-500 -mx-6 px-6 mt-6 rounded-lg">
                    <span className="font-bold text-white">Total Liabilities & Equity</span>
                    <span className="font-bold text-white">{formatCurrency(totalLiabilities + totalEquity)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cash-flow" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow Statement</h3>
                    <p className="text-sm text-gray-500 mt-1">For the year ending December 31, 2024</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Operating Activities */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cash Flows from Operating Activities</h4>
                  <div className="space-y-2">
                    {Object.entries(cashFlowData.operating).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className={`font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {amount >= 0 ? '' : '('}{formatCurrency(Math.abs(amount))}{amount < 0 && ')'}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 bg-green-50 dark:bg-green-900/20 -mx-6 px-6">
                      <span className="font-semibold text-green-700 dark:text-green-300">Net Cash from Operating</span>
                      <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(operatingCashFlow)}</span>
                    </div>
                  </div>
                </div>

                {/* Investing Activities */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cash Flows from Investing Activities</h4>
                  <div className="space-y-2">
                    {Object.entries(cashFlowData.investing).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className={`font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {amount >= 0 ? '' : '('}{formatCurrency(Math.abs(amount))}{amount < 0 && ')'}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 bg-red-50 dark:bg-red-900/20 -mx-6 px-6">
                      <span className="font-semibold text-red-700 dark:text-red-300">Net Cash from Investing</span>
                      <span className="font-bold text-red-700 dark:text-red-300">({formatCurrency(Math.abs(investingCashFlow))})</span>
                    </div>
                  </div>
                </div>

                {/* Financing Activities */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cash Flows from Financing Activities</h4>
                  <div className="space-y-2">
                    {Object.entries(cashFlowData.financing).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className={`font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {amount >= 0 ? '' : '('}{formatCurrency(Math.abs(amount))}{amount < 0 && ')'}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2 bg-red-50 dark:bg-red-900/20 -mx-6 px-6">
                      <span className="font-semibold text-red-700 dark:text-red-300">Net Cash from Financing</span>
                      <span className="font-bold text-red-700 dark:text-red-300">({formatCurrency(Math.abs(financingCashFlow))})</span>
                    </div>
                  </div>
                </div>

                {/* Net Change in Cash */}
                <div className="flex items-center justify-between py-4 bg-gradient-to-r from-emerald-500 to-green-500 -mx-6 px-6 rounded-lg">
                  <span className="text-xl font-bold text-white">Net Change in Cash</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(netCashFlow)}</span>
                </div>

                {/* Cash Position Summary */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Beginning Cash</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(72920.50)}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-emerald-600 mb-1">Net Change</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(netCashFlow)}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-blue-600 mb-1">Ending Cash</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(72920.50 + netCashFlow)}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Accounts Tab (Chart of Accounts) */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chart of Accounts</h3>
                  <button
                    onClick={() => setShowNewAccountDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Account
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {/* Assets */}
                <div>
                  <button
                    onClick={() => toggleAccountExpansion('asset')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedAccounts.includes('asset') ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Assets</span>
                      <span className="text-sm text-gray-500">({accountsByType.asset.length} accounts)</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalAssets)}</span>
                  </button>
                  {expandedAccounts.includes('asset') && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-4 pb-4">
                      {accountsByType.asset.map((account) => (
                        <div key={account.id} className="flex items-center justify-between py-3 px-4 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-mono">{account.code}</span>
                            <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{account.subtype}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Liabilities */}
                <div>
                  <button
                    onClick={() => toggleAccountExpansion('liability')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedAccounts.includes('liability') ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <CreditCard className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Liabilities</span>
                      <span className="text-sm text-gray-500">({accountsByType.liability.length} accounts)</span>
                    </div>
                    <span className="font-bold text-red-600">{formatCurrency(totalLiabilities)}</span>
                  </button>
                  {expandedAccounts.includes('liability') && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-4 pb-4">
                      {accountsByType.liability.map((account) => (
                        <div key={account.id} className="flex items-center justify-between py-3 px-4 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-mono">{account.code}</span>
                            <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{account.subtype}</span>
                          </div>
                          <span className="font-medium text-red-600">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equity */}
                <div>
                  <button
                    onClick={() => toggleAccountExpansion('equity')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedAccounts.includes('equity') ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Equity</span>
                      <span className="text-sm text-gray-500">({accountsByType.equity.length} accounts)</span>
                    </div>
                    <span className="font-bold text-purple-600">{formatCurrency(totalEquity)}</span>
                  </button>
                  {expandedAccounts.includes('equity') && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-4 pb-4">
                      {accountsByType.equity.map((account) => (
                        <div key={account.id} className="flex items-center justify-between py-3 px-4 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-mono">{account.code}</span>
                            <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{account.subtype}</span>
                          </div>
                          <span className="font-medium text-purple-600">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Revenue */}
                <div>
                  <button
                    onClick={() => toggleAccountExpansion('revenue')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedAccounts.includes('revenue') ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Revenue</span>
                      <span className="text-sm text-gray-500">({accountsByType.revenue.length} accounts)</span>
                    </div>
                    <span className="font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                  </button>
                  {expandedAccounts.includes('revenue') && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-4 pb-4">
                      {accountsByType.revenue.map((account) => (
                        <div key={account.id} className="flex items-center justify-between py-3 px-4 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-mono">{account.code}</span>
                            <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{account.subtype}</span>
                          </div>
                          <span className="font-medium text-green-600">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expenses */}
                <div>
                  <button
                    onClick={() => toggleAccountExpansion('expense')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedAccounts.includes('expense') ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Receipt className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">Expenses</span>
                      <span className="text-sm text-gray-500">({accountsByType.expense.length} accounts)</span>
                    </div>
                    <span className="font-bold text-orange-600">{formatCurrency(totalCostOfSales + totalOperatingExpenses)}</span>
                  </button>
                  {expandedAccounts.includes('expense') && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-4 pb-4">
                      {accountsByType.expense.map((account) => (
                        <div key={account.id} className="flex items-center justify-between py-3 px-4 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-mono">{account.code}</span>
                            <span className="text-gray-700 dark:text-gray-300">{account.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{account.subtype}</span>
                          </div>
                          <span className="font-medium text-orange-600">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            {/* Bank Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockBankAccounts.map((account) => (
                <div key={account.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      account.type === 'checking' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      account.type === 'savings' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {account.type === 'credit' ? (
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      ) : (
                        <Building2 className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {account.status === 'connected' && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Connected
                        </span>
                      )}
                      {account.status === 'needs_attention' && (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Needs Attention
                        </span>
                      )}
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{account.institution} • {account.accountNumber}</p>
                  <p className={`text-3xl font-bold mt-4 ${account.balance < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {formatCurrency(account.balance)}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500">
                      Last synced: {new Date(account.lastSync).toLocaleString()}
                    </p>
                    <button className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      <RefreshCw className="w-3 h-3" />
                      Sync
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Transactions</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(transaction.date)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                            {transaction.payee && (
                              <p className="text-xs text-gray-500">{transaction.payee}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.account}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'reconciled' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            transaction.status === 'cleared' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {transaction.status === 'reconciled' && <CheckCircle className="w-3 h-3" />}
                            {transaction.status === 'cleared' && <CheckCircle className="w-3 h-3" />}
                            {transaction.status === 'pending' && <Clock className="w-3 h-3" />}
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Transaction Dialog */}
        <Dialog open={showNewTransactionDialog} onOpenChange={setShowNewTransactionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
              <DialogDescription>Record a new income, expense, or transfer.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input type="date" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input type="text" placeholder="Enter description" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input type="number" placeholder="0.00" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option>Business Checking</option>
                  <option>Business Savings</option>
                  <option>Business Credit Card</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option>Sales Revenue</option>
                  <option>Service Revenue</option>
                  <option>Operating Expenses</option>
                  <option>Payroll Expenses</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setShowNewTransactionDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewTransactionDialog(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Transaction
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Account Dialog */}
        <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Account</DialogTitle>
              <DialogDescription>Add a new account to your chart of accounts.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Code</label>
                <input type="text" placeholder="e.g., 1000" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                <input type="text" placeholder="Enter account name" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-type</label>
                <input type="text" placeholder="e.g., Current Assets" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                <textarea placeholder="Enter description" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setShowNewAccountDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewAccountDialog(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Account
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
