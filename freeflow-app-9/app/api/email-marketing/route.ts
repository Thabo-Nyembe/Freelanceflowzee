/**
 * Email Marketing API Routes
 *
 * REST endpoints for Email Marketing:
 * GET - List campaigns, subscribers, segments, templates, automations, stats
 * POST - Create campaign, subscriber, segment, template, automation
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
  getEmailCampaigns,
  createEmailCampaign,
  getEmailSubscribers,
  createEmailSubscriber,
  getEmailSegments,
  createEmailSegment,
  getEmailTemplates,
  createEmailTemplate,
  getEmailAutomations,
  createEmailAutomation,
  getEmailMarketingStats
} from '@/lib/email-marketing-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'campaigns'
    const status = searchParams.get('status') as string | null
    const campaignType = searchParams.get('campaign_type') as string | null
    const category = searchParams.get('category')

    switch (type) {
      case 'campaigns': {
        const filters: any = {}
        if (status) filters.status = status
        if (campaignType) filters.type = campaignType
        const result = await getEmailCampaigns(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'subscribers': {
        const filters: any = {}
        if (status) filters.status = status
        const result = await getEmailSubscribers(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'segments': {
        const result = await getEmailSegments(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'templates': {
        const filters: any = {}
        if (category) filters.category = category
        const result = await getEmailTemplates(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'automations': {
        const result = await getEmailAutomations(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getEmailMarketingStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Email Marketing data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Email Marketing data' },
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
      case 'create-campaign': {
        const result = await createEmailCampaign(user.id, {
          name: payload.name,
          subject: payload.subject,
          preheader: payload.preheader,
          type: payload.type,
          from_name: payload.from_name,
          from_email: payload.from_email,
          reply_to: payload.reply_to,
          html_content: payload.html_content,
          plain_text_content: payload.plain_text_content,
          template_id: payload.template_id,
          editor: payload.editor,
          segment_id: payload.segment_id
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-subscriber': {
        const result = await createEmailSubscriber(user.id, {
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          tags: payload.tags,
          custom_fields: payload.custom_fields,
          source: payload.source
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-segment': {
        const result = await createEmailSegment(user.id, {
          name: payload.name,
          description: payload.description,
          criteria: payload.criteria
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-template': {
        const result = await createEmailTemplate(user.id, {
          name: payload.name,
          description: payload.description,
          category: payload.category,
          html_content: payload.html_content,
          thumbnail_url: payload.thumbnail_url,
          is_public: payload.is_public
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-automation': {
        const result = await createEmailAutomation(user.id, {
          name: payload.name,
          trigger: payload.trigger,
          trigger_label: payload.trigger_label,
          delay_hours: payload.delay_hours,
          action: payload.action,
          emails_count: payload.emails_count
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Email Marketing request', { error })
    return NextResponse.json(
      { error: 'Failed to process Email Marketing request' },
      { status: 500 }
    )
  }
}
