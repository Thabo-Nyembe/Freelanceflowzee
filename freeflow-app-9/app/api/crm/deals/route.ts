import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('crm-api')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Deal {
  id: string
  name: string
  description: string | null

  // Pipeline & Stage
  pipeline_id: string
  pipeline_name: string | null
  stage_id: string
  stage_name: string | null
  stage_order: number

  // Associations
  company_id: string | null
  company_name: string | null
  contact_id: string | null
  contact_name: string | null
  contact_email: string | null

  // Value & Currency
  value: number
  currency: string
  recurring_value: number | null
  recurring_frequency: RecurringFrequency | null

  // Probability & Forecasting
  probability: number
  weighted_value: number
  expected_revenue: number

  // Status
  status: DealStatus
  priority: DealPriority
  deal_type: DealType

  // Dates
  expected_close_date: string | null
  actual_close_date: string | null
  last_stage_change_at: string | null
  days_in_stage: number
  days_in_pipeline: number

  // CRM Data
  owner_id: string | null
  owner_name: string | null
  owner_avatar: string | null
  lead_source: string | null
  tags: string[]
  custom_fields: Record<string, unknown>

  // Loss/Win Tracking
  loss_reason: string | null
  loss_reason_details: string | null
  competitor_id: string | null
  competitor_name: string | null
  win_reason: string | null

  // Relationships
  activities_count: number
  notes_count: number
  attachments_count: number
  associated_contacts: string[]

  // Timestamps
  created_at: string
  updated_at: string
  last_activity_at: string | null
  last_contacted_at: string | null

  // Metadata
  created_by: string | null
  user_id: string
}

export type DealStatus =
  | 'open'
  | 'won'
  | 'lost'
  | 'abandoned'
  | 'on_hold'

export type DealPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export type DealType =
  | 'new_business'
  | 'existing_business'
  | 'renewal'
  | 'upsell'
  | 'cross_sell'
  | 'other'

export type RecurringFrequency =
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'one_time'

export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
  description: string | null
  is_won: boolean
  is_lost: boolean
  rotting_days: number | null
}

export interface DealSearchFilters {
  search?: string
  pipeline_id?: string
  stage_id?: string[]
  company_id?: string
  contact_id?: string
  status?: DealStatus[]
  priority?: DealPriority[]
  deal_type?: DealType[]
  owner_id?: string
  tags?: string[]
  min_value?: number
  max_value?: number
  min_probability?: number
  max_probability?: number
  expected_close_after?: string
  expected_close_before?: string
  created_after?: string
  created_before?: string
  is_rotting?: boolean
}

export interface DealStageHistory {
  id: string
  deal_id: string
  from_stage_id: string | null
  from_stage_name: string | null
  to_stage_id: string
  to_stage_name: string
  duration_seconds: number | null
  moved_by: string
  moved_at: string
  reason: string | null
}

export interface DealForecast {
  pipeline_id: string
  period: string
  total_value: number
  weighted_value: number
  deal_count: number
  expected_wins: number
  by_stage: Array<{
    stage_id: string
    stage_name: string
    value: number
    weighted_value: number
    count: number
  }>
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const dealCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).nullable().optional(),

  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),

  company_id: z.string().uuid().nullable().optional(),
  contact_id: z.string().uuid().nullable().optional(),

  value: z.number().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  recurring_value: z.number().min(0).nullable().optional(),
  recurring_frequency: z.enum(['monthly', 'quarterly', 'annually', 'one_time']).nullable().optional(),

  probability: z.number().min(0).max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  deal_type: z.enum(['new_business', 'existing_business', 'renewal', 'upsell', 'cross_sell', 'other']).default('new_business'),

  expected_close_date: z.string().datetime().nullable().optional(),

  owner_id: z.string().uuid().nullable().optional(),
  lead_source: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
  custom_fields: z.record(z.unknown()).default({}),

  associated_contacts: z.array(z.string().uuid()).default([]),
})

const dealUpdateSchema = dealCreateSchema.partial().extend({
  status: z.enum(['open', 'won', 'lost', 'abandoned', 'on_hold']).optional(),
  loss_reason: z.string().max(200).nullable().optional(),
  loss_reason_details: z.string().max(2000).nullable().optional(),
  competitor_id: z.string().uuid().nullable().optional(),
  win_reason: z.string().max(500).nullable().optional(),
  actual_close_date: z.string().datetime().nullable().optional(),
})

const stageChangeSchema = z.object({
  stage_id: z.string().uuid(),
  reason: z.string().max(500).optional(),
})

const bulkMoveSchema = z.object({
  deal_ids: z.array(z.string().uuid()).min(1).max(100),
  stage_id: z.string().uuid(),
  reason: z.string().max(500).optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getStageInfo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stageId: string
): Promise<PipelineStage | null> {
  const { data } = await supabase
    .from('crm_pipeline_stages')
    .select('*')
    .eq('id', stageId)
    .single()

  return data
}

async function calculateDaysinStage(deal: Partial<Deal>): Promise<number> {
  if (!deal.last_stage_change_at) {
    return Math.floor(
      (Date.now() - new Date(deal.created_at!).getTime()) / (1000 * 60 * 60 * 24)
    )
  }
  return Math.floor(
    (Date.now() - new Date(deal.last_stage_change_at).getTime()) / (1000 * 60 * 60 * 24)
  )
}

async function calculateDaysInPipeline(deal: Partial<Deal>): Promise<number> {
  return Math.floor(
    (Date.now() - new Date(deal.created_at!).getTime()) / (1000 * 60 * 60 * 24)
  )
}

async function recordStageChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealId: string,
  fromStageId: string | null,
  toStageId: string,
  movedBy: string,
  reason?: string
): Promise<void> {
  const fromStage = fromStageId ? await getStageInfo(supabase, fromStageId) : null
  const toStage = await getStageInfo(supabase, toStageId)

  // Calculate duration in previous stage
  let duration = null
  if (fromStageId) {
    const { data: lastChange } = await supabase
      .from('crm_deal_stage_history')
      .select('moved_at')
      .eq('deal_id', dealId)
      .order('moved_at', { ascending: false })
      .limit(1)
      .single()

    if (lastChange) {
      duration = Math.floor(
        (Date.now() - new Date(lastChange.moved_at).getTime()) / 1000
      )
    }
  }

  await supabase.from('crm_deal_stage_history').insert({
    deal_id: dealId,
    from_stage_id: fromStageId,
    from_stage_name: fromStage?.name || null,
    to_stage_id: toStageId,
    to_stage_name: toStage?.name || 'Unknown',
    duration_seconds: duration,
    moved_by: movedBy,
    reason,
  })
}

async function updateCompanyDealStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string
): Promise<void> {
  // Calculate total open deals value and count
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('value, status')
    .eq('company_id', companyId)

  if (deals) {
    const openDeals = deals.filter(d => d.status === 'open')
    const openDealsValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0)

    await supabase
      .from('crm_companies')
      .update({
        deals_count: deals.length,
        open_deals_value: openDealsValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
  }
}

async function updateContactDealStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contactId: string
): Promise<void> {
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('value, status')
    .eq('contact_id', contactId)

  if (deals) {
    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)

    await supabase
      .from('crm_contacts')
      .update({
        deals_count: deals.length,
        total_deal_value: totalValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
  }
}

// ============================================================================
// GET - List/Search Deals
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const demoMode = isDemoMode(request)

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    let effectiveUserId: string
    if (authError || !user) {
      if (demoMode) {
        effectiveUserId = DEMO_USER_ID
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      const userEmail = user.email
      const isDemoAccount = userEmail === DEMO_USER_EMAIL || userEmail === 'demo@kazi.io' || userEmail === 'test@kazi.dev'
      effectiveUserId = (isDemoAccount || demoMode) ? DEMO_USER_ID : user.id
    }

    const { searchParams } = new URL(request.url)

    // Check for special endpoints
    const action = searchParams.get('action')
    if (action === 'forecast') {
      return getForecast(supabase, effectiveUserId, searchParams)
    }
    if (action === 'stage_history') {
      return getStageHistory(supabase, effectiveUserId, searchParams)
    }
    if (action === 'pipeline_stats') {
      return getPipelineStats(supabase, effectiveUserId, searchParams)
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || 'updated_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const view = searchParams.get('view') || 'list' // list or kanban
    const includeStats = searchParams.get('includeStats') === 'true'

    // Parse filters
    const filters: DealSearchFilters = {
      search: searchParams.get('search') || undefined,
      pipeline_id: searchParams.get('pipeline_id') || undefined,
      stage_id: searchParams.getAll('stage_id'),
      company_id: searchParams.get('company_id') || undefined,
      contact_id: searchParams.get('contact_id') || undefined,
      status: searchParams.getAll('status') as DealStatus[],
      priority: searchParams.getAll('priority') as DealPriority[],
      deal_type: searchParams.getAll('deal_type') as DealType[],
      owner_id: searchParams.get('owner_id') || undefined,
      tags: searchParams.getAll('tags'),
      min_value: searchParams.get('min_value') ? parseFloat(searchParams.get('min_value')!) : undefined,
      max_value: searchParams.get('max_value') ? parseFloat(searchParams.get('max_value')!) : undefined,
      min_probability: searchParams.get('min_probability') ? parseFloat(searchParams.get('min_probability')!) : undefined,
      max_probability: searchParams.get('max_probability') ? parseFloat(searchParams.get('max_probability')!) : undefined,
      expected_close_after: searchParams.get('expected_close_after') || undefined,
      expected_close_before: searchParams.get('expected_close_before') || undefined,
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
      is_rotting: searchParams.get('is_rotting') === 'true' ? true : undefined,
    }

    // Build query (simplified without joins due to missing FK constraints)
    let query = supabase
      .from('crm_deals')
      .select('*', { count: 'exact' })
      .eq('user_id', effectiveUserId)

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.pipeline_id) {
      query = query.eq('pipeline_id', filters.pipeline_id)
    }

    if (filters.stage_id?.length) {
      query = query.in('stage_id', filters.stage_id)
    }

    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id)
    }

    if (filters.contact_id) {
      query = query.eq('contact_id', filters.contact_id)
    }

    if (filters.status?.length) {
      query = query.in('status', filters.status)
    } else {
      // Default to open deals only
      query = query.eq('status', 'open')
    }

    if (filters.priority?.length) {
      query = query.in('priority', filters.priority)
    }

    if (filters.deal_type?.length) {
      query = query.in('deal_type', filters.deal_type)
    }

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.min_value !== undefined) {
      query = query.gte('value', filters.min_value)
    }

    if (filters.max_value !== undefined) {
      query = query.lte('value', filters.max_value)
    }

    if (filters.min_probability !== undefined) {
      query = query.gte('probability', filters.min_probability)
    }

    if (filters.max_probability !== undefined) {
      query = query.lte('probability', filters.max_probability)
    }

    if (filters.expected_close_after) {
      query = query.gte('expected_close_date', filters.expected_close_after)
    }

    if (filters.expected_close_before) {
      query = query.lte('expected_close_date', filters.expected_close_before)
    }

    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after)
    }

    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before)
    }

    // Apply sorting
    if (view === 'kanban') {
      // For kanban, sort by stage order then updated_at
      query = query.order('stage_order', { ascending: true }).order('updated_at', { ascending: false })
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: deals, error, count } = await query

    if (error) {
      logger.error('Error fetching deals', { error })
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
    }

    // Filter rotting deals if requested
    let filteredDeals = deals || []
    if (filters.is_rotting) {
      filteredDeals = filteredDeals.filter(deal => {
        if (deal.stage?.rotting_days && deal.days_in_stage >= deal.stage.rotting_days) {
          return true
        }
        return false
      })
    }

    // Get aggregate stats if requested
    let stats = null
    if (includeStats && filters.pipeline_id) {
      const { data: pipelineDeals } = await supabase
        .from('crm_deals')
        .select(`
          value,
          probability,
          status,
          stage_id,
          stage:crm_pipeline_stages!stage_id(name)
        `)
        .eq('user_id', effectiveUserId)
        .eq('pipeline_id', filters.pipeline_id)
        .eq('status', 'open')

      if (pipelineDeals) {
        const byStage = pipelineDeals.reduce((acc, d) => {
          const stageName = d.stage?.name || 'Unknown'
          if (!acc[stageName]) {
            acc[stageName] = { count: 0, value: 0, weighted_value: 0 }
          }
          acc[stageName].count++
          acc[stageName].value += d.value || 0
          acc[stageName].weighted_value += (d.value || 0) * ((d.probability || 0) / 100)
          return acc
        }, {} as Record<string, { count: number; value: number; weighted_value: number }>)

        stats = {
          total_deals: pipelineDeals.length,
          total_value: pipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0),
          weighted_value: pipelineDeals.reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 0) / 100), 0),
          average_deal_size: pipelineDeals.length > 0
            ? pipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0) / pipelineDeals.length
            : 0,
          by_stage: byStage,
        }
      }
    }

    // Format response for kanban view if needed
    let response: {
      deals?: typeof filteredDeals
      kanban?: Record<string, typeof filteredDeals>
      pagination: { page: number; limit: number; total: number; totalPages: number }
      stats?: typeof stats
    }

    if (view === 'kanban' && filters.pipeline_id) {
      // Get pipeline stages
      const { data: stages } = await supabase
        .from('crm_pipeline_stages')
        .select('id, name, order, color')
        .eq('pipeline_id', filters.pipeline_id)
        .order('order')

      // Group deals by stage
      const kanban = (stages || []).reduce((acc, stage) => {
        acc[stage.id] = filteredDeals.filter(d => d.stage_id === stage.id)
        return acc
      }, {} as Record<string, typeof filteredDeals>)

      response = {
        kanban,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats,
      }
    } else {
      response = {
        deals: filteredDeals,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Deals GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// POST - Create Deal
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)

    // Handle stage change
    const action = searchParams.get('action')
    if (action === 'change_stage') {
      return changeStage(supabase, user.id, body)
    }
    if (action === 'bulk_move') {
      return bulkMove(supabase, user.id, body)
    }

    // Validate deal creation
    const validation = dealCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid deal data', details: validation.error.errors }, { status: 400 })
    }

    const dealData = validation.data

    // Verify pipeline and stage exist
    const stage = await getStageInfo(supabase, dealData.stage_id)
    if (!stage) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    // Get stage probability if not provided
    const probability = dealData.probability ?? stage.probability

    // Calculate weighted value
    const weightedValue = dealData.value * (probability / 100)
    const expectedRevenue = weightedValue

    // Insert deal
    const { data: deal, error } = await supabase
      .from('crm_deals')
      .insert({
        ...dealData,
        probability,
        weighted_value: weightedValue,
        expected_revenue: expectedRevenue,
        status: 'open',
        stage_order: stage.order,
        days_in_stage: 0,
        days_in_pipeline: 0,
        user_id: user.id,
        created_by: user.id,
        activities_count: 0,
        notes_count: 0,
        attachments_count: 0,
        last_stage_change_at: new Date().toISOString(),
      })
      .select(`
        *,
        pipeline:crm_pipelines!pipeline_id(id, name),
        stage:crm_pipeline_stages!stage_id(id, name, order, probability, color),
        company:crm_companies!company_id(id, name, domain, logo_url),
        contact:crm_contacts!contact_id(id, full_name, email, avatar_url),
        owner:users!owner_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error creating deal', { error })
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
    }

    // Record initial stage
    await recordStageChange(supabase, deal.id, null, deal.stage_id, user.id, 'Deal created')

    // Update company/contact stats
    if (deal.company_id) {
      await updateCompanyDealStats(supabase, deal.company_id)
    }
    if (deal.contact_id) {
      await updateContactDealStats(supabase, deal.contact_id)
    }

    // Log activity
    await supabase.from('crm_activities').insert({
      user_id: user.id,
      deal_id: deal.id,
      company_id: deal.company_id,
      contact_id: deal.contact_id,
      type: 'deal_created',
      title: 'Deal created',
      description: `Created deal: ${deal.name} (${formatCurrency(deal.value, deal.currency)})`,
      performed_by: user.id,
    })

    return NextResponse.json({ deal }, { status: 201 })

  } catch (error) {
    logger.error('Deals POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update Deal
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
    }

    // Validate update data
    const validation = dealUpdateSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    // Check deal exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_deals')
      .select('*')
      .eq('id', id)
      .eq('user_id', effectiveUserId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const validatedData = validation.data

    // Handle stage change
    let stageChangeData = {}
    if (validatedData.stage_id && validatedData.stage_id !== existing.stage_id) {
      const stage = await getStageInfo(supabase, validatedData.stage_id)
      if (!stage) {
        return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
      }

      // Record stage history
      await recordStageChange(supabase, id, existing.stage_id, validatedData.stage_id, user.id)

      // Update stage-related fields
      stageChangeData = {
        stage_order: stage.order,
        last_stage_change_at: new Date().toISOString(),
        days_in_stage: 0,
        probability: validatedData.probability ?? stage.probability,
      }

      // Check if this is a win/loss stage
      if (stage.is_won) {
        stageChangeData = {
          ...stageChangeData,
          status: 'won' as const,
          actual_close_date: new Date().toISOString(),
        }
      } else if (stage.is_lost) {
        stageChangeData = {
          ...stageChangeData,
          status: 'lost' as const,
          actual_close_date: new Date().toISOString(),
        }
      }
    }

    // Handle status change
    if (validatedData.status && validatedData.status !== existing.status) {
      if (['won', 'lost'].includes(validatedData.status) && !existing.actual_close_date) {
        validatedData.actual_close_date = new Date().toISOString()
      }
    }

    // Recalculate weighted value
    const newValue = validatedData.value ?? existing.value
    const newProbability = validatedData.probability ?? (stageChangeData as { probability?: number }).probability ?? existing.probability
    const weightedValue = newValue * (newProbability / 100)

    // Update deal
    const { data: deal, error } = await supabase
      .from('crm_deals')
      .update({
        ...validatedData,
        ...stageChangeData,
        weighted_value: weightedValue,
        expected_revenue: weightedValue,
        days_in_pipeline: await calculateDaysInPipeline(existing),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', effectiveUserId)
      .select(`
        *,
        pipeline:crm_pipelines!pipeline_id(id, name),
        stage:crm_pipeline_stages!stage_id(id, name, order, probability, color),
        company:crm_companies!company_id(id, name, domain, logo_url),
        contact:crm_contacts!contact_id(id, full_name, email, avatar_url),
        owner:users!owner_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error updating deal', { error })
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
    }

    // Update company/contact stats if associations changed
    const oldCompanyId = existing.company_id
    const newCompanyId = deal.company_id
    const oldContactId = existing.contact_id
    const newContactId = deal.contact_id

    if (oldCompanyId !== newCompanyId) {
      if (oldCompanyId) await updateCompanyDealStats(supabase, oldCompanyId)
      if (newCompanyId) await updateCompanyDealStats(supabase, newCompanyId)
    } else if (newCompanyId && (validatedData.value !== undefined || validatedData.status !== undefined)) {
      await updateCompanyDealStats(supabase, newCompanyId)
    }

    if (oldContactId !== newContactId) {
      if (oldContactId) await updateContactDealStats(supabase, oldContactId)
      if (newContactId) await updateContactDealStats(supabase, newContactId)
    } else if (newContactId && (validatedData.value !== undefined || validatedData.status !== undefined)) {
      await updateContactDealStats(supabase, newContactId)
    }

    // Log activity
    let activityType = 'deal_updated'
    let description = `Updated deal: ${deal.name}`

    if (deal.status === 'won' && existing.status !== 'won') {
      activityType = 'deal_won'
      description = `Won deal: ${deal.name} (${formatCurrency(deal.value, deal.currency)})`
    } else if (deal.status === 'lost' && existing.status !== 'lost') {
      activityType = 'deal_lost'
      description = `Lost deal: ${deal.name}${deal.loss_reason ? ` - ${deal.loss_reason}` : ''}`
    } else if (validatedData.stage_id && validatedData.stage_id !== existing.stage_id) {
      activityType = 'deal_stage_changed'
      description = `Moved deal "${deal.name}" to ${deal.stage?.name || 'new stage'}`
    }

    await supabase.from('crm_activities').insert({
      user_id: user.id,
      deal_id: deal.id,
      company_id: deal.company_id,
      contact_id: deal.contact_id,
      type: activityType,
      title: activityType.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
      description,
      changes: JSON.stringify(validatedData),
      performed_by: user.id,
    })

    return NextResponse.json({ deal })

  } catch (error) {
    logger.error('Deals PUT error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Delete Deal
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
    }

    // Check deal exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_deals')
      .select('id, name, company_id, contact_id')
      .eq('id', id)
      .eq('user_id', effectiveUserId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Delete deal
    const { error } = await supabase
      .from('crm_deals')
      .delete()
      .eq('id', id)
      .eq('user_id', effectiveUserId)

    if (error) {
      logger.error('Error deleting deal', { error })
      return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
    }

    // Update company/contact stats
    if (existing.company_id) {
      await updateCompanyDealStats(supabase, existing.company_id)
    }
    if (existing.contact_id) {
      await updateContactDealStats(supabase, existing.contact_id)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Deals DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// HELPER ENDPOINTS
// ============================================================================

async function changeStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    deal_id: z.string().uuid(),
    stage_id: z.string().uuid(),
    reason: z.string().max(500).optional(),
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
  }

  const { deal_id, stage_id, reason } = validation.data

  // Check deal exists
  const { data: deal, error: fetchError } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('id', deal_id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  // Get new stage info
  const stage = await getStageInfo(supabase, stage_id)
  if (!stage) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  // Record stage change
  await recordStageChange(supabase, deal_id, deal.stage_id, stage_id, userId, reason)

  // Prepare update
  const updateData: Record<string, unknown> = {
    stage_id,
    stage_order: stage.order,
    probability: stage.probability,
    weighted_value: deal.value * (stage.probability / 100),
    expected_revenue: deal.value * (stage.probability / 100),
    last_stage_change_at: new Date().toISOString(),
    days_in_stage: 0,
    updated_at: new Date().toISOString(),
  }

  // Handle win/loss stages
  if (stage.is_won) {
    updateData.status = 'won'
    updateData.actual_close_date = new Date().toISOString()
  } else if (stage.is_lost) {
    updateData.status = 'lost'
    updateData.actual_close_date = new Date().toISOString()
  }

  // Update deal
  const { data: updatedDeal, error } = await supabase
    .from('crm_deals')
    .update(updateData)
    .eq('id', deal_id)
    .select(`
      *,
      pipeline:crm_pipelines!pipeline_id(id, name),
      stage:crm_pipeline_stages!stage_id(id, name, order, probability, color),
      company:crm_companies!company_id(id, name),
      contact:crm_contacts!contact_id(id, full_name, email)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }

  return NextResponse.json({ deal: updatedDeal })
}

async function bulkMove(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = bulkMoveSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
  }

  const { deal_ids, stage_id, reason } = validation.data

  // Get stage info
  const stage = await getStageInfo(supabase, stage_id)
  if (!stage) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  const results = { success: [] as string[], failed: [] as { id: string; error: string }[] }

  for (const dealId of deal_ids) {
    try {
      const { data: deal } = await supabase
        .from('crm_deals')
        .select('stage_id, value')
        .eq('id', dealId)
        .eq('user_id', userId)
        .single()

      if (!deal) {
        results.failed.push({ id: dealId, error: 'Deal not found' })
        continue
      }

      // Record stage change
      await recordStageChange(supabase, dealId, deal.stage_id, stage_id, userId, reason)

      // Update deal
      const updateData: Record<string, unknown> = {
        stage_id,
        stage_order: stage.order,
        probability: stage.probability,
        weighted_value: deal.value * (stage.probability / 100),
        last_stage_change_at: new Date().toISOString(),
        days_in_stage: 0,
        updated_at: new Date().toISOString(),
      }

      if (stage.is_won) {
        updateData.status = 'won'
        updateData.actual_close_date = new Date().toISOString()
      } else if (stage.is_lost) {
        updateData.status = 'lost'
        updateData.actual_close_date = new Date().toISOString()
      }

      await supabase
        .from('crm_deals')
        .update(updateData)
        .eq('id', dealId)

      results.success.push(dealId)
    } catch (err) {
      results.failed.push({ id: dealId, error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return NextResponse.json({ results })
}

async function getForecast(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const pipelineId = searchParams.get('pipeline_id')
  const months = parseInt(searchParams.get('months') || '3')

  if (!pipelineId) {
    return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
  }

  // Get deals closing in the next X months
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + months)

  const { data: deals, error } = await supabase
    .from('crm_deals')
    .select(`
      id, name, value, probability, weighted_value, expected_close_date,
      stage:crm_pipeline_stages!stage_id(id, name)
    `)
    .eq('user_id', userId)
    .eq('pipeline_id', pipelineId)
    .eq('status', 'open')
    .gte('expected_close_date', startDate.toISOString())
    .lte('expected_close_date', endDate.toISOString())

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 })
  }

  // Group by month
  const forecast: Record<string, DealForecast> = {}
  const deals_data = deals || []

  for (const deal of deals_data) {
    if (!deal.expected_close_date) continue

    const month = deal.expected_close_date.substring(0, 7) // YYYY-MM

    if (!forecast[month]) {
      forecast[month] = {
        pipeline_id: pipelineId,
        period: month,
        total_value: 0,
        weighted_value: 0,
        deal_count: 0,
        expected_wins: 0,
        by_stage: [],
      }
    }

    forecast[month].total_value += deal.value || 0
    forecast[month].weighted_value += deal.weighted_value || 0
    forecast[month].deal_count++
    forecast[month].expected_wins += (deal.probability || 0) >= 70 ? 1 : 0
  }

  return NextResponse.json({
    forecast: Object.values(forecast).sort((a, b) => a.period.localeCompare(b.period)),
  })
}

async function getStageHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const dealId = searchParams.get('deal_id')

  if (!dealId) {
    return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
  }

  // Verify deal belongs to user
  const { data: deal } = await supabase
    .from('crm_deals')
    .select('id')
    .eq('id', dealId)
    .eq('user_id', userId)
    .single()

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  const { data: history, error } = await supabase
    .from('crm_deal_stage_history')
    .select('*')
    .eq('deal_id', dealId)
    .order('moved_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch stage history' }, { status: 500 })
  }

  return NextResponse.json({ history })
}

async function getPipelineStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const pipelineId = searchParams.get('pipeline_id')
  const period = searchParams.get('period') || '30' // days

  if (!pipelineId) {
    return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  // Get deal stats
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('id, value, status, created_at, actual_close_date, days_in_pipeline')
    .eq('user_id', userId)
    .eq('pipeline_id', pipelineId)

  const allDeals = deals || []
  const recentDeals = allDeals.filter(d => new Date(d.created_at) >= startDate)

  // Calculate metrics
  const openDeals = allDeals.filter(d => d.status === 'open')
  const wonDeals = allDeals.filter(d => d.status === 'won')
  const lostDeals = allDeals.filter(d => d.status === 'lost')

  const recentWonDeals = wonDeals.filter(d =>
    d.actual_close_date && new Date(d.actual_close_date) >= startDate
  )
  const recentLostDeals = lostDeals.filter(d =>
    d.actual_close_date && new Date(d.actual_close_date) >= startDate
  )

  const stats = {
    pipeline_id: pipelineId,
    period_days: parseInt(period),

    // Current state
    open_deals: openDeals.length,
    open_value: openDeals.reduce((sum, d) => sum + (d.value || 0), 0),

    // Win rate
    total_closed: recentWonDeals.length + recentLostDeals.length,
    won_count: recentWonDeals.length,
    lost_count: recentLostDeals.length,
    win_rate: recentWonDeals.length + recentLostDeals.length > 0
      ? (recentWonDeals.length / (recentWonDeals.length + recentLostDeals.length)) * 100
      : 0,

    // Revenue
    won_value: recentWonDeals.reduce((sum, d) => sum + (d.value || 0), 0),
    lost_value: recentLostDeals.reduce((sum, d) => sum + (d.value || 0), 0),

    // Velocity
    average_deal_size: wonDeals.length > 0
      ? wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / wonDeals.length
      : 0,
    average_sales_cycle: wonDeals.length > 0
      ? wonDeals.reduce((sum, d) => sum + (d.days_in_pipeline || 0), 0) / wonDeals.length
      : 0,

    // New deals
    new_deals: recentDeals.length,
    new_value: recentDeals.reduce((sum, d) => sum + (d.value || 0), 0),
  }

  return NextResponse.json({ stats })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value)
}
