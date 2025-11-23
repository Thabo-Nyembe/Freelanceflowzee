/**
 * Screen Recorder Service
 *
 * Handles screen recording, webcam recording, and combined recording
 * using MediaRecorder API with support for multiple formats and quality settings.
 *
 * Based on FreeFlow User Manual - Video Studio Recording System
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ScreenRecorder')

// ==================== TYPE DEFINITIONS ====================

export interface RecordingOptions {
  type: 'screen' | 'webcam' | 'both' | 'audio'
  quality: '720p' | '1080p' | '4k'
  frameRate: 24 | 30 | 60
  audioEnabled: boolean
  videoCodec?: string
  audioBitrate?: number
  videoBitrate?: number
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number // seconds
  fileSize: number // bytes
  recordedChunks: Blob[]
}

export interface RecordingMetadata {
  startTime: Date
  endTime?: Date
  duration: number
  resolution: string
  frameRate: number
  fileSize: number
  format: string
  type: 'screen' | 'webcam' | 'both' | 'audio'
}

export type RecordingCallback = (blob: Blob, metadata: RecordingMetadata) => void
export type ProgressCallback = (state: RecordingState) => void
export type ErrorCallback = (error: Error) => void

// ==================== SCREEN RECORDER CLASS ====================

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private screenStream: MediaStream | null = null
  private webcamStream: MediaStream | null = null
  private audioStream: MediaStream | null = null
  private combinedStream: MediaStream | null = null

  private recordedChunks: Blob[] = []
  private startTime: Date | null = null
  private durationInterval: NodeJS.Timeout | null = null
  private currentDuration = 0

  private options: RecordingOptions
  private onComplete: RecordingCallback | null = null
  private onProgress: ProgressCallback | null = null
  private onError: ErrorCallback | null = null

  constructor(options: Partial<RecordingOptions> = {}) {
    this.options = {
      type: options.type || 'screen',
      quality: options.quality || '1080p',
      frameRate: options.frameRate || 30,
      audioEnabled: options.audioEnabled !== false,
      videoCodec: options.videoCodec || 'video/webm;codecs=vp9',
      audioBitrate: options.audioBitrate || 128000,
      videoBitrate: options.videoBitrate || 2500000
    }

    logger.info('ScreenRecorder initialized', {
      type: this.options.type,
      quality: this.options.quality,
      frameRate: this.options.frameRate
    })
  }

  /**
   * Check if browser supports screen recording
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia &&
      typeof MediaRecorder !== 'undefined'
    )
  }

  /**
   * Get supported MIME types
   */
  static getSupportedMimeTypes(): string[] {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ]

    return types.filter(type => MediaRecorder.isTypeSupported(type))
  }

  /**
   * Start recording
   */
  async startRecording(
    onComplete?: RecordingCallback,
    onProgress?: ProgressCallback,
    onError?: ErrorCallback
  ): Promise<void> {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        throw new Error('Recording already in progress')
      }

      this.onComplete = onComplete || null
      this.onProgress = onProgress || null
      this.onError = onError || null

      logger.info('Starting recording', {
        type: this.options.type,
        quality: this.options.quality
      })

      // Get media streams based on recording type
      await this.getMediaStreams()

      // Combine streams if needed
      this.setupCombinedStream()

      // Initialize MediaRecorder
      this.initializeMediaRecorder()

      // Start recording
      this.mediaRecorder!.start(1000) // Collect data every second
      this.startTime = new Date()
      this.currentDuration = 0
      this.recordedChunks = []

      // Start duration counter
      this.startDurationCounter()

      logger.info('Recording started successfully', {
        startTime: this.startTime.toISOString()
      })

    } catch (error: any) {
      logger.error('Failed to start recording', {
        error: error.message,
        stack: error.stack
      })

      this.cleanup()

      if (this.onError) {
        this.onError(error)
      }

      throw error
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No recording in progress'))
        return
      }

      logger.info('Stopping recording', {
        duration: this.currentDuration
      })

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.recordedChunks, {
            type: this.options.videoCodec
          })

          const metadata: RecordingMetadata = {
            startTime: this.startTime!,
            endTime: new Date(),
            duration: this.currentDuration,
            resolution: this.getResolution(),
            frameRate: this.options.frameRate,
            fileSize: blob.size,
            format: this.options.videoCodec!,
            type: this.options.type
          }

          logger.info('Recording stopped successfully', {
            duration: metadata.duration,
            fileSize: metadata.fileSize,
            format: metadata.format
          })

          if (this.onComplete) {
            this.onComplete(blob, metadata)
          }

          this.cleanup()
          resolve(blob)

        } catch (error: any) {
          logger.error('Failed to process recorded data', { error: error.message })
          this.cleanup()
          reject(error)
        }
      }

      this.mediaRecorder.stop()
      this.stopDurationCounter()
    })
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      this.stopDurationCounter()

      logger.info('Recording paused', {
        duration: this.currentDuration
      })
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      this.startDurationCounter()

      logger.info('Recording resumed', {
        duration: this.currentDuration
      })
    }
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return {
      isRecording: this.mediaRecorder?.state === 'recording',
      isPaused: this.mediaRecorder?.state === 'paused',
      duration: this.currentDuration,
      fileSize: this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0),
      recordedChunks: this.recordedChunks
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async getMediaStreams(): Promise<void> {
    const { type, audioEnabled, quality, frameRate } = this.options

    // Get screen stream
    if (type === 'screen' || type === 'both') {
      const constraints: DisplayMediaStreamConstraints = {
        video: {
          ...this.getVideoConstraints(quality, frameRate),
          cursor: 'always' as any
        },
        audio: audioEnabled
      }

      this.screenStream = await navigator.mediaDevices.getDisplayMedia(constraints)

      logger.info('Screen stream acquired', {
        tracks: this.screenStream.getTracks().length
      })
    }

    // Get webcam stream
    if (type === 'webcam' || type === 'both') {
      const constraints: MediaStreamConstraints = {
        video: this.getVideoConstraints(quality, frameRate),
        audio: audioEnabled && type === 'webcam' // Only use webcam audio if webcam-only
      }

      this.webcamStream = await navigator.mediaDevices.getUserMedia(constraints)

      logger.info('Webcam stream acquired', {
        tracks: this.webcamStream.getTracks().length
      })
    }

    // Get audio stream
    if (type === 'audio' || (audioEnabled && type === 'both')) {
      if (type === 'audio') {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        })
      }
    }
  }

  private setupCombinedStream(): void {
    const tracks: MediaStreamTrack[] = []

    // Add video tracks
    if (this.screenStream) {
      tracks.push(...this.screenStream.getVideoTracks())
    }

    if (this.webcamStream) {
      tracks.push(...this.webcamStream.getVideoTracks())
    }

    // Add audio tracks
    if (this.screenStream) {
      tracks.push(...this.screenStream.getAudioTracks())
    }

    if (this.webcamStream && this.options.type === 'webcam') {
      tracks.push(...this.webcamStream.getAudioTracks())
    }

    if (this.audioStream) {
      tracks.push(...this.audioStream.getAudioTracks())
    }

    this.combinedStream = new MediaStream(tracks)

    logger.info('Combined stream created', {
      videoTracks: this.combinedStream.getVideoTracks().length,
      audioTracks: this.combinedStream.getAudioTracks().length
    })
  }

  private initializeMediaRecorder(): void {
    if (!this.combinedStream) {
      throw new Error('No media stream available')
    }

    const options: MediaRecorderOptions = {
      mimeType: this.options.videoCodec,
      videoBitsPerSecond: this.options.videoBitrate,
      audioBitsPerSecond: this.options.audioBitrate
    }

    this.mediaRecorder = new MediaRecorder(this.combinedStream, options)

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data)

        // Update progress
        if (this.onProgress) {
          this.onProgress(this.getState())
        }
      }
    }

    this.mediaRecorder.onerror = (event: any) => {
      const error = new Error(event.error?.message || 'MediaRecorder error')
      logger.error('MediaRecorder error', { error: error.message })

      if (this.onError) {
        this.onError(error)
      }
    }

    logger.info('MediaRecorder initialized', {
      mimeType: options.mimeType,
      videoBitrate: options.videoBitsPerSecond,
      audioBitrate: options.audioBitsPerSecond
    })
  }

  private startDurationCounter(): void {
    this.durationInterval = setInterval(() => {
      this.currentDuration++

      if (this.onProgress) {
        this.onProgress(this.getState())
      }
    }, 1000)
  }

  private stopDurationCounter(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval)
      this.durationInterval = null
    }
  }

  private cleanup(): void {
    // Stop all tracks
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }

    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop())
      this.webcamStream = null
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }

    if (this.combinedStream) {
      this.combinedStream.getTracks().forEach(track => track.stop())
      this.combinedStream = null
    }

    this.stopDurationCounter()
    this.mediaRecorder = null

    logger.info('Cleanup complete')
  }

  private getVideoConstraints(quality: string, frameRate: number): MediaTrackConstraints {
    const resolutions = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 }
    }

    const resolution = resolutions[quality as keyof typeof resolutions] || resolutions['1080p']

    return {
      width: { ideal: resolution.width },
      height: { ideal: resolution.height },
      frameRate: { ideal: frameRate }
    }
  }

  private getResolution(): string {
    if (this.screenStream) {
      const videoTrack = this.screenStream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()
      return `${settings.width}x${settings.height}`
    }

    if (this.webcamStream) {
      const videoTrack = this.webcamStream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()
      return `${settings.width}x${settings.height}`
    }

    return this.options.quality
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Download recorded blob as file
 */
export function downloadRecording(blob: Blob, filename: string = 'recording.webm'): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)

  logger.info('Recording downloaded', {
    filename,
    size: blob.size
  })
}

/**
 * Format duration in HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [hours, minutes, secs]
    .map(val => val.toString().padStart(2, '0'))
    .join(':')
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get estimated file size per minute
 */
export function getEstimatedSizePerMinute(quality: string, frameRate: number): number {
  const bitrates = {
    '720p_24': 1.5,
    '720p_30': 2,
    '720p_60': 3,
    '1080p_24': 3,
    '1080p_30': 4,
    '1080p_60': 6,
    '4k_24': 8,
    '4k_30': 12,
    '4k_60': 20
  }

  const key = `${quality}_${frameRate}` as keyof typeof bitrates
  const mbPerMinute = bitrates[key] || 4

  return mbPerMinute * 1024 * 1024 // Return in bytes
}
