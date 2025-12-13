"use client"

import { useState } from 'react'
import {
  Receipt,
  CreditCard,
  DollarSign,
  TrendingUp,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  Download,
  Plus,
  Camera,
  Paperclip,
  Users,
  Building2,
  ShoppingBag,
  Plane
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ExpenseStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'reimbursed'
type ExpenseCategory = 'all' | 'travel' | 'meals' | 'supplies' | 'software' | 'other'

export default function ExpensesV2Page() {
  const [expenseStatus, setExpenseStatus] = useState<ExpenseStatus>('all')
  const [category, setCategory] = useState<ExpenseCategory>('all')

  const stats = [
    {
      label: 'Total Expenses',
      value: '$84,750',
      change: '+14.2%',
      trend: 'up' as const,
      icon: Receipt,
      color: 'text-purple-600'
    },
    {
      label: 'Pending Approval',
      value: '$12,847',
      change: '+8.7%',
      trend: 'up' as const,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      label: 'Approved',
      value: '$68,290',
      change: '+18.4%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Avg Expense',
      value: '$284',
      change: '+5.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-blue-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Expense',
      description: 'Submit expense report',
      icon: Plus,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Scan Receipt',
      description: 'Capture with camera',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Upload Receipt',
      description: 'Attach from files',
      icon: Upload,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Approve Batch',
      description: 'Review pending expenses',
      icon: CheckCircle2,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Export Report',
      description: 'Download expense data',
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Expense Policy',
      description: 'View company guidelines',
      icon: FileText,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Reimbursements',
      description: 'Track payment status',
      icon: DollarSign,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Team Expenses',
      description: 'View department spending',
      icon: Users,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const expenses = [
    {
      id: 'EXP-2847',
      description: 'Client Dinner - New York',
      amount: 284.50,
      category: 'meals',
      status: 'approved',
      submittedBy: 'Sarah Johnson',
      submittedDate: '2024-02-15',
      approvedBy: 'Michael Chen',
      approvedDate: '2024-02-16',
      hasReceipt: true,
      reimbursed: true,
      merchant: 'The Capital Grille',
      paymentMethod: 'Personal Card'
    },
    {
      id: 'EXP-2846',
      description: 'Flight to San Francisco - Tech Conference',
      amount: 847.00,
      category: 'travel',
      status: 'pending',
      submittedBy: 'David Park',
      submittedDate: '2024-02-15',
      hasReceipt: true,
      reimbursed: false,
      merchant: 'United Airlines',
      paymentMethod: 'Personal Card'
    },
    {
      id: 'EXP-2845',
      description: 'Office Supplies - Staples',
      amount: 127.80,
      category: 'supplies',
      status: 'approved',
      submittedBy: 'Emma Wilson',
      submittedDate: '2024-02-14',
      approvedBy: 'Sarah Johnson',
      approvedDate: '2024-02-15',
      hasReceipt: true,
      reimbursed: false,
      merchant: 'Staples',
      paymentMethod: 'Company Card'
    },
    {
      id: 'EXP-2844',
      description: 'Software License - Adobe Creative Cloud',
      amount: 52.99,
      category: 'software',
      status: 'approved',
      submittedBy: 'James Martinez',
      submittedDate: '2024-02-14',
      approvedBy: 'Michael Chen',
      approvedDate: '2024-02-14',
      hasReceipt: true,
      reimbursed: true,
      merchant: 'Adobe',
      paymentMethod: 'Company Card'
    },
    {
      id: 'EXP-2843',
      description: 'Hotel Stay - Boston Conference',
      amount: 456.00,
      category: 'travel',
      status: 'pending',
      submittedBy: 'Lisa Anderson',
      submittedDate: '2024-02-13',
      hasReceipt: true,
      reimbursed: false,
      merchant: 'Marriott Hotels',
      paymentMethod: 'Personal Card'
    },
    {
      id: 'EXP-2842',
      description: 'Team Lunch - Project Kickoff',
      amount: 187.50,
      category: 'meals',
      status: 'approved',
      submittedBy: 'Michael Chen',
      submittedDate: '2024-02-13',
      approvedBy: 'Sarah Johnson',
      approvedDate: '2024-02-13',
      hasReceipt: true,
      reimbursed: true,
      merchant: 'Chipotle',
      paymentMethod: 'Company Card'
    },
    {
      id: 'EXP-2841',
      description: 'Uber Rides - Client Meetings',
      amount: 89.20,
      category: 'travel',
      status: 'rejected',
      submittedBy: 'Robert Taylor',
      submittedDate: '2024-02-12',
      reviewedBy: 'Sarah Johnson',
      reviewedDate: '2024-02-13',
      hasReceipt: false,
      reimbursed: false,
      merchant: 'Uber',
      paymentMethod: 'Personal Card',
      rejectionReason: 'Missing receipt'
    },
    {
      id: 'EXP-2840',
      description: 'Parking - Airport',
      amount: 45.00,
      category: 'travel',
      status: 'approved',
      submittedBy: 'Sarah Johnson',
      submittedDate: '2024-02-12',
      approvedBy: 'Michael Chen',
      approvedDate: '2024-02-12',
      hasReceipt: true,
      reimbursed: true,
      merchant: 'LAX Parking',
      paymentMethod: 'Personal Card'
    },
    {
      id: 'EXP-2839',
      description: 'Conference Registration - TechSummit 2024',
      amount: 1249.00,
      category: 'other',
      status: 'pending',
      submittedBy: 'David Park',
      submittedDate: '2024-02-11',
      hasReceipt: true,
      reimbursed: false,
      merchant: 'TechSummit',
      paymentMethod: 'Personal Card'
    },
    {
      id: 'EXP-2838',
      description: 'Mobile Phone Bill - January',
      amount: 85.00,
      category: 'other',
      status: 'approved',
      submittedBy: 'Emma Wilson',
      submittedDate: '2024-02-11',
      approvedBy: 'Michael Chen',
      approvedDate: '2024-02-11',
      hasReceipt: true,
      reimbursed: true,
      merchant: 'Verizon',
      paymentMethod: 'Personal Card'
    }
  ]

  const filteredExpenses = expenses.filter(expense => {
    const statusMatch = expenseStatus === 'all' || expense.status === expenseStatus
    const categoryMatch = category === 'all' || expense.category === category
    return statusMatch && categoryMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Approved'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        }
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Rejected'
        }
      case 'reimbursed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: DollarSign,
          label: 'Reimbursed'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          label: status
        }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel':
        return Plane
      case 'meals':
        return ShoppingBag
      case 'supplies':
        return Building2
      case 'software':
        return FileText
      default:
        return Receipt
    }
  }

  const recentActivity = [
    { label: 'Expense approved', time: '5 minutes ago', color: 'text-green-600' },
    { label: 'New expense submitted', time: '30 minutes ago', color: 'text-blue-600' },
    { label: 'Receipt uploaded', time: '1 hour ago', color: 'text-purple-600' },
    { label: 'Reimbursement processed', time: '2 hours ago', color: 'text-emerald-600' },
    { label: 'Expense rejected', time: '3 hours ago', color: 'text-red-600' }
  ]

  const topCategories = [
    { label: 'Travel', value: '$2,847', color: 'bg-blue-500' },
    { label: 'Meals', value: '$1,284', color: 'bg-purple-500' },
    { label: 'Software', value: '$847', color: 'bg-cyan-500' },
    { label: 'Supplies', value: '$524', color: 'bg-green-500' },
    { label: 'Other', value: '$428', color: 'bg-orange-500' }
  ]

  const approvalProgressData = {
    label: 'Expenses Approved',
    current: 68290,
    target: 84750,
    subtitle: '80.6% approval rate'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Expenses
            </h1>
            <p className="text-gray-600 mt-2">Track and manage employee expense reports</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Expense
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setExpenseStatus('all')}
                  isActive={expenseStatus === 'all'}
                  variant="default"
                >
                  All Expenses
                </PillButton>
                <PillButton
                  onClick={() => setExpenseStatus('pending')}
                  isActive={expenseStatus === 'pending'}
                  variant="default"
                >
                  Pending
                </PillButton>
                <PillButton
                  onClick={() => setExpenseStatus('approved')}
                  isActive={expenseStatus === 'approved'}
                  variant="default"
                >
                  Approved
                </PillButton>
                <PillButton
                  onClick={() => setExpenseStatus('rejected')}
                  isActive={expenseStatus === 'rejected'}
                  variant="default"
                >
                  Rejected
                </PillButton>
                <PillButton
                  onClick={() => setExpenseStatus('reimbursed')}
                  isActive={expenseStatus === 'reimbursed'}
                  variant="default"
                >
                  Reimbursed
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setCategory('all')}
                  isActive={category === 'all'}
                  variant="default"
                >
                  All Categories
                </PillButton>
                <PillButton
                  onClick={() => setCategory('travel')}
                  isActive={category === 'travel'}
                  variant="default"
                >
                  Travel
                </PillButton>
                <PillButton
                  onClick={() => setCategory('meals')}
                  isActive={category === 'meals'}
                  variant="default"
                >
                  Meals
                </PillButton>
                <PillButton
                  onClick={() => setCategory('supplies')}
                  isActive={category === 'supplies'}
                  variant="default"
                >
                  Supplies
                </PillButton>
                <PillButton
                  onClick={() => setCategory('software')}
                  isActive={category === 'software'}
                  variant="default"
                >
                  Software
                </PillButton>
                <PillButton
                  onClick={() => setCategory('other')}
                  isActive={category === 'other'}
                  variant="default"
                >
                  Other
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expense List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Expense Reports</h2>
              <div className="text-sm text-gray-600">
                {filteredExpenses.length} expenses
              </div>
            </div>

            <div className="space-y-3">
              {filteredExpenses.map((expense) => {
                const statusBadge = getStatusBadge(expense.status)
                const StatusIcon = statusBadge.icon
                const CategoryIcon = getCategoryIcon(expense.category)

                return (
                  <div
                    key={expense.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white">
                          <CategoryIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{expense.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{expense.submittedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          ${expense.amount.toLocaleString()}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 mt-2 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Merchant</div>
                        <div className="font-medium text-gray-900">{expense.merchant}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Payment Method</div>
                        <div className="font-medium text-gray-900">{expense.paymentMethod}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Submitted</div>
                        <div className="font-medium text-gray-900">{expense.submittedDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Category</div>
                        <div className="font-medium text-gray-900 capitalize">{expense.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {expense.hasReceipt && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <Paperclip className="w-4 h-4" />
                            Receipt Attached
                          </div>
                        )}
                        {expense.reimbursed && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <DollarSign className="w-4 h-4" />
                            Reimbursed
                          </div>
                        )}
                      </div>
                      {expense.status === 'rejected' && expense.rejectionReason && (
                        <div className="text-sm text-red-600">
                          Reason: {expense.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={approvalProgressData.label}
              current={approvalProgressData.current}
              target={approvalProgressData.target}
              subtitle={approvalProgressData.subtitle}
            />

            <MiniKPI
              title="Pending Review"
              value="$12.8K"
              change="+8.7%"
              trend="up"
              subtitle="Awaiting approval"
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
