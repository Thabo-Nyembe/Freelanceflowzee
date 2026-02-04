/**
 * Integration Setup API - Single Resource Routes
 *
 * GET - Get single session, step, validation
 * PUT - Update session, step, validation, resolve error
 * DELETE - Abandon session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('integration-setup')
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
  getSetupSession,
  updateSetupSession,
  completeSetupSession,
  abandonSetupSession,
  updateSetupStep,
  startStep,
  completeStep,
  skipStep,
  markStepHelpAccessed,
  getValidationResult,
  updateValidationResult,
  markValidationValid,
  markValidationInvalid,
  resolveSetupError,
  incrementRequiredIntegrationsCompleted,
  incrementOptionalIntegrationsCompleted,
  skipOptionalIntegrations
} from '@/lib/integration-setup-queries'

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
    const type = searchParams.get('type') || 'session'

    switch (type) {
      case 'session': {
        const result = await getSetupSession(id)
        return NextResponse.json({ data: result.data })
      }

      case 'validation': {
        const result = await getValidationResult(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integration Setup API error', { error })
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
      case 'session': {
        if (action === 'complete') {
          const result = await completeSetupSession(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'abandon') {
          const result = await abandonSetupSession(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateSetupSession(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'step': {
        if (action === 'start') {
          const result = await startStep(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'complete') {
          const result = await completeStep(id, updates.step_data)
          return NextResponse.json({ data: result.data })
        } else if (action === 'skip') {
          const result = await skipStep(id, updates.reason)
          return NextResponse.json({ data: result.data })
        } else if (action === 'help-accessed') {
          const result = await markStepHelpAccessed(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateSetupStep(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'validation': {
        if (action === 'mark-valid') {
          const result = await markValidationValid(id, updates.response_time_ms)
          return NextResponse.json({ data: result.data })
        } else if (action === 'mark-invalid') {
          const result = await markValidationInvalid(id, updates.error_message, updates.error_code)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateValidationResult(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'error': {
        if (action === 'resolve') {
          const result = await resolveSetupError(id, updates.resolution_notes)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for error' }, { status: 400 })
      }

      case 'onboarding': {
        if (action === 'increment-required') {
          const result = await incrementRequiredIntegrationsCompleted(user.id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'increment-optional') {
          const result = await incrementOptionalIntegrationsCompleted(user.id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'skip-optional') {
          const result = await skipOptionalIntegrations(user.id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for onboarding' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integration Setup API error', { error })
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
    const type = searchParams.get('type') || 'session'

    switch (type) {
      case 'session': {
        await abandonSetupSession(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integration Setup API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
