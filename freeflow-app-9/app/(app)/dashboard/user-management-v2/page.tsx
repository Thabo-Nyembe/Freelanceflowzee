// User Management V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserManagementClient from './user-management-client'

export const metadata = { title: 'User Management | Dashboard', description: 'Manage users and permissions' }

export default async function UserManagementPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: users, error } = await supabase
    .from('user_management')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <UserManagementClient initialUsers={users || []} />
}
