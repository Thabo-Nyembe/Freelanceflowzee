/**
 * AI ASSISTANT UTILITIES
 *
 * Comprehensive utilities for AI-powered chat assistant with:
 * - Multi-provider AI integration (Claude, GPT-4, Gemini)
 * - Conversation management with history
 * - AI-powered business insights and analytics
 * - Project analysis and recommendations
 * - Voice mode with speech-to-text
 * - Message ratings and feedback
 * - Quick actions and suggestions
 * - Conversation export and sharing
 * - Real-time analytics tracking
 */

import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('AIAssistantUtils')

// ============================================
// TYPES & INTERFACES
// ============================================

export type MessageType = 'user' | 'assistant' | 'system'
export type AIProvider = 'anthropic' | 'openai' | 'google'
export type TaskType = 'chat' | 'analysis' | 'creative' | 'strategic' | 'operational'
export type MessageRating = 'up' | 'down' | null
export type InsightCategory = 'productivity' | 'business' | 'optimization' | 'opportunity' | 'growth'
export type InsightPriority = 'high' | 'medium' | 'low'
export type ConversationStatus = 'active' | 'archived' | 'pinned' | 'deleted'
export type AttachmentType = 'file' | 'image' | 'document' | 'link'

export interface Message {
  id: string
  conversationId: string
  content: string
  type: MessageType
  timestamp: Date
  isLoading?: boolean
  suggestions?: string[]
  attachments?: MessageAttachment[]
  rating?: MessageRating
  metadata?: MessageMetadata
  tokens?: number
  provider?: AIProvider
  cached?: boolean
}

export interface MessageAttachment {
  id: string
  type: AttachmentType
  name: string
  size: number
  url: string
  mimeType: string
  uploadedAt: Date
}

export interface MessageMetadata {
  model?: string
  temperature?: number
  maxTokens?: number
  responseTime?: number
  cached?: boolean
  contextLength?: number
}

export interface Conversation {
  id: string
  userId: string
  title: string
  preview: string
  timestamp: Date
  lastMessageAt: Date
  tags: string[]
  messageCount: number
  status: ConversationStatus
  isPinned: boolean
  isArchived: boolean
  model?: AIProvider
  metadata?: ConversationMetadata
}

export interface ConversationMetadata {
  totalTokens?: number
  avgResponseTime?: number
  userMessageCount?: number
  assistantMessageCount?: number
  avgRating?: number
  lastProvider?: AIProvider
}

export interface AIInsight {
  id: string
  userId: string
  title: string
  description: string
  category: InsightCategory
  priority: InsightPriority
  action: string
  actionUrl?: string
  icon?: string
  metadata?: InsightMetadata
  createdAt: Date
  dismissedAt?: Date
  implementedAt?: Date
}

export interface InsightMetadata {
  metric?: string
  value?: number
  change?: number
  comparison?: string
  confidence?: number
  dataSource?: string
}

export interface ProjectAnalysis {
  id: string
  projectId: string
  projectName: string
  status: string
  completion: number
  insights: string[]
  recommendations: string[]
  nextActions: string[]
  metrics: ProjectMetrics
  generatedAt: Date
}

export interface ProjectMetrics {
  timelineAdherence: number
  clientApprovalRate: number
  revisionCount: number
  profitMargin: number
  efficiency: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface AIModel {
  id: AIProvider
  name: string
  description: string
  capabilities: string[]
  maxTokens: number
  costPer1kTokens: number
  strengths: string[]
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string
  prompt: string
  category: string
}

export interface AIAnalytics {
  userId: string
  totalConversations: number
  totalMessages: number
  totalTokens: number
  avgResponseTime: number
  avgRating: number
  mostUsedProvider: AIProvider
  timeSavedHours: number
  revenueImpact: number
  efficiencyScore: number
  optimizationPotential: number
  periodStart: Date
  periodEnd: Date
}

export interface VoiceSettings {
  enabled: boolean
  language: string
  voiceId: string
  speed: number
  pitch: number
  autoSpeak: boolean
}

export interface ConversationExport {
  conversation: Conversation
  messages: Message[]
  insights: AIInsight[]
  analytics: Partial<AIAnalytics>
  exportedAt: Date
  format: 'json' | 'markdown' | 'pdf'
}

// ============================================
// MOCK DATA
// ============================================

export const mockAIModels: AIModel[] = [
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    description: 'Best for analysis, reasoning, and strategic thinking',
    capabilities: ['analysis', 'reasoning', 'long-context', 'coding', 'research'],
    maxTokens: 200000,
    costPer1kTokens: 0.015,
    strengths: ['Complex analysis', 'Strategic planning', 'Technical writing', 'Code review']
  },
  {
    id: 'openai',
    name: 'GPT-4 (OpenAI)',
    description: 'Excellent for creative tasks, content generation, and problem-solving',
    capabilities: ['creative', 'general', 'coding', 'image-generation', 'function-calling'],
    maxTokens: 128000,
    costPer1kTokens: 0.03,
    strengths: ['Creative writing', 'Brainstorming', 'Content creation', 'Image analysis']
  },
  {
    id: 'google',
    name: 'Gemini (Google)',
    description: 'Great for general assistance, multimodal tasks, and quick operations',
    capabilities: ['multimodal', 'general', 'quick-response', 'search-integration'],
    maxTokens: 32000,
    costPer1kTokens: 0.01,
    strengths: ['Quick answers', 'Multimodal tasks', 'Real-time info', 'General assistance']
  }
]

export const mockQuickActions: QuickAction[] = [
  {
    id: 'analyze-projects',
    label: 'Analyze My Projects',
    description: 'Get AI-powered insights on project performance and optimization opportunities',
    icon: 'BarChart3',
    prompt: 'Can you analyze my current projects and provide insights on performance, timelines, and optimization opportunities? Focus on identifying bottlenecks, efficiency improvements, and potential risks.',
    category: 'analysis'
  },
  {
    id: 'optimize-workflow',
    label: 'Optimize Workflow',
    description: 'Receive personalized suggestions to improve your daily workflow',
    icon: 'TrendingUp',
    prompt: 'Help me optimize my daily workflow and suggest productivity improvements based on my work patterns. Include recommendations for time management, task prioritization, and automation opportunities.',
    category: 'productivity'
  },
  {
    id: 'pricing-help',
    label: 'Pricing Guidance',
    description: 'Get market-based pricing recommendations for your services',
    icon: 'DollarSign',
    prompt: 'I need guidance on pricing my services. Can you analyze market rates and suggest optimal pricing strategies? Consider my skill level, experience, and service offerings.',
    category: 'business'
  },
  {
    id: 'client-communication',
    label: 'Client Communication',
    description: 'Create templates and strategies for effective client communication',
    icon: 'MessageSquare',
    prompt: 'Help me improve my client communication and create templates for common scenarios like project updates, deadline changes, scope discussions, and feedback requests.',
    category: 'communication'
  },
  {
    id: 'time-management',
    label: 'Time Management',
    description: 'Analyze your time allocation and get improvement suggestions',
    icon: 'Clock',
    prompt: 'Analyze my time allocation and suggest better time management strategies. Help me identify time-wasters, optimize my schedule, and improve work-life balance.',
    category: 'productivity'
  },
  {
    id: 'business-insights',
    label: 'Business Insights',
    description: 'Receive comprehensive insights on your business performance',
    icon: 'Brain',
    prompt: 'Provide insights on my business performance and suggest growth opportunities. Include analysis of revenue trends, client retention, service offerings, and market positioning.',
    category: 'business'
  },
  {
    id: 'proposal-writing',
    label: 'Write Proposal',
    description: 'Generate professional project proposals',
    icon: 'FileText',
    prompt: 'Help me write a professional project proposal. Include sections for project overview, scope, timeline, deliverables, pricing, and terms.',
    category: 'creative'
  },
  {
    id: 'market-research',
    label: 'Market Research',
    description: 'Get competitive analysis and market insights',
    icon: 'Search',
    prompt: 'Conduct market research for my services. Analyze competitor offerings, pricing strategies, market trends, and identify opportunities for differentiation.',
    category: 'analysis'
  }
]

export const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'user-123',
    title: 'Project Optimization Strategy',
    preview: 'How can I improve my project delivery times...',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 30 * 60000),
    tags: ['productivity', 'optimization', 'projects'],
    messageCount: 12,
    status: 'active',
    isPinned: true,
    isArchived: false,
    model: 'anthropic',
    metadata: {
      totalTokens: 15400,
      avgResponseTime: 2.3,
      userMessageCount: 6,
      assistantMessageCount: 6,
      avgRating: 0.9,
      lastProvider: 'anthropic'
    }
  },
  {
    id: '2',
    userId: 'user-123',
    title: 'Client Pricing Analysis',
    preview: 'What should I charge for web development...',
    timestamp: new Date(Date.now() - 24 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 12 * 60 * 60000),
    tags: ['pricing', 'business', 'strategy'],
    messageCount: 8,
    status: 'active',
    isPinned: false,
    isArchived: false,
    model: 'anthropic',
    metadata: {
      totalTokens: 10200,
      avgResponseTime: 1.8,
      userMessageCount: 4,
      assistantMessageCount: 4,
      avgRating: 1.0
    }
  },
  {
    id: '3',
    userId: 'user-123',
    title: 'Marketing Strategy Discussion',
    preview: 'Help me create a marketing plan for...',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    tags: ['marketing', 'growth', 'strategy'],
    messageCount: 15,
    status: 'active',
    isPinned: false,
    isArchived: false,
    model: 'openai',
    metadata: {
      totalTokens: 18600,
      avgResponseTime: 2.5,
      userMessageCount: 8,
      assistantMessageCount: 7
    }
  },
  {
    id: '4',
    userId: 'user-123',
    title: 'Portfolio Review & Suggestions',
    preview: 'Can you review my portfolio and suggest improvements...',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 4 * 24 * 60 * 60000),
    tags: ['portfolio', 'design', 'feedback'],
    messageCount: 10,
    status: 'archived',
    isPinned: false,
    isArchived: true,
    model: 'anthropic'
  },
  {
    id: '5',
    userId: 'user-123',
    title: 'Time Tracking Analysis',
    preview: 'Analyze my time tracking data for last month...',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 6 * 24 * 60 * 60000),
    tags: ['time-tracking', 'analytics', 'productivity'],
    messageCount: 6,
    status: 'active',
    isPinned: false,
    isArchived: false,
    model: 'google'
  },
  {
    id: '6',
    userId: 'user-123',
    title: 'Client Onboarding Process',
    preview: 'Help me streamline my client onboarding...',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 9 * 24 * 60 * 60000),
    tags: ['clients', 'onboarding', 'automation'],
    messageCount: 14,
    status: 'active',
    isPinned: false,
    isArchived: false,
    model: 'anthropic'
  },
  {
    id: '7',
    userId: 'user-123',
    title: 'Revenue Growth Strategies',
    preview: 'What strategies can I use to increase revenue...',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60000),
    lastMessageAt: new Date(Date.now() - 13 * 24 * 60 * 60000),
    tags: ['revenue', 'growth', 'business'],
    messageCount: 11,
    status: 'archived',
    isPinned: false,
    isArchived: true,
    model: 'openai'
  }
]

export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    content: "Hello! I'm your AI Assistant. I can help you optimize your workflow, analyze projects, provide business insights, and answer questions about your freelance business. What would you like to explore today?",
    type: 'assistant',
    timestamp: new Date(Date.now() - 120 * 60000),
    suggestions: [
      'Analyze my current projects',
      'Suggest productivity improvements',
      'Help with client communication',
      'Review my business metrics'
    ],
    rating: null,
    tokens: 85,
    provider: 'anthropic',
    cached: false
  },
  {
    id: '2',
    conversationId: '1',
    content: 'Can you analyze my current projects and provide insights on performance and optimization opportunities?',
    type: 'user',
    timestamp: new Date(Date.now() - 115 * 60000),
    rating: null
  },
  {
    id: '3',
    conversationId: '1',
    content: "I've analyzed your current projects and here are my key findings:\n\n**E-commerce Redesign** (75% complete)\n- Timeline: 15% ahead of schedule\n- Client feedback response: 2.3 days average\n- Design efficiency: 88%\n\n**Brand Identity Package** (90% complete)\n- First-time approval rate: 92%\n- Revision requests: 23% below average\n- Timeline adherence: Excellent\n\n**Key Opportunities:**\n1. Your video editing projects have 23% higher profit margins - consider expanding this service\n2. Projects using structured feedback workflows have 40% fewer revisions\n3. Clients using escrow have 65% higher retention rates\n\nWould you like me to dive deeper into any of these insights?",
    type: 'assistant',
    timestamp: new Date(Date.now() - 110 * 60000),
    suggestions: [
      'Expand video editing services',
      'Implement structured feedback',
      'Promote escrow system'
    ],
    rating: 'up',
    tokens: 245,
    provider: 'anthropic',
    cached: false,
    metadata: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      responseTime: 2.4
    }
  }
]

export const mockInsights: AIInsight[] = [
  {
    id: '0',
    userId: 'user-123',
    title: '🚀 NEW: AI-Powered Growth Engine',
    description: 'Unlock 110% revenue growth! Our Growth Hub uses research-backed strategies (2025 data) to optimize pricing, reduce CAC by 45%, and improve conversions by 35-78%.',
    category: 'growth',
    priority: 'high',
    action: 'Explore Growth Hub',
    actionUrl: '/dashboard/growth-hub',
    icon: 'Sparkles',
    metadata: {
      metric: 'Revenue Growth Potential',
      value: 110,
      confidence: 0.92,
      dataSource: 'Industry benchmarks 2025'
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60000)
  },
  {
    id: '1',
    userId: 'user-123',
    title: 'Productivity Opportunity',
    description: 'You spend 40% more time on revisions than industry average. Consider implementing structured feedback workflows.',
    category: 'productivity',
    priority: 'high',
    action: 'Implement feedback system',
    actionUrl: '/dashboard/pinpoint-feedback',
    icon: 'TrendingUp',
    metadata: {
      metric: 'Revision Time',
      value: 40,
      change: -15,
      comparison: 'vs industry average',
      confidence: 0.87
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60000)
  },
  {
    id: '2',
    userId: 'user-123',
    title: 'Revenue Growth Potential',
    description: 'Your video editing projects have 23% higher profit margins. Consider expanding this service line.',
    category: 'business',
    priority: 'high',
    action: 'Expand video services',
    actionUrl: '/dashboard/video-studio',
    icon: 'DollarSign',
    metadata: {
      metric: 'Profit Margin',
      value: 23,
      change: 8,
      comparison: 'vs other services',
      confidence: 0.91
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60000)
  },
  {
    id: '3',
    userId: 'user-123',
    title: 'Client Retention Insight',
    description: 'Clients who use your escrow system have 65% higher retention rates. Promote this feature more.',
    category: 'opportunity',
    priority: 'medium',
    action: 'Promote escrow system',
    actionUrl: '/dashboard/escrow',
    icon: 'Users',
    metadata: {
      metric: 'Client Retention',
      value: 65,
      change: 22,
      comparison: 'vs non-escrow clients',
      confidence: 0.88
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60000)
  },
  {
    id: '4',
    userId: 'user-123',
    title: 'Workflow Optimization',
    description: 'Your most productive hours are 9-11 AM. Schedule complex tasks during this window.',
    category: 'productivity',
    priority: 'medium',
    action: 'Adjust daily schedule',
    icon: 'Clock',
    metadata: {
      metric: 'Productivity Score',
      value: 92,
      comparison: '9-11 AM vs other hours',
      confidence: 0.84
    },
    createdAt: new Date(Date.now() - 36 * 60 * 60000)
  },
  {
    id: '5',
    userId: 'user-123',
    title: 'Pricing Optimization',
    description: 'Your rates are 15-20% below market average for your skill level. Consider gradual price increases.',
    category: 'business',
    priority: 'medium',
    action: 'Review pricing strategy',
    icon: 'TrendingUp',
    metadata: {
      metric: 'Pricing vs Market',
      value: -17.5,
      comparison: 'vs market average',
      confidence: 0.86
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60000)
  },
  {
    id: '6',
    userId: 'user-123',
    title: 'Client Communication Pattern',
    description: 'Projects with weekly updates have 45% fewer scope changes and delays.',
    category: 'optimization',
    priority: 'low',
    action: 'Implement weekly updates',
    icon: 'MessageSquare',
    metadata: {
      metric: 'Scope Changes',
      value: -45,
      comparison: 'weekly vs ad-hoc updates',
      confidence: 0.79
    },
    createdAt: new Date(Date.now() - 72 * 60 * 60000)
  }
]

export const mockProjectAnalyses: ProjectAnalysis[] = [
  {
    id: '1',
    projectId: 'proj-001',
    projectName: 'E-commerce Redesign',
    status: 'In Progress',
    completion: 75,
    insights: [
      'Project is 15% ahead of original timeline',
      'Client feedback response time: 2.3 days average',
      'Design iteration efficiency: 88%',
      'Stakeholder approval rate: 94%'
    ],
    recommendations: [
      'Schedule final review meeting for next week',
      'Prepare comprehensive testing documentation',
      'Create handover documentation early',
      'Consider upsell opportunities for maintenance'
    ],
    nextActions: [
      'Complete checkout flow testing',
      'Finalize mobile responsive design',
      'Prepare deployment checklist',
      'Schedule client demo session'
    ],
    metrics: {
      timelineAdherence: 115,
      clientApprovalRate: 94,
      revisionCount: 8,
      profitMargin: 42,
      efficiency: 88,
      riskLevel: 'low'
    },
    generatedAt: new Date(Date.now() - 2 * 60 * 60000)
  },
  {
    id: '2',
    projectId: 'proj-002',
    projectName: 'Brand Identity Package',
    status: 'Review',
    completion: 90,
    insights: [
      'Client approval rate: 92% first-time approval',
      'Revision requests: 23% below average',
      'Timeline adherence: Excellent',
      'Brand consistency score: 96%'
    ],
    recommendations: [
      'Present final brand guidelines document',
      'Offer additional brand applications',
      'Schedule brand implementation consultation',
      'Create case study for portfolio'
    ],
    nextActions: [
      'Deliver final logo variations',
      'Complete brand guidelines PDF',
      'Prepare usage examples',
      'Set up final presentation'
    ],
    metrics: {
      timelineAdherence: 105,
      clientApprovalRate: 92,
      revisionCount: 5,
      profitMargin: 38,
      efficiency: 91,
      riskLevel: 'low'
    },
    generatedAt: new Date(Date.now() - 4 * 60 * 60000)
  },
  {
    id: '3',
    projectId: 'proj-003',
    projectName: 'Mobile App Development',
    status: 'Planning',
    completion: 25,
    insights: [
      'Scope definition: 80% complete',
      'Technical requirements documented',
      'Initial wireframes approved',
      'Development environment ready'
    ],
    recommendations: [
      'Finalize feature prioritization with client',
      'Set up weekly progress check-ins',
      'Establish clear milestone deliverables',
      'Consider phased delivery approach'
    ],
    nextActions: [
      'Complete user flow diagrams',
      'Finalize tech stack selection',
      'Create detailed project timeline',
      'Set up project management board'
    ],
    metrics: {
      timelineAdherence: 100,
      clientApprovalRate: 85,
      revisionCount: 12,
      profitMargin: 35,
      efficiency: 75,
      riskLevel: 'medium'
    },
    generatedAt: new Date(Date.now() - 1 * 60 * 60000)
  }
]

export const mockAnalytics: AIAnalytics = {
  userId: 'user-123',
  totalConversations: 7,
  totalMessages: 86,
  totalTokens: 142500,
  avgResponseTime: 2.2,
  avgRating: 0.88,
  mostUsedProvider: 'anthropic',
  timeSavedHours: 24,
  revenueImpact: 3200,
  efficiencyScore: 92,
  optimizationPotential: 18,
  periodStart: new Date(Date.now() - 30 * 24 * 60 * 60000),
  periodEnd: new Date()
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format message timestamp
 */
export function formatMessageTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

/**
 * Format conversation preview
 */
export function formatConversationPreview(content: string, maxLength: number = 50): string {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

/**
 * Calculate conversation statistics
 */
export function calculateConversationStats(messages: Message[]): ConversationMetadata {
  const userMessages = messages.filter(m => m.type === 'user')
  const assistantMessages = messages.filter(m => m.type === 'assistant')
  const totalTokens = messages.reduce((sum, m) => sum + (m.tokens || 0), 0)
  const responseTimes = messages
    .filter(m => m.metadata?.responseTime)
    .map(m => m.metadata!.responseTime!)
  const ratings = messages.filter(m => m.rating !== null)
  const ratingScore = ratings.reduce((sum, m) => sum + (m.rating === 'up' ? 1 : -1), 0)

  return {
    totalTokens,
    avgResponseTime: responseTimes.length > 0
      ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
      : 0,
    userMessageCount: userMessages.length,
    assistantMessageCount: assistantMessages.length,
    avgRating: ratings.length > 0 ? ratingScore / ratings.length : 0
  }
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: InsightPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get category color class
 */
export function getCategoryColor(category: InsightCategory): string {
  switch (category) {
    case 'productivity':
      return 'bg-blue-100 text-blue-800'
    case 'business':
      return 'bg-green-100 text-green-800'
    case 'optimization':
      return 'bg-purple-100 text-purple-800'
    case 'opportunity':
      return 'bg-orange-100 text-orange-800'
    case 'growth':
      return 'bg-pink-100 text-pink-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Filter conversations by status
 */
export function filterConversationsByStatus(
  conversations: Conversation[],
  status: ConversationStatus
): Conversation[] {
  return conversations.filter(c => c.status === status)
}

/**
 * Filter conversations by tags
 */
export function filterConversationsByTags(
  conversations: Conversation[],
  tags: string[]
): Conversation[] {
  return conversations.filter(c =>
    tags.some(tag => c.tags.includes(tag.toLowerCase()))
  )
}

/**
 * Search conversations
 */
export function searchConversations(
  conversations: Conversation[],
  query: string
): Conversation[] {
  const lowerQuery = query.toLowerCase()
  return conversations.filter(c =>
    c.title.toLowerCase().includes(lowerQuery) ||
    c.preview.toLowerCase().includes(lowerQuery) ||
    c.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Sort conversations
 */
export function sortConversations(
  conversations: Conversation[],
  sortBy: 'recent' | 'messages' | 'title'
): Conversation[] {
  const sorted = [...conversations]

  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
    case 'messages':
      return sorted.sort((a, b) => b.messageCount - a.messageCount)
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sorted
  }
}

/**
 * Get pinned conversations
 */
export function getPinnedConversations(conversations: Conversation[]): Conversation[] {
  return conversations.filter(c => c.isPinned).sort((a, b) =>
    b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  )
}

/**
 * Filter insights by priority
 */
export function filterInsightsByPriority(
  insights: AIInsight[],
  priority: InsightPriority
): AIInsight[] {
  return insights.filter(i => i.priority === priority && !i.dismissedAt)
}

/**
 * Filter insights by category
 */
export function filterInsightsByCategory(
  insights: AIInsight[],
  category: InsightCategory
): AIInsight[] {
  return insights.filter(i => i.category === category && !i.dismissedAt)
}

/**
 * Get active insights (not dismissed or implemented)
 */
export function getActiveInsights(insights: AIInsight[]): AIInsight[] {
  return insights.filter(i => !i.dismissedAt && !i.implementedAt)
}

/**
 * Sort insights by priority and date
 */
export function sortInsights(insights: AIInsight[]): AIInsight[] {
  const priorityOrder: Record<InsightPriority, number> = {
    high: 0,
    medium: 1,
    low: 2
  }

  return [...insights].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

/**
 * Calculate analytics summary
 */
export function calculateAnalyticsSummary(analytics: AIAnalytics): {
  avgMessagesPerConversation: number
  totalCost: number
  productivityIncrease: string
  savingsPerMonth: string
} {
  const avgMessagesPerConversation = analytics.totalConversations > 0
    ? Math.round(analytics.totalMessages / analytics.totalConversations)
    : 0

  const totalCost = (analytics.totalTokens / 1000) * 0.015 // Average cost per 1k tokens

  const productivityIncrease = `${analytics.efficiencyScore}%`
  const savingsPerMonth = `$${analytics.revenueImpact.toLocaleString()}`

  return {
    avgMessagesPerConversation,
    totalCost,
    productivityIncrease,
    savingsPerMonth
  }
}

/**
 * Generate conversation title from first user message
 */
export function generateConversationTitle(firstMessage: string, maxLength: number = 50): string {
  const cleaned = firstMessage.trim().replace(/\n/g, ' ')
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength - 3) + '...'
}

/**
 * Export conversation to markdown
 */
export function exportConversationToMarkdown(
  conversation: Conversation,
  messages: Message[]
): string {
  let markdown = `# ${conversation.title}\n\n`
  markdown += `**Created:** ${conversation.timestamp.toLocaleString()}\n`
  markdown += `**Last Updated:** ${conversation.lastMessageAt.toLocaleString()}\n`
  markdown += `**Messages:** ${conversation.messageCount}\n`
  markdown += `**Tags:** ${conversation.tags.join(', ')}\n\n`
  markdown += `---\n\n`

  messages.forEach(msg => {
    const role = msg.type === 'user' ? 'You' : 'AI Assistant'
    markdown += `## ${role} (${formatMessageTime(msg.timestamp)})\n\n`
    markdown += `${msg.content}\n\n`

    if (msg.suggestions && msg.suggestions.length > 0) {
      markdown += `**Suggestions:**\n`
      msg.suggestions.forEach(s => markdown += `- ${s}\n`)
      markdown += `\n`
    }
  })

  markdown += `---\n\n`
  markdown += `*Exported from Kazi AI Assistant on ${new Date().toLocaleString()}*\n`

  return markdown
}

/**
 * Export conversation to JSON
 */
export function exportConversationToJSON(
  conversation: Conversation,
  messages: Message[],
  insights: AIInsight[] = []
): ConversationExport {
  return {
    conversation,
    messages,
    insights,
    analytics: {
      totalMessages: messages.length,
      totalTokens: messages.reduce((sum, m) => sum + (m.tokens || 0), 0),
      avgResponseTime: messages.filter(m => m.metadata?.responseTime).length > 0
        ? messages.filter(m => m.metadata?.responseTime)
          .reduce((sum, m) => sum + m.metadata!.responseTime!, 0) /
          messages.filter(m => m.metadata?.responseTime).length
        : 0
    },
    exportedAt: new Date(),
    format: 'json'
  }
}

/**
 * Get task type from model
 */
export function getTaskTypeFromModel(model: AIProvider): TaskType {
  switch (model) {
    case 'anthropic':
      return 'strategic'
    case 'openai':
      return 'creative'
    case 'google':
      return 'operational'
    default:
      return 'chat'
  }
}

/**
 * Get recommended model for task
 */
export function getRecommendedModel(taskType: TaskType): AIProvider {
  switch (taskType) {
    case 'strategic':
    case 'analysis':
      return 'anthropic'
    case 'creative':
      return 'openai'
    case 'operational':
    case 'chat':
      return 'google'
    default:
      return 'anthropic'
  }
}

/**
 * Generate AI suggestions based on context
 */
export function generateAISuggestions(
  userMessage: string,
  conversationHistory: Message[]
): string[] {
  const lowerMessage = userMessage.toLowerCase()

  // Project-related suggestions
  if (lowerMessage.includes('project')) {
    return [
      'Show me detailed project analytics',
      'Help with time tracking',
      'Suggest productivity tools',
      'Create project timeline'
    ]
  }

  // Pricing-related suggestions
  if (lowerMessage.includes('pricing') || lowerMessage.includes('price')) {
    return [
      'Create a pricing strategy',
      'Analyze competitor rates',
      'Calculate project ROI',
      'Generate pricing tiers'
    ]
  }

  // Client-related suggestions
  if (lowerMessage.includes('client')) {
    return [
      'Draft client update email',
      'Schedule follow-up tasks',
      'Create project timeline',
      'Generate client report'
    ]
  }

  // Time-related suggestions
  if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
    return [
      'Optimize daily schedule',
      'Set productivity goals',
      'Track time allocation',
      'Analyze time patterns'
    ]
  }

  // Default suggestions
  return [
    'Analyze my business metrics',
    'Help with workflow optimization',
    'Suggest growth strategies',
    'Review recent projects'
  ]
}

/**
 * Calculate project risk level
 */
export function calculateProjectRisk(metrics: ProjectMetrics): 'low' | 'medium' | 'high' {
  let riskScore = 0

  if (metrics.timelineAdherence < 90) riskScore += 2
  if (metrics.clientApprovalRate < 85) riskScore += 2
  if (metrics.revisionCount > 10) riskScore += 1
  if (metrics.efficiency < 80) riskScore += 1

  if (riskScore >= 4) return 'high'
  if (riskScore >= 2) return 'medium'
  return 'low'
}

/**
 * Format token count
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens} tokens`
  return `${(tokens / 1000).toFixed(1)}K tokens`
}

/**
 * Estimate token cost
 */
export function estimateTokenCost(tokens: number, provider: AIProvider): number {
  const model = mockAIModels.find(m => m.id === provider)
  if (!model) return 0
  return (tokens / 1000) * model.costPer1kTokens
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Get conversation share link
 */
export function getConversationShareLink(conversationId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/shared/conversations/${conversationId}`
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): {
  isValid: boolean
  error?: string
} {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' }
  }

  if (content.length > 10000) {
    return { isValid: false, error: 'Message is too long (max 10,000 characters)' }
  }

  return { isValid: true }
}

/**
 * Get AI model info
 */
export function getAIModelInfo(provider: AIProvider): AIModel | undefined {
  return mockAIModels.find(m => m.id === provider)
}

/**
 * Format response time
 */
export function formatResponseTime(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
}

/**
 * Get insight implementation status
 */
export function getInsightStatus(insight: AIInsight): 'active' | 'dismissed' | 'implemented' {
  if (insight.implementedAt) return 'implemented'
  if (insight.dismissedAt) return 'dismissed'
  return 'active'
}

/**
 * Calculate time saved
 */
export function calculateTimeSaved(
  analytics: AIAnalytics,
  avgManualTimePerTask: number = 1.5
): number {
  // Estimate time saved based on tasks automated by AI
  const tasksAutomated = analytics.totalMessages / 2 // Rough estimate
  return tasksAutomated * avgManualTimePerTask
}

/**
 * Get productivity trend
 */
export function getProductivityTrend(
  currentScore: number,
  previousScore: number
): 'up' | 'down' | 'stable' {
  const diff = currentScore - previousScore
  if (diff > 2) return 'up'
  if (diff < -2) return 'down'
  return 'stable'
}

// Export all functions
export default {
  // Mock data
  mockAIModels,
  mockQuickActions,
  mockConversations,
  mockMessages,
  mockInsights,
  mockProjectAnalyses,
  mockAnalytics,

  // Helper functions
  formatMessageTime,
  formatConversationPreview,
  calculateConversationStats,
  getPriorityColor,
  getCategoryColor,
  filterConversationsByStatus,
  filterConversationsByTags,
  searchConversations,
  sortConversations,
  getPinnedConversations,
  filterInsightsByPriority,
  filterInsightsByCategory,
  getActiveInsights,
  sortInsights,
  calculateAnalyticsSummary,
  generateConversationTitle,
  exportConversationToMarkdown,
  exportConversationToJSON,
  getTaskTypeFromModel,
  getRecommendedModel,
  generateAISuggestions,
  calculateProjectRisk,
  formatTokens,
  estimateTokenCost,
  formatCurrency,
  getConversationShareLink,
  validateMessageContent,
  getAIModelInfo,
  formatResponseTime,
  getInsightStatus,
  calculateTimeSaved,
  getProductivityTrend
}
