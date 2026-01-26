/**
 * Transcription API
 *
 * POST /api/transcribe - Start a new transcription job
 * GET /api/transcribe - Get transcription job status or list jobs
 * DELETE /api/transcribe - Delete a transcription job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  whisperService,
  TranscriptionOptions,
} from '@/lib/whisper/whisper-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('transcription-api')

/**
 * Start a new transcription job
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const language = formData.get('language') as string | null
    const prompt = formData.get('prompt') as string | null
    const asyncMode = formData.get('async') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file size (25MB limit for Whisper)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = [
      'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm',
      'audio/ogg', 'audio/flac', 'video/mp4', 'video/webm'
    ]
    if (!validTypes.some((t) => file.type.includes(t.split('/')[1]))) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: MP3, MP4, WAV, WEBM, OGG, FLAC' },
        { status: 400 }
      )
    }

    // Create transcription options
    const options: TranscriptionOptions = {
      language: language || 'auto',
      prompt: prompt || undefined,
      responseFormat: 'verbose_json',
      timestampGranularity: 'segment',
    }

    // Create job
    const job = await whisperService.createJob(user.id, options)

    // Log to database
    await supabase.from('transcription_jobs').insert({
      id: job.id,
      user_id: user.id,
      filename: file.name,
      file_size: file.size,
      options: options,
      status: job.status,
      created_at: new Date().toISOString(),
    })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    if (asyncMode) {
      // Start transcription in background
      whisperService
        .transcribeBuffer(job.id, buffer, file.name, async (progress) => {
          await supabase
            .from('transcription_jobs')
            .update({
              progress,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
        })
        .then(async (result) => {
          await supabase
            .from('transcription_jobs')
            .update({
              status: 'completed',
              progress: 100,
              result: result,
              language: result.language,
              duration: result.duration,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
        })
        .catch(async (error) => {
          await supabase
            .from('transcription_jobs')
            .update({
              status: 'failed',
              error: error.message,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
        })

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          status: 'pending',
          message: 'Transcription started. Poll GET /api/transcribe?jobId=... for status',
        },
      })
    }

    // Synchronous transcription
    const result = await whisperService.transcribeBuffer(job.id, buffer, file.name)

    // Update database
    await supabase
      .from('transcription_jobs')
      .update({
        status: 'completed',
        progress: 100,
        result: result,
        language: result.language,
        duration: result.duration,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: 'completed',
      },
      result,
    })
  } catch (error) {
    logger.error('Transcription error', { error })
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to transcribe audio',
      },
      { status: 500 }
    )
  }
}

/**
 * Get transcription job status or list jobs
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    // Get specific job
    if (jobId) {
      // Try memory first
      const job = whisperService.getJob(jobId)

      // If not in memory, check database
      if (!job) {
        const { data: dbJob } = await supabase
          .from('transcription_jobs')
          .select('*')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single()

        if (!dbJob) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          job: {
            id: dbJob.id,
            status: dbJob.status,
            progress: dbJob.progress,
            filename: dbJob.filename,
            language: dbJob.language,
            duration: dbJob.duration,
            error: dbJob.error,
            createdAt: dbJob.created_at,
            completedAt: dbJob.completed_at,
          },
          result: dbJob.result,
        })
      }

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          language: job.language,
          error: job.error,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
        },
        result: job.result,
      })
    }

    // List all jobs
    const { data: jobs, error } = await supabase
      .from('transcription_jobs')
      .select('id, status, progress, filename, language, duration, error, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        filename: job.filename,
        language: job.language,
        duration: job.duration,
        error: job.error,
        createdAt: job.created_at,
        completedAt: job.completed_at,
      })),
    })
  } catch (error) {
    logger.error('Get transcription job error', { error })
    return NextResponse.json(
      { error: 'Failed to get transcription job' },
      { status: 500 }
    )
  }
}

/**
 * Delete a transcription job
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Verify job belongs to user
    const { data: job } = await supabase
      .from('transcription_jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Delete from memory
    await whisperService.deleteJob(jobId)

    // Delete from database
    await supabase.from('transcription_jobs').delete().eq('id', jobId)

    return NextResponse.json({
      success: true,
      message: 'Transcription job deleted',
    })
  } catch (error) {
    logger.error('Delete transcription job error', { error })
    return NextResponse.json(
      { error: 'Failed to delete transcription job' },
      { status: 500 }
    )
  }
}
