/**
 * Remotion Video Download API
 *
 * GET /api/remotion/render/download?jobId=... - Download rendered video
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { remotionService } from '@/lib/remotion/remotion-service'
import fs from 'fs/promises'
import path from 'path'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('remotion-download-api')

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

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Verify job belongs to user and is completed
    const { data: dbJob } = await supabase
      .from('remotion_render_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (!dbJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (dbJob.status !== 'completed') {
      return NextResponse.json(
        { error: 'Job is not completed yet' },
        { status: 400 }
      )
    }

    // Try to get from memory first
    const buffer = await remotionService.getOutputBuffer(jobId)

    if (buffer) {
      const filename = `${dbJob.composition_id}-${jobId}.${dbJob.config?.outputFormat || 'mp4'}`
      const contentType =
        dbJob.config?.outputFormat === 'webm'
          ? 'video/webm'
          : dbJob.config?.outputFormat === 'gif'
            ? 'image/gif'
            : 'video/mp4'

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      })
    }

    // Try from disk
    if (dbJob.output_path) {
      try {
        const fileBuffer = await fs.readFile(dbJob.output_path)
        const ext = path.extname(dbJob.output_path).slice(1)
        const filename = `${dbJob.composition_id}-${jobId}.${ext}`
        const contentType =
          ext === 'webm'
            ? 'video/webm'
            : ext === 'gif'
              ? 'image/gif'
              : 'video/mp4'

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        })
      } catch {
        // File might have been cleaned up
      }
    }

    return NextResponse.json(
      { error: 'Output file not found. It may have been cleaned up.' },
      { status: 404 }
    )
  } catch (error) {
    logger.error('Download error', { error })
    return NextResponse.json(
      { error: 'Failed to download video' },
      { status: 500 }
    )
  }
}
