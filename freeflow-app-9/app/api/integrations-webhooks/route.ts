/**
 * Integrations & Webhooks API Routes
 *
 * REST endpoints for Integrations, Webhooks, API Keys, Sync Jobs:
 * GET - Integrations, webhooks, deliveries, incoming webhooks, sync jobs, API keys, stats
 * POST - Create integrations, webhooks, incoming webhooks, sync jobs, API keys, trigger webhooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('integrations-webhooks')
import {
  getIntegrations,
  getIntegrationByType,
  createIntegration,
  testIntegration,
  getWebhooks,
  createWebhook,
  triggerWebhook,
  getWebhookDeliveries,
  getIncomingWebhooks,
  createIncomingWebhook,
  getIncomingWebhookLogs,
  getSyncJobs,
  createSyncJob,
  getAPIKeys,
  createAPIKey,
  validateAPIKey,
  createOAuthState,
  getIntegrationStats
} from '@/lib/integrations-webhooks-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'integrations'
    const integrationType = searchParams.get('integration_type') as string | null
    const integrationId = searchParams.get('integration_id')
    const webhookId = searchParams.get('webhook_id')
    const endpointId = searchParams.get('endpoint_id')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'integrations': {
        const data = await getIntegrations(user.id)
        return NextResponse.json({ data })
      }

      case 'integration-by-type': {
        if (!integrationType) {
          return NextResponse.json({ error: 'integration_type required' }, { status: 400 })
        }
        const data = await getIntegrationByType(user.id, integrationType)
        return NextResponse.json({ data })
      }

      case 'webhooks': {
        const data = await getWebhooks(user.id)
        return NextResponse.json({ data })
      }

      case 'webhook-deliveries': {
        if (!webhookId) {
          return NextResponse.json({ error: 'webhook_id required' }, { status: 400 })
        }
        const options: any = { limit }
        if (status) options.status = status
        const data = await getWebhookDeliveries(webhookId, options)
        return NextResponse.json({ data })
      }

      case 'incoming-webhooks': {
        const data = await getIncomingWebhooks(user.id)
        return NextResponse.json({ data })
      }

      case 'incoming-webhook-logs': {
        if (!endpointId) {
          return NextResponse.json({ error: 'endpoint_id required' }, { status: 400 })
        }
        const options: any = { limit }
        if (status) options.status = status
        const data = await getIncomingWebhookLogs(endpointId, options)
        return NextResponse.json({ data })
      }

      case 'sync-jobs': {
        const options: any = { limit }
        if (integrationId) options.integrationId = integrationId
        if (status) options.status = status
        const data = await getSyncJobs(user.id, options)
        return NextResponse.json({ data })
      }

      case 'api-keys': {
        const data = await getAPIKeys(user.id)
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getIntegrationStats(user.id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Webhooks API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Integrations Webhooks data' },
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
      case 'create-integration': {
        const data = await createIntegration({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'test-integration': {
        const result = await testIntegration(payload.integration_id)
        return NextResponse.json({ data: result })
      }

      case 'create-webhook': {
        const data = await createWebhook({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'trigger-webhook': {
        const count = await triggerWebhook(user.id, payload.event_type, payload.payload)
        return NextResponse.json({ data: { deliveries_created: count } })
      }

      case 'create-incoming-webhook': {
        const data = await createIncomingWebhook({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-sync-job': {
        const data = await createSyncJob({ user_id: user.id, ...payload })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-api-key': {
        const result = await createAPIKey(user.id, payload.name, payload.scopes, payload.expires_at ? new Date(payload.expires_at) : undefined)
        return NextResponse.json({ data: result?.apiKey, plainTextKey: result?.plainTextKey }, { status: 201 })
      }

      case 'validate-api-key': {
        const result = await validateAPIKey(payload.key)
        return NextResponse.json({ data: result })
      }

      case 'create-oauth-state': {
        const state = await createOAuthState(user.id, payload.integration_type, payload.redirect_uri)
        return NextResponse.json({ data: { state } }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Webhooks API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Integrations Webhooks request' },
      { status: 500 }
    )
  }
}
