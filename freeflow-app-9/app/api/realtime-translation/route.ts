/**
 * Realtime Translation API Routes
 *
 * REST endpoints for Translation:
 * GET - List requests, results, sessions, participants, transcripts, documents, memory, glossaries, stats
 * POST - Create request, session, participant, document, memory entry, glossary, term
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTranslationRequests,
  createTranslationRequest,
  getTranslationResults,
  getLiveSessions,
  createLiveSession,
  getSessionParticipants,
  addParticipant,
  getTranscriptSegments,
  createTranscriptSegment,
  getDocumentTranslations,
  createDocumentTranslation,
  getTranslationMemory,
  addToMemory,
  getGlossaries,
  createGlossary,
  getGlossaryTerms,
  addGlossaryTerm,
  getTranslationStats
} from '@/lib/realtime-translation-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'requests'
    const requestId = searchParams.get('request_id')
    const sessionId = searchParams.get('session_id')
    const glossaryId = searchParams.get('glossary_id')
    const status = searchParams.get('status') as any
    const sessionStatus = searchParams.get('session_status') as any
    const sourceLanguage = searchParams.get('source_language') as any
    const targetLanguage = searchParams.get('target_language') as any

    switch (type) {
      case 'requests': {
        const filters: any = {}
        if (status) filters.status = status
        const result = await getTranslationRequests(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'results': {
        if (!requestId) {
          return NextResponse.json({ error: 'request_id required' }, { status: 400 })
        }
        const result = await getTranslationResults(requestId)
        return NextResponse.json({ data: result.data })
      }

      case 'sessions': {
        const filters: any = {}
        if (sessionStatus) filters.status = sessionStatus
        const result = await getLiveSessions(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'participants': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const result = await getSessionParticipants(sessionId)
        return NextResponse.json({ data: result.data })
      }

      case 'transcripts': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const result = await getTranscriptSegments(sessionId)
        return NextResponse.json({ data: result.data })
      }

      case 'documents': {
        const filters: any = {}
        if (status) filters.status = status
        const result = await getDocumentTranslations(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'memory': {
        const filters: any = {}
        if (sourceLanguage) filters.sourceLanguage = sourceLanguage
        if (targetLanguage) filters.targetLanguage = targetLanguage
        const result = await getTranslationMemory(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'glossaries': {
        const result = await getGlossaries(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'glossary-terms': {
        if (!glossaryId) {
          return NextResponse.json({ error: 'glossary_id required' }, { status: 400 })
        }
        const result = await getGlossaryTerms(glossaryId)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getTranslationStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Realtime Translation API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Translation data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-request': {
        const result = await createTranslationRequest(user.id, {
          source_language: payload.source_language,
          target_language: payload.target_language,
          mode: payload.mode,
          engine: payload.engine,
          quality: payload.quality,
          content: payload.content,
          status: payload.status || 'pending'
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-session': {
        const result = await createLiveSession(user.id, {
          name: payload.name,
          source_language: payload.source_language,
          target_languages: payload.target_languages,
          mode: payload.mode,
          status: payload.status || 'active',
          auto_detect_language: payload.auto_detect_language,
          show_original_text: payload.show_original_text,
          enable_subtitles: payload.enable_subtitles,
          save_transcript: payload.save_transcript,
          filter_profanity: payload.filter_profanity
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-participant': {
        const result = await addParticipant(payload.session_id, {
          user_id: user.id,
          name: payload.name,
          avatar: payload.avatar,
          language: payload.language,
          role: payload.role
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-transcript': {
        const result = await createTranscriptSegment(payload.session_id, {
          speaker_id: payload.speaker_id,
          speaker_name: payload.speaker_name,
          original_text: payload.original_text,
          original_language: payload.original_language,
          translations: payload.translations,
          confidence: payload.confidence,
          is_final: payload.is_final,
          timestamp: payload.timestamp
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-document': {
        const result = await createDocumentTranslation(user.id, {
          file_name: payload.file_name,
          file_size: payload.file_size,
          file_type: payload.file_type,
          file_url: payload.file_url,
          source_language: payload.source_language,
          target_languages: payload.target_languages,
          status: payload.status || 'pending',
          preserve_formatting: payload.preserve_formatting
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-to-memory': {
        const result = await addToMemory(user.id, {
          source_text: payload.source_text,
          translated_text: payload.translated_text,
          source_language: payload.source_language,
          target_language: payload.target_language,
          context: payload.context,
          domain: payload.domain,
          quality: payload.quality,
          is_approved: payload.is_approved
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-glossary': {
        const result = await createGlossary(user.id, {
          name: payload.name,
          description: payload.description,
          source_language: payload.source_language,
          target_language: payload.target_language,
          is_public: payload.is_public
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-glossary-term': {
        const result = await addGlossaryTerm(payload.glossary_id, {
          source_term: payload.source_term,
          target_term: payload.target_term,
          context: payload.context,
          case_sensitive: payload.case_sensitive,
          category: payload.category
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Realtime Translation API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Translation request' },
      { status: 500 }
    )
  }
}
