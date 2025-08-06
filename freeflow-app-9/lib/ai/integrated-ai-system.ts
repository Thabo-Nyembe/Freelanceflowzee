/**
 * @file integrated-ai-system.ts
 * @description Comprehensive integrated AI system that connects all AI components
 * with the unified AI Gateway. Provides state management, real-time sync,
 * cost tracking, quota management, and other core AI infrastructure services.
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { AIGateway, AIProvider, AIRequestOptions, AIResponse } from './ai-gateway';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';
import { debounce, throttle } from 'lodash';

// Environment configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
  `${typeof window !== 'undefined' ? window.location.protocol === 'https:' ? 'wss:' : 'ws:' : 'wss:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost'}/api/ai/websocket`;

// Initialize Supabase clients
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_KEY ? 
  createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

/**
 * AI Operation Types
 */
export enum AIOperationType {
  TRANSCRIPTION = 'transcription',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  SUMMARIZATION = 'summarization',
  CONTENT_GENERATION = 'content_generation',
  IMAGE_GENERATION = 'image_generation',
  SCENE_DETECTION = 'scene_detection',
  EMOTION_ANALYSIS = 'emotion_analysis',
  OBJECT_DETECTION = 'object_detection',
  FACE_RECOGNITION = 'face_recognition',
  SPEECH_TO_TEXT = 'speech_to_text',
  TEXT_TO_SPEECH = 'text_to_speech',
  TRANSLATION = 'translation',
  CONTENT_MODERATION = 'content_moderation',
  KEYWORD_EXTRACTION = 'keyword_extraction',
  CHAPTER_GENERATION = 'chapter_generation',
  HIGHLIGHT_DETECTION = 'highlight_detection',
  AUDIO_ENHANCEMENT = 'audio_enhancement',
  VIDEO_ENHANCEMENT = 'video_enhancement',
  THUMBNAIL_GENERATION = 'thumbnail_generation',
  B_ROLL_SELECTION = 'b_roll_selection',
}

/**
 * AI Operation Status
 */
export enum AIOperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * AI Content Type
 */
export enum AIContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  MIXED = 'mixed',
}

/**
 * AI Feature Configuration
 */
export interface AIFeatureConfig {
  enabled: boolean;
  provider?: AIProvider;
  options?: Record<string, any>;
  cacheResults?: boolean;
  cacheTTL?: number; // in seconds
  costLimit?: number; // in credits/dollars
  priority?: 'low' | 'normal' | 'high';
  webhook?: string;
  fallbackProviders?: AIProvider[];
}

/**
 * AI System Configuration
 */
export interface AISystemConfig {
  features: Record<AIOperationType, AIFeatureConfig>;
  globalOptions: {
    defaultProvider: AIProvider;
    costTrackingEnabled: boolean;
    quotaManagementEnabled: boolean;
    realTimeUpdatesEnabled: boolean;
    cacheEnabled: boolean;
    defaultCacheTTL: number;
    errorRetryCount: number;
    errorRetryDelay: number;
    performanceMonitoringEnabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    webhookSecret?: string;
  };
  userOptions?: {
    userId: string;
    projectId?: string;
    organizationId?: string;
    tier?: 'free' | 'pro' | 'enterprise' | 'custom';
  };
}

/**
 * AI Operation Request
 */
export interface AIOperationRequest {
  id: string;
  type: AIOperationType;
  content: any;
  options?: AIRequestOptions;
  provider?: AIProvider;
  userId?: string;
  projectId?: string;
  organizationId?: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high';
  webhook?: string;
  metadata?: Record<string, any>;
}

/**
 * AI Operation Result
 */
export interface AIOperationResult {
  id: string;
  requestId: string;
  type: AIOperationType;
  status: AIOperationStatus;
  result: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  provider: AIProvider;
  cost: number;
  processingTime: number; // in milliseconds
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * AI Operation Progress
 */
export interface AIOperationProgress {
  requestId: string;
  status: AIOperationStatus;
  progress: number; // 0-100
  currentStep?: string;
  estimatedTimeRemaining?: number; // in milliseconds
  timestamp: string;
}

/**
 * AI Quota Usage
 */
export interface AIQuotaUsage {
  userId: string;
  projectId?: string;
  organizationId?: string;
  tier: 'free' | 'pro' | 'enterprise' | 'custom';
  used: number;
  total: number;
  resetDate: string;
  usageByOperation: Partial<Record<AIOperationType, number>>;
  usageByProvider: Partial<Record<AIProvider, number>>;
  lastUpdated: string;
}

/**
 * AI Event Types
 */
export enum AIEventType {
  OPERATION_CREATED = 'operation.created',
  OPERATION_STARTED = 'operation.started',
  OPERATION_PROGRESS = 'operation.progress',
  OPERATION_COMPLETED = 'operation.completed',
  OPERATION_FAILED = 'operation.failed',
  OPERATION_CANCELLED = 'operation.cancelled',
  QUOTA_UPDATED = 'quota.updated',
  QUOTA_EXCEEDED = 'quota.exceeded',
  PROVIDER_STATUS_CHANGED = 'provider.status.changed',
  SYSTEM_ERROR = 'system.error',
  CACHE_HIT = 'cache.hit',
  CACHE_MISS = 'cache.miss',
  COST_TRACKED = 'cost.tracked',
}

/**
 * AI Event
 */
export interface AIEvent {
  type: AIEventType;
  payload: any;
  timestamp: string;
}

/**
 * AI Cache Item
 */
interface AICacheItem {
  key: string;
  value: any;
  expiresAt: number;
  metadata?: {
    operationType: AIOperationType;
    provider: AIProvider;
    userId?: string;
    projectId?: string;
  };
}

/**
 * WebSocket Message
 */
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  signature?: string;
}

/**
 * WebSocket Connection Status
 */
enum WebSocketConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * Performance Metrics
 */
interface PerformanceMetrics {
  operationType: AIOperationType;
  provider: AIProvider;
  latency: number;
  processingTime: number;
  cost: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: string;
}

/**
 * Integrated AI System
 * Central coordinator for all AI functionality in the platform
 */
export class IntegratedAISystem {
  private static instance: IntegratedAISystem;
  private aiGateway: AIGateway;
  private config: AISystemConfig;
  private eventEmitter: EventEmitter;
  private websocket: WebSocket | null = null;
  private websocketStatus: WebSocketConnectionStatus = WebSocketConnectionStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private cache: Map<string, AICacheItem> = new Map();
  private pendingOperations: Map<string, AIOperationRequest> = new Map();
  private completedOperations: Map<string, AIOperationResult> = new Map();
  private quotaUsage: AIQuotaUsage | null = null;
  private performanceMetrics: PerformanceMetrics[] = [];
  private isInitialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.aiGateway = new AIGateway();
    this.eventEmitter = new EventEmitter();
    this.config = this.getDefaultConfig();

    // Increase max listeners to avoid memory leak warnings
    this.eventEmitter.setMaxListeners(100);

    // Setup periodic cache cleanup
    setInterval(() => this.cleanupCache(), 60000); // every minute
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): IntegratedAISystem {
    if (!IntegratedAISystem.instance) {
      IntegratedAISystem.instance = new IntegratedAISystem();
    }
    return IntegratedAISystem.instance;
  }

  /**
   * Initialize the AI system
   * @param config Configuration options
   */
  public async initialize(config?: Partial<AISystemConfig>): Promise<void> {
    if (this.isInitialized) {
      console.warn('IntegratedAISystem is already initialized');
      return;
    }

    // Merge provided config with defaults
    if (config) {
      this.config = this.mergeConfigs(this.config, config);
    }

    // Initialize AI Gateway
    await this.aiGateway.initialize();

    // Connect to WebSocket if real-time updates are enabled
    if (this.config.globalOptions.realTimeUpdatesEnabled && typeof window !== 'undefined') {
      this.connectWebSocket();
    }

    // Load user quota if available
    if (this.config.userOptions?.userId && this.config.globalOptions.quotaManagementEnabled) {
      await this.loadUserQuota(this.config.userOptions.userId);
    }

    this.isInitialized = true;
    this.log('info', 'IntegratedAISystem initialized');
  }

  /**
   * Update system configuration
   * @param config New configuration options
   */
  public updateConfig(config: Partial<AISystemConfig>): void {
    this.config = this.mergeConfigs(this.config, config);
    this.log('info', 'Configuration updated');
  }

  /**
   * Execute an AI operation
   * @param type Operation type
   * @param content Content to process
   * @param options Operation options
   * @returns Operation result
   */
  public async executeOperation<T = any>(
    type: AIOperationType,
    content: any,
    options?: Partial<AIRequestOptions>
  ): Promise<AIOperationResult> {
    // Check if system is initialized
    if (!this.isInitialized) {
      throw new Error('IntegratedAISystem is not initialized');
    }

    // Check feature configuration
    const featureConfig = this.config.features[type];
    if (!featureConfig || !featureConfig.enabled) {
      throw new Error(`AI operation type '${type}' is not enabled`);
    }

    // Check quota if enabled
    if (this.config.globalOptions.quotaManagementEnabled && this.config.userOptions?.userId) {
      const hasQuota = await this.checkQuota(this.config.userOptions.userId, type);
      if (!hasQuota) {
        throw new Error('Quota exceeded for this operation');
      }
    }

    // Generate request ID
    const requestId = uuidv4();

    // Create operation request
    const request: AIOperationRequest = {
      id: requestId,
      type,
      content,
      options: {
        ...options,
        provider: options?.provider || featureConfig.provider || this.config.globalOptions.defaultProvider,
        fallbackProviders: options?.fallbackProviders || featureConfig.fallbackProviders,
      },
      userId: this.config.userOptions?.userId,
      projectId: this.config.userOptions?.projectId,
      organizationId: this.config.userOptions?.organizationId,
      timestamp: new Date().toISOString(),
      priority: options?.priority || featureConfig.priority || 'normal',
      webhook: options?.webhook || featureConfig.webhook,
      metadata: options?.metadata,
    };

    // Check cache if enabled
    if (this.config.globalOptions.cacheEnabled && featureConfig.cacheResults !== false) {
      const cacheKey = this.generateCacheKey(type, content, options);
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult) {
        this.emitEvent(AIEventType.CACHE_HIT, { requestId, cacheKey });
        return {
          id: uuidv4(),
          requestId,
          type,
          status: AIOperationStatus.COMPLETED,
          result: cachedResult,
          provider: request.options?.provider as AIProvider,
          cost: 0, // No cost for cached results
          processingTime: 0,
          timestamp: new Date().toISOString(),
          metadata: { fromCache: true },
        };
      }
      
      this.emitEvent(AIEventType.CACHE_MISS, { requestId, cacheKey });
    }

    // Store pending operation
    this.pendingOperations.set(requestId, request);

    // Emit operation created event
    this.emitEvent(AIEventType.OPERATION_CREATED, { request });

    try {
      // Start operation
      this.emitEvent(AIEventType.OPERATION_STARTED, { requestId });
      
      // Send progress update (0%)
      this.sendProgressUpdate(requestId, 0, 'Starting operation');

      // Execute operation through AI Gateway
      const startTime = Date.now();
      const response = await this.aiGateway.process({
        type,
        content,
        options: request.options,
        onProgress: (progress) => {
          this.sendProgressUpdate(requestId, progress, `Processing ${type}`);
        }
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Create result
      const result: AIOperationResult = {
        id: uuidv4(),
        requestId,
        type,
        status: AIOperationStatus.COMPLETED,
        result: response.result,
        provider: response.provider,
        cost: response.cost,
        processingTime,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      };

      // Store completed operation
      this.completedOperations.set(requestId, result);
      this.pendingOperations.delete(requestId);

      // Cache result if enabled
      if (this.config.globalOptions.cacheEnabled && featureConfig.cacheResults !== false) {
        const cacheKey = this.generateCacheKey(type, content, options);
        const cacheTTL = featureConfig.cacheTTL || this.config.globalOptions.defaultCacheTTL;
        this.cacheResult(cacheKey, response.result, cacheTTL, {
          operationType: type,
          provider: response.provider,
          userId: this.config.userOptions?.userId,
          projectId: this.config.userOptions?.projectId,
        });
      }

      // Track cost if enabled
      if (this.config.globalOptions.costTrackingEnabled) {
        await this.trackCost(
          this.config.userOptions?.userId,
          type,
          response.provider,
          response.cost
        );
      }

      // Track performance metrics
      if (this.config.globalOptions.performanceMonitoringEnabled) {
        this.trackPerformanceMetrics({
          operationType: type,
          provider: response.provider,
          latency: processingTime,
          processingTime,
          cost: response.cost,
          cacheHitRate: 0, // Will be calculated in aggregate
          errorRate: 0, // Will be calculated in aggregate
          timestamp: new Date().toISOString(),
        });
      }

      // Emit operation completed event
      this.emitEvent(AIEventType.OPERATION_COMPLETED, { result });

      // Send webhook if configured
      if (request.webhook) {
        this.sendWebhook(request.webhook, {
          type: AIEventType.OPERATION_COMPLETED,
          payload: { result },
          timestamp: new Date().toISOString(),
        });
      }

      return result;
    } catch (error) {
      const errorResult: AIOperationResult = {
        id: uuidv4(),
        requestId,
        type,
        status: AIOperationStatus.FAILED,
        result: null,
        error: {
          code: 'operation_failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        provider: request.options?.provider as AIProvider,
        cost: 0,
        processingTime: 0,
        timestamp: new Date().toISOString(),
      };

      // Store failed operation
      this.completedOperations.set(requestId, errorResult);
      this.pendingOperations.delete(requestId);

      // Emit operation failed event
      this.emitEvent(AIEventType.OPERATION_FAILED, { result: errorResult });

      // Send webhook if configured
      if (request.webhook) {
        this.sendWebhook(request.webhook, {
          type: AIEventType.OPERATION_FAILED,
          payload: { result: errorResult },
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }
  }

  /**
   * Cancel an ongoing operation
   * @param requestId Operation request ID
   * @returns True if operation was cancelled
   */
  public async cancelOperation(requestId: string): Promise<boolean> {
    const pendingOperation = this.pendingOperations.get(requestId);
    if (!pendingOperation) {
      return false;
    }

    try {
      // Cancel operation in AI Gateway
      await this.aiGateway.cancelOperation(requestId);

      // Update operation status
      const cancelledResult: AIOperationResult = {
        id: uuidv4(),
        requestId,
        type: pendingOperation.type,
        status: AIOperationStatus.CANCELLED,
        result: null,
        provider: pendingOperation.options?.provider as AIProvider,
        cost: 0,
        processingTime: 0,
        timestamp: new Date().toISOString(),
      };

      // Store cancelled operation
      this.completedOperations.set(requestId, cancelledResult);
      this.pendingOperations.delete(requestId);

      // Emit operation cancelled event
      this.emitEvent(AIEventType.OPERATION_CANCELLED, { result: cancelledResult });

      return true;
    } catch (error) {
      this.log('error', 'Failed to cancel operation', { requestId, error });
      return false;
    }
  }

  /**
   * Get operation status
   * @param requestId Operation request ID
   * @returns Operation status or null if not found
   */
  public getOperationStatus(requestId: string): AIOperationStatus | null {
    const pendingOperation = this.pendingOperations.get(requestId);
    if (pendingOperation) {
      return AIOperationStatus.PROCESSING;
    }

    const completedOperation = this.completedOperations.get(requestId);
    if (completedOperation) {
      return completedOperation.status;
    }

    return null;
  }

  /**
   * Get operation result
   * @param requestId Operation request ID
   * @returns Operation result or null if not found
   */
  public getOperationResult(requestId: string): AIOperationResult | null {
    return this.completedOperations.get(requestId) || null;
  }

  /**
   * Subscribe to AI events
   * @param eventType Event type
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public subscribe(eventType: AIEventType, callback: (event: AIEvent) => void): () => void {
    this.eventEmitter.on(eventType, callback);
    return () => {
      this.eventEmitter.off(eventType, callback);
    };
  }

  /**
   * Subscribe to all AI events
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public subscribeToAll(callback: (event: AIEvent) => void): () => void {
    const handler = (event: AIEvent) => callback(event);
    
    // Subscribe to all event types
    Object.values(AIEventType).forEach(eventType => {
      this.eventEmitter.on(eventType, handler);
    });
    
    return () => {
      // Unsubscribe from all event types
      Object.values(AIEventType).forEach(eventType => {
        this.eventEmitter.off(eventType, handler);
      });
    };
  }

  /**
   * Get user quota usage
   * @param userId User ID
   * @returns Quota usage or null if not available
   */
  public async getUserQuota(userId: string): Promise<AIQuotaUsage | null> {
    if (this.quotaUsage && this.quotaUsage.userId === userId) {
      return this.quotaUsage;
    }

    return await this.loadUserQuota(userId);
  }

  /**
   * Get performance metrics
   * @param options Filter options
   * @returns Performance metrics
   */
  public getPerformanceMetrics(options?: {
    operationType?: AIOperationType;
    provider?: AIProvider;
    timeRange?: { start: Date; end: Date };
  }): PerformanceMetrics[] {
    let metrics = [...this.performanceMetrics];

    if (options?.operationType) {
      metrics = metrics.filter(m => m.operationType === options.operationType);
    }

    if (options?.provider) {
      metrics = metrics.filter(m => m.provider === options.provider);
    }

    if (options?.timeRange) {
      metrics = metrics.filter(m => {
        const timestamp = new Date(m.timestamp);
        return timestamp >= options.timeRange!.start && timestamp <= options.timeRange!.end;
      });
    }

    return metrics;
  }

  /**
   * Get aggregated performance metrics
   * @param options Filter options
   * @returns Aggregated metrics
   */
  public getAggregatedMetrics(options?: {
    operationType?: AIOperationType;
    provider?: AIProvider;
    timeRange?: { start: Date; end: Date };
  }): {
    averageLatency: number;
    averageProcessingTime: number;
    totalCost: number;
    cacheHitRate: number;
    errorRate: number;
    operationCount: number;
  } {
    const metrics = this.getPerformanceMetrics(options);
    
    if (metrics.length === 0) {
      return {
        averageLatency: 0,
        averageProcessingTime: 0,
        totalCost: 0,
        cacheHitRate: 0,
        errorRate: 0,
        operationCount: 0,
      };
    }

    const totalLatency = metrics.reduce((sum, m) => sum + m.latency, 0);
    const totalProcessingTime = metrics.reduce((sum, m) => sum + m.processingTime, 0);
    const totalCost = metrics.reduce((sum, m) => sum + m.cost, 0);
    const totalCacheHitRate = metrics.reduce((sum, m) => sum + m.cacheHitRate, 0);
    const totalErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0);

    return {
      averageLatency: totalLatency / metrics.length,
      averageProcessingTime: totalProcessingTime / metrics.length,
      totalCost,
      cacheHitRate: totalCacheHitRate / metrics.length,
      errorRate: totalErrorRate / metrics.length,
      operationCount: metrics.length,
    };
  }

  /**
   * Clear cache
   * @param options Clear options
   */
  public clearCache(options?: {
    operationType?: AIOperationType;
    userId?: string;
    projectId?: string;
  }): void {
    if (!options) {
      // Clear all cache
      this.cache.clear();
      return;
    }

    // Clear specific cache items
    for (const [key, item] of this.cache.entries()) {
      const metadata = item.metadata;
      
      if (!metadata) {
        continue;
      }

      let shouldDelete = true;

      if (options.operationType && metadata.operationType !== options.operationType) {
        shouldDelete = false;
      }

      if (options.userId && metadata.userId !== options.userId) {
        shouldDelete = false;
      }

      if (options.projectId && metadata.projectId !== options.projectId) {
        shouldDelete = false;
      }

      if (shouldDelete) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  public getCacheStats(): {
    totalItems: number;
    sizeEstimate: number;
    hitRate: number;
    missRate: number;
    itemsByType: Record<AIOperationType, number>;
  } {
    const totalItems = this.cache.size;
    let sizeEstimate = 0;
    const itemsByType: Partial<Record<AIOperationType, number>> = {};
    
    // Calculate size estimate and count by type
    for (const [_, item] of this.cache.entries()) {
      sizeEstimate += JSON.stringify(item).length;
      
      if (item.metadata?.operationType) {
        const type = item.metadata.operationType;
        itemsByType[type] = (itemsByType[type] || 0) + 1;
      }
    }

    // Get hit/miss rates from metrics
    const metrics = this.getPerformanceMetrics();
    const hitRate = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length : 0;
    
    return {
      totalItems,
      sizeEstimate,
      hitRate,
      missRate: 1 - hitRate,
      itemsByType: itemsByType as Record<AIOperationType, number>,
    };
  }

  /**
   * Get WebSocket connection status
   * @returns WebSocket status
   */
  public getWebSocketStatus(): {
    status: WebSocketConnectionStatus;
    reconnectAttempts: number;
    lastMessageTimestamp?: string;
  } {
    return {
      status: this.websocketStatus,
      reconnectAttempts: this.reconnectAttempts,
      lastMessageTimestamp: this.websocket ? undefined : undefined,
    };
  }

  /**
   * Reconnect WebSocket
   */
  public reconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
    }
    this.connectWebSocket();
  }

  /**
   * Export operation history
   * @param options Export options
   * @returns Operation history
   */
  public exportOperationHistory(options?: {
    operationType?: AIOperationType;
    userId?: string;
    projectId?: string;
    timeRange?: { start: Date; end: Date };
    status?: AIOperationStatus;
    limit?: number;
  }): AIOperationResult[] {
    let operations = Array.from(this.completedOperations.values());

    if (options?.operationType) {
      operations = operations.filter(op => op.type === options.operationType);
    }

    if (options?.userId) {
      operations = operations.filter(op => op.metadata?.userId === options.userId);
    }

    if (options?.projectId) {
      operations = operations.filter(op => op.metadata?.projectId === options.projectId);
    }

    if (options?.timeRange) {
      operations = operations.filter(op => {
        const timestamp = new Date(op.timestamp);
        return timestamp >= options.timeRange!.start && timestamp <= options.timeRange!.end;
      });
    }

    if (options?.status) {
      operations = operations.filter(op => op.status === options.status);
    }

    // Sort by timestamp (newest first)
    operations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options?.limit) {
      operations = operations.slice(0, options.limit);
    }

    return operations;
  }

  /**
   * Get default configuration
   * @returns Default configuration
   */
  private getDefaultConfig(): AISystemConfig {
    const defaultFeatureConfig: AIFeatureConfig = {
      enabled: true,
      cacheResults: true,
    };

    const features: Record<AIOperationType, AIFeatureConfig> = {} as Record<AIOperationType, AIFeatureConfig>;
    
    // Set default config for all operation types
    Object.values(AIOperationType).forEach(type => {
      features[type] = { ...defaultFeatureConfig };
    });

    return {
      features,
      globalOptions: {
        defaultProvider: AIProvider.OPENAI,
        costTrackingEnabled: true,
        quotaManagementEnabled: true,
        realTimeUpdatesEnabled: true,
        cacheEnabled: true,
        defaultCacheTTL: 3600, // 1 hour
        errorRetryCount: 3,
        errorRetryDelay: 1000,
        performanceMonitoringEnabled: true,
        logLevel: 'info',
      },
    };
  }

  /**
   * Merge configurations
   * @param baseConfig Base configuration
   * @param newConfig New configuration
   * @returns Merged configuration
   */
  private mergeConfigs(baseConfig: AISystemConfig, newConfig: Partial<AISystemConfig>): AISystemConfig {
    const mergedConfig = { ...baseConfig };

    // Merge global options
    if (newConfig.globalOptions) {
      mergedConfig.globalOptions = {
        ...mergedConfig.globalOptions,
        ...newConfig.globalOptions,
      };
    }

    // Merge user options
    if (newConfig.userOptions) {
      mergedConfig.userOptions = {
        ...mergedConfig.userOptions,
        ...newConfig.userOptions,
      };
    }

    // Merge feature configs
    if (newConfig.features) {
      Object.entries(newConfig.features).forEach(([type, config]) => {
        const operationType = type as AIOperationType;
        if (mergedConfig.features[operationType]) {
          mergedConfig.features[operationType] = {
            ...mergedConfig.features[operationType],
            ...config,
          };
        } else {
          mergedConfig.features[operationType] = config;
        }
      });
    }

    return mergedConfig;
  }

  /**
   * Connect to WebSocket
   */
  private connectWebSocket(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.websocketStatus = WebSocketConnectionStatus.CONNECTING;
    
    try {
      // Close existing connection if any
      if (this.websocket) {
        this.websocket.close();
      }

      // Create URL with user ID if available
      let url = WEBSOCKET_URL;
      if (this.config.userOptions?.userId) {
        url += `?userId=${this.config.userOptions.userId}`;
      }

      // Create new WebSocket connection
      this.websocket = new WebSocket(url);

      // Connection opened
      this.websocket.addEventListener('open', () => {
        this.websocketStatus = WebSocketConnectionStatus.CONNECTED;
        this.reconnectAttempts = 0;
        this.log('info', 'WebSocket connected');

        // Send authentication message if user ID is available
        if (this.config.userOptions?.userId) {
          this.sendWebSocketMessage({
            type: 'authenticate',
            payload: {
              userId: this.config.userOptions.userId,
              projectId: this.config.userOptions.projectId,
              organizationId: this.config.userOptions.organizationId,
            },
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Listen for messages
      this.websocket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleWebSocketMessage(message);
        } catch (error) {
          this.log('error', 'Failed to parse WebSocket message', { error });
        }
      });

      // Connection closed
      this.websocket.addEventListener('close', () => {
        this.websocketStatus = WebSocketConnectionStatus.DISCONNECTED;
        this.log('info', 'WebSocket disconnected');

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
          setTimeout(() => this.connectWebSocket(), delay);
        }
      });

      // Connection error
      this.websocket.addEventListener('error', (error) => {
        this.websocketStatus = WebSocketConnectionStatus.ERROR;
        this.log('error', 'WebSocket error', { error });
      });
    } catch (error) {
      this.websocketStatus = WebSocketConnectionStatus.ERROR;
      this.log('error', 'Failed to connect WebSocket', { error });
    }
  }

  /**
   * Send WebSocket message
   * @param message Message to send
   */
  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Add signature if webhook secret is available
    if (this.config.globalOptions.webhookSecret) {
      message.signature = this.generateSignature(
        message.timestamp,
        JSON.stringify(message.payload),
        this.config.globalOptions.webhookSecret
      );
    }

    try {
      this.websocket.send(JSON.stringify(message));
    } catch (error) {
      this.log('error', 'Failed to send WebSocket message', { error });
    }
  }

  /**
   * Handle WebSocket message
   * @param message Received message
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    // Verify signature if webhook secret is available
    if (this.config.globalOptions.webhookSecret && message.signature) {
      const calculatedSignature = this.generateSignature(
        message.timestamp,
        JSON.stringify(message.payload),
        this.config.globalOptions.webhookSecret
      );

      if (calculatedSignature !== message.signature) {
        this.log('error', 'Invalid WebSocket message signature');
        return;
      }
    }

    switch (message.type) {
      case 'operation.progress':
        // Handle operation progress update
        const { requestId, progress, currentStep } = message.payload;
        this.emitEvent(AIEventType.OPERATION_PROGRESS, { requestId, progress, currentStep });
        break;

      case 'operation.completed':
        // Handle operation completion
        this.emitEvent(AIEventType.OPERATION_COMPLETED, message.payload);
        break;

      case 'operation.failed':
        // Handle operation failure
        this.emitEvent(AIEventType.OPERATION_FAILED, message.payload);
        break;

      case 'quota.updated':
        // Handle quota update
        this.quotaUsage = message.payload.quotaUsage;
        this.emitEvent(AIEventType.QUOTA_UPDATED, { quotaUsage: this.quotaUsage });
        break;

      case 'provider.status.changed':
        // Handle provider status change
        this.emitEvent(AIEventType.PROVIDER_STATUS_CHANGED, message.payload);
        break;

      case 'pong':
        // Handle pong response (for latency measurement)
        break;

      default:
        this.log('debug', 'Unknown WebSocket message type', { type: message.type });
    }
  }

  /**
   * Send progress update
   * @param requestId Request ID
   * @param progress Progress percentage (0-100)
   * @param currentStep Current processing step
   */
  private sendProgressUpdate(requestId: string, progress: number, currentStep?: string): void {
    const progressUpdate: AIOperationProgress = {
      requestId,
      status: AIOperationStatus.PROCESSING,
      progress,
      currentStep,
      timestamp: new Date().toISOString(),
    };

    // Emit progress event
    this.emitEvent(AIEventType.OPERATION_PROGRESS, progressUpdate);

    // Send WebSocket update if connected
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'operation.progress',
        payload: progressUpdate,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit AI event
   * @param type Event type
   * @param payload Event payload
   */
  private emitEvent(type: AIEventType, payload: any): void {
    const event: AIEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.eventEmitter.emit(type, event);
  }

  /**
   * Generate cache key
   * @param type Operation type
   * @param content Content to process
   * @param options Operation options
   * @returns Cache key
   */
  private generateCacheKey(
    type: AIOperationType,
    content: any,
    options?: Partial<AIRequestOptions>
  ): string {
    // Create a string representation of the operation
    const operationString = JSON.stringify({
      type,
      content,
      options: {
        ...options,
        // Exclude non-deterministic options
        timestamp: undefined,
        requestId: undefined,
        webhook: undefined,
      },
    });

    // Generate hash
    return createHash('md5').update(operationString).digest('hex');
  }

  /**
   * Get cached result
   * @param key Cache key
   * @returns Cached result or undefined if not found
   */
  private getCachedResult(key: string): any | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // Check if expired
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * Cache operation result
   * @param key Cache key
   * @param value Result value
   * @param ttl Time to live in seconds
   * @param metadata Cache metadata
   */
  private cacheResult(key: string, value: any, ttl: number, metadata?: AICacheItem['metadata']): void {
    const expiresAt = Date.now() + (ttl * 1000);
    
    this.cache.set(key, {
      key,
      value,
      expiresAt,
      metadata,
    });
  }

  /**
   * Clean up expired cache items
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Load user quota
   * @param userId User ID
   * @returns Quota usage or null if not available
   */
  private async loadUserQuota(userId: string): Promise<AIQuotaUsage | null> {
    try {
      // Get user quota from Supabase
      const { data, error } = await supabaseClient
        .from('user_quotas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        this.log('error', 'Failed to load user quota', { userId, error });
        return null;
      }

      // Get usage by operation
      const { data: usageData, error: usageError } = await supabaseClient
        .from('quota_usage_by_operation')
        .select('*')
        .eq('user_id', userId);

      if (usageError) {
        this.log('error', 'Failed to load usage by operation', { userId, error: usageError });
      }

      // Get usage by provider
      const { data: providerData, error: providerError } = await supabaseClient
        .from('quota_usage_by_provider')
        .select('*')
        .eq('user_id', userId);

      if (providerError) {
        this.log('error', 'Failed to load usage by provider', { userId, error: providerError });
      }

      // Create quota usage object
      const usageByOperation: Partial<Record<AIOperationType, number>> = {};
      const usageByProvider: Partial<Record<AIProvider, number>> = {};

      // Process usage by operation
      if (usageData) {
        usageData.forEach(item => {
          usageByOperation[item.operation_type as AIOperationType] = item.used_quota;
        });
      }

      // Process usage by provider
      if (providerData) {
        providerData.forEach(item => {
          usageByProvider[item.provider as AIProvider] = item.used_quota;
        });
      }

      this.quotaUsage = {
        userId,
        projectId: data.project_id,
        organizationId: data.organization_id,
        tier: data.tier,
        used: data.used_quota,
        total: data.total_quota,
        resetDate: data.reset_date,
        usageByOperation,
        usageByProvider,
        lastUpdated: new Date().toISOString(),
      };

      return this.quotaUsage;
    } catch (error) {
      this.log('error', 'Failed to load user quota', { userId, error });
      return null;
    }
  }

  /**
   * Check if user has sufficient quota
   * @param userId User ID
   * @param operationType Operation type
   * @returns True if user has sufficient quota
   */
  private async checkQuota(userId: string, operationType: AIOperationType): Promise<boolean> {
    // Load quota if not available
    if (!this.quotaUsage || this.quotaUsage.userId !== userId) {
      await this.loadUserQuota(userId);
    }

    // If still no quota data, assume user has quota
    if (!this.quotaUsage) {
      return true;
    }

    // Check if user has exceeded total quota
    return this.quotaUsage.used < this.quotaUsage.total;
  }

  /**
   * Track operation cost
   * @param userId User ID
   * @param operationType Operation type
   * @param provider AI provider
   * @param cost Operation cost
   */
  private async trackCost(
    userId?: string,
    operationType?: AIOperationType,
    provider?: AIProvider,
    cost: number = 0
  ): Promise<void> {
    if (!userId || cost <= 0) {
      return;
    }

    try {
      // Record cost in Supabase
      const { error } = await supabaseClient
        .from('cost_tracking')
        .insert({
          user_id: userId,
          operation_type: operationType,
          provider,
          cost,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        this.log('error', 'Failed to track cost', { userId, operationType, provider, cost, error });
        return;
      }

      // Update quota usage
      if (this.quotaUsage && this.quotaUsage.userId === userId) {
        this.quotaUsage.used += cost;
        
        // Update usage by operation
        if (operationType) {
          this.quotaUsage.usageByOperation[operationType] = 
            (this.quotaUsage.usageByOperation[operationType] || 0) + cost;
        }
        
        // Update usage by provider
        if (provider) {
          this.quotaUsage.usageByProvider[provider] = 
            (this.quotaUsage.usageByProvider[provider] || 0) + cost;
        }
        
        this.quotaUsage.lastUpdated = new Date().toISOString();
      }

      // Emit cost tracked event
      this.emitEvent(AIEventType.COST_TRACKED, {
        userId,
        operationType,
        provider,
        cost,
        timestamp: new Date().toISOString(),
      });

      // Check if quota exceeded
      if (this.quotaUsage && this.quotaUsage.used >= this.quotaUsage.total) {
        this.emitEvent(AIEventType.QUOTA_EXCEEDED, {
          userId,
          used: this.quotaUsage.used,
          total: this.quotaUsage.total,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.log('error', 'Failed to track cost', { userId, operationType, provider, cost, error });
    }
  }

  /**
   * Track performance metrics
   * @param metrics Performance metrics
   */
  private trackPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);

    // Keep only the last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  /**
   * Send webhook notification
   * @param url Webhook URL
   * @param event Event to send
   */
  private async sendWebhook(url: string, event: AIEvent): Promise<void> {
    try {
      // Generate signature if webhook secret is available
      let signature: string | undefined;
      if (this.config.globalOptions.webhookSecret) {
        signature = this.generateSignature(
          event.timestamp,
          JSON.stringify(event.payload),
          this.config.globalOptions.webhookSecret
        );
      }

      // Send webhook request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature || '',
          'X-Webhook-Timestamp': event.timestamp,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }
    } catch (error) {
      this.log('error', 'Failed to send webhook', { url, error });
    }
  }

  /**
   * Generate signature for webhook verification
   * @param timestamp Timestamp string
   * @param payload Payload string
   * @param secret Secret key
   * @returns Signature hash
   */
  private generateSignature(timestamp: string, payload: string, secret: string): string {
    return createHash('sha256')
      .update(`${timestamp}.${payload}.${secret}`)
      .digest('hex');
  }

  /**
   * Log message
   * @param level Log level
   * @param message Message
   * @param data Additional data
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    // Check if log level is enabled
    const logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    const configLevel = logLevels[this.config.globalOptions.logLevel];
    const messageLevel = logLevels[level];

    if (messageLevel < configLevel) {
      return;
    }

    // Log message
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };

    switch (level) {
      case 'debug':
        console.debug(`[IntegratedAISystem] ${message}`, data);
        break;
      case 'info':
        console.info(`[IntegratedAISystem] ${message}`, data);
        break;
      case 'warn':
        console.warn(`[IntegratedAISystem] ${message}`, data);
        break;
      case 'error':
        console.error(`[IntegratedAISystem] ${message}`, data);
        break;
    }
  }
}

// Export singleton instance
export const integratedAISystem = IntegratedAISystem.getInstance();
