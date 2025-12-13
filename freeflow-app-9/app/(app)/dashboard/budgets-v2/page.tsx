"use client"

import { useState } from 'react'
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Plus,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Filter
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly'
type BudgetStatus = 'all' | 'on-track' | 'warning' | 'exceeded'

export default function BudgetsV2Page() {
  const [period, setPeriod] = useState<BudgetPeriod>('monthly')
  const [status, setStatus] = useState<BudgetStatus>('all')

  const stats = [
    {
      label: 'Total Budget',
      value: '$284,750',
      change: '+8.2%',
      trend: 'up' as const,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Total Spent',
      value: '$187,290',
      change: '+12.4%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      label: 'Remaining',
      value: '$97,460',
      change: '-4.8%',
      trend: 'down' as const,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Budget Health',
      value: '65.8%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-emerald-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Budget',
      description: 'Create budget category',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Adjust Budget',
      description: 'Modify allocation',
      icon: Settings,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Set Alert',
      description: 'Configure spending alerts',
      icon: Bell,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Export Report',
      description: 'Download budget analysis',
      icon: Download,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Budget Forecast',
      description: 'View spending projections',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Compare Periods',
      description: 'Analyze budget trends',
      icon: BarChart3,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Quick Allocate',
      description: 'Distribute budget quickly',
      icon: Zap,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Budget Review',
      description: 'Monthly performance check',
      icon: PieChart,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const budgets = [
    {
      id: 'BDG-001',
      category: 'Marketing',
      allocated: 50000,
      spent: 38470,
      remaining: 11530,
      percentage: 76.9,
      status: 'warning' as const,
      period: 'monthly',
      transactions: 127,
      forecast: 48500,
      lastUpdated: '2 hours ago'
    },
    {
      id: 'BDG-002',
      category: 'Payroll',
      allocated: 120000,
      spent: 72000,
      remaining: 48000,
      percentage: 60.0,
      status: 'on-track' as const,
      period: 'monthly',
      transactions: 45,
      forecast: 120000,
      lastUpdated: '1 day ago'
    },
    {
      id: 'BDG-003',
      category: 'Technology',
      allocated: 35000,
      spent: 28470,
      remaining: 6530,
      percentage: 81.3,
      status: 'warning' as const,
      period: 'monthly',
      transactions: 89,
      forecast: 34200,
      lastUpdated: '5 hours ago'
    },
    {
      id: 'BDG-004',
      category: 'Office & Facilities',
      allocated: 25000,
      spent: 12800,
      remaining: 12200,
      percentage: 51.2,
      status: 'on-track' as const,
      period: 'monthly',
      transactions: 56,
      forecast: 24000,
      lastUpdated: '3 hours ago'
    },
    {
      id: 'BDG-005',
      category: 'Travel & Entertainment',
      allocated: 15000,
      spent: 15847,
      remaining: -847,
      percentage: 105.6,
      status: 'exceeded' as const,
      period: 'monthly',
      transactions: 34,
      forecast: 16200,
      lastUpdated: '30 minutes ago'
    },
    {
      id: 'BDG-006',
      category: 'Research & Development',
      allocated: 40000,
      spent: 18920,
      remaining: 21080,
      percentage: 47.3,
      status: 'on-track' as const,
      period: 'monthly',
      transactions: 23,
      forecast: 38000,
      lastUpdated: '1 hour ago'
    },
    {
      id: 'BDG-007',
      category: 'Professional Services',
      allocated: 30000,
      spent: 22400,
      remaining: 7600,
      percentage: 74.7,
      status: 'warning' as const,
      period: 'monthly',
      transactions: 18,
      forecast: 29500,
      lastUpdated: '4 hours ago'
    },
    {
      id: 'BDG-008',
      category: 'Training & Development',
      allocated: 20000,
      spent: 8470,
      remaining: 11530,
      percentage: 42.4,
      status: 'on-track' as const,
      period: 'monthly',
      transactions: 12,
      forecast: 18000,
      lastUpdated: '6 hours ago'
    },
    {
      id: 'BDG-009',
      category: 'Insurance',
      allocated: 18000,
      spent: 18000,
      remaining: 0,
      percentage: 100.0,
      status: 'warning' as const,
      period: 'monthly',
      transactions: 1,
      forecast: 18000,
      lastUpdated: '2 days ago'
    },
    {
      id: 'BDG-010',
      category: 'Legal & Compliance',
      allocated: 22000,
      spent: 9240,
      remaining: 12760,
      percentage: 42.0,
      status: 'on-track' as const,
      period: 'monthly',
      transactions: 8,
      forecast: 20000,
      lastUpdated: '1 day ago'
    }
  ]

  const filteredBudgets = budgets.filter(budget => {
    const statusMatch = status === 'all' || budget.status === status
    return statusMatch
  })

  const getStatusBadge = (status: string, percentage: number) => {
    if (status === 'exceeded') {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        label: 'Exceeded',
        barColor: 'from-red-500 to-pink-500'
      }
    }
    if (status === 'warning' || percentage >= 75) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertTriangle,
        label: 'Warning',
        barColor: 'from-yellow-500 to-orange-500'
      }
    }
    return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2,
      label: 'On Track',
      barColor: 'from-green-500 to-emerald-500'
    }
  }

  const recentActivity = [
    { label: 'Marketing budget adjusted', time: '2 hours ago', color: 'text-blue-600' },
    { label: 'Travel budget exceeded', time: '30 minutes ago', color: 'text-red-600' },
    { label: 'R&D spending alert triggered', time: '1 hour ago', color: 'text-orange-600' },
    { label: 'Payroll budget updated', time: '1 day ago', color: 'text-green-600' },
    { label: 'Technology allocation modified', time: '5 hours ago', color: 'text-purple-600' }
  ]

  const topSpendingCategories = [
    { label: 'Payroll', value: '$72.0K', color: 'bg-blue-500' },
    { label: 'Marketing', value: '$38.5K', color: 'bg-purple-500' },
    { label: 'Technology', value: '$28.5K', color: 'bg-cyan-500' },
    { label: 'Professional Services', value: '$22.4K', color: 'bg-green-500' },
    { label: 'Insurance', value: '$18.0K', color: 'bg-orange-500' }
  ]

  const budgetUtilizationData = {
    label: 'Overall Budget Utilization',
    current: 187290,
    target: 284750,
    subtitle: '65.8% of total budget used'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Budgets
            </h1>
            <p className="text-gray-600 mt-2">Monitor and manage spending across all categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Month
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Budget
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Budget Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Budgets
                </PillButton>
                <PillButton
                  onClick={() => setStatus('on-track')}
                  isActive={status === 'on-track'}
                  variant="default"
                >
                  On Track
                </PillButton>
                <PillButton
                  onClick={() => setStatus('warning')}
                  isActive={status === 'warning'}
                  variant="default"
                >
                  Warning
                </PillButton>
                <PillButton
                  onClick={() => setStatus('exceeded')}
                  isActive={status === 'exceeded'}
                  variant="default"
                >
                  Exceeded
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Budget Categories</h2>
              <div className="text-sm text-gray-600">
                {filteredBudgets.length} categories
              </div>
            </div>

            <div className="space-y-3">
              {filteredBudgets.map((budget) => {
                const statusBadge = getStatusBadge(budget.status, budget.percentage)
                const StatusIcon = statusBadge.icon
                const isOverBudget = budget.percentage > 100

                return (
                  <div
                    key={budget.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{budget.category}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500">{budget.id}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{budget.transactions} transactions</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Budget Progress</span>
                        <span className={`font-semibold ${
                          isOverBudget ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {budget.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${statusBadge.barColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Allocated</div>
                        <div className="font-semibold text-gray-900">
                          ${budget.allocated.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Spent</div>
                        <div className={`font-semibold ${
                          isOverBudget ? 'text-red-600' : 'text-purple-600'
                        }`}>
                          ${budget.spent.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Remaining</div>
                        <div className={`font-semibold ${
                          budget.remaining < 0 ? 'text-red-600' : 'text-green-600'
                        } flex items-center gap-1`}>
                          {budget.remaining < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          ${Math.abs(budget.remaining).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm">
                      <div className="text-gray-600">
                        Forecast: <span className="font-medium text-gray-900">${budget.forecast.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-500">{budget.lastUpdated}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={budgetUtilizationData.label}
              current={budgetUtilizationData.current}
              target={budgetUtilizationData.target}
              subtitle={budgetUtilizationData.subtitle}
            />

            <MiniKPI
              title="Avg Utilization"
              value="65.8%"
              change="+4.2%"
              trend="up"
              subtitle="Across all budgets"
            />

            <RankingList
              title="Top Spending"
              items={topSpendingCategories}
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
