import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import KnowledgeArticlesClient from './knowledge-articles-client'

export const dynamic = 'force-dynamic'

export default async function KnowledgeArticlesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  let articles: any[] = []
  let stats = {
    total: 0,
    published: 0,
    draft: 0,
    review: 0,
    archived: 0,
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0,
    avgReadTime: 0
  }

  if (user) {
    const { data: articlesData } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (articlesData) {
      articles = articlesData

      const totalViews = articlesData.reduce((sum, a) => sum + (a.views_count || 0), 0)
      const totalLikes = articlesData.reduce((sum, a) => sum + (a.likes_count || 0), 0)
      const totalRating = articlesData.reduce((sum, a) => sum + (a.rating || 0), 0)
      const totalReadTime = articlesData.reduce((sum, a) => sum + (a.read_time_minutes || 0), 0)

      stats = {
        total: articlesData.length,
        published: articlesData.filter(a => a.status === 'published').length,
        draft: articlesData.filter(a => a.status === 'draft').length,
        review: articlesData.filter(a => a.status === 'review').length,
        archived: articlesData.filter(a => a.status === 'archived').length,
        totalViews,
        totalLikes,
        avgRating: articlesData.length > 0 ? totalRating / articlesData.length : 0,
        avgReadTime: articlesData.length > 0 ? totalReadTime / articlesData.length : 0
      }
    }
  }

  return <KnowledgeArticlesClient initialArticles={articles} initialStats={stats} />
}
