'use client'

import { useState } from 'react'
import { useSupportTickets, useTicketReplies, SupportTicket, SupportStats } from '@/lib/hooks/use-support-tickets'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Headphones,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
  Search,
  Mail,
  Phone,
  Zap,
  Plus,
  Loader2
} from 'lucide-react'

interface SupportClientProps {
  initialTickets: SupportTicket[]
  initialStats: SupportStats
}

export default function SupportClient({ initialTickets, initialStats }: SupportClientProps) {
  const {
    tickets,
    loading,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    reopenTicket,
    getStats
  } = useSupportTickets()

  const [selectedPriority, setSelectedPriority] = useState<'all' | 'urgent' | 'high' | 'normal'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false)

  // Use real-time data if available, otherwise initial data
  const displayTickets = tickets.length > 0 ? tickets : initialTickets
  const stats = tickets.length > 0 ? getStats() : initialStats

  // Filter tickets
  const filteredTickets = displayTickets.filter(ticket => {
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority
    const matchesSearch = !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPriority && matchesSearch
  })

  const supportChannels = [
    { channel: 'Email', tickets: 456, avgTime: '3.2h', satisfaction: 4.7, color: 'from-blue-500 to-cyan-500' },
    { channel: 'Live Chat', tickets: 342, avgTime: '1.8h', satisfaction: 4.9, color: 'from-green-500 to-emerald-500' },
    { channel: 'Phone', tickets: 124, avgTime: '0.5h', satisfaction: 4.8, color: 'from-purple-500 to-pink-500' },
    { channel: 'Self-Service', tickets: 847, avgTime: '0.2h', satisfaction: 4.6, color: 'from-orange-500 to-red-500' }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Ticket resolved', description: 'Recent ticket marked as resolved', time: '10 minutes ago', status: 'success' as const },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'New ticket created', description: 'Customer submitted new ticket', time: '2 hours ago', status: 'info' as const },
    { icon: <Award className="w-5 h-5" />, title: 'High satisfaction', description: 'Customer rated 5 stars', time: '3 hours ago', status: 'success' as const },
    { icon: <AlertCircle className="w-5 h-5" />, title: 'SLA warning', description: 'Ticket approaching deadline', time: '5 hours ago', status: 'warning' as const }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'normal': return 'bg-blue-100 text-blue-700'
      case 'low': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-purple-100 text-purple-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleCreateTicket = async () => {
    try {
      await createTicket({
        subject: 'New Support Ticket',
        description: 'Ticket description',
        category: 'general',
        priority: 'normal',
        status: 'open',
        channel: 'self_service',
        tags: [],
        metadata: {}
      })
      setShowNewTicketDialog(false)
    } catch (error) {
      console.error('Failed to create ticket:', error)
    }
  }

  const statItems = [
    { label: 'Open Tickets', value: stats.open.toString(), change: -12.5, icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'Avg Response Time', value: `${stats.avgResponseTime}h`, change: -18.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Resolution Rate', value: `${Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}%`, change: 8.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'CSAT Score', value: stats.satisfactionRate.toFixed(1), change: 12.5, icon: <Award className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Headphones className="w-10 h-10 text-teal-600" />
              Support Center
            </h1>
            <p className="text-muted-foreground">Manage customer support and service quality</p>
          </div>
          <GradientButton from="teal" to="cyan" onClick={handleCreateTicket}>
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            New Ticket
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<MessageSquare />} title="Tickets" description={`${stats.total} total`} onClick={() => {}} />
          <BentoQuickAction icon={<Users />} title="Team" description="Agents" onClick={() => {}} />
          <BentoQuickAction icon={<Award />} title="Satisfaction" description="Feedback" onClick={() => {}} />
          <BentoQuickAction icon={<TrendingUp />} title="Analytics" description="Reports" onClick={() => {}} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PillButton variant={selectedPriority === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedPriority('all')}>
              All Priorities
            </PillButton>
            <PillButton variant={selectedPriority === 'urgent' ? 'primary' : 'ghost'} onClick={() => setSelectedPriority('urgent')}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Urgent ({displayTickets.filter(t => t.priority === 'urgent').length})
            </PillButton>
            <PillButton variant={selectedPriority === 'high' ? 'primary' : 'ghost'} onClick={() => setSelectedPriority('high')}>
              High
            </PillButton>
            <PillButton variant={selectedPriority === 'normal' ? 'primary' : 'ghost'} onClick={() => setSelectedPriority('normal')}>
              Normal
            </PillButton>
          </div>
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Support Tickets ({filteredTickets.length})</h3>
              {loading && filteredTickets.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{ticket.ticket_code || ticket.id.slice(0, 8)}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{ticket.subject}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {ticket.customer_name || 'Unknown'}
                            </span>
                            <span>{ticket.category}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Channel: <span className="font-semibold">{ticket.channel}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => {}}>
                            View
                          </ModernButton>
                          {ticket.status === 'open' && (
                            <ModernButton
                              variant="outline"
                              size="sm"
                              onClick={() => resolveTicket(ticket.id, 'Resolved via dashboard')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolve
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Support Channels</h3>
              <div className="space-y-4">
                {supportChannels.map((channel) => (
                  <div key={channel.channel} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${channel.color} flex items-center justify-center text-white`}>
                          {channel.channel === 'Email' && <Mail className="w-5 h-5" />}
                          {channel.channel === 'Live Chat' && <MessageSquare className="w-5 h-5" />}
                          {channel.channel === 'Phone' && <Phone className="w-5 h-5" />}
                          {channel.channel === 'Self-Service' && <Search className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{channel.channel}</h4>
                          <p className="text-xs text-muted-foreground">{channel.tickets} tickets</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{channel.satisfaction}/5</p>
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Avg Response</p>
                        <p className="font-semibold">{channel.avgTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-semibold">{channel.tickets} tickets</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Response Time Goal"
              current={stats.avgResponseTime}
              goal={2.0}
              unit="h"
              icon={<Clock className="w-5 h-5" />}
            />

            <ProgressCard
              title="Resolution Goal"
              current={Math.round((stats.resolved / Math.max(stats.total, 1)) * 100)}
              goal={95}
              unit="%"
              icon={<CheckCircle className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg First Response" value="1.8h" change={-15.3} />
                <MiniKPI label="Tickets per Agent" value="28" change={8.2} />
                <MiniKPI label="Reopen Rate" value="4.2%" change={-12.5} />
                <MiniKPI label="SLA Compliance" value="96%" change={5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
