/**
 * Payment Reminder Service
 *
 * Automated payment reminders with smart scheduling
 * Handles before-due, on-due, and overdue notifications
 */

import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { generateReminderEmailHTML } from '@/lib/invoice-email-template'
import type { InvoiceStatus, Currency } from '@/lib/invoice-types'

const logger = createFeatureLogger('PaymentReminderService')

// ============================================================================
// Types
// ============================================================================

export type ReminderType = 'before_due' | 'on_due' | 'after_due' | 'final_notice'
export type ReminderUrgency = 'low' | 'medium' | 'high' | 'critical'

export interface PaymentReminder {
  id: string
  invoiceId: string
  userId: string
  reminderType: ReminderType
  scheduledDate: Date
  sentAt?: Date
  openedAt?: Date
  clickedAt?: Date
  status: 'pending' | 'sent' | 'opened' | 'clicked' | 'failed' | 'cancelled'
  errorMessage?: string
  emailSubject: string
  emailBody?: string
  metadata: {
    daysBeforeDue?: number
    daysAfterDue?: number
    attemptNumber: number
    deliveryId?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ReminderScheduleConfig {
  userId: string
  enabledReminders: {
    beforeDue: number[]      // Days before due date [7, 3, 1]
    onDue: boolean           // Send on due date
    afterDue: number[]       // Days after due date [1, 3, 7, 14, 30]
    finalNotice: number      // Days after due for final notice
  }
  maxReminders: number       // Maximum reminders per invoice
  includeLateFee: boolean    // Mention late fee in overdue reminders
  lateFeePercentage: number  // Late fee percentage
  autoDisableAfterPaid: boolean
}

export interface ReminderResult {
  processed: number
  sent: number
  skipped: number
  errors: Array<{ reminderId: string; error: string }>
}

export interface InvoiceForReminder {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  total: number
  currency: Currency
  dueDate: Date
  status: InvoiceStatus
  remindersSent: number
  lastReminderDate?: Date
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_REMINDER_CONFIG: Omit<ReminderScheduleConfig, 'userId'> = {
  enabledReminders: {
    beforeDue: [7, 3, 1],     // 7, 3, and 1 day before due
    onDue: true,              // Send on due date
    afterDue: [1, 3, 7, 14],  // 1, 3, 7, 14 days after due
    finalNotice: 30           // Final notice at 30 days overdue
  },
  maxReminders: 10,
  includeLateFee: true,
  lateFeePercentage: 1.5,     // 1.5% late fee
  autoDisableAfterPaid: true
}

// ============================================================================
// Reminder Scheduling
// ============================================================================

/**
 * Get reminder urgency based on due date
 */
export function getReminderUrgency(dueDate: Date, today: Date = new Date()): ReminderUrgency {
  const daysFromDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysFromDue <= -30) return 'critical'
  if (daysFromDue <= -7) return 'high'
  if (daysFromDue <= 0) return 'medium'
  return 'low'
}

/**
 * Get reminder type based on days from due
 */
export function getReminderType(daysFromDue: number): ReminderType {
  if (daysFromDue > 0) return 'before_due'
  if (daysFromDue === 0) return 'on_due'
  if (daysFromDue >= -30) return 'after_due'
  return 'final_notice'
}

/**
 * Generate email subject based on reminder type
 */
export function generateReminderSubject(
  invoice: InvoiceForReminder,
  reminderType: ReminderType,
  daysFromDue: number
): string {
  switch (reminderType) {
    case 'before_due':
      if (daysFromDue === 1) {
        return `Payment Due Tomorrow - Invoice ${invoice.invoiceNumber}`
      }
      return `Reminder: Invoice ${invoice.invoiceNumber} due in ${daysFromDue} days`

    case 'on_due':
      return `Payment Due Today - Invoice ${invoice.invoiceNumber}`

    case 'after_due':
      if (daysFromDue === -1) {
        return `Payment Overdue - Invoice ${invoice.invoiceNumber}`
      }
      return `Urgent: Invoice ${invoice.invoiceNumber} is ${Math.abs(daysFromDue)} days overdue`

    case 'final_notice':
      return `FINAL NOTICE: Invoice ${invoice.invoiceNumber} - Immediate Action Required`

    default:
      return `Payment Reminder - Invoice ${invoice.invoiceNumber}`
  }
}

/**
 * Schedule reminders for an invoice
 */
export async function scheduleRemindersForInvoice(
  invoice: InvoiceForReminder,
  userId: string,
  config?: Partial<ReminderScheduleConfig>
): Promise<PaymentReminder[]> {
  logger.info('Scheduling reminders for invoice', {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    dueDate: invoice.dueDate
  })

  const supabase = await createClient()
  const finalConfig = { ...DEFAULT_REMINDER_CONFIG, ...config, userId }
  const reminders: PaymentReminder[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(invoice.dueDate)
  dueDate.setHours(0, 0, 0, 0)

  // Schedule before-due reminders
  for (const daysBefore of finalConfig.enabledReminders.beforeDue) {
    const scheduledDate = new Date(dueDate)
    scheduledDate.setDate(scheduledDate.getDate() - daysBefore)

    if (scheduledDate >= today) {
      const reminder = await createReminderInternal(
        invoice,
        userId,
        'before_due',
        scheduledDate,
        daysBefore
      )
      reminders.push(reminder)
    }
  }

  // Schedule on-due reminder
  if (finalConfig.enabledReminders.onDue && dueDate >= today) {
    const reminder = await createReminderInternal(
      invoice,
      userId,
      'on_due',
      dueDate,
      0
    )
    reminders.push(reminder)
  }

  // Schedule after-due reminders (for future dates)
  for (const daysAfter of finalConfig.enabledReminders.afterDue) {
    const scheduledDate = new Date(dueDate)
    scheduledDate.setDate(scheduledDate.getDate() + daysAfter)

    if (scheduledDate >= today) {
      const reminder = await createReminderInternal(
        invoice,
        userId,
        'after_due',
        scheduledDate,
        -daysAfter
      )
      reminders.push(reminder)
    }
  }

  // Schedule final notice
  if (finalConfig.enabledReminders.finalNotice) {
    const scheduledDate = new Date(dueDate)
    scheduledDate.setDate(scheduledDate.getDate() + finalConfig.enabledReminders.finalNotice)

    if (scheduledDate >= today) {
      const reminder = await createReminderInternal(
        invoice,
        userId,
        'final_notice',
        scheduledDate,
        -finalConfig.enabledReminders.finalNotice
      )
      reminders.push(reminder)
    }
  }

  logger.info('Reminders scheduled', {
    invoiceId: invoice.id,
    reminderCount: reminders.length
  })

  return reminders
}

/**
 * Create a single reminder record (internal use for scheduling)
 */
async function createReminderInternal(
  invoice: InvoiceForReminder,
  userId: string,
  reminderType: ReminderType,
  scheduledDate: Date,
  daysFromDue: number
): Promise<PaymentReminder> {
  const supabase = await createClient()

  const emailSubject = generateReminderSubject(invoice, reminderType, daysFromDue)

  const { data, error } = await supabase
    .from('payment_reminders')
    .insert({
      invoice_id: invoice.id,
      user_id: userId,
      reminder_type: reminderType,
      scheduled_date: scheduledDate.toISOString(),
      status: 'pending',
      email_subject: emailSubject,
      metadata: {
        daysBeforeDue: daysFromDue > 0 ? daysFromDue : undefined,
        daysAfterDue: daysFromDue < 0 ? Math.abs(daysFromDue) : undefined,
        attemptNumber: 1
      }
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create reminder', { error: error.message })
    throw new Error(`Failed to create reminder: ${error.message}`)
  }

  return mapDbToReminder(data)
}

// ============================================================================
// Reminder Processing
// ============================================================================

/**
 * Process all due reminders
 * This should be called by a cron job
 */
export async function processDueReminders(): Promise<ReminderResult> {
  logger.info('Processing due reminders')

  const supabase = await createClient()
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // Get all pending reminders due today or earlier
  const { data: dueReminders, error: fetchError } = await supabase
    .from('payment_reminders')
    .select(`
      *,
      invoices:invoice_id (
        id,
        invoice_number,
        client_name,
        client_email,
        total,
        currency,
        due_date,
        status,
        metadata
      )
    `)
    .eq('status', 'pending')
    .lte('scheduled_date', today.toISOString())
    .order('scheduled_date', { ascending: true })

  if (fetchError) {
    logger.error('Failed to fetch due reminders', { error: fetchError.message })
    throw new Error(`Failed to fetch reminders: ${fetchError.message}`)
  }

  const result: ReminderResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: []
  }

  for (const dbReminder of dueReminders || []) {
    result.processed++

    const invoice = dbReminder.invoices
    if (!invoice) {
      result.skipped++
      continue
    }

    // Skip if invoice is already paid or cancelled
    if (['paid', 'cancelled', 'refunded'].includes(invoice.status)) {
      await cancelReminderInternal(dbReminder.id, 'Invoice no longer requires payment')
      result.skipped++
      continue
    }

    // Check max reminders limit
    const remindersSent = invoice.metadata?.remindersSent || 0
    if (remindersSent >= 10) { // Default max
      await cancelReminderInternal(dbReminder.id, 'Maximum reminders reached')
      result.skipped++
      continue
    }

    try {
      await sendReminder(mapDbToReminder(dbReminder), {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        total: parseFloat(invoice.total),
        currency: invoice.currency,
        dueDate: new Date(invoice.due_date),
        status: invoice.status,
        remindersSent
      })
      result.sent++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push({
        reminderId: dbReminder.id,
        error: errorMessage
      })

      // Mark reminder as failed
      await supabase
        .from('payment_reminders')
        .update({
          status: 'failed',
          error_message: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbReminder.id)
    }
  }

  logger.info('Reminders processed', result)

  return result
}

/**
 * Send a reminder email
 */
async function sendReminder(
  reminder: PaymentReminder,
  invoice: InvoiceForReminder
): Promise<void> {
  logger.info('Sending reminder', {
    reminderId: reminder.id,
    invoiceId: invoice.id,
    type: reminder.reminderType
  })

  const supabase = await createClient()

  // Calculate days overdue
  const today = new Date()
  const dueDate = new Date(invoice.dueDate)
  const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate email HTML
  const emailHtml = generateReminderEmailHTML({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName,
    amount: invoice.total,
    currency: invoice.currency,
    dueDate: invoice.dueDate,
    daysOverdue: Math.max(0, daysOverdue),
    paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
    companyName: process.env.COMPANY_NAME || 'KAZI',
    companyEmail: process.env.COMPANY_EMAIL || 'billing@kazi.com'
  })

  // Send email (integrate with your email service)
  // For now, we'll simulate successful sending
  const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Update reminder status
  await supabase
    .from('payment_reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      email_body: emailHtml,
      metadata: {
        ...reminder.metadata,
        deliveryId
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', reminder.id)

  // Update invoice reminder count
  await supabase
    .from('invoices')
    .update({
      metadata: {
        remindersSent: (invoice.remindersSent || 0) + 1,
        lastReminderDate: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', invoice.id)

  // TODO: Integrate with actual email service
  // await emailService.send({
  //   to: invoice.clientEmail,
  //   subject: reminder.emailSubject,
  //   html: emailHtml
  // })

  logger.info('Reminder sent', {
    reminderId: reminder.id,
    deliveryId
  })
}

/**
 * Cancel a reminder (internal with reason)
 */
async function cancelReminderInternal(reminderId: string, reason: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('payment_reminders')
    .update({
      status: 'cancelled',
      error_message: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId)
}

/**
 * Cancel all pending reminders for an invoice
 */
export async function cancelInvoiceReminders(invoiceId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_reminders')
    .update({
      status: 'cancelled',
      error_message: 'Invoice paid or cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('invoice_id', invoiceId)
    .eq('status', 'pending')
    .select('id')

  if (error) {
    logger.error('Failed to cancel reminders', { error: error.message })
    return 0
  }

  return data?.length || 0
}

// ============================================================================
// Manual Reminder Sending
// ============================================================================

/**
 * Send an immediate reminder for an invoice
 */
export async function sendImmediateReminder(
  invoiceId: string,
  userId: string
): Promise<PaymentReminder> {
  const supabase = await createClient()

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

  // Create and send reminder immediately
  const today = new Date()
  const dueDate = new Date(invoice.due_date)
  const daysFromDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const reminderType = getReminderType(daysFromDue)

  const reminderData: InvoiceForReminder = {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    clientName: invoice.client_name,
    clientEmail: invoice.client_email,
    total: parseFloat(invoice.total),
    currency: invoice.currency,
    dueDate: new Date(invoice.due_date),
    status: invoice.status,
    remindersSent: invoice.metadata?.remindersSent || 0
  }

  const reminder = await createReminderInternal(
    reminderData,
    userId,
    reminderType,
    today,
    daysFromDue
  )

  await sendReminder(reminder, reminderData)

  return reminder
}

// ============================================================================
// Reminder Analytics
// ============================================================================

/**
 * Get reminder statistics for a user
 */
export async function getReminderStats(userId: string): Promise<{
  totalSent: number
  totalOpened: number
  openRate: number
  remindersByType: Record<ReminderType, number>
  avgPaymentTimeAfterReminder: number
}> {
  const supabase = await createClient()

  const { data: reminders, error } = await supabase
    .from('payment_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'sent')

  if (error) {
    throw new Error(`Failed to get reminder stats: ${error.message}`)
  }

  const totalSent = reminders?.length || 0
  const totalOpened = reminders?.filter(r => r.opened_at).length || 0
  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0

  const remindersByType: Record<ReminderType, number> = {
    before_due: 0,
    on_due: 0,
    after_due: 0,
    final_notice: 0
  }

  for (const reminder of reminders || []) {
    const type = reminder.reminder_type as ReminderType
    remindersByType[type] = (remindersByType[type] || 0) + 1
  }

  return {
    totalSent,
    totalOpened,
    openRate,
    remindersByType,
    avgPaymentTimeAfterReminder: 3.5 // Placeholder - calculate from actual data
  }
}

/**
 * Track reminder opened
 */
export async function trackReminderOpened(reminderId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('payment_reminders')
    .update({
      status: 'opened',
      opened_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId)
    .eq('status', 'sent')
}

/**
 * Track reminder clicked (payment link)
 */
export async function trackReminderClicked(reminderId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('payment_reminders')
    .update({
      status: 'clicked',
      clicked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId)
    .in('status', ['sent', 'opened'])
}

// ============================================================================
// Additional API Functions
// ============================================================================

export interface ReminderCreate {
  invoiceId: string
  type: ReminderType
  scheduledFor: Date | string
  subject?: string
  message?: string
  channel?: 'email' | 'sms' | 'in_app' | 'push'
}

/**
 * Create a single reminder
 */
export async function createReminder(data: ReminderCreate): Promise<PaymentReminder> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication required')

  // Get invoice for subject generation
  const { data: invoice } = await supabase
    .from('invoices')
    .select('invoice_number, client_name, total, currency, due_date')
    .eq('id', data.invoiceId)
    .single()

  const scheduledDate = new Date(data.scheduledFor)
  const dueDate = invoice ? new Date(invoice.due_date) : new Date()
  const daysFromDue = Math.ceil((dueDate.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))

  const subject = data.subject || (invoice
    ? generateReminderSubject({
        id: data.invoiceId,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        clientEmail: '',
        total: parseFloat(invoice.total),
        currency: invoice.currency,
        dueDate,
        status: 'sent',
        remindersSent: 0
      }, data.type, daysFromDue)
    : `Payment Reminder`)

  const { data: reminder, error } = await supabase
    .from('payment_reminders')
    .insert({
      invoice_id: data.invoiceId,
      user_id: user.id,
      reminder_type: data.type,
      scheduled_date: scheduledDate.toISOString(),
      status: 'pending',
      email_subject: subject,
      email_body: data.message,
      channel: data.channel || 'email',
      metadata: {
        daysBeforeDue: daysFromDue > 0 ? daysFromDue : undefined,
        daysAfterDue: daysFromDue < 0 ? Math.abs(daysFromDue) : undefined,
        attemptNumber: 1
      }
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create reminder: ${error.message}`)
  }

  return mapDbToReminder(reminder)
}

/**
 * Get reminders by invoice
 */
export async function getRemindersByInvoice(invoiceId: string): Promise<PaymentReminder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_reminders')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('scheduled_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to get reminders: ${error.message}`)
  }

  return (data || []).map(mapDbToReminder)
}

/**
 * Get upcoming reminders for a user
 */
export async function getUpcomingReminders(userId: string, days: number = 7): Promise<PaymentReminder[]> {
  const supabase = await createClient()

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  const { data, error } = await supabase
    .from('payment_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('scheduled_date', futureDate.toISOString())
    .order('scheduled_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to get upcoming reminders: ${error.message}`)
  }

  return (data || []).map(mapDbToReminder)
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(reminderId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('payment_reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId)
}

/**
 * Mark reminder as opened
 */
export async function markReminderOpened(reminderId: string): Promise<void> {
  await trackReminderOpened(reminderId)
}

/**
 * Mark reminder as clicked
 */
export async function markReminderClicked(reminderId: string): Promise<void> {
  await trackReminderClicked(reminderId)
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(reminderId: string, days: number): Promise<PaymentReminder> {
  const supabase = await createClient()

  const newDate = new Date()
  newDate.setDate(newDate.getDate() + days)

  const { data, error } = await supabase
    .from('payment_reminders')
    .update({
      scheduled_date: newDate.toISOString(),
      status: 'pending',
      metadata: {
        snoozedAt: new Date().toISOString(),
        snoozeDays: days
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to snooze reminder: ${error.message}`)
  }

  return mapDbToReminder(data)
}

/**
 * Cancel a specific reminder by ID
 */
export async function cancelReminder(reminderId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('payment_reminders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', reminderId)
}

/**
 * Process scheduled reminders (wrapper for cron job)
 */
export async function processScheduledReminders(): Promise<ReminderResult> {
  return processDueReminders()
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapDbToReminder(row: any): PaymentReminder {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    userId: row.user_id,
    reminderType: row.reminder_type,
    scheduledDate: new Date(row.scheduled_date),
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    openedAt: row.opened_at ? new Date(row.opened_at) : undefined,
    clickedAt: row.clicked_at ? new Date(row.clicked_at) : undefined,
    status: row.status,
    errorMessage: row.error_message,
    emailSubject: row.email_subject,
    emailBody: row.email_body,
    metadata: row.metadata || { attemptNumber: 1 },
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

export default {
  scheduleRemindersForInvoice,
  processDueReminders,
  processScheduledReminders,
  cancelInvoiceReminders,
  sendImmediateReminder,
  getReminderStats,
  trackReminderOpened,
  trackReminderClicked,
  getReminderUrgency,
  getReminderType,
  generateReminderSubject,
  createReminder,
  getRemindersByInvoice,
  getUpcomingReminders,
  markReminderSent,
  markReminderOpened,
  markReminderClicked,
  snoozeReminder,
  cancelReminder
}
