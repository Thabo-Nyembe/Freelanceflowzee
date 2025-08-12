import { createClient } from '@supabase/supabase-js';
import * as tf from '@tensorflow/tfjs-node';
import { v4 as uuidv4 } from 'uuid';
import { 
  IntegratedAISystem,
  AIOperationResult,
  AIProvider,
  AIModelType,
  AIUsageMetrics
} from './integrated-ai-system';
import { MultiModalAISystem } from './multi-modal-ai-system';
import { SmartCollaborationAI } from './smart-collaboration-ai';
import { AIGateway } from './ai-gateway';
import { 
  logEvent, 
  trackMetric, 
  createAlert, 
  AlertSeverity 
} from '../analytics';
import { 
  RedisCache, 
  CacheStrategy, 
  CacheTTL 
} from '../cache';
import { 
  CircuitBreaker, 
  RetryStrategy, 
  BackoffStrategy 
} from '../resilience';
import { WebSocketServer } from '../websocket-server';

// Environment configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const ANOMALY_DETECTION_THRESHOLD = Number(process.env.ANOMALY_DETECTION_THRESHOLD || '2.5');
const PERFORMANCE_SCORE_THRESHOLD = Number(process.env.PERFORMANCE_SCORE_THRESHOLD || '0.7');
const AUTO_OPTIMIZATION_ENABLED = process.env.AUTO_OPTIMIZATION_ENABLED !== 'false';
const ML_MODEL_UPDATE_INTERVAL = Number(process.env.ML_MODEL_UPDATE_INTERVAL || '3600000'); // 1 hour
const METRICS_RETENTION_DAYS = Number(process.env.METRICS_RETENTION_DAYS || '90');
const MAX_OPTIMIZATION_ATTEMPTS = Number(process.env.MAX_OPTIMIZATION_ATTEMPTS || '5');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redis cache for performance metrics and predictions
const metricsCache = new RedisCache('predictive-analytics');

// WebSocket server for real-time updates
const wsServer = WebSocketServer.getInstance();

/**
 * Cost metric types for anomaly detection
 */
export enum CostMetricType {
  TOTAL_COST = 'total_cost',
  TOKENS_USED = 'tokens_used',
  REQUESTS_COUNT = 'requests_count',
  COST_PER_TOKEN = 'cost_per_token',
  COST_PER_REQUEST = 'cost_per_request',
  COST_PER_FEATURE = 'cost_per_feature'
}

/**
 * Performance metric types for provider scoring
 */
export enum PerformanceMetricType {
  RESPONSE_TIME = 'response_time',
  SUCCESS_RATE = 'success_rate',
  ERROR_RATE = 'error_rate',
  TOKEN_EFFICIENCY = 'token_efficiency',
  QUALITY_SCORE = 'quality_score',
  THROUGHPUT = 'throughput'
}

/**
 * Optimization strategy types
 */
export enum OptimizationStrategyType {
  COST_MINIMIZATION = 'cost_minimization',
  PERFORMANCE_MAXIMIZATION = 'performance_maximization',
  BALANCED = 'balanced',
  RELIABILITY_FOCUSED = 'reliability_focused',
  QUALITY_FOCUSED = 'quality_focused',
  CUSTOM = 'custom'
}

/**
 * Queue priority levels
 */
export enum QueuePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  BACKGROUND = 'background'
}

/**
 * ML model types for different prediction tasks
 */
export enum MLModelType {
  COST_ANOMALY_DETECTION = 'cost_anomaly_detection',
  PROVIDER_PERFORMANCE_PREDICTION = 'provider_performance_prediction',
  DEMAND_FORECASTING = 'demand_forecasting',
  RESOURCE_ALLOCATION = 'resource_allocation',
  QUEUE_OPTIMIZATION = 'queue_optimization',
  CUSTOM = 'custom'
}

/**
 * Time window for metrics aggregation
 */
export enum TimeWindow {
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  MINUTE_30 = '30m',
  HOUR_1 = '1h',
  HOUR_6 = '6h',
  HOUR_12 = '12h',
  DAY_1 = '1d',
  DAY_7 = '7d',
  DAY_30 = '30d',
  CUSTOM = 'custom'
}

/**
 * Alert type for notifications
 */
export enum AlertType {
  COST_ANOMALY = 'cost_anomaly',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  RESOURCE_EXHAUSTION = 'resource_exhaustion',
  OPTIMIZATION_OPPORTUNITY = 'optimization_opportunity',
  SECURITY_CONCERN = 'security_concern',
  SYSTEM_ERROR = 'system_error'
}

/**
 * Interface for cost anomaly detection configuration
 */
export interface CostAnomalyDetectionConfig {
  enabled: boolean;
  metricTypes: CostMetricType[];
  threshold: number;
  timeWindows: TimeWindow[];
  alertEnabled: boolean;
  alertChannels: string[];
  minSampleSize: number;
  excludeFeatures?: string[];
  excludeProviders?: AIProvider[];
}

/**
 * Interface for provider performance scoring configuration
 */
export interface ProviderPerformanceConfig {
  enabled: boolean;
  metricTypes: PerformanceMetricType[];
  updateInterval: number; // milliseconds
  minSampleSize: number;
  weightings: Record<PerformanceMetricType, number>;
  thresholds: Record<PerformanceMetricType, number>;
  alertOnDegradation: boolean;
}

/**
 * Interface for queue management configuration
 */
export interface QueueManagementConfig {
  enabled: boolean;
  adaptiveScaling: boolean;
  maxQueueSize: number;
  priorityLevels: Record<QueuePriority, number>;
  processingTimeoutMs: number;
  retryStrategy: RetryStrategy;
  backoffStrategy: BackoffStrategy;
  resourceAllocationStrategy: string;
}

/**
 * Interface for auto-optimization configuration
 */
export interface AutoOptimizationConfig {
  enabled: boolean;
  strategy: OptimizationStrategyType;
  learningRate: number;
  experimentationRate: number;
  maxOptimizationAttempts: number;
  optimizationInterval: number; // milliseconds
  parameterBounds: Record<string, [number, number]>;
  customStrategyConfig?: Record<string, any>;
}

/**
 * Interface for ML model configuration
 */
export interface MLModelConfig {
  enabled: boolean;
  modelType: MLModelType;
  trainingInterval: number; // milliseconds
  minTrainingData: number;
  hyperparameters: Record<string, any>;
  evaluationMetrics: string[];
  saveModel: boolean;
  modelPath?: string;
}

/**
 * Interface for system metrics configuration
 */
export interface SystemMetricsConfig {
  enabled: boolean;
  collectionInterval: number; // milliseconds
  retentionDays: number;
  aggregationWindows: TimeWindow[];
  detailedLogging: boolean;
  alertThresholds: Record<string, number>;
}

/**
 * Interface for cost anomaly detection result
 */
export interface CostAnomalyResult {
  id: string;
  timestamp: Date;
  metricType: CostMetricType;
  timeWindow: TimeWindow;
  actualValue: number;
  expectedValue: number;
  deviationPercent: number;
  zScore: number;
  isAnomaly: boolean;
  severity: AlertSeverity;
  affectedFeatures: string[];
  affectedProviders: AIProvider[];
  potentialCauses: string[];
  recommendedActions: string[];
}

/**
 * Interface for provider performance score
 */
export interface ProviderPerformanceScore {
  id: string;
  timestamp: Date;
  provider: AIProvider;
  modelType: AIModelType;
  overallScore: number;
  metricScores: Record<PerformanceMetricType, number>;
  sampleSize: number;
  timeWindow: TimeWindow;
  trend: 'improving' | 'stable' | 'degrading';
  rank: number;
  recommendations: string[];
}

/**
 * Interface for queue metrics
 */
export interface QueueMetrics {
  id: string;
  timestamp: Date;
  queueName: string;
  currentSize: number;
  averageWaitTime: number;
  throughput: number;
  errorRate: number;
  priorityDistribution: Record<QueuePriority, number>;
  resourceUtilization: number;
  optimizationScore: number;
  recommendations: string[];
}

/**
 * Interface for optimization result
 */
export interface OptimizationResult {
  id: string;
  timestamp: Date;
  strategy: OptimizationStrategyType;
  targetMetrics: string[];
  beforeValues: Record<string, number>;
  afterValues: Record<string, number>;
  improvementPercent: Record<string, number>;
  appliedChanges: Record<string, any>;
  confidence: number;
  isSuccessful: boolean;
  rollbackNeeded: boolean;
}

/**
 * Interface for ML model evaluation result
 */
export interface MLModelEvaluationResult {
  id: string;
  timestamp: Date;
  modelType: MLModelType;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  trainingTime: number;
  dataPoints: number;
  version: string;
  improvements: string[];
}

/**
 * Interface for system health metrics
 */
export interface SystemHealthMetrics {
  id: string;
  timestamp: Date;
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization: number;
  networkLatency: number;
  activeConnections: number;
  errorRate: number;
  requestRate: number;
  averageResponseTime: number;
  status: 'healthy' | 'degraded' | 'critical';
  alerts: string[];
}

/**
 * Interface for prediction result
 */
export interface PredictionResult<T> {
  id: string;
  timestamp: Date;
  predictionType: string;
  predictedValues: T;
  confidence: number;
  factors: Record<string, number>;
  validUntil: Date;
  modelVersion: string;
}

/**
 * Interface for dashboard metrics
 */
export interface DashboardMetrics {
  costMetrics: {
    totalCost: number;
    costTrend: number;
    costByProvider: Record<AIProvider, number>;
    costByFeature: Record<string, number>;
    anomalies: CostAnomalyResult[];
    projectedCosts: PredictionResult<Record<TimeWindow, number>>;
    savingsOpportunities: Record<string, number>;
  };
  performanceMetrics: {
    providerScores: Record<AIProvider, ProviderPerformanceScore>;
    responseTimeTrend: number;
    successRateTrend: number;
    topPerformingModels: Record<AIModelType, AIProvider>;
    optimizationOpportunities: string[];
  };
  systemMetrics: {
    queueHealth: Record<string, QueueMetrics>;
    systemHealth: SystemHealthMetrics;
    resourceUtilization: number;
    scalingRecommendations: string[];
  };
  optimizationMetrics: {
    recentOptimizations: OptimizationResult[];
    cumulativeSavings: number;
    performanceImprovements: Record<string, number>;
    activeExperiments: number;
    learningProgress: number;
  };
}

/**
 * Predictive Analytics System - Singleton class for AI system optimization
 */
export class PredictiveAnalyticsSystem {
  private static instance: PredictiveAnalyticsSystem;
  private initialized: boolean = false;
  private costModels: Map<CostMetricType, tf.LayersModel> = new Map();
  private performanceModels: Map<PerformanceMetricType, tf.LayersModel> = new Map();
  private demandModels: Map<string, tf.LayersModel> = new Map();
  private queueModels: Map<string, tf.LayersModel> = new Map();
  private optimizationStrategies: Map<OptimizationStrategyType, Function> = new Map();
  private modelUpdateIntervals: Map<MLModelType, NodeJS.Timeout> = new Map();
  private metricCollectionIntervals: Map<string, NodeJS.Timeout> = new Map();
  private optimizationIntervals: Map<string, NodeJS.Timeout> = new Map();
  private activeOptimizations: Map<string, OptimizationResult> = new Map();
  private experimentGroups: Map<string, string[]> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  
  // Configurations
  private costAnomalyConfig: CostAnomalyDetectionConfig;
  private providerPerformanceConfig: ProviderPerformanceConfig;
  private queueManagementConfig: QueueManagementConfig;
  private autoOptimizationConfig: AutoOptimizationConfig;
  private mlModelConfigs: Map<MLModelType, MLModelConfig> = new Map();
  private systemMetricsConfig: SystemMetricsConfig;
  
  // Integration with other AI systems
  private integratedAI: IntegratedAISystem;
  private multiModalAI: MultiModalAISystem;
  private smartCollabAI: SmartCollaborationAI;
  private aiGateway: AIGateway;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Default configurations
    this.costAnomalyConfig = {
      enabled: true,
      metricTypes: [
        CostMetricType.TOTAL_COST,
        CostMetricType.TOKENS_USED,
        CostMetricType.COST_PER_TOKEN
      ],
      threshold: ANOMALY_DETECTION_THRESHOLD,
      timeWindows: [TimeWindow.HOUR_1, TimeWindow.DAY_1, TimeWindow.DAY_7],
      alertEnabled: true,
      alertChannels: ['dashboard', 'email', 'slack'],
      minSampleSize: 30
    };
    
    this.providerPerformanceConfig = {
      enabled: true,
      metricTypes: [
        PerformanceMetricType.RESPONSE_TIME,
        PerformanceMetricType.SUCCESS_RATE,
        PerformanceMetricType.TOKEN_EFFICIENCY,
        PerformanceMetricType.QUALITY_SCORE
      ],
      updateInterval: 300000, // 5 minutes
      minSampleSize: 20,
      weightings: {
        [PerformanceMetricType.RESPONSE_TIME]: 0.25,
        [PerformanceMetricType.SUCCESS_RATE]: 0.3,
        [PerformanceMetricType.ERROR_RATE]: 0.15,
        [PerformanceMetricType.TOKEN_EFFICIENCY]: 0.15,
        [PerformanceMetricType.QUALITY_SCORE]: 0.1,
        [PerformanceMetricType.THROUGHPUT]: 0.05
      },
      thresholds: {
        [PerformanceMetricType.RESPONSE_TIME]: 2000, // ms
        [PerformanceMetricType.SUCCESS_RATE]: 0.95,
        [PerformanceMetricType.ERROR_RATE]: 0.05,
        [PerformanceMetricType.TOKEN_EFFICIENCY]: 0.7,
        [PerformanceMetricType.QUALITY_SCORE]: 0.8,
        [PerformanceMetricType.THROUGHPUT]: 10 // requests per second
      },
      alertOnDegradation: true
    };
    
    this.queueManagementConfig = {
      enabled: true,
      adaptiveScaling: true,
      maxQueueSize: 1000,
      priorityLevels: {
        [QueuePriority.CRITICAL]: 1,
        [QueuePriority.HIGH]: 2,
        [QueuePriority.MEDIUM]: 3,
        [QueuePriority.LOW]: 4,
        [QueuePriority.BACKGROUND]: 5
      },
      processingTimeoutMs: 30000,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      backoffStrategy: BackoffStrategy.JITTER,
      resourceAllocationStrategy: 'dynamic'
    };
    
    this.autoOptimizationConfig = {
      enabled: AUTO_OPTIMIZATION_ENABLED,
      strategy: OptimizationStrategyType.BALANCED,
      learningRate: 0.05,
      experimentationRate: 0.1,
      maxOptimizationAttempts: MAX_OPTIMIZATION_ATTEMPTS,
      optimizationInterval: 3600000, // 1 hour
      parameterBounds: {
        'cacheTimeToLive': [60, 86400], // 1 minute to 24 hours
        'batchSize': [1, 50],
        'retryCount': [0, 5],
        'concurrencyLimit': [1, 20],
        'timeoutMs': [1000, 60000]
      }
    };
    
    this.systemMetricsConfig = {
      enabled: true,
      collectionInterval: 60000, // 1 minute
      retentionDays: METRICS_RETENTION_DAYS,
      aggregationWindows: [
        TimeWindow.MINUTE_5,
        TimeWindow.HOUR_1,
        TimeWindow.DAY_1
      ],
      detailedLogging: true,
      alertThresholds: {
        'cpuUtilization': 80,
        'memoryUtilization': 80,
        'diskUtilization': 85,
        'errorRate': 0.05,
        'responseTime': 2000
      }
    };
    
    // Initialize ML model configs
    this.mlModelConfigs.set(MLModelType.COST_ANOMALY_DETECTION, {
      enabled: true,
      modelType: MLModelType.COST_ANOMALY_DETECTION,
      trainingInterval: ML_MODEL_UPDATE_INTERVAL,
      minTrainingData: 100,
      hyperparameters: {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: [64, 32],
        dropout: 0.2
      },
      evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1Score'],
      saveModel: true,
      modelPath: './models/cost-anomaly-detection'
    });
    
    this.mlModelConfigs.set(MLModelType.PROVIDER_PERFORMANCE_PREDICTION, {
      enabled: true,
      modelType: MLModelType.PROVIDER_PERFORMANCE_PREDICTION,
      trainingInterval: ML_MODEL_UPDATE_INTERVAL,
      minTrainingData: 100,
      hyperparameters: {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: [64, 32],
        dropout: 0.2
      },
      evaluationMetrics: ['mse', 'mae', 'accuracy'],
      saveModel: true,
      modelPath: './models/provider-performance-prediction'
    });
    
    this.mlModelConfigs.set(MLModelType.DEMAND_FORECASTING, {
      enabled: true,
      modelType: MLModelType.DEMAND_FORECASTING,
      trainingInterval: ML_MODEL_UPDATE_INTERVAL,
      minTrainingData: 168, // 1 week of hourly data
      hyperparameters: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: [128, 64],
        dropout: 0.2,
        timeSteps: 24
      },
      evaluationMetrics: ['mse', 'mae'],
      saveModel: true,
      modelPath: './models/demand-forecasting'
    });
    
    this.mlModelConfigs.set(MLModelType.RESOURCE_ALLOCATION, {
      enabled: true,
      modelType: MLModelType.RESOURCE_ALLOCATION,
      trainingInterval: ML_MODEL_UPDATE_INTERVAL,
      minTrainingData: 100,
      hyperparameters: {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: [64, 32],
        dropout: 0.2
      },
      evaluationMetrics: ['mse', 'mae'],
      saveModel: true,
      modelPath: './models/resource-allocation'
    });
    
    this.mlModelConfigs.set(MLModelType.QUEUE_OPTIMIZATION, {
      enabled: true,
      modelType: MLModelType.QUEUE_OPTIMIZATION,
      trainingInterval: ML_MODEL_UPDATE_INTERVAL,
      minTrainingData: 100,
      hyperparameters: {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        hiddenLayers: [64, 32],
        dropout: 0.2
      },
      evaluationMetrics: ['mse', 'mae'],
      saveModel: true,
      modelPath: './models/queue-optimization'
    });
    
    // Initialize optimization strategies
    this.initializeOptimizationStrategies();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PredictiveAnalyticsSystem {
    if (!PredictiveAnalyticsSystem.instance) {
      PredictiveAnalyticsSystem.instance = new PredictiveAnalyticsSystem();
    }
    return PredictiveAnalyticsSystem.instance;
  }

  /**
   * Initialize the system
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing Predictive Analytics System...');
      
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');
      
      // Get instances of other AI systems
      this.integratedAI = IntegratedAISystem.getInstance();
      this.multiModalAI = MultiModalAISystem.getInstance();
      this.smartCollabAI = SmartCollaborationAI.getInstance();
      this.aiGateway = AIGateway.getInstance();
      
      // Load or create ML models
      await this.initializeMLModels();
      
      // Initialize circuit breakers
      this.initializeCircuitBreakers();
      
      // Start metric collection
      this.startMetricCollection();
      
      // Start model update intervals
      this.startModelUpdateIntervals();
      
      // Start optimization intervals if enabled
      if (this.autoOptimizationConfig.enabled) {
        this.startOptimizationIntervals();
      }
      
      // Register WebSocket handlers
      this.registerWebSocketHandlers();
      
      // Load historical data for initial training
      await this.loadHistoricalData();
      
      this.initialized = true;
      console.log('Predictive Analytics System initialized successfully');
      
      // Log initialization event
      logEvent('predictive_analytics_initialized', {
        timestamp: new Date(),
        costAnomalyDetection: this.costAnomalyConfig.enabled,
        providerPerformanceScoring: this.providerPerformanceConfig.enabled,
        queueManagement: this.queueManagementConfig.enabled,
        autoOptimization: this.autoOptimizationConfig.enabled
      });
    } catch (error) {
      console.error('Failed to initialize Predictive Analytics System:', error);
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Initialize ML models
   */
  private async initializeMLModels(): Promise<void> {
    try {
      // Initialize cost anomaly detection models
      for (const metricType of this.costAnomalyConfig.metricTypes) {
        const model = await this.createOrLoadModel(
          MLModelType.COST_ANOMALY_DETECTION,
          `cost-anomaly-${metricType}`
        );
        this.costModels.set(metricType, model);
      }
      
      // Initialize provider performance models
      for (const metricType of this.providerPerformanceConfig.metricTypes) {
        const model = await this.createOrLoadModel(
          MLModelType.PROVIDER_PERFORMANCE_PREDICTION,
          `provider-performance-${metricType}`
        );
        this.performanceModels.set(metricType, model);
      }
      
      // Initialize demand forecasting model
      const demandModel = await this.createOrLoadModel(
        MLModelType.DEMAND_FORECASTING,
        'demand-forecasting'
      );
      this.demandModels.set('default', demandModel);
      
      // Initialize queue optimization models
      const queueModel = await this.createOrLoadModel(
        MLModelType.QUEUE_OPTIMIZATION,
        'queue-optimization'
      );
      this.queueModels.set('default', queueModel);
      
      console.log('ML models initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ML models:', error);
      throw new Error(`ML model initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create or load a TensorFlow.js model
   */
  private async createOrLoadModel(
    modelType: MLModelType,
    modelName: string
  ): Promise<tf.LayersModel> {
    try {
      const config = this.mlModelConfigs.get(modelType);
      if (!config) {
        throw new Error(`No configuration found for model type: ${modelType}`);
      }
      
      const modelPath = `indexeddb://${modelName}`;
      
      try {
        // Try to load existing model
        const model = await tf.loadLayersModel(modelPath);
        console.log(`Loaded existing model: ${modelName}`);
        return model;
      } catch (loadError) {
        // If loading fails, create a new model
        console.log(`Creating new model: ${modelName}`);
        
        let model: tf.LayersModel;
        
        switch (modelType) {
          case MLModelType.COST_ANOMALY_DETECTION:
            model = this.createAnomalyDetectionModel(config);
            break;
          case MLModelType.PROVIDER_PERFORMANCE_PREDICTION:
            model = this.createPerformancePredictionModel(config);
            break;
          case MLModelType.DEMAND_FORECASTING:
            model = this.createDemandForecastingModel(config);
            break;
          case MLModelType.RESOURCE_ALLOCATION:
            model = this.createResourceAllocationModel(config);
            break;
          case MLModelType.QUEUE_OPTIMIZATION:
            model = this.createQueueOptimizationModel(config);
            break;
          default:
            model = this.createDefaultModel(config);
        }
        
        // Save the model
        await model.save(modelPath);
        return model;
      }
    } catch (error) {
      console.error(`Error creating/loading model ${modelName}:`, error);
      
      // Create a fallback simple model
      const fallbackModel = tf.sequential();
      fallbackModel.add(tf.layers.dense({
        inputShape: [10],
        units: 16,
        activation: 'relu'
      }));
      fallbackModel.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
      }));
      fallbackModel.add(tf.layers.dense({
        units: 1,
        activation: 'linear'
      }));
      
      fallbackModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });
      
      return fallbackModel;
    }
  }

  /**
   * Create anomaly detection model
   */
  private createAnomalyDetectionModel(config: MLModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [10], // Time series features
      units: config.hyperparameters.hiddenLayers[0],
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({
      rate: config.hyperparameters.dropout
    }));
    
    // Hidden layers
    for (let i = 1; i < config.hyperparameters.hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: config.hyperparameters.hiddenLayers[i],
        activation: 'relu'
      }));
      
      model.add(tf.layers.dropout({
        rate: config.hyperparameters.dropout
      }));
    }
    
    // Output layer
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }

  /**
   * Create performance prediction model
   */
  private createPerformancePredictionModel(config: MLModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [15], // Provider features
      units: config.hyperparameters.hiddenLayers[0],
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({
      rate: config.hyperparameters.dropout
    }));
    
    // Hidden layers
    for (let i = 1; i < config.hyperparameters.hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: config.hyperparameters.hiddenLayers[i],
        activation: 'relu'
      }));
      
      model.add(tf.layers.dropout({
        rate: config.hyperparameters.dropout
      }));
    }
    
    // Output layer
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Create demand forecasting model (LSTM)
   */
  private createDemandForecastingModel(config: MLModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer (LSTM)
    model.add(tf.layers.lstm({
      inputShape: [config.hyperparameters.timeSteps, 5], // Time steps and features
      units: config.hyperparameters.hiddenLayers[0],
      returnSequences: true
    }));
    
    model.add(tf.layers.dropout({
      rate: config.hyperparameters.dropout
    }));
    
    // Additional LSTM layer
    model.add(tf.layers.lstm({
      units: config.hyperparameters.hiddenLayers[1],
      returnSequences: false
    }));
    
    model.add(tf.layers.dropout({
      rate: config.hyperparameters.dropout
    }));
    
    // Dense layers
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: 24, // Predict 24 hours ahead
      activation: 'linear'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }

  /**
   * Create resource allocation model
   */
  private createResourceAllocationModel(config: MLModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [20], // Resource features
      units: config.hyperparameters.hiddenLayers[0],
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({
      rate: config.hyperparameters.dropout
    }));
    
    // Hidden layers
    for (let i = 1; i < config.hyperparameters.hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: config.hyperparameters.hiddenLayers[i],
        activation: 'relu'
      }));
      
      model.add(tf.layers.dropout({
        rate: config.hyperparameters.dropout
      }));
    }
    
    // Output layer
    model.add(tf.layers.dense({
      units: 5, // Resource allocation parameters
      activation: 'softmax'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Create queue optimization model
   */
  private createQueueOptimizationModel(config: MLModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [15], // Queue metrics features
      units: config.hyperparameters.hiddenLayers[0],
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({
      rate: config.hyperparameters.dropout
    }));
    
    // Hidden layers
    for (let i = 1; i < config.hyperparameters.hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: config.hyperparameters.hiddenLayers[i],
        activation: 'relu'
      }));
      
      model.add(tf.layers.dropout({
        rate: config.hyperparameters.dropout
      }));
    }
    
    // Output layer
    model.add(tf.layers.dense({
      units: 3, // Queue parameters (size, priority, timeout)
      activation: 'linear'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }

  /**
   * Create default model for custom use cases
   */
  private createDefaultModel(config: MLModelConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [10],
      units: config.hyperparameters.hiddenLayers[0],
      activation: 'relu'
    }));
    
    // Hidden layers
    for (let i = 1; i < config.hyperparameters.hiddenLayers.length; i++) {
      model.add(tf.layers.dense({
        units: config.hyperparameters.hiddenLayers[i],
        activation: 'relu'
      }));
    }
    
    // Output layer
    model.add(tf.layers.dense({
      units: 1,
      activation: 'linear'
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.hyperparameters.learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return model;
  }

  /**
   * Initialize optimization strategies
   */
  private initializeOptimizationStrategies(): void {
    // Cost minimization strategy
    this.optimizationStrategies.set(
      OptimizationStrategyType.COST_MINIMIZATION,
      async (metrics: any, currentParams: any) => {
        const newParams = { ...currentParams };
        
        // Increase cache TTL to reduce API calls
        if (newParams.cacheTimeToLive < this.autoOptimizationConfig.parameterBounds.cacheTimeToLive[1]) {
          newParams.cacheTimeToLive *= 1.2;
        }
        
        // Increase batch size to reduce API calls
        if (newParams.batchSize < this.autoOptimizationConfig.parameterBounds.batchSize[1]) {
          newParams.batchSize = Math.min(
            newParams.batchSize + 1,
            this.autoOptimizationConfig.parameterBounds.batchSize[1]
          );
        }
        
        // Reduce retry count to minimize costs
        if (newParams.retryCount > this.autoOptimizationConfig.parameterBounds.retryCount[0]) {
          newParams.retryCount = Math.max(
            newParams.retryCount - 1,
            this.autoOptimizationConfig.parameterBounds.retryCount[0]
          );
        }
        
        // Switch to more cost-effective providers
        const providerScores = await this.getProviderPerformanceScores();
        const costEffectiveProviders = Object.entries(providerScores)
          .sort(([, a], [, b]) => {
            const costEfficiencyA = a.metricScores[PerformanceMetricType.TOKEN_EFFICIENCY];
            const costEfficiencyB = b.metricScores[PerformanceMetricType.TOKEN_EFFICIENCY];
            return costEfficiencyB - costEfficiencyA;
          })
          .map(([provider]) => provider);
        
        newParams.preferredProviders = costEffectiveProviders.slice(0, 3);
        
        return newParams;
      }
    );
    
    // Performance maximization strategy
    this.optimizationStrategies.set(
      OptimizationStrategyType.PERFORMANCE_MAXIMIZATION,
      async (metrics: any, currentParams: any) => {
        const newParams = { ...currentParams };
        
        // Decrease cache TTL for fresher results
        if (newParams.cacheTimeToLive > this.autoOptimizationConfig.parameterBounds.cacheTimeToLive[0]) {
          newParams.cacheTimeToLive *= 0.8;
        }
        
        // Decrease batch size for faster processing
        if (newParams.batchSize > this.autoOptimizationConfig.parameterBounds.batchSize[0]) {
          newParams.batchSize = Math.max(
            newParams.batchSize - 1,
            this.autoOptimizationConfig.parameterBounds.batchSize[0]
          );
        }
        
        // Increase concurrency for faster throughput
        if (newParams.concurrencyLimit < this.autoOptimizationConfig.parameterBounds.concurrencyLimit[1]) {
          newParams.concurrencyLimit = Math.min(
            newParams.concurrencyLimit + 1,
            this.autoOptimizationConfig.parameterBounds.concurrencyLimit[1]
          );
        }
        
        // Switch to faster providers
        const providerScores = await this.getProviderPerformanceScores();
        const fastProviders = Object.entries(providerScores)
          .sort(([, a], [, b]) => {
            const speedA = a.metricScores[PerformanceMetricType.RESPONSE_TIME];
            const speedB = b.metricScores[PerformanceMetricType.RESPONSE_TIME];
            return speedA - speedB; // Lower is better for response time
          })
          .map(([provider]) => provider);
        
        newParams.preferredProviders = fastProviders.slice(0, 3);
        
        return newParams;
      }
    );
    
    // Balanced strategy
    this.optimizationStrategies.set(
      OptimizationStrategyType.BALANCED,
      async (metrics: any, currentParams: any) => {
        const newParams = { ...currentParams };
        
        // Get provider scores
        const providerScores = await this.getProviderPerformanceScores();
        
        // Calculate balanced score for each provider
        const balancedScores = Object.entries(providerScores).map(([provider, score]) => {
          const responseTimeScore = 1 - (score.metricScores[PerformanceMetricType.RESPONSE_TIME] / 5000); // Normalize to 0-1
          const successRateScore = score.metricScores[PerformanceMetricType.SUCCESS_RATE];
          const costEfficiencyScore = score.metricScores[PerformanceMetricType.TOKEN_EFFICIENCY];
          const qualityScore = score.metricScores[PerformanceMetricType.QUALITY_SCORE];
          
          // Balanced weight
          const balancedScore = (
            responseTimeScore * 0.25 +
            successRateScore * 0.25 +
            costEfficiencyScore * 0.25 +
            qualityScore * 0.25
          );
          
          return { provider, balancedScore };
        });
        
        // Sort by balanced score
        balancedScores.sort((a, b) => b.balancedScore - a.balancedScore);
        
        // Set preferred providers
        newParams.preferredProviders = balancedScores
          .slice(0, 3)
          .map(item => item.provider);
        
        // Adjust other parameters to balanced values
        const bounds = this.autoOptimizationConfig.parameterBounds;
        
        // Set cache TTL to middle of range
        newParams.cacheTimeToLive = (bounds.cacheTimeToLive[0] + bounds.cacheTimeToLive[1]) / 2;
        
        // Set batch size to middle of range
        newParams.batchSize = Math.round((bounds.batchSize[0] + bounds.batchSize[1]) / 2);
        
        // Set retry count to middle of range
        newParams.retryCount = Math.round((bounds.retryCount[0] + bounds.retryCount[1]) / 2);
        
        // Set concurrency limit to middle of range
        newParams.concurrencyLimit = Math.round((bounds.concurrencyLimit[0] + bounds.concurrencyLimit[1]) / 2);
        
        return newParams;
      }
    );
    
    // Reliability focused strategy
    this.optimizationStrategies.set(
      OptimizationStrategyType.RELIABILITY_FOCUSED,
      async (metrics: any, currentParams: any) => {
        const newParams = { ...currentParams };
        
        // Increase retry count for reliability
        if (newParams.retryCount < this.autoOptimizationConfig.parameterBounds.retryCount[1]) {
          newParams.retryCount = this.autoOptimizationConfig.parameterBounds.retryCount[1];
        }
        
        // Increase timeout for reliability
        if (newParams.timeoutMs < this.autoOptimizationConfig.parameterBounds.timeoutMs[1]) {
          newParams.timeoutMs = Math.min(
            newParams.timeoutMs * 1.5,
            this.autoOptimizationConfig.parameterBounds.timeoutMs[1]
          );
        }
        
        // Switch to more reliable providers
        const providerScores = await this.getProviderPerformanceScores();
        const reliableProviders = Object.entries(providerScores)
          .sort(([, a], [, b]) => {
            const reliabilityA = a.metricScores[PerformanceMetricType.SUCCESS_RATE];
            const reliabilityB = b.metricScores[PerformanceMetricType.SUCCESS_RATE];
            return reliabilityB - reliabilityA;
          })
          .map(([provider]) => provider);
        
        newParams.preferredProviders = reliableProviders.slice(0, 3);
        
        // Enable circuit breakers
        newParams.circuitBreakerEnabled = true;
        
        return newParams;
      }
    );
    
    // Quality focused strategy
    this.optimizationStrategies.set(
      OptimizationStrategyType.QUALITY_FOCUSED,
      async (metrics: any, currentParams: any) => {
        const newParams = { ...currentParams };
        
        // Switch to highest quality providers
        const providerScores = await this.getProviderPerformanceScores();
        const qualityProviders = Object.entries(providerScores)
          .sort(([, a], [, b]) => {
            const qualityA = a.metricScores[PerformanceMetricType.QUALITY_SCORE];
            const qualityB = b.metricScores[PerformanceMetricType.QUALITY_SCORE];
            return qualityB - qualityA;
          })
          .map(([provider]) => provider);
        
        newParams.preferredProviders = qualityProviders.slice(0, 3);
        
        // Increase quality parameters
        newParams.temperature = 0.7; // More deterministic
        newParams.topP = 0.9; // Higher quality sampling
        newParams.frequencyPenalty = 1.0; // Reduce repetition
        
        return newParams;
      }
    );
  }

  /**
   * Initialize circuit breakers
   */
  private initializeCircuitBreakers(): void {
    // Create circuit breakers for each provider
    for (const provider of Object.values(AIProvider)) {
      this.circuitBreakers.set(provider, new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 30000, // 30 seconds
        monitorInterval: 5000, // 5 seconds
        healthCheckFn: async () => {
          try {
            const result = await this.aiGateway.performHealthCheck(provider);
            return result.status === 'healthy';
          } catch (error) {
            return false;
          }
        }
      }));
    }
    
    // Create circuit breakers for key operations
    const operations = [
      'cost-analysis',
      'performance-scoring',
      'demand-forecasting',
      'queue-optimization',
      'model-training'
    ];
    
    for (const operation of operations) {
      this.circuitBreakers.set(operation, new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000, // 1 minute
        monitorInterval: 10000 // 10 seconds
      }));
    }
  }

  /**
   * Start metric collection intervals
   */
  private startMetricCollection(): void {
    if (!this.systemMetricsConfig.enabled) {
      return;
    }
    
    // Collect system metrics
    this.metricCollectionIntervals.set('system', setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        await this.storeMetrics('system_metrics', metrics);
        
        // Check for alerts
        this.checkSystemMetricAlerts(metrics);
        
        // Broadcast to WebSocket clients
        wsServer.broadcast('predictive-analytics', {
          type: 'system-metrics-update',
          data: metrics
        });
      } catch (error) {
        console.error('Error collecting system metrics:', error);
      }
    }, this.systemMetricsConfig.collectionInterval));
    
    // Collect cost metrics
    this.metricCollectionIntervals.set('cost', setInterval(async () => {
      try {
        const metrics = await this.collectCostMetrics();
        await this.storeMetrics('cost_metrics', metrics);
        
        // Detect anomalies
        if (this.costAnomalyConfig.enabled) {
          await this.detectCostAnomalies(metrics);
        }
        
        // Broadcast to WebSocket clients
        wsServer.broadcast('predictive-analytics', {
          type: 'cost-metrics-update',
          data: metrics
        });
      } catch (error) {
        console.error('Error collecting cost metrics:', error);
      }
    }, 300000)); // Every 5 minutes
    
    // Collect performance metrics
    this.metricCollectionIntervals.set('performance', setInterval(async () => {
      try {
        const metrics = await this.collectPerformanceMetrics();
        await this.storeMetrics('performance_metrics', metrics);
        
        // Update provider scores
        if (this.providerPerformanceConfig.enabled) {
          await this.updateProviderPerformanceScores(metrics);
        }
        
        // Broadcast to WebSocket clients
        wsServer.broadcast('predictive-analytics', {
          type: 'performance-metrics-update',
          data: metrics
        });
      } catch (error) {
        console.error('Error collecting performance metrics:', error);
      }
    }, this.providerPerformanceConfig.updateInterval));
    
    // Collect queue metrics
    this.metricCollectionIntervals.set('queue', setInterval(async () => {
      try {
        const metrics = await this.collectQueueMetrics();
        await this.storeMetrics('queue_metrics', metrics);
        
        // Optimize queues if enabled
        if (this.queueManagementConfig.enabled && this.queueManagementConfig.adaptiveScaling) {
          await this.optimizeQueues(metrics);
        }
        
        // Broadcast to WebSocket clients
        wsServer.broadcast('predictive-analytics', {
          type: 'queue-metrics-update',
          data: metrics
        });
      } catch (error) {
        console.error('Error collecting queue metrics:', error);
      }
    }, 60000)); // Every minute
  }

  /**
   * Start model update intervals
   */
  private startModelUpdateIntervals(): void {
    // Update cost anomaly detection models
    this.modelUpdateIntervals.set(MLModelType.COST_ANOMALY_DETECTION, setInterval(async () => {
      try {
        const config = this.mlModelConfigs.get(MLModelType.COST_ANOMALY_DETECTION);
        if (!config || !config.enabled) return;
        
        console.log('Updating cost anomaly detection models...');
        
        // Get historical cost data
        const data = await this.getHistoricalCostData();
        
        if (data.length < config.minTrainingData) {
          console.log(`Not enough data for training cost models (${data.length}/${config.minTrainingData})`);
          return;
        }
        
        // Train models for each metric type
        for (const metricType of this.costAnomalyConfig.metricTypes) {
          const model = this.costModels.get(metricType);
          if (!model) continue;
          
          // Prepare training data
          const { xs, ys } = this.prepareCostTrainingData(data, metricType);
          
          // Train the model
          await model.fit(xs, ys, {
            epochs: config.hyperparameters.epochs,
            batchSize: config.hyperparameters.batchSize,
            validationSplit: 0.2,
            callbacks: {
              onEpochEnd: (epoch, logs) => {
                console.log(`Cost model ${metricType} - Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
              }
            }
          });
          
          // Save the updated model
          await model.save(`indexeddb://cost-anomaly-${metricType}`);
          
          console.log(`Cost anomaly detection model for ${metricType} updated`);
        }
      } catch (error) {
        console.error('Error updating cost anomaly detection models:', error);
      }
    }, this.mlModelConfigs.get(MLModelType.COST_ANOMALY_DETECTION)?.trainingInterval || ML_MODEL_UPDATE_INTERVAL));
    
    // Update provider performance models
    this.modelUpdateIntervals.set(MLModelType.PROVIDER_PERFORMANCE_PREDICTION, setInterval(async () => {
      try {
        const config = this.mlModelConfigs.get(MLModelType.PROVIDER_PERFORMANCE_PREDICTION);
        if (!config || !config.enabled) return;
        
        console.log('Updating provider performance prediction models...');
        
        // Get historical performance data
        const data = await this.getHistoricalPerformanceData();
        
        if (data.length < config.minTrainingData) {
          console.log(`Not enough data for training performance models (${data.length}/${config.minTrainingData})`);
          return;
        }
        
        // Train models for each metric type
        for (const metricType of this.providerPerformanceConfig.metricTypes) {
          const model = this.performanceModels.get(metricType);
          if (!model) continue;
          
          // Prepare training data
          const { xs, ys } = this.preparePerformanceTrainingData(data, metricType);
          
          // Train the model
          await model.fit(xs, ys, {
            epochs: config.hyperparameters.epochs,
            batchSize: config.hyperparameters.batchSize,
            validationSplit: 0.2,
            callbacks: {
              onEpochEnd: (epoch, logs) => {
                console.log(`Performance model ${metricType} - Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
              }
            }
          });
          
          // Save the updated model
          await model.save(`indexeddb://provider-performance-${metricType}`);
          
          console.log(`Provider performance prediction model for ${metricType} updated`);
        }
      } catch (error) {
        console.error('Error updating provider performance prediction models:', error);
      }
    }, this.mlModelConfigs.get(MLModelType.PROVIDER_PERFORMANCE_PREDICTION)?.trainingInterval || ML_MODEL_UPDATE_INTERVAL));
    
    // Update demand forecasting models
    this.modelUpdateIntervals.set(MLModelType.DEMAND_FORECASTING, setInterval(async () => {
      try {
        const config = this.mlModelConfigs.get(MLModelType.DEMAND_FORECASTING);
        if (!config || !config.enabled) return;
        
        console.log('Updating demand forecasting models...');
        
        // Get historical usage data
        const data = await this.getHistoricalUsageData();
        
        if (data.length < config.minTrainingData) {
          console.log(`Not enough data for training demand forecasting model (${data.length}/${config.minTrainingData})`);
          return;
        }
        
        const model = this.demandModels.get('default');
        if (!model) return;
        
        // Prepare training data
        const { xs, ys } = this.prepareDemandTrainingData(data, config.hyperparameters.timeSteps);
        
        // Train the model
        await model.fit(xs, ys, {
          epochs: config.hyperparameters.epochs,
          batchSize: config.hyperparameters.batchSize,
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              console.log(`Demand forecasting model - Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
            }
          }
        });
        
        // Save the updated model
        await model.save('indexeddb://demand-forecasting');
        
        console.log('Demand forecasting model updated');
      } catch (error) {
        console.error('Error updating demand forecasting model:', error);
      }
    }, this.mlModelConfigs.get(MLModelType.DEMAND_FORECASTING)?.trainingInterval || ML_MODEL_UPDATE_INTERVAL));
    
    // Update queue optimization models
    this.modelUpdateIntervals.set(MLModelType.QUEUE_OPTIMIZATION, setInterval(async () => {
      try {
        const config = this.mlModelConfigs.get(MLModelType.QUEUE_OPTIMIZATION);
        if (!config || !config.enabled) return;
        
        console.log('Updating queue optimization models...');
        
        // Get historical queue data
        const data = await this.getHistoricalQueueData();
        
        if (data.length < config.minTrainingData) {
          console.log(`Not enough data for training queue optimization model (${data.length}/${config.minTrainingData})`);
          return;
        }
        
        const model = this.queueModels.get('default');
        if (!model) return;
        
        // Prepare training data
        const { xs, ys } = this.prepareQueueTrainingData(data);
        
        // Train the model
        await model.fit(xs, ys, {
          epochs: config.hyperparameters.epochs,
          batchSize: config.hyperparameters.batchSize,
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              console.log(`Queue optimization model - Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
            }
          }
        });
        
        // Save the updated model
        await model.save('indexeddb://queue-optimization');
        
        console.log('Queue optimization model updated');
      } catch (error) {
        console.error('Error updating queue optimization model:', error);
      }
    }, this.mlModelConfigs.get(MLModelType.QUEUE_OPTIMIZATION)?.trainingInterval || ML_MODEL_UPDATE_INTERVAL));
  }

  /**
   * Start optimization intervals
   */
  private startOptimizationIntervals(): void {
    if (!this.autoOptimizationConfig.enabled) {
      return;
    }
    
    // Global optimization interval
    this.optimizationIntervals.set('global', setInterval(async () => {
      try {
        console.log('Running global optimization...');
        
        // Get current metrics
        const costMetrics = await this.collectCostMetrics();
        const performanceMetrics = await this.collectPerformanceMetrics();
        const systemMetrics = await this.collectSystemMetrics();
        
        // Get current parameters
        const currentParams = await this.getCurrentSystemParameters();
        
        // Apply optimization strategy
        const strategy = this.optimizationStrategies.get(this.autoOptimizationConfig.strategy);
        if (!strategy) {
          console.error(`Optimization strategy not found: ${this.autoOptimizationConfig.strategy}`);
          return;
        }
        
        // Apply the strategy
        const newParams = await strategy({
          cost: costMetrics,
          performance: performanceMetrics,
          system: systemMetrics
        }, currentParams);
        
        // Apply the new parameters
        const optimizationId = uuidv4();
        const result = await this.applyOptimizationParameters(optimizationId, newParams, currentParams);
        
        // Store the result
        await this.storeOptimizationResult(result);
        
        // Broadcast the result
        wsServer.broadcast('predictive-analytics', {
          type: 'optimization-result',
          data: result
        });
        
        console.log(`Global optimization completed: ${result.isSuccessful ? 'SUCCESS' : 'FAILED'}`);
      } catch (error) {
        console.error('Error running global optimization:', error);
      }
    }, this.autoOptimizationConfig.optimizationInterval));
    
    // Provider-specific optimization
    this.optimizationIntervals.set('provider', setInterval(async () => {
      try {
        console.log('Running provider-specific optimization...');
        
        // Get provider performance scores
        const providerScores = await this.getProviderPerformanceScores();
        
        // Find underperforming providers
        const underperforming = Object.entries(providerScores)
          .filter(([, score]) => score.overallScore < PERFORMANCE_SCORE_THRESHOLD)
          .map(([provider]) => provider);
        
        if (underperforming.length === 0) {
          console.log('No underperforming providers found');
          return;
        }
        
        console.log(`Found ${underperforming.length} underperforming providers`);
        
        // Optimize each underperforming provider
        for (const provider of underperforming) {
          const optimizationId = uuidv4();
          
          // Get current provider parameters
          const currentParams = await this.getProviderParameters(provider);
          
          // Apply optimization
          const newParams = await this.optimizeProviderParameters(provider, currentParams);
          
          // Apply the new parameters
          const result = await this.applyProviderParameters(optimizationId, provider, newParams, currentParams);
          
          // Store the result
          await this.storeOptimizationResult(result);
          
          console.log(`Provider optimization for ${provider} completed: ${result.isSuccessful ? 'SUCCESS' : 'FAILED'}`);
        }
      } catch (error) {
        console.error('Error running provider-specific optimization:', error);
      }
    }, this.autoOptimizationConfig.optimizationInterval * 2)); // Run less frequently than global
    
    // A/B testing for optimization strategies
    this.optimizationIntervals.set('experiment', setInterval(async () => {
      try {
        // Only run experiments occasionally
        if (Math.random() > this.autoOptimizationConfig.experimentationRate) {
          return;
        }
        
        console.log('Running optimization strategy experiment...');
        
        // Select strategies to compare
        const strategies = Object.values(OptimizationStrategyType);
        const strategyA = strategies[Math.floor(Math.random() * strategies.length)];
        let strategyB;
        do {
          strategyB = strategies[Math.floor(Math.random() * strategies.length)];
        } while (strategyB === strategyA);
        
        console.log(`Comparing strategies: ${strategyA} vs ${strategyB}`);
        
        // Run experiment
        const experimentId = uuidv4();
        const result = await this.runOptimizationExperiment(experimentId, strategyA, strategyB);
        
        // Store the result
        await this.storeExperimentResult(experimentId, result);
        
        console.log(`Optimization experiment completed. Winner: ${result.winner}`);
      } catch (error) {
        console.error('Error running optimization experiment:', error);
      }
    }, this.autoOptimizationConfig.optimizationInterval * 5)); // Run much less frequently
  }

  /**
   * Register WebSocket handlers
   */
  private registerWebSocketHandlers(): void {
    wsServer.registerHandler('predictive-analytics', async (message, session) => {
      try {
        const { type, data } = message;
        
        switch (type) {
          case 'get-dashboard-metrics':
            const metrics = await this.getDashboardMetrics();
            return { type: 'dashboard-metrics', data: metrics };
          
          case 'get-cost-anomalies':
            const anomalies = await this.getCostAnomalies(
              data.timeWindow || TimeWindow.DAY_7,
              data.limit || 10
            );
            return { type: 'cost-anomalies', data: anomalies };
          
          case 'get-provider-scores':
            const scores = await this.getProviderPerformanceScores();
            return { type: 'provider-scores', data: scores };
          
          case 'get-optimization-history':
            const history = await this.getOptimizationHistory(data.limit || 10);
            return { type: 'optimization-history', data: history };
          
          case 'run-optimization':
            const optimizationId = uuidv4();
            const strategy = data.strategy || this.autoOptimizationConfig.strategy;
            const currentParams = await this.getCurrentSystemParameters();
            const strategyFn = this.optimizationStrategies.get(strategy);
            
            if (!strategyFn) {
              return { 
                type: 'optimization-error', 
                data: { message: `Strategy not found: ${strategy}` } 
              };
            }
            
            const newParams = await strategyFn({}, currentParams);
            const result = await this.applyOptimizationParameters(optimizationId, newParams, currentParams);
            
            await this.storeOptimizationResult(result);
            return { type: 'optimization-result', data: result };
          
          case 'update-config':
            await this.updateConfiguration(data.config);
            return { type: 'config-updated', data: { success: true } };
          
          default:
            return { 
              type: 'error', 
              data: { message: `Unknown message type: ${type}` } 
            };
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        return { 
          type: 'error', 
          data: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    });
  }

  /**
   * Load historical data for initial training
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      console.log('Loading historical data for initial training...');
      
      // Load cost data
      const costData = await this.getHistoricalCostData();
      console.log(`Loaded ${costData.length} historical cost data points`);
      
      // Load performance data
      const performanceData = await this.getHistoricalPerformanceData();
      console.log(`Loaded ${performanceData.length} historical performance data points`);
      
      // Load usage data
      const usageData = await this.getHistoricalUsageData();
      console.log(`Loaded ${usageData.length} historical usage data points`);
      
      // Load queue data
      const queueData = await this.getHistoricalQueueData();
      console.log(`Loaded ${queueData.length} historical queue data points`);
      
      // Initial training if we have enough data
      const costConfig = this.mlModelConfigs.get(MLModelType.COST_ANOMALY_DETECTION);
      if (costConfig && costData.length >= costConfig.minTrainingData) {
        console.log('Performing initial training for cost anomaly detection models...');
        
        for (const metricType of this.costAnomalyConfig.metricTypes) {
          const model = this.costModels.get(metricType);
          if (!model) continue;
          
          const { xs, ys } = this.prepareCostTrainingData(costData, metricType);
          
          await model.fit(xs, ys, {
            epochs: costConfig.hyperparameters.epochs,
            batchSize: costConfig.hyperparameters.batchSize,
            validationSplit: 0.2
          });
          
          await model.save(`indexeddb://cost-anomaly-${metricType}`);
          console.log(`Initial training completed for cost model: ${metricType}`);
        }
      }
      
      const performanceConfig = this.mlModelConfigs.get(MLModelType.PROVIDER_PERFORMANCE_PREDICTION);
      if (performanceConfig && performanceData.length >= performanceConfig.minTrainingData) {
        console.log('Performing initial training for provider performance models...');
        
        for (const metricType of this.providerPerformanceConfig.metricTypes) {
          const model = this.performanceModels.get(metricType);
          if (!model) continue;
          
          const { xs, ys } = this.preparePerformanceTrainingData(performanceData, metricType);
          
          await model.fit(xs, ys, {
            epochs: performanceConfig.hyperparameters.epochs,
            batchSize: performanceConfig.hyperparameters.batchSize,
            validationSplit: 0.2
          });
          
          await model.save(`indexeddb://provider-performance-${metricType}`);
          console.log(`Initial training completed for performance model: ${metricType}`);
        }
      }
      
      console.log('Historical data loading and initial training completed');
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  }

  /**
   * Get historical cost data
   */
  private async getHistoricalCostData(): Promise<any[]> {
    try {
      // Get data from Supabase
      const { data, error } = await supabase
        .from('ai_cost_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting historical cost data:', error);
      return [];
    }
  }

  /**
   * Get historical performance data
   */
  private async getHistoricalPerformanceData(): Promise<any[]> {
    try {
      // Get data from Supabase
      const { data, error } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting historical performance data:', error);
      return [];
    }
  }

  /**
   * Get historical usage data
   */
  private async getHistoricalUsageData(): Promise<any[]> {
    try {
      // Get data from Supabase
      const { data, error } = await supabase
        .from('ai_usage_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting historical usage data:', error);
      return [];
    }
  }

  /**
   * Get historical queue data
   */
  private async getHistoricalQueueData(): Promise<any[]> {
    try {
      // Get data from Supabase
      const { data, error } = await supabase
        .from('ai_queue_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting historical queue data:', error);
      return [];
    }
  }

  /**
   * Prepare cost training data
   */
  private prepareCostTrainingData(data: any[], metricType: CostMetricType): { xs: tf.Tensor; ys: tf.Tensor } {
    // Extract features and labels
    const features: number[][] = [];
    const labels: number[] = [];
    
    // Sort data by timestamp
    data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Create time series windows
    for (let i = 10; i < data.length; i++) {
      const window = data.slice(i - 10, i);
      const nextValue = data[i][metricType];
      
      // Skip if nextValue is not a number
      if (typeof nextValue !== 'number' || isNaN(nextValue)) {
        continue;
      }
      
      // Extract features from window
      const windowFeatures = window.map(item => item[metricType]);
      
      // Skip if any feature is not a number
      if (windowFeatures.some(f => typeof f !== 'number' || isNaN(f))) {
        continue;
      }
      
      features.push(windowFeatures);
      labels.push(nextValue);
    }
    
    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels);
    
    return { xs, ys };
  }

  /**
   * Prepare performance training data
   */
  private preparePerformanceTrainingData(data: any[], metricType: PerformanceMetricType): { xs: tf.Tensor; ys: tf.Tensor } {
    // Extract features and labels
    const features: number[][] = [];
    const labels: number[] = [];
    
    // Group data by provider
    const providerData: Record<string, any[]> = {};
    
    for (const item of data) {
      const provider = item.provider;
      if (!providerData[provider]) {
        providerData[provider] = [];
      }
      providerData[provider].push(item);
    }
    
    // Process each provider's data
    for (const provider in providerData) {
      const providerItems = providerData[provider];
      
      // Sort by timestamp
      providerItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Create feature vectors
      for (let i = 5; i < providerItems.length; i++) {
        const window = providerItems.slice(i - 5, i);
        const nextValue = providerItems[i][metricType];
        
        // Skip if nextValue is not a number
        if (typeof nextValue !== 'number' || isNaN(nextValue)) {
          continue;
        }
        
        // Extract features
        const featureVector = [
          ...window.map(item => item[metricType]),
          // Additional features
          window.reduce((sum, item) => sum + item.requestCount, 0) / 5, // Avg request count
          window.reduce((sum, item) => sum + item.errorCount, 0) / 5, // Avg error count
          window.reduce((sum, item) => sum + item.tokenCount, 0) / 5, // Avg token count
          window.reduce((sum, item) => sum + item.cost, 0) / 5, // Avg cost
          parseInt(provider) // Provider as numeric feature
        ];
        
        // Skip if any feature is not a number
        if (featureVector.some(f => typeof f !== 'number' || isNaN(f))) {
          continue;
        }
        
        features.push(featureVector);
        labels.push(nextValue);
      }
    }
    
    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels);
    
    return { xs, ys };
  }

  /**
   * Prepare demand training data
   */
  private prepareDemandTrainingData(data: any[], timeSteps: number): { xs: tf.Tensor; ys: tf.Tensor } {
    // Sort data by timestamp
    data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const features: number[][][] = [];
    const labels: number[][] = [];
    
    // Group data by hour
    const hourlyData: Record<string, any[]> = {};
    
    for (const item of data) {
      const date = new Date(item.timestamp);
      const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = [];
      }
      
      hourlyData[hourKey].push(item);
    }
    
    // Convert to hourly aggregates
    const hourlyAggregates: any[] = [];
    
    for (const hour in hourlyData) {
      const items = hourlyData[hour];
      
      const aggregate = {
        timestamp: new Date(items[0].timestamp),
        requestCount: items.reduce((sum, item) => sum + item.requestCount, 