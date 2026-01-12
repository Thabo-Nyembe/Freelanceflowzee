/**
 * Email Agent Setup API Routes
 *
 * REST endpoints for Email Agent Setup Wizard:
 * GET - Setup progress, integrations, configs (email/AI/calendar/payment/SMS/CRM), templates, stats
 * POST - Create progress, integrations, configs, test results
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSetupProgress,
  createSetupProgress,
  updateSetupProgress,
  advanceSetupStep,
  completeSetup,
  getIntegrations,
  createIntegration,
  getIntegrationConfig,
  createIntegrationConfig,
  getTestResults,
  createTestResult,
  getEmailConfig,
  createEmailConfig,
  getAIConfig,
  createAIConfig,
  getCalendarConfig,
  createCalendarConfig,
  getPaymentConfig,
  createPaymentConfig,
  getSMSConfig,
  createSMSConfig,
  getCRMConfig,
  createCRMConfig,
  getProviderTemplates,
  getRecommendedProviders,
  getSetupStats
} from '@/lib/email-agent-setup-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'progress'
    const integrationType = searchParams.get('integration_type') as any
    const integrationId = searchParams.get('integration_id')
    const status = searchParams.get('status') as any

    switch (type) {
      case 'progress': {
        const result = await getSetupProgress(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'integrations': {
        const filters: any = {}
        if (integrationType) filters.type = integrationType
        if (status) filters.status = status
        const result = await getIntegrations(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'integration-config': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await getIntegrationConfig(integrationId)
        return NextResponse.json({ data: result.data })
      }

      case 'test-results': {
        if (!integrationId) {
          return NextResponse.json({ error: 'integration_id required' }, { status: 400 })
        }
        const result = await getTestResults(integrationId)
        return NextResponse.json({ data: result.data })
      }

      case 'email-config': {
        const result = await getEmailConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'ai-config': {
        const result = await getAIConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'calendar-config': {
        const result = await getCalendarConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'payment-config': {
        const result = await getPaymentConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'sms-config': {
        const result = await getSMSConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'crm-config': {
        const result = await getCRMConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'provider-templates': {
        const result = await getProviderTemplates(integrationType || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'recommended-providers': {
        if (!integrationType) {
          return NextResponse.json({ error: 'integration_type required' }, { status: 400 })
        }
        const result = await getRecommendedProviders(integrationType)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getSetupStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Email Agent Setup API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Email Agent Setup data' },
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
      case 'create-progress': {
        const result = await createSetupProgress(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'update-progress': {
        const result = await updateSetupProgress(user.id, payload)
        return NextResponse.json({ data: result.data })
      }

      case 'advance-step': {
        const result = await advanceSetupStep(user.id, payload.next_step)
        return NextResponse.json({ data: result.data })
      }

      case 'complete-setup': {
        const result = await completeSetup(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'create-integration': {
        const result = await createIntegration(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-integration-config': {
        const result = await createIntegrationConfig(payload.integration_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-test-result': {
        const result = await createTestResult(payload.integration_id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-email-config': {
        const result = await createEmailConfig(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-ai-config': {
        const result = await createAIConfig(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-calendar-config': {
        const result = await createCalendarConfig(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-payment-config': {
        const result = await createPaymentConfig(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-sms-config': {
        const result = await createSMSConfig(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-crm-config': {
        const result = await createCRMConfig(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Email Agent Setup API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Email Agent Setup request' },
      { status: 500 }
    )
  }
}
