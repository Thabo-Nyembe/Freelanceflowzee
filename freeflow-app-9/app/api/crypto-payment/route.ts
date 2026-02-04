/**
 * Crypto Payment API Routes
 *
 * REST endpoints for Cryptocurrency Payments:
 * GET - List wallets, transactions, prices, payment links, recurring payments, analytics
 * POST - Create wallet, transaction, payment link, recurring payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('crypto-payment')
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
  getCryptoWallets,
  createCryptoWallet,
  getCryptoTransactions,
  createCryptoTransaction,
  getCryptoPrices,
  getCryptoPrice,
  calculateCryptoAmount,
  calculateFiatAmount,
  getPaymentLinks,
  createPaymentLink,
  getRecurringPayments,
  createRecurringPayment,
  getWalletAnalytics,
  getTransactionStatsByCurrency,
  getPaymentTimeline,
  getPendingTransactionsCount,
  searchTransactions
} from '@/lib/crypto-payment-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'wallets'
    const currency = searchParams.get('currency') as string | null
    const walletType = searchParams.get('wallet_type') as string | null
    const walletId = searchParams.get('wallet_id')
    const transactionType = searchParams.get('transaction_type') as string | null
    const status = searchParams.get('status') as string | null
    const isActive = searchParams.get('is_active')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const fiatAmount = searchParams.get('fiat_amount') ? parseFloat(searchParams.get('fiat_amount')!) : undefined
    const cryptoAmount = searchParams.get('crypto_amount') ? parseFloat(searchParams.get('crypto_amount')!) : undefined
    const fiatCurrency = searchParams.get('fiat_currency') as 'usd' | 'eur' | 'gbp' || 'usd'
    const days = parseInt(searchParams.get('days') || '30')
    const search = searchParams.get('search')

    switch (type) {
      case 'wallets': {
        const filters: any = {}
        if (currency) filters.currency = currency
        if (walletType) filters.type = walletType
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getCryptoWallets(
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result })
      }

      case 'transactions': {
        if (search) {
          const result = await searchTransactions(search)
          return NextResponse.json({ data: result })
        }
        const filters: any = {}
        if (walletId) filters.wallet_id = walletId
        if (currency) filters.currency = currency
        if (transactionType) filters.type = transactionType
        if (status) filters.status = status
        if (limit) filters.limit = limit
        if (offset) filters.offset = offset
        const result = await getCryptoTransactions(
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result })
      }

      case 'prices': {
        if (currency) {
          const result = await getCryptoPrice(currency)
          return NextResponse.json({ data: result })
        }
        const currencies = searchParams.get('currencies')?.split(',') || undefined
        const result = await getCryptoPrices(currencies)
        return NextResponse.json({ data: result })
      }

      case 'calculate-crypto': {
        if (!fiatAmount || !currency) {
          return NextResponse.json({ error: 'fiat_amount and currency required' }, { status: 400 })
        }
        const result = await calculateCryptoAmount(fiatAmount, currency, fiatCurrency)
        return NextResponse.json({ data: result })
      }

      case 'calculate-fiat': {
        if (!cryptoAmount || !currency) {
          return NextResponse.json({ error: 'crypto_amount and currency required' }, { status: 400 })
        }
        const result = await calculateFiatAmount(cryptoAmount, currency, fiatCurrency)
        return NextResponse.json({ data: result })
      }

      case 'payment-links': {
        const filters: any = {}
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getPaymentLinks(
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result })
      }

      case 'recurring-payments': {
        const filters: any = {}
        if (isActive !== null) filters.is_active = isActive === 'true'
        if (walletId) filters.wallet_id = walletId
        const result = await getRecurringPayments(
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result })
      }

      case 'analytics': {
        const result = await getWalletAnalytics(walletId || undefined)
        return NextResponse.json({ data: result })
      }

      case 'stats-by-currency': {
        const result = await getTransactionStatsByCurrency()
        return NextResponse.json({ data: result })
      }

      case 'timeline': {
        const result = await getPaymentTimeline(days)
        return NextResponse.json({ data: result })
      }

      case 'pending-count': {
        const result = await getPendingTransactionsCount()
        return NextResponse.json({ data: { count: result } })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Crypto Payment data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Crypto Payment data' },
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
      case 'create-wallet': {
        const result = await createCryptoWallet({
          name: payload.name,
          currency: payload.currency,
          address: payload.address,
          type: payload.type,
          network: payload.network,
          network_type: payload.network_type,
          derivation_path: payload.derivation_path,
          public_key: payload.public_key,
          tags: payload.tags
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-transaction': {
        const result = await createCryptoTransaction({
          wallet_id: payload.wallet_id,
          type: payload.type,
          amount: payload.amount,
          currency: payload.currency,
          usd_amount: payload.usd_amount,
          to_address: payload.to_address,
          from_address: payload.from_address,
          network: payload.network,
          fee: payload.fee,
          fee_usd: payload.fee_usd,
          required_confirmations: payload.required_confirmations,
          description: payload.description,
          memo: payload.memo,
          metadata: payload.metadata,
          expires_at: payload.expires_at
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-payment-link': {
        const result = await createPaymentLink({
          title: payload.title,
          description: payload.description,
          amount: payload.amount,
          currency: payload.currency,
          supported_cryptos: payload.supported_cryptos,
          max_uses: payload.max_uses,
          expires_at: payload.expires_at,
          success_url: payload.success_url,
          cancel_url: payload.cancel_url,
          metadata: payload.metadata
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-recurring-payment': {
        const result = await createRecurringPayment({
          wallet_id: payload.wallet_id,
          to_address: payload.to_address,
          amount: payload.amount,
          currency: payload.currency,
          frequency: payload.frequency,
          next_payment_at: payload.next_payment_at,
          max_payments: payload.max_payments,
          description: payload.description,
          metadata: payload.metadata
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Crypto Payment request', { error })
    return NextResponse.json(
      { error: 'Failed to process Crypto Payment request' },
      { status: 500 }
    )
  }
}
