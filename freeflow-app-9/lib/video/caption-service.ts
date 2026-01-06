/**
 * Video Caption Service
 *
 * Automatic transcription and caption generation using OpenAI Whisper
 * Supports SRT, VTT, and JSON output formats
 */

import OpenAI from 'openai'
import { createFeatureLogger } from '@/lib/logger'
import { extractAudio } from './ffmpeg-processor'
import fs from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import { runtimeFilePath, basename, extname } from '@/lib/utils/runtime-path'

const logger = createFeatureLogger('CaptionService')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionSegment {
  id: number
  start: number           // Start time in seconds
  end: number             // End time in seconds
  text: string
  confidence?: number
}

export interface TranscriptionResult {
  text: string            // Full transcription text
  segments: TranscriptionSegment[]
  language: string
  duration: number
  wordCount: number
}

export interface CaptionOptions {
  language?: string       // ISO language code (e.g., 'en', 'es', 'fr')
  format?: 'srt' | 'vtt' | 'json'
  maxLineLength?: number  // Maximum characters per line
  maxLines?: number       // Maximum lines per caption (default: 2)
  prompt?: string         // Optional prompt to improve accuracy
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Transcribe video/audio using OpenAI Whisper
 */
export async function transcribeVideo(
  videoPath: string,
  options?: CaptionOptions
): Promise<TranscriptionResult> {

  logger.info('Starting transcription', {
    videoPath,
    language: options?.language || 'auto'
  })

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.')
  }

  // Extract audio from video (Whisper works better with audio-only files)
  const tempAudioPath = videoPath.replace(/\.[^/.]+$/, '_temp_audio.mp3')

  try {
    logger.debug('Extracting audio from video')

    await extractAudio(videoPath, tempAudioPath, {
      codec: 'mp3',
      bitrate: '64k',  // Lower bitrate is fine for speech
      sampleRate: 16000  // Whisper's preferred sample rate
    })

    // Check file size (Whisper has 25MB limit)
    const stats = await fs.stat(tempAudioPath)
    const fileSizeMB = stats.size / (1024 * 1024)

    if (fileSizeMB > 25) {
      throw new Error(`Audio file too large (${fileSizeMB.toFixed(1)}MB). Maximum is 25MB. Consider splitting the video.`)
    }

    logger.debug('Audio extracted', { sizeMB: fileSizeMB.toFixed(2) })

    // Create file stream for upload
    const audioFile = createReadStream(tempAudioPath)

    // Call Whisper API with verbose_json to get segments
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: options?.language,
      prompt: options?.prompt,
      timestamp_granularities: ['segment']
    })

    // Parse response
    const result: TranscriptionResult = {
      text: transcription.text,
      segments: parseWhisperSegments(transcription),
      language: transcription.language || options?.language || 'en',
      duration: transcription.duration || 0,
      wordCount: transcription.text.split(/\s+/).length
    }

    logger.info('Transcription completed', {
      language: result.language,
      duration: result.duration,
      segmentCount: result.segments.length,
      wordCount: result.wordCount
    })

    return result

  } finally {
    // Clean up temp audio file
    try {
      if (existsSync(tempAudioPath)) {
        await fs.unlink(tempAudioPath)
      }
    } catch (err) {
      logger.warn('Failed to clean up temp audio file', { path: tempAudioPath })
    }
  }
}

/**
 * Generate captions file from transcription
 */
export async function generateCaptions(
  transcription: TranscriptionResult,
  outputPath: string,
  options?: CaptionOptions
): Promise<string> {

  const format = options?.format || 'srt'

  logger.info('Generating captions', {
    format,
    segmentCount: transcription.segments.length,
    outputPath
  })

  let content: string

  switch (format) {
    case 'srt':
      content = generateSRT(transcription.segments, options)
      break
    case 'vtt':
      content = generateVTT(transcription.segments, options)
      break
    case 'json':
      content = JSON.stringify({
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments
      }, null, 2)
      break
    default:
      throw new Error(`Unsupported format: ${format}`)
  }

  // Write to file
  await fs.writeFile(outputPath, content, 'utf-8')

  logger.info('Captions generated', {
    format,
    outputPath,
    sizeBytes: content.length
  })

  return outputPath
}

/**
 * Transcribe and generate captions in one step
 */
export async function createCaptions(
  videoPath: string,
  outputDir: string,
  options?: CaptionOptions
): Promise<{
  transcription: TranscriptionResult
  captionPath: string
  format: string
}> {

  // Transcribe video
  const transcription = await transcribeVideo(videoPath, options)

  // Generate caption filename
  const format = options?.format || 'srt'
  const baseName = basename(videoPath, extname(videoPath))
  const captionPath = runtimeFilePath(outputDir, baseName, format)

  // Generate captions
  await generateCaptions(transcription, captionPath, options)

  return {
    transcription,
    captionPath,
    format
  }
}

// ============================================================================
// Format Generators
// ============================================================================

/**
 * Generate SRT format captions
 */
function generateSRT(
  segments: TranscriptionSegment[],
  options?: CaptionOptions
): string {

  const maxLineLength = options?.maxLineLength || 42
  const maxLines = options?.maxLines || 2

  const lines: string[] = []

  segments.forEach((segment, index) => {
    // Sequence number
    lines.push(String(index + 1))

    // Timestamps (format: 00:00:00,000 --> 00:00:00,000)
    const startTime = formatTimeSRT(segment.start)
    const endTime = formatTimeSRT(segment.end)
    lines.push(`${startTime} --> ${endTime}`)

    // Text (word-wrapped)
    const wrappedText = wrapText(segment.text, maxLineLength, maxLines)
    lines.push(wrappedText)

    // Blank line separator
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Generate WebVTT format captions
 */
function generateVTT(
  segments: TranscriptionSegment[],
  options?: CaptionOptions
): string {

  const maxLineLength = options?.maxLineLength || 42
  const maxLines = options?.maxLines || 2

  const lines: string[] = ['WEBVTT', '']

  segments.forEach((segment, index) => {
    // Optional cue identifier
    lines.push(`${index + 1}`)

    // Timestamps (format: 00:00:00.000 --> 00:00:00.000)
    const startTime = formatTimeVTT(segment.start)
    const endTime = formatTimeVTT(segment.end)
    lines.push(`${startTime} --> ${endTime}`)

    // Text (word-wrapped)
    const wrappedText = wrapText(segment.text, maxLineLength, maxLines)
    lines.push(wrappedText)

    // Blank line separator
    lines.push('')
  })

  return lines.join('\n')
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse Whisper API response into segments
 */
function parseWhisperSegments(response: any): TranscriptionSegment[] {
  if (!response.segments || !Array.isArray(response.segments)) {
    // If no segments, create one from full text
    return [{
      id: 1,
      start: 0,
      end: response.duration || 0,
      text: response.text || ''
    }]
  }

  return response.segments.map((seg: any, index: number) => ({
    id: index + 1,
    start: seg.start || 0,
    end: seg.end || 0,
    text: (seg.text || '').trim(),
    confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined
  }))
}

/**
 * Format time for SRT (00:00:00,000)
 */
function formatTimeSRT(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':') + ',' + ms.toString().padStart(3, '0')
}

/**
 * Format time for VTT (00:00:00.000)
 */
function formatTimeVTT(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':') + '.' + ms.toString().padStart(3, '0')
}

/**
 * Wrap text to fit within line length limits
 */
function wrapText(text: string, maxLength: number, maxLines: number): string {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }

    // Stop if we've reached max lines
    if (lines.length >= maxLines) {
      // Add remaining text to last line
      const remaining = words.slice(words.indexOf(word)).join(' ')
      lines[lines.length - 1] = remaining.slice(0, maxLength * 2)
      break
    }
  }

  // Add final line
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  return lines.join('\n')
}

/**
 * Translate captions to another language
 */
export async function translateCaptions(
  transcription: TranscriptionResult,
  targetLanguage: string
): Promise<TranscriptionResult> {

  logger.info('Translating captions', {
    sourceLanguage: transcription.language,
    targetLanguage,
    segmentCount: transcription.segments.length
  })

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured for translation')
  }

  // Translate in batches to avoid token limits
  const batchSize = 20
  const translatedSegments: TranscriptionSegment[] = []

  for (let i = 0; i < transcription.segments.length; i += batchSize) {
    const batch = transcription.segments.slice(i, i + batchSize)

    const textsToTranslate = batch.map(s => s.text).join('\n---\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text segments from ${transcription.language} to ${targetLanguage}. Maintain the same tone and style. Each segment is separated by "---". Return the translations in the same format, separated by "---".`
        },
        {
          role: 'user',
          content: textsToTranslate
        }
      ],
      temperature: 0.3
    })

    const translatedText = completion.choices[0]?.message?.content || ''
    const translations = translatedText.split('---').map(t => t.trim())

    batch.forEach((segment, index) => {
      translatedSegments.push({
        ...segment,
        text: translations[index] || segment.text
      })
    })
  }

  logger.info('Translation completed', {
    targetLanguage,
    segmentCount: translatedSegments.length
  })

  return {
    ...transcription,
    language: targetLanguage,
    segments: translatedSegments,
    text: translatedSegments.map(s => s.text).join(' ')
  }
}

/**
 * Burn captions into video (hardcode subtitles)
 */
export async function burnCaptions(
  videoPath: string,
  captionPath: string,
  outputPath: string,
  options?: {
    fontName?: string
    fontSize?: number
    fontColor?: string
    backgroundColor?: string
    position?: 'bottom' | 'top'
    marginV?: number
  }
): Promise<string> {

  logger.info('Burning captions into video', {
    videoPath,
    captionPath,
    outputPath
  })

  // Import FFmpeg dynamically to avoid issues
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

  const fontName = options?.fontName || 'Arial'
  const fontSize = options?.fontSize || 24
  const fontColor = options?.fontColor || 'white'
  const backgroundColor = options?.backgroundColor || '&H80000000' // Semi-transparent black
  const marginV = options?.marginV || 30

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf subtitles=${captionPath}:force_style='FontName=${fontName},FontSize=${fontSize},PrimaryColour=${fontColor},BackColour=${backgroundColor},MarginV=${marginV}'`
      ])
      .output(outputPath)
      .on('error', (err) => {
        logger.error('Caption burn error', { error: err.message })
        reject(err)
      })
      .on('end', () => {
        logger.info('Captions burned into video', { outputPath })
        resolve(outputPath)
      })
      .run()
  })
}

/**
 * Check if Whisper API is available
 */
export async function checkWhisperAvailability(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    return false
  }

  try {
    // Simple check - just verify API key works
    await openai.models.list()
    return true
  } catch {
    return false
  }
}

export default {
  transcribeVideo,
  generateCaptions,
  createCaptions,
  translateCaptions,
  burnCaptions,
  checkWhisperAvailability
}
