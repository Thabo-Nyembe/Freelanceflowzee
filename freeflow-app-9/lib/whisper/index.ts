/**
 * Whisper Transcription Library
 *
 * Audio transcription and caption generation using OpenAI Whisper
 */

export {
  WhisperService,
  whisperService,
  formatSRTTimestamp,
  formatVTTTimestamp,
  splitIntoLines,
  processCaptionSegments,
  generateSRT,
  generateVTT,
  generateJSON,
  generateASS,
} from './whisper-service'

export type {
  TranscriptionSegment,
  TranscriptionResult,
  TranscriptionJob,
  TranscriptionOptions,
  CaptionStyle,
} from './whisper-service'
