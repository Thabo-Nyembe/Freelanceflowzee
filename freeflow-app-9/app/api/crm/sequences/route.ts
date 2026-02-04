import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('crm-api')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmailSequence {
  id: string
  name: string
  description: string | null
  status: SequenceStatus
  type: SequenceType
  trigger: SequenceTrigger
  trigger_config: TriggerConfig

  // Steps
  steps: SequenceStep[]
  steps_count: number

  // Timing
  timezone: string
  send_window_start: string | null // HH:mm
  send_window_end: string | null
  send_days: number[] // 0-6 (Sunday-Saturday)
  exclude_holidays: boolean

  // Settings
  settings: SequenceSettings
  goal: SequenceGoal | null

  // Enrollment
  enrolled_count: number
  active_count: number
  completed_count: number
  bounced_count: number
  unsubscribed_count: number

  // Performance
  total_sent: number
  total_opened: number
  total_clicked: number
  total_replied: number
  total_meetings_booked: number
  total_conversions: number
  open_rate: number
  click_rate: number
  reply_rate: number
  conversion_rate: number

  // Access
  owner_id: string | null
  team_ids: string[]
  visibility: 'public' | 'private' | 'team'

  // Timestamps
  created_at: string
  updated_at: string
  last_sent_at: string | null

  // Metadata
  created_by: string | null
  user_id: string
}

export interface SequenceStep {
  id: string
  sequence_id: string
  order: number
  type: StepType
  name: string
  delay_days: number
  delay_hours: number
  delay_minutes: number

  // Email content
  subject: string | null
  body: string | null
  body_html: string | null
  from_name: string | null
  reply_to: string | null

  // Personalization
  variables: string[]
  ab_test: ABTestConfig | null

  // Conditions
  conditions: StepCondition[]
  exit_conditions: ExitCondition[]

  // Actions
  actions: StepAction[]

  // Performance
  sent_count: number
  opened_count: number
  clicked_count: number
  replied_count: number
  bounced_count: number
  open_rate: number
  click_rate: number
  reply_rate: number

  // Status
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SequenceEnrollment {
  id: string
  sequence_id: string
  contact_id: string
  contact_email: string
  contact_name: string

  // Status
  status: EnrollmentStatus
  current_step_id: string | null
  current_step_order: number

  // Progress
  started_at: string
  completed_at: string | null
  paused_at: string | null
  exited_at: string | null
  exit_reason: string | null

  // Next action
  next_step_at: string | null
  next_step_id: string | null

  // Engagement
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  emails_replied: number
  meetings_booked: number

  // Metadata
  enrolled_by: string
  created_at: string
  updated_at: string
}

export type SequenceStatus = 'draft' | 'active' | 'paused' | 'archived'
export type SequenceType = 'sales' | 'onboarding' | 'nurture' | 're_engagement' | 'custom'
export type SequenceTrigger = 'manual' | 'automatic' | 'api' | 'workflow'
export type StepType = 'email' | 'wait' | 'condition' | 'action' | 'task' | 'notification'
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'exited' | 'bounced' | 'unsubscribed'

export interface TriggerConfig {
  type: SequenceTrigger
  // For automatic triggers
  event?: string
  filters?: Record<string, unknown>
  // For workflow triggers
  workflow_id?: string
}

export interface SequenceSettings {
  max_emails_per_day: number
  throttle_per_hour: number
  stop_on_reply: boolean
  stop_on_click: boolean
  stop_on_meeting: boolean
  stop_on_bounce: boolean
  stop_on_unsubscribe: boolean
  exclude_opted_out: boolean
  exclude_bounced: boolean
  track_opens: boolean
  track_clicks: boolean
  use_thread: boolean
}

export interface SequenceGoal {
  type: 'reply' | 'click' | 'meeting' | 'conversion' | 'custom'
  metric: string
  target: number
  deadline_days: number | null
}

export interface ABTestConfig {
  enabled: boolean
  variants: Array<{
    id: string
    name: string
    subject: string
    body: string
    weight: number
  }>
  winner_criteria: 'open_rate' | 'click_rate' | 'reply_rate'
  sample_size: number
  duration_hours: number
}

export interface StepCondition {
  type: 'opened' | 'clicked' | 'replied' | 'not_opened' | 'not_clicked' | 'contact_field'
  field?: string
  operator?: string
  value?: unknown
  step_id?: string
}

export interface ExitCondition {
  type: 'reply' | 'click' | 'meeting' | 'unsubscribe' | 'bounce' | 'goal_met' | 'contact_field'
  field?: string
  operator?: string
  value?: unknown
}

export interface StepAction {
  type: 'tag' | 'untag' | 'update_field' | 'create_task' | 'notify' | 'webhook' | 'add_to_sequence'
  config: Record<string, unknown>
}

// Default templates
const SEQUENCE_TEMPLATES = [
  {
    id: 'sales_outreach',
    name: 'Sales Outreach',
    description: 'A 5-touch sales outreach sequence',
    type: 'sales' as SequenceType,
    steps: [
      { type: 'email', name: 'Introduction', delay_days: 0, subject: 'Quick question, {{first_name}}' },
      { type: 'email', name: 'Follow-up 1', delay_days: 3, subject: 'Re: Quick question, {{first_name}}' },
      { type: 'email', name: 'Value Add', delay_days: 4, subject: 'Thought you might find this useful' },
      { type: 'email', name: 'Follow-up 2', delay_days: 5, subject: 'Any thoughts, {{first_name}}?' },
      { type: 'email', name: 'Breakup', delay_days: 7, subject: 'Should I close your file?' },
    ],
  },
  {
    id: 'customer_onboarding',
    name: 'Customer Onboarding',
    description: 'Welcome and onboard new customers',
    type: 'onboarding' as SequenceType,
    steps: [
      { type: 'email', name: 'Welcome', delay_days: 0, subject: 'Welcome to {{company_name}}!' },
      { type: 'email', name: 'Getting Started', delay_days: 1, subject: 'Getting started with {{product_name}}' },
      { type: 'email', name: 'First Milestone', delay_days: 3, subject: 'Have you tried {{feature}}?' },
      { type: 'email', name: 'Check-in', delay_days: 7, subject: 'How is everything going?' },
      { type: 'email', name: 'Advanced Tips', delay_days: 14, subject: 'Pro tips for {{product_name}}' },
    ],
  },
  {
    id: 're_engagement',
    name: 'Re-engagement',
    description: 'Re-engage dormant leads',
    type: 're_engagement' as SequenceType,
    steps: [
      { type: 'email', name: 'We Miss You', delay_days: 0, subject: 'We miss you, {{first_name}}!' },
      { type: 'email', name: 'What Changed', delay_days: 7, subject: 'What\'s new since you left' },
      { type: 'email', name: 'Special Offer', delay_days: 14, subject: 'A special offer just for you' },
    ],
  },
]

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const stepConditionSchema = z.object({
  type: z.enum(['opened', 'clicked', 'replied', 'not_opened', 'not_clicked', 'contact_field']),
  field: z.string().optional(),
  operator: z.string().optional(),
  value: z.unknown().optional(),
  step_id: z.string().uuid().optional(),
})

const exitConditionSchema = z.object({
  type: z.enum(['reply', 'click', 'meeting', 'unsubscribe', 'bounce', 'goal_met', 'contact_field']),
  field: z.string().optional(),
  operator: z.string().optional(),
  value: z.unknown().optional(),
})

const stepActionSchema = z.object({
  type: z.enum(['tag', 'untag', 'update_field', 'create_task', 'notify', 'webhook', 'add_to_sequence']),
  config: z.record(z.unknown()),
})

const abTestVariantSchema = z.object({
  id: z.string(),
  name: z.string().max(100),
  subject: z.string().max(500),
  body: z.string(),
  weight: z.number().min(0).max(100),
})

const abTestConfigSchema = z.object({
  enabled: z.boolean(),
  variants: z.array(abTestVariantSchema).min(2).max(5),
  winner_criteria: z.enum(['open_rate', 'click_rate', 'reply_rate']),
  sample_size: z.number().min(10).max(100),
  duration_hours: z.number().min(1).max(168),
})

const stepCreateSchema = z.object({
  type: z.enum(['email', 'wait', 'condition', 'action', 'task', 'notification']),
  name: z.string().min(1).max(100),
  order: z.number().int().min(0).optional(),
  delay_days: z.number().int().min(0).max(365).default(0),
  delay_hours: z.number().int().min(0).max(23).default(0),
  delay_minutes: z.number().int().min(0).max(59).default(0),
  subject: z.string().max(500).nullable().optional(),
  body: z.string().max(50000).nullable().optional(),
  body_html: z.string().max(100000).nullable().optional(),
  from_name: z.string().max(100).nullable().optional(),
  reply_to: z.string().email().nullable().optional(),
  variables: z.array(z.string()).default([]),
  ab_test: abTestConfigSchema.nullable().optional(),
  conditions: z.array(stepConditionSchema).default([]),
  exit_conditions: z.array(exitConditionSchema).default([]),
  actions: z.array(stepActionSchema).default([]),
  is_active: z.boolean().default(true),
})

const sequenceSettingsSchema = z.object({
  max_emails_per_day: z.number().int().min(1).max(1000).default(100),
  throttle_per_hour: z.number().int().min(1).max(500).default(50),
  stop_on_reply: z.boolean().default(true),
  stop_on_click: z.boolean().default(false),
  stop_on_meeting: z.boolean().default(true),
  stop_on_bounce: z.boolean().default(true),
  stop_on_unsubscribe: z.boolean().default(true),
  exclude_opted_out: z.boolean().default(true),
  exclude_bounced: z.boolean().default(true),
  track_opens: z.boolean().default(true),
  track_clicks: z.boolean().default(true),
  use_thread: z.boolean().default(true),
})

const sequenceGoalSchema = z.object({
  type: z.enum(['reply', 'click', 'meeting', 'conversion', 'custom']),
  metric: z.string().max(100),
  target: z.number().min(1),
  deadline_days: z.number().int().min(1).nullable().optional(),
})

const sequenceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).nullable().optional(),
  type: z.enum(['sales', 'onboarding', 'nurture', 're_engagement', 'custom']).default('sales'),
  trigger: z.enum(['manual', 'automatic', 'api', 'workflow']).default('manual'),
  trigger_config: z.record(z.unknown()).default({}),
  timezone: z.string().default('UTC'),
  send_window_start: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_window_end: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  send_days: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
  exclude_holidays: z.boolean().default(false),
  settings: sequenceSettingsSchema.default({}),
  goal: sequenceGoalSchema.nullable().optional(),
  visibility: z.enum(['public', 'private', 'team']).default('public'),
  team_ids: z.array(z.string().uuid()).default([]),
  steps: z.array(stepCreateSchema).optional(),
  template_id: z.string().optional(),
})

const sequenceUpdateSchema = sequenceCreateSchema.partial().extend({
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
})

const enrollContactSchema = z.object({
  contact_ids: z.array(z.string().uuid()).min(1).max(1000),
  start_at_step: z.number().int().min(0).optional(),
  delay_start: z.boolean().default(false),
  delay_days: z.number().int().min(0).max(365).optional(),
  variables: z.record(z.string()).optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

async function scheduleNextStep(
  supabase: Awaited<ReturnType<typeof createClient>>,
  enrollment: SequenceEnrollment,
  sequence: EmailSequence,
  nextStepOrder: number
): Promise<void> {
  // Find the next step
  const nextStep = sequence.steps.find(s => s.order === nextStepOrder && s.is_active)

  if (!nextStep) {
    // Complete the enrollment
    await supabase
      .from('crm_sequence_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        next_step_at: null,
        next_step_id: null,
      })
      .eq('id', enrollment.id)
    return
  }

  // Calculate next send time
  const now = new Date()
  const delayMs = (nextStep.delay_days * 24 * 60 + nextStep.delay_hours * 60 + nextStep.delay_minutes) * 60 * 1000
  const nextSendAt = new Date(now.getTime() + delayMs)

  // Adjust for send window
  if (sequence.send_window_start && sequence.send_window_end) {
    // Implementation would check send window and business days
    // For now, just use the calculated time
  }

  await supabase
    .from('crm_sequence_enrollments')
    .update({
      current_step_id: nextStep.id,
      current_step_order: nextStep.order,
      next_step_at: nextSendAt.toISOString(),
      next_step_id: nextStep.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollment.id)
}

// ============================================================================
// GET - List Sequences
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
    const action = searchParams.get('action')

    // Get templates
    if (action === 'templates') {
      return NextResponse.json({ templates: SEQUENCE_TEMPLATES })
    }

    // Get enrollments
    if (action === 'enrollments') {
      return getEnrollments(supabase, user.id, searchParams)
    }

    // Get sequence analytics
    if (action === 'analytics') {
      return getAnalytics(supabase, user.id, searchParams)
    }

    // Get specific sequence
    const sequenceId = searchParams.get('id')
    if (sequenceId) {
      return getSequenceById(supabase, user.id, sequenceId)
    }

    // List all sequences
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let query = supabase
      .from('crm_email_sequences')
      .select(`
        *,
        steps:crm_sequence_steps(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: sequences, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 })
    }

    // Process and sort steps
    const processedSequences = (sequences || []).map(seq => ({
      ...seq,
      steps: (seq.steps || []).sort((a: SequenceStep, b: SequenceStep) => a.order - b.order),
      steps_count: (seq.steps || []).length,
    }))

    return NextResponse.json({ sequences: processedSequences })

  } catch (error) {
    logger.error('Sequences GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get single sequence by ID
async function getSequenceById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  sequenceId: string
) {
  const { data: sequence, error } = await supabase
    .from('crm_email_sequences')
    .select(`
      *,
      steps:crm_sequence_steps(*),
      owner:users!owner_id(id, name, avatar_url)
    `)
    .eq('id', sequenceId)
    .eq('user_id', userId)
    .single()

  if (error || !sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
  }

  // Sort steps
  sequence.steps = (sequence.steps || []).sort((a: SequenceStep, b: SequenceStep) => a.order - b.order)
  sequence.steps_count = sequence.steps.length

  // Get enrollment stats
  const { data: enrollmentStats } = await supabase
    .from('crm_sequence_enrollments')
    .select('status')
    .eq('sequence_id', sequenceId)

  if (enrollmentStats) {
    sequence.enrolled_count = enrollmentStats.length
    sequence.active_count = enrollmentStats.filter((e: { status: string }) => e.status === 'active').length
    sequence.completed_count = enrollmentStats.filter((e: { status: string }) => e.status === 'completed').length
    sequence.bounced_count = enrollmentStats.filter((e: { status: string }) => e.status === 'bounced').length
    sequence.unsubscribed_count = enrollmentStats.filter((e: { status: string }) => e.status === 'unsubscribed').length
  }

  return NextResponse.json({ sequence })
}

// Get enrollments for a sequence
async function getEnrollments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const sequenceId = searchParams.get('sequence_id')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = (page - 1) * limit

  let query = supabase
    .from('crm_sequence_enrollments')
    .select(`
      *,
      contact:crm_contacts!contact_id(id, full_name, email, avatar_url),
      sequence:crm_email_sequences!sequence_id(id, name)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (sequenceId) {
    query = query.eq('sequence_id', sequenceId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data: enrollments, error, count } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }

  return NextResponse.json({
    enrollments: enrollments || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

// Get sequence analytics
async function getAnalytics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const sequenceId = searchParams.get('sequence_id')
  const period = searchParams.get('period') || '30' // days

  if (!sequenceId) {
    return NextResponse.json({ error: 'Sequence ID is required' }, { status: 400 })
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  // Get sequence with steps
  const { data: sequence } = await supabase
    .from('crm_email_sequences')
    .select(`
      *,
      steps:crm_sequence_steps(*)
    `)
    .eq('id', sequenceId)
    .eq('user_id', userId)
    .single()

  if (!sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
  }

  // Get email events
  const { data: events } = await supabase
    .from('crm_email_events')
    .select('*')
    .eq('sequence_id', sequenceId)
    .gte('created_at', startDate.toISOString())

  // Calculate analytics
  const analytics = {
    sequence_id: sequenceId,
    period_days: parseInt(period),

    // Overall metrics
    total_sent: events?.filter((e: { type: string }) => e.type === 'sent').length || 0,
    total_opened: events?.filter((e: { type: string }) => e.type === 'opened').length || 0,
    total_clicked: events?.filter((e: { type: string }) => e.type === 'clicked').length || 0,
    total_replied: events?.filter((e: { type: string }) => e.type === 'replied').length || 0,
    total_bounced: events?.filter((e: { type: string }) => e.type === 'bounced').length || 0,
    total_unsubscribed: events?.filter((e: { type: string }) => e.type === 'unsubscribed').length || 0,

    // Rates
    open_rate: 0,
    click_rate: 0,
    reply_rate: 0,
    bounce_rate: 0,

    // By step
    by_step: (sequence.steps || []).map((step: SequenceStep) => {
      const stepEvents = events?.filter((e: { step_id: string }) => e.step_id === step.id) || []
      const sent = stepEvents.filter((e: { type: string }) => e.type === 'sent').length
      const opened = stepEvents.filter((e: { type: string }) => e.type === 'opened').length
      const clicked = stepEvents.filter((e: { type: string }) => e.type === 'clicked').length
      const replied = stepEvents.filter((e: { type: string }) => e.type === 'replied').length

      return {
        step_id: step.id,
        step_name: step.name,
        step_order: step.order,
        sent,
        opened,
        clicked,
        replied,
        open_rate: sent > 0 ? (opened / sent) * 100 : 0,
        click_rate: sent > 0 ? (clicked / sent) * 100 : 0,
        reply_rate: sent > 0 ? (replied / sent) * 100 : 0,
      }
    }),

    // Daily breakdown
    by_day: [] as Array<{
      date: string
      sent: number
      opened: number
      clicked: number
      replied: number
    }>,
  }

  // Calculate overall rates
  if (analytics.total_sent > 0) {
    analytics.open_rate = (analytics.total_opened / analytics.total_sent) * 100
    analytics.click_rate = (analytics.total_clicked / analytics.total_sent) * 100
    analytics.reply_rate = (analytics.total_replied / analytics.total_sent) * 100
    analytics.bounce_rate = (analytics.total_bounced / analytics.total_sent) * 100
  }

  return NextResponse.json({ analytics })
}

// ============================================================================
// POST - Create Sequence / Enroll Contacts
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
    const action = searchParams.get('action')

    // Enroll contacts
    if (action === 'enroll') {
      return enrollContacts(supabase, user.id, body)
    }

    // Add step
    if (action === 'add_step') {
      return addStep(supabase, user.id, body)
    }

    // Create sequence
    const validation = sequenceCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid sequence data', details: validation.error.errors }, { status: 400 })
    }

    const sequenceData = validation.data
    const { steps, template_id, ...sequenceFields } = sequenceData

    // Get steps from template if specified
    let stepsToCreate = steps || []
    if (template_id) {
      const template = SEQUENCE_TEMPLATES.find(t => t.id === template_id)
      if (template) {
        stepsToCreate = template.steps.map((step, index) => ({
          type: step.type as 'email' | 'wait' | 'condition' | 'action' | 'task' | 'notification',
          name: step.name,
          order: index,
          delay_days: step.delay_days,
          delay_hours: 0,
          delay_minutes: 0,
          subject: step.subject || null,
          body: null,
          body_html: null,
          from_name: null,
          reply_to: null,
          variables: [],
          ab_test: null,
          conditions: [],
          exit_conditions: [],
          actions: [],
          is_active: true,
        }))
      }
    }

    // Create sequence
    const { data: sequence, error: sequenceError } = await supabase
      .from('crm_email_sequences')
      .insert({
        ...sequenceFields,
        status: 'draft',
        user_id: user.id,
        created_by: user.id,
        enrolled_count: 0,
        active_count: 0,
        completed_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0,
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
        total_replied: 0,
        total_meetings_booked: 0,
        total_conversions: 0,
        open_rate: 0,
        click_rate: 0,
        reply_rate: 0,
        conversion_rate: 0,
        steps_count: stepsToCreate.length,
      })
      .select()
      .single()

    if (sequenceError) {
      logger.error('Error creating sequence', { error: sequenceError })
      return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 })
    }

    // Create steps if any
    if (stepsToCreate.length > 0) {
      const stepsWithSequenceId = stepsToCreate.map((step, index) => ({
        ...step,
        order: step.order ?? index,
        sequence_id: sequence.id,
        user_id: user.id,
        variables: step.subject ? extractVariables(step.subject + (step.body || '')) : [],
        sent_count: 0,
        opened_count: 0,
        clicked_count: 0,
        replied_count: 0,
        bounced_count: 0,
        open_rate: 0,
        click_rate: 0,
        reply_rate: 0,
      }))

      const { data: createdSteps, error: stepsError } = await supabase
        .from('crm_sequence_steps')
        .insert(stepsWithSequenceId)
        .select()

      if (stepsError) {
        logger.error('Error creating steps', { error: stepsError })
        // Rollback sequence creation
        await supabase.from('crm_email_sequences').delete().eq('id', sequence.id)
        return NextResponse.json({ error: 'Failed to create sequence steps' }, { status: 500 })
      }

      sequence.steps = (createdSteps || []).sort((a, b) => a.order - b.order)
    } else {
      sequence.steps = []
    }

    return NextResponse.json({ sequence }, { status: 201 })

  } catch (error) {
    logger.error('Sequences POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Enroll contacts in a sequence
async function enrollContacts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    sequence_id: z.string().uuid(),
    ...enrollContactSchema.shape,
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid enrollment data', details: validation.error.errors }, { status: 400 })
  }

  const { sequence_id, contact_ids, start_at_step, delay_start, delay_days, variables } = validation.data

  // Get sequence
  const { data: sequence } = await supabase
    .from('crm_email_sequences')
    .select(`
      *,
      steps:crm_sequence_steps(*)
    `)
    .eq('id', sequence_id)
    .eq('user_id', userId)
    .single()

  if (!sequence || sequence.status !== 'active') {
    return NextResponse.json({ error: 'Sequence not found or not active' }, { status: 404 })
  }

  // Get contacts
  const { data: contacts } = await supabase
    .from('crm_contacts')
    .select('id, full_name, email, status, email_opt_in')
    .eq('user_id', userId)
    .in('id', contact_ids)

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: 'No valid contacts found' }, { status: 400 })
  }

  // Filter out invalid contacts
  const validContacts = contacts.filter(c => {
    if (c.status !== 'active') return false
    if (sequence.settings.exclude_opted_out && !c.email_opt_in) return false
    if (!c.email) return false
    return true
  })

  // Check for existing enrollments
  const { data: existingEnrollments } = await supabase
    .from('crm_sequence_enrollments')
    .select('contact_id')
    .eq('sequence_id', sequence_id)
    .in('status', ['active', 'paused'])

  const existingContactIds = new Set(existingEnrollments?.map(e => e.contact_id) || [])
  const newContacts = validContacts.filter(c => !existingContactIds.has(c.id))

  if (newContacts.length === 0) {
    return NextResponse.json({
      error: 'All contacts are already enrolled or ineligible',
      skipped: contact_ids.length,
    }, { status: 400 })
  }

  // Get first step
  const sortedSteps = (sequence.steps || []).sort((a: SequenceStep, b: SequenceStep) => a.order - b.order)
  const startStep = start_at_step !== undefined
    ? sortedSteps.find((s: SequenceStep) => s.order === start_at_step)
    : sortedSteps[0]

  if (!startStep) {
    return NextResponse.json({ error: 'No steps in sequence' }, { status: 400 })
  }

  // Calculate start time
  const now = new Date()
  let startAt = now
  if (delay_start && delay_days) {
    startAt = new Date(now.getTime() + delay_days * 24 * 60 * 60 * 1000)
  }

  // Create enrollments
  const enrollments = newContacts.map(contact => ({
    sequence_id,
    contact_id: contact.id,
    contact_email: contact.email,
    contact_name: contact.full_name,
    user_id: userId,
    status: 'active' as const,
    current_step_id: startStep.id,
    current_step_order: startStep.order,
    started_at: startAt.toISOString(),
    next_step_at: startAt.toISOString(),
    next_step_id: startStep.id,
    enrolled_by: userId,
    emails_sent: 0,
    emails_opened: 0,
    emails_clicked: 0,
    emails_replied: 0,
    meetings_booked: 0,
    variables: variables || {},
  }))

  const { data: created, error } = await supabase
    .from('crm_sequence_enrollments')
    .insert(enrollments)
    .select()

  if (error) {
    logger.error('Error enrolling contacts', { error })
    return NextResponse.json({ error: 'Failed to enroll contacts' }, { status: 500 })
  }

  // Update sequence enrollment count
  await supabase
    .from('crm_email_sequences')
    .update({
      enrolled_count: sequence.enrolled_count + newContacts.length,
      active_count: sequence.active_count + newContacts.length,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sequence_id)

  return NextResponse.json({
    enrolled: created?.length || 0,
    skipped: contact_ids.length - newContacts.length,
    enrollments: created,
  }, { status: 201 })
}

// Add step to sequence
async function addStep(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    sequence_id: z.string().uuid(),
    ...stepCreateSchema.shape,
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid step data', details: validation.error.errors }, { status: 400 })
  }

  const { sequence_id, ...stepData } = validation.data

  // Verify sequence exists
  const { data: sequence } = await supabase
    .from('crm_email_sequences')
    .select('id, steps_count')
    .eq('id', sequence_id)
    .eq('user_id', userId)
    .single()

  if (!sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
  }

  // Get max order
  const { data: maxOrderResult } = await supabase
    .from('crm_sequence_steps')
    .select('order')
    .eq('sequence_id', sequence_id)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const newOrder = stepData.order ?? ((maxOrderResult?.order ?? -1) + 1)

  // Extract variables from content
  const variables = stepData.subject
    ? extractVariables((stepData.subject || '') + (stepData.body || ''))
    : []

  // Create step
  const { data: step, error } = await supabase
    .from('crm_sequence_steps')
    .insert({
      ...stepData,
      order: newOrder,
      sequence_id,
      user_id: userId,
      variables,
      sent_count: 0,
      opened_count: 0,
      clicked_count: 0,
      replied_count: 0,
      bounced_count: 0,
      open_rate: 0,
      click_rate: 0,
      reply_rate: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create step' }, { status: 500 })
  }

  // Update sequence steps count
  await supabase
    .from('crm_email_sequences')
    .update({
      steps_count: sequence.steps_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sequence_id)

  return NextResponse.json({ step }, { status: 201 })
}

// ============================================================================
// PUT - Update Sequence/Step
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
    const action = searchParams.get('action')

    // Update step
    if (action === 'update_step') {
      return updateStep(supabase, user.id, body)
    }

    // Pause/resume enrollment
    if (action === 'pause_enrollment' || action === 'resume_enrollment') {
      return updateEnrollmentStatus(supabase, user.id, body, action)
    }

    // Update sequence
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Sequence ID is required' }, { status: 400 })
    }

    const validation = sequenceUpdateSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    // Check sequence exists
    const { data: existing } = await supabase
      .from('crm_email_sequences')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 })
    }

    // Update sequence
    const { data: sequence, error } = await supabase
      .from('crm_email_sequences')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        steps:crm_sequence_steps(*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update sequence' }, { status: 500 })
    }

    // Sort steps
    sequence.steps = (sequence.steps || []).sort((a: SequenceStep, b: SequenceStep) => a.order - b.order)

    return NextResponse.json({ sequence })

  } catch (error) {
    logger.error('Sequences PUT error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update step
async function updateStep(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = z.object({
    id: z.string().uuid(),
    ...stepCreateSchema.partial().shape,
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid step data', details: validation.error.errors }, { status: 400 })
  }

  const { id, ...updateData } = validation.data

  // Update variables if content changed
  let variables = updateData.variables
  if (updateData.subject !== undefined || updateData.body !== undefined) {
    variables = extractVariables((updateData.subject || '') + (updateData.body || ''))
  }

  // Update step
  const { data: step, error } = await supabase
    .from('crm_sequence_steps')
    .update({
      ...updateData,
      variables,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update step' }, { status: 500 })
  }

  return NextResponse.json({ step })
}

// Update enrollment status
async function updateEnrollmentStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown,
  action: string
) {
  const validation = z.object({
    enrollment_id: z.string().uuid(),
  }).safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
  }

  const { enrollment_id } = validation.data
  const newStatus = action === 'pause_enrollment' ? 'paused' : 'active'

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (action === 'pause_enrollment') {
    updateData.paused_at = new Date().toISOString()
  }

  const { data: enrollment, error } = await supabase
    .from('crm_sequence_enrollments')
    .update(updateData)
    .eq('id', enrollment_id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }

  return NextResponse.json({ enrollment })
}

// ============================================================================
// DELETE - Delete Sequence/Step/Unenroll
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
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Delete step
    if (action === 'step') {
      const { error } = await supabase
        .from('crm_sequence_steps')
        .delete()
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to delete step' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Unenroll contact
    if (action === 'unenroll') {
      const { error } = await supabase
        .from('crm_sequence_enrollments')
        .update({
          status: 'exited',
          exit_reason: 'Manually unenrolled',
          exited_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Delete sequence
    // Check for active enrollments
    const { count: activeCount } = await supabase
      .from('crm_sequence_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('sequence_id', id)
      .eq('status', 'active')

    if (activeCount && activeCount > 0) {
      return NextResponse.json({
        error: 'Sequence has active enrollments',
        message: `This sequence has ${activeCount} active enrollment(s). Pause or complete them first.`,
      }, { status: 400 })
    }

    // Archive instead of delete
    const { error } = await supabase
      .from('crm_email_sequences')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to archive sequence' }, { status: 500 })
    }

    return NextResponse.json({ success: true, archived: true })

  } catch (error) {
    logger.error('Sequences DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
