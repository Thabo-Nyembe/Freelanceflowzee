/**
 * Financial API - Single Resource Routes
 *
 * GET - Get single transaction, invoice, goal
 * PUT - Update transaction, invoice, goal, insight status
 * DELETE - Delete transaction, invoice, goal
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('financial')
import {

  getTransaction,
  updateTransaction,
  deleteTransaction,
  updateInsightStatus,
  updateGoalProgress,
  getInvoice,
  updateInvoice,
  deleteInvoice
} from '@/lib/financial-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'transaction'

    switch (type) {
      case 'transaction': {
        const result = await getTransaction(id, user.id)
        if (!result.data) {
          return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      case 'invoice': {
        const result = await getInvoice(id, user.id)
        if (!result.data) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch resource', { error })
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
      case 'transaction': {
        const result = await updateTransaction(id, user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'insight': {
        if (action === 'update-status') {
          const result = await updateInsightStatus(id, user.id, updates.status)
          return NextResponse.json({ success: result.success })
        }
        return NextResponse.json({ error: 'Invalid action for insight' }, { status: 400 })
      }

      case 'goal': {
        if (action === 'update-progress') {
          const result = await updateGoalProgress(id, user.id, updates.current_amount)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for goal' }, { status: 400 })
      }

      case 'invoice': {
        const result = await updateInvoice(id, user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update resource', { error })
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
    const type = searchParams.get('type') || 'transaction'

    switch (type) {
      case 'transaction': {
        await deleteTransaction(id, user.id)
        return NextResponse.json({ success: true })
      }

      case 'invoice': {
        await deleteInvoice(id, user.id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete resource', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
