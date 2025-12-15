'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createManagedUser(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: managedUser, error } = await supabase
    .from('user_management')
    .insert({ ...data, user_id: user.id, created_by: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/user-management-v2')
  return managedUser
}

export async function updateManagedUser(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: managedUser, error } = await supabase
    .from('user_management')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/user-management-v2')
  return managedUser
}

export async function deleteManagedUser(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_management')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/user-management-v2')
}

export async function suspendUser(id: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: managedUser, error } = await supabase
    .from('user_management')
    .update({ status: 'suspended', notes: reason })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/user-management-v2')
  return managedUser
}

export async function activateUser(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: managedUser, error } = await supabase
    .from('user_management')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/user-management-v2')
  return managedUser
}
