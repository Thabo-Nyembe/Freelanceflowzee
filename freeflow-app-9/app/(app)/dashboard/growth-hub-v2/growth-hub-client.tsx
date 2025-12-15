'use client'

import { useState } from 'react'
import { useGrowthMetrics, GrowthMetric, GrowthStats } from '@/lib/hooks/use-growth-metrics'
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
  ArrowDownRight,
  Zap,
  Award,
  Calendar,
  Plus,
  X,
  Loader2,
  Trash2,
  Edit3
} from 'lucide-react'

interface GrowthHubClientProps {
  initialMetrics: GrowthMetric[]
  initialStats: GrowthStats
}

export default function GrowthHubClient({ initialMetrics, initialStats }: GrowthHubClientProps) {
  const {
    metrics,
    stats,
    loading,
    createMetric,
    updateMetric,
    deleteMetric,
    recordValue,
    setAsGoal,
    getGoalProgress
  } = useGrowthMetrics(initialMetrics, initialStats)

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'users' | 'conversion'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<GrowthMetric | null>(null)
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_type: 'custom' as const,
    current_value: 0,
    previous_value: 0,
    target_value: 0,
    period: 'monthly' as const,
    unit: 'count',
    is_goal: false
  })
  const [newValue, setNewValue] = useState(0)

  const filteredMetrics = metrics.filter(metric => {
    if (typeFilter === 'all') return true
    return metric.metric_type === typeFilter
  })

  const goals = metrics.filter(m => m.is_goal)

  const handleCreateMetric = async () => {
    if (!newMetric.metric_name.trim()) return
    await createMetric(newMetric)
    setShowCreateModal(false)
    setNewMetric({ metric_name: '', metric_type: 'custom', current_value: 0, previous_value: 0, target_value: 0, period: 'monthly', unit: 'count', is_goal: false })
  }

  const handleRecordValue = async () => {
    if (!selectedMetric) return
    await recordValue(selectedMetric.id, newValue)
    setShowRecordModal(false)
    setSelectedMetric(null)
    setNewValue(0)
  }

  const displayStats = [
    { label: 'Revenue Growth', value: `+${stats.avgGrowthRate.toFixed(1)}%`, change: 12.5, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Active Metrics', value: stats.total.toString(), change: 25.3, icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Goals Set', value: stats.goals.toString(), change: 15.2, icon: <Target className="w-5 h-5" /> },
    { label: 'Total Value', value: `$${(stats.totalCurrentValue / 1000).toFixed(1)}K`, change: 18.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="w-5 h-5" />
      case 'users': return <Users className="w-5 h-5" />
      case 'conversion': return <Target className="w-5 h-5" />
      case 'engagement': return <Zap className="w-5 h-5" />
      case 'retention': return <Award className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'from-green-500 to-emerald-500'
      case 'users': return 'from-blue-500 to-cyan-500'
      case 'conversion': return 'from-purple-500 to-pink-500'
      case 'engagement': return 'from-orange-500 to-amber-500'
      case 'retention': return 'from-indigo-500 to-purple-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatValue = (metric: GrowthMetric) => {
    if (metric.unit === '$' || metric.metric_type === 'revenue') {
      return `$${metric.current_value >= 1000 ? (metric.current_value / 1000).toFixed(1) + 'K' : metric.current_value}`
    }
    if (metric.unit === '%' || metric.metric_type === 'conversion') {
      return `${metric.current_value}%`
    }
    return metric.current_value.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:from-green-950 dark:via-emerald-950/30 dark:to-teal-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              Growth Hub
            </h1>
            <p className="text-muted-foreground">Track and optimize your growth metrics</p>
          </div>
          <GradientButton from="green" to="emerald" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Metric
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>Week</PillButton>
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>Month</PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>Quarter</PillButton>
          <div className="w-px h-6 bg-border" />
          <PillButton variant={typeFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('all')}>All</PillButton>
          <PillButton variant={typeFilter === 'revenue' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('revenue')}>Revenue</PillButton>
          <PillButton variant={typeFilter === 'users' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('users')}>Users</PillButton>
          <PillButton variant={typeFilter === 'conversion' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('conversion')}>Conversion</PillButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Set Goals" description="Growth targets" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Deep dive" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Zap />} title="Experiments" description="A/B tests" onClick={() => console.log('Experiments')} />
          <BentoQuickAction icon={<Award />} title="Milestones" description="Achievements" onClick={() => console.log('Milestones')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BentoCard className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-green-200 dark:border-green-800">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Growth Metrics
              </h2>
              {loading && metrics.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : filteredMetrics.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No metrics found</p>
                  <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Metric
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMetrics.map((metric) => (
                    <div key={metric.id} className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTypeColor(metric.metric_type)} flex items-center justify-center text-white`}>
                            {getTypeIcon(metric.metric_type)}
                          </div>
                          <div>
                            <span className="font-semibold">{metric.metric_name}</span>
                            <p className="text-xs text-muted-foreground capitalize">{metric.metric_type} • {metric.period}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold flex items-center gap-1 ${metric.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.growth_rate >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {metric.growth_rate >= 0 ? '+' : ''}{metric.growth_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Current</p>
                          <p className="font-bold text-green-600">{formatValue(metric)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Previous</p>
                          <p className="font-semibold text-muted-foreground">
                            {metric.unit === '$' || metric.metric_type === 'revenue'
                              ? `$${metric.previous_value >= 1000 ? (metric.previous_value / 1000).toFixed(1) + 'K' : metric.previous_value}`
                              : metric.unit === '%' || metric.metric_type === 'conversion'
                              ? `${metric.previous_value}%`
                              : metric.previous_value.toLocaleString()}
                          </p>
                        </div>
                        {metric.is_goal && metric.target_value && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="font-semibold text-blue-600">
                              {metric.unit === '$' || metric.metric_type === 'revenue'
                                ? `$${metric.target_value >= 1000 ? (metric.target_value / 1000).toFixed(1) + 'K' : metric.target_value}`
                                : metric.target_value.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      {metric.is_goal && metric.target_value && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{getGoalProgress(metric).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                              style={{ width: `${getGoalProgress(metric)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <ModernButton variant="outline" size="sm" onClick={() => {
                          setSelectedMetric(metric)
                          setNewValue(metric.current_value)
                          setShowRecordModal(true)
                        }}>
                          <Edit3 className="w-3 h-3 mr-1" />Record Value
                        </ModernButton>
                        {!metric.is_goal && (
                          <ModernButton variant="outline" size="sm" onClick={() => setAsGoal(metric.id, metric.current_value * 2)}>
                            <Target className="w-3 h-3 mr-1" />Set Goal
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => deleteMetric(metric.id)}>
                          <Trash2 className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComparisonCard
                title="Monthly Comparison"
                current={{ label: 'This Month', value: stats.totalCurrentValue }}
                previous={{ label: 'Last Month', value: stats.totalTargetValue || stats.totalCurrentValue * 0.8 }}
              />
              <ProgressCard
                title="Annual Revenue Goal"
                current={stats.totalCurrentValue}
                goal={stats.totalTargetValue || 500000}
                unit="$"
                icon={<Target className="w-5 h-5" />}
              />
            </div>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Goals</h3>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No goals set</p>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 5).map((goal) => (
                    <div key={goal.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{goal.metric_name}</span>
                        <span className="text-xs text-green-600">{getGoalProgress(goal).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${getGoalProgress(goal)}%` }}
                        />
                      </div>
                      {goal.goal_deadline && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(goal.goal_deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Revenue Metrics" value={stats.revenue.toString()} change={25.3} />
                <MiniKPI label="User Metrics" value={stats.users.toString()} change={18.7} />
                <MiniKPI label="Conversion Metrics" value={stats.conversion.toString()} change={12.5} />
                <MiniKPI label="Avg Growth Rate" value={`${stats.avgGrowthRate.toFixed(1)}%`} change={15.2} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Growth Initiatives</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Content Marketing</span>
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded-md">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Blog posts & SEO optimization</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Referral Program</span>
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-1 rounded-md">Testing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">User referral incentives</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Email Campaigns</span>
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 px-2 py-1 rounded-md">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Automated nurture sequences</p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add Growth Metric</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Metric Name *</label>
                <input
                  type="text"
                  value={newMetric.metric_name}
                  onChange={(e) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Monthly Revenue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newMetric.metric_type}
                    onChange={(e) => setNewMetric({ ...newMetric, metric_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="users">Users</option>
                    <option value="conversion">Conversion</option>
                    <option value="engagement">Engagement</option>
                    <option value="retention">Retention</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Period</label>
                  <select
                    value={newMetric.period}
                    onChange={(e) => setNewMetric({ ...newMetric, period: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
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
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Previous Value</label>
                  <input
                    type="number"
                    value={newMetric.previous_value}
                    onChange={(e) => setNewMetric({ ...newMetric, previous_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    value={newMetric.unit}
                    onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="count">Count</option>
                    <option value="$">Dollar ($)</option>
                    <option value="%">Percent (%)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMetric.is_goal}
                      onChange={(e) => setNewMetric({ ...newMetric, is_goal: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Set as Goal</span>
                  </label>
                </div>
              </div>
              {newMetric.is_goal && (
                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <input
                    type="number"
                    value={newMetric.target_value}
                    onChange={(e) => setNewMetric({ ...newMetric, target_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="green" to="emerald" className="flex-1" onClick={handleCreateMetric} disabled={loading || !newMetric.metric_name.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Metric'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecordModal && selectedMetric && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Record New Value</h2>
              <button onClick={() => { setShowRecordModal(false); setSelectedMetric(null) }}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Recording value for: <strong>{selectedMetric.metric_name}</strong></p>
              <div>
                <label className="block text-sm font-medium mb-1">New Value</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => { setShowRecordModal(false); setSelectedMetric(null) }}>Cancel</ModernButton>
                <GradientButton from="green" to="emerald" className="flex-1" onClick={handleRecordValue} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Record'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
