"use client"

import { useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Banknote,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  ShoppingCart,
  Zap,
  Users,
  Wallet
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TransactionType = 'all' | 'income' | 'expense'
type PaymentMethod = 'all' | 'card' | 'bank' | 'cash' | 'crypto'

export default function TransactionsV2Page() {
  const [transactionType, setTransactionType] = useState<TransactionType>('all')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('all')

  const stats = [
    {
      label: 'Total Income',
      value: '$284,750',
      change: '+18.2%',
      trend: 'up' as const,
      icon: ArrowUpRight,
      color: 'text-green-600'
    },
    {
      label: 'Total Expenses',
      value: '$147,290',
      change: '+12.7%',
      trend: 'up' as const,
      icon: ArrowDownLeft,
      color: 'text-red-600'
    },
    {
      label: 'Net Balance',
      value: '$137,460',
      change: '+24.8%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      label: 'Avg Transaction',
      value: '$2,847',
      change: '+8.4%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-blue-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Income',
      description: 'Record payment received',
      icon: ArrowUpRight,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'New Expense',
      description: 'Log business expense',
      icon: ArrowDownLeft,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Bank Transfer',
      description: 'Transfer between accounts',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Export Report',
      description: 'Download transaction data',
      icon: Download,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Reconcile',
      description: 'Match bank statements',
      icon: CheckCircle2,
      color: 'from-teal-500 to-green-500'
    },
    {
      label: 'Schedule Payment',
      description: 'Set up recurring transaction',
      icon: Calendar,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Filter Transactions',
      description: 'Advanced search options',
      icon: Filter,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Bulk Import',
      description: 'Upload CSV or Excel file',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const transactions = [
    {
      id: 'TXN-28471',
      description: 'Client Payment - Project Milestone',
      amount: 15000,
      type: 'income' as const,
      category: 'Revenue',
      method: 'bank',
      status: 'completed',
      date: '2024-02-15',
      reference: 'INV-2847',
      account: 'Business Checking'
    },
    {
      id: 'TXN-28470',
      description: 'Office Supplies - Amazon Business',
      amount: -847.50,
      type: 'expense' as const,
      category: 'Supplies',
      method: 'card',
      status: 'completed',
      date: '2024-02-15',
      reference: 'EXP-1249',
      account: 'Company Credit Card'
    },
    {
      id: 'TXN-28469',
      description: 'Software Subscription - Adobe Creative Cloud',
      amount: -52.99,
      type: 'expense' as const,
      category: 'Software',
      method: 'card',
      status: 'completed',
      date: '2024-02-14',
      reference: 'SUB-847',
      account: 'Company Credit Card'
    },
    {
      id: 'TXN-28468',
      description: 'Consulting Services Payment',
      amount: 8500,
      type: 'income' as const,
      category: 'Services',
      method: 'bank',
      status: 'completed',
      date: '2024-02-14',
      reference: 'INV-2846',
      account: 'Business Checking'
    },
    {
      id: 'TXN-28467',
      description: 'Internet & Hosting - AWS',
      amount: -284.75,
      type: 'expense' as const,
      category: 'Technology',
      method: 'card',
      status: 'completed',
      date: '2024-02-13',
      reference: 'EXP-1248',
      account: 'Company Credit Card'
    },
    {
      id: 'TXN-28466',
      description: 'Marketing Campaign - Google Ads',
      amount: -1250,
      type: 'expense' as const,
      category: 'Marketing',
      method: 'card',
      status: 'pending',
      date: '2024-02-13',
      reference: 'EXP-1247',
      account: 'Marketing Budget'
    },
    {
      id: 'TXN-28465',
      description: 'Product Sales - E-commerce',
      amount: 3847.90,
      type: 'income' as const,
      category: 'Sales',
      method: 'card',
      status: 'completed',
      date: '2024-02-12',
      reference: 'ORD-847',
      account: 'Merchant Account'
    },
    {
      id: 'TXN-28464',
      description: 'Payroll - February 2024',
      amount: -45000,
      type: 'expense' as const,
      category: 'Payroll',
      method: 'bank',
      status: 'completed',
      date: '2024-02-12',
      reference: 'PAY-0224',
      account: 'Payroll Account'
    },
    {
      id: 'TXN-28463',
      description: 'License Renewal - Business Software',
      amount: -499,
      type: 'expense' as const,
      category: 'Software',
      method: 'card',
      status: 'completed',
      date: '2024-02-11',
      reference: 'SUB-846',
      account: 'Company Credit Card'
    },
    {
      id: 'TXN-28462',
      description: 'Training Workshop Revenue',
      amount: 2400,
      type: 'income' as const,
      category: 'Education',
      method: 'bank',
      status: 'completed',
      date: '2024-02-11',
      reference: 'INV-2845',
      account: 'Business Checking'
    },
    {
      id: 'TXN-28461',
      description: 'Travel Expenses - Client Meeting',
      amount: -1247.80,
      type: 'expense' as const,
      category: 'Travel',
      method: 'card',
      status: 'pending',
      date: '2024-02-10',
      reference: 'EXP-1246',
      account: 'Company Credit Card'
    },
    {
      id: 'TXN-28460',
      description: 'Refund Issued - Order #7293',
      amount: -350,
      type: 'expense' as const,
      category: 'Refunds',
      method: 'card',
      status: 'completed',
      date: '2024-02-10',
      reference: 'REF-284',
      account: 'Merchant Account'
    }
  ]

  const filteredTransactions = transactions.filter(txn => {
    const typeMatch = transactionType === 'all' || txn.type === transactionType
    const methodMatch = paymentMethod === 'all' || txn.method === paymentMethod
    return typeMatch && methodMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Completed'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        }
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Failed'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: status
        }
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return CreditCard
      case 'bank':
        return Building2
      case 'cash':
        return Banknote
      case 'crypto':
        return Wallet
      default:
        return DollarSign
    }
  }

  const recentActivity = [
    { label: 'Client payment received', time: '2 minutes ago', color: 'text-green-600' },
    { label: 'Expense recorded', time: '15 minutes ago', color: 'text-red-600' },
    { label: 'Bank transfer completed', time: '1 hour ago', color: 'text-blue-600' },
    { label: 'Refund processed', time: '2 hours ago', color: 'text-orange-600' },
    { label: 'Subscription payment', time: '4 hours ago', color: 'text-purple-600' }
  ]

  const topCategories = [
    { label: 'Revenue', value: '$84.7K', color: 'bg-green-500' },
    { label: 'Payroll', value: '$45.0K', color: 'bg-blue-500' },
    { label: 'Marketing', value: '$12.5K', color: 'bg-purple-500' },
    { label: 'Software', value: '$8.4K', color: 'bg-cyan-500' },
    { label: 'Travel', value: '$4.2K', color: 'bg-orange-500' }
  ]

  const cashFlowData = {
    label: 'Monthly Cash Flow',
    current: 137460,
    target: 150000,
    subtitle: '+24.8% vs last month'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-gray-600 mt-2">Track and manage all financial transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setTransactionType('all')}
                  isActive={transactionType === 'all'}
                  variant="default"
                >
                  All Transactions
                </PillButton>
                <PillButton
                  onClick={() => setTransactionType('income')}
                  isActive={transactionType === 'income'}
                  variant="default"
                >
                  Income Only
                </PillButton>
                <PillButton
                  onClick={() => setTransactionType('expense')}
                  isActive={transactionType === 'expense'}
                  variant="default"
                >
                  Expenses Only
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setPaymentMethod('all')}
                  isActive={paymentMethod === 'all'}
                  variant="default"
                >
                  All Methods
                </PillButton>
                <PillButton
                  onClick={() => setPaymentMethod('card')}
                  isActive={paymentMethod === 'card'}
                  variant="default"
                >
                  Card
                </PillButton>
                <PillButton
                  onClick={() => setPaymentMethod('bank')}
                  isActive={paymentMethod === 'bank'}
                  variant="default"
                >
                  Bank Transfer
                </PillButton>
                <PillButton
                  onClick={() => setPaymentMethod('cash')}
                  isActive={paymentMethod === 'cash'}
                  variant="default"
                >
                  Cash
                </PillButton>
                <PillButton
                  onClick={() => setPaymentMethod('crypto')}
                  isActive={paymentMethod === 'crypto'}
                  variant="default"
                >
                  Crypto
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transactions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <div className="text-sm text-gray-600">
                {filteredTransactions.length} transactions
              </div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((txn) => {
                const statusBadge = getStatusBadge(txn.status)
                const MethodIcon = getMethodIcon(txn.method)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={txn.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-emerald-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          txn.type === 'income'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gradient-to-br from-red-500 to-pink-500'
                        } text-white`}>
                          {txn.type === 'income' ? (
                            <ArrowUpRight className="w-6 h-6" />
                          ) : (
                            <ArrowDownLeft className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{txn.description}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{txn.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{txn.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {txn.type === 'income' ? '+' : ''}${Math.abs(txn.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{txn.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{txn.account}</span>
                        </div>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">Ref: {txn.reference}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={cashFlowData.label}
              current={cashFlowData.current}
              target={cashFlowData.target}
              subtitle={cashFlowData.subtitle}
            />

            <MiniKPI
              title="Transaction Volume"
              value="2,847"
              change="+12.4%"
              trend="up"
              subtitle="This month"
            />

            <RankingList
              title="Top Categories"
              items={topCategories}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
