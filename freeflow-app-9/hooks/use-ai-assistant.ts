'use client'

import { useState, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type AITaskType = 'chat' | 'analysis' | 'creative' | 'legal' | 'strategic' | 'operational' | 'coding' | 'content'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    provider?: string
    model?: string
    tokens?: number
    cost?: number
    duration?: number
  }
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: string
  updatedAt: string
  taskType: AITaskType
}

export interface AISuggestion {
  id: string
  text: string
  category: string
}

export interface AIActionItem {
  title: string
  action: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
  impact: string
}

export interface AICapability {
  id: string
  name: string
  description: string
  taskType: AITaskType
  endpoint: string
  icon: string
}

export interface AIUsageStats {
  totalMessages: number
  totalTokens: number
  totalCost: number
  conversationsToday: number
  avgResponseTime: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCapabilities: AICapability[] = [
  { id: 'chat', name: 'Chat Assistant', description: 'General conversation and Q&A', taskType: 'chat', endpoint: '/api/ai/chat', icon: 'message-circle' },
  { id: 'content', name: 'Content Generator', description: 'Create blog posts, emails, and copy', taskType: 'content', endpoint: '/api/ai/content-generation', icon: 'file-text' },
  { id: 'analysis', name: 'Data Analyst', description: 'Analyze data and generate insights', taskType: 'analysis', endpoint: '/api/ai/analyze', icon: 'bar-chart' },
  { id: 'creative', name: 'Creative Partner', description: 'Brainstorm ideas and concepts', taskType: 'creative', endpoint: '/api/ai/generate', icon: 'lightbulb' },
  { id: 'coding', name: 'Code Assistant', description: 'Help with programming tasks', taskType: 'coding', endpoint: '/api/ai/chat', icon: 'code' },
  { id: 'strategic', name: 'Strategy Advisor', description: 'Business and planning advice', taskType: 'strategic', endpoint: '/api/ai/recommendations', icon: 'compass' }
]

const mockUsageStats: AIUsageStats = {
  totalMessages: 1250,
  totalTokens: 450000,
  totalCost: 12.50,
  conversationsToday: 15,
  avgResponseTime: 1.2
}

// ============================================================================
// HOOK
// ============================================================================

interface UseAIAssistantOptions {
  defaultTaskType?: AITaskType
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const {
    defaultTaskType = 'chat',
    systemPrompt = 'You are Kazi AI, an expert assistant for freelancers and creative professionals.',
    maxTokens = 4096,
    temperature = 0.7
  } = options

  // State
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [actionItems, setActionItems] = useState<AIActionItem[]>([])
  const [taskType, setTaskType] = useState<AITaskType>(defaultTaskType)

  // Send message
  const sendMessage = useCallback(async (content: string, options?: { taskType?: AITaskType; stream?: boolean }) => {
    const msgTaskType = options?.taskType || taskType

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          systemPrompt,
          taskType: msgTaskType,
          maxTokens,
          temperature
        })
      })

      const result = await response.json()

      if (result.success && result.response) {
        const assistantMessage: AIMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: result.response.content,
          timestamp: new Date().toISOString(),
          metadata: result.response.metadata
        }

        setMessages(prev => [...prev, assistantMessage])

        if (result.response.suggestions) {
          setSuggestions(result.response.suggestions.map((s: string, i: number) => ({
            id: `sug-${i}`,
            text: s,
            category: msgTaskType
          })))
        }

        if (result.response.actionItems) {
          setActionItems(result.response.actionItems)
        }

        return { success: true, message: assistantMessage }
      }

      return { success: false, error: result.error || 'Failed to get response' }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err : new Error('Failed to send message'))
      return { success: false, error: 'Failed to send message' }
    } finally {
      setIsLoading(false)
    }
  }, [taskType, systemPrompt, maxTokens, temperature])

  // Generate content
  const generateContent = useCallback(async (prompt: string, type: 'blog' | 'email' | 'social' | 'copy') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType: type })
      })
      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error generating content:', err)
      return { success: false, error: 'Failed to generate content' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Analyze data
  const analyzeData = useCallback(async (data: any, analysisType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, analysisType })
      })
      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error analyzing data:', err)
      return { success: false, error: 'Failed to analyze data' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get recommendations
  const getRecommendations = useCallback(async (context: string, type: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, recommendationType: type })
      })
      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error getting recommendations:', err)
      return { success: false, error: 'Failed to get recommendations' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Generate image
  const generateImage = useCallback(async (prompt: string, options?: { style?: string; size?: string }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...options })
      })
      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error generating image:', err)
      return { success: false, error: 'Failed to generate image' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Conversation management
  const startNewConversation = useCallback((title?: string) => {
    const id = `conv-${Date.now()}`
    const newConversation: AIConversation = {
      id,
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskType
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversation(id)
    setMessages([])
    setSuggestions([])
    setActionItems([])
  }, [taskType])

  const loadConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      setCurrentConversation(conversationId)
      setMessages(conversation.messages)
      setTaskType(conversation.taskType)
    }
  }, [conversations])

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    if (currentConversation === conversationId) {
      setCurrentConversation(null)
      setMessages([])
    }
  }, [currentConversation])

  const clearMessages = useCallback(() => {
    setMessages([])
    setSuggestions([])
    setActionItems([])
  }, [])

  // Computed
  const capabilities = useMemo(() => mockCapabilities, [])
  const usageStats = useMemo(() => mockUsageStats, [])
  const lastMessage = useMemo(() => messages[messages.length - 1], [messages])
  const messageCount = useMemo(() => messages.length, [messages])

  return {
    messages, conversations, currentConversation, suggestions, actionItems,
    capabilities, usageStats, taskType,
    isLoading, isStreaming, error, lastMessage, messageCount,
    sendMessage, generateContent, analyzeData, getRecommendations, generateImage,
    startNewConversation, loadConversation, deleteConversation, clearMessages,
    setTaskType
  }
}

export default useAIAssistant
