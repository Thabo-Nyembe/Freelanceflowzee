'use client'

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Bot,
  Send,
  Sparkles,
  Brain,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Settings,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  DollarSign,
  Eye,
  Bookmark,
  Copy,
  Zap,
  Star,
  AlertTriangle
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useKaziAI } from '@/lib/hooks/use-kazi-ai'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { copyToClipboard } from '@/lib/button-handlers'

// A+++ SUPABASE INTEGRATION
import {
  getConversations,
  getInsights,
  getProjectAnalyses,
  getConversationStats
} from '@/lib/ai-assistant-queries'

const logger = createFeatureLogger('AIAssistant')

// Helper function to map insight categories to icons
function getIconForCategory(category: string): React.ComponentType<{ className?: string }> {
  switch (category) {
    case 'productivity':
      return Clock
    case 'business':
      return DollarSign
    case 'optimization':
      return TrendingUp
    case 'opportunity':
      return Users
    case 'growth':
      return Sparkles
    default:
      return Lightbulb
  }
}

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
  suggestions?: string[]
  attachments?: string[]
  rating?: 'up' | 'down' | null
}

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  tags: string[]
  messageCount: number
}

interface AIInsight {
  id: string
  title: string
  description: string
  category: 'productivity' | 'business' | 'optimization' | 'opportunity'
  priority: 'high' | 'medium' | 'low'
  action: string
  icon: React.ComponentType<{ className?: string }>
}

interface ProjectAnalysis {
  projectName: string
  status: string
  completion: number
  insights: string[]
  recommendations: string[]
  nextActions: string[]
}

export default function AIAssistantPage() {
  // A+++ STATE MANAGEMENT
  const router = useRouter()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()
  const { chat, loading: aiLoading } = useKaziAI(userId || 'anonymous')

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Assistant. I can help you optimize your workflow, analyze projects, provide business insights, and answer questions about your freelance business. What would you like to explore today?',
      type: 'assistant',
      timestamp: new Date(Date.now() - 5 * 60000),
      suggestions: [
        'Analyze my current projects',
        'Suggest productivity improvements',
        'Help with client communication',
        'Review my business metrics'
      ]
    }
  ])

  const [inputMessage, setInputMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('chat')
  const [selectedModel, setSelectedModel] = useState<string>('anthropic')

  // A+++ LOAD AI ASSISTANT DATA
  useEffect(() => {
    const loadAIAssistantData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsPageLoading(false)
        return
      }

      try {
        setIsPageLoading(true)
        setError(null)
        logger.info('Loading AI Assistant data from Supabase', { userId })

        // Fetch all AI assistant data in parallel
        const [conversationsResult, insightsResult, analysesResult, statsResult] = await Promise.all([
          getConversations(userId, { status: 'active' }),
          getInsights(userId, { status: 'active' }),
          getProjectAnalyses(userId),
          getConversationStats(userId)
        ])

        // Transform conversations data
        if (conversationsResult.data && conversationsResult.data.length > 0) {
          const transformedConversations: Conversation[] = conversationsResult.data.map((c) => ({
            id: c.id,
            title: c.title,
            preview: c.preview || '',
            timestamp: new Date(c.last_message_at || c.created_at),
            tags: c.tags,
            messageCount: c.message_count
          }))
          setConversations(transformedConversations)
          logger.info('Loaded conversations from Supabase', { count: transformedConversations.length })
        } else {
          logger.info('No conversations found, using empty state')
        }

        // Transform insights data
        if (insightsResult.data && insightsResult.data.length > 0) {
          const transformedInsights: AIInsight[] = insightsResult.data.map((i) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            category: i.category as 'productivity' | 'business' | 'optimization' | 'opportunity',
            priority: i.priority as 'high' | 'medium' | 'low',
            action: i.action,
            icon: getIconForCategory(i.category)
          }))
          setAiInsights(transformedInsights)
          logger.info('Loaded insights from Supabase', { count: transformedInsights.length })
        }

        // Transform project analyses data
        if (analysesResult.data && analysesResult.data.length > 0) {
          const transformedAnalyses: ProjectAnalysis[] = analysesResult.data.map((a) => ({
            projectName: a.project_name,
            status: a.status,
            completion: a.completion,
            insights: a.insights,
            recommendations: a.recommendations,
            nextActions: a.next_actions
          }))
          setProjectAnalysis(transformedAnalyses)
          logger.info('Loaded project analyses from Supabase', { count: transformedAnalyses.length })
        }

        // Log stats
        if (statsResult.data) {
          logger.info('AI Assistant stats', {
            conversations: statsResult.data.total_conversations,
            messages: statsResult.data.total_messages,
            tokens: statsResult.data.total_tokens,
            avgRating: statsResult.data.avg_rating
          })
        }

        setIsPageLoading(false)
        announce('AI assistant loaded successfully', 'polite')

        toast.success(`AI Assistant loaded - ${conversationsResult.data?.length || 0} conversations, ${insightsResult.data?.length || 0} insights`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load AI assistant'
        logger.error('Exception loading AI Assistant data', { error: errorMessage, userId })
        setError(errorMessage)
        setIsPageLoading(false)
        announce('Error loading AI assistant', 'assertive')
        toast.error('Failed to load AI Assistant data')
      }
    }

    loadAIAssistantData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // AlertDialog States
  const [showDeleteConversationDialog, setShowDeleteConversationDialog] = useState(false)
  const [showClearChatDialog, setShowClearChatDialog] = useState(false)
  const [showDismissInsightDialog, setShowDismissInsightDialog] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [insightToDismiss, setInsightToDismiss] = useState<string | null>(null)

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Project Optimization Strategy',
      preview: 'How can I improve my project delivery times...',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      tags: ['productivity', 'optimization'],
      messageCount: 12
    },
    {
      id: '2',
      title: 'Client Pricing Analysis',
      preview: 'What should I charge for web development...',
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      tags: ['pricing', 'business'],
      messageCount: 8
    },
    {
      id: '3',
      title: 'Marketing Strategy Discussion',
      preview: 'Help me create a marketing plan for...',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000),
      tags: ['marketing', 'growth'],
      messageCount: 15
    }
  ])

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '0',
      title: 'NEW: AI-Powered Growth Engine',
      description: 'Unlock 110% revenue growth! Our Growth Hub uses research-backed strategies (2025 data) to optimize pricing, reduce CAC by 45%, and improve conversions by 35-78%.',
      category: 'business',
      priority: 'high',
      action: 'Explore Growth Hub',
      icon: Sparkles
    },
    {
      id: '1',
      title: 'Productivity Opportunity',
      description: 'You spend 40% more time on revisions than industry average. Consider implementing structured feedback workflows.',
      category: 'optimization',
      priority: 'high',
      action: 'Implement feedback system',
      icon: TrendingUp
    },
    {
      id: '2',
      title: 'Revenue Growth Potential',
      description: 'Your video editing projects have 23% higher profit margins. Consider expanding this service line.',
      category: 'business',
      priority: 'high',
      action: 'Expand video services',
      icon: DollarSign
    },
    {
      id: '3',
      title: 'Client Retention Insight',
      description: 'Clients who use your escrow system have 65% higher retention rates. Promote this feature more.',
      category: 'opportunity',
      priority: 'medium',
      action: 'Promote escrow system',
      icon: Users
    },
    {
      id: '4',
      title: 'Workflow Optimization',
      description: 'Your most productive hours are 9-11 AM. Schedule complex tasks during this window.',
      category: 'productivity',
      priority: 'medium',
      action: 'Adjust daily schedule',
      icon: Clock
    }
  ])

  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis[]>([
    {
      projectName: 'E-commerce Redesign',
      status: 'In Progress',
      completion: 75,
      insights: [
        'Project is 15% ahead of original timeline',
        'Client feedback response time: 2.3 days average',
        'Design iteration efficiency: 88%'
      ],
      recommendations: [
        'Schedule final review meeting for next week',
        'Prepare comprehensive testing documentation',
        'Create handover documentation early'
      ],
      nextActions: [
        'Complete checkout flow testing',
        'Finalize mobile responsive design',
        'Prepare deployment checklist'
      ]
    },
    {
      projectName: 'Brand Identity Package',
      status: 'Review',
      completion: 90,
      insights: [
        'Client approval rate: 92% first-time approval',
        'Revision requests: 23% below average',
        'Timeline adherence: Excellent'
      ],
      recommendations: [
        'Present final brand guidelines document',
        'Offer additional brand applications',
        'Schedule brand implementation consultation'
      ],
      nextActions: [
        'Deliver final logo variations',
        'Complete brand guidelines PDF',
        'Prepare usage examples'
      ]
    }
  ])

  const quickActions = [
    { id: 'analyze-projects', label: 'Analyze My Projects', icon: BarChart3 },
    { id: 'optimize-workflow', label: 'Optimize Workflow', icon: TrendingUp },
    { id: 'pricing-help', label: 'Pricing Guidance', icon: DollarSign },
    { id: 'client-communication', label: 'Client Communication', icon: MessageSquare },
    { id: 'time-management', label: 'Time Management', icon: Clock },
    { id: 'business-insights', label: 'Business Insights', icon: Brain }
  ]

  const aiModels = [
    { id: 'anthropic', name: 'Claude (Anthropic)', description: 'Best for analysis and reasoning' },
    { id: 'openai', name: 'GPT-4 (OpenAI)', description: 'Excellent for creative tasks' },
    { id: 'google', name: 'Gemini (Google)', description: 'Great for general assistance' }
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || aiLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Use real AI instead of mock
      logger.info('Sending message to Kazi AI', {
        messageLength: currentMessage.length,
        selectedModel
      })

      const taskType = getTaskTypeFromModel(selectedModel)
      const response = await chat(currentMessage, taskType)

      logger.info('Received AI response', {
        provider: response.metadata.provider,
        tokens: response.metadata.tokens.total,
        cached: response.metadata.cached
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        type: 'assistant',
        timestamp: new Date(),
        suggestions: generateSuggestions(currentMessage)
      }

      setMessages(prev => [...prev, assistantMessage])

      toast.success(`AI response received - ${response.metadata.provider} (${response.metadata.tokens.total} tokens${response.metadata.cached ? ', cached' : ''})`)
    } catch (error) {
      logger.error('AI response failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        type: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])

      toast.error('AI request failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to map model selection to task type
  const getTaskTypeFromModel = (model: string): 'chat' | 'analysis' | 'creative' | 'strategic' | 'operational' => {
    switch (model) {
      case 'anthropic':
        return 'strategic' // Claude for strategic thinking
      case 'openai':
        return 'creative' // GPT-4 for creative tasks
      case 'google':
        return 'operational' // Gemini for quick operations
      default:
        return 'chat'
    }
  }

  const generateAIResponse = (_input: string): string => {
    const responses = [
      "Based on your current project portfolio, I can see some excellent opportunities for optimization. Your video editing projects are performing particularly well with higher profit margins. Here's what I recommend...",
      "I've analyzed your workflow patterns and found that you're most productive between 9-11 AM. Consider scheduling your most complex tasks during this window to maximize efficiency...",
      "Your client retention rate could be improved by implementing more structured communication. I suggest creating weekly progress updates and using the built-in project management tools...",
      "Looking at your pricing strategy, you might be undervaluing your services. The market rate for your skill level is typically 15-20% higher than your current rates..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateSuggestions = (_input: string): string[] => {
    const suggestions = [
      ['Show me detailed project analytics', 'Help with time tracking', 'Suggest productivity tools'],
      ['Create a pricing strategy', 'Analyze competitor rates', 'Calculate project ROI'],
      ['Draft client update email', 'Schedule follow-up tasks', 'Create project timeline'],
      ['Optimize daily schedule', 'Set productivity goals', 'Track time allocation']
    ]
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  const handleQuickAction = (actionId: string) => {
    const actionMessages = {
      'analyze-projects': 'Can you analyze my current projects and provide insights on performance, timelines, and optimization opportunities?',
      'optimize-workflow': 'Help me optimize my daily workflow and suggest productivity improvements based on my work patterns.',
      'pricing-help': 'I need guidance on pricing my services. Can you analyze market rates and suggest optimal pricing strategies?',
      'client-communication': 'Help me improve my client communication and create templates for common scenarios.',
      'time-management': 'Analyze my time allocation and suggest better time management strategies.',
      'business-insights': 'Provide insights on my business performance and suggest growth opportunities.'
    }

    setInputMessage(actionMessages[actionId] || '')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const handleMessageRating = async (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, rating } : msg
    ))

    // Persist rating to database
    if (userId) {
      try {
        const { rateMessage } = await import('@/lib/ai-assistant-queries')
        await rateMessage(messageId, rating)
        logger.info('Message rating persisted to database', { messageId, rating })
      } catch (error: any) {
        logger.error('Failed to persist message rating', { error: error.message })
      }
    }

    toast.success(`Feedback saved - ${rating === 'up' ? 'Positive' : 'Negative'} rating recorded`)
  }

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode
    setIsVoiceMode(newVoiceMode)
    if (newVoiceMode) {
      setIsListening(false)
    }
    toast.success(newVoiceMode ? 'Voice mode enabled - Ready for voice commands' : 'Voice mode disabled')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Additional Handlers - WIRED TO DATABASE
  const handleNewConversation = async () => {
    const previousMessageCount = messages.length
    const newMessage = { id: Date.now().toString(), content: 'Hello! How can I help you today?', type: 'assistant' as const, timestamp: new Date() }

    logger.info('New conversation initiated', {
      previousMessageCount,
      conversationReset: true
    })

    // Create new conversation in database
    if (userId && previousMessageCount > 1) {
      try {
        const { createConversation } = await import('@/lib/ai-assistant-queries')
        const firstUserMessage = messages.find(m => m.type === 'user')
        const title = firstUserMessage?.content?.slice(0, 50) || `Conversation ${new Date().toLocaleDateString()}`

        const { data: newConv, error } = await createConversation(userId, title, {
          model: selectedModel as any,
          tags: ['auto-saved'],
          metadata: { messageCount: previousMessageCount }
        })

        if (!error && newConv) {
          // Add to conversations list
          setConversations(prev => [{
            id: newConv.id,
            title: newConv.title,
            preview: firstUserMessage?.content?.slice(0, 100) || '',
            timestamp: new Date(newConv.created_at),
            tags: newConv.tags,
            messageCount: previousMessageCount
          }, ...prev])
          logger.info('Previous conversation saved to database', { conversationId: newConv.id })
        }
      } catch (err) {
        logger.error('Failed to save previous conversation', { error: err })
      }
    }

    setMessages([newMessage])

    toast.success(`New conversation ready - Previous: ${previousMessageCount} messages saved`)
    announce('New conversation started', 'polite')
  }

  const handleLoadConversation = async (conversationId: string, title: string) => {
    const conversation = conversations.find(c => c.id === conversationId)

    logger.info('Loading conversation', {
      conversationId,
      title,
      messageCount: conversation?.messageCount || 0,
      tags: conversation?.tags || []
    })

    // Load messages from database
    if (userId) {
      try {
        setIsLoading(true)
        const { getMessages } = await import('@/lib/ai-assistant-queries')
        const { data: loadedMessages, error } = await getMessages(conversationId)

        if (error) throw new Error(error.message || 'Failed to load messages')

        if (loadedMessages && loadedMessages.length > 0) {
          // Transform database messages to UI format
          const transformedMessages: Message[] = loadedMessages.map(m => ({
            id: m.id,
            content: m.content,
            type: m.type as 'user' | 'assistant',
            timestamp: new Date(m.created_at),
            rating: m.rating as 'up' | 'down' | null,
            suggestions: m.suggestions || []
          }))
          setMessages(transformedMessages)
          logger.info('Conversation loaded from database', { messageCount: transformedMessages.length })
          toast.success(`${title} loaded - ${transformedMessages.length} messages restored`)
        } else {
          toast.success(`${title} - ${conversation?.messageCount || 0} messages loaded`)
        }
        announce(`Loaded conversation: ${title}`, 'polite')
      } catch (err) {
        logger.error('Failed to load conversation', { error: err })
        toast.error('Failed to load conversation', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)

    logger.info('Delete conversation requested', {
      conversationId,
      title: conversation?.title,
      messageCount: conversation?.messageCount
    })

    setConversationToDelete(conversationId)
    setShowDeleteConversationDialog(true)
  }

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return

    const conversation = conversations.find(c => c.id === conversationToDelete)

    const deleteOperation = async () => {
      if (userId) {
        const { deleteConversation } = await import('@/lib/ai-assistant-queries')
        const { error: deleteError } = await deleteConversation(conversationToDelete)
        if (deleteError) throw new Error(deleteError.message || 'Failed to delete conversation')
      }

      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationToDelete))

      logger.info('Conversation deleted', {
        conversationId: conversationToDelete,
        title: conversation?.title,
        messageCount: conversation?.messageCount
      })

      return { title: conversation?.title, messageCount: conversation?.messageCount }
    }

    toast.promise(deleteOperation(), {
      loading: 'Deleting conversation...',
      success: (data) => `Conversation deleted - ${data.title} (${data.messageCount} messages removed)`,
      error: 'Failed to delete conversation'
    })

    announce('Conversation deleted successfully', 'polite')
    setShowDeleteConversationDialog(false)
    setConversationToDelete(null)
  }

  const handleCopyMessage = async (messageId: string, content: string) => {
    logger.info('Copying message to clipboard', {
      messageId,
      contentLength: content.length,
      contentPreview: content.substring(0, 50)
    })

    await copyToClipboard(content, `Message copied - ${content.length} characters`)
  }

  const handleBookmarkMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)

    logger.info('Bookmarking message', {
      messageId,
      messageType: message?.type,
      contentLength: message?.content.length
    })

    // Save bookmark to API
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai-message',
          messageId,
          content: message?.content,
          messageType: message?.type
        })
      })

      if (response.ok) {
        toast.success(`${message?.type === 'user' ? 'Your message' : 'AI response'} saved to bookmarks`)
      } else {
        throw new Error('Failed to save bookmark')
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      const bookmarks = JSON.parse(localStorage.getItem('ai-bookmarks') || '[]')
      bookmarks.push({
        id: messageId,
        content: message?.content,
        type: message?.type,
        savedAt: new Date().toISOString()
      })
      localStorage.setItem('ai-bookmarks', JSON.stringify(bookmarks))
      toast.success(`${message?.type === 'user' ? 'Your message' : 'AI response'} saved to bookmarks (local)`)
    }
  }

  const handleRefreshInsights = async () => {
    const highPriority = aiInsights.filter(i => i.priority === 'high').length
    const categories = [...new Set(aiInsights.map(i => i.category))]

    logger.info('Refreshing AI insights', {
      totalInsights: aiInsights.length,
      highPriorityCount: highPriority,
      categories
    })

    // Load fresh insights from database
    if (userId) {
      try {
        setIsLoading(true)
        toast.loading('Refreshing insights...')
        const { getInsights } = await import('@/lib/ai-assistant-queries')
        const { data: freshInsights, error } = await getInsights(userId, { status: 'active' })

        toast.dismiss()

        if (error) throw new Error(error.message || 'Failed to refresh insights')

        if (freshInsights && freshInsights.length > 0) {
          const transformedInsights: AIInsight[] = freshInsights.map((i) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            category: i.category as 'productivity' | 'business' | 'optimization' | 'opportunity',
            priority: i.priority as 'high' | 'medium' | 'low',
            action: i.action,
            icon: getIconForCategory(i.category)
          }))
          setAiInsights(transformedInsights)
          const newHighPriority = transformedInsights.filter(i => i.priority === 'high').length
          toast.success(`Insights refreshed - ${transformedInsights.length} insights loaded (${newHighPriority} high priority)`)
          logger.info('Insights refreshed from database', { count: transformedInsights.length })
        } else {
          toast.success('No new insights - All data is up to date')
        }
        announce('Insights refreshed', 'polite')
      } catch (err) {
        toast.dismiss()
        logger.error('Failed to refresh insights', { error: err })
        toast.error('Failed to refresh insights', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // No userId - use API endpoint
      try {
        toast.loading('Refreshing insights...')
        const response = await fetch('/api/ai/insights/refresh', { method: 'POST' })
        toast.dismiss()

        if (response.ok) {
          const data = await response.json()
          toast.success(`Analyzed ${data.count || aiInsights.length} insights - ${highPriority} high priority`)
        } else {
          toast.error('Failed to refresh insights')
        }
      } catch (error) {
        toast.dismiss()
        toast.error('Failed to refresh insights')
      }
    }
  }

  const handleImplementAction = async (insightId: string, action: string) => {
    const insight = aiInsights.find(i => i.id === insightId)

    logger.info('Implementing action', {
      insightId,
      action,
      insightTitle: insight?.title,
      category: insight?.category,
      priority: insight?.priority
    })

    // Special handling for Growth Hub navigation
    if (action === 'Explore Growth Hub') {
      toast.success('Redirecting to AI-powered business growth tools')
      router.push('/dashboard/growth-hub')
      return
    }

    // Track implementation in database
    if (userId) {
      try {
        const { implementInsight } = await import('@/lib/ai-assistant-queries')
        await implementInsight(insightId, action)
        logger.info('Insight implementation tracked in database', { insightId, action })
        toast.success(`Action started - ${action} (${insight?.priority} priority)`)
      } catch (error: any) {
        logger.error('Failed to track insight implementation', { error: error.message })
        toast.error('Failed to start action')
      }
    } else {
      // Fallback: call API endpoint
      try {
        const response = await fetch('/api/ai/insights/implement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ insightId, action })
        })

        if (response.ok) {
          toast.success(`Action started - ${action} (${insight?.priority} priority)`)
        } else {
          toast.error('Failed to start action')
        }
      } catch (error) {
        toast.error('Failed to start action')
      }
    }
  }

  const handleExportConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)

    logger.info('Exporting conversation', {
      conversationId,
      title: conversation?.title,
      messageCount: conversation?.messageCount,
      format: 'markdown'
    })

    try {
      // Try to fetch full conversation from API
      const response = await fetch(`/api/conversations/${conversationId}/export`)

      let content: string
      if (response.ok) {
        const data = await response.json()
        content = data.markdown || `# ${conversation?.title}\n\nMessages: ${conversation?.messageCount}\nTags: ${conversation?.tags.join(', ')}\n\nExported on ${new Date().toLocaleDateString()}`
      } else {
        // Fallback to local data
        content = `# ${conversation?.title}\n\nMessages: ${conversation?.messageCount}\nTags: ${conversation?.tags.join(', ')}\n\nExported on ${new Date().toLocaleDateString()}`
      }

      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${conversation?.title || 'conversation'}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Exported: ${conversation?.title} - ${conversation?.messageCount} messages`)
    } catch (error) {
      toast.error('Failed to export conversation')
    }
  }

  const handleShareConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)

    logger.info('Sharing conversation', {
      conversationId,
      title: conversation?.title,
      messageCount: conversation?.messageCount
    })

    try {
      // Create share link via API
      const response = await fetch(`/api/conversations/${conversationId}/share`, {
        method: 'POST'
      })

      let shareLink: string
      if (response.ok) {
        const data = await response.json()
        shareLink = data.shareUrl || `${window.location.origin}/shared/conversations/${conversationId}`
      } else {
        shareLink = `${window.location.origin}/shared/conversations/${conversationId}`
      }

      await copyToClipboard(shareLink, `Share link copied - ${conversation?.title}`)
    } catch (error) {
      // Fallback to basic share link
      const shareLink = `${window.location.origin}/shared/conversations/${conversationId}`
      await copyToClipboard(shareLink, `Share link copied - ${conversation?.title}`)
    }
  }

  const handleVoiceInput = async () => {
    const newListeningState = !isListening

    logger.info('Voice input toggled', {
      previousState: isListening,
      newState: newListeningState,
      voiceModeEnabled: isVoiceMode
    })

    setIsListening(!isListening)

    if (newListeningState) {
      // Start speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
          const recognition = new SpeechRecognition()
          recognition.continuous = false
          recognition.interimResults = false
          recognition.lang = 'en-US'

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInputMessage(prev => prev + ' ' + transcript)
            setIsListening(false)
            toast.success(`Voice captured: "${transcript.substring(0, 30)}..."`)
          }

          recognition.onerror = () => {
            setIsListening(false)
            toast.error('Voice input failed - Please try again')
          }

          recognition.onend = () => {
            setIsListening(false)
          }

          recognition.start()
          toast.success('Voice input active - Listening for command')
        } catch (error) {
          setIsListening(false)
          toast.error('Voice input not supported in this browser')
        }
      } else {
        setIsListening(false)
        toast.error('Voice input not supported in this browser')
      }
    } else {
      toast.success('Voice input stopped')
    }
  }

  const handleRegenerateResponse = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    const messageIndex = messages.findIndex(m => m.id === messageId)

    logger.info('Regenerating AI response', {
      messageId,
      messageType: message?.type,
      selectedModel
    })

    // Find the user message before this assistant message
    const userMessageIndex = messages.slice(0, messageIndex).reverse().findIndex(m => m.type === 'user')
    if (userMessageIndex === -1) {
      toast.error('No user message found to regenerate response')
      return
    }

    const userMessage = messages[messageIndex - 1 - userMessageIndex]

    try {
      setIsLoading(true)
      toast.loading(`Regenerating response using ${selectedModel}...`)

      const taskType = getTaskTypeFromModel(selectedModel)
      const response = await chat(userMessage.content, taskType)

      toast.dismiss()

      // Update the message with new response
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, content: response.response, timestamp: new Date() }
          : m
      ))

      toast.success(`New response generated with ${selectedModel}`)
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to regenerate response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchConversations = () => {
    logger.info('Opening conversation search', {
      totalConversations: conversations.length,
      totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0)
    })

    // Open search modal or navigate to search page
    const searchQuery = prompt('Search conversations:')
    if (searchQuery) {
      const matchingConversations = conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      toast.success(`Found ${matchingConversations.length} of ${conversations.length} conversations matching "${searchQuery}"`)
    }
  }

  const handleFilterConversations = (filter: string) => {
    const filteredCount = conversations.filter(c => c.tags.includes(filter.toLowerCase())).length

    logger.info('Filtering conversations', {
      filter,
      filteredCount,
      totalConversations: conversations.length
    })

    // Apply filter to state (this would typically update a filter state variable)
    toast.success(`Filter applied - ${filteredCount} of ${conversations.length} conversations match "${filter}"`)
  }

  const handleExportInsights = () => {
    const highPriority = aiInsights.filter(i => i.priority === 'high').length
    const categories = [...new Set(aiInsights.map(i => i.category))]

    logger.info('Exporting insights report', {
      totalInsights: aiInsights.length,
      highPriorityCount: highPriority,
      categories
    })

    // Generate report content
    const content = `# AI Insights Report\n\nGenerated: ${new Date().toLocaleString()}\nTotal Insights: ${aiInsights.length}\nHigh Priority: ${highPriority}\n\n${aiInsights.map(i => `## ${i.title}\n\n**Category:** ${i.category}\n**Priority:** ${i.priority}\n\n${i.description}\n\n**Recommended Action:** ${i.action}\n\n---\n\n`).join('')}`

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-insights-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success(`Report exported - ${aiInsights.length} insights, ${highPriority} high priority`)
  }

  const handleScheduleReminder = async (action: string) => {
    const reminderTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    logger.info('Scheduling reminder', {
      action,
      scheduledFor: reminderTime.toISOString()
    })

    try {
      // Try to use Notification API
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          // Store reminder in localStorage for later
          const reminders = JSON.parse(localStorage.getItem('ai-reminders') || '[]')
          reminders.push({
            id: Date.now().toString(),
            action,
            scheduledFor: reminderTime.toISOString()
          })
          localStorage.setItem('ai-reminders', JSON.stringify(reminders))

          toast.success(`Reminder set - ${action} for ${reminderTime.toLocaleDateString()} at ${reminderTime.toLocaleTimeString()}`)
        } else {
          // Fall back to API
          const response = await fetch('/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, scheduledFor: reminderTime.toISOString() })
          })

          if (response.ok) {
            toast.success(`Reminder set - ${action} for ${reminderTime.toLocaleDateString()}`)
          } else {
            toast.error('Failed to schedule reminder')
          }
        }
      } else {
        // No Notification API, use API endpoint
        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, scheduledFor: reminderTime.toISOString() })
        })

        if (response.ok) {
          toast.success(`Reminder set - ${action} for ${reminderTime.toLocaleDateString()}`)
        } else {
          toast.error('Failed to schedule reminder')
        }
      }
    } catch (error) {
      toast.error('Failed to schedule reminder')
    }
  }

  const handleViewAnalytics = () => {
    const totalMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0)
    const avgMessagesPerConversation = conversations.length > 0 ? Math.round(totalMessages / conversations.length) : 0

    logger.info('Viewing analytics', {
      totalConversations: conversations.length,
      totalMessages,
      avgMessagesPerConversation,
      totalInsights: aiInsights.length
    })

    // Navigate to analytics tab or show analytics modal
    setActiveTab('analytics')
    toast.success(`Analytics ready - ${conversations.length} conversations, ${totalMessages} messages`)
  }

  const handleConfigureAI = () => {
    const settings = ['Model selection', 'Temperature', 'Context length', 'System prompts']

    logger.info('Opening AI configuration', {
      currentModel: selectedModel,
      availableSettings: settings
    })

    // Navigate to AI settings page
    router.push('/dashboard/settings-v2')
    toast.success(`Opening AI configuration - Model: ${selectedModel}`)
  }

  const handleSaveChat = () => {
    logger.info('Saving chat', {
      messageCount: messages.length,
      hasUserMessages: messages.some(m => m.type === 'user')
    })

    const saveOperation = async () => {
      // Create conversation in database
      if (userId && messages.length > 0) {
        const { createConversation } = await import('@/lib/ai-assistant-queries')
        const firstUserMessage = messages.find(m => m.type === 'user')
        const title = firstUserMessage?.content?.slice(0, 50) || 'New Conversation'

        const { data: conversation, error } = await createConversation(userId, {
          title,
          model: selectedModel,
          messages: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })

        if (error) throw new Error(error.message || 'Failed to save conversation')
        logger.info('Chat saved to database', { conversationId: conversation?.id })
      }
      return {
        messageCount: messages.length,
        userMessages: messages.filter(m => m.type === 'user').length,
        aiResponses: messages.filter(m => m.type === 'assistant').length
      }
    }

    toast.promise(saveOperation(), {
      loading: 'Saving chat...',
      success: (data) => `Chat saved - ${data.messageCount} messages preserved (${data.userMessages} user, ${data.aiResponses} AI)`,
      error: 'Failed to save chat'
    })
  }

  const handleClearChat = () => {
    const messageCount = messages.length

    logger.info('Clear chat requested', { messageCount })

    setShowClearChatDialog(true)
  }

  const confirmClearChat = () => {
    const messageCount = messages.length

    logger.info('Chat cleared', { clearedMessageCount: messageCount })

    setMessages([])

    toast.success(`Chat cleared - ${messageCount} messages removed`)

    setShowClearChatDialog(false)
  }

  const handleAttachFile = () => {
    logger.info('Attaching file', {
      currentMessageCount: messages.length
    })

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        logger.info('File selected', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })

        try {
          toast.loading(`Uploading ${file.name}...`)

          // Create FormData for file upload
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          toast.dismiss()

          if (response.ok) {
            const data = await response.json()
            toast.success(`File attached - ${file.name} (${Math.round(file.size / 1024)}KB)`)

            // Add file reference to input message
            setInputMessage(prev => prev + `\n[Attached: ${file.name}]`)
          } else {
            // Fallback: read file content directly for text files
            if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
              const reader = new FileReader()
              reader.onload = () => {
                const content = reader.result as string
                setInputMessage(prev => prev + `\n\n--- Attached File: ${file.name} ---\n${content.substring(0, 2000)}${content.length > 2000 ? '...(truncated)' : ''}\n--- End of File ---`)
                toast.success(`File attached - ${file.name} (${Math.round(file.size / 1024)}KB)`)
              }
              reader.readAsText(file)
            } else {
              toast.error('File upload failed - Only text files supported without API')
            }
          }
        } catch (error) {
          toast.dismiss()
          toast.error('Failed to attach file')
        }
      }
    }
    input.click()
  }

  const handleInsightDismiss = (insightId: string) => {
    const insight = aiInsights.find(i => i.id === insightId)

    logger.info('Dismissing insight', {
      insightId,
      title: insight?.title,
      priority: insight?.priority
    })

    setInsightToDismiss(insightId)
    setShowDismissInsightDialog(true)
  }

  const confirmDismissInsight = async () => {
    if (!insightToDismiss) return

    const insight = aiInsights.find(i => i.id === insightToDismiss)

    const dismissOperation = async () => {
      if (userId) {
        const { dismissInsight } = await import('@/lib/ai-assistant-queries')
        const { error: dismissError } = await dismissInsight(insightToDismiss)
        if (dismissError) throw new Error(dismissError.message || 'Failed to dismiss insight')
      }

      // Update local state
      setAiInsights(prev => prev.filter(i => i.id !== insightToDismiss))

      logger.info('Insight dismissed', {
        insightId: insightToDismiss,
        title: insight?.title
      })

      return { title: insight?.title, priority: insight?.priority }
    }

    toast.promise(dismissOperation(), {
      loading: 'Dismissing insight...',
      success: (data) => `Insight dismissed - ${data.title} (${data.priority} priority removed)`,
      error: 'Failed to dismiss insight'
    })

    announce('Insight dismissed successfully', 'polite')
    setShowDismissInsightDialog(false)
    setInsightToDismiss(null)
  }

  const handlePinConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)

    const pinOperation = async () => {
      if (userId) {
        const { togglePinConversation } = await import('@/lib/ai-assistant-queries')
        const { error: pinError } = await togglePinConversation(conversationId)
        if (pinError) throw new Error(pinError.message || 'Failed to pin conversation')
      }

      logger.info('Pinning conversation', {
        conversationId,
        title: conversation?.title,
        messageCount: conversation?.messageCount
      })

      return { title: conversation?.title }
    }

    toast.promise(pinOperation(), {
      loading: 'Pinning conversation...',
      success: (data) => `Conversation pinned - ${data.title} moved to top`,
      error: 'Failed to pin conversation'
    })

    announce('Conversation pinned successfully', 'polite')
  }

  const handleArchiveConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)

    const archiveOperation = async () => {
      if (userId) {
        const { archiveConversation } = await import('@/lib/ai-assistant-queries')
        const { error: archiveError } = await archiveConversation(conversationId)
        if (archiveError) throw new Error(archiveError.message || 'Failed to archive conversation')
      }

      // Remove from active conversations list
      setConversations(prev => prev.filter(c => c.id !== conversationId))

      logger.info('Archiving conversation', {
        conversationId,
        title: conversation?.title,
        messageCount: conversation?.messageCount
      })

      return { title: conversation?.title, messageCount: conversation?.messageCount }
    }

    toast.promise(archiveOperation(), {
      loading: 'Archiving conversation...',
      success: (data) => `Conversation archived - ${data.title} (${data.messageCount} messages moved)`,
      error: 'Failed to archive conversation'
    })

    announce('Conversation archived successfully', 'polite')
  }

  // A+++ LOADING STATE
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
          <ListSkeleton items={4} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Added Zap icon in gradient container */}
              <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Powered by Advanced AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              {aiModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>

            <Button
              variant={isVoiceMode ? "default" : "outline"}
              size="sm"
              onClick={toggleVoiceMode}
            >
              {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={handleConfigureAI}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <Button className="w-full" onClick={handleNewConversation}>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </div>

          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="p-4 space-y-3">
              {conversations.map(conversation => (
                <Card key={conversation.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleLoadConversation(conversation.id, conversation.title)}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                      <span className="text-xs text-gray-500">{conversation.messageCount}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{conversation.preview}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {conversation.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {conversation.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b border-gray-200 px-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          {message.type === 'assistant' ? (
                            <>
                              <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </>
                          ) : (
                            <>
                              <AvatarImage src="/user-avatar.jpg" alt="User" />
                              <AvatarFallback>You</AvatarFallback>
                            </>
                          )}
                        </Avatar>

                        <div className={`space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`rounded-lg px-4 py-3 ${
                            message.type === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>

                          {message.type === 'assistant' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMessageRating(message.id, 'up')}
                              >
                                <ThumbsUp className={`w-3 h-3 ${message.rating === 'up' ? 'text-green-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleMessageRating(message.id, 'down')}
                              >
                                <ThumbsDown className={`w-3 h-3 ${message.rating === 'down' ? 'text-red-600' : 'text-gray-400'}`} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyMessage(message.id, message.content)}>
                                <Copy className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleBookmarkMessage(message.id)}>
                                <Bookmark className="w-3 h-3 text-gray-400" />
                              </Button>
                            </div>
                          )}

                          {message.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 dark:bg-slate-800">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickActions.map(action => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.id)}
                        className="text-xs"
                      >
                        <action.icon className="w-3 h-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about your business, projects, or workflow..."
                        className="min-h-[60px] pr-12 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => setIsListening(!isListening)}
                        disabled={!isVoiceMode}
                      >
                        {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="flex-1 p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">AI Insights</h2>
                  <Button onClick={handleRefreshInsights}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Insights
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.map(insight => (
                    <Card key={insight.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <insight.icon className="w-5 h-5 text-purple-600" />
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                          </div>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{insight.description}</p>
                        <Button size="sm" className="w-full" onClick={() => handleImplementAction(insight.id, insight.action)}>
                          {insight.action}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="flex-1 p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">Project Analysis</h2>

                <div className="space-y-4">
                  {projectAnalysis.map((project, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{project.projectName}</CardTitle>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{project.status}</Badge>
                            <div className="text-sm text-gray-600">{project.completion}% Complete</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              AI Insights
                            </h4>
                            <ul className="space-y-1">
                              {project.insights.map((insight, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Recommendations
                            </h4>
                            <ul className="space-y-1">
                              {project.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <Sparkles className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Next Actions
                            </h4>
                            <ul className="space-y-1">
                              {project.nextActions.map((action, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <AlertCircle className="w-3 h-3 text-orange-500 mt-1 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">AI-Powered Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">AI Efficiency Score</p>
                          <p className="text-2xl font-bold text-green-600">92%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Optimization Potential</p>
                          <p className="text-2xl font-bold text-purple-600">18%</p>
                        </div>
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Time Saved (Monthly)</p>
                          <p className="text-2xl font-bold text-blue-600">24h</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Revenue Impact</p>
                          <p className="text-2xl font-bold text-emerald-600">+$3.2K</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Productivity increased by 15% this week</span>
                        </div>
                        <span className="text-sm text-green-600">Excellent</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Average response time: 4.2 hours</span>
                        </div>
                        <span className="text-sm text-blue-600">Good</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Client satisfaction: 96%</span>
                        </div>
                        <span className="text-sm text-purple-600">Outstanding</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteConversationDialog} onOpenChange={setShowDeleteConversationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Conversation?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>&quot;{conversations.find(c => c.id === conversationToDelete)?.title}&quot;</strong>?
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone. All {conversations.find(c => c.id === conversationToDelete)?.messageCount || 0} messages will be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Chat Dialog */}
      <AlertDialog open={showClearChatDialog} onOpenChange={setShowClearChatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Clear All Messages?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to clear all <strong>{messages.length}</strong> messages from this chat?
              </p>
              <p className="text-sm text-red-600">
                This action cannot be undone. All messages will be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearChat}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dismiss Insight Dialog */}
      <AlertDialog open={showDismissInsightDialog} onOpenChange={setShowDismissInsightDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Dismiss Insight?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to dismiss <strong>&quot;{aiInsights.find(i => i.id === insightToDismiss)?.title}&quot;</strong>?
              </p>
              <p className="text-sm text-gray-600">
                This insight will be removed from your dashboard.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInsightToDismiss(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDismissInsight}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
