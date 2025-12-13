'use client'

import { useState } from 'react'
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
  Share2
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type WorkflowStatus = 'active' | 'paused' | 'draft' | 'completed' | 'failed'
type WorkflowType = 'approval' | 'review' | 'processing' | 'integration' | 'notification' | 'data-sync'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

interface Workflow {
  id: string
  name: string
  description: string
  type: WorkflowType
  status: WorkflowStatus
  priority: Priority
  steps: number
  currentStep: number
  assignedTo: string[]
  startedAt: string
  estimatedCompletion: string
  actualCompletion: string
  approvals: {
    required: number
    received: number
  }
  completionRate: number
  dependencies: string[]
  tags: string[]
}

export default function WorkflowsPage() {
  const [viewMode, setViewMode] = useState<'all' | WorkflowStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')

  const workflows: Workflow[] = [
    {
      id: 'WF-2847',
      name: 'Invoice Approval Workflow',
      description: 'Multi-level approval process for vendor invoices over $10,000',
      type: 'approval',
      status: 'active',
      priority: 'high',
      steps: 5,
      currentStep: 3,
      assignedTo: ['Finance Manager', 'CFO', 'CEO'],
      startedAt: '2024-01-15 09:00',
      estimatedCompletion: '2024-01-17 17:00',
      actualCompletion: '',
      approvals: { required: 3, received: 2 },
      completionRate: 60,
      dependencies: ['Budget Check', 'Vendor Verification'],
      tags: ['finance', 'approval', 'high-value']
    },
    {
      id: 'WF-2848',
      name: 'Content Review Pipeline',
      description: 'Editorial review and approval for blog posts and marketing content',
      type: 'review',
      status: 'active',
      priority: 'medium',
      steps: 4,
      currentStep: 2,
      assignedTo: ['Content Writer', 'Editor', 'Marketing Lead'],
      startedAt: '2024-01-14 10:00',
      estimatedCompletion: '2024-01-16 15:00',
      actualCompletion: '',
      approvals: { required: 2, received: 1 },
      completionRate: 50,
      dependencies: ['SEO Check', 'Plagiarism Scan'],
      tags: ['content', 'marketing', 'editorial']
    },
    {
      id: 'WF-2849',
      name: 'Customer Data Migration',
      description: 'Migrate customer records from legacy CRM to new system',
      type: 'processing',
      status: 'completed',
      priority: 'urgent',
      steps: 6,
      currentStep: 6,
      assignedTo: ['Data Team', 'DevOps'],
      startedAt: '2024-01-10 08:00',
      estimatedCompletion: '2024-01-12 18:00',
      actualCompletion: '2024-01-12 16:30',
      approvals: { required: 1, received: 1 },
      completionRate: 100,
      dependencies: ['Database Backup', 'Schema Validation'],
      tags: ['migration', 'data', 'crm']
    },
    {
      id: 'WF-2850',
      name: 'Third-Party API Integration',
      description: 'Integrate payment gateway API with checkout system',
      type: 'integration',
      status: 'active',
      priority: 'high',
      steps: 7,
      currentStep: 5,
      assignedTo: ['Backend Dev', 'QA Engineer', 'Product Manager'],
      startedAt: '2024-01-13 09:00',
      estimatedCompletion: '2024-01-18 17:00',
      actualCompletion: '',
      approvals: { required: 2, received: 1 },
      completionRate: 71,
      dependencies: ['API Credentials', 'Test Environment'],
      tags: ['integration', 'payments', 'api']
    },
    {
      id: 'WF-2851',
      name: 'Security Incident Response',
      description: 'Automated incident detection and notification workflow',
      type: 'notification',
      status: 'paused',
      priority: 'urgent',
      steps: 3,
      currentStep: 1,
      assignedTo: ['Security Team', 'DevOps Lead'],
      startedAt: '2024-01-15 14:30',
      estimatedCompletion: '2024-01-15 15:00',
      actualCompletion: '',
      approvals: { required: 1, received: 0 },
      completionRate: 33,
      dependencies: ['Alert System', 'On-Call Roster'],
      tags: ['security', 'incident', 'urgent']
    },
    {
      id: 'WF-2852',
      name: 'Inventory Sync Workflow',
      description: 'Daily synchronization of inventory data between warehouse and e-commerce',
      type: 'data-sync',
      status: 'failed',
      priority: 'medium',
      steps: 4,
      currentStep: 2,
      assignedTo: ['Inventory Manager', 'Tech Team'],
      startedAt: '2024-01-15 06:00',
      estimatedCompletion: '2024-01-15 07:00',
      actualCompletion: '',
      approvals: { required: 0, received: 0 },
      completionRate: 50,
      dependencies: ['API Access', 'Data Mapping'],
      tags: ['inventory', 'sync', 'automation']
    }
  ]

  const filteredWorkflows = workflows.filter(workflow => {
    if (viewMode !== 'all' && workflow.status !== viewMode) return false
    if (priorityFilter !== 'all' && workflow.priority !== priorityFilter) return false
    return true
  })

  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter(w => w.status === 'active').length
  const completedWorkflows = workflows.filter(w => w.status === 'completed').length
  const avgCompletionRate = workflows.reduce((sum, w) => sum + w.completionRate, 0) / workflows.length

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'urgent': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: WorkflowType) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
            Workflows
          </h1>
          <p className="text-slate-600">Manage complex business processes and approval chains</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Workflows',
              value: totalWorkflows.toString(),
              icon: GitBranch,
              trend: { value: 12, isPositive: true },
              color: 'cyan'
            },
            {
              label: 'Active',
              value: activeWorkflows.toString(),
              icon: Play,
              trend: { value: 5, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Completed',
              value: completedWorkflows.toString(),
              icon: CheckCircle2,
              trend: { value: 18, isPositive: true },
              color: 'green'
            },
            {
              label: 'Avg Progress',
              value: `${avgCompletionRate.toFixed(0)}%`,
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
              onClick: () => console.log('New workflow')
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
              label="All Workflows"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Active"
              isActive={viewMode === 'active'}
              onClick={() => setViewMode('active')}
            />
            <PillButton
              label="Paused"
              isActive={viewMode === 'paused'}
              onClick={() => setViewMode('paused')}
            />
            <PillButton
              label="Completed"
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
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(workflow.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{workflow.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{workflow.description}</p>
                      <p className="text-xs text-slate-500">Workflow ID: {workflow.id}</p>
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
                      <span className="text-sm text-slate-700">{workflow.startedAt}</span>
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
                          ? workflow.actualCompletion
                          : workflow.estimatedCompletion}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">
                      Progress: Step {workflow.currentStep} of {workflow.steps}
                    </span>
                    <span className="text-xs font-medium text-slate-900">{workflow.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      style={{ width: `${workflow.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Assigned Team</p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.assignedTo.map((person, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Approvals</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {workflow.approvals.received} / {workflow.approvals.required}
                      </span>
                    </div>
                  </div>
                </div>

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

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all">
                    {workflow.status === 'active' ? 'View Details' : 'Resume'}
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    {workflow.status === 'active' ? 'Pause' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Active Workflows */}
            <MiniKPI
              label="Active Workflows"
              value={activeWorkflows.toString()}
              icon={Play}
              trend={{ value: 5, isPositive: true }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Updates"
              activities={[
                {
                  id: '1',
                  title: 'Invoice approval received',
                  description: 'CFO approved - awaiting CEO',
                  timestamp: '10 minutes ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'Content review in progress',
                  description: 'Editor reviewing draft',
                  timestamp: '1 hour ago',
                  type: 'info'
                },
                {
                  id: '3',
                  title: 'Data migration completed',
                  description: '2,847 records transferred',
                  timestamp: '3 hours ago',
                  type: 'success'
                },
                {
                  id: '4',
                  title: 'Inventory sync failed',
                  description: 'API connection timeout',
                  timestamp: '5 hours ago',
                  type: 'error'
                }
              ]}
            />

            {/* Workflow Types */}
            <RankingList
              title="By Type"
              items={[
                { label: 'Approval', value: '35%', rank: 1 },
                { label: 'Processing', value: '28%', rank: 2 },
                { label: 'Integration', value: '18%', rank: 3 },
                { label: 'Review', value: '12%', rank: 4 },
                { label: 'Data Sync', value: '7%', rank: 5 }
              ]}
            />

            {/* Completion Rate */}
            <ProgressCard
              title="Average Completion"
              progress={avgCompletionRate}
              subtitle="Across all workflows"
              color="cyan"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
