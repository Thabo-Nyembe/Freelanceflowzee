import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import HelpCenterClient from './help-center-client'

export const dynamic = 'force-dynamic'

/**
 * Help Center V2 - Knowledge Base & Documentation
 * Server-side rendered with real-time client updates
 */
export default async function HelpCenterV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let articles: any[] = []
  let stats = {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalCategories: 0,
    totalViews: 0,
    helpfulPercentage: 0,
    avgRating: 4.5,
    recentArticles: 0
  }

  if (user) {
    // Fetch help articles
    const { data: articlesData } = await supabase
      .from('help_articles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    articles = articlesData || []

    if (articles.length > 0) {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const totalHelpful = articles.reduce((sum, a) => sum + (a.helpful_count || 0), 0)
      const totalNotHelpful = articles.reduce((sum, a) => sum + (a.not_helpful_count || 0), 0)
      const totalFeedback = totalHelpful + totalNotHelpful

      stats = {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        draftArticles: articles.filter(a => a.status === 'draft').length,
        totalCategories: new Set(articles.map(a => a.category_id).filter(Boolean)).size,
        totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
        helpfulPercentage: totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : 0,
        avgRating: 4.5,
        recentArticles: articles.filter(a => new Date(a.created_at) > oneWeekAgo).length
      }
    }
  }

  return (
    <HelpCenterClient
      initialArticles={articles}
      initialStats={stats}
    />
  )
}
