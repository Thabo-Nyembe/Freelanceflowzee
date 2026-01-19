/**
 * AI Agents Hook
 *
 * React hook for managing custom AI agents
 */

'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface AIAgent {
  id: string
  user_id: string
  name: string
  description: string | null
  avatar_url: string | null
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  knowledge_base: unknown[]
  capabilities: {
    web_search: boolean
    code_execution: boolean
    file_upload: boolean
    image_generation: boolean
    voice_mode: boolean
  }
  conversation_starters: string[]
  is_public: boolean
  is_template: boolean
  conversation_count: number
  message_count: number
  created_at: string
  updated_at: string
  // Joined data
  agent_knowledge_docs?: KnowledgeDoc[]
  agent_actions?: AgentAction[]
}

export interface KnowledgeDoc {
  id: string
  title: string
  content_type: string
  source_type: string
  is_processed: boolean
  created_at: string
}

export interface AgentAction {
  id: string
  name: string
  description: string
  action_type: string
  is_enabled: boolean
}

export interface AgentConversation {
  id: string
  agent_id: string
  title: string | null
  summary: string | null
  messages: { role: string; content: string }[]
  context: Record<string, unknown>
  message_count: number
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateAgentInput {
  name: string
  description?: string
  avatar_url?: string
  system_prompt: string
  model?: string
  temperature?: number
  max_tokens?: number
  capabilities?: Partial<AIAgent['capabilities']>
  conversation_starters?: string[]
  is_public?: boolean
  templateId?: string
}

export interface UpdateAgentInput {
  name?: string
  description?: string
  avatar_url?: string
  system_prompt?: string
  model?: string
  temperature?: number
  max_tokens?: number
  capabilities?: Partial<AIAgent['capabilities']>
  conversation_starters?: string[]
  is_public?: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAIAgents() {
  const queryClient = useQueryClient()

  // Fetch all agents
  const {
    data: agents = [],
    isLoading: isLoadingAgents,
    error: agentsError,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async (): Promise<AIAgent[]> => {
      const response = await fetch('/api/ai/agents?includeTemplates=true')
      if (!response.ok) throw new Error('Failed to fetch agents')
      const data = await response.json()
      return data.agents
    },
  })

  // Fetch single agent
  const fetchAgent = useCallback(async (agentId: string): Promise<AIAgent | null> => {
    try {
      const response = await fetch(`/api/ai/agents/${agentId}`)
      if (!response.ok) return null
      const data = await response.json()
      return data.agent
    } catch {
      return null
    }
  }, [])

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (input: CreateAgentInput): Promise<AIAgent> => {
      const response = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create agent')
      }
      const data = await response.json()
      return data.agent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] })
      toast.success('Agent created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create agent', { description: error.message })
    },
  })

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async ({
      agentId,
      input,
    }: {
      agentId: string
      input: UpdateAgentInput
    }): Promise<AIAgent> => {
      const response = await fetch(`/api/ai/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update agent')
      }
      const data = await response.json()
      return data.agent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] })
      toast.success('Agent updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update agent', { description: error.message })
    },
  })

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string): Promise<void> => {
      const response = await fetch(`/api/ai/agents/${agentId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete agent')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] })
      toast.success('Agent deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete agent')
    },
  })

  // Helper functions
  const createAgent = useCallback(
    (input: CreateAgentInput) => createAgentMutation.mutateAsync(input),
    [createAgentMutation]
  )

  const updateAgent = useCallback(
    (agentId: string, input: UpdateAgentInput) =>
      updateAgentMutation.mutateAsync({ agentId, input }),
    [updateAgentMutation]
  )

  const deleteAgent = useCallback(
    (agentId: string) => deleteAgentMutation.mutateAsync(agentId),
    [deleteAgentMutation]
  )

  // Filter helpers
  const myAgents = agents.filter((a) => !a.is_template)
  const templates = agents.filter((a) => a.is_template)
  const publicAgents = agents.filter((a) => a.is_public && !a.is_template)

  return {
    // Data
    agents,
    myAgents,
    templates,
    publicAgents,

    // Loading states
    isLoadingAgents,
    isCreating: createAgentMutation.isPending,
    isUpdating: updateAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending,

    // Error
    agentsError,

    // Actions
    fetchAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    refetchAgents,
  }
}

// Separate hook for agent conversations/chat
export function useAgentChat(agentId: string) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string, context?: Record<string, unknown>) => {
      if (!message.trim() || isLoading) return null

      setIsLoading(true)
      setError(null)

      // Add user message optimistically
      const userMessage: ChatMessage = { role: 'user', content: message }
      setMessages((prev) => [...prev, userMessage])

      try {
        const response = await fetch(`/api/ai/agents/${agentId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationId,
            context,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()

        // Update conversation ID if new
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message.content,
        }
        setMessages((prev) => [...prev, assistantMessage])

        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)

        // Remove optimistic user message on error
        setMessages((prev) => prev.slice(0, -1))
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [agentId, conversationId, isLoading]
  )

  const clearConversation = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setError(null)
  }, [])

  const loadConversation = useCallback(
    async (convId: string) => {
      try {
        const response = await fetch(
          `/api/ai/agents/${agentId}/conversations/${convId}`
        )
        if (!response.ok) throw new Error('Failed to load conversation')

        const data = await response.json()
        setConversationId(convId)
        setMessages(data.conversation.messages || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation')
      }
    },
    [agentId]
  )

  return {
    conversationId,
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    loadConversation,
  }
}
