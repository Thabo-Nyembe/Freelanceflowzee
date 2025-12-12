"use client"

import { useState } from 'react'
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
  Zap,
  Target,
  ArrowUpRight
} from 'lucide-react'

/**
 * Pricing V2 - Groundbreaking Pricing Strategy & Analytics
 * Showcases pricing plans and revenue optimization with modern components
 */
export default function PricingV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('monthly')

  const stats = [
    { label: 'Avg Revenue Per User', value: '$42.50', change: 22.7, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Price Optimization', value: '+15%', change: 35.2, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Plan Adoption', value: '94%', change: 12.5, icon: <Users className="w-5 h-5" /> },
    { label: 'Upgrade Rate', value: '28%', change: 18.7, icon: <ArrowUpRight className="w-5 h-5" /> }
  ]

  const pricingPlans = [
    {
      id: '1',
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      subscribers: 1247,
      revenue: 0,
      churn: 15.2,
      upgrades: 247,
      color: 'from-gray-500 to-slate-500',
      features: ['Basic features', '5 projects', '1 GB storage']
    },
    {
      id: '2',
      name: 'Starter',
      monthlyPrice: 19,
      annualPrice: 190,
      subscribers: 847,
      revenue: selectedPeriod === 'monthly' ? 16093 : 160930,
      churn: 8.4,
      upgrades: 124,
      color: 'from-blue-500 to-cyan-500',
      features: ['All basic features', '50 projects', '50 GB storage', 'Email support']
    },
    {
      id: '3',
      name: 'Professional',
      monthlyPrice: 49,
      annualPrice: 490,
      subscribers: 456,
      revenue: selectedPeriod === 'monthly' ? 22344 : 223440,
      churn: 4.2,
      upgrades: 67,
      color: 'from-purple-500 to-pink-500',
      features: ['All starter features', 'Unlimited projects', '500 GB storage', 'Priority support', 'Advanced analytics']
    },
    {
      id: '4',
      name: 'Enterprise',
      monthlyPrice: 99,
      annualPrice: 990,
      subscribers: 234,
      revenue: selectedPeriod === 'monthly' ? 23166 : 231660,
      churn: 2.1,
      upgrades: 0,
      color: 'from-green-500 to-emerald-500',
      features: ['All pro features', 'Custom integrations', 'Unlimited storage', 'Dedicated support', 'SLA guarantee']
    }
  ]

  const pricePoints = [
    { price: '$0', conversion: 42.3, subscribers: 1247, label: 'Free' },
    { price: '$19', conversion: 28.5, subscribers: 847, label: 'Starter' },
    { price: '$49', conversion: 18.2, subscribers: 456, label: 'Pro' },
    { price: '$99', conversion: 8.4, subscribers: 234, label: 'Enterprise' }
  ]

  const topPlans = [
    { rank: 1, name: 'Professional', avatar: '💎', value: '$223K', change: 35.2 },
    { rank: 2, name: 'Enterprise', avatar: '🏢', value: '$232K', change: 28.7 },
    { rank: 3, name: 'Starter', avatar: '⭐', value: '$161K', change: 22.5 },
    { rank: 4, name: 'Free to Paid', avatar: '📈', value: '247', change: 42.1 },
    { rank: 5, name: 'Annual Plans', avatar: '📅', value: '67%', change: 18.3 }
  ]

  const maxRevenue = Math.max(...pricingPlans.map(p => p.revenue))
  const maxSubscribers = Math.max(...pricingPlans.map(p => p.subscribers))

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-violet-600" />
              Pricing & Revenue
            </h1>
            <p className="text-muted-foreground">Optimize pricing strategy and maximize revenue</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('Configure')}>
            <Settings className="w-5 h-5 mr-2" />
            Configure Pricing
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<DollarSign />} title="Plans" description="Manage tiers" onClick={() => console.log('Plans')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Target />} title="A/B Test" description="Optimize" onClick={() => console.log('Test')} />
          <BentoQuickAction icon={<Award />} title="Competitors" description="Benchmark" onClick={() => console.log('Competitors')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'monthly' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('monthly')}>
            Monthly
          </PillButton>
          <PillButton variant={selectedPeriod === 'annual' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('annual')}>
            Annual
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Pricing Plans Performance</h3>
              <div className="space-y-6">
                {pricingPlans.map((plan) => {
                  const revenuePercent = plan.revenue > 0 ? (plan.revenue / maxRevenue) * 100 : 0
                  const subscriberPercent = (plan.subscribers / maxSubscribers) * 100
                  const displayPrice = selectedPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice

                  return (
                    <div key={plan.id} className="p-4 rounded-xl border border-border bg-background">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center text-white font-bold text-xl`}>
                              {plan.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{plan.name}</h4>
                              <p className="text-2xl font-bold text-violet-600">
                                ${displayPrice}
                                <span className="text-sm font-normal text-muted-foreground">
                                  /{selectedPeriod === 'monthly' ? 'mo' : 'yr'}
                                </span>
                              </p>
                            </div>
                          </div>
                          {plan.revenue > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Revenue</p>
                              <p className="text-xl font-bold">${(plan.revenue / 1000).toFixed(1)}K</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Subscribers</p>
                            <p className="font-semibold">{plan.subscribers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Churn Rate</p>
                            <p className="font-semibold">{plan.churn}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Upgrades</p>
                            <p className="font-semibold">{plan.upgrades}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue Share</p>
                            <p className="font-semibold">{revenuePercent.toFixed(0)}%</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Subscriber Distribution</span>
                            <span className="font-semibold">{subscriberPercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${plan.color} transition-all duration-300`}
                              style={{ width: `${subscriberPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex flex-wrap gap-1">
                            {plan.features.map((feature, index) => (
                              <span key={index} className="text-xs px-2 py-1 rounded-md bg-muted flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Price Point Analysis</h3>
              <div className="space-y-4">
                {pricePoints.map((point, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-lg font-bold">{point.price}</p>
                        <p className="text-xs text-muted-foreground">{point.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{point.conversion}%</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-purple-600"
                        style={{ width: `${point.conversion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Performers" items={topPlans} />

            <div className="grid grid-cols-1 gap-6">
              <ComparisonCard
                title="Revenue Comparison"
                current={{ label: 'This Month', value: 61603 }}
                previous={{ label: 'Last Month', value: 48720 }}
              />
            </div>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="ARPU" value="$42.50" change={22.7} />
                <MiniKPI label="LTV" value="$1,247" change={35.2} />
                <MiniKPI label="CAC Payback" value="3.2mo" change={-15.3} />
                <MiniKPI label="Price Sensitivity" value="Low" change={8.4} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Annual vs Monthly</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Annual Plans</span>
                    <span className="text-sm font-bold">67%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-emerald-600" style={{ width: '67%' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Monthly Plans</span>
                    <span className="text-sm font-bold">33%</span>
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
    </div>
  )
}
