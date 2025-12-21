'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('resources-actions')

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

export async function createResource(input: CreateResourceInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized resource creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to create resource', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Resource created successfully', { resourceCode })
    revalidatePath('/dashboard/resources-v2')
    return actionSuccess(data, 'Resource created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating resource', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateResource(id: string, input: UpdateResourceInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized resource update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to update resource', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Resource updated successfully', { id })
    revalidatePath('/dashboard/resources-v2')
    return actionSuccess(data, 'Resource updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating resource', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function assignResourceToProject(id: string, projectName: string, hoursPerWeek: number): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized resource assignment attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: resource } = await supabase
      .from('resources')
      .select('projects, allocated, capacity')
      .eq('id', id)
      .single()

    if (!resource) {
      logger.warn('Resource not found for assignment', { id })
      return actionError('Resource not found', 'NOT_FOUND')
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
      logger.error('Failed to assign resource to project', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Resource assigned to project', { id, projectName })
    revalidatePath('/dashboard/resources-v2')
    return actionSuccess(data, 'Resource assigned to project successfully')
  } catch (error: any) {
    logger.error('Unexpected error assigning resource', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function setResourceUnavailable(id: string, availabilityDate: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized resource unavailability attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to set resource unavailable', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Resource set to unavailable', { id, availabilityDate })
    revalidatePath('/dashboard/resources-v2')
    return actionSuccess(data, 'Resource set to unavailable')
  } catch (error: any) {
    logger.error('Unexpected error setting resource unavailable', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteResource(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized resource deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('resources')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete resource', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Resource deleted successfully', { id })
    revalidatePath('/dashboard/resources-v2')
    return actionSuccess({ success: true }, 'Resource deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting resource', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getResources(filters?: {
  status?: string
  type?: string
  skillLevel?: string
  department?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      logger.warn('Unauthorized resources fetch attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to fetch resources', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Resources fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Resources fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching resources', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
