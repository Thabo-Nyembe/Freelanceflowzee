// Admin V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClient from './admin-client'

export const metadata = { title: 'Admin | Dashboard', description: 'System administration and settings' }

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: settings, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('setting_category', { ascending: true })
    .limit(50)

  if (error) console.error('Error:', error)
  return <AdminClient initialSettings={settings || []} />
}
