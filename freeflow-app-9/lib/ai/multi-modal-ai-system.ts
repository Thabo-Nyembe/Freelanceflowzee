/**
 * @file multi-modal-ai-system.ts
 * @description Comprehensive Multi-modal AI System for Phase 3 of the AI Enhancement Program.
 * Provides image generation, voice synthesis, cross-modal embeddings, semantic search,
 * multi-format content processing, and unified multi-modal pipelines.
 * @version 3.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  IntegratedAISystem,
  AIOperationStatus,
  AIOperationRequest
} from './integrated-ai-system';

// Environment configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
  `${typeof window !== 'undefined' ? window.location.protocol === 'https:' ? 'wss:' : 'ws:' : 'wss:'}//${typeof window !== 'undefined' ? window.location.host : 'localhost'}/api/ai/multi-modal/websocket`;

// Initialize Supabase clients
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_KEY ? 
  createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

/**
 * Multi-modal AI Providers
 */
export enum MultiModalProvider {
  // Image Generation
  DALLE = 'dalle',
  MIDJOURNEY = 'midjourney',
  STABLE_DIFFUSION = 'stable_diffusion',
  
  // Voice Synthesis
  ELEVENLABS = 'elevenlabs',
  OPENAI_TTS = 'openai_tts',
  GOOGLE_TTS = 'google_tts',
  AMAZON_POLLY = 'amazon_polly',
  
  // Embeddings & Semantic Search
  OPENAI_EMBEDDINGS = 'openai_embeddings',
  COHERE = 'cohere',
  HUGGINGFACE = 'huggingface',
  PINECONE = 'pinecone',
  WEAVIATE = 'weaviate',
  
  // Multi-format Processing
  ANTHROPIC_CLAUDE = 'anthropic_claude',
  OPENAI_GPT4V = 'openai_gpt4v',
  GOOGLE_GEMINI = 'google_gemini',
  
  // Auto-fallback
  AUTO = 'auto'
}

/**
 * Multi-modal Operation Types
 */
export enum MultiModalOperationType {
  // Image Generation
  IMAGE_GENERATION = 'image_generation',
  IMAGE_VARIATION = 'image_variation',
  IMAGE_EDITING = 'image_editing',
  IMAGE_UPSCALING = 'image_upscaling',
  IMAGE_STYLE_TRANSFER = 'image_style_transfer',
  
  // Voice Synthesis
  TEXT_TO_SPEECH = 'text_to_speech',
  VOICE_CLONING = 'voice_cloning',
  VOICE_STYLE_TRANSFER = 'voice_style_transfer',
  SPEECH_ENHANCEMENT = 'speech_enhancement',
  
  // Cross-modal Embeddings & Search
  CROSS_MODAL_EMBEDDING = 'cross_modal_embedding',
  SEMANTIC_SEARCH = 'semantic_search',
  CONTENT_SIMILARITY = 'content_similarity',
  MULTIMODAL_CLASSIFICATION = 'multimodal_classification',
  
  // Auto-generation Workflows
  TEXT_TO_IMAGE = 'text_to_image',
  TEXT_TO_VIDEO = 'text_to_video',
  SPEECH_TO_TEXT_TO_IMAGE = 'speech_to_text_to_image',
  IMAGE_TO_TEXT = 'image_to_text',
  VIDEO_TO_TEXT = 'video_to_text',
  
  // Multi-format Content Processing
  MULTIMODAL_UNDERSTANDING = 'multimodal_understanding',
  MULTIMODAL_GENERATION = 'multimodal_generation',
  MULTIMODAL_TRANSLATION = 'multimodal_translation',
  
  // Content Recommendations
  MULTIMODAL_RECOMMENDATION = 'multimodal_recommendation',
  CONTENT_DISCOVERY = 'content_discovery',
  ASSET_MATCHING = 'asset_matching',
  
  // Asset Library Management
  ASSET_INDEXING = 'asset_indexing',
  ASSET_TAGGING = 'asset_tagging',
  ASSET_ORGANIZATION = 'asset_organization',
  
  // Real-time Collaboration
  REALTIME_MULTIMODAL_SYNC = 'realtime_multimodal_sync',
  COLLABORATIVE_GENERATION = 'collaborative_generation',
  SHARED_CANVAS_SYNC = 'shared_canvas_sync',
}

/**
 * Multi-modal Content Types
 */
export enum MultiModalContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  TEXT_IMAGE = 'text_image',
  TEXT_AUDIO = 'text_audio',
  TEXT_VIDEO = 'text_video',
  IMAGE_AUDIO = 'image_audio',
  IMAGE_VIDEO = 'image_video',
  AUDIO_VIDEO = 'audio_video',
  TEXT_IMAGE_AUDIO = 'text_image_audio',
  TEXT_IMAGE_VIDEO = 'text_image_video',
  TEXT_AUDIO_VIDEO = 'text_audio_video',
  IMAGE_AUDIO_VIDEO = 'image_audio_video',
  TEXT_IMAGE_AUDIO_VIDEO = 'text_image_audio_video',
}

/**
 * Image Generation Parameters
 */
export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  style?: string;
  quality?: 'standard' | 'hd';
  seed?: number;
  guidanceScale?: number;
  steps?: number;
  modelVersion?: string;
  safetyFilter?: boolean;
  enhancePrompt?: boolean;
}

/**
 * Voice Synthesis Parameters
 */
export interface VoiceSynthesisParams {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  stability?: number;
  similarityBoost?: number;
  style?: string;
  emotion?: string;
  format?: 'mp3' | 'wav' | 'ogg';
  quality?: 'standard' | 'high';
  speakerId?: string;
  language?: string;
  preserveOriginalTiming?: boolean;
}

/**
 * Cross-modal Embedding Parameters
 */
export interface CrossModalEmbeddingParams {
  content: any;
  contentType: MultiModalContentType;
  dimensions?: number;
  model?: string;
  normalize?: boolean;
  truncate?: boolean;
  batchSize?: number;
}

/**
 * Semantic Search Parameters
 */
export interface SemanticSearchParams {
  query: any;
  queryType: MultiModalContentType;
  collection: string;
  limit?: number;
  filters?: Record<string, any>;
  minScore?: number;
  includeMetadata?: boolean;
  includeVectors?: boolean;
}

/**
 * Content Similarity Parameters
 */
export interface ContentSimilarityParams {
  sourceContent: any;
  sourceType: MultiModalContentType;
  targetContent: any;
  targetType: MultiModalContentType;
  metric?: 'cosine' | 'euclidean' | 'dot';
  threshold?: number;
}

/**
 * Auto-generation Workflow Parameters
 */
export interface AutoGenerationParams {
  input: any;
  inputType: MultiModalContentType;
  outputType: MultiModalContentType;
  steps?: string[];
  parameters?: Record<string, any>;
  intermediateResults?: boolean;
}

/**
 * Multi-modal Understanding Parameters
 */
export interface MultiModalUnderstandingParams {
  contents: Array<{
    content: any;
    contentType: MultiModalContentType;
  }>;
  task: string;
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
  outputFormat?: 'text' | 'json' | 'markdown';
}

/**
 * Asset Library Parameters
 */
export interface AssetLibraryParams {
  operation: 'index' | 'search' | 'tag' | 'organize';
  assets?: Array<{
    id?: string;
    content: any;
    contentType: MultiModalContentType;
    metadata?: Record<string, any>;
  }>;
  query?: any;
  queryType?: MultiModalContentType;
  filters?: Record<string, any>;
  tags?: string[];
  categories?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Real-time Collaboration Parameters
 */
export interface RealtimeCollaborationParams {
  sessionId: string;
  userId: string;
  operation: 'join' | 'update' | 'leave';
  content?: any;
  contentType?: MultiModalContentType;
  position?: { x: number; y: number };
  viewportState?: Record<string, any>;
  timestamp?: number;
}

/**
 * Multi-modal Operation Request
 */
export interface MultiModalOperationRequest {
  id: string;
  type: MultiModalOperationType;
  content: any;
  contentType: MultiModalContentType;
  params: any;
  provider?: MultiModalProvider;
  userId?: string;
  projectId?: string;
  organizationId?: string;
  timestamp: string;
  priority?: 'low' | 'normal' | 'high';
  webhook?: string;
  metadata?: Record<string, any>;
}

/**
 * Multi-modal Operation Result
 */
export interface MultiModalOperationResult {
  id: string;
  requestId: string;
  type: MultiModalOperationType;
  status: AIOperationStatus;
  result: any;
  resultType: MultiModalContentType;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  provider: MultiModalProvider;
  cost: number;
  processingTime: number; // in milliseconds
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Multi-modal System Configuration
 */
export interface MultiModalSystemConfig {
  providers: Record<MultiModalOperationType, {
    primary: MultiModalProvider;
    fallbacks: MultiModalProvider[];
  }>;
  globalOptions: {
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
    collaborationEnabled: boolean;
    maxAssetSize: number; // in bytes
    supportedFileTypes: Record<MultiModalContentType, string[]>;
  };
  userOptions?: {
    userId: string;
    projectId?: string;
    organizationId?: string;
    tier?: 'free' | 'pro' | 'enterprise' | 'custom';
  };
}

/**
 * Asset Metadata
 */
export interface AssetMetadata {
  id: string;
  name: string;
  type: MultiModalContentType;
  size: number;
  createdAt: string;
  updatedAt: string;
  creator: string;
  tags: string[];
  categories: string[];
  description?: string;
  attributes?: Record<string, any>;
  embeddings?: number[];
  thumbnailUrl?: string;
  sourceUrl?: string;
  permissions?: {
    public: boolean;
    readUsers: string[];
    writeUsers: string[];
  };
}

/**
 * Cache Strategy
 */
export enum CacheStrategy {
  MEMORY = 'memory',
  PERSISTENT = 'persistent',
  DISTRIBUTED = 'distributed',
  NONE = 'none',
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
 * Multi-modal Event Types
 */
export enum MultiModalEventType {
  OPERATION_CREATED = 'multimodal.operation.created',
  OPERATION_STARTED = 'multimodal.operation.started',
  OPERATION_PROGRESS = 'multimodal.operation.progress',
  OPERATION_COMPLETED = 'multimodal.operation.completed',
  OPERATION_FAILED = 'multimodal.operation.failed',
  OPERATION_CANCELLED = 'multimodal.operation.cancelled',
  QUOTA_UPDATED = 'multimodal.quota.updated',
  QUOTA_EXCEEDED = 'multimodal.quota.exceeded',
  PROVIDER_STATUS_CHANGED = 'multimodal.provider.status.changed',
  SYSTEM_ERROR = 'multimodal.system.error',
  CACHE_HIT = 'multimodal.cache.hit',
  CACHE_MISS = 'multimodal.cache.miss',
  COST_TRACKED = 'multimodal.cost.tracked',
  ASSET_INDEXED = 'multimodal.asset.indexed',
  ASSET_UPDATED = 'multimodal.asset.updated',
  ASSET_DELETED = 'multimodal.asset.deleted',
  COLLABORATION_JOINED = 'multimodal.collaboration.joined',
  COLLABORATION_UPDATED = 'multimodal.collaboration.updated',
  COLLABORATION_LEFT = 'multimodal.collaboration.left',
}

/**
 * Multi-modal Event
 */
export interface MultiModalEvent {
  type: MultiModalEventType;
  payload: any;
  timestamp: string;
}

/**
 * Multi-modal Cache Item
 */
interface MultiModalCacheItem {
  key: string;
  value: any;
  expiresAt: number;
  metadata?: {
    operationType: MultiModalOperationType;
    contentType: MultiModalContentType;
    provider: MultiModalProvider;
    userId?: string;
    projectId?: string;
  };
}

/**
 * Performance Metrics
 */
interface MultiModalPerformanceMetrics {
  operationType: MultiModalOperationType;
  contentType: MultiModalContentType;
  provider: MultiModalProvider;
  latency: number;
  processingTime: number;
  cost: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: string;
  contentSize?: number;
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
 * Multi-modal AI System
 * Central coordinator for all multi-modal AI functionality in the platform
 */
export class MultiModalAISystem {
  private static instance: MultiModalAISystem;
  private integratedAISystem: IntegratedAISystem;
  private config: MultiModalSystemConfig;
  private eventEmitter: EventEmitter;
  private websocket: WebSocket | null = null;
  private websocketStatus: WebSocketConnectionStatus = WebSocketConnectionStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private cache: Map<string, MultiModalCacheItem> = new Map();
  private pendingOperations: Map<string, MultiModalOperationRequest> = new Map();
  private completedOperations: Map<string, MultiModalOperationResult> = new Map();
  private assetLibrary: Map<string, AssetMetadata> = new Map();
  private performanceMetrics: MultiModalPerformanceMetrics[] = [];
  private collaborationSessions: Map<string, Set<string>> = new Map(); // sessionId -> Set of userIds
  private isInitialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.integratedAISystem = IntegratedAISystem.getInstance();
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
  public static getInstance(): MultiModalAISystem {
    if (!MultiModalAISystem.instance) {
      MultiModalAISystem.instance = new MultiModalAISystem();
    }
    return MultiModalAISystem.instance;
  }

  /**
   * Initialize the Multi-modal AI system
   * @param config Configuration options
   */
  public async initialize(config?: Partial<MultiModalSystemConfig>): Promise<void> {
    if (this.isInitialized) {
      console.warn('MultiModalAISystem is already initialized');
      return;
    }

    // Merge provided config with defaults
    if (config) {
      this.config = this.mergeConfigs(this.config, config);
    }

    // Initialize Integrated AI System if not already initialized
    await this.integratedAISystem.initialize();

    // Connect to WebSocket if real-time updates are enabled
    if (this.config.globalOptions.realTimeUpdatesEnabled && typeof window !== 'undefined') {
      this.connectWebSocket();
    }

    // Load asset library from Supabase
    await this.loadAssetLibrary();

    this.isInitialized = true;
    this.log('info', 'MultiModalAISystem initialized');
  }

  /**
   * Update system configuration
   * @param config New configuration options
   */
  public updateConfig(config: Partial<MultiModalSystemConfig>): void {
    this.config = this.mergeConfigs(this.config, config);
    this.log('info', 'Configuration updated');
  }

  /**
   * Generate image from text prompt
   * @param params Image generation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async generateImage(
    params: ImageGenerationParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.IMAGE_GENERATION,
      params.prompt,
      MultiModalContentType.TEXT,
      params,
      options
    );
  }

  /**
   * Create image variations
   * @param imageData Source image data (base64 or URL)
   * @param params Variation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async createImageVariations(
    imageData: string,
    params: Partial<ImageGenerationParams>,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.IMAGE_VARIATION,
      imageData,
      MultiModalContentType.IMAGE,
      params,
      options
    );
  }

  /**
   * Edit image with mask and prompt
   * @param imageData Source image data (base64 or URL)
   * @param maskData Mask data (base64 or URL)
   * @param params Edit parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async editImage(
    imageData: string,
    maskData: string,
    params: Partial<ImageGenerationParams>,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.IMAGE_EDITING,
      {
        image: imageData,
        mask: maskData,
        prompt: params.prompt
      },
      MultiModalContentType.IMAGE,
      params,
      options
    );
  }

  /**
   * Upscale image
   * @param imageData Source image data (base64 or URL)
   * @param scale Scale factor (2x, 4x)
   * @param options Operation options
   * @returns Operation result
   */
  public async upscaleImage(
    imageData: string,
    scale: number,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.IMAGE_UPSCALING,
      imageData,
      MultiModalContentType.IMAGE,
      { scale },
      options
    );
  }

  /**
   * Apply style transfer to image
   * @param imageData Source image data (base64 or URL)
   * @param styleData Style reference image or style name
   * @param params Style transfer parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async applyStyleTransfer(
    imageData: string,
    styleData: string,
    params: { strength?: number },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.IMAGE_STYLE_TRANSFER,
      {
        image: imageData,
        style: styleData
      },
      MultiModalContentType.IMAGE,
      params,
      options
    );
  }

  /**
   * Convert text to speech
   * @param params Voice synthesis parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async textToSpeech(
    params: VoiceSynthesisParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.TEXT_TO_SPEECH,
      params.text,
      MultiModalContentType.TEXT,
      params,
      options
    );
  }

  /**
   * Clone voice from audio samples
   * @param audioSamples Array of audio samples (base64 or URLs)
   * @param params Voice cloning parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async cloneVoice(
    audioSamples: string[],
    params: { name: string; description?: string },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.VOICE_CLONING,
      audioSamples,
      MultiModalContentType.AUDIO,
      params,
      options
    );
  }

  /**
   * Create cross-modal embeddings
   * @param content Content to embed
   * @param contentType Content type
   * @param params Embedding parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async createEmbeddings(
    content: any,
    contentType: MultiModalContentType,
    params: Partial<CrossModalEmbeddingParams>,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.CROSS_MODAL_EMBEDDING,
      content,
      contentType,
      params,
      options
    );
  }

  /**
   * Perform semantic search
   * @param params Semantic search parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async semanticSearch(
    params: SemanticSearchParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.SEMANTIC_SEARCH,
      params.query,
      params.queryType,
      params,
      options
    );
  }

  /**
   * Calculate content similarity
   * @param params Content similarity parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async contentSimilarity(
    params: ContentSimilarityParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.CONTENT_SIMILARITY,
      {
        source: params.sourceContent,
        target: params.targetContent
      },
      MultiModalContentType.TEXT_IMAGE,
      params,
      options
    );
  }

  /**
   * Execute auto-generation workflow
   * @param params Auto-generation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async executeWorkflow(
    params: AutoGenerationParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    // Determine operation type based on input and output types
    let operationType: MultiModalOperationType;
    
    if (params.inputType === MultiModalContentType.TEXT && params.outputType === MultiModalContentType.IMAGE) {
      operationType = MultiModalOperationType.TEXT_TO_IMAGE;
    } else if (params.inputType === MultiModalContentType.TEXT && params.outputType === MultiModalContentType.VIDEO) {
      operationType = MultiModalOperationType.TEXT_TO_VIDEO;
    } else if (params.inputType === MultiModalContentType.AUDIO && params.outputType === MultiModalContentType.IMAGE) {
      operationType = MultiModalOperationType.SPEECH_TO_TEXT_TO_IMAGE;
    } else if (params.inputType === MultiModalContentType.IMAGE && params.outputType === MultiModalContentType.TEXT) {
      operationType = MultiModalOperationType.IMAGE_TO_TEXT;
    } else if (params.inputType === MultiModalContentType.VIDEO && params.outputType === MultiModalContentType.TEXT) {
      operationType = MultiModalOperationType.VIDEO_TO_TEXT;
    } else {
      throw new Error(`Unsupported workflow: ${params.inputType} to ${params.outputType}`);
    }

    return this.executeOperation(
      operationType,
      params.input,
      params.inputType,
      params,
      options
    );
  }

  /**
   * Process multi-modal content
   * @param params Multi-modal understanding parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async processMultiModalContent(
    params: MultiModalUnderstandingParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    // Determine content type based on input contents
    const contentTypes = params.contents.map(c => c.contentType);
    let contentType: MultiModalContentType = MultiModalContentType.TEXT;
    
    if (contentTypes.includes(MultiModalContentType.TEXT) && 
        contentTypes.includes(MultiModalContentType.IMAGE) &&
        contentTypes.includes(MultiModalContentType.AUDIO) &&
        contentTypes.includes(MultiModalContentType.VIDEO)) {
      contentType = MultiModalContentType.TEXT_IMAGE_AUDIO_VIDEO;
    } else if (contentTypes.includes(MultiModalContentType.TEXT) && 
               contentTypes.includes(MultiModalContentType.IMAGE) &&
               contentTypes.includes(MultiModalContentType.AUDIO)) {
      contentType = MultiModalContentType.TEXT_IMAGE_AUDIO;
    } else if (contentTypes.includes(MultiModalContentType.TEXT) && 
               contentTypes.includes(MultiModalContentType.IMAGE)) {
      contentType = MultiModalContentType.TEXT_IMAGE;
    } else if (contentTypes.includes(MultiModalContentType.TEXT) && 
               contentTypes.includes(MultiModalContentType.AUDIO)) {
      contentType = MultiModalContentType.TEXT_AUDIO;
    }

    return this.executeOperation(
      MultiModalOperationType.MULTIMODAL_UNDERSTANDING,
      params.contents,
      contentType,
      params,
      options
    );
  }

  /**
   * Generate multi-modal content
   * @param prompt Prompt for generation
   * @param outputTypes Array of desired output types
   * @param params Generation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async generateMultiModalContent(
    prompt: string,
    outputTypes: MultiModalContentType[],
    params: { 
      maxOutputs?: number;
      temperature?: number;
      style?: string;
      quality?: 'standard' | 'high';
    },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    // Determine output content type
    let outputType: MultiModalContentType = MultiModalContentType.TEXT;
    
    if (outputTypes.includes(MultiModalContentType.TEXT) && 
        outputTypes.includes(MultiModalContentType.IMAGE) &&
        outputTypes.includes(MultiModalContentType.AUDIO) &&
        outputTypes.includes(MultiModalContentType.VIDEO)) {
      outputType = MultiModalContentType.TEXT_IMAGE_AUDIO_VIDEO;
    } else if (outputTypes.includes(MultiModalContentType.TEXT) && 
               outputTypes.includes(MultiModalContentType.IMAGE) &&
               outputTypes.includes(MultiModalContentType.AUDIO)) {
      outputType = MultiModalContentType.TEXT_IMAGE_AUDIO;
    } else if (outputTypes.includes(MultiModalContentType.TEXT) && 
               outputTypes.includes(MultiModalContentType.IMAGE)) {
      outputType = MultiModalContentType.TEXT_IMAGE;
    } else if (outputTypes.includes(MultiModalContentType.IMAGE) && 
               outputTypes.includes(MultiModalContentType.AUDIO)) {
      outputType = MultiModalContentType.IMAGE_AUDIO;
    }

    return this.executeOperation(
      MultiModalOperationType.MULTIMODAL_GENERATION,
      prompt,
      MultiModalContentType.TEXT,
      { ...params, outputTypes },
      options
    );
  }

  /**
   * Translate content across modalities
   * @param content Content to translate
   * @param contentType Content type
   * @param targetType Target content type
   * @param params Translation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async translateAcrossModalities(
    content: any,
    contentType: MultiModalContentType,
    targetType: MultiModalContentType,
    params: { 
      quality?: 'standard' | 'high';
      preserveStyle?: boolean;
      preserveContext?: boolean;
    },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.MULTIMODAL_TRANSLATION,
      content,
      contentType,
      { ...params, targetType },
      options
    );
  }

  /**
   * Get content recommendations
   * @param content Reference content
   * @param contentType Content type
   * @param params Recommendation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async getRecommendations(
    content: any,
    contentType: MultiModalContentType,
    params: { 
      limit?: number;
      filters?: Record<string, any>;
      diversity?: number;
      categories?: string[];
    },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.MULTIMODAL_RECOMMENDATION,
      content,
      contentType,
      params,
      options
    );
  }

  /**
   * Discover related content
   * @param query Search query
   * @param queryType Query type
   * @param params Discovery parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async discoverContent(
    query: any,
    queryType: MultiModalContentType,
    params: { 
      limit?: number;
      filters?: Record<string, any>;
      contentTypes?: MultiModalContentType[];
    },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.CONTENT_DISCOVERY,
      query,
      queryType,
      params,
      options
    );
  }

  /**
   * Match assets based on criteria
   * @param criteria Matching criteria
   * @param params Matching parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async matchAssets(
    criteria: any,
    params: { 
      contentTypes?: MultiModalContentType[];
      limit?: number;
      threshold?: number;
      categories?: string[];
    },
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    return this.executeOperation(
      MultiModalOperationType.ASSET_MATCHING,
      criteria,
      MultiModalContentType.TEXT,
      params,
      options
    );
  }

  /**
   * Manage asset library
   * @param params Asset library parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async manageAssetLibrary(
    params: AssetLibraryParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    let operationType: MultiModalOperationType;
    
    switch (params.operation) {
      case 'index':
        operationType = MultiModalOperationType.ASSET_INDEXING;
        break;
      case 'tag':
        operationType = MultiModalOperationType.ASSET_TAGGING;
        break;
      case 'organize':
        operationType = MultiModalOperationType.ASSET_ORGANIZATION;
        break;
      default:
        throw new Error(`Unsupported asset library operation: ${params.operation}`);
    }

    return this.executeOperation(
      operationType,
      params.assets || [],
      MultiModalContentType.TEXT_IMAGE_AUDIO_VIDEO,
      params,
      options
    );
  }

  /**
   * Manage real-time collaboration
   * @param params Collaboration parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async manageCollaboration(
    params: RealtimeCollaborationParams,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    // Update collaboration sessions
    if (params.sessionId) {
      if (params.operation === 'join') {
        if (!this.collaborationSessions.has(params.sessionId)) {
          this.collaborationSessions.set(params.sessionId, new Set());
        }
        this.collaborationSessions.get(params.sessionId)?.add(params.userId);
      } else if (params.operation === 'leave') {
        this.collaborationSessions.get(params.sessionId)?.delete(params.userId);
        if (this.collaborationSessions.get(params.sessionId)?.size === 0) {
          this.collaborationSessions.delete(params.sessionId);
        }
      }
    }

    return this.executeOperation(
      MultiModalOperationType.REALTIME_MULTIMODAL_SYNC,
      params,
      MultiModalContentType.TEXT_IMAGE_AUDIO_VIDEO,
      params,
      options
    );
  }

  /**
   * Execute a multi-modal AI operation
   * @param type Operation type
   * @param content Content to process
   * @param contentType Content type
   * @param params Operation parameters
   * @param options Operation options
   * @returns Operation result
   */
  public async executeOperation<T = any>(
    type: MultiModalOperationType,
    content: any,
    contentType: MultiModalContentType,
    params: any,
    options?: Partial<AIOperationRequest>
  ): Promise<MultiModalOperationResult> {
    // Check if system is initialized
    if (!this.isInitialized) {
      throw new Error('MultiModalAISystem is not initialized');
    }

    // Generate request ID
    const requestId = options?.id || uuidv4();

    // Determine provider
    const provider = options?.provider as MultiModalProvider || 
                    this.config.providers[type]?.primary || 
                    MultiModalProvider.AUTO;

    // Create operation request
    const request: MultiModalOperationRequest = {
      id: requestId,
      type,
      content,
      contentType,
      params,
      provider,
      userId: options?.userId || this.config.userOptions?.userId,
      projectId: options?.projectId || this.config.userOptions?.projectId,
      organizationId: options?.organizationId || this.config.userOptions?.organizationId,
      timestamp: new Date().toISOString(),
      priority: options?.priority || 'normal',
      webhook: options?.webhook,
      metadata: options?.metadata,
    };

    // Check cache if enabled
    if (this.config.globalOptions.cacheEnabled) {
      const cacheKey = this.generateCacheKey(type, content, contentType, params);
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult) {
        this.emitEvent(MultiModalEventType.CACHE_HIT, { requestId, cacheKey });
        return {
          id: uuidv4(),
          requestId,
          type,
          status: AIOperationStatus.COMPLETED,
          result: cachedResult,
          resultType: this.determineResultType(type, contentType),
          provider: request.provider,
          cost: 0, // No cost for cached results
          processingTime: 0,
          timestamp: new Date().toISOString(),
          metadata: { fromCache: true },
        };
      }
      
      this.emitEvent(MultiModalEventType.CACHE_MISS, { requestId, cacheKey });
    }

    // Store pending operation
    this.pendingOperations.set(requestId, request);

    // Emit operation created event
    this.emitEvent(MultiModalEventType.OPERATION_CREATED, { request });

    try {
      // Start operation
      this.emitEvent(MultiModalEventType.OPERATION_STARTED, { requestId });
      
      // Send progress update (0%)
      this.sendProgressUpdate(requestId, 0, `Starting ${type} operation`);

      // Execute operation
      const startTime = Date.now();
      const result = await this.processOperation(request);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Create result
      const operationResult: MultiModalOperationResult = {
        id: uuidv4(),
        requestId,
        type,
        status: AIOperationStatus.COMPLETED,
        result: result.result,
        resultType: result.resultType || this.determineResultType(type, contentType),
        provider: result.provider || request.provider,
        cost: result.cost || 0,
        processingTime,
        timestamp: new Date().toISOString(),
        metadata: result.metadata || {},
      };

      // Store completed operation
      this.completedOperations.set(requestId, operationResult);
      this.pendingOperations.delete(requestId);

      // Cache result if enabled
      if (this.config.globalOptions.cacheEnabled) {
        const cacheKey = this.generateCacheKey(type, content, contentType, params);
        const cacheTTL = this.config.globalOptions.defaultCacheTTL;
        this.cacheResult(cacheKey, result.result, cacheTTL, {
          operationType: type,
          contentType,
          provider: operationResult.provider,
          userId: request.userId,
          projectId: request.projectId,
        });
      }

      // Track cost if enabled
      if (this.config.globalOptions.costTrackingEnabled && request.userId) {
        await this.trackCost(
          request.userId,
          type,
          operationResult.provider,
          operationResult.cost
        );
      }

      // Track performance metrics
      if (this.config.globalOptions.performanceMonitoringEnabled) {
        this.trackPerformanceMetrics({
          operationType: type,
          contentType,
          provider: operationResult.provider,
          latency: processingTime,
          processingTime,
          cost: operationResult.cost,
          cacheHitRate: 0,
          errorRate: 0,
          timestamp: new Date().toISOString(),
          contentSize: this.estimateContentSize(content),
        });
      }

      // Emit operation completed event
      this.emitEvent(MultiModalEventType.OPERATION_COMPLETED, { result: operationResult });

      // Send webhook if configured
      if (request.webhook) {
        this.sendWebhook(request.webhook, {
          type: MultiModalEventType.OPERATION_COMPLETED,
          payload: { result: operationResult },
          timestamp: new Date().toISOString(),
        });
      }

      return operationResult;
    } catch (error) {
      const errorResult: MultiModalOperationResult = {
        id: uuidv4(),
        requestId,
        type,
        status: AIOperationStatus.FAILED,
        result: null,
        resultType: contentType,
        error: {
          code: 'operation_failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        provider: request.provider,
        cost: 0,
        processingTime: 0,
        timestamp: new Date().toISOString(),
      };

      // Store failed operation
      this.completedOperations.set(requestId, errorResult);
      this.pendingOperations.delete(requestId);

      // Emit operation failed event
      this.emitEvent(MultiModalEventType.OPERATION_FAILED, { result: errorResult });

      // Send webhook if configured
      if (request.webhook) {
        this.sendWebhook(request.webhook, {
          type: MultiModalEventType.OPERATION_FAILED,
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
      // Cancel operation
      const cancelledResult: MultiModalOperationResult = {
        id: uuidv4(),
        requestId,
        type: pendingOperation.type,
        status: AIOperationStatus.CANCELLED,
        result: null,
        resultType: pendingOperation.contentType,
        provider: pendingOperation.provider,
        cost: 0,
        processingTime: 0,
        timestamp: new Date().toISOString(),
      };

      // Store cancelled operation
      this.completedOperations.set(requestId, cancelledResult);
      this.pendingOperations.delete(requestId);

      // Emit operation cancelled event
      this.emitEvent(MultiModalEventType.OPERATION_CANCELLED, { result: cancelledResult });

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
  public getOperationResult(requestId: string): MultiModalOperationResult | null {
    return this.completedOperations.get(requestId) || null;
  }

  /**
   * Subscribe to multi-modal events
   * @param eventType Event type
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public subscribe(eventType: MultiModalEventType, callback: (event: MultiModalEvent) => void): () => void {
    this.eventEmitter.on(eventType, callback);
    return () => {
      this.eventEmitter.off(eventType, callback);
    };
  }

  /**
   * Subscribe to all multi-modal events
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public subscribeToAll(callback: (event: MultiModalEvent) => void): () => void {
    const handler = (event: MultiModalEvent) => callback(event);
    
    // Subscribe to all event types
    Object.values(MultiModalEventType).forEach(eventType => {
      this.eventEmitter.on(eventType, handler);
    });
    
    return () => {
      // Unsubscribe from all event types
      Object.values(MultiModalEventType).forEach(eventType => {
        this.eventEmitter.off(eventType, handler);
      });
    };
  }

  /**
   * Get asset by ID
   * @param assetId Asset ID
   * @returns Asset metadata or null if not found
   */
  public getAsset(assetId: string): AssetMetadata | null {
    return this.assetLibrary.get(assetId) || null;
  }

  /**
   * Search assets
   * @param query Search query
   * @param options Search options
   * @returns Matching assets
   */
  public searchAssets(
    query: string,
    options?: {
      contentTypes?: MultiModalContentType[];
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }
  ): AssetMetadata[] {
    let assets = Array.from(this.assetLibrary.values());
    
    // Filter by content type
    if (options?.contentTypes?.length) {
      assets = assets.filter(asset => options.contentTypes!.includes(asset.type));
    }
    
    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      assets = assets.filter(asset => 
        asset.name.toLowerCase().includes(lowerQuery) ||
        asset.description?.toLowerCase().includes(lowerQuery) ||
        asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply custom filters
    if (options?.filters) {
      assets = assets.filter(asset => {
        for (const [key, value] of Object.entries(options.filters!)) {
          if (key === 'tags' && Array.isArray(value)) {
            if (!value.every(tag => asset.tags.includes(tag))) {
              return false;
            }
          } else if (key === 'categories' && Array.isArray(value)) {
            if (!value.every(category => asset.categories.includes(category))) {
              return false;
            }
          } else if (key === 'creator' && typeof value === 'string') {
            if (asset.creator !== value) {
              return false;
            }
          } else if (key === 'createdAfter' && typeof value === 'string') {
            if (new Date(asset.createdAt) < new Date(value)) {
              return false;
            }
          } else if (key === 'createdBefore' && typeof value === 'string') {
            if (new Date(asset.createdAt) > new Date(value)) {
              return false;
            }
          } else if (key in asset) {
            // @ts-expect-error
            if (asset[key] !== value) {
              return false;
            }
          }
        }
        return true;
      });
    }
    
    // Sort assets
    if (options?.sortBy) {
      assets.sort((a, b) => {
        const key = options.sortBy as keyof AssetMetadata;
        const direction = options.sortDirection === 'desc' ? -1 : 1;
        
        if (key in a && key in b) {
          // @ts-expect-error
          const aValue = a[key];
          // @ts-expect-error
          const bValue = b[key];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction * aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            return direction * (aValue - bValue);
          }
        }
        
        return 0;
      });
    }
    
    // Apply pagination
    const limit = options?.limit || assets.length;
    const offset = options?.offset || 0;
    return assets.slice(offset, offset + limit);
  }

  /**
   * Add or update asset
   * @param asset Asset metadata
   * @returns Updated asset metadata
   */
  public async addOrUpdateAsset(asset: Partial<AssetMetadata> & { id: string }): Promise<AssetMetadata> {
    const existingAsset = this.assetLibrary.get(asset.id);
    
    const updatedAsset: AssetMetadata = {
      ...existingAsset,
      ...asset,
      updatedAt: new Date().toISOString(),
      tags: asset.tags || existingAsset?.tags || [],
      categories: asset.categories || existingAsset?.categories || [],
    } as AssetMetadata;
    
    if (!existingAsset) {
      updatedAsset.createdAt = new Date().toISOString();
    }
    
    // Store in memory
    this.assetLibrary.set(asset.id, updatedAsset);
    
    // Persist to Supabase
    try {
      const { error } = await supabaseClient
        .from('asset_library')
        .upsert({
          id: updatedAsset.id,
          name: updatedAsset.name,
          type: updatedAsset.type,
          size: updatedAsset.size,
          created_at: updatedAsset.createdAt,
          updated_at: updatedAsset.updatedAt,
          creator: updatedAsset.creator,
          tags: updatedAsset.tags,
          categories: updatedAsset.categories,
          description: updatedAsset.description,
          attributes: updatedAsset.attributes,
          embeddings: updatedAsset.embeddings,
          thumbnail_url: updatedAsset.thumbnailUrl,
          source_url: updatedAsset.sourceUrl,
          permissions: updatedAsset.permissions,
        });
      
      if (error) {
        this.log('error', 'Failed to persist asset', { assetId: asset.id, error });
      }
    } catch (error) {
      this.log('error', 'Failed to persist asset', { assetId: asset.id, error });
    }
    
    // Emit event
    this.emitEvent(
      existingAsset ? MultiModalEventType.ASSET_UPDATED : MultiModalEventType.ASSET_INDEXED,
      { asset: updatedAsset }
    );
    
    return updatedAsset;
  }

  /**
   * Delete asset
   * @param assetId Asset ID
   * @returns True if asset was deleted
   */
  public async deleteAsset(assetId: string): Promise<boolean> {
    const asset = this.assetLibrary.get(assetId);
    if (!asset) {
      return false;
    }
    
    // Remove from memory
    this.assetLibrary.delete(assetId);
    
    // Remove from Supabase
    try {
      const { error } = await supabaseClient
        .from('asset_library')
        .delete()
        .eq('id', assetId);
      
      if (error) {
        this.log('error', 'Failed to delete asset from database', { assetId, error });
      }
    } catch (error) {
      this.log('error', 'Failed to delete asset from database', { assetId, error });
    }
    
    // Emit event
    this.emitEvent(MultiModalEventType.ASSET_DELETED, { assetId, asset });
    
    return true;
  }

  /**
   * Get performance metrics
   * @param options Filter options
   * @returns Performance metrics
   */
  public getPerformanceMetrics(options?: {
    operationType?: MultiModalOperationType;
    contentType?: MultiModalContentType;
    provider?: MultiModalProvider;
    timeRange?: { start: Date; end: Date };
  }): MultiModalPerformanceMetrics[] {
    let metrics = [...this.performanceMetrics];

    if (options?.operationType) {
      metrics = metrics.filter(m => m.operationType === options.operationType);
    }

    if (options?.contentType) {
      metrics = metrics.filter(m => m.contentType === options.contentType);
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
    operationType?: MultiModalOperationType;
    contentType?: MultiModalContentType;
    provider?: MultiModalProvider;
    timeRange?: { start: Date; end: Date };
  }): {
    averageLatency: number;
    averageProcessingTime: number;
    totalCost: number;
    cacheHitRate: number;
    errorRate: number;
    operationCount: number;
    averageContentSize?: number;
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
    
    const result: ReturnType<typeof this.getAggregatedMetrics> = {
      averageLatency: totalLatency / metrics.length,
      averageProcessingTime: totalProcessingTime / metrics.length,
      totalCost,
      cacheHitRate: totalCacheHitRate / metrics.length,
      errorRate: totalErrorRate / metrics.length,
      operationCount: metrics.length,
    };
    
    // Calculate average content size if available
    const contentSizeMetrics = metrics.filter(m => m.contentSize !== undefined);
    if (contentSizeMetrics.length > 0) {
      const totalContentSize = contentSizeMetrics.reduce((sum, m) => sum + (m.contentSize || 0), 0);
      result.averageContentSize = totalContentSize / contentSizeMetrics.length;
    }

    return result;
  }

  /**
   * Clear cache
   * @param options Clear options
   */
  public clearCache(options?: {
    operationType?: MultiModalOperationType;
    contentType?: MultiModalContentType;
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

      if (options.contentType && metadata.contentType !== options.contentType) {
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
    itemsByType: Record<MultiModalOperationType, number>;
    itemsByContentType: Record<MultiModalContentType, number>;
  } {
    const totalItems = this.cache.size;
    let sizeEstimate = 0;
    const itemsByType: Partial<Record<MultiModalOperationType, number>> = {};
    const itemsByContentType: Partial<Record<MultiModalContentType, number>> = {};
    
    // Calculate size estimate and count by type
    for (const [_, item] of this.cache.entries()) {
      sizeEstimate += this.estimateSize(item.value);
      
      if (item.metadata?.operationType) {
        const type = item.metadata.operationType;
        itemsByType[type] = (itemsByType[type] || 0) + 1;
      }
      
      if (item.metadata?.contentType) {
        const contentType = item.metadata.contentType;
        itemsByContentType[contentType] = (itemsByContentType[contentType] || 0) + 1;
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
      itemsByType: itemsByType as Record<MultiModalOperationType, number>,
      itemsByContentType: itemsByContentType as Record<MultiModalContentType, number>,
    };
  }

  /**
   * Get WebSocket connection status
   * @returns WebSocket status
   */
  public getWebSocketStatus(): {
    status: WebSocketConnectionStatus;
    reconnectAttempts: number;
    activeCollaborationSessions: number;
    activeUsers: number;
  } {
    let activeUsers = 0;
    for (const [_, users] of this.collaborationSessions.entries()) {
      activeUsers += users.size;
    }
    
    return {
      status: this.websocketStatus,
      reconnectAttempts: this.reconnectAttempts,
      activeCollaborationSessions: this.collaborationSessions.size,
      activeUsers,
    };
  }

  /**
   * Get collaboration session participants
   * @param sessionId Session ID
   * @returns Array of user IDs or null if session not found
   */
  public getCollaborationParticipants(sessionId: string): string[] | null {
    const participants = this.collaborationSessions.get(sessionId);
    return participants ? Array.from(participants) : null;
  }

  /**
   * Export operation history
   * @param options Export options
   * @returns Operation history
   */
  public exportOperationHistory(options?: {
    operationType?: MultiModalOperationType;
    contentType?: MultiModalContentType;
    userId?: string;
    projectId?: string;
    timeRange?: { start: Date; end: Date };
    status?: AIOperationStatus;
    limit?: number;
  }): MultiModalOperationResult[] {
    let operations = Array.from(this.completedOperations.values());

    if (options?.operationType) {
      operations = operations.filter(op => op.type === options.operationType);
    }

    if (options?.contentType) {
      operations = operations.filter(op => op.resultType === options.contentType);
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
   * Get cost breakdown by operation type
   * @param options Filter options
   * @returns Cost breakdown
   */
  public getCostBreakdown(options?: {
    userId?: string;
    projectId?: string;
    timeRange?: { start: Date; end: Date };
  }): Record<MultiModalOperationType, number> {
    const operations = this.exportOperationHistory({
      userId: options?.userId,
      projectId: options?.projectId,
      timeRange: options?.timeRange,
      status: AIOperationStatus.COMPLETED,
    });
    
    const costBreakdown: Partial<Record<MultiModalOperationType, number>> = {};
    
    for (const operation of operations) {
      costBreakdown[operation.type] = (costBreakdown[operation.type] || 0) + operation.cost;
    }
    
    return costBreakdown as Record<MultiModalOperationType, number>;
  }

  /**
   * Get cost breakdown by provider
   * @param options Filter options
   * @returns Cost breakdown
   */
  public getCostBreakdownByProvider(options?: {
    userId?: string;
    projectId?: string;
    timeRange?: { start: Date; end: Date };
  }): Record<MultiModalProvider, number> {
    const operations = this.exportOperationHistory({
      userId: options?.userId,
      projectId: options?.projectId,
      timeRange: options?.timeRange,
      status: AIOperationStatus.COMPLETED,
    });
    
    const costBreakdown: Partial<Record<MultiModalProvider, number>> = {};
    
    for (const operation of operations) {
      costBreakdown[operation.provider] = (costBreakdown[operation.provider] || 0) + operation.cost;
    }
    
    return costBreakdown as Record<MultiModalProvider, number>;
  }

  /**
   * Get default configuration
   * @returns Default configuration
   */
  private getDefaultConfig(): MultiModalSystemConfig {
    return {
      providers: {
        [MultiModalOperationType.IMAGE_GENERATION]: {
          primary: MultiModalProvider.DALLE,
          fallbacks: [MultiModalProvider.STABLE_DIFFUSION, MultiModalProvider.MIDJOURNEY],
        },
        [MultiModalOperationType.IMAGE_VARIATION]: {
          primary: MultiModalProvider.DALLE,
          fallbacks: [MultiModalProvider.STABLE_DIFFUSION],
        },
        [MultiModalOperationType.IMAGE_EDITING]: {
          primary: MultiModalProvider.DALLE,
          fallbacks: [MultiModalProvider.STABLE_DIFFUSION],
        },
        [MultiModalOperationType.IMAGE_UPSCALING]: {
          primary: MultiModalProvider.STABLE_DIFFUSION,
          fallbacks: [],
        },
        [MultiModalOperationType.IMAGE_STYLE_TRANSFER]: {
          primary: MultiModalProvider.STABLE_DIFFUSION,
          fallbacks: [],
        },
        [MultiModalOperationType.TEXT_TO_SPEECH]: {
          primary: MultiModalProvider.ELEVENLABS,
          fallbacks: [MultiModalProvider.OPENAI_TTS, MultiModalProvider.GOOGLE_TTS],
        },
        [MultiModalOperationType.VOICE_CLONING]: {
          primary: MultiModalProvider.ELEVENLABS,
          fallbacks: [],
        },
        [MultiModalOperationType.VOICE_STYLE_TRANSFER]: {
          primary: MultiModalProvider.ELEVENLABS,
          fallbacks: [],
        },
        [MultiModalOperationType.SPEECH_ENHANCEMENT]: {
          primary: MultiModalProvider.ELEVENLABS,
          fallbacks: [],
        },
        [MultiModalOperationType.CROSS_MODAL_EMBEDDING]: {
          primary: MultiModalProvider.OPENAI_EMBEDDINGS,
          fallbacks: [MultiModalProvider.COHERE],
        },
        [MultiModalOperationType.SEMANTIC_SEARCH]: {
          primary: MultiModalProvider.PINECONE,
          fallbacks: [MultiModalProvider.WEAVIATE],
        },
        [MultiModalOperationType.CONTENT_SIMILARITY]: {
          primary: MultiModalProvider.OPENAI_EMBEDDINGS,
          fallbacks: [MultiModalProvider.COHERE],
        },
        [MultiModalOperationType.MULTIMODAL_CLASSIFICATION]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.TEXT_TO_IMAGE]: {
          primary: MultiModalProvider.DALLE,
          fallbacks: [MultiModalProvider.STABLE_DIFFUSION, MultiModalProvider.MIDJOURNEY],
        },
        [MultiModalOperationType.TEXT_TO_VIDEO]: {
          primary: MultiModalProvider.STABLE_DIFFUSION,
          fallbacks: [],
        },
        [MultiModalOperationType.SPEECH_TO_TEXT_TO_IMAGE]: {
          primary: MultiModalProvider.AUTO,
          fallbacks: [],
        },
        [MultiModalOperationType.IMAGE_TO_TEXT]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.VIDEO_TO_TEXT]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.MULTIMODAL_UNDERSTANDING]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE, MultiModalProvider.GOOGLE_GEMINI],
        },
        [MultiModalOperationType.MULTIMODAL_GENERATION]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE, MultiModalProvider.GOOGLE_GEMINI],
        },
        [MultiModalOperationType.MULTIMODAL_TRANSLATION]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.MULTIMODAL_RECOMMENDATION]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.CONTENT_DISCOVERY]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.ASSET_MATCHING]: {
          primary: MultiModalProvider.OPENAI_EMBEDDINGS,
          fallbacks: [MultiModalProvider.COHERE],
        },
        [MultiModalOperationType.ASSET_INDEXING]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.ASSET_TAGGING]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.ASSET_ORGANIZATION]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.REALTIME_MULTIMODAL_SYNC]: {
          primary: MultiModalProvider.AUTO,
          fallbacks: [],
        },
        [MultiModalOperationType.COLLABORATIVE_GENERATION]: {
          primary: MultiModalProvider.OPENAI_GPT4V,
          fallbacks: [MultiModalProvider.ANTHROPIC_CLAUDE],
        },
        [MultiModalOperationType.SHARED_CANVAS_SYNC]: {
          primary: MultiModalProvider.AUTO,
          fallbacks: [],
        },
      },
      globalOptions: {
        costTrackingEnabled: true,
        quotaManagementEnabled: true,
        realTimeUpdatesEnabled: true,
        cacheEnabled: true,
        defaultCacheTTL: 3600, // 1 hour
        errorRetryCount: 3,
        errorRetryDelay: 1000,
        performanceMonitoringEnabled: true,
        logLevel: 'info',
        collaborationEnabled: true,
        maxAssetSize: 100 * 1024 * 1024, // 100 MB
        supportedFileTypes: {
          [MultiModalContentType.TEXT]: ['text/plain', 'text/markdown', 'text/html', 'application/json'],
          [MultiModalContentType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
          [MultiModalContentType.AUDIO]: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
          [MultiModalContentType.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime'],
          [MultiModalContentType.TEXT_IMAGE]: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
          [MultiModalContentType.TEXT_AUDIO]: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          [MultiModalContentType.TEXT_VIDEO]: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
          [MultiModalContentType.IMAGE_AUDIO]: ['image/jpeg', 'image/png', 'audio/mp3', 'audio/wav'],
          [MultiModalContentType.IMAGE_VIDEO]: ['video/mp4', 'video/webm'],
          [MultiModalContentType.AUDIO_VIDEO]: ['video/mp4', 'video/webm'],
          [MultiModalContentType.TEXT_IMAGE_AUDIO]: ['application/pdf'],
          [MultiModalContentType.TEXT_IMAGE_VIDEO]: ['application/pdf'],
          [MultiModalContentType.TEXT_AUDIO_VIDEO]: ['application/pdf'],
          [MultiModalContentType.IMAGE_AUDIO_VIDEO]: ['video/mp4', 'video/webm'],
          [MultiModalContentType.TEXT_IMAGE_AUDIO_VIDEO]: ['application/octet-stream'],
        },
      },
    };
  }

  /**
   * Merge configurations
   * @param baseConfig Base configuration
   * @param newConfig New configuration
   * @returns Merged configuration
   */
  private mergeConfigs(baseConfig: MultiModalSystemConfig, newConfig: Partial<MultiModalSystemConfig>): MultiModalSystemConfig {
    const mergedConfig = { ...baseConfig };

    // Merge providers
    if (newConfig.providers) {
      mergedConfig.providers = { ...mergedConfig.providers };
      
      for (const [type, config] of Object.entries(newConfig.providers)) {
        mergedConfig.providers[type as MultiModalOperationType] = {
          ...mergedConfig.providers[type as MultiModalOperationType],
          ...config,
        };
      }
    }

    // Merge global options
    if (newConfig.globalOptions) {
      mergedConfig.globalOptions = {
        ...mergedConfig.globalOptions,
        ...newConfig.globalOptions,
        
        // Merge supportedFileTypes if provided
        supportedFileTypes: newConfig.globalOptions.supportedFileTypes
          ? {
              ...mergedConfig.globalOptions.supportedFileTypes,
              ...newConfig.globalOptions.supportedFileTypes,
            }
          : mergedConfig.globalOptions.supportedFileTypes,
      };
    }

    // Merge user options
    if (newConfig.userOptions) {
      mergedConfig.userOptions = {
        ...mergedConfig.userOptions,
        ...newConfig.userOptions,
      };
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
}