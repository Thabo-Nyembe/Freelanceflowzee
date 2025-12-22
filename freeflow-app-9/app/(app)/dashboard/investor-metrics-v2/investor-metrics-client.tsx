'use client'

import { useState } from 'react'
import { useInvestorMetrics, InvestorMetric, InvestorStats } from '@/lib/hooks/use-investor-metrics'
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
  Calendar,
  Plus,
  X,
  Loader2,
  Trash2
} from 'lucide-react'

interface InvestorMetricsClientProps {
  initialMetrics: InvestorMetric[]
  initialStats: InvestorStats
}

export default function InvestorMetricsClient({ initialMetrics, initialStats }: InvestorMetricsClientProps) {
  const {
    metrics,
    stats,
    loading,
    createMetric,
    deleteMetric,
    getMetricsByCategory
  } = useInvestorMetrics(initialMetrics, initialStats)

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('quarter')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    category: 'revenue' as const,
    current_value: 0,
    previous_value: 0,
    unit: 'currency',
    description: '',
    period: 'quarterly' as const
  })

  const handleCreateMetric = async () => {
    if (!newMetric.metric_name.trim()) return
    await createMetric(newMetric)
    setShowCreateModal(false)
    setNewMetric({ metric_name: '', category: 'revenue', current_value: 0, previous_value: 0, unit: 'currency', description: '', period: 'quarterly' })
  }

  const displayStats = [
    { label: 'Total Metrics', value: stats.total.toString(), change: 42.1, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Revenue Metrics', value: stats.revenue.toString(), change: 35.3, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Growth Metrics', value: stats.growth.toString(), change: 8.2, icon: <PieChart className="w-5 h-5" /> },
    { label: 'Avg Change', value: `${stats.avgChangePercent.toFixed(1)}%`, change: 15.7, icon: <BarChart3 className="w-5 h-5" /> }
  ]

  const revenueMetrics = getMetricsByCategory('revenue')
  const growthMetrics = getMetricsByCategory('growth')
  const efficiencyMetrics = getMetricsByCategory('efficiency')

  const topMetrics = metrics
    .sort((a, b) => b.change_percent - a.change_percent)
    .slice(0, 5)
    .map((m, i) => ({
      rank: i + 1,
      name: m.metric_name,
      avatar: m.category === 'revenue' ? '💰' : m.category === 'growth' ? '📈' : m.category === 'efficiency' ? '⚡' : '📊',
      value: `${m.change_percent.toFixed(1)}%`,
      change: m.change_percent
    }))

  const getTrendColor = (change: number) => change >= 0 ? 'text-green-600' : 'text-red-600'
  const getTrendIcon = (change: number) => change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="w-5 h-5" />
      case 'growth': return <TrendingUp className="w-5 h-5" />
      case 'efficiency': return <BarChart3 className="w-5 h-5" />
      default: return <PieChart className="w-5 h-5" />
    }
  }

  const formatValue = (metric: InvestorMetric) => {
    if (metric.unit === 'currency') {
      return metric.current_value >= 1000000
        ? `$${(metric.current_value / 1000000).toFixed(1)}M`
        : metric.current_value >= 1000
        ? `$${(metric.current_value / 1000).toFixed(1)}K`
        : `$${metric.current_value}`
    }
    if (metric.unit === 'percent') return `${metric.current_value}%`
    return metric.current_value.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-orange-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Award className="w-10 h-10 text-amber-600" />
              Investor Metrics
            </h1>
            <p className="text-muted-foreground">Key performance indicators for stakeholders</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" onClick={() => console.log('Export')}>
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </ModernButton>
            <GradientButton from="amber" to="orange" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Metric
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<DollarSign />} title="Revenue" description="Financial" onClick={() => console.log('Revenue')} />
          <BentoQuickAction icon={<Users />} title="Growth" description="User metrics" onClick={() => console.log('Growth')} />
          <BentoQuickAction icon={<BarChart3 />} title="Efficiency" description="Operations" onClick={() => console.log('Efficiency')} />
          <BentoQuickAction icon={<Target />} title="Goals" description="Targets" onClick={() => console.log('Goals')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>Monthly</PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>Quarterly</PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>Yearly</PillButton>
        </div>

        {loading && metrics.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : metrics.length === 0 ? (
          <BentoCard className="p-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50 text-amber-600" />
            <p className="text-muted-foreground mb-4">No investor metrics found</p>
            <ModernButton variant="outline" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Metric
            </ModernButton>
          </BentoCard>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { title: 'Revenue Metrics', metrics: revenueMetrics, category: 'revenue' },
                { title: 'Growth Metrics', metrics: growthMetrics, category: 'growth' },
                { title: 'Efficiency Metrics', metrics: efficiencyMetrics, category: 'efficiency' }
              ].map((section) => (
                <BentoCard key={section.category} className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                  <div className="space-y-4">
                    {section.metrics.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No metrics in this category</p>
                    ) : (
                      section.metrics.map((metric) => (
                        <div key={metric.id} className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{metric.metric_name}</span>
                            <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor(metric.change_percent)}`}>
                              {getTrendIcon(metric.change_percent)}
                              {metric.change_percent > 0 ? '+' : ''}{metric.change_percent.toFixed(1)}%
                            </div>
                          </div>
                          <p className="text-2xl font-bold mb-1">{formatValue(metric)}</p>
                          {metric.description && (
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          )}
                          <div className="flex justify-end mt-2">
                            <ModernButton variant="ghost" size="sm" onClick={() => deleteMetric(metric.id)}>
                              <Trash2 className="w-3 h-3" />
                            </ModernButton>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </BentoCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <ComparisonCard
                    title="Total Value Growth"
                    current={{ label: 'Current', value: stats.totalCurrentValue }}
                    previous={{ label: 'Previous', value: stats.totalCurrentValue * 0.7 }}
                  />
                  <ProgressCard
                    title="Revenue Target"
                    current={stats.totalCurrentValue}
                    goal={5000000}
                    unit="$"
                    icon={<Target className="w-5 h-5" />}
                  />
                </div>

                {topMetrics.length > 0 && (
                  <RankingList title="Top Performing Metrics" items={topMetrics} />
                )}
              </div>

              <div className="space-y-6">
                <BentoCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Key Highlights</h3>
                  <div className="space-y-3">
                    <MiniKPI label="Total Metrics" value={stats.total.toString()} change={18.3} />
                    <MiniKPI label="Revenue Metrics" value={stats.revenue.toString()} change={8.2} />
                    <MiniKPI label="Growth Metrics" value={stats.growth.toString()} change={25.3} />
                    <MiniKPI label="Avg Change" value={`${stats.avgChangePercent.toFixed(1)}%`} change={35.7} />
                  </div>
                </BentoCard>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Investor Metric</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Metric Name *</label>
                <input
                  type="text"
                  value={newMetric.metric_name}
                  onChange={(e) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Annual Recurring Revenue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newMetric.category}
                    onChange={(e) => setNewMetric({ ...newMetric, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="growth">Growth</option>
                    <option value="efficiency">Efficiency</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={newMetric.unit}
                    onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="currency">Currency ($)</option>
                    <option value="percent">Percent (%)</option>
                    <option value="number">Number</option>
                    <option value="ratio">Ratio</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Value</label>
                  <input
                    type="number"
                    value={newMetric.current_value}
                    onChange={(e) => setNewMetric({ ...newMetric, current_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Previous Value</label>
                  <input
                    type="number"
                    value={newMetric.previous_value}
                    onChange={(e) => setNewMetric({ ...newMetric, previous_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Brief description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="amber" to="orange" className="flex-1" onClick={handleCreateMetric} disabled={loading || !newMetric.metric_name.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Metric'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
