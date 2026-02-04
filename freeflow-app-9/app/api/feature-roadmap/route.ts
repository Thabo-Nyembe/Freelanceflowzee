/**
 * Feature Roadmap API Routes
 *
 * REST endpoints for Feature Roadmap:
 * GET - List features, requests, votes, subscriptions, updates, stats
 * POST - Create request, vote, subscribe, create update
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('feature-roadmap')
import {

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}
  getRoadmapFeatures,
  getFeaturedFeatures,
  getInProgressFeatures,
  getCompletedFeatures,
  getFeaturesByCategory,
  getFeatureRequests,
  getUserFeatureRequests,
  getPopularRequests,
  createFeatureRequest,
  getUserVotes,
  voteForRoadmapFeature,
  voteForFeatureRequest,
  removeVote,
  hasUserVoted,
  getUserSubscriptions,
  subscribeToFeature,
  unsubscribeFromFeature,
  isUserSubscribed,
  getRecentUpdates,
  createFeatureUpdate,
  getRoadmapStats,
  exportRoadmapFeatures,
  exportFeatureRequests
} from '@/lib/feature-roadmap-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'features'
    const status = searchParams.get('status') as string | null
    const category = searchParams.get('category') as string | null
    const requestStatus = searchParams.get('request_status') as string | null
    const featureId = searchParams.get('feature_id')
    const requestId = searchParams.get('request_id')
    const sortBy = (searchParams.get('sort_by') || 'recent') as 'recent' | 'popular' | 'priority'
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (type) {
      case 'features': {
        const data = await getRoadmapFeatures(status, category, sortBy)
        return NextResponse.json({ data })
      }

      case 'featured': {
        const data = await getFeaturedFeatures(limit)
        return NextResponse.json({ data })
      }

      case 'in-progress': {
        const data = await getInProgressFeatures(limit)
        return NextResponse.json({ data })
      }

      case 'completed': {
        const data = await getCompletedFeatures(limit)
        return NextResponse.json({ data })
      }

      case 'by-category': {
        if (!category) {
          return NextResponse.json({ error: 'category required' }, { status: 400 })
        }
        const data = await getFeaturesByCategory(category)
        return NextResponse.json({ data })
      }

      case 'requests': {
        const data = await getFeatureRequests(
          requestStatus,
          category,
          sortBy === 'priority' ? 'popular' : sortBy,
          limit
        )
        return NextResponse.json({ data })
      }

      case 'my-requests': {
        const data = await getUserFeatureRequests(user.id)
        return NextResponse.json({ data })
      }

      case 'popular-requests': {
        const data = await getPopularRequests(category || undefined, limit)
        return NextResponse.json({ data })
      }

      case 'my-votes': {
        const data = await getUserVotes(user.id)
        return NextResponse.json({ data })
      }

      case 'has-voted': {
        const voted = await hasUserVoted(
          user.id,
          featureId || undefined,
          requestId || undefined
        )
        return NextResponse.json({ data: { has_voted: voted } })
      }

      case 'my-subscriptions': {
        const data = await getUserSubscriptions(user.id)
        return NextResponse.json({ data })
      }

      case 'is-subscribed': {
        const subscribed = await isUserSubscribed(
          user.id,
          featureId || undefined,
          requestId || undefined
        )
        return NextResponse.json({ data: { is_subscribed: subscribed } })
      }

      case 'recent-updates': {
        const data = await getRecentUpdates(limit)
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getRoadmapStats()
        return NextResponse.json({ data })
      }

      case 'export-features': {
        const data = await exportRoadmapFeatures()
        return NextResponse.json({ data })
      }

      case 'export-requests': {
        const data = await exportFeatureRequests()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Feature Roadmap API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Feature Roadmap data' },
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
        const data = await createFeatureRequest({
          title: payload.title,
          description: payload.description,
          category: payload.category,
          priority: payload.priority,
          use_case: payload.use_case,
          expected_benefit: payload.expected_benefit,
          alternative_solutions: payload.alternative_solutions
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'vote-feature': {
        const data = await voteForRoadmapFeature(
          payload.feature_id,
          payload.vote_type || 'upvote'
        )
        return NextResponse.json({ data })
      }

      case 'vote-request': {
        const data = await voteForFeatureRequest(
          payload.request_id,
          payload.vote_type || 'upvote'
        )
        return NextResponse.json({ data })
      }

      case 'remove-vote': {
        await removeVote(
          payload.feature_id || undefined,
          payload.request_id || undefined
        )
        return NextResponse.json({ success: true })
      }

      case 'subscribe': {
        const data = await subscribeToFeature(
          payload.feature_id || undefined,
          payload.request_id || undefined,
          payload.email
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'unsubscribe': {
        await unsubscribeFromFeature(
          payload.feature_id || undefined,
          payload.request_id || undefined
        )
        return NextResponse.json({ success: true })
      }

      case 'create-update': {
        const data = await createFeatureUpdate({
          roadmap_feature_id: payload.roadmap_feature_id,
          title: payload.title,
          description: payload.description,
          update_type: payload.update_type,
          old_progress: payload.old_progress,
          new_progress: payload.new_progress,
          old_status: payload.old_status,
          new_status: payload.new_status,
          metadata: payload.metadata
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Feature Roadmap API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Feature Roadmap request' },
      { status: 500 }
    )
  }
}
