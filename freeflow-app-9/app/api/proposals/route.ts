/**
 * KAZI Platform - Proposals API
 *
 * Full-featured proposal management with database integration.
 * Supports CRUD operations, status tracking, versioning, and analytics.
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('proposals-api')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Types
type ProposalStatus = 'draft' | 'pending' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'

interface ProposalItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface Proposal {
  id: string
  user_id: string
  client_id?: string
  client_name: string
  client_email: string
  client_company?: string
  title: string
  description: string
  items: ProposalItem[]
  subtotal: number
  discount_percent?: number
  discount_amount?: number
  tax_percent?: number
  tax_amount?: number
  total: number
  currency: string
  valid_until: string
  status: ProposalStatus
  sent_at?: string
  viewed_at?: string
  accepted_at?: string
  rejected_at?: string
  rejection_reason?: string
  terms_conditions?: string
  notes?: string
  attachments?: string[]
  version: number
  parent_proposal_id?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================================
// GET - List Proposals / Get Single Proposal
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoMode = isDemoMode(request)

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const proposalId = searchParams.get('id')
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get single proposal
    if (proposalId) {
      const { data: proposal, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .eq('user_id', effectiveUserId)
        .single()

      if (error || !proposal) {
        return NextResponse.json(
          { success: false, error: 'Proposal not found' },
          { status: 404 }
        )
      }

      // Get proposal history/versions
      const { data: versions } = await supabase
        .from('proposals')
        .select('id, version, status, created_at')
        .eq('parent_proposal_id', proposal.parent_proposal_id || proposal.id)
        .order('version', { ascending: false })

      return NextResponse.json({
        success: true,
        proposal,
        versions: versions || []
      })
    }

    // List proposals
    let query = supabase
      .from('proposals')
      .select('*', { count: 'exact' })
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%`)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: proposals, error, count } = await query

    if (error) {
      logger.error('Proposals query error', { error: error.message })

      // Fall back to demo data
      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          proposals: getDemoProposals(),
          stats: getDemoStats(),
          pagination: { page: 1, limit: 20, total: 5, totalPages: 1 }
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch proposals' },
        { status: 500 }
      )
    }

    // Calculate stats
    const { data: statsData } = await supabase
      .from('proposals')
      .select('status, total')
      .eq('user_id', effectiveUserId)

    const stats = calculateStats(statsData || [])

    return NextResponse.json({
      success: true,
      proposals: proposals || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Proposals GET error', { error })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Proposal / Handle Actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoMode = isDemoMode(request)

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action = 'create', ...data } = body

    switch (action) {
      case 'create':
        return handleCreateProposal(supabase, effectiveUserId, data)
      case 'send':
        return handleSendProposal(supabase, effectiveUserId, data)
      case 'duplicate':
        return handleDuplicateProposal(supabase, effectiveUserId, data)
      case 'create-revision':
        return handleCreateRevision(supabase, effectiveUserId, data)
      case 'accept':
        return handleAcceptProposal(supabase, effectiveUserId, data)
      case 'reject':
        return handleRejectProposal(supabase, effectiveUserId, data)
      case 'withdraw':
        return handleWithdrawProposal(supabase, effectiveUserId, data)
      case 'convert-to-invoice':
        return handleConvertToInvoice(supabase, effectiveUserId, data)
      default:
        return handleCreateProposal(supabase, effectiveUserId, body)
    }
  } catch (error) {
    logger.error('Proposals POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Proposal
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoMode = isDemoMode(request)

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership and get current status
    const { data: existing, error: fetchError } = await supabase
      .from('proposals')
      .select('status')
      .eq('id', id)
      .eq('user_id', effectiveUserId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Only allow updates to draft proposals
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Can only edit draft proposals. Create a revision instead.' },
        { status: 400 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'title', 'description', 'client_name', 'client_email', 'client_company',
      'items', 'subtotal', 'discount_percent', 'discount_amount',
      'tax_percent', 'tax_amount', 'total', 'currency', 'valid_until',
      'terms_conditions', 'notes', 'attachments', 'metadata'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Recalculate totals if items changed
    if (updates.items) {
      const { subtotal, total } = calculateProposalTotals(
        updates.items,
        updates.discount_percent || 0,
        updates.tax_percent || 0
      )
      updateData.subtotal = subtotal
      updateData.total = total
    }

    const { data: proposal, error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Proposal update error', { error: error.message })
      return NextResponse.json(
        { success: false, error: 'Failed to update proposal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Proposal updated successfully'
    })
  } catch (error) {
    logger.error('Proposals PUT error', { error })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Proposal
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const demoMode = isDemoMode(request)

    const effectiveUserId = user?.id || (demoMode ? DEMO_USER_ID : null)

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const proposalId = searchParams.get('id')

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership and check status
    const { data: existing, error: fetchError } = await supabase
      .from('proposals')
      .select('status')
      .eq('id', proposalId)
      .eq('user_id', effectiveUserId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of draft proposals
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'Can only delete draft proposals' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', proposalId)

    if (error) {
      logger.error('Proposal deletion error', { error: error.message })
      return NextResponse.json(
        { success: false, error: 'Failed to delete proposal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal deleted successfully'
    })
  } catch (error) {
    logger.error('Proposals DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: Record<string, unknown>
) {
  const {
    title,
    description,
    client_name,
    client_email,
    client_company,
    client_id,
    items = [],
    discount_percent = 0,
    tax_percent = 0,
    currency = 'USD',
    valid_until,
    terms_conditions,
    notes,
    attachments,
    metadata
  } = data

  // Validation
  if (!title || !client_name || !client_email) {
    return NextResponse.json(
      { success: false, error: 'Title, client name, and email are required' },
      { status: 400 }
    )
  }

  // Calculate totals
  const { subtotal, discountAmount, taxAmount, total } = calculateProposalTotals(
    items as ProposalItem[],
    discount_percent as number,
    tax_percent as number
  )

  // Set default validity (30 days)
  const validUntil = valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const proposalData = {
    user_id: userId,
    client_id: client_id || null,
    client_name,
    client_email,
    client_company: client_company || null,
    title,
    description: description || '',
    items: items || [],
    subtotal,
    discount_percent: discount_percent || 0,
    discount_amount: discountAmount,
    tax_percent: tax_percent || 0,
    tax_amount: taxAmount,
    total,
    currency,
    valid_until: validUntil,
    status: 'draft' as ProposalStatus,
    terms_conditions: terms_conditions || null,
    notes: notes || null,
    attachments: attachments || [],
    version: 1,
    parent_proposal_id: null,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert(proposalData)
    .select()
    .single()

  if (error) {
    logger.error('Proposal creation error', { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Failed to create proposal' },
      { status: 500 }
    )
  }

  logger.info('Proposal created', { proposalId: proposal.id })

  return NextResponse.json({
    success: true,
    proposal,
    message: 'Proposal created successfully'
  }, { status: 201 })
}

async function handleSendProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string; message?: string }
) {
  const { proposalId, message } = data

  if (!proposalId) {
    return NextResponse.json(
      { success: false, error: 'Proposal ID is required' },
      { status: 400 }
    )
  }

  // Get proposal
  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !proposal) {
    return NextResponse.json(
      { success: false, error: 'Proposal not found' },
      { status: 404 }
    )
  }

  if (proposal.status !== 'draft') {
    return NextResponse.json(
      { success: false, error: 'Proposal already sent' },
      { status: 400 }
    )
  }

  // Update status to sent
  const { data: updated, error } = await supabase
    .from('proposals')
    .update({
      status: 'sent' as ProposalStatus,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', proposalId)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to send proposal' },
      { status: 500 }
    )
  }

  // Send email notification to client
  const viewLink = `${process.env.NEXT_PUBLIC_APP_URL}/proposals/view/${proposalId}`

  if (proposal.client_email) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'proposal',
          data: {
            recipientEmail: proposal.client_email,
            recipientName: proposal.client_name || 'Client',
            proposalTitle: proposal.title,
            eventType: 'submitted',
            totalAmount: proposal.total,
            currency: proposal.currency || 'USD',
            validUntil: proposal.valid_until,
            actionUrl: viewLink,
            actionText: 'View Proposal',
            summary: proposal.description
          }
        })
      })
      logger.info('Proposal notification email sent', { proposalId, clientEmail: proposal.client_email })
    } catch (emailError) {
      logger.warn('Failed to send proposal notification email', { error: emailError, proposalId })
    }
  }

  logger.info('Proposal sent', {
    proposalId,
    clientEmail: proposal.client_email,
    total: proposal.total
  })

  return NextResponse.json({
    success: true,
    proposal: updated,
    message: `Proposal sent to ${proposal.client_email}`,
    viewLink: `${process.env.NEXT_PUBLIC_APP_URL}/proposals/view/${proposalId}`
  })
}

async function handleDuplicateProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string }
) {
  const { proposalId } = data

  // Get original proposal
  const { data: original, error: fetchError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !original) {
    return NextResponse.json(
      { success: false, error: 'Proposal not found' },
      { status: 404 }
    )
  }

  // Create duplicate
  const duplicateData = {
    ...original,
    id: undefined,
    title: `${original.title} (Copy)`,
    status: 'draft' as ProposalStatus,
    version: 1,
    parent_proposal_id: null,
    sent_at: null,
    viewed_at: null,
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  delete duplicateData.id

  const { data: duplicate, error } = await supabase
    .from('proposals')
    .insert(duplicateData)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate proposal' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    proposal: duplicate,
    message: 'Proposal duplicated successfully'
  })
}

async function handleCreateRevision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string; changes?: Record<string, unknown> }
) {
  const { proposalId, changes = {} } = data

  // Get original proposal
  const { data: original, error: fetchError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !original) {
    return NextResponse.json(
      { success: false, error: 'Proposal not found' },
      { status: 404 }
    )
  }

  // Create revision
  const parentId = original.parent_proposal_id || original.id
  const newVersion = original.version + 1

  const revisionData = {
    ...original,
    ...changes,
    id: undefined,
    version: newVersion,
    parent_proposal_id: parentId,
    status: 'draft' as ProposalStatus,
    sent_at: null,
    viewed_at: null,
    accepted_at: null,
    rejected_at: null,
    rejection_reason: null,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  delete revisionData.id

  const { data: revision, error } = await supabase
    .from('proposals')
    .insert(revisionData)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create revision' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    proposal: revision,
    message: `Revision v${newVersion} created`
  })
}

async function handleAcceptProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string; signature?: string }
) {
  const { proposalId, signature } = data

  const { data: proposal, error } = await supabase
    .from('proposals')
    .update({
      status: 'accepted' as ProposalStatus,
      accepted_at: new Date().toISOString(),
      metadata: { signature },
      updated_at: new Date().toISOString()
    })
    .eq('id', proposalId)
    .or(`user_id.eq.${userId},client_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to accept proposal' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    proposal,
    message: 'Proposal accepted!'
  })
}

async function handleRejectProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string; reason?: string }
) {
  const { proposalId, reason } = data

  const { data: proposal, error } = await supabase
    .from('proposals')
    .update({
      status: 'rejected' as ProposalStatus,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', proposalId)
    .or(`user_id.eq.${userId},client_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reject proposal' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    proposal,
    message: 'Proposal rejected'
  })
}

async function handleWithdrawProposal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string }
) {
  const { proposalId } = data

  const { data: proposal, error } = await supabase
    .from('proposals')
    .update({
      status: 'withdrawn' as ProposalStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', proposalId)
    .eq('user_id', userId)
    .in('status', ['draft', 'sent', 'pending', 'viewed'])
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to withdraw proposal' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    proposal,
    message: 'Proposal withdrawn'
  })
}

async function handleConvertToInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { proposalId: string; dueDate?: string }
) {
  const { proposalId, dueDate } = data

  // Get proposal
  const { data: proposal, error: fetchError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .single()

  if (fetchError || !proposal) {
    return NextResponse.json(
      { success: false, error: 'Accepted proposal not found' },
      { status: 404 }
    )
  }

  // Generate invoice number
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`

  // Create invoice from proposal
  const invoiceData = {
    user_id: userId,
    client_id: proposal.client_id,
    client_name: proposal.client_name,
    client_email: proposal.client_email,
    client_company: proposal.client_company,
    invoice_number: invoiceNumber,
    title: proposal.title,
    description: proposal.description,
    items: proposal.items,
    subtotal: proposal.subtotal,
    discount_percent: proposal.discount_percent,
    discount_amount: proposal.discount_amount,
    tax_percent: proposal.tax_percent,
    tax_amount: proposal.tax_amount,
    total: proposal.total,
    currency: proposal.currency,
    status: 'pending',
    due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    proposal_id: proposalId,
    terms_conditions: proposal.terms_conditions,
    notes: proposal.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    logger.error('Invoice creation from proposal failed', { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    invoice,
    message: `Invoice ${invoiceNumber} created from proposal`
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateProposalTotals(
  items: ProposalItem[],
  discountPercent: number,
  taxPercent: number
) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (taxPercent / 100)
  const total = afterDiscount + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

function calculateStats(proposals: Array<{ status: string; total: number }>) {
  const totalProposals = proposals.length
  const pendingProposals = proposals.filter(p => ['pending', 'sent', 'viewed'].includes(p.status)).length
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length
  const rejectedProposals = proposals.filter(p => p.status === 'rejected').length
  const totalValue = proposals.reduce((sum, p) => sum + (p.total || 0), 0)
  const acceptedValue = proposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + (p.total || 0), 0)
  const conversionRate = totalProposals > 0
    ? Math.round((acceptedProposals / totalProposals) * 100)
    : 0

  return {
    totalProposals,
    pendingProposals,
    acceptedProposals,
    rejectedProposals,
    draftProposals: proposals.filter(p => p.status === 'draft').length,
    totalValue: Math.round(totalValue * 100) / 100,
    acceptedValue: Math.round(acceptedValue * 100) / 100,
    conversionRate,
    acceptedThisMonth: proposals.filter(p => {
      if (p.status !== 'accepted') return false
      // Simplified - in production would check actual date
      return true
    }).length
  }
}

function getDemoProposals(): Partial<Proposal>[] {
  return [
    {
      id: 'demo-proposal-1',
      title: 'Website Redesign Proposal',
      client_name: 'Acme Corp',
      client_email: 'contact@acme.com',
      total: 15000,
      status: 'pending',
      sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      valid_until: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-proposal-2',
      title: 'Mobile App Development',
      client_name: 'TechStart Inc',
      client_email: 'projects@techstart.io',
      total: 45000,
      status: 'accepted',
      accepted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-proposal-3',
      title: 'Brand Identity Package',
      client_name: 'GreenCo',
      client_email: 'hello@greenco.com',
      total: 8000,
      status: 'draft',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-proposal-4',
      title: 'E-commerce Integration',
      client_name: 'RetailPlus',
      client_email: 'dev@retailplus.com',
      total: 22000,
      status: 'viewed',
      sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      viewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-proposal-5',
      title: 'SEO Optimization Service',
      client_name: 'LocalBiz',
      client_email: 'marketing@localbiz.com',
      total: 3500,
      status: 'rejected',
      rejection_reason: 'Budget constraints',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

function getDemoStats() {
  return {
    totalProposals: 25,
    pendingProposals: 8,
    acceptedProposals: 12,
    rejectedProposals: 3,
    draftProposals: 2,
    totalValue: 125000,
    acceptedValue: 85000,
    conversionRate: 48,
    acceptedThisMonth: 5
  }
}
