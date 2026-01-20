/**
 * @file Video Processing API Route
 * @description Handles video upload, transcription, analysis, and real-time processing
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import { createHash } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { authenticate } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import {
  AssemblyAI,
  TranscriptStatus,
  TranscriptResponse
} from '@/lib/assemblyai';
import {
  Deepgram,
  DeepgramTranscriptionOptions
} from '@/lib/deepgram';
import { createClient } from '@/lib/supabase/server';

// Environment configuration
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default-webhook-secret';

// Lazy-loaded clients (to avoid build-time initialization)
let _openai: OpenAI | null = null;
let _assemblyai: AssemblyAI | null = null;
let _deepgram: Deepgram | null = null;

function getOpenAI(): OpenAI | null {
  if (_openai === null && typeof _openai === 'object') return _openai;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  _openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
  return _openai;
}

function getAssemblyAI(): AssemblyAI | null {
  if (_assemblyai === null && typeof _assemblyai === 'object') return _assemblyai;
  const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
  _assemblyai = ASSEMBLYAI_API_KEY ? new AssemblyAI(ASSEMBLYAI_API_KEY) : null;
  return _assemblyai;
}

function getDeepgram(): Deepgram | null {
  if (_deepgram === null && typeof _deepgram === 'object') return _deepgram;
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  _deepgram = DEEPGRAM_API_KEY ? new Deepgram(DEEPGRAM_API_KEY) : null;
  return _deepgram;
}

// Server-side Supabase client
async function getSupabase() {
  return await createClient();
}

// WebSocket connections for real-time updates
const connections = new Map<string, WebSocket>();

/**
 * Video processing options interface
 */
interface VideoProcessingOptions {
  transcription: boolean;
  sentiment: boolean;
  chapters: boolean;
  speakerDiarization: boolean;
  keywords: boolean;
  entities: boolean;
  analytics: boolean;
  preferredProvider?: 'assemblyai' | 'openai' | 'deepgram';
  language?: string;
  webhookUrl?: string;
}

/**
 * Transcription segment interface
 */
interface TranscriptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  speaker?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  keywords?: string[];
  entities?: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
}

/**
 * Video chapter interface
 */
interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  keyTopics: string[];
}

/**
 * Video analytics interface
 */
interface VideoAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  heatmapData: { timestamp: number; engagement: number }[];
  topMoments: { timestamp: number; description: string; score: number }[];
  viewerDropoff: { timestamp: number; dropoffRate: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
}

/**
 * Processing status interface
 */
interface ProcessingStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  sentimentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  chaptersStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  analyticsStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Processing result interface
 */
interface ProcessingResult {
  id: string;
  videoId: string;
  transcription: TranscriptionSegment[];
  chapters: VideoChapter[];
  analytics: VideoAnalytics;
  processingTime: number;
  cost: number;
  provider: string;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
  timestamp: string;
}

/**
 * Cost tracking interface
 */
interface CostTracking {
  requestId: string;
  userId: string;
  projectId: string;
  provider: string;
  operation: string;
  cost: number;
  timestamp: string;
}

/**
 * Rate limit options by user tier
 */
const RATE_LIMIT_BY_TIER = {
  free: { requests: 10, window: 60 * 1000 },
  pro: { requests: 30, window: 60 * 1000 },
  enterprise: { requests: 100, window: 60 * 1000 }
};

/**
 * Generate a unique request ID
 * @returns Unique request ID
 */
function generateRequestId(): string {
  return uuidv4();
}

/**
 * Create a standardized error response
 * @param code Error code
 * @param message Error message
 * @param details Additional error details
 * @param status HTTP status code
 * @returns NextResponse with error details
 */
function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  status = 400
): NextResponse {
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      details
    },
    requestId: generateRequestId(),
    timestamp: new Date().toISOString()
  };

  logger.error('API Error', { ...errorResponse });
  
  return NextResponse.json(errorResponse, { status });
}

/**
 * Validate the video file
 * @param file File to validate
 * @returns Validation result
 */
async function validateVideoFile(file: File): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }

  // Check file type
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}. Supported types: ${validTypes.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Upload video to storage
 * @param file Video file
 * @param userId User ID
 * @param projectId Project ID
 * @returns Upload result with file path
 */
async function uploadVideoToStorage(
  file: File,
  userId: string,
  projectId: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const filePath = `videos/${userId}/${projectId}/${fileId}.${fileExtension}`;
    
    const supabaseClient = await getSupabase();
    const { error } = await supabaseClient.storage
      .from('media')
      .upload(filePath, file);

    if (error) {
      logger.error('Video upload error', { error, userId, projectId });
      return { success: false, error: error.message };
    }

    return { success: true, path: filePath };
  } catch (error) {
    logger.error('Video upload exception', { error, userId, projectId });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown upload error' 
    };
  }
}

/**
 * Create a processing job record
 * @param userId User ID
 * @param projectId Project ID
 * @param videoPath Path to video file
 * @param options Processing options
 * @returns Processing job ID
 */
async function createProcessingJob(
  userId: string,
  projectId: string,
  videoPath: string,
  options: VideoProcessingOptions
): Promise<string> {
  const jobId = uuidv4();

  const supabaseClient = await getSupabase();
  const { error } = await supabaseClient
    .from('processing_jobs')
    .insert({
      id: jobId,
      user_id: userId,
      project_id: projectId,
      video_path: videoPath,
      options: options,
      status: 'queued',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    logger.error('Failed to create processing job', { error, userId, projectId });
    throw new Error(`Failed to create processing job: ${error.message}`);
  }

  return jobId;
}

/**
 * Update processing job status
 * @param jobId Processing job ID
 * @param status New status
 * @param progress Progress percentage
 * @param error Error message if any
 */
async function updateProcessingStatus(
  jobId: string,
  status: ProcessingStatus['status'],
  progress: number,
  error?: string
): Promise<void> {
  const updateData: any = {
    status,
    progress,
    updated_at: new Date().toISOString()
  };

  if (error) {
    updateData.error = error;
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const supabaseClient = await getSupabase();
  const { error: updateError } = await supabaseClient
    .from('processing_jobs')
    .update(updateData)
    .eq('id', jobId);

  if (updateError) {
    logger.error('Failed to update processing status', { updateError, jobId });
  }

  // Send real-time update to connected clients
  sendStatusUpdate(jobId, { status, progress, error });
}

/**
 * Send status update to connected clients
 * @param jobId Processing job ID
 * @param update Status update
 */
function sendStatusUpdate(jobId: string, update: any): void {
  const connection = connections.get(jobId);
  if (connection && connection.readyState === WebSocket.OPEN) {
    connection.send(JSON.stringify({
      type: 'status_update',
      jobId,
      ...update,
      timestamp: new Date().toISOString()
    }));
  }

  // Also send webhook if configured
  sendWebhookUpdate(jobId, update);
}

/**
 * Send webhook notification
 * @param jobId Processing job ID
 * @param data Webhook data
 */
async function sendWebhookUpdate(jobId: string, data: any): Promise<void> {
  try {
    // Get job details to check if webhook is configured
    const supabaseClient = await getSupabase();
    const { data: job } = await supabaseClient
      .from('processing_jobs')
      .select('options')
      .eq('id', jobId)
      .single();

    if (!job?.options?.webhookUrl) {
      return;
    }

    const webhookUrl = job.options.webhookUrl;
    const timestamp = Date.now().toString();
    const signature = createWebhookSignature(timestamp, jobId);

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp
      },
      body: JSON.stringify({
        jobId,
        ...data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    logger.error('Webhook delivery failed', { error, jobId });
  }
}

/**
 * Create webhook signature for security
 * @param timestamp Timestamp string
 * @param jobId Job ID
 * @returns Signature hash
 */
function createWebhookSignature(timestamp: string, jobId: string): string {
  const payload = `${timestamp}.${jobId}`;
  return createHash('sha256')
    .update(`${payload}.${WEBHOOK_SECRET}`)
    .digest('hex');
}

/**
 * Transcribe video using AssemblyAI
 * @param videoUrl URL to video file
 * @param options Transcription options
 * @returns Transcription result
 */
async function transcribeWithAssemblyAI(
  videoUrl: string,
  options: VideoProcessingOptions
): Promise<{ segments: TranscriptionSegment[]; error?: string }> {
  if (!getAssemblyAI()) {
    return { segments: [], error: 'AssemblyAI client not initialized' };
  }

  try {
    const transcriptOptions = {
      audio_url: videoUrl,
      speaker_labels: options.speakerDiarization,
      entity_detection: options.entities,
      sentiment_analysis: options.sentiment,
      auto_chapters: options.chapters,
      language_code: options.language
    };

    // Create transcript
    const transcript = await getAssemblyAI()!.transcripts.create(transcriptOptions);
    
    // Poll for completion
    let result: TranscriptResponse;
    let status: TranscriptStatus;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await getAssemblyAI()!.transcripts.get(transcript.id);
      status = result.status;
      
      // Send progress updates
      if (status === 'processing') {
        sendTranscriptionProgress(result.id, result.percent_complete || 0);
      }
      
    } while (status !== 'completed' && status !== 'error');

    if (status === 'error') {
      return { segments: [], error: result.error || 'Unknown transcription error' };
    }

    // Map to our segment format
    const segments: TranscriptionSegment[] = result.words.map((word, index) => {
      const sentiment = word.sentiment ? 
        (word.sentiment === 'POSITIVE' ? 'positive' : 
         word.sentiment === 'NEGATIVE' ? 'negative' : 'neutral') : undefined;

      return {
        id: `segment-${index}`,
        startTime: word.start / 1000, // Convert to seconds
        endTime: word.end / 1000,
        text: word.text,
        confidence: word.confidence || 0,
        speaker: word.speaker || undefined,
        sentiment,
        keywords: extractKeywords(word.text)
      };
    });

    return { segments };
  } catch (error) {
    logger.error('AssemblyAI transcription error', { error });
    return { 
      segments: [], 
      error: error instanceof Error ? error.message : 'Unknown transcription error' 
    };
  }
}

/**
 * Send transcription progress update
 * @param transcriptId Transcript ID
 * @param progress Progress percentage
 */
function sendTranscriptionProgress(transcriptId: string, progress: number): void {
  // Implementation depends on how we're tracking the job
  // This is a placeholder
}

/**
 * Transcribe video using OpenAI Whisper
 * @param videoFile Video file
 * @param options Transcription options
 * @returns Transcription result
 */
async function transcribeWithOpenAI(
  videoFile: File,
  options: VideoProcessingOptions
): Promise<{ segments: TranscriptionSegment[]; error?: string }> {
  if (!getOpenAI()) {
    return { segments: [], error: 'OpenAI client not initialized' };
  }

  try {
    const response = await getOpenAI()!.audio.transcriptions.create({
      file: videoFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: options.language
    });

    // Map to our segment format
    const segments: TranscriptionSegment[] = response.segments.map(segment => ({
      id: `segment-${segment.id}`,
      startTime: segment.start,
      endTime: segment.end,
      text: segment.text,
      confidence: segment.confidence,
      keywords: extractKeywords(segment.text)
    }));

    return { segments };
  } catch (error) {
    logger.error('OpenAI transcription error', { error });
    return { 
      segments: [], 
      error: error instanceof Error ? error.message : 'Unknown transcription error' 
    };
  }
}

/**
 * Transcribe video using Deepgram
 * @param videoUrl URL to video file
 * @param options Transcription options
 * @returns Transcription result
 */
async function transcribeWithDeepgram(
  videoUrl: string,
  options: VideoProcessingOptions
): Promise<{ segments: TranscriptionSegment[]; error?: string }> {
  if (!getDeepgram()) {
    return { segments: [], error: 'Deepgram client not initialized' };
  }

  try {
    const deepgramOptions: DeepgramTranscriptionOptions = {
      url: videoUrl,
      model: 'nova-2',
      language: options.language,
      diarize: options.speakerDiarization,
      smart_format: true,
      utterances: true,
      punctuate: true
    };

    const response = await getDeepgram()!.transcribe(deepgramOptions);

    // Map to our segment format
    const segments: TranscriptionSegment[] = response.results.channels[0].alternatives[0].words.map(
      (word, index) => ({
        id: `segment-${index}`,
        startTime: word.start,
        endTime: word.end,
        text: word.word,
        confidence: word.confidence,
        speaker: word.speaker?.toString(),
        keywords: extractKeywords(word.word)
      })
    );

    return { segments };
  } catch (error) {
    logger.error('Deepgram transcription error', { error });
    return { 
      segments: [], 
      error: error instanceof Error ? error.message : 'Unknown transcription error' 
    };
  }
}

/**
 * Extract keywords from text
 * @param text Text to analyze
 * @returns Array of keywords
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production would use NLP
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 
    'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could', 
    'may', 'might', 'must', 'of', 'in', 'with', 'about', 'this', 'that', 'these', 
    'those', 'it', 'its'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}

/**
 * Analyze sentiment of text
 * @param text Text to analyze
 * @returns Sentiment analysis result
 */
async function analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative' | 'mixed'> {
  if (!getOpenAI()) {
    return 'neutral'; // Default if no AI available
  }

  try {
    const response = await getOpenAI()!.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis system. Classify the following text as positive, neutral, negative, or mixed. Respond with only one of these four words.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const sentiment = response.choices[0].message.content?.toLowerCase().trim();
    
    if (sentiment === 'positive' || sentiment === 'neutral' || 
        sentiment === 'negative' || sentiment === 'mixed') {
      return sentiment;
    }
    
    return 'neutral';
  } catch (error) {
    logger.error('Sentiment analysis error', { error, text });
    return 'neutral';
  }
}

/**
 * Generate chapters from transcription
 * @param transcription Transcription segments
 * @returns Generated chapters
 */
async function generateChapters(
  transcription: TranscriptionSegment[]
): Promise<VideoChapter[]> {
  if (!getOpenAI() || transcription.length === 0) {
    return [];
  }

  try {
    // Combine transcription into full text
    const fullText = transcription
      .map(segment => segment.text)
      .join(' ');
    
    // Use AI to generate chapters
    const response = await getOpenAI()!.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that creates chapters for video content. Based on the transcript, identify logical chapter breaks and create chapters with titles, summaries, and key topics. Format your response as JSON with the following structure: [{"title": "Chapter Title", "startTime": start_time_in_seconds, "endTime": end_time_in_seconds, "summary": "Brief summary", "keyTopics": ["topic1", "topic2"]}]'
        },
        {
          role: 'user',
          content: `Create chapters for this transcript:\n\n${fullText}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    try {
      const parsedResponse = JSON.parse(content);
      if (!Array.isArray(parsedResponse.chapters)) {
        return [];
      }

      // Map to our chapter format and add IDs
      return parsedResponse.chapters.map((chapter: any, index: number) => ({
        id: `chapter-${index + 1}`,
        title: chapter.title,
        startTime: chapter.startTime,
        endTime: chapter.endTime,
        summary: chapter.summary,
        keyTopics: chapter.keyTopics
      }));
    } catch (parseError) {
      logger.error('Chapter parsing error', { parseError, content });
      return [];
    }
  } catch (error) {
    logger.error('Chapter generation error', { error });
    return [];
  }
}

/**
 * Generate video analytics
 * @param videoId Video ID
 * @param duration Video duration in seconds
 * @returns Generated analytics
 */
async function generateVideoAnalytics(
  videoId: string,
  duration: number
): Promise<VideoAnalytics> {
  // In a real implementation, this would use actual view data
  // This is a placeholder that generates realistic-looking sample data
  
  const totalViews = Math.floor(Math.random() * 1000) + 100;
  const uniqueViewers = Math.floor(totalViews * (0.7 + Math.random() * 0.2));
  const averageWatchTime = duration * (0.4 + Math.random() * 0.4);
  const completionRate = 30 + Math.random() * 50;
  const engagementScore = 60 + Math.random() * 30;
  
  // Generate heatmap data
  const heatmapData = [];
  const segments = Math.ceil(duration / 15);
  for (let i = 0; i < segments; i++) {
    heatmapData.push({
      timestamp: i * 15,
      engagement: 50 + Math.random() * 50
    });
  }
  
  // Generate top moments
  const topMoments = [];
  const numMoments = Math.min(3, Math.ceil(duration / 60));
  for (let i = 0; i < numMoments; i++) {
    const timestamp = Math.floor(Math.random() * duration);
    topMoments.push({
      timestamp,
      description: `Interesting moment at ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}`,
      score: 80 + Math.random() * 20
    });
  }
  
  // Generate dropoff points
  const viewerDropoff = [];
  let remainingViewers = 100;
  const dropoffPoints = Math.ceil(duration / 30);
  for (let i = 0; i < dropoffPoints; i++) {
    const dropoff = Math.min(remainingViewers, Math.floor(Math.random() * 10));
    remainingViewers -= dropoff;
    viewerDropoff.push({
      timestamp: i * 30,
      dropoffRate: dropoff
    });
  }
  
  // Device breakdown
  const deviceBreakdown = [
    { device: 'Desktop', percentage: 50 + Math.random() * 20 },
    { device: 'Mobile', percentage: 20 + Math.random() * 20 },
    { device: 'Tablet', percentage: 5 + Math.random() * 10 }
  ];
  
  // Normalize percentages to sum to 100
  const totalPercentage = deviceBreakdown.reduce((sum, item) => sum + item.percentage, 0);
  deviceBreakdown.forEach(item => {
    item.percentage = Math.round((item.percentage / totalPercentage) * 100);
  });
  
  return {
    totalViews,
    uniqueViewers,
    averageWatchTime,
    completionRate,
    engagementScore,
    heatmapData,
    topMoments,
    viewerDropoff,
    deviceBreakdown
  };
}

/**
 * Track cost of AI operations
 * @param userId User ID
 * @param projectId Project ID
 * @param provider Provider name
 * @param operation Operation name
 * @param cost Cost amount
 */
async function trackCost(
  userId: string,
  projectId: string,
  provider: string,
  operation: string,
  cost: number
): Promise<void> {
  const costTracking: CostTracking = {
    requestId: generateRequestId(),
    userId,
    projectId,
    provider,
    operation,
    cost,
    timestamp: new Date().toISOString()
  };

  const supabaseClient = await getSupabase();
  const { error } = await supabaseClient
    .from('cost_tracking')
    .insert(costTracking);

  if (error) {
    logger.error('Cost tracking error', { error, costTracking });
  }

  // Update user quota
  await updateUserQuota(userId, cost);
}

/**
 * Update user quota
 * @param userId User ID
 * @param cost Cost to deduct
 */
async function updateUserQuota(userId: string, cost: number): Promise<void> {
  // Get current user quota
  const supabaseClient = await getSupabase();
  const { data, error } = await supabaseClient
    .from('user_quotas')
    .select('remaining_quota')
    .eq('user_id', userId)
    .single();

  if (error) {
    logger.error('Error fetching user quota', { error, userId });
    return;
  }

  // Update quota
  const remainingQuota = Math.max(0, (data?.remaining_quota || 0) - cost);

  const { error: updateError } = await supabaseClient
    .from('user_quotas')
    .update({ remaining_quota: remainingQuota })
    .eq('user_id', userId);

  if (updateError) {
    logger.error('Error updating user quota', { error: updateError, userId });
  }
}

/**
 * Check if user has sufficient quota
 * @param userId User ID
 * @param estimatedCost Estimated cost
 * @returns Whether user has sufficient quota
 */
async function checkUserQuota(userId: string, estimatedCost: number): Promise<boolean> {
  const supabaseClient = await getSupabase();
  const { data, error } = await supabaseClient
    .from('user_quotas')
    .select('remaining_quota')
    .eq('user_id', userId)
    .single();

  if (error) {
    logger.error('Error checking user quota', { error, userId });
    return false;
  }

  return (data?.remaining_quota || 0) >= estimatedCost;
}

/**
 * Process video with AI
 * @param jobId Processing job ID
 */
async function processVideo(jobId: string): Promise<void> {
  // Update job status to processing
  await updateProcessingStatus(jobId, 'processing', 0);

  try {
    // Get job details
    const supabaseClient = await getSupabase();
    const { data: job, error } = await supabaseClient
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new Error(`Job not found: ${error?.message}`);
    }

    const userId = job.user_id;
    const projectId = job.project_id;
    const videoPath = job.video_path;
    const options = job.options as VideoProcessingOptions;

    // Get video URL
    const { data: urlData } = await supabaseClient.storage
      .from('media')
      .createSignedUrl(videoPath, 3600);

    if (!urlData?.signedUrl) {
      throw new Error('Failed to generate signed URL for video');
    }

    const videoUrl = urlData.signedUrl;
    
    // Start transcription
    await updateProcessingStatus(jobId, 'processing', 10);
    
    // Choose transcription provider
    let transcriptionResult;
    let provider = options.preferredProvider || 'assemblyai';

    // Try preferred provider first
    if (provider === 'assemblyai' && getAssemblyAI()) {
      transcriptionResult = await transcribeWithAssemblyAI(videoUrl, options);
    } else if (provider === 'deepgram' && getDeepgram()) {
      transcriptionResult = await transcribeWithDeepgram(videoUrl, options);
    } else if (provider === 'openai' && getOpenAI()) {
      // For OpenAI we need the actual file
      // In a real implementation, we would download the file or use a stream
      // This is a placeholder
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], 'video.mp4', { type: 'video/mp4' });
      
      transcriptionResult = await transcribeWithOpenAI(file, options);
    }
    
    // If primary provider failed, try fallbacks
    if (!transcriptionResult || transcriptionResult.error) {
      if (provider !== 'assemblyai' && getAssemblyAI()) {
        transcriptionResult = await transcribeWithAssemblyAI(videoUrl, options);
        provider = 'assemblyai';
      } else if (provider !== 'deepgram' && getDeepgram()) {
        transcriptionResult = await transcribeWithDeepgram(videoUrl, options);
        provider = 'deepgram';
      } else if (provider !== 'openai' && getOpenAI()) {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'video.mp4', { type: 'video/mp4' });

        transcriptionResult = await transcribeWithOpenAI(file, options);
        provider = 'openai';
      }
    }
    
    if (!transcriptionResult || transcriptionResult.segments.length === 0) {
      throw new Error('Transcription failed with all providers');
    }
    
    const segments = transcriptionResult.segments;
    
    // Update progress
    await updateProcessingStatus(jobId, 'processing', 40);
    
    // Send transcription segments to client
    sendStatusUpdate(jobId, { 
      type: 'transcription_complete', 
      segments 
    });
    
    // Generate chapters
    let chapters: VideoChapter[] = [];
    if (options.chapters) {
      await updateProcessingStatus(jobId, 'processing', 60);
      chapters = await generateChapters(segments);
      
      // Send chapters to client
      sendStatusUpdate(jobId, { 
        type: 'chapters_complete', 
        chapters 
      });
    }
    
    // Generate analytics
    await updateProcessingStatus(jobId, 'processing', 80);
    
    // Get video duration from last segment
    const duration = segments.length > 0 
      ? segments[segments.length - 1].endTime 
      : 60; // Default to 60 seconds if no segments
      
    const analytics = await generateVideoAnalytics(jobId, duration);
    
    // Send analytics to client
    sendStatusUpdate(jobId, { 
      type: 'analytics_update', 
      analytics 
    });
    
    // Save results to database
    const processingResult: ProcessingResult = {
      id: uuidv4(),
      videoId: jobId,
      transcription: segments,
      chapters,
      analytics,
      processingTime: Date.now() - new Date(job.created_at).getTime(),
      cost: calculateProcessingCost(segments.length, options),
      provider
    };
    
    const supabaseClient2 = await getSupabase();
    const { error: saveError } = await supabaseClient2
      .from('processing_results')
      .insert(processingResult);
      
    if (saveError) {
      logger.error('Error saving processing results', { saveError, jobId });
    }
    
    // Track cost
    await trackCost(
      userId,
      projectId,
      provider,
      'video_processing',
      processingResult.cost
    );
    
    // Update job status to completed
    await updateProcessingStatus(jobId, 'completed', 100);
    
    // Send completion notification
    sendStatusUpdate(jobId, { 
      type: 'processing_complete',
      jobId,
      segments,
      chapters,
      analytics
    });
    
    // Log metrics
    metrics.increment('video_processing.completed');
    metrics.timing('video_processing.duration', processingResult.processingTime);
    
  } catch (error) {
    logger.error('Video processing error', { error, jobId });
    
    // Update job status to failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
    await updateProcessingStatus(jobId, 'failed', 0, errorMessage);
    
    // Send error notification
    sendStatusUpdate(jobId, { 
      type: 'processing_error',
      error: errorMessage
    });
    
    // Log metrics
    metrics.increment('video_processing.failed');
  }
}

/**
 * Calculate processing cost
 * @param segmentsCount Number of transcription segments
 * @param options Processing options
 * @returns Estimated cost
 */
function calculateProcessingCost(
  segmentsCount: number,
  options: VideoProcessingOptions
): number {
  // Base cost for transcription
  let cost = 0.01 * segmentsCount;
  
  // Additional costs for optional features
  if (options.sentiment) cost += 0.005 * segmentsCount;
  if (options.chapters) cost += 0.05;
  if (options.speakerDiarization) cost += 0.02 * segmentsCount;
  if (options.entities) cost += 0.005 * segmentsCount;
  
  return cost;
}

/**
 * Set up WebSocket connection for real-time updates
 * @param jobId Processing job ID
 * @param ws WebSocket connection
 */
function setupWebSocketConnection(jobId: string, ws: WebSocket): void {
  connections.set(jobId, ws);
  
  ws.on('close', () => {
    connections.delete(jobId);
  });
  
  ws.on('error', (error) => {
    logger.error('WebSocket error', { error, jobId });
    connections.delete(jobId);
  });
}

/**
 * Handle WebSocket upgrade request
 * @param req Request
 * @param socket Socket
 * @param head Head
 */
export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) {
    return new NextResponse('Job ID is required', { status: 400 });
  }
  
  // In a real implementation, we would set up the WebSocket connection here
  // For Next.js, we would typically use a separate WebSocket server or a service like Pusher
  // This is a placeholder response
  
  return NextResponse.json({
    message: 'WebSocket connection would be established here',
    jobId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle video upload and processing
 * @param req Request
 * @returns Response
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('video') as File;
    const userId = formData.get('userId') as string;
    const projectId = formData.get('projectId') as string;
    
    // Get processing options
    const options: VideoProcessingOptions = {
      transcription: formData.get('transcription') !== 'false',
      sentiment: formData.get('sentiment') === 'true',
      chapters: formData.get('chapters') === 'true',
      speakerDiarization: formData.get('speakerDiarization') === 'true',
      keywords: formData.get('keywords') === 'true',
      entities: formData.get('entities') === 'true',
      analytics: formData.get('analytics') === 'true',
      preferredProvider: formData.get('preferredProvider') as VideoProcessingOptions['preferredProvider'],
      language: formData.get('language') as string,
      webhookUrl: formData.get('webhookUrl') as string
    };
    
    // Validate request
    if (!file) {
      return createErrorResponse('missing_file', 'No video file provided', undefined, 400);
    }
    
    if (!userId || !projectId) {
      return createErrorResponse('missing_parameters', 'User ID and Project ID are required', undefined, 400);
    }
    
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return createErrorResponse('unauthorized', 'Authentication failed', undefined, 401);
    }
    
    // Rate limit check
    const userTier = authResult.userTier || 'free';
    const rateLimitOptions = RATE_LIMIT_BY_TIER[userTier as keyof typeof RATE_LIMIT_BY_TIER];
    
    const rateLimitResult = await rateLimit(
      userId,
      'video_processing',
      rateLimitOptions.requests,
      rateLimitOptions.window
    );
    
    if (!rateLimitResult.success) {
      return createErrorResponse(
        'rate_limit_exceeded',
        `Rate limit exceeded. Try again in ${Math.ceil(rateLimitResult.timeRemaining / 1000)} seconds`,
        undefined,
        429
      );
    }
    
    // Validate file
    const fileValidation = await validateVideoFile(file);
    if (!fileValidation.valid) {
      return createErrorResponse('invalid_file', fileValidation.error!, undefined, 400);
    }
    
    // Check quota
    const estimatedCost = 0.5; // Placeholder - in production would calculate based on file size and options
    const hasQuota = await checkUserQuota(userId, estimatedCost);
    
    if (!hasQuota) {
      return createErrorResponse('insufficient_quota', 'Insufficient quota for this operation', undefined, 402);
    }
    
    // Upload file to storage
    const uploadResult = await uploadVideoToStorage(file, userId, projectId);
    if (!uploadResult.success) {
      return createErrorResponse('upload_failed', uploadResult.error!, undefined, 500);
    }
    
    // Create processing job
    const jobId = await createProcessingJob(userId, projectId, uploadResult.path!, options);
    
    // Start processing in background
    processVideo(jobId).catch(error => {
      logger.error('Background processing error', { error, jobId });
    });
    
    // Log metrics
    metrics.increment('video_processing.started');
    metrics.gauge('video_processing.file_size', file.size);
    
    // Return job ID
    return NextResponse.json({
      success: true,
      jobId,
      requestId,
      message: 'Video processing started',
      processingTime: Date.now() - startTime
    });
    
  } catch (error) {
    logger.error('Unexpected error in video processing endpoint', { error, requestId });
    
    // Log metrics
    metrics.increment('video_processing.error');
    
    return createErrorResponse(
      'internal_error',
      'An unexpected error occurred',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
