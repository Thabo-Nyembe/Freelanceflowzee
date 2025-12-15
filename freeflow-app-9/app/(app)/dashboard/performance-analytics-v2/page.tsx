// Performance Analytics V2 - Server Component
// Created: December 14, 2024

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PerformanceAnalyticsClient from './performance-analytics-client'

export const metadata = { title: 'Performance Analytics | Dashboard', description: 'Monitor system performance metrics' }

export default async function PerformanceAnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: performanceAnalytics, error } = await supabase
    .from('performance_analytics')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('measured_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error:', error)
  return <PerformanceAnalyticsClient initialPerformanceAnalytics={performanceAnalytics || []} />
}
