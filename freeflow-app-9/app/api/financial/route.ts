/**
 * Financial API Routes
 *
 * REST endpoints for Financial Management:
 * GET - List transactions, insights, goals, invoices, overview, analytics
 * POST - Create transaction, insight, goal, invoice
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTransactions,
  createTransaction,
  getFinancialOverview,
  getCategoryBreakdown,
  getMonthlyTrend,
  getFinancialInsights,
  createFinancialInsight,
  getFinancialGoals,
  createFinancialGoal,
  getInvoices,
  createInvoice
} from '@/lib/financial-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'transactions'
    const transactionType = searchParams.get('transaction_type') as any
    const category = searchParams.get('category') as any
    const status = searchParams.get('status') as any
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const search = searchParams.get('search')
    const insightType = searchParams.get('insight_type') as any
    const impact = searchParams.get('impact') as any
    const goalType = searchParams.get('goal_type')
    const clientName = searchParams.get('client_name')
    const months = parseInt(searchParams.get('months') || '6')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    switch (type) {
      case 'transactions': {
        const filters: any = {}
        if (transactionType) filters.type = transactionType
        if (category) filters.category = category
        if (status) filters.status = status
        if (startDate) filters.startDate = startDate
        if (endDate) filters.endDate = endDate
        if (search) filters.search = search
        const result = await getTransactions(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'overview': {
        const result = await getFinancialOverview(
          user.id,
          startDate || undefined,
          endDate || undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'category-breakdown': {
        if (!transactionType) {
          return NextResponse.json({ error: 'transaction_type required' }, { status: 400 })
        }
        const result = await getCategoryBreakdown(
          user.id,
          transactionType,
          startDate || undefined,
          endDate || undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'monthly-trend': {
        const result = await getMonthlyTrend(user.id, months)
        return NextResponse.json({ data: result.data })
      }

      case 'insights': {
        const filters: any = {}
        if (insightType) filters.type = insightType
        if (impact) filters.impact = impact
        if (status) filters.status = status
        const result = await getFinancialInsights(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'goals': {
        const filters: any = {}
        if (status) filters.status = status
        if (goalType) filters.goal_type = goalType
        const result = await getFinancialGoals(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'invoices': {
        const filters: any = {}
        if (status) filters.status = status
        if (clientName) filters.clientName = clientName
        if (startDate) filters.startDate = startDate
        if (endDate) filters.endDate = endDate
        if (limit) filters.limit = limit
        const result = await getInvoices(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Financial API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Financial data' },
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
      case 'create-transaction': {
        const result = await createTransaction(user.id, {
          type: payload.type,
          category: payload.category,
          description: payload.description,
          amount: payload.amount,
          currency: payload.currency,
          transaction_date: payload.transaction_date,
          client_id: payload.client_id,
          client_name: payload.client_name,
          project_id: payload.project_id,
          project_name: payload.project_name,
          vendor_name: payload.vendor_name,
          invoice_id: payload.invoice_id,
          invoice_number: payload.invoice_number,
          status: payload.status,
          payment_method: payload.payment_method,
          is_recurring: payload.is_recurring,
          recurring_frequency: payload.recurring_frequency,
          next_due_date: payload.next_due_date,
          tags: payload.tags,
          notes: payload.notes,
          receipt_url: payload.receipt_url
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-insight': {
        const result = await createFinancialInsight(user.id, {
          type: payload.type,
          title: payload.title,
          description: payload.description,
          impact: payload.impact,
          potential_value: payload.potential_value,
          confidence: payload.confidence,
          is_actionable: payload.is_actionable,
          category: payload.category,
          action_steps: payload.action_steps
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-goal': {
        const result = await createFinancialGoal(user.id, {
          name: payload.name,
          description: payload.description,
          goal_type: payload.goal_type,
          target_amount: payload.target_amount,
          current_amount: payload.current_amount,
          start_date: payload.start_date,
          target_date: payload.target_date
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-invoice': {
        const result = await createInvoice(user.id, {
          client_name: payload.client_name,
          client_email: payload.client_email,
          amount: payload.amount,
          currency: payload.currency,
          due_date: payload.due_date,
          description: payload.description,
          line_items: payload.line_items,
          tax_rate: payload.tax_rate,
          discount: payload.discount,
          status: payload.status
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Financial API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Financial request' },
      { status: 500 }
    )
  }
}
