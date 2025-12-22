'use client'

import { useState } from 'react'
import { useCustomerSupport, SupportAgent, SupportConversation, CustomerSupportStats } from '@/lib/hooks/use-customer-support'
import { createSupportAgent, deleteSupportAgent, setAgentStatus, createConversation, closeConversation, assignConversation } from '@/app/actions/customer-support'

type AgentStatus = 'online' | 'busy' | 'away' | 'offline'
type ConversationType = 'chat' | 'email' | 'phone' | 'video'

interface CustomerSupportClientProps {
  initialAgents: SupportAgent[]
  initialConversations: SupportConversation[]
  initialStats: CustomerSupportStats
}

export default function CustomerSupportClient({ initialAgents, initialConversations, initialStats }: CustomerSupportClientProps) {
  const { agents, conversations, stats } = useCustomerSupport(initialAgents, initialConversations, initialStats)
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all')
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [agentForm, setAgentForm] = useState({ name: '', email: '', availability: '' })
  const [convForm, setConvForm] = useState({ customer_name: '', customer_email: '', subject: '', conversation_type: 'chat' as ConversationType, priority: 'medium' as const })

  const filteredAgents = agents.filter(a => statusFilter === 'all' || a.status === statusFilter)

  const statsDisplay = [
    { label: 'Total Agents', value: stats.totalAgents.toString(), trend: '+8%' },
    { label: 'Online Now', value: stats.onlineAgents.toString(), trend: '+2' },
    { label: 'Active Chats', value: stats.totalActiveConversations.toString(), trend: '+15%' },
    { label: 'Avg Satisfaction', value: stats.avgSatisfaction.toFixed(1), trend: '+3.2%' }
  ]

  const handleCreateAgent = async () => {
    try {
      await createSupportAgent(agentForm)
      setShowAgentModal(false)
      setAgentForm({ name: '', email: '', availability: '' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleCreateConversation = async () => {
    try {
      await createConversation(convForm)
      setShowConversationModal(false)
      setConvForm({ customer_name: '', customer_email: '', subject: '', conversation_type: 'chat', priority: 'medium' })
    } catch (error) {
      console.error('Failed to create:', error)
    }
  }

  const handleDeleteAgent = async (id: string) => { if (confirm('Delete agent?')) await deleteSupportAgent(id) }
  const handleSetStatus = async (id: string, status: AgentStatus) => { await setAgentStatus(id, status) }
  const handleCloseConversation = async (id: string) => { await closeConversation(id) }

  const getStatusColor = (s: AgentStatus) => ({ online: 'bg-green-100 text-green-700', busy: 'bg-orange-100 text-orange-700', away: 'bg-yellow-100 text-yellow-700', offline: 'bg-gray-100 text-gray-700' }[s] || 'bg-gray-100 text-gray-700')
  const getConvStatusColor = (s: string) => ({ active: 'bg-green-100 text-green-700', waiting: 'bg-yellow-100 text-yellow-700', closed: 'bg-gray-100 text-gray-700' }[s] || 'bg-gray-100 text-gray-700')
  const getConvTypeIcon = (t: ConversationType) => ({ chat: '💬', email: '📧', phone: '📞', video: '📹' }[t] || '💬')

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 bg-clip-text text-transparent">Customer Support</h1>
            <p className="text-gray-600 mt-1">Monitor support team performance and customer interactions</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowConversationModal(true)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-slate-800">New Conversation</button>
            <button onClick={() => setShowAgentModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 text-white rounded-lg">Add Agent</button>
          </div>
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

        <div className="flex gap-2">
          {(['all', 'online', 'busy', 'away', 'offline'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}>
              {s === 'all' ? 'All Agents' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Support Agents ({filteredAgents.length})</h2>
              {filteredAgents.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <p className="text-gray-500 mb-4">No agents found</p>
                  <button onClick={() => setShowAgentModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Add First Agent</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAgents.map(agent => (
                    <div key={agent.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">{agent.name.charAt(0)}</div>
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-gray-600">{agent.email}</p>
                            {agent.availability && <p className="text-xs text-gray-500 mt-1">{agent.availability}</p>}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>{agent.status}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                        <div><span className="text-gray-500 text-xs">Active</span><p className="font-semibold text-lg">{agent.active_conversations}</p></div>
                        <div><span className="text-gray-500 text-xs">Total</span><p className="font-semibold text-lg">{agent.total_conversations}</p></div>
                        <div><span className="text-gray-500 text-xs">Resolved Today</span><p className="font-semibold text-lg text-green-600">{agent.resolved_today}</p></div>
                        <div><span className="text-gray-500 text-xs">Response Time</span><p className="font-semibold text-lg">{agent.avg_response_time}s</p></div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Customer Satisfaction</span>
                          <span className="text-xs font-medium">{agent.satisfaction_score}/5.0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-lg ${i < Math.floor(agent.satisfaction_score) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <select onChange={e => handleSetStatus(agent.id, e.target.value as AgentStatus)} value={agent.status} className="flex-1 px-3 py-1.5 border rounded text-xs">
                          <option value="online">Online</option>
                          <option value="busy">Busy</option>
                          <option value="away">Away</option>
                          <option value="offline">Offline</option>
                        </select>
                        <button onClick={() => handleDeleteAgent(agent.id)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-medium">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Active Conversations ({conversations.filter(c => c.status !== 'closed').length})</h2>
              <div className="space-y-4">
                {conversations.filter(c => c.status !== 'closed').map(conv => (
                  <div key={conv.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getConvTypeIcon(conv.conversation_type)}</span>
                        <div>
                          <h4 className="font-semibold">{conv.subject || 'No subject'}</h4>
                          <p className="text-sm text-gray-600">{conv.customer_name}</p>
                          <p className="text-xs text-gray-500">{conv.customer_email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConvStatusColor(conv.status)}`}>{conv.status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div><span className="text-gray-500 text-xs">Messages</span><p className="font-semibold">{conv.messages_count}</p></div>
                      <div><span className="text-gray-500 text-xs">Wait Time</span><p className="font-semibold">{conv.wait_time}m</p></div>
                      <div><span className="text-gray-500 text-xs">Priority</span><p className={`font-semibold ${conv.priority === 'high' ? 'text-red-600' : conv.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'}`}>{conv.priority}</p></div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <button className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">Join</button>
                      <button onClick={() => handleCloseConversation(conv.id)} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium">Close</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Online</span><span className="font-semibold text-green-600">{stats.onlineAgents}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Busy</span><span className="font-semibold text-orange-600">{stats.busyAgents}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Resolved Today</span><span className="font-semibold">{stats.resolvedToday}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Avg CSAT</span><span className="font-semibold">{stats.avgSatisfaction.toFixed(1)}/5</span></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Team Performance</h3>
              <p className="text-4xl font-bold">{((stats.avgSatisfaction / 5) * 100).toFixed(0)}%</p>
              <p className="text-sm opacity-80 mt-1">Overall satisfaction score</p>
            </div>
          </div>
        </div>

        {showAgentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Add Support Agent</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={agentForm.email} onChange={e => setAgentForm({...agentForm, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Availability</label><input type="text" value={agentForm.availability} onChange={e => setAgentForm({...agentForm, availability: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="9:00 AM - 5:00 PM EST" /></div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowAgentModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreateAgent} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Add Agent</button></div>
            </div>
          </div>
        )}

        {showConversationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold mb-4">New Conversation</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Customer Name</label><input type="text" value={convForm.customer_name} onChange={e => setConvForm({...convForm, customer_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={convForm.customer_email} onChange={e => setConvForm({...convForm, customer_email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Subject</label><input type="text" value={convForm.subject} onChange={e => setConvForm({...convForm, subject: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Type</label><select value={convForm.conversation_type} onChange={e => setConvForm({...convForm, conversation_type: e.target.value as ConversationType})} className="w-full px-3 py-2 border rounded-lg"><option value="chat">Chat</option><option value="email">Email</option><option value="phone">Phone</option><option value="video">Video</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Priority</label><select value={convForm.priority} onChange={e => setConvForm({...convForm, priority: e.target.value as 'low' | 'medium' | 'high'})} className="w-full px-3 py-2 border rounded-lg"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                </div>
              </div>
              <div className="flex gap-3 mt-6"><button onClick={() => setShowConversationModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCreateConversation} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Create</button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
