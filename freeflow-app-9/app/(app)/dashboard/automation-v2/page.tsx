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
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Zap,
  Play,
  Pause,
  Plus,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  Activity,
  GitBranch,
  Mail,
  Calendar,
  FileText,
  Bell
} from 'lucide-react'

/**
 * Automation V2 - Groundbreaking Workflow Automation
 * Showcases automation workflows with modern components
 */
export default function AutomationV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'paused'>('all')

  const stats = [
    { label: 'Active Workflows', value: '24', change: 12.5, icon: <Zap className="w-5 h-5" /> },
    { label: 'Tasks Automated', value: '1.2K', change: 25.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Time Saved', value: '47h', change: 18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Success Rate', value: '98%', change: 5.2, icon: <Activity className="w-5 h-5" /> }
  ]

  const workflows = [
    {
      id: 1,
      name: 'New Client Onboarding',
      description: 'Automatically send welcome email and create project',
      status: 'active',
      trigger: 'New client signup',
      actions: 4,
      executions: 127,
      lastRun: '2 hours ago'
    },
    {
      id: 2,
      name: 'Invoice Reminder',
      description: 'Send payment reminders for overdue invoices',
      status: 'active',
      trigger: 'Invoice overdue',
      actions: 3,
      executions: 89,
      lastRun: '1 day ago'
    },
    {
      id: 3,
      name: 'Project Deadline Alert',
      description: 'Notify team when project deadline approaches',
      status: 'active',
      trigger: 'Deadline in 3 days',
      actions: 2,
      executions: 45,
      lastRun: '3 hours ago'
    },
    {
      id: 4,
      name: 'Weekly Report Generation',
      description: 'Generate and email weekly performance reports',
      status: 'paused',
      trigger: 'Every Monday 9AM',
      actions: 5,
      executions: 12,
      lastRun: '1 week ago'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Zap className="w-10 h-10 text-violet-600" />
              Automation
            </h1>
            <p className="text-muted-foreground">Automate your workflows and save time</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('New workflow')}>
            <Plus className="w-5 h-5 mr-2" />
            New Workflow
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Create Workflow" description="New automation" onClick={() => console.log('Create')} />
          <BentoQuickAction icon={<GitBranch />} title="Templates" description="Pre-built" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>
            All Workflows
          </PillButton>
          <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>
            Active
          </PillButton>
          <PillButton variant={selectedFilter === 'paused' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('paused')}>
            Paused
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {workflows.map((workflow) => (
              <BentoCard key={workflow.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950">
                        <Zap className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{workflow.name}</h3>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Trigger: </span>
                      <span className="font-medium">{workflow.trigger}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', workflow.id)}>
                      <Settings className="w-3 h-3 mr-1" />
                      Edit
                    </ModernButton>
                    {workflow.status === 'active' ? (
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Pause', workflow.id)}>
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </ModernButton>
                    ) : (
                      <ModernButton variant="outline" size="sm" onClick={() => console.log('Activate', workflow.id)}>
                        <Play className="w-3 h-3 mr-1" />
                        Activate
                      </ModernButton>
                    )}
                    <ModernButton variant="outline" size="sm" onClick={() => console.log('Test', workflow.id)}>
                      Test Run
                    </ModernButton>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Triggers</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <Mail className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="text-sm font-medium">Email Received</p>
                    <p className="text-xs text-muted-foreground">On new email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="text-sm font-medium">Schedule</p>
                    <p className="text-xs text-muted-foreground">Time-based</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <FileText className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="text-sm font-medium">Form Submitted</p>
                    <p className="text-xs text-muted-foreground">On submission</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                  <Bell className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="text-sm font-medium">Webhook</p>
                    <p className="text-xs text-muted-foreground">External event</p>
                  </div>
                </div>
              </div>
            </BentoCard>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Daily Executions" value="156" change={12.5} />
                <MiniKPI label="Success Rate" value="98%" change={5.2} />
                <MiniKPI label="Avg Time Saved" value="15min" change={8.3} />
                <MiniKPI label="Active Users" value="42" change={15.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
