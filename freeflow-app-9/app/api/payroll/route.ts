/**
 * KAZI Platform - Comprehensive Payroll API
 *
 * Full-featured payroll management with database integration.
 * Supports pay runs, approvals, analytics, and processing.
 *
 * @module app/api/payroll/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'

// ============================================================================
// TYPES
// ============================================================================

interface PayrollRun {
  id: string
  user_id: string
  run_code: string
  period: string
  pay_date: string
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'
  total_employees: number
  total_amount: number
  processed_count: number
  pending_count: number
  failed_count: number
  department: string | null
  approved_by: string | null
  approved_date: string | null
  currency: string
  notes: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface PayrollAnalytics {
  total_payroll_ytd: number
  total_employees: number
  average_salary: number
  monthly_gross: number
  monthly_taxes: number
  monthly_deductions: number
  pay_runs_completed: number
  pay_runs_pending: number
  tax_compliance_rate: number
  on_time_payments_rate: number
  trends: {
    month: string
    gross: number
    net: number
    taxes: number
  }[]
}

interface ApprovalQueueItem {
  id: string
  run_code: string
  period: string
  pay_date: string
  total_employees: number
  total_amount: number
  department: string | null
  created_at: string
  status: string
  requested_by: string | null
}


// ============================================================================
// GET - List Pay Runs / Get Analytics / Approval Queue
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const action = searchParams.get('action') || 'list'
    const runId = searchParams.get('id')
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = await createClient()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return handleDemoResponse(action)
    }

    const userId = session.user.id

    // Handle different actions
    switch (action) {
      case 'approval-queue':
        return handleGetApprovalQueue(supabase, userId)

      case 'analytics':
        return handleGetAnalytics(supabase, userId)

      case 'single':
        if (!runId) {
          return NextResponse.json(
            { error: 'Pay run ID is required' },
            { status: 400 }
          )
        }
        return handleGetSinglePayRun(supabase, userId, runId)

      case 'list':
      default:
        return handleListPayRuns(supabase, userId, {
          status,
          department,
          search,
          sortBy,
          sortOrder,
          page,
          limit
        })
    }
  } catch (error) {
    console.error('Payroll GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Pay Run / Handle Actions
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

    const userId = session.user.id
    const body = await request.json()
    const { action = 'create' } = body

    const supabase = await createClient()

    // Handle different actions
    switch (action) {
      case 'create':
        return handleCreatePayRun(supabase, userId, body)

      case 'approve':
        return handleApprovePayRun(supabase, userId, body)

      case 'reject':
        return handleRejectPayRun(supabase, userId, body)

      case 'process':
        return handleProcessPayRun(supabase, userId, body)

      case 'cancel':
        return handleCancelPayRun(supabase, userId, body)

      case 'export':
        return handleExportPayroll(supabase, userId, body)

      case 'import':
        return handleImportPayroll(supabase, userId, body)

      default:
        return handleCreatePayRun(supabase, userId, body)
    }
  } catch (error) {
    console.error('Payroll POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Pay Run
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

    const userId = session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Pay run ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('payroll_runs')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Pay run not found' },
        { status: 404 }
      )
    }

    // Only allow updates for draft pay runs
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft pay runs can be edited' },
        { status: 400 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'period', 'pay_date', 'total_employees', 'total_amount',
      'department', 'notes', 'configuration'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Update pay run
    const { data: payRun, error } = await supabase
      .from('payroll_runs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Pay run update error:', error)
      return NextResponse.json(
        { error: 'Failed to update pay run' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payroll_run: payRun,
      message: 'Pay run updated successfully'
    })
  } catch (error) {
    console.error('Payroll PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Pay Run
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

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!runId) {
      return NextResponse.json(
        { error: 'Pay run ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership and status
    const { data: existing } = await supabase
      .from('payroll_runs')
      .select('id, status, period')
      .eq('id', runId)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Pay run not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of draft or cancelled runs
    if (!['draft', 'cancelled'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Only draft or cancelled pay runs can be deleted' },
        { status: 400 }
      )
    }

    if (permanent) {
      const { error } = await supabase
        .from('payroll_runs')
        .delete()
        .eq('id', runId)

      if (error) {
        console.error('Pay run deletion error:', error)
        return NextResponse.json(
          { error: 'Failed to delete pay run' },
          { status: 500 }
        )
      }
    } else {
      const { error } = await supabase
        .from('payroll_runs')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', runId)

      if (error) {
        console.error('Pay run soft delete error:', error)
        return NextResponse.json(
          { error: 'Failed to delete pay run' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pay run "${existing.period}" deleted successfully`
    })
  } catch (error) {
    console.error('Payroll DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleGetApprovalQueue(
  supabase: any,
  userId: string
) {
  try {
    const { data: pendingRuns, error } = await supabase
      .from('payroll_runs')
      .select('id, run_code, period, pay_date, total_employees, total_amount, department, created_at, status')
      .eq('user_id', userId)
      .in('status', ['pending_approval', 'draft'])
      .is('deleted_at', null)
      .order('pay_date', { ascending: true })

    if (error) {
      console.error('Approval queue error:', error)
      return NextResponse.json(
        { error: 'Failed to load approval queue' },
        { status: 500 }
      )
    }

    const queue: ApprovalQueueItem[] = (pendingRuns || []).map(run => ({
      ...run,
      requested_by: null // Could be expanded to include requester info
    }))

    return NextResponse.json({
      success: true,
      approval_queue: queue,
      total_pending: queue.length,
      total_amount_pending: queue.reduce((sum, item) => sum + (item.total_amount || 0), 0),
      message: queue.length > 0
        ? `${queue.length} pay run(s) pending approval`
        : 'No pay runs pending approval'
    })
  } catch (error) {
    console.error('Approval queue error:', error)
    return NextResponse.json(
      { error: 'Failed to load approval queue' },
      { status: 500 }
    )
  }
}

async function handleGetAnalytics(
  supabase: any,
  userId: string
) {
  try {
    // Get all pay runs for the user
    const { data: payRuns, error } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      console.error('Analytics error:', error)
      return NextResponse.json(
        { error: 'Failed to load analytics' },
        { status: 500 }
      )
    }

    const runs = payRuns || []
    const completedRuns = runs.filter(r => r.status === 'completed')
    const pendingRuns = runs.filter(r => ['draft', 'pending_approval', 'approved', 'processing'].includes(r.status))

    // Calculate totals
    const totalPayrollYtd = completedRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0)
    const totalEmployees = Math.max(...runs.map(r => r.total_employees || 0), 0)

    // Calculate monthly averages (last 12 months)
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const recentRuns = completedRuns.filter(r => new Date(r.pay_date) >= twelveMonthsAgo)

    const monthlyGross = recentRuns.length > 0
      ? recentRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0) / Math.min(recentRuns.length, 12)
      : 0

    // Calculate trends (group by month)
    const monthlyData = new Map<string, { gross: number; net: number; taxes: number }>()

    for (const run of recentRuns) {
      const date = new Date(run.pay_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const existing = monthlyData.get(monthKey) || { gross: 0, net: 0, taxes: 0 }
      monthlyData.set(monthKey, {
        gross: existing.gross + (run.total_amount || 0),
        net: existing.net + (run.total_amount || 0) * 0.7, // Estimate 70% net
        taxes: existing.taxes + (run.total_amount || 0) * 0.22 // Estimate 22% taxes
      })
    }

    const trends = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        ...data
      }))

    const analytics: PayrollAnalytics = {
      total_payroll_ytd: totalPayrollYtd,
      total_employees: totalEmployees,
      average_salary: totalEmployees > 0 ? Math.round(totalPayrollYtd / totalEmployees / 12) : 0,
      monthly_gross: Math.round(monthlyGross),
      monthly_taxes: Math.round(monthlyGross * 0.22),
      monthly_deductions: Math.round(monthlyGross * 0.08),
      pay_runs_completed: completedRuns.length,
      pay_runs_pending: pendingRuns.length,
      tax_compliance_rate: 98.5, // Could be calculated from actual tax filing data
      on_time_payments_rate: 99.2, // Could be calculated from payment history
      trends
    }

    return NextResponse.json({
      success: true,
      analytics,
      message: 'Payroll analytics loaded successfully'
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    )
  }
}

async function handleGetSinglePayRun(
  supabase: any,
  userId: string,
  runId: string
) {
  const { data: payRun, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()

  if (error || !payRun) {
    return NextResponse.json(
      { error: 'Pay run not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_run: payRun
  })
}

async function handleListPayRuns(
  supabase: any,
  userId: string,
  options: {
    status: string | null
    department: string | null
    search: string | null
    sortBy: string
    sortOrder: string
    page: number
    limit: number
  }
) {
  const { status, department, search, sortBy, sortOrder, page, limit } = options

  let query = supabase
    .from('payroll_runs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (department) {
    query = query.eq('department', department)
  }

  if (search) {
    query = query.or(`period.ilike.%${search}%,run_code.ilike.%${search}%`)
  }

  const ascending = sortOrder === 'asc'
  query = query.order(sortBy, { ascending })

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data: payRuns, error, count } = await query

  if (error) {
    console.error('Pay runs query error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pay runs' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_runs: payRuns || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

async function handleCreatePayRun(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    period,
    pay_date,
    total_employees = 0,
    total_amount = 0,
    department,
    notes,
    configuration = {}
  } = body

  if (!period) {
    return NextResponse.json(
      { error: 'Period is required' },
      { status: 400 }
    )
  }

  if (!pay_date) {
    return NextResponse.json(
      { error: 'Pay date is required' },
      { status: 400 }
    )
  }

  // Generate unique run code
  const runCode = `PR-${Date.now().toString(36).toUpperCase()}`

  const { data: payRun, error } = await supabase
    .from('payroll_runs')
    .insert({
      user_id: userId,
      run_code: runCode,
      period,
      pay_date,
      status: 'draft',
      total_employees,
      total_amount,
      processed_count: 0,
      pending_count: total_employees,
      failed_count: 0,
      department: department || null,
      notes: notes || null,
      currency: 'USD',
      configuration: configuration || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Pay run creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create pay run' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_run: payRun,
    message: 'Pay run created successfully'
  }, { status: 201 })
}

async function handleApprovePayRun(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { id } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Pay run ID is required' },
      { status: 400 }
    )
  }

  // Verify ownership and status
  const { data: existing } = await supabase
    .from('payroll_runs')
    .select('id, status, period')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Pay run not found' },
      { status: 404 }
    )
  }

  if (!['draft', 'pending_approval'].includes(existing.status)) {
    return NextResponse.json(
      { error: 'Only draft or pending approval pay runs can be approved' },
      { status: 400 }
    )
  }

  // Get user email for approved_by field
  const { data: { user } } = await supabase.auth.getUser()

  const { data: payRun, error } = await supabase
    .from('payroll_runs')
    .update({
      status: 'approved',
      approved_by: user?.email || 'System',
      approved_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Pay run approval error:', error)
    return NextResponse.json(
      { error: 'Failed to approve pay run' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_run: payRun,
    message: `Pay run "${existing.period}" approved successfully`
  })
}

async function handleRejectPayRun(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { id, reason } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Pay run ID is required' },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('payroll_runs')
    .select('id, status, period, notes')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Pay run not found' },
      { status: 404 }
    )
  }

  const updatedNotes = reason
    ? `${existing.notes || ''}\n[Rejected: ${reason}]`.trim()
    : existing.notes

  const { data: payRun, error } = await supabase
    .from('payroll_runs')
    .update({
      status: 'draft',
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Pay run rejection error:', error)
    return NextResponse.json(
      { error: 'Failed to reject pay run' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_run: payRun,
    message: `Pay run "${existing.period}" rejected and returned to draft`
  })
}

async function handleProcessPayRun(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { id } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Pay run ID is required' },
      { status: 400 }
    )
  }

  // Verify ownership and status
  const { data: existing } = await supabase
    .from('payroll_runs')
    .select('id, status, period, total_employees')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Pay run not found' },
      { status: 404 }
    )
  }

  if (existing.status !== 'approved') {
    return NextResponse.json(
      { error: 'Only approved pay runs can be processed' },
      { status: 400 }
    )
  }

  // Start processing (in a real system, this would trigger a background job)
  const { data: payRun, error } = await supabase
    .from('payroll_runs')
    .update({
      status: 'processing',
      processed_count: Math.floor((existing.total_employees || 0) * 0.5),
      pending_count: Math.ceil((existing.total_employees || 0) * 0.5),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Pay run processing error:', error)
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_run: payRun,
    message: `Processing started for "${existing.period}"`
  })
}

async function handleCancelPayRun(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { id, reason } = body

  if (!id) {
    return NextResponse.json(
      { error: 'Pay run ID is required' },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('payroll_runs')
    .select('id, status, period, notes')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Pay run not found' },
      { status: 404 }
    )
  }

  // Cannot cancel completed or already cancelled runs
  if (['completed', 'cancelled'].includes(existing.status)) {
    return NextResponse.json(
      { error: 'Cannot cancel completed or already cancelled pay runs' },
      { status: 400 }
    )
  }

  const updatedNotes = reason
    ? `${existing.notes || ''}\n[Cancelled: ${reason}]`.trim()
    : existing.notes

  const { data: payRun, error } = await supabase
    .from('payroll_runs')
    .update({
      status: 'cancelled',
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Pay run cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel pay run' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    payroll_run: payRun,
    message: `Pay run "${existing.period}" cancelled`
  })
}

async function handleExportPayroll(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { format = 'json', run_ids, include_details = false } = body

  let query = supabase
    .from('payroll_runs')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (Array.isArray(run_ids) && run_ids.length > 0) {
    query = query.in('id', run_ids)
  }

  const { data: payRuns, error } = await query

  if (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export payroll data' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    format,
    count: payRuns?.length || 0,
    data: payRuns,
    message: `Exported ${payRuns?.length || 0} payroll records`
  })
}

async function handleImportPayroll(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { payroll_data } = body

  if (!Array.isArray(payroll_data) || payroll_data.length === 0) {
    return NextResponse.json(
      { error: 'Payroll data is required' },
      { status: 400 }
    )
  }

  let imported = 0
  const errors: string[] = []

  for (const data of payroll_data) {
    try {
      const runCode = `PR-IMP-${Date.now().toString(36).toUpperCase()}`

      await supabase.from('payroll_runs').insert({
        user_id: userId,
        run_code: runCode,
        period: data.period,
        pay_date: data.pay_date,
        status: 'draft',
        total_employees: data.total_employees || 0,
        total_amount: data.total_amount || 0,
        processed_count: 0,
        pending_count: data.total_employees || 0,
        failed_count: 0,
        department: data.department || null,
        notes: data.notes || null,
        currency: data.currency || 'USD',
        configuration: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      imported++
    } catch (err) {
      errors.push(`Failed to import ${data.period || 'unknown'}: ${err}`)
    }
  }

  return NextResponse.json({
    success: true,
    imported,
    errors: errors.length > 0 ? errors : undefined,
    message: `Imported ${imported} payroll records`
  })
}

// ============================================================================
// DEMO RESPONSE
// ============================================================================

function handleDemoResponse(action: string) {
  const demoAnalytics: PayrollAnalytics = {
    total_payroll_ytd: 1648000,
    total_employees: 158,
    average_salary: 115000,
    monthly_gross: 977000,
    monthly_taxes: 218000,
    monthly_deductions: 70000,
    pay_runs_completed: 12,
    pay_runs_pending: 3,
    tax_compliance_rate: 98.5,
    on_time_payments_rate: 99.2,
    trends: [
      { month: '2024-07', gross: 450000, net: 315000, taxes: 99000 },
      { month: '2024-08', gross: 465000, net: 325500, taxes: 102300 },
      { month: '2024-09', gross: 478000, net: 334600, taxes: 105160 },
      { month: '2024-10', gross: 485000, net: 339500, taxes: 106700 },
      { month: '2024-11', gross: 492000, net: 344400, taxes: 108240 },
      { month: '2024-12', gross: 977000, net: 683900, taxes: 214940 }
    ]
  }

  const demoApprovalQueue: ApprovalQueueItem[] = [
    {
      id: 'demo-1',
      run_code: 'PR-DEMO1',
      period: 'December 16-31, 2024',
      pay_date: '2024-12-31',
      total_employees: 158,
      total_amount: 492000,
      department: null,
      created_at: new Date().toISOString(),
      status: 'pending_approval',
      requested_by: 'demo@example.com'
    },
    {
      id: 'demo-2',
      run_code: 'PR-DEMO2',
      period: 'Contractor Payments - December',
      pay_date: '2024-12-28',
      total_employees: 12,
      total_amount: 68000,
      department: 'Contractors',
      created_at: new Date().toISOString(),
      status: 'draft',
      requested_by: 'demo@example.com'
    }
  ]

  switch (action) {
    case 'analytics':
      return NextResponse.json({
        success: true,
        demo: true,
        analytics: demoAnalytics,
        message: 'Demo analytics data - sign in for real data'
      })

    case 'approval-queue':
      return NextResponse.json({
        success: true,
        demo: true,
        approval_queue: demoApprovalQueue,
        total_pending: demoApprovalQueue.length,
        total_amount_pending: demoApprovalQueue.reduce((sum, item) => sum + item.total_amount, 0),
        message: 'Demo approval queue - sign in for real data'
      })

    default:
      return NextResponse.json({
        success: true,
        demo: true,
        payroll_runs: [],
        message: 'Sign in to access your payroll data'
      })
  }
}
