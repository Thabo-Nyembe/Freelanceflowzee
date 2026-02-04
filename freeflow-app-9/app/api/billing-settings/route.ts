/**
 * Billing Settings API Routes
 *
 * REST endpoints for Billing Settings:
 * GET - Subscriptions, payment methods, addresses, invoices, transactions, usage, credits, stats
 * POST - Create subscription, payment method, address, invoice, transaction, usage, credit
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('billing-settings')
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
  getUserSubscription,
  createSubscription,
  getActiveSubscriptions,
  getExpiringSubscriptions,
  getTrialingSubscriptions,
  getUserPaymentMethods,
  getDefaultPaymentMethod,
  createPaymentMethod,
  getUserBillingAddresses,
  getDefaultBillingAddress,
  createBillingAddress,
  getUserInvoices,
  createInvoice,
  getUnpaidInvoices,
  getOverdueInvoices,
  getUserTransactions,
  createTransaction,
  getPendingTransactions,
  getFailedTransactions,
  getCurrentUsage,
  getUserUsageHistory,
  createUsageRecord,
  checkUsageLimit,
  getUserCredits,
  getTotalCreditsBalance,
  createCredit,
  getBillingStats,
  getRevenueStats
} from '@/lib/billing-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'subscription'
    const status = searchParams.get('status') as string | null
    const daysAhead = searchParams.get('days_ahead') ? parseInt(searchParams.get('days_ahead')!) : 7
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const metric = searchParams.get('metric') as string | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    switch (type) {
      case 'subscription': {
        const result = await getUserSubscription(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'active-subscriptions': {
        const result = await getActiveSubscriptions(status || 'active')
        return NextResponse.json({ data: result.data })
      }

      case 'expiring-subscriptions': {
        const result = await getExpiringSubscriptions(daysAhead)
        return NextResponse.json({ data: result.data })
      }

      case 'trialing-subscriptions': {
        const result = await getTrialingSubscriptions()
        return NextResponse.json({ data: result.data })
      }

      case 'payment-methods': {
        const result = await getUserPaymentMethods(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'default-payment-method': {
        const result = await getDefaultPaymentMethod(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'billing-addresses': {
        const result = await getUserBillingAddresses(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'default-billing-address': {
        const result = await getDefaultBillingAddress(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'invoices': {
        const result = await getUserInvoices(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'unpaid-invoices': {
        const result = await getUnpaidInvoices(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'overdue-invoices': {
        const result = await getOverdueInvoices(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'transactions': {
        const result = await getUserTransactions(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'pending-transactions': {
        const result = await getPendingTransactions(limit)
        return NextResponse.json({ data: result.data })
      }

      case 'failed-transactions': {
        const result = await getFailedTransactions(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'current-usage': {
        const result = await getCurrentUsage(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'usage-history': {
        const result = await getUserUsageHistory(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'check-usage-limit': {
        if (!metric) {
          return NextResponse.json({ error: 'metric required' }, { status: 400 })
        }
        const result = await checkUsageLimit(user.id, metric)
        return NextResponse.json({ data: result })
      }

      case 'credits': {
        const result = await getUserCredits(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'credits-balance': {
        const balance = await getTotalCreditsBalance(user.id)
        return NextResponse.json({ data: { balance } })
      }

      case 'stats': {
        const result = await getBillingStats(user.id)
        return NextResponse.json({ data: result })
      }

      case 'revenue-stats': {
        const result = await getRevenueStats(startDate || undefined, endDate || undefined)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Billing Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Billing Settings data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-subscription': {
        const result = await createSubscription(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-payment-method': {
        const result = await createPaymentMethod(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-billing-address': {
        const result = await createBillingAddress(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-invoice': {
        const result = await createInvoice(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-transaction': {
        const result = await createTransaction(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-usage-record': {
        const result = await createUsageRecord(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-credit': {
        const result = await createCredit(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Billing Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Billing Settings request' },
      { status: 500 }
    )
  }
}
