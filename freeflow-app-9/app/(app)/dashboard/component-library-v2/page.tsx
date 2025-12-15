import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ComponentLibraryClient from './component-library-client'

export const dynamic = 'force-dynamic'

async function getComponents() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { components: [], stats: { total: 0, published: 0, beta: 0, draft: 0, totalDownloads: 0, avgRating: 0 } }
  }

  const { data: components, error } = await supabase
    .from('ui_components')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching components:', error)
    return { components: [], stats: { total: 0, published: 0, beta: 0, draft: 0, totalDownloads: 0, avgRating: 0 } }
  }

  const componentList = components || []
  const ratedComponents = componentList.filter(c => c.rating && c.rating > 0)

  const stats = {
    total: componentList.length,
    published: componentList.filter(c => c.status === 'published').length,
    beta: componentList.filter(c => c.status === 'beta').length,
    draft: componentList.filter(c => c.status === 'draft').length,
    totalDownloads: componentList.reduce((sum, c) => sum + (c.downloads_count || 0), 0),
    avgRating: ratedComponents.length > 0
      ? ratedComponents.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedComponents.length
      : 0
  }

  return { components: componentList, stats }
}

export default async function ComponentLibraryPage() {
  const { components, stats } = await getComponents()
  return <ComponentLibraryClient initialComponents={components} initialStats={stats} />
}
