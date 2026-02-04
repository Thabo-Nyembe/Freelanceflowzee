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

export interface Pipeline {
  id: string
  name: string
  description: string | null
  type: PipelineType
  currency: string
  is_default: boolean
  is_active: boolean

  // Settings
  settings: PipelineSettings
  rotting_days_default: number | null
  win_probability_threshold: number

  // Stages
  stages: PipelineStage[]
  stages_count: number

  // Stats
  deals_count: number
  total_value: number
  weighted_value: number
  average_deal_size: number
  win_rate: number
  average_sales_cycle: number

  // Access Control
  visibility: PipelineVisibility
  team_ids: string[]
  owner_id: string | null

  // Timestamps
  created_at: string
  updated_at: string

  // Metadata
  created_by: string | null
  user_id: string
}

export interface PipelineStage {
  id: string
  pipeline_id: string
  name: string
  description: string | null
  order: number
  probability: number
  color: string

  // Stage Type
  is_won: boolean
  is_lost: boolean
  is_default: boolean

  // Automation
  rotting_days: number | null
  auto_actions: StageAutoAction[]

  // Stats (computed)
  deals_count?: number
  total_value?: number
  weighted_value?: number

  // Timestamps
  created_at: string
  updated_at: string
}

export interface StageAutoAction {
  type: 'create_task' | 'send_email' | 'send_notification' | 'update_field' | 'webhook'
  trigger: 'on_enter' | 'on_exit' | 'on_rotting'
  config: Record<string, unknown>
  is_active: boolean
}

export interface PipelineSettings {
  require_close_reason: boolean
  require_amount: boolean
  allow_multiple_deals_per_company: boolean
  allow_multiple_deals_per_contact: boolean
  auto_assign_owner: boolean
  default_owner_id: string | null
  email_notifications: boolean
  slack_notifications: boolean
}

export type PipelineType =
  | 'sales'
  | 'projects'
  | 'support'
  | 'custom'

export type PipelineVisibility =
  | 'everyone'
  | 'team'
  | 'private'

export interface PipelineTemplate {
  id: string
  name: string
  description: string
  type: PipelineType
  stages: Array<{
    name: string
    probability: number
    color: string
    is_won?: boolean
    is_lost?: boolean
  }>
}

// Default pipeline templates
const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'sales_standard',
    name: 'Standard Sales Pipeline',
    description: 'A typical B2B sales pipeline with 6 stages',
    type: 'sales',
    stages: [
      { name: 'Lead', probability: 10, color: '#6B7280' },
      { name: 'Qualified', probability: 20, color: '#3B82F6' },
      { name: 'Proposal', probability: 40, color: '#8B5CF6' },
      { name: 'Negotiation', probability: 60, color: '#F59E0B' },
      { name: 'Closed Won', probability: 100, color: '#10B981', is_won: true },
      { name: 'Closed Lost', probability: 0, color: '#EF4444', is_lost: true },
    ],
  },
  {
    id: 'sales_enterprise',
    name: 'Enterprise Sales Pipeline',
    description: 'Longer sales cycle for enterprise deals',
    type: 'sales',
    stages: [
      { name: 'Prospecting', probability: 5, color: '#6B7280' },
      { name: 'Discovery', probability: 15, color: '#3B82F6' },
      { name: 'Demo', probability: 25, color: '#8B5CF6' },
      { name: 'Proposal', probability: 40, color: '#F59E0B' },
      { name: 'Negotiation', probability: 60, color: '#EC4899' },
      { name: 'Contract', probability: 80, color: '#14B8A6' },
      { name: 'Closed Won', probability: 100, color: '#10B981', is_won: true },
      { name: 'Closed Lost', probability: 0, color: '#EF4444', is_lost: true },
    ],
  },
  {
    id: 'projects',
    name: 'Project Pipeline',
    description: 'Track project opportunities from inception to delivery',
    type: 'projects',
    stages: [
      { name: 'Inquiry', probability: 10, color: '#6B7280' },
      { name: 'Scoping', probability: 25, color: '#3B82F6' },
      { name: 'Proposal Sent', probability: 50, color: '#8B5CF6' },
      { name: 'Contract Review', probability: 75, color: '#F59E0B' },
      { name: 'Signed', probability: 100, color: '#10B981', is_won: true },
      { name: 'Declined', probability: 0, color: '#EF4444', is_lost: true },
    ],
  },
  {
    id: 'support_tickets',
    name: 'Support Ticket Pipeline',
    description: 'Track support tickets through resolution',
    type: 'support',
    stages: [
      { name: 'New', probability: 0, color: '#6B7280' },
      { name: 'In Progress', probability: 25, color: '#3B82F6' },
      { name: 'Waiting on Customer', probability: 50, color: '#F59E0B' },
      { name: 'Resolved', probability: 100, color: '#10B981', is_won: true },
      { name: 'Closed', probability: 0, color: '#EF4444', is_lost: true },
    ],
  },
]

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const stageAutoActionSchema = z.object({
  type: z.enum(['create_task', 'send_email', 'send_notification', 'update_field', 'webhook']),
  trigger: z.enum(['on_enter', 'on_exit', 'on_rotting']),
  config: z.record(z.unknown()),
  is_active: z.boolean().default(true),
})

const pipelineSettingsSchema = z.object({
  require_close_reason: z.boolean().default(true),
  require_amount: z.boolean().default(false),
  allow_multiple_deals_per_company: z.boolean().default(true),
  allow_multiple_deals_per_contact: z.boolean().default(true),
  auto_assign_owner: z.boolean().default(false),
  default_owner_id: z.string().uuid().nullable().optional(),
  email_notifications: z.boolean().default(true),
  slack_notifications: z.boolean().default(false),
})

const stageCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  order: z.number().int().min(0).optional(),
  probability: z.number().min(0).max(100).default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6B7280'),
  is_won: z.boolean().default(false),
  is_lost: z.boolean().default(false),
  is_default: z.boolean().default(false),
  rotting_days: z.number().int().min(1).nullable().optional(),
  auto_actions: z.array(stageAutoActionSchema).default([]),
})

const pipelineCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).nullable().optional(),
  type: z.enum(['sales', 'projects', 'support', 'custom']).default('sales'),
  currency: z.string().length(3).default('USD'),
  is_default: z.boolean().default(false),
  settings: pipelineSettingsSchema.default({}),
  rotting_days_default: z.number().int().min(1).nullable().optional(),
  win_probability_threshold: z.number().min(0).max(100).default(70),
  visibility: z.enum(['everyone', 'team', 'private']).default('everyone'),
  team_ids: z.array(z.string().uuid()).default([]),
  stages: z.array(stageCreateSchema).optional(),
  template_id: z.string().optional(),
})

const pipelineUpdateSchema = pipelineCreateSchema.partial().extend({
  is_active: z.boolean().optional(),
})

const stageUpdateSchema = stageCreateSchema.partial()

const reorderStagesSchema = z.object({
  stage_ids: z.array(z.string().uuid()),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function calculatePipelineStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pipelineId: string,
  userId: string
): Promise<{
  deals_count: number
  total_value: number
  weighted_value: number
  average_deal_size: number
  win_rate: number
  average_sales_cycle: number
}> {
  // Get all deals in the pipeline
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('value, status, days_in_pipeline')
    .eq('pipeline_id', pipelineId)
    .eq('user_id', userId)

  if (!deals || deals.length === 0) {
    return {
      deals_count: 0,
      total_value: 0,
      weighted_value: 0,
      average_deal_size: 0,
      win_rate: 0,
      average_sales_cycle: 0,
    }
  }

  const openDeals = deals.filter(d => d.status === 'open')
  const wonDeals = deals.filter(d => d.status === 'won')
  const lostDeals = deals.filter(d => d.status === 'lost')
  const closedDeals = [...wonDeals, ...lostDeals]

  return {
    deals_count: openDeals.length,
    total_value: openDeals.reduce((sum, d) => sum + (d.value || 0), 0),
    weighted_value: openDeals.reduce((sum, d) => sum + (d.value || 0) * 0.5, 0), // Simplified
    average_deal_size: wonDeals.length > 0
      ? wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / wonDeals.length
      : 0,
    win_rate: closedDeals.length > 0
      ? (wonDeals.length / closedDeals.length) * 100
      : 0,
    average_sales_cycle: wonDeals.length > 0
      ? wonDeals.reduce((sum, d) => sum + (d.days_in_pipeline || 0), 0) / wonDeals.length
      : 0,
  }
}

async function getStageStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stageId: string,
  userId: string
): Promise<{
  deals_count: number
  total_value: number
  weighted_value: number
}> {
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('value, probability')
    .eq('stage_id', stageId)
    .eq('status', 'open')
    .eq('user_id', userId)

  if (!deals || deals.length === 0) {
    return {
      deals_count: 0,
      total_value: 0,
      weighted_value: 0,
    }
  }

  return {
    deals_count: deals.length,
    total_value: deals.reduce((sum, d) => sum + (d.value || 0), 0),
    weighted_value: deals.reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 0) / 100), 0),
  }
}

// ============================================================================
// GET - List Pipelines
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Check for special endpoints
    const action = searchParams.get('action')
    if (action === 'templates') {
      return NextResponse.json({ templates: PIPELINE_TEMPLATES })
    }

    // Get specific pipeline
    const pipelineId = searchParams.get('id')
    if (pipelineId) {
      return getPipelineById(supabase, user.id, pipelineId)
    }

    // Get all pipelines
    const includeStats = searchParams.get('includeStats') === 'true'
    const includeStages = searchParams.get('includeStages') !== 'false'
    const type = searchParams.get('type')
    const isActive = searchParams.get('is_active') !== 'false'

    let query = supabase
      .from('crm_pipelines')
      .select(`
        *,
        owner:users!owner_id(id, name, avatar_url)
        ${includeStages ? ', stages:crm_pipeline_stages(*)' : ''}
      `)
      .eq('user_id', user.id)
      .eq('is_active', isActive)
      .order('is_default', { ascending: false })
      .order('name')

    if (type) {
      query = query.eq('type', type)
    }

    const { data: pipelines, error } = await query

    if (error) {
      logger.error('Error fetching pipelines', { error })
      return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 })
    }

    // Sort stages by order if included
    let processedPipelines = pipelines || []
    if (includeStages) {
      processedPipelines = processedPipelines.map(pipeline => ({
        ...pipeline,
        stages: (pipeline.stages || []).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order),
        stages_count: (pipeline.stages || []).length,
      }))
    }

    // Add stats if requested
    if (includeStats) {
      processedPipelines = await Promise.all(
        processedPipelines.map(async pipeline => {
          const stats = await calculatePipelineStats(supabase, pipeline.id, user.id)

          // Add stage stats
          let stagesWithStats = pipeline.stages || []
          if (includeStages) {
            stagesWithStats = await Promise.all(
              (pipeline.stages || []).map(async (stage: PipelineStage) => {
                const stageStats = await getStageStats(supabase, stage.id, user.id)
                return { ...stage, ...stageStats }
              })
            )
          }

          return {
            ...pipeline,
            ...stats,
            stages: stagesWithStats,
          }
        })
      )
    }

    return NextResponse.json({ pipelines: processedPipelines })

  } catch (error) {
    logger.error('Pipelines GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get single pipeline by ID
async function getPipelineById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  pipelineId: string
) {
  const { data: pipeline, error } = await supabase
    .from('crm_pipelines')
    .select(`
      *,
      owner:users!owner_id(id, name, avatar_url),
      stages:crm_pipeline_stages(*)
    `)
    .eq('id', pipelineId)
    .eq('user_id', userId)
    .single()

  if (error || !pipeline) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
  }

  // Sort stages by order
  pipeline.stages = (pipeline.stages || []).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order)
  pipeline.stages_count = pipeline.stages.length

  // Calculate stats
  const stats = await calculatePipelineStats(supabase, pipelineId, userId)

  // Add stage stats
  pipeline.stages = await Promise.all(
    pipeline.stages.map(async (stage: PipelineStage) => {
      const stageStats = await getStageStats(supabase, stage.id, userId)
      return { ...stage, ...stageStats }
    })
  )

  return NextResponse.json({
    pipeline: {
      ...pipeline,
      ...stats,
    },
  })
}

// ============================================================================
// POST - Create Pipeline
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

    // Handle stage operations
    const action = searchParams.get('action')
    if (action === 'add_stage') {
      return addStage(supabase, user.id, body)
    }
    if (action === 'reorder_stages') {
      return reorderStages(supabase, user.id, body)
    }

    // Validate pipeline creation
    const validation = pipelineCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid pipeline data', details: validation.error.errors }, { status: 400 })
    }

    const pipelineData = validation.data
    const { stages, template_id, ...pipelineFields } = pipelineData

    // Get stages from template if specified
    let stagesToCreate = stages || []
    if (template_id) {
      const template = PIPELINE_TEMPLATES.find(t => t.id === template_id)
      if (template) {
        stagesToCreate = template.stages.map((stage, index) => ({
          ...stage,
          order: index,
        }))
      }
    }

    // If no stages provided and no template, create default stages
    if (stagesToCreate.length === 0) {
      stagesToCreate = [
        { name: 'New', probability: 10, color: '#6B7280', order: 0, is_default: true },
        { name: 'In Progress', probability: 50, color: '#3B82F6', order: 1 },
        { name: 'Won', probability: 100, color: '#10B981', order: 2, is_won: true },
        { name: 'Lost', probability: 0, color: '#EF4444', order: 3, is_lost: true },
      ]
    }

    // If this is default, unset other defaults
    if (pipelineFields.is_default) {
      await supabase
        .from('crm_pipelines')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    // Create pipeline
    const { data: pipeline, error: pipelineError } = await supabase
      .from('crm_pipelines')
      .insert({
        ...pipelineFields,
        settings: pipelineFields.settings || {},
        user_id: user.id,
        created_by: user.id,
        is_active: true,
        stages_count: stagesToCreate.length,
      })
      .select()
      .single()

    if (pipelineError) {
      logger.error('Error creating pipeline', { error: pipelineError })
      return NextResponse.json({ error: 'Failed to create pipeline' }, { status: 500 })
    }

    // Create stages
    const stagesWithPipelineId = stagesToCreate.map((stage, index) => ({
      ...stage,
      order: stage.order ?? index,
      pipeline_id: pipeline.id,
      user_id: user.id,
    }))

    const { data: createdStages, error: stagesError } = await supabase
      .from('crm_pipeline_stages')
      .insert(stagesWithPipelineId)
      .select()

    if (stagesError) {
      logger.error('Error creating stages', { error: stagesError })
      // Rollback pipeline creation
      await supabase.from('crm_pipelines').delete().eq('id', pipeline.id)
      return NextResponse.json({ error: 'Failed to create pipeline stages' }, { status: 500 })
    }

    return NextResponse.json({
      pipeline: {
        ...pipeline,
        stages: createdStages?.sort((a, b) => a.order - b.order) || [],
        stages_count: createdStages?.length || 0,
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Pipelines POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update Pipeline
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
    const { searchParams } = new URL(request.url)

    // Handle stage update
    const action = searchParams.get('action')
    if (action === 'update_stage') {
      return updateStage(supabase, user.id, body)
    }

    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
    }

    // Validate update data
    const validation = pipelineUpdateSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    // Check pipeline exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_pipelines')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
    }

    const validatedData = validation.data

    // If setting as default, unset other defaults
    if (validatedData.is_default) {
      await supabase
        .from('crm_pipelines')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('id', id)
    }

    // Update pipeline
    const { data: pipeline, error } = await supabase
      .from('crm_pipelines')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        stages:crm_pipeline_stages(*)
      `)
      .single()

    if (error) {
      logger.error('Error updating pipeline', { error })
      return NextResponse.json({ error: 'Failed to update pipeline' }, { status: 500 })
    }

    // Sort stages
    pipeline.stages = (pipeline.stages || []).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order)
    pipeline.stages_count = pipeline.stages.length

    return NextResponse.json({ pipeline })

  } catch (error) {
    logger.error('Pipelines PUT error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Delete Pipeline or Stage
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
    const pipelineId = searchParams.get('id')
    const stageId = searchParams.get('stage_id')

    // Delete stage
    if (stageId) {
      return deleteStage(supabase, user.id, stageId)
    }

    // Delete pipeline
    if (!pipelineId) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
    }

    // Check pipeline exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_pipelines')
      .select('id, is_default')
      .eq('id', pipelineId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
    }

    // Don't allow deleting the default pipeline
    if (existing.is_default) {
      return NextResponse.json({ error: 'Cannot delete the default pipeline' }, { status: 400 })
    }

    // Check for deals in the pipeline
    const { count: dealsCount } = await supabase
      .from('crm_deals')
      .select('*', { count: 'exact', head: true })
      .eq('pipeline_id', pipelineId)
      .eq('status', 'open')

    if (dealsCount && dealsCount > 0) {
      return NextResponse.json({
        error: 'Pipeline has active deals',
        message: `This pipeline has ${dealsCount} open deal(s). Move or close them before deleting.`,
      }, { status: 400 })
    }

    // Delete pipeline (stages will be cascade deleted)
    const { error } = await supabase
      .from('crm_pipelines')
      .delete()
      .eq('id', pipelineId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error deleting pipeline', { error })
      return NextResponse.json({ error: 'Failed to delete pipeline' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Pipelines DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// STAGE OPERATIONS
// ============================================================================

async function addStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    pipeline_id: z.string().uuid(),
    ...stageCreateSchema.shape,
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid stage data', details: validation.error.errors }, { status: 400 })
  }

  const { pipeline_id, ...stageData } = validation.data

  // Verify pipeline exists
  const { data: pipeline } = await supabase
    .from('crm_pipelines')
    .select('id')
    .eq('id', pipeline_id)
    .eq('user_id', userId)
    .single()

  if (!pipeline) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
  }

  // Get max order
  const { data: maxOrderResult } = await supabase
    .from('crm_pipeline_stages')
    .select('order')
    .eq('pipeline_id', pipeline_id)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const newOrder = stageData.order ?? ((maxOrderResult?.order ?? -1) + 1)

  // Insert stage
  const { data: stage, error } = await supabase
    .from('crm_pipeline_stages')
    .insert({
      ...stageData,
      order: newOrder,
      pipeline_id,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create stage' }, { status: 500 })
  }

  // Update pipeline stages count
  await supabase
    .from('crm_pipelines')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', pipeline_id)

  return NextResponse.json({ stage }, { status: 201 })
}

async function updateStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    id: z.string().uuid(),
    ...stageUpdateSchema.shape,
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid stage data', details: validation.error.errors }, { status: 400 })
  }

  const { id, ...updateData } = validation.data

  // Verify stage exists and belongs to user's pipeline
  const { data: existing } = await supabase
    .from('crm_pipeline_stages')
    .select('*, pipeline:crm_pipelines!pipeline_id(user_id)')
    .eq('id', id)
    .single()

  if (!existing || (existing.pipeline as { user_id: string })?.user_id !== userId) {
    return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
  }

  // Update stage
  const { data: stage, error } = await supabase
    .from('crm_pipeline_stages')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
  }

  return NextResponse.json({ stage })
}

async function deleteStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  stageId: string
) {
  // Verify stage exists
  const { data: existing } = await supabase
    .from('crm_pipeline_stages')
    .select('*, pipeline:crm_pipelines!pipeline_id(user_id)')
    .eq('id', stageId)
    .single()

  if (!existing || (existing.pipeline as { user_id: string })?.user_id !== userId) {
    return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
  }

  // Check for deals in this stage
  const { count: dealsCount } = await supabase
    .from('crm_deals')
    .select('*', { count: 'exact', head: true })
    .eq('stage_id', stageId)
    .eq('status', 'open')

  if (dealsCount && dealsCount > 0) {
    return NextResponse.json({
      error: 'Stage has deals',
      message: `This stage has ${dealsCount} deal(s). Move them to another stage first.`,
    }, { status: 400 })
  }

  // Delete stage
  const { error } = await supabase
    .from('crm_pipeline_stages')
    .delete()
    .eq('id', stageId)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete stage' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

async function reorderStages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    pipeline_id: z.string().uuid(),
    stage_ids: z.array(z.string().uuid()),
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
  }

  const { pipeline_id, stage_ids } = validation.data

  // Verify pipeline exists
  const { data: pipeline } = await supabase
    .from('crm_pipelines')
    .select('id')
    .eq('id', pipeline_id)
    .eq('user_id', userId)
    .single()

  if (!pipeline) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
  }

  // Update stage orders
  for (let i = 0; i < stage_ids.length; i++) {
    await supabase
      .from('crm_pipeline_stages')
      .update({ order: i, updated_at: new Date().toISOString() })
      .eq('id', stage_ids[i])
      .eq('pipeline_id', pipeline_id)
  }

  // Also update deals with new stage_order
  for (let i = 0; i < stage_ids.length; i++) {
    await supabase
      .from('crm_deals')
      .update({ stage_order: i })
      .eq('stage_id', stage_ids[i])
  }

  // Get updated stages
  const { data: stages } = await supabase
    .from('crm_pipeline_stages')
    .select('*')
    .eq('pipeline_id', pipeline_id)
    .order('order')

  return NextResponse.json({ stages })
}
