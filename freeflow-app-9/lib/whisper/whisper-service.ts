/**
 * Whisper Transcription Service
 *
 * Server-side audio transcription using OpenAI Whisper API
 * Supports multiple languages, timestamps, and caption formats
 */

import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionSegment {
  id: number
  start: number // seconds
  end: number // seconds
  text: string
  confidence?: number
  words?: Array<{
    word: string
    start: number
    end: number
    confidence?: number
  }>
}

export interface TranscriptionResult {
  id: string
  text: string
  language: string
  duration: number
  segments: TranscriptionSegment[]
  words?: Array<{
    word: string
    start: number
    end: number
  }>
}

export interface TranscriptionJob {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  inputPath?: string
  result?: TranscriptionResult
  error?: string
  language?: string
  options: TranscriptionOptions
  createdAt: Date
  completedAt?: Date
}

export interface TranscriptionOptions {
  language?: string // ISO 639-1 code or 'auto'
  prompt?: string // Context/prompt for better accuracy
  responseFormat?: 'json' | 'text' | 'srt' | 'vtt' | 'verbose_json'
  temperature?: number // 0-1, lower = more deterministic
  timestampGranularity?: 'word' | 'segment'
  maxSegmentLength?: number // Max characters per segment for captions
}

export interface CaptionStyle {
  maxCharsPerLine: number
  maxLines: number
  minDuration: number // seconds
  maxDuration: number // seconds
  position: 'bottom' | 'top'
  alignment: 'left' | 'center' | 'right'
  fontFamily?: string
  fontSize?: number
  color?: string
  backgroundColor?: string
  opacity?: number
}

// ============================================================================
// Configuration
// ============================================================================

const TEMP_DIR = process.env.WHISPER_TEMP_DIR || '/tmp/whisper'
const SUPPORTED_AUDIO_FORMATS = [
  'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg', 'flac'
]
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (OpenAI limit)

// Default caption styling
const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  maxCharsPerLine: 42,
  maxLines: 2,
  minDuration: 1,
  maxDuration: 7,
  position: 'bottom',
  alignment: 'center',
}

// ============================================================================
// Job Store (in-memory, replace with database in production)
// ============================================================================

const transcriptionJobs = new Map<string, TranscriptionJob>()

// ============================================================================
// Whisper Service Class
// ============================================================================

export class WhisperService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Create a new transcription job
   */
  async createJob(
    userId: string,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionJob> {
    const job: TranscriptionJob = {
      id: uuidv4(),
      userId,
      status: 'pending',
      progress: 0,
      options: {
        language: 'auto',
        responseFormat: 'verbose_json',
        temperature: 0,
        timestampGranularity: 'segment',
        ...options,
      },
      createdAt: new Date(),
    }

    transcriptionJobs.set(job.id, job)
    return job
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): TranscriptionJob | undefined {
    return transcriptionJobs.get(jobId)
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): TranscriptionJob[] {
    return Array.from(transcriptionJobs.values())
      .filter((job) => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Transcribe audio from file path
   */
  async transcribeFile(
    jobId: string,
    filePath: string,
    onProgress?: (progress: number) => void
  ): Promise<TranscriptionResult> {
    const job = transcriptionJobs.get(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    try {
      job.status = 'processing'
      job.inputPath = filePath
      job.progress = 10
      onProgress?.(10)

      // Validate file
      const stats = await fs.stat(filePath)
      if (stats.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      }

      const ext = path.extname(filePath).slice(1).toLowerCase()
      if (!SUPPORTED_AUDIO_FORMATS.includes(ext)) {
        throw new Error(`Unsupported format: ${ext}. Supported: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`)
      }

      job.progress = 20
      onProgress?.(20)

      // Read file
      const fileBuffer = await fs.readFile(filePath)
      const file = new File([fileBuffer], path.basename(filePath), {
        type: this.getMimeType(ext),
      })

      job.progress = 30
      onProgress?.(30)

      // Call OpenAI Whisper API
      const response = await this.openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: job.options.language === 'auto' ? undefined : job.options.language,
        prompt: job.options.prompt,
        response_format: job.options.responseFormat as 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt' | undefined,
        temperature: job.options.temperature,
        timestamp_granularities: job.options.timestampGranularity === 'word'
          ? ['word', 'segment']
          : ['segment'],
      })

      job.progress = 80
      onProgress?.(80)

      // Parse response
      const result = this.parseTranscriptionResponse(response, job.id)

      job.progress = 100
      job.status = 'completed'
      job.result = result
      job.language = result.language
      job.completedAt = new Date()
      onProgress?.(100)

      return result
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
      throw error
    }
  }

  /**
   * Transcribe audio from buffer
   */
  async transcribeBuffer(
    jobId: string,
    buffer: Buffer,
    filename: string,
    onProgress?: (progress: number) => void
  ): Promise<TranscriptionResult> {
    // Save to temp file
    await fs.mkdir(TEMP_DIR, { recursive: true })
    const tempPath = path.join(TEMP_DIR, `${jobId}-${filename}`)
    await fs.writeFile(tempPath, buffer)

    try {
      return await this.transcribeFile(jobId, tempPath, onProgress)
    } finally {
      // Cleanup temp file
      try {
        await fs.unlink(tempPath)
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Parse OpenAI response into TranscriptionResult
   */
  private parseTranscriptionResponse(
    response: OpenAI.Audio.Transcription,
    jobId: string
  ): TranscriptionResult {
    // Handle verbose_json format
    if (typeof response === 'object' && 'segments' in response) {
      const verboseResponse = response as unknown as {
        text: string
        language: string
        duration: number
        segments: Array<{
          id: number
          start: number
          end: number
          text: string
          avg_logprob?: number
          words?: Array<{ word: string; start: number; end: number }>
        }>
        words?: Array<{ word: string; start: number; end: number }>
      }

      return {
        id: jobId,
        text: verboseResponse.text,
        language: verboseResponse.language || 'en',
        duration: verboseResponse.duration || 0,
        segments: verboseResponse.segments.map((seg) => ({
          id: seg.id,
          start: seg.start,
          end: seg.end,
          text: seg.text.trim(),
          confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : undefined,
          words: seg.words,
        })),
        words: verboseResponse.words,
      }
    }

    // Handle plain text response
    return {
      id: jobId,
      text: typeof response === 'string' ? response : response.text,
      language: 'en',
      duration: 0,
      segments: [{
        id: 0,
        start: 0,
        end: 0,
        text: typeof response === 'string' ? response : response.text,
      }],
    }
  }

  /**
   * Get MIME type from extension
   */
  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      mp4: 'audio/mp4',
      mpeg: 'audio/mpeg',
      mpga: 'audio/mpeg',
      m4a: 'audio/mp4',
      wav: 'audio/wav',
      webm: 'audio/webm',
      ogg: 'audio/ogg',
      flac: 'audio/flac',
    }
    return mimeTypes[ext] || 'audio/mpeg'
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<void> {
    const job = transcriptionJobs.get(jobId)
    if (job?.inputPath) {
      try {
        await fs.unlink(job.inputPath)
      } catch {
        // Ignore deletion errors
      }
    }
    transcriptionJobs.delete(jobId)
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'auto', name: 'Auto-detect' },
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'tr', name: 'Turkish' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'th', name: 'Thai' },
      { code: 'sv', name: 'Swedish' },
      { code: 'da', name: 'Danish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'fi', name: 'Finnish' },
      { code: 'he', name: 'Hebrew' },
      { code: 'uk', name: 'Ukrainian' },
      { code: 'cs', name: 'Czech' },
      { code: 'el', name: 'Greek' },
      { code: 'ro', name: 'Romanian' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ms', name: 'Malay' },
    ]
  }
}

// ============================================================================
// Caption Generation Functions
// ============================================================================

/**
 * Format seconds to SRT timestamp
 */
export function formatSRTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
}

/**
 * Format seconds to VTT timestamp
 */
export function formatVTTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

/**
 * Split text into lines respecting word boundaries
 */
export function splitIntoLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (lines.length >= maxLines) break

    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Process segments into caption-friendly segments
 */
export function processCaptionSegments(
  segments: TranscriptionSegment[],
  style: CaptionStyle = DEFAULT_CAPTION_STYLE
): TranscriptionSegment[] {
  const processedSegments: TranscriptionSegment[] = []
  let currentSegment: TranscriptionSegment | null = null

  for (const segment of segments) {
    const text = segment.text.trim()
    if (!text) continue

    // Split into lines
    const lines = splitIntoLines(
      text,
      style.maxCharsPerLine,
      style.maxLines
    )
    const formattedText = lines.join('\n')

    const duration = segment.end - segment.start

    // If duration is too short, merge with next
    if (duration < style.minDuration && currentSegment) {
      currentSegment.end = segment.end
      currentSegment.text += ' ' + text
      continue
    }

    // If duration is too long, split the segment
    if (duration > style.maxDuration) {
      const words = text.split(' ')
      const wordsPerSegment = Math.ceil(words.length / Math.ceil(duration / style.maxDuration))
      const durationPerWord = duration / words.length

      for (let i = 0; i < words.length; i += wordsPerSegment) {
        const segmentWords = words.slice(i, i + wordsPerSegment)
        const segmentStart = segment.start + i * durationPerWord
        const segmentEnd = segment.start + Math.min(i + wordsPerSegment, words.length) * durationPerWord

        processedSegments.push({
          id: processedSegments.length,
          start: segmentStart,
          end: segmentEnd,
          text: splitIntoLines(
            segmentWords.join(' '),
            style.maxCharsPerLine,
            style.maxLines
          ).join('\n'),
        })
      }
      continue
    }

    // Finalize current segment
    if (currentSegment) {
      processedSegments.push(currentSegment)
    }

    currentSegment = {
      id: processedSegments.length,
      start: segment.start,
      end: segment.end,
      text: formattedText,
    }
  }

  // Add final segment
  if (currentSegment) {
    processedSegments.push(currentSegment)
  }

  return processedSegments
}

/**
 * Generate SRT format captions
 */
export function generateSRT(
  segments: TranscriptionSegment[],
  style?: CaptionStyle
): string {
  const processed = style ? processCaptionSegments(segments, style) : segments

  return processed
    .map((segment, index) => {
      const startTime = formatSRTTimestamp(segment.start)
      const endTime = formatSRTTimestamp(segment.end)
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`
    })
    .join('\n')
}

/**
 * Generate VTT format captions
 */
export function generateVTT(
  segments: TranscriptionSegment[],
  style?: CaptionStyle
): string {
  const processed = style ? processCaptionSegments(segments, style) : segments

  const cues = processed
    .map((segment) => {
      const startTime = formatVTTTimestamp(segment.start)
      const endTime = formatVTTTimestamp(segment.end)
      return `${startTime} --> ${endTime}\n${segment.text}`
    })
    .join('\n\n')

  return `WEBVTT\n\n${cues}\n`
}

/**
 * Generate JSON format captions
 */
export function generateJSON(
  result: TranscriptionResult,
  style?: CaptionStyle
): string {
  const processed = style
    ? processCaptionSegments(result.segments, style)
    : result.segments

  return JSON.stringify({
    ...result,
    segments: processed,
  }, null, 2)
}

/**
 * Generate ASS/SSA format captions (for styled captions)
 */
export function generateASS(
  segments: TranscriptionSegment[],
  style: CaptionStyle = DEFAULT_CAPTION_STYLE,
  videoWidth: number = 1920,
  videoHeight: number = 1080
): string {
  const processed = processCaptionSegments(segments, style)

  // ASS header
  const header = `[Script Info]
Title: Auto-generated Captions
ScriptType: v4.00+
WrapStyle: 0
PlayResX: ${videoWidth}
PlayResY: ${videoHeight}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily || 'Arial'},${style.fontSize || 48},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,${style.alignment === 'left' ? 1 : style.alignment === 'right' ? 3 : 2},10,10,${style.position === 'top' ? 10 : 50},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`

  // Format time for ASS (h:mm:ss.cc)
  const formatASSTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const centisecs = Math.round((seconds % 1) * 100)

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
  }

  // Generate dialogue events
  const events = processed
    .map((segment) => {
      const start = formatASSTime(segment.start)
      const end = formatASSTime(segment.end)
      const text = segment.text.replace(/\n/g, '\\N')
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`
    })
    .join('\n')

  return header + events + '\n'
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const whisperService = new WhisperService()
