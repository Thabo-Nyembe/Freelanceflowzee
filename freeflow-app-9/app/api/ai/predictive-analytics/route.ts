import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PredictiveAnalyticsSystem } from '@/lib/ai/predictive-analytics-system';
import { WebSocketServer } from '@/lib/websocket-server';
import { rateLimit } from '@/lib/rate-limit';
import { verifyAuthToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { logApiUsage, trackMetric } from '@/lib/analytics';
import { v4 as uuidv4 } from 'uuid';
import { createFeatureLogger } from '@/lib/logger'

// Inline type definitions
type TimeWindow = '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
type CostMetricType = 'compute' | 'storage' | 'network' | 'api' | 'total';
type PerformanceMetricType = 'latency' | 'throughput' | 'error_rate' | 'availability';
type OptimizationStrategyType = 'cost' | 'performance' | 'balanced';
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

const logger = createFeatureLogger('API-PredictiveAnalytics')

// Environment configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const API_SECRET_KEY = process.env.API_SECRET_KEY || '';
const MAX_REQUESTS_PER_MINUTE = Number(process.env.MAX_REQUESTS_PER_MINUTE || '60');
const DEFAULT_TIME_WINDOW: TimeWindow = '24h';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize WebSocket server
const wsServer = WebSocketServer.getInstance();

// Initialize Predictive Analytics System
let predictiveAnalytics: PredictiveAnalyticsSystem;

// Initialize system on first request
const initializeSystem = async () => {
  if (!predictiveAnalytics) {
    predictiveAnalytics = PredictiveAnalyticsSystem.getInstance();
    await predictiveAnalytics.initialize();
  }
  return predictiveAnalytics;
};

// Middleware for authentication and rate limiting
const applyMiddleware = async (req: NextRequest) => {
  // Validate token
  const authResult = await verifyAuthToken(req);
  if (!authResult) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Apply rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await rateLimit(`predictive-analytics-${ip}`, MAX_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    );
  }

  // Log API usage
  await logApiUsage({
    endpoint: req.nextUrl.pathname,
    method: req.method,
    userId: authResult.id,
    timestamp: new Date(),
    ip
  });

  return null; // No error, continue processing
};

// Error handling wrapper
const errorHandler = async (fn: (req: NextRequest) => Promise<Response>, req: NextRequest) => {
  try {
    return await fn(req);
  } catch (error: any) {
    logger.error('API Error', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    
    // Determine appropriate status code
    let status = 500;
    if (error.message?.includes('not found')) status = 404;
    if (error.message?.includes('unauthorized')) status = 401;
    if (error.message?.includes('invalid')) status = 400;
    if (error.message?.includes('limit exceeded')) status = 429;
    
    return NextResponse.json(
      { 
        error: error.name || 'Error', 
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status }
    );
  }
};

// Helper to create standardized API responses
function createApiResponse(data: any, metadata: any = {}, status: number = 200) {
  const responseMetadata = {
    timestamp: new Date().toISOString(),
    processingTime: metadata.processingTime || 0,
    ...metadata
  };
  
  return NextResponse.json({
    success: status >= 200 && status < 300,
    data,
    metadata: responseMetadata
  }, { status });
}

// Helper to parse query parameters
function parseTimeWindow(req: NextRequest): TimeWindow {
  const { searchParams } = req.nextUrl;
  const timeWindow = searchParams.get('timeWindow');
  
  if (!timeWindow) return DEFAULT_TIME_WINDOW;
  
  // Validate time window
  if (Object.values(TimeWindow).includes(timeWindow as TimeWindow)) {
    return timeWindow as TimeWindow;
  }
  
  return DEFAULT_TIME_WINDOW;
}

// Helper to parse request format
function parseRequestFormat(req: NextRequest): 'json' | 'csv' | 'excel' {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get('format')?.toLowerCase();
  
  if (format === 'csv' || format === 'excel') {
    return format;
  }
  
  return 'json';
}

// Helper to generate CSV format
function generateCSV(data: any): string {
  // Simple CSV generation for demonstration
  if (!data || typeof data !== 'object') return '';
  
  if (Array.isArray(data)) {
    // Handle array of objects
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    
    return `${headers}\n${rows}`;
  } else {
    // Handle single object
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).join(',');
    
    return `${headers}\n${values}`;
  }
}

// Helper to validate optimization strategy
function validateOptimizationStrategy(strategy: string): OptimizationStrategyType {
  if (Object.values(OptimizationStrategyType).includes(strategy as OptimizationStrategyType)) {
    return strategy as OptimizationStrategyType;
  }
  
  return OptimizationStrategyType.BALANCED; // Default
}

// WebSocket connection handler
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Check if this is a WebSocket upgrade request
    const upgradeHeader = req.headers.get('upgrade');
    
    // Handle WebSocket upgrade
    if (upgradeHeader === 'websocket') {
      // Apply middleware
      const middlewareError = await applyMiddleware(req);
      if (middlewareError) return middlewareError;
      
      // Initialize system
      await initializeSystem();
      
      // Handle WebSocket upgrade
      const response = await wsServer.handleUpgrade(req, 'predictive-analytics');
      
      // Return response (this will be handled by the WebSocket server)
      return response;
    }
    
    // Handle dashboard metrics request
    if (req.nextUrl.pathname.endsWith('/dashboard')) {
      return handleDashboardMetrics(req);
    }
    
    // Handle anomalies request
    if (req.nextUrl.pathname.endsWith('/anomalies')) {
      return handleGetAnomalies(req);
    }
    
    // Handle performance metrics request
    if (req.nextUrl.pathname.endsWith('/performance')) {
      return handleGetPerformance(req);
    }
    
    // Handle predictions request
    if (req.nextUrl.pathname.endsWith('/predictions')) {
      return handleGetPredictions(req);
    }
    
    // Handle optimization history request
    if (req.nextUrl.pathname.endsWith('/optimization-history')) {
      return handleGetOptimizationHistory(req);
    }
    
    // Handle health check request
    if (req.nextUrl.pathname.endsWith('/health')) {
      return handleHealthCheck(req);
    }
    
    // Handle configuration request
    if (req.nextUrl.pathname.endsWith('/config')) {
      return handleGetConfig(req);
    }
    
    // Default response for root endpoint
    return NextResponse.json({
      name: 'Predictive Analytics API',
      version: '1.0.0',
      endpoints: [
        '/dashboard',
        '/anomalies',
        '/performance',
        '/predictions',
        '/optimize',
        '/optimization-history',
        '/health',
        '/config'
      ],
      documentation: '/docs/api/predictive-analytics'
    });
  }, req);
}

// Dashboard metrics handler
async function handleDashboardMetrics(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  // Get time window
  const timeWindow = parseTimeWindow(req);
  
  // Get format
  const format = parseRequestFormat(req);
  
  try {
    // Get dashboard metrics
    const metrics = await system.getDashboardMetrics(timeWindow);
    
    // Track metric
    await trackMetric('dashboard_metrics_request', {
      timeWindow,
      processingTime: Date.now() - startTime
    });
    
    // Handle different formats
    if (format === 'csv') {
      const csv = generateCSV(metrics);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=dashboard-metrics-${timeWindow}-${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    } else if (format === 'excel') {
      // In a real implementation, we would generate Excel format
      // For now, return JSON with a message
      return NextResponse.json({
        message: 'Excel format not implemented yet',
        data: metrics
      });
    }
    
    // Return JSON response
    return createApiResponse(metrics, {
      processingTime: Date.now() - startTime,
      timeWindow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting dashboard metrics', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Get anomalies handler
async function handleGetAnomalies(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  // Get parameters
  const { searchParams } = req.nextUrl;
  const timeWindow = parseTimeWindow(req);
  const metricType = searchParams.get('metricType') as CostMetricType | null;
  const severity = searchParams.get('severity') as AlertSeverity | null;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  try {
    // Get anomalies
    const anomalies = await system.getCostAnomalies({
      timeWindow,
      metricType,
      severity,
      limit
    });
    
    // Track metric
    await trackMetric('anomalies_request', {
      timeWindow,
      metricType,
      severity,
      count: anomalies.length,
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(anomalies, {
      processingTime: Date.now() - startTime,
      timeWindow,
      metricType,
      severity,
      count: anomalies.length
    });
  } catch (error) {
    logger.error('Error getting anomalies', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Get performance metrics handler
async function handleGetPerformance(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  // Get parameters
  const { searchParams } = req.nextUrl;
  const timeWindow = parseTimeWindow(req);
  const provider = searchParams.get('provider');
  const metricType = searchParams.get('metricType') as PerformanceMetricType | null;
  
  try {
    // Get performance metrics
    const performanceMetrics = await system.getProviderPerformanceScores({
      timeWindow,
      provider,
      metricType
    });
    
    // Track metric
    await trackMetric('performance_request', {
      timeWindow,
      provider,
      metricType,
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(performanceMetrics, {
      processingTime: Date.now() - startTime,
      timeWindow,
      provider,
      metricType
    });
  } catch (error) {
    logger.error('Error getting performance metrics', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Get predictions handler
async function handleGetPredictions(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  // Get parameters
  const { searchParams } = req.nextUrl;
  const predictionType = searchParams.get('type') || 'cost';
  const timeWindow = parseTimeWindow(req);
  
  try {
    // Get predictions based on type
    let predictions;
    
    switch (predictionType) {
      case 'cost':
        predictions = await system.predictCosts(timeWindow);
        break;
      case 'demand':
        predictions = await system.predictDemand(timeWindow);
        break;
      case 'resource':
        predictions = await system.predictResourceAllocation(timeWindow);
        break;
      case 'queue':
        predictions = await system.predictQueueMetrics(timeWindow);
        break;
      default:
        predictions = await system.predictCosts(timeWindow);
    }
    
    // Track metric
    await trackMetric('predictions_request', {
      predictionType,
      timeWindow,
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(predictions, {
      processingTime: Date.now() - startTime,
      predictionType,
      timeWindow
    });
  } catch (error) {
    logger.error('Error getting predictions', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Get optimization history handler
async function handleGetOptimizationHistory(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  // Get parameters
  const { searchParams } = req.nextUrl;
  const timeWindow = parseTimeWindow(req);
  const strategy = searchParams.get('strategy') as OptimizationStrategyType | null;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  try {
    // Get optimization history
    const history = await system.getOptimizationHistory({
      timeWindow,
      strategy,
      limit
    });
    
    // Track metric
    await trackMetric('optimization_history_request', {
      timeWindow,
      strategy,
      limit,
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(history, {
      processingTime: Date.now() - startTime,
      timeWindow,
      strategy,
      count: history.length
    });
  } catch (error) {
    logger.error('Error getting optimization history', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Health check handler
async function handleHealthCheck(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  try {
    // Get system health metrics
    const healthMetrics = await system.getSystemHealthMetrics();
    
    // Track metric
    await trackMetric('health_check_request', {
      status: healthMetrics.status,
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(healthMetrics, {
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Error getting system health metrics', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Get configuration handler
async function handleGetConfig(req: NextRequest) {
  const startTime = Date.now();
  
  // Apply middleware
  const middlewareError = await applyMiddleware(req);
  if (middlewareError) return middlewareError;
  
  // Initialize system
  const system = await initializeSystem();
  
  try {
    // Get configuration
    const config = await system.getConfiguration();
    
    // Track metric
    await trackMetric('config_request', {
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(config, {
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Error getting configuration', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// POST handlers
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize system
    const system = await initializeSystem();
    
    // Get path segments to determine the action
    const pathname = req.nextUrl.pathname;
    
    // Handle anomaly detection
    if (pathname.endsWith('/anomalies/detect')) {
      return handleDetectAnomalies(req, system);
    }
    
    // Handle performance update
    if (pathname.endsWith('/performance/update')) {
      return handleUpdatePerformance(req, system);
    }
    
    // Handle prediction
    if (pathname.endsWith('/predict')) {
      return handlePredict(req, system);
    }
    
    // Handle optimization
    if (pathname.endsWith('/optimize')) {
      return handleOptimize(req, system);
    }
    
    // Default response for unknown POST endpoint
    return NextResponse.json(
      { error: 'Not Found', message: 'Unknown POST endpoint' },
      { status: 404 }
    );
  }, req);
}

// Detect anomalies handler
async function handleDetectAnomalies(req: NextRequest, system: PredictiveAnalyticsSystem) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.metricTypes) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required field: metricTypes' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const metricTypes = Array.isArray(body.metricTypes) 
      ? body.metricTypes.filter((type: string) => 
          Object.values(CostMetricType).includes(type as CostMetricType)
        ) 
      : [CostMetricType.TOTAL_COST];
    
    const timeWindow = body.timeWindow && Object.values(TimeWindow).includes(body.timeWindow as TimeWindow)
      ? body.timeWindow as TimeWindow
      : TimeWindow.HOUR_1;
    
    const threshold = typeof body.threshold === 'number' ? body.threshold : 2.5;
    
    // Detect anomalies
    const anomalies = await system.detectCostAnomalies({
      metricTypes,
      timeWindow,
      threshold
    });
    
    // Track metric
    await trackMetric('anomaly_detection', {
      metricTypes,
      timeWindow,
      threshold,
      anomaliesDetected: anomalies.length,
      processingTime: Date.now() - startTime
    });
    
    // Store anomalies in Supabase
    if (anomalies.length > 0) {
      await supabase
        .from('cost_anomalies')
        .insert(anomalies.map(anomaly => ({
          id: anomaly.id,
          metric_type: anomaly.metricType,
          time_window: anomaly.timeWindow,
          actual_value: anomaly.actualValue,
          expected_value: anomaly.expectedValue,
          deviation_percent: anomaly.deviationPercent,
          z_score: anomaly.zScore,
          is_anomaly: anomaly.isAnomaly,
          severity: anomaly.severity,
          affected_features: anomaly.affectedFeatures,
          affected_providers: anomaly.affectedProviders,
          potential_causes: anomaly.potentialCauses,
          recommended_actions: anomaly.recommendedActions,
          created_at: new Date()
        })));
    }
    
    // Return response
    return createApiResponse(anomalies, {
      processingTime: Date.now() - startTime,
      metricTypes,
      timeWindow,
      threshold,
      anomaliesDetected: anomalies.length
    });
  } catch (error) {
    logger.error('Error detecting anomalies', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Update performance handler
async function handleUpdatePerformance(req: NextRequest, system: PredictiveAnalyticsSystem) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.provider || !body.metrics) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: provider, metrics' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const provider = sanitizeInput(body.provider);
    const metrics = body.metrics;
    const modelType = body.modelType || null;
    
    // Update performance metrics
    const result = await system.updateProviderPerformanceMetrics(provider, metrics, modelType);
    
    // Track metric
    await trackMetric('performance_update', {
      provider,
      modelType,
      metricsCount: Object.keys(metrics).length,
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(result, {
      processingTime: Date.now() - startTime,
      provider,
      modelType
    });
  } catch (error) {
    logger.error('Error updating performance metrics', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Prediction handler
async function handlePredict(req: NextRequest, system: PredictiveAnalyticsSystem) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required field: type' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const predictionType = sanitizeInput(body.type);
    const timeWindow = body.timeWindow && Object.values(TimeWindow).includes(body.timeWindow as TimeWindow)
      ? body.timeWindow as TimeWindow
      : TimeWindow.DAY_1;
    const options = body.options || {};
    
    // Make prediction based on type
    let prediction;
    
    switch (predictionType) {
      case 'cost':
        prediction = await system.predictCosts(timeWindow, options);
        break;
      case 'demand':
        prediction = await system.predictDemand(timeWindow, options);
        break;
      case 'resource':
        prediction = await system.predictResourceAllocation(timeWindow, options);
        break;
      case 'queue':
        prediction = await system.predictQueueMetrics(timeWindow, options);
        break;
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: `Invalid prediction type: ${predictionType}` },
          { status: 400 }
        );
    }
    
    // Track metric
    await trackMetric('prediction', {
      predictionType,
      timeWindow,
      processingTime: Date.now() - startTime
    });
    
    // Store prediction in Supabase
    await supabase
      .from('predictions')
      .insert({
        id: prediction.id,
        prediction_type: predictionType,
        time_window: timeWindow,
        predicted_values: prediction.predictedValues,
        confidence: prediction.confidence,
        factors: prediction.factors,
        valid_until: prediction.validUntil,
        model_version: prediction.modelVersion,
        created_at: new Date()
      });
    
    // Return response
    return createApiResponse(prediction, {
      processingTime: Date.now() - startTime,
      predictionType,
      timeWindow
    });
  } catch (error) {
    logger.error('Error making prediction', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// Optimization handler
async function handleOptimize(req: NextRequest, system: PredictiveAnalyticsSystem) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Generate optimization ID
    const optimizationId = body.optimizationId || uuidv4();
    
    // Sanitize inputs
    const strategy = validateOptimizationStrategy(body.strategy || OptimizationStrategyType.BALANCED);
    const options = body.options || {};
    
    // Run optimization
    const result = await system.runOptimization(optimizationId, strategy, options);
    
    // Track metric
    await trackMetric('optimization', {
      strategy,
      successful: result.isSuccessful,
      improvementPercent: Object.values(result.improvementPercent)[0],
      processingTime: Date.now() - startTime
    });
    
    // Store optimization result in Supabase
    await supabase
      .from('optimization_results')
      .insert({
        id: result.id,
        optimization_id: optimizationId,
        strategy: result.strategy,
        target_metrics: result.targetMetrics,
        before_values: result.beforeValues,
        after_values: result.afterValues,
        improvement_percent: result.improvementPercent,
        applied_changes: result.appliedChanges,
        confidence: result.confidence,
        is_successful: result.isSuccessful,
        rollback_needed: result.rollbackNeeded,
        created_at: new Date()
      });
    
    // Broadcast result to WebSocket clients
    wsServer.broadcast('predictive-analytics', {
      type: 'optimization-result',
      data: result
    });
    
    // Return response
    return createApiResponse(result, {
      processingTime: Date.now() - startTime,
      strategy,
      optimizationId
    });
  } catch (error) {
    logger.error('Error running optimization', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// PUT handler for configuration updates
export async function PUT(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize system
    const system = await initializeSystem();
    
    // Get path segments to determine the action
    const pathname = req.nextUrl.pathname;
    
    // Handle configuration update
    if (pathname.endsWith('/config')) {
      return handleUpdateConfig(req, system);
    }
    
    // Default response for unknown PUT endpoint
    return NextResponse.json(
      { error: 'Not Found', message: 'Unknown PUT endpoint' },
      { status: 404 }
    );
  }, req);
}

// Update configuration handler
async function handleUpdateConfig(req: NextRequest, system: PredictiveAnalyticsSystem) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate configuration schema
    // In a real implementation, we would use a validation library like Zod
    // For now, we'll do basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid configuration format' },
        { status: 400 }
      );
    }
    
    // Update configuration
    const result = await system.updateConfiguration(body);
    
    // Track metric
    await trackMetric('config_update', {
      updatedSections: Object.keys(body),
      processingTime: Date.now() - startTime
    });
    
    // Return response
    return createApiResponse(result, {
      processingTime: Date.now() - startTime,
      updatedSections: Object.keys(body)
    });
  } catch (error) {
    logger.error('Error updating configuration', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw error;
  }
}

// DELETE handler for resource cleanup
export async function DELETE(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize system
    const system = await initializeSystem();
    
    // Get path segments to determine the action
    const pathname = req.nextUrl.pathname;
    const { searchParams } = req.nextUrl;
    
    // Handle anomaly deletion
    if (pathname.includes('/anomalies')) {
      const anomalyId = searchParams.get('id');
      
      if (!anomalyId) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Missing required parameter: id' },
          { status: 400 }
        );
      }
      
      const result = await system.deleteAnomalyRecord(anomalyId);
      
      return createApiResponse({ deleted: result }, {
        resourceType: 'anomaly',
        resourceId: anomalyId
      });
    }
    
    // Handle optimization result deletion
    if (pathname.includes('/optimization')) {
      const optimizationId = searchParams.get('id');
      
      if (!optimizationId) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Missing required parameter: id' },
          { status: 400 }
        );
      }
      
      const result = await system.deleteOptimizationRecord(optimizationId);
      
      return createApiResponse({ deleted: result }, {
        resourceType: 'optimization',
        resourceId: optimizationId
      });
    }
    
    // Default response for unknown DELETE endpoint
    return NextResponse.json(
      { error: 'Not Found', message: 'Unknown DELETE endpoint' },
      { status: 404 }
    );
  }, req);
}

// Options endpoint for CORS support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
