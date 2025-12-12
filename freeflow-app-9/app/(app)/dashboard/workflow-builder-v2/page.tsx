"use client"

import { useState } from 'react'
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
  Trash2
} from 'lucide-react'

/**
 * Workflow Builder V2 - Groundbreaking Visual Workflow Creation
 * Showcases workflow design with modern components
 */
export default function WorkflowBuilderV2() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const stats = [
    { label: 'Total Workflows', value: '42', change: 12.5, icon: <GitBranch className="w-5 h-5" /> },
    { label: 'Active', value: '28', change: 8.3, icon: <Activity className="w-5 h-5" /> },
    { label: 'Executions Today', value: '347', change: 25.3, icon: <Zap className="w-5 h-5" /> },
    { label: 'Success Rate', value: '98%', change: 5.2, icon: <CheckCircle className="w-5 h-5" /> }
  ]

  const workflows = [
    {
      id: '1',
      name: 'Lead Nurturing Campaign',
      description: 'Automated email sequence for new leads',
      triggers: 2,
      actions: 8,
      status: 'active',
      lastRun: '5 minutes ago',
      executions: 127
    },
    {
      id: '2',
      name: 'Project Onboarding',
      description: 'Setup tasks when new project starts',
      triggers: 1,
      actions: 12,
      status: 'active',
      lastRun: '1 hour ago',
      executions: 45
    },
    {
      id: '3',
      name: 'Invoice Reminders',
      description: 'Send payment reminders for overdue invoices',
      triggers: 1,
      actions: 5,
      status: 'active',
      lastRun: '3 hours ago',
      executions: 89
    },
    {
      id: '4',
      name: 'Customer Feedback',
      description: 'Request feedback after project completion',
      triggers: 1,
      actions: 4,
      status: 'draft',
      lastRun: 'Never',
      executions: 0
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <GitBranch className="w-10 h-10 text-violet-600" />
              Workflow Builder
            </h1>
            <p className="text-muted-foreground">Design and automate your business processes</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('New workflow')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Workflow
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Workflow" description="From scratch" onClick={() => console.log('New')} />
          <BentoQuickAction icon={<Copy />} title="Templates" description="Pre-built" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
          <BentoQuickAction icon={<Activity />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Workflows</h3>
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
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {workflow.triggers} triggers
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {workflow.actions} actions
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {workflow.executions} executions
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last run: {workflow.lastRun}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', workflow.id)}>
                          <Settings className="w-3 h-3 mr-1" />
                          Edit
                        </ModernButton>
                        {workflow.status === 'active' && (
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Test', workflow.id)}>
                            <Play className="w-3 h-3 mr-1" />
                            Test Run
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Duplicate', workflow.id)}>
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <MiniKPI label="Daily Executions" value="347" change={25.3} />
                <MiniKPI label="Success Rate" value="98%" change={5.2} />
                <MiniKPI label="Avg Time Saved" value="18min" change={12.5} />
                <MiniKPI label="Active Workflows" value="28" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
