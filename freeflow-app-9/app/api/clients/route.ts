/**
 * KAZI Platform - Comprehensive Clients API
 *
 * Full-featured client relationship management with database integration.
 * Supports CRUD operations, status management, analytics, notes,
 * contacts, and interaction tracking.
 *
 * @module app/api/clients/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac/rbac-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('clients-api')

// ============================================================================
// TYPES
// ============================================================================

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  timezone: string
  status: 'vip' | 'active' | 'lead' | 'inactive' | 'prospect' | 'churned'
  type: 'individual' | 'business' | 'enterprise'
  industry: string
  website: string
  notes: string
  tags: string[]
  avatar_url: string
  user_id: string
  assigned_to: string
  source: string
  last_contact: string
  next_follow_up: string
  total_projects: number
  total_revenue: number
  lifetime_value: number
  rating: number
  payment_terms: string
  currency: string
  tax_id: string
  metadata: Record<string, unknown>
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface ClientContact {
  id: string
  client_id: string
  name: string
  email: string
  phone: string
  role: string
  is_primary: boolean
  notes: string
  created_at: string
}

interface ClientInteraction {
  id: string
  client_id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'other'
  subject: string
  description: string
  user_id: string
  scheduled_at: string
  completed_at: string
  created_at: string
}

interface ClientStats {
  total_projects: number
  active_projects: number
  completed_projects: number
  total_invoices: number
  paid_invoices: number
  pending_invoices: number
  total_revenue: number
  outstanding_amount: number
  average_project_value: number
  total_files: number
  total_messages: number
  last_activity: string
}

// ============================================================================
// GET - List Clients / Get Single Client
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const clientId = searchParams.get('id')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')
    const assignedTo = searchParams.get('assigned_to')
    const sortBy = searchParams.get('sort_by') || 'updated_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const includeStats = searchParams.get('include_stats') === 'true'
    const includeContacts = searchParams.get('include_contacts') === 'true'
    const includeInteractions = searchParams.get('include_interactions') === 'true'

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        clients: getDemoClients(),
        pagination: {
          page: 1,
          limit: 20,
          total: 6,
          totalPages: 1
        }
      })
    }

    const userId = session.user.id

    // Single client fetch
    if (clientId) {
      // Check permission
      const canRead = await checkPermission(userId, 'clients', 'read', clientId)
      if (!canRead) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }

      const { data: client, error } = await supabase
        .from('clients')
        .select(`
          *,
          assigned_user:users!clients_assigned_to_fkey(id, name, email, avatar_url)
        `)
        .eq('id', clientId)
        .single()

      if (error || !client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }

      // Get additional data if requested
      let stats: ClientStats | null = null
      let contacts: ClientContact[] = []
      let interactions: ClientInteraction[] = []

      if (includeStats) {
        stats = await getClientStats(supabase, clientId)
      }

      if (includeContacts) {
        const { data: contactData } = await supabase
          .from('client_contacts')
          .select('*')
          .eq('client_id', clientId)
          .order('is_primary', { ascending: false })

        contacts = contactData || []
      }

      if (includeInteractions) {
        const { data: interactionData } = await supabase
          .from('client_interactions')
          .select(`
            *,
            user:users(id, name, avatar_url)
          `)
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(20)

        interactions = interactionData || []
      }

      return NextResponse.json({
        success: true,
        client: {
          ...client,
          stats,
          contacts,
          recent_interactions: interactions
        }
      })
    }

    // Build query for client list
    let query = supabase
      .from('clients')
      .select(`
        *,
        assigned_user:users!clients_assigned_to_fkey(id, name, avatar_url)
      `, { count: 'exact' })

    // Filter by user access
    query = query.eq('user_id', userId)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (industry) {
      query = query.eq('industry', industry)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: clients, error, count } = await query

    if (error) {
      logger.error('Clients query error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // Get stats for each client if requested
    let clientsWithStats = clients || []
    if (includeStats && clients?.length) {
      clientsWithStats = await Promise.all(
        clients.map(async (client) => ({
          ...client,
          stats: await getClientStats(supabase, client.id)
        }))
      )
    }

    // Get aggregate stats
    const aggregateStats = await getAggregateClientStats(supabase, userId)

    return NextResponse.json({
      success: true,
      clients: clientsWithStats,
      aggregate_stats: aggregateStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Clients GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Client / Handle Actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = session.user.id
    const body = await request.json()
    const { action = 'create' } = body

    // Handle different actions
    switch (action) {
      case 'create':
        return handleCreateClient(supabase, userId, body)

      case 'add_contact':
        return handleAddContact(supabase, userId, body)

      case 'log_interaction':
        return handleLogInteraction(supabase, userId, body)

      case 'bulk_update':
        return handleBulkUpdate(supabase, userId, body)

      case 'bulk_delete':
        return handleBulkDelete(supabase, userId, body)

      case 'import':
        return handleImportClients(supabase, userId, body)

      case 'export':
        return handleExportClients(supabase, userId, body)

      default:
        return handleCreateClient(supabase, userId, body)
    }
  } catch (error) {
    logger.error('Clients POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Client
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canUpdate = await checkPermission(userId, 'clients', 'update', id)
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'name', 'company', 'email', 'phone', 'location', 'address',
      'city', 'state', 'country', 'postal_code', 'timezone',
      'status', 'type', 'industry', 'website', 'notes', 'tags',
      'avatar_url', 'assigned_to', 'source', 'next_follow_up',
      'rating', 'payment_terms', 'currency', 'tax_id',
      'metadata', 'settings'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Update last_contact if interaction-related update
    if (updates.log_contact) {
      updateData.last_contact = new Date().toISOString()
    }

    // Update client
    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Client update error', { error })
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      )
    }

    // Log activity
    await logClientActivity(supabase, id, userId, 'updated', {
      fields_updated: Object.keys(updateData).filter(k => k !== 'updated_at')
    })

    return NextResponse.json({
      success: true,
      client,
      message: 'Client updated successfully'
    })
  } catch (error) {
    logger.error('Clients PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Client
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canDelete = await checkPermission(userId, 'clients', 'delete', clientId)
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Get client info for logging
    const { data: client } = await supabase
      .from('clients')
      .select('name, company')
      .eq('id', clientId)
      .single()

    if (permanent) {
      // Permanent delete
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        logger.error('Client deletion error', { error })
        return NextResponse.json(
          { error: 'Failed to delete client' },
          { status: 500 }
        )
      }
    } else {
      // Soft delete - mark as churned
      const { error } = await supabase
        .from('clients')
        .update({
          status: 'churned',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)

      if (error) {
        logger.error('Client archive error', { error })
        return NextResponse.json(
          { error: 'Failed to archive client' },
          { status: 500 }
        )
      }
    }

    // Log activity
    await logClientActivity(supabase, clientId, userId, permanent ? 'deleted' : 'archived', {
      client_name: client?.name,
      company: client?.company
    })

    return NextResponse.json({
      success: true,
      message: permanent ? 'Client deleted permanently' : 'Client archived successfully'
    })
  } catch (error) {
    logger.error('Clients DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateClient(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  // Check permission
  const canCreate = await checkPermission(userId, 'clients', 'create')
  if (!canCreate) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  const {
    name,
    company,
    email,
    phone,
    location,
    address,
    city,
    state,
    country,
    postal_code,
    timezone,
    status = 'lead',
    type = 'individual',
    industry,
    website,
    notes,
    tags = [],
    avatar_url,
    assigned_to,
    source = 'manual',
    next_follow_up,
    payment_terms = 'net30',
    currency = 'USD',
    tax_id,
    metadata = {},
    settings = {},
    contacts = []
  } = body

  // Validation
  if (!name || (typeof name === 'string' && name.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Client name is required' },
      { status: 400 }
    )
  }

  // Check for duplicate email
  if (email) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 400 }
      )
    }
  }

  // Create client
  const clientData = {
    name: typeof name === 'string' ? name.trim() : name,
    company: company || '',
    email: email || '',
    phone: phone || '',
    location: location || '',
    address: address || '',
    city: city || '',
    state: state || '',
    country: country || '',
    postal_code: postal_code || '',
    timezone: timezone || 'UTC',
    status,
    type,
    industry: industry || '',
    website: website || '',
    notes: notes || '',
    tags: tags || [],
    avatar_url: avatar_url || null,
    user_id: userId,
    assigned_to: assigned_to || userId,
    source,
    last_contact: new Date().toISOString(),
    next_follow_up: next_follow_up || null,
    total_projects: 0,
    total_revenue: 0,
    lifetime_value: 0,
    rating: 0,
    payment_terms,
    currency,
    tax_id: tax_id || '',
    metadata: metadata || {},
    settings: settings || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single()

  if (error) {
    logger.error('Client creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }

  // Add contacts if provided
  if (Array.isArray(contacts) && contacts.length > 0) {
    const contactRecords = contacts.map((contact: Record<string, unknown>, index: number) => ({
      client_id: client.id,
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      is_primary: index === 0,
      notes: contact.notes || '',
      created_at: new Date().toISOString()
    }))

    await supabase.from('client_contacts').insert(contactRecords)
  }

  // Log activity
  await logClientActivity(supabase, client.id, userId, 'created', {
    client_name: client.name,
    source
  })

  return NextResponse.json({
    success: true,
    client,
    message: 'Client created successfully'
  }, { status: 201 })
}

async function handleAddContact(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { client_id, name, email, phone, role, is_primary, notes } = body

  if (!client_id || !name) {
    return NextResponse.json(
      { error: 'Client ID and contact name are required' },
      { status: 400 }
    )
  }

  // Check permission
  const canUpdate = await checkPermission(userId, 'clients', 'update', client_id as string)
  if (!canUpdate) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  // If setting as primary, unset other primary contacts
  if (is_primary) {
    await supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', client_id)
  }

  const { data: contact, error } = await supabase
    .from('client_contacts')
    .insert({
      client_id,
      name,
      email: email || '',
      phone: phone || '',
      role: role || '',
      is_primary: is_primary || false,
      notes: notes || '',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Contact creation error', { error })
    return NextResponse.json(
      { error: 'Failed to add contact' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    contact,
    message: 'Contact added successfully'
  })
}

async function handleLogInteraction(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { client_id, type = 'note', subject, description, scheduled_at, completed_at } = body

  if (!client_id) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    )
  }

  // Check permission
  const canUpdate = await checkPermission(userId, 'clients', 'update', client_id as string)
  if (!canUpdate) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  const { data: interaction, error } = await supabase
    .from('client_interactions')
    .insert({
      client_id,
      type,
      subject: subject || '',
      description: description || '',
      user_id: userId,
      scheduled_at: scheduled_at || null,
      completed_at: completed_at || new Date().toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Interaction logging error', { error })
    return NextResponse.json(
      { error: 'Failed to log interaction' },
      { status: 500 }
    )
  }

  // Update last_contact on client
  await supabase
    .from('clients')
    .update({
      last_contact: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', client_id)

  return NextResponse.json({
    success: true,
    interaction,
    message: 'Interaction logged successfully'
  })
}

async function handleBulkUpdate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { client_ids, updates } = body

  if (!Array.isArray(client_ids) || client_ids.length === 0) {
    return NextResponse.json(
      { error: 'Client IDs are required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  const allowedBulkFields = ['status', 'assigned_to', 'tags']
  for (const field of allowedBulkFields) {
    if ((updates as Record<string, unknown>)?.[field] !== undefined) {
      updateData[field] = (updates as Record<string, unknown>)[field]
    }
  }

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .in('id', client_ids)
    .eq('user_id', userId)

  if (error) {
    logger.error('Bulk update error', { error })
    return NextResponse.json(
      { error: 'Failed to update clients' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    updated_count: client_ids.length,
    message: `${client_ids.length} clients updated successfully`
  })
}

async function handleBulkDelete(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { client_ids, permanent = false } = body

  if (!Array.isArray(client_ids) || client_ids.length === 0) {
    return NextResponse.json(
      { error: 'Client IDs are required' },
      { status: 400 }
    )
  }

  if (permanent) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .in('id', client_ids)
      .eq('user_id', userId)

    if (error) {
      logger.error('Bulk delete error', { error })
      return NextResponse.json(
        { error: 'Failed to delete clients' },
        { status: 500 }
      )
    }
  } else {
    const { error } = await supabase
      .from('clients')
      .update({
        status: 'churned',
        updated_at: new Date().toISOString()
      })
      .in('id', client_ids)
      .eq('user_id', userId)

    if (error) {
      logger.error('Bulk archive error', { error })
      return NextResponse.json(
        { error: 'Failed to archive clients' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    deleted_count: client_ids.length,
    message: `${client_ids.length} clients ${permanent ? 'deleted' : 'archived'} successfully`
  })
}

async function handleImportClients(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { clients, skip_duplicates = true } = body

  if (!Array.isArray(clients) || clients.length === 0) {
    return NextResponse.json(
      { error: 'Client data is required' },
      { status: 400 }
    )
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const clientData of clients) {
    try {
      // Check for duplicates
      if (skip_duplicates && clientData.email) {
        const { data: existing } = await supabase
          .from('clients')
          .select('id')
          .eq('email', clientData.email)
          .eq('user_id', userId)
          .single()

        if (existing) {
          skipped++
          continue
        }
      }

      await supabase.from('clients').insert({
        ...clientData,
        user_id: userId,
        status: clientData.status || 'lead',
        type: clientData.type || 'individual',
        source: 'import',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      imported++
    } catch (err) {
      errors.push(`Failed to import ${clientData.name || 'unknown'}: ${err}`)
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
    message: `Imported ${imported} clients, skipped ${skipped} duplicates`
  })
}

async function handleExportClients(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { format = 'json', client_ids, include_contacts = false } = body

  let query = supabase
    .from('clients')
    .select(include_contacts ? '*, contacts:client_contacts(*)' : '*')
    .eq('user_id', userId)

  if (Array.isArray(client_ids) && client_ids.length > 0) {
    query = query.in('id', client_ids)
  }

  const { data: clients, error } = await query

  if (error) {
    logger.error('Export error', { error })
    return NextResponse.json(
      { error: 'Failed to export clients' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    format,
    count: clients?.length || 0,
    data: clients
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getClientStats(
  supabase: ReturnType<typeof createClient>,
  clientId: string
): Promise<ClientStats> {
  try {
    // Get project counts
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'active')

    const { count: completedProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'completed')

    // Get invoice counts and amounts
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, status, total')
      .eq('client_id', clientId)

    const totalInvoices = invoices?.length || 0
    const paidInvoices = invoices?.filter(i => i.status === 'paid').length || 0
    const pendingInvoices = invoices?.filter(i => ['pending', 'sent'].includes(i.status)).length || 0
    const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0) || 0
    const outstandingAmount = invoices?.filter(i => ['pending', 'sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + (i.total || 0), 0) || 0

    // Get file count
    const { count: totalFiles } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    // Get message count
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    // Get last activity
    const { data: lastActivity } = await supabase
      .from('client_interactions')
      .select('created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      total_projects: totalProjects || 0,
      active_projects: activeProjects || 0,
      completed_projects: completedProjects || 0,
      total_invoices: totalInvoices,
      paid_invoices: paidInvoices,
      pending_invoices: pendingInvoices,
      total_revenue: totalRevenue,
      outstanding_amount: outstandingAmount,
      average_project_value: totalProjects ? totalRevenue / totalProjects : 0,
      total_files: totalFiles || 0,
      total_messages: totalMessages || 0,
      last_activity: lastActivity?.created_at || ''
    }
  } catch (error) {
    logger.error('Error getting client stats', { error })
    return {
      total_projects: 0,
      active_projects: 0,
      completed_projects: 0,
      total_invoices: 0,
      paid_invoices: 0,
      pending_invoices: 0,
      total_revenue: 0,
      outstanding_amount: 0,
      average_project_value: 0,
      total_files: 0,
      total_messages: 0,
      last_activity: ''
    }
  }
}

async function getAggregateClientStats(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  try {
    const { count: total } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: vip } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'vip')

    const { count: active } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    const { count: leads } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'lead')

    const { count: prospects } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'prospect')

    const { count: inactive } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'inactive')

    return {
      total: total || 0,
      by_status: {
        vip: vip || 0,
        active: active || 0,
        lead: leads || 0,
        prospect: prospects || 0,
        inactive: inactive || 0
      }
    }
  } catch (error) {
    logger.error('Error getting aggregate stats', { error })
    return {
      total: 0,
      by_status: { vip: 0, active: 0, lead: 0, prospect: 0, inactive: 0 }
    }
  }
}

async function logClientActivity(
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  userId: string,
  action: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('activity_log').insert({
      entity_type: 'client',
      entity_id: clientId,
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error logging client activity', { error })
  }
}

function getDemoClients(): Partial<Client>[] {
  return [
    {
      id: 'demo-1',
      name: 'John Smith',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      phone: '+1 555-0101',
      status: 'vip',
      type: 'enterprise',
      industry: 'Technology',
      total_revenue: 125000,
      rating: 5,
      tags: ['enterprise', 'technology'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      name: 'Sarah Johnson',
      company: 'Design Studio',
      email: 'sarah@designstudio.com',
      phone: '+1 555-0102',
      status: 'active',
      type: 'business',
      industry: 'Design',
      total_revenue: 45000,
      rating: 4,
      tags: ['design', 'creative'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      name: 'Michael Chen',
      company: 'StartupXYZ',
      email: 'michael@startupxyz.com',
      phone: '+1 555-0103',
      status: 'active',
      type: 'business',
      industry: 'Startup',
      total_revenue: 28000,
      rating: 4,
      tags: ['startup', 'tech'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-4',
      name: 'Emma Wilson',
      company: 'Marketing Plus',
      email: 'emma@marketingplus.com',
      phone: '+1 555-0104',
      status: 'lead',
      type: 'business',
      industry: 'Marketing',
      total_revenue: 0,
      rating: 0,
      tags: ['marketing', 'potential'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-5',
      name: 'David Brown',
      company: 'Freelance',
      email: 'david@email.com',
      phone: '+1 555-0105',
      status: 'prospect',
      type: 'individual',
      industry: 'Consulting',
      total_revenue: 0,
      rating: 0,
      tags: ['individual', 'consulting'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-6',
      name: 'Lisa Anderson',
      company: 'Global Media',
      email: 'lisa@globalmedia.com',
      phone: '+1 555-0106',
      status: 'inactive',
      type: 'enterprise',
      industry: 'Media',
      total_revenue: 75000,
      rating: 3,
      tags: ['media', 'past-client'],
      created_at: new Date().toISOString()
    }
  ]
}
