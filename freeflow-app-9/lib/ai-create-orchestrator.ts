/**
 * KAZI AI CREATE ORCHESTRATOR
 * World-class AI content generation system with multi-model support,
 * intelligent routing, caching, and collaborative features.
 *
 * WORLD-FIRST FEATURES:
 * - Multi-model ensemble generation
 * - Real-time collaborative AI sessions
 * - Intelligent prompt enhancement
 * - Smart caching and optimization
 * - Advanced file analysis and processing
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AIOrchestrator')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'stability' | 'elevenlabs' | 'runway' | 'midjourney' | 'openrouter'
  type: 'text' | 'image' | 'video' | 'audio' | 'multimodal'
  capabilities: AICapability[]
  pricing: {
    inputTokens: number  // per 1K tokens (0 for free models)
    outputTokens: number // per 1K tokens (0 for free models)
    imageGeneration?: number // per image
    videoGeneration?: number // per second
    audioGeneration?: number // per second
  }
  performance: {
    latency: 'low' | 'medium' | 'high' // Response time
    quality: 'standard' | 'premium' | 'ultra' // Output quality
    reliability: number // 0-100 uptime score
  }
  limits: {
    maxTokens: number
    maxConcurrentRequests: number
    rateLimit: {
      requests: number
      window: number // in seconds
    }
  }
  tier: 'free' | 'paid' // Model tier for user access
}

export type AICapability =
  | 'text-generation'
  | 'code-generation'
  | 'image-generation'
  | 'image-analysis'
  | 'video-generation'
  | 'video-analysis'
  | 'audio-generation'
  | 'audio-analysis'
  | 'document-analysis'
  | 'color-extraction'
  | 'style-transfer'
  | 'lut-generation'
  | 'preset-creation'
  | 'pattern-recognition'
  | 'real-time-collaboration'

export interface GenerationRequest {
  id: string
  type: 'creative-asset' | 'content' | 'code' | 'analysis'
  prompt: string
  referenceFiles?: File[]
  parameters: {
    model?: string
    temperature?: number
    maxTokens?: number
    style?: string
    colorScheme?: string
    quality?: 'draft' | 'standard' | 'premium' | 'ultra'
  }
  metadata: {
    userId: string
    sessionId: string
    timestamp: number
    collaborative?: boolean
    collaborators?: string[]
  }
}

export interface GenerationResult {
  id: string
  requestId: string
  model: string
  content: {
    type: 'text' | 'image' | 'video' | 'audio' | 'data'
    data: string | ArrayBuffer
    metadata: Record<string, any>
  }
  analysis?: {
    colors?: string[]
    dimensions?: { width: number; height: number }
    duration?: number
    fileSize?: number
    quality?: number
  }
  performance: {
    latency: number
    tokensUsed: number
    cost: number
    cacheHit: boolean
  }
  timestamp: number
}

export interface CollaborativeSession {
  id: string
  createdAt: number
  createdBy: string
  participants: SessionParticipant[]
  sharedContext: {
    prompt: string
    referenceFiles: FileMetadata[]
    currentGeneration?: GenerationResult
    history: GenerationResult[]
  }
  status: 'active' | 'paused' | 'completed'
}

export interface SessionParticipant {
  userId: string
  userName: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: number
  status: 'active' | 'idle' | 'offline'
  cursor?: { x: number; y: number }
  currentlyViewing?: string
}

export interface FileMetadata {
  id: string
  name: string
  type: string
  size: number
  url: string
  analysis?: FileAnalysisResult
}

export interface FileAnalysisResult {
  type: 'image' | 'video' | 'audio' | 'document'
  primaryAnalysis: Record<string, any>
  suggestions: string[]
  extractedData: {
    colors?: string[]
    dimensions?: { width: number; height: number }
    duration?: number
    tempo?: number
    key?: string
    dominantThemes?: string[]
  }
}

// ============================================================================
// AI MODEL REGISTRY
// ============================================================================

export const AI_MODEL_REGISTRY: Record<string, AIModel> = {
  // ============================================================================
  // FREE MODELS (via OpenRouter)
  // ============================================================================
  'openrouter/mistral-7b-instruct-free': {
    id: 'openrouter/mistral-7b-instruct-free',
    name: 'Mistral 7B Instruct (Free)',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'code-generation'],
    pricing: { inputTokens: 0, outputTokens: 0 }, // FREE!
    performance: { latency: 'low', quality: 'standard', reliability: 95 },
    limits: { maxTokens: 32768, maxConcurrentRequests: 50, rateLimit: { requests: 200, window: 60 } },
    tier: 'free'
  },
  'openrouter/mythomax-l2-13b-free': {
    id: 'openrouter/mythomax-l2-13b-free',
    name: 'MythoMax L2 13B (Free)',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'code-generation', 'pattern-recognition'],
    pricing: { inputTokens: 0, outputTokens: 0 }, // FREE!
    performance: { latency: 'medium', quality: 'standard', reliability: 94 },
    limits: { maxTokens: 8192, maxConcurrentRequests: 40, rateLimit: { requests: 180, window: 60 } },
    tier: 'free'
  },
  'openrouter/cinematika-7b-free': {
    id: 'openrouter/cinematika-7b-free',
    name: 'Cinematika 7B (Free)',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'document-analysis'],
    pricing: { inputTokens: 0, outputTokens: 0 }, // FREE!
    performance: { latency: 'low', quality: 'standard', reliability: 93 },
    limits: { maxTokens: 8000, maxConcurrentRequests: 40, rateLimit: { requests: 180, window: 60 } },
    tier: 'free'
  },
  'openrouter/phi-3-mini-free': {
    id: 'openrouter/phi-3-mini-free',
    name: 'Phi-3 Mini (Free)',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'code-generation'],
    pricing: { inputTokens: 0, outputTokens: 0 }, // FREE!
    performance: { latency: 'low', quality: 'standard', reliability: 96 },
    limits: { maxTokens: 128000, maxConcurrentRequests: 60, rateLimit: { requests: 200, window: 60 } },
    tier: 'free'
  },

  // ============================================================================
  // AFFORDABLE MODELS (via OpenRouter)
  // ============================================================================
  'openrouter/llama-3.1-8b': {
    id: 'openrouter/llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'code-generation', 'document-analysis'],
    pricing: { inputTokens: 0.00006, outputTokens: 0.00006 }, // $0.06 per 1M tokens - super affordable!
    performance: { latency: 'low', quality: 'premium', reliability: 97 },
    limits: { maxTokens: 131072, maxConcurrentRequests: 80, rateLimit: { requests: 300, window: 60 } },
    tier: 'paid'
  },
  'openrouter/llama-3.1-70b': {
    id: 'openrouter/llama-3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'code-generation', 'document-analysis', 'pattern-recognition'],
    pricing: { inputTokens: 0.00036, outputTokens: 0.00036 }, // $0.36 per 1M tokens
    performance: { latency: 'medium', quality: 'premium', reliability: 98 },
    limits: { maxTokens: 131072, maxConcurrentRequests: 60, rateLimit: { requests: 250, window: 60 } },
    tier: 'paid'
  },
  'openrouter/mixtral-8x7b': {
    id: 'openrouter/mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'openrouter',
    type: 'text',
    capabilities: ['text-generation', 'code-generation', 'document-analysis', 'pattern-recognition'],
    pricing: { inputTokens: 0.00024, outputTokens: 0.00024 }, // $0.24 per 1M tokens
    performance: { latency: 'medium', quality: 'premium', reliability: 97 },
    limits: { maxTokens: 32768, maxConcurrentRequests: 70, rateLimit: { requests: 280, window: 60 } },
    tier: 'paid'
  },

  // ============================================================================
  // PREMIUM MODELS
  // ============================================================================
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    type: 'multimodal',
    capabilities: ['text-generation', 'code-generation', 'image-analysis', 'document-analysis'],
    pricing: { inputTokens: 0.005, outputTokens: 0.015 },
    performance: { latency: 'medium', quality: 'ultra', reliability: 99 },
    limits: { maxTokens: 128000, maxConcurrentRequests: 100, rateLimit: { requests: 500, window: 60 } },
    tier: 'paid'
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    type: 'multimodal',
    capabilities: ['text-generation', 'code-generation', 'image-analysis', 'document-analysis', 'pattern-recognition'],
    pricing: { inputTokens: 0.003, outputTokens: 0.015 },
    performance: { latency: 'low', quality: 'ultra', reliability: 99 },
    limits: { maxTokens: 200000, maxConcurrentRequests: 100, rateLimit: { requests: 1000, window: 60 } },
    tier: 'paid'
  },
  'gemini-pro-vision': {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'google',
    type: 'multimodal',
    capabilities: ['text-generation', 'image-analysis', 'video-analysis', 'color-extraction'],
    pricing: { inputTokens: 0.00025, outputTokens: 0.0005 },
    performance: { latency: 'low', quality: 'premium', reliability: 98 },
    limits: { maxTokens: 32000, maxConcurrentRequests: 60, rateLimit: { requests: 600, window: 60 } },
    tier: 'paid'
  },
  'stable-diffusion-xl': {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'stability',
    type: 'image',
    capabilities: ['image-generation', 'style-transfer', 'color-extraction'],
    pricing: { inputTokens: 0, outputTokens: 0, imageGeneration: 0.04 },
    performance: { latency: 'medium', quality: 'ultra', reliability: 97 },
    limits: { maxTokens: 0, maxConcurrentRequests: 50, rateLimit: { requests: 150, window: 60 } },
    tier: 'paid'
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    type: 'image',
    capabilities: ['image-generation', 'style-transfer'],
    pricing: { inputTokens: 0, outputTokens: 0, imageGeneration: 0.08 },
    performance: { latency: 'high', quality: 'ultra', reliability: 98 },
    limits: { maxTokens: 0, maxConcurrentRequests: 30, rateLimit: { requests: 50, window: 60 } },
    tier: 'paid'
  }
}

// ============================================================================
// INTELLIGENT MODEL SELECTOR
// ============================================================================

export class IntelligentModelSelector {
  private usageHistory: Map<string, number> = new Map()
  private performanceMetrics: Map<string, { avgLatency: number; successRate: number }> = new Map()

  /**
   * Select the best model for a given request based on:
   * - Required capabilities
   * - User preferences (quality vs cost vs speed)
   * - Historical performance
   * - Current availability
   */
  selectBestModel(request: GenerationRequest): AIModel {
    const requiredCapabilities = this.determineRequiredCapabilities(request)
    const eligibleModels = Object.values(AI_MODEL_REGISTRY).filter(model =>
      requiredCapabilities.every(cap => model.capabilities.includes(cap))
    )

    if (eligibleModels.length === 0) {
      throw new Error('No suitable model found for this request')
    }

    // Score each model
    const scoredModels = eligibleModels.map(model => ({
      model,
      score: this.calculateModelScore(model, request)
    }))

    // Sort by score and return best
    scoredModels.sort((a, b) => b.score - a.score)

    logger.info('Model selected', {
      selectedModel: scoredModels[0].model.id,
      score: scoredModels[0].score,
      alternatives: scoredModels.slice(1, 3).map(s => ({ model: s.model.id, score: s.score }))
    })

    return scoredModels[0].model
  }

  private determineRequiredCapabilities(request: GenerationRequest): AICapability[] {
    const capabilities: AICapability[] = []

    // Determine based on request type
    switch (request.type) {
      case 'creative-asset':
        if (request.referenceFiles?.some(f => f.type.startsWith('image'))) {
          capabilities.push('image-analysis', 'color-extraction')
        }
        if (request.prompt.toLowerCase().includes('lut') || request.prompt.toLowerCase().includes('preset')) {
          capabilities.push('lut-generation', 'preset-creation')
        }
        capabilities.push('image-generation')
        break

      case 'content':
        capabilities.push('text-generation')
        if (request.referenceFiles?.length) {
          capabilities.push('document-analysis')
        }
        break

      case 'code':
        capabilities.push('code-generation')
        break

      case 'analysis':
        if (request.referenceFiles?.some(f => f.type.startsWith('image'))) {
          capabilities.push('image-analysis')
        }
        if (request.referenceFiles?.some(f => f.type.startsWith('video'))) {
          capabilities.push('video-analysis')
        }
        if (request.referenceFiles?.some(f => f.type.startsWith('audio'))) {
          capabilities.push('audio-analysis')
        }
        break
    }

    return capabilities
  }

  private calculateModelScore(model: AIModel, request: GenerationRequest): number {
    let score = 0

    // Quality preference
    const qualityWeight = request.parameters.quality === 'ultra' ? 40 :
                         request.parameters.quality === 'premium' ? 30 :
                         request.parameters.quality === 'standard' ? 20 : 10

    if (model.performance.quality === 'ultra') score += qualityWeight
    else if (model.performance.quality === 'premium') score += qualityWeight * 0.7
    else score += qualityWeight * 0.4

    // Cost efficiency (inverse relationship)
    const avgCost = (model.pricing.inputTokens + model.pricing.outputTokens) / 2
    score += (1 / (avgCost + 0.001)) * 20

    // Latency preference
    const latencyWeight = 20
    if (model.performance.latency === 'low') score += latencyWeight
    else if (model.performance.latency === 'medium') score += latencyWeight * 0.6
    else score += latencyWeight * 0.3

    // Reliability
    score += (model.performance.reliability / 100) * 20

    // Historical performance
    const metrics = this.performanceMetrics.get(model.id)
    if (metrics) {
      score += metrics.successRate * 10
      score += Math.max(0, (5000 - metrics.avgLatency) / 5000) * 10
    }

    return score
  }

  recordUsage(modelId: string, latency: number, success: boolean) {
    const usage = this.usageHistory.get(modelId) || 0
    this.usageHistory.set(modelId, usage + 1)

    const metrics = this.performanceMetrics.get(modelId) || { avgLatency: 0, successRate: 1 }
    metrics.avgLatency = (metrics.avgLatency * 0.9) + (latency * 0.1) // Exponential moving average
    metrics.successRate = (metrics.successRate * 0.95) + (success ? 0.05 : 0) // EMA
    this.performanceMetrics.set(modelId, metrics)
  }
}

// ============================================================================
// SMART CACHING SYSTEM
// ============================================================================

export class SmartCacheSystem {
  private cache: Map<string, { result: GenerationResult; expiresAt: number; hits: number }> = new Map()
  private readonly DEFAULT_TTL = 3600000 // 1 hour
  private readonly MAX_CACHE_SIZE = 1000

  /**
   * Generate a cache key from request parameters
   */
  private getCacheKey(request: GenerationRequest): string {
    const key = {
      prompt: request.prompt,
      model: request.parameters.model,
      temperature: request.parameters.temperature,
      style: request.parameters.style,
      colorScheme: request.parameters.colorScheme
    }
    return JSON.stringify(key)
  }

  /**
   * Check if similar request exists in cache
   */
  get(request: GenerationRequest): GenerationResult | null {
    const key = this.getCacheKey(request)
    const cached = this.cache.get(key)

    if (!cached) {
      logger.debug('Cache miss', { prompt: request.prompt.substring(0, 50) })
      return null
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      logger.debug('Cache expired', { prompt: request.prompt.substring(0, 50) })
      return null
    }

    cached.hits++
    logger.info('Cache hit', {
      prompt: request.prompt.substring(0, 50),
      hits: cached.hits,
      age: Math.floor((Date.now() - (cached.expiresAt - this.DEFAULT_TTL)) / 1000)
    })

    return { ...cached.result, performance: { ...cached.result.performance, cacheHit: true } }
  }

  /**
   * Store result in cache
   */
  set(request: GenerationRequest, result: GenerationResult, ttl?: number): void {
    const key = this.getCacheKey(request)

    // Evict least recently used if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU()
    }

    this.cache.set(key, {
      result,
      expiresAt: Date.now() + (ttl || this.DEFAULT_TTL),
      hits: 0
    })

    logger.debug('Cached result', {
      prompt: request.prompt.substring(0, 50),
      cacheSize: this.cache.size
    })
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, value] of this.cache.entries()) {
      const age = value.expiresAt - this.DEFAULT_TTL
      if (age < oldestTime) {
        oldestTime = age
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      logger.debug('Evicted LRU cache entry')
    }
  }

  clear(): void {
    this.cache.clear()
    logger.info('Cache cleared')
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key: key.substring(0, 100),
        hits: value.hits,
        expiresIn: Math.max(0, value.expiresAt - Date.now())
      }))
    }
  }
}

// ============================================================================
// PROMPT ENHANCEMENT ENGINE
// ============================================================================

export class PromptEnhancementEngine {
  /**
   * Enhance user prompt with context and best practices
   */
  enhancePrompt(
    originalPrompt: string,
    context: {
      referenceFiles?: FileAnalysisResult[]
      style?: string
      colorScheme?: string
      targetType?: string
    }
  ): string {
    let enhanced = originalPrompt

    // Add context from reference files
    if (context.referenceFiles && context.referenceFiles.length > 0) {
      const fileContext = this.extractFileContext(context.referenceFiles)
      enhanced = `${enhanced}\n\nReference Context:\n${fileContext}`
    }

    // Add style guidance
    if (context.style) {
      enhanced = `${enhanced}\n\nStyle: ${context.style}`
    }

    // Add color scheme if applicable
    if (context.colorScheme) {
      enhanced = `${enhanced}\n\nColor Scheme: ${context.colorScheme}`
    }

    // Add quality markers
    enhanced = `${enhanced}\n\nQuality Requirements: Professional, high-quality output suitable for commercial use.`

    logger.debug('Prompt enhanced', {
      originalLength: originalPrompt.length,
      enhancedLength: enhanced.length,
      hasReferences: !!context.referenceFiles?.length
    })

    return enhanced
  }

  private extractFileContext(analyses: FileAnalysisResult[]): string {
    const contexts: string[] = []

    for (const analysis of analyses) {
      if (analysis.type === 'image' && analysis.extractedData.colors) {
        contexts.push(`- Image colors: ${analysis.extractedData.colors.join(', ')}`)
      }
      if (analysis.extractedData.dimensions) {
        contexts.push(`- Dimensions: ${analysis.extractedData.dimensions.width}x${analysis.extractedData.dimensions.height}`)
      }
      if (analysis.extractedData.tempo) {
        contexts.push(`- Music tempo: ${analysis.extractedData.tempo} BPM`)
      }
      if (analysis.extractedData.key) {
        contexts.push(`- Musical key: ${analysis.extractedData.key}`)
      }
    }

    return contexts.join('\n')
  }

  /**
   * Generate smart suggestions based on context
   */
  generateSuggestions(prompt: string, fileAnalyses?: FileAnalysisResult[]): string[] {
    const suggestions: string[] = []

    // Analyze prompt intent
    const lowerPrompt = prompt.toLowerCase()

    if (fileAnalyses?.some(a => a.type === 'image')) {
      suggestions.push('Generate a color grading LUT based on the uploaded image')
      suggestions.push('Create a Lightroom preset matching the image style')
      suggestions.push('Extract and generate a color palette for design')
    }

    if (fileAnalyses?.some(a => a.type === 'audio')) {
      suggestions.push('Create a synth preset matching the uploaded audio')
      suggestions.push('Generate a similar melody in the same key')
      suggestions.push('Extract mixing settings and create preset')
    }

    if (lowerPrompt.includes('code') || lowerPrompt.includes('function')) {
      suggestions.push('Generate production-ready code with error handling')
      suggestions.push('Include unit tests and documentation')
    }

    return suggestions
  }
}

// ============================================================================
// MAIN AI ORCHESTRATOR
// ============================================================================

export class AICreateOrchestrator {
  private modelSelector: IntelligentModelSelector
  private cacheSystem: SmartCacheSystem
  private promptEngine: PromptEnhancementEngine
  private activeSessions: Map<string, CollaborativeSession>

  constructor() {
    this.modelSelector = new IntelligentModelSelector()
    this.cacheSystem = new SmartCacheSystem()
    this.promptEngine = new PromptEnhancementEngine()
    this.activeSessions = new Map()

    logger.info('AI Create Orchestrator initialized', {
      availableModels: Object.keys(AI_MODEL_REGISTRY).length
    })
  }

  /**
   * Main generation endpoint
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now()

    logger.info('Generation request received', {
      requestId: request.id,
      type: request.type,
      hasReferences: !!request.referenceFiles?.length,
      collaborative: request.metadata.collaborative
    })

    try {
      // Check cache first
      const cached = this.cacheSystem.get(request)
      if (cached) {
        return cached
      }

      // Select best model
      const model = request.parameters.model
        ? AI_MODEL_REGISTRY[request.parameters.model]
        : this.modelSelector.selectBestModel(request)

      if (!model) {
        throw new Error('No suitable model available')
      }

      // Enhance prompt if needed
      const enhancedPrompt = this.promptEngine.enhancePrompt(request.prompt, {
        style: request.parameters.style,
        colorScheme: request.parameters.colorScheme
      })

      // Generate (mock for now - would call actual AI service)
      const result = await this.executeGeneration(model, enhancedPrompt, request)

      // Cache the result
      this.cacheSystem.set(request, result)

      // Record metrics
      const latency = Date.now() - startTime
      this.modelSelector.recordUsage(model.id, latency, true)

      logger.info('Generation completed', {
        requestId: request.id,
        model: model.id,
        latency,
        tokensUsed: result.performance.tokensUsed,
        cost: result.performance.cost
      })

      return result
    } catch (error) {
      logger.error('Generation failed', {
        requestId: request.id,
        error: error.message
      })
      throw error
    }
  }

  private async executeGeneration(
    model: AIModel,
    prompt: string,
    request: GenerationRequest
  ): Promise<GenerationResult> {
    // Mock generation - in production, this would call actual AI APIs
    const latency = Math.floor(Math.random() * 2000 + 500)
    await new Promise(resolve => setTimeout(resolve, latency))

    const tokensUsed = Math.floor(prompt.length / 4) // Rough estimate
    const cost = (tokensUsed / 1000) * (model.pricing.inputTokens + model.pricing.outputTokens)

    return {
      id: `gen_${Date.now()}`,
      requestId: request.id,
      model: model.id,
      content: {
        type: 'text',
        data: `Generated content using ${model.name}:\n\n${prompt}\n\n[This would be the actual AI-generated content]`,
        metadata: {
          model: model.id,
          provider: model.provider
        }
      },
      performance: {
        latency,
        tokensUsed,
        cost,
        cacheHit: false
      },
      timestamp: Date.now()
    }
  }

  /**
   * Get orchestrator stats
   */
  getStats() {
    return {
      cache: this.cacheSystem.getStats(),
      activeSessions: this.activeSessions.size,
      availableModels: Object.keys(AI_MODEL_REGISTRY).length
    }
  }
}

// Singleton instance
export const aiOrchestrator = new AICreateOrchestrator()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all free models available via OpenRouter
 */
export function getFreeModels(): AIModel[] {
  return Object.values(AI_MODEL_REGISTRY).filter(model => model.tier === 'free')
}

/**
 * Get all paid models
 */
export function getPaidModels(): AIModel[] {
  return Object.values(AI_MODEL_REGISTRY).filter(model => model.tier === 'paid')
}

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: AICapability): AIModel[] {
  return Object.values(AI_MODEL_REGISTRY).filter(model =>
    model.capabilities.includes(capability)
  )
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: AIModel['provider']): AIModel[] {
  return Object.values(AI_MODEL_REGISTRY).filter(model => model.provider === provider)
}

/**
 * Get best free model for a given task
 */
export function getBestFreeModel(requiredCapabilities: AICapability[]): AIModel | null {
  const freeModels = getFreeModels().filter(model =>
    requiredCapabilities.every(cap => model.capabilities.includes(cap))
  )

  if (freeModels.length === 0) return null

  // Sort by quality and reliability
  freeModels.sort((a, b) => {
    const scoreA = a.performance.reliability + (a.performance.quality === 'premium' ? 20 : a.performance.quality === 'standard' ? 10 : 0)
    const scoreB = b.performance.reliability + (b.performance.quality === 'premium' ? 20 : b.performance.quality === 'standard' ? 10 : 0)
    return scoreB - scoreA
  })

  return freeModels[0]
}

/**
 * Get affordable models (free + low-cost paid models)
 */
export function getAffordableModels(): AIModel[] {
  return Object.values(AI_MODEL_REGISTRY).filter(model => {
    if (model.tier === 'free') return true

    // Consider models under $0.0005 per token as affordable
    const avgCost = (model.pricing.inputTokens + model.pricing.outputTokens) / 2
    return avgCost < 0.0005
  })
}
