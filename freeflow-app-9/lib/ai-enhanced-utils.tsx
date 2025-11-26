/**
 * 🤖 AI ENHANCED UTILITIES
 * Comprehensive utilities for AI tools management and analytics
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Enhanced-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type AIToolType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'data' | 'assistant' | 'automation'
export type AIToolCategory = 'content' | 'design' | 'development' | 'analytics' | 'productivity' | 'creative'
export type AIToolStatus = 'active' | 'inactive' | 'training' | 'maintenance'
export type PricingTier = 'free' | 'basic' | 'pro' | 'enterprise'
export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor'
export type UsageMetricType = 'requests' | 'tokens' | 'images' | 'videos' | 'audio' | 'executions'

export interface AITool {
  id: string
  userId: string
  name: string
  type: AIToolType
  category: AIToolCategory
  description: string
  model: string
  provider: string
  status: AIToolStatus
  pricingTier: PricingTier
  performance: PerformanceLevel
  usageCount: number
  successRate: number
  avgResponseTime: number
  costPerUse: number
  totalCost: number
  createdAt: Date
  updatedAt: Date
  lastUsed: Date
  features: string[]
  tags: string[]
  isPopular: boolean
  isFavorite: boolean
  version: string
  capabilities: string[]
  limits: {
    daily: number
    monthly: number
    concurrent: number
  }
  config: Record<string, any>
}

export interface AIToolUsage {
  id: string
  toolId: string
  userId: string
  timestamp: Date
  duration: number
  success: boolean
  errorMessage?: string
  inputSize: number
  outputSize: number
  cost: number
  metadata: Record<string, any>
}

export interface AIProvider {
  id: string
  name: string
  description: string
  website: string
  apiKeyRequired: boolean
  supportedTypes: AIToolType[]
  status: 'active' | 'inactive' | 'deprecated'
  pricing: {
    tier: PricingTier
    costPerRequest: number
    costPerToken?: number
  }
  limits: {
    rateLimit: number
    quotaLimit: number
  }
  reliability: number // 0-100
  avgResponseTime: number
}

export interface AIModel {
  id: string
  name: string
  provider: string
  type: AIToolType
  version: string
  capabilities: string[]
  parameters: number
  contextWindow?: number
  maxTokens?: number
  inputCost?: number
  outputCost?: number
  quality: PerformanceLevel
  speed: number // 0-100
  accuracy: number // 0-100
  isMultimodal: boolean
}

export interface AIToolMetrics {
  toolId: string
  period: 'day' | 'week' | 'month' | 'year'
  totalUsage: number
  successfulUsage: number
  failedUsage: number
  totalCost: number
  avgResponseTime: number
  avgSuccessRate: number
  peakUsageTime: string
  mostCommonError?: string
  userSatisfaction: number // 0-100
}

export interface AIToolComparison {
  tool1: AITool
  tool2: AITool
  comparison: {
    performance: number // -100 to 100
    cost: number
    reliability: number
    speed: number
    features: {
      shared: string[]
      unique1: string[]
      unique2: string[]
    }
  }
  recommendation: string
}

export interface AIWorkflow {
  id: string
  userId: string
  name: string
  description: string
  tools: string[] // Tool IDs
  steps: AIWorkflowStep[]
  triggers: string[]
  schedule?: string
  isActive: boolean
  executionCount: number
  lastExecuted?: Date
  avgExecutionTime: number
  successRate: number
}

export interface AIWorkflowStep {
  id: string
  toolId: string
  order: number
  input: Record<string, any>
  output: Record<string, any>
  condition?: string
  onError: 'stop' | 'continue' | 'retry'
}

// ============================================================================
// MOCK DATA - 40 AI Tools
// ============================================================================

const toolTemplates = [
  { name: 'Content Writer Pro', type: 'text', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Image Generator Ultra', type: 'image', category: 'design', model: 'DALL-E 3', provider: 'OpenAI' },
  { name: 'Code Assistant', type: 'code', category: 'development', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Data Analyzer', type: 'data', category: 'analytics', model: 'Claude 3.5', provider: 'Anthropic' },
  { name: 'Voice Synthesizer', type: 'audio', category: 'creative', model: 'ElevenLabs', provider: 'ElevenLabs' },
  { name: 'Video Editor AI', type: 'video', category: 'creative', model: 'Runway Gen-2', provider: 'Runway' },
  { name: 'Smart Assistant', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Workflow Automator', type: 'automation', category: 'productivity', model: 'Custom', provider: 'Internal' },
  { name: 'SEO Optimizer', type: 'text', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Brand Designer', type: 'image', category: 'design', model: 'Midjourney', provider: 'Midjourney' },
  { name: 'Bug Detector', type: 'code', category: 'development', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Sentiment Analyzer', type: 'data', category: 'analytics', model: 'BERT', provider: 'Google' },
  { name: 'Podcast Creator', type: 'audio', category: 'creative', model: 'Whisper', provider: 'OpenAI' },
  { name: 'Subtitle Generator', type: 'video', category: 'content', model: 'Whisper', provider: 'OpenAI' },
  { name: 'Meeting Summarizer', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Email Responder', type: 'automation', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Blog Post Writer', type: 'text', category: 'content', model: 'Claude 3.5', provider: 'Anthropic' },
  { name: 'Logo Creator', type: 'image', category: 'design', model: 'Stable Diffusion', provider: 'Stability AI' },
  { name: 'API Generator', type: 'code', category: 'development', model: 'Codex', provider: 'OpenAI' },
  { name: 'Trend Forecaster', type: 'data', category: 'analytics', model: 'Prophet', provider: 'Facebook' },
  { name: 'Music Composer', type: 'audio', category: 'creative', model: 'Jukebox', provider: 'OpenAI' },
  { name: 'Animation Studio', type: 'video', category: 'creative', model: 'Stable Diffusion Video', provider: 'Stability AI' },
  { name: 'Research Assistant', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Task Scheduler', type: 'automation', category: 'productivity', model: 'Custom', provider: 'Internal' },
  { name: 'Social Media Manager', type: 'text', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Photo Enhancer', type: 'image', category: 'design', model: 'Topaz Labs', provider: 'Topaz' },
  { name: 'Code Reviewer', type: 'code', category: 'development', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Customer Insights', type: 'data', category: 'analytics', model: 'Custom ML', provider: 'Internal' },
  { name: 'Voiceover Generator', type: 'audio', category: 'creative', model: 'Play.ht', provider: 'Play.ht' },
  { name: 'Video Summarizer', type: 'video', category: 'content', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Project Planner', type: 'assistant', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Report Generator', type: 'automation', category: 'productivity', model: 'GPT-4o', provider: 'OpenAI' },
  { name: 'Copywriter AI', type: 'text', category: 'content', model: 'Jasper', provider: 'Jasper' },
  { name: 'UI Designer', type: 'image', category: 'design', model: 'Uizard', provider: 'Uizard' },
  { name: 'Test Generator', type: 'code', category: 'development', model: 'GitHub Copilot', provider: 'GitHub' },
  { name: 'Performance Monitor', type: 'data', category: 'analytics', model: 'Custom', provider: 'Internal' },
  { name: 'Sound Effects Creator', type: 'audio', category: 'creative', model: 'AudioCraft', provider: 'Meta' },
  { name: 'Thumbnail Maker', type: 'video', category: 'design', model: 'DALL-E 3', provider: 'OpenAI' },
  { name: 'Brainstorm Partner', type: 'assistant', category: 'productivity', model: 'Claude 3.5', provider: 'Anthropic' },
  { name: 'Invoice Processor', type: 'automation', category: 'productivity', model: 'Custom OCR', provider: 'Internal' }
]

export const mockAITools: AITool[] = toolTemplates.map((template, i) => {
  const statuses: AIToolStatus[] = ['active', 'active', 'active', 'inactive', 'training']
  const pricingTiers: PricingTier[] = ['free', 'basic', 'pro', 'enterprise']
  const performanceLevels: PerformanceLevel[] = ['excellent', 'good', 'fair', 'poor']

  const createdDate = new Date()
  createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90))

  const lastUsedDate = new Date()
  lastUsedDate.setHours(lastUsedDate.getHours() - Math.floor(Math.random() * 168))

  return {
    id: `AI-${String(i + 1).padStart(3, '0')}`,
    userId: 'user_demo_123',
    name: template.name,
    type: template.type as AIToolType,
    category: template.category as AIToolCategory,
    description: `Advanced AI-powered ${template.type} tool for ${template.category} tasks using ${template.model}`,
    model: template.model,
    provider: template.provider,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    pricingTier: pricingTiers[Math.floor(Math.random() * pricingTiers.length)],
    performance: performanceLevels[Math.floor(Math.random() * performanceLevels.length)],
    usageCount: Math.floor(Math.random() * 10000) + 100,
    successRate: 0.85 + Math.random() * 0.14,
    avgResponseTime: Math.random() * 3 + 0.5,
    costPerUse: Math.random() * 0.5 + 0.01,
    totalCost: Math.random() * 500 + 10,
    createdAt: createdDate,
    updatedAt: new Date(),
    lastUsed: lastUsedDate,
    features: [
      'Real-time processing',
      'Batch operations',
      'API integration',
      'Custom templates',
      'Version control',
      'Collaboration',
      'Export options'
    ].slice(0, Math.floor(Math.random() * 5) + 2),
    tags: ['AI', 'ML', 'Automated', 'Enterprise', 'Cloud', 'Premium'].slice(0, Math.floor(Math.random() * 4) + 1),
    isPopular: Math.random() > 0.7,
    isFavorite: Math.random() > 0.8,
    version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    capabilities: [
      'Text generation',
      'Image analysis',
      'Code completion',
      'Data processing',
      'Audio synthesis'
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    limits: {
      daily: Math.floor(Math.random() * 1000) + 100,
      monthly: Math.floor(Math.random() * 10000) + 1000,
      concurrent: Math.floor(Math.random() * 10) + 1
    },
    config: {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9
    }
  }
})

// ============================================================================
// MOCK DATA - AI Providers (10 items)
// ============================================================================

export const mockAIProviders: AIProvider[] = [
  {
    id: 'PROV-001',
    name: 'OpenAI',
    description: 'Leading AI research company with GPT-4o, DALL-E 3, and Whisper models',
    website: 'https://openai.com',
    apiKeyRequired: true,
    supportedTypes: ['text', 'image', 'audio', 'code', 'assistant'],
    status: 'active',
    pricing: {
      tier: 'pro',
      costPerRequest: 0.02,
      costPerToken: 0.00003
    },
    limits: {
      rateLimit: 5000,
      quotaLimit: 1000000
    },
    reliability: 99,
    avgResponseTime: 1.2
  },
  {
    id: 'PROV-002',
    name: 'Anthropic',
    description: 'AI safety company with Claude models',
    website: 'https://anthropic.com',
    apiKeyRequired: true,
    supportedTypes: ['text', 'code', 'data', 'assistant'],
    status: 'active',
    pricing: {
      tier: 'pro',
      costPerRequest: 0.015,
      costPerToken: 0.000025
    },
    limits: {
      rateLimit: 4000,
      quotaLimit: 800000
    },
    reliability: 98,
    avgResponseTime: 1.1
  },
  {
    id: 'PROV-003',
    name: 'Stability AI',
    description: 'Open-source AI for image and video generation',
    website: 'https://stability.ai',
    apiKeyRequired: true,
    supportedTypes: ['image', 'video'],
    status: 'active',
    pricing: {
      tier: 'basic',
      costPerRequest: 0.01
    },
    limits: {
      rateLimit: 3000,
      quotaLimit: 500000
    },
    reliability: 95,
    avgResponseTime: 2.5
  },
  {
    id: 'PROV-004',
    name: 'Google Cloud AI',
    description: 'Enterprise AI solutions with BERT, T5, and custom models',
    website: 'https://cloud.google.com/ai',
    apiKeyRequired: true,
    supportedTypes: ['text', 'image', 'data', 'video'],
    status: 'active',
    pricing: {
      tier: 'enterprise',
      costPerRequest: 0.025
    },
    limits: {
      rateLimit: 10000,
      quotaLimit: 2000000
    },
    reliability: 99,
    avgResponseTime: 0.9
  },
  {
    id: 'PROV-005',
    name: 'ElevenLabs',
    description: 'Premium AI voice synthesis and cloning',
    website: 'https://elevenlabs.io',
    apiKeyRequired: true,
    supportedTypes: ['audio'],
    status: 'active',
    pricing: {
      tier: 'pro',
      costPerRequest: 0.03
    },
    limits: {
      rateLimit: 2000,
      quotaLimit: 300000
    },
    reliability: 97,
    avgResponseTime: 1.8
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCost(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

export function getToolsByType(tools: AITool[], type: AIToolType): AITool[] {
  logger.debug('Filtering tools by type', { type, totalTools: tools.length })
  return tools.filter(t => t.type === type)
}

export function getToolsByCategory(tools: AITool[], category: AIToolCategory): AITool[] {
  logger.debug('Filtering tools by category', { category, totalTools: tools.length })
  return tools.filter(t => t.category === category)
}

export function getToolsByStatus(tools: AITool[], status: AIToolStatus): AITool[] {
  logger.debug('Filtering tools by status', { status, totalTools: tools.length })
  return tools.filter(t => t.status === status)
}

export function getToolsByProvider(tools: AITool[], provider: string): AITool[] {
  logger.debug('Filtering tools by provider', { provider, totalTools: tools.length })
  return tools.filter(t => t.provider === provider)
}

export function getActiveTools(tools: AITool[]): AITool[] {
  logger.debug('Getting active tools', { totalTools: tools.length })
  return tools.filter(t => t.status === 'active')
}

export function getPopularTools(tools: AITool[]): AITool[] {
  logger.debug('Getting popular tools', { totalTools: tools.length })
  return tools.filter(t => t.isPopular)
}

export function getFavoriteTools(tools: AITool[]): AITool[] {
  logger.debug('Getting favorite tools', { totalTools: tools.length })
  return tools.filter(t => t.isFavorite)
}

export function searchTools(tools: AITool[], query: string): AITool[] {
  const searchLower = query.toLowerCase()
  logger.debug('Searching tools', { query, totalTools: tools.length })

  return tools.filter(t =>
    t.name.toLowerCase().includes(searchLower) ||
    t.description.toLowerCase().includes(searchLower) ||
    t.provider.toLowerCase().includes(searchLower) ||
    t.model.toLowerCase().includes(searchLower) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )
}

export function sortToolsByUsage(tools: AITool[]): AITool[] {
  logger.debug('Sorting tools by usage', { totalTools: tools.length })
  return [...tools].sort((a, b) => b.usageCount - a.usageCount)
}

export function sortToolsByPerformance(tools: AITool[]): AITool[] {
  logger.debug('Sorting tools by performance', { totalTools: tools.length })
  const performanceScores = {
    excellent: 4,
    good: 3,
    fair: 2,
    poor: 1
  }
  return [...tools].sort((a, b) => performanceScores[b.performance] - performanceScores[a.performance])
}

export function sortToolsBySuccessRate(tools: AITool[]): AITool[] {
  logger.debug('Sorting tools by success rate', { totalTools: tools.length })
  return [...tools].sort((a, b) => b.successRate - a.successRate)
}

export function sortToolsByCost(tools: AITool[]): AITool[] {
  logger.debug('Sorting tools by cost', { totalTools: tools.length })
  return [...tools].sort((a, b) => a.costPerUse - b.costPerUse)
}

export function calculateToolStats(tools: AITool[]) {
  logger.debug('Calculating tool statistics', { totalTools: tools.length })

  const totalTools = tools.length
  const activeTools = tools.filter(t => t.status === 'active').length
  const totalUsage = tools.reduce((sum, t) => sum + t.usageCount, 0)
  const totalCost = tools.reduce((sum, t) => sum + t.totalCost, 0)
  const avgSuccessRate = tools.reduce((sum, t) => sum + t.successRate, 0) / totalTools
  const avgResponseTime = tools.reduce((sum, t) => sum + t.avgResponseTime, 0) / totalTools

  const typeDistribution = tools.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryDistribution = tools.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const providerDistribution = tools.reduce((acc, t) => {
    acc[t.provider] = (acc[t.provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = {
    totalTools,
    activeTools,
    inactiveTools: totalTools - activeTools,
    totalUsage,
    totalCost,
    avgSuccessRate,
    avgResponseTime,
    avgCostPerUse: totalCost / totalUsage,
    typeDistribution,
    categoryDistribution,
    providerDistribution,
    popularTools: tools.filter(t => t.isPopular).length,
    favoriteTools: tools.filter(t => t.isFavorite).length
  }

  logger.info('Tool statistics calculated', stats)
  return stats
}

export function getToolPerformanceScore(tool: AITool): number {
  const performanceScores = {
    excellent: 100,
    good: 75,
    fair: 50,
    poor: 25
  }

  const performanceWeight = 0.3
  const successRateWeight = 0.3
  const responseTimeWeight = 0.2
  const usageWeight = 0.2

  const performanceScore = performanceScores[tool.performance] * performanceWeight
  const successScore = tool.successRate * 100 * successRateWeight
  const responseScore = Math.max(0, 100 - (tool.avgResponseTime * 20)) * responseTimeWeight
  const usageScore = Math.min(100, (tool.usageCount / 100)) * usageWeight

  const totalScore = performanceScore + successScore + responseScore + usageScore

  logger.debug('Tool performance score calculated', {
    toolId: tool.id,
    score: totalScore,
    breakdown: { performanceScore, successScore, responseScore, usageScore }
  })

  return Math.round(totalScore)
}

export function getToolCostEfficiency(tool: AITool): {
  score: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
} {
  const efficiency = (tool.successRate * tool.usageCount) / (tool.totalCost || 1)
  let rating: 'excellent' | 'good' | 'fair' | 'poor'

  if (efficiency > 1000) rating = 'excellent'
  else if (efficiency > 500) rating = 'good'
  else if (efficiency > 100) rating = 'fair'
  else rating = 'poor'

  logger.debug('Tool cost efficiency calculated', { toolId: tool.id, efficiency, rating })

  return { score: Math.round(efficiency), rating }
}

export function compareTools(tool1: AITool, tool2: AITool): AIToolComparison {
  logger.debug('Comparing tools', { tool1Id: tool1.id, tool2Id: tool2.id })

  const performance1 = getToolPerformanceScore(tool1)
  const performance2 = getToolPerformanceScore(tool2)

  const cost1 = tool1.costPerUse
  const cost2 = tool2.costPerUse

  const sharedFeatures = tool1.features.filter(f => tool2.features.includes(f))
  const unique1 = tool1.features.filter(f => !tool2.features.includes(f))
  const unique2 = tool2.features.filter(f => !tool1.features.includes(f))

  const comparison: AIToolComparison = {
    tool1,
    tool2,
    comparison: {
      performance: performance1 - performance2,
      cost: ((cost2 - cost1) / cost1) * 100,
      reliability: (tool1.successRate - tool2.successRate) * 100,
      speed: ((tool2.avgResponseTime - tool1.avgResponseTime) / tool1.avgResponseTime) * 100,
      features: {
        shared: sharedFeatures,
        unique1,
        unique2
      }
    },
    recommendation: performance1 > performance2 ? tool1.name : tool2.name
  }

  logger.info('Tool comparison complete', { comparison })
  return comparison
}

export function getRecommendedTools(
  tools: AITool[],
  type?: AIToolType,
  category?: AIToolCategory,
  limit: number = 5
): AITool[] {
  logger.debug('Getting recommended tools', { type, category, limit })

  let filtered = tools.filter(t => t.status === 'active')

  if (type) {
    filtered = filtered.filter(t => t.type === type)
  }

  if (category) {
    filtered = filtered.filter(t => t.category === category)
  }

  // Sort by performance score
  const sorted = filtered.map(tool => ({
    tool,
    score: getToolPerformanceScore(tool)
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  .map(item => item.tool)

  logger.info('Recommended tools retrieved', { count: sorted.length })
  return sorted
}

export function getMostCostEffectiveTools(tools: AITool[], limit: number = 5): AITool[] {
  logger.debug('Getting most cost-effective tools', { limit })

  const withEfficiency = tools.map(tool => ({
    tool,
    efficiency: getToolCostEfficiency(tool).score
  }))
  .sort((a, b) => b.efficiency - a.efficiency)
  .slice(0, limit)
  .map(item => item.tool)

  logger.info('Most cost-effective tools retrieved', { count: withEfficiency.length })
  return withEfficiency
}

export function getToolUsageTrend(tool: AITool, period: 'day' | 'week' | 'month'): {
  trend: 'up' | 'down' | 'stable'
  change: number
} {
  // Mock trend calculation - in production, compare with historical data
  const randomChange = (Math.random() - 0.5) * 40

  let trend: 'up' | 'down' | 'stable'
  if (randomChange > 5) trend = 'up'
  else if (randomChange < -5) trend = 'down'
  else trend = 'stable'

  logger.debug('Tool usage trend calculated', { toolId: tool.id, period, trend, change: randomChange })

  return { trend, change: randomChange }
}

export function getToolStatusColor(status: AIToolStatus): string {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    training: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status]
}

export function getPerformanceColor(performance: PerformanceLevel): string {
  const colors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800'
  }
  return colors[performance]
}

export function getPricingTierColor(tier: PricingTier): string {
  const colors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  }
  return colors[tier]
}

logger.info('AI Enhanced utilities initialized', {
  mockTools: mockAITools.length,
  mockProviders: mockAIProviders.length
})
