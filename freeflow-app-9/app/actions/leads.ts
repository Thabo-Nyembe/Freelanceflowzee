'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createLead(input: LeadInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/lead-generation-v2')
  return { data }
}

export async function updateLead(id: string, updates: Partial<LeadInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/lead-generation-v2')
  return { data }
}

export async function deleteLead(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/lead-generation-v2')
  return { success: true }
}

export async function qualifyLead(id: string) {
  return updateLead(id, { status: 'qualified' })
}

export async function contactLead(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/lead-generation-v2')
  return { data }
}

export async function convertLead(id: string) {
  return updateLead(id, { status: 'converted' })
}

export async function updateLeadScore(id: string, score: number) {
  return updateLead(id, { score: Math.max(0, Math.min(100, score)) })
}

export async function getLeads() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}

export async function getLeadsByStatus(status: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('score', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}

export async function addLeadActivity(leadId: string, activityType: string, title: string, description?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/lead-generation-v2')
  return { data }
}
