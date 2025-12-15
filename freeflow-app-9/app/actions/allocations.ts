'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateAllocationInput {
  resource_id?: string
  resource_name: string
  resource_role?: string
  project_name: string
  project_id?: string
  allocation_type?: string
  priority?: string
  hours_per_week?: number
  allocated_hours?: number
  start_date?: string
  end_date?: string
  billable_rate?: number
  currency?: string
  manager_name?: string
  manager_email?: string
  skills?: string[]
  notes?: string
}

export interface UpdateAllocationInput {
  resource_name?: string
  resource_role?: string
  project_name?: string
  allocation_type?: string
  status?: string
  priority?: string
  hours_per_week?: number
  allocated_hours?: number
  utilization?: number
  start_date?: string
  end_date?: string
  weeks_remaining?: number
  billable_rate?: number
  project_value?: number
  manager_name?: string
  skills?: string[]
  notes?: string
}

export async function createAllocation(input: CreateAllocationInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const allocationCode = `ALL-${Date.now().toString(36).toUpperCase()}`

  // Calculate utilization
  const hoursPerWeek = input.hours_per_week || 40
  const allocatedHours = input.allocated_hours || 0
  const utilization = hoursPerWeek > 0 ? (allocatedHours / hoursPerWeek) * 100 : 0

  // Calculate weeks remaining
  let weeksRemaining = 0
  if (input.end_date) {
    const end = new Date(input.end_date)
    const now = new Date()
    weeksRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)))
  }

  // Calculate project value
  const billableRate = input.billable_rate || 0
  const projectValue = allocatedHours * billableRate * weeksRemaining

  const { data, error } = await supabase
    .from('allocations')
    .insert({
      user_id: user.id,
      allocation_code: allocationCode,
      resource_id: input.resource_id,
      resource_name: input.resource_name,
      resource_role: input.resource_role,
      project_name: input.project_name,
      project_id: input.project_id,
      allocation_type: input.allocation_type || 'full-time',
      status: 'pending',
      priority: input.priority || 'medium',
      hours_per_week: hoursPerWeek,
      allocated_hours: allocatedHours,
      utilization,
      start_date: input.start_date,
      end_date: input.end_date,
      weeks_remaining: weeksRemaining,
      billable_rate: billableRate,
      project_value: projectValue,
      currency: input.currency || 'USD',
      manager_name: input.manager_name,
      manager_email: input.manager_email,
      skills: input.skills || [],
      notes: input.notes
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/allocation-v2')
  return { data }
}

export async function updateAllocation(id: string, input: UpdateAllocationInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('allocations')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/allocation-v2')
  return { data }
}

export async function activateAllocation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('allocations')
    .update({
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/allocation-v2')
  return { data }
}

export async function completeAllocation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('allocations')
    .update({
      status: 'completed',
      end_date: new Date().toISOString().split('T')[0],
      weeks_remaining: 0
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/allocation-v2')
  return { data }
}

export async function cancelAllocation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('allocations')
    .update({
      status: 'cancelled',
      project_value: 0
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/allocation-v2')
  return { data }
}

export async function deleteAllocation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('allocations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/allocation-v2')
  return { success: true }
}

export async function getAllocations(filters?: {
  status?: string
  allocationType?: string
  priority?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('allocations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.allocationType) {
    query = query.eq('allocation_type', filters.allocationType)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query.limit(200)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
