import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LogisticsClient from './logistics-client'

export const dynamic = 'force-dynamic'

/**
 * Logistics V2 - Route Management & Fleet Operations
 * Server-side rendered with real-time client updates
 */
export default async function LogisticsV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let routes: any[] = []
  let stats = {
    total: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
    delayed: 0,
    cancelled: 0,
    totalDistance: 0,
    totalPackages: 0,
    avgEfficiency: 0
  }

  if (user) {
    // Fetch logistics routes
    const { data: routesData } = await supabase
      .from('logistics_routes')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    routes = routesData || []

    if (routes.length > 0) {
      const activeRoutes = routes.filter(r =>
        r.status === 'in-progress' || r.status === 'completed'
      )
      const avgEfficiency = activeRoutes.length > 0
        ? activeRoutes.reduce((sum, r) => sum + (r.progress_percent || 0), 0) / activeRoutes.length
        : 0

      stats = {
        total: routes.length,
        planned: routes.filter(r => r.status === 'planned').length,
        inProgress: routes.filter(r => r.status === 'in-progress').length,
        completed: routes.filter(r => r.status === 'completed').length,
        delayed: routes.filter(r => r.status === 'delayed').length,
        cancelled: routes.filter(r => r.status === 'cancelled').length,
        totalDistance: routes.reduce((sum, r) => sum + (r.estimated_distance_km || 0), 0),
        totalPackages: routes.reduce((sum, r) => sum + (r.total_packages || 0), 0),
        avgEfficiency
      }
    }
  }

  return (
    <LogisticsClient
      initialRoutes={routes}
      initialStats={stats}
    />
  )
}
