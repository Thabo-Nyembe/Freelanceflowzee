'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  useRenewals,
  useRenewalMutations,
  getRenewalStatusColor,
  getRenewalTypeColor,
  getRenewalPriorityColor,
  formatCurrency,
  type Renewal
} from '@/lib/hooks/use-renewals'

type ViewMode = 'all' | 'upcoming' | 'in-negotiation' | 'at-risk'

interface RenewalsClientProps {
  initialRenewals: Renewal[]
}

export default function RenewalsClient({ initialRenewals }: RenewalsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { renewals, stats, isLoading } = useRenewals(initialRenewals, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { createRenewal, isCreating } = useRenewalMutations()

  const filteredRenewals = viewMode === 'all'
    ? renewals
    : renewals.filter(renewal => renewal.status === viewMode)

  const handleCreateRenewal = () => {
    const renewalDate = new Date()
    renewalDate.setMonth(renewalDate.getMonth() + 3)

    createRenewal({
      customer_name: 'New Customer',
      current_arr: 50000,
      proposed_arr: 50000,
      renewal_date: renewalDate.toISOString().split('T')[0],
      priority: 'medium'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:bg-none dark:bg-gray-900">
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
            <button
              onClick={handleCreateRenewal}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Schedule Renewal'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Upcoming Renewals',
              value: stats.upcoming.toString(),
              change: '+8',
              trend: 'up' as const,
              subtitle: 'next 90 days'
            },
            {
              label: 'Renewal ARR',
              value: formatCurrency(stats.totalCurrentARR),
              change: '+420K',
              trend: 'up' as const,
              subtitle: 'at-risk value'
            },
            {
              label: 'Expansion Pipeline',
              value: formatCurrency(stats.totalExpansion),
              change: '+125K',
              trend: 'up' as const,
              subtitle: 'potential upsell'
            },
            {
              label: 'Avg Probability',
              value: `${stats.avgProbability.toFixed(0)}%`,
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : filteredRenewals.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No renewals found. Click "Schedule Renewal" to get started.
                </div>
              ) : (
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
                              {renewal.customer_name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getRenewalStatusColor(renewal.status)}`}>
                              {renewal.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getRenewalTypeColor(renewal.renewal_type)}`}>
                              {renewal.renewal_type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getRenewalPriorityColor(renewal.priority)}`}>
                              {renewal.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-violet-500">👤</span>
                              CSM: {renewal.csm_name || 'Unassigned'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-violet-500">📅</span>
                              Due: {renewal.renewal_date || 'TBD'}
                            </span>
                            {renewal.days_to_renewal > 0 ? (
                              <span className={`flex items-center gap-1 ${renewal.days_to_renewal <= 90 ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
                                <span className="text-violet-500">⏰</span>
                                {renewal.days_to_renewal} days
                              </span>
                            ) : renewal.days_to_renewal < 0 ? (
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
                            {formatCurrency(Number(renewal.current_arr), renewal.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Proposed ARR</div>
                          <div className="text-sm font-bold text-violet-600 dark:text-violet-400">
                            {formatCurrency(Number(renewal.proposed_arr), renewal.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Change</div>
                          <div className={`text-sm font-bold ${
                            Number(renewal.expansion_value) > 0 ? 'text-green-600 dark:text-green-400' :
                            Number(renewal.expansion_value) < 0 ? 'text-red-600 dark:text-red-400' :
                            'text-slate-900 dark:text-white'
                          }`}>
                            {Number(renewal.expansion_value) > 0 ? '+' : ''}{formatCurrency(Number(renewal.expansion_value), renewal.currency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Health Score</div>
                          <div className={`text-sm font-bold ${
                            renewal.health_score >= 80 ? 'text-green-600 dark:text-green-400' :
                            renewal.health_score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {renewal.health_score}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>Win Probability: {renewal.probability}%</span>
                          <span>Term: {renewal.contract_term} months</span>
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
                              Last Contact: {renewal.last_contact_date || 'N/A'}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                              {renewal.meetings_scheduled} meetings
                            </span>
                            {renewal.proposal_sent && (
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
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Renewal Types */}
            <ProgressCard
              title="Renewal Types"
              items={[
                { label: 'Expansion', value: renewals.filter(r => r.renewal_type === 'expansion').length, total: stats.total, color: 'green' },
                { label: 'Flat Renewal', value: renewals.filter(r => r.renewal_type === 'flat').length, total: stats.total, color: 'blue' },
                { label: 'Contraction', value: renewals.filter(r => r.renewal_type === 'contraction').length, total: stats.total, color: 'orange' },
                { label: 'Churned', value: stats.churned, total: stats.total, color: 'red' }
              ]}
            />

            {/* Top Expansion Opportunities */}
            <RankingList
              title="Top Expansion Opportunities"
              items={renewals
                .filter(r => Number(r.expansion_value) > 0)
                .sort((a, b) => Number(b.expansion_value) - Number(a.expansion_value))
                .slice(0, 5)
                .map((r, i) => ({
                  label: r.customer_name,
                  value: `+${formatCurrency(Number(r.expansion_value))}`,
                  rank: i + 1,
                  trend: 'up'
                }))}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Deal Size"
                value={formatCurrency(stats.total > 0 ? stats.totalCurrentARR / stats.total : 0)}
                trend="up"
                change="+$12K"
              />
              <MiniKPI
                label="Avg Probability"
                value={`${stats.avgProbability.toFixed(0)}%`}
                trend="up"
                change="+4%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Renewal won',
                  subject: 'Customer - $72K ARR',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'At-risk renewal',
                  subject: 'Customer - Low probability',
                  time: '5 hours ago',
                  type: 'error'
                },
                {
                  action: 'Proposal sent',
                  subject: 'Customer - $270K ARR',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Customer churned',
                  subject: 'Customer - $84K lost',
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
