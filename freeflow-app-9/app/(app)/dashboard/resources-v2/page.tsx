'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type ResourceStatus = 'available' | 'assigned' | 'overallocated' | 'unavailable'
type ResourceType = 'developer' | 'designer' | 'manager' | 'qa' | 'devops' | 'other'
type SkillLevel = 'junior' | 'mid-level' | 'senior' | 'lead' | 'principal'
type ViewMode = 'all' | 'available' | 'assigned' | 'overallocated'

export default function ResourcesV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample resources data
  const resources = [
    {
      id: 'RES-2847',
      name: 'Sarah Johnson',
      type: 'developer' as const,
      skillLevel: 'senior' as const,
      status: 'assigned' as const,
      department: 'Engineering',
      location: 'San Francisco, CA',
      capacity: 40,
      allocated: 38,
      utilization: 95,
      projects: ['Product V2.0', 'Mobile App'],
      skills: ['React', 'TypeScript', 'Node.js'],
      hourlyRate: 125,
      availability: '2024-02-20'
    },
    {
      id: 'RES-2846',
      name: 'Michael Chen',
      type: 'designer' as const,
      skillLevel: 'lead' as const,
      status: 'overallocated' as const,
      department: 'Design',
      location: 'New York, NY',
      capacity: 40,
      allocated: 48,
      utilization: 120,
      projects: ['Design System', 'Mobile UI', 'Marketing'],
      skills: ['Figma', 'UI/UX', 'Prototyping'],
      hourlyRate: 110,
      availability: '2024-03-01'
    },
    {
      id: 'RES-2845',
      name: 'Emily Rodriguez',
      type: 'manager' as const,
      skillLevel: 'principal' as const,
      status: 'assigned' as const,
      department: 'Engineering',
      location: 'Austin, TX',
      capacity: 40,
      allocated: 40,
      utilization: 100,
      projects: ['Team Management', 'Architecture'],
      skills: ['Leadership', 'Architecture', 'Strategy'],
      hourlyRate: 150,
      availability: '2024-04-01'
    },
    {
      id: 'RES-2844',
      name: 'David Kim',
      type: 'devops' as const,
      skillLevel: 'senior' as const,
      status: 'available' as const,
      department: 'DevOps',
      location: 'Remote',
      capacity: 40,
      allocated: 20,
      utilization: 50,
      projects: ['Infrastructure'],
      skills: ['AWS', 'Kubernetes', 'CI/CD'],
      hourlyRate: 130,
      availability: '2024-02-15'
    },
    {
      id: 'RES-2843',
      name: 'Jessica Williams',
      type: 'qa' as const,
      skillLevel: 'mid-level' as const,
      status: 'assigned' as const,
      department: 'QA',
      location: 'Boston, MA',
      capacity: 40,
      allocated: 35,
      utilization: 87.5,
      projects: ['Product V2.0', 'Mobile App'],
      skills: ['Testing', 'Automation', 'Selenium'],
      hourlyRate: 85,
      availability: '2024-02-25'
    },
    {
      id: 'RES-2842',
      name: 'Lisa Anderson',
      type: 'developer' as const,
      skillLevel: 'junior' as const,
      status: 'unavailable' as const,
      department: 'Engineering',
      location: 'Seattle, WA',
      capacity: 40,
      allocated: 0,
      utilization: 0,
      projects: [],
      skills: ['JavaScript', 'React', 'CSS'],
      hourlyRate: 65,
      availability: '2024-03-15'
    }
  ]

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'assigned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'overallocated': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'unavailable': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'developer': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'designer': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      case 'manager': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'qa': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'devops': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'other': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'junior': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'mid-level': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'senior': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'lead': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'principal': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const filteredResources = viewMode === 'all'
    ? resources
    : resources.filter(resource => resource.status === viewMode)

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
            <button className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300">
              Add Resource
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Resources',
              value: '147',
              change: '+12',
              trend: 'up' as const,
              subtitle: 'across all teams'
            },
            {
              label: 'Avg Utilization',
              value: '84%',
              change: '+3%',
              trend: 'up' as const,
              subtitle: 'capacity usage'
            },
            {
              label: 'Available Now',
              value: '24',
              change: '+6',
              trend: 'up' as const,
              subtitle: 'ready to assign'
            },
            {
              label: 'Overallocated',
              value: '8',
              change: '-3',
              trend: 'up' as const,
              subtitle: 'require rebalancing'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Add Resource', icon: '➕', onClick: () => {} },
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
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(resource.status)}`}>
                            {resource.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(resource.type)}`}>
                            {resource.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getSkillLevelColor(resource.skillLevel)}`}>
                            {resource.skillLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-sky-500">🏢</span>
                            {resource.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-sky-500">📍</span>
                            {resource.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-sky-500">💰</span>
                            ${resource.hourlyRate}/hr
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-sky-500">📅</span>
                            Available: {resource.availability}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${resource.utilization > 100 ? 'text-red-600 dark:text-red-400' : resource.utilization >= 90 ? 'text-yellow-600 dark:text-yellow-400' : 'text-sky-600 dark:text-sky-400'}`}>
                          {resource.utilization}%
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
                        <span>Utilization: {resource.utilization}%</span>
                        <span>{resource.allocated}/{resource.capacity} hours</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            resource.utilization > 100
                              ? 'bg-gradient-to-r from-red-600 to-orange-600'
                              : resource.utilization >= 90
                              ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                              : 'bg-gradient-to-r from-sky-600 to-blue-600'
                          }`}
                          style={{ width: `${Math.min(resource.utilization, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-slate-600 dark:text-slate-400">Projects:</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Skills:</div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap gap-1">
                          {resource.projects.map((project) => (
                            <span key={project} className="px-2 py-1 rounded-full text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                              {project}
                            </span>
                          ))}
                          {resource.projects.length === 0 && (
                            <span className="text-xs text-slate-400">No projects</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {resource.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {skill}
                            </span>
                          ))}
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

            {/* Resource Distribution */}
            <ProgressCard
              title="Resource Distribution"
              items={[
                { label: 'Developers', value: 52, total: 147, color: 'purple' },
                { label: 'Designers', value: 24, total: 147, color: 'pink' },
                { label: 'Managers', value: 18, total: 147, color: 'blue' },
                { label: 'QA Engineers', value: 28, total: 147, color: 'green' },
                { label: 'DevOps', value: 25, total: 147, color: 'orange' }
              ]}
            />

            {/* Top Utilized Resources */}
            <RankingList
              title="Top Utilized Resources"
              items={[
                { label: 'Michael Chen', value: '120% util', rank: 1, trend: 'up' },
                { label: 'Emily Rodriguez', value: '100% util', rank: 2, trend: 'same' },
                { label: 'Sarah Johnson', value: '95% util', rank: 3, trend: 'up' },
                { label: 'Jessica Williams', value: '87.5% util', rank: 4, trend: 'down' },
                { label: 'David Kim', value: '50% util', rank: 5, trend: 'up' }
              ]}
            />

            {/* Skill Level Distribution */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Skill Levels</h3>
              <div className="space-y-3">
                {[
                  { level: 'Principal', count: 8, color: 'from-red-600 to-orange-600' },
                  { level: 'Lead', count: 14, color: 'from-orange-600 to-yellow-600' },
                  { level: 'Senior', count: 42, color: 'from-purple-600 to-pink-600' },
                  { level: 'Mid-Level', count: 58, color: 'from-cyan-600 to-blue-600' },
                  { level: 'Junior', count: 25, color: 'from-blue-600 to-indigo-600' }
                ].map((item) => (
                  <div key={item.level}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-900 dark:text-white">{item.level}</span>
                      <span className="text-slate-600 dark:text-slate-400">{item.count} resources</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        style={{ width: `${(item.count / 147) * 100}%` }}
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
                value="$108"
                trend="up"
                change="+$5"
              />
              <MiniKPI
                label="Billable Hours"
                value="5,880h"
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
