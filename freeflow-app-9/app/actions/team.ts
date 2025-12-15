'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface TeamMemberInput {
  name: string
  email?: string
  role?: string
  department?: string
  avatar_url?: string
  phone?: string
  status?: 'active' | 'inactive' | 'pending' | 'on_leave'
  is_lead?: boolean
  projects_count?: number
  tasks_completed?: number
  performance_score?: number
  hire_date?: string
  hourly_rate?: number
  skills?: string[]
  metadata?: Record<string, any>
}

export async function getTeamMembers() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getTeamMember(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createTeamMember(input: TeamMemberInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      ...input,
      user_id: user.id,
      skills: input.skills || [],
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/team-hub-v2')
  return { data, error: null }
}

export async function updateTeamMember(id: string, input: Partial<TeamMemberInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('team_members')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/team-hub-v2')
  return { data, error: null }
}

export async function deleteTeamMember(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/team-hub-v2')
  return { success: true, error: null }
}

export async function updateTeamMemberStatus(id: string, status: TeamMemberInput['status']) {
  return updateTeamMember(id, { status })
}

export async function toggleTeamMemberLead(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // First get current state
  const { data: member, error: fetchError } = await supabase
    .from('team_members')
    .select('is_lead')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return { error: fetchError.message, data: null }
  }

  // Toggle lead status
  const { data, error } = await supabase
    .from('team_members')
    .update({
      is_lead: !member.is_lead,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/team-hub-v2')
  return { data, error: null }
}

export async function updateTeamMemberPerformance(id: string, score: number) {
  const validScore = Math.min(100, Math.max(0, score))
  return updateTeamMember(id, { performance_score: validScore })
}

export async function bulkUpdateTeamMembers(ids: string[], updates: Partial<TeamMemberInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('team_members')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/team-hub-v2')
  return { success: true, error: null }
}

export async function getTeamStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: members, error } = await supabase
    .from('team_members')
    .select('status, is_lead, performance_score')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, data: null }
  }

  const active = members?.filter(m => m.status === 'active') || []
  const stats = {
    total: members?.length || 0,
    active: active.length,
    inactive: members?.filter(m => m.status === 'inactive').length || 0,
    pending: members?.filter(m => m.status === 'pending').length || 0,
    onLeave: members?.filter(m => m.status === 'on_leave').length || 0,
    leads: members?.filter(m => m.is_lead).length || 0,
    avgPerformance: active.length > 0
      ? Math.round(active.reduce((sum, m) => sum + (m.performance_score || 0), 0) / active.length)
      : 0
  }

  return { data: stats, error: null }
}
