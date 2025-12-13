'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ContractStatus = 'draft' | 'pending-review' | 'active' | 'expired' | 'terminated'
type ContractType = 'employment' | 'client' | 'vendor' | 'partnership' | 'nda' | 'license'
type RenewalStatus = 'auto-renew' | 'manual-renew' | 'expired' | 'terminated'
type ViewMode = 'all' | 'active' | 'pending-review' | 'expired'

export default function ContractsV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample contracts data
  const contracts = [
    {
      id: 'CTR-2847',
      title: 'Master Service Agreement - Acme Corp',
      type: 'client' as const,
      status: 'active' as const,
      renewalStatus: 'auto-renew' as const,
      value: 250000,
      currency: 'USD',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      daysRemaining: 314,
      party: 'Acme Corporation',
      owner: 'Emily Rodriguez',
      department: 'Sales',
      signedBy: 'John Smith',
      lastReviewed: '2024-01-15',
      attachments: 4,
      clauses: 24
    },
    {
      id: 'CTR-2846',
      title: 'Software License Agreement - TechVendor',
      type: 'vendor' as const,
      status: 'active' as const,
      renewalStatus: 'manual-renew' as const,
      value: 48000,
      currency: 'USD',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      daysRemaining: 107,
      party: 'TechVendor Inc',
      owner: 'Michael Chen',
      department: 'IT',
      signedBy: 'Sarah Johnson',
      lastReviewed: '2024-02-01',
      attachments: 2,
      clauses: 18
    },
    {
      id: 'CTR-2845',
      title: 'Employment Agreement - Senior Developer',
      type: 'employment' as const,
      status: 'active' as const,
      renewalStatus: 'auto-renew' as const,
      value: 140000,
      currency: 'USD',
      startDate: '2024-02-01',
      endDate: '2025-02-01',
      daysRemaining: 351,
      party: 'Sarah Johnson',
      owner: 'David Kim',
      department: 'HR',
      signedBy: 'Emily Rodriguez',
      lastReviewed: '2024-02-05',
      attachments: 3,
      clauses: 15
    },
    {
      id: 'CTR-2844',
      title: 'Partnership Agreement - Marketing Agency',
      type: 'partnership' as const,
      status: 'pending-review' as const,
      renewalStatus: 'manual-renew' as const,
      value: 180000,
      currency: 'USD',
      startDate: '2024-03-01',
      endDate: '2025-03-01',
      daysRemaining: 379,
      party: 'Creative Marketing Partners',
      owner: 'Jessica Williams',
      department: 'Marketing',
      signedBy: '',
      lastReviewed: '2024-02-10',
      attachments: 5,
      clauses: 28
    },
    {
      id: 'CTR-2843',
      title: 'Non-Disclosure Agreement - Startup Co',
      type: 'nda' as const,
      status: 'active' as const,
      renewalStatus: 'terminated' as const,
      value: 0,
      currency: 'USD',
      startDate: '2023-08-15',
      endDate: '2024-08-15',
      daysRemaining: 183,
      party: 'Startup Co LLC',
      owner: 'Lisa Anderson',
      department: 'Legal',
      signedBy: 'Robert Brown',
      lastReviewed: '2024-01-20',
      attachments: 1,
      clauses: 8
    },
    {
      id: 'CTR-2842',
      title: 'Cloud Services Agreement - CloudHost',
      type: 'vendor' as const,
      status: 'expired' as const,
      renewalStatus: 'expired' as const,
      value: 36000,
      currency: 'USD',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      daysRemaining: 0,
      party: 'CloudHost Services',
      owner: 'Michael Chen',
      department: 'IT',
      signedBy: 'David Kim',
      lastReviewed: '2023-12-15',
      attachments: 3,
      clauses: 22
    }
  ]

  const upcomingRenewals = [
    {
      id: 'REN-8471',
      contract: 'Software License - TechVendor',
      daysUntilRenewal: 107,
      value: 48000,
      renewalStatus: 'manual-renew' as const
    },
    {
      id: 'REN-8470',
      contract: 'NDA - Startup Co',
      daysUntilRenewal: 183,
      value: 0,
      renewalStatus: 'terminated' as const
    },
    {
      id: 'REN-8469',
      contract: 'MSA - Acme Corp',
      daysUntilRenewal: 314,
      value: 250000,
      renewalStatus: 'auto-renew' as const
    }
  ]

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'pending-review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'terminated': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  }

  const getTypeColor = (type: ContractType) => {
    switch (type) {
      case 'employment': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'client': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'vendor': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'partnership': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'nda': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'license': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    }
  }

  const getRenewalStatusColor = (status: RenewalStatus) => {
    switch (status) {
      case 'auto-renew': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'manual-renew': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'terminated': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const filteredContracts = viewMode === 'all'
    ? contracts
    : contracts.filter(contract => contract.status === viewMode)

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Contract Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage all business contracts and agreements
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300">
              Create Contract
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Contracts',
              value: '147',
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all departments'
            },
            {
              label: 'Total Value',
              value: '$8.4M',
              change: '+1.2M',
              trend: 'up' as const,
              subtitle: 'active contracts'
            },
            {
              label: 'Pending Review',
              value: '24',
              change: '-8',
              trend: 'up' as const,
              subtitle: 'awaiting approval'
            },
            {
              label: 'Expiring Soon',
              value: '12',
              change: '+3',
              trend: 'down' as const,
              subtitle: 'next 30 days'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'New Contract', icon: '📝', onClick: () => {} },
            { label: 'Review Queue', icon: '👁️', onClick: () => {} },
            { label: 'Renewals', icon: '🔄', onClick: () => {} },
            { label: 'Templates', icon: '📄', onClick: () => {} },
            { label: 'Search', icon: '🔍', onClick: () => {} },
            { label: 'Reports', icon: '📊', onClick: () => {} },
            { label: 'Approvals', icon: '✅', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Contracts"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Pending Review"
            isActive={viewMode === 'pending-review'}
            onClick={() => setViewMode('pending-review')}
          />
          <PillButton
            label="Expired"
            isActive={viewMode === 'expired'}
            onClick={() => setViewMode('expired')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Contracts List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Contracts ({filteredContracts.length})
              </h2>
              <div className="space-y-3">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {contract.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(contract.status)}`}>
                            {contract.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(contract.type)}`}>
                            {contract.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getRenewalStatusColor(contract.renewalStatus)}`}>
                            {contract.renewalStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">🏢</span>
                            {contract.party}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">👤</span>
                            Owner: {contract.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-amber-500">🏢</span>
                            {contract.department}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(contract.value)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Contract Value
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Start Date</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{contract.startDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">End Date</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{contract.endDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Days Remaining</div>
                        <div className={`text-sm font-bold ${contract.daysRemaining <= 30 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {contract.daysRemaining}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Clauses</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{contract.clauses}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-4">
                          <span>📎 {contract.attachments} attachments</span>
                          <span>Last reviewed: {contract.lastReviewed}</span>
                          {contract.signedBy && (
                            <span>Signed by: <span className="font-medium text-emerald-600 dark:text-emerald-400">{contract.signedBy}</span></span>
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

            {/* Upcoming Renewals */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Upcoming Renewals</h3>
              <div className="space-y-3">
                {upcomingRenewals.map((renewal) => (
                  <div
                    key={renewal.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-sm mb-2">
                      {renewal.contract}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        {renewal.daysUntilRenewal} days
                      </span>
                      <span className={`px-2 py-1 rounded-full border ${getRenewalStatusColor(renewal.renewalStatus)}`}>
                        {renewal.renewalStatus}
                      </span>
                    </div>
                    {renewal.value > 0 && (
                      <div className="mt-2 text-sm font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(renewal.value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Types */}
            <ProgressCard
              title="Contracts by Type"
              items={[
                { label: 'Client Contracts', value: 42, total: 147, color: 'green' },
                { label: 'Vendor Agreements', value: 38, total: 147, color: 'purple' },
                { label: 'Employment', value: 32, total: 147, color: 'blue' },
                { label: 'Partnerships', value: 21, total: 147, color: 'orange' },
                { label: 'NDAs', value: 14, total: 147, color: 'red' }
              ]}
            />

            {/* Top Departments */}
            <RankingList
              title="Top Departments by Value"
              items={[
                { label: 'Sales', value: '$3.2M', rank: 1, trend: 'up' },
                { label: 'IT', value: '$2.1M', rank: 2, trend: 'up' },
                { label: 'Marketing', value: '$1.8M', rank: 3, trend: 'same' },
                { label: 'HR', value: '$847K', rank: 4, trend: 'down' },
                { label: 'Legal', value: '$524K', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Contract"
                value="$57K"
                trend="up"
                change="+$8K"
              />
              <MiniKPI
                label="Renewal Rate"
                value="92%"
                trend="up"
                change="+4%"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Contract signed',
                  subject: 'MSA - Acme Corporation',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Review requested',
                  subject: 'Partnership - Marketing Agency',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Contract expired',
                  subject: 'Cloud Services - CloudHost',
                  time: '2 days ago',
                  type: 'error'
                },
                {
                  action: 'Renewal reminder',
                  subject: 'Software License - TechVendor',
                  time: '3 days ago',
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
