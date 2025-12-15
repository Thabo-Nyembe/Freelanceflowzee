import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ThemeStoreClient from './theme-store-client'

export const dynamic = 'force-dynamic'

async function getThemes() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { themes: [], stats: { total: 0, active: 0, installed: 0, available: 0, totalDownloads: 0, avgRating: 0 } }
  }

  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching themes:', error)
    return { themes: [], stats: { total: 0, active: 0, installed: 0, available: 0, totalDownloads: 0, avgRating: 0 } }
  }

  const themeList = themes || []
  const ratedThemes = themeList.filter(t => t.rating && t.rating > 0)

  const stats = {
    total: themeList.length,
    active: themeList.filter(t => t.status === 'active').length,
    installed: themeList.filter(t => t.status === 'installed').length,
    available: themeList.filter(t => t.status === 'available').length,
    totalDownloads: themeList.reduce((sum, t) => sum + (t.downloads_count || 0), 0),
    avgRating: ratedThemes.length > 0
      ? ratedThemes.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedThemes.length
      : 0
  }

  return { themes: themeList, stats }
}

export default async function ThemeStorePage() {
  const { themes, stats } = await getThemes()
  return <ThemeStoreClient initialThemes={themes} initialStats={stats} />
}
