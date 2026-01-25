/**
 * KAZI Email Campaigns API
 *
 * Endpoints for campaign management, sending, and analytics.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { campaignSenderService } from '@/lib/email/campaign-sender-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('email-campaigns')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')?.split(',')
    const type = searchParams.get('type')?.split(',')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { campaigns, total } = await campaignSenderService.getCampaignsByUser(user.id, {
      status: status as any,
      type: type as any,
      limit,
      offset
    })

    return NextResponse.json({
      campaigns,
      total,
      limit,
      offset
    })
  } catch (error) {
    logger.error('Failed to fetch campaigns', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch campaigns' },
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
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        const campaign = await campaignSenderService.createCampaign(user.id, {
          name: data.name,
          type: data.type || 'regular',
          status: 'draft',
          subject: data.subject,
          preheader: data.preheader,
          fromName: data.fromName,
          fromEmail: data.fromEmail,
          replyTo: data.replyTo,
          content: data.content || {},
          recipients: data.recipients || {
            type: 'all',
            suppressUnsubscribed: true,
            suppressBounced: true,
            suppressComplained: true,
            deduplicateByEmail: true
          },
          schedule: data.schedule,
          abTest: data.abTest,
          sendOptions: data.sendOptions || {
            trackOpens: true,
            trackClicks: true,
            trackConversions: false,
            deliveryOptimization: {
              warmupMode: false,
              adaptiveThrottling: true,
              priorityQueue: 'normal'
            }
          },
          tracking: data.tracking || {
            openTrackingEnabled: true,
            clickTrackingEnabled: true,
            conversionTrackingEnabled: false
          }
        })
        return NextResponse.json({ campaign })
      }

      case 'schedule': {
        await campaignSenderService.scheduleCampaign(
          data.campaignId,
          new Date(data.scheduledFor)
        )
        return NextResponse.json({ success: true })
      }

      case 'send': {
        const progress = await campaignSenderService.sendCampaign(data.campaignId)
        return NextResponse.json({ progress })
      }

      case 'pause': {
        await campaignSenderService.pauseCampaign(data.campaignId)
        return NextResponse.json({ success: true })
      }

      case 'resume': {
        const progress = await campaignSenderService.resumeCampaign(data.campaignId)
        return NextResponse.json({ progress })
      }

      case 'cancel': {
        await campaignSenderService.cancelCampaign(data.campaignId)
        return NextResponse.json({ success: true })
      }

      case 'build_recipients': {
        const campaign = await campaignSenderService.getCampaign(data.campaignId)
        if (!campaign) {
          return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }
        const result = await campaignSenderService.buildRecipientList(campaign)
        return NextResponse.json(result)
      }

      case 'select_winner': {
        await campaignSenderService.selectABTestWinner(data.campaignId, data.variantId)
        return NextResponse.json({ success: true })
      }

      case 'get_variant_stats': {
        const stats = await campaignSenderService.getVariantStats(data.campaignId)
        return NextResponse.json({ stats })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Campaign action failed', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Campaign action failed' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, ...updates } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    const campaign = await campaignSenderService.updateCampaign(campaignId, updates)
    return NextResponse.json({ campaign })
  } catch (error) {
    logger.error('Failed to update campaign', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update campaign' },
      { status: 500 }
    )
  }
}
