/**
 * KAZI AI ROUTER
 * Multi-model AI routing system with intelligent failover and cost optimization
 * Supports Claude 3.5, GPT-4, and Gemini 2.5
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('KaziAI')

// AI Provider Types
export type AIProvider = 'anthropic' | 'openai' | 'google' | 'openrouter'

// Task Types for intelligent routing
export type AITaskType =
  | 'chat' // General conversation
  | 'analysis' // Document/data analysis
  | 'creative' // Content generation
  | 'legal' // Contract/compliance review
  | 'strategic' // Business strategy
  | 'operational' // Quick tasks/email
  | 'coding' // Code generation/review

// AI Task Interface
export interface AITask {
  type: AITaskType
  prompt: string
  systemPrompt?: string
  context?: Record<string, any>
  maxTokens?: number
  temperature?: number
  userId?: string
}

// AI Response Interface
export interface AIResponse {
  content: string
  provider: AIProvider
  model: string
  tokens: {
    input: number
    output: number
    total: number
  }
  cost: number
  duration: number
  cached?: boolean
}

// Usage Metrics for cost tracking
interface UsageMetrics {
  totalRequests: number
  totalTokens: number
  totalCost: number
  byProvider: {
    anthropic: { requests: number; tokens: number; cost: number }
    openai: { requests: number; tokens: number; cost: number }
    google: { requests: number; tokens: number; cost: number }
    openrouter: { requests: number; tokens: number; cost: number }
  }
  byTaskType: Record<AITaskType, {
    requests: number
    tokens: number
    cost: number
  }>
}

// Response Cache
interface CacheEntry {
  response: AIResponse
  timestamp: number
  hits: number
}

class KaziAIRouter {
  private anthropic: Anthropic
  private openai: OpenAI
  private google: GoogleGenerativeAI
  private openrouter: OpenAI
  private cache: Map<string, CacheEntry> = new Map()
  private metrics: UsageMetrics = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    byProvider: {
      anthropic: { requests: 0, tokens: 0, cost: 0 },
      openai: { requests: 0, tokens: 0, cost: 0 },
      google: { requests: 0, tokens: 0, cost: 0 },
      openrouter: { requests: 0, tokens: 0, cost: 0 }
    },
    byTaskType: {
      chat: { requests: 0, tokens: 0, cost: 0 },
      analysis: { requests: 0, tokens: 0, cost: 0 },
      creative: { requests: 0, tokens: 0, cost: 0 },
      legal: { requests: 0, tokens: 0, cost: 0 },
      strategic: { requests: 0, tokens: 0, cost: 0 },
      operational: { requests: 0, tokens: 0, cost: 0 },
      coding: { requests: 0, tokens: 0, cost: 0 }
    }
  }

  // Cache TTL: 15 minutes
  private readonly CACHE_TTL = 15 * 60 * 1000

  constructor() {
    // Check if running in browser environment
    const isBrowser = typeof window !== 'undefined'

    // Initialize AI clients (only on server-side)
    if (!isBrowser) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || ''
      })

      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || ''
      })

      this.google = new GoogleGenerativeAI(
        process.env.GOOGLE_AI_API_KEY || ''
      )

      // Initialize OpenRouter (uses OpenAI SDK with custom base URL)
      this.openrouter = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9323',
          'X-Title': 'Kazi AI Platform'
        }
      })

      // Start cache cleanup interval
      this.startCacheCleanup()
    } else {
      // Browser environment - create placeholder clients that will throw helpful errors
      logger.warn('KaziAI initialized in browser - AI features require server-side processing')
      this.anthropic = null!
      this.openai = null!
      this.google = null!
      this.openrouter = null!
    }
  }

  /**
   * Route AI request to the optimal provider based on task type
   */
  async routeRequest(task: AITask): Promise<AIResponse> {
    const startTime = Date.now()

    // Check cache first
    const cacheKey = this.getCacheKey(task)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      logger.info('AI cache hit', { taskType: task.type, cacheKey })
      return cached
    }

    // Determine optimal provider
    const provider = this.selectProvider(task)

    logger.info('Routing AI request', {
      taskType: task.type,
      provider,
      userId: task.userId
    })

    try {
      let response: AIResponse

      switch (provider) {
        case 'anthropic':
          response = await this.callAnthropic(task)
          break
        case 'openai':
          response = await this.callOpenAI(task)
          break
        case 'google':
          response = await this.callGoogle(task)
          break
        case 'openrouter':
          response = await this.callOpenRouter(task)
          break
        default:
          throw new Error(`Unknown provider: ${provider}`)
      }

      response.duration = Date.now() - startTime

      // Update metrics
      this.updateMetrics(task, response)

      // Cache response
      this.setCache(cacheKey, response)

      logger.info('AI request completed', {
        provider,
        taskType: task.type,
        tokens: response.tokens.total,
        cost: response.cost,
        duration: response.duration
      })

      return response

    } catch (error) {
      logger.error('AI request failed', {
        provider,
        taskType: task.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      // Attempt failover to alternative provider
      return this.handleFailover(task, provider, error)
    }
  }

  /**
   * Select optimal AI provider based on task type
   */
  private selectProvider(task: AITask): AIProvider {
    // Intelligent routing based on task characteristics
    // OpenRouter is prioritized as it offers free models
    switch (task.type) {
      case 'legal':
      case 'analysis':
      case 'strategic':
        // Try OpenRouter first (free models), fallback to Claude
        return 'openrouter'

      case 'creative':
      case 'coding':
        // Try OpenRouter first (free models), fallback to GPT-4
        return 'openrouter'

      case 'operational':
      case 'chat':
        // OpenRouter for free access, fallback to Gemini
        return 'openrouter'

      default:
        return 'openrouter' // Default to OpenRouter for free models
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(task: AITask): Promise<AIResponse> {
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: task.maxTokens || 4096,
      temperature: task.temperature || 0.7,
      system: task.systemPrompt || 'You are Kazi AI, an expert business growth assistant.',
      messages: [
        {
          role: 'user',
          content: task.prompt
        }
      ]
    })

    const content = message.content[0]
    const text = content.type === 'text' ? content.text : ''

    const inputTokens = message.usage.input_tokens
    const outputTokens = message.usage.output_tokens

    // Cost calculation (Claude 3.5 Sonnet pricing)
    const cost = (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15

    return {
      content: text,
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      },
      cost,
      duration: 0 // Set by caller
    }
  }

  /**
   * Call OpenAI GPT-4 API
   */
  private async callOpenAI(task: AITask): Promise<AIResponse> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: task.maxTokens || 4096,
      temperature: task.temperature || 0.7,
      messages: [
        {
          role: 'system',
          content: task.systemPrompt || 'You are Kazi AI, an expert business growth assistant.'
        },
        {
          role: 'user',
          content: task.prompt
        }
      ]
    })

    const content = completion.choices[0]?.message?.content || ''
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0

    // Cost calculation (GPT-4 Turbo pricing)
    const cost = (inputTokens / 1_000_000) * 10 + (outputTokens / 1_000_000) * 30

    return {
      content,
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      },
      cost,
      duration: 0
    }
  }

  /**
   * Call Google Gemini API
   */
  private async callGoogle(task: AITask): Promise<AIResponse> {
    const model = this.google.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: task.systemPrompt || 'You are Kazi AI, an expert business growth assistant.'
    })

    const result = await model.generateContent(task.prompt)
    const response = await result.response
    const content = response.text()

    // Estimate tokens (Gemini doesn't provide exact counts)
    const estimatedInputTokens = Math.ceil(task.prompt.length / 4)
    const estimatedOutputTokens = Math.ceil(content.length / 4)

    // Cost calculation (Gemini 2.5 Pro pricing)
    const cost = (estimatedInputTokens / 1_000_000) * 1.25 + (estimatedOutputTokens / 1_000_000) * 5

    return {
      content,
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
      tokens: {
        input: estimatedInputTokens,
        output: estimatedOutputTokens,
        total: estimatedInputTokens + estimatedOutputTokens
      },
      cost,
      duration: 0
    }
  }

  /**
   * Call OpenRouter API (using low-cost models)
   */
  private async callOpenRouter(task: AITask): Promise<AIResponse> {
    // Use low-cost models from OpenRouter - extremely affordable
    // gpt-3.5-turbo is very cheap and widely available
    const completion = await this.openrouter.chat.completions.create({
      model: 'openai/gpt-3.5-turbo', // Low cost, reliable model
      max_tokens: task.maxTokens || 4096,
      temperature: task.temperature || 0.7,
      messages: [
        {
          role: 'system',
          content: task.systemPrompt || 'You are Kazi AI, an expert business growth assistant.'
        },
        {
          role: 'user',
          content: task.prompt
        }
      ]
    })

    const content = completion.choices[0]?.message?.content || ''
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0

    // Cost calculation for GPT-3.5 via OpenRouter (very cheap!)
    // Input: $0.0005/1K, Output: $0.0015/1K
    const cost = (inputTokens / 1_000_000) * 0.5 + (outputTokens / 1_000_000) * 1.5

    return {
      content,
      provider: 'openrouter',
      model: 'openai/gpt-3.5-turbo',
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens
      },
      cost,
      duration: 0
    }
  }

  /**
   * Handle failover to alternative provider
   */
  private async handleFailover(
    task: AITask,
    failedProvider: AIProvider,
    error: unknown
  ): Promise<AIResponse> {
    logger.warn('Attempting failover', {
      failedProvider,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    // Failover chain: OpenRouter (free) -> Anthropic -> OpenAI -> Google
    const fallbackChain: AIProvider[] = ['openrouter', 'anthropic', 'openai', 'google']
    const remainingProviders = fallbackChain.filter(p => p !== failedProvider)

    // Try each fallback provider in order
    for (const fallbackProvider of remainingProviders) {
      try {
        let response: AIResponse

        switch (fallbackProvider) {
          case 'openrouter':
            response = await this.callOpenRouter(task)
            break
          case 'anthropic':
            response = await this.callAnthropic(task)
            break
          case 'openai':
            response = await this.callOpenAI(task)
            break
          case 'google':
            response = await this.callGoogle(task)
            break
          default:
            continue
        }

        logger.info('Failover successful', { fallbackProvider })
        return response

      } catch (fallbackError) {
        logger.error('Failover attempt failed', {
          fallbackProvider,
          error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        })
        // Continue to next provider
        continue
      }
    }

    // All providers failed
    throw new Error('All AI providers failed')
  }

  /**
   * Cache management
   */
  private getCacheKey(task: AITask): string {
    return `${task.type}:${task.prompt}:${task.systemPrompt || 'default'}`
  }

  private getFromCache(key: string): AIResponse | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }

    entry.hits++
    return { ...entry.response, cached: true }
  }

  private setCache(key: string, response: AIResponse): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hits: 0
    })
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.CACHE_TTL) {
          this.cache.delete(key)
        }
      }
    }, 5 * 60 * 1000) // Cleanup every 5 minutes
  }

  /**
   * Metrics tracking
   */
  private updateMetrics(task: AITask, response: AIResponse): void {
    this.metrics.totalRequests++
    this.metrics.totalTokens += response.tokens.total
    this.metrics.totalCost += response.cost

    this.metrics.byProvider[response.provider].requests++
    this.metrics.byProvider[response.provider].tokens += response.tokens.total
    this.metrics.byProvider[response.provider].cost += response.cost

    this.metrics.byTaskType[task.type].requests++
    this.metrics.byTaskType[task.type].tokens += response.tokens.total
    this.metrics.byTaskType[task.type].cost += response.cost
  }

  /**
   * Get usage metrics
   */
  getMetrics(): UsageMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset metrics (for testing or periodic reset)
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {
        anthropic: { requests: 0, tokens: 0, cost: 0 },
        openai: { requests: 0, tokens: 0, cost: 0 },
        google: { requests: 0, tokens: 0, cost: 0 },
        openrouter: { requests: 0, tokens: 0, cost: 0 }
      },
      byTaskType: {
        chat: { requests: 0, tokens: 0, cost: 0 },
        analysis: { requests: 0, tokens: 0, cost: 0 },
        creative: { requests: 0, tokens: 0, cost: 0 },
        legal: { requests: 0, tokens: 0, cost: 0 },
        strategic: { requests: 0, tokens: 0, cost: 0 },
        operational: { requests: 0, tokens: 0, cost: 0 },
        coding: { requests: 0, tokens: 0, cost: 0 }
      }
    }
  }
}

// Singleton instance
export const kaziAI = new KaziAIRouter()

// Export for easy use
export default kaziAI
