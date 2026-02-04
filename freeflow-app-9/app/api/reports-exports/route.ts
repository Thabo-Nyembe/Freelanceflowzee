/**
 * Reports & Exports API Routes
 *
 * REST endpoints for Reports & Exports:
 * GET - Reports, scheduled reports, exports, time entries, expenses
 * POST - Create report, scheduled report, export, time entry, expense
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('reports-exports')
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
  getReports,
  createReport,
  getScheduledReports,
  createScheduledReport,
  getExports,
  createExport,
  getTimeEntries,
  createTimeEntry,
  getExpenses,
  createExpense
} from '@/lib/reports-exports-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'reports'
    const reportType = searchParams.get('report_type') as string | null
    const isTemplate = searchParams.get('is_template')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const projectId = searchParams.get('project_id')
    const clientId = searchParams.get('client_id')
    const category = searchParams.get('category')
    const isBillable = searchParams.get('is_billable')
    const isReimbursable = searchParams.get('is_reimbursable')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    switch (type) {
      case 'reports': {
        const options: any = { limit, offset }
        if (reportType) options.type = reportType
        if (isTemplate !== null) options.isTemplate = isTemplate === 'true'
        if (search) options.search = search
        const result = await getReports(user.id, options)
        return NextResponse.json({ data: result.reports, total: result.total })
      }

      case 'scheduled-reports': {
        const result = await getScheduledReports(user.id)
        return NextResponse.json({ data: result })
      }

      case 'exports': {
        const options: any = {}
        if (limit) options.limit = limit
        if (status) options.status = status
        const result = await getExports(user.id, options)
        return NextResponse.json({ data: result })
      }

      case 'time-entries': {
        const options: any = {}
        if (projectId) options.projectId = projectId
        if (startDate) options.startDate = new Date(startDate)
        if (endDate) options.endDate = new Date(endDate)
        if (isBillable !== null) options.isBillable = isBillable === 'true'
        if (limit) options.limit = limit
        const result = await getTimeEntries(user.id, options)
        return NextResponse.json({ data: result })
      }

      case 'expenses': {
        const options: any = {}
        if (projectId) options.projectId = projectId
        if (clientId) options.clientId = clientId
        if (category) options.category = category
        if (startDate) options.startDate = new Date(startDate)
        if (endDate) options.endDate = new Date(endDate)
        if (isReimbursable !== null) options.isReimbursable = isReimbursable === 'true'
        if (limit) options.limit = limit
        const result = await getExpenses(user.id, options)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Reports Exports data' },
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
      case 'create-report': {
        const result = await createReport({ ...payload, user_id: user.id })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-scheduled-report': {
        const result = await createScheduledReport({ ...payload, user_id: user.id })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-export': {
        const result = await createExport(user.id, payload.type, payload.format, payload.report_id)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-time-entry': {
        const result = await createTimeEntry({ ...payload, user_id: user.id })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-expense': {
        const result = await createExpense({ ...payload, user_id: user.id })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to process Reports Exports request' },
      { status: 500 }
    )
  }
}
