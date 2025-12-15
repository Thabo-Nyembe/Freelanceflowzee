'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Capacity } from '@/lib/hooks/use-capacity'

export async function createCapacity(data: Partial<Capacity>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: capacity, error } = await supabase
    .from('capacity')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/capacity-v2')
  return capacity
}

export async function updateCapacity(id: string, data: Partial<Capacity>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: capacity, error } = await supabase
    .from('capacity')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/capacity-v2')
  return capacity
}

export async function deleteCapacity(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('capacity')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/capacity-v2')
}

export async function updateUtilization(id: string, allocated: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: resource } = await supabase
    .from('capacity')
    .select('total_capacity, allocated_capacity')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!resource) throw new Error('Resource not found')

  const newAllocated = (resource.allocated_capacity || 0) + allocated
  const utilization = (newAllocated / resource.total_capacity) * 100
  const isOverallocated = newAllocated > resource.total_capacity
  const overallocationPercentage = isOverallocated ? ((newAllocated - resource.total_capacity) / resource.total_capacity) * 100 : 0

  const { data: capacity, error } = await supabase
    .from('capacity')
    .update({
      allocated_capacity: newAllocated,
      available_capacity: resource.total_capacity - newAllocated,
      utilization_percentage: parseFloat(utilization.toFixed(2)),
      is_overallocated: isOverallocated,
      overallocation_percentage: parseFloat(overallocationPercentage.toFixed(2))
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/capacity-v2')
  return capacity
}

export async function markUnavailable(id: string, from: string, until: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: capacity, error } = await supabase
    .from('capacity')
    .update({
      status: 'unavailable',
      availability_status: 'unavailable',
      available_from: from,
      available_until: until
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/capacity-v2')
  return capacity
}

export async function resetCapacity(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: resource } = await supabase
    .from('capacity')
    .select('total_capacity')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!resource) throw new Error('Resource not found')

  const { data: capacity, error } = await supabase
    .from('capacity')
    .update({
      allocated_capacity: 0,
      available_capacity: resource.total_capacity,
      utilization_percentage: 0,
      is_overallocated: false,
      overallocation_percentage: 0
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/capacity-v2')
  return capacity
}
