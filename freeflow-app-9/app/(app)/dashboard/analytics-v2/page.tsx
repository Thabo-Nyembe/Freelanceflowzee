// Analytics V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AnalyticsClient from './analytics-client'

export const metadata = { title: 'Analytics | Dashboard', description: 'Data visualization and analytics insights' }

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analytics, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('recorded_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <AnalyticsClient initialAnalytics={analytics || []} />
}
