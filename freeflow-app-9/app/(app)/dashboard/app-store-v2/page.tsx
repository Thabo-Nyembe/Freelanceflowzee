import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AppStoreClient from './app-store-client'

export const dynamic = 'force-dynamic'

/**
 * App Store V2 - Discover and install powerful applications
 * Server-side rendered with real-time client updates
 */
export default async function AppStorePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let apps: any[] = []
  let stats = {
    total: 0,
    installed: 0,
    available: 0,
    trial: 0,
    totalDownloads: 0,
    avgRating: 0
  }

  // Fetch all apps (public) and filter user-specific status
  const { data } = await supabase
    .from('store_apps')
    .select('*')
    .is('deleted_at', null)
    .order('downloads', { ascending: false })
    .limit(100)

  apps = data || []

  if (apps.length > 0) {
    const userApps = user ? apps.filter(a => a.user_id === user.id) : []
    stats = {
      total: apps.length,
      installed: userApps.filter(a => a.status === 'installed').length,
      available: apps.filter(a => a.status === 'available').length,
      trial: userApps.filter(a => a.status === 'trial').length,
      totalDownloads: apps.reduce((sum, a) => sum + (a.downloads || 0), 0),
      avgRating: apps.reduce((sum, a) => sum + (a.rating || 0), 0) / apps.length
    }
  }

  return (
    <AppStoreClient
      initialApps={apps}
      initialStats={stats}
    />
  )
}
