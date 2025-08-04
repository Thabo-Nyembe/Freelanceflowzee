import { EnhancedAIService } from './enhanced-ai-service'

interface RealTimeAnalysisResult {
  type: 'speech' | 'sentiment' | 'quality' | 'suggestion'
  data: unknown
  timestamp: number
}

export class RealTimeAIService {
  private aiService: EnhancedAIService
  private speechRecognition: SpeechRecognition | null = null
  private onResultCallback: ((result: RealTimeAnalysisResult) => void) | null = null

  constructor() {
    this.aiService = new EnhancedAIService()
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.speechRecognition = new (window as any).webkitSpeechRecognition()
      this.setupSpeechRecognition()
    }
  }

  private setupSpeechRecognition() {
    if (!this.speechRecognition) return

    this.speechRecognition.continuous = true
    this.speechRecognition.interimResults = true
    this.speechRecognition.lang = 'en-US'

    this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      const confidence = result[0].confidence

      // Emit speech recognition result
      this.emitResult({
        type: 'speech',
        data: {
          transcript,
          confidence,
          isFinal: result.isFinal
        },
        timestamp: Date.now()
      })

      // If it's a final result, analyze sentiment and quality
      if (result.isFinal) {
        this.analyzeSentiment(transcript)
        this.analyzeQuality(transcript)
      }
    }

    this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
    }
  }

  private async analyzeSentiment(text: string) {
    try {
      const response = await fetch('/api/ai/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to analyze sentiment')

      const sentiment = await response.json()
      this.emitResult({
        type: 'sentiment',
        data: sentiment,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Sentiment analysis error:', error)
    }
  }

  private async analyzeQuality(text: string) {
    try {
      const response = await fetch('/api/ai/analyze-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error('Failed to analyze quality')

      const quality = await response.json()
      this.emitResult({
        type: 'quality',
        data: quality,
        timestamp: Date.now()
      })

      // Generate suggestions based on quality analysis
      if (quality.score < 0.7) {
        this.generateSuggestions(text, quality)
      }
    } catch (error) {
      console.error('Quality analysis error:', error)
    }
  }

  private async generateSuggestions(text: string, quality) {
    try {
      const response = await fetch('/api/ai/generate-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, quality })
      })

      if (!response.ok) throw new Error('Failed to generate suggestions')

      const suggestions = await response.json()
      this.emitResult({
        type: 'suggestion',
        data: suggestions,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Suggestion generation error:', error)
    }
  }

  private emitResult(result: RealTimeAnalysisResult) {
    this.onResultCallback?.(result)
  }

  startAnalysis(onResult: (result: RealTimeAnalysisResult) => void) {
    this.onResultCallback = onResult
    this.speechRecognition?.start()
  }

  stopAnalysis() {
    this.speechRecognition?.stop()
    this.onResultCallback = null
  }

  isSupported() {
    return this.speechRecognition !== null
  }
} 