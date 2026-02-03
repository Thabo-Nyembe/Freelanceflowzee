import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * Client Feedback API
 *
 * Specialized feedback system for client-facing interactions:
 * - Approval workflows
 * - Revision requests
 * - Milestone sign-offs
 * - Client comments on deliverables
 */

const ClientFeedbackSchema = z.object({
  projectId: z.string().uuid(),
  deliverableId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  type: z.enum(['approval', 'revision', 'comment', 'question', 'sign_off']),
  content: z.string().min(1).max(5000),
  rating: z.number().min(1).max(5).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
})

const RevisionRequestSchema = z.object({
  feedbackId: z.string().uuid(),
  items: z.array(z.object({
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    reference: z.string().optional(),
  })),
  deadline: z.string().optional(),
})

const ApprovalSchema = z.object({
  deliverableId: z.string().uuid(),
  approved: z.boolean(),
  signature: z.string().optional(),
  comments: z.string().optional(),
})

// Demo client feedback data
const demoClientFeedback = [
  {
    id: 'cf-001',
    project_id: 'proj-001',
    client_id: 'client-001',
    deliverable_id: 'del-001',
    type: 'approval',
    content: 'Love the direction! The color scheme is perfect for our brand. Approved for the next phase.',
    rating: 5,
    status: 'approved',
    created_at: '2026-01-28T14:30:00Z',
    client: { name: 'TechStart Inc', contact: 'John Smith' },
  },
  {
    id: 'cf-002',
    project_id: 'proj-001',
    client_id: 'client-001',
    deliverable_id: 'del-002',
    type: 'revision',
    content: 'Can we try a slightly different font for the headings? Something more modern.',
    revision_items: [
      { description: 'Change heading font to Inter or similar', priority: 'medium' },
      { description: 'Increase contrast on secondary buttons', priority: 'low' },
    ],
    status: 'pending',
    created_at: '2026-01-29T09:15:00Z',
    client: { name: 'TechStart Inc', contact: 'John Smith' },
  },
  {
    id: 'cf-003',
    project_id: 'proj-002',
    client_id: 'client-002',
    milestone_id: 'ms-001',
    type: 'sign_off',
    content: 'Milestone 1 complete. All requirements met. Proceeding to release escrow.',
    rating: 5,
    status: 'signed_off',
    signature: 'Emily Chen - CEO',
    created_at: '2026-01-27T16:45:00Z',
    client: { name: 'RetailPro Co', contact: 'Emily Chen' },
  },
  {
    id: 'cf-004',
    project_id: 'proj-002',
    client_id: 'client-002',
    type: 'question',
    content: 'What is the expected timeline for implementing the payment gateway integration?',
    status: 'pending',
    created_at: '2026-01-29T11:00:00Z',
    client: { name: 'RetailPro Co', contact: 'Emily Chen' },
  },
]

const demoApprovals = [
  {
    id: 'approval-001',
    deliverable_id: 'del-001',
    project_id: 'proj-001',
    client_id: 'client-001',
    approved: true,
    signature: 'John Smith - Marketing Director',
    comments: 'Excellent work on the brand guidelines',
    approved_at: '2026-01-28T14:30:00Z',
  },
  {
    id: 'approval-002',
    deliverable_id: 'del-003',
    project_id: 'proj-003',
    client_id: 'client-003',
    approved: true,
    signature: 'Mike Davis - Product Manager',
    comments: 'App looks great, ready for beta testing',
    approved_at: '2026-01-26T10:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const deliverableId = searchParams.get('deliverableId')
    const milestoneId = searchParams.get('milestoneId')
    const view = searchParams.get('view') || 'feedback' // feedback | approvals | summary

    // Demo mode
    if (!user) {
      if (view === 'approvals') {
        let filtered = [...demoApprovals]
        if (projectId) {
          filtered = filtered.filter(a => a.project_id === projectId)
        }
        if (deliverableId) {
          filtered = filtered.filter(a => a.deliverable_id === deliverableId)
        }
        return NextResponse.json({
          success: true,
          demo: true,
          data: filtered,
        })
      }

      if (view === 'summary') {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            totalFeedback: demoClientFeedback.length,
            pendingRevisions: demoClientFeedback.filter(f => f.type === 'revision' && f.status === 'pending').length,
            approvedItems: demoApprovals.length,
            averageRating: 4.8,
            responseTime: '2.3 hours',
            satisfactionScore: 96,
          },
        })
      }

      let filtered = [...demoClientFeedback]
      if (projectId) {
        filtered = filtered.filter(f => f.project_id === projectId)
      }
      if (clientId) {
        filtered = filtered.filter(f => f.client_id === clientId)
      }
      if (type) {
        filtered = filtered.filter(f => f.type === type)
      }
      if (status) {
        filtered = filtered.filter(f => f.status === status)
      }
      if (deliverableId) {
        filtered = filtered.filter(f => f.deliverable_id === deliverableId)
      }
      if (milestoneId) {
        filtered = filtered.filter(f => f.milestone_id === milestoneId)
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: filtered,
      })
    }

    // Real implementation
    if (view === 'approvals') {
      let query = supabase
        .from('client_approvals')
        .select(`
          *,
          deliverable:deliverables(id, name, type),
          client:clients(id, name, contact_name)
        `)
        .order('approved_at', { ascending: false })

      if (projectId) query = query.eq('project_id', projectId)
      if (deliverableId) query = query.eq('deliverable_id', deliverableId)

      const { data: approvals, error } = await query
      if (error) throw error

      return NextResponse.json({
        success: true,
        data: approvals,
      })
    }

    if (view === 'summary') {
      const { data: feedback } = await supabase
        .from('client_feedback')
        .select('id, type, status, rating')
        .eq(projectId ? 'project_id' : 'id', projectId || '')

      const { data: approvals } = await supabase
        .from('client_approvals')
        .select('id')
        .eq(projectId ? 'project_id' : 'id', projectId || '')

      const ratings = feedback?.filter(f => f.rating).map(f => f.rating) || []
      const avgRating = ratings.length
        ? ratings.reduce((a, b) => a + b!, 0) / ratings.length
        : 0

      return NextResponse.json({
        success: true,
        data: {
          totalFeedback: feedback?.length || 0,
          pendingRevisions: feedback?.filter(f => f.type === 'revision' && f.status === 'pending').length || 0,
          approvedItems: approvals?.length || 0,
          averageRating: Math.round(avgRating * 10) / 10,
          responseTime: 'N/A',
          satisfactionScore: avgRating > 0 ? Math.round((avgRating / 5) * 100) : 0,
        },
      })
    }

    // Default: feedback list
    let query = supabase
      .from('client_feedback')
      .select(`
        *,
        client:clients(id, name, contact_name, email),
        deliverable:deliverables(id, name, type),
        milestone:milestones(id, name, status),
        replies:client_feedback_replies(count)
      `)
      .order('created_at', { ascending: false })

    if (projectId) query = query.eq('project_id', projectId)
    if (clientId) query = query.eq('client_id', clientId)
    if (type) query = query.eq('type', type)
    if (status) query = query.eq('status', status)
    if (deliverableId) query = query.eq('deliverable_id', deliverableId)
    if (milestoneId) query = query.eq('milestone_id', milestoneId)

    const { data: feedback, error } = await query
    if (error) throw error

    return NextResponse.json({
      success: true,
      data: feedback,
    })
  } catch (error) {
    console.error('Client feedback GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client feedback' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { action = 'submit', ...data } = body

    // Demo mode
    if (!user) {
      switch (action) {
        case 'submit':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Feedback submitted (demo mode)',
            data: {
              id: `cf-demo-${Date.now()}`,
              ...data,
              status: 'pending',
              created_at: new Date().toISOString(),
            },
          })
        case 'approve':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Deliverable approved (demo mode)',
            data: {
              id: `approval-demo-${Date.now()}`,
              ...data,
              approved_at: new Date().toISOString(),
            },
          })
        case 'request_revision':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Revision requested (demo mode)',
          })
        case 'respond':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Response sent (demo mode)',
          })
        default:
          return NextResponse.json({
            success: false,
            demo: true,
            error: 'Unknown action',
          }, { status: 400 })
      }
    }

    switch (action) {
      case 'submit': {
        const validated = ClientFeedbackSchema.parse(data)

        // Verify client access to project
        const { data: project } = await supabase
          .from('projects')
          .select('id, client_id, owner_id')
          .eq('id', validated.projectId)
          .single()

        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          )
        }

        const { data: feedback, error } = await supabase
          .from('client_feedback')
          .insert({
            project_id: validated.projectId,
            client_id: project.client_id,
            deliverable_id: validated.deliverableId,
            milestone_id: validated.milestoneId,
            type: validated.type,
            content: validated.content,
            rating: validated.rating,
            attachments: validated.attachments,
            status: validated.type === 'approval' ? 'approved' : 'pending',
          })
          .select()
          .single()

        if (error) throw error

        // Notify project owner
        await supabase.from('notifications').insert({
          user_id: project.owner_id,
          type: 'client_feedback',
          title: `New ${validated.type} from client`,
          message: validated.content.substring(0, 100),
          data: { feedbackId: feedback.id, projectId: validated.projectId },
        })

        return NextResponse.json({
          success: true,
          message: 'Feedback submitted successfully',
          data: feedback,
        })
      }

      case 'approve': {
        const validated = ApprovalSchema.parse(data)

        const { data: deliverable } = await supabase
          .from('deliverables')
          .select('id, project_id')
          .eq('id', validated.deliverableId)
          .single()

        if (!deliverable) {
          return NextResponse.json(
            { success: false, error: 'Deliverable not found' },
            { status: 404 }
          )
        }

        const { data: project } = await supabase
          .from('projects')
          .select('client_id, owner_id')
          .eq('id', deliverable.project_id)
          .single()

        const { data: approval, error } = await supabase
          .from('client_approvals')
          .insert({
            deliverable_id: validated.deliverableId,
            project_id: deliverable.project_id,
            client_id: project?.client_id,
            approved: validated.approved,
            signature: validated.signature,
            comments: validated.comments,
            approved_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        // Update deliverable status
        await supabase
          .from('deliverables')
          .update({
            status: validated.approved ? 'approved' : 'revision_requested',
            approved_at: validated.approved ? new Date().toISOString() : null,
          })
          .eq('id', validated.deliverableId)

        // Notify project owner
        if (project) {
          await supabase.from('notifications').insert({
            user_id: project.owner_id,
            type: validated.approved ? 'deliverable_approved' : 'revision_requested',
            title: validated.approved
              ? 'Deliverable approved by client'
              : 'Client requested revisions',
            message: validated.comments || 'Check deliverable for details',
            data: { deliverableId: validated.deliverableId, approvalId: approval.id },
          })
        }

        return NextResponse.json({
          success: true,
          message: validated.approved
            ? 'Deliverable approved successfully'
            : 'Revision request recorded',
          data: approval,
        })
      }

      case 'request_revision': {
        const validated = RevisionRequestSchema.parse(data)

        // Get the original feedback
        const { data: feedback } = await supabase
          .from('client_feedback')
          .select('project_id')
          .eq('id', validated.feedbackId)
          .single()

        if (!feedback) {
          return NextResponse.json(
            { success: false, error: 'Feedback not found' },
            { status: 404 }
          )
        }

        // Create revision request
        const { data: revision, error } = await supabase
          .from('revision_requests')
          .insert({
            feedback_id: validated.feedbackId,
            project_id: feedback.project_id,
            items: validated.items,
            deadline: validated.deadline,
            status: 'pending',
          })
          .select()
          .single()

        if (error) throw error

        // Update feedback status
        await supabase
          .from('client_feedback')
          .update({ status: 'revision_requested' })
          .eq('id', validated.feedbackId)

        return NextResponse.json({
          success: true,
          message: 'Revision request created',
          data: revision,
        })
      }

      case 'respond': {
        const { feedbackId, response } = data

        if (!feedbackId || !response) {
          return NextResponse.json(
            { success: false, error: 'Missing feedbackId or response' },
            { status: 400 }
          )
        }

        const { data: reply, error } = await supabase
          .from('client_feedback_replies')
          .insert({
            feedback_id: feedbackId,
            user_id: user.id,
            content: response,
          })
          .select()
          .single()

        if (error) throw error

        // Update feedback status if it was pending
        await supabase
          .from('client_feedback')
          .update({ status: 'responded' })
          .eq('id', feedbackId)
          .eq('status', 'pending')

        return NextResponse.json({
          success: true,
          message: 'Response sent successfully',
          data: reply,
        })
      }

      case 'resolve': {
        const { feedbackId, resolution } = data

        const { error } = await supabase
          .from('client_feedback')
          .update({
            status: 'resolved',
            resolution,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', feedbackId)

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Feedback resolved',
        })
      }

      case 'sign_off': {
        const { milestoneId, signature, comments } = data

        if (!milestoneId) {
          return NextResponse.json(
            { success: false, error: 'Missing milestoneId' },
            { status: 400 }
          )
        }

        const { data: milestone } = await supabase
          .from('milestones')
          .select('project_id')
          .eq('id', milestoneId)
          .single()

        if (!milestone) {
          return NextResponse.json(
            { success: false, error: 'Milestone not found' },
            { status: 404 }
          )
        }

        // Create sign-off record
        const { data: signOff, error } = await supabase
          .from('milestone_sign_offs')
          .insert({
            milestone_id: milestoneId,
            project_id: milestone.project_id,
            signed_by: user.id,
            signature,
            comments,
            signed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        // Update milestone status
        await supabase
          .from('milestones')
          .update({ status: 'signed_off', signed_off_at: new Date().toISOString() })
          .eq('id', milestoneId)

        return NextResponse.json({
          success: true,
          message: 'Milestone signed off successfully',
          data: signOff,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Client feedback POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process client feedback' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feedbackId, ...updates } = body

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('client_feedback')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Client feedback PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get('feedbackId')

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('client_feedback')
      .delete()
      .eq('id', feedbackId)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Feedback deleted successfully' })

  } catch (error) {
    console.error('Client feedback DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}
