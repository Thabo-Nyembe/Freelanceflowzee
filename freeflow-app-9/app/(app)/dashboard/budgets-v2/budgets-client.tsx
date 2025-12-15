'use client'
import { useState } from 'react'
import { useBudgets, type Budget, type BudgetType, type BudgetStatus } from '@/lib/hooks/use-budgets'

export default function BudgetsClient({ initialBudgets }: { initialBudgets: Budget[] }) {
  const [typeFilter, setTypeFilter] = useState<BudgetType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all')
  const { budgets, loading, error } = useBudgets({ budgetType: typeFilter, status: statusFilter })
  const displayBudgets = budgets.length > 0 ? budgets : initialBudgets

  const stats = {
    totalAllocated: displayBudgets.reduce((sum, b) => sum + b.total_amount, 0),
    totalSpent: displayBudgets.reduce((sum, b) => sum + b.spent_amount, 0),
    totalRemaining: displayBudgets.reduce((sum, b) => sum + b.remaining_amount, 0),
    active: displayBudgets.filter(b => b.status === 'active').length
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Budgets</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Budget</div><div className="text-3xl font-bold text-blue-600">${stats.totalAllocated.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Spent</div><div className="text-3xl font-bold text-purple-600">${stats.totalSpent.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Remaining</div><div className="text-3xl font-bold text-green-600">${stats.totalRemaining.toFixed(2)}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-emerald-600">{stats.active}</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="operational">Operational</option><option value="project">Project</option><option value="department">Department</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="active">Active</option><option value="approved">Approved</option><option value="exceeded">Exceeded</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayBudgets.filter(b => (typeFilter === 'all' || b.budget_type === typeFilter) && (statusFilter === 'all' || b.status === statusFilter)).map(budget => {
          const utilizationPercent = (budget.spent_amount / budget.total_amount) * 100
          const isExceeded = budget.is_exceeded

          return (
            <div key={budget.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{budget.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{budget.budget_number} • {budget.budget_type}</p>
                  <p className="text-sm text-gray-600">{new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${budget.status === 'active' ? 'bg-green-100 text-green-700' : budget.status === 'exceeded' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{budget.status}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Utilization</span><span className={`font-semibold ${isExceeded ? 'text-red-600' : 'text-gray-900'}`}>{utilizationPercent.toFixed(1)}%</span></div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${isExceeded ? 'bg-gradient-to-r from-red-500 to-pink-500' : utilizationPercent >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`} style={{ width: `${Math.min(utilizationPercent, 100)}%` }}></div></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><div className="text-xs text-gray-500">Allocated</div><div className="font-semibold text-gray-900">${budget.total_amount.toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500">Spent</div><div className={`font-semibold ${isExceeded ? 'text-red-600' : 'text-purple-600'}`}>${budget.spent_amount.toFixed(2)}</div></div>
                <div><div className="text-xs text-gray-500">Remaining</div><div className={`font-semibold ${budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'}`}>${Math.abs(budget.remaining_amount).toFixed(2)}</div></div>
              </div>
            </div>
          )
        })}</div>
      </div>
    </div>
  )
}
