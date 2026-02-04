/**
 * AI Settings API - Single Resource Routes
 *
 * GET - Get single provider, model
 * PUT - Update provider, model, feature, API key, preferences, status, budget, rate limits
 * DELETE - Delete provider, feature, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ai-settings')
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
  getProvider,
  updateProvider,
  updateProviderStatus,
  deleteProvider,
  getModel,
  updateModel,
  toggleFeature,
  updateFeature,
  deleteFeature,
  updateAPIKey,
  deleteAPIKey,
  updateUsageStats,
  upsertAIPreferences,
  updateAIBudget,
  updateAIRateLimits,
  updateDefaultProviders,
  toggleAILogging
} from '@/lib/ai-settings-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'provider'

    switch (type) {
      case 'provider': {
        const result = await getProvider(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'model': {
        const result = await getModel(id)
        if (!result.data) {
          return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'provider': {
        if (action === 'update-status') {
          const result = await updateProviderStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateProvider(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'model': {
        const result = await updateModel(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'feature': {
        if (action === 'toggle') {
          const result = await toggleFeature(id, updates.is_enabled)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateFeature(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'api-key': {
        const result = await updateAPIKey(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'usage-stats': {
        const result = await updateUsageStats(user.id, updates.date, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'preferences': {
        if (action === 'update-budget') {
          const result = await updateAIBudget(user.id, updates.monthly_budget)
          return NextResponse.json({ data: result.data })
        } else if (action === 'update-rate-limits') {
          const result = await updateAIRateLimits(user.id, updates.per_minute, updates.per_hour)
          return NextResponse.json({ data: result.data })
        } else if (action === 'update-default-providers') {
          const result = await updateDefaultProviders(user.id, updates.default_providers)
          return NextResponse.json({ data: result.data })
        } else if (action === 'toggle-logging') {
          const result = await toggleAILogging(user.id, updates.enabled)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await upsertAIPreferences(user.id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'provider'

    switch (type) {
      case 'provider': {
        await deleteProvider(id)
        return NextResponse.json({ success: true })
      }

      case 'feature': {
        await deleteFeature(id)
        return NextResponse.json({ success: true })
      }

      case 'api-key': {
        await deleteAPIKey(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('AI Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
