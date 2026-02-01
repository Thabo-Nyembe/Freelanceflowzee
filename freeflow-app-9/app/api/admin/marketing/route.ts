/**
 * Admin Marketing API Route
 * Marketing management - campaigns, leads, email marketing, analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-marketing-api')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true' ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true'
  )
}

// Demo data for fallback
const DEMO_CAMPAIGNS = [
  { id: 'campaign-1', name: 'Summer Sale', type: 'email', status: 'active', budget: 5000, spent: 3200, start_date: new Date().toISOString() },
  { id: 'campaign-2', name: 'New Product Launch', type: 'social', status: 'scheduled', budget: 10000, spent: 0, start_date: new Date(Date.now() + 86400000 * 7).toISOString() },
]

const DEMO_LEADS = [
  { id: 'lead-1', name: 'New Lead', email: 'lead@example.com', source: 'website', score: 'hot', score_value: 85 },
  { id: 'lead-2', name: 'Referral Lead', email: 'ref@example.com', source: 'referral', score: 'warm', score_value: 72 },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'overview'

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Marketing API request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'campaigns':
          return await getCampaigns(supabase, effectiveUserId, url, demoMode)
        case 'campaign':
          return await getCampaign(supabase, effectiveUserId, url, demoMode)
        case 'leads':
          return await getLeads(supabase, effectiveUserId, url, demoMode)
        case 'lead':
          return await getLead(supabase, effectiveUserId, url, demoMode)
        case 'email_campaigns':
          return await getEmailCampaigns(supabase, effectiveUserId, url, demoMode)
        case 'metrics':
          return await getCampaignMetrics(supabase, effectiveUserId, url, demoMode)
        case 'stats':
          return await getMarketingStats(supabase, effectiveUserId, demoMode)
        case 'overview':
        default:
          return await getMarketingOverview(supabase, effectiveUserId, demoMode)
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          campaigns: DEMO_CAMPAIGNS,
          leads: DEMO_LEADS,
          stats: {
            totalLeads: 156,
            qualifiedLeads: 45,
            conversionRate: 12.5,
            emailOpenRate: 28.3
          }
        }
      })
    }
  } catch (error) {
    logger.error('Marketing API error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marketing data' },
      { status: 500 }
    )
  }
}

async function getCampaigns(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('marketing_campaigns')
    .select(`
      *,
      goals:campaign_goals(id, name, target, current, unit),
      metrics:campaign_metrics(impressions, clicks, conversions, revenue, roi)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data: campaigns, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          campaigns: DEMO_CAMPAIGNS,
          total: DEMO_CAMPAIGNS.length,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate aggregate metrics
  const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0
  const totalSpent = campaigns?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      campaigns: campaigns || [],
      total: count || 0,
      summary: {
        totalBudget,
        totalSpent,
        activeCampaigns,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(2) : 0
      },
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const campaignId = url.searchParams.get('id')

  if (!campaignId) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID is required' },
      { status: 400 }
    )
  }

  const { data: campaign, error } = await supabase
    .from('marketing_campaigns')
    .select(`
      *,
      goals:campaign_goals(*),
      metrics:campaign_metrics(*),
      email_campaigns:email_campaigns(*)
    `)
    .eq('id', campaignId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { campaign: DEMO_CAMPAIGNS[0] }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { campaign }
  })
}

async function getLeads(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const status = url.searchParams.get('status')
  const score = url.searchParams.get('score')
  const source = url.searchParams.get('source')
  const search = url.searchParams.get('search')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('marketing_leads')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('score_value', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }
  if (score) {
    query = query.eq('score', score)
  }
  if (source) {
    query = query.eq('source', source)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
  }

  const { data: leads, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          leads: DEMO_LEADS,
          total: DEMO_LEADS.length,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate lead stats
  const hotLeads = leads?.filter(l => l.score === 'hot').length || 0
  const warmLeads = leads?.filter(l => l.score === 'warm').length || 0
  const coldLeads = leads?.filter(l => l.score === 'cold').length || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      leads: leads || [],
      total: count || 0,
      breakdown: { hot: hotLeads, warm: warmLeads, cold: coldLeads },
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const leadId = url.searchParams.get('id')

  if (!leadId) {
    return NextResponse.json(
      { success: false, error: 'Lead ID is required' },
      { status: 400 }
    )
  }

  const { data: lead, error } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('id', leadId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { lead: DEMO_LEADS[0] }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { lead }
  })
}

async function getEmailCampaigns(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const status = url.searchParams.get('status')
  const campaignId = url.searchParams.get('campaignId')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('email_campaigns')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }
  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  const { data: emailCampaigns, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          emailCampaigns: [
            { id: 'email-1', subject: 'Welcome Email', status: 'sent', open_rate: 32.5, click_rate: 8.2 },
            { id: 'email-2', subject: 'Product Update', status: 'draft', open_rate: 0, click_rate: 0 },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate aggregate stats
  const sentCampaigns = emailCampaigns?.filter(e => e.status === 'sent') || []
  const avgOpenRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, e) => sum + (e.open_rate || 0), 0) / sentCampaigns.length
    : 0
  const avgClickRate = sentCampaigns.length > 0
    ? sentCampaigns.reduce((sum, e) => sum + (e.click_rate || 0), 0) / sentCampaigns.length
    : 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      emailCampaigns: emailCampaigns || [],
      total: count || 0,
      stats: {
        avgOpenRate: avgOpenRate.toFixed(2),
        avgClickRate: avgClickRate.toFixed(2),
        totalSent: sentCampaigns.reduce((sum, e) => sum + (e.sent || 0), 0)
      },
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getCampaignMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const campaignId = url.searchParams.get('campaignId')
  const days = parseInt(url.searchParams.get('days') || '30')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let query = supabase
    .from('campaign_metrics')
    .select(`
      *,
      campaign:marketing_campaigns!inner(id, name, user_id)
    `)
    .eq('campaign.user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  const { data: metrics, error } = await query

  if (error) {
    if (demoMode) {
      const demoMetrics = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        return {
          date: date.toISOString().split('T')[0],
          impressions: Math.floor(Math.random() * 10000) + 1000,
          clicks: Math.floor(Math.random() * 500) + 50,
          conversions: Math.floor(Math.random() * 50) + 5,
          revenue: Math.floor(Math.random() * 5000) + 500
        }
      })

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          metrics: demoMetrics,
          summary: {
            totalImpressions: demoMetrics.reduce((s, m) => s + m.impressions, 0),
            totalClicks: demoMetrics.reduce((s, m) => s + m.clicks, 0),
            totalConversions: demoMetrics.reduce((s, m) => s + m.conversions, 0),
            totalRevenue: demoMetrics.reduce((s, m) => s + m.revenue, 0)
          }
        }
      })
    }
    throw error
  }

  // Calculate summary
  const summary = {
    totalImpressions: metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0,
    totalClicks: metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0,
    totalConversions: metrics?.reduce((sum, m) => sum + (m.conversions || 0), 0) || 0,
    totalRevenue: metrics?.reduce((sum, m) => sum + (m.revenue || 0), 0) || 0,
    avgCtr: 0,
    avgConversionRate: 0,
    avgRoi: 0
  }

  if (summary.totalImpressions > 0) {
    summary.avgCtr = (summary.totalClicks / summary.totalImpressions * 100)
  }
  if (summary.totalClicks > 0) {
    summary.avgConversionRate = (summary.totalConversions / summary.totalClicks * 100)
  }
  summary.avgRoi = metrics?.reduce((sum, m) => sum + (m.roi || 0), 0) / (metrics?.length || 1) || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { metrics: metrics || [], summary }
  })
}

async function getMarketingStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get today's stats
  const today = new Date().toISOString().split('T')[0]

  const { data: stats, error } = await supabase
    .from('marketing_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (error) {
    // Try to calculate stats manually
    const { data: leads } = await supabase
      .from('marketing_leads')
      .select('status, score')
      .eq('user_id', userId)

    const { data: campaigns } = await supabase
      .from('marketing_campaigns')
      .select('status, budget, spent')
      .eq('user_id', userId)

    if (leads && campaigns) {
      const totalLeads = leads.length
      const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
      const hotLeads = leads.filter(l => l.score === 'hot').length
      const conversionRate = totalLeads > 0 ? (leads.filter(l => l.status === 'won').length / totalLeads * 100) : 0
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length
      const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
      const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0)

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          totalLeads,
          qualifiedLeads,
          hotLeads,
          conversionRate: conversionRate.toFixed(2),
          totalCampaigns: campaigns.length,
          activeCampaigns,
          totalBudget,
          totalSpent
        }
      })
    }

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          totalLeads: 156,
          qualifiedLeads: 45,
          hotLeads: 28,
          conversionRate: 12.5,
          totalCampaigns: 8,
          activeCampaigns: 3,
          totalBudget: 50000,
          totalSpent: 32000
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: stats
  })
}

async function getMarketingOverview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get active campaigns
  const { data: campaigns, error: campaignsError } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'scheduled'])
    .order('start_date', { ascending: true })
    .limit(5)

  // Get hot leads
  const { data: leads, error: leadsError } = await supabase
    .from('marketing_leads')
    .select('*')
    .eq('user_id', userId)
    .in('score', ['hot', 'warm'])
    .order('score_value', { ascending: false })
    .limit(5)

  // Get stats
  const { count: totalLeads } = await supabase
    .from('marketing_leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data: leadsByStatus } = await supabase
    .from('marketing_leads')
    .select('status')
    .eq('user_id', userId)

  const qualifiedLeads = leadsByStatus?.filter(l => l.status === 'qualified').length || 0
  const wonLeads = leadsByStatus?.filter(l => l.status === 'won').length || 0
  const conversionRate = (totalLeads || 0) > 0 ? (wonLeads / (totalLeads || 1) * 100) : 0

  // Get email stats
  const { data: emailStats } = await supabase
    .from('email_campaigns')
    .select('open_rate, click_rate')
    .eq('user_id', userId)
    .eq('status', 'sent')

  const avgOpenRate = emailStats && emailStats.length > 0
    ? emailStats.reduce((sum, e) => sum + (e.open_rate || 0), 0) / emailStats.length
    : 0

  if (campaignsError || leadsError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          campaigns: DEMO_CAMPAIGNS,
          leads: DEMO_LEADS,
          stats: {
            totalLeads: 156,
            qualifiedLeads: 45,
            conversionRate: 12.5,
            emailOpenRate: 28.3
          }
        }
      })
    }
    throw campaignsError || leadsError
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      campaigns: campaigns || [],
      leads: leads || [],
      stats: {
        totalLeads: totalLeads || 0,
        qualifiedLeads,
        conversionRate: conversionRate.toFixed(2),
        emailOpenRate: avgOpenRate.toFixed(2)
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Marketing POST request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'create_campaign':
          return await createCampaign(supabase, effectiveUserId, data, demoMode)
        case 'update_campaign':
          return await updateCampaign(supabase, effectiveUserId, data, demoMode)
        case 'delete_campaign':
          return await deleteCampaign(supabase, effectiveUserId, data, demoMode)
        case 'update_campaign_status':
          return await updateCampaignStatus(supabase, effectiveUserId, data, demoMode)
        case 'add_campaign_goal':
          return await addCampaignGoal(supabase, effectiveUserId, data, demoMode)
        case 'update_campaign_metrics':
          return await updateCampaignMetrics(supabase, effectiveUserId, data, demoMode)
        case 'create_lead':
          return await createLead(supabase, effectiveUserId, data, demoMode)
        case 'update_lead':
          return await updateLead(supabase, effectiveUserId, data, demoMode)
        case 'update_lead_status':
          return await updateLeadStatus(supabase, effectiveUserId, data, demoMode)
        case 'score_lead':
          return await scoreLead(supabase, effectiveUserId, data, demoMode)
        case 'create_email_campaign':
          return await createEmailCampaign(supabase, effectiveUserId, data, demoMode)
        case 'send_email_campaign':
          return await sendEmailCampaign(supabase, effectiveUserId, data, demoMode)
        case 'schedule_email_campaign':
          return await scheduleEmailCampaign(supabase, effectiveUserId, data, demoMode)
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          )
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `demo-${Date.now()}`, ...data },
        message: `${action} completed (demo mode)`
      })
    }
  } catch (error) {
    logger.error('Marketing POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process marketing request' },
      { status: 500 }
    )
  }
}

async function createCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    name,
    description,
    type,
    budget = 0,
    startDate,
    start_date,
    endDate,
    end_date,
    targetAudience,
    target_audience,
    channels = [],
    tags = []
  } = data

  if (!name || !type) {
    return NextResponse.json(
      { success: false, error: 'Campaign name and type are required' },
      { status: 400 }
    )
  }

  const campaignData = {
    user_id: userId,
    name,
    description: description || null,
    type,
    status: 'draft',
    budget,
    spent: 0,
    start_date: startDate || start_date || new Date().toISOString(),
    end_date: endDate || end_date || null,
    target_audience: targetAudience || target_audience || [],
    channels,
    tags,
    created_by: userId
  }

  const { data: campaign, error } = await supabase
    .from('marketing_campaigns')
    .insert(campaignData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `campaign-${Date.now()}`, ...campaignData },
        message: 'Campaign created (demo mode)'
      })
    }
    throw error
  }

  logger.info('Campaign created', { campaignId: campaign.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: campaign,
    message: 'Campaign created successfully'
  })
}

async function updateCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, campaignId, campaign_id, ...updateData } = data
  const actualId = id || campaignId || campaign_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID is required' },
      { status: 400 }
    )
  }

  const dbData: Record<string, any> = {}
  if (updateData.name) dbData.name = updateData.name
  if (updateData.description !== undefined) dbData.description = updateData.description
  if (updateData.type) dbData.type = updateData.type
  if (updateData.budget !== undefined) dbData.budget = updateData.budget
  if (updateData.spent !== undefined) dbData.spent = updateData.spent
  if (updateData.startDate || updateData.start_date) dbData.start_date = updateData.startDate || updateData.start_date
  if (updateData.endDate || updateData.end_date) dbData.end_date = updateData.endDate || updateData.end_date
  if (updateData.targetAudience || updateData.target_audience) dbData.target_audience = updateData.targetAudience || updateData.target_audience
  if (updateData.channels) dbData.channels = updateData.channels
  if (updateData.tags) dbData.tags = updateData.tags

  const { data: campaign, error } = await supabase
    .from('marketing_campaigns')
    .update(dbData)
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, ...dbData },
        message: 'Campaign updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: campaign,
    message: 'Campaign updated successfully'
  })
}

async function deleteCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, campaignId, campaign_id } = data
  const actualId = id || campaignId || campaign_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID is required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('marketing_campaigns')
    .delete()
    .eq('id', actualId)
    .eq('user_id', userId)

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, deleted: true },
        message: 'Campaign deleted (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { id: actualId, deleted: true },
    message: 'Campaign deleted successfully'
  })
}

async function updateCampaignStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, campaignId, campaign_id, status } = data
  const actualId = id || campaignId || campaign_id

  if (!actualId || !status) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID and status are required' },
      { status: 400 }
    )
  }

  const { data: campaign, error } = await supabase
    .from('marketing_campaigns')
    .update({ status })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status },
        message: 'Campaign status updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: campaign,
    message: `Campaign ${status === 'active' ? 'activated' : status}`
  })
}

async function addCampaignGoal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { campaignId, campaign_id, name, target, unit } = data
  const actualCampaignId = campaignId || campaign_id

  if (!actualCampaignId || !name || !target || !unit) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID, goal name, target, and unit are required' },
      { status: 400 }
    )
  }

  // Verify campaign ownership
  const { data: campaign } = await supabase
    .from('marketing_campaigns')
    .select('id')
    .eq('id', actualCampaignId)
    .eq('user_id', userId)
    .single()

  if (!campaign && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Campaign not found' },
      { status: 404 }
    )
  }

  const goalData = {
    campaign_id: actualCampaignId,
    name,
    target,
    current: 0,
    unit
  }

  const { data: goal, error } = await supabase
    .from('campaign_goals')
    .insert(goalData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `goal-${Date.now()}`, ...goalData },
        message: 'Goal added (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: goal,
    message: 'Campaign goal added successfully'
  })
}

async function updateCampaignMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    campaignId,
    campaign_id,
    impressions = 0,
    clicks = 0,
    conversions = 0,
    revenue = 0,
    date
  } = data
  const actualCampaignId = campaignId || campaign_id

  if (!actualCampaignId) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID is required' },
      { status: 400 }
    )
  }

  const metricsDate = date || new Date().toISOString().split('T')[0]

  // Calculate derived metrics
  const ctr = impressions > 0 ? (clicks / impressions * 100) : 0
  const conversionRate = clicks > 0 ? (conversions / clicks * 100) : 0

  // Get campaign budget for ROI calculation
  const { data: campaign } = await supabase
    .from('marketing_campaigns')
    .select('spent')
    .eq('id', actualCampaignId)
    .single()

  const roi = campaign?.spent > 0 ? ((revenue - campaign.spent) / campaign.spent * 100) : 0

  const metricsData = {
    campaign_id: actualCampaignId,
    date: metricsDate,
    impressions,
    clicks,
    conversions,
    revenue,
    ctr,
    conversion_rate: conversionRate,
    roi,
    cost_per_lead: conversions > 0 ? (campaign?.spent || 0) / conversions : 0,
    cost_per_conversion: conversions > 0 ? (campaign?.spent || 0) / conversions : 0
  }

  const { data: metrics, error } = await supabase
    .from('campaign_metrics')
    .upsert(metricsData, { onConflict: 'campaign_id,date' })
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `metrics-${Date.now()}`, ...metricsData },
        message: 'Metrics updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: metrics,
    message: 'Campaign metrics updated successfully'
  })
}

async function createLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    name,
    email,
    phone,
    company,
    position,
    source,
    interests = [],
    tags = [],
    estimatedValue,
    estimated_value,
    notes
  } = data

  if (!name || !email || !source) {
    return NextResponse.json(
      { success: false, error: 'Name, email, and source are required' },
      { status: 400 }
    )
  }

  const leadData = {
    user_id: userId,
    name,
    email,
    phone: phone || null,
    company: company || null,
    position: position || null,
    status: 'new',
    score: 'cold',
    score_value: 0,
    source,
    interests,
    tags,
    engagement_level: 5,
    estimated_value: estimatedValue || estimated_value || null,
    notes: notes || null,
    assigned_to: userId
  }

  const { data: lead, error } = await supabase
    .from('marketing_leads')
    .insert(leadData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `lead-${Date.now()}`, ...leadData },
        message: 'Lead created (demo mode)'
      })
    }
    throw error
  }

  logger.info('Lead created', { leadId: lead.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: lead,
    message: 'Lead created successfully'
  })
}

async function updateLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, leadId, lead_id, ...updateData } = data
  const actualId = id || leadId || lead_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Lead ID is required' },
      { status: 400 }
    )
  }

  const dbData: Record<string, any> = {}
  if (updateData.name) dbData.name = updateData.name
  if (updateData.email) dbData.email = updateData.email
  if (updateData.phone) dbData.phone = updateData.phone
  if (updateData.company) dbData.company = updateData.company
  if (updateData.position) dbData.position = updateData.position
  if (updateData.interests) dbData.interests = updateData.interests
  if (updateData.tags) dbData.tags = updateData.tags
  if (updateData.estimatedValue || updateData.estimated_value) {
    dbData.estimated_value = updateData.estimatedValue || updateData.estimated_value
  }
  if (updateData.notes) dbData.notes = updateData.notes
  if (updateData.nextFollowUp || updateData.next_follow_up) {
    dbData.next_follow_up = updateData.nextFollowUp || updateData.next_follow_up
  }

  const { data: lead, error } = await supabase
    .from('marketing_leads')
    .update(dbData)
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, ...dbData },
        message: 'Lead updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: lead,
    message: 'Lead updated successfully'
  })
}

async function updateLeadStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, leadId, lead_id, status } = data
  const actualId = id || leadId || lead_id

  if (!actualId || !status) {
    return NextResponse.json(
      { success: false, error: 'Lead ID and status are required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, any> = { status }

  // Update last contact if transitioning to contacted
  if (status === 'contacted') {
    updateData.last_contact = new Date().toISOString()
  }

  const { data: lead, error } = await supabase
    .from('marketing_leads')
    .update(updateData)
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status },
        message: 'Lead status updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: lead,
    message: `Lead status updated to ${status}`
  })
}

async function scoreLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, leadId, lead_id, scoreValue, score_value, engagementLevel, engagement_level } = data
  const actualId = id || leadId || lead_id
  const actualScoreValue = scoreValue || score_value

  if (!actualId || actualScoreValue === undefined) {
    return NextResponse.json(
      { success: false, error: 'Lead ID and score value are required' },
      { status: 400 }
    )
  }

  // Determine score category based on value
  let score: 'cold' | 'warm' | 'hot' = 'cold'
  if (actualScoreValue >= 70) {
    score = 'hot'
  } else if (actualScoreValue >= 40) {
    score = 'warm'
  }

  const updateData: Record<string, any> = {
    score_value: actualScoreValue,
    score
  }

  if (engagementLevel || engagement_level) {
    updateData.engagement_level = engagementLevel || engagement_level
  }

  const { data: lead, error } = await supabase
    .from('marketing_leads')
    .update(updateData)
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, ...updateData },
        message: 'Lead scored (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: lead,
    message: `Lead scored: ${score} (${actualScoreValue})`
  })
}

async function createEmailCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    campaignId,
    campaign_id,
    subject,
    content,
    fromName,
    from_name,
    fromEmail,
    from_email,
    replyTo,
    reply_to,
    recipients = 0
  } = data

  if (!subject || !content || !fromEmail && !from_email) {
    return NextResponse.json(
      { success: false, error: 'Subject, content, and from email are required' },
      { status: 400 }
    )
  }

  const emailData = {
    user_id: userId,
    campaign_id: campaignId || campaign_id || null,
    subject,
    content,
    from_name: fromName || from_name || 'Marketing Team',
    from_email: fromEmail || from_email,
    reply_to: replyTo || reply_to || fromEmail || from_email,
    recipients,
    status: 'draft'
  }

  const { data: emailCampaign, error } = await supabase
    .from('email_campaigns')
    .insert(emailData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `email-${Date.now()}`, ...emailData },
        message: 'Email campaign created (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: emailCampaign,
    message: 'Email campaign created successfully'
  })
}

async function sendEmailCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, emailId, email_id } = data
  const actualId = id || emailId || email_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Email campaign ID is required' },
      { status: 400 }
    )
  }

  const { data: emailCampaign, error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'sending',
      sent_at: new Date().toISOString()
    })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status: 'sending', sent_at: new Date().toISOString() },
        message: 'Email campaign sent (demo mode)'
      })
    }
    throw error
  }

  // In a real implementation, queue the emails for delivery here
  // For now, mark as sent
  await supabase
    .from('email_campaigns')
    .update({
      status: 'sent',
      sent: emailCampaign.recipients
    })
    .eq('id', actualId)

  logger.info('Email campaign sent', { emailId: actualId, recipients: emailCampaign.recipients })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { ...emailCampaign, status: 'sent' },
    message: 'Email campaign sent successfully'
  })
}

async function scheduleEmailCampaign(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, emailId, email_id, scheduledAt, scheduled_at } = data
  const actualId = id || emailId || email_id
  const scheduleTime = scheduledAt || scheduled_at

  if (!actualId || !scheduleTime) {
    return NextResponse.json(
      { success: false, error: 'Email campaign ID and schedule time are required' },
      { status: 400 }
    )
  }

  const { data: emailCampaign, error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'scheduled',
      scheduled_at: scheduleTime
    })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status: 'scheduled', scheduled_at: scheduleTime },
        message: 'Email campaign scheduled (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: emailCampaign,
    message: `Email campaign scheduled for ${new Date(scheduleTime).toLocaleString()}`
  })
}
