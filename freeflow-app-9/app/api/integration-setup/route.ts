/**
 * Integration Setup API Routes
 *
 * REST endpoints for Integration Setup Wizard:
 * GET - Sessions, steps, validations, onboarding progress, errors, stats
 * POST - Create sessions, steps, validations, progress, errors
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getUserSetupSessions,
  getActiveSetupSession,
  createSetupSession,
  getSessionSteps,
  createSetupStep,
  createValidationResult,
  getIntegrationValidations,
  getLatestValidation,
  getOnboardingProgress,
  createOnboardingProgress,
  updateOnboardingProgress,
  advanceOnboardingStage,
  completeOnboarding,
  getUserSetupErrors,
  getUnresolvedErrors,
  logSetupError,
  getSetupStats,
  getOnboardingStats
} from '@/lib/integration-setup-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'sessions'
    const status = searchParams.get('status') as any
    const sessionId = searchParams.get('session_id')
    const integrationId = searchParams.get('integration_id')
    const validationType = searchParams.get('validation_type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'sessions': {
        const result = await getUserSetupSessions(user.id, status || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'active-session': {
        const result = await getActiveSetupSession(user.id, integrationId || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'session-steps': {
        if (!sessionId) {
          return NextResponse.json({ error: 'session_id required' }, { status: 400 })
        }
        const result = await getSessionSteps(sessionId)
        return NextResponse.json({ data: result.data })
      }

      case 'validations': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await getIntegrationValidations(integrationId, user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'latest-validation': {
        if (!integrationId || !validationType) {
          return NextResponse.json({ error: 'integration_id and validation_type required' }, { status: 400 })
        }
        const result = await getLatestValidation(integrationId, user.id, validationType)
        return NextResponse.json({ data: result.data })
      }

      case 'onboarding-progress': {
        const result = await getOnboardingProgress(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'errors': {
        const result = await getUserSetupErrors(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'unresolved-errors': {
        const result = await getUnresolvedErrors(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getSetupStats(user.id)
        return NextResponse.json({ data: result })
      }

      case 'onboarding-stats': {
        const result = await getOnboardingStats()
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Integration Setup API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Integration Setup data' },
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
      case 'create-session': {
        const result = await createSetupSession(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-step': {
        const result = await createSetupStep(payload.session_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-validation': {
        const result = await createValidationResult({ user_id: user.id, ...payload })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-onboarding-progress': {
        const result = await createOnboardingProgress(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-onboarding-progress': {
        const result = await updateOnboardingProgress(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'advance-onboarding': {
        const result = await advanceOnboardingStage(user.id, payload.next_stage)
        return NextResponse.json({ data: result.data })
      }

      case 'complete-onboarding': {
        const result = await completeOnboarding(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'log-error': {
        const result = await logSetupError({ user_id: user.id, ...payload })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Integration Setup API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Integration Setup request' },
      { status: 500 }
    )
  }
}
