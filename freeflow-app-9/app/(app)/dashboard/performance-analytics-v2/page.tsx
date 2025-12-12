"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ComparisonCard,
  MiniKPI,
  ProgressCard,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Award,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download
} from 'lucide-react'

/**
 * Performance Analytics V2 - Groundbreaking Performance Insights
 * Showcases advanced analytics with modern components
 */
export default function PerformanceAnalyticsV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'users' | 'engagement'>('revenue')

  const stats = [
    { label: 'Total Revenue', value: '$124.5K', change: 32.1, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Active Users', value: '8,470', change: 25.3, icon: <Activity className="w-5 h-5" /> },
    { label: 'Conversion Rate', value: '4.2%', change: 15.2, icon: <Target className="w-5 h-5" /> },
    { label: 'Avg Response Time', value: '1.2s', change: -12.5, icon: <Zap className="w-5 h-5" /> }
  ]

  const monthlyMetrics = [
    { month: 'Jan', revenue: 87500, users: 6200, engagement: 67 },
    { month: 'Feb', revenue: 92300, users: 6800, engagement: 72 },
    { month: 'Mar', revenue: 98700, users: 7200, engagement: 75 },
    { month: 'Apr', revenue: 105400, users: 7600, engagement: 78 },
    { month: 'May', revenue: 112800, users: 8100, engagement: 82 },
    { month: 'Jun', revenue: 124500, users: 8470, engagement: 85 }
  ]

  const performanceMetrics = [
    {
      category: 'Revenue',
      metrics: [
        { label: 'MRR', value: '$24.5K', change: 18.7, trend: 'up' },
        { label: 'ARR', value: '$294K', change: 22.3, trend: 'up' },
        { label: 'ARPU', value: '$28.94', change: 12.5, trend: 'up' },
        { label: 'Churn Rate', value: '2.1%', change: -8.3, trend: 'down' }
      ]
    },
    {
      category: 'User Engagement',
      metrics: [
        { label: 'DAU', value: '2,847', change: 25.3, trend: 'up' },
        { label: 'MAU', value: '8,470', change: 18.7, trend: 'up' },
        { label: 'Session Duration', value: '12m 34s', change: 15.2, trend: 'up' },
        { label: 'Bounce Rate', value: '24%', change: -12.5, trend: 'down' }
      ]
    }
  ]

  const topPerformers = [
    { rank: 1, name: 'Product Sales', avatar: '💰', value: '$42.3K', change: 32.1 },
    { rank: 2, name: 'Service Revenue', avatar: '⚙️', value: '$38.7K', change: 28.5 },
    { rank: 3, name: 'Consulting', avatar: '💼', value: '$24.8K', change: 22.3 },
    { rank: 4, name: 'Training', avatar: '📚', value: '$12.4K', change: 18.7 },
    { rank: 5, name: 'Support', avatar: '🎧', value: '$6.3K', change: 15.2 }
  ]

  const maxRevenue = Math.max(...monthlyMetrics.map(m => m.revenue))

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-3 h-3 text-green-600" />
    ) : (
      <ArrowDownRight className="w-3 h-3 text-red-600" />
    )
  }

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-violet-600" />
              Performance Analytics
            </h1>
            <p className="text-muted-foreground">Deep insights into your business performance</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('Export')}>
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<BarChart3 />} title="Revenue" description="Financial" onClick={() => console.log('Revenue')} />
          <BentoQuickAction icon={<Activity />} title="Users" description="Engagement" onClick={() => console.log('Users')} />
          <BentoQuickAction icon={<Target />} title="Goals" description="Targets" onClick={() => console.log('Goals')} />
          <BentoQuickAction icon={<Award />} title="Benchmarks" description="Compare" onClick={() => console.log('Benchmarks')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'day' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('day')}>
            Day
          </PillButton>
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>
            Week
          </PillButton>
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            Month
          </PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>
            Year
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Revenue Trend</h3>
          <div className="space-y-4">
            {monthlyMetrics.map((metric, index) => {
              const revenuePercent = (metric.revenue / maxRevenue) * 100
              const previousRevenue = index > 0 ? monthlyMetrics[index - 1].revenue : metric.revenue
              const growth = ((metric.revenue - previousRevenue) / previousRevenue) * 100

              return (
                <div key={metric.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{metric.month}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{metric.users.toLocaleString()} users</span>
                      <span className="font-semibold">${(metric.revenue / 1000).toFixed(1)}K</span>
                      {index > 0 && (
                        <span className={`text-xs flex items-center gap-1 ${getTrendColor(growth)}`}>
                          {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(growth).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-300"
                      style={{ width: `${revenuePercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceMetrics.map((section) => (
            <BentoCard key={section.category} className="p-6">
              <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
              <div className="space-y-4">
                {section.metrics.map((metric) => (
                  <div key={metric.label} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-xs font-semibold ${getTrendColor(metric.change)}`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComparisonCard
                title="Revenue Comparison"
                current={{ label: 'This Month', value: 124500 }}
                previous={{ label: 'Last Month', value: 94200 }}
              />
              <ComparisonCard
                title="User Growth"
                current={{ label: 'This Month', value: 8470 }}
                previous={{ label: 'Last Month', value: 6800 }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Annual Revenue Target"
              current={124500}
              goal={500000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RankingList title="🏆 Top Revenue Sources" items={topPerformers} />
          </div>

          <div>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Growth Rate" value="32.1%" change={12.5} />
                <MiniKPI label="Customer LTV" value="$1,247" change={25.3} />
                <MiniKPI label="CAC Payback" value="3.2mo" change={-8.3} />
                <MiniKPI label="Net Promoter Score" value="67" change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
