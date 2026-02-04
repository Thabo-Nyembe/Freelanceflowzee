/**
 * Crypto Payment API - Single Resource Routes
 *
 * GET - Get single wallet, transaction, payment link by code
 * PUT - Update wallet, transaction status, payment link, recurring payment
 * DELETE - Delete wallet, payment link
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('crypto-payment')
import {

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}
  getCryptoWallet,
  updateCryptoWallet,
  deleteCryptoWallet,
  setPrimaryWallet,
  getCryptoTransaction,
  updateTransactionStatus,
  cancelTransaction,
  refundTransaction,
  getPaymentLinkByCode,
  updatePaymentLink,
  deletePaymentLink,
  incrementPaymentLinkUsage,
  updateRecurringPayment,
  cancelRecurringPayment
} from '@/lib/crypto-payment-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'wallet'

    switch (type) {
      case 'wallet': {
        const result = await getCryptoWallet(id)
        if (!result) {
          return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'transaction': {
        const result = await getCryptoTransaction(id)
        if (!result) {
          return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'payment-link': {
        const result = await getPaymentLinkByCode(id)
        if (!result) {
          return NextResponse.json({ error: 'Payment link not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
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
      case 'wallet': {
        if (action === 'set-primary') {
          await setPrimaryWallet(id, updates.currency)
          return NextResponse.json({ success: true })
        } else {
          await updateCryptoWallet(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'transaction': {
        if (action === 'update-status') {
          await updateTransactionStatus(id, updates.status, {
            tx_hash: updates.tx_hash,
            block_number: updates.block_number,
            confirmations: updates.confirmations,
            confirmed_at: updates.confirmed_at,
            completed_at: updates.completed_at,
            error_message: updates.error_message
          })
          return NextResponse.json({ success: true })
        } else if (action === 'cancel') {
          await cancelTransaction(id)
          return NextResponse.json({ success: true })
        } else if (action === 'refund') {
          await refundTransaction(id)
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: 'Invalid action for transaction' }, { status: 400 })
      }

      case 'payment-link': {
        if (action === 'increment-usage') {
          await incrementPaymentLinkUsage(id)
          return NextResponse.json({ success: true })
        } else {
          await updatePaymentLink(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'recurring-payment': {
        if (action === 'cancel') {
          await cancelRecurringPayment(id)
          return NextResponse.json({ success: true })
        } else {
          await updateRecurringPayment(id, updates)
          return NextResponse.json({ success: true })
        }
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
    const type = searchParams.get('type') || 'wallet'

    switch (type) {
      case 'wallet': {
        await deleteCryptoWallet(id)
        return NextResponse.json({ success: true })
      }

      case 'payment-link': {
        await deletePaymentLink(id)
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
