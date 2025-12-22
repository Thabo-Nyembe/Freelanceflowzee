'use client'

import { useState } from 'react'
import { useWorkflows, Workflow, WorkflowStats } from '@/lib/hooks/use-workflows'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  GitBranch,
  Plus,
  Play,
  Save,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  Activity,
  Copy,
  Trash2,
  Pause,
  X,
  Loader2
} from 'lucide-react'

interface WorkflowBuilderClientProps {
  initialWorkflows: Workflow[]
  initialStats: WorkflowStats
}

export default function WorkflowBuilderClient({ initialWorkflows, initialStats }: WorkflowBuilderClientProps) {
  const {
    workflows,
    stats,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow
  } = useWorkflows(initialWorkflows, initialStats)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: ''
  })

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) return
    await createWorkflow({
      name: newWorkflow.name,
      description: newWorkflow.description,
      status: 'draft',
      total_steps: 0,
      current_step: 0,
      completion_rate: 0,
      steps_config: [],
      approvals_required: 0,
      approvals_received: 0,
      assigned_to: [],
      dependencies: [],
      tags: []
    })
    setShowCreateModal(false)
    setNewWorkflow({ name: '', description: '' })
  }

  const displayStats = [
    { label: 'Total Workflows', value: stats.total.toString(), change: 12.5, icon: <GitBranch className="w-5 h-5" /> },
    { label: 'Active', value: stats.active.toString(), change: 8.3, icon: <Activity className="w-5 h-5" /> },
    { label: 'Completed', value: stats.completed.toString(), change: 25.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Completion Rate', value: `${Math.round(stats.avgCompletionRate)}%`, change: 5.2, icon: <Zap className="w-5 h-5" /> }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <GitBranch className="w-10 h-10 text-violet-600" />
              Workflow Builder
            </h1>
            <p className="text-muted-foreground">Design and automate your business processes</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Workflow
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Workflow" description="From scratch" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<Copy />} title="Templates" description="Pre-built" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
          <BentoQuickAction icon={<Activity />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Workflows ({workflows.length})</h3>
              {loading && workflows.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows yet</p>
                  <ModernButton
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Workflow
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{workflow.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(workflow.status)}`}>
                                {workflow.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{workflow.description || 'No description'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {workflow.total_steps} steps
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {workflow.current_step}/{workflow.total_steps} completed
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {workflow.completion_rate}% complete
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', workflow.id)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </ModernButton>
                          {workflow.status === 'draft' && (
                            <ModernButton variant="outline" size="sm" onClick={() => startWorkflow(workflow.id)}>
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </ModernButton>
                          )}
                          {workflow.status === 'active' && (
                            <ModernButton variant="outline" size="sm" onClick={() => pauseWorkflow(workflow.id)}>
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </ModernButton>
                          )}
                          {workflow.status === 'paused' && (
                            <ModernButton variant="outline" size="sm" onClick={() => resumeWorkflow(workflow.id)}>
                              <Play className="w-3 h-3 mr-1" />
                              Resume
                            </ModernButton>
                          )}
                          <ModernButton variant="outline" size="sm" onClick={() => deleteWorkflow(workflow.id)}>
                            <Trash2 className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Building Blocks</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium">Triggers</p>
                      <p className="text-xs text-muted-foreground">Start workflows</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium">Actions</p>
                      <p className="text-xs text-muted-foreground">Execute tasks</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium">Conditions</p>
                      <p className="text-xs text-muted-foreground">Logic rules</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium">Delays</p>
                      <p className="text-xs text-muted-foreground">Time-based</p>
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Steps" value={stats.totalSteps.toString()} change={25.3} />
                <MiniKPI label="Completed Steps" value={stats.completedSteps.toString()} change={5.2} />
                <MiniKPI label="Draft Workflows" value={stats.draft.toString()} change={12.5} />
                <MiniKPI label="Failed" value={stats.failed.toString()} change={-8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Workflow</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </ModernButton>
                <GradientButton
                  from="violet"
                  to="purple"
                  className="flex-1"
                  onClick={handleCreateWorkflow}
                  disabled={loading || !newWorkflow.name.trim()}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Workflow'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
