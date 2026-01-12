/**
 * Server Actions for Bookings Management
 *
 * Provides type-safe CRUD operations for bookings with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Comprehensive logging
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  createBookingSchema,
  updateBookingSchema,
  uuidSchema,
  currencySchema,
  CreateBooking,
  UpdateBooking
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('bookings-actions')

// Helper functions
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BK-${timestamp}-${random}`
}

function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

// Cancellation schema
const cancellationSchema = z.object({
  reason: z.string().max(500).optional(),
  refundAmount: currencySchema.optional()
})

type CancellationData = z.infer<typeof cancellationSchema>

// Reschedule schema
const rescheduleSchema = z.object({
  newStartTime: z.string().datetime(),
  newEndTime: z.string().datetime()
})

type RescheduleData = z.infer<typeof rescheduleSchema>

/**
 * Create a new booking
 */
export async function createBooking(
  data: CreateBooking
): Promise<ActionResult<{ id: string; bookingNumber: string; confirmationCode: string }>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createBookingSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const bookingData = validation.data
    const bookingNumber = generateBookingNumber()
    const confirmationCode = generateConfirmationCode()

    // Insert booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        user_id: user.id,
        booking_number: bookingNumber,
        confirmation_code: confirmationCode,
        status: bookingData.status || 'pending'
      }])
      .select('id, booking_number, confirmation_code')
      .single()

    if (error) {
      logger.error('Failed to create booking', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking created', {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      userId: user.id
    })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess(
      {
        id: booking.id,
        bookingNumber: booking.booking_number,
        confirmationCode: booking.confirmation_code
      },
      'Booking created successfully'
    )
  } catch (error) {
    logger.error('Unexpected error creating booking', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing booking
 */
export async function updateBooking(
  id: string,
  data: UpdateBooking
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateBookingSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking updated', { bookingId: id, userId: user.id })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ id: booking.id }, 'Booking updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a booking (soft delete)
 */
export async function deleteBooking(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Soft delete
    const { error } = await supabase
      .from('bookings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking deleted', { bookingId: id, userId: user.id })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ deleted: true }, 'Booking deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Confirm a booking
 */
export async function confirmBooking(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
        confirmation_sent: true,
        confirmation_sent_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to confirm booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking confirmed', { bookingId: id, userId: user.id })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ status: booking.status }, 'Booking confirmed successfully')
  } catch (error) {
    logger.error('Unexpected error confirming booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  id: string,
  cancellationData?: CancellationData
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Validate cancellation data if provided
    if (cancellationData) {
      const validation = cancellationSchema.safeParse(cancellationData)
      if (!validation.success) {
        return actionValidationError(validation.error.errors)
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updateData: Record<string, unknown> = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancellation_reason: cancellationData?.reason
    }

    if (cancellationData?.refundAmount !== undefined) {
      updateData.payment_status = 'refunded'
      updateData.paid_amount = 0
      updateData.balance_due = 0
    }

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to cancel booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking cancelled', {
      bookingId: id,
      userId: user.id,
      reason: cancellationData?.reason
    })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ status: booking.status }, 'Booking cancelled successfully')
  } catch (error) {
    logger.error('Unexpected error cancelling booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Check in a booking
 */
export async function checkIn(
  id: string
): Promise<ActionResult<{ checkedIn: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update booking
    const { error } = await supabase
      .from('bookings')
      .update({
        check_in_time: new Date().toISOString(),
        actual_start_time: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to check in booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking checked in', { bookingId: id, userId: user.id })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ checkedIn: true }, 'Checked in successfully')
  } catch (error) {
    logger.error('Unexpected error checking in booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Check out a booking
 */
export async function checkOut(
  id: string
): Promise<ActionResult<{ checkedOut: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update booking
    const { error } = await supabase
      .from('bookings')
      .update({
        check_out_time: new Date().toISOString(),
        actual_end_time: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to check out booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking checked out', { bookingId: id, userId: user.id })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ checkedOut: true }, 'Checked out successfully')
  } catch (error) {
    logger.error('Unexpected error checking out booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Process payment for a booking
 */
export async function processPayment(
  id: string,
  amount: number
): Promise<ActionResult<{ paymentStatus: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Validate amount
    const amountValidation = currencySchema.safeParse(amount)
    if (!amountValidation.success) {
      return actionError('Invalid payment amount', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current booking
    const { data: currentBooking } = await supabase
      .from('bookings')
      .select('price, paid_amount')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!currentBooking) {
      return actionError('Booking not found', 'NOT_FOUND')
    }

    const newPaidAmount = (currentBooking.paid_amount || 0) + amount
    const balanceDue = currentBooking.price - newPaidAmount

    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'partial'
    if (newPaidAmount >= currentBooking.price) {
      paymentStatus = 'paid'
    } else if (newPaidAmount <= 0) {
      paymentStatus = 'unpaid'
    }

    // Update booking
    const { error } = await supabase
      .from('bookings')
      .update({
        paid_amount: newPaidAmount,
        balance_due: balanceDue,
        payment_status: paymentStatus
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to process payment', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Payment processed', {
      bookingId: id,
      userId: user.id,
      amount,
      paymentStatus
    })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ paymentStatus }, 'Payment processed successfully')
  } catch (error) {
    logger.error('Unexpected error processing payment', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
  id: string,
  rescheduleData: RescheduleData
): Promise<ActionResult<{ rescheduled: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid booking ID', 'VALIDATION_ERROR')
    }

    // Validate reschedule data
    const validation = rescheduleSchema.safeParse(rescheduleData)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update booking
    const { error } = await supabase
      .from('bookings')
      .update({
        start_time: validation.data.newStartTime,
        end_time: validation.data.newEndTime,
        status: 'rescheduled'
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to reschedule booking', { error: error.message, bookingId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Booking rescheduled', { bookingId: id, userId: user.id })
    revalidatePath('/dashboard/bookings-v2')

    return actionSuccess({ rescheduled: true }, 'Booking rescheduled successfully')
  } catch (error) {
    logger.error('Unexpected error rescheduling booking', { error, bookingId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
