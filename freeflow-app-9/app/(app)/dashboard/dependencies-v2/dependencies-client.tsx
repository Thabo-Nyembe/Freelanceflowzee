'use client'

import { useState } from 'react'
import { useDependencies, type Dependency, type DependencyStatus, type DependencyType } from '@/lib/hooks/use-dependencies'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI, RankingList, ProgressCard } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Link, GitBranch, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default function DependenciesClient({ initialDependencies }: { initialDependencies: Dependency[] }) {
  const [statusFilter, setStatusFilter] = useState<DependencyStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DependencyType | 'all'>('all')
  const { dependencies, loading, error } = useDependencies({ status: statusFilter, type: typeFilter })

  const displayDependencies = dependencies.length > 0 ? dependencies : initialDependencies

  const stats = [
    {
      label: 'Total Dependencies',
      value: displayDependencies.length.toString(),
      change: 12.5,
      icon: <Link className="w-5 h-5" />
    },
    {
      label: 'Blocked Tasks',
      value: displayDependencies.filter(d => d.status === 'blocked').length.toString(),
      change: -8.2,
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      label: 'Critical Path',
      value: displayDependencies.filter(d => d.is_on_critical_path).length.toString(),
      change: 5.3,
      icon: <GitBranch className="w-5 h-5" />
    },
    {
      label: 'Resolution Rate',
      value: displayDependencies.length > 0
        ? `${((displayDependencies.filter(d => d.status === 'resolved').length / displayDependencies.length) * 100).toFixed(0)}%`
        : '0%',
      change: 15.7,
      icon: <CheckCircle className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: DependencyStatus) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'blocked': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: DependencyType) => {
    switch (type) {
      case 'finish-to-start': return 'bg-purple-100 text-purple-700'
      case 'start-to-start': return 'bg-blue-100 text-blue-700'
      case 'finish-to-finish': return 'bg-green-100 text-green-700'
      case 'start-to-finish': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const criticalPath = displayDependencies
    .filter(d => d.is_on_critical_path)
    .sort((a, b) => (a.critical_path_order || 0) - (b.critical_path_order || 0))
    .slice(0, 5)

  const recentActivity = displayDependencies.slice(0, 4).map((d) => ({
    icon: d.status === 'resolved' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />,
    title: d.status === 'resolved' ? 'Dependency resolved' : 'Dependency updated',
    description: d.dependency_name,
    time: new Date(d.updated_at).toLocaleDateString(),
    status: (d.status === 'resolved' ? 'success' : d.status === 'blocked' ? 'error' : 'info') as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <GitBranch className="w-10 h-10 text-indigo-600" />
              Project Dependencies
            </h1>
            <p className="text-muted-foreground">Manage task dependencies and critical path</p>
          </div>
          <GradientButton from="indigo" to="purple" onClick={() => console.log('Add dependency')}>
            <Link className="w-5 h-5 mr-2" />
            Add Dependency
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>All</PillButton>
          <PillButton variant={statusFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('active')}>Active</PillButton>
          <PillButton variant={statusFilter === 'blocked' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('blocked')}>Blocked</PillButton>
          <PillButton variant={statusFilter === 'resolved' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('resolved')}>Resolved</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayDependencies.map((dependency) => (
              <BentoCard key={dependency.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-2">{dependency.dependency_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(dependency.status)}`}>
                        {dependency.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(dependency.dependency_type)}`}>
                        {dependency.dependency_type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(dependency.impact_level)}`}>
                        {dependency.impact_level}
                      </span>
                      {dependency.is_on_critical_path && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          Critical Path
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                      {dependency.owner && <span>Owner: {dependency.owner}</span>}
                      {dependency.team && <span>Team: {dependency.team}</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Predecessor</p>
                    <p className="font-medium text-sm mb-1">{dependency.predecessor_task}</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${dependency.predecessor_progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{dependency.predecessor_progress}% complete</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Successor</p>
                    <p className="font-medium text-sm mb-1">{dependency.successor_task}</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${dependency.successor_progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{dependency.successor_progress}% complete</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  {dependency.due_date && (
                    <span>Due: {new Date(dependency.due_date).toLocaleDateString()}</span>
                  )}
                  {dependency.days_remaining > 0 ? (
                    <span className={dependency.days_remaining <= 7 ? 'text-red-600 font-bold' : ''}>
                      {dependency.days_remaining} days remaining
                    </span>
                  ) : dependency.status === 'resolved' ? (
                    <span className="text-green-600 font-bold">Resolved</span>
                  ) : null}
                  {dependency.blocked_days > 0 && (
                    <span className="text-red-600 font-bold">Blocked {dependency.blocked_days} days</span>
                  )}
                </div>

                {dependency.resolution && (
                  <div className="mt-3 p-2 bg-muted rounded-lg text-xs">
                    {dependency.resolution}
                  </div>
                )}
              </BentoCard>
            ))}

            {displayDependencies.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Dependencies</h3>
                <p className="text-muted-foreground">Add your first dependency</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {criticalPath.length > 0 && (
              <BentoCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Critical Path</h3>
                <div className="space-y-3">
                  {criticalPath.map((dep, index) => (
                    <div key={dep.id}>
                      <div className="p-3 rounded-lg border border-border">
                        <p className="font-medium text-sm mb-2">{dep.dependency_name}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{dep.total_duration_days} days</span>
                          <span className="font-medium">{dep.overall_progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            style={{ width: `${dep.overall_progress}%` }}
                          />
                        </div>
                      </div>
                      {index < criticalPath.length - 1 && (
                        <div className="flex justify-center py-1">
                          <span className="text-indigo-500">↓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Avg Resolution"
                value={`${(displayDependencies.reduce((sum, d) => sum + d.total_duration_days, 0) / Math.max(displayDependencies.length, 1)).toFixed(1)}d`}
                change={-12.4}
              />
              <MiniKPI
                label="Block Rate"
                value={displayDependencies.length > 0
                  ? `${((displayDependencies.filter(d => d.status === 'blocked').length / displayDependencies.length) * 100).toFixed(0)}%`
                  : '0%'}
                change={-5.3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
