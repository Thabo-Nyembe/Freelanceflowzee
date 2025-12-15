'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createTransaction(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/transactions-v2')
  return transaction
}

export async function updateTransaction(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/transactions-v2')
  return transaction
}

export async function deleteTransaction(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/transactions-v2')
}

export async function refundTransaction(id: string, refundAmount?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/transactions-v2')
  return transaction
}

export async function reconcileTransaction(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update({
      is_reconciled: true,
      reconciled_at: new Date().toISOString(),
      reconciled_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/transactions-v2')
  return transaction
}

export async function flagTransaction(id: string, reason: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update({
      is_flagged: true,
      flagged_reason: reason
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/transactions-v2')
  return transaction
}
