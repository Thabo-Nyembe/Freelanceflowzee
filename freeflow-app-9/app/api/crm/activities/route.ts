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

export interface Activity {
  id: string

  // Type & Content
  type: ActivityType
  title: string
  description: string | null
  content: string | null

  // Associations
  company_id: string | null
  company_name: string | null
  contact_id: string | null
  contact_name: string | null
  deal_id: string | null
  deal_name: string | null

  // Task-specific fields
  due_date: string | null
  completed_at: string | null
  reminder_at: string | null
  is_completed: boolean
  priority: ActivityPriority

  // Meeting-specific fields
  meeting_start: string | null
  meeting_end: string | null
  meeting_location: string | null
  meeting_link: string | null
  meeting_attendees: MeetingAttendee[]
  meeting_notes: string | null
  meeting_outcome: string | null

  // Call-specific fields
  call_duration: number | null
  call_direction: 'inbound' | 'outbound' | null
  call_outcome: CallOutcome | null
  call_recording_url: string | null

  // Email-specific fields
  email_subject: string | null
  email_direction: 'sent' | 'received' | null
  email_status: EmailStatus | null
  email_opened_at: string | null
  email_clicked_at: string | null
  email_thread_id: string | null

  // Note-specific fields
  note_type: NoteType | null
  is_pinned: boolean

  // Changes tracking (for system activities)
  changes: Record<string, unknown> | null
  previous_value: string | null
  new_value: string | null

  // CRM Data
  owner_id: string | null
  owner_name: string | null
  owner_avatar: string | null
  performed_by: string
  performed_by_name: string | null
  performed_by_avatar: string | null
  visibility: ActivityVisibility
  tags: string[]
  custom_fields: Record<string, unknown>

  // Attachments
  attachments: Attachment[]

  // Timestamps
  created_at: string
  updated_at: string
  occurred_at: string // When the activity actually happened

  // Metadata
  user_id: string
}

export type ActivityType =
  // Tasks
  | 'task'
  | 'follow_up'
  | 'deadline'
  // Communication
  | 'call'
  | 'email'
  | 'meeting'
  | 'message'
  // Notes
  | 'note'
  | 'comment'
  // System Events
  | 'company_created'
  | 'company_updated'
  | 'contact_created'
  | 'contact_updated'
  | 'deal_created'
  | 'deal_updated'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  // Engagement
  | 'website_visit'
  | 'form_submission'
  | 'page_view'
  | 'link_click'
  | 'document_viewed'
  // Other
  | 'custom'

export type ActivityPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export type CallOutcome =
  | 'connected'
  | 'left_voicemail'
  | 'no_answer'
  | 'busy'
  | 'wrong_number'
  | 'callback_scheduled'

export type EmailStatus =
  | 'draft'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'spam'
  | 'unsubscribed'

export type NoteType =
  | 'general'
  | 'meeting_notes'
  | 'call_notes'
  | 'internal'
  | 'important'

export type ActivityVisibility =
  | 'public'
  | 'private'
  | 'team'

export interface MeetingAttendee {
  email: string
  name?: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface ActivitySearchFilters {
  search?: string
  type?: ActivityType[]
  company_id?: string
  contact_id?: string
  deal_id?: string
  owner_id?: string
  performed_by?: string
  priority?: ActivityPriority[]
  is_completed?: boolean
  is_overdue?: boolean
  has_due_date?: boolean
  due_after?: string
  due_before?: string
  occurred_after?: string
  occurred_before?: string
  tags?: string[]
  visibility?: ActivityVisibility[]
}

export interface ActivityStats {
  total: number
  by_type: Record<string, number>
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  calls_today: number
  emails_today: number
  meetings_today: number
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const meetingAttendeeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'tentative']).default('pending'),
})

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  type: z.string(),
  size: z.number(),
})

const activityCreateSchema = z.object({
  type: z.enum([
    'task', 'follow_up', 'deadline',
    'call', 'email', 'meeting', 'message',
    'note', 'comment',
    'company_created', 'company_updated', 'contact_created', 'contact_updated',
    'deal_created', 'deal_updated', 'deal_stage_changed', 'deal_won', 'deal_lost',
    'website_visit', 'form_submission', 'page_view', 'link_click', 'document_viewed',
    'custom',
  ]),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).nullable().optional(),
  content: z.string().max(50000).nullable().optional(),

  company_id: z.string().uuid().nullable().optional(),
  contact_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),

  // Task fields
  due_date: z.string().datetime().nullable().optional(),
  reminder_at: z.string().datetime().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

  // Meeting fields
  meeting_start: z.string().datetime().nullable().optional(),
  meeting_end: z.string().datetime().nullable().optional(),
  meeting_location: z.string().max(500).nullable().optional(),
  meeting_link: z.string().url().nullable().optional(),
  meeting_attendees: z.array(meetingAttendeeSchema).default([]),

  // Call fields
  call_duration: z.number().int().min(0).nullable().optional(),
  call_direction: z.enum(['inbound', 'outbound']).nullable().optional(),
  call_outcome: z.enum(['connected', 'left_voicemail', 'no_answer', 'busy', 'wrong_number', 'callback_scheduled']).nullable().optional(),

  // Email fields
  email_subject: z.string().max(500).nullable().optional(),
  email_direction: z.enum(['sent', 'received']).nullable().optional(),

  // Note fields
  note_type: z.enum(['general', 'meeting_notes', 'call_notes', 'internal', 'important']).nullable().optional(),
  is_pinned: z.boolean().default(false),

  // Other
  owner_id: z.string().uuid().nullable().optional(),
  visibility: z.enum(['public', 'private', 'team']).default('public'),
  tags: z.array(z.string().max(50)).default([]),
  custom_fields: z.record(z.unknown()).default({}),
  attachments: z.array(attachmentSchema).default([]),

  occurred_at: z.string().datetime().optional(),
})

const activityUpdateSchema = activityCreateSchema.partial().extend({
  is_completed: z.boolean().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  meeting_notes: z.string().max(10000).nullable().optional(),
  meeting_outcome: z.string().max(2000).nullable().optional(),
  call_recording_url: z.string().url().nullable().optional(),
  email_status: z.enum(['draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'spam', 'unsubscribed']).nullable().optional(),
})

const bulkCompleteSchema = z.object({
  activity_ids: z.array(z.string().uuid()).min(1).max(100),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isOverdue(activity: Partial<Activity>): boolean {
  if (activity.is_completed) return false
  if (!activity.due_date) return false
  return new Date(activity.due_date) < new Date()
}

async function updateEntityActivityStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  companyId?: string | null,
  contactId?: string | null,
  dealId?: string | null
): Promise<void> {
  const now = new Date().toISOString()

  // Update company activity stats
  if (companyId) {
    const { count } = await supabase
      .from('crm_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('company_id', companyId)

    await supabase
      .from('crm_companies')
      .update({
        activities_count: count || 0,
        last_activity_at: now,
        updated_at: now,
      })
      .eq('id', companyId)
  }

  // Update contact activity stats
  if (contactId) {
    const { count } = await supabase
      .from('crm_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('contact_id', contactId)

    await supabase
      .from('crm_contacts')
      .update({
        activities_count: count || 0,
        last_activity_at: now,
        updated_at: now,
      })
      .eq('id', contactId)
  }

  // Update deal activity stats
  if (dealId) {
    const { count } = await supabase
      .from('crm_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('deal_id', dealId)

    await supabase
      .from('crm_deals')
      .update({
        activities_count: count || 0,
        last_activity_at: now,
        updated_at: now,
      })
      .eq('id', dealId)
  }
}

// ============================================================================
// GET - List/Search Activities
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
    if (action === 'stats') {
      return getActivityStats(supabase, user.id, searchParams)
    }
    if (action === 'timeline') {
      return getTimeline(supabase, user.id, searchParams)
    }
    if (action === 'upcoming') {
      return getUpcoming(supabase, user.id, searchParams)
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || 'occurred_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // Parse filters
    const filters: ActivitySearchFilters = {
      search: searchParams.get('search') || undefined,
      type: searchParams.getAll('type') as ActivityType[],
      company_id: searchParams.get('company_id') || undefined,
      contact_id: searchParams.get('contact_id') || undefined,
      deal_id: searchParams.get('deal_id') || undefined,
      owner_id: searchParams.get('owner_id') || undefined,
      performed_by: searchParams.get('performed_by') || undefined,
      priority: searchParams.getAll('priority') as ActivityPriority[],
      is_completed: searchParams.get('is_completed') === 'true' ? true : searchParams.get('is_completed') === 'false' ? false : undefined,
      is_overdue: searchParams.get('is_overdue') === 'true' ? true : undefined,
      has_due_date: searchParams.get('has_due_date') === 'true' ? true : searchParams.get('has_due_date') === 'false' ? false : undefined,
      due_after: searchParams.get('due_after') || undefined,
      due_before: searchParams.get('due_before') || undefined,
      occurred_after: searchParams.get('occurred_after') || undefined,
      occurred_before: searchParams.get('occurred_before') || undefined,
      tags: searchParams.getAll('tags'),
      visibility: searchParams.getAll('visibility') as ActivityVisibility[],
    }

    // Build query
    let query = supabase
      .from('crm_activities')
      .select(`
        *,
        company:crm_companies!company_id(id, name, logo_url),
        contact:crm_contacts!contact_id(id, full_name, email, avatar_url),
        deal:crm_deals!deal_id(id, name, value, currency),
        owner:users!owner_id(id, name, avatar_url),
        performer:users!performed_by(id, name, avatar_url)
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }

    if (filters.type?.length) {
      query = query.in('type', filters.type)
    }

    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id)
    }

    if (filters.contact_id) {
      query = query.eq('contact_id', filters.contact_id)
    }

    if (filters.deal_id) {
      query = query.eq('deal_id', filters.deal_id)
    }

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }

    if (filters.performed_by) {
      query = query.eq('performed_by', filters.performed_by)
    }

    if (filters.priority?.length) {
      query = query.in('priority', filters.priority)
    }

    if (filters.is_completed !== undefined) {
      query = query.eq('is_completed', filters.is_completed)
    }

    if (filters.has_due_date === true) {
      query = query.not('due_date', 'is', null)
    } else if (filters.has_due_date === false) {
      query = query.is('due_date', null)
    }

    if (filters.due_after) {
      query = query.gte('due_date', filters.due_after)
    }

    if (filters.due_before) {
      query = query.lte('due_date', filters.due_before)
    }

    if (filters.occurred_after) {
      query = query.gte('occurred_at', filters.occurred_after)
    }

    if (filters.occurred_before) {
      query = query.lte('occurred_at', filters.occurred_before)
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.visibility?.length) {
      query = query.in('visibility', filters.visibility)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: activities, error, count } = await query

    if (error) {
      logger.error('Error fetching activities', { error })
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    // Filter overdue activities if requested
    let filteredActivities = activities || []
    if (filters.is_overdue) {
      filteredActivities = filteredActivities.filter(a => isOverdue(a))
    }

    // Add computed properties
    const processedActivities = filteredActivities.map(activity => ({
      ...activity,
      is_overdue: isOverdue(activity),
    }))

    return NextResponse.json({
      activities: processedActivities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })

  } catch (error) {
    logger.error('Activities GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// POST - Create Activity
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

    // Handle bulk complete
    const action = searchParams.get('action')
    if (action === 'bulk_complete') {
      return bulkComplete(supabase, user.id, body)
    }

    // Validate activity creation
    const validation = activityCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid activity data', details: validation.error.errors }, { status: 400 })
    }

    const activityData = validation.data

    // Set occurred_at to now if not provided
    const occurredAt = activityData.occurred_at || new Date().toISOString()

    // Get associated entity names
    let companyName = null
    let contactName = null
    let dealName = null

    if (activityData.company_id) {
      const { data: company } = await supabase
        .from('crm_companies')
        .select('name')
        .eq('id', activityData.company_id)
        .eq('user_id', user.id)
        .single()
      companyName = company?.name
    }

    if (activityData.contact_id) {
      const { data: contact } = await supabase
        .from('crm_contacts')
        .select('full_name')
        .eq('id', activityData.contact_id)
        .eq('user_id', user.id)
        .single()
      contactName = contact?.full_name
    }

    if (activityData.deal_id) {
      const { data: deal } = await supabase
        .from('crm_deals')
        .select('name')
        .eq('id', activityData.deal_id)
        .eq('user_id', user.id)
        .single()
      dealName = deal?.name
    }

    // Insert activity
    const { data: activity, error } = await supabase
      .from('crm_activities')
      .insert({
        ...activityData,
        company_name: companyName,
        contact_name: contactName,
        deal_name: dealName,
        user_id: user.id,
        performed_by: user.id,
        is_completed: false,
        occurred_at: occurredAt,
      })
      .select(`
        *,
        company:crm_companies!company_id(id, name, logo_url),
        contact:crm_contacts!contact_id(id, full_name, email, avatar_url),
        deal:crm_deals!deal_id(id, name, value, currency),
        owner:users!owner_id(id, name, avatar_url),
        performer:users!performed_by(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error creating activity', { error })
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
    }

    // Update entity activity stats
    await updateEntityActivityStats(
      supabase,
      user.id,
      activity.company_id,
      activity.contact_id,
      activity.deal_id
    )

    // Update contact last_contacted_at for communication activities
    if (activityData.contact_id && ['call', 'email', 'meeting', 'message'].includes(activityData.type)) {
      await supabase
        .from('crm_contacts')
        .update({ last_contacted_at: occurredAt })
        .eq('id', activityData.contact_id)
    }

    // Update company last_contacted_at
    if (activityData.company_id && ['call', 'email', 'meeting', 'message'].includes(activityData.type)) {
      await supabase
        .from('crm_companies')
        .update({ last_contacted_at: occurredAt })
        .eq('id', activityData.company_id)
    }

    return NextResponse.json({
      activity: {
        ...activity,
        is_overdue: isOverdue(activity),
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Activities POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update Activity
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
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 })
    }

    // Validate update data
    const validation = activityUpdateSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    // Check activity exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const validatedData = validation.data

    // Handle completion
    if (validatedData.is_completed !== undefined && validatedData.is_completed !== existing.is_completed) {
      if (validatedData.is_completed && !validatedData.completed_at) {
        validatedData.completed_at = new Date().toISOString()
      } else if (!validatedData.is_completed) {
        validatedData.completed_at = null
      }
    }

    // Update activity
    const { data: activity, error } = await supabase
      .from('crm_activities')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        company:crm_companies!company_id(id, name, logo_url),
        contact:crm_contacts!contact_id(id, full_name, email, avatar_url),
        deal:crm_deals!deal_id(id, name, value, currency),
        owner:users!owner_id(id, name, avatar_url),
        performer:users!performed_by(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error updating activity', { error })
      return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
    }

    return NextResponse.json({
      activity: {
        ...activity,
        is_overdue: isOverdue(activity),
      },
    })

  } catch (error) {
    logger.error('Activities PUT error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Delete Activity
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
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 })
    }

    // Check activity exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_activities')
      .select('id, company_id, contact_id, deal_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Delete activity
    const { error } = await supabase
      .from('crm_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Error deleting activity', { error })
      return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
    }

    // Update entity activity stats
    await updateEntityActivityStats(
      supabase,
      user.id,
      existing.company_id,
      existing.contact_id,
      existing.deal_id
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Activities DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// HELPER ENDPOINTS
// ============================================================================

async function getActivityStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const companyId = searchParams.get('company_id')
  const contactId = searchParams.get('contact_id')
  const dealId = searchParams.get('deal_id')

  let query = supabase
    .from('crm_activities')
    .select('type, is_completed, due_date, occurred_at')
    .eq('user_id', userId)

  if (companyId) query = query.eq('company_id', companyId)
  if (contactId) query = query.eq('contact_id', contactId)
  if (dealId) query = query.eq('deal_id', dealId)

  const { data: activities, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const stats: ActivityStats = {
    total: activities?.length || 0,
    by_type: {},
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    calls_today: 0,
    emails_today: 0,
    meetings_today: 0,
  }

  const allActivities = activities || []
  for (const activity of allActivities) {
    // Count by type
    stats.by_type[activity.type] = (stats.by_type[activity.type] || 0) + 1

    // Task stats
    if (['task', 'follow_up', 'deadline'].includes(activity.type)) {
      if (activity.is_completed) {
        stats.completed_tasks++
      } else {
        stats.pending_tasks++
        if (activity.due_date && new Date(activity.due_date) < now) {
          stats.overdue_tasks++
        }
      }
    }

    // Today's activity counts
    if (activity.occurred_at && new Date(activity.occurred_at) >= todayStart) {
      if (activity.type === 'call') stats.calls_today++
      if (activity.type === 'email') stats.emails_today++
      if (activity.type === 'meeting') stats.meetings_today++
    }
  }

  return NextResponse.json({ stats })
}

async function getTimeline(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const companyId = searchParams.get('company_id')
  const contactId = searchParams.get('contact_id')
  const dealId = searchParams.get('deal_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  let query = supabase
    .from('crm_activities')
    .select(`
      *,
      company:crm_companies!company_id(id, name),
      contact:crm_contacts!contact_id(id, full_name),
      deal:crm_deals!deal_id(id, name),
      performer:users!performed_by(id, name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (companyId) query = query.eq('company_id', companyId)
  if (contactId) query = query.eq('contact_id', contactId)
  if (dealId) query = query.eq('deal_id', dealId)

  const { data: activities, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }

  // Group by date
  const timeline: Record<string, typeof activities> = {}
  const allActivities = activities || []

  for (const activity of allActivities) {
    const date = activity.occurred_at.split('T')[0]
    if (!timeline[date]) {
      timeline[date] = []
    }
    timeline[date].push(activity)
  }

  return NextResponse.json({ timeline })
}

async function getUpcoming(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  searchParams: URLSearchParams
) {
  const days = parseInt(searchParams.get('days') || '7')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  const now = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)

  // Get upcoming tasks and meetings
  const { data: activities, error } = await supabase
    .from('crm_activities')
    .select(`
      *,
      company:crm_companies!company_id(id, name),
      contact:crm_contacts!contact_id(id, full_name, email),
      deal:crm_deals!deal_id(id, name),
      owner:users!owner_id(id, name, avatar_url)
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .or(`due_date.gte.${now.toISOString()},meeting_start.gte.${now.toISOString()}`)
    .or(`due_date.lte.${endDate.toISOString()},meeting_start.lte.${endDate.toISOString()}`)
    .order('due_date', { ascending: true })
    .order('meeting_start', { ascending: true })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch upcoming activities' }, { status: 500 })
  }

  // Also get overdue tasks
  const { data: overdue } = await supabase
    .from('crm_activities')
    .select(`
      *,
      company:crm_companies!company_id(id, name),
      contact:crm_contacts!contact_id(id, full_name, email),
      deal:crm_deals!deal_id(id, name),
      owner:users!owner_id(id, name, avatar_url)
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .lt('due_date', now.toISOString())
    .in('type', ['task', 'follow_up', 'deadline'])
    .order('due_date', { ascending: true })
    .limit(limit)

  return NextResponse.json({
    upcoming: activities || [],
    overdue: overdue || [],
  })
}

async function bulkComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  body: unknown
) {
  const validation = bulkCompleteSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 })
  }

  const { activity_ids } = validation.data
  const completedAt = new Date().toISOString()

  const { error } = await supabase
    .from('crm_activities')
    .update({
      is_completed: true,
      completed_at: completedAt,
      updated_at: completedAt,
    })
    .eq('user_id', userId)
    .in('id', activity_ids)

  if (error) {
    return NextResponse.json({ error: 'Failed to complete activities' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    completed: activity_ids.length,
  })
}
