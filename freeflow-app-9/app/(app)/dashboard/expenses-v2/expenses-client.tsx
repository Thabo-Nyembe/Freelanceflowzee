'use client'

import { useState } from 'react'
import { useExpenses, type Expense, type ExpenseCategory, type ExpenseStatus } from '@/lib/hooks/use-expenses'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Receipt, DollarSign, CheckCircle2, Clock, XCircle, Paperclip, Plane, ShoppingBag } from 'lucide-react'

export default function ExpensesClient({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all')
  const { expenses, loading, error } = useExpenses({ status: statusFilter, category: categoryFilter })

  const displayExpenses = (expenses && expenses.length > 0) ? expenses : (initialExpenses || [])

  const stats = [
    {
      label: 'Total Expenses',
      value: `$${(displayExpenses.reduce((sum, e) => sum + e.total_amount, 0) / 1000).toFixed(1)}K`,
      change: 14.2,
      icon: <Receipt className="w-5 h-5" />
    },
    {
      label: 'Pending Approval',
      value: `$${(displayExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.total_amount, 0) / 1000).toFixed(1)}K`,
      change: 8.7,
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Approved',
      value: `$${(displayExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.total_amount, 0) / 1000).toFixed(1)}K`,
      change: 18.4,
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      label: 'Avg Expense',
      value: displayExpenses.length > 0
        ? `$${(displayExpenses.reduce((sum, e) => sum + e.amount, 0) / displayExpenses.length).toFixed(0)}`
        : '$0',
      change: 5.2,
      icon: <DollarSign className="w-5 h-5" />
    }
  ]

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Approved' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
      case 'reimbursed':
        return { color: 'bg-blue-100 text-blue-800', icon: DollarSign, label: 'Reimbursed' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Receipt, label: status }
    }
  }

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'travel': return Plane
      case 'meals': return ShoppingBag
      default: return Receipt
    }
  }

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors = {
      travel: 'from-blue-500 to-cyan-500',
      meals: 'from-purple-500 to-pink-500',
      supplies: 'from-green-500 to-emerald-500',
      software: 'from-indigo-500 to-purple-500',
      other: 'from-gray-500 to-slate-500'
    }
    return colors[category] || colors.other
  }

  const recentActivity = displayExpenses.slice(0, 4).map((e) => {
    const badge = getStatusBadge(e.status)
    return {
      icon: <badge.icon className="w-5 h-5" />,
      title: badge.label,
      description: e.expense_title,
      time: new Date(e.updated_at).toLocaleDateString(),
      status: (e.status === 'approved' || e.status === 'reimbursed' ? 'success' : e.status === 'rejected' ? 'error' : 'warning') as const
    }
  })

  const topCategories = [
    {
      label: 'Travel',
      value: `$${(displayExpenses.filter(e => e.expense_category === 'travel').reduce((sum, e) => sum + e.amount, 0) / 1000).toFixed(1)}K`,
      color: 'bg-blue-500'
    },
    {
      label: 'Meals',
      value: `$${(displayExpenses.filter(e => e.expense_category === 'meals').reduce((sum, e) => sum + e.amount, 0) / 1000).toFixed(1)}K`,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Receipt className="w-10 h-10 text-purple-600" />
              Expenses
            </h1>
            <p className="text-muted-foreground">Track and manage employee expense reports</p>
          </div>
          <GradientButton from="purple" to="violet" onClick={() => console.log('New expense')}>
            <Receipt className="w-5 h-5 mr-2" />
            New Expense
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3 flex-wrap">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>
            All Expenses
          </PillButton>
          <PillButton variant={statusFilter === 'pending' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('pending')}>
            Pending
          </PillButton>
          <PillButton variant={statusFilter === 'approved' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('approved')}>
            Approved
          </PillButton>
          <PillButton variant={statusFilter === 'rejected' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('rejected')}>
            Rejected
          </PillButton>
          <PillButton variant={statusFilter === 'reimbursed' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('reimbursed')}>
            Reimbursed
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayExpenses.map((expense) => {
              const statusBadge = getStatusBadge(expense.status)
              const StatusIcon = statusBadge.icon
              const CategoryIcon = getCategoryIcon(expense.expense_category)

              return (
                <BentoCard key={expense.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(expense.expense_category)} flex items-center justify-center text-white`}>
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{expense.expense_title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">{expense.submitted_by || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        ${expense.amount.toLocaleString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 mt-2 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {expense.merchant_name && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Merchant</div>
                        <div className="font-medium text-gray-900">{expense.merchant_name}</div>
                      </div>
                    )}
                    {expense.payment_method && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Payment Method</div>
                        <div className="font-medium text-gray-900">{expense.payment_method}</div>
                      </div>
                    )}
                    {expense.submitted_at && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Submitted</div>
                        <div className="font-medium text-gray-900">{new Date(expense.submitted_at).toLocaleDateString()}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Category</div>
                      <div className="font-medium text-gray-900 capitalize">{expense.expense_category}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      {expense.has_receipt && (
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
                    {expense.status === 'rejected' && expense.rejection_reason && (
                      <div className="text-sm text-red-600">
                        Reason: {expense.rejection_reason}
                      </div>
                    )}
                  </div>
                </BentoCard>
              )
            })}

            {displayExpenses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Expenses</h3>
                <p className="text-muted-foreground">Submit your first expense report</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Expenses Approved"
              current={displayExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.total_amount, 0)}
              goal={displayExpenses.reduce((sum, e) => sum + e.total_amount, 0)}
              subtitle={displayExpenses.length > 0
                ? `${((displayExpenses.filter(e => e.status === 'approved').length / displayExpenses.length) * 100).toFixed(1)}% approval rate`
                : '0% approval rate'}
            />

            <MiniKPI
              label="Pending Review"
              value={`$${(displayExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.total_amount, 0) / 1000).toFixed(1)}K`}
              change={8.7}
            />

            <RankingList title="Top Categories" items={topCategories} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}
