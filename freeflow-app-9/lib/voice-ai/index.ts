/**
 * Voice AI Library
 *
 * Complete voice interface for FreeFlow
 * - Speech recognition (voice-to-text)
 * - Text-to-speech (AI voice responses)
 * - Voice commands (hands-free operation)
 */

export {
  speechRecognition,
  SUPPORTED_LANGUAGES,
  type SpeechRecognitionResult,
  type SpeechRecognitionOptions,
} from './speech-recognition'

export {
  textToSpeech,
  OPENAI_VOICES,
  type TTSOptions,
  type VoiceInfo,
} from './text-to-speech'

export {
  voiceCommands,
  type VoiceCommand,
  type VoiceCommandsOptions,
} from './voice-commands'
