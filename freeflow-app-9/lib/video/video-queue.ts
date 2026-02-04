/**
 * Video Processing Queue
 *
 * BullMQ-based job queue for video processing tasks
 * Supports exports, thumbnails, compression, and transcription
 */

// BullMQ types only - not using the actual queue in serverless
// import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { Redis } from '@upstash/redis'
import { createSimpleLogger } from '@/lib/simple-logger'
import {
  exportVideo,
  generateThumbnails,
  compressVideo,
  getVideoMetadata,
  type ExportOptions,
  type ThumbnailOptions,
  type ProcessingProgress
} from './ffmpeg-processor'
import { createClient } from '@/lib/supabase/server'
import path from 'path'

const logger = createSimpleLogger('VideoQueue')

// ============================================================================
// Types
// ============================================================================

export type JobType = 'export' | 'thumbnail' | 'compress' | 'transcode' | 'caption'

export interface ExportJobData {
  type: 'export'
  jobId: string
  projectId: string
  userId: string
  inputPath: string
  outputPath: string
  options: ExportOptions
  metadata?: {
    title?: string
    description?: string
    tags?: string[]
  }
}

export interface ThumbnailJobData {
  type: 'thumbnail'
  jobId: string
  projectId: string
  userId: string
  inputPath: string
  outputDir: string
  options: ThumbnailOptions
}

export interface CompressJobData {
  type: 'compress'
  jobId: string
  projectId: string
  userId: string
  inputPath: string
  outputPath: string
  targetSizeMB?: number
}

export interface CaptionJobData {
  type: 'caption'
  jobId: string
  projectId: string
  userId: string
  inputPath: string
  outputPath: string
  language?: string
}

export type VideoJobData = ExportJobData | ThumbnailJobData | CompressJobData | CaptionJobData

export interface JobStatus {
  jobId: string
  type: JobType
  status: 'queued' | 'active' | 'completed' | 'failed'
  progress: number
  currentStep: string
  result?: any
  error?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

// ============================================================================
// Redis Connection (Upstash)
// ============================================================================

// Use Upstash Redis for serverless compatibility
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// Create a connection config for BullMQ
// Note: BullMQ requires ioredis-compatible connection, but we'll use
// a hybrid approach for serverless environments
const getRedisConnection = () => {
  if (!REDIS_URL || !REDIS_TOKEN) {
    logger.warn('Redis not configured, using in-memory job tracking')
    return null
  }

  // For serverless, we'll use Upstash REST API for job status
  // and local processing for the actual jobs
  return {
    host: REDIS_URL.replace('https://', '').split('.')[0] + '.upstash.io',
    port: 6379,
    password: REDIS_TOKEN,
    tls: {}
  }
}

// ============================================================================
// In-Memory Job Store (Fallback for serverless)
// ============================================================================

const jobStore = new Map<string, JobStatus>()
const jobResults = new Map<string, any>()

/**
 * Store job status
 */
async function storeJobStatus(status: JobStatus): Promise<void> {
  jobStore.set(status.jobId, status)

  // Also store in Upstash if available
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const redis = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN
      })
      await redis.set(`video:job:${status.jobId}`, JSON.stringify(status), { ex: 86400 }) // 24h TTL
    } catch (error) {
      logger.error('Failed to store job status in Redis', { error })
    }
  }

  // Update database
  await updateDatabaseJobStatus(status)
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  // Check in-memory first
  const memoryStatus = jobStore.get(jobId)
  if (memoryStatus) {
    return memoryStatus
  }

  // Check Upstash
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const redis = new Redis({
        url: REDIS_URL,
        token: REDIS_TOKEN
      })
      const data = await redis.get(`video:job:${jobId}`)
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : data as JobStatus
      }
    } catch (error) {
      logger.error('Failed to get job status from Redis', { error })
    }
  }

  // Check database
  return getJobStatusFromDatabase(jobId)
}

// ============================================================================
// Database Integration
// ============================================================================

/**
 * Update job status in database
 */
async function updateDatabaseJobStatus(status: JobStatus): Promise<void> {
  try {
    const supabase = await createClient()

    // Update render_jobs table
    const { error } = await supabase
      .from('render_jobs')
      .upsert({
        id: status.jobId,
        status: status.status,
        progress: status.progress,
        current_step: status.currentStep,
        result: status.result,
        error_message: status.error,
        started_at: status.startedAt,
        completed_at: status.completedAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (error) {
      logger.error('Failed to update job status in database', { error: error.message })
    }
  } catch (error) {
    logger.error('Database update error', { error })
  }
}

/**
 * Get job status from database
 */
async function getJobStatusFromDatabase(jobId: string): Promise<JobStatus | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      jobId: data.id,
      type: data.job_type || 'export',
      status: data.status,
      progress: data.progress || 0,
      currentStep: data.current_step || 'Unknown',
      result: data.result,
      error: data.error_message,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at
    }
  } catch (error) {
    logger.error('Failed to get job status from database', { error })
    return null
  }
}

/**
 * Create job record in database
 */
async function createJobRecord(
  jobId: string,
  projectId: string,
  userId: string,
  type: JobType,
  config: any
): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('render_jobs')
      .insert({
        id: jobId,
        project_id: projectId,
        user_id: userId,
        job_type: type,
        status: 'queued',
        progress: 0,
        current_step: 'Initializing',
        config: config,
        created_at: new Date().toISOString()
      })

    if (error) {
      logger.error('Failed to create job record', { error: error.message })
    }
  } catch (error) {
    logger.error('Database insert error', { error })
  }
}

// ============================================================================
// Job Processing
// ============================================================================

/**
 * Process export job
 */
async function processExportJob(data: ExportJobData): Promise<any> {
  const { jobId, projectId, inputPath, outputPath, options, metadata } = data

  logger.info('Processing export job', { jobId, projectId, format: options.format })

  // Update status: started
  await storeJobStatus({
    jobId,
    type: 'export',
    status: 'active',
    progress: 0,
    currentStep: 'Starting export',
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  })

  try {
    // Stage 1: Preparing
    await storeJobStatus({
      jobId,
      type: 'export',
      status: 'active',
      progress: 5,
      currentStep: 'Preparing video clips',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    // Verify input file exists
    const inputMetadata = await getVideoMetadata(inputPath)

    // Stage 2: Encoding
    await storeJobStatus({
      jobId,
      type: 'export',
      status: 'active',
      progress: 10,
      currentStep: 'Encoding video',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    // Process video with progress tracking
    const result = await exportVideo(
      inputPath,
      outputPath,
      options,
      async (progress: ProcessingProgress) => {
        // Map FFmpeg progress to our stages
        const adjustedProgress = 10 + (progress.percent * 0.7) // 10-80%

        await storeJobStatus({
          jobId,
          type: 'export',
          status: 'active',
          progress: Math.round(adjustedProgress),
          currentStep: `Encoding video (${progress.percent.toFixed(0)}%)`,
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        })
      }
    )

    // Stage 3: Finalizing
    await storeJobStatus({
      jobId,
      type: 'export',
      status: 'active',
      progress: 85,
      currentStep: 'Generating thumbnails',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    // Generate thumbnail
    const thumbnailDir = path.dirname(outputPath)
    const thumbnails = await generateThumbnails(outputPath, thumbnailDir, {
      timestamps: [1, inputMetadata.duration / 2],
      width: 640,
      format: 'jpg'
    })

    // Stage 4: Complete
    const finalResult = {
      outputPath,
      outputUrl: `/exports/${path.basename(outputPath)}`,
      thumbnailUrl: thumbnails[0] ? `/exports/${path.basename(thumbnails[0])}` : null,
      metadata: result.metadata,
      compression: result.compression
    }

    await storeJobStatus({
      jobId,
      type: 'export',
      status: 'completed',
      progress: 100,
      currentStep: 'Complete',
      result: finalResult,
      completedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    // Update video project in database
    await updateVideoProject(projectId, {
      status: 'ready',
      file_path: outputPath,
      thumbnail_path: thumbnails[0] || null,
      file_size: result.metadata.fileSize,
      duration: result.metadata.duration
    })

    logger.info('Export job completed', { jobId, outputPath })
    return finalResult

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await storeJobStatus({
      jobId,
      type: 'export',
      status: 'failed',
      progress: 0,
      currentStep: 'Failed',
      error: errorMessage,
      completedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    logger.error('Export job failed', { jobId, error: errorMessage })
    throw error
  }
}

/**
 * Process thumbnail job
 */
async function processThumbnailJob(data: ThumbnailJobData): Promise<any> {
  const { jobId, inputPath, outputDir, options } = data

  logger.info('Processing thumbnail job', { jobId })

  await storeJobStatus({
    jobId,
    type: 'thumbnail',
    status: 'active',
    progress: 10,
    currentStep: 'Generating thumbnails',
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  })

  try {
    const thumbnails = await generateThumbnails(inputPath, outputDir, options)

    const result = {
      thumbnails: thumbnails.map(t => `/thumbnails/${path.basename(t)}`)
    }

    await storeJobStatus({
      jobId,
      type: 'thumbnail',
      status: 'completed',
      progress: 100,
      currentStep: 'Complete',
      result,
      completedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await storeJobStatus({
      jobId,
      type: 'thumbnail',
      status: 'failed',
      progress: 0,
      currentStep: 'Failed',
      error: errorMessage,
      completedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    throw error
  }
}

/**
 * Process compression job
 */
async function processCompressJob(data: CompressJobData): Promise<any> {
  const { jobId, inputPath, outputPath, targetSizeMB } = data

  logger.info('Processing compression job', { jobId, targetSizeMB })

  await storeJobStatus({
    jobId,
    type: 'compress',
    status: 'active',
    progress: 10,
    currentStep: 'Compressing video',
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  })

  try {
    const result = await compressVideo(
      inputPath,
      outputPath,
      targetSizeMB,
      async (progress) => {
        await storeJobStatus({
          jobId,
          type: 'compress',
          status: 'active',
          progress: Math.round(10 + progress.percent * 0.85),
          currentStep: `Compressing (${progress.percent.toFixed(0)}%)`,
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        })
      }
    )

    await storeJobStatus({
      jobId,
      type: 'compress',
      status: 'completed',
      progress: 100,
      currentStep: 'Complete',
      result: {
        outputPath,
        compression: result.compression
      },
      completedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await storeJobStatus({
      jobId,
      type: 'compress',
      status: 'failed',
      progress: 0,
      currentStep: 'Failed',
      error: errorMessage,
      completedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

    throw error
  }
}

/**
 * Update video project in database
 */
async function updateVideoProject(projectId: string, updates: any): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('video_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) {
      logger.error('Failed to update video project', { error: error.message })
    }
  } catch (error) {
    logger.error('Project update error', { error })
  }
}

// ============================================================================
// Queue Management
// ============================================================================

/**
 * Add export job to queue
 */
export async function queueExportJob(
  projectId: string,
  userId: string,
  inputPath: string,
  outputDir: string,
  options: ExportOptions,
  metadata?: any
): Promise<string> {
  const jobId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const outputFilename = `${metadata?.title || 'video'}-${Date.now()}.${options.format}`
  const outputPath = path.join(outputDir, outputFilename)

  logger.info('Queueing export job', { jobId, projectId, format: options.format })

  // Create job record in database
  await createJobRecord(jobId, projectId, userId, 'export', {
    format: options.format,
    quality: options.quality,
    resolution: options.resolution
  })

  // Store initial status
  await storeJobStatus({
    jobId,
    type: 'export',
    status: 'queued',
    progress: 0,
    currentStep: 'Queued',
    createdAt: new Date().toISOString()
  })

  // Process job (in serverless environment, process immediately)
  // In production with dedicated workers, this would add to BullMQ
  const jobData: ExportJobData = {
    type: 'export',
    jobId,
    projectId,
    userId,
    inputPath,
    outputPath,
    options,
    metadata
  }

  // Process asynchronously
  processExportJob(jobData).catch(err => {
    logger.error('Background export job failed', { jobId, error: err.message })
  })

  return jobId
}

/**
 * Add thumbnail job to queue
 */
export async function queueThumbnailJob(
  projectId: string,
  userId: string,
  inputPath: string,
  outputDir: string,
  options: ThumbnailOptions
): Promise<string> {
  const jobId = `thumb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  logger.info('Queueing thumbnail job', { jobId, projectId })

  await createJobRecord(jobId, projectId, userId, 'thumbnail', options)

  await storeJobStatus({
    jobId,
    type: 'thumbnail',
    status: 'queued',
    progress: 0,
    currentStep: 'Queued',
    createdAt: new Date().toISOString()
  })

  const jobData: ThumbnailJobData = {
    type: 'thumbnail',
    jobId,
    projectId,
    userId,
    inputPath,
    outputDir,
    options
  }

  processThumbnailJob(jobData).catch(err => {
    logger.error('Background thumbnail job failed', { jobId, error: err.message })
  })

  return jobId
}

/**
 * Add compression job to queue
 */
export async function queueCompressJob(
  projectId: string,
  userId: string,
  inputPath: string,
  outputPath: string,
  targetSizeMB?: number
): Promise<string> {
  const jobId = `compress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  logger.info('Queueing compression job', { jobId, projectId, targetSizeMB })

  await createJobRecord(jobId, projectId, userId, 'compress', { targetSizeMB })

  await storeJobStatus({
    jobId,
    type: 'compress',
    status: 'queued',
    progress: 0,
    currentStep: 'Queued',
    createdAt: new Date().toISOString()
  })

  const jobData: CompressJobData = {
    type: 'compress',
    jobId,
    projectId,
    userId,
    inputPath,
    outputPath,
    targetSizeMB
  }

  processCompressJob(jobData).catch(err => {
    logger.error('Background compression job failed', { jobId, error: err.message })
  })

  return jobId
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  const status = await getJobStatus(jobId)

  if (!status || status.status === 'completed' || status.status === 'failed') {
    return false
  }

  await storeJobStatus({
    ...status,
    status: 'failed',
    error: 'Cancelled by user',
    completedAt: new Date().toISOString()
  })

  logger.info('Job cancelled', { jobId })
  return true
}

/**
 * Get all jobs for a user
 */
export async function getUserJobs(userId: string, limit: number = 50): Promise<JobStatus[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to get user jobs', { error: error.message })
      return []
    }

    return data.map(job => ({
      jobId: job.id,
      type: job.job_type || 'export',
      status: job.status,
      progress: job.progress || 0,
      currentStep: job.current_step || 'Unknown',
      result: job.result,
      error: job.error_message,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdAt: job.created_at
    }))
  } catch (error) {
    logger.error('Failed to get user jobs', { error })
    return []
  }
}

export default {
  queueExportJob,
  queueThumbnailJob,
  queueCompressJob,
  getJobStatus,
  cancelJob,
  getUserJobs
}
