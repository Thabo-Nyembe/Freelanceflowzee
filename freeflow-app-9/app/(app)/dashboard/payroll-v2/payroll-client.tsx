'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  usePayrollRuns,
  usePayrollMutations,
  formatCurrency,
  getPayrollStatusColor,
  getEmployeeStatusColor,
  getPaymentMethodColor,
  type PayrollRun,
  type EmployeePayroll
} from '@/lib/hooks/use-payroll'

type ViewMode = 'all' | 'processing' | 'completed' | 'failed'

interface PayrollClientProps {
  initialRuns: PayrollRun[]
  initialEmployeePayroll: EmployeePayroll[]
}

export default function PayrollClient({ initialRuns, initialEmployeePayroll }: PayrollClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { runs, stats, isLoading } = usePayrollRuns(initialRuns, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const {
    createPayrollRun,
    processPayrollRun,
    approvePayrollRun,
    isCreating,
    isProcessing
  } = usePayrollMutations()

  const filteredRuns = viewMode === 'all'
    ? runs
    : runs.filter(run => run.status === viewMode)

  const handleCreatePayrollRun = () => {
    const now = new Date()
    const period = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const payDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    createPayrollRun({
      period,
      pay_date: payDate,
      department: 'All Departments',
      total_employees: 0,
      total_amount: 0,
      currency: 'USD'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Payroll Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Process and manage employee compensation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreatePayrollRun}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Run Payroll'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Payroll',
              value: formatCurrency(stats.totalAmount),
              change: '+124k',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Active Employees',
              value: stats.totalEmployees.toString(),
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all departments'
            },
            {
              label: 'Pending Runs',
              value: stats.pending.toString(),
              change: stats.pending > 0 ? '+' + stats.pending : '0',
              trend: stats.pending > 0 ? 'up' as const : 'same' as const,
              subtitle: 'awaiting processing'
            },
            {
              label: 'Completed',
              value: stats.completed.toString(),
              change: '+' + stats.completed,
              trend: 'up' as const,
              subtitle: 'this period'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Process Payroll', icon: '💰', onClick: () => {} },
            { label: 'Review Timesheets', icon: '⏰', onClick: () => {} },
            { label: 'Approve Bonuses', icon: '🎁', onClick: () => {} },
            { label: 'Tax Reports', icon: '📋', onClick: () => {} },
            { label: 'Employee Records', icon: '👥', onClick: () => {} },
            { label: 'Payment History', icon: '📊', onClick: () => {} },
            { label: 'Export Data', icon: '📥', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Runs"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Processing"
            isActive={viewMode === 'processing'}
            onClick={() => setViewMode('processing')}
          />
          <PillButton
            label="Completed"
            isActive={viewMode === 'completed'}
            onClick={() => setViewMode('completed')}
          />
          <PillButton
            label="Failed"
            isActive={viewMode === 'failed'}
            onClick={() => setViewMode('failed')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Payroll Runs List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Payroll Runs ({filteredRuns.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRuns.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No payroll runs found. Click "Run Payroll" to create one.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {run.period}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getPayrollStatusColor(run.status)}`}>
                              {run.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-blue-500">📅</span>
                              Pay Date: {run.pay_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-blue-500">🏢</span>
                              {run.department || 'All Departments'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-blue-500">👥</span>
                              {run.total_employees} employees
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(run.total_amount, run.currency)}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Total Amount
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{run.processed_count}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Processed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{run.pending_count}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">{run.failed_count}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Failed</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>Progress: {run.total_employees > 0 ? Math.round((run.processed_count / run.total_employees) * 100) : 0}%</span>
                          {run.approved_by && <span>Approved by {run.approved_by}</span>}
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${run.total_employees > 0 ? (run.processed_count / run.total_employees) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Employee Payroll */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Employee Payroll</h3>
              <div className="space-y-3">
                {initialEmployeePayroll.slice(0, 5).map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                          {emp.employee_name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {emp.role || 'Employee'}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getEmployeeStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Net: {formatCurrency(emp.net_pay)}</span>
                      <span className={`px-2 py-1 rounded-full border ${getPaymentMethodColor(emp.payment_method)}`}>
                        {emp.payment_method}
                      </span>
                    </div>
                  </div>
                ))}
                {initialEmployeePayroll.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                    No employee payroll records yet
                  </div>
                )}
              </div>
            </div>

            {/* Payroll Breakdown */}
            <ProgressCard
              title="Payroll Breakdown"
              items={[
                { label: 'Base Salary', value: 2280000, total: 2847000, color: 'blue' },
                { label: 'Bonuses', value: 284000, total: 2847000, color: 'green' },
                { label: 'Benefits', value: 142000, total: 2847000, color: 'purple' },
                { label: 'Deductions', value: 97000, total: 2847000, color: 'red' },
                { label: 'Taxes', value: 244000, total: 2847000, color: 'orange' }
              ]}
            />

            {/* Top Earning Departments */}
            <RankingList
              title="Top Earning Departments"
              items={[
                { label: 'Engineering', value: '$1.2M', rank: 1, trend: 'up' },
                { label: 'Product', value: '$540K', rank: 2, trend: 'up' },
                { label: 'Sales', value: '$420K', rank: 3, trend: 'same' },
                { label: 'Marketing', value: '$380K', rank: 4, trend: 'down' },
                { label: 'Design', value: '$307K', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Tax Rate"
                value="27.5%"
                trend="up"
                change="+0.5%"
              />
              <MiniKPI
                label="Total Deductions"
                value="$97K"
                trend="down"
                change="-2K"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Payroll approved',
                  subject: 'February 2024 - All Departments',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Bonus processed',
                  subject: 'Engineering Team - Q1 2024',
                  time: '1 day ago',
                  type: 'success'
                },
                {
                  action: 'Payment failed',
                  subject: '4 contractor payments',
                  time: '2 days ago',
                  type: 'error'
                },
                {
                  action: 'Payroll completed',
                  subject: 'January 2024 - All Departments',
                  time: '1 month ago',
                  type: 'success'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
