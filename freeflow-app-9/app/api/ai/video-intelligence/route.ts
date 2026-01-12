/**
 * @file route.ts
 * @description Advanced Video Intelligence API endpoint for Phase 2
 * Handles video processing with scene detection, emotion analysis, content understanding,
 * visual element detection, audio quality analysis, highlight detection, and content moderation.
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs';
import { promisify } from 'util';
import { runtimeJoin } from '@/lib/utils/runtime-path';
import { pipeline } from 'stream';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getErrorMessage } from '@/lib/error-utils';
import { getVideoMetadata } from '@/lib/video-utils';
import { createFeatureLogger } from '@/lib/logger'

// Inline type definitions to avoid module resolution issues
type AIOperationType = 'transcription' | 'summarization' | 'analysis' | 'generation' | 'moderation';
type AIOperationStatus = 'pending' | 'processing' | 'completed' | 'failed';
type AIProviderType = 'openai' | 'anthropic' | 'google' | 'azure' | 'custom' | 'assemblyai' | 'deepgram';

const logger = createFeatureLogger('API-VideoIntelligence')

// Promisify fs functions
const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);
const pipelineAsync = promisify(pipeline);

// Lazy-loaded AI System (to avoid build-time initialization)
let _aiSystem: any = null;
async function getAISystem() {
  if (!_aiSystem) {
    const { IntegratedAISystem } = await import('@/lib/ai/integrated-ai-system');
    _aiSystem = IntegratedAISystem.getInstance();
  }
  return _aiSystem;
}

// Lazy-loaded Supabase client
let _supabase: any = null;
function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
    _supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabase;
}

// Constants
const UPLOAD_DIR = process.env.VIDEO_UPLOAD_DIR || './uploads';
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE || '524288000', 10); // 500MB default
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const DEFAULT_PROVIDER: AIProviderType = 'openai';
const FALLBACK_PROVIDERS: AIProviderType[] = ['anthropic', 'assemblyai', 'deepgram'];
const RATE_LIMIT = { windowMs: 60000, max: 5 }; // 5 requests per minute

// WebSocket connections for real-time updates
const connections = new Map<string, any>();

// Processing status tracking
const processingJobs = new Map<string, {
  userId: string;
  videoId: string;
  status: AIOperationStatus;
  progress: number;
  currentStep: string;
  operations: Map<AIOperationType, string>; // operation type -> request ID
  results: Map<AIOperationType, any>; // operation type -> result
  startTime: number;
  estimatedEndTime?: number;
  error?: any;
}>();

/**
 * Initialize WebSocket server for real-time updates
 * This is called from the main server.ts file
 */
export function initWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: '/api/ai/websocket' });
  
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const videoId = url.searchParams.get('videoId');
    
    if (userId) {
      // Store connection by user ID
      if (!connections.has(userId)) {
        connections.set(userId, []);
      }
      connections.get(userId).push(ws);
      
      // Send initial status if job exists
      if (videoId) {
        const job = Array.from(processingJobs.values()).find(
          job => job.userId === userId && job.videoId === videoId
        );
        
        if (job) {
          ws.send(JSON.stringify({
            type: 'status',
            videoId,
            status: job.status,
            progress: job.progress,
            currentStep: job.currentStep,
            timestamp: new Date().toISOString()
          }));
        }
      }
    }
    
    ws.on('close', () => {
      if (userId && connections.has(userId)) {
        const userConnections = connections.get(userId);
        const index = userConnections.indexOf(ws);
        if (index !== -1) {
          userConnections.splice(index, 1);
        }
        if (userConnections.length === 0) {
          connections.delete(userId);
        }
      }
    });
  });
  
  return wss;
}

/**
 * Send WebSocket update to user
 */
function sendWebSocketUpdate(userId: string, data: any) {
  if (connections.has(userId)) {
    const userConnections = connections.get(userId);
    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    userConnections.forEach((ws: any) => {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
      }
    });
  }
}

/**
 * Update job progress
 */
function updateJobProgress(
  jobId: string, 
  progress: number, 
  currentStep: string,
  estimatedTimeRemaining?: number
) {
  const job = processingJobs.get(jobId);
  if (job) {
    job.progress = progress;
    job.currentStep = currentStep;
    
    if (estimatedTimeRemaining) {
      job.estimatedEndTime = Date.now() + estimatedTimeRemaining;
    }
    
    // Send WebSocket update
    sendWebSocketUpdate(job.userId, {
      type: 'progress',
      videoId: job.videoId,
      status: job.status,
      progress,
      currentStep,
      estimatedTimeRemaining,
    });
  }
}

/**
 * Calculate estimated time remaining based on progress and elapsed time
 */
function calculateTimeRemaining(startTime: number, progress: number): number {
  if (progress <= 0) return 0;
  
  const elapsedMs = Date.now() - startTime;
  const estimatedTotalMs = (elapsedMs / progress) * 100;
  return Math.max(0, estimatedTotalMs - elapsedMs);
}

/**
 * Store video file from request
 */
async function storeVideoFile(
  videoData: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Create upload directory if it doesn't exist
  const uploadPath = runtimeJoin(UPLOAD_DIR, new Date().toISOString().split('T')[0]);
  await mkdirAsync(uploadPath, { recursive: true });
  
  // Generate unique filename
  const fileHash = createHash('md5')
    .update(Buffer.from(videoData))
    .digest('hex');
  const fileExt = fileName.split('.').pop() || 'mp4';
  const uniqueFileName = `${fileHash}_${Date.now()}.${fileExt}`;
  const filePath = runtimeJoin(uploadPath, uniqueFileName);
  
  // Write file
  await writeFileAsync(filePath, Buffer.from(videoData));
  
  // Upload to Supabase Storage
  const fileBuffer = Buffer.from(videoData);
  const { data, error } = await getSupabase().storage
    .from('video-processing')
    .upload(`uploads/${uniqueFileName}`, fileBuffer, {
      contentType,
      cacheControl: '3600',
    });
  
  if (error) {
    logger.error('Failed to upload to Supabase', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    return filePath; // Fall back to local file
  }
  
  return data?.path || filePath;
}

/**
 * Process video with scene detection
 */
async function processSceneDetection(
  jobId: string,
  videoPath: string,
  options: any
): Promise<any> {
  updateJobProgress(jobId, 10, 'Detecting scenes and shot boundaries');
  
  try {
    // Request scene detection from AI system
    const result = await getAISystem().executeOperation(
      AIOperationType.SCENE_DETECTION,
      { videoPath, options },
      {
        provider: options.provider || DEFAULT_PROVIDER,
        fallbackProviders: options.enableFallback ? FALLBACK_PROVIDERS : undefined,
        onProgress: (progress) => {
          updateJobProgress(
            jobId, 
            10 + (progress * 0.15), // 10-25% of total progress
            `Detecting scenes: ${Math.round(progress)}%`
          );
        }
      }
    );
    
    return result.result;
  } catch (error) {
    logger.error('Scene detection failed', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Scene detection failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Process video with emotion analysis
 */
async function processEmotionAnalysis(
  jobId: string,
  videoPath: string,
  options: any
): Promise<any> {
  updateJobProgress(jobId, 25, 'Analyzing emotions and faces');
  
  try {
    // Request emotion analysis from AI system
    const result = await getAISystem().executeOperation(
      AIOperationType.EMOTION_ANALYSIS,
      { videoPath, options },
      {
        provider: options.provider || DEFAULT_PROVIDER,
        fallbackProviders: options.enableFallback ? FALLBACK_PROVIDERS : undefined,
        onProgress: (progress) => {
          updateJobProgress(
            jobId, 
            25 + (progress * 0.15), // 25-40% of total progress
            `Analyzing emotions: ${Math.round(progress)}%`
          );
        }
      }
    );
    
    return result.result;
  } catch (error) {
    logger.error('Emotion analysis failed', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Emotion analysis failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Process visual elements detection
 */
async function processVisualElements(
  jobId: string,
  videoPath: string,
  options: any
): Promise<any> {
  updateJobProgress(jobId, 40, 'Detecting visual elements');
  
  try {
    // Request object detection from AI system
    const result = await getAISystem().executeOperation(
      AIOperationType.OBJECT_DETECTION,
      { videoPath, options },
      {
        provider: options.provider || DEFAULT_PROVIDER,
        fallbackProviders: options.enableFallback ? FALLBACK_PROVIDERS : undefined,
        onProgress: (progress) => {
          updateJobProgress(
            jobId, 
            40 + (progress * 0.15), // 40-55% of total progress
            `Detecting visual elements: ${Math.round(progress)}%`
          );
        }
      }
    );
    
    return result.result;
  } catch (error) {
    logger.error('Visual element detection failed', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Visual element detection failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Process audio quality analysis
 */
async function processAudioQuality(
  jobId: string,
  videoPath: string,
  options: any
): Promise<any> {
  updateJobProgress(jobId, 55, 'Analyzing audio quality');
  
  try {
    // Request audio enhancement from AI system
    const result = await getAISystem().executeOperation(
      AIOperationType.AUDIO_ENHANCEMENT,
      { videoPath, options },
      {
        provider: options.provider || DEFAULT_PROVIDER,
        fallbackProviders: options.enableFallback ? FALLBACK_PROVIDERS : undefined,
        onProgress: (progress) => {
          updateJobProgress(
            jobId, 
            55 + (progress * 0.15), // 55-70% of total progress
            `Analyzing audio quality: ${Math.round(progress)}%`
          );
        }
      }
    );
    
    return result.result;
  } catch (error) {
    logger.error('Audio quality analysis failed', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Audio quality analysis failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Process content moderation
 */
async function processContentModeration(
  jobId: string,
  videoPath: string,
  options: any
): Promise<any> {
  updateJobProgress(jobId, 70, 'Performing content moderation');
  
  try {
    // Request content moderation from AI system
    const result = await getAISystem().executeOperation(
      AIOperationType.CONTENT_MODERATION,
      { videoPath, options },
      {
        provider: options.provider || DEFAULT_PROVIDER,
        fallbackProviders: options.enableFallback ? FALLBACK_PROVIDERS : undefined,
        onProgress: (progress) => {
          updateJobProgress(
            jobId, 
            70 + (progress * 0.15), // 70-85% of total progress
            `Moderating content: ${Math.round(progress)}%`
          );
        }
      }
    );
    
    return result.result;
  } catch (error) {
    logger.error('Content moderation failed', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Content moderation failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Generate thumbnails and B-roll suggestions
 */
async function processThumbnailsAndBRoll(
  jobId: string,
  videoPath: string,
  scenes: any[],
  options: any
): Promise<any> {
  updateJobProgress(jobId, 85, 'Generating thumbnails and B-roll suggestions');
  
  try {
    // Use scene detection results to generate thumbnails and B-roll suggestions
    const result = await getAISystem().executeOperation(
      AIOperationType.THUMBNAIL_GENERATION,
      { videoPath, scenes, options },
      {
        provider: options.provider || DEFAULT_PROVIDER,
        fallbackProviders: options.enableFallback ? FALLBACK_PROVIDERS : undefined,
        onProgress: (progress) => {
          updateJobProgress(
            jobId, 
            85 + (progress * 0.15), // 85-100% of total progress
            `Generating thumbnails: ${Math.round(progress)}%`
          );
        }
      }
    );
    
    return result.result;
  } catch (error) {
    logger.error('Thumbnail generation failed', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Thumbnail generation failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Save processing results to database
 */
async function saveResultsToDatabase(
  userId: string,
  videoId: string,
  results: any
): Promise<void> {
  try {
    // Save to video_intelligence table
    const { error } = await supabase
      .from('video_intelligence')
      .upsert({
        video_id: videoId,
        user_id: userId,
        scenes: results.scenes,
        emotions: results.emotions,
        visual_elements: results.visualElements,
        audio_quality: results.audioQuality,
        moderation: results.moderation,
        thumbnails: results.thumbnails,
        b_roll_suggestions: results.bRollSuggestions,
        processing_metadata: {
          processed_at: new Date().toISOString(),
          version: '2.0.0',
          providers_used: results.providersUsed,
          processing_time: results.processingTime,
          cost: results.cost
        }
      })
      .select();
    
    if (error) {
      logger.error('Failed to save results to database', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
      throw error;
    }
  } catch (error) {
    logger.error('Failed to save results to database', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    throw new Error(`Failed to save results: ${getErrorMessage(error)}`);
  }
}

/**
 * Track performance metrics
 */
async function trackPerformanceMetrics(
  userId: string,
  videoId: string,
  results: any
): Promise<void> {
  try {
    // Save to performance_metrics table
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        user_id: userId,
        resource_id: videoId,
        resource_type: 'video',
        operation_type: 'video_intelligence',
        processing_time_ms: results.processingTime,
        cost: results.cost,
        success: true,
        providers_used: results.providersUsed,
        metadata: {
          video_duration: results.videoDuration,
          scene_count: results.scenes?.length,
          visual_elements_count: results.visualElements?.length,
          version: '2.0.0'
        }
      });
    
    if (error) {
      logger.error('Failed to track performance metrics', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    }
  } catch (error) {
    logger.error('Failed to track performance metrics', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
  }
}

/**
 * Process video with all intelligence features
 */
async function processVideoIntelligence(
  jobId: string,
  userId: string,
  videoId: string,
  videoPath: string,
  options: any
): Promise<any> {
  const job = processingJobs.get(jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  
  job.status = AIOperationStatus.PROCESSING;
  job.startTime = Date.now();
  
  try {
    // Get video metadata
    const metadata = await getVideoMetadata(videoPath);
    
    // Process all features in parallel
    updateJobProgress(jobId, 5, 'Starting video intelligence processing');
    
    // Track which operations are being performed
    const operations = new Map<AIOperationType, string>();
    job.operations = operations;
    
    // Results object
    const results: any = {
      videoId,
      videoDuration: metadata.duration,
      processingTime: 0,
      cost: 0,
      providersUsed: []
    };
    
    // Process features based on options
    const tasks: Promise<any>[] = [];
    
    // Scene detection
    if (options.features.scenes) {
      const scenePromise = processSceneDetection(jobId, videoPath, options)
        .then(sceneResults => {
          results.scenes = sceneResults.scenes;
          results.cost += sceneResults.cost || 0;
          if (sceneResults.provider && !results.providersUsed.includes(sceneResults.provider)) {
            results.providersUsed.push(sceneResults.provider);
          }
          return sceneResults;
        });
      tasks.push(scenePromise);
    }
    
    // Emotion analysis
    if (options.features.emotions) {
      const emotionPromise = processEmotionAnalysis(jobId, videoPath, options)
        .then(emotionResults => {
          results.emotions = emotionResults.emotions;
          results.cost += emotionResults.cost || 0;
          if (emotionResults.provider && !results.providersUsed.includes(emotionResults.provider)) {
            results.providersUsed.push(emotionResults.provider);
          }
          return emotionResults;
        });
      tasks.push(emotionPromise);
    }
    
    // Visual elements detection
    if (options.features.scenes) {
      const visualPromise = processVisualElements(jobId, videoPath, options)
        .then(visualResults => {
          results.visualElements = visualResults.elements;
          results.cost += visualResults.cost || 0;
          if (visualResults.provider && !results.providersUsed.includes(visualResults.provider)) {
            results.providersUsed.push(visualResults.provider);
          }
          return visualResults;
        });
      tasks.push(visualPromise);
    }
    
    // Audio quality analysis
    if (options.features.audioQuality) {
      const audioPromise = processAudioQuality(jobId, videoPath, options)
        .then(audioResults => {
          results.audioQuality = audioResults.quality;
          results.cost += audioResults.cost || 0;
          if (audioResults.provider && !results.providersUsed.includes(audioResults.provider)) {
            results.providersUsed.push(audioResults.provider);
          }
          return audioResults;
        });
      tasks.push(audioPromise);
    }
    
    // Content moderation
    if (options.features.moderation) {
      const moderationPromise = processContentModeration(jobId, videoPath, options)
        .then(moderationResults => {
          results.moderation = moderationResults.moderation;
          results.cost += moderationResults.cost || 0;
          if (moderationResults.provider && !results.providersUsed.includes(moderationResults.provider)) {
            results.providersUsed.push(moderationResults.provider);
          }
          return moderationResults;
        });
      tasks.push(moderationPromise);
    }
    
    // Wait for all tasks to complete
    await Promise.all(tasks);
    
    // Generate thumbnails and B-roll suggestions using scene detection results
    if (options.features.scenes && results.scenes) {
      const thumbnailResults = await processThumbnailsAndBRoll(
        jobId, videoPath, results.scenes, options
      );
      results.thumbnails = thumbnailResults.thumbnails;
      results.bRollSuggestions = thumbnailResults.bRollSuggestions;
      results.cost += thumbnailResults.cost || 0;
      if (thumbnailResults.provider && !results.providersUsed.includes(thumbnailResults.provider)) {
        results.providersUsed.push(thumbnailResults.provider);
      }
    }
    
    // Calculate total processing time
    results.processingTime = Date.now() - job.startTime;
    
    // Save results to database
    updateJobProgress(jobId, 95, 'Saving results to database');
    await saveResultsToDatabase(userId, videoId, results);
    
    // Track performance metrics
    await trackPerformanceMetrics(userId, videoId, results);
    
    // Mark job as completed
    job.status = AIOperationStatus.COMPLETED;
    job.progress = 100;
    job.currentStep = 'Processing completed';
    job.results = new Map(Object.entries(results));
    
    // Send WebSocket update
    sendWebSocketUpdate(userId, {
      type: 'completed',
      videoId,
      status: job.status,
      progress: 100,
      results: {
        scenes: results.scenes?.length || 0,
        emotions: results.emotions?.length || 0,
        visualElements: results.visualElements?.length || 0,
        audioQuality: results.audioQuality ? true : false,
        moderation: results.moderation ? true : false,
        thumbnails: results.thumbnails?.length || 0,
        bRollSuggestions: results.bRollSuggestions?.length || 0,
        processingTime: results.processingTime,
        cost: results.cost
      }
    });
    
    return results;
  } catch (error) {
    // Mark job as failed
    job.status = AIOperationStatus.FAILED;
    job.error = error;
    
    // Send WebSocket update
    sendWebSocketUpdate(userId, {
      type: 'failed',
      videoId,
      status: job.status,
      error: getErrorMessage(error)
    });
    
    throw error;
  }
}

/**
 * Check user quota
 */
async function checkUserQuota(userId: string, estimatedCost: number): Promise<boolean> {
  try {
    // Get user quota from Supabase
    const { data, error } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      logger.error('Failed to get user quota', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
      return false;
    }
    
    // Check if user has enough quota
    const remainingQuota = data.total_quota - data.used_quota;
    return remainingQuota >= estimatedCost;
  } catch (error) {
    logger.error('Failed to check user quota', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    return false;
  }
}

/**
 * Update user quota
 */
async function updateUserQuota(userId: string, cost: number): Promise<void> {
  try {
    // Update user quota in Supabase
    const { error } = await getSupabase().rpc('increment_user_quota_usage', {
      p_user_id: userId,
      p_usage: cost
    });
    
    if (error) {
      logger.error('Failed to update user quota', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    }
  } catch (error) {
    logger.error('Failed to update user quota', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
  }
}

/**
 * Handle POST request for video processing
 */
async function handlePostRequest(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Apply rate limiting
    const userId = session.user.id;
    const identifier = `video_intelligence_${userId}`;
    const { success, limit, remaining, reset } = await rateLimit(identifier, RATE_LIMIT);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit, remaining, reset },
        { status: 429, headers: { 'Retry-After': reset.toString() } }
      );
    }
    
    // Parse request body
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const videoId = formData.get('videoId') as string || uuidv4();
    const options = JSON.parse(formData.get('options') as string || '{}');
    
    // Validate video file
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    
    if (videoFile.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ 
        error: `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }
    
    if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
      return NextResponse.json({ 
        error: `Invalid video type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}` 
      }, { status: 400 });
    }
    
    // Estimate cost based on video duration and selected features
    const estimatedCost = 0.05; // Placeholder - in a real implementation this would be calculated
    
    // Check user quota
    const hasQuota = await checkUserQuota(userId, estimatedCost);
    if (!hasQuota) {
      return NextResponse.json({ error: 'Insufficient quota' }, { status: 402 });
    }
    
    // Store video file
    const arrayBuffer = await videoFile.arrayBuffer();
    const videoPath = await storeVideoFile(arrayBuffer, videoFile.name, videoFile.type);
    
    // Create processing job
    const jobId = uuidv4();
    processingJobs.set(jobId, {
      userId,
      videoId,
      status: AIOperationStatus.PENDING,
      progress: 0,
      currentStep: 'Initializing',
      operations: new Map(),
      results: new Map(),
      startTime: Date.now()
    });
    
    // Start processing in background
    processVideoIntelligence(jobId, userId, videoId, videoPath, options)
      .catch(error => logger.error('Video processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        jobId,
        videoId
      }));
    
    // Return job ID
    return NextResponse.json({ 
      success: true, 
      jobId,
      videoId,
      status: 'pending',
      message: 'Video processing started'
    });
  } catch (error) {
    logger.error('Error processing video', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      error: 'Failed to process video',
      details: getErrorMessage(error)
    }, { status: 500 });
  }
}

/**
 * Handle GET request for job status
 */
async function handleGetRequest(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    const videoId = url.searchParams.get('videoId');
    
    // If jobId is provided, get specific job status
    if (jobId) {
      const job = processingJobs.get(jobId);
      if (!job || job.userId !== userId) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        jobId,
        videoId: job.videoId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        estimatedTimeRemaining: job.estimatedEndTime ? job.estimatedEndTime - Date.now() : undefined,
        error: job.error ? getErrorMessage(job.error) : undefined
      });
    }
    
    // If videoId is provided, get job status by videoId
    if (videoId) {
      const job = Array.from(processingJobs.values()).find(
        job => job.userId === userId && job.videoId === videoId
      );
      
      if (!job) {
        // Check database for completed results
        const { data, error } = await supabase
          .from('video_intelligence')
          .select('*')
          .eq('user_id', userId)
          .eq('video_id', videoId)
          .single();
        
        if (error || !data) {
          return NextResponse.json({ error: 'No processing job found for this video' }, { status: 404 });
        }
        
        return NextResponse.json({
          videoId,
          status: 'completed',
          progress: 100,
          results: {
            scenes: data.scenes?.length || 0,
            emotions: data.emotions?.length || 0,
            visualElements: data.visual_elements?.length || 0,
            audioQuality: data.audio_quality ? true : false,
            moderation: data.moderation ? true : false,
            thumbnails: data.thumbnails?.length || 0,
            bRollSuggestions: data.b_roll_suggestions?.length || 0,
            processingTime: data.processing_metadata?.processing_time,
            cost: data.processing_metadata?.cost
          }
        });
      }
      
      return NextResponse.json({
        jobId: Array.from(processingJobs.keys()).find(id => processingJobs.get(id) === job),
        videoId: job.videoId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        estimatedTimeRemaining: job.estimatedEndTime ? job.estimatedEndTime - Date.now() : undefined,
        error: job.error ? getErrorMessage(job.error) : undefined
      });
    }
    
    // If neither jobId nor videoId is provided, get all jobs for user
    const userJobs = Array.from(processingJobs.entries())
      .filter(([_, job]) => job.userId === userId)
      .map(([jobId, job]) => ({
        jobId,
        videoId: job.videoId,
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        estimatedTimeRemaining: job.estimatedEndTime ? job.estimatedEndTime - Date.now() : undefined,
        error: job.error ? getErrorMessage(job.error) : undefined
      }));
    
    return NextResponse.json({ jobs: userJobs });
  } catch (error) {
    logger.error('Error getting job status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      error: 'Failed to get job status',
      details: getErrorMessage(error) 
    }, { status: 500 });
  }
}

/**
 * Handle DELETE request to cancel job
 */
async function handleDeleteRequest(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    const job = processingJobs.get(jobId);
    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Cancel AI operations
    for (const [operationType, requestId] of job.operations.entries()) {
      await getAISystem().cancelOperation(requestId);
    }
    
    // Update job status
    job.status = AIOperationStatus.CANCELLED;
    job.currentStep = 'Cancelled by user';
    
    // Send WebSocket update
    sendWebSocketUpdate(userId, {
      type: 'cancelled',
      videoId: job.videoId,
      status: job.status
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job cancelled successfully' 
    });
  } catch (error) {
    logger.error('Error cancelling job', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      error: 'Failed to cancel job',
      details: getErrorMessage(error) 
    }, { status: 500 });
  }
}

/**
 * Main API route handler
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  return handlePostRequest(req);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handleGetRequest(req);
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return handleDeleteRequest(req);
}
