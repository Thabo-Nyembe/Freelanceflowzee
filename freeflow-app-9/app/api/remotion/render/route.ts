/**
 * Remotion Video Render API
 *
 * POST /api/remotion/render - Start a new render job
 * GET /api/remotion/render - Get render job status
 * DELETE /api/remotion/render - Cancel/delete render job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  remotionService,
  RenderJobConfig,
} from '@/lib/remotion/remotion-service'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('remotion-render-api')

// Store SSE connections for progress updates
const progressConnections = new Map<string, ReadableStreamDefaultController>()

/**
 * Start a new render job
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

    const body = await request.json()
    const {
      compositionId,
      inputProps,
      outputFormat,
      quality,
      fps,
      width,
      height,
      durationInFrames,
      codec,
      crf,
      audioBitrate,
      videoBitrate,
      async: asyncRender,
    } = body

    // Validate required fields
    if (!compositionId) {
      return NextResponse.json(
        { error: 'compositionId is required' },
        { status: 400 }
      )
    }

    // Check available compositions
    const compositions = await remotionService.listCompositions()
    if (!compositions.includes(compositionId)) {
      return NextResponse.json(
        {
          error: `Invalid compositionId. Available: ${compositions.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Build render config
    const config: RenderJobConfig = {
      compositionId,
      inputProps: inputProps || remotionService.getCompositionPreviewProps(compositionId),
      outputFormat,
      quality,
      fps,
      width,
      height,
      durationInFrames,
      codec,
      crf,
      audioBitrate,
      videoBitrate,
    }

    // Create render job
    const job = await remotionService.createRenderJob(user.id, config)

    // Log to database
    await supabase.from('remotion_render_jobs').insert({
      id: job.id,
      user_id: user.id,
      composition_id: compositionId,
      input_props: inputProps,
      config: config,
      status: job.status,
      created_at: new Date().toISOString(),
    })

    // If async, start render in background
    if (asyncRender) {
      // Start render without awaiting
      remotionService
        .renderJob(job.id, async (progress) => {
          // Update database
          await supabase
            .from('remotion_render_jobs')
            .update({
              status: progress.stage,
              progress: progress.progress,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)

          // Send SSE update
          const controller = progressConnections.get(job.id)
          if (controller) {
            try {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(progress)}\n\n`)
              )
            } catch {
              progressConnections.delete(job.id)
            }
          }
        })
        .then(async (completedJob) => {
          // Update database with final status
          await supabase
            .from('remotion_render_jobs')
            .update({
              status: completedJob.status,
              progress: 100,
              output_path: completedJob.outputPath,
              metadata: completedJob.metadata,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)
        })
        .catch(async (error) => {
          await supabase
            .from('remotion_render_jobs')
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
          status: job.status,
          message: 'Render job started. Poll GET /api/remotion/render?jobId=... for status',
        },
      })
    }

    // Synchronous render (wait for completion)
    const completedJob = await remotionService.renderJob(job.id)

    // Update database
    await supabase
      .from('remotion_render_jobs')
      .update({
        status: completedJob.status,
        progress: 100,
        output_path: completedJob.outputPath,
        metadata: completedJob.metadata,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    return NextResponse.json({
      success: true,
      job: {
        id: completedJob.id,
        status: completedJob.status,
        progress: completedJob.progress,
        outputPath: completedJob.outputPath,
        metadata: completedJob.metadata,
        downloadUrl: `/api/remotion/render/download?jobId=${completedJob.id}`,
      },
    })
  } catch (error) {
    logger.error('Render error', { error })
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to render video',
      },
      { status: 500 }
    )
  }
}

/**
 * Get render job status or list jobs
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
    const stream = searchParams.get('stream') === 'true'

    // If requesting SSE stream for progress
    if (jobId && stream) {
      const encoder = new TextEncoder()

      const streamResponse = new ReadableStream({
        start(controller) {
          progressConnections.set(jobId, controller)

          // Send initial status
          const job = remotionService.getJob(jobId)
          if (job) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  jobId: job.id,
                  stage: job.status,
                  progress: job.progress,
                })}\n\n`
              )
            )
          }
        },
        cancel() {
          progressConnections.delete(jobId)
        },
      })

      return new NextResponse(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Get specific job
    if (jobId) {
      // Try memory first
      const job = remotionService.getJob(jobId)

      // If not in memory, check database
      if (!job) {
        const { data: dbJob } = await supabase
          .from('remotion_render_jobs')
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
            compositionId: dbJob.composition_id,
            config: dbJob.config,
            metadata: dbJob.metadata,
            error: dbJob.error,
            createdAt: dbJob.created_at,
            completedAt: dbJob.completed_at,
            downloadUrl:
              dbJob.status === 'completed'
                ? `/api/remotion/render/download?jobId=${dbJob.id}`
                : undefined,
          },
        })
      }

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          compositionId: job.config.compositionId,
          metadata: job.metadata,
          error: job.error,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          downloadUrl:
            job.status === 'completed'
              ? `/api/remotion/render/download?jobId=${job.id}`
              : undefined,
        },
      })
    }

    // List all jobs for user
    const { data: jobs, error } = await supabase
      .from('remotion_render_jobs')
      .select('*')
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
        compositionId: job.composition_id,
        metadata: job.metadata,
        error: job.error,
        createdAt: job.created_at,
        completedAt: job.completed_at,
        downloadUrl:
          job.status === 'completed'
            ? `/api/remotion/render/download?jobId=${job.id}`
            : undefined,
      })),
    })
  } catch (error) {
    logger.error('Get render job error', { error })
    return NextResponse.json(
      { error: 'Failed to get render job' },
      { status: 500 }
    )
  }
}

/**
 * Cancel or delete a render job
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
    const action = searchParams.get('action') || 'delete' // 'cancel' or 'delete'

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Verify job belongs to user
    const { data: job } = await supabase
      .from('remotion_render_jobs')
      .select('id, user_id, status')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (action === 'cancel') {
      if (job.status === 'completed' || job.status === 'failed') {
        return NextResponse.json(
          { error: 'Cannot cancel completed or failed job' },
          { status: 400 }
        )
      }

      await remotionService.cancelJob(jobId)

      await supabase
        .from('remotion_render_jobs')
        .update({
          status: 'failed',
          error: 'Cancelled by user',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      return NextResponse.json({
        success: true,
        message: 'Job cancelled',
      })
    }

    // Delete job
    await remotionService.deleteJob(jobId)

    await supabase.from('remotion_render_jobs').delete().eq('id', jobId)

    return NextResponse.json({
      success: true,
      message: 'Job deleted',
    })
  } catch (error) {
    logger.error('Delete render job error', { error })
    return NextResponse.json(
      { error: 'Failed to delete render job' },
      { status: 500 }
    )
  }
}
