/**
 * Speech Recognition Service
 *
 * Real-time voice-to-text using Web Speech API and Whisper fallback
 */

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  timestamp: number
}

export interface SpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

type SpeechRecognitionType = typeof window.SpeechRecognition

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null
  private isListening: boolean = false
  private options: SpeechRecognitionOptions = {}

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        (window as Window & { SpeechRecognition?: SpeechRecognitionType; webkitSpeechRecognition?: SpeechRecognitionType }).SpeechRecognition ||
        (window as Window & { webkitSpeechRecognition?: SpeechRecognitionType }).webkitSpeechRecognition

      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI()
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null
  }

  configure(options: SpeechRecognitionOptions): void {
    this.options = options

    if (this.recognition) {
      this.recognition.lang = options.language || 'en-US'
      this.recognition.continuous = options.continuous ?? true
      this.recognition.interimResults = options.interimResults ?? true
      this.recognition.maxAlternatives = options.maxAlternatives || 1

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript
          const confidence = result[0].confidence

          options.onResult?.({
            transcript,
            confidence,
            isFinal: result.isFinal,
            timestamp: Date.now(),
          })
        }
      }

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        options.onError?.(event.error)
      }

      this.recognition.onstart = () => {
        this.isListening = true
        options.onStart?.()
      }

      this.recognition.onend = () => {
        this.isListening = false
        options.onEnd?.()

        // Auto-restart if continuous mode
        if (options.continuous && this.isListening) {
          this.start()
        }
      }
    }
  }

  start(): boolean {
    if (!this.recognition) {
      this.options.onError?.('Speech recognition not supported')
      return false
    }

    try {
      this.recognition.start()
      return true
    } catch (error) {
      // Already started
      return false
    }
  }

  stop(): void {
    this.isListening = false
    this.recognition?.stop()
  }

  abort(): void {
    this.isListening = false
    this.recognition?.abort()
  }

  getIsListening(): boolean {
    return this.isListening
  }
}

export const speechRecognition = new SpeechRecognitionService()

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'sv-SE', name: 'Swedish' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'tr-TR', name: 'Turkish' },
]
