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
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Download,
  Calendar
} from 'lucide-react'

/**
 * Investor Metrics V2 - Groundbreaking Investor Dashboard
 * Showcases key business metrics for investors with modern components
 */
export default function InvestorMetricsV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')

  const stats = [
    { label: 'Annual Recurring Revenue', value: '$2.4M', change: 42.1, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Monthly Active Users', value: '124K', change: 35.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Gross Margin', value: '78%', change: 8.2, icon: <PieChart className="w-5 h-5" /> },
    { label: 'Net Revenue Retention', value: '112%', change: 15.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const financialMetrics = [
    {
      category: 'Revenue Metrics',
      metrics: [
        { label: 'ARR', value: '$2.4M', change: 42.1, description: 'Annual Recurring Revenue' },
        { label: 'MRR', value: '$200K', change: 38.5, description: 'Monthly Recurring Revenue' },
        { label: 'ARPU', value: '$97', change: 22.3, description: 'Average Revenue Per User' },
        { label: 'LTV', value: '$3,247', change: 28.7, description: 'Customer Lifetime Value' }
      ]
    },
    {
      category: 'Growth Metrics',
      metrics: [
        { label: 'User Growth', value: '35%', change: 12.5, description: 'Month over month' },
        { label: 'Revenue Growth', value: '42%', change: 18.3, description: 'Year over year' },
        { label: 'Market Penetration', value: '8.4%', change: 25.2, description: 'Total addressable market' },
        { label: 'Viral Coefficient', value: '1.4', change: 15.7, description: 'User acquisition rate' }
      ]
    },
    {
      category: 'Efficiency Metrics',
      metrics: [
        { label: 'CAC', value: '$247', change: -12.5, description: 'Customer Acquisition Cost' },
        { label: 'LTV:CAC Ratio', value: '13.1x', change: 42.3, description: 'Return on acquisition' },
        { label: 'Burn Rate', value: '$45K', change: -8.3, description: 'Monthly cash burn' },
        { label: 'Runway', value: '18mo', change: 25.0, description: 'Cash runway remaining' }
      ]
    }
  ]

  const quarterlyPerformance = [
    { quarter: 'Q1 2024', revenue: 450000, users: 89000, margin: 72 },
    { quarter: 'Q2 2024', revenue: 580000, users: 102000, margin: 75 },
    { quarter: 'Q3 2024', revenue: 720000, users: 115000, margin: 76 },
    { quarter: 'Q4 2024', revenue: 900000, users: 124000, margin: 78 }
  ]

  const topMetrics = [
    { rank: 1, name: 'Revenue Growth', avatar: '💰', value: '42%', change: 18.3 },
    { rank: 2, name: 'User Growth', avatar: '👥', value: '35%', change: 12.5 },
    { rank: 3, name: 'Gross Margin', avatar: '📊', value: '78%', change: 8.2 },
    { rank: 4, name: 'NRR', avatar: '🔄', value: '112%', change: 15.7 },
    { rank: 5, name: 'LTV:CAC', avatar: '⚖️', value: '13.1x', change: 42.3 }
  ]

  const maxRevenue = Math.max(...quarterlyPerformance.map(q => q.revenue))

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUpRight className="w-3 h-3" />
    ) : (
      <ArrowDownRight className="w-3 h-3" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-orange-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Award className="w-10 h-10 text-amber-600" />
              Investor Metrics
            </h1>
            <p className="text-muted-foreground">Key performance indicators for stakeholders</p>
          </div>
          <GradientButton from="amber" to="orange" onClick={() => console.log('Export')}>
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<DollarSign />} title="Revenue" description="Financial" onClick={() => console.log('Revenue')} />
          <BentoQuickAction icon={<Users />} title="Growth" description="User metrics" onClick={() => console.log('Growth')} />
          <BentoQuickAction icon={<BarChart3 />} title="Efficiency" description="Operations" onClick={() => console.log('Efficiency')} />
          <BentoQuickAction icon={<Target />} title="Goals" description="Targets" onClick={() => console.log('Goals')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            Monthly
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>
            Quarterly
          </PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>
            Yearly
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Quarterly Performance</h3>
          <div className="space-y-4">
            {quarterlyPerformance.map((quarter, index) => {
              const revenuePercent = (quarter.revenue / maxRevenue) * 100
              const previousRevenue = index > 0 ? quarterlyPerformance[index - 1].revenue : quarter.revenue
              const growth = ((quarter.revenue - previousRevenue) / previousRevenue) * 100

              return (
                <div key={quarter.quarter} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{quarter.quarter}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{(quarter.users / 1000).toFixed(0)}K users</span>
                      <span className="text-muted-foreground">{quarter.margin}% margin</span>
                      <span className="font-semibold">${(quarter.revenue / 1000).toFixed(0)}K</span>
                      {index > 0 && (
                        <span className={`text-xs flex items-center gap-1 ${getTrendColor(growth)}`}>
                          {getTrendIcon(growth)}
                          {Math.abs(growth).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300"
                      style={{ width: `${revenuePercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {financialMetrics.map((section) => (
            <BentoCard key={section.category} className="p-6">
              <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
              <div className="space-y-4">
                {section.metrics.map((metric) => (
                  <div key={metric.label} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(metric.change)}`}>
                        {getTrendIcon(metric.change)}
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </div>
                    </div>
                    <p className="text-2xl font-bold mb-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ComparisonCard
                title="ARR Growth"
                current={{ label: 'Current ARR', value: 2400000 }}
                previous={{ label: 'Last Year', value: 1680000 }}
              />
              <ComparisonCard
                title="User Base Growth"
                current={{ label: 'Current Users', value: 124000 }}
                previous={{ label: 'Last Quarter', value: 89000 }}
              />
            </div>

            <RankingList title="🏆 Top Performing Metrics" items={topMetrics} />
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Revenue Target"
              current={2400000}
              goal={5000000}
              unit="$"
              icon={<Target className="w-5 h-5" />}
            />

            <ProgressCard
              title="User Acquisition Goal"
              current={124000}
              goal={250000}
              unit=""
              icon={<Users className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Highlights</h3>
              <div className="space-y-3">
                <MiniKPI label="Revenue Growth" value="42%" change={18.3} />
                <MiniKPI label="Gross Margin" value="78%" change={8.2} />
                <MiniKPI label="Burn Multiple" value="0.6x" change={-25.3} />
                <MiniKPI label="Rule of 40" value="120" change={35.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
