/**
 * AI Business API Routes
 *
 * REST endpoints for AI Business Advisory:
 * GET - Project analyses, business insights, pricing recommendations, advisory sessions, session messages, growth forecasts, stats
 * POST - Create analyses, insights, recommendations, sessions, messages, forecasts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getProjectAnalyses,
  createProjectAnalysis,
  getAnalysesByProject,
  getBusinessInsights,
  createBusinessInsight,
  getInsightsByType,
  getPricingRecommendations,
  createPricingRecommendation,
  getRecommendationsByProject,
  getAdvisorySessions,
  createAdvisorySession,
  getActiveSession,
  getSessionMessages,
  createSessionMessage,
  getGrowthForecasts,
  createGrowthForecast,
  getForecastsByType,
  getAIBusinessStats,
  getRecentActivity
} from '@/lib/ai-business-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const projectId = searchParams.get('project_id')
    const insightType = searchParams.get('insight_type') as any
    const forecastType = searchParams.get('forecast_type') as any
    const sessionId = searchParams.get('session_id')
    const status = searchParams.get('status') as any
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'project-analyses': {
        const filters: any = { limit }
        if (status) filters.status = status
        const result = await getProjectAnalyses(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'analyses-by-project': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const result = await getAnalysesByProject(projectId)
        return NextResponse.json({ data: result.data })
      }

      case 'business-insights': {
        const filters: any = { limit }
        if (insightType) filters.type = insightType
        const result = await getBusinessInsights(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'insights-by-type': {
        if (!insightType) {
          return NextResponse.json({ error: 'insight_type required' }, { status: 400 })
        }
        const result = await getInsightsByType(user.id, insightType)
        return NextResponse.json({ data: result.data })
      }

      case 'pricing-recommendations': {
        const filters: any = { limit }
        if (status) filters.status = status
        const result = await getPricingRecommendations(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'recommendations-by-project': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const result = await getRecommendationsByProject(projectId)
        return NextResponse.json({ data: result.data })
      }

      case 'advisory-sessions': {
        const filters: any = { limit }
        if (status) filters.status = status
        const result = await getAdvisorySessions(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'active-session': {
        const result = await getActiveSession(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'session-messages': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const result = await getSessionMessages(sessionId)
        return NextResponse.json({ data: result.data })
      }

      case 'growth-forecasts': {
        const filters: any = { limit }
        if (forecastType) filters.type = forecastType
        const result = await getGrowthForecasts(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'forecasts-by-type': {
        if (!forecastType) {
          return NextResponse.json({ error: 'forecast_type required' }, { status: 400 })
        }
        const result = await getForecastsByType(user.id, forecastType)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getAIBusinessStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'recent-activity': {
        const result = await getRecentActivity(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Business API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI Business data' },
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
      case 'create-project-analysis': {
        const result = await createProjectAnalysis(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-business-insight': {
        const result = await createBusinessInsight(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-pricing-recommendation': {
        const result = await createPricingRecommendation(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-advisory-session': {
        const result = await createAdvisorySession(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-session-message': {
        const result = await createSessionMessage(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-growth-forecast': {
        const result = await createGrowthForecast(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Business API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI Business request' },
      { status: 500 }
    )
  }
}
