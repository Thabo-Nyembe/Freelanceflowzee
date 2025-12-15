import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import PluginsClient from './plugins-client'

export const dynamic = 'force-dynamic'

export default async function PluginsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let plugins: any[] = []
  let stats = {
    total: 0,
    active: 0,
    inactive: 0,
    core: 0,
    premium: 0,
    community: 0,
    avgRating: 0,
    totalInstalls: 0,
    avgPerformanceScore: 0
  }

  if (user) {
    const { data: pluginsData } = await supabase
      .from('plugins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (pluginsData) {
      plugins = pluginsData

      const totalRating = pluginsData.reduce((sum, p) => sum + (p.rating || 0), 0)
      const totalInstalls = pluginsData.reduce((sum, p) => sum + (p.installs_count || 0), 0)
      const totalPerformance = pluginsData.reduce((sum, p) => sum + (p.performance_score || 0), 0)

      stats = {
        total: pluginsData.length,
        active: pluginsData.filter(p => p.status === 'active').length,
        inactive: pluginsData.filter(p => p.status === 'inactive').length,
        core: pluginsData.filter(p => p.plugin_type === 'core').length,
        premium: pluginsData.filter(p => p.plugin_type === 'premium').length,
        community: pluginsData.filter(p => p.plugin_type === 'community').length,
        avgRating: pluginsData.length > 0 ? totalRating / pluginsData.length : 0,
        totalInstalls,
        avgPerformanceScore: pluginsData.length > 0 ? totalPerformance / pluginsData.length : 0
      }
    }
  }

  return <PluginsClient initialPlugins={plugins} initialStats={stats} />
}
