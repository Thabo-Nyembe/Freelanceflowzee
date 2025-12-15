import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SEOClient from './seo-client'

export const dynamic = 'force-dynamic'

export default async function SEOV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let keywords: any[] = []
  let backlinks: any[] = []
  let pages: any[] = []

  if (user) {
    const [keywordsResult, backlinksResult, pagesResult] = await Promise.all([
      supabase
        .from('seo_keywords')
        .select('*')
        .eq('user_id', user.id)
        .order('search_volume', { ascending: false }),
      supabase
        .from('seo_backlinks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('domain_authority', { ascending: false }),
      supabase
        .from('seo_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('organic_traffic', { ascending: false })
    ])

    keywords = keywordsResult.data || []
    backlinks = backlinksResult.data || []
    pages = pagesResult.data || []
  }

  return <SEOClient initialKeywords={keywords} initialBacklinks={backlinks} initialPages={pages} />
}
