// Invoicing Queries - Supabase integration for invoice and billing management
// Handles invoices, payments, templates, and reminders

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

const logger = createSimpleLogger('invoicing')

// ============================================================================
// Types
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'crypto' | 'cash' | 'check'

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  client_id?: string
  client_name: string
  client_email: string
  client_address: Record<string, JsonValue>
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  total: number
  currency: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  paid_date?: string
  sent_at?: string
  viewed_at?: string
  payment_method?: PaymentMethod
  payment_reference?: string
  notes?: string
  terms?: string
  pdf_url?: string
  is_recurring: boolean
  recurring_config: Record<string, JsonValue>
  reminders_sent: number
  last_reminder_at?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

export interface InvoicePayment {
  id: string
  invoice_id: string
  user_id: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transaction_id?: string
  processing_fee: number
  net_amount: number
  payment_date: string
  notes?: string
  refund_id?: string
  refund_amount?: number
  refund_reason?: string
  refund_date?: string
  created_at: string
  updated_at: string
}

export interface InvoiceTemplate {
  id: string
  user_id: string
  name: string
  description?: string
  items: InvoiceItem[]
  tax_rate: number
  discount: number
  terms?: string
  notes?: string
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface InvoiceReminder {
  id: string
  invoice_id: string
  user_id: string
  reminder_type: 'before_due' | 'on_due' | 'after_due'
  days_offset: number
  sent: boolean
  sent_at?: string
  opened: boolean
  opened_at?: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  created_at: string
}

export interface BillingStats {
  totalRevenue: number
  pendingInvoices: number
  pendingAmount: number
  paidInvoices: number
  paidAmount: number
  overdueInvoices: number
  overdueAmount: number
  averageInvoiceValue: number
}

// ============================================================================
// Invoice Management
// ============================================================================

/**
 * Get all invoices for a user with optional filtering
 */
export async function getInvoices(
  userId: string,
  filters?: {
    status?: InvoiceStatus
    clientId?: string
    search?: string
    dateRange?: { from: string; to: string }
  }
): Promise<{ data: Invoice[]; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }
    if (filters?.search) {
      query = query.or(`invoice_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`)
    }
    if (filters?.dateRange) {
      query = query.gte('issue_date', filters.dateRange.from).lte('issue_date', filters.dateRange.to)
    }

    const { data, error } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching invoices', { error: error.message, userId, filters, duration })
      return { data: [], error }
    }

    logger.info('Invoices fetched successfully', { userId, count: data.length, filters, duration })
    return { data: data as Invoice[], error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getInvoices', { error: dbError.message, userId })
    return { data: [], error: dbError }
  }
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(invoiceId: string, userId: string): Promise<{ data: Invoice | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching invoice', { error: error.message, invoiceId, userId, duration })
      return { data: null, error }
    }

    logger.info('Invoice fetched successfully', { invoiceId, userId, duration })
    return { data: data as Invoice, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getInvoice', { error: dbError.message, invoiceId, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  userId: string,
  invoice: {
    client_id?: string
    client_name: string
    client_email: string
    client_address?: Record<string, JsonValue>
    items: InvoiceItem[]
    subtotal: number
    tax_rate?: number
    tax_amount?: number
    discount?: number
    total: number
    currency?: string
    status?: InvoiceStatus
    issue_date?: string
    due_date: string
    notes?: string
    terms?: string
    is_recurring?: boolean
    recurring_config?: Record<string, JsonValue>
    created_by?: string
  }
): Promise<{ data: Invoice | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Generate invoice number
    const { data: invoiceNumber, error: numberError } = await supabase.rpc('generate_invoice_number', {
      p_user_id: userId,
      p_prefix: 'INV'
    })

    if (numberError) {
      logger.error('Error generating invoice number', { error: numberError.message, userId })
      return { data: null, error: numberError }
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        client_id: invoice.client_id,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        client_address: invoice.client_address || {},
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax_rate: invoice.tax_rate || 0,
        tax_amount: invoice.tax_amount || 0,
        discount: invoice.discount || 0,
        total: invoice.total,
        currency: invoice.currency || 'USD',
        status: invoice.status || 'draft',
        issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date,
        notes: invoice.notes,
        terms: invoice.terms,
        is_recurring: invoice.is_recurring || false,
        recurring_config: invoice.recurring_config || {},
        created_by: invoice.created_by,
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating invoice', { error: error.message, userId, duration })
      return { data: null, error }
    }

    logger.info('Invoice created successfully', { invoiceId: data.id, invoiceNumber, userId, total: invoice.total, duration })
    return { data: data as Invoice, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in createInvoice', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  invoiceId: string,
  userId: string,
  updates: Partial<Omit<Invoice, 'id' | 'user_id' | 'invoice_number' | 'created_at' | 'updated_at'>>
): Promise<{ data: Invoice | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating invoice', { error: error.message, invoiceId, userId, duration })
      return { data: null, error }
    }

    logger.info('Invoice updated successfully', { invoiceId, userId, updates: Object.keys(updates), duration })
    return { data: data as Invoice, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in updateInvoice', { error: dbError.message, invoiceId, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(invoiceId: string, userId: string): Promise<{ success: boolean; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error deleting invoice', { error: error.message, invoiceId, userId, duration })
      return { success: false, error }
    }

    logger.info('Invoice deleted successfully', { invoiceId, userId, duration })
    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in deleteInvoice', { error: dbError.message, invoiceId, userId })
    return { success: false, error: dbError }
  }
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(invoiceId: string, userId: string): Promise<{ success: boolean; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error marking invoice as sent', { error: error.message, invoiceId, userId, duration })
      return { success: false, error }
    }

    logger.info('Invoice marked as sent', { invoiceId, userId, duration })
    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in markInvoiceAsSent', { error: dbError.message, invoiceId, userId })
    return { success: false, error: dbError }
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  userId: string,
  paymentDetails?: {
    payment_method?: PaymentMethod
    payment_reference?: string
  }
): Promise<{ success: boolean; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: paymentDetails?.payment_method,
        payment_reference: paymentDetails?.payment_reference
      })
      .eq('id', invoiceId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error marking invoice as paid', { error: error.message, invoiceId, userId, duration })
      return { success: false, error }
    }

    logger.info('Invoice marked as paid', { invoiceId, userId, duration })
    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in markInvoiceAsPaid', { error: dbError.message, invoiceId, userId })
    return { success: false, error: dbError }
  }
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices(userId: string): Promise<{ data: Invoice[]; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_overdue_invoices', {
      p_user_id: userId
    })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching overdue invoices', { error: error.message, userId, duration })
      return { data: [], error }
    }

    logger.info('Overdue invoices fetched successfully', { userId, count: data.length, duration })
    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getOverdueInvoices', { error: dbError.message, userId })
    return { data: [], error: dbError }
  }
}

// ============================================================================
// Payment Management
// ============================================================================

/**
 * Get all payments for an invoice
 */
export async function getInvoicePayments(invoiceId: string, userId: string): Promise<{ data: InvoicePayment[]; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('invoice_payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching invoice payments', { error: error.message, invoiceId, userId, duration })
      return { data: [], error }
    }

    logger.info('Invoice payments fetched successfully', { invoiceId, userId, count: data.length, duration })
    return { data: data as InvoicePayment[], error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getInvoicePayments', { error: dbError.message, invoiceId, userId })
    return { data: [], error: dbError }
  }
}

/**
 * Record a payment for an invoice
 */
export async function recordInvoicePayment(
  invoiceId: string,
  userId: string,
  payment: {
    amount: number
    currency?: string
    method: PaymentMethod
    status?: PaymentStatus
    transaction_id?: string
    processing_fee?: number
    notes?: string
  }
): Promise<{ data: InvoicePayment | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const net_amount = payment.amount - (payment.processing_fee || 0)

    const { data, error } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        user_id: userId,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        method: payment.method,
        status: payment.status || 'completed',
        transaction_id: payment.transaction_id,
        processing_fee: payment.processing_fee || 0,
        net_amount,
        notes: payment.notes
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error recording invoice payment', { error: error.message, invoiceId, userId, duration })
      return { data: null, error }
    }

    // If payment is completed, mark invoice as paid
    if (payment.status === 'completed') {
      await markInvoiceAsPaid(invoiceId, userId, {
        payment_method: payment.method,
        payment_reference: payment.transaction_id
      })
    }

    logger.info('Invoice payment recorded successfully', { paymentId: data.id, invoiceId, userId, amount: payment.amount, duration })
    return { data: data as InvoicePayment, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in recordInvoicePayment', { error: dbError.message, invoiceId, userId })
    return { data: null, error: dbError }
  }
}

// ============================================================================
// Template Management
// ============================================================================

/**
 * Get all invoice templates for a user
 */
export async function getInvoiceTemplates(userId: string): Promise<{ data: InvoiceTemplate[]; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('user_id', userId)
      .order('usage_count', { ascending: false })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching invoice templates', { error: error.message, userId, duration })
      return { data: [], error }
    }

    logger.info('Invoice templates fetched successfully', { userId, count: data.length, duration })
    return { data: data as InvoiceTemplate[], error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getInvoiceTemplates', { error: dbError.message, userId })
    return { data: [], error: dbError }
  }
}

/**
 * Create a new invoice template
 */
export async function createInvoiceTemplate(
  userId: string,
  template: {
    name: string
    description?: string
    items: InvoiceItem[]
    tax_rate?: number
    discount?: number
    terms?: string
    notes?: string
  }
): Promise<{ data: InvoiceTemplate | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('invoice_templates')
      .insert({
        user_id: userId,
        name: template.name,
        description: template.description,
        items: template.items,
        tax_rate: template.tax_rate || 0,
        discount: template.discount || 0,
        terms: template.terms,
        notes: template.notes
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating invoice template', { error: error.message, userId, duration })
      return { data: null, error }
    }

    logger.info('Invoice template created successfully', { templateId: data.id, userId, name: template.name, duration })
    return { data: data as InvoiceTemplate, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in createInvoiceTemplate', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Update template usage count
 */
export async function incrementTemplateUsage(templateId: string, userId: string): Promise<{ success: boolean; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('invoice_templates')
      .update({
        usage_count: supabase.sql`usage_count + 1`,
        last_used_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error incrementing template usage', { error: error.message, templateId, userId, duration })
      return { success: false, error }
    }

    logger.info('Template usage incremented', { templateId, userId, duration })
    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in incrementTemplateUsage', { error: dbError.message, templateId, userId })
    return { success: false, error: dbError }
  }
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * Get billing statistics for dashboard
 */
export async function getBillingStats(userId: string): Promise<{ data: BillingStats | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Get all invoices for the user
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('status, total')
      .eq('user_id', userId)

    if (error) {
      logger.error('Error fetching billing stats', { error: error.message, userId })
      return { data: null, error }
    }

    // Calculate statistics
    const stats: BillingStats = {
      totalRevenue: 0,
      pendingInvoices: 0,
      pendingAmount: 0,
      paidInvoices: 0,
      paidAmount: 0,
      overdueInvoices: 0,
      overdueAmount: 0,
      averageInvoiceValue: 0
    }

    invoices.forEach(invoice => {
      if (invoice.status === 'paid') {
        stats.paidInvoices++
        stats.paidAmount += invoice.total
        stats.totalRevenue += invoice.total
      } else if (invoice.status === 'overdue') {
        stats.overdueInvoices++
        stats.overdueAmount += invoice.total
      } else if (invoice.status === 'sent' || invoice.status === 'viewed') {
        stats.pendingInvoices++
        stats.pendingAmount += invoice.total
      }
    })

    stats.averageInvoiceValue = invoices.length > 0 ? stats.totalRevenue / invoices.length : 0

    const duration = performance.now() - startTime
    logger.info('Billing stats calculated successfully', { userId, stats, duration })

    return { data: stats, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getBillingStats', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}
