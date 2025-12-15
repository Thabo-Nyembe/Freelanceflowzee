'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createTeam(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: team, error } = await supabase
    .from('team_management')
    .insert({ ...data, user_id: user.id, created_by: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/team-management-v2')
  return team
}

export async function updateTeam(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: team, error } = await supabase
    .from('team_management')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/team-management-v2')
  return team
}

export async function deleteTeam(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('team_management')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/team-management-v2')
}

export async function addTeamMember(teamId: string, memberId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: team } = await supabase
    .from('team_management')
    .select('member_ids, member_count')
    .eq('id', teamId)
    .eq('user_id', user.id)
    .single()

  if (!team) throw new Error('Team not found')

  const memberIds = team.member_ids || []
  if (!memberIds.includes(memberId)) {
    memberIds.push(memberId)
  }

  const { data: updatedTeam, error } = await supabase
    .from('team_management')
    .update({
      member_ids: memberIds,
      member_count: memberIds.length
    })
    .eq('id', teamId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/team-management-v2')
  return updatedTeam
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: team } = await supabase
    .from('team_management')
    .select('member_ids')
    .eq('id', teamId)
    .eq('user_id', user.id)
    .single()

  if (!team) throw new Error('Team not found')

  const memberIds = (team.member_ids || []).filter((id: string) => id !== memberId)

  const { data: updatedTeam, error } = await supabase
    .from('team_management')
    .update({
      member_ids: memberIds,
      member_count: memberIds.length
    })
    .eq('id', teamId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/team-management-v2')
  return updatedTeam
}
