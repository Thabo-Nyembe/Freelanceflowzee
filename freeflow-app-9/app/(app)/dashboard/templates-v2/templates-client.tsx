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
  useTemplates,
  useTemplateMutations,
  getTemplateStatusColor,
  getCategoryColor,
  getAccessLevelColor,
  type Template
} from '@/lib/hooks/use-templates'

type ViewMode = 'all' | 'active' | 'draft' | 'archived'

interface TemplatesClientProps {
  initialTemplates: Template[]
}

export default function TemplatesClient({ initialTemplates }: TemplatesClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { templates, stats, isLoading } = useTemplates(initialTemplates, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating
  } = useTemplateMutations()

  const filteredTemplates = viewMode === 'all'
    ? templates
    : templates.filter(template => template.status === viewMode)

  const handleCreateTemplate = () => {
    createTemplate({
      name: 'New Template',
      description: 'A new template',
      category: 'document',
      access_level: 'private',
      status: 'draft'
    })
  }

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
            <button
              onClick={handleCreateTemplate}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Templates',
              value: stats.total.toString(),
              change: '+24',
              trend: 'up' as const,
              subtitle: 'across all categories'
            },
            {
              label: 'Active Templates',
              value: stats.active.toString(),
              change: '+18',
              trend: 'up' as const,
              subtitle: 'ready to use'
            },
            {
              label: 'Total Usage',
              value: stats.totalUsage.toLocaleString(),
              change: '+412',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Avg Rating',
              value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5` : 'N/A',
              change: '+0.2',
              trend: 'up' as const,
              subtitle: 'user satisfaction'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Create Template', icon: '➕', onClick: handleCreateTemplate },
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No templates found. Click "Create Template" to get started.
                </div>
              ) : (
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
                            <span className={`px-2 py-1 rounded-full text-xs border ${getTemplateStatusColor(template.status)}`}>
                              {template.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getAccessLevelColor(template.access_level)}`}>
                              {template.access_level}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {template.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-violet-500">👤</span>
                              {template.creator_name || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-violet-500">🏢</span>
                              {template.department || 'General'}
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
                              {Number(template.rating).toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            {template.reviews_count} reviews
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{template.usage_count}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Uses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{template.downloads}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Downloads</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Created</div>
                          <div className="text-xs font-medium text-slate-900 dark:text-white">
                            {new Date(template.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Used</div>
                          <div className="text-xs font-medium text-slate-900 dark:text-white">
                            {template.last_used ? new Date(template.last_used).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>

                      {template.tags && template.tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 flex-wrap">
                            {template.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Recent Usage */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Usage</h3>
              <div className="space-y-3">
                {templates.slice(0, 4).map((template) => (
                  <div
                    key={`usage-${template.id}`}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-sm mb-1">
                      {template.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{template.creator_name || 'Unknown'}</span> • {template.department || 'General'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {template.last_used ? new Date(template.last_used).toLocaleDateString() : 'Never used'}
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                    No recent usage
                  </div>
                )}
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
              items={templates.slice(0, 5).map((t, i) => ({
                label: t.name,
                value: `${t.usage_count} uses`,
                rank: i + 1,
                trend: i % 2 === 0 ? 'up' : 'same'
              }))}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Usage This Week"
                value={stats.totalUsage.toString()}
                trend="up"
                change="+84"
              />
              <MiniKPI
                label="New Templates"
                value={stats.draft.toString()}
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
