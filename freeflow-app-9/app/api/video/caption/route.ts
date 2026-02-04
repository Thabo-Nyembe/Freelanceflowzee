/**
 * Video Caption API
 *
 * Automatic transcription and caption generation using OpenAI Whisper
 * Supports SRT, VTT, and JSON output formats with translation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import {
  generateCaptions,
  createCaptions,
  translateCaptions,
  burnCaptions,
  checkWhisperAvailability,
  type TranscriptionResult,
  type CaptionOptions
} from '@/lib/video/caption-service'
import { checkFFmpegAvailability } from '@/lib/video/ffmpeg-processor'
import { runtimeJoin, basename, extname } from '@/lib/utils/runtime-path'
import fs from 'fs/promises'

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

const logger = createSimpleLogger('API-VideoCaption')

// Caption output directory
const CAPTION_DIR = process.env.VIDEO_CAPTION_DIR || '/tmp/video-captions'

interface CaptionRequest {
  projectId: string
  videoPath?: string
  action: 'transcribe' | 'generate' | 'translate' | 'burn'

  // Transcription options
  language?: string           // Source language (auto-detect if not specified)
  prompt?: string             // Hint to improve transcription accuracy

  // Caption generation options
  format?: 'srt' | 'vtt' | 'json'
  maxLineLength?: number
  maxLines?: number

  // Translation options
  targetLanguage?: string

  // Burn options (hardcode captions into video)
  captionPath?: string
  fontName?: string
  fontSize?: number
  fontColor?: string
  backgroundColor?: string
  position?: 'bottom' | 'top'
  marginV?: number
}

/**
 * POST /api/video/caption
 * Generate, translate, or burn captions
 */
export async function POST(request: NextRequest) {
  try {
    const body: CaptionRequest = await request.json()

    // Validate required fields
    if (!body.projectId && !body.videoPath) {
      return NextResponse.json(
        { success: false, error: 'Either projectId or videoPath is required' },
        { status: 400 }
      )
    }

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required (transcribe, generate, translate, burn)' },
        { status: 400 }
      )
    }

    // Check service availability
    const whisperAvailable = await checkWhisperAvailability()
    const ffmpegAvailable = await checkFFmpegAvailability()

    if (body.action === 'transcribe' && !whisperAvailable) {
      return NextResponse.json(
        { success: false, error: 'OpenAI Whisper not configured. Set OPENAI_API_KEY environment variable.' },
        { status: 503 }
      )
    }

    if (body.action === 'burn' && !ffmpegAvailable) {
      return NextResponse.json(
        { success: false, error: 'FFmpeg not available for burning captions' },
        { status: 503 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    let inputPath = body.videoPath
    let project: any = null

    // If projectId provided, get video path from project
    if (body.projectId) {
      const { data: projectData, error: projectError } = await supabase
        .from('video_projects')
        .select('*')
        .eq('id', body.projectId)
        .eq('user_id', user.id)
        .single()

      if (projectError || !projectData) {
        return NextResponse.json(
          { success: false, error: 'Project not found or access denied' },
          { status: 404 }
        )
      }

      project = projectData
      inputPath = project.file_path
    }

    if (!inputPath && body.action !== 'translate') {
      return NextResponse.json(
        { success: false, error: 'No video path available' },
        { status: 400 }
      )
    }

    // Ensure caption directory exists
    const projectCaptionDir = runtimeJoin(CAPTION_DIR, body.projectId || 'temp')
    await fs.mkdir(projectCaptionDir, { recursive: true })

    let result: any

    switch (body.action) {
      case 'transcribe': {
        // Transcribe video and generate captions in one step
        logger.info('Starting transcription', {
          projectId: body.projectId,
          language: body.language || 'auto'
        })

        const captionOptions: CaptionOptions = {
          language: body.language,
          format: body.format || 'srt',
          maxLineLength: body.maxLineLength,
          maxLines: body.maxLines,
          prompt: body.prompt
        }

        const { transcription, captionPath, format } = await createCaptions(
          inputPath!,
          projectCaptionDir,
          captionOptions
        )

        // Store transcription in database
        if (body.projectId) {
          // Check if video_captions table exists, create entry
          const { error: captionError } = await supabase
            .from('video_captions')
            .upsert({
              project_id: body.projectId,
              user_id: user.id,
              language: transcription.language,
              format,
              file_path: captionPath,
              transcription_text: transcription.text,
              word_count: transcription.wordCount,
              segment_count: transcription.segments.length,
              duration: transcription.duration,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'project_id,language'
            })

          if (captionError) {
            logger.warn('Failed to store caption in database', { error: captionError.message })
          }

          // Update project with caption info
          await supabase
            .from('video_projects')
            .update({
              has_captions: true,
              caption_language: transcription.language,
              updated_at: new Date().toISOString()
            })
            .eq('id', body.projectId)
        }

        result = {
          action: 'transcribe',
          transcription: {
            text: transcription.text,
            language: transcription.language,
            duration: transcription.duration,
            wordCount: transcription.wordCount,
            segmentCount: transcription.segments.length
          },
          caption: {
            path: captionPath,
            url: `/captions/${basename(projectCaptionDir)}/${basename(captionPath)}`,
            format
          }
        }

        logger.info('Transcription completed', {
          projectId: body.projectId,
          language: transcription.language,
          wordCount: transcription.wordCount
        })
        break
      }

      case 'generate': {
        // Generate captions from existing transcription
        if (!project?.transcription_data) {
          return NextResponse.json(
            { success: false, error: 'No transcription data found. Run transcribe first.' },
            { status: 400 }
          )
        }

        const transcription: TranscriptionResult = project.transcription_data
        const format = body.format || 'srt'
        const outputPath = runtimeJoin(
          projectCaptionDir,
          `${basename(inputPath!, extname(inputPath!))}_${Date.now()}.${format}`
        )

        await generateCaptions(transcription, outputPath, {
          format,
          maxLineLength: body.maxLineLength,
          maxLines: body.maxLines
        })

        result = {
          action: 'generate',
          caption: {
            path: outputPath,
            url: `/captions/${basename(projectCaptionDir)}/${basename(outputPath)}`,
            format
          }
        }

        logger.info('Captions generated', {
          projectId: body.projectId,
          format
        })
        break
      }

      case 'translate': {
        // Translate existing transcription to another language
        if (!body.targetLanguage) {
          return NextResponse.json(
            { success: false, error: 'targetLanguage is required for translation' },
            { status: 400 }
          )
        }

        // Get existing transcription
        let transcription: TranscriptionResult

        if (project?.transcription_data) {
          transcription = project.transcription_data
        } else if (body.projectId) {
          // Try to get from captions table
          const { data: captionData } = await supabase
            .from('video_captions')
            .select('*')
            .eq('project_id', body.projectId)
            .single()

          if (!captionData) {
            return NextResponse.json(
              { success: false, error: 'No transcription found. Run transcribe first.' },
              { status: 400 }
            )
          }

          // Reconstruct transcription result
          transcription = {
            text: captionData.transcription_text,
            segments: [], // Would need to parse from file
            language: captionData.language,
            duration: captionData.duration,
            wordCount: captionData.word_count
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'No transcription available for translation' },
            { status: 400 }
          )
        }

        logger.info('Starting translation', {
          projectId: body.projectId,
          sourceLanguage: transcription.language,
          targetLanguage: body.targetLanguage
        })

        const translatedTranscription = await translateCaptions(
          transcription,
          body.targetLanguage
        )

        // Generate caption file for translated version
        const format = body.format || 'srt'
        const outputPath = runtimeJoin(
          projectCaptionDir,
          `${basename(inputPath!, extname(inputPath!))}_${body.targetLanguage}.${format}`
        )

        await generateCaptions(translatedTranscription, outputPath, {
          format,
          maxLineLength: body.maxLineLength,
          maxLines: body.maxLines
        })

        // Store translated caption in database
        if (body.projectId) {
          await supabase
            .from('video_captions')
            .upsert({
              project_id: body.projectId,
              user_id: user.id,
              language: body.targetLanguage,
              format,
              file_path: outputPath,
              transcription_text: translatedTranscription.text,
              word_count: translatedTranscription.wordCount,
              segment_count: translatedTranscription.segments.length,
              duration: translatedTranscription.duration,
              is_translation: true,
              source_language: transcription.language,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'project_id,language'
            })
        }

        result = {
          action: 'translate',
          translation: {
            sourceLanguage: transcription.language,
            targetLanguage: body.targetLanguage,
            wordCount: translatedTranscription.wordCount
          },
          caption: {
            path: outputPath,
            url: `/captions/${basename(projectCaptionDir)}/${basename(outputPath)}`,
            format
          }
        }

        logger.info('Translation completed', {
          projectId: body.projectId,
          targetLanguage: body.targetLanguage
        })
        break
      }

      case 'burn': {
        // Burn captions into video (hardcode subtitles)
        if (!body.captionPath) {
          // Try to get caption path from database
          if (body.projectId) {
            const { data: captionData } = await supabase
              .from('video_captions')
              .select('file_path')
              .eq('project_id', body.projectId)
              .eq('language', body.language || 'en')
              .single()

            if (captionData?.file_path) {
              body.captionPath = captionData.file_path
            }
          }

          if (!body.captionPath) {
            return NextResponse.json(
              { success: false, error: 'captionPath is required for burn action' },
              { status: 400 }
            )
          }
        }

        const outputPath = runtimeJoin(
          projectCaptionDir,
          `${basename(inputPath!, extname(inputPath!))}_captioned_${Date.now()}.mp4`
        )

        logger.info('Burning captions into video', {
          projectId: body.projectId,
          captionPath: body.captionPath
        })

        await burnCaptions(inputPath!, body.captionPath, outputPath, {
          fontName: body.fontName,
          fontSize: body.fontSize,
          fontColor: body.fontColor,
          backgroundColor: body.backgroundColor,
          position: body.position,
          marginV: body.marginV
        })

        // Get file size
        const stats = await fs.stat(outputPath)

        result = {
          action: 'burn',
          output: {
            path: outputPath,
            url: `/videos/${basename(projectCaptionDir)}/${basename(outputPath)}`,
            fileSize: stats.size
          },
          options: {
            fontName: body.fontName || 'Arial',
            fontSize: body.fontSize || 24,
            position: body.position || 'bottom'
          }
        }

        logger.info('Captions burned into video', {
          projectId: body.projectId,
          outputPath
        })
        break
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${body.action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    logger.error('Caption API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Caption operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/caption
 * Get caption service info or project captions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    // If projectId provided, get project captions
    if (projectId) {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Get captions for project
      const { data: captions, error: captionsError } = await supabase
        .from('video_captions')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (captionsError) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch captions' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        projectId,
        captions: captions.map(c => ({
          language: c.language,
          format: c.format,
          wordCount: c.word_count,
          segmentCount: c.segment_count,
          duration: c.duration,
          isTranslation: c.is_translation,
          sourceLanguage: c.source_language,
          createdAt: c.created_at,
          url: `/captions/${projectId}/${basename(c.file_path)}`
        }))
      })
    }

    // Return service info
    const whisperAvailable = await checkWhisperAvailability()
    const ffmpegAvailable = await checkFFmpegAvailability()

    return NextResponse.json({
      status: 'active',
      endpoint: '/api/video/caption',
      version: '1.0.0',
      services: {
        whisper: whisperAvailable,
        ffmpeg: ffmpegAvailable
      },
      features: {
        transcribe: {
          description: 'Automatic speech recognition using OpenAI Whisper',
          supportedLanguages: [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko',
            'ar', 'hi', 'pl', 'tr', 'uk', 'vi', 'th', 'id', 'ms'
          ],
          maxFileSizeMB: 25
        },
        generate: {
          description: 'Generate caption files from transcription',
          supportedFormats: ['srt', 'vtt', 'json'],
          options: ['maxLineLength', 'maxLines']
        },
        translate: {
          description: 'Translate captions to another language using GPT-4',
          model: 'gpt-4-turbo-preview'
        },
        burn: {
          description: 'Hardcode captions into video using FFmpeg',
          customization: ['fontName', 'fontSize', 'fontColor', 'backgroundColor', 'position']
        }
      },
      usage: {
        transcribe: {
          method: 'POST',
          body: {
            projectId: 'required',
            action: 'transcribe',
            language: 'optional (auto-detect)',
            format: 'srt | vtt | json',
            prompt: 'optional hint for accuracy'
          }
        },
        translate: {
          method: 'POST',
          body: {
            projectId: 'required',
            action: 'translate',
            targetLanguage: 'required (e.g., es, fr, de)'
          }
        },
        burn: {
          method: 'POST',
          body: {
            projectId: 'required',
            action: 'burn',
            captionPath: 'optional (uses default if not provided)',
            fontSize: 24,
            fontColor: 'white',
            position: 'bottom | top'
          }
        }
      }
    })
  } catch (error) {
    logger.error('Caption info API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get caption service info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
