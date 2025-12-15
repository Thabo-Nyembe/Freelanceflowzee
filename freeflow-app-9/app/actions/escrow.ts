'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface EscrowInput {
  client_id?: string
  project_id?: string
  project_title: string
  client_name?: string
  client_email?: string
  client_avatar?: string
  amount: number
  currency?: string
  status?: 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
}

export interface MilestoneInput {
  escrow_id: string
  title: string
  description?: string
  amount: number
  due_date?: string
  sort_order?: number
}

export async function createEscrowDeposit(input: EscrowInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .insert([{
      ...input,
      user_id: user.id,
      status: input.status || 'pending'
    }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return data
}

export async function updateEscrowDeposit(id: string, updates: Partial<EscrowInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return data
}

export async function activateEscrow(id: string) {
  return updateEscrowDeposit(id, { status: 'active' })
}

export async function completeEscrow(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_deposits')
    .update({
      status: 'completed',
      progress_percentage: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return data
}

export async function releaseFunds(id: string, amount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current deposit
  const { data: deposit } = await supabase
    .from('escrow_deposits')
    .select('released_amount, amount')
    .eq('id', id)
    .single()

  if (!deposit) throw new Error('Deposit not found')

  const newReleasedAmount = (deposit.released_amount || 0) + amount
  const isComplete = newReleasedAmount >= deposit.amount

  const { data, error } = await supabase
    .from('escrow_deposits')
    .update({
      released_amount: newReleasedAmount,
      status: isComplete ? 'completed' : 'active',
      progress_percentage: Math.round((newReleasedAmount / deposit.amount) * 100),
      completed_at: isComplete ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return data
}

export async function deleteEscrowDeposit(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('escrow_deposits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return { success: true }
}

export async function getEscrowDeposits() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('escrow_deposits')
    .select(`
      *,
      milestones:escrow_milestones(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createMilestone(input: MilestoneInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_milestones')
    .insert([{ ...input, status: 'pending' }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return data
}

export async function completeMilestone(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('escrow_milestones')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/escrow-v2')
  return data
}
