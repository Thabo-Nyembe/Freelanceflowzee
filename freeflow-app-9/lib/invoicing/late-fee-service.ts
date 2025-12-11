/**
 * Late Payment Fee Service
 *
 * Automated late fee calculation and application
 * Handles grace periods, fee caps, and compliance
 */

import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import type { Invoice, Currency } from '@/lib/invoice-types'

const logger = createFeatureLogger('LateFeeService')

// ============================================================================
// Types
// ============================================================================

export interface LateFeeConfig {
  enabled: boolean
  type: 'percentage' | 'fixed' | 'compound'
  rate: number                    // Percentage or fixed amount
  gracePeriodDays: number         // Days after due date before fees apply
  maxFeePercentage: number        // Cap on total late fees (e.g., 25% of original)
  compoundingPeriod?: 'daily' | 'weekly' | 'monthly'
  minimumFee?: number             // Minimum fee amount
  maximumFee?: number             // Maximum fee amount
  applyToTax: boolean             // Whether to calculate fee on tax amount too
}

export interface LateFeeRecord {
  id: string
  invoiceId: string
  userId: string
  feeAmount: number
  feeType: 'percentage' | 'fixed' | 'compound'
  feeRate: number
  daysOverdue: number
  appliedAt: Date
  originalTotal: number
  newTotal: number
  currency: Currency
  waived: boolean
  waivedAt?: Date
  waivedBy?: string
  waivedReason?: string
  metadata: {
    calculationDetails: string
    compoundingPeriods?: number
  }
  createdAt: Date
}

export interface LateFeeCalculation {
  originalTotal: number
  daysOverdue: number
  feeAmount: number
  newTotal: number
  breakdown: string
  capped: boolean
  cappedAmount?: number
}

export interface LateFeeResult {
  processed: number
  feesApplied: number
  totalFeesAmount: number
  skipped: number
  errors: Array<{ invoiceId: string; error: string }>
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_LATE_FEE_CONFIG: LateFeeConfig = {
  enabled: true,
  type: 'percentage',
  rate: 1.5,                      // 1.5% per month
  gracePeriodDays: 7,             // 7-day grace period
  maxFeePercentage: 25,           // Cap at 25% of original invoice
  compoundingPeriod: 'monthly',
  minimumFee: 5,                  // Minimum $5 fee
  maximumFee: 500,                // Maximum $500 fee
  applyToTax: false
}

// ============================================================================
// Fee Calculation
// ============================================================================

/**
 * Calculate late fee for an invoice
 */
export function calculateLateFee(
  invoice: Pick<Invoice, 'total' | 'taxAmount' | 'dueDate'>,
  config: LateFeeConfig = DEFAULT_LATE_FEE_CONFIG,
  referenceDate: Date = new Date()
): LateFeeCalculation {
  const dueDate = new Date(invoice.dueDate)
  dueDate.setHours(0, 0, 0, 0)

  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)

  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

  // Not overdue or within grace period
  if (daysOverdue <= config.gracePeriodDays) {
    return {
      originalTotal: invoice.total,
      daysOverdue: Math.max(0, daysOverdue),
      feeAmount: 0,
      newTotal: invoice.total,
      breakdown: 'No late fee - within grace period',
      capped: false
    }
  }

  const effectiveDaysOverdue = daysOverdue - config.gracePeriodDays
  const baseAmount = config.applyToTax ? invoice.total : (invoice.total - (invoice.taxAmount || 0))

  let feeAmount: number
  let breakdown: string

  switch (config.type) {
    case 'fixed':
      feeAmount = config.rate
      breakdown = `Fixed late fee: ${formatCurrency(config.rate)}`
      break

    case 'compound':
      // Calculate compound interest
      const periods = calculateCompoundingPeriods(effectiveDaysOverdue, config.compoundingPeriod || 'monthly')
      const compoundRate = config.rate / 100
      feeAmount = baseAmount * (Math.pow(1 + compoundRate, periods) - 1)
      breakdown = `Compound fee: ${config.rate}% per ${config.compoundingPeriod} for ${periods} periods`
      break

    case 'percentage':
    default:
      // Simple percentage based on days overdue
      const monthsOverdue = effectiveDaysOverdue / 30
      feeAmount = baseAmount * (config.rate / 100) * monthsOverdue
      breakdown = `${config.rate}% per month × ${monthsOverdue.toFixed(2)} months = ${formatCurrency(feeAmount)}`
  }

  // Apply minimum fee
  if (config.minimumFee && feeAmount > 0 && feeAmount < config.minimumFee) {
    feeAmount = config.minimumFee
    breakdown += ` (minimum fee applied: ${formatCurrency(config.minimumFee)})`
  }

  // Apply maximum fee
  let capped = false
  let cappedAmount: number | undefined

  if (config.maximumFee && feeAmount > config.maximumFee) {
    cappedAmount = feeAmount
    feeAmount = config.maximumFee
    capped = true
    breakdown += ` (capped at maximum: ${formatCurrency(config.maximumFee)})`
  }

  // Apply percentage cap
  const maxFee = baseAmount * (config.maxFeePercentage / 100)
  if (feeAmount > maxFee) {
    cappedAmount = feeAmount
    feeAmount = maxFee
    capped = true
    breakdown += ` (capped at ${config.maxFeePercentage}%: ${formatCurrency(maxFee)})`
  }

  // Round to 2 decimal places
  feeAmount = Math.round(feeAmount * 100) / 100

  return {
    originalTotal: invoice.total,
    daysOverdue: effectiveDaysOverdue,
    feeAmount,
    newTotal: invoice.total + feeAmount,
    breakdown,
    capped,
    cappedAmount
  }
}

/**
 * Calculate number of compounding periods
 */
function calculateCompoundingPeriods(days: number, period: 'daily' | 'weekly' | 'monthly'): number {
  switch (period) {
    case 'daily':
      return days
    case 'weekly':
      return Math.floor(days / 7)
    case 'monthly':
    default:
      return Math.floor(days / 30)
  }
}

// ============================================================================
// Fee Application
// ============================================================================

/**
 * Apply late fee to an invoice
 */
export async function applyLateFee(
  invoiceId: string,
  userId: string,
  config?: Partial<LateFeeConfig>
): Promise<LateFeeRecord> {
  logger.info('Applying late fee', { invoiceId, userId })

  const supabase = await createClient()
  const finalConfig = { ...DEFAULT_LATE_FEE_CONFIG, ...config }

  // Get invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single()

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found')
  }

  // Check if invoice is eligible for late fee
  if (['paid', 'cancelled', 'refunded'].includes(invoice.status)) {
    throw new Error('Cannot apply late fee to paid/cancelled invoice')
  }

  // Calculate fee
  const calculation = calculateLateFee(
    {
      total: parseFloat(invoice.total),
      taxAmount: parseFloat(invoice.tax_amount || '0'),
      dueDate: new Date(invoice.due_date)
    },
    finalConfig
  )

  if (calculation.feeAmount === 0) {
    throw new Error('No late fee applicable - invoice within grace period')
  }

  // Check if fee already applied recently (within 24 hours)
  const { data: recentFees } = await supabase
    .from('late_fees')
    .select('id, applied_at')
    .eq('invoice_id', invoiceId)
    .eq('waived', false)
    .order('applied_at', { ascending: false })
    .limit(1)

  if (recentFees && recentFees.length > 0) {
    const lastFee = new Date(recentFees[0].applied_at)
    const hoursSinceLastFee = (Date.now() - lastFee.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastFee < 24) {
      throw new Error('Late fee already applied within last 24 hours')
    }
  }

  // Create late fee record
  const { data: feeRecord, error: feeError } = await supabase
    .from('late_fees')
    .insert({
      invoice_id: invoiceId,
      user_id: userId,
      fee_amount: calculation.feeAmount,
      fee_type: finalConfig.type,
      fee_rate: finalConfig.rate,
      days_overdue: calculation.daysOverdue,
      applied_at: new Date().toISOString(),
      original_total: calculation.originalTotal,
      new_total: calculation.newTotal,
      currency: invoice.currency,
      waived: false,
      metadata: {
        calculationDetails: calculation.breakdown,
        capped: calculation.capped,
        cappedAmount: calculation.cappedAmount
      }
    })
    .select()
    .single()

  if (feeError) {
    logger.error('Failed to create late fee record', { error: feeError.message })
    throw new Error(`Failed to apply late fee: ${feeError.message}`)
  }

  // Update invoice total
  await supabase
    .from('invoices')
    .update({
      total: calculation.newTotal,
      late_fee_amount: (parseFloat(invoice.late_fee_amount || '0') + calculation.feeAmount),
      status: 'overdue',
      metadata: {
        ...invoice.metadata,
        lastLateFeeApplied: new Date().toISOString(),
        totalLateFees: (parseFloat(invoice.late_fee_amount || '0') + calculation.feeAmount)
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId)

  logger.info('Late fee applied', {
    invoiceId,
    feeAmount: calculation.feeAmount,
    newTotal: calculation.newTotal
  })

  return mapDbToLateFeeRecord(feeRecord)
}

/**
 * Process all overdue invoices for late fees
 * This should be called by a daily cron job
 */
export async function processOverdueInvoices(
  config?: Partial<LateFeeConfig>
): Promise<LateFeeResult> {
  logger.info('Processing overdue invoices for late fees')

  const supabase = await createClient()
  const finalConfig = { ...DEFAULT_LATE_FEE_CONFIG, ...config }

  if (!finalConfig.enabled) {
    logger.info('Late fees disabled')
    return {
      processed: 0,
      feesApplied: 0,
      totalFeesAmount: 0,
      skipped: 0,
      errors: []
    }
  }

  // Get all overdue invoices
  const gracePeriodDate = new Date()
  gracePeriodDate.setDate(gracePeriodDate.getDate() - finalConfig.gracePeriodDays)

  const { data: overdueInvoices, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .in('status', ['sent', 'viewed', 'overdue'])
    .lt('due_date', gracePeriodDate.toISOString())

  if (fetchError) {
    logger.error('Failed to fetch overdue invoices', { error: fetchError.message })
    throw new Error(`Failed to fetch overdue invoices: ${fetchError.message}`)
  }

  const result: LateFeeResult = {
    processed: 0,
    feesApplied: 0,
    totalFeesAmount: 0,
    skipped: 0,
    errors: []
  }

  for (const invoice of overdueInvoices || []) {
    result.processed++

    try {
      // Check if late fee settings allow for this invoice
      const calculation = calculateLateFee(
        {
          total: parseFloat(invoice.total),
          taxAmount: parseFloat(invoice.tax_amount || '0'),
          dueDate: new Date(invoice.due_date)
        },
        finalConfig
      )

      // Check max fee cap
      const existingFees = parseFloat(invoice.late_fee_amount || '0')
      const originalTotal = parseFloat(invoice.total) - existingFees
      const maxAllowedFees = originalTotal * (finalConfig.maxFeePercentage / 100)

      if (existingFees >= maxAllowedFees) {
        result.skipped++
        continue
      }

      // Apply fee
      const feeRecord = await applyLateFee(invoice.id, invoice.user_id, finalConfig)
      result.feesApplied++
      result.totalFeesAmount += feeRecord.feeAmount

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (errorMessage.includes('already applied') || errorMessage.includes('grace period')) {
        result.skipped++
      } else {
        result.errors.push({
          invoiceId: invoice.id,
          error: errorMessage
        })
      }
    }
  }

  logger.info('Overdue invoices processed', result)

  return result
}

/**
 * Waive a late fee
 */
export async function waiveLateFee(
  feeId: string,
  userId: string,
  reason: string
): Promise<LateFeeRecord> {
  logger.info('Waiving late fee', { feeId, userId, reason })

  const supabase = await createClient()

  // Get fee record
  const { data: fee, error: feeError } = await supabase
    .from('late_fees')
    .select('*, invoices!inner(*)')
    .eq('id', feeId)
    .eq('user_id', userId)
    .single()

  if (feeError || !fee) {
    throw new Error('Late fee record not found')
  }

  if (fee.waived) {
    throw new Error('Late fee already waived')
  }

  // Update fee record
  const { data: updatedFee, error: updateError } = await supabase
    .from('late_fees')
    .update({
      waived: true,
      waived_at: new Date().toISOString(),
      waived_by: userId,
      waived_reason: reason
    })
    .eq('id', feeId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to waive late fee: ${updateError.message}`)
  }

  // Update invoice total
  const invoice = fee.invoices
  const newTotal = parseFloat(invoice.total) - fee.fee_amount
  const newLateFeeAmount = parseFloat(invoice.late_fee_amount || '0') - fee.fee_amount

  await supabase
    .from('invoices')
    .update({
      total: newTotal,
      late_fee_amount: Math.max(0, newLateFeeAmount),
      metadata: {
        ...invoice.metadata,
        lastLateFeeWaived: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', invoice.id)

  logger.info('Late fee waived', {
    feeId,
    amount: fee.fee_amount,
    reason
  })

  return mapDbToLateFeeRecord(updatedFee)
}

/**
 * Get late fee history for an invoice
 */
export async function getInvoiceLateFees(
  invoiceId: string,
  userId: string
): Promise<LateFeeRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('late_fees')
    .select('*')
    .eq('invoice_id', invoiceId)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get late fees: ${error.message}`)
  }

  return (data || []).map(mapDbToLateFeeRecord)
}

/**
 * Get late fee statistics
 */
export async function getLateFeeStats(
  userId: string,
  period: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<{
  totalFeesApplied: number
  totalFeesAmount: number
  totalFeesWaived: number
  totalWaivedAmount: number
  averageFeeAmount: number
  averageDaysOverdue: number
}> {
  const supabase = await createClient()

  // Calculate date range based on period
  const now = new Date()
  let startDate: Date
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      break
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      break
    case 'year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
  }

  const { data: fees, error } = await supabase
    .from('late_fees')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    throw new Error(`Failed to get late fee stats: ${error.message}`)
  }

  const allFees = fees || []
  const activeFees = allFees.filter(f => !f.waived)
  const waivedFees = allFees.filter(f => f.waived)

  const totalFeesAmount = activeFees.reduce((sum, f) => sum + parseFloat(f.fee_amount), 0)
  const totalWaivedAmount = waivedFees.reduce((sum, f) => sum + parseFloat(f.fee_amount), 0)
  const totalDaysOverdue = activeFees.reduce((sum, f) => sum + (f.days_overdue || 0), 0)

  return {
    totalFeesApplied: activeFees.length,
    totalFeesAmount,
    totalFeesWaived: waivedFees.length,
    totalWaivedAmount,
    averageFeeAmount: activeFees.length > 0 ? totalFeesAmount / activeFees.length : 0,
    averageDaysOverdue: activeFees.length > 0 ? totalDaysOverdue / activeFees.length : 0
  }
}

/**
 * Get late fee configuration for a user
 */
export async function getLateFeeConfig(userId: string): Promise<LateFeeConfig> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('late_fee_configs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Return default config if none exists
    return DEFAULT_LATE_FEE_CONFIG
  }

  return {
    enabled: data.enabled,
    type: data.fee_type,
    rate: parseFloat(data.rate),
    gracePeriodDays: data.grace_period_days,
    maxFeePercentage: parseFloat(data.max_fee_percentage),
    compoundingPeriod: data.compound_frequency,
    minimumFee: parseFloat(data.minimum_fee || '5'),
    maximumFee: parseFloat(data.maximum_fee || '500'),
    applyToTax: data.apply_to_tax
  }
}

/**
 * Update late fee configuration for a user
 */
export async function updateLateFeeConfig(
  userId: string,
  config: Partial<LateFeeConfig>
): Promise<LateFeeConfig> {
  const supabase = await createClient()

  const updateData: any = {}
  if (config.enabled !== undefined) updateData.enabled = config.enabled
  if (config.type !== undefined) updateData.fee_type = config.type
  if (config.rate !== undefined) updateData.rate = config.rate
  if (config.gracePeriodDays !== undefined) updateData.grace_period_days = config.gracePeriodDays
  if (config.maxFeePercentage !== undefined) updateData.max_fee_percentage = config.maxFeePercentage
  if (config.compoundingPeriod !== undefined) updateData.compound_frequency = config.compoundingPeriod
  if (config.minimumFee !== undefined) updateData.minimum_fee = config.minimumFee
  if (config.maximumFee !== undefined) updateData.maximum_fee = config.maximumFee
  if (config.applyToTax !== undefined) updateData.apply_to_tax = config.applyToTax

  const { data, error } = await supabase
    .from('late_fee_configs')
    .upsert({
      user_id: userId,
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update late fee config: ${error.message}`)
  }

  return getLateFeeConfig(userId)
}

/**
 * Get late fee history for an invoice
 */
export async function getLateFeeHistory(invoiceId: string): Promise<LateFeeRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('late_fees')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('applied_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get late fee history: ${error.message}`)
  }

  return (data || []).map(mapDbToLateFeeRecord)
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

function mapDbToLateFeeRecord(row: any): LateFeeRecord {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    userId: row.user_id,
    feeAmount: parseFloat(row.fee_amount),
    feeType: row.fee_type,
    feeRate: parseFloat(row.fee_rate),
    daysOverdue: row.days_overdue,
    appliedAt: new Date(row.applied_at),
    originalTotal: parseFloat(row.original_total),
    newTotal: parseFloat(row.new_total),
    currency: row.currency,
    waived: row.waived,
    waivedAt: row.waived_at ? new Date(row.waived_at) : undefined,
    waivedBy: row.waived_by,
    waivedReason: row.waived_reason,
    metadata: row.metadata || { calculationDetails: '' },
    createdAt: new Date(row.created_at)
  }
}

export default {
  calculateLateFee,
  applyLateFee,
  processOverdueInvoices,
  waiveLateFee,
  getInvoiceLateFees,
  getLateFeeStats,
  getLateFeeConfig,
  updateLateFeeConfig,
  getLateFeeHistory,
  DEFAULT_LATE_FEE_CONFIG
}
