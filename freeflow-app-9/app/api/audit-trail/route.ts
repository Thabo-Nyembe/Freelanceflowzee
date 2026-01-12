/**
 * Audit Trail API Routes
 *
 * REST endpoints for Audit Trail:
 * GET - List audit logs, compliance reports, findings, stats, dashboard
 * POST - Log activity, generate compliance report, add finding, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAuditLogs,
  getCriticalEvents,
  getLogsByActivityType,
  getActivitySummary,
  logActivity,
  getComplianceReports,
  generateComplianceReport,
  getFindingsByReport,
  getFindingsBySeverity,
  addComplianceFinding,
  getAuditDashboard,
  exportAuditLogs,
  exportComplianceReport
} from '@/lib/audit-trail-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'logs'
    const activityType = searchParams.get('activity_type') as any
    const entityType = searchParams.get('entity_type') as any
    const severity = searchParams.get('severity') as any
    const entityId = searchParams.get('entity_id')
    const reportId = searchParams.get('report_id')
    const search = searchParams.get('search')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'json'
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build filters
    const filters: any = {}
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)
    if (activityType) filters.activityTypes = [activityType]
    if (entityType) filters.entityTypes = [entityType]
    if (severity) filters.severityLevels = [severity]
    if (search) filters.searchQuery = search

    switch (type) {
      case 'logs': {
        const data = await getAuditLogs(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined,
          limit
        )
        return NextResponse.json({ data })
      }

      case 'critical-events': {
        const data = await getCriticalEvents(user.id, limit)
        return NextResponse.json({ data })
      }

      case 'by-activity-type': {
        if (!activityType) {
          return NextResponse.json({ error: 'activity_type required' }, { status: 400 })
        }
        const data = await getLogsByActivityType(user.id, activityType, limit)
        return NextResponse.json({ data })
      }

      case 'summary': {
        const data = await getActivitySummary(
          user.id,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json({ data })
      }

      case 'compliance-reports': {
        const data = await getComplianceReports(user.id, limit)
        return NextResponse.json({ data })
      }

      case 'findings': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        let data
        if (severity) {
          data = await getFindingsBySeverity(reportId, severity)
        } else {
          data = await getFindingsByReport(reportId)
        }
        return NextResponse.json({ data })
      }

      case 'dashboard': {
        const data = await getAuditDashboard(user.id)
        return NextResponse.json({ data })
      }

      case 'export-logs': {
        const data = await exportAuditLogs(
          user.id,
          Object.keys(filters).length > 0 ? filters : undefined,
          format
        )
        return NextResponse.json({ data })
      }

      case 'export-report': {
        if (!reportId) {
          return NextResponse.json({ error: 'report_id required' }, { status: 400 })
        }
        const data = await exportComplianceReport(reportId)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Audit Trail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Audit Trail data' },
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
      case 'log-activity': {
        const data = await logActivity({
          user_id: user.id,
          activity_type: payload.activity_type,
          entity_type: payload.entity_type,
          action: payload.action,
          description: payload.description,
          severity: payload.severity,
          entity_id: payload.entity_id,
          entity_name: payload.entity_name,
          ip_address: payload.ip_address,
          user_agent: payload.user_agent,
          location: payload.location,
          changes: payload.changes,
          metadata: payload.metadata
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'generate-compliance-report': {
        const data = await generateComplianceReport(
          user.id,
          payload.name,
          new Date(payload.period_start),
          new Date(payload.period_end)
        )
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'add-finding': {
        const data = await addComplianceFinding({
          report_id: payload.report_id,
          category: payload.category,
          severity: payload.severity,
          title: payload.title,
          description: payload.description,
          recommendation: payload.recommendation,
          affected_count: payload.affected_count
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Audit Trail API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Audit Trail request' },
      { status: 500 }
    )
  }
}
