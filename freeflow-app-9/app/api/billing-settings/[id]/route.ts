/**
 * Billing Settings API - Single Resource Routes
 *
 * GET - Get single subscription, invoice, transaction
 * PUT - Update subscription, payment method, billing address, invoice, transaction, usage
 * DELETE - Delete payment method, billing address
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  verifyPaymentMethod,
  updateBillingAddress,
  setDefaultBillingAddress,
  deleteBillingAddress,
  getInvoiceById,
  getInvoiceByNumber,
  updateInvoice,
  markInvoicePaid,
  voidInvoice,
  getTransactionById,
  updateTransaction,
  markTransactionSucceeded,
  markTransactionFailed,
  refundTransaction,
  updateUsageMetrics,
  incrementUsage,
  applyCredit
} from '@/lib/billing-settings-queries'

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
    const type = searchParams.get('type') || 'invoice'

    switch (type) {
      case 'invoice': {
        const result = await getInvoiceById(id)
        return NextResponse.json({ data: result.data })
      }

      case 'invoice-by-number': {
        const result = await getInvoiceByNumber(id)
        return NextResponse.json({ data: result.data })
      }

      case 'transaction': {
        const result = await getTransactionById(id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Billing Settings API error:', error)
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
      case 'subscription': {
        if (action === 'cancel') {
          const result = await cancelSubscription(id, updates.reason, updates.immediate)
          return NextResponse.json({ data: result.data })
        } else if (action === 'reactivate') {
          const result = await reactivateSubscription(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'change-plan') {
          const result = await changePlan(id, updates.plan_type, updates.amount)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateSubscription(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'payment-method': {
        if (action === 'set-default') {
          const result = await setDefaultPaymentMethod(id, user.id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'verify') {
          const result = await verifyPaymentMethod(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updatePaymentMethod(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'billing-address': {
        if (action === 'set-default') {
          const result = await setDefaultBillingAddress(id, user.id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateBillingAddress(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'invoice': {
        if (action === 'mark-paid') {
          const result = await markInvoicePaid(id, updates.paid_amount)
          return NextResponse.json({ data: result.data })
        } else if (action === 'void') {
          const result = await voidInvoice(id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateInvoice(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'transaction': {
        if (action === 'mark-succeeded') {
          const result = await markTransactionSucceeded(id)
          return NextResponse.json({ data: result.data })
        } else if (action === 'mark-failed') {
          const result = await markTransactionFailed(id, updates.error_message, updates.error_code)
          return NextResponse.json({ data: result.data })
        } else if (action === 'refund') {
          const result = await refundTransaction(id, updates.amount)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateTransaction(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'usage': {
        if (action === 'increment') {
          const result = await incrementUsage(user.id, updates.metric, updates.amount)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateUsageMetrics(id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'credit': {
        if (action === 'apply') {
          const result = await applyCredit(user.id, updates.amount)
          return NextResponse.json({ data: result })
        }
        return NextResponse.json({ error: 'Invalid action for credit' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Billing Settings API error:', error)
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
    const type = searchParams.get('type') || 'payment-method'

    switch (type) {
      case 'payment-method': {
        const result = await deletePaymentMethod(id)
        return NextResponse.json({ data: result.data })
      }

      case 'billing-address': {
        await deleteBillingAddress(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Billing Settings API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
