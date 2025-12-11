/**
 * Video API Index
 *
 * Main entry point for Video Studio API
 * Provides service status and endpoint documentation
 */

import { NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'
import { checkFFmpegAvailability } from '@/lib/video/ffmpeg-processor'
import { checkWhisperAvailability } from '@/lib/video/caption-service'

const logger = createFeatureLogger('API-Video')

/**
 * GET /api/video
 * Get Video Studio service status and documentation
 */
export async function GET() {
  const ffmpegAvailable = await checkFFmpegAvailability()
  const whisperAvailable = await checkWhisperAvailability()

  return NextResponse.json({
    name: 'KAZI Video Studio API',
    version: '2.0.0',
    status: ffmpegAvailable ? 'operational' : 'degraded',
    services: {
      ffmpeg: {
        available: ffmpegAvailable,
        description: 'Video processing engine'
      },
      whisper: {
        available: whisperAvailable,
        description: 'AI transcription (OpenAI Whisper)'
      }
    },
    endpoints: {
      '/api/video/export': {
        methods: ['POST', 'GET'],
        description: 'Export videos with format conversion and quality presets',
        features: [
          'Multi-format export (MP4, WebM, MOV, AVI, MKV)',
          'Quality presets (low, medium, high, ultra)',
          'Resolution scaling (720p to 4K)',
          'Background processing with progress tracking',
          'Custom codec and bitrate configuration'
        ]
      },
      '/api/video/thumbnail': {
        methods: ['POST', 'GET'],
        description: 'Generate video thumbnails',
        features: [
          'Static thumbnails at specific timestamps',
          'Animated thumbnails (GIF/WebP)',
          'Auto-generate evenly distributed thumbnails',
          'Custom dimensions'
        ]
      },
      '/api/video/caption': {
        methods: ['POST', 'GET'],
        description: 'AI-powered transcription and captions',
        features: [
          'Automatic speech recognition (Whisper)',
          'SRT/VTT/JSON caption formats',
          'Multi-language translation',
          'Burn captions into video'
        ],
        requiresKey: 'OPENAI_API_KEY'
      },
      '/api/video/compress': {
        methods: ['POST', 'GET'],
        description: 'Video compression and optimization',
        features: [
          'Target size compression',
          'Compression presets (web, mobile, social, email, archive)',
          'Quality preservation with smart bitrate',
          'Background processing'
        ]
      },
      '/api/video/trim': {
        methods: ['POST', 'GET'],
        description: 'Video trimming and cutting',
        features: [
          'Simple trim (extract segment)',
          'Cut (remove section)',
          'Multi-segment extraction',
          'Split at timestamps'
        ]
      },
      '/api/video/merge': {
        methods: ['POST', 'GET'],
        description: 'Video merging and composition',
        features: [
          'Concatenate multiple videos',
          'Transition effects (fade, dissolve, wipe)',
          'Watermark overlay',
          'Picture-in-picture'
        ]
      },
      '/api/video/audio': {
        methods: ['POST', 'GET'],
        description: 'Audio extraction and manipulation',
        features: [
          'Extract audio (MP3, AAC, WAV, FLAC, OGG)',
          'Replace/mix audio tracks',
          'Remove audio',
          'Audio enhancement and normalization'
        ]
      }
    },
    quickStart: {
      export: {
        description: 'Export a video with high quality',
        example: {
          method: 'POST',
          url: '/api/video/export',
          body: {
            projectId: 'your-project-uuid',
            format: 'mp4',
            quality: 'high',
            resolution: '1080p'
          }
        }
      },
      thumbnail: {
        description: 'Generate 5 thumbnails',
        example: {
          method: 'POST',
          url: '/api/video/thumbnail',
          body: {
            projectId: 'your-project-uuid',
            type: 'static',
            count: 5
          }
        }
      },
      caption: {
        description: 'Transcribe video and generate captions',
        example: {
          method: 'POST',
          url: '/api/video/caption',
          body: {
            projectId: 'your-project-uuid',
            action: 'transcribe',
            format: 'srt'
          }
        }
      },
      compress: {
        description: 'Compress video for social media',
        example: {
          method: 'POST',
          url: '/api/video/compress',
          body: {
            projectId: 'your-project-uuid',
            preset: 'social'
          }
        }
      }
    },
    documentation: 'Visit each endpoint with GET request for detailed documentation',
    support: {
      maxFileSize: '10GB',
      maxDuration: '4 hours',
      supportedInputFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'],
      supportedOutputFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv']
    }
  })
}
