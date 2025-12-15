// Server Actions for Billing Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createBillingTransaction(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('billing')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/billing-v2')
  return transaction
}

export async function updateBillingTransaction({ id, ...data }: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('billing')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/billing-v2')
  return transaction
}

export async function deleteBillingTransaction(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('billing')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/billing-v2')
}

export async function refundTransaction(id: string, refundData: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('billing')
    .update({
      status: 'refunded',
      refunded_date: new Date().toISOString(),
      ...refundData
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/billing-v2')
  return transaction
}
