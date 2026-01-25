/**
 * Admin Overview API - Single Resource Routes
 *
 * PUT - Update goal progress, deal, contact, invoice, alert status, platform config
 * DELETE - Delete deal, contact, invoice, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-overview')
import {
  updateGoalProgress,
  updateDeal,
  updateDealStage,
  deleteDeal,
  updateContact,
  deleteContact,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  acknowledgeAlert,
  dismissAlert,
  resolveAlert,
  deleteAdminAlert,
  savePlatformConfig
} from '@/lib/admin-overview-queries'

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
      case 'goal': {
        if (action === 'update-progress') {
          const result = await updateGoalProgress(id, updates.current_value)
          return NextResponse.json({ data: result })
        }
        return NextResponse.json({ error: 'Invalid action for goal' }, { status: 400 })
      }

      case 'deal': {
        if (action === 'update-stage') {
          const result = await updateDealStage(id, updates.stage)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateDeal(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'contact': {
        const result = await updateContact(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'invoice': {
        if (action === 'update-status') {
          const result = await updateInvoiceStatus(id, updates.status)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateInvoice(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'alert': {
        if (action === 'acknowledge') {
          await acknowledgeAlert(id)
          return NextResponse.json({ success: true })
        } else if (action === 'dismiss') {
          await dismissAlert(id)
          return NextResponse.json({ success: true })
        } else if (action === 'resolve') {
          await resolveAlert(id)
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: 'Invalid action for alert' }, { status: 400 })
      }

      case 'platform-config': {
        const result = await savePlatformConfig(user.id, updates)
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
    const type = searchParams.get('type') || 'deal'

    switch (type) {
      case 'deal': {
        await deleteDeal(id)
        return NextResponse.json({ success: true })
      }

      case 'contact': {
        await deleteContact(id)
        return NextResponse.json({ success: true })
      }

      case 'invoice': {
        await deleteInvoice(id)
        return NextResponse.json({ success: true })
      }

      case 'alert': {
        await deleteAdminAlert(id)
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
