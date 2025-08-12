/**
 * AI Gateway - Unified interface for multiple AI providers
 * 
 * This module provides a unified interface for interacting with multiple AI providers
 * including OpenAI, Anthropic, Google AI, and others. It handles authentication,
 * rate limiting, caching, circuit breaking, and error handling.
 * 
 * @version 1.0.0
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { CircuitBreaker } from 'opossum';
import { Redis } from '@upstash/redis';
import { Logger } from '@/lib/logger';

// Define supported AI providers
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  REPLICATE = 'replicate',
  COHERE = 'cohere',
  STABILITY = 'stability',
  AWS_REKOGNITION = 'aws-rekognition',
  AWS_BEDROCK = 'aws-bedrock',
  AZURE_OPENAI = 'azure-openai',
}

// Define operation types
export enum AIOperationType {
  TEXT_GENERATION = 'text-generation',
  CHAT_COMPLETION = 'chat-completion',
  IMAGE_GENERATION = 'image-generation',
  IMAGE_ANALYSIS = 'image-analysis',
  VIDEO_ANALYSIS = 'video-analysis',
  AUDIO_TRANSCRIPTION = 'audio-transcription',
  AUDIO_TRANSLATION = 'audio-translation',
  EMBEDDING = 'embedding',
  MODERATION = 'moderation',
  FINE_TUNING = 'fine-tuning',
  FUNCTION_CALLING = 'function-calling',
}

// Error types
export enum AIErrorType {
  VALIDATION_ERROR = 'validation-error',
  AUTHENTICATION_ERROR = 'authentication-error',
  PROVIDER_ERROR = 'provider-error',
  RATE_LIMIT_EXCEEDED = 'rate-limit-exceeded',
  TIMEOUT_ERROR = 'timeout-error',
  CIRCUIT_OPEN = 'circuit-open',
  BUDGET_EXCEEDED = 'budget-exceeded',
  UNKNOWN_ERROR = 'unknown-error',
}

// Custom error class for AI operations
export class AIError extends Error {
  type: AIErrorType;
  details?: Record<string, any>;

  constructor(message: string, type: AIErrorType, details?: Record<string, any>) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.details = details;
  }
}

// Base request interface
export interface AIBaseRequest {
  operationType: AIOperationType;
  preferredProvider?: AIProvider;
  requestId?: string;
  userId?: string;
  useCache?: boolean;
  cacheTtl?: number; // Time to live in seconds
  timeout?: number; // Timeout in milliseconds
  maxRetries?: number;
  metadata?: Record<string, any>;
}

// Base response interface
export interface AIBaseResponse {
  provider: AIProvider;
  requestId: string;
  success: boolean;
  processingTime: number;
  cost: number;
  fromCache?: boolean;
  rawResponse?: any;
}

// Text generation interfaces
export interface TextGenerationRequest extends AIBaseRequest {
  operationType: AIOperationType.TEXT_GENERATION;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  model?: string;
}

export interface TextGenerationResponse extends AIBaseResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Chat completion interfaces
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface ChatCompletionRequest extends AIBaseRequest {
  operationType: AIOperationType.CHAT_COMPLETION;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  model?: string;
  functions?: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  }[];
  functionCall?: 'auto' | 'none' | { name: string };
}

export interface ChatCompletionResponse extends AIBaseResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Image generation interfaces
export interface ImageGenerationRequest extends AIBaseRequest {
  operationType: AIOperationType.IMAGE_GENERATION;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  count?: number;
  model?: string;
  style?: string;
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResponse extends AIBaseResponse {
  images: string[]; // Base64 encoded or URLs
  seeds?: number[];
}

// Image analysis interfaces
export interface ImageAnalysisRequest extends AIBaseRequest {
  operationType: AIOperationType.IMAGE_ANALYSIS;
  image: string; // Base64 encoded or URL
  features?: ('objects' | 'faces' | 'labels' | 'text' | 'moderation')[];
  model?: string;
}

export interface ImageAnalysisResponse extends AIBaseResponse {
  objects?: {
    name: string;
    confidence: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }[];
  faces?: {
    boundingBox: { x: number; y: number; width: number; height: number };
    emotions?: Record<string, number>;
    age?: { low: number; high: number };
    gender?: string;
    confidence: number;
  }[];
  labels?: {
    name: string;
    confidence: number;
  }[];
  text?: {
    content: string;
    boundingBox?: { x: number; y: number; width: number; height: number };
    confidence: number;
  }[];
  moderation?: {
    flagged: boolean;
    categories: Record<string, number>;
  };
}

// Video analysis interfaces
export interface VideoAnalysisRequest extends AIBaseRequest {
  operationType: AIOperationType.VIDEO_ANALYSIS;
  video: string; // Base64 encoded or URL
  features?: ('objects' | 'faces' | 'scenes' | 'text' | 'moderation')[];
  model?: string;
  startTime?: number; // In seconds
  endTime?: number; // In seconds
}

export interface VideoAnalysisResponse extends AIBaseResponse {
  objects?: {
    name: string;
    confidence: number;
    timestamp: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
  }[];
  faces?: {
    timestamp: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    emotions?: Record<string, number>;
    confidence: number;
  }[];
  scenes?: {
    startTime: number;
    endTime: number;
    description: string;
    confidence: number;
  }[];
  text?: {
    content: string;
    timestamp: number;
    boundingBox?: { x: number; y: number; width: number; height: number };
    confidence: number;
  }[];
  moderation?: {
    flagged: boolean;
    categories: Record<string, number>;
  };
}

// Audio transcription interfaces
export interface AudioTranscriptionRequest extends AIBaseRequest {
  operationType: AIOperationType.AUDIO_TRANSCRIPTION;
  audio: string; // Base64 encoded or URL
  model?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
  timestampGranularities?: ('segment' | 'word')[];
}

export interface AudioTranscriptionResponse extends AIBaseResponse {
  text: string;
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
    confidence: number;
  }[];
  words?: {
    word: string;
    start: number;
    end: number;
    confidence: number;
  }[];
  language?: string;
}

// Audio translation interfaces
export interface AudioTranslationRequest extends AIBaseRequest {
  operationType: AIOperationType.AUDIO_TRANSLATION;
  audio: string; // Base64 encoded or URL
  model?: string;
  prompt?: string;
  temperature?: number;
  targetLanguage: string;
}

export interface AudioTranslationResponse extends AIBaseResponse {
  text: string;
  detectedLanguage?: string;
}

// Embedding interfaces
export interface EmbeddingRequest extends AIBaseRequest {
  operationType: AIOperationType.EMBEDDING;
  input: string | string[];
  model?: string;
  dimensions?: number;
  user?: string;
}

export interface EmbeddingResponse extends AIBaseResponse {
  embeddings: number[][];
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

// Moderation interfaces
export interface ModerationRequest extends AIBaseRequest {
  operationType: AIOperationType.MODERATION;
  input: string | string[];
  model?: string;
}

export interface ModerationResponse extends AIBaseResponse {
  results: {
    flagged: boolean;
    categories: Record<string, boolean>;
    categoryScores: Record<string, number>;
  }[];
}

// Function calling interfaces
export interface FunctionCallingRequest extends AIBaseRequest {
  operationType: AIOperationType.FUNCTION_CALLING;
  messages: ChatMessage[];
  functions: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  }[];
  functionCall?: 'auto' | 'none' | { name: string };
  model?: string;
  temperature?: number;
}

export interface FunctionCallingResponse extends AIBaseResponse {
  message: ChatMessage;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
}

// Gateway configuration
export interface AIGatewayConfig {
  providers: {
    [key in AIProvider]?: {
      apiKey?: string;
      baseUrl?: string;
      organizationId?: string;
      enabled: boolean;
      models?: string[];
      timeout?: number;
      maxRetries?: number;
      rateLimits?: {
        requestsPerMinute: number;
        tokensPerMinute?: number;
      };
    };
  };
  cache?: {
    enabled: boolean;
    defaultTtl: number; // Time to live in seconds
    redisUrl?: string;
    redisToken?: string;
  };
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number; // In milliseconds
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    logRequests: boolean;
    logResponses: boolean;
  };
  monthlyBudget?: number; // In USD
  defaultTimeout?: number; // In milliseconds
  defaultMaxRetries?: number;
}

// Cost tracking
interface CostTracking {
  totalCost: number;
  costByProvider: Record<AIProvider, number>;
  costByOperation: Record<AIOperationType, number>;
  costByUser: Record<string, number>;
}

/**
 * AI Gateway class - Main implementation
 */
export class AIGateway {
  private config: AIGatewayConfig;
  private axiosInstances: Record<AIProvider, AxiosInstance>;
  private circuitBreakers: Record<AIProvider, CircuitBreaker>;
  private redis?: Redis;
  private costTracking: CostTracking;
  private providerOperationMap: Record<AIProvider, AIOperationType[]>;

  /**
   * Constructor
   * @param config - Gateway configuration
   */
  constructor(config: AIGatewayConfig) {
    this.config = this.validateConfig(config);
    this.axiosInstances = this.initializeAxiosInstances();
    this.circuitBreakers = this.initializeCircuitBreakers();
    this.redis = this.initializeRedis();
    this.costTracking = this.initializeCostTracking();
    this.providerOperationMap = this.initializeProviderOperationMap();
  }

  /**
   * Validate configuration
   * @param config - Gateway configuration
   * @returns Validated configuration
   */
  private validateConfig(config: AIGatewayConfig): AIGatewayConfig {
    // Ensure at least one provider is enabled
    const enabledProviders = Object.entries(config.providers || {})
      .filter(([_, providerConfig]) => providerConfig?.enabled)
      .map(([provider]) => provider);

    if (enabledProviders.length === 0) {
      throw new AIError(
        'At least one AI provider must be enabled',
        AIErrorType.VALIDATION_ERROR
      );
    }

    // Set default values if not provided
    return {
      ...config,
      cache: {
        enabled: config.cache?.enabled ?? true,
        defaultTtl: config.cache?.defaultTtl ?? 3600,
        redisUrl: config.cache?.redisUrl,
        redisToken: config.cache?.redisToken,
      },
      circuitBreaker: {
        enabled: config.circuitBreaker?.enabled ?? true,
        failureThreshold: config.circuitBreaker?.failureThreshold ?? 5,
        resetTimeout: config.circuitBreaker?.resetTimeout ?? 30000,
      },
      logging: {
        level: config.logging?.level ?? 'info',
        logRequests: config.logging?.logRequests ?? true,
        logResponses: config.logging?.logResponses ?? false,
      },
      defaultTimeout: config.defaultTimeout ?? 30000,
      defaultMaxRetries: config.defaultMaxRetries ?? 3,
    };
  }

  /**
   * Initialize Axios instances for each provider
   * @returns Record of Axios instances
   */
  private initializeAxiosInstances(): Record<AIProvider, AxiosInstance> {
    const instances: Record<AIProvider, AxiosInstance> = {} as Record<AIProvider, AxiosInstance>;

    // Create instances for each enabled provider
    Object.entries(this.config.providers).forEach(([provider, providerConfig]) => {
      if (providerConfig?.enabled) {
        const baseURL = providerConfig.baseUrl || this.getDefaultBaseUrl(provider as AIProvider);
        const timeout = providerConfig.timeout || this.config.defaultTimeout;

        instances[provider as AIProvider] = axios.create({
          baseURL,
          timeout,
          headers: {
            'Content-Type': 'application/json',
            ...(providerConfig.apiKey && { Authorization: `Bearer ${providerConfig.apiKey}` }),
            ...(providerConfig.organizationId && { 'OpenAI-Organization': providerConfig.organizationId }),
          },
        });

        // Add request interceptor for logging
        instances[provider as AIProvider].interceptors.request.use(
          (config) => {
            if (this.config.logging?.logRequests) {
              this.log(`Request to ${provider}: ${config.method?.toUpperCase()} ${config.url}`, 'debug');
            }
            return config;
          },
          (error) => {
            this.log(`Request error to ${provider}: ${error.message}`, 'error');
            return Promise.reject(error);
          }
        );

        // Add response interceptor for logging
        instances[provider as AIProvider].interceptors.response.use(
          (response) => {
            if (this.config.logging?.logResponses) {
              this.log(`Response from ${provider}: ${response.status}`, 'debug');
            }
            return response;
          },
          (error) => {
            if (axios.isAxiosError(error)) {
              this.log(
                `Response error from ${provider}: ${error.response?.status} ${error.message}`,
                'error'
              );
            }
            return Promise.reject(error);
          }
        );
      }
    });

    return instances;
  }

  /**
   * Get default base URL for a provider
   * @param provider - AI provider
   * @returns Default base URL
   */
  private getDefaultBaseUrl(provider: AIProvider): string {
    switch (provider) {
      case AIProvider.OPENAI:
        return 'https://api.openai.com/v1';
      case AIProvider.ANTHROPIC:
        return 'https://api.anthropic.com/v1';
      case AIProvider.GOOGLE:
        return 'https://generativelanguage.googleapis.com/v1';
      case AIProvider.REPLICATE:
        return 'https://api.replicate.com/v1';
      case AIProvider.COHERE:
        return 'https://api.cohere.ai/v1';
      case AIProvider.STABILITY:
        return 'https://api.stability.ai/v1';
      case AIProvider.AWS_REKOGNITION:
        return 'https://rekognition.us-east-1.amazonaws.com';
      case AIProvider.AWS_BEDROCK:
        return 'https://bedrock-runtime.us-east-1.amazonaws.com';
      case AIProvider.AZURE_OPENAI:
        return 'https://YOUR_RESOURCE_NAME.openai.azure.com';
      default:
        throw new AIError(
          `Unknown provider: ${provider}`,
          AIErrorType.VALIDATION_ERROR
        );
    }
  }

  /**
   * Initialize circuit breakers for each provider
   * @returns Record of circuit breakers
   */
  private initializeCircuitBreakers(): Record<AIProvider, CircuitBreaker> {
    const breakers: Record<AIProvider, CircuitBreaker> = {} as Record<AIProvider, CircuitBreaker>;

    if (!this.config.circuitBreaker?.enabled) {
      // Create dummy circuit breakers that always allow requests
      Object.keys(this.axiosInstances).forEach((provider) => {
        breakers[provider as AIProvider] = {
          fire: async (fn: () => Promise<any>) => fn(),
          status: { state: 'closed' },
        } as unknown as CircuitBreaker;
      });
      return breakers;
    }

    // Create real circuit breakers for each provider
    Object.keys(this.axiosInstances).forEach((provider) => {
      breakers[provider as AIProvider] = new CircuitBreaker(
        async (fn: () => Promise<any>) => fn(),
        {
          timeout: this.config.providers[provider as AIProvider]?.timeout || this.config.defaultTimeout,
          resetTimeout: this.config.circuitBreaker?.resetTimeout || 30000,
          errorThresholdPercentage: this.config.circuitBreaker?.failureThreshold || 50,
          rollingCountTimeout: 60000, // 1 minute
          rollingCountBuckets: 10,
          name: `ai-gateway-${provider}`,
        }
      );

      // Add event listeners
      breakers[provider as AIProvider].on('open', () => {
        this.log(`Circuit breaker opened for ${provider}`, 'warn');
      });

      breakers[provider as AIProvider].on('close', () => {
        this.log(`Circuit breaker closed for ${provider}`, 'info');
      });

      breakers[provider as AIProvider].on('halfOpen', () => {
        this.log(`Circuit breaker half-open for ${provider}`, 'info');
      });
    });

    return breakers;
  }

  /**
   * Initialize Redis client for caching
   * @returns Redis client or undefined if caching is disabled
   */
  private initializeRedis(): Redis | undefined {
    if (!this.config.cache?.enabled || !this.config.cache?.redisUrl || !this.config.cache?.redisToken) {
      return undefined;
    }

    try {
      return new Redis({
        url: this.config.cache.redisUrl,
        token: this.config.cache.redisToken,
      });
    } catch (error) {
      this.log(`Failed to initialize Redis: ${(error as Error).message}`, 'error');
      return undefined;
    }
  }

  /**
   * Initialize cost tracking
   * @returns Cost tracking object
   */
  private initializeCostTracking(): CostTracking {
    return {
      totalCost: 0,
      costByProvider: Object.values(AIProvider).reduce(
        (acc, provider) => ({ ...acc, [provider]: 0 }),
        {} as Record<AIProvider, number>
      ),
      costByOperation: Object.values(AIOperationType).reduce(
        (acc, operation) => ({ ...acc, [operation]: 0 }),
        {} as Record<AIOperationType, number>
      ),
      costByUser: {},
    };
  }

  /**
   * Initialize provider operation map
   * @returns Provider operation map
   */
  private initializeProviderOperationMap(): Record<AIProvider, AIOperationType[]> {
    return {
      [AIProvider.OPENAI]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.CHAT_COMPLETION,
        AIOperationType.IMAGE_GENERATION,
        AIOperationType.AUDIO_TRANSCRIPTION,
        AIOperationType.AUDIO_TRANSLATION,
        AIOperationType.EMBEDDING,
        AIOperationType.MODERATION,
        AIOperationType.FUNCTION_CALLING,
      ],
      [AIProvider.ANTHROPIC]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.CHAT_COMPLETION,
      ],
      [AIProvider.GOOGLE]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.CHAT_COMPLETION,
        AIOperationType.IMAGE_GENERATION,
        AIOperationType.EMBEDDING,
      ],
      [AIProvider.REPLICATE]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.IMAGE_GENERATION,
      ],
      [AIProvider.COHERE]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.CHAT_COMPLETION,
        AIOperationType.EMBEDDING,
      ],
      [AIProvider.STABILITY]: [
        AIOperationType.IMAGE_GENERATION,
      ],
      [AIProvider.AWS_REKOGNITION]: [
        AIOperationType.IMAGE_ANALYSIS,
        AIOperationType.VIDEO_ANALYSIS,
      ],
      [AIProvider.AWS_BEDROCK]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.CHAT_COMPLETION,
        AIOperationType.IMAGE_GENERATION,
      ],
      [AIProvider.AZURE_OPENAI]: [
        AIOperationType.TEXT_GENERATION,
        AIOperationType.CHAT_COMPLETION,
        AIOperationType.EMBEDDING,
      ],
    };
  }

  /**
   * Get available providers for a specific operation
   * @param operationType - Operation type
   * @returns Array of available providers
   */
  private getAvailableProviders(operationType: AIOperationType): AIProvider[] {
    return Object.entries(this.providerOperationMap)
      .filter(([provider, operations]) => {
        const providerConfig = this.config.providers[provider as AIProvider];
        return (
          providerConfig?.enabled &&
          operations.includes(operationType) &&
          this.axiosInstances[provider as AIProvider]
        );
      })
      .map(([provider]) => provider as AIProvider);
  }

  /**
   * Generate a cache key for a request
   * @param request - AI request
   * @returns Cache key
   */
  private generateCacheKey(request: AIBaseRequest): string {
    // Remove properties that shouldn't affect caching
    const { requestId, useCache, cacheTtl, maxRetries, timeout, ...cacheableRequest } = request;

    // Generate a stable JSON string (sort keys)
    const stableJson = JSON.stringify(cacheableRequest, Object.keys(cacheableRequest).sort());

    // Use a hash function to create a shorter key
    return `ai-gateway:${request.operationType}:${this.hashString(stableJson)}`;
  }

  /**
   * Simple hash function for strings
   * @param str - String to hash
   * @returns Hashed string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get cached response
   * @param cacheKey - Cache key
   * @returns Cached response or undefined
   */
  private async getCachedResponse<T>(cacheKey: string): Promise<T | undefined> {
    if (!this.config.cache?.enabled || !this.redis) {
      return undefined;
    }

    try {
      const cachedData = await this.redis.get(cacheKey);
      return cachedData ? (JSON.parse(cachedData as string) as T) : undefined;
    } catch (error) {
      this.log(`Cache error: ${(error as Error).message}`, 'error');
      return undefined;
    }
  }

  /**
   * Set cached response
   * @param cacheKey - Cache key
   * @param response - Response to cache
   * @param ttl - Time to live in seconds
   */
  private async setCachedResponse(
    cacheKey: string,
    response: any,
    ttl?: number
  ): Promise<void> {
    if (!this.config.cache?.enabled || !this.redis) {
      return;
    }

    try {
      await this.redis.set(
        cacheKey,
        JSON.stringify(response),
        { ex: ttl || this.config.cache.defaultTtl }
      );
    } catch (error) {
      this.log(`Cache error: ${(error as Error).message}`, 'error');
    }
  }

  /**
   * Check rate limit for a provider and user
   * @param provider - AI provider
   * @param userId - User ID
   * @returns Whether the request is within rate limits
   */
  private async checkRateLimit(provider: AIProvider, userId?: string): Promise<boolean> {
    const providerConfig = this.config.providers[provider];
    if (!providerConfig?.rateLimits) {
      return true;
    }

    const { requestsPerMinute } = providerConfig.rateLimits;

    // Check global rate limit
    const globalKey = `ai-gateway:rate-limit:${provider}:global`;
    const globalCount = await this.redis?.incr(globalKey);
    if (globalCount === 1) {
      await this.redis?.expire(globalKey, 60); // 1 minute
    }

    if (globalCount && globalCount > requestsPerMinute) {
      this.log(`Global rate limit exceeded for ${provider}`, 'warn');
      return false;
    }

    // Check user rate limit if userId is provided
    if (userId) {
      const userKey = `ai-gateway:rate-limit:${provider}:user:${userId}`;
      const userCount = await this.redis?.incr(userKey);
      if (userCount === 1) {
        await this.redis?.expire(userKey, 60); // 1 minute
      }

      // User limit is 1/3 of global limit by default
      const userLimit = Math.max(1, Math.floor(requestsPerMinute / 3));
      if (userCount && userCount > userLimit) {
        this.log(`User rate limit exceeded for ${provider} and user ${userId}`, 'warn');
        return false;
      }
    }

    return true;
  }

  /**
   * Track cost for a request
   * @param provider - AI provider
   * @param operationType - Operation type
   * @param cost - Cost in USD
   * @param userId - User ID
   */
  private trackCost(
    provider: AIProvider,
    operationType: AIOperationType,
    cost: number,
    userId?: string
  ): void {
    this.costTracking.totalCost += cost;
    this.costTracking.costByProvider[provider] += cost;
    this.costTracking.costByOperation[operationType] += cost;

    if (userId) {
      if (!this.costTracking.costByUser[userId]) {
        this.costTracking.costByUser[userId] = 0;
      }
      this.costTracking.costByUser[userId] += cost;
    }

    // Check if monthly budget is exceeded
    if (
      this.config.monthlyBudget &&
      this.costTracking.totalCost > this.config.monthlyBudget
    ) {
      this.log(`Monthly budget exceeded: $${this.costTracking.totalCost.toFixed(2)}`, 'warn');
    }
  }

  /**
   * Calculate cost for a request
   * @param provider - AI provider
   * @param operationType - Operation type
   * @param usage - Usage information
   * @returns Cost in USD
   */
  private calculateCost(
    provider: AIProvider,
    operationType: AIOperationType,
    usage?: any
  ): number {
    // This is a simplified cost calculation
    // In a real implementation, you would use the provider's pricing model
    const baseCosts: Record<AIOperationType, number> = {
      [AIOperationType.TEXT_GENERATION]: 0.0002,
      [AIOperationType.CHAT_COMPLETION]: 0.0003,
      [AIOperationType.IMAGE_GENERATION]: 0.02,
      [AIOperationType.IMAGE_ANALYSIS]: 0.001,
      [AIOperationType.VIDEO_ANALYSIS]: 0.01,
      [AIOperationType.AUDIO_TRANSCRIPTION]: 0.006,
      [AIOperationType.AUDIO_TRANSLATION]: 0.008,
      [AIOperationType.EMBEDDING]: 0.0001,
      [AIOperationType.MODERATION]: 0.0001,
      [AIOperationType.FINE_TUNING]: 0.03,
      [AIOperationType.FUNCTION_CALLING]: 0.0004,
    };

    // Adjust cost based on provider
    const providerMultiplier: Record<AIProvider, number> = {
      [AIProvider.OPENAI]: 1.0,
      [AIProvider.ANTHROPIC]: 1.2,
      [AIProvider.GOOGLE]: 0.9,
      [AIProvider.REPLICATE]: 0.8,
      [AIProvider.COHERE]: 0.7,
      [AIProvider.STABILITY]: 1.1,
      [AIProvider.AWS_REKOGNITION]: 1.0,
      [AIProvider.AWS_BEDROCK]: 1.1,
      [AIProvider.AZURE_OPENAI]: 1.05,
    };

    // Base cost for the operation
    let cost = baseCosts[operationType] * (providerMultiplier[provider] || 1.0);

    // Adjust based on usage if available
    if (usage) {
      if (usage.totalTokens) {
        cost *= usage.totalTokens / 1000; // Cost per 1K tokens
      } else if (usage.promptTokens && usage.completionTokens) {
        // Different rates for prompt and completion tokens
        const promptCost = (usage.promptTokens / 1000) * (cost * 0.5);
        const completionCost = (usage.completionTokens / 1000) * (cost * 1.5);
        cost = promptCost + completionCost;
      }
    }

    return cost;
  }

  /**
   * Create base response object
   * @param request - Base request
   * @param provider - AI provider
   * @param success - Whether the request was successful
   * @param startTime - Start time in milliseconds
   * @param cost - Cost in USD
   * @returns Base response object
   */
  private createBaseResponse(
    request: AIBaseRequest,
    provider: AIProvider,
    success: boolean,
    startTime: number,
    cost: number
  ): AIBaseResponse {
    return {
      provider,
      requestId: request.requestId || uuidv4(),
      success,
      processingTime: Date.now() - startTime,
      cost,
    };
  }

  /**
   * Log a message
   * @param message - Message to log
   * @param level - Log level
   */
  private log(message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'info'): void {
    const logLevel = this.config.logging?.level || 'info';
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };

    if (levels[level] >= levels[logLevel]) {
      switch (level) {
        case 'debug':
          Logger.debug(`[AIGateway] ${message}`);
          break;
        case 'info':
          Logger.info(`[AIGateway] ${message}`);
          break;
        case 'warn':
          Logger.warn(`[AIGateway] ${message}`);
          break;
        case 'error':
          Logger.error(`[AIGateway] ${message}`);
          break;
      }
    }
  }

  /**
   * Handle errors from AI providers
   * @param error - Error object
   * @param provider - AI provider
   * @param requestId - Request ID
   * @returns AIError object
   */
  private handleError(error: any, provider: AIProvider, requestId: string): AIError {
    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle timeout explicitly
      if (
        axiosError.code === 'ECONNABORTED' ||
        axiosError.message?.toLowerCase().includes('timeout')
      ) {
        return new AIError(
          `Request to ${provider} timed out`,
          AIErrorType.TIMEOUT_ERROR,
          {
            provider,
            originalError: error,
            requestId,
          }
        );
      } else if (axiosError.response?.status === 429) {
        return new AIError(
          `Rate limit exceeded for ${provider}`,
          AIErrorType.RATE_LIMIT_EXCEEDED,
          {
            statusCode: 429,
            provider,
            originalError: error,
            requestId,
          }
        );
      } else if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        return new AIError(
          `Authentication error for ${provider}`,
          AIErrorType.AUTHENTICATION_ERROR,
          {
            statusCode: axiosError.response?.status,
            provider,
            originalError: error,
            requestId,
          }
        );
      } else {
        return new AIError(
          `Provider error from ${provider}: ${axiosError.message}`,
          AIErrorType.PROVIDER_ERROR,
          {
            statusCode: axiosError.response?.status,
            provider,
            originalError: error,
            requestId,
          }
        );
      }
    }
    
    // Handle circuit breaker errors
    if (error.name === 'CircuitBreakerOpenError') {
      return new AIError(
        `Circuit breaker open for ${provider}`,
        AIErrorType.CIRCUIT_OPEN,
        {
          provider,
          originalError: error,
          requestId,
        }
      );
    }
    
    // Handle budget exceeded errors
    if (
      this.config.monthlyBudget &&
      this.costTracking.totalCost > this.config.monthlyBudget
    ) {
      return new AIError(
        'Monthly budget exceeded',
        AIErrorType.BUDGET_EXCEEDED,
        {
          provider,
          originalError: error,
          requestId,
        }
      );
    }
    
    // Generic error
    return new AIError(
      `Unknown error from ${provider}: ${error.message || 'No details'}`,
      AIErrorType.UNKNOWN_ERROR,
      {
        provider,
        originalError: error,
        requestId,
      }
    );
  }

  /**
   * Generates text using the specified provider
   * @param request - Text generation request
   * @returns Text generation response
   */
  public async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const startTime = Date.now();
    request.requestId = request.requestId || uuidv4();
    
    // Validate request
    if (!request.prompt) {
      throw new AIError(
        'Prompt is required for text generation',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled
    if (request.useCache !== false) {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<TextGenerationResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for text generation request ${request.requestId}`, 'debug');
        return {
          ...cachedResponse,
          fromCache: true,
          processingTime: Date.now() - startTime,
        };
      }
    }
    
    // Get available providers
    const preferredProvider = request.preferredProvider;
    let providers = this.getAvailableProviders(request.operationType);
    
    if (preferredProvider && providers.includes(preferredProvider)) {
      // Move preferred provider to the front
      providers = [
        preferredProvider,
        ...providers.filter((p) => p !== preferredProvider),
      ];
    }
    
    // Try providers in order
    let lastError: AIError | null = null;
    
    for (const provider of providers) {
      try {
        // Check rate limit
        const withinLimit = await this.checkRateLimit(provider, request.userId);
        if (!withinLimit) {
          this.log(`Rate limit exceeded for ${provider}`, 'warn');
          continue;
        }
        
        // Execute with circuit breaker
        const response = await this.circuitBreakers[provider].fire(async () => {
          switch (provider) {
            case AIProvider.OPENAI:
              return this.generateTextOpenAI(request);
            case AIProvider.ANTHROPIC:
              return this.generateTextAnthropic(request);
            case AIProvider.GOOGLE:
              return this.generateTextGoogle(request);
            case AIProvider.COHERE:
              return this.generateTextCohere(request);
            case AIProvider.AWS_BEDROCK:
              return this.generateTextAWSBedrock(request);
            case AIProvider.AZURE_OPENAI:
              return this.generateTextAzureOpenAI(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support text generation`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Calculate cost
        const cost = this.calculateCost(provider, request.operationType, response.usage);
        this.trackCost(provider, request.operationType, cost, request.userId);
        
        // Create response
        const result: TextGenerationResponse = {
          ...this.createBaseResponse(request, provider, true, startTime, cost),
          text: response.text,
          usage: response.usage,
          rawResponse: response.rawResponse,
        };
        
        // Cache response if enabled
        if (request.useCache !== false) {
          const cacheKey = this.generateCacheKey(request);
          await this.setCachedResponse(cacheKey, result, request.cacheTtl);
        }
        
        return result;
      } catch (error) {
        lastError = this.handleError(error, provider, request.requestId || '');
        this.log(`Error with provider ${provider}: ${lastError.message}`, 'error');
      }
    }
    
    // If we get here, all providers failed
    if (!lastError) {
      lastError = new AIError(
        'No available providers for text generation',
        AIErrorType.PROVIDER_ERROR,
        { requestId: request.requestId }
      );
    }
    
    throw lastError;
  }

  /**
   * Generate text using OpenAI
   * @param request - Text generation request
   * @returns Text generation response
   */
  private async generateTextOpenAI(request: TextGenerationRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.OPENAI];
    if (!axios) {
      throw new AIError(
        'OpenAI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------
    //
    // In a real implementation, you would make an API call to OpenAI
    // and handle the response appropriately. This is a simplified version
    // that returns a mock response.
    //
    // ------------------------------------------------------------------

    return {
      text: `This is a mock response for: ${request.prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      rawResponse: {
        id: 'mock-response-id',
        object: 'text_completion',
        created: Date.now(),
        model: request.model || 'gpt-3.5-turbo-instruct',
        choices: [
          {
            text: `This is a mock response for: ${request.prompt}`,
            index: 0,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      },
    };
  }

  /**
   * Generate text using Anthropic
   * @param request - Text generation request
   * @returns Text generation response
   */
  private async generateTextAnthropic(request: TextGenerationRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.ANTHROPIC];
    if (!axios) {
      throw new AIError(
        'Anthropic client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------

    return {
      text: `This is a mock Anthropic response for: ${request.prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      rawResponse: {
        id: 'mock-response-id',
        type: 'completion',
        completion: `This is a mock Anthropic response for: ${request.prompt}`,
        model: request.model || 'claude-2',
        stop_reason: 'stop_sequence',
      },
    };
  }

  /**
   * Generate text using Google
   * @param request - Text generation request
   * @returns Text generation response
   */
  private async generateTextGoogle(request: TextGenerationRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.GOOGLE];
    if (!axios) {
      throw new AIError(
        'Google client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------

    return {
      text: `This is a mock Google response for: ${request.prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      rawResponse: {
        predictions: [
          {
            output: `This is a mock Google response for: ${request.prompt}`,
            safetyAttributes: {
              blocked: false,
              categories: [],
              scores: [],
            },
          },
        ],
      },
    };
  }

  /**
   * Generate text using Cohere
   * @param request - Text generation request
   * @returns Text generation response
   */
  private async generateTextCohere(request: TextGenerationRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.COHERE];
    if (!axios) {
      throw new AIError(
        'Cohere client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------

    return {
      text: `This is a mock Cohere response for: ${request.prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      rawResponse: {
        id: 'mock-response-id',
        generations: [
          {
            id: 'gen-1',
            text: `This is a mock Cohere response for: ${request.prompt}`,
          },
        ],
        prompt: request.prompt,
      },
    };
  }

  /**
   * Generate text using AWS Bedrock
   * @param request - Text generation request
   * @returns Text generation response
   */
  private async generateTextAWSBedrock(request: TextGenerationRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.AWS_BEDROCK];
    if (!axios) {
      throw new AIError(
        'AWS Bedrock client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------

    return {
      text: `This is a mock AWS Bedrock response for: ${request.prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      rawResponse: {
        inputTextTokenCount: 10,
        results: [
          {
            tokenCount: 20,
            outputText: `This is a mock AWS Bedrock response for: ${request.prompt}`,
            completionReason: 'COMPLETE',
          },
        ],
      },
    };
  }

  /**
   * Generate text using Azure OpenAI
   * @param request - Text generation request
   * @returns Text generation response
   */
  private async generateTextAzureOpenAI(request: TextGenerationRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.AZURE_OPENAI];
    if (!axios) {
      throw new AIError(
        'Azure OpenAI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------

    return {
      text: `This is a mock Azure OpenAI response for: ${request.prompt}`,
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
      rawResponse: {
        id: 'mock-response-id',
        object: 'text_completion',
        created: Date.now(),
        model: request.model || 'gpt-35-turbo-instruct',
        choices: [
          {
            text: `This is a mock Azure OpenAI response for: ${request.prompt}`,
            index: 0,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      },
    };
  }

  /**
   * Analyze an image using the specified provider
   * @param request - Image analysis request
   * @returns Image analysis response
   */
  public async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    const startTime = Date.now();
    request.requestId = request.requestId || uuidv4();
    
    // Validate request
    if (!request.image) {
      throw new AIError(
        'Image is required for image analysis',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled
    if (request.useCache !== false) {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<ImageAnalysisResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for image analysis request ${request.requestId}`, 'debug');
        return {
          ...cachedResponse,
          fromCache: true,
          processingTime: Date.now() - startTime,
        };
      }
    }
    
    // Get available providers
    const preferredProvider = request.preferredProvider;
    let providers = this.getAvailableProviders(request.operationType);
    
    if (preferredProvider && providers.includes(preferredProvider)) {
      // Move preferred provider to the front
      providers = [
        preferredProvider,
        ...providers.filter((p) => p !== preferredProvider),
      ];
    }
    
    // Try providers in order
    let lastError: AIError | null = null;
    
    for (const provider of providers) {
      try {
        // Check rate limit
        const withinLimit = await this.checkRateLimit(provider, request.userId);
        if (!withinLimit) {
          this.log(`Rate limit exceeded for ${provider}`, 'warn');
          continue;
        }
        
        // Execute with circuit breaker
        const response = await this.circuitBreakers[provider].fire(async () => {
          switch (provider) {
            case AIProvider.AWS_REKOGNITION:
              return this.analyzeImageAWSRekognition(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support image analysis`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Calculate cost
        const cost = this.calculateCost(provider, request.operationType);
        this.trackCost(provider, request.operationType, cost, request.userId);
        
        // Create response
        const result: ImageAnalysisResponse = {
          ...this.createBaseResponse(request, provider, true, startTime, cost),
          objects: response.objects,
          faces: response.faces,
          labels: response.labels,
          text: response.text,
          moderation: response.moderation,
          rawResponse: response.rawResponse,
        };
        
        // Cache response if enabled
        if (request.useCache !== false) {
          const cacheKey = this.generateCacheKey(request);
          await this.setCachedResponse(cacheKey, result, request.cacheTtl);
        }
        
        return result;
      } catch (error) {
        lastError = this.handleError(error, provider, request.requestId || '');
        this.log(`Error with provider ${provider}: ${lastError.message}`, 'error');
      }
    }
    
    // If we get here, all providers failed
    if (!lastError) {
      lastError = new AIError(
        'No available providers for image analysis',
        AIErrorType.PROVIDER_ERROR,
        { requestId: request.requestId }
      );
    }
    
    throw lastError;
  }

  /**
   * Analyze an image using AWS Rekognition
   * @param request - Image analysis request
   * @returns Image analysis response
   */
  private async analyzeImageAWSRekognition(request: ImageAnalysisRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.AWS_REKOGNITION];
    if (!axios) {
      throw new AIError(
        'AWS Rekognition client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------
    //
    // In a real implementation, you would make API calls to AWS Rekognition
    // for each requested feature (objects, faces, labels, text, moderation)
    // and combine the results. This is a simplified version that returns
    // mock data.
    //
    // ------------------------------------------------------------------

    return {
      objects: [
        {
          name: 'Person',
          confidence: 0.98,
          boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
        },
        {
          name: 'Car',
          confidence: 0.85,
          boundingBox: { x: 0.5, y: 0.6, width: 0.2, height: 0.3 },
        },
      ],
      faces: [
        {
          boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
          emotions: {
            happy: 0.9,
            sad: 0.05,
            angry: 0.01,
            surprised: 0.02,
            confused: 0.02,
          },
          age: { low: 20, high: 30 },
          gender: 'Female',
          confidence: 0.98,
        },
      ],
      labels: [
        {
          name: 'Outdoors',
          confidence: 0.95,
        },
        {
          name: 'City',
          confidence: 0.85,
        },
      ],
      text: [
        {
          content: 'STOP',
          boundingBox: { x: 0.7, y: 0.8, width: 0.1, height: 0.1 },
          confidence: 0.99,
        },
      ],
      moderation: {
        flagged: false,
        categories: {
          explicit: 0.01,
          violence: 0.02,
          drugs: 0.01,
          hate: 0.01,
        },
      },
      rawResponse: {
        // Mock raw response data
      },
    };
  }

  /**
   * Analyze a video using the specified provider
   * @param request - Video analysis request
   * @returns Video analysis response
   */
  public async analyzeVideo(request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> {
    const startTime = Date.now();
    request.requestId = request.requestId || uuidv4();
    
    // Validate request
    if (!request.video) {
      throw new AIError(
        'Video is required for video analysis',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled
    if (request.useCache !== false) {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<VideoAnalysisResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for video analysis request ${request.requestId}`, 'debug');
        return {
          ...cachedResponse,
          fromCache: true,
          processingTime: Date.now() - startTime,
        };
      }
    }
    
    // Get available providers
    const preferredProvider = request.preferredProvider;
    let providers = this.getAvailableProviders(request.operationType);
    
    if (preferredProvider && providers.includes(preferredProvider)) {
      // Move preferred provider to the front
      providers = [
        preferredProvider,
        ...providers.filter((p) => p !== preferredProvider),
      ];
    }
    
    // Try providers in order
    let lastError: AIError | null = null;
    
    for (const provider of providers) {
      try {
        // Check rate limit
        const withinLimit = await this.checkRateLimit(provider, request.userId);
        if (!withinLimit) {
          this.log(`Rate limit exceeded for ${provider}`, 'warn');
          continue;
        }
        
        // Execute with circuit breaker
        const response = await this.circuitBreakers[provider].fire(async () => {
          switch (provider) {
            case AIProvider.AWS_REKOGNITION:
              return this.analyzeVideoAWSRekognition(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support video analysis`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Calculate cost
        const cost = this.calculateCost(provider, request.operationType);
        this.trackCost(provider, request.operationType, cost, request.userId);
        
        // Create response
        const result: VideoAnalysisResponse = {
          ...this.createBaseResponse(request, provider, true, startTime, cost),
          objects: response.objects,
          faces: response.faces,
          scenes: response.scenes,
          text: response.text,
          moderation: response.moderation,
          rawResponse: response.rawResponse,
        };
        
        // Cache response if enabled
        if (request.useCache !== false) {
          const cacheKey = this.generateCacheKey(request);
          await this.setCachedResponse(cacheKey, result, request.cacheTtl);
        }
        
        return result;
      } catch (error) {
        lastError = this.handleError(error, provider, request.requestId || '');
        this.log(`Error with provider ${provider}: ${lastError.message}`, 'error');
      }
    }
    
    // If we get here, all providers failed
    if (!lastError) {
      lastError = new AIError(
        'No available providers for video analysis',
        AIErrorType.PROVIDER_ERROR,
        { requestId: request.requestId }
      );
    }
    
    throw lastError;
  }

  /**
   * Analyze a video using AWS Rekognition
   * @param request - Video analysis request
   * @returns Video analysis response
   */
  private async analyzeVideoAWSRekognition(request: VideoAnalysisRequest): Promise<any> {
    const axios = this.axiosInstances[AIProvider.AWS_REKOGNITION];
    if (!axios) {
      throw new AIError(
        'AWS Rekognition client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    // ------------------------------------------------------------------
    // Temporary placeholder implementation
    // ------------------------------------------------------------------
    //
    // The full AWS Rekognition video analysis workflow involves:
    //   1. Uploading or referencing the video in S3
    //   2. Starting an asynchronous Rekognition job
    //   3. Polling for completion
    //   4. Retrieving paginated results for each requested feature
    //
    // To keep the gateway compiling while backend plumbing is finalized,
    // we return an empty-but-valid response.  Replace with the real
    // implementation once your AWS infrastructure is wired up.
    //
    // ------------------------------------------------------------------

    return {
      objects: [],
      scenes: [],
      faces: [],
      text: [],
      moderation: { flagged: false, categories: {} },
    };
  }

  /**
   * Get AI gateway statistics
   * @returns Gateway statistics
   */
  public getStatistics(): any {
    return {
      totalCost: this.costTracking.totalCost,
      costByProvider: this.costTracking.costByProvider,
      costByOperation: this.costTracking.costByOperation,
      circuitBreakerStatus: Object.entries(this.circuitBreakers).reduce(
        (acc, [provider, breaker]) => ({
          ...acc,
          [provider]: breaker.status.state,
        }),
        {}
      ),
      enabledProviders: Object.entries(this.config.providers)
        .filter(([_, config]) => config?.enabled)
        .map(([provider]) => provider),
    };
  }

  /**
   * Reset cost tracking
   */
  public resetCostTracking(): void {
    this.costTracking = this.initializeCostTracking();
  }

  /**
   * Close the gateway and release resources
   */
  public async close(): Promise<void> {
    // No resources to release in this implementation
    this.log('AI Gateway closed', 'info');
  }
}

// Export singleton instance
let instance: AIGateway | null = null;

/**
 * Get the AI gateway instance
 * @param config - Gateway configuration (only used if instance doesn't exist)
 * @returns AI gateway instance
 */
export function getAIGateway(config?: AIGatewayConfig): AIGateway {
  if (!instance && config) {
    instance = new AIGateway(config);
  } else if (!instance) {
    throw new Error('AI Gateway not initialized. Provide configuration.');
  }
  return instance;
}

/**
 * Reset the AI gateway instance (for testing)
 */
export function resetAIGateway(): void {
  instance = null;
}

// Default export
export default AIGateway;
