/**
 * Captions API
 *
 * POST /api/captions - Generate captions from transcription
 * GET /api/captions - Export captions in various formats
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('captions-api')
import {

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
  generateSRT,
  generateVTT,
  generateASS,
  processCaptionSegments,
  CaptionStyle,
  TranscriptionSegment,
} from '@/lib/whisper/whisper-service'

/**
 * Generate styled captions from transcription
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
      jobId,
      segments,
      style,
      format = 'vtt',
      videoWidth,
      videoHeight,
    } = body

    // Get segments from job or directly
    let captionSegments: TranscriptionSegment[] = segments

    if (jobId && !segments) {
      const { data: job } = await supabase
        .from('transcription_jobs')
        .select('result')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (!job || !job.result?.segments) {
        return NextResponse.json(
          { error: 'Transcription job not found or has no segments' },
          { status: 404 }
        )
      }

      captionSegments = job.result.segments
    }

    if (!captionSegments || captionSegments.length === 0) {
      return NextResponse.json(
        { error: 'No segments provided' },
        { status: 400 }
      )
    }

    // Parse caption style
    const captionStyle: CaptionStyle = {
      maxCharsPerLine: style?.maxCharsPerLine || 42,
      maxLines: style?.maxLines || 2,
      minDuration: style?.minDuration || 1,
      maxDuration: style?.maxDuration || 7,
      position: style?.position || 'bottom',
      alignment: style?.alignment || 'center',
      fontFamily: style?.fontFamily,
      fontSize: style?.fontSize,
      color: style?.color,
      backgroundColor: style?.backgroundColor,
    }

    // Process and format captions
    let output: string
    let contentType: string
    let filename: string

    switch (format) {
      case 'srt':
        output = generateSRT(captionSegments, captionStyle)
        contentType = 'text/plain'
        filename = 'captions.srt'
        break

      case 'vtt':
        output = generateVTT(captionSegments, captionStyle)
        contentType = 'text/vtt'
        filename = 'captions.vtt'
        break

      case 'ass':
        output = generateASS(
          captionSegments,
          captionStyle,
          videoWidth || 1920,
          videoHeight || 1080
        )
        contentType = 'text/plain'
        filename = 'captions.ass'
        break

      case 'json':
        output = JSON.stringify({
          segments: processCaptionSegments(captionSegments, captionStyle),
          style: captionStyle,
        }, null, 2)
        contentType = 'application/json'
        filename = 'captions.json'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported: srt, vtt, ass, json' },
          { status: 400 }
        )
    }

    // Save to database for future reference
    await supabase.from('caption_exports').insert({
      user_id: user.id,
      transcription_job_id: jobId || null,
      format,
      style: captionStyle,
      content: output,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      format,
      filename,
      contentType,
      content: output,
      segmentCount: captionSegments.length,
    })
  } catch (error) {
    logger.error('Generate captions error', { error })
    return NextResponse.json(
      { error: 'Failed to generate captions' },
      { status: 500 }
    )
  }
}

/**
 * Export captions as file download
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
    const format = searchParams.get('format') || 'vtt'
    const download = searchParams.get('download') === 'true'

    // Style params
    const maxCharsPerLine = parseInt(searchParams.get('maxCharsPerLine') || '42')
    const maxLines = parseInt(searchParams.get('maxLines') || '2')
    const position = searchParams.get('position') as 'top' | 'bottom' || 'bottom'

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    // Get transcription result
    const { data: job } = await supabase
      .from('transcription_jobs')
      .select('result, filename')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (!job || !job.result?.segments) {
      return NextResponse.json(
        { error: 'Transcription job not found or has no segments' },
        { status: 404 }
      )
    }

    const segments = job.result.segments as TranscriptionSegment[]

    const captionStyle: CaptionStyle = {
      maxCharsPerLine,
      maxLines,
      minDuration: 1,
      maxDuration: 7,
      position,
      alignment: 'center',
    }

    // Generate caption content
    let content: string
    let contentType: string
    let extension: string

    switch (format) {
      case 'srt':
        content = generateSRT(segments, captionStyle)
        contentType = 'text/plain; charset=utf-8'
        extension = 'srt'
        break

      case 'vtt':
        content = generateVTT(segments, captionStyle)
        contentType = 'text/vtt; charset=utf-8'
        extension = 'vtt'
        break

      case 'ass':
        content = generateASS(
          segments,
          captionStyle,
          parseInt(searchParams.get('width') || '1920'),
          parseInt(searchParams.get('height') || '1080')
        )
        contentType = 'text/plain; charset=utf-8'
        extension = 'ass'
        break

      case 'json':
        content = JSON.stringify({
          transcription: job.result,
          segments: processCaptionSegments(segments, captionStyle),
          style: captionStyle,
        }, null, 2)
        contentType = 'application/json; charset=utf-8'
        extension = 'json'
        break

      case 'txt':
        content = segments.map((s) => s.text).join(' ')
        contentType = 'text/plain; charset=utf-8'
        extension = 'txt'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported: srt, vtt, ass, json, txt' },
          { status: 400 }
        )
    }

    // Generate filename
    const baseFilename = job.filename
      ? job.filename.replace(/\.[^.]+$/, '')
      : 'captions'
    const filename = `${baseFilename}.${extension}`

    // Return as download or inline
    const headers: Record<string, string> = {
      'Content-Type': contentType,
    }

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
    }

    return new NextResponse(content, { headers })
  } catch (error) {
    logger.error('Export captions error', { error })
    return NextResponse.json(
      { error: 'Failed to export captions' },
      { status: 500 }
    )
  }
}
