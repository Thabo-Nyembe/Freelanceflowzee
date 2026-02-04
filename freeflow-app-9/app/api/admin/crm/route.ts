/**
 * Admin CRM API Route
 * Customer Relationship Management - contacts, leads, deals, activities
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('admin-crm-api')

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
const DEMO_CONTACTS = [
  { id: 'contact-1', first_name: 'John', last_name: 'Smith', email: 'john@acme.com', company: 'Acme Corp', type: 'customer', lead_status: 'won', total_revenue: 15000 },
  { id: 'contact-2', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah@techstart.io', company: 'TechStart', type: 'lead', lead_status: 'qualified', total_revenue: 8000 },
  { id: 'contact-3', first_name: 'Mike', last_name: 'Brown', email: 'mike@greenco.com', company: 'GreenCo', type: 'prospect', lead_status: 'proposal', total_revenue: 12000 },
]

const DEMO_DEALS = [
  { id: 'deal-1', name: 'Enterprise License', company_name: 'Acme Corp', stage: 'negotiation', value: 50000, probability: 70 },
  { id: 'deal-2', name: 'Annual Support', company_name: 'TechStart', stage: 'proposal', value: 25000, probability: 50 },
  { id: 'deal-3', name: 'Custom Development', company_name: 'GreenCo', stage: 'discovery', value: 75000, probability: 30 },
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

    logger.info('CRM API request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'contacts':
          return await getContacts(supabase, effectiveUserId, url, demoMode)
        case 'contact':
          return await getContact(supabase, effectiveUserId, url, demoMode)
        case 'leads':
          return await getLeads(supabase, effectiveUserId, url, demoMode)
        case 'deals':
          return await getDeals(supabase, effectiveUserId, url, demoMode)
        case 'activities':
          return await getActivities(supabase, effectiveUserId, url, demoMode)
        case 'stats':
          return await getCRMStats(supabase, effectiveUserId, demoMode)
        case 'overview':
        default:
          return await getCRMOverview(supabase, effectiveUserId, demoMode)
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      // Return demo data
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          contacts: DEMO_CONTACTS,
          deals: DEMO_DEALS,
          stats: {
            totalContacts: 156,
            activeDeals: 23,
            pipelineValue: 245000,
            wonThisMonth: 45000
          }
        }
      })
    }
  } catch (error) {
    logger.error('CRM API error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch CRM data' },
      { status: 500 }
    )
  }
}

async function getContacts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('crm_contacts')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }
  if (status) {
    query = query.eq('lead_status', status)
  }
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
  }

  const { data: contacts, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          contacts: DEMO_CONTACTS,
          total: DEMO_CONTACTS.length,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      contacts: contacts || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getContact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const contactId = url.searchParams.get('id')

  if (!contactId) {
    return NextResponse.json(
      { success: false, error: 'Contact ID is required' },
      { status: 400 }
    )
  }

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .select(`
      *,
      activities:crm_activities(id, type, subject, status, due_date, created_at),
      deals:crm_deals(id, name, stage, value, probability, expected_close_date),
      notes:crm_notes(id, content, is_pinned, created_at)
    `)
    .eq('id', contactId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          contact: DEMO_CONTACTS[0],
          activities: [],
          deals: DEMO_DEALS.slice(0, 1),
          notes: []
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { contact }
  })
}

async function getLeads(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const status = url.searchParams.get('status')
  const temperature = url.searchParams.get('temperature')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('crm_leads')
    .select(`
      *,
      contact:crm_contacts(id, first_name, last_name, email, company)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }
  if (temperature) {
    query = query.eq('temperature', temperature)
  }

  const { data: leads, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          leads: [
            { id: 'lead-1', status: 'qualified', score: 85, temperature: 'hot', estimated_value: 15000 },
            { id: 'lead-2', status: 'contacted', score: 65, temperature: 'warm', estimated_value: 8000 },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      leads: leads || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getDeals(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const stage = url.searchParams.get('stage')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('crm_deals')
    .select(`
      *,
      contact:crm_contacts(id, first_name, last_name, email, company),
      products:crm_deal_products(id, name, quantity, unit_price, total)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('value', { ascending: false })
    .range(offset, offset + limit - 1)

  if (stage) {
    query = query.eq('stage', stage)
  }

  const { data: deals, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          deals: DEMO_DEALS,
          total: DEMO_DEALS.length,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate pipeline stats
  const pipelineValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
  const weightedValue = deals?.reduce((sum, deal) => sum + ((deal.value || 0) * (deal.probability || 0) / 100), 0) || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      deals: deals || [],
      total: count || 0,
      pipelineValue,
      weightedValue,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getActivities(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')
  const contactId = url.searchParams.get('contactId')
  const dealId = url.searchParams.get('dealId')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('crm_activities')
    .select(`
      *,
      contact:crm_contacts(id, first_name, last_name, email),
      deal:crm_deals(id, name, stage)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (contactId) {
    query = query.eq('contact_id', contactId)
  }
  if (dealId) {
    query = query.eq('deal_id', dealId)
  }

  const { data: activities, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          activities: [
            { id: 'act-1', type: 'call', subject: 'Follow-up call', status: 'pending', due_date: new Date().toISOString() },
            { id: 'act-2', type: 'email', subject: 'Send proposal', status: 'completed', due_date: new Date().toISOString() },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      activities: activities || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getCRMStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get contact counts by type
  const { data: contactsByType } = await supabase
    .from('crm_contacts')
    .select('type')
    .eq('user_id', userId)

  // Get deals by stage
  const { data: dealsByStage } = await supabase
    .from('crm_deals')
    .select('stage, value, probability')
    .eq('user_id', userId)

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from('crm_activities')
    .select('status')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Calculate stats
  const typeCount: Record<string, number> = {}
  contactsByType?.forEach(c => {
    typeCount[c.type] = (typeCount[c.type] || 0) + 1
  })

  const stageCount: Record<string, { count: number; value: number }> = {}
  let totalPipelineValue = 0
  let wonValue = 0

  dealsByStage?.forEach(d => {
    if (!stageCount[d.stage]) {
      stageCount[d.stage] = { count: 0, value: 0 }
    }
    stageCount[d.stage].count++
    stageCount[d.stage].value += d.value || 0
    totalPipelineValue += d.value || 0
    if (d.stage === 'closed-won') {
      wonValue += d.value || 0
    }
  })

  const completedActivities = recentActivities?.filter(a => a.status === 'completed').length || 0
  const pendingActivities = recentActivities?.filter(a => a.status === 'pending').length || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      contacts: {
        total: contactsByType?.length || 0,
        byType: typeCount
      },
      deals: {
        total: dealsByStage?.length || 0,
        byStage: stageCount,
        pipelineValue: totalPipelineValue,
        wonValue
      },
      activities: {
        completed: completedActivities,
        pending: pendingActivities,
        total: recentActivities?.length || 0
      }
    }
  })
}

async function getCRMOverview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get recent contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get active deals
  const { data: deals, error: dealsError } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('user_id', userId)
    .not('stage', 'in', '(closed-won,closed-lost)')
    .order('value', { ascending: false })
    .limit(5)

  // Get stats
  const { count: totalContacts } = await supabase
    .from('crm_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data: dealsForStats } = await supabase
    .from('crm_deals')
    .select('value, stage')
    .eq('user_id', userId)

  const activeDeals = dealsForStats?.filter(d => !['closed-won', 'closed-lost'].includes(d.stage)).length || 0
  const pipelineValue = dealsForStats?.filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0) || 0

  // Get won this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: wonDeals } = await supabase
    .from('crm_deals')
    .select('value')
    .eq('user_id', userId)
    .eq('stage', 'closed-won')
    .gte('actual_close_date', startOfMonth.toISOString().split('T')[0])

  const wonThisMonth = wonDeals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0

  if (contactsError || dealsError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          contacts: DEMO_CONTACTS,
          deals: DEMO_DEALS,
          stats: {
            totalContacts: 156,
            activeDeals: 23,
            pipelineValue: 245000,
            wonThisMonth: 45000
          }
        }
      })
    }
    throw contactsError || dealsError
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      contacts: contacts || [],
      deals: deals || [],
      stats: {
        totalContacts: totalContacts || 0,
        activeDeals,
        pipelineValue,
        wonThisMonth
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

    logger.info('CRM POST request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'create_contact':
          return await createContact(supabase, effectiveUserId, data, demoMode)
        case 'update_contact':
          return await updateContact(supabase, effectiveUserId, data, demoMode)
        case 'delete_contact':
          return await deleteContact(supabase, effectiveUserId, data, demoMode)
        case 'create_lead':
          return await createLead(supabase, effectiveUserId, data, demoMode)
        case 'update_lead':
          return await updateLead(supabase, effectiveUserId, data, demoMode)
        case 'convert_lead':
          return await convertLead(supabase, effectiveUserId, data, demoMode)
        case 'create_deal':
          return await createDeal(supabase, effectiveUserId, data, demoMode)
        case 'update_deal':
          return await updateDeal(supabase, effectiveUserId, data, demoMode)
        case 'update_deal_stage':
          return await updateDealStage(supabase, effectiveUserId, data, demoMode)
        case 'create_activity':
          return await createActivity(supabase, effectiveUserId, data, demoMode)
        case 'complete_activity':
          return await completeActivity(supabase, effectiveUserId, data, demoMode)
        case 'add_note':
          return await addNote(supabase, effectiveUserId, data, demoMode)
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
    logger.error('CRM POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process CRM request' },
      { status: 500 }
    )
  }
}

async function createContact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    firstName,
    first_name,
    lastName,
    last_name,
    email,
    phone,
    company,
    jobTitle,
    job_title,
    type = 'lead',
    leadSource,
    lead_source,
    tags = [],
    customFields,
    custom_fields
  } = data

  const contactData = {
    user_id: userId,
    first_name: firstName || first_name,
    last_name: lastName || last_name,
    email,
    phone: phone || null,
    company: company || null,
    job_title: jobTitle || job_title || null,
    type,
    lead_source: leadSource || lead_source || 'other',
    tags,
    custom_fields: customFields || custom_fields || {},
    assigned_to: userId
  }

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .insert(contactData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `contact-${Date.now()}`, ...contactData },
        message: 'Contact created (demo mode)'
      })
    }
    throw error
  }

  logger.info('Contact created', { contactId: contact.id })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: contact,
    message: 'Contact created successfully'
  })
}

async function updateContact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, contactId, contact_id, ...updateData } = data
  const actualId = id || contactId || contact_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Contact ID is required' },
      { status: 400 }
    )
  }

  // Convert camelCase to snake_case for common fields
  const dbData: Record<string, any> = {}
  if (updateData.firstName || updateData.first_name) dbData.first_name = updateData.firstName || updateData.first_name
  if (updateData.lastName || updateData.last_name) dbData.last_name = updateData.lastName || updateData.last_name
  if (updateData.email) dbData.email = updateData.email
  if (updateData.phone) dbData.phone = updateData.phone
  if (updateData.company) dbData.company = updateData.company
  if (updateData.jobTitle || updateData.job_title) dbData.job_title = updateData.jobTitle || updateData.job_title
  if (updateData.type) dbData.type = updateData.type
  if (updateData.leadStatus || updateData.lead_status) dbData.lead_status = updateData.leadStatus || updateData.lead_status
  if (updateData.leadScore || updateData.lead_score) dbData.lead_score = updateData.leadScore || updateData.lead_score
  if (updateData.tags) dbData.tags = updateData.tags
  if (updateData.customFields || updateData.custom_fields) dbData.custom_fields = updateData.customFields || updateData.custom_fields

  const { data: contact, error } = await supabase
    .from('crm_contacts')
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
        message: 'Contact updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: contact,
    message: 'Contact updated successfully'
  })
}

async function deleteContact(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, contactId, contact_id } = data
  const actualId = id || contactId || contact_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Contact ID is required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('crm_contacts')
    .delete()
    .eq('id', actualId)
    .eq('user_id', userId)

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, deleted: true },
        message: 'Contact deleted (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { id: actualId, deleted: true },
    message: 'Contact deleted successfully'
  })
}

async function createLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    contactId,
    contact_id,
    source = 'other',
    score = 50,
    temperature = 'warm',
    estimatedValue,
    estimated_value,
    estimatedCloseDate,
    estimated_close_date,
    priority = 'medium'
  } = data

  const actualContactId = contactId || contact_id

  if (!actualContactId) {
    return NextResponse.json(
      { success: false, error: 'Contact ID is required' },
      { status: 400 }
    )
  }

  const leadData = {
    contact_id: actualContactId,
    user_id: userId,
    source,
    score,
    temperature,
    estimated_value: estimatedValue || estimated_value || 0,
    estimated_close_date: estimatedCloseDate || estimated_close_date || null,
    priority,
    assigned_to: userId
  }

  const { data: lead, error } = await supabase
    .from('crm_leads')
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

  // Update contact type to lead
  await supabase
    .from('crm_contacts')
    .update({ type: 'lead' })
    .eq('id', actualContactId)

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
  if (updateData.status) dbData.status = updateData.status
  if (updateData.score !== undefined) dbData.score = updateData.score
  if (updateData.temperature) dbData.temperature = updateData.temperature
  if (updateData.priority) dbData.priority = updateData.priority
  if (updateData.estimatedValue || updateData.estimated_value) {
    dbData.estimated_value = updateData.estimatedValue || updateData.estimated_value
  }
  if (updateData.estimatedCloseDate || updateData.estimated_close_date) {
    dbData.estimated_close_date = updateData.estimatedCloseDate || updateData.estimated_close_date
  }
  if (updateData.notes) dbData.notes = updateData.notes

  const { data: lead, error } = await supabase
    .from('crm_leads')
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

async function convertLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, leadId, lead_id, dealName, deal_name, dealValue, deal_value } = data
  const actualId = id || leadId || lead_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Lead ID is required' },
      { status: 400 }
    )
  }

  // Get lead with contact info
  const { data: lead, error: leadError } = await supabase
    .from('crm_leads')
    .select(`
      *,
      contact:crm_contacts(id, first_name, last_name, company)
    `)
    .eq('id', actualId)
    .eq('user_id', userId)
    .single()

  if (leadError || !lead) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          lead: { id: actualId, status: 'won', converted: true },
          deal: { id: `deal-${Date.now()}`, name: dealName || deal_name, value: dealValue || deal_value }
        },
        message: 'Lead converted (demo mode)'
      })
    }
    throw leadError || new Error('Lead not found')
  }

  // Create deal from lead
  const dealData = {
    user_id: userId,
    contact_id: lead.contact_id,
    name: dealName || deal_name || `Deal with ${lead.contact?.company || 'Contact'}`,
    company_name: lead.contact?.company || `${lead.contact?.first_name} ${lead.contact?.last_name}`,
    stage: 'discovery',
    value: dealValue || deal_value || lead.estimated_value || 0,
    probability: 20,
    expected_close_date: lead.estimated_close_date,
    priority: lead.priority,
    assigned_to: userId
  }

  const { data: deal, error: dealError } = await supabase
    .from('crm_deals')
    .insert(dealData)
    .select()
    .single()

  if (dealError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          lead: { ...lead, status: 'won' },
          deal: { id: `deal-${Date.now()}`, ...dealData }
        },
        message: 'Lead converted (demo mode)'
      })
    }
    throw dealError
  }

  // Update lead status to won
  await supabase
    .from('crm_leads')
    .update({ status: 'won', converted_to_deal_id: deal.id })
    .eq('id', actualId)

  // Update contact type to customer
  await supabase
    .from('crm_contacts')
    .update({ type: 'customer' })
    .eq('id', lead.contact_id)

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { lead: { ...lead, status: 'won' }, deal },
    message: 'Lead converted to deal successfully'
  })
}

async function createDeal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    contactId,
    contact_id,
    name,
    companyName,
    company_name,
    value = 0,
    stage = 'discovery',
    probability = 20,
    expectedCloseDate,
    expected_close_date,
    priority = 'medium',
    description,
    tags = []
  } = data

  const actualContactId = contactId || contact_id

  if (!actualContactId || !name) {
    return NextResponse.json(
      { success: false, error: 'Contact ID and deal name are required' },
      { status: 400 }
    )
  }

  const dealData = {
    user_id: userId,
    contact_id: actualContactId,
    name,
    company_name: companyName || company_name || 'Unknown Company',
    value,
    stage,
    probability,
    expected_close_date: expectedCloseDate || expected_close_date || null,
    priority,
    description: description || null,
    tags,
    assigned_to: userId
  }

  const { data: deal, error } = await supabase
    .from('crm_deals')
    .insert(dealData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `deal-${Date.now()}`, ...dealData },
        message: 'Deal created (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: deal,
    message: 'Deal created successfully'
  })
}

async function updateDeal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, dealId, deal_id, ...updateData } = data
  const actualId = id || dealId || deal_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Deal ID is required' },
      { status: 400 }
    )
  }

  const dbData: Record<string, any> = {}
  if (updateData.name) dbData.name = updateData.name
  if (updateData.companyName || updateData.company_name) dbData.company_name = updateData.companyName || updateData.company_name
  if (updateData.value !== undefined) dbData.value = updateData.value
  if (updateData.stage) dbData.stage = updateData.stage
  if (updateData.probability !== undefined) dbData.probability = updateData.probability
  if (updateData.expectedCloseDate || updateData.expected_close_date) {
    dbData.expected_close_date = updateData.expectedCloseDate || updateData.expected_close_date
  }
  if (updateData.priority) dbData.priority = updateData.priority
  if (updateData.description !== undefined) dbData.description = updateData.description
  if (updateData.tags) dbData.tags = updateData.tags

  const { data: deal, error } = await supabase
    .from('crm_deals')
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
        message: 'Deal updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: deal,
    message: 'Deal updated successfully'
  })
}

async function updateDealStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, dealId, deal_id, stage, wonReason, won_reason, lostReason, lost_reason } = data
  const actualId = id || dealId || deal_id

  if (!actualId || !stage) {
    return NextResponse.json(
      { success: false, error: 'Deal ID and stage are required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, any> = { stage }

  if (stage === 'closed-won') {
    updateData.won_reason = wonReason || won_reason || null
  } else if (stage === 'closed-lost') {
    updateData.lost_reason = lostReason || lost_reason || null
  }

  // Update probability based on stage
  const stageProbability: Record<string, number> = {
    'discovery': 20,
    'qualification': 40,
    'proposal': 60,
    'negotiation': 80,
    'closed-won': 100,
    'closed-lost': 0
  }
  updateData.probability = stageProbability[stage] || updateData.probability

  const { data: deal, error } = await supabase
    .from('crm_deals')
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
        message: 'Deal stage updated (demo mode)'
      })
    }
    throw error
  }

  // Update contact revenue if won
  if (stage === 'closed-won' && deal.contact_id) {
    await supabase.rpc('increment', {
      table_name: 'crm_contacts',
      row_id: deal.contact_id,
      column_name: 'total_revenue',
      amount: deal.value
    }).catch(() => {
      // Fallback if RPC doesn't exist
      supabase
        .from('crm_contacts')
        .update({ total_deals: supabase.sql`total_deals + 1` })
        .eq('id', deal.contact_id)
    })
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: deal,
    message: `Deal moved to ${stage}`
  })
}

async function createActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    type,
    subject,
    description,
    contactId,
    contact_id,
    dealId,
    deal_id,
    dueDate,
    due_date,
    priority = 'medium'
  } = data

  if (!type || !subject) {
    return NextResponse.json(
      { success: false, error: 'Activity type and subject are required' },
      { status: 400 }
    )
  }

  const activityData = {
    user_id: userId,
    type,
    subject,
    description: description || null,
    contact_id: contactId || contact_id || null,
    deal_id: dealId || deal_id || null,
    due_date: dueDate || due_date || null,
    priority,
    status: 'pending',
    assigned_to: userId
  }

  const { data: activity, error } = await supabase
    .from('crm_activities')
    .insert(activityData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `activity-${Date.now()}`, ...activityData },
        message: 'Activity created (demo mode)'
      })
    }
    throw error
  }

  // Update last_contacted_at on contact if applicable
  if (activityData.contact_id && ['call', 'email', 'meeting'].includes(type)) {
    await supabase
      .from('crm_contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', activityData.contact_id)
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: activity,
    message: 'Activity created successfully'
  })
}

async function completeActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, activityId, activity_id, outcome, duration } = data
  const actualId = id || activityId || activity_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Activity ID is required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, any> = {
    status: 'completed',
    completed_at: new Date().toISOString()
  }

  if (outcome) updateData.outcome = outcome
  if (duration) updateData.duration = duration

  const { data: activity, error } = await supabase
    .from('crm_activities')
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
        message: 'Activity completed (demo mode)'
      })
    }
    throw error
  }

  // Increment total_interactions on contact
  if (activity.contact_id) {
    await supabase
      .from('crm_contacts')
      .update({
        total_interactions: supabase.sql`total_interactions + 1`,
        last_contacted_at: new Date().toISOString()
      })
      .eq('id', activity.contact_id)
      .catch(() => {})
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: activity,
    message: 'Activity completed successfully'
  })
}

async function addNote(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    content,
    contactId,
    contact_id,
    dealId,
    deal_id,
    isPinned,
    is_pinned,
    attachments = []
  } = data

  if (!content) {
    return NextResponse.json(
      { success: false, error: 'Note content is required' },
      { status: 400 }
    )
  }

  const noteData = {
    user_id: userId,
    content,
    contact_id: contactId || contact_id || null,
    deal_id: dealId || deal_id || null,
    is_pinned: isPinned || is_pinned || false,
    attachments
  }

  const { data: note, error } = await supabase
    .from('crm_notes')
    .insert(noteData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `note-${Date.now()}`, ...noteData },
        message: 'Note added (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: note,
    message: 'Note added successfully'
  })
}
