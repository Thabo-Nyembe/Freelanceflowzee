import { toast } from '@/components/ui/use-toast'

export interface KeyMoment {
  timestamp: number
  type: 'highlight' | 'key_point' | 'engagement_peak' | 'gesture' | 'transition'
  confidence: number
  description: string
  thumbnail?: string
}

export interface HighlightSegment {
  startTime: number
  endTime: number
  type: 'highlight' | 'summary'
  title: string
  description: string
  confidence: number
  thumbnail?: string
}

export class HighlightDetectionService {
  private audioContext: AudioContext | null = null
  private analyzer: AnalyserNode | null = null
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private keyMoments: KeyMoment[] = []
  private isProcessing = false
  private processingInterval: NodeJS.Timeout | null = null

  private readonly ANALYSIS_INTERVAL = 1000 // 1 second
  private readonly ENERGY_THRESHOLD = 0.3
  private readonly ENGAGEMENT_THRESHOLD = 0.7
  private readonly MIN_HIGHLIGHT_DURATION = 3000 // 3 seconds
  private readonly MAX_HIGHLIGHT_DURATION = 30000 // 30 seconds

  async initialize(stream: MediaStream) {
    try {
      // Initialize audio analysis
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(stream)
      this.analyzer = this.audioContext.createAnalyser()
      this.analyzer.fftSize = 2048
      source.connect(this.analyzer)

      // Initialize video recording for highlight extraction
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.startProcessing()
    } catch (error) {
      console.error('Failed to initialize highlight detection:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize highlight detection. Some features may be limited.',
        variant: 'destructive'
      })
    }
  }

  private startProcessing() {
    if (this.isProcessing) return

    this.isProcessing = true
    this.processingInterval = setInterval(() => {
      this.analyzeCurrentMoment()
    }, this.ANALYSIS_INTERVAL)

    if (this.mediaRecorder) {
      this.mediaRecorder.start()
    }
  }

  private async analyzeCurrentMoment() {
    if (!this.analyzer) return

    const dataArray = new Float32Array(this.analyzer.frequencyBinCount)
    this.analyzer.getFloatTimeDomainData(dataArray)

    // Calculate audio energy
    const energy = this.calculateAudioEnergy(dataArray)
    const timestamp = Date.now()

    // Detect potential key moments based on audio energy
    if (energy > this.ENERGY_THRESHOLD) {
      const keyMoment: KeyMoment = {
        timestamp,
        type: 'key_point',
        confidence: energy,
        description: 'High energy moment detected'
      }
      this.keyMoments.push(keyMoment)
    }

    // Analyze for engagement peaks
    const engagement = await this.analyzeEngagement()
    if (engagement > this.ENGAGEMENT_THRESHOLD) {
      const keyMoment: KeyMoment = {
        timestamp,
        type: 'engagement_peak',
        confidence: engagement,
        description: 'High engagement moment detected'
      }
      this.keyMoments.push(keyMoment)
    }
  }

  private calculateAudioEnergy(dataArray: Float32Array): number {
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i])
    }
    return sum / dataArray.length
  }

  private async analyzeEngagement(): Promise<number> {
    // Simplified engagement analysis based on audio characteristics
    // In a real implementation, this would use more sophisticated metrics
    if (!this.analyzer) return 0

    const dataArray = new Float32Array(this.analyzer.frequencyBinCount)
    this.analyzer.getFloatFrequencyData(dataArray)

    // Calculate frequency distribution
    let totalEnergy = 0
    let peakEnergy = -Infinity
    for (let i = 0; i < dataArray.length; i++) {
      const magnitude = Math.pow(10, dataArray[i] / 20)
      totalEnergy += magnitude
      if (magnitude > peakEnergy) {
        peakEnergy = magnitude
      }
    }

    // Simple engagement score based on energy distribution
    return Math.min(totalEnergy / (dataArray.length * peakEnergy), 1)
  }

  async generateHighlights(): Promise<HighlightSegment[]> {
    if (this.keyMoments.length === 0) return []

    const highlights: HighlightSegment[] = []
    let currentSegment: HighlightSegment | null = null

    // Sort key moments by timestamp
    const sortedMoments = [...this.keyMoments].sort((a, b) => a.timestamp - b.timestamp)

    for (let i = 0; i < sortedMoments.length; i++) {
      const moment = sortedMoments[i]
      const nextMoment = sortedMoments[i + 1]

      if (!currentSegment) {
        // Start new segment
        currentSegment = {
          startTime: moment.timestamp,
          endTime: moment.timestamp + this.MIN_HIGHLIGHT_DURATION,
          type: 'highlight',
          title: `Highlight ${highlights.length + 1}`,
          description: moment.description,
          confidence: moment.confidence
        }
      } else if (
        nextMoment &&
        nextMoment.timestamp - currentSegment.startTime <= this.MAX_HIGHLIGHT_DURATION
      ) {
        // Extend current segment
        currentSegment.endTime = nextMoment.timestamp
        currentSegment.confidence = Math.max(currentSegment.confidence, moment.confidence)
      } else {
        // Finalize current segment
        if (currentSegment.endTime - currentSegment.startTime >= this.MIN_HIGHLIGHT_DURATION) {
          highlights.push(currentSegment)
        }
        currentSegment = null
      }
    }

    // Add final segment if exists
    if (currentSegment && currentSegment.endTime - currentSegment.startTime >= this.MIN_HIGHLIGHT_DURATION) {
      highlights.push(currentSegment)
    }

    return this.processHighlights(highlights)
  }

  private async processHighlights(highlights: HighlightSegment[]): Promise<HighlightSegment[]> {
    // Generate video clips for each highlight
    const processedHighlights = await Promise.all(
      highlights.map(async (highlight) => {
        try {
          const clipBlob = await this.extractVideoClip(highlight.startTime, highlight.endTime)
          const thumbnail = await this.generateThumbnail(clipBlob)
          
          return {
            ...highlight,
            thumbnail
          }
        } catch (error) {
          console.error('Failed to process highlight:', error)
          return highlight
        }
      })
    )

    return processedHighlights
  }

  private async extractVideoClip(startTime: number, endTime: number): Promise<Blob> {
    // Find chunks that correspond to the time range
    const relevantChunks = this.recordedChunks.filter((_, index) => {
      const chunkStartTime = index * this.ANALYSIS_INTERVAL
      const chunkEndTime = (index + 1) * this.ANALYSIS_INTERVAL
      return chunkStartTime <= endTime && chunkEndTime >= startTime
    })

    return new Blob(relevantChunks, { type: 'video/webm' })
  }

  private async generateThumbnail(videoBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(videoBlob)
      
      video.onloadeddata = () => {
        video.currentTime = 0
      }

      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
        
        URL.revokeObjectURL(video.src)
      }

      video.onerror = () => {
        reject(new Error('Failed to load video for thumbnail generation'))
        URL.revokeObjectURL(video.src)
      }
    })
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }

    if (this.audioContext) {
      this.audioContext.close()
    }

    this.isProcessing = false
    this.analyzer = null
    this.audioContext = null
    this.mediaRecorder = null
  }

  cleanup() {
    this.stop()
    this.recordedChunks = []
    this.keyMoments = []
  }
} 