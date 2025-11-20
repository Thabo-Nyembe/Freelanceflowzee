/**
 * Real-time Translation Types
 * Complete type system for world-class translation features
 */

export type Language =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'
  | 'ar' | 'hi' | 'nl' | 'sv' | 'pl' | 'tr' | 'th' | 'vi' | 'id' | 'ms'

export type TranslationMode = 'text' | 'voice' | 'video' | 'document' | 'subtitle' | 'live-chat'

export type TranslationQuality = 'fast' | 'balanced' | 'accurate' | 'native'

export type TranslationEngine = 'kazi-ai' | 'google' | 'deepl' | 'microsoft' | 'neural-mt'

export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
  popularity: number
  supported: {
    text: boolean
    voice: boolean
    document: boolean
  }
}

export interface TranslationRequest {
  id: string
  sourceLanguage: Language
  targetLanguage: Language
  mode: TranslationMode
  engine: TranslationEngine
  quality: TranslationQuality
  content: string
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  userId: string
}

export interface TranslationResult {
  id: string
  requestId: string
  translatedText: string
  sourceText: string
  sourceLanguage: Language
  targetLanguage: Language
  confidence: number
  alternativeTranslations?: string[]
  detectedLanguage?: Language
  processingTime: number
  engine: TranslationEngine
  quality: TranslationQuality
  metadata?: {
    wordCount: number
    characterCount: number
    cost?: number
  }
}

export interface LiveTranslation {
  id: string
  sessionId: string
  participants: TranslationParticipant[]
  sourceLanguage: Language
  targetLanguages: Language[]
  mode: 'voice' | 'video' | 'chat'
  status: 'active' | 'paused' | 'ended'
  startTime: Date
  duration: number
  transcripts: TranscriptSegment[]
  settings: LiveTranslationSettings
}

export interface TranslationParticipant {
  id: string
  name: string
  avatar?: string
  language: Language
  role: 'speaker' | 'listener' | 'moderator'
  isActive: boolean
  joinedAt: Date
}

export interface TranscriptSegment {
  id: string
  speakerId: string
  speakerName: string
  originalText: string
  originalLanguage: Language
  timestamp: Date
  translations: Map<Language, string>
  confidence: number
  isFinal: boolean
}

export interface LiveTranslationSettings {
  autoDetectLanguage: boolean
  showOriginalText: boolean
  enableSubtitles: boolean
  subtitlePosition: 'top' | 'bottom'
  fontSize: 'small' | 'medium' | 'large'
  highlightSpeaker: boolean
  saveTranscript: boolean
  translationDelay: number
  filterProfanity: boolean
}

export interface DocumentTranslation {
  id: string
  fileName: string
  fileSize: number
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'srt'
  sourceLanguage: Language
  targetLanguages: Language[]
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  pageCount?: number
  estimatedTime: number
  preserveFormatting: boolean
  createdAt: Date
  completedAt?: Date
  downloadUrl?: string
}

export interface TranslationMemory {
  id: string
  sourceText: string
  translatedText: string
  sourceLanguage: Language
  targetLanguage: Language
  context?: string
  domain?: string
  usageCount: number
  quality: number
  createdAt: Date
  lastUsed: Date
  isApproved: boolean
  createdBy: string
}

export interface TranslationGlossary {
  id: string
  name: string
  description?: string
  sourceLanguage: Language
  targetLanguage: Language
  terms: GlossaryTerm[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface GlossaryTerm {
  id: string
  sourceTerm: string
  targetTerm: string
  context?: string
  caseSensitive: boolean
  category?: string
}

export interface TranslationStats {
  totalTranslations: number
  charactersTranslated: number
  languagePairs: Array<{
    from: Language
    to: Language
    count: number
  }>
  popularLanguages: Array<{
    language: Language
    percentage: number
  }>
  averageConfidence: number
  averageProcessingTime: number
  successRate: number
  costSummary?: {
    total: number
    perLanguage: Map<Language, number>
    perEngine: Map<TranslationEngine, number>
  }
}

export interface TranslationHistory {
  id: string
  userId: string
  translations: TranslationResult[]
  liveTranslations: LiveTranslation[]
  documents: DocumentTranslation[]
  createdAt: Date
}
