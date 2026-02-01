
interface VoiceSynthesisRequest {
  text: string
  voice: string
  style?: string
  language?: string
  speed?: number
  pitch?: number
  format?: 'mp3' | 'wav' | 'ogg'
}

interface VoiceSynthesisResponse {
  audioUrl: string
  duration: number
  format: string
  size: number
}

interface ApiKeys {
  openai?: string
  elevenlabs?: string
  azure?: string
  [key: string]: string | undefined
}

export class VoiceSynthesisAPI {
  private apiKeys: ApiKeys = {}

  constructor() {
    this.loadApiKeys()
  }

  private loadApiKeys() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kazi-ai-keys')
      if (stored) {
        this.apiKeys = JSON.parse(stored)
      }
    }
  }

  async synthesizeWithOpenAI(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await fetch('/api/ai/voice-synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        body: JSON.stringify({
          provider: 'openai',
          input: request.text,
          voice: request.voice,
          response_format: request.format || 'mp3',
          speed: request.speed || 1.0
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI TTS API error: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return {
        audioUrl,
        duration: this.estimateDuration(request.text, request.speed || 1.0),
        format: request.format || 'mp3',
        size: audioBlob.size
      }
    } catch (error) {
      console.error('OpenAI TTS synthesis failed:', error)
      throw error
    }
  }

  async synthesizeWithElevenLabs(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
    if (!this.apiKeys.elevenlabs) {
      throw new Error('ElevenLabs API key not configured')
    }

    try {
      const response = await fetch('/api/ai/voice-synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.elevenlabs}`
        },
        body: JSON.stringify({
          provider: 'elevenlabs',
          text: request.text,
          voice_id: request.voice,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: request.style ? this.mapStyleToElevenLabs(request.style) : 0.0,
            use_speaker_boost: true
          },
          output_format: request.format || 'mp3_44100_128'
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return {
        audioUrl,
        duration: this.estimateDuration(request.text, request.speed || 1.0),
        format: request.format || 'mp3',
        size: audioBlob.size
      }
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error)
      throw error
    }
  }

  async synthesizeWithAzure(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
    if (!this.apiKeys.azure) {
      throw new Error('Azure Speech API key not configured')
    }

    try {
      const response = await fetch('/api/ai/voice-synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.azure}`
        },
        body: JSON.stringify({
          provider: 'azure',
          text: request.text,
          voice: request.voice,
          language: request.language || 'en-US',
          rate: request.speed ? this.mapSpeedToAzure(request.speed) : 'medium',
          pitch: request.pitch ? this.mapPitchToAzure(request.pitch) : 'medium',
          output_format: request.format || 'audio-24khz-48kbitrate-mono-mp3'
        })
      })

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.statusText}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return {
        audioUrl,
        duration: this.estimateDuration(request.text, request.speed || 1.0),
        format: request.format || 'mp3',
        size: audioBlob.size
      }
    } catch (error) {
      console.error('Azure Speech synthesis failed:', error)
      throw error
    }
  }

  async synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse> {
    // Try providers in order of preference
    const providers = ['openai', 'elevenlabs', 'azure']

    for (const provider of providers) {
      if (this.apiKeys[provider]) {
        try {
          switch (provider) {
            case 'openai':
              return await this.synthesizeWithOpenAI(request)
            case 'elevenlabs':
              return await this.synthesizeWithElevenLabs(request)
            case 'azure':
              return await this.synthesizeWithAzure(request)
          }
        } catch (error) {
          console.warn(`${provider} synthesis failed, trying next provider:`, error)
          continue
        }
      }
    }

    // Fallback to mock response if no APIs are configured
    return this.createMockResponse(request)
  }

  private createMockResponse(request: VoiceSynthesisRequest): VoiceSynthesisResponse {
    // Create a simple beep tone as a fallback
    const audioContext = new (window.AudioContext || (window as Record<string, unknown>).webkitAudioContext)()
    const buffer = audioContext.createBuffer(1, 44100, 44100)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.1
    }

    const audioBlob = new Blob([data], { type: 'audio/wav' })
    const audioUrl = URL.createObjectURL(audioBlob)

    return {
      audioUrl,
      duration: this.estimateDuration(request.text, request.speed || 1.0),
      format: 'wav',
      size: audioBlob.size
    }
  }

  private estimateDuration(text: string, speed: number): number {
    // Estimate speaking duration: average 150 words per minute
    const words = text.split(' ').length
    const baseDurationMinutes = words / 150
    const durationSeconds = (baseDurationMinutes * 60) / speed
    return Math.round(durationSeconds)
  }

  private mapStyleToElevenLabs(style: string): number {
    const styleMap: Record<string, number> = {
      'conversational': 0.0,
      'professional': 0.2,
      'narrative': 0.5,
      'excited': 0.8,
      'calm': -0.3,
      'dramatic': 1.0
    }
    return styleMap[style] || 0.0
  }

  private mapSpeedToAzure(speed: number): string {
    if (speed <= 0.8) return 'slow'
    if (speed <= 1.2) return 'medium'
    return 'fast'
  }

  private mapPitchToAzure(pitch: number): string {
    if (pitch <= -6) return 'low'
    if (pitch <= 6) return 'medium'
    return 'high'
  }

  getAvailableVoices(provider?: string): Array<{id: string, name: string, language: string}> {
    // Return voice options based on available API keys
    const voices = []

    if (this.apiKeys.openai) {
      voices.push(
        { id: 'alloy', name: 'Alloy', language: 'en-US' },
        { id: 'echo', name: 'Echo', language: 'en-US' },
        { id: 'fable', name: 'Fable', language: 'en-US' },
        { id: 'onyx', name: 'Onyx', language: 'en-US' },
        { id: 'nova', name: 'Nova', language: 'en-US' },
        { id: 'shimmer', name: 'Shimmer', language: 'en-US' }
      )
    }

    if (this.apiKeys.elevenlabs) {
      voices.push(
        { id: 'rachel', name: 'Rachel', language: 'en-US' },
        { id: 'domi', name: 'Domi', language: 'en-US' },
        { id: 'bella', name: 'Bella', language: 'en-US' },
        { id: 'antoni', name: 'Antoni', language: 'en-US' },
        { id: 'elli', name: 'Elli', language: 'en-US' },
        { id: 'josh', name: 'Josh', language: 'en-US' }
      )
    }

    return voices
  }

  isConfigured(): boolean {
    return Object.keys(this.apiKeys).some(key => this.apiKeys[key])
  }

  getConfiguredProviders(): string[] {
    return Object.keys(this.apiKeys).filter(key => this.apiKeys[key])
  }
}

export const voiceSynthesisAPI = new VoiceSynthesisAPI()