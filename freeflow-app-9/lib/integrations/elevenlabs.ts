// =====================================================
// KAZI ElevenLabs Integration - AI Voice Synthesis
// Text-to-speech, voice cloning, and audio generation
// =====================================================

export interface ElevenLabsConfig {
  apiKey: string;
  defaultVoiceId?: string;
  defaultModelId?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  labels: Record<string, string>;
  preview_url?: string;
  samples?: VoiceSample[];
  settings?: VoiceSettings;
}

export interface VoiceSample {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface VoiceSettings {
  stability: number; // 0-1
  similarity_boost: number; // 0-1
  style?: number; // 0-1
  use_speaker_boost?: boolean;
}

export interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  outputFormat?: 'mp3_44100_128' | 'mp3_44100_64' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
}

export interface StreamRequest extends TextToSpeechRequest {
  chunkLengthSchedule?: number[];
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  files: File[] | Blob[];
  labels?: Record<string, string>;
}

export interface GenerationHistory {
  history_item_id: string;
  voice_id: string;
  voice_name: string;
  text: string;
  date_unix: number;
  character_count_change_from: number;
  character_count_change_to: number;
  content_type: string;
  state: 'created' | 'deleted' | 'processing';
  settings?: VoiceSettings;
}

export interface UsageStats {
  tier: string;
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
  allowed_to_extend_character_limit: boolean;
  next_character_count_reset_unix: number;
  voice_limit: number;
  max_voice_add_edits: number;
  voice_add_edit_counter: number;
}

class ElevenLabsService {
  private static instance: ElevenLabsService;
  private config: ElevenLabsConfig | null = null;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  // Popular voice IDs
  static readonly VOICES = {
    RACHEL: '21m00Tcm4TlvDq8ikWAM', // American female
    ADAM: 'pNInz6obpgDQGcFmaJgB', // American male
    JOSH: 'TxGEqnHWrfWFTfGW9XjX', // American male, young
    ARNOLD: 'VR6AewLTigWG4xSOukaG', // American male, deep
    BELLA: 'EXAVITQu4vr4xnSDxMaL', // American female, soft
    DOMI: 'AZnzlk1XvdvUeBnXmlld', // American female, strong
    ELLI: 'MF3mGyEYCl7XYWbV9V6O', // American female, emotional
    ANTONI: 'ErXwobaYiN019PkySvjV', // American male, warm
  };

  // Model IDs
  static readonly MODELS = {
    ELEVEN_MONOLINGUAL_V1: 'eleven_monolingual_v1',
    ELEVEN_MULTILINGUAL_V1: 'eleven_multilingual_v1',
    ELEVEN_MULTILINGUAL_V2: 'eleven_multilingual_v2',
    ELEVEN_TURBO_V2: 'eleven_turbo_v2',
  };

  private constructor() {}

  static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  /**
   * Initialize with API key
   */
  initialize(config: ElevenLabsConfig): void {
    this.config = {
      ...config,
      defaultVoiceId: config.defaultVoiceId || ElevenLabsService.VOICES.RACHEL,
      defaultModelId: config.defaultModelId || ElevenLabsService.MODELS.ELEVEN_MULTILINGUAL_V2,
    };
  }

  /**
   * Initialize from environment variables
   */
  initializeFromEnv(): void {
    this.config = {
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      defaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || ElevenLabsService.VOICES.RACHEL,
      defaultModelId: process.env.ELEVENLABS_DEFAULT_MODEL_ID || ElevenLabsService.MODELS.ELEVEN_MULTILINGUAL_V2,
    };
  }

  private getHeaders(): Record<string, string> {
    if (!this.config) {
      throw new Error('ElevenLabs not initialized. Call initialize() first.');
    }
    return {
      'xi-api-key': this.config.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // =====================================================
  // TEXT TO SPEECH
  // =====================================================

  /**
   * Generate speech from text
   */
  async textToSpeech(request: TextToSpeechRequest): Promise<ArrayBuffer> {
    if (!this.config) throw new Error('ElevenLabs not initialized');

    const voiceId = request.voiceId || this.config.defaultVoiceId;
    const modelId = request.modelId || this.config.defaultModelId;

    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          text: request.text,
          model_id: modelId,
          voice_settings: request.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          output_format: request.outputFormat || 'mp3_44100_128',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail?.message || 'Failed to generate speech');
    }

    return response.arrayBuffer();
  }

  /**
   * Generate speech with streaming
   */
  async textToSpeechStream(request: StreamRequest): Promise<ReadableStream<Uint8Array>> {
    if (!this.config) throw new Error('ElevenLabs not initialized');

    const voiceId = request.voiceId || this.config.defaultVoiceId;
    const modelId = request.modelId || this.config.defaultModelId;

    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          text: request.text,
          model_id: modelId,
          voice_settings: request.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          chunk_length_schedule: request.chunkLengthSchedule,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail?.message || 'Failed to stream speech');
    }

    return response.body!;
  }

  /**
   * Generate speech and save to file (Node.js)
   */
  async textToSpeechFile(request: TextToSpeechRequest, outputPath: string): Promise<void> {
    const audioData = await this.textToSpeech(request);
    const fs = require('fs').promises;
    await fs.writeFile(outputPath, Buffer.from(audioData));
  }

  /**
   * Generate speech and return as base64
   */
  async textToSpeechBase64(request: TextToSpeechRequest): Promise<string> {
    const audioData = await this.textToSpeech(request);
    const buffer = Buffer.from(audioData);
    return buffer.toString('base64');
  }

  /**
   * Generate speech and return as data URL
   */
  async textToSpeechDataUrl(request: TextToSpeechRequest): Promise<string> {
    const base64 = await this.textToSpeechBase64(request);
    return `data:audio/mpeg;base64,${base64}`;
  }

  // =====================================================
  // VOICE MANAGEMENT
  // =====================================================

  /**
   * Get all available voices
   */
  async getVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get voices');
    }

    const data = await response.json();
    return data.voices;
  }

  /**
   * Get voice details
   */
  async getVoice(voiceId: string): Promise<Voice> {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get voice');
    }

    return response.json();
  }

  /**
   * Get default voice settings for a voice
   */
  async getVoiceSettings(voiceId: string): Promise<VoiceSettings> {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}/settings`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get voice settings');
    }

    return response.json();
  }

  /**
   * Clone a voice from audio samples
   */
  async cloneVoice(request: VoiceCloneRequest): Promise<Voice> {
    if (!this.config) throw new Error('ElevenLabs not initialized');

    const formData = new FormData();
    formData.append('name', request.name);

    if (request.description) {
      formData.append('description', request.description);
    }

    request.files.forEach((file, index) => {
      formData.append('files', file, `sample_${index}.mp3`);
    });

    if (request.labels) {
      formData.append('labels', JSON.stringify(request.labels));
    }

    const response = await fetch(`${this.baseUrl}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail?.message || 'Failed to clone voice');
    }

    return response.json();
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete voice');
    }
  }

  // =====================================================
  // HISTORY
  // =====================================================

  /**
   * Get generation history
   */
  async getHistory(pageSize = 100): Promise<GenerationHistory[]> {
    const response = await fetch(
      `${this.baseUrl}/history?page_size=${pageSize}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to get history');
    }

    const data = await response.json();
    return data.history;
  }

  /**
   * Get audio from history item
   */
  async getHistoryAudio(historyItemId: string): Promise<ArrayBuffer> {
    const response = await fetch(
      `${this.baseUrl}/history/${historyItemId}/audio`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error('Failed to get history audio');
    }

    return response.arrayBuffer();
  }

  /**
   * Delete history item
   */
  async deleteHistoryItem(historyItemId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/history/${historyItemId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete history item');
    }
  }

  // =====================================================
  // ACCOUNT
  // =====================================================

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await fetch(`${this.baseUrl}/user/subscription`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get usage stats');
    }

    return response.json();
  }

  // =====================================================
  // KAZI HELPERS
  // =====================================================

  /**
   * Generate voiceover for video
   */
  async generateVoiceover(
    script: string,
    options?: {
      voiceId?: string;
      speed?: 'slow' | 'normal' | 'fast';
      emotion?: 'neutral' | 'happy' | 'sad' | 'serious';
    }
  ): Promise<ArrayBuffer> {
    const settings: VoiceSettings = {
      stability: options?.emotion === 'serious' ? 0.8 : 0.5,
      similarity_boost: 0.75,
      style: options?.emotion === 'happy' ? 0.8 : options?.emotion === 'sad' ? 0.2 : 0.5,
    };

    return this.textToSpeech({
      text: script,
      voiceId: options?.voiceId,
      voiceSettings: settings,
    });
  }

  /**
   * Generate podcast intro/outro
   */
  async generatePodcastSegment(
    text: string,
    type: 'intro' | 'outro' | 'transition'
  ): Promise<ArrayBuffer> {
    const voiceId = type === 'intro'
      ? ElevenLabsService.VOICES.ADAM
      : type === 'outro'
      ? ElevenLabsService.VOICES.BELLA
      : ElevenLabsService.VOICES.RACHEL;

    return this.textToSpeech({
      text,
      voiceId,
      voiceSettings: {
        stability: 0.7,
        similarity_boost: 0.8,
      },
    });
  }

  /**
   * Generate notification sound with voice
   */
  async generateNotificationVoice(
    message: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ArrayBuffer> {
    const settings: VoiceSettings = {
      stability: urgency === 'high' ? 0.3 : 0.6,
      similarity_boost: urgency === 'high' ? 0.9 : 0.7,
      style: urgency === 'high' ? 0.8 : 0.4,
    };

    return this.textToSpeech({
      text: message,
      voiceId: ElevenLabsService.VOICES.ELLI,
      voiceSettings: settings,
      modelId: ElevenLabsService.MODELS.ELEVEN_TURBO_V2, // Faster for notifications
    });
  }

  /**
   * Generate audio article reading
   */
  async generateArticleAudio(
    title: string,
    content: string,
    options?: {
      voiceId?: string;
      includeTitleAnnouncement?: boolean;
    }
  ): Promise<ArrayBuffer> {
    let fullText = '';

    if (options?.includeTitleAnnouncement !== false) {
      fullText = `${title}. `;
    }

    fullText += content;

    return this.textToSpeech({
      text: fullText,
      voiceId: options?.voiceId || ElevenLabsService.VOICES.RACHEL,
      voiceSettings: {
        stability: 0.6,
        similarity_boost: 0.7,
      },
    });
  }
}

export const elevenLabsService = ElevenLabsService.getInstance();
