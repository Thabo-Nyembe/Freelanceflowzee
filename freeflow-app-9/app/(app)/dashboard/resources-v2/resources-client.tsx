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
  useResources,
  useResourceMutations,
  getResourceStatusColor,
  getResourceTypeColor,
  getSkillLevelColor,
  getUtilizationColor,
  type Resource
} from '@/lib/hooks/use-resources'

type ViewMode = 'all' | 'available' | 'assigned' | 'overallocated'

interface ResourcesClientProps {
  initialResources: Resource[]
}

export default function ResourcesClient({ initialResources }: ResourcesClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const { resources, stats, isLoading } = useResources(initialResources, {
    status: viewMode === 'all' ? undefined : viewMode
  })

  const { createResource, isCreating } = useResourceMutations()

  const filteredResources = viewMode === 'all'
    ? resources
    : resources.filter(r => r.status === viewMode)

  const handleCreateResource = () => {
    createResource({
      name: 'New Resource',
      type: 'developer',
      skill_level: 'mid-level',
      department: 'Engineering',
      capacity: 40
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Resource Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage team resources and allocations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateResource}
              disabled={isCreating}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Add Resource'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Resources',
              value: stats.total.toString(),
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all teams'
            },
            {
              label: 'Avg Utilization',
              value: `${stats.avgUtilization.toFixed(0)}%`,
              change: '+3%',
              trend: 'up' as const,
              subtitle: 'capacity usage'
            },
            {
              label: 'Available Now',
              value: stats.available.toString(),
              change: '+6',
              trend: 'up' as const,
              subtitle: 'ready to assign'
            },
            {
              label: 'Overallocated',
              value: stats.overallocated.toString(),
              change: '-3',
              trend: stats.overallocated > 0 ? 'down' as const : 'same' as const,
              subtitle: 'require rebalancing'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Add Resource', icon: '➕', onClick: handleCreateResource },
            { label: 'Availability', icon: '📅', onClick: () => {} },
            { label: 'Skills Matrix', icon: '🎯', onClick: () => {} },
            { label: 'Utilization', icon: '📊', onClick: () => {} },
            { label: 'Assign Tasks', icon: '📋', onClick: () => {} },
            { label: 'Time Tracking', icon: '⏰', onClick: () => {} },
            { label: 'Reports', icon: '📈', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Resources"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Available"
            isActive={viewMode === 'available'}
            onClick={() => setViewMode('available')}
          />
          <PillButton
            label="Assigned"
            isActive={viewMode === 'assigned'}
            onClick={() => setViewMode('assigned')}
          />
          <PillButton
            label="Overallocated"
            isActive={viewMode === 'overallocated'}
            onClick={() => setViewMode('overallocated')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Resources List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Resources ({filteredResources.length})
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No resources found. Click "Add Resource" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {resource.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getResourceStatusColor(resource.status)}`}>
                              {resource.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getResourceTypeColor(resource.type)}`}>
                              {resource.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getSkillLevelColor(resource.skill_level)}`}>
                              {resource.skill_level}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="text-sky-500">🏢</span>
                              {resource.department || 'No department'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-sky-500">📍</span>
                              {resource.location || 'Remote'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-sky-500">💰</span>
                              ${resource.hourly_rate}/hr
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-sky-500">📅</span>
                              Available: {resource.availability_date || 'Now'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getUtilizationColor(Number(resource.utilization))}`}>
                            {Number(resource.utilization).toFixed(0)}%
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Utilization
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Capacity</div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">{resource.capacity}h</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Allocated</div>
                          <div className="text-lg font-bold text-sky-600 dark:text-sky-400">{resource.allocated}h</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Available</div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">{Math.max(0, resource.capacity - resource.allocated)}h</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>Utilization: {Number(resource.utilization).toFixed(0)}%</span>
                          <span>{resource.allocated}/{resource.capacity} hours</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              Number(resource.utilization) > 100
                                ? 'bg-gradient-to-r from-red-600 to-orange-600'
                                : Number(resource.utilization) >= 90
                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                                : 'bg-gradient-to-r from-sky-600 to-blue-600'
                            }`}
                            style={{ width: `${Math.min(Number(resource.utilization), 100)}%` }}
                          />
                        </div>
                      </div>

                      {(resource.projects?.length > 0 || resource.skills?.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-wrap gap-1">
                              {resource.projects?.map((project) => (
                                <span key={project} className="px-2 py-1 rounded-full text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                                  {project}
                                </span>
                              ))}
                              {(!resource.projects || resource.projects.length === 0) && (
                                <span className="text-xs text-slate-400">No projects</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {resource.skills?.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                  {skill}
                                </span>
                              ))}
                            </div>
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

            {/* Resource Distribution */}
            <ProgressCard
              title="Resource Distribution"
              items={[
                { label: 'Developers', value: resources.filter(r => r.type === 'developer').length, total: stats.total, color: 'purple' },
                { label: 'Designers', value: resources.filter(r => r.type === 'designer').length, total: stats.total, color: 'pink' },
                { label: 'Managers', value: resources.filter(r => r.type === 'manager').length, total: stats.total, color: 'blue' },
                { label: 'QA Engineers', value: resources.filter(r => r.type === 'qa').length, total: stats.total, color: 'green' },
                { label: 'DevOps', value: resources.filter(r => r.type === 'devops').length, total: stats.total, color: 'orange' }
              ]}
            />

            {/* Top Utilized Resources */}
            <RankingList
              title="Top Utilized Resources"
              items={resources
                .sort((a, b) => Number(b.utilization) - Number(a.utilization))
                .slice(0, 5)
                .map((r, i) => ({
                  label: r.name,
                  value: `${Number(r.utilization).toFixed(0)}% util`,
                  rank: i + 1,
                  trend: Number(r.utilization) > 100 ? 'up' : 'same'
                }))}
            />

            {/* Skill Level Distribution */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Skill Levels</h3>
              <div className="space-y-3">
                {[
                  { level: 'Principal', count: resources.filter(r => r.skill_level === 'principal').length, color: 'from-red-600 to-orange-600' },
                  { level: 'Lead', count: resources.filter(r => r.skill_level === 'lead').length, color: 'from-orange-600 to-yellow-600' },
                  { level: 'Senior', count: resources.filter(r => r.skill_level === 'senior').length, color: 'from-purple-600 to-pink-600' },
                  { level: 'Mid-Level', count: resources.filter(r => r.skill_level === 'mid-level').length, color: 'from-cyan-600 to-blue-600' },
                  { level: 'Junior', count: resources.filter(r => r.skill_level === 'junior').length, color: 'from-blue-600 to-indigo-600' }
                ].map((item) => (
                  <div key={item.level}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-900 dark:text-white">{item.level}</span>
                      <span className="text-slate-600 dark:text-slate-400">{item.count} resources</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Hourly Rate"
                value={`$${resources.length > 0 ? (resources.reduce((s, r) => s + r.hourly_rate, 0) / resources.length).toFixed(0) : 0}`}
                trend="up"
                change="+$5"
              />
              <MiniKPI
                label="Total Capacity"
                value={`${stats.totalCapacity}h`}
                trend="up"
                change="+420h"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Resource assigned',
                  subject: 'Sarah Johnson - Product V2.0',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Overallocation detected',
                  subject: 'Michael Chen - 120% capacity',
                  time: '5 hours ago',
                  type: 'error'
                },
                {
                  action: 'Resource available',
                  subject: 'David Kim - 50% capacity',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Skills updated',
                  subject: 'Jessica Williams - Added Cypress',
                  time: '2 days ago',
                  type: 'info'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
