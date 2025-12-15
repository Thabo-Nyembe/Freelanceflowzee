// Forms V2 - Server Component with Real Data
// Created: December 14, 2024
// Integrated with Supabase backend

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FormsClient from './forms-client'

export const metadata = {
  title: 'Forms | Dashboard',
  description: 'Create and manage dynamic forms'
}

export default async function FormsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch initial forms data from database
  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching forms:', error)
  }

  // Pass initial data to client component
  return <FormsClient initialForms={forms || []} />
}
