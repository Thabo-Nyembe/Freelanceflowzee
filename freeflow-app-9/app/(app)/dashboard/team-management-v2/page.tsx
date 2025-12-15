// Team Management V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TeamManagementClient from './team-management-client'

export const metadata = { title: 'Team Management | Dashboard', description: 'Manage teams and collaboration' }

export default async function TeamManagementPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: teams, error } = await supabase
    .from('team_management')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <TeamManagementClient initialTeams={teams || []} />
}
