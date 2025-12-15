'use client'

import { useState } from 'react'
import { useSupportTickets, SupportTicket, SupportStats } from '@/lib/hooks/use-support-tickets'
import { createSupportTicket, deleteSupportTicket, resolveTicket, closeTicket, assignTicket, escalateTicket } from '@/app/actions/support-tickets'

type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketCategory = 'technical' | 'billing' | 'feature-request' | 'bug' | 'general' | 'account'

interface SupportTicketsClientProps {
  initialTickets: SupportTicket[]
  initialStats: SupportStats
}

export default function SupportTicketsClient({ initialTickets, initialStats }: SupportTicketsClientProps) {
  const { tickets, loading, getStats } = useSupportTickets()
  const displayTickets = tickets.length > 0 ? tickets : initialTickets
  const stats = tickets.length > 0 ? getStats() : initialStats

  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    subject: '', description: '', category: 'general' as TicketCategory,
    priority: 'medium' as TicketPriority, customer_name: '', customer_email: ''
  })

  const filteredTickets = displayTickets.filter(t => {
    const ticketStatus = t.status === 'in_progress' ? 'in-progress' : t.status
    if (statusFilter !== 'all' && ticketStatus !== statusFilter) return false
    const ticketPriority = t.priority === 'normal' ? 'medium' : t.priority
    if (priorityFilter !== 'all' && ticketPriority !== priorityFilter) return false
    return true
  })

  const statsDisplay = [
    { label: 'Total Tickets', value: stats.total.toString(), trend: '+12%' },
    { label: 'Open', value: stats.open.toString(), trend: '-5%' },
    { label: 'Resolved', value: stats.resolved.toString(), trend: '+18%' },
    { label: 'Avg Response', value: `${stats.avgResponseTime.toFixed(0)}m`, trend: '+8%' }
  ]

  const handleCreate = async () => {
    try {
      await createSupportTicket(formData)
      setShowCreateModal(false)
      setFormData({ subject: '', description: '', category: 'general', priority: 'medium', customer_name: '', customer_email: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDelete = async (id: string) => { if (confirm('Delete ticket?')) await deleteSupportTicket(id) }
  const handleResolve = async (id: string) => { await resolveTicket(id) }
  const handleClose = async (id: string) => { await closeTicket(id) }
  const handleEscalate = async (id: string) => { await escalateTicket(id) }

  const getStatusColor = (s: string) => {
    const status = s === 'in_progress' ? 'in-progress' : s
    return ({ open: 'bg-blue-100 text-blue-700', 'in-progress': 'bg-orange-100 text-orange-700', waiting: 'bg-yellow-100 text-yellow-700', pending: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700' }[status] || 'bg-gray-100 text-gray-700')
  }

  const getPriorityColor = (p: string) => {
    const priority = p === 'normal' ? 'medium' : p
    return ({ low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[priority] || 'bg-gray-100 text-gray-700')
  }

  const getCategoryIcon = (c: string) => ({ technical: '⚡', billing: '💳', 'feature-request': '⭐', feature: '⭐', bug: '🐛', general: '💬', account: '👤' }[c] || '🎫')

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Manage customer support requests and track resolutions</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white rounded-lg">New Ticket</button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statsDisplay.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <p className="text-sm text-green-600 mt-1">{s.trend}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {(['all', 'open', 'in-progress', 'resolved'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}>
                {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)} className={`px-4 py-2 rounded-full text-sm ${priorityFilter === p ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}>
                {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading && displayTickets.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                <p className="text-gray-500 mb-4">No tickets found</p>
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Create First Ticket</button>
              </div>
            ) : filteredTickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                      <p className="text-xs text-gray-500">ID: {ticket.ticket_code || ticket.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>{ticket.status.replace('_', '-')}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div><span className="text-gray-500 text-xs">Customer</span><p className="font-semibold">{ticket.customer_name || 'N/A'}</p><p className="text-xs text-gray-500">{ticket.customer_email || ''}</p></div>
                  <div><span className="text-gray-500 text-xs">Assigned To</span><p className="font-semibold">{ticket.assigned_to || 'Unassigned'}</p></div>
                </div>

                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ticket.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">#{tag}</span>)}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {ticket.status === 'open' || ticket.status === 'in_progress' ? (
                    <>
                      <button onClick={() => handleResolve(ticket.id)} className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium">Resolve</button>
                      <button onClick={() => handleEscalate(ticket.id)} className="flex-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">Escalate</button>
                    </>
                  ) : (
                    <button onClick={() => handleClose(ticket.id)} className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Close</button>
                  )}
                  <button onClick={() => handleDelete(ticket.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Open</span><span className="font-semibold text-blue-600">{stats.open}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">In Progress</span><span className="font-semibold text-orange-600">{stats.inProgress}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Resolved</span><span className="font-semibold text-green-600">{stats.resolved}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Urgent</span><span className="font-semibold text-red-600">{stats.urgent}</span></div>
              </div>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Support Ticket</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Subject</label><input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as TicketCategory})} className="w-full px-3 py-2 border rounded-lg"><option value="general">General</option><option value="technical">Technical</option><option value="billing">Billing</option><option value="feature-request">Feature Request</option><option value="bug">Bug</option><option value="account">Account</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Priority</label><select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as TicketPriority})} className="w-full px-3 py-2 border rounded-lg"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Customer Name</label><input type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Customer Email</label><input type="email" value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreate} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
