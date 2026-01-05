'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'closed'
export type ConversationChannel = 'chat' | 'email' | 'phone' | 'social' | 'widget'
export type AgentStatus = 'online' | 'away' | 'busy' | 'offline'

export interface SupportConversation {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerAvatar?: string
  subject: string
  status: ConversationStatus
  channel: ConversationChannel
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedAgentId?: string
  assignedAgentName?: string
  department?: string
  tags: string[]
  messages: SupportMessage[]
  satisfaction?: number
  firstResponseTime?: number
  resolutionTime?: number
  isRead: boolean
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export interface SupportMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: 'customer' | 'agent' | 'system'
  content: string
  attachments: MessageAttachment[]
  isRead: boolean
  createdAt: string
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface SupportAgent {
  id: string
  name: string
  email: string
  avatar?: string
  status: AgentStatus
  department: string
  activeConversations: number
  maxConversations: number
  rating: number
  totalResolved: number
  avgResponseTime: number
  skills: string[]
  isAvailable: boolean
}

export interface CannedResponse {
  id: string
  title: string
  content: string
  category: string
  shortcut?: string
  usageCount: number
  createdBy: string
  createdAt: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  views: number
  helpful: number
  notHelpful: number
}

export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  company?: string
  location?: string
  timezone?: string
  language: string
  totalConversations: number
  totalTickets: number
  satisfaction: number
  notes: string[]
  tags: string[]
  customFields: Record<string, any>
  firstContactAt: string
  lastContactAt: string
}

export interface SupportStats {
  activeConversations: number
  waitingConversations: number
  avgResponseTime: number
  avgResolutionTime: number
  satisfaction: number
  resolutionRate: number
  conversationsToday: number
  resolvedToday: number
  agentsOnline: number
  queueLength: number
  conversationsByChannel: Record<ConversationChannel, number>
  hourlyVolume: { hour: number; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockConversations: SupportConversation[] = [
  {
    id: 'conv-1',
    customerId: 'cust-1',
    customerName: 'Emily Johnson',
    customerEmail: 'emily@example.com',
    customerAvatar: '/avatars/emily.jpg',
    subject: 'Help with payment issue',
    status: 'active',
    channel: 'chat',
    priority: 'high',
    assignedAgentId: 'agent-1',
    assignedAgentName: 'Sarah Miller',
    department: 'Billing',
    tags: ['payment', 'urgent'],
    messages: [
      { id: 'msg-1', conversationId: 'conv-1', senderId: 'cust-1', senderName: 'Emily Johnson', senderType: 'customer', content: 'Hi, I am having trouble with my payment. It keeps failing.', attachments: [], isRead: true, createdAt: '2024-03-20T09:00:00Z' },
      { id: 'msg-2', conversationId: 'conv-1', senderId: 'agent-1', senderName: 'Sarah Miller', senderType: 'agent', content: 'Hello Emily! I am sorry to hear that. Let me look into this for you. Can you tell me which payment method you are using?', attachments: [], isRead: true, createdAt: '2024-03-20T09:02:00Z' },
      { id: 'msg-3', conversationId: 'conv-1', senderId: 'cust-1', senderName: 'Emily Johnson', senderType: 'customer', content: 'I am using my Visa card ending in 4242.', attachments: [], isRead: false, createdAt: '2024-03-20T09:05:00Z' }
    ],
    satisfaction: undefined,
    firstResponseTime: 2,
    isRead: false,
    lastMessageAt: '2024-03-20T09:05:00Z',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T09:05:00Z'
  },
  {
    id: 'conv-2',
    customerId: 'cust-2',
    customerName: 'Michael Brown',
    customerEmail: 'michael@example.com',
    subject: 'Feature question',
    status: 'waiting',
    channel: 'email',
    priority: 'medium',
    department: 'Support',
    tags: ['feature', 'question'],
    messages: [
      { id: 'msg-4', conversationId: 'conv-2', senderId: 'cust-2', senderName: 'Michael Brown', senderType: 'customer', content: 'Does your platform support webhooks? I need to integrate with our CRM.', attachments: [], isRead: true, createdAt: '2024-03-20T08:30:00Z' }
    ],
    isRead: true,
    lastMessageAt: '2024-03-20T08:30:00Z',
    createdAt: '2024-03-20T08:30:00Z',
    updatedAt: '2024-03-20T08:30:00Z'
  },
  {
    id: 'conv-3',
    customerId: 'cust-3',
    customerName: 'Lisa Chen',
    customerEmail: 'lisa@example.com',
    subject: 'Account access issue',
    status: 'resolved',
    channel: 'chat',
    priority: 'high',
    assignedAgentId: 'agent-2',
    assignedAgentName: 'Alex Chen',
    department: 'Technical',
    tags: ['access', 'account'],
    messages: [
      { id: 'msg-5', conversationId: 'conv-3', senderId: 'cust-3', senderName: 'Lisa Chen', senderType: 'customer', content: 'I cannot access my account.', attachments: [], isRead: true, createdAt: '2024-03-19T14:00:00Z' },
      { id: 'msg-6', conversationId: 'conv-3', senderId: 'agent-2', senderName: 'Alex Chen', senderType: 'agent', content: 'I have reset your password. Please check your email.', attachments: [], isRead: true, createdAt: '2024-03-19T14:10:00Z' },
      { id: 'msg-7', conversationId: 'conv-3', senderId: 'cust-3', senderName: 'Lisa Chen', senderType: 'customer', content: 'Thank you! It works now.', attachments: [], isRead: true, createdAt: '2024-03-19T14:15:00Z' }
    ],
    satisfaction: 5,
    firstResponseTime: 10,
    resolutionTime: 15,
    isRead: true,
    lastMessageAt: '2024-03-19T14:15:00Z',
    createdAt: '2024-03-19T14:00:00Z',
    updatedAt: '2024-03-19T14:15:00Z'
  }
]

const mockAgents: SupportAgent[] = [
  { id: 'agent-1', name: 'Sarah Miller', email: 'sarah@company.com', avatar: '/avatars/sarah.jpg', status: 'online', department: 'Billing', activeConversations: 3, maxConversations: 5, rating: 4.8, totalResolved: 1250, avgResponseTime: 1.5, skills: ['billing', 'payments', 'refunds'], isAvailable: true },
  { id: 'agent-2', name: 'Alex Chen', email: 'alex@company.com', avatar: '/avatars/alex.jpg', status: 'online', department: 'Technical', activeConversations: 4, maxConversations: 5, rating: 4.9, totalResolved: 980, avgResponseTime: 2.0, skills: ['technical', 'integration', 'api'], isAvailable: true },
  { id: 'agent-3', name: 'Mike Johnson', email: 'mike@company.com', avatar: '/avatars/mike.jpg', status: 'away', department: 'Support', activeConversations: 0, maxConversations: 5, rating: 4.6, totalResolved: 750, avgResponseTime: 2.5, skills: ['general', 'onboarding'], isAvailable: false }
]

const mockCannedResponses: CannedResponse[] = [
  { id: 'canned-1', title: 'Greeting', content: 'Hello! Thank you for contacting us. How can I help you today?', category: 'General', shortcut: '/greet', usageCount: 1520, createdBy: 'agent-1', createdAt: '2024-01-01' },
  { id: 'canned-2', title: 'Password Reset', content: 'I have sent a password reset link to your email. Please check your inbox and spam folder.', category: 'Account', shortcut: '/pwreset', usageCount: 890, createdBy: 'agent-2', createdAt: '2024-01-15' },
  { id: 'canned-3', title: 'Refund Process', content: 'I have initiated your refund. It will be processed within 5-7 business days.', category: 'Billing', shortcut: '/refund', usageCount: 450, createdBy: 'agent-1', createdAt: '2024-02-01' }
]

const mockStats: SupportStats = {
  activeConversations: 12,
  waitingConversations: 5,
  avgResponseTime: 2.3,
  avgResolutionTime: 8.5,
  satisfaction: 4.7,
  resolutionRate: 94.5,
  conversationsToday: 45,
  resolvedToday: 38,
  agentsOnline: 8,
  queueLength: 5,
  conversationsByChannel: { chat: 25, email: 12, phone: 5, social: 2, widget: 6 },
  hourlyVolume: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 10) + 2 }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseCustomerSupportOptions {
  
}

export function useCustomerSupport(options: UseCustomerSupportOptions = {}) {
  const {  } = options

  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [agents, setAgents] = useState<SupportAgent[]>([])
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([])
  const [currentConversation, setCurrentConversation] = useState<SupportConversation | null>(null)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null)
  const [stats, setStats] = useState<SupportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSupportData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/customer-support')
      const result = await response.json()
      if (result.success) {
        setConversations(Array.isArray(result.conversations) ? result.conversations : [])
        setAgents(Array.isArray(result.agents) ? result.agents : [])
        setCannedResponses(Array.isArray(result.cannedResponses) ? result.cannedResponses : [])
        setStats(result.stats || null)
        return result
      }
      setConversations([])
      return { conversations: [], agents: [], cannedResponses: [] }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch support data'))
      setConversations([])
      return { conversations: [], agents: [], cannedResponses: [] }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const assignConversation = useCallback(async (conversationId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return { success: false, error: 'Agent not found' }

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      assignedAgentId: agentId,
      assignedAgentName: agent.name,
      status: 'active' as const,
      updatedAt: new Date().toISOString()
    } : c))

    return { success: true }
  }, [agents])

  const transferConversation = useCallback(async (conversationId: string, toAgentId: string, note?: string) => {
    const toAgent = agents.find(a => a.id === toAgentId)
    if (!toAgent) return { success: false, error: 'Agent not found' }

    if (note) {
      const systemMessage: SupportMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: 'system',
        senderName: 'System',
        senderType: 'system',
        content: `Conversation transferred to ${toAgent.name}. Note: ${note}`,
        attachments: [],
        isRead: false,
        createdAt: new Date().toISOString()
      }

      setConversations(prev => prev.map(c => c.id === conversationId ? {
        ...c,
        messages: [...c.messages, systemMessage],
        assignedAgentId: toAgentId,
        assignedAgentName: toAgent.name,
        updatedAt: new Date().toISOString()
      } : c))
    } else {
      setConversations(prev => prev.map(c => c.id === conversationId ? {
        ...c,
        assignedAgentId: toAgentId,
        assignedAgentName: toAgent.name,
        updatedAt: new Date().toISOString()
      } : c))
    }

    return { success: true }
  }, [agents])

  const resolveConversation = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      status: 'resolved' as const,
      resolutionTime: Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 60000),
      updatedAt: new Date().toISOString()
    } : c))
    return { success: true }
  }, [])

  const closeConversation = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      status: 'closed' as const,
      updatedAt: new Date().toISOString()
    } : c))
    return { success: true }
  }, [])

  const reopenConversation = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      status: 'active' as const,
      updatedAt: new Date().toISOString()
    } : c))
    return { success: true }
  }, [])

  const markAsRead = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      isRead: true,
      messages: c.messages.map(m => ({ ...m, isRead: true }))
    } : c))
    return { success: true }
  }, [])

  const addTag = useCallback(async (conversationId: string, tag: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId && !c.tags.includes(tag) ? {
      ...c,
      tags: [...c.tags, tag]
    } : c))
    return { success: true }
  }, [])

  const removeTag = useCallback(async (conversationId: string, tag: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      tags: c.tags.filter(t => t !== tag)
    } : c))
    return { success: true }
  }, [])

  const setConversationPriority = useCallback(async (conversationId: string, priority: SupportConversation['priority']) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      priority,
      updatedAt: new Date().toISOString()
    } : c))
    return { success: true }
  }, [])

  const updateAgentStatus = useCallback(async (agentId: string, status: AgentStatus) => {
    setAgents(prev => prev.map(a => a.id === agentId ? {
      ...a,
      status,
      isAvailable: status === 'online'
    } : a))
    return { success: true }
  }, [])

  const createCannedResponse = useCallback(async (data: Partial<CannedResponse>) => {
    const response: CannedResponse = {
      id: `canned-${Date.now()}`,
      title: data.title || '',
      content: data.content || '',
      category: data.category || 'General',
      shortcut: data.shortcut,
      usageCount: 0,
      createdBy: 'agent-1',
      createdAt: new Date().toISOString()
    }
    setCannedResponses(prev => [...prev, response])
    return { success: true, response }
  }, [])

  const useCannedResponse = useCallback((responseId: string) => {
    const response = cannedResponses.find(r => r.id === responseId)
    if (response) {
      setCannedResponses(prev => prev.map(r => r.id === responseId ? { ...r, usageCount: r.usageCount + 1 } : r))
      return response.content
    }
    return null
  }, [cannedResponses])

  const searchConversations = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return conversations.filter(c =>
      c.customerName.toLowerCase().includes(lowerQuery) ||
      c.customerEmail.toLowerCase().includes(lowerQuery) ||
      c.subject.toLowerCase().includes(lowerQuery) ||
      c.messages.some(m => m.content.toLowerCase().includes(lowerQuery))
    )
  }, [conversations])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSupportData()
  }, [fetchSupportData])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activeConversations = useMemo(() => conversations.filter(c => c.status === 'active'), [conversations])
  const waitingConversations = useMemo(() => conversations.filter(c => c.status === 'waiting'), [conversations])
  const resolvedConversations = useMemo(() => conversations.filter(c => c.status === 'resolved'), [conversations])
  const unreadConversations = useMemo(() => conversations.filter(c => !c.isRead), [conversations])
  const myConversations = useMemo(() => conversations.filter(c => c.assignedAgentId === 'agent-1'), [conversations])
  const unassignedConversations = useMemo(() => conversations.filter(c => !c.assignedAgentId && c.status !== 'closed'), [conversations])
  const onlineAgents = useMemo(() => agents.filter(a => a.status === 'online'), [agents])
  const availableAgents = useMemo(() => agents.filter(a => a.isAvailable && a.activeConversations < a.maxConversations), [agents])

  return {
    conversations, agents, cannedResponses, currentConversation, currentCustomer, stats,
    activeConversations, waitingConversations, resolvedConversations, unreadConversations,
    myConversations, unassignedConversations, onlineAgents, availableAgents,
    isLoading, isSending, error,
    refresh, sendMessage, assignConversation, transferConversation,
    resolveConversation, closeConversation, reopenConversation,
    markAsRead, addTag, removeTag, setConversationPriority,
    updateAgentStatus, createCannedResponse, useCannedResponse,
    searchConversations, setCurrentConversation, setCurrentCustomer
  }
}

export default useCustomerSupport
