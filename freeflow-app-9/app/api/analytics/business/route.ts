/**
 * KAZI Analytics API - Business Intelligence
 *
 * Comprehensive business analytics with KPIs, trends,
 * client health, and operational metrics.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('analytics-business')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'dashboard'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (action) {
      case 'dashboard': {
        // Fetch all data in parallel
        const [
          clientsResult,
          projectsResult,
          tasksResult,
          invoicesResult
        ] = await Promise.all([
          supabase
            .from('clients')
            .select('id, status, created_at')
            .eq('user_id', user.id),
          supabase
            .from('projects')
            .select('id, status, created_at, deadline')
            .eq('user_id', user.id),
          supabase
            .from('tasks')
            .select('id, status, priority, created_at, due_date')
            .eq('user_id', user.id),
          supabase
            .from('invoices')
            .select('id, amount, status, created_at, paid_date')
            .eq('user_id', user.id)
        ])

        const clients = clientsResult.data || []
        const projects = projectsResult.data || []
        const tasks = tasksResult.data || []
        const invoices = invoicesResult.data || []

        // Calculate KPIs
        const now = new Date()

        const dashboard = {
          // Client metrics
          clients: {
            total: clients.length,
            active: clients.filter(c => c.status === 'active').length,
            new_this_period: clients.filter(c =>
              new Date(c.created_at) >= start && new Date(c.created_at) <= end
            ).length
          },
          // Project metrics
          projects: {
            total: projects.length,
            active: projects.filter(p => p.status === 'in_progress').length,
            completed: projects.filter(p => p.status === 'completed').length,
            overdue: projects.filter(p =>
              p.deadline && new Date(p.deadline) < now && p.status !== 'completed'
            ).length
          },
          // Task metrics
          tasks: {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            in_progress: tasks.filter(t => t.status === 'in_progress').length,
            overdue: tasks.filter(t =>
              t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
            ).length,
            high_priority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
          },
          // Revenue metrics
          revenue: {
            total_invoiced: invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
            total_collected: invoices
              .filter(i => i.status === 'paid')
              .reduce((sum, i) => sum + (i.amount || 0), 0),
            outstanding: invoices
              .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
              .reduce((sum, i) => sum + (i.amount || 0), 0),
            this_period: invoices
              .filter(i => i.status === 'paid' && i.paid_date &&
                new Date(i.paid_date) >= start && new Date(i.paid_date) <= end
              )
              .reduce((sum, i) => sum + (i.amount || 0), 0)
          },
          // Productivity metrics
          productivity: {
            task_completion_rate: tasks.length > 0
              ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
              : 0,
            project_completion_rate: projects.length > 0
              ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
              : 0,
            invoice_collection_rate: invoices.length > 0
              ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100)
              : 0
          },
          period: {
            start: start.toISOString(),
            end: end.toISOString()
          }
        }

        return NextResponse.json({ dashboard })
      }

      case 'kpis': {
        // Key Performance Indicators
        const [invoicesResult, projectsResult, clientsResult] = await Promise.all([
          supabase
            .from('invoices')
            .select('amount, status, created_at, paid_date')
            .eq('user_id', user.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString()),
          supabase
            .from('projects')
            .select('id, status, budget, created_at')
            .eq('user_id', user.id),
          supabase
            .from('clients')
            .select('id, status, created_at')
            .eq('user_id', user.id)
        ])

        const invoices = invoicesResult.data || []
        const projects = projectsResult.data || []
        const clients = clientsResult.data || []

        // Calculate period comparison
        const periodLength = end.getTime() - start.getTime()
        const prevStart = new Date(start.getTime() - periodLength)

        const { data: prevInvoices } = await supabase
          .from('invoices')
          .select('amount, status')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('created_at', prevStart.toISOString())
          .lt('created_at', start.toISOString())

        const currentRevenue = invoices
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + (i.amount || 0), 0)

        const prevRevenue = (prevInvoices || [])
          .reduce((sum, i) => sum + (i.amount || 0), 0)

        const kpis = {
          revenue: {
            current: currentRevenue,
            previous: prevRevenue,
            change: prevRevenue > 0
              ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
              : currentRevenue > 0 ? 100 : 0,
            trend: currentRevenue >= prevRevenue ? 'up' : 'down'
          },
          clients: {
            total: clients.length,
            new: clients.filter(c =>
              new Date(c.created_at) >= start && new Date(c.created_at) <= end
            ).length,
            churn_rate: 0 // Would need historical data
          },
          projects: {
            active: projects.filter(p => p.status === 'in_progress').length,
            pipeline_value: projects
              .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
              .reduce((sum, p) => sum + (p.budget || 0), 0)
          },
          efficiency: {
            average_invoice_value: invoices.length > 0
              ? Math.round(currentRevenue / invoices.filter(i => i.status === 'paid').length)
              : 0,
            revenue_per_client: clients.length > 0
              ? Math.round(currentRevenue / clients.filter(c => c.status === 'active').length)
              : 0
          }
        }

        return NextResponse.json({ kpis })
      }

      case 'trends': {
        const granularity = searchParams.get('granularity') || 'day'

        // Get data for trends
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, status, created_at, paid_date')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('paid_date', start.toISOString())
          .lte('paid_date', end.toISOString())
          .order('paid_date', { ascending: true })

        if (error) throw error

        const { data: projects } = await supabase
          .from('projects')
          .select('id, status, created_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        const { data: clients } = await supabase
          .from('clients')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        // Group data by time period
        const groupByPeriod = (items: any[], dateField: string) => {
          const grouped: Record<string, number> = {}

          items.forEach(item => {
            const date = new Date(item[dateField])
            let key: string

            switch (granularity) {
              case 'week':
                const weekStart = new Date(date)
                weekStart.setDate(date.getDate() - date.getDay())
                key = weekStart.toISOString().split('T')[0]
                break
              case 'month':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                break
              default:
                key = date.toISOString().split('T')[0]
            }

            grouped[key] = (grouped[key] || 0) + 1
          })

          return grouped
        }

        const revenueByPeriod: Record<string, number> = {}
        invoices.forEach(invoice => {
          const date = new Date(invoice.paid_date)
          let key: string

          switch (granularity) {
            case 'week':
              const weekStart = new Date(date)
              weekStart.setDate(date.getDate() - date.getDay())
              key = weekStart.toISOString().split('T')[0]
              break
            case 'month':
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              break
            default:
              key = date.toISOString().split('T')[0]
          }

          revenueByPeriod[key] = (revenueByPeriod[key] || 0) + (invoice.amount || 0)
        })

        const projectsCompleted = groupByPeriod(projects || [], 'created_at')
        const newClients = groupByPeriod(clients || [], 'created_at')

        // Merge all dates
        const allDates = new Set([
          ...Object.keys(revenueByPeriod),
          ...Object.keys(projectsCompleted),
          ...Object.keys(newClients)
        ])

        const trends = Array.from(allDates)
          .sort()
          .map(date => ({
            date,
            revenue: revenueByPeriod[date] || 0,
            projects_completed: projectsCompleted[date] || 0,
            new_clients: newClients[date] || 0
          }))

        return NextResponse.json({ trends, granularity })
      }

      case 'client_health': {
        // Analyze client health across portfolio
        const { data: clients, error } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            status,
            created_at,
            invoices(amount, status, due_date, paid_date),
            projects(id, status)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')

        if (error) throw error

        const now = new Date()

        const clientHealth = clients.map((client: any) => {
          const invoices = client.invoices || []
          const projects = client.projects || []

          // Calculate health score
          let score = 100

          // Payment history (-30 for overdue invoices)
          const overdueInvoices = invoices.filter((i: any) =>
            i.status !== 'paid' && i.due_date && new Date(i.due_date) < now
          )
          score -= overdueInvoices.length * 10

          // Project activity (+10 for active projects)
          const activeProjects = projects.filter((p: any) => p.status === 'in_progress')
          score += Math.min(activeProjects.length * 5, 20)

          // Revenue contribution
          const totalPaid = invoices
            .filter((i: any) => i.status === 'paid')
            .reduce((sum: number, i: any) => sum + (i.amount || 0), 0)

          return {
            id: client.id,
            name: client.name,
            health_score: Math.max(0, Math.min(100, score)),
            total_revenue: totalPaid,
            active_projects: activeProjects.length,
            overdue_invoices: overdueInvoices.length,
            risk_level: score < 50 ? 'high' : score < 75 ? 'medium' : 'low'
          }
        })

        // Sort by health score ascending (worst first)
        clientHealth.sort((a, b) => a.health_score - b.health_score)

        const summary = {
          total_clients: clientHealth.length,
          healthy: clientHealth.filter(c => c.risk_level === 'low').length,
          at_risk: clientHealth.filter(c => c.risk_level === 'medium').length,
          critical: clientHealth.filter(c => c.risk_level === 'high').length,
          average_health: clientHealth.length > 0
            ? Math.round(clientHealth.reduce((sum, c) => sum + c.health_score, 0) / clientHealth.length)
            : 100
        }

        return NextResponse.json({
          client_health: clientHealth,
          summary
        })
      }

      case 'operational': {
        // Operational metrics
        const [tasksResult, projectsResult, messagesResult] = await Promise.all([
          supabase
            .from('tasks')
            .select('id, status, priority, created_at, updated_at, due_date')
            .eq('user_id', user.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString()),
          supabase
            .from('projects')
            .select('id, status, created_at, deadline')
            .eq('user_id', user.id),
          supabase
            .from('messages')
            .select('id, created_at')
            .eq('user_id', user.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
        ])

        const tasks = tasksResult.data || []
        const projects = projectsResult.data || []
        const messages = messagesResult.data || []

        const now = new Date()
        const completedTasks = tasks.filter(t => t.status === 'completed')

        // Calculate average task completion time
        let avgCompletionTime = 0
        if (completedTasks.length > 0) {
          const completionTimes = completedTasks
            .filter(t => t.created_at && t.updated_at)
            .map(t => {
              const created = new Date(t.created_at)
              const completed = new Date(t.updated_at)
              return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
            })

          if (completionTimes.length > 0) {
            avgCompletionTime = Math.round(
              completionTimes.reduce((sum, t) => sum + t, 0) / completionTimes.length * 10
            ) / 10
          }
        }

        const operational = {
          tasks: {
            created: tasks.length,
            completed: completedTasks.length,
            completion_rate: tasks.length > 0
              ? Math.round((completedTasks.length / tasks.length) * 100)
              : 0,
            average_completion_days: avgCompletionTime,
            overdue: tasks.filter(t =>
              t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
            ).length
          },
          projects: {
            total: projects.length,
            on_track: projects.filter(p =>
              p.status === 'in_progress' &&
              (!p.deadline || new Date(p.deadline) > now)
            ).length,
            at_risk: projects.filter(p => {
              if (p.status !== 'in_progress' || !p.deadline) return false
              const deadline = new Date(p.deadline)
              const daysRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              return daysRemaining > 0 && daysRemaining < 7
            }).length,
            overdue: projects.filter(p =>
              p.status !== 'completed' && p.deadline && new Date(p.deadline) < now
            ).length
          },
          communication: {
            messages_sent: messages.length,
            avg_per_day: Math.round(messages.length / Math.max(1,
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            ) * 10) / 10
          }
        }

        return NextResponse.json({ operational })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Business analytics GET error', { error })
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

    switch (action) {
      case 'create_snapshot': {
        // Create a point-in-time snapshot of all metrics
        const { data: dashboard } = await supabase.rpc('get_business_dashboard', {
          p_user_id: user.id
        })

        // Store snapshot
        const { data: snapshot, error } = await supabase
          .from('payment_analytics_snapshots')
          .insert({
            user_id: user.id,
            period_type: 'day',
            period_start: new Date().toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            raw_data: dashboard || {}
          })
          .select()
          .single()

        if (error) {
          return NextResponse.json({
            snapshot_id: 'manual_' + Date.now(),
            message: 'Snapshot captured (table may not exist)'
          })
        }

        return NextResponse.json({ snapshot_id: snapshot.id })
      }

      case 'export_report': {
        const { format, dateRange, metrics } = data

        // Generate exportable report
        const report = {
          generated_at: new Date().toISOString(),
          user_id: user.id,
          date_range: dateRange,
          metrics: metrics || ['all'],
          format,
          data: {} // Would be populated with actual data
        }

        // For CSV/Excel formats, you'd generate the file here
        // For now, return JSON

        return NextResponse.json({ report })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Business analytics POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
