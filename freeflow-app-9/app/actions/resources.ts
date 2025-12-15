'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateResourceInput {
  name: string
  email?: string
  type?: string
  skill_level?: string
  department?: string
  location?: string
  capacity?: number
  skills?: string[]
  hourly_rate?: number
  currency?: string
  availability_date?: string
  hire_date?: string
  phone?: string
}

export interface UpdateResourceInput {
  name?: string
  email?: string
  type?: string
  skill_level?: string
  status?: string
  department?: string
  location?: string
  capacity?: number
  allocated?: number
  utilization?: number
  skills?: string[]
  projects?: string[]
  hourly_rate?: number
  availability_date?: string
  phone?: string
}

export async function createResource(input: CreateResourceInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const resourceCode = `RES-${Date.now().toString(36).toUpperCase()}`

  const { data, error } = await supabase
    .from('resources')
    .insert({
      user_id: user.id,
      resource_code: resourceCode,
      name: input.name,
      email: input.email,
      type: input.type || 'developer',
      skill_level: input.skill_level || 'mid-level',
      status: 'available',
      department: input.department,
      location: input.location,
      capacity: input.capacity || 40,
      skills: input.skills || [],
      hourly_rate: input.hourly_rate || 0,
      currency: input.currency || 'USD',
      availability_date: input.availability_date,
      hire_date: input.hire_date,
      phone: input.phone
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/resources-v2')
  return { data }
}

export async function updateResource(id: string, input: UpdateResourceInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Calculate utilization if allocated/capacity changed
  if (input.allocated !== undefined || input.capacity !== undefined) {
    const { data: current } = await supabase
      .from('resources')
      .select('allocated, capacity')
      .eq('id', id)
      .single()

    if (current) {
      const allocated = input.allocated ?? current.allocated
      const capacity = input.capacity ?? current.capacity
      input.utilization = capacity > 0 ? (allocated / capacity) * 100 : 0

      // Auto-update status based on utilization
      if (input.utilization > 100) input.status = 'overallocated'
      else if (input.utilization > 0) input.status = 'assigned'
      else input.status = 'available'
    }
  }

  const { data, error } = await supabase
    .from('resources')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/resources-v2')
  return { data }
}

export async function assignResourceToProject(id: string, projectName: string, hoursPerWeek: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: resource } = await supabase
    .from('resources')
    .select('projects, allocated, capacity')
    .eq('id', id)
    .single()

  if (!resource) {
    return { error: 'Resource not found' }
  }

  const projects = [...(resource.projects || []), projectName]
  const allocated = resource.allocated + hoursPerWeek
  const utilization = resource.capacity > 0 ? (allocated / resource.capacity) * 100 : 0
  let status = 'assigned'
  if (utilization > 100) status = 'overallocated'

  const { data, error } = await supabase
    .from('resources')
    .update({ projects, allocated, utilization, status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/resources-v2')
  return { data }
}

export async function setResourceUnavailable(id: string, availabilityDate: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('resources')
    .update({
      status: 'unavailable',
      availability_date: availabilityDate
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/resources-v2')
  return { data }
}

export async function deleteResource(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('resources')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/resources-v2')
  return { success: true }
}

export async function getResources(filters?: {
  status?: string
  type?: string
  skillLevel?: string
  department?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('resources')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.skillLevel) {
    query = query.eq('skill_level', filters.skillLevel)
  }
  if (filters?.department) {
    query = query.ilike('department', `%${filters.department}%`)
  }

  const { data, error } = await query.limit(200)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
