/**
 * Recurring Invoice Service
 *
 * Automated recurring invoice generation and management
 * Handles subscription billing, schedule management, and invoice creation
 */

import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { getEmailService } from '@/lib/email/email-service'
import { sendRecurringInvoiceCreated } from '@/lib/email/email-templates'
import type {
  Invoice,
  InvoiceItem,
  BillingCycle,
  Currency
} from '@/lib/invoice-types'

const emailService = getEmailService()

const logger = createFeatureLogger('RecurringInvoiceService')

// ============================================================================
// Types
// ============================================================================

export interface RecurringInvoice {
  id: string
  userId: string
  clientId: string
  clientName: string
  clientEmail: string
  templateId?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  discount: number
  currency: Currency
  billingCycle: BillingCycle
  startDate: Date
  endDate?: Date
  nextBillingDate: Date
  lastBillingDate?: Date
  totalOccurrences?: number
  completedOccurrences: number
  isActive: boolean
  autoSend: boolean
  paymentTermsDays: number
  notes?: string
  terms?: string
  metadata: {
    generatedInvoiceIds: string[]
    lastError?: string
    lastErrorDate?: Date
    pausedAt?: Date
    pauseReason?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface RecurringInvoiceCreate {
  clientId: string
  clientName: string
  clientEmail: string
  templateId?: string
  items: InvoiceItem[]
  taxRate?: number
  discount?: number
  currency?: Currency
  billingCycle: BillingCycle
  startDate: Date
  endDate?: Date
  totalOccurrences?: number
  autoSend?: boolean
  paymentTermsDays?: number
  notes?: string
  terms?: string
}

export interface RecurringInvoiceUpdate {
  items?: InvoiceItem[]
  taxRate?: number
  discount?: number
  billingCycle?: BillingCycle
  endDate?: Date | null
  totalOccurrences?: number | null
  autoSend?: boolean
  paymentTermsDays?: number
  notes?: string
  terms?: string
  isActive?: boolean
}

export interface ScheduleResult {
  processed: number
  generated: number
  sent: number
  errors: Array<{ recurringId: string; error: string }>
}

// ============================================================================
// Billing Cycle Calculations
// ============================================================================

/**
 * Calculate next billing date based on cycle
 */
export function calculateNextBillingDate(
  currentDate: Date,
  billingCycle: BillingCycle
): Date {
  const next = new Date(currentDate)

  switch (billingCycle) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'annually':
      next.setFullYear(next.getFullYear() + 1)
      break
    case 'one-time':
    default:
      // One-time doesn't have next date
      break
  }

  return next
}

/**
 * Get billing cycle display name
 */
export function getBillingCycleLabel(cycle: BillingCycle): string {
  const labels: Record<BillingCycle, string> = {
    'one-time': 'One-time',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annually': 'Annually'
  }
  return labels[cycle] || cycle
}

/**
 * Calculate invoice total
 */
function calculateTotal(items: InvoiceItem[], taxRate: number, discount: number): {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
    return sum + itemTotal
  }, 0)

  const discountAmount = subtotal * (discount / 100)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (taxRate / 100)
  const total = taxableAmount + taxAmount

  return { subtotal, taxAmount, discountAmount, total }
}

/**
 * Generate unique invoice number
 */
function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

// ============================================================================
// Core Service Functions
// ============================================================================

/**
 * Create a new recurring invoice
 */
export async function createRecurringInvoice(
  userId: string,
  data: RecurringInvoiceCreate
): Promise<RecurringInvoice> {
  logger.info('Creating recurring invoice', {
    userId,
    clientId: data.clientId,
    billingCycle: data.billingCycle
  })

  const supabase = await createClient()

  const { subtotal } = calculateTotal(
    data.items,
    data.taxRate || 0,
    data.discount || 0
  )

  const recurringInvoice: Partial<RecurringInvoice> = {
    userId,
    clientId: data.clientId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    templateId: data.templateId,
    items: data.items,
    subtotal,
    taxRate: data.taxRate || 0,
    discount: data.discount || 0,
    currency: data.currency || 'USD',
    billingCycle: data.billingCycle,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    nextBillingDate: new Date(data.startDate),
    completedOccurrences: 0,
    totalOccurrences: data.totalOccurrences,
    isActive: true,
    autoSend: data.autoSend ?? true,
    paymentTermsDays: data.paymentTermsDays || 30,
    notes: data.notes,
    terms: data.terms,
    metadata: {
      generatedInvoiceIds: []
    }
  }

  const { data: created, error } = await supabase
    .from('recurring_invoices')
    .insert({
      user_id: recurringInvoice.userId,
      client_id: recurringInvoice.clientId,
      client_name: recurringInvoice.clientName,
      client_email: recurringInvoice.clientEmail,
      template_id: recurringInvoice.templateId,
      items: recurringInvoice.items,
      subtotal: recurringInvoice.subtotal,
      tax_rate: recurringInvoice.taxRate,
      discount: recurringInvoice.discount,
      currency: recurringInvoice.currency,
      billing_cycle: recurringInvoice.billingCycle,
      start_date: recurringInvoice.startDate,
      end_date: recurringInvoice.endDate,
      next_billing_date: recurringInvoice.nextBillingDate,
      completed_occurrences: 0,
      total_occurrences: recurringInvoice.totalOccurrences,
      is_active: true,
      auto_send: recurringInvoice.autoSend,
      payment_terms_days: recurringInvoice.paymentTermsDays,
      notes: recurringInvoice.notes,
      terms: recurringInvoice.terms,
      metadata: recurringInvoice.metadata
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create recurring invoice', { error: error.message })
    throw new Error(`Failed to create recurring invoice: ${error.message}`)
  }

  logger.info('Recurring invoice created', {
    id: created.id,
    billingCycle: data.billingCycle,
    nextBillingDate: recurringInvoice.nextBillingDate
  })

  return mapDbToRecurringInvoice(created)
}

/**
 * Update recurring invoice
 */
export async function updateRecurringInvoice(
  recurringId: string,
  userId: string,
  updates: RecurringInvoiceUpdate
): Promise<RecurringInvoice> {
  logger.info('Updating recurring invoice', { recurringId, userId })

  const supabase = await createClient()

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  }

  if (updates.items !== undefined) {
    updateData.items = updates.items
    const { subtotal } = calculateTotal(
      updates.items,
      updates.taxRate ?? 0,
      updates.discount ?? 0
    )
    updateData.subtotal = subtotal
  }
  if (updates.taxRate !== undefined) updateData.tax_rate = updates.taxRate
  if (updates.discount !== undefined) updateData.discount = updates.discount
  if (updates.billingCycle !== undefined) updateData.billing_cycle = updates.billingCycle
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate
  if (updates.totalOccurrences !== undefined) updateData.total_occurrences = updates.totalOccurrences
  if (updates.autoSend !== undefined) updateData.auto_send = updates.autoSend
  if (updates.paymentTermsDays !== undefined) updateData.payment_terms_days = updates.paymentTermsDays
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.terms !== undefined) updateData.terms = updates.terms
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive

  const { data: updated, error } = await supabase
    .from('recurring_invoices')
    .update(updateData)
    .eq('id', recurringId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update recurring invoice', { error: error.message })
    throw new Error(`Failed to update recurring invoice: ${error.message}`)
  }

  return mapDbToRecurringInvoice(updated)
}

/**
 * Pause a recurring invoice
 */
export async function pauseRecurringInvoice(
  recurringId: string,
  userId: string,
  reason?: string
): Promise<RecurringInvoice> {
  logger.info('Pausing recurring invoice', { recurringId, userId, reason })

  const supabase = await createClient()

  const { data: current } = await supabase
    .from('recurring_invoices')
    .select('metadata')
    .eq('id', recurringId)
    .eq('user_id', userId)
    .single()

  const metadata = {
    ...(current?.metadata || {}),
    pausedAt: new Date().toISOString(),
    pauseReason: reason
  }

  const { data: updated, error } = await supabase
    .from('recurring_invoices')
    .update({
      is_active: false,
      metadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', recurringId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to pause recurring invoice: ${error.message}`)
  }

  return mapDbToRecurringInvoice(updated)
}

/**
 * Resume a paused recurring invoice
 */
export async function resumeRecurringInvoice(
  recurringId: string,
  userId: string
): Promise<RecurringInvoice> {
  logger.info('Resuming recurring invoice', { recurringId, userId })

  const supabase = await createClient()

  // Get current state
  const { data: current } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('id', recurringId)
    .eq('user_id', userId)
    .single()

  if (!current) {
    throw new Error('Recurring invoice not found')
  }

  // Calculate next billing date from today if past
  let nextBillingDate = new Date(current.next_billing_date)
  const today = new Date()

  while (nextBillingDate < today) {
    nextBillingDate = calculateNextBillingDate(nextBillingDate, current.billing_cycle)
  }

  const metadata = {
    ...(current.metadata || {}),
    pausedAt: undefined,
    pauseReason: undefined
  }

  const { data: updated, error } = await supabase
    .from('recurring_invoices')
    .update({
      is_active: true,
      next_billing_date: nextBillingDate.toISOString(),
      metadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', recurringId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to resume recurring invoice: ${error.message}`)
  }

  return mapDbToRecurringInvoice(updated)
}

/**
 * Cancel a recurring invoice (soft delete)
 */
export async function cancelRecurringInvoice(
  recurringId: string,
  userId: string
): Promise<void> {
  logger.info('Cancelling recurring invoice', { recurringId, userId })

  const supabase = await createClient()

  const { error } = await supabase
    .from('recurring_invoices')
    .update({
      is_active: false,
      end_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', recurringId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to cancel recurring invoice: ${error.message}`)
  }
}

/**
 * Get recurring invoice by ID
 */
export async function getRecurringInvoice(
  recurringId: string,
  userId: string
): Promise<RecurringInvoice | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('id', recurringId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return mapDbToRecurringInvoice(data)
}

/**
 * List recurring invoices for a user
 */
export async function listRecurringInvoices(
  userId: string,
  options?: {
    isActive?: boolean
    clientId?: string
    billingCycle?: BillingCycle
    limit?: number
    offset?: number
  }
): Promise<{ invoices: RecurringInvoice[]; total: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('recurring_invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive)
  }
  if (options?.clientId) {
    query = query.eq('client_id', options.clientId)
  }
  if (options?.billingCycle) {
    query = query.eq('billing_cycle', options.billingCycle)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(
      options?.offset || 0,
      (options?.offset || 0) + (options?.limit || 50) - 1
    )

  const { data, error, count } = await query

  if (error) {
    logger.error('Failed to list recurring invoices', { error: error.message })
    throw new Error(`Failed to list recurring invoices: ${error.message}`)
  }

  return {
    invoices: (data || []).map(mapDbToRecurringInvoice),
    total: count || 0
  }
}

// ============================================================================
// Invoice Generation
// ============================================================================

/**
 * Generate invoice from recurring invoice
 */
export async function generateInvoiceFromRecurring(
  recurring: RecurringInvoice,
  userId: string
): Promise<Invoice> {
  logger.info('Generating invoice from recurring', {
    recurringId: recurring.id,
    billingCycle: recurring.billingCycle
  })

  const supabase = await createClient()

  const { subtotal, taxAmount, discountAmount, total } = calculateTotal(
    recurring.items,
    recurring.taxRate,
    recurring.discount
  )

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + recurring.paymentTermsDays)

  const invoiceNumber = generateInvoiceNumber()

  const invoice: Partial<Invoice> = {
    invoiceNumber,
    status: recurring.autoSend ? 'sent' : 'draft',
    clientId: recurring.clientId,
    clientName: recurring.clientName,
    clientEmail: recurring.clientEmail,
    items: recurring.items,
    subtotal,
    taxRate: recurring.taxRate,
    taxAmount,
    discount: discountAmount,
    total,
    currency: recurring.currency,
    dueDate,
    issueDate: new Date(),
    notes: recurring.notes,
    terms: recurring.terms,
    createdBy: userId,
    sentAt: recurring.autoSend ? new Date() : undefined,
    recurringConfig: {
      enabled: true,
      cycle: recurring.billingCycle,
      startDate: recurring.startDate,
      endDate: recurring.endDate,
      nextInvoiceDate: calculateNextBillingDate(new Date(), recurring.billingCycle),
      lastInvoiceDate: new Date()
    },
    metadata: {
      remindersSent: 0,
      autoPayEnabled: false,
      latePaymentFee: 0,
      earlyPaymentDiscount: 0
    }
  }

  // Insert invoice
  const { data: createdInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoice.invoiceNumber,
      status: invoice.status,
      client_id: invoice.clientId,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax_rate: invoice.taxRate,
      tax_amount: invoice.taxAmount,
      discount: invoice.discount,
      total: invoice.total,
      currency: invoice.currency,
      due_date: invoice.dueDate,
      issue_date: invoice.issueDate,
      notes: invoice.notes,
      terms: invoice.terms,
      user_id: userId,
      sent_at: invoice.sentAt,
      recurring_invoice_id: recurring.id,
      metadata: invoice.metadata
    })
    .select()
    .single()

  if (invoiceError) {
    logger.error('Failed to create invoice from recurring', { error: invoiceError.message })
    throw new Error(`Failed to generate invoice: ${invoiceError.message}`)
  }

  // Update recurring invoice
  const nextBillingDate = calculateNextBillingDate(new Date(), recurring.billingCycle)
  const completedOccurrences = recurring.completedOccurrences + 1
  const generatedInvoiceIds = [...(recurring.metadata.generatedInvoiceIds || []), createdInvoice.id]

  // Check if recurring should end
  const shouldEnd = (
    (recurring.totalOccurrences && completedOccurrences >= recurring.totalOccurrences) ||
    (recurring.endDate && nextBillingDate > recurring.endDate)
  )

  await supabase
    .from('recurring_invoices')
    .update({
      next_billing_date: shouldEnd ? null : nextBillingDate.toISOString(),
      last_billing_date: new Date().toISOString(),
      completed_occurrences: completedOccurrences,
      is_active: !shouldEnd,
      metadata: {
        ...recurring.metadata,
        generatedInvoiceIds
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', recurring.id)

  logger.info('Invoice generated from recurring', {
    invoiceId: createdInvoice.id,
    invoiceNumber,
    completedOccurrences,
    shouldEnd
  })

  return mapDbToInvoice(createdInvoice)
}

/**
 * Process all due recurring invoices
 * This should be called by a cron job or scheduler
 */
export async function processRecurringInvoices(): Promise<ScheduleResult> {
  logger.info('Processing recurring invoices')

  const supabase = await createClient()

  // Get all active recurring invoices due today or earlier
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of day

  const { data: dueRecurring, error: fetchError } = await supabase
    .from('recurring_invoices')
    .select('*')
    .eq('is_active', true)
    .lte('next_billing_date', today.toISOString())
    .neq('billing_cycle', 'one-time')

  if (fetchError) {
    logger.error('Failed to fetch due recurring invoices', { error: fetchError.message })
    throw new Error(`Failed to fetch recurring invoices: ${fetchError.message}`)
  }

  const result: ScheduleResult = {
    processed: 0,
    generated: 0,
    sent: 0,
    errors: []
  }

  for (const dbRecurring of dueRecurring || []) {
    result.processed++
    const recurring = mapDbToRecurringInvoice(dbRecurring)

    try {
      const invoice = await generateInvoiceFromRecurring(recurring, recurring.userId)
      result.generated++

      if (recurring.autoSend) {
        // Send invoice email
        try {
          await sendInvoiceEmail(invoice)
          result.sent++
        } catch (emailError) {
          logger.warn('Failed to send invoice email', {
            invoiceId: invoice.id,
            error: emailError instanceof Error ? emailError.message : 'Unknown error'
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push({
        recurringId: recurring.id,
        error: errorMessage
      })

      // Update recurring with error
      await supabase
        .from('recurring_invoices')
        .update({
          metadata: {
            ...recurring.metadata,
            lastError: errorMessage,
            lastErrorDate: new Date().toISOString()
          }
        })
        .eq('id', recurring.id)
    }
  }

  logger.info('Recurring invoices processed', result)

  return result
}

// ============================================================================
// Email Functions
// ============================================================================

/**
 * Send invoice email for recurring invoice
 */
async function sendInvoiceEmail(invoice: Invoice): Promise<void> {
  logger.info('Sending invoice email', {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientEmail: invoice.clientEmail
  })

  try {
    await sendRecurringInvoiceCreated({
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      items: invoice.items,
      viewInvoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}`,
      payNowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
      billingCycle: invoice.recurringConfig?.cycle || 'monthly'
    })

    logger.info('Invoice email sent successfully', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber
    })
  } catch (emailError) {
    logger.error('Failed to send invoice email', {
      invoiceId: invoice.id,
      error: emailError instanceof Error ? emailError.message : 'Unknown error'
    })
    throw emailError
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map database row to RecurringInvoice type
 */
function mapDbToRecurringInvoice(row: any): RecurringInvoice {
  return {
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    templateId: row.template_id,
    items: row.items || [],
    subtotal: parseFloat(row.subtotal) || 0,
    taxRate: parseFloat(row.tax_rate) || 0,
    discount: parseFloat(row.discount) || 0,
    currency: row.currency || 'USD',
    billingCycle: row.billing_cycle,
    startDate: new Date(row.start_date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    nextBillingDate: new Date(row.next_billing_date),
    lastBillingDate: row.last_billing_date ? new Date(row.last_billing_date) : undefined,
    totalOccurrences: row.total_occurrences,
    completedOccurrences: row.completed_occurrences || 0,
    isActive: row.is_active,
    autoSend: row.auto_send,
    paymentTermsDays: row.payment_terms_days || 30,
    notes: row.notes,
    terms: row.terms,
    metadata: row.metadata || { generatedInvoiceIds: [] },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

/**
 * Map database row to Invoice type
 */
function mapDbToInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    status: row.status,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    items: row.items || [],
    subtotal: parseFloat(row.subtotal) || 0,
    taxRate: parseFloat(row.tax_rate) || 0,
    taxAmount: parseFloat(row.tax_amount) || 0,
    discount: parseFloat(row.discount) || 0,
    total: parseFloat(row.total) || 0,
    currency: row.currency || 'USD',
    dueDate: new Date(row.due_date),
    issueDate: new Date(row.issue_date),
    paidDate: row.paid_date ? new Date(row.paid_date) : undefined,
    notes: row.notes,
    terms: row.terms,
    createdBy: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    viewedAt: row.viewed_at ? new Date(row.viewed_at) : undefined,
    metadata: row.metadata || {
      remindersSent: 0,
      autoPayEnabled: false,
      latePaymentFee: 0,
      earlyPaymentDiscount: 0
    }
  } as Invoice
}

export default {
  createRecurringInvoice,
  updateRecurringInvoice,
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  cancelRecurringInvoice,
  getRecurringInvoice,
  listRecurringInvoices,
  generateInvoiceFromRecurring,
  processRecurringInvoices,
  calculateNextBillingDate,
  getBillingCycleLabel
}
