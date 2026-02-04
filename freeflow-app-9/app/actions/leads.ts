'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('leads-actions')

export interface LeadInput {
  name: string
  email?: string
  phone?: string
  company?: string
  title?: string
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'archived'
  score?: number
  source?: string
  notes?: string
  value_estimate?: number
  tags?: string[]
}

export async function createLead(input: LeadInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        company: input.company || null,
        title: input.title || null,
        status: input.status || 'new',
        score: input.score || 50,
        source: input.source || 'website',
        notes: input.notes || null,
        value_estimate: input.value_estimate || 0,
        tags: input.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create lead', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Lead created successfully', { leadId: data.id })
    revalidatePath('/dashboard/lead-generation-v2')
    return actionSuccess(data, 'Lead created successfully')
  } catch (error) {
    logger.error('Unexpected error creating lead', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateLead(id: string, updates: Partial<LeadInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update lead', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Lead updated successfully', { leadId: id })
    revalidatePath('/dashboard/lead-generation-v2')
    return actionSuccess(data, 'Lead updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating lead', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteLead(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete lead', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Lead deleted successfully', { leadId: id })
    revalidatePath('/dashboard/lead-generation-v2')
    return actionSuccess({ success: true }, 'Lead deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting lead', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function qualifyLead(id: string): Promise<ActionResult<any>> {
  return updateLead(id, { status: 'qualified' })
}

export async function contactLead(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('leads')
      .update({
        status: 'contacted',
        last_contact_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to contact lead', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Lead contacted successfully', { leadId: id })
    revalidatePath('/dashboard/lead-generation-v2')
    return actionSuccess(data, 'Lead contacted successfully')
  } catch (error) {
    logger.error('Unexpected error contacting lead', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function convertLead(id: string): Promise<ActionResult<any>> {
  return updateLead(id, { status: 'converted' })
}

export async function updateLeadScore(id: string, score: number): Promise<ActionResult<any>> {
  return updateLead(id, { score: Math.max(0, Math.min(100, score)) })
}

export async function getLeads(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get leads', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Leads retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting leads', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getLeadsByStatus(status: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('score', { ascending: false })

    if (error) {
      logger.error('Failed to get leads by status', { error, status })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Leads retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting leads by status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addLeadActivity(leadId: string, activityType: string, title: string, description?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        user_id: user.id,
        activity_type: activityType,
        title,
        description: description || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add lead activity', { error, leadId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Lead activity added successfully', { leadId, activityId: data.id })
    revalidatePath('/dashboard/lead-generation-v2')
    return actionSuccess(data, 'Lead activity added successfully')
  } catch (error) {
    logger.error('Unexpected error adding lead activity', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
