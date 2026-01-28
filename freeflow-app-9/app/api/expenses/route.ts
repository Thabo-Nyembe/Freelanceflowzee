/**
 * KAZI Platform - Expenses API
 *
 * Full-featured expense management with database integration.
 * Supports expense tracking, categories, approval workflows, and analytics.
 *
 * @module app/api/expenses/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('expenses')

// ============================================================================
// DEMO MODE CONFIGURATION
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// ============================================================================
// TYPES
// ============================================================================

type ExpenseCategory = 'travel' | 'meals' | 'supplies' | 'software' | 'entertainment' | 'accommodation' | 'transportation' | 'communication' | 'training' | 'other'
type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed' | 'cancelled' | 'under-review'

interface Expense {
  id: string
  user_id: string
  expense_title: string
  description: string | null
  expense_category: ExpenseCategory
  amount: number
  currency: string
  tax_amount: number
  total_amount: number
  status: ExpenseStatus
  submitted_by: string | null
  submitted_by_id: string | null
  submitted_at: string | null
  expense_date: string | null
  approved_by: string | null
  approved_by_id: string | null
  approved_at: string | null
  merchant_name: string | null
  department: string | null
  is_billable: boolean
  client_name: string | null
  has_receipt: boolean
  receipt_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface ExpenseAnalytics {
  total_expenses_mtd: number
  total_expenses_ytd: number
  pending_reimbursement: number
  approved_count: number
  pending_count: number
  rejected_count: number
  by_category: { category: string; amount: number; count: number }[]
  by_department: { department: string; amount: number; count: number }[]
  trends: { month: string; amount: number; count: number }[]
}

// ============================================================================
// GET - List Expenses / Get Analytics
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const action = searchParams.get('action') || 'list'
    const expenseId = searchParams.get('id')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const department = searchParams.get('department')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = await createClient()
    const session = await getServerSession()

    // Check for demo mode
    const demoMode = isDemoMode(request)

    // If not authenticated
    if (!session?.user) {
      if (demoMode) {
        // Use demo user ID and fetch from database
        const userId = DEMO_USER_ID

        // Handle different actions for demo mode
        switch (action) {
          case 'analytics':
            return handleGetAnalytics(supabase, userId, true)

          case 'single':
            if (!expenseId) {
              return NextResponse.json(
                { error: 'Expense ID is required' },
                { status: 400 }
              )
            }
            return handleGetSingleExpense(supabase, userId, expenseId, true)

          case 'list':
          default:
            return handleListExpenses(supabase, userId, {
              status,
              category,
              department,
              search,
              sortBy,
              sortOrder,
              page,
              limit
            }, true)
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const userId = (session.user as any).authId || session.user.id
    const userEmail = session.user.email

    // Also check for demo account emails
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
    const effectiveUserId = isDemoAccount ? DEMO_USER_ID : userId

    // Handle different actions
    switch (action) {
      case 'analytics':
        return handleGetAnalytics(supabase, effectiveUserId, isDemoAccount || demoMode)

      case 'single':
        if (!expenseId) {
          return NextResponse.json(
            { error: 'Expense ID is required' },
            { status: 400 }
          )
        }
        return handleGetSingleExpense(supabase, effectiveUserId, expenseId, isDemoAccount || demoMode)

      case 'list':
      default:
        return handleListExpenses(supabase, effectiveUserId, {
          status,
          category,
          department,
          search,
          sortBy,
          sortOrder,
          page,
          limit
        }, isDemoAccount || demoMode)
    }
  } catch (error) {
    logger.error('Expenses GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Expense
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()

    const supabase = await createClient()

    return handleCreateExpense(supabase, userId, body)
  } catch (error) {
    logger.error('Expenses POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Expense
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()
    const { id, action, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Handle special actions
    if (action === 'approve') {
      return handleApproveExpense(supabase, userId, id, updates.approval_notes)
    }

    if (action === 'reject') {
      return handleRejectExpense(supabase, userId, id, updates.rejection_reason)
    }

    if (action === 'reimburse') {
      return handleReimburseExpense(supabase, userId, id, updates.reimbursement_method)
    }

    // Regular update
    return handleUpdateExpense(supabase, userId, id, updates)
  } catch (error) {
    logger.error('Expenses PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Expense
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!expenseId) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('expenses')
      .select('id, expense_title, status')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of draft or rejected expenses
    if (!['draft', 'rejected'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Only draft or rejected expenses can be deleted' },
        { status: 400 }
      )
    }

    if (permanent) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)

      if (error) {
        logger.error('Expense deletion error', { error })
        return NextResponse.json(
          { error: 'Failed to delete expense' },
          { status: 500 }
        )
      }
    } else {
      const { error } = await supabase
        .from('expenses')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', expenseId)

      if (error) {
        logger.error('Expense soft delete error', { error })
        return NextResponse.json(
          { error: 'Failed to delete expense' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Expense "${existing.expense_title}" deleted successfully`
    })
  } catch (error) {
    logger.error('Expenses DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleListExpenses(
  supabase: any,
  userId: string,
  options: {
    status: string | null
    category: string | null
    department: string | null
    search: string | null
    sortBy: string
    sortOrder: string
    page: number
    limit: number
  },
  isDemo: boolean = false
) {
  const { status, category, department, search, sortBy, sortOrder, page, limit } = options

  let query = supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (category && category !== 'all') {
    query = query.eq('expense_category', category)
  }

  if (department && department !== 'all') {
    query = query.eq('department', department)
  }

  if (search) {
    query = query.or(`expense_title.ilike.%${search}%,merchant_name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const ascending = sortOrder === 'asc'
  query = query.order(sortBy, { ascending })

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data: expenses, error, count } = await query

  if (error) {
    logger.error('Expenses query error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    demo: isDemo,
    expenses: expenses || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

async function handleGetSingleExpense(
  supabase: any,
  userId: string,
  expenseId: string,
  isDemo: boolean = false
) {
  const { data: expense, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (error || !expense) {
    return NextResponse.json(
      { error: 'Expense not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    demo: isDemo,
    expense
  })
}

async function handleGetAnalytics(
  supabase: any,
  userId: string,
  isDemo: boolean = false
) {
  try {
    // Get all expenses for the user
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      logger.error('Expenses analytics error', { error })
      return NextResponse.json(
        { error: 'Failed to load analytics' },
        { status: 500 }
      )
    }

    const allExpenses = expenses || []
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate MTD
    const mtdExpenses = allExpenses.filter(e => {
      const expenseDate = new Date(e.expense_date || e.created_at)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    const totalExpensesMtd = mtdExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0)

    // Calculate YTD
    const ytdExpenses = allExpenses.filter(e => {
      const expenseDate = new Date(e.expense_date || e.created_at)
      return expenseDate.getFullYear() === currentYear
    })
    const totalExpensesYtd = ytdExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0)

    // Pending reimbursement
    const pendingReimbursement = allExpenses
      .filter(e => e.status === 'approved' && !e.reimbursed)
      .reduce((sum, e) => sum + (e.total_amount || 0), 0)

    // Status counts
    const approvedCount = allExpenses.filter(e => e.status === 'approved').length
    const pendingCount = allExpenses.filter(e => e.status === 'pending').length
    const rejectedCount = allExpenses.filter(e => e.status === 'rejected').length

    // By category
    const categoryMap = new Map<string, { amount: number; count: number }>()
    for (const expense of allExpenses) {
      const cat = expense.expense_category || 'other'
      const existing = categoryMap.get(cat) || { amount: 0, count: 0 }
      categoryMap.set(cat, {
        amount: existing.amount + (expense.total_amount || 0),
        count: existing.count + 1
      })
    }
    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    }))

    // By department
    const deptMap = new Map<string, { amount: number; count: number }>()
    for (const expense of allExpenses) {
      const dept = expense.department || 'General'
      const existing = deptMap.get(dept) || { amount: 0, count: 0 }
      deptMap.set(dept, {
        amount: existing.amount + (expense.total_amount || 0),
        count: existing.count + 1
      })
    }
    const byDepartment = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      ...data
    }))

    // Monthly trends (last 6 months)
    const monthlyData = new Map<string, { amount: number; count: number }>()
    for (const expense of allExpenses) {
      const date = new Date(expense.expense_date || expense.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = monthlyData.get(monthKey) || { amount: 0, count: 0 }
      monthlyData.set(monthKey, {
        amount: existing.amount + (expense.total_amount || 0),
        count: existing.count + 1
      })
    }
    const trends = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, data]) => ({
        month,
        ...data
      }))

    const analytics: ExpenseAnalytics = {
      total_expenses_mtd: totalExpensesMtd,
      total_expenses_ytd: totalExpensesYtd,
      pending_reimbursement: pendingReimbursement,
      approved_count: approvedCount,
      pending_count: pendingCount,
      rejected_count: rejectedCount,
      by_category: byCategory,
      by_department: byDepartment,
      trends
    }

    return NextResponse.json({
      success: true,
      demo: isDemo,
      analytics,
      message: isDemo ? 'Demo analytics data - sign in for real data' : 'Analytics loaded successfully'
    })
  } catch (error) {
    logger.error('Analytics error', { error })
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    )
  }
}

async function handleCreateExpense(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    expense_title,
    description,
    expense_category = 'other',
    amount,
    currency = 'USD',
    tax_amount = 0,
    expense_date,
    merchant_name,
    department,
    is_billable = false
  } = body

  if (!expense_title) {
    return NextResponse.json(
      { error: 'Expense title is required' },
      { status: 400 }
    )
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'Valid amount is required' },
      { status: 400 }
    )
  }

  const totalAmount = (amount as number) + (tax_amount as number)

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      expense_title,
      description: description || null,
      expense_category,
      amount,
      currency,
      tax_amount,
      total_amount: totalAmount,
      status: 'draft',
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      merchant_name: merchant_name || null,
      department: department || null,
      is_billable,
      has_receipt: false,
      reimbursed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Expense creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    expense,
    message: 'Expense created successfully'
  }, { status: 201 })
}

async function handleUpdateExpense(
  supabase: any,
  userId: string,
  expenseId: string,
  updates: Record<string, unknown>
) {
  // Verify ownership
  const { data: existing } = await supabase
    .from('expenses')
    .select('id, status')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Expense not found' },
      { status: 404 }
    )
  }

  // Only allow updates for draft expenses
  if (existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft expenses can be edited' },
      { status: 400 }
    )
  }

  const allowedFields = [
    'expense_title', 'description', 'expense_category', 'amount',
    'currency', 'tax_amount', 'expense_date', 'merchant_name',
    'department', 'is_billable', 'receipt_url', 'has_receipt'
  ]

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field]
    }
  }

  // Recalculate total if amount or tax changed
  if (updates.amount !== undefined || updates.tax_amount !== undefined) {
    const amount = (updates.amount as number) || existing.amount
    const taxAmount = (updates.tax_amount as number) || 0
    updateData.total_amount = amount + taxAmount
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', expenseId)
    .select()
    .single()

  if (error) {
    logger.error('Expense update error', { error })
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    expense,
    message: 'Expense updated successfully'
  })
}

async function handleApproveExpense(
  supabase: any,
  userId: string,
  expenseId: string,
  approvalNotes?: string
) {
  const { data: existing } = await supabase
    .from('expenses')
    .select('id, status, expense_title')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Expense not found' },
      { status: 404 }
    )
  }

  if (!['draft', 'pending'].includes(existing.status)) {
    return NextResponse.json(
      { error: 'Only draft or pending expenses can be approved' },
      { status: 400 }
    )
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      status: 'approved',
      approved_by_id: userId,
      approved_at: new Date().toISOString(),
      approval_notes: approvalNotes || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', expenseId)
    .select()
    .single()

  if (error) {
    logger.error('Expense approval error', { error })
    return NextResponse.json(
      { error: 'Failed to approve expense' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    expense,
    message: `Expense "${existing.expense_title}" approved successfully`
  })
}

async function handleRejectExpense(
  supabase: any,
  userId: string,
  expenseId: string,
  rejectionReason?: string
) {
  const { data: existing } = await supabase
    .from('expenses')
    .select('id, status, expense_title')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Expense not found' },
      { status: 404 }
    )
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      status: 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', expenseId)
    .select()
    .single()

  if (error) {
    logger.error('Expense rejection error', { error })
    return NextResponse.json(
      { error: 'Failed to reject expense' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    expense,
    message: `Expense "${existing.expense_title}" rejected`
  })
}

async function handleReimburseExpense(
  supabase: any,
  userId: string,
  expenseId: string,
  reimbursementMethod?: string
) {
  const { data: existing } = await supabase
    .from('expenses')
    .select('id, status, expense_title, total_amount')
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Expense not found' },
      { status: 404 }
    )
  }

  if (existing.status !== 'approved') {
    return NextResponse.json(
      { error: 'Only approved expenses can be reimbursed' },
      { status: 400 }
    )
  }

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      status: 'reimbursed',
      reimbursed: true,
      reimbursed_at: new Date().toISOString(),
      reimbursed_amount: existing.total_amount,
      reimbursement_method: reimbursementMethod || 'bank_transfer',
      payment_status: 'paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', expenseId)
    .select()
    .single()

  if (error) {
    logger.error('Expense reimbursement error', { error })
    return NextResponse.json(
      { error: 'Failed to reimburse expense' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    expense,
    message: `Expense "${existing.expense_title}" reimbursed successfully`
  })
}
