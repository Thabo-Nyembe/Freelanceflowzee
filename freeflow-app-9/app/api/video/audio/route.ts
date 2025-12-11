/**
 * Video Audio API
 *
 * Extract, manipulate, and replace audio tracks in videos
 * Supports multiple audio formats and audio enhancement
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import {
  extractAudio,
  getVideoMetadata,
  checkFFmpegAvailability
} from '@/lib/video/ffmpeg-processor'
import path from 'path'
import fs from 'fs/promises'

const logger = createFeatureLogger('API-VideoAudio')

// Audio output directory
const AUDIO_DIR = process.env.VIDEO_AUDIO_DIR || '/tmp/video-audio'

// Audio format configurations
const AUDIO_FORMATS = {
  mp3: {
    extension: 'mp3',
    codec: 'mp3',
    defaultBitrate: '192k',
    description: 'MP3 - Universal compatibility'
  },
  aac: {
    extension: 'aac',
    codec: 'aac',
    defaultBitrate: '192k',
    description: 'AAC - High quality, smaller files'
  },
  wav: {
    extension: 'wav',
    codec: 'pcm_s16le',
    defaultBitrate: null, // Lossless
    description: 'WAV - Lossless, large files'
  },
  flac: {
    extension: 'flac',
    codec: 'flac',
    defaultBitrate: null, // Lossless
    description: 'FLAC - Lossless compression'
  },
  ogg: {
    extension: 'ogg',
    codec: 'libvorbis',
    defaultBitrate: '192k',
    description: 'OGG Vorbis - Open format'
  }
} as const

interface AudioRequest {
  projectId: string
  videoPath?: string
  action: 'extract' | 'replace' | 'remove' | 'enhance' | 'normalize'

  // Extract options
  format?: keyof typeof AUDIO_FORMATS
  bitrate?: string               // e.g., '128k', '192k', '320k'
  sampleRate?: number            // e.g., 44100, 48000
  channels?: 1 | 2               // Mono or stereo
  startTime?: number             // Extract from this time
  duration?: number              // Duration to extract

  // Replace options
  audioPath?: string             // Path to new audio file
  audioVolume?: number           // Volume multiplier for new audio (0-2)
  keepOriginalAudio?: boolean    // Mix with original instead of replace
  originalVolume?: number        // Volume of original if mixing

  // Enhance options
  noiseReduction?: boolean       // Apply noise reduction
  normalize?: boolean            // Normalize audio levels
  fadeIn?: number                // Fade in duration in seconds
  fadeOut?: number               // Fade out duration in seconds
  loudnessTarget?: number        // Target loudness in LUFS (e.g., -14 for streaming)
}

/**
 * POST /api/video/audio
 * Extract, replace, or enhance audio
 */
export async function POST(request: NextRequest) {
  try {
    const body: AudioRequest = await request.json()

    // Validate required fields
    if (!body.projectId && !body.videoPath) {
      return NextResponse.json(
        { success: false, error: 'Either projectId or videoPath is required' },
        { status: 400 }
      )
    }

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Action is required (extract, replace, remove, enhance, normalize)' },
        { status: 400 }
      )
    }

    // Check FFmpeg availability
    const ffmpegAvailable = await checkFFmpegAvailability()
    if (!ffmpegAvailable) {
      logger.error('FFmpeg not available')
      return NextResponse.json(
        { success: false, error: 'Audio processing service unavailable' },
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

    if (!inputPath) {
      return NextResponse.json(
        { success: false, error: 'No video path available' },
        { status: 400 }
      )
    }

    // Get video metadata
    let metadata
    try {
      metadata = await getVideoMetadata(inputPath)
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Failed to read video file' },
        { status: 400 }
      )
    }

    // Ensure audio directory exists
    const projectAudioDir = path.join(AUDIO_DIR, body.projectId || 'temp')
    await fs.mkdir(projectAudioDir, { recursive: true })

    const baseName = path.basename(inputPath, path.extname(inputPath))
    let result: any

    // Import FFmpeg for advanced operations
    const ffmpeg = (await import('fluent-ffmpeg')).default

    // Try to find FFmpeg path
    try {
      const installer = await import('@ffmpeg-installer/ffmpeg')
      ffmpeg.setFfmpegPath(installer.path)
    } catch {
      // Fall back to system FFmpeg
      const { execSync } = await import('child_process')
      try {
        const systemPath = execSync('which ffmpeg').toString().trim()
        ffmpeg.setFfmpegPath(systemPath)
      } catch {
        // Hope FFmpeg is in PATH
      }
    }

    switch (body.action) {
      case 'extract': {
        // Extract audio from video
        const formatConfig = AUDIO_FORMATS[body.format || 'mp3']
        const outputPath = path.join(
          projectAudioDir,
          `${baseName}_audio_${Date.now()}.${formatConfig.extension}`
        )

        logger.info('Extracting audio', {
          projectId: body.projectId,
          format: body.format || 'mp3',
          bitrate: body.bitrate || formatConfig.defaultBitrate
        })

        await extractAudio(inputPath, outputPath, {
          codec: body.format || 'mp3',
          bitrate: body.bitrate || formatConfig.defaultBitrate || '192k',
          sampleRate: body.sampleRate || 44100,
          channels: body.channels || 2
        })

        // Get audio file stats
        const stats = await fs.stat(outputPath)

        // Get audio metadata using FFprobe
        const audioInfo = await new Promise<any>((resolve, reject) => {
          ffmpeg.ffprobe(outputPath, (err, data) => {
            if (err) reject(err)
            else resolve(data)
          })
        })

        const audioStream = audioInfo.streams?.find((s: any) => s.codec_type === 'audio')

        result = {
          action: 'extract',
          output: {
            path: outputPath,
            url: `/audio/${path.basename(projectAudioDir)}/${path.basename(outputPath)}`,
            format: body.format || 'mp3',
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          },
          audio: {
            duration: audioInfo.format?.duration || metadata.duration,
            bitrate: audioStream?.bit_rate ? `${Math.round(audioStream.bit_rate / 1000)}k` : body.bitrate,
            sampleRate: audioStream?.sample_rate,
            channels: audioStream?.channels,
            codec: audioStream?.codec_name
          }
        }

        logger.info('Audio extracted', {
          projectId: body.projectId,
          outputPath,
          format: body.format || 'mp3'
        })
        break
      }

      case 'replace': {
        // Replace video audio with new audio
        if (!body.audioPath) {
          return NextResponse.json(
            { success: false, error: 'audioPath is required for replace action' },
            { status: 400 }
          )
        }

        const outputPath = path.join(
          projectAudioDir,
          `${baseName}_new_audio_${Date.now()}.mp4`
        )

        logger.info('Replacing audio', {
          projectId: body.projectId,
          audioPath: body.audioPath,
          keepOriginal: body.keepOriginalAudio
        })

        await new Promise<void>((resolve, reject) => {
          let command = ffmpeg()
            .input(inputPath)
            .input(body.audioPath!)

          if (body.keepOriginalAudio) {
            // Mix both audio tracks
            const originalVol = body.originalVolume || 0.5
            const newVol = body.audioVolume || 1
            command = command
              .complexFilter([
                `[0:a]volume=${originalVol}[a0]`,
                `[1:a]volume=${newVol}[a1]`,
                `[a0][a1]amix=inputs=2:duration=first[aout]`
              ])
              .outputOptions(['-map 0:v', '-map [aout]'])
          } else {
            // Replace audio completely
            const volume = body.audioVolume || 1
            command = command
              .outputOptions([
                '-map 0:v',
                '-map 1:a',
                `-filter:a volume=${volume}`
              ])
          }

          command
            .outputOptions(['-c:v copy', '-shortest'])
            .output(outputPath)
            .on('error', reject)
            .on('end', () => resolve())
            .run()
        })

        const stats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)

        result = {
          action: 'replace',
          output: {
            path: outputPath,
            url: `/audio/${path.basename(projectAudioDir)}/${path.basename(outputPath)}`,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          },
          metadata: {
            duration: outputMetadata.duration,
            width: outputMetadata.width,
            height: outputMetadata.height
          },
          options: {
            audioSource: body.audioPath,
            keepOriginal: body.keepOriginalAudio,
            volume: body.audioVolume || 1
          }
        }

        logger.info('Audio replaced', {
          projectId: body.projectId,
          outputPath
        })
        break
      }

      case 'remove': {
        // Remove audio from video (make silent)
        const outputPath = path.join(
          projectAudioDir,
          `${baseName}_no_audio_${Date.now()}.mp4`
        )

        logger.info('Removing audio', {
          projectId: body.projectId
        })

        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .outputOptions(['-c:v copy', '-an']) // -an removes audio
            .output(outputPath)
            .on('error', reject)
            .on('end', () => resolve())
            .run()
        })

        const stats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)

        result = {
          action: 'remove',
          output: {
            path: outputPath,
            url: `/audio/${path.basename(projectAudioDir)}/${path.basename(outputPath)}`,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          },
          metadata: {
            duration: outputMetadata.duration,
            width: outputMetadata.width,
            height: outputMetadata.height,
            hasAudio: false
          },
          saved: {
            originalSize: metadata.size,
            newSize: stats.size,
            savedMB: ((metadata.size - stats.size) / (1024 * 1024)).toFixed(2)
          }
        }

        logger.info('Audio removed', {
          projectId: body.projectId,
          outputPath
        })
        break
      }

      case 'enhance':
      case 'normalize': {
        // Enhance audio with normalization and optional effects
        const outputPath = path.join(
          projectAudioDir,
          `${baseName}_enhanced_${Date.now()}.mp4`
        )

        logger.info('Enhancing audio', {
          projectId: body.projectId,
          normalize: body.normalize !== false,
          noiseReduction: body.noiseReduction,
          fadeIn: body.fadeIn,
          fadeOut: body.fadeOut
        })

        // Build audio filter chain
        const audioFilters: string[] = []

        // Noise reduction (high-pass filter to remove low frequency hum)
        if (body.noiseReduction) {
          audioFilters.push('highpass=f=80')
          audioFilters.push('lowpass=f=12000')
          audioFilters.push('afftdn=nf=-20') // FFT-based noise reduction
        }

        // Loudness normalization
        if (body.normalize !== false || body.action === 'normalize') {
          const loudnessTarget = body.loudnessTarget || -16 // -16 LUFS is common for web
          audioFilters.push(`loudnorm=I=${loudnessTarget}:TP=-1.5:LRA=11`)
        }

        // Fade in
        if (body.fadeIn && body.fadeIn > 0) {
          audioFilters.push(`afade=t=in:st=0:d=${body.fadeIn}`)
        }

        // Fade out
        if (body.fadeOut && body.fadeOut > 0) {
          const fadeStart = metadata.duration - body.fadeOut
          audioFilters.push(`afade=t=out:st=${fadeStart}:d=${body.fadeOut}`)
        }

        await new Promise<void>((resolve, reject) => {
          let command = ffmpeg(inputPath)

          if (audioFilters.length > 0) {
            command = command.audioFilters(audioFilters)
          }

          command
            .outputOptions(['-c:v copy', '-c:a aac', '-b:a 192k'])
            .output(outputPath)
            .on('error', reject)
            .on('end', () => resolve())
            .run()
        })

        const stats = await fs.stat(outputPath)
        const outputMetadata = await getVideoMetadata(outputPath)

        result = {
          action: body.action,
          output: {
            path: outputPath,
            url: `/audio/${path.basename(projectAudioDir)}/${path.basename(outputPath)}`,
            size: stats.size,
            sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
          },
          metadata: {
            duration: outputMetadata.duration,
            width: outputMetadata.width,
            height: outputMetadata.height
          },
          enhancements: {
            normalized: body.normalize !== false,
            loudnessTarget: body.loudnessTarget || -16,
            noiseReduction: body.noiseReduction || false,
            fadeIn: body.fadeIn || 0,
            fadeOut: body.fadeOut || 0,
            filtersApplied: audioFilters.length
          }
        }

        logger.info('Audio enhanced', {
          projectId: body.projectId,
          outputPath,
          filters: audioFilters.length
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
      ...result,
      originalVideo: {
        duration: metadata.duration,
        hasAudio: metadata.audioCodec !== undefined
      }
    })

  } catch (error) {
    logger.error('Audio API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Audio operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video/audio
 * Get audio service info
 */
export async function GET() {
  const ffmpegAvailable = await checkFFmpegAvailability()

  return NextResponse.json({
    status: 'active',
    endpoint: '/api/video/audio',
    version: '1.0.0',
    ffmpegAvailable,
    actions: {
      extract: {
        description: 'Extract audio track from video',
        outputFormats: Object.entries(AUDIO_FORMATS).map(([key, value]) => ({
          format: key,
          ...value
        }))
      },
      replace: {
        description: 'Replace or mix audio in video',
        features: ['Complete replacement', 'Mix with original', 'Volume control']
      },
      remove: {
        description: 'Remove audio track (silent video)',
        note: 'Reduces file size'
      },
      enhance: {
        description: 'Enhance audio quality',
        features: ['Noise reduction', 'Loudness normalization', 'Fade effects']
      },
      normalize: {
        description: 'Normalize audio levels',
        features: ['LUFS targeting', 'True peak limiting']
      }
    },
    usage: {
      extract: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'extract',
          format: 'mp3 | aac | wav | flac | ogg',
          bitrate: '128k | 192k | 320k',
          sampleRate: 44100
        }
      },
      replace: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'replace',
          audioPath: '/path/to/audio.mp3',
          audioVolume: 1,
          keepOriginalAudio: false,
          originalVolume: 0.5
        }
      },
      remove: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'remove'
        }
      },
      enhance: {
        method: 'POST',
        body: {
          projectId: 'required',
          action: 'enhance',
          noiseReduction: true,
          normalize: true,
          loudnessTarget: -16,
          fadeIn: 0.5,
          fadeOut: 1
        }
      }
    },
    formats: AUDIO_FORMATS
  })
}
