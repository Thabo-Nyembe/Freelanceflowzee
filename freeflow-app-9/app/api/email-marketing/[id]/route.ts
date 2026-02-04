/**
 * Email Marketing API - Single Resource Routes
 *
 * PUT - Update campaign, subscriber, segment, template, automation, schedule/send campaign
 * DELETE - Delete campaign, subscriber, segment, template, automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('email-marketing')
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
  updateEmailCampaign,
  scheduleCampaign,
  sendCampaign,
  deleteEmailCampaign,
  updateEmailSubscriber,
  unsubscribeEmail,
  deleteEmailSubscriber,
  updateEmailSegment,
  deleteEmailSegment,
  updateEmailTemplate,
  deleteEmailTemplate,
  updateEmailAutomation,
  toggleAutomationStatus,
  deleteEmailAutomation
} from '@/lib/email-marketing-queries'

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
      case 'campaign': {
        if (action === 'schedule') {
          const result = await scheduleCampaign(id, updates.scheduled_at)
          return NextResponse.json({ data: result.data })
        } else if (action === 'send') {
          const result = await sendCampaign(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateEmailCampaign(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'subscriber': {
        if (action === 'unsubscribe') {
          const result = await unsubscribeEmail(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateEmailSubscriber(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'segment': {
        const result = await updateEmailSegment(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'template': {
        const result = await updateEmailTemplate(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'automation': {
        if (action === 'toggle-status') {
          const result = await toggleAutomationStatus(id, updates.status)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateEmailAutomation(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update resource', { error })
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
    const type = searchParams.get('type') || 'campaign'

    switch (type) {
      case 'campaign': {
        await deleteEmailCampaign(id)
        return NextResponse.json({ success: true })
      }

      case 'subscriber': {
        await deleteEmailSubscriber(id)
        return NextResponse.json({ success: true })
      }

      case 'segment': {
        await deleteEmailSegment(id)
        return NextResponse.json({ success: true })
      }

      case 'template': {
        await deleteEmailTemplate(id)
        return NextResponse.json({ success: true })
      }

      case 'automation': {
        await deleteEmailAutomation(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
