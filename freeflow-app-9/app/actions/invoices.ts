/**
 * Server Actions for Invoices Management
 *
 * Provides type-safe CRUD operations for invoices with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 */

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  uuidSchema,
  currencySchema,
  CreateInvoice,
  UpdateInvoice
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('invoices-actions')

// Payment data schema for marking as paid
const paymentDataSchema = z.object({
  amount: currencySchema.optional(),
  payment_method: z.string().max(100).optional(),
  payment_reference: z.string().max(255).optional(),
  payment_date: z.string().datetime().optional()
}).optional()

type PaymentData = z.infer<typeof paymentDataSchema>

/**
 * Create a new invoice
 */
export async function createInvoice(
  data: CreateInvoice
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createInvoiceSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    // Calculate totals if not provided
    const invoiceData = validation.data
    let subtotal = 0
    let taxAmount = 0

    if (invoiceData.items) {
      for (const item of invoiceData.items) {
        const itemTotal = item.quantity * item.unit_price
        const itemTax = itemTotal * (item.tax_rate || 0) / 100
        const itemDiscount = itemTotal * (item.discount || 0) / 100
        subtotal += itemTotal - itemDiscount
        taxAmount += itemTax
      }
    }

    const total = subtotal + taxAmount - (invoiceData.discount_amount || 0)

    // Insert invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: invoiceData.client_id,
        project_id: invoiceData.project_id,
        invoice_number: invoiceData.invoice_number,
        status: invoiceData.status || 'draft',
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        items: invoiceData.items,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: invoiceData.discount_amount || 0,
        total,
        currency: invoiceData.currency || 'USD',
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        payment_method: invoiceData.payment_method,
        metadata: invoiceData.metadata
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to create invoice', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Invoice created', { invoiceId: invoice.id, userId: user.id })
    revalidatePath('/dashboard/invoices-v2')

    return actionSuccess({ id: invoice.id }, 'Invoice created successfully')
  } catch (error) {
    logger.error('Unexpected error creating invoice', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  id: string,
  data: UpdateInvoice
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid invoice ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateInvoiceSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('invoices', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot modify this invoice', 'FORBIDDEN')
    }

    // Build update data
    const updateData = validation.data

    // Recalculate totals if items changed
    if (updateData.items) {
      let subtotal = 0
      let taxAmount = 0

      for (const item of updateData.items) {
        const itemTotal = item.quantity * item.unit_price
        const itemTax = itemTotal * (item.tax_rate || 0) / 100
        const itemDiscount = itemTotal * (item.discount || 0) / 100
        subtotal += itemTotal - itemDiscount
        taxAmount += itemTax
      }

      updateData.subtotal = subtotal
      updateData.tax_amount = taxAmount
      updateData.total = subtotal + taxAmount - (updateData.discount_amount || 0)
    }

    // Update invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update invoice', { error: error.message, invoiceId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Invoice updated', { invoiceId: id, userId: user.id })
    revalidatePath('/dashboard/invoices-v2')

    return actionSuccess({ id: invoice.id }, 'Invoice updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating invoice', { error, invoiceId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Soft delete an invoice
 */
export async function deleteInvoice(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid invoice ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canDelete = await hasPermission('delete')
    if (!canDelete) {
      return actionError('Permission denied: delete access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('invoices', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot delete this invoice', 'FORBIDDEN')
    }

    // Soft delete
    const { error } = await supabase
      .from('invoices')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete invoice', { error: error.message, invoiceId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Invoice deleted', { invoiceId: id, userId: user.id })
    revalidatePath('/dashboard/invoices-v2')

    return actionSuccess({ deleted: true }, 'Invoice deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting invoice', { error, invoiceId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid invoice ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update status
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to mark invoice as sent', { error: error.message, invoiceId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Invoice marked as sent', { invoiceId: id, userId: user.id })
    revalidatePath('/dashboard/invoices-v2')

    return actionSuccess({ status: invoice.status }, 'Invoice marked as sent')
  } catch (error) {
    logger.error('Unexpected error marking invoice as sent', { error, invoiceId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  id: string,
  paymentData?: PaymentData
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid invoice ID', 'VALIDATION_ERROR')
    }

    // Validate payment data if provided
    if (paymentData) {
      const paymentValidation = paymentDataSchema.safeParse(paymentData)
      if (!paymentValidation.success) {
        return actionValidationError(paymentValidation.error.errors)
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update status
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        amount_paid: paymentData?.amount || null,
        payment_method: paymentData?.payment_method || null,
        payment_reference: paymentData?.payment_reference || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to mark invoice as paid', { error: error.message, invoiceId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Invoice marked as paid', {
      invoiceId: id,
      userId: user.id,
      amount: paymentData?.amount
    })
    revalidatePath('/dashboard/invoices-v2')

    return actionSuccess({ status: invoice.status }, 'Invoice marked as paid')
  } catch (error) {
    logger.error('Unexpected error marking invoice as paid', { error, invoiceId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark invoice as overdue
 */
export async function markInvoiceAsOverdue(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid invoice ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'overdue',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/invoices-v2')
    return actionSuccess({ status: invoice.status }, 'Invoice marked as overdue')
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Duplicate an invoice
 */
export async function duplicateInvoice(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid invoice ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get original invoice
    const { data: original, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !original) {
      return actionError('Invoice not found', 'NOT_FOUND')
    }

    // Create duplicate
    const { data: duplicate, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: original.client_id,
        project_id: original.project_id,
        status: 'draft',
        issue_date: new Date().toISOString(),
        due_date: original.due_date,
        items: original.items,
        subtotal: original.subtotal,
        tax_amount: original.tax_amount,
        discount_amount: original.discount_amount,
        total: original.total,
        currency: original.currency,
        notes: original.notes,
        terms: original.terms,
        metadata: original.metadata
      })
      .select('id')
      .single()

    if (insertError) {
      return actionError(insertError.message, 'DATABASE_ERROR')
    }

    logger.info('Invoice duplicated', {
      originalId: id,
      duplicateId: duplicate.id,
      userId: user.id
    })
    revalidatePath('/dashboard/invoices-v2')

    return actionSuccess({ id: duplicate.id }, 'Invoice duplicated successfully')
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
