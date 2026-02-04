/**
 * Admin Marketing API - Single Resource Routes
 *
 * PUT - Update lead, campaign, goal, metric, email campaign
 * DELETE - Delete lead, campaign, goal, metric, email campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-marketing')
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
  updateLead,
  deleteLead,
  convertLead,
  updateCampaign,
  deleteCampaign,
  pauseCampaign,
  resumeCampaign,
  updateCampaignGoal,
  deleteCampaignGoal,
  updateCampaignMetric,
  deleteCampaignMetric,
  updateEmailCampaign,
  deleteEmailCampaign,
  sendEmailCampaign
} from '@/lib/admin-marketing-queries'

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
      case 'lead': {
        if (action === 'convert') {
          const result = await convertLead(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateLead(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'campaign': {
        if (action === 'pause') {
          const result = await pauseCampaign(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'resume') {
          const result = await resumeCampaign(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateCampaign(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'campaign-goal': {
        const result = await updateCampaignGoal(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'campaign-metric': {
        const result = await updateCampaignMetric(id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'email-campaign': {
        if (action === 'send') {
          const result = await sendEmailCampaign(id)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateEmailCampaign(id, updates)
        return NextResponse.json({ data: result.data })
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
    const type = searchParams.get('type') || 'lead'

    switch (type) {
      case 'lead': {
        await deleteLead(id)
        return NextResponse.json({ success: true })
      }

      case 'campaign': {
        await deleteCampaign(id)
        return NextResponse.json({ success: true })
      }

      case 'campaign-goal': {
        await deleteCampaignGoal(id)
        return NextResponse.json({ success: true })
      }

      case 'campaign-metric': {
        await deleteCampaignMetric(id)
        return NextResponse.json({ success: true })
      }

      case 'email-campaign': {
        await deleteEmailCampaign(id)
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
