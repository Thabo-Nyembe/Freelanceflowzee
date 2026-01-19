/**
 * Tax Transactions API
 *
 * Record and manage tax transactions for filing
 *
 * POST /api/tax/transactions - Record transaction for filing
 * GET /api/tax/transactions - List transactions
 * DELETE /api/tax/transactions - Delete transaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'

/**
 * Record transaction for tax filing
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      transactionId,
      transactionDate,
      amount,
      taxAmount,
      shippingAmount,
      originAddress,
      destinationAddress,
      lineItems,
      customerId,
      provider
    } = body

    // Validate required fields
    if (!transactionId || !amount || taxAmount === undefined || !originAddress || !destinationAddress) {
      return NextResponse.json(
        { error: 'transactionId, amount, taxAmount, originAddress, and destinationAddress are required' },
        { status: 400 }
      )
    }

    // Record transaction
    const result = await taxService.recordTransaction({
      userId: user.id,
      transactionId,
      transactionDate: new Date(transactionDate || Date.now()),
      amount: Math.round(amount),
      taxAmount: Math.round(taxAmount),
      shippingAmount: shippingAmount ? Math.round(shippingAmount) : undefined,
      originAddress,
      destinationAddress,
      lineItems,
      customerId,
      provider
    })

    return NextResponse.json({
      success: true,
      transaction: result
    }, { status: 201 })
  } catch (error) {
    console.error('Record transaction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record transaction' },
      { status: 500 }
    )
  }
}

/**
 * List tax transactions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('tax_calculations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (year) {
      query = query
        .gte('transaction_date', `${year}-01-01`)
        .lte('transaction_date', `${year}-12-31`)
    }

    if (type) {
      query = query.eq('transaction_type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: transactions, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('List transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to list transactions' },
      { status: 500 }
    )
  }
}

/**
 * Delete transaction
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId is required' },
        { status: 400 }
      )
    }

    // Delete transaction
    await taxService.deleteTransaction(user.id, transactionId)

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted'
    })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
