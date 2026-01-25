/**
 * Integrations & Webhooks API - Single Resource Routes
 *
 * GET - Get single integration, webhook, incoming webhook
 * PUT - Update integration, webhook, sync job, toggle, revoke
 * DELETE - Delete integration, webhook, incoming webhook, API key
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('integrations-webhooks')
import {
  getIntegrationById,
  updateIntegration,
  deleteIntegration,
  disconnectIntegration,
  refreshIntegrationToken,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  regenerateWebhookSecret,
  retryWebhookDelivery,
  getIncomingWebhookById,
  updateIncomingWebhook,
  deleteIncomingWebhook,
  updateSyncJobProgress,
  cancelSyncJob,
  revokeAPIKey,
  deleteAPIKey,
  validateOAuthState
} from '@/lib/integrations-webhooks-queries'

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
    const type = searchParams.get('type') || 'integration'

    switch (type) {
      case 'integration': {
        const data = await getIntegrationById(id)
        return NextResponse.json({ data })
      }

      case 'webhook': {
        const data = await getWebhookById(id)
        return NextResponse.json({ data })
      }

      case 'incoming-webhook': {
        const data = await getIncomingWebhookById(id)
        return NextResponse.json({ data })
      }

      case 'validate-oauth': {
        const data = await validateOAuthState(id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Webhooks API error', { error })
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
      case 'integration': {
        if (action === 'disconnect') {
          const success = await disconnectIntegration(id)
          return NextResponse.json({ success })
        } else if (action === 'refresh-token') {
          const success = await refreshIntegrationToken(id)
          return NextResponse.json({ success })
        } else {
          const data = await updateIntegration(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'webhook': {
        if (action === 'toggle') {
          const success = await toggleWebhook(id, updates.is_active)
          return NextResponse.json({ success })
        } else if (action === 'regenerate-secret') {
          const secret = await regenerateWebhookSecret(id)
          return NextResponse.json({ data: { secret } })
        } else {
          const data = await updateWebhook(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'webhook-delivery': {
        if (action === 'retry') {
          const success = await retryWebhookDelivery(id)
          return NextResponse.json({ success })
        }
        return NextResponse.json({ error: 'Invalid action for webhook-delivery' }, { status: 400 })
      }

      case 'incoming-webhook': {
        const data = await updateIncomingWebhook(id, updates)
        return NextResponse.json({ data })
      }

      case 'sync-job': {
        if (action === 'cancel') {
          const success = await cancelSyncJob(id)
          return NextResponse.json({ success })
        } else {
          const success = await updateSyncJobProgress(id, updates)
          return NextResponse.json({ success })
        }
      }

      case 'api-key': {
        if (action === 'revoke') {
          const success = await revokeAPIKey(id)
          return NextResponse.json({ success })
        }
        return NextResponse.json({ error: 'Invalid action for api-key' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Webhooks API error', { error })
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
    const type = searchParams.get('type') || 'integration'

    switch (type) {
      case 'integration': {
        const success = await deleteIntegration(id)
        return NextResponse.json({ success })
      }

      case 'webhook': {
        const success = await deleteWebhook(id)
        return NextResponse.json({ success })
      }

      case 'incoming-webhook': {
        const success = await deleteIncomingWebhook(id)
        return NextResponse.json({ success })
      }

      case 'api-key': {
        const success = await deleteAPIKey(id)
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Integrations Webhooks API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
