/**
 * Integrations Configure API
 * Configure settings for connected integrations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('integrations-configure')

/**
 * POST /api/integrations/configure - Configure an integration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { integration_name, integration_id, enabled, settings } = body as {
      integration_name?: string
      integration_id?: string
      enabled?: boolean
      settings?: Record<string, unknown>
    }

    if (!integration_name && !integration_id) {
      return NextResponse.json(
        { error: 'integration_name or integration_id is required' },
        { status: 400 }
      )
    }

    // Find integration
    let query = supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)

    if (integration_id) {
      query = query.eq('id', integration_id)
    } else if (integration_name) {
      query = query.eq('name', integration_name)
    }

    const { data: integration, error: fetchError } = await query.single()

    if (fetchError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Update integration settings
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (enabled !== undefined) {
      updates.status = enabled ? 'active' : 'inactive'
    }

    if (settings) {
      updates.settings = {
        ...integration.settings,
        ...settings
      }
    }

    const { data, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', integration.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `${integration.name} configuration has been saved`,
      integration: {
        ...data,
        credentials: undefined // Don't expose credentials
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to configure integration'
    logger.error('Integration configure error', { error })
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
