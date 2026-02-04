/**
 * KAZI Audit Log API
 *
 * API endpoints for querying audit logs, security events,
 * and compliance reporting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('audit')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list': {
        const category = searchParams.get('category')
        const severity = searchParams.get('severity')
        const resourceType = searchParams.get('resourceType')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (category) {
          query = query.eq('action_category', category)
        }

        if (severity) {
          query = query.eq('action_severity', severity)
        }

        if (resourceType) {
          query = query.eq('resource_type', resourceType)
        }

        if (startDate) {
          query = query.gte('created_at', startDate)
        }

        if (endDate) {
          query = query.lte('created_at', endDate)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          logs: data,
          total: count,
          limit,
          offset
        })
      }

      case 'get': {
        const logId = searchParams.get('logId')

        if (!logId) {
          return NextResponse.json({ error: 'Log ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('id', logId)
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        return NextResponse.json({ log: data })
      }

      case 'summary': {
        const days = parseInt(searchParams.get('days') || '30')
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: logs, error } = await supabase
          .from('audit_logs')
          .select('action, action_category, action_severity, status, ip_address')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())

        if (error) throw error

        // Calculate summary
        const byCategory: Record<string, number> = {}
        const bySeverity: Record<string, number> = {}
        const actionCounts: Record<string, number> = {}
        const uniqueIPs = new Set<string>()
        let failures = 0

        logs.forEach(log => {
          byCategory[log.action_category] = (byCategory[log.action_category] || 0) + 1
          bySeverity[log.action_severity] = (bySeverity[log.action_severity] || 0) + 1
          actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

          if (log.status === 'failure') failures++
          if (log.ip_address) uniqueIPs.add(log.ip_address)
        })

        const topActions = Object.entries(actionCounts)
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        return NextResponse.json({
          summary: {
            totalEvents: logs.length,
            byCategory,
            bySeverity,
            recentFailures: failures,
            topActions,
            uniqueIPs: uniqueIPs.size,
            period: {
              start: startDate.toISOString(),
              end: new Date().toISOString(),
              days
            }
          }
        })
      }

      case 'security_events': {
        const eventType = searchParams.get('eventType')
        const severity = searchParams.get('severity')
        const unresolvedOnly = searchParams.get('unresolvedOnly') === 'true'
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('security_events')
          .select('*', { count: 'exact' })
          .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)

        if (eventType) {
          query = query.eq('event_type', eventType)
        }

        if (severity) {
          query = query.eq('severity', severity)
        }

        if (unresolvedOnly) {
          query = query.eq('is_resolved', false)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          events: data,
          total: count,
          limit,
          offset
        })
      }

      case 'data_access': {
        const tableName = searchParams.get('tableName')
        const accessType = searchParams.get('accessType')
        const startDate = searchParams.get('startDate')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('data_access_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (tableName) {
          query = query.eq('table_name', tableName)
        }

        if (accessType) {
          query = query.eq('access_type', accessType)
        }

        if (startDate) {
          query = query.gte('created_at', startDate)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          logs: data,
          total: count,
          limit,
          offset
        })
      }

      case 'api_usage': {
        const endpoint = searchParams.get('endpoint')
        const method = searchParams.get('method')
        const statusCode = searchParams.get('statusCode')
        const startDate = searchParams.get('startDate')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('api_usage_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)

        if (endpoint) {
          query = query.ilike('endpoint', `%${endpoint}%`)
        }

        if (method) {
          query = query.eq('method', method)
        }

        if (statusCode) {
          query = query.eq('status_code', parseInt(statusCode))
        }

        if (startDate) {
          query = query.gte('created_at', startDate)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          logs: data,
          total: count,
          limit,
          offset
        })
      }

      case 'resource_history': {
        const resourceType = searchParams.get('resourceType')
        const resourceId = searchParams.get('resourceId')

        if (!resourceType || !resourceId) {
          return NextResponse.json(
            { error: 'Resource type and ID required' },
            { status: 400 }
          )
        }

        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('resource_type', resourceType)
          .eq('resource_id', resourceId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ history: data })
      }

      case 'timeline': {
        const days = parseInt(searchParams.get('days') || '7')
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data: logs, error } = await supabase
          .from('audit_logs')
          .select('action, action_category, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error

        // Group by day
        const byDay: Record<string, { count: number; byCategory: Record<string, number> }> = {}

        logs.forEach(log => {
          const day = log.created_at.split('T')[0]
          if (!byDay[day]) {
            byDay[day] = { count: 0, byCategory: {} }
          }
          byDay[day].count++
          byDay[day].byCategory[log.action_category] =
            (byDay[day].byCategory[log.action_category] || 0) + 1
        })

        const timeline = Object.entries(byDay)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({ timeline })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Audit API GET error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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
    const { action, ...data } = body

    // Get request context
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') || null
    const userAgent = request.headers.get('user-agent') || null

    switch (action) {
      case 'log': {
        const { data: log, error } = await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            actor_type: data.actorType || 'user',
            actor_name: data.actorName,
            actor_email: user.email,
            action: data.action,
            action_category: data.actionCategory,
            action_severity: data.actionSeverity || 'info',
            resource_type: data.resourceType,
            resource_id: data.resourceId,
            resource_name: data.resourceName,
            old_values: data.oldValues,
            new_values: data.newValues,
            metadata: data.metadata || {},
            tags: data.tags || [],
            status: data.status || 'success',
            ip_address: ipAddress,
            user_agent: userAgent
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ log }, { status: 201 })
      }

      case 'resolve_security_event': {
        const { eventId, notes } = data

        if (!eventId) {
          return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
        }

        const { error } = await supabase
          .from('security_events')
          .update({
            is_resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
            resolution_notes: notes
          })
          .eq('id', eventId)
          .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)

        if (error) throw error

        // Log the resolution
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'security_event_resolved',
            action_category: 'security',
            resource_type: 'security_event',
            resource_id: eventId,
            metadata: { notes },
            ip_address: ipAddress,
            user_agent: userAgent
          })

        return NextResponse.json({ resolved: true })
      }

      case 'export': {
        const { startDate, endDate, format, includeDetails } = data

        let query = supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)

        if (startDate) {
          query = query.gte('created_at', startDate)
        }

        if (endDate) {
          query = query.lte('created_at', endDate)
        }

        const { data: logs, error } = await query
          .order('created_at', { ascending: false })

        if (error) throw error

        // Log the export action
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'audit_logs_exported',
            action_category: 'admin',
            action_severity: 'warning',
            metadata: {
              count: logs.length,
              startDate,
              endDate,
              format
            },
            ip_address: ipAddress,
            user_agent: userAgent
          })

        // Format based on request
        if (format === 'csv') {
          // Return CSV-ready data
          const csvData = logs.map(log => ({
            id: log.id,
            timestamp: log.created_at,
            action: log.action,
            category: log.action_category,
            severity: log.action_severity,
            status: log.status,
            resource_type: log.resource_type,
            resource_id: log.resource_id,
            ip_address: log.ip_address
          }))

          return NextResponse.json({ logs: csvData, format: 'csv' })
        }

        return NextResponse.json({
          logs: includeDetails ? logs : logs.map(log => ({
            id: log.id,
            created_at: log.created_at,
            action: log.action,
            action_category: log.action_category,
            status: log.status
          })),
          format: 'json'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Audit API POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
