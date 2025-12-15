'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Booking } from '@/lib/hooks/use-bookings'

function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BK-${timestamp}-${random}`
}

function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function createBooking(data: Partial<Booking>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const bookingNumber = generateBookingNumber()
  const confirmationCode = generateConfirmationCode()

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([{
      ...data,
      user_id: user.id,
      booking_number: bookingNumber,
      confirmation_code: confirmationCode
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function updateBooking(id: string, data: Partial<Booking>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: booking, error } = await supabase
    .from('bookings')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function deleteBooking(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('bookings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return { success: true }
}

export async function confirmBooking(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function cancelBooking(id: string, reason?: string, refundAmount?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    cancelled_by: user.id,
    cancellation_reason: reason
  }

  if (refundAmount !== undefined) {
    updateData.payment_status = 'refunded'
    updateData.paid_amount = 0
    updateData.balance_due = 0
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function checkIn(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      check_in_time: new Date().toISOString(),
      actual_start_time: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function checkOut(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      check_out_time: new Date().toISOString(),
      actual_end_time: new Date().toISOString(),
      status: 'completed'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function processPayment(id: string, amount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get current booking
  const { data: currentBooking } = await supabase
    .from('bookings')
    .select('price, paid_amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentBooking) throw new Error('Booking not found')

  const newPaidAmount = (currentBooking.paid_amount || 0) + amount
  const balanceDue = currentBooking.price - newPaidAmount

  let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'partial'
  if (newPaidAmount >= currentBooking.price) {
    paymentStatus = 'paid'
  } else if (newPaidAmount <= 0) {
    paymentStatus = 'unpaid'
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      paid_amount: newPaidAmount,
      balance_due: balanceDue,
      payment_status: paymentStatus
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}

export async function rescheduleBooking(id: string, newStartTime: string, newEndTime: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'rescheduled'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/bookings-v2')
  return booking
}
