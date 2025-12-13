'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type CustomerStatus = 'healthy' | 'at-risk' | 'churned' | 'onboarding'
type EngagementLevel = 'high' | 'medium' | 'low' | 'inactive'
type AccountTier = 'enterprise' | 'business' | 'professional' | 'starter'
type ViewMode = 'all' | 'healthy' | 'at-risk' | 'churned'

export default function CustomerSuccessV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample customer success data
  const customers = [
    {
      id: 'CS-2847',
      company: 'Acme Corporation',
      status: 'healthy' as const,
      healthScore: 92,
      tier: 'enterprise' as const,
      engagement: 'high' as const,
      mrr: 25000,
      arr: 300000,
      contractStart: '2023-01-15',
      renewalDate: '2025-01-15',
      daysToRenewal: 367,
      csm: 'Emily Rodriguez',
      lastContact: '2024-02-10',
      nps: 9,
      productUsage: 87,
      supportTickets: 12,
      features: ['API', 'Analytics', 'Integrations']
    },
    {
      id: 'CS-2846',
      company: 'TechStart Inc',
      status: 'at-risk' as const,
      healthScore: 42,
      tier: 'business' as const,
      engagement: 'low' as const,
      mrr: 5000,
      arr: 60000,
      contractStart: '2023-06-01',
      renewalDate: '2024-06-01',
      daysToRenewal: 108,
      csm: 'Michael Chen',
      lastContact: '2024-01-28',
      nps: 4,
      productUsage: 28,
      supportTickets: 24,
      features: ['Basic', 'Support']
    },
    {
      id: 'CS-2845',
      company: 'Global Solutions Ltd',
      status: 'healthy' as const,
      healthScore: 88,
      tier: 'enterprise' as const,
      engagement: 'high' as const,
      mrr: 18000,
      arr: 216000,
      contractStart: '2023-03-01',
      renewalDate: '2025-03-01',
      daysToRenewal: 412,
      csm: 'Sarah Johnson',
      lastContact: '2024-02-12',
      nps: 8,
      productUsage: 92,
      supportTickets: 8,
      features: ['API', 'Analytics', 'Custom']
    },
    {
      id: 'CS-2844',
      company: 'StartupXYZ',
      status: 'onboarding' as const,
      healthScore: 65,
      tier: 'professional' as const,
      engagement: 'medium' as const,
      mrr: 1500,
      arr: 18000,
      contractStart: '2024-02-01',
      renewalDate: '2025-02-01',
      daysToRenewal: 352,
      csm: 'David Kim',
      lastContact: '2024-02-13',
      nps: 7,
      productUsage: 45,
      supportTickets: 6,
      features: ['Basic', 'Analytics']
    },
    {
      id: 'CS-2843',
      company: 'Enterprise Corp',
      status: 'churned' as const,
      healthScore: 18,
      tier: 'business' as const,
      engagement: 'inactive' as const,
      mrr: 0,
      arr: 0,
      contractStart: '2022-09-01',
      renewalDate: '2024-01-15',
      daysToRenewal: -30,
      csm: 'Jessica Williams',
      lastContact: '2023-12-20',
      nps: 3,
      productUsage: 5,
      supportTickets: 42,
      features: []
    }
  ]

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'at-risk': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'churned': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'onboarding': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getTierColor = (tier: AccountTier) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'business': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'professional': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'starter': return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
  }

  const getEngagementColor = (engagement: EngagementLevel) => {
    switch (engagement) {
      case 'high': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'inactive': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const filteredCustomers = viewMode === 'all'
    ? customers
    : customers.filter(customer => customer.status === viewMode)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Customer Success
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor customer health and drive retention
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300">
              New Customer Review
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total ARR',
              value: '$8.4M',
              change: '+1.2M',
              trend: 'up' as const,
              subtitle: 'annual recurring revenue'
            },
            {
              label: 'Avg Health Score',
              value: '76',
              change: '+4',
              trend: 'up' as const,
              subtitle: 'customer health'
            },
            {
              label: 'At Risk Customers',
              value: '12',
              change: '-3',
              trend: 'up' as const,
              subtitle: 'require attention'
            },
            {
              label: 'Net Retention',
              value: '118%',
              change: '+8%',
              trend: 'up' as const,
              subtitle: 'revenue retention'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Health Check', icon: '💚', onClick: () => {} },
            { label: 'QBR Schedule', icon: '📅', onClick: () => {} },
            { label: 'Risk Analysis', icon: '⚠️', onClick: () => {} },
            { label: 'Expansion', icon: '📈', onClick: () => {} },
            { label: 'NPS Survey', icon: '📊', onClick: () => {} },
            { label: 'Success Plans', icon: '🎯', onClick: () => {} },
            { label: 'Reports', icon: '📋', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Customers"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Healthy"
            isActive={viewMode === 'healthy'}
            onClick={() => setViewMode('healthy')}
          />
          <PillButton
            label="At Risk"
            isActive={viewMode === 'at-risk'}
            onClick={() => setViewMode('at-risk')}
          />
          <PillButton
            label="Churned"
            isActive={viewMode === 'churned'}
            onClick={() => setViewMode('churned')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Customers List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Customers ({filteredCustomers.length})
              </h2>
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {customer.company}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTierColor(customer.tier)}`}>
                            {customer.tier}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getEngagementColor(customer.engagement)}`}>
                            {customer.engagement} engagement
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-emerald-500">👤</span>
                            CSM: {customer.csm}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-emerald-500">📅</span>
                            Last Contact: {customer.lastContact}
                          </span>
                          {customer.daysToRenewal > 0 ? (
                            <span className={`flex items-center gap-1 ${customer.daysToRenewal <= 90 ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                              <span className="text-emerald-500">🔄</span>
                              Renewal: {customer.daysToRenewal} days
                            </span>
                          ) : customer.daysToRenewal < 0 ? (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                              <span>❌</span>
                              Churned
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getHealthColor(customer.healthScore)}`}>
                          {customer.healthScore}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Health Score
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">MRR</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(customer.mrr)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">ARR</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(customer.arr)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">NPS</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {customer.nps}/10
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Usage</div>
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {customer.productUsage}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Health Score: {customer.healthScore}/100</span>
                        <span>Support Tickets: {customer.supportTickets}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            customer.healthScore >= 80
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                              : customer.healthScore >= 60
                              ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                              : 'bg-gradient-to-r from-red-600 to-orange-600'
                          }`}
                          style={{ width: `${customer.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {customer.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">Active Features:</div>
                        <div className="flex flex-wrap gap-2">
                          {customer.features.map((feature) => (
                            <span key={feature} className="px-2 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Customer Health Distribution */}
            <ProgressCard
              title="Customer Health"
              items={[
                { label: 'Healthy (80-100)', value: 124, total: 284, color: 'green' },
                { label: 'Good (60-79)', value: 98, total: 284, color: 'blue' },
                { label: 'At Risk (40-59)', value: 42, total: 284, color: 'orange' },
                { label: 'Critical (<40)', value: 12, total: 284, color: 'red' },
                { label: 'Churned', value: 8, total: 284, color: 'slate' }
              ]}
            />

            {/* Top CSMs by ARR */}
            <RankingList
              title="Top CSMs by ARR"
              items={[
                { label: 'Emily Rodriguez', value: '$2.4M ARR', rank: 1, trend: 'up' },
                { label: 'Sarah Johnson', value: '$1.8M ARR', rank: 2, trend: 'up' },
                { label: 'Michael Chen', value: '$1.2M ARR', rank: 3, trend: 'same' },
                { label: 'David Kim', value: '$980K ARR', rank: 4, trend: 'down' },
                { label: 'Jessica Williams', value: '$720K ARR', rank: 5, trend: 'up' }
              ]}
            />

            {/* Upcoming Renewals */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Upcoming Renewals</h3>
              <div className="space-y-3">
                {customers.filter(c => c.daysToRenewal > 0 && c.daysToRenewal <= 120).map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm mb-1">
                      {customer.company}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className={customer.daysToRenewal <= 90 ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                        {customer.daysToRenewal} days
                      </span>
                      <span className="font-medium">{formatCurrency(customer.arr)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg NPS"
                value="7.8/10"
                trend="up"
                change="+0.4"
              />
              <MiniKPI
                label="Churn Rate"
                value="2.8%"
                trend="down"
                change="-0.5%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'QBR completed',
                  subject: 'Acme Corporation - Q1 2024',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'At-risk alert',
                  subject: 'TechStart Inc - Low engagement',
                  time: '5 hours ago',
                  type: 'error'
                },
                {
                  action: 'Expansion opportunity',
                  subject: 'Global Solutions - 25% upsell',
                  time: '1 day ago',
                  type: 'success'
                },
                {
                  action: 'Customer churned',
                  subject: 'Enterprise Corp - Contract ended',
                  time: '30 days ago',
                  type: 'warning'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
