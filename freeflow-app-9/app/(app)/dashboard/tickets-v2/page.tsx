"use client"

import { useState } from 'react'
import {
  Ticket,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  Eye,
  Mail,
  Phone,
  Zap,
  Award,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TicketStatus = 'all' | 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed'
type TicketPriority = 'all' | 'low' | 'normal' | 'high' | 'urgent'

export default function TicketsV2Page() {
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('all')
  const [priority, setPriority] = useState<TicketPriority>('all')

  const stats = [
    {
      label: 'Open Tickets',
      value: '284',
      change: '-12.4%',
      trend: 'down' as const,
      icon: Ticket,
      color: 'text-orange-600'
    },
    {
      label: 'Avg Response Time',
      value: '2.4h',
      change: '-18.2%',
      trend: 'down' as const,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'Resolution Rate',
      value: '94.2%',
      change: '+8.7%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'CSAT Score',
      value: '4.8/5',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Award,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Ticket',
      description: 'Create support ticket',
      icon: Plus,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'View All',
      description: 'Browse all tickets',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Bulk Assign',
      description: 'Assign multiple tickets',
      icon: Users,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Export Report',
      description: 'Download ticket data',
      icon: Download,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Auto-Assign',
      description: 'Enable auto-routing',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'SLA Management',
      description: 'Configure SLA rules',
      icon: Clock,
      color: 'from-red-500 to-orange-500'
    },
    {
      label: 'Team Inbox',
      description: 'Shared team view',
      icon: MessageSquare,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Analytics',
      description: 'Ticket performance',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const tickets = [
    {
      id: 'TICK-2847',
      subject: 'Unable to export project data',
      description: 'Customer reports that the export function is not working for large datasets',
      customer: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      priority: 'urgent',
      status: 'open',
      category: 'Technical',
      assignedTo: 'Michael Chen',
      created: '2024-02-15 14:30',
      updated: '2 hours ago',
      sla: 'At Risk',
      messages: 8,
      attachments: 3
    },
    {
      id: 'TICK-2846',
      subject: 'Billing inquiry - Annual plan upgrade',
      description: 'Customer wants to upgrade from monthly to annual plan',
      customer: 'David Park',
      email: 'david.p@startup.io',
      priority: 'normal',
      status: 'in-progress',
      category: 'Billing',
      assignedTo: 'Emma Wilson',
      created: '2024-02-15 10:15',
      updated: '1 hour ago',
      sla: 'On Track',
      messages: 5,
      attachments: 1
    },
    {
      id: 'TICK-2845',
      subject: 'Feature request: Dark mode support',
      description: 'Customer requesting dark mode theme for better accessibility',
      customer: 'Lisa Anderson',
      email: 'lisa.a@design.co',
      priority: 'normal',
      status: 'pending',
      category: 'Feature Request',
      assignedTo: 'Robert Taylor',
      created: '2024-02-14 16:45',
      updated: '1 day ago',
      sla: 'On Track',
      messages: 12,
      attachments: 2
    },
    {
      id: 'TICK-2844',
      subject: 'Slack integration authentication error',
      description: 'OAuth flow failing when connecting Slack workspace',
      customer: 'James Martinez',
      email: 'james.m@tech.com',
      priority: 'high',
      status: 'open',
      category: 'Integration',
      assignedTo: 'Michael Chen',
      created: '2024-02-14 09:20',
      updated: '4 hours ago',
      sla: 'At Risk',
      messages: 15,
      attachments: 5
    },
    {
      id: 'TICK-2843',
      subject: 'Password reset not working',
      description: 'Customer not receiving password reset emails',
      customer: 'Emily Rodriguez',
      email: 'emily.r@corp.com',
      priority: 'high',
      status: 'in-progress',
      category: 'Account',
      assignedTo: 'Sarah Johnson',
      created: '2024-02-13 14:00',
      updated: '3 hours ago',
      sla: 'On Track',
      messages: 6,
      attachments: 0
    },
    {
      id: 'TICK-2842',
      subject: 'Dashboard loading slowly',
      description: 'Main dashboard taking 10+ seconds to load',
      customer: 'Alex Thompson',
      email: 'alex.t@business.net',
      priority: 'normal',
      status: 'resolved',
      category: 'Performance',
      assignedTo: 'David Park',
      created: '2024-02-12 11:30',
      updated: '2 days ago',
      sla: 'Met',
      messages: 10,
      attachments: 2
    },
    {
      id: 'TICK-2841',
      subject: 'Mobile app crashing on iOS',
      description: 'App crashes when accessing camera feature on iPhone 14',
      customer: 'Maria Garcia',
      email: 'maria.g@mobile.app',
      priority: 'urgent',
      status: 'in-progress',
      category: 'Mobile',
      assignedTo: 'James Martinez',
      created: '2024-02-11 08:45',
      updated: '5 hours ago',
      sla: 'At Risk',
      messages: 20,
      attachments: 8
    },
    {
      id: 'TICK-2840',
      subject: 'API rate limit clarification',
      description: 'Developer needs information about API rate limits',
      customer: 'Chris Lee',
      email: 'chris.l@developer.io',
      priority: 'low',
      status: 'closed',
      category: 'API',
      assignedTo: 'Robert Taylor',
      created: '2024-02-10 15:20',
      updated: '3 days ago',
      sla: 'Met',
      messages: 4,
      attachments: 1
    },
    {
      id: 'TICK-2839',
      subject: 'Data sync failing between devices',
      description: 'Changes on desktop not syncing to mobile app',
      customer: 'Rachel Kim',
      email: 'rachel.k@sync.com',
      priority: 'high',
      status: 'pending',
      category: 'Technical',
      assignedTo: 'Emma Wilson',
      created: '2024-02-09 12:10',
      updated: '6 hours ago',
      sla: 'At Risk',
      messages: 9,
      attachments: 4
    },
    {
      id: 'TICK-2838',
      subject: 'Refund request for unused credits',
      description: 'Customer requesting refund for annual subscription',
      customer: 'Tom Wilson',
      email: 'tom.w@refund.co',
      priority: 'normal',
      status: 'in-progress',
      category: 'Billing',
      assignedTo: 'Sarah Johnson',
      created: '2024-02-08 10:00',
      updated: '1 day ago',
      sla: 'On Track',
      messages: 7,
      attachments: 2
    }
  ]

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = ticketStatus === 'all' || ticket.status === ticketStatus
    const priorityMatch = priority === 'all' || ticket.priority === priority
    return statusMatch && priorityMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle,
          label: 'Open'
        }
      case 'in-progress':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          label: 'In Progress'
        }
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        }
      case 'resolved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Resolved'
        }
      case 'closed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          label: 'Closed'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Ticket,
          label: status
        }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSLABadge = (sla: string) => {
    switch (sla) {
      case 'At Risk':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'On Track':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Met':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const recentActivity = [
    { label: 'Urgent ticket created', time: '2 hours ago', color: 'text-red-600' },
    { label: 'Ticket resolved', time: '3 hours ago', color: 'text-green-600' },
    { label: 'SLA warning triggered', time: '4 hours ago', color: 'text-orange-600' },
    { label: 'Ticket assigned', time: '5 hours ago', color: 'text-blue-600' },
    { label: 'Customer replied', time: '6 hours ago', color: 'text-purple-600' }
  ]

  const ticketCategories = [
    { label: 'Technical', value: '128', color: 'bg-blue-500' },
    { label: 'Billing', value: '84', color: 'bg-green-500' },
    { label: 'Feature Request', value: '47', color: 'bg-purple-500' },
    { label: 'Integration', value: '32', color: 'bg-cyan-500' },
    { label: 'Account', value: '24', color: 'bg-orange-500' }
  ]

  const resolutionProgressData = {
    label: 'Resolution Rate Goal',
    current: 94.2,
    target: 95,
    subtitle: 'Last 30 days'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Support Tickets
            </h1>
            <p className="text-gray-600 mt-2">Manage and track customer support requests</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setTicketStatus('all')}
                  isActive={ticketStatus === 'all'}
                  variant="default"
                >
                  All Tickets
                </PillButton>
                <PillButton
                  onClick={() => setTicketStatus('open')}
                  isActive={ticketStatus === 'open'}
                  variant="default"
                >
                  Open
                </PillButton>
                <PillButton
                  onClick={() => setTicketStatus('in-progress')}
                  isActive={ticketStatus === 'in-progress'}
                  variant="default"
                >
                  In Progress
                </PillButton>
                <PillButton
                  onClick={() => setTicketStatus('pending')}
                  isActive={ticketStatus === 'pending'}
                  variant="default"
                >
                  Pending
                </PillButton>
                <PillButton
                  onClick={() => setTicketStatus('resolved')}
                  isActive={ticketStatus === 'resolved'}
                  variant="default"
                >
                  Resolved
                </PillButton>
                <PillButton
                  onClick={() => setTicketStatus('closed')}
                  isActive={ticketStatus === 'closed'}
                  variant="default"
                >
                  Closed
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setPriority('all')}
                  isActive={priority === 'all'}
                  variant="default"
                >
                  All Priorities
                </PillButton>
                <PillButton
                  onClick={() => setPriority('low')}
                  isActive={priority === 'low'}
                  variant="default"
                >
                  Low
                </PillButton>
                <PillButton
                  onClick={() => setPriority('normal')}
                  isActive={priority === 'normal'}
                  variant="default"
                >
                  Normal
                </PillButton>
                <PillButton
                  onClick={() => setPriority('high')}
                  isActive={priority === 'high'}
                  variant="default"
                >
                  High
                </PillButton>
                <PillButton
                  onClick={() => setPriority('urgent')}
                  isActive={priority === 'urgent'}
                  variant="default"
                >
                  Urgent
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Tickets</h2>
              <div className="text-sm text-gray-600">
                {filteredTickets.length} tickets
              </div>
            </div>

            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const statusBadge = getStatusBadge(ticket.status)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                          <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{ticket.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{ticket.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Customer</div>
                        <div className="font-medium text-gray-900 text-sm">{ticket.customer}</div>
                        <div className="text-xs text-gray-500">{ticket.email}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Assigned To</div>
                        <div className="font-medium text-gray-900 text-sm">{ticket.assignedTo}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Created</div>
                        <div className="font-medium text-gray-900 text-sm">{ticket.created}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                        <div className="font-medium text-gray-900 text-sm">{ticket.updated}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {ticket.messages} messages
                        </div>
                        {ticket.attachments > 0 && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {ticket.attachments} files
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getSLABadge(ticket.sla)}`}>
                        SLA: {ticket.sla}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={resolutionProgressData.label}
              current={resolutionProgressData.current}
              target={resolutionProgressData.target}
              subtitle={resolutionProgressData.subtitle}
            />

            <MiniKPI
              title="First Response Time"
              value="1.8h"
              change="-15.3%"
              trend="down"
              subtitle="Average"
            />

            <RankingList
              title="Tickets by Category"
              items={ticketCategories}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
