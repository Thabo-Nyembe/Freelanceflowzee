/**
 * AI Settings API Routes
 *
 * REST endpoints for AI Settings:
 * GET - Providers, models, features, usage records, API keys, usage stats, preferences
 * POST - Create provider, model, feature, usage record, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ai-settings')
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
  getProviders,
  createProvider,
  getProviderStats,
  getModels,
  createModel,
  getFeatures,
  createFeature,
  getUsageRecords,
  createUsageRecord,
  getUsageSummary,
  getAPIKeys,
  createAPIKey,
  getUsageStats,
  getTodayUsageStats,
  getAIPreferences
} from '@/lib/ai-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'providers'
    const providerId = searchParams.get('provider_id')
    const modelId = searchParams.get('model_id')
    const status = searchParams.get('status') as string | null
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    switch (type) {
      case 'providers': {
        const result = await getProviders(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'provider-stats': {
        const result = await getProviderStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'models': {
        if (!providerId) {
          return NextResponse.json({ error: 'provider_id required' }, { status: 400 })
        }
        const result = await getModels(providerId)
        return NextResponse.json({ data: result.data })
      }

      case 'features': {
        const result = await getFeatures(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'usage-records': {
        const filters: any = {}
        if (providerId) filters.provider_id = providerId
        if (modelId) filters.model_id = modelId
        if (status) filters.status = status
        if (dateFrom) filters.date_from = dateFrom
        if (dateTo) filters.date_to = dateTo
        const result = await getUsageRecords(user.id, Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'usage-summary': {
        const result = await getUsageSummary(user.id, dateFrom || undefined, dateTo || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'api-keys': {
        const result = await getAPIKeys(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'usage-stats': {
        const result = await getUsageStats(user.id, dateFrom || undefined, dateTo || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'today-stats': {
        const result = await getTodayUsageStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'preferences': {
        const result = await getAIPreferences(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch AI Settings data' },
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
      case 'create-provider': {
        const result = await createProvider(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-model': {
        const result = await createModel(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-feature': {
        const result = await createFeature(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-usage-record': {
        const result = await createUsageRecord(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-api-key': {
        const result = await createAPIKey(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process AI Settings request' },
      { status: 500 }
    )
  }
}
