/**
 * Text-to-Speech Service
 *
 * Convert text to natural speech using Web Speech API and OpenAI TTS fallback
 */

export interface TTSOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  language?: string
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  onBoundary?: (event: SpeechSynthesisEvent) => void
}

export interface VoiceInfo {
  name: string
  lang: string
  default: boolean
  localService: boolean
  voiceURI: string
}

class TextToSpeechService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking: boolean = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.loadVoices()

      // Voices may load asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices()
    }
  }

  isSupported(): boolean {
    return this.synth !== null
  }

  getVoices(): VoiceInfo[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService,
      voiceURI: voice.voiceURI,
    }))
  }

  getVoicesByLanguage(lang: string): VoiceInfo[] {
    return this.getVoices().filter(voice =>
      voice.lang.startsWith(lang) || voice.lang.includes(lang)
    )
  }

  speak(text: string, options: TTSOptions = {}): boolean {
    if (!this.synth) {
      options.onError?.('Text-to-speech not supported')
      return false
    }

    // Cancel any ongoing speech
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)

    // Set voice
    if (options.voice) {
      const voice = this.voices.find(v => v.name === options.voice)
      if (voice) {
        utterance.voice = voice
      }
    } else if (options.language) {
      // Find a voice for the language
      const voice = this.voices.find(v => v.lang.startsWith(options.language!))
      if (voice) {
        utterance.voice = voice
      }
    }

    // Set properties
    utterance.rate = options.rate ?? 1
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1
    if (options.language) {
      utterance.lang = options.language
    }

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true
      options.onStart?.()
    }

    utterance.onend = () => {
      this.isSpeaking = false
      this.currentUtterance = null
      options.onEnd?.()
    }

    utterance.onerror = (event) => {
      this.isSpeaking = false
      this.currentUtterance = null
      options.onError?.(event.error)
    }

    utterance.onboundary = (event) => {
      options.onBoundary?.(event)
    }

    this.currentUtterance = utterance
    this.synth.speak(utterance)
    return true
  }

  pause(): void {
    this.synth?.pause()
  }

  resume(): void {
    this.synth?.resume()
  }

  stop(): void {
    this.synth?.cancel()
    this.isSpeaking = false
    this.currentUtterance = null
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking || (this.synth?.speaking ?? false)
  }

  getIsPaused(): boolean {
    return this.synth?.paused ?? false
  }

  // Queue multiple texts
  async speakQueue(texts: string[], options: TTSOptions = {}): Promise<void> {
    for (const text of texts) {
      await new Promise<void>((resolve, reject) => {
        this.speak(text, {
          ...options,
          onEnd: () => {
            options.onEnd?.()
            resolve()
          },
          onError: (error) => {
            options.onError?.(error)
            reject(new Error(error))
          },
        })
      })
    }
  }
}

export const textToSpeech = new TextToSpeechService()

// Premium voice options (for OpenAI TTS API fallback)
export const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, professional' },
  { id: 'echo', name: 'Echo', description: 'Warm, conversational' },
  { id: 'fable', name: 'Fable', description: 'British, expressive' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
  { id: 'nova', name: 'Nova', description: 'Friendly, optimistic' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle' },
]
