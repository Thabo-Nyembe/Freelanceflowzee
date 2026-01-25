/**
 * Admin Marketing API Routes
 *
 * REST endpoints for Admin Marketing:
 * GET - Leads, campaigns, campaign goals, campaign metrics, email campaigns, stats, dashboard
 * POST - Create leads, campaigns, goals, metrics, email campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-marketing')
import {
  getLeads,
  createLead,
  getLeadsByStatus,
  getLeadsBySource,
  getCampaigns,
  createCampaign,
  getCampaignsByStatus,
  getCampaignsByType,
  getCampaignGoals,
  createCampaignGoal,
  getCampaignMetrics,
  createCampaignMetric,
  getEmailCampaigns,
  createEmailCampaign,
  getEmailCampaignsByStatus,
  getMarketingStats,
  getMarketingDashboard,
  getLeadConversionRate,
  getCampaignROI
} from '@/lib/admin-marketing-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    const status = searchParams.get('status') as any
    const source = searchParams.get('source') as any
    const campaignType = searchParams.get('campaign_type') as any
    const campaignId = searchParams.get('campaign_id')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'leads': {
        const filters: any = { limit }
        if (status) filters.status = status
        if (source) filters.source = source
        const result = await getLeads(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'leads-by-status': {
        if (!status) {
          return NextResponse.json({ error: 'status required' }, { status: 400 })
        }
        const result = await getLeadsByStatus(user.id, status)
        return NextResponse.json({ data: result.data })
      }

      case 'leads-by-source': {
        if (!source) {
          return NextResponse.json({ error: 'source required' }, { status: 400 })
        }
        const result = await getLeadsBySource(user.id, source)
        return NextResponse.json({ data: result.data })
      }

      case 'campaigns': {
        const filters: any = { limit }
        if (status) filters.status = status
        if (campaignType) filters.type = campaignType
        const result = await getCampaigns(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'campaigns-by-status': {
        if (!status) {
          return NextResponse.json({ error: 'status required' }, { status: 400 })
        }
        const result = await getCampaignsByStatus(user.id, status)
        return NextResponse.json({ data: result.data })
      }

      case 'campaigns-by-type': {
        if (!campaignType) {
          return NextResponse.json({ error: 'campaign_type required' }, { status: 400 })
        }
        const result = await getCampaignsByType(user.id, campaignType)
        return NextResponse.json({ data: result.data })
      }

      case 'campaign-goals': {
        if (!campaignId) {
          return NextResponse.json({ error: 'campaign_id required' }, { status: 400 })
        }
        const result = await getCampaignGoals(campaignId)
        return NextResponse.json({ data: result.data })
      }

      case 'campaign-metrics': {
        if (!campaignId) {
          return NextResponse.json({ error: 'campaign_id required' }, { status: 400 })
        }
        const result = await getCampaignMetrics(campaignId)
        return NextResponse.json({ data: result.data })
      }

      case 'email-campaigns': {
        const filters: any = { limit }
        if (status) filters.status = status
        const result = await getEmailCampaigns(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'email-campaigns-by-status': {
        if (!status) {
          return NextResponse.json({ error: 'status required' }, { status: 400 })
        }
        const result = await getEmailCampaignsByStatus(user.id, status)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getMarketingStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'dashboard': {
        const result = await getMarketingDashboard(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'lead-conversion-rate': {
        const result = await getLeadConversionRate(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'campaign-roi': {
        if (!campaignId) {
          return NextResponse.json({ error: 'campaign_id required' }, { status: 400 })
        }
        const result = await getCampaignROI(campaignId)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Admin Marketing data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Admin Marketing data' },
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
      case 'create-lead': {
        const result = await createLead(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-campaign': {
        const result = await createCampaign(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-campaign-goal': {
        const result = await createCampaignGoal(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-campaign-metric': {
        const result = await createCampaignMetric(payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-email-campaign': {
        const result = await createEmailCampaign(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Admin Marketing request', { error })
    return NextResponse.json(
      { error: 'Failed to process Admin Marketing request' },
      { status: 500 }
    )
  }
}
