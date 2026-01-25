/**
 * KAZI Analytics API - Revenue Analytics
 *
 * Comprehensive revenue analytics with trend analysis,
 * forecasting, and detailed breakdowns.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('analytics-revenue')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const granularity = searchParams.get('granularity') || 'day' // day, week, month

    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (action) {
      case 'overview': {
        // Get revenue data from invoices
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, status, paid_date, created_at')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        if (error) throw error

        const paidInvoices = invoices.filter(i => i.status === 'paid')
        const pendingInvoices = invoices.filter(i => ['pending', 'sent', 'draft'].includes(i.status))

        // Get previous period for comparison
        const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()))
        const { data: prevInvoices } = await supabase
          .from('invoices')
          .select('amount, status')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('created_at', prevStart.toISOString())
          .lt('created_at', start.toISOString())

        const currentRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0)
        const prevRevenue = (prevInvoices || []).reduce((sum, i) => sum + (i.amount || 0), 0)
        const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0

        const overview = {
          total_revenue: currentRevenue,
          pending_revenue: pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
          revenue_growth: Math.round(revenueGrowth * 100) / 100,
          invoice_count: invoices.length,
          paid_invoice_count: paidInvoices.length,
          average_invoice_value: paidInvoices.length > 0
            ? Math.round(currentRevenue / paidInvoices.length * 100) / 100
            : 0,
          period: {
            start: start.toISOString(),
            end: end.toISOString()
          }
        }

        return NextResponse.json({ overview })
      }

      case 'timeseries': {
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, status, paid_date, created_at')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('paid_date', start.toISOString())
          .lte('paid_date', end.toISOString())
          .order('paid_date', { ascending: true })

        if (error) throw error

        // Group by granularity
        const grouped: Record<string, number> = {}

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

          grouped[key] = (grouped[key] || 0) + (invoice.amount || 0)
        })

        const timeseries = Object.entries(grouped)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({ timeseries, granularity })
      }

      case 'by_client': {
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select(`
            amount,
            status,
            clients(id, name, company)
          `)
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('paid_date', start.toISOString())
          .lte('paid_date', end.toISOString())

        if (error) throw error

        const byClient: Record<string, { client: any; revenue: number; invoice_count: number }> = {}

        invoices.forEach((invoice: any) => {
          const clientId = invoice.clients?.id || 'unknown'
          if (!byClient[clientId]) {
            byClient[clientId] = {
              client: invoice.clients || { id: 'unknown', name: 'Unknown Client' },
              revenue: 0,
              invoice_count: 0
            }
          }
          byClient[clientId].revenue += invoice.amount || 0
          byClient[clientId].invoice_count += 1
        })

        const clientRevenue = Object.values(byClient)
          .sort((a, b) => b.revenue - a.revenue)

        return NextResponse.json({ by_client: clientRevenue })
      }

      case 'by_project': {
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select(`
            amount,
            status,
            projects(id, name, status)
          `)
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('paid_date', start.toISOString())
          .lte('paid_date', end.toISOString())

        if (error) throw error

        const byProject: Record<string, { project: any; revenue: number; invoice_count: number }> = {}

        invoices.forEach((invoice: any) => {
          const projectId = invoice.projects?.id || 'no_project'
          if (!byProject[projectId]) {
            byProject[projectId] = {
              project: invoice.projects || { id: 'no_project', name: 'No Project' },
              revenue: 0,
              invoice_count: 0
            }
          }
          byProject[projectId].revenue += invoice.amount || 0
          byProject[projectId].invoice_count += 1
        })

        const projectRevenue = Object.values(byProject)
          .sort((a, b) => b.revenue - a.revenue)

        return NextResponse.json({ by_project: projectRevenue })
      }

      case 'forecast': {
        // Get historical data for forecasting
        const historicalStart = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000)

        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, paid_date')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .gte('paid_date', historicalStart.toISOString())
          .lte('paid_date', end.toISOString())
          .order('paid_date', { ascending: true })

        if (error) throw error

        // Calculate monthly averages
        const monthlyRevenue: Record<string, number> = {}
        invoices.forEach(invoice => {
          const month = invoice.paid_date?.substring(0, 7)
          if (month) {
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (invoice.amount || 0)
          }
        })

        const months = Object.values(monthlyRevenue)
        const avgMonthlyRevenue = months.length > 0
          ? months.reduce((sum, r) => sum + r, 0) / months.length
          : 0

        // Simple linear trend
        let trend = 0
        if (months.length >= 2) {
          const firstHalf = months.slice(0, Math.floor(months.length / 2))
          const secondHalf = months.slice(Math.floor(months.length / 2))
          const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length
          trend = secondAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
        }

        // Forecast next 3 months
        const forecast = []
        for (let i = 1; i <= 3; i++) {
          const futureDate = new Date(end)
          futureDate.setMonth(futureDate.getMonth() + i)
          const growthMultiplier = 1 + (trend / 100) * i
          forecast.push({
            month: futureDate.toISOString().substring(0, 7),
            predicted_revenue: Math.round(avgMonthlyRevenue * growthMultiplier),
            confidence: Math.max(0.5, 1 - (i * 0.15)) // Decreasing confidence over time
          })
        }

        return NextResponse.json({
          forecast,
          historical_average: Math.round(avgMonthlyRevenue),
          trend_percentage: Math.round(trend * 100) / 100
        })
      }

      case 'metrics': {
        // Get comprehensive metrics
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, status, created_at, paid_date, due_date')
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        if (error) throw error

        const paidInvoices = invoices.filter(i => i.status === 'paid')

        // Calculate days to payment
        const daysToPayment: number[] = []
        paidInvoices.forEach(invoice => {
          if (invoice.created_at && invoice.paid_date) {
            const created = new Date(invoice.created_at)
            const paid = new Date(invoice.paid_date)
            const days = Math.floor((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
            daysToPayment.push(days)
          }
        })

        const avgDaysToPayment = daysToPayment.length > 0
          ? Math.round(daysToPayment.reduce((sum, d) => sum + d, 0) / daysToPayment.length)
          : 0

        // Collection rate
        const totalInvoiced = invoices.reduce((sum, i) => sum + (i.amount || 0), 0)
        const totalCollected = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0)
        const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0

        // Overdue analysis
        const now = new Date()
        const overdueInvoices = invoices.filter(i =>
          i.status !== 'paid' && i.due_date && new Date(i.due_date) < now
        )
        const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.amount || 0), 0)

        const metrics = {
          total_invoiced: totalInvoiced,
          total_collected: totalCollected,
          collection_rate: Math.round(collectionRate * 100) / 100,
          average_days_to_payment: avgDaysToPayment,
          overdue_invoices: overdueInvoices.length,
          overdue_amount: overdueAmount,
          invoice_count: invoices.length,
          paid_count: paidInvoices.length
        }

        return NextResponse.json({ metrics })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Revenue analytics GET error', { error })
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
      case 'generate_report': {
        const { startDate, endDate, includeForecasts, includeBreakdowns } = data

        // Generate comprehensive revenue report
        const start = new Date(startDate)
        const end = new Date(endDate)

        const { data: invoices, error } = await supabase
          .from('invoices')
          .select(`
            amount,
            status,
            created_at,
            paid_date,
            clients(id, name),
            projects(id, name)
          `)
          .eq('user_id', user.id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())

        if (error) throw error

        const report = {
          period: { start: start.toISOString(), end: end.toISOString() },
          summary: {
            total_revenue: invoices
              .filter((i: any) => i.status === 'paid')
              .reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
            total_invoiced: invoices.reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
            invoice_count: invoices.length,
            paid_count: invoices.filter((i: any) => i.status === 'paid').length
          },
          breakdowns: includeBreakdowns ? {
            by_client: {},
            by_project: {},
            by_status: {}
          } : null,
          forecasts: includeForecasts ? [] : null,
          generated_at: new Date().toISOString()
        }

        // Store report
        const { data: savedReport, error: saveError } = await supabase
          .from('analytics_reports')
          .insert({
            user_id: user.id,
            type: 'revenue',
            config: { startDate, endDate, includeForecasts, includeBreakdowns },
            data: report
          })
          .select()
          .single()

        if (saveError) {
          // If table doesn't exist, just return the report
          return NextResponse.json({ report })
        }

        return NextResponse.json({ report, report_id: savedReport.id })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Revenue analytics POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
