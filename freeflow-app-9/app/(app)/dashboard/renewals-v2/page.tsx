'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type RenewalStatus = 'upcoming' | 'in-negotiation' | 'renewed' | 'churned' | 'at-risk'
type RenewalType = 'expansion' | 'flat' | 'contraction' | 'downgrade'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ViewMode = 'all' | 'upcoming' | 'in-negotiation' | 'at-risk'

export default function RenewalsV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample renewals data
  const renewals = [
    {
      id: 'REN-2847',
      customer: 'Acme Corporation',
      status: 'upcoming' as const,
      renewalType: 'expansion' as const,
      priority: 'critical' as const,
      currentARR: 300000,
      proposedARR: 375000,
      expansionValue: 75000,
      renewalDate: '2025-01-15',
      daysToRenewal: 367,
      probability: 95,
      healthScore: 92,
      contractTerm: 24,
      csm: 'Emily Rodriguez',
      lastContact: '2024-02-10',
      meetingsScheduled: 2,
      proposalSent: true
    },
    {
      id: 'REN-2846',
      customer: 'TechStart Inc',
      status: 'at-risk' as const,
      renewalType: 'contraction' as const,
      priority: 'critical' as const,
      currentARR: 60000,
      proposedARR: 36000,
      expansionValue: -24000,
      renewalDate: '2024-06-01',
      daysToRenewal: 108,
      probability: 35,
      healthScore: 42,
      contractTerm: 12,
      csm: 'Michael Chen',
      lastContact: '2024-01-28',
      meetingsScheduled: 1,
      proposalSent: false
    },
    {
      id: 'REN-2845',
      customer: 'Global Solutions Ltd',
      status: 'in-negotiation' as const,
      renewalType: 'expansion' as const,
      priority: 'high' as const,
      currentARR: 216000,
      proposedARR: 270000,
      expansionValue: 54000,
      renewalDate: '2025-03-01',
      daysToRenewal: 412,
      probability: 88,
      healthScore: 88,
      contractTerm: 36,
      csm: 'Sarah Johnson',
      lastContact: '2024-02-12',
      meetingsScheduled: 3,
      proposalSent: true
    },
    {
      id: 'REN-2844',
      customer: 'StartupXYZ',
      status: 'upcoming' as const,
      renewalType: 'flat' as const,
      priority: 'medium' as const,
      currentARR: 18000,
      proposedARR: 18000,
      expansionValue: 0,
      renewalDate: '2025-02-01',
      daysToRenewal: 352,
      probability: 75,
      healthScore: 65,
      contractTerm: 12,
      csm: 'David Kim',
      lastContact: '2024-02-13',
      meetingsScheduled: 1,
      proposalSent: false
    },
    {
      id: 'REN-2843',
      customer: 'Enterprise Corp',
      status: 'churned' as const,
      renewalType: 'downgrade' as const,
      priority: 'low' as const,
      currentARR: 84000,
      proposedARR: 0,
      expansionValue: -84000,
      renewalDate: '2024-01-15',
      daysToRenewal: -30,
      probability: 0,
      healthScore: 18,
      contractTerm: 0,
      csm: 'Jessica Williams',
      lastContact: '2023-12-20',
      meetingsScheduled: 0,
      proposalSent: false
    },
    {
      id: 'REN-2842',
      customer: 'MidMarket Corp',
      status: 'renewed' as const,
      renewalType: 'flat' as const,
      priority: 'medium' as const,
      currentARR: 72000,
      proposedARR: 72000,
      expansionValue: 0,
      renewalDate: '2024-02-01',
      daysToRenewal: -13,
      probability: 100,
      healthScore: 74,
      contractTerm: 24,
      csm: 'Lisa Anderson',
      lastContact: '2024-02-14',
      meetingsScheduled: 2,
      proposalSent: true
    }
  ]

  const getStatusColor = (status: RenewalStatus) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'in-negotiation': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'renewed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'churned': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'at-risk': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  }

  const getTypeColor = (type: RenewalType) => {
    switch (type) {
      case 'expansion': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'flat': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'contraction': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'downgrade': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const filteredRenewals = viewMode === 'all'
    ? renewals
    : renewals.filter(renewal => renewal.status === viewMode)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Contract Renewals
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage customer renewals and expansion opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300">
              Schedule Renewal Call
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Upcoming Renewals',
              value: '47',
              change: '+8',
              trend: 'up' as const,
              subtitle: 'next 90 days'
            },
            {
              label: 'Renewal ARR',
              value: '$2.4M',
              change: '+420K',
              trend: 'up' as const,
              subtitle: 'at-risk value'
            },
            {
              label: 'Expansion Pipeline',
              value: '$520K',
              change: '+125K',
              trend: 'up' as const,
              subtitle: 'potential upsell'
            },
            {
              label: 'Renewal Rate',
              value: '92%',
              change: '+4%',
              trend: 'up' as const,
              subtitle: 'success rate'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Renewal Queue', icon: '📋', onClick: () => {} },
            { label: 'Schedule QBR', icon: '📅', onClick: () => {} },
            { label: 'Send Proposal', icon: '📧', onClick: () => {} },
            { label: 'Expansion Opps', icon: '📈', onClick: () => {} },
            { label: 'Risk Analysis', icon: '⚠️', onClick: () => {} },
            { label: 'Forecast', icon: '🎯', onClick: () => {} },
            { label: 'Reports', icon: '📊', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Renewals"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Upcoming"
            isActive={viewMode === 'upcoming'}
            onClick={() => setViewMode('upcoming')}
          />
          <PillButton
            label="In Negotiation"
            isActive={viewMode === 'in-negotiation'}
            onClick={() => setViewMode('in-negotiation')}
          />
          <PillButton
            label="At Risk"
            isActive={viewMode === 'at-risk'}
            onClick={() => setViewMode('at-risk')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Renewals List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Renewals ({filteredRenewals.length})
              </h2>
              <div className="space-y-3">
                {filteredRenewals.map((renewal) => (
                  <div
                    key={renewal.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {renewal.customer}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(renewal.status)}`}>
                            {renewal.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(renewal.renewalType)}`}>
                            {renewal.renewalType}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(renewal.priority)}`}>
                            {renewal.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-violet-500">👤</span>
                            CSM: {renewal.csm}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-violet-500">📅</span>
                            Due: {renewal.renewalDate}
                          </span>
                          {renewal.daysToRenewal > 0 ? (
                            <span className={`flex items-center gap-1 ${renewal.daysToRenewal <= 90 ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                              <span className="text-violet-500">⏰</span>
                              {renewal.daysToRenewal} days
                            </span>
                          ) : renewal.daysToRenewal < 0 ? (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <span>✓</span>
                              Processed
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                          {renewal.probability}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Probability
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Current ARR</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(renewal.currentARR)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Proposed ARR</div>
                        <div className="text-sm font-bold text-violet-600 dark:text-violet-400">
                          {formatCurrency(renewal.proposedARR)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Change</div>
                        <div className={`text-sm font-bold ${
                          renewal.expansionValue > 0 ? 'text-green-600 dark:text-green-400' :
                          renewal.expansionValue < 0 ? 'text-red-600 dark:text-red-400' :
                          'text-slate-900 dark:text-white'
                        }`}>
                          {renewal.expansionValue > 0 ? '+' : ''}{formatCurrency(renewal.expansionValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Health Score</div>
                        <div className={`text-sm font-bold ${
                          renewal.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                          renewal.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {renewal.healthScore}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                        <span>Win Probability: {renewal.probability}%</span>
                        <span>Term: {renewal.contractTerm} months</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            renewal.probability >= 80
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                              : renewal.probability >= 50
                              ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                              : 'bg-gradient-to-r from-red-600 to-orange-600'
                          }`}
                          style={{ width: `${renewal.probability}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600 dark:text-slate-400">
                            Last Contact: {renewal.lastContact}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                            {renewal.meetingsScheduled} meetings
                          </span>
                          {renewal.proposalSent && (
                            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Proposal Sent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Renewal Types */}
            <ProgressCard
              title="Renewal Types"
              items={[
                { label: 'Expansion', value: 142, total: 284, color: 'green' },
                { label: 'Flat Renewal', value: 98, total: 284, color: 'blue' },
                { label: 'Contraction', value: 28, total: 284, color: 'orange' },
                { label: 'Churned', value: 16, total: 284, color: 'red' }
              ]}
            />

            {/* Top Renewal Opportunities */}
            <RankingList
              title="Top Expansion Opportunities"
              items={[
                { label: 'Acme Corp', value: '+$75K ARR', rank: 1, trend: 'up' },
                { label: 'Global Solutions', value: '+$54K ARR', rank: 2, trend: 'up' },
                { label: 'Enterprise Plus', value: '+$42K ARR', rank: 3, trend: 'same' },
                { label: 'MegaCorp', value: '+$38K ARR', rank: 4, trend: 'up' },
                { label: 'TechGiant', value: '+$32K ARR', rank: 5, trend: 'down' }
              ]}
            />

            {/* Renewal Timeline */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Renewal Timeline</h3>
              <div className="space-y-3">
                {[
                  { period: 'Next 30 Days', count: 12, arr: 420000 },
                  { period: 'Next 60 Days', count: 24, arr: 840000 },
                  { period: 'Next 90 Days', count: 47, arr: 2400000 },
                  { period: 'This Quarter', count: 68, arr: 3600000 }
                ].map((item) => (
                  <div key={item.period} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.period}</span>
                      <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">{item.count} renewals</span>
                    </div>
                    <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                      {formatCurrency(item.arr)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Deal Size"
                value="$84K"
                trend="up"
                change="+$12K"
              />
              <MiniKPI
                label="Win Rate"
                value="92%"
                trend="up"
                change="+4%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Renewal won',
                  subject: 'MidMarket Corp - $72K ARR',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'At-risk renewal',
                  subject: 'TechStart Inc - Low probability',
                  time: '5 hours ago',
                  type: 'error'
                },
                {
                  action: 'Proposal sent',
                  subject: 'Global Solutions - $270K ARR',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Customer churned',
                  subject: 'Enterprise Corp - $84K lost',
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
