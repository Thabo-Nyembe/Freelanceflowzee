import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ApiClient from './api-client'

export const dynamic = 'force-dynamic'

/**
 * API V2 - Groundbreaking API Management Dashboard
 * Server-side rendered with real-time client updates
 */
export default async function APIV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let endpoints: any[] = []
  let stats = {
    total: 0,
    active: 0,
    totalRequests: 0,
    requestsToday: 0,
    avgLatency: 0,
    avgSuccessRate: 100
  }

  if (user) {
    const { data } = await supabase
      .from('api_endpoints')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('total_requests', { ascending: false })
      .limit(100)

    endpoints = data || []

    if (endpoints.length > 0) {
      stats = {
        total: endpoints.length,
        active: endpoints.filter(e => e.status === 'active').length,
        totalRequests: endpoints.reduce((sum, e) => sum + (e.total_requests || 0), 0),
        requestsToday: endpoints.reduce((sum, e) => sum + (e.requests_today || 0), 0),
        avgLatency: endpoints.reduce((sum, e) => sum + (e.avg_latency_ms || 0), 0) / endpoints.length,
        avgSuccessRate: endpoints.reduce((sum, e) => sum + (e.success_rate || 100), 0) / endpoints.length
      }
    }
  }

  return (
    <ApiClient
      initialEndpoints={endpoints}
      initialStats={stats}
    />
  )
}
