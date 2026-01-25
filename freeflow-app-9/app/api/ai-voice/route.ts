/**
 * AI Voice Synthesis API Routes
 *
 * REST endpoints for AI Voice Synthesis:
 * GET - Voices, syntheses, clones, projects, scripts, analytics, stats
 * POST - Create voices, syntheses, clones, projects, scripts, analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-voice')
import {
  getVoices,
  createVoice,
  getPopularVoices,
  getNewVoices,
  searchVoicesByTags,
  getVoicesByLanguage,
  getVoiceSyntheses,
  createVoiceSynthesis,
  getFavoriteSyntheses,
  getRecentSyntheses,
  getSynthesesByVoice,
  getVoiceClones,
  createVoiceClone,
  getVoiceProjects,
  createVoiceProject,
  getVoiceScripts,
  createVoiceScript,
  getVoiceAnalytics,
  createVoiceAnalytics,
  getUserVoiceStats,
  incrementVoiceUsage,
  trackVoiceAnalytics
} from '@/lib/ai-voice-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'voices'
    const language = searchParams.get('language')
    const gender = searchParams.get('gender') as any
    const isPremium = searchParams.get('is_premium')
    const isPublic = searchParams.get('is_public')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')
    const voiceId = searchParams.get('voice_id')
    const projectId = searchParams.get('project_id')
    const isFavorite = searchParams.get('is_favorite')
    const status = searchParams.get('status') as any
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'voices': {
        const filters: any = {}
        if (language) filters.language = language
        if (gender) filters.gender = gender
        if (isPremium !== null) filters.is_premium = isPremium === 'true'
        if (isPublic !== null) filters.is_public = isPublic === 'true'
        if (search) filters.search = search
        const result = await getVoices(filters)
        return NextResponse.json({ data: result.data })
      }

      case 'popular-voices': {
        const result = await getPopularVoices(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'new-voices': {
        const result = await getNewVoices(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'voices-by-tags': {
        if (!tags) {
          return NextResponse.json({ error: 'tags required' }, { status: 400 })
        }
        const tagArray = tags.split(',')
        const result = await searchVoicesByTags(tagArray)
        return NextResponse.json({ data: result.data })
      }

      case 'voices-by-language': {
        if (!language) {
          return NextResponse.json({ error: 'language required' }, { status: 400 })
        }
        const result = await getVoicesByLanguage(language)
        return NextResponse.json({ data: result.data })
      }

      case 'syntheses': {
        const filters: any = {}
        if (voiceId) filters.voice_id = voiceId
        if (isFavorite !== null) filters.is_favorite = isFavorite === 'true'
        if (search) filters.search = search
        const result = await getVoiceSyntheses(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'favorite-syntheses': {
        const result = await getFavoriteSyntheses(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'recent-syntheses': {
        const result = await getRecentSyntheses(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'syntheses-by-voice': {
        if (!voiceId) {
          return NextResponse.json({ error: 'voice_id required' }, { status: 400 })
        }
        const result = await getSynthesesByVoice(user.id, voiceId)
        return NextResponse.json({ data: result.data })
      }

      case 'clones': {
        const filters: any = {}
        if (status) filters.status = status
        const result = await getVoiceClones(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'projects': {
        const filters: any = {}
        if (status) filters.status = status
        const result = await getVoiceProjects(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'scripts': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const result = await getVoiceScripts(projectId)
        return NextResponse.json({ data: result.data })
      }

      case 'analytics': {
        const result = await getVoiceAnalytics(user.id, startDate || undefined, endDate || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getUserVoiceStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Voice API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI Voice data' },
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
      case 'create-voice': {
        const result = await createVoice(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-synthesis': {
        const result = await createVoiceSynthesis(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-clone': {
        const result = await createVoiceClone(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-project': {
        const result = await createVoiceProject(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-script': {
        const result = await createVoiceScript(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-analytics': {
        const result = await createVoiceAnalytics(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'increment-usage': {
        if (!payload.voice_id) {
          return NextResponse.json({ error: 'voice_id required' }, { status: 400 })
        }
        const result = await incrementVoiceUsage(payload.voice_id)
        return NextResponse.json({ data: result.data })
      }

      case 'track-analytics': {
        const result = await trackVoiceAnalytics(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Voice API error', { error })
    return NextResponse.json(
      { error: 'Failed to process AI Voice request' },
      { status: 500 }
    )
  }
}
