'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SupportAgent {
  id: string
  user_id: string
  name: string
  email: string | null
  status: 'online' | 'busy' | 'away' | 'offline'
  active_conversations: number
  total_conversations: number
  avg_response_time: number
  satisfaction_score: number
  resolved_today: number
  availability: string | null
  specializations: string[]
  created_at: string
  updated_at: string
}

export interface SupportConversation {
  id: string
  user_id: string
  agent_id: string | null
  customer_name: string
  customer_email: string | null
  conversation_type: 'chat' | 'email' | 'phone' | 'video'
  status: 'active' | 'waiting' | 'closed'
  subject: string | null
  priority: 'low' | 'medium' | 'high'
  wait_time: number
  messages_count: number
  started_at: string
  last_message_at: string | null
  closed_at: string | null
  satisfaction_rating: number | null
  created_at: string
  updated_at: string
}

export interface CustomerSupportStats {
  totalAgents: number
  onlineAgents: number
  busyAgents: number
  totalActiveConversations: number
  avgSatisfaction: number
  resolvedToday: number
}

export function useCustomerSupport(
  initialAgents: SupportAgent[],
  initialConversations: SupportConversation[],
  initialStats: CustomerSupportStats
) {
  const [agents, setAgents] = useState<SupportAgent[]>(initialAgents)
  const [conversations, setConversations] = useState<SupportConversation[]>(initialConversations)
  const [stats, setStats] = useState<CustomerSupportStats>(initialStats)
  const supabase = createClient()

  useEffect(() => {
    const agentsChannel = supabase
      .channel('support_agents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_agents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAgents(prev => [payload.new as SupportAgent, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setAgents(prev => prev.map(a => a.id === payload.new.id ? payload.new as SupportAgent : a))
        } else if (payload.eventType === 'DELETE') {
          setAgents(prev => prev.filter(a => a.id !== payload.old.id))
        }
      })
      .subscribe()

    const conversationsChannel = supabase
      .channel('support_conversations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_conversations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [payload.new as SupportConversation, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev => prev.map(c => c.id === payload.new.id ? payload.new as SupportConversation : c))
        } else if (payload.eventType === 'DELETE') {
          setConversations(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(agentsChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }, [supabase])

  useEffect(() => {
    const onlineAgents = agents.filter(a => a.status === 'online').length
    const busyAgents = agents.filter(a => a.status === 'busy').length
    const totalActiveConversations = agents.reduce((sum, a) => sum + (a.active_conversations || 0), 0)
    const avgSatisfaction = agents.length > 0
      ? agents.reduce((sum, a) => sum + (a.satisfaction_score || 0), 0) / agents.length
      : 0
    const resolvedToday = agents.reduce((sum, a) => sum + (a.resolved_today || 0), 0)

    setStats({
      totalAgents: agents.length,
      onlineAgents,
      busyAgents,
      totalActiveConversations,
      avgSatisfaction,
      resolvedToday
    })
  }, [agents, conversations])

  return { agents, conversations, stats }
}
