import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Contact {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  phone: string | null
  mobile: string | null
  job_title: string | null
  department: string | null
  linkedin_url: string | null
  twitter_url: string | null
  avatar_url: string | null

  // Company Association
  company_id: string | null
  company_name: string | null

  // Contact Details
  status: ContactStatus
  lifecycle_stage: LifecycleStage
  lead_source: string | null
  lead_score: number

  // Address
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  timezone: string | null

  // Communication Preferences
  email_opt_in: boolean
  sms_opt_in: boolean
  preferred_contact_method: ContactMethod
  preferred_contact_time: string | null
  do_not_contact: boolean

  // CRM Data
  owner_id: string | null
  owner_name: string | null
  owner_avatar: string | null
  tags: string[]
  custom_fields: Record<string, unknown>

  // Engagement
  engagement_score: number
  last_email_opened_at: string | null
  last_email_clicked_at: string | null
  last_website_visit_at: string | null
  total_emails_sent: number
  total_emails_opened: number
  total_emails_clicked: number
  website_visits_count: number

  // Relationships
  deals_count: number
  activities_count: number
  notes_count: number
  total_deal_value: number

  // Timestamps
  created_at: string
  updated_at: string
  last_activity_at: string | null
  last_contacted_at: string | null
  converted_at: string | null

  // Metadata
  created_by: string | null
  user_id: string
}

export type ContactStatus =
  | 'active'
  | 'inactive'
  | 'bounced'
  | 'unsubscribed'
  | 'spam_complaint'
  | 'do_not_contact'

export type LifecycleStage =
  | 'subscriber'
  | 'lead'
  | 'marketing_qualified_lead'
  | 'sales_qualified_lead'
  | 'opportunity'
  | 'customer'
  | 'evangelist'
  | 'other'

export type ContactMethod =
  | 'email'
  | 'phone'
  | 'sms'
  | 'linkedin'
  | 'any'

export interface ContactSearchFilters {
  search?: string
  company_id?: string
  status?: ContactStatus[]
  lifecycle_stage?: LifecycleStage[]
  owner_id?: string
  tags?: string[]
  country?: string[]
  has_email?: boolean
  has_phone?: boolean
  email_opt_in?: boolean
  min_lead_score?: number
  max_lead_score?: number
  min_engagement_score?: number
  max_engagement_score?: number
  has_deals?: boolean
  created_after?: string
  created_before?: string
  last_activity_after?: string
  last_activity_before?: string
}

export interface ContactEnrichmentData {
  email: string
  first_name?: string
  last_name?: string
  job_title?: string
  company_name?: string
  linkedin_url?: string
  twitter_url?: string
  avatar_url?: string
  phone?: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
}

export interface ContactImportResult {
  success: number
  failed: number
  duplicates: number
  errors: { row: number; error: string }[]
  created_ids: string[]
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const contactCreateSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  mobile: z.string().max(50).nullable().optional(),
  job_title: z.string().max(200).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),

  company_id: z.string().uuid().nullable().optional(),

  status: z.enum(['active', 'inactive', 'bounced', 'unsubscribed', 'spam_complaint', 'do_not_contact']).default('active'),
  lifecycle_stage: z.enum(['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer', 'evangelist', 'other']).default('lead'),
  lead_source: z.string().max(100).nullable().optional(),

  address_line1: z.string().max(255).nullable().optional(),
  address_line2: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),

  email_opt_in: z.boolean().default(true),
  sms_opt_in: z.boolean().default(false),
  preferred_contact_method: z.enum(['email', 'phone', 'sms', 'linkedin', 'any']).default('email'),
  preferred_contact_time: z.string().max(100).nullable().optional(),
  do_not_contact: z.boolean().default(false),

  owner_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
  custom_fields: z.record(z.unknown()).default({}),
})

const contactUpdateSchema = contactCreateSchema.partial()

const bulkImportSchema = z.object({
  contacts: z.array(contactCreateSchema).min(1).max(1000),
  skip_duplicates: z.boolean().default(true),
  update_existing: z.boolean().default(false),
  default_owner_id: z.string().uuid().optional(),
  default_tags: z.array(z.string().max(50)).optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function calculateEngagementScore(contact: Partial<Contact>): number {
  let score = 0

  // Email engagement (max 40 points)
  if (contact.total_emails_opened && contact.total_emails_sent) {
    const openRate = contact.total_emails_opened / contact.total_emails_sent
    score += Math.round(openRate * 20)
  }
  if (contact.total_emails_clicked && contact.total_emails_sent) {
    const clickRate = contact.total_emails_clicked / contact.total_emails_sent
    score += Math.round(clickRate * 20)
  }

  // Recent email activity (max 20 points)
  if (contact.last_email_opened_at) {
    const daysSinceOpen = Math.floor(
      (Date.now() - new Date(contact.last_email_opened_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceOpen < 7) score += 20
    else if (daysSinceOpen < 30) score += 15
    else if (daysSinceOpen < 90) score += 10
  }

  // Website visits (max 20 points)
  if (contact.website_visits_count && contact.website_visits_count > 10) {
    score += 20
  } else if (contact.website_visits_count && contact.website_visits_count > 5) {
    score += 15
  } else if (contact.website_visits_count && contact.website_visits_count > 0) {
    score += 10
  }

  // Deal involvement (max 20 points)
  if (contact.deals_count && contact.deals_count > 0) {
    score += Math.min(contact.deals_count * 5, 20)
  }

  return Math.min(100, score)
}

async function enrichContact(email: string): Promise<ContactEnrichmentData | null> {
  // In production, integrate with enrichment APIs like:
  // - Clearbit
  // - Hunter.io
  // - Apollo.io
  // - FullContact
  // - ZoomInfo

  return {
    email,
    // Enrichment data would come from external API
  }
}

async function calculateLeadScore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  contact: Partial<Contact>
): Promise<number> {
  // Get lead scoring rules
  const { data: rules } = await supabase
    .from('crm_lead_scoring_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('weight', { ascending: false })

  if (!rules || rules.length === 0) {
    // Default scoring
    let score = 0

    // Has email (+20)
    if (contact.email) score += 20

    // Has phone (+10)
    if (contact.phone || contact.mobile) score += 10

    // Job title indicates decision maker (+15)
    const decisionMakerTitles = ['ceo', 'cto', 'cfo', 'vp', 'director', 'head', 'manager', 'owner', 'founder']
    if (contact.job_title) {
      const lowerTitle = contact.job_title.toLowerCase()
      if (decisionMakerTitles.some(t => lowerTitle.includes(t))) {
        score += 15
      }
    }

    // Has company (+10)
    if (contact.company_id) score += 10

    // Engagement score contribution (+25)
    score += Math.round((contact.engagement_score || 0) * 0.25)

    // Lifecycle stage (+20)
    const stageScores: Record<string, number> = {
      subscriber: 5,
      lead: 10,
      marketing_qualified_lead: 15,
      sales_qualified_lead: 20,
      opportunity: 25,
      customer: 30,
    }
    score += stageScores[contact.lifecycle_stage || 'lead'] || 10

    return Math.min(100, score)
  }

  // Custom scoring rules would be applied here
  let score = 0
  for (const rule of rules) {
    // Evaluate each rule against the contact
    // This would involve evaluating conditions like:
    // - Field matches (e.g., job_title contains "CEO")
    // - Numeric comparisons (e.g., engagement_score > 50)
    // - List membership (e.g., country in ["US", "UK"])
    // For brevity, we'll skip the detailed implementation
  }

  return Math.min(100, Math.max(0, score))
}

// ============================================================================
// GET - List/Search Contacts
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || 'updated_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const includeStats = searchParams.get('includeStats') === 'true'

    // Parse filters
    const filters: ContactSearchFilters = {
      search: searchParams.get('search') || undefined,
      company_id: searchParams.get('company_id') || undefined,
      status: searchParams.getAll('status') as ContactStatus[],
      lifecycle_stage: searchParams.getAll('lifecycle_stage') as LifecycleStage[],
      owner_id: searchParams.get('owner_id') || undefined,
      tags: searchParams.getAll('tags'),
      country: searchParams.getAll('country'),
      has_email: searchParams.get('has_email') === 'true' ? true : searchParams.get('has_email') === 'false' ? false : undefined,
      has_phone: searchParams.get('has_phone') === 'true' ? true : searchParams.get('has_phone') === 'false' ? false : undefined,
      email_opt_in: searchParams.get('email_opt_in') === 'true' ? true : searchParams.get('email_opt_in') === 'false' ? false : undefined,
      min_lead_score: searchParams.get('min_lead_score') ? parseFloat(searchParams.get('min_lead_score')!) : undefined,
      max_lead_score: searchParams.get('max_lead_score') ? parseFloat(searchParams.get('max_lead_score')!) : undefined,
      min_engagement_score: searchParams.get('min_engagement_score') ? parseFloat(searchParams.get('min_engagement_score')!) : undefined,
      max_engagement_score: searchParams.get('max_engagement_score') ? parseFloat(searchParams.get('max_engagement_score')!) : undefined,
      has_deals: searchParams.get('has_deals') === 'true' ? true : searchParams.get('has_deals') === 'false' ? false : undefined,
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
      last_activity_after: searchParams.get('last_activity_after') || undefined,
      last_activity_before: searchParams.get('last_activity_before') || undefined,
    }

    // Build query
    let query = supabase
      .from('crm_contacts')
      .select(`
        *,
        company:crm_companies!company_id(id, name, domain, logo_url),
        owner:users!owner_id(id, name, avatar_url)
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,job_title.ilike.%${filters.search}%`)
    }

    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id)
    }

    if (filters.status?.length) {
      query = query.in('status', filters.status)
    }

    if (filters.lifecycle_stage?.length) {
      query = query.in('lifecycle_stage', filters.lifecycle_stage)
    }

    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }

    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.country?.length) {
      query = query.in('country', filters.country)
    }

    if (filters.has_email === true) {
      query = query.not('email', 'is', null)
    } else if (filters.has_email === false) {
      query = query.is('email', null)
    }

    if (filters.has_phone === true) {
      query = query.or('phone.not.is.null,mobile.not.is.null')
    }

    if (filters.email_opt_in !== undefined) {
      query = query.eq('email_opt_in', filters.email_opt_in)
    }

    if (filters.min_lead_score !== undefined) {
      query = query.gte('lead_score', filters.min_lead_score)
    }

    if (filters.max_lead_score !== undefined) {
      query = query.lte('lead_score', filters.max_lead_score)
    }

    if (filters.min_engagement_score !== undefined) {
      query = query.gte('engagement_score', filters.min_engagement_score)
    }

    if (filters.max_engagement_score !== undefined) {
      query = query.lte('engagement_score', filters.max_engagement_score)
    }

    if (filters.has_deals === true) {
      query = query.gt('deals_count', 0)
    } else if (filters.has_deals === false) {
      query = query.eq('deals_count', 0)
    }

    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after)
    }

    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before)
    }

    if (filters.last_activity_after) {
      query = query.gte('last_activity_at', filters.last_activity_after)
    }

    if (filters.last_activity_before) {
      query = query.lte('last_activity_at', filters.last_activity_before)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: contacts, error, count } = await query

    if (error) {
      console.error('Error fetching contacts:', error)
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    // Get aggregate stats if requested
    let stats = null
    if (includeStats) {
      const { data: statsData } = await supabase
        .from('crm_contacts')
        .select('status, lifecycle_stage, lead_score, engagement_score, email_opt_in')
        .eq('user_id', user.id)

      if (statsData) {
        stats = {
          total: statsData.length,
          byStatus: statsData.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          byLifecycleStage: statsData.reduce((acc, c) => {
            acc[c.lifecycle_stage] = (acc[c.lifecycle_stage] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          averageLeadScore: statsData.length > 0
            ? statsData.reduce((sum, c) => sum + (c.lead_score || 0), 0) / statsData.length
            : 0,
          averageEngagementScore: statsData.length > 0
            ? statsData.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / statsData.length
            : 0,
          emailOptInRate: statsData.length > 0
            ? statsData.filter(c => c.email_opt_in).length / statsData.length
            : 0,
        }
      }
    }

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    })

  } catch (error) {
    console.error('Contacts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// POST - Create Contact(s)
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
    const isBulkImport = searchParams.get('import') === 'true'

    // Handle bulk import
    if (isBulkImport) {
      const validation = bulkImportSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid import data', details: validation.error.errors }, { status: 400 })
      }

      const result = await processBulkImport(supabase, user.id, validation.data)
      return NextResponse.json({ result })
    }

    // Validate single contact creation
    const validation = contactCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid contact data', details: validation.error.errors }, { status: 400 })
    }

    const contactData = validation.data

    // Normalize email
    if (contactData.email) {
      contactData.email = normalizeEmail(contactData.email)
    }

    // Check for duplicate email
    if (contactData.email) {
      const { data: existing } = await supabase
        .from('crm_contacts')
        .select('id, full_name')
        .eq('user_id', user.id)
        .eq('email', contactData.email)
        .single()

      if (existing) {
        return NextResponse.json({
          error: 'Duplicate contact',
          message: `A contact with email "${contactData.email}" already exists: ${existing.full_name}`,
          existing_id: existing.id,
        }, { status: 409 })
      }
    }

    // Create full name
    const fullName = `${contactData.first_name} ${contactData.last_name}`.trim()

    // Enrich contact if email is available
    let enrichedData: ContactEnrichmentData | null = null
    if (contactData.email && searchParams.get('enrich') !== 'false') {
      enrichedData = await enrichContact(contactData.email)
      if (enrichedData) {
        // Merge enriched data (don't overwrite user-provided data)
        if (!contactData.job_title && enrichedData.job_title) {
          contactData.job_title = enrichedData.job_title
        }
        if (!contactData.linkedin_url && enrichedData.linkedin_url) {
          contactData.linkedin_url = enrichedData.linkedin_url
        }
        if (!contactData.twitter_url && enrichedData.twitter_url) {
          contactData.twitter_url = enrichedData.twitter_url
        }
        if (!contactData.avatar_url && enrichedData.avatar_url) {
          contactData.avatar_url = enrichedData.avatar_url
        }
        if (!contactData.phone && enrichedData.phone) {
          contactData.phone = enrichedData.phone
        }
        if (enrichedData.location) {
          if (!contactData.city && enrichedData.location.city) {
            contactData.city = enrichedData.location.city
          }
          if (!contactData.state && enrichedData.location.state) {
            contactData.state = enrichedData.location.state
          }
          if (!contactData.country && enrichedData.location.country) {
            contactData.country = enrichedData.location.country
          }
        }
      }
    }

    // Calculate initial scores
    const engagementScore = 0 // New contacts start at 0
    const leadScore = await calculateLeadScore(supabase, user.id, {
      ...contactData,
      engagement_score: engagementScore,
    })

    // Insert contact
    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .insert({
        ...contactData,
        full_name: fullName,
        user_id: user.id,
        created_by: user.id,
        lead_score: leadScore,
        engagement_score: engagementScore,
        deals_count: 0,
        activities_count: 0,
        notes_count: 0,
        total_deal_value: 0,
        total_emails_sent: 0,
        total_emails_opened: 0,
        total_emails_clicked: 0,
        website_visits_count: 0,
      })
      .select(`
        *,
        company:crm_companies!company_id(id, name, domain, logo_url),
        owner:users!owner_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }

    // Update company contacts count if associated
    if (contact.company_id) {
      await supabase.rpc('increment_company_contacts_count', { company_id: contact.company_id })
    }

    // Log activity
    await supabase.from('crm_activities').insert({
      user_id: user.id,
      contact_id: contact.id,
      company_id: contact.company_id,
      type: 'contact_created',
      title: 'Contact created',
      description: `Created contact: ${contact.full_name}`,
      performed_by: user.id,
    })

    return NextResponse.json({
      contact,
      enriched: enrichedData !== null,
    }, { status: 201 })

  } catch (error) {
    console.error('Contacts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update Contact
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
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    // Validate update data
    const validation = contactUpdateSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    // Check contact exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const validatedData = validation.data

    // Normalize email if provided
    if (validatedData.email) {
      validatedData.email = normalizeEmail(validatedData.email)

      // Check for duplicate email (excluding current contact)
      if (validatedData.email !== existing.email) {
        const { data: duplicate } = await supabase
          .from('crm_contacts')
          .select('id, full_name')
          .eq('user_id', user.id)
          .eq('email', validatedData.email)
          .neq('id', id)
          .single()

        if (duplicate) {
          return NextResponse.json({
            error: 'Duplicate email',
            message: `Another contact already has email "${validatedData.email}": ${duplicate.full_name}`,
          }, { status: 409 })
        }
      }
    }

    // Update full name if first_name or last_name changed
    let fullName = existing.full_name
    if (validatedData.first_name || validatedData.last_name) {
      const firstName = validatedData.first_name || existing.first_name
      const lastName = validatedData.last_name || existing.last_name
      fullName = `${firstName} ${lastName}`.trim()
    }

    // Track company change
    const oldCompanyId = existing.company_id
    const newCompanyId = validatedData.company_id !== undefined ? validatedData.company_id : oldCompanyId

    // Recalculate scores if relevant fields changed
    const merged = { ...existing, ...validatedData }
    const newEngagementScore = calculateEngagementScore(merged)
    const newLeadScore = await calculateLeadScore(supabase, user.id, { ...merged, engagement_score: newEngagementScore })

    // Update contact
    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .update({
        ...validatedData,
        full_name: fullName,
        lead_score: newLeadScore,
        engagement_score: newEngagementScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        company:crm_companies!company_id(id, name, domain, logo_url),
        owner:users!owner_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error updating contact:', error)
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
    }

    // Update company contacts counts if company changed
    if (oldCompanyId !== newCompanyId) {
      if (oldCompanyId) {
        await supabase.rpc('decrement_company_contacts_count', { company_id: oldCompanyId })
      }
      if (newCompanyId) {
        await supabase.rpc('increment_company_contacts_count', { company_id: newCompanyId })
      }
    }

    // Log activity
    await supabase.from('crm_activities').insert({
      user_id: user.id,
      contact_id: contact.id,
      company_id: contact.company_id,
      type: 'contact_updated',
      title: 'Contact updated',
      description: `Updated contact: ${contact.full_name}`,
      changes: JSON.stringify(validatedData),
      performed_by: user.id,
    })

    return NextResponse.json({ contact })

  } catch (error) {
    console.error('Contacts PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Delete Contact
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
    const permanent = searchParams.get('permanent') === 'true'

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    // Check contact exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_contacts')
      .select('id, full_name, company_id, deals_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Warn if contact has active deals
    if (existing.deals_count > 0 && !permanent) {
      return NextResponse.json({
        error: 'Contact has active deals',
        message: `This contact has ${existing.deals_count} deal(s). Use permanent=true to force delete.`,
      }, { status: 400 })
    }

    if (permanent) {
      // Permanently delete contact
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting contact:', error)
        return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
      }

      // Update company contacts count
      if (existing.company_id) {
        await supabase.rpc('decrement_company_contacts_count', { company_id: existing.company_id })
      }
    } else {
      // Soft delete (mark as inactive)
      const { error } = await supabase
        .from('crm_contacts')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error archiving contact:', error)
        return NextResponse.json({ error: 'Failed to archive contact' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      deleted: permanent,
      archived: !permanent,
    })

  } catch (error) {
    console.error('Contacts DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// BULK IMPORT HELPER
// ============================================================================

async function processBulkImport(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  importData: z.infer<typeof bulkImportSchema>
): Promise<ContactImportResult> {
  const result: ContactImportResult = {
    success: 0,
    failed: 0,
    duplicates: 0,
    errors: [],
    created_ids: [],
  }

  const { contacts, skip_duplicates, update_existing, default_owner_id, default_tags } = importData

  // Get existing emails for duplicate checking
  const existingEmails = new Set<string>()
  const existingEmailToId = new Map<string, string>()

  const emails = contacts.filter(c => c.email).map(c => normalizeEmail(c.email!))
  if (emails.length > 0) {
    const { data: existingContacts } = await supabase
      .from('crm_contacts')
      .select('id, email')
      .eq('user_id', userId)
      .in('email', emails)

    existingContacts?.forEach(c => {
      existingEmails.add(c.email)
      existingEmailToId.set(c.email, c.id)
    })
  }

  // Process contacts
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i]
    const normalizedEmail = contact.email ? normalizeEmail(contact.email) : null

    try {
      // Check for duplicate
      if (normalizedEmail && existingEmails.has(normalizedEmail)) {
        if (skip_duplicates && !update_existing) {
          result.duplicates++
          continue
        }

        if (update_existing) {
          // Update existing contact
          const existingId = existingEmailToId.get(normalizedEmail)!
          await supabase
            .from('crm_contacts')
            .update({
              ...contact,
              email: normalizedEmail,
              full_name: `${contact.first_name} ${contact.last_name}`.trim(),
              tags: default_tags ? [...new Set([...(contact.tags || []), ...default_tags])] : contact.tags,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingId)
            .eq('user_id', userId)

          result.success++
          result.created_ids.push(existingId)
          continue
        }
      }

      // Calculate scores
      const leadScore = await calculateLeadScore(supabase, userId, contact)

      // Insert new contact
      const { data: newContact, error } = await supabase
        .from('crm_contacts')
        .insert({
          ...contact,
          email: normalizedEmail,
          full_name: `${contact.first_name} ${contact.last_name}`.trim(),
          owner_id: contact.owner_id || default_owner_id,
          tags: default_tags ? [...new Set([...(contact.tags || []), ...default_tags])] : contact.tags,
          user_id: userId,
          created_by: userId,
          lead_score: leadScore,
          engagement_score: 0,
          deals_count: 0,
          activities_count: 0,
          notes_count: 0,
          total_deal_value: 0,
          total_emails_sent: 0,
          total_emails_opened: 0,
          total_emails_clicked: 0,
          website_visits_count: 0,
        })
        .select('id')
        .single()

      if (error) throw error

      result.success++
      result.created_ids.push(newContact.id)

      // Track for duplicate checking in same batch
      if (normalizedEmail) {
        existingEmails.add(normalizedEmail)
        existingEmailToId.set(normalizedEmail, newContact.id)
      }

    } catch (err) {
      result.failed++
      result.errors.push({
        row: i + 1,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return result
}
