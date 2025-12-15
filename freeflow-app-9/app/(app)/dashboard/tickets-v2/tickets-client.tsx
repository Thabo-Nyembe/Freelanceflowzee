'use client'

import { useState } from 'react'
import { useTickets, useTicketMutations, SupportTicket } from '@/lib/hooks/use-tickets'
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
  Zap,
  Award,
  TrendingUp
} from 'lucide-react'

interface TicketsClientProps {
  initialTickets: SupportTicket[]
}

type TicketStatus = 'all' | 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed'
type TicketPriority = 'all' | 'low' | 'normal' | 'high' | 'urgent'

export default function TicketsClient({ initialTickets }: TicketsClientProps) {
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('all')
  const [priority, setPriority] = useState<TicketPriority>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { tickets, stats, isLoading } = useTickets(initialTickets, {
    status: ticketStatus === 'all' ? undefined : ticketStatus,
    priority: priority === 'all' ? undefined : priority
  })
  const { createTicket, isCreating } = useTicketMutations()

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Open' }
      case 'in-progress':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'In Progress' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' }
      case 'resolved':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Resolved' }
      case 'closed':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, label: 'Closed' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Ticket, label: status }
    }
  }

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSLABadge = (sla: string) => {
    switch (sla) {
      case 'at_risk': return 'bg-red-100 text-red-800 border-red-200'
      case 'on_track': return 'bg-green-100 text-green-800 border-green-200'
      case 'met': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'breached': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Ticket className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-green-600">-12.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            <p className="text-sm text-gray-500">Open Tickets</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">-18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">2.4h</p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+8.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</p>
            <p className="text-sm text-gray-500">Resolution Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+12.5%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">4.8/5</p>
            <p className="text-sm text-gray-500">CSAT Score</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'open', 'in-progress', 'pending', 'resolved', 'closed'] as TicketStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTicketStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      ticketStatus === s
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Tickets' : s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'low', 'normal', 'high', 'urgent'] as TicketPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      priority === p
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Tickets</h2>
              <div className="text-sm text-gray-600">{filteredTickets.length} tickets</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No tickets found</div>
            ) : (
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
                              <span className="text-sm text-gray-500">{ticket.ticket_number}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{ticket.category || 'General'}</span>
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

                      <p className="text-sm text-gray-600 mb-4">{ticket.description || 'No description'}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Customer</div>
                          <div className="font-medium text-gray-900 text-sm">{ticket.customer_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{ticket.customer_email || ''}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Assigned To</div>
                          <div className="font-medium text-gray-900 text-sm">{ticket.assigned_name || 'Unassigned'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Created</div>
                          <div className="font-medium text-gray-900 text-sm">{new Date(ticket.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                          <div className="font-medium text-gray-900 text-sm">{new Date(ticket.updated_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.message_count} messages
                          </div>
                          {ticket.attachment_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {ticket.attachment_count} files
                            </div>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getSLABadge(ticket.sla_status)}`}>
                          SLA: {ticket.sla_status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Resolution Rate Goal</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</span>
                  <span className="text-sm text-gray-500">of 95% target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                    style={{ width: `${stats.total > 0 ? Math.min((stats.resolved / stats.total) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Ticket Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Open</span>
                  <span className="font-semibold">{stats.open}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-semibold">{stats.resolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Urgent</span>
                  <span className="font-semibold text-red-600">{stats.urgent}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
