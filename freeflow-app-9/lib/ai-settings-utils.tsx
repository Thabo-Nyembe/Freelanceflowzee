// ============================================================================
// AI SETTINGS UTILITIES - PRODUCTION
// ============================================================================
// Comprehensive AI provider management with API keys, model configuration,
// usage tracking, rate limiting, and cost monitoring
// ============================================================================

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AISettingsUtils')

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'replicate' | 'huggingface' | 'cohere' | 'mistral'
export type ProviderStatus = 'connected' | 'disconnected' | 'testing' | 'error'
export type ModelCapability = 'text' | 'image' | 'audio' | 'video' | 'code' | 'embeddings' | 'vision' | 'multimodal'
export type UsagePeriod = 'hour' | 'day' | 'week' | 'month'

export interface AIProvider {
  id: string
  userId: string
  type: AIProviderType
  name: string
  description: string
  color: string
  status: ProviderStatus
  apiKey?: string
  apiKeyLastFour?: string
  apiEndpoint?: string
  models: AIModel[]
  features: string[]
  pricing: string
  isEnabled: boolean
  connectedAt?: string
  lastUsed?: string
  totalRequests: number
  totalTokens: number
  totalCost: number
  monthlyBudget?: number
  rateLimits: RateLimits
  settings: ProviderSettings
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AIModel {
  id: string
  name: string
  displayName: string
  capabilities: ModelCapability[]
  contextWindow: number
  maxTokens: number
  inputCostPer1k: number
  outputCostPer1k: number
  isDefault: boolean
  isDeprecated: boolean
  version?: string
}

export interface RateLimits {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  tokensPerMinute: number
  tokensPerDay: number
}

export interface ProviderSettings {
  temperature?: number
  topP?: number
  maxTokens?: number
  stopSequences?: string[]
  presencePenalty?: number
  frequencyPenalty?: number
  timeoutSeconds?: number
  retryAttempts?: number
  customInstructions?: string
}

export interface AIFeature {
  id: string
  userId: string
  name: string
  description: string
  providerId: string
  modelId: string
  isEnabled: boolean
  requiresKey: boolean
  usageCount: number
  lastUsed?: string
  config: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface UsageRecord {
  id: string
  userId: string
  providerId: string
  modelId: string
  featureId?: string
  requestType: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  latency: number // in ms
  status: 'success' | 'error' | 'timeout'
  errorMessage?: string
  timestamp: string
}

export interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  averageLatency: number
  successRate: number
  byProvider: Record<AIProviderType, ProviderUsage>
  byModel: Record<string, ModelUsage>
  byPeriod: Record<UsagePeriod, PeriodUsage>
  topFeatures: { featureId: string; name: string; count: number }[]
  lastUpdated: string
}

export interface ProviderUsage {
  requests: number
  tokens: number
  cost: number
  successRate: number
}

export interface ModelUsage {
  modelName: string
  requests: number
  tokens: number
  cost: number
}

export interface PeriodUsage {
  requests: number
  tokens: number
  cost: number
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const aiModels: Record<AIProviderType, AIModel[]> = {
  openai: [
    {
      id: 'gpt-4-turbo',
      name: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      capabilities: ['text', 'code', 'vision'],
      contextWindow: 128000,
      maxTokens: 4096,
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
      isDefault: true,
      isDeprecated: false,
      version: '1106'
    },
    {
      id: 'gpt-4-vision',
      name: 'gpt-4-vision-preview',
      displayName: 'GPT-4 Vision',
      capabilities: ['text', 'vision', 'multimodal'],
      contextWindow: 128000,
      maxTokens: 4096,
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
      isDefault: false,
      isDeprecated: false
    },
    {
      id: 'dall-e-3',
      name: 'dall-e-3',
      displayName: 'DALL-E 3',
      capabilities: ['image'],
      contextWindow: 0,
      maxTokens: 0,
      inputCostPer1k: 0.04,
      outputCostPer1k: 0,
      isDefault: false,
      isDeprecated: false
    }
  ],
  anthropic: [
    {
      id: 'claude-3-opus',
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      capabilities: ['text', 'code', 'vision'],
      contextWindow: 200000,
      maxTokens: 4096,
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
      isDefault: false,
      isDeprecated: false
    },
    {
      id: 'claude-3-sonnet',
      name: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      capabilities: ['text', 'code', 'vision'],
      contextWindow: 200000,
      maxTokens: 4096,
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
      isDefault: true,
      isDeprecated: false
    }
  ],
  google: [
    {
      id: 'gemini-pro',
      name: 'gemini-pro',
      displayName: 'Gemini Pro',
      capabilities: ['text', 'code'],
      contextWindow: 32000,
      maxTokens: 2048,
      inputCostPer1k: 0.00025,
      outputCostPer1k: 0.0005,
      isDefault: true,
      isDeprecated: false
    }
  ],
  replicate: [
    {
      id: 'sdxl',
      name: 'stability-ai/sdxl',
      displayName: 'Stable Diffusion XL',
      capabilities: ['image'],
      contextWindow: 0,
      maxTokens: 0,
      inputCostPer1k: 0.002,
      outputCostPer1k: 0,
      isDefault: true,
      isDeprecated: false
    }
  ],
  huggingface: [
    {
      id: 'mistral-7b',
      name: 'mistralai/mistral-7b-instruct',
      displayName: 'Mistral 7B',
      capabilities: ['text', 'code'],
      contextWindow: 8000,
      maxTokens: 2048,
      inputCostPer1k: 0.0001,
      outputCostPer1k: 0.0002,
      isDefault: true,
      isDeprecated: false
    }
  ],
  cohere: [
    {
      id: 'command-r',
      name: 'command-r',
      displayName: 'Command R',
      capabilities: ['text', 'embeddings'],
      contextWindow: 128000,
      maxTokens: 4096,
      inputCostPer1k: 0.0005,
      outputCostPer1k: 0.0015,
      isDefault: true,
      isDeprecated: false
    }
  ],
  mistral: [
    {
      id: 'mistral-large',
      name: 'mistral-large-latest',
      displayName: 'Mistral Large',
      capabilities: ['text', 'code'],
      contextWindow: 32000,
      maxTokens: 8192,
      inputCostPer1k: 0.004,
      outputCostPer1k: 0.012,
      isDefault: true,
      isDeprecated: false
    }
  ]
}

const providerColors: Record<AIProviderType, string> = {
  openai: 'from-green-500 to-emerald-500',
  anthropic: 'from-orange-500 to-red-500',
  google: 'from-blue-500 to-purple-500',
  replicate: 'from-purple-500 to-pink-500',
  huggingface: 'from-yellow-500 to-orange-500',
  cohere: 'from-indigo-500 to-blue-500',
  mistral: 'from-red-500 to-orange-500'
}

export function generateMockAIProviders(count: number = 7, userId: string = 'user-1'): AIProvider[] {
  logger.info('Generating mock AI providers', { count, userId })

  const providers: AIProvider[] = []
  const now = new Date()
  const providerTypes: AIProviderType[] = ['openai', 'anthropic', 'google', 'replicate', 'huggingface', 'cohere', 'mistral']

  providerTypes.slice(0, count).forEach((type, i) => {
    const isConnected = i < 3 // First 3 are connected
    const connectedAt = isConnected ? new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined

    providers.push({
      id: `provider-${i + 1}`,
      userId,
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      description: getProviderDescription(type),
      color: providerColors[type],
      status: isConnected ? 'connected' : 'disconnected',
      apiKey: isConnected ? `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` : undefined,
      apiKeyLastFour: isConnected ? Math.random().toString(36).substring(2, 6) : undefined,
      apiEndpoint: `https://api.${type}.com/v1`,
      models: aiModels[type] || [],
      features: getProviderFeatures(type),
      pricing: 'Pay per token',
      isEnabled: isConnected,
      connectedAt: connectedAt?.toISOString(),
      lastUsed: isConnected ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      totalRequests: isConnected ? Math.floor(Math.random() * 10000) : 0,
      totalTokens: isConnected ? Math.floor(Math.random() * 1000000) : 0,
      totalCost: isConnected ? Math.floor(Math.random() * 500 * 100) / 100 : 0,
      monthlyBudget: 100,
      rateLimits: {
        requestsPerMinute: [60, 100, 500][Math.floor(Math.random() * 3)],
        requestsPerHour: [1000, 5000, 10000][Math.floor(Math.random() * 3)],
        requestsPerDay: [10000, 50000, 100000][Math.floor(Math.random() * 3)],
        tokensPerMinute: [10000, 50000, 100000][Math.floor(Math.random() * 3)],
        tokensPerDay: [1000000, 5000000, 10000000][Math.floor(Math.random() * 3)]
      },
      settings: {
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 2048,
        timeoutSeconds: 30,
        retryAttempts: 3
      },
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  })

  logger.info('Mock AI providers generated successfully', {
    total: providers.length,
    connected: providers.filter(p => p.status === 'connected').length
  })

  return providers
}

function getProviderDescription(type: AIProviderType): string {
  const descriptions: Record<AIProviderType, string> = {
    openai: 'GPT-4, DALL-E, Whisper, and more',
    anthropic: 'Claude 3 Opus, Sonnet, and Haiku',
    google: 'Gemini Pro and Vision models',
    replicate: 'Open source AI models',
    huggingface: 'Transformers and open models',
    cohere: 'Command models and embeddings',
    mistral: 'High-performance language models'
  }
  return descriptions[type] || 'AI provider'
}

function getProviderFeatures(type: AIProviderType): string[] {
  const features: Record<AIProviderType, string[]> = {
    openai: ['Text Generation', 'Image Generation', 'Speech to Text', 'Vision Analysis'],
    anthropic: ['Advanced Reasoning', 'Code Analysis', 'Long Context', 'Safety Features'],
    google: ['Multimodal', 'Fast Processing', 'Large Context', 'Reasoning'],
    replicate: ['Image Generation', 'Video Processing', 'Audio Generation', 'Open Source'],
    huggingface: ['NLP Models', 'Computer Vision', 'Audio Processing', 'Custom Models'],
    cohere: ['Text Generation', 'Embeddings', 'Classification', 'Search'],
    mistral: ['Fast Inference', 'Long Context', 'Code Generation', 'Multilingual']
  }
  return features[type] || []
}

export function generateMockAIFeatures(count: number = 10, userId: string = 'user-1'): AIFeature[] {
  logger.info('Generating mock AI features', { count, userId })

  const features: AIFeature[] = []
  const now = new Date()

  const featureNames = [
    'AI Video Generation', 'AI Code Completion', 'AI Voice Synthesis', 'AI Image Generation',
    'Content Analysis', 'Sentiment Analysis', 'Language Translation', 'Text Summarization',
    'Question Answering', 'Document Classification'
  ]

  for (let i = 0; i < count; i++) {
    const isEnabled = Math.random() > 0.4

    features.push({
      id: `feature-${i + 1}`,
      userId,
      name: featureNames[i],
      description: `${featureNames[i]} powered by AI`,
      providerId: `provider-${(i % 7) + 1}`,
      modelId: `model-${(i % 3) + 1}`,
      isEnabled,
      requiresKey: true,
      usageCount: isEnabled ? Math.floor(Math.random() * 1000) : 0,
      lastUsed: isEnabled ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      config: {
        temperature: 0.7,
        maxTokens: 2048
      },
      createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock AI features generated successfully', { total: features.length })
  return features
}

export function generateMockUsageRecords(count: number = 50, userId: string = 'user-1'): UsageRecord[] {
  logger.info('Generating mock usage records', { count, userId })

  const records: UsageRecord[] = []
  const now = new Date()

  const requestTypes = ['completion', 'chat', 'embedding', 'image-generation', 'audio-transcription']

  for (let i = 0; i < count; i++) {
    const inputTokens = Math.floor(Math.random() * 2000) + 100
    const outputTokens = Math.floor(Math.random() * 1000) + 50
    const cost = ((inputTokens * 0.01) + (outputTokens * 0.03)) / 1000

    records.push({
      id: `usage-${i + 1}`,
      userId,
      providerId: `provider-${(i % 3) + 1}`,
      modelId: `model-${(i % 5) + 1}`,
      featureId: Math.random() > 0.3 ? `feature-${(i % 10) + 1}` : undefined,
      requestType: requestTypes[i % requestTypes.length],
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost,
      latency: Math.floor(Math.random() * 5000) + 200,
      status: Math.random() > 0.1 ? 'success' : 'error',
      errorMessage: Math.random() > 0.9 ? 'Rate limit exceeded' : undefined,
      timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock usage records generated successfully', { total: records.length })
  return records
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function calculateUsageStats(records: UsageRecord[]): UsageStats {
  logger.debug('Calculating usage statistics', { totalRecords: records.length })

  const byProvider: Record<string, ProviderUsage> = {}
  const byModel: Record<string, ModelUsage> = {}
  const byPeriod: Record<UsagePeriod, PeriodUsage> = {
    hour: { requests: 0, tokens: 0, cost: 0 },
    day: { requests: 0, tokens: 0, cost: 0 },
    week: { requests: 0, tokens: 0, cost: 0 },
    month: { requests: 0, tokens: 0, cost: 0 }
  }

  const featureCounts: Record<string, number> = {}
  let totalLatency = 0
  let successCount = 0

  const now = new Date()

  records.forEach(record => {
    // By provider
    if (!byProvider[record.providerId]) {
      byProvider[record.providerId] = { requests: 0, tokens: 0, cost: 0, successRate: 0 }
    }
    byProvider[record.providerId].requests++
    byProvider[record.providerId].tokens += record.totalTokens
    byProvider[record.providerId].cost += record.cost

    // By model
    if (!byModel[record.modelId]) {
      byModel[record.modelId] = { modelName: record.modelId, requests: 0, tokens: 0, cost: 0 }
    }
    byModel[record.modelId].requests++
    byModel[record.modelId].tokens += record.totalTokens
    byModel[record.modelId].cost += record.cost

    // By period
    const recordDate = new Date(record.timestamp)
    const hoursDiff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60)

    if (hoursDiff <= 1) {
      byPeriod.hour.requests++
      byPeriod.hour.tokens += record.totalTokens
      byPeriod.hour.cost += record.cost
    }
    if (hoursDiff <= 24) {
      byPeriod.day.requests++
      byPeriod.day.tokens += record.totalTokens
      byPeriod.day.cost += record.cost
    }
    if (hoursDiff <= 168) {
      byPeriod.week.requests++
      byPeriod.week.tokens += record.totalTokens
      byPeriod.week.cost += record.cost
    }
    if (hoursDiff <= 720) {
      byPeriod.month.requests++
      byPeriod.month.tokens += record.totalTokens
      byPeriod.month.cost += record.cost
    }

    // Features
    if (record.featureId) {
      featureCounts[record.featureId] = (featureCounts[record.featureId] || 0) + 1
    }

    totalLatency += record.latency
    if (record.status === 'success') successCount++
  })

  // Calculate success rates
  Object.keys(byProvider).forEach(key => {
    const providerRecords = records.filter(r => r.providerId === key)
    const providerSuccess = providerRecords.filter(r => r.status === 'success').length
    byProvider[key].successRate = providerRecords.length > 0 ? (providerSuccess / providerRecords.length) * 100 : 0
  })

  const topFeatures = Object.entries(featureCounts)
    .map(([featureId, count]) => ({ featureId, name: `Feature ${featureId}`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats: UsageStats = {
    totalRequests: records.length,
    totalTokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
    totalCost: records.reduce((sum, r) => sum + r.cost, 0),
    averageLatency: records.length > 0 ? totalLatency / records.length : 0,
    successRate: records.length > 0 ? (successCount / records.length) * 100 : 0,
    byProvider: byProvider as string,
    byModel,
    byPeriod,
    topFeatures,
    lastUpdated: new Date().toISOString()
  }

  logger.info('Statistics calculated', {
    totalRequests: stats.totalRequests,
    totalCost: stats.totalCost.toFixed(2),
    successRate: stats.successRate.toFixed(1)
  })

  return stats
}

export function validateApiKey(provider: AIProviderType, apiKey: string): boolean {
  logger.debug('Validating API key', { provider })

  const patterns: Record<AIProviderType, RegExp> = {
    openai: /^sk-[A-Za-z0-9]{48}$/,
    anthropic: /^sk-ant-[A-Za-z0-9-]{95}$/,
    google: /^[A-Za-z0-9_-]{39}$/,
    replicate: /^r8_[A-Za-z0-9]{40}$/,
    huggingface: /^hf_[A-Za-z0-9]{38}$/,
    cohere: /^[A-Za-z0-9]{40}$/,
    mistral: /^[A-Za-z0-9]{32}$/
  }

  return patterns[provider]?.test(apiKey) || apiKey.length > 20
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length < 8) return '****'
  return apiKey.slice(0, 4) + '****' + apiKey.slice(-4)
}

export function estimateCost(inputTokens: number, outputTokens: number, model: AIModel): number {
  const inputCost = (inputTokens / 1000) * model.inputCostPer1k
  const outputCost = (outputTokens / 1000) * model.outputCostPer1k
  return inputCost + outputCost
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  logger as aiSettingsLogger
}
