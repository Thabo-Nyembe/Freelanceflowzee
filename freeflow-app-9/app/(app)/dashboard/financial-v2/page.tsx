"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ComparisonCard,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Download,
  Plus,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react'

/**
 * Financial V2 - Groundbreaking Financial Management
 * Showcases financial data with modern components
 */
export default function FinancialV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  const stats = [
    { label: 'Total Revenue', value: '$124.5K', change: 12.5, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Expenses', value: '$48.2K', change: -5.3, icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Net Profit', value: '$76.3K', change: 18.7, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Profit Margin', value: '61%', change: 5.2, icon: <Target className="w-5 h-5" /> }
  ]

  const monthlyData = [
    { month: 'Jan', revenue: 94500, expenses: 38200, profit: 56300 },
    { month: 'Feb', revenue: 102800, expenses: 41100, profit: 61700 },
    { month: 'Mar', revenue: 108200, expenses: 43300, profit: 64900 },
    { month: 'Apr', revenue: 115600, expenses: 45200, profit: 70400 },
    { month: 'May', revenue: 121300, expenses: 46800, profit: 74500 },
    { month: 'Jun', revenue: 124500, expenses: 48200, profit: 76300 }
  ]

  const expenseCategories = [
    { category: 'Salaries', amount: 25000, percentage: 52 },
    { category: 'Software & Tools', amount: 8500, percentage: 18 },
    { category: 'Marketing', amount: 6200, percentage: 13 },
    { category: 'Office', amount: 4500, percentage: 9 },
    { category: 'Other', amount: 4000, percentage: 8 }
  ]

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-indigo-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-gray-500 to-slate-500'
    ]
    return colors[index % colors.length]
  }

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Wallet className="w-10 h-10 text-emerald-600" />
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground">Track revenue, expenses, and profitability</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" onClick={() => console.log('Export')}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </ModernButton>
            <GradientButton from="emerald" to="teal" onClick={() => console.log('Add transaction')}>
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            <Calendar className="w-4 h-4 mr-2" />
            Monthly
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>
            Quarterly
          </PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>
            Yearly
          </PillButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<DollarSign />} title="Revenue" description="View details" onClick={() => console.log('Revenue')} />
          <BentoQuickAction icon={<CreditCard />} title="Expenses" description="Breakdown" onClick={() => console.log('Expenses')} />
          <BentoQuickAction icon={<BarChart3 />} title="Reports" description="Generate" onClick={() => console.log('Reports')} />
          <BentoQuickAction icon={<Target />} title="Goals" description="Set targets" onClick={() => console.log('Goals')} />
        </div>

        <BentoCard className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Revenue Trend
              </h2>
              <p className="text-sm text-gray-600 mt-1">6-month financial performance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Current Month</p>
              <p className="text-2xl font-bold text-green-600">
                ${(monthlyData[5].revenue / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
                +12.5% vs last month
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Avg Monthly Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Growth Rate</p>
              <p className="text-2xl font-bold text-purple-600">31.7%</p>
              <p className="text-xs text-gray-500 mt-1">Year over year</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue & Profit</h3>
            <div className="space-y-3">
              {monthlyData.map((month, index) => {
                const revenuePercent = (month.revenue / maxRevenue) * 100
                const profitPercent = (month.profit / maxRevenue) * 100

                return (
                  <div key={month.month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{month.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-semibold">
                          ${(month.revenue / 1000).toFixed(1)}K
                        </span>
                        <span className="text-blue-600 font-semibold">
                          Profit: ${(month.profit / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-6">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center justify-center transition-all duration-500"
                        style={{ width: `${revenuePercent}%` }}
                      />
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center transition-all duration-500"
                        style={{ width: `${profitPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              Expense Breakdown
            </h3>
            <div className="space-y-3">
              {expenseCategories.map((category, index) => (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{category.percentage}%</span>
                      <span className="font-semibold">${category.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getCategoryColor(index)} transition-all duration-500`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Expenses</span>
                <span className="text-xl font-bold text-red-600">
                  ${expenseCategories.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </BentoCard>

          <div className="space-y-6">
            <ComparisonCard
              title="Revenue Comparison"
              current={{ label: 'This Month', value: 124500 }}
              previous={{ label: 'Last Month', value: 121300 }}
            />
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Health</h3>
              <div className="space-y-3">
                <MiniKPI label="Revenue Growth" value="+12.5%" change={12.5} />
                <MiniKPI label="Expense Ratio" value="39%" change={-5.3} />
                <MiniKPI label="Cash Flow" value="+$76K" change={18.7} />
                <MiniKPI label="ROI" value="158%" change={22.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
