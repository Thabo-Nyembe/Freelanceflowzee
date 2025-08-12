/**
 * @file AI Gateway - Unified interface for all AI services in the KAZI platform
 * @version 1.0.0
 * 
 * This gateway provides a centralized access point to various AI services including:
 * - Text generation and completion (OpenAI, Anthropic, etc.)
 * - Real-time transcription (AssemblyAI, Deepgram)
 * - Image generation and analysis (DALL-E, Stability AI)
 * - Video processing (AWS Rekognition)
 * - Semantic search capabilities
 * 
 * Features include rate limiting, caching, circuit breakers, streaming support,
 * authentication, logging, cost tracking, and fallback mechanisms.
 */

import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import * as CircuitBreaker from 'opossum';
import WebSocket from 'ws';
import { 
  OpenAI as OpenAIClient,
  APIError as OpenAIError 
} from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { createHash } from 'crypto';

// =========================================================================
// Type Definitions
// =========================================================================

/**
 * Supported AI service providers
 */
export type AIProvider = 
  | 'openai'
  | 'anthropic'
  | 'assemblyai'
  | 'deepgram'
  | 'stability'
  | 'aws-rekognition'
  | 'elevenlabs';

/**
 * AI operation types supported by the gateway
 */
export type AIOperationType = 
  | 'text-generation'
  | 'text-completion'
  | 'chat-completion'
  | 'image-generation'
  | 'image-analysis'
  | 'transcription'
  | 'video-analysis'
  | 'semantic-search'
  | 'text-embedding'
  | 'audio-synthesis';

/**
 * Configuration for each AI service provider
 */
export interface ProviderConfig {
  /** API key for the provider */
  apiKey: string;
  /** Base URL for API calls */
  baseUrl?: string;
  /** Organization ID if applicable */
  organizationId?: string;
  /** Maximum requests per minute */
  rateLimit: number;
  /** Timeout in milliseconds */
  timeout: number;
  /** Whether the provider is enabled */
  enabled: boolean;
  /** Priority order for fallback (lower is higher priority) */
  priority: number;
  /** Cost per 1000 tokens or per request */
  costPer1k: number;
  /** Whether to use streaming when available */
  streaming?: boolean;
}

/**
 * Gateway configuration options
 */
export interface AIGatewayConfig {
  /** Provider-specific configurations */
  providers: Record<AIProvider, ProviderConfig>;
  /** Redis configuration for caching and rate limiting */
  redis?: {
    url: string;
    password?: string;
    cacheTtl: number;
  };
  /** Default timeout for requests in milliseconds */
  defaultTimeout: number;
  /** Whether to enable detailed logging */
  enableLogging: boolean;
  /** Whether to track costs */
  trackCosts: boolean;
  /** Monthly budget limit in USD */
  monthlyBudget?: number;
  /** Circuit breaker configuration */
  circuitBreaker: {
    /** Time in milliseconds to wait before trying again */
    resetTimeout: number;
    /** Number of failures before opening circuit */
    failureThreshold: number;
    /** Time window in milliseconds for failure counting */
    rollingCountTimeout: number;
  };
}

/**
 * Base request interface for all AI operations
 */
export interface AIRequest {
  /** Unique identifier for the request */
  requestId?: string;
  /** Operation type */
  operationType: AIOperationType;
  /** Preferred provider (falls back to others if not specified) */
  preferredProvider?: AIProvider;
  /** Whether to use cached response if available */
  useCache?: boolean;
  /** Cache TTL override in seconds */
  cacheTtl?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** User identifier for tracking and personalization */
  userId?: string;
  /** Project identifier */
  projectId?: string;
  /** Request timeout override in milliseconds */
  timeout?: number;
}

/**
 * Base response interface for all AI operations
 */
export interface AIResponse {
  /** Unique identifier for the response */
  responseId: string;
  /** Request ID that generated this response */
  requestId: string;
  /** Provider that fulfilled the request */
  provider: AIProvider;
  /** Operation type */
  operationType: AIOperationType;
  /** Whether the response was from cache */
  fromCache: boolean;
  /** Timestamp when the response was generated */
  timestamp: string;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Cost of the operation in USD */
  cost: number;
  /** Usage statistics */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Text generation request
 */
export interface TextGenerationRequest extends AIRequest {
  operationType: 'text-generation' | 'text-completion' | 'chat-completion';
  /** Prompt for text generation */
  prompt: string;
  /** System message for chat models */
  systemMessage?: string;
  /** Chat history for context */
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for randomness (0-1) */
  temperature?: number;
  /** Top-p sampling */
  topP?: number;
  /** Number of completions to generate */
  n?: number;
  /** Stop sequences */
  stop?: string[];
  /** Whether to include logprobs */
  logprobs?: boolean;
  /** Function calling specifications */
  functions?: any[];
  /** Function to call */
  functionCall?: string | { name: string };
}

/**
 * Text generation response
 */
export interface TextGenerationResponse extends AIResponse {
  /** Generated text */
  text: string;
  /** Multiple choices if n > 1 */
  choices?: Array<{
    text: string;
    index: number;
    logprobs?: any;
    finishReason?: string;
  }>;
  /** Function call results if applicable */
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
}

/**
 * Image generation request
 */
export interface ImageGenerationRequest extends AIRequest {
  operationType: 'image-generation';
  /** Prompt for image generation */
  prompt: string;
  /** Number of images to generate */
  n?: number;
  /** Image size */
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  /** Image format */
  format?: 'url' | 'b64_json';
  /** Image style */
  style?: 'natural' | 'vivid';
  /** Quality of the image */
  quality?: 'standard' | 'hd';
  /** Negative prompt */
  negativePrompt?: string;
}

/**
 * Image generation response
 */
export interface ImageGenerationResponse extends AIResponse {
  /** Generated images */
  images: Array<{
    url?: string;
    b64Json?: string;
    width: number;
    height: number;
  }>;
}

/**
 * Transcription request
 */
export interface TranscriptionRequest extends AIRequest {
  operationType: 'transcription';
  /** Audio file URL or base64 */
  audioSource: string;
  /** Source type */
  sourceType: 'url' | 'base64' | 'stream';
  /** Audio language */
  language?: string;
  /** Whether to identify speakers */
  speakerDiarization?: boolean;
  /** Number of speakers if known */
  numSpeakers?: number;
  /** Whether to detect sentiment */
  sentiment?: boolean;
  /** Whether to extract topics */
  topics?: boolean;
  /** Whether to generate chapter markers */
  chapters?: boolean;
  /** Whether to extract action items */
  actionItems?: boolean;
}

/**
 * Transcription response
 */
export interface TranscriptionResponse extends AIResponse {
  /** Full transcript text */
  text: string;
  /** Segments with timestamps */
  segments: Array<{
    id: string;
    text: string;
    start: number;
    end: number;
    speaker?: string;
    confidence: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    keywords?: string[];
  }>;
  /** Detected language */
  language?: string;
  /** Extracted topics */
  topics?: string[];
  /** Chapter markers */
  chapters?: Array<{
    title: string;
    start: number;
    end: number;
    summary?: string;
  }>;
  /** Action items */
  actionItems?: Array<{
    text: string;
    timestamp: number;
    confidence: number;
  }>;
}

/**
 * Video analysis request
 */
export interface VideoAnalysisRequest extends AIRequest {
  operationType: 'video-analysis';
  /** Video URL */
  videoUrl: string;
  /** Analysis features to enable */
  features: {
    /** Object detection */
    objects?: boolean;
    /** Scene detection */
    scenes?: boolean;
    /** Face detection */
    faces?: boolean;
    /** Text detection (OCR) */
    text?: boolean;
    /** Content moderation */
    moderation?: boolean;
    /** Celebrity recognition */
    celebrities?: boolean;
  };
  /** Minimum confidence threshold (0-1) */
  minConfidence?: number;
}

/**
 * Video analysis response
 */
export interface VideoAnalysisResponse extends AIResponse {
  /** Detected objects */
  objects?: Array<{
    name: string;
    confidence: number;
    boundingBox: { left: number; top: number; width: number; height: number };
    timestamps: number[];
  }>;
  /** Detected scenes */
  scenes?: Array<{
    start: number;
    end: number;
    confidence: number;
    description?: string;
  }>;
  /** Detected faces */
  faces?: Array<{
    boundingBox: { left: number; top: number; width: number; height: number };
    timestamps: number[];
    emotions?: Array<{ type: string; confidence: number }>;
    age?: { low: number; high: number; confidence: number };
    gender?: { value: string; confidence: number };
  }>;
  /** Detected text */
  text?: Array<{
    text: string;
    confidence: number;
    boundingBox: { left: number; top: number; width: number; height: number };
    timestamps: number[];
  }>;
  /** Moderation results */
  moderation?: {
    flagged: boolean;
    categories: Record<string, number>;
  };
}

/**
 * Semantic search request
 */
export interface SemanticSearchRequest extends AIRequest {
  operationType: 'semantic-search' | 'text-embedding';
  /** Query text */
  query: string;
  /** Collection to search in */
  collection?: string;
  /** Number of results to return */
  limit?: number;
  /** Minimum similarity score (0-1) */
  minScore?: number;
  /** Filter criteria */
  filters?: Record<string, any>;
  /** Whether to return the embedding vector */
  returnVector?: boolean;
}

/**
 * Semantic search response
 */
export interface SemanticSearchResponse extends AIResponse {
  /** Search results */
  results: Array<{
    /** Document ID */
    id: string;
    /** Document content */
    content: string;
    /** Similarity score */
    score: number;
    /** Metadata */
    metadata?: Record<string, any>;
    /** Embedding vector if requested */
    vector?: number[];
  }>;
  /** Query embedding if returnVector is true */
  queryVector?: number[];
}

/**
 * Audio synthesis request
 */
export interface AudioSynthesisRequest extends AIRequest {
  operationType: 'audio-synthesis';
  /** Text to convert to speech */
  text: string;
  /** Voice ID or name */
  voice: string;
  /** Speech model to use */
  model?: string;
  /** Voice settings */
  voiceSettings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  /** Output format */
  outputFormat?: 'mp3' | 'wav' | 'ogg';
}

/**
 * Audio synthesis response
 */
export interface AudioSynthesisResponse extends AIResponse {
  /** Audio URL or base64 */
  audio: string;
  /** Audio format */
  format: string;
  /** Audio duration in seconds */
  duration: number;
}

/**
 * Error types that can occur in AI operations
 */
export enum AIErrorType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  AUTHENTICATION_ERROR = 'authentication_error',
  VALIDATION_ERROR = 'validation_error',
  PROVIDER_ERROR = 'provider_error',
  TIMEOUT_ERROR = 'timeout_error',
  CIRCUIT_OPEN = 'circuit_open',
  BUDGET_EXCEEDED = 'budget_exceeded',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Custom error class for AI operations
 */
export class AIError extends Error {
  /** Error type */
  type: AIErrorType;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Provider that generated the error */
  provider?: AIProvider;
  /** Original error */
  originalError?: Error;
  /** Request ID */
  requestId?: string;

  constructor(
    message: string,
    type: AIErrorType,
    options?: {
      statusCode?: number;
      provider?: AIProvider;
      originalError?: Error;
      requestId?: string;
    }
  ) {
    super(message);
    this.name = 'AIError';
    this.type = type;
    this.statusCode = options?.statusCode;
    this.provider = options?.provider;
    this.originalError = options?.originalError;
    this.requestId = options?.requestId;
  }
}

// =========================================================================
// Main Gateway Class
// =========================================================================

/**
 * AI Gateway class that provides a unified interface to various AI services
 */
export class AIGateway {
  private config: AIGatewayConfig;
  private redisClient: any | null = null;
  private openaiClient: OpenAIClient | null = null;
  private anthropicClient: Anthropic | null = null;
  private axiosInstances: Record<AIProvider, AxiosInstance> = {} as any;
  private circuitBreakers: Record<AIProvider, any> = {};
  private eventEmitter: EventEmitter;
  private wsClients: Map<string, WebSocket> = new Map();
  private costTracking: {
    totalCost: number;
    costByProvider: Record<AIProvider, number>;
    costByOperation: Record<AIOperationType, number>;
    costByUser: Record<string, number>;
    lastReset: Date;
  };

  /**
   * Creates a new AI Gateway instance
   * @param config - Configuration options for the gateway
   */
  constructor(config: AIGatewayConfig) {
    this.config = this.validateAndNormalizeConfig(config);
    this.eventEmitter = new EventEmitter();
    this.initializeRedis();
    this.initializeProviders();
    this.initializeCircuitBreakers();
    this.costTracking = {
      totalCost: 0,
      costByProvider: {} as Record<AIProvider, number>,
      costByOperation: {} as Record<AIOperationType, number>,
      costByUser: {},
      lastReset: new Date(),
    };

    // Initialize cost tracking
    Object.keys(this.config.providers).forEach((provider) => {
      this.costTracking.costByProvider[provider as AIProvider] = 0;
    });

    const operationTypes: AIOperationType[] = [
      'text-generation',
      'text-completion',
      'chat-completion',
      'image-generation',
      'image-analysis',
      'transcription',
      'video-analysis',
      'semantic-search',
      'text-embedding',
      'audio-synthesis',
    ];
    operationTypes.forEach((op) => {
      this.costTracking.costByOperation[op] = 0;
    });

    // Reset cost tracking monthly
    setInterval(() => {
      const now = new Date();
      const lastMonth = new Date(this.costTracking.lastReset);
      if (now.getMonth() !== lastMonth.getMonth() || now.getFullYear() !== lastMonth.getFullYear()) {
        this.resetCostTracking();
      }
    }, 86400000); // Check daily
  }

  /**
   * Validates and normalizes the configuration
   * @param config - User provided configuration
   * @returns Normalized configuration
   * @private
   */
  private validateAndNormalizeConfig(config: AIGatewayConfig): AIGatewayConfig {
    // Deep clone to avoid modifying the original
    const normalizedConfig = JSON.parse(JSON.stringify(config));
    
    // Set defaults for missing values
    normalizedConfig.defaultTimeout = normalizedConfig.defaultTimeout || 30000;
    normalizedConfig.enableLogging = normalizedConfig.enableLogging ?? true;
    normalizedConfig.trackCosts = normalizedConfig.trackCosts ?? true;
    
    if (!normalizedConfig.circuitBreaker) {
      normalizedConfig.circuitBreaker = {
        resetTimeout: 30000,
        failureThreshold: 5,
        rollingCountTimeout: 60000,
      };
    }
    
    // Ensure all providers have required fields
    Object.entries(normalizedConfig.providers).forEach(([provider, providerConfig]) => {
      const pc = providerConfig as ProviderConfig;
      if (!pc.apiKey && provider !== 'local') {
        throw new AIError(
          `API key missing for provider ${provider}`,
          AIErrorType.VALIDATION_ERROR
        );
      }
      
      pc.rateLimit = pc.rateLimit || 60;
      pc.timeout = pc.timeout || normalizedConfig.defaultTimeout;
      pc.enabled = pc.enabled ?? true;
      pc.priority = pc.priority ?? 10;
      pc.costPer1k = pc.costPer1k || 0;
    });
    
    return normalizedConfig;
  }

  /**
   * Initializes Redis client for caching and rate limiting
   * @private
   */
  private async initializeRedis(): Promise<void> {
    if (this.config.redis) {
      try {
        this.redisClient = createClient({
          url: this.config.redis.url,
          password: this.config.redis.password,
        });
        
        await this.redisClient.connect();
        
        this.redisClient.on('error', (err: Error) => {
          console.error('Redis client error:', err);
        });
        
        this.log('Redis client initialized successfully');
      } catch (error) {
        this.log('Failed to initialize Redis client', 'error', error);
        // Continue without Redis - features will degrade gracefully
      }
    }
  }

  /**
   * Initializes API clients for each provider
   * @private
   */
  private initializeProviders(): void {
    // Initialize OpenAI
    if (this.config.providers.openai?.enabled) {
      this.openaiClient = new OpenAIClient({
        apiKey: this.config.providers.openai.apiKey,
        organization: this.config.providers.openai.organizationId,
        baseURL: this.config.providers.openai.baseUrl,
        timeout: this.config.providers.openai.timeout,
      });
    }
    
    // Initialize Anthropic
    if (this.config.providers.anthropic?.enabled) {
      this.anthropicClient = new Anthropic({
        apiKey: this.config.providers.anthropic.apiKey,
        baseURL: this.config.providers.anthropic.baseUrl,
      });
    }
    
    // Initialize other providers with Axios
    const providers: AIProvider[] = [
      'assemblyai',
      'deepgram',
      'stability',
      'aws-rekognition',
      'elevenlabs',
    ];
    
    providers.forEach((provider) => {
      if (this.config.providers[provider]?.enabled) {
        this.axiosInstances[provider] = axios.create({
          baseURL: this.config.providers[provider].baseUrl,
          timeout: this.config.providers[provider].timeout,
          headers: {
            'Authorization': `Bearer ${this.config.providers[provider].apiKey}`,
            'Content-Type': 'application/json',
          },
        });
      }
    });
  }

  /**
   * Initializes circuit breakers for each provider
   * @private
   */
  private initializeCircuitBreakers(): void {
    Object.keys(this.config.providers).forEach((provider) => {
      if (this.config.providers[provider as AIProvider].enabled) {
        this.circuitBreakers[provider] = new CircuitBreaker(
          async (operation: Function) => await operation(),
          {
            timeout: this.config.providers[provider as AIProvider].timeout,
            resetTimeout: this.config.circuitBreaker.resetTimeout,
            errorThresholdPercentage: this.config.circuitBreaker.failureThreshold,
            rollingCountTimeout: this.config.circuitBreaker.rollingCountTimeout,
          }
        );
        
        this.circuitBreakers[provider].on('open', () => {
          this.log(`Circuit breaker opened for provider ${provider}`, 'warn');
        });
        
        this.circuitBreakers[provider].on('close', () => {
          this.log(`Circuit breaker closed for provider ${provider}`, 'info');
        });
      }
    });
  }

  /**
   * Logs messages based on configuration
   * @param message - Message to log
   * @param level - Log level
   * @param error - Optional error object
   * @private
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info', error?: any): void {
    if (!this.config.enableLogging) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[AI Gateway] [${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage, error || '');
        break;
    }
    
    // Emit log event for external monitoring
    this.eventEmitter.emit('log', {
      timestamp,
      level,
      message,
      error,
    });
  }

  /**
   * Checks if a request is within rate limits
   * @param provider - Provider to check
   * @param userId - User ID for per-user limits
   * @returns Whether the request is allowed
   * @private
   */
  private async checkRateLimit(provider: AIProvider, userId?: string): Promise<boolean> {
    if (!this.redisClient) return true; // Skip rate limiting if Redis is not available
    
    const providerKey = `ratelimit:${provider}:${Date.now() / 60000 | 0}`;
    const userKey = userId ? `ratelimit:${provider}:${userId}:${Date.now() / 60000 | 0}` : null;
    
    try {
      // Check provider-level rate limit
      const providerCount = await this.redisClient.incr(providerKey);
      await this.redisClient.expire(providerKey, 60);
      
      if (providerCount > this.config.providers[provider].rateLimit) {
        return false;
      }
      
      // Check user-level rate limit if applicable
      if (userKey) {
        const userCount = await this.redisClient.incr(userKey);
        await this.redisClient.expire(userKey, 60);
        
        // User limit is 10% of provider limit by default
        const userLimit = Math.max(1, Math.floor(this.config.providers[provider].rateLimit * 0.1));
        if (userCount > userLimit) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      this.log('Rate limit check failed, allowing request', 'warn', error);
      return true; // Allow on error
    }
  }

  /**
   * Gets cached response if available
   * @param key - Cache key
   * @returns Cached response or null
   * @private
   */
  private async getCachedResponse<T extends AIResponse>(key: string): Promise<T | null> {
    if (!this.redisClient) return null;
    
    try {
      const cached = await this.redisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.log('Cache retrieval failed', 'warn', error);
    }
    
    return null;
  }

  /**
   * Caches a response
   * @param key - Cache key
   * @param response - Response to cache
   * @param ttl - Time to live in seconds
   * @private
   */
  private async cacheResponse<T extends AIResponse>(key: string, response: T, ttl: number): Promise<void> {
    if (!this.redisClient) return;
    
    try {
      await this.redisClient.set(key, JSON.stringify(response), { EX: ttl });
    } catch (error) {
      this.log('Cache storage failed', 'warn', error);
    }
  }

  /**
   * Generates a cache key for a request
   * @param request - AI request
   * @returns Cache key
   * @private
   */
  private generateCacheKey(request: AIRequest): string {
    // Remove fields that shouldn't affect caching
    const { requestId, useCache, cacheTtl, timeout, ...cacheableRequest } = request;
    
    // Create deterministic JSON string
    const sortedRequest = JSON.stringify(cacheableRequest, Object.keys(cacheableRequest).sort());
    
    // Generate hash
    return createHash('sha256').update(sortedRequest).digest('hex');
  }

  /**
   * Tracks cost for an operation
   * @param provider - Provider used
   * @param operationType - Operation type
   * @param tokens - Number of tokens processed
   * @param userId - User ID for per-user tracking
   * @private
   */
  private trackCost(
    provider: AIProvider,
    operationType: AIOperationType,
    tokens: number,
    userId?: string
  ): number {
    if (!this.config.trackCosts) return 0;
    
    const costPer1k = this.config.providers[provider].costPer1k;
    const cost = (tokens / 1000) * costPer1k;
    
    this.costTracking.totalCost += cost;
    this.costTracking.costByProvider[provider] += cost;
    this.costTracking.costByOperation[operationType] += cost;
    
    if (userId) {
      if (!this.costTracking.costByUser[userId]) {
        this.costTracking.costByUser[userId] = 0;
      }
      this.costTracking.costByUser[userId] += cost;
    }
    
    // Check budget if configured
    if (this.config.monthlyBudget && this.costTracking.totalCost > this.config.monthlyBudget) {
      this.eventEmitter.emit('budget_exceeded', {
        totalCost: this.costTracking.totalCost,
        budget: this.config.monthlyBudget,
        timestamp: new Date().toISOString(),
      });
    }
    
    return cost;
  }

  /**
   * Resets cost tracking
   * @private
   */
  private resetCostTracking(): void {
    const previousCost = { ...this.costTracking };
    
    this.costTracking = {
      totalCost: 0,
      costByProvider: {} as Record<AIProvider, number>,
      costByOperation: {} as Record<AIOperationType, number>,
      costByUser: {},
      lastReset: new Date(),
    };
    
    // Re-initialize provider and operation costs
    Object.keys(this.config.providers).forEach((provider) => {
      this.costTracking.costByProvider[provider as AIProvider] = 0;
    });
    
    const operationTypes: AIOperationType[] = [
      'text-generation',
      'text-completion',
      'chat-completion',
      'image-generation',
      'image-analysis',
      'transcription',
      'video-analysis',
      'semantic-search',
      'text-embedding',
      'audio-synthesis',
    ];
    operationTypes.forEach((op) => {
      this.costTracking.costByOperation[op] = 0;
    });
    
    this.eventEmitter.emit('cost_reset', {
      previousCost,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Gets available providers for an operation in priority order
   * @param operationType - Operation type
   * @returns Array of available providers
   * @private
   */
  private getAvailableProviders(operationType: AIOperationType): AIProvider[] {
    const providers: AIProvider[] = [];
    const operationProviderMap: Record<AIOperationType, AIProvider[]> = {
      'text-generation': ['openai', 'anthropic'],
      'text-completion': ['openai', 'anthropic'],
      'chat-completion': ['openai', 'anthropic'],
      'image-generation': ['openai', 'stability'],
      'image-analysis': ['openai', 'aws-rekognition'],
      'transcription': ['assemblyai', 'deepgram', 'openai'],
      'video-analysis': ['aws-rekognition'],
      'semantic-search': ['openai'],
      'text-embedding': ['openai', 'anthropic'],
      'audio-synthesis': ['elevenlabs', 'openai'],
    };
    
    const supportedProviders = operationProviderMap[operationType] || [];
    
    // Filter by enabled providers and sort by priority
    supportedProviders
      .filter((provider) => this.config.providers[provider]?.enabled)
      .sort((a, b) => {
        return this.config.providers[a].priority - this.config.providers[b].priority;
      })
      .forEach((provider) => {
        providers.push(provider);
      });
    
    return providers;
  }

  /**
   * Creates a standardized response object
   * @param request - Original request
   * @param provider - Provider that fulfilled the request
   * @param fromCache - Whether the response was from cache
   * @param startTime - Request start time
   * @param cost - Cost of the operation
   * @param usage - Token usage information
   * @returns Base response object
   * @private
   */
  private createBaseResponse(
    request: AIRequest,
    provider: AIProvider,
    fromCache: boolean,
    startTime: number,
    cost: number = 0,
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
  ): AIResponse {
    return {
      responseId: uuidv4(),
      requestId: request.requestId || uuidv4(),
      provider,
      operationType: request.operationType,
      fromCache,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      cost,
      usage,
    };
  }

  /**
   * Handles errors from providers
   * @param error - Original error
   * @param provider - Provider that generated the error
   * @param requestId - Request ID
   * @returns Standardized AI error
   * @private
   */
  private handleProviderError(error: any, provider: AIProvider, requestId?: string): AIError {
    // Handle OpenAI errors
    if (error instanceof OpenAIError) {
      if (error.status === 429) {
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
      } else if (error.status === 401 || error.status === 403) {
        return new AIError(
          `Authentication error for ${provider}`,
          AIErrorType.AUTHENTICATION_ERROR,
          {
            statusCode: error.status,
            provider,
            originalError: error,
            requestId,
          }
        );
      } else {
        return new AIError(
          `Provider error from ${provider}: ${error.message}`,
          AIErrorType.PROVIDER_ERROR,
          {
            statusCode: error.status,
            provider,
            originalError: error,
            requestId,
          }
        );
      }
    }
    
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
      }
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
    if (!request.prompt && !request.history) {
      throw new AIError(
        'Prompt or history is required for text generation',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled
    if (request.useCache !== false) {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<TextGenerationResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for text generation request ${request.requestId}`);
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
            case 'openai':
              return await this.generateTextWithOpenAI(request);
            case 'anthropic':
              return await this.generateTextWithAnthropic(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support text generation`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Cache response if enabled
        if (request.useCache !== false) {
          const cacheKey = this.generateCacheKey(request);
          const cacheTtl = request.cacheTtl || this.config.redis?.cacheTtl || 3600;
          await this.cacheResponse(cacheKey, response, cacheTtl);
        }
        
        return response;
      } catch (error) {
        const aiError = this.handleProviderError(
          error,
          provider,
          request.requestId
        );
        
        this.log(
          `Error with provider ${provider} for text generation: ${aiError.message}`,
          'error',
          aiError
        );
        
        lastError = aiError;
        
        // Continue to next provider unless it's a budget error
        if (aiError.type === AIErrorType.BUDGET_EXCEEDED) {
          throw aiError;
        }
      }
    }
    
    // If all providers failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new AIError(
      'No available providers for text generation',
      AIErrorType.PROVIDER_ERROR
    );
  }

  /**
   * Generates text using OpenAI
   * @param request - Text generation request
   * @returns Text generation response
   * @private
   */
  private async generateTextWithOpenAI(
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    if (!this.openaiClient) {
      throw new AIError(
        'OpenAI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      let response;
      
      // Handle different operation types
      if (request.operationType === 'chat-completion') {
        const messages = [];
        
        // Add system message if provided
        if (request.systemMessage) {
          messages.push({
            role: 'system',
            content: request.systemMessage,
          });
        }
        
        // Add history if provided
        if (request.history && request.history.length > 0) {
          messages.push(...request.history);
        } else {
          // Add prompt as user message
          messages.push({
            role: 'user',
            content: request.prompt,
          });
        }
        
        // Handle streaming
        if (request.stream) {
          // Create a unique ID for this streaming session
          const streamId = uuidv4();
          
          // Set up WebSocket if not already connected
          if (!this.wsClients.has(request.requestId!)) {
            // This would normally connect to a real WebSocket server
            // For this example, we'll simulate it
            this.log(`Would establish WebSocket for stream ${streamId}`);
          }
          
          // Start streaming in the background
          (async () => {
            try {
              const stream = await this.openaiClient!.chat.completions.create({
                model: 'gpt-4o',
                messages,
                temperature: request.temperature,
                max_tokens: request.maxTokens,
                top_p: request.topP,
                stream: true,
                functions: request.functions,
                function_call: request.functionCall,
              });
              
              for await (const chunk of stream) {
                // In a real implementation, send this to the WebSocket
                this.eventEmitter.emit(`stream:${streamId}`, {
                  chunk,
                  done: false,
                });
              }
              
              this.eventEmitter.emit(`stream:${streamId}`, {
                done: true,
              });
            } catch (error) {
              this.eventEmitter.emit(`stream:${streamId}`, {
                error: this.handleProviderError(
                  error,
                  'openai',
                  request.requestId
                ),
                done: true,
              });
            }
          })();
          
          // Return immediately with stream ID
          return {
            responseId: uuidv4(),
            requestId: request.requestId!,
            provider: 'openai',
            operationType: request.operationType,
            fromCache: false,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            cost: 0, // Will be updated as stream progresses
            text: '',
            streamId,
          } as TextGenerationResponse;
        } else {
          // Non-streaming request
          response = await this.openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            top_p: request.topP,
            functions: request.functions,
            function_call: request.functionCall,
          });
        }
      } else {
        // Legacy completions API
        response = await this.openaiClient.completions.create({
          model: 'gpt-3.5-turbo-instruct',
          prompt: request.prompt,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          top_p: request.topP,
        });
      }
      
      // Track cost
      const usage = {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
      };
      
      const cost = this.trackCost(
        'openai',
        request.operationType,
        usage.totalTokens || 0,
        request.userId
      );
      
      // Create response
      const result: TextGenerationResponse = {
        ...this.createBaseResponse(
          request,
          'openai',
          false,
          startTime,
          cost,
          usage
        ),
        text: response.choices[0].message?.content || response.choices[0].text || '',
      };
      
      // Add function call if present
      if (response.choices[0].message?.function_call) {
        result.functionCall = {
          name: response.choices[0].message.function_call.name,
          arguments: JSON.parse(response.choices[0].message.function_call.arguments),
        };
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates text using Anthropic
   * @param request - Text generation request
   * @returns Text generation response
   * @private
   */
  private async generateTextWithAnthropic(
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    if (!this.anthropicClient) {
      throw new AIError(
        'Anthropic client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      let messages = [];
      
      // Add system message if provided
      if (request.systemMessage) {
        messages.push({
          role: 'system',
          content: request.systemMessage,
        });
      }
      
      // Add history if provided
      if (request.history && request.history.length > 0) {
        messages.push(...request.history);
      } else {
        // Add prompt as user message
        messages.push({
          role: 'user',
          content: request.prompt,
        });
      }
      
      // Handle streaming
      if (request.stream) {
        // Create a unique ID for this streaming session
        const streamId = uuidv4();
        
        // Start streaming in the background
        (async () => {
          try {
            const stream = await this.anthropicClient!.messages.create({
              model: 'claude-3-opus-20240229',
              messages,
              temperature: request.temperature,
              max_tokens: request.maxTokens,
              stream: true,
            });
            
            for await (const chunk of stream) {
              // In a real implementation, send this to the WebSocket
              this.eventEmitter.emit(`stream:${streamId}`, {
                chunk,
                done: false,
              });
            }
            
            this.eventEmitter.emit(`stream:${streamId}`, {
              done: true,
            });
          } catch (error) {
            this.eventEmitter.emit(`stream:${streamId}`, {
              error: this.handleProviderError(
                error,
                'anthropic',
                request.requestId
              ),
              done: true,
            });
          }
        })();
        
        // Return immediately with stream ID
        return {
          responseId: uuidv4(),
          requestId: request.requestId!,
          provider: 'anthropic',
          operationType: request.operationType,
          fromCache: false,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          cost: 0, // Will be updated as stream progresses
          text: '',
          streamId,
        } as TextGenerationResponse;
      }
      
      // Non-streaming request
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-opus-20240229',
        messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      });
      
      // Estimate token usage (Anthropic doesn't provide this directly)
      const promptTokens = Math.ceil(JSON.stringify(messages).length / 4);
      const completionTokens = Math.ceil(response.content[0].text.length / 4);
      const totalTokens = promptTokens + completionTokens;
      
      const usage = {
        promptTokens,
        completionTokens,
        totalTokens,
      };
      
      // Track cost
      const cost = this.trackCost(
        'anthropic',
        request.operationType,
        totalTokens,
        request.userId
      );
      
      // Create response
      return {
        ...this.createBaseResponse(
          request,
          'anthropic',
          false,
          startTime,
          cost,
          usage
        ),
        text: response.content[0].text,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates images using the specified provider
   * @param request - Image generation request
   * @returns Image generation response
   */
  public async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    request.requestId = request.requestId || uuidv4();
    
    // Validate request
    if (!request.prompt) {
      throw new AIError(
        'Prompt is required for image generation',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled
    if (request.useCache !== false) {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<ImageGenerationResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for image generation request ${request.requestId}`);
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
            case 'openai':
              return await this.generateImageWithOpenAI(request);
            case 'stability':
              return await this.generateImageWithStability(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support image generation`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Cache response if enabled
        if (request.useCache !== false) {
          const cacheKey = this.generateCacheKey(request);
          const cacheTtl = request.cacheTtl || this.config.redis?.cacheTtl || 3600;
          await this.cacheResponse(cacheKey, response, cacheTtl);
        }
        
        return response;
      } catch (error) {
        const aiError = this.handleProviderError(
          error,
          provider,
          request.requestId
        );
        
        this.log(
          `Error with provider ${provider} for image generation: ${aiError.message}`,
          'error',
          aiError
        );
        
        lastError = aiError;
        
        // Continue to next provider unless it's a budget error
        if (aiError.type === AIErrorType.BUDGET_EXCEEDED) {
          throw aiError;
        }
      }
    }
    
    // If all providers failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new AIError(
      'No available providers for image generation',
      AIErrorType.PROVIDER_ERROR
    );
  }

  /**
   * Generates images using OpenAI
   * @param request - Image generation request
   * @returns Image generation response
   * @private
   */
  private async generateImageWithOpenAI(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    if (!this.openaiClient) {
      throw new AIError(
        'OpenAI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      const response = await this.openaiClient.images.generate({
        prompt: request.prompt,
        n: request.n || 1,
        size: request.size || '1024x1024',
        response_format: request.format || 'url',
        style: request.style || 'vivid',
        quality: request.quality || 'standard',
      });
      
      // Estimate cost based on size and number of images
      const sizeMultiplier = {
        '256x256': 0.5,
        '512x512': 0.75,
        '1024x1024': 1,
        '1024x1792': 1.5,
        '1792x1024': 1.5,
      }[request.size || '1024x1024'] || 1;
      
      const qualityMultiplier = request.quality === 'hd' ? 2 : 1;
      const estimatedCost = (request.n || 1) * sizeMultiplier * qualityMultiplier * 0.02;
      
      // Track cost
      const cost = this.trackCost(
        'openai',
        request.operationType,
        (request.n || 1) * 1000, // Approximate token equivalent
        request.userId
      );
      
      // Create response
      return {
        ...this.createBaseResponse(
          request,
          'openai',
          false,
          startTime,
          cost
        ),
        images: response.data.map((image) => ({
          url: image.url,
          b64Json: image.b64_json,
          width: parseInt(request.size?.split('x')[0] || '1024'),
          height: parseInt(request.size?.split('x')[1] || '1024'),
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates images using Stability AI
   * @param request - Image generation request
   * @returns Image generation response
   * @private
   */
  private async generateImageWithStability(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    if (!this.axiosInstances.stability) {
      throw new AIError(
        'Stability AI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      // Map request parameters to Stability AI format
      const stabilityRequest = {
        text_prompts: [
          {
            text: request.prompt,
            weight: 1,
          },
        ],
        height: parseInt(request.size?.split('x')[1] || '1024'),
        width: parseInt(request.size?.split('x')[0] || '1024'),
        samples: request.n || 1,
        steps: 30,
      };
      
      if (request.negativePrompt) {
        stabilityRequest.text_prompts.push({
          text: request.negativePrompt,
          weight: -1,
        });
      }
      
      const response = await this.axiosInstances.stability.post(
        '/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        stabilityRequest
      );
      
      // Estimate cost
      const estimatedCost = (request.n || 1) * 0.02;
      
      // Track cost
      const cost = this.trackCost(
        'stability',
        request.operationType,
        (request.n || 1) * 1000, // Approximate token equivalent
        request.userId
      );
      
      // Create response
      return {
        ...this.createBaseResponse(
          request,
          'stability',
          false,
          startTime,
          cost
        ),
        images: response.data.artifacts.map((image: any) => ({
          b64Json: image.base64,
          width: parseInt(request.size?.split('x')[0] || '1024'),
          height: parseInt(request.size?.split('x')[1] || '1024'),
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transcribes audio using the specified provider
   * @param request - Transcription request
   * @returns Transcription response
   */
  public async transcribeAudio(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const startTime = Date.now();
    request.requestId = request.requestId || uuidv4();
    
    // Validate request
    if (!request.audioSource) {
      throw new AIError(
        'Audio source is required for transcription',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled and not streaming
    if (request.useCache !== false && request.sourceType !== 'stream') {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<TranscriptionResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for transcription request ${request.requestId}`);
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
            case 'assemblyai':
              return await this.transcribeWithAssemblyAI(request);
            case 'deepgram':
              return await this.transcribeWithDeepgram(request);
            case 'openai':
              return await this.transcribeWithOpenAI(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support transcription`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Cache response if enabled and not streaming
        if (request.useCache !== false && request.sourceType !== 'stream') {
          const cacheKey = this.generateCacheKey(request);
          const cacheTtl = request.cacheTtl || this.config.redis?.cacheTtl || 3600;
          await this.cacheResponse(cacheKey, response, cacheTtl);
        }
        
        return response;
      } catch (error) {
        const aiError = this.handleProviderError(
          error,
          provider,
          request.requestId
        );
        
        this.log(
          `Error with provider ${provider} for transcription: ${aiError.message}`,
          'error',
          aiError
        );
        
        lastError = aiError;
        
        // Continue to next provider unless it's a budget error
        if (aiError.type === AIErrorType.BUDGET_EXCEEDED) {
          throw aiError;
        }
      }
    }
    
    // If all providers failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new AIError(
      'No available providers for transcription',
      AIErrorType.PROVIDER_ERROR
    );
  }

  /**
   * Transcribes audio using AssemblyAI
   * @param request - Transcription request
   * @returns Transcription response
   * @private
   */
  private async transcribeWithAssemblyAI(
    request: TranscriptionRequest
  ): Promise<TranscriptionResponse> {
    if (!this.axiosInstances.assemblyai) {
      throw new AIError(
        'AssemblyAI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      let audioUrl: string;
      
      // Handle different source types
      if (request.sourceType === 'url') {
        audioUrl = request.audioSource;
      } else if (request.sourceType === 'base64') {
        // Upload base64 audio to AssemblyAI
        const uploadResponse = await this.axiosInstances.assemblyai.post('/v2/upload', {
          file_base64: request.audioSource,
        });
        audioUrl = uploadResponse.data.upload_url;
      } else if (request.sourceType === 'stream') {
        // Create a WebSocket connection for streaming
        const streamId = uuidv4();
        
        // In a real implementation, connect to AssemblyAI's real-time API
        this.log(`Would establish WebSocket for AssemblyAI stream ${streamId}`);
        
        // Return a placeholder response for streaming
        return {
          responseId: uuidv4(),
          requestId: request.requestId!,
          provider: 'assemblyai',
          operationType: request.operationType,
          fromCache: false,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          cost: 0,
          text: '',
          segments: [],
          streamId,
        } as TranscriptionResponse;
      } else {
        throw new AIError(
          'Invalid source type for transcription',
          AIErrorType.VALIDATION_ERROR
        );
      }
      
      // Create transcription request
      const transcriptionRequest = {
        audio_url: audioUrl,
        language_code: request.language,
        speaker_labels: request.speakerDiarization,
        speakers_expected: request.numSpeakers,
        sentiment_analysis: request.sentiment,
        auto_chapters: request.chapters,
        entity_detection: true,
        iab_categories: request.topics,
      };
      
      // Submit transcription request
      const submitResponse = await this.axiosInstances.assemblyai.post(
        '/v2/transcript',
        transcriptionRequest
      );
      
      const transcriptId = submitResponse.data.id;
      
      // Poll for completion
      let transcriptResponse;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        const pollResponse = await this.axiosInstances.assemblyai.get(
          `/v2/transcript/${transcriptId}`
        );
        
        if (pollResponse.data.status === 'completed') {
          transcriptResponse = pollResponse.data;
          break;
        } else if (pollResponse.data.status === 'error') {
          throw new AIError(
            `AssemblyAI transcription failed: ${pollResponse.data.error}`,
            AIErrorType.PROVIDER_ERROR
          );
        }
        
        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      if (!transcriptResponse) {
        throw new AIError(
          'Transcription timed out',
          AIErrorType.TIMEOUT_ERROR
        );
      }
      
      // Calculate audio duration in seconds
      const audioDuration = transcriptResponse.audio_duration;
      
      // Track cost (AssemblyAI charges per minute)
      const minutesOfAudio = Math.ceil(audioDuration / 60);
      const cost = this.trackCost(
        'assemblyai',
        request.operationType,
        minutesOfAudio * 1000, // Convert minutes to token equivalent
        request.userId
      );
      
      // Map response to our format
      const segments = transcriptResponse.words.map((word: any, index: number) => ({
        id: `segment-${index}`,
        text: word.text,
        start: word.start,
        end: word.end,
        speaker: word.speaker || undefined,
        confidence: word.confidence,
      }));
      
      let topics: string[] = [];
      if (transcriptResponse.iab_categories_result) {
        topics = Object.entries(transcriptResponse.iab_categories_result.summary)
          .filter(([_, score]) => (score as number) > 0.5)
          .map(([category]) => category);
      }
      
      let chapters: { title: string; start: number; end: number; summary?: string }[] = [];
      if (transcriptResponse.chapters) {
        chapters = transcriptResponse.chapters.map((chapter: any) => ({
          title: chapter.headline,
          start: chapter.start,
          end: chapter.end,
          summary: chapter.summary,
        }));
      }
      
      return {
        ...this.createBaseResponse(
          request,
          'assemblyai',
          false,
          startTime,
          cost
        ),
        text: transcriptResponse.text,
        segments,
        language: transcriptResponse.language_code,
        topics,
        chapters,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transcribes audio using Deepgram
   * @param request - Transcription request
   * @returns Transcription response
   * @private
   */
  private async transcribeWithDeepgram(
    request: TranscriptionRequest
  ): Promise<TranscriptionResponse> {
    if (!this.axiosInstances.deepgram) {
      throw new AIError(
        'Deepgram client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      // Set up request parameters
      const params = {
        language: request.language,
        model: 'nova-2',
        diarize: request.speakerDiarization,
        numerals: true,
        smart_format: true,
        utterances: true,
        punctuate: true,
      };
      
      let response;
      
      // Handle different source types
      if (request.sourceType === 'url') {
        response = await this.axiosInstances.deepgram.post(
          '/v1/listen',
          { url: request.audioSource },
          { params }
        );
      } else if (request.sourceType === 'base64') {
        // Convert base64 to binary
        const audioBuffer = Buffer.from(request.audioSource.split(',')[1], 'base64');
        
        response = await this.axiosInstances.deepgram.post(
          '/v1/listen',
          audioBuffer,
          {
            params,
            headers: {
              'Content-Type': 'audio/wav',
            },
          }
        );
      } else if (request.sourceType === 'stream') {
        // Create a WebSocket connection for streaming
        const streamId = uuidv4();
        
        // In a real implementation, connect to Deepgram's real-time API
        this.log(`Would establish WebSocket for Deepgram stream ${streamId}`);
        
        // Return a placeholder response for streaming
        return {
          responseId: uuidv4(),
          requestId: request.requestId!,
          provider: 'deepgram',
          operationType: request.operationType,
          fromCache: false,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          cost: 0,
          text: '',
          segments: [],
          streamId,
        } as TranscriptionResponse;
      } else {
        throw new AIError(
          'Invalid source type for transcription',
          AIErrorType.VALIDATION_ERROR
        );
      }
      
      const result = response.data;
      
      // Calculate audio duration in seconds
      const audioDuration = result.results.audio_duration;
      
      // Track cost (Deepgram charges per minute)
      const minutesOfAudio = Math.ceil(audioDuration / 60);
      const cost = this.trackCost(
        'deepgram',
        request.operationType,
        minutesOfAudio * 1000, // Convert minutes to token equivalent
        request.userId
      );
      
      // Map response to our format
      const segments = result.results.channels[0].alternatives[0].words.map(
        (word: any, index: number) => ({
          id: `segment-${index}`,
          text: word.word,
          start: word.start,
          end: word.end,
          speaker: word.speaker || undefined,
          confidence: word.confidence,
        })
      );
      
      return {
        ...this.createBaseResponse(
          request,
          'deepgram',
          false,
          startTime,
          cost
        ),
        text: result.results.channels[0].alternatives[0].transcript,
        segments,
        language: result.results.language,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transcribes audio using OpenAI
   * @param request - Transcription request
   * @returns Transcription response
   * @private
   */
  private async transcribeWithOpenAI(
    request: TranscriptionRequest
  ): Promise<TranscriptionResponse> {
    if (!this.openaiClient) {
      throw new AIError(
        'OpenAI client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    const startTime = Date.now();
    
    try {
      // OpenAI doesn't support streaming or URL directly
      if (request.sourceType === 'stream') {
        throw new AIError(
          'OpenAI does not support streaming transcription',
          AIErrorType.VALIDATION_ERROR
        );
      }
      
      let audioData;
      
      if (request.sourceType === 'url') {
        // Download audio from URL
        const response = await axios.get(request.audioSource, {
          responseType: 'arraybuffer',
        });
        audioData = response.data;
      } else if (request.sourceType === 'base64') {
        // Convert base64 to binary
        audioData = Buffer.from(request.audioSource.split(',')[1], 'base64');
      }
      
      // Create a file object
      const file = new File([audioData], 'audio.mp3', { type: 'audio/mp3' });
      
      // Transcribe
      const response = await this.openaiClient.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: request.language,
        response_format: 'verbose_json',
      });
      
      // Estimate audio duration in seconds (OpenAI doesn't provide this)
      const estimatedDuration = response.segments.reduce(
        (max, segment) => Math.max(max, segment.end),
        0
      );
      
      // Track cost (OpenAI charges per minute)
      const minutesOfAudio = Math.ceil(estimatedDuration / 60);
      const cost = this.trackCost(
        'openai',
        request.operationType,
        minutesOfAudio * 1000, // Convert minutes to token equivalent
        request.userId
      );
      
      // Map response to our format
      const segments = response.segments.map((segment) => ({
        id: `segment-${segment.id}`,
        text: segment.text,
        start: segment.start,
        end: segment.end,
        confidence: segment.confidence,
      }));
      
      return {
        ...this.createBaseResponse(
          request,
          'openai',
          false,
          startTime,
          cost
        ),
        text: response.text,
        segments,
        language: response.language,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Analyzes video using the specified provider
   * @param request - Video analysis request
   * @returns Video analysis response
   */
  public async analyzeVideo(request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> {
    const startTime = Date.now();
    request.requestId = request.requestId || uuidv4();
    
    // Validate request
    if (!request.videoUrl) {
      throw new AIError(
        'Video URL is required for video analysis',
        AIErrorType.VALIDATION_ERROR
      );
    }
    
    // Check cache if enabled
    if (request.useCache !== false) {
      const cacheKey = this.generateCacheKey(request);
      const cachedResponse = await this.getCachedResponse<VideoAnalysisResponse>(cacheKey);
      
      if (cachedResponse) {
        this.log(`Cache hit for video analysis request ${request.requestId}`);
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
            case 'aws-rekognition':
              return await this.analyzeVideoWithRekognition(request);
            default:
              throw new AIError(
                `Provider ${provider} does not support video analysis`,
                AIErrorType.VALIDATION_ERROR
              );
          }
        });
        
        // Cache response if enabled
        if (request.useCache !== false) {
          const cacheKey = this.generateCacheKey(request);
          const cacheTtl = request.cacheTtl || this.config.redis?.cacheTtl || 3600;
          await this.cacheResponse(cacheKey, response, cacheTtl);
        }
        
        return response;
      } catch (error) {
        const aiError = this.handleProviderError(
          error,
          provider,
          request.requestId
        );
        
        this.log(
          `Error with provider ${provider} for video analysis: ${aiError.message}`,
          'error',
          aiError
        );
        
        lastError = aiError;
        
        // Continue to next provider unless it's a budget error
        if (aiError.type === AIErrorType.BUDGET_EXCEEDED) {
          throw aiError;
        }
      }
    }
    
    // If all providers failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new AIError(
      'No available providers for video analysis',
      AIErrorType.PROVIDER_ERROR
    );
  }

  /**
   * Analyzes video using AWS Rekognition
   * @param request - Video analysis request
   * @returns Video analysis response
   * @private
   */
  private async analyzeVideoWithRekognition(
    request: VideoAnalysisRequest
  ): Promise<VideoAnalysisResponse> {
    if (!this.axiosInstances['aws-rekognition']) {
      throw new AIError(
        'AWS Rekognition client not initialized',
        AIErrorType.PROVIDER_ERROR
      );
    }
    
    