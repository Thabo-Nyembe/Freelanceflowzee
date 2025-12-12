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
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  Zap,
  Award,
  Calendar
} from 'lucide-react'

/**
 * Growth Hub V2 - Groundbreaking Growth Analytics
 * Showcases growth metrics with modern components
 */
export default function GrowthHubV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  const stats = [
    { label: 'Revenue Growth', value: '+32%', change: 12.5, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'User Growth', value: '+847', change: 25.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Conversion Rate', value: '4.2%', change: 15.2, icon: <Target className="w-5 h-5" /> },
    { label: 'MRR', value: '$24.5K', change: 18.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const growthMetrics = [
    { metric: 'New Users', current: 847, previous: 672, growth: 26 },
    { metric: 'Revenue', current: 124500, previous: 94200, growth: 32 },
    { metric: 'Active Users', current: 2847, previous: 2340, growth: 22 },
    { metric: 'Conversion Rate', current: 4.2, previous: 3.6, growth: 17 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              Growth Hub
            </h1>
            <p className="text-muted-foreground">Track and optimize your growth metrics</p>
          </div>
          <GradientButton from="green" to="emerald" onClick={() => console.log('Export')}>
            <BarChart3 className="w-5 h-5 mr-2" />
            View Report
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>
            Week
          </PillButton>
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            Month
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>
            Quarter
          </PillButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Set Goals" description="Growth targets" onClick={() => console.log('Goals')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Deep dive" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Zap />} title="Experiments" description="A/B tests" onClick={() => console.log('Experiments')} />
          <BentoQuickAction icon={<Award />} title="Milestones" description="Achievements" onClick={() => console.log('Milestones')} />
        </div>

        <BentoCard className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Growth Metrics
          </h2>
          <div className="space-y-4">
            {growthMetrics.map((metric) => (
              <div key={metric.metric} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      +{metric.growth}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Current</p>
                    <p className="font-bold text-green-600">
                      {metric.metric === 'Revenue' ? `$${(metric.current / 1000).toFixed(1)}K` :
                       metric.metric === 'Conversion Rate' ? `${metric.current}%` :
                       metric.current.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Previous</p>
                    <p className="font-semibold text-gray-600">
                      {metric.metric === 'Revenue' ? `$${(metric.previous / 1000).toFixed(1)}K` :
                       metric.metric === 'Conversion Rate' ? `${metric.previous}%` :
                       metric.previous.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonCard
            title="Monthly Comparison"
            current={{ label: 'This Month', value: 124500 }}
            previous={{ label: 'Last Month', value: 94200 }}
          />
          <ProgressCard
            title="Annual Revenue Goal"
            current={124500}
            goal={500000}
            unit="$"
            icon={<Target className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BentoCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Growth Initiatives</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Content Marketing</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">Active</span>
                </div>
                <p className="text-xs text-muted-foreground">Blog posts & SEO optimization</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Referral Program</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Testing</span>
                </div>
                <p className="text-xs text-muted-foreground">User referral incentives</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Email Campaigns</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">Active</span>
                </div>
                <p className="text-xs text-muted-foreground">Automated nurture sequences</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <MiniKPI label="CAC" value="$42" change={-12.5} />
              <MiniKPI label="LTV" value="$1,247" change={25.3} />
              <MiniKPI label="LTV:CAC Ratio" value="29.7x" change={42.1} />
              <MiniKPI label="Churn Rate" value="2.1%" change={-15.2} />
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  )
}
