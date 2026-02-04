/**
 * Payment Analytics Service
 *
 * Comprehensive financial analytics and reporting
 * Business intelligence for invoicing and payments
 */

import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import type { Payment, Currency, PaymentMethod } from '@/lib/invoice-types'

const logger = createSimpleLogger('PaymentAnalyticsService')

// ============================================================================
// Types
// ============================================================================

export interface RevenueMetrics {
  totalRevenue: number
  paidRevenue: number
  pendingRevenue: number
  overdueRevenue: number
  recurringRevenue: number
  oneTimeRevenue: number
  averageInvoiceValue: number
  medianInvoiceValue: number
  revenueGrowth: number           // Percentage growth from previous period
  projectedRevenue: number        // Next period projection
}

export interface PaymentMetrics {
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  successRate: number
  averagePaymentTime: number      // Days from invoice to payment
  averagePaymentAmount: number
  totalProcessingFees: number
  netRevenue: number
  paymentsByMethod: PaymentMethodStats[]
}

export interface PaymentMethodStats {
  method: PaymentMethod
  count: number
  amount: number
  percentage: number
  averageAmount: number
  processingFees: number
}

export interface ClientMetrics {
  totalClients: number
  activeClients: number
  newClients: number
  churningClients: number
  averageClientValue: number
  topClients: ClientRevenue[]
  clientRetentionRate: number
}

export interface ClientRevenue {
  clientId: string
  clientName: string
  totalRevenue: number
  invoiceCount: number
  averagePaymentTime: number
  lastPaymentDate?: Date
  status: 'active' | 'at-risk' | 'churned'
}

export interface AgingReport {
  current: number               // Not yet due
  days1to30: number             // 1-30 days overdue
  days31to60: number            // 31-60 days overdue
  days61to90: number            // 61-90 days overdue
  days90plus: number            // 90+ days overdue
  total: number
  breakdown: AgingInvoice[]
}

export interface AgingInvoice {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  dueDate: Date
  daysOverdue: number
  bucket: 'current' | '1-30' | '31-60' | '61-90' | '90+'
}

export interface CashFlowForecast {
  period: string
  expectedIncome: number
  confirmedIncome: number
  projectedIncome: number
  recurringIncome: number
  oneTimeIncome: number
  trend: 'up' | 'down' | 'stable'
}

export interface RevenueByPeriod {
  period: string
  revenue: number
  invoiceCount: number
  paidCount: number
  pendingCount: number
  overdueCount: number
  growth: number
}

export interface KPIMetrics {
  dso: number                     // Days Sales Outstanding
  invoiceToPaymentRatio: number
  collectionEfficiency: number
  revenuePerClient: number
  invoiceVelocity: number         // Invoices per month
  paymentVelocity: number         // Payments per month
  churnRate: number
  netRevenueRetention: number
}

export interface AnalyticsDashboard {
  revenue: RevenueMetrics
  payments: PaymentMetrics
  clients: ClientMetrics
  aging: AgingReport
  kpis: KPIMetrics
  trends: RevenueByPeriod[]
  forecast: CashFlowForecast[]
}

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'

// ============================================================================
// Revenue Analytics
// ============================================================================

/**
 * Get revenue metrics for a period
 */
export async function getRevenueMetrics(
  userId: string,
  period: TimePeriod = 'month',
  currency: Currency = 'USD'
): Promise<RevenueMetrics> {
  logger.info('Getting revenue metrics', { userId, period, currency })

  const supabase = await createClient()
  const { startDate, endDate, previousStartDate, previousEndDate } = getPeriodDates(period)

  // Get invoices for current period
  const { data: currentInvoices, error: currentError } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .gte('issue_date', startDate.toISOString())
    .lte('issue_date', endDate.toISOString())

  if (currentError) {
    throw new Error(`Failed to get invoices: ${currentError.message}`)
  }

  // Get previous period for growth calculation
  const { data: previousInvoices } = await supabase
    .from('invoices')
    .select('total, status')
    .eq('user_id', userId)
    .eq('currency', currency)
    .gte('issue_date', previousStartDate.toISOString())
    .lte('issue_date', previousEndDate.toISOString())

  const invoices = currentInvoices || []
  const prevInvoices = previousInvoices || []

  // Calculate metrics
  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const pendingInvoices = invoices.filter(i => ['sent', 'viewed'].includes(i.status))
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')
  const recurringInvoices = invoices.filter(i => i.recurring_invoice_id)

  const totalRevenue = invoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const paidRevenue = paidInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const pendingRevenue = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const overdueRevenue = overdueInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const recurringRevenue = recurringInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const oneTimeRevenue = totalRevenue - recurringRevenue

  const previousTotal = prevInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const revenueGrowth = previousTotal > 0
    ? ((totalRevenue - previousTotal) / previousTotal) * 100
    : 0

  // Calculate averages
  const amounts = invoices.map(i => parseFloat(i.total)).sort((a, b) => a - b)
  const averageInvoiceValue = amounts.length > 0
    ? totalRevenue / amounts.length
    : 0
  const medianInvoiceValue = amounts.length > 0
    ? amounts[Math.floor(amounts.length / 2)]
    : 0

  // Project next period based on trend
  const projectedRevenue = totalRevenue * (1 + revenueGrowth / 100)

  return {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    overdueRevenue,
    recurringRevenue,
    oneTimeRevenue,
    averageInvoiceValue,
    medianInvoiceValue,
    revenueGrowth,
    projectedRevenue
  }
}

// ============================================================================
// Payment Analytics
// ============================================================================

/**
 * Get payment metrics
 */
export async function getPaymentMetrics(
  userId: string,
  period: TimePeriod = 'month',
  currency: Currency = 'USD'
): Promise<PaymentMetrics> {
  logger.info('Getting payment metrics', { userId, period, currency })

  const supabase = await createClient()
  const { startDate, endDate } = getPeriodDates(period)

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .gte('payment_date', startDate.toISOString())
    .lte('payment_date', endDate.toISOString())

  if (error) {
    throw new Error(`Failed to get payments: ${error.message}`)
  }

  const allPayments = payments || []
  const successful = allPayments.filter(p => p.status === 'completed')
  const failed = allPayments.filter(p => p.status === 'failed')

  const totalAmount = successful.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const totalFees = successful.reduce((sum, p) => sum + parseFloat(p.processing_fee || '0'), 0)

  // Payment time calculation
  const paymentTimes = successful
    .filter(p => p.invoice_created_at)
    .map(p => {
      const invoiceDate = new Date(p.invoice_created_at)
      const paymentDate = new Date(p.payment_date)
      return Math.ceil((paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24))
    })

  const averagePaymentTime = paymentTimes.length > 0
    ? paymentTimes.reduce((sum, t) => sum + t, 0) / paymentTimes.length
    : 0

  // Group by payment method
  const methodGroups = new Map<PaymentMethod, Payment[]>()
  for (const payment of successful) {
    const method = payment.method as PaymentMethod
    const existing = methodGroups.get(method) || []
    methodGroups.set(method, [...existing, payment])
  }

  const paymentsByMethod: PaymentMethodStats[] = Array.from(methodGroups.entries()).map(([method, methodPayments]) => {
    const amount = methodPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const fees = methodPayments.reduce((sum, p) => sum + parseFloat(p.processing_fee || '0'), 0)
    return {
      method,
      count: methodPayments.length,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      averageAmount: methodPayments.length > 0 ? amount / methodPayments.length : 0,
      processingFees: fees
    }
  }).sort((a, b) => b.amount - a.amount)

  return {
    totalPayments: allPayments.length,
    successfulPayments: successful.length,
    failedPayments: failed.length,
    successRate: allPayments.length > 0 ? (successful.length / allPayments.length) * 100 : 0,
    averagePaymentTime,
    averagePaymentAmount: successful.length > 0 ? totalAmount / successful.length : 0,
    totalProcessingFees: totalFees,
    netRevenue: totalAmount - totalFees,
    paymentsByMethod
  }
}

// ============================================================================
// Client Analytics
// ============================================================================

/**
 * Get client metrics
 */
export async function getClientMetrics(
  userId: string,
  period: TimePeriod = 'year'
): Promise<ClientMetrics> {
  logger.info('Getting client metrics', { userId, period })

  const supabase = await createClient()
  const { startDate, endDate, previousStartDate } = getPeriodDates(period)

  // Get all invoices with client info
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('client_id, client_name, total, status, paid_date, issue_date')
    .eq('user_id', userId)
    .gte('issue_date', startDate.toISOString())
    .lte('issue_date', endDate.toISOString())

  if (error) {
    throw new Error(`Failed to get client data: ${error.message}`)
  }

  // Get previous period clients
  const { data: previousInvoices } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('user_id', userId)
    .gte('issue_date', previousStartDate.toISOString())
    .lt('issue_date', startDate.toISOString())

  const allInvoices = invoices || []
  const previousClients = new Set((previousInvoices || []).map(i => i.client_id))

  // Group by client
  const clientMap = new Map<string, { name: string; invoices: any[] }>()
  for (const invoice of allInvoices) {
    const existing = clientMap.get(invoice.client_id) || { name: invoice.client_name, invoices: [] }
    existing.invoices.push(invoice)
    clientMap.set(invoice.client_id, existing)
  }

  // Calculate client metrics
  const clientRevenues: ClientRevenue[] = []
  const currentClients = new Set<string>()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  for (const [clientId, data] of clientMap.entries()) {
    currentClients.add(clientId)
    const totalRevenue = data.invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.total), 0)

    const paidInvoices = data.invoices.filter(i => i.paid_date)
    const paymentTimes = paidInvoices.map(i => {
      const issued = new Date(i.issue_date)
      const paid = new Date(i.paid_date)
      return Math.ceil((paid.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24))
    })

    const lastPayment = paidInvoices
      .map(i => new Date(i.paid_date))
      .sort((a, b) => b.getTime() - a.getTime())[0]

    // Determine client status
    let status: 'active' | 'at-risk' | 'churned' = 'active'
    if (lastPayment) {
      const daysSincePayment = Math.ceil((Date.now() - lastPayment.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSincePayment > 90) status = 'churned'
      else if (daysSincePayment > 45) status = 'at-risk'
    }

    clientRevenues.push({
      clientId,
      clientName: data.name,
      totalRevenue,
      invoiceCount: data.invoices.length,
      averagePaymentTime: paymentTimes.length > 0
        ? paymentTimes.reduce((sum, t) => sum + t, 0) / paymentTimes.length
        : 0,
      lastPaymentDate: lastPayment,
      status
    })
  }

  // Sort by revenue
  clientRevenues.sort((a, b) => b.totalRevenue - a.totalRevenue)

  // Calculate new and churning clients
  const newClients = Array.from(currentClients).filter(c => !previousClients.has(c)).length
  const churningClients = clientRevenues.filter(c => c.status === 'churned').length

  // Retention rate
  const returningClients = Array.from(currentClients).filter(c => previousClients.has(c)).length
  const retentionRate = previousClients.size > 0
    ? (returningClients / previousClients.size) * 100
    : 100

  const totalRevenue = clientRevenues.reduce((sum, c) => sum + c.totalRevenue, 0)

  return {
    totalClients: clientMap.size,
    activeClients: clientRevenues.filter(c => c.status === 'active').length,
    newClients,
    churningClients,
    averageClientValue: clientMap.size > 0 ? totalRevenue / clientMap.size : 0,
    topClients: clientRevenues.slice(0, 10),
    clientRetentionRate: retentionRate
  }
}

// ============================================================================
// Aging Report
// ============================================================================

/**
 * Get accounts receivable aging report
 */
export async function getAgingReport(
  userId: string,
  currency: Currency = 'USD'
): Promise<AgingReport> {
  logger.info('Getting aging report', { userId, currency })

  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, client_name, total, due_date, status')
    .eq('user_id', userId)
    .eq('currency', currency)
    .in('status', ['sent', 'viewed', 'overdue'])

  if (error) {
    throw new Error(`Failed to get aging data: ${error.message}`)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const report: AgingReport = {
    current: 0,
    days1to30: 0,
    days31to60: 0,
    days61to90: 0,
    days90plus: 0,
    total: 0,
    breakdown: []
  }

  for (const invoice of invoices || []) {
    const dueDate = new Date(invoice.due_date)
    dueDate.setHours(0, 0, 0, 0)
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const amount = parseFloat(invoice.total)

    let bucket: AgingInvoice['bucket']
    if (daysOverdue <= 0) {
      bucket = 'current'
      report.current += amount
    } else if (daysOverdue <= 30) {
      bucket = '1-30'
      report.days1to30 += amount
    } else if (daysOverdue <= 60) {
      bucket = '31-60'
      report.days31to60 += amount
    } else if (daysOverdue <= 90) {
      bucket = '61-90'
      report.days61to90 += amount
    } else {
      bucket = '90+'
      report.days90plus += amount
    }

    report.breakdown.push({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.client_name,
      amount,
      dueDate,
      daysOverdue: Math.max(0, daysOverdue),
      bucket
    })
  }

  report.total = report.current + report.days1to30 + report.days31to60 + report.days61to90 + report.days90plus

  // Sort breakdown by days overdue (most overdue first)
  report.breakdown.sort((a, b) => b.daysOverdue - a.daysOverdue)

  return report
}

// ============================================================================
// KPI Metrics
// ============================================================================

/**
 * Calculate key performance indicators
 */
export async function getKPIMetrics(
  userId: string,
  period: TimePeriod = 'month'
): Promise<KPIMetrics> {
  logger.info('Getting KPI metrics', { userId, period })

  const supabase = await createClient()
  const { startDate, endDate, previousStartDate, previousEndDate } = getPeriodDates(period)

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .gte('issue_date', startDate.toISOString())
    .lte('issue_date', endDate.toISOString())

  // Get payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('payment_date', startDate.toISOString())
    .lte('payment_date', endDate.toISOString())

  // Get unique clients
  const { data: clients } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('user_id', userId)

  const allInvoices = invoices || []
  const allPayments = payments || []
  const uniqueClients = new Set((clients || []).map(c => c.client_id))

  // Days Sales Outstanding (DSO)
  const totalAR = allInvoices
    .filter(i => !['paid', 'cancelled', 'refunded'].includes(i.status))
    .reduce((sum, i) => sum + parseFloat(i.total), 0)
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const revenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const dso = revenue > 0 ? (totalAR / revenue) * periodDays : 0

  // Invoice to Payment Ratio
  const paidInvoices = allInvoices.filter(i => i.status === 'paid').length
  const invoiceToPaymentRatio = allInvoices.length > 0
    ? (paidInvoices / allInvoices.length) * 100
    : 0

  // Collection Efficiency
  const totalInvoiced = allInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
  const collectionEfficiency = totalInvoiced > 0
    ? (revenue / totalInvoiced) * 100
    : 0

  // Revenue per client
  const revenuePerClient = uniqueClients.size > 0
    ? revenue / uniqueClients.size
    : 0

  // Velocities (per month)
  const monthsInPeriod = periodDays / 30
  const invoiceVelocity = monthsInPeriod > 0 ? allInvoices.length / monthsInPeriod : 0
  const paymentVelocity = monthsInPeriod > 0 ? allPayments.length / monthsInPeriod : 0

  // Get previous period for churn/retention
  const { data: prevClients } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('user_id', userId)
    .gte('issue_date', previousStartDate.toISOString())
    .lte('issue_date', previousEndDate.toISOString())

  const previousUniqueClients = new Set((prevClients || []).map(c => c.client_id))
  const currentPeriodClients = new Set(allInvoices.map(i => i.client_id))

  // Churn rate
  const churnedClients = Array.from(previousUniqueClients).filter(c => !currentPeriodClients.has(c)).length
  const churnRate = previousUniqueClients.size > 0
    ? (churnedClients / previousUniqueClients.size) * 100
    : 0

  // Net Revenue Retention
  const previousRevenue = (prevClients || []).length * (revenuePerClient || 0)
  const netRevenueRetention = previousRevenue > 0
    ? (revenue / previousRevenue) * 100
    : 100

  return {
    dso,
    invoiceToPaymentRatio,
    collectionEfficiency,
    revenuePerClient,
    invoiceVelocity,
    paymentVelocity,
    churnRate,
    netRevenueRetention
  }
}

// ============================================================================
// Cash Flow Forecast
// ============================================================================

/**
 * Generate cash flow forecast
 */
export async function getCashFlowForecast(
  userId: string,
  periods: number = 6,
  periodType: 'week' | 'month' = 'month'
): Promise<CashFlowForecast[]> {
  logger.info('Getting cash flow forecast', { userId, periods, periodType })

  const supabase = await createClient()
  const forecast: CashFlowForecast[] = []

  for (let i = 0; i < periods; i++) {
    const periodStart = new Date()
    const periodEnd = new Date()

    if (periodType === 'week') {
      periodStart.setDate(periodStart.getDate() + (i * 7))
      periodEnd.setDate(periodStart.getDate() + 7)
    } else {
      periodStart.setMonth(periodStart.getMonth() + i)
      periodEnd.setMonth(periodStart.getMonth() + 1)
    }

    // Get expected income (unpaid invoices due in this period)
    const { data: dueInvoices } = await supabase
      .from('invoices')
      .select('total, recurring_invoice_id')
      .eq('user_id', userId)
      .in('status', ['sent', 'viewed'])
      .gte('due_date', periodStart.toISOString())
      .lt('due_date', periodEnd.toISOString())

    const invoices = dueInvoices || []
    const expectedIncome = invoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
    const recurringIncome = invoices
      .filter(i => i.recurring_invoice_id)
      .reduce((sum, i) => sum + parseFloat(i.total), 0)

    // Get recurring invoices that will generate in this period
    const { data: recurringInvoices } = await supabase
      .from('recurring_invoices')
      .select('subtotal, tax_rate, discount')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('next_billing_date', periodStart.toISOString())
      .lt('next_billing_date', periodEnd.toISOString())

    const projectedRecurring = (recurringInvoices || []).reduce((sum, r) => {
      const taxAmount = parseFloat(r.subtotal) * (parseFloat(r.tax_rate) / 100)
      const discountAmount = parseFloat(r.subtotal) * (parseFloat(r.discount) / 100)
      return sum + parseFloat(r.subtotal) + taxAmount - discountAmount
    }, 0)

    // Calculate confirmed (already received payments)
    const { data: receivedPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('payment_date', periodStart.toISOString())
      .lt('payment_date', periodEnd.toISOString())

    const confirmedIncome = (receivedPayments || []).reduce((sum, p) => sum + parseFloat(p.amount), 0)

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (forecast.length > 0) {
      const previousExpected = forecast[forecast.length - 1].expectedIncome
      if (expectedIncome > previousExpected * 1.1) trend = 'up'
      else if (expectedIncome < previousExpected * 0.9) trend = 'down'
    }

    forecast.push({
      period: formatPeriodLabel(periodStart, periodType),
      expectedIncome,
      confirmedIncome,
      projectedIncome: expectedIncome + projectedRecurring,
      recurringIncome: recurringIncome + projectedRecurring,
      oneTimeIncome: expectedIncome - recurringIncome,
      trend
    })
  }

  return forecast
}

// ============================================================================
// Revenue Trends
// ============================================================================

/**
 * Get revenue by period for trend analysis
 */
export async function getRevenueTrends(
  userId: string,
  periods: number = 12,
  periodType: 'week' | 'month' = 'month'
): Promise<RevenueByPeriod[]> {
  logger.info('Getting revenue trends', { userId, periods, periodType })

  const supabase = await createClient()
  const trends: RevenueByPeriod[] = []

  for (let i = periods - 1; i >= 0; i--) {
    const periodStart = new Date()
    const periodEnd = new Date()

    if (periodType === 'week') {
      periodStart.setDate(periodStart.getDate() - (i * 7) - 7)
      periodEnd.setDate(periodStart.getDate() + 7)
    } else {
      periodStart.setMonth(periodStart.getMonth() - i - 1)
      periodStart.setDate(1)
      periodEnd.setMonth(periodStart.getMonth() + 1)
      periodEnd.setDate(0)
    }

    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, status')
      .eq('user_id', userId)
      .gte('issue_date', periodStart.toISOString())
      .lte('issue_date', periodEnd.toISOString())

    const allInvoices = invoices || []
    const revenue = allInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + parseFloat(i.total), 0)

    const paidCount = allInvoices.filter(i => i.status === 'paid').length
    const pendingCount = allInvoices.filter(i => ['sent', 'viewed'].includes(i.status)).length
    const overdueCount = allInvoices.filter(i => i.status === 'overdue').length

    // Calculate growth
    const previousRevenue = trends.length > 0 ? trends[trends.length - 1].revenue : 0
    const growth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0

    trends.push({
      period: formatPeriodLabel(periodStart, periodType),
      revenue,
      invoiceCount: allInvoices.length,
      paidCount,
      pendingCount,
      overdueCount,
      growth
    })
  }

  return trends
}

// ============================================================================
// Full Dashboard
// ============================================================================

/**
 * Get complete analytics dashboard
 */
export async function getAnalyticsDashboard(
  userId: string,
  period: TimePeriod = 'month',
  currency: Currency = 'USD'
): Promise<AnalyticsDashboard> {
  logger.info('Getting analytics dashboard', { userId, period, currency })

  const [revenue, payments, clients, aging, kpis, trends, forecast] = await Promise.all([
    getRevenueMetrics(userId, period, currency),
    getPaymentMetrics(userId, period, currency),
    getClientMetrics(userId, period),
    getAgingReport(userId, currency),
    getKPIMetrics(userId, period),
    getRevenueTrends(userId, 12, 'month'),
    getCashFlowForecast(userId, 6, 'month')
  ])

  return {
    revenue,
    payments,
    clients,
    aging,
    kpis,
    trends,
    forecast
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPeriodDates(period: TimePeriod): {
  startDate: Date
  endDate: Date
  previousStartDate: Date
  previousEndDate: Date
} {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  const previousEndDate = new Date(startDate)
  previousEndDate.setMilliseconds(-1)
  const previousStartDate = new Date(previousEndDate)

  switch (period) {
    case 'day':
      // Today
      break
    case 'week':
      startDate.setDate(startDate.getDate() - 7)
      previousStartDate.setDate(previousStartDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1)
      previousStartDate.setMonth(previousStartDate.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3)
      previousStartDate.setMonth(previousStartDate.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)
      break
    case 'all':
      startDate.setFullYear(2000) // Far back enough
      previousStartDate.setFullYear(2000)
      break
  }

  return { startDate, endDate, previousStartDate, previousEndDate }
}

function formatPeriodLabel(date: Date, type: 'week' | 'month'): string {
  if (type === 'week') {
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default {
  getRevenueMetrics,
  getPaymentMetrics,
  getClientMetrics,
  getAgingReport,
  getKPIMetrics,
  getCashFlowForecast,
  getRevenueTrends,
  getAnalyticsDashboard
}
