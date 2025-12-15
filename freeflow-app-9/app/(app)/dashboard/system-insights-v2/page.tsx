// System Insights V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SystemInsightsClient from './system-insights-client'

export const metadata = { title: 'System Insights | Dashboard', description: 'System health and performance monitoring' }

export default async function SystemInsightsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: insights, error } = await supabase
    .from('system_insights')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('detected_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <SystemInsightsClient initialInsights={insights || []} />
}
