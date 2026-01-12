/**
 * Reports & Exports API - Single Resource Routes
 *
 * GET - Get single report, generate report
 * PUT - Update report, scheduled report, export status, time entry, expense
 * DELETE - Delete report, scheduled report, time entry, expense, duplicate report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getReportById,
  updateReport,
  deleteReport,
  duplicateReport,
  generateReport,
  updateScheduledReport,
  deleteScheduledReport,
  updateExportStatus,
  updateTimeEntry,
  deleteTimeEntry,
  updateExpense,
  deleteExpense
} from '@/lib/reports-exports-queries'

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
    const type = searchParams.get('type') || 'report'

    switch (type) {
      case 'report': {
        const result = await getReportById(id)
        if (!result) {
          return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'generate': {
        const result = await generateReport(id)
        if (!result) {
          return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
        }
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reports Exports API error:', error)
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
      case 'report': {
        if (action === 'duplicate') {
          const result = await duplicateReport(id, user.id)
          return NextResponse.json({ data: result })
        } else {
          const result = await updateReport(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'scheduled-report': {
        const result = await updateScheduledReport(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'export': {
        const result = await updateExportStatus(id, updates.status, updates)
        return NextResponse.json({ data: { success: result } })
      }

      case 'time-entry': {
        const result = await updateTimeEntry(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'expense': {
        const result = await updateExpense(id, updates)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reports Exports API error:', error)
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
    const type = searchParams.get('type') || 'report'

    switch (type) {
      case 'report': {
        const result = await deleteReport(id)
        return NextResponse.json({ success: result })
      }

      case 'scheduled-report': {
        const result = await deleteScheduledReport(id)
        return NextResponse.json({ success: result })
      }

      case 'time-entry': {
        const result = await deleteTimeEntry(id)
        return NextResponse.json({ success: result })
      }

      case 'expense': {
        const result = await deleteExpense(id)
        return NextResponse.json({ success: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reports Exports API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
