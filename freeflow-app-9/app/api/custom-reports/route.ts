/**
 * Custom Reports API Routes
 *
 * REST endpoints for Custom Reports:
 * GET - List reports, templates, widgets, filters, shares, schedules, exports, stats
 * POST - Create report, widget, filter, share, schedule, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('custom-reports')
import {
  getCustomReports,
  createCustomReport,
  getReportTemplates,
  getPopularTemplates,
  getReportWidgets,
  createReportWidget,
  getReportFilters,
  createReportFilter,
  getReportShares,
  createReportShare,
  getReportSchedules,
  createReportSchedule,
  getReportExports,
  createReportExport,
  getCustomReportsStats
} from '@/lib/custom-reports-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'reports'
    const reportId = searchParams.get('report_id')
    const reportType = searchParams.get('report_type') as string | null
    const status = searchParams.get('status') as string | null
    const isFavorite = searchParams.get('is_favorite')
    const category = searchParams.get('category')
    const isPublic = searchParams.get('is_public')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    switch (type) {
      case 'reports': {
        const filters: any = {}
        if (reportType) filters.type = reportType
        if (status) filters.status = status
        if (isFavorite !== null && isFavorite !== undefined) {
          filters.is_favorite = isFavorite === 'true'
        }
        const result = await getCustomReports(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'templates': {
        const filters: any = {}
        if (reportType) filters.type = reportType
        if (category) filters.category = category
        if (isPublic !== null && isPublic !== undefined) {
          filters.is_public = isPublic === 'true'
        }
        const result = await getReportTemplates(
          Object.keys(filters).length > 0 ? filters : undefined
        )
        return NextResponse.json({ data: result.data })
      }

      case 'popular-templates': {
        const result = await getPopularTemplates(limit || 5)
        return NextResponse.json({ data: result.data })
      }

      case 'widgets': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        const result = await getReportWidgets(reportId)
        return NextResponse.json({ data: result.data })
      }

      case 'filters': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        const result = await getReportFilters(reportId)
        return NextResponse.json({ data: result.data })
      }

      case 'shares': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        const result = await getReportShares(reportId)
        return NextResponse.json({ data: result.data })
      }

      case 'schedules': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        const result = await getReportSchedules(reportId)
        return NextResponse.json({ data: result.data })
      }

      case 'exports': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        const result = await getReportExports(reportId)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getCustomReportsStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Custom Reports data' },
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
        const result = await createCustomReport(user.id, {
          name: payload.name,
          description: payload.description,
          type: payload.type,
          status: payload.status,
          date_range_start: payload.date_range_start,
          date_range_end: payload.date_range_end,
          settings: payload.settings
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-widget': {
        const result = await createReportWidget(payload.report_id, {
          type: payload.type,
          title: payload.title,
          description: payload.description,
          position_x: payload.position_x,
          position_y: payload.position_y,
          width: payload.width,
          height: payload.height,
          chart_type: payload.chart_type,
          data_source: payload.data_source,
          data_fields: payload.data_fields,
          aggregation: payload.aggregation,
          group_by: payload.group_by,
          settings: payload.settings,
          widget_order: payload.widget_order
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-filter': {
        const result = await createReportFilter({
          report_id: payload.report_id,
          widget_id: payload.widget_id,
          field: payload.field,
          operator: payload.operator,
          value: payload.value,
          is_active: payload.is_active ?? true
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-share': {
        const result = await createReportShare({
          report_id: payload.report_id,
          shared_by: user.id,
          shared_with: payload.shared_with,
          share_token: payload.share_token,
          expires_at: payload.expires_at,
          can_edit: payload.can_edit,
          can_export: payload.can_export
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-schedule': {
        const result = await createReportSchedule({
          report_id: payload.report_id,
          user_id: user.id,
          frequency: payload.frequency,
          export_format: payload.export_format,
          recipients: payload.recipients,
          is_active: payload.is_active ?? true,
          next_run_at: payload.next_run_at
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-export': {
        const result = await createReportExport(user.id, payload.report_id, payload.format)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process request', { error })
    return NextResponse.json(
      { error: 'Failed to process Custom Reports request' },
      { status: 500 }
    )
  }
}
