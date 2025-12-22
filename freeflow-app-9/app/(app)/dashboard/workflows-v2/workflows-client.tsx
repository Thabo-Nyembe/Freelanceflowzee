'use client'

import { useState } from 'react'
import { useWorkflows, Workflow, WorkflowStats } from '@/lib/hooks/use-workflows'
import {
  GitBranch,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Users,
  Mail,
  FileText,
  Database,
  Code,
  Zap,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Edit,
  Copy,
  Trash2,
  Filter,
  GitMerge,
  Layers,
  Share2,
  Plus
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

interface WorkflowsClientProps {
  initialWorkflows: Workflow[]
  initialStats: WorkflowStats
}

export default function WorkflowsClient({ initialWorkflows, initialStats }: WorkflowsClientProps) {
  const [viewMode, setViewMode] = useState<'all' | Workflow['status']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Workflow['priority']>('all')

  const {
    workflows,
    loading,
    stats,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    archiveWorkflow
  } = useWorkflows(initialWorkflows, initialStats)

  const filteredWorkflows = workflows.filter(workflow => {
    if (viewMode !== 'all' && workflow.status !== viewMode) return false
    if (priorityFilter !== 'all' && workflow.priority !== priorityFilter) return false
    return true
  })

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: Workflow['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'urgent': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: Workflow['type']) => {
    switch (type) {
      case 'approval': return <CheckCircle2 className="w-5 h-5" />
      case 'review': return <FileText className="w-5 h-5" />
      case 'processing': return <Zap className="w-5 h-5" />
      case 'integration': return <GitMerge className="w-5 h-5" />
      case 'notification': return <Mail className="w-5 h-5" />
      case 'data-sync': return <Database className="w-5 h-5" />
      default: return <GitBranch className="w-5 h-5" />
    }
  }

  const handleCreateWorkflow = async () => {
    await createWorkflow({
      name: 'New Workflow',
      description: 'A new workflow',
      type: 'approval',
      priority: 'medium',
      status: 'draft'
    })
  }

  const handleWorkflowAction = async (workflow: Workflow) => {
    if (workflow.status === 'active') {
      await pauseWorkflow(workflow.id)
    } else if (workflow.status === 'paused' || workflow.status === 'draft') {
      await startWorkflow(workflow.id)
    }
  }

  const handleDeleteWorkflow = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(id)
    }
  }

  const recentActivities = workflows.slice(0, 4).map(w => ({
    id: w.id,
    title: `${w.name} ${w.status}`,
    description: w.description || 'No description',
    timestamp: new Date(w.updated_at).toLocaleString(),
    type: (w.status === 'completed' ? 'success' : w.status === 'failed' ? 'error' : 'info') as 'success' | 'error' | 'info'
  }))

  const typeDistribution = [
    { label: 'Approval', value: `${workflows.filter(w => w.type === 'approval').length}`, rank: 1 },
    { label: 'Processing', value: `${workflows.filter(w => w.type === 'processing').length}`, rank: 2 },
    { label: 'Integration', value: `${workflows.filter(w => w.type === 'integration').length}`, rank: 3 },
    { label: 'Review', value: `${workflows.filter(w => w.type === 'review').length}`, rank: 4 },
    { label: 'Data Sync', value: `${workflows.filter(w => w.type === 'data-sync').length}`, rank: 5 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
              Workflows
            </h1>
            <p className="text-slate-600">Manage complex business processes and approval chains</p>
          </div>
          <button
            onClick={handleCreateWorkflow}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            New Workflow
          </button>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Workflows',
              value: stats.total.toString(),
              icon: GitBranch,
              trend: { value: 12, isPositive: true },
              color: 'cyan'
            },
            {
              label: 'Active',
              value: stats.active.toString(),
              icon: Play,
              trend: { value: 5, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Completed',
              value: stats.completed.toString(),
              icon: CheckCircle2,
              trend: { value: 18, isPositive: true },
              color: 'green'
            },
            {
              label: 'Avg Progress',
              value: `${stats.avgCompletionRate.toFixed(0)}%`,
              icon: TrendingUp,
              trend: { value: 8.5, isPositive: true },
              color: 'purple'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Workflow',
              description: 'Create process',
              icon: GitBranch,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: handleCreateWorkflow
            },
            {
              title: 'Templates',
              description: 'Use prebuilt',
              icon: Layers,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Templates')
            },
            {
              title: 'Approvals',
              description: 'Pending reviews',
              icon: CheckCircle2,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Approvals')
            },
            {
              title: 'Analytics',
              description: 'View insights',
              icon: BarChart3,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Team Tasks',
              description: 'Assign work',
              icon: Users,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Team')
            },
            {
              title: 'Integrations',
              description: 'Connect apps',
              icon: Share2,
              gradient: 'from-pink-500 to-rose-600',
              onClick: () => console.log('Integrations')
            },
            {
              title: 'Settings',
              description: 'Configure rules',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Error Logs',
              description: 'View failures',
              icon: AlertTriangle,
              gradient: 'from-red-500 to-rose-600',
              onClick: () => console.log('Errors')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label={`All Workflows (${stats.total})`}
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label={`Active (${stats.active})`}
              isActive={viewMode === 'active'}
              onClick={() => setViewMode('active')}
            />
            <PillButton
              label={`Paused (${stats.paused})`}
              isActive={viewMode === 'paused'}
              onClick={() => setViewMode('paused')}
            />
            <PillButton
              label={`Completed (${stats.completed})`}
              isActive={viewMode === 'completed'}
              onClick={() => setViewMode('completed')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Priority"
              isActive={priorityFilter === 'all'}
              onClick={() => setPriorityFilter('all')}
            />
            <PillButton
              label="Urgent"
              isActive={priorityFilter === 'urgent'}
              onClick={() => setPriorityFilter('urgent')}
            />
            <PillButton
              label="High"
              isActive={priorityFilter === 'high'}
              onClick={() => setPriorityFilter('high')}
            />
            <PillButton
              label="Medium"
              isActive={priorityFilter === 'medium'}
              onClick={() => setPriorityFilter('medium')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Workflows List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredWorkflows.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
                <GitBranch className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600">No workflows found</p>
                <p className="text-sm text-slate-500">Create your first workflow to get started</p>
              </div>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(workflow.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{workflow.name}</h3>
                        <p className="text-sm text-slate-600 mb-2">{workflow.description || 'No description'}</p>
                        <p className="text-xs text-slate-500">Workflow ID: {workflow.workflow_code}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                        {workflow.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Started</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {workflow.started_at ? new Date(workflow.started_at).toLocaleString() : 'Not started'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        {workflow.status === 'completed' ? 'Completed' : 'Est. Completion'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {workflow.status === 'completed'
                            ? workflow.actual_completion ? new Date(workflow.actual_completion).toLocaleString() : 'N/A'
                            : workflow.estimated_completion ? new Date(workflow.estimated_completion).toLocaleString() : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">
                        Progress: Step {workflow.current_step} of {workflow.total_steps}
                      </span>
                      <span className="text-xs font-medium text-slate-900">{workflow.completion_rate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        style={{ width: `${workflow.completion_rate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Assigned Team</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.assigned_to.length > 0 ? workflow.assigned_to.map((person, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {person}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-400">No assignments</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-2">Approvals</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-900">
                          {workflow.approvals_received} / {workflow.approvals_required}
                        </span>
                      </div>
                    </div>
                  </div>

                  {workflow.dependencies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2">Dependencies</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.dependencies.map((dep, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {workflow.tags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleWorkflowAction(workflow)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                    >
                      {workflow.status === 'active' ? 'Pause' : workflow.status === 'paused' ? 'Resume' : 'Start'}
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Active Workflows */}
            <MiniKPI
              label="Active Workflows"
              value={stats.active.toString()}
              icon={Play}
              trend={{ value: 5, isPositive: true }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Updates"
              activities={recentActivities}
            />

            {/* Workflow Types */}
            <RankingList
              title="By Type"
              items={typeDistribution}
            />

            {/* Completion Rate */}
            <ProgressCard
              title="Average Completion"
              progress={stats.avgCompletionRate}
              subtitle="Across all workflows"
              color="cyan"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
