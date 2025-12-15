import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import GalleryClient from './gallery-client'

export const dynamic = 'force-dynamic'

export default async function GalleryV2Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let items: any[] = []
  let collections: any[] = []
  let stats = {
    total: 0,
    images: 0,
    videos: 0,
    featured: 0,
    portfolio: 0,
    totalViews: 0
  }

  if (user) {
    // Fetch gallery items
    const { data: itemsData } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    items = itemsData || []

    // Fetch collections
    const { data: collectionsData } = await supabase
      .from('gallery_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    collections = collectionsData || []

    stats = {
      total: items.length,
      images: items.filter(i => i.file_type === 'image').length,
      videos: items.filter(i => i.file_type === 'video').length,
      featured: items.filter(i => i.is_featured).length,
      portfolio: items.filter(i => i.is_portfolio).length,
      totalViews: items.reduce((sum, i) => sum + (i.view_count || 0), 0)
    }
  }

  return <GalleryClient initialItems={items} initialCollections={collections} initialStats={stats} />
}
