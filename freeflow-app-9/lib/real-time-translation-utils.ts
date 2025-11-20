/**
 * Real-time Translation Utilities
 * Helper functions and mock data for translation system
 */

import {
  Language,
  LanguageInfo,
  TranslationResult,
  LiveTranslation,
  DocumentTranslation,
  TranslationMemory,
  TranslationGlossary,
  TranslationStats,
  TranslationMode,
  TranslationQuality,
  TranslationEngine
} from './real-time-translation-types'

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', popularity: 100, supported: { text: true, voice: true, document: true } },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', popularity: 95, supported: { text: true, voice: true, document: true } },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', popularity: 90, supported: { text: true, voice: true, document: true } },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', popularity: 85, supported: { text: true, voice: true, document: true } },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', popularity: 98, supported: { text: true, voice: true, document: true } },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', popularity: 88, supported: { text: true, voice: true, document: true } },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', popularity: 82, supported: { text: true, voice: true, document: true } },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', popularity: 87, supported: { text: true, voice: true, document: true } },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', popularity: 80, supported: { text: true, voice: true, document: true } },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', popularity: 83, supported: { text: true, voice: true, document: true } },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', popularity: 78, supported: { text: true, voice: true, document: true } },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', popularity: 75, supported: { text: true, voice: true, document: true } },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', popularity: 70, supported: { text: true, voice: true, document: true } },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', popularity: 72, supported: { text: true, voice: true, document: true } },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', popularity: 68, supported: { text: true, voice: true, document: true } },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', popularity: 65, supported: { text: true, voice: true, document: true } }
]

export const TRANSLATION_ENGINES: Array<{ id: TranslationEngine; name: string; description: string; speed: number; accuracy: number }> = [
  { id: 'kazi-ai', name: 'KAZI AI', description: 'Our proprietary neural translation engine', speed: 95, accuracy: 98 },
  { id: 'deepl', name: 'DeepL', description: 'High-quality neural translations', speed: 85, accuracy: 96 },
  { id: 'google', name: 'Google Translate', description: 'Fast and reliable translations', speed: 98, accuracy: 92 },
  { id: 'microsoft', name: 'Microsoft Translator', description: 'Enterprise-grade translation', speed: 90, accuracy: 94 },
  { id: 'neural-mt', name: 'Neural MT', description: 'Advanced neural machine translation', speed: 88, accuracy: 95 }
]

export const QUALITY_PRESETS: Array<{ id: TranslationQuality; name: string; description: string; processingTime: string }> = [
  { id: 'fast', name: 'Fast', description: 'Quick translations for basic understanding', processingTime: '< 1s' },
  { id: 'balanced', name: 'Balanced', description: 'Good balance of speed and accuracy', processingTime: '1-2s' },
  { id: 'accurate', name: 'Accurate', description: 'High-quality professional translations', processingTime: '2-4s' },
  { id: 'native', name: 'Native', description: 'Human-like natural translations', processingTime: '4-8s' }
]

export const MOCK_TRANSLATION_RESULTS: TranslationResult[] = [
  {
    id: 'trans-1',
    requestId: 'req-1',
    sourceText: 'Hello, how are you today?',
    translatedText: 'Hola, ¿cómo estás hoy?',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    confidence: 0.98,
    processingTime: 245,
    engine: 'kazi-ai',
    quality: 'accurate',
    metadata: {
      wordCount: 5,
      characterCount: 25
    }
  },
  {
    id: 'trans-2',
    requestId: 'req-2',
    sourceText: 'Thank you for your help',
    translatedText: 'Merci pour votre aide',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    confidence: 0.96,
    processingTime: 198,
    engine: 'kazi-ai',
    quality: 'accurate',
    metadata: {
      wordCount: 5,
      characterCount: 23
    }
  }
]

export const MOCK_LIVE_SESSIONS: LiveTranslation[] = [
  {
    id: 'live-1',
    sessionId: 'session-1',
    participants: [
      {
        id: 'user-1',
        name: 'John Smith',
        language: 'en',
        role: 'speaker',
        isActive: true,
        joinedAt: new Date(Date.now() - 15 * 60000)
      },
      {
        id: 'user-2',
        name: 'Maria Garcia',
        language: 'es',
        role: 'listener',
        isActive: true,
        joinedAt: new Date(Date.now() - 12 * 60000)
      }
    ],
    sourceLanguage: 'en',
    targetLanguages: ['es', 'fr'],
    mode: 'video',
    status: 'active',
    startTime: new Date(Date.now() - 15 * 60000),
    duration: 900,
    transcripts: [],
    settings: {
      autoDetectLanguage: true,
      showOriginalText: true,
      enableSubtitles: true,
      subtitlePosition: 'bottom',
      fontSize: 'medium',
      highlightSpeaker: true,
      saveTranscript: true,
      translationDelay: 0,
      filterProfanity: false
    }
  }
]

export const MOCK_DOCUMENTS: DocumentTranslation[] = [
  {
    id: 'doc-1',
    fileName: 'Business_Proposal.pdf',
    fileSize: 2457600,
    fileType: 'pdf',
    sourceLanguage: 'en',
    targetLanguages: ['es', 'fr', 'de'],
    status: 'completed',
    progress: 100,
    pageCount: 15,
    estimatedTime: 0,
    preserveFormatting: true,
    createdAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 1800000),
    downloadUrl: '#'
  },
  {
    id: 'doc-2',
    fileName: 'Marketing_Strategy.docx',
    fileSize: 1024000,
    fileType: 'docx',
    sourceLanguage: 'en',
    targetLanguages: ['zh', 'ja'],
    status: 'processing',
    progress: 65,
    pageCount: 8,
    estimatedTime: 180,
    preserveFormatting: true,
    createdAt: new Date(Date.now() - 600000)
  }
]

export const MOCK_TRANSLATION_MEMORY: TranslationMemory[] = [
  {
    id: 'mem-1',
    sourceText: 'Machine learning model',
    translatedText: 'Modelo de aprendizaje automático',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    domain: 'technology',
    usageCount: 12,
    quality: 0.95,
    createdAt: new Date(Date.now() - 86400000 * 7),
    lastUsed: new Date(Date.now() - 3600000),
    isApproved: true,
    createdBy: 'user-1'
  },
  {
    id: 'mem-2',
    sourceText: 'Customer satisfaction',
    translatedText: 'Satisfaction client',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    domain: 'business',
    usageCount: 8,
    quality: 0.92,
    createdAt: new Date(Date.now() - 86400000 * 5),
    lastUsed: new Date(Date.now() - 7200000),
    isApproved: true,
    createdBy: 'user-1'
  }
]

export const MOCK_GLOSSARIES: TranslationGlossary[] = [
  {
    id: 'gloss-1',
    name: 'Tech Terms - EN to ES',
    description: 'Technical terminology for software projects',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    terms: [
      { id: 'term-1', sourceTerm: 'API', targetTerm: 'API', caseSensitive: true, category: 'Development' },
      { id: 'term-2', sourceTerm: 'Dashboard', targetTerm: 'Panel de control', caseSensitive: false, category: 'UI' },
      { id: 'term-3', sourceTerm: 'Backend', targetTerm: 'Backend', caseSensitive: false, category: 'Architecture' }
    ],
    isPublic: true,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 2)
  }
]

export const MOCK_TRANSLATION_STATS: TranslationStats = {
  totalTranslations: 1247,
  charactersTranslated: 45892,
  languagePairs: [
    { from: 'en', to: 'es', count: 342 },
    { from: 'en', to: 'fr', count: 287 },
    { from: 'en', to: 'de', count: 198 },
    { from: 'es', to: 'en', count: 156 },
    { from: 'zh', to: 'en', count: 124 }
  ],
  popularLanguages: [
    { language: 'en', percentage: 45 },
    { language: 'es', percentage: 28 },
    { language: 'fr', percentage: 15 },
    { language: 'de', percentage: 8 },
    { language: 'zh', percentage: 4 }
  ],
  averageConfidence: 0.94,
  averageProcessingTime: 1250,
  successRate: 0.98
}

// Helper Functions
export function getLanguageInfo(code: Language): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function estimateTranslationCost(characterCount: number, quality: TranslationQuality): number {
  const baseRate = 0.00002 // $0.00002 per character
  const qualityMultiplier = {
    fast: 1.0,
    balanced: 1.5,
    accurate: 2.0,
    native: 3.0
  }

  return characterCount * baseRate * qualityMultiplier[quality]
}

export function estimateDocumentTranslationTime(
  pageCount: number,
  targetLanguages: number,
  quality: TranslationQuality
): number {
  const baseTimePerPage = 30 // seconds
  const languageMultiplier = targetLanguages
  const qualityMultiplier = {
    fast: 1.0,
    balanced: 1.3,
    accurate: 1.8,
    native: 2.5
  }

  return pageCount * baseTimePerPage * languageMultiplier * qualityMultiplier[quality]
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.95) return 'Excellent'
  if (confidence >= 0.85) return 'Good'
  if (confidence >= 0.75) return 'Fair'
  return 'Low'
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.95) return 'green'
  if (confidence >= 0.85) return 'blue'
  if (confidence >= 0.75) return 'yellow'
  return 'red'
}

export function calculateTranslationAccuracy(
  translationsCompleted: number,
  translationsFailed: number
): number {
  const total = translationsCompleted + translationsFailed
  if (total === 0) return 0
  return (translationsCompleted / total) * 100
}

export function groupTranslationsByLanguagePair(
  translations: TranslationResult[]
): Map<string, number> {
  const pairs = new Map<string, number>()

  translations.forEach(trans => {
    const key = `${trans.sourceLanguage}-${trans.targetLanguage}`
    pairs.set(key, (pairs.get(key) || 0) + 1)
  })

  return pairs
}

export function detectLanguage(text: string): Language {
  // Simple heuristic - in production would use actual language detection
  const patterns: Array<{ pattern: RegExp; language: Language }> = [
    { pattern: /[\u4e00-\u9fa5]/, language: 'zh' },
    { pattern: /[\u3040-\u309f\u30a0-\u30ff]/, language: 'ja' },
    { pattern: /[\uac00-\ud7af]/, language: 'ko' },
    { pattern: /[\u0600-\u06ff]/, language: 'ar' },
    { pattern: /[\u0400-\u04ff]/, language: 'ru' },
    { pattern: /[\u0e00-\u0e7f]/, language: 'th' }
  ]

  for (const { pattern, language } of patterns) {
    if (pattern.test(text)) return language
  }

  return 'en' // Default to English
}
