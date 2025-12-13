'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TemplateStatus = 'active' | 'draft' | 'archived' | 'deprecated'
type TemplateCategory = 'email' | 'document' | 'contract' | 'presentation' | 'form' | 'report'
type AccessLevel = 'public' | 'team' | 'private' | 'enterprise'
type ViewMode = 'all' | 'active' | 'draft' | 'archived'

export default function TemplatesV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample templates data
  const templates = [
    {
      id: 'TPL-2847',
      name: 'Sales Proposal Template',
      category: 'document' as const,
      status: 'active' as const,
      accessLevel: 'team' as const,
      creator: 'Emily Rodriguez',
      department: 'Sales',
      version: '2.3',
      created: '2024-01-15',
      lastUsed: '2024-02-14',
      usageCount: 284,
      rating: 4.8,
      reviews: 47,
      downloads: 142,
      tags: ['sales', 'proposal', 'client'],
      description: 'Professional sales proposal template with customizable sections'
    },
    {
      id: 'TPL-2846',
      name: 'Weekly Status Update Email',
      category: 'email' as const,
      status: 'active' as const,
      accessLevel: 'public' as const,
      creator: 'Michael Chen',
      department: 'Product',
      version: '1.5',
      created: '2024-01-20',
      lastUsed: '2024-02-15',
      usageCount: 847,
      rating: 4.9,
      reviews: 124,
      downloads: 284,
      tags: ['email', 'status', 'weekly'],
      description: 'Standard weekly status update email for team communication'
    },
    {
      id: 'TPL-2845',
      name: 'Employment Contract',
      category: 'contract' as const,
      status: 'active' as const,
      accessLevel: 'private' as const,
      creator: 'Sarah Johnson',
      department: 'HR',
      version: '3.1',
      created: '2023-12-01',
      lastUsed: '2024-02-13',
      usageCount: 147,
      rating: 4.7,
      reviews: 28,
      downloads: 68,
      tags: ['contract', 'employment', 'legal'],
      description: 'Standard employment contract template with legal compliance'
    },
    {
      id: 'TPL-2844',
      name: 'Product Roadmap Presentation',
      category: 'presentation' as const,
      status: 'active' as const,
      accessLevel: 'team' as const,
      creator: 'David Kim',
      department: 'Product',
      version: '1.8',
      created: '2024-02-01',
      lastUsed: '2024-02-12',
      usageCount: 92,
      rating: 4.6,
      reviews: 18,
      downloads: 42,
      tags: ['presentation', 'roadmap', 'product'],
      description: 'Quarterly product roadmap presentation template'
    },
    {
      id: 'TPL-2843',
      name: 'Customer Feedback Form',
      category: 'form' as const,
      status: 'draft' as const,
      accessLevel: 'team' as const,
      creator: 'Jessica Williams',
      department: 'Marketing',
      version: '0.9',
      created: '2024-02-10',
      lastUsed: '2024-02-11',
      usageCount: 12,
      rating: 4.2,
      reviews: 3,
      downloads: 8,
      tags: ['form', 'feedback', 'customer'],
      description: 'Customer satisfaction and feedback collection form'
    },
    {
      id: 'TPL-2842',
      name: 'Monthly Performance Report',
      category: 'report' as const,
      status: 'archived' as const,
      accessLevel: 'team' as const,
      creator: 'Lisa Anderson',
      department: 'Management',
      version: '2.0',
      created: '2023-11-15',
      lastUsed: '2024-01-30',
      usageCount: 524,
      rating: 4.5,
      reviews: 84,
      downloads: 247,
      tags: ['report', 'performance', 'monthly'],
      description: 'Comprehensive monthly performance reporting template'
    }
  ]

  const recentUsage = [
    {
      id: 'USE-8471',
      template: 'Weekly Status Update Email',
      user: 'Emily Rodriguez',
      department: 'Product',
      timestamp: '10 minutes ago'
    },
    {
      id: 'USE-8470',
      template: 'Sales Proposal Template',
      user: 'Michael Chen',
      department: 'Sales',
      timestamp: '2 hours ago'
    },
    {
      id: 'USE-8469',
      template: 'Employment Contract',
      user: 'Sarah Johnson',
      department: 'HR',
      timestamp: '5 hours ago'
    },
    {
      id: 'USE-8468',
      template: 'Product Roadmap Presentation',
      user: 'David Kim',
      department: 'Product',
      timestamp: '1 day ago'
    }
  ]

  const getStatusColor = (status: TemplateStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'archived': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'deprecated': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const getCategoryColor = (category: TemplateCategory) => {
    switch (category) {
      case 'email': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'document': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'contract': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'presentation': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'form': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'report': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
    }
  }

  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case 'public': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'team': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'private': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }
  }

  const filteredTemplates = viewMode === 'all'
    ? templates
    : templates.filter(template => template.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Templates Library
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Reusable templates for documents, emails, and more
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300">
              Create Template
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Templates',
              value: '284',
              change: '+24',
              trend: 'up' as const,
              subtitle: 'across all categories'
            },
            {
              label: 'Active Templates',
              value: '247',
              change: '+18',
              trend: 'up' as const,
              subtitle: 'ready to use'
            },
            {
              label: 'Total Usage',
              value: '2,847',
              change: '+412',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Avg Rating',
              value: '4.7/5',
              change: '+0.2',
              trend: 'up' as const,
              subtitle: 'user satisfaction'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Create Template', icon: '➕', onClick: () => {} },
            { label: 'Browse All', icon: '📚', onClick: () => {} },
            { label: 'My Templates', icon: '📁', onClick: () => {} },
            { label: 'Popular', icon: '🔥', onClick: () => {} },
            { label: 'Recent', icon: '⏰', onClick: () => {} },
            { label: 'Search', icon: '🔍', onClick: () => {} },
            { label: 'Analytics', icon: '📊', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Templates"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Draft"
            isActive={viewMode === 'draft'}
            onClick={() => setViewMode('draft')}
          />
          <PillButton
            label="Archived"
            isActive={viewMode === 'archived'}
            onClick={() => setViewMode('archived')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Templates List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Templates ({filteredTemplates.length})
              </h2>
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {template.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(template.status)}`}>
                            {template.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getAccessLevelColor(template.accessLevel)}`}>
                            {template.accessLevel}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-violet-500">👤</span>
                            {template.creator}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-violet-500">🏢</span>
                            {template.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-violet-500">📊</span>
                            v{template.version}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 mb-1">
                          <span>⭐</span>
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {template.rating}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {template.reviews} reviews
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{template.usageCount}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Uses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{template.downloads}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Created</div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">{template.created}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Used</div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">{template.lastUsed}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Recent Usage */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Usage</h3>
              <div className="space-y-3">
                {recentUsage.map((usage) => (
                  <div
                    key={usage.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm mb-1">
                      {usage.template}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{usage.user}</span> • {usage.department}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {usage.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates by Category */}
            <ProgressCard
              title="Templates by Category"
              items={[
                { label: 'Emails', value: 84, total: 284, color: 'blue' },
                { label: 'Documents', value: 72, total: 284, color: 'purple' },
                { label: 'Presentations', value: 47, total: 284, color: 'green' },
                { label: 'Forms', value: 42, total: 284, color: 'orange' },
                { label: 'Contracts', value: 39, total: 284, color: 'red' }
              ]}
            />

            {/* Most Popular Templates */}
            <RankingList
              title="Most Popular Templates"
              items={[
                { label: 'Weekly Status Email', value: '847 uses', rank: 1, trend: 'up' },
                { label: 'Monthly Report', value: '524 uses', rank: 2, trend: 'same' },
                { label: 'Sales Proposal', value: '284 uses', rank: 3, trend: 'up' },
                { label: 'Employment Contract', value: '147 uses', rank: 4, trend: 'down' },
                { label: 'Roadmap Presentation', value: '92 uses', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Usage This Week"
                value="412"
                trend="up"
                change="+84"
              />
              <MiniKPI
                label="New Templates"
                value="24"
                trend="up"
                change="+6"
              />
            </div>

            {/* Activity Feed */}
            <ActivityFeed
              activities={[
                {
                  action: 'Template created',
                  subject: 'Customer Feedback Form',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Template used',
                  subject: 'Sales Proposal - 142 times',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Template updated',
                  subject: 'Employment Contract v3.1',
                  time: '3 days ago',
                  type: 'info'
                },
                {
                  action: 'Template archived',
                  subject: 'Monthly Performance Report',
                  time: '1 week ago',
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
