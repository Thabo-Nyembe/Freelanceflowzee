'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createBudget(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({ ...data, user_id: user.id, owner_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/budgets-v2')
  return budget
}

export async function updateBudget(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: budget, error } = await supabase
    .from('budgets')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/budgets-v2')
  return budget
}

export async function deleteBudget(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('budgets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/budgets-v2')
}

export async function approveBudget(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: budget, error } = await supabase
    .from('budgets')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/budgets-v2')
  return budget
}

export async function updateBudgetUtilization(id: string, spentAmount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch current budget to calculate remaining and utilization
  const { data: currentBudget } = await supabase
    .from('budgets')
    .select('total_amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentBudget) throw new Error('Budget not found')

  const totalAmount = currentBudget.total_amount
  const remainingAmount = totalAmount - spentAmount
  const utilizationPercent = (spentAmount / totalAmount) * 100
  const isExceeded = spentAmount > totalAmount

  const { data: budget, error } = await supabase
    .from('budgets')
    .update({
      spent_amount: spentAmount,
      remaining_amount: remainingAmount,
      available_amount: remainingAmount,
      utilization_percent: utilizationPercent,
      is_exceeded: isExceeded,
      exceeded_at: isExceeded ? new Date().toISOString() : null
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/budgets-v2')
  return budget
}

export async function closeBudget(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: budget, error } = await supabase
    .from('budgets')
    .update({ status: 'closed' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/budgets-v2')
  return budget
}
