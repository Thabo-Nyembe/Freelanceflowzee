/**
 * AI CREATE A++++ - VOICE INPUT UTILITY
 *
 * Provides speech-to-text functionality for hands-free prompt input.
 * Uses Web Speech API for browser-based voice recognition.
 *
 * Features:
 * - Real-time speech recognition
 * - Multiple language support
 * - Continuous and single-shot modes
 * - Confidence scoring
 * - Voice commands (punctuation, formatting)
 * - Interim results for live feedback
 *
 * @example
 * ```typescript
 * const voiceInput = createVoiceInput({
 *   language: 'en-US',
 *   continuous: true,
 *   onResult: (text, isFinal) => {
 *     setPrompt(prev => prev + text)
 *   },
 *   onError: (error) => console.error(error)
 * })
 *
 * voiceInput.start()
 * // ... user speaks ...
 * voiceInput.stop()
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceInputConfig {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (text: string, isFinal: boolean, confidence: number) => void
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: VoiceInputError) => void
  onSoundStart?: () => void
  onSoundEnd?: () => void
  enableCommands?: boolean
}

export interface VoiceInputController {
  start: () => void
  stop: () => void
  abort: () => void
  isListening: () => boolean
  setLanguage: (language: string) => void
  getLanguage: () => string
}

export interface VoiceInputError {
  type: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported' | 'not-supported'
  message: string
}

export interface RecognitionResult {
  text: string
  confidence: number
  isFinal: boolean
  timestamp: Date
}

export interface VoiceCommand {
  trigger: string
  action: (context: VoiceCommandContext) => string
  description: string
}

export interface VoiceCommandContext {
  currentText: string
  lastWord: string
  lastSentence: string
}

// ============================================================================
// BROWSER COMPATIBILITY CHECK
// ============================================================================

/**
 * Checks if browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || (window as any).webkitSpeechRecognition)
  )
}

/**
 * Gets available languages for speech recognition
 */
export function getAvailableLanguages(): string[] {
  return [
    'en-US', // English (United States)
    'en-GB', // English (United Kingdom)
    'en-AU', // English (Australia)
    'en-CA', // English (Canada)
    'es-ES', // Spanish (Spain)
    'es-MX', // Spanish (Mexico)
    'fr-FR', // French (France)
    'de-DE', // German (Germany)
    'it-IT', // Italian (Italy)
    'pt-BR', // Portuguese (Brazil)
    'pt-PT', // Portuguese (Portugal)
    'nl-NL', // Dutch (Netherlands)
    'ru-RU', // Russian (Russia)
    'zh-CN', // Chinese (Mandarin, Simplified)
    'zh-TW', // Chinese (Traditional)
    'ja-JP', // Japanese (Japan)
    'ko-KR', // Korean (South Korea)
    'ar-SA', // Arabic (Saudi Arabia)
    'hi-IN', // Hindi (India)
    'tr-TR', // Turkish (Turkey)
  ]
}

// ============================================================================
// VOICE INPUT CONTROLLER
// ============================================================================

/**
 * Creates a voice input controller for speech-to-text
 *
 * @param config - Voice input configuration
 * @returns Controller for managing voice input
 */
export function createVoiceInput(config: VoiceInputConfig): VoiceInputController {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition is not supported in this browser')
  }

  // Get SpeechRecognition constructor
  const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

  const recognition = new SpeechRecognition()
  let isListening = false
  let finalTranscript = ''
  let interimTranscript = ''

  // Configure recognition
  recognition.continuous = config.continuous ?? true
  recognition.interimResults = config.interimResults ?? true
  recognition.maxAlternatives = config.maxAlternatives ?? 1
  recognition.lang = config.language || 'en-US'

  // Event handlers
  recognition.onstart = () => {
    isListening = true
    finalTranscript = ''
    interimTranscript = ''
    config.onStart?.()
  }

  recognition.onend = () => {
    isListening = false
    config.onEnd?.()
  }

  recognition.onerror = (event: any) => {
    const errorType = event.error as VoiceInputError['type']
    const error: VoiceInputError = {
      type: errorType,
      message: getErrorMessage(errorType)
    }
    config.onError?.(error)
  }

  recognition.onsoundstart = () => {
    config.onSoundStart?.()
  }

  recognition.onsoundend = () => {
    config.onSoundEnd?.()
  }

  recognition.onresult = (event: any) => {
    let interim = ''
    let final = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = result[0].transcript
      const confidence = result[0].confidence

      if (result.isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }

    // Process final results
    if (final) {
      let processedText = final

      // Apply voice commands if enabled
      if (config.enableCommands) {
        processedText = processVoiceCommands(final, finalTranscript)
      }

      finalTranscript += processedText
      const confidence = event.results[event.results.length - 1][0].confidence || 1.0
      config.onResult?.(processedText, true, confidence)
    }

    // Process interim results
    if (interim && config.interimResults) {
      interimTranscript = interim
      config.onResult?.(interim, false, 0.5)
    }
  }

  // Return controller
  return {
    start: () => {
      if (!isListening) {
        try {
          recognition.start()
        } catch (error) {
          console.error('Failed to start voice input:', error)
        }
      }
    },
    stop: () => {
      if (isListening) {
        recognition.stop()
      }
    },
    abort: () => {
      recognition.abort()
      isListening = false
    },
    isListening: () => isListening,
    setLanguage: (language: string) => {
      recognition.lang = language
    },
    getLanguage: () => recognition.lang
  }
}

// ============================================================================
// VOICE COMMANDS
// ============================================================================

/**
 * Built-in voice commands for formatting and punctuation
 */
const VOICE_COMMANDS: VoiceCommand[] = [
  {
    trigger: 'period',
    action: () => '. ',
    description: 'Insert period'
  },
  {
    trigger: 'comma',
    action: () => ', ',
    description: 'Insert comma'
  },
  {
    trigger: 'question mark',
    action: () => '? ',
    description: 'Insert question mark'
  },
  {
    trigger: 'exclamation mark',
    action: () => '! ',
    description: 'Insert exclamation mark'
  },
  {
    trigger: 'new line',
    action: () => '\n',
    description: 'Insert line break'
  },
  {
    trigger: 'new paragraph',
    action: () => '\n\n',
    description: 'Insert paragraph break'
  },
  {
    trigger: 'colon',
    action: () => ': ',
    description: 'Insert colon'
  },
  {
    trigger: 'semicolon',
    action: () => '; ',
    description: 'Insert semicolon'
  },
  {
    trigger: 'dash',
    action: () => ' - ',
    description: 'Insert dash'
  },
  {
    trigger: 'quote',
    action: (context) => {
      const hasOpenQuote = (context.currentText.match(/"/g) || []).length % 2 === 1
      return hasOpenQuote ? '" ' : '"'
    },
    description: 'Insert quotation mark'
  },
  {
    trigger: 'open parenthesis',
    action: () => '(',
    description: 'Insert opening parenthesis'
  },
  {
    trigger: 'close parenthesis',
    action: () => ') ',
    description: 'Insert closing parenthesis'
  }
]

/**
 * Processes voice commands in transcribed text
 */
function processVoiceCommands(text: string, currentText: string): string {
  let processed = text.toLowerCase()

  VOICE_COMMANDS.forEach(command => {
    const regex = new RegExp(`\\b${command.trigger}\\b`, 'gi')
    const matches = processed.match(regex)

    if (matches) {
      matches.forEach(() => {
        const context: VoiceCommandContext = {
          currentText,
          lastWord: getLastWord(currentText),
          lastSentence: getLastSentence(currentText)
        }

        const replacement = command.action(context)
        processed = processed.replace(regex, replacement)
      })
    }
  })

  // Capitalize first letter of sentences
  processed = capitalizeSentences(processed)

  return processed
}

/**
 * Gets last word from text
 */
function getLastWord(text: string): string {
  const words = text.trim().split(/\s+/)
  return words[words.length - 1] || ''
}

/**
 * Gets last sentence from text
 */
function getLastSentence(text: string): string {
  const sentences = text.split(/[.!?]+/)
  return sentences[sentences.length - 1]?.trim() || ''
}

/**
 * Capitalizes first letter of sentences
 */
function capitalizeSentences(text: string): string {
  return text.replace(/(^\w|[.!?]\s+\w)/g, match => match.toUpperCase())
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Gets human-readable error message for error type
 */
function getErrorMessage(errorType: VoiceInputError['type']): string {
  const messages: Record<VoiceInputError['type'], string> = {
    'no-speech': 'No speech was detected. Please try again.',
    'aborted': 'Speech recognition was aborted.',
    'audio-capture': 'No microphone was found. Ensure your microphone is connected.',
    'network': 'Network error occurred. Please check your connection.',
    'not-allowed': 'Microphone permission was denied. Please allow microphone access.',
    'service-not-allowed': 'Speech recognition service is not allowed.',
    'bad-grammar': 'Speech recognition grammar error.',
    'language-not-supported': 'The selected language is not supported.',
    'not-supported': 'Speech recognition is not supported in this browser.'
  }

  return messages[errorType] || 'An unknown error occurred.'
}

// ============================================================================
// STORAGE & HISTORY
// ============================================================================

const STORAGE_KEY = 'ai-create-voice-history'

export interface VoiceHistoryEntry {
  id: string
  text: string
  language: string
  confidence: number
  timestamp: Date
  duration?: number
}

/**
 * Saves voice input to history
 */
export function saveVoiceHistory(entry: Omit<VoiceHistoryEntry, 'id'>): string {
  try {
    const history = loadVoiceHistory()
    const id = `voice-${Date.now()}`

    const newEntry: VoiceHistoryEntry = {
      id,
      ...entry
    }

    history.unshift(newEntry)

    // Keep last 50 entries
    const trimmed = history.slice(0, 50)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return id
  } catch (error) {
    console.error('Failed to save voice history:', error)
    throw error
  }
}

/**
 * Loads voice input history
 */
export function loadVoiceHistory(): VoiceHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load voice history:', error)
    return []
  }
}

/**
 * Clears voice input history
 */
export function clearVoiceHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear voice history:', error)
    return false
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Formats duration in milliseconds to readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

/**
 * Gets microphone permission status
 */
export async function getMicrophonePermission(): Promise<PermissionState> {
  try {
    if (!navigator.permissions) {
      throw new Error('Permissions API not supported')
    }

    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return result.state
  } catch (error) {
    console.error('Failed to check microphone permission:', error)
    return 'prompt'
  }
}

/**
 * Requests microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}

// ============================================================================
// EXPORT DEFAULTS
// ============================================================================

export const DEFAULT_VOICE_CONFIG: VoiceInputConfig = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  enableCommands: true
}

export const SUPPORTED_LANGUAGES = getAvailableLanguages()

export { VOICE_COMMANDS }
