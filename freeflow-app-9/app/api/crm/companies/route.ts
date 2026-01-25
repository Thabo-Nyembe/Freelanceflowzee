import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('crm-api')

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Company {
  id: string
  name: string
  domain: string | null
  website: string | null
  industry: string | null
  size: CompanySize | null
  type: CompanyType
  status: CompanyStatus
  description: string | null
  logo_url: string | null

  // Address
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null

  // Contact Info
  phone: string | null
  email: string | null
  linkedin_url: string | null
  twitter_url: string | null
  facebook_url: string | null

  // Financial
  annual_revenue: number | null
  revenue_currency: string
  employee_count: number | null

  // CRM Data
  owner_id: string | null
  owner_name: string | null
  owner_avatar: string | null
  lead_source: string | null
  tags: string[]
  custom_fields: Record<string, unknown>

  // Health & Scoring
  health_score: number | null
  engagement_score: number | null
  lifetime_value: number | null

  // Relationships
  parent_company_id: string | null
  contacts_count: number
  deals_count: number
  activities_count: number
  open_deals_value: number

  // Timestamps
  created_at: string
  updated_at: string
  last_activity_at: string | null
  last_contacted_at: string | null

  // Metadata
  created_by: string | null
  user_id: string
}

export type CompanySize =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | '5001-10000'
  | '10000+'

export type CompanyType =
  | 'prospect'
  | 'customer'
  | 'partner'
  | 'vendor'
  | 'competitor'
  | 'other'

export type CompanyStatus =
  | 'active'
  | 'inactive'
  | 'churned'
  | 'lead'
  | 'qualified'

export interface CompanySearchFilters {
  search?: string
  industry?: string[]
  size?: CompanySize[]
  type?: CompanyType[]
  status?: CompanyStatus[]
  owner_id?: string
  tags?: string[]
  country?: string[]
  min_revenue?: number
  max_revenue?: number
  min_employees?: number
  max_employees?: number
  min_health_score?: number
  max_health_score?: number
  has_deals?: boolean
  created_after?: string
  created_before?: string
  last_activity_after?: string
  last_activity_before?: string
}

export interface CompanyEnrichmentData {
  domain: string
  name?: string
  description?: string
  logo_url?: string
  industry?: string
  employee_count?: number
  annual_revenue?: number
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string
  technologies?: string[]
  funding_total?: number
  founded_year?: number
}

export interface BulkCompanyOperation {
  action: 'update' | 'delete' | 'assign' | 'tag' | 'untag' | 'merge'
  company_ids: string[]
  data?: Partial<Company>
  owner_id?: string
  tags?: string[]
  merge_into_id?: string
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const companyCreateSchema = z.object({
  name: z.string().min(1).max(255),
  domain: z.string().max(255).nullable().optional(),
  website: z.string().url().nullable().optional(),
  industry: z.string().max(100).nullable().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+']).nullable().optional(),
  type: z.enum(['prospect', 'customer', 'partner', 'vendor', 'competitor', 'other']).default('prospect'),
  status: z.enum(['active', 'inactive', 'churned', 'lead', 'qualified']).default('lead'),
  description: z.string().max(5000).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),

  address_line1: z.string().max(255).nullable().optional(),
  address_line2: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  country: z.string().max(100).nullable().optional(),

  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  twitter_url: z.string().url().nullable().optional(),
  facebook_url: z.string().url().nullable().optional(),

  annual_revenue: z.number().min(0).nullable().optional(),
  revenue_currency: z.string().length(3).default('USD'),
  employee_count: z.number().int().min(0).nullable().optional(),

  owner_id: z.string().uuid().nullable().optional(),
  lead_source: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
  custom_fields: z.record(z.unknown()).default({}),

  parent_company_id: z.string().uuid().nullable().optional(),
})

const companyUpdateSchema = companyCreateSchema.partial()

const bulkOperationSchema = z.object({
  action: z.enum(['update', 'delete', 'assign', 'tag', 'untag', 'merge']),
  company_ids: z.array(z.string().uuid()).min(1).max(100),
  data: companyUpdateSchema.optional(),
  owner_id: z.string().uuid().optional(),
  tags: z.array(z.string().max(50)).optional(),
  merge_into_id: z.string().uuid().optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/)
  return match ? match[1].toLowerCase() : null
}

function extractDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

async function calculateHealthScore(company: Partial<Company>): Promise<number> {
  let score = 50 // Base score

  // Data completeness (+20)
  const fields = ['description', 'industry', 'phone', 'email', 'website', 'employee_count', 'annual_revenue']
  const filledFields = fields.filter(f => company[f as keyof Company] != null).length
  score += Math.round((filledFields / fields.length) * 20)

  // Recent activity (+15)
  if (company.last_activity_at) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(company.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceActivity < 7) score += 15
    else if (daysSinceActivity < 30) score += 10
    else if (daysSinceActivity < 90) score += 5
  }

  // Deal value (+15)
  if (company.open_deals_value && company.open_deals_value > 10000) {
    score += 15
  } else if (company.open_deals_value && company.open_deals_value > 1000) {
    score += 10
  }

  return Math.min(100, Math.max(0, score))
}

async function enrichCompanyData(domain: string): Promise<CompanyEnrichmentData | null> {
  // In production, integrate with enrichment APIs like:
  // - Clearbit
  // - ZoomInfo
  // - Apollo.io
  // - Hunter.io
  // - FullContact

  // Simulated enrichment response
  return {
    domain,
    // Enrichment data would come from external API
  }
}

// ============================================================================
// GET - List/Search Companies
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
    const filters: CompanySearchFilters = {
      search: searchParams.get('search') || undefined,
      industry: searchParams.getAll('industry'),
      size: searchParams.getAll('size') as CompanySize[],
      type: searchParams.getAll('type') as CompanyType[],
      status: searchParams.getAll('status') as CompanyStatus[],
      owner_id: searchParams.get('owner_id') || undefined,
      tags: searchParams.getAll('tags'),
      country: searchParams.getAll('country'),
      min_revenue: searchParams.get('min_revenue') ? parseFloat(searchParams.get('min_revenue')!) : undefined,
      max_revenue: searchParams.get('max_revenue') ? parseFloat(searchParams.get('max_revenue')!) : undefined,
      min_employees: searchParams.get('min_employees') ? parseInt(searchParams.get('min_employees')!) : undefined,
      max_employees: searchParams.get('max_employees') ? parseInt(searchParams.get('max_employees')!) : undefined,
      min_health_score: searchParams.get('min_health_score') ? parseFloat(searchParams.get('min_health_score')!) : undefined,
      max_health_score: searchParams.get('max_health_score') ? parseFloat(searchParams.get('max_health_score')!) : undefined,
      has_deals: searchParams.get('has_deals') === 'true' ? true : searchParams.get('has_deals') === 'false' ? false : undefined,
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
      last_activity_after: searchParams.get('last_activity_after') || undefined,
      last_activity_before: searchParams.get('last_activity_before') || undefined,
    }

    // Build query
    let query = supabase
      .from('crm_companies')
      .select(`
        *,
        owner:users!owner_id(id, name, avatar_url),
        parent_company:crm_companies!parent_company_id(id, name)
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    if (filters.industry?.length) {
      query = query.in('industry', filters.industry)
    }

    if (filters.size?.length) {
      query = query.in('size', filters.size)
    }

    if (filters.type?.length) {
      query = query.in('type', filters.type)
    }

    if (filters.status?.length) {
      query = query.in('status', filters.status)
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

    if (filters.min_revenue !== undefined) {
      query = query.gte('annual_revenue', filters.min_revenue)
    }

    if (filters.max_revenue !== undefined) {
      query = query.lte('annual_revenue', filters.max_revenue)
    }

    if (filters.min_employees !== undefined) {
      query = query.gte('employee_count', filters.min_employees)
    }

    if (filters.max_employees !== undefined) {
      query = query.lte('employee_count', filters.max_employees)
    }

    if (filters.min_health_score !== undefined) {
      query = query.gte('health_score', filters.min_health_score)
    }

    if (filters.max_health_score !== undefined) {
      query = query.lte('health_score', filters.max_health_score)
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

    const { data: companies, error, count } = await query

    if (error) {
      logger.error('Error fetching companies', { error })
      return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
    }

    // Get aggregate stats if requested
    let stats = null
    if (includeStats) {
      const { data: statsData } = await supabase
        .from('crm_companies')
        .select('type, status, annual_revenue, health_score')
        .eq('user_id', user.id)

      if (statsData) {
        stats = {
          total: statsData.length,
          byType: statsData.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          byStatus: statsData.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          totalRevenue: statsData.reduce((sum, c) => sum + (c.annual_revenue || 0), 0),
          averageHealthScore: statsData.length > 0
            ? statsData.reduce((sum, c) => sum + (c.health_score || 0), 0) / statsData.length
            : 0,
        }
      }
    }

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
    })

  } catch (error) {
    logger.error('Companies GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// POST - Create Company
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
    const isBulk = searchParams.get('bulk') === 'true'

    // Handle bulk operations
    if (isBulk) {
      const validation = bulkOperationSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json({ error: 'Invalid bulk operation', details: validation.error.errors }, { status: 400 })
      }

      const operation = validation.data
      const results = await processBulkOperation(supabase, user.id, operation)

      return NextResponse.json({
        success: true,
        results,
      })
    }

    // Validate single company creation
    const validation = companyCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid company data', details: validation.error.errors }, { status: 400 })
    }

    const companyData = validation.data

    // Extract domain from website or email if not provided
    if (!companyData.domain) {
      if (companyData.website) {
        companyData.domain = extractDomainFromUrl(companyData.website)
      } else if (companyData.email) {
        companyData.domain = extractDomainFromEmail(companyData.email)
      }
    }

    // Check for duplicate domain
    if (companyData.domain) {
      const { data: existing } = await supabase
        .from('crm_companies')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('domain', companyData.domain)
        .single()

      if (existing) {
        return NextResponse.json({
          error: 'Duplicate company',
          message: `A company with domain "${companyData.domain}" already exists: ${existing.name}`,
          existing_id: existing.id,
        }, { status: 409 })
      }
    }

    // Enrich company data if domain is available
    let enrichedData: CompanyEnrichmentData | null = null
    if (companyData.domain && searchParams.get('enrich') !== 'false') {
      enrichedData = await enrichCompanyData(companyData.domain)
      if (enrichedData) {
        // Merge enriched data (don't overwrite user-provided data)
        if (!companyData.description && enrichedData.description) {
          companyData.description = enrichedData.description
        }
        if (!companyData.logo_url && enrichedData.logo_url) {
          companyData.logo_url = enrichedData.logo_url
        }
        if (!companyData.industry && enrichedData.industry) {
          companyData.industry = enrichedData.industry
        }
        if (!companyData.employee_count && enrichedData.employee_count) {
          companyData.employee_count = enrichedData.employee_count
        }
        if (!companyData.annual_revenue && enrichedData.annual_revenue) {
          companyData.annual_revenue = enrichedData.annual_revenue
        }
        if (!companyData.linkedin_url && enrichedData.linkedin_url) {
          companyData.linkedin_url = enrichedData.linkedin_url
        }
        if (!companyData.twitter_url && enrichedData.twitter_url) {
          companyData.twitter_url = enrichedData.twitter_url
        }
        if (!companyData.facebook_url && enrichedData.facebook_url) {
          companyData.facebook_url = enrichedData.facebook_url
        }
      }
    }

    // Calculate initial health score
    const healthScore = await calculateHealthScore(companyData)

    // Insert company
    const { data: company, error } = await supabase
      .from('crm_companies')
      .insert({
        ...companyData,
        user_id: user.id,
        created_by: user.id,
        health_score: healthScore,
        contacts_count: 0,
        deals_count: 0,
        activities_count: 0,
        open_deals_value: 0,
      })
      .select(`
        *,
        owner:users!owner_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error creating company', { error })
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }

    // Log activity
    await supabase.from('crm_activities').insert({
      user_id: user.id,
      company_id: company.id,
      type: 'company_created',
      title: 'Company created',
      description: `Created company: ${company.name}`,
      performed_by: user.id,
    })

    return NextResponse.json({
      company,
      enriched: enrichedData !== null,
    }, { status: 201 })

  } catch (error) {
    logger.error('Companies POST error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update Company
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
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Validate update data
    const validation = companyUpdateSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    // Check company exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('crm_companies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const validatedData = validation.data

    // Recalculate health score if relevant fields changed
    const healthRelevantFields = ['description', 'industry', 'phone', 'email', 'website', 'employee_count', 'annual_revenue']
    const healthFieldsChanged = healthRelevantFields.some(f => validatedData[f as keyof typeof validatedData] !== undefined)

    let newHealthScore = existing.health_score
    if (healthFieldsChanged) {
      newHealthScore = await calculateHealthScore({ ...existing, ...validatedData })
    }

    // Update company
    const { data: company, error } = await supabase
      .from('crm_companies')
      .update({
        ...validatedData,
        health_score: newHealthScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        owner:users!owner_id(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Error updating company', { error })
      return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
    }

    // Log activity
    await supabase.from('crm_activities').insert({
      user_id: user.id,
      company_id: company.id,
      type: 'company_updated',
      title: 'Company updated',
      description: `Updated company: ${company.name}`,
      changes: JSON.stringify(validatedData),
      performed_by: user.id,
    })

    return NextResponse.json({ company })

  } catch (error) {
    logger.error('Companies PUT error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Delete Company
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
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Check company exists
    const { data: existing, error: fetchError } = await supabase
      .from('crm_companies')
      .select('id, name, deals_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Warn if company has active deals
    if (existing.deals_count > 0 && !permanent) {
      return NextResponse.json({
        error: 'Company has active deals',
        message: `This company has ${existing.deals_count} deal(s). Use permanent=true to force delete.`,
      }, { status: 400 })
    }

    if (permanent) {
      // Permanently delete company and related data
      const { error } = await supabase
        .from('crm_companies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Error deleting company', { error })
        return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
      }
    } else {
      // Soft delete (mark as inactive)
      const { error } = await supabase
        .from('crm_companies')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Error archiving company', { error })
        return NextResponse.json({ error: 'Failed to archive company' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      deleted: permanent,
      archived: !permanent,
    })

  } catch (error) {
    logger.error('Companies DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================================
// BULK OPERATIONS HELPER
// ============================================================================

async function processBulkOperation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  operation: BulkCompanyOperation
): Promise<{ success: string[]; failed: { id: string; error: string }[] }> {
  const results = { success: [] as string[], failed: [] as { id: string; error: string }[] }

  for (const companyId of operation.company_ids) {
    try {
      switch (operation.action) {
        case 'update':
          if (operation.data) {
            await supabase
              .from('crm_companies')
              .update({ ...operation.data, updated_at: new Date().toISOString() })
              .eq('id', companyId)
              .eq('user_id', userId)
          }
          break

        case 'delete':
          await supabase
            .from('crm_companies')
            .delete()
            .eq('id', companyId)
            .eq('user_id', userId)
          break

        case 'assign':
          if (operation.owner_id) {
            await supabase
              .from('crm_companies')
              .update({ owner_id: operation.owner_id, updated_at: new Date().toISOString() })
              .eq('id', companyId)
              .eq('user_id', userId)
          }
          break

        case 'tag':
          if (operation.tags?.length) {
            const { data: company } = await supabase
              .from('crm_companies')
              .select('tags')
              .eq('id', companyId)
              .eq('user_id', userId)
              .single()

            if (company) {
              const newTags = [...new Set([...(company.tags || []), ...operation.tags])]
              await supabase
                .from('crm_companies')
                .update({ tags: newTags, updated_at: new Date().toISOString() })
                .eq('id', companyId)
                .eq('user_id', userId)
            }
          }
          break

        case 'untag':
          if (operation.tags?.length) {
            const { data: company } = await supabase
              .from('crm_companies')
              .select('tags')
              .eq('id', companyId)
              .eq('user_id', userId)
              .single()

            if (company) {
              const newTags = (company.tags || []).filter((t: string) => !operation.tags!.includes(t))
              await supabase
                .from('crm_companies')
                .update({ tags: newTags, updated_at: new Date().toISOString() })
                .eq('id', companyId)
                .eq('user_id', userId)
            }
          }
          break

        case 'merge':
          if (operation.merge_into_id && companyId !== operation.merge_into_id) {
            // Move all contacts to target company
            await supabase
              .from('crm_contacts')
              .update({ company_id: operation.merge_into_id, updated_at: new Date().toISOString() })
              .eq('company_id', companyId)
              .eq('user_id', userId)

            // Move all deals to target company
            await supabase
              .from('crm_deals')
              .update({ company_id: operation.merge_into_id, updated_at: new Date().toISOString() })
              .eq('company_id', companyId)
              .eq('user_id', userId)

            // Move all activities to target company
            await supabase
              .from('crm_activities')
              .update({ company_id: operation.merge_into_id })
              .eq('company_id', companyId)
              .eq('user_id', userId)

            // Delete the merged company
            await supabase
              .from('crm_companies')
              .delete()
              .eq('id', companyId)
              .eq('user_id', userId)
          }
          break
      }

      results.success.push(companyId)
    } catch (err) {
      results.failed.push({ id: companyId, error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  return results
}
