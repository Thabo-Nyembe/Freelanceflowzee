/**
 * Workflow Builder API - Single Resource Routes
 *
 * GET - Get single workflow
 * PUT - Update workflow, action, reorder actions
 * DELETE - Delete workflow, action
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflowStatus,
  updateWorkflowAction,
  deleteWorkflowAction,
  reorderWorkflowActions,
  exportWorkflow
} from '@/lib/workflow-builder-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'workflow'

    switch (type) {
      case 'workflow': {
        const data = await getWorkflow(id)
        if (!data) {
          return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'export': {
        const data = await exportWorkflow(id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Workflow Builder API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'workflow': {
        if (action === 'toggle-status') {
          const data = await toggleWorkflowStatus(id, updates.status)
          return NextResponse.json({ data })
        } else if (action === 'reorder-actions') {
          await reorderWorkflowActions(id, updates.action_ids)
          return NextResponse.json({ success: true })
        } else {
          const data = await updateWorkflow(id, updates)
          return NextResponse.json({ data })
        }
      }

      case 'action': {
        await updateWorkflowAction(id, updates)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Workflow Builder API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'workflow'

    switch (type) {
      case 'workflow': {
        await deleteWorkflow(id)
        return NextResponse.json({ success: true })
      }

      case 'action': {
        await deleteWorkflowAction(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Workflow Builder API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
