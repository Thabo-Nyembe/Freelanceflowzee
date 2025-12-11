/**
 * KAZI Reports & Exports System - Database Queries
 * World-class backend infrastructure for reporting and data exports
 */

import { supabase } from './supabase'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'

// =====================================================
// TYPES
// =====================================================

export interface Report {
  id: string
  user_id: string
  name: string
  description?: string
  type: ReportType
  config: ReportConfig
  schedule?: ReportSchedule
  is_template: boolean
  is_public: boolean
  last_generated_at?: string
  generation_count: number
  created_at: string
  updated_at: string
}

export type ReportType =
  | 'revenue'
  | 'expense'
  | 'profit_loss'
  | 'client_summary'
  | 'project_summary'
  | 'invoice_aging'
  | 'time_tracking'
  | 'tax_summary'
  | 'custom'

export interface ReportConfig {
  date_range: {
    type: 'custom' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year'
    start?: string
    end?: string
  }
  filters?: {
    client_ids?: string[]
    project_ids?: string[]
    categories?: string[]
    status?: string[]
  }
  grouping?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'client' | 'project' | 'category'
  columns?: string[]
  include_charts?: boolean
  comparison?: {
    enabled: boolean
    period: 'previous_period' | 'previous_year'
  }
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  day_of_week?: number // 0-6 for weekly
  day_of_month?: number // 1-31 for monthly
  time: string // HH:mm
  timezone: string
  email_recipients: string[]
  export_format: ExportFormat
}

export interface ScheduledReport {
  id: string
  report_id: string
  user_id: string
  frequency: string
  day_of_week?: number
  day_of_month?: number
  time: string
  timezone: string
  email_recipients: string[]
  export_format: ExportFormat
  is_active: boolean
  next_run_at?: string
  last_run_at?: string
  run_count: number
  created_at: string
  updated_at: string
  // Joined data
  report?: Report
}

export interface Export {
  id: string
  user_id: string
  report_id?: string
  type: string
  format: ExportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url?: string
  file_size?: number
  error_message?: string
  expires_at?: string
  created_at: string
  completed_at?: string
}

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'

export interface ExportJob {
  id: string
  export_id: string
  user_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  started_at?: string
  completed_at?: string
  error_message?: string
  retry_count: number
  max_retries: number
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id?: string
  task_id?: string
  description?: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  is_billable: boolean
  hourly_rate?: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  project_id?: string
  client_id?: string
  category: string
  description: string
  amount: number
  currency: string
  date: string
  receipt_url?: string
  is_reimbursable: boolean
  is_reimbursed: boolean
  reimbursed_at?: string
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ReportData {
  summary: Record<string, any>
  data: any[]
  charts?: ChartData[]
  comparison?: {
    current: Record<string, any>
    previous: Record<string, any>
    change: Record<string, number>
  }
  metadata: {
    generated_at: string
    date_range: { start: string; end: string }
    filters_applied: Record<string, any>
  }
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: { label: string; value: number; color?: string }[]
}

// =====================================================
// REPORT OPERATIONS
// =====================================================

export async function getReports(
  userId: string,
  options: {
    type?: ReportType
    isTemplate?: boolean
    search?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ reports: Report[]; total: number }> {
  try {
    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (options.type) {
      query = query.eq('type', options.type)
    }

    if (options.isTemplate !== undefined) {
      query = query.eq('is_template', options.isTemplate)
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { reports: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching reports:', error)
    return { reports: [], total: 0 }
  }
}

export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching report:', error)
    return null
  }
}

export async function createReport(report: Partial<Report>): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: report.user_id,
        name: report.name,
        description: report.description,
        type: report.type,
        config: report.config || getDefaultReportConfig(report.type!),
        schedule: report.schedule,
        is_template: report.is_template || false,
        is_public: report.is_public || false,
        generation_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating report:', error)
    return null
  }
}

export async function updateReport(reportId: string, updates: Partial<Report>): Promise<Report | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating report:', error)
    return null
  }
}

export async function deleteReport(reportId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting report:', error)
    return false
  }
}

export async function duplicateReport(reportId: string, userId: string): Promise<Report | null> {
  try {
    const original = await getReportById(reportId)
    if (!original) return null

    return await createReport({
      user_id: userId,
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      config: original.config,
      is_template: false,
      is_public: false
    })
  } catch (error) {
    console.error('Error duplicating report:', error)
    return null
  }
}

// =====================================================
// REPORT GENERATION
// =====================================================

export async function generateReport(reportId: string): Promise<ReportData | null> {
  try {
    const report = await getReportById(reportId)
    if (!report) return null

    const dateRange = resolveDateRange(report.config.date_range)

    let reportData: ReportData

    switch (report.type) {
      case 'revenue':
        reportData = await generateRevenueReport(report.user_id, dateRange, report.config)
        break
      case 'expense':
        reportData = await generateExpenseReport(report.user_id, dateRange, report.config)
        break
      case 'profit_loss':
        reportData = await generateProfitLossReport(report.user_id, dateRange, report.config)
        break
      case 'client_summary':
        reportData = await generateClientSummaryReport(report.user_id, dateRange, report.config)
        break
      case 'project_summary':
        reportData = await generateProjectSummaryReport(report.user_id, dateRange, report.config)
        break
      case 'invoice_aging':
        reportData = await generateInvoiceAgingReport(report.user_id, report.config)
        break
      case 'time_tracking':
        reportData = await generateTimeTrackingReport(report.user_id, dateRange, report.config)
        break
      case 'tax_summary':
        reportData = await generateTaxSummaryReport(report.user_id, dateRange, report.config)
        break
      default:
        reportData = await generateCustomReport(report.user_id, dateRange, report.config)
    }

    // Update report generation stats
    await supabase
      .from('reports')
      .update({
        last_generated_at: new Date().toISOString(),
        generation_count: report.generation_count + 1
      })
      .eq('id', reportId)

    return reportData
  } catch (error) {
    console.error('Error generating report:', error)
    return null
  }
}

async function generateRevenueReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('paid_at', dateRange.start.toISOString())
    .lte('paid_at', dateRange.end.toISOString())

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const invoiceCount = invoices?.length || 0
  const avgInvoiceValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0

  // Group by period
  const byPeriod = groupByPeriod(invoices || [], 'paid_at', config.grouping || 'month', 'total')

  return {
    summary: {
      total_revenue: totalRevenue,
      invoice_count: invoiceCount,
      average_invoice_value: avgInvoiceValue
    },
    data: invoices || [],
    charts: config.include_charts ? [
      {
        type: 'bar',
        title: 'Revenue by Period',
        data: byPeriod.map(p => ({ label: p.period, value: p.total }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateExpenseReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('date', format(dateRange.end, 'yyyy-MM-dd'))

  if (config.filters?.categories?.length) {
    query = query.in('category', config.filters.categories)
  }

  const { data: expenses } = await query

  const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
  const byCategory = groupByField(expenses || [], 'category', 'amount')

  return {
    summary: {
      total_expenses: totalExpenses,
      expense_count: expenses?.length || 0,
      by_category: byCategory
    },
    data: expenses || [],
    charts: config.include_charts ? [
      {
        type: 'pie',
        title: 'Expenses by Category',
        data: Object.entries(byCategory).map(([label, value]) => ({ label, value: value as number }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateProfitLossReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  // Get revenue
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, paid_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('paid_at', dateRange.start.toISOString())
    .lte('paid_at', dateRange.end.toISOString())

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  // Get expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, date, category')
    .eq('user_id', userId)
    .gte('date', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('date', format(dateRange.end, 'yyyy-MM-dd'))

  const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // Group by month
  const revenueByMonth = groupByPeriod(invoices || [], 'paid_at', 'month', 'total')
  const expensesByMonth = groupByPeriod(
    expenses?.map(e => ({ ...e, date: new Date(e.date).toISOString() })) || [],
    'date',
    'month',
    'amount'
  )

  return {
    summary: {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      profit_margin: profitMargin
    },
    data: [
      ...revenueByMonth.map(r => ({ ...r, type: 'revenue' })),
      ...expensesByMonth.map(e => ({ ...e, type: 'expense' }))
    ],
    charts: config.include_charts ? [
      {
        type: 'bar',
        title: 'Revenue vs Expenses',
        data: [
          { label: 'Revenue', value: totalRevenue, color: '#22C55E' },
          { label: 'Expenses', value: totalExpenses, color: '#EF4444' },
          { label: 'Net Profit', value: netProfit, color: '#3B82F6' }
        ]
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateClientSummaryReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      email,
      status,
      created_at
    `)
    .eq('user_id', userId)

  const clientSummaries = []

  for (const client of clients || []) {
    // Get revenue for this client
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total')
      .eq('client_id', client.id)
      .eq('status', 'paid')
      .gte('paid_at', dateRange.start.toISOString())
      .lte('paid_at', dateRange.end.toISOString())

    const revenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    // Get project count
    const { count: projectCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('client_id', client.id)

    clientSummaries.push({
      ...client,
      revenue,
      project_count: projectCount || 0,
      invoice_count: invoices?.length || 0
    })
  }

  // Sort by revenue
  clientSummaries.sort((a, b) => b.revenue - a.revenue)

  const totalRevenue = clientSummaries.reduce((sum, c) => sum + c.revenue, 0)

  return {
    summary: {
      total_clients: clients?.length || 0,
      total_revenue: totalRevenue,
      average_client_value: clients?.length ? totalRevenue / clients.length : 0
    },
    data: clientSummaries,
    charts: config.include_charts ? [
      {
        type: 'pie',
        title: 'Revenue by Client',
        data: clientSummaries.slice(0, 10).map(c => ({ label: c.name, value: c.revenue }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateProjectSummaryReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      client:client_id (name)
    `)
    .eq('user_id', userId)

  const projectSummaries = []

  for (const project of projects || []) {
    // Get revenue
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total')
      .eq('project_id', project.id)
      .eq('status', 'paid')

    const revenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    // Get time tracked
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('duration_minutes')
      .eq('project_id', project.id)

    const hoursTracked = (timeEntries?.reduce((sum, te) => sum + (te.duration_minutes || 0), 0) || 0) / 60

    projectSummaries.push({
      ...project,
      client_name: project.client?.name,
      revenue,
      hours_tracked: hoursTracked,
      effective_rate: hoursTracked > 0 ? revenue / hoursTracked : 0
    })
  }

  const byStatus = groupByField(projectSummaries, 'status', 'id', 'count')

  return {
    summary: {
      total_projects: projects?.length || 0,
      by_status: byStatus,
      total_revenue: projectSummaries.reduce((sum, p) => sum + p.revenue, 0),
      total_hours: projectSummaries.reduce((sum, p) => sum + p.hours_tracked, 0)
    },
    data: projectSummaries,
    charts: config.include_charts ? [
      {
        type: 'pie',
        title: 'Projects by Status',
        data: Object.entries(byStatus).map(([label, value]) => ({ label, value: value as number }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateInvoiceAgingReport(
  userId: string,
  config: ReportConfig
): Promise<ReportData> {
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      client:client_id (name, email)
    `)
    .eq('user_id', userId)
    .in('status', ['sent', 'pending', 'overdue'])

  const now = new Date()
  const aging = {
    current: { count: 0, total: 0, invoices: [] as any[] },
    '1-30': { count: 0, total: 0, invoices: [] as any[] },
    '31-60': { count: 0, total: 0, invoices: [] as any[] },
    '61-90': { count: 0, total: 0, invoices: [] as any[] },
    '90+': { count: 0, total: 0, invoices: [] as any[] }
  }

  for (const invoice of invoices || []) {
    const dueDate = new Date(invoice.due_date)
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    let bucket: keyof typeof aging
    if (daysOverdue <= 0) bucket = 'current'
    else if (daysOverdue <= 30) bucket = '1-30'
    else if (daysOverdue <= 60) bucket = '31-60'
    else if (daysOverdue <= 90) bucket = '61-90'
    else bucket = '90+'

    aging[bucket].count++
    aging[bucket].total += invoice.total || 0
    aging[bucket].invoices.push({
      ...invoice,
      days_overdue: Math.max(0, daysOverdue)
    })
  }

  const totalOutstanding = Object.values(aging).reduce((sum, a) => sum + a.total, 0)

  return {
    summary: {
      total_outstanding: totalOutstanding,
      invoice_count: invoices?.length || 0,
      aging_breakdown: Object.fromEntries(
        Object.entries(aging).map(([k, v]) => [k, { count: v.count, total: v.total }])
      )
    },
    data: Object.entries(aging).flatMap(([bucket, data]) =>
      data.invoices.map(inv => ({ ...inv, aging_bucket: bucket }))
    ),
    charts: config.include_charts ? [
      {
        type: 'bar',
        title: 'Invoice Aging',
        data: Object.entries(aging).map(([label, data]) => ({
          label,
          value: data.total
        }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: { start: '', end: '' },
      filters_applied: config.filters || {}
    }
  }
}

async function generateTimeTrackingReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      project:project_id (name)
    `)
    .eq('user_id', userId)
    .gte('start_time', dateRange.start.toISOString())
    .lte('start_time', dateRange.end.toISOString())

  if (config.filters?.project_ids?.length) {
    query = query.in('project_id', config.filters.project_ids)
  }

  const { data: entries } = await query

  const totalMinutes = entries?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0
  const billableMinutes = entries?.filter(e => e.is_billable).reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0
  const billableRevenue = entries?.filter(e => e.is_billable && e.hourly_rate)
    .reduce((sum, e) => sum + ((e.duration_minutes || 0) / 60 * (e.hourly_rate || 0)), 0) || 0

  const byProject = groupByField(
    entries?.map(e => ({ ...e, project_name: e.project?.name || 'No Project' })) || [],
    'project_name',
    'duration_minutes'
  )

  return {
    summary: {
      total_hours: totalMinutes / 60,
      billable_hours: billableMinutes / 60,
      non_billable_hours: (totalMinutes - billableMinutes) / 60,
      billable_percentage: totalMinutes > 0 ? (billableMinutes / totalMinutes) * 100 : 0,
      billable_revenue: billableRevenue
    },
    data: entries || [],
    charts: config.include_charts ? [
      {
        type: 'pie',
        title: 'Time by Project',
        data: Object.entries(byProject).map(([label, value]) => ({
          label,
          value: (value as number) / 60 // Convert to hours
        }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateTaxSummaryReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  // Get revenue
  const { data: invoices } = await supabase
    .from('invoices')
    .select('subtotal, tax, total')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('paid_at', dateRange.start.toISOString())
    .lte('paid_at', dateRange.end.toISOString())

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.subtotal || 0), 0) || 0
  const totalTaxCollected = invoices?.reduce((sum, inv) => sum + (inv.tax || 0), 0) || 0

  // Get expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('user_id', userId)
    .gte('date', format(dateRange.start, 'yyyy-MM-dd'))
    .lte('date', format(dateRange.end, 'yyyy-MM-dd'))

  const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
  const expensesByCategory = groupByField(expenses || [], 'category', 'amount')

  const netIncome = totalRevenue - totalExpenses
  const estimatedTaxRate = 0.25 // Placeholder - should be configurable
  const estimatedTaxOwed = Math.max(0, netIncome * estimatedTaxRate)

  return {
    summary: {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_income: netIncome,
      tax_collected: totalTaxCollected,
      estimated_tax_owed: estimatedTaxOwed,
      effective_tax_rate: netIncome > 0 ? (estimatedTaxOwed / netIncome) * 100 : 0
    },
    data: [
      { category: 'Revenue', amount: totalRevenue },
      { category: 'Expenses', amount: totalExpenses },
      { category: 'Net Income', amount: netIncome },
      { category: 'Tax Collected', amount: totalTaxCollected },
      { category: 'Estimated Tax Owed', amount: estimatedTaxOwed }
    ],
    charts: config.include_charts ? [
      {
        type: 'pie',
        title: 'Deductible Expenses by Category',
        data: Object.entries(expensesByCategory).map(([label, value]) => ({
          label,
          value: value as number
        }))
      }
    ] : undefined,
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

async function generateCustomReport(
  userId: string,
  dateRange: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  // Custom report - return basic structure
  return {
    summary: {},
    data: [],
    metadata: {
      generated_at: new Date().toISOString(),
      date_range: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      filters_applied: config.filters || {}
    }
  }
}

// =====================================================
// SCHEDULED REPORTS
// =====================================================

export async function getScheduledReports(userId: string): Promise<ScheduledReport[]> {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select(`
        *,
        report:report_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching scheduled reports:', error)
    return []
  }
}

export async function createScheduledReport(schedule: Partial<ScheduledReport>): Promise<ScheduledReport | null> {
  try {
    const nextRunAt = calculateNextRunTime(schedule)

    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert({
        report_id: schedule.report_id,
        user_id: schedule.user_id,
        frequency: schedule.frequency,
        day_of_week: schedule.day_of_week,
        day_of_month: schedule.day_of_month,
        time: schedule.time,
        timezone: schedule.timezone || 'UTC',
        email_recipients: schedule.email_recipients || [],
        export_format: schedule.export_format || 'pdf',
        is_active: true,
        next_run_at: nextRunAt,
        run_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating scheduled report:', error)
    return null
  }
}

export async function updateScheduledReport(
  scheduleId: string,
  updates: Partial<ScheduledReport>
): Promise<ScheduledReport | null> {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating scheduled report:', error)
    return null
  }
}

export async function deleteScheduledReport(scheduleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scheduled_reports')
      .delete()
      .eq('id', scheduleId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting scheduled report:', error)
    return false
  }
}

// =====================================================
// EXPORT OPERATIONS
// =====================================================

export async function getExports(
  userId: string,
  options: { limit?: number; status?: string } = {}
): Promise<Export[]> {
  try {
    let query = supabase
      .from('exports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching exports:', error)
    return []
  }
}

export async function createExport(
  userId: string,
  type: string,
  format: ExportFormat,
  reportId?: string
): Promise<Export | null> {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 day expiry

    const { data, error } = await supabase
      .from('exports')
      .insert({
        user_id: userId,
        report_id: reportId,
        type,
        format,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Create export job
    if (data) {
      await supabase
        .from('export_jobs')
        .insert({
          export_id: data.id,
          user_id: userId,
          status: 'queued',
          progress: 0,
          retry_count: 0,
          max_retries: 3
        })
    }

    return data
  } catch (error) {
    console.error('Error creating export:', error)
    return null
  }
}

export async function updateExportStatus(
  exportId: string,
  status: Export['status'],
  updates: Partial<Export> = {}
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('exports')
      .update({
        status,
        ...updates,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      })
      .eq('id', exportId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating export status:', error)
    return false
  }
}

// =====================================================
// TIME ENTRY OPERATIONS
// =====================================================

export async function getTimeEntries(
  userId: string,
  options: {
    projectId?: string
    startDate?: Date
    endDate?: Date
    isBillable?: boolean
    limit?: number
  } = {}
): Promise<TimeEntry[]> {
  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    if (options.projectId) {
      query = query.eq('project_id', options.projectId)
    }

    if (options.startDate) {
      query = query.gte('start_time', options.startDate.toISOString())
    }

    if (options.endDate) {
      query = query.lte('start_time', options.endDate.toISOString())
    }

    if (options.isBillable !== undefined) {
      query = query.eq('is_billable', options.isBillable)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return []
  }
}

export async function createTimeEntry(entry: Partial<TimeEntry>): Promise<TimeEntry | null> {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: entry.user_id,
        project_id: entry.project_id,
        task_id: entry.task_id,
        description: entry.description,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration_minutes: entry.duration_minutes,
        is_billable: entry.is_billable !== false,
        hourly_rate: entry.hourly_rate,
        tags: entry.tags || []
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating time entry:', error)
    return null
  }
}

export async function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry | null> {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating time entry:', error)
    return null
  }
}

export async function deleteTimeEntry(entryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return false
  }
}

// =====================================================
// EXPENSE OPERATIONS
// =====================================================

export async function getExpenses(
  userId: string,
  options: {
    projectId?: string
    clientId?: string
    category?: string
    startDate?: Date
    endDate?: Date
    isReimbursable?: boolean
    limit?: number
  } = {}
): Promise<Expense[]> {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (options.projectId) {
      query = query.eq('project_id', options.projectId)
    }

    if (options.clientId) {
      query = query.eq('client_id', options.clientId)
    }

    if (options.category) {
      query = query.eq('category', options.category)
    }

    if (options.startDate) {
      query = query.gte('date', format(options.startDate, 'yyyy-MM-dd'))
    }

    if (options.endDate) {
      query = query.lte('date', format(options.endDate, 'yyyy-MM-dd'))
    }

    if (options.isReimbursable !== undefined) {
      query = query.eq('is_reimbursable', options.isReimbursable)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export async function createExpense(expense: Partial<Expense>): Promise<Expense | null> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: expense.user_id,
        project_id: expense.project_id,
        client_id: expense.client_id,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency || 'USD',
        date: expense.date,
        receipt_url: expense.receipt_url,
        is_reimbursable: expense.is_reimbursable || false,
        is_reimbursed: false,
        tags: expense.tags || [],
        metadata: expense.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating expense:', error)
    return null
  }
}

export async function updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense | null> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating expense:', error)
    return null
  }
}

export async function deleteExpense(expenseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting expense:', error)
    return false
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getDefaultReportConfig(type: ReportType): ReportConfig {
  return {
    date_range: { type: 'this_month' },
    grouping: 'month',
    include_charts: true,
    comparison: { enabled: false, period: 'previous_period' }
  }
}

function resolveDateRange(config: ReportConfig['date_range']): { start: Date; end: Date } {
  const now = new Date()

  switch (config.type) {
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'this_quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
      return { start: quarterStart, end: quarterEnd }
    case 'last_quarter':
      const lastQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0)
      const lastQuarterStart = new Date(lastQuarterEnd.getFullYear(), lastQuarterEnd.getMonth() - 2, 1)
      return { start: lastQuarterStart, end: lastQuarterEnd }
    case 'this_year':
      return { start: startOfYear(now), end: endOfYear(now) }
    case 'last_year':
      const lastYear = new Date(now.getFullYear() - 1, 0, 1)
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) }
    case 'custom':
      return {
        start: config.start ? new Date(config.start) : startOfMonth(now),
        end: config.end ? new Date(config.end) : endOfMonth(now)
      }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

function groupByPeriod(
  items: any[],
  dateField: string,
  grouping: string,
  sumField: string
): { period: string; total: number }[] {
  const groups: Record<string, number> = {}

  for (const item of items) {
    const date = new Date(item[dateField])
    let period: string

    switch (grouping) {
      case 'day':
        period = format(date, 'yyyy-MM-dd')
        break
      case 'week':
        period = format(date, "yyyy-'W'ww")
        break
      case 'month':
        period = format(date, 'yyyy-MM')
        break
      case 'quarter':
        period = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
        break
      case 'year':
        period = format(date, 'yyyy')
        break
      default:
        period = format(date, 'yyyy-MM')
    }

    groups[period] = (groups[period] || 0) + (item[sumField] || 0)
  }

  return Object.entries(groups)
    .map(([period, total]) => ({ period, total }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

function groupByField(
  items: any[],
  groupField: string,
  sumField: string,
  operation: 'sum' | 'count' = 'sum'
): Record<string, number> {
  const groups: Record<string, number> = {}

  for (const item of items) {
    const key = item[groupField] || 'Other'
    if (operation === 'count') {
      groups[key] = (groups[key] || 0) + 1
    } else {
      groups[key] = (groups[key] || 0) + (item[sumField] || 0)
    }
  }

  return groups
}

function calculateNextRunTime(schedule: Partial<ScheduledReport>): string {
  const now = new Date()
  const [hours, minutes] = (schedule.time || '09:00').split(':').map(Number)

  let nextRun = new Date(now)
  nextRun.setHours(hours, minutes, 0, 0)

  if (nextRun <= now) {
    // Move to next occurrence
    switch (schedule.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1)
        break
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7)
        break
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1)
        break
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3)
        break
    }
  }

  return nextRun.toISOString()
}
