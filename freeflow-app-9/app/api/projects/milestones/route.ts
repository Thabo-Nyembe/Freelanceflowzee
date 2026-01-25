/**
 * KAZI Platform - Project Milestones API
 *
 * World-class milestone management:
 * - Milestone CRUD operations
 * - Payment tracking integration
 * - Deliverable management
 * - Progress tracking
 * - Client notifications
 * - Invoice generation triggers
 *
 * @module app/api/projects/milestones/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac/rbac-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('projects-milestones')

// ============================================================================
// TYPES
// ============================================================================

type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'cancelled'

interface Milestone {
  id: string
  project_id: string
  user_id: string
  name: string
  description: string
  status: MilestoneStatus
  position: number
  due_date: string | null
  completed_at: string | null
  approved_at: string | null
  approved_by: string | null
  deliverables: Deliverable[]
  payment_amount: number | null
  payment_percentage: number | null
  payment_status: 'pending' | 'invoiced' | 'paid' | 'partial'
  invoice_id: string | null
  requires_approval: boolean
  notification_sent: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface Deliverable {
  id: string
  name: string
  description: string
  type: 'file' | 'link' | 'text' | 'approval'
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  file_id?: string
  file_url?: string
  link_url?: string
  content?: string
  submitted_at?: string
  reviewed_at?: string
  reviewed_by?: string
  feedback?: string
}

// ============================================================================
// DATABASE CLIENT - Using server-side Supabase client
// ============================================================================

// ============================================================================
// GET - List Milestones / Get Single Milestone
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    const milestoneId = searchParams.get('id')
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming') === 'true'
    const overdue = searchParams.get('overdue') === 'true'
    const includeDeliverables = searchParams.get('include_deliverables') !== 'false'
    const includePaymentInfo = searchParams.get('include_payment') === 'true'

    const supabase = await createClient()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        milestones: getDemoMilestones(),
        stats: getDemoMilestoneStats()
      })
    }

    const userId = session.user.id

    // Single milestone fetch
    if (milestoneId) {
      const { data: milestone, error } = await supabase
        .from('milestones')
        .select(`
          *,
          project:projects(id, name, client_id),
          approved_by_user:users!milestones_approved_by_fkey(id, name, avatar_url)
        `)
        .eq('id', milestoneId)
        .single()

      if (error || !milestone) {
        return NextResponse.json(
          { error: 'Milestone not found' },
          { status: 404 }
        )
      }

      // Get linked tasks
      const { data: linkedTasks } = await supabase
        .from('tasks')
        .select('id, title, status, due_date')
        .eq('milestone_id', milestoneId)
        .order('position', { ascending: true })

      // Get payment info if requested
      let paymentInfo = null
      if (includePaymentInfo && milestone.invoice_id) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('id, status, amount, paid_amount, due_date')
          .eq('id', milestone.invoice_id)
          .single()

        paymentInfo = invoice
      }

      return NextResponse.json({
        success: true,
        milestone: {
          ...milestone,
          linked_tasks: linkedTasks || [],
          payment_info: paymentInfo
        }
      })
    }

    // Project milestones list
    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canRead = await checkPermission(userId, 'projects', 'read', projectId)
    if (!canRead) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Build query
    let query = supabase
      .from('milestones')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .neq('status', 'cancelled')
      .order('position', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    if (upcoming) {
      const now = new Date().toISOString()
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString()
      query = query
        .gte('due_date', now)
        .lte('due_date', nextWeek)
        .neq('status', 'completed')
    }

    if (overdue) {
      const now = new Date().toISOString()
      query = query
        .lt('due_date', now)
        .not('status', 'in', '("completed","approved","cancelled")')
    }

    const { data: milestones, error, count } = await query

    if (error) {
      logger.error('Milestones query error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch milestones' },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = calculateMilestoneStats(milestones || [])

    return NextResponse.json({
      success: true,
      milestones: milestones || [],
      stats,
      total: count || 0
    })
  } catch (error) {
    logger.error('Milestones GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Milestone / Handle Actions
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

    const userId = session.user.id
    const body = await request.json()
    const { action = 'create', project_id } = body

    if (!project_id && action !== 'bulk_update') {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check permission
    if (project_id) {
      const canUpdate = await checkPermission(userId, 'projects', 'update', project_id)
      if (!canUpdate) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    switch (action) {
      case 'create':
        return handleCreateMilestone(supabase, userId, body)

      case 'complete':
        return handleCompleteMilestone(supabase, userId, body)

      case 'approve':
        return handleApproveMilestone(supabase, userId, body)

      case 'reject':
        return handleRejectMilestone(supabase, userId, body)

      case 'submit_deliverable':
        return handleSubmitDeliverable(supabase, userId, body)

      case 'review_deliverable':
        return handleReviewDeliverable(supabase, userId, body)

      case 'link_tasks':
        return handleLinkTasks(supabase, userId, body)

      case 'generate_invoice':
        return handleGenerateInvoice(supabase, userId, body)

      case 'reorder':
        return handleReorderMilestones(supabase, userId, body)

      case 'duplicate':
        return handleDuplicateMilestone(supabase, userId, body)

      default:
        return handleCreateMilestone(supabase, userId, body)
    }
  } catch (error) {
    logger.error('Milestones POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Milestone
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

    const userId = session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get milestone and check permission
    const { data: milestone } = await supabase
      .from('milestones')
      .select('project_id')
      .eq('id', id)
      .single()

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    const canUpdate = await checkPermission(userId, 'projects', 'update', milestone.project_id)
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'name', 'description', 'status', 'position', 'due_date',
      'deliverables', 'payment_amount', 'payment_percentage',
      'requires_approval', 'metadata'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    const { data: updated, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Milestone update error', { error })
      return NextResponse.json(
        { error: 'Failed to update milestone' },
        { status: 500 }
      )
    }

    // Log activity
    await logMilestoneActivity(supabase, id, userId, 'updated', {
      fields_updated: Object.keys(updateData).filter(k => k !== 'updated_at')
    })

    return NextResponse.json({
      success: true,
      milestone: updated,
      message: 'Milestone updated successfully'
    })
  } catch (error) {
    logger.error('Milestones PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Milestone
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

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const milestoneId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get milestone and check permission
    const { data: milestone } = await supabase
      .from('milestones')
      .select('project_id, name')
      .eq('id', milestoneId)
      .single()

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    const canDelete = await checkPermission(userId, 'projects', 'delete', milestone.project_id)
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    if (permanent) {
      // Unlink tasks first
      await supabase
        .from('tasks')
        .update({ milestone_id: null })
        .eq('milestone_id', milestoneId)

      // Delete milestone
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) {
        throw error
      }
    } else {
      // Soft delete
      const { error } = await supabase
        .from('milestones')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)

      if (error) {
        throw error
      }
    }

    await logMilestoneActivity(supabase, milestoneId, userId, 'deleted', {
      permanent,
      milestone_name: milestone.name
    })

    return NextResponse.json({
      success: true,
      message: permanent ? 'Milestone deleted permanently' : 'Milestone cancelled'
    })
  } catch (error) {
    logger.error('Milestones DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateMilestone(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    project_id,
    name,
    description,
    due_date,
    position,
    deliverables = [],
    payment_amount,
    payment_percentage,
    requires_approval = true,
    metadata = {}
  } = body

  if (!name || (typeof name === 'string' && name.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Milestone name is required' },
      { status: 400 }
    )
  }

  // Get position if not provided
  let milestonePosition = position
  if (milestonePosition === undefined) {
    const { data: lastMilestone } = await supabase
      .from('milestones')
      .select('position')
      .eq('project_id', project_id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    milestonePosition = (lastMilestone?.position || 0) + 1
  }

  // Process deliverables
  const processedDeliverables = (deliverables as Deliverable[]).map((d, i) => ({
    id: d.id || `del-${Date.now()}-${i}`,
    name: d.name,
    description: d.description || '',
    type: d.type || 'approval',
    status: 'pending',
    ...d
  }))

  const milestoneData = {
    project_id,
    user_id: userId,
    name: typeof name === 'string' ? name.trim() : name,
    description: description || '',
    status: 'pending',
    position: milestonePosition,
    due_date: due_date || null,
    completed_at: null,
    approved_at: null,
    approved_by: null,
    deliverables: processedDeliverables,
    payment_amount: payment_amount || null,
    payment_percentage: payment_percentage || null,
    payment_status: 'pending',
    invoice_id: null,
    requires_approval,
    notification_sent: false,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: milestone, error } = await supabase
    .from('milestones')
    .insert(milestoneData)
    .select()
    .single()

  if (error) {
    logger.error('Milestone creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    )
  }

  await logMilestoneActivity(supabase, milestone.id, userId, 'created', {
    milestone_name: milestone.name,
    project_id
  })

  return NextResponse.json({
    success: true,
    milestone,
    message: 'Milestone created successfully'
  }, { status: 201 })
}

async function handleCompleteMilestone(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, completion_notes } = body

  if (!milestone_id) {
    return NextResponse.json(
      { error: 'milestone_id is required' },
      { status: 400 }
    )
  }

  // Get milestone
  const { data: milestone } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', milestone_id)
    .single()

  if (!milestone) {
    return NextResponse.json(
      { error: 'Milestone not found' },
      { status: 404 }
    )
  }

  // Check if all deliverables are submitted
  const pendingDeliverables = (milestone.deliverables || []).filter(
    (d: Deliverable) => d.status === 'pending'
  )

  if (pendingDeliverables.length > 0 && !body.force) {
    return NextResponse.json({
      success: false,
      error: 'All deliverables must be submitted before completing milestone',
      pending_deliverables: pendingDeliverables.map((d: Deliverable) => d.name)
    }, { status: 400 })
  }

  const newStatus = milestone.requires_approval ? 'in_progress' : 'completed'

  const { data: updated, error } = await supabase
    .from('milestones')
    .update({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      metadata: {
        ...milestone.metadata,
        completion_notes: completion_notes || null,
        completed_by: userId
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', milestone_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Notify client if requires approval
  if (milestone.requires_approval) {
    await notifyForApproval(supabase, milestone)
  }

  await logMilestoneActivity(supabase, milestone_id, userId, 'completed', {
    requires_approval: milestone.requires_approval
  })

  return NextResponse.json({
    success: true,
    milestone: updated,
    requires_approval: milestone.requires_approval,
    message: milestone.requires_approval
      ? 'Milestone submitted for approval'
      : 'Milestone completed'
  })
}

async function handleApproveMilestone(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, approval_notes } = body

  if (!milestone_id) {
    return NextResponse.json(
      { error: 'milestone_id is required' },
      { status: 400 }
    )
  }

  const { data: milestone, error } = await supabase
    .from('milestones')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId,
      metadata: {
        approval_notes: approval_notes || null
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', milestone_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Update project progress
  await updateProjectProgress(supabase, milestone.project_id)

  await logMilestoneActivity(supabase, milestone_id, userId, 'approved', {
    approval_notes
  })

  return NextResponse.json({
    success: true,
    milestone,
    message: 'Milestone approved'
  })
}

async function handleRejectMilestone(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, rejection_reason } = body

  if (!milestone_id) {
    return NextResponse.json(
      { error: 'milestone_id is required' },
      { status: 400 }
    )
  }

  if (!rejection_reason) {
    return NextResponse.json(
      { error: 'rejection_reason is required' },
      { status: 400 }
    )
  }

  const { data: milestone, error } = await supabase
    .from('milestones')
    .update({
      status: 'rejected',
      metadata: {
        rejection_reason,
        rejected_by: userId,
        rejected_at: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', milestone_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logMilestoneActivity(supabase, milestone_id, userId, 'rejected', {
    rejection_reason
  })

  return NextResponse.json({
    success: true,
    milestone,
    message: 'Milestone rejected'
  })
}

async function handleSubmitDeliverable(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, deliverable_id, submission } = body

  if (!milestone_id || !deliverable_id) {
    return NextResponse.json(
      { error: 'milestone_id and deliverable_id are required' },
      { status: 400 }
    )
  }

  // Get milestone
  const { data: milestone } = await supabase
    .from('milestones')
    .select('deliverables')
    .eq('id', milestone_id)
    .single()

  if (!milestone) {
    return NextResponse.json(
      { error: 'Milestone not found' },
      { status: 404 }
    )
  }

  // Update deliverable
  const deliverables = (milestone.deliverables || []).map((d: Deliverable) => {
    if (d.id === deliverable_id) {
      return {
        ...d,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        ...(submission as Record<string, unknown>)
      }
    }
    return d
  })

  const { data: updated, error } = await supabase
    .from('milestones')
    .update({
      deliverables,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestone_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    milestone: updated,
    message: 'Deliverable submitted'
  })
}

async function handleReviewDeliverable(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, deliverable_id, status, feedback } = body

  if (!milestone_id || !deliverable_id || !status) {
    return NextResponse.json(
      { error: 'milestone_id, deliverable_id, and status are required' },
      { status: 400 }
    )
  }

  // Get milestone
  const { data: milestone } = await supabase
    .from('milestones')
    .select('deliverables')
    .eq('id', milestone_id)
    .single()

  if (!milestone) {
    return NextResponse.json(
      { error: 'Milestone not found' },
      { status: 404 }
    )
  }

  // Update deliverable
  const deliverables = (milestone.deliverables || []).map((d: Deliverable) => {
    if (d.id === deliverable_id) {
      return {
        ...d,
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        feedback: feedback || null
      }
    }
    return d
  })

  const { data: updated, error } = await supabase
    .from('milestones')
    .update({
      deliverables,
      updated_at: new Date().toISOString()
    })
    .eq('id', milestone_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    milestone: updated,
    message: `Deliverable ${status}`
  })
}

async function handleLinkTasks(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, task_ids } = body

  if (!milestone_id || !Array.isArray(task_ids)) {
    return NextResponse.json(
      { error: 'milestone_id and task_ids array are required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      milestone_id,
      updated_at: new Date().toISOString()
    })
    .in('id', task_ids)

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    linked_count: task_ids.length,
    message: `${task_ids.length} tasks linked to milestone`
  })
}

async function handleGenerateInvoice(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id } = body

  if (!milestone_id) {
    return NextResponse.json(
      { error: 'milestone_id is required' },
      { status: 400 }
    )
  }

  // Get milestone with project info
  const { data: milestone } = await supabase
    .from('milestones')
    .select(`
      *,
      project:projects(id, name, client_id, budget, currency)
    `)
    .eq('id', milestone_id)
    .single()

  if (!milestone) {
    return NextResponse.json(
      { error: 'Milestone not found' },
      { status: 404 }
    )
  }

  if (!milestone.project.client_id) {
    return NextResponse.json(
      { error: 'Project has no client assigned' },
      { status: 400 }
    )
  }

  // Calculate amount
  let amount = milestone.payment_amount
  if (!amount && milestone.payment_percentage && milestone.project.budget) {
    amount = (milestone.payment_percentage / 100) * milestone.project.budget
  }

  if (!amount) {
    return NextResponse.json(
      { error: 'No payment amount specified' },
      { status: 400 }
    )
  }

  // Create invoice
  const invoiceData = {
    user_id: userId,
    client_id: milestone.project.client_id,
    project_id: milestone.project.id,
    milestone_id,
    status: 'draft',
    currency: milestone.project.currency || 'USD',
    subtotal: amount,
    tax: 0,
    discount: 0,
    total: amount,
    line_items: [{
      description: `Milestone: ${milestone.name}`,
      quantity: 1,
      unit_price: amount,
      amount
    }],
    notes: `Invoice for milestone: ${milestone.name}`,
    created_at: new Date().toISOString()
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    logger.error('Invoice creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }

  // Update milestone with invoice reference
  await supabase
    .from('milestones')
    .update({
      invoice_id: invoice.id,
      payment_status: 'invoiced',
      updated_at: new Date().toISOString()
    })
    .eq('id', milestone_id)

  return NextResponse.json({
    success: true,
    invoice,
    message: 'Invoice generated'
  }, { status: 201 })
}

async function handleReorderMilestones(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_orders } = body

  if (!Array.isArray(milestone_orders)) {
    return NextResponse.json(
      { error: 'milestone_orders array is required' },
      { status: 400 }
    )
  }

  for (const order of milestone_orders) {
    await supabase
      .from('milestones')
      .update({
        position: order.position,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
  }

  return NextResponse.json({
    success: true,
    message: 'Milestones reordered'
  })
}

async function handleDuplicateMilestone(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { milestone_id, project_id } = body

  if (!milestone_id) {
    return NextResponse.json(
      { error: 'milestone_id is required' },
      { status: 400 }
    )
  }

  const { data: original } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', milestone_id)
    .single()

  if (!original) {
    return NextResponse.json(
      { error: 'Milestone not found' },
      { status: 404 }
    )
  }

  // Reset deliverable statuses
  const deliverables = (original.deliverables || []).map((d: Deliverable) => ({
    ...d,
    id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    submitted_at: undefined,
    reviewed_at: undefined,
    reviewed_by: undefined,
    feedback: undefined
  }))

  const duplicateData = {
    ...original,
    id: undefined,
    project_id: project_id || original.project_id,
    name: `${original.name} (Copy)`,
    status: 'pending',
    completed_at: null,
    approved_at: null,
    approved_by: null,
    deliverables,
    payment_status: 'pending',
    invoice_id: null,
    notification_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  delete duplicateData.id

  const { data: duplicate, error } = await supabase
    .from('milestones')
    .insert(duplicateData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    milestone: duplicate,
    message: 'Milestone duplicated'
  }, { status: 201 })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateMilestoneStats(milestones: Record<string, unknown>[]) {
  const total = milestones.length
  const completed = milestones.filter(m => ['completed', 'approved'].includes(m.status as string)).length
  const pending = milestones.filter(m => m.status === 'pending').length
  const inProgress = milestones.filter(m => m.status === 'in_progress').length
  const overdue = milestones.filter(m =>
    m.due_date &&
    new Date(m.due_date as string) < new Date() &&
    !['completed', 'approved', 'cancelled'].includes(m.status as string)
  ).length

  const totalPayment = milestones.reduce((sum, m) => sum + ((m.payment_amount as number) || 0), 0)
  const paidAmount = milestones
    .filter(m => m.payment_status === 'paid')
    .reduce((sum, m) => sum + ((m.payment_amount as number) || 0), 0)

  return {
    total,
    completed,
    pending,
    in_progress: inProgress,
    overdue,
    completion_rate: total ? Math.round((completed / total) * 100) : 0,
    total_payment: totalPayment,
    paid_amount: paidAmount,
    pending_payment: totalPayment - paidAmount
  }
}

async function updateProjectProgress(
  supabase: any,
  projectId: string
) {
  const { data: milestones } = await supabase
    .from('milestones')
    .select('status')
    .eq('project_id', projectId)
    .neq('status', 'cancelled')

  if (!milestones?.length) return

  const completed = milestones.filter(m =>
    ['completed', 'approved'].includes(m.status)
  ).length
  const progress = Math.round((completed / milestones.length) * 100)

  await supabase
    .from('projects')
    .update({
      progress,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
}

async function notifyForApproval(
  supabase: any,
  milestone: Record<string, unknown>
) {
  // Get project with client
  const { data: project } = await supabase
    .from('projects')
    .select('client_id, name')
    .eq('id', milestone.project_id)
    .single()

  if (!project?.client_id) return

  // Get client email
  const { data: client } = await supabase
    .from('clients')
    .select('email, name')
    .eq('id', project.client_id)
    .single()

  if (!client?.email) return

  // Create notification
  await supabase.from('notifications').insert({
    user_id: project.client_id,
    type: 'milestone_approval',
    title: 'Milestone Ready for Approval',
    message: `Milestone "${milestone.name}" for project "${project.name}" is ready for your approval.`,
    data: {
      milestone_id: milestone.id,
      project_id: milestone.project_id
    },
    read: false,
    created_at: new Date().toISOString()
  })

  // Mark notification as sent
  await supabase
    .from('milestones')
    .update({ notification_sent: true })
    .eq('id', milestone.id)
}

async function logMilestoneActivity(
  supabase: any,
  milestoneId: string,
  userId: string,
  action: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('activity_log').insert({
      entity_type: 'milestone',
      entity_id: milestoneId,
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Activity log error', { error })
  }
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoMilestones(): Partial<Milestone>[] {
  const now = new Date()

  return [
    {
      id: 'demo-ms-1',
      name: 'Project Kickoff',
      description: 'Initial meeting and requirements gathering',
      status: 'approved',
      position: 0,
      due_date: new Date(now.getTime() - 7 * 86400000).toISOString(),
      completed_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
      approved_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
      deliverables: [
        { id: 'd1', name: 'Requirements Document', type: 'file', status: 'approved', description: '' },
        { id: 'd2', name: 'Project Plan', type: 'file', status: 'approved', description: '' }
      ],
      payment_percentage: 20,
      payment_status: 'paid',
      requires_approval: true
    },
    {
      id: 'demo-ms-2',
      name: 'Design Phase',
      description: 'Complete all design deliverables',
      status: 'in_progress',
      position: 1,
      due_date: new Date(now.getTime() + 7 * 86400000).toISOString(),
      deliverables: [
        { id: 'd3', name: 'Wireframes', type: 'file', status: 'approved', description: '' },
        { id: 'd4', name: 'UI Mockups', type: 'file', status: 'submitted', description: '' },
        { id: 'd5', name: 'Style Guide', type: 'file', status: 'pending', description: '' }
      ],
      payment_percentage: 30,
      payment_status: 'pending',
      requires_approval: true
    },
    {
      id: 'demo-ms-3',
      name: 'Development Complete',
      description: 'All features implemented and tested',
      status: 'pending',
      position: 2,
      due_date: new Date(now.getTime() + 21 * 86400000).toISOString(),
      deliverables: [
        { id: 'd6', name: 'Working Application', type: 'approval', status: 'pending', description: '' },
        { id: 'd7', name: 'Test Results', type: 'file', status: 'pending', description: '' }
      ],
      payment_percentage: 30,
      payment_status: 'pending',
      requires_approval: true
    },
    {
      id: 'demo-ms-4',
      name: 'Launch',
      description: 'Project goes live',
      status: 'pending',
      position: 3,
      due_date: new Date(now.getTime() + 30 * 86400000).toISOString(),
      deliverables: [
        { id: 'd8', name: 'Live Website', type: 'link', status: 'pending', description: '' },
        { id: 'd9', name: 'Documentation', type: 'file', status: 'pending', description: '' },
        { id: 'd10', name: 'Training Session', type: 'approval', status: 'pending', description: '' }
      ],
      payment_percentage: 20,
      payment_status: 'pending',
      requires_approval: true
    }
  ]
}

function getDemoMilestoneStats() {
  return {
    total: 4,
    completed: 1,
    pending: 2,
    in_progress: 1,
    overdue: 0,
    completion_rate: 25,
    total_payment: 5000,
    paid_amount: 1000,
    pending_payment: 4000
  }
}
