/**
 * FFmpeg Video Processor
 *
 * Production-grade video processing service using FFmpeg
 * Handles encoding, transcoding, compression, and format conversion
 */

import { createFeatureLogger } from '@/lib/logger'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'

const logger = createFeatureLogger('FFmpegProcessor')

// FFmpeg instance - lazily initialized
let ffmpegInstance: any = null
let ffmpegPath: string | null = null

/**
 * Get FFmpeg instance with path configured
 */
async function getFFmpeg(): Promise<any> {
  if (ffmpegInstance && ffmpegPath) {
    return ffmpegInstance
  }

  // Dynamic import to avoid build issues
  const ffmpegModule = await import('fluent-ffmpeg')
  ffmpegInstance = ffmpegModule.default

  // Try to find FFmpeg path
  try {
    // First try the installer package
    const installer = await import('@ffmpeg-installer/ffmpeg')
    ffmpegPath = installer.path
    ffmpegInstance.setFfmpegPath(ffmpegPath)
    logger.info('FFmpeg path set from installer', { path: ffmpegPath })
  } catch {
    // Fall back to system FFmpeg
    const { execSync } = await import('child_process')
    try {
      ffmpegPath = execSync('which ffmpeg').toString().trim()
      ffmpegInstance.setFfmpegPath(ffmpegPath)
      logger.info('FFmpeg path set from system', { path: ffmpegPath })
    } catch {
      logger.warn('FFmpeg not found - video processing may not work')
      ffmpegPath = 'ffmpeg' // Hope it's in PATH
    }
  }

  return ffmpegInstance
}

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface VideoMetadata {
  duration: number          // Duration in seconds
  width: number
  height: number
  fps: number
  bitrate: number          // In kbps
  codec: string
  audioCodec: string | null
  audioChannels: number
  audioSampleRate: number
  fileSize: number         // In bytes
  format: string
}

export interface ExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  resolution: '720p' | '1080p' | '1440p' | '4k' | 'original'
  fps?: number
  codec?: string
  audioCodec?: string
  audioBitrate?: string
  videoBitrate?: string
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow'
  crf?: number             // Constant Rate Factor (0-51, lower = better quality)
  twoPass?: boolean
}

export interface ThumbnailOptions {
  timestamps: number[]     // Timestamps in seconds to capture
  width?: number
  height?: number
  format?: 'png' | 'jpg' | 'webp'
}

export interface CompressionResult {
  inputSize: number
  outputSize: number
  compressionRatio: number
  savedBytes: number
  savedPercentage: number
}

export interface ProcessingProgress {
  percent: number
  currentTime: number
  totalTime: number
  fps: number
  speed: number
  size: number
}

// ============================================================================
// Configuration
// ============================================================================

// Quality presets with bitrates
const QUALITY_PRESETS: Record<string, { videoBitrate: string; audioBitrate: string; crf: number }> = {
  low: { videoBitrate: '1000k', audioBitrate: '96k', crf: 28 },
  medium: { videoBitrate: '2500k', audioBitrate: '128k', crf: 23 },
  high: { videoBitrate: '5000k', audioBitrate: '192k', crf: 18 },
  ultra: { videoBitrate: '15000k', audioBitrate: '320k', crf: 15 }
}

// Resolution presets
const RESOLUTION_PRESETS: Record<string, { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 }
}

// Format-specific codec defaults
const FORMAT_CODECS: Record<string, { video: string; audio: string }> = {
  mp4: { video: 'libx264', audio: 'aac' },
  webm: { video: 'libvpx-vp9', audio: 'libopus' },
  mov: { video: 'libx264', audio: 'aac' },
  avi: { video: 'libx264', audio: 'mp3' },
  mkv: { video: 'libx265', audio: 'aac' }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get video metadata using FFprobe
 */
export async function getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
      if (err) {
        logger.error('FFprobe error', { error: err.message, inputPath })
        reject(new Error(`Failed to get video metadata: ${err.message}`))
        return
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video')
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio')

      if (!videoStream) {
        reject(new Error('No video stream found in file'))
        return
      }

      const result: VideoMetadata = {
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        fps: eval(videoStream.r_frame_rate || '30/1'),
        bitrate: Math.round((metadata.format.bit_rate || 0) / 1000),
        codec: videoStream.codec_name || 'unknown',
        audioCodec: audioStream?.codec_name || null,
        audioChannels: audioStream?.channels || 0,
        audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate) : 0,
        fileSize: metadata.format.size || 0,
        format: metadata.format.format_name || 'unknown'
      }

      logger.info('Video metadata extracted', {
        inputPath,
        duration: result.duration,
        resolution: `${result.width}x${result.height}`,
        codec: result.codec
      })

      resolve(result)
    })
  })
}

/**
 * Export video with specified options
 */
export async function exportVideo(
  inputPath: string,
  outputPath: string,
  options: ExportOptions,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<{ success: boolean; outputPath: string; metadata: VideoMetadata; compression: CompressionResult }> {

  logger.info('Starting video export', {
    inputPath,
    outputPath,
    format: options.format,
    quality: options.quality,
    resolution: options.resolution
  })

  // Get input metadata
  const inputMetadata = await getVideoMetadata(inputPath)
  const inputSize = inputMetadata.fileSize

  // Get quality preset
  const qualityPreset = QUALITY_PRESETS[options.quality] || QUALITY_PRESETS.high

  // Get format codecs
  const formatCodecs = FORMAT_CODECS[options.format] || FORMAT_CODECS.mp4

  // Determine output resolution
  let outputWidth: number
  let outputHeight: number

  if (options.resolution === 'original') {
    outputWidth = inputMetadata.width
    outputHeight = inputMetadata.height
  } else {
    const resPreset = RESOLUTION_PRESETS[options.resolution] || RESOLUTION_PRESETS['1080p']
    outputWidth = resPreset.width
    outputHeight = resPreset.height

    // Maintain aspect ratio
    const aspectRatio = inputMetadata.width / inputMetadata.height
    if (aspectRatio > outputWidth / outputHeight) {
      outputHeight = Math.round(outputWidth / aspectRatio)
    } else {
      outputWidth = Math.round(outputHeight * aspectRatio)
    }

    // Ensure dimensions are even (required by most codecs)
    outputWidth = Math.floor(outputWidth / 2) * 2
    outputHeight = Math.floor(outputHeight / 2) * 2
  }

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec(options.codec || formatCodecs.video)
      .audioCodec(options.audioCodec || formatCodecs.audio)
      .size(`${outputWidth}x${outputHeight}`)
      .videoBitrate(options.videoBitrate || qualityPreset.videoBitrate)
      .audioBitrate(options.audioBitrate || qualityPreset.audioBitrate)
      .audioChannels(2)
      .audioFrequency(48000)

    // Set FPS if specified
    if (options.fps) {
      command = command.fps(options.fps)
    }

    // Set encoding preset for x264/x265
    if (formatCodecs.video.includes('libx264') || formatCodecs.video.includes('libx265')) {
      command = command.outputOptions([
        `-preset ${options.preset || 'medium'}`,
        `-crf ${options.crf || qualityPreset.crf}`
      ])
    }

    // WebM specific options
    if (options.format === 'webm') {
      command = command.outputOptions([
        '-deadline good',
        '-cpu-used 2',
        `-crf ${options.crf || qualityPreset.crf}`,
        '-b:v 0' // Use CRF mode for VP9
      ])
    }

    // Add format-specific output options
    command = command.outputOptions([
      '-movflags +faststart', // Enable fast start for MP4
      '-pix_fmt yuv420p'      // Ensure compatibility
    ])

    // Progress tracking
    command.on('progress', (progress) => {
      const processingProgress: ProcessingProgress = {
        percent: progress.percent || 0,
        currentTime: progress.timemark ? parseTimemark(progress.timemark) : 0,
        totalTime: inputMetadata.duration,
        fps: progress.currentFps || 0,
        speed: parseFloat(progress.currentKbps?.toString() || '0'),
        size: progress.targetSize || 0
      }

      logger.debug('Export progress', {
        percent: processingProgress.percent,
        fps: processingProgress.fps
      })

      if (onProgress) {
        onProgress(processingProgress)
      }
    })

    command.on('error', (err) => {
      logger.error('FFmpeg export error', {
        error: err.message,
        inputPath,
        outputPath
      })
      reject(new Error(`Video export failed: ${err.message}`))
    })

    command.on('end', async () => {
      try {
        const outputMetadata = await getVideoMetadata(outputPath)
        const outputSize = outputMetadata.fileSize

        const compression: CompressionResult = {
          inputSize,
          outputSize,
          compressionRatio: inputSize / outputSize,
          savedBytes: inputSize - outputSize,
          savedPercentage: ((inputSize - outputSize) / inputSize) * 100
        }

        logger.info('Video export completed', {
          inputPath,
          outputPath,
          inputSize: formatFileSize(inputSize),
          outputSize: formatFileSize(outputSize),
          compressionRatio: compression.compressionRatio.toFixed(2),
          savedPercentage: compression.savedPercentage.toFixed(1)
        })

        resolve({
          success: true,
          outputPath,
          metadata: outputMetadata,
          compression
        })
      } catch (error) {
        reject(error)
      }
    })

    command.run()
  })
}

/**
 * Generate video thumbnails at specified timestamps
 */
export async function generateThumbnails(
  inputPath: string,
  outputDir: string,
  options: ThumbnailOptions
): Promise<string[]> {

  logger.info('Generating thumbnails', {
    inputPath,
    outputDir,
    timestamps: options.timestamps,
    format: options.format || 'jpg'
  })

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true })

  const ffmpeg = await getFFmpeg()
  const thumbnailPaths: string[] = []
  const format = options.format || 'jpg'

  for (const timestamp of options.timestamps) {
    const outputFilename = `thumbnail_${timestamp.toFixed(2).replace('.', '_')}.${format}`
    const outputPath = path.join(outputDir, outputFilename)

    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)

      // Set dimensions if specified
      if (options.width && options.height) {
        command = command.size(`${options.width}x${options.height}`)
      } else if (options.width) {
        command = command.size(`${options.width}x?`)
      }

      // Format-specific options
      if (format === 'webp') {
        command = command.outputOptions(['-quality 85'])
      } else if (format === 'jpg') {
        command = command.outputOptions(['-q:v 2'])
      }

      command.on('error', (err) => {
        logger.error('Thumbnail generation error', {
          error: err.message,
          timestamp
        })
        reject(err)
      })

      command.on('end', () => {
        logger.debug('Thumbnail generated', { outputPath, timestamp })
        thumbnailPaths.push(outputPath)
        resolve()
      })

      command.run()
    })
  }

  logger.info('Thumbnails generated', {
    count: thumbnailPaths.length,
    paths: thumbnailPaths
  })

  return thumbnailPaths
}

/**
 * Generate animated thumbnail (GIF or WebP)
 */
export async function generateAnimatedThumbnail(
  inputPath: string,
  outputPath: string,
  options: {
    startTime: number
    duration: number
    width?: number
    fps?: number
    format?: 'gif' | 'webp'
  }
): Promise<string> {

  logger.info('Generating animated thumbnail', {
    inputPath,
    outputPath,
    startTime: options.startTime,
    duration: options.duration
  })

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .seekInput(options.startTime)
      .duration(options.duration)
      .output(outputPath)
      .fps(options.fps || 10)

    if (options.width) {
      command = command.size(`${options.width}x?`)
    }

    if (options.format === 'webp') {
      command = command
        .outputOptions([
          '-vcodec libwebp',
          '-lossless 0',
          '-compression_level 3',
          '-q:v 70',
          '-loop 0'
        ])
    } else {
      // GIF with palette generation for better quality
      command = command
        .complexFilter([
          'fps=10,scale=480:-1:flags=lanczos,split[s0][s1]',
          '[s0]palettegen[p]',
          '[s1][p]paletteuse'
        ])
    }

    command.on('error', (err) => {
      logger.error('Animated thumbnail error', { error: err.message })
      reject(err)
    })

    command.on('end', () => {
      logger.info('Animated thumbnail generated', { outputPath })
      resolve(outputPath)
    })

    command.run()
  })
}

/**
 * Extract audio from video
 */
export async function extractAudio(
  inputPath: string,
  outputPath: string,
  options?: {
    codec?: 'aac' | 'mp3' | 'flac' | 'wav'
    bitrate?: string
    sampleRate?: number
  }
): Promise<string> {

  logger.info('Extracting audio', {
    inputPath,
    outputPath,
    codec: options?.codec || 'aac'
  })

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .noVideo()
      .output(outputPath)
      .audioCodec(options?.codec || 'aac')

    if (options?.bitrate) {
      command = command.audioBitrate(options.bitrate)
    }

    if (options?.sampleRate) {
      command = command.audioFrequency(options.sampleRate)
    }

    command.on('error', (err) => {
      logger.error('Audio extraction error', { error: err.message })
      reject(err)
    })

    command.on('end', () => {
      logger.info('Audio extracted', { outputPath })
      resolve(outputPath)
    })

    command.run()
  })
}

/**
 * Compress video with optimal settings
 */
export async function compressVideo(
  inputPath: string,
  outputPath: string,
  targetSizeMB?: number,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<{ success: boolean; outputPath: string; compression: CompressionResult }> {

  const inputMetadata = await getVideoMetadata(inputPath)
  const inputSizeMB = inputMetadata.fileSize / (1024 * 1024)

  logger.info('Compressing video', {
    inputPath,
    inputSizeMB: inputSizeMB.toFixed(2),
    targetSizeMB
  })

  // Calculate target bitrate if size specified
  let videoBitrate: string
  if (targetSizeMB) {
    // Target bitrate = (targetSize * 8192) / duration - audioBitrate
    const targetBits = targetSizeMB * 8 * 1024 * 1024
    const audioBits = 128 * 1000 // 128kbps audio
    const videoBits = (targetBits / inputMetadata.duration) - audioBits
    videoBitrate = `${Math.max(500, Math.floor(videoBits / 1000))}k`
  } else {
    // Use CRF-based compression
    videoBitrate = '0' // Use CRF mode
  }

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-preset medium',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p'
      ])

    if (videoBitrate !== '0') {
      command = command.videoBitrate(videoBitrate)
    }

    command.on('progress', (progress) => {
      if (onProgress) {
        onProgress({
          percent: progress.percent || 0,
          currentTime: progress.timemark ? parseTimemark(progress.timemark) : 0,
          totalTime: inputMetadata.duration,
          fps: progress.currentFps || 0,
          speed: 0,
          size: progress.targetSize || 0
        })
      }
    })

    command.on('error', (err) => {
      logger.error('Compression error', { error: err.message })
      reject(err)
    })

    command.on('end', async () => {
      try {
        const outputMetadata = await getVideoMetadata(outputPath)

        const compression: CompressionResult = {
          inputSize: inputMetadata.fileSize,
          outputSize: outputMetadata.fileSize,
          compressionRatio: inputMetadata.fileSize / outputMetadata.fileSize,
          savedBytes: inputMetadata.fileSize - outputMetadata.fileSize,
          savedPercentage: ((inputMetadata.fileSize - outputMetadata.fileSize) / inputMetadata.fileSize) * 100
        }

        logger.info('Video compressed', {
          inputSize: formatFileSize(inputMetadata.fileSize),
          outputSize: formatFileSize(outputMetadata.fileSize),
          savedPercentage: compression.savedPercentage.toFixed(1)
        })

        resolve({
          success: true,
          outputPath,
          compression
        })
      } catch (error) {
        reject(error)
      }
    })

    command.run()
  })
}

/**
 * Concatenate multiple videos
 */
export async function concatenateVideos(
  inputPaths: string[],
  outputPath: string,
  options?: {
    transition?: 'none' | 'fade' | 'dissolve'
    transitionDuration?: number
  }
): Promise<string> {

  logger.info('Concatenating videos', {
    inputCount: inputPaths.length,
    outputPath,
    transition: options?.transition || 'none'
  })

  // Create a temporary file list for concat demuxer
  const listPath = outputPath.replace(/\.[^/.]+$/, '_list.txt')
  const listContent = inputPaths.map(p => `file '${p}'`).join('\n')
  await fs.writeFile(listPath, listContent)

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    let command = ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .output(outputPath)
      .outputOptions([
        '-c copy' // Copy streams without re-encoding for speed
      ])

    command.on('error', async (err) => {
      await fs.unlink(listPath).catch(() => {})
      logger.error('Concatenation error', { error: err.message })
      reject(err)
    })

    command.on('end', async () => {
      await fs.unlink(listPath).catch(() => {})
      logger.info('Videos concatenated', { outputPath })
      resolve(outputPath)
    })

    command.run()
  })
}

/**
 * Add watermark to video
 */
export async function addWatermark(
  inputPath: string,
  outputPath: string,
  watermarkPath: string,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right',
  opacity: number = 0.7
): Promise<string> {

  logger.info('Adding watermark', {
    inputPath,
    outputPath,
    watermarkPath,
    position
  })

  const positionMap = {
    'top-left': 'x=10:y=10',
    'top-right': 'x=W-w-10:y=10',
    'bottom-left': 'x=10:y=H-h-10',
    'bottom-right': 'x=W-w-10:y=H-h-10',
    'center': 'x=(W-w)/2:y=(H-h)/2'
  }

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .input(watermarkPath)
      .complexFilter([
        `[1:v]format=rgba,colorchannelmixer=aa=${opacity}[wm]`,
        `[0:v][wm]overlay=${positionMap[position]}`
      ])
      .output(outputPath)
      .outputOptions(['-c:a copy'])
      .on('error', (err) => {
        logger.error('Watermark error', { error: err.message })
        reject(err)
      })
      .on('end', () => {
        logger.info('Watermark added', { outputPath })
        resolve(outputPath)
      })
      .run()
  })
}

/**
 * Trim video to specific duration
 */
export async function trimVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<string> {

  logger.info('Trimming video', {
    inputPath,
    outputPath,
    startTime,
    duration
  })

  const ffmpeg = await getFFmpeg()
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(startTime)
      .duration(duration)
      .output(outputPath)
      .outputOptions(['-c copy']) // Copy without re-encoding
      .on('error', (err) => {
        logger.error('Trim error', { error: err.message })
        reject(err)
      })
      .on('end', () => {
        logger.info('Video trimmed', { outputPath })
        resolve(outputPath)
      })
      .run()
  })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse FFmpeg timemark to seconds
 */
function parseTimemark(timemark: string): number {
  const parts = timemark.split(':')
  if (parts.length === 3) {
    const hours = parseFloat(parts[0])
    const minutes = parseFloat(parts[1])
    const seconds = parseFloat(parts[2])
    return hours * 3600 + minutes * 60 + seconds
  }
  return 0
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpegAvailability(): Promise<boolean> {
  try {
    const ffmpeg = await getFFmpeg()
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err: any, formats: any) => {
        if (err) {
          logger.error('FFmpeg not available', { error: err.message })
          resolve(false)
        } else {
          logger.info('FFmpeg available', { formatCount: Object.keys(formats).length })
          resolve(true)
        }
      })
    })
  } catch {
    return false
  }
}

/**
 * Get supported codecs
 */
export async function getSupportedCodecs(): Promise<{ video: string[]; audio: string[] }> {
  try {
    const ffmpeg = await getFFmpeg()
    return new Promise((resolve) => {
      ffmpeg.getAvailableCodecs((err: any, codecs: any) => {
        if (err) {
          resolve({ video: [], audio: [] })
          return
        }

        const video: string[] = []
        const audio: string[] = []

        for (const [name, info] of Object.entries(codecs) as [string, any][]) {
          if (info.canEncode) {
            if (info.type === 'video') video.push(name)
            if (info.type === 'audio') audio.push(name)
          }
        }

        resolve({ video, audio })
      })
    })
  } catch {
    return { video: [], audio: [] }
  }
}

export default {
  getVideoMetadata,
  exportVideo,
  generateThumbnails,
  generateAnimatedThumbnail,
  extractAudio,
  compressVideo,
  concatenateVideos,
  addWatermark,
  trimVideo,
  checkFFmpegAvailability,
  getSupportedCodecs
}
