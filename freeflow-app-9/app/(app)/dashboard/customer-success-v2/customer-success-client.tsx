'use client'

import { useState } from 'react'
import { useCustomerSuccess, type CustomerSuccess, type HealthStatus, type AccountTier } from '@/lib/hooks/use-customer-success'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI, ProgressCard, RankingList } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Heart, TrendingUp, AlertTriangle, DollarSign, Users, Calendar, Award, Activity } from 'lucide-react'

export default function CustomerSuccessClient({ initialCustomers }: { initialCustomers: CustomerSuccess[] }) {
  const [healthStatusFilter, setHealthStatusFilter] = useState<HealthStatus | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<AccountTier | 'all'>('all')
  const { customers, loading, error } = useCustomerSuccess({ healthStatus: healthStatusFilter, accountTier: tierFilter })

  const displayCustomers = customers.length > 0 ? customers : initialCustomers

  const stats = [
    {
      label: 'Total ARR',
      value: `$${(displayCustomers.reduce((sum, c) => sum + c.arr, 0) / 1000000).toFixed(1)}M`,
      change: 12.5,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Avg Health Score',
      value: displayCustomers.length > 0
        ? (displayCustomers.reduce((sum, c) => sum + c.health_score, 0) / displayCustomers.length).toFixed(0)
        : '0',
      change: 4.2,
      icon: <Heart className="w-5 h-5" />
    },
    {
      label: 'At Risk',
      value: displayCustomers.filter(c => c.health_status === 'at_risk' || c.health_status === 'critical').length.toString(),
      change: -8.3,
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      label: 'Net Retention',
      value: '118%',
      change: 8.5,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-700 border-green-200'
      case 'at_risk': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'churned': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'onboarding': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTierColor = (tier: AccountTier) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'business': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'professional': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      case 'starter': return 'bg-green-100 text-green-700 border-green-200'
      case 'trial': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-orange-100 text-orange-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const topCustomersByARR = displayCustomers
    .sort((a, b) => b.arr - a.arr)
    .slice(0, 5)
    .map((customer, index) => ({
      rank: index + 1,
      label: customer.customer_name,
      value: formatCurrency(customer.arr),
      change: customer.health_score
    }))

  const recentActivity = displayCustomers.slice(0, 4).map((c, idx) => ({
    icon: <Heart className="w-5 h-5" />,
    title: c.health_status === 'healthy' ? 'Healthy' : 'At Risk',
    description: c.customer_name,
    time: new Date(c.updated_at).toLocaleDateString(),
    status: c.health_status === 'healthy' ? 'success' as const : c.health_status === 'at_risk' ? 'warning' as const : 'error' as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10 text-emerald-600" />
              Customer Success
            </h1>
            <p className="text-muted-foreground">Monitor customer health and drive retention</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => console.log('New review')}>
            <Calendar className="w-5 h-5 mr-2" />
            Schedule QBR
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={healthStatusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setHealthStatusFilter('all')}>
            All Customers
          </PillButton>
          <PillButton variant={healthStatusFilter === 'healthy' ? 'primary' : 'ghost'} onClick={() => setHealthStatusFilter('healthy')}>
            Healthy
          </PillButton>
          <PillButton variant={healthStatusFilter === 'at_risk' ? 'primary' : 'ghost'} onClick={() => setHealthStatusFilter('at_risk')}>
            At Risk
          </PillButton>
          <PillButton variant={healthStatusFilter === 'critical' ? 'primary' : 'ghost'} onClick={() => setHealthStatusFilter('critical')}>
            Critical
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {displayCustomers.map((customer) => (
                <BentoCard key={customer.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getHealthStatusColor(customer.health_status)}`}>
                          {customer.health_status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs border ${getTierColor(customer.account_tier)}`}>
                          {customer.account_tier}
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs ${getEngagementColor(customer.engagement_level)}`}>
                          {customer.engagement_level} engagement
                        </span>
                      </div>
                      {customer.company_name && (
                        <p className="text-sm text-muted-foreground">{customer.company_name}</p>
                      )}
                      {customer.csm_name && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>CSM: {customer.csm_name}</span>
                          {customer.days_to_renewal !== undefined && customer.days_to_renewal > 0 && (
                            <span className={customer.days_to_renewal <= 90 ? 'text-red-600 font-semibold' : ''}>
                              Renewal: {customer.days_to_renewal} days
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getHealthColor(customer.health_score)}`}>
                        {customer.health_score}
                      </div>
                      <div className="text-xs text-muted-foreground">Health Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">MRR</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(customer.mrr)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ARR</p>
                      <p className="font-semibold">{formatCurrency(customer.arr)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">NPS</p>
                      <p className="font-semibold text-blue-600">{customer.nps_score !== undefined ? `${customer.nps_score}/10` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Usage</p>
                      <p className="font-semibold text-purple-600">{customer.product_usage_percentage.toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Health Score: {customer.health_score}/100</span>
                      <span className="text-muted-foreground">Support Tickets: {customer.support_ticket_count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          customer.health_score >= 80
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : customer.health_score >= 60
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${customer.health_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <ModernButton variant="outline" size="sm">View Profile</ModernButton>
                    <ModernButton variant="outline" size="sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      Schedule QBR
                    </ModernButton>
                    {customer.expansion_opportunity && (
                      <ModernButton variant="outline" size="sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Expansion
                      </ModernButton>
                    )}
                  </div>
                </BentoCard>
              ))}

              {displayCustomers.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Customers</h3>
                  <p className="text-muted-foreground">Add your first customer</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Customers by ARR" items={topCustomersByARR} />

            <ProgressCard
              label="Customer Health Distribution"
              current={displayCustomers.filter(c => c.health_status === 'healthy').length}
              target={displayCustomers.length}
              subtitle={`${displayCustomers.filter(c => c.health_status === 'healthy').length} healthy customers`}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg NPS" value={displayCustomers.length > 0 ? `${(displayCustomers.reduce((sum, c) => sum + (c.nps_score || 0), 0) / displayCustomers.length).toFixed(1)}/10` : 'N/A'} change={4.2} />
                <MiniKPI label="Churn Rate" value="2.8%" change={-5.3} />
                <MiniKPI label="Expansion Revenue" value={formatCurrency(displayCustomers.reduce((sum, c) => sum + c.upsell_potential, 0))} change={18.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
