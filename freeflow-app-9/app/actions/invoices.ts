// Server Actions for Invoices Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createInvoice(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/invoices-v2')
  return invoice
}

export async function updateInvoice({ id, ...data }: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/invoices-v2')
  return invoice
}

export async function deleteInvoice(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/invoices-v2')
}

export async function markInvoiceAsSent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({ status: 'sent', sent_date: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/invoices-v2')
  return invoice
}

export async function markInvoiceAsPaid(id: string, paymentData: any = {}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString(),
      amount_paid: paymentData.amount || 0,
      ...paymentData
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/invoices-v2')
  return invoice
}
