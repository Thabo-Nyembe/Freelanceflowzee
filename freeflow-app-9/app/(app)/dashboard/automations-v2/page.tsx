'use client'

import { useState } from 'react'
import {
  Zap,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Filter,
  GitBranch,
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  Database,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Code,
  Webhook
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type AutomationStatus = 'active' | 'paused' | 'draft' | 'error' | 'archived'
type AutomationType = 'scheduled' | 'trigger-based' | 'event-driven' | 'conditional' | 'sequential'
type TriggerType = 'time' | 'webhook' | 'database' | 'user-action' | 'api-call' | 'file-upload'

interface Automation {
  id: string
  name: string
  description: string
  type: AutomationType
  status: AutomationStatus
  trigger: TriggerType
  actions: string[]
  lastRun: string
  nextRun: string
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  avgDuration: number
  successRate: number
  createdBy: string
  createdAt: string
}

export default function AutomationsPage() {
  const [viewMode, setViewMode] = useState<'all' | AutomationStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | AutomationType>('all')

  const automations: Automation[] = [
    {
      id: 'AUTO-2847',
      name: 'Daily Report Generation',
      description: 'Generate and email daily analytics reports to stakeholders',
      type: 'scheduled',
      status: 'active',
      trigger: 'time',
      actions: ['Query Database', 'Generate PDF', 'Send Email'],
      lastRun: '2024-01-15 08:00',
      nextRun: '2024-01-16 08:00',
      totalRuns: 847,
      successfulRuns: 842,
      failedRuns: 5,
      avgDuration: 45,
      successRate: 99.4,
      createdBy: 'John Doe',
      createdAt: '2023-06-15'
    },
    {
      id: 'AUTO-2848',
      name: 'New User Onboarding',
      description: 'Trigger welcome email sequence when new user signs up',
      type: 'trigger-based',
      status: 'active',
      trigger: 'user-action',
      actions: ['Send Welcome Email', 'Create Profile', 'Assign Default Settings', 'Notify Team'],
      lastRun: '2024-01-15 14:23',
      nextRun: 'On user signup',
      totalRuns: 2847,
      successfulRuns: 2821,
      failedRuns: 26,
      avgDuration: 12,
      successRate: 99.1,
      createdBy: 'Jane Smith',
      createdAt: '2023-03-20'
    },
    {
      id: 'AUTO-2849',
      name: 'Invoice Payment Processing',
      description: 'Process payment webhooks and update invoice status',
      type: 'event-driven',
      status: 'active',
      trigger: 'webhook',
      actions: ['Verify Payment', 'Update Invoice', 'Send Receipt', 'Sync Accounting'],
      lastRun: '2024-01-15 15:47',
      nextRun: 'On webhook event',
      totalRuns: 4567,
      successfulRuns: 4521,
      failedRuns: 46,
      avgDuration: 8,
      successRate: 99.0,
      createdBy: 'Mike Johnson',
      createdAt: '2023-01-10'
    },
    {
      id: 'AUTO-2850',
      name: 'Abandoned Cart Recovery',
      description: 'Send reminder emails for abandoned shopping carts after 24 hours',
      type: 'conditional',
      status: 'paused',
      trigger: 'time',
      actions: ['Check Cart Status', 'Send Reminder', 'Track Conversion'],
      lastRun: '2024-01-14 10:00',
      nextRun: 'Paused',
      totalRuns: 1234,
      successfulRuns: 1198,
      failedRuns: 36,
      avgDuration: 15,
      successRate: 97.1,
      createdBy: 'Sarah Lee',
      createdAt: '2023-09-05'
    },
    {
      id: 'AUTO-2851',
      name: 'Database Backup Verification',
      description: 'Verify backup integrity and alert if issues detected',
      type: 'sequential',
      status: 'active',
      trigger: 'time',
      actions: ['Run Backup', 'Verify Files', 'Test Restore', 'Send Report'],
      lastRun: '2024-01-15 03:00',
      nextRun: '2024-01-16 03:00',
      totalRuns: 365,
      successfulRuns: 363,
      failedRuns: 2,
      avgDuration: 180,
      successRate: 99.5,
      createdBy: 'Tom Wilson',
      createdAt: '2023-01-01'
    },
    {
      id: 'AUTO-2852',
      name: 'Social Media Post Scheduler',
      description: 'Automatically post scheduled content across social platforms',
      type: 'scheduled',
      status: 'error',
      trigger: 'time',
      actions: ['Get Content', 'Post to Twitter', 'Post to LinkedIn', 'Track Engagement'],
      lastRun: '2024-01-15 12:00',
      nextRun: '2024-01-15 18:00',
      totalRuns: 567,
      successfulRuns: 542,
      failedRuns: 25,
      avgDuration: 20,
      successRate: 95.6,
      createdBy: 'Emma Davis',
      createdAt: '2023-08-12'
    }
  ]

  const filteredAutomations = automations.filter(automation => {
    if (viewMode !== 'all' && automation.status !== viewMode) return false
    if (typeFilter !== 'all' && automation.type !== typeFilter) return false
    return true
  })

  const totalAutomations = automations.length
  const activeAutomations = automations.filter(a => a.status === 'active').length
  const totalRuns = automations.reduce((sum, a) => sum + a.totalRuns, 0)
  const avgSuccessRate = automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length

  const getStatusColor = (status: AutomationStatus) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'archived': return 'text-slate-600 bg-slate-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: AutomationType) => {
    switch (type) {
      case 'scheduled': return 'text-blue-600 bg-blue-50'
      case 'trigger-based': return 'text-purple-600 bg-purple-50'
      case 'event-driven': return 'text-orange-600 bg-orange-50'
      case 'conditional': return 'text-cyan-600 bg-cyan-50'
      case 'sequential': return 'text-indigo-600 bg-indigo-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTriggerIcon = (trigger: TriggerType) => {
    switch (trigger) {
      case 'time': return <Clock className="w-4 h-4" />
      case 'webhook': return <Webhook className="w-4 h-4" />
      case 'database': return <Database className="w-4 h-4" />
      case 'user-action': return <Users className="w-4 h-4" />
      case 'api-call': return <Code className="w-4 h-4" />
      case 'file-upload': return <FileText className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-2">
            Automations
          </h1>
          <p className="text-slate-600">Build and manage automated workflows and processes</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Automations',
              value: totalAutomations.toString(),
              icon: Zap,
              trend: { value: 15, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Active',
              value: activeAutomations.toString(),
              icon: Play,
              trend: { value: 8, isPositive: true },
              color: 'green'
            },
            {
              label: 'Total Runs',
              value: totalRuns.toLocaleString(),
              icon: Activity,
              trend: { value: 23, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Success Rate',
              value: `${avgSuccessRate.toFixed(1)}%`,
              icon: TrendingUp,
              trend: { value: 2.4, isPositive: true },
              color: 'orange'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Automation',
              description: 'Create workflow',
              icon: Zap,
              gradient: 'from-purple-500 to-indigo-600',
              onClick: () => console.log('New automation')
            },
            {
              title: 'Templates',
              description: 'Browse prebuilt',
              icon: FileText,
              gradient: 'from-blue-500 to-cyan-600',
              onClick: () => console.log('Templates')
            },
            {
              title: 'Execution Logs',
              description: 'View history',
              icon: BarChart3,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Logs')
            },
            {
              title: 'Pause All',
              description: 'Stop automations',
              icon: Pause,
              gradient: 'from-yellow-500 to-orange-600',
              onClick: () => console.log('Pause all')
            },
            {
              title: 'Webhooks',
              description: 'Manage endpoints',
              icon: Webhook,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Webhooks')
            },
            {
              title: 'Integrations',
              description: 'Connect services',
              icon: GitBranch,
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
              title: 'Error Alerts',
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
              label="All Automations"
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
              label="Error"
              isActive={viewMode === 'error'}
              onClick={() => setViewMode('error')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <PillButton
              label="Scheduled"
              isActive={typeFilter === 'scheduled'}
              onClick={() => setTypeFilter('scheduled')}
            />
            <PillButton
              label="Trigger-Based"
              isActive={typeFilter === 'trigger-based'}
              onClick={() => setTypeFilter('trigger-based')}
            />
            <PillButton
              label="Event-Driven"
              isActive={typeFilter === 'event-driven'}
              onClick={() => setTypeFilter('event-driven')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Automations List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAutomations.map((automation) => (
              <div
                key={automation.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-slate-900">{automation.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{automation.description}</p>
                    <p className="text-xs text-slate-500">ID: {automation.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(automation.status)}`}>
                      {automation.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(automation.type)}`}>
                      {automation.type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Trigger</p>
                    <div className="flex items-center gap-2">
                      {getTriggerIcon(automation.trigger)}
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {automation.trigger.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Created By</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{automation.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Action Steps</p>
                  <div className="flex flex-wrap gap-2">
                    {automation.actions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          {idx + 1}. {action}
                        </span>
                        {idx < automation.actions.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Last Run</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{automation.lastRun}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Next Run</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{automation.nextRun}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Runs</p>
                    <p className="text-sm font-medium text-slate-900">
                      {automation.totalRuns.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Avg Duration</p>
                    <p className="text-sm font-medium text-slate-900">{automation.avgDuration}s</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Successful</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {automation.successfulRuns.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Failed</p>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        {automation.failedRuns.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Success Rate</p>
                    <p className="text-sm font-medium text-slate-900">{automation.successRate}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Reliability</span>
                    <span className="text-xs font-medium text-slate-900">{automation.successRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                      style={{ width: `${automation.successRate}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all">
                    {automation.status === 'active' ? 'Edit' : 'Activate'}
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    View Logs
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    {automation.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Active Automations */}
            <MiniKPI
              label="Active Automations"
              value={activeAutomations.toString()}
              icon={Play}
              trend={{ value: 8, isPositive: true }}
              className="bg-gradient-to-br from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Executions"
              activities={[
                {
                  id: '1',
                  title: 'Invoice payment processed',
                  description: 'Completed in 8s',
                  timestamp: '2 minutes ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'New user onboarding triggered',
                  description: 'Welcome email sent',
                  timestamp: '15 minutes ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Social media post failed',
                  description: 'API authentication error',
                  timestamp: '1 hour ago',
                  type: 'error'
                },
                {
                  id: '4',
                  title: 'Daily report generated',
                  description: 'Sent to 12 recipients',
                  timestamp: '2 hours ago',
                  type: 'success'
                }
              ]}
            />

            {/* Top Automations */}
            <RankingList
              title="Most Active"
              items={[
                { label: 'Invoice Processing', value: '4,567', rank: 1 },
                { label: 'User Onboarding', value: '2,847', rank: 2 },
                { label: 'Cart Recovery', value: '1,234', rank: 3 },
                { label: 'Daily Reports', value: '847', rank: 4 },
                { label: 'Social Posting', value: '567', rank: 5 }
              ]}
            />

            {/* Success Rate */}
            <ProgressCard
              title="Overall Success Rate"
              progress={98}
              subtitle="Across all automations"
              color="purple"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
