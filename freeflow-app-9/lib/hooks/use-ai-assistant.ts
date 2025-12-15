'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface AIConversation {
  id: string
  user_id: string
  conversation_code: string
  title: string
  mode: 'chat' | 'code' | 'creative' | 'analysis'
  model: string
  system_prompt: string | null
  message_count: number
  total_tokens: number
  total_cost: number
  status: 'active' | 'archived' | 'deleted'
  is_archived: boolean
  is_starred: boolean
  context: Record<string, unknown>
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AIMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  model: string | null
  latency_ms: number
  metadata: Record<string, unknown>
  created_at: string
}

interface UseAIAssistantOptions {
  conversationId?: string
  mode?: AIConversation['mode']
  isArchived?: boolean
  isStarred?: boolean
}

interface AIStats {
  totalConversations: number
  activeConversations: number
  archivedConversations: number
  starredConversations: number
  totalMessages: number
  totalTokens: number
  totalCost: number
  avgMessagesPerConversation: number
}

export function useAIAssistant(
  initialConversations: AIConversation[] = [],
  options: UseAIAssistantOptions = {}
) {
  const [conversations, setConversations] = useState<AIConversation[]>(initialConversations)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const stats: AIStats = {
    totalConversations: conversations.length,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    archivedConversations: conversations.filter(c => c.is_archived).length,
    starredConversations: conversations.filter(c => c.is_starred).length,
    totalMessages: conversations.reduce((sum, c) => sum + c.message_count, 0),
    totalTokens: conversations.reduce((sum, c) => sum + c.total_tokens, 0),
    totalCost: conversations.reduce((sum, c) => sum + c.total_cost, 0),
    avgMessagesPerConversation: conversations.length > 0
      ? conversations.reduce((sum, c) => sum + c.message_count, 0) / conversations.length
      : 0
  }

  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('ai_conversations')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (options.mode) {
        query = query.eq('mode', options.mode)
      }
      if (options.isArchived !== undefined) {
        query = query.eq('is_archived', options.isArchived)
      }
      if (options.isStarred !== undefined) {
        query = query.eq('is_starred', options.isStarred)
      }

      const { data, error: fetchError } = await query.limit(50)

      if (fetchError) throw fetchError
      setConversations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.mode, options.isArchived, options.isStarred])

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setMessages(data || [])

      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setActiveConversation(conversation)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, conversations])

  useEffect(() => {
    const conversationChannel = supabase
      .channel('ai_conversations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_conversations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations(prev => [payload.new as AIConversation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setConversations(prev => prev.map(c =>
              c.id === payload.new.id ? payload.new as AIConversation : c
            ))
            if (activeConversation?.id === payload.new.id) {
              setActiveConversation(payload.new as AIConversation)
            }
          } else if (payload.eventType === 'DELETE') {
            setConversations(prev => prev.filter(c => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationChannel)
    }
  }, [supabase, activeConversation])

  useEffect(() => {
    if (!activeConversation) return

    const messageChannel = supabase
      .channel(`ai_messages_${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as AIMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [supabase, activeConversation])

  const createConversation = useCallback(async (
    title: string = 'New Conversation',
    mode: AIConversation['mode'] = 'chat',
    model: string = 'gpt-4'
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title,
        mode,
        model
      })
      .select()
      .single()

    if (error) throw error
    setConversations(prev => [data, ...prev])
    setActiveConversation(data)
    setMessages([])
    return data
  }, [supabase])

  const sendMessage = useCallback(async (content: string, role: AIMessage['role'] = 'user') => {
    if (!activeConversation) throw new Error('No active conversation')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: activeConversation.id,
          user_id: user.id,
          role,
          content,
          model: activeConversation.model
        })
        .select()
        .single()

      if (error) throw error
      setMessages(prev => [...prev, data])
      return data
    } finally {
      setIsSending(false)
    }
  }, [supabase, activeConversation])

  const updateConversation = useCallback(async (
    conversationId: string,
    updates: Partial<Pick<AIConversation, 'title' | 'is_archived' | 'is_starred' | 'system_prompt' | 'tags'>>
  ) => {
    const { error } = await supabase
      .from('ai_conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) throw error
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, ...updates } : c
    ))
  }, [supabase])

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('ai_conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) throw error
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null)
      setMessages([])
    }
  }, [supabase, activeConversation])

  const toggleStar = useCallback(async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return

    await updateConversation(conversationId, { is_starred: !conversation.is_starred })
  }, [conversations, updateConversation])

  const toggleArchive = useCallback(async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return

    await updateConversation(conversationId, { is_archived: !conversation.is_archived })
  }, [conversations, updateConversation])

  return {
    conversations,
    messages,
    activeConversation,
    stats,
    isLoading,
    isSending,
    error,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    updateConversation,
    deleteConversation,
    toggleStar,
    toggleArchive,
    setActiveConversation
  }
}

export function getConversationModeColor(mode: AIConversation['mode']): string {
  switch (mode) {
    case 'chat':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'code':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'creative':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'analysis':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getMessageRoleColor(role: AIMessage['role']): string {
  switch (role) {
    case 'user':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'assistant':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'system':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  return `${ms}ms`
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
