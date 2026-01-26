/**
 * Real-time Translation Query Library
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

export type TranslationLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'nl' | 'sv' | 'pl' | 'tr' | 'th' | 'vi' | 'id' | 'ms'
export type TranslationMode = 'text' | 'voice' | 'video' | 'document' | 'subtitle' | 'live-chat'
export type TranslationQuality = 'fast' | 'balanced' | 'accurate' | 'native'
export type TranslationEngine = 'kazi-ai' | 'google' | 'deepl' | 'microsoft' | 'neural-mt'
export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type SessionStatus = 'active' | 'paused' | 'ended'
export type ParticipantRole = 'speaker' | 'listener' | 'moderator'

export interface TranslationRequest {
  id: string
  user_id: string
  source_language: TranslationLanguage
  target_language: TranslationLanguage
  mode: TranslationMode
  engine: TranslationEngine
  quality: TranslationQuality
  content: string
  status: TranslationStatus
  created_at: string
  updated_at: string
}

export interface TranslationResult {
  id: string
  request_id: string
  source_text: string
  translated_text: string
  source_language: TranslationLanguage
  target_language: TranslationLanguage
  confidence: number
  detected_language?: TranslationLanguage
  processing_time: number
  engine: TranslationEngine
  quality: TranslationQuality
  word_count: number
  character_count: number
  cost: number
  created_at: string
}

export interface LiveSession {
  id: string
  user_id: string
  name: string
  source_language: TranslationLanguage
  target_languages: TranslationLanguage[]
  mode: TranslationMode
  status: SessionStatus
  start_time: string
  end_time?: string
  duration: number
  auto_detect_language: boolean
  show_original_text: boolean
  enable_subtitles: boolean
  save_transcript: boolean
  filter_profanity: boolean
  created_at: string
  updated_at: string
}

export interface SessionParticipant {
  id: string
  session_id: string
  user_id: string
  name: string
  avatar?: string
  language: TranslationLanguage
  role: ParticipantRole
  is_active: boolean
  joined_at: string
  left_at?: string
  created_at: string
  updated_at: string
}

export interface TranscriptSegment {
  id: string
  session_id: string
  speaker_id: string
  speaker_name: string
  original_text: string
  original_language: TranslationLanguage
  translations: Record<string, string>
  confidence: number
  is_final: boolean
  timestamp: string
  created_at: string
}

export interface DocumentTranslation {
  id: string
  user_id: string
  file_name: string
  file_size: number
  file_type: string
  file_url?: string
  source_language: TranslationLanguage
  target_languages: TranslationLanguage[]
  status: TranslationStatus
  progress: number
  page_count?: number
  estimated_time: number
  preserve_formatting: boolean
  download_url?: string
  error_message?: string
  created_at: string
  completed_at?: string
  updated_at: string
}

export interface TranslationMemoryEntry {
  id: string
  user_id: string
  source_text: string
  translated_text: string
  source_language: TranslationLanguage
  target_language: TranslationLanguage
  context?: string
  domain?: string
  usage_count: number
  quality: number
  is_approved: boolean
  last_used: string
  created_at: string
  updated_at: string
}

export interface TranslationGlossary {
  id: string
  user_id: string
  name: string
  description?: string
  source_language: TranslationLanguage
  target_language: TranslationLanguage
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface GlossaryTerm {
  id: string
  glossary_id: string
  source_term: string
  target_term: string
  context?: string
  case_sensitive: boolean
  category?: string
  created_at: string
  updated_at: string
}

// REQUESTS
export async function getTranslationRequests(userId: string, filters?: { status?: TranslationStatus }) {
  const supabase = createClient()
  let query = supabase.from('translation_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createTranslationRequest(userId: string, request: Partial<TranslationRequest>) {
  const supabase = createClient()
  return await supabase.from('translation_requests').insert({ user_id: userId, ...request }).select().single()
}

export async function updateRequestStatus(requestId: string, status: TranslationStatus) {
  const supabase = createClient()
  return await supabase.from('translation_requests').update({ status }).eq('id', requestId).select().single()
}

// RESULTS
export async function getTranslationResults(requestId: string) {
  const supabase = createClient()
  return await supabase.from('translation_results').select('*').eq('request_id', requestId)
}

export async function createTranslationResult(requestId: string, result: Partial<TranslationResult>) {
  const supabase = createClient()
  return await supabase.from('translation_results').insert({ request_id: requestId, ...result }).select().single()
}

// LIVE SESSIONS
export async function getLiveSessions(userId: string, filters?: { status?: SessionStatus }) {
  const supabase = createClient()
  let query = supabase.from('live_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createLiveSession(userId: string, session: Partial<LiveSession>) {
  const supabase = createClient()
  return await supabase.from('live_sessions').insert({ user_id: userId, ...session }).select().single()
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus) {
  const supabase = createClient()
  return await supabase.from('live_sessions').update({ status }).eq('id', sessionId).select().single()
}

export async function deleteLiveSession(sessionId: string) {
  const supabase = createClient()
  return await supabase.from('live_sessions').delete().eq('id', sessionId)
}

// PARTICIPANTS
export async function getSessionParticipants(sessionId: string) {
  const supabase = createClient()
  return await supabase.from('session_participants').select('*').eq('session_id', sessionId).order('joined_at')
}

export async function addParticipant(sessionId: string, participant: Partial<SessionParticipant>) {
  const supabase = createClient()
  return await supabase.from('session_participants').insert({ session_id: sessionId, ...participant }).select().single()
}

export async function updateParticipantStatus(participantId: string, is_active: boolean) {
  const supabase = createClient()
  return await supabase.from('session_participants').update({ is_active }).eq('id', participantId).select().single()
}

// TRANSCRIPTS
export async function getTranscriptSegments(sessionId: string) {
  const supabase = createClient()
  return await supabase.from('transcript_segments').select('*').eq('session_id', sessionId).order('timestamp')
}

export async function createTranscriptSegment(sessionId: string, segment: Partial<TranscriptSegment>) {
  const supabase = createClient()
  return await supabase.from('transcript_segments').insert({ session_id: sessionId, ...segment }).select().single()
}

// DOCUMENTS
export async function getDocumentTranslations(userId: string, filters?: { status?: TranslationStatus }) {
  const supabase = createClient()
  let query = supabase.from('document_translations').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  return await query
}

export async function createDocumentTranslation(userId: string, doc: Partial<DocumentTranslation>) {
  const supabase = createClient()
  return await supabase.from('document_translations').insert({ user_id: userId, ...doc }).select().single()
}

export async function updateDocumentProgress(docId: string, progress: number, status?: TranslationStatus) {
  const supabase = createClient()
  const updates: { progress: number; status?: TranslationStatus } = { progress }
  if (status) updates.status = status
  return await supabase.from('document_translations').update(updates).eq('id', docId).select().single()
}

export async function deleteDocumentTranslation(docId: string) {
  const supabase = createClient()
  return await supabase.from('document_translations').delete().eq('id', docId)
}

// TRANSLATION MEMORY
export async function getTranslationMemory(userId: string, filters?: { sourceLanguage?: TranslationLanguage; targetLanguage?: TranslationLanguage }) {
  const supabase = createClient()
  let query = supabase.from('translation_memory').select('*').eq('user_id', userId).order('last_used', { ascending: false })
  if (filters?.sourceLanguage) query = query.eq('source_language', filters.sourceLanguage)
  if (filters?.targetLanguage) query = query.eq('target_language', filters.targetLanguage)
  return await query
}

export async function addToMemory(userId: string, entry: Partial<TranslationMemoryEntry>) {
  const supabase = createClient()
  return await supabase.from('translation_memory').insert({ user_id: userId, ...entry }).select().single()
}

export async function incrementMemoryUsage(memoryId: string) {
  const supabase = createClient()
  return await supabase.from('translation_memory').rpc('increment', { row_id: memoryId, field_name: 'usage_count' })
}

// GLOSSARIES
export async function getGlossaries(userId: string) {
  const supabase = createClient()
  return await supabase.from('translation_glossaries').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function createGlossary(userId: string, glossary: Partial<TranslationGlossary>) {
  const supabase = createClient()
  return await supabase.from('translation_glossaries').insert({ user_id: userId, ...glossary }).select().single()
}

export async function deleteGlossary(glossaryId: string) {
  const supabase = createClient()
  return await supabase.from('translation_glossaries').delete().eq('id', glossaryId)
}

// GLOSSARY TERMS
export async function getGlossaryTerms(glossaryId: string) {
  const supabase = createClient()
  return await supabase.from('translation_glossary_terms').select('*').eq('glossary_id', glossaryId).order('source_term')
}

export async function addGlossaryTerm(glossaryId: string, term: Partial<GlossaryTerm>) {
  const supabase = createClient()
  return await supabase.from('translation_glossary_terms').insert({ glossary_id: glossaryId, ...term }).select().single()
}

export async function deleteGlossaryTerm(termId: string) {
  const supabase = createClient()
  return await supabase.from('translation_glossary_terms').delete().eq('id', termId)
}

// STATS
export async function getTranslationStats(userId: string) {
  const supabase = createClient()
  const [requestsResult, resultsResult, sessionsResult, docsResult] = await Promise.all([
    supabase.from('translation_requests').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('translation_results').select('confidence, processing_time, character_count').eq('request_id', userId).limit(1000),
    supabase.from('live_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('document_translations').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed')
  ])

  const avgConfidence = resultsResult.data?.reduce((sum, r) => sum + (r.confidence || 0), 0) / (resultsResult.data?.length || 1) || 0
  const avgProcessingTime = resultsResult.data?.reduce((sum, r) => sum + (r.processing_time || 0), 0) / (resultsResult.data?.length || 1) || 0
  const totalChars = resultsResult.data?.reduce((sum, r) => sum + (r.character_count || 0), 0) || 0

  return {
    data: {
      total_translations: requestsResult.count || 0,
      total_sessions: sessionsResult.count || 0,
      total_documents: docsResult.count || 0,
      characters_translated: totalChars,
      average_confidence: avgConfidence,
      average_processing_time: avgProcessingTime
    },
    error: requestsResult.error || resultsResult.error || sessionsResult.error || docsResult.error
  }
}
