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
  Printer,
  Share2,
  Settings,
  MoreHorizontal,
  Search,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFinancial, type FinancialRecord, type FinancialRecordType, type FinancialStatus } from '@/lib/hooks/use-financial'
import { toast } from 'sonner'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Centralized Mock Data - Investor-Ready
import {
  financialAccounts,
  financialBankAccounts,
  financialTransactions,
  financialBudgetItems,
  financialProfitLoss,
  financialCashFlow,
  financialAIInsights,
  financialCollaborators,
  financialPredictions,
  financialActivities,
  financialQuickActions,
} from '@/lib/mock-data/adapters'

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

// Use centralized mock data - mapped to local variable names for compatibility
const mockAccounts = financialAccounts as Account[]
const mockBankAccounts = financialBankAccounts as BankAccount[]
const mockTransactions = financialTransactions as Transaction[]
const mockBudgetItems = financialBudgetItems as BudgetItem[]
const profitLossData = financialProfitLoss
const cashFlowData = financialCashFlow
const mockAIInsights = financialAIInsights
const mockFinancialCollaborators = financialCollaborators
const mockFinancialPredictions = financialPredictions
const mockFinancialActivities = financialActivities
const mockFinancialQuickActions = financialQuickActions

export default function FinancialClient({ initialFinancial }: { initialFinancial: FinancialRecord[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('this-year')
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false)
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false)
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>(['asset', 'liability', 'equity'])
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  const { records, createRecord, updateRecord, deleteRecord, loading: creating, refetch } = useFinancial({})
  const displayRecords = records.length > 0 ? records : initialFinancial
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state for new transaction
  const [newTransactionForm, setNewTransactionForm] = useState({
    title: '',
    type: 'expense' as FinancialRecordType,
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  // Form state for new account
  const [newAccountForm, setNewAccountForm] = useState({
    accountType: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    code: '',
    name: '',
    subtype: '',
    description: ''
  })

  const handleCreateTransaction = async () => {
    if (!newTransactionForm.title || !newTransactionForm.amount) {
      toast.error('Please fill in title and amount')
      return
    }

    try {
      await createRecord({
        title: newTransactionForm.title,
        record_type: newTransactionForm.type,
        category: newTransactionForm.category || 'General',
        amount: parseFloat(newTransactionForm.amount),
        description: newTransactionForm.description || null,
        record_date: newTransactionForm.date,
        status: 'pending' as FinancialStatus,
        priority: 'medium',
        currency: 'USD',
        is_taxable: true
      } as any)

      toast.success('Transaction created successfully!')
      setShowNewTransactionDialog(false)
      setNewTransactionForm({
        title: '',
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      })
      refetch()
    } catch (error) {
      toast.error('Failed to create transaction')
      console.error(error)
    }
  }

  // Calculations
  const totalRevenue = Object.values(profitLossData?.revenue || {}).reduce((a, b) => a + b, 0)
  const totalCostOfSales = Object.values(profitLossData?.costOfRevenue || {}).reduce((a, b) => a + b, 0)
  const grossProfit = totalRevenue - totalCostOfSales
  const totalOperatingExpenses = Object.values(profitLossData?.operatingExpenses || {}).reduce((a, b) => a + b, 0)
  const netIncome = grossProfit - totalOperatingExpenses

  const totalAssets = (mockAccounts || []).filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = (mockAccounts || []).filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0)
  const totalEquity = (mockAccounts || []).filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0)

  const operatingCashFlow = Object.values(cashFlowData?.operating || {}).reduce((a, b) => a + b, 0)
  const investingCashFlow = Object.values(cashFlowData?.investing || {}).reduce((a, b) => a + b, 0)
  const financingCashFlow = Object.values(cashFlowData?.financing || {}).reduce((a, b) => a + b, 0)
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

  // Create new account handler
  const handleCreateAccount = async () => {
    if (!newAccountForm.name || !newAccountForm.code) {
      toast.error('Please fill in account name and code')
      return
    }

    setIsProcessing(true)
    try {
      await createRecord({
        title: newAccountForm.name,
        record_type: newAccountForm.accountType as FinancialRecordType,
        category: newAccountForm.subtype || 'General',
        amount: 0,
        description: newAccountForm.description || null,
        record_date: new Date().toISOString().split('T')[0],
        status: 'approved' as FinancialStatus,
        priority: 'medium',
        currency: 'USD',
        is_taxable: false,
        account_code: newAccountForm.code,
        record_number: `ACC-${newAccountForm.code}`
      } as any)

      toast.success('Account created successfully!', {
        description: `Account "${newAccountForm.name}" has been added to your chart of accounts.`
      })
      setShowNewAccountDialog(false)
      setNewAccountForm({
        accountType: 'asset',
        code: '',
        name: '',
        subtype: '',
        description: ''
      })
      refetch()
    } catch (error) {
      toast.error('Failed to create account', {
        description: 'Please try again or contact support.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handlers
  const handleExportFinancials = async () => {
    setIsProcessing(true)
    toast.loading('Preparing export...', { id: 'export' })

    try {
      // Generate CSV data from records
      const csvData = displayRecords.map(record => ({
        Date: record.record_date,
        Title: record.title,
        Type: record.record_type,
        Category: record.category,
        Amount: record.amount,
        Currency: record.currency,
        Status: record.status
      }))

      const csvContent = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Export completed!', {
        id: 'export',
        description: 'Financial reports have been downloaded.'
      })
    } catch (error) {
      toast.error('Export failed', {
        id: 'export',
        description: 'Please try again.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReconcileAccount = async (account: typeof mockAccounts[0]) => {
    setIsProcessing(true)
    toast.loading(`Reconciling "${account.name}"...`, { id: 'reconcile' })

    try {
      // Find matching records for this account and update their status
      const matchingRecords = displayRecords.filter(
        r => r.account_code === account.code || r.category === account.name
      )

      for (const record of matchingRecords) {
        if (record.status === 'pending') {
          await updateRecord({ id: record.id, status: 'approved' as FinancialStatus })
        }
      }

      toast.success('Reconciliation complete!', {
        id: 'reconcile',
        description: `Account "${account.name}" has been reconciled. ${matchingRecords.length} transactions reviewed.`
      })
      refetch()
    } catch (error) {
      toast.error('Reconciliation failed', {
        id: 'reconcile',
        description: 'Please try again.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    setIsProcessing(true)
    toast.loading(`Generating ${reportType} report...`, { id: 'report' })

    try {
      // Filter records based on report type
      let reportData = displayRecords
      if (reportType === 'Income Statement' || reportType === 'Profit & Loss') {
        reportData = displayRecords.filter(r =>
          r.record_type === 'revenue' || r.record_type === 'expense'
        )
      } else if (reportType === 'Balance Sheet') {
        reportData = displayRecords.filter(r =>
          r.record_type === 'asset' || r.record_type === 'liability' || r.record_type === 'equity'
        )
      }

      // Generate PDF-ready data
      const reportContent = {
        title: `${reportType} Report`,
        generatedAt: new Date().toISOString(),
        period: selectedPeriod,
        totalRecords: reportData.length,
        summary: {
          totalRevenue: reportData.filter(r => r.record_type === 'revenue').reduce((sum, r) => sum + r.amount, 0),
          totalExpenses: reportData.filter(r => r.record_type === 'expense').reduce((sum, r) => sum + r.amount, 0),
        },
        records: reportData
      }

      // For now, download as JSON (could be extended to PDF)
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`${reportType} report generated!`, {
        id: 'report',
        description: 'Report has been downloaded.'
      })
    } catch (error) {
      toast.error('Report generation failed', {
        id: 'report',
        description: 'Please try again.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApproveTransaction = async (transaction: typeof mockTransactions[0] | FinancialRecord) => {
    setIsProcessing(true)
    const transactionTitle = 'title' in transaction ? transaction.title : transaction.description

    try {
      // Check if it's a real record from database
      if ('id' in transaction && displayRecords.find(r => r.id === transaction.id)) {
        await updateRecord({
          id: transaction.id,
          status: 'approved' as FinancialStatus,
          approved_at: new Date().toISOString()
        })
        toast.success('Transaction approved!', {
          description: `"${transactionTitle}" has been approved.`
        })
        refetch()
      } else {
        // Mock transaction - just show toast
        toast.success('Transaction approved!', {
          description: `"${transactionTitle}" has been approved.`
        })
      }
    } catch (error) {
      toast.error('Failed to approve transaction', {
        description: 'Please try again.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    setIsProcessing(true)
    try {
      await deleteRecord(transactionId)
      toast.success('Transaction deleted!', {
        description: 'The transaction has been removed.'
      })
      refetch()
    } catch (error) {
      toast.error('Failed to delete transaction', {
        description: 'Please try again.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSyncBankAccount = async (accountId: string, accountName: string) => {
    setIsProcessing(true)
    toast.loading(`Syncing ${accountName}...`, { id: 'sync' })

    try {
      // Call API to sync bank account
      const response = await fetch(`/api/financial/bank-accounts/${accountId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      toast.success('Sync complete!', {
        id: 'sync',
        description: `${accountName} has been synchronized.`
      })
      refetch()
    } catch (error) {
      toast.error('Sync failed', {
        id: 'sync',
        description: 'Please try again.'
      })
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
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
            {/* Collaboration Indicator */}
            <CollaborationIndicator
              collaborators={mockFinancialCollaborators}
              maxVisible={3}
            />
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
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-300 rounded-lg px-4 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Financial Overview</h2>
                    <p className="text-emerald-100">Net Income: {formatCurrency(netIncome)} this period</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleExportFinancials}
                    disabled={isProcessing}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                    <button
                      onClick={() => setActiveTab('banking')}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View All
                    </button>
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
                    <button
                      onClick={() => {
                        setActiveTab('settings')
                        setSettingsTab('accounting')
                        toast.success('Navigate to budget settings to edit budgets')
                      }}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Edit Budget
                    </button>
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
                  <button
                    onClick={() => {
                      setActiveTab('settings')
                      setSettingsTab('banking')
                      toast.success('Connect your bank accounts in settings')
                    }}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
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
                    <button
                      onClick={() => window.print()}
                      disabled={isProcessing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                      title="Print"
                    >
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleGenerateReport('Profit & Loss')}
                      disabled={isProcessing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => {
                        toast.promise(
                          navigator.clipboard.writeText(window.location.href),
                          {
                            loading: 'Copying link...',
                            success: 'Link copied to clipboard!',
                            error: 'Failed to copy link'
                          }
                        )
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Share"
                    >
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
                    {Object.entries(profitLossData?.revenue || {}).map(([name, amount]) => (
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
                    {Object.entries(profitLossData.costOfRevenue || {}).map(([name, amount]) => (
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
                    {Object.entries(profitLossData?.operatingExpenses || {}).map(([name, amount]) => (
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
                    <button
                      onClick={() => window.print()}
                      disabled={isProcessing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                      title="Print"
                    >
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleGenerateReport('Balance Sheet')}
                      disabled={isProcessing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                      title="Download"
                    >
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
                    <button
                      onClick={() => window.print()}
                      disabled={isProcessing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                      title="Print"
                    >
                      <Printer className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleGenerateReport('Cash Flow')}
                      disabled={isProcessing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                      title="Download"
                    >
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
                    {Object.entries(cashFlowData?.operating || {}).map(([name, amount]) => (
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
                    {Object.entries(cashFlowData?.investing || {}).map(([name, amount]) => (
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
                    {Object.entries(cashFlowData?.financing || {}).map(([name, amount]) => (
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
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.balance)}</span>
                            <button
                              onClick={() => handleReconcileAccount(account)}
                              disabled={isProcessing}
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
                            >
                              Reconcile
                            </button>
                          </div>
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
                    <button
                      onClick={() => handleSyncBankAccount(account.id, account.name)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1">
                            {transaction.status === 'pending' && (
                              <button
                                onClick={() => handleApproveTransaction(transaction)}
                                disabled={isProcessing}
                                className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              disabled={isProcessing}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Financial Settings</h2>
                    <p className="text-emerald-100">Configure accounting, reporting, and integration preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Configured</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-6">
                  <nav className="p-2 space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'accounting', icon: FileText, label: 'Accounting', desc: 'Chart of accounts' },
                      { id: 'reporting', icon: BarChart3, label: 'Reporting', desc: 'Report options' },
                      { id: 'banking', icon: Landmark, label: 'Banking', desc: 'Bank connections' },
                      { id: 'notifications', icon: AlertCircle, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: RefreshCw, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs opacity-70">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                          <input type="text" defaultValue="Acme Corporation" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax ID</label>
                          <input type="text" defaultValue="12-3456789" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fiscal Year Start</label>
                          <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>January</option>
                            <option>April</option>
                            <option>July</option>
                            <option>October</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Currency</label>
                          <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>USD - US Dollar</option>
                            <option>EUR - Euro</option>
                            <option>GBP - British Pound</option>
                            <option>ZAR - South African Rand</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Number Format</p>
                            <p className="text-sm text-gray-500">Choose decimal and thousands separators</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>1,234.56</option>
                            <option>1.234,56</option>
                            <option>1 234.56</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Date Format</p>
                            <p className="text-sm text-gray-500">Choose your preferred date format</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Negative Numbers</p>
                            <p className="text-sm text-gray-500">How to display negative amounts</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>-$100.00</option>
                            <option>($100.00)</option>
                            <option>$100.00-</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Accounting Settings */}
                {settingsTab === 'accounting' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accounting Method</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <input type="radio" name="method" defaultChecked className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Accrual Basis</p>
                              <p className="text-sm text-gray-500">Record revenue when earned, expenses when incurred</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700">Recommended</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <input type="radio" name="method" className="w-4 h-4 text-emerald-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Cash Basis</p>
                              <p className="text-sm text-gray-500">Record revenue when received, expenses when paid</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Accounts</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accounts Receivable</label>
                          <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>1100 - Accounts Receivable</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accounts Payable</label>
                          <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>2000 - Accounts Payable</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Retained Earnings</label>
                          <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>3100 - Retained Earnings</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sales Revenue</label>
                          <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>4000 - Sales Revenue</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-Categorization</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">AI Categorization</p>
                            <p className="text-sm text-gray-500">Automatically categorize transactions using AI</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Learn from Corrections</p>
                            <p className="text-sm text-gray-500">Improve AI based on manual corrections</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reporting Settings */}
                {settingsTab === 'reporting' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Templates</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <LineChart className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Profit & Loss Statement</p>
                              <p className="text-sm text-gray-500">Income statement template</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport('Profit & Loss')}
                          >
                            Customize
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <PieChart className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Balance Sheet</p>
                              <p className="text-sm text-gray-500">Assets and liabilities report</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport('Balance Sheet')}
                          >
                            Customize
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Cash Flow Statement</p>
                              <p className="text-sm text-gray-500">Cash movement report</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport('Cash Flow')}
                          >
                            Customize
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scheduled Reports</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Monthly Summary</p>
                            <p className="text-sm text-gray-500">Email monthly financial summary</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Quarterly Reports</p>
                            <p className="text-sm text-gray-500">Generate quarterly statements</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Annual Tax Package</p>
                            <p className="text-sm text-gray-500">Prepare year-end tax documents</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banking Settings */}
                {settingsTab === 'banking' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connected Banks</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Chase Business Checking</p>
                              <p className="text-sm text-gray-500">Last synced: 5 minutes ago</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!confirm('Are you sure? Disconnecting will stop automatic transaction syncing.')) return
                                toast.loading('Disconnecting Chase Business Checking...', { id: 'disconnect-chase' })
                                try {
                                  const response = await fetch('/api/financial/bank-accounts/chase/disconnect', { method: 'POST' })
                                  if (!response.ok) throw new Error('Failed')
                                  toast.success('Chase Business Checking has been disconnected', { id: 'disconnect-chase' })
                                  refetch()
                                } catch {
                                  toast.error('Failed to disconnect account', { id: 'disconnect-chase' })
                                }
                              }}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                              <CreditCard className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">American Express Business</p>
                              <p className="text-sm text-gray-500">Last synced: 2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Connected</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!confirm('Are you sure? Disconnecting will stop automatic transaction syncing.')) return
                                toast.loading('Disconnecting American Express Business...', { id: 'disconnect-amex' })
                                try {
                                  const response = await fetch('/api/financial/bank-accounts/amex/disconnect', { method: 'POST' })
                                  if (!response.ok) throw new Error('Failed')
                                  toast.success('American Express Business has been disconnected', { id: 'disconnect-amex' })
                                  refetch()
                                } catch {
                                  toast.error('Failed to disconnect account', { id: 'disconnect-amex' })
                                }
                              }}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={async () => {
                            toast.loading('Initializing Plaid connection...', { id: 'plaid-connect' })
                            try {
                              const response = await fetch('/api/financial/bank-accounts/connect', { method: 'POST' })
                              if (!response.ok) throw new Error('Failed')
                              toast.success('Bank connection ready - follow the instructions to link your account', { id: 'plaid-connect' })
                            } catch {
                              toast.dismiss('plaid-connect')
                              // Plaid integration coming soon
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connect Another Bank
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sync Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-Sync Frequency</p>
                            <p className="text-sm text-gray-500">How often to sync transactions</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>Every 15 minutes</option>
                            <option>Every hour</option>
                            <option>Every 6 hours</option>
                            <option>Daily</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Import Historical Data</p>
                            <p className="text-sm text-gray-500">Sync past transactions</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>Last 90 days</option>
                            <option>Last 6 months</option>
                            <option>Last year</option>
                            <option>All available</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Alerts</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Large Transaction Alerts</p>
                            <p className="text-sm text-gray-500">Notify for transactions over threshold</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="text" defaultValue="$1,000" className="w-24 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm" />
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Low Balance Alert</p>
                            <p className="text-sm text-gray-500">Warn when account balance is low</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="text" defaultValue="$5,000" className="w-24 px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm" />
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Duplicate Transaction Warning</p>
                            <p className="text-sm text-gray-500">Alert for potential duplicate entries</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Weekly Summary Email</p>
                            <p className="text-sm text-gray-500">Receive weekly financial overview</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Budget Variance Alerts</p>
                            <p className="text-sm text-gray-500">Alert when budget exceeds threshold</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Invoice Due Reminders</p>
                            <p className="text-sm text-gray-500">Remind about upcoming due dates</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Automatic Backups</p>
                            <p className="text-sm text-gray-500">Backup financial data daily</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Data Retention Period</p>
                            <p className="text-sm text-gray-500">How long to keep historical data</p>
                          </div>
                          <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                            <option>7 years</option>
                            <option>10 years</option>
                            <option>Forever</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Trail</p>
                            <p className="text-sm text-gray-500">Log all changes to financial records</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integrations</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">QuickBooks Export</p>
                              <p className="text-sm text-gray-500">Export data to QuickBooks format</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              toast.loading('Configuring QuickBooks export...', { id: 'quickbooks' })
                              try {
                                const response = await fetch('/api/financial/integrations/quickbooks/configure', { method: 'POST' })
                                if (!response.ok) throw new Error('Failed')
                                toast.success('QuickBooks export configured successfully', { id: 'quickbooks' })
                              } catch {
                                toast.info('QuickBooks setup required', { id: 'quickbooks', description: 'Configure API credentials in Settings → Integrations' })
                              }
                            }}
                          >
                            Configure
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Xero Integration</p>
                              <p className="text-sm text-gray-500">Sync with Xero accounting</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              toast.loading('Initializing Xero OAuth connection...', { id: 'xero' })
                              try {
                                const response = await fetch('/api/financial/integrations/xero/connect', { method: 'POST' })
                                if (!response.ok) throw new Error('Failed')
                                const data = await response.json()
                                if (data.authUrl) {
                                  window.open(data.authUrl, '_blank')
                                  toast.success('Opening Xero authorization page', { id: 'xero' })
                                } else {
                                  toast.dismiss('xero')
                                  setActiveTab('settings')
                                }
                              } catch {
                                toast.info('Xero setup required', { id: 'xero', description: 'Configure OAuth credentials in Settings → Integrations' })
                              }
                            }}
                          >
                            Connect
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Share2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">API Access</p>
                              <p className="text-sm text-gray-500">Enable programmatic access</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('settings')}
                          >
                            Manage Keys
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900 p-6">
                      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Close Fiscal Year</p>
                            <p className="text-sm text-gray-500">Lock previous year's transactions</p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (!confirm('Close Fiscal Year?\n\nThis will lock all transactions from the previous fiscal year. This action cannot be undone.')) return
                              toast.loading('Closing fiscal year...', { id: 'close-year' })
                              try {
                                const response = await fetch('/api/financial/fiscal-year/close', { method: 'POST' })
                                if (!response.ok) throw new Error('Failed')
                                toast.success('Fiscal year closed - Previous year transactions are now locked', { id: 'close-year' })
                                refetch()
                              } catch {
                                toast.error('Failed to close fiscal year', { id: 'close-year' })
                              }
                            }}
                          >
                            Close Year
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset All Data</p>
                            <p className="text-sm text-gray-500">Permanently delete all financial data</p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              toast.error('Action blocked - Please contact support to reset your financial data. This destructive action requires admin approval.')
                            }}
                          >
                            Reset Data
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                <select
                  value={newTransactionForm.type}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, type: e.target.value as FinancialRecordType }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="revenue">Income</option>
                  <option value="expense">Expense</option>
                  <option value="general">Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  value={newTransactionForm.date}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={newTransactionForm.title}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newTransactionForm.amount}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={newTransactionForm.category}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select category...</option>
                  <option value="Sales Revenue">Sales Revenue</option>
                  <option value="Service Revenue">Service Revenue</option>
                  <option value="Operating Expenses">Operating Expenses</option>
                  <option value="Payroll Expenses">Payroll Expenses</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={newTransactionForm.description}
                  onChange={(e) => setNewTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
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
                onClick={handleCreateTransaction}
                disabled={creating || !newTransactionForm.title || !newTransactionForm.amount}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Saving...' : 'Save Transaction'}
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
                <select
                  value={newAccountForm.accountType}
                  onChange={(e) => setNewAccountForm(prev => ({ ...prev, accountType: e.target.value as any }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Code</label>
                <input
                  type="text"
                  placeholder="e.g., 1000"
                  value={newAccountForm.code}
                  onChange={(e) => setNewAccountForm(prev => ({ ...prev, code: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                <input
                  type="text"
                  placeholder="Enter account name"
                  value={newAccountForm.name}
                  onChange={(e) => setNewAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub-type</label>
                <input
                  type="text"
                  placeholder="e.g., Current Assets"
                  value={newAccountForm.subtype}
                  onChange={(e) => setNewAccountForm(prev => ({ ...prev, subtype: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                <textarea
                  placeholder="Enter description"
                  value={newAccountForm.description}
                  onChange={(e) => setNewAccountForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none"
                  rows={2}
                />
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
                onClick={handleCreateAccount}
                disabled={isProcessing || !newAccountForm.name || !newAccountForm.code}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Creating...' : 'Create Account'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI-Powered Financial Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AIInsightsPanel
            insights={mockAIInsights}
            onAskQuestion={(q) => console.log('Financial Question:', q)}
          />
          <PredictiveAnalytics predictions={mockFinancialPredictions} />
        </div>

        {/* Activity Feed */}
        <div className="mt-6">
          <ActivityFeed
            activities={mockFinancialActivities}
            maxItems={5}
            showFilters={true}
          />
        </div>

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar actions={mockFinancialQuickActions} />
      </div>
    </div>
  )
}
