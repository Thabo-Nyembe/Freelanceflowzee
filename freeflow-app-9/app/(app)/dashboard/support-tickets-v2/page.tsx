'use client'

import { useState } from 'react'
import {
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  User,
  Mail,
  MessageSquare,
  AlertTriangle,
  Tag,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Send,
  Archive,
  Star,
  Users,
  Zap
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketCategory = 'technical' | 'billing' | 'feature-request' | 'bug' | 'general' | 'account'

interface SupportTicket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  customer: string
  email: string
  assignedTo: string
  createdAt: string
  updatedAt: string
  resolvedAt: string
  responseTime: number
  resolutionTime: number
  satisfactionScore: number
  tags: string[]
  replies: number
}

export default function SupportTicketsPage() {
  const [viewMode, setViewMode] = useState<'all' | TicketStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all')

  const tickets: SupportTicket[] = [
    {
      id: 'TKT-2847',
      subject: 'Unable to export data to CSV',
      description: 'Export function throws an error when trying to download large datasets',
      status: 'open',
      priority: 'high',
      category: 'technical',
      customer: 'John Doe',
      email: 'john.doe@example.com',
      assignedTo: 'Tech Support Team',
      createdAt: '2024-01-15 14:30',
      updatedAt: '2024-01-15 14:35',
      resolvedAt: '',
      responseTime: 5,
      resolutionTime: 0,
      satisfactionScore: 0,
      tags: ['export', 'csv', 'data'],
      replies: 2
    },
    {
      id: 'TKT-2848',
      subject: 'Billing discrepancy on last invoice',
      description: 'Charged twice for the same subscription period',
      status: 'in-progress',
      priority: 'urgent',
      category: 'billing',
      customer: 'Jane Smith',
      email: 'jane.smith@example.com',
      assignedTo: 'Billing Team',
      createdAt: '2024-01-15 13:00',
      updatedAt: '2024-01-15 13:45',
      resolvedAt: '',
      responseTime: 15,
      resolutionTime: 0,
      satisfactionScore: 0,
      tags: ['billing', 'refund', 'subscription'],
      replies: 4
    },
    {
      id: 'TKT-2849',
      subject: 'Request for API rate limit increase',
      description: 'Need higher rate limits for production deployment',
      status: 'waiting',
      priority: 'medium',
      category: 'feature-request',
      customer: 'Mike Johnson',
      email: 'mike.j@example.com',
      assignedTo: 'Product Team',
      createdAt: '2024-01-15 10:00',
      updatedAt: '2024-01-15 11:30',
      resolvedAt: '',
      responseTime: 30,
      resolutionTime: 0,
      satisfactionScore: 0,
      tags: ['api', 'rate-limit', 'upgrade'],
      replies: 3
    },
    {
      id: 'TKT-2850',
      subject: 'Dashboard not loading on mobile',
      description: 'Mobile app shows blank screen when opening dashboard',
      status: 'resolved',
      priority: 'high',
      category: 'bug',
      customer: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      assignedTo: 'Mobile Team',
      createdAt: '2024-01-14 16:00',
      updatedAt: '2024-01-15 09:00',
      resolvedAt: '2024-01-15 09:00',
      responseTime: 45,
      resolutionTime: 1020,
      satisfactionScore: 5,
      tags: ['mobile', 'dashboard', 'bug'],
      replies: 6
    },
    {
      id: 'TKT-2851',
      subject: 'How to reset password?',
      description: 'Cannot find password reset option in settings',
      status: 'closed',
      priority: 'low',
      category: 'general',
      customer: 'Tom Wilson',
      email: 'tom.w@example.com',
      assignedTo: 'Support Team',
      createdAt: '2024-01-14 09:00',
      updatedAt: '2024-01-14 09:15',
      resolvedAt: '2024-01-14 09:15',
      responseTime: 10,
      resolutionTime: 15,
      satisfactionScore: 4,
      tags: ['account', 'password', 'help'],
      replies: 2
    },
    {
      id: 'TKT-2852',
      subject: 'Account upgrade not reflecting',
      description: 'Upgraded to Pro plan but still showing Free tier features',
      status: 'in-progress',
      priority: 'high',
      category: 'account',
      customer: 'Emma Davis',
      email: 'emma.d@example.com',
      assignedTo: 'Account Team',
      createdAt: '2024-01-15 11:00',
      updatedAt: '2024-01-15 12:30',
      resolvedAt: '',
      responseTime: 20,
      resolutionTime: 0,
      satisfactionScore: 0,
      tags: ['upgrade', 'account', 'plan'],
      replies: 5
    }
  ]

  const filteredTickets = tickets.filter(ticket => {
    if (viewMode !== 'all' && ticket.status !== viewMode) return false
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false
    return true
  })

  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status === 'open').length
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length
  const avgResponseTime = tickets.reduce((sum, t) => sum + t.responseTime, 0) / tickets.length

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50'
      case 'in-progress': return 'text-orange-600 bg-orange-50'
      case 'waiting': return 'text-yellow-600 bg-yellow-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'urgent': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'technical': return <Zap className="w-4 h-4" />
      case 'billing': return <Mail className="w-4 h-4" />
      case 'feature-request': return <Star className="w-4 h-4" />
      case 'bug': return <AlertTriangle className="w-4 h-4" />
      case 'general': return <MessageSquare className="w-4 h-4" />
      case 'account': return <User className="w-4 h-4" />
      default: return <Ticket className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-900 via-cyan-800 to-sky-900 bg-clip-text text-transparent mb-2">
            Support Tickets
          </h1>
          <p className="text-slate-600">Manage customer support requests and track resolutions</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Tickets',
              value: totalTickets.toString(),
              icon: Ticket,
              trend: { value: 12, isPositive: true },
              color: 'teal'
            },
            {
              label: 'Open',
              value: openTickets.toString(),
              icon: Clock,
              trend: { value: 5, isPositive: false },
              color: 'blue'
            },
            {
              label: 'Resolved',
              value: resolvedTickets.toString(),
              icon: CheckCircle2,
              trend: { value: 18, isPositive: true },
              color: 'green'
            },
            {
              label: 'Avg Response',
              value: `${avgResponseTime.toFixed(0)}m`,
              icon: Activity,
              trend: { value: 8, isPositive: true },
              color: 'cyan'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Ticket',
              description: 'Create ticket',
              icon: Ticket,
              gradient: 'from-teal-500 to-cyan-600',
              onClick: () => console.log('New ticket')
            },
            {
              title: 'View Open',
              description: 'Active tickets',
              icon: Clock,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Open')
            },
            {
              title: 'Analytics',
              description: 'View metrics',
              icon: BarChart3,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Assign',
              description: 'Manage teams',
              icon: Users,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Assign')
            },
            {
              title: 'Bulk Actions',
              description: 'Mass update',
              icon: Archive,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Bulk')
            },
            {
              title: 'Templates',
              description: 'Quick replies',
              icon: Send,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Templates')
            },
            {
              title: 'Settings',
              description: 'Configure',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Search',
              description: 'Find tickets',
              icon: Search,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Search')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Tickets"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Open"
              isActive={viewMode === 'open'}
              onClick={() => setViewMode('open')}
            />
            <PillButton
              label="In Progress"
              isActive={viewMode === 'in-progress'}
              onClick={() => setViewMode('in-progress')}
            />
            <PillButton
              label="Resolved"
              isActive={viewMode === 'resolved'}
              onClick={() => setViewMode('resolved')}
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

          {/* Tickets List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getCategoryIcon(ticket.category)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                      <p className="text-xs text-slate-500">Ticket ID: {ticket.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Customer</p>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{ticket.customer}</span>
                    </div>
                    <p className="text-xs text-slate-500 ml-5">{ticket.email}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{ticket.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Created</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{ticket.createdAt}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Response Time</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{ticket.responseTime}m</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Replies</p>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{ticket.replies}</span>
                    </div>
                  </div>
                </div>

                {ticket.satisfactionScore > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Customer Satisfaction</p>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < ticket.satisfactionScore ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-sm text-slate-600 ml-1">{ticket.satisfactionScore}/5</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-cyan-700 transition-all">
                    View Thread
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Reply
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Open Tickets */}
            <MiniKPI
              label="Open Tickets"
              value={openTickets.toString()}
              icon={Clock}
              trend={{ value: 5, isPositive: false }}
              className="bg-gradient-to-br from-teal-500 to-cyan-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Updates"
              activities={[
                {
                  id: '1',
                  title: 'New ticket created',
                  description: 'Export data issue',
                  timestamp: '5 minutes ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'Ticket resolved',
                  description: 'Mobile dashboard fixed',
                  timestamp: '1 hour ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Priority escalated',
                  description: 'Billing discrepancy',
                  timestamp: '2 hours ago',
                  type: 'warning'
                },
                {
                  id: '4',
                  title: 'Ticket closed',
                  description: 'Password reset help',
                  timestamp: '1 day ago',
                  type: 'success'
                }
              ]}
            />

            {/* Category Distribution */}
            <RankingList
              title="By Category"
              items={[
                { label: 'Technical', value: '35%', rank: 1 },
                { label: 'Billing', value: '25%', rank: 2 },
                { label: 'Bug Reports', value: '18%', rank: 3 },
                { label: 'Features', value: '12%', rank: 4 },
                { label: 'General', value: '10%', rank: 5 }
              ]}
            />

            {/* Resolution Rate */}
            <ProgressCard
              title="Resolution Rate"
              progress={78}
              subtitle="Within SLA targets"
              color="teal"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
