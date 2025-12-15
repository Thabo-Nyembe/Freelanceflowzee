'use client'

import { useState } from 'react'
import { usePricingPlans, PricingPlan, PricingStats } from '@/lib/hooks/use-pricing-plans'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ComparisonCard,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  Settings,
  BarChart3,
  Target,
  ArrowUpRight,
  Plus,
  X,
  Loader2,
  Trash2,
  Star,
  Edit3
} from 'lucide-react'

interface PricingClientProps {
  initialPlans: PricingPlan[]
  initialStats: PricingStats
}

export default function PricingClient({ initialPlans, initialStats }: PricingClientProps) {
  const {
    plans,
    stats,
    loading,
    createPlan,
    deletePlan,
    toggleActive,
    setFeatured,
    updateSubscribers
  } = usePricingPlans(initialPlans, initialStats)

  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    monthly_price: 0,
    annual_price: 0,
    features: ['']
  })

  const handleCreatePlan = async () => {
    if (!newPlan.name.trim()) return
    const features = newPlan.features.filter(f => f.trim())
    await createPlan({
      ...newPlan,
      annual_price: newPlan.annual_price || newPlan.monthly_price * 10,
      features
    })
    setShowCreateModal(false)
    setNewPlan({ name: '', description: '', monthly_price: 0, annual_price: 0, features: [''] })
  }

  const addFeatureInput = () => {
    setNewPlan({ ...newPlan, features: [...newPlan.features, ''] })
  }

  const updateFeature = (index: number, value: string) => {
    const features = [...newPlan.features]
    features[index] = value
    setNewPlan({ ...newPlan, features })
  }

  const displayStats = [
    { label: 'Avg Revenue Per User', value: `$${stats.arpu.toFixed(2)}`, change: 22.7, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Total Subscribers', value: stats.totalSubscribers.toLocaleString(), change: 35.2, icon: <Users className="w-5 h-5" /> },
    { label: 'Monthly Revenue', value: `$${(stats.totalRevenueMonthly / 1000).toFixed(1)}K`, change: 12.5, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Avg Upgrade Rate', value: `${stats.avgUpgradeRate.toFixed(1)}%`, change: 18.7, icon: <ArrowUpRight className="w-5 h-5" /> }
  ]

  const topPlans = plans
    .filter(p => p.is_active)
    .sort((a, b) => b.revenue_monthly - a.revenue_monthly)
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      avatar: p.is_featured ? '💎' : '⭐',
      value: `$${(p.revenue_monthly / 1000).toFixed(1)}K`,
      change: p.upgrade_rate
    }))

  const maxSubscribers = Math.max(...plans.map(p => p.subscribers_count), 1)

  const getPlanColor = (index: number) => {
    const colors = [
      'from-gray-500 to-slate-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:from-violet-950 dark:via-purple-950/30 dark:to-fuchsia-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-violet-600" />
              Pricing & Revenue
            </h1>
            <p className="text-muted-foreground">Optimize pricing strategy and maximize revenue</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Plan
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<DollarSign />} title="Plans" description="Manage tiers" onClick={() => console.log('Plans')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Target />} title="A/B Test" description="Optimize" onClick={() => console.log('Test')} />
          <BentoQuickAction icon={<Award />} title="Competitors" description="Benchmark" onClick={() => console.log('Competitors')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'monthly' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('monthly')}>Monthly</PillButton>
          <PillButton variant={selectedPeriod === 'annual' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('annual')}>Annual</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Pricing Plans Performance</h3>
              {loading && plans.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pricing plans found</p>
                  <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Plan
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-6">
                  {plans.map((plan, index) => {
                    const subscriberPercent = (plan.subscribers_count / maxSubscribers) * 100
                    const displayPrice = selectedPeriod === 'monthly' ? plan.monthly_price : plan.annual_price
                    const revenue = selectedPeriod === 'monthly' ? plan.revenue_monthly : plan.revenue_annual

                    return (
                      <div key={plan.id} className={`p-4 rounded-xl border ${plan.is_active ? 'border-border bg-background' : 'border-dashed border-muted bg-muted/30'}`}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getPlanColor(index)} flex items-center justify-center text-white font-bold text-xl`}>
                                {plan.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-lg">{plan.name}</h4>
                                  {plan.is_featured && (
                                    <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      Featured
                                    </span>
                                  )}
                                  {!plan.is_active && (
                                    <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">Inactive</span>
                                  )}
                                </div>
                                <p className="text-2xl font-bold text-violet-600">
                                  ${displayPrice}
                                  <span className="text-sm font-normal text-muted-foreground">
                                    /{selectedPeriod === 'monthly' ? 'mo' : 'yr'}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {revenue > 0 && (
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-xl font-bold">${(revenue / 1000).toFixed(1)}K</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Subscribers</p>
                              <p className="font-semibold">{plan.subscribers_count.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Churn Rate</p>
                              <p className="font-semibold">{plan.churn_rate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Upgrade Rate</p>
                              <p className="font-semibold">{plan.upgrade_rate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Distribution</p>
                              <p className="font-semibold">{subscriberPercent.toFixed(0)}%</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getPlanColor(index)} transition-all duration-300`}
                                style={{ width: `${subscriberPercent}%` }}
                              />
                            </div>
                          </div>

                          {plan.features && plan.features.length > 0 && (
                            <div className="pt-2 border-t">
                              <div className="flex flex-wrap gap-1">
                                {plan.features.slice(0, 5).map((feature: any, i: number) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-md bg-muted flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    {typeof feature === 'string' ? feature : feature.name || 'Feature'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <ModernButton variant="outline" size="sm" onClick={() => toggleActive(plan.id)}>
                              {plan.is_active ? 'Deactivate' : 'Activate'}
                            </ModernButton>
                            {!plan.is_featured && plan.is_active && (
                              <ModernButton variant="outline" size="sm" onClick={() => setFeatured(plan.id)}>
                                <Star className="w-3 h-3 mr-1" />
                                Set Featured
                              </ModernButton>
                            )}
                            <ModernButton variant="outline" size="sm" onClick={() => deletePlan(plan.id)}>
                              <Trash2 className="w-3 h-3" />
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            {topPlans.length > 0 && (
              <RankingList title="Top Performers" items={topPlans} />
            )}

            <ComparisonCard
              title="Revenue Comparison"
              current={{ label: 'This Month', value: stats.totalRevenueMonthly }}
              previous={{ label: 'Last Month', value: stats.totalRevenueMonthly * 0.8 }}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="ARPU" value={`$${stats.arpu.toFixed(2)}`} change={22.7} />
                <MiniKPI label="Total Plans" value={stats.total.toString()} change={12.5} />
                <MiniKPI label="Active Plans" value={stats.active.toString()} change={8.3} />
                <MiniKPI label="Avg Churn" value={`${stats.avgChurnRate.toFixed(1)}%`} change={-5.2} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Annual vs Monthly</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Annual Revenue</span>
                    <span className="text-sm font-bold">${(stats.totalRevenueAnnual / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600" style={{ width: '67%' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Monthly Revenue</span>
                    <span className="text-sm font-bold">${(stats.totalRevenueMonthly / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600" style={{ width: '33%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Pricing Plan</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., Professional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Plan description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    value={newPlan.monthly_price}
                    onChange={(e) => setNewPlan({ ...newPlan, monthly_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Annual Price ($)</label>
                  <input
                    type="number"
                    value={newPlan.annual_price || newPlan.monthly_price * 10}
                    onChange={(e) => setNewPlan({ ...newPlan, annual_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={`${newPlan.monthly_price * 10}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Features</label>
                <div className="space-y-2">
                  {newPlan.features.map((feature, index) => (
                    <input
                      key={index}
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder={`Feature ${index + 1}`}
                    />
                  ))}
                  <ModernButton variant="ghost" size="sm" onClick={addFeatureInput}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Feature
                  </ModernButton>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="violet" to="purple" className="flex-1" onClick={handleCreatePlan} disabled={loading || !newPlan.name.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Plan'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
