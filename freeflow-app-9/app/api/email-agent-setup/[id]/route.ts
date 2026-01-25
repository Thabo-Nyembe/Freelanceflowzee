/**
 * Email Agent Setup API - Single Resource Routes
 *
 * GET - Get single integration, config
 * PUT - Update integration, configs, connect/disconnect
 * DELETE - Delete integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('email-agent-setup')
import {
  getIntegration,
  updateIntegration,
  connectIntegration,
  disconnectIntegration,
  deleteIntegration,
  updateIntegrationConfig,
  updateEmailConfig,
  updateAIConfig,
  updateCalendarConfig,
  updatePaymentConfig,
  updateSMSConfig,
  updateCRMConfig
} from '@/lib/email-agent-setup-queries'

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
        const result = await getIntegration(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Email Agent Setup API error', { error })
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
        if (action === 'connect') {
          const result = await connectIntegration(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'disconnect') {
          const result = await disconnectIntegration(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateIntegration(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'integration-config': {
        const result = await updateIntegrationConfig(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'email-config': {
        const result = await updateEmailConfig(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'ai-config': {
        const result = await updateAIConfig(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'calendar-config': {
        const result = await updateCalendarConfig(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'payment-config': {
        const result = await updatePaymentConfig(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'sms-config': {
        const result = await updateSMSConfig(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'crm-config': {
        const result = await updateCRMConfig(user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Email Agent Setup API error', { error })
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
        await deleteIntegration(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Email Agent Setup API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
