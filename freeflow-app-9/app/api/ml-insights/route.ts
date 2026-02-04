/**
 * ML Insights API Routes
 *
 * REST endpoints for ML Insights:
 * GET - Insights, models, predictions, anomalies, patterns, recommendations, alerts, stats
 * POST - Create insights, models, predictions, anomalies, patterns, recommendations, alerts, actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ml-insights')
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
  getMLInsights,
  createMLInsight,
  getMLModels,
  createMLModel,
  getMLPredictions,
  createMLPrediction,
  getMLAnomalies,
  createMLAnomaly,
  getMLPatterns,
  createMLPattern,
  getMLRecommendations,
  createMLRecommendation,
  getRecommendationActions,
  createRecommendationAction,
  getMLAlerts,
  createMLAlert,
  getMLStats
} from '@/lib/ml-insights-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'insights'
    const insightType = searchParams.get('insight_type') as string | null
    const category = searchParams.get('category') as string | null
    const algorithm = searchParams.get('algorithm') as string | null
    const severity = searchParams.get('severity') as string | null
    const frequency = searchParams.get('frequency') as string | null
    const modelId = searchParams.get('model_id')
    const recommendationId = searchParams.get('recommendation_id')
    const resolved = searchParams.get('resolved')
    const dismissed = searchParams.get('dismissed')
    const acknowledged = searchParams.get('acknowledged')

    switch (type) {
      case 'insights': {
        const filters: any = {}
        if (insightType) filters.type = insightType
        if (category) filters.category = category
        const result = await getMLInsights(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'models': {
        const filters: any = {}
        if (category) filters.category = category
        if (algorithm) filters.algorithm = algorithm
        const result = await getMLModels(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'predictions': {
        if (!modelId) {
          return NextResponse.json({ error: 'model_id required' }, { status: 400 })
        }
        const result = await getMLPredictions(modelId)
        return NextResponse.json({ data: result.data })
      }

      case 'anomalies': {
        const filters: any = {}
        if (category) filters.category = category
        if (severity) filters.severity = severity
        if (resolved !== null) filters.resolved = resolved === 'true'
        const result = await getMLAnomalies(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'patterns': {
        const filters: any = {}
        if (category) filters.category = category
        if (frequency) filters.frequency = frequency
        const result = await getMLPatterns(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'recommendations': {
        const filters: any = {}
        if (category) filters.category = category
        if (dismissed !== null) filters.dismissed = dismissed === 'true'
        const result = await getMLRecommendations(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'recommendation-actions': {
        if (!recommendationId) {
          return NextResponse.json({ error: 'recommendation_id required' }, { status: 400 })
        }
        const result = await getRecommendationActions(recommendationId)
        return NextResponse.json({ data: result.data })
      }

      case 'alerts': {
        const filters: any = {}
        if (severity) filters.severity = severity
        if (acknowledged !== null) filters.acknowledged = acknowledged === 'true'
        const result = await getMLAlerts(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getMLStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch ML Insights data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch ML Insights data' },
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
      case 'create-insight': {
        const result = await createMLInsight(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-model': {
        const result = await createMLModel(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-prediction': {
        if (!payload.model_id) {
          return NextResponse.json({ error: 'model_id required' }, { status: 400 })
        }
        const result = await createMLPrediction(payload.model_id, user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-anomaly': {
        const result = await createMLAnomaly(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-pattern': {
        const result = await createMLPattern(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-recommendation': {
        const result = await createMLRecommendation(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-recommendation-action': {
        if (!payload.recommendation_id) {
          return NextResponse.json({ error: 'recommendation_id required' }, { status: 400 })
        }
        const result = await createRecommendationAction(payload.recommendation_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-alert': {
        const result = await createMLAlert(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process ML Insights request', { error })
    return NextResponse.json(
      { error: 'Failed to process ML Insights request' },
      { status: 500 }
    )
  }
}
