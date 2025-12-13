'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type PayrollStatus = 'draft' | 'processing' | 'completed' | 'failed'
type EmployeeStatus = 'active' | 'on-leave' | 'terminated'
type PaymentMethod = 'direct-deposit' | 'check' | 'wire-transfer'
type ViewMode = 'all' | 'processing' | 'completed' | 'failed'

export default function PayrollV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample payroll data
  const payrollRuns = [
    {
      id: 'PAY-2847',
      period: 'February 2024',
      payDate: '2024-02-28',
      status: 'processing' as const,
      totalEmployees: 284,
      totalAmount: 2847000,
      processed: 142,
      pending: 142,
      failed: 0,
      department: 'All Departments',
      approvedBy: 'Emily Rodriguez',
      approvedDate: '2024-02-25'
    },
    {
      id: 'PAY-2846',
      period: 'January 2024',
      payDate: '2024-01-31',
      status: 'completed' as const,
      totalEmployees: 278,
      totalAmount: 2724000,
      processed: 278,
      pending: 0,
      failed: 0,
      department: 'All Departments',
      approvedBy: 'Emily Rodriguez',
      approvedDate: '2024-01-28'
    },
    {
      id: 'PAY-2845',
      period: 'December 2023',
      payDate: '2023-12-31',
      status: 'completed' as const,
      totalEmployees: 271,
      totalAmount: 2656000,
      processed: 271,
      pending: 0,
      failed: 0,
      department: 'All Departments',
      approvedBy: 'Robert Brown',
      approvedDate: '2023-12-28'
    },
    {
      id: 'PAY-2844',
      period: 'February 2024 - Bonus',
      payDate: '2024-02-15',
      status: 'completed' as const,
      totalEmployees: 147,
      totalAmount: 584000,
      processed: 147,
      pending: 0,
      failed: 0,
      department: 'Engineering',
      approvedBy: 'Emily Rodriguez',
      approvedDate: '2024-02-12'
    },
    {
      id: 'PAY-2843',
      period: 'January 2024 - Contractors',
      payDate: '2024-01-15',
      status: 'failed' as const,
      totalEmployees: 42,
      totalAmount: 168000,
      processed: 38,
      pending: 0,
      failed: 4,
      department: 'IT',
      approvedBy: 'Michael Chen',
      approvedDate: '2024-01-12'
    }
  ]

  const employeePayroll = [
    {
      id: 'EMP-8471',
      name: 'Sarah Johnson',
      department: 'Engineering',
      role: 'Senior Full Stack Developer',
      status: 'active' as const,
      baseSalary: 12000,
      bonuses: 2000,
      deductions: 1400,
      netPay: 12600,
      paymentMethod: 'direct-deposit' as const,
      taxRate: 28
    },
    {
      id: 'EMP-8470',
      name: 'Michael Chen',
      department: 'Product',
      role: 'Product Manager',
      status: 'active' as const,
      baseSalary: 10000,
      bonuses: 1500,
      deductions: 1150,
      netPay: 10350,
      paymentMethod: 'direct-deposit' as const,
      taxRate: 26
    },
    {
      id: 'EMP-8469',
      name: 'Emily Rodriguez',
      department: 'Engineering',
      role: 'VP Engineering',
      status: 'active' as const,
      baseSalary: 18000,
      bonuses: 4000,
      deductions: 2200,
      netPay: 19800,
      paymentMethod: 'wire-transfer' as const,
      taxRate: 32
    },
    {
      id: 'EMP-8468',
      name: 'David Kim',
      department: 'Data',
      role: 'Data Scientist',
      status: 'active' as const,
      baseSalary: 11000,
      bonuses: 1200,
      deductions: 1220,
      netPay: 10980,
      paymentMethod: 'direct-deposit' as const,
      taxRate: 27
    },
    {
      id: 'EMP-8467',
      name: 'Jessica Williams',
      department: 'Marketing',
      role: 'Marketing Manager',
      status: 'on-leave' as const,
      baseSalary: 9000,
      bonuses: 0,
      deductions: 900,
      netPay: 8100,
      paymentMethod: 'direct-deposit' as const,
      taxRate: 25
    }
  ]

  const getStatusColor = (status: PayrollStatus) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'processing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getEmployeeStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'on-leave': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'terminated': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getPaymentMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case 'direct-deposit': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'check': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'wire-transfer': return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
  }

  const filteredRuns = viewMode === 'all'
    ? payrollRuns
    : payrollRuns.filter(run => run.status === viewMode)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
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
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
              Run Payroll
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Payroll',
              value: '$2.85M',
              change: '+124k',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Active Employees',
              value: '284',
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all departments'
            },
            {
              label: 'Processing Status',
              value: '50%',
              change: '+25%',
              trend: 'up' as const,
              subtitle: 'current run progress'
            },
            {
              label: 'Avg Salary',
              value: '$10,025',
              change: '+2.4%',
              trend: 'up' as const,
              subtitle: 'year over year'
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
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(run.status)}`}>
                            {run.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-blue-500">📅</span>
                            Pay Date: {run.payDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-blue-500">🏢</span>
                            {run.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-blue-500">👥</span>
                            {run.totalEmployees} employees
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(run.totalAmount)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Amount
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{run.processed}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{run.pending}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">{run.failed}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Failed</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Progress: {Math.round((run.processed / run.totalEmployees) * 100)}%</span>
                        <span>Approved by {run.approvedBy}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${(run.processed / run.totalEmployees) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Employee Payroll */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Employee Payroll</h3>
              <div className="space-y-3">
                {employeePayroll.slice(0, 5).map((emp) => (
                  <div
                    key={emp.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                          {emp.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {emp.role}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getEmployeeStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Net: {formatCurrency(emp.netPay)}</span>
                      <span className={`px-2 py-1 rounded-full border ${getPaymentMethodColor(emp.paymentMethod)}`}>
                        {emp.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
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
